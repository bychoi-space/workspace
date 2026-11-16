/**
 * assets/vctrl_color_picker.js
 * Domain Module: Universal 9-Column Color Palette, Pinned Grayscale Row, Recent Colors (MRU), Live Hex Readout & Hybrid Color Pickers.
 */
(function () {
    console.log("[VCTRL COLOR PICKER] 9-Column Palette & Recent Colors Module loaded.");

    const RECENT_COLORS_STORAGE_KEY = 'v4_recent_colors_v1';
    const MAX_RECENT_COLORS = 9;
    let _memoryRecentColors = [];

    window.V4_COLOR_PALETTE_GROUPS = [
        { id: 'grayscale', label: 'Pure Grayscale', pinned: true, colors: ['#000000', '#323232', '#646464', '#969696', '#c8c8c8', '#e6e6e6', '#f0f0f0', '#fafafa', '#ffffff'] },
        { id: 'cool-slate', label: 'Cool Slate', colors: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f8fafc'] },
        { id: 'warm-beige', label: 'Warm Beige', colors: ['#292524', '#44403c', '#78716c', '#8c7a6b', '#b08968', '#d6ccc2', '#e6ccb2', '#f5ebe0', '#faf7f2'] },
        { id: 'commerce-red', label: 'Commerce Red', colors: ['#7f1d1d', '#991b1b', '#dc2626', '#e02020', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fef2f2'] },
        { id: 'amber-orange', label: 'Amber & Orange', colors: ['#7c2d12', '#b45309', '#ea580c', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fffbeb'] },
        { id: 'emerald', label: 'Emerald', colors: ['#064e3b', '#065f46', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'] },
        { id: 'royal-blue', label: 'Royal Blue', colors: ['#172554', '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#eff6ff'] },
        { id: 'sky-cyan', label: 'Sky & Cyan', colors: ['#0c4a6e', '#0369a1', '#0284c7', '#0ea5e9', '#06b6d4', '#38bdf8', '#7dd3fc', '#bae6fd', '#f0f9ff'] },
        { id: 'indigo-violet', label: 'Indigo & Violet', colors: ['#312e81', '#4338ca', '#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#f5f3ff'] }
    ];

    window.V4_COMMON_COLOR_PALETTE = window.V4_COLOR_PALETTE_GROUPS.reduce(function (acc, grp) {
        return acc.concat(grp.colors);
    }, []);

    const _colorGroupLookup = {};
    window.V4_COLOR_PALETTE_GROUPS.forEach(function (grp) {
        grp.colors.forEach(function (hex) { _colorGroupLookup[hex.toLowerCase()] = grp.label; });
    });

    function normalizeHex(input) {
        if (!input || typeof input !== 'string') return null;
        let hex = input.trim().replace(/^#/, '');
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
            hex = hex.split('').map(function (c) { return c + c; }).join('');
        }
        return /^[0-9a-fA-F]{6}$/.test(hex) ? ('#' + hex.toLowerCase()) : null;
    }

    function _loadRecentColors() {
        try {
            const raw = window.localStorage ? window.localStorage.getItem(RECENT_COLORS_STORAGE_KEY) : null;
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    _memoryRecentColors = parsed.map(normalizeHex).filter(Boolean).slice(0, MAX_RECENT_COLORS);
                    return _memoryRecentColors.slice();
                }
            }
        } catch (e) { }
        return _memoryRecentColors.slice();
    }

    function _saveRecentColors(list) {
        _memoryRecentColors = list.slice(0, MAX_RECENT_COLORS);
        try {
            if (window.localStorage) window.localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(_memoryRecentColors));
        } catch (e) { }
    }

    function _recordRecentColor(hexVal) {
        const norm = normalizeHex(hexVal);
        if (!norm) return;
        const next = _loadRecentColors().filter(function (c) { return c !== norm; });
        next.unshift(norm);
        _saveRecentColors(next.slice(0, MAX_RECENT_COLORS));
    }

    function _clearRecentColors() {
        _saveRecentColors([]);
    }

    function _resolveColorLabel(hexVal) {
        if (!hexVal || hexVal === 'transparent') return 'Transparent';
        const norm = normalizeHex(hexVal);
        return norm ? (_colorGroupLookup[norm] || 'Custom Color') : 'Custom';
    }

    function _createSwatchHtml(hex, label) {
        const upper = hex.toUpperCase();
        const titleTxt = label ? (label + ' (' + upper + ')') : upper;
        return '<div class="v4-palette-item" data-color="' + hex + '" data-label="' + (label || 'Custom') + '" style="background-color: ' + hex + ';" title="' + titleTxt + '"></div>';
    }

    // Shared Bi-directional Hybrid Hex Bar Controller (used by Global Popover & Quill Toolbar Pickers)
    function _wireHybridHexBar(cfg) {
        const hexBar = cfg.hexBar;
        const footer = cfg.footer;
        const hexInput = cfg.hexInput;
        const hexPreview = cfg.hexPreview;
        const hexNativePicker = cfg.hexNativePicker;

        function closeHexBar() {
            if (hexBar) hexBar.classList.remove('active');
            if (footer) footer.style.display = 'flex';
            if (hexInput) hexInput.classList.remove('error');
        }

        function openHexBar() {
            if (!hexBar || !footer) return;
            footer.style.display = 'none';
            hexBar.classList.add('active');
            const raw = cfg.getCurrentColor() || '#ffffff';
            const norm = normalizeHex(raw) || (raw.startsWith('#') ? raw : (typeof window.rgbToHex === 'function' ? window.rgbToHex(raw) : '#ffffff')) || '#ffffff';
            if (hexInput) {
                hexInput.value = norm.replace(/^#/, '').toUpperCase();
                hexInput.classList.remove('error');
            }
            if (hexPreview) hexPreview.style.backgroundColor = norm;
            if (hexNativePicker) hexNativePicker.value = norm;
            setTimeout(function () {
                if (hexInput) { hexInput.focus(); hexInput.select(); }
            }, 10);
        }

        function applyHexColor() {
            const norm = normalizeHex(hexInput ? hexInput.value : '');
            if (!norm) {
                if (hexInput) {
                    hexInput.classList.add('error');
                    setTimeout(function () { hexInput.classList.remove('error'); }, 500);
                }
                return;
            }
            cfg.onApply(norm);
        }

        if (hexNativePicker) {
            const syncFromNative = function (e) {
                const pickedHex = (e.target.value || '').toLowerCase();
                if (hexInput) {
                    hexInput.value = pickedHex.replace(/^#/, '').toUpperCase();
                    hexInput.classList.remove('error');
                }
                if (hexPreview) hexPreview.style.backgroundColor = pickedHex;
                if (cfg.onPreview) cfg.onPreview(pickedHex, 'Custom Spectrum');
            };
            hexNativePicker.addEventListener('input', syncFromNative);
            hexNativePicker.addEventListener('change', syncFromNative);
        }

        if (hexInput) {
            hexInput.addEventListener('input', function (e) {
                const norm = normalizeHex(e.target.value);
                if (norm) {
                    if (hexPreview) hexPreview.style.backgroundColor = norm;
                    if (hexNativePicker) hexNativePicker.value = norm;
                    hexInput.classList.remove('error');
                    if (cfg.onPreview) cfg.onPreview(norm, _resolveColorLabel(norm));
                }
            });
            hexInput.addEventListener('keydown', function (e) {
                e.stopPropagation();
                if (e.key === 'Enter') { e.preventDefault(); applyHexColor(); }
                else if (e.key === 'Escape') { e.preventDefault(); closeHexBar(); }
            });
            hexInput.addEventListener('keyup', function (e) { e.stopPropagation(); });
            hexInput.addEventListener('keypress', function (e) { e.stopPropagation(); });
        }

        if (cfg.hexApplyBtn) cfg.hexApplyBtn.addEventListener('click', function (e) { e.stopPropagation(); applyHexColor(); });
        if (cfg.hexCancelBtn) cfg.hexCancelBtn.addEventListener('click', function (e) { e.stopPropagation(); closeHexBar(); });

        return { closeHexBar: closeHexBar, openHexBar: openHexBar, applyHexColor: applyHexColor };
    }

    function _createColorPalettePopover() {
        let popover = document.getElementById('v4-global-color-palette-popover');
        if (!popover) {
            popover = document.createElement('div');
            popover.id = 'v4-global-color-palette-popover';
            popover.innerHTML =
                '<div class="v4-palette-info-bar"><span class="v4-palette-group-label">Pure Grayscale</span><span class="v4-palette-hex-readout">#FFFFFF</span></div>' +
                '<div class="v4-palette-pinned-row"></div>' +
                '<div class="v4-palette-divider"></div>' +
                '<div class="v4-palette-grid"></div>' +
                '<div class="v4-palette-recent-wrap" style="display: none;">' +
                '<div class="v4-palette-recent-header"><span class="v4-palette-recent-title">\uCD5C\uADFC \uC0AC\uC6A9 \uC0C9\uC0C1</span><button type="button" class="v4-palette-recent-clear" title="\uCD5C\uADFC \uC0AC\uC6A9 \uC0C9\uC0C1 \uBE44\uC6B0\uAE30">&times;</button></div>' +
                '<div class="v4-palette-recent-grid"></div>' +
                '</div>' +
                '<div class="v4-palette-footer">' +
                '<div class="v4-palette-custom-action" title="Hexcode \uC9C1\uC811 \uC124\uC815 \uBC0F \uC2A4\uD399\uD2B8\uB7FC \uD53C\uCEE4" style="cursor: pointer;"><span class="material-icons-outlined" style="font-size: 13px; pointer-events: none;">tag</span><span style="pointer-events: none;">\uC9C1\uC811 \uC124\uC815</span></div>' +
                '<button type="button" class="v4-palette-reset-btn" title="\uD22C\uBA85 / \uC0C9\uC0C1 \uC81C\uAC70"><span class="material-icons-outlined" style="font-size: 13px;">block</span></button>' +
                '</div>' +
                '<div class="v4-palette-hex-bar">' +
                '<div class="v4-hex-preview-wrap" title="\uCEEC\uB7EC \uD53C\uCEE4 \uC5F4\uAE30 (\uB4DC\uB798\uADF8\uD558\uC5EC \uC120\uD0DD)"><div class="v4-hex-preview" style="background-color: #ffffff;"><span class="material-icons-outlined v4-hex-preview-icon">palette</span></div><input type="color" class="v4-hex-native-picker" tabindex="-1" aria-hidden="true"></div>' +
                '<span class="v4-hex-prefix">#</span><input type="text" class="v4-hex-input" maxlength="7" placeholder="HEXCODE" spellcheck="false" autocomplete="off">' +
                '<button type="button" class="v4-hex-btn v4-hex-btn-apply" title="\uC801\uC6A9"><span class="material-icons-outlined" style="font-size: 14px;">check</span></button>' +
                '<button type="button" class="v4-hex-btn v4-hex-btn-cancel" title="\uCDE8\uC18C"><span class="material-icons-outlined" style="font-size: 14px;">close</span></button>' +
                '</div>';
            document.body.appendChild(popover);

            const pinnedGroup = window.V4_COLOR_PALETTE_GROUPS[0];
            const bodyGroups = window.V4_COLOR_PALETTE_GROUPS.slice(1);
            const pinnedRow = popover.querySelector('.v4-palette-pinned-row');
            const mainGrid = popover.querySelector('.v4-palette-grid');

            if (pinnedRow && pinnedGroup) {
                pinnedRow.innerHTML = pinnedGroup.colors.map(function (c) { return _createSwatchHtml(c, pinnedGroup.label); }).join('');
            }
            if (mainGrid) {
                mainGrid.innerHTML = bodyGroups.map(function (grp) {
                    return grp.colors.map(function (c) { return _createSwatchHtml(c, grp.label); }).join('');
                }).join('');
            }
        }

        return {
            popover: popover,
            groupLabel: popover.querySelector('.v4-palette-group-label'),
            hexReadout: popover.querySelector('.v4-palette-hex-readout'),
            recentWrap: popover.querySelector('.v4-palette-recent-wrap'),
            recentGrid: popover.querySelector('.v4-palette-recent-grid'),
            recentClearBtn: popover.querySelector('.v4-palette-recent-clear'),
            footer: popover.querySelector('.v4-palette-footer'),
            customAction: popover.querySelector('.v4-palette-custom-action'),
            resetBtn: popover.querySelector('.v4-palette-reset-btn'),
            hexBar: popover.querySelector('.v4-palette-hex-bar'),
            hexPreview: popover.querySelector('.v4-hex-preview'),
            hexNativePicker: popover.querySelector('.v4-hex-native-picker'),
            hexInput: popover.querySelector('.v4-hex-input'),
            hexApplyBtn: popover.querySelector('.v4-hex-btn-apply'),
            hexCancelBtn: popover.querySelector('.v4-hex-btn-cancel')
        };
    }

    function _renderGlobalRecentSection(dom, activeHex) {
        if (!dom || !dom.recentWrap || !dom.recentGrid) return;
        const recents = _loadRecentColors();
        if (recents.length === 0) {
            dom.recentWrap.style.display = 'none';
            dom.recentGrid.innerHTML = '';
            return;
        }
        dom.recentWrap.style.display = 'block';
        const normActive = normalizeHex(activeHex || '');
        dom.recentGrid.innerHTML = recents.map(function (c) {
            const isSel = normActive && c.toLowerCase() === normActive;
            const upper = c.toUpperCase();
            return '<div class="v4-palette-item' + (isSel ? ' selected' : '') + '" data-color="' + c + '" data-label="\uCD5C\uADFC \uC0AC\uC6A9" style="background-color: ' + c + ';" title="\uCD5C\uADFC \uC0AC\uC6A9 (' + upper + ')"></div>';
        }).join('');
    }

    function _updateInfoReadout(dom, hexVal, customLabel) {
        if (!dom) return;
        if (!hexVal || hexVal === 'transparent') {
            if (dom.groupLabel) dom.groupLabel.textContent = 'Transparent';
            if (dom.hexReadout) dom.hexReadout.textContent = 'NONE';
            return;
        }
        const norm = normalizeHex(hexVal) || hexVal;
        if (dom.groupLabel) dom.groupLabel.textContent = customLabel || _resolveColorLabel(norm);
        if (dom.hexReadout) dom.hexReadout.textContent = String(norm).toUpperCase();
    }

    function _applyColorToTargetInput(state, hex) {
        if (!state.currentTargetInput) return;
        _recordRecentColor(hex);
        state.currentTargetInput.value = hex;
        state.currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
        state.currentTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
        if (state.currentActiveWrapper) state.currentActiveWrapper.classList.remove('transparent-active');
    }

    function _bindColorPaletteEvents(dom, state, hexControls) {
        const popover = dom.popover;

        popover.addEventListener('click', function (e) {
            const item = e.target.closest('.v4-palette-item');
            if (!item || !state.currentTargetInput) return;
            _applyColorToTargetInput(state, item.dataset.color);
            window.closeV4ColorPalette();
        });

        popover.addEventListener('mouseover', function (e) {
            const item = e.target.closest('.v4-palette-item');
            if (item) _updateInfoReadout(dom, item.dataset.color, item.dataset.label);
        });

        popover.addEventListener('mouseleave', function () {
            if (!state.currentTargetInput) return;
            const isTrans = state.currentActiveWrapper && state.currentActiveWrapper.classList.contains('transparent-active');
            _updateInfoReadout(dom, isTrans ? 'transparent' : (state.currentTargetInput.value || '#ffffff'));
        });

        if (dom.recentClearBtn) {
            dom.recentClearBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                _clearRecentColors();
                _renderGlobalRecentSection(dom, state.currentTargetInput ? state.currentTargetInput.value : '');
            });
        }

        if (dom.customAction) {
            dom.customAction.addEventListener('click', function (e) { e.stopPropagation(); hexControls.openHexBar(); });
        }

        if (dom.resetBtn) {
            dom.resetBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (!state.currentActiveWrapper) return;
                const propGroup = state.currentActiveWrapper.closest('.prop-group');
                const noneBtn = propGroup ? propGroup.querySelector('.v4-color-none-btn') : null;
                if (noneBtn) {
                    noneBtn.click();
                } else if (state.currentTargetInput) {
                    state.currentTargetInput.value = 'transparent';
                    state.currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
                    state.currentTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
                    state.currentActiveWrapper.classList.add('transparent-active');
                }
                window.closeV4ColorPalette();
            });
        }

        if (window.MessageHub) {
            window.MessageHub.subscribe('LF_DESELECT', function () { window.closeV4ColorPalette(); });
            window.MessageHub.subscribe('LF_COMP_DESELECTED', function () { window.closeV4ColorPalette(); });
        }

        window.addEventListener('blur', function () {
            if (popover && popover.classList.contains('active') && document.activeElement && document.activeElement.tagName === 'IFRAME') {
                window.closeV4ColorPalette();
            }
        });

        document.addEventListener('mousedown', function (e) {
            if (!popover.classList.contains('active')) return;
            if (popover.contains(e.target) || e.target.closest('.v4-color-wrapper')) return;
            window.closeV4ColorPalette();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && popover.classList.contains('active')) {
                if (dom.hexBar && dom.hexBar.classList.contains('active')) hexControls.closeHexBar();
                else window.closeV4ColorPalette();
            }
        });
    }

    function _setupColorPalettePositioning(dom, state, hexControls) {
        const popover = dom.popover;

        window.openV4ColorPalette = function (wrapperEl) {
            if (!wrapperEl) return;
            state.currentActiveWrapper = wrapperEl;
            state.currentTargetInput = wrapperEl.querySelector('input[type="color"], .v4-color-input');
            if (!state.currentTargetInput) return;

            hexControls.closeHexBar();

            const isTrans = wrapperEl.classList.contains('transparent-active');
            const curVal = isTrans ? 'transparent' : (normalizeHex(state.currentTargetInput.value) || '#ffffff');
            _renderGlobalRecentSection(dom, curVal);
            _updateInfoReadout(dom, curVal);

            popover.querySelectorAll('.v4-palette-pinned-row .v4-palette-item, .v4-palette-grid .v4-palette-item').forEach(function (it) {
                it.classList.toggle('selected', !isTrans && it.dataset.color.toLowerCase() === curVal);
            });

            popover.classList.add('active');
            const rect = wrapperEl.getBoundingClientRect();
            const popRect = popover.getBoundingClientRect();

            let top = rect.bottom + 4;
            let left = rect.left;
            if (top + popRect.height > window.innerHeight - 10) top = Math.max(10, rect.top - popRect.height - 4);
            if (left + popRect.width > window.innerWidth - 10) left = Math.max(10, window.innerWidth - popRect.width - 10);

            popover.style.top = top + 'px';
            popover.style.left = left + 'px';
        };

        window.closeV4ColorPalette = function () {
            hexControls.closeHexBar();
            popover.classList.remove('active');
            state.currentActiveWrapper = null;
            state.currentTargetInput = null;
        };
    }

    window.initV4GlobalColorPalette = function () {
        if (window._v4ColorPaletteInitialized) return;
        window._v4ColorPaletteInitialized = true;

        const dom = _createColorPalettePopover();
        const state = { currentActiveWrapper: null, currentTargetInput: null };
        const hexControls = _wireHybridHexBar({
            hexBar: dom.hexBar,
            footer: dom.footer,
            hexInput: dom.hexInput,
            hexPreview: dom.hexPreview,
            hexNativePicker: dom.hexNativePicker,
            hexApplyBtn: dom.hexApplyBtn,
            hexCancelBtn: dom.hexCancelBtn,
            getCurrentColor: function () { return state.currentTargetInput ? state.currentTargetInput.value : '#ffffff'; },
            onPreview: function (hex, lbl) { _updateInfoReadout(dom, hex, lbl); },
            onApply: function (norm) {
                _applyColorToTargetInput(state, norm);
                window.closeV4ColorPalette();
            }
        });
        _bindColorPaletteEvents(dom, state, hexControls);
        _setupColorPalettePositioning(dom, state, hexControls);

        document.addEventListener('click', function (e) {
            const wrapper = e.target.closest('.v4-color-wrapper');
            if (!wrapper || wrapper.closest('#v4-global-color-palette-popover')) return;
            e.preventDefault();
            e.stopPropagation();
            window.openV4ColorPalette(wrapper);
        });
    };

    // --- Quill Rich Text Toolbar Color Picker Enhancement ---
    function _clampQuillDropdownViewport(pickerEl, optionsEl) {
        if (!pickerEl || !optionsEl) return;
        optionsEl.style.left = '0px';
        optionsEl.style.right = 'auto';
        requestAnimationFrame(function () {
            if (!pickerEl.classList.contains('ql-expanded')) return;
            const rect = optionsEl.getBoundingClientRect();
            if (rect.right > window.innerWidth - 8) {
                optionsEl.style.left = (-Math.round(rect.right - (window.innerWidth - 8))) + 'px';
            }
        });
    }

    function _buildQuillColorExtensions(optionsEl, formatType) {
        // IMPORTANT: Keep .ql-picker-item elements at children[0..N-1] in exact 1:1 order with <select>.options[0..N-1]
        // so Quill 1.3.6 Picker.selectItem() / Picker.update() never suffer child-index offset bugs!
        // Visual ordering (infoBar -> Row 1 -> divider -> Rows 2..9 -> recent -> footer -> hexBar) is controlled via CSS flexbox order.
        const items = optionsEl.querySelectorAll('.ql-picker-item');
        items.forEach(function (it, idx) {
            const v = normalizeHex(it.getAttribute('data-value') || '') || '';
            if (v) it.setAttribute('title', _resolveColorLabel(v) + ' (' + v.toUpperCase() + ')');
            if (idx < 9) it.classList.add('ql-pinned-row-item');
        });

        const infoBar = document.createElement('div');
        infoBar.className = 'ql-palette-info-bar';
        infoBar.innerHTML = '<span class="ql-palette-group-label">Pure Grayscale</span><span class="ql-palette-hex-readout">#000000</span>';

        let divider = null;
        if (items.length >= 9) {
            divider = document.createElement('div');
            divider.className = 'ql-palette-row1-divider';
        }

        const recentWrap = document.createElement('div');
        recentWrap.className = 'ql-palette-recent-wrap';
        recentWrap.style.display = 'none';
        recentWrap.innerHTML =
            '<div class="ql-palette-recent-header"><span class="ql-palette-recent-title">\uCD5C\uADFC \uC0AC\uC6A9 \uC0C9\uC0C1</span><button type="button" class="ql-palette-recent-clear" title="\uCD5C\uADFC \uC0AC\uC6A9 \uC0C9\uC0C1 \uBE44\uC6B0\uAE30">&times;</button></div>' +
            '<div class="ql-palette-recent-grid"></div>';

        const footer = document.createElement('div');
        footer.className = 'ql-custom-color-footer';
        footer.innerHTML =
            '<div class="ql-custom-color-action" title="Hexcode \uC9C1\uC811 \uC124\uC815" style="cursor: pointer;"><span class="material-icons-outlined" style="font-size: 13px; pointer-events: none;">tag</span><span style="pointer-events: none;">\uC9C1\uC811 \uC124\uC815</span></div>' +
            '<button type="button" class="ql-custom-color-reset" title="\uC0C9\uC0C1 \uC81C\uAC70 / \uAE30\uBCF8\uAC12"><span class="material-icons-outlined" style="font-size: 13px;">format_color_reset</span></button>';

        const defaultPreview = formatType === 'color' ? '#000000' : '#fef08a';
        const hexBar = document.createElement('div');
        hexBar.className = 'ql-custom-hex-bar';
        hexBar.innerHTML =
            '<div class="ql-hex-preview-wrap" title="\uCEEC\uB7EC \uD53C\uCEE4 \uC5F4\uAE30 (\uB4DC\uB798\uADF8\uD558\uC5EC \uC120\uD0DD)"><div class="ql-hex-preview" style="background-color: ' + defaultPreview + ';"><span class="material-icons-outlined ql-hex-preview-icon">palette</span></div><input type="color" class="ql-hex-native-picker" tabindex="-1" aria-hidden="true"></div>' +
            '<span class="ql-hex-prefix">#</span><input type="text" class="ql-hex-input" maxlength="7" placeholder="HEXCODE" spellcheck="false" autocomplete="off">' +
            '<button type="button" class="ql-hex-btn ql-hex-btn-apply" title="\uC801\uC6A9"><span class="material-icons-outlined" style="font-size: 14px;">check</span></button>' +
            '<button type="button" class="ql-hex-btn ql-hex-btn-cancel" title="\uCDE8\uC18C"><span class="material-icons-outlined" style="font-size: 14px;">close</span></button>';

        optionsEl.appendChild(infoBar);
        if (divider) optionsEl.appendChild(divider);
        optionsEl.appendChild(recentWrap);
        optionsEl.appendChild(footer);
        optionsEl.appendChild(hexBar);

        return {
            infoLabel: infoBar.querySelector('.ql-palette-group-label'),
            infoHex: infoBar.querySelector('.ql-palette-hex-readout'),
            recentWrap: recentWrap,
            recentGrid: recentWrap.querySelector('.ql-palette-recent-grid'),
            recentClear: recentWrap.querySelector('.ql-palette-recent-clear'),
            footer: footer,
            customAction: footer.querySelector('.ql-custom-color-action'),
            resetBtn: footer.querySelector('.ql-custom-color-reset'),
            hexBar: hexBar,
            hexPreview: hexBar.querySelector('.ql-hex-preview'),
            hexNativePicker: hexBar.querySelector('.ql-hex-native-picker'),
            hexInput: hexBar.querySelector('.ql-hex-input'),
            hexApplyBtn: hexBar.querySelector('.ql-hex-btn-apply'),
            hexCancelBtn: hexBar.querySelector('.ql-hex-btn-cancel')
        };
    }

    function setupCustomColorPicker(pickerEl, formatType) {
        if (!pickerEl) return;
        const optionsEl = pickerEl.querySelector('.ql-picker-options');
        if (!optionsEl || optionsEl.querySelector('.ql-custom-color-footer')) return;

        const ui = _buildQuillColorExtensions(optionsEl, formatType);

        function setQuillReadout(hexVal, labelOverride) {
            const norm = normalizeHex(hexVal) || hexVal || '#000000';
            if (ui.infoLabel) ui.infoLabel.textContent = labelOverride || _resolveColorLabel(norm);
            if (ui.infoHex) ui.infoHex.textContent = String(norm).toUpperCase();
        }

        function getCurrentQuillColor() {
            if (window.quillEditor) {
                const format = window.quillEditor.getFormat();
                if (format && format[formatType]) return format[formatType];
            }
            if (window._currentStickyFormat && window._currentStickyFormat[formatType]) {
                return window._currentStickyFormat[formatType];
            }
            return formatType === 'color' ? '#000000' : '#fef08a';
        }

        let _savedRangeBeforePicker = null;
        let _wasQuillFocusedBeforePicker = false;

        function _captureCurrentQuillRange() {
            if (!window.quillEditor) return;
            _wasQuillFocusedBeforePicker = (document.activeElement === window.quillEditor.root) ||
                (typeof window.quillEditor.hasFocus === 'function' && window.quillEditor.hasFocus());
            try {
                const r = window.quillEditor.getSelection();
                _savedRangeBeforePicker = r ? { index: r.index, length: r.length } : null;
            } catch (_) {
                _savedRangeBeforePicker = null;
            }
        }

        function applyQuillFormat(normHex) {
            _recordRecentColor(normHex);
            if (window.quillEditor) {
                const q = window.quillEditor;
                let liveRange = null;
                try { liveRange = q.getSelection(); } catch (_) {}
                const effectiveRange = (liveRange && liveRange.length > 0)
                    ? liveRange
                    : (_savedRangeBeforePicker || liveRange);

                const rawText = (typeof q.getText === 'function' ? q.getText() : '').replace(/[\n\r\u200B\uFEFF]/g, '').trim();
                const totalLen = typeof q.getLength === 'function' ? q.getLength() : 0;

                if (effectiveRange && effectiveRange.length > 0) {
                    q.setSelection(effectiveRange.index, effectiveRange.length, 'silent');
                    q.formatText(effectiveRange.index, effectiveRange.length, formatType, normHex, 'user');
                } else if (!_wasQuillFocusedBeforePicker && !effectiveRange && rawText.length > 0 && totalLen > 1) {
                    // Object selected on canvas without focusing inside Content Editor -> format whole object text
                    q.formatText(0, totalLen - 1, formatType, normHex, 'user');
                } else {
                    if (effectiveRange) {
                        q.setSelection(effectiveRange.index, 0, 'silent');
                    }
                    q.format(formatType, normHex, 'user');
                }

                if (!window._currentStickyFormat) window._currentStickyFormat = {};
                window._currentStickyFormat[formatType] = normHex;
                if (typeof window.updateQuillAutoContrast === 'function') {
                    window.updateQuillAutoContrast(q);
                }
            }
            const pickerLabelEl = pickerEl.querySelector('.ql-picker-label');
            if (pickerLabelEl) pickerLabelEl.setAttribute('data-value', normHex);
            optionsEl.querySelectorAll('.ql-picker-item').forEach(function (it) {
                const v = (it.getAttribute('data-value') || '').toLowerCase();
                it.classList.toggle('ql-selected', v === normHex.toLowerCase());
            });
            const labelLine = pickerEl.querySelector('.ql-color-label, .ql-bg-label');
            if (labelLine) labelLine.style.stroke = normHex;
        }

        function renderQuillRecents() {
            const recents = _loadRecentColors();
            if (recents.length === 0) {
                ui.recentWrap.style.display = 'none';
                ui.recentGrid.innerHTML = '';
                return;
            }
            ui.recentWrap.style.display = 'block';
            ui.recentGrid.innerHTML = recents.map(function (c) {
                return '<div class="ql-recent-swatch" data-color="' + c + '" style="background-color: ' + c + ';" title="\uCD5C\uADFC \uC0AC\uC6A9 (' + c.toUpperCase() + ')"></div>';
            }).join('');
        }

        const hexControls = _wireHybridHexBar({
            hexBar: ui.hexBar,
            footer: ui.footer,
            hexInput: ui.hexInput,
            hexPreview: ui.hexPreview,
            hexNativePicker: ui.hexNativePicker,
            hexApplyBtn: ui.hexApplyBtn,
            hexCancelBtn: ui.hexCancelBtn,
            getCurrentColor: getCurrentQuillColor,
            onPreview: setQuillReadout,
            onApply: function (norm) {
                applyQuillFormat(norm);
                hexControls.closeHexBar();
                pickerEl.classList.remove('ql-expanded');
            }
        });

        optionsEl.addEventListener('mouseover', function (e) {
            const qlItem = e.target.closest('.ql-picker-item');
            if (qlItem && qlItem.getAttribute('data-value')) {
                setQuillReadout(qlItem.getAttribute('data-value'));
                return;
            }
            const recItem = e.target.closest('.ql-recent-swatch');
            if (recItem) setQuillReadout(recItem.dataset.color, '\uCD5C\uADFC \uC0AC\uC6A9');
        });

        // Capture-phase click handler ensures exact data-value hex is applied with zero index mismatch
        optionsEl.addEventListener('click', function (e) {
            const qlItem = e.target.closest('.ql-picker-item');
            if (qlItem) {
                const rawVal = qlItem.getAttribute('data-value') || '#000000';
                const pickedVal = normalizeHex(rawVal) || rawVal;
                e.preventDefault();
                e.stopPropagation();
                applyQuillFormat(pickedVal);
                hexControls.closeHexBar();
                pickerEl.classList.remove('ql-expanded');
                return;
            }
            const recItem = e.target.closest('.ql-recent-swatch');
            if (recItem) {
                e.stopPropagation();
                applyQuillFormat(recItem.dataset.color);
                hexControls.closeHexBar();
                pickerEl.classList.remove('ql-expanded');
            }
        }, true);

        ui.recentClear.addEventListener('click', function (e) { e.stopPropagation(); _clearRecentColors(); renderQuillRecents(); });
        ui.customAction.addEventListener('click', function (e) { e.stopPropagation(); hexControls.openHexBar(); });

        ui.resetBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (window.quillEditor) {
                window.quillEditor.format(formatType, false);
                if (window._currentStickyFormat) delete window._currentStickyFormat[formatType];
                if (formatType === 'color') {
                    const qlCont = window.quillEditor.container || document.getElementById('editor-container');
                    if (qlCont) qlCont.style.removeProperty('--ql-inherited-text-color');
                }
                if (typeof window.updateQuillAutoContrast === 'function') {
                    window.updateQuillAutoContrast(window.quillEditor);
                }
            }
            const labelLine = pickerEl.querySelector('.ql-color-label, .ql-bg-label');
            if (labelLine) labelLine.style.stroke = '';
            hexControls.closeHexBar();
            pickerEl.classList.remove('ql-expanded');
        });

        const pickerLabel = pickerEl.querySelector('.ql-picker-label');
        if (pickerLabel) {
            pickerLabel.addEventListener('mousedown', function () {
                if (!pickerEl.classList.contains('ql-expanded')) {
                    _captureCurrentQuillRange();
                }
            }, true);
            pickerLabel.addEventListener('click', function () {
                setTimeout(function () {
                    if (pickerEl.classList.contains('ql-expanded')) {
                        renderQuillRecents();
                        setQuillReadout(getCurrentQuillColor());
                        _clampQuillDropdownViewport(pickerEl, optionsEl);
                    } else {
                        hexControls.closeHexBar();
                    }
                }, 0);
            });
        }
    }

    window.setupCustomColorPicker = setupCustomColorPicker;
})();
