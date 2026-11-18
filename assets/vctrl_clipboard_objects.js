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

    function dispatchToParent(data) {
        if (window.EditorBus && typeof window.EditorBus.sendToParent === 'function') {
            window.EditorBus.sendToParent(data);
        } else if (typeof window.notifyParent === 'function') {
            window.notifyParent(data);
        } else if (window.parent && window.parent !== window) {
            window.parent.postMessage(data, '*');
        }
    }
    const notifyParent = dispatchToParent;

    function clearSystemImageClipboard() {
        let cleared = false;
        try {
            const onCopy = function(e) {
                if (e && e.clipboardData) {
                    e.clipboardData.setData('text/plain', '');
                    e.preventDefault();
                    cleared = true;
                }
            };
            document.addEventListener('copy', onCopy, true);
            document.execCommand('copy');
            document.removeEventListener('copy', onCopy, true);
        } catch (err) {}
        if (!cleared && navigator.clipboard && typeof navigator.clipboard.writeText === 'function' && window.isSecureContext) {
            try {
                navigator.clipboard.writeText('').catch(function() {});
            } catch (err) {}
        }
        return cleared;
    }

    window.copySelectedObjects = () => {
        const selected = document.querySelectorAll('.bychoi-component.selected');
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
                if (parent.classList.contains('bychoi-component') && parent.classList.contains('selected')) {
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
                .filter(c => c && c !== 'selected' && c !== 'dragging-now' && c !== 'bychoi-in-group' && c !== 'v4-cropping-active')
                .join(' ');

            const attrs = {};
            Array.from(el.attributes).forEach(attr => {
                const name = attr.name;
                if (name === 'data-source-id' || name === 'data-target-id' || name === 'data-locked') return;
                if (name.startsWith('data-') || name === 'id') {
                    attrs[name] = attr.value;
                }
            });

            if (el.classList.contains('bychoi-group')) {
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
            clone.querySelectorAll('.bychoi-resizer, .bychoi-drag-handle, .bychoi-delete-trigger, .pin-marker, [id^="v4-pin-"]').forEach(h => h.remove());

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
            // If el is grouped inside an bychoi-group, accumulate ancestor offsets so it won't paste at screen top (0,0)
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
                if (p.classList && (p.classList.contains('bychoi-group') || p.classList.contains('bychoi-component'))) {
                    absL += getCoord(p.style.left, p.offsetLeft);
                    absT += getCoord(p.style.top, p.offsetTop);
                }
                p = p.parentElement;
            }

            let curScreenName = '';
            try {
                curScreenName = (window.parent && window.parent.state && window.parent.state.activeFile && window.parent.state.activeFile.name) || '';
            } catch (e) {}

            clipboardData.push({
                html: clone.innerHTML,
                className: cleanClasses,
                styleCssText: el.style.cssText,
                left: absL,
                top: absT,
                width: parseFloat(el.style.width) || el.offsetWidth || 120,
                height: parseFloat(el.style.height) || el.offsetHeight || 30,
                frameContainer: frameContainer,
                sourceScreen: curScreenName,
                inDimmedOverlay: !!(el.closest && el.closest('.v4-dimmed-overlay-layer')),
                isGroup: el.classList.contains('bychoi-group'),
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

        const clearedSysClip = clearSystemImageClipboard();
        v4Clipboard = clipboardData;
        notifyParent({
            type: 'BYCHOI_SAVE_CLIPBOARD',
            clipboard: clipboardData,
            isExplicitCopy: true,
            clearedSystemClipboard: clearedSysClip
        });
        console.log("[Clipboard Debug] Copied " + clipboardData.length + " item(s). Notifying parent with BYCHOI_SAVE_CLIPBOARD.");
    };

    window.cutSelectedObjects = () => {
        const selected = document.querySelectorAll('.bychoi-component.selected');
        const selectedConnIds = (window.parent && window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.getSelectedIds === 'function')
            ? window.parent.ConnectorEngine.getSelectedIds()
            : [];
        console.log("[Clipboard Debug] cutSelectedObjects running. Selected elements:", selected.length, "connectors:", selectedConnIds.length);
        if (selected.length === 0 && selectedConnIds.length === 0) return;

        window.copySelectedObjects();

        if (Array.isArray(v4Clipboard)) {
            v4Clipboard.forEach(item => item.isCut = true);
        }
        if (window.top && Array.isArray(window.top.__bychoi_global_clipboard__)) {
            window.top.__bychoi_global_clipboard__.forEach(item => item.isCut = true);
        }
        notifyParent({
            type: 'BYCHOI_SAVE_CLIPBOARD',
            clipboard: v4Clipboard
        });

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        const affectedGroups = new Set();
        selected.forEach(c => {
            if (c.getAttribute('data-locked') === 'true') return;
            if (c.parentElement && c.parentElement.classList.contains('bychoi-group')) {
                affectedGroups.add(c.parentElement);
            }
            if (c.classList.contains('connector-line')) {
                notifyParent({ type: 'BYCHOI_DELETE_CONNECTOR', id: c.id });
            } else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                let idx = parseInt(c.getAttribute('data-index'));
                if (isNaN(idx)) {
                    idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-', ''));
                }
                notifyParent({ type: 'BYCHOI_DELETE_PIN', index: idx });
                c.remove();
            } else {
                c.remove();
            }
        });
        affectedGroups.forEach(g => {
            if (g && g.querySelectorAll('.bychoi-component').length === 0) {
                g.remove();
            }
        });

        if (selectedConnIds.length > 0) {
            selectedConnIds.forEach(id => {
                notifyParent({ type: 'BYCHOI_DELETE_CONNECTOR', id: id });
            });
        }

        if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
            try { window.SelectionAdorner.clear(); } catch(adErr) {}
        }

        notifyParent({ type: 'BYCHOI_DESELECT' });
        if (window.V4DimmedLayer && typeof window.V4DimmedLayer.syncStateToParent === 'function') {
            window.V4DimmedLayer.syncStateToParent();
        }
        markDirty();
        console.log("[Clipboard Debug] Cut operation complete.");
    };

    function _computeCopiedBoundingBox(componentItems) {
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
        return {
            minLeft: minLeft,
            minTop: minTop,
            groupW: Math.max(10, maxRight - minLeft),
            groupH: Math.max(10, maxBottom - minTop)
        };
    }

    function _resolvePasteFrameAndPosition(componentItems, box, offset, isCutOperation, initialSelInfo) {
        const pcCol = document.querySelector('.pc-column');
        const mobileLeftCol = document.querySelector('.mobile-column-left');
        const mobileRightCol = document.querySelector('.mobile-column-right');
        const mobileCols = document.querySelectorAll('.mobile-column');
        const pcInner = document.querySelector('.pc-content-inner');
        const mobileInners = document.querySelectorAll('.mobile-content-inner');
        const isDualMobile = !!(mobileLeftCol || mobileRightCol || mobileCols.length > 1);
        const isResponsiveTemplate = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.isResponsive === 'function')
            ? window.ResponsiveFrameUtils.isResponsive(document)
            : !!(pcInner || mobileInners.length > 0);

        const sourceFrame = componentItems[0] ? (componentItems[0].frameContainer || 'root') : 'root';
        const isMultiFrame = !!((pcCol && (mobileLeftCol || mobileRightCol || mobileCols.length > 0)) || (mobileCols.length > 1));

        let targetFrame = 'root';
        let targetHost = document.body;
        let targetCol = null;
        let baseLeft = 0;
        let baseTop = 0;
        let visibleW = 360;

        if (isResponsiveTemplate) {
            if (initialSelInfo.initialSelectedCol) {
                targetCol = initialSelInfo.initialSelectedCol;
                targetFrame = initialSelInfo.initialSelectedFrameType || (typeof window.detectFrameType === 'function' ? window.detectFrameType(targetCol) : 'mobile');
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

        const isSameFrame = (!isMultiFrame) || (sourceFrame === targetFrame) || (sourceFrame === 'root' && targetFrame === 'canvas') || (sourceFrame === 'canvas' && targetFrame === 'canvas');

        if (isSameFrame) {
            baseLeft = box.minLeft + offset;
            baseTop = box.minTop + offset;
            if (isResponsiveTemplate && targetCol) {
                const isColMobile = targetCol.classList.contains('mobile-column') || (!targetCol.classList.contains('pc-column'));
                const colW = targetHost.offsetWidth || (isColMobile ? 360 : 1160);
                visibleW = colW;
                baseLeft = Math.max(10, Math.min(baseLeft, colW - box.groupW - 10));
                baseTop = Math.max(10, baseTop);
            } else {
                const maxW = Math.max(1600, document.body.scrollWidth || 0, document.documentElement.scrollWidth || 0);
                const maxH = Math.max(900, document.body.scrollHeight || 0, document.documentElement.scrollHeight || 0);
                baseLeft = Math.max(15, Math.min(baseLeft, maxW - box.groupW - 15));
                baseTop = Math.max(15, Math.min(baseTop, maxH - box.groupH - 15));
            }
        } else {
            if (targetFrame === 'canvas') {
                baseLeft = Math.max(15, Math.round((1600 - box.groupW) / 2));
                baseTop = Math.max(15, Math.round((900 - box.groupH) / 2));
            } else if (targetCol) {
                const colScroll = targetCol.querySelector('.mobile-content-area, .mobile-content, .pc-content-area');
                const scrollTop = colScroll ? colScroll.scrollTop : 0;
                const visibleH = colScroll ? (colScroll.clientHeight || 810) : 810;
                const isColMobile = targetCol.classList.contains('mobile-column') || (!targetCol.classList.contains('pc-column'));
                const colW = targetHost.offsetWidth || (isColMobile ? 360 : 1160);
                visibleW = colW;
                baseLeft = Math.max(10, Math.round((colW - box.groupW) / 2));
                baseTop = Math.max(15, Math.round(scrollTop + (visibleH / 2) - (box.groupH / 2)));
            } else {
                baseLeft = Math.max(10, Math.round((360 - box.groupW) / 2));
                baseTop = Math.max(15, Math.round((810 - box.groupH) / 2));
            }
        }

        const rawPasteHost = isResponsiveTemplate ? targetHost : (document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body);
        const pasteHost = (window.V4DimmedLayer && typeof window.V4DimmedLayer.resolveActiveMountHost === 'function')
            ? window.V4DimmedLayer.resolveActiveMountHost(rawPasteHost)
            : rawPasteHost;
        const targetInDimmed = !!(pasteHost && pasteHost.classList && pasteHost.classList.contains('v4-dimmed-overlay-layer'));

        let curPasteScreen = '';
        try {
            curPasteScreen = (window.parent && window.parent.state && window.parent.state.activeFile && window.parent.state.activeFile.name) || '';
        } catch (e) {}
        const srcScreen = componentItems[0] ? (componentItems[0].sourceScreen || '') : '';
        const srcInDimmed = componentItems[0] ? !!componentItems[0].inDimmedOverlay : false;
        const isCrossLayerOrScreen = (srcScreen && curPasteScreen && srcScreen !== curPasteScreen) || (srcInDimmed !== targetInDimmed);
        if (isSameFrame && isCrossLayerOrScreen && !isCutOperation) {
            baseLeft = box.minLeft;
            baseTop = box.minTop;
            if (isResponsiveTemplate && targetCol) {
                const colScroll = targetCol.querySelector('.mobile-content-area, .mobile-content, .pc-content-area');
                const scrollTop = colScroll ? colScroll.scrollTop : 0;
                const visibleH = colScroll ? (colScroll.clientHeight || 810) : 810;
                if ((baseTop + box.groupH) < scrollTop || baseTop > (scrollTop + visibleH - 20)) {
                    baseTop = Math.max(15, Math.round(scrollTop + (visibleH / 2) - (box.groupH / 2)));
                }
            }
        }

        return {
            isResponsiveTemplate: isResponsiveTemplate,
            targetFrame: targetFrame,
            pasteHost: pasteHost,
            visibleW: visibleW,
            baseLeft: baseLeft,
            baseTop: baseTop,
            minLeft: box.minLeft,
            minTop: box.minTop
        };
    }

    function _getHostTopZForPaste(container, isFixed) {
        if (typeof window.getNextTopZIndex === 'function') {
            return window.getNextTopZIndex(container, isFixed);
        }
        const tiers = window.V4_Z_TIERS || { CONTENT_MIN: 1000, CONTENT_MAX: 69999, FIXED_HUD_MIN: 100000, FIXED_HUD_MAX: 179999 };
        let maxZ = isFixed ? tiers.FIXED_HUD_MIN : tiers.CONTENT_MIN;
        const comps = (container && container.querySelectorAll) ? container.querySelectorAll('.bychoi-component') : (document.querySelectorAll ? document.querySelectorAll('.bychoi-component') : []);
        comps.forEach(c => {
            if (c.parentElement && c.parentElement.classList && c.parentElement.classList.contains('bychoi-group')) return;
            if (c.classList && c.classList.contains('bychoi-in-group')) return;
            if (c.classList.contains('pin-marker') || c.classList.contains('text-marker')) return;
            let z = parseInt(c.style.zIndex, 10);
            if (isNaN(z)) {
                const compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                z = isNaN(compZ) ? tiers.CONTENT_MIN : compZ;
            }
            const cIsFixed = c.hasAttribute('data-scroll-fixed');
            if (isFixed) {
                if (cIsFixed && z > maxZ) maxZ = z;
            } else {
                if (cIsFixed) return;
                if (z > maxZ) maxZ = z;
            }
        });
        if (!isFixed && maxZ >= 69000) {
            if (typeof window.normalizeZIndices === 'function') window.normalizeZIndices(container, true);
            const topNormalComps = Array.from(container.children || []).filter(c => c.classList && c.classList.contains('bychoi-component') && !c.classList.contains('pin-marker') && !c.classList.contains('text-marker') && !c.hasAttribute('data-scroll-fixed'));
            return tiers.CONTENT_MIN + (topNormalComps.length * 10);
        }
        return maxZ + 10;
    }

    function _buildPasteZRankContext(componentItems, pasteHost) {
        const copiedZs = componentItems.map(item => {
            const match = (item.styleCssText || '').match(/z-index\\s*:\\s*(\\d+)/i);
            return match ? parseInt(match[1], 10) : 1000;
        });
        const sortedRankOrder = copiedZs.map((z, i) => ({ z, i })).sort((a, b) => (a.z !== b.z ? a.z - b.z : a.i - b.i));
        const rankOffsetMap = {};
        sortedRankOrder.forEach((entry, rankIdx) => {
            rankOffsetMap[entry.i] = rankIdx * 10;
        });
        const baseTopNormalZ = _getHostTopZForPaste(pasteHost, false);
        const baseTopFixedZ = _getHostTopZForPaste(pasteHost, true);
        const trailingRef = Array.from(pasteHost.children).find(c => (c.classList && (c.classList.contains('v4-dimmed-overlay-layer') || c.classList.contains('v4-pin-layer') || c.classList.contains('v4-selection-adorner-layer'))) || (!c.classList.contains('bychoi-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script' || c.classList.contains('v4-responsive-guide-layer'))));

        return {
            rankOffsetMap: rankOffsetMap,
            baseTopNormalZ: baseTopNormalZ,
            baseTopFixedZ: baseTopFixedZ,
            trailingRef: trailingRef
        };
    }

    function _mountPastedComponentNodes(componentItems, posCtx, rankCtx, nowStamp) {
        const newSelectedIds = [];
        const selectedIdsIsGroupMap = {};
        const idMap = {};

        componentItems.forEach((item, idx) => {
            if (item.isPinMarker || (item.className && item.className.includes('pin-marker')) || (item.attributes && item.attributes.id && item.attributes.id.startsWith('v4-pin-'))) {
                return;
            }

            const v = document.createElement('div');
            const randSuffix = Math.floor(Math.random() * 1000000) + '_' + idx;
            const newId = 'v4-comp-' + nowStamp + '_' + randSuffix;
            v.id = newId;
            v.className = item.className + ' selected';
            v.style.cssText = item.styleCssText;

            const itemIsFixed = !!(item.attributes && item.attributes['data-scroll-fixed']);
            const baseTopZ = itemIsFixed ? rankCtx.baseTopFixedZ : rankCtx.baseTopNormalZ;
            const relOffsetZ = rankCtx.rankOffsetMap[idx] || 0;
            const maxCap = itemIsFixed ? 179900 : 69900;
            v.style.zIndex = String(Math.min(maxCap, baseTopZ + relOffsetZ));

            const relX = (typeof item.left === 'number' ? item.left : (parseFloat(item.left) || 0)) - posCtx.minLeft;
            const relY = (typeof item.top === 'number' ? item.top : (parseFloat(item.top) || 0)) - posCtx.minTop;
            let posX = posCtx.baseLeft + relX;
            const posY = posCtx.baseTop + relY;

            if (posCtx.isResponsiveTemplate && (posCtx.targetFrame === 'mobile' || posCtx.targetFrame === 'left' || posCtx.targetFrame === 'right')) {
                const curW = parseFloat(v.style.width) || (typeof item.width === 'number' ? item.width : parseFloat(item.width)) || 0;
                if (curW && curW > 340) {
                    v.style.width = '340px';
                    if (componentItems.length === 1) {
                        posX = Math.max(10, Math.round((posCtx.visibleW - 340) / 2));
                    }
                }
            }
            v.style.left = posX + 'px';
            v.style.top = posY + 'px';

            if (rankCtx.trailingRef && rankCtx.trailingRef.parentNode === posCtx.pasteHost) {
                posCtx.pasteHost.insertBefore(v, rankCtx.trailingRef);
            } else {
                posCtx.pasteHost.appendChild(v);
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

            v.querySelectorAll('[id]').forEach((child, cIdx) => {
                const oldId = child.id;
                const prefix = (child.classList.contains('pin-marker') || oldId.startsWith('v4-pin-')) ? 'v4-pin-' : 'v4-comp-';
                const newChildId = prefix + nowStamp + '_' + Math.floor(Math.random() * 1000000) + '_' + cIdx;
                child.id = newChildId;
                idMap[oldId] = newChildId;
            });

            if (item.isGroup) {
                const rawChildren = v.getAttribute('data-children');
                if (rawChildren) {
                    try {
                        const childIds = JSON.parse(rawChildren);
                        v.setAttribute('data-children', JSON.stringify(childIds.map(oldId => idMap[oldId] || oldId)));
                    } catch (e) {
                        console.warn("[Clipboard] Failed to remap data-children inside cloned group:", e);
                    }
                }
            }

            v.querySelectorAll('.bychoi-component').forEach(child => child.classList.remove('selected'));
            v.querySelectorAll('.bychoi-resizer, .bychoi-drag-handle, .bychoi-delete-trigger').forEach(el => el.remove());

            newSelectedIds.push(newId);
        });

        return {
            newSelectedIds: newSelectedIds,
            selectedIdsIsGroupMap: selectedIdsIsGroupMap,
            idMap: idMap
        };
    }

    function _mountPastedConnectors(connectorItems, idMap, offset, nowStamp, newSelectedIds) {
        if (connectorItems.length === 0 || !window.parent || !window.parent.state) return;
        if (!Array.isArray(window.parent.state.connectors)) {
            window.parent.state.connectors = [];
        }
        const pastedConnIds = [];
        connectorItems.forEach((cItem, cIdx) => {
            const newConnId = 'conn_' + nowStamp + '_' + Math.floor(Math.random() * 1000000) + '_' + cIdx;
            const newStart = { ...cItem.start, x: (cItem.start.x || 0) + offset, y: (cItem.start.y || 0) + offset };
            const newEnd = { ...cItem.end, x: (cItem.end.x || 0) + offset, y: (cItem.end.y || 0) + offset };

            if (newStart.targetId && idMap[newStart.targetId]) newStart.targetId = idMap[newStart.targetId];
            else { newStart.targetId = null; newStart.side = null; }

            if (newEnd.targetId && idMap[newEnd.targetId]) newEnd.targetId = idMap[newEnd.targetId];
            else { newEnd.targetId = null; newEnd.side = null; }

            window.parent.state.connectors.push({
                id: newConnId,
                type: cItem.connType || 'straight',
                start: newStart,
                end: newEnd,
                style: cItem.style ? { ...cItem.style } : { stroke: '#475569', strokeWidth: 1.6 }
            });
            pastedConnIds.push(newConnId);
            newSelectedIds.push(newConnId);
        });

        if (window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.redrawAll === 'function') {
            window.parent.ConnectorEngine.redrawAll();
        }
        if (window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.setSelectedIds === 'function') {
            window.parent.ConnectorEngine.setSelectedIds(pastedConnIds);
        }
        notifyParent({ type: 'BYCHOI_SYNC_CONNECTORS', connectors: window.parent.state.connectors });
    }

    function _finalizePasteSelectionAndSync(clipboardData, newSelectedIds, selectedIdsIsGroupMap) {
        if (typeof window.enforceDesignSystem === 'function') {
            try { window.enforceDesignSystem(); } catch (dsErr) { console.warn("[Clipboard] enforceDesignSystem error:", dsErr); }
        } else if (typeof window.initHandles === 'function') {
            try { window.initHandles(); } catch (ihErr) { console.warn("[Clipboard] initHandles error:", ihErr); }
        }

        const hasPin = clipboardData.some(item => item.isPinMarker || item.isTextMarker);
        if (hasPin && typeof window.reorderAllPins === 'function') {
            try { window.reorderAllPins(); } catch (pinErr) { console.warn("[Clipboard] reorderAllPins error:", pinErr); }
        }

        if (newSelectedIds.length > 0) {
            const firstNewEl = document.getElementById(newSelectedIds[0]);
            if (firstNewEl) {
                window.activeEl = firstNewEl;
                if (typeof window.updateHandles === 'function') {
                    try { window.updateHandles(firstNewEl); } catch (uhErr) {}
                }
            }
            const firstStyles = (firstNewEl && typeof window._getCompStyles === 'function') ? window._getCompStyles(firstNewEl) : {};
            if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
                try {
                    newSelectedIds.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) window.SelectionAdorner.update(el);
                    });
                } catch (adErr) {}
            }
            notifyParent({
                type: "BYCHOI_PASTE_COMPLETED",
                ids: newSelectedIds,
                selectedIdsIsGroupMap: selectedIdsIsGroupMap,
                firstCompStyles: firstStyles
            });
        }
        if (window.V4DimmedLayer && typeof window.V4DimmedLayer.syncStateToParent === 'function') {
            window.V4DimmedLayer.syncStateToParent();
        }
        if (typeof window.markDirty === 'function') window.markDirty();
        else if (typeof markDirty === 'function') markDirty();
        else notifyParent({ type: 'BYCHOI_DIRTY' });

        try { window.focus(); } catch (e) {}
    }

    window.pasteCopiedObjectsFromData = (clipboardData) => {
        console.log("[Clipboard Debug] pasteCopiedObjectsFromData running. Items to paste:", clipboardData ? clipboardData.length : 0);
        if (!clipboardData || clipboardData.length === 0) {
            console.log("[Clipboard Debug] Clipboard is empty.");
            return;
        }

        try {
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const currentlySelected = document.querySelector('.bychoi-component.selected');
            const initialSelInfo = {
                initialSelectedCol: currentlySelected ? currentlySelected.closest('.frame-column') : null,
                initialSelectedFrameType: (currentlySelected && typeof window.detectFrameType === 'function')
                    ? window.detectFrameType(currentlySelected)
                    : null
            };

            document.querySelectorAll('.bychoi-component').forEach(el => el.classList.remove('selected'));

            const isCutOperation = clipboardData.some(item => item.isCut === true);
            const offset = isCutOperation ? 0 : 15;

            clipboardData.forEach(item => { item.isCut = false; });
            if (Array.isArray(v4Clipboard)) v4Clipboard.forEach(item => { item.isCut = false; });
            if (window.top && Array.isArray(window.top.__bychoi_global_clipboard__)) {
                window.top.__bychoi_global_clipboard__.forEach(item => { item.isCut = false; });
            }
            notifyParent({ type: 'BYCHOI_SAVE_CLIPBOARD', clipboard: clipboardData });

            const nowStamp = Date.now();
            const componentItems = clipboardData.filter(item => !item.isConnector);
            const connectorItems = clipboardData.filter(item => item.isConnector);

            const box = _computeCopiedBoundingBox(componentItems);
            const posCtx = _resolvePasteFrameAndPosition(componentItems, box, offset, isCutOperation, initialSelInfo);
            const rankCtx = _buildPasteZRankContext(componentItems, posCtx.pasteHost);
            const mountRes = _mountPastedComponentNodes(componentItems, posCtx, rankCtx, nowStamp);

            _mountPastedConnectors(connectorItems, mountRes.idMap, offset, nowStamp, mountRes.newSelectedIds);
            _finalizePasteSelectionAndSync(clipboardData, mountRes.newSelectedIds, mountRes.selectedIdsIsGroupMap);

            console.log("[Clipboard Debug] Pasted " + clipboardData.length + " item(s) successfully.");
        } catch (err) {
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
        console.log("[Clipboard Debug] pasteCopiedObjects calling BYCHOI_REQUEST_CLIPBOARD to parent.");
        notifyParent({ type: 'BYCHOI_REQUEST_CLIPBOARD' });
    };

})();
`;