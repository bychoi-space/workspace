/**
 * assets/vctrl_canvas_background.js
 * Canvas Background Controller & Smart Compression Engine
 * Manages canvas background image uploads, solid background colors, opacity adjustments, preset application, and iframe synchronization.
 */

(function() {
    'use strict';
    console.log("%c [VCTRL CANVAS BACKGROUND] Initializing Canvas Background Controller... ", "background: #10b981; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    const SOLID_COLOR_PRESETS = [
        { color: '#ffffff', name: '화이트 (Pure White)' },
        { color: '#f8fafc', name: '스노우 슬레이트 (기본값)' },
        { color: '#f1f5f9', name: '쿨 그레이 (Cool Grey)' },
        { color: '#fafaf9', name: '웜 아이보리 (Warm Ivory)' },
        { color: '#f0fdf4', name: '소프트 민트 (Mint Tint)' },
        { color: '#eff6ff', name: '소프트 블루 (Blue Tint)' },
        { color: '#334155', name: '미드 슬레이트 (Mid Slate)' },
        { color: '#1e293b', name: '딥 네이비 (Deep Navy)' },
        { color: '#0f172a', name: '미드나잇 다크 (Midnight)' },
        { color: '#000000', name: '퓨어 블랙 (Pure Black)' }
    ];

    let _currentCanvasBgState = {
        hasBg: false,
        url: '',
        opacity: 1.0,
        name: '',
        bgColor: '#f8fafc'
    };

    function rgbToHex(rgb) {
        if (!rgb) return '#f8fafc';
        return (window.rgbToHex && window.rgbToHex(rgb)) || ((typeof rgb === 'string' && rgb.startsWith('#')) ? rgb : '#f8fafc');
    }

    function isDarkColor(hex) {
        if (!hex || !hex.startsWith('#')) return false;
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length !== 6) return false;
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        // Perceived luminance
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq < 128;
    }

    function getSliderOpacity() {
        const slider = document.getElementById('canvas-bg-opacity-slider');
        return slider ? (parseInt(slider.value, 10) / 100) : 1.0;
    }

    function queryIframeCanvasBackground(callback) {
        const DOM = window.DOM || {};
        const activeIframe = DOM.iframe || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
        if (!activeIframe || !activeIframe.contentDocument) {
            if (callback) callback({ hasBg: false, url: '', opacity: 1.0, name: '', bgColor: '#f8fafc' });
            return;
        }

        try {
            const doc = activeIframe.contentDocument;
            const isResp = (window.isResponsiveDocument && window.isResponsiveDocument(doc)) || 
                           !!(doc.querySelector && doc.querySelector('.pc-content-inner, .mobile-content-inner, .pc-browser-frame, .mobile-frame'));

            let targetCanvas = null;
            if (isResp) {
                targetCanvas = doc.querySelector('.pc-content-inner, .mobile-content-inner, .pc-browser-frame, .mobile-frame');
            }
            if (!targetCanvas) {
                targetCanvas = doc.getElementById('canvas') || doc.querySelector('.canvas, .page, #canvas-page') || doc.body;
            }

            let bgColor = isResp ? '#ffffff' : '#f8fafc';
            const pageEl = doc.querySelector('.page');
            const pageBgColor = pageEl && pageEl.dataset ? pageEl.dataset.canvasBgColor : null;

            if (pageBgColor) {
                bgColor = rgbToHex(pageBgColor);
            } else if (targetCanvas) {
                const inlineBg = (targetCanvas.dataset && targetCanvas.dataset.canvasBgColor) ? targetCanvas.dataset.canvasBgColor : targetCanvas.style.backgroundColor;
                if (inlineBg) {
                    bgColor = rgbToHex(inlineBg);
                } else if (doc.defaultView) {
                    const compBg = doc.defaultView.getComputedStyle(targetCanvas).backgroundColor;
                    if (compBg && compBg !== 'rgba(0, 0, 0, 0)' && compBg !== 'transparent') {
                        bgColor = rgbToHex(compBg);
                    }
                }
            }

            const bgLayer = doc.getElementById('canvas_bg_layer');
            const bgImg = bgLayer ? bgLayer.querySelector('img') : null;
            if (bgLayer && bgImg && bgImg.getAttribute('src')) {
                const src = bgImg.getAttribute('src');
                const op = bgImg.style.opacity ? parseFloat(bgImg.style.opacity) : 1.0;
                const state = { hasBg: true, url: src, opacity: isNaN(op) ? 1.0 : op, name: src.split('/').pop(), bgColor: bgColor };
                if (callback) callback(state);
                return;
            } else {
                if (callback) callback({ hasBg: false, url: '', opacity: 1.0, name: '', bgColor: bgColor });
                return;
            }
        } catch(e) {
            console.warn('[Canvas Background] Direct iframe inspection failed:', e);
        }

        if (callback) callback({ hasBg: false, url: '', opacity: 1.0, name: '', bgColor: '#f8fafc' });
    }

    function renderSolidColorPresets(currentColor) {
        const container = document.getElementById('canvas-bg-color-presets');
        if (!container) return;

        const normCurrent = (currentColor || '#f8fafc').toLowerCase();
        container.innerHTML = SOLID_COLOR_PRESETS.map(function(item) {
            const isAct = normCurrent === item.color.toLowerCase();
            return '<button type="button" class="bg-color-preset-chip' + (isAct ? ' active' : '') + '" style="background-color: ' + item.color + ';" data-color="' + item.color + '" onclick="window.applyCanvasBackgroundColor(\'' + item.color + '\')" title="' + item.name + ' (' + item.color + ')"></button>';
        }).join('');
    }

    function updateCanvasBgModalUI(state) {
        const badge = document.getElementById('canvas-bg-modal-status-badge');
        const colorBadge = document.getElementById('canvas-bg-color-badge');
        const colorPicker = document.getElementById('canvas-bg-color-picker');
        const colorHex = document.getElementById('canvas-bg-color-hex');
        const previewBox = document.getElementById('canvas-bg-current-preview');
        const previewEmpty = document.getElementById('canvas-bg-preview-empty');
        const previewImg = document.getElementById('canvas-bg-preview-img');
        const slider = document.getElementById('canvas-bg-opacity-slider');
        const valTxt = document.getElementById('canvas-bg-opacity-val');
        const btnRemove = document.getElementById('btn-canvas-bg-remove');
        const quickStatus = document.getElementById('canvas-bg-quick-status');

        const activeBgColor = (state.bgColor || '#f8fafc').toLowerCase();

        // 1. Color controls sync
        if (colorBadge) colorBadge.innerText = activeBgColor;
        if (colorPicker) colorPicker.value = activeBgColor;
        if (colorHex) colorHex.value = activeBgColor;
        renderSolidColorPresets(activeBgColor);

        // 2. Preview box background update
        if (previewBox) {
            previewBox.style.backgroundColor = activeBgColor;
        }

        // 3. Status Badge & Preview Image handling
        if (state.hasBg && state.url) {
            if (badge) badge.innerText = '적용됨 (' + (state.name || '이미지 배경') + ')';
            if (previewEmpty) previewEmpty.style.display = 'none';
            if (previewImg) {
                previewImg.src = state.url;
                previewImg.style.display = 'block';
                previewImg.style.opacity = state.opacity || 1.0;
            }
            if (btnRemove) btnRemove.style.display = 'inline-flex';
            if (quickStatus) quickStatus.innerText = '이미지 배경 적용됨';
        } else {
            if (badge) badge.innerText = '단색 배경 (' + activeBgColor + ')';
            if (previewEmpty) {
                previewEmpty.style.display = 'flex';
                const dark = isDarkColor(activeBgColor);
                previewEmpty.style.color = dark ? '#e2e8f0' : '#475569';
                previewEmpty.innerHTML = '<span class="material-icons-outlined" style="color:' + (dark ? '#38bdf8' : '#0284c7') + ';">palette</span><span>단색 배경이 적용 중입니다 (' + activeBgColor + ')</span>';
            }
            if (previewImg) {
                previewImg.src = '';
                previewImg.style.display = 'none';
            }
            if (btnRemove) btnRemove.style.display = 'none';
            if (quickStatus) quickStatus.innerText = '단색 배경 (' + activeBgColor + ')';
        }

        const opPercent = Math.round((state.opacity || 1.0) * 100);
        if (slider) slider.value = opPercent;
        if (valTxt) valTxt.innerText = opPercent + '%';
    }

    function renderCanvasBgPresets(currentState) {
        const container = document.getElementById('canvas-bg-presets-container');
        if (!container) return;

        const lib = window.V4_COMPONENT_LIBRARY || {};
        const presets = lib.canvasBackgrounds || [];

        container.innerHTML = presets.map(function(item) {
            const isActive = currentState.hasBg && (currentState.url === item.url || currentState.url.endsWith(item.url));
            return '<div class="bg-preset-card' + (isActive ? ' active' : '') + '" onclick="applyCanvasBackgroundPreset(\'' + item.id + '\')" title="' + item.desc + '">' +
                '<div class="bg-preset-thumb-wrap">' +
                    '<img src="' + item.thumb + '" alt="' + item.name + '" />' +
                '</div>' +
                '<span class="bg-preset-title">' + item.name + '</span>' +
            '</div>';
        }).join('');
    }

    window.applyCanvasBackgroundPreset = function(presetId) {
        const lib = window.V4_COMPONENT_LIBRARY || {};
        const presets = lib.canvasBackgrounds || [];
        const item = presets.find(function(p) { return p.id === presetId; });
        if (!item) return;

        const opacity = item.defaultOpacity || getSliderOpacity();
        window.applyCanvasBackground(item.url, opacity, item.name);
    };

    function compressAndUploadBgImage(file, callback) {
        if (!file || !callback) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const tempImg = new Image();
            tempImg.onload = function() {
                const origW = tempImg.naturalWidth || 1600;
                const origH = tempImg.naturalHeight || 900;
                const maxDim = 1920;
                let targetW = origW;
                let targetH = origH;

                if (origW > maxDim || origH > maxDim) {
                    if (origW >= origH) {
                        targetW = maxDim;
                        targetH = Math.round((origH * maxDim) / origW);
                    } else {
                        targetH = maxDim;
                        targetW = Math.round((origW * maxDim) / origH);
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(tempImg, 0, 0, targetW, targetH);

                // Compress to JPEG 85% for lightweight and crisp output (~200KB)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                callback(compressedBase64);
            };
            tempImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function sendCanvasBgMessage(payload) {
        const DOM = window.DOM || {};
        const activeIframe = DOM.iframe || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
        if (!activeIframe || !activeIframe.contentWindow) return;

        const data = Object.assign({ type: 'LF_SET_CANVAS_BACKGROUND' }, payload);
        if (window.MessageHub) {
            window.MessageHub.send(activeIframe.contentWindow, 'LF_SET_CANVAS_BACKGROUND', payload);
        } else {
            activeIframe.contentWindow.postMessage(data, '*');
        }
    }

    window.applyCanvasBackgroundColor = function(rawColor) {
        if (!rawColor) return;
        const hex = rgbToHex(rawColor);
        sendCanvasBgMessage({
            action: 'set_color',
            color: hex
        });

        _currentCanvasBgState.bgColor = hex;
        updateCanvasBgModalUI(_currentCanvasBgState);
        if (typeof window.markAsDirty === 'function') window.markAsDirty();
    };

    window.openCanvasBackgroundModal = function() {
        const modal = document.getElementById('canvas-bg-modal');
        if (!modal) {
            console.warn('[Canvas Background] #canvas-bg-modal not found in DOM.');
            return;
        }

        // 1. Check current canvas background state from active iframe
        queryIframeCanvasBackground(function(bgState) {
            _currentCanvasBgState = bgState;
            updateCanvasBgModalUI(bgState);
            renderCanvasBgPresets(bgState);
            modal.style.display = 'flex';
        });

        // Bind modal close buttons once
        const btnClose = document.getElementById('btn-canvas-bg-close');
        const btnCancel = document.getElementById('btn-canvas-bg-cancel');
        const closeModal = function() { modal.style.display = 'none'; };
        if (btnClose) btnClose.onclick = closeModal;
        if (btnCancel) btnCancel.onclick = closeModal;

        // Bind color picker and inputs once
        const colorPicker = document.getElementById('canvas-bg-color-picker');
        const colorHex = document.getElementById('canvas-bg-color-hex');
        const btnApplyColor = document.getElementById('btn-canvas-bg-apply-color');
        const btnResetColor = document.getElementById('btn-canvas-bg-color-reset');

        if (colorPicker && !colorPicker.dataset.bound) {
            colorPicker.dataset.bound = 'true';
            colorPicker.addEventListener('input', function(e) {
                if (colorHex) colorHex.value = e.target.value.toLowerCase();
                window.applyCanvasBackgroundColor(e.target.value);
            });
        }

        if (btnApplyColor && !btnApplyColor.dataset.bound) {
            btnApplyColor.dataset.bound = 'true';
            btnApplyColor.addEventListener('click', function() {
                if (colorHex) {
                    window.applyCanvasBackgroundColor(colorHex.value.trim());
                }
            });
        }

        if (colorHex && !colorHex.dataset.bound) {
            colorHex.dataset.bound = 'true';
            colorHex.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.applyCanvasBackgroundColor(colorHex.value.trim());
                }
            });
        }

        if (btnResetColor && !btnResetColor.dataset.bound) {
            btnResetColor.dataset.bound = 'true';
            btnResetColor.addEventListener('click', function() {
                window.applyCanvasBackgroundColor('#f8fafc');
            });
        }

        // Bind file upload input once
        const fileInput = document.getElementById('canvas-bg-file-input');
        if (fileInput && !fileInput.dataset.bound) {
            fileInput.dataset.bound = 'true';
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                compressAndUploadBgImage(file, function(compressedDataUrl) {
                    const opacity = getSliderOpacity();
                    window.applyCanvasBackground(compressedDataUrl, opacity, file.name);
                });
                fileInput.value = '';
            });
        }

        // Bind opacity slider once
        const slider = document.getElementById('canvas-bg-opacity-slider');
        const valTxt = document.getElementById('canvas-bg-opacity-val');
        if (slider && !slider.dataset.bound) {
            slider.dataset.bound = 'true';
            slider.addEventListener('input', function(e) {
                const op = parseInt(e.target.value, 10) / 100;
                if (valTxt) valTxt.innerText = e.target.value + '%';
                if (_currentCanvasBgState.hasBg) {
                    sendCanvasBgMessage({ action: 'update_opacity', opacity: op });
                }
            });
        }

        // Bind remove button once
        const btnRemove = document.getElementById('btn-canvas-bg-remove');
        if (btnRemove) {
            btnRemove.onclick = function() {
                window.removeCanvasBackground();
            };
        }
    };

    window.applyCanvasBackground = function(imageUrl, opacity, displayName) {
        if (!imageUrl) return;
        const op = opacity !== undefined ? opacity : getSliderOpacity();
        sendCanvasBgMessage({
            action: 'set',
            imageUrl: imageUrl,
            opacity: op
        });

        _currentCanvasBgState = {
            hasBg: true,
            url: imageUrl,
            opacity: op,
            name: displayName || '이미지 배경',
            bgColor: _currentCanvasBgState.bgColor || '#f8fafc'
        };
        updateCanvasBgModalUI(_currentCanvasBgState);
        renderCanvasBgPresets(_currentCanvasBgState);
        if (typeof window.markAsDirty === 'function') window.markAsDirty();
    };

    window.removeCanvasBackground = function() {
        sendCanvasBgMessage({ action: 'remove' });
        _currentCanvasBgState = {
            hasBg: false,
            url: '',
            opacity: 1.0,
            name: '',
            bgColor: _currentCanvasBgState.bgColor || '#f8fafc'
        };
        updateCanvasBgModalUI(_currentCanvasBgState);
        renderCanvasBgPresets(_currentCanvasBgState);
        if (typeof window.markAsDirty === 'function') window.markAsDirty();
    };

    // Listen for parent-side background update messages from iframe
    window.addEventListener('message', function(e) {
        const d = e.data;
        if (!d || d.type !== 'LF_CANVAS_BACKGROUND_UPDATED') return;
        _currentCanvasBgState.hasBg = !!d.hasBg;
        _currentCanvasBgState.url = d.url || '';
        _currentCanvasBgState.opacity = (d.opacity !== undefined) ? d.opacity : 1.0;
        if (d.bgColor) _currentCanvasBgState.bgColor = d.bgColor;
        updateCanvasBgModalUI(_currentCanvasBgState);
    });

    window.CanvasBackgroundController = {
        openModal: window.openCanvasBackgroundModal,
        applyBackground: window.applyCanvasBackground,
        applyColor: window.applyCanvasBackgroundColor,
        removeBackground: window.removeCanvasBackground,
        applyPreset: window.applyCanvasBackgroundPreset
    };
})();

