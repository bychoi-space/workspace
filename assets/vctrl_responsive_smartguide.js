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

    const MAX_WALL_DIST = 350; // Maximum distance to display outer frame walls
    const MAX_NEIGHBOR_DIST = 250; // Maximum distance for sibling components

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

        getPureOffset: function(el) {
            let l = 0, t = 0;
            let curr = el;
            while (curr && !curr.classList.contains('pc-content-area') && !curr.classList.contains('pc-content-inner') && !curr.classList.contains('mobile-content') && !curr.classList.contains('mobile-content-area') && !curr.classList.contains('mobile-content-inner') && curr !== document.body) {
                if (curr.style) {
                    const sl = parseFloat(curr.style.left);
                    const st = parseFloat(curr.style.top);
                    if (!isNaN(sl)) l += sl;
                    else if (curr.offsetLeft) l += curr.offsetLeft;
                    if (!isNaN(st)) t += st;
                    else if (curr.offsetTop) t += curr.offsetTop;
                }
                curr = curr.parentElement;
            }
            return { left: l, top: t };
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
            const components = rootScope.querySelectorAll('.lf-component');

            components.forEach((c, idx) => {
                if (c === activeEl || c.classList.contains('dragging-now')) return;
                if (activeEl && (activeEl.contains(c) || c.contains(activeEl))) return;

                const pos = this.getPureOffset(c);
                const l = pos.left;
                const t = pos.top;
                const w = c.offsetWidth || parseFloat(c.style.width) || 100;
                const h = c.offsetHeight || parseFloat(c.style.height) || 40;
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

            let leftMatch = (distLeftToWall <= maxWallThresh) ? { target: container, dist: distLeftToWall, isInner: true } : null;
            let rightMatch = (distRightToWall <= maxWallThresh) ? { target: container, dist: distRightToWall, isInner: true } : null;
            let topMatch = (distTopToWall <= maxWallThresh) ? { target: container, dist: distTopToWall, isInner: true } : null;
            let bottomMatch = (distBottomToWall <= maxWallThresh) ? { target: container, dist: distBottomToWall, isInner: true } : null;

            // 3. Sibling Raycast: If an adjacent sibling intercepts the ray closer than the wall, hit the sibling!
            const overlapBuffer = 12;

            for (let i = 0; i < this.spacingTargets.length; i++) {
                const t = this.spacingTargets[i];
                if (activeId && t.id === activeId) continue;
                if (t.id === container.id) continue;

                // When inside a component container, only consider siblings inside the container
                if (!container.isFrame) {
                    const tCenterX = t.left + t.width / 2;
                    const tCenterY = t.top + t.height / 2;
                    const isInside = (
                        tCenterX >= container.left - 6 && tCenterX <= container.right + 6 &&
                        tCenterY >= container.top - 6 && tCenterY <= container.bottom + 6
                    );
                    if (!isInside) continue;
                }

                // Leftward Raycast (t is on the left of active)
                if (t.right <= active.left + 1) {
                    const hasOverlapY = !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
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
                if (t.left >= active.right - 1) {
                    const hasOverlapY = !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
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
                if (t.bottom <= active.top + 1) {
                    const hasOverlapX = !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
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
                if (t.top >= active.bottom - 1) {
                    const hasOverlapX = !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
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

            return {
                leftMatch: leftMatch,
                rightMatch: rightMatch,
                topMatch: topMatch,
                bottomMatch: bottomMatch,
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
            const lineCol = badgeBg;
            const textCol = '#ffffff';

            const drawH = function(match, side) {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist <= 0) return;

                const isInner = !!match.isInner;
                let x1, x2;
                if (isInner) {
                    x1 = (side === 'left') ? target.left : active.right;
                    x2 = (side === 'left') ? active.left : target.right;
                } else {
                    x1 = (side === 'left') ? target.right : active.right;
                    x2 = (side === 'left') ? active.left : target.left;
                }

                let y = active.centerY;
                if (!target.isFrame) {
                    if (y < target.top + 6) y = target.top + 6;
                    if (y > target.bottom - 6) y = target.bottom - 6;
                }

                // Clamping y within canvas bounds
                y = Math.max(10, Math.min(cHeight - 10, y));

                // Main measurement line
                htmlList.push('<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                // T-ticks at both ends
                htmlList.push('<line x1="' + x1 + '" y1="' + (y - 4) + '" x2="' + x1 + '" y2="' + (y + 4) + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + x2 + '" y1="' + (y - 4) + '" x2="' + x2 + '" y2="' + (y + 4) + '" stroke="' + lineCol + '" stroke-width="1.2" />');

                let cx = (x1 + x2) / 2;
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);
                // Clamp badge inside visible canvas horizontally
                cx = Math.max(textWidth / 2 + 4, Math.min(cWidth - textWidth / 2 - 4, cx));

                htmlList.push(
                    '<g>' +
                    '<rect x="' + (cx - textWidth / 2) + '" y="' + (y - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + badgeBg + '" />' +
                    '<text x="' + cx + '" y="' + (y + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Pretendard, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                    '</g>'
                );
            };

            const drawV = function(match, side) {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist <= 0) return;

                const isInner = !!match.isInner;
                let y1, y2;
                if (isInner) {
                    y1 = (side === 'top') ? target.top : active.bottom;
                    y2 = (side === 'top') ? active.top : target.bottom;
                } else {
                    y1 = (side === 'top') ? target.bottom : active.bottom;
                    y2 = (side === 'top') ? active.top : target.top;
                }

                let x = active.centerX;
                if (!target.isFrame) {
                    if (x < target.left + 6) x = target.left + 6;
                    if (x > target.right - 6) x = target.right - 6;
                }

                // Clamping x within canvas bounds
                x = Math.max(16, Math.min(cWidth - 16, x));

                // Main measurement line
                htmlList.push('<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                // T-ticks at both ends
                htmlList.push('<line x1="' + (x - 4) + '" y1="' + y1 + '" x2="' + (x + 4) + '" y2="' + y1 + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + (x - 4) + '" y1="' + y2 + '" x2="' + (x + 4) + '" y2="' + y2 + '" stroke="' + lineCol + '" stroke-width="1.2" />');

                let cy = (y1 + y2) / 2;
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);

                // Critical Clamping: Ensure badge NEVER clips out of the top/bottom boundary (e.g. y < 0)
                cy = Math.max(11, Math.min(cHeight - 11, cy));

                htmlList.push(
                    '<g>' +
                    '<rect x="' + (x - textWidth / 2) + '" y="' + (cy - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + badgeBg + '" />' +
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
