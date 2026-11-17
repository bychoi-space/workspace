/**
 * assets/inspector/inspector_atoms_inputs.js
 * Domain Inspector Module: Form Input Atoms (Checkbox/Radio, Textbox/Textarea, SearchBar, DatePicker)
 * Split from inspector_atoms.js for Single Responsibility & modularity.
 */
(function() {
    console.log("[Inspector Atoms Inputs] Domain module loaded.");

    const highlightActive = window.highlightActive;
    const shared = window.InspectorAtomsShared || {};
    const notifyIframe = shared.notifyIframe || window.notifyIframe;
    const syncAtomColor = shared.syncAtomColor || function() {};
    const syncDisabled = shared.syncDisabled || function() {};

    // --- Checkbox & Radio Component Sync ---
    const syncCheckboxRadio = function(comp) {
        if (!comp) return;
        const activeY = document.getElementById('btn-atom-active-y');
        const activeN = document.getElementById('btn-atom-active-n');
        const textY = document.getElementById('btn-atom-text-y');
        const textN = document.getElementById('btn-atom-text-n');

        if (activeY && activeN) {
            highlightActive(activeY, comp.checked === true);
            highlightActive(activeN, comp.checked === false);
        }
        if (textY && textN) {
            highlightActive(textY, comp.textEnabled === true);
            highlightActive(textN, comp.textEnabled === false);
        }

        const s = comp.currentStyles || {};
        syncAtomColor('atom-bg-color', 'atom-bg-wrapper', s.bg, s.isBgTransparent);
        syncAtomColor('atom-border-color', 'atom-border-wrapper', s.border, s.isBorderTransparent);

        const textInp = document.getElementById('prop-atom-text-content');
        if (textInp && comp.checkboxText !== undefined && document.activeElement !== textInp) {
            textInp.value = comp.checkboxText;
        }

        const wIconInp = document.getElementById('prop-width-icon');
        const hIconInp = document.getElementById('prop-height-icon');
        if (wIconInp && document.activeElement !== wIconInp) {
            wIconInp.value = Math.round(comp.boxW !== undefined ? comp.boxW : 20);
        }
        if (hIconInp && document.activeElement !== hIconInp) {
            hIconInp.value = Math.round(comp.boxH !== undefined ? comp.boxH : 20);
        }
        syncDisabled(comp);
    };

    // --- Textbox & Textarea Component Sync ---
    const syncTextboxTextarea = function(comp) {
        if (!comp) return;
        const activeY = document.getElementById('btn-input-counter-y');
        const activeN = document.getElementById('btn-input-counter-n');

        if (activeY && activeN) {
            highlightActive(activeY, comp.showCounter === true);
            highlightActive(activeN, comp.showCounter === false);
        }

        const phInput = document.getElementById('prop-input-placeholder');
        if (phInput && document.activeElement !== phInput && comp.placeholderText !== undefined) {
            phInput.value = comp.placeholderText;
        }

        const mlInput = document.getElementById('prop-input-maxlength');
        const mlTxt = document.getElementById('txt-input-maxlength');
        if (mlInput && document.activeElement !== mlInput && comp.maxLength !== undefined) {
            mlInput.value = comp.maxLength;
            if (mlTxt) mlTxt.innerText = comp.maxLength;
        }

        const s = comp.currentStyles || {};
        syncAtomColor('input-bg-color', 'input-bg-wrapper', s.bg, s.isBgTransparent);
        syncAtomColor('input-border-color', 'input-border-wrapper', s.border, s.isBorderTransparent);

        const fsInput = document.getElementById('prop-input-fontsize');
        if (fsInput && document.activeElement !== fsInput && s.fontSize !== undefined) {
            fsInput.value = s.fontSize;
        }
        const ffInput = document.getElementById('prop-input-fontfamily');
        if (ffInput && s.fontFamily !== undefined) {
            const normalizedFont = s.fontFamily.replace(/['"]/g, '');
            let matched = false;
            for (let i = 0; i < ffInput.options.length; i++) {
                const optVal = ffInput.options[i].value.replace(/['"]/g, '');
                if (optVal === normalizedFont) {
                    ffInput.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                ffInput.value = 'inherit';
            }
        }
        syncDisabled(comp);
    };

    // --- SearchBar Component Sync ---
    const syncSearchBar = function(comp) {
        if (!comp) return;
        const phInput = document.getElementById('prop-searchbar-placeholder');
        if (phInput && document.activeElement !== phInput && comp.searchbarPlaceholder !== undefined) {
            phInput.value = comp.searchbarPlaceholder;
        }

        const s = comp.currentStyles || {};
        const fsInput = document.getElementById('prop-searchbar-fontsize');
        if (fsInput && document.activeElement !== fsInput && s.fontSize !== undefined) {
            fsInput.value = s.fontSize;
        }
        syncDisabled(comp);
    };

    // --- DatePicker Component Sync ---
    const syncDatePicker = function(comp) {
        if (!comp) return;
        const btnModeSimple = document.getElementById('btn-dp-mode-simple');
        const btnModeDetailed = document.getElementById('btn-dp-mode-detailed');
        const mode = comp.dpMode || 'simple';
        highlightActive(btnModeSimple, mode === 'simple');
        highlightActive(btnModeDetailed, mode === 'detailed');

        const timeWrapper = document.getElementById('dp-time-inputs-wrapper');
        const presetsToggleWrapper = document.getElementById('dp-presets-toggle-wrapper');
        const showEndToggleWrapper = document.getElementById('dp-show-end-toggle-wrapper');
        const defaultPresetWrapper = document.getElementById('dp-default-preset-wrapper');

        if (timeWrapper) timeWrapper.style.display = mode === 'detailed' ? 'block' : 'none';
        if (presetsToggleWrapper) presetsToggleWrapper.style.display = mode === 'detailed' ? 'none' : 'block';
        if (showEndToggleWrapper) showEndToggleWrapper.style.display = 'block';
        if (defaultPresetWrapper) defaultPresetWrapper.style.display = mode === 'detailed' ? 'none' : 'block';

        const presetsY = document.getElementById('btn-dp-presets-y');
        const presetsN = document.getElementById('btn-dp-presets-n');
        const showPresets = comp.dpShowPresets !== false;
        highlightActive(presetsY, showPresets);
        highlightActive(presetsN, !showPresets);

        const showEndY = document.getElementById('btn-dp-show-end-y');
        const showEndN = document.getElementById('btn-dp-show-end-n');
        const showEndDate = comp.dpShowEndDate !== false;
        highlightActive(showEndY, showEndDate);
        highlightActive(showEndN, !showEndDate);

        const presetKeys = ['none', '1D', '1W', '1M', '6M', 'all'];
        const currentPreset = comp.dpDefaultPreset || 'none';
        presetKeys.forEach(function(key) {
            const btn = document.getElementById('btn-dp-default-' + key);
            highlightActive(btn, key === currentPreset);
        });

        const startInput = document.getElementById('prop-dp-start-date');
        const endInput = document.getElementById('prop-dp-end-date');
        if (startInput && comp.dpStartDate !== undefined && document.activeElement !== startInput) {
            startInput.value = comp.dpStartDate || '';
        }
        if (endInput && comp.dpEndDate !== undefined && document.activeElement !== endInput) {
            endInput.value = comp.dpEndDate || '';
        }

        const startTimeInput = document.getElementById('prop-dp-start-time');
        const endTimeInput = document.getElementById('prop-dp-end-time');
        if (startTimeInput && comp.dpStartTime !== undefined && document.activeElement !== startTimeInput) {
            startTimeInput.value = comp.dpStartTime || '';
        }
        if (endTimeInput && comp.dpEndTime !== undefined && document.activeElement !== endTimeInput) {
            endTimeInput.value = comp.dpEndTime || '';
        }
        syncDisabled(comp);
    };

    // --- Checkbox & Radio Events ---
    const initCheckboxRadioEvents = function() {
        const activeY = document.getElementById('btn-atom-active-y');
        const activeN = document.getElementById('btn-atom-active-n');
        const textY = document.getElementById('btn-atom-text-y');
        const textN = document.getElementById('btn-atom-text-n');

        if (activeY) {
            activeY.onclick = function() {
                highlightActive(activeY, true);
                highlightActive(activeN, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_ATOM_STATE', checked: true });
            };
        }
        if (activeN) {
            activeN.onclick = function() {
                highlightActive(activeN, true);
                highlightActive(activeY, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_ATOM_STATE', checked: false });
            };
        }
        if (textY) {
            textY.onclick = function() {
                highlightActive(textY, true);
                highlightActive(textN, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_ATOM_TEXT_ENABLED', enabled: true });
            };
        }
        if (textN) {
            textN.onclick = function() {
                highlightActive(textN, true);
                highlightActive(textY, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_ATOM_TEXT_ENABLED', enabled: false });
            };
        }

        const labelTextInp = document.getElementById('prop-atom-text-content');
        if (labelTextInp) {
            labelTextInp.oninput = function() {
                notifyIframe({ type: 'BYCHOI_UPDATE_ATOM_LABEL_TEXT', text: this.value });
            };
        }

        const widthIconInp = document.getElementById('prop-width-icon');
        const heightIconInp = document.getElementById('prop-height-icon');

        if (widthIconInp) {
            widthIconInp.oninput = function() {
                const val = parseInt(this.value);
                if (!isNaN(val) && val > 0) {
                    notifyIframe({
                        type: 'BYCHOI_UPDATE_ATOM_ICON_SIZE',
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
                        type: 'BYCHOI_UPDATE_ATOM_ICON_SIZE',
                        width: widthIconInp ? (parseInt(widthIconInp.value) || val) : val,
                        height: val
                    });
                }
            };
        }
    };
    initCheckboxRadioEvents();

    // --- Textbox & Textarea Events ---
    const initTextboxTextareaEvents = function() {
        const phInput = document.getElementById('prop-input-placeholder');
        if (phInput) {
            phInput.oninput = function() {
                notifyIframe({ type: 'BYCHOI_UPDATE_TEXTBOX_PROPERTIES', placeholderText: phInput.value });
            };
        }

        const mlInput = document.getElementById('prop-input-maxlength');
        if (mlInput) {
            mlInput.oninput = function() {
                let val = parseInt(mlInput.value);
                if (isNaN(val) || val < 1) val = 1;
                const txt = document.getElementById('txt-input-maxlength');
                if (txt) txt.innerText = val;
                notifyIframe({ type: 'BYCHOI_UPDATE_TEXTBOX_PROPERTIES', maxLength: val });
            };
        }

        const counterY = document.getElementById('btn-input-counter-y');
        const counterN = document.getElementById('btn-input-counter-n');

        if (counterY) {
            counterY.onclick = function() {
                highlightActive(counterY, true);
                highlightActive(counterN, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_TEXTBOX_PROPERTIES', showCounter: true });
            };
        }
        if (counterN) {
            counterN.onclick = function() {
                highlightActive(counterN, true);
                highlightActive(counterY, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_TEXTBOX_PROPERTIES', showCounter: false });
            };
        }

        const fsInput = document.getElementById('prop-input-fontsize');
        if (fsInput) {
            fsInput.oninput = function() {
                let val = parseInt(fsInput.value);
                if (isNaN(val) || val < 1) val = 12;
                notifyIframe({ type: 'BYCHOI_UPDATE_TEXTBOX_PROPERTIES', fontSize: val });
            };
        }

        const ffInput = document.getElementById('prop-input-fontfamily');
        if (ffInput) {
            ffInput.onchange = function() {
                notifyIframe({ type: 'BYCHOI_UPDATE_TEXTBOX_PROPERTIES', fontFamily: ffInput.value });
            };
        }
    };
    initTextboxTextareaEvents();

    // --- SearchBar Events ---
    const initSearchBarEvents = function() {
        const phInput = document.getElementById('prop-searchbar-placeholder');
        if (phInput) {
            phInput.oninput = function() {
                notifyIframe({ type: 'BYCHOI_UPDATE_SEARCHBAR_PROPERTIES', placeholderText: phInput.value });
            };
        }

        const fsInput = document.getElementById('prop-searchbar-fontsize');
        if (fsInput) {
            fsInput.oninput = function() {
                notifyIframe({ type: 'BYCHOI_UPDATE_SEARCHBAR_PROPERTIES', fontSize: parseInt(fsInput.value) });
            };
        }
    };
    initSearchBarEvents();

    // --- DatePicker Events (Decomposed into Toggles/Mode & Date/Time Inputs) ---
    const _bindDatePickerModeAndToggles = function() {
        const presetsY = document.getElementById('btn-dp-presets-y');
        const presetsN = document.getElementById('btn-dp-presets-n');
        if (presetsY) {
            presetsY.onclick = function() {
                highlightActive(presetsY, true);
                highlightActive(presetsN, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_DATEPICKER', showPresets: true });
            };
        }
        if (presetsN) {
            presetsN.onclick = function() {
                highlightActive(presetsN, true);
                highlightActive(presetsY, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_DATEPICKER', showPresets: false });
            };
        }

        const showEndY = document.getElementById('btn-dp-show-end-y');
        const showEndN = document.getElementById('btn-dp-show-end-n');
        if (showEndY) {
            showEndY.onclick = function() {
                highlightActive(showEndY, true);
                highlightActive(showEndN, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_DATEPICKER', showEndDate: true });
            };
        }
        if (showEndN) {
            showEndN.onclick = function() {
                highlightActive(showEndN, true);
                highlightActive(showEndY, false);
                notifyIframe({ type: 'BYCHOI_UPDATE_DATEPICKER', showEndDate: false });
            };
        }

        const presetKeys = ['none', '1D', '1W', '1M', '6M', 'all'];
        presetKeys.forEach(function(key) {
            const btn = document.getElementById('btn-dp-default-' + key);
            if (btn) {
                btn.onclick = function() {
                    presetKeys.forEach(function(k) {
                        const b = document.getElementById('btn-dp-default-' + k);
                        highlightActive(b, k === key);
                    });
                    notifyIframe({ type: 'BYCHOI_UPDATE_DATEPICKER', defaultPreset: key });
                };
            }
        });

        const modeSimpleBtn = document.getElementById('btn-dp-mode-simple');
        const modeDetailedBtn = document.getElementById('btn-dp-mode-detailed');
        const timeInputsWrapper = document.getElementById('dp-time-inputs-wrapper');
        const presetsToggleWrapper = document.getElementById('dp-presets-toggle-wrapper');
        const showEndToggleWrapper = document.getElementById('dp-show-end-toggle-wrapper');
        const defaultPresetWrapper = document.getElementById('dp-default-preset-wrapper');

        if (modeSimpleBtn) {
            modeSimpleBtn.onclick = function() {
                highlightActive(modeSimpleBtn, true);
                highlightActive(modeDetailedBtn, false);
                if (timeInputsWrapper) timeInputsWrapper.style.display = 'none';
                if (presetsToggleWrapper) presetsToggleWrapper.style.display = 'block';
                if (showEndToggleWrapper) showEndToggleWrapper.style.display = 'block';
                if (defaultPresetWrapper) defaultPresetWrapper.style.display = 'block';
                notifyIframe({ type: 'BYCHOI_UPDATE_DATEPICKER', mode: 'simple' });
            };
        }
        if (modeDetailedBtn) {
            modeDetailedBtn.onclick = function() {
                highlightActive(modeDetailedBtn, true);
                highlightActive(modeSimpleBtn, false);
                if (timeInputsWrapper) timeInputsWrapper.style.display = 'block';
                if (presetsToggleWrapper) presetsToggleWrapper.style.display = 'none';
                if (showEndToggleWrapper) showEndToggleWrapper.style.display = 'block';
                if (defaultPresetWrapper) defaultPresetWrapper.style.display = 'none';
                notifyIframe({ type: 'BYCHOI_UPDATE_DATEPICKER', mode: 'detailed' });
            };
        }
    };

    const _bindDatePickerDateTimeInputs = function() {
        const formatSlashDate = function(value) {
            let val = value.replace(/[^0-9]/g, '');
            let formatted = '';
            if (val.length > 0) {
                formatted += val.substring(0, 4);
                if (val.length > 4) {
                    formatted += '/' + val.substring(4, 6);
                    if (val.length > 6) formatted += '/' + val.substring(6, 8);
                }
            }
            return formatted;
        };

        const formatColonTime = function(value) {
            let val = value.replace(/[^0-9]/g, '');
            let formatted = '';
            if (val.length > 0) {
                formatted += val.substring(0, 2);
                if (val.length > 2) {
                    formatted += ':' + val.substring(2, 4);
                    if (val.length > 4) formatted += ':' + val.substring(4, 6);
                }
            }
            return formatted;
        };

        const bindFormattedInput = function(id, propName, formatter) {
            const inp = document.getElementById(id);
            if (inp && !inp._dpInputBound) {
                inp._dpInputBound = true;
                inp.addEventListener('input', function(e) {
                    if (e.inputType !== 'deleteContentBackward') {
                        this.value = formatter(this.value);
                    }
                    const payload = { type: 'BYCHOI_UPDATE_DATEPICKER' };
                    payload[propName] = this.value;
                    notifyIframe(payload);
                });
            }
        };

        bindFormattedInput('prop-dp-start-date', 'startDate', formatSlashDate);
        bindFormattedInput('prop-dp-end-date', 'endDate', formatSlashDate);
        bindFormattedInput('prop-dp-start-time', 'startTime', formatColonTime);
        bindFormattedInput('prop-dp-end-time', 'endTime', formatColonTime);
    };

    const initDatePickerEvents = function() {
        _bindDatePickerModeAndToggles();
        _bindDatePickerDateTimeInputs();
    };
    initDatePickerEvents();

    window.syncAccordionSubItemInputs = function(texts) {
        if (window.InspectorAccordion && typeof window.InspectorAccordion.syncSubItemInputs === 'function') {
            window.InspectorAccordion.syncSubItemInputs(texts);
        }
    };

    window.syncAccordionHierarchyInputs = function(hierarchy) {
        if (window.InspectorAccordion && typeof window.InspectorAccordion.syncHierarchyInputs === 'function') {
            window.InspectorAccordion.syncHierarchyInputs(hierarchy);
        }
    };

    window.InspectorAtoms = Object.assign(window.InspectorAtoms || {}, {
        syncCheckboxRadio: syncCheckboxRadio,
        syncTextboxTextarea: syncTextboxTextarea,
        syncSearchBar: syncSearchBar,
        syncDatePicker: syncDatePicker,
        bindCheckboxRadioEvents: initCheckboxRadioEvents,
        bindTextboxTextareaEvents: initTextboxTextareaEvents,
        bindSearchBarEvents: initSearchBarEvents,
        bindDatePickerEvents: initDatePickerEvents
    });

    window.initCheckboxRadioEvents = initCheckboxRadioEvents;
    window.initTextboxTextareaEvents = initTextboxTextareaEvents;
    window.initSearchbarEvents = initSearchBarEvents;
    window.initDatePickerEvents = initDatePickerEvents;
})();
