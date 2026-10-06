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
console.log('\n[SECTION 3] Unreferenced / Orphan Source Code & Assets (Criterion 2)');
const viewerHtmlPath = path.join(rootDir, 'viewer.html');
const viewerContent = fs.readFileSync(viewerHtmlPath, 'utf8');
const indexHtmlPath = path.join(rootDir, 'index.html');
const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
const vctrlCorePath = path.join(assetsDir, 'vctrl_core.js');
const vctrlCoreContent = fs.readFileSync(vctrlCorePath, 'utf8');

// 3.1 JavaScript Orphan check
const unreferencedJs = [];
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
        unreferencedJs.push({ file: rel, sizeKb: (fs.statSync(f).size / 1024).toFixed(1) });
    }
}
if (unreferencedJs.length === 0) {
    console.log('  -> [PASS] No unreferenced or orphan JavaScript files found (0 Orphans).');
} else {
    unreferencedJs.forEach(u => console.log(`  * [ORPHAN JS] ${u.file} (${u.sizeKb} KB)`));
}

// 3.2 CSS Orphan check
const unreferencedCss = [];
for (const f of allAssetCss) {
    const basename = path.basename(f);
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const inViewer = viewerContent.includes(basename);
    const inIndex = indexContent.includes(basename);
    
    // Check if referenced in any other file
    let referenced = false;
    for (const other of allAssetJs) {
        const code = fs.readFileSync(other, 'utf8');
        if (code.includes(basename)) { referenced = true; break; }
    }
    if (!inViewer && !inIndex && !referenced) {
        unreferencedCss.push({ file: rel, sizeKb: (fs.statSync(f).size / 1024).toFixed(1) });
    }
}
if (unreferencedCss.length > 0) {
    console.log(`  * Unlinked / Orphan CSS Files (${unreferencedCss.length} files):`);
    unreferencedCss.forEach(u => console.log(`    - [ORPHAN CSS] ${u.file} (${u.sizeKb} KB)`));
}

// 3.3 Media Assets Orphan check
const allAssetMedia = getAllFiles(assetsDir, ['.png', '.jpg', '.jpeg', '.svg', '.webp']);
const unreferencedMedia = [];
let allSourceText = viewerContent + '\n' + indexContent;
for (const f of allAssetJs.concat(allAssetCss)) {
    allSourceText += '\n' + fs.readFileSync(f, 'utf8');
}
for (const m of allAssetMedia) {
    const basename = path.basename(m);
    const rel = path.relative(rootDir, m).replace(/\\/g, '/');
    if (!allSourceText.includes(basename)) {
        unreferencedMedia.push({ file: rel, sizeKb: (fs.statSync(m).size / 1024).toFixed(1) });
    }
}
if (unreferencedMedia.length > 0) {
    console.log(`  * Unreferenced Media Assets (${unreferencedMedia.length} files, ~${(unreferencedMedia.reduce((a,b)=>a+parseFloat(b.sizeKb),0)/1024).toFixed(1)} MB):`);
    unreferencedMedia.slice(0, 10).forEach(u => console.log(`    - [ORPHAN MEDIA] ${u.file} (${u.sizeKb} KB)`));
    if (unreferencedMedia.length > 10) console.log(`    ... and ${unreferencedMedia.length - 10} more unreferenced media files.`);
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

function findFunctionsAccurately(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fns = [];
    const stack = [];
    let depth = 0;

    const patterns = [
        /function\s+([a-zA-Z0-9_$]+)\s*\(/,
        /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?function\b/,
        /([a-zA-Z0-9_$]+)\s*:\s*(?:async\s*)?function\b/,
        /([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?function\b/,
        /window\.([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?function\b/,
        /(?:async\s+)?([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{/
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        let detected = null;

        for (const p of patterns) {
            const m = line.match(p);
            if (m) {
                const name = m[1];
                if (!['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
                    detected = name;
                    break;
                }
            }
        }

        let inStr = false;
        let strChar = '';
        for (let j = 0; j < line.length; j++) {
            const c = line[j];
            const prev = j > 0 ? line[j - 1] : '';
            if (!inStr && c === '/' && line[j + 1] === '/') break;
            if (!inStr && (c === '"' || c === "'" || c === '`')) {
                inStr = true;
                strChar = c;
            } else if (inStr && c === strChar && prev !== '\\') {
                inStr = false;
            } else if (!inStr) {
                if (c === '{') {
                    depth++;
                    if (detected) {
                        stack.push({ name: detected, start: lineNum, depth });
                        detected = null;
                    }
                } else if (c === '}') {
                    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
                        const top = stack.pop();
                        const len = lineNum - top.start + 1;
                        fns.push({ name: top.name, start: top.start, end: lineNum, lines: len });
                    }
                    depth--;
                }
            }
        }
    }
    return fns;
}

const hugeFns = [];
for (const f of allAssetJs) {
    const basename = path.basename(f);
    if (basename === 'templates.js' || basename === 'ui_library_fallback.js') continue;
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const fns = findFunctionsAccurately(f);
    for (const fn of fns) {
        if (fn.lines >= 150) {
            hugeFns.push({ file: rel, fnName: fn.name, lines: fn.lines, start: fn.start, end: fn.end });
        }
    }
}
hugeFns.sort((a, b) => b.lines - a.lines);
console.log(`  * Total oversized functions (> 150 lines): ${hugeFns.length} functions detected`);
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
if (missingInAgents.length === 0) {
    console.log('  -> [PASS] All active modules are fully documented in AGENTS.md modular architecture definition.');
} else {
    console.log(`  * Modules active in assets/ but missing in AGENTS.md modular architecture definition (${missingInAgents.length} files):`);
    missingInAgents.forEach(m => console.log(`    - ${m}`));
}

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

// Verify static verification script coverage
const checkSyntaxPath = path.join(scriptsDir, 'check_syntax.ps1');
const checkSyntaxContent = fs.readFileSync(checkSyntaxPath, 'utf8');
const missingInCheckSyntax = allAssetJs.filter(f => !checkSyntaxContent.includes(path.basename(f)));
console.log(`  * scripts/check_syntax.ps1 coverage: [${missingInCheckSyntax.length === 0 ? '100% COMPLETE' : 'INCOMPLETE: ' + missingInCheckSyntax.length + ' missing'}]`);

const verifyAllPath = path.join(scriptsDir, 'verify_all.ps1');
const verifyAllContent = fs.readFileSync(verifyAllPath, 'utf8');
const missingInVerifyAll = allAssetJs.filter(f => !verifyAllContent.includes(path.basename(f)));
console.log(`  * scripts/verify_all.ps1 coverage: [${missingInVerifyAll.length === 0 ? '100% COMPLETE' : 'INCOMPLETE: ' + missingInVerifyAll.length + ' missing'}]`);

console.log('\n================================================================');
console.log('              DIAGNOSIS ENGINE COMPLETED SUCCESSFULLY           ');
console.log('================================================================');
