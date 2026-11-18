/**
 * assets/vctrl_iframe_dimmed_layer.js
 *
 * Dedicated Dimmed Overlay Layer Engine (Iframe Side - Isolated Stacking Context SSOT)
 * - Provides a single isolated CSS stacking context (.v4-dimmed-overlay-layer, z-index: 185000, isolation: isolate)
 *   above Base Content (1,000~69,999) and Scroll-Fixed HUDs (100,000~179,999), and below Description Pins (.v4-pin-layer: 250,000)
 *   and Editor Gizmos (300,000+).
 * - Eliminates flat Z-index collisions: upper popup components inside .v4-dimmed-overlay-layer use standard local z-index (1000, 1010...).
 * - Supports per-frame independent Dimmed ON/OFF + Synchronized Multi-Frame control + Transient Base/Overlay Edit Mode switching.
 *
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4IframeDimmedLayerScript).
 * DO NOT use unescaped backticks or template interpolation inside this file (Gateway 5).
 */

if (!window.v4IframeDimmedLayerScript) {
    window.v4IframeDimmedLayerScript = `
(function() {
    'use strict';

    var DIMMED_Z_INDEX = 185000;
    var DEFAULT_COLOR = '#000000';
    var DEFAULT_OPACITY = 50;

    function isReadOnlyViewer() {
        try {
            if (window.parent && window.parent.state && window.parent.state.isReadOnly) {
                return true;
            }
        } catch (e) {}
        return false;
    }

    function _resolveDimmedHex(hex) {
        return (window.normalizeHex && window.normalizeHex(hex)) || DEFAULT_COLOR;
    }

    function hexToRgbaString(hex, opacityPct) {
        var normHex = _resolveDimmedHex(hex);
        var rgb = (window.hexToRgb && window.hexToRgb(normHex)) || { r: 0, g: 0, b: 0 };
        var pct = parseInt(opacityPct, 10);
        if (isNaN(pct)) pct = DEFAULT_OPACITY;
        pct = Math.max(0, Math.min(95, pct));
        var alpha = Math.round(pct) / 100;
        return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
    }

    function detectTemplateLayout() {
        var leftCol = document.querySelector('.mobile-column-left');
        var rightCol = document.querySelector('.mobile-column-right');
        var pcInner = document.querySelector('.pc-content-inner');
        var mobileInners = document.querySelectorAll('.mobile-content-inner');

        if (leftCol && rightCol) {
            return 'mobile-compare';
        }
        if (mobileInners.length >= 2 && !pcInner) {
            return 'mobile-compare';
        }
        if (pcInner && mobileInners.length > 0) {
            return 'pc-mobile';
        }
        if (pcInner && mobileInners.length === 0) {
            return 'admin-pc';
        }
        if (mobileInners.length === 1 && !pcInner) {
            return 'mobile-only';
        }
        return 'canvas';
    }

    function getFramesList() {
        var layout = detectTemplateLayout();
        var list = [];

        if (layout === 'mobile-compare') {
            var leftCol = document.querySelector('.mobile-column-left');
            var rightCol = document.querySelector('.mobile-column-right');
            var mInners = document.querySelectorAll('.mobile-content-inner');
            var leftHost = leftCol ? leftCol.querySelector('.mobile-content-inner') : (mInners[0] || null);
            var rightHost = rightCol ? rightCol.querySelector('.mobile-content-inner') : (mInners[1] || null);
            if (leftHost) list.push({ key: 'left', label: 'Mobile Left', shortLabel: 'Left', host: leftHost });
            if (rightHost) list.push({ key: 'right', label: 'Mobile Right', shortLabel: 'Right', host: rightHost });
            return list;
        }

        if (layout === 'pc-mobile') {
            var pcHost = document.querySelector('.pc-content-inner');
            var mobHost = document.querySelector('.mobile-content-inner');
            if (pcHost) list.push({ key: 'pc', label: 'PC 화면', shortLabel: 'PC', host: pcHost });
            if (mobHost) list.push({ key: 'mobile', label: 'Mobile 화면', shortLabel: 'Mobile', host: mobHost });
            return list;
        }

        if (layout === 'admin-pc') {
            var adminHost = document.querySelector('.pc-content-inner');
            if (adminHost) list.push({ key: 'pc', label: 'PC 화면', shortLabel: 'PC', host: adminHost });
            return list;
        }

        if (layout === 'mobile-only') {
            var singleMobHost = document.querySelector('.mobile-content-inner');
            if (singleMobHost) list.push({ key: 'mobile', label: 'Mobile 화면', shortLabel: 'Mobile', host: singleMobHost });
            return list;
        }

        var canvasHost = document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body;
        list.push({ key: 'canvas', label: 'Canvas 화면', shortLabel: 'Canvas', host: canvasHost });
        return list;
    }

    function findFrameHostForElement(el) {
        if (!el) return null;
        if (el.classList && (el.classList.contains('pc-content-inner') || el.classList.contains('mobile-content-inner'))) {
            return el;
        }
        if (el.classList && el.classList.contains('v4-dimmed-overlay-layer')) {
            return el.parentElement;
        }
        if (el.closest) {
            var respInner = el.closest('.pc-content-inner, .mobile-content-inner');
            if (respInner) return respInner;
            var stdHost = el.closest('.canvas, .page, #canvas-page, #canvas');
            if (stdHost) return stdHost;
        }
        return document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body;
    }

    function getLayerForHost(hostEl) {
        if (!hostEl || !hostEl.children) return null;
        var children = hostEl.children;
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            if (c.classList && c.classList.contains('v4-dimmed-overlay-layer')) {
                return c;
            }
        }
        return null;
    }

    function applyLayerVisualStyles(layerEl) {
        if (!layerEl) return;
        var enabled = layerEl.getAttribute('data-dimmed-enabled') === 'true';
        var color = _resolveDimmedHex(layerEl.getAttribute('data-dimmed-color') || DEFAULT_COLOR);
        var opacity = parseInt(layerEl.getAttribute('data-dimmed-opacity'), 10);
        if (isNaN(opacity)) opacity = DEFAULT_OPACITY;
        opacity = Math.max(0, Math.min(95, opacity));

        layerEl.setAttribute('data-dimmed-color', color);
        layerEl.setAttribute('data-dimmed-opacity', String(opacity));

        layerEl.style.position = 'absolute';
        layerEl.style.top = '0px';
        layerEl.style.left = '0px';
        layerEl.style.right = '0px';
        layerEl.style.bottom = '0px';
        layerEl.style.width = '100%';
        layerEl.style.minHeight = '100%';
        layerEl.style.zIndex = String(DIMMED_Z_INDEX);
        layerEl.style.isolation = 'isolate';
        layerEl.style.boxSizing = 'border-box';
        layerEl.style.backgroundColor = hexToRgbaString(color, opacity);
        layerEl.style.display = enabled ? 'block' : 'none';
        layerEl.style.pointerEvents = enabled ? 'auto' : 'none';

        var editMode = layerEl.getAttribute('data-dimmed-edit-mode') || 'overlay';
        if (isReadOnlyViewer()) {
            layerEl.classList.remove('v4-dimmed-temp-hidden');
        } else if (enabled && editMode === 'base') {
            layerEl.classList.add('v4-dimmed-temp-hidden');
        } else {
            layerEl.classList.remove('v4-dimmed-temp-hidden');
        }
    }

    function ensureLayerForHost(hostEl, frameKey) {
        if (!hostEl) return null;
        var existing = getLayerForHost(hostEl);
        if (existing) {
            if (frameKey && !existing.getAttribute('data-dimmed-frame')) {
                existing.setAttribute('data-dimmed-frame', frameKey);
            }
            applyLayerVisualStyles(existing);
            return existing;
        }

        var compPos = window.getComputedStyle(hostEl).position;
        if (compPos === 'static' && hostEl !== document.body) {
            hostEl.style.position = 'relative';
        }

        var layer = document.createElement('div');
        layer.className = 'v4-dimmed-overlay-layer';
        layer.setAttribute('data-dimmed-frame', frameKey || 'canvas');
        layer.setAttribute('data-dimmed-enabled', 'false');
        layer.setAttribute('data-dimmed-color', DEFAULT_COLOR);
        layer.setAttribute('data-dimmed-opacity', String(DEFAULT_OPACITY));
        layer.setAttribute('data-dimmed-edit-mode', 'overlay');
        applyLayerVisualStyles(layer);

        var trailingRef = Array.from(hostEl.children || []).find(function(c) {
            if (!c || !c.classList) return false;
            return c.classList.contains('v4-pin-layer') ||
                   c.classList.contains('v4-selection-adorner-layer') ||
                   c.classList.contains('v4-responsive-guide-layer') ||
                   c.tagName === 'SCRIPT' ||
                   c.id === 'v4-inlined-script';
        });

        if (trailingRef && trailingRef.parentNode === hostEl) {
            hostEl.insertBefore(layer, trailingRef);
        } else {
            hostEl.appendChild(layer);
        }
        return layer;
    }

    function isOverlayInteractive(hostEl) {
        var resolvedHost = findFrameHostForElement(hostEl) || hostEl;
        var layer = getLayerForHost(resolvedHost);
        if (!layer) return false;
        if (layer.getAttribute('data-dimmed-enabled') !== 'true') return false;
        if (!isReadOnlyViewer() && (layer.classList.contains('v4-dimmed-temp-hidden') || layer.getAttribute('data-dimmed-edit-mode') === 'base')) {
            return false;
        }
        return true;
    }

    function resolveActiveMountHost(baseHostEl) {
        if (!baseHostEl) return baseHostEl;
        if (baseHostEl.classList && baseHostEl.classList.contains('v4-dimmed-overlay-layer')) {
            return baseHostEl;
        }
        var resolvedHost = findFrameHostForElement(baseHostEl) || baseHostEl;
        if (isOverlayInteractive(resolvedHost)) {
            var layer = getLayerForHost(resolvedHost);
            if (layer) return layer;
        }
        return baseHostEl;
    }

    function isPinElement(el) {
        if (!el) return false;
        if (el.classList && (el.classList.contains('pin-marker') || el.classList.contains('text-marker') || el.classList.contains('v4-pin-marker'))) {
            return true;
        }
        if (el.id && el.id.indexOf('v4-pin-') === 0) return true;
        if (el.closest && el.closest('.v4-pin-layer')) return true;
        return false;
    }

    function isComponentSelectable(compEl) {
        if (!compEl) return false;
        if (isPinElement(compEl)) return true;

        var inOverlay = !!(compEl.closest && compEl.closest('.v4-dimmed-overlay-layer'));
        var frameHost = findFrameHostForElement(compEl);
        if (!frameHost) return !inOverlay;

        var overlayActive = isOverlayInteractive(frameHost);
        if (overlayActive) {
            return inOverlay;
        }
        return !inOverlay;
    }

    function isSameLayerScope(elA, elB) {
        if (!elA || !elB) return true;
        var aInOverlay = !!(elA.closest && elA.closest('.v4-dimmed-overlay-layer'));
        var bInOverlay = !!(elB.closest && elB.closest('.v4-dimmed-overlay-layer'));
        return aInOverlay === bInOverlay;
    }

    function countOverlayObjects(layerEl) {
        if (!layerEl || !layerEl.children) return 0;
        var cnt = 0;
        for (var i = 0; i < layerEl.children.length; i++) {
            var ch = layerEl.children[i];
            if (ch.classList && ch.classList.contains('bychoi-component') && !isPinElement(ch)) {
                cnt++;
            }
        }
        return cnt;
    }

    function clearIncompatibleSelections() {
        var changed = false;
        var selected = document.querySelectorAll('.bychoi-component.selected');
        selected.forEach(function(el) {
            if (!isComponentSelectable(el)) {
                el.classList.remove('selected');
                changed = true;
            }
        });
        if (changed) {
            if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
                window.SelectionAdorner.clear();
            }
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                window.ResponsiveSmartGuide.clearGuides(true);
            }
            if (typeof window.notifyParent === 'function') {
                window.notifyParent({ type: 'BYCHOI_DESELECT' });
            } else if (window.parent) {
                window.parent.postMessage({ type: 'BYCHOI_DESELECT' }, '*');
            }
        }
    }

    function getStatePayload() {
        var layout = detectTemplateLayout();
        var framesList = getFramesList();
        var activeFrame = window.lastActiveFrame || (framesList[0] ? framesList[0].key : 'canvas');
        var hasMatch = framesList.some(function(f) { return f.key === activeFrame; });
        if (!hasMatch && framesList.length > 0) {
            activeFrame = framesList[0].key;
        }

        var framesData = framesList.map(function(f) {
            var layer = getLayerForHost(f.host);
            var enabled = layer ? (layer.getAttribute('data-dimmed-enabled') === 'true') : false;
            var editMode = layer ? (layer.getAttribute('data-dimmed-edit-mode') || 'overlay') : 'overlay';
            var color = layer ? _resolveDimmedHex(layer.getAttribute('data-dimmed-color') || DEFAULT_COLOR) : DEFAULT_COLOR;
            var opacity = layer ? parseInt(layer.getAttribute('data-dimmed-opacity'), 10) : DEFAULT_OPACITY;
            if (isNaN(opacity)) opacity = DEFAULT_OPACITY;
            var objCount = layer ? countOverlayObjects(layer) : 0;

            return {
                key: f.key,
                label: f.label,
                shortLabel: f.shortLabel,
                enabled: enabled,
                editMode: enabled ? editMode : 'overlay',
                color: color,
                opacity: opacity,
                objectCount: objCount
            };
        });

        return {
            layout: layout,
            isMultiFrame: framesData.length > 1,
            activeFrame: activeFrame,
            frames: framesData
        };
    }

    function syncStateToParent() {
        var payload = getStatePayload();
        payload.type = 'BYCHOI_DIMMED_LAYER_STATE';
        if (typeof window.notifyParent === 'function') {
            window.notifyParent(payload);
        } else if (window.parent) {
            window.parent.postMessage(payload, '*');
        }
    }

    function onActiveFrameChanged(frameKey) {
        if (!frameKey) return;
        syncStateToParent();
    }

    function handleUpdateDimmedLayer(d) {
        if (!d) return;
        var framesList = getFramesList();
        var targetKeys = Array.isArray(d.frames) && d.frames.length > 0
            ? d.frames
            : [d.frame || window.lastActiveFrame || (framesList[0] ? framesList[0].key : 'canvas')];

        var isPersistentMutation = (d.enabled !== undefined) || (d.color !== undefined) || (d.opacity !== undefined);
        if (isPersistentMutation && d.saveUndo !== false && window.V4UndoManager && typeof window.V4UndoManager.saveState === 'function') {
            window.V4UndoManager.saveState();
        }

        var didMutatePersistent = false;
        framesList.forEach(function(f) {
            if (targetKeys.indexOf(f.key) === -1) return;
            var layer = ensureLayerForHost(f.host, f.key);
            if (!layer) return;

            if (d.enabled !== undefined) {
                var nextEnabled = !!d.enabled;
                layer.setAttribute('data-dimmed-enabled', nextEnabled ? 'true' : 'false');
                layer.setAttribute('data-dimmed-edit-mode', 'overlay');
                didMutatePersistent = true;
            }
            if (d.editMode === 'overlay' || d.editMode === 'base') {
                layer.setAttribute('data-dimmed-edit-mode', d.editMode);
            }
            if (d.color !== undefined) {
                layer.setAttribute('data-dimmed-color', _resolveDimmedHex(d.color));
                didMutatePersistent = true;
            }
            if (d.opacity !== undefined) {
                var op = parseInt(d.opacity, 10);
                if (!isNaN(op)) {
                    layer.setAttribute('data-dimmed-opacity', String(Math.max(0, Math.min(95, op))));
                    didMutatePersistent = true;
                }
            }
            applyLayerVisualStyles(layer);
        });

        if (d.focusFrame && targetKeys.length > 0) {
            var fKey = d.focusFrame;
            window.lastActiveFrame = fKey;
            if (typeof window.updateActiveFrameUI === 'function') {
                window.updateActiveFrameUI(fKey);
            }
        }

        clearIncompatibleSelections();

        if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.invalidateTargets === 'function') {
            window.ResponsiveSmartGuide.invalidateTargets();
        }

        if (didMutatePersistent && d.markDirty !== false && typeof window.markDirty === 'function') {
            window.markDirty();
        }

        syncStateToParent();
    }

    function initDimmedLayers() {
        var existingLayers = document.querySelectorAll('.v4-dimmed-overlay-layer');
        existingLayers.forEach(function(layer) {
            if (!layer.getAttribute('data-dimmed-edit-mode') || isReadOnlyViewer()) {
                layer.setAttribute('data-dimmed-edit-mode', 'overlay');
                layer.classList.remove('v4-dimmed-temp-hidden');
            }
            applyLayerVisualStyles(layer);
        });
        setTimeout(function() {
            syncStateToParent();
        }, 60);
    }

    window.v4MessageHandlers = window.v4MessageHandlers || {};
    window.v4MessageHandlers['BYCHOI_QUERY_DIMMED_LAYER_STATE'] = function() {
        syncStateToParent();
    };
    window.v4MessageHandlers['BYCHOI_UPDATE_DIMMED_LAYER'] = handleUpdateDimmedLayer;

    window.V4DimmedLayer = {
        DIMMED_Z_INDEX: DIMMED_Z_INDEX,
        getFramesList: getFramesList,
        findFrameHostForElement: findFrameHostForElement,
        getLayerForHost: getLayerForHost,
        ensureLayerForHost: ensureLayerForHost,
        isOverlayInteractive: isOverlayInteractive,
        resolveActiveMountHost: resolveActiveMountHost,
        isComponentSelectable: isComponentSelectable,
        isSameLayerScope: isSameLayerScope,
        countOverlayObjects: countOverlayObjects,
        getStatePayload: getStatePayload,
        syncStateToParent: syncStateToParent,
        onActiveFrameChanged: onActiveFrameChanged,
        initDimmedLayers: initDimmedLayers
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDimmedLayers);
    } else {
        initDimmedLayers();
    }
})();
`;
}
