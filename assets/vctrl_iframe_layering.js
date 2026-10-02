// --- Iframe Layering & Z-Index Module ---
if (!window.v4IframeLayeringScript) {
    window.v4IframeLayeringScript = `
(function() {
    var V4_Z_TIERS = {
        BASE_MIN: 0,
        BASE_MAX: 999,
        CONTENT_MIN: 1000,
        CONTENT_MAX: 79999,
        FIXED_HUD_MIN: 100000,
        FIXED_HUD_MAX: 179999,
        PIN_MIN: 200000,
        PIN_MAX: 249999,
        GIZMO_MIN: 300000,
        GIZMO_MAX: 399999,
        MODAL_MIN: 500000,
        MODAL_MAX: 999999
    };
    window.V4_Z_TIERS = V4_Z_TIERS;

    function normalizeZIndices(container, force) {
        var host = container || document.body;
        if (!host) return;

        // If host is not a direct inner container, but contains responsive inners, delegate to each inner
        if (host.querySelectorAll && (!host.classList || (!host.classList.contains('mobile-content-inner') && !host.classList.contains('pc-content-inner')))) {
            var inners = host.querySelectorAll('.mobile-content-inner, .pc-content-inner');
            if (inners.length > 0) {
                inners.forEach(function(inn) {
                    normalizeZIndices(inn, force);
                });
                return;
            }
        }

        // Clean up any nested elements inside groups with legacy inflated z-indices
        if (host.querySelectorAll) {
            var nested = host.querySelectorAll('.lf-group > .lf-component, .lf-in-group');
            nested.forEach(function(nc) {
                if (nc.hasAttribute && nc.hasAttribute('data-scroll-fixed')) return;
                var pz = parseInt(nc.style.zIndex, 10);
                if (pz >= 50000 && pz < V4_Z_TIERS.FIXED_HUD_MIN) {
                    nc.style.zIndex = '1';
                }
            });
        }

        var comps = Array.from(host.children).filter(function(c) {
            return c.classList && c.classList.contains('lf-component');
        });
        if (comps.length === 0) return;

        var normalComps = [];
        var fixedComps = [];
        var maxNormalVal = V4_Z_TIERS.CONTENT_MIN;

        comps.forEach(function(c) {
            if (c.classList.contains('pin-marker') || c.classList.contains('text-marker')) return;
            var isFixed = c.hasAttribute('data-scroll-fixed');
            var rawZ = parseInt(c.style.zIndex, 10);
            if (isNaN(rawZ)) {
                var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                rawZ = isNaN(compZ) ? V4_Z_TIERS.CONTENT_MIN : compZ;
            }
            if (rawZ >= V4_Z_TIERS.PIN_MIN) return;

            if (isFixed || rawZ >= V4_Z_TIERS.FIXED_HUD_MIN) {
                fixedComps.push({ el: c, z: rawZ });
            } else {
                normalComps.push({ el: c, z: rawZ });
                if (rawZ > maxNormalVal) maxNormalVal = rawZ;
            }
        });

        // Trigger compaction if forced or if maxNormalVal >= 50000 (approaching limit)
        var needsCompaction = force || (maxNormalVal >= 50000);
        if (!needsCompaction) return;

        // Sort normal elements by existing z-index, preserving document order on ties
        normalComps.sort(function(a, b) {
            if (a.z !== b.z) return a.z - b.z;
            if (a.el.compareDocumentPosition && typeof a.el.compareDocumentPosition === 'function') {
                var pos = a.el.compareDocumentPosition(b.el);
                var followingFlag = (typeof Node !== 'undefined' && Node.DOCUMENT_POSITION_FOLLOWING) || 4;
                return (pos & followingFlag) ? -1 : 1;
            }
            return 0;
        });

        var curZ = V4_Z_TIERS.CONTENT_MIN;
        normalComps.forEach(function(item) {
            item.el.style.zIndex = String(curZ);
            curZ += 10;
        });

        if (fixedComps.length > 0) {
            fixedComps.sort(function(a, b) {
                if (a.z !== b.z) return a.z - b.z;
                if (a.el.compareDocumentPosition && typeof a.el.compareDocumentPosition === 'function') {
                    var pos = a.el.compareDocumentPosition(b.el);
                    var followingFlag = (typeof Node !== 'undefined' && Node.DOCUMENT_POSITION_FOLLOWING) || 4;
                    return (pos & followingFlag) ? -1 : 1;
                }
                return 0;
            });
            var curFixedZ = V4_Z_TIERS.FIXED_HUD_MIN;
            fixedComps.forEach(function(item) {
                item.el.style.zIndex = String(curFixedZ);
                curFixedZ += 10;
            });
        }

        if (force && typeof markDirty === 'function') markDirty();
        console.log("%c [Z-INDEX COMPACTION] Auto-normalized " + normalComps.length + " normal & " + fixedComps.length + " fixed elements in container. ", "color: #10b981; font-weight: bold;");
    }

    window.getNextTopZIndex = function(container, isFixed) {
        var targetParent = container || document.body;

        // If targetParent is a wrapper or scroll area, resolve to the appropriate inner container
        if (targetParent.querySelector && (!targetParent.classList || (!targetParent.classList.contains('mobile-content-inner') && !targetParent.classList.contains('pc-content-inner')))) {
            var activeInner = targetParent.querySelector('.mobile-column.active-column .mobile-content-inner, .pc-column.active-column .pc-content-inner')
                || targetParent.querySelector('.mobile-content-inner, .pc-content-inner');
            if (activeInner) targetParent = activeInner;
        }

        var maxZ = isFixed ? V4_Z_TIERS.FIXED_HUD_MIN : V4_Z_TIERS.CONTENT_MIN;
        var comps = (targetParent && targetParent.querySelectorAll) 
            ? targetParent.querySelectorAll('.lf-component') 
            : (document.querySelectorAll ? document.querySelectorAll('.lf-component') : []);

        comps.forEach(function(c) {
            // Ignore nested components inside groups from defining top-level stacking order
            if (c.parentElement && c.parentElement.classList && c.parentElement.classList.contains('lf-group')) return;
            if (c.classList && c.classList.contains('lf-in-group')) return;
            if (c.classList && (c.classList.contains('pin-marker') || c.classList.contains('text-marker'))) return;

            var rawZ = parseInt(c.style.zIndex, 10);
            if (isNaN(rawZ)) {
                var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                rawZ = isNaN(compZ) ? V4_Z_TIERS.CONTENT_MIN : compZ;
            }
            if (isFixed) {
                if (rawZ >= V4_Z_TIERS.FIXED_HUD_MIN && rawZ < V4_Z_TIERS.PIN_MIN && rawZ > maxZ) {
                    maxZ = rawZ;
                }
            } else {
                if (c.hasAttribute && c.hasAttribute('data-scroll-fixed')) return;
                if (rawZ < V4_Z_TIERS.FIXED_HUD_MIN && rawZ > maxZ) {
                    maxZ = rawZ;
                }
            }
        });

        // Trigger compaction if normal tier approaches 50,000 threshold (Zero recursion!)
        if (!isFixed && maxZ >= 50000) {
            normalizeZIndices(targetParent, true);
            var topNormalComps = Array.from(targetParent.children || []).filter(function(c) {
                return c.classList && c.classList.contains('lf-component') && !c.hasAttribute('data-scroll-fixed');
            });
            return V4_Z_TIERS.CONTENT_MIN + (topNormalComps.length * 10);
        }

        return maxZ + 10;
    };

    function handleBringFront(d) {
        var selected = Array.from(document.querySelectorAll('.lf-component.selected'));
        if (selected.length === 0) {
            if (d.ids && Array.isArray(d.ids)) {
                d.ids.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.classList.contains('lf-component') && !selected.includes(el)) {
                        selected.push(el);
                    }
                });
            } else if (d.id) {
                var singleTarget = document.getElementById(d.id);
                if (singleTarget && singleTarget.classList.contains('lf-component')) {
                    selected.push(singleTarget);
                }
            }
        }
        var topLevelSelected = selected.filter(function(el) {
            var parent = el.parentElement;
            while (parent && parent !== document.body) {
                if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) return false;
                parent = parent.parentElement;
            }
            return true;
        });
        if (topLevelSelected.length > 0) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            var realCanvasHost = document.querySelector('.canvas, .page, #canvas-page, #canvas');
            var parentMap = new Map();
            topLevelSelected.forEach(function(el) {
                var p = el.parentElement;
                if (!p) return;
                // Self-healing: If an element was mistakenly appended directly to document.body while a canvas container exists, reparent it
                if (p === document.body && realCanvasHost && realCanvasHost !== document.body) {
                    realCanvasHost.appendChild(el);
                    p = realCanvasHost;
                }
                if (!parentMap.has(p)) {
                    parentMap.set(p, []);
                }
                parentMap.get(p).push(el);
            });

            parentMap.forEach(function(items, parent) {
                items.sort(function(a, b) {
                    if (a.compareDocumentPosition && typeof a.compareDocumentPosition === 'function') {
                        var pos = a.compareDocumentPosition(b);
                        var followingFlag = (typeof Node !== 'undefined' && Node.DOCUMENT_POSITION_FOLLOWING) || 4;
                        return (pos & followingFlag) ? -1 : 1;
                    }
                    return 0;
                });

                var maxNormalZ = V4_Z_TIERS.CONTENT_MIN;
                var maxFixedZ = V4_Z_TIERS.FIXED_HUD_MIN;
                var maxAnyZ = V4_Z_TIERS.CONTENT_MIN;
                var allComps = (parent && parent.querySelectorAll) 
                    ? parent.querySelectorAll('.lf-component') 
                    : (document.querySelectorAll ? document.querySelectorAll('.lf-component') : []);

                allComps.forEach(function(c) {
                    if (c.classList.contains('pin-marker') || c.classList.contains('text-marker')) return;
                    var z = parseInt(c.style.zIndex, 10);
                    if (isNaN(z)) {
                        var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                        z = isNaN(compZ) ? V4_Z_TIERS.CONTENT_MIN : compZ;
                    }
                    if (z >= V4_Z_TIERS.PIN_MIN) return; // Ignore pin-marker and above tiers
                    if (z > maxAnyZ) maxAnyZ = z;
                    if (c.hasAttribute('data-scroll-fixed') || z >= V4_Z_TIERS.FIXED_HUD_MIN) {
                        if (z > maxFixedZ) maxFixedZ = z;
                    } else {
                        if (z > maxNormalZ) maxNormalZ = z;
                    }
                });

                var trailingRef = Array.from(parent.children).find(function(c) {
                    return !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script');
                });

                var fixedHudInParent = Array.from(parent.children).find(function(c) {
                    return c.hasAttribute && c.hasAttribute('data-scroll-fixed');
                });

                items.forEach(function(el) {
                    var isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');
                    if (isPin) {
                        var isFixed = el.hasAttribute('data-scroll-fixed');
                        el.style.setProperty('z-index', isFixed ? '200050' : '200000', 'important');
                        if (trailingRef && trailingRef.parentNode === parent) {
                            parent.insertBefore(el, trailingRef);
                        } else {
                            parent.appendChild(el);
                        }
                        return;
                    }

                    var isFixed = el.hasAttribute('data-scroll-fixed');
                    var targetZ;
                    var elCurZ = parseInt(el.style.zIndex, 10) || V4_Z_TIERS.CONTENT_MIN;

                    if (isFixed) {
                        var baseline = Math.max(V4_Z_TIERS.FIXED_HUD_MIN, maxAnyZ);
                        maxFixedZ = Math.max(maxFixedZ, baseline) + 10;
                        targetZ = maxFixedZ;
                    } else {
                        var shouldPromoteToHUD = false;
                        if (fixedHudInParent) {
                            var elTop = parseFloat(el.style.top) || 0;
                            var elLeft = parseFloat(el.style.left) || 0;
                            var elW = el.offsetWidth || parseFloat(el.style.width) || 100;
                            var elH = el.offsetHeight || parseFloat(el.style.height) || 100;

                            var hudTop = parseFloat(fixedHudInParent.style.top) || 0;
                            var hudLeft = parseFloat(fixedHudInParent.style.left) || 0;
                            var hudW = fixedHudInParent.offsetWidth || parseFloat(fixedHudInParent.style.width) || 360;
                            var hudH = fixedHudInParent.offsetHeight || parseFloat(fixedHudInParent.style.height) || 60;

                            var isOverlapping = (elLeft < (hudLeft + hudW) && (elLeft + elW) > hudLeft &&
                                                 elTop < (hudTop + hudH) && (elTop + elH) > hudTop);

                            if (isOverlapping || elCurZ >= maxNormalZ) {
                                shouldPromoteToHUD = true;
                            }
                        }

                        if (shouldPromoteToHUD) {
                            maxFixedZ = Math.max(maxFixedZ, V4_Z_TIERS.FIXED_HUD_MIN, maxAnyZ) + 10;
                            targetZ = maxFixedZ;
                            if (fixedHudInParent && !el.hasAttribute('data-scroll-fixed')) {
                                var fixedMode = fixedHudInParent.getAttribute('data-scroll-fixed') || 'top';
                                el.setAttribute('data-scroll-fixed', fixedMode);
                                el.style.willChange = 'transform';
                                if (window.ScrollPinEngine && typeof window.ScrollPinEngine.scheduleUpdate === 'function') {
                                    window.ScrollPinEngine.scheduleUpdate();
                                }
                            }
                        } else {
                            maxNormalZ += 10;
                            targetZ = maxNormalZ;
                            if (targetZ >= V4_Z_TIERS.CONTENT_MAX) {
                                normalizeZIndices(parent, true);
                            }
                        }
                    }
                    el.style.zIndex = String(targetZ);
                    if (trailingRef && trailingRef.parentNode === parent) {
                        parent.insertBefore(el, trailingRef);
                    } else {
                        parent.appendChild(el);
                    }
                });
            });

            markDirty();
            var hasPinSelected = topLevelSelected.some(function(el) {
                return el.classList.contains('pin-marker') || el.classList.contains('text-marker');
            });
            if (hasPinSelected && typeof window.reorderAllPins === 'function') {
                window.reorderAllPins();
            }
        }
    }

    function handleSendBack(d) {
        var selected = Array.from(document.querySelectorAll('.lf-component.selected'));
        if (selected.length === 0) {
            if (d.ids && Array.isArray(d.ids)) {
                d.ids.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.classList.contains('lf-component') && !selected.includes(el)) {
                        selected.push(el);
                    }
                });
            } else if (d.id) {
                var singleTarget = document.getElementById(d.id);
                if (singleTarget && singleTarget.classList.contains('lf-component')) {
                    selected.push(singleTarget);
                }
            }
        }
        var topLevelSelected = selected.filter(function(el) {
            var parent = el.parentElement;
            while (parent && parent !== document.body) {
                if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) return false;
                parent = parent.parentElement;
            }
            return true;
        });
        if (topLevelSelected.length > 0) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            var realCanvasHost = document.querySelector('.canvas, .page, #canvas-page, #canvas');
            var parentMap = new Map();
            topLevelSelected.forEach(function(el) {
                var p = el.parentElement;
                if (!p) return;
                // Self-healing: If an element was mistakenly appended directly to document.body while a canvas container exists, reparent it
                if (p === document.body && realCanvasHost && realCanvasHost !== document.body) {
                    realCanvasHost.appendChild(el);
                    p = realCanvasHost;
                }
                if (!parentMap.has(p)) {
                    parentMap.set(p, []);
                }
                parentMap.get(p).push(el);
            });

            parentMap.forEach(function(items, parent) {
                items.sort(function(a, b) {
                    if (a.compareDocumentPosition && typeof a.compareDocumentPosition === 'function') {
                        var pos = a.compareDocumentPosition(b);
                        var followingFlag = (typeof Node !== 'undefined' && Node.DOCUMENT_POSITION_FOLLOWING) || 4;
                        return (pos & followingFlag) ? -1 : 1;
                    }
                    return 0;
                });

                var siblingComps = Array.from(parent.children).filter(function(c) {
                    return c.classList.contains('lf-component');
                });

                var minNormalZ = V4_Z_TIERS.CONTENT_MIN;
                var minFixedZ = V4_Z_TIERS.FIXED_HUD_MIN;
                var hasNormalZ = false;
                var hasFixedZ = false;

                siblingComps.forEach(function(c) {
                    if (c.classList.contains('pin-marker') || c.classList.contains('text-marker')) return;
                    var z = parseInt(c.style.zIndex, 10);
                    if (isNaN(z)) {
                        var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                        z = isNaN(compZ) ? V4_Z_TIERS.CONTENT_MIN : compZ;
                    }
                    if (z >= V4_Z_TIERS.PIN_MIN) return;
                    if (c.hasAttribute('data-scroll-fixed') || z >= V4_Z_TIERS.FIXED_HUD_MIN) {
                        if (!hasFixedZ || z < minFixedZ) {
                            minFixedZ = z;
                            hasFixedZ = true;
                        }
                    } else {
                        if (!hasNormalZ || z < minNormalZ) {
                            minNormalZ = z;
                            hasNormalZ = true;
                        }
                    }
                });

                items.forEach(function(el) {
                    var isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');
                    if (isPin) {
                        var isFixed = el.hasAttribute('data-scroll-fixed');
                        el.style.setProperty('z-index', isFixed ? '200050' : '200000', 'important');
                        return;
                    }

                    var isFixed = el.hasAttribute('data-scroll-fixed');
                    var targetZ;
                    if (isFixed) {
                        targetZ = Math.max(V4_Z_TIERS.FIXED_HUD_MIN, minFixedZ - 10);
                        minFixedZ = targetZ;
                    } else {
                        targetZ = minNormalZ - 10;
                        if (targetZ < V4_Z_TIERS.CONTENT_MIN) {
                            var shift = Math.abs(V4_Z_TIERS.CONTENT_MIN - targetZ) + 10;
                            siblingComps.forEach(function(c) {
                                if (c.classList.contains('pin-marker') || c.classList.contains('text-marker')) return;
                                if (c.hasAttribute('data-scroll-fixed')) return;
                                var curZ = parseInt(c.style.zIndex, 10);
                                if (isNaN(curZ)) curZ = V4_Z_TIERS.CONTENT_MIN;
                                if (curZ < V4_Z_TIERS.FIXED_HUD_MIN) {
                                    c.style.zIndex = String(curZ + shift);
                                }
                            });
                            targetZ = V4_Z_TIERS.CONTENT_MIN;
                        }
                        minNormalZ = targetZ;
                    }
                    el.style.zIndex = String(targetZ);

                    var firstUnselectedComp = siblingComps.find(function(c) {
                        return !items.includes(c);
                    });

                    if (firstUnselectedComp && firstUnselectedComp.parentNode === parent) {
                        parent.insertBefore(el, firstUnselectedComp);
                    } else {
                        var nonCompAnchor = Array.from(parent.children).find(function(c) {
                            if (c.classList.contains('lf-component')) return false;
                            if (c.id === 'canvas' || c.classList.contains('canvas') || c.classList.contains('page') || c.id === 'canvas-page') return false;
                            return true;
                        });
                        if (nonCompAnchor && nonCompAnchor.parentNode === parent) {
                            parent.insertBefore(el, nonCompAnchor);
                        } else {
                            parent.appendChild(el);
                        }
                    }
                });
            });

            markDirty();
            var hasPinSelected = topLevelSelected.some(function(el) {
                return el.classList.contains('pin-marker') || el.classList.contains('text-marker');
            });
            if (hasPinSelected && typeof window.reorderAllPins === 'function') {
                window.reorderAllPins();
            }
        }
    }

    if (!window.v4MessageHandlers) window.v4MessageHandlers = {};
    window.v4MessageHandlers['LF_NORMALIZE_Z_INDEX'] = function(d) {
        var targetEl = (d && d.containerId) ? document.getElementById(d.containerId) : null;
        normalizeZIndices(targetEl, true);
    };

    window.normalizeZIndices = normalizeZIndices;
    window.handleBringFront = handleBringFront;
    window.handleSendBack = handleSendBack;

    // Auto-normalize upon module load if legacy inflated z-indices exist
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof setTimeout === 'function') setTimeout(function() { normalizeZIndices(null, false); }, 100);
            });
        } else {
            if (typeof setTimeout === 'function') setTimeout(function() { normalizeZIndices(null, false); }, 100);
        }
    }
})();
`;
}