/**
 * assets/vctrl_shortcuts.js
 * Keyboard Shortcuts & Clipboard sync module for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4ShortcutsScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4ShortcutsScript = `
(function() {
    let v4Clipboard = [];
    let v4StyleClipboard = null;
    let isArrowMoving = false;
    let isPastingLocked = false;

    // Pin reordering is owned and managed by vctrl_responsive_pins.js (Universal Pin Reorder Engine SSOT)
    if (!window.reorderAllPins) {
        window.reorderAllPins = function(deletedIndex) {
            console.warn("[Shortcuts] reorderAllPins called before pins module fully initialized.");
        };
    }

    // Object Clipboard and Format Painter logic decoupled into dedicated modules:
    // 1. assets/vctrl_clipboard_objects.js (window.copySelectedObjects, window.cutSelectedObjects, window.pasteCopiedObjectsFromData, window.pasteCopiedObjects)
    // 2. assets/vctrl_format_painter.js (window.copySelectedObjectStyle, window.pasteCopiedObjectStyle)
    function isInputActive(target) {
        if (!target) return false;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return true;
        if (target.closest && target.closest('.ql-editor')) return true;

        const activeEl = document.activeElement;
        const isTargetInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl ? activeEl.tagName : '');
        if (isTargetInput) return true;

        // Contenteditable is only active when activeElement is actually editing text
        const editable = (target && target.isContentEditable) ? target : (target && target.closest ? target.closest('.v4-editable-cell, [contenteditable="true"]') : null);
        if (editable && (activeEl === editable || (activeEl && editable.contains(activeEl)))) {
            return true;
        }
        if (activeEl && (activeEl.isContentEditable || (activeEl.closest && activeEl.closest('.v4-editable-cell, [contenteditable="true"]')))) {
            return true;
        }
        return false;
    }

    document.addEventListener('keydown', e => {
        const inInputEarly = isInputActive(e.target) || isInputActive(document.activeElement);

        // 100% Crisp View / Fit View Toggle Shortcut (Backquote, Home, or Alt+Backquote)
        const isCrispToggleKey = (
            e.code === 'Backquote' || 
            e.key === String.fromCharCode(96) || 
            e.key === '~' || 
            e.key === 'Home' || 
            e.code === 'Home'
        );
        if (isCrispToggleKey && !inInputEarly && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            notifyParent({ type: 'LF_TOGGLE_CRISP_VIEW' });
            return;
        }

        const isAlignKey = ['1','2','3','4','5','6'].includes(e.key) || ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Numpad1','Numpad2','Numpad3','Numpad4','Numpad5','Numpad6'].includes(e.code);
        if ((e.altKey || e.ctrlKey || e.metaKey) && isAlignKey && !inInputEarly) {
            e.preventDefault();
            const keyChar = (e.key && ['1','2','3','4','5','6'].includes(e.key)) ? e.key : (e.code ? e.code.replace('Digit', '').replace('Numpad', '') : '1');
            const typeMap = {
                '1': 'left',
                '2': 'center',
                '3': 'right',
                '4': 'top',
                '5': 'middle',
                '6': 'bottom'
            };
            if (typeMap[keyChar]) {
                notifyParent({
                    type: 'LF_SHORTCUT_ALIGN',
                    alignType: typeMap[keyChar]
                });
                return;
            }
        }

        if (e.key === 'F2' || e.code === 'F2') {
            if (e.isComposing) return;
            e.preventDefault();
            const activeElement = document.activeElement;
            const isEditing = isInputActive(activeElement);

            if (isEditing) {
                console.log("[VCTRL SHORTCUTS] Exiting inline text editing mode via F2.");
                if (activeElement && typeof activeElement.blur === 'function') activeElement.blur();
            } else {
                const selected = document.querySelectorAll('.lf-component.selected');
                if (selected.length > 0) {
                    const targetComp = selected[0];
                    const editable = targetComp.querySelector('.v4-editable-cell, [contenteditable="true"]') ||
                                     targetComp.querySelector('.v4-shape-text-content, .v4-shape-text-overlay, .v4-text-shape-content');
                    if (editable) {
                        console.log("[VCTRL SHORTCUTS] Entering inline text editing mode via F2.");
                        if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                            window.ResponsiveSmartGuide.clearGuides(true);
                        }
                        if (typeof notifyParent === 'function') {
                            notifyParent({ type: 'LF_CLEAR_SMARTGUIDE' });
                        }
                        if (typeof window.focusEditableCell === 'function') {
                            window.focusEditableCell(editable);
                        } else {
                            try {
                                window.focus();
                                if (window.top && window.top !== window) {
                                    const iframe = window.top.document.getElementById('main-iframe');
                                    if (iframe && iframe.contentWindow) iframe.contentWindow.focus();
                                }
                            } catch(err) {}
                            editable.setAttribute('contenteditable', 'true');
                            editable.focus();
                        }
                    } else {
                        console.log("[VCTRL SHORTCUTS] No inline editable element found, focusing parent Quill.");
                        notifyParent({ type: 'LF_FOCUS_PARENT_QUILL' });
                    }
                }
            }
            return;
        }

        if (e.key === 'Escape' || e.code === 'Escape') {
            const activeElement = document.activeElement;
            const isEditing = isInputActive(activeElement) || isInputActive(e.target);

            if (isEditing) {
                // Tier 1: User is editing text/input inline -> exit editing mode (blur)
                e.preventDefault();
                console.log("[VCTRL SHORTCUTS] Exiting inline text editing mode via Escape.");
                if (activeElement && typeof activeElement.blur === 'function') {
                    activeElement.blur();
                }
                return;
            }

            // Tier 2: User has object(s) selected -> deselect all objects and notify parent
            const selected = document.querySelectorAll('.lf-component.selected');
            if (selected.length > 0 || window.activeEl) {
                e.preventDefault();
                console.log("[VCTRL SHORTCUTS] Deselecting objects via Escape.");
                selected.forEach(el => el.classList.remove('selected'));
                window.activeEl = null;
                if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                    window.ResponsiveSmartGuide.clearGuides(true);
                }
                if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
                    try { window.SelectionAdorner.clear(); } catch(adErr) {}
                }
                notifyParent({ type: 'LF_DESELECT' });
                return;
            }
        }

        const isS = e.key === 's' || e.key === 'S' || e.code === 'KeyS';
        const isC = e.key === 'c' || e.key === 'C' || e.code === 'KeyC';
        const isX = e.key === 'x' || e.key === 'X' || e.code === 'KeyX';
        const isV = e.key === 'v' || e.key === 'V' || e.code === 'KeyV';
        const isG = e.key === 'g' || e.key === 'G' || e.code === 'KeyG';
        const isZ = e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ';
        const isY = e.key === 'y' || e.key === 'Y' || e.code === 'KeyY';
        const inInput = isInputActive(e.target) || isInputActive(document.activeElement);

        if ((e.ctrlKey || e.metaKey) && ((isZ && e.shiftKey) || isY) && !inInput) {
            e.preventDefault();
            if (window.V4UndoManager && typeof window.V4UndoManager.redo === 'function') {
                window.V4UndoManager.redo();
            } else if (typeof notifyParent === 'function') {
                notifyParent({ type: 'LF_TRIGGER_REDO' });
            }
            return;
        }

        if ((e.ctrlKey || e.metaKey) && isZ && !e.shiftKey && !inInput) {
            e.preventDefault();
            if (window.V4UndoManager && typeof window.V4UndoManager.undo === 'function') {
                window.V4UndoManager.undo();
            } else if (typeof notifyParent === 'function') {
                notifyParent({ type: 'LF_TRIGGER_UNDO' });
            }
            return;
        }

        if ((e.ctrlKey || e.metaKey) && isS) {
            e.preventDefault();
            notifyParent({ type: 'LF_TRIGGER_SAVE' });
            return;
        }
        if ((e.ctrlKey || e.metaKey) && isC && !inInput) {
            e.preventDefault();
            if (e.shiftKey) {
                window.copySelectedObjectStyle();
            } else {
                window.copySelectedObjects();
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && isX && !inInput) {
            e.preventDefault();
            window.cutSelectedObjects();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && isV && !inInput) {
            e.preventDefault();
            if (e.shiftKey) {
                window.pasteCopiedObjectStyle();
            } else {
                window.pasteCopiedObjects();
            }
            return;
        }

        if (!e.ctrlKey && !e.metaKey && e.shiftKey && isG && !inInput) {
            e.preventDefault();
            notifyParent({ type: 'LF_TOGGLE_GRID_REQUEST' });
            return;
        }

        if ((e.ctrlKey || e.metaKey) && isG && !inInput) {
            e.preventDefault();
            notifyParent({
                type: 'LF_SHORTCUT_TRIGGERED',
                shortcut: e.shiftKey ? 'ungroup' : 'group'
            });
            return;
        }

        if ((e.ctrlKey || e.metaKey) && !inInput) {
            if (e.key === ']' || e.code === 'BracketRight') {
                e.preventDefault();
                window.postMessage({ type: 'LF_BRING_FRONT' }, '*');
                return;
            } else if (e.key === '[' || e.code === 'BracketLeft') {
                e.preventDefault();
                window.postMessage({ type: 'LF_SEND_BACK' }, '*');
                return;
            }
        }
        else if (e.code === 'Space' && !inInput) {
            e.preventDefault();
            notifyParent({ type: 'LF_SPACE_DOWN' });
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && !inInput) {
            const selected = document.querySelectorAll('.lf-component.selected');
            if (selected.length > 0) {
                e.preventDefault();
                if (window.V4UndoManager && !isArrowMoving) {
                    window.V4UndoManager.saveState();
                    isArrowMoving = true;
                    const hasRespGuide = !!(window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive());
                    if (!hasRespGuide) {
                        notifyParent({ type: 'LF_SNAP_START' });
                    }
                }
                const step = e.shiftKey ? 10 : 1;
                let dx = 0, dy = 0;
                if (e.code === 'ArrowUp') dy = -step;
                if (e.code === 'ArrowDown') dy = step;
                if (e.code === 'ArrowLeft') dx = -step;
                if (e.code === 'ArrowRight') dx = step;

                const isRespScreen = (typeof window.isResponsiveScreen === 'function' && window.isResponsiveScreen()) || 
                                     !!(document.querySelector('.pc-content-inner, .mobile-content-inner, .pc-browser-frame'));

                const detectFrame = function(el) {
                    if (!el) return 'pc';
                    if (typeof window.detectFrameType === 'function') return window.detectFrameType(el);
                    if (typeof el.getAttribute === 'function' && el.getAttribute('data-frame')) {
                        return el.getAttribute('data-frame');
                    }
                    if (typeof el.closest === 'function') {
                        if (el.closest('.mobile-column-left')) return 'left';
                        if (el.closest('.mobile-column-right')) return 'right';
                        if (el.closest('.pc-column, .pc-browser-frame, .pc-frame, .pc-content-inner, .pc-content-area, .pc-content')) return 'pc';
                        if (el.closest('.mobile-column, .mobile-frame, .mobile-browser-frame, .mobile-content-inner, .mobile-content-area, .mobile-content')) return 'mobile';
                        if (el.closest('.mobile-compare-page, .page, #canvas-page, .canvas')) return 'canvas';
                    }
                    return 'pc';
                };

                let activeEl = (window.activeEl && Array.from(selected).includes(window.activeEl)) ? window.activeEl : null;
                if (!activeEl && isRespScreen && window.lastActiveFrame) {
                    activeEl = Array.from(selected).find(c => detectFrame(c) === window.lastActiveFrame);
                }
                if (!activeEl) {
                    activeEl = selected[0];
                }
                window.activeEl = activeEl;

                const activePinFrame = detectFrame(activeEl);
                window.lastActiveFrame = activePinFrame;

                selected.forEach(c => {
                    if (isRespScreen && c.classList.contains('pin-marker')) {
                        const cFrame = detectFrame(c);
                        if (cFrame && cFrame !== activePinFrame) {
                            return;
                        }
                    }

                    const l = parseFloat(c.style.left) || 0;
                    const t = parseFloat(c.style.top) || 0;
                    c.style.left = (l + dx) + 'px';
                    c.style.top = (t + dy) + 'px';
                    if (typeof window.updateHandles === 'function') window.updateHandles(c);
                    
                    if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                        const frameType = detectFrame(c);
                        let idx = parseInt(c.getAttribute('data-index'));
                        if (isNaN(idx)) {
                            idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''));
                        }
                        notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, frame: frameType, x: l + dx, y: t + dy });
                    }
                    
                    if (c.classList.contains('connector-line')) {
                        notifyParent({ type: 'LF_SHIFT_CONNECTOR_POS', id: c.id, dx: dx, dy: dy });
                    }
                    
                    if (c.classList.contains('lf-group')) {
                        const connIdsStr = c.getAttribute('data-connectors');
                        const connIds = connIdsStr ? JSON.parse(connIdsStr) : [];
                        connIds.forEach(connId => {
                            notifyParent({ type: 'LF_SHIFT_CONNECTOR_POS', id: connId, dx: dx, dy: dy });
                        });
                        c.querySelectorAll('.text-marker, .pin-marker').forEach(child => {
                            const idx = parseInt(child.id.replace('v4-pin-', ''));
                            const childRect = child.getBoundingClientRect();
                            const hostRect = document.body.getBoundingClientRect();
                            const absX = childRect.left - hostRect.left;
                            const absY = childRect.top - hostRect.top;
                            notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: absX, y: absY });
                        });
                    }
                });
                
                if (activeEl) {
                    if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive()) {
                        window.ResponsiveSmartGuide.onNudge(activeEl);
                    } else {
                        const logicalX = parseFloat(activeEl.style.left) || 0;
                        const logicalY = parseFloat(activeEl.style.top) || 0;
                        
                        notifyParent({ 
                            type: 'LF_SNAP_REQUEST', 
                            x: logicalX, 
                            y: logicalY, 
                            w: activeEl.offsetWidth, 
                            h: activeEl.offsetHeight,
                            activeId: activeEl.id,
                            isArrowKey: true
                        });
                    }
                }
            }
        } else if ((e.code === 'Delete' || e.code === 'Backspace') && !inInput) {
                const selected = document.querySelectorAll('.lf-component.selected');
                if (selected.length > 0) {
                    e.preventDefault();
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    
                    selected.forEach(c => {
                        if (c.classList.contains('connector-line')) {
                            notifyParent({ type: 'LF_DELETE_CONNECTOR', id: c.id });
                        } else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                            let idx = parseInt(c.getAttribute('data-index'));
                            if (isNaN(idx)) {
                                idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''));
                            }
                            notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                            c.remove();
                        } else {
                            c.remove();
                        }
                    });
                    
                    if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
                        try { window.SelectionAdorner.clear(); } catch(adErr) {}
                    }
                    notifyParent({ type: 'LF_DESELECT' });
                    markDirty();
                }
        }
    });
    document.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            notifyParent({ type: 'LF_SPACE_UP' });
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            isArrowMoving = false;
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive()) {
                window.ResponsiveSmartGuide.onNudgeEnd();
            } else {
                const activeComp = document.querySelector('.lf-component.selected') || window.activeEl;
                if (activeComp) {
                    const compW = activeComp.offsetWidth || 100;
                    const compH = activeComp.offsetHeight || 40;
                    const compL = parseFloat(activeComp.style.left) || 0;
                    const compT = parseFloat(activeComp.style.top) || 0;
                    notifyParent({
                        type: 'LF_SNAP_END',
                        id: activeComp.id,
                        x: compL,
                        y: compT,
                        w: compW,
                        h: compH
                    });
                } else {
                    notifyParent({ type: 'LF_SNAP_END' });
                }
            }
        }
    });

    document.addEventListener('paste', e => {
        const isInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
        if (isInput) return; // Allow default text paste in inputs

        const items = (e.clipboardData || window.clipboardData).items;
        let hasImage = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                console.log("[Clipboard Debug] Image detected in paste event.");
                hasImage = true;
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(evt) {
                    notifyParent({
                        type: 'LF_INSERT_IMAGE_COMP',
                        base64: evt.target.result
                    });
                };
                reader.readAsDataURL(file);
                e.preventDefault();
                break;
            }
        }
        if (!hasImage) {
            console.log("[Clipboard Debug] No image in paste event, requesting copied components from parent.");
            e.preventDefault();
            window.pasteCopiedObjects();
        }
    });

    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;
        if (d.type === 'LF_RESPONSE_CLIPBOARD') {
            console.log("[Clipboard Debug] Iframe received LF_RESPONSE_CLIPBOARD with items:", d.clipboard);
            window.pasteCopiedObjectsFromData(d.clipboard);
            return;
        }
        if (d.type === 'LF_TRIGGER_COPY_STYLE') {
            window.copySelectedObjectStyle();
            return;
        }
        if (d.type === 'LF_TRIGGER_PASTE_STYLE') {
            window.pasteCopiedObjectStyle();
            return;
        }
        if (d.type === 'LF_RESPONSE_STYLE_CLIPBOARD') {
            window.pasteCopiedObjectStyle(d.styleClipboard);
            return;
        }
        if (d.type === 'LF_SHORTCUT_KEY_PROXY') {
            const isCtrl = !!d.ctrlKey || !!d.metaKey;
            const isShift = !!d.shiftKey;
            const keyChar = (d.key || "").toLowerCase();
            const isC = keyChar === 'c' || d.code === 'KeyC';
            const isX = keyChar === 'x' || d.code === 'KeyX';
            const isV = keyChar === 'v' || d.code === 'KeyV';
            if (isCtrl && !d.isKeyUp) {
                if (isC) {
                    if (isShift) window.copySelectedObjectStyle();
                    else window.copySelectedObjects();
                    return;
                }
                if (isX) {
                    window.cutSelectedObjects();
                    return;
                }
                if (isV) {
                    if (isShift) window.pasteCopiedObjectStyle();
                    else window.pasteCopiedObjects();
                    return;
                }
            }

            let eventType = 'keydown';
            if (d.code === 'Space') eventType = 'keyup';
            else if (d.isKeyUp) eventType = 'keyup';

            const event = new KeyboardEvent(eventType, {
                code: d.code,
                key: d.key,
                shiftKey: !!d.shiftKey,
                ctrlKey: !!d.ctrlKey,
                metaKey: !!d.metaKey,
                bubbles: true
            });
            document.dispatchEvent(event);
        }
    });

    // Ctrl + Mouse Wheel Zoom Interception (Iframe -> Parent Canvas Zoom)
    window.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const msg = {
                type: 'LF_IFRAME_WHEEL_ZOOM',
                clientX: e.clientX,
                clientY: e.clientY,
                deltaY: e.deltaY
            };
            if (typeof window.notifyParent === 'function') {
                window.notifyParent(msg);
            } else if (typeof notifyParent === 'function') {
                notifyParent(msg);
            } else if (window.parent) {
                window.parent.postMessage(msg, '*');
            }
        }
    }, { passive: false });
})();
`;
