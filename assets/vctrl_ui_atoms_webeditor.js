/**
 * bychoi workspace V4 - UI Atoms Web Editor Module
 * Decoupled from vctrl_ui_atoms_inputs.js for single responsibility and low complexity.
 * Handles Web Editor container state sync, formatting toolbar, mode tabs, height resizer & BYCHOI_UPDATE_PROP.
 *
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4UIAtomsWebEditorScript).
 * DO NOT use unescaped backticks or template interpolation inside this file (Gateway 5).
 */

window.v4UIAtomsWebEditorScript = `
(function() {
    console.log("[V4 UI Atoms WebEditor] Module initialized.");

    const notifyParent = (data) => {
        if (typeof window.notifyParent === "function") {
            window.notifyParent(data);
        } else if (window.parent) {
            window.parent.postMessage(data, "*");
        }
    };

    const _isWebEditorStdV2 = (container) => {
        return !!(container.getAttribute('data-v4-std') === '2' || (container.closest && container.closest('[data-v4-std="2"]')));
    };

    const _syncWebEditorCounter = (container, contentView, counterEl) => {
        if (!counterEl) return;
        const isStdV2 = _isWebEditorStdV2(container);
        const maxLen = parseInt(container.getAttribute('data-max-length'), 10) || 2000;
        const rawText = contentView ? contentView.innerText || '' : '';
        const text = rawText.split(String.fromCharCode(10)).join('').split(String.fromCharCode(13)).join('');
        const curLen = text.length;
        counterEl.innerText = curLen + ' / ' + (maxLen > 0 ? maxLen + '\\uC790' : '\\uBB34\\uC81C\\uD55C');
        counterEl.style.color = (maxLen > 0 && curLen > maxLen) ? '#e11d48' : (isStdV2 ? '#969696' : '#64748b');
    };

    const _applyWebEditorState = (container) => {
        const toolbar = container.querySelector('.v4-webeditor-toolbar');
        const contentView = container.querySelector('.v4-webeditor-content');
        const htmlView = container.querySelector('.v4-webeditor-html-source');
        const textView = container.querySelector('.v4-webeditor-plain-text');
        const resizerBar = container.querySelector('.v4-webeditor-resizer-bar');
        const counterEl = container.querySelector('.v4-webeditor-counter');
        const tabBtns = container.querySelectorAll('.v4-webeditor-tab-btn');

        const curMode = container.getAttribute('data-editor-mode') || 'editor';
        const curToolbar = container.getAttribute('data-toolbar-mode') || 'full';
        const showCounter = container.getAttribute('data-show-counter') !== 'false';
        const isReadOnly = container.getAttribute('data-readonly') === 'true';

        if (toolbar) {
            if (curToolbar === 'none') {
                toolbar.style.display = 'none';
            } else {
                toolbar.style.display = 'flex';
                const fullTools = toolbar.querySelector('.v4-webeditor-full-tools');
                const fontSelect = toolbar.querySelector('.v4-webeditor-tool-font');
                const sizeSelect = toolbar.querySelector('.v4-webeditor-tool-size');
                if (fullTools) fullTools.style.display = (curToolbar === 'full') ? 'inline-flex' : 'none';
                if (fontSelect) fontSelect.style.display = (curToolbar === 'full') ? 'inline-block' : 'none';
                if (sizeSelect) sizeSelect.style.display = (curToolbar === 'full') ? 'inline-block' : 'none';
            }
            toolbar.style.pointerEvents = isReadOnly ? 'none' : 'auto';
            toolbar.style.opacity = isReadOnly ? '0.45' : '1';
        }

        if (contentView && htmlView && textView) {
            if (curMode === 'html') {
                contentView.style.display = 'none';
                htmlView.style.display = 'block';
                textView.style.display = 'none';
                htmlView.value = contentView.innerHTML;
                htmlView.readOnly = isReadOnly;
            } else if (curMode === 'text') {
                contentView.style.display = 'none';
                htmlView.style.display = 'none';
                textView.style.display = 'block';
                textView.value = contentView.innerText;
                textView.readOnly = isReadOnly;
            } else {
                contentView.style.display = 'block';
                htmlView.style.display = 'none';
                textView.style.display = 'none';
                contentView.setAttribute('contenteditable', isReadOnly ? 'false' : 'true');
            }
        }

        const isStdV2 = _isWebEditorStdV2(container);
        tabBtns.forEach(tab => {
            const mode = tab.getAttribute('data-mode');
            const isActive = (mode === curMode);
            if (isActive) tab.classList.add('active');
            else tab.classList.remove('active');
            tab.style.background = isActive ? (isStdV2 ? '#f0f0f0' : '#e5e7eb') : '#ffffff';
            tab.style.color = isActive ? (isStdV2 ? '#050505' : '#111827') : (isStdV2 ? '#646464' : '#6b7280');
            tab.style.fontWeight = isActive ? '600' : '500';
        });

        if (counterEl) {
            counterEl.style.display = showCounter ? 'inline-block' : 'none';
            _syncWebEditorCounter(container, contentView, counterEl);
        }

        if (resizerBar) {
            resizerBar.style.pointerEvents = isReadOnly ? 'none' : 'auto';
            resizerBar.style.opacity = isReadOnly ? '0.45' : '1';
        }
    };

    const _bindWebEditorToolbarAndTabs = (container, toolbar, contentView, tabBtns) => {
        if (toolbar) {
            toolbar.addEventListener('click', (e) => {
                const btn = e.target.closest('.v4-webeditor-btn');
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();

                if (container.getAttribute('data-readonly') === 'true') return;
                if (window.V4UndoManager) window.V4UndoManager.saveState();

                if (btn.classList.contains('v4-tool-bold')) document.execCommand('bold', false, null);
                else if (btn.classList.contains('v4-tool-italic')) document.execCommand('italic', false, null);
                else if (btn.classList.contains('v4-tool-underline')) document.execCommand('underline', false, null);
                else if (btn.classList.contains('v4-tool-strike')) document.execCommand('strikeThrough', false, null);
                else if (btn.classList.contains('v4-tool-align-left')) document.execCommand('justifyLeft', false, null);
                else if (btn.classList.contains('v4-tool-align-center')) document.execCommand('justifyCenter', false, null);
                else if (btn.classList.contains('v4-tool-align-right')) document.execCommand('justifyRight', false, null);
                else if (btn.classList.contains('v4-tool-align-justify')) document.execCommand('justifyFull', false, null);
                else if (btn.classList.contains('v4-tool-list-num')) document.execCommand('insertOrderedList', false, null);
                else if (btn.classList.contains('v4-tool-list-bullet')) document.execCommand('insertUnorderedList', false, null);
                else if (btn.classList.contains('v4-tool-color-wrap')) {
                    const bar = btn.querySelector('.v4-tool-color-bar');
                    const col = (bar && bar.style.backgroundColor) || '#e11d48';
                    document.execCommand('foreColor', false, col);
                }

                if (contentView) contentView.focus();
                markDirty();
            });

            const fontSelect = toolbar.querySelector('.v4-webeditor-tool-font');
            if (fontSelect) {
                fontSelect.addEventListener('change', () => {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    document.execCommand('fontName', false, fontSelect.value);
                    markDirty();
                });
            }
            const sizeSelect = toolbar.querySelector('.v4-webeditor-tool-size');
            if (sizeSelect) {
                sizeSelect.addEventListener('change', () => {
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    let sizeVal = '3';
                    const v = sizeSelect.value;
                    if (v === '9pt' || v === '10pt') sizeVal = '2';
                    else if (v === '11pt' || v === '12pt') sizeVal = '3';
                    else if (v === '14pt') sizeVal = '4';
                    else if (v === '16pt') sizeVal = '5';
                    else if (v === '18pt') sizeVal = '6';
                    document.execCommand('fontSize', false, sizeVal);
                    markDirty();
                });
            }
        }

        tabBtns.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newMode = tab.getAttribute('data-mode') || 'editor';
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                container.setAttribute('data-editor-mode', newMode);
                _applyWebEditorState(container);
                markDirty();

                const comp = container.closest('.bychoi-component');
                if (comp && typeof window._getCompStyles === 'function') {
                    notifyParent({
                        type: 'BYCHOI_COMP_SELECTED',
                        ...window._getCompStyles(comp)
                    });
                }
            });
        });
    };

    const _bindWebEditorHeightResizer = (container, resizerBar) => {
        if (!resizerBar) return;
        resizerBar.addEventListener('mousedown', (e) => {
            if (container.getAttribute('data-readonly') === 'true') return;
            e.preventDefault();
            e.stopPropagation();

            const comp = container.closest('.bychoi-component');
            if (!comp) return;
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            const startY = e.clientY;
            const startH = comp.offsetHeight || 340;

            const onMove = (ev) => {
                const dy = ev.clientY - startY;
                const newH = Math.max(160, startH + dy);
                comp.style.height = newH + 'px';
                comp.setAttribute('data-resized', 'true');
                if (typeof window.updateHandles === 'function') window.updateHandles(comp);
                markDirty();
            };

            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
                if (typeof window._getCompStyles === 'function') {
                    notifyParent({
                        type: 'BYCHOI_COMP_RESIZED',
                        ...window._getCompStyles(comp)
                    });
                }
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        });
    };

    const bindWebEditorEvents = () => {
        document.querySelectorAll('.v4-webeditor-container').forEach(container => {
            _applyWebEditorState(container);

            if (container._eventsBound) return;
            container._eventsBound = true;

            const toolbar = container.querySelector('.v4-webeditor-toolbar');
            const contentView = container.querySelector('.v4-webeditor-content');
            const htmlView = container.querySelector('.v4-webeditor-html-source');
            const textView = container.querySelector('.v4-webeditor-plain-text');
            const resizerBar = container.querySelector('.v4-webeditor-resizer-bar');
            const counterEl = container.querySelector('.v4-webeditor-counter');
            const tabBtns = container.querySelectorAll('.v4-webeditor-tab-btn');

            const onContentInput = () => {
                _syncWebEditorCounter(container, contentView, counterEl);
                markDirty();
            };

            if (contentView) contentView.addEventListener('input', onContentInput);
            if (htmlView) {
                htmlView.addEventListener('input', () => {
                    if (contentView) contentView.innerHTML = htmlView.value;
                    onContentInput();
                });
            }
            if (textView) {
                textView.addEventListener('input', () => {
                    if (contentView) contentView.innerText = textView.value;
                    onContentInput();
                });
            }

            _bindWebEditorToolbarAndTabs(container, toolbar, contentView, tabBtns);
            _bindWebEditorHeightResizer(container, resizerBar);
        });
    };

    window.bindWebEditorEvents = bindWebEditorEvents;

    window.v4MessageHandlers = window.v4MessageHandlers || {};
    window.v4MessageHandlers['BYCHOI_UPDATE_PROP'] = function(d) {
        const s = document.querySelector('.bychoi-component.selected');
        if (!s) return;
        const container = s.querySelector('.v4-webeditor-container');
        if (container) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            if (d.prop === 'editorMode') {
                container.setAttribute('data-editor-mode', d.value);
            } else if (d.prop === 'toolbarMode') {
                container.setAttribute('data-toolbar-mode', d.value);
            } else if (d.prop === 'showCounter') {
                container.setAttribute('data-show-counter', d.value ? 'true' : 'false');
            } else if (d.prop === 'maxLength') {
                container.setAttribute('data-max-length', d.value);
            } else if (d.prop === 'readonly') {
                container.setAttribute('data-readonly', d.value ? 'true' : 'false');
            }
            if (typeof window.bindWebEditorEvents === 'function') {
                container._eventsBound = false;
                window.bindWebEditorEvents();
            }
            markDirty();
            if (typeof window._getCompStyles === 'function') {
                window.parent.postMessage({
                    type: 'BYCHOI_COMP_SELECTED',
                    ...window._getCompStyles(s)
                }, '*');
            }
        }
    };
})();
`;
