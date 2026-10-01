const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const inspectorDir = path.join(assetsDir, 'inspector');
const scriptsDir = path.join(rootDir, 'scripts');
const uiLibDir = path.join(assetsDir, 'ui_library');
const templatesDir = path.join(assetsDir, 'templates');

console.log('================================================================');
console.log('       SYSTEM COMPREHENSIVE DEEP DIAGNOSIS REPORT ENGINE        ');
console.log('================================================================\n');

// Helper to recursively collect files
function getAllFiles(dir, exts = ['.js', '.css', '.html', '.json', '.ps1']) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            if (item.name === '.git' || item.name === 'node_modules' || item.name === 'data') continue;
            files = files.concat(getAllFiles(fullPath, exts));
        } else {
            if (exts.includes(path.extname(item.name).toLowerCase())) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

const allAssetJs = getAllFiles(assetsDir, ['.js']);
const allAssetCss = getAllFiles(assetsDir, ['.css']);
const allAssetHtml = getAllFiles(assetsDir, ['.html']);

// -------------------------------------------------------------
// [GATEWAY 1] JS V8 SYNTAX & VM COMPILATION VALIDATION
// -------------------------------------------------------------
console.log('[SECTION 1] V8 Syntax & VM Compilation Validation (All JS Files)');
let syntaxErrors = [];
for (const f of allAssetJs) {
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const code = fs.readFileSync(f, 'utf8');
    try {
        new vm.Script(code);
    } catch (err) {
        syntaxErrors.push({ file: rel, error: err.message, stack: err.stack });
    }
}
if (syntaxErrors.length === 0) {
    console.log(`  -> [PASS] All ${allAssetJs.length} JavaScript files passed pure V8 script compilation. 0 Syntax Errors.`);
} else {
    console.log(`  -> [FAIL] Syntax errors detected in ${syntaxErrors.length} files:`);
    syntaxErrors.forEach(e => console.log(`     * ${e.file}: ${e.error}`));
}

// -------------------------------------------------------------
// [CRITERION 1] HEAVY FILES REQUIRING SPLIT (> 35KB or > 800 lines)
// -------------------------------------------------------------
console.log('\n[SECTION 2] Heavy Files Requiring Separation (Criterion 1)');
const fileStats = [];
for (const f of allAssetJs) {
    const stat = fs.statSync(f);
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n').length;
    fileStats.push({
        file: path.relative(rootDir, f).replace(/\\/g, '/'),
        basename: path.basename(f),
        sizeKb: parseFloat((stat.size / 1024).toFixed(1)),
        bytes: stat.size,
        lines: lines
    });
}
fileStats.sort((a, b) => b.bytes - a.bytes);

const splitCandidates = fileStats.filter(f => {
    // Exclude pre-compiled bundles like templates.js, ui_library_fallback.js
    if (f.basename === 'templates.js' || f.basename === 'ui_library_fallback.js') return false;
    return f.sizeKb >= 35 || f.lines >= 750;
});

splitCandidates.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.file} [${c.sizeKb} KB, ${c.lines} lines]`);
});

// -------------------------------------------------------------
// [CRITERION 2] UNREFERENCED / DEAD CODE CANDIDATES
// -------------------------------------------------------------
console.log('\n[SECTION 3] Unreferenced / Orphan Source Code (Criterion 2)');
const viewerHtmlPath = path.join(rootDir, 'viewer.html');
const viewerContent = fs.readFileSync(viewerHtmlPath, 'utf8');
const indexHtmlPath = path.join(rootDir, 'index.html');
const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
const vctrlCorePath = path.join(assetsDir, 'vctrl_core.js');
const vctrlCoreContent = fs.readFileSync(vctrlCorePath, 'utf8');

const unreferencedFiles = [];
for (const f of allAssetJs) {
    const basename = path.basename(f);
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const inViewer = viewerContent.includes(basename);
    const inIndex = indexContent.includes(basename);
    const inCore = vctrlCoreContent.includes(basename);
    const isBuildArtifact = basename === 'templates.js' || basename === 'ui_library_fallback.js';

    let inOtherFiles = false;
    for (const other of allAssetJs) {
        if (other === f) continue;
        const code = fs.readFileSync(other, 'utf8');
        if (code.includes(basename)) {
            inOtherFiles = true;
            break;
        }
    }

    if (!inViewer && !inIndex && !inCore && !isBuildArtifact && !inOtherFiles) {
        unreferencedFiles.push({ file: rel, sizeKb: (fs.statSync(f).size / 1024).toFixed(1) });
    }
}
if (unreferencedFiles.length === 0) {
    console.log('  -> [PASS] No unreferenced or orphan JavaScript files found.');
} else {
    unreferencedFiles.forEach(u => console.log(`  * [ORPHAN] ${u.file} (${u.sizeKb} KB)`));
}

// -------------------------------------------------------------
// [CRITERION 3] DUPLICATE CODE ACROSS MULTIPLE FILES (Commonization)
// -------------------------------------------------------------
console.log('\n[SECTION 4] Duplicate Logic Across Multiple Files (Criterion 3)');
const fnRegistry = new Map();
const fnRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
for (const f of allAssetJs) {
    const basename = path.basename(f);
    if (basename === 'templates.js' || basename === 'ui_library_fallback.js') continue;
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    let m;
    while ((m = fnRegex.exec(content)) !== null) {
        const fnName = m[1];
        if (['init', 'render', 'close', 'open', 'update', 'show', 'hide', 'get', 'set'].includes(fnName)) continue;
        if (fnName.length < 5) continue;
        if (!fnRegistry.has(fnName)) fnRegistry.set(fnName, []);
        fnRegistry.get(fnName).push(rel);
    }
}

const duplicates = [];
for (const [fnName, files] of fnRegistry.entries()) {
    const uniq = [...new Set(files)];
    if (uniq.length > 1) {
        duplicates.push({ fnName, count: uniq.length, files: uniq });
    }
}
duplicates.sort((a, b) => b.count - a.count);
duplicates.slice(0, 15).forEach(d => {
    console.log(`  * Function '${d.fnName}' implemented in ${d.count} files: ${d.files.join(', ')}`);
});

// -------------------------------------------------------------
// [CRITERION 4] HIGH COMPLEXITY / OVERSIZED FUNCTIONS
// -------------------------------------------------------------
console.log('\n[SECTION 5] High Complexity / Oversized Functions (> 150 lines) (Criterion 4)');
const hugeFns = [];
for (const f of allAssetJs) {
    const basename = path.basename(f);
    if (basename === 'templates.js' || basename === 'ui_library_fallback.js') continue;
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const lines = content.split('\n');
    let currentFn = null;
    let braceDepth = 0;
    let startLine = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/(?:function\s+([a-zA-Z0-9_$]+)|([a-zA-Z0-9_$]+)\s*[:=]\s*function\b|window\.([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?function)/);
        if (match && braceDepth === 0) {
            currentFn = match[1] || match[2] || match[3] || 'anonymous';
            startLine = i + 1;
        }
        for (let c of line) {
            if (c === '{') braceDepth++;
            if (c === '}') {
                braceDepth--;
                if (braceDepth === 0 && currentFn) {
                    const fnLen = (i + 1) - startLine;
                    if (fnLen > 150) {
                        hugeFns.push({ file: rel, fnName: currentFn, lines: fnLen, start: startLine, end: i + 1 });
                    }
                    currentFn = null;
                }
            }
        }
    }
}
hugeFns.sort((a, b) => b.lines - a.lines);
hugeFns.slice(0, 15).forEach((h, idx) => {
    console.log(`  ${idx + 1}. ${h.file} :: ${h.fnName}() -> ${h.lines} lines (L${h.start}-L${h.end})`);
});

// -------------------------------------------------------------
// [CRITERION 5] RULE & SKILL ALIGNMENT AUDIT
// -------------------------------------------------------------
console.log('\n[SECTION 6] Rules & Skills Architecture Alignment (Criterion 5)');
const agentsMdPath = path.join(rootDir, 'AGENTS.md');
const agentsContent = fs.readFileSync(agentsMdPath, 'utf8');
const missingInAgents = [];
for (const f of allAssetJs) {
    const basename = path.basename(f);
    if (basename === 'templates.js' || basename === 'ui_library_fallback.js') continue;
    if (!agentsContent.includes(basename)) {
        missingInAgents.push(path.relative(rootDir, f).replace(/\\/g, '/'));
    }
}
console.log(`  * Modules active in assets/ but missing in AGENTS.md modular architecture definition (${missingInAgents.length} files):`);
missingInAgents.forEach(m => console.log(`    - ${m}`));

// -------------------------------------------------------------
// [CRITERION 6] OTHER SYSTEM IMPROVEMENTS (Build Sync, CSS, etc.)
// -------------------------------------------------------------
console.log('\n[SECTION 7] Build Sync & Environment Verification (Criterion 6)');
const templatesJsPath = path.join(assetsDir, 'templates.js');
const uiFallbackJsPath = path.join(assetsDir, 'ui_library_fallback.js');

let tplStatus = 'UP TO DATE';
if (fs.existsSync(templatesJsPath)) {
    const statT = fs.statSync(templatesJsPath);
    let latestMtime = 0;
    for (const tf of fs.readdirSync(templatesDir)) {
        const mt = fs.statSync(path.join(templatesDir, tf)).mtimeMs;
        if (mt > latestMtime) latestMtime = mt;
    }
    if (latestMtime > statT.mtimeMs) tplStatus = 'OUTDATED - Needs scripts/build_templates.ps1';
}
console.log(`  * templates.js offline bundle: [${tplStatus}]`);

let uiStatus = 'UP TO DATE';
if (fs.existsSync(uiFallbackJsPath)) {
    const statU = fs.statSync(uiFallbackJsPath);
    let latestMtime = 0;
    for (const uf of fs.readdirSync(uiLibDir)) {
        const mt = fs.statSync(path.join(uiLibDir, uf)).mtimeMs;
        if (mt > latestMtime) latestMtime = mt;
    }
    if (latestMtime > statU.mtimeMs) uiStatus = 'OUTDATED - Needs scripts/build_ui_fallback.ps1';
}
console.log(`  * ui_library_fallback.js offline bundle: [${uiStatus}]`);

console.log('\n================================================================');
console.log('              DIAGNOSIS ENGINE COMPLETED SUCCESSFULLY           ');
console.log('================================================================');
