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

// Streamlined Engine Script Assembler with In-Memory Caching
let _cachedEngineScriptBlock = null;

window.invalidateEngineScriptCache = function() {
    _cachedEngineScriptBlock = null;
};

// Structured Registry for Inlined Engine Scripts (Order & Dependency SSOT)
const ENGINE_SCRIPT_REGISTRY = [
    { name: 'Typography', key: 'v4TypographyScript' },
    { name: 'Undo', key: 'v4UndoScript' },
    { name: 'Table', key: 'v4TableScript' },
    { name: 'TextMeasurer', key: 'v4TextMeasurerScript' },
    { name: 'UIAtoms', key: 'v4UIAtomsScript' },
    { name: 'UIAtomsInputs', key: 'v4UIAtomsInputsScript' },
    { name: 'UIAtomsCursor', key: 'v4UIAtomsCursorScript' },
    { name: 'DesignSystem', key: 'v4DesignSystemScript' },
    { name: 'ClipboardObjects', key: 'v4ClipboardObjectsScript' },
    { name: 'FormatPainter', key: 'v4FormatPainterScript' },
    { name: 'Shortcuts', key: 'v4ShortcutsScript' },
    { name: 'Common', key: 'v4CommonScript' },
    { name: 'ObjectShape', key: 'v4ObjectShapeScript' },
    { name: 'ObjectConnector', key: 'v4ObjectConnectorScript' },
    { name: 'DragResize', key: 'v4DragResizeScript' },
    { name: 'PortConnector', key: 'v4PortConnectorScript' },
    { name: 'Grid', key: 'v4GridScript' },
    { name: 'Accordion', key: 'v4AccordionScript' },
    { name: 'Tab', key: 'v4TabScript' },
    { name: 'ResponsiveSmartGuideMath', key: 'v4ResponsiveSmartGuideMathScript' },
    { name: 'ResponsiveSmartGuide', key: 'v4ResponsiveSmartGuideScript' },
    { name: 'ResponsivePins', key: 'v4ResponsivePinsScript' },
    { name: 'IframeStyleExtractor', key: 'v4IframeStyleExtractorScript' },
    { name: 'IframeLayering', key: 'v4IframeLayeringScript' },
    { name: 'IframeInserter', key: 'v4IframeInserterScript' },
    { name: 'CoreScript', key: 'v4Script' },
    { name: 'ResponsiveMultiselect', key: 'v4ResponsiveMultiselectScript' },
    { name: 'ScrollPin', key: 'v4ScrollPinScript' }
];

function getInlinedEngineScript() {
    if (_cachedEngineScriptBlock && window.__DEV_NO_CACHE__ !== true) {
        return _cachedEngineScriptBlock;
    }
    const assembledParts = ENGINE_SCRIPT_REGISTRY.map(item => {
        const code = window[item.key];
        if (!code) {
            console.warn('[Engine Pipeline] Script missing or empty:', item.name, item.key);
            return '';
        }
        return code;
    });

    _cachedEngineScriptBlock = '<script id="v4-inlined-script">\n' +
        '// Engine Script Initialized: ' + Date.now() + '\n' +
        assembledParts.join('\n') + '\n</script>';
    return _cachedEngineScriptBlock;
}

// --- Screen Loading Sub-modules ---

function _prepareScreenViewport(DOM, fileName) {
    if (DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
    if (DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = 'none';
    if (DOM.canvas) DOM.canvas.classList.remove('hand-active');
    if (window.state) window.state.isHandMode = false;

    if (state.isEditing && typeof window.closeActiveEditor === 'function') {
        window.closeActiveEditor(true);
    }

    if (typeof window.showLoading === 'function') window.showLoading("Loading: " + fileName);
    if (DOM.placeholder) DOM.placeholder.style.display = 'none';
}

function _detectScreenResponsive(fileName, content) {
    if (!content) return false;

    // Fast-track: Cover templates and process screens are never responsive dual-frame screens
    const scMeta = (state.projectMetadata && state.projectMetadata.screens) ? state.projectMetadata.screens[fileName] : null;
    const scType = scMeta?.type;
    const scTpl = scMeta?.template;
    if (scType === 'cover' || scTpl === 'template_cover.html') return false;

    // Strip scripts and styles to prevent false-positive keyword matches from engine code
    const cleanHtml = content
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

    return Boolean(
        (fileName && (
            fileName.toLowerCase().includes('responsive') ||
            fileName.toLowerCase().includes('mobile_compare') ||
            fileName.toLowerCase().includes('admin_pc')
        )) ||
        cleanHtml.includes('pc-browser-frame') ||
        cleanHtml.includes('class="pc-frame"') ||
        cleanHtml.includes('pc-content-area') ||
        cleanHtml.includes('mobile-compare-page') ||
        cleanHtml.includes('mobile-content-area') ||
        cleanHtml.includes('pc-content-inner') ||
        cleanHtml.includes('mobile-content-inner') ||
        cleanHtml.includes('frame-column') ||
        (scType === 'responsive-ui' ||
         scTpl === 'template_responsive_pc_mobile.html' ||
         scTpl === 'template_admin_pc_scroll.html' ||
         scTpl === 'template_responsive_mobile_compare.html')
    );
}

function _compileScreenHtml(content, fileName, isResponsive) {
    let finalContent = content;

    // Ensure Pretendard Variable WebFont CDN is loaded in iframe head
    const pretendardCdnTag = '<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">';
    if (!finalContent.includes('pretendard') && finalContent.includes('</head>')) {
        finalContent = finalContent.replace('</head>', pretendardCdnTag + '\n</head>');
    }

    // Inject/Update Styles
    const styleBlock = '<style id="v4-inlined-style">\n' + window.v4Styles + '\n</style>';
    if (finalContent.includes('id="v4-inlined-style"')) {
        finalContent = finalContent.replace(/<style id="v4-inlined-style">[\s\S]*?<\/style>/i, styleBlock);
    } else if (finalContent.includes('</head>')) {
        finalContent = finalContent.replace('</head>', styleBlock + '\n</head>');
    }

    // Inject Scoped Responsive Frame Styles ONLY into authentic Responsive templates/screens
    if (isResponsive && window.responsiveFrameStyles) {
        const scopedBlock = '<style id="v4-responsive-frame-style">\n' + window.responsiveFrameStyles + '\n</style>';
        finalContent = finalContent.replace(/<style id="v4-responsive-frame-style">[\s\S]*?<\/style>/gi, '');
        finalContent = finalContent.replace('</head>', scopedBlock + '\n</head>');
    } else {
        // Enforce cleanup if non-responsive screen retained leftover responsive frame style
        finalContent = finalContent.replace(/<style id="v4-responsive-frame-style">[\s\S]*?<\/style>/gi, '');
    }

    // Inject/Update Script
    const scriptBlock = getInlinedEngineScript();
    finalContent = finalContent.replace(/<script id="v4-inlined-script">[\s\S]*?<\/script>/gi, '');

    // Fast and safe script stripping loop to prevent ReDoS / catastrophic backtracking on large HTML screens
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const keywords = [
        'V4UndoManager', 'reorderAllPins', 'v4Script', 'v4ShortcutsScript',
        'v4DesignSystemScript', 'v4TextMeasurerScript', 'v4UIAtomsScript', 'v4UIAtomsInputsScript', 'v4UIAtomsCursorScript',
        'v4CommonScript', 'v4ObjectTextScript', 'v4ObjectShapeScript',
        'v4ObjectTableScript', 'v4ObjectConnectorScript', 'v4ConnectorScript',
        'v4GridScript', 'v4AccordionScript', 'v4TabScript', 'v4ResponsivePinsScript', 'spawnResponsiveDualPins',
        'LF_GROUP_SELECTED', 'GroupingManager', 'renderGrid', 'renderTabs'
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

    return finalContent;
}

function _mountScreenIframe(iframe, finalContent, isResponsive, DOM) {
    if (window.DOM && !window.DOM.iframe) window.DOM.iframe = iframe;
    if (isResponsive) {
        iframe.classList.add('borderless-artboard');
    } else {
        iframe.classList.remove('borderless-artboard');
    }

    // Dynamic Screen-Aware Viewport: detect canvas width/height from screen HTML or fallback to 1600x900
    let screenW = 1600;
    let screenH = 900;
    const pageMatch = finalContent.match(/(?:\.page|\.artboard)\s*\{[^\x7D]*width:\s*(\d+)px[^}]*height:\s*(\d+)px/i);
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

        if (isResponsive && iframe.contentWindow) {
            const isGridVisible = localStorage.getItem('responsive_grid_visible') !== 'false';
            setTimeout(() => {
                if (window.MessageHub) {
                    MessageHub.send(iframe.contentWindow, 'LF_SET_RESPONSIVE_GRID', { visible: isGridVisible });
                }
            }, 80);
        }

        // Import legacy or responsive description pins ONCE, then render sidebar list
        if (isResponsive && iframe.contentWindow) {
            const descList = state.activeFile?.meta?.description || [];
            setTimeout(() => {
                if (window.MessageHub) {
                    MessageHub.send(iframe.contentWindow, 'LF_IMPORT_RESPONSIVE_PINS', { pins: descList });
                }
            }, 80);
        } else {
            const legacyPins = (state.activeFile?.meta?.description || []).filter(p => p.type === 'pin' || p.type === 'text' || p.text || p.html);
            if (iframe.contentWindow) {
                setTimeout(() => {
                    iframe.contentWindow.postMessage({ type: 'LF_IMPORT_PINS', pins: legacyPins }, '*');
                }, 80);
            }
        }
        if (typeof window.renderDescriptionList === 'function') {
            setTimeout(window.renderDescriptionList, 100);
        }

        setTimeout(() => {
            if (typeof window.centerView === 'function') {
                window.centerView();
                console.log('[INIT] Layout settled, ran centerView.');
            }
        }, 150);
    };
}

function _syncScreenStateAndMetadata(fileName, content, DOM) {
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
}

// --- Core Screen Loader Coordinator ---
window.loadScreen = async function (fileName) {
    const DOM = window.DOM || {};
    _prepareScreenViewport(DOM, fileName);

    const content = await fetchProjectFileContent(state.currentProject, fileName);
    if (!content) {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        if (DOM.placeholder) DOM.placeholder.style.display = 'flex';
        if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "파일을 불러오지 못했습니다.";
        return;
    }

    const isResponsive = _detectScreenResponsive(fileName, content);
    state.isCurrentResponsiveScreen = isResponsive;

    const btnResponsiveGrid = document.getElementById('btn-toggle-responsive-grid');
    if (btnResponsiveGrid) {
        if (isResponsive) {
            btnResponsiveGrid.style.display = 'inline-flex';
            const isGridVisible = localStorage.getItem('responsive_grid_visible') !== 'false';
            if (typeof window.updateResponsiveGridBtnUI === 'function') {
                window.updateResponsiveGridBtnUI(isGridVisible);
            }
        } else {
            btnResponsiveGrid.style.display = 'none';
        }
    }

    const finalContent = _compileScreenHtml(content, fileName, isResponsive);
    const iframe = (DOM && DOM.iframe) || document.getElementById('main-iframe');
    if (iframe) {
        _mountScreenIframe(iframe, finalContent, isResponsive, DOM);
    }

    _syncScreenStateAndMetadata(fileName, content, DOM);
};

// Screen deletion is managed by vctrl_screen_manager.js (SSOT). Fallback guard maintained.
if (typeof window.handleDeleteScreen !== 'function') {
    window.handleDeleteScreen = (name, sha) => window.ScreenManager?.handleDeleteScreen?.(name, sha);
}

// Component insertion is managed by assets/vctrl_component_inserter.js (SSOT).

// Pin & Text Creation Lifecycle Engine (Decoupled to assets/vctrl_annotation_pins.js SSOT)
window.getCascadedPosition = function (startX, startY) {
    if (window.AnnotationPins && typeof window.AnnotationPins.getCascadedPosition === 'function') {
        return window.AnnotationPins.getCascadedPosition(startX, startY);
    }
    return { x: startX || 120, y: startY || 300 };
};

window.handleTextCreation = function () {
    if (window.AnnotationPins && typeof window.AnnotationPins.handleTextCreation === 'function') {
        return window.AnnotationPins.handleTextCreation();
    }
};

window.handleTextboxCreation = function () {
    if (window.AnnotationPins && typeof window.AnnotationPins.handleTextboxCreation === 'function') {
        return window.AnnotationPins.handleTextboxCreation();
    }
};


// --- Storage & Saving Engine SSOT (Decoupled to assets/vctrl_storage.js) ---
window.getIframeHTML = function () {
    if (window.StorageEngine && typeof window.StorageEngine.getIframeHTML === 'function') {
        return window.StorageEngine.getIframeHTML();
    }
    return Promise.resolve(null);
};

window.handleGlobalSave = function (explicitReason) {
    if (window.StorageEngine && typeof window.StorageEngine.handleGlobalSave === 'function') {
        return window.StorageEngine.handleGlobalSave(explicitReason);
    }
    return Promise.resolve();
};


// --- MessageHub & Core Router SSOT (Decoupled to assets/vctrl_core_router.js) ---


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

/**
 * Phase 2 Decomposition: Initializes project metadata, global components, and screen lists
 */
async function _initProjectMetadataAndScreens(project, fileNameParam) {
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

    let fileName = fileNameParam;
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

    return { fileName, order };
}

/**
 * Phase 2 Decomposition: Fetches repository contents asynchronously to sync SHAs and screen lists
 */
function _startBackgroundScreenSync(project, order, currentFileName) {
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
                    renderScreenList(state.screens, state.activeFile?.name || currentFileName);
                }
            }
        }
    }).catch(err => console.warn("[V4 Core] Background listContents failed:", err));
}

/**
 * Phase 2 Decomposition: Attaches global click delegation handlers for modals, templates, export, and save
 */
function _bindGlobalClickDelegates() {
    console.log("[INIT] Attaching global listeners...");
    document.addEventListener('click', async (e) => {
        // 0-1. URL Copy Dropdown & Action Handlers (Delegated to vctrl_clipboard.js)
        if (window.ClipboardManager && typeof window.ClipboardManager.handleUrlCopyClick === 'function') {
            if (window.ClipboardManager.handleUrlCopyClick(e)) return;
        }

        // 0-2. PDF Export Button
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

        // 6. Cancel Copy Screen Button
        if (e.target && e.target.closest('#btn-copy-screen-cancel')) {
            e.preventDefault();
            const copyModal = document.getElementById('copy-screen-modal');
            if (copyModal) copyModal.classList.remove('active');
        }
    });
}

/**
 * Phase 2 Decomposition: Attaches core toolbar, sidebar, and view toggle events
 */
function _bindCoreToolbarAndSidebarEvents(DOM) {
    if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => {
        const collapsed = DOM.sidebarLeft.classList.toggle('collapsed');
        const icon = DOM.btnToggleLeft.querySelector('span');
        if (icon) icon.innerText = collapsed ? 'menu_open' : 'chevron_left';
        setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 400);
    };
    if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => {
        const collapsed = DOM.sidebarRight.classList.toggle('collapsed');
        const icon = DOM.btnToggleRight.querySelector('span');
        if (icon) icon.innerText = collapsed ? 'chevron_left' : 'chevron_right';
        DOM.btnToggleRight.classList.toggle('active', !collapsed);
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

    // Unified Global Keyboard Shortcuts & Event Proxying (Decoupled to assets/vctrl_parent_shortcuts.js)
    if (window.ParentShortcuts && typeof window.ParentShortcuts.init === 'function') {
        window.ParentShortcuts.init();
    }
}

window.init = async function () {
    try {
        const DOM = window.DOM || {};
        console.log("[INIT] Initialization started...");
        checkEnvironment();

        const params = new URLSearchParams(window.location.search);
        let project = params.get('project') || 'Default_Project';
        let fileName = params.get('file') || params.get('screen');

        state.currentProject = project;
        console.log("[INIT] Target Project:", project);

        // Fetch metadata, components, and synthesize screens
        const initResult = await _initProjectMetadataAndScreens(project, fileName);
        fileName = initResult.fileName;

        if (fileName) {
            await loadScreen(fileName);
        } else {
            if (DOM.placeholderTxt) DOM.placeholderTxt.innerText = "프로젝트 스크린을 추가해주세요.";
            if (DOM.btnAddScreen) DOM.btnAddScreen.classList.add('pulse-attention');
        }

        // Asynchronously sync repository contents in background
        const order = initResult.order || [];
        _startBackgroundScreenSync(project, order, fileName);

        // Attach global listeners and UI controls
        _bindGlobalClickDelegates();
        _bindCoreToolbarAndSidebarEvents(DOM);

    } catch (err) {
        console.error("Initialization failed:", err);
    }
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
if (window.CoreRouter && typeof window.CoreRouter.init === 'function') {
    window.CoreRouter.init();
} else if (window.MessageHub && typeof window.MessageHub.init === 'function') {
    window.MessageHub.init();
}
document.addEventListener('DOMContentLoaded', () => {
    window.init();
});

// Global Safety Guard: Ensure lingering drag guides are cleared on mouseup/pointerup, but preserve active selection SmartGuide
['mouseup', 'pointerup'].forEach(evtType => {
    window.addEventListener(evtType, () => {
        if (window.SmartGuide) {
            // If a component selection guide is currently active, preserve it for its full duration!
            if (window.SmartGuide.selectionTimer || window.SmartGuide.pendingSelection) {
                return;
            }
            window.SmartGuide.clearGuides(false);
        }
    });
});
