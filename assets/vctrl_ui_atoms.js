window.v4UIAtomsScript = `
(function() {
    console.log("[V4 UI Atoms] Module initialized.");
    

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
                    updateVal(currentVal - 1);
                    markDirty();
                };
            }
            if (incBtn) {
                incBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (container.getAttribute('data-disabled') === 'true') return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const currentVal = parseInt(container.getAttribute('data-val')) || 1;
                    updateVal(currentVal + 1);
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

    const bindAccordionEvents = () => {
        document.querySelectorAll('.v4-accordion-container').forEach(container => {
            const header = container.querySelector('.v4-accordion-header');
            if (!header) return;
            if (container._eventsBound) return;
            container._eventsBound = true;
            container.removeAttribute('data-events-bound');

            header.onclick = (e) => {
                e.stopPropagation();
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                const expanded = container.getAttribute('data-expanded') === 'true';
                container.setAttribute('data-expanded', expanded ? 'false' : 'true');
                
                if (typeof window.enforceDesignSystem === 'function') {
                    window.enforceDesignSystem();
                }
                markDirty();
            };
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
    window.bindAccordionEvents = bindAccordionEvents;
    window.bindToggleEvents = bindToggleEvents;

    // --- Registered Modular Message Handlers for UI Atoms & Widgets ---
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_ATOM_STATE'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
                    if (container) {
                        container.setAttribute('data-checked', d.checked ? 'true' : 'false');
                        const inner = container.querySelector('.v4-checkbox, .v4-radio');
                        if (inner) {
                            if (d.checked) {
                                inner.style.backgroundColor = 'rgb(50, 50, 50)';
                                inner.style.borderColor = 'rgb(255, 255, 255)';
                            } else {
                                inner.style.backgroundColor = 'rgb(250, 250, 250)';
                                inner.style.borderColor = 'rgb(150, 150, 150)';
                            }
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

    window.v4MessageHandlers['LF_UPDATE_ATOM_ICON_SIZE'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
                    const boxEl = container ? container.querySelector('.v4-checkbox, .v4-radio') : s.querySelector('.v4-checkbox, .v4-radio');
                    if (boxEl) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        if (d.width !== undefined && d.width !== null) {
                            const wPx = typeof d.width === 'number' ? d.width + 'px' : d.width;
                            boxEl.style.width = wPx;
                        }
                        if (d.height !== undefined && d.height !== null) {
                            const hPx = typeof d.height === 'number' ? d.height + 'px' : d.height;
                            boxEl.style.height = hPx;
                        }
                        if (typeof window.resizeAtomToFitText === 'function') {
                            window.resizeAtomToFitText(s);
                        }
                        if (typeof window.updateHandles === 'function') {
                            window.updateHandles(s);
                        }
                        markDirty();
                        if (typeof window._getCompStyles === 'function' && window.parent) {
                            window.parent.postMessage({
                                type: 'LF_COMP_RESIZED',
                                id: s.id,
                                w: s.offsetWidth,
                                h: s.offsetHeight,
                                boxW: boxEl.offsetWidth,
                                boxH: boxEl.offsetHeight
                            }, '*');
                        }
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_ACCORDION_PROPERTIES'] = function(d) {
        if (window.v4MessageHandlers && window.v4MessageHandlers['LF_UPDATE_ACCORDION_PROPERTIES']) {
                        window.v4MessageHandlers['LF_UPDATE_ACCORDION_PROPERTIES'](d);
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_GRID_PROPERTIES'] = function(d) {
        if (window.v4MessageHandlers && window.v4MessageHandlers['LF_UPDATE_GRID_PROPERTIES']) {
                        window.v4MessageHandlers['LF_UPDATE_GRID_PROPERTIES'](d);
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_ATOM_TEXT_ENABLED'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
                    if (container) {
                        container.setAttribute('data-text-enabled', d.enabled ? 'true' : 'false');
                        s.removeAttribute('data-resized');
                        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                        if (typeof resizeAtomToFitText === 'function') resizeAtomToFitText(s);
                        markDirty();
                        
                        if (typeof window._getCompStyles === 'function') {
                            window.parent.postMessage({
                                type: 'LF_COMP_SELECTED',
                                ...window._getCompStyles(s)
                            }, '*');
                        }
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_ATOM_LABEL_TEXT'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const container = s.querySelector('.v4-checkbox-container, .v4-radio-container') || (s.classList.contains('v4-checkbox-container') || s.classList.contains('v4-radio-container') ? s : null);
                    if (container) {
                        const textEl = container.querySelector('.v4-checkbox-text, .v4-radio-text');
                        if (textEl) {
                            textEl.innerText = d.text;
                            if (typeof resizeAtomToFitText === 'function') resizeAtomToFitText(s);
                            markDirty();
                            
                            if (typeof window._getCompStyles === 'function') {
                                window.parent.postMessage({
                                    type: 'LF_COMP_SELECTED',
                                    ...window._getCompStyles(s)
                                }, '*');
                            }
                        }
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_ATOM_DISABLED'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-textbox-container, .v4-textarea-container, .v4-stepper-container, .v4-selectbox-container, .v4-fileupload-container, .v4-datepicker-container, .v4-toggle-container, .v4-accordion-container, .v4-checkbox-container, .v4-radio-container, .v4-searchbar-container') || s;
                    if (window.V4UndoManager) window.V4UndoManager.saveState();
                    const disabledStr = d.disabled ? 'true' : 'false';
                    s.setAttribute('data-disabled', disabledStr);
                    if (container && container !== s) container.setAttribute('data-disabled', disabledStr);
                    
                    // Toggle contentEditable on editable cells inside container
                    container.querySelectorAll('.v4-editable-cell').forEach(cell => {
                        cell.contentEditable = d.disabled ? 'false' : 'true';
                    });
                    
                    markDirty();
                    if (typeof window._getCompStyles === 'function') {
                        notifyParent({
                            type: 'LF_COMP_STYLES_RESPONSE',
                            ...window._getCompStyles(s)
                        });
                    }
    };

    window.v4MessageHandlers['LF_UPDATE_STEPPER_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-stepper-container') || (s.classList.contains('v4-stepper-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        
                        if (d.minVal !== undefined) container.setAttribute('data-min', d.minVal);
                        if (d.maxVal !== undefined) container.setAttribute('data-max', d.maxVal);
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

    window.v4MessageHandlers['LF_UPDATE_ALERT_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-alert-container') || (s.classList.contains('v4-alert-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        
                        const msg = d.messageText !== undefined ? d.messageText : d.alertMessage;
                        if (msg !== undefined) {
                            container.setAttribute('data-message', msg);
                            const msgEl = container.querySelector('.v4-alert-message');
                            if (msgEl) msgEl.innerHTML = String(msg).replace(/\\n/g, '<br>');
                        }
                        const showDesc = d.showDesc !== undefined ? d.showDesc : d.alertShowDesc;
                        if (showDesc !== undefined) {
                            const isShow = (showDesc === true || showDesc === 'true');
                            container.setAttribute('data-show-desc', isShow ? 'true' : 'false');
                            const descWrapper = container.querySelector('.v4-alert-desc-wrapper');
                            if (descWrapper) descWrapper.style.display = isShow ? 'flex' : 'none';
                        }
                        const desc = d.descText !== undefined ? d.descText : d.alertDesc;
                        if (desc !== undefined) {
                            container.setAttribute('data-desc', desc);
                            const descBadge = container.querySelector('.v4-alert-desc-badge');
                            if (descBadge) descBadge.innerText = desc;
                        }
                        const btnCount = d.btnCount !== undefined ? d.btnCount : d.alertBtnCount;
                        if (btnCount !== undefined) container.setAttribute('data-btn-count', btnCount);
                        
                        const btnText1 = d.btnText1 !== undefined ? d.btnText1 : d.alertBtnText1;
                        if (btnText1 !== undefined) {
                            container.setAttribute('data-btn-text-1', btnText1);
                            const btn = container.querySelector('.v4-alert-btn-1');
                            if (btn) btn.innerText = btnText1;
                        }
                        const btnText2 = d.btnText2 !== undefined ? d.btnText2 : d.alertBtnText2;
                        if (btnText2 !== undefined) {
                            container.setAttribute('data-btn-text-2', btnText2);
                            const btn = container.querySelector('.v4-alert-btn-2');
                            if (btn) btn.innerText = btnText2;
                        }
                        const btnText3 = d.btnText3 !== undefined ? d.btnText3 : d.alertBtnText3;
                        if (btnText3 !== undefined) {
                            container.setAttribute('data-btn-text-3', btnText3);
                            const btn = container.querySelector('.v4-alert-btn-3');
                            if (btn) btn.innerText = btnText3;
                        }
                        const btnStyle1 = d.btnStyle1 !== undefined ? d.btnStyle1 : d.alertBtnStyle1;
                        if (btnStyle1 !== undefined) container.setAttribute('data-btn-style-1', btnStyle1);
                        const btnStyle2 = d.btnStyle2 !== undefined ? d.btnStyle2 : d.alertBtnStyle2;
                        if (btnStyle2 !== undefined) container.setAttribute('data-btn-style-2', btnStyle2);
                        const btnStyle3 = d.btnStyle3 !== undefined ? d.btnStyle3 : d.alertBtnStyle3;
                        if (btnStyle3 !== undefined) container.setAttribute('data-btn-style-3', btnStyle3);
                        
                        const count = parseInt(container.getAttribute('data-btn-count')) || 1;
                        const btn1 = container.querySelector('.v4-alert-btn-1');
                        const btn2 = container.querySelector('.v4-alert-btn-2');
                        const btn3 = container.querySelector('.v4-alert-btn-3');
                        if (btn1) {
                            btn1.style.display = count >= 1 ? 'flex' : 'none';
                            btn1.className = 'v4-alert-btn v4-alert-btn-1 style-' + (container.getAttribute('data-btn-style-1') || 'normal');
                        }
                        if (btn2) {
                            btn2.style.display = count >= 2 ? 'flex' : 'none';
                            btn2.className = 'v4-alert-btn v4-alert-btn-2 style-' + (container.getAttribute('data-btn-style-2') || 'normal');
                        }
                        if (btn3) {
                            btn3.style.display = count >= 3 ? 'flex' : 'none';
                            btn3.className = 'v4-alert-btn v4-alert-btn-3 style-' + (container.getAttribute('data-btn-style-3') || 'normal');
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

    window.v4MessageHandlers['LF_UPDATE_BUTTON_PROPERTIES'] = function(d) {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
                    const container = s.querySelector('.v4-btn-container') || (s.classList.contains('v4-btn-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        
                        if (d.buttonText !== undefined) {
                            container.setAttribute('data-text', d.buttonText);
                            const btn = container.querySelector('.v4-custom-btn');
                            if (btn) btn.innerText = d.buttonText;
                        }
                        if (d.buttonStyle !== undefined) {
                            container.setAttribute('data-btn-style', d.buttonStyle);
                            const btn = container.querySelector('.v4-custom-btn');
                            if (btn) btn.className = 'v4-custom-btn style-' + d.buttonStyle;
                        }
                        if (d.buttonRadius !== undefined) {
                            container.setAttribute('data-btn-radius', d.buttonRadius);
                            const btn = container.querySelector('.v4-custom-btn');
                            if (btn) btn.style.borderRadius = d.buttonRadius + 'px';
                        }
                        if (d.buttonFontSize !== undefined) {
                            const fontVal = parseInt(d.buttonFontSize) || 12;
                            container.setAttribute('data-font-size', fontVal);
                            const btn = container.querySelector('.v4-custom-btn');
                            if (btn) btn.style.setProperty('font-size', fontVal + 'px', 'important');
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

    window.v4MessageHandlers['LF_UPDATE_ADMIN_SETTINGS_PROPERTIES'] = function(d) {
        const s = document.querySelector('.lf-component.selected'); if (!s) return;
        if (s.style.background && s.style.background !== 'transparent') s.style.background = 'transparent';
        if (s.style.backgroundColor && s.style.backgroundColor !== 'transparent') s.style.backgroundColor = 'transparent';
        const container = s.querySelector('.v4-admin-settings-container') || (s.classList.contains('v4-admin-settings-container') ? s : null);
                    if (container) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
                        // Update Row Count
                        if (d.rowCount !== undefined) {
                            container.setAttribute('data-row-count', d.rowCount);
                        }
        
                        // Update Row Height
                        if (d.rowHeight !== undefined) {
                            container.setAttribute('data-row-height', d.rowHeight);
                        }
        
                        // Update Label Width
                        if (d.labelWidth !== undefined) {
                            container.setAttribute('data-label-width', d.labelWidth);
                        }
        
                        // Update Specific Row Configuration
                        if (d.rowNum !== undefined) {
                            const rNum = d.rowNum;
                            if (d.label !== undefined) container.setAttribute('data-row' + rNum + '-label', d.label);
                            if (d.cols !== undefined) container.setAttribute('data-row' + rNum + '-cols', d.cols);
                            if (d.rowType !== undefined) container.setAttribute('data-row' + rNum + '-type', d.rowType);
                            if (d.rowSpecificHeight !== undefined) container.setAttribute('data-row' + rNum + '-height', d.rowSpecificHeight);
                            if (d.required !== undefined) container.setAttribute('data-row' + rNum + '-required', String(d.required));
                        }
        
                        // Support Bulk Rows Array (Reordering / Deletion)
                        if (Array.isArray(d.rows)) {
                            d.rows.forEach((rData, idx) => {
                                const rNum = idx + 1;
                                if (rData.label !== undefined) container.setAttribute('data-row' + rNum + '-label', rData.label);
                                if (rData.cols !== undefined) container.setAttribute('data-row' + rNum + '-cols', rData.cols);
                                if (rData.type !== undefined) container.setAttribute('data-row' + rNum + '-type', rData.type);
                                if (rData.height !== undefined) container.setAttribute('data-row' + rNum + '-height', rData.height);
                                if (rData.required !== undefined) container.setAttribute('data-row' + rNum + '-required', String(rData.required));
                            });
                            // Clean up trailing unused row attributes if rows count decreased
                            for (let rNum = d.rows.length + 1; rNum <= 20; rNum++) {
                                container.removeAttribute('data-row' + rNum + '-label');
                                container.removeAttribute('data-row' + rNum + '-cols');
                                container.removeAttribute('data-row' + rNum + '-type');
                                container.removeAttribute('data-row' + rNum + '-height');
                                container.removeAttribute('data-row' + rNum + '-required');
                            }
                        }
        
                        // Update Group Header Attributes
                        if (d.showGroupHeader !== undefined) container.setAttribute('data-show-group-header', d.showGroupHeader ? 'true' : 'false');
                        if (d.groupHeaderTitle !== undefined) container.setAttribute('data-group-header-title', d.groupHeaderTitle);
                        if (d.groupHeaderBg !== undefined) container.setAttribute('data-group-header-bg', d.groupHeaderBg);
                        if (d.groupHeaderColor !== undefined) container.setAttribute('data-group-header-color', d.groupHeaderColor);
        
                        const hasGroupHeader = container.getAttribute('data-show-group-header') === 'true';
                        const headerHeight = hasGroupHeader ? 40 : 0;
        
                        // Dynamically render Group Header
                        let headerEl = container.querySelector('.v4-admin-group-header');
                        if (hasGroupHeader) {
                            if (!headerEl) {
                                headerEl = document.createElement('div');
                                headerEl.className = 'v4-admin-group-header';
                                container.insertBefore(headerEl, container.firstChild);
                            }
                            const titleText = container.getAttribute('data-group-header-title') || '\uADF8\uB8F9\uBA85';
                            const bgCol = container.getAttribute('data-group-header-bg') || '#73829c';
                            const textCol = container.getAttribute('data-group-header-color') || '#ffffff';
                            
                            if (headerEl.innerText !== titleText && document.activeElement !== headerEl) {
                                headerEl.innerText = titleText;
                            }
                            headerEl.contentEditable = 'true';
                            headerEl.style.cssText = 'height: 40px; display: flex; align-items: center; padding: 0 16px; font-size: 12px; font-weight: 400; font-family: inherit; background: ' + bgCol + '; color: ' + textCol + '; box-sizing: border-box; width: 100%; outline: none; border-bottom: 1.6px solid rgb(226, 232, 240); border-top-left-radius: 6.4px; border-top-right-radius: 6.4px; border-bottom-left-radius: 0px; border-bottom-right-radius: 0px; overflow: hidden; clip-path: inset(0 0 0 0 round 6.4px 6.4px 0 0); -webkit-clip-path: inset(0 0 0 0 round 6.4px 6.4px 0 0); background-clip: padding-box; flex-shrink: 0 !important;';
                            headerEl.setAttribute('data-enforced-bg', bgCol);
                            headerEl.setAttribute('data-enforced-color', textCol);
                            
                            if (!headerEl.dataset.inputBound) {
                                headerEl.dataset.inputBound = 'true';
                                headerEl.oninput = (e) => {
                                    container.setAttribute('data-group-header-title', e.target.innerText);
                                    markDirty();
                                    if (typeof window._getCompStyles === 'function') {
                                        window.parent.postMessage({
                                            type: 'LF_COMP_SELECTED',
                                            ...window._getCompStyles(s)
                                        }, '*');
                                    }
                                };
                            }
                        } else {
                            if (headerEl) headerEl.remove();
                        }
        
                        container.style.overflow = 'hidden';
                        container.style.borderRadius = '8px';
                        container.style.isolation = 'isolate';
                        container.style.contain = 'paint';
                        container.style.webkitMaskImage = '-webkit-radial-gradient(white, black)';
                        container.style.maskImage = 'radial-gradient(white, black)';
                        container.style.transform = 'translateZ(0)';
        
                        const totalRows = parseInt(container.getAttribute('data-row-count')) || 1;
                        const globalRowHeight = parseInt(container.getAttribute('data-row-height')) || 44;
                        
                        // Automatically resize component height: sum of specific row heights + headerHeight
                        let newHeight = headerHeight;
                        for (let i = 1; i <= totalRows; i++) {
                            const specificHeight = parseInt(container.getAttribute('data-row' + i + '-height')) || globalRowHeight;
                            newHeight += specificHeight;
                        }
                        s.style.height = newHeight + 'px';
                        if (typeof window.updateHandles === 'function') window.updateHandles(s);
        
                        // Re-render HTML representation of the rows
                        const tableDiv = container.querySelector('.v4-admin-settings-table');
                        if (tableDiv) {
                            tableDiv.style.cssText = 'display: flex; flex-direction: column; width: 100%; flex: 1 !important; height: auto !important;';
                            
                            const needsRebuildRows = (d.rowCount !== undefined || d.rowNum !== undefined || d.rows !== undefined || d.labelWidth !== undefined || d.required !== undefined);
                            if (needsRebuildRows) {
                                tableDiv.innerHTML = '';
                                
                                for (let i = 1; i <= totalRows; i++) {
                                    const labelAttr = container.getAttribute('data-row' + i + '-label') || ('\uD56D\uBAA9 ' + i);
                                    const colsAttr = parseInt(container.getAttribute('data-row' + i + '-cols')) || 1;
                                    const typeAttr = container.getAttribute('data-row' + i + '-type') || 'textbox';
                                    const specificHeight = parseInt(container.getAttribute('data-row' + i + '-height')) || globalRowHeight;
                                    const reqRaw = container.getAttribute('data-row' + i + '-required') || '';
                                    const reqArr = reqRaw.split(',').map(v => v.trim() === 'true');
                                    
                                    const isLastRow = (i === totalRows);
                                    const rowBorder = isLastRow ? 'none' : '1.6px solid rgb(226, 232, 240)';
                                    
                                    const rowEl = document.createElement('div');
                                    rowEl.className = 'v4-admin-row';
                                    rowEl.style.cssText = 'display: flex; width: 100%; border-bottom: ' + rowBorder + '; box-sizing: border-box; height: ' + specificHeight + 'px;';
                                    
                                    // Split labels by comma
                                    const labels = labelAttr.split(',').map(l => l.trim());
                                    
                                    for (let c = 0; c < colsAttr; c++) {
                                        const colLabel = labels[c] || (labels[0] + (c > 0 ? ' ' + (c + 1) : ''));
                                        const isColRequired = reqArr[c] === true;
                                        
                                        const labelWidth = container.getAttribute('data-label-width') || '140';
                                        
                                        // Label cell with inline contenteditable editing support
                                        const labelCell = document.createElement('div');
                                        labelCell.className = 'v4-admin-label-cell v4-editable-cell' + (isColRequired ? ' is-required' : '');
                                        labelCell.contentEditable = 'true';
                                        let labelRadius = '';
                                        if (c === 0) {
                                            if (i === 1 && !hasGroupHeader) {
                                                labelRadius = 'border-top-left-radius: 6.4px; ';
                                            } else if (i === totalRows) {
                                                labelRadius = 'border-bottom-left-radius: 6.4px; ';
                                            }
                                        }
                                        labelCell.style.cssText = 'width: ' + labelWidth + 'px; background: #f1f5f9; display: flex; align-items: center; padding: 0 16px; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); font-family: inherit; border-right: 1.6px solid rgb(226, 232, 240); ' + labelRadius + 'box-sizing: border-box; flex-shrink: 0; outline: none; cursor: text; user-select: text; -webkit-user-select: text;';
                                        labelCell.innerText = colLabel;
            
                                        if (!labelCell.dataset.inputBound) {
                                            labelCell.dataset.inputBound = 'true';
                                            labelCell.oninput = () => {
                                                const rowLabels = Array.from(rowEl.querySelectorAll('.v4-admin-label-cell')).map(lc => lc.innerText.trim());
                                                container.setAttribute('data-row' + i + '-label', rowLabels.join(', '));
                                                markDirty();
                                                if (typeof window._getCompStyles === 'function') {
                                                    window.parent.postMessage({
                                                        type: 'LF_COMP_SELECTED',
                                                        ...window._getCompStyles(s)
                                                    }, '*');
                                                }
                                            };
                                        }
                                        rowEl.appendChild(labelCell);
                                        
                                        // Content cell with equal flex: 1 1 0% width across all columns
                                        const contentCell = document.createElement('div');
                                        contentCell.className = 'v4-admin-content-cell';
                                        
                                        let cellStyle = 'flex: 1 1 0%; min-width: 0; display: flex; align-items: center; padding: 0 16px; box-sizing: border-box;';
                                        if (c < colsAttr - 1) {
                                            cellStyle += ' border-right: 1.6px solid rgb(226, 232, 240);';
                                        }
                                        contentCell.style.cssText = cellStyle;
                                        contentCell.innerHTML = '';
                                        rowEl.appendChild(contentCell);
                                    }
                                    tableDiv.appendChild(rowEl);
                                }
                            } else {
                                const rows = tableDiv.querySelectorAll('.v4-admin-row');
                                rows.forEach((r, idx) => {
                                    r.style.borderBottom = (idx === rows.length - 1) ? 'none' : '1.6px solid rgb(226, 232, 240)';
                                    const firstLabel = r.querySelector('.v4-admin-label-cell');
                                    if (firstLabel) {
                                        if (idx === 0) {
                                            firstLabel.style.borderTopLeftRadius = hasGroupHeader ? '0px' : '6.4px';
                                        }
                                        if (idx === rows.length - 1) {
                                            firstLabel.style.borderBottomLeftRadius = '6.4px';
                                        }
                                    }
                                });
                            }
                        }
        
                        // Remove any legacy Action Bar
                        let actionEl = container.querySelector('.v4-admin-action-bar');
                        if (actionEl) actionEl.remove();
                        container.removeAttribute('data-show-action-bar');
                        container.removeAttribute('data-action-align');
                        
                        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
                        markDirty();
        
                        // Notify parent about the updated selection properties
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
