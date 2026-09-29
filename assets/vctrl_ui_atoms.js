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

    const fitCursorWidth = (comp) => {
        if (!comp) return;
        const container = comp.querySelector('.v4-cursor-container') || (comp.classList.contains('v4-cursor-container') ? comp : null);
        if (!container) return;

        const isShow = container.getAttribute('data-show-text') !== 'false';
        if (!isShow) {
            comp.style.width = '32px';
            comp.style.height = '32px';
        } else {
            const descBox = container.querySelector('.v4-cursor-desc-box');
            const textEl = container.querySelector('.v4-cursor-text');
            const iconWrap = container.querySelector('.v4-cursor-icon-wrap');

            if (descBox) {
                descBox.style.maxWidth = 'none';
                descBox.style.width = 'max-content';
                descBox.style.flexShrink = '0';
            }
            if (textEl) {
                textEl.style.overflow = 'visible';
                textEl.style.textOverflow = 'clip';
                textEl.style.whiteSpace = 'nowrap';
            }

            var iconW = 24;
            if (iconWrap) {
                iconW = iconWrap.offsetWidth || 24;
            }

            var textW = 0;
            if (textEl) {
                textW = textEl.scrollWidth || textEl.offsetWidth || 0;
            }

            var descW = 60;
            if (descBox) {
                descW = Math.max(descBox.offsetWidth || 0, descBox.scrollWidth || 0, textW + 20);
            } else {
                descW = textW + 20;
            }

            var totalW = Math.max(64, Math.ceil(iconW + 8 + descW + 4));
            comp.style.width = totalW + 'px';
            comp.style.height = '32px';
        }

        if (typeof window.updateHandles === 'function') {
            window.updateHandles(comp);
        }
    };

    const bindCursorEvents = () => {
        document.querySelectorAll('.v4-cursor-container').forEach(container => {
            const cType = container.getAttribute('data-cursor-type') || 'default';
            const iconWrap = container.querySelector('.v4-cursor-icon-wrap');
            if (iconWrap) {
                var pointerSrc = 'data:image/png;base64,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';
                var ibeamSrc = 'data:image/png;base64,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';
                if (cType === 'pointer' && !iconWrap.querySelector('.v4-cursor-visual[data-cursor-visual="pointer"]')) {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="pointer" style="width: 21px; height: 28px; background-image: url(' + pointerSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                } else if (cType === 'text' && !iconWrap.querySelector('.v4-cursor-visual[data-cursor-visual="text"]')) {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="text" style="width: 11px; height: 28px; background-image: url(' + ibeamSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                }
            }

            // Restore Badge Theme Styles & Text Colors on Reload
            const badgeStyle = container.getAttribute('data-badge-style') || 'dark';
            const descBox = container.querySelector('.v4-cursor-desc-box');
            const isLight = badgeStyle === 'light';
            const targetColor = isLight ? '#0f172a' : '#ffffff';
            if (descBox) {
                descBox.style.color = targetColor;
                if (badgeStyle === 'blue') {
                    descBox.style.background = '#1d4ed8';
                    descBox.style.borderColor = '#2563eb';
                } else if (badgeStyle === 'light') {
                    descBox.style.background = '#ffffff';
                    descBox.style.borderColor = '#cbd5e1';
                } else {
                    descBox.style.background = '#1e293b';
                    descBox.style.borderColor = '#334155';
                }
            }

            const textEl = container.querySelector('.v4-cursor-text');
            if (textEl) {
                textEl.style.color = targetColor;
            }
            if (!textEl || textEl._cursorBound) return;
            textEl._cursorBound = true;

            textEl.addEventListener('input', () => {
                container.setAttribute('data-cursor-text', textEl.innerText);
                const comp = container.closest('.lf-component');
                if (comp) fitCursorWidth(comp);
                markDirty();
            });

            textEl.addEventListener('blur', () => {
                container.setAttribute('data-cursor-text', textEl.innerText);
                const comp = container.closest('.lf-component');
                if (comp) fitCursorWidth(comp);
                markDirty();
                if (comp && typeof window._getCompStyles === 'function') {
                    window.parent.postMessage(Object.assign({
                        type: 'LF_COMP_SELECTED'
                    }, window._getCompStyles(comp)), '*');
                }
            });

            const parentComp = container.closest('.lf-component');
            if (parentComp) {
                fitCursorWidth(parentComp);
            }
        });
    };

    // Attach to global window object
    window.bindStepperEvents = bindStepperEvents;
    window.bindFileuploadEvents = bindFileuploadEvents;
    window.bindAccordionEvents = bindAccordionEvents;
    window.bindToggleEvents = bindToggleEvents;
    window.bindCursorEvents = bindCursorEvents;

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

    window.v4MessageHandlers['LF_UPDATE_CURSOR_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
        if (!s) return;
        const container = s.querySelector('.v4-cursor-container') || (s.classList.contains('v4-cursor-container') ? s : null);
        if (!container) return;

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        if (d.cursorType !== undefined) {
            container.setAttribute("data-cursor-type", d.cursorType);
            const iconWrap = container.querySelector(".v4-cursor-icon-wrap");
            if (iconWrap) {
                var pointerSrc = 'data:image/png;base64,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';
                var ibeamSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAAF0CAYAAADM5LCYAAAH10lEQVR4nO3bS6h1dR3G8cdrXkBTi5RKqOiCFWG3SWUqUiQogXQbNAkySioIc1AWbzMdZDeimmRkqDgoyUlFSnczKwgCozKLCrRMFCsztdq71oE8aJnP2vu/3s7nA793+q7fOt+zz157rZ0AAAAAwMN7YZILk3w6yVULnE8luSTJ+UnOSvL0JAds+RydkOSMJG9LcvF0TJcv4Nzsns8muSjJK5IcuumT8qLVf/SdJH/fD+e2JFcmeVOSozdwbg5JcnaSTyb56QL2fTTzyySv28C5+afXJ/nLApacY+6ZYnrpDOflqUk+snql+d0C9pprLpnhvDzIy5P8dQGLbWK+luS0R3FOnpHksiT3LWCHTcwFc8Vz8Opl7aYFLLTpuSbJkx/B+Th89c++6VVs9DFvcu5d/YI8bY6AXruAZbY1d077PpyT9+P3N49mPjZHQJ9bwCLbno8/xBXJW/bAq87u+dUcAd24gEVGzLWrN5NHTZf/+xZwPKPmyDagnyxgiVFzQ5JLF3AcI+f4NqCvL2AJM2buny6iKhcvYBEzZq5v41l7fpK/LWAZs/155xwBZbpnMnoZs935RZLD5gro2D32+cden/XHFS+eK54dT0zyvQUsZzY7tyZ5ydzx7DhkejxhL9za2Gtz63TBdMym4tntKUlOT/Kahc0bpxuB60+Tb17AD+b26Zmb902Pkow+P7vnzCTPTnLgtsLZ3zwvyRUDriSvnx7SOmj0CWAe64fhfraFcO5O8oYBT0CyBeuryes2GM/6ib7njl6SzTp8QzeI75reS7AHnJjkjpkDOnP0UmzX+TPGc/XoZdi+9cf0v54hnvXV3Umjl2GMD80Q0PdHL8E4p84Q0PtHL8E4j50hoHNGL8FYD5QBnTF6AcZqvxg4x7db2Y8JiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIjK/WVAp41egHEeU8aznrNHL8E4z5ohoHNHL8E475ohoM+PXoJxvjFDQH9McuToRdi+U2aIZ2feO3oZtuvAJDfMGNBdSZ4weim25+IZ49mZbyY5dPRibN65G4hnZy5NcvDoBdmMg5JctMF4duYrSY4ZvSzzOiPJD7cQz878djVv9mq0/zouyQuSvCfJjVsMZ/fckuSDSU5NcsL05n3Pe3ySd68ug69LcnOSOxY29wwM5r/NfQs4P7vnN0m+O/15P2nT8bx9umQd/YMwm5n1jeVPrGI6bBPxfHQBC5rtzLeTHDFnPG9dwFJmu3P5XPEcO/2tHL2Q2f6cMkdA5y1gETNmrpwjoC8uYBEzZu6cI6AfLWCRUXPv6v3fbQs4jpFTf6r+4wUsMWLWH1ecnuTEJDct4HhGzePagL60gCW2PesP107+t3Ow/mT7Wws4rm3Pn5Ic0AZ0wQIW2eZ8NcnxD3Ee1ve19iV5YAHHuK25po1n7UmriP68gGU2Pes/We94BL9xr5xu4Yw+3m3Mq+cIaO0DC1hmU7N+Rblsutn5SB2ef70a3b2A49/UXDtXPJmepfl/u5xfX2F9Jskzi/Ny3PTL9YcF7DPn/Hy6aT6r9XuAD8/wTc6Rc/90n+e86Yc/l/UXFM9JcvX0xnP0ns18eY4rr//kOdMd21sW/obyzuny+wvTowpnJTl6kydmsn4u+mWrWC9cvbpdsfp/f5Dk9oWfq98nuSrJq7Zwfh7k4OmDpiXNUds+Cf+DIxZwfnbPRh7dAAAAABbnH/XVl8MOCQd0AAAAAElFTkSuQmCC';
                if (d.cursorType === "pointer") {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="pointer" style="width: 21px; height: 28px; background-image: url(' + pointerSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                } else if (d.cursorType === "text") {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="text" style="width: 11px; height: 28px; background-image: url(' + ibeamSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                } else {
                    iconWrap.innerHTML = '<svg viewBox="0 0 24 24" class="lf-icon v4-cursor-svg" style="width: 24px; height: 24px; display: block; overflow: visible; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none;"><path class="v4-cursor-path" d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" fill="#ffffff" stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round" /></svg>';
                }
            }
        }

        if (d.cursorText !== undefined) {
            container.setAttribute('data-cursor-text', d.cursorText);
            const textEl = container.querySelector('.v4-cursor-text');
            if (textEl && textEl.innerText !== d.cursorText) {
                textEl.innerText = d.cursorText;
            }
            fitCursorWidth(s);
        }

        if (d.showText !== undefined) {
            const isShow = d.showText === true || d.showText === 'true';
            container.setAttribute('data-show-text', isShow ? 'true' : 'false');
            const descBox = container.querySelector('.v4-cursor-desc-box');
            if (descBox) {
                descBox.style.display = isShow ? 'inline-flex' : 'none';
            }

            fitCursorWidth(s);
        }

        if (d.badgeStyle !== undefined) {
            container.setAttribute('data-badge-style', d.badgeStyle);
            const descBox = container.querySelector('.v4-cursor-desc-box');
            const textEl = container.querySelector('.v4-cursor-text');
            if (descBox) {
                if (d.badgeStyle === 'blue') {
                    descBox.style.background = '#1d4ed8';
                    descBox.style.borderColor = '#2563eb';
                    descBox.style.color = '#ffffff';
                } else if (d.badgeStyle === 'light') {
                    descBox.style.background = '#ffffff';
                    descBox.style.borderColor = '#cbd5e1';
                    descBox.style.color = '#0f172a';
                } else {
                    descBox.style.background = '#1e293b';
                    descBox.style.borderColor = '#334155';
                    descBox.style.color = '#ffffff';
                }
                if (textEl) {
                    textEl.style.color = descBox.style.color;
                }
            }
        }

        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
        markDirty();

        if (typeof window._getCompStyles === 'function') {
            window.parent.postMessage(Object.assign({
                type: 'LF_COMP_SELECTED'
            }, window._getCompStyles(s)), '*');
        }
    };

})();
`;
