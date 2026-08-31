/**
 * vctrl_responsive_smartguide.js
 * 
 * [PC & Mobile Scroll] Dedicated Smart Guide System
 * - Strictly isolates PC Frame and Mobile Frame (0% cross-frame guide leak).
 * - Identical logic and rendering for BOTH Mouse Drag and Keyboard Arrow Keys.
 * - Renders Figma-style snapping dashed lines, center lines, and distance (spacing) measurement badges.
 */

window.v4ResponsiveSmartGuideScript = `
(function() {
    console.log("%c [RESPONSIVE SMART GUIDE] Dedicated Module Loaded ", "background: #00e5ff; color: #0f172a; font-weight: bold; padding: 4px; border-radius: 4px;");

    const ResponsiveSmartGuide = {
        threshold: 6,
        spacingThreshold: 80,
        clearTimer: null,
        activeContext: null,
        
        targets: [],
        spacingTargets: [],

        getContainerContext: function(el) {
            if (!el) {
                const sel = document.querySelector('.lf-component.selected');
                if (sel) el = sel;
            }
            if (!el) return null;

            const pcInner = document.querySelector('.pc-content-inner');
            const mobileInner = document.querySelector('.mobile-content-inner');
            const pcArea = document.querySelector('.pc-content-area');
            const mobileArea = document.querySelector('.mobile-content-area');

            if (pcInner && (pcInner.contains(el) || el.closest('.pc-column') || el.closest('.pc-browser-frame'))) {
                return {
                    type: 'pc',
                    inner: pcInner,
                    area: pcArea,
                    guideLayer: this.ensureGuideLayer(pcInner, 'pc-guide-layer')
                };
            }
            if (mobileInner && (mobileInner.contains(el) || el.closest('.mobile-column') || el.closest('.mobile-browser-frame'))) {
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
                        inner: mobileInner,
                        area: mobileArea,
                        guideLayer: this.ensureGuideLayer(mobileInner, 'mobile-guide-layer')
                    };
                } else {
                    return {
                        type: 'pc',
                        inner: pcInner,
                        area: pcArea,
                        guideLayer: this.ensureGuideLayer(pcInner, 'pc-guide-layer')
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
            this.targets = [];
            this.spacingTargets = [];

            const containerWidth = context.inner.offsetWidth || (context.type === 'pc' ? 980 : 390);
            const containerHeight = Math.max(context.inner.offsetHeight || 772, context.area ? context.area.clientHeight : 772);

            const frameLabel = context.type === 'pc' ? 'PC Frame' : 'Mobile Frame';
            this.targets.push({ x: 0, label: frameLabel, part: 'Left', type: 'h' });
            this.targets.push({ x: containerWidth / 2, label: frameLabel, part: 'Center', type: 'h' });
            this.targets.push({ x: containerWidth, label: frameLabel, part: 'Right', type: 'h' });
            this.targets.push({ y: 0, label: frameLabel, part: 'Top', type: 'v' });
            this.targets.push({ y: containerHeight, label: frameLabel, part: 'Bottom', type: 'v' });

            this.spacingTargets.push(
                { id: context.type + '-wall-left', label: frameLabel + ' Left', left: 0, top: 0, right: 0, bottom: containerHeight, width: 0, height: containerHeight, isWall: true },
                { id: context.type + '-wall-right', label: frameLabel + ' Right', left: containerWidth, top: 0, right: containerWidth, bottom: containerHeight, width: 0, height: containerHeight, isWall: true },
                { id: context.type + '-wall-top', label: frameLabel + ' Top', left: 0, top: 0, right: containerWidth, bottom: 0, width: containerWidth, height: 0, isWall: true }
            );

            const components = context.inner.querySelectorAll('.lf-component');
            components.forEach((c, idx) => {
                if (c === activeEl || c.classList.contains('selected') || c.classList.contains('dragging-now')) return;

                const l = parseFloat(c.style.left) || 0;
                const t = parseFloat(c.style.top) || 0;
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
                    bottom: t + h
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

            const overlapBuffer = 20;

            this.spacingTargets.forEach(t => {
                if (activeId && t.id === activeId) return;

                if (t.right <= active.left) {
                    const overlapY = !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
                    if (overlapY) {
                        const dist = Math.round(active.left - t.right);
                        if (dist >= 0 && dist <= thresh) {
                            if (!leftMatch || dist < leftMatch.dist) {
                                leftMatch = { target: t, dist: dist };
                            }
                        }
                    }
                }
                if (t.left >= active.right) {
                    const overlapY = !(t.bottom < active.top - overlapBuffer || t.top > active.bottom + overlapBuffer);
                    if (overlapY) {
                        const dist = Math.round(t.left - active.right);
                        if (dist >= 0 && dist <= thresh) {
                            if (!rightMatch || dist < rightMatch.dist) {
                                rightMatch = { target: t, dist: dist };
                            }
                        }
                    }
                }
                if (t.bottom <= active.top) {
                    const overlapX = !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
                    if (overlapX) {
                        const dist = Math.round(active.top - t.bottom);
                        if (dist >= 0 && dist <= thresh) {
                            if (!topMatch || dist < topMatch.dist) {
                                topMatch = { target: t, dist: dist };
                            }
                        }
                    }
                }
                if (t.top >= active.bottom) {
                    const overlapX = !(t.right < active.left - overlapBuffer || t.left > active.right + overlapBuffer);
                    if (overlapX) {
                        const dist = Math.round(t.top - active.bottom);
                        if (dist >= 0 && dist <= thresh) {
                            if (!bottomMatch || dist < bottomMatch.dist) {
                                bottomMatch = { target: t, dist: dist };
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

            if (!isArrowKey) {
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
                            snappedX = x + (t.x - p.val);
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
                            snappedY = y + (t.y - p.val);
                            snapYData = { line: t.y, label: t.label, part: t.part, selfPart: p.part };
                            break;
                        }
                    }
                    if (snapYData) break;
                }
            }

            const spacing = this.calculateSpacing(snappedX, snappedY, w, h, this.spacingThreshold, activeId);

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
            const labelStyle = 'fill: #00e5ff; font-size: 11px; font-weight: 700; font-family: sans-serif;';
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
                if (y < target.top) y = target.top + 6;
                if (y > target.bottom) y = target.bottom - 6;

                htmlList.push('<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + x1 + '" y1="' + (y - 4) + '" x2="' + x1 + '" y2="' + (y + 4) + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + x2 + '" y1="' + (y - 4) + '" x2="' + x2 + '" y2="' + (y + 4) + '" stroke="' + lineCol + '" stroke-width="1.2" />');

                const cx = (x1 + x2) / 2;
                const label = String(dist);
                const textWidth = label.length * 6.5 + 10;
                htmlList.push(
                    '<g>' +
                    '<rect x="' + (cx - textWidth / 2) + '" y="' + (y - 8) + '" width="' + textWidth + '" height="16" rx="3" fill="' + badgeBg + '" />' +
                    '<text x="' + cx + '" y="' + (y + 4) + '" fill="' + textCol + '" font-size="9px" font-weight="800" text-anchor="middle" font-family="sans-serif">' + label + '</text>' +
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
                if (x < target.left) x = target.left + 6;
                if (x > target.right) x = target.right - 6;

                htmlList.push('<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + (x - 4) + '" y1="' + y1 + '" x2="' + (x + 4) + '" y2="' + y1 + '" stroke="' + lineCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + (x - 4) + '" y1="' + y2 + '" x2="' + (x + 4) + '" y2="' + y2 + '" stroke="' + lineCol + '" stroke-width="1.2" />');

                const cy = (y1 + y2) / 2;
                const label = String(dist);
                const textWidth = label.length * 6.5 + 10;
                htmlList.push(
                    '<g>' +
                    '<rect x="' + (x - textWidth / 2) + '" y="' + (cy - 8) + '" width="' + textWidth + '" height="16" rx="3" fill="' + badgeBg + '" />' +
                    '<text x="' + x + '" y="' + (cy + 4) + '" fill="' + textCol + '" font-size="9px" font-weight="800" text-anchor="middle" font-family="sans-serif">' + label + '</text>' +
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

        initKeyboardEvents: function() {
            let isArrowMoving = false;

            document.addEventListener('keydown', (e) => {
                const inInput = e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
                if (inInput) return;

                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    const selected = document.querySelectorAll('.lf-component.selected');
                    if (selected.length === 0) return;

                    const activeEl = selected[0];
                    const ctx = this.getContainerContext(activeEl);
                    if (!ctx) return;

                    if (!isArrowMoving) {
                        isArrowMoving = true;
                        this.findSnapTargets(ctx, activeEl);
                    }

                    requestAnimationFrame(() => {
                        const curLeft = parseFloat(activeEl.style.left) || 0;
                        const curTop = parseFloat(activeEl.style.top) || 0;
                        const w = activeEl.offsetWidth || 100;
                        const h = activeEl.offsetHeight || 40;

                        const snapResult = this.calculateSnap(curLeft, curTop, w, h, false, activeEl.id);
                        this.drawGuides(ctx, snapResult);
                    });
                }
            }, true);

            document.addEventListener('keyup', (e) => {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    isArrowMoving = false;
                    this.clearGuides(false);
                }
            }, true);
        },

        init: function() {
            this.initKeyboardEvents();
            console.log("[ResponsiveSmartGuide] Initialized successfully with strict frame isolation.");
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
