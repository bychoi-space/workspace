/**
 * assets/inspector/inspector_atoms.js
 * Domain Inspector Module: Shared Atom Helpers & Control Widgets (Stepper, Selectbox, FileUpload, Alert, Button, Toggle)
 * Form input atoms are modularized in inspector_atoms_inputs.js; Cursor & WebEditor in inspector_atoms_advanced.js.
 */
(function() {
    console.log("[Inspector Atoms] Core & Widgets module loaded.");

    const highlightActive = window.highlightActive;

    const getActiveTargetIds = function() {
        if (window.GroupingManager && typeof window.GroupingManager.getSelectedIds === 'function') {
            const selIds = window.GroupingManager.getSelectedIds();
            if (Array.isArray(selIds) && selIds.length > 0) return selIds;
        }
        if (window.state && window.state.selectedIds && Array.isArray(window.state.selectedIds) && window.state.selectedIds.length > 0) {
            return window.state.selectedIds;
        }
        const stateSelectedId = (window.state && window.state.selectedComponent && window.state.selectedComponent.id) || null;
        if (stateSelectedId) return [stateSelectedId];
        return window.activeCompId ? [window.activeCompId] : [];
    };

    const notifyIframe = function(data) {
        if (data && typeof data === 'object') {
            const targetIds = getActiveTargetIds();
            if (targetIds.length > 0) {
                if (!data.id) data.id = targetIds[0];
                if (!data.ids) data.ids = targetIds;
            }
        }
        window.notifyIframe(data);
    };

    const syncAtomColor = function(id, wrapperId, color, isTransparent) {
        const picker = document.getElementById(id);
        const wrapper = document.getElementById(wrapperId);
        if (picker && color) picker.value = color;
        if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
    };

    // --- Disabled State Common Sync ---
    const syncDisabled = function(comp) {
        if (!comp) return;
        const isDis = (comp.disabled === true || comp.disabled === 'true');
        document.querySelectorAll('.btn-atom-disabled').forEach(function(btn) {
            const btnIsDis = btn.dataset.disabled === 'true';
            highlightActive(btn, isDis === btnIsDis);
        });
    };

    // --- Disabled State Common Events ---
    let _disabledDelegationBound = false;
    const bindDisabledEvents = function() {
        if (_disabledDelegationBound) return;
        _disabledDelegationBound = true;
        document.addEventListener('click', function(e) {
            const btn = e.target && e.target.closest ? e.target.closest('.btn-atom-disabled') : null;
            if (!btn) return;
            const isDis = btn.dataset.disabled === 'true';
            const group = btn.closest('.prop-group, .v4-flex-gap-4') || document;
            group.querySelectorAll('.btn-atom-disabled').forEach(function(b) {
                highlightActive(b, b.dataset.disabled === String(isDis));
            });
            notifyIframe({ type: 'LF_UPDATE_ATOM_DISABLED', disabled: isDis });
        });
    };
    bindDisabledEvents();

    window.InspectorAtomsShared = {
        getActiveTargetIds: getActiveTargetIds,
        notifyIframe: notifyIframe,
        syncAtomColor: syncAtomColor,
        syncDisabled: syncDisabled,
        bindDisabledEvents: bindDisabledEvents
    };

    // --- Stepper Component ---
    const syncStepper = function(comp) {
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

        const stepInput = document.getElementById('prop-stepper-step');
        if (stepInput && document.activeElement !== stepInput && comp.stepVal !== undefined) {
            stepInput.value = comp.stepVal;
        }

        const btnTextInput = document.getElementById('prop-stepper-btn-text');
        if (btnTextInput && comp.btnText !== undefined) btnTextInput.value = comp.btnText;

        syncDisabled(comp);
    };

    const bindStepperEvents = function() {
        const btnY = document.getElementById('btn-stepper-btn-y');
        const btnN = document.getElementById('btn-stepper-btn-n');
        const minInp = document.getElementById('prop-stepper-min');
        const maxInp = document.getElementById('prop-stepper-max');
        const txtInp = document.getElementById('prop-stepper-btn-text');
        const disY = document.getElementById('btn-stepper-disabled-y');
        const disN = document.getElementById('btn-stepper-disabled-n');

        if (btnY) {
            btnY.onclick = function() {
                highlightActive(btnY, true);
                highlightActive(btnN, false);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnEnabled: true });
            };
        }
        if (btnN) {
            btnN.onclick = function() {
                highlightActive(btnY, false);
                highlightActive(btnN, true);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnEnabled: false });
            };
        }
        if (minInp) {
            minInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', minVal: minInp.value });
            };
        }
        if (maxInp) {
            maxInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', maxVal: maxInp.value });
            };
        }
        const stepInp = document.getElementById('prop-stepper-step');
        if (stepInp) {
            stepInp.oninput = function() {
                const step = Math.max(1, parseInt(stepInp.value) || 1);
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', stepVal: step });
            };
        }
        if (txtInp) {
            txtInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_STEPPER_PROPERTIES', btnText: txtInp.value });
            };
        }
        if (disY) {
            disY.onclick = function() {
                highlightActive(disY, true);
                highlightActive(disN, false);
                notifyIframe({ type: 'LF_UPDATE_ATOM_DISABLED', disabled: true });
            };
        }
        if (disN) {
            disN.onclick = function() {
                highlightActive(disY, false);
                highlightActive(disN, true);
                notifyIframe({ type: 'LF_UPDATE_ATOM_DISABLED', disabled: false });
            };
        }
    };

    // --- Selectbox Component ---
    const _renderSelectboxOptionRows = function(options, selectedIndices) {
        return options.map(function(optText, idx) {
            const isChecked = selectedIndices.indexOf(idx) !== -1;
            return '<div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">' +
                '<span style="font-size: 10px; color: #94a3b8; width: 40px; flex-shrink: 0;">Item ' + (idx + 1) + '</span>' +
                '<input type="text" class="selectbox-option-input" data-index="' + idx + '" value="' + (optText || '') + '" style="flex: 1; min-width: 0; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; outline: none; font-family: inherit;">' +
                '<input type="checkbox" class="selectbox-option-check" data-index="' + idx + '" ' + (isChecked ? 'checked' : '') + ' title="\uC120\uD0DD\uB41C \uD56D\uBAA9\uC73C\uB85C \uD65C\uC131\uD654" style="accent-color: var(--accent, #6e56cf); cursor: pointer; width: 15px; height: 15px; margin: 0; flex-shrink: 0;">' +
            '</div>';
        }).join('');
    };

    const syncSelectbox = function(comp) {
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
        if (defaultControls) defaultControls.style.display = 'block';
        if (dropdownControls) dropdownControls.style.display = isDropdown ? 'block' : 'none';

        const defaultTextInput = document.getElementById('prop-selectbox-default-text');
        if (defaultTextInput && document.activeElement !== defaultTextInput && comp.selectboxDefaultText !== undefined) {
            defaultTextInput.value = comp.selectboxDefaultText;
        }

        const options = comp.selectboxOptions || [];
        const selectedIndices = (comp.selectboxSelectedIndices && Array.isArray(comp.selectboxSelectedIndices)) ? comp.selectboxSelectedIndices : [];
        const countInput = document.getElementById('prop-selectbox-option-count');
        if (countInput) countInput.value = options.length;

        const inputsContainer = document.getElementById('selectbox-options-inputs-container');
        if (inputsContainer) {
            const activeEl = document.activeElement;
            const isTyping = activeEl && inputsContainer.contains(activeEl) && activeEl.classList.contains('selectbox-option-input');
            if (!isTyping) {
                inputsContainer.innerHTML = _renderSelectboxOptionRows(options, selectedIndices);
            } else {
                inputsContainer.querySelectorAll('.selectbox-option-check').forEach(function(cb) {
                    const idx = parseInt(cb.dataset.index);
                    const shouldBeChecked = selectedIndices.indexOf(idx) !== -1;
                    if (cb.checked !== shouldBeChecked) cb.checked = shouldBeChecked;
                });
            }
        }
        syncDisabled(comp);
    };

    const bindSelectboxEvents = function() {
        const dropY = document.getElementById('btn-selectbox-dropdown-y');
        const dropN = document.getElementById('btn-selectbox-dropdown-n');
        const defText = document.getElementById('prop-selectbox-default-text');
        const countInp = document.getElementById('prop-selectbox-option-count');
        const inputsContainer = document.getElementById('selectbox-options-inputs-container');

        if (dropY) {
            dropY.onclick = function() {
                highlightActive(dropY, true);
                highlightActive(dropN, false);
                const dc = document.getElementById('selectbox-default-controls');
                const dpc = document.getElementById('selectbox-dropdown-controls');
                if (dc) dc.style.display = 'block';
                if (dpc) dpc.style.display = 'block';
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', dropdownActive: true });
            };
        }
        if (dropN) {
            dropN.onclick = function() {
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
            defText.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', defaultText: defText.value });
            };
        }
        if (countInp) {
            countInp.oninput = function() {
                const count = Math.max(1, Math.min(10, parseInt(countInp.value) || 1));
                const currentInputs = inputsContainer ? Array.from(inputsContainer.querySelectorAll('.selectbox-option-input')) : [];
                const currentChecks = inputsContainer ? Array.from(inputsContainer.querySelectorAll('.selectbox-option-check')) : [];
                const currentValues = currentInputs.map(function(inp) { return inp.value; });
                const currentCheckedIndices = currentChecks.filter(function(cb) { return cb.checked; }).map(function(cb) { return parseInt(cb.dataset.index); });
                while (currentValues.length < count) {
                    currentValues.push('Option ' + (currentValues.length + 1));
                }
                if (currentValues.length > count) {
                    currentValues.length = count;
                }
                const filteredCheckedIndices = currentCheckedIndices.filter(function(idx) { return idx < count; });
                if (inputsContainer) {
                    inputsContainer.innerHTML = _renderSelectboxOptionRows(currentValues, filteredCheckedIndices);
                }
                notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', options: currentValues, selectedIndices: filteredCheckedIndices });
            };
        }
        if (inputsContainer) {
            inputsContainer.oninput = function(e) {
                if (e.target && e.target.classList.contains('selectbox-option-input')) {
                    const allInps = Array.from(inputsContainer.querySelectorAll('.selectbox-option-input'));
                    const vals = allInps.map(function(inp) { return inp.value; });
                    notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', options: vals });
                }
            };
            inputsContainer.onchange = function(e) {
                if (e.target && e.target.classList.contains('selectbox-option-check')) {
                    const allChecks = Array.from(inputsContainer.querySelectorAll('.selectbox-option-check:checked'));
                    const checkedIndices = allChecks.map(function(cb) { return parseInt(cb.dataset.index); });
                    notifyIframe({ type: 'LF_UPDATE_SELECTBOX_PROPERTIES', selectedIndices: checkedIndices });
                }
            };
        }
    };

    // --- FileUpload Component ---
    const syncFileupload = function(comp) {
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

    const bindFileuploadEvents = function() {
        const selY = document.getElementById('btn-fileupload-selected-y');
        const selN = document.getElementById('btn-fileupload-selected-n');
        const nameInp = document.getElementById('prop-fileupload-file-name');
        const phInp = document.getElementById('prop-fileupload-placeholder');
        const btnTextInp = document.getElementById('prop-fileupload-btn-text');

        if (selY) {
            selY.onclick = function() {
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
            selN.onclick = function() {
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
            nameInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileName: nameInp.value });
            };
        }
        if (phInp) {
            phInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', filePlaceholder: phInp.value });
            };
        }
        if (btnTextInp) {
            btnTextInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_FILEUPLOAD_PROPERTIES', fileButtonText: btnTextInp.value });
            };
        }
    };

    // --- Alert Component ---
    const syncAlert = function(comp) {
        if (!comp) return;

        const isShowDesc = comp.alertShowDesc !== undefined ? (comp.alertShowDesc === true || comp.alertShowDesc === 'true') : false;
        const btnDescY = document.getElementById('btn-alert-desc-y');
        const btnDescN = document.getElementById('btn-alert-desc-n');
        if (btnDescY) highlightActive(btnDescY, isShowDesc);
        if (btnDescN) highlightActive(btnDescN, !isShowDesc);

        const descInput = document.getElementById('prop-alert-desc');
        if (descInput && document.activeElement !== descInput && comp.alertDesc !== undefined) {
            descInput.value = comp.alertDesc;
        }

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

    const bindAlertEvents = function() {
        const btnDescY = document.getElementById('btn-alert-desc-y');
        const btnDescN = document.getElementById('btn-alert-desc-n');
        if (btnDescY) {
            btnDescY.onclick = function() {
                highlightActive(btnDescY, true);
                if (btnDescN) highlightActive(btnDescN, false);
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', showDesc: true, alertShowDesc: true });
            };
        }
        if (btnDescN) {
            btnDescN.onclick = function() {
                if (btnDescY) highlightActive(btnDescY, false);
                highlightActive(btnDescN, true);
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', showDesc: false, alertShowDesc: false });
            };
        }

        const descInp = document.getElementById('prop-alert-desc');
        if (descInp) {
            descInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', descText: descInp.value, alertDesc: descInp.value });
            };
        }

        const msgInp = document.getElementById('prop-alert-message');
        if (msgInp) {
            msgInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', messageText: msgInp.value, alertMessage: msgInp.value });
            };
        }

        for (let i = 1; i <= 3; i++) {
            const countBtn = document.getElementById('btn-alert-count-' + i);
            if (countBtn) {
                countBtn.onclick = function() {
                    for (let j = 1; j <= 3; j++) {
                        const b = document.getElementById('btn-alert-count-' + j);
                        if (b) highlightActive(b, i === j);
                    }
                    const c2 = document.getElementById('prop-alert-btn-2-container');
                    const c3 = document.getElementById('prop-alert-btn-3-container');
                    if (c2) c2.style.display = i >= 2 ? 'flex' : 'none';
                    if (c3) c3.style.display = i >= 3 ? 'flex' : 'none';
                    notifyIframe({ type: 'LF_UPDATE_ALERT_PROPERTIES', btnCount: i, alertBtnCount: i });
                };
            }
            const txt = document.getElementById('prop-alert-btn-' + i);
            if (txt) {
                txt.oninput = function() {
                    const payload = { type: 'LF_UPDATE_ALERT_PROPERTIES' };
                    payload['btnText' + i] = txt.value;
                    payload['alertBtnText' + i] = txt.value;
                    notifyIframe(payload);
                };
            }
            const sel = document.getElementById('prop-alert-btn-style-' + i);
            if (sel) {
                sel.onchange = function() {
                    const payload = { type: 'LF_UPDATE_ALERT_PROPERTIES' };
                    payload['btnStyle' + i] = sel.value;
                    payload['alertBtnStyle' + i] = sel.value;
                    notifyIframe(payload);
                };
            }
        }
    };

    // --- Button Component ---
    const syncButton = function(comp) {
        if (!comp) return;
        syncDisabled(comp);
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
            syncAtomColor('prop-button-bg-color', 'button-bg-wrapper', s.bg, s.isBgTransparent);
            syncAtomColor('prop-button-border-color', 'button-border-wrapper', s.border, s.isBorderTransparent);
            syncAtomColor('prop-button-text-color', 'button-text-wrapper', s.text, false);
        }
    };

    const bindButtonEvents = function() {
        const txtInp = document.getElementById('prop-button-text');
        const fontInp = document.getElementById('prop-button-font-size');
        const styleSel = document.getElementById('prop-button-style');
        const radiusSlider = document.getElementById('prop-button-border-radius');

        if (txtInp) {
            txtInp.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonText: txtInp.value });
            };
        }
        if (fontInp) {
            fontInp.oninput = function() {
                const sz = parseInt(fontInp.value);
                if (!isNaN(sz) && sz >= 8) {
                    notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonFontSize: sz });
                }
            };
        }
        if (styleSel) {
            styleSel.onchange = function() {
                const cDiv = document.getElementById('prop-button-custom-colors');
                if (cDiv) cDiv.style.display = (styleSel.value === 'custom') ? 'block' : 'none';
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonStyle: styleSel.value });
            };
        }
        if (radiusSlider) {
            radiusSlider.oninput = function() {
                const r = parseInt(radiusSlider.value) || 0;
                const rTxt = document.getElementById('txt-button-border-radius');
                if (rTxt) rTxt.innerText = r;
                if (typeof window._syncButtonCornerBtns === 'function') window._syncButtonCornerBtns(r);
                notifyIframe({ type: 'LF_UPDATE_BUTTON_PROPERTIES', buttonRadius: r });
            };
        }
        const btnFitText = document.getElementById('btn-button-fit-text');
        if (btnFitText) {
            btnFitText.onclick = function() {
                notifyIframe({ type: 'LF_FIT_BUTTON_TO_TEXT' });
            };
        }
    };

    // --- Toggle Component ---
    const syncToggle = function(comp) {
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

    const bindToggleEvents = function() {
        const btnOn = document.getElementById('btn-toggle-on');
        const btnOff = document.getElementById('btn-toggle-off');
        const colorPicker = document.getElementById('prop-toggle-color');

        if (btnOn) {
            btnOn.onclick = function() {
                highlightActive(btnOn, true);
                highlightActive(btnOff, false);
                notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: true });
            };
        }
        if (btnOff) {
            btnOff.onclick = function() {
                highlightActive(btnOn, false);
                highlightActive(btnOff, true);
                notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: false });
            };
        }
        if (colorPicker) {
            colorPicker.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', color: colorPicker.value });
            };
        }
    };

    // Global delegation safeguard for Toggle controls
    document.addEventListener('click', function(e) {
        const btnOn = e.target && e.target.closest ? e.target.closest('#btn-toggle-on') : null;
        if (btnOn) {
            const btnOff = document.getElementById('btn-toggle-off');
            highlightActive(btnOn, true);
            if (btnOff) highlightActive(btnOff, false);
            notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: true });
            return;
        }
        const btnOff = e.target && e.target.closest ? e.target.closest('#btn-toggle-off') : null;
        if (btnOff) {
            const btnOnEl = document.getElementById('btn-toggle-on');
            if (btnOnEl) highlightActive(btnOnEl, false);
            highlightActive(btnOff, true);
            notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', checked: false });
        }
    });

    document.addEventListener('input', function(e) {
        if (e.target && e.target.id === 'prop-toggle-color') {
            notifyIframe({ type: 'LF_UPDATE_TOGGLE_PROPERTIES', color: e.target.value });
        }
    });

    window.InspectorAtoms = Object.assign(window.InspectorAtoms || {}, {
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
        bindDisabledEvents: bindDisabledEvents,
        bindAllEvents: function() {
            const api = window.InspectorAtoms || {};
            const binderNames = [
                'bindDisabledEvents', 'bindStepperEvents', 'bindSelectboxEvents',
                'bindFileuploadEvents', 'bindAlertEvents', 'bindButtonEvents',
                'bindToggleEvents', 'bindCheckboxRadioEvents', 'bindTextboxTextareaEvents',
                'bindSearchBarEvents', 'bindDatePickerEvents', 'bindCursorEvents',
                'bindWebEditorEvents'
            ];
            binderNames.forEach(function(fnName) {
                if (typeof api[fnName] === 'function') api[fnName]();
            });
        }
    });
})();
