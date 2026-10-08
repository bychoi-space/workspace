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
        _userSelectedFocus: null, // 'mobile' | 'pc' | 'full' | null
        isTouchDevice: false,
        _initialized: false,
        _resizeTimer: null,
        _touchState: {
            isTracking: false,
            touchCount: 0,
            wasPinching: false,
            startX: 0,
            startY: 0,
            tapStartX: 0,
            tapStartY: 0,
            tapStartTime: 0,
            hasMoved: false,
            initialDistance: 0,
            initialScale: 1,
            initialContentX: 0,
            initialContentY: 0,
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
            this.attachIframeTapListener();
            this._initialized = true;

            // Delayed sync guards for asynchronous metadata hydration & iframe load
            var self = this;
            setTimeout(function() { self.syncScreenList(); self.checkAndInitFrameSwitcher(); self.attachIframeTapListener(); }, 400);
            setTimeout(function() { self.syncScreenList(); self.checkAndInitFrameSwitcher(); self.attachIframeTapListener(); }, 1200);
            setTimeout(function() { self.syncScreenList(); self.checkAndInitFrameSwitcher(); self.attachIframeTapListener(); }, 2500);

            console.log("[VCTRL RESOLUTION ENGINE] Initialized successfully. Current Tier:", this.currentTier);
        },

        // --- 2. DOM Injection (Bottom Dock & Bottom Sheet) ---
        injectDOMElements: function() {
            // Inject Navigation Controls (Left Arrow, Right Arrow, Bottom Page Indicator) directly into body
            var btnPrev = document.getElementById('dock-btn-prev');
            if (!btnPrev) {
                btnPrev = document.createElement('button');
                btnPrev.type = 'button';
                btnPrev.id = 'dock-btn-prev';
                btnPrev.className = 'v4-edge-nav-btn v4-edge-nav-prev';
                btnPrev.setAttribute('aria-label', '이전 화면');
                btnPrev.title = '이전 화면';
                btnPrev.innerHTML = '<span class="material-icons-outlined">chevron_left</span>';
                document.body.appendChild(btnPrev);
            } else if (btnPrev.parentNode !== document.body) {
                document.body.appendChild(btnPrev);
            }

            var btnNext = document.getElementById('dock-btn-next');
            if (!btnNext) {
                btnNext = document.createElement('button');
                btnNext.type = 'button';
                btnNext.id = 'dock-btn-next';
                btnNext.className = 'v4-edge-nav-btn v4-edge-nav-next';
                btnNext.setAttribute('aria-label', '다음 화면');
                btnNext.title = '다음 화면';
                btnNext.innerHTML = '<span class="material-icons-outlined">chevron_right</span>';
                document.body.appendChild(btnNext);
            } else if (btnNext.parentNode !== document.body) {
                document.body.appendChild(btnNext);
            }

            var indicator = document.getElementById('dock-page-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'dock-page-indicator';
                indicator.className = 'v4-edge-page-indicator';
                indicator.innerText = '01 / 01';
                document.body.appendChild(indicator);
            } else if (indicator.parentNode !== document.body) {
                document.body.appendChild(indicator);
            }

            // Hidden dummy container for legacy compatibility
            if (!document.getElementById('v4-bottom-dock')) {
                var dock = document.createElement('div');
                dock.id = 'v4-bottom-dock';
                dock.style.display = 'none';
                document.body.appendChild(dock);
            }

            // Inject Frame Switcher if not present
            if (!document.getElementById('v4-frame-switcher')) {
                var switcher = document.createElement('div');
                switcher.id = 'v4-frame-switcher';
                switcher.className = 'v4-frame-switcher';
                switcher.style.display = 'none';
                switcher.innerHTML = 
                    '<button type="button" class="v4-frame-switch-btn is-hidden" id="btn-focus-mobile" data-focus="mobile" title="모바일 핏 (세로형)" style="display: none !important;">' +
                        '<span class="material-icons-outlined">smartphone</span>' +
                    '</button>' +
                    '<button type="button" class="v4-frame-switch-btn is-hidden" id="btn-focus-pc" data-focus="pc" title="PC 핏 (가로형)" style="display: none !important;">' +
                        '<span class="material-icons-outlined">desktop_windows</span>' +
                    '</button>' +
                    '<button type="button" class="v4-frame-switch-btn active" id="btn-focus-full" data-focus="full" title="전체 화면 핏">' +
                        '<span class="material-icons-outlined">aspect_ratio</span>' +
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

        getResolutionTier: function() {
            var w = window.innerWidth;
            var h = window.innerHeight;
            var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

            // Any smartphone or tablet in landscape (height <= 600px and width <= 1050px)
            // or any narrow screen (width <= 960px) or touch device with height <= 550px is treated as 'narrow'!
            if (w <= 960 || (h <= 600 && w <= 1050) || (isTouch && h <= 550)) {
                return 'narrow';
            }
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

            // Mobile read-only mode: disable iframe pointer events to prevent object selection & enable canvas gestures
            var iframe = (window.DOM && window.DOM.iframe) || document.getElementById('main-iframe');
            if (iframe) {
                iframe.style.pointerEvents = (newTier === 'narrow') ? 'none' : 'auto';
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

            // Debounced Window Resize & Orientation Change Auto-Fit
            var onResizeOrOrientation = function() {
                clearTimeout(self._resizeTimer);
                self._resizeTimer = setTimeout(function() {
                    self.updateBreakpoint(true);
                    if (self.currentFocus && self.currentFocus !== 'full') {
                        self.focusFrame(self.currentFocus);
                    } else if (window.centerView) {
                        window.centerView(true);
                    }
                }, 80);
                setTimeout(function() {
                    self.updateBreakpoint(true);
                    if (self.currentFocus && self.currentFocus !== 'full') {
                        self.focusFrame(self.currentFocus);
                    } else if (window.centerView) {
                        window.centerView(true);
                    }
                }, 320);
            };

            window.addEventListener('resize', onResizeOrOrientation);
            window.addEventListener('orientationchange', onResizeOrOrientation);
            if (window.screen && window.screen.orientation && window.screen.orientation.addEventListener) {
                window.screen.orientation.addEventListener('change', onResizeOrOrientation);
            }

            // Bottom Dock Button Listeners
            var btnPrev = document.getElementById('dock-btn-prev');
            var btnNext = document.getElementById('dock-btn-next');
            var btnFullscreen = document.getElementById('dock-btn-fullscreen');
            var btnFit = document.getElementById('dock-btn-fit');
            var btnCrisp = document.getElementById('dock-btn-crisp');
            var btnScreens = document.getElementById('dock-btn-screens');
            var btnZenExit = document.getElementById('v4-zen-exit-pill');

            if (btnPrev) {
                btnPrev.addEventListener('click', function(e) {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    self.navigateScreen(-1);
                });
                btnPrev.addEventListener('touchstart', function(e) {
                    if (e) e.stopPropagation();
                }, { passive: true });
            }
            if (btnNext) {
                btnNext.addEventListener('click', function(e) {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    self.navigateScreen(1);
                });
                btnNext.addEventListener('touchstart', function(e) {
                    if (e) e.stopPropagation();
                }, { passive: true });
            }
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
            if (btnFocusMobile) {
                btnFocusMobile.addEventListener('click', function(e) {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    self._userSelectedFocus = 'mobile';
                    self.focusFrame('mobile');
                });
            }
            if (btnFocusPc) {
                btnFocusPc.addEventListener('click', function(e) {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    self._userSelectedFocus = 'pc';
                    self.focusFrame('pc');
                });
            }
            if (btnFocusFull) {
                btnFocusFull.addEventListener('click', function(e) {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    self._userSelectedFocus = 'full';
                    self.focusFrame('full');
                });
            }

            // Canvas mouse wheel vertical scroll handler when focused on frame
            var canvasEl = document.getElementById('canvas');
            if (canvasEl) {
                canvasEl.addEventListener('wheel', function(e) {
                    if (e.ctrlKey || e.metaKey) return;
                    if (self.currentFocus === 'mobile' || self.currentFocus === 'pc') {
                        var scrollEl = self.getActiveScrollContainer();
                        if (scrollEl) {
                            e.preventDefault();
                            scrollEl.scrollTop += Math.round(e.deltaY);
                            return;
                        }
                    }
                }, { passive: false });
            }

            // Keyboard Escape for Zen Mode
            window.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.body.classList.contains('zen-mode')) {
                    self.toggleZenMode(false);
                }
            });

            // Native Fullscreen Change Listener
            var onFsChange = function() {
                var isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
                document.body.classList.toggle('fullscreen-mode', isFull);
                document.body.classList.toggle('zen-mode', isFull);

                var fsIcon = document.getElementById('dock-fullscreen-icon');
                if (fsIcon) fsIcon.innerText = isFull ? 'fullscreen_exit' : 'fullscreen';
                var btnFullscreen = document.getElementById('btn-fullscreen-toggle') || document.getElementById('dock-btn-fullscreen');
                if (btnFullscreen) {
                    btnFullscreen.classList.toggle('active', isFull);
                    var icon = btnFullscreen.querySelector('span');
                    if (icon) icon.innerText = isFull ? 'fullscreen_exit' : 'fullscreen';
                }
                setTimeout(function() {
                    if (self.currentFocus && self.currentFocus !== 'full') {
                        self.focusFrame(self.currentFocus);
                    } else if (window.centerView) {
                        window.centerView(true);
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
                    self._userSelectedFocus = null;
                    self.syncScreenList();
                    self.checkAndInitFrameSwitcher();
                    self.attachIframeTapListener();
                });
                window.MessageHub.subscribe('SCREEN_CHANGED', function() {
                    self._userSelectedFocus = null;
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
                if (e.target.closest('#dock-btn-prev, #dock-btn-next, #dock-page-indicator, #v4-bottom-dock, #v4-bottom-sheet, #v4-frame-switcher, #v4-zen-exit-pill, #floating-inspector-card, .modal-overlay, .dialog-card, .toolbar')) {
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
                    touchState.lastClientX = t.clientX;
                    touchState.lastClientY = t.clientY;
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
                    if (e.cancelable) e.preventDefault();
                    touchState.touchCount = 2;
                    touchState.wasPinching = true;
                    touchState.hasMoved = true;
                    touchState.isTracking = true;
                    var t1 = e.touches[0], t2 = e.touches[1];
                    var dx = t1.clientX - t2.clientX;
                    var dy = t1.clientY - t2.clientY;
                    touchState.initialDistance = Math.hypot(dx, dy);

                    var state = window.state;
                    touchState.initialScale = (state && state.transform && state.transform.scale) || 1.0;
                    touchState.initialContentX = (state && state.transform && state.transform.x) || 0;
                    touchState.initialContentY = (state && state.transform && state.transform.y) || 0;

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

                    // Direct internal scroll when focused on mobile or pc frame
                    if (self.currentFocus === 'mobile' || self.currentFocus === 'pc') {
                        var scrollEl = self.getActiveScrollContainer();
                        if (scrollEl) {
                            if (e.cancelable) e.preventDefault();
                            var dy = touchState.lastClientY - t.clientY;
                            touchState.lastClientY = t.clientY;
                            touchState.lastClientX = t.clientX;
                            scrollEl.scrollTop += dy;
                            return;
                        }
                    }

                    // 1-Finger Pan in progress (Canvas stage panning when in full view or hand mode)
                    if (self.currentTier === 'narrow' || self.isTouchDevice || state.tool === 'hand' || state.isHandMode) {
                        if (e.cancelable) e.preventDefault();
                        state.transform.y = Math.round(t.clientY - touchState.startY);
                        state.transform.x = Math.round(t.clientX - touchState.startX);
                        state.viewMode = 'custom';
                        if (window.updateTransform) window.updateTransform();
                    }
                } else if (e.touches.length === 2) {
                    // Pinch Zoom in progress
                    touchState.touchCount = 2;
                    touchState.wasPinching = true;
                    touchState.hasMoved = true;
                    if (e.cancelable) e.preventDefault();
                    var t1 = e.touches[0], t2 = e.touches[1];
                    var currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

                    // Dynamic initialization guard if second finger touched during movement
                    if (!touchState.initialDistance || touchState.initialDistance < 5) {
                        touchState.initialDistance = currentDist;
                        touchState.initialScale = (state && state.transform && state.transform.scale) || 1.0;
                        touchState.initialContentX = (state && state.transform && state.transform.x) || 0;
                        touchState.initialContentY = (state && state.transform && state.transform.y) || 0;
                        var r0 = canvas.getBoundingClientRect();
                        touchState.midX = ((t1.clientX + t2.clientX) / 2) - r0.left;
                        touchState.midY = ((t1.clientY + t2.clientY) / 2) - r0.top;
                    }

                    if (touchState.initialDistance > 5) {
                        var factor = currentDist / touchState.initialDistance;
                        var newScale = Math.max(0.15, Math.min(touchState.initialScale * factor, 8.0));

                        var rect = canvas.getBoundingClientRect();
                        var curMidX = ((t1.clientX + t2.clientX) / 2) - rect.left;
                        var curMidY = ((t1.clientY + t2.clientY) / 2) - rect.top;

                        // Point under the initial midpoint in unscaled stage coordinates
                        var p0X = (touchState.midX - touchState.initialContentX) / touchState.initialScale;
                        var p0Y = (touchState.midY - touchState.initialContentY) / touchState.initialScale;

                        state.transform.x = Math.round(curMidX - p0X * newScale);
                        state.transform.y = Math.round(curMidY - p0Y * newScale);
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

                    // Single tap detection (no pinch and no drag movement) to toggle Zen Mode
                    // Swipe screen navigation is intentionally disabled so 1-finger panning around zoomed slides is 100% seamless
                    if (!touchState.wasPinching && !touchState.hasMoved && elapsed > 20 && elapsed < 400) {
                        self.handleSingleTap();
                    }

                    touchState.isTracking = false;
                    touchState.touchCount = 0;
                    touchState.initialDistance = 0;
                    touchState.wasPinching = false;
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
                if (e.target.closest('#dock-btn-prev, #dock-btn-next, #dock-page-indicator, #v4-bottom-dock, #v4-bottom-sheet, #v4-frame-switcher, #v4-zen-exit-pill, #floating-inspector-card, .modal-overlay, .dialog-card, .toolbar')) {
                    return;
                }
                if (self.currentTier === 'narrow' || self.isTouchDevice || document.body.classList.contains('zen-mode')) {
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

            self._userSelectedFocus = null;
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
                        self._userSelectedFocus = null;
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

            // Ensure iframe tap listener is wired to current screen
            this.attachIframeTapListener();
        },

        syncDockZoom: function() {
            var txt = document.getElementById('dock-zoom-txt');
            var state = window.state;
            if (txt && state && state.transform) {
                txt.innerText = Math.round(state.transform.scale * 100) + '%';
            }
        },

        // --- 8. Smart Frame Focus (Native 1:1 Mobile Frame Preview & PC Fit) ---
        getFrameElements: function() {
            var DOM = window.DOM;
            var iframe = (DOM && DOM.iframe) || document.getElementById('main-iframe') || document.querySelector('iframe');
            if (!iframe) return { mobile: null, pc: null, hasMobile: false, hasPc: false, doc: null };
            try {
                var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
                if (!doc) return { mobile: null, pc: null, hasMobile: false, hasPc: false, doc: null };

                // Exclusion: Multi-mobile comparison screens (e.g. Dual Mobile Compare: Maximum Case vs Minimum Case)
                var allMobileFrames = doc.querySelectorAll('.mobile-frame, .mobile-browser-frame');
                var pcEl = doc.querySelector('.frame-column.pc-column:not(.mobile-column)') || 
                           doc.querySelector('.pc-column') || 
                           doc.querySelector('.mobile-column-right') || 
                           doc.querySelector('.pc-browser-frame') || 
                           doc.querySelector('.pc-frame') || 
                           doc.querySelector('.full-pc-page') || 
                           doc.querySelector('.pc-content-inner') || 
                           doc.querySelector('[data-frame="pc"]');

                var isCompareScreen = !!(doc.querySelector('.mobile-compare-page, .dual-mobile-container, .mobile-compare-container') || (allMobileFrames.length > 1 && !pcEl));
                if (isCompareScreen) {
                    return { mobile: null, pc: null, hasMobile: false, hasPc: false, doc: doc };
                }

                var mobileEl = (allMobileFrames.length === 1 || doc.querySelector('.frame-column.mobile-column'))
                    ? (doc.querySelector('.frame-column.mobile-column:not(.pc-column)') || 
                       doc.querySelector('.mobile-column') || 
                       doc.querySelector('.mobile-column-left') || 
                       doc.querySelector('.mobile-frame') || 
                       doc.querySelector('.mobile-browser-frame') || 
                       doc.querySelector('.mobile-content-inner') || 
                       doc.querySelector('[data-frame="mobile"]'))
                    : null;

                return {
                    mobile: mobileEl,
                    pc: pcEl,
                    hasMobile: !!mobileEl,
                    hasPc: !!pcEl,
                    doc: doc
                };
            } catch (_) {
                return { mobile: null, pc: null, hasMobile: false, hasPc: false, doc: null };
            }
        },

        getActiveScrollContainer: function() {
            var frames = this.getFrameElements();
            if (!frames.doc) return null;
            var doc = frames.doc;

            if (this.currentFocus === 'mobile') {
                return doc.querySelector('.mobile-column .mobile-content') || 
                       doc.querySelector('.mobile-frame .mobile-content') || 
                       doc.querySelector('.mobile-content') || 
                       doc.querySelector('.mobile-content-area');
            } else if (this.currentFocus === 'pc') {
                return doc.querySelector('.pc-column .pc-content-area') || 
                       doc.querySelector('.pc-browser-frame .pc-content-area') || 
                       doc.querySelector('.pc-content-area') || 
                       doc.querySelector('.chrome-content-area') || 
                       doc.querySelector('.pc-content');
            }
            return null;
        },

        checkAndInitFrameSwitcher: function() {
            var switcher = document.getElementById('v4-frame-switcher');
            if (!switcher) return;

            var DOM = window.DOM;
            // Always restore base artboard height to standard 900px if previously inflated
            if (DOM && DOM.iframe) {
                var curH = parseInt(DOM.iframe.style.height, 10) || 900;
                if (curH > 900) {
                    DOM.iframe.style.height = '900px';
                    var wrapper = (DOM && DOM.artboardWrapper) || document.getElementById('artboard-wrapper');
                    if (wrapper) wrapper.style.height = '900px';
                }
            }

            var frames = this.getFrameElements();
            var hasAny = frames.hasMobile || frames.hasPc;

            if (!hasAny) {
                switcher.classList.remove('is-available');
                switcher.style.setProperty('display', 'none', 'important');
                this.currentFocus = 'full';
                this.updateFocusButtonUI('full');
                return;
            }

            switcher.classList.add('is-available');
            switcher.style.setProperty('display', 'flex', 'important');

            var btnMobile = document.getElementById('btn-focus-mobile');
            var btnPc = document.getElementById('btn-focus-pc');
            var btnFull = document.getElementById('btn-focus-full');

            if (btnMobile) {
                btnMobile.style.setProperty('display', frames.hasMobile ? 'inline-flex' : 'none', 'important');
                btnMobile.classList.toggle('is-hidden', !frames.hasMobile);
            }
            if (btnPc) {
                btnPc.style.setProperty('display', frames.hasPc ? 'inline-flex' : 'none', 'important');
                btnPc.classList.toggle('is-hidden', !frames.hasPc);
            }
            if (btnFull) {
                btnFull.style.setProperty('display', 'inline-flex', 'important');
                btnFull.classList.remove('is-hidden');
            }

            // Point 2: The default is UNCONDITIONALLY 'full' unless user explicitly clicked a button!
            var chosenFocus = this._userSelectedFocus || 'full';
            if (chosenFocus === 'mobile' && !frames.hasMobile) {
                chosenFocus = 'full';
            } else if (chosenFocus === 'pc' && !frames.hasPc) {
                chosenFocus = 'full';
            }
            this.focusFrame(chosenFocus);
        },

        focusFrame: function(type) {
            this.currentFocus = type;
            this.updateFocusButtonUI(type);

            var DOM = window.DOM;
            if (!DOM || !DOM.canvas || !window.state || !window.state.transform) return;

            // Ensure iframe and artboardWrapper height stay 900px
            if (DOM.iframe) {
                var curH = parseInt(DOM.iframe.style.height, 10) || 900;
                if (curH > 900) {
                    DOM.iframe.style.height = '900px';
                    var wrapper = (DOM && DOM.artboardWrapper) || document.getElementById('artboard-wrapper');
                    if (wrapper) wrapper.style.height = '900px';
                }
            }

            if (type === 'full') {
                this._focusLockedX = null;
                this._focusLockedY = null;
                try {
                    if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                        window.screen.orientation.unlock();
                    }
                } catch (_) {}
                if (window.centerView) window.centerView(true);
                this.syncDockZoom();
                return;
            }

            var frames = this.getFrameElements();
            var targetEl = (type === 'mobile') ? frames.mobile : frames.pc;
            if (!targetEl) {
                this._focusLockedX = null;
                this._focusLockedY = null;
                if (window.centerView) window.centerView(true);
                return;
            }

            // Prefer the inner visual frame if targetEl is a column wrapper
            var visualFrame = (type === 'mobile')
                ? (targetEl.querySelector('.mobile-frame, .mobile-browser-frame') || targetEl)
                : (targetEl.querySelector('.pc-browser-frame, .pc-frame') || targetEl);

            var left = 0, top = 0, elW = 0, elH = 0;
            if (typeof visualFrame.getBoundingClientRect === 'function') {
                var bcr = visualFrame.getBoundingClientRect();
                var scrollX = (frames.doc.defaultView && frames.doc.defaultView.scrollX) || 0;
                var scrollY = (frames.doc.defaultView && frames.doc.defaultView.scrollY) || 0;
                left = bcr.left + scrollX;
                top = bcr.top + scrollY;
                elW = bcr.width;
                elH = bcr.height;
            }
            if (!elW || !elH) {
                var curr = visualFrame;
                var body = (frames.doc && frames.doc.body) || (curr && curr.ownerDocument && curr.ownerDocument.body);
                while (curr && curr !== body) {
                    left += curr.offsetLeft || 0;
                    top += curr.offsetTop || 0;
                    curr = curr.offsetParent;
                }
                elW = visualFrame.offsetWidth || (type === 'mobile' ? 382 : 1160);
                elH = visualFrame.offsetHeight || (type === 'mobile' ? 848 : 810);
            }

            var cw = DOM.canvas.clientWidth;
            var ch = DOM.canvas.clientHeight;
            if (cw <= 0 || ch <= 0) return;

            // Option A: Smart orientation control & rotation guidance
            if (type === 'pc') {
                try {
                    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                        window.screen.orientation.lock('landscape').catch(function() {});
                    }
                } catch (_) {}
                if (ch > cw) {
                    this.showRotationToast('기기를 가로로 회전하면 PC 화면이 100% 꽉 차게 보입니다', 'screen_rotation');
                }
            } else if (type === 'mobile') {
                try {
                    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                        window.screen.orientation.lock('portrait').catch(function() {});
                    }
                } catch (_) {}
                if (cw > ch && (cw <= 960 || (ch <= 600 && cw <= 1050))) {
                    this.showRotationToast('기기를 세로로 회전하면 모바일 화면이 100% 꽉 차게 보입니다', 'screen_rotation');
                }
            }

            // Fit the frame cleanly on screen:
            // "사용자가 의도적으로 [모바일핏] 을 클릭하면, 그냥 '세로형태' 로만 바로 보여지게 해주면 돼.
            //  [PC핏] 을 클릭하면 그냥 '가로형태' 로만 보여지게 해주면 돼."
            var scale;
            if (type === 'mobile') {
                if (ch > cw) {
                    // Mobile Portrait: Fit width nicely (near 1:1 on mobile devices)
                    scale = Math.min((cw - 16) / elW, 1.15);
                    if (scale >= 0.95 && scale <= 1.05) scale = 1.0;
                } else {
                    // Landscape: Fit height so the vertical mobile frame fits cleanly on screen
                    scale = Math.min((ch - 24) / elH, (cw - 24) / elW, 1.0);
                }
            } else {
                // PC Frame Fit
                if (ch > cw) {
                    // Portrait: Fit PC width to portrait screen
                    scale = Math.min((cw - 16) / elW, 1.0);
                } else {
                    // Landscape: Fit PC frame comfortably to screen
                    scale = Math.min((cw - 24) / elW, (ch - 24) / elH, 1.0);
                }
            }

            // Center horizontally
            var x = Math.round((cw / 2) - (left + (elW / 2)) * scale);
            // Center vertically, or align top with safe margin when rendered height exceeds canvas
            var y;
            var renderedH = elH * scale;
            if (renderedH > ch - 20) {
                y = Math.round(12 - (top * scale));
            } else {
                y = Math.round((ch / 2) - (top + (elH / 2)) * scale);
            }

            var state = window.state;
            state.transform.x = x;
            state.transform.y = y;
            state.transform.scale = scale;
            state.viewMode = 'custom';

            this._focusLockedX = x;
            this._focusLockedY = y;

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
        toggleFullscreen: function(forceState) {
            var doc = document;
            var isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
            var nextZen = (typeof forceState === 'boolean') ? forceState : !isFs;
            this.toggleZenMode(nextZen);
        },

        toggleZenMode: function(forceState) {
            var doc = document;
            var docEl = doc.documentElement;
            var isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
            var isCurrentlyZen = doc.body.classList.contains('zen-mode') || isFs;
            var nextZen = (typeof forceState === 'boolean') ? forceState : !isCurrentlyZen;

            doc.body.classList.toggle('zen-mode', nextZen);
            doc.body.classList.toggle('fullscreen-mode', nextZen);

            // Request or Exit Native Fullscreen to hide mobile browser address bar & fill screen completely
            try {
                if (nextZen && !isFs) {
                    if (docEl.requestFullscreen) {
                        docEl.requestFullscreen().catch(function() {});
                    } else if (docEl.webkitRequestFullscreen) {
                        docEl.webkitRequestFullscreen();
                    } else if (docEl.msRequestFullscreen) {
                        docEl.msRequestFullscreen();
                    }
                } else if (!nextZen && isFs) {
                    if (doc.exitFullscreen) {
                        doc.exitFullscreen().catch(function() {});
                    } else if (doc.webkitExitFullscreen) {
                        doc.webkitExitFullscreen();
                    } else if (doc.msExitFullscreen) {
                        doc.msExitFullscreen();
                    }
                }
            } catch (_) {}

            if (typeof window.clearPresentationPen === 'function') {
                window.clearPresentationPen();
            }

            var self = this;
            setTimeout(function() {
                if (self.currentFocus && self.currentFocus !== 'full') {
                    self.focusFrame(self.currentFocus);
                } else if (window.centerView) {
                    window.centerView(true);
                }
            }, 200);
        },

        showZenToast: function() {
            // Suppressed to keep fullscreen view completely clean without guidance messages
        },

        showRotationToast: function(message, iconName) {
            var toast = document.getElementById('v4-rotation-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'v4-rotation-toast';
                toast.className = 'v4-zen-toast v4-rotation-toast';
                document.body.appendChild(toast);
            }
            toast.innerHTML = '<span class="material-icons-outlined" style="font-size: 16px; color: #00e5ff;">' + (iconName || 'screen_rotation') + '</span>' +
                              '<span>' + message + '</span>';
            clearTimeout(this._rotationToastTimer);
            toast.classList.add('show');
            this._rotationToastTimer = setTimeout(function() {
                toast.classList.remove('show');
            }, 2600);
        },

        handleSingleTap: function() {
            // Single tap toggles Zen Mode on mobile/touch screens, or exits Zen Mode if active
            if (this.currentTier === 'narrow' || this.isTouchDevice || document.body.classList.contains('zen-mode')) {
                this.toggleZenMode();
            }
        },

        attachIframeTapListener: function() {
            var DOM = window.DOM;
            var iframe = (DOM && DOM.iframe) || document.getElementById('main-iframe') || document.querySelector('iframe');
            if (!iframe) return;
            try {
                var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
                if (!doc) return;

                // Double-Layer Mobile Read-Only Guard: Prevent any element inside iframe from receiving pointer/touch events
                if (this.currentTier === 'narrow' || this.isTouchDevice) {
                    var styleEl = doc.getElementById('mobile-readonly-guard-style');
                    if (!styleEl && (doc.head || doc.body || doc.documentElement)) {
                        styleEl = doc.createElement('style');
                        styleEl.id = 'mobile-readonly-guard-style';
                        styleEl.textContent = '* { pointer-events: none !important; user-select: none !important; -webkit-user-select: none !important; }';
                        (doc.head || doc.body || doc.documentElement).appendChild(styleEl);
                    }
                }

                if (doc._zenTapWired) return;
                var self = this;
                var ifTouch = { x: 0, y: 0, lastY: 0, time: 0, moved: false };

                // Forward mouse wheel over iframe for smooth vertical scrolling
                doc.addEventListener('wheel', function(e) {
                    if (e.ctrlKey || e.metaKey) return;
                    if (self.currentFocus === 'mobile' || self.currentFocus === 'pc') {
                        var scrollEl = self.getActiveScrollContainer();
                        if (scrollEl) {
                            e.preventDefault();
                            scrollEl.scrollTop += Math.round(e.deltaY);
                            return;
                        }
                    }
                }, { passive: false });

                doc.addEventListener('touchstart', function(e) {
                    if (e.touches.length === 1) {
                        ifTouch.x = e.touches[0].clientX;
                        ifTouch.y = e.touches[0].clientY;
                        ifTouch.lastY = e.touches[0].clientY;
                        ifTouch.time = Date.now();
                        ifTouch.moved = false;
                    }
                }, { passive: false });

                doc.addEventListener('touchmove', function(e) {
                    if (e.touches.length === 1) {
                        var t = e.touches[0];
                        var deltaY = ifTouch.lastY - t.clientY;
                        ifTouch.lastY = t.clientY;

                        if (Math.hypot(t.clientX - ifTouch.x, t.clientY - ifTouch.y) > 8) {
                            ifTouch.moved = true;
                        }
                        if (self.currentFocus === 'mobile' || self.currentFocus === 'pc') {
                            var scrollEl = self.getActiveScrollContainer();
                            if (scrollEl) {
                                if (e.cancelable) e.preventDefault();
                                scrollEl.scrollTop += deltaY;
                                return;
                            }
                        }
                    }
                }, { passive: false });

                doc.addEventListener('touchend', function(e) {
                    var elapsed = Date.now() - ifTouch.time;
                    if (!ifTouch.moved && elapsed > 20 && elapsed < 400) {
                        // Stationary tap inside slide toggles Zen Mode
                        self.handleSingleTap();
                    }
                }, { passive: true });

                doc.addEventListener('click', function(e) {
                    if (self.currentTier === 'narrow' || self.isTouchDevice || document.body.classList.contains('zen-mode')) {
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
