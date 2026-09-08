/**
 * vctrl_responsive_smartguide.js
 * 
 * [PC & Mobile Scroll] Dedicated Smart Guide System 2.0 (Figma Raycast Engine)
 * - 4-Directional Raycast Architecture:
 *   1. Identifies direct enclosing container (Rect SHAPE / Card / Frame).
 *   2. Casts 4 rays (Left, Right, Top, Bottom) to find immediate hit targets.
 *   3. Inner padding to container walls is measured when no sibling blocks the ray.
 *   4. Immediate neighbor distances measured when adjacent sibling blocks the ray.
 *   5. Badge clamping prevents badges from overflowing screen edges or negative Y coords.
 *   6. 100% template-literal safe (no nested backticks).
 */

window.v4ResponsiveSmartGuideScript = `
(function() {
    console.log("%c [SMART GUIDE 2.0] Figma Raycast Engine Active ", "background: #ec4899; color: #ffffff; font-weight: bold; padding: 4px; border-radius: 4px;");

    const MAX_WALL_DIST = 600; // Maximum distance to display outer frame walls
    const MAX_NEIGHBOR_DIST = 600; // Maximum distance for sibling components

    const ResponsiveSmartGuide = {
        clearTimer: null,
        selectionTimer: null,
        activeContext: null,
        lastActiveId: null,
        spacingTargets: [],

        invalidateTargets: function() {
            this.spacingTargets = [];
            this.lastActiveId = null;
        },

        getPureOffset: function(el, container) {
            if (!el) return { left: 0, top: 0, width: 0, height: 0 };
            if (!container) {
                const ctx = this.getContainerContext(el);
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

        isResponsive: function() {
            return !!document.querySelector('.pc-content-inner, .mobile-content-inner, .pc-content-area, .mobile-content-area');
        },

        getContainerContext: function(el) {
            if (!el) {
                const sel = document.querySelector('.lf-component.selected');
                if (sel) el = sel;
            }
            if (!el) return null;

            const pcInner = document.querySelector('.pc-content-inner');
            const mobileInner = document.querySelector('.mobile-content-inner');
            const pcArea = document.querySelector('.pc-content-area, .pc-content');
            const mobileArea = document.querySelector('.mobile-content-area, .mobile-content');

            if (pcInner && (pcInner.contains(el) || el.closest('.pc-column') || el.closest('.pc-browser-frame') || el.closest('.pc-content-area'))) {
                return {
                    type: 'pc',
                    inner: pcInner,
                    area: pcArea,
                    guideLayer: this.ensureGuideLayer(pcInner, 'pc-guide-layer')
                };
            }
            if (mobileInner && (mobileInner.contains(el) || el.closest('.mobile-column') || el.closest('.mobile-browser-frame') || el.closest('.mobile-content-area') || el.closest('.mobile-content'))) {
                return {
                    type: 'mobile',
                    inner: mobileInner,
                    area: mobileArea,
                    guideLayer: this.ensureGuideLayer(mobileInner, 'mobile-guide-layer')
                };
            }

            if (pcArea && mobileArea) {
                const compRect = el.getBoundingClientRect();
                const compCenter = compRect.left + compRect.width / 2;
                const mobileRect = mobileArea.getBoundingClientRect();
                if (compCenter >= mobileRect.left) {
                    return {
                        type: 'mobile',
                        inner: mobileInner || mobileArea,
                        area: mobileArea,
                        guideLayer: this.ensureGuideLayer(mobileInner || mobileArea, 'mobile-guide-layer')
                    };
                } else {
                    return {
                        type: 'pc',
                        inner: pcInner || pcArea,
                        area: pcArea,
                        guideLayer: this.ensureGuideLayer(pcInner || pcArea, 'pc-guide-layer')
                    };
                }
            }

            return null;
        },

        ensureGuideLayer: function(container, className) {
            if (!container) return null;
            let svg = container.querySelector('svg.' + className);
            if (!svg) {
                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'v4-responsive-guide-layer ' + className);
                svg.setAttribute('data-guide-layer', 'true');
                svg.style.position = 'absolute';
                svg.style.top = '0';
                svg.style.left = '0';
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.pointerEvents = 'none';
                svg.style.zIndex = '99999';
                svg.style.overflow = 'visible';
                container.appendChild(svg);
            }
            return svg;
        },

        findSnapTargets: function(context, activeEl) {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            if (!context || !context.inner) return;

            this.activeContext = context;
            this.lastActiveId = activeEl ? activeEl.id : null;
            this.spacingTargets = [];

            const containerWidth = context.inner.offsetWidth || (context.type === 'pc' ? 1160 : 360);
            const containerHeight = Math.max(
                context.inner.scrollHeight || 810,
                parseInt(context.inner.style.minHeight) || 810,
                context.area ? context.area.clientHeight : 810,
                810
            );

            // Scope query to the active frame/column or root body so that all elements in the column are included
            const columnSelector = context.type === 'pc' ? '.pc-column, .pc-browser-frame' : '.mobile-column, .mobile-browser-frame';
            const rootScope = context.inner.closest(columnSelector) || context.area || context.inner.parentElement || document.body;
            const components = rootScope.querySelectorAll('.lf-component, .v4-admin-label-cell');

            components.forEach((c, idx) => {
                if (c === activeEl || c.classList.contains('dragging-now')) return;
                if (activeEl && (activeEl.contains(c) || c.contains(activeEl))) return;

                const pos = this.getPureOffset(c, context.inner);
                const l = pos.left;
                const t = pos.top;
                const w = pos.width || c.offsetWidth || parseFloat(c.style.width) || 100;
                const h = pos.height || c.offsetHeight || parseFloat(c.style.height) || 40;
                if (w < 10 || h < 10) return;
                const name = c.id ? c.id.replace('v4-comp-', 'Comp ') : ('Item ' + (idx + 1));

                this.spacingTargets.push({
                    id: c.id || ('comp-' + idx),
                    label: name,
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: l + w,
                    bottom: t + h,
                    isWall: false
                });
            });
        },

        calculateSpacing: function(x, y, w, h, activeId) {
            const containerWidth = (this.activeContext && this.activeContext.inner) ? (this.activeContext.inner.offsetWidth || 1160) : 1160;
            const containerHeight = (this.activeContext && this.activeContext.inner) ? Math.max(
                this.activeContext.inner.scrollHeight || 810,
                parseInt(this.activeContext.inner.style.minHeight) || 810,
                810
            ) : 810;

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
            // Detect the tightest component container enclosing active element
            let container = null;
            let minContainerArea = Infinity;

            for (let i = 0; i < this.spacingTargets.length; i++) {
                const t = this.spacingTargets[i];
                if (activeId && t.id === activeId) continue;
                if (!t.width || !t.height) continue;

                // Enclosure test (Case A: 4-edge enclosure with 6px tolerance; Case B: Center-point containment for underlying Rect shape/card)
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
                    const area = t.width * t.height;
                    if (area < minContainerArea) {
                        minContainerArea = area;
                        container = t;
                    }
                }
            }

            // Fallback to frame if no component container found
            if (!container) {
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

            // 2. Base Distances: Inner Padding to Container 4 Walls
            const distLeftToWall = Math.max(0, Math.round(active.left - container.left));
            const distRightToWall = Math.max(0, Math.round(container.right - active.right));
            const distTopToWall = Math.max(0, Math.round(active.top - container.top));
            const distBottomToWall = Math.max(0, Math.round(container.bottom - active.bottom));

            const maxWallThresh = container.isFrame ? MAX_WALL_DIST : Infinity;
            const minPadding = container.isFrame ? 1 : 3;

            let leftMatch = (distLeftToWall >= minPadding && distLeftToWall <= maxWallThresh) ? { target: container, dist: distLeftToWall, isInner: true } : null;
            let rightMatch = (distRightToWall >= minPadding && distRightToWall <= maxWallThresh) ? { target: container, dist: distRightToWall, isInner: true } : null;
            let topMatch = (distTopToWall >= minPadding && distTopToWall <= maxWallThresh) ? { target: container, dist: distTopToWall, isInner: true } : null;
            let bottomMatch = (distBottomToWall >= minPadding && distBottomToWall <= maxWallThresh) ? { target: container, dist: distBottomToWall, isInner: true } : null;

            // 3. Sibling Raycast: Search ALL nearest siblings without container isolation lock!
            // Strict Y overlap for horizontal (same row only), and moderate X overlap for vertical (facing columns)
            const overlapBufferY = 16;
            const overlapBufferX = 24;

            for (let i = 0; i < this.spacingTargets.length; i++) {
                const t = this.spacingTargets[i];
                if (activeId && t.id === activeId) continue;
                if (t.id === container.id) continue;

                // Leftward Raycast (t is on the left of active)
                if (t.right <= active.left + 4) {
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

                // Rightward Raycast (t is on the right of active)
                if (t.left >= active.right - 4) {
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

                // Upward Raycast (t is above active)
                if (t.bottom <= active.top + 4) {
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

                // Downward Raycast (t is below active)
                if (t.top >= active.bottom - 4) {
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

            // 4. Equal Spacing Detection (Figma Style)
            let isEqualH = false;
            if (leftMatch && rightMatch && !leftMatch.isInner && !rightMatch.isInner) {
                if (Math.abs(leftMatch.dist - rightMatch.dist) <= 1) isEqualH = true;
            }
            let isEqualV = false;
            if (topMatch && bottomMatch && !topMatch.isInner && !bottomMatch.isInner) {
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

            return {
                x: x,
                y: y,
                snapXData: null,
                snapYData: null,
                spacing: spacing
            };
        },

        drawGuides: function(context, snapData) {
            if (!context || !context.guideLayer) return;

            const otherType = context.type === 'pc' ? 'mobile' : 'pc';
            const otherSvg = document.querySelector('.' + otherType + '-guide-layer');
            if (otherSvg) otherSvg.innerHTML = '';

            const svg = context.guideLayer;
            const htmlList = [];

            if (snapData && snapData.spacing) {
                this.drawSpacingGuides(snapData.spacing, htmlList, '#ec4899');
            }

            svg.innerHTML = htmlList.join('');
        },

        drawSpacingGuides: function(spacing, htmlList, badgeBg) {
            const leftMatch = spacing.leftMatch;
            const rightMatch = spacing.rightMatch;
            const topMatch = spacing.topMatch;
            const bottomMatch = spacing.bottomMatch;
            const active = spacing.active;
            const cWidth = spacing.containerWidth || 1160;
            const cHeight = spacing.containerHeight || 810;
            const textCol = '#ffffff';

            const hBadgeCol = spacing.isEqualH ? '#8b5cf6' : badgeBg;
            const vBadgeCol = spacing.isEqualV ? '#8b5cf6' : badgeBg;

            const drawH = function(match, side) {
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
                if (!target.isFrame) {
                    const overlapTop = Math.max(active.top, target.top);
                    const overlapBottom = Math.min(active.bottom, target.bottom);
                    if (overlapTop < overlapBottom) {
                        y = (overlapTop + overlapBottom) / 2;
                    }
                }

                // Clamping y within canvas bounds
                y = Math.max(10, Math.min(cHeight - 10, y));

                const currentLineCol = hBadgeCol;

                if (dist === 0) {
                    // Contact boundary line: draw at the contact edge
                    const contactX = (side === 'left') ? active.left : active.right;
                    htmlList.push('<line x1="' + contactX + '" y1="' + (y - 10) + '" x2="' + contactX + '" y2="' + (y + 10) + '" stroke="' + currentLineCol + '" stroke-width="1.8" />');
                } else {
                    // Main measurement line
                    htmlList.push('<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    // T-ticks at both ends
                    htmlList.push('<line x1="' + x1 + '" y1="' + (y - 4) + '" x2="' + x1 + '" y2="' + (y + 4) + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    htmlList.push('<line x1="' + x2 + '" y1="' + (y - 4) + '" x2="' + x2 + '" y2="' + (y + 4) + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                }

                let cx = (dist === 0) ? ((side === 'left') ? active.left : active.right) : ((x1 + x2) / 2);
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);
                // Clamp badge inside visible canvas horizontally
                cx = Math.max(textWidth / 2 + 4, Math.min(cWidth - textWidth / 2 - 4, cx));

                htmlList.push(
                    '<g>' +
                    '<rect x="' + (cx - textWidth / 2) + '" y="' + (y - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + currentLineCol + '" />' +
                    '<text x="' + cx + '" y="' + (y + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Pretendard, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                    '</g>'
                );
            };

            const drawV = function(match, side) {
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
                if (!target.isFrame) {
                    const overlapLeft = Math.max(active.left, target.left);
                    const overlapRight = Math.min(active.right, target.right);
                    if (overlapLeft < overlapRight) {
                        x = (overlapLeft + overlapRight) / 2;
                    }
                }

                // Clamping x within canvas bounds
                x = Math.max(16, Math.min(cWidth - 16, x));

                const currentLineCol = vBadgeCol;

                if (dist === 0) {
                    // Contact boundary line: draw at the contact edge
                    const contactY = (side === 'top') ? active.top : active.bottom;
                    htmlList.push('<line x1="' + (x - 10) + '" y1="' + contactY + '" x2="' + (x + 10) + '" y2="' + contactY + '" stroke="' + currentLineCol + '" stroke-width="1.8" />');
                } else {
                    // Main measurement line
                    htmlList.push('<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    // T-ticks at both ends
                    htmlList.push('<line x1="' + (x - 4) + '" y1="' + y1 + '" x2="' + (x + 4) + '" y2="' + y1 + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    htmlList.push('<line x1="' + (x - 4) + '" y1="' + y2 + '" x2="' + (x + 4) + '" y2="' + y2 + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                }

                let cy = (dist === 0) ? ((side === 'top') ? active.top : active.bottom) : ((y1 + y2) / 2);
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);

                // Critical Clamping: Ensure badge NEVER clips out of the top/bottom boundary (e.g. y < 0)
                cy = Math.max(11, Math.min(cHeight - 11, cy));

                htmlList.push(
                    '<g>' +
                    '<rect x="' + (x - textWidth / 2) + '" y="' + (cy - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + currentLineCol + '" />' +
                    '<text x="' + x + '" y="' + (cy + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Pretendard, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                    '</g>'
                );
            };

            drawH(leftMatch, 'left');
            drawH(rightMatch, 'right');
            drawV(topMatch, 'top');
            drawV(bottomMatch, 'bottom');
        },

        clearGuides: function(forceImmediate) {
            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            const clearAll = function() {
                document.querySelectorAll('.v4-responsive-guide-layer').forEach(function(layer) {
                    layer.innerHTML = '';
                });
            };
            if (forceImmediate) {
                clearAll();
                return;
            }
            this.clearTimer = setTimeout(function() {
                clearAll();
                ResponsiveSmartGuide.clearTimer = null;
            }, 250);
        },

        onSelect: function(activeEl, autoDismissMs) {
            if (!activeEl) return;
            const ctx = this.getContainerContext(activeEl);
            if (!ctx) return;

            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }

            this.findSnapTargets(ctx, activeEl);

            const activePos = this.getPureOffset(activeEl, ctx.inner);
            const curLeft = activePos.left;
            const curTop = activePos.top;
            const w = activeEl.offsetWidth || 100;
            const h = activeEl.offsetHeight || 40;

            const snapResult = this.calculateSnap(curLeft, curTop, w, h, true, activeEl.id);
            this.drawGuides(ctx, snapResult);

            const delay = typeof autoDismissMs === 'number' ? autoDismissMs : 2000;
            this.selectionTimer = setTimeout(function() {
                ResponsiveSmartGuide.clearGuides(false);
                ResponsiveSmartGuide.selectionTimer = null;
            }, delay);
        },

        onNudge: function(activeEl) {
            if (!activeEl) return;
            const ctx = this.getContainerContext(activeEl);
            if (!ctx) return;

            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }

            if (!this.activeContext || 
                this.activeContext.type !== ctx.type || 
                this.lastActiveId !== activeEl.id || 
                this.spacingTargets.length === 0) {
                this.findSnapTargets(ctx, activeEl);
            }

            const activePos = this.getPureOffset(activeEl, ctx.inner);
            const curLeft = activePos.left;
            const curTop = activePos.top;
            const w = activeEl.offsetWidth || 100;
            const h = activeEl.offsetHeight || 40;

            const snapResult = this.calculateSnap(curLeft, curTop, w, h, true, activeEl.id);
            this.drawGuides(ctx, snapResult);
        },

        onNudgeEnd: function() {
            this.clearGuides(false);
        },

        init: function() {
            console.log("[ResponsiveSmartGuide 2.0] Raycast engine loaded.");
        }
    };

    window.ResponsiveSmartGuide = ResponsiveSmartGuide;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { ResponsiveSmartGuide.init(); });
    } else {
        ResponsiveSmartGuide.init();
    }
})();
`;
