/**
 * assets/inspector/inspector_quill.js
 * Quill Rich Text Editor Lifecycle, Custom Typography Pickers & Sticky Formatting Controller.
 * Decoupled from vctrl_inspector.js for single responsibility.
 */
(function() {
    'use strict';
    console.log("[Inspector Quill] Initializing Quill Rich Text Controller...");

    if (typeof window.preserveConsecutiveSpaces !== 'function') {
        window.preserveConsecutiveSpaces = (html) => (window.InspectorTextFormatter?.preserveConsecutiveSpaces ? window.InspectorTextFormatter.preserveConsecutiveSpaces(html) : html);
    }
window.initQuillEditor = function() {
    if (typeof window.initV4GlobalColorPalette === 'function') {
        window.initV4GlobalColorPalette();
    }
    if (window.quillEditor) return;
    const container = document.getElementById('editor-container');
    if (!container) return;

    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['8px', '9px', '10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px', '22px', '24px', '28px', '30px', '36px', '48px', '64px'];
    Quill.register(Size, true);
    const Align = Quill.import('attributors/style/align');
    Quill.register(Align, true);

    const Parchment = Quill.import('parchment');
    const LineHeightStyle = new Parchment.Attributor.Style('lineheight', 'line-height', {
        scope: Parchment.Scope.BLOCK
    });
    Quill.register(LineHeightStyle, true);

    // Sticky Format Cache: 텍스트 삭제 후에도 직전 타이포그래피 서식 기억
    if (!window._currentStickyFormat) {
        window._currentStickyFormat = {
            size: '14px',
            color: '#000000',
            lineheight: '1.5'
        };
    }

    // Register distinct intuitive icons for Text Color and Background Color
    const icons = Quill.import('ui/icons');
    if (icons) {
        icons['color'] = '<svg viewBox="0 0 18 18">' +
            '<path class="ql-stroke" d="M5,12.5 L9,3.5 L13,12.5"></path>' +
            '<path class="ql-stroke" d="M6.5,9 L11.5,9"></path>' +
            '<line class="ql-stroke ql-color-label" x1="2.5" y1="15.5" x2="15.5" y2="15.5" stroke-width="2.5"></line>' +
        '</svg>';
        
        icons['background'] = '<svg viewBox="0 0 18 18">' +
            '<path class="ql-stroke" d="M12.5,3 L15,5.5 L7.5,13 L4,13 L4,9.5 L11.5,2 L12.5,3 Z"></path>' +
            '<path class="ql-fill" d="M4,9.5 L7.5,13 L4,13 Z"></path>' +
            '<line class="ql-stroke ql-bg-label" x1="2.5" y1="15.5" x2="15.5" y2="15.5" stroke-width="2.5"></line>' +
        '</svg>';

        icons['strike'] = '<svg viewBox="0 0 18 18">' +
            '<line class="ql-stroke" x1="2" y1="9" x2="16" y2="9" stroke-width="1.8"></line>' +
            '<path class="ql-stroke" d="M6,4.5 C6.5,3.2 8,2.5 9.5,2.5 C12,2.5 13.5,3.8 13.5,5.5 C13.5,6.8 12.5,7.8 11,8.3" stroke-width="1.6" fill="none"></path>' +
            '<path class="ql-stroke" d="M7,9.7 C5.5,10.2 4.5,11.2 4.5,12.5 C4.5,14.2 6,15.5 8.5,15.5 C11,15.5 12.5,14.5 13,13.2" stroke-width="1.6" fill="none"></path>' +
        '</svg>';
    }

    const colorPalette = window.V4_COMMON_COLOR_PALETTE || [];

    window.quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: [
                [{ 'size': Size.whitelist }],
                [{ 'lineheight': ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': colorPalette }, { 'background': colorPalette }],
                ['clean']
            ]
        }
    });

    // setupCustomColorPicker delegated to vctrl_color_picker.js
    function setupCustomColorPicker(pickerEl, formatType) {
        if (typeof window.setupCustomColorPicker === 'function') {
            window.setupCustomColorPicker(pickerEl, formatType);
        }
    }

    // Universal Line Height Combobox (Keyboard Direct Typing + Click Dropdown + Wheel)
    function setupCustomLineHeightPicker(lhPicker) {
        if (!lhPicker || lhPicker._customLhInitialized) return;
        lhPicker._customLhInitialized = true;

        const pickerLabel = lhPicker.querySelector('.ql-picker-label');
        const optionsEl = lhPicker.querySelector('.ql-picker-options');
        if (!pickerLabel) return;

        // Create or locate direct keyboard key-in input field
        let input = pickerLabel.querySelector('.ql-lineheight-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'ql-lineheight-input';
            input.setAttribute('title', '줄간격 (키보드로 숫자 직접 입력 또는 위/아래 방향키)');
            input.setAttribute('aria-label', '줄간격 배수');
            const initVal = pickerLabel.getAttribute('data-value') || (window._currentStickyFormat && window._currentStickyFormat.lineheight) || '1.5';
            input.value = initVal;

            // Insert input before SVG arrow icon
            const svg = pickerLabel.querySelector('svg');
            if (svg) {
                pickerLabel.insertBefore(input, svg);
            } else {
                pickerLabel.appendChild(input);
            }
            pickerLabel.classList.add('has-input');
        }

        function commitLineHeight(val) {
            let num = parseFloat(val);
            if (isNaN(num)) num = 1.5;
            num = Math.max(0.8, Math.min(4.0, num));
            const formatted = (num % 1 === 0) ? num.toFixed(1) : parseFloat(num.toFixed(2)).toString();

            if (input && document.activeElement !== input) input.value = formatted;
            pickerLabel.setAttribute('data-value', formatted);

            if (!window._currentStickyFormat) window._currentStickyFormat = {};
            window._currentStickyFormat.lineheight = formatted;

            if (window.quillEditor) {
                const range = window.quillEditor.getSelection();
                if (range && range.length > 0) {
                    window.quillEditor.formatLine(range.index, range.length, 'lineheight', formatted, 'user');
                } else {
                    const totalLen = window.quillEditor.getLength();
                    window.quillEditor.formatLine(0, totalLen, 'lineheight', formatted, 'user');
                    window.quillEditor.format('lineheight', formatted, 'user');
                }
            }

            // Real-time canvas sync to Shape / Pin
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.state && window.MessageHub) {
                const activeAlign = (window.state.selectedComponentStyles?.currentStyles?.textAlign) || '';
                const activeVAlign = (window.state.selectedComponentStyles?.currentStyles?.vAlign) || '';
                const rawHtml = window.quillEditor ? window.quillEditor.root.innerHTML : '';
                const cleanHtml = (typeof window.preserveConsecutiveSpaces === 'function') 
                    ? window.preserveConsecutiveSpaces(rawHtml) 
                    : rawHtml;

                if (window.state.editingType === 'shape') {
                    MessageHub.send(iframe.contentWindow, 'LF_UPDATE_SHAPE_TEXT', {
                        html: cleanHtml,
                        align: activeAlign,
                        vAlign: activeVAlign
                    });
                    if (typeof window.markAsDirty === 'function') window.markAsDirty();
                } else if (window.state.editingType === 'pin') {
                    MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', {
                        id: window.state.editingIndex,
                        html: cleanHtml,
                        align: activeAlign,
                        vAlign: activeVAlign
                    });
                    if (typeof window.markAsDirty === 'function') window.markAsDirty();
                }
            }

            // Highlight selected item in options list
            if (optionsEl) {
                optionsEl.querySelectorAll('.ql-picker-item').forEach(item => {
                    if (item.getAttribute('data-value') === formatted) {
                        item.classList.add('ql-selected');
                    } else {
                        item.classList.remove('ql-selected');
                    }
                });
            }
        }
        lhPicker._commitLineHeight = commitLineHeight;

        // Prevent input click/mousedown from bubbling to Quill picker label toggle
        input.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        input.addEventListener('click', (e) => {
            e.stopPropagation();
            input.select();
        });
        input.addEventListener('focus', () => {
            input.select();
        });
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                commitLineHeight(input.value);
                input.value = pickerLabel.getAttribute('data-value') || input.value;
                lhPicker.classList.remove('ql-expanded');
                if (window.quillEditor) window.quillEditor.focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                input.value = pickerLabel.getAttribute('data-value') || window._currentStickyFormat?.lineheight || '1.5';
                lhPicker.classList.remove('ql-expanded');
                if (window.quillEditor) window.quillEditor.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                let cur = parseFloat(input.value) || 1.5;
                commitLineHeight((cur + 0.1).toFixed(1));
                input.select();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                let cur = parseFloat(input.value) || 1.5;
                commitLineHeight(Math.max(0.8, cur - 0.1).toFixed(1));
                input.select();
            }
        });
        input.addEventListener('blur', () => {
            commitLineHeight(input.value);
            input.value = pickerLabel.getAttribute('data-value') || input.value;
        });
        input.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let cur = parseFloat(input.value) || 1.5;
            const delta = e.deltaY < 0 ? 0.1 : -0.1;
            commitLineHeight(Math.max(0.8, Math.min(4.0, cur + delta)).toFixed(1));
            input.select();
        }, { passive: false });

        // Dropdown option item selection and smooth options interactions
        if (optionsEl) {
            optionsEl.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            optionsEl.addEventListener('click', (e) => {
                const item = e.target.closest('.ql-picker-item');
                if (!item) return;
                const val = item.getAttribute('data-value');
                if (val) {
                    if (input) input.value = val;
                    commitLineHeight(val);
                }
                lhPicker.classList.remove('ql-expanded');
            });
        }

        // Close dropdown when input gains focus
        input.addEventListener('focus', () => {
            lhPicker.classList.remove('ql-expanded');
            input.select();
        });
    }
    window.setupCustomLineHeightPicker = setupCustomLineHeightPicker;

    setTimeout(() => {
        const toolbarEl = container.previousElementSibling || document.querySelector('.ql-toolbar');
        if (toolbarEl) {
            const btnSize = toolbarEl.querySelector('.ql-size .ql-picker-label');
            if (btnSize) btnSize.setAttribute('title', '글자 크기 (Font Size)');

            const lhPicker = toolbarEl.querySelector('.ql-lineheight');
            if (lhPicker) {
                const btnLh = lhPicker.querySelector('.ql-picker-label');
                if (btnLh) btnLh.setAttribute('title', '줄간격 (Line Spacing)');
                setupCustomLineHeightPicker(lhPicker);
            }

            const colorPicker = toolbarEl.querySelector('.ql-color');
            if (colorPicker) {
                const btnColor = colorPicker.querySelector('.ql-picker-label');
                if (btnColor) btnColor.setAttribute('title', '글자 색상 (Text Color)');
                setupCustomColorPicker(colorPicker, 'color');
            }

            const bgPicker = toolbarEl.querySelector('.ql-background');
            if (bgPicker) {
                const btnBg = bgPicker.querySelector('.ql-picker-label');
                if (btnBg) btnBg.setAttribute('title', '배경 색상 / 형광펜 (Background Color)');
                setupCustomColorPicker(bgPicker, 'background');
            }

            const btnBold = toolbarEl.querySelector('.ql-bold');
            if (btnBold) btnBold.setAttribute('title', '굵게 (Bold)');

            const btnItalic = toolbarEl.querySelector('.ql-italic');
            if (btnItalic) btnItalic.setAttribute('title', '기울임 (Italic)');

            const btnUnderline = toolbarEl.querySelector('.ql-underline');
            if (btnUnderline) btnUnderline.setAttribute('title', '밑줄 (Underline)');

            const btnStrike = toolbarEl.querySelector('.ql-strike');
            if (btnStrike) btnStrike.setAttribute('title', '취소선 (Strikethrough)');

            const btnClean = toolbarEl.querySelector('.ql-clean');
            if (btnClean) btnClean.setAttribute('title', '서식 지우기 (Clear Formatting)');
        }
    }, 0);

    // Selection change: 빈 에디터 진입 시 Sticky Format 유지 및 커서 서식 갱신
    window.quillEditor.on('selection-change', (range) => {
        if (!range || state._isLoadingShapeContent) return;
        const plainText = window.quillEditor.getText().replace(/\n/g, '').trim();
        if (plainText.length === 0 && window._currentStickyFormat) {
            Object.keys(window._currentStickyFormat).forEach(key => {
                const val = window._currentStickyFormat[key];
                if (val !== undefined && val !== false && val !== null) {
                    window.quillEditor.format(key, val, 'silent');
                }
            });
        } else if (plainText.length > 0) {
            const curFormat = window.quillEditor.getFormat(range);
            if (curFormat && Object.keys(curFormat).length > 0) {
                window._currentStickyFormat = { ...window._currentStickyFormat, ...curFormat };
            }
            const lhPicker = document.querySelector('.ql-toolbar .ql-lineheight');
            if (lhPicker) {
                if (typeof setupCustomLineHeightPicker === 'function' && !lhPicker._customLhInitialized) {
                    setupCustomLineHeightPicker(lhPicker);
                }
                const activeLh = (curFormat && curFormat.lineheight) || (window._currentStickyFormat && window._currentStickyFormat.lineheight) || '1.5';
                const lhPickerLabel = lhPicker.querySelector('.ql-picker-label');
                if (lhPickerLabel) lhPickerLabel.setAttribute('data-value', activeLh);
                const lhInput = lhPicker.querySelector('.ql-lineheight-input');
                if (lhInput && document.activeElement !== lhInput) lhInput.value = activeLh;
            }
        }
    });

    window.quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1 || state._isLoadingShapeContent) return;
        
        // Sticky Format 유지 관리
        const plainText = window.quillEditor.getText().replace(/\n/g, '').trim();
        if (plainText.length > 0) {
            const curFormat = window.quillEditor.getFormat();
            if (curFormat && Object.keys(curFormat).length > 0) {
                window._currentStickyFormat = { ...window._currentStickyFormat, ...curFormat };
            }
        } else {
            // 텍스트를 모두 지운 경우: 마지막 서식이 소멸하지 않도록 에디터 커서에 지속 서식 재적용
            if (window._currentStickyFormat) {
                requestAnimationFrame(() => {
                    if (window.quillEditor && window.quillEditor.getText().replace(/\n/g, '').trim().length === 0) {
                        Object.keys(window._currentStickyFormat).forEach(key => {
                            const val = window._currentStickyFormat[key];
                            if (val !== undefined && val !== false && val !== null) {
                                window.quillEditor.format(key, val, 'silent');
                            }
                        });
                    }
                });
            }
        }

        const rawHtml = window.quillEditor.root.innerHTML;
        const html = preserveConsecutiveSpaces(rawHtml);
        const activeAlign = (window.state && window.state.selectedComponentStyles && window.state.selectedComponentStyles.currentStyles && window.state.selectedComponentStyles.currentStyles.textAlign) || 
                            (window.quillEditor && window.quillEditor.root && window.quillEditor.root.style.textAlign) || '';
        const activeVAlign = (window.state && window.state.selectedComponentStyles && window.state.selectedComponentStyles.currentStyles && (window.state.selectedComponentStyles.currentStyles.vAlign || window.state.selectedComponentStyles.currentStyles.justifyContent)) || '';
        if (state.editingType === 'pin') {
            // Update description array (legacy compat)
            const list = state.activeFile?.meta?.description;
            if (list && list[state.editingIndex]) {
                list[state.editingIndex].html = html;
                list[state.editingIndex].text = window.quillEditor.getText().trim();
            }
            // Also sync to iframe DOM directly
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                const compId = state.editingIndex;
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                    id: compId,
                    html: html,
                    align: activeAlign,
                    vAlign: activeVAlign
                });
            }
            markAsDirty();
        } else if (state.editingType === 'shape') {
            // Shape 텍스트 업데이트: 선택된 shape 내부 innerHTML 교체
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_SHAPE_TEXT', { 
                    html: html,
                    align: activeAlign,
                    vAlign: activeVAlign
                });
                markAsDirty();
            }
        } else {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                    id: state.editingIndex,
                    html: html,
                    align: activeAlign,
                    vAlign: activeVAlign
                });
                markAsDirty();
            }
        }
    });
};

// Subscribe to direct iframe text changes to sync Quill editor in real-time
if (window.MessageHub) {
    MessageHub.subscribe('LF_PIN_TEXT_CHANGED', (data) => {
        if (!window.quillEditor || !data) return;
        
        const isMatch = (state.editingIndex === data.id) ||
                        (state.editingIndex === data.compId) ||
                        (state.selectedIds && (state.selectedIds.includes(data.id) || state.selectedIds.includes(data.compId)));

        if (isMatch) {
            // Prevent feedback loop: tell the Quill change listener that we are programmatically updating the text
            state._isLoadingShapeContent = true;
            
            const rawHtml = data.html || '';
            const fallbackFs = state.selectedComponent?.currentStyles?.fontSize;
            let cleanHtml = (typeof window.normalizeHtmlForQuill === 'function')
                ? window.normalizeHtmlForQuill(rawHtml, fallbackFs)
                : rawHtml;
            
            // Sync to description list metadata if it's a description pin
            if (state.editingType === 'pin' && typeof state.editingIndex === 'number') {
                const list = state.activeFile?.meta?.description;
                if (list && list[state.editingIndex]) {
                    list[state.editingIndex].html = cleanHtml;
                    const tmp = document.createElement('div');
                    tmp.innerHTML = cleanHtml;
                    list[state.editingIndex].text = tmp.innerText.trim();
                }
            }

            const wasQuillFocused = document.activeElement === window.quillEditor.root;
            
            window.quillEditor.clipboard.dangerouslyPasteHTML(cleanHtml, 'silent');
            
            // Sticky Format 갱신
            if (fallbackFs) {
                const fsPx = typeof fallbackFs === 'number' ? fallbackFs + 'px' : (fallbackFs.endsWith('px') ? fallbackFs : fallbackFs + 'px');
                window._currentStickyFormat = { ...window._currentStickyFormat, size: fsPx };
            }
            const curFmt = window.quillEditor.getFormat();
            if (curFmt && Object.keys(curFmt).length > 0) {
                window._currentStickyFormat = { ...window._currentStickyFormat, ...curFmt };
            }

            if (wasQuillFocused) {
                window.quillEditor.setSelection(0, 0);
            }
            
            setTimeout(() => {
                state._isLoadingShapeContent = false;
            }, 100);
        }
    });
}

// Screen edit and copy handlers delegated to vctrl_screen_manager.js

})();