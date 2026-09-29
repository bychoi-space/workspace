// --- Iframe Component Inserter Module ---
if (!window.v4IframeInserterScript) {
    window.v4IframeInserterScript = `
(function() {
    function handleInsertComponent(d) {
        const pcScrollArea = document.querySelector('.pc-content-area');
        const pcInner = document.querySelector('.pc-content-inner');
        const mobileScrollArea = document.querySelector('.mobile-content-area, .mobile-content');
        const mobileInner = document.querySelector('.mobile-content-inner');
        const isResponsiveTemplate = !!(pcInner || mobileInner);

        const isPinMarker = d.className && d.className.includes('pin-marker');
        const compW = isPinMarker ? 28 : ((d.style && d.style.width) ? parseInt(d.style.width) || 200 : 200);
        const compH = isPinMarker ? 28 : ((d.style && d.style.height) ? parseInt(d.style.height) || 100 : 100);

        let host = document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body;
        let centerTop = Math.round((window.innerHeight - compH) / 2);
        let centerLeft = Math.round((window.innerWidth - compW) / 2);

        if (isResponsiveTemplate) {
            const currentlySelected = document.querySelector('.lf-component.selected');
            const isCanvasTarget = (window.lastActiveFrame === 'canvas') || 
                                   (currentlySelected && !currentlySelected.closest('.frame-column, .pc-browser-frame, .mobile-browser-frame, .pc-content-inner, .mobile-content-inner'));

            if (isCanvasTarget) {
                host = document.querySelector('.page, .canvas, #canvas-page, #canvas') || document.body;
                centerLeft = Math.max(15, Math.round((1600 - compW) / 2));
                centerTop = Math.max(15, Math.round((900 - compH) / 2));
                if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('canvas');
            } else {
                // Multi-column responsive targeting: prioritize currently active column
                const targetCol = (currentlySelected ? currentlySelected.closest('.frame-column') : null) ||
                                  document.querySelector('.frame-column.active-column') ||
                                  document.querySelector('.mobile-column.active-column') ||
                                  document.querySelector('.pc-column.active-column');

                if (targetCol) {
                    const inner = targetCol.querySelector('.mobile-content-inner, .pc-content-inner');
                    const scrollContainer = targetCol.querySelector('.mobile-content-area, .mobile-content, .pc-content-area');
                    if (inner && scrollContainer) {
                        host = inner;
                        const sTop = scrollContainer.scrollTop || 0;
                        const vHeight = scrollContainer.clientHeight || 810;
                        const hostW = host.offsetWidth || (targetCol.classList.contains('mobile-column') ? 360 : 1160);
                        centerLeft = Math.max(15, Math.round((hostW - compW) / 2));
                        centerTop = Math.max(15, Math.round(sTop + (vHeight / 2) - (compH / 2)));
                        if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI(targetCol);
                    }
                } else {
                    let activeFrame = window.lastActiveFrame;
                    if (!mobileScrollArea && pcScrollArea) activeFrame = 'pc';
                    if (!pcScrollArea && mobileScrollArea) activeFrame = 'mobile';
                    if (!activeFrame) {
                        if (currentlySelected) {
                            if (currentlySelected.closest('.mobile-content-inner, .mobile-content-area, .mobile-content, .mobile-frame, .mobile-browser-frame')) {
                                activeFrame = 'mobile';
                            } else if (currentlySelected.closest('.pc-content-inner, .pc-content-area, .pc-frame, .pc-browser-frame')) {
                                activeFrame = 'pc';
                            }
                        }
                    }
                    if (!activeFrame) {
                        if (document.querySelector('.mobile-column.active-column')) activeFrame = 'mobile';
                        else if (document.querySelector('.pc-column.active-column')) activeFrame = 'pc';
                    }
                    if (!activeFrame) {
                        activeFrame = (pcScrollArea || pcInner) ? 'pc' : 'mobile';
                    }

                    if (activeFrame === 'mobile' && (mobileScrollArea || mobileInner)) {
                        host = mobileInner || mobileScrollArea;
                        const scrollContainer = mobileScrollArea || mobileInner;
                        const sTop = scrollContainer ? scrollContainer.scrollTop : 0;
                        const vHeight = scrollContainer ? (scrollContainer.clientHeight || 810) : 810;
                        const hostW = host ? (host.offsetWidth || 360) : 360;
                        centerLeft = Math.max(15, Math.round((hostW - compW) / 2));
                        centerTop = Math.max(15, Math.round(sTop + (vHeight / 2) - (compH / 2)));
                        if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('mobile');
                    } else if (pcScrollArea || pcInner) {
                        host = pcInner || pcScrollArea;
                        const scrollContainer = pcScrollArea || pcInner;
                        const sTop = scrollContainer ? scrollContainer.scrollTop : 0;
                        const vHeight = scrollContainer ? (scrollContainer.clientHeight || 810) : 810;
                        const hostW = host ? (host.offsetWidth || 1160) : 1160;
                        centerLeft = Math.max(15, Math.round((hostW - compW) / 2));
                        centerTop = Math.max(15, Math.round(sTop + (vHeight / 2) - (compH / 2)));
                        if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('pc');
                    }
                }
            }
        } else {
            try {
                const parentState = window.parent && window.parent.state;
                const parentDOM = window.parent && window.parent.DOM;
                if (parentState && parentState.transform && parentDOM && parentDOM.canvas) {
                    const t = parentState.transform;
                    const cw = parentDOM.canvas.clientWidth || 1600;
                    const ch = parentDOM.canvas.clientHeight || 900;
                    const s = t.scale || 1;
                    const viewCenterX = Math.round(((cw / 2) - t.x) / s);
                    const viewCenterY = Math.round(((ch / 2) - t.y) / s);
                    centerLeft = Math.round(viewCenterX - (compW / 2));
                    centerTop = Math.round(viewCenterY - (compH / 2));
                    const maxW = Math.max(1600, document.body.scrollWidth, document.documentElement.scrollWidth);
                    const maxH = Math.max(900, document.body.scrollHeight, document.documentElement.scrollHeight);
                    centerLeft = Math.max(15, Math.min(centerLeft, maxW - compW - 15));
                    centerTop = Math.max(15, Math.min(centerTop, maxH - compH - 15));
                }
            } catch(e) {}
        }
        
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        const v = document.createElement('div'); 
        v.id = d.id || ('v4-comp-' + Date.now()); 
        v.style.position = 'absolute'; 
        v.style.top = centerTop + 'px'; 
        v.style.left = centerLeft + 'px'; 
        const nextZ = (typeof window.getNextTopZIndex === 'function') ? window.getNextTopZIndex(host) : 1010;
        v.style.zIndex = String(nextZ);

        if (isPinMarker) {
            const idx = parseInt(d.id.replace('v4-pin-', '')) || 0;
            v.className = 'lf-component pin-marker';
            v.setAttribute('data-index', String(idx));
            v.setAttribute('data-pin-num', String(idx + 1));
            v.style.width = '20px';
            v.style.height = '20px';
            v.style.zIndex = '200000';
            v.innerHTML = '<div class="pin-number-badge" style="pointer-events:none; font-weight:500; font-size:12px; font-family:inherit; line-height:1; color:#ffffff;">' + (idx + 1) + '</div>' +
                          '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';
            if (typeof window.updateHandles === 'function') window.updateHandles(v);
        } else {
            v.className = 'lf-component' + (d.isGroup ? ' lf-group' : '') + (d.className ? ' ' + d.className : ''); 
            v.style.transform = 'none';
            if (d.style) {
                Object.assign(v.style, d.style);
                if (!d.style.zIndex || parseInt(d.style.zIndex, 10) <= 1000) {
                    v.style.zIndex = String(nextZ);
                }
            }
            v.innerHTML = d.html + '<div class="lf-delete-trigger">&times;</div>';
            if (d.dataset) {
                for (let k in d.dataset) {
                    v.setAttribute('data-' + k.replace(/([A-Z])/g, '-$1').toLowerCase(), d.dataset[k]);
                }
            }
        }
        
        if (window.parent.state && window.parent.state.transform) {
            const s = window.parent.state.transform.scale || 1;
            if (s < 1) {
                const bw = parseInt(v.style.width) || 200;
                const bh = parseInt(v.style.height) || 100;
                if (s < 0.8 && !d.isGroup) {
                    const isImg = v.querySelector('.v4-shape-image') || v.getAttribute('data-aspect-ratio');
                    if (isImg) {
                        const natRatio = parseFloat(v.getAttribute('data-aspect-ratio')) || (bw / bh);
                        const newW = Math.round(bw / s);
                        v.style.width = newW + 'px';
                        v.style.height = Math.round(newW / natRatio) + 'px';
                    } else {
                        v.style.width = Math.round(bw / s) + 'px';
                        v.style.height = Math.round(bh / s) + 'px';
                    }
                }
            }
        }
        
        const children = Array.from(v.children).filter(c => c.classList.contains('lf-component') || c.classList.contains('lf-group'));
        if (children.length === 1) {
            const inner = children[0];
            const l = parseInt(inner.style.left) || 0;
            const t = parseInt(inner.style.top) || 0;
            if (l !== 0 || t !== 0) {
                inner.style.left = '0px';
                inner.style.top = '0px';
                if (inner.style.width) v.style.width = inner.style.width;
                if (inner.style.height) v.style.height = inner.style.height;
            }
        }
        
        const trailingRef = Array.from(host.children).find(c => !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script'));
        if (trailingRef && trailingRef.parentNode === host) {
            host.insertBefore(v, trailingRef);
        } else {
            host.appendChild(v);
        }
        document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
        v.classList.add('selected');
        if (v.classList.contains('v4-text-shape') && typeof window.resizeToFitText === 'function') {
            window.resizeToFitText(v);
        }
        if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive()) {
            window.ResponsiveSmartGuide.onSelect(v, 2000);
        }
        const styles = window._getCompStyles(v);
        notifyParent({ 
            type: 'LF_COMP_SELECTED', 
            ...styles
        });
        markDirty();
    }


    window.handleInsertComponent = handleInsertComponent;
})();
`;
}