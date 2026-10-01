/**
 * vctrl_responsive_smartguide_math.js
 * 
 * [Smart Guide 2.0] Pure Mathematical Raycast & Snapping Coordinate Engine
 * - Calculates 4-directional raycasts, nearest wall padding, and sibling distances.
 * - 100% pure math calculation & target geometry; zero direct SVG rendering.
 * - 100% template-literal safe (no nested backticks).
 */

window.v4ResponsiveSmartGuideMathScript = `
(function() {
    const MAX_WALL_DIST = 600;
    const MAX_NEIGHBOR_DIST = 600;

    const ResponsiveSmartGuideMath = {
        spacingTargets: [],
        activeContext: null,
        lastActiveId: null,

        invalidateTargets: function() {
            this.spacingTargets = [];
            this.lastActiveId = null;
        },

        getPureOffset: function(el, container) {
            if (!el) return { left: 0, top: 0, width: 0, height: 0 };
            if (!container) {
                const ctx = (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.getContainerContext === 'function')
                    ? window.ResponsiveSmartGuide.getContainerContext(el)
                    : null;
                container = ctx ? ctx.inner : null;
            }
            if (container && typeof container.getBoundingClientRect === 'function' && typeof el.getBoundingClientRect === 'function') {
                const cRect = container.getBoundingClientRect();
                const eRect = el.getBoundingClientRect();
                const scale = (cRect.width > 0 && container.offsetWidth > 0) ? (cRect.width / container.offsetWidth) : 1;
                return {
                    left: Math.round(((eRect.left - cRect.left) / scale) + (container.scrollLeft || 0)),
                    top: Math.round(((eRect.top - cRect.top) / scale) + (container.scrollTop || 0)),
                    width: Math.round(eRect.width / scale),
                    height: Math.round(eRect.height / scale)
                };
            }
            let l = parseFloat(el.style && el.style.left);
            if (isNaN(l)) l = el.offsetLeft || 0;
            let t = parseFloat(el.style && el.style.top);
            if (isNaN(t)) t = el.offsetTop || 0;
            let w = el.offsetWidth || parseFloat(el.style && el.style.width) || 100;
            let h = el.offsetHeight || parseFloat(el.style && el.style.height) || 40;
            return { left: l, top: t, width: w, height: h };
        },

        findSnapTargets: function(context, activeEl) {
            if (!context || !context.inner) return;

            this.activeContext = context;
            this.lastActiveId = activeEl ? activeEl.id : null;
            this.spacingTargets = [];

            const containerWidth = context.inner.offsetWidth || (context.type === 'pc' ? 1160 : (context.type === 'canvas' ? 1600 : 360));
            const containerHeight = Math.max(
                context.inner.scrollHeight || (context.type === 'canvas' ? 900 : 810),
                parseInt(context.inner.style && context.inner.style.minHeight) || (context.type === 'canvas' ? 900 : 810),
                context.area ? context.area.clientHeight : (context.type === 'canvas' ? 900 : 810),
                (context.type === 'canvas' ? 900 : 810)
            );

            // Scope query to the active frame/column or root body so that all elements in the column are included
            let rootScope = document.body;
            if (context.type === 'pc') {
                rootScope = context.column || context.inner.closest('.pc-column, .pc-browser-frame') || context.area || context.inner.parentElement || document.body;
            } else if (context.type === 'mobile') {
                rootScope = context.column || context.inner.closest('.mobile-column, .mobile-browser-frame') || context.area || context.inner.parentElement || document.body;
            } else {
                rootScope = context.inner || document.body;
            }
            const components = rootScope.querySelectorAll('.lf-component, .v4-admin-label-cell, .v4-grid-container th.v4-grid-cell, .v4-grid-container td.v4-grid-cell');

            components.forEach((c, idx) => {
                if (c === activeEl || c.classList.contains('dragging-now')) return;
                // Exclude components inside frame columns when calculating on canvas base
                if (context.type === 'canvas' && c.closest('.frame-column, .pc-browser-frame, .mobile-browser-frame')) return;
                // Allow container ancestors to be included as container candidates (excluded from sibling raycast)
                const isAncestor = activeEl && c.contains(activeEl);
                if (activeEl && activeEl.contains(c)) return;

                const pos = this.getPureOffset(c, context.inner);
                const l = pos.left;
                const t = pos.top;
                const shapeLine = c.querySelector('.v4-shape-line') || (c.classList.contains('v4-shape-line') ? c : null);
                const isLineShape = !!shapeLine;
                const lineDir = isLineShape ? (shapeLine.getAttribute('data-line-dir') || (pos.width >= pos.height ? 'horizontal' : 'vertical')) : null;

                const w = pos.width || c.offsetWidth || parseFloat(c.style.width) || (isLineShape ? 100 : 100);
                const h = pos.height || c.offsetHeight || parseFloat(c.style.height) || (isLineShape ? 2 : 40);
                if (isLineShape) {
                    if (w < 1 || h < 1 || (w < 4 && h < 4)) return;
                } else {
                    if (w < 10 || h < 10) return;
                }
                const isGridCell = c.classList.contains('v4-grid-cell');
                const name = c.id ? c.id.replace('v4-comp-', 'Comp ') : (isGridCell ? ((c.tagName.toLowerCase() === 'th' ? 'Col ' : 'Cell ') + (idx + 1)) : ('Item ' + (idx + 1)));

                const isTable = c.classList.contains('v4-admin-settings-container') || !!c.querySelector('.v4-admin-settings-table') || c.classList.contains('v4-grid-container') || !!c.querySelector('.v4-grid-container');

                if (context.type === 'mobile-frame' && context.frameBounds) {
                    const cCenterX = l + w / 2;
                    if (cCenterX < context.frameBounds.left - 40 || cCenterX > context.frameBounds.right + 40) {
                        return;
                    }
                }

                this.spacingTargets.push({
                    id: c.id || ('comp-' + idx),
                    label: name,
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: l + w,
                    bottom: t + h,
                    isWall: false,
                    isAncestor: isAncestor,
                    isTableContainer: isTable,
                    isGridCell: isGridCell,
                    isLine: isLineShape,
                    lineDir: lineDir
                });
            });

            // Register Virtual Row Containers for multi-row tables (e.g., Query Item .v4-admin-row & Grid UI tr)
            const rows = rootScope.querySelectorAll('.v4-admin-settings-table .v4-admin-row, .v4-grid-container table thead tr, .v4-grid-container table tbody tr');
            rows.forEach((row, rIdx) => {
                if (row === activeEl) return;
                if (context.type === 'canvas' && row.closest('.frame-column, .pc-browser-frame, .mobile-browser-frame')) return;
                const pos = this.getPureOffset(row, context.inner);
                const l = pos.left;
                const t = pos.top;
                const w = pos.width || row.offsetWidth || parseFloat(row.style.width) || 100;
                const h = pos.height || row.offsetHeight || parseFloat(row.style.height) || 36;
                if (w < 10 || h < 5) return;

                const parentComp = row.closest('.lf-component');
                const tableId = parentComp ? parentComp.id : ('table-' + rIdx);
                const isAncestor = activeEl ? row.contains(activeEl) : false;

                if (context.type === 'mobile-frame' && context.frameBounds) {
                    const rCenterX = l + w / 2;
                    if (rCenterX < context.frameBounds.left - 40 || rCenterX > context.frameBounds.right + 40) {
                        return;
                    }
                }

                this.spacingTargets.push({
                    id: row.id || ('v4-row-' + rIdx),
                    label: 'Row ' + (rIdx + 1),
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: l + w,
                    bottom: t + h,
                    isWall: false,
                    isRowContainer: true,
                    tableId: tableId,
                    isAncestor: isAncestor
                });
            });

            // When in canvas base context, register outer frame boundaries and flow divider
            if (context.type === 'canvas') {
                const boundaryCols = document.querySelectorAll('.frame-column, .flow-arrow-divider, .compare-header');
                boundaryCols.forEach((col, cIdx) => {
                    const pos = this.getPureOffset(col, context.inner);
                    const l = pos.left;
                    const t = pos.top;
                    const w = pos.width || col.offsetWidth || 0;
                    const h = pos.height || col.offsetHeight || 0;
                    if (w > 10 && h > 10) {
                        const label = col.classList.contains('flow-arrow-divider') ? 'Flow Arrow' : (col.getAttribute('data-frame-id') ? ('Frame ' + col.getAttribute('data-frame-id').toUpperCase()) : ('Frame ' + (cIdx + 1)));
                        this.spacingTargets.push({
                            id: col.id || ('base-target-' + cIdx),
                            label: label,
                            left: l,
                            top: t,
                            width: w,
                            height: h,
                            right: l + w,
                            bottom: t + h,
                            isWall: false,
                            isAncestor: false,
                            isFrameBoundary: true
                        });
                    }
                });
            }
        },

        calculateSpacing: function(x, y, w, h, activeId) {
            const containerWidth = (this.activeContext && this.activeContext.inner) ? (this.activeContext.inner.offsetWidth || (this.activeContext.type === 'canvas' ? 1600 : 1160)) : 1600;
            const containerHeight = (this.activeContext && this.activeContext.inner) ? Math.max(
                this.activeContext.inner.scrollHeight || (this.activeContext.type === 'canvas' ? 900 : 810),
                parseInt(this.activeContext.inner.style && this.activeContext.inner.style.minHeight) || (this.activeContext.type === 'canvas' ? 900 : 810),
                (this.activeContext.type === 'canvas' ? 900 : 810)
            ) : 900;

            const active = {
                left: x,
                top: y,
                right: x + w,
                bottom: y + h,
                width: w,
                height: h,
                centerX: x + w / 2,
                centerY: y + h / 2
            };

            // 1. Direct Enclosing Container Detection (Figma Style)
            let container = null;
            let minContainerArea = Infinity;

            for (let i = 0; i < this.spacingTargets.length; i++) {
                const t = this.spacingTargets[i];
                if (activeId && t.id === activeId) continue;
                if (t.isGridCell) continue;
                if (t.isLine) continue;
                if (!t.width || !t.height) continue;

                const isEdgeContained = (
                    t.left <= active.left + 6 &&
                    t.right >= active.right - 6 &&
                    t.top <= active.top + 6 &&
                    t.bottom >= active.bottom - 6 &&
                    (t.width > active.width + 4 || t.height > active.height + 4)
                );
                const isCenterContained = (
                    t.left <= active.centerX &&
                    t.right >= active.centerX &&
                    t.top <= active.centerY &&
                    t.bottom >= active.centerY &&
                    t.width >= active.width &&
                    t.height >= active.height &&
                    (t.width > active.width + 4 || t.height > active.height + 4)
                );

                if (isEdgeContained || isCenterContained) {
                    let area = t.width * t.height;
                    if (t.isRowContainer) {
                        area = area * 0.1;
                    }
                    if (area < minContainerArea) {
                        minContainerArea = area;
                        container = t;
                    }
                }
            }

            // Fallback to frame if no component container found
            if (!container) {
                if (this.activeContext && this.activeContext.type === 'mobile-frame' && this.activeContext.frameBounds) {
                    const fb = this.activeContext.frameBounds;
                    container = {
                        id: 'mobile-frame-' + (this.activeContext.frameIndex || 0) + '-bounds',
                        label: 'Mobile Frame',
                        left: fb.left,
                        top: fb.top,
                        right: fb.right,
                        bottom: fb.bottom,
                        width: fb.width,
                        height: fb.height,
                        isFrame: true
                    };
                } else {
                    container = {
                        id: (this.activeContext ? this.activeContext.type : 'frame') + '-bounds',
                        label: 'Frame',
                        left: 0,
                        top: 0,
                        right: containerWidth,
                        bottom: containerHeight,
                        width: containerWidth,
                        height: containerHeight,
                        isFrame: true
                    };
                }
            }

            // 2. Base Distances: Inner Padding to Container 4 Walls
            const distLeftToWall = Math.max(0, Math.round(active.left - container.left));
            const distRightToWall = Math.max(0, Math.round(container.right - active.right));
            const distTopToWall = Math.max(0, Math.round(active.top - container.top));
            const distBottomToWall = Math.max(0, Math.round(container.bottom - active.bottom));

            const maxWallThresh = container.isFrame ? MAX_WALL_DIST : Infinity;
            const minPadding = 0;

            let leftMatch = (distLeftToWall >= minPadding && distLeftToWall <= maxWallThresh) ? { target: container, dist: distLeftToWall, isInner: true } : null;
            let rightMatch = (distRightToWall >= minPadding && distRightToWall <= maxWallThresh) ? { target: container, dist: distRightToWall, isInner: true } : null;
            let topMatch = (distTopToWall >= minPadding && distTopToWall <= maxWallThresh) ? { target: container, dist: distTopToWall, isInner: true } : null;
            let bottomMatch = (distBottomToWall >= minPadding && distBottomToWall <= maxWallThresh) ? { target: container, dist: distBottomToWall, isInner: true } : null;

            // 3. Sibling Raycast
            const overlapBufferY = 16;
            const overlapBufferX = 24;

            for (let i = 0; i < this.spacingTargets.length; i++) {
                const t = this.spacingTargets[i];
                if (activeId && t.id === activeId) continue;
                if (t.id === container.id) continue;
                if (t.isAncestor) continue;

                if (container.isRowContainer) {
                    if (t.isRowContainer || t.id === container.tableId || t.isTableContainer) continue;
                }

                const effBufferY = (active.height <= 4 || (t.isLine && t.lineDir === 'horizontal')) ? Math.max(overlapBufferY, 30) : overlapBufferY;
                const effBufferX = (active.width <= 4 || (t.isLine && t.lineDir === 'vertical')) ? Math.max(overlapBufferX, 30) : overlapBufferX;

                // Leftward Raycast
                if (t.right <= active.left + 0.5) {
                    const hasOverlapY = !(t.bottom < active.top - effBufferY || t.top > active.bottom + effBufferY);
                    if (hasOverlapY) {
                        const dist = Math.max(0, Math.round(active.left - t.right));
                        if (dist <= MAX_NEIGHBOR_DIST) {
                            if (!leftMatch || dist < leftMatch.dist) {
                                leftMatch = { target: t, dist: dist, isInner: false };
                            }
                        }
                    }
                }

                // Rightward Raycast
                if (t.left >= active.right - 0.5) {
                    const hasOverlapY = !(t.bottom < active.top - effBufferY || t.top > active.bottom + effBufferY);
                    if (hasOverlapY) {
                        const dist = Math.max(0, Math.round(t.left - active.right));
                        if (dist <= MAX_NEIGHBOR_DIST) {
                            if (!rightMatch || dist < rightMatch.dist) {
                                rightMatch = { target: t, dist: dist, isInner: false };
                            }
                        }
                    }
                }

                // Upward Raycast
                if (!container.isRowContainer) {
                    if (t.bottom <= active.top + 0.5) {
                        const hasOverlapX = !(t.right < active.left - effBufferX || t.left > active.right + effBufferX);
                        if (hasOverlapX) {
                            const dist = Math.max(0, Math.round(active.top - t.bottom));
                            if (dist <= MAX_NEIGHBOR_DIST) {
                                if (!topMatch || dist < topMatch.dist) {
                                    topMatch = { target: t, dist: dist, isInner: false };
                                }
                            }
                        }
                    }
                }

                // Downward Raycast
                if (!container.isRowContainer) {
                    if (t.top >= active.bottom - 0.5) {
                        const hasOverlapX = !(t.right < active.left - effBufferX || t.left > active.right + effBufferX);
                        if (hasOverlapX) {
                            const dist = Math.max(0, Math.round(t.top - active.bottom));
                            if (dist <= MAX_NEIGHBOR_DIST) {
                                if (!bottomMatch || dist < bottomMatch.dist) {
                                    bottomMatch = { target: t, dist: dist, isInner: false };
                                }
                            }
                        }
                    }
                }
            }

            // 4. Equal Spacing Detection
            let isEqualH = false;
            if (leftMatch && rightMatch) {
                if (Math.abs(leftMatch.dist - rightMatch.dist) <= 1) isEqualH = true;
            }
            let isEqualV = false;
            if (topMatch && bottomMatch) {
                if (Math.abs(topMatch.dist - bottomMatch.dist) <= 1) isEqualV = true;
            }

            return {
                leftMatch: leftMatch,
                rightMatch: rightMatch,
                topMatch: topMatch,
                bottomMatch: bottomMatch,
                isEqualH: isEqualH,
                isEqualV: isEqualV,
                active: active,
                containerWidth: containerWidth,
                containerHeight: containerHeight
            };
        },

        calculateSnap: function(x, y, w, h, isArrowKey, activeId) {
            if (w === undefined) w = 0;
            if (h === undefined) h = 0;

            const spacing = this.calculateSpacing(x, y, w, h, activeId);

            let snapX = x;
            let snapY = y;
            let snapXData = null;
            let snapYData = null;

            if (!isArrowKey && this.activeContext) {
                const SNAP_THRESH = 5;
                const active = {
                    left: x,
                    top: y,
                    right: x + w,
                    bottom: y + h,
                    width: w,
                    height: h,
                    centerX: x + w / 2,
                    centerY: y + h / 2
                };

                let bestDiffX = SNAP_THRESH + 1;
                let bestDiffY = SNAP_THRESH + 1;

                // 1. Sibling Alignment Snapping
                for (let i = 0; i < this.spacingTargets.length; i++) {
                    const t = this.spacingTargets[i];
                    if (activeId && t.id === activeId) continue;
                    if (t.isGridCell) continue;
                    if (!t.width || !t.height) continue;

                    // X-axis alignment
                    let d = Math.abs(active.left - t.left);
                    if (d < bestDiffX) {
                        bestDiffX = d;
                        snapX = t.left;
                        snapXData = { snapped: true, x: snapX, target: t, type: 'left-left', lineX: t.left };
                    }
                    d = Math.abs(active.centerX - t.centerX);
                    if (d < bestDiffX) {
                        bestDiffX = d;
                        snapX = Math.round(t.centerX - w / 2);
                        snapXData = { snapped: true, x: snapX, target: t, type: 'center-center', lineX: t.centerX };
                    }
                    d = Math.abs(active.right - t.right);
                    if (d < bestDiffX) {
                        bestDiffX = d;
                        snapX = t.right - w;
                        snapXData = { snapped: true, x: snapX, target: t, type: 'right-right', lineX: t.right };
                    }
                    d = Math.abs(active.left - t.right);
                    if (d < bestDiffX) {
                        bestDiffX = d;
                        snapX = t.right;
                        snapXData = { snapped: true, x: snapX, target: t, type: 'left-right', lineX: t.right };
                    }
                    d = Math.abs(active.right - t.left);
                    if (d < bestDiffX) {
                        bestDiffX = d;
                        snapX = t.left - w;
                        snapXData = { snapped: true, x: snapX, target: t, type: 'right-left', lineX: t.left };
                    }

                    // Y-axis alignment
                    d = Math.abs(active.top - t.top);
                    if (d < bestDiffY) {
                        bestDiffY = d;
                        snapY = t.top;
                        snapYData = { snapped: true, y: snapY, target: t, type: 'top-top', lineY: t.top };
                    }
                    d = Math.abs(active.centerY - t.centerY);
                    if (d < bestDiffY) {
                        bestDiffY = d;
                        snapY = Math.round(t.centerY - h / 2);
                        snapYData = { snapped: true, y: snapY, target: t, type: 'middle-middle', lineY: t.centerY };
                    }
                    d = Math.abs(active.bottom - t.bottom);
                    if (d < bestDiffY) {
                        bestDiffY = d;
                        snapY = t.bottom - h;
                        snapYData = { snapped: true, y: snapY, target: t, type: 'bottom-bottom', lineY: t.bottom };
                    }
                    d = Math.abs(active.top - t.bottom);
                    if (d < bestDiffY) {
                        bestDiffY = d;
                        snapY = t.bottom;
                        snapYData = { snapped: true, y: snapY, target: t, type: 'top-bottom', lineY: t.bottom };
                    }
                    d = Math.abs(active.bottom - t.top);
                    if (d < bestDiffY) {
                        bestDiffY = d;
                        snapY = t.top - h;
                        snapYData = { snapped: true, y: snapY, target: t, type: 'bottom-top', lineY: t.top };
                    }
                }

                // 2. Container/Frame Center Snapping (fallback)
                if (!snapXData) {
                    if (this.activeContext.type === 'mobile-frame' && this.activeContext.frameBounds) {
                        const fb = this.activeContext.frameBounds;
                        const idealCenterX = Math.round(fb.left + (fb.width - w) / 2);
                        if (Math.abs(x - idealCenterX) <= 5) {
                            snapX = idealCenterX;
                            snapXData = { snapped: true, x: idealCenterX, lineX: idealCenterX + w / 2, isCanvasCenter: true };
                        }
                    } else if (this.activeContext.type === 'canvas') {
                        const idealCenterX = Math.round((1600 - w) / 2);
                        if (Math.abs(x - idealCenterX) <= 5) {
                            snapX = idealCenterX;
                            snapXData = { snapped: true, x: idealCenterX, lineX: 800, isCanvasCenter: true };
                        }
                    }
                }
                if (!snapYData) {
                    if (this.activeContext.type === 'canvas') {
                        const idealCenterY = Math.round((900 - h) / 2);
                        if (Math.abs(y - idealCenterY) <= 5) {
                            snapY = idealCenterY;
                            snapYData = { snapped: true, y: idealCenterY, lineY: 450, isCanvasCenter: true };
                        }
                    }
                }
            }

            return {
                x: snapX,
                y: snapY,
                snapXData: snapXData,
                snapYData: snapYData,
                spacing: spacing
            };
        },

        calculatePairSpacing: function(activeEl, targetEl, ctx) {
            if (!activeEl || !targetEl || !ctx || !ctx.inner) return null;
            const aPos = this.getPureOffset(activeEl, ctx.inner);
            const bPos = this.getPureOffset(targetEl, ctx.inner);

            const aLine = activeEl.querySelector('.v4-shape-line') || (activeEl.classList.contains('v4-shape-line') ? activeEl : null);
            const bLine = targetEl.querySelector('.v4-shape-line') || (targetEl.classList.contains('v4-shape-line') ? targetEl : null);

            const a = {
                left: aPos.left,
                top: aPos.top,
                width: aPos.width || (aLine ? 2 : 100),
                height: aPos.height || (aLine ? 2 : 40),
                right: aPos.left + (aPos.width || (aLine ? 2 : 100)),
                bottom: aPos.top + (aPos.height || (aLine ? 2 : 40))
            };
            a.centerX = a.left + a.width / 2;
            a.centerY = a.top + a.height / 2;

            const b = {
                left: bPos.left,
                top: bPos.top,
                width: bPos.width || (bLine ? 2 : 100),
                height: bPos.height || (bLine ? 2 : 40),
                right: bPos.left + (bPos.width || (bLine ? 2 : 100)),
                bottom: bPos.top + (bPos.height || (bLine ? 2 : 40))
            };
            b.centerX = b.left + b.width / 2;
            b.centerY = b.top + b.height / 2;

            const cWidth = ctx.inner.offsetWidth || (ctx.type === 'canvas' ? 1600 : 1160);
            const cHeight = Math.max(ctx.inner.scrollHeight || 900, 900);

            // Check if B encloses A (Container padding)
            const bEnclosesA = (b.left <= a.left + 2 && b.right >= a.right - 2 && b.top <= a.top + 2 && b.bottom >= a.bottom - 2 && (b.width > a.width + 4 || b.height > a.height + 4));
            // Check if A encloses B
            const aEnclosesB = (a.left <= b.left + 2 && a.right >= b.right - 2 && a.top <= b.top + 2 && a.bottom >= b.bottom - 2 && (a.width > b.width + 4 || a.height > b.height + 4));

            if (bEnclosesA || aEnclosesB) {
                const outer = bEnclosesA ? b : a;
                const inner = bEnclosesA ? a : b;
                return {
                    type: 'container',
                    targetRect: b,
                    left: Math.max(0, Math.round(inner.left - outer.left)),
                    right: Math.max(0, Math.round(outer.right - inner.right)),
                    top: Math.max(0, Math.round(inner.top - outer.top)),
                    bottom: Math.max(0, Math.round(outer.bottom - inner.bottom)),
                    activeRect: a,
                    cWidth: cWidth,
                    cHeight: cHeight
                };
            }

            // Disjoint or Adjacent Sibling Relation
            let hMatch = null;
            let vMatch = null;

            // Horizontal relative position
            if (b.right <= a.left) {
                hMatch = {
                    side: 'left',
                    dist: Math.max(0, Math.round(a.left - b.right)),
                    x1: b.right,
                    x2: a.left
                };
            } else if (b.left >= a.right) {
                hMatch = {
                    side: 'right',
                    dist: Math.max(0, Math.round(b.left - a.right)),
                    x1: a.right,
                    x2: b.left
                };
            } else {
                const overlapLeft = Math.max(a.left, b.left);
                const overlapRight = Math.min(a.right, b.right);
                hMatch = {
                    side: 'overlap',
                    dist: 0,
                    x1: overlapLeft,
                    x2: overlapRight
                };
            }

            // Vertical relative position
            if (b.bottom <= a.top) {
                vMatch = {
                    side: 'top',
                    dist: Math.max(0, Math.round(a.top - b.bottom)),
                    y1: b.bottom,
                    y2: a.top
                };
            } else if (b.top >= a.bottom) {
                vMatch = {
                    side: 'bottom',
                    dist: Math.max(0, Math.round(b.top - a.bottom)),
                    y1: a.bottom,
                    y2: b.top
                };
            } else {
                const overlapTop = Math.max(a.top, b.top);
                const overlapBottom = Math.min(a.bottom, b.bottom);
                vMatch = {
                    side: 'overlap',
                    dist: 0,
                    y1: overlapTop,
                    y2: overlapBottom
                };
            }

            return {
                type: 'sibling',
                targetRect: b,
                activeRect: a,
                hMatch: hMatch,
                vMatch: vMatch,
                cWidth: cWidth,
                cHeight: cHeight
            };
        },

        collectSnapTargets: function() {
            const targets = [];
            const rects = [];
            document.querySelectorAll('.lf-component:not(.selected)').forEach(c => {
                const l = parseFloat(c.style.left) || 0;
                const t = parseFloat(c.style.top) || 0;
                const shapeLine = c.querySelector('.v4-shape-line') || (c.classList.contains('v4-shape-line') ? c : null);
                const isLine = !!shapeLine;
                const lineDir = isLine ? (shapeLine.getAttribute('data-line-dir') || (c.offsetWidth >= c.offsetHeight ? 'horizontal' : 'vertical')) : null;
                const w = c.offsetWidth || (isLine ? 2 : 100);
                const h = c.offsetHeight || (isLine ? 2 : 40);
                if (isLine) {
                    if (w < 1 || h < 1 || (w < 4 && h < 4)) return;
                }
                const name = c.id.replace('v4-comp-', 'Comp ');
                targets.push({ x: l, label: name, part: 'Left', type: 'h' });
                targets.push({ x: l + w / 2, label: name, part: 'Center', type: 'h' });
                targets.push({ x: l + w, label: name, part: 'Right', type: 'h' });
                targets.push({ y: t, label: name, part: 'Top', type: 'v' });
                targets.push({ y: t + h / 2, label: name, part: 'Middle', type: 'v' });
                targets.push({ y: t + h, label: name, part: 'Bottom', type: 'v' });
                
                const isTable = c.classList.contains('v4-admin-settings-container') || !!c.querySelector('.v4-admin-settings-table') || c.classList.contains('v4-grid-container') || !!c.querySelector('.v4-grid-container');
                
                rects.push({
                    id: c.id,
                    label: name,
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: l + w,
                    bottom: t + h,
                    isTableContainer: isTable,
                    isLine: isLine,
                    lineDir: lineDir
                });
            });

            // Virtual row containers for multi-row tables (Query Item & Grid UI)
            document.querySelectorAll('.v4-admin-settings-table .v4-admin-row, .v4-grid-container table thead tr, .v4-grid-container table tbody tr').forEach((row, rIdx) => {
                const parentComp = row.closest('.lf-component');
                if (!parentComp) return;
                const parentLeft = parseFloat(parentComp.style.left) || 0;
                const parentTop = parseFloat(parentComp.style.top) || 0;
                const cRect = parentComp.getBoundingClientRect();
                const rRect = row.getBoundingClientRect();
                const l = parentLeft + (rRect.left - cRect.left);
                const t = parentTop + (rRect.top - cRect.top);
                const w = rRect.width || row.offsetWidth;
                const h = rRect.height || row.offsetHeight;
                if (w < 10 || h < 5) return;
                const tableId = parentComp.id || ('table-' + rIdx);

                rects.push({
                    id: row.id || ('v4-row-' + rIdx),
                    label: 'Row ' + (rIdx + 1),
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: l + w,
                    bottom: t + h,
                    isRowContainer: true,
                    tableId: tableId
                });
            });

            // Grid UI Cells for column line distances
            document.querySelectorAll('.v4-grid-container th.v4-grid-cell, .v4-grid-container td.v4-grid-cell').forEach((cell, cIdx) => {
                const parentComp = cell.closest('.lf-component');
                if (!parentComp) return;
                const parentLeft = parseFloat(parentComp.style.left) || 0;
                const parentTop = parseFloat(parentComp.style.top) || 0;
                const cRect = parentComp.getBoundingClientRect();
                const cellRect = cell.getBoundingClientRect();
                const l = parentLeft + (cellRect.left - cRect.left);
                const t = parentTop + (cellRect.top - cRect.top);
                const w = cellRect.width || cell.offsetWidth;
                const h = cellRect.height || cell.offsetHeight;
                if (w < 10 || h < 10) return;

                const isTh = cell.tagName.toLowerCase() === 'th';
                rects.push({
                    id: cell.id || ('grid-cell-' + cIdx),
                    label: (isTh ? 'Col ' : 'Cell ') + (cIdx + 1),
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: l + w,
                    bottom: t + h,
                    isGridCell: true
                });
            });

            document.querySelectorAll('.mobile-frame').forEach((f, idx) => {
                const content = f.querySelector('.mobile-content');
                if (content) {
                    const rect = content.getBoundingClientRect();
                    const scrollX = window.scrollX || 0;
                    const scrollY = window.scrollY || 0;
                    const l = rect.left + scrollX;
                    const t = rect.top + scrollY;
                    const w = rect.width;
                    const h = rect.height;
                    
                    const sName = 'UI Area ' + (idx + 1);
                    const bezel = 0;
                    
                    const leftVal = l + bezel;
                    const rightVal = l + w - bezel;
                    const topVal = t + bezel;
                    const bottomVal = t + h - bezel;
                    
                    targets.push({ x: leftVal, label: sName, part: 'Left', type: 'h' });
                    targets.push({ x: rightVal, label: sName, part: 'Right', type: 'h' });
                    targets.push({ y: topVal, label: sName, part: 'Top', type: 'v' });
                    targets.push({ y: bottomVal, label: sName, part: 'Bottom', type: 'v' });
                    targets.push({ x: l + w / 2, label: sName, part: 'Center', type: 'h' });
                    targets.push({ y: t + h / 2, label: sName, part: 'Middle', type: 'v' });

                    const frameIdStr = 'mobile-frame-' + idx;
                    rects.push({
                        id: frameIdStr + '-left',
                        label: sName + ' Left',
                        left: leftVal,
                        top: topVal,
                        width: 0,
                        height: h,
                        right: leftVal,
                        bottom: bottomVal,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                    rects.push({
                        id: frameIdStr + '-right',
                        label: sName + ' Right',
                        left: rightVal,
                        top: topVal,
                        width: 0,
                        height: h,
                        right: rightVal,
                        bottom: bottomVal,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                    rects.push({
                        id: frameIdStr + '-top',
                        label: sName + ' Top',
                        left: leftVal,
                        top: topVal,
                        width: w,
                        height: 0,
                        right: rightVal,
                        bottom: topVal,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                    rects.push({
                        id: frameIdStr + '-bottom',
                        label: sName + ' Bottom',
                        left: leftVal,
                        top: bottomVal,
                        width: w,
                        height: 0,
                        right: rightVal,
                        bottom: bottomVal,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                }
            });

            document.querySelectorAll('.pc-browser-frame, .chrome-browser').forEach((f, idx) => {
                const content = f.querySelector('.pc-content-area, .chrome-content-area') || f;
                if (content) {
                    const rect = content.getBoundingClientRect();
                    const scrollX = window.scrollX || 0;
                    const scrollY = window.scrollY || 0;
                    const l = rect.left + scrollX;
                    const t = rect.top + scrollY;
                    const w = rect.width;
                    const h = rect.height;
                    const sName = 'PC Web Area ' + (idx + 1);
                    
                    targets.push({ x: l, label: sName, part: 'Left', type: 'h' });
                    targets.push({ x: l + w, label: sName, part: 'Right', type: 'h' });
                    targets.push({ y: t, label: sName, part: 'Top', type: 'v' });
                    targets.push({ y: t + h, label: sName, part: 'Bottom', type: 'v' });
                    targets.push({ x: l + w / 2, label: sName, part: 'Center', type: 'h' });
                    targets.push({ y: t + h / 2, label: sName, part: 'Middle', type: 'v' });

                    const frameIdStr = 'pc-frame-' + idx;
                    rects.push({
                        id: frameIdStr + '-left',
                        label: sName + ' Left',
                        left: l,
                        top: t,
                        width: 0,
                        height: h,
                        right: l,
                        bottom: t + h,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                    rects.push({
                        id: frameIdStr + '-right',
                        label: sName + ' Right',
                        left: l + w,
                        top: t,
                        width: 0,
                        height: h,
                        right: l + w,
                        bottom: t + h,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                    rects.push({
                        id: frameIdStr + '-top',
                        label: sName + ' Top',
                        left: l,
                        top: t,
                        width: w,
                        height: 0,
                        right: l + w,
                        bottom: t,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                    rects.push({
                        id: frameIdStr + '-bottom',
                        label: sName + ' Bottom',
                        left: l,
                        top: t + h,
                        width: w,
                        height: 0,
                        right: l + w,
                        bottom: t + h,
                        isFrameBoundary: true,
                        frameId: frameIdStr
                    });
                }
            });

            // Add snapping targets for Query Item (Admin Settings) rows & inner cells
            document.querySelectorAll('.v4-admin-settings-container').forEach(container => {
                const comp = container.closest('.lf-component');
                if (!comp || comp.classList.contains('selected')) return;

                const compRect = comp.getBoundingClientRect();
                const scrollX = window.scrollX || 0;
                const scrollY = window.scrollY || 0;

                container.querySelectorAll('.v4-admin-row').forEach((row, rIdx) => {
                    const rowRect = row.getBoundingClientRect();
                    const rowTop = rowRect.top + scrollY;
                    const rowHeight = rowRect.height;
                    const rowYCenter = rowTop + rowHeight / 2;

                    targets.push({ id: comp.id, y: rowYCenter, label: 'Row ' + (rIdx + 1), part: 'Middle', type: 'v' });

                    const contentCells = row.querySelectorAll('.v4-admin-content-cell');

                    contentCells.forEach((cell, cIdx) => {
                        const cellRect = cell.getBoundingClientRect();
                        const cellLeft = cellRect.left + scrollX;
                        const snapX = cellLeft + 10;

                        targets.push({ id: comp.id, x: snapX, label: 'Row ' + (rIdx + 1) + ' Col ' + (cIdx + 1) + ' Start', part: 'Left', type: 'h' });
                    });
                });
            });

            return { targets: targets, rects: rects };
        }
    };

    window.ResponsiveSmartGuideMath = ResponsiveSmartGuideMath;
})();
`;
