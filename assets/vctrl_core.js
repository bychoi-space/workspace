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

function getInlinedEngineScript() {
    if (_cachedEngineScriptBlock && window.__DEV_NO_CACHE__ !== true) {
        return _cachedEngineScriptBlock;
    }
    _cachedEngineScriptBlock = '<script id="v4-inlined-script">\n' +
        '// Engine Script Initialized: ' + Date.now() + '\n' +
        (window.v4TypographyScript || '') + '\n' +
        (window.v4UndoScript || '') + '\n' +
        (window.v4TableScript || '') + '\n' +
        (window.v4TextMeasurerScript || '') + '\n' +
        (window.v4UIAtomsScript || '') + '\n' +
        (window.v4DesignSystemScript || '') + '\n' +
        (window.v4ShortcutsScript || '') + '\n' +
        (window.v4CommonScript || '') + '\n' +
        (window.v4ObjectShapeScript || '') + '\n' +
        (window.v4ObjectConnectorScript || '') + '\n' +
        (window.v4DragResizeScript || '') + '\n' +
        (window.v4PortConnectorScript || '') + '\n' +
        (window.v4GridScript || '') + '\n' +
        (window.v4AccordionScript || '') + '\n' +
        (window.v4TabScript || '') + '\n' +
        (window.v4ResponsiveSmartGuideScript || '') + '\n' +
        (window.v4ResponsivePinsScript || '') + '\n' +
        (window.v4Script || '') + '\n' +
        (window.v4ResponsiveMultiselectScript || '') + '\n</script>';
    return _cachedEngineScriptBlock;
}

// --- Core Logic ---
window.loadScreen = async function (fileName) {
    window.invalidateEngineScriptCache();
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

    const isResponsiveScreen = (state.projectMetadata && state.projectMetadata.screens && (
        state.projectMetadata.screens[fileName]?.type === 'responsive-ui' ||
        state.projectMetadata.screens[fileName]?.template === 'template_responsive_pc_mobile.html' ||
        state.projectMetadata.screens[fileName]?.template === 'template_admin_pc_scroll.html'
    )) || finalContent.includes('pc-browser-frame') || finalContent.includes('template_responsive_pc_mobile.html') || finalContent.includes('template_admin_pc_scroll.html');

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
    if (window.ComponentInserter && typeof window.ComponentInserter.insertAtomicComponent === 'function') {
        return window.ComponentInserter.insertAtomicComponent(type, name);
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

    const isResponsive = !!(state.isCurrentResponsiveScreen || (state.activeFile?.meta?.template === 'template_responsive_pc_mobile.html') || (state.activeFile?.meta?.template === 'template_admin_pc_scroll.html'));
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
                clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle, .lf-connector-port, svg.v4-responsive-guide-layer, .v4-marquee-box, .smart-guide-line, .v4-selection-adorner-layer, .v4-selection-adorner').forEach(el => el.remove());
                clone.querySelectorAll('.lf-component, .v4-shape').forEach(el => el.classList.remove('selected', 'dragging-now', 'hover-target', 'v4-guide-snapped'));
                clone.querySelectorAll('[style]').forEach(el => {
                    const s = el.getAttribute('style');
                    if (!s) return;
                    const rules = s.split(';').map(r => r.trim()).filter(r => {
                        if (!r) return false;
                        const idx = r.indexOf(':');
                        return idx !== -1 && r.substring(idx + 1).trim().length > 0;
                    });
                    if (rules.length > 0) {
                        el.setAttribute('style', rules.join('; ') + ';');
                    } else {
                        el.removeAttribute('style');
                    }
                });
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
            figmaUrl: state.projectMetadata?.figmaUrl || '',
            notionUrl: state.projectMetadata?.notionUrl || '',
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
                if (window.SmartGuide) window.SmartGuide.clearGuides(true);
                if (window.quillEditor) {
                    window.quillEditor.focus();
                    // Put cursor at the end of the text
                    const length = window.quillEditor.getLength();
                    window.quillEditor.setSelection(length, 0);
                }
            } else if (data.type === 'LF_SNAP_START') {
                if (window.SmartGuide) {
                    window.SmartGuide.clearGuides(true);
                    window.SmartGuide.findSnapTargets();
                }
            } else if (data.type === 'LF_CLEAR_SMARTGUIDE') {
                if (window.SmartGuide) window.SmartGuide.clearGuides(true);
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
                        const isGrid = data.isGrid || comp.classList.contains('v4-grid-container') || !!comp.querySelector('.v4-grid-container');
                        if (isGrid) {
                            return;
                        }
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
                const isResponsive = !!(data.isResponsive || state.isCurrentResponsiveScreen || (state.activeFile?.meta?.template === 'template_responsive_pc_mobile.html') || (state.activeFile?.meta?.template === 'template_admin_pc_scroll.html'));
                if (window.SmartGuide) {
                    if (isResponsive) {
                        window.SmartGuide.clearGuides(true);
                    } else {
                        window.SmartGuide.findSnapTargets();
                    }
                }
                const activeEl = document.activeElement;
                const isBtn = activeEl && (activeEl.tagName === 'BUTTON' || !!activeEl.closest('button'));
                const isTyping = !isBtn && activeEl && (
                    activeEl.tagName === 'INPUT' ||
                    activeEl.tagName === 'TEXTAREA' ||
                    activeEl.tagName === 'SELECT' ||
                    activeEl.isContentEditable
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

                        // SmartGuide 2-second selection guide trigger (non-responsive single object only)
                        if (window.SmartGuide) {
                            if (isResponsive) {
                                window.SmartGuide.clearGuides(true);
                            } else if (selectedIds.length === 1 && !data.isConnector && data.id) {
                                const compW = data.w || data.width || 100;
                                const compH = data.h || data.height || 40;
                                window.SmartGuide.showSelectionGuide(data.x, data.y, compW, compH, data.id, 2000);
                            } else if (selectedIds.length > 1) {
                                window.SmartGuide.clearGuides(true);
                            }
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
                        if (window.SmartGuide) {
                            if (isResponsive) {
                                window.SmartGuide.clearGuides(true);
                            } else if (!data.shiftKey && !data.isConnector && data.id) {
                                const compW = data.w || data.width || 100;
                                const compH = data.h || data.height || 40;
                                window.SmartGuide.showSelectionGuide(data.x, data.y, compW, compH, data.id, 2000);
                            }
                        }
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
                        window.activeCompId = newIds[0];
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
                                state.selectedComponent = { id: newIds[0], ...data.firstCompStyles };
                                if (typeof window.updateProperties === 'function') {
                                    try { window.updateProperties(data.firstCompStyles); } catch (e) { }
                                }
                            } else {
                                state.selectedComponent = null;
                                if (typeof window.updateProperties === 'function') {
                                    try { window.updateProperties(); } catch (e) { }
                                }
                            }
                        }
                    } else {
                        if (!isTyping && typeof window.updateProperties === 'function') {
                            if (newIds.length === 1 && data.firstCompStyles) {
                                state.selectedComponent = { id: newIds[0], ...data.firstCompStyles };
                            }
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
        let fileName = params.get('file') || params.get('screen');

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
            // 0-1. URL Copy Dropdown & Action Handlers
            const copyUrlBtn = e.target && e.target.closest('#btn-copy-project-url');
            const menuCopyProject = e.target && e.target.closest('#menu-copy-project-url');
            const menuCopyScreen = e.target && e.target.closest('#menu-copy-screen-url');
            const copyMenu = document.getElementById('url-copy-menu');

            if (copyUrlBtn) {
                e.preventDefault();
                e.stopPropagation();
                if (copyMenu) {
                    const isVisible = copyMenu.style.display === 'flex';
                    if (isVisible) {
                        copyMenu.style.display = 'none';
                        copyUrlBtn.classList.remove('active');
                    } else {
                        // Update screen item state before opening
                        const activeScreen = (typeof state !== 'undefined' && state && state.activeFile)
                            ? (state.activeFile.name || state.activeFile)
                            : null;
                        const screenItem = document.getElementById('menu-copy-screen-url');
                        const screenSubText = document.getElementById('menu-screen-name-sub');

                        if (activeScreen) {
                            if (screenItem) screenItem.classList.remove('disabled');
                            if (screenSubText) screenSubText.innerText = activeScreen;
                        } else {
                            if (screenItem) screenItem.classList.add('disabled');
                            if (screenSubText) screenSubText.innerText = '선택된 화면 없음';
                        }

                        copyMenu.style.display = 'flex';
                        copyUrlBtn.classList.add('active');
                    }
                }
                return;
            }

            if (menuCopyProject) {
                e.preventDefault();
                e.stopPropagation();
                if (copyMenu) copyMenu.style.display = 'none';
                const triggerBtn = document.getElementById('btn-copy-project-url');
                if (triggerBtn) triggerBtn.classList.remove('active');

                const currentProj = (typeof state !== 'undefined' && state && state.currentProject)
                    ? state.currentProject
                    : new URLSearchParams(window.location.search).get('project');
                if (currentProj) {
                    if (typeof copyProjectShortUrl === 'function') {
                        copyProjectShortUrl(currentProj);
                    }
                }
                return;
            }

            if (menuCopyScreen) {
                e.preventDefault();
                e.stopPropagation();
                if (menuCopyScreen.classList.contains('disabled')) return;

                if (copyMenu) copyMenu.style.display = 'none';
                const triggerBtn = document.getElementById('btn-copy-project-url');
                if (triggerBtn) triggerBtn.classList.remove('active');

                const currentProj = (typeof state !== 'undefined' && state && state.currentProject)
                    ? state.currentProject
                    : new URLSearchParams(window.location.search).get('project');
                const activeScreen = (typeof state !== 'undefined' && state && state.activeFile)
                    ? (state.activeFile.name || state.activeFile)
                    : null;

                if (currentProj && activeScreen) {
                    if (typeof copyProjectShortUrl === 'function') {
                        copyProjectShortUrl(currentProj, { screenName: activeScreen });
                    }
                }
                return;
            }

            // Close URL copy dropdown when clicking outside
            if (copyMenu && copyMenu.style.display === 'flex' && !e.target.closest('#url-copy-dropdown-wrapper')) {
                copyMenu.style.display = 'none';
                const triggerBtn = document.getElementById('btn-copy-project-url');
                if (triggerBtn) triggerBtn.classList.remove('active');
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
                let closedAnyModal = false;
                const addModal = document.getElementById('add-screen-modal');
                if (addModal && addModal.classList.contains('active')) {
                    addModal.classList.remove('active');
                    closedAnyModal = true;
                }
                const copyModal = document.getElementById('copy-screen-modal');
                if (copyModal && copyModal.classList.contains('active')) {
                    copyModal.classList.remove('active');
                    closedAnyModal = true;
                }
                const editModal = document.getElementById('edit-screen-modal');
                if (editModal && editModal.classList.contains('active')) {
                    editModal.classList.remove('active');
                    closedAnyModal = true;
                }
                const historyModal = document.getElementById('history-modal');
                if (historyModal && historyModal.style.display === 'flex') {
                    if (typeof window.closeHistoryPopup === 'function') {
                        window.closeHistoryPopup();
                    } else {
                        historyModal.style.display = 'none';
                    }
                    closedAnyModal = true;
                }
                if (typeof window.hideAuthModal === 'function') {
                    const authModal = document.getElementById('auth-modal');
                    if (authModal && authModal.classList.contains('active')) {
                        window.hideAuthModal();
                        closedAnyModal = true;
                    }
                }
                if (closedAnyModal) {
                    return;
                }

                // If user is currently typing in an input/textarea/quill in parent window, blur it first
                const activeEl = document.activeElement;
                if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable || activeEl.classList.contains('ql-editor'))) {
                    activeEl.blur();
                    return;
                }

                // Tier 2: Deselect all objects and hide object properties
                if (typeof window.deselectAll === 'function') {
                    window.deselectAll();
                }
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

if (typeof window.showToast !== 'function') {
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
}

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
