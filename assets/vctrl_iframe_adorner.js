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
            var selectedComps = target ? [target] : Array.from(document.querySelectorAll('.lf-component.selected'));
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

                var isGroup = comp.classList.contains('lf-group');
                var box = document.createElement('div');
                box.className = 'v4-selection-adorner' + (isGroup ? ' is-group' : '');
                box.style.position = 'absolute';
                box.style.left = l + 'px';
                box.style.top = t + 'px';
                box.style.width = w + 'px';
                box.style.height = h + 'px';
                box.style.pointerEvents = 'none';
                box.style.boxSizing = 'border-box';
                box.style.zIndex = '310000';

                var borderColor = isGroup ? '#10b981' : '#6366f1';
                box.style.outline = '2px solid ' + borderColor;
                box.style.outlineOffset = '0px';
                box.style.background = 'transparent';
                var compRad = comp.style.borderRadius || window.getComputedStyle(comp).borderRadius;
                if (compRad && compRad !== '0px') {
                    box.style.borderRadius = compRad;
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
