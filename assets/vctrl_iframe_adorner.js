/**
 * Workspace Editor - Selection Adorner Module
 * Decoupled from vctrl_iframe_script.js for modular architecture.
 * Manages DOM selection adorner overlays and multi-selection bounding boxes in iframe canvas.
 */
window.v4SelectionAdornerScript = `
(function() {
    'use strict';

    window.SelectionAdorner = {
        getContainer: function(comp) {
            if (!comp) return document.body;
            return (comp.closest && comp.closest('.pc-content-inner, .pc-content-area, .mobile-content-inner, .mobile-content-area, .mobile-content')) || document.body;
        },
        ensureLayer: function(container) {
            if (!container) return null;
            var layer = container.querySelector(':scope > .v4-selection-adorner-layer');
            if (!layer) {
                layer = document.createElement('div');
                layer.className = 'v4-selection-adorner-layer';
                layer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 310000; overflow: visible;';
                var compStyle = window.getComputedStyle(container);
                if (compStyle.position === 'static' && container !== document.body) {
                    container.style.position = 'relative';
                }
                var trailingScript = Array.from(container.children).find(function(c) {
                    return c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script';
                });
                if (trailingScript) {
                    container.insertBefore(layer, trailingScript);
                } else {
                    container.appendChild(layer);
                }
            }
            return layer;
        },
        update: function(target) {
            this.clear();
            var selectedComps = target ? [target] : Array.from(document.querySelectorAll('.bychoi-component.selected'));
            if (selectedComps.length === 0) return;

            var self = this;
            selectedComps.forEach(function(comp) {
                if (!comp || comp.classList.contains('connector-line')) return;
                var container = self.getContainer(comp);
                if (!container) return;
                var layer = self.ensureLayer(container);
                if (!layer) return;

                var compRect = comp.getBoundingClientRect();
                var contRect = container.getBoundingClientRect();
                var scrollL = (container === document.body) ? (window.pageXOffset || document.documentElement.scrollLeft || 0) : container.scrollLeft;
                var scrollT = (container === document.body) ? (window.pageYOffset || document.documentElement.scrollTop || 0) : container.scrollTop;

                var l = Math.round((compRect.left - contRect.left) + scrollL);
                var t = Math.round((compRect.top - contRect.top) + scrollT);
                var w = Math.round(compRect.width);
                var h = Math.round(compRect.height);

                if (w <= 0 || h <= 0) return;

                var isGroup = comp.classList.contains('bychoi-group');
                var isLocked = comp.getAttribute('data-locked') === 'true';
                var box = document.createElement('div');
                box.className = 'v4-selection-adorner' + (isGroup ? ' is-group' : '') + (isLocked ? ' is-locked' : '');
                box.style.position = 'absolute';
                box.style.left = l + 'px';
                box.style.top = t + 'px';
                box.style.width = w + 'px';
                box.style.height = h + 'px';
                box.style.pointerEvents = 'none';
                box.style.boxSizing = 'border-box';
                box.style.zIndex = '310000';

                var borderColor = isLocked ? '#f59e0b' : (isGroup ? '#10b981' : '#6366f1');
                box.style.outline = (isLocked ? '1.8px dashed ' : '2px solid ') + borderColor;
                box.style.outlineOffset = '0px';
                box.style.background = 'transparent';
                if (!isGroup) {
                    var compRad = comp.style.borderRadius || window.getComputedStyle(comp).borderRadius;
                    if (!compRad || compRad === '0px') {
                        var innerShape = comp.querySelector(':scope > .v4-shape-rect, :scope > .v4-shape-circle, :scope > .v4-shape-webpage, :scope > .v4-shape-pattern-grid');
                        if (innerShape) {
                            compRad = innerShape.style.borderRadius || window.getComputedStyle(innerShape).borderRadius;
                        }
                    }
                    if (compRad && compRad !== '0px') {
                        box.style.borderRadius = compRad;
                    }
                }
                if (isLocked) {
                    var lockBadge = document.createElement('div');
                    lockBadge.className = 'v4-locked-adorner-badge';
                    lockBadge.style.cssText = 'position:absolute; top:' + (t < 16 ? '4px' : '-10px') + '; right:' + ((w < 30) ? '-10px' : '-10px') + '; width:20px; height:20px; border-radius:999px; background:#f59e0b; color:#ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(15,23,42,0.28); pointer-events:none;';
                    lockBadge.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>';
                    box.appendChild(lockBadge);
                }
                layer.appendChild(box);
            });
        },
        clear: function() {
            document.querySelectorAll('.v4-selection-adorner-layer').forEach(function(l) {
                l.innerHTML = '';
            });
        }
    };
})();
`;
