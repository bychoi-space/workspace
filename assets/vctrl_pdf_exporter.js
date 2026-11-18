/**
 * bychoi workspace - Unified Project PDF Exporter Module (v4 - CORS-Safe & Full Storyboard Description Renderer)
 * Handles batch rendering of all screens within a project into a single high-resolution PDF file:
 * - Pre-inlines relative/external images as Base64 Data URLs (supports both https:// and local file:// via GitHub CORS bridge)
 * - Enforces allowTaint: false + per-image canvas taint guard to prevent SecurityError on canvas.toDataURL()
 * - Reconciles numbered Pin Markers (1..N) onto both Responsive (PC/Mobile) and Standard (1600x900) screens
 * - Composites a dedicated right-hand DESCRIPTION (Scene Annotations) specification panel whenever descriptions exist
 */

const _pdfAssetDataUrlCache = new Map();

// --- 1. Progress Modal UI Helpers ---
function showPdfProgressModal(projectName) {
    let modal = document.getElementById('pdf-export-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pdf-export-modal';
        modal.className = 'pdf-modal-overlay';
        modal.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'width: 100vw',
            'height: 100vh',
            'background: rgba(15, 23, 42, 0.85)',
            'backdrop-filter: blur(8px)',
            '-webkit-backdrop-filter: blur(8px)',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'z-index: 999999',
            'opacity: 0',
            'transition: opacity 0.3s ease'
        ].join('; ');
        modal.innerHTML = `
            <div style="background: rgba(22, 24, 38, 0.96); border: 1.6px solid rgba(255,255,255,0.12); border-radius: 10px; width: 420px; padding: 28px; box-shadow: 0 24px 48px -12px rgba(0,0,0,0.7), 0 0 20px rgba(110,86,207,0.2); text-align: center; color: #f8fafc; font-family: 'Pretendard Variable', 'Inter', sans-serif;">
                <div style="display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: rgba(110, 86, 207, 0.15); border: 1px solid rgba(110, 86, 207, 0.3); border-radius: 8px; margin: 0 auto 16px;">
                    <span class="material-icons-outlined" style="font-size: 28px; color: #9e8cfc; animation: spinPdfIcon 2s linear infinite;">picture_as_pdf</span>
                </div>
                <h3 id="pdf-modal-title" style="margin: 0 0 8px; font-size: 17px; font-weight: 600; color: #ffffff;">PDF 문서 생성 중</h3>
                <p id="pdf-modal-subtitle" style="margin: 0 0 20px; font-size: 13px; color: #94a3b8; line-height: 1.5;">프로젝트의 모든 스크린과 상세 설명(Description)을 결합하고 있습니다.</p>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
                    <div id="pdf-modal-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #6e56cf, #9e8cfc, #38bdf8); border-radius: 4px; transition: width 0.2s ease;"></div>
                </div>
                <div id="pdf-modal-status" style="font-size: 12px; color: #cbd5e1; font-weight: 500;">준비 중...</div>
            </div>
            <style>
                @keyframes spinPdfIcon {
                    0% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.1) rotate(180deg); }
                    100% { transform: scale(1) rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(modal);
    }
    const titleEl = document.getElementById('pdf-modal-title');
    const barEl = document.getElementById('pdf-modal-progress-bar');
    const statusEl = document.getElementById('pdf-modal-status');
    if (titleEl) titleEl.innerText = `[${projectName}] PDF 생성`;
    if (barEl) barEl.style.width = '0%';
    if (statusEl) statusEl.innerText = '프로젝트 정보 확인 중...';
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
}

function updatePdfProgress(percent, statusText) {
    const bar = document.getElementById('pdf-modal-progress-bar');
    const status = document.getElementById('pdf-modal-status');
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (status) status.innerText = statusText;
}

function hidePdfProgressModal() {
    const modal = document.getElementById('pdf-export-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

function showPdfAlert(message, title = '알림', type = 'error') {
    const dialogUI = window.NotificationUI || window.AppDialog || (window.Notification && typeof window.Notification.alert === 'function' ? window.Notification : null);
    if (dialogUI && typeof dialogUI.alert === 'function') {
        dialogUI.alert(message, title, type);
    } else {
        alert(message);
    }
}

// --- 2. Metadata & Screen HTML Fetchers ---
async function fetchProjectMetadataForPdf(projectName) {
    if (typeof window.fetchProjectMetadata === 'function') {
        try {
            const meta = await window.fetchProjectMetadata(projectName);
            if (meta && meta.screens) return meta;
        } catch (e) {
            console.warn('[PDF Exporter] fetchProjectMetadata API failed, fallback to fetch:', e);
        }
    }

    try {
        const url = `data/${encodeURIComponent(projectName)}/metadata.json?t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
    } catch (e) {
        console.warn('[PDF Exporter] Metadata fetch error:', e);
    }
    return { title: projectName, screens: {} };
}

async function fetchScreenHtmlForPdf(projectName, screenFileName) {
    if (typeof window.fetchProjectFileContent === 'function') {
        try {
            const content = await window.fetchProjectFileContent(projectName, screenFileName);
            if (content && content !== '__NOT_FOUND__') {
                return content;
            }
        } catch (e) {
            console.warn(`[PDF Exporter] fetchProjectFileContent failed for ${screenFileName}:`, e);
        }
    }

    if (window.location.protocol !== 'file:') {
        try {
            const url = `data/${encodeURIComponent(projectName)}/${encodeURIComponent(screenFileName)}?t=${Date.now()}`;
            const res = await fetch(url);
            if (res.ok) return await res.text();
        } catch (e) {
            console.warn(`[PDF Exporter] HTTP fetch failed for ${screenFileName}:`, e);
        }
    }

    try {
        const html = await new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:fixed; left:0; top:0; width:1px; height:1px; opacity:0.001; pointer-events:none; z-index:1;';
            const screenUrl = `data/${encodeURIComponent(projectName)}/${encodeURIComponent(screenFileName)}`;
            let resolved = false;

            iframe.onload = () => {
                if (resolved) return;
                resolved = true;
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    const docHtml = doc.documentElement.outerHTML;
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                    resolve(docHtml);
                } catch (err) {
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                    resolve(null);
                }
            };
            iframe.onerror = () => {
                if (resolved) return;
                resolved = true;
                if (document.body.contains(iframe)) document.body.removeChild(iframe);
                resolve(null);
            };

            document.body.appendChild(iframe);
            iframe.src = screenUrl;

            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                    resolve(null);
                }
            }, 3000);
        });
        if (html) return html;
    } catch (e) {
        console.warn(`[PDF Exporter] Hidden iframe fallback failed: ${screenFileName}`, e);
    }

    return null;
}

// --- 3. CORS-Safe Asset Base64 Inliner (Prevents Tainted Canvas on file:// & https://) ---
function _guessImageMimeType(urlPath) {
    const clean = String(urlPath || '').split('?')[0].split('#')[0].toLowerCase();
    if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
    if (clean.endsWith('.webp')) return 'image/webp';
    if (clean.endsWith('.gif')) return 'image/gif';
    if (clean.endsWith('.svg')) return 'image/svg+xml';
    return 'image/png';
}

function _blobToDataUrl(blob) {
    return new Promise((resolve) => {
        if (!blob) return resolve(null);
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
    });
}

function _decodeUrlEntities(raw) {
    return String(raw || '')
        .trim()
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '')
        .replace(/&#39;/g, '');
}

function _shouldSkipAssetInlining(cleanUrl) {
    if (!cleanUrl) return true;
    const lower = cleanUrl.toLowerCase();
    if (lower.startsWith('data:') || lower.startsWith('blob:') || lower.startsWith('#') || lower.startsWith('about:') || lower.startsWith('javascript:')) {
        return true;
    }
    if (lower.includes('fonts.googleapis.com') || lower.includes('fonts.gstatic.com') || lower.includes('pretendard')) {
        return true;
    }
    const noQuery = lower.split('?')[0];
    if (noQuery.endsWith('.css') || noQuery.endsWith('.js') || noQuery.endsWith('.woff') || noQuery.endsWith('.woff2') || noQuery.endsWith('.ttf') || noQuery.endsWith('.otf')) {
        return true;
    }
    return false;
}

function _buildCandidateRepoPaths(cleanUrl, projectName) {
    let rel = cleanUrl.split('?')[0].split('#')[0].trim();
    const ghPagesMatch = rel.match(/https?:\/\/[^/]+\/workspace\/(.+)$/i);
    if (ghPagesMatch) {
        rel = ghPagesMatch[1];
    } else if (/^https?:\/\//i.test(rel)) {
        return [];
    }

    rel = rel.replace(/^(\.\/)+/, '').replace(/^\/+/, '');
    while (rel.startsWith('../')) {
        rel = rel.slice(3);
    }
    if (!rel) return [];

    const candidates = [];
    if (rel.startsWith('assets/') || rel.startsWith('data/')) {
        candidates.push(rel);
    } else {
        if (projectName) {
            candidates.push(`data/${projectName}/${rel}`);
        }
        candidates.push(rel);
    }
    return candidates;
}

async function _fetchWithTimeout(url, options, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
    } finally {
        clearTimeout(timer);
    }
}

async function _resolveAssetToDataUrl(rawUrl, projectName) {
    const cleanUrl = _decodeUrlEntities(rawUrl);
    if (_shouldSkipAssetInlining(cleanUrl)) return null;

    const cacheKey = `${projectName || ''}::${cleanUrl}`;
    if (_pdfAssetDataUrlCache.has(cacheKey)) {
        return _pdfAssetDataUrlCache.get(cacheKey);
    }

    let resolvedDataUrl = null;
    const isRemoteHttp = /^https?:\/\//i.test(cleanUrl);

    // 1. Direct CORS fetch on HTTP/HTTPS environments (or for explicit https:// image URLs)
    if (window.location.protocol !== 'file:' || isRemoteHttp) {
        try {
            let fetchTarget = cleanUrl;
            if (!isRemoteHttp && !cleanUrl.startsWith('assets/') && !cleanUrl.startsWith('data/') && !cleanUrl.startsWith('/') && projectName) {
                fetchTarget = `data/${encodeURIComponent(projectName)}/${cleanUrl.replace(/^(\.\/)+/, '')}`;
            }
            const res = await _fetchWithTimeout(fetchTarget, { mode: 'cors', credentials: 'omit' }, 7000);
            if (res && res.ok) {
                const blob = await res.blob();
                resolvedDataUrl = await _blobToDataUrl(blob);
            }
        } catch (err) {
            // Fall through to GitHub CORS bridge
        }
    }

    // 2. GitHub Raw & Contents API CORS Bridge (Essential when viewer.html/index.html runs on local file://)
    if (!resolvedDataUrl) {
        const owner = (window.ghConfig && window.ghConfig.owner) || 'bychoi-space';
        const repo = (window.ghConfig && window.ghConfig.repo) || 'workspace';
        const token = (window.ghConfig && window.ghConfig.token) || localStorage.getItem('gh_token') || '';
        const repoPaths = _buildCandidateRepoPaths(cleanUrl, projectName);

        for (let i = 0; i < repoPaths.length && !resolvedDataUrl; i++) {
            const safePath = repoPaths[i].split('/').map(seg => encodeURIComponent(seg)).join('/');

            // 2-A. GitHub Raw CDN (Access-Control-Allow-Origin: *)
            try {
                const rawGhUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${safePath}`;
                const rawRes = await _fetchWithTimeout(rawGhUrl, { mode: 'cors', credentials: 'omit' }, 7000);
                if (rawRes && rawRes.ok) {
                    const blob = await rawRes.blob();
                    resolvedDataUrl = await _blobToDataUrl(blob);
                    if (resolvedDataUrl) break;
                }
            } catch (rawErr) {}

            // 2-B. GitHub Contents API Base64 payload fallback
            try {
                const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${safePath}`;
                const headers = { 'Accept': 'application/vnd.github.v3+json' };
                if (token) headers['Authorization'] = `token ${token}`;
                const apiRes = await _fetchWithTimeout(apiUrl, { headers, mode: 'cors', credentials: 'omit' }, 7000);
                if (apiRes && apiRes.ok) {
                    const json = await apiRes.json();
                    if (json && json.content) {
                        const mime = _guessImageMimeType(repoPaths[i]);
                        const b64 = String(json.content).replace(/\s+/g, '');
                        resolvedDataUrl = `data:${mime};base64,${b64}`;
                        break;
                    }
                }
            } catch (apiErr) {}
        }
    }

    _pdfAssetDataUrlCache.set(cacheKey, resolvedDataUrl);
    return resolvedDataUrl;
}

async function inlineScreenAssetsForPdf(html, projectName) {
    if (!html) return '';
    const urlSet = new Set();

    const imgSrcRegex = /<img\b[^>]*?\bsrc=(["'])([^"']+)\1/gi;
    let m;
    while ((m = imgSrcRegex.exec(html)) !== null) {
        if (!_shouldSkipAssetInlining(_decodeUrlEntities(m[2]))) {
            urlSet.add(m[2]);
        }
    }

    const cssUrlRegex = /url\(\s*(["']?)([^\x29"']+)\1\s*\)/gi;
    while ((m = cssUrlRegex.exec(html)) !== null) {
        if (!_shouldSkipAssetInlining(_decodeUrlEntities(m[2]))) {
            urlSet.add(m[2]);
        }
    }

    if (urlSet.size === 0) return html;

    const entries = Array.from(urlSet);
    const resolvedMap = new Map();
    await Promise.all(entries.map(async (rawRef) => {
        const dataUrl = await _resolveAssetToDataUrl(rawRef, projectName);
        if (dataUrl) resolvedMap.set(rawRef, dataUrl);
    }));

    if (resolvedMap.size === 0) return html;

    let updated = html.replace(imgSrcRegex, (fullMatch, quote, srcVal) => {
        const dataUrl = resolvedMap.get(srcVal);
        if (!dataUrl) return fullMatch;
        return fullMatch.replace(`src=${quote}${srcVal}${quote}`, `src=${quote}${dataUrl}${quote}`);
    });

    updated = updated.replace(cssUrlRegex, (fullMatch, quote, urlVal) => {
        const dataUrl = resolvedMap.get(urlVal);
        if (!dataUrl) return fullMatch;
        const outQuote = quote || '"';
        return `url(${outQuote}${dataUrl}${outQuote})`;
    });

    return updated;
}

function _guardUntaintedDomImages(iframeDoc) {
    if (!iframeDoc) return;
    const imgs = Array.from(iframeDoc.querySelectorAll('img'));
    if (imgs.length === 0) return;

    const probeCanvas = document.createElement('canvas');
    probeCanvas.width = 1;
    probeCanvas.height = 1;

    imgs.forEach((img) => {
        const src = img.getAttribute('src') || '';
        if (!src || src.startsWith('data:')) return;

        if (!img.complete || img.naturalWidth === 0) {
            img.removeAttribute('src');
            img.style.visibility = 'hidden';
            return;
        }

        try {
            const pCtx = probeCanvas.getContext('2d');
            pCtx.clearRect(0, 0, 1, 1);
            pCtx.drawImage(img, 0, 0, 1, 1);
            probeCanvas.toDataURL('image/png');
        } catch (taintErr) {
            console.warn('[PDF Exporter] Neutralized untrusted cross-origin image to prevent canvas taint:', src.slice(0, 120));
            img.removeAttribute('src');
            img.style.visibility = 'hidden';
        }
    });
}

// --- 4. Screen Responsiveness, Pin Marker Reconciliation & HTML Compilation ---
function isResponsiveScreenHtml(rawHtml, screenFileName = '') {
    if (typeof window.isResponsiveHtml === 'function') {
        return window.isResponsiveHtml(rawHtml, screenFileName);
    }
    const fn = (screenFileName || '').toLowerCase();
    if (fn.includes('responsive') || fn.includes('admin_pc_scroll') || fn.includes('mobile_compare')) return true;
    if (!rawHtml) return false;
    return rawHtml.includes('pc-browser-frame') ||
           rawHtml.includes('pc-content-area') ||
           rawHtml.includes('frame-column') ||
           rawHtml.includes('full-pc-page') ||
           rawHtml.includes('mobile-compare-page') ||
           rawHtml.includes('mobile-content-area') ||
           rawHtml.includes('template_responsive') ||
           rawHtml.includes('template_admin_pc_scroll');
}

function detectResponsiveContentHeight(rawHtml, descriptions = []) {
    if (!rawHtml) return 0;
    let maxContentH = 0;

    const pcInputMatch = rawHtml.match(/pc-height-input[^>]*value=["'](\d+)["']/i);
    if (pcInputMatch) {
        const v = parseInt(pcInputMatch[1], 10);
        if (v > maxContentH) maxContentH = v;
    }
    const mobInputMatch = rawHtml.match(/mobile-height-input[^>]*value=["'](\d+)["']/i);
    if (mobInputMatch) {
        const v = parseInt(mobInputMatch[1], 10);
        if (v > maxContentH) maxContentH = v;
    }

    const innerMinHeights = rawHtml.matchAll(/(?:pc-content-inner|mobile-content-inner)[^>]*style=["'][^"']*min-height:\s*([\d.]+)px/gi);
    for (const m of innerMinHeights) {
        const v = parseFloat(m[1]);
        if (v > maxContentH) maxContentH = v;
    }

    const styleMatches = rawHtml.matchAll(/style=["']([^"']*top:\s*[\d.]+px[^"']*)["']/gi);
    for (const s of styleMatches) {
        const str = s[1];
        const topM = str.match(/top:\s*([\d.]+)px/i);
        if (topM) {
            const topVal = parseFloat(topM[1]) || 0;
            const hM = str.match(/height:\s*([\d.]+)px/i);
            const hVal = hM ? (parseFloat(hM[1]) || 0) : 30;
            if (topVal + hVal > maxContentH) {
                maxContentH = topVal + hVal;
            }
        }
    }

    if (Array.isArray(descriptions)) {
        descriptions.forEach((item) => {
            if (!item || !item.pins) return;
            ['pc', 'mobile', 'left', 'right'].forEach((k) => {
                const py = parseFloat(item.pins[k]?.y);
                if (!isNaN(py) && py + 40 > maxContentH) {
                    maxContentH = py + 40;
                }
            });
        });
    }

    return Math.round(maxContentH);
}

async function ensureResponsiveStylesLoaded() {
    if (window.responsiveFrameStyles && window.responsiveFrameStyles.trim().length > 0) {
        return window.responsiveFrameStyles;
    }
    try {
        const res = await fetch('assets/responsive_frame.css?t=' + Date.now());
        if (res.ok) {
            window.responsiveFrameStyles = await res.text();
            return window.responsiveFrameStyles;
        }
    } catch (e) {
        console.warn('[PDF Exporter] Fallback fetch for responsive_frame.css failed:', e);
    }
    return '';
}

function compileScreenHtmlForPdf(rawHtml, screenFileName = '', dynamicContentH = 0) {
    if (!rawHtml) return '';
    let compiled = rawHtml;
    const isResponsive = isResponsiveScreenHtml(compiled, screenFileName);
    const isLongPage = isResponsive && (dynamicContentH > 850);
    const contentH = Math.round(dynamicContentH);
    const frameH = contentH + 38;
    const pageH = frameH + 38 + 24;

    const styleBlock = '<style id="v4-inlined-style">\n' + (window.v4Styles || '') + '\n</style>';
    if (compiled.includes('id="v4-inlined-style"')) {
        compiled = compiled.replace(/<style id="v4-inlined-style">[\s\S]*?<\/style>/i, styleBlock);
    } else if (compiled.includes('</head>')) {
        compiled = compiled.replace('</head>', styleBlock + '\n</head>');
    } else {
        compiled = `<head>${styleBlock}</head>\n` + compiled;
    }

    if (isResponsive && window.responsiveFrameStyles) {
        const responsiveBlock = '<style id="v4-responsive-frame-style">\n' + window.responsiveFrameStyles + '\n</style>';
        compiled = compiled.replace(/<style id="v4-responsive-frame-style">[\s\S]*?<\/style>/gi, '');
        if (compiled.includes('</head>')) {
            compiled = compiled.replace('</head>', responsiveBlock + '\n</head>');
        } else {
            compiled = `<head>${responsiveBlock}</head>\n` + compiled;
        }
    }

    const responsiveOverrides = isResponsive ? `
        html, body {
            background: #0f1115 !important;
            background-color: #0f1115 !important;
            ${isLongPage ? `height: ${pageH}px !important; min-height: ${pageH}px !important; overflow: hidden !important;` : ''}
        }
        .page {
            background: #0f1115 !important;
            background-color: #0f1115 !important;
            ${isLongPage ? `
            height: ${pageH}px !important;
            min-height: ${pageH}px !important;
            align-items: flex-start !important;
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            box-sizing: border-box !important;
            ` : ''}
        }
        ${isLongPage ? `
        .pc-browser-frame, .mobile-frame, .mobile-browser-frame {
            height: ${frameH}px !important;
            min-height: ${frameH}px !important;
        }
        .pc-content-area, .mobile-content, .mobile-content-area {
            height: ${contentH}px !important;
            min-height: ${contentH}px !important;
            overflow: visible !important;
            overflow-y: visible !important;
        }
        .pc-content-inner, .mobile-content-inner {
            min-height: 100% !important;
            height: auto !important;
            background-color: #ffffff !important;
        }
        ` : ''}
        .frame-column .mobile-frame {
            outline: none !important;
            border: 1.6px solid #cbd5e1 !important;
        }
        .frame-label-height-control {
            display: none !important;
        }
        /* Hide only alignment guide overlays; preserve .v4-pin-layer and .pin-marker */
        .v4-responsive-guide-layer, .pc-guide-layer, .mobile-guide-layer {
            display: none !important;
        }
    ` : `
        .mobile-frame {
            background: #ffffff !important;
            background-color: #ffffff !important;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4) !important;
            outline: 8px solid #111111 !important;
            outline-offset: -8px !important;
        }
        .mobile-content {
            background: transparent !important;
        }
    `;

    const pdfCleanOverride = `
    <!-- PDF Exporter Base Fonts & Non-Destructive Clean Overrides -->
    <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style id="pdf-export-clean-overrides">
        /* Hide editor handles & selection adorners while keeping annotation pin badges crisp */
        .selection-box, .resize-handle, .bychoi-delete-trigger, .bychoi-drag-handle, .bychoi-resizer,
        #floating-inspector-card, .smart-guide-line, .bychoi-connector-port, .guide-layer,
        .selection-rect, .selection-overlay, .cell-resizer, #guide-layer,
        .v4-selection-adorner-layer, .v4-selection-adorner, .ql-cursor {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }
        .v4-pin-layer {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: none !important;
            z-index: 250000 !important;
        }
        .pin-marker, .bychoi-component.pin-marker {
            position: absolute !important;
            width: 20px !important;
            height: 20px !important;
            background-color: #ef4444 !important;
            background-image: linear-gradient(135deg, #ef4444, #dc2626) !important;
            color: #ffffff !important;
            border-radius: 50% !important;
            border: 1.5px solid #ffffff !important;
            box-shadow: 0 2px 6px rgba(239, 68, 68, 0.45) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 200000 !important;
            box-sizing: border-box !important;
        }
        .pin-marker .pin-number-badge {
            color: #ffffff !important;
            font-size: 11.5px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            text-align: center !important;
        }
        *, *::before, *::after {
            transition: none !important;
            animation-duration: 0s !important;
        }
        ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }
        ${responsiveOverrides}
        html, body {
            width: 100% !important;
            ${isLongPage ? `height: ${pageH}px !important; min-height: ${pageH}px !important;` : 'height: 100% !important;'}
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    </style>
    `;

    if (compiled.includes('</head>')) {
        compiled = compiled.replace('</head>', pdfCleanOverride + '\n</head>');
    } else {
        compiled = `<head>${pdfCleanOverride}</head>\n` + compiled;
    }

    return compiled;
}

// --- 5. Screen Capture Pipeline & Main PDF Export Orchestrator ---
async function captureScreenCanvasForPdf(rawHtml, screenFileName, projectName, screenContext = {}) {
    const descriptions = Array.isArray(screenContext.descriptions) ? screenContext.descriptions : [];
    const isResponsive = isResponsiveScreenHtml(rawHtml, screenFileName);
    const dynamicContentH = isResponsive ? detectResponsiveContentHeight(rawHtml, descriptions) : 0;
    const isLongPage = isResponsive && (dynamicContentH > 850);

    let screenW = 1600;
    let screenH = 900;
    if (isLongPage) {
        screenH = Math.round(dynamicContentH + 100);
    } else {
        const sizeRegex = new RegExp("(?:\\.page|\\.artboard)\\s*\\u007B[^\\u007D]*width:\\s*(\\d+)px[^\\u007D]*height:\\s*(\\d+)px", "i");
        const sizeMatch = rawHtml.match(sizeRegex);
        if (sizeMatch) {
            screenW = parseInt(sizeMatch[1], 10) || 1600;
            screenH = parseInt(sizeMatch[2], 10) || 900;
        } else {
            const wRegex = new RegExp("(?:\\.page|\\.artboard)\\s*\\u007B[^\\u007D]*width:\\s*(\\d+)px", "i");
            const wMatch = rawHtml.match(wRegex);
            if (wMatch) screenW = parseInt(wMatch[1], 10) || 1600;
        }
    }

    const inlinedHtml = await inlineScreenAssetsForPdf(rawHtml, projectName);
    const compiledHtml = compileScreenHtmlForPdf(inlinedHtml, screenFileName, dynamicContentH);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: ${screenW}px;
        height: ${screenH}px;
        border: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        z-index: 1;
        opacity: 0.001;
        pointer-events: none;
    `;
    document.body.appendChild(iframe);

    let screenCanvas = null;
    let renderScale = 2;

    try {
        await new Promise((resolve) => {
            iframe.onload = () => resolve();
            iframe.srcdoc = compiledHtml;
        });

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const targetEl = iframeDoc.documentElement || iframeDoc.body;

        // Reconcile numbered Pin Badges (1..N) onto screen DOM from metadata.json description SSOT
        reconcilePinsInPdfDom(iframeDoc, descriptions, isResponsive);

        try {
            if (iframeDoc.fonts && typeof iframeDoc.fonts.ready?.then === 'function') {
                await Promise.race([
                    iframeDoc.fonts.ready,
                    new Promise(r => setTimeout(r, 2000))
                ]);
            }
        } catch (fontErr) {
            console.warn('[PDF Exporter] Font ready wait warning:', fontErr);
        }

        const imgs = Array.from(iframeDoc.querySelectorAll('img'));
        if (imgs.length > 0) {
            await Promise.all(imgs.map(img => {
                if (img.complete) {
                    return (typeof img.decode === 'function') ? img.decode().catch(() => {}) : Promise.resolve();
                }
                return new Promise(r => {
                    img.onload = () => {
                        if (typeof img.decode === 'function') img.decode().catch(() => {}).then(r);
                        else r();
                    };
                    img.onerror = r;
                    setTimeout(r, 2000);
                });
            }));
        }

        // Prevent any un-inlined cross-origin or local file:// image from tainting the canvas
        _guardUntaintedDomImages(iframeDoc);

        if (isResponsive) {
            try {
                const pcInner = iframeDoc.querySelector('.pc-content-inner') || iframeDoc.querySelector('.pc-content-area');
                const mobInner = iframeDoc.querySelector('.mobile-content-inner') || iframeDoc.querySelector('.mobile-content');
                let actualDomH = 0;
                if (pcInner) actualDomH = Math.max(actualDomH, pcInner.scrollHeight || 0, pcInner.offsetHeight || 0);
                if (mobInner) actualDomH = Math.max(actualDomH, mobInner.scrollHeight || 0, mobInner.offsetHeight || 0);

                if (actualDomH > 850 && actualDomH > dynamicContentH) {
                    const newScreenH = Math.round(actualDomH + 100);
                    if (newScreenH > screenH) {
                        screenH = newScreenH;
                        iframe.style.height = `${screenH}px`;
                        const pageEl = iframeDoc.querySelector('.page');
                        if (pageEl) {
                            pageEl.style.height = `${screenH}px`;
                            pageEl.style.minHeight = `${screenH}px`;
                        }
                    }
                }
            } catch (domMeasureErr) {
                console.warn('[PDF Exporter] DOM measurement fallback warning:', domMeasureErr);
            }
        }

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise(r => setTimeout(r, 180));

        const computedBodyBg = iframeDoc.defaultView?.getComputedStyle(iframeDoc.body)?.backgroundColor;
        const computedHtmlBg = iframeDoc.defaultView?.getComputedStyle(iframeDoc.documentElement)?.backgroundColor;
        let targetBg = '#ffffff';
        if (isResponsive) {
            targetBg = '#0f1115';
        } else if (computedBodyBg && computedBodyBg !== 'rgba(0, 0, 0, 0)' && computedBodyBg !== 'transparent') {
            targetBg = computedBodyBg;
        } else if (computedHtmlBg && computedHtmlBg !== 'rgba(0, 0, 0, 0)' && computedHtmlBg !== 'transparent') {
            targetBg = computedHtmlBg;
        }

        renderScale = screenH > 2200 ? 1.5 : 2;

        screenCanvas = await html2canvas(targetEl, {
            scale: renderScale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: targetBg,
            logging: false,
            width: screenW,
            height: screenH,
            windowWidth: screenW,
            windowHeight: screenH,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0
        });
    } finally {
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
    }

    if (descriptions.length > 0 && screenCanvas) {
        const { descCanvas, descW, descH } = await renderDescriptionPanelCanvasForPdf(
            descriptions,
            screenContext,
            screenH,
            renderScale
        );
        return compositeScreenAndDescriptionCanvas(
            screenCanvas,
            screenW,
            screenH,
            descCanvas,
            descW,
            descH,
            renderScale
        );
    }

    return { canvas: screenCanvas, screenW, screenH };
}

async function exportProjectToPDF(projectName, projectMeta = null) {
    if (!projectName) {
        showPdfAlert('프로젝트명이 지정되지 않았습니다.', '알림', 'warning');
        return;
    }

    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
        showPdfAlert('PDF 생성 라이브러리가 로드되지 않았습니다. 페이지를 새로고침 후 다시 시도해 주세요.', '오류', 'error');
        return;
    }

    showPdfProgressModal(projectName);

    try {
        await ensureResponsiveStylesLoaded();

        let meta = projectMeta;
        if (!meta || !meta.screens || Object.keys(meta.screens).length === 0) {
            updatePdfProgress(5, '프로젝트 상세 정보를 확인하는 중...');
            meta = await fetchProjectMetadataForPdf(projectName);
        }

        const screensObj = meta.screens || meta.files || {};
        const screenFiles = Object.keys(screensObj);

        const order = Array.isArray(meta.screenOrder) ? meta.screenOrder : [];
        if (order.length > 0) {
            screenFiles.sort((a, b) => {
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b, undefined, { numeric: true });
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        } else {
            screenFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        }

        if (screenFiles.length === 0) {
            hidePdfProgressModal();
            showPdfAlert('해당 프로젝트에 포함된 스크린이 없습니다.', '알림', 'warning');
            return;
        }

        const projectTitle = meta.title || projectName;
        updatePdfProgress(10, `프로젝트 (${screenFiles.length}개 스크린) 변환을 시작합니다...`);

        const { jsPDF } = window.jspdf;
        let pdf = null;
        let processedCount = 0;

        for (let i = 0; i < screenFiles.length; i++) {
            const screenFileName = screenFiles[i];
            const screenInfo = screensObj[screenFileName] || {};
            const screenTitle = screenInfo.title || screenFileName.replace('.html', '');
            const descriptions = normalizeScreenDescriptions(screenInfo);

            const percent = Math.round(10 + ((i + 1) / screenFiles.length) * 85);
            const descStatusSuffix = descriptions.length > 0 ? ` + Description ${descriptions.length}건` : '';
            updatePdfProgress(percent, `스크린 렌더링 중... (${i + 1}/${screenFiles.length}: ${screenTitle}${descStatusSuffix})`);

            let rawHtml = await fetchScreenHtmlForPdf(projectName, screenFileName);
            if (!rawHtml) {
                console.warn(`[PDF Exporter] Skipping screen (content empty): ${screenFileName}`);
                continue;
            }

            if (typeof window.syncCoverMetadata === 'function' && (screenInfo.type === 'cover' || rawHtml.includes('cover-version'))) {
                try {
                    rawHtml = window.syncCoverMetadata(rawHtml, meta, false, screenFileName);
                } catch (coverErr) {}
            }

            const captureResult = await captureScreenCanvasForPdf(rawHtml, screenFileName, projectName, {
                descriptions,
                screenTitle,
                screenIndex: i + 1,
                totalScreens: screenFiles.length
            });
            if (!captureResult || !captureResult.canvas) continue;

            const { canvas, screenW, screenH } = captureResult;
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const orientation = screenW >= screenH ? 'landscape' : 'portrait';

            if (!pdf) {
                pdf = new jsPDF({
                    orientation,
                    unit: 'px',
                    format: [screenW, screenH],
                    compress: true
                });
            } else if (processedCount > 0) {
                pdf.addPage([screenW, screenH], orientation);
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, screenW, screenH);
            processedCount++;
        }

        if (processedCount === 0) {
            hidePdfProgressModal();
            showPdfAlert('스크린 렌더링에 실패하였습니다.', '오류', 'error');
            return;
        }

        updatePdfProgress(98, 'PDF 저장 중...');

        const cleanName = projectTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
        const outputFilename = `${cleanName}_Screens.pdf`;

        pdf.save(outputFilename);

        setTimeout(() => {
            hidePdfProgressModal();
        }, 600);
    } catch (err) {
        console.error('[PDF Exporter] Error during PDF generation:', err);
        hidePdfProgressModal();
        showPdfAlert('PDF 생성 도중 오류가 발생했습니다: ' + err.message, 'PDF 생성 오류', 'error');
    } finally {
        _pdfAssetDataUrlCache.clear();
    }
}
