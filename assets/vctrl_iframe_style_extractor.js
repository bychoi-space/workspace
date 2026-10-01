// --- Iframe Component Style Extractor Module ---
if (!window.v4IframeStyleExtractorScript) {
    window.v4IframeStyleExtractorScript = `
(function() {
    const _getVal = (el, prop) => {
        if (!el) return "";
        return el.style[prop] || window.getComputedStyle(el)[prop] || "";
    };

    const _getAlphaPercent = (rgb) => {
        if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return 0;
        if (rgb.startsWith("rgba")) {
            const parts = rgb.match(/rgba?\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*([\\d.]+)\\s*\\)/);
            if (parts && parts[1] !== undefined) {
                return Math.round(parseFloat(parts[1]) * 100);
            }
        }
        return 100;
    };

    window._getCompStyles = (c) => {
        const isGroup = c.classList.contains('lf-group');
        const shape = isGroup ? null : c.querySelector('.v4-shape');
        const table = isGroup ? null : c.querySelector('table');
        const icon = isGroup ? null : (c.querySelector('.lf-icon') || c.querySelector('img'));
        const textCell = isGroup ? null : c.querySelector('.v4-editable-cell');
        const isPin = isGroup ? false : (c.classList.contains('text-marker') || c.classList.contains('pin-marker') || c.classList.contains('v4-text-box') || c.classList.contains('v4-text-shape'));
        const isImage = isGroup ? false : (shape ? shape.classList.contains('v4-shape-image') : (c.id === 'v4-atom-image' || c.classList.contains('v4-shape-image')));
        const isDescriptionPin = isGroup ? false : c.classList.contains('pin-marker');
        
        // Checkbox / Radio Atom Detection
        const isCheckbox = isGroup ? false : (!!c.querySelector('.v4-checkbox') || c.classList.contains('v4-checkbox') || !!c.querySelector('.v4-checkbox-container') || c.classList.contains('v4-checkbox-container'));
        const isRadio = isGroup ? false : (!!c.querySelector('.v4-radio') || c.classList.contains('v4-radio') || !!c.querySelector('.v4-radio-container') || c.classList.contains('v4-radio-container'));
        const container = isGroup ? null : (c.querySelector('.v4-checkbox-container, .v4-radio-container') || (c.classList.contains('v4-checkbox-container') || c.classList.contains('v4-radio-container') ? c : null));
        const checked = container ? container.getAttribute('data-checked') !== 'false' : true;
        const textEnabled = container ? container.getAttribute('data-text-enabled') !== 'false' : false;
        
        // Textbox / Textarea Atom Detection
        const isTextbox = isGroup ? false : (!!c.querySelector('.v4-textbox-container') || c.classList.contains('v4-textbox-container'));
        const isTextarea = isGroup ? false : (!!c.querySelector('.v4-textarea-container') || c.classList.contains('v4-textarea-container'));
        const inputContainer = isGroup ? null : (c.querySelector('.v4-textbox-container, .v4-textarea-container') || (isTextbox || isTextarea ? c : null));
        const placeholderText = inputContainer ? (inputContainer.getAttribute('data-placeholder') || inputContainer.querySelector('.v4-textbox-placeholder, .v4-textarea-placeholder')?.textContent || "Placeholder") : "";
        const maxLength = inputContainer ? (parseInt(inputContainer.getAttribute('data-maxlength')) || 100) : 100;
        const showCounter = inputContainer ? (inputContainer.getAttribute('data-show-counter') !== 'false') : false;

        // Search Bar Atom Detection
        const isSearchBar = isGroup ? false : (!!c.querySelector('.v4-searchbar-container') || c.classList.contains('v4-searchbar-container'));
        const searchbarContainer = isGroup ? null : (c.querySelector('.v4-searchbar-container') || (isSearchBar ? c : null));
        const searchbarPlaceholder = searchbarContainer ? (searchbarContainer.querySelector('.v4-searchbar-text')?.getAttribute('data-placeholder') || "\uC6D0\uC2A4\uD53C\uC5B4 \uD1B5\uD569\uAC80\uC0C9") : "\uC6D0\uC2A4\uD53C\uC5B4 \uD1B5\uD569\uAC80\uC0C9";

        // Stepper Atom Detection
        const isStepper = isGroup ? false : (!!c.querySelector('.v4-stepper-container') || c.classList.contains('v4-stepper-container'));
        const stepperContainer = isGroup ? null : (c.querySelector('.v4-stepper-container') || (isStepper ? c : null));
        const minVal = stepperContainer ? parseInt(stepperContainer.getAttribute('data-min')) || 1 : 1;
        const maxVal = stepperContainer ? parseInt(stepperContainer.getAttribute('data-max')) || 99 : 99;
        const stepperVal = stepperContainer ? parseInt(stepperContainer.getAttribute('data-val')) || minVal : minVal;
        const stepperStep = stepperContainer ? parseInt(stepperContainer.getAttribute('data-step')) || 1 : 1;
        const stepperBtnEnabled = stepperContainer ? stepperContainer.getAttribute('data-btn-enabled') !== 'false' : true;
        const stepperBtnText = stepperContainer ? (stepperContainer.getAttribute('data-btn-text') || "\uC801\uC6A9") : "\uC801\uC6A9";
        const stepperDisabled = stepperContainer ? stepperContainer.getAttribute('data-disabled') === 'true' : false;
        
        // Selectbox Atom Detection
        const isSelectbox = isGroup ? false : (!!c.querySelector('.v4-selectbox-container') || c.classList.contains('v4-selectbox-container'));
        const selectboxContainer = isGroup ? null : (c.querySelector('.v4-selectbox-container') || (isSelectbox ? c : null));
        const selectboxDefaultText = selectboxContainer ? (selectboxContainer.getAttribute('data-default-text') || "\uC120\uD0DD\uD558\uC138\uC694") : "\uC120\uD0DD\uD558\uC138\uC694";
        const selectboxDropdownActive = selectboxContainer ? selectboxContainer.getAttribute('data-dropdown-active') === 'true' : false;
        const selectboxOptionsRaw = selectboxContainer ? (selectboxContainer.getAttribute('data-options') || "Option 1,Option 2,Option 3") : "Option 1,Option 2,Option 3";
        const selectboxOptions = selectboxOptionsRaw.split(',').map(s => s.trim()).filter(Boolean);

        // File Upload Atom Detection
        const isFileUpload = isGroup ? false : (!!c.querySelector('.v4-fileupload-container') || c.classList.contains('v4-fileupload-container'));
        const fileuploadContainer = isGroup ? null : (c.querySelector('.v4-fileupload-container') || (isFileUpload ? c : null));
        const fileSelected = fileuploadContainer ? fileuploadContainer.getAttribute('data-selected') === 'true' : false;
        const fileName = fileuploadContainer ? (fileuploadContainer.getAttribute('data-file-name') || "") : "";
        const fileButtonText = fileuploadContainer ? (fileuploadContainer.getAttribute('data-button-text') || "\uD30C\uC77C\uCCA8\uBD80") : "\uD30C\uC77C\uCCA8\uBD80";
        const filePlaceholder = fileuploadContainer ? (fileuploadContainer.getAttribute('data-placeholder') || "\uC120\uD0DD\uB41C \uD30C\uC77C \uC5C6\uC74C") : "\uC120\uD0DD\uB41C \uD30C\uC77C \uC5C6\uC74C";

        // Alert Atom Detection
        const isAlert = isGroup ? false : (!!c.querySelector('.v4-alert-container') || c.classList.contains('v4-alert-container'));
        const alertContainer = isGroup ? null : (c.querySelector('.v4-alert-container') || (isAlert ? c : null));
        const alertMessage = alertContainer ? (alertContainer.getAttribute('data-message') || "\uC5BC\uB7FF \uBA54\uC2DC\uC9C0 \uC785\uB825 \uC608\uC2DC") : "\uC5BC\uB7FF \uBA54\uC2DC\uC9C0 \uC785\uB825 \uC608\uC2DC";
        const alertBtnCount = alertContainer ? parseInt(alertContainer.getAttribute('data-btn-count')) || 1 : 1;
        const alertBtnText1 = alertContainer ? (alertContainer.getAttribute('data-btn-text-1') || "\uD655\uC778") : "\uD655\uC778";
        const alertBtnText2 = alertContainer ? (alertContainer.getAttribute('data-btn-text-2') || "\uCDE8\uC18C") : "\uCDE8\uC18C";
        const alertBtnText3 = alertContainer ? (alertContainer.getAttribute('data-btn-text-3') || "\uB2EB\uAE30") : "\uB2EB\uAE30";
        const alertBtnStyle1 = alertContainer ? (alertContainer.getAttribute('data-btn-style-1') || "normal") : "normal";
        const alertBtnStyle2 = alertContainer ? (alertContainer.getAttribute('data-btn-style-2') || "normal") : "normal";
        const alertBtnStyle3 = alertContainer ? (alertContainer.getAttribute('data-btn-style-3') || "normal") : "normal";
        const alertShowDesc = alertContainer ? alertContainer.getAttribute('data-show-desc') === 'true' : false;
        const alertDesc = alertContainer ? (alertContainer.getAttribute('data-desc') || "\uC5B4\uB5A4\uC5B4\uB5A4 \uACBD\uC6B0\uC5D0 \uC5BC\uB7FF\uC774 \uD45C\uC2DC\uB428") : "\uC5B4\uB5A4\uC5B4\uB5A4 \uACBD\uC6B0\uC5D0 \uC5BC\uB7FF\uC774 \uD45C\uC2DC\uB428";

        // Button Atom Detection
        const isButton = isGroup ? false : (!!c.querySelector('.v4-btn-container') || c.classList.contains('v4-btn-container'));
        const btnContainer = isGroup ? null : (c.querySelector('.v4-btn-container') || (isButton ? c : null));
        const buttonText = btnContainer ? (btnContainer.getAttribute('data-text') !== null ? btnContainer.getAttribute('data-text') : (btnContainer.querySelector('.v4-custom-btn')?.innerText ?? "\uBC84\uD2BC")) : "\uBC84\uD2BC";
        const buttonStyle = btnContainer ? (btnContainer.getAttribute('data-btn-style') || "normal") : "normal";
        const buttonRadius = btnContainer ? (btnContainer.getAttribute('data-btn-radius') || "6") : "6";
        const buttonFontSize = btnContainer ? (parseInt(btnContainer.getAttribute('data-font-size')) || (btnContainer.querySelector('.v4-custom-btn') ? parseInt(window.getComputedStyle(btnContainer.querySelector('.v4-custom-btn')).fontSize) : 12) || 12) : 12;

        // Popup Window Atom Detection
        const isPopup = isGroup ? false : (
            !!c.querySelector('.v4-popup-container') || 
            c.classList.contains('v4-popup-container') ||
            c.id === 'v4-atom-popup' ||
            (c.getAttribute && c.getAttribute('data-comp-id') === 'v4-atom-popup')
        );
        const popupContainer = isGroup ? null : (c.querySelector('.v4-popup-container') || (isPopup ? c : null));
        const popupTitle = popupContainer ? (popupContainer.getAttribute('data-title') || popupContainer.querySelector('.v4-popup-title')?.innerText || "Popup Title") : "Popup Title";
        const popupShowClose = popupContainer ? (popupContainer.getAttribute('data-show-close') !== 'false') : true;
        const popupHeaderBg = popupContainer ? (popupContainer.getAttribute('data-header-bg') || (popupContainer.querySelector('.v4-popup-header') ? (popupContainer.querySelector('.v4-popup-header').style.backgroundColor || window.getComputedStyle(popupContainer.querySelector('.v4-popup-header')).backgroundColor) : '#f1f5f9')) : '#f1f5f9';
        const popupHeaderColor = popupContainer ? (popupContainer.getAttribute('data-header-color') || (popupContainer.querySelector('.v4-popup-title') ? (popupContainer.querySelector('.v4-popup-title').style.color || window.getComputedStyle(popupContainer.querySelector('.v4-popup-title')).color) : '#0f172a')) : '#0f172a';
        const popupBodyBg = popupContainer ? (popupContainer.getAttribute('data-body-bg') || popupContainer.style.backgroundColor || window.getComputedStyle(popupContainer).backgroundColor || '#ffffff') : '#ffffff';
        const popupBorderColor = popupContainer ? (popupContainer.getAttribute('data-border-color') || popupContainer.style.borderColor || window.getComputedStyle(popupContainer).borderColor || '#cccccc') : '#cccccc';
        const popupRadius = popupContainer ? (parseInt(popupContainer.getAttribute('data-border-radius')) || parseInt(popupContainer.style.borderRadius) || parseInt(window.getComputedStyle(popupContainer).borderRadius) || 8) : 8;

        // Date Picker Atom Detection
        const isDatePicker = isGroup ? false : (!!c.querySelector('.v4-datepicker-container') || c.classList.contains('v4-datepicker-container'));
        const dpContainer = isGroup ? null : (c.querySelector('.v4-datepicker-container') || (isDatePicker ? c : null));
        const dpShowPresets = dpContainer ? dpContainer.getAttribute('data-show-presets') !== 'false' : true;
        const dpShowEndDate = dpContainer ? dpContainer.getAttribute('data-show-end-date') !== 'false' : true;
        const dpDefaultPreset = dpContainer ? (dpContainer.getAttribute('data-default-preset') || 'none') : 'none';
        const dpStartDate = dpContainer ? (dpContainer.getAttribute('data-start-date') || '') : '';
        const dpEndDate = dpContainer ? (dpContainer.getAttribute('data-end-date') || '') : '';
        const dpMode = dpContainer ? (dpContainer.getAttribute('data-mode') || 'simple') : 'simple';
        const dpStartTime = dpContainer ? (dpContainer.getAttribute('data-start-time') || '') : '';
        const dpEndTime = dpContainer ? (dpContainer.getAttribute('data-end-time') || '') : '';

        // Accordion Atom Detection
        const isAccordion = isGroup ? false : (!!c.querySelector('.v4-accordion-container') || c.classList.contains('v4-accordion-container'));
        const accordionContainer = isGroup ? null : (c.querySelector('.v4-accordion-container') || (isAccordion ? c : null));
        const accordionHeaderText = accordionContainer ? (accordionContainer.querySelector('.v4-accordion-title-text')?.innerText || "Accordion Header") : "Accordion Header";
        const accordionSubCount = accordionContainer ? (parseInt(accordionContainer.getAttribute('data-sub-count')) || 0) : 0;
        const accordionSubTexts = accordionContainer ? Array.from(accordionContainer.querySelectorAll('.v4-accordion-item')).map(item => item.innerText) : [];
        const accordionExpanded = accordionContainer ? accordionContainer.getAttribute('data-expanded') === 'true' : false;
        const accordionItemHeight = accordionContainer ? parseInt(accordionContainer.getAttribute('data-item-height')) || (accordionContainer.querySelector('.v4-accordion-header') ? parseInt(accordionContainer.querySelector('.v4-accordion-header').style.height) || 36 : 36) : 36;
        const accordionDepthType = accordionContainer ? (accordionContainer.getAttribute('data-depth-type') || '1depth') : '1depth';
        const accordionHierarchy = accordionContainer ? (accordionContainer.getAttribute('data-hierarchy') || '') : '';

        // Tab UI Atom Detection
        const isTab = isGroup ? false : (!!c.querySelector('.v4-tab-container') || c.classList.contains('v4-tab-container'));
        const tabContainer = isGroup ? null : (c.querySelector('.v4-tab-container') || (isTab ? c : null));
        const tabCount = tabContainer ? (parseInt(tabContainer.getAttribute('data-tab-count')) || (tabContainer.querySelectorAll('.v4-tab-item').length || 3)) : 3;
        const tabActiveIndex = tabContainer ? (parseInt(tabContainer.getAttribute('data-active-index')) || 0) : 0;
        const tabAccentColor = tabContainer ? (tabContainer.getAttribute('data-accent-color') || '#2563eb') : '#2563eb';
        let tabItemsList = [];
        if (tabContainer) {
            const rawTabs = tabContainer.getAttribute('data-tabs');
            if (rawTabs) {
                try {
                    tabItemsList = JSON.parse(rawTabs);
                } catch(e) {}
            }
            if (!tabItemsList || tabItemsList.length === 0) {
                const domItems = Array.from(tabContainer.querySelectorAll('.v4-tab-item'));
                tabItemsList = domItems.map((it, idx) => ({
                    name: it.querySelector('.v4-tab-text')?.innerText || ('Tab ' + (idx + 1)),
                    active: it.classList.contains('active') || idx === tabActiveIndex
                }));
            }
        }

        // Grid UI Atom Detection
        const isGrid = isGroup ? false : (!!c.querySelector('.v4-grid-container') || c.classList.contains('v4-grid-container'));
        const gridContainer = isGroup ? null : (c.querySelector('.v4-grid-container') || (isGrid ? c : null));

        // Mouse Cursor Atom Detection
        const isCursor = isGroup ? false : (!!c.querySelector('.v4-cursor-container') || c.classList.contains('v4-cursor-container'));
        const cursorContainer = isGroup ? null : (c.querySelector('.v4-cursor-container') || (isCursor ? c : null));
        const cursorType = cursorContainer ? (cursorContainer.getAttribute('data-cursor-type') || 'default') : 'default';
        const cursorText = cursorContainer ? (cursorContainer.getAttribute('data-cursor-text') || cursorContainer.querySelector('.v4-cursor-text')?.innerText || 'Click Event') : 'Click Event';
        const showCursorText = cursorContainer ? (cursorContainer.getAttribute('data-show-text') !== 'false') : true;
        const cursorBadgeStyle = cursorContainer ? (cursorContainer.getAttribute('data-badge-style') || 'dark') : 'dark';
        const gridHeaders = gridContainer ? Array.from(gridContainer.querySelectorAll('.v4-grid-header-row .v4-grid-cell')).slice(1).map(cell => cell.innerText.replace(' ⇅', '')) : [];
        const gridRowCount = gridContainer ? (parseInt(gridContainer.getAttribute('data-row-count')) || 0) : 0;
        const gridShowPagination = gridContainer ? gridContainer.getAttribute('data-pagination') !== 'false' : true;
        const gridRowHeight = gridContainer ? (parseInt(gridContainer.getAttribute('data-row-height')) || 50) : 50;
        const gridZebra = gridContainer ? (gridContainer.getAttribute('data-zebra') === 'true') : false;
        
        let gridColumns = [];
        if (gridContainer) {
            const rawCols = gridContainer.getAttribute('data-columns');
            if (rawCols) {
                try {
                    gridColumns = JSON.parse(rawCols);
                } catch(e) {
                    console.error("Error parsing data-columns", e);
                }
            }
            if (Array.isArray(gridColumns) && gridColumns.length > 0) {
                gridColumns.forEach(col => {
                    if (!col.align) {
                        col.align = (col.type === 'number' || col.type === 'currency') ? 'right' : 
                                    (col.type === 'checkbox' || col.type === 'status' || col.type === 'action') ? 'center' : 'left';
                    }
                });
            } else {
                var tableCols = Array.from(gridContainer.querySelectorAll('colgroup col'));
                var tableHeaders = Array.from(gridContainer.querySelectorAll('thead th'));
                if (tableHeaders.length > 0) {
                    gridColumns = tableHeaders.map(function(cell, index) {
                        var name = cell.innerText.replace(' ⇅', '').trim();
                        var colEl = tableCols[index];
                        var width = colEl ? (colEl.style.width || colEl.getAttribute('width') || '120px') : '120px';
                        var type = cell.getAttribute('data-type') || 'text';
                        if (!cell.getAttribute('data-type')) {
                            if (cell.classList.contains('v4-grid-check-col') || cell.querySelector('input[type="checkbox"]')) {
                                type = 'checkbox';
                            } else if (name === '\uBC88\uD638') {
                                type = 'number';
                            } else if (name === '\uBC29\uC1A1\uC0C1\uD0DC' || name === '\uC804\uC2DC\uC0C1\uD0DC' || name === '\uC0C1\uD0DC') {
                                type = 'status';
                            } else if (name === '\uB4F1\uB85D/\uC218\uC815\uC790' || name === '\uB4F1\uB85D\uC790' || name === '\uC218\uC815\uC790') {
                                type = 'author';
                            } else if (name.indexOf('\uC77C\uC2DC') >= 0 || name.indexOf('\uC77C\uC790') >= 0) {
                                type = 'datetime';
                            } else if (name.indexOf('\uAE08\uC561') >= 0 || name.indexOf('\uAC00\uACA9') >= 0) {
                                type = 'currency';
                            } else if (name === '\uAD00\uB9AC') {
                                type = 'action';
                            }
                        }
                        var align = cell.getAttribute('data-align') || cell.style.textAlign || ((type === 'number' || type === 'currency') ? 'right' : ((type === 'checkbox' || type === 'status' || type === 'action') ? 'center' : 'left'));
                        return { name: name, type: type, width: width, align: align };
                    });
                } else {
                    const headerCells = Array.from(gridContainer.querySelectorAll('.v4-grid-header-row .v4-grid-cell'));
                    const gridTemplateCols = (gridContainer.querySelector('.v4-grid-header-row') && gridContainer.querySelector('.v4-grid-header-row').style.gridTemplateColumns || '').split(/\s+/).filter(Boolean);
                    gridColumns = headerCells.map((cell, index) => {
                        const name = cell.innerText.replace(' ⇅', '').trim();
                        const width = gridTemplateCols[index] || '120px';
                        let type = 'text';
                        if (cell.classList.contains('v4-grid-check-col') || cell.querySelector('input[type="checkbox"]')) {
                            type = 'checkbox';
                        } else if (name === '\uBC88\uD638') {
                            type = 'number';
                        } else if (name === '\uBC29\uC1A1\uC0C1\uD0DC') {
                            type = 'status';
                        } else if (name === '\uB4F1\uB85D/\uC218\uC815\uC790' || name === '\uB4F1\uB85D\uC790' || name === '\uC218\uC815\uC790') {
                            type = 'author';
                        } else if (name.indexOf('\uC77C\uC2DC') >= 0 || name.indexOf('\uC77C\uC790') >= 0) {
                            type = 'datetime';
                        }
                        return { name: name, type: type, width: width, align: (type === 'checkbox' || type === 'status') ? 'center' : (type === 'number' ? 'right' : 'left') };
                    });
                }
            }
        }

        // Admin Settings Atom Detection
        const isAdminSettings = isGroup ? false : (!!c.querySelector('.v4-admin-settings-container') || c.classList.contains('v4-admin-settings-container'));
        const adminSettingsContainer = isGroup ? null : (c.querySelector('.v4-admin-settings-container') || (isAdminSettings ? c : null));
        const adminRowCount = adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row-count')) || 3 : 3;
        
        const adminShowGroupHeader = adminSettingsContainer ? adminSettingsContainer.getAttribute('data-show-group-header') === 'true' : false;
        const adminGroupHeaderTitle = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-group-header-title') || '\uADF8\uB8F9\uBA85') : '\uADF8\uB8F9\uBA85';
        const adminGroupHeaderBg = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-group-header-bg') || '#73829c') : '#73829c';
        const adminGroupHeaderColor = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-group-header-color') || '#ffffff') : '#ffffff';
        const firstLabel = adminSettingsContainer ? adminSettingsContainer.querySelector('.v4-admin-label-cell') : null;
        const adminLabelWidth = firstLabel ? (parseInt(firstLabel.style.width) || parseInt(window.getComputedStyle(firstLabel).width) || 140) : 140;

        const adminRowData = {};
        for (let i = 1; i <= 20; i++) {
            adminRowData['adminRow' + i + 'Label'] = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-row' + i + '-label') || '') : '';
            adminRowData['adminRow' + i + 'Cols'] = adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row' + i + '-cols')) || 1 : 1;
            adminRowData['adminRow' + i + 'Ratio'] = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-row' + i + '-ratio') || '1:1') : '1:1';
            adminRowData['adminRow' + i + 'Type'] = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-row' + i + '-type') || 'textbox') : 'textbox';
            adminRowData['adminRow' + i + 'Height'] = adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row' + i + '-height')) || (adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row-height')) || 44 : 44) : 44;
            adminRowData['adminRow' + i + 'Required'] = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-row' + i + '-required') || 'false') : 'false';
        }

        // Toggle Button Detection
        const isToggle = isGroup ? false : (!!c.querySelector('.v4-toggle-container') || c.classList.contains('v4-toggle-container'));
        const toggleContainer = isGroup ? null : (c.querySelector('.v4-toggle-container') || (isToggle ? c : null));
        const toggleChecked = toggleContainer ? (toggleContainer.getAttribute('data-checked') === 'true') : false;
        const toggleColor = toggleContainer ? (toggleContainer.getAttribute('data-color') || '#3b82f6') : '#3b82f6';

        const boxEl = isGroup ? null : c.querySelector('.v4-checkbox, .v4-radio');
        const buttonEl = isGroup ? null : c.querySelector('.v4-custom-btn');
        
        const getShapeColor = (prop) => {
            if (!shape) return "";
            if (shape.classList.contains('v4-shape-diamond') || shape.classList.contains('v4-shape-triangle') || shape.classList.contains('v4-shape-wave') || shape.classList.contains('v4-shape-arrow')) {
                const svg = shape.querySelector('polygon, path, rect, circle');
                if (svg) {
                    const compStyle = window.getComputedStyle(svg);
                    const val = prop === 'backgroundColor' ? (svg.style.fill || compStyle.fill) : (svg.style.stroke || compStyle.stroke);
                    if (val && val !== 'none') return val;
                }
            }
            return _getVal(shape, prop === 'backgroundColor' ? 'backgroundColor' : 'borderColor');
        };
 
        let detectedIconColor = "";
        if (icon) {
            const poly = icon.querySelector('polyline, path, line, polygon, rect, circle');
            const dot = icon.querySelector('.v4-radio div, .v4-radio-dot');
            if (poly) {
                detectedIconColor = poly.style.stroke || poly.getAttribute('stroke') || icon.style.color || _getVal(icon, "color") || "";
            } else if (dot) {
                detectedIconColor = dot.style.backgroundColor || _getVal(dot, "backgroundColor") || "";
            } else {
                detectedIconColor = icon.style.color || icon.getAttribute('stroke') || _getVal(icon, "color") || "";
            }
        }
 
        const getCompBg = () => {
            if (shape) return getShapeColor("backgroundColor");
            if (table) return _getVal(table, "backgroundColor");
            if (isPin) return _getVal(c, "backgroundColor");
            if (boxEl) return _getVal(boxEl, "backgroundColor");
            if (buttonEl) return _getVal(buttonEl, "backgroundColor");
            if (inputContainer) return _getVal(inputContainer, "backgroundColor");
            if (searchbarContainer) return _getVal(searchbarContainer, "backgroundColor");
            if (stepperContainer) return _getVal(stepperContainer, "backgroundColor");
            if (selectboxContainer) return _getVal(selectboxContainer.querySelector('.v4-selectbox-header'), "backgroundColor");
            if (fileuploadContainer) return _getVal(fileuploadContainer.querySelector('.v4-fileupload-textbox-wrapper'), "backgroundColor");
            if (accordionContainer) return _getVal(accordionContainer, "backgroundColor");
            if (gridContainer) return _getVal(gridContainer, "backgroundColor");
            if (alertContainer) {
                const dialog = alertContainer.querySelector('.v4-alert-dialog');
                return dialog ? _getVal(dialog, "backgroundColor") : _getVal(alertContainer, "backgroundColor");
            }
            return "";
        };

        const getCompBorder = () => {
            if (shape) return getShapeColor("borderColor");
            if (table) return _getVal(table, "borderColor");
            if (isPin) return _getVal(c, "borderColor");
            if (boxEl) return _getVal(boxEl, "borderColor");
            if (buttonEl) return _getVal(buttonEl, "borderColor");
            if (inputContainer) return _getVal(inputContainer, "borderColor");
            if (searchbarContainer) return _getVal(searchbarContainer, "borderColor");
            if (stepperContainer) return _getVal(stepperContainer, "borderColor");
            if (selectboxContainer) return _getVal(selectboxContainer.querySelector('.v4-selectbox-header'), "borderColor");
            if (fileuploadContainer) return _getVal(fileuploadContainer.querySelector('.v4-fileupload-textbox-wrapper'), "borderColor");
            if (accordionContainer) return _getVal(accordionContainer, "borderColor");
            if (gridContainer) return _getVal(gridContainer, "borderColor");
            if (alertContainer) {
                const dialog = alertContainer.querySelector('.v4-alert-dialog');
                return dialog ? _getVal(dialog, "borderColor") : _getVal(alertContainer, "borderColor");
            }
            if (icon) return _getVal(icon.parentElement, "borderColor");
            return "";
        };

        return {
            id: c.id,
            x: parseFloat(c.style.left) || 0,
            y: parseFloat(c.style.top) || 0,
            shapeType: shape ? (shape.classList.contains('v4-shape-line') ? 'line' : (shape.classList.contains('v4-shape-pattern-grid') ? 'pattern' : (shape.classList.contains('v4-shape-wave') ? 'wave' : (shape.classList.contains('v4-shape-rect') ? 'rect' : (shape.classList.contains('v4-shape-circle') ? 'circle' : (shape.classList.contains('v4-shape-triangle') ? 'triangle' : (shape.classList.contains('v4-shape-diamond') ? 'diamond' : (shape.classList.contains('v4-shape-arrow') ? 'arrow' : (shape.classList.contains('v4-shape-webpage') ? 'webpage' : ''))))))))) : '',
            lineDir: shape && shape.classList.contains('v4-shape-line') ? (shape.getAttribute('data-line-dir') || 'horizontal') : 'horizontal',
            waveDir: (function() {
                if (!shape || !shape.classList.contains('v4-shape-wave')) return 'horizontal';
                const attrDir = shape.getAttribute('data-wave-dir');
                if (attrDir) return attrDir;
                const curW = parseFloat(c.style.width) || c.offsetWidth || 360;
                const curH = parseFloat(c.style.height) || c.offsetHeight || 20;
                return curH > curW ? 'vertical' : 'horizontal';
            })(),
            lineStyle: shape && shape.classList.contains('v4-shape-line') ? (shape.getAttribute('data-line-style') || 'solid') : 'solid',
            lineThickness: (function() {
                if (!shape || !shape.classList.contains('v4-shape-line')) return 1.6;
                const attrWidth = shape.getAttribute('data-line-width');
                if (attrWidth) return parseFloat(attrWidth) || 1.6;
                const lineEl = shape.querySelector('line');
                if (lineEl) {
                    const sw = lineEl.style.strokeWidth || lineEl.getAttribute('stroke-width');
                    if (sw) return parseFloat(sw) || 1.6;
                }
                return 1.6;
            })(),
            lineColor: (function() {
                if (!shape || !shape.classList.contains('v4-shape-line')) return '#c8c8c8';
                const lineEl = shape.querySelector('line');
                let strokeVal = shape.getAttribute('data-line-color');
                if (!strokeVal && lineEl) {
                    strokeVal = lineEl.style.stroke || lineEl.getAttribute('stroke');
                }
                strokeVal = strokeVal || '#c8c8c8';
                if (strokeVal === 'transparent') return 'transparent';
                return (typeof window.rgbToHex === 'function' ? window.rgbToHex(strokeVal) : strokeVal) || '#c8c8c8';
            })(),
            isLineColorTransparent: (function() {
                if (!shape || !shape.classList.contains('v4-shape-line')) return false;
                const lineEl = shape.querySelector('line');
                let strokeVal = shape.getAttribute('data-line-color');
                if (!strokeVal && lineEl) {
                    strokeVal = lineEl.style.stroke || lineEl.getAttribute('stroke');
                }
                return strokeVal === 'transparent' || strokeVal === 'rgba(0, 0, 0, 0)';
            })(),
            arrowDir: shape ? (shape.getAttribute('data-arrow-dir') || shape.getAttribute('data-direction') || 'right') : '',
            direction: shape ? (shape.getAttribute('data-direction') || shape.getAttribute('data-arrow-dir') || 'right') : '',
            patternType: shape && shape.classList.contains('v4-shape-pattern-grid') ? (shape.getAttribute('data-pattern-type') || 'grid') : '',
            isTable: !!table && !isGrid,
            isShape: !!shape,
            isIcon: !!icon,
            isImage: isImage,
            imageRatio: (function() {
                if (!isImage) return null;
                const r = c.getAttribute('data-aspect-ratio') || (shape && shape.getAttribute('data-aspect-ratio'));
                if (r && !isNaN(parseFloat(r))) return parseFloat(r);
                const nw = parseFloat(c.getAttribute('data-natural-width') || (shape && shape.getAttribute('data-natural-width')));
                const nh = parseFloat(c.getAttribute('data-natural-height') || (shape && shape.getAttribute('data-natural-height')));
                if (nw && nh && nh > 0) return nw / nh;
                return (c.offsetHeight > 0) ? (c.offsetWidth / c.offsetHeight) : 1;
            })(),
            naturalWidth: parseFloat(c.getAttribute('data-natural-width') || (shape && shape.getAttribute('data-natural-width'))) || null,
            naturalHeight: parseFloat(c.getAttribute('data-natural-height') || (shape && shape.getAttribute('data-natural-height'))) || null,
            isPin: isPin,
            isDescriptionPin: isDescriptionPin,
            pinIndex: (function() {
                if (!isPin && !isDescriptionPin) return -1;
                const rawIdx = c.getAttribute('data-index');
                if (rawIdx !== null && rawIdx !== undefined && !isNaN(parseInt(rawIdx))) return parseInt(rawIdx);
                const parsed = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-', ''));
                return isNaN(parsed) ? -1 : parsed;
            })(),
            frame: c.getAttribute('data-frame') || (c.closest && c.closest('.pc-content-inner, .pc-content-area') ? 'pc' : (c.closest && c.closest('.mobile-content-inner, .mobile-content-area') ? 'mobile' : '')),
            isCheckbox: isCheckbox,
            isRadio: isRadio,
            checked: checked,
            textEnabled: textEnabled,
            checkboxText: container ? (container.querySelector('.v4-checkbox-text, .v4-radio-text')?.innerText || "TEXT") : "TEXT",
            isTextbox: isTextbox,
            isTextarea: isTextarea,
            placeholderText: placeholderText,
            maxLength: maxLength,
            showCounter: showCounter,
            isSearchBar: isSearchBar,
            searchbarPlaceholder: searchbarPlaceholder,
            isStepper: isStepper,
            minVal: minVal,
            maxVal: maxVal,
            val: stepperVal,
            stepVal: stepperStep,
            btnEnabled: stepperBtnEnabled,
            btnText: stepperBtnText,
            disabled: (
                c.getAttribute('data-disabled') === 'true' || 
                (container && container.getAttribute('data-disabled') === 'true') ||
                (stepperContainer && stepperContainer.getAttribute('data-disabled') === 'true') ||
                (selectboxContainer && selectboxContainer.getAttribute('data-disabled') === 'true') ||
                (fileuploadContainer && fileuploadContainer.getAttribute('data-disabled') === 'true') ||
                (searchbarContainer && searchbarContainer.getAttribute('data-disabled') === 'true') ||
                (dpContainer && dpContainer.getAttribute('data-disabled') === 'true') ||
                (toggleContainer && toggleContainer.getAttribute('data-disabled') === 'true') ||
                (accordionContainer && accordionContainer.getAttribute('data-disabled') === 'true') ||
                (btnContainer && btnContainer.getAttribute('data-disabled') === 'true') ||
                !!c.querySelector('[data-disabled="true"]')
            ),
            isPopup: isPopup,
            popupTitle: popupTitle,
            popupShowClose: popupShowClose,
            popupHeaderBg: popupHeaderBg,
            popupHeaderColor: popupHeaderColor,
            popupBodyBg: popupBodyBg,
            popupBorderColor: popupBorderColor,
            popupRadius: popupRadius,
            isSelectbox: isSelectbox,
            selectboxDefaultText: selectboxDefaultText,
            selectboxDropdownActive: selectboxDropdownActive,
            selectboxOptions: selectboxOptions,
            isFileUpload: isFileUpload,
            fileSelected: fileSelected,
            fileName: fileName,
            fileButtonText: fileButtonText,
            filePlaceholder: filePlaceholder,
            isAlert: isAlert,
            alertMessage: alertMessage,
            alertBtnCount: alertBtnCount,
            alertBtnText1: alertBtnText1,
            alertBtnText2: alertBtnText2,
            alertBtnText3: alertBtnText3,
            alertBtnStyle1: alertBtnStyle1,
            alertBtnStyle2: alertBtnStyle2,
            alertBtnStyle3: alertBtnStyle3,
            alertShowDesc: alertShowDesc,
            alertDesc: alertDesc,
            isButton: isButton,
            buttonText: buttonText,
            buttonStyle: buttonStyle,
            buttonRadius: buttonRadius,
            buttonFontSize: buttonFontSize,
            isDatePicker: isDatePicker,
            dpMode: dpMode,
            dpStartTime: dpStartTime,
            dpEndTime: dpEndTime,
            dpShowPresets: dpShowPresets,
            dpShowEndDate: dpShowEndDate,
            dpDefaultPreset: dpDefaultPreset,
            dpStartDate: dpStartDate,
            dpEndDate: dpEndDate,
            isAccordion: isAccordion,
            accordionHeaderText: accordionHeaderText,
            accordionSubCount: accordionSubCount,
            accordionSubTexts: accordionSubTexts,
            accordionExpanded: accordionExpanded,
            accordionItemHeight: accordionItemHeight,
            accordionDepthType: accordionDepthType,
            accordionHierarchy: accordionHierarchy,
            isTab: isTab,
            tabCount: tabCount,
            tabActiveIndex: tabActiveIndex,
            tabAccentColor: tabAccentColor,
            tabs: tabItemsList,
            isGrid: isGrid,
            gridHeaders: gridHeaders,
            gridColumns: gridColumns,
            gridRowCount: gridRowCount,
            gridShowPagination: gridShowPagination,
            gridRowHeight: gridRowHeight,
            gridZebra: gridZebra,
            isAdminSettings: isAdminSettings,
            adminRowCount: adminRowCount,
            adminShowGroupHeader: adminShowGroupHeader,
            adminGroupHeaderTitle: adminGroupHeaderTitle,
            adminGroupHeaderBg: adminGroupHeaderBg,
            adminGroupHeaderColor: adminGroupHeaderColor,
            adminLabelWidth: adminLabelWidth,
            ...adminRowData,
            adminRowHeight: adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row-height')) || 44 : 44,
            isToggle: isToggle,
            toggleChecked: toggleChecked,
            toggleColor: toggleColor,
            isCursor: isCursor,
            cursorType: cursorType,
            cursorText: cursorText,
            showText: showCursorText,
            badgeStyle: cursorBadgeStyle,
            html: textCell ? textCell.innerHTML : (shape ? (shape.querySelector('.v4-shape-text-content')?.innerHTML ?? shape.querySelector('.v4-shape-text-overlay')?.innerHTML ?? shape.innerHTML) : (table ? table.innerHTML : "")),
            isGroup: c.classList.contains('lf-group'),
            w: parseFloat(c.style.width) || c.offsetWidth || 200,
            h: parseFloat(c.style.height) || c.offsetHeight || 100,
            width: parseFloat(c.style.width) || c.offsetWidth || 200,
            height: parseFloat(c.style.height) || c.offsetHeight || 100,
            boxW: boxEl ? (parseInt(boxEl.style.width) || boxEl.offsetWidth || 20) : (c.offsetWidth || 20),
            boxH: boxEl ? (parseInt(boxEl.style.height) || boxEl.offsetHeight || 20) : (c.offsetHeight || 20),
            currentStyles: {
                bg: window.rgbToHex(getCompBg()),
                border: window.rgbToHex(getCompBorder()),
                text: (function() {
                    const cell = textCell || (shape ? shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay') : null);
                    if (cell) {
                        const coloredSpan = cell.querySelector('[style*="color"]');
                        let col = (coloredSpan && coloredSpan.style.color) || _getVal(cell, "color");
                        if (col && typeof col === 'string' && col.includes('var(')) {
                            const compCol = window.getComputedStyle(coloredSpan || cell).color;
                            if (compCol) col = compCol;
                        }
                        if (col && col !== 'inherit' && col !== 'initial' && col !== 'transparent') return window.rgbToHex(col);
                    }
                    if (buttonEl) return window.rgbToHex(_getVal(buttonEl, "color"));
                    return "";
                })(),
                fontSize: (function() {
                    const cell = textCell || (shape ? shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay') : null);
                    if (cell) {
                        const fsSpan = cell.querySelector('[style*="font-size"], [style*="fontSize"]');
                        const fs = (fsSpan && parseInt(fsSpan.style.fontSize)) || parseInt(_getVal(cell, "fontSize"));
                        if (!isNaN(fs) && fs > 0) return fs;
                    }
                    if (inputContainer) {
                        const fs = parseInt(_getVal(inputContainer, "fontSize"));
                        if (!isNaN(fs) && fs > 0) return fs;
                    }
                    return 14;
                })(),
                fontFamily: (function() {
                    const cell = textCell || (shape ? shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay') : null);
                    if (cell) {
                        const ffSpan = cell.querySelector('[style*="font-family"], [style*="fontFamily"]');
                        const ff = (ffSpan && ffSpan.style.fontFamily) || _getVal(cell, "fontFamily");
                        if (ff && ff !== 'inherit') return ff;
                    }
                    if (inputContainer) return _getVal(inputContainer, "fontFamily") || "inherit";
                    return "inherit";
                })(),
                lineHeight: (function() {
                    const cell = textCell || (shape ? shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay') : null);
                    if (cell) {
                        const lhP = cell.querySelector('p[style*="line-height"]');
                        if (lhP && lhP.style.lineHeight) return lhP.style.lineHeight;
                        if (cell.style.lineHeight) return cell.style.lineHeight;
                    }
                    return "1.5";
                })(),
                tableHeader: window.rgbToHex(table ? _getVal(table.querySelector("th"), "backgroundColor") : ""),
                tableHeaderText: window.rgbToHex(table ? _getVal(table.querySelector("th"), "color") : ""),
                iconColor: window.rgbToHex(detectedIconColor || "#000000"),
                borderRadius: shape ? (parseInt(_getVal(shape, "borderRadius")) || 0) : (boxEl ? (parseInt(_getVal(boxEl, "borderRadius")) || 0) : (buttonEl ? (parseInt(_getVal(buttonEl, "borderRadius")) || 0) : 0)),
                bgOpacity: _getAlphaPercent(getCompBg()),
                isBgTransparent: (() => {
                    const colorVal = getCompBg();
                    return !colorVal || colorVal === "transparent" || colorVal === "none" || colorVal.includes("rgba(0, 0, 0, 0)");
                })(),
                isBorderTransparent: (() => {
                    const colorVal = getCompBorder();
                    return !colorVal || colorVal === "transparent" || colorVal === "none" || colorVal.includes("rgba(0, 0, 0, 0)");
                })(),
                textAlign: (() => {
                    const cell = shape ? shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay') : c.querySelector('.v4-editable-cell');
                    const attr = c.getAttribute('data-align') || (cell && cell.getAttribute('data-align'));
                    if (attr) return attr;
                    if (cell) {
                        const sAlign = cell.style.textAlign;
                        if (sAlign && sAlign !== 'inherit') return sAlign;
                        const cAlign = window.getComputedStyle(cell).textAlign;
                        if (cAlign && cAlign !== 'inherit') return cAlign;
                    }
                    return shape ? 'center' : 'left';
                })(),
                justifyContent: (() => {
                    const cell = shape ? shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay') : c.querySelector('.v4-editable-cell');
                    const vAttr = c.getAttribute('data-valign') || (cell && cell.getAttribute('data-valign'));
                    if (vAttr === 'top' || vAttr === 'flex-start') return 'flex-start';
                    if (vAttr === 'bottom' || vAttr === 'flex-end') return 'flex-end';
                    if (vAttr === 'middle' || vAttr === 'center') return 'center';
                    if (cell) {
                        const jc = cell.style.justifyContent || window.getComputedStyle(cell).justifyContent;
                        if (jc && jc !== 'inherit') return jc;
                    }
                    return shape ? (_getVal(shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay'), 'justifyContent') || 'center') : (_getVal(c.querySelector('.v4-editable-cell'), 'justifyContent') || 'center');
                })(),
                vAlign: (() => {
                    const cell = shape ? shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay') : c.querySelector('.v4-editable-cell');
                    const vAttr = c.getAttribute('data-valign') || (cell && cell.getAttribute('data-valign'));
                    if (vAttr) return vAttr === 'flex-start' ? 'top' : (vAttr === 'flex-end' ? 'bottom' : (vAttr === 'center' ? 'middle' : vAttr));
                    if (cell) {
                        const jc = cell.style.justifyContent || window.getComputedStyle(cell).justifyContent;
                        if (jc === 'flex-start') return 'top';
                        if (jc === 'flex-end') return 'bottom';
                        if (jc === 'center') return 'middle';
                    }
                    return 'middle';
                })(),
                padTop: (() => {
                    if (!shape) return 5;
                    const el = shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay');
                    const attr = (el && el.getAttribute('data-pad-top')) || shape.getAttribute('data-pad-top');
                    if (attr !== null && attr !== undefined && !isNaN(parseInt(attr))) return parseInt(attr);
                    if (el) {
                        const parsed = parseInt(window.getComputedStyle(el).paddingTop);
                        if (!isNaN(parsed)) return parsed;
                    }
                    return 5;
                })(),
                padBottom: (() => {
                    if (!shape) return 5;
                    const el = shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay');
                    const attr = (el && el.getAttribute('data-pad-bottom')) || shape.getAttribute('data-pad-bottom');
                    if (attr !== null && attr !== undefined && !isNaN(parseInt(attr))) return parseInt(attr);
                    if (el) {
                        const parsed = parseInt(window.getComputedStyle(el).paddingBottom);
                        if (!isNaN(parsed)) return parsed;
                    }
                    return 5;
                })(),
                padLeft: (() => {
                    if (!shape) return 10;
                    const el = shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay');
                    const attr = (el && el.getAttribute('data-pad-left')) || shape.getAttribute('data-pad-left');
                    if (attr !== null && attr !== undefined && !isNaN(parseInt(attr))) return parseInt(attr);
                    if (el) {
                        const parsed = parseInt(window.getComputedStyle(el).paddingLeft);
                        if (!isNaN(parsed)) return parsed;
                    }
                    return 10;
                })(),
                padRight: (() => {
                    if (!shape) return 10;
                    const el = shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay');
                    const attr = (el && el.getAttribute('data-pad-right')) || shape.getAttribute('data-pad-right');
                    if (attr !== null && attr !== undefined && !isNaN(parseInt(attr))) return parseInt(attr);
                    if (el) {
                        const parsed = parseInt(window.getComputedStyle(el).paddingRight);
                        if (!isNaN(parsed)) return parsed;
                    }
                    return 10;
                })()
            }
        };
    };
})();
`;
}