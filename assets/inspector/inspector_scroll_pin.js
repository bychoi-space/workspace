/**
 * assets/inspector/inspector_scroll_pin.js
 * Domain Inspector Module: Responsive Scroll Pinning & Smart HUD Interface Controller
 * Responsibility: Parent-side scroll fixed modes (Top, Bottom, Custom/Floating, Sticky, Sticky-Bottom, None),
 *                bounded sticky stop limit (STOP Y / data-scroll-sticky-max-y), direction reactions,
 *                viewport offsets, and description pin anchoring.
 * Gateway 7 Compliant: 100% MessageHub / EditorBus state-driven (zero direct iframe.contentDocument access).
 */
(function () {
    console.log("[Inspector Scroll Pin] Domain module loaded.");

    function _getActivePinSnapshot(explicitStyles) {
        const st = window.state || {};
        const compStyles = explicitStyles || st.selectedComponentStyles || st.selectedComponent || null;
        let selIds = (Array.isArray(st.selectedIds) && st.selectedIds.length > 0) ? st.selectedIds : [];
        if (selIds.length === 0 && compStyles && compStyles.id) {
            selIds = [compStyles.id];
        }
        const primaryId = selIds[0] || (compStyles && compStyles.id) || '';
        const isConnectorOnly = !!(
            (compStyles && (compStyles.isConnector || (compStyles.id && String(compStyles.id).indexOf('conn_') === 0))) ||
            (selIds.length > 0 && selIds.every(function (id) { return typeof id === 'string' && id.indexOf('conn_') === 0; }))
        );
        const isPin = !!(
            (compStyles && (compStyles.isPinMarker || compStyles.isPin)) ||
            (typeof primaryId === 'string' && primaryId.indexOf('v4-pin-') === 0)
        );
        return {
            selIds: selIds,
            primaryId: primaryId,
            compStyles: compStyles,
            isPin: isPin,
            isConnectorOnly: isConnectorOnly
        };
    }

    function _isActiveScreenResponsive(compStyles) {
        if (compStyles && compStyles.isScrollPinnable) return true;
        const st = window.state || {};
        const af = st.activeFile;
        if (af) {
            const tpl = (af.meta && af.meta.template) ? String(af.meta.template) : '';
            if (tpl.indexOf('responsive') !== -1 || tpl.indexOf('mobile') !== -1 || tpl.indexOf('pc_web') !== -1 || tpl.indexOf('dual') !== -1) {
                return true;
            }
            const html = typeof af.html === 'string' ? af.html : '';
            if (html && (
                html.indexOf('pc-content-inner') !== -1 ||
                html.indexOf('mobile-content-inner') !== -1 ||
                html.indexOf('pc-content-area') !== -1 ||
                html.indexOf('mobile-content') !== -1 ||
                html.indexOf('pc-browser-frame') !== -1 ||
                html.indexOf('mobile-frame') !== -1 ||
                html.indexOf('responsive-compare-container') !== -1 ||
                html.indexOf('dual-mobile-container') !== -1
            )) {
                return true;
            }
        }
        return false;
    }

    function _applySnapshotMutation(mode, payload) {
        const targets = [
            window.state && window.state.selectedComponent,
            window.state && window.state.selectedComponentStyles
        ];
        targets.forEach(function (obj) {
            if (!obj) return;
            obj.scrollFixed = mode;
            if (payload.effect !== undefined) obj.scrollEffect = payload.effect;
            if (payload.divider !== undefined) obj.scrollDivider = payload.divider;
            if (payload.targetY !== undefined) obj.scrollTargetY = payload.targetY;
            if (payload.stickyTop !== undefined) obj.scrollStickyTop = payload.stickyTop;
            if (payload.stickyBottom !== undefined) obj.scrollStickyBottom = payload.stickyBottom;
            if (mode !== 'sticky') {
                obj.scrollStickyMaxY = null;
            } else if (payload.stickyMaxY !== undefined) {
                obj.scrollStickyMaxY = (payload.stickyMaxY !== null && payload.stickyMaxY > 0) ? payload.stickyMaxY : null;
            }
        });
    }

    function setScrollPin(mode, extraOptions) {
        const snap = _getActivePinSnapshot();
        const selIds = snap.selIds;
        if (!selIds || selIds.length === 0) return;

        const isPin = snap.isPin;
        const cs = snap.compStyles || {};
        const opts = extraOptions || {};

        const payload = {
            ids: selIds,
            id: selIds[0],
            mode: mode
        };

        if (!isPin) {
            const fallbackTop = (cs.y !== undefined && !isNaN(parseFloat(cs.y))) ? parseFloat(cs.y) : 0;
            if (mode === 'custom' || mode === 'floating') {
                const prevTargetY = (cs.scrollTargetY !== undefined && !isNaN(parseFloat(cs.scrollTargetY))) ? parseFloat(cs.scrollTargetY) : fallbackTop;
                payload.targetY = (opts.targetY !== undefined) ? opts.targetY : prevTargetY;
            } else if (mode === 'sticky') {
                const prevStickyTop = (cs.scrollStickyTop !== undefined && !isNaN(parseFloat(cs.scrollStickyTop))) ? parseFloat(cs.scrollStickyTop) : 0;
                payload.stickyTop = (opts.stickyTop !== undefined) ? opts.stickyTop : prevStickyTop;

                if (opts.stickyMaxY !== undefined) {
                    const parsedMax = (opts.stickyMaxY === null || opts.stickyMaxY === '') ? null : parseFloat(opts.stickyMaxY);
                    payload.stickyMaxY = (parsedMax !== null && !isNaN(parsedMax) && parsedMax > 0) ? Math.round(parsedMax) : null;
                } else if (cs.scrollStickyMaxY !== undefined && cs.scrollStickyMaxY !== null && !isNaN(parseFloat(cs.scrollStickyMaxY)) && parseFloat(cs.scrollStickyMaxY) > 0) {
                    payload.stickyMaxY = Math.round(parseFloat(cs.scrollStickyMaxY));
                }
            } else if (mode === 'sticky-bottom') {
                const prevStickyBottom = (cs.scrollStickyBottom !== undefined && !isNaN(parseFloat(cs.scrollStickyBottom))) ? parseFloat(cs.scrollStickyBottom) : 0;
                payload.stickyBottom = (opts.stickyBottom !== undefined) ? opts.stickyBottom : prevStickyBottom;
            }

            if (opts.effect !== undefined) {
                payload.effect = opts.effect;
            } else if (mode === 'none') {
                payload.effect = 'always';
            } else {
                payload.effect = cs.scrollEffect || 'always';
            }

            if (opts.divider !== undefined) {
                payload.divider = !!opts.divider;
            } else if (mode === 'none') {
                payload.divider = false;
            } else {
                payload.divider = !!cs.scrollDivider;
            }
        }

        const messagePayload = Object.assign({ type: 'BYCHOI_SET_SCROLL_FIXED' }, payload);
        const iframe = document.getElementById('main-iframe');
        if (window.EditorBus && typeof window.EditorBus.sendToIframe === 'function') {
            window.EditorBus.sendToIframe(messagePayload);
        } else if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'BYCHOI_SET_SCROLL_FIXED', payload);
        }

        _applySnapshotMutation(mode, payload);

        if (isPin) {
            let pIdx = (cs.index !== undefined && !isNaN(parseInt(cs.index, 10))) ? parseInt(cs.index, 10) : NaN;
            if (isNaN(pIdx)) {
                pIdx = parseInt(String(snap.primaryId || '').replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''), 10);
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
                                bSpan.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px;flex-shrink:0;"><path d="M12 17v5M9 2h6l-1 7h3l-5 8-5-8h3L9 2z"/></svg>고정';
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
        const btnStickyBottom = document.getElementById('btn-scroll-pin-sticky-bottom');

        const btnPinContent = document.getElementById('btn-pin-pos-content');
        const btnPinFixed = document.getElementById('btn-pin-pos-fixed');

        const badge = document.getElementById('scroll-pin-status-badge');
        const titleText = document.getElementById('scroll-pin-title-text');
        const objGroup = document.getElementById('scroll-pin-object-group');
        const markerGroup = document.getElementById('scroll-pin-marker-group');
        const offsetBar = document.getElementById('scroll-pin-offset-bar');
        const offsetLabel = document.getElementById('scroll-pin-offset-label');
        const offsetInput = document.getElementById('scroll-pin-offset-input');
        const limitBar = document.getElementById('scroll-pin-limit-bar');
        const limitInput = document.getElementById('scroll-pin-limit-input');
        const effectBar = document.getElementById('scroll-pin-effect-bar');
        const effectSelect = document.getElementById('scroll-pin-effect-select');
        const dividerBar = document.getElementById('scroll-pin-divider-bar');
        const dividerLabel = document.getElementById('scroll-pin-divider-label');
        const dividerToggle = document.getElementById('scroll-pin-divider-toggle');

        if (isPin) {
            if (titleText) titleText.innerText = 'PIN ANCHOR';
            if (objGroup) objGroup.style.display = 'none';
            if (markerGroup) markerGroup.style.display = 'flex';
            if (offsetBar) offsetBar.style.display = 'none';
            if (limitBar) limitBar.style.display = 'none';
            if (effectBar) effectBar.style.display = 'none';
            if (dividerBar) dividerBar.style.display = 'none';

            const isFixedPin = (mode === 'viewport' || mode === 'fixed' || mode === 'top');
            if (btnPinContent) btnPinContent.classList.toggle('active', !isFixedPin);
            if (btnPinFixed) btnPinFixed.classList.toggle('active', isFixedPin);

            if (badge) {
                badge.className = 'scroll-pin-badge';
                if (isFixedPin) {
                    badge.innerText = 'FIXED PIN';
                    badge.classList.add('badge-viewport');
                } else {
                    badge.innerText = 'CONTENT PIN';
                }
            }
        } else {
            if (titleText) titleText.innerText = 'SCROLL PIN';
            if (objGroup) objGroup.style.display = 'flex';
            if (markerGroup) markerGroup.style.display = 'none';

            const pinMode = (mode === 'top' || mode === 'bottom' || mode === 'custom' || mode === 'floating' || mode === 'sticky' || mode === 'sticky-bottom') ? mode : 'none';

            if (btnNone) btnNone.classList.toggle('active', pinMode === 'none');
            if (btnTop) btnTop.classList.toggle('active', pinMode === 'top');
            if (btnBottom) btnBottom.classList.toggle('active', pinMode === 'bottom');
            if (btnCustom) btnCustom.classList.toggle('active', pinMode === 'custom' || pinMode === 'floating');
            if (btnSticky) btnSticky.classList.toggle('active', pinMode === 'sticky');
            if (btnStickyBottom) btnStickyBottom.classList.toggle('active', pinMode === 'sticky-bottom');

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

            if (dividerBar) {
                if (pinMode !== 'none') {
                    dividerBar.style.display = 'flex';
                    if (dividerLabel) {
                        if (pinMode === 'top' || pinMode === 'sticky') {
                            dividerLabel.innerText = '하단 구분선 (Border Bottom)';
                        } else if (pinMode === 'bottom' || pinMode === 'sticky-bottom') {
                            dividerLabel.innerText = '상단 구분선 (Border Top)';
                        } else {
                            dividerLabel.innerText = '경계 구분선 (Divider Line)';
                        }
                    }
                    if (dividerToggle) {
                        dividerToggle.checked = !!(payload && payload.divider);
                    }
                } else {
                    dividerBar.style.display = 'none';
                    if (dividerToggle) {
                        dividerToggle.checked = false;
                    }
                }
            }

            if (offsetBar && offsetLabel && offsetInput) {
                if (pinMode === 'custom' || pinMode === 'floating') {
                    offsetBar.style.display = 'flex';
                    offsetLabel.innerText = 'VIEWPORT Y';
                    if (payload && payload.targetY !== undefined && document.activeElement !== offsetInput) {
                        offsetInput.value = Math.round(payload.targetY);
                    }
                } else if (pinMode === 'sticky') {
                    offsetBar.style.display = 'flex';
                    offsetLabel.innerText = 'STICKY TOP';
                    if (payload && payload.stickyTop !== undefined && document.activeElement !== offsetInput) {
                        offsetInput.value = Math.round(payload.stickyTop);
                    }
                } else if (pinMode === 'sticky-bottom') {
                    offsetBar.style.display = 'flex';
                    offsetLabel.innerText = 'STICKY BOTTOM';
                    if (payload && payload.stickyBottom !== undefined && document.activeElement !== offsetInput) {
                        offsetInput.value = Math.round(payload.stickyBottom);
                    }
                } else {
                    offsetBar.style.display = 'none';
                }
            }

            const hasValidStickyMax = !!(
                pinMode === 'sticky' &&
                payload &&
                payload.stickyMaxY !== undefined &&
                payload.stickyMaxY !== null &&
                !isNaN(parseFloat(payload.stickyMaxY)) &&
                parseFloat(payload.stickyMaxY) > 0
            );

            if (limitBar && limitInput) {
                if (pinMode === 'sticky') {
                    limitBar.style.display = 'flex';
                    if (document.activeElement !== limitInput) {
                        limitInput.value = hasValidStickyMax ? Math.round(parseFloat(payload.stickyMaxY)) : '';
                    }
                } else {
                    limitBar.style.display = 'none';
                    if (document.activeElement !== limitInput) {
                        limitInput.value = '';
                    }
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
                    badge.innerText = hasValidStickyMax
                        ? ('STICKY (\u2264' + Math.round(parseFloat(payload.stickyMaxY)) + ')')
                        : 'STICKY';
                    badge.classList.add('badge-sticky');
                } else if (pinMode === 'sticky-bottom') {
                    badge.innerText = 'STICKY (하단)';
                    badge.classList.add('badge-sticky-bottom');
                } else {
                    badge.innerText = 'SCROLL';
                }
            }
        }
    }

    function syncUI(compStyles) {
        const scrollPinBar = document.getElementById('selection-scroll-pin-bar');
        if (!scrollPinBar) return;

        const snap = _getActivePinSnapshot(compStyles);
        if (snap.selIds.length === 0 || snap.isConnectorOnly) {
            scrollPinBar.style.setProperty('display', 'none', 'important');
            return;
        }

        const src = compStyles || snap.compStyles || {};
        const isPin = !!(
            src.isPinMarker ||
            src.isPin ||
            snap.isPin
        );
        const currentFixed = src.scrollFixed || 'none';
        const currentEffect = src.scrollEffect || 'always';
        const fallbackTop = (src.y !== undefined && !isNaN(parseFloat(src.y))) ? parseFloat(src.y) : 0;
        const targetY = (src.scrollTargetY !== undefined && !isNaN(parseFloat(src.scrollTargetY))) ? parseFloat(src.scrollTargetY) : fallbackTop;
        const stickyTop = (src.scrollStickyTop !== undefined && !isNaN(parseFloat(src.scrollStickyTop))) ? parseFloat(src.scrollStickyTop) : 0;
        const stickyBottom = (src.scrollStickyBottom !== undefined && !isNaN(parseFloat(src.scrollStickyBottom))) ? parseFloat(src.scrollStickyBottom) : 0;
        const stickyMaxY = (src.scrollStickyMaxY !== undefined && src.scrollStickyMaxY !== null && !isNaN(parseFloat(src.scrollStickyMaxY)) && parseFloat(src.scrollStickyMaxY) > 0)
            ? parseFloat(src.scrollStickyMaxY)
            : null;
        const hasDivider = !!src.scrollDivider;

        const shouldShow = _isActiveScreenResponsive(src) || (currentFixed !== 'none') || !!src.isScrollPinnable;

        if (shouldShow) {
            scrollPinBar.style.setProperty('display', 'flex', 'important');
            updateButtonsUI(currentFixed, isPin, {
                targetY: targetY,
                stickyTop: stickyTop,
                stickyBottom: stickyBottom,
                stickyMaxY: stickyMaxY,
                effect: currentEffect,
                divider: hasDivider
            });
        } else {
            scrollPinBar.style.setProperty('display', 'none', 'important');
        }
    }

    function syncFromIframe(data) {
        if (!data) return;
        const capturedMaxY = (data.stickyMaxY !== undefined && data.stickyMaxY !== null && !isNaN(parseFloat(data.stickyMaxY)) && parseFloat(data.stickyMaxY) > 0)
            ? Math.round(parseFloat(data.stickyMaxY))
            : null;
        const stickyTop = (data.stickyTop !== undefined && !isNaN(parseFloat(data.stickyTop)))
            ? Math.round(parseFloat(data.stickyTop))
            : 0;

        _applySnapshotMutation('sticky', {
            stickyTop: stickyTop,
            stickyMaxY: capturedMaxY
        });

        const snap = _getActivePinSnapshot();
        const src = snap.compStyles || {};
        updateButtonsUI('sticky', false, {
            stickyTop: (src.scrollStickyTop !== undefined) ? src.scrollStickyTop : stickyTop,
            stickyMaxY: capturedMaxY,
            effect: src.scrollEffect || 'always',
            divider: !!src.scrollDivider
        });
    }

    function bindEvents() {
        const btnNone = document.getElementById('btn-scroll-pin-none');
        const btnTop = document.getElementById('btn-scroll-pin-top');
        const btnBottom = document.getElementById('btn-scroll-pin-bottom');
        const btnCustom = document.getElementById('btn-scroll-pin-custom');
        const btnSticky = document.getElementById('btn-scroll-pin-sticky');
        const btnStickyBottom = document.getElementById('btn-scroll-pin-sticky-bottom');

        const btnPinContent = document.getElementById('btn-pin-pos-content');
        const btnPinFixed = document.getElementById('btn-pin-pos-fixed');
        const offsetInput = document.getElementById('scroll-pin-offset-input');
        const limitInput = document.getElementById('scroll-pin-limit-input');
        const captureLimitBtn = document.getElementById('btn-scroll-pin-capture-limit');
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
        if (btnStickyBottom) {
            btnStickyBottom.onclick = (e) => {
                e.stopPropagation();
                setScrollPin('sticky-bottom');
            };
        }

        if (effectSelect) {
            effectSelect.onchange = (e) => {
                e.stopPropagation();
                const snap = _getActivePinSnapshot();
                if (!snap.selIds || snap.selIds.length === 0) return;
                const curMode = (snap.compStyles && snap.compStyles.scrollFixed) || 'none';
                if (curMode !== 'none') {
                    setScrollPin(curMode, { effect: effectSelect.value });
                }
            };
        }

        const dividerToggle = document.getElementById('scroll-pin-divider-toggle');
        if (dividerToggle) {
            dividerToggle.onchange = (e) => {
                e.stopPropagation();
                const snap = _getActivePinSnapshot();
                if (!snap.selIds || snap.selIds.length === 0) return;
                const curMode = (snap.compStyles && snap.compStyles.scrollFixed) || 'none';
                if (curMode !== 'none') {
                    setScrollPin(curMode, { divider: dividerToggle.checked });
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
                const snap = _getActivePinSnapshot();
                if (!snap.selIds || snap.selIds.length === 0) return;
                const curMode = (snap.compStyles && snap.compStyles.scrollFixed) || 'none';
                if (curMode === 'custom' || curMode === 'floating') {
                    setScrollPin('custom', { targetY: val });
                } else if (curMode === 'sticky') {
                    setScrollPin('sticky', { stickyTop: val });
                } else if (curMode === 'sticky-bottom') {
                    setScrollPin('sticky-bottom', { stickyBottom: val });
                }
            };
            offsetInput.onchange = handleOffsetChange;
            offsetInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleOffsetChange();
                    offsetInput.blur();
                }
            };
        }

        if (limitInput) {
            const handleLimitChange = () => {
                const snap = _getActivePinSnapshot();
                if (!snap.selIds || snap.selIds.length === 0) return;
                const curMode = (snap.compStyles && snap.compStyles.scrollFixed) || 'none';
                if (curMode !== 'sticky') return;

                const raw = (limitInput.value || '').trim();
                if (raw === '') {
                    setScrollPin('sticky', { stickyMaxY: null });
                    return;
                }
                const val = parseFloat(raw);
                if (isNaN(val) || val <= 0) {
                    limitInput.value = '';
                    setScrollPin('sticky', { stickyMaxY: null });
                    return;
                }
                setScrollPin('sticky', { stickyMaxY: Math.round(val) });
            };
            limitInput.onchange = handleLimitChange;
            limitInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLimitChange();
                    limitInput.blur();
                }
            };
        }

        if (captureLimitBtn) {
            captureLimitBtn.onclick = (e) => {
                e.stopPropagation();
                const snap = _getActivePinSnapshot();
                if (!snap.selIds || snap.selIds.length === 0) return;
                const msg = {
                    type: 'BYCHOI_CAPTURE_STICKY_LIMIT',
                    ids: snap.selIds,
                    id: snap.selIds[0]
                };
                const iframe = document.getElementById('main-iframe');
                if (window.EditorBus && typeof window.EditorBus.sendToIframe === 'function') {
                    window.EditorBus.sendToIframe(msg);
                } else if (iframe && iframe.contentWindow && window.MessageHub) {
                    window.MessageHub.send(iframe.contentWindow, 'BYCHOI_CAPTURE_STICKY_LIMIT', {
                        ids: snap.selIds,
                        id: snap.selIds[0]
                    });
                }
            };
        }
    }

    // Public API SSOT
    window.InspectorScrollPin = {
        setScrollPin: setScrollPin,
        updateButtonsUI: updateButtonsUI,
        syncUI: syncUI,
        syncFromIframe: syncFromIframe,
        bindEvents: bindEvents
    };

    // Backward-compatible global exports
    window._setScrollPin = setScrollPin;
    window._updateScrollPinButtonsUI = updateButtonsUI;
    window._syncScrollPinUI = syncUI;
    window._bindScrollPinEvents = bindEvents;
})();
