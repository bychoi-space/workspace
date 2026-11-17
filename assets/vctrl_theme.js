/**
 * vctrl_theme.js - Shared Dual Theme Engine SSOT (Dark / Light / System OS Auto)
 * Manages UI shell theme state ('system' | 'light' | 'dark') across index.html and viewer.html.
 * Strictly scopes theme tokens to the Workspace UI Shell without mutating authored canvas HTML.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'bychoi_ui_theme';
    var VALID_MODES = { system: true, light: true, dark: true };
    var THEME_COLORS = {
        dark: '#0b0d12',
        light: '#f5f6f8'
    };

    var SVG_ICONS = {
        system: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="13" rx="2"></rect><line x1="8.5" y1="20.5" x2="15.5" y2="20.5"></line><line x1="12" y1="16.5" x2="12" y2="20.5"></line></svg>',
        light: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2.5" x2="12" y2="4.5"></line><line x1="12" y1="19.5" x2="12" y2="21.5"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2.5" y1="12" x2="4.5" y2="12"></line><line x1="19.5" y1="12" x2="21.5" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line></svg>',
        dark: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"></path></svg>'
    };

    var MODE_LABELS = {
        system: 'System',
        light: 'Light',
        dark: 'Dark'
    };

    var MODE_TITLES = {
        system: '시스템 설정 자동 추종 (OS 테마 동기화)',
        light: '라이트 모드',
        dark: '다크 모드'
    };

    var mediaQuery = null;
    try {
        if (window.matchMedia) {
            mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        }
    } catch (e) {}

    function getStoredMode() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved && VALID_MODES[saved]) {
                return saved;
            }
        } catch (e) {}
        return 'system';
    }

    function getSystemTheme() {
        if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
            return mediaQuery.matches ? 'dark' : 'light';
        }
        return 'dark';
    }

    function resolveEffectiveTheme(mode) {
        if (mode === 'light' || mode === 'dark') {
            return mode;
        }
        return getSystemTheme();
    }

    function updateMetaThemeColor(effectiveTheme) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', THEME_COLORS[effectiveTheme] || THEME_COLORS.dark);
        }
    }

    function syncSwitcherControls(mode, effectiveTheme) {
        var switchers = document.querySelectorAll('[data-theme-switcher]');
        for (var i = 0; i < switchers.length; i++) {
            var container = switchers[i];
            var buttons = container.querySelectorAll('[data-theme-option]');
            for (var j = 0; j < buttons.length; j++) {
                var btn = buttons[j];
                var opt = btn.getAttribute('data-theme-option');
                var isActive = opt === mode;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            }
        }

        var cycleBtns = document.querySelectorAll('[data-theme-cycle]');
        for (var k = 0; k < cycleBtns.length; k++) {
            var cBtn = cycleBtns[k];
            var iconKey = mode === 'system' ? 'system' : effectiveTheme;
            cBtn.innerHTML = SVG_ICONS[iconKey] || SVG_ICONS.system;
            cBtn.setAttribute('title', '테마 전환 — 현재: ' + (MODE_TITLES[mode] || mode));
            cBtn.setAttribute('data-current-mode', mode);
        }
    }

    function applyTheme(mode, options) {
        var opts = options || {};
        var normalizedMode = VALID_MODES[mode] ? mode : 'system';
        var effectiveTheme = resolveEffectiveTheme(normalizedMode);
        var root = document.documentElement;

        if (root) {
            root.setAttribute('data-theme', effectiveTheme);
            root.setAttribute('data-theme-mode', normalizedMode);
            // Keep root color-scheme unset/normal so Chromium never forces an opaque white backdrop onto transparent artboard iframes
            if (root.style && root.style.colorScheme) {
                root.style.removeProperty('color-scheme');
            }
        }

        updateMetaThemeColor(effectiveTheme);
        syncSwitcherControls(normalizedMode, effectiveTheme);

        if (!opts.silent) {
            try {
                window.dispatchEvent(new CustomEvent('bychoi:themechange', {
                    detail: {
                        mode: normalizedMode,
                        theme: effectiveTheme
                    }
                }));
            } catch (e) {}
        }

        return {
            mode: normalizedMode,
            theme: effectiveTheme
        };
    }

    function setMode(mode) {
        var normalizedMode = VALID_MODES[mode] ? mode : 'system';
        try {
            localStorage.setItem(STORAGE_KEY, normalizedMode);
        } catch (e) {}
        return applyTheme(normalizedMode);
    }

    function cycleMode() {
        var current = getStoredMode();
        var order = ['system', 'light', 'dark'];
        var nextIdx = (order.indexOf(current) + 1) % order.length;
        return setMode(order[nextIdx]);
    }

    function mountSwitchers() {
        var switchers = document.querySelectorAll('[data-theme-switcher]');
        var currentMode = getStoredMode();
        var effectiveTheme = resolveEffectiveTheme(currentMode);

        for (var i = 0; i < switchers.length; i++) {
            var container = switchers[i];
            if (!container.querySelector('[data-theme-option]')) {
                var modes = ['system', 'light', 'dark'];
                var html = '';
                for (var m = 0; m < modes.length; m++) {
                    var key = modes[m];
                    html += '<button type="button" class="theme-seg-btn" data-theme-option="' + key + '" title="' + MODE_TITLES[key] + '" aria-label="' + MODE_TITLES[key] + '">' +
                        SVG_ICONS[key] +
                        '<span class="theme-seg-label">' + MODE_LABELS[key] + '</span>' +
                        '</button>';
                }
                container.innerHTML = html;
            }

            if (!container.dataset.themeBound) {
                container.dataset.themeBound = '1';
                container.addEventListener('click', function (e) {
                    var btn = e.target.closest('[data-theme-option]');
                    if (!btn) return;
                    e.preventDefault();
                    var targetMode = btn.getAttribute('data-theme-option');
                    if (targetMode) {
                        setMode(targetMode);
                    }
                });
            }
        }

        var cycleBtns = document.querySelectorAll('[data-theme-cycle]');
        for (var k = 0; k < cycleBtns.length; k++) {
            var cBtn = cycleBtns[k];
            if (!cBtn.dataset.themeBound) {
                cBtn.dataset.themeBound = '1';
                cBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    cycleMode();
                });
            }
        }

        syncSwitcherControls(currentMode, effectiveTheme);
    }

    // Live OS preference listener (active whenever user is in 'system' mode)
    if (mediaQuery) {
        var handleSystemChange = function () {
            if (getStoredMode() === 'system') {
                applyTheme('system');
            }
        };
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleSystemChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleSystemChange);
        }
    }

    // Cross-tab synchronization via storage event
    window.addEventListener('storage', function (e) {
        if (e && e.key === STORAGE_KEY) {
            applyTheme(getStoredMode());
        }
    });

    // Apply immediately on script execution
    applyTheme(getStoredMode(), { silent: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountSwitchers);
    } else {
        mountSwitchers();
    }

    window.ThemeManager = {
        STORAGE_KEY: STORAGE_KEY,
        getMode: getStoredMode,
        getEffectiveTheme: function () { return resolveEffectiveTheme(getStoredMode()); },
        setMode: setMode,
        cycleMode: cycleMode,
        mountSwitchers: mountSwitchers,
        applyTheme: applyTheme
    };
})();
