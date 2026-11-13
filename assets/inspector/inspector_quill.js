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
    // 1. Register Custom Attributors (Font Size, Align, Line Height)
    function _initQuillAttributors(Quill) {
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
        return Size;
    }

    // 2. Register Intuitive Icons for Color, Background and Strikethrough
    function _initQuillIcons(Quill) {
        const icons = Quill.import('ui/icons');
        if (!icons) return;

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

    // 3. Sticky Format Cache
    function _initStickyFormatCache() {
        if (!window._currentStickyFormat) {
            window._currentStickyFormat = {
                size: '14px',
                color: '#000000',
                lineheight: '1.5'
            };
        }
    }

    // 4. Color Picker Delegation Helper
    function applyCustomColorPicker(pickerEl, formatType) {
        if (typeof window.setupCustomColorPicker === 'function') {
            window.setupCustomColorPicker(pickerEl, formatType);
        }
    }

    // 5. Line Height Combobox Setup
    function setupCustomLineHeightPicker(lhPicker) {
        if (!lhPicker || lhPicker._customLhInitialized) return;
        lhPicker._customLhInitialized = true;

        const pickerLabel = lhPicker.querySelector('.ql-picker-label');
        const optionsEl = lhPicker.querySelector('.ql-picker-options');
        if (!pickerLabel) return;

        let input = pickerLabel.querySelector('.ql-lineheight-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'ql-lineheight-input';
            input.setAttribute('title', '줄간격 (키보드로 숫자 직접 입력 또는 위/아래 방향키)');
            input.setAttribute('aria-label', '줄간격 배수');
            const initVal = pickerLabel.getAttribute('data-value') || (window._currentStickyFormat && window._currentStickyFormat.lineheight) || '1.5';
            input.value = initVal;

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
                        id: window.state.editingIndex,
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

        input.addEventListener('mousedown', (e) => e.stopPropagation());
        input.addEventListener('click', (e) => { e.stopPropagation(); input.select(); });
        input.addEventListener('focus', () => input.select());
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

        if (optionsEl) {
            optionsEl.addEventListener('mousedown', (e) => e.stopPropagation());
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

        input.addEventListener('focus', () => {
            lhPicker.classList.remove('ql-expanded');
            input.select();
        });
    }
    window.setupCustomLineHeightPicker = setupCustomLineHeightPicker;

    // 6. Setup Toolbar Tooltips and Handlers
    function _setupQuillToolbarTooltips(toolbarEl) {
        if (!toolbarEl) return;
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
            applyCustomColorPicker(colorPicker, 'color');
        }

        const bgPicker = toolbarEl.querySelector('.ql-background');
        if (bgPicker) {
            const btnBg = bgPicker.querySelector('.ql-picker-label');
            if (btnBg) btnBg.setAttribute('title', '배경 색상 / 형광펜 (Background Color)');
            applyCustomColorPicker(bgPicker, 'background');
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

    const BLOCK_STICKY_FORMAT_KEYS = new Set([
        'align', 'lineheight', 'header', 'list', 'blockquote', 'indent', 'direction', 'code-block'
    ]);

    let _isImeComposing = false;
    let _isApplyingStickyFormat = false;
    let _pendingEmptyStickyMicrotask = false;
    let _lastQuillUserInteractTs = 0;

    function _stripInvisibleQuillChars(str) {
        if (!str || typeof str !== 'string') return '';
        return str.replace(/[\n\r\u200B\uFEFF]/g, '').trim();
    }

    function _getCleanPlainText(quillInstance) {
        const q = quillInstance || window.quillEditor;
        if (!q || typeof q.getText !== 'function') return '';
        return _stripInvisibleQuillChars(q.getText());
    }

    function _hasUncommittedDomText(quillInstance) {
        if (!quillInstance || !quillInstance.root) return false;
        return _stripInvisibleQuillChars(quillInstance.root.textContent || '').length > 0;
    }

    function _focusQuillRootSafely(quillInstance) {
        if (!quillInstance || !quillInstance.root) return;
        if (document.activeElement !== quillInstance.root) {
            try {
                quillInstance.root.focus({ preventScroll: true });
            } catch (_) {
                try { quillInstance.root.focus(); } catch (__) {}
            }
        }
    }

    /**
     * Safely restores sticky formatting on an empty Quill editor without detaching
     * Quill's CursorBlot (.ql-cursor), breaking Korean IME composition, or dropping DOM focus.
     * Block-scoped formats (align, lineheight) MUST be applied before inline formats so
     * Quill 1.3.6 formatLine() + setSelection() never clobbers the inline CursorBlot caret.
     */
    function _restoreStickyFormatWhenEmpty(quillInstance, forceKeepFocus) {
        if (!quillInstance || !window._currentStickyFormat || state._isLoadingShapeContent) return;
        if (_isApplyingStickyFormat) return;
        if (_isImeComposing || (quillInstance.selection && quillInstance.selection.composing)) return;
        if (_getCleanPlainText(quillInstance).length > 0 || _hasUncommittedDomText(quillInstance)) return;

        const isCurrentlyFocused = (document.activeElement === quillInstance.root) ||
            (typeof quillInstance.hasFocus === 'function' && quillInstance.hasFocus());
        const shouldKeepFocus = Boolean(forceKeepFocus) || isCurrentlyFocused;
        if (!shouldKeepFocus) return;

        _isApplyingStickyFormat = true;
        try {
            const sticky = window._currentStickyFormat;
            const firstLine = quillInstance.root ? quillInstance.root.querySelector('p, div') : null;

            // 1. Apply BLOCK-scoped formats first (only when DOM differs, normalizing 'left' -> false)
            const stickyAlign = sticky.align || 'left';
            if (quillInstance.root) {
                quillInstance.root.style.textAlign = stickyAlign;
            }
            const targetQuillAlign = (stickyAlign === 'left' || !stickyAlign) ? false : stickyAlign;
            const curDomAlign = (firstLine && firstLine.style.textAlign) ? firstLine.style.textAlign : false;
            if (curDomAlign !== targetQuillAlign) {
                quillInstance.formatLine(0, 1, 'align', targetQuillAlign, 'silent');
            }

            if (sticky.lineheight !== undefined && sticky.lineheight !== false && sticky.lineheight !== null) {
                const targetLh = String(sticky.lineheight);
                const curDomLh = (firstLine && firstLine.style.lineHeight) ? String(firstLine.style.lineHeight) : '';
                if (curDomLh !== targetLh) {
                    quillInstance.formatLine(0, 1, 'lineheight', targetLh, 'silent');
                }
            }

            // 2. Guarantee live DOM focus & valid collapsed native selection at (0, 0) before inline formatting
            _focusQuillRootSafely(quillInstance);
            const natBefore = (quillInstance.selection && typeof quillInstance.selection.getNativeRange === 'function')
                ? quillInstance.selection.getNativeRange()
                : null;
            if (!natBefore) {
                quillInstance.setSelection(0, 0, 'silent');
            }

            // 3. Apply INLINE-scoped formats second so CursorBlot (.ql-cursor) stays intact with live caret
            Object.keys(sticky).forEach((key) => {
                if (BLOCK_STICKY_FORMAT_KEYS.has(key)) return;
                const val = sticky[key];
                if (val !== undefined && val !== false && val !== null) {
                    quillInstance.format(key, val, 'silent');
                }
            });

            // 4. Final focus & native range integrity check
            _focusQuillRootSafely(quillInstance);
            const natAfter = (quillInstance.selection && typeof quillInstance.selection.getNativeRange === 'function')
                ? quillInstance.selection.getNativeRange()
                : null;
            if (!natAfter) {
                quillInstance.setSelection(0, 0, 'silent');
            }

            // Sync Snow toolbar active state indicators if present
            try {
                const toolbarModule = quillInstance.theme && quillInstance.theme.modules && quillInstance.theme.modules.toolbar;
                const activeRange = quillInstance.selection && typeof quillInstance.selection.getRange === 'function'
                    ? quillInstance.selection.getRange()[0]
                    : null;
                if (toolbarModule && typeof toolbarModule.update === 'function' && activeRange) {
                    toolbarModule.update(activeRange);
                }
            } catch (_) {}
        } finally {
            _isApplyingStickyFormat = false;
        }
    }

    // 7. Bind Selection and Text Change Synchronizers
    function _bindQuillSyncListeners(quillInstance) {
        if (!quillInstance) return;

        if (quillInstance.root && !quillInstance.root._v4FocusGuardsBound) {
            quillInstance.root._v4FocusGuardsBound = true;
            const markInteract = () => { _lastQuillUserInteractTs = Date.now(); };
            quillInstance.root.addEventListener('keydown', markInteract, true);
            quillInstance.root.addEventListener('beforeinput', markInteract, true);
            quillInstance.root.addEventListener('mousedown', markInteract, true);
            quillInstance.root.addEventListener('compositionstart', () => {
                _isImeComposing = true;
                _lastQuillUserInteractTs = Date.now();
            });
            quillInstance.root.addEventListener('compositionend', () => {
                _isImeComposing = false;
                _lastQuillUserInteractTs = Date.now();
                setTimeout(() => {
                    if (_isImeComposing || state._isLoadingShapeContent) return;
                    if (_getCleanPlainText(quillInstance).length === 0 && !_hasUncommittedDomText(quillInstance)) {
                        const stillInQuill = (document.activeElement === quillInstance.root) ||
                            ((Date.now() - _lastQuillUserInteractTs) < 250);
                        if (stillInQuill) {
                            _restoreStickyFormatWhenEmpty(quillInstance, true);
                        }
                    }
                }, 2);
            });
        }

        quillInstance.on('selection-change', (range) => {
            if (!range || state._isLoadingShapeContent || _isApplyingStickyFormat) return;
            if (_isImeComposing || (quillInstance.selection && quillInstance.selection.composing)) return;

            const plainText = _getCleanPlainText(quillInstance);
            if (plainText.length === 0 && window._currentStickyFormat) {
                const hasAttachedCursor = !!(quillInstance.selection && quillInstance.selection.cursor && quillInstance.selection.cursor.parent);
                if (!hasAttachedCursor || document.activeElement !== quillInstance.root) {
                    _restoreStickyFormatWhenEmpty(quillInstance, false);
                }
            } else if (plainText.length > 0) {
                const curFormat = quillInstance.getFormat(range);
                if (curFormat && Object.keys(curFormat).length > 0) {
                    window._currentStickyFormat = { ...window._currentStickyFormat, ...curFormat };
                    if (!curFormat.align && window._currentStickyFormat.align === undefined) {
                        window._currentStickyFormat.align = 'left';
                    }
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

        quillInstance.on('text-change', (_delta, _oldDelta, source) => {
            if (!state.isEditing || state.editingIndex === -1 || state._isLoadingShapeContent || _isApplyingStickyFormat) return;
            
            const plainText = _getCleanPlainText(quillInstance);
            if (plainText.length > 0) {
                const curFormat = quillInstance.getFormat();
                if (curFormat && Object.keys(curFormat).length > 0) {
                    window._currentStickyFormat = { ...window._currentStickyFormat, ...curFormat };
                }
            }

            const rawHtml = (quillInstance.root.innerHTML || '')
                .replace(/<span class="ql-cursor">[\s\S]*?<\/span>/g, '')
                .replace(/\uFEFF/g, '');
            const html = preserveConsecutiveSpaces(rawHtml);
            const activeAlign = (window.state?.selectedComponentStyles?.currentStyles?.textAlign) || 
                                (quillInstance.root?.style?.textAlign) || '';
            const activeVAlign = (window.state?.selectedComponentStyles?.currentStyles?.vAlign || window.state?.selectedComponentStyles?.currentStyles?.justifyContent) || '';

            if (state.editingType === 'pin') {
                const list = state.activeFile?.meta?.description;
                if (list && list[state.editingIndex]) {
                    list[state.editingIndex].html = html;
                    list[state.editingIndex].text = _getCleanPlainText(quillInstance);
                }
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow) {
                    MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                        id: state.editingIndex,
                        html: html,
                        align: activeAlign,
                        vAlign: activeVAlign
                    });
                }
                markAsDirty();
            } else if (state.editingType === 'shape') {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow) {
                    MessageHub.send(iframe.contentWindow, 'LF_UPDATE_SHAPE_TEXT', { 
                        id: state.editingIndex,
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

            // Restore sticky format & keep caret focus in a microtask right after Quill finishes synchronous deleteText/setSelection
            if (plainText.length === 0 && window._currentStickyFormat) {
                const wasUserEdit = (source === 'user') || ((Date.now() - _lastQuillUserInteractTs) < 250);
                if (!_pendingEmptyStickyMicrotask) {
                    _pendingEmptyStickyMicrotask = true;
                    const scheduleMicro = (typeof queueMicrotask === 'function')
                        ? queueMicrotask
                        : (fn) => Promise.resolve().then(fn);
                    scheduleMicro(() => {
                        _pendingEmptyStickyMicrotask = false;
                        _restoreStickyFormatWhenEmpty(quillInstance, wasUserEdit);
                    });
                }
            }
        });
    }

    // 7.1 Empty Standalone Text SHAPE Auto-Cleanup Guard (Parent Side)
    function _isEditingStandaloneTextShape() {
        const s = window.state;
        if (!s || !s.isEditing || s.editingIndex === -1) return false;
        if (s.editingType !== 'shape') return false;
        const comp = s.selectedComponentStyles || s.selectedComponent;
        if (!comp) return false;
        if (comp.isGroup || comp.isDescriptionPin || comp.isImage || comp.isTable || comp.isGrid) return false;
        if (comp.pinIndex !== undefined && comp.pinIndex !== -1 && !isNaN(comp.pinIndex)) return false;
        const isTextShape = !!comp.isTextShape ||
            (!comp.isShape && !!comp.isPin) ||
            (typeof comp.id === 'string' && comp.id.startsWith('v4-text-')) ||
            (Array.isArray(comp.classList) && (comp.classList.includes('v4-text-shape') || comp.classList.includes('v4-text-box')));
        return isTextShape;
    }

    function _isQuillTextEmpty(quillInstance) {
        const q = quillInstance || window.quillEditor;
        if (!q) return false;
        if (_isImeComposing || (q.selection && q.selection.composing)) return false;
        if (_hasUncommittedDomText(q)) return false;
        return _getCleanPlainText(q).length === 0;
    }

    window.cleanupActiveEmptyTextShapeIfNeeded = function() {
        if (!_isEditingStandaloneTextShape()) return false;
        if (!_isQuillTextEmpty(window.quillEditor)) return false;

        const targetId = window.state?.editingIndex;
        if (!targetId || typeof targetId !== 'string') return false;

        if (window.quillEditor && document.activeElement === window.quillEditor.root) {
            try { window.quillEditor.blur(); } catch (_) {}
        }

        const iframe = document.getElementById('main-iframe') || (window.DOM && window.DOM.iframe);
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_CLEANUP_EMPTY_TEXT_SHAPES', {
                id: targetId,
                forceBlur: true,
                deselectIfRemoved: true
            });
            return true;
        }
        return false;
    };

    let _emptyTextShapeGuardBound = false;
    function _bindEmptyTextShapeExitGuard() {
        if (_emptyTextShapeGuardBound) return;
        _emptyTextShapeGuardBound = true;

        document.addEventListener('mousedown', (e) => {
            if (!_isEditingStandaloneTextShape() || !_isQuillTextEmpty(window.quillEditor)) return;
            const target = e.target;
            if (!target || typeof target.closest !== 'function') return;

            // Canvas iframe clicks are handled synchronously inside vctrl_iframe_script.js without cross-frame race conditions
            if (target.tagName === 'IFRAME') return;

            // Allow Undo trigger to restore previous text rather than deleting first
            if (target.closest('#btn-undo, [data-action="undo"]')) return;

            // Keep alive while interacting with active Text SHAPE's own inspector panel / controls / toolbar / color popover
            const isInsideActiveInspectorControls = !!(
                target.closest('#text-editor-section') ||
                target.closest('#shape-inspector-section') ||
                target.closest('#sidebar-inspector-body') ||
                target.closest('#floating-inspector-card') ||
                target.closest('#selection-actions-bar') ||
                target.closest('#group-dimension-bar') ||
                target.closest('.v4-color-popover') ||
                target.closest('#v4-color-palette-popover') ||
                target.closest('.ql-toolbar') ||
                target.closest('.ql-picker-options')
            );
            if (isInsideActiveInspectorControls) return;

            window.cleanupActiveEmptyTextShapeIfNeeded();
        }, true);
    }

    // 8. Main Orchestrator Function
    window.initQuillEditor = function() {
        if (typeof window.initV4GlobalColorPalette === 'function') {
            window.initV4GlobalColorPalette();
        }
        if (window.quillEditor) return;
        const container = document.getElementById('editor-container');
        if (!container) return;

        const Size = _initQuillAttributors(Quill);
        _initQuillIcons(Quill);
        _initStickyFormatCache();

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

        setTimeout(() => {
            const toolbarEl = container.previousElementSibling || document.querySelector('.ql-toolbar');
            if (toolbarEl) _setupQuillToolbarTooltips(toolbarEl);
        }, 0);

        _bindQuillSyncListeners(window.quillEditor);
        _bindEmptyTextShapeExitGuard();
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