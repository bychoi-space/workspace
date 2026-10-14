/**
 * bychoi workspace V4 - UI Atoms Inputs & Controls Module
 * Decoupled from vctrl_ui_atoms.js for performance and modularity (Phase 6).
 * Handles Stepper, Fileupload, Toggle, Selectbox, Datepicker, Textbox/Textarea, Searchbar events & property updates.
 */

window.v4UIAtomsInputsScript = `
(function() {
    console.log("[V4 UI Atoms Inputs] Module initialized.");

    const notifyParent = (data) => {
        if (typeof window.notifyParent === "function") {
            window.notifyParent(data);
        } else if (window.parent) {
            window.parent.postMessage(data, "*");
        }
    };

    const bindStepperEvents = () => {
        document.querySelectorAll('.v4-stepper-container').forEach(container => {
            const min = parseInt(container.getAttribute('data-min')) || 1;
            const max = parseInt(container.getAttribute('data-max')) || 99;
            const cur = parseInt(container.getAttribute('data-val')) || min;

            const decBtn = container.querySelector('.v4-stepper-dec');
            const incBtn = container.querySelector('.v4-stepper-inc');
            const valEl = container.querySelector('.v4-stepper-value');

            if (container._eventsBound) {
                const isDisabled = container.getAttribute('data-disabled') === 'true';
                if (isDisabled) {
                    if (decBtn) {
                        decBtn.style.backgroundColor = '';
                        decBtn.style.color = '';
                        decBtn.style.cursor = 'not-allowed';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = '';
                        incBtn.style.color = '';
                        incBtn.style.cursor = 'not-allowed';
                    }
                } else {
                    if (decBtn) {
                        decBtn.style.backgroundColor = cur === min ? '#f3f4f6' : '#ffffff';
                        decBtn.style.color = cur === min ? '#9ca3af' : '#374151';
                        decBtn.style.cursor = cur === min ? 'not-allowed' : 'pointer';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = cur === max ? '#f3f4f6' : '#ffffff';
                        incBtn.style.color = cur === max ? '#9ca3af' : '#374151';
                        incBtn.style.cursor = cur === max ? 'not-allowed' : 'pointer';
                    }
                }
                return;
            }
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');
            
            const updateVal = (newVal) => {
                const currentMin = parseInt(container.getAttribute('data-min')) || 1;
                const currentMax = parseInt(container.getAttribute('data-max')) || 99;
                let val = Math.max(currentMin, Math.min(currentMax, newVal));
                container.setAttribute('data-val', val);
                if (valEl) valEl.innerText = val;
                
                const isDisabled = container.getAttribute('data-disabled') === 'true';
                if (isDisabled) {
                    if (decBtn) {
                        decBtn.style.backgroundColor = '';
                        decBtn.style.color = '';
                        decBtn.style.cursor = 'not-allowed';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = '';
                        incBtn.style.color = '';
                        incBtn.style.cursor = 'not-allowed';
                    }
                } else {
                    if (decBtn) {
                        decBtn.style.backgroundColor = val === currentMin ? '#f3f4f6' : '#ffffff';
                        decBtn.style.color = val === currentMin ? '#9ca3af' : '#374151';
                        decBtn.style.cursor = val === currentMin ? 'not-allowed' : 'pointer';
                    }
                    if (incBtn) {
                        incBtn.style.backgroundColor = val === currentMax ? '#f3f4f6' : '#ffffff';
                        incBtn.style.color = val === currentMax ? '#9ca3af' : '#374151';
                        incBtn.style.cursor = val === currentMax ? 'not-allowed' : 'pointer';
                    }
                }
            };
            
            if (decBtn) {
                decBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (container.getAttribute('data-disabled') === 'true') return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const currentVal = parseInt(container.getAttribute('data-val')) || 1;
                    const step = parseInt(container.getAttribute('data-step')) || 1;
                    updateVal(currentVal - step);
                    markDirty();
                };
            }
            if (incBtn) {
                incBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (container.getAttribute('data-disabled') === 'true') return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const currentVal = parseInt(container.getAttribute('data-val')) || 1;
                    const step = parseInt(container.getAttribute('data-step')) || 1;
                    updateVal(currentVal + step);
                    markDirty();
                };
            }
            
            updateVal(cur);
        });
    };


    const bindFileuploadEvents = () => {
        document.querySelectorAll('.v4-fileupload-container').forEach(container => {
            const delBtn = container.querySelector('.v4-fileupload-delete');
            const txt = container.querySelector('.v4-fileupload-textbox');
            const isSel = container.getAttribute('data-selected') === 'true';
            const fName = container.getAttribute('data-file-name') || '';
            const placeholder = container.getAttribute('data-placeholder') || '선택된 파일 없음';
            
            if (txt) {
                const targetText = isSel ? fName : placeholder;
                if (txt.innerText !== targetText) {
                    txt.innerText = targetText;
                }
                const targetColor = isSel ? 'rgb(55, 65, 81)' : 'rgb(156, 163, 175)';
                const hexColor = isSel ? '#374151' : '#9ca3af';
                if (txt.style.color !== hexColor && txt.style.color !== targetColor) {
                    txt.style.color = hexColor;
                }
            }

            if (container._eventsBound) return;
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');
            
            if (delBtn) {
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    
                    container.setAttribute('data-selected', 'false');
                    if (txt) {
                        txt.innerText = container.getAttribute('data-placeholder') || '선택된 파일 없음';
                        txt.style.color = '#9ca3af';
                    }
                    
                    markDirty();
                    
                    if (typeof window._getCompStyles === 'function') {
                        notifyParent({
                            type: 'LF_COMP_SELECTED',
                            ...window._getCompStyles(container.closest('.lf-component'))
                        });
                    }
                };
            }
        });
    };


    const bindToggleEvents = () => {
        document.querySelectorAll('.v4-toggle-container').forEach(container => {
            const handle = container.querySelector('.v4-toggle-handle');
            if (container._eventsBound) {
                const isChecked = container.getAttribute('data-checked') === 'true';
                const toggleColor = container.getAttribute('data-color') || '#3b82f6';
                if (handle) {
                    if (isChecked) {
                        container.style.setProperty('background-color', toggleColor, 'important');
                        container.style.setProperty('border-color', toggleColor, 'important');
                        const trackW = container.offsetWidth || 80;
                        const trackH = container.offsetHeight || 30;
                        const trans = trackW - trackH;
                        handle.style.transform = 'translateX(' + trans + 'px)';
                    } else {
                        container.style.setProperty('background-color', 'rgb(203, 213, 225)', 'important');
                        container.style.setProperty('border-color', 'rgb(200, 200, 200)', 'important');
                        handle.style.transform = 'translateX(0)';
                    }
                }
                return;
            }
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');

            container.onclick = (e) => {
                e.stopPropagation();
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                const isChecked = container.getAttribute('data-checked') === 'true';
                container.setAttribute('data-checked', isChecked ? 'false' : 'true');
                
                bindToggleEvents();
                markDirty();
                
                if (typeof window._getCompStyles === 'function') {
                    notifyParent({
                        type: 'LF_COMP_SELECTED',
                        ...window._getCompStyles(container.closest('.lf-component'))
                    });
                }
            };

            const isChecked = container.getAttribute('data-checked') === 'true';
            const toggleColor = container.getAttribute('data-color') || '#3b82f6';
            if (handle) {
                if (isChecked) {
                    container.style.setProperty('background-color', toggleColor, 'important');
                    container.style.setProperty('border-color', toggleColor, 'important');
                    const trackW = container.offsetWidth || 80;
                    const trackH = container.offsetHeight || 30;
                    const trans = trackW - trackH;
                    handle.style.transform = 'translateX(' + trans + 'px)';
                } else {
                    container.style.setProperty('background-color', 'rgb(203, 213, 225)', 'important');
                    container.style.setProperty('border-color', 'rgb(200, 200, 200)', 'important');
                    handle.style.transform = 'translateX(0)';
                }
            }
        });
    };

    const bindWebEditorEvents = () => {
        document.querySelectorAll('.v4-webeditor-container').forEach(container => {
            const toolbar = container.querySelector('.v4-webeditor-toolbar');
            const contentView = container.querySelector('.v4-webeditor-content');
            const htmlView = container.querySelector('.v4-webeditor-html-source');
            const textView = container.querySelector('.v4-webeditor-plain-text');
            const resizerBar = container.querySelector('.v4-webeditor-resizer-bar');
            const counterEl = container.querySelector('.v4-webeditor-counter');
            const tabBtns = container.querySelectorAll('.v4-webeditor-tab-btn');

            const applyEditorState = () => {
                const curMode = container.getAttribute('data-editor-mode') || 'editor';
                const curToolbar = container.getAttribute('data-toolbar-mode') || 'full';
                const showCounter = container.getAttribute('data-show-counter') !== 'false';
                const maxLen = parseInt(container.getAttribute('data-max-length'), 10) || 2000;
                const isReadOnly = container.getAttribute('data-readonly') === 'true';

                // 1. Toolbar Visibility & Preset
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
                    if (isReadOnly) {
                        toolbar.style.pointerEvents = 'none';
                        toolbar.style.opacity = '0.45';
                    } else {
                        toolbar.style.pointerEvents = 'auto';
                        toolbar.style.opacity = '1';
                    }
                }

                // 2. Editor Mode & Views
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

                // 3. Tab Buttons Active Style
                tabBtns.forEach(tab => {
                    const mode = tab.getAttribute('data-mode');
                    const isActive = (mode === curMode);
                    if (isActive) tab.classList.add('active');
                    else tab.classList.remove('active');
                    tab.style.background = isActive ? '#e5e7eb' : '#ffffff';
                    tab.style.color = isActive ? '#111827' : '#6b7280';
                    tab.style.fontWeight = isActive ? '600' : '500';
                });

                // 4. Counter
                if (counterEl) {
                    counterEl.style.display = showCounter ? 'inline-block' : 'none';
                    const rawText = contentView ? contentView.innerText || '' : '';
                    const text = rawText.split(String.fromCharCode(10)).join('').split(String.fromCharCode(13)).join('');
                    const curLen = text.length;
                    counterEl.innerText = curLen + ' / ' + (maxLen > 0 ? maxLen + '\uC790' : '\uBB34\uC81C\uD55C');
                    counterEl.style.color = (maxLen > 0 && curLen > maxLen) ? '#e11d48' : '#64748b';
                }

                // 5. Resizer Readonly Guard
                if (resizerBar) {
                    resizerBar.style.pointerEvents = isReadOnly ? 'none' : 'auto';
                    resizerBar.style.opacity = isReadOnly ? '0.45' : '1';
                }
            };

            applyEditorState();

            if (container._eventsBound) return;
            container._eventsBound = true;

            // Content update listener
            const onContentInput = () => {
                if (counterEl) {
                    const maxLen = parseInt(container.getAttribute('data-max-length'), 10) || 2000;
                    const rawText = contentView ? contentView.innerText || '' : '';
                    const text = rawText.split(String.fromCharCode(10)).join('').split(String.fromCharCode(13)).join('');
                    const curLen = text.length;
                    counterEl.innerText = curLen + ' / ' + (maxLen > 0 ? maxLen + '\uC790' : '\uBB34\uC81C\uD55C');
                    counterEl.style.color = (maxLen > 0 && curLen > maxLen) ? '#e11d48' : '#64748b';
                }
                markDirty();
            };

            if (contentView) {
                contentView.addEventListener('input', onContentInput);
            }
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

            // Toolbar buttons
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

            // Mode tabs
            tabBtns.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newMode = tab.getAttribute('data-mode') || 'editor';
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    container.setAttribute('data-editor-mode', newMode);
                    applyEditorState();
                    markDirty();

                    const comp = container.closest('.lf-component');
                    if (comp && typeof window._getCompStyles === 'function') {
                        notifyParent({
                            type: 'LF_COMP_SELECTED',
                            ...window._getCompStyles(comp)
                        });
                    }
                });
            });

            // Status bar resize handle (Drag to resize height)
            if (resizerBar) {
                resizerBar.addEventListener('mousedown', (e) => {
                    if (container.getAttribute('data-readonly') === 'true') return;
                    e.preventDefault();
                    e.stopPropagation();

                    const comp = container.closest('.lf-component');
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
                                type: 'LF_COMP_RESIZED',
                                ...window._getCompStyles(comp)
                            });
                        }
                    };

                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                });
            }
        });
    };

    const bindSelectboxEvents = () => {
        document.querySelectorAll('.v4-selectbox-container').forEach(container => {
            const optionsRaw = container.getAttribute('data-options') || 'Option 1,Option 2,Option 3';
            const optArr = optionsRaw.split(',').map(function(o) { return o.trim(); }).filter(Boolean);

            const selRaw = container.getAttribute('data-selected-indices') || '';
            const selIndices = selRaw ? selRaw.split(',').map(function(n) { return parseInt(n.trim()); }).filter(function(n) { return !isNaN(n); }) : [];

            const defaultTxt = container.getAttribute('data-default-text') || '\uC120\uD0DD\uD558\uC138\uC694';

            // Sync Header Selected Text
            const selectedText = container.querySelector('.v4-selectbox-selected-text');
            if (selectedText) {
                const selectedNames = selIndices.map(function(idx) {
                    return optArr[idx];
                }).filter(Boolean);

                if (selectedNames.length > 0) {
                    selectedText.innerText = selectedNames.join(', ');
                } else {
                    selectedText.innerText = defaultTxt;
                }
            }

            // Sync Options visual state
            const optionsList = container.querySelector('.v4-selectbox-options');
            if (optionsList) {
                const optEls = optionsList.querySelectorAll('.v4-selectbox-option');
                optEls.forEach(function(optEl, idx) {
                    const isSelected = selIndices.indexOf(idx) !== -1;
                    optEl.setAttribute('data-index', idx);
                    optEl.setAttribute('data-selected', isSelected ? 'true' : 'false');
                    if (isSelected) {
                        optEl.classList.add('active');
                        optEl.style.backgroundColor = 'rgba(99, 102, 241, 0.08)';
                        optEl.style.color = 'var(--v4-accent-color, #4f46e5)';
                        optEl.style.fontWeight = '600';
                        let check = optEl.querySelector('.v4-option-check');
                        if (!check) {
                            check = document.createElement('span');
                            check.className = 'v4-option-check';
                            check.style.cssText = 'margin-left: auto; color: var(--v4-accent-color, #4f46e5); font-size: 13px; font-weight: bold; line-height: 1;';
                            check.innerText = '\u2713';
                            optEl.appendChild(check);
                        }
                    } else {
                        optEl.classList.remove('active');
                        optEl.style.backgroundColor = '';
                        optEl.style.color = 'var(--v4-text-color, #0f172a)';
                        optEl.style.fontWeight = '400';
                        const check = optEl.querySelector('.v4-option-check');
                        if (check) check.remove();
                    }
                });
            }

            if (container._eventsBound) return;
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');

            const header = container.querySelector('.v4-selectbox-header');
            if (header) {
                header.onclick = function(e) {
                    e.stopPropagation();
                    if (container.getAttribute('data-disabled') === 'true') return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();

                    const isDrop = container.getAttribute('data-dropdown-active') === 'true';
                    const nextDrop = !isDrop;
                    container.setAttribute('data-dropdown-active', nextDrop ? 'true' : 'false');
                    if (optionsList) optionsList.style.display = nextDrop ? 'block' : 'none';

                    const comp = container.closest('.lf-component');
                    if (comp) {
                        const optCount = Math.max(1, optArr.length);
                        const targetH = nextDrop ? (30 + (optCount * 30)) + 'px' : '30px';
                        comp.style.height = targetH;
                        container.style.height = '100%';
                        if (header) header.style.height = '30px';
                    }

                    markDirty();
                    if (typeof window._getCompStyles === 'function' && comp) {
                        notifyParent(Object.assign({
                            type: 'LF_COMP_SELECTED'
                        }, window._getCompStyles(comp)));
                    }
                };
            }

            if (optionsList) {
                optionsList.onclick = function(e) {
                    const optEl = e.target.closest('.v4-selectbox-option');
                    if (!optEl || !optionsList.contains(optEl)) return;
                    e.stopPropagation();
                    if (container.getAttribute('data-disabled') === 'true') return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();

                    const idx = parseInt(optEl.getAttribute('data-index'));
                    if (isNaN(idx)) return;

                    const curSelRaw = container.getAttribute('data-selected-indices') || '';
                    let curIndices = curSelRaw ? curSelRaw.split(',').map(function(n) { return parseInt(n.trim()); }).filter(function(n) { return !isNaN(n); }) : [];

                    const existPos = curIndices.indexOf(idx);
                    if (existPos !== -1) {
                        curIndices.splice(existPos, 1);
                    } else {
                        curIndices.push(idx);
                        curIndices.sort(function(a, b) { return a - b; });
                    }

                    container.setAttribute('data-selected-indices', curIndices.join(','));

                    container._eventsBound = true;
                    bindSelectboxEvents();
                    markDirty();

                    const comp = container.closest('.lf-component');
                    if (typeof window._getCompStyles === 'function' && comp) {
                        notifyParent(Object.assign({
                            type: 'LF_COMP_SELECTED'
                        }, window._getCompStyles(comp)));
                    }
                };
            }
        });
    };

    // Attach to global window object
    window.bindStepperEvents = bindStepperEvents;
    window.bindFileuploadEvents = bindFileuploadEvents;
    window.bindToggleEvents = bindToggleEvents;
    window.bindWebEditorEvents = bindWebEditorEvents;
    window.bindSelectboxEvents = bindSelectboxEvents;

    // --- Registered Modular Message Handlers for Inputs & Controls ---
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_STEPPER_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-stepper-container') || (s.classList.contains('v4-stepper-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        
                        if (d.minVal !== undefined) container.setAttribute('data-min', d.minVal);
                        if (d.maxVal !== undefined) container.setAttribute('data-max', d.maxVal);
                        if (d.stepVal !== undefined) container.setAttribute('data-step', d.stepVal);
                        if (d.disabled !== undefined) container.setAttribute('data-disabled', d.disabled ? 'true' : 'false');
                        
                        if (d.btnEnabled !== undefined) {
                            container.setAttribute('data-btn-enabled', d.btnEnabled ? 'true' : 'false');
                            const actBtn = container.querySelector('.v4-stepper-action');
                            if (actBtn) actBtn.style.display = d.btnEnabled ? 'inline-flex' : 'none';
                            s.style.width = d.btnEnabled ? '134px' : '80px';
                        }
                        if (d.btnText !== undefined) {
                            container.setAttribute('data-btn-text', d.btnText);
                            const actBtn = container.querySelector('.v4-stepper-action');
                            if (actBtn) actBtn.innerText = d.btnText;
                        }
                        
                        const min = parseInt(container.getAttribute('data-min')) || 1;
                        const max = parseInt(container.getAttribute('data-max')) || 99;
                        let curVal = parseInt(container.getAttribute('data-val')) || min;
                        
                        if (d.minVal !== undefined) curVal = min;
                        curVal = Math.max(min, Math.min(max, curVal));
                        container.setAttribute('data-val', curVal);
                        
                        const valEl = container.querySelector('.v4-stepper-value');
                        if (valEl) valEl.innerText = curVal;
                        
                        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                        markDirty();
                        
                        if (typeof window._getCompStyles === 'function') {
                            window.parent.postMessage({
                                type: 'LF_COMP_SELECTED',
                                ...window._getCompStyles(s)
                            }, '*');
                        }
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_SELECTBOX_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
        const container = s.querySelector('.v4-selectbox-container') || (s.classList.contains('v4-selectbox-container') ? s : null);
        if (container) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            if (d.width !== undefined) {
                const wVal = typeof d.width === 'number' ? d.width + 'px' : d.width;
                s.style.width = wVal;
                container.style.width = '100%';
                const header = container.querySelector('.v4-selectbox-header');
                const optionsList = container.querySelector('.v4-selectbox-options');
                if (header) header.style.width = '100%';
                if (optionsList) optionsList.style.width = '100%';
            }
            if (d.height !== undefined) {
                const hVal = typeof d.height === 'number' ? d.height + 'px' : d.height;
                s.style.height = hVal;
                container.style.height = '100%';
                const header = container.querySelector('.v4-selectbox-header');
                const isDrop = container.getAttribute('data-dropdown-active') === 'true';
                if (header) header.style.height = isDrop ? '30px' : '100%';
            }

            if (d.defaultText !== undefined) {
                container.setAttribute('data-default-text', d.defaultText);
            }
            
            if (d.dropdownActive !== undefined) {
                const isDrop = !!d.dropdownActive;
                container.setAttribute('data-dropdown-active', isDrop ? 'true' : 'false');
                const optionsList = container.querySelector('.v4-selectbox-options');
                if (optionsList) optionsList.style.display = isDrop ? 'block' : 'none';
                
                const header = container.querySelector('.v4-selectbox-header');
                if (header) {
                    header.style.height = '30px';
                    header.style.width = '100%';
                }

                const optionsRaw = container.getAttribute('data-options') || 'Option 1,Option 2,Option 3';
                const optArr = optionsRaw.split(',').map(function(o) { return o.trim(); }).filter(Boolean);
                const optCount = Math.max(1, optArr.length);
                const targetH = isDrop ? (30 + (optCount * 30)) + 'px' : '30px';
                s.style.height = targetH;
                container.style.height = '100%';
            }

            if (d.selectedIndices !== undefined) {
                const selArr = Array.isArray(d.selectedIndices) ? d.selectedIndices : (d.selectedIndices ? String(d.selectedIndices).split(',') : []);
                const cleanSel = selArr.map(function(n) { return parseInt(n); }).filter(function(n) { return !isNaN(n); });
                container.setAttribute('data-selected-indices', cleanSel.join(','));
            }
            
            if (d.options !== undefined) {
                const optionsArr = Array.isArray(d.options) ? d.options : d.options.split(',');
                const cleanOptions = optionsArr.map(function(o) { return o.trim(); }).filter(Boolean);
                container.setAttribute('data-options', cleanOptions.join(','));
            }

            // Sync Options DOM and Header text
            const optionsRaw = container.getAttribute('data-options') || 'Option 1,Option 2,Option 3';
            const optArr = optionsRaw.split(',').map(function(o) { return o.trim(); }).filter(Boolean);

            const selRaw = container.getAttribute('data-selected-indices') || '';
            const selIndices = selRaw ? selRaw.split(',').map(function(n) { return parseInt(n.trim()); }).filter(function(n) { return !isNaN(n); }) : [];

            const defaultTxt = container.getAttribute('data-default-text') || '\uC120\uD0DD\uD558\uC138\uC694';

            const selectedText = container.querySelector('.v4-selectbox-selected-text');
            if (selectedText) {
                const selectedNames = selIndices.map(function(idx) {
                    return optArr[idx];
                }).filter(Boolean);

                if (selectedNames.length > 0) {
                    selectedText.innerText = selectedNames.join(', ');
                } else {
                    selectedText.innerText = defaultTxt;
                }
            }

            const optionsList = container.querySelector('.v4-selectbox-options');
            if (optionsList) {
                optionsList.innerHTML = optArr.map(function(opt, idx) {
                    const isSelected = selIndices.indexOf(idx) !== -1;
                    const isLast = idx === optArr.length - 1;
                    const borderStyle = isLast ? '' : ' border-bottom: 1.6px solid var(--v4-disabled-bg, #f3f4f6);';
                    const activeBg = isSelected ? ' background-color: rgba(99, 102, 241, 0.08); color: var(--v4-accent-color, #4f46e5); font-weight: 600;' : ' color: var(--v4-text-color, #0f172a); font-weight: 400;';
                    const checkIcon = isSelected ? '<span class="v4-option-check" style="margin-left: auto; color: var(--v4-accent-color, #4f46e5); font-size: 13px; font-weight: bold; line-height: 1;">\u2713</span>' : '';
                    const activeClass = isSelected ? ' active' : '';
                    return '<div class="v4-selectbox-option' + activeClass + '" data-index="' + idx + '" data-selected="' + (isSelected ? 'true' : 'false') + '" style="height: 30px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; cursor: pointer; user-select: none;' + activeBg + borderStyle + ' box-sizing: border-box;"><span class="v4-option-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + opt + '</span>' + checkIcon + '</div>';
                }).join('');
            }

            if (container.getAttribute('data-dropdown-active') === 'true') {
                const optCount = Math.max(1, optArr.length);
                const targetH = (30 + (optCount * 30)) + 'px';
                s.style.height = targetH;
                container.style.height = '100%';
                const header = container.querySelector('.v4-selectbox-header');
                if (header) header.style.height = '30px';
            }

            container._eventsBound = false;
            if (typeof bindSelectboxEvents === 'function') bindSelectboxEvents();
            
            if (typeof window.updateHandles === 'function') window.updateHandles(s);
            if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
            markDirty();
            
            if (typeof window._getCompStyles === 'function') {
                window.parent.postMessage(Object.assign({
                    type: 'LF_COMP_SELECTED'
                }, window._getCompStyles(s)), '*');
            }
        }
    };

    window.v4MessageHandlers['LF_UPDATE_FILEUPLOAD_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-fileupload-container') || (s.classList.contains('v4-fileupload-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        
                        if (d.fileSelected !== undefined) container.setAttribute('data-selected', d.fileSelected ? 'true' : 'false');
                        if (d.fileName !== undefined) container.setAttribute('data-file-name', d.fileName);
                        if (d.fileButtonText !== undefined) {
                            container.setAttribute('data-button-text', d.fileButtonText);
                            const btn = container.querySelector('.v4-fileupload-button');
                            if (btn) btn.innerText = d.fileButtonText;
                        }
                        if (d.filePlaceholder !== undefined) container.setAttribute('data-placeholder', d.filePlaceholder);
                        
                        const isSel = container.getAttribute('data-selected') === 'true';
                        const fName = container.getAttribute('data-file-name') || '';
                        const placeholder = container.getAttribute('data-placeholder') || '\uC120\uD0DD\uB41C \uD30C\uC77C \uC5C6\uC74C';
                        const txt = container.querySelector('.v4-fileupload-textbox');
                        if (txt) {
                            txt.innerText = isSel ? fName : placeholder;
                            txt.style.color = isSel ? '#374151' : '#9ca3af';
                        }
                        
                        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                        markDirty();
                        
                        if (typeof window._getCompStyles === 'function') {
                            window.parent.postMessage({
                                type: 'LF_COMP_SELECTED',
                                ...window._getCompStyles(s)
                            }, '*');
                        }
                    }
    };


    window.v4MessageHandlers['LF_UPDATE_DATEPICKER'] = function(d) {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-datepicker-container') || (s.classList.contains('v4-datepicker-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
                        const _fmt = (dt) => {
                            const y = dt.getFullYear();
                            const m = String(dt.getMonth() + 1).padStart(2, '0');
                            const dd = String(dt.getDate()).padStart(2, '0');
                            return y + '/' + m + '/' + dd;
                        };
        
                        const _applyPreset = (preset) => {
                            const today = new Date();
                            let startDt = null;
                            let endDt = today;
                            if (preset === '1D') { startDt = new Date(today); startDt.setDate(today.getDate() - 1); }
                            else if (preset === '1W') { startDt = new Date(today); startDt.setDate(today.getDate() - 7); }
                            else if (preset === '1M') { startDt = new Date(today); startDt.setMonth(today.getMonth() - 1); }
                            else if (preset === '6M') { startDt = new Date(today); startDt.setMonth(today.getMonth() - 6); }
                            else if (preset === 'all') { startDt = null; endDt = null; }
                            return { start: startDt ? _fmt(startDt) : '', end: endDt ? _fmt(endDt) : '' };
                        };
        
                        if (d.showPresets !== undefined) {
                            container.setAttribute('data-show-presets', d.showPresets ? 'true' : 'false');
                            const presetsDiv = container.querySelector('.v4-dp-presets');
                            if (presetsDiv) presetsDiv.style.display = d.showPresets ? 'inline-flex' : 'none';
                        }
        
                        if (d.showEndDate !== undefined) {
                            container.setAttribute('data-show-end-date', d.showEndDate ? 'true' : 'false');
                            const sep = container.querySelector('.v4-dp-separator');
                            const groups = container.querySelectorAll('.v4-dp-input-group');
                            if (sep) sep.style.display = d.showEndDate ? 'inline-flex' : 'none';
                            if (groups && groups.length > 1) {
                                groups[1].style.display = d.showEndDate ? 'inline-flex' : 'none';
                            }
                        }
        
                        if (d.mode !== undefined) {
                            container.setAttribute('data-mode', d.mode);
                            const presetsDiv = container.querySelector('.v4-dp-presets');
                            const groups = container.querySelectorAll('.v4-dp-input-group');
                            const startGroup = groups[0];
                            const endGroup = groups.length > 1 ? groups[1] : null;
        
                            if (d.mode === 'detailed') {
                                if (presetsDiv) presetsDiv.style.display = 'none';
        
                                // Ensure start time field exists
                                let startTimeEl = container.querySelector('.v4-dp-start-time');
                                if (!startTimeEl && startGroup) {
                                    startTimeEl = document.createElement('div');
                                    startTimeEl.className = 'v4-dp-time-field v4-dp-start-time v4-editable-cell';
                                    startTimeEl.contentEditable = container.getAttribute('data-disabled') === 'true' ? 'false' : 'true';
                                    startTimeEl.style.cssText = 'font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); outline: none; white-space: nowrap; font-family: inherit; margin-left: 6px; -webkit-user-select: text; user-select: text; min-width: 50px;';
                                    const icon = startGroup.querySelector('svg');
                                    if (icon) startGroup.insertBefore(startTimeEl, icon);
                                    else startGroup.appendChild(startTimeEl);
                                }
                                if (startTimeEl) {
                                    startTimeEl.style.display = 'inline-block';
                                    startTimeEl.innerText = container.getAttribute('data-start-time') || '';
                                }
        
                                // Ensure end time field exists
                                let endTimeEl = container.querySelector('.v4-dp-end-time');
                                if (!endTimeEl && endGroup) {
                                    endTimeEl = document.createElement('div');
                                    endTimeEl.className = 'v4-dp-time-field v4-dp-end-time v4-editable-cell';
                                    endTimeEl.contentEditable = container.getAttribute('data-disabled') === 'true' ? 'false' : 'true';
                                    endTimeEl.style.cssText = 'font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); outline: none; white-space: nowrap; font-family: inherit; margin-left: 6px; -webkit-user-select: text; user-select: text; min-width: 50px;';
                                    const icon = endGroup.querySelector('svg');
                                    if (icon) endGroup.insertBefore(endTimeEl, icon);
                                    else endGroup.appendChild(endTimeEl);
                                }
                                if (endTimeEl) {
                                    endTimeEl.style.display = 'inline-block';
                                    endTimeEl.innerText = container.getAttribute('data-end-time') || '';
                                }
        
                                // Also respect showEndDate in detailed mode
                                const showEndDate = container.getAttribute('data-show-end-date') !== 'false';
                                const sep = container.querySelector('.v4-dp-separator');
                                if (sep) sep.style.display = showEndDate ? 'inline-flex' : 'none';
                                if (endGroup) endGroup.style.display = showEndDate ? 'inline-flex' : 'none';
                            } else {
                                // Simple mode
                                const showPresets = container.getAttribute('data-show-presets') !== 'false';
                                if (presetsDiv) presetsDiv.style.display = showPresets ? 'inline-flex' : 'none';
        
                                const startTimeEl = container.querySelector('.v4-dp-start-time');
                                if (startTimeEl) startTimeEl.style.display = 'none';
                                const endTimeEl = container.querySelector('.v4-dp-end-time');
                                if (endTimeEl) endTimeEl.style.display = 'none';
                            }
                        }
        
                        if (d.startTime !== undefined) {
                            const val = d.startTime || '';
                            container.setAttribute('data-start-time', val);
                            const el = container.querySelector('.v4-dp-start-time');
                            if (el && el.innerText !== val) el.innerText = val;
                        }
                        if (d.endTime !== undefined) {
                            const val = d.endTime || '';
                            container.setAttribute('data-end-time', val);
                            const el = container.querySelector('.v4-dp-end-time');
                            if (el && el.innerText !== val) el.innerText = val;
                        }
        
                        if (d.defaultPreset !== undefined) {
                            container.setAttribute('data-default-preset', d.defaultPreset);
                            container.querySelectorAll('.v4-dp-preset-btn').forEach(btn => {
                                const isActive = btn.getAttribute('data-preset') === d.defaultPreset;
                                btn.style.background = isActive ? '#1d4ed8' : '#ffffff';
                                btn.style.border = '1.6px solid ' + (isActive ? '#1d4ed8' : '#cccccc');
                                btn.style.color = isActive ? '#ffffff' : '#0f172a';
                                btn.style.fontWeight = '400';
                                btn.style.fontSize = '12px';
                                btn.style.fontFamily = 'inherit';
                                if (isActive) btn.classList.add('v4-dp-preset-active');
                                else btn.classList.remove('v4-dp-preset-active');
                            });
                            if (d.defaultPreset !== 'none') {
                                const computed = _applyPreset(d.defaultPreset);
                                container.setAttribute('data-start-date', computed.start);
                                container.setAttribute('data-end-date', computed.end);
                                const startEl = container.querySelector('.v4-dp-start');
                                const endEl = container.querySelector('.v4-dp-end');
                                if (startEl && startEl.innerText !== computed.start) startEl.innerText = computed.start;
                                if (endEl && endEl.innerText !== computed.end) endEl.innerText = computed.end;
                            }
                        }
        
                        if (d.startDate !== undefined) {
                            const val = d.startDate || '';
                            container.setAttribute('data-start-date', val);
                            const startEl = container.querySelector('.v4-dp-start');
                            if (startEl && startEl.innerText !== val) startEl.innerText = val;
                        }
                        if (d.endDate !== undefined) {
                            const val = d.endDate || '';
                            container.setAttribute('data-end-date', val);
                            const endEl = container.querySelector('.v4-dp-end');
                            if (endEl && endEl.innerText !== val) endEl.innerText = val;
                        }
        
                        markDirty();
        
                        if (typeof window._getCompStyles === 'function') {
                            window.parent.postMessage({
                                type: 'LF_COMP_SELECTED',
                                ...window._getCompStyles(s)
                            }, '*');
                        }
                    }
    };


    window.v4MessageHandlers['LF_UPDATE_TEXTBOX_PROPERTIES'] = function(d) {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-textbox-container, .v4-textarea-container') || (s.classList.contains('v4-textbox-container') || s.classList.contains('v4-textarea-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        
                        if (d.placeholderText !== undefined) {
                            const ph = container.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder');
                            if (ph) ph.textContent = d.placeholderText;
                            container.setAttribute('data-placeholder', d.placeholderText);
                        }
                        if (d.maxLength !== undefined) container.setAttribute('data-maxlength', d.maxLength);
                        if (d.showCounter !== undefined) container.setAttribute('data-show-counter', d.showCounter ? 'true' : 'false');
                        if (d.fontSize !== undefined) {
                            const input = container.querySelector('.v4-textbox-input, .v4-textarea-input');
                            const placeholder = container.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder');
                            if (input) input.style.fontSize = d.fontSize + 'px';
                            if (placeholder) placeholder.style.fontSize = d.fontSize + 'px';
                            container.setAttribute('data-fontsize', d.fontSize);
                        }
                        if (d.fontFamily !== undefined) {
                            const input = container.querySelector('.v4-textbox-input, .v4-textarea-input');
                            const placeholder = container.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder');
                            const counter = container.querySelector('.v4-textbox-counter, .v4-textarea-counter');
                            if (input) input.style.fontFamily = d.fontFamily;
                            if (placeholder) placeholder.style.fontFamily = d.fontFamily;
                            if (counter) counter.style.fontFamily = d.fontFamily;
                            container.setAttribute('data-fontfamily', d.fontFamily);
                        }
                        
                        const input = container.querySelector('.v4-textbox-input, .v4-textarea-input');
                        if (input) input.dataset.eventsBound = "false";
                        
                        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                        markDirty();
        
                        if (typeof window._getCompStyles === 'function') {
                            window.parent.postMessage({
                                type: 'LF_COMP_SELECTED',
                                ...window._getCompStyles(s)
                            }, '*');
                        }
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_TOGGLE_PROPERTIES'] = function(d) {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
        const container = s.querySelector('.v4-toggle-container') || (s.classList.contains('v4-toggle-container') ? s : null);
        if (container) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            if (d.checked !== undefined) {
                container.setAttribute('data-checked', d.checked ? 'true' : 'false');
            }
            if (d.color !== undefined) {
                container.setAttribute('data-color', d.color);
            }

            const handle = container.querySelector('.v4-toggle-handle');
            const isChecked = container.getAttribute('data-checked') === 'true';
            const toggleColor = container.getAttribute('data-color') || '#3b82f6';
            if (handle) {
                if (isChecked) {
                    container.style.setProperty('background-color', toggleColor, 'important');
                    container.style.setProperty('border-color', toggleColor, 'important');
                    const trackW = container.offsetWidth || 40;
                    const trackH = container.offsetHeight || 20;
                    const trans = trackW - trackH;
                    handle.style.transform = 'translateX(' + trans + 'px)';
                } else {
                    container.style.setProperty('background-color', 'rgb(203, 213, 225)', 'important');
                    container.style.setProperty('border-color', 'rgb(200, 200, 200)', 'important');
                    handle.style.transform = 'translateX(0)';
                }
            }

            if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
            markDirty();

            if (typeof window._getCompStyles === 'function') {
                window.parent.postMessage({
                    type: 'LF_COMP_SELECTED',
                    ...window._getCompStyles(s)
                }, '*');
            }
        }
    };

    window.v4MessageHandlers['LF_UPDATE_SEARCHBAR_PROPERTIES'] = function(d) {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-searchbar-container');
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        if (d.placeholderText !== undefined) {
                            const textEl = container.querySelector('.v4-searchbar-text');
                            if (textEl) {
                                textEl.setAttribute('data-placeholder', d.placeholderText);
                            }
                        }
                        if (d.fontSize !== undefined) {
                            const textEl = container.querySelector('.v4-searchbar-text');
                            if (textEl) {
                                textEl.style.fontSize = d.fontSize + 'px';
                            }
                            container.setAttribute('data-fontsize', d.fontSize);
                        }
                        markDirty();
                        if (typeof window._getCompStyles === 'function') {
                            window.parent.postMessage({
                                type: 'LF_COMP_SELECTED',
                                ...window._getCompStyles(s)
                            }, '*');
                        }
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_PROP'] = function(d) {
        const s = document.querySelector('.lf-component.selected');
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
                    type: 'LF_COMP_SELECTED',
                    ...window._getCompStyles(s)
                }, '*');
            }
        }
    };


})();
`;
