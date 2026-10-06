/**
 * assets/vctrl_core_router.js
 * Core Message Router & Dispatcher (Parent Side)
 * Manages parent-side MessageHub registration, global mouseup synchronization,
 * paste event proxying, and the central v4ParentCoreHandlers dispatch table.
 */

(function () {
    'use strict';
    console.log("%c [VCTRL CORE ROUTER] Initializing Core Message Router... ", "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    // Global mouseup handler to release active drag/marquee states when releasing mouse outside of iframe
    function setupParentMouseUpProxy() {
        window.addEventListener('mouseup', function () {
            const DOM = window.DOM;
            if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                DOM.iframe.contentWindow.postMessage({ type: 'LF_PARENT_MOUSEUP' }, '*');
            }
        });
    }

    // Modular Parent Core Message Handlers Table Map (SSOT)
    const v4ParentCoreHandlers = {
                'LF_FOCUS_PARENT_QUILL': function () {
                    if (window.SmartGuide) window.SmartGuide.clearGuides(true);
                    if (window.quillEditor) {
                        window.quillEditor.focus();
                        const length = window.quillEditor.getLength();
                        window.quillEditor.setSelection(length, 0);
                    }
                },
                'LF_SNAP_START': function () {
                    if (window.SmartGuide) {
                        window.SmartGuide.clearGuides(true);
                        window.SmartGuide.findSnapTargets();
                    }
                },
                'LF_CLEAR_SMARTGUIDE': function () {
                    if (window.SmartGuide) window.SmartGuide.clearGuides(true);
                },
                'LF_SNAP_REQUEST': function (data, e) {
                    const DOM = window.DOM;
                    const targetWindow = (DOM && DOM.iframe && DOM.iframe.contentWindow) || e.source;
                    if (window.SmartGuide && targetWindow) {
                        const snap = window.SmartGuide.calculateSnap(data.x, data.y, data.w, data.h, !!data.isArrowKey, data.activeId);
                        window.SmartGuide.drawGuides(snap);
                        window.MessageHub.send(targetWindow, 'LF_SNAP_RESPONSE', snap);
                    }
                },
                'LF_SNAP_END': function (data) {
                    if (window.SmartGuide) {
                        if (data && data.x !== undefined && data.y !== undefined && data.id) {
                            const compW = data.w || data.width || 100;
                            const compH = data.h || data.height || 40;
                            window.SmartGuide.showSelectionGuide(data.x, data.y, compW, compH, data.id, 7000);
                        } else {
                            window.SmartGuide.clearGuides();
                        }
                    }
                },
                'LF_DESELECT': function () {
                    if (window.SmartGuide) window.SmartGuide.clearGuides(true);
                },
                'LF_RESTORE_CONNECTORS': function (data) {
                    if (window.state && data.connectors) {
                        window.state.connectors = data.connectors;
                        if (window.ConnectorEngine) window.ConnectorEngine.redrawAll();
                    }
                },
                'LF_TOGGLE_GRID_REQUEST': function () {
                    if (typeof window.toggleResponsiveGrid === 'function') {
                        window.toggleResponsiveGrid();
                    }
                },
                'LF_UPDATE_PIN_POS': function (data) {
                    if (window.state && window.state.activeFile && window.state.activeFile.meta.description) {
                        const pin = window.state.activeFile.meta.description[data.index];
                        if (pin) {
                            if (!pin.pins) pin.pins = {};
                            if (data.frame === 'left') {
                                pin.pins.left = { x: data.x, y: data.y, active: true };
                                pin.pins.pc = pin.pins.left;
                                pin.target = 'frame';
                                pin.x = data.x;
                                pin.y = data.y;
                            } else if (data.frame === 'right') {
                                pin.pins.right = { x: data.x, y: data.y, active: true };
                                pin.pins.mobile = pin.pins.right;
                                pin.target = 'frame';
                            } else if (data.frame === 'canvas') {
                                pin.pins.canvas = { x: data.x, y: data.y, active: true };
                                pin.target = 'canvas';
                                pin.x = data.x;
                                pin.y = data.y;
                            } else if (data.frame === 'mobile') {
                                pin.pins.mobile = { x: data.x, y: data.y, active: true };
                                pin.pins.right = pin.pins.mobile;
                                pin.target = 'frame';
                            } else if (data.frame === 'pc') {
                                pin.pins.pc = { x: data.x, y: data.y, active: true };
                                pin.pins.left = pin.pins.pc;
                                pin.target = 'frame';
                                pin.x = data.x;
                                pin.y = data.y;
                            } else {
                                pin.x = data.x;
                                pin.y = data.y;
                            }
                            if (data.standardized) pin.standardized = true;
                            if (typeof window.markAsDirty === 'function') window.markAsDirty();
                        }
                    }
                },
                'LF_CREATE_GROUND_PIN': function (data) {
                    const state = window.state || {};
                    if (state.isReadOnly) return;
                    if (!state.activeFile) return;
                    if (!state.activeFile.meta.description) {
                        state.activeFile.meta.description = [];
                    }
                    const newIdx = state.activeFile.meta.description.length;
                    const posX = Math.round(data.x || 800);
                    const posY = Math.round(data.y || 450);

                    state.activeFile.meta.description.push({
                        type: "pin",
                        target: "canvas",
                        text: "Edit Text",
                        html: '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; padding:2px 4px; display:block; text-align:left; line-height:1.5;">Edit Text</div>',
                        x: posX,
                        y: posY,
                        pins: {
                            canvas: { x: posX, y: posY, active: true }
                        },
                        standardized: true
                    });

                    if (typeof window.renderDescriptionList === 'function') {
                        window.renderDescriptionList();
                    }

                    const DOM = window.DOM || {};
                    if (DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                        window.MessageHub.send(DOM.iframe.contentWindow, 'LF_INSERT_GROUND_PIN', {
                            index: newIdx,
                            number: newIdx + 1,
                            x: posX,
                            y: posY
                        });
                    }
                    if (typeof window.markAsDirty === 'function') window.markAsDirty();
                },
                'LF_DELETE_PIN': function (data) {
                    if (window.state && window.state.activeFile && window.state.activeFile.meta.description) {
                        window.state.activeFile.meta.description.splice(data.index, 1);
                        if (typeof window.renderDescriptionList === 'function') {
                            window.renderDescriptionList(window.state.activeFile.meta.description);
                        }
                        const DOM = window.DOM;
                        if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                            window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REORDER_PINS', { deletedIndex: data.index, pins: window.state.activeFile.meta.description });
                        }
                        if (typeof window.markAsDirty === 'function') window.markAsDirty();
                    }
                },
                'LF_TABLE_SIZE_CHANGED': function () {
                    if (typeof window.markAsDirty === 'function') window.markAsDirty();
                },
                'LF_COMP_SELECTED': function (data) {
                    const state = window.state || {};
                    const isResponsive = !!(data.isResponsive || state.isCurrentResponsiveScreen || (state.activeFile?.meta?.template === 'template_responsive_pc_mobile.html') || (state.activeFile?.meta?.template === 'template_admin_pc_scroll.html') || (state.activeFile?.meta?.template === 'template_responsive_mobile_compare.html'));
                    if (window.SmartGuide) {
                        if (isResponsive) {
                            window.SmartGuide.clearGuides(true);
                        } else {
                            window.SmartGuide.findSnapTargets();
                        }
                    }
                    const activeEl = document.activeElement;
                    const isBtn = activeEl && (activeEl.tagName === 'BUTTON' || !!activeEl.closest('button'));
                    let isTyping = !isBtn && activeEl && (
                        activeEl.tagName === 'INPUT' ||
                        activeEl.tagName === 'TEXTAREA' ||
                        activeEl.tagName === 'SELECT' ||
                        activeEl.isContentEditable
                    );

                    const isNewSelection = Boolean(data.id && data.id !== state.editingIndex);
                    if (isNewSelection && activeEl && typeof activeEl.blur === 'function') {
                        activeEl.blur();
                        isTyping = false;
                    }

                    if (data.isDescriptionPin) {
                        state.isEditing = false;
                        state.editingIndex = -1;
                        if (window.state) window.state.selectedComponent = null;
                        if (!isTyping && typeof window.switchSidebarTab === 'function') window.switchSidebarTab('description');
                        if (typeof window.focusDescriptionRow === 'function') {
                            window.focusDescriptionRow(data.pinIndex, false);
                        }
                        const DOM = window.DOM;
                        if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                            try { DOM.iframe.contentWindow.focus(); } catch (err) { }
                        }
                    } else {
                        state.isEditing = true;
                        state.editingIndex = data.id;
                        if (window.state) {
                            window.state.selectedComponent = Object.assign({ id: data.id }, data);
                        }

                        if (window.GroupingManager) {
                            let selectedIds = (typeof window.GroupingManager.getSelectedIds === 'function') ? [...window.GroupingManager.getSelectedIds()] : [];
                            let selectedIdsIsGroupMap = (typeof window.GroupingManager.getSelectedIdsIsGroupMap === 'function') ? Object.assign({}, window.GroupingManager.getSelectedIdsIsGroupMap()) : {};

                            if (data.shiftKey) {
                                if (selectedIds.includes(data.id)) {
                                    selectedIds = selectedIds.filter(function (id) { return id !== data.id; });
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

                            if (window.SmartGuide) {
                                if (isResponsive) {
                                    window.SmartGuide.clearGuides(true);
                                } else if (selectedIds.length === 1 && !data.isConnector && data.id) {
                                    const compW = data.w || data.width || 100;
                                    const compH = data.h || data.height || 40;
                                    window.SmartGuide.showSelectionGuide(data.x, data.y, compW, compH, data.id, 7000);
                                } else if (selectedIds.length > 1) {
                                    window.SmartGuide.clearGuides(true);
                                }
                            }

                            const DOM = window.DOM;
                            if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                                window.MessageHub.send(DOM.iframe.contentWindow, 'LF_UPDATE_MARQUEE_SELECTION', { ids: selectedIds });
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
                                    window.SmartGuide.showSelectionGuide(data.x, data.y, compW, compH, data.id, 7000);
                                }
                            }
                            if (!isTyping && typeof window.updateProperties === 'function') window.updateProperties(data);
                        }
                    }
                },
                'LF_MULTI_SELECTION_STYLES': function (data) {
                    if (window.state) {
                        window.state.selectedComponent = Object.assign({ id: data.id }, data);
                        window.state.selectedComponentStyles = data;
                    }
                    const activeEl = document.activeElement;
                    const isBtn = activeEl && (activeEl.tagName === 'BUTTON' || !!activeEl.closest('button'));
                    const isTyping = !isBtn && activeEl && (
                        activeEl.tagName === 'INPUT' ||
                        activeEl.tagName === 'TEXTAREA' ||
                        activeEl.tagName === 'SELECT' ||
                        activeEl.isContentEditable
                    );
                    if (!isTyping && typeof window.updateProperties === 'function') {
                        window.updateProperties(data);
                    }
                },
                'LF_PASTE_COMPLETED': function (data) {
                    const state = window.state || {};
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

                        const DOM = window.DOM;
                        if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
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
                            if (DOM && DOM.iframe && DOM.iframe.contentWindow) {
                                window.MessageHub.send(DOM.iframe.contentWindow, 'LF_UPDATE_MARQUEE_SELECTION', { ids: newIds });
                            }
                            if (!isTyping) {
                                if (newIds.length === 1 && data.firstCompStyles) {
                                    state.selectedComponent = Object.assign({ id: newIds[0] }, data.firstCompStyles);
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
                                    state.selectedComponent = Object.assign({ id: newIds[0] }, data.firstCompStyles);
                                }
                                try { window.updateProperties(data.firstCompStyles || {}); } catch (e) { }
                            }
                        }

                        if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
                        if (DOM && DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = 'none';
                        if (DOM && DOM.canvas) DOM.canvas.classList.remove('hand-active');
                        if (window.state) window.state.isHandMode = false;
                    } catch (pasteErr) {
                        console.error("[Core] Error in LF_PASTE_COMPLETED handler:", pasteErr);
                    }
                },
                'LF_SPACE_DOWN': function () {
                    const DOM = window.DOM;
                    if (DOM && DOM.canvas) DOM.canvas.classList.add('hand-active');
                    if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                    if (window.state) window.state.isHandMode = true;
                },
                'LF_SPACE_UP': function () {
                    const DOM = window.DOM;
                    if (DOM && DOM.canvas) DOM.canvas.classList.remove('hand-active');
                    if (DOM && DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
                    if (window.state) window.state.isHandMode = false;
                },
                'LF_IFRAME_WHEEL_ZOOM': function (data) {
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
                        state.viewMode = 'custom';
                        if (typeof window.updateTransform === 'function') {
                            window.updateTransform();
                        }
                    }
                },
                'LF_TOGGLE_CRISP_VIEW': function () {
                    if (typeof window.toggleCrispView === 'function') {
                        window.toggleCrispView();
                    }
                },
                'LF_DIRTY': function () {
                    if (typeof window.markAsDirty === 'function') {
                        window.markAsDirty();
                    }
                },
                'LF_TRIGGER_SAVE': function () {
                    if (typeof window.handleGlobalSave === 'function') {
                        window.handleGlobalSave();
                    }
                },
                'LF_SHOW_TOAST': function (data) {
                    if (typeof window.showToast === 'function') {
                        window.showToast(data.message, data.toastType || 'info');
                    }
                },
                'LF_INSERT_IMAGE_COMP': function (data) {
                    const base64 = data.base64;
                    if (!base64) return;
                    const img = new Image();
                    img.onload = function () {
                        const origW = img.naturalWidth || 200;
                        const origH = img.naturalHeight || 200;
                        const naturalRatio = origW / origH;
                        let w = origW;
                        let h = origH;
                        if (naturalRatio < 0.65) {
                            w = 320;
                            h = Math.round(w / naturalRatio);
                            if (h > 750) {
                                h = 750;
                                w = Math.round(h * naturalRatio);
                            }
                        } else if (w > 560 || h > 450) {
                            const scale = Math.min(560 / w, 450 / h);
                            w = Math.round(w * scale);
                            h = Math.round(h * scale);
                        }
                        if (typeof window.insertImageComponent === 'function') {
                            window.insertImageComponent(base64, w + 'px', h + 'px', origW, origH);
                        }
                    };
                    img.src = base64;
                }
    };

    // Expose parent core handlers table map for extensible hook wiring
    window.v4ParentCoreHandlers = v4ParentCoreHandlers;

    // Parent-side paste event listener for handling pasted image files when parent has focus
    function setupParentPasteProxy() {
        window.addEventListener('paste', function (e) {
            const activeEl = document.activeElement;
            const isInput = activeEl && (activeEl.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.closest('.ql-editor'));
            if (isInput) return;

            const items = (e.clipboardData || window.clipboardData)?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (!file) continue;
                    const reader = new FileReader();
                    reader.onload = function (evt) {
                        const base64 = evt.target.result;
                        const img = new Image();
                        img.onload = function () {
                            const origW = img.naturalWidth || 200;
                            const origH = img.naturalHeight || 200;
                            const naturalRatio = origW / origH;
                            let w = origW;
                            let h = origH;
                            if (naturalRatio < 0.65) {
                                w = 320;
                                h = Math.round(w / naturalRatio);
                                if (h > 750) {
                                    h = 750;
                                    w = Math.round(h * naturalRatio);
                                }
                            } else if (w > 560 || h > 450) {
                                const scale = Math.min(560 / w, 450 / h);
                                w = Math.round(w * scale);
                                h = Math.round(h * scale);
                            }

                            if (typeof window.insertImageComponent === 'function') {
                                window.insertImageComponent(base64, w + 'px', h + 'px', origW, origH);
                            }
                        };
                        img.src = base64;
                    };
                    reader.readAsDataURL(file);
                    e.preventDefault();
                    break;
                }
            }
        });
    }

    // Central MessageHub SSOT
    window.MessageHub = {
        handlers: {},
        _initialized: false,

        // Support multiple subscribers for the same message type
        subscribe: function (type, callback) {
            if (!this.handlers[type]) this.handlers[type] = [];
            this.handlers[type].push(callback);
        },

        register: function (type, callback) {
            console.warn('[MessageHub] register() is deprecated. Use subscribe() instead.');
            this.subscribe(type, callback);
        },

        init: function () {
            if (this._initialized) return;
            this._initialized = true;
            const self = this;

            setupParentMouseUpProxy();
            setupParentPasteProxy();

            window.addEventListener('message', function (e) {
                const data = e.data;
                if (!data || !data.type) return;

                if (window.DEBUG_MODE) {
                    console.log('%c[MessageHub] IN: ' + data.type, "color: #10b981;", data);
                }

                // Dispatch core handler from table map
                const coreHandler = v4ParentCoreHandlers[data.type];
                if (typeof coreHandler === 'function') {
                    coreHandler(data, e);
                }

                // Call all registered subscribers
                if (self.handlers[data.type]) {
                    self.handlers[data.type].forEach(function (callback) {
                        try {
                            callback(data);
                        } catch (err) {
                            console.error('[MessageHub] Error in handler for "' + data.type + '":', err);
                        }
                    });
                }
            });
            console.log("[MessageHub] Central message listener active (Decoupled CoreRouter).");
        },

        send: function (targetWindow, type, data) {
            data = data || {};
            if (!targetWindow || !targetWindow.postMessage) {
                console.error("[MessageHub] Invalid target for postMessage.");
                return;
            }
            if (window.DEBUG_MODE) {
                console.log('%c[MessageHub] OUT: ' + type, "color: #3b82f6;", data);
            }
            targetWindow.postMessage(Object.assign({ type: type }, data), '*');
        }
    };

    window.CoreRouter = {
        init: function () {
            window.MessageHub.init();
        }
    };

    // Auto-initialize MessageHub on script load
    window.MessageHub.init();

})();
