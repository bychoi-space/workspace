/**
 * vctrl_responsive_smartguide.js
 * 
 * [PC & Mobile Scroll] Dedicated Smart Guide System 2.0 (Figma Raycast Engine)
 * - 4-Directional Raycast Architecture (Rendering & Lifecycle Management):
 *   1. Identifies direct enclosing container (Rect SHAPE / Card / Frame).
 *   2. Delegates pure coordinate raycast/snapping math to ResponsiveSmartGuideMath.
 *   3. Renders realtime SVG guide lines and distance badges.
 *   4. Manages Alt/Shift inspection, selection timers, and nudge events.
 *   5. Badge clamping prevents badges from overflowing screen edges or negative Y coords.
 *   6. 100% template-literal safe (no nested backticks).
 */

window.v4ResponsiveSmartGuideScript = `
(function() {
    console.log("%c [SMART GUIDE 2.0] Figma Raycast Engine Active ", "background: #ec4899; color: #ffffff; font-weight: bold; padding: 4px; border-radius: 4px;");

    const ResponsiveSmartGuide = {
        clearTimer: null,
        selectionTimer: null,
        isAltDown: false,
        isHoverInspecting: false,
        lastMousePos: null,
        _altEventsBound: false,

        get spacingTargets() {
            return (window.ResponsiveSmartGuideMath && window.ResponsiveSmartGuideMath.spacingTargets) ? window.ResponsiveSmartGuideMath.spacingTargets : [];
        },
        set spacingTargets(val) {
            if (window.ResponsiveSmartGuideMath) window.ResponsiveSmartGuideMath.spacingTargets = val;
        },
        get activeContext() {
            return (window.ResponsiveSmartGuideMath && window.ResponsiveSmartGuideMath.activeContext) ? window.ResponsiveSmartGuideMath.activeContext : null;
        },
        set activeContext(val) {
            if (window.ResponsiveSmartGuideMath) window.ResponsiveSmartGuideMath.activeContext = val;
        },
        get lastActiveId() {
            return (window.ResponsiveSmartGuideMath && window.ResponsiveSmartGuideMath.lastActiveId) ? window.ResponsiveSmartGuideMath.lastActiveId : null;
        },
        set lastActiveId(val) {
            if (window.ResponsiveSmartGuideMath) window.ResponsiveSmartGuideMath.lastActiveId = val;
        },

        invalidateTargets: function() {
            if (window.ResponsiveSmartGuideMath) window.ResponsiveSmartGuideMath.invalidateTargets();
        },

        getPureOffset: function(el, container) {
            return window.ResponsiveSmartGuideMath ? window.ResponsiveSmartGuideMath.getPureOffset(el, container) : { left: 0, top: 0, width: 0, height: 0 };
        },

        isResponsive: function() {
            return true;
        },

        getContainerContext: function(el) {
            if (!el) {
                const sel = document.querySelector('.lf-component.selected');
                if (sel) el = sel;
            }
            if (!el) return null;

            // 0. Primary SSOT resolution via ResponsiveFrameUtils
            if (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getContainer === 'function') {
                const targetContainer = window.ResponsiveFrameUtils.getContainer(el);
                if (targetContainer) {
                    const frameType = window.ResponsiveFrameUtils.getFrameType(el);
                    const isPc = (frameType === 'pc');
                    const scrollArea = (typeof window.ResponsiveFrameUtils.getScrollArea === 'function')
                        ? window.ResponsiveFrameUtils.getScrollArea(el)
                        : null;
                    const frameCol = el.closest('.frame-column, .pc-column, .mobile-column, .pc-browser-frame, .mobile-browser-frame');
                    const guideClass = isPc ? 'pc-guide-layer' : 'mobile-guide-layer';
                    return {
                        type: isPc ? 'pc' : 'mobile',
                        inner: targetContainer,
                        area: scrollArea || targetContainer,
                        column: frameCol,
                        guideLayer: this.ensureGuideLayer(targetContainer, guideClass)
                    };
                }
            }

            // 1. Check if el is inside a specific frame column (Responsive Dual Mobile, Responsive PC+Mobile, etc.)
            const frameCol = el.closest('.frame-column, .pc-column, .mobile-column, .pc-browser-frame, .mobile-browser-frame');
            if (frameCol) {
                const isPc = frameCol.classList.contains('pc-column') || frameCol.classList.contains('pc-browser-frame') || !!frameCol.querySelector('.pc-content-inner');
                const colInner = frameCol.querySelector(isPc ? '.pc-content-inner' : '.mobile-content-inner');
                const colArea = frameCol.querySelector(isPc ? '.pc-content-area, .pc-content' : '.mobile-content-area, .mobile-content');
                const guideClass = isPc ? 'pc-guide-layer' : 'mobile-guide-layer';
                if (colInner) {
                    return {
                        type: isPc ? 'pc' : 'mobile',
                        inner: colInner,
                        area: colArea || colInner,
                        column: frameCol,
                        guideLayer: this.ensureGuideLayer(colInner, guideClass)
                    };
                }
            }

            // 2. Direct containment check in responsive inner containers
            const allPcInners = document.querySelectorAll('.pc-content-inner');
            for (let i = 0; i < allPcInners.length; i++) {
                if (allPcInners[i].contains(el)) {
                    return {
                        type: 'pc',
                        inner: allPcInners[i],
                        area: allPcInners[i].closest('.pc-content-area, .pc-content') || allPcInners[i],
                        guideLayer: this.ensureGuideLayer(allPcInners[i], 'pc-guide-layer')
                    };
                }
            }
            const allMobileInners = document.querySelectorAll('.mobile-content-inner');
            for (let i = 0; i < allMobileInners.length; i++) {
                if (allMobileInners[i].contains(el)) {
                    return {
                        type: 'mobile',
                        inner: allMobileInners[i],
                        area: allMobileInners[i].closest('.mobile-content-area, .mobile-content') || allMobileInners[i],
                        guideLayer: this.ensureGuideLayer(allMobileInners[i], 'mobile-guide-layer')
                    };
                }
            }

            // 3. Static multi-screen mobile frames (non-responsive templates e.g. 1~3 mobile screen template)
            const isResponsiveTemplate = !!document.querySelector('.responsive-compare-container, .frame-column, .dual-mobile-container, .pc-mobile-grid');
            if (!isResponsiveTemplate) {
                const mobileFrames = document.querySelectorAll('.mobile-frame');
                if (mobileFrames && mobileFrames.length > 0) {
                    let targetFrame = null;
                    let targetContent = null;
                    let frameIdx = 0;

                    for (let i = 0; i < mobileFrames.length; i++) {
                        const mf = mobileFrames[i];
                        if (mf.contains(el)) {
                            targetFrame = mf;
                            targetContent = mf.querySelector('.mobile-content') || mf;
                            frameIdx = i;
                            break;
                        }
                    }

                    if (!targetFrame) {
                        const compRect = el.getBoundingClientRect();
                        const compCenterX = compRect.left + compRect.width / 2;
                        for (let i = 0; i < mobileFrames.length; i++) {
                            const mf = mobileFrames[i];
                            const fRect = mf.getBoundingClientRect();
                            if (compCenterX >= fRect.left - 20 && compCenterX <= fRect.right + 20) {
                                targetFrame = mf;
                                targetContent = mf.querySelector('.mobile-content') || mf;
                                frameIdx = i;
                                break;
                            }
                        }
                    }

                    if (targetFrame && targetContent) {
                        const canvasContainer = document.querySelector('.page, .canvas, .artboard') || document.body;
                        const mPos = this.getPureOffset(targetContent, canvasContainer);
                        return {
                            type: 'mobile-frame',
                            inner: canvasContainer,
                            area: canvasContainer,
                            frame: targetFrame,
                            content: targetContent,
                            frameIndex: frameIdx,
                            frameBounds: {
                                left: mPos.left,
                                top: mPos.top,
                                width: mPos.width || 360,
                                height: mPos.height || 810,
                                right: mPos.left + (mPos.width || 360),
                                bottom: mPos.top + (mPos.height || 810)
                            },
                            guideLayer: this.ensureGuideLayer(canvasContainer, 'canvas-guide-layer')
                        };
                    }
                }
            }

            // 4. Canvas Base Context (Base background of 1600x900 canvas, outside responsive columns, or non-responsive canvas)
            const canvasContainer = document.querySelector('.page, .canvas, .artboard') || document.body;
            if (canvasContainer) {
                return {
                    type: 'canvas',
                    inner: canvasContainer,
                    area: canvasContainer,
                    guideLayer: this.ensureGuideLayer(canvasContainer, 'canvas-guide-layer')
                };
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
                svg.style.zIndex = '300000';
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
            if (window.ResponsiveSmartGuideMath) {
                window.ResponsiveSmartGuideMath.findSnapTargets(context, activeEl);
            }
        },

        calculateSpacing: function(x, y, w, h, activeId) {
            return window.ResponsiveSmartGuideMath ? window.ResponsiveSmartGuideMath.calculateSpacing(x, y, w, h, activeId) : null;
        },

        calculateSnap: function(x, y, w, h, isArrowKey, activeId) {
            return window.ResponsiveSmartGuideMath ? window.ResponsiveSmartGuideMath.calculateSnap(x, y, w, h, isArrowKey, activeId) : { x: x, y: y };
        },

        drawGuides: function(context, snapData) {
            if (!context || !context.guideLayer) return;

            // Clear all other guide layers to prevent residual artifact lines
            document.querySelectorAll('.v4-responsive-guide-layer').forEach(function(layer) {
                if (layer !== context.guideLayer) {
                    layer.innerHTML = '';
                }
            });

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

                let y = active.centerY;
                if (!target.isFrame) {
                    const overlapTop = Math.max(active.top, target.top);
                    const overlapBottom = Math.min(active.bottom, target.bottom);
                    if (overlapTop < overlapBottom) {
                        y = (overlapTop + overlapBottom) / 2;
                    }
                }

                y = Math.max(10, Math.min(cHeight - 10, y));

                const currentLineCol = hBadgeCol;

                if (dist === 0) {
                    const contactX = (side === 'left') ? active.left : active.right;
                    htmlList.push('<line x1="' + contactX + '" y1="' + (y - 10) + '" x2="' + contactX + '" y2="' + (y + 10) + '" stroke="' + currentLineCol + '" stroke-width="1.8" />');
                } else {
                    htmlList.push('<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    htmlList.push('<line x1="' + x1 + '" y1="' + (y - 4) + '" x2="' + x1 + '" y2="' + (y + 4) + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    htmlList.push('<line x1="' + x2 + '" y1="' + (y - 4) + '" x2="' + x2 + '" y2="' + (y + 4) + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                }

                let cx = (dist === 0) ? ((side === 'left') ? active.left : active.right) : ((x1 + x2) / 2);
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);
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

                let x = active.centerX;
                if (!target.isFrame) {
                    const overlapLeft = Math.max(active.left, target.left);
                    const overlapRight = Math.min(active.right, target.right);
                    if (overlapLeft < overlapRight) {
                        x = (overlapLeft + overlapRight) / 2;
                    }
                }

                x = Math.max(16, Math.min(cWidth - 16, x));

                const currentLineCol = vBadgeCol;

                if (dist === 0) {
                    const contactY = (side === 'top') ? active.top : active.bottom;
                    htmlList.push('<line x1="' + (x - 10) + '" y1="' + contactY + '" x2="' + (x + 10) + '" y2="' + contactY + '" stroke="' + currentLineCol + '" stroke-width="1.8" />');
                } else {
                    htmlList.push('<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    htmlList.push('<line x1="' + (x - 4) + '" y1="' + y1 + '" x2="' + (x + 4) + '" y2="' + y1 + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                    htmlList.push('<line x1="' + (x - 4) + '" y1="' + y2 + '" x2="' + (x + 4) + '" y2="' + y2 + '" stroke="' + currentLineCol + '" stroke-width="1.2" />');
                }

                let cy = (dist === 0) ? ((side === 'top') ? active.top : active.bottom) : ((y1 + y2) / 2);
                const label = String(dist);
                const textWidth = Math.max(22, label.length * 7 + 10);

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

        clearHoverInspect: function(ctx) {
            if (!this.isHoverInspecting) return;
            this.isHoverInspecting = false;

            const activeEl = document.querySelector('.lf-component.selected') || window.activeEl;
            if (activeEl) {
                this.onSelect(activeEl, 7000);
                return;
            }

            if (!ctx) {
                ctx = this.getContainerContext(activeEl);
            }
            if (ctx && ctx.guideLayer) {
                ctx.guideLayer.innerHTML = '';
            } else {
                document.querySelectorAll('.v4-responsive-guide-layer').forEach(function(layer) {
                    layer.innerHTML = '';
                });
            }
        },

        calculatePairSpacing: function(activeEl, targetEl, ctx) {
            return window.ResponsiveSmartGuideMath ? window.ResponsiveSmartGuideMath.calculatePairSpacing(activeEl, targetEl, ctx) : null;
        },

        drawPairInspect: function(ctx, data) {
            if (!ctx || !ctx.guideLayer || !data) return;
            const svg = ctx.guideLayer;
            const htmlList = [];
            const strokeCol = '#f43f5e';
            const textCol = '#ffffff';
            const cWidth = data.cWidth || 1160;
            const cHeight = data.cHeight || 900;

            const t = data.targetRect;
            const a = data.activeRect;

            htmlList.push('<rect x="' + t.left + '" y="' + t.top + '" width="' + t.width + '" height="' + t.height + '" fill="rgba(244, 63, 94, 0.04)" stroke="' + strokeCol + '" stroke-width="1.5" stroke-dasharray="none" />');

            if (data.type === 'container') {
                const drawLineBadge = function(x1, y1, x2, y2, dist, isH) {
                    if (dist < 0) return;
                    if (dist === 0) {
                        htmlList.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + strokeCol + '" stroke-width="1.8" />');
                        return;
                    }
                    htmlList.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                    if (isH) {
                        htmlList.push('<line x1="' + x1 + '" y1="' + (y1 - 4) + '" x2="' + x1 + '" y2="' + (y1 + 4) + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                        htmlList.push('<line x1="' + x2 + '" y1="' + (y2 - 4) + '" x2="' + x2 + '" y2="' + (y2 + 4) + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                    } else {
                        htmlList.push('<line x1="' + (x1 - 4) + '" y1="' + y1 + '" x2="' + (x1 + 4) + '" y2="' + y1 + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                        htmlList.push('<line x1="' + (x2 - 4) + '" y1="' + y2 + '" x2="' + (x2 + 4) + '" y2="' + y2 + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                    }
                    const cx = (x1 + x2) / 2;
                    const cy = (y1 + y2) / 2;
                    const label = String(dist);
                    const textWidth = Math.max(22, label.length * 7 + 10);
                    const clampedX = Math.max(textWidth / 2 + 4, Math.min(cWidth - textWidth / 2 - 4, cx));
                    const clampedY = Math.max(11, Math.min(cHeight - 11, cy));
                    htmlList.push(
                        '<g>' +
                        '<rect x="' + (clampedX - textWidth / 2) + '" y="' + (clampedY - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + strokeCol + '" />' +
                        '<text x="' + clampedX + '" y="' + (clampedY + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Pretendard, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                        '</g>'
                    );
                };

                if (data.top >= 0) drawLineBadge(a.centerX, t.top, a.centerX, a.top, data.top, false);
                if (data.bottom >= 0) drawLineBadge(a.centerX, a.bottom, a.centerX, t.bottom, data.bottom, false);
                if (data.left >= 0) drawLineBadge(t.left, a.centerY, a.left, a.centerY, data.left, true);
                if (data.right >= 0) drawLineBadge(a.right, a.centerY, t.right, a.centerY, data.right, true);

                svg.innerHTML = htmlList.join('');
                return;
            }

            const h = data.hMatch;
            const v = data.vMatch;

            if (h && h.side !== 'overlap' && h.dist >= 0) {
                let y = a.centerY;
                const hasOverlapY = (a.top <= t.bottom && a.bottom >= t.top);
                if (hasOverlapY) {
                    const oTop = Math.max(a.top, t.top);
                    const oBottom = Math.min(a.bottom, t.bottom);
                    y = (oTop + oBottom) / 2;
                } else {
                    y = a.centerY;
                    const extX = (h.side === 'left') ? t.right : t.left;
                    const extY1 = (t.centerY < a.centerY) ? t.bottom : t.top;
                    htmlList.push('<line x1="' + extX + '" y1="' + extY1 + '" x2="' + extX + '" y2="' + y + '" stroke="' + strokeCol + '" stroke-width="1" stroke-dasharray="3,3" opacity="0.7" />');
                }

                htmlList.push('<line x1="' + h.x1 + '" y1="' + y + '" x2="' + h.x2 + '" y2="' + y + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + h.x1 + '" y1="' + (y - 4) + '" x2="' + h.x1 + '" y2="' + (y + 4) + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + h.x2 + '" y1="' + (y - 4) + '" x2="' + h.x2 + '" y2="' + (y + 4) + '" stroke="' + strokeCol + '" stroke-width="1.2" />');

                const cx = (h.x1 + h.x2) / 2;
                const label = String(h.dist);
                const textWidth = Math.max(22, label.length * 7 + 10);
                const clampedX = Math.max(textWidth / 2 + 4, Math.min(cWidth - textWidth / 2 - 4, cx));
                htmlList.push(
                    '<g>' +
                    '<rect x="' + (clampedX - textWidth / 2) + '" y="' + (y - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + strokeCol + '" />' +
                    '<text x="' + clampedX + '" y="' + (y + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Pretendard, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                    '</g>'
                );
            }

            if (v && v.side !== 'overlap' && v.dist >= 0) {
                let x = a.centerX;
                const hasOverlapX = (a.left <= t.right && a.right >= t.left);
                if (hasOverlapX) {
                    const oLeft = Math.max(a.left, t.left);
                    const oRight = Math.min(a.right, t.right);
                    x = (oLeft + oRight) / 2;
                } else {
                    x = a.centerX;
                    const extY = (v.side === 'top') ? t.bottom : t.top;
                    const extX1 = (t.centerX < a.centerX) ? t.right : t.left;
                    htmlList.push('<line x1="' + extX1 + '" y1="' + extY + '" x2="' + x + '" y2="' + extY + '" stroke="' + strokeCol + '" stroke-width="1" stroke-dasharray="3,3" opacity="0.7" />');
                }

                htmlList.push('<line x1="' + x + '" y1="' + v.y1 + '" x2="' + x + '" y2="' + v.y2 + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + (x - 4) + '" y1="' + v.y1 + '" x2="' + (x + 4) + '" y2="' + v.y1 + '" stroke="' + strokeCol + '" stroke-width="1.2" />');
                htmlList.push('<line x1="' + (x - 4) + '" y1="' + v.y2 + '" x2="' + (x + 4) + '" y2="' + v.y2 + '" stroke="' + strokeCol + '" stroke-width="1.2" />');

                const cy = (v.y1 + v.y2) / 2;
                const label = String(v.dist);
                const textWidth = Math.max(22, label.length * 7 + 10);
                const clampedY = Math.max(11, Math.min(cHeight - 11, cy));
                htmlList.push(
                    '<g>' +
                    '<rect x="' + (x - textWidth / 2) + '" y="' + (clampedY - 9) + '" width="' + textWidth + '" height="18" rx="4" fill="' + strokeCol + '" />' +
                    '<text x="' + x + '" y="' + (clampedY + 3.5) + '" fill="' + textCol + '" font-size="10px" font-weight="500" letter-spacing="-0.2px" text-anchor="middle" font-family="Pretendard, -apple-system, BlinkMacSystemFont, sans-serif">' + label + '</text>' +
                    '</g>'
                );
            }

            svg.innerHTML = htmlList.join('');
        },

        renderAltInspect: function(clientX, clientY) {
            const activeEl = document.querySelector('.lf-component.selected') || window.activeEl;
            if (!activeEl) {
                this.clearHoverInspect();
                return;
            }

            const ctx = this.getContainerContext(activeEl);
            if (!ctx || !ctx.guideLayer) return;

            this.isHoverInspecting = true;

            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }

            const elUnderMouse = document.elementFromPoint(clientX, clientY);
            if (!elUnderMouse) {
                this.clearHoverInspect(ctx);
                return;
            }

            let hoverTarget = elUnderMouse.closest('.lf-component');
            if (hoverTarget === activeEl || (hoverTarget && activeEl.contains(hoverTarget))) {
                hoverTarget = null;
            }

            if (hoverTarget) {
                const pairData = this.calculatePairSpacing(activeEl, hoverTarget, ctx);
                if (pairData) {
                    this.drawPairInspect(ctx, pairData);
                    return;
                }
            }

            const compUnderMouse = elUnderMouse.closest('.pc-content-inner, .mobile-content-inner, .pc-browser-frame, .mobile-frame, .page, #canvas');
            if (compUnderMouse) {
                const activePos = this.getPureOffset(activeEl, ctx.inner);
                const snapResult = this.calculateSnap(activePos.left, activePos.top, activePos.width || 100, activePos.height || 40, true, activeEl.id);
                this.drawGuides(ctx, snapResult);
                return;
            }

            this.clearHoverInspect(ctx);
        },

        bindAltInspectEvents: function() {
            if (this._altEventsBound) return;
            this._altEventsBound = true;

            const self = this;

            window.addEventListener('keydown', function(e) {
                if (e.key === 'Shift' || e.key === 'Alt') {
                    const inInput = e.target && (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
                    if (inInput) return;

                    self.isAltDown = true;
                    if (self.lastMousePos && (self.lastMousePos.x > 0 || self.lastMousePos.y > 0)) {
                        self.renderAltInspect(self.lastMousePos.x, self.lastMousePos.y);
                    }
                }
            }, true);

            window.addEventListener('keyup', function(e) {
                if (e.key === 'Shift' || e.key === 'Alt') {
                    if (!e.shiftKey && !e.altKey) {
                        self.isAltDown = false;
                        self.clearHoverInspect();
                    }
                }
            }, true);

            window.addEventListener('mousemove', function(e) {
                self.lastMousePos = { x: e.clientX, y: e.clientY };
                if (self.isAltDown) {
                    self.renderAltInspect(e.clientX, e.clientY);
                }
            }, true);

            window.addEventListener('blur', function() {
                self.isAltDown = false;
                self.clearHoverInspect();
            }, true);
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

            this.isHoverInspecting = false;

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
            const shapeLine = activeEl.querySelector('.v4-shape-line') || (activeEl.classList.contains('v4-shape-line') ? activeEl : null);
            const isLine = !!shapeLine;
            const w = activePos.width || activeEl.offsetWidth || (isLine ? 2 : 100);
            const h = activePos.height || activeEl.offsetHeight || (isLine ? 2 : 40);

            const snapResult = this.calculateSnap(curLeft, curTop, w, h, true, activeEl.id);
            this.drawGuides(ctx, snapResult);

            const delay = typeof autoDismissMs === 'number' ? Math.max(autoDismissMs, 7000) : 7000;
            this.selectionTimer = setTimeout(function() {
                ResponsiveSmartGuide.clearGuides(false);
                ResponsiveSmartGuide.selectionTimer = null;
            }, delay);
        },

        onNudge: function(activeEl) {
            if (!activeEl) return;
            const ctx = this.getContainerContext(activeEl);
            if (!ctx) return;

            this.isHoverInspecting = false;

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
                this.activeContext.inner !== ctx.inner || 
                this.lastActiveId !== activeEl.id || 
                this.spacingTargets.length === 0) {
                this.findSnapTargets(ctx, activeEl);
            }

            const activePos = this.getPureOffset(activeEl, ctx.inner);
            const curLeft = activePos.left;
            const curTop = activePos.top;
            const shapeLine = activeEl.querySelector('.v4-shape-line') || (activeEl.classList.contains('v4-shape-line') ? activeEl : null);
            const isLine = !!shapeLine;
            const w = activePos.width || activeEl.offsetWidth || (isLine ? 2 : 100);
            const h = activePos.height || activeEl.offsetHeight || (isLine ? 2 : 40);

            const snapResult = this.calculateSnap(curLeft, curTop, w, h, true, activeEl.id);
            this.drawGuides(ctx, snapResult);
        },

        onNudgeEnd: function() {
            if (this.clearTimer) {
                clearTimeout(this.clearTimer);
                this.clearTimer = null;
            }
            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }
            const self = this;
            this.selectionTimer = setTimeout(function() {
                self.clearGuides(false);
                self.selectionTimer = null;
            }, 7000);
        },

        collectSnapTargets: function() {
            return window.ResponsiveSmartGuideMath ? window.ResponsiveSmartGuideMath.collectSnapTargets() : { targets: [], rects: [] };
        },

        init: function() {
            this.bindAltInspectEvents();
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
