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

    window.copySelectedObjects = () => {
        const selected = document.querySelectorAll('.lf-component.selected');
        const selectedConnIds = (window.parent && window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.getSelectedIds === 'function')
            ? window.parent.ConnectorEngine.getSelectedIds()
            : [];
        console.log("[Clipboard Debug] copySelectedObjects running. Selected elements:", selected.length, "connectors:", selectedConnIds.length);
        if (selected.length === 0 && selectedConnIds.length === 0) return;

        const topLevelSelected = Array.from(selected).filter(el => {
            let parent = el.parentElement;
            while (parent && parent !== document.body) {
                if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) {
                    return false;
                }
                parent = parent.parentElement;
            }
            return true;
        });

        const clipboardData = [];
        const copiedConnectorIds = new Set(selectedConnIds);

        topLevelSelected.forEach(el => {
            const cleanClasses = el.className.split(' ')
                .map(c => c.trim())
                .filter(c => c && c !== 'selected' && c !== 'dragging-now')
                .join(' ');

            const attrs = {};
            Array.from(el.attributes).forEach(attr => {
                const name = attr.name;
                if (name === 'data-source-id' || name === 'data-target-id') return;
                if (name.startsWith('data-') || name === 'id') {
                    attrs[name] = attr.value;
                }
            });

            if (el.classList.contains('lf-group')) {
                const connIdsStr = el.getAttribute('data-connectors');
                if (connIdsStr) {
                    try {
                        const connIds = JSON.parse(connIdsStr);
                        if (Array.isArray(connIds)) {
                            connIds.forEach(id => copiedConnectorIds.add(id));
                        }
                    } catch(e) {}
                }
            }

            const clone = el.cloneNode(true);
            clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(h => h.remove());

            const isInsideMobile = !!el.closest('.mobile-content-inner, .mobile-content-area, .mobile-content');
            const isInsidePc = !!el.closest('.pc-content-inner, .pc-content-area');
            const frameContainer = isInsideMobile ? 'mobile' : (isInsidePc ? 'pc' : 'root');

            clipboardData.push({
                html: clone.innerHTML,
                className: cleanClasses,
                styleCssText: el.style.cssText,
                left: parseFloat(el.style.left) || el.offsetLeft || 0,
                top: parseFloat(el.style.top) || el.offsetTop || 0,
                width: parseFloat(el.style.width) || el.offsetWidth || 120,
                height: parseFloat(el.style.height) || el.offsetHeight || 30,
                frameContainer: frameContainer,
                isGroup: el.classList.contains('lf-group'),
                isPinMarker: el.classList.contains('pin-marker'),
                isTextMarker: el.classList.contains('text-marker'),
                attributes: attrs
            });
        });

        if (window.parent && window.parent.state && Array.isArray(window.parent.state.connectors)) {
            copiedConnectorIds.forEach(connId => {
                const conn = window.parent.state.connectors.find(c => c && c.id === connId);
                if (conn && conn.start && conn.end) {
                    clipboardData.push({
                        isConnector: true,
                        connId: conn.id,
                        connType: conn.type || 'straight',
                        start: JSON.parse(JSON.stringify(conn.start)),
                        end: JSON.parse(JSON.stringify(conn.end)),
                        style: conn.style ? JSON.parse(JSON.stringify(conn.style)) : { stroke: '#475569', strokeWidth: 1.6 }
                    });
                }
            });
        }

        v4Clipboard = clipboardData;
        notifyParent({
            type: 'LF_SAVE_CLIPBOARD',
            clipboard: clipboardData
        });
        console.log("[Clipboard Debug] Copied " + clipboardData.length + " item(s). Notifying parent with LF_SAVE_CLIPBOARD.");
    };

    window.cutSelectedObjects = () => {
        const selected = document.querySelectorAll('.lf-component.selected');
        const selectedConnIds = (window.parent && window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.getSelectedIds === 'function')
            ? window.parent.ConnectorEngine.getSelectedIds()
            : [];
        console.log("[Clipboard Debug] cutSelectedObjects running. Selected elements:", selected.length, "connectors:", selectedConnIds.length);
        if (selected.length === 0 && selectedConnIds.length === 0) return;

        window.copySelectedObjects();

        if (Array.isArray(v4Clipboard)) {
            v4Clipboard.forEach(item => item.isCut = true);
        }
        if (window.top && Array.isArray(window.top.__lf_global_clipboard__)) {
            window.top.__lf_global_clipboard__.forEach(item => item.isCut = true);
        }
        notifyParent({
            type: 'LF_SAVE_CLIPBOARD',
            clipboard: v4Clipboard
        });

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        selected.forEach(c => {
            if (c.classList.contains('connector-line')) {
                notifyParent({ type: 'LF_DELETE_CONNECTOR', id: c.id });
            } else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                let idx = parseInt(c.getAttribute('data-index'));
                if (isNaN(idx)) {
                    idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-', ''));
                }
                notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                c.remove();
            } else {
                c.remove();
            }
        });

        if (selectedConnIds.length > 0) {
            selectedConnIds.forEach(id => {
                notifyParent({ type: 'LF_DELETE_CONNECTOR', id: id });
            });
        }

        if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
            try { window.SelectionAdorner.clear(); } catch(adErr) {}
        }

        notifyParent({ type: 'LF_DESELECT' });
        markDirty();
        console.log("[Clipboard Debug] Cut operation complete.");
    };

    window.pasteCopiedObjectsFromData = (clipboardData) => {
        console.log("[Clipboard Debug] pasteCopiedObjectsFromData running. Items to paste:", clipboardData ? clipboardData.length : 0);
        if (!clipboardData || clipboardData.length === 0) {
            console.log("[Clipboard Debug] Clipboard is empty.");
            return;
        }

        try {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            document.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
            
            // Responsive Screen Container Isolation:
            // Check if responsive PC/Mobile containers exist in current document
            const pcInner = document.querySelector('.pc-content-inner');
            const mobileInner = document.querySelector('.mobile-content-inner');
            const isResponsiveTemplate = !!(pcInner || mobileInner);

            const newSelectedIds = [];
            const selectedIdsIsGroupMap = {};
            const isCutOperation = clipboardData.some(item => item.isCut === true);
            const offset = isCutOperation ? 0 : 15;

            clipboardData.forEach(item => { item.isCut = false; });
            if (Array.isArray(v4Clipboard)) v4Clipboard.forEach(item => { item.isCut = false; });
            if (window.top && Array.isArray(window.top.__lf_global_clipboard__)) {
                window.top.__lf_global_clipboard__.forEach(item => { item.isCut = false; });
            }
            notifyParent({
                type: 'LF_SAVE_CLIPBOARD',
                clipboard: clipboardData
            });

            const nowStamp = Date.now();

            const componentItems = clipboardData.filter(item => !item.isConnector);
            const connectorItems = clipboardData.filter(item => item.isConnector);
            const idMap = {};

            // Calculate bounding box of copied components
            let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
            componentItems.forEach(item => {
                const l = typeof item.left === 'number' ? item.left : (parseFloat(item.left) || 0);
                const t = typeof item.top === 'number' ? item.top : (parseFloat(item.top) || 0);
                const w = typeof item.width === 'number' ? item.width : (parseFloat(item.width) || 120);
                const h = typeof item.height === 'number' ? item.height : (parseFloat(item.height) || 30);
                if (l < minLeft) minLeft = l;
                if (t < minTop) minTop = t;
                if (l + w > maxRight) maxRight = l + w;
                if (t + h > maxBottom) maxBottom = t + h;
            });
            if (minLeft === Infinity) { minLeft = 0; minTop = 0; maxRight = 120; maxBottom = 30; }
            const groupW = Math.max(10, maxRight - minLeft);
            const groupH = Math.max(10, maxBottom - minTop);

            // Responsive Screen Cross-Frame Routing & Viewport Center Calculation:
            let targetFrame = 'root';
            let targetHost = document.body;
            let baseLeft = 0;
            let baseTop = 0;
            let visibleW = 360;

            if (isResponsiveTemplate) {
                const pcScrollArea = document.querySelector('.pc-content-area');
                const mobileScrollArea = document.querySelector('.mobile-content-area, .mobile-content');

                targetFrame = window.lastActiveFrame;
                const currentlySelected = document.querySelector('.lf-component.selected');
                const isCanvasTarget = (targetFrame === 'canvas') ||
                                       (currentlySelected && !currentlySelected.closest('.frame-column, .pc-browser-frame, .mobile-browser-frame, .pc-content-inner, .mobile-content-inner'));

                if (isCanvasTarget) {
                    targetFrame = 'canvas';
                    targetHost = document.querySelector('.page, .canvas, #canvas-page, #canvas') || document.body;
                    baseLeft = Math.max(15, Math.round((1600 - groupW) / 2));
                    baseTop = Math.max(15, Math.round((900 - groupH) / 2));
                } else {
                    const targetCol = (currentlySelected ? currentlySelected.closest('.frame-column') : null) ||
                                      document.querySelector('.frame-column.active-column') ||
                                      document.querySelector('.mobile-column.active-column') ||
                                      document.querySelector('.pc-column.active-column');

                    if (targetCol) {
                        const colInner = targetCol.querySelector('.mobile-content-inner, .pc-content-inner');
                        const colScroll = targetCol.querySelector('.mobile-content-area, .mobile-content, .pc-content-area');
                        targetHost = colInner || targetCol;
                        const scrollTop = colScroll ? colScroll.scrollTop : 0;
                        const visibleH = colScroll ? (colScroll.clientHeight || 810) : 810;
                        const colW = targetHost.offsetWidth || (targetCol.classList.contains('mobile-column') ? 360 : 1160);
                        baseLeft = Math.max(15, Math.round((colW - groupW) / 2));
                        baseTop = Math.max(15, Math.round(scrollTop + (visibleH / 2) - (groupH / 2)));
                    } else {
                        if (!mobileScrollArea && pcScrollArea) targetFrame = 'pc';
                        if (!pcScrollArea && mobileScrollArea) targetFrame = 'mobile';
                        if (!targetFrame) {
                            if (currentlySelected) {
                                if (currentlySelected.closest('.mobile-content-inner, .mobile-content-area, .mobile-content, .mobile-frame, .mobile-browser-frame')) {
                                    targetFrame = 'mobile';
                                } else if (currentlySelected.closest('.pc-content-inner, .pc-content-area, .pc-frame, .pc-browser-frame')) {
                                    targetFrame = 'pc';
                                }
                            }
                        }
                        if (!targetFrame) {
                            targetFrame = componentItems.some(i => i.frameContainer === 'mobile') ? 'mobile' : 'pc';
                        }
                        targetHost = (targetFrame === 'mobile' && mobileInner) ? mobileInner : (pcInner || document.body);
                        const scrollArea = (targetFrame === 'mobile' && mobileScrollArea)
                            ? mobileScrollArea
                            : (pcScrollArea || mobileScrollArea);

                        const scrollTop = scrollArea ? scrollArea.scrollTop : 0;
                        const visibleH = scrollArea ? (scrollArea.clientHeight || 810) : 810;
                        const pcW = pcInner ? (pcInner.offsetWidth || 1160) : 1160;
                        visibleW = targetFrame === 'mobile' ? (mobileInner ? (mobileInner.offsetWidth || 360) : 360) : pcW;

                        const viewCenterX = visibleW / 2;
                        const viewCenterY = scrollTop + (visibleH / 2);

                        baseLeft = Math.round(viewCenterX - (groupW / 2));
                        baseTop = Math.round(viewCenterY - (groupH / 2));

                        if (targetFrame === 'mobile') {
                            baseLeft = Math.max(10, Math.min(baseLeft, visibleW - groupW - 10));
                        } else {
                            baseLeft = Math.max(15, Math.min(baseLeft, pcW - groupW - 15));
                        }
                        baseTop = Math.max(15, baseTop);
                    }
                }
            } else {
                // Non-responsive screen: center in current visible viewport canvas coordinates
                let viewCenterX = 800;
                let viewCenterY = 450;
                try {
                    const parentState = window.parent && window.parent.state;
                    const parentDOM = window.parent && window.parent.DOM;
                    if (parentState && parentState.transform && parentDOM && parentDOM.canvas) {
                        const t = parentState.transform;
                        const cw = parentDOM.canvas.clientWidth || 1600;
                        const ch = parentDOM.canvas.clientHeight || 900;
                        const s = t.scale || 1;
                        viewCenterX = Math.round(((cw / 2) - t.x) / s);
                        viewCenterY = Math.round(((ch / 2) - t.y) / s);
                    }
                } catch(e) {}

                baseLeft = Math.round(viewCenterX - (groupW / 2));
                baseTop = Math.round(viewCenterY - (groupH / 2));
                const maxW = Math.max(1600, document.body.scrollWidth || 0, document.documentElement.scrollWidth || 0);
                const maxH = Math.max(900, document.body.scrollHeight || 0, document.documentElement.scrollHeight || 0);
                baseLeft = Math.max(15, Math.min(baseLeft, maxW - groupW - 15));
                baseTop = Math.max(15, Math.min(baseTop, maxH - groupH - 15));
            }

            // Calculate base top z-index for pasted items
            const getHostTopZ = (container) => {
                if (typeof window.getNextTopZIndex === 'function') {
                    return window.getNextTopZIndex(container);
                }
                let maxZ = 1000;
                const comps = document.querySelectorAll ? document.querySelectorAll('.lf-component') : ((container || document.body).querySelectorAll ? (container || document.body).querySelectorAll('.lf-component') : []);
                comps.forEach(c => {
                    if (c.classList.contains('pin-marker')) return;
                    let z = parseInt(c.style.zIndex, 10);
                    if (isNaN(z)) {
                        const compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                        z = isNaN(compZ) ? 1000 : compZ;
                    }
                    if (z < 190000 && z > maxZ) maxZ = z;
                });
                return maxZ + 10;
            };

            const pasteHost = isResponsiveTemplate ? targetHost : (document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body);
            const baseTopZ = getHostTopZ(pasteHost);

            // Extract original z-indexes to preserve relative layering inside copied group
            const copiedZs = componentItems.map(item => {
                const match = (item.styleCssText || '').match(/z-index\s*:\s*(\d+)/i);
                return match ? parseInt(match[1], 10) : 1000;
            });
            const minCopiedZ = copiedZs.length > 0 ? Math.min(...copiedZs) : 1000;

            const trailingRef = Array.from(pasteHost.children).find(c => !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script'));

            componentItems.forEach((item, idx) => {
                const v = document.createElement('div');
                const randSuffix = Math.floor(Math.random() * 1000000) + '_' + idx;
                const newId = item.isPinMarker ? ('v4-pin-' + nowStamp + '_' + randSuffix) : ('v4-comp-' + nowStamp + '_' + randSuffix);
                v.id = newId;
                v.className = item.className + ' selected';
                v.style.cssText = item.styleCssText;

                // Rebase z-index to ensure it sits on top of all existing components while keeping relative order
                if (item.isPinMarker) {
                    v.style.zIndex = '200000';
                } else {
                    const originalZ = copiedZs[idx] !== undefined ? copiedZs[idx] : 1000;
                    const relOffsetZ = Math.max(0, originalZ - minCopiedZ);
                    const assignedZ = baseTopZ + relOffsetZ;
                    v.style.zIndex = String(assignedZ);
                }

                const relX = (typeof item.left === 'number' ? item.left : (parseFloat(item.left) || 0)) - minLeft;
                const relY = (typeof item.top === 'number' ? item.top : (parseFloat(item.top) || 0)) - minTop;
                let posX = baseLeft + relX;
                let posY = baseTop + relY;

                if (isResponsiveTemplate) {
                    if (targetFrame === 'mobile') {
                        const curW = parseFloat(v.style.width) || (typeof item.width === 'number' ? item.width : parseFloat(item.width)) || 0;
                        if (curW && curW > 340) {
                            v.style.width = '340px';
                            if (componentItems.length === 1) {
                                posX = Math.max(10, Math.round((visibleW - 340) / 2));
                            }
                        }
                    }
                }
                v.style.left = posX + 'px';
                v.style.top = posY + 'px';

                if (trailingRef && trailingRef.parentNode === pasteHost) {
                    pasteHost.insertBefore(v, trailingRef);
                } else {
                    pasteHost.appendChild(v);
                }

                v.innerHTML = item.html;

                if (item.attributes && item.attributes.id) {
                    idMap[item.attributes.id] = newId;
                }

                if (item.isGroup) {
                    selectedIdsIsGroupMap[newId] = true;
                }

                if (item.attributes) {
                    Object.keys(item.attributes).forEach(attrName => {
                        if (attrName !== 'id' && attrName !== 'data-connectors' && attrName !== 'data-source-id' && attrName !== 'data-target-id') {
                            v.setAttribute(attrName, item.attributes[attrName]);
                        }
                    });
                }
                v.removeAttribute('data-source-id');
                v.removeAttribute('data-target-id');

                const childrenWithId = v.querySelectorAll('[id]');
                childrenWithId.forEach((child, cIdx) => {
                    const oldId = child.id;
                    let prefix = 'v4-comp-';
                    if (child.classList.contains('pin-marker') || oldId.startsWith('v4-pin-')) {
                        prefix = 'v4-pin-';
                    }
                    const uniqueSuffix = nowStamp + '_' + Math.floor(Math.random() * 1000000) + '_' + cIdx;
                    const newChildId = prefix + uniqueSuffix;
                    child.id = newChildId;
                    idMap[oldId] = newChildId;
                });

                if (item.isGroup) {
                    const rawChildren = v.getAttribute('data-children');
                    if (rawChildren) {
                        try {
                            const childIds = JSON.parse(rawChildren);
                            const newChildIds = childIds.map(oldId => idMap[oldId] || oldId);
                            v.setAttribute('data-children', JSON.stringify(newChildIds));
                        } catch (e) {
                            console.warn("[Clipboard] Failed to remap data-children inside cloned group:", e);
                        }
                    }
                }

                v.querySelectorAll('.lf-component').forEach(child => child.classList.remove('selected'));
                v.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
                
                newSelectedIds.push(newId);
            });

            // Paste connectors
            const pastedConnIds = [];
            if (connectorItems.length > 0 && window.parent && window.parent.state) {
                if (!Array.isArray(window.parent.state.connectors)) {
                    window.parent.state.connectors = [];
                }
                connectorItems.forEach((cItem, cIdx) => {
                    const newConnId = 'conn_' + nowStamp + '_' + Math.floor(Math.random() * 1000000) + '_' + cIdx;
                    const newStart = { ...cItem.start, x: (cItem.start.x || 0) + offset, y: (cItem.start.y || 0) + offset };
                    const newEnd = { ...cItem.end, x: (cItem.end.x || 0) + offset, y: (cItem.end.y || 0) + offset };

                    if (newStart.targetId && idMap[newStart.targetId]) newStart.targetId = idMap[newStart.targetId];
                    else { newStart.targetId = null; newStart.side = null; }

                    if (newEnd.targetId && idMap[newEnd.targetId]) newEnd.targetId = idMap[newEnd.targetId];
                    else { newEnd.targetId = null; newEnd.side = null; }

                    const newConn = {
                        id: newConnId,
                        type: cItem.connType || 'straight',
                        start: newStart,
                        end: newEnd,
                        style: cItem.style ? { ...cItem.style } : { stroke: '#475569', strokeWidth: 1.6 }
                    };
                    window.parent.state.connectors.push(newConn);
                    pastedConnIds.push(newConnId);
                    newSelectedIds.push(newConnId);
                });

                if (window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.redrawAll === 'function') {
                    window.parent.ConnectorEngine.redrawAll();
                }
                if (window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.setSelectedIds === 'function') {
                    window.parent.ConnectorEngine.setSelectedIds(pastedConnIds);
                }
                notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent.state.connectors });
            }

            if (typeof window.enforceDesignSystem === 'function') {
                try { window.enforceDesignSystem(); } catch(dsErr) { console.warn("[Clipboard] enforceDesignSystem error:", dsErr); }
            } else if (typeof window.initHandles === 'function') {
                try { window.initHandles(); } catch(ihErr) { console.warn("[Clipboard] initHandles error:", ihErr); }
            }

            const hasPin = clipboardData.some(item => item.isPinMarker || item.isTextMarker);
            if (hasPin && typeof window.reorderAllPins === 'function') {
                try { window.reorderAllPins(); } catch(pinErr) { console.warn("[Clipboard] reorderAllPins error:", pinErr); }
            }

            if (newSelectedIds.length > 0) {
                const firstNewEl = document.getElementById(newSelectedIds[0]);
                const firstStyles = (firstNewEl && typeof window._getCompStyles === 'function') ? window._getCompStyles(firstNewEl) : {};
                if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
                    try {
                        newSelectedIds.forEach(id => {
                            const el = document.getElementById(id);
                            if (el) window.SelectionAdorner.update(el);
                        });
                    } catch(adErr) {}
                }
                notifyParent({
                    type: "LF_PASTE_COMPLETED",
                    ids: newSelectedIds,
                    selectedIdsIsGroupMap: selectedIdsIsGroupMap,
                    firstCompStyles: firstStyles
                });
            }
            if (typeof window.markDirty === 'function') window.markDirty();
            else if (typeof markDirty === 'function') markDirty();
            else notifyParent({ type: 'LF_DIRTY' });

            try { window.focus(); } catch(e) {}
            console.log("[Clipboard Debug] Pasted " + clipboardData.length + " item(s) successfully.");
        } catch(err) {
            console.error("[Clipboard Error] Exception in pasteCopiedObjectsFromData:", err);
        }
    };

    window.pasteCopiedObjects = () => {
        if (isPastingLocked) {
            console.log("[Clipboard Debug] Paste call throttled to prevent duplicate execution.");
            return;
        }
        isPastingLocked = true;
        setTimeout(() => { isPastingLocked = false; }, 400);
        console.log("[Clipboard Debug] pasteCopiedObjects calling LF_REQUEST_CLIPBOARD to parent.");
        notifyParent({ type: 'LF_REQUEST_CLIPBOARD' });
    };

    window.copySelectedObjectStyle = function() {
        const selected = document.querySelectorAll('.lf-component.selected');
        const targetComp = (selected && selected.length > 0) ? selected[0] : window.activeEl;
        if (!targetComp) {
            console.warn("[Style Clipboard] No component selected to copy format from.");
            notifyParent({
                type: 'LF_SHOW_TOAST',
                message: '\uc11c\uc2dd\uc744 \ubcf5\uc0ac\ud560 \ub3c4\ud615\uc744 \uba3c\uc800 \uc120\ud0dd\ud574\uc8fc\uc138\uc694.',
                toastType: 'warning'
            });
            return null;
        }

        const compStyles = (typeof window._getCompStyles === 'function') ? window._getCompStyles(targetComp) : null;
        const cur = compStyles ? (compStyles.currentStyles || {}) : {};
        const shape = targetComp.querySelector('.v4-shape') || (targetComp.classList.contains('v4-shape') ? targetComp : null);
        const isShape = !!shape;

        let detectedBorderStyle = 'solid';
        if (shape) {
            detectedBorderStyle = shape.getAttribute('data-line-style') || (shape.style && shape.style.borderStyle) || 'solid';
        } else if (targetComp.style && targetComp.style.borderStyle) {
            detectedBorderStyle = targetComp.style.borderStyle;
        }

        // Deep extraction of Content Editor typography formats
        const textContainer = targetComp.querySelector('.v4-shape-text-content, .v4-shape-text-overlay, .v4-editable-cell') ||
                              (targetComp.classList.contains('v4-editable-cell') ? targetComp : null) ||
                              targetComp.querySelector('.v4-custom-btn, .v4-checkbox-text, .v4-radio-text');

        let extractedColor = '';
        let extractedFontSize = null;
        let extractedFontFamily = '';
        let extractedIsBold = false;
        let extractedIsItalic = false;
        let extractedIsUnderline = false;
        let extractedIsStrike = false;
        let extractedTextBg = '';
        let extractedTextAlign = cur.textAlign || 'center';
        let extractedVAlign = cur.vAlign || 'middle';
        let extractedPadTop = cur.padTop !== undefined ? cur.padTop : 5;
        let extractedPadRight = cur.padRight !== undefined ? cur.padRight : 10;
        let extractedPadBottom = cur.padBottom !== undefined ? cur.padBottom : 5;
        let extractedPadLeft = cur.padLeft !== undefined ? cur.padLeft : 10;

        if (textContainer) {
            // 1. Color
            const spansWithColor = Array.from(textContainer.querySelectorAll('[style*="color"]'));
            for (let i = 0; i < spansWithColor.length; i++) {
                const cVal = spansWithColor[i].style.color;
                if (cVal && cVal !== 'inherit' && cVal !== 'initial' && cVal !== 'transparent') {
                    extractedColor = (typeof window.rgbToHex === 'function' ? window.rgbToHex(cVal) : cVal) || cVal;
                    break;
                }
            }
            if (!extractedColor && textContainer.style && textContainer.style.color) {
                extractedColor = (typeof window.rgbToHex === 'function' ? window.rgbToHex(textContainer.style.color) : textContainer.style.color);
            }
            if (!extractedColor) {
                const compCol = window.getComputedStyle(textContainer).color;
                if (compCol) {
                    extractedColor = (typeof window.rgbToHex === 'function' ? window.rgbToHex(compCol) : compCol) || compCol;
                }
            }

            // 2. Font Size
            const spansWithFs = Array.from(textContainer.querySelectorAll('[style*="font-size"], [style*="fontSize"]'));
            for (let i = 0; i < spansWithFs.length; i++) {
                const fsVal = spansWithFs[i].style.fontSize;
                if (fsVal) {
                    const parsed = parseInt(fsVal);
                    if (!isNaN(parsed) && parsed > 0) {
                        extractedFontSize = parsed;
                        break;
                    }
                }
            }
            if (!extractedFontSize && textContainer.style && textContainer.style.fontSize) {
                const parsed = parseInt(textContainer.style.fontSize);
                if (!isNaN(parsed) && parsed > 0) extractedFontSize = parsed;
            }
            if (!extractedFontSize) {
                const compFs = window.getComputedStyle(textContainer).fontSize;
                if (compFs) {
                    const parsed = parseInt(compFs);
                    if (!isNaN(parsed) && parsed > 0) extractedFontSize = parsed;
                }
            }

            // 3. Bold
            if (textContainer.querySelector('strong, b') || textContainer.querySelector('[style*="font-weight: bold"], [style*="font-weight: 700"], [style*="font-weight: 800"], [style*="font-weight: 900"]')) {
                extractedIsBold = true;
            } else {
                const fw = (textContainer.style && textContainer.style.fontWeight) || window.getComputedStyle(textContainer).fontWeight;
                if (fw === 'bold' || fw === '700' || fw === '800' || fw === '900' || parseInt(fw) >= 600) {
                    extractedIsBold = true;
                }
            }

            // 4. Italic
            if (textContainer.querySelector('em, i') || textContainer.querySelector('[style*="font-style: italic"]')) {
                extractedIsItalic = true;
            } else {
                const fst = (textContainer.style && textContainer.style.fontStyle) || window.getComputedStyle(textContainer).fontStyle;
                if (fst === 'italic' || fst === 'oblique') {
                    extractedIsItalic = true;
                }
            }

            // 5. Underline
            if (textContainer.querySelector('u') || textContainer.querySelector('[style*="text-decoration: underline"], [style*="text-decoration-line: underline"]')) {
                extractedIsUnderline = true;
            }

            // 6. Strike
            if (textContainer.querySelector('s, strike') || textContainer.querySelector('[style*="text-decoration: line-through"]')) {
                extractedIsStrike = true;
            }

            // 7. Text Highlight Background
            const spansWithBg = Array.from(textContainer.querySelectorAll('[style*="background-color"], [style*="background"]'));
            for (let i = 0; i < spansWithBg.length; i++) {
                const el = spansWithBg[i];
                if (el === textContainer || el.classList.contains('v4-shape-text-content')) continue;
                const bgVal = el.style.backgroundColor || el.style.background;
                if (bgVal && bgVal !== 'transparent' && bgVal !== 'none' && !bgVal.includes('rgba(0, 0, 0, 0)')) {
                    extractedTextBg = (typeof window.rgbToHex === 'function' ? window.rgbToHex(bgVal) : bgVal) || bgVal;
                    break;
                }
            }

            // 8. Font Family
            const spansWithFf = Array.from(textContainer.querySelectorAll('[style*="font-family"], [style*="fontFamily"]'));
            for (let i = 0; i < spansWithFf.length; i++) {
                if (spansWithFf[i].style.fontFamily && spansWithFf[i].style.fontFamily !== 'inherit') {
                    extractedFontFamily = spansWithFf[i].style.fontFamily;
                    break;
                }
            }
            if (!extractedFontFamily && textContainer.style && textContainer.style.fontFamily && textContainer.style.fontFamily !== 'inherit') {
                extractedFontFamily = textContainer.style.fontFamily;
            }
            if (!extractedFontFamily) {
                const compFf = window.getComputedStyle(textContainer).fontFamily;
                if (compFf && compFf !== 'inherit') extractedFontFamily = compFf;
            }

            // 9. Alignment
            const alignAttr = targetComp.getAttribute('data-align') || (shape && shape.getAttribute('data-align')) || textContainer.getAttribute('data-align');
            if (alignAttr) {
                extractedTextAlign = alignAttr;
            } else if (textContainer.style && textContainer.style.textAlign) {
                extractedTextAlign = textContainer.style.textAlign;
            } else {
                const pWithAlign = textContainer.querySelector('p[style*="text-align"]');
                if (pWithAlign && pWithAlign.style.textAlign) {
                    extractedTextAlign = pWithAlign.style.textAlign;
                } else {
                    extractedTextAlign = window.getComputedStyle(textContainer).textAlign || extractedTextAlign;
                }
            }

            // 10. Vertical Alignment
            const vAttr = targetComp.getAttribute('data-valign') || (shape && shape.getAttribute('data-valign')) || textContainer.getAttribute('data-valign');
            if (vAttr) {
                extractedVAlign = vAttr === 'flex-start' ? 'top' : (vAttr === 'flex-end' ? 'bottom' : (vAttr === 'center' ? 'middle' : vAttr));
            }
        }

        if (!extractedColor) extractedColor = cur.text || '#1e293b';
        if (!extractedFontSize) extractedFontSize = cur.fontSize || 14;
        if (!extractedFontFamily) extractedFontFamily = cur.fontFamily || 'inherit';

        const styleData = {
            type: 'LF_STYLE_CLIPBOARD',
            version: 2,
            timestamp: Date.now(),
            isShape: isShape,
            shapeType: compStyles ? (compStyles.shapeType || '') : '',
            fill: {
                bg: cur.bg || '',
                bgOpacity: cur.bgOpacity !== undefined ? cur.bgOpacity : 100,
                isBgTransparent: !!cur.isBgTransparent,
                patternType: compStyles ? (compStyles.patternType || '') : ''
            },
            border: {
                color: cur.border || '',
                width: '1.6px',
                style: detectedBorderStyle,
                radius: cur.borderRadius !== undefined ? cur.borderRadius : 0,
                isBorderTransparent: !!cur.isBorderTransparent
            },
            text: {
                color: extractedColor,
                fontSize: extractedFontSize,
                fontFamily: extractedFontFamily,
                isBold: extractedIsBold,
                isItalic: extractedIsItalic,
                isUnderline: extractedIsUnderline,
                isStrike: extractedIsStrike,
                textBg: extractedTextBg,
                textAlign: extractedTextAlign,
                vAlign: extractedVAlign,
                padTop: extractedPadTop,
                padRight: extractedPadRight,
                padBottom: extractedPadBottom,
                padLeft: extractedPadLeft
            },
            line: {
                lineColor: (compStyles && compStyles.lineColor) ? compStyles.lineColor : (cur.border || '#c8c8c8'),
                lineThickness: (compStyles && compStyles.lineThickness) ? compStyles.lineThickness : 1.6,
                lineStyle: (compStyles && compStyles.lineStyle) ? compStyles.lineStyle : 'solid',
                lineDir: (compStyles && compStyles.lineDir) ? compStyles.lineDir : 'horizontal'
            }
        };

        v4StyleClipboard = styleData;

        if (window.top) {
            try {
                window.top.__lf_global_style_clipboard__ = styleData;
            } catch(e) {}
        }

        notifyParent({
            type: 'LF_SAVE_STYLE_CLIPBOARD',
            styleClipboard: styleData
        });

        notifyParent({
            type: 'LF_SHOW_TOAST',
            message: '\ub3c4\ud615 \uc11c\uc2dd\uc774 \ubcf5\uc0ac\ub418\uc5c8\uc2b5\ub2c8\ub2e4. (Ctrl+Shift+V\ub85c \ubd99\uc5ec\ub123\uae30)',
            toastType: 'info'
        });

        console.log("[Style Clipboard] Copied style data successfully:", styleData);
        return styleData;
    };

    window.pasteCopiedObjectStyle = function(explicitStyleData) {
        let styleData = explicitStyleData || v4StyleClipboard;
        if (!styleData && window.top) {
            try {
                styleData = window.top.__lf_global_style_clipboard__;
            } catch(e) {}
        }
        if (!styleData) {
            console.warn("[Style Clipboard] No style data found in clipboard.");
            notifyParent({
                type: 'LF_SHOW_TOAST',
                message: '\ubcf5\uc0ac\ub41c \uc11c\uc2dd\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uba3c\uc800 \ub3c4\ud615\uc744 \uc120\ud0dd\ud558\uace0 \uc11c\uc2dd\uc744 \ubcf5\uc0ac\ud558\uc138\uc694.',
                toastType: 'warning'
            });
            return false;
        }

        const selected = Array.from(document.querySelectorAll('.lf-component.selected'));
        if (selected.length === 0 && window.activeEl) {
            selected.push(window.activeEl);
        }
        if (selected.length === 0) {
            notifyParent({
                type: 'LF_SHOW_TOAST',
                message: '\uc11c\uc2dd\uc744 \uc801\uc6a9\ud560 \ub300\uc0c1 \ub3c4\ud615\uc744 \uba3c\uc800 \uc120\ud0dd\ud574\uc8fc\uc138\uc694.',
                toastType: 'warning'
            });
            return false;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        function applyTypographyDeep(cell, textData) {
            if (!cell || !textData) return;

            // 1. Remove bold tags if not bold
            if (!textData.isBold) {
                cell.querySelectorAll('strong, b').forEach(function(bTag) {
                    while (bTag.firstChild) {
                        bTag.parentNode.insertBefore(bTag.firstChild, bTag);
                    }
                    bTag.remove();
                });
            }

            // 2. Remove italic tags if not italic
            if (!textData.isItalic) {
                cell.querySelectorAll('em, i').forEach(function(iTag) {
                    while (iTag.firstChild) {
                        iTag.parentNode.insertBefore(iTag.firstChild, iTag);
                    }
                    iTag.remove();
                });
            }

            // 3. Remove underline if not underline
            if (!textData.isUnderline) {
                cell.querySelectorAll('u').forEach(function(uTag) {
                    while (uTag.firstChild) {
                        uTag.parentNode.insertBefore(uTag.firstChild, uTag);
                    }
                    uTag.remove();
                });
            }

            // 4. Remove strike if not strike
            if (!textData.isStrike) {
                cell.querySelectorAll('s, strike').forEach(function(sTag) {
                    while (sTag.firstChild) {
                        sTag.parentNode.insertBefore(sTag.firstChild, sTag);
                    }
                    sTag.remove();
                });
            }

            // 5. Wrap plain text in <p> if no block child exists
            if (cell.children.length === 0 && cell.textContent.trim().length > 0) {
                const txt = cell.textContent;
                cell.innerHTML = '<p>' + txt + '</p>';
            }

            // 6. Wrap in <strong> if isBold
            if (textData.isBold) {
                const pList = cell.querySelectorAll('p');
                if (pList.length > 0) {
                    pList.forEach(function(p) {
                        if (p.querySelectorAll('strong, b').length === 0 && p.childNodes.length > 0) {
                            const str = document.createElement('strong');
                            while (p.firstChild) str.appendChild(p.firstChild);
                            p.appendChild(str);
                        }
                    });
                } else if (cell.childNodes.length > 0 && cell.querySelectorAll('strong, b').length === 0) {
                    const str = document.createElement('strong');
                    while (cell.firstChild) str.appendChild(cell.firstChild);
                    cell.appendChild(str);
                }
            }

            // 7. Wrap in <em> if isItalic
            if (textData.isItalic) {
                const pList = cell.querySelectorAll('p');
                if (pList.length > 0) {
                    pList.forEach(function(p) {
                        if (p.querySelectorAll('em, i').length === 0 && p.childNodes.length > 0) {
                            const em = document.createElement('em');
                            while (p.firstChild) em.appendChild(p.firstChild);
                            p.appendChild(em);
                        }
                    });
                } else if (cell.childNodes.length > 0 && cell.querySelectorAll('em, i').length === 0) {
                    const em = document.createElement('em');
                    while (cell.firstChild) em.appendChild(cell.firstChild);
                    cell.appendChild(em);
                }
            }

            // 8. Wrap in <u> if isUnderline
            if (textData.isUnderline) {
                const pList = cell.querySelectorAll('p');
                if (pList.length > 0) {
                    pList.forEach(function(p) {
                        if (p.querySelectorAll('u').length === 0 && p.childNodes.length > 0) {
                            const uEl = document.createElement('u');
                            while (p.firstChild) uEl.appendChild(p.firstChild);
                            p.appendChild(uEl);
                        }
                    });
                } else if (cell.childNodes.length > 0 && cell.querySelectorAll('u').length === 0) {
                    const uEl = document.createElement('u');
                    while (cell.firstChild) uEl.appendChild(cell.firstChild);
                    cell.appendChild(uEl);
                }
            }

            // 9. Wrap in <s> if isStrike
            if (textData.isStrike) {
                const pList = cell.querySelectorAll('p');
                if (pList.length > 0) {
                    pList.forEach(function(p) {
                        if (p.querySelectorAll('s, strike').length === 0 && p.childNodes.length > 0) {
                            const sEl = document.createElement('s');
                            while (p.firstChild) sEl.appendChild(p.firstChild);
                            p.appendChild(sEl);
                        }
                    });
                } else if (cell.childNodes.length > 0 && cell.querySelectorAll('s, strike').length === 0) {
                    const sEl = document.createElement('s');
                    while (cell.firstChild) sEl.appendChild(cell.firstChild);
                    cell.appendChild(sEl);
                }
            }

            // 10. Ensure each paragraph has span wrapper for clean Quill format parsing
            const pNodes = cell.querySelectorAll('p');
            if (pNodes.length > 0) {
                pNodes.forEach(function(p) {
                    if (p.querySelectorAll('span').length === 0 && p.childNodes.length > 0) {
                        const span = document.createElement('span');
                        while (p.firstChild) span.appendChild(p.firstChild);
                        p.appendChild(span);
                    }
                });
            } else if (cell.querySelectorAll('span').length === 0 && cell.childNodes.length > 0) {
                const span = document.createElement('span');
                while (cell.firstChild) span.appendChild(cell.firstChild);
                cell.appendChild(span);
            }

            // 11. Apply styles to outer container
            if (textData.color) cell.style.setProperty('color', textData.color, 'important');
            if (textData.fontSize) cell.style.setProperty('font-size', textData.fontSize + 'px', 'important');
            if (textData.fontFamily && textData.fontFamily !== 'inherit') cell.style.setProperty('font-family', textData.fontFamily, 'important');
            cell.style.setProperty('font-weight', textData.isBold ? '700' : 'normal', 'important');
            cell.style.setProperty('font-style', textData.isItalic ? 'italic' : 'normal', 'important');

            // 12. Deeply apply to all descendants to override inline styles
            cell.querySelectorAll('*').forEach(function(child) {
                if (textData.color) child.style.setProperty('color', textData.color, 'important');
                if (textData.fontSize) child.style.setProperty('font-size', textData.fontSize + 'px', 'important');
                if (textData.fontFamily && textData.fontFamily !== 'inherit') child.style.setProperty('font-family', textData.fontFamily, 'important');
                
                child.style.setProperty('font-weight', textData.isBold ? '700' : 'normal', 'important');
                child.style.setProperty('font-style', textData.isItalic ? 'italic' : 'normal', 'important');

                if (textData.textBg) {
                    if (child.tagName === 'SPAN') {
                        child.style.setProperty('background-color', textData.textBg, 'important');
                    }
                } else {
                    child.style.removeProperty('background-color');
                    child.style.removeProperty('background');
                }

                if (textData.isUnderline && textData.isStrike) {
                    child.style.setProperty('text-decoration', 'underline line-through', 'important');
                } else if (textData.isUnderline) {
                    child.style.setProperty('text-decoration', 'underline', 'important');
                } else if (textData.isStrike) {
                    child.style.setProperty('text-decoration', 'line-through', 'important');
                } else {
                    child.style.removeProperty('text-decoration');
                    child.style.removeProperty('text-decoration-line');
                }

                if (textData.textAlign && (child.tagName === 'P' || child.classList.contains('ql-editor'))) {
                    child.style.setProperty('text-align', textData.textAlign, 'important');
                    child.style.setProperty('width', '100%', 'important');
                    child.style.setProperty('padding', '0px', 'important');
                    child.style.setProperty('margin', '0px', 'important');
                }
            });
        }

        let appliedCount = 0;

        selected.forEach(function(comp) {
            if (!comp) return;

            const shape = comp.querySelector('.v4-shape') || (comp.classList.contains('v4-shape') ? comp : null);
            const isSvgContainer = shape && (shape.classList.contains('v4-shape-diamond') || shape.classList.contains('v4-shape-triangle') || shape.classList.contains('v4-shape-wave') || shape.classList.contains('v4-shape-arrow') || shape.classList.contains('v4-shape-line'));
            const svgShape = shape ? shape.querySelector('path, polygon, rect, circle, line') : null;
            const isLine = comp.classList.contains('v4-shape-line') || (shape && shape.classList.contains('v4-shape-line')) || comp.classList.contains('connector-line');
            const isButton = comp.classList.contains('v4-btn-container') || !!comp.querySelector('.v4-btn-container');
            const customBtn = comp.querySelector('.v4-custom-btn');
            const isTextBox = comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape') || comp.classList.contains('text-marker');

            // 1. Line Target Handling
            if (isLine) {
                const lineTarget = (shape && shape.classList.contains('v4-shape-line')) ? shape : comp;
                const lineEl = lineTarget.querySelector('line, path') || svgShape;
                const strokeColor = (styleData.line && styleData.line.lineColor) || (styleData.border && styleData.border.color) || (styleData.fill && styleData.fill.bg) || '#c8c8c8';
                const strokeWidth = (styleData.line && styleData.line.lineThickness) || 1.6;
                const lineStyle = (styleData.line && styleData.line.lineStyle) || (styleData.border && styleData.border.style) || 'solid';

                lineTarget.setAttribute('data-line-color', strokeColor);
                lineTarget.setAttribute('data-line-width', strokeWidth);
                lineTarget.setAttribute('data-line-style', lineStyle);

                if (lineEl) {
                    lineEl.style.stroke = strokeColor;
                    lineEl.setAttribute('stroke', strokeColor);
                    lineEl.style.strokeWidth = strokeWidth;
                    lineEl.setAttribute('stroke-width', strokeWidth);
                    if (lineStyle === 'dashed') {
                        lineEl.style.strokeDasharray = '6 4';
                        lineEl.setAttribute('stroke-dasharray', '6 4');
                    } else if (lineStyle === 'dotted') {
                        lineEl.style.strokeDasharray = '1 5';
                        lineEl.setAttribute('stroke-dasharray', '1 5');
                    } else {
                        lineEl.style.strokeDasharray = 'none';
                        lineEl.removeAttribute('stroke-dasharray');
                    }
                }
                appliedCount++;
                return;
            }

            // 2. Shape Target Handling
            if (shape) {
                // Background Fill
                let targetFill = '';
                if (styleData.fill) {
                    if (styleData.fill.isBgTransparent || !styleData.fill.bg || styleData.fill.bg === 'transparent' || styleData.fill.bg === 'none') {
                        targetFill = 'transparent';
                    } else if (styleData.fill.bgOpacity !== undefined && styleData.fill.bgOpacity < 100) {
                        const alpha = styleData.fill.bgOpacity > 1 ? (styleData.fill.bgOpacity / 100) : styleData.fill.bgOpacity;
                        targetFill = (typeof window.hexToRgba === 'function') ? window.hexToRgba(styleData.fill.bg, alpha) : styleData.fill.bg;
                    } else {
                        targetFill = styleData.fill.bg;
                    }
                }

                if (isSvgContainer) {
                    shape.style.background = 'transparent';
                    shape.style.backgroundColor = 'transparent';
                    if (svgShape && targetFill) {
                        svgShape.style.fill = (targetFill === 'transparent') ? 'none' : targetFill;
                        svgShape.setAttribute('fill', (targetFill === 'transparent') ? 'none' : targetFill);
                    }
                } else {
                    if (targetFill) {
                        shape.style.backgroundColor = targetFill;
                        shape.style.background = targetFill;
                    }
                }

                if (styleData.fill && styleData.fill.patternType && shape.classList.contains('v4-shape-pattern-grid')) {
                    shape.setAttribute('data-pattern-type', styleData.fill.patternType);
                }

                // Border
                if (styleData.border) {
                    if (styleData.border.isBorderTransparent || !styleData.border.color || styleData.border.color === 'transparent') {
                        if (svgShape) {
                            svgShape.style.stroke = 'none';
                            svgShape.setAttribute('stroke', 'none');
                        }
                        shape.style.borderColor = 'transparent';
                    } else {
                        const bColor = styleData.border.color || '#c8c8c8';
                        const bStyle = styleData.border.style || 'solid';
                        if (svgShape) {
                            svgShape.style.stroke = bColor;
                            svgShape.setAttribute('stroke', bColor);
                            svgShape.style.strokeWidth = '1.6';
                            svgShape.setAttribute('stroke-width', '1.6');
                            if (bStyle === 'dashed') {
                                svgShape.style.strokeDasharray = '6 4';
                                svgShape.setAttribute('stroke-dasharray', '6 4');
                            } else if (bStyle === 'dotted') {
                                svgShape.style.strokeDasharray = '1 5';
                                svgShape.setAttribute('stroke-dasharray', '1 5');
                            } else {
                                svgShape.style.strokeDasharray = 'none';
                                svgShape.removeAttribute('stroke-dasharray');
                            }
                        }
                        shape.style.borderColor = bColor;
                        shape.style.borderWidth = '1.6px';
                        shape.style.borderStyle = bStyle;
                    }

                    if (shape.classList.contains('v4-shape-rect') || shape.classList.contains('v4-shape-webpage')) {
                        const rad = (styleData.border.radius !== undefined) ? parseInt(styleData.border.radius) : 0;
                        shape.style.setProperty('border-radius', rad + 'px', 'important');
                    }
                }

                // Text Styling & Alignment & Padding
                if (styleData.text) {
                    const textData = styleData.text;
                    const textCells = shape.querySelectorAll('.v4-shape-text-content, .v4-shape-text-overlay, .v4-editable-cell');

                    if (textData.textAlign) {
                        shape.setAttribute('data-align', textData.textAlign);
                        comp.setAttribute('data-align', textData.textAlign);
                        shape.style.setProperty('text-align', textData.textAlign, 'important');
                    }

                    if (textData.vAlign) {
                        const normV = textData.vAlign === 'top' ? 'top' : (textData.vAlign === 'bottom' ? 'bottom' : 'middle');
                        const jc = normV === 'top' ? 'flex-start' : (normV === 'bottom' ? 'flex-end' : 'center');
                        shape.setAttribute('data-valign', normV);
                        comp.setAttribute('data-valign', normV);
                        shape.style.setProperty('justify-content', jc, 'important');
                    }

                    const pt = textData.padTop !== undefined ? parseInt(textData.padTop) : 5;
                    const pr = textData.padRight !== undefined ? parseInt(textData.padRight) : 10;
                    const pb = textData.padBottom !== undefined ? parseInt(textData.padBottom) : 5;
                    const pl = textData.padLeft !== undefined ? parseInt(textData.padLeft) : 10;

                    shape.setAttribute('data-pad-top', pt);
                    shape.setAttribute('data-pad-right', pr);
                    shape.setAttribute('data-pad-bottom', pb);
                    shape.setAttribute('data-pad-left', pl);
                    shape.style.setProperty('--v4-shape-pad-top', pt + 'px');
                    shape.style.setProperty('--v4-shape-pad-right', pr + 'px');
                    shape.style.setProperty('--v4-shape-pad-bottom', pb + 'px');
                    shape.style.setProperty('--v4-shape-pad-left', pl + 'px');

                    textCells.forEach(function(cell) {
                        applyTypographyDeep(cell, textData);

                        cell.setAttribute('data-pad-top', pt);
                        cell.setAttribute('data-pad-right', pr);
                        cell.setAttribute('data-pad-bottom', pb);
                        cell.setAttribute('data-pad-left', pl);
                        cell.style.setProperty('padding-top', pt + 'px', 'important');
                        cell.style.setProperty('padding-right', pr + 'px', 'important');
                        cell.style.setProperty('padding-bottom', pb + 'px', 'important');
                        cell.style.setProperty('padding-left', pl + 'px', 'important');
                        cell.style.setProperty('padding', pt + 'px ' + pr + 'px ' + pb + 'px ' + pl + 'px', 'important');
                        cell.style.setProperty('box-sizing', 'border-box', 'important');

                        if (textData.textAlign) {
                            cell.style.setProperty('text-align', textData.textAlign, 'important');
                            cell.querySelectorAll('p, span, .ql-editor, .ql-editor p').forEach(function(child) {
                                child.style.setProperty('text-align', textData.textAlign, 'important');
                            });
                        }
                        if (textData.vAlign) {
                            const jc = textData.vAlign === 'top' ? 'flex-start' : (textData.vAlign === 'bottom' ? 'flex-end' : 'center');
                            cell.style.setProperty('justify-content', jc, 'important');
                            cell.querySelectorAll('p, span, .ql-editor, .ql-editor p').forEach(function(child) {
                                child.style.setProperty('justify-content', jc, 'important');
                            });
                        }
                    });
                }

                appliedCount++;
                return;
            }

            // 3. Button Target Handling
            if (isButton && customBtn) {
                if (styleData.fill && styleData.fill.bg) {
                    customBtn.style.backgroundColor = styleData.fill.bg;
                    customBtn.style.background = styleData.fill.bg;
                }
                if (styleData.border && styleData.border.color) {
                    customBtn.style.borderColor = styleData.border.color;
                    if (styleData.border.radius !== undefined) {
                        customBtn.style.borderRadius = styleData.border.radius + 'px';
                    }
                }
                if (styleData.text) {
                    applyTypographyDeep(customBtn, styleData.text);
                }
                appliedCount++;
                return;
            }

            // 4. Text Box / Marker Target Handling
            if (isTextBox) {
                const cell = comp.querySelector('.v4-editable-cell') || comp;
                if (cell && styleData.text) {
                    applyTypographyDeep(cell, styleData.text);
                }
                if (styleData.fill && styleData.fill.bg && !styleData.fill.isBgTransparent) {
                    comp.style.backgroundColor = styleData.fill.bg;
                }
                if (styleData.border && styleData.border.color && !styleData.border.isBorderTransparent) {
                    comp.style.borderColor = styleData.border.color;
                }
                appliedCount++;
                return;
            }
        });

        if (typeof window.enforceDesignSystem === 'function') {
            try { window.enforceDesignSystem(); } catch(e) {}
        }
        if (typeof window.markDirty === 'function') {
            try { window.markDirty(); } catch(e) {}
        }
        if (selected[0] && typeof window.updateHandles === 'function') {
            try { window.updateHandles(selected[0]); } catch(e) {}
        }

        if (selected.length > 0 && typeof window.notifyParent === 'function' && typeof window._getCompStyles === 'function') {
            const firstCompStyles = window._getCompStyles(selected[0]);
            notifyParent(Object.assign({
                type: 'LF_COMP_RESIZED'
            }, firstCompStyles));
            notifyParent(Object.assign({
                type: 'LF_COMP_SELECTED'
            }, firstCompStyles));
        }

        const toastMsg = appliedCount <= 1
            ? '\ub3c4\ud615 \uc11c\uc2dd\uc774 \uc801\uc6a9\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
            : (appliedCount + '\uac1c \ub3c4\ud615\uc5d0 \uc11c\uc2dd\uc774 \uc77c\uad04 \uc801\uc6a9\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');

        notifyParent({
            type: 'LF_SHOW_TOAST',
            message: toastMsg,
            toastType: 'success'
        });

        console.log("[Style Clipboard] Applied style data to " + appliedCount + " object(s).");
        return true;
    };

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

                const activeEl = selected[0];

                selected.forEach(c => {
                    const l = parseFloat(c.style.left) || 0;
                    const t = parseFloat(c.style.top) || 0;
                    c.style.left = (l + dx) + 'px';
                    c.style.top = (t + dy) + 'px';
                    if (typeof window.updateHandles === 'function') window.updateHandles(c);
                    
                    if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                        const frameType = c.getAttribute('data-frame') || (c.closest && c.closest('.pc-content-inner, .pc-content-area') ? 'pc' : (c.closest && c.closest('.mobile-content-inner, .mobile-content-area') ? 'mobile' : ''));
                        let idx = parseInt(c.getAttribute('data-index'));
                        if (isNaN(idx)) {
                            idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-', ''));
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
                            const scale = (window.parent?.state?.transform?.scale) || 1;
                            const absX = (childRect.left - hostRect.left) / scale;
                            const absY = (childRect.top - hostRect.top) / scale;
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
                                idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-', ''));
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
                notifyParent({ type: 'LF_SNAP_END' });
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
