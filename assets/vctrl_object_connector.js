window.v4ObjectConnectorScript = `
(function() {
    console.log("[V4 Object Connector] Module initialized.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    let tempSvg = null;

    window.drawTempLine = (x1, y1, x2, y2) => {
        if (!tempSvg) {
            tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            tempSvg.style.cssText = 'position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; z-index:10005; overflow:visible;';
            tempSvg.innerHTML = '<path stroke="#00e5ff" stroke-width="2" stroke-dasharray="4,4" fill="none" />';
            document.body.appendChild(tempSvg);
        }
        const path = tempSvg.querySelector('path');
        const midX = (x1 + x2) / 2;
        const pathData = 'M ' + x1 + ' ' + y1 + ' H ' + midX + ' V ' + y2 + ' H ' + x2;
        path.setAttribute('d', pathData);
    };

    window.removeTempLine = () => {
        if (tempSvg) {
            tempSvg.remove();
            tempSvg = null;
        }
    };


    window.updateAnchoredConnectorsLocal = (movedId) => {
        const movedEl = document.getElementById(movedId);
        const movedIds = [movedId];
        if (movedEl && movedEl.classList.contains('lf-group')) {
            movedEl.querySelectorAll('.lf-component').forEach(child => {
                if (child.id) movedIds.push(child.id);
            });
        }
        
        const connectors = window.parent?.state?.connectors || [];
        connectors.forEach(conn => {
            if (movedIds.includes(conn.start.targetId) || movedIds.includes(conn.end.targetId)) {
                const svg = document.getElementById(conn.id);
                if (svg) {
                    ['start', 'end'].forEach(type => {
                        const pt = conn[type];
                        if (pt.targetId) {
                            const targetEl = document.getElementById(pt.targetId);
                            if (targetEl) {
                                let left = parseFloat(targetEl.style.left) || 0;
                                let top = parseFloat(targetEl.style.top) || 0;
                                
                                let parent = targetEl.parentElement;
                                while (parent && parent !== document.body && parent !== document.documentElement) {
                                    if (parent.style.position === 'absolute' || parent.classList.contains('lf-group')) {
                                        left += parseFloat(parent.style.left) || 0;
                                        top += parseFloat(parent.style.top) || 0;
                                    }
                                    parent = parent.parentElement;
                                }

                                const width = targetEl.offsetWidth;
                                const height = targetEl.offsetHeight;

                                if (pt.side === 'left') { pt.x = left; pt.y = top + height/2; }
                                else if (pt.side === 'right') { pt.x = left + width; pt.y = top + height/2; }
                                else if (pt.side === 'top') { pt.x = left + width/2; pt.y = top; }
                                else if (pt.side === 'bottom') { pt.x = left + width/2; pt.y = top + height; }
                            }
                        }
                    });
                    
                    const sX = conn.start.x;
                    const sY = conn.start.y;
                    const eX = conn.end.x;
                    const eY = conn.end.y;
                    
                    const headLength = Math.max(12, parseFloat(conn.style.strokeWidth || 1.6) * 4.5);
                    const padding = headLength + 10;
                    const minX = Math.min(sX, eX) - padding;
                    const minY = Math.min(sY, eY) - padding;
                    const w = Math.max(sX, eX) + padding - minX;
                    const h = Math.max(sY, eY) + padding - minY;
                    
                    svg.style.left = minX + 'px';
                    svg.style.top = minY + 'px';
                    svg.style.width = w + 'px';
                    svg.style.height = h + 'px';
                    svg.setAttribute('width', w);
                    svg.setAttribute('height', h);
                    
                    const rStart = { x: sX - minX, y: sY - minY };
                    const rEnd = { x: eX - minX, y: eY - minY };
                    
                    const pathData = window.calculatePathData(conn, rStart, rEnd);
                    const paths = svg.querySelectorAll('path');
                    if (paths.length === 2) {
                        paths[0].setAttribute('d', pathData);
                        paths[1].setAttribute('d', pathData);
                    }
                    
                    const circles = svg.querySelectorAll('circle');
                    if (circles.length === 2) {
                        circles[0].setAttribute('cx', rStart.x);
                        circles[0].setAttribute('cy', rStart.y);
                        circles[1].setAttribute('cx', rEnd.x);
                        circles[1].setAttribute('cy', rEnd.y);
                    }
                }
            }
        });
    };


    window.updateConnectorPathLocal = function(connId) {
        var conn = window.parent && window.parent.state && window.parent.state.connectors && window.parent.state.connectors.find(function(c) { return c.id === connId; });
        if (!conn) return;
        var svg = document.getElementById(conn.id);
        if (!svg) return;
        
        var headLength = Math.max(12, parseFloat(conn.style.strokeWidth || 1.6) * 4.5);
        var padding = headLength + 10;
        var minX = Math.min(conn.start.x, conn.end.x) - padding;
        var minY = Math.min(conn.start.y, conn.end.y) - padding;
        var w = Math.max(conn.start.x, conn.end.x) + padding - minX;
        var h = Math.max(conn.start.y, conn.end.y) + padding - minY;
        
        svg.style.left = minX + "px";
        svg.style.top = minY + "px";
        svg.style.width = w + "px";
        svg.style.height = h + "px";
        
        var rel = function(pt) { return { x: pt.x - minX, y: pt.y - minY }; };
        var rStart = rel(conn.start);
        var rEnd = rel(conn.end);
        
        var paths = svg.querySelectorAll("path");
        if (paths.length >= 2) {
            var pathData = window.calculatePathData(conn, rStart, rEnd);
            paths[0].setAttribute("d", pathData);
            paths[1].setAttribute("d", pathData);
        }
        
        var circles = svg.querySelectorAll("circle");
        if (circles.length === 2) {
            circles[0].setAttribute("cx", rStart.x);
            circles[0].setAttribute("cy", rStart.y);
            circles[1].setAttribute("cx", rEnd.x);
            circles[1].setAttribute("cy", rEnd.y);
        }
    };

    window.v4MessageHandlers['LF_RENDER_CONNECTORS'] = function(d) {
        if (window.parent && window.parent.DEBUG_MODE) {
            console.log("[V4 Iframe] LF_RENDER_CONNECTORS received:", d);
        }
        const host = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
        if (window.parent && window.parent.DEBUG_MODE) {
            console.log("[V4 Iframe] Host for connectors:", host);
        }
        document.querySelectorAll('.connector-line').forEach(el => el.remove());
        const connectors = d.connectors || [];
        const selectedIds = d.selectedIds || [];
        
        connectors.forEach(conn => {
            const isSelected = selectedIds.includes(conn.id);
            const baseWidth = parseFloat(conn.style.strokeWidth || 1.6);
            const width = isSelected ? (baseWidth + 1) : baseWidth;
            const color = conn.style.stroke || '#475569';
            
            const headLength = Math.max(12, baseWidth * 4.5);
            const padding = Math.max(headLength + 10, 30);
            const minX = Math.min(conn.start.x, conn.end.x) - padding;
            const minY = Math.min(conn.start.y, conn.end.y) - padding;
            const maxX = Math.max(conn.start.x, conn.end.x) + padding;
            const maxY = Math.max(conn.start.y, conn.end.y) + padding;
            const w = maxX - minX;
            const h = maxY - minY;

            if (isNaN(w) || isNaN(h)) return;

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.id = conn.id;
            svg.setAttribute("class", "lf-component connector-line" + (isSelected ? " selected" : ""));
            Object.assign(svg.style, {
                position: 'absolute',
                left: minX + 'px',
                top: minY + 'px',
                width: w + 'px',
                height: h + 'px',
                pointerEvents: 'none',
                zIndex: isSelected ? '10001' : '9999',
                overflow: 'visible'
            });

            const rel = (pt) => ({ x: pt.x - minX, y: pt.y - minY });
            const rStart = rel(conn.start);
            const rEnd = rel(conn.end);

            const pathData = window.calculatePathData(conn, rStart, rEnd);

            const startMId = 'm-start-' + conn.id;
            const endMId = 'm-end-' + conn.id;

            svg.innerHTML = '<defs>' +
                '<marker id="' + startMId + '" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
                    '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + color + '" />' +
                '</marker>' +
                '<marker id="' + endMId + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
                    '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + color + '" />' +
                '</marker>' +
            '</defs>' +
            '<path d="' + pathData + '" stroke="transparent" stroke-width="40" fill="none" style="cursor:pointer; pointer-events:auto;" class="connector-hit-area" />' +
            '<path d="' + pathData + '" stroke="' + color + '" stroke-width="' + width + '" fill="none" ' +
                  'marker-start="' + (conn.style.markerStart ? 'url(#' + startMId + ')' : '') + '" ' +
                  'marker-end="' + (conn.style.markerEnd ? 'url(#' + endMId + ')' : '') + '" ' +
                  'style="pointer-events:none;" ' +
                  (conn.style.dashArray ? 'stroke-dasharray="' + conn.style.dashArray + '"' : '') + ' />';

            const hitArea = svg.querySelector('.connector-hit-area');
            if (hitArea) {
                hitArea.onmousedown = (e) => {
                    e.stopPropagation();
                    if (window.notifyParent) window.notifyParent({ type: 'LF_CONNECTOR_CLICKED', id: conn.id, shiftKey: e.shiftKey });
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    window.isDraggingLine = true;
                    window.activeLineId = conn.id;
                    window.startX = e.clientX;
                    window.startY = e.clientY;
                    window.startLineCoords = {
                        start: { x: conn.start.x, y: conn.start.y },
                        end: { x: conn.end.x, y: conn.end.y }
                    };
                };
            }

            if (isSelected) {
                ['start', 'end'].forEach(type => {
                    const pt = rel(conn[type]);
                    const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    handle.setAttribute("cx", pt.x); handle.setAttribute("cy", pt.y);
                    handle.setAttribute("r", 6); handle.setAttribute("fill", "#3b82f6");
                    handle.setAttribute("stroke", "#fff"); handle.setAttribute("stroke-width", "2");
                    handle.style.cursor = 'crosshair'; handle.style.pointerEvents = 'auto';
                    handle.onmousedown = (e) => {
                        e.stopPropagation();
                        window.isConnectorDragging = true;
                        document.body.classList.add('drawing-line-active');
                        if (window.notifyParent) window.notifyParent({ type: 'LF_CONNECTOR_HANDLE_DOWN', id: conn.id, pointType: type });
                    };
                    svg.appendChild(handle);
                });
            }
            host.appendChild(svg);
        });
    };

    window.v4MessageHandlers['LF_UPDATE_ARROW_DIRECTION'] = function(d) {
        const s = document.querySelector('.lf-component.selected'); 
        if (!s) return;
        const shape = s.querySelector('.v4-shape-arrow, .v4-shape-triangle') || 
                      (s.classList.contains('v4-shape-arrow') || s.classList.contains('v4-shape-triangle') ? s : null) || 
                      s.querySelector('.v4-shape') || 
                      (s.classList.contains('v4-shape') ? s : null);
        if (!shape) return;
        if (window.V4UndoManager) window.V4UndoManager.saveState();

        const dir = d.direction || 'right';
        shape.setAttribute('data-arrow-dir', dir);
        shape.setAttribute('data-direction', dir);

        if (shape.classList.contains('v4-shape-arrow') || shape.id === 'v4-shape-arrow') {
            const comp = shape.closest('.lf-component') || shape;
            const w = parseFloat(comp.style.width) || comp.offsetWidth || 100;
            const h = parseFloat(comp.style.height) || comp.offsetHeight || 100;
            const svg = shape.querySelector('svg');
            if (svg) {
                svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
                svg.setAttribute('preserveAspectRatio', 'none');
            }
            const path = shape.querySelector('.v4-arrow-path');
            if (path && typeof window.buildArrowPath === 'function') {
                path.setAttribute('d', window.buildArrowPath(w, h, dir));
            }
        } else if (shape.classList.contains('v4-shape-triangle') || shape.id === 'v4-shape-triangle') {
            shape.setAttribute('data-direction', dir);
        }
        if (typeof window.markDirty === 'function') window.markDirty();
    };
})();
`;
