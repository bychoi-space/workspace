/**
 * assets/inspector_atoms.js
 * Domain Inspector Module: Atomic Components (Stepper, Selectbox, FileUpload, Alert, Button, Toggle)
 * Encapsulates state synchronization (Read) and event handling (Write).
 */
(function() {
    console.log("[Inspector Atoms] Domain module loaded.");

    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    const notifyIframe = (data) => {
        const activeIframe = (window.DOM && window.DOM.iframe) || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            if (window.MessageHub) {
                MessageHub.send(activeIframe.contentWindow, data.type, data);
                return;
            }
            if (window.EditorBus) {
                window.EditorBus.sendToIframe(data);
                return;
            }
            activeIframe.contentWindow.postMessage(data, '*');
        }
    };

    // --- Disabled State Common Sync ---
    const syncDisabled = (comp) => {
        if (!comp) return;
        const isDis = (comp.disabled === true || comp.disabled === 'true');
        document.querySelectorAll('.btn-atom-disabled').forEach(btn => {
            const btnIsDis = btn.dataset.disabled === 'true';
            highlightActive(btn, isDis === btnIsDis);
        });
    };

    // --- Stepper Component ---
    const syncStepper = (comp) => {
        if (!comp) return;
        const activeY = document.getElementById('btn-stepper-btn-y');
        const activeN = document.getElementById('btn-stepper-btn-n');
        const disabledY = document.getElementById('btn-stepper-disabled-y');
        const disabledN = document.getElementById('btn-stepper-disabled-n');
        
        if (activeY && activeN) {
            highlightActive(activeY, comp.btnEnabled === true);
            highlightActive(activeN, comp.btnEnabled === false);
        }
        if (disabledY && disabledN) {
            highlightActive(disabledY, comp.disabled === true || comp.disabled === 'true');
            highlightActive(disabledN, comp.disabled === false || comp.disabled === 'false');
        }
        
        const minInput = document.getElementById('prop-stepper-min');
        if (minInput && comp.minVal !== undefined) minInput.value = comp.minVal;
        
        const maxInput = document.getElementById('prop-stepper-max');
        if (maxInput && comp.maxVal !== undefined) maxInput.value = comp.maxVal;
        
        const btnTextInput = document.getElementById('prop-stepper-btn-text');
        if (btnTextInput && comp.btnText !== undefined) btnTextInput.value = comp.btnText;

        syncDisabled(comp);
    };

    const bindStepperEvents = () => {
        const btnY = document.getElementById('btn-stepper-btn-y');
        const btnN = document.getElementById('btn-stepper-btn-n');
        const minInp = document.getElementById('prop-stepper-min');
        const maxInp = document.getElementById('prop-stepper-max');
        const txtInp = document.getElementById('prop-stepper-btn-text');
        const disY = document.getElementById('btn-stepper-disabled-y');
        const disN = document.getElementById('btn-stepper-disabled-n');

        if (btnY) {
            btnY.onclick = () => {
                highlightActive(btnY, true);
                highlightActive(btnN, false);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnEnabled: true });
            };
        }
        if (btnN) {
            btnN.onclick = () => {
                highlightActive(btnY, false);
                highlightActive(btnN, true);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnEnabled: false });
            };
        }
        if (minInp) {
            minInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', minVal: minInp.value });
            };
        }
        if (maxInp) {
            maxInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', maxVal: maxInp.value });
            };
        }
        if (txtInp) {
            txtInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnText: txtInp.value });
            };
        }
        if (disY) {
            disY.onclick = () => {
                highlightActive(disY, true);
                highlightActive(disN, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_DISABLED', disabled: true });
            };
        }
        if (disN) {
            disN.onclick = () => {
                highlightActive(disY, false);
                highlightActive(disN, true);
                notifyIframe({ type: 'LF_UPDATE_ATOM_DISABLED', disabled: false });
            };
        }
    };

    // --- Selectbox Component ---
    const syncSelectbox = (comp) => {
        if (!comp) return;
        const activeY = document.getElementById('btn-selectbox-dropdown-y');
        const activeN = document.getElementById('btn-selectbox-dropdown-n');
        const isDropdown = comp.selectboxDropdownActive === true;

        if (activeY && activeN) {
            highlightActive(activeY, isDropdown);
            highlightActive(activeN, !isDropdown);
        }

        const defaultControls = document.getElementById('selectbox-default-controls');
        const dropdownControls = document.getElementById('selectbox-dropdown-controls');
        if (defaultControls) defaultControls.style.display = isDropdown ? 'none' : 'block';
        if (dropdownControls) dropdownControls.style.display = isDropdown ? 'block' : 'none';

        const defaultTextInput = document.getElementById('prop-selectbox-default-text');
        if (defaultTextInput && document.activeElement !== defaultTextInput && comp.selectboxDefaultText !== undefined) {
            defaultTextInput.value = comp.selectboxDefaultText;
        }

        const options = comp.selectboxOptions || [];
        const countInput = document.getElementById('prop-selectbox-option-count');
        if (countInput) countInput.value = options.length;

        const inputsContainer = document.getElementById('selectbox-options-inputs-container');
        if (inputsContainer) {
            const activeEl = document.activeElement;
            const isTyping = activeEl && inputsContainer.contains(activeEl);
            if (!isTyping) {
                inputsContainer.innerHTML = options.map((optText, idx) => {
                    return '<div style="display: flex; align-items: center; gap: 8px;">' +
                        '<span style="font-size: 10px; color: #94a3b8; width: 45px; flex-shrink: 0;">Item ' + (idx + 1) + '</span>' +
                        '<input type="text" class="selectbox-option-input" data-index="' + idx + '" value="' + (optText || '') + '" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; outline: none; font-family: inherit;">' +
                    '</div>';
                }).join('');
            }
        }
        syncDisabled(comp);
    };

    const bindSelectboxEvents = () => {
        const dropY = document.getElementById('btn-selectbox-dropdown-y');
        const dropN = document.getElementById('btn-selectbox-dropdown-n');
        const defText = document.getElementById('prop-selectbox-default-text');
        const countInp = document.getElementById('prop-selectbox-option-count');
        const inputsContainer = document.getElementById('selectbox-options-inputs-container');

        if (dropY) {
            dropY.onclick = () => {
                highlightActive(dropY, true);
                highlightActive(dropN, false);
                const dc = document.getElementById('selectbox-default-controls');
                const dpc = document.getElementById('selectbox-dropdown-controls');
                if (dc) dc.style.display = 'none';
                if (dpc) dpc.style.display = 'block';
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', dropdownActive: true });
            };
        }
        if (dropN) {
            dropN.onclick = () => {
                highlightActive(dropY, false);
                highlightActive(dropN, true);
                const dc = document.getElementById('selectbox-default-controls');
                const dpc = document.getElementById('selectbox-dropdown-controls');
                if (dc) dc.style.display = 'block';
                if (dpc) dpc.style.display = 'none';
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', dropdownActive: false });
            };
        }
        if (defText) {
            defText.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', defaultText: defText.value });
            };
        }
        if (countInp) {
            countInp.oninput = () => {
                const count = Math.max(1, Math.min(10, parseInt(countInp.value) || 1));
                const currentInputs = inputsContainer ? Array.from(inputsContainer.querySelectorAll('.selectbox-option-input')) : [];
                const currentValues = currentInputs.map(inp => inp.value);
                while (currentValues.length < count) {
                    currentValues.push('Option ' + (currentValues.length + 1));
                }
                if (currentValues.length > count) {
                    currentValues.length = count;
                }
                if (inputsContainer) {
                    inputsContainer.innerHTML = currentValues.map((v, i) => {
                        return '<div style="display: flex; align-items: center; gap: 8px;">' +
                            '<span style="font-size: 10px; color: #94a3b8; width: 45px; flex-shrink: 0;">Item ' + (i + 1) + '</span>' +
                            '<input type="text" class="selectbox-option-input" data-index="' + i + '" value="' + v + '" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; outline: none; font-family: inherit;">' +
                        '</div>';
                    }).join('');
                }
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', options: currentValues });
            };
        }
        if (inputsContainer) {
            inputsContainer.oninput = (e) => {
                if (e.target && e.target.classList.contains('selectbox-option-input')) {
                    const allInps = Array.from(inputsContainer.querySelectorAll('.selectbox-option-input'));
                    const vals = allInps.map(inp => inp.value);
                    notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', options: vals });
                }
            };
        }
    };

    // --- FileUpload Component ---
    const syncFileupload = (comp) => {
        if (!comp) return;
        const activeY = document.getElementById('btn-fileupload-selected-y');
        const activeN = document.getElementById('btn-fileupload-selected-n');
        const isSelected = comp.fileSelected === true;

        if (activeY && activeN) {
            highlightActive(activeY, isSelected);
            highlightActive(activeN, !isSelected);
        }

        const nameControls = document.getElementById('fileupload-name-controls');
        const placeholderControls = document.getElementById('fileupload-placeholder-controls');
        if (nameControls) nameControls.style.display = isSelected ? 'block' : 'none';
        if (placeholderControls) placeholderControls.style.display = isSelected ? 'none' : 'block';

        const nameInput = document.getElementById('prop-fileupload-file-name');
        if (nameInput && document.activeElement !== nameInput && comp.fileName !== undefined) {
            nameInput.value = comp.fileName;
        }

        const placeholderInput = document.getElementById('prop-fileupload-placeholder');
        if (placeholderInput && document.activeElement !== placeholderInput && comp.filePlaceholder !== undefined) {
            placeholderInput.value = comp.filePlaceholder;
        }

        const btnTextInput = document.getElementById('prop-fileupload-btn-text');
        if (btnTextInput && document.activeElement !== btnTextInput && comp.fileButtonText !== undefined) {
            btnTextInput.value = comp.fileButtonText;
        }
        syncDisabled(comp);
    };

    const bindFileuploadEvents = () => {
        const selY = document.getElementById('btn-fileupload-selected-y');
        const selN = document.getElementById('btn-fileupload-selected-n');
        const nameInp = document.getElementById('prop-fileupload-file-name');
        const phInp = document.getElementById('prop-fileupload-placeholder');
        const btnTextInp = document.getElementById('prop-fileupload-btn-text');

        if (selY) {
            selY.onclick = () => {
                highlightActive(selY, true);
                highlightActive(selN, false);
                const nc = document.getElementById('fileupload-name-controls');
                const pc = document.getElementById('fileupload-placeholder-controls');
                if (nc) nc.style.display = 'block';
                if (pc) pc.style.display = 'none';
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileSelected: true });
            };
        }
        if (selN) {
            selN.onclick = () => {
                highlightActive(selY, false);
                highlightActive(selN, true);
                const nc = document.getElementById('fileupload-name-controls');
                const pc = document.getElementById('fileupload-placeholder-controls');
                if (nc) nc.style.display = 'none';
                if (pc) pc.style.display = 'block';
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileSelected: false });
            };
        }
        if (nameInp) {
            nameInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileName: nameInp.value });
            };
        }
        if (phInp) {
            phInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', filePlaceholder: phInp.value });
            };
        }
        if (btnTextInp) {
            btnTextInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileButtonText: btnTextInp.value });
            };
        }
    };

    // --- Alert Component ---
    const syncAlert = (comp) => {
        if (!comp) return;
        const msgText = document.getElementById('prop-alert-message');
        if (msgText && document.activeElement !== msgText && comp.alertMessage !== undefined) {
            msgText.value = comp.alertMessage;
        }
        
        const count = comp.alertBtnCount || 1;
        for (let i = 1; i <= 3; i++) {
            const btn = document.getElementById('btn-alert-count-' + i);
            if (btn) highlightActive(btn, count === i);
        }
        
        const btn1 = document.getElementById('prop-alert-btn-1');
        if (btn1 && document.activeElement !== btn1 && comp.alertBtnText1 !== undefined) btn1.value = comp.alertBtnText1;
        const sel1 = document.getElementById('prop-alert-btn-style-1');
        if (sel1 && comp.alertBtnStyle1) sel1.value = comp.alertBtnStyle1;
        
        const btn2 = document.getElementById('prop-alert-btn-2');
        if (btn2 && document.activeElement !== btn2 && comp.alertBtnText2 !== undefined) btn2.value = comp.alertBtnText2;
        const sel2 = document.getElementById('prop-alert-btn-style-2');
        if (sel2 && comp.alertBtnStyle2) sel2.value = comp.alertBtnStyle2;
        const btn2Container = document.getElementById('prop-alert-btn-2-container');
        if (btn2Container) btn2Container.style.display = count >= 2 ? 'flex' : 'none';
        
        const btn3 = document.getElementById('prop-alert-btn-3');
        if (btn3 && document.activeElement !== btn3 && comp.alertBtnText3 !== undefined) btn3.value = comp.alertBtnText3;
        const sel3 = document.getElementById('prop-alert-btn-style-3');
        if (sel3 && comp.alertBtnStyle3) sel3.value = comp.alertBtnStyle3;
        const btn3Container = document.getElementById('prop-alert-btn-3-container');
        if (btn3Container) btn3Container.style.display = count >= 3 ? 'flex' : 'none';
    };

    const bindAlertEvents = () => {
        const msgInp = document.getElementById('prop-alert-message');
        if (msgInp) {
            msgInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', alertMessage: msgInp.value });
            };
        }
        for (let i = 1; i <= 3; i++) {
            const countBtn = document.getElementById('btn-alert-count-' + i);
            if (countBtn) {
                countBtn.onclick = () => {
                    for (let j = 1; j <= 3; j++) {
                        const b = document.getElementById('btn-alert-count-' + j);
                        if (b) highlightActive(b, i === j);
                    }
                    const c2 = document.getElementById('prop-alert-btn-2-container');
                    const c3 = document.getElementById('prop-alert-btn-3-container');
                    if (c2) c2.style.display = i >= 2 ? 'flex' : 'none';
                    if (c3) c3.style.display = i >= 3 ? 'flex' : 'none';
                    notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', alertBtnCount: i });
                };
            }
            const txt = document.getElementById('prop-alert-btn-' + i);
            if (txt) {
                txt.oninput = () => {
                    const payload = { type: 'LF_UPDATE_ALERT_PROPERTIES' };
                    payload['alertBtnText' + i] = txt.value;
                    notifyIframe(payload);
                };
            }
            const sel = document.getElementById('prop-alert-btn-style-' + i);
            if (sel) {
                sel.onchange = () => {
                    const payload = { type: 'LF_UPDATE_ALERT_PROPERTIES' };
                    payload['alertBtnStyle' + i] = sel.value;
                    notifyIframe(payload);
                };
            }
        }
    };

    // --- Button Component ---
    const syncButton = (comp) => {
        if (!comp) return;
        const txtInput = document.getElementById('prop-button-text');
        if (txtInput && document.activeElement !== txtInput && comp.buttonText !== undefined) {
            txtInput.value = comp.buttonText;
        }
        
        const fontInput = document.getElementById('prop-button-font-size');
        if (fontInput && document.activeElement !== fontInput && comp.buttonFontSize !== undefined) {
            fontInput.value = comp.buttonFontSize;
        }
        
        const selStyle = document.getElementById('prop-button-style');
        if (selStyle && comp.buttonStyle !== undefined) {
            selStyle.value = comp.buttonStyle;
            const customColorsDiv = document.getElementById('prop-button-custom-colors');
            if (customColorsDiv) customColorsDiv.style.display = (comp.buttonStyle === 'custom') ? 'block' : 'none';
        }
        
        const radiusSlider = document.getElementById('prop-button-border-radius');
        const radiusTxt = document.getElementById('txt-button-border-radius');
        if (radiusSlider && document.activeElement !== radiusSlider && comp.buttonRadius !== undefined) {
            const r = parseInt(comp.buttonRadius) || 0;
            radiusSlider.value = r;
            if (radiusTxt) radiusTxt.innerText = r;
            if (typeof window._syncButtonCornerBtns === 'function') {
                window._syncButtonCornerBtns(r);
            }
        }

        if (comp.buttonStyle === 'custom' && comp.currentStyles) {
            const s = comp.currentStyles;
            const syncColorLocal = (id, wrapperId, color, isTransparent) => {
                const picker = document.getElementById(id);
                const wrapper = document.getElementById(wrapperId);
                if (picker && color) picker.value = color;
                if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
            };
            syncColorLocal('prop-button-bg-color', 'button-bg-wrapper', s.bg, s.isBgTransparent);
            syncColorLocal('prop-button-border-color', 'button-border-wrapper', s.border, s.isBorderTransparent);
            syncColorLocal('prop-button-text-color', 'button-text-wrapper', s.text, false);
        }
    };

    const bindButtonEvents = () => {
        const txtInp = document.getElementById('prop-button-text');
        const fontInp = document.getElementById('prop-button-font-size');
        const styleSel = document.getElementById('prop-button-style');
        const radiusSlider = document.getElementById('prop-button-border-radius');

        if (txtInp) {
            txtInp.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonText: txtInp.value });
            };
        }
        if (fontInp) {
            fontInp.oninput = () => {
                const sz = parseInt(fontInp.value);
                if (!isNaN(sz) && sz >= 8) {
                    notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonFontSize: sz });
                }
            };
        }
        if (styleSel) {
            styleSel.onchange = () => {
                const cDiv = document.getElementById('prop-button-custom-colors');
                if (cDiv) cDiv.style.display = (styleSel.value === 'custom') ? 'block' : 'none';
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonStyle: styleSel.value });
            };
        }
        if (radiusSlider) {
            radiusSlider.oninput = () => {
                const r = parseInt(radiusSlider.value) || 0;
                const rTxt = document.getElementById('txt-button-border-radius');
                if (rTxt) rTxt.innerText = r;
                if (typeof window._syncButtonCornerBtns === 'function') window._syncButtonCornerBtns(r);
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonRadius: r });
            };
        }
        const btnFitText = document.getElementById('btn-button-fit-text');
        if (btnFitText) {
            btnFitText.onclick = () => {
                notifyIframe({ type: 'LF_FIT_BUTTON_TO_TEXT' });
            };
        }
    };

    // --- Toggle Component ---
    const syncToggle = (comp) => {
        if (!comp) return;
        const btnOn = document.getElementById('btn-toggle-on');
        const btnOff = document.getElementById('btn-toggle-off');
        const isChecked = comp.toggleChecked === true;
        highlightActive(btnOn, isChecked);
        highlightActive(btnOff, !isChecked);

        const colorPicker = document.getElementById('prop-toggle-color');
        if (colorPicker && comp.toggleColor) {
            colorPicker.value = comp.toggleColor;
        }
        syncDisabled(comp);
    };

    const bindToggleEvents = () => {
        const btnOn = document.getElementById('btn-toggle-on');
        const btnOff = document.getElementById('btn-toggle-off');
        const colorPicker = document.getElementById('prop-toggle-color');

        if (btnOn) {
            btnOn.onclick = () => {
                highlightActive(btnOn, true);
                highlightActive(btnOff, false);
                notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: true });
            };
        }
        if (btnOff) {
            btnOff.onclick = () => {
                highlightActive(btnOn, false);
                highlightActive(btnOff, true);
                notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: false });
            };
        }
        if (colorPicker) {
            colorPicker.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', color: colorPicker.value });
            };
        }
    };

    window.InspectorAtoms = {
        syncStepper: syncStepper,
        syncSelectbox: syncSelectbox,
        syncFileupload: syncFileupload,
        syncAlert: syncAlert,
        syncButton: syncButton,
        syncToggle: syncToggle,
        syncDisabled: syncDisabled,
        bindStepperEvents: bindStepperEvents,
        bindSelectboxEvents: bindSelectboxEvents,
        bindFileuploadEvents: bindFileuploadEvents,
        bindAlertEvents: bindAlertEvents,
        bindButtonEvents: bindButtonEvents,
        bindToggleEvents: bindToggleEvents,
        bindAllEvents: function() {
            bindStepperEvents();
            bindSelectboxEvents();
            bindFileuploadEvents();
            bindAlertEvents();
            bindButtonEvents();
            bindToggleEvents();
        }
    };
})();
