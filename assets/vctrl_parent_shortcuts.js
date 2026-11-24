/**
 * assets/vctrl_parent_shortcuts.js
 * Parent Window Keyboard Shortcuts & Event Proxy Engine
 * Manages parent-side hotkeys (Ctrl+S, F2, Undo/Redo, Shift+G, Escape)
 * and proxies canvas navigation/manipulation keys to the active iframe.
 */

(function () {
    'use strict';
    console.log("%c [VCTRL PARENT SHORTCUTS] Initializing Parent Shortcuts Engine... ", "background: #8b5cf6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    let _initialized = false;
    let _isInspectActive = false;

    function getActiveIframe() {
        const DOM = window.DOM || {};
        return DOM.iframe || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
    }

    function _checkNodeIsInput(node) {
        if (!node) return false;
        return node.isContentEditable ||
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName) ||
            !!(node.closest && node.closest('.ql-editor, #editor-container, .v4-editable-cell, [contenteditable="true"]'));
    }

    function isInputElement(target) {
        if (_checkNodeIsInput(target)) return true;
        if (!target || target === document.body || target === document.documentElement) {
            return _checkNodeIsInput(document.activeElement);
        }
        return false;
    }

    function handleSaveShortcut(e, isInput) {
        const keyChar = (e.key || '').toLowerCase();
        const isS = keyChar === 's' || e.code === 'KeyS';
        if ((e.ctrlKey || e.metaKey) && isS) {
            e.preventDefault();
            if (isInput && document.activeElement && typeof document.activeElement.blur === 'function') {
                try { document.activeElement.blur(); } catch (err) { }
            }
            if (typeof window.cleanupActiveEmptyTextShapeIfNeeded === 'function') {
                window.cleanupActiveEmptyTextShapeIfNeeded();
            }
            if (e.shiftKey && typeof window.handleVersionedSave === 'function') {
                window.handleVersionedSave();
            } else if (typeof window.handleGlobalSave === 'function') {
                window.handleGlobalSave();
            }
            return true;
        }
        return false;
    }

    function handleF2ModeSwitch(e, isInput) {
        const isF2 = e.key === 'F2' || e.code === 'F2';
        if (!isF2) return false;
        if (e.isComposing) return true;
        e.preventDefault();
        console.log("[VCTRL CORE] F2 key down detected in parent window. isInput:", isInput);
        if (isInput && typeof e.target.blur === 'function') {
            e.target.blur();
        }
        const activeIframe = getActiveIframe();
        if (activeIframe && activeIframe.contentWindow) {
            try { activeIframe.contentWindow.focus(); } catch (err) { }
            activeIframe.contentWindow.postMessage({
                type: 'BYCHOI_SHORTCUT_KEY_PROXY',
                code: 'F2',
                key: 'F2',
                shiftKey: !!e.shiftKey,
                ctrlKey: !!e.ctrlKey,
                metaKey: !!e.metaKey
            }, '*');
        }
        return true;
    }

    function handleUndoRedo(e) {
        const isZ = e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ';
        const isY = e.key === 'y' || e.key === 'Y' || e.code === 'KeyY';
        if ((e.ctrlKey || e.metaKey) && ((isZ && e.shiftKey) || isY)) {
            e.preventDefault();
            console.log("[V4 Core] Parent Redo (Ctrl+Y / Ctrl+Shift+Z) caught. Triggering child redo.");
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({ type: 'BYCHOI_TRIGGER_REDO' }, '*');
            }
            return true;
        }
        if ((e.ctrlKey || e.metaKey) && isZ && !e.shiftKey) {
            e.preventDefault();
            console.log("[V4 Core] Parent Ctrl+Z caught. Triggering child undo.");
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({ type: 'BYCHOI_TRIGGER_UNDO' }, '*');
            } else if (window.V4UndoManager) {
                window.V4UndoManager.undo();
            }
            return true;
        }
        return false;
    }

    function handleResponsiveGridShortcut(e, state) {
        const isShiftG = !e.ctrlKey && !e.metaKey && e.shiftKey && (e.key === 'G' || e.key === 'g' || e.code === 'KeyG');
        if (isShiftG && state && state.isCurrentResponsiveScreen) {
            e.preventDefault();
            if (typeof window.toggleResponsiveGrid === 'function') {
                window.toggleResponsiveGrid();
            }
            return true;
        }
        return false;
    }

    function handleEscapeKey(e) {
        if (e.key !== 'Escape') return false;

        if (document.body.classList.contains('fullscreen-mode') || document.body.classList.contains('zen-mode')) {
            if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true);
            else if (window.ResolutionEngine && typeof window.ResolutionEngine.toggleZenMode === 'function') window.ResolutionEngine.toggleZenMode(false);
            return true;
        }

        const bottomSheet = document.getElementById('v4-bottom-sheet');
        if (bottomSheet && bottomSheet.classList.contains('is-open')) {
            if (window.ResolutionEngine && typeof window.ResolutionEngine.closeBottomSheet === 'function') {
                window.ResolutionEngine.closeBottomSheet();
            } else {
                bottomSheet.classList.remove('is-open');
            }
            return true;
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
        const canvasBgModal = document.getElementById('canvas-bg-modal');
        if (canvasBgModal && (canvasBgModal.classList.contains('active') || canvasBgModal.style.display === 'flex' || canvasBgModal.style.display === 'block')) {
            canvasBgModal.classList.remove('active');
            canvasBgModal.style.display = 'none';
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
        const shortcutPopover = document.getElementById('shortcut-help-popover');
        if (shortcutPopover && shortcutPopover.style.display === 'block') {
            if (typeof window.toggleShortcutHelpPopover === 'function') {
                window.toggleShortcutHelpPopover(false);
            } else {
                shortcutPopover.style.display = 'none';
            }
            closedAnyModal = true;
        }
        const saveDropdown = document.getElementById('global-save-dropdown');
        if (saveDropdown && saveDropdown.style.display === 'block') {
            saveDropdown.style.display = 'none';
            closedAnyModal = true;
        }
        if (closedAnyModal) return true;

        // If user is currently typing in parent window, blur it
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable || activeEl.classList.contains('ql-editor'))) {
            const wasQuill = !!(activeEl.classList && activeEl.classList.contains('ql-editor'));
            activeEl.blur();
            if (wasQuill && typeof window.cleanupActiveEmptyTextShapeIfNeeded === 'function') {
                window.cleanupActiveEmptyTextShapeIfNeeded();
            }
            return true;
        }

        // Tier 1.5: If PPT Image Crop Mode is active, cancel crop mode instead of deselecting all objects
        if (window.state && window.state.isImageCropping) {
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({ type: 'BYCHOI_IMAGE_CROP_CANCEL' }, '*');
            }
            return true;
        }

        // Tier 2: Deselect all objects and hide object properties
        if (typeof window.deselectAll === 'function') {
            window.deselectAll();
        }
        return true;
    }

    function handleProxyCanvasShortcuts(e) {
        const proxiedCodes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace', 'Space'];
        const keyCharProxy = (e.key || '').toLowerCase();
        const isC = keyCharProxy === 'c' || e.code === 'KeyC';
        const isX = keyCharProxy === 'x' || e.code === 'KeyX';
        const isV = keyCharProxy === 'v' || e.code === 'KeyV';
        const isG = keyCharProxy === 'g' || e.code === 'KeyG';
        const isCtrlShortcut = (e.ctrlKey || e.metaKey) && (isC || isX || isV || isG);

        // For plain Ctrl+V / Cmd+V (without Shift), allow the native 'paste' event to fire on parent window
        // so setupParentPasteProxy can inspect OS clipboard images (Chrome copy / Windows Snipping Tool).
        if ((e.ctrlKey || e.metaKey) && isV && !e.shiftKey) {
            const keydownStamp = Date.now();
            setTimeout(function () {
                if ((window.__bychoi_last_parent_paste_time__ || 0) < keydownStamp) {
                    const activeIframe = getActiveIframe();
                    if (activeIframe && activeIframe.contentWindow) {
                        try { activeIframe.contentWindow.focus(); } catch (err) { }
                        activeIframe.contentWindow.postMessage({
                            type: 'BYCHOI_SHORTCUT_KEY_PROXY',
                            code: e.code || 'KeyV',
                            key: e.key || 'v',
                            shiftKey: false,
                            ctrlKey: true,
                            metaKey: false
                        }, '*');
                    }
                }
            }, 80);
            return true;
        }

        if (proxiedCodes.includes(e.code) || isCtrlShortcut) {
            if ((e.ctrlKey || e.metaKey) && (isC || isX) && !e.shiftKey) {
                const st = window.state || {};
                const hasSelection = !!(st.selectedComponent || (st.selectedIds && st.selectedIds.length > 0) || (window.ConnectorEngine && typeof window.ConnectorEngine.getSelectedIds === 'function' && window.ConnectorEngine.getSelectedIds().length > 0));
                if (hasSelection) {
                    try {
                        const onCopy = function (ce) {
                            if (ce && ce.clipboardData) {
                                ce.clipboardData.setData('text/plain', '');
                                ce.preventDefault();
                            }
                        };
                        document.addEventListener('copy', onCopy, true);
                        document.execCommand('copy');
                        document.removeEventListener('copy', onCopy, true);
                    } catch (err) { }
                }
            }
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                try { activeIframe.contentWindow.focus(); } catch (err) { }
                activeIframe.contentWindow.postMessage({
                    type: 'BYCHOI_SHORTCUT_KEY_PROXY',
                    code: e.code,
                    key: e.key,
                    shiftKey: e.shiftKey,
                    ctrlKey: e.ctrlKey,
                    metaKey: e.metaKey
                }, '*');

                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Space'].includes(e.code) || isCtrlShortcut) {
                    e.preventDefault();
                }
            }
            return true;
        }
        return false;
    }

    function handleAltShiftInspect(e) {
        if (e.key === 'Shift' || e.key === 'Alt') {
            _isInspectActive = true;
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({
                    type: 'BYCHOI_SET_ALT_KEY_STATE',
                    isAltDown: true
                }, '*');
            }
            return true;
        }
        return false;
    }

    function isFullscreenPresentationActive() {
        if (typeof window.isFullscreenModeActive === 'function') {
            return window.isFullscreenModeActive();
        }
        const doc = document;
        const isNativeFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        return !!(doc.body && doc.body.classList && doc.body.classList.contains('fullscreen-mode')) || isNativeFs;
    }

    function handlePageScreenNavigation(e, isInput, state) {
        const isPageUp = e.key === 'PageUp' || e.code === 'PageUp';
        const isPageDown = e.key === 'PageDown' || e.code === 'PageDown';
        const isFs = isFullscreenPresentationActive();
        const isFsArrowUp = isFs && (e.key === 'ArrowUp' || e.code === 'ArrowUp');
        const isFsArrowDown = isFs && (e.key === 'ArrowDown' || e.code === 'ArrowDown');

        if (!isPageUp && !isPageDown && !isFsArrowUp && !isFsArrowDown) return false;
        if (e.isComposing || isInput) return false;
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return false;
        if (state && state.isImageCropping) return false;
        if (typeof window.isBlockingOverlayOpen === 'function' && window.isBlockingOverlayOpen()) return false;

        e.preventDefault();
        if (e.repeat) return true;

        if (typeof window.navigateScreenByOffset === 'function') {
            const dir = (isPageUp || isFsArrowUp) ? -1 : 1;
            window.navigateScreenByOffset(dir);
        }
        return true;
    }

    function executeWorkspaceShortcut(action) {
        const state = window.state || {};
        if (typeof window.isBlockingOverlayOpen === 'function' && window.isBlockingOverlayOpen() && action !== 'escape_fallback') {
            return false;
        }
        if (state && state.isImageCropping && action !== 'escape_fallback') {
            return false;
        }

        const isNarrow = !!(document.body && document.body.classList.contains('res-narrow'));

        switch (action) {
            case 'zoom_in':
                if (typeof window.adjustZoom === 'function') window.adjustZoom(0.1);
                return true;
            case 'zoom_out':
                if (typeof window.adjustZoom === 'function') window.adjustZoom(-0.1);
                return true;
            case 'toggle_fullscreen':
                if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen();
                return true;
            case 'toggle_left_sidebar':
                if (!isNarrow && typeof window.toggleSidebar === 'function') window.toggleSidebar('left');
                return true;
            case 'toggle_right_sidebar':
                if (!isNarrow && typeof window.toggleSidebar === 'function') window.toggleSidebar('right');
                return true;
            case 'tab_editor':
                if (!state.isReadOnly && !isNarrow && typeof window.switchSidebarTab === 'function') window.switchSidebarTab('editor');
                return true;
            case 'tab_description':
                if (!isNarrow && typeof window.switchSidebarTab === 'function') window.switchSidebarTab('description');
                return true;
            case 'tool_select':
                if (!state.isReadOnly && typeof window.setTool === 'function') window.setTool('select');
                return true;
            case 'tool_hand':
                if (typeof window.setTool === 'function') window.setTool('hand');
                return true;
            case 'tool_text':
                if (!state.isReadOnly && typeof window.handleTextboxCreation === 'function') window.handleTextboxCreation();
                return true;
            case 'toggle_shortcut_help':
                if (typeof window.toggleShortcutHelpPopover === 'function') window.toggleShortcutHelpPopover();
                return true;
            case 'versioned_save':
                if (!state.isReadOnly && typeof window.handleVersionedSave === 'function') window.handleVersionedSave();
                return true;
            case 'escape_fallback':
                return handleEscapeKey({ key: 'Escape', code: 'Escape' });
            default:
                return false;
        }
    }
    window.executeWorkspaceShortcut = executeWorkspaceShortcut;

    function handleZoomShortcuts(e) {
        if (!(e.ctrlKey || e.metaKey) || e.altKey) return false;
        if (typeof window.isBlockingOverlayOpen === 'function' && window.isBlockingOverlayOpen()) return false;

        const isZoomOut = (e.code === 'Minus' || e.code === 'NumpadSubtract' || e.key === '-' || e.key === '_');
        const isZoomIn = (e.code === 'Equal' || e.code === 'NumpadAdd' || e.key === '+' || e.key === '=');
        if (!isZoomOut && !isZoomIn) return false;

        e.preventDefault();
        executeWorkspaceShortcut(isZoomOut ? 'zoom_out' : 'zoom_in');
        return true;
    }

    function handleSingleKeyWorkspaceShortcuts(e, isInput, state) {
        if (isInput || e.isComposing) return false;
        if (e.ctrlKey || e.metaKey || e.altKey) return false;
        if (state && state.isImageCropping) return false;

        // '?' (Shift + /) toggles Shortcut Help Popover in both Edit and Read-Only modes
        if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
            if (typeof window.isBlockingOverlayOpen === 'function' && window.isBlockingOverlayOpen()) return false;
            e.preventDefault();
            return executeWorkspaceShortcut('toggle_shortcut_help');
        }

        if (e.shiftKey) return false;
        if (typeof window.isBlockingOverlayOpen === 'function' && window.isBlockingOverlayOpen()) return false;

        const code = e.code || '';
        const keyLower = (e.key || '').toLowerCase();

        if (code === 'KeyF' || keyLower === 'f') {
            e.preventDefault();
            return executeWorkspaceShortcut('toggle_fullscreen');
        }
        if (code === 'KeyL' || keyLower === 'l') {
            e.preventDefault();
            return executeWorkspaceShortcut('toggle_left_sidebar');
        }
        if (code === 'KeyR' || keyLower === 'r') {
            e.preventDefault();
            return executeWorkspaceShortcut('toggle_right_sidebar');
        }
        if (code === 'KeyD' || keyLower === 'd') {
            e.preventDefault();
            return executeWorkspaceShortcut('tab_description');
        }
        if (code === 'KeyH' || keyLower === 'h') {
            e.preventDefault();
            return executeWorkspaceShortcut('tool_hand');
        }

        if (state && state.isReadOnly) return false;

        if (code === 'KeyE' || keyLower === 'e') {
            e.preventDefault();
            return executeWorkspaceShortcut('tab_editor');
        }
        if (code === 'KeyV' || keyLower === 'v') {
            e.preventDefault();
            return executeWorkspaceShortcut('tool_select');
        }
        if (code === 'KeyT' || keyLower === 't') {
            e.preventDefault();
            return executeWorkspaceShortcut('tool_text');
        }
        return false;
    }

    function initParentShortcuts() {
        if (_initialized) return;
        _initialized = true;

        // Unified Global Keyboard Shortcuts & Event Proxying to Canvas Iframe
        window.addEventListener('keydown', function (e) {
            const state = window.state || {};
            const isInput = isInputElement(e.target);

            // 0. PageUp / PageDown Screen Navigation (Active in both Edit & Read-Only / Presentation Modes)
            if (handlePageScreenNavigation(e, isInput, state)) return;

            // 0.5. Canvas Zoom Shortcuts (Ctrl + +/-, Active in both Edit & Read-Only Modes)
            if (handleZoomShortcuts(e)) return;

            // 0.8. Read-Only Escape & Viewer Navigation Shortcuts (Fullscreen Exit, Modal Dismiss, Sidebar L/R, Description D, Hand H)
            if (state.isReadOnly) {
                if (handleEscapeKey(e)) return;
                handleSingleKeyWorkspaceShortcuts(e, isInput, state);
                return;
            }

            // 1. Global Save Shortcut (Ctrl+S / Cmd+S)
            if (handleSaveShortcut(e, isInput)) return;

            // 2. F2 Mode Switch
            if (handleF2ModeSwitch(e, isInput)) return;

            // If user is typing in any input/textarea/editor, do NOT process parent shortcuts (except Escape to blur/close modal)
            if (isInput) {
                if (e.key === 'Escape') handleEscapeKey(e);
                return;
            }

            // 3. Undo / Redo Global Shortcuts
            if (handleUndoRedo(e)) return;

            // 4. Shift+G Responsive Grid Toggle
            if (handleResponsiveGridShortcut(e, state)) return;

            // 4.5. PPT Image Crop Mode Enter / Delete Guard
            if (state && state.isImageCropping) {
                if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
                    e.preventDefault();
                    const activeIframe = getActiveIframe();
                    if (activeIframe && activeIframe.contentWindow) {
                        activeIframe.contentWindow.postMessage({ type: 'BYCHOI_IMAGE_CROP_APPLY' }, '*');
                    }
                    return;
                }
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    return;
                }
            }

            // 5. Escape Key Handling
            if (handleEscapeKey(e)) return;

            // 5.5. Single-Key Workspace Shortcuts (F, L, R, E, D, V, H, T)
            if (handleSingleKeyWorkspaceShortcuts(e, isInput, state)) return;

            // 6. Proxy Canvas Shortcuts to Iframe
            handleProxyCanvasShortcuts(e);

            // 7. Alt/Shift Inspect State
            handleAltShiftInspect(e);
        });

        window.addEventListener('keyup', function (e) {
            const isInput = isInputElement(e.target);
            if (isInput) return;

            const activeIframe = getActiveIframe();

            if (e.key === 'Shift' || e.key === 'Alt') {
                if (!e.shiftKey && !e.altKey) {
                    _isInspectActive = false;
                    if (activeIframe && activeIframe.contentWindow) {
                        activeIframe.contentWindow.postMessage({
                            type: 'BYCHOI_SET_ALT_KEY_STATE',
                            isAltDown: false
                        }, '*');
                    }
                }
            }

            if (e.code === 'Space') {
                if (activeIframe && activeIframe.contentWindow) {
                    activeIframe.contentWindow.postMessage({
                        type: 'BYCHOI_SHORTCUT_KEY_PROXY',
                        code: e.code,
                        key: e.key,
                        shiftKey: e.shiftKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey
                    }, '*');
                }
            }

            // Proxy Arrow key releases to iframe
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                if (activeIframe && activeIframe.contentWindow) {
                    activeIframe.contentWindow.postMessage({
                        type: 'BYCHOI_SHORTCUT_KEY_PROXY',
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

        window.addEventListener('blur', function () {
            if (!_isInspectActive) return;
            _isInspectActive = false;
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({
                    type: 'BYCHOI_SET_ALT_KEY_STATE',
                    isAltDown: false
                }, '*');
            }
        });

        console.log("[ParentShortcuts] Global keyboard shortcuts initialized.");
    }

    window.ParentShortcuts = {
        init: initParentShortcuts
    };

})();
