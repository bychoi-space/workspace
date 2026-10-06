/**
 * assets/inspector/inspector_scroll_pin.js
 * Domain Inspector Module: Responsive Scroll Pinning & Smart HUD Interface Controller
 * Responsibility: Parent-side scroll fixed modes (Top, Bottom, Custom/Floating, Sticky, None),
 *                direction reactions, viewport offsets, and description pin anchoring.
 */
(function() {
    console.log("[Inspector Scroll Pin] Domain module loaded.");

    function setScrollPin(mode, extraOptions) {
        const selIds = (window.state && window.state.selectedIds) ? window.state.selectedIds : [];
        if (!selIds || selIds.length === 0) return;

        const iframe = document.getElementById('main-iframe');
        const iframeDoc = iframe?.contentDocument;
        const el = iframeDoc?.getElementById(selIds[0]);
        const isPin = el?.classList.contains('pin-marker') || el?.classList.contains('text-marker');

        const payload = {
            ids: selIds,
            id: selIds[0],
            mode: mode
        };

        if (!isPin && el) {
            if (mode === 'custom' || mode === 'floating') {
                const domTop = parseFloat(el.style.top) || el.offsetTop || 0;
                const targetY = (extraOptions && extraOptions.targetY !== undefined) ? extraOptions.targetY : domTop;
                payload.targetY = targetY;
            } else if (mode === 'sticky') {
                const stickyTop = (extraOptions && extraOptions.stickyTop !== undefined) ? extraOptions.stickyTop : 0;
                payload.stickyTop = stickyTop;
            }

            if (extraOptions && extraOptions.effect !== undefined) {
                payload.effect = extraOptions.effect;
            } else if (mode === 'none') {
                payload.effect = 'always';
            } else {
                const curEffect = el.getAttribute('data-scroll-effect') || 'always';
                payload.effect = curEffect;
            }
        }

        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_SET_SCROLL_FIXED', payload);
        }
        if (window.EditorBus && typeof window.EditorBus.sendToIframe === 'function') {
            window.EditorBus.sendToIframe('LF_SET_SCROLL_FIXED', payload);
        }

        if (window.state && window.state.selectedComponent) {
            window.state.selectedComponent.scrollFixed = mode;
            if (payload.effect) window.state.selectedComponent.scrollEffect = payload.effect;
        }
        if (window.state && window.state.selectedComponentStyles) {
            window.state.selectedComponentStyles.scrollFixed = mode;
            if (payload.effect) window.state.selectedComponentStyles.scrollEffect = payload.effect;
        }

        if (isPin && el) {
            let pIdx = parseInt(el.getAttribute('data-index'), 10);
            if (isNaN(pIdx)) {
                pIdx = parseInt((el.id || '').replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''), 10);
            }
            if (!isNaN(pIdx) && window.state && window.state.activeFile && window.state.activeFile.meta && window.state.activeFile.meta.description) {
                const descItem = window.state.activeFile.meta.description[pIdx];
                if (descItem) {
                    descItem.scrollFixed = mode;
                    if (typeof window.markAsDirty === 'function') window.markAsDirty();
                }
                const descRow = document.querySelector('.desc-row[data-index="' + pIdx + '"]');
                if (descRow) {
                    const existingBadge = descRow.querySelector('.desc-pin-fixed-badge');
                    const isFixedPin = (mode === 'viewport' || mode === 'fixed' || mode === 'top');
                    if (isFixedPin) {
                        if (!existingBadge) {
                            const labelEl = descRow.querySelector('.desc-header-label');
                            if (labelEl) {
                                const bSpan = document.createElement('span');
                                bSpan.className = 'desc-pin-fixed-badge';
                                bSpan.innerText = '📌 고정';
                                labelEl.parentNode.insertBefore(bSpan, labelEl.nextSibling);
                            }
                        }
                    } else {
                        if (existingBadge) existingBadge.remove();
                    }
                    const anchorBtn = descRow.querySelector('.desc-pin-anchor-btn');
                    if (anchorBtn) {
                        anchorBtn.classList.toggle('is-fixed', isFixedPin);
                        anchorBtn.title = isFixedPin ? '화면 고정 해제 (본문 스크롤 모드로 전환)' : '화면 고정 (스크롤 시 화면에 항상 고정)';
                        const anchorTxt = anchorBtn.querySelector('.anchor-txt');
                        if (anchorTxt) anchorTxt.innerText = isFixedPin ? '화면 고정' : '본문 배치';
                    }
                }
            }
        }

        updateButtonsUI(mode, isPin, payload);
    }

    function updateButtonsUI(mode, isPin, payload) {
        const btnNone = document.getElementById('btn-scroll-pin-none');
        const btnTop = document.getElementById('btn-scroll-pin-top');
        const btnBottom = document.getElementById('btn-scroll-pin-bottom');
        const btnCustom = document.getElementById('btn-scroll-pin-custom');
        const btnSticky = document.getElementById('btn-scroll-pin-sticky');

        const btnPinContent = document.getElementById('btn-pin-pos-content');
        const btnPinFixed = document.getElementById('btn-pin-pos-fixed');

        const badge = document.getElementById('scroll-pin-status-badge');
        const titleText = document.getElementById('scroll-pin-title-text');
        const objGroup = document.getElementById('scroll-pin-object-group');
        const markerGroup = document.getElementById('scroll-pin-marker-group');
        const offsetBar = document.getElementById('scroll-pin-offset-bar');
        const offsetLabel = document.getElementById('scroll-pin-offset-label');
        const offsetInput = document.getElementById('scroll-pin-offset-input');
        const effectBar = document.getElementById('scroll-pin-effect-bar');
        const effectSelect = document.getElementById('scroll-pin-effect-select');

        if (isPin) {
            if (titleText) titleText.innerText = 'PIN ANCHOR';
            if (objGroup) objGroup.style.display = 'none';
            if (markerGroup) markerGroup.style.display = 'flex';
            if (offsetBar) offsetBar.style.display = 'none';
            if (effectBar) effectBar.style.display = 'none';

            const isFixedPin = (mode === 'viewport' || mode === 'fixed' || mode === 'top');
            if (btnPinContent) btnPinContent.classList.toggle('active', !isFixedPin);
            if (btnPinFixed) btnPinFixed.classList.toggle('active', isFixedPin);

            if (badge) {
                badge.className = 'scroll-pin-badge';
                if (isFixedPin) {
                    badge.innerText = 'FIXED PIN 📌';
                    badge.classList.add('badge-viewport');
                } else {
                    badge.innerText = 'CONTENT PIN';
                }
            }
        } else {
            if (titleText) titleText.innerText = 'SCROLL PIN';
            if (objGroup) objGroup.style.display = 'flex';
            if (markerGroup) markerGroup.style.display = 'none';

            const pinMode = (mode === 'top' || mode === 'bottom' || mode === 'custom' || mode === 'floating' || mode === 'sticky') ? mode : 'none';

            if (btnNone) btnNone.classList.toggle('active', pinMode === 'none');
            if (btnTop) btnTop.classList.toggle('active', pinMode === 'top');
            if (btnBottom) btnBottom.classList.toggle('active', pinMode === 'bottom');
            if (btnCustom) btnCustom.classList.toggle('active', pinMode === 'custom' || pinMode === 'floating');
            if (btnSticky) btnSticky.classList.toggle('active', pinMode === 'sticky');

            if (effectBar) {
                if (pinMode === 'top' || pinMode === 'bottom' || pinMode === 'custom') {
                    effectBar.style.display = 'flex';
                    if (effectSelect) {
                        const currentEffect = (payload && payload.effect) ? payload.effect : 'always';
                        effectSelect.value = currentEffect;
                    }
                } else {
                    effectBar.style.display = 'none';
                }
            }

            if (offsetBar && offsetLabel && offsetInput) {
                if (pinMode === 'custom' || pinMode === 'floating') {
                    offsetBar.style.display = 'flex';
                    offsetLabel.innerText = 'VIEWPORT Y';
                    if (payload && payload.targetY !== undefined) {
                        offsetInput.value = Math.round(payload.targetY);
                    }
                } else if (pinMode === 'sticky') {
                    offsetBar.style.display = 'flex';
                    offsetLabel.innerText = 'STICKY TOP';
                    if (payload && payload.stickyTop !== undefined) {
                        offsetInput.value = Math.round(payload.stickyTop);
                    }
                } else {
                    offsetBar.style.display = 'none';
                }
            }

            if (badge) {
                badge.className = 'scroll-pin-badge';
                const eff = (payload && payload.effect) ? payload.effect : 'always';
                const effSuffix = (eff === 'hide-down') ? ' (↓숨김)' : (eff === 'hide-up') ? ' (↑숨김)' : '';

                if (pinMode === 'top') {
                    badge.innerText = 'PIN TOP' + effSuffix;
                    badge.classList.add('badge-top');
                } else if (pinMode === 'bottom') {
                    badge.innerText = 'PIN BOTTOM' + effSuffix;
                    badge.classList.add('badge-bottom');
                } else if (pinMode === 'custom' || pinMode === 'floating') {
                    badge.innerText = 'FLOATING' + effSuffix;
                    badge.classList.add('badge-custom');
                } else if (pinMode === 'sticky') {
                    badge.innerText = 'STICKY';
                    badge.classList.add('badge-sticky');
                } else {
                    badge.innerText = 'SCROLL';
                }
            }
        }
    }

    function syncUI(compStyles) {
        const scrollPinBar = document.getElementById('selection-scroll-pin-bar');
        if (!scrollPinBar) return;

        const selIds = (window.state && window.state.selectedIds) ? window.state.selectedIds : [];
        if (selIds.length === 0) {
            scrollPinBar.style.setProperty('display', 'none', 'important');
            return;
        }

        let isResponsiveScreen = false;
        let isPin = false;
        let currentFixed = (compStyles && compStyles.scrollFixed) || 'none';
        let currentEffect = (compStyles && compStyles.scrollEffect) || 'always';
        let targetY = undefined;
        let stickyTop = undefined;

        try {
            const iframeDoc = document.getElementById('main-iframe')?.contentDocument;
            if (iframeDoc) {
                if (typeof window.isResponsiveDocument === 'function') {
                    isResponsiveScreen = window.isResponsiveDocument(iframeDoc);
                }
                if (!isResponsiveScreen) {
                    isResponsiveScreen = !!iframeDoc.querySelector('.pc-content-inner, .mobile-content-inner, .pc-content-area, .mobile-content, .pc-browser-frame, .mobile-frame, .responsive-compare-container, .dual-mobile-container');
                }

                const el = iframeDoc.getElementById(selIds[0]);
                if (el) {
                    isPin = el.classList.contains('pin-marker') || el.classList.contains('text-marker');
                    currentFixed = el.getAttribute('data-scroll-fixed') || currentFixed || 'none';
                    if (el.hasAttribute('data-scroll-effect')) {
                        currentEffect = el.getAttribute('data-scroll-effect');
                    }
                    if (el.hasAttribute('data-scroll-target-y')) {
                        targetY = parseFloat(el.getAttribute('data-scroll-target-y'));
                    } else {
                        targetY = parseFloat(el.style.top) || el.offsetTop || 0;
                    }
                    if (el.hasAttribute('data-scroll-sticky-top')) {
                        stickyTop = parseFloat(el.getAttribute('data-scroll-sticky-top'));
                    } else {
                        stickyTop = 0;
                    }
                }
            }
        } catch(e) {}

        const shouldShow = isResponsiveScreen || (currentFixed !== 'none') || (compStyles && compStyles.isScrollPinnable);

        if (shouldShow) {
            scrollPinBar.style.setProperty('display', 'flex', 'important');
            updateButtonsUI(currentFixed, isPin, { targetY: targetY, stickyTop: stickyTop, effect: currentEffect });
        } else {
            scrollPinBar.style.setProperty('display', 'none', 'important');
        }
    }

    function bindEvents() {
        const btnNone = document.getElementById('btn-scroll-pin-none');
        const btnTop = document.getElementById('btn-scroll-pin-top');
        const btnBottom = document.getElementById('btn-scroll-pin-bottom');
        const btnCustom = document.getElementById('btn-scroll-pin-custom');
        const btnSticky = document.getElementById('btn-scroll-pin-sticky');

        const btnPinContent = document.getElementById('btn-pin-pos-content');
        const btnPinFixed = document.getElementById('btn-pin-pos-fixed');
        const offsetInput = document.getElementById('scroll-pin-offset-input');
        const effectSelect = document.getElementById('scroll-pin-effect-select');

        if (btnNone) {
            btnNone.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('none');
            };
        }
        if (btnTop) {
            btnTop.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('top');
            };
        }
        if (btnBottom) {
            btnBottom.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('bottom');
            };
        }
        if (btnCustom) {
            btnCustom.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('custom');
            };
        }
        if (btnSticky) {
            btnSticky.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('sticky');
            };
        }

        if (effectSelect) {
            effectSelect.onchange = (e) => {
                e.stopPropagation();
                const selIds = (window.state && window.state.selectedIds) ? window.state.selectedIds : [];
                if (!selIds || selIds.length === 0) return;
                const iframeDoc = document.getElementById('main-iframe')?.contentDocument;
                const el = iframeDoc?.getElementById(selIds[0]);
                if (!el) return;
                const curMode = el.getAttribute('data-scroll-fixed') || 'none';
                if (curMode !== 'none') {
                    setScrollPin(curMode, { effect: effectSelect.value });
                }
            };
        }

        if (btnPinContent) {
            btnPinContent.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('none');
            };
        }
        if (btnPinFixed) {
            btnPinFixed.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('viewport');
            };
        }

        if (offsetInput) {
            const handleOffsetChange = () => {
                const val = parseFloat(offsetInput.value);
                if (isNaN(val)) return;
                const selIds = (window.state && window.state.selectedIds) ? window.state.selectedIds : [];
                if (!selIds || selIds.length === 0) return;
                const iframeDoc = document.getElementById('main-iframe')?.contentDocument;
                const el = iframeDoc?.getElementById(selIds[0]);
                if (!el) return;
                const curMode = el.getAttribute('data-scroll-fixed');
                if (curMode === 'custom' || curMode === 'floating') {
                    setScrollPin('custom', { targetY: val });
                } else if (curMode === 'sticky') {
                    setScrollPin('sticky', { stickyTop: val });
                }
            };
            offsetInput.onchange = handleOffsetChange;
            offsetInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleOffsetChange();
                }
            };
        }
    }

    // Public API SSOT
    window.InspectorScrollPin = {
        setScrollPin: setScrollPin,
        updateButtonsUI: updateButtonsUI,
        syncUI: syncUI,
        bindEvents: bindEvents
    };

    // Backward-compatible global exports
    window._setScrollPin = setScrollPin;
    window._updateScrollPinButtonsUI = updateButtonsUI;
    window._syncScrollPinUI = syncUI;
    window._bindScrollPinEvents = bindEvents;
})();
