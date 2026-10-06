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

    function isInputElement(target) {
        if (!target) return false;
        return target.isContentEditable ||
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
            !!(target.closest && target.closest('.ql-editor, .v4-editable-cell, [contenteditable="true"]'));
    }

    function handleGlobalSave(e, isInput) {
        const keyChar = (e.key || '').toLowerCase();
        const isS = keyChar === 's' || e.code === 'KeyS';
        if ((e.ctrlKey || e.metaKey) && isS) {
            e.preventDefault();
            console.log("[VCTRL CORE] Global Ctrl+S caught in parent window. isInput:", isInput);
            if (isInput && document.activeElement && typeof document.activeElement.blur === 'function') {
                try { document.activeElement.blur(); } catch (err) { }
            }
            if (typeof window.handleGlobalSave === 'function') {
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
                type: 'LF_SHORTCUT_KEY_PROXY',
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
                activeIframe.contentWindow.postMessage({ type: 'LF_TRIGGER_REDO' }, '*');
            }
            return true;
        }
        if ((e.ctrlKey || e.metaKey) && isZ && !e.shiftKey) {
            e.preventDefault();
            console.log("[V4 Core] Parent Ctrl+Z caught. Triggering child undo.");
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({ type: 'LF_TRIGGER_UNDO' }, '*');
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

        if (document.body.classList.contains('fullscreen-mode')) {
            if (typeof window.toggleFullscreen === 'function') window.toggleFullscreen(true);
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
        if (closedAnyModal) return true;

        // If user is currently typing in parent window, blur it
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable || activeEl.classList.contains('ql-editor'))) {
            activeEl.blur();
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

        if (proxiedCodes.includes(e.code) || isCtrlShortcut) {
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                try { activeIframe.contentWindow.focus(); } catch (err) { }
                activeIframe.contentWindow.postMessage({
                    type: 'LF_SHORTCUT_KEY_PROXY',
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
                    type: 'LF_SET_ALT_KEY_STATE',
                    isAltDown: true
                }, '*');
            }
            return true;
        }
        return false;
    }

    function initParentShortcuts() {
        if (_initialized) return;
        _initialized = true;

        // Unified Global Keyboard Shortcuts & Event Proxying to Canvas Iframe
        window.addEventListener('keydown', function (e) {
            const state = window.state || {};
            if (state.isReadOnly) return;

            const isInput = isInputElement(e.target);

            // 1. Global Save Shortcut (Ctrl+S / Cmd+S)
            if (handleGlobalSave(e, isInput)) return;

            // 2. F2 Mode Switch
            if (handleF2ModeSwitch(e, isInput)) return;

            // If user is typing in any input/textarea/editor, do NOT process parent shortcuts
            if (isInput) return;

            // 3. Undo / Redo Global Shortcuts
            if (handleUndoRedo(e)) return;

            // 4. Shift+G Responsive Grid Toggle
            if (handleResponsiveGridShortcut(e, state)) return;

            // 5. Escape Key Handling
            if (handleEscapeKey(e)) return;

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
                            type: 'LF_SET_ALT_KEY_STATE',
                            isAltDown: false
                        }, '*');
                    }
                }
            }

            if (e.code === 'Space') {
                if (activeIframe && activeIframe.contentWindow) {
                    activeIframe.contentWindow.postMessage({
                        type: 'LF_SHORTCUT_KEY_PROXY',
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

        window.addEventListener('blur', function () {
            if (!_isInspectActive) return;
            _isInspectActive = false;
            const activeIframe = getActiveIframe();
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({
                    type: 'LF_SET_ALT_KEY_STATE',
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
