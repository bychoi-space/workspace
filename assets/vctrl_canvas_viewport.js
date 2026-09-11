/**
 * assets/vctrl_canvas_viewport.js
 * Canvas Viewport & Interaction Engine
 * Manages canvas zoom, pan, crisp pixel scaling, device viewport sizing, fullscreen, and tool modes.
 */

(function() {
    console.log("%c [VCTRL CANVAS VIEWPORT] Initializing Canvas Viewport Engine... ", "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    // 1. Crisp View Toggle (100% Crisp Mode vs Auto-Fit Mode)
    window.toggleCrispView = function() {
        var state = window.state;
        if (!state) return;
        if (state.viewMode === 'crisp' || Math.abs(state.transform.scale - 1.0) < 0.02) {
            state.viewMode = 'fit';
        } else {
            state.viewMode = 'crisp';
        }
        window.centerView();
    };

    // 2. Viewport Centering & Smart-Snap Calculation
    window.centerView = function() {
        var DOM = window.DOM, state = window.state;
        if (!DOM || !DOM.canvas || !DOM.iframe || !state) return;
        var iw = parseInt(DOM.iframe.style.width) || 1600, ih = parseInt(DOM.iframe.style.height) || 900;
        var cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
        if (cw <= 0 || ch <= 0) return;

        // 브라우저 캔버스 영역에 맞춘 반응형 가변 배율(Fit Scale) 계산 (상하좌우 2% 안전 여백 반영)
        var fitScale = Math.min((cw * 0.98) / iw, (ch * 0.98) / ih);

        var s;
        if (state.viewMode === 'crisp') {
            // [100% 선명 뷰 모드 강제]: 모니터 해상도와 무관하게 1:1 물리 디스플레이 픽셀 선명도 100% 보장
            s = 1.0;
        } else {
            // [화면 맞춤(Fit) 모드]:
            // 1. 스마트 스냅 밴드 (Smart Snap Band): 0.95 이상일 때는 1.0(100%) 강제 스냅!
            if (fitScale >= 0.95) {
                s = 1.0;
            } else if (cw >= 1700 && ch >= 880) {
                s = 1.0;
            } else {
                // 2. 소형 노트북/저해상도 화면(fitScale < 0.95): 5% 단위 그리드 스냅 (0.90, 0.85, 0.80...)
                s = Math.max(0.2, Math.floor(fitScale * 20) / 20);
            }
        }

        var x = Math.round((cw - (iw * s)) / 2);
        // 세로 높이가 뷰포트를 초과하는 경우 상단 10px 안전 여백으로 배치
        var y;
        if (ih * s > ch) {
            y = 10;
        } else {
            y = Math.round((ch - (ih * s)) / 2);
        }

        state.transform = { x: x, y: y, scale: s };
        window.updateTransform();
    };

    // 3. Transform Application & Crisp Button Status Sync
    window.updateTransform = function() {
        var DOM = window.DOM, state = window.state;
        if (!DOM || !state) return;
        var x = Math.round(state.transform.x);
        var y = Math.round(state.transform.y);
        if (DOM.stage) DOM.stage.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + state.transform.scale + ')';
        if (DOM.zoomTxt) DOM.zoomTxt.innerText = Math.round(state.transform.scale * 100) + '%';

        // 듀얼 뷰포트 토글 버튼 상태 동기화 (100% 선명 뷰 vs 화면 맞춤)
        var toggleBtn = document.getElementById('btn-crisp-toggle');
        var toggleIcon = document.getElementById('icon-crisp-toggle');
        if (toggleBtn && toggleIcon) {
            var is100 = Math.abs(state.transform.scale - 1.0) < 0.02;
            if (is100) {
                toggleIcon.innerText = 'fit_screen';
                toggleBtn.title = '화면 맞춤으로 전환 (단축키: 1)';
                toggleBtn.style.color = 'var(--v4-accent, #00e5ff)';
            } else {
                toggleIcon.innerText = 'center_focus_strong';
                toggleBtn.title = '100% 선명 뷰로 전환 (단축키: 1)';
                toggleBtn.style.color = '';
            }
        }
    };

    // 4. Zoom Control
    window.adjustZoom = function(delta) {
        var state = window.state, DOM = window.DOM;
        if (!state || !DOM || !DOM.canvas) return;
        var s = state.transform.scale;
        var ns = Math.max(0.1, Math.min(s + delta, 20));
        
        var cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
        var mx = cw / 2, my = ch / 2;
        
        state.transform.x = mx - (mx - state.transform.x) * (ns / s);
        state.transform.y = my - (my - state.transform.y) * (ns / s);
        state.transform.scale = ns;
        window.updateTransform();
    };

    // 5. Device Viewport, Fullscreen, & Tool Mode
    window.setDeviceViewport = function(type, w, h) {
        var DOM = window.DOM;
        document.querySelectorAll('.tools .device-btn').forEach(function(btn) { btn.classList.remove('active'); });
        if (DOM && DOM.artboardWrapper) { DOM.artboardWrapper.style.width = w + 'px'; DOM.artboardWrapper.style.height = h + 'px'; }
        if (DOM && DOM.iframe) { DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px'; }
        setTimeout(function() { window.centerView(); }, 100);
    };

    window.toggleFullscreen = function(forceExit) {
        var DOM = window.DOM;
        var isActive = document.body.classList.contains('fullscreen-mode');
        var shouldExit = forceExit === true || (forceExit === undefined && isActive);
        document.body.classList.toggle('fullscreen-mode', !shouldExit);
        if (DOM && DOM.btnFullscreen) DOM.btnFullscreen.querySelector('span').innerText = shouldExit ? 'fullscreen' : 'fullscreen_exit';
        if (shouldExit && typeof window.clearPresentationPen === 'function') {
            window.clearPresentationPen();
        }
        setTimeout(window.centerView, 350);
    };

    window.setTool = function(t) {
        var state = window.state, DOM = window.DOM;
        if (!state || !DOM) return;
        state.tool = t;
        if (DOM.canvas) DOM.canvas.classList.toggle('hand-active', t === 'hand');
        if (DOM.iframe) DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
        if (DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = (t === 'select') ? 'auto' : 'none';
    };

    // 6. Viewport Event Listeners
    function initCanvasListeners() {
        var DOM = window.DOM;
        if (!DOM) {
            setTimeout(initCanvasListeners, 100);
            return;
        }

        window.addEventListener('keydown', function(e) {
            var state = window.state;
            if (!state) return;
            if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (state.tool !== 'hand') {
                    if (DOM.canvas) DOM.canvas.classList.add('hand-active');
                    if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                    state.isHandMode = true;
                }
            }
            if (e.code === 'KeyV') window.setTool('select');
            if (e.code === 'KeyH') window.setTool('hand');
            if (e.code === 'KeyT') { if (window.handleTextboxCreation) window.handleTextboxCreation(); }
            if (e.code === 'KeyF') window.toggleFullscreen();
        });

        window.addEventListener('keyup', function(e) {
            var state = window.state, DOM = window.DOM;
            if (!state) return;
            if (e.code === 'Space') {
                if (state.tool !== 'hand') {
                    if (DOM.canvas) DOM.canvas.classList.remove('hand-active');
                    if (DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
                    state.isHandMode = false;
                }
            }
        });

        if (DOM.canvas) {
            DOM.canvas.addEventListener('wheel', function(e) {
                var state = window.state;
                if (!state) return;
                if (e.target.closest('#floating-inspector-card, .floating-inspector-card, #inspector-card, .modal-overlay, .v4-color-popover, .v4-picker-dropdown')) {
                    return;
                }
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    var s = state.transform.scale;
                    var ns = Math.max(0.1, Math.min(s * (1 + (e.deltaY > 0 ? -0.1 : 0.1)), 20));
                    var r = DOM.canvas.getBoundingClientRect();
                    var mx = e.clientX - r.left, my = e.clientY - r.top;
                    state.transform.x = mx - (mx - state.transform.x) * (ns / s);
                    state.transform.y = my - (my - state.transform.y) * (ns / s);
                    state.transform.scale = ns;
                    state.viewMode = 'custom';
                    window.updateTransform();
                } else {
                    var ih = (DOM && DOM.iframe && parseInt(DOM.iframe.style.height)) || 900;
                    var iw = (DOM && DOM.iframe && parseInt(DOM.iframe.style.width)) || 1600;
                    var ch = DOM.canvas.clientHeight;
                    var cw = DOM.canvas.clientWidth;
                    var renderedH = ih * state.transform.scale;
                    var renderedW = iw * state.transform.scale;

                    if (renderedH > ch || renderedW > cw) {
                        e.preventDefault();
                        state.transform.x -= e.deltaX;
                        state.transform.y -= e.deltaY;
                        window.updateTransform();
                    }
                }
            }, { passive: false });

            DOM.canvas.addEventListener('mousedown', function(e) {
                var state = window.state, DOM = window.DOM;
                if (!state) return;
                if (e.target.closest('#floating-inspector-card')) return;
                if (state.tool === 'hand' || e.button === 1 || state.isHandMode) {
                    state.isDragging = true;
                    state.startX = e.clientX - state.transform.x;
                    state.startY = e.clientY - state.transform.y;
                    e.preventDefault();
                } else {
                    if (window.closeActiveEditor) window.closeActiveEditor(true);
                }
            });
        }

        window.addEventListener('mousemove', function(e) {
            var state = window.state;
            if (!state || !state.isDragging) return;
            state.transform.x = e.clientX - state.startX;
            state.transform.y = e.clientY - state.startY;
            window.updateTransform();
        });

        window.addEventListener('mouseup', function() {
            var state = window.state;
            if (state) state.isDragging = false;
        });

        window.addEventListener('resize', function() {
            if (window.centerView) window.centerView();
        });

        window.addEventListener('keydown', function(e) {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.target.classList.contains('v4-editable-cell'))) {
                return;
            }
            if (e.key === '1' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                if (window.toggleCrispView) {
                    e.preventDefault();
                    window.toggleCrispView();
                }
            }
        });

        if (DOM && DOM.canvas && window.ResizeObserver) {
            const ro = new ResizeObserver(function(entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.contentRect.width > 100 && entry.contentRect.height > 100) {
                        if (window.centerView) window.centerView();
                    }
                }
            });
            ro.observe(DOM.canvas);
        }

        console.log("[VCTRL CANVAS VIEWPORT] Canvas Viewport Engine initialized successfully.");
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initCanvasListeners);
    } else {
        initCanvasListeners();
    }
})();
