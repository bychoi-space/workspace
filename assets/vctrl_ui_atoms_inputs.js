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


    // Attach to global window object
    window.bindStepperEvents = bindStepperEvents;
    window.bindFileuploadEvents = bindFileuploadEvents;
    window.bindToggleEvents = bindToggleEvents;

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
                            if (header) header.style.height = '100%';
                        }
        
                        if (d.defaultText !== undefined) {
                            container.setAttribute('data-default-text', d.defaultText);
                            const selectedText = container.querySelector('.v4-selectbox-selected-text');
                            if (selectedText) selectedText.innerText = d.defaultText;
                        }
                        
                        if (d.dropdownActive !== undefined) {
                            container.setAttribute('data-dropdown-active', d.dropdownActive ? 'true' : 'false');
                            const optionsList = container.querySelector('.v4-selectbox-options');
                            if (optionsList) optionsList.style.display = d.dropdownActive ? 'block' : 'none';
                        }
                        
                        if (d.options !== undefined) {
                            const optionsArr = Array.isArray(d.options) ? d.options : d.options.split(',');
                            const cleanOptions = optionsArr.map(o => o.trim()).filter(Boolean);
                            container.setAttribute('data-options', cleanOptions.join(','));
                            
                            const optionsList = container.querySelector('.v4-selectbox-options');
                            if (optionsList) {
                                optionsList.innerHTML = cleanOptions.map((opt, idx) => {
                                    const isLast = idx === cleanOptions.length - 1;
                                    const borderStyle = isLast ? '' : ' border-bottom: 1.6px solid #f3f4f6;';
                                    return '<div class="v4-selectbox-option" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 12px; color: #374151;' + borderStyle + ' box-sizing: border-box;">' + opt + '</div>';
                                }).join('');
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


})();
`;
