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
        window.centerView(true);
    };

    // 2. Viewport Centering & Smart-Snap Calculation
    window.centerView = function(forceReset) {
        var DOM = window.DOM, state = window.state;
        if (!DOM || !DOM.canvas || !DOM.iframe || !state) return;
        var iw = parseInt(DOM.iframe.style.width) || 1600, ih = parseInt(DOM.iframe.style.height) || 900;
        var cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
        if (cw <= 0 || ch <= 0) return;

        var isMobilePortrait = (cw <= 600 || (cw < 900 && ch > cw * 1.2));
        var isMobile = (cw <= 960 || (ch <= 600 && cw <= 1050) || document.body.classList.contains('res-narrow'));

        // 브라우저 캔버스 영역에 맞춘 반응형 가변 배율(Fit Scale) 계산
        // 모바일 세로 모드에서는 가로폭(Fit to Width) 기준 적용 (스크린 좌우 꽉 참)
        var fitScale = isMobilePortrait 
            ? (cw / iw)
            : Math.min(cw / iw, ch / ih);

        if (isMobile && forceReset) {
            state.viewMode = 'fit';
        }

        var s;
        if (state.viewMode === 'custom' && !forceReset && state.transform && state.transform.scale) {
            // [사용자 커스텀 줌 모드 보존]: 사용자가 직접 조절한 확대/축소 배율을 유지
            s = state.transform.scale;
        } else if (state.viewMode === 'crisp') {
            // [100% 선명 뷰 모드 강제]: 모니터 해상도와 무관하게 1:1 물리 디스플레이 픽셀 선명도 100% 보장
            s = 1.0;
        } else {
            // [화면 맞춤(Fit) 모드]:
            if (isMobile) {
                // 모바일/태블릿: 5% 단위 그리드 스냅(floor)으로 인한 인위적 축소 방지 -> 화면에 100% 핏
                s = fitScale;
            } else if (fitScale >= 0.95) {
                // 1. 데스크톱 스마트 스냅 밴드 (Smart Snap Band): 0.95 이상일 때는 1.0(100%) 강제 스냅!
                s = 1.0;
            } else if (cw >= 1700 && ch >= 880) {
                s = 1.0;
            } else {
                // 2. 소형 노트북/저해상도 PC(fitScale < 0.95): 5% 단위 그리드 스냅 (0.90, 0.85, 0.80...)
                s = Math.max(0.2, Math.floor(fitScale * 20) / 20);
            }
        }

        var x, y;
        if (state.viewMode === 'custom' && !forceReset && state.transform && typeof state.transform.x === 'number' && typeof state.transform.y === 'number') {
            // [사용자 커스텀 뷰포트 위치 보존]: 스페이스+드래그 팬 이동 및 줌 위치를 정중앙으로 리셋하지 않고 보존
            x = state.transform.x;
            y = state.transform.y;
        } else {
            x = Math.round((cw - (iw * s)) / 2);
            // 모바일 세로모드: 상/하단 플로팅 컨트롤이 레이어로 떠도 간섭 없는 세로 정중앙 배치
            if (isMobilePortrait) {
                y = Math.max(10, Math.round((ch - (ih * s)) / 2));
            } else if (isMobile) {
                // 모바일 가로모드: 화면에 꽉 찬 세로 정중앙 배치
                y = Math.round((ch - (ih * s)) / 2);
            } else if (ih * s > ch) {
                // 세로 높이가 뷰포트를 초과하는 경우 상단 10px 안전 여백으로 배치
                y = 10;
            } else {
                y = Math.round((ch - (ih * s)) / 2);
            }
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
                toggleBtn.title = '화면 맞춤으로 전환 (단축키: `)';
                toggleBtn.style.color = 'var(--v4-accent, #00e5ff)';
            } else {
                toggleIcon.innerText = 'center_focus_strong';
                toggleBtn.title = '100% 선명 뷰로 전환 (단축키: `)';
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
        state.viewMode = 'custom';
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
        var doc = document;
        var docEl = doc.documentElement;
        var isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        var isActive = doc.body.classList.contains('fullscreen-mode') || isFs;
        var shouldExit = forceExit === true || (forceExit === undefined && isActive);

        doc.body.classList.toggle('fullscreen-mode', !shouldExit);
        doc.body.classList.toggle('zen-mode', !shouldExit);

        // Native Browser Fullscreen to hide mobile browser address bar & top area
        try {
            if (!shouldExit && !isFs) {
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen().catch(function() {});
                } else if (docEl.webkitRequestFullscreen) {
                    docEl.webkitRequestFullscreen();
                } else if (docEl.msRequestFullscreen) {
                    docEl.msRequestFullscreen();
                }
            } else if (shouldExit && isFs) {
                if (doc.exitFullscreen) {
                    doc.exitFullscreen().catch(function() {});
                } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                } else if (doc.msExitFullscreen) {
                    doc.msExitFullscreen();
                }
            }
        } catch (_) {}

        if (DOM && DOM.btnFullscreen) {
            var icon = DOM.btnFullscreen.querySelector('span');
            if (icon) icon.innerText = shouldExit ? 'fullscreen' : 'fullscreen_exit';
        }
        if (shouldExit && typeof window.clearPresentationPen === 'function') {
            window.clearPresentationPen();
        }
        if (window.ResolutionEngine && typeof window.ResolutionEngine.showZenToast === 'function') {
            window.ResolutionEngine.showZenToast(!shouldExit);
        }
        setTimeout(function() {
            if (window.ResolutionEngine && window.ResolutionEngine.currentFocus && window.ResolutionEngine.currentFocus !== 'full') {
                window.ResolutionEngine.focusFrame(window.ResolutionEngine.currentFocus);
            } else if (window.centerView) {
                window.centerView(true);
            }
        }, 200);
    };

    window.setTool = function(t) {
        var state = window.state, DOM = window.DOM;
        if (!state || !DOM) return;
        state.tool = t;
        if (DOM.canvas) DOM.canvas.classList.toggle('hand-active', t === 'hand');
        var isMobile = (document.body.classList.contains('res-narrow') || window.innerWidth <= 960 || (window.innerHeight <= 600 && window.innerWidth <= 1050));
        if (DOM.iframe) DOM.iframe.style.pointerEvents = isMobile ? 'none' : (t === 'hand' ? 'none' : 'auto');
        if (DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = 'none';
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
            const isCombo = !!e.ctrlKey || !!e.metaKey || !!e.altKey;
            if (e.code === 'KeyV' && !isCombo) window.setTool('select');
            if (e.code === 'KeyH' && !isCombo) window.setTool('hand');
            if (e.code === 'KeyT' && !isCombo) { if (window.handleTextboxCreation) window.handleTextboxCreation(); }
            if (e.code === 'KeyF' && !isCombo) window.toggleFullscreen();
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
                        state.viewMode = 'custom';
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
            state.viewMode = 'custom';
            window.updateTransform();
        });

        window.addEventListener('mouseup', function() {
            var state = window.state;
            if (state) state.isDragging = false;
        });

        var _vpResizeTimer;
        var onVpResizeOrOrientation = function() {
            clearTimeout(_vpResizeTimer);
            _vpResizeTimer = setTimeout(function() {
                if (window.ResolutionEngine && window.ResolutionEngine.currentFocus && window.ResolutionEngine.currentFocus !== 'full') {
                    window.ResolutionEngine.focusFrame(window.ResolutionEngine.currentFocus);
                } else if (window.centerView) {
                    var isMobile = (window.innerWidth <= 960 || (window.innerHeight <= 600 && window.innerWidth <= 1050) || document.body.classList.contains('res-narrow'));
                    window.centerView(isMobile ? true : false);
                }
            }, 60);
            setTimeout(function() {
                if (window.ResolutionEngine && window.ResolutionEngine.currentFocus && window.ResolutionEngine.currentFocus !== 'full') {
                    window.ResolutionEngine.focusFrame(window.ResolutionEngine.currentFocus);
                } else if (window.centerView) {
                    var isMobile = (window.innerWidth <= 960 || (window.innerHeight <= 600 && window.innerWidth <= 1050) || document.body.classList.contains('res-narrow'));
                    if (isMobile) window.centerView(true);
                }
            }, 300);
        };
        window.addEventListener('resize', onVpResizeOrOrientation);
        window.addEventListener('orientationchange', onVpResizeOrOrientation);

        window.addEventListener('keydown', function(e) {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.target.classList.contains('v4-editable-cell') || (e.target.closest && e.target.closest('.ql-editor')))) {
                return;
            }
            var isCrispKey = (e.code === 'Backquote' || e.key === '`' || e.key === '~' || e.key === 'Home' || e.code === 'Home');
            if (isCrispKey && !e.ctrlKey && !e.metaKey) {
                if (window.toggleCrispView) {
                    e.preventDefault();
                    window.toggleCrispView();
                }
            }
        });

        if (window.MessageHub && typeof window.MessageHub.subscribe === 'function') {
            window.MessageHub.subscribe('LF_TOGGLE_CRISP_VIEW', function() {
                if (typeof window.toggleCrispView === 'function') {
                    window.toggleCrispView();
                }
            });
        }

        if (DOM && DOM.canvas && window.ResizeObserver) {
            const ro = new ResizeObserver(function(entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.contentRect.width > 100 && entry.contentRect.height > 100) {
                        if (window.ResolutionEngine && window.ResolutionEngine.currentFocus && window.ResolutionEngine.currentFocus !== 'full') {
                            window.ResolutionEngine.focusFrame(window.ResolutionEngine.currentFocus);
                        } else if (window.centerView) {
                            window.centerView(false);
                        }
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
