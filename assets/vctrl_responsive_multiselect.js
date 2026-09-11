/**
 * assets/vctrl_responsive_multiselect.js
 * 
 * Dedicated Multi-Selection (Marquee) Coordinate Normalizer for Responsive PC & Mobile Screens.
 * - Resolves the coordinate space mismatch caused by nested scroll containers (.pc-content-inner, .mobile-content-inner).
 * - Intercepts LF_MARQUEE_START to recalculate targets with accurate viewport bounding rectangles.
 * - Strictly isolated: 0% side-effect or interference on non-responsive standard templates.
 */

window.v4ResponsiveMultiselectScript = `
(function() {
    console.log("%c [RESPONSIVE MULTISELECT] Dedicated Module Initialized ", "background: #6366f1; color: #ffffff; font-weight: bold; padding: 4px; border-radius: 4px;");

    function isResponsiveScreen() {
        return !!(document.querySelector('.pc-browser-frame, .mobile-browser-frame, .pc-content-inner, .mobile-content-inner'));
    }

    function recalculateTargetsForResponsive() {
        const correctedTargets = [];
        const components = document.querySelectorAll('.lf-component:not(.connector-line)');
        
        components.forEach(function(c) {
            if (!c || !c.getBoundingClientRect) return;
            const rect = c.getBoundingClientRect();
            let isChild = false;
            let parent = c.parentElement;
            while (parent && parent !== document.body) {
                if (parent.classList && (parent.classList.contains('lf-component') || parent.classList.contains('lf-group'))) {
                    isChild = true;
                    break;
                }
                parent = parent.parentElement;
            }

            correctedTargets.push({
                id: c.id,
                x: rect.left,
                y: rect.top,
                w: rect.width,
                h: rect.height,
                isGroupChild: isChild
            });
        });

        return correctedTargets;
    }

    function attachInterceptor() {
        if (typeof window.notifyParent === 'function' && !window._responsiveMarqueeInterceptorAttached) {
            window._responsiveMarqueeInterceptorAttached = true;
            const originalNotifyParent = window.notifyParent;
            window.notifyParent = function(data) {
                if (data && data.type === 'LF_MARQUEE_START' && isResponsiveScreen()) {
                    try {
                        const targets = recalculateTargetsForResponsive();
                        if (targets && targets.length > 0) {
                            data.targets = targets;
                        }
                    } catch (err) {
                        console.warn("[ResponsiveMultiselect] Recalculate error:", err);
                    }
                }
                return originalNotifyParent.apply(this, arguments);
            };
        }
    }

    // Attach immediately and ensure on DOM ready
    attachInterceptor();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachInterceptor);
    }

    // --- Registered Modular Message Handlers for Multi-Selection & Grouping ---
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_MARQUEE_SELECTION'] = function(d) {
        const ids = d.ids || [];
        document.querySelectorAll('.lf-component').forEach(x => {
            x.classList.toggle('selected', ids.includes(x.id));
        });
        if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
            window.SelectionAdorner.update();
        }
        if (ids.length > 1 && typeof window.getHomogeneousSelectionInfo === 'function' && typeof window.notifyParent === 'function') {
            const homoInfo = window.getHomogeneousSelectionInfo();
            if (homoInfo && homoInfo.isMultiSame) {
                window.notifyParent({
                    type: 'LF_MULTI_SELECTION_STYLES',
                    isMultiSameType: true,
                    commonType: homoInfo.commonType,
                    selectedCount: homoInfo.count,
                    selectedIds: homoInfo.ids,
                    ...(homoInfo.primaryStyles || {})
                });
            }
        }
    };

    window.v4MessageHandlers['LF_ALIGN_SELECTED'] = function(d) {
        const ids = d.ids || [];
                    const alignType = d.alignType || d.type;
                    if (ids.length < 1) return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
        
                    const doc = document;
                    const items = [];
                    const allHandles = doc.querySelectorAll('.lf-drag-handle, .lf-resizer, .lf-delete-trigger');
                    const handleStates = Array.from(allHandles).map(h => h.style.display);
                    allHandles.forEach(h => h.style.display = 'none');
        
                    const validIds = ids.filter(id => {
                        const el = doc.getElementById(id);
                        if (!el) return false;
                        
                        let parent = el.parentElement;
                        while (parent && parent !== doc.body) {
                            if (parent.classList.contains('lf-group') && ids.includes(parent.id)) return false;
                            parent = parent.parentElement;
                        }
                        return true;
                    });
        
                    validIds.forEach(id => {
                        const isMarker = id.startsWith('v4-pin-');
                        const isConnector = id.startsWith('conn_');
                        const el = doc.getElementById(id);
                        if (el) {
                            if (isConnector) {
                                const conn = (window.parent && window.parent.state && window.parent.state.connectors) 
                                    ? window.parent.state.connectors.find(c => c.id === id) 
                                    : null;
                                if (conn) {
                                    const absL = Math.min(conn.start.x, conn.end.x);
                                    const absT = Math.min(conn.start.y, conn.end.y);
                                    const w = Math.abs(conn.end.x - conn.start.x);
                                    const h = Math.abs(conn.end.y - conn.start.y);
                                    items.push({ id, type: 'connector', el, x: absL, y: absT, w, h, conn });
                                }
                            } else {
                                let absL = parseFloat(el.style.left) || 0;
                                let absT = parseFloat(el.style.top) || 0;
                                
                                let parent = el.parentElement;
                                while (parent && parent !== doc.body) {
                                    if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                                        absL += parseFloat(parent.style.left) || 0;
                                        absT += parseFloat(parent.style.top) || 0;
                                    }
                                    parent = parent.parentElement;
                                }
        
                                const w = el.offsetWidth;
                                const h = el.offsetHeight;
                                items.push({ id, type: isMarker ? 'marker' : 'comp', el, x: absL, y: absT, w, h });
                            }
                        }
                    });
        
                    allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                    if (items.length < 1) return;
        
                    // Single Object Alignment: Align to Screen Canvas (1600x900) or Responsive Frame (PC 1160px / Mobile 360px)
                    if (items.length === 1) {
                        const item = items[0];
                        const el = item.el;
                        const isResponsiveTemplate = !!(doc.querySelector('.pc-content-inner') || doc.querySelector('.mobile-content-inner') || doc.querySelector('.pc-browser-frame'));
                        
                        let boundL = 0;
                        let boundT = 0;
                        let boundW = 1600;
                        let boundH = 900;
        
                        if (isResponsiveTemplate) {
                            const pcInner = doc.querySelector('.pc-content-inner');
                            const mobileInner = doc.querySelector('.mobile-content-inner');
                            const isInsideMobile = !!(el && (el.closest('.mobile-content-inner, .mobile-content-area, .mobile-frame, .mobile-browser-frame, .mobile-column, .mobile-content') || (mobileInner && mobileInner.contains(el))));
                            
                            if (isInsideMobile) {
                                const targetContainer = mobileInner || doc.querySelector('.mobile-content-area, .mobile-content');
                                boundW = targetContainer ? (targetContainer.offsetWidth || 360) : 360;
                                boundH = targetContainer ? (targetContainer.offsetHeight || targetContainer.clientHeight || 810) : 810;
                            } else {
                                const targetContainer = pcInner || doc.querySelector('.pc-content-area');
                                boundW = targetContainer ? (targetContainer.offsetWidth || 1160) : 1160;
                                boundH = targetContainer ? (targetContainer.offsetHeight || targetContainer.clientHeight || 810) : 810;
                            }
                        } else {
                            const pageEl = doc.querySelector('.page') || doc.body;
                            boundW = pageEl ? (pageEl.offsetWidth || 1600) : 1600;
                            boundH = pageEl ? (pageEl.offsetHeight || 900) : 900;
                        }
        
                        let targetL = item.x;
                        let targetT = item.y;
        
                        switch(alignType) {
                            case 'left':   targetL = boundL; break;
                            case 'center': targetL = boundL + Math.round((boundW - item.w) / 2); break;
                            case 'right':  targetL = boundL + (boundW - item.w); break;
                            case 'top':    targetT = boundT; break;
                            case 'middle': targetT = boundT + Math.round((boundH - item.h) / 2); break;
                            case 'bottom': targetT = boundT + (boundH - item.h); break;
                        }
        
                        const dx = targetL - item.x;
                        const dy = targetT - item.y;
        
                        if (dx !== 0 || dy !== 0) {
                            if (item.type === 'connector') {
                                if (item.conn) {
                                    item.conn.start.x += dx;
                                    item.conn.start.y += dy;
                                    item.conn.end.x += dx;
                                    item.conn.end.y += dy;
                                    item.conn.start.targetId = null; item.conn.start.side = null;
                                    item.conn.end.targetId = null; item.conn.end.side = null;
                                    if (window.parent && window.parent.ConnectorEngine) {
                                        window.parent.ConnectorEngine.redrawAll();
                                    }
                                    notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                                }
                            } else {
                                let parentL = 0;
                                let parentT = 0;
                                let parent = item.el.parentElement;
                                while (parent && parent !== doc.body && !parent.classList.contains('pc-content-inner') && !parent.classList.contains('mobile-content-inner')) {
                                    if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                                        parentL += parseFloat(parent.style.left) || 0;
                                        parentT += parseFloat(parent.style.top) || 0;
                                    }
                                    parent = parent.parentElement;
                                }
        
                                item.el.style.left = (targetL - parentL) + 'px';
                                item.el.style.top = (targetT - parentT) + 'px';
        
                                if (item.type === 'marker') {
                                    const idx = parseInt(item.id.replace('v4-pin-', ''));
                                    notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: targetL, y: targetT });
                                }
        
                                if (window.parent && window.parent.ConnectorEngine && typeof window.parent.ConnectorEngine.syncAnchoredPositions === 'function') {
                                    window.parent.ConnectorEngine.syncAnchoredPositions(item.id);
                                }
                            }
                            markDirty();
                        }
                        return;
                    }
        
                    let minX = Math.min(...items.map(i => i.x));
                    let minY = Math.min(...items.map(i => i.y));
                    let maxX = Math.max(...items.map(i => i.x + i.w));
                    let maxY = Math.max(...items.map(i => i.y + i.h));
        
                    let hasConnectorChanges = false;
        
                    if (alignType === 'distribute_h') {
                        if (items.length < 3) {
                            allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                            return;
                        }
                        items.sort((a, b) => a.x - b.x);
                        const sumW = items.reduce((sum, item) => sum + item.w, 0);
                        const spanX = maxX - minX;
                        const gapSize = (spanX - sumW) / (items.length - 1);
                        let currentX = minX;
                        items.forEach(item => {
                            const dx = currentX - item.x;
                            currentX += item.w + gapSize;
                            
                            if (dx === 0) return;
                            const newAbsX = item.x + dx;
        
                            if (item.type === 'connector') {
                                if (item.conn) {
                                    item.conn.start.x += dx;
                                    item.conn.end.x += dx;
                                    item.conn.start.targetId = null; item.conn.start.side = null;
                                    item.conn.end.targetId = null; item.conn.end.side = null;
                                    hasConnectorChanges = true;
                                }
                            } else {
                                let parentL = 0;
                                let parent = item.el.parentElement;
                                while (parent && parent !== doc.body) {
                                    if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                                        parentL += parseFloat(parent.style.left) || 0;
                                    }
                                    parent = parent.parentElement;
                                }
                                item.el.style.left = (newAbsX - parentL) + 'px';
                                if (item.type === 'marker') {
                                    const idx = parseInt(item.id.replace('v4-pin-', ''));
                                    notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: newAbsX, y: item.y });
                                }
                            }
                        });
                        allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                        if (hasConnectorChanges) {
                            if (window.parent && window.parent.ConnectorEngine) {
                                window.parent.ConnectorEngine.redrawAll();
                            }
                            notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                        }
                        markDirty();
                        return;
                    }
        
                    if (alignType === 'distribute_v') {
                        if (items.length < 3) {
                            allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                            return;
                        }
                        items.sort((a, b) => a.y - b.y);
                        const sumH = items.reduce((sum, item) => sum + item.h, 0);
                        const spanY = maxY - minY;
                        const gapSize = (spanY - sumH) / (items.length - 1);
                        let currentY = minY;
                        items.forEach(item => {
                            const dy = currentY - item.y;
                            currentY += item.h + gapSize;
                            
                            if (dy === 0) return;
                            const newAbsY = item.y + dy;
        
                            if (item.type === 'connector') {
                                if (item.conn) {
                                    item.conn.start.y += dy;
                                    item.conn.end.y += dy;
                                    item.conn.start.targetId = null; item.conn.start.side = null;
                                    item.conn.end.targetId = null; item.conn.end.side = null;
                                    hasConnectorChanges = true;
                                }
                            } else {
                                let parentT = 0;
                                let parent = item.el.parentElement;
                                while (parent && parent !== doc.body) {
                                    if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                                        parentT += parseFloat(parent.style.top) || 0;
                                    }
                                    parent = parent.parentElement;
                                }
                                item.el.style.top = (newAbsY - parentT) + 'px';
                                if (item.type === 'marker') {
                                    const idx = parseInt(item.id.replace('v4-pin-', ''));
                                    notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: item.x, y: newAbsY });
                                }
                            }
                        });
                        allHandles.forEach((h, i) => h.style.display = handleStates[i]);
                        if (hasConnectorChanges) {
                            if (window.parent && window.parent.ConnectorEngine) {
                                window.parent.ConnectorEngine.redrawAll();
                            }
                            notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                        }
                        markDirty();
                        return;
                    }
        
                    items.forEach(item => {
                        let dx = 0, dy = 0;
                        switch(alignType) {
                            case 'left':   dx = minX - item.x; break;
                            case 'right':  dx = maxX - item.w - item.x; break;
                            case 'center': dx = (minX + maxX)/2 - item.w/2 - item.x; break;
                            case 'top':    dy = minY - item.y; break;
                            case 'bottom': dy = maxY - item.h - item.y; break;
                            case 'middle': dy = (minY + maxY)/2 - item.h/2 - item.y; break;
                        }
        
                        if (dx === 0 && dy === 0) return;
        
                        if (item.type === 'connector') {
                            if (item.conn) {
                                item.conn.start.x += dx;
                                item.conn.start.y += dy;
                                item.conn.end.x += dx;
                                item.conn.end.y += dy;
                                item.conn.start.targetId = null; item.conn.start.side = null;
                                item.conn.end.targetId = null; item.conn.end.side = null;
                                hasConnectorChanges = true;
                            }
                        } else {
                            const newAbsX = item.x + dx;
                            const newAbsY = item.y + dy;
        
                            let parentL = 0;
                            let parentT = 0;
                            let parent = item.el.parentElement;
                            while (parent && parent !== doc.body) {
                                if (parent.classList.contains('lf-component') || parent.classList.contains('lf-group')) {
                                    parentL += parseFloat(parent.style.left) || 0;
                                    parentT += parseFloat(parent.style.top) || 0;
                                }
                                parent = parent.parentElement;
                            }
        
                            item.el.style.left = (newAbsX - parentL) + 'px';
                            item.el.style.top = (newAbsY - parentT) + 'px';
                            
                            if (item.type === 'marker') {
                                const idx = parseInt(item.id.replace('v4-pin-', ''));
                                notifyParent({ type: 'LF_UPDATE_PIN_POS', index: idx, x: newAbsX, y: newAbsY });
                            }
                        }
                    });
                    if (hasConnectorChanges) {
                        if (window.parent && window.parent.ConnectorEngine) {
                            window.parent.ConnectorEngine.redrawAll();
                        }
                        notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                    }
                    markDirty();
    };

    window.v4MessageHandlers['LF_GROUP_SELECTED'] = function(d) {
        const ids = d.ids || [];
                    if (ids.length < 2) return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    
                    const doc = document;
                    const host = doc.body;
        
                    const comps = ids.map(id => doc.getElementById(id)).filter(el => el && !el.classList.contains('connector-line'));
                    const groupedConnectorIds = ids.filter(id => id.startsWith('conn_'));
                    if (comps.length < 2 && (comps.length + groupedConnectorIds.length) < 2) return;
        
                    // Sort comps based on their current DOM order to preserve relative layering inside the group
                    comps.sort((a, b) => {
                        const position = a.compareDocumentPosition(b);
                        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
                        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
                        return 0;
                    });
        
                    // Suspend observer updates to prevent batch movements from triggers
                    if (typeof window.suspendDesignSystem === 'function') {
                        window.suspendDesignSystem();
                    }
        
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    const items = [];
        
                    comps.forEach(c => {
                        const l = parseFloat(c.style.left) || 0;
                        const t = parseFloat(c.style.top) || 0;
                        const w = parseFloat(c.style.width) || c.offsetWidth || 0;
                        const h = parseFloat(c.style.height) || c.offsetHeight || 0;
        
                        minX = Math.min(minX, l);
                        minY = Math.min(minY, t);
                        maxX = Math.max(maxX, l + w);
                        maxY = Math.max(maxY, t + h);
                        items.push({ el: c, l, t, w, h, type: 'comp' });
                    });
        
                    groupedConnectorIds.forEach(id => {
                        const conn = (window.parent && window.parent.state && window.parent.state.connectors) 
                            ? window.parent.state.connectors.find(c => c.id === id) 
                            : null;
                        if (conn) {
                            const l = Math.min(conn.start.x, conn.end.x);
                            const t = Math.min(conn.start.y, conn.end.y);
                            const w = Math.abs(conn.end.x - conn.start.x);
                            const h = Math.abs(conn.end.y - conn.start.y);
        
                            minX = Math.min(minX, l);
                            minY = Math.min(minY, t);
                            maxX = Math.max(maxX, l + w);
                            maxY = Math.max(maxY, t + h);
                            
                            const el = doc.getElementById(id);
                            items.push({ el, l, t, w, h, type: 'connector', conn });
                        }
                    });
        
                    // 2. Hide handles for clean state AFTER gathering coordinates
                    const allHandles = doc.querySelectorAll('.lf-drag-handle, .lf-resizer, .lf-delete-trigger');
                    const handleStates = Array.from(allHandles).map(h => h.style.display);
                    allHandles.forEach(h => h.style.display = 'none');
        
                    const groupBaseL = minX;
                    const groupBaseT = minY;
                    const groupBaseW = maxX - minX;
                    const groupBaseH = maxY - minY;
        
                    const groupId = 'group-' + Date.now();
                    const group = doc.createElement('div');
                    group.id = groupId;
                    group.className = 'lf-component lf-group selected';
                    if (groupedConnectorIds.length > 0) {
                        group.setAttribute('data-connectors', JSON.stringify(groupedConnectorIds));
                    }
                    
                    const topmostComp = comps[comps.length - 1] || (items.length > 0 ? items[items.length - 1].el : null);
                    const groupParent = (topmostComp && topmostComp.parentNode) ? topmostComp.parentNode : host;
        
                    const targetGroupZ = (typeof window.getNextTopZIndex === 'function')
                        ? window.getNextTopZIndex(groupParent)
                        : 1010;
        
                    Object.assign(group.style, {
                        position: 'absolute', left: groupBaseL + 'px', top: groupBaseT + 'px',
                        width: groupBaseW + 'px', height: groupBaseH + 'px',
                        background: 'transparent', border: 'none', zIndex: String(targetGroupZ)
                    });
        
                    group.innerHTML = '<div class="lf-delete-trigger">&times;</div>';
        
                    items.forEach(item => {
                        if (item.type === 'connector') return; // virtual, don't move into DOM
                        item.el.style.left = (item.l - minX) + 'px';
                        item.el.style.top = (item.t - minY) + 'px';
                        item.el.style.width = item.w + 'px';
                        item.el.style.height = item.h + 'px';
                        item.el.classList.remove('selected');
                        group.appendChild(item.el);
                    });
        
                    // Insert group into parent DOM right before script tag, ensuring both topmost z-index and DOM order
                    const trailingRef = Array.from(groupParent.children).find(c => !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script'));
                    if (trailingRef && trailingRef.parentNode === groupParent) {
                        groupParent.insertBefore(group, trailingRef);
                    } else {
                        groupParent.appendChild(group);
                    }
        
                    // 3. Restore handle states AFTER all children are successfully moved
                    allHandles.forEach((h, i) => h.style.display = handleStates[i]);
        
                    // Resume observer updates
                    if (typeof window.resumeDesignSystem === 'function') {
                        window.resumeDesignSystem();
                    }
        
                    // Notify parent with full group styles so Object Properties panel recognizes it as a group immediately
                    notifyParent({
                        type: 'LF_COMP_SELECTED',
                        shiftKey: false,
                        ...window._getCompStyles(group)
                    });
                    markDirty();
    };

    window.v4MessageHandlers['LF_UNGROUP_SELECTED'] = function(d) {
        const ids = d.ids || [];
                    if (ids.length < 1) return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
        
                    const doc = document;
                    const host = doc.body;
                    const group = doc.getElementById(ids[0]);
                    if (!group || !group.classList.contains('lf-group')) return;
        
                    const groupL = parseFloat(group.style.left) || 0;
                    const groupT = parseFloat(group.style.top) || 0;
                    const groupZ = parseInt(group.style.zIndex, 10) || 1010;
        
                    const groupedConnectorIdsStr = group.getAttribute('data-connectors');
                    const groupedConnectorIds = groupedConnectorIdsStr ? JSON.parse(groupedConnectorIdsStr) : [];
        
                    const children = Array.from(group.children).filter(c => c.classList.contains('lf-component'));
                    const childZs = children.map(c => parseInt(c.style.zIndex, 10) || 1000);
                    const minChildZ = childZs.length > 0 ? Math.min(...childZs) : 1000;
                    const newIds = [];
        
                    children.forEach((c, idx) => {
                        if (!c.id) c.id = 'v4-comp-ug-' + Date.now() + '-' + idx;
        
                        const relL = parseFloat(c.style.left) || 0;
                        const relT = parseFloat(c.style.top) || 0;
                        const w = c.offsetWidth;
                        const h = c.offsetHeight;
        
                        const absL = groupL + relL;
                        const absT = groupT + relT;
        
                        c.style.left = absL + 'px';
                        c.style.top = absT + 'px';
                        c.style.width = w + 'px';
                        c.style.height = h + 'px';
        
                        // Rebase children z-index to match group's topmost layer depth
                        const origZ = childZs[idx] || 1000;
                        const relOffset = Math.max(0, origZ - minChildZ);
                        c.style.zIndex = String(groupZ + relOffset);
        
                        const isMarker = c.classList.contains('text-marker');
                        if (isMarker && c.id.startsWith('v4-pin-')) {
                            const pinIdx = parseInt(c.id.replace('v4-pin-', ''));
                            notifyParent({ type: 'LF_UPDATE_PIN_POS', index: pinIdx, x: absL, y: absT });
                        }
                        c.classList.add('selected');
                        newIds.push(c.id);
                        // Insert child back into the DOM exactly where the group container was
                        group.parentNode.insertBefore(c, group);
                    });
        
                    groupedConnectorIds.forEach(connId => {
                        newIds.push(connId);
                    });
        
                    group.remove();
                    notifyParent({ type: 'LF_UNGROUPED_SYNC_SELECTION', ids: newIds });
                    markDirty();
    };

    window.v4MessageHandlers['LF_EXTRACT_MOLECULE'] = function(d) {
        const group = document.getElementById(d.id);
                    if (!group || !group.classList.contains('lf-group')) return;
        
                    const clone = group.cloneNode(true);
                    clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
                    clone.removeAttribute('id');
                    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        
                    const moleculeData = {
                        id: 'mol-' + Date.now(),
                        name: d.name,
                        category: 'Custom',
                        width: group.style.width,
                        height: group.style.height,
                        isGroup: true,
                        previewHtml: '<div style="font-size: 10px; font-weight: 700; color: #6366f1;">' + d.name + '</div>',
                        html: clone.innerHTML
                    };
        
                    notifyParent({ type: 'LF_MOLECULE_EXTRACTED', moleculeData });
    };

})();
`;
