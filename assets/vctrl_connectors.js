/**
 * vctrl_connectors.js - Dedicated Connector Engine for V4 (TRUE FINAL VERSION)
 * Responsibility: Zero-lag dragging, Sidebar Sync, Deselection, and State Persistence.
 */

window.ConnectorEngine = (function() {
    console.log("%c [CONNECTOR ENGINE] Finalizing with Zero-Lag Dragging (V116_LINE_PERSIST_FIX)... ", "background: #3b82f6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    let isDrawing = false;
    let selectedConnectorIds = [];
    let isDragging = false;
    let dragPoint = null; // { connId, pointType: 'start'|'end' }
    let rafId = null;
    let snapTargets = [];

    function init() {
        // Function must be defined before init calls it via listeners
        window.updateSelectedStyle = function(style) {
            selectedConnectorIds.forEach(id => {
                const conn = window.state.connectors.find(c => c.id === id);
                if (conn) {
                    if (!conn.style) conn.style = {};
                    Object.assign(conn.style, style);
                }
            });
            redrawAll();
            if (window.markAsDirty) window.markAsDirty();
            const iframe = window.DOM?.iframe;
            if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                MessageHub.send(iframe.contentWindow, 'BYCHOI_SYNC_CONNECTORS', { connectors: window.state.connectors });
            }
        };

        // High-Persistence Window Handlers (Zero-Lag)
        window.addEventListener('mousemove', onGlobalMouseMove);
        window.addEventListener('mouseup', onGlobalMouseUp);
        window.addEventListener('keydown', handleKeyDown);

        // Global Canvas Click Listener for Deselection
        const workspace = document.getElementById('workspace-view');
        if (workspace) {
            workspace.addEventListener('mousedown', (e) => {
                if (e.target.closest('.sidebar') || e.target.closest('#floating-inspector-card')) return;
                clearSelection();
            });
        }

        if (window.MessageHub) {
            window.MessageHub.subscribe('BYCHOI_SNAP_REQUEST', syncAnchoredPositions);
            window.MessageHub.subscribe('BYCHOI_SNAP_RESPONSE', syncAnchoredPositions);
            window.MessageHub.subscribe('BYCHOI_SNAP_END', syncAnchoredPositions);
            window.MessageHub.subscribe('BYCHOI_COMP_RESIZED', syncAnchoredPositions);
            window.MessageHub.subscribe('BYCHOI_DESELECT', clearSelection); 
            
            // Forward selection from iframe
            window.MessageHub.subscribe('BYCHOI_CONNECTOR_CLICKED', (data) => {
                selectConnector(data.id, data.shiftKey);
            });
            
            // Handle handle drag from iframe
            window.MessageHub.subscribe('BYCHOI_CONNECTOR_HANDLE_DOWN', (data) => {
                isDragging = true;
                dragPoint = { connId: data.id, pointType: data.pointType };
                collectSnapTargets();
                document.body.style.cursor = 'crosshair';
            });

            // Handle connector position update from iframe (Group move)
            window.MessageHub.subscribe('BYCHOI_UPDATE_CONNECTOR_POS', (data) => {
                const conn = window.state.connectors.find(c => c.id === data.id);
                if (conn) {
                    conn.start.x = data.start.x;
                    conn.start.y = data.start.y;
                    conn.end.x = data.end.x;
                    conn.end.y = data.end.y;
                }
            });
            window.MessageHub.subscribe('BYCHOI_SHIFT_CONNECTOR_POS', (data) => {
                const conn = window.state.connectors.find(c => c.id === data.id);
                if (conn) {
                    conn.start.x += data.dx;
                    conn.start.y += data.dy;
                    conn.end.x += data.dx;
                    conn.end.y += data.dy;
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                    const iframe = window.DOM?.iframe;
                    if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                        MessageHub.send(iframe.contentWindow, 'BYCHOI_SYNC_CONNECTORS', { connectors: window.state.connectors });
                    }
                }
            });
            window.MessageHub.subscribe('BYCHOI_CONNECTOR_HANDLE_MOVE', (data) => {
                onIframeMouseMove(data);
            });
            window.MessageHub.subscribe('BYCHOI_CONNECTOR_HANDLE_UP', onGlobalMouseUp);
            window.MessageHub.subscribe('BYCHOI_DELETE_CONNECTOR', (data) => {
                if (data.id) {
                    window.state.connectors = window.state.connectors.filter(c => c.id !== data.id);
                    if (window.state.activeFile && window.state.activeFile.meta) {
                        window.state.activeFile.meta.connectors = window.state.connectors;
                    }
                    selectedConnectorIds = selectedConnectorIds.filter(id => id !== data.id);
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                }
            });
            window.MessageHub.subscribe('BYCHOI_CREATE_CONNECTOR', (data) => {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                const id = 'conn_' + Date.now();
                const newConnector = {
                    id,
                    type: 'elbow',
                    start: { targetId: data.startId, side: data.startSide, x: 0, y: 0 },
                    end: { targetId: data.endId, side: data.endSide, x: 0, y: 0 },
                    style: { stroke: '#646464', strokeWidth: 1.6 }
                };
                if (!window.state.connectors) window.state.connectors = [];
                window.state.connectors.push(newConnector);
                
                syncAnchoredPositions();
                selectConnector(id);
                if (window.markAsDirty) window.markAsDirty();
            });
            window.MessageHub.subscribe('BYCHOI_SYNC_CONNECTORS', (data) => {
                window.state.connectors = data.connectors || [];
                if (window.state.activeFile && window.state.activeFile.meta) {
                    window.state.activeFile.meta.connectors = window.state.connectors;
                }
                if (window.markAsDirty) window.markAsDirty();
            });
        }

        // Line Editor Event Listeners (Delegated via handleLineEditorInputEvent SSOT; keep legacy dash-array & W/H delta hooks)
        document.getElementById('line-dash-array')?.addEventListener('change', (e) => window.updateSelectedStyle({ dashArray: e.target.value }));
        document.getElementById('prop-line-width')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            if (selectedConnectorIds.length > 0) {
                const conn = window.state.connectors.find(c => c.id === selectedConnectorIds[0]);
                if (conn) {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const sign = conn.end.x >= conn.start.x ? 1 : -1;
                    conn.end.x = conn.start.x + sign * val;
                    conn.end.targetId = null; conn.end.side = null;
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                    const iframe = window.DOM?.iframe;
                    if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                        MessageHub.send(iframe.contentWindow, 'BYCHOI_SYNC_CONNECTORS', { connectors: window.state.connectors });
                    }
                }
            }
        });
        document.getElementById('prop-line-height')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            if (selectedConnectorIds.length > 0) {
                const conn = window.state.connectors.find(c => c.id === selectedConnectorIds[0]);
                if (conn) {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const sign = conn.end.y >= conn.start.y ? 1 : -1;
                    conn.end.y = conn.start.y + sign * val;
                    conn.end.targetId = null; conn.end.side = null;
                    redrawAll();
                    if (window.markAsDirty) window.markAsDirty();
                    const iframe = window.DOM?.iframe;
                    if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                        MessageHub.send(iframe.contentWindow, 'BYCHOI_SYNC_CONNECTORS', { connectors: window.state.connectors });
                    }
                }
            }
        });
    }

    function redrawAll() {
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (window.MessageHub && iframe?.contentWindow) {
            MessageHub.send(iframe.contentWindow, 'BYCHOI_RENDER_CONNECTORS', {
                connectors: window.state.connectors || [],
                selectedIds: selectedConnectorIds
            });
        }
    }

    function onIframeMouseMove(data) {
        if (!isDragging || !dragPoint) return;
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const rect = iframe.getBoundingClientRect();
        const syntheticEvent = {
            clientX: data.clientX + rect.left,
            clientY: data.clientY + rect.top
        };
        onGlobalMouseMove(syntheticEvent);
    }

    function onGlobalMouseMove(e) {
        if (!isDragging || !dragPoint) return;
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            if (!isDragging || !dragPoint) return;
            const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
            if (!iframe) return;
            const rect = iframe.getBoundingClientRect();
            const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
            
            // Calculate coordinates relative to the iframe content
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;

            // Dynamically calculate proximity to elements to toggle .near-connector inside iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeRect = iframe.getBoundingClientRect();
            iframeDoc.querySelectorAll('.bychoi-component').forEach(comp => {
                if (comp.id === dragPoint.connId) return;
                const r = comp.getBoundingClientRect();
                const left = r.left + iframeRect.left;
                const right = r.right + iframeRect.left;
                const top = r.top + iframeRect.top;
                const bottom = r.bottom + iframeRect.top;
                
                const dx = Math.max(left - e.clientX, 0, e.clientX - right);
                const dy = Math.max(top - e.clientY, 0, e.clientY - bottom);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    comp.classList.add('near-connector');
                } else {
                    comp.classList.remove('near-connector');
                }
            });

            const conn = window.state.connectors.find(c => c.id === dragPoint.connId);
            if (conn) {
                const pt = conn[dragPoint.pointType];
                pt.x = x; pt.y = y;
                pt.targetId = null; pt.side = null;
                
                // Reset previously highlighted port
                if (window.lastHighlightedPort) {
                    window.lastHighlightedPort.style.transform = '';
                    window.lastHighlightedPort.style.background = '';
                    window.lastHighlightedPort = null;
                }

                // Optimized Fast Snap
                let bestSnap = null;
                let minDist = 30; // Snap threshold (30px)

                snapTargets.forEach(target => {
                    const dist = Math.sqrt(Math.pow(e.clientX - target.cX, 2) + Math.pow(e.clientY - target.cY, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        bestSnap = target;
                    }
                });

                if (bestSnap) {
                    pt.targetId = bestSnap.id;
                    pt.side = bestSnap.side;
                    pt.x = bestSnap.sX;
                    pt.y = bestSnap.sY;

                    // Dynamically highlight snapped port inside iframe
                    const targetEl = iframeDoc.getElementById(bestSnap.id);
                    if (targetEl) {
                        const portEl = targetEl.querySelector(`.bychoi-connector-port.port-${bestSnap.side}`);
                        if (portEl) {
                            portEl.style.transform = 'scale(1.8)';
                            portEl.style.background = '#fb7185';
                            window.lastHighlightedPort = portEl;
                        }
                    }
                }

                redrawAll();

                // Real-time properties sync
                const propLineWidth = document.getElementById('prop-line-width');
                const propLineHeight = document.getElementById('prop-line-height');
                if (propLineWidth) propLineWidth.value = Math.round(Math.abs(conn.end.x - conn.start.x));
                if (propLineHeight) propLineHeight.value = Math.round(Math.abs(conn.end.y - conn.start.y));
            }
        });
    }

    function onGlobalMouseUp() {
        if (window.lastHighlightedPort) {
            window.lastHighlightedPort.style.transform = '';
            window.lastHighlightedPort.style.background = '';
            window.lastHighlightedPort = null;
        }

        const iframe = window.DOM?.iframe;
        if (iframe) {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.querySelectorAll('.bychoi-component').forEach(comp => {
                comp.classList.remove('near-connector');
            });
        }

        if (isDragging) {
            isDragging = false;
            dragPoint = null;
            snapTargets = [];
            document.body.style.cursor = '';
            if (window.markAsDirty) window.markAsDirty();
            redrawAll();
            if (window.MessageHub && iframe?.contentWindow && window.state?.connectors) {
                MessageHub.send(iframe.contentWindow, 'BYCHOI_SYNC_CONNECTORS', { connectors: window.state.connectors });
            }
        }
    }

    function collectSnapTargets() {
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeRect = iframe.getBoundingClientRect();
        
        snapTargets = [];
        iframeDoc.querySelectorAll('.bychoi-component').forEach(comp => {
            if (dragPoint && comp.id === dragPoint.connId) return;
            
            // Physical bounding rect for client mouse comparison
            const r = comp.getBoundingClientRect();

            // Unscaled logical coordinates from inline style rules
            const left = parseFloat(comp.style.left) || 0;
            const top = parseFloat(comp.style.top) || 0;
            const width = comp.offsetWidth;
            const height = comp.offsetHeight;

            const sides = [
                { side: 'left',   cX: r.left + iframeRect.left,             cY: r.top + r.height/2 + iframeRect.top, sX: left,             sY: top + height/2 },
                { side: 'right',  cX: r.right + iframeRect.left,            cY: r.top + r.height/2 + iframeRect.top, sX: left + width,     sY: top + height/2 },
                { side: 'top',    cX: r.left + r.width/2 + iframeRect.left,   cY: r.top + iframeRect.top,             sX: left + width/2,     sY: top },
                { side: 'bottom', cX: r.left + r.width/2 + iframeRect.left,   cY: r.bottom + iframeRect.top,          sX: left + width/2,     sY: top + height }
            ];
            sides.forEach(s => snapTargets.push({ id: comp.id, ...s }));
        });
    }

    function spawnLine(type = 'straight') {
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        const id = 'conn_' + Date.now();
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const rect = iframe.getBoundingClientRect();
        const scale = (window.state && window.state.transform && window.state.transform.scale) || 1;
        const cx = (window.innerWidth / 2 - rect.left) / scale;
        const cy = (window.innerHeight / 2 - rect.top) / scale;

        const newLine = {
            id, type,
            start: { x: cx - 50, y: cy, targetId: null, side: null },
            end: { x: cx + 50, y: cy, targetId: null, side: null },
            style: { stroke: '#646464', strokeWidth: 1.6 }
        };

        if (!window.state.connectors) window.state.connectors = [];
        window.state.connectors.push(newLine);
        
        redrawAll();
        selectConnector(id);
        if (window.markAsDirty) window.markAsDirty();
    }

    function selectConnector(id, isMulti = false) {
        if (isMulti) {
            if (selectedConnectorIds.includes(id)) selectedConnectorIds = selectedConnectorIds.filter(x => x !== id);
            else selectedConnectorIds.push(id);
        } else {
            selectedConnectorIds = [id];
        }
        onSelectionChange(id);
    }

    function setSelectedIds(ids) {
        selectedConnectorIds = Array.isArray(ids) ? [...ids] : [];
        if (selectedConnectorIds.length > 0) {
            onSelectionChange(selectedConnectorIds[selectedConnectorIds.length - 1]);
        } else {
            clearSelection();
        }
        redrawAll();
    }

    function onSelectionChange(lastId) {
        const lineEditor = document.getElementById('line-editor-section');
        const shapeEditor = document.getElementById('shape-inspector-section');
        if (lineEditor) {
            lineEditor.style.display = 'block';
            const orientGroup = document.getElementById('line-orientation-group');
            const lenGroup = document.getElementById('line-length-group');
            if (orientGroup) orientGroup.style.display = 'none';
            if (lenGroup) lenGroup.style.display = 'none';
            const conn = window.state.connectors.find(c => c.id === lastId);
            if (conn) {
                const colorInput = document.getElementById('line-stroke-color');
                const widthInput = document.getElementById('line-stroke-width');
                const widthDisplay = document.getElementById('txt-line-stroke-width');
                const startMarker = document.getElementById('line-marker-start');
                const endMarker = document.getElementById('line-marker-end');
                const dashArray = document.getElementById('line-dash-array');

                if (colorInput) colorInput.value = conn.style.stroke || '#475569';
                if (widthInput) widthInput.value = conn.style.strokeWidth || 1.6;
                if (widthDisplay) widthDisplay.innerText = (conn.style.strokeWidth || 1.6).toFixed(1);
                if (startMarker) startMarker.value = conn.style.markerStart || '';
                if (endMarker) endMarker.value = conn.style.markerEnd || '';
                if (dashArray) dashArray.value = conn.style.dashArray || '';

                const curDash = conn.style.dashArray || '';
                const connLineStyle = (curDash === '1 5' || curDash === '1,5') ? 'dotted' : (curDash ? 'dashed' : 'solid');
                ['solid', 'dashed', 'dotted'].forEach(s => {
                    const btn = document.getElementById('btn-line-style-' + s);
                    if (btn) highlightActive(btn, s === connLineStyle);
                });

                const propLineWidth = document.getElementById('prop-line-width');
                const propLineHeight = document.getElementById('prop-line-height');
                if (propLineWidth) propLineWidth.value = Math.round(Math.abs(conn.end.x - conn.start.x));
                if (propLineHeight) propLineHeight.value = Math.round(Math.abs(conn.end.y - conn.start.y));
            }
        }
        if (shapeEditor) shapeEditor.style.display = 'none';

        if (window.MessageHub) {
            const conn = window.state.connectors.find(c => c.id === lastId);
            const x = conn ? Math.min(conn.start.x, conn.end.x) : 0;
            const y = conn ? Math.min(conn.start.y, conn.end.y) : 0;
            const w = conn ? Math.abs(conn.end.x - conn.start.x) : 0;
            const h = conn ? Math.abs(conn.end.y - conn.start.y) : 0;
            window.MessageHub.send(window, 'BYCHOI_COMP_SELECTED', {
                id: lastId,
                isConnector: true,
                connectorType: conn ? conn.type : 'elbow',
                x: x,
                y: y,
                w: w,
                h: h
            });
        }
        redrawAll();
    }

    function clearSelection() {
        if (selectedConnectorIds.length === 0) return;
        selectedConnectorIds = [];
        const lineEditor = document.getElementById('line-editor-section');
        if (lineEditor) lineEditor.style.display = 'none';
        redrawAll();
    }

    function syncAnchoredPositions() {
        const iframe = window.DOM?.iframe || document.getElementById('screen-iframe');
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !window.state?.connectors) return;

        window.state.connectors.forEach(conn => {
            ['start', 'end'].forEach(type => {
                const pt = conn[type];
                if (pt && pt.targetId) {
                    const targetEl = iframeDoc.getElementById(pt.targetId);
                    if (targetEl) {
                        const left = parseFloat(targetEl.style.left) || 0;
                        const top = parseFloat(targetEl.style.top) || 0;
                        const width = targetEl.offsetWidth;
                        const height = targetEl.offsetHeight;

                        if (pt.side === 'left') { pt.x = left; pt.y = top + height/2; }
                        else if (pt.side === 'right') { pt.x = left + width; pt.y = top + height/2; }
                        else if (pt.side === 'top') { pt.x = left + width/2; pt.y = top; }
                        else if (pt.side === 'bottom') { pt.x = left + width/2; pt.y = top + height; }
                    } else {
                        pt.targetId = null;
                        pt.side = null;
                    }
                }
            });
        });
        redrawAll();
    }

    function deleteSelectedLine() {
        if (selectedConnectorIds.length === 0) return;
        window.state.connectors = window.state.connectors.filter(c => !selectedConnectorIds.includes(c.id));
        if (window.state.activeFile && window.state.activeFile.meta) {
            window.state.activeFile.meta.connectors = window.state.connectors;
        }
        selectedConnectorIds = [];
        const lineEditor = document.getElementById('line-editor-section');
        if (lineEditor) lineEditor.style.display = 'none';
        redrawAll();
        if (window.markAsDirty) window.markAsDirty();
    }

    function handleKeyDown(e) {
        const activeEl = document.activeElement;
        const isInput = activeEl && (
            activeEl.tagName === 'INPUT' || 
            activeEl.tagName === 'SELECT' || 
            activeEl.tagName === 'TEXTAREA' || 
            activeEl.isContentEditable
        );
        if (isInput) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedConnectorIds.length > 0) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                deleteSelectedLine();
            }
        }
    }

    function shiftConnectors(connIds, dx, dy) {
        if (!Array.isArray(connIds) || connIds.length === 0 || (!dx && !dy)) return;
        if (!window.state || !Array.isArray(window.state.connectors)) return;
        let changed = false;
        connIds.forEach(id => {
            const conn = window.state.connectors.find(c => c && c.id === id);
            if (conn && conn.start && conn.end) {
                conn.start.x += dx;
                conn.start.y += dy;
                conn.end.x += dx;
                conn.end.y += dy;
                conn.start.targetId = null; conn.start.side = null;
                conn.end.targetId = null; conn.end.side = null;
                changed = true;
            }
        });
        if (changed) {
            if (window.state.activeFile && window.state.activeFile.meta) {
                window.state.activeFile.meta.connectors = window.state.connectors;
            }
            redrawAll();
            if (window.markAsDirty) window.markAsDirty();
        }
    }

    // --- Line (Straight) Inspector Properties Synchronization & Event Handlers ---
    function getActiveLineTarget() {
        let ids = [];
        if (window.GroupingManager && typeof window.GroupingManager.getSelectedIds === 'function') {
            ids = window.GroupingManager.getSelectedIds();
        }
        if ((!ids || ids.length === 0) && window.state && Array.isArray(window.state.selectedIds) && window.state.selectedIds.length > 0) {
            ids = window.state.selectedIds;
        }
        const singleId = (window.state && window.state.selectedComponent && window.state.selectedComponent.id) ||
                         (window.state && window.state.editingIndex) ||
                         window.activeCompId || (ids && ids[0]) || null;
        return { id: singleId, ids: (ids && ids.length > 0) ? ids : (singleId ? [singleId] : []) };
    }

    window._syncLineEditorProps = (compStyles) => {
        if (!compStyles) return;
        const isDynamicConn = !!(compStyles.isConnector || (compStyles.id && String(compStyles.id).indexOf('conn_') === 0));
        const orientGroup = document.getElementById('line-orientation-group');
        const lenGroup = document.getElementById('line-length-group');
        if (orientGroup) orientGroup.style.display = isDynamicConn ? 'none' : 'block';
        if (lenGroup) lenGroup.style.display = isDynamicConn ? 'none' : 'block';
        if (isDynamicConn) {
            const conn = window.state && Array.isArray(window.state.connectors)
                ? window.state.connectors.find(c => c && c.id === compStyles.id)
                : null;
            if (conn && conn.style) {
                const startM = document.getElementById('line-marker-start');
                const endM = document.getElementById('line-marker-end');
                if (startM) startM.value = conn.style.markerStart || '';
                if (endM) endM.value = conn.style.markerEnd || '';
                const curDash = conn.style.dashArray || '';
                const connStyle = (curDash === '1 5' || curDash === '1,5') ? 'dotted' : (curDash ? 'dashed' : 'solid');
                ['solid', 'dashed', 'dotted'].forEach(s => {
                    const btn = document.getElementById('btn-line-style-' + s);
                    if (btn) highlightActive(btn, s === connStyle);
                });
            }
            return;
        }
        const dir = compStyles.lineDir || 'horizontal';
        const style = compStyles.lineStyle || 'solid';
        const thickness = parseFloat(compStyles.lineThickness) || 1.6;
        const color = compStyles.lineColor || '#c8c8c8';
        const markerStartEl = document.getElementById('line-marker-start');
        const markerEndEl = document.getElementById('line-marker-end');
        if (markerStartEl) markerStartEl.value = compStyles.lineMarkerStart || '';
        if (markerEndEl) markerEndEl.value = compStyles.lineMarkerEnd || '';

        document.querySelectorAll('.v4-line-dir-btn').forEach(b => {
            const btnDir = b.dataset.dir;
            highlightActive(b, btnDir === dir);
        });

        ['solid', 'dashed', 'dotted'].forEach(s => {
            const btn = document.getElementById('btn-line-style-' + s);
            if (btn) {
                highlightActive(btn, s === style);
            }
        });

        const thickInput = document.getElementById('line-stroke-width');
        const thickTxt = document.getElementById('txt-line-stroke-width');
        if (thickInput) thickInput.value = thickness;
        if (thickTxt) thickTxt.innerText = thickness;

        const colorInput = document.getElementById('line-stroke-color');
        let hexColor = '#c8c8c8';
        if (color) {
            hexColor = (typeof window.rgbToHex === 'function' ? window.rgbToHex(color) : color) || color;
            if (!hexColor.startsWith('#')) hexColor = '#c8c8c8';
        }
        if (colorInput) {
            colorInput.value = hexColor;
            const wrapper = colorInput.closest('.v4-color-wrapper');
            if (wrapper) {
                const isTrans = compStyles.isLineColorTransparent || compStyles.lineColor === 'transparent' || color === 'transparent';
                wrapper.classList.toggle('transparent-active', !!isTrans);
            }
        }

        // Dynamic Single Length Control Sync
        const curW = parseFloat(compStyles.width) || parseFloat(compStyles.w) || (compStyles.style && parseFloat(compStyles.style.width)) || 200;
        const curH = parseFloat(compStyles.height) || parseFloat(compStyles.h) || (compStyles.style && parseFloat(compStyles.style.height)) || 2;
        const lengthInput = document.getElementById('prop-line-length');
        const lengthLabel = document.getElementById('lbl-line-length');
        if (lengthInput) lengthInput.setAttribute('data-dir', dir);
        if (dir === 'vertical') {
            if (lengthLabel) lengthLabel.innerText = 'LENGTH / 세로 길이 (px)';
            if (lengthInput) lengthInput.value = Math.round(curH > 2 ? curH : (curW > 2 ? curW : 100));
        } else {
            if (lengthLabel) lengthLabel.innerText = 'LENGTH / 가로 길이 (px)';
            if (lengthInput) lengthInput.value = Math.round(curW > 2 ? curW : (curH > 2 ? curH : 200));
        }
    };

    // Line Editor Click & Input Handlers
    document.addEventListener('click', (e) => {
        const dirBtn = e.target.closest('.v4-line-dir-btn');
        if (dirBtn) {
            const dir = dirBtn.dataset.dir;
            const iframeWin = (window.DOM && window.DOM.iframe && window.DOM.iframe.contentWindow) || (document.getElementById('main-iframe') || document.getElementById('screen-iframe'))?.contentWindow;
            const target = getActiveLineTarget();
            if (iframeWin && target.id) {
                MessageHub.send(iframeWin, 'BYCHOI_UPDATE_STYLE', {
                    id: target.id,
                    ids: target.ids,
                    style: { lineDir: dir }
                });
                document.querySelectorAll('.v4-line-dir-btn').forEach(b => {
                    const isActive = b.dataset.dir === dir;
                    highlightActive(b, isActive);
                });
                const lengthLabel = document.getElementById('lbl-line-length');
                const lengthInput = document.getElementById('prop-line-length');
                if (lengthLabel) {
                    lengthLabel.innerText = dir === 'vertical' ? 'LENGTH / 세로 길이 (px)' : 'LENGTH / 가로 길이 (px)';
                }
                if (lengthInput) {
                    lengthInput.setAttribute('data-dir', dir);
                }
            }
            return;
        }

        const styleBtn = e.target.closest('.v4-line-style-btn');
        if (styleBtn) {
            const st = styleBtn.dataset.style;
            ['solid', 'dashed', 'dotted'].forEach(s => {
                const b = document.getElementById('btn-line-style-' + s);
                if (b) highlightActive(b, s === st);
            });
            if (selectedConnectorIds.length > 0 && typeof window.updateSelectedStyle === 'function') {
                const dashVal = st === 'dashed' ? '6 4' : (st === 'dotted' ? '1 5' : '');
                window.updateSelectedStyle({ dashArray: dashVal });
            }
            const iframeWin = (window.DOM && window.DOM.iframe && window.DOM.iframe.contentWindow) || (document.getElementById('main-iframe') || document.getElementById('screen-iframe'))?.contentWindow;
            const target = getActiveLineTarget();
            if (iframeWin && target.id && String(target.id).indexOf('conn_') !== 0) {
                MessageHub.send(iframeWin, 'BYCHOI_UPDATE_STYLE', {
                    id: target.id,
                    ids: target.ids,
                    style: { lineStyle: st }
                });
            }
            return;
        }
    });

    const handleLineEditorInputEvent = (e) => {
        if (e.target.id === 'line-stroke-width') {
            const val = parseFloat(e.target.value) || 1.6;
            const txt = document.getElementById('txt-line-stroke-width');
            if (txt) txt.innerText = val;
            if (selectedConnectorIds.length > 0 && typeof window.updateSelectedStyle === 'function') {
                window.updateSelectedStyle({ strokeWidth: val });
            }
            const iframeWin = (window.DOM && window.DOM.iframe && window.DOM.iframe.contentWindow) || (document.getElementById('main-iframe') || document.getElementById('screen-iframe'))?.contentWindow;
            const target = getActiveLineTarget();
            if (iframeWin && target.id && String(target.id).indexOf('conn_') !== 0) {
                MessageHub.send(iframeWin, 'BYCHOI_UPDATE_STYLE', {
                    id: target.id,
                    ids: target.ids,
                    style: { lineThickness: val }
                });
            }
        } else if (e.target.id === 'line-stroke-color') {
            const val = e.target.value;
            const wrapper = e.target.closest('.v4-color-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
            if (selectedConnectorIds.length > 0 && typeof window.updateSelectedStyle === 'function') {
                window.updateSelectedStyle({ stroke: val });
            }
            const iframeWin = (window.DOM && window.DOM.iframe && window.DOM.iframe.contentWindow) || (document.getElementById('main-iframe') || document.getElementById('screen-iframe'))?.contentWindow;
            const target = getActiveLineTarget();
            if (iframeWin && target.id && String(target.id).indexOf('conn_') !== 0) {
                MessageHub.send(iframeWin, 'BYCHOI_UPDATE_STYLE', {
                    id: target.id,
                    ids: target.ids,
                    style: { lineColor: val }
                });
            }
        } else if (e.target.id === 'line-marker-start' || e.target.id === 'line-marker-end') {
            const isStart = e.target.id === 'line-marker-start';
            const val = e.target.value || '';
            if (selectedConnectorIds.length > 0 && typeof window.updateSelectedStyle === 'function') {
                window.updateSelectedStyle(isStart ? { markerStart: val } : { markerEnd: val });
            }
            const iframeWin = (window.DOM && window.DOM.iframe && window.DOM.iframe.contentWindow) || (document.getElementById('main-iframe') || document.getElementById('screen-iframe'))?.contentWindow;
            const target = getActiveLineTarget();
            if (iframeWin && target.id && String(target.id).indexOf('conn_') !== 0) {
                MessageHub.send(iframeWin, 'BYCHOI_UPDATE_STYLE', {
                    id: target.id,
                    ids: target.ids,
                    style: isStart ? { lineMarkerStart: val } : { lineMarkerEnd: val }
                });
            }
        } else if (e.target.id === 'prop-line-length') {
            const val = parseFloat(e.target.value) || 10;
            const iframeWin = (window.DOM && window.DOM.iframe && window.DOM.iframe.contentWindow) || (document.getElementById('main-iframe') || document.getElementById('screen-iframe'))?.contentWindow;
            const target = getActiveLineTarget();
            if (iframeWin && target.id) {
                const currentDir = e.target.getAttribute('data-dir') || 'horizontal';
                const prop = currentDir === 'vertical' ? 'height' : 'width';
                MessageHub.send(iframeWin, 'BYCHOI_UPDATE_STYLE', {
                    id: target.id,
                    ids: target.ids,
                    style: { [prop]: val + 'px' }
                });
            }
        }
    };

    document.addEventListener('input', handleLineEditorInputEvent);
    document.addEventListener('change', handleLineEditorInputEvent);

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);

    return {
        init, redrawAll, spawnLine, clearSelection, syncAnchoredPositions,
        selectConnector, setSelectedIds, shiftConnectors,
        getSelectedIds: () => selectedConnectorIds,
        deleteSelected: deleteSelectedLine,
        updateSelectedStyle: window.updateSelectedStyle
    };
})();

