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
        isRafPending: false,
        observer: null,

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
                        self.scheduleUpdate();
                    }, { passive: true });
                }
            });
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
            var pinnedEls = document.querySelectorAll('[data-scroll-fixed="top"], [data-scroll-fixed="bottom"]');
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
                if (!scrollArea) return;

                var scrollTop = scrollArea.scrollTop || 0;
                var viewportH = scrollArea.clientHeight || 810;
                var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
                var domTop = parseFloat(el.style.top) || 0;
                var targetViewportTop = Math.max(0, viewportH - elH);
                var dy = scrollTop + (targetViewportTop - domTop);
                bottomHostDyMap.set(el.parentElement, dy);
            });

            pinnedEls.forEach(function(el) {
                if (!el || !el.isConnected) return;

                // Skip position override while user is actively dragging the element
                if (el.classList.contains('dragging-now')) return;

                var mode = el.getAttribute('data-scroll-fixed');
                if (mode !== 'top' && mode !== 'bottom') return;

                var scrollArea = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getScrollArea === 'function')
                    ? window.ResponsiveFrameUtils.getScrollArea(el)
                    : el.closest('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content');

                if (!scrollArea) return;

                var scrollTop = scrollArea.scrollTop || 0;
                var dy = 0;
                var isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');

                if (mode === 'top') {
                    // Pinned to Top of Viewport
                    if (isPin && el.hasAttribute('data-fixed-host')) {
                        var hostId = el.getAttribute('data-fixed-host');
                        var hostEl = hostId ? document.getElementById(hostId) : null;
                        // Self-healing: if host element does not exist, is disconnected, or is no longer fixed, release pin
                        if (!hostEl || !hostEl.isConnected || !hostEl.hasAttribute('data-scroll-fixed')) {
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
                            return;
                        }
                    }
                    dy = scrollTop;
                } else if (mode === 'bottom') {
                    // Pinned to Bottom of Viewport
                    if (isPin && el.hasAttribute('data-fixed-host')) {
                        var hostId = el.getAttribute('data-fixed-host');
                        var hostEl = hostId ? document.getElementById(hostId) : null;
                        // Self-healing: if host element does not exist, is disconnected, or is no longer fixed, release pin
                        if (!hostEl || !hostEl.isConnected || !hostEl.hasAttribute('data-scroll-fixed')) {
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
                            return;
                        }
                    }
                    if (isPin && bottomHostDyMap.has(el.parentElement)) {
                        dy = bottomHostDyMap.get(el.parentElement);
                    } else {
                        var viewportH = scrollArea.clientHeight || 810;
                        var elH = el.offsetHeight || parseFloat(el.style.height) || (isPin ? 20 : 60);
                        var domTop = parseFloat(el.style.top) || 0;
                        var targetViewportTop = Math.max(0, viewportH - elH);
                        dy = scrollTop + (targetViewportTop - domTop);
                    }
                }

                // Apply GPU-accelerated transform
                var transformStr = 'translate3d(0px, ' + Math.round(dy) + 'px, 0px)';
                if (el.style.transform !== transformStr) {
                    el.style.setProperty('transform', transformStr, 'important');
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

                // Ensure opaque background if transparent so scrolling content does not bleed through (non-pins only)
                if (!isPin) {
                    try {
                        var curBg = el.style.backgroundColor;
                        var compBg = window.getComputedStyle(el).backgroundColor;
                        var isTrans = !curBg || curBg === 'transparent' || curBg === 'rgba(0, 0, 0, 0)' || !compBg || compBg === 'transparent' || compBg === 'rgba(0, 0, 0, 0)';
                        if (isTrans) {
                            var hasBgChild = el.querySelector ? el.querySelector('.v4-shape-rect, .v4-shape-pattern-grid') : null;
                            if (!hasBgChild) {
                                el.style.backgroundColor = '#ffffff';
                                el.dataset.autoBg = 'true';
                            }
                        }
                    } catch(e) {}
                }
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

            if (d.mode === 'top' || d.mode === 'bottom') {
                if (isPin) {
                    el.setAttribute('data-scroll-fixed', d.mode);
                    el.style.zIndex = '200050';
                    el.style.willChange = 'transform';
                } else {
                    var baseline = Math.max(100000, maxAnyZ);
                    maxFixedZ = Math.max(maxFixedZ, baseline) + 10;
                    var targetZ = maxFixedZ;
                    el.setAttribute('data-scroll-fixed', d.mode);
                    el.style.zIndex = String(targetZ);
                    el.style.willChange = 'transform';

                    // Smart Background Fill: If a pinned header/footer has no background (transparent), apply an opaque background so scrolling contents don't bleed through
                    try {
                        var curBg = el.style.backgroundColor;
                        var compBg = window.getComputedStyle(el).backgroundColor;
                        var isTrans = !curBg || curBg === 'transparent' || curBg === 'rgba(0, 0, 0, 0)' || !compBg || compBg === 'transparent' || compBg === 'rgba(0, 0, 0, 0)';
                        if (isTrans) {
                            var hasBgChild = el.querySelector ? el.querySelector('.v4-shape-rect, .v4-shape-pattern-grid') : null;
                            if (!hasBgChild) {
                                el.style.backgroundColor = '#ffffff';
                                el.dataset.autoBg = 'true';
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
                                p.setAttribute('data-scroll-fixed', d.mode);
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
                }
            } else {
                if (isPin) {
                    el.removeAttribute('data-scroll-fixed');
                    el.removeAttribute('data-fixed-host');
                    el.style.transform = '';
                    el.style.willChange = '';
                    el.style.setProperty('z-index', '200000', 'important');
                } else {
                    var hLeft = parseFloat(el.style.left) || el.offsetLeft || 0;
                    var hTop = parseFloat(el.style.top) || el.offsetTop || 0;
                    var hWidth = parseFloat(el.style.width) || el.offsetWidth || 0;
                    var hHeight = parseFloat(el.style.height) || el.offsetHeight || 0;

                    el.removeAttribute('data-scroll-fixed');
                    el.style.transform = '';
                    el.style.willChange = '';
                    maxNormalZ = Math.min(80000, maxNormalZ + 10);
                    el.style.zIndex = String(Math.max(1010, maxNormalZ));
                    if (el.dataset && el.dataset.autoBg === 'true') {
                        el.style.backgroundColor = '';
                        delete el.dataset.autoBg;
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
