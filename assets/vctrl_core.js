/**
 * vctrl_core.js - Central Orchestrator for LF Editor Studio
 * Responsibility: State management, Message routing, Save/Load orchestration.
 */

console.log("%c [VCTRL CORE] Initializing Engine... ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

if (!window.DOM) window.DOM = {};

// 1. Global State Management (SSOT)
window.state = {
    currentProject: null,
    activeFile: null,
    projectMetadata: null,
    globalComponents: [],
    tool: 'select',
    transform: { x: 0, y: 0, scale: 1 },
    debugMode: true,
    isDragging: false,
    draggingPinIndex: null,
    dragLayerRect: null,
    startX: 0, startY: 0,
    screens: [],
    connectors: [],
    get isReadOnly() { return (window.ghConfig && window.ghConfig.isReadOnly) || false; },
    hasUnsavedChanges: false,
    isEditing: false,
    editingIndex: -1
};

// Streamlined Engine Script Assembler
function getInlinedEngineScript() {
    return '<script id="v4-inlined-script">\n' +
        '// Cache Buster Timestamp: ' + Date.now() + '\n' +
        (window.v4TypographyScript || '') + '\n' +
        (window.v4UndoScript || '') + '\n' +
        (window.v4TableScript || '') + '\n' +
        (window.v4TextMeasurerScript || '') + '\n' +
        (window.v4UIAtomsScript || '') + '\n' +
        (window.v4DesignSystemScript || '') + '\n' +
        (window.v4ShortcutsScript || '') + '\n' +
        (window.v4CommonScript || '') + '\n' +
        (window.v4ObjectTextScript || '') + '\n' +
        (window.v4ObjectShapeScript || '') + '\n' +
        (window.v4ObjectTableScript || '') + '\n' +
        (window.v4ObjectConnectorScript || '') + '\n' +
        (window.v4DragResizeScript || '') + '\n' +
        (window.v4PortConnectorScript || '') + '\n' +
        (window.v4GridScript || '') + '\n' +
        (window.v4AccordionScript || '') + '\n' +
        (window.v4ResponsiveSmartGuideScript || '') + '\n' +
        (window.v4ResponsivePinsScript || '') + '\n' +
        (window.v4Script || '') + '\n' +
        (window.v4ResponsiveMultiselectScript || '') + '\n</script>';
}

// --- Core Logic ---
window.loadScreen = async function (fileName) {
    const DOM = window.DOM || {};
    if (state.isEditing && typeof window.closeActiveEditor === 'function') {
        window.closeActiveEditor(true);
    }

    if (typeof window.showLoading === 'function') window.showLoading("Loading: " + fileName);
    if (DOM.placeholder) DOM.placeholder.style.display = 'none';

    const content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        if (DOM.placeholder) DOM.placeholder.style.display = 'flex';
        if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "파일을 불러오지 못했습니다.";
        return;
    }

    let finalContent = content;

    // Inject/Update Styles
    const styleBlock = '<style id="v4-inlined-style">\n' + window.v4Styles + '\n</style>';
    if (finalContent.includes('id="v4-inlined-style"')) {
        finalContent = finalContent.replace(/<style id="v4-inlined-style">[\s\S]*?<\/style>/i, styleBlock);
    } else if (!finalContent.includes('style_v4.css')) {
        finalContent = finalContent.replace('</head>', styleBlock + '\n</head>');
    }

    // Inject Scoped Responsive Frame Styles ONLY into authentic Responsive templates/screens
    const isResponsive = (fileName && fileName.toLowerCase().includes('responsive')) ||
                         content.includes('class="pc-browser-frame"') ||
                         content.includes('class="pc-content-area"');
    if (isResponsive && window.responsiveFrameStyles) {
        const scopedBlock = '<style id="v4-responsive-frame-style">\n' + window.responsiveFrameStyles + '\n</style>';
        finalContent = finalContent.replace(/<style id="v4-responsive-frame-style">[\s\S]*?<\/style>/gi, '');
        finalContent = finalContent.replace('</head>', scopedBlock + '\n</head>');
    }

    // Inject/Update Script
    const scriptBlock = getInlinedEngineScript();

    // Forcefully strip out any existing inlined scripts of our engine to avoid duplicates or stale code
    finalContent = finalContent.replace(/<script id="v4-inlined-script">[\s\S]*?<\/script>/gi, '');

    // Fast and safe script stripping loop to prevent ReDoS / catastrophic backtracking on large HTML screens
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const keywords = [
        'V4UndoManager', 'reorderAllPins', 'v4Script', 'v4ShortcutsScript',
        'v4DesignSystemScript', 'v4TextMeasurerScript', 'v4UIAtomsScript',
        'v4CommonScript', 'v4ObjectTextScript', 'v4ObjectShapeScript',
        'v4ObjectTableScript', 'v4ObjectConnectorScript', 'v4ConnectorScript',
        'v4GridScript', 'v4AccordionScript', 'v4ResponsivePinsScript', 'spawnResponsiveDualPins',
        'LF_GROUP_SELECTED', 'GroupingManager', 'renderGrid'
    ];
    finalContent = finalContent.replace(scriptRegex, (match, scriptBody) => {
        const shouldStrip = keywords.some(keyword => scriptBody.includes(keyword));
        return shouldStrip ? '' : match;
    });

    // Inject the fresh script block right before </body>
    if (finalContent.includes('</body>')) {
        finalContent = finalContent.replace('</body>', scriptBlock + '\n</body>');
    } else {
        finalContent += '\n' + scriptBlock;
    }

    // Auto-update Project Cover template metadata upon loading
    const isCoverScreen = (state.projectMetadata && state.projectMetadata.screens && state.projectMetadata.screens[fileName]?.type === 'cover') || finalContent.includes('cover-jira-id') || finalContent.includes('cover-version');
    if (isCoverScreen && state.projectMetadata) {
        finalContent = syncCoverMetadata(finalContent, state.projectMetadata, false, fileName);
    }

    const isResponsiveScreen = (state.projectMetadata && state.projectMetadata.screens && (
        state.projectMetadata.screens[fileName]?.type === 'responsive-ui' ||
        state.projectMetadata.screens[fileName]?.template === 'template_responsive_pc_mobile.html'
    )) || finalContent.includes('pc-browser-frame') || finalContent.includes('template_responsive_pc_mobile.html');

    state.isCurrentResponsiveScreen = isResponsiveScreen;

    const btnResponsiveGrid = document.getElementById('btn-toggle-responsive-grid');
    if (btnResponsiveGrid) {
        if (isResponsiveScreen) {
            btnResponsiveGrid.style.display = 'inline-flex';
            const isGridVisible = localStorage.getItem('responsive_grid_visible') !== 'false';
            if (typeof window.updateResponsiveGridBtnUI === 'function') {
                window.updateResponsiveGridBtnUI(isGridVisible);
            }
        } else {
            btnResponsiveGrid.style.display = 'none';
        }
    }

    const iframe = (DOM && DOM.iframe) || document.getElementById('main-iframe');
    if (iframe) {
        if (window.DOM && !window.DOM.iframe) window.DOM.iframe = iframe;
        if (isResponsiveScreen) {
            iframe.classList.add('borderless-artboard');
        } else {
            iframe.classList.remove('borderless-artboard');
        }

        // Dynamic Screen-Aware Viewport: detect canvas width/height from screen HTML or fallback to 1600x900
        let screenW = 1600;
        let screenH = 900;
        const pageMatch = finalContent.match(/(?:\.page|\.artboard)\s*\{[^}]*width:\s*(\d+)px[^}]*height:\s*(\d+)px/i);
        if (pageMatch) {
            screenW = parseInt(pageMatch[1], 10) || 1600;
            screenH = parseInt(pageMatch[2], 10) || 900;
        } else {
            const widthMatch = finalContent.match(/(?:\.page|\.artboard)\s*\{[^}]*width:\s*(\d+)px/i);
            if (widthMatch) screenW = parseInt(widthMatch[1], 10) || 1600;
        }

        iframe.style.width = screenW + 'px';
        iframe.style.height = screenH + 'px';
        const wrapper = (DOM && DOM.artboardWrapper) || document.getElementById('artboard-wrapper');
        if (wrapper) {
            wrapper.style.width = screenW + 'px';
            wrapper.style.height = screenH + 'px';
        }

        iframe.srcdoc = finalContent;
        iframe.style.display = 'block';

        const loadTimeout = setTimeout(() => {
            if (typeof window.hideLoading === 'function') window.hideLoading();
        }, 3000);

        iframe.onload = () => {
            clearTimeout(loadTimeout);
            if (typeof window.hideLoading === 'function') window.hideLoading();
            iframe.onload = null;

            if (isResponsiveScreen && iframe.contentWindow) {
                const isGridVisible = localStorage.getItem('responsive_grid_visible') !== 'false';
                setTimeout(() => {
                    if (window.MessageHub) {
                        MessageHub.send(iframe.contentWindow, 'LF_SET_RESPONSIVE_GRID', { visible: isGridVisible });
                    }
                }, 80);
            }

            // Phase 3: Import legacy description pins ONCE, then render sidebar list
            if (isResponsiveScreen && iframe.contentWindow) {
                const descList = state.activeFile?.meta?.description || [];
                if (descList.length > 0) {
                    setTimeout(() => {
                        if (window.MessageHub) {
                            MessageHub.send(iframe.contentWindow, 'LF_IMPORT_RESPONSIVE_PINS', { pins: descList });
                        }
                    }, 80);
                }
            } else {
                const legacyPins = (state.activeFile?.meta?.description || []).filter(p => p.type === 'text' || p.text || p.html);
                if (legacyPins.length > 0 && iframe.contentWindow) {
                    setTimeout(() => {
                        iframe.contentWindow.postMessage({ type: 'LF_IMPORT_PINS', pins: legacyPins }, '*');
                    }, 80);
                }
            }
            if (typeof window.renderDescriptionList === 'function') {
                setTimeout(window.renderDescriptionList, 100);
            }

            // [Bug Fix 1] Pre-warm SmartGuide snap targets after iframe DOM is fully rendered.
            // Without this, the first drag has no iframe targets because the async request
            // fired on LF_SNAP_START hasn't received a response yet.
            setTimeout(() => {
                if (window.SmartGuide) {
                    window.SmartGuide.findSnapTargets();
                    console.log('[SmartGuide] Targets pre-warmed after screen load.');
                }
            }, 300);

            // [Bug Fix 2] Recalculate center scale after layout has fully settled in iframe.
            setTimeout(() => {
                if (typeof window.centerView === 'function') {
                    window.centerView();
                    console.log('[INIT] Layout settled, ran centerView.');
                }
            }, 150);
        };
    }

    let scMeta = (state.projectMetadata.screens || {})[fileName] || {};
    if (!scMeta.description || !Array.isArray(scMeta.description)) {
        scMeta.description = (typeof scMeta.description === 'string' && scMeta.description.trim())
            ? [{ text: scMeta.description, x: 50, y: 50 }]
            : [];
    }
    if (!scMeta.connectors || !Array.isArray(scMeta.connectors)) scMeta.connectors = [];

    state.activeFile = {
        name: fileName,
        size: (content.length / 1024).toFixed(1) + ' KB',
        meta: scMeta
    };
    state.connectors = scMeta.connectors;

    const fileNameEl = (DOM && DOM.fileName) || document.getElementById('file-name-display');
    if (fileNameEl) fileNameEl.innerText = state.projectMetadata.title || state.currentProject;

    if (typeof window.updateProperties === 'function') window.updateProperties();

    if (scMeta.defaultTab === 'description') {
        if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab('description');
    } else {
        if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab('editor');
    }

    setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 150);
};

window.handleDeleteScreen = async function (name, sha) {
    if (state.isReadOnly) return window.showAuthModal?.();
    const confirmed = await Notification.confirm(
        `'${name}' 스크린을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
        "스크린 삭제",
        "warning"
    );
    if (!confirmed) return;

    if (typeof window.showLoading === 'function') window.showLoading("Deleting: " + name);

    let success = await deleteFileFromGitHub(`${state.currentProject}/${name}`, sha);
    if (!success && window.location.protocol === 'file:') {
        success = true;
    }
    if (success) {
        state.screens = state.screens.filter(s => s.name !== name);
        if (state.projectMetadata.screens) delete state.projectMetadata.screens[name];
        if (state.projectMetadata.screenOrder) {
            state.projectMetadata.screenOrder = state.projectMetadata.screenOrder.filter(n => n !== name);
        }
        await saveProjectMetadata(state.currentProject, state.projectMetadata, () => { });

        if (state.activeFile && state.activeFile.name === name) {
            location.href = `viewer.html?project=${state.currentProject}`;
        } else {
            location.reload();
        }
    } else {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        window.Notification?.alert("삭제 실패", "오류", "error");
    }
};



window.insertAtomicComponent = function (type, name) {
    if (state.isReadOnly) return window.showAuthModal?.();
    if (!state.activeFile) return window.Notification?.alert("Please select a screen first.", "Notice", "warning");

    let contentHtml = '';
    const id = `lf-comp-${Date.now()}`;
    let defaultStyle = { width: '120px', height: '100px' };

    if (name === 'SISUN Logo' || name === 'Workspace Logo') {
        contentHtml = `<svg viewBox="0 0 176 32" fill="currentColor" class="lf-icon v4-logo-img" style="width:100%; height:100%; background-image: none !important; pointer-events: none;"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', 'Arial Black', sans-serif" font-weight="900" font-size="28" letter-spacing="-0.5px" fill="currentColor">SISUN.COM</text></svg>`;
        defaultStyle = { width: '120px', height: '22px', color: '#000000' };
    } else if (name === 'Primary Button') {
        contentHtml = `<div style="background:#00e5ff; color:#0f172a; border:none; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:400; font-size:12px; font-family:inherit; box-shadow:0 4px 15px rgba(0,229,255,0.3); pointer-events:none;">BUTTON</div>`;
        defaultStyle = { width: '120px', height: '36px' };
    } else if (name === 'LF Discount' || name === 'Special Discount') {
        contentHtml = `<div style="color:#E02020; font-size:24px; font-weight:800; font-family:sans-serif; text-align:center; pointer-events:none; line-height:1.2;">20%</div>`;
        defaultStyle = { width: '60px', height: '30px' };
    } else if (name === 'Check Box') {
        contentHtml = `<div class="v4-checkbox-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-checkbox lf-icon" style="width:20px; height:20px; background:rgb(50, 50, 50); border:1.6px solid rgb(255, 255, 255); border-radius:6px; display:flex; align-items:center; justify-content:center; box-sizing:border-box; flex-shrink:0;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%; pointer-events:none;"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="v4-checkbox-text v4-editable-cell" contenteditable="true" style="color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">TEXT</div></div>`;
        defaultStyle = { width: '80px', height: '30px' };
    } else if (name === 'Radio Button') {
        contentHtml = `<div class="v4-radio-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-radio lf-icon" style="width:20px; height:20px; background:rgb(50, 50, 50); border:1.6px solid rgb(255, 255, 255); border-radius:50%; display:flex; align-items:center; justify-content:center; box-sizing:border-box; flex-shrink:0;"><div class="v4-radio-dot" style="width:45%; height:45%; background:#ffffff; border-radius:50%; pointer-events:none;"></div></div><div class="v4-radio-text v4-editable-cell" contenteditable="true" style="color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">TEXT</div></div>`;
        defaultStyle = { width: '80px', height: '30px' };
    } else if (name === 'Accordion UI') {
        contentHtml = `<div class="v4-accordion-container" data-expanded="false" data-sub-count="3" style="width:100%; height:100%; display:flex; flex-direction:column; background:rgb(30, 41, 59); border:1.6px solid rgb(255, 255, 255); border-radius:8px; overflow:hidden; box-sizing:border-box;"><div class="v4-accordion-header" style="height:36px; padding:0 12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:rgba(255, 255, 255, 0.05); user-select:none; border-bottom:1.6px solid rgba(255,255,255,0.1); box-sizing:border-box; width:100%; flex-shrink:0;"><span class="v4-accordion-title-text" style="color:#ffffff; font-size:12px; font-weight:400; font-family:inherit; pointer-events:none;">Accordion Header</span><span class="v4-accordion-chevron" style="color:#ffffff; font-size:10px; pointer-events:none; transition:transform 0.2s;">▼</span></div><div class="v4-accordion-body" style="display:none; flex-direction:column; width:100%; box-sizing:border-box; background:rgba(0,0,0,0.15);"><div class="v4-accordion-item v4-editable-cell" contenteditable="true" style="padding:8px 12px; font-size:12px; font-weight:400; color:#cccccc; border-bottom:1.6px solid rgba(255,255,255,0.05); font-family:inherit; outline:none; -webkit-user-select:text; user-select:text;">Sub Item 1</div><div class="v4-accordion-item v4-editable-cell" contenteditable="true" style="padding:8px 12px; font-size:12px; font-weight:400; color:#cccccc; border-bottom:1.6px solid rgba(255,255,255,0.05); font-family:inherit; outline:none; -webkit-user-select:text; user-select:text;">Sub Item 2</div><div class="v4-accordion-item v4-editable-cell" contenteditable="true" style="padding:8px 12px; font-size:12px; font-weight:400; color:#cccccc; font-family:inherit; outline:none; -webkit-user-select:text; user-select:text;">Sub Item 3</div></div></div>`;
        defaultStyle = { width: '180px', height: '36px' };
    } else if (name === 'Grid UI') {
        contentHtml = `<div class="v4-grid-container" data-pagination="true" data-row-count="5" data-columns="[{&quot;name&quot;:&quot;&quot;,&quot;type&quot;:&quot;checkbox&quot;,&quot;width&quot;:&quot;100px&quot;},{&quot;name&quot;:&quot;번호&quot;,&quot;type&quot;:&quot;number&quot;,&quot;width&quot;:&quot;100px&quot;},{&quot;name&quot;:&quot;라이브 방송명&quot;,&quot;type&quot;:&quot;text&quot;,&quot;width&quot;:&quot;100px&quot;},{&quot;name&quot;:&quot;방송상태&quot;,&quot;type&quot;:&quot;status&quot;,&quot;width&quot;:&quot;100px&quot;},{&quot;name&quot;:&quot;등록/수정자&quot;,&quot;type&quot;:&quot;author&quot;,&quot;width&quot;:&quot;100px&quot;}]" style="width:100%; height:100%; display:flex; flex-direction:column; background:#ffffff; border:1.6px solid rgb(226,232,240); border-radius:8px; overflow:hidden; box-sizing:border-box;"><div class="v4-grid-table-wrapper" style="width:100%; height:calc(100% - 36px); overflow:auto; box-sizing:border-box;"><table style="width:max-content; table-layout:fixed; border-collapse:collapse; background:#ffffff; box-sizing:border-box;"><colgroup><col style="width:100px;"><col style="width:100px;"><col style="width:100px;"><col style="width:100px;"><col style="width:100px;"></colgroup><thead><tr style="height:40px; background:#f8fafc; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box;"><th class="v4-grid-cell v4-grid-check-col" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0; font-weight:normal;"><input type="checkbox"></th><th class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit; user-select:none;">번호 ⇅</th><th class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit; user-select:none;">라이브 방송명 ⇅</th><th class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit; user-select:none;">방송상태 ⇅</th><th class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit; user-select:none;">등록/수정자 ⇅</th></tr></thead><tbody style="box-sizing:border-box;"><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;"><input type="checkbox"></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">1024</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">[기획전] 여름 맞이 린넨 셔츠 특가 라이브</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;"><span style="background:rgba(52,211,153,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:400;">방송중</span></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; font-size:12px; font-weight:400; color:#64748b; font-family:inherit;">홍길동</td></tr><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;"><input type="checkbox"></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">1023</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">[프리미엄] 프리미엄 실크 타이 단독 런칭 쇼</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;"><span style="background:rgba(251,191,36,0.15); color:#d97706; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:400;">방송예정</span></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; font-size:12px; font-weight:400; color:#64748b; font-family:inherit;">이영희</td></tr><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;"><input type="checkbox"></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">1022</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">[아웃도어] 아웃도어 바람막이 클리어런스 세일</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;"><span style="background:rgba(239,68,68,0.1); color:#ef4444; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:400;">방송종료</span></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; font-size:12px; font-weight:400; color:#64748b; font-family:inherit;">박민수</td></tr><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;"><input type="checkbox"></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">1021</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">[신상품] 봄 신상 스니커즈 한정 라이브</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;"><span style="background:rgba(52,211,153,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:400;">방송중</span></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; font-size:12px; font-weight:400; color:#64748b; font-family:inherit;">최현우</td></tr><tr style="height:40px; border-bottom:none; box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;"><input type="checkbox"></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">1020</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;">[컬렉션] 가을 컬렉션 룩북 공개 생방송</td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;"><span style="background:rgba(251,191,36,0.15); color:#d97706; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:400;">방송예정</span></td><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; font-size:12px; font-weight:400; color:#64748b; font-family:inherit;">정수진</td></tr></tbody></table></div><div class="v4-grid-footer" style="height:36px; padding:0 12px; display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border-top:1.6px solid rgb(226,232,240); box-sizing:border-box; width:100%; flex-shrink:0;"><span style="font-size:11px; color:#64748b; font-family:inherit;">1/27</span><div class="v4-grid-pages" style="font-size:11px; color:#64748b; cursor:pointer; font-family:inherit;">◀ 1 2 3 4 5 ▶</div><span style="font-size:11px; color:#64748b; font-family:inherit;">Page Size 100</span></div></div>`;
        defaultStyle = { width: '500px', height: '336px' };
    } else if (name === 'Search Bar') {
        contentHtml = `<div class="v4-searchbar-container" data-placeholder="원스피어 통합검색" style="display:flex; align-items:center; justify-content:space-between; width:100%; height:100%; background:rgb(255, 255, 255); border:1.6px solid rgb(200, 200, 200); border-radius:9999px; padding:0 12px 0 16px; box-sizing:border-box; overflow:hidden; pointer-events:auto;"><div class="v4-searchbar-text v4-editable-cell" contenteditable="true" data-placeholder="원스피어 통합검색" style="flex:1; border:none; outline:none; background:transparent; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit; min-width:0; padding:0; line-height:1.2; -webkit-user-select:text; user-select:text; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"></div><div class="v4-searchbar-icon-wrap" style="display:flex; align-items:center; justify-content:center; width:20px; height:20px; flex-shrink:0; margin-left:8px; pointer-events:none;"><svg viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%; background-image:none !important;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div></div>`;
        defaultStyle = { width: '200px', height: '30px' };
    } else if (type === 'icon') {
        const svgMap = {
            'Home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
            'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
            'Menu': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
            'menu': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
            'Hamburger': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
            'hamburger': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
            'Category': '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>',
            'category': '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>',
            'Brand': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',
            'brand': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',
            'Search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
            'search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
            'Cart': '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
            'cart': '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
            'Bag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
            'bag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
            'Shopping Bag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
            'shoppingbag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
            'Noti': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
            'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
            'Wishlist': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
            'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
            'My Page': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
            'my': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
            'Share': '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
            'Share Premium': '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
            'New Window': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
            'Download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
            'Zoom': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
            'zoom': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
            'Zoom In': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
            'zoomin': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
            '확대보기': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
            'Copy': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
            'copy': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
            'Clipboard': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
            'clipboard': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
            '복사하기': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
            'Global': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
            'global': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
            'Language': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
            'language': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
            'Globe': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
            'globe': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
            '글로벌': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
            'Camera': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            'camera': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            'Celeb': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            'celeb': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            'Photo': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            'photo': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            '카메라': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            '셀럽': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
            'Recent': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
            'recent': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
            'Recent Seen': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
            'Clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
            'clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
            '최근본상품': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
            '최근': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
            'Gift': '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
            'Cust Gift': '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
            'Inquiry': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="15" x2="12.01" y2="15"></line>',
            'Cust 1to1': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="15" x2="12.01" y2="15"></line>',
            'Chatbot': '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line>',
            'Cust Chatbot': '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line>',
            'FAQ': '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
            'Cust FAQ': '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
            'Delivery': '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
            'Cust Truck': '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
            'Write Rv': '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
            'Rv Write': '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
            'My Rv': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
            'Rv My': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
            'Arrow Left': '<polyline points="15 18 9 12 15 6"></polyline>',
            'Arrow L': '<polyline points="15 18 9 12 15 6"></polyline>',
            'Arrow Right': '<polyline points="9 18 15 12 9 6"></polyline>',
            'Arrow R': '<polyline points="9 18 15 12 9 6"></polyline>',
            'Arrow Up': '<polyline points="18 15 12 9 6 15"></polyline>',
            'Arrow U': '<polyline points="18 15 12 9 6 15"></polyline>',
            'Arrow Down': '<polyline points="6 9 12 15 18 9"></polyline>',
            'Arrow D': '<polyline points="6 9 12 15 18 9"></polyline>',
            'Close X': '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
            'Close': '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
            'Login': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="10 17 5 12 10 7"></polyline><line x1="21" y1="12" x2="5" y2="12"></line>',
            'Logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
            'Sign Up': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line>',
            'Insight': '<path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
            'insight': '<path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
            '인사이트': '<path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
            'Hypothesis': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
            'hypothesis': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
            'Hypotheses': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
            'hypotheses': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
            '가설': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>'
        };

        if (name === 'SISUN Logo' || name === 'Workspace Logo') {
            contentHtml = `<svg viewBox="0 0 176 32" fill="currentColor" class="lf-icon v4-logo-img" style="width:100%; height:100%; background-image: none !important; pointer-events: none;"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', 'Arial Black', sans-serif" font-weight="900" font-size="28" letter-spacing="-0.5px" fill="currentColor">SISUN.COM</text></svg>`;
            defaultStyle = { width: '120px', height: '22px', color: '#000000' };
        } else if (svgMap[name]) {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%; padding:3px; box-sizing:border-box; background-image: none !important;">${svgMap[name]}</svg>`;
            defaultStyle = { width: '30px', height: '30px', color: '#000000' };
        } else {
            contentHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%; padding:3px; box-sizing:border-box; background-image: none !important;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            defaultStyle = { width: '30px', height: '30px', color: '#000000' };
        }
    }

    if (DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
        MessageHub.send(DOM.iframe.contentWindow, 'LF_INSERT_V4_COMP', { id, html: contentHtml, style: defaultStyle });
    }
};

// Note: insertV4ComponentById is now handled by vctrl_v4_addon.js for modularity.

window.getCascadedPosition = function (startX = 120, startY = 300) {
    let x = startX, y = startY;
    const step = 25;
    const list = state.activeFile?.meta.description || [];
    let isOccupied = true;
    let attempts = 0;
    while (isOccupied && attempts < 15) {
        isOccupied = list.some(item => item.type === 'text' && Math.abs(item.x - x) < 20 && Math.abs(item.y - y) < 20);
        if (isOccupied) { x += step; y += step; attempts++; if (x > 340 || y > 750) { x = startX; y = startY; break; } }
    }
    return { x, y };
};



window.handleTextCreation = function () {
    if (state.isReadOnly) return window.showAuthModal?.();
    if (!state.activeFile) return window.Notification?.alert("스크린을 선택해주세요.", "알림", "warning");

    if (!state.activeFile.meta.description) {
        state.activeFile.meta.description = [];
    }

    const isResponsive = !!(state.isCurrentResponsiveScreen || (state.activeFile?.meta?.template === 'template_responsive_pc_mobile.html'));
    const newIdx = state.activeFile.meta.description.length;

    if (isResponsive) {
        state.activeFile.meta.description.push({
            text: "Edit Text",
            html: "<div class=\"v4-editable-cell\" contenteditable=\"true\" style=\"outline:none; color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; padding:2px 4px; display:block; text-align:left;\">Edit Text</div>",
            x: 500,
            y: 300,
            pins: {
                pc: { x: 500, y: 300, active: true },
                mobile: { x: 180, y: 300, active: true }
            },
            standardized: true
        });

        if (typeof window.renderDescriptionList === 'function') {
            window.renderDescriptionList();
        }

        const DOM = window.DOM || {};
        if (DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
            MessageHub.send(DOM.iframe.contentWindow, 'LF_INSERT_RESPONSIVE_PINS', {
                index: newIdx,
                number: newIdx + 1
            });
        }
    } else {
        state.activeFile.meta.description.push({
            text: "Edit Text",
            html: "<div class=\"v4-editable-cell\" contenteditable=\"true\" style=\"outline:none; color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; padding:2px 4px; display:block; text-align:left;\">Edit Text</div>",
            x: 670,
            y: 430,
            standardized: true
        });

        if (typeof window.renderDescriptionList === 'function') {
            window.renderDescriptionList();
        }

        if (typeof window.insertV4ComponentById === 'function') {
            window.insertV4ComponentById('v4-tool-text', newIdx);
        } else {
            console.error("[V4 Core] insertV4ComponentById not available for Text Creation.");
        }
    }
    markAsDirty();
};

// Textbox Creation (NOT a description pin - pure editable text box on canvas)
window.handleTextboxCreation = function () {
    if (state.isReadOnly) return window.showAuthModal?.();
    if (!state.activeFile) return window.Notification?.alert("스크린을 선택해주세요.", "알림", "warning");

    if (typeof window.insertV4ComponentById === 'function') {
        window.insertV4ComponentById('v4-tool-text');
    } else {
        console.error("[V4 Core] insertV4ComponentById not available for Textbox Creation.");
    }
    markAsDirty();
};

window.getIframeHTML = async function () {
    const isFileProtocol = window.location.protocol === 'file:';

    if (!isFileProtocol) {
        try {
            if (DOM.iframe && DOM.iframe.contentDocument) {
                const doc = DOM.iframe.contentDocument;
                const clone = doc.documentElement.cloneNode(true);
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
                return "<!DOCTYPE html>\n" + clone.outerHTML;
            }
        } catch (e) {
            console.warn("[Security] Direct iframe access failed, switching to message fallback.");
        }
    }

    return new Promise((resolve) => {
        const handler = (e) => {
            if (e.data.type === 'LF_SAVE_CONTENT_RESPONSE') {
                window.removeEventListener('message', handler);
                resolve(e.data.html);
            }
        };
        window.addEventListener('message', handler);
        if (DOM.iframe && DOM.iframe.contentWindow) {
            DOM.iframe.contentWindow.postMessage({ type: 'LF_REQUEST_SAVE_CONTENT' }, '*');
        } else {
            window.removeEventListener('message', handler);
            resolve(null);
        }
        setTimeout(() => {
            window.removeEventListener('message', handler);
            resolve(null);
        }, 2500);
    });
};

window.handleGlobalSave = async function () {
    const btn = document.getElementById('btn-global-save');
    if (!btn || btn.disabled) return;

    if (state.isReadOnly) return window.showAuthModal?.();

    // 1. Get revision history message with Prompt (Default "")
    let changeMsg = "";
    if (window.Notification && typeof window.Notification.prompt === 'function') {
        const res = await window.Notification.prompt(
            "이번 재개정(저장)의 상세 변경 사유를 입력해주세요. (입력하지 않으면 이력이 기록되지 않습니다.)",
            "",
            "재개정 이력 기록"
        );
        if (res === null) {
            console.log("[Save] Save cancelled by user in prompt.");
            return; // Cancel saving
        }
        changeMsg = res.trim();
    }

    const overlay = document.getElementById('save-overlay');
    try {
        if (state.isEditing && typeof window.closeActiveEditor === 'function') {
            window.closeActiveEditor(true);
        }

        // Show premium glassmorphic lock overlay
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.opacity = '0';
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
        }

        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">save</span> 저장 중..<span id="save-loading-bar" style="position:absolute; left:0; bottom:0; height:3px; width:0%; background:rgba(255,255,255,0.9); border-radius:0 0 8px 8px; transition:width 2.5s cubic-bezier(0.4,0,0.2,1);"></span>`;

        requestAnimationFrame(() => {
            const bar = document.getElementById('save-loading-bar');
            if (bar) bar.style.width = '90%';
        });

        // 2. Format DateTime KST
        const getFormattedKST = () => {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
        };
        const updatedTimeStr = getFormattedKST();

        const projectMeta = {
            title: document.getElementById('viewer-meta-title')?.value || '',
            assignee: document.getElementById('viewer-meta-assignee')?.value || '',
            developer: document.getElementById('viewer-meta-developer')?.value || '',
            period: document.getElementById('viewer-meta-period')?.value || '',
            updated: updatedTimeStr
        };

        let htmlContent = await getIframeHTML();

        let nextVer = undefined;
        const activeFileName = state.activeFile ? state.activeFile.name : null;
        const isCoverScreenSave = activeFileName && ((state.projectMetadata && state.projectMetadata.screens && state.projectMetadata.screens[activeFileName]?.type === 'cover') || (htmlContent && (htmlContent.includes('cover-version') || htmlContent.includes('cover-jira-id'))));

        if (htmlContent && isCoverScreenSave) {
            // Parse current version to determine next version
            let currentVer = 0.1;
            const verMatch = htmlContent.match(/(<div[^>]*id="cover-version-val"[^>]*>v?)([\d.]+)(<\/div>)/i) ||
                htmlContent.match(/(<div[^>]*id="cover-version"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell"[^>]*>v?)([\d.]+)(<\/div>)/i);

            if (verMatch && verMatch[2]) {
                currentVer = parseFloat(verMatch[2]);
            } else if (state.projectMetadata && state.projectMetadata.screens && state.projectMetadata.screens[activeFileName]?.version !== undefined) {
                currentVer = parseFloat(state.projectMetadata.screens[activeFileName].version);
            }

            nextVer = parseFloat((currentVer + 0.1).toFixed(1));

            // Sync all cover metadata and auto-increment version
            htmlContent = syncCoverMetadata(htmlContent, Object.assign({}, state.projectMetadata, projectMeta), true, activeFileName);
        } else if (htmlContent && htmlContent.includes('cover-jira-id')) {
            const jiraValue = projectMeta.jira || '-';
            htmlContent = htmlContent.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, `$1${jiraValue}$2`);
        }

        const success = await updateScreenMetadata(state.currentProject, activeFileName, {
            projectMeta,
            htmlContent,
            version: nextVer,
            description: state.activeFile ? state.activeFile.meta.description : [],
            existingMetadata: state.projectMetadata
        }, () => { });

        const bar = document.getElementById('save-loading-bar');
        if (bar) { bar.style.transition = 'width 0.3s ease'; bar.style.width = '100%'; }

        await new Promise(r => setTimeout(r, 350));

        // Hide overlay smoothly on completion
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        }

        if (success) {
            markAsClean();
            Object.assign(state.projectMetadata, projectMeta);
            if (projectMeta.title && DOM.fileName) DOM.fileName.innerText = projectMeta.title;

            // 실시간 좌측 하단 UI 업데이트
            const updatedTxt = document.getElementById('meta-updated-txt');
            if (updatedTxt) {
                updatedTxt.innerText = `최종 업데이트: ${updatedTimeStr}`;
            }

            if (typeof window.showToast === 'function') {
                window.showToast("저장이 성공적으로 완료되었습니다.", "success");
            }

            // history.json 이력 저장 처리
            try {
                if (changeMsg) {
                    const historyEntry = {
                        date: updatedTimeStr,
                        file: activeFileName || 'n/a',
                        version: nextVer || (state.projectMetadata.screens?.[activeFileName]?.version || '0.1'),
                        assignee: projectMeta.assignee,
                        developer: projectMeta.developer,
                        message: changeMsg
                    };

                    if (typeof window.fetchProjectHistory === 'function' && typeof window.saveProjectHistory === 'function') {
                        const historyList = await window.fetchProjectHistory(state.currentProject);
                        historyList.unshift(historyEntry); // 최신이 가장 위로
                        await window.saveProjectHistory(state.currentProject, historyList, null);
                    }
                } else {
                    console.log("[Save] Save completed without writing history (reason is empty).");
                }
            } catch (err) {
                console.error("Failed to append project revision history:", err);
            }

            btn.style.setProperty('background', 'linear-gradient(135deg, #22c55e, #16a34a)', 'important');
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">check_circle</span> 저장 완료`;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.removeProperty('background');
                btn.style.position = '';
                btn.style.overflow = '';
                btn.disabled = false;
            }, 1500);
        } else {
            throw new Error("GitHub API 반영에 실패했습니다.");
        }
    } catch (err) {
        console.error("[Save Error]", err);
        // Hide overlay smoothly on error
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        }
        if (btn) {
            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">error</span> 저장 실패`;
            btn.style.setProperty('background', '#ef4444', 'important');
            setTimeout(() => {
                btn.innerHTML = `<span class="material-icons-outlined" style="font-size:13px;">save</span> 전체 저장`;
                btn.style.removeProperty('background');
                btn.style.position = '';
                btn.style.overflow = '';
                btn.disabled = false;
            }, 1500);
        }
        if (window.Notification) window.Notification.alert('저장 중 오류가 발생했습니다: ' + err.message, '오류', 'error');
    }
};

// --- State Management ---
window.MessageHub = {
    handlers: {},

    // Support multiple subscribers for the same message type
    subscribe(type, callback) {
        if (!this.handlers[type]) this.handlers[type] = [];
        this.handlers[type].push(callback);
    },

    register(type, callback) {
        console.warn(`[MessageHub] register() is deprecated. Use subscribe() instead.`);
        this.subscribe(type, callback);
    },

    init() {
        // Global mouseup handler to release active drag/marquee states when releasing mouse outside of iframe
        window.addEventListener('mouseup', () => {
            const DOM = window.DOM;
            if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                DOM.iframe.contentWindow.postMessage({ type: 'LF_PARENT_MOUSEUP' }, '*');
            }
        });

        window.addEventListener('message', (e) => {
            const data = e.data;
            if (!data || !data.type) return;

            if (window.DEBUG_MODE) {
                console.log(`%c[MessageHub] IN: ${data.type}`, "color: #10b981;", data);
            }

            // Internal engine hooks
            if (data.type === 'LF_FOCUS_PARENT_QUILL') {
                if (window.quillEditor) {
                    window.quillEditor.focus();
                    // Put cursor at the end of the text
                    const length = window.quillEditor.getLength();
                    window.quillEditor.setSelection(length, 0);
                }
            } else if (data.type === 'LF_SNAP_START') {
                if (window.SmartGuide) window.SmartGuide.findSnapTargets();
            } else if (data.type === 'LF_SNAP_REQUEST') {
                const DOM = window.DOM;
                const targetWindow = (DOM && DOM.iframe && DOM.iframe.contentWindow) || e.source;
                if (window.SmartGuide && targetWindow) {
                    const snap = window.SmartGuide.calculateSnap(data.x, data.y, data.w, data.h, !!data.isArrowKey, data.activeId);
                    window.SmartGuide.drawGuides(snap);
                    MessageHub.send(targetWindow, 'LF_SNAP_RESPONSE', snap);
                }
            } else if (data.type === 'LF_SNAP_END') {
                if (window.SmartGuide) window.SmartGuide.clearGuides();
            } else if (data.type === 'LF_DESELECT') {
                if (window.SmartGuide) window.SmartGuide.clearGuides(true);
            } else if (data.type === 'LF_RESTORE_CONNECTORS') {
                if (window.state && data.connectors) {
                    window.state.connectors = data.connectors;
                    if (window.ConnectorEngine) window.ConnectorEngine.redrawAll();
                }
            } else if (data.type === 'LF_TOGGLE_GRID_REQUEST') {
                if (typeof window.toggleResponsiveGrid === 'function') {
                    window.toggleResponsiveGrid();
                }
            } else if (data.type === 'LF_UPDATE_PIN_POS') {
                if (window.state && window.state.activeFile && window.state.activeFile.meta.description) {
                    const pin = window.state.activeFile.meta.description[data.index];
                    if (pin) {
                        if (data.frame === 'mobile') {
                            if (!pin.pins) pin.pins = { pc: { x: pin.x || 500, y: pin.y || 300, active: true } };
                            pin.pins.mobile = { x: data.x, y: data.y, active: true };
                        } else if (data.frame === 'pc') {
                            if (!pin.pins) pin.pins = { mobile: { x: 180, y: 300, active: true } };
                            pin.pins.pc = { x: data.x, y: data.y, active: true };
                            pin.x = data.x;
                            pin.y = data.y;
                        } else {
                            pin.x = data.x;
                            pin.y = data.y;
                        }
                        if (data.standardized) pin.standardized = true;
                        markAsDirty();
                    }
                }
            } else if (data.type === 'LF_DELETE_PIN') {
                if (window.state && window.state.activeFile && window.state.activeFile.meta.description) {
                    window.state.activeFile.meta.description.splice(data.index, 1);
                    if (typeof window.renderDescriptionList === 'function') {
                        window.renderDescriptionList(window.state.activeFile.meta.description);
                    }

                    // Trigger child iframe to re-order and re-index all remaining text-markers
                    const DOM = window.DOM;
                    if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                        MessageHub.send(DOM.iframe.contentWindow, 'LF_REORDER_PINS', { pins: window.state.activeFile.meta.description });
                    }

                    markAsDirty();
                }
            } else if (data.type === 'LF_TABLE_SIZE_CHANGED') {
                const DOM = window.DOM;
                if (DOM && DOM.iframe) {
                    const comp = DOM.iframe.contentWindow?.document?.getElementById(data.compId);
                    if (comp) {
                        comp.style.setProperty('width', data.width + 'px', 'important');
                        comp.style.setProperty('height', data.height + 'px', 'important');
                        const frameWin = DOM.iframe.contentWindow;
                        if (frameWin && typeof frameWin.updateHandles === 'function') {
                            frameWin.updateHandles(comp);
                        }
                        markAsDirty();
                    }
                }
            } else if (data.type === 'LF_COMP_SELECTED') {
                if (window.SmartGuide) {
                    window.SmartGuide.findSnapTargets();
                }
                const activeEl = document.activeElement;
                const isTyping = activeEl && (
                    activeEl.tagName === 'INPUT' ||
                    activeEl.tagName === 'TEXTAREA' ||
                    activeEl.tagName === 'SELECT' ||
                    activeEl.isContentEditable ||
                    activeEl.closest('#floating-inspector-card') !== null ||
                    activeEl.closest('#sidebar-right') !== null
                );

                if (data.isDescriptionPin) {
                    state.isEditing = false;
                    state.editingIndex = -1;
                    if (!isTyping && typeof window.switchSidebarTab === 'function') window.switchSidebarTab('description');
                    if (typeof window.focusDescriptionRow === 'function') {
                        window.focusDescriptionRow(data.pinIndex);
                    }
                } else {
                    state.isEditing = true;
                    state.editingIndex = data.id;

                    if (window.GroupingManager) {
                        let selectedIds = (typeof window.GroupingManager.getSelectedIds === 'function') ? [...window.GroupingManager.getSelectedIds()] : [];
                        let selectedIdsIsGroupMap = (typeof window.GroupingManager.getSelectedIdsIsGroupMap === 'function') ? { ...window.GroupingManager.getSelectedIdsIsGroupMap() } : {};

                        if (data.shiftKey) {
                            if (selectedIds.includes(data.id)) {
                                selectedIds = selectedIds.filter(id => id !== data.id);
                                delete selectedIdsIsGroupMap[data.id];
                            } else {
                                selectedIds.push(data.id);
                                selectedIdsIsGroupMap[data.id] = !!data.isGroup;
                            }
                        } else {
                            if (selectedIds.length > 1 && selectedIds.includes(data.id)) {
                                // Keep current multi-selection state
                            } else {
                                selectedIds = [data.id];
                                selectedIdsIsGroupMap = { [data.id]: !!data.isGroup };
                            }
                        }

                        if (typeof window.GroupingManager.setSelectedIds === 'function') {
                            window.GroupingManager.setSelectedIds(selectedIds);
                        }
                        if (typeof window.GroupingManager.setSelectedIdsIsGroupMap === 'function') {
                            window.GroupingManager.setSelectedIdsIsGroupMap(selectedIdsIsGroupMap);
                        }
                        if (typeof window.GroupingManager.updateSelectionUI === 'function') {
                            window.GroupingManager.updateSelectionUI();
                        }

                        if (window.state) {
                            window.state.selectedIds = [...selectedIds];
                        }

                        // Sync selection state back to iframe DOM to prevent local desync
                        if (DOM.iframe && DOM.iframe.contentWindow) {
                            MessageHub.send(DOM.iframe.contentWindow, 'LF_UPDATE_MARQUEE_SELECTION', { ids: selectedIds });
                        }

                        if (!isTyping) {
                            if (selectedIds.length === 1) {
                                if (typeof window.updateProperties === 'function') window.updateProperties(data);
                            } else {
                                if (typeof window.updateProperties === 'function') window.updateProperties();
                            }
                        }
                    } else {
                        if (!isTyping && typeof window.updateProperties === 'function') window.updateProperties(data);
                    }
                }
            } else if (data.type === 'LF_PASTE_COMPLETED') {
                try {
                    if (window.SmartGuide) {
                        try { window.SmartGuide.findSnapTargets(); } catch (e) { }
                    }
                    const activeEl = document.activeElement;
                    const isTyping = activeEl && (
                        activeEl.tagName === 'INPUT' ||
                        activeEl.tagName === 'TEXTAREA' ||
                        activeEl.tagName === 'SELECT' ||
                        activeEl.isContentEditable ||
                        activeEl.closest('#floating-inspector-card') !== null ||
                        activeEl.closest('#sidebar-right') !== null
                    );
                    state.isEditing = true;
                    const newIds = data.ids || [];
                    const groupMap = data.selectedIdsIsGroupMap || {};

                    if (newIds.length > 0) {
                        state.editingIndex = newIds[0];
                    }

                    if (DOM.iframe && DOM.iframe.contentWindow) {
                        try { DOM.iframe.contentWindow.focus(); } catch (e) { }
                    }

                    if (window.GroupingManager) {
                        if (typeof window.GroupingManager.setSelectedIds === 'function') {
                            window.GroupingManager.setSelectedIds(newIds);
                        }
                        if (typeof window.GroupingManager.setSelectedIdsIsGroupMap === 'function') {
                            window.GroupingManager.setSelectedIdsIsGroupMap(groupMap);
                        }
                        if (typeof window.GroupingManager.updateSelectionUI === 'function') {
                            try { window.GroupingManager.updateSelectionUI(); } catch (e) { }
                        }
                        if (window.state) {
                            window.state.selectedIds = [...newIds];
                        }
                        if (DOM.iframe && DOM.iframe.contentWindow) {
                            MessageHub.send(DOM.iframe.contentWindow, 'LF_UPDATE_MARQUEE_SELECTION', { ids: newIds });
                        }
                        if (!isTyping) {
                            if (newIds.length === 1 && data.firstCompStyles) {
                                if (typeof window.updateProperties === 'function') {
                                    try { window.updateProperties(data.firstCompStyles); } catch (e) { }
                                }
                            } else {
                                if (typeof window.updateProperties === 'function') {
                                    try { window.updateProperties(); } catch (e) { }
                                }
                            }
                        }
                    } else {
                        if (!isTyping && typeof window.updateProperties === 'function') {
                            try { window.updateProperties(data.firstCompStyles || {}); } catch (e) { }
                        }
                    }
                } catch (pasteErr) {
                    console.error("[Core] Error in LF_PASTE_COMPLETED handler:", pasteErr);
                }
            } else if (data.type === 'LF_SPACE_DOWN') {
                const DOM = window.DOM;
                if (DOM && DOM.canvas) DOM.canvas.classList.add('hand-active');
                if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                window.state.isHandMode = true;
            } else if (data.type === 'LF_SPACE_UP') {
                const DOM = window.DOM;
                if (DOM && DOM.canvas) DOM.canvas.classList.remove('hand-active');
                if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
                window.state.isHandMode = false;
            } else if (data.type === 'LF_IFRAME_WHEEL_ZOOM') {
                const DOM = window.DOM;
                if (DOM && DOM.iframe && DOM.canvas && window.state) {
                    const iframeRect = DOM.iframe.getBoundingClientRect();
                    const parentClientX = data.clientX + iframeRect.left;
                    const parentClientY = data.clientY + iframeRect.top;

                    const canvasRect = DOM.canvas.getBoundingClientRect();
                    const mx = parentClientX - canvasRect.left;
                    const my = parentClientY - canvasRect.top;

                    const state = window.state;
                    const s = state.transform.scale;
                    const ns = Math.max(0.1, Math.min(s * (1 + (data.deltaY > 0 ? -0.1 : 0.1)), 20));

                    state.transform.x = mx - (mx - state.transform.x) * (ns / s);
                    state.transform.y = my - (my - state.transform.y) * (ns / s);
                    state.transform.scale = ns;
                    if (typeof window.updateTransform === 'function') {
                        window.updateTransform();
                    }
                }
            }

            // Call all registered subscribers
            if (this.handlers[data.type]) {
                this.handlers[data.type].forEach(callback => {
                    try {
                        callback(data);
                    } catch (err) {
                        console.error(`[MessageHub] Error in handler for "${data.type}":`, err);
                    }
                });
            }
        });
        console.log("[MessageHub] Central message listener active (V2 Modular).");
    },

    send(targetWindow, type, data = {}) {
        if (!targetWindow || !targetWindow.postMessage) {
            console.error("[MessageHub] Invalid target for postMessage.");
            return;
        }
        if (window.DEBUG_MODE) {
            console.log(`%c[MessageHub] OUT: ${type}`, "color: #3b82f6;", data);
        }
        targetWindow.postMessage({ type, ...data }, '*');
    }
};

// --- Virtual Undo Manager Proxy (Parent to Child bridge) ---
window.V4UndoManager = {
    saveState: function () {
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            MessageHub.send(iframe.contentWindow, 'LF_SAVE_UNDO');
        }
    },
    undo: function () {
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            MessageHub.send(iframe.contentWindow, 'LF_TRIGGER_UNDO');
        }
    }
};

// 3. Central Event Helpers
window.markAsDirty = function () {
    // Sync connectors to iframe for Undo support
    const iframe = document.getElementById('main-iframe');
    if (iframe && iframe.contentWindow && window.state && window.state.connectors) {
        MessageHub.send(iframe.contentWindow, 'LF_SYNC_CONNECTORS', { connectors: window.state.connectors });
    }

    if (state.hasUnsavedChanges) return;
    state.hasUnsavedChanges = true;
    console.log("[Status] Unsaved changes detected.");

    // UI Feedback
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) {
        btnSave.style.boxShadow = "0 0 20px rgba(0, 229, 255, 0.6)";
    }
};


window.markAsClean = function () {
    state.hasUnsavedChanges = false;
    const btnSave = document.getElementById('btn-global-save');
    if (btnSave) {
        btnSave.style.boxShadow = "";
    }
};

window.checkUnsavedChanges = async function () {
    if (!state.hasUnsavedChanges) return true;
    const confirmed = await Notification.confirm("저장되지 않은 수정사항이 있습니다. 무시하고 이동하시겠습니까?", "알림", "warning");
    if (confirmed) {
        markAsClean();
        return true;
    }
    return false;
};

// 5. Navigation Protection
window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});


// 6. Initial Bootstrap
window.checkEnvironment = function () {
    if (window.location.protocol === 'file:') {
        console.warn("[ENV] Running on file:// protocol. Direct iframe DOM access is blocked. Using MessageHub.");
    }
};

window.init = async function () {
    try {
        const DOM = window.DOM || {};
        console.log("[INIT] Initialization started...");
        checkEnvironment();

        const params = new URLSearchParams(window.location.search);
        let project = params.get('project') || 'Default_Project';
        let fileName = params.get('file');

        state.currentProject = project;
        console.log("[INIT] Target Project:", project);

        // Fetch data
        const [metadata, globalComps] = await Promise.all([
            fetchProjectMetadata(project),
            (typeof fetchGlobalComponents === 'function') ? fetchGlobalComponents() : Promise.resolve([])
        ]);
        state.projectMetadata = metadata || {};
        state.globalComponents = globalComps || [];

        // Synthesize screen list from metadata.json to ensure instant loading without waiting for directory API (CORS/Proxy safe)
        const order = state.projectMetadata.screenOrder || [];
        const metaScreens = state.projectMetadata.screens || {};
        const initialScreens = Object.keys(metaScreens).map(name => ({
            name: name,
            type: 'file',
            sha: metaScreens[name].sha || ''
        })).sort((a, b) => {
            const indexA = order.indexOf(a.name);
            const indexB = order.indexOf(b.name);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        state.screens = initialScreens;

        if (!fileName && state.screens.length > 0) {
            fileName = state.screens[0].name;
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('file', fileName);
            window.history.replaceState({}, '', newUrl);
        }

        if (typeof renderScreenList === 'function') renderScreenList(state.screens, fileName);
        if (typeof renderAtomicLibrary === 'function') renderAtomicLibrary();
        if (typeof initQuillEditor === 'function') initQuillEditor();
        if (typeof initResponsiveGridToggle === 'function') initResponsiveGridToggle();

        if (fileName) {
            await loadScreen(fileName);
        } else {
            if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "프로젝트 스크린을 추가해주세요.";
            if (DOM.btnAddScreen) DOM.btnAddScreen.classList.add('pulse-attention');
        }

        // Fetch contents in the background to sync SHAs and discover any untracked screens asynchronously
        listContents(project).then(contents => {
            if (contents && contents.length > 0) {
                const repoScreens = contents.filter(i => i.type === 'file' && i.name.endsWith('.html'));
                let changed = false;
                repoScreens.forEach(rs => {
                    const existing = state.screens.find(s => s.name === rs.name);
                    if (existing) {
                        if (existing.sha !== rs.sha) {
                            existing.sha = rs.sha;
                            changed = true;
                        }
                    } else {
                        state.screens.push({
                            name: rs.name,
                            type: 'file',
                            sha: rs.sha
                        });
                        changed = true;
                    }
                });
                if (changed) {
                    state.screens.sort((a, b) => {
                        const indexA = order.indexOf(a.name);
                        const indexB = order.indexOf(b.name);
                        if (indexA === -1 && indexB === -1) return 0;
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                    });
                    if (typeof renderScreenList === 'function') {
                        renderScreenList(state.screens, state.activeFile?.name || fileName);
                    }
                }
            }
        }).catch(err => console.warn("[V4 Core] Background listContents failed:", err));

        // --- ATTACH GLOBAL LISTENERS ---
        console.log("[INIT] Attaching global listeners...");
        document.addEventListener('click', async (e) => {
            // 0. PDF Export Button
            if (e.target && e.target.closest('#btn-export-project-pdf')) {
                const currentProj = (typeof state !== 'undefined' && state && state.currentProject)
                    ? state.currentProject
                    : new URLSearchParams(window.location.search).get('project');
                if (currentProj) {
                    if (typeof exportProjectToPDF === 'function') {
                        exportProjectToPDF(currentProj, state.projectMetadata || null);
                    } else {
                        alert("PDF 변환 모듈이 로드되지 않았습니다.");
                    }
                } else {
                    alert("열려있는 프로젝트가 없습니다.");
                }
                return;
            }

            // 1. Global Save Button
            if (e.target && e.target.closest('#btn-global-save')) {
                handleGlobalSave();
                return;
            }

            // 2. Submit Add Screen Button
            if (e.target && e.target.closest('#btn-add-screen-submit')) {
                e.preventDefault();
                const btnSubmit = e.target.closest('#btn-add-screen-submit');

                const selectedCard = document.querySelector('.template-card.selected');
                if (!selectedCard) {
                    window.Notification?.alert("템플릿을 선택해주세요.", "알림", "warning");
                    return;
                }

                const inputName = document.getElementById('new-screen-name');
                const screenName = inputName?.value?.trim();
                if (!screenName) {
                    window.Notification?.alert("화면 이름을 입력해주세요.", "알림", "warning");
                    return;
                }

                btnSubmit.disabled = true;
                btnSubmit.innerText = "생성 중..";

                const template = selectedCard.dataset.template;
                const success = await createScreenFromTemplate(state.currentProject, screenName, template, {
                    PROJECT_TITLE: state.projectMetadata.title || '',
                    PROJECT_NAME: state.projectMetadata.title || '',
                    SCREEN_NAME: screenName,
                    VERSION: '0.1',
                    AUTHOR: state.projectMetadata.assignee || '-',
                    DATE: state.projectMetadata.period || new Date().toLocaleDateString('ko-KR')
                }, msg => {
                    const placeholderTxt = document.getElementById('placeholder-txt');
                    if (placeholderTxt) placeholderTxt.innerText = msg;
                });

                if (success) {
                    const targetFilename = screenName.endsWith('.html') ? screenName : `${screenName}.html`;
                    window.location.href = `viewer.html?project=${encodeURIComponent(state.currentProject)}&file=${encodeURIComponent(targetFilename)}`;
                } else {
                    window.Notification?.alert("화면 생성에 실패했습니다.", "오류", "error");
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = "화면 생성하기";
                }
                return;
            }

            // 3. Template Card Selection
            if (e.target && e.target.closest('.template-card')) {
                const card = e.target.closest('.template-card');
                document.querySelectorAll('.template-card').forEach(c => {
                    c.classList.remove('selected');
                    c.classList.remove('active');
                });
                card.classList.add('selected');
                card.classList.add('active');

                const inputName = document.getElementById('new-screen-name');
                if (inputName) {
                    const defaultName = card.dataset.defaultName || "new_screen";
                    inputName.value = defaultName + "_" + Math.floor(Math.random() * 1000);
                }
            }

            // 4. Cancel Edit Screen Button
            if (e.target && e.target.closest('#btn-edit-screen-cancel')) {
                e.preventDefault();
                const editModal = document.getElementById('edit-screen-modal');
                if (editModal) editModal.classList.remove('active');
            }

            // 5. Cancel Add Screen Button
            if (e.target && e.target.closest('#btn-add-screen-cancel')) {
                e.preventDefault();
                const addModal = document.getElementById('add-screen-modal');
                if (addModal) addModal.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (state.isReadOnly) return;
            // Ignore if typing in editable areas, input, select, textarea, ql-editor
            const isInput = e.target.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
                !!(e.target.closest && e.target.closest('.ql-editor, .v4-editable-cell, [contenteditable="true"]'));
            if (isInput) return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                console.log("[V4 Core] Parent Ctrl+Z caught. Triggering child undo.");
                if (window.V4UndoManager) window.V4UndoManager.undo();
            }
        });

        if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => {
            const collapsed = DOM.sidebarLeft.classList.toggle('collapsed');
            DOM.btnToggleLeft.querySelector('span').innerText = collapsed ? 'chevron_right' : 'chevron_left';
            setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 400);
        };
        if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => {
            const collapsed = DOM.sidebarRight.classList.toggle('collapsed');
            DOM.btnToggleRight.querySelector('span').innerText = collapsed ? 'chevron_left' : 'chevron_right';
            setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 400);
        };

        if (DOM.btnFullscreen) DOM.btnFullscreen.onclick = () => { if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(); };
        if (DOM.btnFullscreenExit) DOM.btnFullscreenExit.onclick = () => { if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true); };

        const tabBtns = (DOM && DOM.tabBtns) || document.querySelectorAll('.tab-btn, .sidebar-tab-btn');
        if (tabBtns) {
            tabBtns.forEach(btn => {
                btn.onclick = () => { if (typeof window.switchSidebarTab === 'function') window.switchSidebarTab(btn.dataset.tab); };
            });
        }

        // RESTORED: Sidebar Tool Buttons (Text, etc.)
        if (DOM.sidebarToolBtns) {
            DOM.sidebarToolBtns.forEach(btn => {
                const tool = btn.dataset.tool;
                if (tool) {
                    btn.onclick = () => {
                        if (tool === 'text') {
                            if (typeof window.handleTextboxCreation === 'function') window.handleTextboxCreation();
                        } else if (typeof window.setTool === 'function') {
                            window.setTool(tool);
                        }
                    };
                }
            });
        }

        // RESTORED: Top Bar Tool Buttons
        if (DOM.btnSelect) DOM.btnSelect.onclick = () => window.setTool?.('select');
        if (DOM.btnHand) DOM.btnHand.onclick = () => window.setTool?.('hand');
        if (typeof window.initResponsiveGridToggle === 'function') window.initResponsiveGridToggle();

        // RESTORED: Add Screen Modal Logic
        if (DOM.btnAddScreen) {
            DOM.btnAddScreen.onclick = () => {
                if (state.isReadOnly) return window.showAuthModal?.();
                const realModal = document.getElementById('add-screen-modal');
                if (realModal) realModal.classList.add('active');
            };
        }
        if (DOM.btnCancelAdd) {
            DOM.btnCancelAdd.onclick = () => {
                const realModal = document.getElementById('add-screen-modal');
                if (realModal) realModal.classList.remove('active');
            };
        }

        window.addEventListener('keydown', (e) => {
            const isF2 = e.key === 'F2' || e.code === 'F2';
            const isInput = e.target.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
                !!(e.target.closest && e.target.closest('.ql-editor, .v4-editable-cell, [contenteditable="true"]'));

            if (isInput && !isF2) return;

            if (isF2) {
                if (e.isComposing) return;
                e.preventDefault();
                console.log("[VCTRL CORE] F2 key down detected in parent window. isInput:", isInput);
                if (isInput && typeof e.target.blur === 'function') {
                    e.target.blur();
                }
                const activeIframe = (window.DOM && window.DOM.iframe) || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
                if (activeIframe && activeIframe.contentWindow) {
                    try { activeIframe.contentWindow.focus(); } catch (err) { }
                    activeIframe.contentWindow.postMessage({ type: 'LF_TRIGGER_F2' }, '*');
                }
            }
        });

        // Shortcuts & Key Event Proxying to Canvas Iframe
        window.addEventListener('keydown', (e) => {
            const isF2 = e.key === 'F2' || e.code === 'F2';
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

            if (isInput && !isF2) return;

            if (isF2) {
                e.preventDefault();
                console.log("[VCTRL CORE] F2 key down detected in parent window. isInput:", isInput);
                if (isInput) {
                    // Blur the parent editor/input and focus the canvas iframe
                    e.target.blur();
                    const DOM = window.DOM || {};
                    if (DOM.iframe && DOM.iframe.contentWindow) {
                        DOM.iframe.contentWindow.focus();
                    }
                    return;
                }
            }


            const isS = e.key.toLowerCase() === 's' || e.code === 'KeyS';
            if ((e.ctrlKey || e.metaKey) && isS) {
                e.preventDefault();
                handleGlobalSave();
                return;
            }

            const isShiftG = !e.ctrlKey && !e.metaKey && e.shiftKey && (e.key === 'G' || e.key === 'g' || e.code === 'KeyG');
            if (isShiftG && !isInput && state.isCurrentResponsiveScreen) {
                e.preventDefault();
                if (typeof window.toggleResponsiveGrid === 'function') {
                    window.toggleResponsiveGrid();
                }
                return;
            }

            if (e.key === 'Escape') {
                if (document.body.classList.contains('fullscreen-mode')) {
                    if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true);
                    return;
                }
                const addModal = document.getElementById('add-screen-modal');
                if (addModal) addModal.classList.remove('active');
                const editModal = document.getElementById('edit-screen-modal');
                if (editModal) editModal.classList.remove('active');
                if (typeof window.hideAuthModal === 'function') window.hideAuthModal();
                return;
            }

            // Proxy canvas shortcuts if we have active selections or targets
            const proxiedCodes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace', 'Space', 'F2'];

            const isC = e.key.toLowerCase() === 'c' || e.code === 'KeyC';
            const isX = e.key.toLowerCase() === 'x' || e.code === 'KeyX';
            const isV = e.key.toLowerCase() === 'v' || e.code === 'KeyV';
            const isG = e.key.toLowerCase() === 'g' || e.code === 'KeyG';
            const isCtrlShortcut = (e.ctrlKey || e.metaKey) && (isC || isX || isV || isG);

            if (proxiedCodes.includes(e.code) || isF2 || isCtrlShortcut) {
                if (isF2) {
                    console.log("[VCTRL CORE] F2 key down detected in parent window, proxying to iframe...");
                }
                if (DOM.iframe && DOM.iframe.contentWindow) {
                    try { DOM.iframe.contentWindow.focus(); } catch (err) { }
                    DOM.iframe.contentWindow.postMessage({
                        type: 'LF_SHORTCUT_KEY_PROXY',
                        code: e.code || 'F2',
                        key: e.key || 'F2',
                        shiftKey: e.shiftKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey
                    }, '*');

                    // Prevent default browser behaviors for layout movement keys, F2, and ctrl shortcuts
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Space', 'F2'].includes(e.code) || isF2 || isCtrlShortcut) {
                        e.preventDefault();
                    }
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (isInput) return;

            if (e.code === 'Space') {
                if (DOM.iframe && DOM.iframe.contentWindow) {
                    DOM.iframe.contentWindow.postMessage({
                        type: 'LF_SHORTCUT_KEY_PROXY',
                        code: e.code,
                        key: e.key,
                        shiftKey: e.shiftKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey
                    }, '*');
                }
            }

            // [Bug Fix Arrow-KEY-UP] Proxy Arrow key releases to iframe.
            // Previously, only Space keyup was proxied. Arrow keyup was never sent,
            // so the iframe's isArrowMoving flag never reset and LF_SNAP_END never fired.
            // This caused smart guide state to get permanently stuck after first key press.
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                if (DOM.iframe && DOM.iframe.contentWindow) {
                    DOM.iframe.contentWindow.postMessage({
                        type: 'LF_SHORTCUT_KEY_PROXY',
                        code: e.code,
                        key: e.key,
                        shiftKey: e.shiftKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey,
                        isKeyUp: true
                    }, '*');
                }
            }
        });

    } catch (err) {
        console.error("Initialization failed:", err);
    }
};

window.showToast = function (message, type = 'success') {
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
        <span style="flex-grow: 1;">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3500);
};

window.toggleResponsiveGrid = function () {
    if (!state.isCurrentResponsiveScreen) return;
    const isCurrentlyVisible = localStorage.getItem('responsive_grid_visible') !== 'false';
    const newVisible = !isCurrentlyVisible;
    localStorage.setItem('responsive_grid_visible', newVisible ? 'true' : 'false');

    const iframe = (DOM && DOM.iframe) || document.getElementById('main-iframe');
    if (iframe && iframe.contentWindow) {
        if (window.MessageHub) {
            MessageHub.send(iframe.contentWindow, 'LF_SET_RESPONSIVE_GRID', { visible: newVisible });
        } else {
            iframe.contentWindow.postMessage({ type: 'LF_SET_RESPONSIVE_GRID', visible: newVisible }, '*');
        }
    }
    if (typeof window.updateResponsiveGridBtnUI === 'function') {
        window.updateResponsiveGridBtnUI(newVisible);
    }
};

window.updateResponsiveGridBtnUI = function (visible) {
    const btn = document.getElementById('btn-toggle-responsive-grid');
    const icon = document.getElementById('icon-responsive-grid');
    if (!btn) return;
    if (visible) {
        btn.classList.add('active');
        if (icon) icon.innerText = 'grid_on';
        btn.title = '격자무늬 끄기 (Shift + G)';
    } else {
        btn.classList.remove('active');
        if (icon) icon.innerText = 'grid_off';
        btn.title = '격자무늬 켜기 (Shift + G)';
    }
};

window.initResponsiveGridToggle = function () {
    const btn = document.getElementById('btn-toggle-responsive-grid');
    if (btn) {
        btn.onclick = () => {
            if (typeof window.toggleResponsiveGrid === 'function') {
                window.toggleResponsiveGrid();
            }
        };
    }
};

window.DEBUG_MODE = false;
MessageHub.init();
document.addEventListener('DOMContentLoaded', () => {
    window.init();
});

// Global Safety Guard: Ensure SmartGuide lines are cleared when mouseup/pointerup occurs anywhere in parent frame
['mouseup', 'pointerup'].forEach(evtType => {
    window.addEventListener(evtType, () => {
        if (window.SmartGuide) {
            window.SmartGuide.clearGuides(true);
        }
    });
});
