/**
 * assets/inspector/inspector_dimmed_layer.js
 *
 * Right Sidebar (CANVAS & BACKGROUND) Controller for Dimmed Overlay Layer Authoring.
 * - Placed exclusively in the Canvas settings section per UX architecture.
 * - Supports per-frame independent control (PC / Mobile / Left / Right / Canvas) + optional Sync All mode.
 * - Switches seamlessly between [딤드·팝업 편집] (Upper Popup Authoring) and [바닥 화면 편집] (Base Screen Authoring).
 */

(function() {
    'use strict';

    const TINT_PRESETS = [
        { color: '#000000', label: '블랙 (기본)' },
        { color: '#0f172a', label: '슬레이트 다크' },
        { color: '#ffffff', label: '화이트 딤드' }
    ];

    const OPACITY_PRESETS = [30, 50, 70];

    let _state = {
        layout: 'canvas',
        isMultiFrame: false,
        activeFrame: 'canvas',
        syncAllFrames: false,
        frames: [
            {
                key: 'canvas',
                label: 'Canvas 화면',
                shortLabel: 'Canvas',
                enabled: false,
                editMode: 'overlay',
                color: '#000000',
                opacity: 50,
                objectCount: 0
            }
        ]
    };

    let _sliderUndoSaved = false;

    function getActiveIframeWindow() {
        const DOM = window.DOM || {};
        const iframe = DOM.iframe || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
        return (iframe && iframe.contentWindow) ? iframe.contentWindow : null;
    }

    function sendToIframeDimmed(type, payload) {
        const win = getActiveIframeWindow();
        if (!win) return;
        if (window.MessageHub && typeof window.MessageHub.send === 'function') {
            const copy = Object.assign({}, payload || {});
            delete copy.type;
            window.MessageHub.send(win, type, copy);
        } else {
            win.postMessage(Object.assign({ type: type }, payload || {}), '*');
        }
    }

    function getSelectedFrameObj() {
        if (!_state.frames || _state.frames.length === 0) return null;
        let found = _state.frames.find(function(f) { return f.key === _state.activeFrame; });
        if (!found) {
            found = _state.frames[0];
            _state.activeFrame = found.key;
        }
        return found;
    }

    function getTargetFrameKeys() {
        if (_state.isMultiFrame && _state.syncAllFrames) {
            return _state.frames.map(function(f) { return f.key; });
        }
        const cur = getSelectedFrameObj();
        return cur ? [cur.key] : ['canvas'];
    }

    function renderUI() {
        const card = document.getElementById('v4-dimmed-layer-card');
        if (!card) return;

        const curFrame = getSelectedFrameObj();
        if (!curFrame) return;

        const anyEnabled = _state.frames.some(function(f) { return f.enabled; });
        const anyBaseMode = _state.frames.some(function(f) { return f.enabled && f.editMode === 'base'; });

        // 1. Header quick status badge
        const badgeEl = document.getElementById('dimmed-layer-quick-badge');
        if (badgeEl) {
            badgeEl.classList.remove('is-on', 'is-base');
            if (!anyEnabled) {
                badgeEl.textContent = 'OFF';
            } else if (curFrame.enabled && curFrame.editMode === 'base') {
                badgeEl.textContent = '바닥 편집 중';
                badgeEl.classList.add('is-base');
            } else if (curFrame.enabled) {
                badgeEl.textContent = '팝업 편집 중';
                badgeEl.classList.add('is-on');
            } else if (anyBaseMode) {
                badgeEl.textContent = '부분 ON';
                badgeEl.classList.add('is-base');
            } else {
                badgeEl.textContent = '부분 ON';
                badgeEl.classList.add('is-on');
            }
        }

        card.classList.toggle('has-active-dimmed', !!curFrame.enabled);

        // 2. Multi-frame selector bar (PC / Mobile or Left / Right + Sync toggle)
        const tabsRow = document.getElementById('dimmed-frame-tabs-row');
        const tabsGroup = document.getElementById('dimmed-frame-tabs-group');
        const syncBtn = document.getElementById('btn-dimmed-sync-all');

        if (tabsRow && tabsGroup) {
            if (_state.isMultiFrame) {
                tabsRow.style.display = 'flex';
                tabsGroup.innerHTML = _state.frames.map(function(f) {
                    const isSelected = f.key === curFrame.key;
                    const dotClass = f.enabled
                        ? (f.editMode === 'base' ? 'dimmed-tab-dot is-base' : 'dimmed-tab-dot is-on')
                        : 'dimmed-tab-dot';
                    return '<button type="button" class="dimmed-frame-tab' + (isSelected ? ' active' : '') + '" data-frame-key="' + f.key + '" title="' + f.label + ' 선택">' +
                        '<span class="' + dotClass + '"></span>' +
                        '<span>' + f.shortLabel + '</span>' +
                        '</button>';
                }).join('');

                tabsGroup.querySelectorAll('.dimmed-frame-tab').forEach(function(btn) {
                    btn.onclick = function() {
                        const fKey = btn.getAttribute('data-frame-key');
                        if (!fKey) return;
                        _state.activeFrame = fKey;
                        renderUI();
                        sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                            frames: [fKey],
                            focusFrame: fKey,
                            saveUndo: false,
                            markDirty: false
                        });
                    };
                });
            } else {
                tabsRow.style.display = 'none';
            }
        }

        if (syncBtn) {
            syncBtn.classList.toggle('active', !!_state.syncAllFrames);
            syncBtn.setAttribute('aria-pressed', _state.syncAllFrames ? 'true' : 'false');
        }

        // 3. Enable toggle row + object count badge
        const enableLabel = document.getElementById('dimmed-enable-label');
        const countBadge = document.getElementById('dimmed-object-count-badge');
        const enableToggle = document.getElementById('dimmed-enable-toggle');

        if (enableLabel) {
            if (_state.isMultiFrame && _state.syncAllFrames) {
                enableLabel.textContent = '전체 프레임 딤드 사용';
            } else if (_state.isMultiFrame) {
                enableLabel.textContent = curFrame.shortLabel + ' 딤드 사용';
            } else {
                enableLabel.textContent = '화면 딤드 사용';
            }
        }

        if (countBadge) {
            const countVal = (_state.isMultiFrame && _state.syncAllFrames)
                ? _state.frames.reduce(function(sum, f) { return sum + (f.objectCount || 0); }, 0)
                : (curFrame.objectCount || 0);
            if (countVal > 0) {
                countBadge.style.display = 'inline-flex';
                countBadge.textContent = '오브젝트 ' + countVal;
            } else {
                countBadge.style.display = 'none';
            }
        }

        if (enableToggle) {
            enableToggle.checked = !!curFrame.enabled;
        }

        // 4. Preserved notice when OFF but popup objects exist inside layer
        const preservedNote = document.getElementById('dimmed-preserved-note');
        if (preservedNote) {
            if (!curFrame.enabled && curFrame.objectCount > 0) {
                preservedNote.style.display = 'block';
                preservedNote.textContent = '딤드 레이어에 보관된 팝업 오브젝트 ' + curFrame.objectCount + '개가 있습니다. 다시 켜면 그대로 표시됩니다.';
            } else {
                preservedNote.style.display = 'none';
            }
        }

        // 5. Active Controls (Layer Edit Mode Switch + Opacity + Tint)
        const activeControls = document.getElementById('dimmed-active-controls');
        if (activeControls) {
            activeControls.style.display = curFrame.enabled ? 'flex' : 'none';
        }

        if (curFrame.enabled) {
            const btnOverlay = document.getElementById('btn-dimmed-mode-overlay');
            const btnBase = document.getElementById('btn-dimmed-mode-base');
            const modeHint = document.getElementById('dimmed-mode-hint');

            const isBase = curFrame.editMode === 'base';
            if (btnOverlay) btnOverlay.classList.toggle('active', !isBase);
            if (btnBase) btnBase.classList.toggle('active', isBase);
            if (modeHint) {
                modeHint.classList.toggle('is-base-warning', isBase);
                modeHint.textContent = isBase
                    ? '바닥 편집을 위해 딤드를 임시 숨김 중입니다. (저장·뷰어에서는 딤드 유지)'
                    : '바닥 화면이 잠기고 딤드 레이어 위에 팝업을 안전하게 배치합니다.';
            }

            const opSlider = document.getElementById('dimmed-opacity-slider');
            const opVal = document.getElementById('dimmed-opacity-val');
            if (opSlider) opSlider.value = String(curFrame.opacity);
            if (opVal) opVal.textContent = curFrame.opacity + '%';

            const opChipsWrap = document.getElementById('dimmed-opacity-presets');
            if (opChipsWrap) {
                opChipsWrap.querySelectorAll('.dimmed-preset-chip').forEach(function(chip) {
                    const pVal = parseInt(chip.getAttribute('data-opacity'), 10);
                    chip.classList.toggle('active', pVal === curFrame.opacity);
                });
            }

            const tintWrap = document.getElementById('dimmed-tint-swatches');
            if (tintWrap) {
                const normCur = (curFrame.color || '#000000').toLowerCase();
                tintWrap.querySelectorAll('.dimmed-tint-chip').forEach(function(sw) {
                    const swColor = (sw.getAttribute('data-color') || '').toLowerCase();
                    sw.classList.toggle('active', swColor === normCur);
                });
            }
        }
    }

    function bindEvents() {
        const syncBtn = document.getElementById('btn-dimmed-sync-all');
        if (syncBtn && !syncBtn._bound) {
            syncBtn._bound = true;
            syncBtn.addEventListener('click', function() {
                _state.syncAllFrames = !_state.syncAllFrames;
                if (_state.syncAllFrames) {
                    const cur = getSelectedFrameObj();
                    if (cur) {
                        sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                            frames: _state.frames.map(function(f) { return f.key; }),
                            enabled: cur.enabled,
                            editMode: cur.editMode,
                            color: cur.color,
                            opacity: cur.opacity
                        });
                    }
                }
                renderUI();
            });
        }

        const enableToggle = document.getElementById('dimmed-enable-toggle');
        if (enableToggle && !enableToggle._bound) {
            enableToggle._bound = true;
            enableToggle.addEventListener('change', function() {
                if (window.state && window.state.isReadOnly) {
                    enableToggle.checked = !enableToggle.checked;
                    if (typeof window.showAuthModal === 'function') window.showAuthModal();
                    return;
                }
                const nextEnabled = !!enableToggle.checked;
                const targets = getTargetFrameKeys();
                sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                    frames: targets,
                    enabled: nextEnabled,
                    editMode: 'overlay',
                    focusFrame: _state.activeFrame
                });
            });
        }

        const btnOverlay = document.getElementById('btn-dimmed-mode-overlay');
        const btnBase = document.getElementById('btn-dimmed-mode-base');
        if (btnOverlay && !btnOverlay._bound) {
            btnOverlay._bound = true;
            btnOverlay.addEventListener('click', function() {
                const targets = getTargetFrameKeys();
                sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                    frames: targets,
                    editMode: 'overlay',
                    focusFrame: _state.activeFrame,
                    saveUndo: false,
                    markDirty: false
                });
            });
        }
        if (btnBase && !btnBase._bound) {
            btnBase._bound = true;
            btnBase.addEventListener('click', function() {
                const targets = getTargetFrameKeys();
                sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                    frames: targets,
                    editMode: 'base',
                    focusFrame: _state.activeFrame,
                    saveUndo: false,
                    markDirty: false
                });
            });
        }

        const opSlider = document.getElementById('dimmed-opacity-slider');
        if (opSlider && !opSlider._bound) {
            opSlider._bound = true;
            opSlider.addEventListener('pointerdown', function() {
                _sliderUndoSaved = false;
            });
            opSlider.addEventListener('input', function() {
                const val = parseInt(opSlider.value, 10);
                if (isNaN(val)) return;
                const opVal = document.getElementById('dimmed-opacity-val');
                if (opVal) opVal.textContent = val + '%';
                const shouldSaveUndo = !_sliderUndoSaved;
                _sliderUndoSaved = true;
                sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                    frames: getTargetFrameKeys(),
                    opacity: val,
                    saveUndo: shouldSaveUndo,
                    markDirty: false
                });
            });
            opSlider.addEventListener('change', function() {
                const val = parseInt(opSlider.value, 10);
                if (isNaN(val)) return;
                sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                    frames: getTargetFrameKeys(),
                    opacity: val,
                    saveUndo: !_sliderUndoSaved,
                    markDirty: true
                });
                _sliderUndoSaved = false;
            });
        }

        const opChipsWrap = document.getElementById('dimmed-opacity-presets');
        if (opChipsWrap && !opChipsWrap._bound) {
            opChipsWrap._bound = true;
            opChipsWrap.innerHTML = OPACITY_PRESETS.map(function(pct) {
                return '<button type="button" class="dimmed-preset-chip" data-opacity="' + pct + '">' + pct + '%</button>';
            }).join('');
            opChipsWrap.querySelectorAll('.dimmed-preset-chip').forEach(function(chip) {
                chip.addEventListener('click', function() {
                    const pct = parseInt(chip.getAttribute('data-opacity'), 10);
                    if (isNaN(pct)) return;
                    sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                        frames: getTargetFrameKeys(),
                        opacity: pct,
                        saveUndo: true,
                        markDirty: true
                    });
                });
            });
        }

        const tintWrap = document.getElementById('dimmed-tint-swatches');
        if (tintWrap && !tintWrap._bound) {
            tintWrap._bound = true;
            tintWrap.innerHTML = TINT_PRESETS.map(function(item) {
                return '<button type="button" class="dimmed-tint-chip" data-color="' + item.color + '" title="' + item.label + ' (' + item.color + ')">' +
                    '<span class="dimmed-tint-swatch-dot" style="background-color:' + item.color + ';"></span>' +
                    '<span class="dimmed-tint-swatch-name">' + item.label.split(' ')[0] + '</span>' +
                    '</button>';
            }).join('');
            tintWrap.querySelectorAll('.dimmed-tint-chip').forEach(function(sw) {
                sw.addEventListener('click', function() {
                    const hex = sw.getAttribute('data-color');
                    if (!hex) return;
                    sendToIframeDimmed('LF_UPDATE_DIMMED_LAYER', {
                        frames: getTargetFrameKeys(),
                        color: hex,
                        saveUndo: true,
                        markDirty: true
                    });
                });
            });
        }
    }

    function syncFromIframe(data) {
        if (!data || !Array.isArray(data.frames) || data.frames.length === 0) return;

        const prevLayout = _state.layout;
        _state.layout = data.layout || 'canvas';
        _state.isMultiFrame = !!data.isMultiFrame;
        _state.frames = data.frames;

        if (prevLayout !== _state.layout) {
            _state.syncAllFrames = false;
        }

        if (data.activeFrame && _state.frames.some(function(f) { return f.key === data.activeFrame; })) {
            _state.activeFrame = data.activeFrame;
        } else if (!_state.frames.some(function(f) { return f.key === _state.activeFrame; })) {
            _state.activeFrame = _state.frames[0].key;
        }

        bindEvents();
        renderUI();
    }

    function queryIframeState() {
        sendToIframeDimmed('LF_QUERY_DIMMED_LAYER_STATE', {});
    }

    function init() {
        bindEvents();
        renderUI();
    }

    window.InspectorDimmedLayer = {
        init: init,
        syncFromIframe: syncFromIframe,
        queryIframeState: queryIframeState
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
