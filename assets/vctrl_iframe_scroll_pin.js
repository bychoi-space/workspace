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
            var containers = document.querySelectorAll('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content');
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
            var pinnedEls = document.querySelectorAll('[data-scroll-fixed]:not([data-scroll-fixed="none"])');
            if (!pinnedEls || pinnedEls.length === 0) return;

            // Map host dy for bottom-pinned elements so pins on them share exact same dy
            var bottomHostDyMap = new Map();

            pinnedEls.forEach(function(el) {
                if (!el || !el.isConnected) return;
                var isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');
                if (isPin) return; // Calculate non-pin hosts first

                var mode = el.getAttribute('data-scroll-fixed');
                if (mode !== 'bottom') return;

                var scrollArea = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getScrollArea === 'function')
                    ? window.ResponsiveFrameUtils.getScrollArea(el)
                    : el.closest('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content');
                if (!scrollArea) {
                    scrollArea = document.scrollingElement || document.documentElement || document.body || window;
                }

                var scrollTop = scrollArea.scrollTop || 0;
                var viewportH = scrollArea.clientHeight || 810;
                var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                var domTop = parseFloat(el.style.top) || 0;
                var targetViewportTop = Math.max(0, viewportH - elH);
                var effect = el.getAttribute('data-scroll-effect') || 'always';
                var areaState = ScrollPinEngine.getScrollAreaState(scrollArea);
                var isHidden = (effect === 'hide-down' && areaState.hideDownActive) || (effect === 'hide-up' && areaState.hideUpActive);
                var dy = isHidden ? (scrollTop + (viewportH - domTop)) : (scrollTop + (targetViewportTop - domTop));
                bottomHostDyMap.set(el.parentElement, dy);
            });

            pinnedEls.forEach(function(el) {
                if (!el || !el.isConnected) return;

                // Skip position override while user is actively dragging the element
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
                var isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');

                // Check host-pinned cascade first for pins sitting on a pinned component
                if (isPin && el.hasAttribute('data-fixed-host')) {
                    var hostId = el.getAttribute('data-fixed-host');
                    var hostEl = hostId ? document.getElementById(hostId) : null;
                    // Self-healing: if host element does not exist, is disconnected, or is no longer fixed, release pin
                    if (!hostEl || !hostEl.isConnected || !hostEl.hasAttribute('data-scroll-fixed') || hostEl.getAttribute('data-scroll-fixed') === 'none') {
                        el.removeAttribute('data-scroll-fixed');
                        el.removeAttribute('data-fixed-host');
                        el.style.removeProperty('transform');
                        el.style.removeProperty('will-change');
                        el.style.setProperty('z-index', '200000', 'important');
                        return;
                    }
                    if (hostEl.style.transform) {
                        el.style.setProperty('transform', hostEl.style.transform, 'important');
                        el.style.setProperty('z-index', '200050', 'important');
                        if (hostEl.style.transition) {
                            el.style.transition = hostEl.style.transition;
                        } else {
                            el.style.removeProperty('transition');
                        }
                        return;
                    }
                }

                var effect = el.getAttribute('data-scroll-effect') || 'always';
                var areaState = ScrollPinEngine.getScrollAreaState(scrollArea);
                var isHidden = (effect === 'hide-down' && areaState.hideDownActive) || (effect === 'hide-up' && areaState.hideUpActive);

                if (isPin) {
                    // Description Pin: Viewport Fixed Mode vs Content Mode
                    if (mode === 'viewport' || mode === 'fixed' || mode === 'top') {
                        dy = scrollTop;
                    } else if (bottomHostDyMap.has(el.parentElement)) {
                        dy = bottomHostDyMap.get(el.parentElement);
                    } else {
                        dy = 0;
                    }
                } else if (mode === 'top') {
                    // Pinned to Top of Viewport with Optional Scroll Effect (hide-down / hide-up)
                    var domTop = parseFloat(el.style.top) || 0;
                    var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                    if (isHidden) {
                        dy = scrollTop - domTop - elH;
                    } else {
                        dy = scrollTop - domTop;
                    }
                } else if (mode === 'bottom') {
                    // Pinned to Bottom of Viewport with Optional Scroll Effect (hide-down / hide-up)
                    var viewportH = scrollArea.clientHeight || 810;
                    var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                    var domTop = parseFloat(el.style.top) || 0;
                    var targetViewportTop = Math.max(0, viewportH - elH);
                    if (isHidden) {
                        dy = scrollTop + (viewportH - domTop);
                    } else {
                        dy = scrollTop + (targetViewportTop - domTop);
                    }
                } else if (mode === 'custom' || mode === 'floating') {
                    // Custom Floating HUD: Maintain specified or captured viewport Y offset
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
                } else if (mode === 'sticky') {
                    // Threshold Sticky HUD: Scroll with content until reaching target threshold from viewport top
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
                } else if (!isPin) {
                    if (el.style.transition && el.style.transition.indexOf('transform') !== -1) {
                        el.style.removeProperty('transition');
                    }
                }

                // Enforce appropriate tier z-index
                if (isPin) {
                    el.style.setProperty('z-index', '200050', 'important');
                } else {
                    var curZ = parseInt(el.style.zIndex, 10);
                    if (isNaN(curZ) || curZ < 100000) {
                        el.style.zIndex = '100000';
                    }
                }
                if (!el.style.willChange) {
                    el.style.willChange = 'transform';
                }

                // Self-healing: eliminate any auto-injected background to preserve shape transparency and border-radius
                try {
                    if (el.dataset && el.dataset.autoBg === 'true') {
                        el.style.backgroundColor = '';
                        el.style.removeProperty('background-color');
                        delete el.dataset.autoBg;
                        el.removeAttribute('data-auto-bg');
                    }
                    if (!isPin && el.querySelector && el.querySelector('.v4-shape, .v4-shape-circle, .v4-shape-rect, .v4-shape-triangle, .v4-shape-diamond, .v4-shape-wave, .lf-icon, svg')) {
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
            });

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
        if (!d) return;
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
            var isObjFixed = !isPin && (d.mode === 'top' || d.mode === 'bottom' || d.mode === 'custom' || d.mode === 'floating' || d.mode === 'sticky' || d.mode === 'smart');

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
                } else if (effectiveMode === 'sticky') {
                    var stickyTop = (d.stickyTop !== undefined && d.stickyTop !== null) ? d.stickyTop : 0;
                    el.setAttribute('data-scroll-sticky-top', String(Math.round(stickyTop)));
                    el.removeAttribute('data-scroll-target-y');
                } else {
                    el.removeAttribute('data-scroll-target-y');
                    el.removeAttribute('data-scroll-sticky-top');
                }

                if (d.effect && (d.effect === 'hide-down' || d.effect === 'hide-up')) {
                    el.setAttribute('data-scroll-effect', d.effect);
                } else if (d.effect === 'always' || d.effect === 'none' || d.effect === '') {
                    el.removeAttribute('data-scroll-effect');
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
                            return !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script');
                        });
                        if (trailingRef && trailingRef.parentNode === parent) {
                            parent.insertBefore(el, trailingRef);
                        } else {
                            parent.appendChild(el);
                        }

                        // Auto-sync any description pins sitting on this newly pinned host using DOM canvas coordinates
                        var hLeft = parseFloat(el.style.left) || el.offsetLeft || 0;
                        var hTop = parseFloat(el.style.top) || el.offsetTop || 0;
                        var hWidth = el.offsetWidth || parseFloat(el.style.width) || 360;
                        var hHeight = el.offsetHeight || parseFloat(el.style.height) || 60;

                        var pins = parent.querySelectorAll('.lf-component.pin-marker, .lf-component.text-marker');
                        pins.forEach(function(p) {
                            if (!p || p === el) return;
                            var pLeft = parseFloat(p.style.left) || p.offsetLeft || 0;
                            var pTop = parseFloat(p.style.top) || p.offsetTop || 0;
                            var pCenterX = pLeft + 10;
                            var pCenterY = pTop + 10;
                            if (pCenterX >= hLeft && pCenterX <= (hLeft + hWidth) &&
                                pCenterY >= hTop && pCenterY <= (hTop + hHeight)) {
                                p.setAttribute('data-scroll-fixed', effectiveMode);
                                if (el.id) p.setAttribute('data-fixed-host', el.id);
                                p.style.setProperty('z-index', '200050', 'important');
                                p.style.willChange = 'transform';
                                if (el.style.transform) {
                                    p.style.setProperty('transform', el.style.transform, 'important');
                                }
                                var tr = Array.from(parent.children).find(function(c) {
                                    return !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script');
                                });
                                if (tr && tr.parentNode === parent) {
                                    parent.insertBefore(p, tr);
                                } else {
                                    parent.appendChild(p);
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
                    el.style.removeProperty('transform');
                    el.style.removeProperty('will-change');
                    el.style.removeProperty('transition');
                    maxNormalZ = Math.min(80000, maxNormalZ + 10);
                    el.style.zIndex = String(Math.max(1010, maxNormalZ));
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
                    var parent = el.parentElement;
                    if (parent) {
                        var pins = parent.querySelectorAll('.lf-component.pin-marker[data-scroll-fixed], .lf-component.text-marker[data-scroll-fixed]');
                        pins.forEach(function(p) {
                            if (!p || p === el) return;
                            var isPinnedToHost = (p.getAttribute('data-fixed-host') === el.id);
                            if (!isPinnedToHost) {
                                var pLeft = parseFloat(p.style.left) || p.offsetLeft || 0;
                                var pTop = parseFloat(p.style.top) || p.offsetTop || 0;
                                isPinnedToHost = (pLeft >= (hLeft - 10) && pLeft <= (hLeft + hWidth + 10) &&
                                                  pTop >= (hTop - 10) && pTop <= (hTop + hHeight + 10));
                            }
                            if (isPinnedToHost) {
                                p.removeAttribute('data-scroll-fixed');
                                p.removeAttribute('data-fixed-host');
                                p.style.removeProperty('transform');
                                p.style.removeProperty('will-change');
                                p.style.setProperty('z-index', '200000', 'important');
                            }
                        });
                    }
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
