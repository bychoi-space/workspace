/**
 * assets/vctrl_clipboard_objects.js
 * Cross-Screen Object Clipboard Serialization, Deserialization & Viewport Pasting Engine (Iframe Side).
 * Decoupled from vctrl_shortcuts.js for single responsibility.
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4ClipboardObjectsScript = ...`).
 * 1. DO NOT use unescaped backticks in this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \ to avoid syntax errors.
 */

window.v4ClipboardObjectsScript = `
(function() {
    let isPastingLocked = false;
    let v4Clipboard = [];

    function notifyParent(data) {
        if (window.EditorBus && typeof window.EditorBus.sendToParent === 'function') {
            window.EditorBus.sendToParent(data);
        } else if (window.parent && window.parent !== window) {
            window.parent.postMessage(data, '*');
        }
    }

    window.copySelectedObjects = () => {
        const selected = document.querySelectorAll('.lf-component.selected');
        const selectedConnIds = (window.parent && window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.getSelectedIds === 'function')
            ? window.parent.ConnectorEngine.getSelectedIds()
            : [];
        console.log("[Clipboard Debug] copySelectedObjects running. Selected elements:", selected.length, "connectors:", selectedConnIds.length);
        if (selected.length === 0 && selectedConnIds.length === 0) return;

        const topLevelSelected = Array.from(selected).filter(el => {
            // [CRITICAL DEFENSE] Description pin markers must NEVER be copied to clipboard as canvas objects.
            // Pins are tied to metadata.description and managed exclusively via the Description sidebar.
            if (el.classList.contains('pin-marker') || (el.id && el.id.startsWith('v4-pin-'))) {
                return false;
            }
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
                .filter(c => c && c !== 'selected' && c !== 'dragging-now' && c !== 'lf-in-group')
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
            clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger, .pin-marker, [id^="v4-pin-"]').forEach(h => h.remove());

            const isInsideMobile = !!el.closest('.mobile-content-inner, .mobile-content-area, .mobile-content');
            const isInsidePc = !!el.closest('.pc-content-inner, .pc-content-area');
            let frameContainer = 'root';
            if (typeof window.detectFrameType === 'function') {
                frameContainer = window.detectFrameType(el);
            } else if (isInsideMobile) {
                frameContainer = 'mobile';
            } else if (isInsidePc) {
                frameContainer = 'pc';
            }
            if (frameContainer && frameContainer !== 'root') {
                window.lastActiveFrame = frameContainer;
            }

            // [CRITICAL GATEWAY FIX] Normalize coordinates to host/canvas root
            // If el is grouped inside an lf-group, accumulate ancestor offsets so it won't paste at screen top (0,0)
            const getCoord = (val, offset) => (!isNaN(parseFloat(val)) ? parseFloat(val) : (offset || 0));
            let absL = getCoord(el.style.left, el.offsetLeft);
            let absT = getCoord(el.style.top, el.offsetTop);
            let p = el.parentElement;
            while (p && p !== document.body) {
                if (p.classList && (p.classList.contains('mobile-content-inner') || p.classList.contains('pc-content-inner') ||
                    p.classList.contains('canvas') || p.classList.contains('page') || 
                    p.id === 'canvas-page' || p.id === 'canvas')) {
                    break;
                }
                if (p.classList && (p.classList.contains('lf-group') || p.classList.contains('lf-component'))) {
                    absL += getCoord(p.style.left, p.offsetLeft);
                    absT += getCoord(p.style.top, p.offsetTop);
                }
                p = p.parentElement;
            }

            clipboardData.push({
                html: clone.innerHTML,
                className: cleanClasses,
                styleCssText: el.style.cssText,
                left: absL,
                top: absT,
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

        const affectedGroups = new Set();
        selected.forEach(c => {
            if (c.parentElement && c.parentElement.classList.contains('lf-group')) {
                affectedGroups.add(c.parentElement);
            }
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
        affectedGroups.forEach(g => {
            if (g && g.querySelectorAll('.lf-component').length === 0) {
                g.remove();
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

            // [CRITICAL GATEWAY FIX] Capture currently selected element and active frame BEFORE clearing selection!
            const currentlySelected = document.querySelector('.lf-component.selected');
            const initialSelectedCol = currentlySelected ? currentlySelected.closest('.frame-column') : null;
            const initialSelectedFrameType = (currentlySelected && typeof window.detectFrameType === 'function')
                ? window.detectFrameType(currentlySelected)
                : null;

            document.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
            
            // Responsive Screen Detection: PC/Mobile, Dual Mobile, Canvas
            const pcCol = document.querySelector('.pc-column');
            const mobileLeftCol = document.querySelector('.mobile-column-left');
            const mobileRightCol = document.querySelector('.mobile-column-right');
            const mobileCols = document.querySelectorAll('.mobile-column');
            const pcInner = document.querySelector('.pc-content-inner');
            const mobileInners = document.querySelectorAll('.mobile-content-inner');
            const isDualMobile = !!(mobileLeftCol || mobileRightCol || mobileCols.length > 1);
            const isResponsiveTemplate = !!(pcInner || mobileInners.length > 0);

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

            // 1. Source frame and multi-frame environment detection
            const sourceFrame = componentItems[0] ? (componentItems[0].frameContainer || 'root') : 'root';
            const isMultiFrame = !!((pcCol && (mobileLeftCol || mobileRightCol || mobileCols.length > 0)) || (mobileCols.length > 1));

            // 2. Target frame routing & host element resolution
            let targetFrame = 'root';
            let targetHost = document.body;
            let targetCol = null;
            let baseLeft = 0;
            let baseTop = 0;
            let visibleW = 360;

            if (isResponsiveTemplate) {
                // Determine target column and frame type with robust multi-tiered fallback
                if (initialSelectedCol) {
                    targetCol = initialSelectedCol;
                    targetFrame = initialSelectedFrameType || (typeof window.detectFrameType === 'function' ? window.detectFrameType(initialSelectedCol) : 'mobile');
                } else if (document.querySelector('.frame-column.active-column')) {
                    targetCol = document.querySelector('.frame-column.active-column');
                    targetFrame = typeof window.detectFrameType === 'function' ? window.detectFrameType(targetCol) : 'mobile';
                } else if (window.lastActiveFrame) {
                    targetFrame = window.lastActiveFrame;
                    if (targetFrame === 'left' && mobileLeftCol) targetCol = mobileLeftCol;
                    else if (targetFrame === 'right' && mobileRightCol) targetCol = mobileRightCol;
                    else if (targetFrame === 'pc' && pcCol) targetCol = pcCol;
                    else if (targetFrame === 'mobile') targetCol = mobileLeftCol || mobileCols[0] || null;
                } else {
                    // Fallback based on clipboard original frameContainer
                    const origFrame = componentItems[0] ? componentItems[0].frameContainer : 'left';
                    if (origFrame === 'right' && mobileRightCol) {
                        targetCol = mobileRightCol;
                        targetFrame = 'right';
                    } else if (origFrame === 'pc' && pcCol) {
                        targetCol = pcCol;
                        targetFrame = 'pc';
                    } else if (origFrame === 'canvas') {
                        targetFrame = 'canvas';
                    } else {
                        targetCol = mobileLeftCol || mobileCols[0] || pcCol || null;
                        targetFrame = targetCol ? (typeof window.detectFrameType === 'function' ? window.detectFrameType(targetCol) : 'left') : 'left';
                    }
                }

                if (targetFrame === 'canvas') {
                    targetHost = document.querySelector('.mobile-compare-page, .page, .canvas, #canvas-page, #canvas') || document.body;
                } else {
                    if (!targetCol) {
                        if (targetFrame === 'right' && mobileRightCol) targetCol = mobileRightCol;
                        else if (pcCol && (targetFrame === 'pc' || !isDualMobile)) targetCol = pcCol;
                        else targetCol = mobileLeftCol || mobileCols[0] || null;
                    }

                    if (targetCol) {
                        const colInner = targetCol.querySelector('.mobile-content-inner, .pc-content-inner');
                        targetHost = colInner || targetCol;
                        window.lastActiveFrame = targetFrame || (typeof window.detectFrameType === 'function' ? window.detectFrameType(targetCol) : 'left');
                        if (typeof window.updateActiveFrameUI === 'function') {
                            window.updateActiveFrameUI(targetCol);
                        }
                    } else {
                        targetHost = (mobileInners && mobileInners[0]) || pcInner || document.body;
                    }
                }
            } else {
                targetHost = document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body;
                targetFrame = 'root';
            }

            // 3. Determine whether paste is within the same frame or moving across frames
            const isSameFrame = (!isMultiFrame) || (sourceFrame === targetFrame) || (sourceFrame === 'root' && targetFrame === 'canvas') || (sourceFrame === 'canvas' && targetFrame === 'canvas');

            if (isSameFrame) {
                // [Condition 1] Same Frame Paste: place at bottom-right (+offset) of original position
                baseLeft = minLeft + offset;
                baseTop = minTop + offset;

                // Boundary clamping
                if (isResponsiveTemplate && targetCol) {
                    const isColMobile = targetCol.classList.contains('mobile-column') || (!targetCol.classList.contains('pc-column'));
                    const colW = targetHost.offsetWidth || (isColMobile ? 360 : 1160);
                    visibleW = colW;
                    baseLeft = Math.max(10, Math.min(baseLeft, colW - groupW - 10));
                    baseTop = Math.max(10, baseTop);
                } else {
                    const maxW = Math.max(1600, document.body.scrollWidth || 0, document.documentElement.scrollWidth || 0);
                    const maxH = Math.max(900, document.body.scrollHeight || 0, document.documentElement.scrollHeight || 0);
                    baseLeft = Math.max(15, Math.min(baseLeft, maxW - groupW - 15));
                    baseTop = Math.max(15, Math.min(baseTop, maxH - groupH - 15));
                }
            } else {
                // [Condition 2] Cross-Frame Paste: place at center of target frame viewport
                if (targetFrame === 'canvas') {
                    baseLeft = Math.max(15, Math.round((1600 - groupW) / 2));
                    baseTop = Math.max(15, Math.round((900 - groupH) / 2));
                } else if (targetCol) {
                    const colScroll = targetCol.querySelector('.mobile-content-area, .mobile-content, .pc-content-area');
                    const scrollTop = colScroll ? colScroll.scrollTop : 0;
                    const visibleH = colScroll ? (colScroll.clientHeight || 810) : 810;
                    const isColMobile = targetCol.classList.contains('mobile-column') || (!targetCol.classList.contains('pc-column'));
                    const colW = targetHost.offsetWidth || (isColMobile ? 360 : 1160);
                    visibleW = colW;

                    baseLeft = Math.max(10, Math.round((colW - groupW) / 2));
                    baseTop = Math.max(15, Math.round(scrollTop + (visibleH / 2) - (groupH / 2)));
                } else {
                    baseLeft = Math.max(10, Math.round((360 - groupW) / 2));
                    baseTop = Math.max(15, Math.round((810 - groupH) / 2));
                }
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

            const trailingRef = Array.from(pasteHost.children).find(c => !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script' || c.classList.contains('v4-responsive-guide-layer')));

            componentItems.forEach((item, idx) => {
                // [CRITICAL DEFENSE] Ignore any pin marker items from clipboard
                if (item.isPinMarker || (item.className && item.className.includes('pin-marker')) || (item.attributes && item.attributes.id && item.attributes.id.startsWith('v4-pin-'))) {
                    return;
                }

                const v = document.createElement('div');
                const randSuffix = Math.floor(Math.random() * 1000000) + '_' + idx;
                const newId = 'v4-comp-' + nowStamp + '_' + randSuffix;
                v.id = newId;
                v.className = item.className + ' selected';
                v.style.cssText = item.styleCssText;

                // Rebase z-index to ensure it sits on top of all existing components while keeping relative order
                const originalZ = copiedZs[idx] !== undefined ? copiedZs[idx] : 1000;
                const relOffsetZ = Math.max(0, originalZ - minCopiedZ);
                const assignedZ = baseTopZ + relOffsetZ;
                v.style.zIndex = String(assignedZ);

                const relX = (typeof item.left === 'number' ? item.left : (parseFloat(item.left) || 0)) - minLeft;
                const relY = (typeof item.top === 'number' ? item.top : (parseFloat(item.top) || 0)) - minTop;
                let posX = baseLeft + relX;
                let posY = baseTop + relY;

                if (isResponsiveTemplate) {
                    if (targetFrame === 'mobile' || targetFrame === 'left' || targetFrame === 'right') {
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
                v.querySelectorAll('.pin-marker, [id^="v4-pin-"]').forEach(child => child.remove());

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

})();
`;