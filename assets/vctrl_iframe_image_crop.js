/**
 * Workspace Editor - PPT-Style Non-Destructive Image Crop Engine (Iframe Side)
 * Responsibility: Interactive 8-handle crop overlay, dimmed ghost preview,
 * inner image pan, exact numeric crop sizing, and CSS percentage non-destructive persistence.
 *
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4ImageCropScript).
 * 1. DO NOT use unescaped backticks or template interpolations inside this file.
 * 2. Use single ('') or double ("") quotes and string concatenation (+) exclusively.
 */
window.v4ImageCropScript = `
(function() {
    'use strict';

    var session = null;

    function clamp(val, minVal, maxVal) {
        if (val < minVal) return minVal;
        if (val > maxVal) return maxVal;
        return val;
    }

    function sendToParent(payload) {
        if (window.EditorBus && typeof window.EditorBus.sendToParent === 'function') {
            window.EditorBus.sendToParent(payload);
        } else if (typeof window.notifyParent === 'function') {
            window.notifyParent(payload);
        } else if (window.parent && window.parent !== window) {
            window.parent.postMessage(payload, '*');
        }
    }

    function extractBgUrl(bgStr) {
        if (!bgStr || bgStr === 'none') return '';
        var idx = bgStr.indexOf('url(');
        if (idx === -1) return '';
        var start = idx + 4;
        var end = bgStr.lastIndexOf(')');
        if (end <= start) return '';
        var raw = bgStr.slice(start, end).trim();
        while (raw.length > 0 && (raw.charAt(0) === '"' || raw.charAt(0) === "'")) {
            raw = raw.slice(1).trim();
        }
        while (raw.length > 0 && (raw.charAt(raw.length - 1) === '"' || raw.charAt(raw.length - 1) === "'")) {
            raw = raw.slice(0, -1).trim();
        }
        return raw;
    }

    function getBestSourceUrl(comp, shape) {
        try {
            var rootWin = window.top || window.parent || window;
            if (comp && comp.id && rootWin.__lf_orig_image_cache__ && rootWin.__lf_orig_image_cache__[comp.id]) {
                return rootWin.__lf_orig_image_cache__[comp.id];
            }
        } catch (err) {}
        if (shape && shape._v4OrigDataUrl) {
            return shape._v4OrigDataUrl;
        }
        var inlineUrl = shape ? extractBgUrl(shape.style.backgroundImage || '') : '';
        if (inlineUrl) return inlineUrl;
        var compStyle = shape ? window.getComputedStyle(shape) : null;
        return compStyle ? extractBgUrl(compStyle.backgroundImage || '') : '';
    }

    function readCropFractions(shape) {
        if (!shape) return { l: 0, t: 0, r: 0, b: 0, isCropped: false };
        var l = clamp(parseFloat(shape.getAttribute('data-crop-l')) || 0, 0, 0.96);
        var t = clamp(parseFloat(shape.getAttribute('data-crop-t')) || 0, 0, 0.96);
        var r = clamp(parseFloat(shape.getAttribute('data-crop-r')) || 0, 0, 0.96);
        var b = clamp(parseFloat(shape.getAttribute('data-crop-b')) || 0, 0, 0.96);
        if (l + r > 0.96) {
            var scaleX = 0.96 / (l + r);
            l = l * scaleX;
            r = r * scaleX;
        }
        if (t + b > 0.96) {
            var scaleY = 0.96 / (t + b);
            t = t * scaleY;
            b = b * scaleY;
        }
        var isCropped = (l > 0.0005 || t > 0.0005 || r > 0.0005 || b > 0.0005);
        return { l: l, t: t, r: r, b: b, isCropped: isCropped };
    }

    function hasCropAttributes(shape) {
        if (!shape) return false;
        return shape.hasAttribute('data-crop-l') ||
               shape.hasAttribute('data-crop-t') ||
               shape.hasAttribute('data-crop-r') ||
               shape.hasAttribute('data-crop-b');
    }

    function getContainer(comp) {
        if (window.SelectionAdorner && typeof window.SelectionAdorner.getContainer === 'function') {
            return window.SelectionAdorner.getContainer(comp);
        }
        if (!comp) return document.body;
        return (comp.closest && comp.closest('.pc-content-inner, .pc-content-area, .mobile-content-inner, .mobile-content-area, .mobile-content')) || document.body;
    }

    function computeParentToContainerOffset(comp, container) {
        if (!comp || !container) return { x: 0, y: 0 };
        var compRect = comp.getBoundingClientRect();
        var contRect = container.getBoundingClientRect();
        var scrollL = (container === document.body) ? (window.pageXOffset || document.documentElement.scrollLeft || 0) : container.scrollLeft;
        var scrollT = (container === document.body) ? (window.pageYOffset || document.documentElement.scrollTop || 0) : container.scrollTop;

        var visualL = (compRect.left - contRect.left) + scrollL;
        var visualT = (compRect.top - contRect.top) + scrollT;
        var localL = parseFloat(comp.style.left);
        if (isNaN(localL)) localL = comp.offsetLeft || 0;
        var localT = parseFloat(comp.style.top);
        if (isNaN(localT)) localT = comp.offsetTop || 0;

        return {
            x: visualL - localL,
            y: visualT - localT
        };
    }

    function ensureOrigRatioSaved(comp, shape, compW, compH, crop) {
        if (!shape) return 1;
        var existingOrig = parseFloat(shape.getAttribute('data-orig-ratio'));
        if (existingOrig && existingOrig > 0) return existingOrig;

        var natW = parseFloat(shape.getAttribute('data-natural-width') || (comp && comp.getAttribute('data-natural-width')));
        var natH = parseFloat(shape.getAttribute('data-natural-height') || (comp && comp.getAttribute('data-natural-height')));
        var origRatio = 1;
        if (natW > 0 && natH > 0) {
            origRatio = natW / natH;
        } else if (!crop.isCropped) {
            var attrR = parseFloat(shape.getAttribute('data-aspect-ratio') || (comp && comp.getAttribute('data-aspect-ratio')));
            origRatio = (attrR && attrR > 0) ? attrR : ((compH > 0) ? (compW / compH) : 1);
        } else {
            var visW = Math.max(0.04, 1 - crop.l - crop.r);
            var visH = Math.max(0.04, 1 - crop.t - crop.b);
            origRatio = (compW / visW) / Math.max(1, (compH / visH));
        }
        shape.setAttribute('data-orig-ratio', origRatio.toFixed(4));
        return origRatio;
    }

    function applyCropCssToShape(comp, shape, l, t, r, b, boxW, boxH) {
        var isEffectivelyFull = (l < 0.001 && t < 0.001 && r < 0.001 && b < 0.001);
        if (isEffectivelyFull) {
            shape.removeAttribute('data-crop-l');
            shape.removeAttribute('data-crop-t');
            shape.removeAttribute('data-crop-r');
            shape.removeAttribute('data-crop-b');
            shape.style.backgroundSize = 'cover';
            shape.style.backgroundPosition = 'center';
            shape.style.backgroundRepeat = 'no-repeat';
            var origRatio = parseFloat(shape.getAttribute('data-orig-ratio')) || ((boxH > 0) ? (boxW / boxH) : 1);
            var ratioStr = origRatio.toFixed(4);
            shape.setAttribute('data-aspect-ratio', ratioStr);
            if (comp) comp.setAttribute('data-aspect-ratio', ratioStr);
            return false;
        }

        shape.setAttribute('data-crop-l', l.toFixed(6));
        shape.setAttribute('data-crop-t', t.toFixed(6));
        shape.setAttribute('data-crop-r', r.toFixed(6));
        shape.setAttribute('data-crop-b', b.toFixed(6));

        var visW = Math.max(0.02, 1 - l - r);
        var visH = Math.max(0.02, 1 - t - b);
        var bgSizeX = (100 / visW).toFixed(4) + '%';
        var bgSizeY = (100 / visH).toFixed(4) + '%';

        var sumLR = l + r;
        var sumTB = t + b;
        var bgPosX = (sumLR > 0.000001 ? ((l / sumLR) * 100).toFixed(4) : '0') + '%';
        var bgPosY = (sumTB > 0.000001 ? ((t / sumTB) * 100).toFixed(4) : '0') + '%';

        shape.style.backgroundSize = bgSizeX + ' ' + bgSizeY;
        shape.style.backgroundPosition = bgPosX + ' ' + bgPosY;
        shape.style.backgroundRepeat = 'no-repeat';

        var origR = parseFloat(shape.getAttribute('data-orig-ratio')) || ((boxH > 0) ? (boxW / boxH) : 1);
        var newRatio = origR * (visW / visH);
        if (!newRatio || newRatio <= 0 || !isFinite(newRatio)) {
            newRatio = (boxH > 0) ? (boxW / boxH) : 1;
        }
        var newRatioStr = newRatio.toFixed(4);
        shape.setAttribute('data-aspect-ratio', newRatioStr);
        if (comp) comp.setAttribute('data-aspect-ratio', newRatioStr);
        return true;
    }

    function buildOverlayDOM(s) {
        var layer = document.createElement('div');
        layer.className = 'v4-image-crop-layer';

        // 1. Full Uncropped Ghost Image Backdrop
        var ghostBox = document.createElement('div');
        ghostBox.className = 'v4-crop-full-ghost';
        var ghostImg = document.createElement('div');
        ghostImg.className = 'v4-crop-full-ghost-img';
        ghostImg.style.backgroundImage = 'url("' + s.imgUrl + '")';
        ghostBox.appendChild(ghostImg);
        layer.appendChild(ghostBox);

        // 2. Active Bright Crop Box (Pannable interior + crisp clipped image + 3x3 guide grid)
        var activeBox = document.createElement('div');
        activeBox.className = 'v4-crop-active-box';
        activeBox.title = '드래그하여 자르기 영역 내 이미지 위치 이동';

        var clipWrap = document.createElement('div');
        clipWrap.className = 'v4-crop-bright-clip';
        var compRad = s.shape.style.borderRadius || window.getComputedStyle(s.shape).borderRadius;
        if (compRad && compRad !== '0px') {
            clipWrap.style.borderRadius = compRad;
        }

        var brightImg = document.createElement('div');
        brightImg.className = 'v4-crop-bright-img';
        brightImg.style.backgroundImage = 'url("' + s.imgUrl + '")';
        clipWrap.appendChild(brightImg);

        var gridOverlay = document.createElement('div');
        gridOverlay.className = 'v4-crop-thirds-grid';
        gridOverlay.innerHTML =
            '<div class="v4-crop-grid-line v-1"></div>' +
            '<div class="v4-crop-grid-line v-2"></div>' +
            '<div class="v4-crop-grid-line h-1"></div>' +
            '<div class="v4-crop-grid-line h-2"></div>';
        clipWrap.appendChild(gridOverlay);
        activeBox.appendChild(clipWrap);

        // 3. 8 PowerPoint-Style Black Crop Handles
        var dirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        dirs.forEach(function(dir) {
            var h = document.createElement('div');
            h.className = 'v4-crop-handle dir-' + dir;
            h.setAttribute('data-crop-dir', dir);
            var bar = document.createElement('span');
            bar.className = 'v4-crop-bar';
            h.appendChild(bar);
            activeBox.appendChild(h);
        });

        layer.appendChild(activeBox);

        // 4. Live Dimension Pill Badge (W x H px)
        var sizeBadge = document.createElement('div');
        sizeBadge.className = 'v4-crop-size-badge';
        layer.appendChild(sizeBadge);

        // 5. Floating Apply / Cancel Mini Action Bar (SVG Icons Only - No Emojis)
        var toolbar = document.createElement('div');
        toolbar.className = 'v4-crop-toolbar';
        toolbar.innerHTML =
            '<button type="button" class="v4-crop-action-btn apply" data-crop-action="apply" title="자르기 적용 (Enter)">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
                '<span>적용</span>' +
            '</button>' +
            '<button type="button" class="v4-crop-action-btn cancel" data-crop-action="cancel" title="취소 (Esc)">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
                '<span>취소</span>' +
            '</button>';
        layer.appendChild(toolbar);

        s.ghostBox = ghostBox;
        s.activeBox = activeBox;
        s.brightImg = brightImg;
        s.sizeBadge = sizeBadge;
        s.toolbar = toolbar;
        s.layerEl = layer;

        var compStyle = window.getComputedStyle(s.container);
        if (compStyle.position === 'static' && s.container !== document.body) {
            s.container.style.position = 'relative';
        }
        var trailingScript = Array.from(s.container.children).find(function(c) {
            return c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script';
        });
        if (trailingScript) {
            s.container.insertBefore(layer, trailingScript);
        } else {
            s.container.appendChild(layer);
        }
    }

    function updateOverlayPositions() {
        if (!session || !session.layerEl) return;
        var ox = session.offsetX;
        var oy = session.offsetY;

        var gL = Math.round(session.fullL + ox);
        var gT = Math.round(session.fullT + oy);
        var gW = Math.round(session.fullW);
        var gH = Math.round(session.fullH);

        session.ghostBox.style.left = gL + 'px';
        session.ghostBox.style.top = gT + 'px';
        session.ghostBox.style.width = gW + 'px';
        session.ghostBox.style.height = gH + 'px';

        var bL = Math.round(session.boxL + ox);
        var bT = Math.round(session.boxT + oy);
        var bW = Math.round(session.boxW);
        var bH = Math.round(session.boxH);

        session.activeBox.style.left = bL + 'px';
        session.activeBox.style.top = bT + 'px';
        session.activeBox.style.width = bW + 'px';
        session.activeBox.style.height = bH + 'px';

        session.brightImg.style.left = Math.round(session.fullL - session.boxL) + 'px';
        session.brightImg.style.top = Math.round(session.fullT - session.boxT) + 'px';
        session.brightImg.style.width = gW + 'px';
        session.brightImg.style.height = gH + 'px';

        session.sizeBadge.textContent = bW + ' × ' + bH + ' px';
        session.sizeBadge.style.left = Math.round(bL + (bW / 2)) + 'px';
        var badgeTop = (bT + bH + 28 < (session.container.scrollHeight || 900)) ? (bT + bH + 10) : Math.max(4, bT - 28);
        session.sizeBadge.style.top = Math.round(badgeTop) + 'px';

        var toolbarTop = (bT >= 40) ? (bT - 36) : (bT + 8);
        var toolbarLeft = Math.max(8, bL + bW - 124);
        session.toolbar.style.left = Math.round(toolbarLeft) + 'px';
        session.toolbar.style.top = Math.round(toolbarTop) + 'px';
    }

    function teardownOverlay() {
        if (session) {
            if (session.comp) {
                session.comp.classList.remove('v4-cropping-active');
            }
            if (session.layerEl && session.layerEl.parentNode) {
                session.layerEl.parentNode.removeChild(session.layerEl);
            }
        }
        document.querySelectorAll('.v4-image-crop-layer').forEach(function(el) { el.remove(); });
        document.querySelectorAll('.lf-component.v4-cropping-active').forEach(function(el) { el.classList.remove('v4-cropping-active'); });
        session = null;
    }

    function startCrop(targetId) {
        if (session) {
            if (!targetId || (session.comp && session.comp.id === targetId)) {
                applyCrop();
                return;
            }
            applyCrop();
        }

        var comp = (targetId ? document.getElementById(targetId) : null) || document.querySelector('.lf-component.selected');
        if (!comp) return;
        var shape = comp.querySelector('.v4-shape.v4-shape-image') || (comp.classList.contains('v4-shape-image') ? comp : null);
        if (!shape) return;

        var imgUrl = getBestSourceUrl(comp, shape);
        if (!imgUrl) return;

        var compL = parseFloat(comp.style.left);
        if (isNaN(compL)) compL = comp.offsetLeft || 0;
        var compT = parseFloat(comp.style.top);
        if (isNaN(compT)) compT = comp.offsetTop || 0;
        var compW = parseFloat(comp.style.width) || comp.offsetWidth || 200;
        var compH = parseFloat(comp.style.height) || comp.offsetHeight || 200;

        var crop = readCropFractions(shape);
        ensureOrigRatioSaved(comp, shape, compW, compH, crop);

        var fullL = compL;
        var fullT = compT;
        var fullW = compW;
        var fullH = compH;

        if (hasCropAttributes(shape) && crop.isCropped) {
            var visW = Math.max(0.02, 1 - crop.l - crop.r);
            var visH = Math.max(0.02, 1 - crop.t - crop.b);
            fullW = compW / visW;
            fullH = compH / visH;
            fullL = compL - (crop.l * fullW);
            fullT = compT - (crop.t * fullH);
        } else {
            // Check if uncropped background-size: cover was implicitly clipping due to manual non-proportional resize
            var natW = parseFloat(shape.getAttribute('data-natural-width') || comp.getAttribute('data-natural-width'));
            var natH = parseFloat(shape.getAttribute('data-natural-height') || comp.getAttribute('data-natural-height'));
            var bgSize = (shape.style.backgroundSize || 'cover').toLowerCase();
            if (natW > 0 && natH > 0 && bgSize === 'cover') {
                var natRatio = natW / natH;
                var boxRatio = compW / Math.max(1, compH);
                if (Math.abs(boxRatio - natRatio) > 0.015) {
                    var coverScale = Math.max(compW / natW, compH / natH);
                    fullW = natW * coverScale;
                    fullH = natH * coverScale;
                    fullL = compL - ((fullW - compW) / 2);
                    fullT = compT - ((fullH - compH) / 2);
                }
            }
        }

        // Clear normal selection adorners and smart guides while in PPT crop mode
        if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
            window.SelectionAdorner.clear();
        }
        if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
            window.ResponsiveSmartGuide.clearGuides(true);
        }
        sendToParent({ type: 'LF_CLEAR_SMARTGUIDE' });

        var container = getContainer(comp);
        var offset = computeParentToContainerOffset(comp, container);

        session = {
            comp: comp,
            shape: shape,
            container: container,
            imgUrl: imgUrl,
            offsetX: offset.x,
            offsetY: offset.y,
            initCompL: compL,
            initCompT: compT,
            initCompW: compW,
            initCompH: compH,
            initFullL: fullL,
            initFullT: fullT,
            boxL: compL,
            boxT: compT,
            boxW: compW,
            boxH: compH,
            fullL: fullL,
            fullT: fullT,
            fullW: fullW,
            fullH: fullH,
            dragMode: null, // 'handle' | 'pan'
            activeDir: null,
            startX: 0,
            startY: 0,
            startBoxL: 0,
            startBoxT: 0,
            startBoxW: 0,
            startBoxH: 0,
            startFullL: 0,
            startFullT: 0
        };

        comp.classList.add('v4-cropping-active');
        buildOverlayDOM(session);
        updateOverlayPositions();

        sendToParent({
            type: 'LF_IMAGE_CROP_STATE',
            active: true,
            id: comp.id,
            isCropped: crop.isCropped,
            w: Math.round(compW),
            h: Math.round(compH)
        });
    }

    function applyCrop(silentSelectionSync) {
        if (!session) return false;
        var s = session;
        var comp = s.comp;
        var shape = s.shape;

        var boxL = Math.round(s.boxL);
        var boxT = Math.round(s.boxT);
        var boxW = Math.max(16, Math.round(s.boxW));
        var boxH = Math.max(16, Math.round(s.boxH));
        var fullL = s.fullL;
        var fullT = s.fullT;
        var fullW = Math.max(boxW, s.fullW);
        var fullH = Math.max(boxH, s.fullH);

        var hasChanged = (
            Math.abs(boxL - s.initCompL) >= 0.5 ||
            Math.abs(boxT - s.initCompT) >= 0.5 ||
            Math.abs(boxW - s.initCompW) >= 0.5 ||
            Math.abs(boxH - s.initCompH) >= 0.5 ||
            Math.abs(fullL - s.initFullL) >= 0.5 ||
            Math.abs(fullT - s.initFullT) >= 0.5
        );

        // Tear down temporary crop DOM BEFORE taking undo snapshot so undo state is 100% clean
        teardownOverlay();

        var nowCropped = readCropFractions(shape).isCropped;

        if (hasChanged && comp && shape) {
            if (window.V4UndoManager && typeof window.V4UndoManager.saveState === 'function') {
                window.V4UndoManager.saveState();
            }

            var newL = clamp((boxL - fullL) / fullW, 0, 0.96);
            var newT = clamp((boxT - fullT) / fullH, 0, 0.96);
            var newR = clamp(((fullL + fullW) - (boxL + boxW)) / fullW, 0, 0.96);
            var newB = clamp(((fullT + fullH) - (boxT + boxH)) / fullH, 0, 0.96);

            comp.style.left = boxL + 'px';
            comp.style.top = boxT + 'px';
            comp.style.width = boxW + 'px';
            comp.style.height = boxH + 'px';
            comp.setAttribute('data-resized', 'true');

            var bestUrl = getBestSourceUrl(comp, shape);
            if (bestUrl) {
                shape.style.backgroundImage = 'url("' + bestUrl + '")';
            }
            shape.removeAttribute('data-crisp-size');
            shape._v4ScheduledKey = '';

            nowCropped = applyCropCssToShape(comp, shape, newL, newT, newR, newB, boxW, boxH);

            if (typeof window.markDirty === 'function') window.markDirty();
            else sendToParent({ type: 'LF_DIRTY' });

            if (typeof window.enforceDesignSystem === 'function') {
                window.enforceDesignSystem();
            }

            sendToParent({
                type: 'LF_SNAP_END',
                id: comp.id,
                x: boxL,
                y: boxT,
                w: boxW,
                h: boxH
            });
        }

        if (comp && comp.isConnected) {
            if (!silentSelectionSync) {
                document.querySelectorAll('.lf-component').forEach(function(el) { el.classList.remove('selected'); });
                comp.classList.add('selected');
                window.activeEl = comp;
                if (typeof window.updateHandles === 'function') {
                    window.updateHandles(comp);
                } else if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
                    window.SelectionAdorner.update(comp);
                }
                var styles = (typeof window._getCompStyles === 'function') ? window._getCompStyles(comp) : { id: comp.id, w: boxW, h: boxH, isImage: true, isImageShape: true, isCropped: nowCropped };
                sendToParent(Object.assign({
                    type: 'LF_COMP_SELECTED',
                    shiftKey: false
                }, styles));
            }
            sendToParent({
                type: 'LF_IMAGE_CROP_STATE',
                active: false,
                id: comp.id,
                isCropped: nowCropped,
                w: boxW,
                h: boxH
            });
        } else {
            sendToParent({ type: 'LF_IMAGE_CROP_STATE', active: false, id: null, isCropped: false });
        }
        return true;
    }

    function cancelCrop() {
        if (!session) return false;
        var comp = session.comp;
        var shape = session.shape;
        teardownOverlay();

        var crop = readCropFractions(shape);
        if (comp && comp.isConnected) {
            comp.classList.add('selected');
            window.activeEl = comp;
            if (typeof window.updateHandles === 'function') {
                window.updateHandles(comp);
            } else if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
                window.SelectionAdorner.update(comp);
            }
            var compW = parseFloat(comp.style.width) || comp.offsetWidth || 200;
            var compH = parseFloat(comp.style.height) || comp.offsetHeight || 200;
            sendToParent({
                type: 'LF_COMP_RESIZED',
                id: comp.id,
                w: Math.round(compW),
                h: Math.round(compH)
            });
            sendToParent({
                type: 'LF_IMAGE_CROP_STATE',
                active: false,
                id: comp.id,
                isCropped: crop.isCropped,
                w: Math.round(compW),
                h: Math.round(compH)
            });
        } else {
            sendToParent({ type: 'LF_IMAGE_CROP_STATE', active: false, id: null, isCropped: false });
        }
        return true;
    }

    function resetCrop(targetId) {
        if (session) {
            teardownOverlay();
        }
        var comp = (targetId ? document.getElementById(targetId) : null) || document.querySelector('.lf-component.selected');
        if (!comp) return;
        var shape = comp.querySelector('.v4-shape.v4-shape-image') || (comp.classList.contains('v4-shape-image') ? comp : null);
        if (!shape) return;

        var crop = readCropFractions(shape);
        if (!crop.isCropped && !hasCropAttributes(shape)) {
            sendToParent({ type: 'LF_IMAGE_CROP_STATE', active: false, id: comp.id, isCropped: false });
            return;
        }

        if (window.V4UndoManager && typeof window.V4UndoManager.saveState === 'function') {
            window.V4UndoManager.saveState();
        }

        var compL = parseFloat(comp.style.left);
        if (isNaN(compL)) compL = comp.offsetLeft || 0;
        var compT = parseFloat(comp.style.top);
        if (isNaN(compT)) compT = comp.offsetTop || 0;
        var compW = parseFloat(comp.style.width) || comp.offsetWidth || 200;
        var compH = parseFloat(comp.style.height) || comp.offsetHeight || 200;

        var visW = Math.max(0.02, 1 - crop.l - crop.r);
        var visH = Math.max(0.02, 1 - crop.t - crop.b);
        var fullW = Math.round(compW / visW);
        var fullH = Math.round(compH / visH);
        var fullL = Math.round(compL - (crop.l * fullW));
        var fullT = Math.round(compT - (crop.t * fullH));

        var origRatio = ensureOrigRatioSaved(comp, shape, compW, compH, crop);
        var ratioStr = origRatio.toFixed(4);

        comp.style.left = fullL + 'px';
        comp.style.top = fullT + 'px';
        comp.style.width = fullW + 'px';
        comp.style.height = fullH + 'px';
        comp.setAttribute('data-aspect-ratio', ratioStr);
        comp.setAttribute('data-resized', 'true');

        shape.removeAttribute('data-crop-l');
        shape.removeAttribute('data-crop-t');
        shape.removeAttribute('data-crop-r');
        shape.removeAttribute('data-crop-b');
        shape.setAttribute('data-aspect-ratio', ratioStr);
        shape.style.backgroundSize = 'cover';
        shape.style.backgroundPosition = 'center';
        shape.style.backgroundRepeat = 'no-repeat';

        var bestUrl = getBestSourceUrl(comp, shape);
        if (bestUrl) {
            shape.style.backgroundImage = 'url("' + bestUrl + '")';
        }
        shape.removeAttribute('data-crisp-size');
        shape._v4ScheduledKey = '';

        if (typeof window.markDirty === 'function') window.markDirty();
        else sendToParent({ type: 'LF_DIRTY' });

        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }

        if (typeof window.updateHandles === 'function') {
            window.updateHandles(comp);
        } else if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
            window.SelectionAdorner.update(comp);
        }

        sendToParent({
            type: 'LF_SNAP_END',
            id: comp.id,
            x: fullL,
            y: fullT,
            w: fullW,
            h: fullH
        });

        var styles = (typeof window._getCompStyles === 'function') ? window._getCompStyles(comp) : { id: comp.id, w: fullW, h: fullH, isImage: true, isImageShape: true, isCropped: false };
        sendToParent(Object.assign({
            type: 'LF_COMP_SELECTED',
            shiftKey: false
        }, styles));

        sendToParent({
            type: 'LF_IMAGE_CROP_STATE',
            active: false,
            id: comp.id,
            isCropped: false,
            w: fullW,
            h: fullH
        });
    }

    function setCropBoxSize(widthVal, heightVal) {
        if (!session) return false;
        var minW = Math.min(20, Math.max(10, Math.floor(session.fullW * 0.2)));
        var minH = Math.min(20, Math.max(10, Math.floor(session.fullH * 0.2)));

        if (widthVal !== undefined && widthVal !== null && !isNaN(parseFloat(widthVal))) {
            var targetW = clamp(Math.round(parseFloat(widthVal)), minW, Math.round(session.fullW));
            session.boxW = targetW;
            if (session.boxL + session.boxW > session.fullL + session.fullW) {
                session.boxL = Math.max(session.fullL, (session.fullL + session.fullW) - session.boxW);
            }
        }
        if (heightVal !== undefined && heightVal !== null && !isNaN(parseFloat(heightVal))) {
            var targetH = clamp(Math.round(parseFloat(heightVal)), minH, Math.round(session.fullH));
            session.boxH = targetH;
            if (session.boxT + session.boxH > session.fullT + session.fullH) {
                session.boxT = Math.max(session.fullT, (session.fullT + session.fullH) - session.boxH);
            }
        }
        updateOverlayPositions();
        sendToParent({
            type: 'LF_COMP_RESIZED',
            id: session.comp ? session.comp.id : null,
            w: Math.round(session.boxW),
            h: Math.round(session.boxH)
        });
        return true;
    }

    // --- High-Priority Capture Event Listeners in Iframe ---
    document.addEventListener('mousedown', function(e) {
        if (!session) return;

        var actionBtn = e.target.closest ? e.target.closest('[data-crop-action]') : null;
        if (actionBtn) {
            e.preventDefault();
            e.stopPropagation();
            var act = actionBtn.getAttribute('data-crop-action');
            if (act === 'apply') applyCrop();
            else if (act === 'cancel') cancelCrop();
            return;
        }

        var handleEl = e.target.closest ? e.target.closest('.v4-crop-handle') : null;
        if (handleEl) {
            e.preventDefault();
            e.stopPropagation();
            session.dragMode = 'handle';
            session.activeDir = handleEl.getAttribute('data-crop-dir') || 'se';
            session.startX = e.clientX;
            session.startY = e.clientY;
            session.startBoxL = session.boxL;
            session.startBoxT = session.boxT;
            session.startBoxW = session.boxW;
            session.startBoxH = session.boxH;
            session.layerEl.classList.add('is-dragging');
            return;
        }

        var activeBox = e.target.closest ? e.target.closest('.v4-crop-active-box') : null;
        if (activeBox) {
            e.preventDefault();
            e.stopPropagation();
            session.dragMode = 'pan';
            session.activeDir = null;
            session.startX = e.clientX;
            session.startY = e.clientY;
            session.startFullL = session.fullL;
            session.startFullT = session.fullT;
            session.layerEl.classList.add('is-dragging');
            return;
        }

        // Clicking anywhere outside the active crop box & handles commits the crop (PPT Standard UX)
        var clickedOtherComp = e.target.closest ? e.target.closest('.lf-component') : null;
        if (clickedOtherComp && session.comp && clickedOtherComp !== session.comp) {
            // Commit silently and allow normal mousedown to select the newly clicked component
            applyCrop(true);
            return;
        }

        // Clicked empty canvas or ghost outside crop box -> commit crop and keep cropped image selected
        e.preventDefault();
        e.stopPropagation();
        applyCrop(false);
    }, true);

    document.addEventListener('mousemove', function(e) {
        if (!session || !session.dragMode) return;
        e.preventDefault();
        e.stopPropagation();

        var dx = e.clientX - session.startX;
        var dy = e.clientY - session.startY;

        if (session.dragMode === 'pan') {
            if (e.shiftKey) {
                if (Math.abs(dx) >= Math.abs(dy)) dy = 0;
                else dx = 0;
            }
            var minFullL = (session.boxL + session.boxW) - session.fullW;
            var maxFullL = session.boxL;
            var minFullT = (session.boxT + session.boxH) - session.fullH;
            var maxFullT = session.boxT;

            session.fullL = clamp(session.startFullL + dx, minFullL, maxFullL);
            session.fullT = clamp(session.startFullT + dy, minFullT, maxFullT);
            updateOverlayPositions();
            return;
        }

        if (session.dragMode === 'handle') {
            var dir = session.activeDir || 'se';
            var minW = Math.min(20, Math.max(12, Math.floor(session.fullW * 0.1)));
            var minH = Math.min(20, Math.max(12, Math.floor(session.fullH * 0.1)));

            var left = session.startBoxL;
            var right = session.startBoxL + session.startBoxW;
            var top = session.startBoxT;
            var bottom = session.startBoxT + session.startBoxH;

            var boundMinX = session.fullL;
            var boundMaxX = session.fullL + session.fullW;
            var boundMinY = session.fullT;
            var boundMaxY = session.fullT + session.fullH;

            if (dir.indexOf('w') !== -1) {
                left = clamp(session.startBoxL + dx, boundMinX, right - minW);
            }
            if (dir.indexOf('e') !== -1) {
                right = clamp((session.startBoxL + session.startBoxW) + dx, left + minW, boundMaxX);
            }
            if (dir.indexOf('n') !== -1) {
                top = clamp(session.startBoxT + dy, boundMinY, bottom - minH);
            }
            if (dir.indexOf('s') !== -1) {
                bottom = clamp((session.startBoxT + session.startBoxH) + dy, top + minH, boundMaxY);
            }

            // Hold Shift on corner handles to preserve initial crop aspect ratio
            var isCorner = (dir.length === 2);
            if (isCorner && e.shiftKey && session.startBoxH > 0) {
                var ratio = session.startBoxW / session.startBoxH;
                var curW = right - left;
                var curH = bottom - top;
                if (Math.abs(dx) >= Math.abs(dy)) {
                    var desiredH = clamp(curW / ratio, minH, boundMaxY - boundMinY);
                    if (dir.indexOf('n') !== -1) {
                        top = Math.max(boundMinY, bottom - desiredH);
                        curH = bottom - top;
                        curW = curH * ratio;
                        if (dir.indexOf('w') !== -1) left = right - curW;
                        else right = left + curW;
                    } else {
                        bottom = Math.min(boundMaxY, top + desiredH);
                        curH = bottom - top;
                        curW = curH * ratio;
                        if (dir.indexOf('w') !== -1) left = right - curW;
                        else right = left + curW;
                    }
                } else {
                    var desiredW = clamp(curH * ratio, minW, boundMaxX - boundMinX);
                    if (dir.indexOf('w') !== -1) {
                        left = Math.max(boundMinX, right - desiredW);
                        curW = right - left;
                        curH = curW / ratio;
                        if (dir.indexOf('n') !== -1) top = bottom - curH;
                        else bottom = top + curH;
                    } else {
                        right = Math.min(boundMaxX, left + desiredW);
                        curW = right - left;
                        curH = curW / ratio;
                        if (dir.indexOf('n') !== -1) top = bottom - curH;
                        else bottom = top + curH;
                    }
                }
            }

            session.boxL = left;
            session.boxT = top;
            session.boxW = right - left;
            session.boxH = bottom - top;

            updateOverlayPositions();
            sendToParent({
                type: 'LF_COMP_RESIZED',
                id: session.comp ? session.comp.id : null,
                w: Math.round(session.boxW),
                h: Math.round(session.boxH)
            });
        }
    }, true);

    document.addEventListener('mouseup', function(e) {
        if (!session || !session.dragMode) return;
        e.preventDefault();
        e.stopPropagation();
        session.dragMode = null;
        session.activeDir = null;
        if (session.layerEl) {
            session.layerEl.classList.remove('is-dragging');
        }
    }, true);

    document.addEventListener('keydown', function(e) {
        if (!session) return;
        var activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

        if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
            e.preventDefault();
            e.stopPropagation();
            applyCrop(false);
            return;
        }
        if (e.key === 'Escape' || e.code === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            cancelCrop();
            return;
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Prevent accidental deletion of the whole image while in crop mode
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    }, true);

    // Register Message Handlers into Global Iframe Dispatcher Registry SSOT
    window.v4MessageHandlers = window.v4MessageHandlers || {};
    window.v4MessageHandlers['LF_IMAGE_CROP_START'] = function(d) {
        startCrop(d && d.id);
    };
    window.v4MessageHandlers['LF_IMAGE_CROP_APPLY'] = function() {
        applyCrop(false);
    };
    window.v4MessageHandlers['LF_IMAGE_CROP_CANCEL'] = function() {
        cancelCrop();
    };
    window.v4MessageHandlers['LF_IMAGE_CROP_RESET'] = function(d) {
        resetCrop(d && d.id);
    };
    window.v4MessageHandlers['LF_IMAGE_CROP_SET_SIZE'] = function(d) {
        if (d) setCropBoxSize(d.width, d.height);
    };

    window.V4ImageCropEngine = {
        isActive: function() { return !!session; },
        start: startCrop,
        apply: applyCrop,
        cancel: cancelCrop,
        reset: resetCrop,
        setSize: setCropBoxSize,
        readCropFractions: readCropFractions
    };
})();
`;
