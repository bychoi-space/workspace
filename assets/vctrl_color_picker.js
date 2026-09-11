/**
 * assets/vctrl_color_picker.js
 * Domain Module: Universal Color Palette, Swatch Popover, and Rich-Text Custom Color Pickers.
 */
(function() {
    console.log("[VCTRL COLOR PICKER] Module loaded.");

window.V4_COMMON_COLOR_PALETTE = [
    // 1. Grayscale (7)
    '#000000', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
    // 2. Red / Coral (7)
    '#7f1d1d', '#991b1b', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fee2e2',
    // 3. Orange / Amber (7)
    '#7c2d12', '#9a3412', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#ffedd5',
    // 4. Yellow / Gold (7)
    '#713f12', '#854d0e', '#ca8a04', '#eab308', '#facc15', '#fde047', '#fef9c3',
    // 5. Green / Emerald (7)
    '#064e3b', '#065f46', '#059669', '#10b981', '#34d399', '#6ee7b7', '#ecfdf5',
    // 6. Teal / Cyan (7)
    '#134e4a', '#115e59', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#f0fdfa',
    // 7. Blue / Sky (7)
    '#0c4a6e', '#075985', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#f0f9ff',
    // 8. Indigo / Violet (7)
    '#312e81', '#3730a3', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#eef2ff',
    // 9. Purple / Fuchsia (7)
    '#581c87', '#6b21a8', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#faf5ff',
    // 10. Pink / Rose (7)
    '#701a75', '#86198f', '#c026d3', '#d946ef', '#e879f9', '#f0abfc', '#fdf4ff',
    // 11. Brown / Warm (7)
    '#451a03', '#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fef3c7'
];

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
                <div class="v4-palette-custom-action" title="원하는 색상 직접 선택" style="position: relative; overflow: hidden; cursor: pointer;">
                    <span class="material-icons-outlined" style="font-size: 13px; pointer-events: none;">palette</span>
                    <span style="pointer-events: none;">직접 선택</span>
                    <input type="color" class="v4-palette-native-input" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; padding: 0; margin: 0; z-index: 2;">
                </div>
                <button type="button" class="v4-palette-reset-btn" title="투명 / 색상 제거">
                    <span class="material-icons-outlined" style="font-size: 13px;">block</span>
                </button>
            </div>
        `;
        document.body.appendChild(popover);

        const grid = popover.querySelector('.v4-palette-grid');
        grid.innerHTML = window.V4_COMMON_COLOR_PALETTE.map(c => `
            <div class="v4-palette-item" data-color="${c}" style="background-color: ${c};" title="${c}"></div>
        `).join('');

        const nativeInput = popover.querySelector('.v4-palette-native-input');
        const customAction = popover.querySelector('.v4-palette-custom-action');
        const resetBtn = popover.querySelector('.v4-palette-reset-btn');

        let currentActiveWrapper = null;
        let currentTargetInput = null;

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

        nativeInput.addEventListener('input', (e) => {
            if (!currentTargetInput) return;
            currentTargetInput.value = e.target.value;
            currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
            if (currentActiveWrapper) currentActiveWrapper.classList.remove('transparent-active');
        });

        nativeInput.addEventListener('change', (e) => {
            if (!currentTargetInput) return;
            currentTargetInput.value = e.target.value;
            currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
            currentTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
            if (currentActiveWrapper) currentActiveWrapper.classList.remove('transparent-active');
            window.closeV4ColorPalette();
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

            const curVal = (currentTargetInput.value || '#ffffff').toLowerCase();
            if (nativeInput) {
                nativeInput.value = (curVal.startsWith('#') && (curVal.length === 7 || curVal.length === 4)) ? curVal : '#ffffff';
            }
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
            popover.classList.remove('active');
            currentActiveWrapper = null;
            currentTargetInput = null;
        };

        // Close on outside click
        document.addEventListener('mousedown', (e) => {
            if (!popover.classList.contains('active')) return;
            if (popover.contains(e.target) || e.target.closest('.v4-color-wrapper')) return;
            window.closeV4ColorPalette();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popover.classList.contains('active')) {
                window.closeV4ColorPalette();
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
            <div class="ql-custom-color-action" title="원하는 색상 직접 선택" style="position: relative; overflow: hidden; cursor: pointer;">
                <span class="material-icons-outlined" style="font-size: 13px; pointer-events: none;">palette</span>
                <span style="pointer-events: none;">직접 선택</span>
                <input type="color" class="ql-custom-color-input" value="${formatType === 'color' ? '#6366f1' : '#facc15'}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; padding: 0; margin: 0; z-index: 2;">
            </div>
            <button type="button" class="ql-custom-color-reset" title="색상 제거 / 기본값">
                <span class="material-icons-outlined" style="font-size: 13px;">format_color_reset</span>
            </button>
        `;

        const input = footer.querySelector('.ql-custom-color-input');
        const resetBtn = footer.querySelector('.ql-custom-color-reset');

        input.addEventListener('input', (e) => {
            if (window.quillEditor) {
                window.quillEditor.format(formatType, e.target.value);
                if (!window._currentStickyFormat) window._currentStickyFormat = {};
                window._currentStickyFormat[formatType] = e.target.value;
            }
        });

        input.addEventListener('change', (e) => {
            if (window.quillEditor) {
                window.quillEditor.format(formatType, e.target.value);
                if (!window._currentStickyFormat) window._currentStickyFormat = {};
                window._currentStickyFormat[formatType] = e.target.value;
            }
            pickerEl.classList.remove('ql-expanded');
        });

        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.quillEditor) {
                window.quillEditor.format(formatType, false);
                if (window._currentStickyFormat) {
                    delete window._currentStickyFormat[formatType];
                }
            }
            pickerEl.classList.remove('ql-expanded');
        });

        optionsEl.appendChild(footer);
    }

    window.setupCustomColorPicker = setupCustomColorPicker;
})();
