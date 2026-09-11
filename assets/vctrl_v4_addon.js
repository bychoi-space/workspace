/**
 * vctrl_v4_addon.js
 * Bridges V4 Table & Shape editing into the main viewer system.
 * Optimized for 'file://' protocol security by using postMessage instead of direct DOM access.
 */

(function() {
    console.log("%c [V4 ADDON LOADED] ", "background: #6366f1; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    const notifyIframe = (data) => window.notifyIframe(data);
    const highlightActive = window.highlightActive;

    // 1. Component Insertion (Handled by vctrl_component_inserter.js as SSOT)

    // Dependencies are now pre-injected via vctrl_v3.js loadScreen() for security compliance.



    function hexToRgba(hex, opacity) {
        return window.hexToRgba(hex, opacity / 100);
    }



    // Cell Style & Dimension Direct Actions
    const bindCellColorInput = (id, prop) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                const style = {};
                style[prop] = this.value;
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style });
            });
        }
    };

    bindCellColorInput('cell-bg-color', 'backgroundColor');
    bindCellColorInput('cell-text-color', 'color');

    // Cell Background Transparency Button
    const btnCellBgNone = document.getElementById('btn-cell-bg-none');
    if (btnCellBgNone) {
        btnCellBgNone.onclick = () => {
            const wrapper = document.getElementById('cell-bg-wrapper');
            if (wrapper) wrapper.classList.add('transparent-active');
            notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { backgroundColor: 'transparent' } });
        };
    }

    const cellBgColorEl = document.getElementById('cell-bg-color');
    if (cellBgColorEl) {
        cellBgColorEl.addEventListener('input', () => {
            const wrapper = document.getElementById('cell-bg-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
        });
    }

    // Cell Width Slider & Number Input
    const cellColWidthEl = document.getElementById('cell-col-width');
    const cellColWidthNumEl = document.getElementById('cell-col-width-num');

    const updateCellWidth = (val) => {
        const numVal = parseInt(val);
        if (isNaN(numVal) || numVal < 10) return;
        notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', width: numVal });
        if (cellColWidthEl && cellColWidthEl.value != numVal) cellColWidthEl.value = numVal;
        if (cellColWidthNumEl && cellColWidthNumEl.value != numVal) cellColWidthNumEl.value = numVal;
        const txt = document.getElementById('txt-cell-col-width');
        if (txt) txt.innerText = numVal;
    };

    if (cellColWidthEl) {
        cellColWidthEl.addEventListener('input', function() {
            updateCellWidth(this.value);
        });
    }
    if (cellColWidthNumEl) {
        cellColWidthNumEl.addEventListener('input', function() {
            updateCellWidth(this.value);
        });
    }

    // Cell Height Slider & Number Input
    const cellRowHeightEl = document.getElementById('cell-row-height');
    const cellRowHeightNumEl = document.getElementById('cell-row-height-num');

    const updateCellHeight = (val) => {
        const numVal = parseInt(val);
        if (isNaN(numVal) || numVal < 10) return;
        notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', height: numVal });
        if (cellRowHeightEl && cellRowHeightEl.value != numVal) cellRowHeightEl.value = numVal;
        if (cellRowHeightNumEl && cellRowHeightNumEl.value != numVal) cellRowHeightNumEl.value = numVal;
        const txt = document.getElementById('txt-cell-row-height');
        if (txt) txt.innerText = numVal;
    };

    if (cellRowHeightEl) {
        cellRowHeightEl.addEventListener('input', function() {
            updateCellHeight(this.value);
        });
    }
    if (cellRowHeightNumEl) {
        cellRowHeightNumEl.addEventListener('input', function() {
            updateCellHeight(this.value);
        });
    }

    // Cell Text Alignment Buttons
    const updateCellAlignButtonsUI = (align) => {
        const btnLeft = document.getElementById('btn-cell-align-left');
        const btnCenter = document.getElementById('btn-cell-align-center');
        const btnRight = document.getElementById('btn-cell-align-right');
        if (!btnLeft || !btnCenter || !btnRight) return;

        btnLeft.style.background = align === 'left' ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)';
        btnLeft.style.borderColor = align === 'left' ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.1)';
        btnCenter.style.background = align === 'center' ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)';
        btnCenter.style.borderColor = align === 'center' ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.1)';
        btnRight.style.background = align === 'right' ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)';
        btnRight.style.borderColor = align === 'right' ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.1)';
    };

    window._updateCellAlignButtonsUI = updateCellAlignButtonsUI;

    const bindCellAlignButton = (id, align) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function() {
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { textAlign: align } });
                updateCellAlignButtonsUI(align);
            });
        }
    };

    bindCellAlignButton('btn-cell-align-left', 'left');
    bindCellAlignButton('btn-cell-align-center', 'center');
    bindCellAlignButton('btn-cell-align-right', 'right');

    // Cell Borders Event Bindings
    const getTableBorderColor = () => {
        const el = document.getElementById('table-border-color');
        return (el && el.value) ? el.value : '#475569';
    };

    const bindCellBorderButton = (id, borderType) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function() {
                const color = getTableBorderColor();
                notifyIframe({ type: 'LF_UPDATE_CELL_BORDER', borderType: borderType, color: color });
            });
        }
    };

    bindCellBorderButton('btn-cell-border-all', 'all');
    bindCellBorderButton('btn-cell-border-none', 'none');
    bindCellBorderButton('btn-cell-border-top', 'top');
    bindCellBorderButton('btn-cell-border-bottom', 'bottom');
    bindCellBorderButton('btn-cell-border-left', 'left');
    bindCellBorderButton('btn-cell-border-right', 'right');

    // Shape Style inputs synced dynamically via styleUpdateConfig config loop

    // Event delegation for shape-bg-color, shape-bg-opacity, and table cell controls to ensure handlers work even when inspector DOM is dynamically rendered or moved
    document.addEventListener('input', function(e) {
        if (!e.target) return;
        const id = e.target.id;
        if (id === 'cell-col-width' || id === 'cell-col-width-num') {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 10) {
                notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', width: val });
                const colEl = document.getElementById('cell-col-width');
                const colNumEl = document.getElementById('cell-col-width-num');
                const txt = document.getElementById('txt-cell-col-width');
                if (colEl && colEl.value != val) colEl.value = val;
                if (colNumEl && colNumEl.value != val) colNumEl.value = val;
                if (txt) txt.innerText = val;
            }
        } else if (id === 'cell-row-height' || id === 'cell-row-height-num') {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 10) {
                notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', height: val });
                const rowEl = document.getElementById('cell-row-height');
                const rowNumEl = document.getElementById('cell-row-height-num');
                const txt = document.getElementById('txt-cell-row-height');
                if (rowEl && rowEl.value != val) rowEl.value = val;
                if (rowNumEl && rowNumEl.value != val) rowNumEl.value = val;
                if (txt) txt.innerText = val;
            }
        }

        if (e.target.id === 'shape-bg-color') {
            const colorHex = e.target.value;
            const opacitySlider = document.getElementById('shape-bg-opacity');
            let opacityVal = opacitySlider ? parseInt(opacitySlider.value) : 100;
            
            // 만약 불투명도가 0인 상태(투명)에서 색상을 다시 조작하면 불투명도를 100으로 자동 복구
            if (opacityVal === 0 && opacitySlider) {
                opacityVal = 100;
                opacitySlider.value = 100;
                const txt = document.getElementById('txt-shape-bg-opacity');
                if (txt) txt.innerText = 100;
            }
            
            const rgbaColor = hexToRgba(colorHex, opacityVal);
            
            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                selector: '.v4-shape',
                style: { background: rgbaColor, backgroundColor: rgbaColor }
            });
            
            const wrapper = document.getElementById('shape-bg-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
        } else if (e.target.id === 'shape-bg-opacity') {
            const opacityVal = e.target.value;
            const txt = document.getElementById('txt-shape-bg-opacity');
            if (txt) txt.innerText = opacityVal;
            
            const colorPicker = document.getElementById('shape-bg-color');
            const colorHex = (colorPicker && colorPicker.value) ? colorPicker.value : '#ffffff';
            const rgbaColor = hexToRgba(colorHex, opacityVal);
            
            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                selector: '.v4-shape',
                style: { background: rgbaColor, backgroundColor: rgbaColor }
            });
            
            const wrapper = document.getElementById('shape-bg-wrapper');
            if (wrapper) {
                if (parseInt(opacityVal) === 0) {
                    wrapper.classList.add('transparent-active');
                } else {
                    wrapper.classList.remove('transparent-active');
                }
            }
        }
    });

    const _syncPatternVisualBtns = (selectedType) => {
        document.querySelectorAll('.v4-pattern-type-btn').forEach(btn => {
            const bType = btn.dataset.type;
            if (bType === selectedType) {
                btn.style.setProperty('border', '1.6px solid #00e5ff', 'important');
                btn.style.setProperty('box-shadow', '0 0 8px rgba(0, 229, 255, 0.4)', 'important');
            } else {
                btn.style.setProperty('border', '1.6px solid rgba(255, 255, 255, 0.15)', 'important');
                btn.style.setProperty('box-shadow', 'none', 'important');
            }
        });
    };
    window._syncPatternVisualBtns = _syncPatternVisualBtns;

    // Use event delegation to handle shape visual pattern & arrow direction button clicks reliably
    document.addEventListener('click', function(e) {
        const patternBtn = e.target.closest('.v4-pattern-type-btn');
        if (patternBtn) {
            const pType = patternBtn.dataset.type;
            console.log("[V4 Addon] Pattern Type button clicked with value:", pType);
            _syncPatternVisualBtns(pType);
            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                selector: '.v4-shape',
                style: { patternType: pType }
            });
            return;
        }

        const arrowBtn = e.target.closest('.v4-arrow-dir-btn');
        if (arrowBtn) {
            const dir = arrowBtn.dataset.dir;
            console.log("[V4 Addon] Arrow/Triangle Direction button clicked with value:", dir);
            if (typeof window._syncArrowDirBtns === 'function') {
                window._syncArrowDirBtns(dir);
            }
            notifyIframe({
                type: 'LF_UPDATE_ARROW_DIRECTION',
                direction: dir
            });
            if (typeof window.markAsDirty === 'function') window.markAsDirty();
        }
    });
    // Additional shape text and border properties handled by declarative bindings loop


    // Shape Properties Delegates to InspectorShapes
    window._syncCornerBtns = (val) => window.InspectorShapes && window.InspectorShapes.syncCornerBtns(val);
    window._applyCornerRadius = (val) => window.InspectorShapes && window.InspectorShapes.applyCornerRadius(val);
    window._syncAlignBtns = (val) => window.InspectorShapes && window.InspectorShapes.syncAlignBtns(val);
    window._syncVAlignBtns = (val) => window.InspectorShapes && window.InspectorShapes.syncVAlignBtns(val);
    window._applyTextAlign = (val) => window.InspectorShapes && window.InspectorShapes.applyTextAlign(val);
    window._applyVerticalAlign = (val) => window.InspectorShapes && window.InspectorShapes.applyVerticalAlign(val);
    window._applyShapePadding = (t, b, l, r) => window.InspectorShapes && window.InspectorShapes.applyShapePadding(t, b, l, r);
    window._syncShapePaddingInputs = (padObj) => window.InspectorShapes && window.InspectorShapes.syncShapePaddingInputs(padObj);

    if (window.InspectorShapes && typeof window.InspectorShapes.bindEvents === 'function') {
        window.InspectorShapes.bindEvents();
    }

    // Global Event Delegation for Button Controls
    document.addEventListener('click', (e) => {
        // Button Corner Presets
        const btnBtnCorner = e.target.closest('.btn-btn-corner');
        if (btnBtnCorner) {
            const r = parseInt(btnBtnCorner.getAttribute('data-radius')) || 0;
            const radiusSlider = document.getElementById('prop-button-border-radius');
            const radiusTxt = document.getElementById('txt-button-border-radius');
            if (radiusSlider) {
                radiusSlider.value = r;
                if (radiusTxt) radiusTxt.innerText = r;
                radiusSlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (typeof window._syncButtonCornerBtns === 'function') {
                window._syncButtonCornerBtns(r);
            }
            return;
        }
    });

    window._syncButtonCornerBtns = function(val) {
        const r = parseInt(val) || 0;
        document.querySelectorAll('.btn-btn-corner').forEach(btn => {
            const br = parseInt(btn.getAttribute('data-radius')) || 0;
            if (br === r) {
                btn.classList.add('primary');
                btn.style.borderColor = '#00e5ff';
                btn.style.color = '#00e5ff';
                btn.style.background = 'rgba(0, 229, 255, 0.15)';
            } else {
                btn.classList.remove('primary');
                btn.style.borderColor = '';
                btn.style.color = '';
                btn.style.background = '';
            }
        });
    };

    // Global input & change delegation for Shape and Button controls
    const _handleShapePaddingInputEvent = (e) => {
        const id = e.target.id;
        if (id === 'shape-border-radius') {
            _syncCornerBtns(e.target.value);
            return;
        }
        if (id === 'prop-button-border-radius') {
            if (typeof window._syncButtonCornerBtns === 'function') {
                window._syncButtonCornerBtns(e.target.value);
            }
            return;
        }
        if (['shape-pad-top', 'shape-pad-bottom', 'shape-pad-left', 'shape-pad-right'].includes(id)) {
            const inPadTop = document.getElementById('shape-pad-top');
            const inPadBottom = document.getElementById('shape-pad-bottom');
            const inPadLeft = document.getElementById('shape-pad-left');
            const inPadRight = document.getElementById('shape-pad-right');
            const t = inPadTop ? inPadTop.value : 5;
            const b = inPadBottom ? inPadBottom.value : 5;
            const l = inPadLeft ? inPadLeft.value : 10;
            const r = inPadRight ? inPadRight.value : 10;
            _applyShapePadding(t, b, l, r);
        }
    };
    document.addEventListener('input', _handleShapePaddingInputEvent);
    document.addEventListener('change', _handleShapePaddingInputEvent);
    window._bindShapePaddingEvents = () => {};

    // Text and Icon style properties are mapped dynamically via loop



    // Reset transparency when color is picked (Global)
    const colorIds = [
        { id: 'shape-bg-color', wrapper: 'shape-bg-wrapper' },
        { id: 'shape-border-color', wrapper: 'shape-border-wrapper' },
        { id: 'table-border-color', wrapper: 'table-border-wrapper' },
        { id: 'icon-border-color', wrapper: 'icon-border-wrapper' },
        { id: 'prop-button-bg-color', wrapper: 'button-bg-wrapper' },
        { id: 'prop-button-border-color', wrapper: 'button-border-wrapper' }
    ];

    colorIds.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.addEventListener('input', () => {
                const wrapper = document.getElementById(item.wrapper);
                if (wrapper) wrapper.classList.remove('transparent-active');
            });
        }
    });

    // 3. Table Actions
    const bindAction = (btnId, action) => {
        const el = document.getElementById(btnId);
        if (el) {
            el.onclick = () => {
                const fontSize = document.getElementById('table-font-size')?.value;
                notifyIframe({ type: 'LF_TABLE_ACTION', action, fontSize });
            };
        }
    };

    const tableActions = [
        { id: 'btn-add-row', action: 'ADD_ROW' },
        { id: 'btn-del-row', action: 'DEL_ROW' },
        { id: 'btn-add-col', action: 'ADD_COL' },
        { id: 'btn-del-col', action: 'DEL_COL' },
        { id: 'btn-layout-h', action: 'LAYOUT_H' },
        { id: 'btn-layout-v', action: 'LAYOUT_V' },
        { id: 'btn-merge-cells', action: 'MERGE_CELLS' },
        { id: 'btn-split-cells', action: 'SPLIT_CELLS' }
    ];
    tableActions.forEach(conf => bindAction(conf.id, conf.action));

    window.addEventListener('message', e => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'LF_CELL_SELECTED') {
            const mergeBtn = document.getElementById('btn-merge-cells');
            const splitBtn = document.getElementById('btn-split-cells');

            if (data.cellData) {
                const cd = data.cellData;
                
                // Sync Cell Background
                const bgPicker = document.getElementById('cell-bg-color');
                const bgWrapper = document.getElementById('cell-bg-wrapper');
                const isBgTransparent = cd.backgroundColor === 'transparent' || cd.backgroundColor === 'rgba(0, 0, 0, 0)' || cd.backgroundColor === '';
                if (bgPicker) {
                    if (isBgTransparent) {
                        bgPicker.value = '#ffffff'; // Default visible color when active again
                    } else {
                        bgPicker.value = window.rgbToHex(cd.backgroundColor) || cd.backgroundColor;
                    }
                }
                if (bgWrapper) bgWrapper.classList.toggle('transparent-active', isBgTransparent);

                // Sync Cell Text Color
                const textPicker = document.getElementById('cell-text-color');
                if (textPicker && cd.color) {
                    textPicker.value = window.rgbToHex(cd.color) || cd.color;
                }

                // Sync Width Slider & Number Input
                const widthInput = document.getElementById('cell-col-width');
                const widthNumInput = document.getElementById('cell-col-width-num');
                if (cd.width) {
                    if (widthInput) widthInput.value = cd.width;
                    if (widthNumInput) widthNumInput.value = cd.width;
                    const txt = document.getElementById('txt-cell-col-width');
                    if (txt) txt.innerText = cd.width;
                }

                // Sync Height Slider & Number Input
                const heightInput = document.getElementById('cell-row-height');
                const heightNumInput = document.getElementById('cell-row-height-num');
                if (cd.height) {
                    if (heightInput) heightInput.value = cd.height;
                    if (heightNumInput) heightNumInput.value = cd.height;
                    const txt = document.getElementById('txt-cell-row-height');
                    if (txt) txt.innerText = cd.height;
                }

                // Sync Text Align Buttons
                if (cd.textAlign && window._updateCellAlignButtonsUI) {
                    window._updateCellAlignButtonsUI(cd.textAlign);
                }

                // Enable/disable merge and split buttons based on count
                if (mergeBtn) {
                    mergeBtn.disabled = (cd.count < 2);
                    mergeBtn.style.opacity = (cd.count < 2) ? '0.5' : '1';
                    mergeBtn.style.cursor = (cd.count < 2) ? 'not-allowed' : 'pointer';
                }
                if (splitBtn) {
                    splitBtn.disabled = (cd.count < 1);
                    splitBtn.style.opacity = (cd.count < 1) ? '0.5' : '1';
                    splitBtn.style.cursor = (cd.count < 1) ? 'not-allowed' : 'pointer';
                }
            } else {
                if (mergeBtn) {
                    mergeBtn.disabled = true;
                    mergeBtn.style.opacity = '0.5';
                    mergeBtn.style.cursor = 'not-allowed';
                }
                if (splitBtn) {
                    splitBtn.disabled = true;
                    splitBtn.style.opacity = '0.5';
                    splitBtn.style.cursor = 'not-allowed';
                }
            }
        }
        else if (data.type === 'LF_DESELECT' || data.type === 'LF_COMP_DESELECTED') {
            // Deselection UI sync is handled by vctrl_inspector.js
        }
        else if (data.type === 'LF_DIRTY') {
            if (typeof window.markAsDirty === 'function') {
                window.markAsDirty();
            }
        }
        else if (data.type === 'LF_TRIGGER_SAVE') {
            if (typeof window.handleGlobalSave === 'function') {
                window.handleGlobalSave();
            }
        }
        else if (data.type === 'LF_INSERT_IMAGE_COMP') {
            const base64 = data.base64;
            const img = new Image();
            img.onload = function() {
                let w = img.naturalWidth || 200;
                let h = img.naturalHeight || 200;
                const maxBound = 300;
                if (w > maxBound || h > maxBound) {
                    const ratio = Math.min(maxBound / w, maxBound / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                if (typeof window.insertImageComponent === 'function') {
                    window.insertImageComponent(base64, w + 'px', h + 'px');
                }
            };
            img.src = base64;
        }
        else if (data.type === 'LF_SAVE_CLIPBOARD') {
            console.log("[Clipboard Debug] Parent saved clipboard data from iframe to window.top SSOT:", data.clipboard);
            try {
                (window.top || window).__lf_global_clipboard__ = data.clipboard;
            } catch(err) {
                window.__lf_global_clipboard__ = data.clipboard;
            }
        }
        else if (data.type === 'LF_REQUEST_CLIPBOARD') {
            let storedData = [];
            try {
                storedData = (window.top || window).__lf_global_clipboard__ || [];
            } catch(err) {
                storedData = window.__lf_global_clipboard__ || [];
            }
            console.log("[Clipboard Debug] Parent received request for clipboard. Stored data count:", storedData.length);
            notifyIframe({
                type: 'LF_RESPONSE_CLIPBOARD',
                clipboard: storedData
            });
        }
    });

    // Checkbox / Radio Button Option Actions
    // Atom event handlers are now centralized and unified in assets/inspector/inspector_atoms.js
    const initCheckboxRadioEvents = () => window.InspectorAtoms?.bindCheckboxRadioEvents?.();
    const initTextboxTextareaEvents = () => window.InspectorAtoms?.bindTextboxTextareaEvents?.();
    const initSearchBarEvents = () => window.InspectorAtoms?.bindSearchBarEvents?.();
    const initStepperEvents = () => window.InspectorAtoms?.bindStepperEvents?.();
    const initSelectboxEvents = () => window.InspectorAtoms?.bindSelectboxEvents?.();
    const initFileuploadEvents = () => window.InspectorAtoms?.bindFileuploadEvents?.();
    const initAlertEvents = () => window.InspectorAtoms?.bindAlertEvents?.();
    const initButtonEvents = () => window.InspectorAtoms?.bindButtonEvents?.();
    const initDatePickerEvents = () => window.InspectorAtoms?.bindDatePickerEvents?.();
    const initAccordionEvents = () => window.InspectorAccordion?.bindAccordionEvents?.();
    const initAdminSettingsEvents = () => window._syncAdminSettingsProps?.();
    const initToggleEvents = () => window.InspectorAtoms?.bindToggleEvents?.();

    const initGridEvents = () => {
        if (window.InspectorGrid && typeof window.InspectorGrid.bindEvents === 'function') {
            window.InspectorGrid.bindEvents();
            return;
        }
    };
    initGridEvents();

    // Export initialization triggers to window for compatibility
    window.initCheckboxRadioEvents = initCheckboxRadioEvents;
    window.initTextboxTextareaEvents = initTextboxTextareaEvents;
    window.initSearchbarEvents = initSearchBarEvents;
    window.initStepperEvents = initStepperEvents;
    window.initSelectboxEvents = initSelectboxEvents;
    window.initFileuploadEvents = initFileuploadEvents;
    window.initAlertEvents = initAlertEvents;
    window.initButtonEvents = initButtonEvents;
    window.initDatePickerEvents = initDatePickerEvents;
    window.initAccordionEvents = initAccordionEvents;
    window.initGridEvents = initGridEvents;
    window.initAdminSettingsEvents = initAdminSettingsEvents;
    window.initToggleEvents = initToggleEvents;

    window.initAllInspectorEvents = function() {
        try {
            if (typeof window.rebindInspectorDOM === 'function') window.rebindInspectorDOM();
            if (typeof initCheckboxRadioEvents === 'function') initCheckboxRadioEvents();
            if (typeof initTextboxTextareaEvents === 'function') initTextboxTextareaEvents();
            if (typeof initSearchBarEvents === 'function') initSearchBarEvents();
            if (typeof initStepperEvents === 'function') initStepperEvents();
            if (typeof initSelectboxEvents === 'function') initSelectboxEvents();
            if (typeof initFileuploadEvents === 'function') initFileuploadEvents();
            if (typeof initAlertEvents === 'function') initAlertEvents();
            if (typeof initButtonEvents === 'function') initButtonEvents();
            if (typeof initDatePickerEvents === 'function') initDatePickerEvents();
            if (typeof initAccordionEvents === 'function') initAccordionEvents();
            if (typeof initGridEvents === 'function') initGridEvents();
            if (typeof initAdminSettingsEvents === 'function') initAdminSettingsEvents();
            if (typeof initToggleEvents === 'function') initToggleEvents();
            if (typeof window.initV4AddonEventListeners === 'function') window.initV4AddonEventListeners();
        } catch (err) {
            console.warn("[VCTRL INSPECTOR] Error during initAllInspectorEvents:", err);
        }
    };

    // Parent-side paste event listener for handling pasted image files when parent has focus
    window.addEventListener('paste', function(e) {
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.closest('.ql-editor'));
        if (isInput) return; // Allow normal input paste

        const items = (e.clipboardData || window.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64 = evt.target.result;
                    const img = new Image();
                    img.onload = function() {
                        let w = img.naturalWidth || 200;
                        let h = img.naturalHeight || 200;
                        const maxBound = 300;
                        if (w > maxBound || h > maxBound) {
                            const ratio = Math.min(maxBound / w, maxBound / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                        }

                        // Optimize Base64 payload by scaling bitmap to actual component bounds
                        let optimizedBase64 = base64;
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = w;
                            canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            optimizedBase64 = canvas.toDataURL('image/png');
                        } catch (err) {
                            console.warn("[V4 Addon] Canvas optimization fallback to original:", err);
                        }

                        window.insertImageComponent(optimizedBase64, w + 'px', h + 'px');
                    };
                    img.src = base64;
                };
                reader.readAsDataURL(file);
                e.preventDefault();
                break;
            }
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target) return;
        const btn = e.target.closest('#btn-cell-align-left, #btn-cell-align-center, #btn-cell-align-right');
        if (btn) {
            let align = 'left';
            if (btn.id === 'btn-cell-align-center') align = 'center';
            if (btn.id === 'btn-cell-align-right') align = 'right';
            notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { textAlign: align } });
            if (typeof window._updateCellAlignButtonsUI === 'function') {
                window._updateCellAlignButtonsUI(align);
            }
        }
    });

    window.initV4AddonEventListeners = function() {
        console.log("[V4 ADDON] Initializing addon event listeners on injected DOM...");


        // 2. Cell Bg & Text Color
        const cellBgColor = document.getElementById('cell-bg-color');
        if (cellBgColor) {
            cellBgColor.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { backgroundColor: this.value } });
            };
        }
        const cellTextColor = document.getElementById('cell-text-color');
        if (cellTextColor) {
            cellTextColor.oninput = function() {
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { color: this.value } });
            };
        }
        const btnCellBgNone = document.getElementById('btn-cell-bg-none');
        if (btnCellBgNone) {
            btnCellBgNone.onclick = () => {
                const wrapper = document.getElementById('cell-bg-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { backgroundColor: 'transparent' } });
            };
        }
        const cellBgColorEl = document.getElementById('cell-bg-color');
        if (cellBgColorEl) {
            const origInput = cellBgColorEl.oninput;
            cellBgColorEl.oninput = function() {
                const wrapper = document.getElementById('cell-bg-wrapper');
                if (wrapper) wrapper.classList.remove('transparent-active');
                if (origInput) origInput.call(this);
            };
        }

        // 3. Shape Opacity & Background Color (Handled by consolidated SSOT handler)
        const btnShapeBgNone = document.getElementById('btn-shape-bg-none');
        if (btnShapeBgNone) {
            btnShapeBgNone.onclick = () => {
                const opacitySlider = document.getElementById('shape-bg-opacity');
                if (opacitySlider) {
                    opacitySlider.value = 0;
                    opacitySlider.dispatchEvent(new Event('input'));
                }
            };
        }


        // 5. Shape Text Alignments
        const btnLeft = document.getElementById('btn-shape-align-left');
        if (btnLeft) {
            btnLeft.onclick = () => _applyTextAlign('left');
        }
        const btnCenter = document.getElementById('btn-shape-align-center');
        if (btnCenter) {
            btnCenter.onclick = () => _applyTextAlign('center');
        }
        const btnRight = document.getElementById('btn-shape-align-right');
        if (btnRight) {
            btnRight.onclick = () => _applyTextAlign('right');
        }

        const btnVTop = document.getElementById('btn-shape-valign-top');
        if (btnVTop) {
            btnVTop.onclick = () => _applyVerticalAlign('top');
        }
        const btnVMiddle = document.getElementById('btn-shape-valign-middle');
        if (btnVMiddle) {
            btnVMiddle.onclick = () => _applyVerticalAlign('middle');
        }
        const btnVBottom = document.getElementById('btn-shape-valign-bottom');
        if (btnVBottom) {
            btnVBottom.onclick = () => _applyVerticalAlign('bottom');
        }

        if (typeof window._bindShapePaddingEvents === 'function') {
            window._bindShapePaddingEvents();
        }

        // 6. Table Actions
        const tableActions = [
            { id: 'btn-add-row', action: 'ADD_ROW' },
            { id: 'btn-del-row', action: 'DEL_ROW' },
            { id: 'btn-add-col', action: 'ADD_COL' },
            { id: 'btn-del-col', action: 'DEL_COL' },
            { id: 'btn-layout-h', action: 'LAYOUT_H' },
            { id: 'btn-layout-v', action: 'LAYOUT_V' },
            { id: 'btn-merge-cells', action: 'MERGE_CELLS' },
            { id: 'btn-split-cells', action: 'SPLIT_CELLS' }
        ];
        tableActions.forEach(conf => {
            const btn = document.getElementById(conf.id);
            if (btn) {
                btn.onclick = () => {
                    const fontSize = document.getElementById('table-font-size')?.value;
                    notifyIframe({ type: 'LF_TABLE_ACTION', action: conf.action, fontSize });
                };
            }
        });
    };

})();
