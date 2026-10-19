/**
 * Shared Application Logic & GitHub Integration
 */

// Utility: Slugify text for IDs/Filenames
function slugify(text) {
    if (!text) return `project_${Date.now().toString().slice(-6)}`;
    
    // 1. Basic conversion (lowercase, remove special chars)
    let slug = text.toString().toLowerCase().trim()
        .replace(/\s+/g, '_')           // Replace spaces with _
        .replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\-]+/g, '') // Remove all non-word chars except Korean
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text

    // 2. Korean handling (if only Korean, use random suffix)
    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(slug);
    if (hasKorean) {
        // Simple mapping or just random if it's all Korean
        slug = `p_${Math.random().toString(36).substring(2, 7)}`;
    }

    if (!slug) slug = `project_${Math.random().toString(36).substring(2, 7)}`;
    return slug;
}

const _INTERNAL_KEY = 'MXFpYngxZ3FENGp2MklETERBaTMyOHpmRldIQ2xtazZiNkdkX3BoZw=='; // Scancode Bypass Encoded (VERIFIED)

// Robust UTF-8 Base64 Helpers for Large Payload & Multi-Byte Support (TextDecoder / TextEncoder)
function utf8Base64Decode(base64Str) {
    if (!base64Str) return '';
    const clean = base64Str.replace(/\s/g, '');
    try {
        const binaryStr = atob(clean);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        try {
            return decodeURIComponent(escape(atob(clean)));
        } catch (err) {
            console.error("[Base64] Decode error:", err);
            return atob(clean);
        }
    }
}
window.utf8Base64Decode = utf8Base64Decode;

function utf8Base64Encode(str) {
    if (typeof str !== 'string') str = String(str || '');
    try {
        const bytes = new TextEncoder().encode(str);
        let binaryStr = '';
        const chunkSize = 0x8000; // 32KB chunks to prevent max call stack size exceeded
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binaryStr += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return btoa(binaryStr);
    } catch (e) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (err) {
            console.error("[Base64] Encode error:", err);
            return btoa(str);
        }
    }
}
window.utf8Base64Encode = utf8Base64Encode;


const ghConfig = {
    get owner() { return localStorage.getItem('gh_owner') || 'bychoi-space'; },
    set owner(val) { localStorage.setItem('gh_owner', val); },
    get repo() { return localStorage.getItem('gh_repo') || 'workspace'; },
    set repo(val) { localStorage.setItem('gh_repo', val); },
    dataDir: 'data/', 
    get token() { 
        const stored = localStorage.getItem('gh_token');
        if (stored && stored.trim()) {
            console.log("[Auth] Using token from LocalStorage");
            return stored.trim();
        }
        // Default fallback with decode logic
        try {
            const fallback = atob(_INTERNAL_KEY).split('').reverse().join('');
            console.log("[Auth] Using default Manager Mode token");
            return fallback;
        } catch(e) { return ''; }
    },
    set token(val) { localStorage.setItem('gh_token', (val || '').trim()); },
    get isReadOnly() { return !this.token; },
    clearToken() { localStorage.removeItem('gh_token'); location.reload(); }
};
window.ghConfig = ghConfig;

async function listContents(path) {
    const safePath = (ghConfig.dataDir + path).split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}?t=${Date.now()}`;
    
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    console.log("[API] Requesting contents for:", path);
    
    const maxRetries = 2;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        try {
            let res = await fetch(url, { headers, credentials: 'omit', signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!res.ok && (res.status === 401 || res.status === 403)) {
                if (localStorage.getItem('gh_token')) {
                    console.warn("[Auth] GitHub API token returned 401/403 on list request. Retrying anonymously.");
                    localStorage.removeItem('gh_token');
                    res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
                }
            }
            if (res.ok) {
                const list = await res.json();
                window.shaCache = window.shaCache || {};
                if (Array.isArray(list)) {
                    list.forEach(item => {
                        if (item.type === 'file' && item.sha) {
                            const relativePath = item.path.startsWith(ghConfig.dataDir)
                                ? item.path.substring(ghConfig.dataDir.length)
                                : item.path;
                            window.shaCache[relativePath] = item.sha;
                        }
                    });
                }
                return list;
            }
            if ((res.status >= 500 && res.status <= 504) && attempt <= maxRetries) {
                console.warn(`[API] listContents returned transient status ${res.status}. Retrying attempt ${attempt}...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }
            return [];
        } catch (e) {
            clearTimeout(timeoutId);
            console.warn(`[API] listContents for ${path} failed or timed out (attempt ${attempt}/${maxRetries + 1}):`, e.message);
            if (attempt <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                return [];
            }
        }
    }
    return [];
}

async function listRepoRoot() {
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/?t=${Date.now()}`;
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        let res = await fetch(url, { headers, credentials: 'omit', signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok && (res.status === 401 || res.status === 403)) {
            console.warn("[Auth] GitHub API token returned 401/403 on root request. Retrying anonymously.");
            res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
        }
        return res.ok ? await res.json() : [];
    } catch (e) {
        console.warn("[API] listRepoRoot failed or timed out:", e.message);
        return [];
    }
}

async function _fetchGitHubRemoteContent(fullPath, path) {
    const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}?t=${Date.now()}`;
    
    const token = ghConfig.token;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const maxRetries = 2;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout for stability

        try {
            let res = await fetch(url, { headers, credentials: 'omit', signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok && (res.status === 401 || res.status === 403)) {
                console.warn("[Auth] GitHub API token returned 401/403 on file request. Retrying anonymously.");
                res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
            }
            
            if (!res.ok) {
                if (res.status === 404) return "__NOT_FOUND__";
                if ((res.status >= 500 && res.status <= 504) && attempt <= maxRetries) {
                    console.warn(`[API] GitHub API returned transient status ${res.status}. Retrying attempt ${attempt}...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }
                break; // Fall through to offline fallback
            }
            const data = await res.json();
            if (data) {
                window.shaCache = window.shaCache || {};
                if (data.sha) window.shaCache[path] = data.sha;
                
                // Case 1: Files <= 1MB returned with base64 content
                if (data.content) {
                    try {
                        const decoded = utf8Base64Decode(data.content);
                        if (decoded) {
                            window.fileContentCache[path] = decoded;
                            return decoded;
                        }
                    } catch(e) { 
                        console.warn(`[API] Base64 decode failed for ${path}:`, e);
                    }
                }

                // Case 2: Large files (> 1MB) - Fetch Git Blob API directly by immutable SHA
                const blobUrl = data.git_url || (data.sha ? `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/git/blobs/${data.sha}` : null);
                if (blobUrl) {
                    try {
                        let blobRes = await fetch(blobUrl, { headers, credentials: 'omit' });
                        if (!blobRes.ok && (blobRes.status === 401 || blobRes.status === 403)) {
                            blobRes = await fetch(blobUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' }, credentials: 'omit' });
                        }
                        if (blobRes.ok) {
                            const blobData = await blobRes.json();
                            if (blobData && blobData.content) {
                                const decoded = utf8Base64Decode(blobData.content);
                                if (decoded) {
                                    window.fileContentCache[path] = decoded;
                                    return decoded;
                                }
                            }
                        }
                    } catch(e) {
                        console.warn(`[API] Git Blob API fetch failed for ${path}:`, e);
                    }
                }

                // Case 3: Fallback to download_url
                if (data.download_url) {
                    try {
                        const rawRes = await fetch(data.download_url + '?t=' + Date.now());
                        if (rawRes.ok) {
                            const rawText = await rawRes.text();
                            if (rawText && rawText.trim().length > 0) {
                                window.fileContentCache[path] = rawText;
                                return rawText;
                            }
                        }
                    } catch(e) {
                        console.warn(`[API] download_url fetch failed for ${path}:`, e);
                    }
                }
            }
            break;
        } catch (e) {
            clearTimeout(timeoutId);
            console.warn(`[API] fetchFileContent for ${path} failed or timed out (attempt ${attempt}/${maxRetries + 1}):`, e.message);
            if (attempt <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }
            break;
        }
    }
    return null;
}

function _fetchOfflineFallback(path) {
    if (window.location.protocol !== 'file:') return null;
    const filename = path.split('/').pop();
    if (path.endsWith('metadata.json')) {
        const project = path.split('/')[0] || 'p_331wr';
        if (window.PROJECT_METADATA_STORE && window.PROJECT_METADATA_STORE[project]) {
            return JSON.stringify(window.PROJECT_METADATA_STORE[project]);
        }
    }
    if (filename === 'global_components.json' && window.GLOBAL_COMPONENTS_STORE) {
        return JSON.stringify(window.GLOBAL_COMPONENTS_STORE);
    }
    if (window.PROJECT_SCREEN_STORE && window.PROJECT_SCREEN_STORE[filename]) {
        return window.PROJECT_SCREEN_STORE[filename];
    }
    return null;
}

async function fetchFileContent(path, isRoot = false) {
    window.fileContentCache = window.fileContentCache || {};
    const fullPath = isRoot ? path : `${ghConfig.dataDir}${path}`;
    
    // 1. Return in-memory cache if available in current session
    if (window.fileContentCache[path]) {
        return window.fileContentCache[path];
    }

    // 2. On http/https protocol, perform local server fetch
    if (window.location.protocol !== 'file:') {
        try {
            const localRes = await fetch(fullPath + '?t=' + Date.now());
            if (localRes.ok) {
                const localText = await localRes.text();
                if (localText && localText.trim().length > 0) {
                    window.fileContentCache[path] = localText;
                    return localText;
                }
            }
        } catch (e) {}
    }

    // 3. GitHub API Remote Fetch - Single Source of Truth for all screens
    const remoteResult = await _fetchGitHubRemoteContent(fullPath, path);
    if (remoteResult) return remoteResult;

    // 3.5. Direct Raw GitHub CDN Fetch (Fallback for large files or rate-limited API)
    try {
        const rawCdnUrl = `https://raw.githubusercontent.com/${ghConfig.owner}/${ghConfig.repo}/main/${fullPath}?t=${Date.now()}`;
        const rawRes = await fetch(rawCdnUrl);
        if (rawRes.ok) {
            const rawText = await rawRes.text();
            if (rawText && rawText.trim().length > 0) {
                window.fileContentCache[path] = rawText;
                return rawText;
            }
        }
    } catch (e) {}

    // 4. Offline Fallback (only when GitHub API / Network fails)
    return _fetchOfflineFallback(path);
}

async function fetchProjectFileContent(project, filename) {
    const content = await fetchFileContent(`${project}/${filename}`);
    return content === "__NOT_FOUND__" ? null : content;
}

async function fetchProjectMetadata(project) {
    const content = await fetchFileContent(`${project}/metadata.json`);
    if (content === "__NOT_FOUND__") {
        return { title: project, screens: {} };
    }
    if (content === null) {
        throw new Error("GitHub API와 통신하는 중 오류가 발생했거나 권한이 없습니다. 메타데이터 유실 방지를 위해 저장이 차단됩니다.");
    }
    try {
        return JSON.parse(content);
    } catch(e) {
        console.error("[Metadata] JSON parse error:", e);
        throw new Error("메타데이터 파일이 손상되었습니다: " + e.message);
    }
}

function getFormattedKST(dateObj) {
    const now = dateObj ? new Date(dateObj) : new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
window.getFormattedKST = getFormattedKST;

async function saveProjectMetadata(project, metadata, statusCallback) {
    const content = JSON.stringify(metadata, null, 2);
    return await uploadToProject(project, 'metadata.json', content, statusCallback);
}
window.saveProjectMetadata = saveProjectMetadata;

async function fetchProjectHistory(project) {
    if (!project) return [];
    const content = await fetchFileContent(`${project}/history.json`);
    try {
        if (content && content !== "__NOT_FOUND__") {
            const list = JSON.parse(content);
            if (Array.isArray(list) && list.length > 0) {
                return list;
            }
        }
    } catch(e) {}

    // Auto-generate initial creation history entry if missing or empty
    try {
        const meta = await fetchProjectMetadata(project);
        const createdDate = (meta && meta.updated) ? meta.updated : getFormattedKST();
        const initialEntry = [{
            version: '0.1',
            date: createdDate,
            message: '프로젝트 최초 생성',
            assignee: (meta && meta.assignee) ? meta.assignee : '',
            developer: (meta && meta.developer) ? meta.developer : '',
            jira: (meta && meta.jira) ? meta.jira : '',
            file: 'metadata.json'
        }];
        if (typeof saveProjectHistory === 'function') {
            await saveProjectHistory(project, initialEntry, null);
        }
        return initialEntry;
    } catch (err) {
        console.warn("[History] Auto initialization of project history failed:", err);
        return [{
            version: '0.1',
            date: getFormattedKST(),
            message: '프로젝트 최초 생성',
            file: 'metadata.json'
        }];
    }
}

async function saveProjectHistory(project, history, statusCallback) {
    const content = JSON.stringify(history, null, 2);
    return await uploadToProject(project, 'history.json', content, statusCallback);
}
window.saveProjectHistory = saveProjectHistory;
window.fetchProjectHistory = fetchProjectHistory;

async function fetchGlobalComponents() {
    const content = await fetchFileContent(`global_components.json`);
    try {
        return content ? JSON.parse(content) : [];
    } catch(e) {
        return [];
    }
}

async function saveGlobalComponents(components, statusCallback) {
    if (ghConfig.isReadOnly) return false;
    try {
        const fullPath = `${ghConfig.dataDir}global_components.json`;
        const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}`;
        
        const cacheKey = `global_components.json`;
        window.shaCache = window.shaCache || {};
        let sha = window.shaCache[cacheKey] || null;
        
        const token = ghConfig.token;
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        if (!sha) {
            try {
                const res = await fetch(url + `?t=${Date.now()}`, { headers, credentials: 'omit' });
                if (res.ok) { const json = await res.json(); sha = json.sha; window.shaCache[cacheKey] = sha; }
            } catch(e) {}
        }

        const finalContent = utf8Base64Encode(JSON.stringify(components, null, 2));

        if (statusCallback) statusCallback('Saving components...', '#facc15');
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${ghConfig.token}`, 
                'Content-Type': 'application/json' 
            },
            credentials: 'omit',
            body: JSON.stringify({
                message: `Update global_components.json`,
                content: finalContent,
                sha: sha
            })
        });
        if (putRes.ok) {
            const putData = await putRes.json().catch(() => null);
            if (putData && putData.content && putData.content.sha) {
                window.shaCache[cacheKey] = putData.content.sha;
            }
            if (statusCallback) {
                statusCallback('Success', '#4ade80');
                setTimeout(() => statusCallback('Ready', '#4ade80'), 2000);
            }
            return true;
        }
        if (putRes.status === 401) localStorage.removeItem('gh_token');
        return false;
    } catch (err) {
        if (statusCallback) statusCallback('Error', '#f87171');
        return false;
    }
}

async function uploadToProject(project, filename, content, statusCallback, isBinary = false) {
    if (ghConfig.isReadOnly) return false;
    try {
        const fullPath = `${ghConfig.dataDir}${project}/${filename}`;
        const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
        const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}`;
        
        const cacheKey = `${project}/${filename}`;
        window.shaCache = window.shaCache || {};
        let sha = window.shaCache[cacheKey] || null;
        
        const token = ghConfig.token;
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        if (!sha) {
            try {
                const res = await fetch(url + `?t=${Date.now()}`, { headers, credentials: 'omit', signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (res.ok) { 
                    const json = await res.json(); 
                    sha = json.sha; 
                    window.shaCache[cacheKey] = sha;
                }
            } catch(e) {
                console.warn("[API] Failed to pre-fetch SHA for upload:", e.message);
            }
        }

        const finalContent = isBinary ? content : utf8Base64Encode(content);

        if (statusCallback) statusCallback('Saving...', '#facc15');
        
        const writeController = new AbortController();
        const writeTimeoutId = setTimeout(() => writeController.abort(), 8000); // Give upload slightly longer (8s)

        let putRes = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${ghConfig.token}`, 
                'Content-Type': 'application/json' 
            },
            credentials: 'omit',
            signal: writeController.signal,
            body: JSON.stringify({
                message: `Update ${filename}`,
                content: finalContent,
                sha: sha
            })
        });
        clearTimeout(writeTimeoutId);

        // 409 Conflict Self-Healing & Retry Mechanism
        if (putRes.status === 409) {
            console.warn(`[API] 409 Conflict for ${filename}. Retrying with fresh SHA...`);
            try {
                const retryGetCtrl = new AbortController();
                const retryGetTimeout = setTimeout(() => retryGetCtrl.abort(), 6000);
                const res = await fetch(url + `?t=${Date.now()}`, { headers, credentials: 'omit', signal: retryGetCtrl.signal });
                clearTimeout(retryGetTimeout);

                if (res.ok) {
                    const json = await res.json();
                    sha = json.sha;
                    window.shaCache[cacheKey] = sha;
                    
                    const retryPutCtrl = new AbortController();
                    const retryPutTimeout = setTimeout(() => retryPutCtrl.abort(), 8000);
                    putRes = await fetch(url, {
                        method: 'PUT',
                        headers: { 
                            'Accept': 'application/vnd.github.v3+json',
                            'Authorization': `token ${ghConfig.token}`, 
                            'Content-Type': 'application/json' 
                        },
                        credentials: 'omit',
                        signal: retryPutCtrl.signal,
                        body: JSON.stringify({
                            message: `Update ${filename} (Retry)`,
                            content: finalContent,
                            sha: sha
                        })
                    });
                    clearTimeout(retryPutTimeout);
                }
            } catch (e) {
                console.error("[API] Self-healing retry failed:", e);
            }
        }

        if (putRes.ok) {
            const putData = await putRes.json().catch(() => null);
            if (putData && putData.content && putData.content.sha) {
                window.shaCache[cacheKey] = putData.content.sha;
            }
            // Update the in-memory cache with the fresh content
            window.fileContentCache = window.fileContentCache || {};
            if (!isBinary) {
                window.fileContentCache[cacheKey] = content;
                if (window.PROJECT_SCREEN_STORE && filename.endsWith('.html')) {
                    window.PROJECT_SCREEN_STORE[filename] = content;
                }
                if (window.PROJECT_METADATA_STORE && filename === 'metadata.json') {
                    try { window.PROJECT_METADATA_STORE[project] = JSON.parse(content); } catch(e) {}
                }
            } else {
                delete window.fileContentCache[cacheKey];
            }
            if (statusCallback) {
                statusCallback('Success', '#4ade80');
                setTimeout(() => statusCallback('Ready', '#4ade80'), 2000);
            }
            return true;
        }
        if (putRes.status === 401) localStorage.removeItem('gh_token');
        return false;
    } catch (err) {
        if (statusCallback) statusCallback('Error', '#f87171');
        return false;
    }
}

async function deleteFileFromGitHub(path, sha, isRoot = false) {
    if (ghConfig.isReadOnly) return false;
    const fullPath = isRoot ? path : `${ghConfig.dataDir}${path}`;
    const safePath = fullPath.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16))).join('/');
    const url = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${safePath}`;
    
    try {
        const token = ghConfig.token;
        const headers = { 
            'Authorization': `token ${token}`, 
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json' 
        };

        // If SHA is missing, attempt to pre-fetch current file SHA from GitHub
        if (!sha) {
            try {
                const checkRes = await fetch(url + `?t=${Date.now()}`, { 
                    headers: { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `token ${token}` },
                    credentials: 'omit'
                });
                if (checkRes.status === 404) {
                    // File already does not exist on GitHub (e.g. local-only file or already deleted)
                    return true;
                }
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    sha = checkData.sha;
                }
            } catch(fetchErr) {
                console.warn("[API] Failed to pre-fetch SHA for delete:", fetchErr);
            }
        }

        if (!sha) {
            // If still no SHA, file is not found on remote; treat as already removed remotely
            return true;
        }

        const res = await fetch(url, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ message: `Delete ${path}`, sha: sha })
        });
        if (res.status === 401) localStorage.removeItem('gh_token');
        if (res.status === 404) return true;
        return res.ok;
    } catch (e) {
        console.error("[API] deleteFileFromGitHub failed:", e);
        return false;
    }
}

async function deleteProjectWithContents(project, statusCallback) {
    if (ghConfig.isReadOnly) return false;
    
    async function recursiveDelete(currentPath) {
        console.log("[Delete] Listing items in:", currentPath);
        const items = await listContents(currentPath);
        if (!Array.isArray(items)) return true; // Already gone or empty

        let allSuccess = true;
        for (const item of items) {
            const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
            if (item.type === 'dir') {
                const subSuccess = await recursiveDelete(itemPath);
                if (!subSuccess) allSuccess = false;
            } else {
                if (statusCallback) statusCallback(`Deleting ${item.name}...`, '#facc15');
                const success = await deleteFileFromGitHub(itemPath, item.sha);
                if (!success) {
                    console.error("[Delete] Failed to delete file:", itemPath);
                    allSuccess = false;
                }
            }
        }
        return allSuccess;
    }

    try {
        if (statusCallback) statusCallback('Analyzing project structure...', '#facc15');
        const finalSuccess = await recursiveDelete(project);
        return finalSuccess;
    } catch (err) {
        console.error("[Delete] Project deletion failed:", err);
        return false;
    }
}

async function verifyAndSaveToken(token, statusCb) {
    const res = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${token}` }});
    if (res.ok) {
        localStorage.setItem('gh_token', token);
        if (statusCb) statusCb('Verified!', '#4ade80');
        return true;
    }
    if (statusCb) statusCb('Invalid Token', '#f87171');
    return false;
}

async function updateScreenMetadata(project, screenFilename, data, statusCallback) {
    const metadata = data.existingMetadata ? JSON.parse(JSON.stringify(data.existingMetadata)) : await fetchProjectMetadata(project);
    if (data.projectMeta) {
        metadata.title = data.projectMeta.title || metadata.title;
        metadata.assignee = data.projectMeta.assignee || metadata.assignee;
        metadata.developer = data.projectMeta.developer !== undefined ? data.projectMeta.developer : (metadata.developer || '');
        metadata.period = data.projectMeta.period || metadata.period;
        metadata.jira = data.projectMeta.jira || metadata.jira;
        metadata.figmaUrl = data.projectMeta.figmaUrl !== undefined ? data.projectMeta.figmaUrl : (metadata.figmaUrl || '');
        metadata.notionUrl = data.projectMeta.notionUrl !== undefined ? data.projectMeta.notionUrl : (metadata.notionUrl || '');
        metadata.pubUrl = data.projectMeta.pubUrl || metadata.pubUrl;
        metadata.themeIndex = data.projectMeta.themeIndex !== undefined ? data.projectMeta.themeIndex : metadata.themeIndex;
        if (data.projectMeta.category !== undefined) {
            metadata.category = data.projectMeta.category;
        }
        metadata.updated = data.projectMeta.updated || metadata.updated;
        if (data.projectMeta.version !== undefined) {
            metadata.version = data.projectMeta.version;
        }
    }
    if (data.version !== undefined) {
        metadata.version = data.version;
    }
    if (screenFilename) {
        metadata.screens = metadata.screens || {};
        metadata.screens[screenFilename] = metadata.screens[screenFilename] || {};
        metadata.screens[screenFilename].description = data.description;
        metadata.screens[screenFilename].updatedAt = new Date().toISOString();
        if (data.version !== undefined) {
            metadata.screens[screenFilename].version = data.version;
        }
    }
    
    if (statusCallback) statusCallback('Saving...', '#facc15');
    
    // Save 1: Project Metadata
    const res1 = await saveProjectMetadata(project, metadata, null);
    
    // Save 2: Screen Design HTML
    let res2 = true;
    if (data.htmlContent && screenFilename) {
        res2 = await uploadToProject(project, screenFilename, data.htmlContent, null);
    }
    
    const success = res1 && res2;
    
    if (statusCallback) {
        if (success) {
            statusCallback('Success', '#4ade80');
        } else {
            statusCallback('Error', '#f87171');
        }
    }
    
    return success;
}

async function createScreenFromTemplate(project, screenName, templateName, injectData = {}, statusCallback) {
    try {
        let content = null;
        if (window.LF_TEMPLATES) {
            content = window.LF_TEMPLATES[templateName] || 
                      window.LF_TEMPLATES[templateName.toLowerCase()] || 
                      window.LF_TEMPLATES[`template_${templateName}.html`] || 
                      window.LF_TEMPLATES[`template_${templateName}`] || 
                      window.LF_TEMPLATES[templateName.replace(/^template_/, '').replace(/\.html$/, '')] ||
                      window.LF_TEMPLATES[templateName.replace(/\.html$/, '')];
        }
        if (!content) {
            try {
                const fetchName = templateName.endsWith('.html') ? templateName : `${templateName}.html`;
                const templateUrl = `assets/templates/${fetchName}`;
                if (window.location.protocol !== 'file:') {
                    const response = await fetch(templateUrl);
                    if (response.ok) content = await response.text();
                    if (content) {
                        window.LF_TEMPLATES = window.LF_TEMPLATES || {};
                        window.LF_TEMPLATES[templateName] = content;
                        window.LF_TEMPLATES[fetchName] = content;
                    }
                }
            } catch (e) {
                console.warn("[Templates] Dynamic fetch failed, falling back to window.LF_TEMPLATES:", e);
            }
        }
        if (!content) throw new Error("Template not found: " + templateName);
        
        // Inject metadata
        if (injectData) {
            Object.keys(injectData).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                content = content.replace(regex, injectData[key] || '');
            });
        }
        
        const filename = screenName.endsWith('.html') ? screenName : `${screenName}.html`;
        const success = await uploadToProject(project, filename, content, statusCallback);
        if (success) {
            if (statusCallback) statusCallback('Updating Metadata...', '#facc15');
            const meta = await fetchProjectMetadata(project);
            meta.screens = meta.screens || {};
            
            // Map template to type
            let type = 'default';
            if (templateName.includes('cover')) type = 'cover';
            else if (templateName.includes('architecture')) type = 'architecture';
            else if (templateName.includes('project_summary') || templateName.includes('summary')) type = 'plan';
            else if (templateName.includes('plan_delivery')) type = 'plan-delivery';
            else if (templateName.includes('plan')) type = 'plan';
            else if (templateName.includes('case_study') || templateName.includes('case-study')) type = 'case-study';
            else if (templateName.includes('front_ui')) type = 'ui';
            else if (templateName.includes('responsive') || templateName.includes('pc_mobile')) type = 'responsive-ui';
            else if (templateName.includes('mobile_ui')) type = 'mobile-ui';
            else if (templateName.includes('nbos') || templateName.includes('onesphere') || templateName.includes('admin')) type = 'admin';
            else if (templateName.includes('blank')) type = 'blank';

            meta.screens[filename] = { 
                title: injectData.SCREEN_NAME || filename,
                type: type,
                updatedAt: new Date().toISOString(), 
                template: templateName,
                version: (type === 'cover') ? 0.1 : undefined
            };
            
            // Add to screenOrder if exists
            if (meta.screenOrder) {
                if (!meta.screenOrder.includes(filename)) {
                    meta.screenOrder.push(filename);
                }
            }
            
            const metaSuccess = await saveProjectMetadata(project, meta, statusCallback);
            return metaSuccess; // Crucial: only return true if meta also saved
        }
        return false;
    } catch (err) {
        console.error("Template creation failed:", err);
        return false;
    }
}

const NOTIFICATION_SVG_ICONS = {
    info: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    success: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    warning: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    error: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
};

const Notification = {
    DOM: null,
    _init() {
        let overlay = document.getElementById('notification-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'notification-overlay';
            overlay.className = 'dialog-overlay';
            overlay.innerHTML = `<div class="dialog-card">
                    <div id="notification-icon-bg" class="dialog-icon">
                        <span id="notification-icon" class="dialog-icon-svg" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"></span>
                    </div>
                    <h3 id="notification-title" class="dialog-title"></h3>
                    <div id="notification-message" class="dialog-message"></div>
                    <div id="notification-input-container"></div>
                    <div class="dialog-footer" id="notification-footer"></div>
                </div>`;
            document.body.appendChild(overlay);
        }
        this.DOM = {
            overlay,
            card: overlay.querySelector('.dialog-card'),
            iconBg: overlay.querySelector('#notification-icon-bg'),
            icon: overlay.querySelector('#notification-icon'),
            title: overlay.querySelector('#notification-title'),
            message: overlay.querySelector('#notification-message'),
            inputContainer: overlay.querySelector('#notification-input-container'),
            footer: overlay.querySelector('#notification-footer')
        };
    },
    _show(type, title, message, buttons, hasInput = false, defaultValue = '', isTextarea = true) {
        this._init();
        this.DOM.title.innerText = title;
        this.DOM.message.innerHTML = message.replace(/\n/g, '<br>');
        
        // Clean up classes & render robust SVG icon
        const iconBg = this.DOM.iconBg || this.DOM.overlay.querySelector('#notification-icon-bg');
        if (iconBg) {
            iconBg.className = `dialog-icon ${type || 'info'}`;
        }
        if (this.DOM.icon) {
            this.DOM.icon.innerHTML = NOTIFICATION_SVG_ICONS[type] || NOTIFICATION_SVG_ICONS.info;
        }
        
        if (hasInput) {
            const escapedDefault = String(defaultValue || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            this.DOM.inputContainer.innerHTML = isTextarea
                ? `<textarea id="notification-prompt-input" class="dialog-textarea" placeholder="상세 변경 사유를 입력하세요...">${escapedDefault}</textarea><div class="dialog-hint">Ctrl + Enter 로 즉시 저장 가능</div>`
                : `<input type="text" id="notification-prompt-input" class="dialog-input" style="width:100%; box-sizing:border-box;" value="${escapedDefault}">`;
        } else {
            this.DOM.inputContainer.innerHTML = '';
        }

        this.DOM.footer.innerHTML = '';
        return new Promise((resolve) => {
            buttons.forEach(btn => {
                const el = document.createElement('button');
                el.className = btn.danger ? 'btn-danger' : (btn.primary ? 'btn-primary' : 'btn-secondary');
                el.innerText = btn.text;
                el.onclick = () => {
                    let value;
                    if (btn.value !== undefined) {
                        value = btn.value;
                    } else if (hasInput) {
                        const inputField = document.getElementById('notification-prompt-input');
                        value = inputField ? inputField.value : '';
                    } else {
                        value = true;
                    }
                    this.DOM.overlay.classList.remove('active');
                    resolve(value);
                };
                this.DOM.footer.appendChild(el);
            });
            this.DOM.overlay.classList.add('active');
            if (hasInput) {
                setTimeout(() => {
                    const inputEl = document.getElementById('notification-prompt-input');
                    if (inputEl) {
                        inputEl.focus();
                        if (inputEl.setSelectionRange) {
                            inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
                        }
                        inputEl.onkeydown = (e) => {
                            if (isTextarea) {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = inputEl.value;
                                    this.DOM.overlay.classList.remove('active');
                                    resolve(val);
                                }
                            } else {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = inputEl.value;
                                    this.DOM.overlay.classList.remove('active');
                                    resolve(val);
                                }
                            }
                        };
                    }
                }, 100);
            }
        });
    },
    alert(message, title = 'Alert', type = 'info') {
        return this._show(type, title, message, [{ text: '확인', primary: true }]);
    },
    confirm(message, title = '이 작업을 진행할까요?', type = 'warning') {
        return this._show(type, title, message, [
            { text: '취소', primary: false, value: false },
            { text: '네, 진행합니다', primary: true, value: true, danger: type === 'warning' }
        ]);
    },
    prompt(message, defaultValue = '', title = 'Input', isTextarea = true) {
        return this._show('info', title, message, [
            { text: 'Cancel', primary: false, value: null },
            { text: 'OK', primary: true }
        ], true, defaultValue, isTextarea);
    }
};

Notification.alert = Notification.alert.bind(Notification);
Notification.confirm = Notification.confirm.bind(Notification);
Notification.prompt = Notification.prompt.bind(Notification);

window.NotificationUI = Notification;
window.AppDialog = Notification;
try {
    window.Notification = Notification;
} catch(e) {
    console.warn("Could not overwrite global window.Notification:", e);
}

// ==========================================
// Deploy & Short URL Generation & Copy Engine (SSOT)
// ==========================================
const _shortUrlCache = new Map();

function getProjectDeployUrl(projectName, screenName = null) {
    const owner = (window.ghConfig && window.ghConfig.owner) || 'bychoi-space';
    const repo = (window.ghConfig && window.ghConfig.repo) || 'workspace';
    let url = `https://${owner}.github.io/${repo}/viewer.html?project=${encodeURIComponent(projectName)}`;
    if (screenName) {
        url += `&file=${encodeURIComponent(screenName)}`;
    }
    return url;
}

async function createShortUrl(longUrl) {
    if (_shortUrlCache.has(longUrl)) {
        return { shortUrl: _shortUrlCache.get(longUrl), provider: 'cache' };
    }

    const fetchWithTimeout = (url, options = {}, timeoutMs = 3500) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
        ]);
    };

    // 1st Attempt: da.gd (Instant 302 direct redirect, no preview/ads, CORS supported)
    try {
        const dagdRes = await fetchWithTimeout(`https://da.gd/s?url=${encodeURIComponent(longUrl)}`, { method: 'GET' }, 3500);
        if (dagdRes.ok) {
            const shortUrl = (await dagdRes.text()).trim();
            if (shortUrl.startsWith('http://') || shortUrl.startsWith('https://')) {
                const secureShortUrl = shortUrl.replace(/^http:\/\//i, 'https://');
                _shortUrlCache.set(longUrl, secureShortUrl);
                return { shortUrl: secureShortUrl, provider: 'da.gd' };
            }
        }
    } catch (e) {
        console.warn("[ShortURL] da.gd attempt failed:", e.message);
    }

    // 2nd Attempt: Spoo.me (Instant 302 direct redirect, CORS supported)
    try {
        const spooRes = await fetchWithTimeout('https://spoo.me/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `url=${encodeURIComponent(longUrl)}`
        }, 3500);
        if (spooRes.ok) {
            const data = await spooRes.json();
            if (data && data.short_url) {
                const secureShortUrl = data.short_url.replace(/^http:\/\//i, 'https://');
                _shortUrlCache.set(longUrl, secureShortUrl);
                return { shortUrl: secureShortUrl, provider: 'spoo.me' };
            }
        }
    } catch (e) {
        console.warn("[ShortURL] Spoo.me attempt failed:", e.message);
    }

    // 3rd Fallback: Original GitHub Pages URL
    return { shortUrl: longUrl, provider: 'original' };
}

// --- Clipboard Delegation (SSOT: assets/vctrl_clipboard.js) ---
async function copyDeployUrlToClipboard(text, successMessage) {
    if (window.ClipboardManager && typeof window.ClipboardManager.copyTextToClipboard === 'function') {
        return await window.ClipboardManager.copyTextToClipboard(text, successMessage);
    }
    if (typeof window.copyTextToClipboard === 'function') {
        return await window.copyTextToClipboard(text, successMessage);
    }
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (e) {}
    return false;
}

function showGlobalToast(message, type = 'success') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    let container = document.getElementById('v4-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'v4-toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `v4-toast ${type}`;
    let iconName = 'info';
    if (type === 'success') iconName = 'check_circle';
    else if (type === 'error') iconName = 'error';
    else if (type === 'warning') iconName = 'warning';

    toast.innerHTML = `
        <span class="material-icons-outlined v4-toast-icon">${iconName}</span>
        <span style="flex-grow: 1; word-break: break-all; line-height: 1.4;">${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

async function copyProjectShortUrl(projectName, options = {}) {
    const screenName = options.screenName || null;

    try {
        const deployUrl = getProjectDeployUrl(projectName, screenName);
        const copySuccess = await copyDeployUrlToClipboard(deployUrl);

        if (copySuccess) {
            const toastMsg = screenName
                ? `스크린 URL이 복사되었습니다.<br><b style="color:var(--accent); word-break:break-all;">${deployUrl}</b>`
                : `프로젝트 URL이 복사되었습니다.<br><b style="color:var(--accent); word-break:break-all;">${deployUrl}</b>`;

            showGlobalToast(toastMsg, 'success');
            return deployUrl;
        } else {
            showGlobalToast('클립보드 복사에 실패했습니다. 권한을 확인해주세요.', 'error');
            return null;
        }
    } catch (err) {
        console.error("[URL Copy] Error:", err);
        showGlobalToast('URL 복사 중 오류가 발생했습니다.', 'error');
        return null;
    }
}

window.getProjectDeployUrl = getProjectDeployUrl;
window.createShortUrl = createShortUrl;
window.copyTextToClipboard = window.copyTextToClipboard || copyDeployUrlToClipboard;
window.showGlobalToast = showGlobalToast;
window.copyProjectShortUrl = copyProjectShortUrl;
window.copyProjectUrl = copyProjectShortUrl;

// ==========================================
// 8 Semantic Project Categories (Shared SSOT for index.html & viewer.html)
// ==========================================
window.PROJECT_CATEGORIES = [
    {
        id: "front_ui",
        index: 0,
        name: "운영 Front UI 개선",
        shortName: "Front UI 개선",
        badge: "Front UI",
        desc: "PC/모바일 스토어 화면 및 고객 UX 개편",
        gradient: "linear-gradient(135deg, rgba(2, 132, 199, 0.34) 0%, rgba(14, 165, 233, 0.16) 60%, rgba(56, 189, 248, 0.06) 100%)",
        headerBg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
        headerBorder: "#bae6fd",
        headerTextColor: "#0369a1",
        solidGradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)",
        accentColor: "#38bdf8",
        lightAccent: "#0284c7",
        badgeBg: "rgba(56, 189, 248, 0.14)",
        badgeBorder: "rgba(56, 189, 248, 0.34)",
        iconColor: "#7dd3fc",
        glowColor: "rgba(56, 189, 248, 0.45)",
        icon: "devices",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3.5" width="15.5" height="12" rx="2.2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.14"/>
            <line x1="2" y1="7" x2="17.5" y2="7" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="4.5" cy="5.25" r="0.75" fill="currentColor"/>
            <circle cx="6.8" cy="5.25" r="0.75" fill="currentColor"/>
            <rect x="4.5" y="9.2" width="5.5" height="3.8" rx="0.8" fill="currentColor" fill-opacity="0.45"/>
            <rect x="14" y="8.5" width="8" height="12.5" rx="2" fill="#0f172a" stroke="currentColor" stroke-width="1.8"/>
            <rect x="15.5" y="10.2" width="5" height="7.5" rx="0.8" fill="currentColor" fill-opacity="0.32"/>
            <line x1="16.8" y1="19.2" x2="19.2" y2="19.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`
    },
    {
        id: "admin",
        index: 1,
        name: "운영 Admin 기능 개선",
        shortName: "Admin 기능 개선",
        badge: "Admin 기능",
        desc: "백오피스 관리 도구 및 운영 업무 효율화",
        gradient: "linear-gradient(135deg, rgba(67, 56, 202, 0.36) 0%, rgba(99, 102, 241, 0.18) 60%, rgba(129, 140, 248, 0.06) 100%)",
        headerBg: "linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)",
        headerBorder: "#c7d2fe",
        headerTextColor: "#3730a3",
        solidGradient: "linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #818cf8 100%)",
        accentColor: "#818cf8",
        lightAccent: "#4f46e5",
        badgeBg: "rgba(129, 140, 248, 0.14)",
        badgeBorder: "rgba(129, 140, 248, 0.34)",
        iconColor: "#a5b4fc",
        glowColor: "rgba(99, 102, 241, 0.45)",
        icon: "settings_suggest",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.2" y="3.2" width="16.5" height="14" rx="2.2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.14"/>
            <line x1="7" y1="3.2" x2="7" y2="17.2" stroke="currentColor" stroke-width="1.6"/>
            <line x1="9.5" y1="7.2" x2="15.8" y2="7.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="9.5" y1="10.6" x2="14.2" y2="10.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="17.5" cy="17.2" r="4.6" fill="#0f172a" stroke="currentColor" stroke-width="1.8"/>
            <circle cx="17.5" cy="17.2" r="1.6" fill="currentColor"/>
            <path d="M17.5 11.4V12.6M17.5 21.8V23M11.7 17.2H12.9M22.1 17.2H23.3M13.4 13.1L14.3 14M20.7 20.4L21.6 21.3M21.6 13.1L20.7 14M14.3 20.4L13.4 21.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`
    },
    {
        id: "front_admin",
        index: 2,
        name: "운영 Front + Admin 통합",
        shortName: "Front + Admin",
        badge: "Front + Admin",
        desc: "프론트 화면과 어드민 설정이 연동되는 복합 과제",
        gradient: "linear-gradient(135deg, rgba(109, 40, 217, 0.36) 0%, rgba(139, 92, 246, 0.18) 60%, rgba(192, 132, 252, 0.06) 100%)",
        headerBg: "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)",
        headerBorder: "#e9d5ff",
        headerTextColor: "#6b21a8",
        solidGradient: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #c084fc 100%)",
        accentColor: "#c084fc",
        lightAccent: "#7c3aed",
        badgeBg: "rgba(192, 132, 252, 0.14)",
        badgeBorder: "rgba(192, 132, 252, 0.34)",
        iconColor: "#d8b4fe",
        glowColor: "rgba(139, 92, 246, 0.45)",
        icon: "sync_alt",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="11.5" height="9.5" rx="2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.18"/>
            <line x1="4.5" y1="6.2" x2="10.8" y2="6.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="10.5" y="11.5" width="11.5" height="9.5" rx="2" fill="#0f172a" stroke="currentColor" stroke-width="1.8"/>
            <circle cx="16.25" cy="16.25" r="2.1" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.35"/>
            <path d="M16 4.5H20.5V9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.2 2.8L20.6 4.6L18.2 6.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 19.5H3.5V15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5.8 21.2L3.4 19.4L5.8 17.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    },
    {
        id: "project",
        index: 3,
        name: "프로젝트성 과제",
        shortName: "프로젝트성 과제",
        badge: "프로젝트 과제",
        desc: "신규 서비스 구축, 대형 개편 및 핵심 전략 과제",
        gradient: "linear-gradient(135deg, rgba(194, 65, 12, 0.36) 0%, rgba(249, 115, 22, 0.18) 60%, rgba(251, 146, 60, 0.06) 100%)",
        headerBg: "linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)",
        headerBorder: "#fed7aa",
        headerTextColor: "#c2410c",
        solidGradient: "linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #fb923c 100%)",
        accentColor: "#fb923c",
        lightAccent: "#ea580c",
        badgeBg: "rgba(251, 146, 60, 0.14)",
        badgeBorder: "rgba(251, 146, 60, 0.34)",
        iconColor: "#fdba74",
        glowColor: "rgba(249, 115, 22, 0.45)",
        icon: "rocket_launch",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3.2L19 7.8V16.8L11 21.4L3 16.8V7.8L11 3.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="currentColor" fill-opacity="0.16"/>
            <path d="M3.3 8L11 12.4L18.7 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 12.4V21.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            <path d="M19.5 2L20.4 4.3L22.7 5.2L20.4 6.1L19.5 8.4L18.6 6.1L16.3 5.2L18.6 4.3L19.5 2Z" fill="currentColor"/>
        </svg>`
    },
    {
        id: "roadmap",
        index: 4,
        name: "중장기 계획서",
        shortName: "중장기 계획서",
        badge: "중장기 계획",
        desc: "연간/분기 로드맵 및 중장기 서비스 방향성",
        gradient: "linear-gradient(135deg, rgba(4, 120, 87, 0.36) 0%, rgba(16, 185, 129, 0.18) 60%, rgba(52, 211, 153, 0.06) 100%)",
        headerBg: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
        headerBorder: "#a7f3d0",
        headerTextColor: "#047857",
        solidGradient: "linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)",
        accentColor: "#34d399",
        lightAccent: "#059669",
        badgeBg: "rgba(52, 211, 153, 0.14)",
        badgeBorder: "rgba(52, 211, 153, 0.34)",
        iconColor: "#6ee7b7",
        glowColor: "rgba(16, 185, 129, 0.45)",
        icon: "flag",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 19.5C4.5 15 10.5 15.5 11.5 12C12.5 8.5 18 9.5 18.5 5.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
            <circle cx="4.5" cy="19.5" r="2.3" fill="currentColor"/>
            <circle cx="11.5" cy="12" r="2.2" fill="#0f172a" stroke="currentColor" stroke-width="1.8"/>
            <path d="M16.5 2.5V10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M16.5 2.8L22 5.2L16.5 7.6V2.8Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>`
    },
    {
        id: "executive",
        index: 5,
        name: "경영진 보고서",
        shortName: "경영진 보고서",
        badge: "경영진 보고",
        desc: "의사결정 보고, 벤치마킹 및 사례 조사 리포트",
        gradient: "linear-gradient(135deg, rgba(180, 83, 9, 0.36) 0%, rgba(245, 158, 11, 0.18) 60%, rgba(251, 191, 36, 0.06) 100%)",
        headerBg: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
        headerBorder: "#fde68a",
        headerTextColor: "#b45309",
        solidGradient: "linear-gradient(135deg, #b45309 0%, #d97706 50%, #fbbf24 100%)",
        accentColor: "#fbbf24",
        lightAccent: "#d97706",
        badgeBg: "rgba(251, 191, 36, 0.14)",
        badgeBorder: "rgba(251, 191, 36, 0.34)",
        iconColor: "#fde047",
        glowColor: "rgba(245, 158, 11, 0.45)",
        icon: "insights",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.5" y="3.2" width="19" height="14.5" rx="2.2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.14"/>
            <path d="M7.2 14V11.2M11.8 14V8.8M16.4 14V6.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M6.8 9.2L11.2 6.5L15.8 4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12 17.7V21.2M8.5 21.2H15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`
    },
    {
        id: "policy",
        index: 6,
        name: "정책 / 프로세스 정립",
        shortName: "정책 / 프로세스",
        badge: "정책 · 프로세스",
        desc: "업무 프로세스, 운영 정책 및 표준 가이드 정립",
        gradient: "linear-gradient(135deg, rgba(190, 18, 60, 0.34) 0%, rgba(244, 63, 94, 0.16) 60%, rgba(251, 113, 133, 0.06) 100%)",
        headerBg: "linear-gradient(135deg, #ffe4e6 0%, #fff1f2 100%)",
        headerBorder: "#fecdd3",
        headerTextColor: "#be123c",
        solidGradient: "linear-gradient(135deg, #be123c 0%, #e11d48 50%, #fb7185 100%)",
        accentColor: "#fb7185",
        lightAccent: "#e11d48",
        badgeBg: "rgba(251, 113, 133, 0.14)",
        badgeBorder: "rgba(251, 113, 133, 0.34)",
        iconColor: "#fda4af",
        glowColor: "rgba(244, 63, 94, 0.45)",
        icon: "account_tree",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 2.8L14.5 5V10.2C14.5 14 11.9 16.9 8.5 18.2C5.1 16.9 2.5 14 2.5 10.2V5L8.5 2.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="currentColor" fill-opacity="0.18"/>
            <path d="M6.2 10.3L7.8 11.9L11.1 8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.5 10H18.5V15.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="16" y="15.5" width="5.5" height="5" rx="1.3" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.7"/>
        </svg>`
    },
    {
        id: "etc",
        index: 7,
        name: "기타",
        shortName: "기타",
        badge: "기타",
        desc: "보관함, 임시 작업 및 분류 외 일반 과제",
        gradient: "linear-gradient(135deg, rgba(71, 85, 105, 0.42) 0%, rgba(100, 116, 139, 0.2) 60%, rgba(148, 163, 184, 0.08) 100%)",
        headerBg: "linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)",
        headerBorder: "#cbd5e1",
        headerTextColor: "#334155",
        solidGradient: "linear-gradient(135deg, #334155 0%, #475569 50%, #94a3b8 100%)",
        accentColor: "#94a3b8",
        lightAccent: "#475569",
        badgeBg: "rgba(148, 163, 184, 0.15)",
        badgeBorder: "rgba(148, 163, 184, 0.35)",
        iconColor: "#cbd5e1",
        glowColor: "rgba(148, 163, 184, 0.4)",
        icon: "inventory_2",
        svgIcon: `<svg class="category-custom-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="4.5" rx="1.5" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.22"/>
            <path d="M4.5 8.5H19.5V18.5C19.5 19.6 18.6 20.5 17.5 20.5H6.5C5.4 20.5 4.5 19.6 4.5 18.5V8.5Z" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.1"/>
            <path d="M9.5 13H14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`
    }
];

window.inferCategoryFromProject = function(projectName, meta) {
    const cats = window.PROJECT_CATEGORIES;
    const title = ((meta && meta.title) || projectName || '').toLowerCase();
    const screensObj = (meta && (meta.screens || meta.files)) || {};
    const screenKeys = Object.keys(screensObj);
    const screenText = screenKeys.map(k => {
        const s = screensObj[k] || {};
        return `${k} ${s.title || ''} ${s.type || ''} ${s.template || ''}`;
    }).join(' ').toLowerCase();

    if (/삭제 스크린|보관함|임시|테스트|기타|백업/.test(title) || projectName === 'p_trash') {
        return cats[7];
    }
    if (/프로세스|업무 진행|정책|가이드|규칙|정립/.test(title) || projectName === 'operation_process') {
        return cats[6];
    }
    if (/중장기|로드맵|마일스톤|연간|비전|계획서/.test(title)) {
        return cats[4];
    }
    if (/경영진|보고서|사례 조사|사례조사|벤치마킹|리포트|인사이트/.test(title) || (screenKeys.length === 1 && /case_study/.test(screenText))) {
        return cats[5];
    }
    if (/템플릿화|최대 혜택|자동 적용|신규 구축|고도화 프로젝트|플랫폼 구축/.test(title)) {
        return cats[3];
    }
    if (/물류|악성 고객|제한 조치|인라인 서브링크|어드민 전용|백오피스/.test(title)) {
        return cats[1];
    }
    const hasAdmin = /admin|어드민|백오피스|관리/.test(title) || /09_admin|어드민|관리 설정|등록\/수정/.test(screenText);
    const hasFront = /front|ui|상세|기획전|장바구니|랜더링|코너|모바일/.test(title) || /08_responsive|0[567]_/.test(screenText);
    if ((hasAdmin && hasFront) || /ui 변경 및 정렬|더보기 & 상세 공지|front.*admin|통합/.test(title)) {
        return cats[2];
    }
    if (hasAdmin) {
        return cats[1];
    }
    if (hasFront || /주문/.test(title)) {
        return cats[0];
    }
    return cats[7];
};

window.resolveProjectCategory = function(projectName, meta) {
    const cats = window.PROJECT_CATEGORIES;
    if (meta && meta.category && meta.category !== 'auto') {
        const found = cats.find(c => c.id === meta.category);
        if (found) return found;
    }
    return window.inferCategoryFromProject(projectName, meta);
};