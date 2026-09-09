/**
 * vctrl_smartguide.js
 * Independent module for Smart Guide (Snapping) System.
 * Handles calculation, target discovery (async), and guide rendering.
 */

(function() {
    console.log("%c [SMART GUIDE] Module Loaded ", "background: #ff4757; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    window.SmartGuide = {
        targets: [],
        spacingTargets: [], // Spacing용 컴포넌트 전체 Bounding Box
        threshold: 5,
        spacingThreshold: 50, // 50px 간격 임계값
        activeLines: { x: null, y: null },
        clearTimer: null,
        selectionTimer: null,
        pendingSelection: null,

        /**
         * Collects snapping targets and spacing targets from canvas and requests from iframe.
         */
        findSnapTargets() {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            const DOM = window.DOM;
            // Clean up any residual guide lines immediately when re-warm/discovery happens without active selection
            if (DOM && DOM.guideLayer && !this.selectionTimer) {
                DOM.guideLayer.innerHTML = '';
            }
            if (!DOM || !DOM.iframe) return;

            const cw = parseInt(DOM.iframe.style.width) || 1600;
            const ch = parseInt(DOM.iframe.style.height) || 900;

            // 기존 targets 중 iframe이 아닌 로컬(Canvas, Pin 등) 요소만 리셋하고, 비동기 응답 도착 전까지 iframe targets는 보존하여 레이턴시 해결
            const otherTargets = this.targets.filter(t => t.source === 'iframe');
            this.targets = [...otherTargets];

            // 1. Canvas Center & Edges (for snapping)
            this.targets.push({ x: 0, label: 'Canvas', part: 'Left', type: 'h' });
            this.targets.push({ x: cw / 2, label: 'Canvas', part: 'Center', type: 'h' });
            this.targets.push({ x: cw, label: 'Canvas', part: 'Right', type: 'h' });
            this.targets.push({ y: 0, label: 'Canvas', part: 'Top', type: 'v' });
            this.targets.push({ y: ch / 2, label: 'Canvas', part: 'Middle', type: 'v' });
            this.targets.push({ y: ch, label: 'Canvas', part: 'Bottom', type: 'v' });

            // 1-2. 가상의 Bounding Box로 캔버스 테두리 스페이싱 타겟 정의 (기존 iframe spacingTargets 보존)
            const otherSpacing = this.spacingTargets.filter(t => t.source === 'iframe');
            this.spacingTargets = [
                ...otherSpacing,
                { id: 'canvas-left', label: 'Canvas', left: -1, top: 0, right: 0, bottom: ch, width: 1, height: ch },
                { id: 'canvas-right', label: 'Canvas', left: cw, top: 0, right: cw + 1, bottom: ch, width: 1, height: ch },
                { id: 'canvas-top', label: 'Canvas', left: 0, top: -1, right: cw, bottom: 0, width: cw, height: 1 },
                { id: 'canvas-bottom', label: 'Canvas', left: 0, top: ch, right: cw, bottom: ch + 1, width: cw, height: 1 }
            ];

            // 2. Local Pins & Text Markers (Parent Layer)
            if (DOM.pinsLayer) {
                const pins = DOM.pinsLayer.querySelectorAll('.pin-marker, .text-marker');
                pins.forEach((p, idx) => {
                    if (p.classList.contains('dragging-now')) return;
                    const l = p.style.left || '';
                    const t = p.style.top || '';
                    const x = l.includes('%') ? (parseFloat(l) / 100) * cw : parseFloat(l) || 0;
                    const y = t.includes('%') ? (parseFloat(t) / 100) * ch : parseFloat(t) || 0;
                    const name = p.classList.contains('text-marker') ? 'Text' : `Pin ${p.innerText}`;
                    
                    // Snapping targets
                    this.targets.push({ x, label: name, part: 'Center', type: 'h' });
                    this.targets.push({ y, label: name, part: 'Center', type: 'v' });

                    // Spacing targets
                    this.spacingTargets.push({
                        id: `pin-local-${idx}`,
                        label: name,
                        left: x,
                        top: y,
                        width: 20, // Pin 기준 크기
                        height: 20,
                        right: x + 20,
                        bottom: y + 20
                    });
                });
            }

            // 3. Request Component Targets from Iframe (Asynchronous)
            if (DOM.iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REQUEST_SNAP_TARGETS');
            }

            if (window.DEBUG_MODE) {
                console.log(`[SmartGuide] Local targets collected: snap=${this.targets.length}, spacing=${this.spacingTargets.length}`);
            }
        },

        /**
         * Merges targets received from Iframe.
         */
        handleIframeTargets(data) {
            if (!data) return;
            
            // 1. Snapping targets merge
            if (data.targets) {
                const iframeTargets = data.targets.map(t => ({
                    ...t,
                    source: 'iframe'
                }));
                const otherTargets = this.targets.filter(t => t.source !== 'iframe');
                this.targets = [...otherTargets, ...iframeTargets];
            }

            // 2. Spacing targets merge
            if (data.rects) {
                const iframeSpacing = data.rects.map(r => ({
                    ...r,
                    source: 'iframe'
                }));
                const otherSpacing = this.spacingTargets.filter(t => t.source !== 'iframe');
                this.spacingTargets = [...otherSpacing, ...iframeSpacing];
            }
            
            if (window.DEBUG_MODE) {
                console.log(`[SmartGuide] Total targets synchronized: snap=${this.targets.length}, spacing=${this.spacingTargets.length}`);
            }

            if (this.pendingSelection) {
                const s = this.pendingSelection;
                const snap = this.calculateSnap(s.x, s.y, s.w, s.h, false, s.activeId);
                this.drawGuides(snap);
            }
        },

        /**
         * Spacing calculation logic (Within 50px threshold to closest targets)
         */
        calculateSpacing(x, y, w, h, thresh, activeId = null) {
            // isArrowKey mode: thresh passed as Infinity to show nearest regardless of distance
            // Default mode: use spacingThreshold (50px)
            if (thresh === undefined) thresh = this.spacingThreshold;
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
                if (t.isFrameBoundary || t.source === 'canvas') continue;
                if (activeId && t.id === activeId) continue;
                if (t.isGridCell) continue;
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

            const DOM = window.DOM;
            const cw = (DOM && DOM.iframe) ? (parseInt(DOM.iframe.style.width) || 1600) : 1600;
            const ch = (DOM && DOM.iframe) ? (parseInt(DOM.iframe.style.height) || 900) : 900;

            if (!container) {
                container = {
                    id: 'canvas-bounds',
                    label: 'Canvas',
                    left: 0,
                    top: 0,
                    right: cw,
                    bottom: ch,
                    width: cw,
                    height: ch,
                    isFrameBoundary: true
                };
            }

            // 2. Base Distances: Inner Padding to Container 4 Walls
            const distLeftToWall = Math.max(0, Math.round(active.left - container.left));
            const distRightToWall = Math.max(0, Math.round(container.right - active.right));
            const distTopToWall = Math.max(0, Math.round(active.top - container.top));
            const distBottomToWall = Math.max(0, Math.round(container.bottom - active.bottom));

            const maxWallThresh = container.isFrameBoundary ? 600 : Infinity;

            const minPadding = 0;

            let leftMatch = (distLeftToWall >= minPadding && distLeftToWall <= maxWallThresh) ? { target: container, dist: distLeftToWall, isInner: true } : null;
            let rightMatch = (distRightToWall >= minPadding && distRightToWall <= maxWallThresh) ? { target: container, dist: distRightToWall, isInner: true } : null;
            let topMatch = (distTopToWall >= minPadding && distTopToWall <= maxWallThresh) ? { target: container, dist: distTopToWall, isInner: true } : null;
            let bottomMatch = (distBottomToWall >= minPadding && distBottomToWall <= maxWallThresh) ? { target: container, dist: distBottomToWall, isInner: true } : null;

            // 3. Sibling Raycast: Search ALL nearest siblings without container isolation lock!
            const overlapBufferY = 16;
            const overlapBufferX = 24;
            const MAX_NEIGHBOR_DIST = 600;

            for (let i = 0; i < this.spacingTargets.length; i++) {
                const t = this.spacingTargets[i];
                if (activeId && t.id === activeId) continue;
                if (t.id === container.id) continue;
                if (t.source === 'canvas') continue;
                if (t.isAncestor) continue;

                // If inside a row container, skip other rows of the same table and the table itself
                if (container.isRowContainer) {
                    if (t.isRowContainer || t.id === container.tableId || t.isTableContainer) continue;
                }

                // Leftward Raycast
                if (t.right <= active.left + 0.5) {
                    const hasOverlapY = !(t.bottom < active.top - overlapBufferY || t.top > active.bottom + overlapBufferY);
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
                    const hasOverlapY = !(t.bottom < active.top - overlapBufferY || t.top > active.bottom + overlapBufferY);
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
                        const hasOverlapX = !(t.right < active.left - overlapBufferX || t.left > active.right + overlapBufferX);
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
                        const hasOverlapX = !(t.right < active.left - overlapBufferX || t.left > active.right + overlapBufferX);
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

            // 4. Equal Spacing Detection (Figma Style)
            // Left vs Right equal spacing (regardless of inner container wall or outer sibling)
            let isEqualH = false;
            if (leftMatch && rightMatch) {
                if (Math.abs(leftMatch.dist - rightMatch.dist) <= 1) isEqualH = true;
            }
            // Top vs Bottom equal spacing (e.g. top: 7, bottom: 7 vertical centering)
            let isEqualV = false;
            if (topMatch && bottomMatch) {
                if (Math.abs(topMatch.dist - bottomMatch.dist) <= 1) isEqualV = true;
            }

            return { leftMatch, rightMatch, topMatch, bottomMatch, isEqualH, isEqualV, active, canvasWidth: cw, canvasHeight: ch };
        },

        /**
         * Core snapping calculation logic (SmartGuide 2.0).
         * Note: Per user specification, complex align lines (Top/Middle/Bottom) are completely removed.
         * Coordinates remain smooth and 1:1 without arbitrary jumping or cross-screen dashed lines.
         */
        calculateSnap(x, y, w = 0, h = 0, isArrowKey = false, activeId = null) {
            const spacingThresh = isArrowKey ? Infinity : (this.spacingThreshold || 120);
            const spacing = this.calculateSpacing(x, y, w, h, spacingThresh, activeId);

            return {
                x: x,
                y: y,
                snapXData: null,
                snapYData: null,
                spacing: spacing
            };
        },

        /**
         * Renders guide lines and labels on the SVG layer.
         * SmartGuide 2.0: Only clean spacing guides and badges are displayed.
         */
        drawGuides(data) {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            const DOM = window.DOM;
            if (!DOM || !DOM.guideLayer) return;

            const htmlList = [];
            if (data && data.spacing) {
                this.drawSpacingGuides(data.spacing, htmlList);
            }

            DOM.guideLayer.innerHTML = htmlList.join('');
        },

        /**
         * Renders Figma-style Spacing visual helpers.
         */
        drawSpacingGuides(spacing, htmlList) {
            if (!spacing) return;
            const { leftMatch, rightMatch, topMatch, bottomMatch, active } = spacing;
            const DOM = window.DOM;
            const cw = spacing.canvasWidth || (DOM && DOM.iframe ? (parseInt(DOM.iframe.style.width) || 1600) : 1600);
            const ch = spacing.canvasHeight || (DOM && DOM.iframe ? (parseInt(DOM.iframe.style.height) || 900) : 900);
            
            const lineCol = "#ec4899";
            const badgeBg = "#ec4899";
            const textCol = "#ffffff";
            
            const hBadgeCol = spacing.isEqualH ? "#8b5cf6" : badgeBg;
            const vBadgeCol = spacing.isEqualV ? "#8b5cf6" : badgeBg;
            
            const drawHorizontalSpacing = (match, side) => {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist < 0) return;
                
                const isInner = !!match.isInner;
                let x1, x2;
                if (isInner) {
                    x1 = (side === 'left') ? target.left : active.right;
                    x2 = (side === 'left') ? active.left : target.right;
                } else {
                    x1 = (side === 'left') ? target.right : active.right;
                    x2 = (side === 'left') ? active.left : target.left;
                }
                
                // Calculate Y position at the center of vertical overlap between active and target
                let y = active.centerY;
                if (!target.isFrameBoundary) {
                    const overlapTop = Math.max(active.top, target.top);
                    const overlapBottom = Math.min(active.bottom, target.bottom);
                    if (overlapTop < overlapBottom) {
                        y = (overlapTop + overlapBottom) / 2;
                    }
                }
                
                // Clamping y within canvas bounds
                y = Math.max(10, Math.min(ch - 10, y));

                const currentLineCol = hBadgeCol;

                if (dist === 0) {
                    // Contact boundary line: draw at the contact edge
                    const contactX = (side === 'left') ? active.left : active.right;
                    htmlList.push(`<line x1="${contactX}" y1="${y - 10}" x2="${contactX}" y2="${y + 10}" stroke="${currentLineCol}" stroke-width="1.8" />`);
                } else {
                    // Connection line
                    htmlList.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${currentLineCol}" stroke-width="1.2" />`);
                    // Edge ticks
                    htmlList.push(`<line x1="${x1}" y1="${y - 4}" x2="${x1}" y2="${y + 4}" stroke="${currentLineCol}" stroke-width="1.2" />`);
                    htmlList.push(`<line x1="${x2}" y1="${y - 4}" x2="${x2}" y2="${y + 4}" stroke="${currentLineCol}" stroke-width="1.2" />`);
                }
                
                // Measurement badge
                let cx = (dist === 0) ? ((side === 'left') ? active.left : active.right) : ((x1 + x2) / 2);
                const label = `${dist}`;
                const textWidth = Math.max(22, label.length * 7 + 10);
                cx = Math.max(textWidth / 2 + 4, Math.min(cw - textWidth / 2 - 4, cx));
                const rectX = cx - textWidth / 2;
                const rectY = y - 9;
                
                htmlList.push(`
                    <g>
                        <rect x="${rectX}" y="${rectY}" width="${textWidth}" height="18" rx="4" fill="${currentLineCol}" />
                        <text x="${cx}" y="${y + 3.5}" fill="${textCol}" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="'Pretendard Variable', Pretendard, sans-serif">${label}</text>
                    </g>
                `);
            };

            const drawVerticalSpacing = (match, side) => {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist < 0) return;
                
                const isInner = !!match.isInner;
                let y1, y2;
                if (isInner) {
                    y1 = (side === 'top') ? target.top : active.bottom;
                    y2 = (side === 'top') ? active.top : target.bottom;
                } else {
                    y1 = (side === 'top') ? target.bottom : active.bottom;
                    y2 = (side === 'top') ? active.top : target.top;
                }
                
                // Calculate X position at the center of horizontal overlap between active and target
                let x = active.centerX;
                if (!target.isFrameBoundary) {
                    const overlapLeft = Math.max(active.left, target.left);
                    const overlapRight = Math.min(active.right, target.right);
                    if (overlapLeft < overlapRight) {
                        x = (overlapLeft + overlapRight) / 2;
                    }
                }
                x = Math.max(16, Math.min(cw - 16, x));

                const currentLineCol = vBadgeCol;
                
                if (dist === 0) {
                    // Contact boundary line: draw at the contact edge
                    const contactY = (side === 'top') ? active.top : active.bottom;
                    htmlList.push(`<line x1="${x - 10}" y1="${contactY}" x2="${x + 10}" y2="${contactY}" stroke="${currentLineCol}" stroke-width="1.8" />`);
                } else {
                    // Connection line
                    htmlList.push(`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${currentLineCol}" stroke-width="1.2" />`);
                    // Edge ticks
                    htmlList.push(`<line x1="${x - 4}" y1="${y1}" x2="${x + 4}" y2="${y1}" stroke="${currentLineCol}" stroke-width="1.2" />`);
                    htmlList.push(`<line x1="${x - 4}" y1="${y2}" x2="${x + 4}" y2="${y2}" stroke="${currentLineCol}" stroke-width="1.2" />`);
                }
                
                // Measurement badge
                let cy = (dist === 0) ? ((side === 'top') ? active.top : active.bottom) : ((y1 + y2) / 2);
                const label = `${dist}`;
                const textWidth = Math.max(22, label.length * 7 + 10);
                // Critical Clamping: Ensure badge NEVER clips out of the top/bottom boundary
                cy = Math.max(11, Math.min(ch - 11, cy));
                const rectX = x - textWidth / 2;
                const rectY = cy - 9;
                
                htmlList.push(`
                    <g>
                        <rect x="${rectX}" y="${rectY}" width="${textWidth}" height="18" rx="4" fill="${currentLineCol}" />
                        <text x="${x}" y="${cy + 3.5}" fill="${textCol}" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="'Pretendard Variable', Pretendard, sans-serif">${label}</text>
                    </g>
                `);
            };

            drawHorizontalSpacing(leftMatch, 'left');
            drawHorizontalSpacing(rightMatch, 'right');
            drawVerticalSpacing(topMatch, 'top');
            drawVerticalSpacing(bottomMatch, 'bottom');
        },

        /**
         * Shows smart guide for selected component with auto-dismiss timer.
         * @param {number} x Component left
         * @param {number} y Component top
         * @param {number} w Component width
         * @param {number} h Component height
         * @param {string} activeId Component id
         * @param {number} [autoDismissMs=2000] Auto dismiss delay in ms
         */
        showSelectionGuide(x, y, w, h, activeId, autoDismissMs = 2000) {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }

            this.pendingSelection = { x, y, w, h, activeId };

            const snap = this.calculateSnap(x, y, w, h, false, activeId);
            this.drawGuides(snap);

            this.selectionTimer = setTimeout(() => {
                this.clearGuides(false);
                this.selectionTimer = null;
                this.pendingSelection = null;
            }, autoDismissMs);
        },

        /**
         * Clears all guide lines from the SVG layer.
         * @param {boolean} [forceImmediate=false] If true, clears DOM instantly without delay timer.
         */
        clearGuides(forceImmediate = false) {
            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }
            this.pendingSelection = null;
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            const DOM = window.DOM;
            if (forceImmediate) {
                if (DOM && DOM.guideLayer) {
                    DOM.guideLayer.innerHTML = '';
                }
                return;
            }
            this.clearTimer = setTimeout(() => {
                if (DOM && DOM.guideLayer) {
                    DOM.guideLayer.innerHTML = '';
                }
                this.clearTimer = null;
            }, 250); // 250ms smooth fadeout feedback
        }
    };

    // Register MessageHub handlers if available
    if (window.MessageHub) {
        window.MessageHub.register('LF_SNAP_TARGETS_RESPONSE', (data) => {
            window.SmartGuide.handleIframeTargets(data);
        });
    }

})();
