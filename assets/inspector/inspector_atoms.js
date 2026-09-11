/**
 * assets/inspector_atoms.js
 * Domain Inspector Module: Atomic Components (Stepper, Selectbox, FileUpload, Alert, Button, Toggle)
 * Encapsulates state synchronization (Read) and event handling (Write).
 */
(function() {
    console.log("[Inspector Atoms] Domain module loaded.");

    const highlightActive = window.highlightActive;
    const notifyIframe = (data) => window.notifyIframe(data);

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

        // Show Description (Y/N)
        const isShowDesc = comp.alertShowDesc !== undefined ? (comp.alertShowDesc === true || comp.alertShowDesc === 'true') : false;
        const btnDescY = document.getElementById('btn-alert-desc-y');
        const btnDescN = document.getElementById('btn-alert-desc-n');
        if (btnDescY) highlightActive(btnDescY, isShowDesc);
        if (btnDescN) highlightActive(btnDescN, !isShowDesc);

        // Description Text
        const descInput = document.getElementById('prop-alert-desc');
        if (descInput && document.activeElement !== descInput && comp.alertDesc !== undefined) {
            descInput.value = comp.alertDesc;
        }

        // Alert Message
        const msgText = document.getElementById('prop-alert-message');
        if (msgText && document.activeElement !== msgText && comp.alertMessage !== undefined) {
            msgText.value = comp.alertMessage;
        }
        
        // Button Count
        const count = comp.alertBtnCount || 1;
        for (let i = 1; i <= 3; i++) {
            const btn = document.getElementById('btn-alert-count-' + i);
            if (btn) highlightActive(btn, count === i);
        }
        
        // Buttons 1~3 Text and Style
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
        // Description Toggle (Y / N)
        const btnDescY = document.getElementById('btn-alert-desc-y');
        const btnDescN = document.getElementById('btn-alert-desc-n');
        if (btnDescY) {
            btnDescY.onclick = () => {
                highlightActive(btnDescY, true);
                if (btnDescN) highlightActive(btnDescN, false);
                notifyIframe({
                    type: 'LF_UPDATE_ALERT_PROPERTIES',
                    showDesc: true,
                    alertShowDesc: true
                });
            };
        }
        if (btnDescN) {
            btnDescN.onclick = () => {
                if (btnDescY) highlightActive(btnDescY, false);
                highlightActive(btnDescN, true);
                notifyIframe({
                    type: 'LF_UPDATE_ALERT_PROPERTIES',
                    showDesc: false,
                    alertShowDesc: false
                });
            };
        }

        // Description Text
        const descInp = document.getElementById('prop-alert-desc');
        if (descInp) {
            descInp.oninput = () => {
                notifyIframe({
                    type: 'LF_UPDATE_ALERT_PROPERTIES',
                    descText: descInp.value,
                    alertDesc: descInp.value
                });
            };
        }

        // Alert Message
        const msgInp = document.getElementById('prop-alert-message');
        if (msgInp) {
            msgInp.oninput = () => {
                notifyIframe({
                    type: 'LF_UPDATE_ALERT_PROPERTIES',
                    messageText: msgInp.value,
                    alertMessage: msgInp.value
                });
            };
        }

        // Button Count (1 ~ 3)
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
                    notifyIframe({
                        type: 'LF_UPDATE_ALERT_PROPERTIES',
                        btnCount: i,
                        alertBtnCount: i
                    });
                };
            }
            const txt = document.getElementById('prop-alert-btn-' + i);
            if (txt) {
                txt.oninput = () => {
                    const payload = { type: 'LF_UPDATE_ALERT_PROPERTIES' };
                    payload['btnText' + i] = txt.value;
                    payload['alertBtnText' + i] = txt.value;
                    notifyIframe(payload);
                };
            }
            const sel = document.getElementById('prop-alert-btn-style-' + i);
            if (sel) {
                sel.onchange = () => {
                    const payload = { type: 'LF_UPDATE_ALERT_PROPERTIES' };
                    payload['btnStyle' + i] = sel.value;
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


    // --- Checkbox & Radio Events (Integrated from vctrl_v4_addon.js) ---
    const initCheckboxRadioEvents = () => {
        const activeY = document.getElementById('btn-atom-active-y');
        const activeN = document.getElementById('btn-atom-active-n');
        const textY = document.getElementById('btn-atom-text-y');
        const textN = document.getElementById('btn-atom-text-n');
        

        if (activeY) {
            activeY.onclick = () => {
                highlightActive(activeY, true);
                highlightActive(activeN, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_STATE', checked: true });
            };
        }
        if (activeN) {
            activeN.onclick = () => {
                highlightActive(activeN, true);
                highlightActive(activeY, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_STATE', checked: false });
            };
        }
        
        if (textY) {
            textY.onclick = () => {
                highlightActive(textY, true);
                highlightActive(textN, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_TEXT_ENABLED', enabled: true });
            };
        }
        if (textN) {
            textN.onclick = () => {
                highlightActive(textN, true);
                highlightActive(textY, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_TEXT_ENABLED', enabled: false });
            };
        }

        const labelTextInp = document.getElementById('prop-atom-text-content');
        if (labelTextInp) {
            labelTextInp.oninput = function() {
                notifyIframe({
                    type: 'LF_UPDATE_ATOM_LABEL_TEXT',
                    text: this.value
                });
            };
        }

        const widthIconInp = document.getElementById('prop-width-icon');
        const heightIconInp = document.getElementById('prop-height-icon');

        if (widthIconInp) {
            widthIconInp.oninput = function() {
                const val = parseInt(this.value);
                if (!isNaN(val) && val > 0) {
                    notifyIframe({
                        type: 'LF_UPDATE_ATOM_ICON_SIZE',
                        width: val,
                        height: heightIconInp ? (parseInt(heightIconInp.value) || val) : val
                    });
                }
            };
        }
        if (heightIconInp) {
            heightIconInp.oninput = function() {
                const val = parseInt(this.value);
                if (!isNaN(val) && val > 0) {
                    notifyIframe({
                        type: 'LF_UPDATE_ATOM_ICON_SIZE',
                        width: widthIconInp ? (parseInt(widthIconInp.value) || val) : val,
                        height: val
                    });
                }
            };
        }
    };
    initCheckboxRadioEvents();

    // Textbox / Textarea Inspector Events

    // --- Textbox & Textarea Events (Integrated from vctrl_v4_addon.js) ---
    const initTextboxTextareaEvents = () => {
        const phInput = document.getElementById('prop-input-placeholder');
        if (phInput) {
            phInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', placeholderText: phInput.value });
            };
        }

        const mlInput = document.getElementById('prop-input-maxlength');
        if (mlInput) {
            mlInput.oninput = () => {
                let val = parseInt(mlInput.value);
                if (isNaN(val) || val < 1) val = 1;
                const txt = document.getElementById('txt-input-maxlength');
                if (txt) txt.innerText = val;
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', maxLength: val });
            };
        }

        const counterY = document.getElementById('btn-input-counter-y');
        const counterN = document.getElementById('btn-input-counter-n');

        if (counterY) {
            counterY.onclick = () => {
                highlightActive(counterY, true);
                highlightActive(counterN, false);
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', showCounter: true });
            };
        }
        if (counterN) {
            counterN.onclick = () => {
                highlightActive(counterN, true);
                highlightActive(counterY, false);
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', showCounter: false });
            };
        }

        // Font Size & Font Family Controls
        const fsInput = document.getElementById('prop-input-fontsize');
        if (fsInput) {
            fsInput.oninput = () => {
                let val = parseInt(fsInput.value);
                if (isNaN(val) || val < 1) val = 12;
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', fontSize: val });
            };
        }

        const ffInput = document.getElementById('prop-input-fontfamily');
        if (ffInput) {
            ffInput.onchange = () => {
                notifyIframe({ type: 'LF_UPDATE_TEXTBOX_PROPERTIES', fontFamily: ffInput.value });
            };
        }
    };
    initTextboxTextareaEvents();

    // Search Bar Inspector Events

    // --- SearchBar Events (Integrated from vctrl_v4_addon.js) ---
    const initSearchBarEvents = () => {
        const phInput = document.getElementById('prop-searchbar-placeholder');
        if (phInput) {
            phInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_SEARCHBAR_PROPERTIES', placeholderText: phInput.value });
            };
        }

        const fsInput = document.getElementById('prop-searchbar-fontsize');
        if (fsInput) {
            fsInput.oninput = () => {
                notifyIframe({ type: 'LF_UPDATE_SEARCHBAR_PROPERTIES', fontSize: parseInt(fsInput.value) });
            };
        }
    };
    initSearchBarEvents();

    // Stepper Inspector Events

    // --- DatePicker Events (Integrated from vctrl_v4_addon.js) ---
    const initDatePickerEvents = () => {
        // Show Presets Toggle
        const presetsY = document.getElementById('btn-dp-presets-y');
        const presetsN = document.getElementById('btn-dp-presets-n');
        if (presetsY) {
            presetsY.onclick = () => {
                highlightActive(presetsY, true);
                highlightActive(presetsN, false);
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', showPresets: true });
            };
        }
        if (presetsN) {
            presetsN.onclick = () => {
                highlightActive(presetsN, true);
                highlightActive(presetsY, false);
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', showPresets: false });
            };
        }

        // Show End Date Toggle
        const showEndY = document.getElementById('btn-dp-show-end-y');
        const showEndN = document.getElementById('btn-dp-show-end-n');
        if (showEndY) {
            showEndY.onclick = () => {
                highlightActive(showEndY, true);
                highlightActive(showEndN, false);
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', showEndDate: true });
            };
        }
        if (showEndN) {
            showEndN.onclick = () => {
                highlightActive(showEndN, true);
                highlightActive(showEndY, false);
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', showEndDate: false });
            };
        }

        // Default Preset Buttons
        const presetKeys = ['none', '1D', '1W', '1M', '6M', 'all'];
        presetKeys.forEach(key => {
            const btn = document.getElementById('btn-dp-default-' + key);
            if (btn) {
                btn.onclick = () => {
                    presetKeys.forEach(k => {
                        const b = document.getElementById('btn-dp-default-' + k);
                        highlightActive(b, k === key);
                    });
                    notifyIframe({ type: 'LF_UPDATE_DATEPICKER', defaultPreset: key });
                };
            }
        });

        // Mode Selector Buttons
        const modeSimpleBtn = document.getElementById('btn-dp-mode-simple');
        const modeDetailedBtn = document.getElementById('btn-dp-mode-detailed');
        const timeInputsWrapper = document.getElementById('dp-time-inputs-wrapper');
        const presetsToggleWrapper = document.getElementById('dp-presets-toggle-wrapper');
        const showEndToggleWrapper = document.getElementById('dp-show-end-toggle-wrapper');
        const defaultPresetWrapper = document.getElementById('dp-default-preset-wrapper');
        
        if (modeSimpleBtn) {
            modeSimpleBtn.onclick = () => {
                highlightActive(modeSimpleBtn, true);
                highlightActive(modeDetailedBtn, false);
                if (timeInputsWrapper) timeInputsWrapper.style.display = 'none';
                if (presetsToggleWrapper) presetsToggleWrapper.style.display = 'block';
                if (showEndToggleWrapper) showEndToggleWrapper.style.display = 'block';
                if (defaultPresetWrapper) defaultPresetWrapper.style.display = 'block';
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', mode: 'simple' });
            };
        }
        if (modeDetailedBtn) {
            modeDetailedBtn.onclick = () => {
                highlightActive(modeDetailedBtn, true);
                highlightActive(modeSimpleBtn, false);
                if (timeInputsWrapper) timeInputsWrapper.style.display = 'block';
                if (presetsToggleWrapper) presetsToggleWrapper.style.display = 'none';
                if (showEndToggleWrapper) showEndToggleWrapper.style.display = 'block';
                if (defaultPresetWrapper) defaultPresetWrapper.style.display = 'none';
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', mode: 'detailed' });
            };
        }

        // Auto-slash formatter for YYYY/MM/DD
        const formatSlashDate = (value) => {
            let val = value.replace(/[^0-9]/g, '');
            let formatted = '';
            if (val.length > 0) {
                formatted += val.substring(0, 4);
                if (val.length > 4) {
                    formatted += '/' + val.substring(4, 6);
                    if (val.length > 6) {
                        formatted += '/' + val.substring(6, 8);
                    }
                }
            }
            return formatted;
        };

        // Auto-colon formatter for HH:MM:SS
        const formatColonTime = (value) => {
            let val = value.replace(/[^0-9]/g, '');
            let formatted = '';
            if (val.length > 0) {
                formatted += val.substring(0, 2);
                if (val.length > 2) {
                    formatted += ':' + val.substring(2, 4);
                    if (val.length > 4) {
                        formatted += ':' + val.substring(4, 6);
                    }
                }
            }
            return formatted;
        };

        // Start/End Date Direct Input
        const startInput = document.getElementById('prop-dp-start-date');
        if (startInput) {
            startInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatSlashDate(this.value);
                }
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', startDate: this.value });
            });
        }
        const endInput = document.getElementById('prop-dp-end-date');
        if (endInput) {
            endInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatSlashDate(this.value);
                }
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', endDate: this.value });
            });
        }

        // Start/End Time Direct Input
        const startTimeInput = document.getElementById('prop-dp-start-time');
        if (startTimeInput) {
            startTimeInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatColonTime(this.value);
                }
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', startTime: this.value });
            });
        }
        const endTimeInput = document.getElementById('prop-dp-end-time');
        if (endTimeInput) {
            endTimeInput.addEventListener('input', function(e) {
                if (e.inputType !== 'deleteContentBackward') {
                    this.value = formatColonTime(this.value);
                }
                notifyIframe({ type: 'LF_UPDATE_DATEPICKER', endTime: this.value });
            });
        }
    };
    initDatePickerEvents();

    window.syncAccordionSubItemInputs = (texts) => {
        if (window.InspectorAccordion && typeof window.InspectorAccordion.syncSubItemInputs === 'function') {
            window.InspectorAccordion.syncSubItemInputs(texts);
        }
    };

    window.syncAccordionHierarchyInputs = (hierarchy) => {
        if (window.InspectorAccordion && typeof window.InspectorAccordion.syncHierarchyInputs === 'function') {
            window.InspectorAccordion.syncHierarchyInputs(hierarchy);
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
        bindCheckboxRadioEvents: initCheckboxRadioEvents,
        bindTextboxTextareaEvents: initTextboxTextareaEvents,
        bindSearchBarEvents: initSearchBarEvents,
        bindDatePickerEvents: initDatePickerEvents,
        bindAllEvents: function() {
            bindStepperEvents();
            bindSelectboxEvents();
            bindFileuploadEvents();
            bindAlertEvents();
            bindButtonEvents();
            bindToggleEvents();
            if (typeof initCheckboxRadioEvents === 'function') initCheckboxRadioEvents();
            if (typeof initTextboxTextareaEvents === 'function') initTextboxTextareaEvents();
            if (typeof initSearchBarEvents === 'function') initSearchBarEvents();
            if (typeof initDatePickerEvents === 'function') initDatePickerEvents();
        }
    };
    
    // Global alias exports for backwards-compatibility
    window.initCheckboxRadioEvents = initCheckboxRadioEvents;
    window.initTextboxTextareaEvents = initTextboxTextareaEvents;
    window.initSearchbarEvents = initSearchBarEvents;
    window.initDatePickerEvents = initDatePickerEvents;
})();
