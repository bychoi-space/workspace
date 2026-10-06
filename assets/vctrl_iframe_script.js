// --- Core Constants for V4 Injection ---
if (!window.v4Styles) {
    window.v4Styles = ``;
}

window.v4Script = `
(function() {
    // --- Console Log Auto-Clearing Guard inside iframe (Preserved for debugging) ---
    (function() {
        let logCount = 0;
        const originalLog = console.log;
        console.log = function(...args) {
            logCount++;
            if (logCount > 1500) {
                // console.clear(); // Keep logs preserved for debugging visibility
                originalLog("[LF Editor Iframe] Logger threshold reached, preservation active.");
                logCount = 0;
            }
            originalLog.apply(console, args);
        };
    })();

    // Note: window.getNextTopZIndex is provided by assets/vctrl_iframe_layering.js (SSOT)

    window.syncTableComponentSize = function() {
        const s = document.querySelector('.lf-component.selected');
        if (!s) return;
        
        const table = s.querySelector('table');
        if (!table) return;
        
        const isGrid = s.classList.contains('v4-grid-container') || !!s.querySelector('.v4-grid-container');
        if (isGrid) {
            // [Grid UI SSOT] Grid UI maintains its user-defined frame size (width & height) with internal scrolling!
            return;
        }
        
        let newWidth, newHeight;
        const colgroup = table.querySelector('colgroup');
        if (colgroup && colgroup.children.length > 0) {
            let totalWidth = 0;
            Array.from(colgroup.children).forEach(col => {
                const wStr = col.style.width || col.getAttribute('width') || '100px';
                totalWidth += parseInt(wStr) || 100;
            });
            newWidth = totalWidth;
        } else {
            newWidth = table.offsetWidth;
        }
        
        const origHeight = table.style.height;
        table.style.height = 'auto';
        newHeight = table.offsetHeight;
        table.style.height = origHeight || '100%';
        
        if (!isGrid) {
            s.style.setProperty('width', newWidth + 'px', 'important');
            s.style.setProperty('height', newHeight + 'px', 'important');
            if (typeof window.updateHandles === 'function') {
                window.updateHandles(s);
            }
        }

        notifyParent({
            type: 'LF_TABLE_SIZE_CHANGED',
            compId: s.id,
            width: newWidth,
            height: newHeight,
            isGrid: isGrid
        });
    };

    let isDraggingLine = false, activeLineId = null, startLineCoords = null;



    let startX, startY, startW, startH, startTop, startLeft, startRect;


    // Note: window._getCompStyles is provided by assets/vctrl_iframe_style_extractor.js (SSOT)

    window.SelectionAdorner = {
        getContainer: function(comp) {
            if (!comp) return document.body;
            return (comp.closest && comp.closest('.pc-content-inner, .pc-content-area, .mobile-content-inner, .mobile-content-area, .mobile-content')) || document.body;
        },
        ensureLayer: function(container) {
            if (!container) return null;
            var layer = container.querySelector(':scope > .v4-selection-adorner-layer');
            if (!layer) {
                layer = document.createElement('div');
                layer.className = 'v4-selection-adorner-layer';
                layer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 310000; overflow: visible;';
                var compStyle = window.getComputedStyle(container);
                if (compStyle.position === 'static' && container !== document.body) {
                    container.style.position = 'relative';
                }
                var trailingScript = Array.from(container.children).find(function(c) {
                    return c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script';
                });
                if (trailingScript) {
                    container.insertBefore(layer, trailingScript);
                } else {
                    container.appendChild(layer);
                }
            }
            return layer;
        },
        update: function(target) {
            this.clear();
            var selectedComps = target ? [target] : Array.from(document.querySelectorAll('.lf-component.selected'));
            if (selectedComps.length === 0) return;

            var self = this;
            selectedComps.forEach(function(comp) {
                if (!comp || comp.classList.contains('connector-line')) return;
                var container = self.getContainer(comp);
                if (!container) return;
                var layer = self.ensureLayer(container);
                if (!layer) return;

                var compRect = comp.getBoundingClientRect();
                var contRect = container.getBoundingClientRect();
                var scrollL = (container === document.body) ? (window.pageXOffset || document.documentElement.scrollLeft || 0) : container.scrollLeft;
                var scrollT = (container === document.body) ? (window.pageYOffset || document.documentElement.scrollTop || 0) : container.scrollTop;

                var l = Math.round((compRect.left - contRect.left) + scrollL);
                var t = Math.round((compRect.top - contRect.top) + scrollT);
                var w = Math.round(compRect.width);
                var h = Math.round(compRect.height);

                if (w <= 0 || h <= 0) return;

                var isGroup = comp.classList.contains('lf-group');
                var box = document.createElement('div');
                box.className = 'v4-selection-adorner' + (isGroup ? ' is-group' : '');
                box.style.position = 'absolute';
                box.style.left = l + 'px';
                box.style.top = t + 'px';
                box.style.width = w + 'px';
                box.style.height = h + 'px';
                box.style.pointerEvents = 'none';
                box.style.boxSizing = 'border-box';
                box.style.zIndex = '310000';

                var borderColor = isGroup ? '#10b981' : '#6366f1';
                box.style.outline = '2px solid ' + borderColor;
                box.style.outlineOffset = '0px';
                box.style.background = 'transparent';
                var compRad = comp.style.borderRadius || window.getComputedStyle(comp).borderRadius;
                if (compRad && compRad !== '0px') {
                    box.style.borderRadius = compRad;
                }
                layer.appendChild(box);
            });
        },
        clear: function() {
            document.querySelectorAll('.v4-selection-adorner-layer').forEach(function(l) {
                l.innerHTML = '';
            });
        }
    };

    window.updateHandles = (c) => {
        if (!c) return;
        const t = parseInt(c.style.top) || 0;
        const l = parseInt(c.style.left) || 0;
        const del = c.querySelector(':scope > .lf-delete-trigger');
        if (del) { 
            const targetTop = t < 16 ? '4px' : '-12px'; 
            if (del.style.top !== targetTop) del.style.top = targetTop;
            const rightDist = window.innerWidth - (l + (c.offsetWidth || 0));
            const targetRight = rightDist < 16 ? '4px' : '-12px'; 
            if (del.style.right !== targetRight) del.style.right = targetRight;
        }
        if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
            window.SelectionAdorner.update();
        }
    };

    function detectFrameType(el) {
        if (!el) return 'pc';
        if (typeof el.getAttribute === 'function' && el.getAttribute('data-frame')) {
            return el.getAttribute('data-frame');
        }
        if (typeof el.closest === 'function') {
            if (el.closest('.mobile-column-left')) return 'left';
            if (el.closest('.mobile-column-right')) return 'right';
            if (el.closest('.pc-column, .pc-browser-frame, .pc-frame, .pc-content-inner, .pc-content-area, .pc-content')) return 'pc';
            if (el.closest('.mobile-column, .mobile-frame, .mobile-browser-frame, .mobile-content-inner, .mobile-content-area, .mobile-content')) {
                const leftCol = document.querySelector('.mobile-column-left');
                const rightCol = document.querySelector('.mobile-column-right');
                if (leftCol && leftCol.contains(el)) return 'left';
                if (rightCol && rightCol.contains(el)) return 'right';
                return 'mobile';
            }
            if (el.closest('.mobile-compare-page, .page, #canvas-page, .canvas')) return 'canvas';
        }
        return 'pc';
    }
    window.detectFrameType = detectFrameType;

    window.updateActiveFrameUI = function(typeOrCol) {
        let targetCol = null;
        let targetType = 'pc';
        if (typeOrCol && typeof typeOrCol === 'object' && typeOrCol.nodeType) {
            targetCol = typeOrCol.closest('.frame-column');
            targetType = targetCol && targetCol.classList.contains('mobile-column') ? (targetCol.classList.contains('mobile-column-left') ? 'left' : (targetCol.classList.contains('mobile-column-right') ? 'right' : 'mobile')) : 'pc';
        } else {
            targetType = typeOrCol || window.lastActiveFrame || 'pc';
        }

        const allCols = document.querySelectorAll('.frame-column');
        const allFrames = document.querySelectorAll('.pc-browser-frame, .pc-frame, .mobile-frame, .mobile-browser-frame');
        
        if (targetType === 'canvas') {
            allCols.forEach(c => c.classList.remove('active-column'));
            allFrames.forEach(f => f.classList.remove('active-frame'));
            return;
        }

        if (targetCol) {
            allCols.forEach(c => c.classList.toggle('active-column', c === targetCol));
            allFrames.forEach(f => f.classList.toggle('active-frame', f.closest('.frame-column') === targetCol));
        } else {
            const pcCols = document.querySelectorAll('.pc-column');
            const mobileCols = document.querySelectorAll('.mobile-column');
            const pcFrames = document.querySelectorAll('.pc-browser-frame, .pc-frame');
            const mobileFrames = document.querySelectorAll('.mobile-frame, .mobile-browser-frame');

            if (targetType === 'left') {
                const leftCol = document.querySelector('.mobile-column-left');
                allCols.forEach(c => c.classList.toggle('active-column', c === leftCol));
                allFrames.forEach(f => f.classList.toggle('active-frame', f.closest('.frame-column') === leftCol));
            } else if (targetType === 'right') {
                const rightCol = document.querySelector('.mobile-column-right');
                allCols.forEach(c => c.classList.toggle('active-column', c === rightCol));
                allFrames.forEach(f => f.classList.toggle('active-frame', f.closest('.frame-column') === rightCol));
            } else if (targetType === 'mobile') {
                mobileFrames.forEach(f => f.classList.add('active-frame'));
                mobileCols.forEach(c => c.classList.add('active-column'));
                pcFrames.forEach(f => f.classList.remove('active-frame'));
                pcCols.forEach(c => c.classList.remove('active-column'));
            } else if (targetType === 'pc') {
                pcFrames.forEach(f => f.classList.add('active-frame'));
                pcCols.forEach(c => c.classList.add('active-column'));
                mobileFrames.forEach(f => f.classList.remove('active-frame'));
                mobileCols.forEach(c => c.classList.remove('active-column'));
            }
        }
    };

    let isMarquee = false;
    let isConnectorDragging = false;
    let groupChildrenStart = null;
    document.addEventListener('wheel', e => {
        const mob = e.target.closest && e.target.closest('.mobile-frame, .mobile-browser-frame, .mobile-content, .mobile-content-area, .mobile-content-inner, .mobile-column, .mobile-browser-header, .mobile-top-bar');
        const pc = e.target.closest && e.target.closest('.pc-browser-frame, .pc-frame, .pc-content-area, .pc-content-inner, .pc-column, .pc-browser-header');
        if (mob) {
            const col = mob.closest('.frame-column');
            window.lastActiveFrame = detectFrameType(mob);
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI(col || window.lastActiveFrame);
        } else if (pc) {
            const col = pc.closest('.frame-column');
            window.lastActiveFrame = 'pc';
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI(col || 'pc');
        }
    }, { passive: true });
    document.addEventListener('mousedown', e => {
        if (e.target.closest('.sidebar') || e.target.closest('.modal') || e.target.closest('.header-metadata')) return;

        const mob = e.target.closest('.mobile-frame, .mobile-browser-frame, .mobile-content, .mobile-content-area, .mobile-content-inner, .mobile-column, .mobile-browser-header, .mobile-top-bar');
        const pc = e.target.closest('.pc-browser-frame, .pc-frame, .pc-content-area, .pc-content-inner, .pc-column, .pc-browser-header');
        if (mob) {
            const col = mob.closest('.frame-column');
            window.lastActiveFrame = detectFrameType(mob);
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI(col || window.lastActiveFrame);
        } else if (pc) {
            const col = pc.closest('.frame-column');
            window.lastActiveFrame = 'pc';
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI(col || 'pc');
        } else {
            const isBaseCanvas = e.target.closest('.page, .canvas, .artboard, .responsive-compare-container, body');
            if (isBaseCanvas) {
                window.lastActiveFrame = 'canvas';
                if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('canvas');
            }
        }

        let d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        
        const isDeepSelect = !!(e.ctrlKey || e.metaKey);
        const isMulti = !!e.shiftKey;

        if (c && !d) {
            if (!isDeepSelect && !c.classList.contains('text-marker') && !c.classList.contains('pin-marker')) {
                let parent = c.parentElement ? c.parentElement.closest('.lf-component') : null;
                while (parent) {
                    if (parent.classList.contains('text-marker') || parent.classList.contains('pin-marker')) break;
                    c = parent;
                    parent = c.parentElement ? c.parentElement.closest('.lf-component') : null;
                }
            }
        }

        if (d && c) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            if (c.classList.contains('connector-line')) {
                notifyParent({ type: 'LF_DELETE_CONNECTOR', id: c.id });
                c.remove();
            }
            else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                let idx = parseInt(c.getAttribute('data-index'));
                if (isNaN(idx)) {
                    idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''));
                }
                notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                c.remove();
            } else {
                c.remove();
            }

            markDirty(); 
            notifyParent({ type: 'LF_DESELECT' });
            return; 
        }
        if (c) {
            if (!c.id) {
                const isPin = c.classList.contains('pin-marker') || c.classList.contains('text-marker');
                c.id = (isPin ? 'v4-pin-' : 'v4-comp-') + Date.now() + '-' + Math.floor(Math.random() * 10000);
            }
            isMarquee = false;
            const frameType = typeof detectFrameType === 'function' ? detectFrameType(c) : (c.getAttribute('data-frame') || 'pc');
            window.lastActiveFrame = frameType;
            if (typeof window.updateActiveFrameUI === 'function') {
                const col = c.closest ? c.closest('.frame-column') : null;
                window.updateActiveFrameUI(col || frameType);
            }
            const isResp = window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive();
            if (isMulti) {
                c.classList.toggle('selected');
                if (c.classList.contains('selected')) {
                    window.activeEl = c;
                }
                if (c.classList.contains('pin-marker')) {
                    const pinIdx = c.getAttribute('data-index');
                    if (pinIdx !== null && pinIdx !== undefined) {
                        const partnerPin = document.querySelector('.pin-marker[data-index="' + pinIdx + '"]:not(#' + c.id + ')');
                        if (partnerPin) partnerPin.classList.toggle('selected', c.classList.contains('selected'));
                    }
                }
                if (window.ResponsiveSmartGuide) {
                    if (typeof window.ResponsiveSmartGuide.clearHoverInspect === 'function') {
                        window.ResponsiveSmartGuide.clearHoverInspect();
                    }
                    if (typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                        window.ResponsiveSmartGuide.clearGuides(true);
                    }
                }
            } else {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                c.classList.add('selected');
                window.activeEl = c;
                if (c.classList.contains('pin-marker')) {
                    const pinIdx = c.getAttribute('data-index');
                    if (pinIdx !== null && pinIdx !== undefined) {
                        const partnerPin = document.querySelector('.pin-marker[data-index="' + pinIdx + '"]:not(#' + c.id + ')');
                        if (partnerPin) partnerPin.classList.add('selected');
                    }
                }
                if (isResp) {
                    window.ResponsiveSmartGuide.onSelect(c, 7000);
                }
            }
            window.updateHandles(c);
            notifyParent({ 
                type: "LF_COMP_SELECTED", 
                shiftKey: isMulti,
                isResponsive: !!isResp,
                ...window._getCompStyles(c)
            });
        } else {
            isMarquee = true;
            window.isMarqueeActive = true;
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
                window.SelectionAdorner.clear();
            }
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                window.ResponsiveSmartGuide.clearGuides(true);
            }
            
            const targets = [];
            document.querySelectorAll('.lf-component:not(.connector-line)').forEach(c => {
                if (!c.id) {
                    const isPin = c.classList.contains('pin-marker') || c.classList.contains('text-marker');
                    c.id = (isPin ? 'v4-pin-' : 'v4-comp-') + Date.now() + '-' + Math.floor(Math.random() * 10000);
                }
                let absL = parseFloat(c.style.left) || 0;
                let absT = parseFloat(c.style.top) || 0;
                let isChild = false;
                
                let parent = c.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList && (parent.classList.contains('lf-component') || parent.classList.contains('lf-group'))) {
                        absL += parseFloat(parent.style.left) || 0;
                        absT += parseFloat(parent.style.top) || 0;
                        isChild = true;
                    }
                    parent = parent.parentElement;
                }

                let compW = parseFloat(c.style.width);
                let compH = parseFloat(c.style.height);
                if (isNaN(compW) || compW <= 0) compW = c.offsetWidth;
                if (isNaN(compH) || compH <= 0) compH = c.offsetHeight;

                targets.push({
                    id: c.id,
                    x: absL,
                    y: absT,
                    w: compW,
                    h: compH,
                    isGroupChild: isChild
                });
            });

            notifyParent({ 
                type: 'LF_MARQUEE_START', 
                x: e.clientX, 
                y: e.clientY,
                shiftKey: e.shiftKey,
                targets: targets
            });
            notifyParent({ type: 'LF_DESELECT' });
        }
        const isCurrentlyEditingCell = document.activeElement && 
            (document.activeElement.isContentEditable || (document.activeElement.classList && document.activeElement.classList.contains('v4-editable-cell'))) && 
            document.activeElement.contains(e.target);
        const isFormInput = e.target.tagName === 'INPUT';

        if (c && !isCurrentlyEditingCell && !isFormInput) { 
            if (window.V4DragResizeEngine) {
                window.V4DragResizeEngine.handleMouseDown(e, null, null, d, c);
            }
        }
    });

    // Double click to enter text editing mode (PPT-style) or drill down into child component inside group
    document.addEventListener('dblclick', e => {
        const editable = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editable) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                window.ResponsiveSmartGuide.clearGuides(true);
            }
            notifyParent({ type: 'LF_CLEAR_SMARTGUIDE' });
            editable.focus();
            return;
        }

        const targetComp = e.target.closest('.lf-component');
        if (targetComp && !targetComp.classList.contains('lf-delete-trigger')) {
            window.activeEl = targetComp;
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            targetComp.classList.add('selected');
            const isResp = window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive();
            if (isResp) {
                window.ResponsiveSmartGuide.onSelect(targetComp, 7000);
            }
            window.updateHandles(targetComp);
            notifyParent({
                type: "LF_COMP_SELECTED",
                shiftKey: false,
                isResponsive: !!isResp,
                ...window._getCompStyles(targetComp)
            });
        }
    });

    let rafId = null;
    let marqueeRafId = null;
    let marqueeClientX = 0;
    let marqueeClientY = 0;
    document.addEventListener('mousemove', e => {
        if (isConnectorDragging) {
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_MOVE', clientX: e.clientX, clientY: e.clientY });
            return;
        }
        if (isDraggingLine && activeLineId) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const conn = window.parent?.state?.connectors?.find(c => c.id === activeLineId);
            if (conn && startLineCoords) {
                conn.start.x = startLineCoords.start.x + dx;
                conn.start.y = startLineCoords.start.y + dy;
                conn.end.x = startLineCoords.end.x + dx;
                conn.end.y = startLineCoords.end.y + dy;
                conn.start.targetId = null; conn.start.side = null;
                conn.end.targetId = null; conn.end.side = null;
                window.updateConnectorPathLocal(activeLineId);
            }
            return;
        }

        if (window.V4PortConnectorEngine && window.V4PortConnectorEngine.isDrawingConnector) {
            window.V4PortConnectorEngine.handleMouseMove(e);
            return;
        }

        if (isMarquee) {
            marqueeClientX = e.clientX;
            marqueeClientY = e.clientY;
            if (!marqueeRafId) {
                marqueeRafId = requestAnimationFrame(function() {
                    marqueeRafId = null;
                    if (isMarquee) {
                        notifyParent({ type: 'LF_MARQUEE_MOVE', x: marqueeClientX, y: marqueeClientY });
                    }
                });
            }
            if (window.getSelection) {
                var sel = window.getSelection();
                if (sel && sel.removeAllRanges) sel.removeAllRanges();
            }
            return;
        }
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isResizing || window.V4DragResizeEngine.isPendingDrag)) {
                window.V4DragResizeEngine.handleMouseMove(e);
            }
        });
    });

    document.addEventListener('mouseup', e => { 
        document.querySelectorAll('.lf-component').forEach(comp => comp.classList.remove('near-connector'));
        if (isConnectorDragging) {
            isConnectorDragging = false;
            document.body.classList.remove('drawing-line-active');
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_UP' });
        }
        if (isDraggingLine) {
            isDraggingLine = false;
            startLineCoords = null;
            activeLineId = null;
            notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
            markDirty();
        }

        if (window.V4PortConnectorEngine && window.V4PortConnectorEngine.isDrawingConnector) {
            window.V4PortConnectorEngine.handleMouseUp(e);
        }

        if (isMarquee) {
            isMarquee = false;
            window.isMarqueeActive = false;
            if (marqueeRafId) {
                cancelAnimationFrame(marqueeRafId);
                marqueeRafId = null;
            }
            notifyParent({ type: 'LF_MARQUEE_END' });
        }
        if (window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isResizing || window.V4DragResizeEngine.isPendingDrag)) {
            window.V4DragResizeEngine.handleMouseUp(e);
        }
    });

    document.addEventListener('input', e => { 
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
            if (e.target.type === 'checkbox' || e.target.type === 'radio') {
                if (e.target.checked) e.target.setAttribute('checked', '');
                else e.target.removeAttribute('checked');
            } else if (e.target.tagName === 'TEXTAREA') {
                e.target.textContent = e.target.value;
            } else {
                e.target.setAttribute('value', e.target.value);
            }
            markDirty();
        }

        const editableCell = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editableCell) {
            markDirty();
            const dp = editableCell.closest('.v4-datepicker-container');
            if (dp) {
                if (editableCell.classList.contains('v4-dp-start')) dp.setAttribute('data-start-date', editableCell.innerText);
                else if (editableCell.classList.contains('v4-dp-end')) dp.setAttribute('data-end-date', editableCell.innerText);
                else if (editableCell.classList.contains('v4-dp-start-time')) dp.setAttribute('data-start-time', editableCell.innerText);
                else if (editableCell.classList.contains('v4-dp-end-time')) dp.setAttribute('data-end-time', editableCell.innerText);
            }
            const comp = editableCell.closest('.lf-component');
            if (comp) {
                if (comp.querySelector('.v4-checkbox-container') || comp.querySelector('.v4-radio-container')) {
                    if (typeof window.resizeAtomToFitText === 'function') {
                        window.resizeAtomToFitText(comp);
                    } else if (typeof window.enforceDesignSystem === 'function') {
                        window.enforceDesignSystem();
                    }
                } else if (comp.classList.contains('v4-text-shape') || comp.classList.contains('v4-text-box')) {
                    if (typeof window.resizeToFitText === 'function') {
                        window.resizeToFitText(comp);
                    }
                }
                // Notify parent of text changes to sync the Quill editor in real-time
                const isPin = comp.classList.contains('text-marker') || comp.classList.contains('pin-marker') || comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape');
                const isShape = !!comp.querySelector('.v4-shape');

                let targetId = comp.id;
                const pinIndexAttr = comp.getAttribute('data-pin-index');
                if (pinIndexAttr !== null) {
                    targetId = parseInt(pinIndexAttr, 10);
                } else {
                    const match = comp.id.match(/^v4-pin-(\d+)$/);
                    if (match) targetId = parseInt(match[1], 10);
                }

                notifyParent({
                    type: 'LF_PIN_TEXT_CHANGED',
                    id: targetId,
                    compId: comp.id,
                    html: editableCell.innerHTML,
                    isPin: isPin,
                    isShape: isShape
                });
            }
        } 
    }, { passive: false });

    document.addEventListener('change', e => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
            if (e.target.type === 'checkbox' || e.target.type === 'radio') {
                if (e.target.checked) e.target.setAttribute('checked', '');
                else e.target.removeAttribute('checked');
            } else if (e.target.tagName === 'TEXTAREA') {
                e.target.textContent = e.target.value;
            } else {
                e.target.setAttribute('value', e.target.value);
            }
            markDirty();
        }
    });

    document.addEventListener('focusout', e => {
        const editableCell = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editableCell) {
            const comp = editableCell.closest('.lf-component');
            if (comp) {
                const isPin = comp.classList.contains('text-marker') || comp.classList.contains('pin-marker') || comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape');
                const isShape = !!comp.querySelector('.v4-shape');
                let targetId = comp.id;
                const pinIndexAttr = comp.getAttribute('data-pin-index');
                if (pinIndexAttr !== null) {
                    targetId = parseInt(pinIndexAttr, 10);
                } else {
                    const match = comp.id.match(/^v4-pin-(\d+)$/);
                    if (match) targetId = parseInt(match[1], 10);
                }
                notifyParent({
                    type: 'LF_PIN_TEXT_CHANGED',
                    id: targetId,
                    compId: comp.id,
                    html: editableCell.innerHTML,
                    isPin: isPin,
                    isShape: isShape
                });
            }
        }
    });


    window.getHomogeneousSelectionInfo = function() {
        var selected = Array.from(document.querySelectorAll('.lf-component.selected'));
        if (selected.length <= 1) {
            return { isMultiSame: false, count: selected.length, ids: selected.map(function(el) { return el.id; }) };
        }

        var types = selected.map(function(el) {
            if (el.classList.contains('lf-group')) return 'group';
            var pinIdx = el.getAttribute('data-index');
            if (el.classList.contains('pin-marker') || (el.classList.contains('text-marker') && pinIdx !== null && pinIdx !== undefined)) return 'pin';
            if (el.classList.contains('v4-text-shape') || el.classList.contains('v4-text-box')) return 'shape-text';
            var shape = el.querySelector('.v4-shape');
            if (shape || el.classList.contains('v4-shape')) {
                if (shape && shape.classList.contains('v4-shape-line')) return 'line';
                if (shape && shape.classList.contains('v4-shape-arrow')) return 'shape-arrow';
                if (shape && shape.classList.contains('v4-shape-triangle')) return 'shape-triangle';
                if (shape && shape.classList.contains('v4-shape-circle')) return 'shape-circle';
                if (shape && shape.classList.contains('v4-shape-diamond')) return 'shape-diamond';
                if (shape && shape.classList.contains('v4-shape-webpage')) return 'shape-webpage';
                if (shape && shape.classList.contains('v4-shape-pattern-grid')) return 'shape-pattern';
                return 'shape-rect';
            }
            if (el.querySelector('.v4-btn-container') || el.classList.contains('v4-btn-container')) return 'button';
            if (el.querySelector('.v4-checkbox-container') || el.classList.contains('v4-checkbox-container')) return 'checkbox';
            if (el.querySelector('.v4-radio-container') || el.classList.contains('v4-radio-container')) return 'radio';
            if (el.querySelector('.v4-textbox-container') || el.classList.contains('v4-textbox-container')) return 'textbox';
            if (el.querySelector('.v4-textarea-container') || el.classList.contains('v4-textarea-container')) return 'textarea';
            if (el.querySelector('.v4-searchbar-container') || el.classList.contains('v4-searchbar-container')) return 'searchbar';
            if (el.querySelector('.v4-stepper-container') || el.classList.contains('v4-stepper-container')) return 'stepper';
            if (el.querySelector('.v4-selectbox-container') || el.classList.contains('v4-selectbox-container')) return 'selectbox';
            if (el.querySelector('.v4-fileupload-container') || el.classList.contains('v4-fileupload-container')) return 'fileupload';
            if (el.querySelector('.v4-alert-container') || el.classList.contains('v4-alert-container')) return 'alert';
            if (el.querySelector('.v4-datepicker-container') || el.classList.contains('v4-datepicker-container')) return 'datepicker';
            if (el.querySelector('.v4-accordion-container') || el.classList.contains('v4-accordion-container')) return 'accordion';
            if (el.querySelector('.v4-tab-container') || el.classList.contains('v4-tab-container')) return 'tab';
            if (el.querySelector('.v4-admin-settings-container') || el.classList.contains('v4-admin-settings-container')) return 'admin-settings';
            if (el.querySelector('.v4-cursor-container') || el.classList.contains('v4-cursor-container')) return 'cursor';
            if (el.querySelector('table')) return 'table';
            if (el.querySelector('.lf-icon') || el.querySelector('svg') || el.classList.contains('lf-icon')) return 'icon';
            return 'other';
        });

        // Group shapes together if they belong to general vector family (rect, circle, triangle, diamond, text, webpage)
        var normalizedTypes = types.map(function(t) {
            if (t === 'shape-rect' || t === 'shape-circle' || t === 'shape-triangle' || t === 'shape-diamond' || t === 'shape-arrow' || t === 'shape-text' || t === 'shape-webpage') {
                return 'shape';
            }
            return t;
        });

        var firstType = normalizedTypes[0];
        var isAllSame = (firstType !== 'other' && firstType !== 'group') && normalizedTypes.every(function(t) { return t === firstType; });

        var ids = selected.map(function(el) { return el.id; });
        var primaryStyles = (isAllSame && typeof window._getCompStyles === 'function') 
            ? window._getCompStyles(selected[0]) 
            : null;

        return {
            isMultiSame: isAllSame,
            commonType: isAllSame ? firstType : null,
            count: selected.length,
            ids: ids,
            primaryStyles: primaryStyles
        };
    };

    function _applyStyleToSingleComponent(s, d) {
        if (!s) return;
        var alertContainer = s.querySelector('.v4-alert-container');
        var inputContainer = s.querySelector('.v4-textbox-container, .v4-textarea-container');
        var searchbarContainer = s.querySelector('.v4-searchbar-container');
        var selectboxContainer = s.querySelector('.v4-selectbox-container');
        var buttonContainer = s.querySelector('.v4-btn-container');
        var customBtn = s.querySelector('.v4-custom-btn');
        var stepperContainer = s.querySelector('.v4-stepper-container');

        var t = null;
        if (d.selector) {
            if (s.matches && s.matches(d.selector)) {
                t = s;
            } else {
                t = s.querySelector(d.selector);
            }
            if (!t) {
                if (s.classList.contains('v4-text-shape') || s.classList.contains('v4-text-box') || s.classList.contains('text-marker')) {
                    t = s.querySelector('.v4-editable-cell') || s;
                } else if (s.querySelector('.v4-shape') || s.classList.contains('v4-shape')) {
                    t = s.querySelector('.v4-shape-text-content, .v4-shape-text-overlay, .v4-editable-cell, .v4-shape') || s;
                }
            }
        } else {
            t = s;
        }
        if (!t) t = s;
        var shape = s.querySelector('.v4-shape');
        if (shape && !d.selector) t = shape;
        var boxEl = s.querySelector('.v4-checkbox, .v4-radio');
        if (boxEl && !d.selector) t = boxEl;
        if (inputContainer && !d.selector) t = inputContainer;
        if (searchbarContainer && !d.selector) t = searchbarContainer;
        if (selectboxContainer && !d.selector) t = selectboxContainer;
        if (buttonContainer && customBtn && !d.selector) t = customBtn;
        if (alertContainer && !d.selector) t = alertContainer;
        var accordionContainer = s.querySelector('.v4-accordion-container');
        if (accordionContainer && !d.selector) t = accordionContainer;
        var gridContainer = s.querySelector('.v4-grid-container');
        if (gridContainer && !d.selector) t = gridContainer;
        var tableEl = s.querySelector('.v4-table');
        if (tableEl && !d.selector) t = tableEl;
        var datepickerContainer = s.querySelector('.v4-datepicker-container');
        if (datepickerContainer && !d.selector) t = datepickerContainer;
        var fileuploadContainer = s.querySelector('.v4-fileupload-container');
        if (fileuploadContainer && !d.selector) t = fileuploadContainer;
        var popupContainer = s.querySelector('.v4-popup-container');
        if (popupContainer && !d.selector) t = popupContainer;

        var adminSettings = s.querySelector('.v4-admin-settings-container') || (s.classList.contains('v4-admin-settings-container') ? s : null);
        if (adminSettings && !d.selector) {
            if (s.style.background && s.style.background !== 'transparent') s.style.background = 'transparent';
            if (s.style.backgroundColor && s.style.backgroundColor !== 'transparent') s.style.backgroundColor = 'transparent';
            if (d.style) {
                if (d.style.width !== undefined) s.style.setProperty('width', typeof d.style.width === 'number' ? d.style.width + 'px' : d.style.width, 'important');
                if (d.style.height !== undefined) s.style.height = typeof d.style.height === 'number' ? d.style.height + 'px' : d.style.height;
            }
            window.updateHandles(s);
            return;
        }

        if (!t) return;
        
        if (d.style) {
            if (d.style.width !== undefined || d.style.height !== undefined) {
                s.setAttribute('data-resized', 'true');
            }
            if (d.style.html !== undefined) t.innerHTML = d.style.html;
            
            var isInnerBox = t.classList.contains('v4-checkbox') || t.classList.contains('v4-radio');
            
            if (d.style.width !== undefined) {
                var wVal = typeof d.style.width === 'number' ? d.style.width + 'px' : d.style.width;
                if (isInnerBox) {
                    t.style.width = wVal;
                } else {
                    s.style.setProperty('width', wVal, 'important');
                    if (inputContainer) inputContainer.style.width = '100%';
                    if (alertContainer) alertContainer.style.width = '100%';
                    if (buttonContainer) buttonContainer.style.width = '100%';
                    if (stepperContainer) stepperContainer.style.width = '100%';
                    if (popupContainer) popupContainer.style.width = '100%';
                    if (selectboxContainer) {
                        s.setAttribute('data-resized', 'true');
                        selectboxContainer.style.setProperty('width', '100%', 'important');
                        var header = selectboxContainer.querySelector('.v4-selectbox-header');
                        var optionsList = selectboxContainer.querySelector('.v4-selectbox-options');
                        if (header) header.style.setProperty('width', '100%', 'important');
                        if (optionsList) optionsList.style.setProperty('width', '100%', 'important');
                    }
                }
            }
            if (d.style.height !== undefined) {
                var hVal = typeof d.style.height === 'number' ? d.style.height + 'px' : d.style.height;
                if (isInnerBox) {
                    t.style.height = hVal;
                } else {
                    s.style.height = hVal;
                    if (inputContainer) inputContainer.style.height = '100%';
                    if (alertContainer) alertContainer.style.height = '100%';
                    if (buttonContainer) buttonContainer.style.height = '100%';
                    if (stepperContainer) {
                        stepperContainer.style.height = '100%';
                        var sCtrl = stepperContainer.querySelector('.v4-stepper-control');
                        var sAct = stepperContainer.querySelector('.v4-stepper-action');
                        if (sCtrl) sCtrl.style.height = '100%';
                        if (sAct) sAct.style.height = '100%';
                    }
                    if (popupContainer) popupContainer.style.height = '100%';
                    if (selectboxContainer) {
                        selectboxContainer.style.height = '100%';
                        var headerH = selectboxContainer.querySelector('.v4-selectbox-header');
                        if (headerH) headerH.style.height = '100%';
                    }
                }
            }

            var styleToAssign = Object.assign({}, d.style);
            if (!isInnerBox) {
                delete styleToAssign.width;
                delete styleToAssign.height;
            }
            
            var targets = d.selector ? [t] : [t, s.querySelector('.v4-shape-text-content'), s.querySelector('.v4-shape-text-overlay')].filter(Boolean);
            targets.forEach(function(target) {
                Object.assign(target.style, styleToAssign);
                for (var key in styleToAssign) {
                    if (styleToAssign.hasOwnProperty(key)) {
                        var val = styleToAssign[key];
                        if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent' || key === 'borderRadius' || key === 'vAlign') {
                            var cssKey = key === 'textAlign' ? 'text-align' : (key === 'alignItems' ? 'align-items' : ((key === 'justifyContent' || key === 'vAlign') ? 'justify-content' : 'border-radius'));
                            var cssVal = val;
                            if (key === 'justifyContent' || key === 'vAlign') {
                                var normV = (val === 'flex-start' || val === 'top') ? 'top' : ((val === 'flex-end' || val === 'bottom') ? 'bottom' : 'middle');
                                cssVal = normV === 'top' ? 'flex-start' : (normV === 'bottom' ? 'flex-end' : 'center');
                                s.setAttribute('data-valign', normV);
                                target.setAttribute('data-valign', normV);
                            } else if (key === 'textAlign') {
                                s.setAttribute('data-align', val);
                                target.setAttribute('data-align', val);
                            }
                            target.style.setProperty(cssKey, cssVal, 'important');
                        }
                    }
                }
            });
        }
        
        if (d.subSelector && d.subStyle) {
            t.querySelectorAll(d.subSelector).forEach(function(sub) {
                Object.keys(d.subStyle).forEach(function(key) {
                    var cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    sub.style.setProperty(cssKey, d.subStyle[key], 'important');
                });
            });
        }
        if (typeof window.syncTableComponentSize === 'function') {
            var isGrid = s.classList.contains('v4-grid-container') || !!s.querySelector('.v4-grid-container');
            if (!isGrid) {
                window.syncTableComponentSize();
            }
        }
        window.updateHandles(s);
    }

    window.v4GlobalStyleHandler = function(d) {
        if (!d) return;

        // Route to modular helpers first
        if (window.v4ObjectText && typeof window.v4ObjectText.handleUpdateStyle === 'function') {
            if (window.v4ObjectText.handleUpdateStyle(d)) return;
        }
        if (window.v4ObjectShape && typeof window.v4ObjectShape.handleUpdateStyle === 'function') {
            if (window.v4ObjectShape.handleUpdateStyle(d)) return;
        }

        // Collect target elements (Multi targets if d.ids provided, else single)
        var targetEls = [];
        if (d.ids && Array.isArray(d.ids) && d.ids.length > 0) {
            d.ids.forEach(function(id) {
                var el = document.getElementById(id);
                if (el && el.classList.contains('lf-component')) targetEls.push(el);
            });
        }
        if (targetEls.length === 0) {
            var single = (d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
            if (single) targetEls.push(single);
        }
        if (targetEls.length === 0) return;

        // Atomic single Undo transaction: saveState ONCE before applying loop
        if (window.V4UndoManager) window.V4UndoManager.saveState();

        targetEls.forEach(function(compEl) {
            _applyStyleToSingleComponent(compEl, d);
        });

        markDirty();

        if (targetEls.length > 0 && typeof window._getCompStyles === 'function') {
            notifyParent({
                type: 'LF_COMP_RESIZED',
                ...window._getCompStyles(targetEls[0])
            });
        }
    };

    // --- Helper Handlers for Iframe Core Message Registry ---
    // --- Component Inserter Delegate (SSOT: assets/vctrl_iframe_inserter.js) ---
    function handleInsertComponent(d) {
        if (typeof window.handleInsertComponent === 'function') {
            return window.handleInsertComponent(d);
        }
    }

    function handleDeselectAll(d) {
        document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
        window.activeEl = null;
        if (document.activeElement && (document.activeElement.classList?.contains('v4-editable-cell') || document.activeElement.isContentEditable)) {
            try { document.activeElement.blur(); } catch (_) {}
        }
        if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
            window.ResponsiveSmartGuide.clearGuides(true);
        }
        if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
            window.SelectionAdorner.clear();
        }
    }

    // --- Iframe Core Message Handlers (Dispatcher Registry SSOT) ---
    const v4IframeCoreHandlers = {
        'LF_PARENT_MOUSEUP': function(d) {
            document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        },

        'LF_SNAP_RESPONSE': function(d) {
            if (!window.activeEl || !window.V4DragResizeEngine || !window.V4DragResizeEngine.isDragging) return;
            const activeEl = window.activeEl;
            const curLeft = parseInt(activeEl.style.left) || 0;
            const curTop = parseInt(activeEl.style.top) || 0;
            let snapDx = d.x - curLeft;
            let snapDy = d.y - curTop;

            // Responsive Shield: Suppress cross-frame snap jumps (> 350px) that cause elements to disappear off-screen
            const isInsideMobileContainer = activeEl.closest('.mobile-content-inner, .mobile-content');
            const isInsidePcContainer = activeEl.closest('.pc-content-inner, .pc-content-area');
            if ((isInsideMobileContainer || isInsidePcContainer) && Math.abs(snapDx) > 350) {
                snapDx = 0;
            }

            if (Math.abs(snapDx) > 0.1 || Math.abs(snapDy) > 0.1) {
                const comps = document.querySelectorAll('.lf-component.selected');
                let hasConnectorChanges = false;
                comps.forEach(c => {
                    const isConnector = c.classList.contains('connector-line');
                    const isGroup = c.classList.contains('lf-group');
                    if (isConnector) {
                        const conn = (window.parent && window.parent.state && window.parent.state.connectors)
                            ? window.parent.state.connectors.find(x => x.id === c.id)
                            : null;
                        if (conn) {
                            conn.start.x += snapDx;
                            conn.start.y += snapDy;
                            conn.end.x += snapDx;
                            conn.end.y += snapDy;
                            conn.start.targetId = null; conn.start.side = null;
                            conn.end.targetId = null; conn.end.side = null;
                            hasConnectorChanges = true;
                        }
                    } else {
                        c.style.left = (parseInt(c.style.left || 0) + snapDx) + 'px';
                        c.style.top = (parseInt(c.style.top || 0) + snapDy) + 'px';
                        window.updateHandles(c);
                        if (isGroup) {
                            const connIdsStr = c.getAttribute('data-connectors');
                            let connIds = [];
                            if (connIdsStr) {
                                try { connIds = JSON.parse(connIdsStr); } catch(e) { connIds = []; }
                            }
                            if (Array.isArray(connIds)) {
                                connIds.forEach(connId => {
                                    const conn = (window.parent && window.parent.state && Array.isArray(window.parent.state.connectors))
                                        ? window.parent.state.connectors.find(x => x && x.id === connId)
                                        : null;
                                    if (conn && conn.start && conn.end) {
                                        conn.start.x += snapDx;
                                        conn.start.y += snapDy;
                                        conn.end.x += snapDx;
                                        conn.end.y += snapDy;
                                        conn.start.targetId = null; conn.start.side = null;
                                        conn.end.targetId = null; conn.end.side = null;
                                        hasConnectorChanges = true;
                                    }
                                });
                            }
                        }
                        if (typeof window.updateAnchoredConnectorsLocal === 'function') {
                            window.updateAnchoredConnectorsLocal(c.id);
                        }
                    }
                });
                if (hasConnectorChanges) {
                    if (window.parent && window.parent.ConnectorEngine) {
                        window.parent.ConnectorEngine.redrawAll();
                    }
                    notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                }
            }
        },

        'LF_REQUEST_SAVE_CONTENT': function(d) {
            // [Form Value SSOT Sync] Commit all live form input values to attributes before clone
            document.querySelectorAll('input').forEach(function(inp) {
                if (inp.type === 'checkbox' || inp.type === 'radio') {
                    if (inp.checked) inp.setAttribute('checked', '');
                    else inp.removeAttribute('checked');
                } else {
                    inp.setAttribute('value', inp.value);
                }
            });
            document.querySelectorAll('textarea').forEach(function(ta) {
                ta.textContent = ta.value;
            });
            document.querySelectorAll('select').forEach(function(sel) {
                Array.from(sel.options).forEach(function(opt) {
                    if (opt.selected) opt.setAttribute('selected', '');
                    else opt.removeAttribute('selected');
                });
            });

            const c = document.documentElement.cloneNode(true);
            if (window.ScreenSanitizer && typeof window.ScreenSanitizer.cleanDOM === 'function') {
                window.ScreenSanitizer.cleanDOM(c);
            }
            
            // Clean dynamic runtime engine scripts & inlined styles before saving to disk
            c.querySelectorAll('#v4-inlined-style, #v4-responsive-frame-style, #v4-typography-rules, #v4-scroll-pin-style, #v4-cover-theme-fix, #v4-inlined-script').forEach(function(el) {
                el.remove();
            });

            notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: "<!DOCTYPE html>\\n" + c.outerHTML });
        },

        'LF_INSERT_COMPONENT': handleInsertComponent,
        'LF_INSERT_V4_COMP': handleInsertComponent,

        'LF_INSERT_COMPONENTS': function(d) {
            const host = document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body;
            const comps = d.components || [];
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            let currentTopZ = (typeof window.getNextTopZIndex === 'function') ? window.getNextTopZIndex(host) : 1010;
            const trailingRef = Array.from(host.children).find(c => !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script'));
            comps.forEach(c => {
                const v = document.createElement('div');
                v.id = c.id || ('v4-comp-' + Date.now() + Math.random());
                v.className = 'lf-component selected' + (c.isGroup ? ' lf-group' : '') + (c.className ? ' ' + c.className : '');
                
                v.style.position = 'absolute';
                v.style.left = (parseFloat(c.x) || 0) + 'px';
                v.style.top = (parseFloat(c.y) || 0) + 'px';
                v.style.width = c.width || '200px';
                v.style.height = c.height || '100px';
                v.style.zIndex = String(currentTopZ);
                v.style.transform = 'none !important';

                if (c.style) {
                    Object.assign(v.style, c.style);
                    if (!c.style.zIndex || parseInt(c.style.zIndex, 10) <= 1000) {
                        v.style.zIndex = String(currentTopZ);
                    }
                }
                currentTopZ += 10;

                v.innerHTML = (c.html || '') + '<div class="lf-delete-trigger">&times;</div>';
                if (trailingRef && trailingRef.parentNode === host) {
                    host.insertBefore(v, trailingRef);
                } else {
                    host.appendChild(v);
                }
                window.updateHandles(v);
            });
            markDirty();
        },

        'LF_SELECT_ID': function(d) {
            const el = document.getElementById(d.id);
            if (el) {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
                window.updateHandles(el);
                notifyParent({
                    type: 'LF_COMP_SELECTED',
                    shiftKey: false,
                    ...window._getCompStyles(el)
                });
            }
        },

        'LF_UPDATE_STYLE': function(d) {
            if (typeof window.v4GlobalStyleHandler === 'function') {
                window.v4GlobalStyleHandler(d);
            }
        },

        'LF_DELETE_SELECTED': function(d) {
            const s = document.querySelector('.lf-component.selected'); 
            if (s) { 
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                s.remove(); 
                markDirty(); 
                notifyParent({ type: 'LF_DESELECT' });
            }
        },

        'LF_DESELECT_ALL': handleDeselectAll,
        'LF_DESELECT': handleDeselectAll,

        'LF_SET_RESPONSIVE_GRID': function(d) {
            const isResponsiveTemplate = !!(document.querySelector('.pc-content-inner') || document.querySelector('.mobile-content-inner') || document.querySelector('.pc-browser-frame'));
            if (isResponsiveTemplate) {
                if (d.visible === false) {
                    document.body.classList.add('hide-frame-grid');
                } else {
                    document.body.classList.remove('hide-frame-grid');
                }
            }
        },

        'LF_BRING_FRONT': function(d) {
            if (typeof window.handleBringFront === 'function') {
                return window.handleBringFront(d);
            }
        },
        'LF_SEND_BACK': function(d) {
            if (typeof window.handleSendBack === 'function') {
                return window.handleSendBack(d);
            }
        },

        'LF_REQUEST_SNAP_TARGETS': function(d) {
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.collectSnapTargets === 'function') {
                const res = window.ResponsiveSmartGuide.collectSnapTargets();
                notifyParent({ type: 'LF_SNAP_TARGETS_RESPONSE', targets: res.targets, rects: res.rects });
            } else {
                notifyParent({ type: 'LF_SNAP_TARGETS_RESPONSE', targets: [], rects: [] });
            }
        },

        'LF_SET_ALT_KEY_STATE': function(d) {
            if (window.ResponsiveSmartGuide) {
                window.ResponsiveSmartGuide.isAltDown = !!d.isAltDown;
                if (!d.isAltDown) {
                    if (typeof window.ResponsiveSmartGuide.clearHoverInspect === 'function') {
                        window.ResponsiveSmartGuide.clearHoverInspect();
                    }
                } else if (window.ResponsiveSmartGuide.lastMousePos) {
                    if (typeof window.ResponsiveSmartGuide.renderAltInspect === 'function') {
                        window.ResponsiveSmartGuide.renderAltInspect(window.ResponsiveSmartGuide.lastMousePos.x, window.ResponsiveSmartGuide.lastMousePos.y);
                    }
                }
            }
        },

        'LF_SET_CANVAS_BACKGROUND': function(d) {
            if (window.V4UndoManager && typeof window.V4UndoManager.saveState === 'function') {
                window.V4UndoManager.saveState();
            }

            var isResponsive = false;
            try {
                if (typeof window.isResponsiveScreen === 'function') {
                    isResponsive = window.isResponsiveScreen(document);
                } else if (window.parent && typeof window.parent.isResponsiveDocument === 'function') {
                    isResponsive = window.parent.isResponsiveDocument(document);
                } else if (document.querySelector) {
                    isResponsive = !!(document.querySelector('.pc-content-inner, .mobile-content-inner, .pc-browser-frame, .mobile-frame, .full-pc-page, .mobile-compare-page'));
                }
            } catch(e) {
                isResponsive = !!(document.querySelector && document.querySelector('.pc-content-inner, .mobile-content-inner, .pc-browser-frame, .mobile-frame'));
            }

            var canvas = document.getElementById('canvas') || document.querySelector('.canvas, .page, #canvas-page') || document.body;
            var frameTargets = isResponsive ? document.querySelectorAll('.pc-content-inner, .mobile-content-inner, .pc-content-area, .mobile-content, .pc-browser-frame, .mobile-frame') : [];
            var existingLayer = document.getElementById('canvas_bg_layer');

            if (d.action === 'set_color' && d.color) {
                if (isResponsive && frameTargets.length > 0) {
                    frameTargets.forEach(function(el) {
                        el.style.backgroundColor = d.color;
                        el.dataset.canvasBgColor = d.color;
                    });
                    var pageEl = document.querySelector('.page');
                    if (pageEl) {
                        pageEl.dataset.canvasBgColor = d.color;
                    }
                } else {
                    canvas.style.backgroundColor = d.color;
                    canvas.style.backgroundImage = 'none';
                    canvas.dataset.canvasBgColor = d.color;
                }

                var curBgImg = existingLayer ? existingLayer.querySelector('img') : null;
                var hasImg = !!(curBgImg && curBgImg.getAttribute('src'));
                notifyParent({
                    type: 'LF_CANVAS_BACKGROUND_UPDATED',
                    hasBg: hasImg,
                    url: hasImg ? curBgImg.getAttribute('src') : '',
                    opacity: hasImg ? (parseFloat(curBgImg.style.opacity) || 1.0) : 1.0,
                    bgColor: d.color
                });
                return;
            }

            if (d.action === 'remove') {
                if (existingLayer) existingLayer.remove();
                if (isResponsive && frameTargets.length > 0) {
                    frameTargets.forEach(function(el) {
                        el.style.backgroundColor = '';
                        if (el.dataset) delete el.dataset.canvasBgColor;
                        else el.removeAttribute('data-canvas-bg-color');
                    });
                    var pageEl = document.querySelector('.page');
                    if (pageEl) {
                        if (pageEl.dataset) delete pageEl.dataset.canvasBgColor;
                        else pageEl.removeAttribute('data-canvas-bg-color');
                    }
                } else {
                    canvas.style.backgroundColor = '';
                    canvas.style.backgroundImage = '';
                    if (canvas.dataset) delete canvas.dataset.canvasBgColor;
                    else canvas.removeAttribute('data-canvas-bg-color');
                }
                var curBgColor = isResponsive ? '#ffffff' : (canvas.dataset.canvasBgColor || canvas.style.backgroundColor || '#f8fafc');
                notifyParent({ type: 'LF_CANVAS_BACKGROUND_UPDATED', hasBg: false, url: '', opacity: 1.0, bgColor: curBgColor });
                return;
            }

            if (d.action === 'update_opacity') {
                if (existingLayer) {
                    var curImg = existingLayer.querySelector('img');
                    if (curImg) {
                        curImg.style.opacity = d.opacity;
                    }
                }
                return;
            }

            if (d.action === 'set' && d.imageUrl) {
                var opVal = (d.opacity !== undefined) ? d.opacity : 1.0;
                var bgContainer = canvas;
                if (isResponsive) {
                    var innerTarget = document.querySelector('.pc-content-inner') || document.querySelector('.mobile-content-inner');
                    if (innerTarget) bgContainer = innerTarget;
                }

                if (!existingLayer) {
                    var layer = document.createElement('div');
                    layer.id = 'canvas_bg_layer';
                    layer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none !important; user-select: none; overflow: hidden;';
                    
                    var img = document.createElement('img');
                    img.id = 'canvas_bg_img';
                    img.alt = 'Canvas Background';
                    img.src = d.imageUrl;
                    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; pointer-events: none !important; user-select: none; display: block; opacity: ' + opVal + ';';
                    layer.appendChild(img);

                    if (bgContainer.firstChild) {
                        bgContainer.insertBefore(layer, bgContainer.firstChild);
                    } else {
                        bgContainer.appendChild(layer);
                    }
                } else {
                    var img = existingLayer.querySelector('img');
                    if (!img) {
                        img = document.createElement('img');
                        img.id = 'canvas_bg_img';
                        existingLayer.appendChild(img);
                    }
                    img.src = d.imageUrl;
                    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; pointer-events: none !important; user-select: none; display: block; opacity: ' + opVal + ';';
                }

                var curBgColor = canvas.dataset.canvasBgColor || canvas.style.backgroundColor || (isResponsive ? '#ffffff' : '#f8fafc');
                notifyParent({ type: 'LF_CANVAS_BACKGROUND_UPDATED', hasBg: true, url: d.imageUrl, opacity: opVal, bgColor: curBgColor });
            }
        }
    };

    // Register Iframe Core Handlers to Global Registry SSOT
    window.v4MessageHandlers = window.v4MessageHandlers || {};
    for (const msgType in v4IframeCoreHandlers) {
        if (!window.v4MessageHandlers[msgType]) {
            window.v4MessageHandlers[msgType] = v4IframeCoreHandlers[msgType];
        }
    }

    // Universal Iframe Message Dispatcher (Concise & Modular)
    window.addEventListener('message', e => {
        const d = e.data; if (!d || !d.type) return;
        const msgType = d.type.toUpperCase();
        const handler = window.v4MessageHandlers ? window.v4MessageHandlers[msgType] : null;
        if (typeof handler === 'function') {
            try {
                handler(d);
            } catch(err) {
                console.error("[MessageDispatcher] Error running handler for " + d.type + ":", err);
            }
        }
    });

    // updateConnectorPathLocal delegated to vctrl_object_connector.js

    window.initHandles = () => {
        document.querySelectorAll('.lf-component').forEach(c => {
            // Clean up legacy handles if present from disk HTML
            c.querySelectorAll(':scope > .lf-drag-handle, :scope > .lf-resizer').forEach(el => el.remove());

            if (!c.querySelector(':scope > .lf-delete-trigger')) {
                const d = document.createElement('div');
                d.className = 'lf-delete-trigger';
                d.innerHTML = '&times;';
                c.appendChild(d);
            }
            if (!c.classList.contains('lf-group') && !c.classList.contains('connector-line')) {
                ['top', 'bottom', 'left', 'right'].forEach(side => {
                    if (!c.querySelector(':scope > .lf-connector-port.port-' + side)) {
                        const port = document.createElement('div');
                        port.className = 'lf-connector-port port-' + side;
                        port.setAttribute('data-side', side);
                        port.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (window.V4PortConnectorEngine) {
                                window.V4PortConnectorEngine.startConnectorDragFromPort(c, side, e);
                            }
                        });
                        c.appendChild(port);
                    }
                });
            }
        });
        
        // Initialize existing grid height and rendering details on load
        document.querySelectorAll('.v4-grid-container').forEach(function(container) {
            var currentCols = [];
            try {
                currentCols = JSON.parse(container.getAttribute('data-columns') || '[]');
            } catch(e) {}
            var rawRowCount = container.getAttribute('data-row-count');
            var rowCount = (rawRowCount !== null && rawRowCount !== '') ? parseInt(rawRowCount, 10) : 5;
            if (isNaN(rowCount)) rowCount = 5;
            var showPagination = container.getAttribute('data-pagination') === 'true';
            var rowHeight = parseInt(container.getAttribute('data-row-height'), 10) || 50;
            if (window.renderGrid) {
                window.renderGrid(container, currentCols, rowCount, showPagination, rowHeight);
            }
        });
    };
    window.initHandles();

    // Fullscreen presentation proxy listeners to notify parent window
    window.addEventListener('mousemove', (e) => {
        try {
            if (window.parent && typeof window.parent.__lf_proxy_mousemove__ === 'function') {
                window.parent.__lf_proxy_mousemove__(e, window.frameElement);
            }
        } catch(err) {}
    });

    window.addEventListener('keydown', (e) => {
        try {
            if (e.key === 'Shift' && window.parent && typeof window.parent.__lf_proxy_keydown__ === 'function') {
                window.parent.__lf_proxy_keydown__(e);
            }
        } catch(err) {}
    });

    window.addEventListener('keyup', (e) => {
        try {
            if (e.key === 'Shift' && window.parent && typeof window.parent.__lf_proxy_keyup__ === 'function') {
                window.parent.__lf_proxy_keyup__(e);
            }
        } catch(err) {}
    });
})();
`;
