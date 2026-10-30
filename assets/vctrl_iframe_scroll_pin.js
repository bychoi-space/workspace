/**
 * assets/vctrl_iframe_scroll_pin.js
 * 
 * In-Place GPU-Accelerated Scroll Pinning Engine for Responsive Screens.
 * - Supports Top Sticky Headers (GNB, Searchbar) and Bottom Fixed Docks (PDP CTA, 5-Tab Bar).
 * - Operates strictly inside .mobile-content-inner and .pc-content-inner without DOM reparenting.
 * - Maintains 100% compatibility with UndoManager, ScreenSanitizer, and ResponsiveFrameUtils.
 * - Zero backtick collisions (Gateway 5 compliant).
 */

window.v4ScrollPinScript = `
(function() {
    console.log("%c [SCROLL PIN ENGINE] Initializing In-Place Virtual Sticky HUD Module... ", "background: #0ea5e9; color: #ffffff; font-weight: bold; padding: 3px 6px; border-radius: 4px;");

    function isResponsiveContext() {
        if (document.querySelector('[data-scroll-fixed]:not([data-scroll-fixed="none"])')) {
            return true;
        }
        if (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.isResponsive === 'function') {
            return window.ResponsiveFrameUtils.isResponsive(document);
        }
        if (typeof window.isResponsiveScreen === 'function') {
            return window.isResponsiveScreen();
        }
        return !!(document.querySelector('.pc-content-inner, .mobile-content-inner, .pc-browser-frame, .mobile-browser-frame, .pc-content-area, .mobile-compare-page, .frame-column, .mobile-content-area, .mobile-content'));
    }

    var ScrollPinEngine = {
        boundContainers: new Set(),
        scrollAreaStates: new WeakMap(),
        isRafPending: false,
        observer: null,

        getScrollAreaState: function(container) {
            if (!container || (typeof container !== 'object' && typeof container !== 'function')) {
                return {
                    lastScrollTop: 0,
                    accumulatedDelta: 0,
                    direction: 'none',
                    hideDownActive: false,
                    hideUpActive: false
                };
            }
            try {
                var state = this.scrollAreaStates.get(container);
                if (!state) {
                    state = {
                        lastScrollTop: container.scrollTop || 0,
                        accumulatedDelta: 0,
                        direction: 'none',
                        hideDownActive: false,
                        hideUpActive: false
                    };
                    this.scrollAreaStates.set(container, state);
                }
                return state;
            } catch(e) {
                return {
                    lastScrollTop: 0,
                    accumulatedDelta: 0,
                    direction: 'none',
                    hideDownActive: false,
                    hideUpActive: false
                };
            }
        },

        onContainerScroll: function(container) {
            var state = this.getScrollAreaState(container);
            var currentScrollTop = container.scrollTop || 0;
            var delta = currentScrollTop - state.lastScrollTop;

            if (currentScrollTop <= 30) {
                state.direction = 'none';
                state.accumulatedDelta = 0;
                state.hideDownActive = false;
                state.hideUpActive = false;
            } else if (delta > 0) {
                if (state.direction !== 'down') {
                    state.direction = 'down';
                    state.accumulatedDelta = 0;
                }
                state.accumulatedDelta += delta;
                if (state.accumulatedDelta >= 12 && currentScrollTop > 60) {
                    state.hideDownActive = true;
                    state.hideUpActive = false;
                }
            } else if (delta < 0) {
                if (state.direction !== 'up') {
                    state.direction = 'up';
                    state.accumulatedDelta = 0;
                }
                state.accumulatedDelta += Math.abs(delta);
                if (state.accumulatedDelta >= 10) {
                    state.hideDownActive = false;
                    state.hideUpActive = true;
                }
            }
            state.lastScrollTop = currentScrollTop;
        },

        init: function() {
            var self = this;
            if (!isResponsiveContext()) {
                return;
            }

            self.bindAllContainers();
            self.setupMutationObserver();
            self.updatePins();

            window.addEventListener('resize', function() {
                self.scheduleUpdate();
            }, { passive: true });

            console.log("%c [SCROLL PIN ENGINE] Ready & Active ", "color: #00e5ff; font-weight: 600;");
        },

        bindAllContainers: function() {
            var self = this;
            var containers = document.querySelectorAll('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content, .chrome-content-area');
            containers.forEach(function(container) {
                if (!self.boundContainers.has(container)) {
                    self.boundContainers.add(container);
                    container.addEventListener('scroll', function() {
                        self.onContainerScroll(container);
                        self.scheduleUpdate();
                    }, { passive: true });
                }
            });
            if (!self.boundContainers.has(window)) {
                self.boundContainers.add(window);
                window.addEventListener('scroll', function() {
                    var winContainer = document.scrollingElement || document.documentElement || document.body;
                    if (winContainer) self.onContainerScroll(winContainer);
                    self.scheduleUpdate();
                }, { passive: true });
            }
        },

        scheduleUpdate: function() {
            var self = this;
            if (self.isRafPending) return;
            self.isRafPending = true;
            window.requestAnimationFrame(function() {
                self.isRafPending = false;
                self.updatePins();
            });
        },

        updatePins: function() {
            var self = this;
            var pinnedEls = Array.from(document.querySelectorAll('[data-scroll-fixed]:not([data-scroll-fixed="none"])'));
            if (!pinnedEls || pinnedEls.length === 0) return;

            // Separate elements into hosts (shapes/atoms/groups) and description pins
            var hosts = [];
            var pins = [];
            pinnedEls.forEach(function(el) {
                if (!el || !el.isConnected) return;
                var isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');
                if (isPin) {
                    pins.push(el);
                } else {
                    hosts.push(el);
                }
            });

            // Pass 1: Calculate and apply transforms for all non-pin host components, caching exact GPU transforms
            var hostTransformMap = new Map();

            hosts.forEach(function(el) {
                if (el.classList.contains('dragging-now')) return;

                var mode = el.getAttribute('data-scroll-fixed');
                if (!mode || mode === 'none') return;

                var scrollArea = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getScrollArea === 'function')
                    ? window.ResponsiveFrameUtils.getScrollArea(el)
                    : el.closest('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content');

                if (!scrollArea) {
                    scrollArea = document.scrollingElement || document.documentElement || document.body || window;
                }

                var scrollTop = scrollArea.scrollTop || 0;
                var dy = 0;
                var isActivelyFixed = false;
                var effect = el.getAttribute('data-scroll-effect') || 'always';
                var areaState = ScrollPinEngine.getScrollAreaState(scrollArea);
                var isHidden = (effect === 'hide-down' && areaState.hideDownActive) || (effect === 'hide-up' && areaState.hideUpActive);

                if (mode === 'top') {
                    var domTop = parseFloat(el.style.top) || 0;
                    var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                    if (isHidden) {
                        dy = scrollTop - domTop - elH;
                    } else {
                        dy = scrollTop - domTop;
                    }
                    isActivelyFixed = (scrollTop > Math.max(0, domTop)) && !isHidden;
                } else if (mode === 'bottom') {
                    var viewportH = scrollArea.clientHeight || 810;
                    var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                    var domTop = parseFloat(el.style.top) || 0;
                    var targetViewportTop = Math.max(0, viewportH - elH);
                    if (isHidden) {
                        dy = scrollTop + (viewportH - domTop);
                    } else {
                        dy = scrollTop + (targetViewportTop - domTop);
                    }
                    var isAtNaturalRest = (scrollTop <= 0 && Math.abs(domTop - targetViewportTop) <= 2);
                    isActivelyFixed = !isAtNaturalRest && !isHidden;
                } else if (mode === 'custom' || mode === 'floating') {
                    var domTop = parseFloat(el.style.top) || 0;
                    var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                    var rawTargetY = el.getAttribute('data-scroll-target-y');
                    var targetViewportY = (rawTargetY !== null && rawTargetY !== '') ? parseFloat(rawTargetY) : domTop;
                    if (isNaN(targetViewportY)) targetViewportY = domTop;
                    if (isHidden) {
                        dy = scrollTop - domTop - elH;
                    } else {
                        dy = scrollTop + (targetViewportY - domTop);
                    }
                    isActivelyFixed = (scrollTop > 0 || Math.abs(dy) > 2) && !isHidden;
                } else if (mode === 'sticky') {
                    var domTop = parseFloat(el.style.top) || 0;
                    var rawStickyTop = el.getAttribute('data-scroll-sticky-top');
                    var stickyThresholdY = (rawStickyTop !== null && rawStickyTop !== '') ? parseFloat(rawStickyTop) : 0;
                    if (isNaN(stickyThresholdY)) stickyThresholdY = 0;
                    var scrollDistanceToStick = Math.max(0, domTop - stickyThresholdY);
                    if (scrollTop > scrollDistanceToStick) {
                        dy = scrollTop - scrollDistanceToStick;
                    } else {
                        dy = 0;
                    }
                    isActivelyFixed = (scrollTop > scrollDistanceToStick);
                } else if (mode === 'sticky-bottom') {
                    var viewportH = scrollArea.clientHeight || 810;
                    var domTop = parseFloat(el.style.top) || 0;
                    var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                    var rawStickyBottom = el.getAttribute('data-scroll-sticky-bottom');
                    var stickyBottomOffset = (rawStickyBottom !== null && rawStickyBottom !== '') ? parseFloat(rawStickyBottom) : 0;
                    if (isNaN(stickyBottomOffset)) stickyBottomOffset = 0;

                    var fixedTargetY = (scrollTop + viewportH - stickyBottomOffset) - elH;
                    if (fixedTargetY < domTop) {
                        dy = fixedTargetY - domTop;
                    } else {
                        dy = 0;
                    }
                    isActivelyFixed = (fixedTargetY < domTop);
                }

                // Dynamically toggle divider line visibility based on active fixed state
                if (el.hasAttribute('data-scroll-divider')) {
                    if (isActivelyFixed) {
                        if (!el.hasAttribute('data-scroll-divider-active')) {
                            el.setAttribute('data-scroll-divider-active', 'true');
                        }
                    } else {
                        if (el.hasAttribute('data-scroll-divider-active')) {
                            el.removeAttribute('data-scroll-divider-active');
                        }
                    }
                } else if (el.hasAttribute('data-scroll-divider-active')) {
                    el.removeAttribute('data-scroll-divider-active');
                }

                // Apply GPU-accelerated transform
                var transformStr = 'translate3d(0px, ' + Math.round(dy) + 'px, 0px)';
                if (el.style.transform !== transformStr) {
                    el.style.setProperty('transform', transformStr, 'important');
                }

                // Manage smooth transition for animated scroll effects (hide-down / hide-up)
                var isAnimatedEffect = (effect === 'hide-down' || effect === 'hide-up');
                var isDragging = el.classList.contains('dragging-now') || (window.V4DragResizeEngine && window.V4DragResizeEngine.isDragging);
                if (isAnimatedEffect && !isDragging) {
                    var smartTrans = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
                    if (el.style.transition !== smartTrans) {
                        el.style.setProperty('transition', smartTrans);
                    }
                } else if (el.style.transition && el.style.transition.indexOf('transform') !== -1) {
                    el.style.removeProperty('transition');
                }

                // Enforce appropriate tier z-index
                var curZ = parseInt(el.style.zIndex, 10);
                if (isNaN(curZ) || curZ < 100000) {
                    el.style.zIndex = '100000';
                }
                if (!el.style.willChange) {
                    el.style.willChange = 'transform';
                }

                // Cache exact transform & transition by host element ID
                if (el.id) {
                    hostTransformMap.set(el.id, {
                        transform: transformStr,
                        transition: el.style.transition || '',
                        dy: dy,
                        isActivelyFixed: isActivelyFixed
                    });
                }
            });

            // Pass 2: Synchronize all description pins with their fixed hosts or viewport mode
            pins.forEach(function(p) {
                if (p.classList.contains('dragging-now')) return;

                if (p.hasAttribute('data-fixed-host')) {
                    var hostId = p.getAttribute('data-fixed-host');
                    var hostInfo = hostTransformMap.get(hostId);

                    if (!hostInfo) {
                        var hostEl = hostId ? document.getElementById(hostId) : null;
                        if (!hostEl || !hostEl.isConnected || !hostEl.hasAttribute('data-scroll-fixed') || hostEl.getAttribute('data-scroll-fixed') === 'none') {
                            // Self-healing: if host does not exist or is no longer scroll-pinned, release pin
                            p.removeAttribute('data-scroll-fixed');
                            p.removeAttribute('data-fixed-host');
                            p.style.removeProperty('transform');
                            p.style.removeProperty('will-change');
                            p.style.removeProperty('transition');
                            p.style.setProperty('z-index', '200000', 'important');
                            if (typeof window.notifyParent === 'function') {
                                var pIdx = parseInt(p.getAttribute('data-index'), 10);
                                if (isNaN(pIdx)) {
                                    pIdx = parseInt((p.id || '').replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''), 10);
                                }
                                var fType = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getFrameType === 'function') ? window.ResponsiveFrameUtils.getFrameType(p) : (p.getAttribute('data-frame') || '');
                                window.notifyParent({ type: 'LF_UPDATE_PIN_POS', index: pIdx, frame: fType, x: parseFloat(p.style.left) || 0, y: parseFloat(p.style.top) || 0, fixedHost: null, scrollFixed: 'none', standardized: true });
                            }
                            return;
                        }
                        hostInfo = {
                            transform: hostEl.style.transform || 'translate3d(0px, 0px, 0px)',
                            transition: hostEl.style.transition || ''
                        };
                    }

                    if (p.style.transform !== hostInfo.transform) {
                        p.style.setProperty('transform', hostInfo.transform, 'important');
                    }
                    p.style.setProperty('z-index', '200050', 'important');
                    if (!p.style.willChange) p.style.willChange = 'transform';
                    if (hostInfo.transition) {
                        if (p.style.transition !== hostInfo.transition) p.style.setProperty('transition', hostInfo.transition);
                    } else if (p.style.transition) {
                        p.style.removeProperty('transition');
                    }
                    return;
                }

                // Independent Viewport Fixed Pin
                var mode = p.getAttribute('data-scroll-fixed');
                if (mode === 'viewport' || mode === 'fixed' || mode === 'top') {
                    var scrollArea = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getScrollArea === 'function')
                        ? window.ResponsiveFrameUtils.getScrollArea(p)
                        : p.closest('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content');
                    if (!scrollArea) scrollArea = document.scrollingElement || document.documentElement || document.body || window;
                    var scrollTop = scrollArea.scrollTop || 0;
                    var transformStr = 'translate3d(0px, ' + Math.round(scrollTop) + 'px, 0px)';
                    if (p.style.transform !== transformStr) {
                        p.style.setProperty('transform', transformStr, 'important');
                    }
                    p.style.setProperty('z-index', '200050', 'important');
                    if (!p.style.willChange) p.style.willChange = 'transform';
                } else {
                    p.style.removeProperty('transform');
                    p.style.removeProperty('will-change');
                    p.style.setProperty('z-index', '200000', 'important');
                }
            });

            // Follow selected pinned element in real-time
            if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
                if (document.querySelector('.lf-component.selected[data-scroll-fixed]')) {
                    window.SelectionAdorner.update();
                }
            }
        },

        setupMutationObserver: function() {
            var self = this;
            if (typeof MutationObserver === 'undefined') return;
            if (self.observer) {
                try { self.observer.disconnect(); } catch(e) {}
            }

            self.observer = new MutationObserver(function(mutations) {
                var needsRebind = false;
                var needsUpdate = false;

                for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'childList') {
                        needsRebind = true;
                        needsUpdate = true;
                        break;
                    } else if (m.type === 'attributes' && m.attributeName === 'data-scroll-fixed') {
                        needsUpdate = true;
                        break;
                    }
                }

                if (needsRebind) {
                    self.bindAllContainers();
                }
                if (needsUpdate) {
                    self.scheduleUpdate();
                }
            });

            var target = document.body;
            if (target) {
                self.observer.observe(target, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['data-scroll-fixed']
                });
            }
        },

        resetPins: function() {
            var pinnedEls = document.querySelectorAll('[data-scroll-fixed], .pin-marker');
            pinnedEls.forEach(function(el) {
                el.style.removeProperty('transform');
                el.style.removeProperty('will-change');
            });
        }
    };

    window.ScrollPinEngine = ScrollPinEngine;

    // Register Message Handler for Dynamic Toggle
    if (!window.v4MessageHandlers) window.v4MessageHandlers = {};
    window.v4MessageHandlers['LF_SET_SCROLL_FIXED'] = function(d) {
        if (!d || typeof d !== 'object') return;
        if (!d.mode || typeof d.mode !== 'string') {
            console.warn('[ScrollPinEngine] Ignored LF_SET_SCROLL_FIXED with invalid or missing mode:', d);
            return;
        }

        // Self-heal: ensure containers are bound even if initial DOM was empty or loaded late
        if (!ScrollPinEngine.boundContainers || ScrollPinEngine.boundContainers.size === 0) {
            ScrollPinEngine.bindAllContainers();
            ScrollPinEngine.setupMutationObserver();
        }

        var ids = d.ids || (d.id ? [d.id] : []);
        if (ids.length === 0) return;

        if (window.V4UndoManager && typeof window.V4UndoManager.saveState === 'function') {
            window.V4UndoManager.saveState();
        }

        var maxAnyZ = 1000;
        var maxNormalZ = 1000;
        var maxFixedZ = 100000;
        var allComps = document.querySelectorAll ? document.querySelectorAll('.lf-component') : [];
        allComps.forEach(function(c) {
            if (c.classList.contains('pin-marker')) return;
            var z = parseInt(c.style.zIndex, 10);
            if (isNaN(z)) {
                var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                z = isNaN(compZ) ? 1000 : compZ;
            }
            if (z >= 190000) return;
            if (z > maxAnyZ) maxAnyZ = z;
            if (c.hasAttribute('data-scroll-fixed')) {
                if (z > maxFixedZ) maxFixedZ = z;
            } else {
                if (z > maxNormalZ) maxNormalZ = z;
            }
        });

        ids.forEach(function(targetId) {
            var el = document.getElementById(targetId);
            if (!el) return;

            var isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');
            var isPinFixed = isPin && (d.mode === 'viewport' || d.mode === 'fixed' || d.mode === 'top');
            var isObjFixed = !isPin && (d.mode === 'top' || d.mode === 'bottom' || d.mode === 'custom' || d.mode === 'floating' || d.mode === 'sticky' || d.mode === 'sticky-bottom' || d.mode === 'smart');

            if (isPinFixed) {
                var pinIdx = el.getAttribute('data-index');
                var targetPins = (pinIdx !== null && pinIdx !== undefined) ? Array.from(document.querySelectorAll('.pin-marker[data-index="' + pinIdx + '"], .text-marker[data-index="' + pinIdx + '"]')) : [el];
                targetPins.forEach(function(p) {
                    p.setAttribute('data-scroll-fixed', 'viewport');
                    p.removeAttribute('data-fixed-host');
                    p.style.setProperty('z-index', '200050', 'important');
                    p.style.willChange = 'transform';
                });
            } else if (isObjFixed) {
                var effectiveMode = (d.mode === 'floating') ? 'custom' : d.mode;

                // Backup current normal Z-index before elevating to Tier 2 (100,000+)
                var currentNormalZ = parseInt(el.style.zIndex, 10);
                if (!isNaN(currentNormalZ) && currentNormalZ < 100000) {
                    el.setAttribute('data-pre-fixed-z', String(currentNormalZ));
                } else if (!el.hasAttribute('data-pre-fixed-z')) {
                    var computedZ = parseInt(window.getComputedStyle(el).zIndex, 10);
                    if (!isNaN(computedZ) && computedZ < 100000) {
                        el.setAttribute('data-pre-fixed-z', String(computedZ));
                    }
                }

                var baseline = Math.max(100000, maxAnyZ);
                maxFixedZ = Math.max(maxFixedZ, baseline) + 10;
                var targetZ = maxFixedZ;
                el.setAttribute('data-scroll-fixed', effectiveMode);
                el.style.zIndex = String(targetZ);
                el.style.willChange = 'transform';

                if (effectiveMode === 'custom') {
                    var targetY = (d.targetY !== undefined && d.targetY !== null) ? d.targetY : (parseFloat(el.style.top) || el.offsetTop || 0);
                    el.setAttribute('data-scroll-target-y', String(Math.round(targetY)));
                    el.removeAttribute('data-scroll-sticky-top');
                    el.removeAttribute('data-scroll-sticky-bottom');
                } else if (effectiveMode === 'sticky') {
                    var stickyTop = (d.stickyTop !== undefined && d.stickyTop !== null) ? d.stickyTop : 0;
                    el.setAttribute('data-scroll-sticky-top', String(Math.round(stickyTop)));
                    el.removeAttribute('data-scroll-target-y');
                    el.removeAttribute('data-scroll-sticky-bottom');
                } else if (effectiveMode === 'sticky-bottom') {
                    var stickyBottom = (d.stickyBottom !== undefined && d.stickyBottom !== null) ? d.stickyBottom : 0;
                    el.setAttribute('data-scroll-sticky-bottom', String(Math.round(stickyBottom)));
                    el.removeAttribute('data-scroll-target-y');
                    el.removeAttribute('data-scroll-sticky-top');
                } else {
                    el.removeAttribute('data-scroll-target-y');
                    el.removeAttribute('data-scroll-sticky-top');
                    el.removeAttribute('data-scroll-sticky-bottom');
                }

                if (d.effect && (d.effect === 'hide-down' || d.effect === 'hide-up')) {
                    el.setAttribute('data-scroll-effect', d.effect);
                } else if (d.effect === 'always' || d.effect === 'none' || d.effect === '') {
                    el.removeAttribute('data-scroll-effect');
                }

                if (d.divider === true) {
                    var divPos = (effectiveMode === 'bottom' || effectiveMode === 'sticky-bottom') ? 'top' : 'bottom';
                    el.setAttribute('data-scroll-divider', divPos);
                } else if (d.divider === false) {
                    el.removeAttribute('data-scroll-divider');
                    el.removeAttribute('data-scroll-divider-active');
                } else if (el.hasAttribute('data-scroll-divider')) {
                    var updatedDivPos = (effectiveMode === 'bottom' || effectiveMode === 'sticky-bottom') ? 'top' : 'bottom';
                    el.setAttribute('data-scroll-divider', updatedDivPos);
                }

                    // Self-healing: eliminate any auto-injected background to preserve custom shape transparency and border-radius
                    try {
                        if (el.dataset && el.dataset.autoBg === 'true') {
                            el.style.backgroundColor = '';
                            el.style.removeProperty('background-color');
                            delete el.dataset.autoBg;
                            el.removeAttribute('data-auto-bg');
                        }
                        if (el.querySelector && el.querySelector('.v4-shape, .v4-shape-circle, .v4-shape-rect, .v4-shape-triangle, .v4-shape-diamond, .v4-shape-wave, .lf-icon, svg')) {
                            if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') {
                                el.style.backgroundColor = '';
                                el.style.removeProperty('background-color');
                            }
                            if (el.dataset && el.dataset.autoBg) {
                                delete el.dataset.autoBg;
                                el.removeAttribute('data-auto-bg');
                            }
                        }
                    } catch(e) {}

                    // Elevate DOM hierarchy to topmost sibling to prevent any stacking context collisions
                    var parent = el.parentElement;
                    if (parent) {
                        var trailingRef = Array.from(parent.children).find(function(c) {
                            return (c.classList && c.classList.contains('v4-pin-layer')) || (!c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script'));
                        });
                        if (trailingRef && trailingRef.parentNode === parent) {
                            parent.insertBefore(el, trailingRef);
                        } else {
                            parent.appendChild(el);
                        }

                        // Auto-sync any description pins sitting on this newly pinned host using bounding rect coordinates
                        var hRect = el.getBoundingClientRect();
                        var frameContainer = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getContainer === 'function')
                            ? window.ResponsiveFrameUtils.getContainer(el)
                            : (el.closest('.pc-content-inner, .mobile-content-inner, .pc-content-area, .mobile-content-area') || parent);
                        var allPinsInFrame = frameContainer ? frameContainer.querySelectorAll('.lf-component.pin-marker, .lf-component.text-marker') : document.querySelectorAll('.lf-component.pin-marker, .lf-component.text-marker');

                        allPinsInFrame.forEach(function(p) {
                            if (!p || p === el) return;
                            var pRect = p.getBoundingClientRect();
                            var pCenterX = pRect.left + pRect.width / 2;
                            var pCenterY = pRect.top + pRect.height / 2;
                            if (pCenterX >= hRect.left && pCenterX <= hRect.right &&
                                pCenterY >= hRect.top && pCenterY <= hRect.bottom) {
                                p.setAttribute('data-scroll-fixed', effectiveMode);
                                if (el.id) p.setAttribute('data-fixed-host', el.id);
                                p.style.setProperty('z-index', '200050', 'important');
                                p.style.willChange = 'transform';
                                if (el.style.transform) {
                                    p.style.setProperty('transform', el.style.transform, 'important');
                                }
                                if (typeof window.notifyParent === 'function') {
                                    var pIdx = parseInt(p.getAttribute('data-index'), 10);
                                    if (isNaN(pIdx)) {
                                        pIdx = parseInt((p.id || '').replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''), 10);
                                    }
                                    var fType = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getFrameType === 'function')
                                        ? window.ResponsiveFrameUtils.getFrameType(p)
                                        : (p.getAttribute('data-frame') || '');
                                    window.notifyParent({
                                        type: 'LF_UPDATE_PIN_POS',
                                        index: pIdx,
                                        frame: fType,
                                        x: parseFloat(p.style.left) || 0,
                                        y: parseFloat(p.style.top) || 0,
                                        fixedHost: el.id || null,
                                        scrollFixed: effectiveMode,
                                        standardized: true
                                    });
                                }
                            }
                        });
                    }
            } else {
                if (isPin) {
                    var pinIdx = el.getAttribute('data-index');
                    var targetPins = (pinIdx !== null && pinIdx !== undefined && pinIdx !== '') ? Array.from(document.querySelectorAll('.pin-marker[data-index="' + pinIdx + '"], .text-marker[data-index="' + pinIdx + '"]')) : [el];
                    if (targetPins.indexOf(el) === -1) targetPins.push(el);
                    targetPins.forEach(function(p) {
                        p.removeAttribute('data-scroll-fixed');
                        p.removeAttribute('data-fixed-host');
                        p.style.removeProperty('transform');
                        p.style.removeProperty('will-change');
                        p.style.setProperty('z-index', '200000', 'important');
                    });
                } else {
                    var hLeft = parseFloat(el.style.left) || el.offsetLeft || 0;
                    var hTop = parseFloat(el.style.top) || el.offsetTop || 0;
                    var hWidth = parseFloat(el.style.width) || el.offsetWidth || 0;
                    var hHeight = parseFloat(el.style.height) || el.offsetHeight || 0;

                    el.removeAttribute('data-scroll-fixed');
                    el.removeAttribute('data-scroll-effect');
                    el.removeAttribute('data-scroll-target-y');
                    el.removeAttribute('data-scroll-sticky-top');
                    el.removeAttribute('data-scroll-sticky-bottom');
                    el.removeAttribute('data-scroll-divider');
                    el.removeAttribute('data-scroll-divider-active');
                    el.style.removeProperty('transform');
                    el.style.removeProperty('will-change');
                    el.style.removeProperty('transition');

                    // Restore pre-fixed Z-index if preserved, avoiding artificial inflation
                    var preFixedZ = parseInt(el.getAttribute('data-pre-fixed-z'), 10);
                    if (!isNaN(preFixedZ) && preFixedZ > 0 && preFixedZ < 100000) {
                        el.style.zIndex = String(preFixedZ);
                    } else {
                        maxNormalZ = Math.min(69900, maxNormalZ + 10);
                        el.style.zIndex = String(Math.max(1010, maxNormalZ));
                    }
                    el.removeAttribute('data-pre-fixed-z');

                    if (el.dataset && el.dataset.autoBg === 'true') {
                        el.style.backgroundColor = '';
                        el.style.removeProperty('background-color');
                        delete el.dataset.autoBg;
                        el.removeAttribute('data-auto-bg');
                    }
                    if (el.querySelector && el.querySelector('.v4-shape, .v4-shape-circle, .v4-shape-rect, .v4-shape-triangle, .v4-shape-diamond, .v4-shape-wave, .lf-icon, svg')) {
                        if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') {
                            el.style.backgroundColor = '';
                            el.style.removeProperty('background-color');
                        }
                    }

                    // Cascade unpin to any pins that were pinned on this host
                    var allHostPins = document.querySelectorAll('.pin-marker[data-scroll-fixed], .text-marker[data-scroll-fixed]');
                    allHostPins.forEach(function(p) {
                        if (!p || p === el) return;
                        var isPinnedToHost = (p.getAttribute('data-fixed-host') === el.id);
                        if (!isPinnedToHost && el.id) {
                            var pRect = p.getBoundingClientRect();
                            var hRect = el.getBoundingClientRect();
                            var pCenterX = pRect.left + pRect.width / 2;
                            var pCenterY = pRect.top + pRect.height / 2;
                            isPinnedToHost = (pCenterX >= hRect.left && pCenterX <= hRect.right &&
                                              pCenterY >= hRect.top && pCenterY <= hRect.bottom);
                        }
                        if (isPinnedToHost) {
                            p.removeAttribute('data-scroll-fixed');
                            p.removeAttribute('data-fixed-host');
                            p.style.removeProperty('transform');
                            p.style.removeProperty('will-change');
                            p.style.removeProperty('transition');
                            p.style.setProperty('z-index', '200000', 'important');
                            if (typeof window.notifyParent === 'function') {
                                var pIdx = parseInt(p.getAttribute('data-index'), 10);
                                if (isNaN(pIdx)) {
                                    pIdx = parseInt((p.id || '').replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''), 10);
                                }
                                var fType = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getFrameType === 'function')
                                    ? window.ResponsiveFrameUtils.getFrameType(p)
                                    : (p.getAttribute('data-frame') || '');
                                window.notifyParent({
                                    type: 'LF_UPDATE_PIN_POS',
                                    index: pIdx,
                                    frame: fType,
                                    x: parseFloat(p.style.left) || 0,
                                    y: parseFloat(p.style.top) || 0,
                                    fixedHost: null,
                                    scrollFixed: 'none',
                                    standardized: true
                                });
                            }
                        }
                    });
                }
            }
        });

        ScrollPinEngine.scheduleUpdate();
        if (typeof window.markDirty === 'function') window.markDirty();
    };

    // Auto-bootstrap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ScrollPinEngine.init();
        });
    } else {
        ScrollPinEngine.init();
    }
})();
`;
