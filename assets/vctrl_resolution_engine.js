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
        isTouchDevice: false,
        _initialized: false,
        _resizeTimer: null,
        _touchState: {
            isTracking: false,
            touchCount: 0,
            startX: 0,
            startY: 0,
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
            this._initialized = true;

            // Delayed sync guards for asynchronous metadata hydration
            var self = this;
            setTimeout(function() { self.syncScreenList(); }, 400);
            setTimeout(function() { self.syncScreenList(); }, 1200);
            setTimeout(function() { self.syncScreenList(); }, 2500);

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
            var btnFit = document.getElementById('dock-btn-fit');
            var btnCrisp = document.getElementById('dock-btn-crisp');
            var btnScreens = document.getElementById('dock-btn-screens');

            if (btnPrev) btnPrev.addEventListener('click', function() { self.navigateScreen(-1); });
            if (btnNext) btnNext.addEventListener('click', function() { self.navigateScreen(1); });
            if (btnFit) btnFit.addEventListener('click', function() {
                if (window.state) window.state.viewMode = 'fit';
                if (window.centerView) window.centerView(true);
                self.syncDockZoom();
            });
            if (btnCrisp) btnCrisp.addEventListener('click', function() {
                if (window.toggleCrispView) window.toggleCrispView();
                self.syncDockZoom();
            });
            if (btnScreens) btnScreens.addEventListener('click', function() {
                self.toggleBottomSheet();
            });

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
                    self.checkAndApplyNativeFrameFocus();
                });
                window.MessageHub.subscribe('SCREEN_CHANGED', function() {
                    self.syncScreenList();
                    self.checkAndApplyNativeFrameFocus();
                });
            }
        },

        // --- 5. Touch Gestures Engine (Pinch-to-zoom, 1-Finger Pan, Double-Tap) ---
        initTouchGestures: function() {
            var self = this;
            var canvas = document.getElementById('canvas');
            if (!canvas) return;

            var touchState = this._touchState;

            canvas.addEventListener('touchstart', function(e) {
                // Ignore touch on UI overlays
                if (e.target.closest('#v4-bottom-dock, #v4-bottom-sheet, #floating-inspector-card, .modal-overlay')) {
                    return;
                }

                touchState.touchCount = e.touches.length;

                if (e.touches.length === 1) {
                    var now = Date.now();
                    var timeDiff = now - touchState.lastTapTime;
                    touchState.lastTapTime = now;

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
                    var t = e.touches[0];
                    var state = window.state;
                    if (state && state.transform) {
                        touchState.isTracking = true;
                        touchState.startX = t.clientX - state.transform.x;
                        touchState.startY = t.clientY - state.transform.y;
                    }
                } else if (e.touches.length === 2) {
                    // Pinch Zoom Initiation
                    e.preventDefault();
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
                    // 1-Finger Pan in progress (Only if in narrow mode or hand mode)
                    if (self.currentTier === 'narrow' || state.tool === 'hand' || state.isHandMode) {
                        e.preventDefault();
                        var t = e.touches[0];
                        state.transform.x = Math.round(t.clientX - touchState.startX);
                        state.transform.y = Math.round(t.clientY - touchState.startY);
                        state.viewMode = 'custom';
                        if (window.updateTransform) window.updateTransform();
                    }
                } else if (e.touches.length === 2) {
                    // Pinch Zoom in progress
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
        checkAndApplyNativeFrameFocus: function() {
            var self = this;
            if (this.currentTier !== 'narrow') return;

            var DOM = window.DOM;
            if (!DOM || !DOM.iframe) return;

            try {
                var doc = DOM.iframe.contentDocument;
                if (!doc) return;

                // Check for mobile frames
                var mobileFrame = doc.querySelector('.mobile-content-inner') || 
                                  doc.querySelector('.mobile-browser-frame') || 
                                  doc.querySelector('.mobile-content-area');

                if (mobileFrame && window.state && window.state.transform) {
                    var frameRect = mobileFrame.getBoundingClientRect();
                    var frameW = frameRect.width || 375;
                    var frameLeft = mobileFrame.offsetLeft || 0;
                    var frameTop = mobileFrame.offsetTop || 0;

                    var screenW = window.innerWidth;
                    // Fit mobile frame to ~96% of device screen
                    var targetScale = Math.min((screenW * 0.96) / frameW, 1.25);

                    var state = window.state;
                    state.transform.scale = targetScale;
                    state.transform.x = Math.round((screenW - (frameW * targetScale)) / 2 - (frameLeft * targetScale));
                    state.transform.y = 15; // 15px top margin
                    state.viewMode = 'custom';

                    if (window.updateTransform) window.updateTransform();
                    self.syncDockZoom();

                    console.log("[VCTRL RESOLUTION ENGINE] Smart Mobile Frame Focus applied: Scale =", targetScale);
                }
            } catch (e) {
                // SOP / Sandboxed guard
            }
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
