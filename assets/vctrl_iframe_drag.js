/**
 * assets/vctrl_iframe_drag.js
 * Mouse drag and element resizing engine logic for LF Editor Studio (Iframe Side).
 */

window.v4DragResizeScript = `
(function() {
    let isDragging = false;
    let isResizing = false;
    let isPendingDrag = false;
    const DRAG_THRESHOLD = 4;
    let startX = 0, startY = 0, startW = 0, startH = 0, startTop = 0, startLeft = 0;
    let startRect = null;
    let groupChildrenStart = null;
    

    function _handleResponsiveCrossFrameDrop(activeEl, isResp) {
        var pcFrame = document.querySelector('.pc-browser-frame, .pc-frame');
        var mobileFrame = document.querySelector('.mobile-frame, .mobile-browser-frame');
        var pcInner = document.querySelector('.pc-content-inner');
        var mobileInner = document.querySelector('.mobile-content-inner');

        var isInsideGroup = !!(activeEl.parentElement && activeEl.parentElement.closest('.lf-group'));
        if (isResp && pcFrame && mobileFrame && pcInner && mobileInner && !isInsideGroup) {
            var compRect = activeEl.getBoundingClientRect();
            var compCenterX = compRect.left + compRect.width / 2;
            var mobileRect = mobileFrame.getBoundingClientRect();
            var compW = activeEl.offsetWidth || 100;

            var isCurrentlyInMobile = mobileInner.contains(activeEl);
            var isCurrentlyInPc = pcInner.contains(activeEl);
            var isDroppedOnMobile = compCenterX >= mobileRect.left;

            if (isDroppedOnMobile) {
                var mobileMaxW = Math.max(0, (mobileInner.offsetWidth || 360) - compW);
                if (!isCurrentlyInMobile) {
                    var mobileInnerRect = mobileInner.getBoundingClientRect();
                    var relTop = compRect.top - mobileInnerRect.top;
                    var relLeft = compRect.left - mobileInnerRect.left;
                    var clampedLeft = Math.max(0, Math.min(mobileMaxW, relLeft));
                    var clampedTop = Math.max(0, relTop);

                    activeEl.style.top = clampedTop + 'px';
                    activeEl.style.left = clampedLeft + 'px';
                    mobileInner.appendChild(activeEl);
                } else {
                    var curL = parseFloat(activeEl.style.left) || 0;
                    var curT = parseFloat(activeEl.style.top) || 0;
                    activeEl.style.left = Math.max(0, Math.min(mobileMaxW, curL)) + 'px';
                    activeEl.style.top = Math.max(0, curT) + 'px';
                }
                window.lastActiveFrame = 'mobile';
                if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('mobile');
            } else {
                var pcFrameWidth = pcInner.offsetWidth || 1160;
                var pcMaxW = Math.max(0, pcFrameWidth - compW);
                if (!isCurrentlyInPc) {
                    var pcInnerRect = pcInner.getBoundingClientRect();
                    var relTop = compRect.top - pcInnerRect.top;
                    var relLeft = compRect.left - pcInnerRect.left;
                    var clampedLeft = Math.max(0, Math.min(pcMaxW, relLeft));
                    var clampedTop = Math.max(0, relTop);

                    activeEl.style.top = clampedTop + 'px';
                    activeEl.style.left = clampedLeft + 'px';
                    pcInner.appendChild(activeEl);
                } else {
                    var curL = parseFloat(activeEl.style.left) || 0;
                    var curT = parseFloat(activeEl.style.top) || 0;
                    activeEl.style.left = Math.max(0, Math.min(pcMaxW, curL)) + 'px';
                    activeEl.style.top = Math.max(0, curT) + 'px';
                }
                window.lastActiveFrame = 'pc';
                if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('pc');
            }

            if (activeEl && activeEl.getAttribute) {
                var curFixed = activeEl.getAttribute('data-scroll-fixed');
                if (curFixed === 'custom' || curFixed === 'floating') {
                    var newTop = parseFloat(activeEl.style.top) || 0;
                    activeEl.setAttribute('data-scroll-target-y', String(Math.round(newTop)));
                }
            }
        }
    }

    function _handlePinMarkerDropAnchoring(pin) {
        if (!pin || (!pin.classList.contains('text-marker') && !pin.classList.contains('pin-marker'))) return;
        var parent = pin.parentElement;
        var hostContainer = (parent && parent.classList && parent.classList.contains('v4-pin-layer')) ? parent.parentElement : parent;
        var scrollArea = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getScrollArea === 'function')
            ? window.ResponsiveFrameUtils.getScrollArea(pin)
            : (pin.closest ? pin.closest('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content') : null);
        var scrollTop = scrollArea ? (scrollArea.scrollTop || 0) : 0;

        if (hostContainer) {
            var pinnedHosts = Array.from(hostContainer.children).filter(function(el) {
                return el !== pin && el !== parent && el.hasAttribute && el.hasAttribute('data-scroll-fixed') &&
                       !el.classList.contains('pin-marker') && !el.classList.contains('text-marker');
            });

            var pinRect = pin.getBoundingClientRect();
            var pCenterX = pinRect.left + pinRect.width / 2;
            var pCenterY = pinRect.top + pinRect.height / 2;

            var matchedHost = null;
            for (var i = 0; i < pinnedHosts.length; i++) {
                var hRect = pinnedHosts[i].getBoundingClientRect();
                if (pCenterX >= hRect.left && pCenterX <= hRect.right &&
                    pCenterY >= hRect.top && pCenterY <= hRect.bottom) {
                    matchedHost = pinnedHosts[i];
                    break;
                }
            }

            if (matchedHost) {
                var hostMode = matchedHost.getAttribute('data-scroll-fixed');
                pin.setAttribute('data-scroll-fixed', hostMode);
                if (matchedHost.id) pin.setAttribute('data-fixed-host', matchedHost.id);
                pin.style.setProperty('z-index', '200050', 'important');
                pin.style.willChange = 'transform';

                var hRect = matchedHost.getBoundingClientRect();
                var offsetInsideHostY = pinRect.top - hRect.top;
                var offsetInsideHostX = pinRect.left - hRect.left;
                var hostDomTop = parseFloat(matchedHost.style.top) || 0;
                var hostDomLeft = parseFloat(matchedHost.style.left) || 0;

                pin.style.top = Math.round(hostDomTop + offsetInsideHostY) + 'px';
                pin.style.left = Math.round(hostDomLeft + offsetInsideHostX) + 'px';

                if (matchedHost.style.transform) {
                    pin.style.setProperty('transform', matchedHost.style.transform, 'important');
                }

                var trailingRef = Array.from(parent.children).find(function(c) {
                    return !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script');
                });
                if (trailingRef && trailingRef.parentNode === parent) {
                    parent.insertBefore(pin, trailingRef);
                } else {
                    parent.appendChild(pin);
                }
            } else if (pin.hasAttribute('data-scroll-fixed')) {
                var curFixedMode = pin.getAttribute('data-scroll-fixed');
                var isIndependentViewport = (curFixedMode === 'viewport' && !pin.hasAttribute('data-fixed-host'));

                if (isIndependentViewport) {
                    pin.style.setProperty('z-index', '200050', 'important');
                    pin.style.willChange = 'transform';
                } else {
                    var scrollAreaRect = scrollArea ? scrollArea.getBoundingClientRect() : { top: 0, left: 0 };
                    var freeTop = (pinRect.top - scrollAreaRect.top) + scrollTop;
                    var freeLeft = (pinRect.left - scrollAreaRect.left);

                    pin.removeAttribute('data-scroll-fixed');
                    pin.removeAttribute('data-fixed-host');
                    pin.style.removeProperty('transform');
                    pin.style.removeProperty('will-change');
                    pin.style.setProperty('z-index', '200000', 'important');
                    pin.style.top = Math.max(0, Math.round(freeTop)) + 'px';
                    pin.style.left = Math.max(0, Math.round(freeLeft)) + 'px';
                }
            }
        }
    }

    function _dispatchPinPositionUpdates(activeEl) {
        if (!activeEl) return;
        if (activeEl.classList.contains('text-marker') || activeEl.classList.contains('pin-marker')) {
            var frameType = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getFrameType === 'function')
                ? window.ResponsiveFrameUtils.getFrameType(activeEl)
                : (activeEl.getAttribute('data-frame') || (activeEl.closest && activeEl.closest('.pc-content-inner, .pc-content-area') ? 'pc' : (activeEl.closest && activeEl.closest('.mobile-content-inner, .mobile-content-area') ? 'mobile' : '')));
            var idx = parseInt(activeEl.getAttribute('data-index'));
            if (isNaN(idx)) {
                idx = parseInt(activeEl.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''));
            }
            notifyParent({
                type: 'LF_UPDATE_PIN_POS',
                index: idx,
                frame: frameType,
                x: parseFloat(activeEl.style.left) || 0,
                y: parseFloat(activeEl.style.top) || 0,
                standardized: true
            });
        }
        if (activeEl.classList.contains('lf-group')) {
            var hostRect = document.body.getBoundingClientRect();
            activeEl.querySelectorAll('.text-marker, .pin-marker').forEach(function(child) {
                var childIdx = parseInt(child.id.replace('v4-pin-', ''));
                if (!isNaN(childIdx)) {
                    var childRect = child.getBoundingClientRect();
                    var absX = childRect.left - hostRect.left;
                    var absY = childRect.top - hostRect.top;
                    notifyParent({
                        type: 'LF_UPDATE_PIN_POS',
                        index: childIdx,
                        x: absX,
                        y: absY,
                        standardized: true
                    });
                }
            });
        }
    }

    window.V4DragResizeEngine = {
        get isDragging() { return isDragging; },
        set isDragging(v) { isDragging = v; },
        get isResizing() { return isResizing; },
        set isResizing(v) { isResizing = v; },
        get isPendingDrag() { return isPendingDrag; },
        set isPendingDrag(v) { isPendingDrag = v; },
        
        handleMouseDown: function(e, h, r, d, c) {
            if (!c) return;
            isPendingDrag = true;
            isDragging = false;
            window.activeEl = c;
            startX = e.clientX;
            startY = e.clientY;
            
            let l = parseFloat(window.activeEl.style.left);
            if (isNaN(l)) l = window.activeEl.offsetLeft || 0;
            let t = parseFloat(window.activeEl.style.top);
            if (isNaN(t)) t = window.activeEl.offsetTop || 0;
            startLeft = l;
            startTop = t;
            startRect = window.activeEl.getBoundingClientRect();

            if (h || e.target.tagName === 'IMG' || e.target.closest('img') || e.target.closest('.v4-editable-cell') || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                e.preventDefault();
            }
        },
        
        handleMouseMove: function(e) {
            if (isPendingDrag && window.activeEl) {
                const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
                if (dist >= DRAG_THRESHOLD) {
                    isPendingDrag = false;
                    isDragging = true;
                    if (window.TableSelection) {
                        window.TableSelection.isDragging = false;
                    }
                    if (window.getSelection) {
                        try { window.getSelection().removeAllRanges(); } catch(selErr) {}
                    }
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const isResp = window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive();
                    if (!isResp) {
                        notifyParent({ type: 'LF_SNAP_START' });
                    }
                    document.querySelectorAll('.lf-component.selected').forEach(s => s.classList.add('dragging-now'));

                    if (window.activeEl) {
                        if (isResp) {
                            const ctx = window.ResponsiveSmartGuide.getContainerContext(window.activeEl);
                            if (ctx) window.ResponsiveSmartGuide.findSnapTargets(ctx, window.activeEl);
                        }
                    }
                }
            }

            if (isDragging && window.activeEl) {
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;

                if (e.shiftKey) {
                    if (Math.abs(dx) >= Math.abs(dy)) dy = 0;
                    else dx = 0;
                }

                // Note: e.clientX/Y inside the iframe are already unscaled by the browser's coordinate mapping.
                const logicalX = startLeft + dx;
                const logicalY = startTop + dy;

                window.activeEl.style.left = logicalX + 'px';
                window.activeEl.style.top = logicalY + 'px';

                const isResp = window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive();
                if (isResp) {
                    const ctx = window.ResponsiveSmartGuide.getContainerContext(window.activeEl);
                    if (ctx) {
                        const w = window.activeEl.offsetWidth || 100;
                        const h = window.activeEl.offsetHeight || 40;

                        const snap = window.ResponsiveSmartGuide.calculateSnap(logicalX, logicalY, w, h, false, window.activeEl.id);
                        window.ResponsiveSmartGuide.drawGuides(ctx, snap);

                        if (snap.snapXData) {
                            window.activeEl.style.left = snap.x + 'px';
                        }
                        if (snap.snapYData) {
                            window.activeEl.style.top = snap.y + 'px';
                        }
                    }
                } else {
                    notifyParent({ type: 'LF_SNAP_REQUEST', x: logicalX, y: logicalY, w: window.activeEl.offsetWidth, h: window.activeEl.offsetHeight, activeId: window.activeEl.id });
                }
                markDirty();
            }
            else if (isResizing && window.activeEl) {
                const shapeLine = window.activeEl.querySelector('.v4-shape-line');
                const shapeImage = window.activeEl.querySelector('.v4-shape-image');
                const isImage = !!shapeImage || window.activeEl.classList.contains('v4-shape-image') || !!window.activeEl.getAttribute('data-aspect-ratio');
                
                let nw = Math.max(10, startW + (e.clientX - startX));
                let nh = Math.max(10, startH + (e.clientY - startY));
                
                if (shapeLine) {
                    const isVert = shapeLine.getAttribute('data-line-dir') === 'vertical';
                    const th = parseFloat(shapeLine.getAttribute('data-line-width')) || 1.6;
                    if (isVert) {
                        nw = Math.max(th, 2);
                    } else {
                        nh = Math.max(th, 2);
                    }
                } else if (isImage || e.shiftKey) {
                    let ratio = null;
                    const attrRatio = window.activeEl.getAttribute('data-aspect-ratio') || (shapeImage && shapeImage.getAttribute('data-aspect-ratio'));
                    if (attrRatio && !isNaN(parseFloat(attrRatio))) {
                        ratio = parseFloat(attrRatio);
                    } else if (startW > 0 && startH > 0) {
                        ratio = startW / startH;
                    }
                    
                    if (ratio && ratio > 0) {
                        const deltaW = Math.abs(nw - startW);
                        const deltaH = Math.abs(nh - startH);
                        if (deltaW >= deltaH) {
                            nh = Math.max(10, Math.round(nw / ratio));
                        } else {
                            nw = Math.max(10, Math.round(nh * ratio));
                        }
                    }
                }
                
                const scaleX = nw / startW;
                const scaleY = nh / startH;
                
                window.activeEl.style.width = nw + 'px';
                window.activeEl.style.height = nh + 'px';
                
                if (groupChildrenStart) {
                    groupChildrenStart.forEach(child => {
                        const newL = child.left * scaleX;
                        const newT = child.top * scaleY;
                        const newW = child.width * scaleX;
                        const newH = child.height * scaleY;
                        
                        child.el.style.left = newL + 'px';
                        child.el.style.top = newT + 'px';
                        child.el.style.width = newW + 'px';
                        child.el.style.height = newH + 'px';
                        child.el.setAttribute('data-resized', 'true');
                        
                        // Rescale inner elements inside grouped atoms
                        const innerBox = child.el.querySelector('.v4-checkbox, .v4-radio');
                        if (innerBox) {
                            const isTextEnabled = child.el.querySelector('.v4-checkbox-container, .v4-radio-container')?.getAttribute('data-text-enabled') !== 'false';
                            if (!isTextEnabled) {
                                innerBox.style.width = newW + 'px';
                                innerBox.style.height = newH + 'px';
                            }
                        }
                        const selectbox = child.el.querySelector('.v4-selectbox-container');
                        if (selectbox) {
                            selectbox.style.width = '100%';
                            selectbox.style.height = '100%';
                            const sbHeader = selectbox.querySelector('.v4-selectbox-header');
                            const sbOptions = selectbox.querySelector('.v4-selectbox-options');
                            const isDropActive = selectbox.getAttribute('data-dropdown-active') === 'true';
                            if (sbHeader) {
                                sbHeader.style.width = '100%';
                                sbHeader.style.height = isDropActive ? '30px' : '100%';
                            }
                            if (sbOptions) sbOptions.style.width = '100%';
                        }
                        const inputWrap = child.el.querySelector('.v4-textbox-container, .v4-textarea-container');
                        if (inputWrap) {
                            inputWrap.style.width = '100%';
                            inputWrap.style.height = '100%';
                        }
                        const btn = child.el.querySelector('.v4-custom-btn, .v4-btn-container');
                        if (btn) {
                            btn.style.width = '100%';
                            btn.style.height = '100%';
                        }
                        const webeditor = child.el.querySelector('.v4-webeditor-container');
                        if (webeditor) {
                            webeditor.style.width = '100%';
                            webeditor.style.height = '100%';
                        }
                        
                        window.updateHandles(child.el);
                    });
                }
                
                window.updateHandles(window.activeEl);
                markDirty();
                notifyParent({ type: 'LF_COMP_RESIZED', w: nw, h: nh });
            }
        },
        
        handleMouseUp: function() {
            if (isDragging && window.activeEl) {
                var isResp = window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive();
                if (isResp) {
                    window.ResponsiveSmartGuide.onSelect(window.activeEl, 7000);
                } else {
                    var compW = window.activeEl.offsetWidth || 100;
                    var compH = window.activeEl.offsetHeight || 40;
                    var compL = parseFloat(window.activeEl.style.left) || 0;
                    var compT = parseFloat(window.activeEl.style.top) || 0;
                    notifyParent({
                        type: 'LF_SNAP_END',
                        id: window.activeEl.id,
                        x: compL,
                        y: compT,
                        w: compW,
                        h: compH
                    });
                }

                _handleResponsiveCrossFrameDrop(window.activeEl, isResp);
                _handlePinMarkerDropAnchoring(window.activeEl);
                _dispatchPinPositionUpdates(window.activeEl);
            }
            if (isResizing && window.activeEl) {
                window.activeEl.setAttribute('data-resized', 'true');
                if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
            }
            document.querySelectorAll('.lf-component').forEach(function(s) { s.classList.remove('dragging-now'); });
            isPendingDrag = false;
            isDragging = false;
            isResizing = false;
            if (window.ScrollPinEngine && typeof window.ScrollPinEngine.scheduleUpdate === 'function') {
                window.ScrollPinEngine.scheduleUpdate();
            }
            if (!document.querySelector('.lf-component.selected')) {
                window.activeEl = null;
            }
            groupChildrenStart = null;
        },
        
        startResize: function(e, r) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            isResizing = true;
            window.activeEl = r.parentElement;
            startX = e.clientX;
            startY = e.clientY;
            startW = window.activeEl.offsetWidth;
            startH = window.activeEl.offsetHeight;
            
            if (window.activeEl.classList.contains('lf-group')) {
                groupChildrenStart = Array.from(window.activeEl.querySelectorAll('.lf-component'))
                    .map(child => ({
                        el: child,
                        left: parseFloat(child.style.left) || 0,
                        top: parseFloat(child.style.top) || 0,
                        width: parseFloat(child.style.width) || child.offsetWidth || 0,
                        height: parseFloat(child.style.height) || child.offsetHeight || 0
                    }));
            } else {
                groupChildrenStart = null;
            }
            e.preventDefault();
        }
    };
})();
`;
