/**
 * assets/vctrl_resolution_engine.js
 * Pure Resolution-Driven Responsive Workspace Engine
 * 
 * Manages:
 * 1. Real-time Viewport Breakpoints (Wide >= 1200px, Compact 768-1199px, Narrow < 768px)
 * 2. Bottom Floating Action Dock & Bottom Sheet Screen Browser
 * 3. Native Touch Interaction Engine (Pinch-to-zoom, 1-finger pan, double-tap smart fit)
 * 4. Smart Frame Focus (Native 1:1 mobile frame preview)
 * 
 * Fully compliant with AGENTS.md 7 Mandatory Gateways:
 * - Device-Agnostic: Purely resolution-driven
 * - Zero Side-Effects on Desktop (>= 1200px)
 * - Safe optional chaining & zero runtime errors
 */

(function() {
    console.log("%c [VCTRL RESOLUTION ENGINE] Initializing Resolution Engine... ", "background: #06b6d4; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    var BREAKPOINTS = {
        NARROW_MAX: 900,
        COMPACT_MAX: 1200
    };

    var ResolutionEngine = {
        currentTier: 'wide', // 'wide' | 'compact' | 'narrow'
        currentFocus: 'full', // 'mobile' | 'pc' | 'full'
        isTouchDevice: false,
        _initialized: false,
        _resizeTimer: null,
        _touchState: {
            isTracking: false,
            touchCount: 0,
            startX: 0,
            startY: 0,
            tapStartX: 0,
            tapStartY: 0,
            tapStartTime: 0,
            hasMoved: false,
            initialDistance: 0,
            initialScale: 1,
            midX: 0,
            midY: 0,
            lastTapTime: 0
        },

        // --- 1. Initialization Pipeline ---
        init: function() {
            if (this._initialized) return;
            this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (this.isTouchDevice) {
                document.body.classList.add('touch-capable');
            }

            this.injectDOMElements();
            this.updateBreakpoint(true);
            this.initListeners();
            this.initTouchGestures();
            this.syncScreenList();
            this.checkAndInitFrameSwitcher();
            this._initialized = true;

            // Delayed sync guards for asynchronous metadata hydration & iframe load
            var self = this;
            setTimeout(function() { self.syncScreenList(); self.checkAndInitFrameSwitcher(); }, 400);
            setTimeout(function() { self.syncScreenList(); self.checkAndInitFrameSwitcher(); }, 1200);
            setTimeout(function() { self.syncScreenList(); self.checkAndInitFrameSwitcher(); }, 2500);

            console.log("[VCTRL RESOLUTION ENGINE] Initialized successfully. Current Tier:", this.currentTier);
        },

        // --- 2. DOM Injection (Bottom Dock & Bottom Sheet) ---
        injectDOMElements: function() {
            // Inject Bottom Dock if not present
            if (!document.getElementById('v4-bottom-dock')) {
                var dock = document.createElement('nav');
                dock.id = 'v4-bottom-dock';
                dock.className = 'v4-bottom-dock';
                dock.setAttribute('aria-label', '모바일 뷰어 컨트롤러');
                dock.innerHTML = 
                    '<button type="button" id="dock-btn-prev" class="v4-dock-btn" title="이전 화면">' +
                        '<span class="material-icons-outlined">chevron_left</span>' +
                    '</button>' +
                    '<button type="button" id="dock-btn-fullscreen" class="v4-dock-btn" title="전체화면 전환 (주소창 숨김)">' +
                        '<span class="material-icons-outlined" id="dock-fullscreen-icon">fullscreen</span>' +
                    '</button>' +
                    '<button type="button" id="dock-btn-fit" class="v4-dock-btn" title="화면 맞춤">' +
                        '<span class="material-icons-outlined">fit_screen</span>' +
                    '</button>' +
                    '<button type="button" id="dock-btn-crisp" class="v4-dock-btn" title="100% 선명 뷰">' +
                        '<span class="v4-dock-btn-txt" id="dock-zoom-txt">100%</span>' +
                    '</button>' +
                    '<button type="button" id="dock-btn-next" class="v4-dock-btn" title="다음 화면">' +
                        '<span class="material-icons-outlined">chevron_right</span>' +
                    '</button>' +
                    '<div class="v4-dock-divider"></div>' +
                    '<button type="button" id="dock-btn-screens" class="v4-dock-btn" title="화면 목록 (바텀 시트)">' +
                        '<span class="material-icons-outlined">layers</span>' +
                    '</button>';
                document.body.appendChild(dock);
            }

            // Inject Frame Switcher if not present
            if (!document.getElementById('v4-frame-switcher')) {
                var switcher = document.createElement('div');
                switcher.id = 'v4-frame-switcher';
                switcher.className = 'v4-frame-switcher';
                switcher.style.display = 'none';
                switcher.innerHTML = 
                    '<button type="button" class="v4-frame-switch-btn active" id="btn-focus-mobile" data-focus="mobile" title="모바일 앱 화면 1:1 확대 (실기기 핏)">' +
                        '<span class="material-icons-outlined">smartphone</span>' +
                        '<span>모바일 1:1</span>' +
                    '</button>' +
                    '<button type="button" class="v4-frame-switch-btn" id="btn-focus-pc" data-focus="pc" title="PC 웹 화면 핏">' +
                        '<span class="material-icons-outlined">desktop_windows</span>' +
                        '<span>PC 핏</span>' +
                    '</button>' +
                    '<button type="button" class="v4-frame-switch-btn" id="btn-focus-full" data-focus="full" title="전체 캔버스 보기">' +
                        '<span class="material-icons-outlined">aspect_ratio</span>' +
                        '<span>전체</span>' +
                    '</button>';
                document.body.appendChild(switcher);
            }

            // Inject Zen Mode Exit Floating Pill if not present
            if (!document.getElementById('v4-zen-exit-pill')) {
                var zenPill = document.createElement('button');
                zenPill.type = 'button';
                zenPill.id = 'v4-zen-exit-pill';
                zenPill.className = 'v4-zen-exit-pill';
                zenPill.title = '화면 UI 복원 (단축키: Esc 또는 탭)';
                zenPill.innerHTML = '<span class="material-icons-outlined" style="font-size:15px;">fullscreen_exit</span><span>UI 복원</span>';
                document.body.appendChild(zenPill);
            }

            // Inject Bottom Sheet Backdrop
            if (!document.getElementById('v4-bottom-sheet-backdrop')) {
                var backdrop = document.createElement('div');
                backdrop.id = 'v4-bottom-sheet-backdrop';
                backdrop.className = 'v4-bottom-sheet-backdrop';
                document.body.appendChild(backdrop);
            }

            // Inject Bottom Sheet Drawer
            if (!document.getElementById('v4-bottom-sheet')) {
                var sheet = document.createElement('aside');
                sheet.id = 'v4-bottom-sheet';
                sheet.className = 'v4-bottom-sheet';
                sheet.setAttribute('aria-label', '프로젝트 화면 목록 및 메타데이터');
                sheet.innerHTML = 
                    '<div class="v4-sheet-handle-bar" id="v4-sheet-handle">' +
                        '<div class="v4-sheet-handle-pill"></div>' +
                    '</div>' +
                    '<div class="v4-sheet-header">' +
                        '<div class="v4-sheet-title-group">' +
                            '<span class="material-icons-outlined v4-sheet-title-icon">dashboard</span>' +
                            '<span class="v4-sheet-title-text">프로젝트 스크린</span>' +
                            '<span class="v4-sheet-screen-count" id="v4-sheet-screen-count">0</span>' +
                        '</div>' +
                        '<button type="button" class="v4-sheet-close-btn" id="v4-sheet-close" title="닫기">' +
                            '<span class="material-icons-outlined">close</span>' +
                        '</button>' +
                    '</div>' +
                    '<div class="v4-sheet-meta-card">' +
                        '<div class="v4-sheet-meta-info">' +
                            '<span class="v4-sheet-meta-title" id="v4-sheet-meta-title">Project</span>' +
                            '<span class="v4-sheet-meta-sub" id="v4-sheet-meta-updated">최종 수정: -</span>' +
                        '</div>' +
                        '<div class="v4-sheet-meta-actions">' +
                            '<button type="button" id="v4-sheet-btn-history" class="v4-sheet-action-chip" title="재개정 이력">' +
                                '<span class="material-icons-outlined" style="font-size:15px;">history</span> 이력' +
                            '</button>' +
                            '<button type="button" id="v4-sheet-btn-pdf" class="v4-sheet-action-chip" title="PDF 다운로드">' +
                                '<span class="material-icons-outlined" style="font-size:15px;">picture_as_pdf</span> PDF' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="v4-sheet-body">' +
                        '<ul class="v4-sheet-list" id="v4-sheet-list"></ul>' +
                    '</div>';
                document.body.appendChild(sheet);
            }

            // Inject Mobile More Button into Toolbar if not present
            var toolbarActions = document.querySelector('.toolbar .actions');
            if (toolbarActions && !document.getElementById('btn-toolbar-mobile-more')) {
                var moreBtn = document.createElement('button');
                moreBtn.type = 'button';
                moreBtn.id = 'btn-toolbar-mobile-more';
                moreBtn.className = 'btn-toolbar-mobile-more';
                moreBtn.style.display = 'none';
                moreBtn.title = '더보기 메뉴';
                moreBtn.innerHTML = '<span class="material-icons-outlined">more_vert</span>';
                toolbarActions.appendChild(moreBtn);
            }
        },

        // --- 3. Viewport Resolution Watcher ---
        getResolutionTier: function() {
            var w = window.innerWidth;
            if (w <= BREAKPOINTS.NARROW_MAX) return 'narrow';
            if (w <= BREAKPOINTS.COMPACT_MAX) return 'compact';
            return 'wide';
        },

        updateBreakpoint: function(force) {
            var newTier = this.getResolutionTier();
            if (!force && newTier === this.currentTier) return;

            var oldTier = this.currentTier;
            this.currentTier = newTier;

            document.body.classList.remove('res-wide', 'res-compact', 'res-narrow');
            document.body.classList.add('res-' + newTier);

            // Auto-collapse sidebars when in narrow (<= 900px) or compact mode
            if (newTier === 'narrow' || newTier === 'compact') {
                var sidebarRight = document.getElementById('sidebar-right');
                if (sidebarRight && !sidebarRight.classList.contains('collapsed')) {
                    sidebarRight.classList.add('collapsed');
                    var btnRight = document.getElementById('btn-toggle-right');
                    if (btnRight) {
                        btnRight.classList.remove('active');
                        var iconRight = btnRight.querySelector('.material-icons-outlined, span');
                        if (iconRight) iconRight.innerText = 'chevron_left';
                    }
                }
                var sidebarLeft = document.getElementById('sidebar-left');
                if (sidebarLeft && !sidebarLeft.classList.contains('collapsed')) {
                    sidebarLeft.classList.add('collapsed');
                    var btnLeft = document.getElementById('btn-toggle-left');
                    if (btnLeft) {
                        btnLeft.classList.remove('active');
                        var iconLeft = btnLeft.querySelector('.material-icons-outlined, span');
                        if (iconLeft) iconLeft.innerText = 'menu_open';
                    }
                }
            }

            // Close bottom sheet if transitioning to wide desktop
            if (newTier === 'wide') {
                this.closeBottomSheet();
            }

            // Sync dock crisp button label with current scale
            this.syncDockZoom();

            // Refresh center view to expand canvas to full available width
            if (window.centerView && (force || oldTier !== newTier)) {
                setTimeout(function() {
                    window.centerView(true);
                }, 100);
            }
        },

        // --- 4. Event Wiring ---
        initListeners: function() {
            var self = this;

            // Debounced Window Resize
            window.addEventListener('resize', function() {
                clearTimeout(self._resizeTimer);
                self._resizeTimer = setTimeout(function() {
                    self.updateBreakpoint(false);
                }, 60);
            });

            // Bottom Dock Button Listeners
            var btnPrev = document.getElementById('dock-btn-prev');
            var btnNext = document.getElementById('dock-btn-next');
            var btnFullscreen = document.getElementById('dock-btn-fullscreen');
            var btnFit = document.getElementById('dock-btn-fit');
            var btnCrisp = document.getElementById('dock-btn-crisp');
            var btnScreens = document.getElementById('dock-btn-screens');
            var btnZenExit = document.getElementById('v4-zen-exit-pill');

            if (btnPrev) btnPrev.addEventListener('click', function() { self.navigateScreen(-1); });
            if (btnNext) btnNext.addEventListener('click', function() { self.navigateScreen(1); });
            if (btnFullscreen) btnFullscreen.addEventListener('click', function() { self.toggleFullscreen(); });
            if (btnZenExit) btnZenExit.addEventListener('click', function() { self.toggleZenMode(false); });
            if (btnFit) btnFit.addEventListener('click', function() {
                if (window.state) window.state.viewMode = 'fit';
                if (window.centerView) window.centerView(true);
                self.syncDockZoom();
                self.updateFocusButtonUI('full');
            });
            if (btnCrisp) btnCrisp.addEventListener('click', function() {
                if (window.toggleCrispView) window.toggleCrispView();
                self.syncDockZoom();
            });
            if (btnScreens) btnScreens.addEventListener('click', function() {
                self.toggleBottomSheet();
            });

            // Frame Switcher Buttons Listeners
            var btnFocusMobile = document.getElementById('btn-focus-mobile');
            var btnFocusPc = document.getElementById('btn-focus-pc');
            var btnFocusFull = document.getElementById('btn-focus-full');
            if (btnFocusMobile) btnFocusMobile.addEventListener('click', function() { self.focusFrame('mobile'); });
            if (btnFocusPc) btnFocusPc.addEventListener('click', function() { self.focusFrame('pc'); });
            if (btnFocusFull) btnFocusFull.addEventListener('click', function() { self.focusFrame('full'); });

            // Keyboard Escape for Zen Mode
            window.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.body.classList.contains('zen-mode')) {
                    self.toggleZenMode(false);
                }
            });

            // Native Fullscreen Change Listener
            var onFsChange = function() {
                var isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
                var fsIcon = document.getElementById('dock-fullscreen-icon');
                if (fsIcon) fsIcon.innerText = isFull ? 'fullscreen_exit' : 'fullscreen';
                if (btnFullscreen) {
                    btnFullscreen.classList.toggle('active', isFull);
                    btnFullscreen.title = isFull ? '전체화면 종료' : '전체화면 전환 (주소창 숨김)';
                }
                // If exited native fullscreen from system gesture, synchronize zen-mode
                if (!isFull && self.currentTier === 'narrow') {
                    document.body.classList.remove('zen-mode');
                }
                setTimeout(function() {
                    if (self.currentFocus === 'mobile') {
                        self.focusFrame('mobile');
                    } else if (self.currentFocus === 'pc') {
                        self.focusFrame('pc');
                    } else if (window.centerView) {
                        window.centerView(false);
                    }
                }, 200);
            };
            document.addEventListener('fullscreenchange', onFsChange);
            document.addEventListener('webkitfullscreenchange', onFsChange);

            // Bottom Sheet Close & Backdrop
            var backdrop = document.getElementById('v4-bottom-sheet-backdrop');
            var sheetClose = document.getElementById('v4-sheet-close');
            var handleBar = document.getElementById('v4-sheet-handle');

            if (backdrop) backdrop.addEventListener('click', function() { self.closeBottomSheet(); });
            if (sheetClose) sheetClose.addEventListener('click', function() { self.closeBottomSheet(); });
            if (handleBar) handleBar.addEventListener('click', function() { self.closeBottomSheet(); });

            // Sheet Meta Actions Proxy
            var sheetHistory = document.getElementById('v4-sheet-btn-history');
            var sheetPdf = document.getElementById('v4-sheet-btn-pdf');
            var sheetCopyUrl = document.getElementById('v4-sheet-btn-copy-url');
            if (sheetHistory) {
                sheetHistory.addEventListener('click', function() {
                    self.closeBottomSheet();
                    var origBtn = document.getElementById('btn-show-history');
                    if (origBtn) origBtn.click();
                });
            }
            if (sheetPdf) {
                sheetPdf.addEventListener('click', function() {
                    self.closeBottomSheet();
                    var origPdf = document.getElementById('btn-export-project-pdf');
                    if (origPdf) origPdf.click();
                });
            }
            if (sheetCopyUrl) {
                sheetCopyUrl.addEventListener('click', function() {
                    self.closeBottomSheet();
                    // Copy current screen or project URL
                    try {
                        navigator.clipboard.writeText(window.location.href).then(function() {
                            if (typeof window.showToast === 'function') {
                                window.showToast('화면 URL이 클립보드에 복사되었습니다.');
                            } else {
                                alert('화면 URL이 클립보드에 복사되었습니다.');
                            }
                        });
                    } catch (_) {
                        var origCopy = document.getElementById('btn-copy-project-url');
                        if (origCopy) origCopy.click();
                    }
                });
            }

            // Toolbar Mobile More Button
            var mobileMoreBtn = document.getElementById('btn-toolbar-mobile-more');
            if (mobileMoreBtn) {
                mobileMoreBtn.addEventListener('click', function() {
                    self.toggleBottomSheet();
                });
            }

            // Toolbar File Name Click on Mobile opens Bottom Sheet
            var fileNameDisplay = document.getElementById('file-name-display');
            if (fileNameDisplay) {
                fileNameDisplay.addEventListener('click', function() {
                    if (self.currentTier === 'narrow') {
                        self.toggleBottomSheet();
                    }
                });
            }

            // Listen to screen load events to re-sync bottom sheet & smart focus
            if (window.MessageHub && typeof window.MessageHub.subscribe === 'function') {
                window.MessageHub.subscribe('SCREEN_LOADED', function() {
                    self.syncScreenList();
                    self.checkAndInitFrameSwitcher();
                    self.attachIframeTapListener();
                });
                window.MessageHub.subscribe('SCREEN_CHANGED', function() {
                    self.syncScreenList();
                    self.checkAndInitFrameSwitcher();
                    self.attachIframeTapListener();
                });
            }

            // Fallback iframe load listener
            var DOM = window.DOM;
            if (DOM && DOM.iframe) {
                DOM.iframe.addEventListener('load', function() {
                    setTimeout(function() {
                        self.checkAndInitFrameSwitcher();
                        self.attachIframeTapListener();
                    }, 150);
                });
            }
        },

        // --- 5. Touch Gestures Engine (Pinch-to-zoom, 1-Finger Pan, Single-Tap Zen, Double-Tap) ---
        initTouchGestures: function() {
            var self = this;
            var canvas = document.getElementById('canvas');
            if (!canvas) return;

            var touchState = this._touchState;

            canvas.addEventListener('touchstart', function(e) {
                // Ignore touch on interactive UI overlays
                if (e.target.closest('#v4-bottom-dock, #v4-bottom-sheet, #v4-frame-switcher, #v4-zen-exit-pill, #floating-inspector-card, .modal-overlay, .dialog-card')) {
                    return;
                }

                touchState.touchCount = e.touches.length;

                if (e.touches.length === 1) {
                    var now = Date.now();
                    var timeDiff = now - touchState.lastTapTime;
                    touchState.lastTapTime = now;

                    var t = e.touches[0];
                    touchState.tapStartX = t.clientX;
                    touchState.tapStartY = t.clientY;
                    touchState.tapStartTime = now;
                    touchState.hasMoved = false;

                    // Double-tap detected (within 300ms)
                    if (timeDiff > 40 && timeDiff < 320) {
                        e.preventDefault();
                        if (window.toggleCrispView) {
                            window.toggleCrispView();
                            self.syncDockZoom();
                        }
                        return;
                    }

                    // 1-Finger Pan Initiation
                    var state = window.state;
                    if (state && state.transform) {
                        touchState.isTracking = true;
                        touchState.startX = t.clientX - state.transform.x;
                        touchState.startY = t.clientY - state.transform.y;
                    }
                } else if (e.touches.length === 2) {
                    // Pinch Zoom Initiation
                    e.preventDefault();
                    touchState.hasMoved = true;
                    touchState.isTracking = true;
                    var t1 = e.touches[0], t2 = e.touches[1];
                    var dx = t1.clientX - t2.clientX;
                    var dy = t1.clientY - t2.clientY;
                    touchState.initialDistance = Math.hypot(dx, dy);

                    var state = window.state;
                    touchState.initialScale = (state && state.transform && state.transform.scale) || 1.0;

                    var rect = canvas.getBoundingClientRect();
                    touchState.midX = ((t1.clientX + t2.clientX) / 2) - rect.left;
                    touchState.midY = ((t1.clientY + t2.clientY) / 2) - rect.top;
                }
            }, { passive: false });

            canvas.addEventListener('touchmove', function(e) {
                if (!touchState.isTracking) return;

                var state = window.state;
                if (!state || !state.transform) return;

                if (e.touches.length === 1 && touchState.touchCount === 1) {
                    var t = e.touches[0];
                    if (Math.hypot(t.clientX - touchState.tapStartX, t.clientY - touchState.tapStartY) > 8) {
                        touchState.hasMoved = true;
                    }

                    // 1-Finger Pan in progress (Only if in narrow mode or hand mode)
                    if (self.currentTier === 'narrow' || state.tool === 'hand' || state.isHandMode) {
                        e.preventDefault();
                        state.transform.x = Math.round(t.clientX - touchState.startX);
                        state.transform.y = Math.round(t.clientY - touchState.startY);
                        state.viewMode = 'custom';
                        if (window.updateTransform) window.updateTransform();
                    }
                } else if (e.touches.length === 2) {
                    // Pinch Zoom in progress
                    touchState.hasMoved = true;
                    e.preventDefault();
                    var t1 = e.touches[0], t2 = e.touches[1];
                    var currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                    if (touchState.initialDistance > 0) {
                        var factor = currentDist / touchState.initialDistance;
                        var newScale = Math.max(0.15, Math.min(touchState.initialScale * factor, 8.0));

                        var s = state.transform.scale;
                        var mx = touchState.midX, my = touchState.midY;

                        state.transform.x = Math.round(mx - (mx - state.transform.x) * (newScale / s));
                        state.transform.y = Math.round(my - (my - state.transform.y) * (newScale / s));
                        state.transform.scale = newScale;
                        state.viewMode = 'custom';

                        if (window.updateTransform) window.updateTransform();
                        self.syncDockZoom();
                    }
                }
            }, { passive: false });

            canvas.addEventListener('touchend', function(e) {
                if (e.touches.length === 0) {
                    var elapsed = Date.now() - (touchState.tapStartTime || 0);
                    var t = (e.changedTouches && e.changedTouches[0]) || null;
                    var deltaX = t ? (t.clientX - touchState.tapStartX) : 0;
                    var deltaY = t ? (t.clientY - touchState.tapStartY) : 0;

                    // Swipe left / right to navigate screens on mobile
                    if (self.currentTier === 'narrow' && Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.8 && elapsed < 400) {
                        if (deltaX < 0) {
                            self.navigateScreen(1); // Swipe left -> Next screen
                        } else {
                            self.navigateScreen(-1); // Swipe right -> Prev screen
                        }
                    } else if (!touchState.hasMoved && elapsed > 30 && elapsed < 280) {
                        // Single tap detection (no significant drag and quick release)
                        self.handleSingleTap();
                    }

                    touchState.isTracking = false;
                    touchState.touchCount = 0;
                    touchState.initialDistance = 0;
                } else if (e.touches.length === 1) {
                    // Transitioned from 2 fingers to 1 finger
                    touchState.touchCount = 1;
                    var t = e.touches[0];
                    var state = window.state;
                    if (state && state.transform) {
                        touchState.startX = t.clientX - state.transform.x;
                        touchState.startY = t.clientY - state.transform.y;
                    }
                }
            });

            // Fallback click listener for simulated mouse click in device preview
            canvas.addEventListener('click', function(e) {
                if (e.target.closest('#v4-bottom-dock, #v4-bottom-sheet, #v4-frame-switcher, #v4-zen-exit-pill, #floating-inspector-card, .modal-overlay, .dialog-card, .toolbar')) {
                    return;
                }
                if (self.currentTier === 'narrow') {
                    if (Date.now() - (touchState.tapStartTime || 0) > 350) {
                        self.handleSingleTap();
                    }
                }
            });
        },

        // --- 6. Screen Navigation Pipeline ---
        getScreensList: function() {
            var state = window.state;
            if (state && state.screens && Array.isArray(state.screens) && state.screens.length > 0) {
                return state.screens;
            }
            if (state && state.projectMetadata && state.projectMetadata.screens) {
                var order = state.projectMetadata.screenOrder;
                if (Array.isArray(order) && order.length > 0) {
                    var result = [];
                    for (var i = 0; i < order.length; i++) {
                        var oName = order[i];
                        var oMeta = state.projectMetadata.screens[oName] || {};
                        result.push({ name: oName, title: oMeta.title || oName, desc: oMeta.desc || '' });
                    }
                    if (result.length > 0) return result;
                }
                var keys = Object.keys(state.projectMetadata.screens);
                if (keys.length > 0) {
                    var kResult = [];
                    for (var k = 0; k < keys.length; k++) {
                        var kName = keys[k];
                        var kMeta = state.projectMetadata.screens[kName] || {};
                        kResult.push({ name: kName, title: kMeta.title || kName, desc: kMeta.desc || '' });
                    }
                    return kResult;
                }
            }
            // DOM fallback from sidebar screens list
            var domItems = document.querySelectorAll('#screens-list .screen-item');
            if (domItems && domItems.length > 0) {
                var dArr = [];
                for (var d = 0; d < domItems.length; d++) {
                    var dName = domItems[d].getAttribute('data-screen-name') || '';
                    if (dName) dArr.push({ name: dName });
                }
                if (dArr.length > 0) return dArr;
            }
            return [];
        },

        getActiveScreenIndex: function() {
            var state = window.state;
            var screens = this.getScreensList();
            if (screens.length === 0) return -1;

            var activeName = (state && state.activeFile && state.activeFile.name) || '';
            if (!activeName && window.location.search) {
                try {
                    var params = new URLSearchParams(window.location.search);
                    activeName = params.get('file') || '';
                } catch (_) {}
            }
            if (!activeName) return 0;

            var normActive = activeName.toLowerCase().replace(/\.html$/i, '');
            for (var i = 0; i < screens.length; i++) {
                var s = screens[i];
                var sName = typeof s === 'string' ? s : (s.name || s.file || '');
                var normS = sName.toLowerCase().replace(/\.html$/i, '');
                if (normS === normActive) return i;
            }
            return -1;
        },

        navigateScreen: function(direction) {
            var screens = this.getScreensList();
            if (screens.length === 0) return;
            var curIdx = this.getActiveScreenIndex();
            if (curIdx === -1) curIdx = 0;

            var nextIdx = curIdx + direction;
            // Circular wrap-around: Last -> First, First -> Last
            if (nextIdx < 0) {
                nextIdx = screens.length - 1;
            } else if (nextIdx >= screens.length) {
                nextIdx = 0;
            }

            var target = screens[nextIdx];
            var targetFile = typeof target === 'string' ? target : (target.name || target.file);
            if (!targetFile) return;

            if (typeof window.loadScreen === 'function') {
                window.loadScreen(targetFile);
            }
            if (typeof window.updateActiveScreenInUI === 'function') {
                window.updateActiveScreenInUI(targetFile);
            }

            // Sync URL query string without page reload
            try {
                var url = new URL(window.location.href);
                url.searchParams.set('file', targetFile);
                window.history.replaceState(null, '', url.toString());
            } catch (_) {}

            this.syncScreenList();
        },

        // --- 7. Bottom Sheet Screen Browser Control ---
        openBottomSheet: function() {
            this.syncScreenList();
            var sheet = document.getElementById('v4-bottom-sheet');
            var backdrop = document.getElementById('v4-bottom-sheet-backdrop');
            if (sheet) sheet.classList.add('is-open');
            if (backdrop) backdrop.classList.add('is-open');
        },

        closeBottomSheet: function() {
            var sheet = document.getElementById('v4-bottom-sheet');
            var backdrop = document.getElementById('v4-bottom-sheet-backdrop');
            if (sheet) sheet.classList.remove('is-open');
            if (backdrop) backdrop.classList.remove('is-open');
        },

        toggleBottomSheet: function() {
            var sheet = document.getElementById('v4-bottom-sheet');
            if (sheet && sheet.classList.contains('is-open')) {
                this.closeBottomSheet();
            } else {
                this.openBottomSheet();
            }
        },

        syncScreenList: function() {
            var self = this;
            var screens = this.getScreensList();
            var curIdx = this.getActiveScreenIndex();

            // Update Screen Count
            var countEl = document.getElementById('v4-sheet-screen-count');
            if (countEl) countEl.innerText = String(screens.length);

            // Update Metadata Info in Sheet
            var metaTitle = document.getElementById('v4-sheet-meta-title');
            var metaUpdated = document.getElementById('v4-sheet-meta-updated');
            var origUpdated = document.getElementById('meta-updated-txt');
            if (metaTitle && window.state) {
                var activeName = (window.state.activeFile && window.state.activeFile.name) || '';
                var scMeta = (window.state.projectMetadata && window.state.projectMetadata.screens && activeName)
                    ? window.state.projectMetadata.screens[activeName]
                    : null;
                var displayTitle = (scMeta && scMeta.title) || (window.state.projectMetadata && window.state.projectMetadata.title) || activeName || 'Project';
                metaTitle.innerText = displayTitle;
                metaTitle.title = displayTitle;
            }
            if (metaUpdated && origUpdated) {
                metaUpdated.innerText = origUpdated.innerText;
            }

            // Update Dock Prev/Next Disabled State:
            // If more than 1 screen exists, both are enabled for circular navigation!
            var btnPrev = document.getElementById('dock-btn-prev');
            var btnNext = document.getElementById('dock-btn-next');
            var hasMultiple = (screens.length > 1);
            if (btnPrev) btnPrev.disabled = !hasMultiple;
            if (btnNext) btnNext.disabled = !hasMultiple;

            // Update Page Indicator in Bottom Pill
            var pageIndicator = document.getElementById('dock-page-indicator');
            if (pageIndicator) {
                var curNum = (curIdx >= 0) ? (curIdx + 1 < 10 ? '0' + (curIdx + 1) : (curIdx + 1)) : '01';
                var totNum = (screens.length < 10 ? '0' + screens.length : screens.length);
                pageIndicator.innerText = curNum + ' / ' + totNum;
            }

            // Render Sheet List Items
            var listEl = document.getElementById('v4-sheet-list');
            if (!listEl) return;
            listEl.innerHTML = '';

            for (var i = 0; i < screens.length; i++) {
                var s = screens[i];
                var sName = typeof s === 'string' ? s : (s.name || s.file || ('Screen ' + (i + 1)));
                var sMeta = (window.state && window.state.projectMetadata && window.state.projectMetadata.screens) 
                    ? window.state.projectMetadata.screens[sName] 
                    : null;
                var sTitle = (sMeta && sMeta.title) ? sMeta.title : ((typeof s === 'object' && s.title) ? s.title : sName.replace(/\.html$/i, ''));
                var sDesc = (sMeta && sMeta.desc) ? sMeta.desc : ((typeof s === 'object' && s.desc) ? s.desc : '');
                var isActive = (i === curIdx);

                var li = document.createElement('li');
                li.className = 'v4-sheet-item' + (isActive ? ' active' : '');
                li.setAttribute('data-screen-file', sName);
                li.innerHTML = 
                    '<span class="v4-sheet-item-num">' + (i + 1 < 10 ? '0' + (i + 1) : (i + 1)) + '</span>' +
                    '<div class="v4-sheet-item-content">' +
                        '<div class="v4-sheet-item-title" title="' + sTitle + '">' + sTitle + '</div>' +
                        (sDesc ? '<div class="v4-sheet-item-desc">' + sDesc + '</div>' : '') +
                    '</div>' +
                    (isActive ? '<span class="v4-sheet-item-badge">현재 화면</span>' : '');

                (function(targetFile) {
                    li.addEventListener('click', function() {
                        self.closeBottomSheet();
                        if (typeof window.loadScreen === 'function') {
                            window.loadScreen(targetFile);
                        }
                        if (typeof window.updateActiveScreenInUI === 'function') {
                            window.updateActiveScreenInUI(targetFile);
                        }
                        try {
                            var url = new URL(window.location.href);
                            url.searchParams.set('file', targetFile);
                            window.history.replaceState(null, '', url.toString());
                        } catch (_) {}
                        self.syncScreenList();
                    });
                })(sName);

                listEl.appendChild(li);
            }
        },

        syncDockZoom: function() {
            var txt = document.getElementById('dock-zoom-txt');
            var state = window.state;
            if (txt && state && state.transform) {
                txt.innerText = Math.round(state.transform.scale * 100) + '%';
            }
        },

        // --- 8. Smart Frame Focus (Native 1:1 Mobile Frame Preview) ---
        getFrameElements: function() {
            var DOM = window.DOM;
            if (!DOM || !DOM.iframe) return { mobile: null, pc: null };
            try {
                var doc = DOM.iframe.contentDocument;
                if (!doc) return { mobile: null, pc: null };

                var mobileEl = doc.querySelector('.frame-column.mobile-column') || 
                               doc.querySelector('.mobile-frame') || 
                               doc.querySelector('.mobile-browser-frame') || 
                               doc.querySelector('.mobile-column-left') || 
                               doc.querySelector('.mobile-content-inner') ||
                               doc.querySelector('[data-frame="mobile"]');

                var pcEl = doc.querySelector('.frame-column.pc-column') || 
                           doc.querySelector('.pc-browser-frame') || 
                           doc.querySelector('.pc-frame') || 
                           doc.querySelector('.pc-content-inner') ||
                           doc.querySelector('[data-frame="pc"]');

                return { mobile: mobileEl, pc: pcEl, doc: doc };
            } catch (_) {
                return { mobile: null, pc: null };
            }
        },

        checkAndInitFrameSwitcher: function() {
            var switcher = document.getElementById('v4-frame-switcher');
            if (!switcher) return;

            var frames = this.getFrameElements();
            var hasMobile = !!frames.mobile;

            if (hasMobile) {
                switcher.classList.add('is-available');
                // On narrow tier, default focus to mobile 1:1 on initial load or if not explicitly set
                if (this.currentTier === 'narrow' && (!this.currentFocus || this.currentFocus === 'mobile')) {
                    this.focusFrame('mobile');
                } else if (this.currentFocus) {
                    this.updateFocusButtonUI(this.currentFocus);
                }
            } else {
                switcher.classList.remove('is-available');
                this.currentFocus = 'full';
                this.updateFocusButtonUI('full');
            }
        },

        focusFrame: function(type) {
            this.currentFocus = type;
            this.updateFocusButtonUI(type);

            if (type === 'full') {
                if (window.centerView) window.centerView(true);
                this.syncDockZoom();
                return;
            }

            var DOM = window.DOM;
            if (!DOM || !DOM.canvas || !window.state || !window.state.transform) return;

            var frames = this.getFrameElements();
            var targetEl = (type === 'mobile') ? frames.mobile : frames.pc;
            if (!targetEl) {
                if (window.centerView) window.centerView(true);
                return;
            }

            // Calculate element offset inside iframe relative to body
            var left = 0, top = 0;
            var curr = targetEl;
            var body = (frames.doc && frames.doc.body) || (curr && curr.ownerDocument && curr.ownerDocument.body);
            while (curr && curr !== body) {
                left += curr.offsetLeft || 0;
                top += curr.offsetTop || 0;
                curr = curr.offsetParent;
            }

            var elW = targetEl.offsetWidth || (type === 'mobile' ? 375 : 1160);
            var cw = DOM.canvas.clientWidth;
            var ch = DOM.canvas.clientHeight;
            if (cw <= 0) return;

            var scale, x, y;
            if (type === 'mobile') {
                // Smartphone 1:1 native app scale (clamped to fit canvas width with 8px margin)
                scale = Math.min((cw - 8) / elW, 1.15);
                if (cw >= 375 && scale >= 0.95 && scale <= 1.08) {
                    scale = 1.0; // Crisp 1:1 pixel snap
                }
                x = Math.round((cw / 2) - (left + (elW / 2)) * scale);
                var topPad = document.body.classList.contains('zen-mode') ? 10 : 8;
                y = Math.round(topPad - top * scale);
            } else {
                // PC Web Frame fit to canvas width
                scale = Math.min((cw - 16) / elW, 0.95);
                x = Math.round((cw / 2) - (left + (elW / 2)) * scale);
                var pcTopPad = document.body.classList.contains('zen-mode') ? 12 : 10;
                y = Math.round(pcTopPad - top * scale);
            }

            var state = window.state;
            state.transform.x = x;
            state.transform.y = y;
            state.transform.scale = scale;
            state.viewMode = 'custom';

            if (window.updateTransform) window.updateTransform();
            this.syncDockZoom();

            console.log("[VCTRL RESOLUTION ENGINE] Frame Focused:", type, "Scale:", scale, "x:", x, "y:", y);
        },

        updateFocusButtonUI: function(type) {
            var buttons = document.querySelectorAll('.v4-frame-switch-btn');
            buttons.forEach(function(b) {
                b.classList.toggle('active', b.getAttribute('data-focus') === type);
            });
        },

        checkAndApplyNativeFrameFocus: function() {
            this.checkAndInitFrameSwitcher();
        },

        // --- 9. Fullscreen API & Tap-to-Hide Immersive Zen View ---
        toggleFullscreen: function() {
            var doc = document;
            var docEl = doc.documentElement;
            var isFull = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);

            if (!isFull) {
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen().catch(function() {});
                } else if (docEl.webkitRequestFullscreen) {
                    docEl.webkitRequestFullscreen();
                } else if (docEl.msRequestFullscreen) {
                    docEl.msRequestFullscreen();
                }
                // Automatically enter Zen Mode when entering fullscreen on mobile
                if (this.currentTier === 'narrow') {
                    this.toggleZenMode(true);
                }
            } else {
                if (doc.exitFullscreen) {
                    doc.exitFullscreen().catch(function() {});
                } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                } else if (doc.msExitFullscreen) {
                    doc.msExitFullscreen();
                }
                this.toggleZenMode(false);
            }
        },

        toggleZenMode: function(forceState) {
            var doc = document;
            var isCurrentlyZen = doc.body.classList.contains('zen-mode');
            var nextZen = (typeof forceState === 'boolean') ? forceState : !isCurrentlyZen;

            doc.body.classList.toggle('zen-mode', nextZen);

            // 🌟 In-App Zen Mode Feedback Toast: "화면을 터치하면 전체보기가 취소됩니다."
            this.showZenToast(nextZen);

            var self = this;
            setTimeout(function() {
                if (self.currentFocus === 'mobile') {
                    self.focusFrame('mobile');
                } else if (self.currentFocus === 'pc') {
                    self.focusFrame('pc');
                } else if (window.centerView) {
                    // Do not force reset transform so user zoom/pinch is preserved
                    window.centerView(false);
                }
            }, 100);
        },

        showZenToast: function(isZen) {
            var toast = document.getElementById('v4-zen-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'v4-zen-toast';
                toast.className = 'v4-zen-toast';
                toast.innerHTML = '<span class="material-icons-outlined" style="font-size: 16px;">touch_app</span>' +
                                  '<span>화면을 터치하면 전체보기가 취소됩니다.</span>';
                document.body.appendChild(toast);
            }

            clearTimeout(this._zenToastTimer);

            if (isZen) {
                toast.classList.add('show');
                this._zenToastTimer = setTimeout(function() {
                    toast.classList.remove('show');
                }, 2200);
            } else {
                toast.classList.remove('show');
            }
        },

        handleSingleTap: function() {
            // Single tap toggles Zen Mode on narrow mobile screens, or exits Zen Mode if active
            if (this.currentTier === 'narrow' || document.body.classList.contains('zen-mode')) {
                this.toggleZenMode();
            }
        },

        attachIframeTapListener: function() {
            var DOM = window.DOM;
            if (!DOM || !DOM.iframe) return;
            try {
                var doc = DOM.iframe.contentDocument;
                if (!doc || doc._zenTapWired) return;
                var self = this;
                var ifTouch = { x: 0, y: 0, time: 0, moved: false };

                doc.addEventListener('touchstart', function(e) {
                    if (e.touches.length === 1) {
                        ifTouch.x = e.touches[0].clientX;
                        ifTouch.y = e.touches[0].clientY;
                        ifTouch.time = Date.now();
                        ifTouch.moved = false;
                    }
                }, { passive: true });

                doc.addEventListener('touchmove', function(e) {
                    if (e.touches.length === 1) {
                        if (Math.hypot(e.touches[0].clientX - ifTouch.x, e.touches[0].clientY - ifTouch.y) > 8) {
                            ifTouch.moved = true;
                        }
                    }
                }, { passive: true });

                doc.addEventListener('touchend', function(e) {
                    var elapsed = Date.now() - ifTouch.time;
                    if (!ifTouch.moved && elapsed > 30 && elapsed < 280) {
                        // Tapping anywhere inside slide toggles Zen Mode & Fullscreen
                        self.handleSingleTap();
                    }
                }, { passive: true });

                doc.addEventListener('click', function(e) {
                    if (self.currentTier === 'narrow') {
                        if (Date.now() - ifTouch.time > 350) {
                            self.handleSingleTap();
                        }
                    }
                });

                doc._zenTapWired = true;
            } catch (_) {}
        }
    };

    window.ResolutionEngine = ResolutionEngine;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', function() {
            ResolutionEngine.init();
        });
    } else {
        ResolutionEngine.init();
    }
})();
