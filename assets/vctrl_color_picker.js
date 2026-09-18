/**
 * assets/vctrl_color_picker.js
 * Domain Module: Universal Color Palette, Swatch Popover, and Rich-Text Custom Color Pickers.
 */
(function() {
    console.log("[VCTRL COLOR PICKER] Module loaded.");

window.V4_COMMON_COLOR_PALETTE = [
    // 1. Grayscale - Neutral Gray (7)
    '#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff',
    // 2. Grayscale - Cool Slate (7)
    '#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f8fafc',
    // 3. Grayscale - Warm Stone (7)
    '#1c1917', '#44403c', '#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4', '#f5f5f4',
    // 4. Blue - Deep Navy / Midnight (7)
    '#0b192c', '#1e3a8a', '#1d4ed8', '#3b82f6', '#93c5fd', '#dbeafe', '#eff6ff',
    // 5. Blue - Classic & Sky Blue (7)
    '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe',
    // 6. Blue / Indigo - Indigo & Lavender Blue (7)
    '#312e81', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#eef2ff',
    // 7. Teal / Cyan - Teal & Ice Cyan (7)
    '#134e4a', '#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#f0fdfa',
    // 8. Green - Emerald & Soft Sage (7)
    '#064e3b', '#047857', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ecfdf5',
    // 9. Yellow / Amber - Butter & Soft Yellow (7)
    '#713f12', '#ca8a04', '#eab308', '#facc15', '#fde047', '#fef08a', '#fef9c3',
    // 10. Orange - Peach & Soft Coral (7)
    '#7c2d12', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fff7ed',
    // 11. Red / Rose - Rose & Soft Red (7)
    '#881337', '#be123c', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#fff1f2',
    // 12. Purple - Lavender & Soft Violet (7)
    '#581c87', '#7e22ce', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#faf5ff'
];

    function normalizeHex(input) {
        if (!input || typeof input !== 'string') return null;
        let hex = input.trim().replace(/^#/, '');
        // 3-digit shorthand (#abc -> #aabbcc)
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
            hex = hex.split('').map(c => c + c).join('');
        }
        // 6-digit hex validation
        if (/^[0-9a-fA-F]{6}$/.test(hex)) {
            return '#' + hex.toLowerCase();
        }
        return null;
    }

window.initV4GlobalColorPalette = function() {
    if (window._v4ColorPaletteInitialized) return;
    window._v4ColorPaletteInitialized = true;

    let popover = document.getElementById('v4-global-color-palette-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'v4-global-color-palette-popover';
        popover.innerHTML = `
            <div class="v4-palette-grid"></div>
            <div class="v4-palette-footer">
                <div class="v4-palette-custom-action" title="Hexcode 직접 설정" style="cursor: pointer;">
                    <span class="material-icons-outlined" style="font-size: 13px; pointer-events: none;">tag</span>
                    <span style="pointer-events: none;">직접 설정</span>
                </div>
                <button type="button" class="v4-palette-reset-btn" title="투명 / 색상 제거">
                    <span class="material-icons-outlined" style="font-size: 13px;">block</span>
                </button>
            </div>
            <div class="v4-palette-hex-bar">
                <div class="v4-hex-preview" style="background-color: #ffffff;" title="색상 미리보기"></div>
                <span class="v4-hex-prefix">#</span>
                <input type="text" class="v4-hex-input" maxlength="7" placeholder="HEXCODE" spellcheck="false" autocomplete="off">
                <button type="button" class="v4-hex-btn v4-hex-btn-apply" title="적용">
                    <span class="material-icons-outlined" style="font-size: 14px;">check</span>
                </button>
                <button type="button" class="v4-hex-btn v4-hex-btn-cancel" title="취소">
                    <span class="material-icons-outlined" style="font-size: 14px;">close</span>
                </button>
            </div>
        `;
        document.body.appendChild(popover);

        const grid = popover.querySelector('.v4-palette-grid');
        grid.innerHTML = window.V4_COMMON_COLOR_PALETTE.map(c => `
            <div class="v4-palette-item" data-color="${c}" style="background-color: ${c};" title="${c}"></div>
        `).join('');

        const footer = popover.querySelector('.v4-palette-footer');
        const customAction = popover.querySelector('.v4-palette-custom-action');
        const resetBtn = popover.querySelector('.v4-palette-reset-btn');

        const hexBar = popover.querySelector('.v4-palette-hex-bar');
        const hexPreview = popover.querySelector('.v4-hex-preview');
        const hexInput = popover.querySelector('.v4-hex-input');
        const hexApplyBtn = popover.querySelector('.v4-hex-btn-apply');
        const hexCancelBtn = popover.querySelector('.v4-hex-btn-cancel');

        let currentActiveWrapper = null;
        let currentTargetInput = null;

        function closeHexBar() {
            if (hexBar) hexBar.classList.remove('active');
            if (footer) footer.style.display = 'flex';
            if (hexInput) hexInput.classList.remove('error');
        }

        function openHexBar() {
            if (!hexBar || !footer) return;
            footer.style.display = 'none';
            hexBar.classList.add('active');

            const curVal = (currentTargetInput && currentTargetInput.value ? currentTargetInput.value : '#ffffff').toLowerCase();
            const cleanHex = curVal.replace(/^#/, '').toUpperCase();
            if (hexInput) {
                hexInput.value = cleanHex;
                hexInput.classList.remove('error');
            }
            if (hexPreview) {
                hexPreview.style.backgroundColor = (curVal.startsWith('#') && (curVal.length === 7 || curVal.length === 4)) ? curVal : '#ffffff';
            }
            setTimeout(() => {
                if (hexInput) {
                    hexInput.focus();
                    hexInput.select();
                }
            }, 10);
        }

        function applyHexColor() {
            if (!hexInput) return;
            const norm = normalizeHex(hexInput.value);
            if (!norm) {
                hexInput.classList.add('error');
                setTimeout(() => {
                    if (hexInput) hexInput.classList.remove('error');
                }, 500);
                return;
            }

            if (currentTargetInput) {
                currentTargetInput.value = norm;
                currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
                currentTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (currentActiveWrapper) {
                currentActiveWrapper.classList.remove('transparent-active');
            }
            window.closeV4ColorPalette();
        }

        // Swatch click
        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.v4-palette-item');
            if (!item || !currentTargetInput) return;
            const hex = item.dataset.color;
            currentTargetInput.value = hex;
            currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
            currentTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
            if (currentActiveWrapper) currentActiveWrapper.classList.remove('transparent-active');
            window.closeV4ColorPalette();
        });

        // Custom action -> Open Hex Bar
        customAction.addEventListener('click', (e) => {
            e.stopPropagation();
            openHexBar();
        });

        // Hex Input real-time preview & keyboard event isolation
        hexInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const norm = normalizeHex(val);
            if (norm && hexPreview) {
                hexPreview.style.backgroundColor = norm;
                hexInput.classList.remove('error');
            }
        });

        hexInput.addEventListener('keydown', (e) => {
            e.stopPropagation(); // Stop propagation to prevent global shortcuts (delete, fullscreen, nudge, etc.)
            if (e.key === 'Enter') {
                e.preventDefault();
                applyHexColor();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeHexBar();
            }
        });
        hexInput.addEventListener('keyup', (e) => e.stopPropagation());
        hexInput.addEventListener('keypress', (e) => e.stopPropagation());

        hexApplyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyHexColor();
        });

        hexCancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeHexBar();
        });

        // Reset / Transparent
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentActiveWrapper) return;
            const propGroup = currentActiveWrapper.closest('.prop-group');
            const noneBtn = propGroup ? propGroup.querySelector('.v4-color-none-btn') : null;
            if (noneBtn) {
                noneBtn.click();
            } else if (currentTargetInput) {
                currentTargetInput.value = 'transparent';
                currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
                currentTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
                currentActiveWrapper.classList.add('transparent-active');
            }
            window.closeV4ColorPalette();
        });

        window.openV4ColorPalette = function(wrapperEl) {
            if (!wrapperEl) return;
            currentActiveWrapper = wrapperEl;
            currentTargetInput = wrapperEl.querySelector('input[type="color"], .v4-color-input');
            if (!currentTargetInput) return;

            closeHexBar();

            const curVal = (currentTargetInput.value || '#ffffff').toLowerCase();
            popover.querySelectorAll('.v4-palette-item').forEach(it => {
                if (it.dataset.color.toLowerCase() === curVal) {
                    it.classList.add('selected');
                } else {
                    it.classList.remove('selected');
                }
            });

            // Position calculation
            popover.classList.add('active');
            const rect = wrapperEl.getBoundingClientRect();
            const popRect = popover.getBoundingClientRect();
            
            let top = rect.bottom + 4;
            let left = rect.left;

            // Flip top if bottom overflows viewport
            if (top + popRect.height > window.innerHeight - 10) {
                top = Math.max(10, rect.top - popRect.height - 4);
            }
            // Clamp left
            if (left + popRect.width > window.innerWidth - 10) {
                left = Math.max(10, window.innerWidth - popRect.width - 10);
            }

            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
        };

        window.closeV4ColorPalette = function() {
            closeHexBar();
            popover.classList.remove('active');
            currentActiveWrapper = null;
            currentTargetInput = null;
        };

        // Auto-close on object deselection via MessageHub
        if (window.MessageHub) {
            window.MessageHub.subscribe('LF_DESELECT', () => {
                window.closeV4ColorPalette();
            });
            window.MessageHub.subscribe('LF_COMP_DESELECTED', () => {
                window.closeV4ColorPalette();
            });
        }

        // Auto-close when clicking inside an iframe (parent window blurs and activeElement becomes IFRAME)
        window.addEventListener('blur', () => {
            if (popover && popover.classList.contains('active')) {
                if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                    window.closeV4ColorPalette();
                }
            }
        });

        // Close on outside click
        document.addEventListener('mousedown', (e) => {
            if (!popover.classList.contains('active')) return;
            if (popover.contains(e.target) || e.target.closest('.v4-color-wrapper')) return;
            window.closeV4ColorPalette();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popover.classList.contains('active')) {
                if (hexBar && hexBar.classList.contains('active')) {
                    closeHexBar();
                } else {
                    window.closeV4ColorPalette();
                }
            }
        });
    }

    // Global event delegation for .v4-color-wrapper clicks
    document.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.v4-color-wrapper');
        if (!wrapper) return;
        if (wrapper.closest('#v4-global-color-palette-popover')) return;
        
        e.preventDefault();
        e.stopPropagation();
        window.openV4ColorPalette(wrapper);
    });
};


    function setupCustomColorPicker(pickerEl, formatType) {
        if (!pickerEl) return;
        const optionsEl = pickerEl.querySelector('.ql-picker-options');
        if (!optionsEl || optionsEl.querySelector('.ql-custom-color-footer')) return;

        const footer = document.createElement('div');
        footer.className = 'ql-custom-color-footer';
        footer.innerHTML = `
            <div class="ql-custom-color-action" title="Hexcode 직접 설정" style="cursor: pointer;">
                <span class="material-icons-outlined" style="font-size: 13px; pointer-events: none;">tag</span>
                <span style="pointer-events: none;">직접 설정</span>
            </div>
            <button type="button" class="ql-custom-color-reset" title="색상 제거 / 기본값">
                <span class="material-icons-outlined" style="font-size: 13px;">format_color_reset</span>
            </button>
        `;

        const hexBar = document.createElement('div');
        hexBar.className = 'ql-custom-hex-bar';
        hexBar.innerHTML = `
            <div class="ql-hex-preview" style="background-color: ${formatType === 'color' ? '#6366f1' : '#facc15'};" title="색상 미리보기"></div>
            <span class="ql-hex-prefix">#</span>
            <input type="text" class="ql-hex-input" maxlength="7" placeholder="HEXCODE" spellcheck="false" autocomplete="off">
            <button type="button" class="ql-hex-btn ql-hex-btn-apply" title="적용">
                <span class="material-icons-outlined" style="font-size: 14px;">check</span>
            </button>
            <button type="button" class="ql-hex-btn ql-hex-btn-cancel" title="취소">
                <span class="material-icons-outlined" style="font-size: 14px;">close</span>
            </button>
        `;

        const customAction = footer.querySelector('.ql-custom-color-action');
        const resetBtn = footer.querySelector('.ql-custom-color-reset');

        const hexPreview = hexBar.querySelector('.ql-hex-preview');
        const hexInput = hexBar.querySelector('.ql-hex-input');
        const hexApplyBtn = hexBar.querySelector('.ql-hex-btn-apply');
        const hexCancelBtn = hexBar.querySelector('.ql-hex-btn-cancel');

        function closeHexBar() {
            hexBar.classList.remove('active');
            footer.style.display = 'flex';
            if (hexInput) hexInput.classList.remove('error');
        }

        function getCurrentQuillColor() {
            if (window.quillEditor) {
                const format = window.quillEditor.getFormat();
                if (format && format[formatType]) {
                    return format[formatType];
                }
            }
            if (window._currentStickyFormat && window._currentStickyFormat[formatType]) {
                return window._currentStickyFormat[formatType];
            }
            return formatType === 'color' ? '#6366f1' : '#facc15';
        }

        function openHexBar() {
            footer.style.display = 'none';
            hexBar.classList.add('active');

            const curVal = getCurrentQuillColor();
            const cleanHex = curVal.replace(/^#/, '').toUpperCase();
            if (hexInput) {
                hexInput.value = cleanHex;
                hexInput.classList.remove('error');
            }
            if (hexPreview) {
                hexPreview.style.backgroundColor = curVal.startsWith('#') ? curVal : (typeof window.rgbToHex === 'function' ? window.rgbToHex(curVal) : curVal);
            }
            setTimeout(() => {
                if (hexInput) {
                    hexInput.focus();
                    hexInput.select();
                }
            }, 10);
        }

        function applyHexColor() {
            if (!hexInput) return;
            const norm = normalizeHex(hexInput.value);
            if (!norm) {
                hexInput.classList.add('error');
                setTimeout(() => {
                    if (hexInput) hexInput.classList.remove('error');
                }, 500);
                return;
            }

            if (window.quillEditor) {
                window.quillEditor.format(formatType, norm);
                if (!window._currentStickyFormat) window._currentStickyFormat = {};
                window._currentStickyFormat[formatType] = norm;
            }
            closeHexBar();
            pickerEl.classList.remove('ql-expanded');
        }

        customAction.addEventListener('click', (e) => {
            e.stopPropagation();
            openHexBar();
        });

        hexInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const norm = normalizeHex(val);
            if (norm && hexPreview) {
                hexPreview.style.backgroundColor = norm;
                hexInput.classList.remove('error');
            }
        });

        hexInput.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                applyHexColor();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeHexBar();
            }
        });
        hexInput.addEventListener('keyup', (e) => e.stopPropagation());
        hexInput.addEventListener('keypress', (e) => e.stopPropagation());

        hexApplyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyHexColor();
        });

        hexCancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeHexBar();
        });

        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.quillEditor) {
                window.quillEditor.format(formatType, false);
                if (window._currentStickyFormat) {
                    delete window._currentStickyFormat[formatType];
                }
            }
            closeHexBar();
            pickerEl.classList.remove('ql-expanded');
        });

        // Close hex bar when picker collapses
        const pickerLabel = pickerEl.querySelector('.ql-picker-label');
        if (pickerLabel) {
            pickerLabel.addEventListener('click', () => {
                if (!pickerEl.classList.contains('ql-expanded')) {
                    closeHexBar();
                }
            });
        }

        optionsEl.appendChild(footer);
        optionsEl.appendChild(hexBar);
    }

    window.setupCustomColorPicker = setupCustomColorPicker;
})();
