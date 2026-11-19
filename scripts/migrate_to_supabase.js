/**
 * scripts/migrate_to_supabase.js
 * One-time zero-loss migration of local data/ projects, screens, annotation pins,
 * revision histories, global components, standalone images, and inline Base64 images
 * into Supabase (workspace schema + workspace-assets Storage bucket).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPABASE_URL = 'https://cxgvharfkzdqiiquroqz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_N5Xy5DP47wg4vOuK9Vu1Yg_crTzHNpH';
const BUCKET_NAME = 'workspace-assets';
const DATA_DIR = path.resolve(__dirname, '..', 'data');

const AUTH_EMAIL = process.env.WS_ADMIN_EMAIL || 'bychoi@workspace.local';
const AUTH_PASSWORD = process.env.WS_ADMIN_PASSWORD || '';
const PROJECT_FILTER = process.env.WS_PROJECT_FILTER
    ? new Set(process.env.WS_PROJECT_FILTER.split(',').map(s => s.trim()).filter(Boolean))
    : null;

// Legacy lf- / LF_ -> bychoi- / BYCHOI_ upgrader (identical to assets/app.js)
const _LEGACY_PFX_L = String.fromCharCode(108, 102);
const _LEGACY_PFX_U = String.fromCharCode(76, 70);
const _LEGACY_SUFFIXES = [
    'components', 'component', 'in-group', 'group', 'icon-my', 'icon', 'rv-my',
    'connector-port', 'drag-handle', 'resizer', 'delete-trigger',
    'color-palette-popup', 'palette-custom-btn', 'palette-grid', 'palette-swatch',
    'fade-in-scale', 'spin', 'canvas'
];
const _LEGACY_RULES = _LEGACY_SUFFIXES.map(sfx => ({
    re: new RegExp('(?<![A-Za-z0-9-])' + _LEGACY_PFX_L + '-' + sfx + '(?![A-Za-z0-9-])', 'g'),
    to: 'bychoi-' + sfx
}));
const _LEGACY_COMP_ID_RE = new RegExp('(?<![A-Za-z0-9])' + _LEGACY_PFX_L + '-comp-([0-9_]*)', 'g');
const _LEGACY_IPC_RE = new RegExp('(?<![A-Za-z0-9_])' + _LEGACY_PFX_U + '_([A-Z0-9_]+)', 'g');

function upgradeBychoiMarkupNamespace(raw) {
    if (typeof raw !== 'string' || raw.length === 0) return raw;
    if (raw.indexOf(_LEGACY_PFX_L + '-') === -1 && raw.indexOf(_LEGACY_PFX_U + '_') === -1) {
        return raw;
    }
    const b64Store = [];
    let text = raw.replace(/data:[a-zA-Z0-9/+\.-]+;base64,[A-Za-z0-9+/=]+/g, m => {
        const idx = b64Store.length;
        b64Store.push(m);
        return '\x00B64_' + idx + '\x00';
    });
    for (let i = 0; i < _LEGACY_RULES.length; i++) {
        text = text.replace(_LEGACY_RULES[i].re, _LEGACY_RULES[i].to);
    }
    text = text.replace(_LEGACY_COMP_ID_RE, 'bychoi-comp-$1');
    text = text.replace(_LEGACY_IPC_RE, 'BYCHOI_$1');
    if (b64Store.length > 0) {
        text = text.replace(/\x00B64_(\d+)\x00/g, (_, idxStr) => b64Store[Number(idxStr)]);
    }
    return text;
}

function getMimeInfo(extOrSubtype) {
    const k = String(extOrSubtype || '').toLowerCase().replace(/^\./, '');
    if (k === 'png') return { ext: 'png', mime: 'image/png' };
    if (k === 'jpg' || k === 'jpeg') return { ext: 'jpg', mime: 'image/jpeg' };
    if (k === 'webp') return { ext: 'webp', mime: 'image/webp' };
    if (k === 'gif') return { ext: 'gif', mime: 'image/gif' };
    if (k === 'svg' || k === 'svg+xml') return { ext: 'svg', mime: 'image/svg+xml' };
    return { ext: 'png', mime: 'image/png' };
}

async function signIn() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD })
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Sign-in failed (${res.status}): ${txt}`);
    }
    const data = await res.json();
    if (!data.access_token) throw new Error('No access_token returned from sign-in.');
    return data.access_token;
}

async function rpc(token, fnName, params) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params || {})
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`RPC ${fnName} failed (${res.status}): ${text}`);
    }
    try { return JSON.parse(text); } catch (_) { return text; }
}

const uploadedAssetMap = new Map(); // sha256 -> publicUrl
const standaloneRefMap = new Map(); // normalized key -> publicUrl
const uploadedStoragePaths = new Set();

async function uploadBufferToStorage(token, storagePath, buffer, mimeType, sha256, projectSlug) {
    const encodedPath = storagePath.split('/').map(seg => encodeURIComponent(seg)).join('/');
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${encodedPath}`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${encodedPath}`;

    if (!uploadedStoragePaths.has(storagePath)) {
        const res = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${token}`,
                'Content-Type': mimeType,
                'x-upsert': 'true',
                'cache-control': '31536000'
            },
            body: buffer
        });
        if (!res.ok) {
            const errTxt = await res.text();
            throw new Error(`Storage upload failed for ${storagePath} (${res.status}): ${errTxt}`);
        }
        uploadedStoragePaths.add(storagePath);

        await rpc(token, 'ws_upsert_media_asset', {
            p_sha256: sha256,
            p_project_slug: projectSlug || null,
            p_storage_path: storagePath,
            p_public_url: publicUrl,
            p_mime_type: mimeType,
            p_byte_size: buffer.length
        });
    }
    return publicUrl;
}

async function uploadStandaloneImages(token) {
    const imgExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
    const dirs = fs.readdirSync(DATA_DIR).filter(d => fs.statSync(path.join(DATA_DIR, d)).isDirectory() && (!PROJECT_FILTER || PROJECT_FILTER.has(d)));
    let count = 0;

    function walk(dirPath, projSlug) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const ent of entries) {
            const full = path.join(dirPath, ent.name);
            if (ent.isDirectory()) {
                walk(full, projSlug);
            } else {
                const ext = path.extname(ent.name).toLowerCase();
                if (imgExts.has(ext)) {
                    const relToProj = path.relative(path.join(DATA_DIR, projSlug), full).replace(/\\/g, '/');
                    const storagePath = `projects/${projSlug}/${relToProj}`;
                    const buf = fs.readFileSync(full);
                    const sha = crypto.createHash('sha256').update(buf).digest('hex');
                    const { mime } = getMimeInfo(ext);
                    standaloneTasks.push({ projSlug, relToProj, storagePath, buf, mime, sha });
                }
            }
        }
    }

    const standaloneTasks = [];
    for (const d of dirs) {
        walk(path.join(DATA_DIR, d), d);
    }

    for (const t of standaloneTasks) {
        const publicUrl = await uploadBufferToStorage(token, t.storagePath, t.buf, t.mime, t.sha, t.projSlug);
        standaloneRefMap.set(`data/${t.projSlug}/${t.relToProj}`, publicUrl);
        standaloneRefMap.set(`${t.projSlug}::${t.relToProj}`, publicUrl);
        count++;
        console.log(`  [Image] Uploaded standalone: ${t.storagePath} (${t.buf.length} bytes)`);
    }
    return count;
}

async function processHtmlAssets(token, rawHtml, projSlug) {
    if (!rawHtml || typeof rawHtml !== 'string') return { html: rawHtml || '', extracted: 0 };

    let html = upgradeBychoiMarkupNamespace(rawHtml);

    // 1. Replace standalone project relative paths
    for (const [key, publicUrl] of standaloneRefMap.entries()) {
        if (key.startsWith('data/')) {
            if (html.indexOf(key) !== -1) {
                html = html.split(key).join(publicUrl);
            }
        } else if (projSlug && key.startsWith(`${projSlug}::`)) {
            const rel = key.slice(projSlug.length + 2);
            if (html.indexOf(rel) !== -1) {
                // Replace exact relative refs like src="images/foo.png" or src="./images/foo.png"
                const escapedRel = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const relRe = new RegExp(`(["'(])(?:\\.\\/)?${escapedRel}(["')])`, 'g');
                html = html.replace(relRe, `$1${publicUrl}$2`);
            }
        }
    }

    // 2. Extract raster Base64 images (>= 2048 base64 chars)
    const b64Re = /data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)/gi;
    const matches = [];
    let m;
    while ((m = b64Re.exec(html)) !== null) {
        if (m[2].length >= 2048) {
            matches.push({ full: m[0], subtype: m[1], b64: m[2] });
        }
    }

    if (matches.length === 0) {
        return { html, extracted: 0 };
    }

    const replacements = new Map();
    let extracted = 0;

    for (const item of matches) {
        if (replacements.has(item.full)) continue;
        const buf = Buffer.from(item.b64, 'base64');
        const sha = crypto.createHash('sha256').update(buf).digest('hex');
        let publicUrl = uploadedAssetMap.get(sha);
        if (!publicUrl) {
            const { ext, mime } = getMimeInfo(item.subtype);
            const storagePath = `shared/${sha}.${ext}`;
            publicUrl = await uploadBufferToStorage(token, storagePath, buf, mime, sha, projSlug);
            uploadedAssetMap.set(sha, publicUrl);
            extracted++;
        }
        replacements.set(item.full, publicUrl);
    }

    for (const [dataUri, publicUrl] of replacements.entries()) {
        html = html.split(dataUri).join(publicUrl);
    }

    return { html, extracted };
}

function getLatestScreenTimestamp(meta) {
    let latestMs = 0;
    const screens = (meta && (meta.screens || meta.files)) || {};
    for (const key of Object.keys(screens)) {
        const ts = screens[key] && screens[key].updatedAt ? Date.parse(screens[key].updatedAt) : NaN;
        if (!isNaN(ts) && ts > latestMs) latestMs = ts;
    }
    return latestMs > 0 ? new Date(latestMs).toISOString() : new Date().toISOString();
}

async function migrateAllProjects(token) {
    const dirs = fs.readdirSync(DATA_DIR)
        .filter(d => fs.statSync(path.join(DATA_DIR, d)).isDirectory() && (!PROJECT_FILTER || PROJECT_FILTER.has(d)))
        .sort();

    let totalProjects = 0;
    let totalScreens = 0;
    let totalPins = 0;
    let totalHistories = 0;
    let totalExtractedB64 = 0;

    for (const slug of dirs) {
        const projDir = path.join(DATA_DIR, slug);
        const metaPath = path.join(projDir, 'metadata.json');
        let meta = {};
        if (fs.existsSync(metaPath)) {
            const rawMeta = upgradeBychoiMarkupNamespace(fs.readFileSync(metaPath, 'utf8'));
            meta = JSON.parse(rawMeta);
        }

        meta.title = meta.title || slug;
        meta.screens = meta.screens || meta.files || {};
        if (!Array.isArray(meta.screenOrder)) {
            meta.screenOrder = Object.keys(meta.screens);
        }

        const diskHtmlFiles = fs.readdirSync(projDir).filter(f => f.endsWith('.html')).sort();

        // Register any unregistered .html files on disk (e.g., p_o0cbc/00_Cover_428.html)
        for (const hf of diskHtmlFiles) {
            if (!meta.screens[hf]) {
                const stat = fs.statSync(path.join(projDir, hf));
                const isCover = /^00_cover/i.test(hf);
                meta.screens[hf] = {
                    title: isCover ? '과제 커버' : hf.replace(/\.html$/i, ''),
                    type: isCover ? 'cover' : 'default',
                    updatedAt: stat.mtime.toISOString(),
                    description: [],
                    connectors: []
                };
            }
            if (!meta.screenOrder.includes(hf)) {
                if (/^00_cover/i.test(hf)) {
                    meta.screenOrder.unshift(hf);
                } else {
                    meta.screenOrder.push(hf);
                }
            }
        }

        // Normalize screenDesc & count pins
        let projPins = 0;
        for (const fn of Object.keys(meta.screens)) {
            const sc = meta.screens[fn];
            if (!sc || typeof sc !== 'object') continue;
            if (typeof sc.screenDesc !== 'string') sc.screenDesc = '';
            if (Array.isArray(sc.description)) {
                projPins += sc.description.length;
            }
        }
        meta.updatedAt = getLatestScreenTimestamp(meta);

        // Save project + screen metadata + annotation pins
        await rpc(token, 'ws_save_project_metadata', { p_slug: slug, p_metadata: meta });
        totalProjects++;
        totalPins += projPins;

        // Upload each HTML screen (preserving metadata timestamps)
        for (const hf of diskHtmlFiles) {
            const rawHtml = fs.readFileSync(path.join(projDir, hf), 'utf8');
            const { html, extracted } = await processHtmlAssets(token, rawHtml, slug);
            totalExtractedB64 += extracted;
            const scMeta = meta.screens[hf] || {};
            await rpc(token, 'ws_upsert_screen_html', {
                p_slug: slug,
                p_filename: hf,
                p_html: html,
                p_meta: {
                    title: scMeta.title || hf,
                    type: scMeta.type || 'default',
                    template: scMeta.template || '',
                    version: scMeta.version !== undefined ? scMeta.version : null,
                    updatedAt: scMeta.updatedAt || meta.updatedAt
                }
            });
            totalScreens++;
        }

        // Upload history.json
        const histPath = path.join(projDir, 'history.json');
        if (fs.existsSync(histPath)) {
            const hist = JSON.parse(fs.readFileSync(histPath, 'utf8'));
            if (Array.isArray(hist) && hist.length > 0) {
                await rpc(token, 'ws_save_project_history', { p_slug: slug, p_entries: hist });
                totalHistories += hist.length;
            }
        }

        console.log(`  [Project] ${slug}: ${diskHtmlFiles.length} screens, ${projPins} pins migrated.`);
    }

    return { totalProjects, totalScreens, totalPins, totalHistories, totalExtractedB64 };
}

async function migrateGlobalComponents(token) {
    const gcPath = path.join(DATA_DIR, 'global_components.json');
    if (!fs.existsSync(gcPath)) return 0;
    const raw = upgradeBychoiMarkupNamespace(fs.readFileSync(gcPath, 'utf8'));
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return 0;

    for (const item of list) {
        if (item.html) {
            const res = await processHtmlAssets(token, item.html, null);
            item.html = res.html;
        }
        if (item.previewHtml) {
            const res = await processHtmlAssets(token, item.previewHtml, null);
            item.previewHtml = res.html;
        }
    }

    await rpc(token, 'ws_save_global_components', { p_components: list });
    console.log(`  [GlobalComponents] Migrated ${list.length} components.`);
    return list.length;
}

async function main() {
    console.log('=== Starting Supabase Workspace Migration ===');
    const token = await signIn();
    console.log('Authenticated as admin.');

    console.log('\n[1/4] Uploading standalone project images...');
    const standaloneCount = await uploadStandaloneImages(token);

    console.log('\n[2/4] Migrating projects, screens, pins, histories, and inline images...');
    const projStats = await migrateAllProjects(token);

    console.log('\n[3/4] Migrating global components...');
    const gcCount = PROJECT_FILTER ? 0 : await migrateGlobalComponents(token);

    console.log('\n[4/4] Verification summary:');
    console.log(JSON.stringify({
        standaloneImagesUploaded: standaloneCount,
        uniqueBase64ImagesUploaded: uploadedAssetMap.size,
        projectsMigrated: projStats.totalProjects,
        screensMigrated: projStats.totalScreens,
        pinsMigrated: projStats.totalPins,
        historiesMigrated: projStats.totalHistories,
        globalComponentsMigrated: gcCount
    }, null, 2));
}

main().catch(err => {
    console.error('[MIGRATION FAILED]', err);
    process.exit(1);
});
