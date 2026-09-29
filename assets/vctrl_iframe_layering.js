// --- Iframe Layering & Z-Index Module ---
if (!window.v4IframeLayeringScript) {
    window.v4IframeLayeringScript = `
(function() {
    window.getNextTopZIndex = function(container) {
        var targetParent = container || document.body;
        var maxZ = 1000;
        var comps = document.querySelectorAll ? document.querySelectorAll('.lf-component') : (targetParent.querySelectorAll ? targetParent.querySelectorAll('.lf-component') : []);
        comps.forEach(function(c) {
            if (c.classList.contains('pin-marker')) return;
            var rawZ = parseInt(c.style.zIndex, 10);
            if (isNaN(rawZ)) {
                var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                rawZ = isNaN(compZ) ? 1000 : compZ;
            }
            if (rawZ < 190000 && rawZ > maxZ) {
                maxZ = rawZ;
            }
        });
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
                    var pos = a.compareDocumentPosition(b);
                    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
                });

                var siblingComps = Array.from(parent.children).filter(function(c) {
                    return c.classList.contains('lf-component');
                });

                var maxZ = 1000;
                var hasZ = false;
                siblingComps.forEach(function(c) {
                    if (c.classList.contains('pin-marker')) return;
                    var z = parseInt(c.style.zIndex, 10);
                    if (isNaN(z)) {
                        var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                        z = isNaN(compZ) ? 1000 : compZ;
                    }
                    if (z < 190000) {
                        if (!hasZ) {
                            maxZ = z;
                            hasZ = true;
                        } else if (z > maxZ) {
                            maxZ = z;
                        }
                    }
                });

                // Check document-wide max z-index as well to ensure it reliably sits above any cross-frame elements
                var allComps = document.querySelectorAll ? document.querySelectorAll('.lf-component') : [];
                allComps.forEach(function(c) {
                    if (c.classList.contains('pin-marker')) return;
                    var z = parseInt(c.style.zIndex, 10);
                    if (isNaN(z)) {
                        var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                        z = isNaN(compZ) ? 1000 : compZ;
                    }
                    if (z < 190000 && z > maxZ) {
                        maxZ = z;
                    }
                });

                var trailingRef = Array.from(parent.children).find(function(c) {
                    return !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script');
                });

                var targetZ = maxZ + 10;
                items.forEach(function(el) {
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
                    var pos = a.compareDocumentPosition(b);
                    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
                });

                var siblingComps = Array.from(parent.children).filter(function(c) {
                    return c.classList.contains('lf-component');
                });

                var minZ = 1000;
                var hasZ = false;
                siblingComps.forEach(function(c) {
                    if (c.classList.contains('pin-marker')) return;
                    var z = parseInt(c.style.zIndex, 10);
                    if (isNaN(z)) {
                        var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                        z = isNaN(compZ) ? 1000 : compZ;
                    }
                    if (z >= 190000) return; // Ignore pin markers or overlay tiers
                    if (!hasZ) {
                        minZ = z;
                        hasZ = true;
                    } else if (z < minZ) {
                        minZ = z;
                    }
                });

                var targetZ = minZ - 10;
                if (targetZ < 1) {
                    var shift = Math.abs(targetZ) + 10;
                    siblingComps.forEach(function(c) {
                        if (c.classList.contains('pin-marker')) return;
                        var curZ = parseInt(c.style.zIndex, 10);
                        if (isNaN(curZ)) {
                            var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                            curZ = isNaN(compZ) ? 1000 : compZ;
                        }
                        c.style.zIndex = String(curZ + shift);
                    });
                    targetZ = 1;
                }

                var firstUnselectedComp = siblingComps.find(function(c) {
                    return !items.includes(c);
                });

                if (firstUnselectedComp && firstUnselectedComp.parentNode === parent) {
                    items.forEach(function(el) {
                        el.style.zIndex = String(targetZ);
                        parent.insertBefore(el, firstUnselectedComp);
                    });
                } else {
                    var nonCompAnchor = Array.from(parent.children).find(function(c) {
                        if (c.classList.contains('lf-component')) return false;
                        if (c.id === 'canvas' || c.classList.contains('canvas') || c.classList.contains('page') || c.id === 'canvas-page') return false;
                        return true;
                    });
                    items.forEach(function(el) {
                        el.style.zIndex = String(targetZ);
                        if (nonCompAnchor && nonCompAnchor.parentNode === parent) {
                            parent.insertBefore(el, nonCompAnchor);
                        } else {
                            parent.appendChild(el);
                        }
                    });
                }
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

    window.handleBringFront = handleBringFront;
    window.handleSendBack = handleSendBack;
})();
`;
}