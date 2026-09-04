/**
 * vctrl_responsive_smartguide.js
 * 
 * [PC & Mobile Scroll] Dedicated Smart Guide System
 * - Strictly isolates PC Frame and Mobile Frame (0% cross-frame guide leak).
 * - Identical logic and rendering for BOTH Mouse Drag and Keyboard Arrow Keys.
 * - Renders Figma-style snapping dashed lines, center lines, 4-wall distance measurements, and object spacing badges.
 */

window.v4ResponsiveSmartGuideScript = `
(function() {
    console.log("%c [RESPONSIVE SMART GUIDE] Dedicated Module Loaded ", "background: #00e5ff; color: #0f172a; font-weight: bold; padding: 4px; border-radius: 4px;");

    const ResponsiveSmartGuide = {
        threshold: 6,
        spacingThreshold: 200,
        wallThreshold: 300,
        clearTimer: null,
        activeContext: null,
        lastActiveId: null,
        
        targets: [],
        spacingTargets: [],

        invalidateTargets: function() {
            this.targets = [];
            this.spacingTargets = [];
            this.lastActiveId = null;
        },

        getPureOffset: function(el, container) {
            let l = 0, t = 0;
            let curr = el;
            while (curr && curr !== container && curr !== document.body) {
                l += parseFloat(curr.style.left) || 0;
                t += parseFloat(curr.style.top) || 0;
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
            this.targets = [];
            this.spacingTargets = [];

            const containerWidth = context.inner.offsetWidth || (context.type === 'pc' ? 1000 : 360);
            const containerHeight = Math.max(context.inner.offsetHeight || 810, context.area ? context.area.clientHeight : 810, 810);

            const frameLabel = context.type === 'pc' ? 'PC Frame' : 'Mobile Frame';
            this.targets.push({ x: 0, label: frameLabel, part: 'Left', type: 'h' });
            this.targets.push({ x: containerWidth / 2, label: frameLabel, part: 'Center', type: 'h' });
            this.targets.push({ x: containerWidth, label: frameLabel, part: 'Right', type: 'h' });
            this.targets.push({ y: 0, label: frameLabel, part: 'Top', type: 'v' });
            this.targets.push({ y: containerHeight, label: frameLabel, part: 'Bottom', type: 'v' });

            // Register 4-wall boundary spacing targets
            this.spacingTargets.push(
                { id: context.type + '-wall-left', label: frameLabel + ' Left', left: 0, top: 0, right: 0, bottom: containerHeight, width: 0, height: containerHeight, isWall: true, wallSide: 'left' },
                { id: context.type + '-wall-right', label: frameLabel + ' Right', left: containerWidth, top: 0, right: containerWidth, bottom: containerHeight, width: 0, height: containerHeight, isWall: true, wallSide: 'right' },
                { id: context.type + '-wall-top', label: frameLabel + ' Top', left: 0, top: 0, right: containerWidth, bottom: 0, width: containerWidth, height: 0, isWall: true, wallSide: 'top' },
                { id: context.type + '-wall-bottom', label: frameLabel + ' Bottom', left: 0, top: containerHeight, right: containerWidth, bottom: containerHeight, width: containerWidth, height: 0, isWall: true, wallSide: 'bottom' }
            );

            const components = context.inner.querySelectorAll('.lf-component');
            components.forEach((c, idx) => {
                if (c === activeEl || c.classList.contains('selected') || c.classList.contains('dragging-now')) return;

                const pos = this.getPureOffset(c, context.inner);
                const l = pos.left;
                const t = pos.top;
                const w = c.offsetWidth || 100;
                const h = c.offsetHeight || 40;
                const name = c.id ? c.id.replace('v4-comp-', 'Comp ') : ('Item ' + (idx + 1));

                this.targets.push({ id: c.id, x: l, label: name, part: 'Left', type: 'h' });
                this.targets.push({ id: c.id, x: l + w / 2, label: name, part: 'Center', type: 'h' });
                this.targets.push({ id: c.id, x: l + w, label: name, part: 'Right', type: 'h' });
                this.targets.push({ id: c.id, y: t, label: name, part: 'Top', type: 'v' });
                this.targets.push({ id: c.id, y: t + h / 2, label: name, part: 'Middle', type: 'v' });
                this.targets.push({ id: c.id, y: t + h, label: name, part: 'Bottom', type: 'v' });

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

        calculateSpacing: function(x, y, w, h, thresh, activeId) {
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

            let leftMatch = null;
            let rightMatch = null;
            let topMatch = null;
            let bottomMatch = null;

            // Tightened buffer to prevent separate layout rows from bleeding into horizontal measurements
            const overlapBuffer = 14;

            this.spacingTargets.forEach(t => {
                if (activeId && t.id === activeId) return;

                const effectiveThresh = t.isWall ? this.wallThreshold : thresh;

                // Leftward measurement (Target on Left, Active on Right)
                if (active.left - t.right >= -0.5) {
                    const directOverlapY = Math.min(active.bottom, t.bottom) - Math.max(active.top, t.top) > 0;
                    const bufferOverlapY = t.isWall ? true : !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
                    const candidateTier = t.isWall ? 1 : (directOverlapY ? 3 : (bufferOverlapY ? 2 : 0));

                    if (candidateTier > 0) {
                        const dist = Math.max(0, Math.round(active.left - t.right));
                        if (dist <= effectiveThresh) {
                            if (!leftMatch || candidateTier > leftMatch.tier || (candidateTier === leftMatch.tier && dist < leftMatch.dist)) {
                                leftMatch = { target: t, dist: dist, tier: candidateTier };
                            }
                        }
                    }
                }

                // Rightward measurement (Active on Left, Target on Right)
                if (t.left - active.right >= -0.5) {
                    const directOverlapY = Math.min(active.bottom, t.bottom) - Math.max(active.top, t.top) > 0;
                    const bufferOverlapY = t.isWall ? true : !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
                    const candidateTier = t.isWall ? 1 : (directOverlapY ? 3 : (bufferOverlapY ? 2 : 0));

                    if (candidateTier > 0) {
                        const dist = Math.max(0, Math.round(t.left - active.right));
                        if (dist <= effectiveThresh) {
                            if (!rightMatch || candidateTier > rightMatch.tier || (candidateTier === rightMatch.tier && dist < rightMatch.dist)) {
                                rightMatch = { target: t, dist: dist, tier: candidateTier };
                            }
                        }
                    }
                }

                // Upward measurement (Target on Top, Active on Bottom)
                if (active.top - t.bottom >= -0.5) {
                    const directOverlapX = Math.min(active.right, t.right) - Math.max(active.left, t.left) > 0;
                    const bufferOverlapX = t.isWall ? true : !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
                    const candidateTier = t.isWall ? 1 : (directOverlapX ? 3 : (bufferOverlapX ? 2 : 0));

                    if (candidateTier > 0) {
                        const dist = Math.max(0, Math.round(active.top - t.bottom));
                        if (dist <= effectiveThresh) {
                            if (!topMatch || candidateTier > topMatch.tier || (candidateTier === topMatch.tier && dist < topMatch.dist)) {
                                topMatch = { target: t, dist: dist, tier: candidateTier };
                            }
                        }
                    }
                }

                // Downward measurement (Active on Top, Target on Bottom)
                if (t.top - active.bottom >= -0.5) {
                    const directOverlapX = Math.min(active.right, t.right) - Math.max(active.left, t.left) > 0;
                    const bufferOverlapX = t.isWall ? true : !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
                    const candidateTier = t.isWall ? 1 : (directOverlapX ? 3 : (bufferOverlapX ? 2 : 0));

                    if (candidateTier > 0) {
                        const dist = Math.max(0, Math.round(t.top - active.bottom));
                        if (dist <= effectiveThresh) {
                            if (!bottomMatch || candidateTier > bottomMatch.tier || (candidateTier === bottomMatch.tier && dist < bottomMatch.dist)) {
                                bottomMatch = { target: t, dist: dist, tier: candidateTier };
                            }
                        }
                    }
                }
            });

            return { leftMatch: leftMatch, rightMatch: rightMatch, topMatch: topMatch, bottomMatch: bottomMatch, active: active };
        },

        calculateSnap: function(x, y, w, h, isArrowKey, activeId) {
            if (w === undefined) w = 0;
            if (h === undefined) h = 0;
            let snappedX = x, snappedY = y;
            let snapXData = null, snapYData = null;
            const thresh = this.threshold;

            const pointsX = [
                { val: x, part: 'Left' },
                { val: x + w / 2, part: 'Center' },
                { val: x + w, part: 'Right' }
            ];

            for (let i = 0; i < this.targets.length; i++) {
                const t = this.targets[i];
                if (activeId && t.id === activeId) continue;
                if (t.x === undefined) continue;

                for (let j = 0; j < pointsX.length; j++) {
                    const p = pointsX[j];
                    if (Math.abs(p.val - t.x) < thresh) {
                        if (!isArrowKey) {
                            snappedX = x + (t.x - p.val);
                        }
                        snapXData = { line: t.x, label: t.label, part: t.part, selfPart: p.part };
                        break;
                    }
                }
                if (snapXData) break;
            }

            const pointsY = [
                { val: y, part: 'Top' },
                { val: y + h / 2, part: 'Middle' },
                { val: y + h, part: 'Bottom' }
            ];

            for (let i = 0; i < this.targets.length; i++) {
                const t = this.targets[i];
                if (activeId && t.id === activeId) continue;
                if (t.y === undefined) continue;

                for (let j = 0; j < pointsY.length; j++) {
                    const p = pointsY[j];
                    if (Math.abs(p.val - t.y) < thresh) {
                        if (!isArrowKey) {
                            snappedY = y + (t.y - p.val);
                        }
                        snapYData = { line: t.y, label: t.label, part: t.part, selfPart: p.part };
                        break;
                    }
                }
                if (snapYData) break;
            }

            const spacingThresh = isArrowKey ? Infinity : this.spacingThreshold;
            const spacing = this.calculateSpacing(snappedX, snappedY, w, h, spacingThresh, activeId);

            return { x: snappedX, y: snappedY, snapXData: snapXData, snapYData: snapYData, spacing: spacing };
        },

        drawGuides: function(context, snapData) {
            if (!context || !context.guideLayer) return;

            const otherType = context.type === 'pc' ? 'mobile' : 'pc';
            const otherSvg = document.querySelector('.' + otherType + '-guide-layer');
            if (otherSvg) otherSvg.innerHTML = '';

            const svg = context.guideLayer;
            let html = '';

            const snapLineColor = '#00e5ff';
            const badgeBgColor = '#ec4899';
            const labelStyle = 'fill: #00e5ff; font-size: 11px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, sans-serif;';
            const rectStyle = 'fill: rgba(15, 23, 42, 0.95); stroke: #00e5ff; stroke-width: 1; rx: 4;';

            if (snapData.snapXData) {
                const d = snapData.snapXData;
                html += '<line x1="' + d.line + '" y1="0" x2="' + d.line + '" y2="100%" stroke="' + snapLineColor + '" stroke-width="1.5" stroke-dasharray="4,3" />';
                const labelText = d.label + ' ' + d.part + ' <-> ' + d.selfPart;
                const textWidth = labelText.length * 6.5 + 14;
                html += '<g transform="translate(' + Math.max(4, d.line + 6) + ', 24)">' +
                        '<rect x="0" y="0" width="' + textWidth + '" height="20" style="' + rectStyle + '" />' +
                        '<text x="7" y="14" style="' + labelStyle + '">' + labelText + '</text>' +
                        '</g>';
            }

            if (snapData.snapYData) {
                const d = snapData.snapYData;
                html += '<line x1="0" y1="' + d.line + '" x2="100%" y2="' + d.line + '" stroke="' + snapLineColor + '" stroke-width="1.5" stroke-dasharray="4,3" />';
                const labelText = d.label + ' ' + d.part + ' <-> ' + d.selfPart;
                const textWidth = labelText.length * 6.5 + 14;
                html += '<g transform="translate(16, ' + Math.max(4, d.line - 26) + ')">' +
                        '<rect x="0" y="0" width="' + textWidth + '" height="20" style="' + rectStyle + '" />' +
                        '<text x="7" y="14" style="' + labelStyle + '">' + labelText + '</text>' +
                        '</g>';
            }

            const htmlList = [html];

            if (snapData.spacing) {
                this.drawSpacingGuides(snapData.spacing, htmlList, badgeBgColor);
            }

            svg.innerHTML = htmlList.join('');
        },

        drawSpacingGuides: function(spacing, htmlList, badgeBg) {
            const leftMatch = spacing.leftMatch;
            const rightMatch = spacing.rightMatch;
            const topMatch = spacing.topMatch;
            const bottomMatch = spacing.bottomMatch;
            const active = spacing.active;
            const lineCol = badgeBg;
            const textCol = '#ffffff';

            const drawH = function(match, side) {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist <= 0) return;

                const x1 = side === 'left' ? target.right : active.right;
                const x2 = side === 'left' ? active.left : target.left;

                let y = active.centerY;
                if (!target.isWall) {
                    if (y < target.top) y = target.top + 6;
                    if (y > target.bottom) y = target.bottom - 6;
                }

                // Main measurement line
                htmlList.push('<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                // T-ticks at both ends
                htmlList.push('<line x1="' + x1 + '" y1="' + (y - 5) + '" x2="' + x1 + '" y2="' + (y + 5) + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + x2 + '" y1="' + (y - 5) + '" x2="' + x2 + '" y2="' + (y + 5) + '" stroke="' + lineCol + '" stroke-width="1.2" />');

                const cx = (x1 + x2) / 2;
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);
                htmlList.push(
                    '<g>' +
                    '<rect x="' + (cx - textWidth / 2) + '" y="' + (y - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + badgeBg + '" />' +
                    '<text x="' + cx + '" y="' + (y + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                    '</g>'
                );
            };

            const drawV = function(match, side) {
                if (!match) return;
                const target = match.target;
                const dist = match.dist;
                if (dist <= 0) return;

                const y1 = side === 'top' ? target.bottom : active.bottom;
                const y2 = side === 'top' ? active.top : target.top;

                let x = active.centerX;
                if (!target.isWall) {
                    if (x < target.left) x = target.left + 6;
                    if (x > target.right) x = target.right - 6;
                }

                // Main measurement line
                htmlList.push('<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                // T-ticks at both ends
                htmlList.push('<line x1="' + (x - 5) + '" y1="' + y1 + '" x2="' + (x + 5) + '" y2="' + y1 + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + (x - 5) + '" y1="' + y2 + '" x2="' + (x + 5) + '" y2="' + y2 + '" stroke="' + lineCol + '" stroke-width="1.2" />');

                const cy = (y1 + y2) / 2;
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);
                htmlList.push(
                    '<g>' +
                    '<rect x="' + (x - textWidth / 2) + '" y="' + (cy - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + badgeBg + '" />' +
                    '<text x="' + x + '" y="' + (cy + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                    '</g>'
                );
            };

            drawH(leftMatch, 'left');
            drawH(rightMatch, 'right');
            drawV(topMatch, 'top');
            drawV(bottomMatch, 'bottom');
        },

        clearGuides: function(forceImmediate) {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            const clearAll = function() {
                document.querySelectorAll('.v4-responsive-guide-layer').forEach(layer => {
                    layer.innerHTML = '';
                });
            };
            if (forceImmediate) {
                clearAll();
                return;
            }
            this.clearTimer = setTimeout(() => {
                clearAll();
                this.clearTimer = null;
            }, 250);
        },

        /**
         * Real-time synchronous handler for keyboard nudges from vctrl_shortcuts.js
         */
        onNudge: function(activeEl) {
            if (!activeEl) return;
            const ctx = this.getContainerContext(activeEl);
            if (!ctx) return;

            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }

            // Self-healing snap targets if empty, frame switched, or active element changed
            if (!this.activeContext || 
                this.activeContext.type !== ctx.type || 
                this.lastActiveId !== activeEl.id || 
                this.targets.length === 0) {
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

        initKeyboardEvents: function() {
            // Managed seamlessly via vctrl_shortcuts.js pipeline
        },

        init: function() {
            console.log("[ResponsiveSmartGuide] Initialized successfully with strict frame isolation and 4-wall measurement.");
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

