/**
 * scripts/backup_supabase_to_local.js
 * Exports all Workspace data from Supabase (workspace schema) into a timestamped
 * local snapshot directory under C:\ai_work_backups\daily\.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://cxgvharfkzdqiiquroqz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_N5Xy5DP47wg4vOuK9Vu1Yg_crTzHNpH';
const BACKUP_ROOT = 'C:\\ai_work_backups\\daily';

async function rpc(fnName, params) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params || {})
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`RPC ${fnName} failed (${res.status}): ${text}`);
    try { return JSON.parse(text); } catch (_) { return text; }
}

async function main() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const targetDir = path.join(BACKUP_ROOT, `supabase_backup_${stamp}`);
    fs.mkdirSync(targetDir, { recursive: true });

    console.log(`Exporting Supabase workspace data to: ${targetDir}`);

    const globalComponents = await rpc('ws_get_global_components', {});
    fs.writeFileSync(path.join(targetDir, 'global_components.json'), JSON.stringify(globalComponents || [], null, 2), 'utf8');

    const projects = await rpc('ws_list_dashboard_projects', {});
    let screenCount = 0;

    for (const proj of (projects || [])) {
        const slug = proj.name;
        if (!slug) continue;
        const projDir = path.join(targetDir, slug);
        fs.mkdirSync(projDir, { recursive: true });

        const meta = await rpc('ws_get_project_metadata', { p_slug: slug });
        fs.writeFileSync(path.join(projDir, 'metadata.json'), JSON.stringify(meta || {}, null, 2), 'utf8');

        const history = await rpc('ws_get_project_history', { p_slug: slug });
        fs.writeFileSync(path.join(projDir, 'history.json'), JSON.stringify(history || [], null, 2), 'utf8');

        const screensObj = (meta && meta.screens) || {};
        for (const filename of Object.keys(screensObj)) {
            const html = await rpc('ws_get_screen_html', { p_slug: slug, p_filename: filename });
            if (html && html !== '__NOT_FOUND__') {
                fs.writeFileSync(path.join(projDir, filename), html, 'utf8');
                screenCount++;
            }
        }
    }

    console.log(`Backup complete: ${(projects || []).length} projects, ${screenCount} screens, ${(globalComponents || []).length} global components.`);
}

main().catch(err => {
    console.error('[BACKUP FAILED]', err);
    process.exit(1);
});
