// --- Core Constants for V4 Injection ---
if (!window.v4Styles) {
    window.v4Styles = ``;
}

window.v4Script = `
(function() {
    // --- Console Log Auto-Clearing Guard inside iframe (Preserved for debugging) ---
    (function() {
        let logCount = 0;
        const originalLog = console.log;
        console.log = function(...args) {
            logCount++;
            if (logCount > 1500) {
                // console.clear(); // Keep logs preserved for debugging visibility
                originalLog("[LF Editor Iframe] Logger threshold reached, preservation active.");
                logCount = 0;
            }
            originalLog.apply(console, args);
        };
    })();

    window.getNextTopZIndex = function(container) {
        var targetParent = container || document.body;
        var maxZ = 1000;
        var comps = targetParent.querySelectorAll ? targetParent.querySelectorAll('.lf-component') : [];
        comps.forEach(function(c) {
            var rawZ = parseInt(c.style.zIndex, 10);
            if (isNaN(rawZ)) {
                var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                rawZ = isNaN(compZ) ? 1000 : compZ;
            }
            if (rawZ < 9999 && rawZ > maxZ) {
                maxZ = rawZ;
            }
        });
        return maxZ + 10;
    };

    window.syncTableComponentSize = function() {
        const s = document.querySelector('.lf-component.selected');
        if (!s) return;
        
        const table = s.querySelector('table');
        if (!table) return;
        
        const isGrid = s.classList.contains('v4-grid-container') || !!s.querySelector('.v4-grid-container');
        if (isGrid) {
            // [Grid UI SSOT] Grid UI maintains its user-defined frame size (width & height) with internal scrolling!
            return;
        }
        
        let newWidth, newHeight;
        const colgroup = table.querySelector('colgroup');
        if (colgroup && colgroup.children.length > 0) {
            let totalWidth = 0;
            Array.from(colgroup.children).forEach(col => {
                const wStr = col.style.width || col.getAttribute('width') || '100px';
                totalWidth += parseInt(wStr) || 100;
            });
            newWidth = totalWidth;
        } else {
            newWidth = table.offsetWidth;
        }
        
        const origHeight = table.style.height;
        table.style.height = 'auto';
        newHeight = table.offsetHeight;
        table.style.height = origHeight || '100%';
        
        notifyParent({
            type: 'LF_TABLE_SIZE_CHANGED',
            compId: s.id,
            width: newWidth,
            height: newHeight,
            isGrid: isGrid
        });
    };

    let isDraggingLine = false, activeLineId = null, startLineCoords = null;



    let startX, startY, startW, startH, startTop, startLeft, startRect;


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
            adminRowData['adminRow' + i + 'Type'] = adminSettingsContainer ? (adminSettingsContainer.getAttribute('data-row' + i + '-type') || 'textbox') : 'textbox';
            adminRowData['adminRow' + i + 'Height'] = adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row' + i + '-height')) || (adminSettingsContainer ? parseInt(adminSettingsContainer.getAttribute('data-row-height')) || 44 : 44) : 44;
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
            shapeType: shape ? (shape.classList.contains('v4-shape-line') ? 'line' : (shape.classList.contains('v4-shape-pattern-grid') ? 'pattern' : (shape.classList.contains('v4-shape-rect') ? 'rect' : (shape.classList.contains('v4-shape-circle') ? 'circle' : (shape.classList.contains('v4-shape-triangle') ? 'triangle' : (shape.classList.contains('v4-shape-diamond') ? 'diamond' : (shape.classList.contains('v4-shape-arrow') ? 'arrow' : ''))))))) : '',
            lineDir: shape && shape.classList.contains('v4-shape-line') ? (shape.getAttribute('data-line-dir') || 'horizontal') : 'horizontal',
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
                return (typeof window.rgbToHex === 'function' ? window.rgbToHex(strokeVal) : strokeVal) || '#c8c8c8';
            })(),
            arrowDir: shape ? (shape.getAttribute('data-arrow-dir') || shape.getAttribute('data-direction') || 'right') : '',
            direction: shape ? (shape.getAttribute('data-direction') || shape.getAttribute('data-arrow-dir') || 'right') : '',
            patternType: shape && shape.classList.contains('v4-shape-pattern-grid') ? (shape.getAttribute('data-pattern-type') || 'grid') : '',
            isTable: !!table && !isGrid,
            isShape: !!shape,
            isIcon: !!icon,
            isImage: isImage,
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
                !!c.querySelector('[data-disabled="true"]')
            ),
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
                text: window.rgbToHex(textCell ? _getVal(textCell, "color") : (buttonEl ? _getVal(buttonEl, "color") : "")),
                fontSize: parseInt(_getVal(textCell, "fontSize")) || (shape ? parseInt(_getVal(shape.querySelector('.v4-editable-cell, .v4-shape-text-content, .v4-shape-text-overlay'), "fontSize")) || 14 : (inputContainer ? parseInt(_getVal(inputContainer, "fontSize")) || 14 : 14)),
                fontFamily: textCell ? _getVal(textCell, "fontFamily") : (inputContainer ? _getVal(inputContainer, "fontFamily") : "inherit"),
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
                textAlign: shape ? (_getVal(shape.querySelector('.v4-editable-cell, .v4-shape-text-content'), 'textAlign') || 'center') : (_getVal(c.querySelector('.v4-editable-cell'), 'textAlign') || 'center'),
                justifyContent: shape ? (_getVal(shape.querySelector('.v4-editable-cell, .v4-shape-text-content'), 'justifyContent') || 'center') : (_getVal(c.querySelector('.v4-editable-cell'), 'justifyContent') || 'center'),
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

    window.SelectionAdorner = {
        getContainer: function(comp) {
            if (!comp) return document.body;
            return (comp.closest && comp.closest('.pc-content-inner, .pc-content-area, .mobile-content-inner, .mobile-content-area, .mobile-content')) || document.body;
        },
        ensureLayer: function(container) {
            if (!container) return null;
            var layer = container.querySelector(':scope > .v4-selection-adorner-layer');
            if (!layer) {
                layer = document.createElement('div');
                layer.className = 'v4-selection-adorner-layer';
                layer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99998; overflow: visible;';
                var compStyle = window.getComputedStyle(container);
                if (compStyle.position === 'static' && container !== document.body) {
                    container.style.position = 'relative';
                }
                var trailingScript = Array.from(container.children).find(function(c) {
                    return c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script';
                });
                if (trailingScript) {
                    container.insertBefore(layer, trailingScript);
                } else {
                    container.appendChild(layer);
                }
            }
            return layer;
        },
        update: function(target) {
            this.clear();
            var selectedComps = target ? [target] : Array.from(document.querySelectorAll('.lf-component.selected'));
            if (selectedComps.length === 0) return;

            var self = this;
            selectedComps.forEach(function(comp) {
                if (!comp || comp.classList.contains('connector-line')) return;
                var container = self.getContainer(comp);
                if (!container) return;
                var layer = self.ensureLayer(container);
                if (!layer) return;

                var compRect = comp.getBoundingClientRect();
                var contRect = container.getBoundingClientRect();
                var scrollL = (container === document.body) ? (window.pageXOffset || document.documentElement.scrollLeft || 0) : container.scrollLeft;
                var scrollT = (container === document.body) ? (window.pageYOffset || document.documentElement.scrollTop || 0) : container.scrollTop;

                var l = Math.round((compRect.left - contRect.left) + scrollL);
                var t = Math.round((compRect.top - contRect.top) + scrollT);
                var w = Math.round(compRect.width);
                var h = Math.round(compRect.height);

                if (w <= 0 || h <= 0) return;

                var isGroup = comp.classList.contains('lf-group');
                var box = document.createElement('div');
                box.className = 'v4-selection-adorner' + (isGroup ? ' is-group' : '');
                box.style.position = 'absolute';
                box.style.left = l + 'px';
                box.style.top = t + 'px';
                box.style.width = w + 'px';
                box.style.height = h + 'px';
                box.style.pointerEvents = 'none';
                box.style.boxSizing = 'border-box';
                box.style.zIndex = '99998';

                var borderColor = isGroup ? '#10b981' : '#6366f1';
                box.style.outline = '2px solid ' + borderColor;
                box.style.outlineOffset = '0px';
                box.style.background = 'transparent';
                var compRad = comp.style.borderRadius || window.getComputedStyle(comp).borderRadius;
                if (compRad && compRad !== '0px') {
                    box.style.borderRadius = compRad;
                }
                layer.appendChild(box);
            });
        },
        clear: function() {
            document.querySelectorAll('.v4-selection-adorner-layer').forEach(function(l) {
                l.innerHTML = '';
            });
        }
    };

    window.updateHandles = (c) => {
        if (!c) return;
        const t = parseInt(c.style.top) || 0;
        const l = parseInt(c.style.left) || 0;
        const del = c.querySelector(':scope > .lf-delete-trigger');
        if (del) { 
            const targetTop = t < 16 ? '4px' : '-12px'; 
            if (del.style.top !== targetTop) del.style.top = targetTop;
            const rightDist = window.innerWidth - (l + (c.offsetWidth || 0));
            const targetRight = rightDist < 16 ? '4px' : '-12px'; 
            if (del.style.right !== targetRight) del.style.right = targetRight;
        }
        if (window.SelectionAdorner && typeof window.SelectionAdorner.update === 'function') {
            window.SelectionAdorner.update();
        }
    };

    window.updateActiveFrameUI = function(type) {
        const targetType = type || window.lastActiveFrame || 'pc';
        const pcFrames = document.querySelectorAll('.pc-browser-frame, .pc-frame');
        const mobileFrames = document.querySelectorAll('.mobile-frame, .mobile-browser-frame');
        const pcCols = document.querySelectorAll('.pc-column');
        const mobileCols = document.querySelectorAll('.mobile-column');

        if (targetType === 'mobile') {
            mobileFrames.forEach(f => f.classList.add('active-frame'));
            mobileCols.forEach(c => c.classList.add('active-column'));
            pcFrames.forEach(f => f.classList.remove('active-frame'));
            pcCols.forEach(c => c.classList.remove('active-column'));
        } else if (targetType === 'pc') {
            pcFrames.forEach(f => f.classList.add('active-frame'));
            pcCols.forEach(c => c.classList.add('active-column'));
            mobileFrames.forEach(f => f.classList.remove('active-frame'));
            mobileCols.forEach(c => c.classList.remove('active-column'));
        }
    };

    let isMarquee = false;
    let isConnectorDragging = false;
    let groupChildrenStart = null;
    document.addEventListener('wheel', e => {
        const mob = e.target.closest && e.target.closest('.mobile-frame, .mobile-browser-frame, .mobile-content, .mobile-content-area, .mobile-content-inner, .mobile-column, .mobile-browser-header, .mobile-top-bar');
        const pc = e.target.closest && e.target.closest('.pc-browser-frame, .pc-frame, .pc-content-area, .pc-content-inner, .pc-column, .pc-browser-header');
        if (mob && window.lastActiveFrame !== 'mobile') {
            window.lastActiveFrame = 'mobile';
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('mobile');
        } else if (pc && window.lastActiveFrame !== 'pc') {
            window.lastActiveFrame = 'pc';
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('pc');
        }
    }, { passive: true });
    document.addEventListener('mousedown', e => {
        if (e.target.closest('.sidebar') || e.target.closest('.modal') || e.target.closest('.header-metadata')) return;

        const mob = e.target.closest('.mobile-frame, .mobile-browser-frame, .mobile-content, .mobile-content-area, .mobile-content-inner, .mobile-column, .mobile-browser-header, .mobile-top-bar');
        const pc = e.target.closest('.pc-browser-frame, .pc-frame, .pc-content-area, .pc-content-inner, .pc-column, .pc-browser-header');
        if (mob) {
            window.lastActiveFrame = 'mobile';
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('mobile');
        } else if (pc) {
            window.lastActiveFrame = 'pc';
            if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('pc');
        }

        let d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        
        const isDeepSelect = !!(e.ctrlKey || e.metaKey);
        const isMulti = !!e.shiftKey;

        if (c && !d) {
            if (!isDeepSelect && !c.classList.contains('text-marker') && !c.classList.contains('pin-marker')) {
                let parent = c.parentElement ? c.parentElement.closest('.lf-component') : null;
                while (parent) {
                    if (parent.classList.contains('text-marker') || parent.classList.contains('pin-marker')) break;
                    c = parent;
                    parent = c.parentElement ? c.parentElement.closest('.lf-component') : null;
                }
            }
        }

        if (d && c) { 
            if (window.V4UndoManager) window.V4UndoManager.saveState();

            if (c.classList.contains('connector-line')) {
                notifyParent({ type: 'LF_DELETE_CONNECTOR', id: c.id });
                c.remove();
            }
            else if (c.classList.contains('text-marker') || c.classList.contains('pin-marker')) {
                let idx = parseInt(c.getAttribute('data-index'));
                if (isNaN(idx)) {
                    idx = parseInt(c.id.replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-', ''));
                }
                notifyParent({ type: 'LF_DELETE_PIN', index: idx });
                c.remove();
            } else {
                c.remove();
            }

            markDirty(); 
            notifyParent({ type: 'LF_DESELECT' });
            return; 
        }
        if (c) {
            isMarquee = false;
            const compMob = c.closest('.mobile-frame, .mobile-browser-frame, .mobile-content, .mobile-content-area, .mobile-content-inner, .mobile-column, .mobile-browser-header, .mobile-top-bar');
            const compPc = c.closest('.pc-browser-frame, .pc-frame, .pc-content-area, .pc-content-inner, .pc-column, .pc-browser-header');
            if (compMob) {
                window.lastActiveFrame = 'mobile';
                if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('mobile');
            } else if (compPc) {
                window.lastActiveFrame = 'pc';
                if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('pc');
            }
            const isResp = window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive();
            if (isMulti) {
                c.classList.toggle('selected');
                if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                    window.ResponsiveSmartGuide.clearGuides(true);
                }
            } else {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                c.classList.add('selected');
                if (isResp) {
                    window.ResponsiveSmartGuide.onSelect(c, 2000);
                }
            }
            window.updateHandles(c);
            notifyParent({ 
                type: "LF_COMP_SELECTED", 
                shiftKey: isMulti,
                isResponsive: !!isResp,
                ...window._getCompStyles(c)
            });
        } else {
            isMarquee = true;
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
                window.SelectionAdorner.clear();
            }
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                window.ResponsiveSmartGuide.clearGuides(true);
            }
            
            const targets = [];
            document.querySelectorAll('.lf-component:not(.connector-line)').forEach(c => {
                let absL = parseFloat(c.style.left) || 0;
                let absT = parseFloat(c.style.top) || 0;
                let isChild = false;
                
                let parent = c.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList && (parent.classList.contains('lf-component') || parent.classList.contains('lf-group'))) {
                        absL += parseFloat(parent.style.left) || 0;
                        absT += parseFloat(parent.style.top) || 0;
                        isChild = true;
                    }
                    parent = parent.parentElement;
                }

                targets.push({
                    id: c.id,
                    x: absL,
                    y: absT,
                    w: c.offsetWidth,
                    h: c.offsetHeight,
                    isGroupChild: isChild
                });
            });

            notifyParent({ 
                type: 'LF_MARQUEE_START', 
                x: e.clientX, 
                y: e.clientY,
                shiftKey: e.shiftKey,
                targets: targets
            });
            notifyParent({ type: 'LF_DESELECT' });
        }
        if (c && !e.target.closest('td, th')) { 
            if (window.V4DragResizeEngine) {
                window.V4DragResizeEngine.handleMouseDown(e, null, null, d, c);
            }
        }
    });

    // Double click to enter text editing mode (PPT-style) or drill down into child component inside group
    document.addEventListener('dblclick', e => {
        const editable = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editable) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                window.ResponsiveSmartGuide.clearGuides(true);
            }
            notifyParent({ type: 'LF_CLEAR_SMARTGUIDE' });
            editable.focus();
            return;
        }

        const targetComp = e.target.closest('.lf-component');
        if (targetComp && !targetComp.classList.contains('lf-delete-trigger')) {
            window.activeEl = targetComp;
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            targetComp.classList.add('selected');
            const isResp = window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.isResponsive === 'function' && window.ResponsiveSmartGuide.isResponsive();
            if (isResp) {
                window.ResponsiveSmartGuide.onSelect(targetComp, 2000);
            }
            window.updateHandles(targetComp);
            notifyParent({
                type: "LF_COMP_SELECTED",
                shiftKey: false,
                isResponsive: !!isResp,
                ...window._getCompStyles(targetComp)
            });
        }
    });

    let rafId = null;
    document.addEventListener('mousemove', e => {
        if (isConnectorDragging) {
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_MOVE', clientX: e.clientX, clientY: e.clientY });
            return;
        }
        if (isDraggingLine && activeLineId) {
            const scale = (window.parent?.state?.transform?.scale) || 1;
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            const conn = window.parent?.state?.connectors?.find(c => c.id === activeLineId);
            if (conn && startLineCoords) {
                conn.start.x = startLineCoords.start.x + dx;
                conn.start.y = startLineCoords.start.y + dy;
                conn.end.x = startLineCoords.end.x + dx;
                conn.end.y = startLineCoords.end.y + dy;
                conn.start.targetId = null; conn.start.side = null;
                conn.end.targetId = null; conn.end.side = null;
                window.updateConnectorPathLocal(activeLineId);
            }
            return;
        }

        if (window.V4PortConnectorEngine && window.V4PortConnectorEngine.isDrawingConnector) {
            window.V4PortConnectorEngine.handleMouseMove(e);
            return;
        }

        if (isMarquee) {
            notifyParent({ type: 'LF_MARQUEE_MOVE', x: e.clientX, y: e.clientY });
            window.getSelection()?.removeAllRanges();
            return;
        }
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isResizing || window.V4DragResizeEngine.isPendingDrag)) {
                window.V4DragResizeEngine.handleMouseMove(e);
            }
        });
    });

    document.addEventListener('mouseup', e => { 
        document.querySelectorAll('.lf-component').forEach(comp => comp.classList.remove('near-connector'));
        if (isConnectorDragging) {
            isConnectorDragging = false;
            document.body.classList.remove('drawing-line-active');
            notifyParent({ type: 'LF_CONNECTOR_HANDLE_UP' });
        }
        if (isDraggingLine) {
            isDraggingLine = false;
            startLineCoords = null;
            activeLineId = null;
            notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
            markDirty();
        }

        if (window.V4PortConnectorEngine && window.V4PortConnectorEngine.isDrawingConnector) {
            window.V4PortConnectorEngine.handleMouseUp(e);
        }

        if (isMarquee) {
            isMarquee = false;
            notifyParent({ type: 'LF_MARQUEE_END' });
        }
        if (window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isResizing || window.V4DragResizeEngine.isPendingDrag)) {
            window.V4DragResizeEngine.handleMouseUp(e);
        }
    });

    document.addEventListener('input', e => { 
        const editableCell = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editableCell) {
            markDirty();
            const dp = editableCell.closest('.v4-datepicker-container');
            if (dp) {
                if (editableCell.classList.contains('v4-dp-start')) dp.setAttribute('data-start-date', editableCell.innerText);
                else if (editableCell.classList.contains('v4-dp-end')) dp.setAttribute('data-end-date', editableCell.innerText);
                else if (editableCell.classList.contains('v4-dp-start-time')) dp.setAttribute('data-start-time', editableCell.innerText);
                else if (editableCell.classList.contains('v4-dp-end-time')) dp.setAttribute('data-end-time', editableCell.innerText);
            }
            const comp = editableCell.closest('.lf-component');
            if (comp) {
                if (comp.querySelector('.v4-checkbox-container') || comp.querySelector('.v4-radio-container')) {
                    if (typeof window.resizeAtomToFitText === 'function') {
                        window.resizeAtomToFitText(comp);
                    } else if (typeof window.enforceDesignSystem === 'function') {
                        window.enforceDesignSystem();
                    }
                } else if (comp.classList.contains('v4-text-shape') || comp.classList.contains('v4-text-box')) {
                    if (typeof window.resizeToFitText === 'function') {
                        window.resizeToFitText(comp);
                    }
                }
                // Notify parent of text changes to sync the Quill editor in real-time
                const isPin = comp.classList.contains('text-marker') || comp.classList.contains('pin-marker') || comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape');
                const isShape = !!comp.querySelector('.v4-shape');

                let targetId = comp.id;
                const pinIndexAttr = comp.getAttribute('data-pin-index');
                if (pinIndexAttr !== null) {
                    targetId = parseInt(pinIndexAttr, 10);
                } else {
                    const match = comp.id.match(/^v4-pin-(\d+)$/);
                    if (match) targetId = parseInt(match[1], 10);
                }

                notifyParent({
                    type: 'LF_PIN_TEXT_CHANGED',
                    id: targetId,
                    compId: comp.id,
                    html: editableCell.innerHTML,
                    isPin: isPin,
                    isShape: isShape
                });
            }
        } 
    }, { passive: false });

    document.addEventListener('focusout', e => {
        const editableCell = e.target.closest('.v4-editable-cell, [contenteditable="true"], .v4-shape-text-content, .v4-shape-text-overlay');
        if (editableCell) {
            const comp = editableCell.closest('.lf-component');
            if (comp) {
                const isPin = comp.classList.contains('text-marker') || comp.classList.contains('pin-marker') || comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape');
                const isShape = !!comp.querySelector('.v4-shape');
                let targetId = comp.id;
                const pinIndexAttr = comp.getAttribute('data-pin-index');
                if (pinIndexAttr !== null) {
                    targetId = parseInt(pinIndexAttr, 10);
                } else {
                    const match = comp.id.match(/^v4-pin-(\d+)$/);
                    if (match) targetId = parseInt(match[1], 10);
                }
                notifyParent({
                    type: 'LF_PIN_TEXT_CHANGED',
                    id: targetId,
                    compId: comp.id,
                    html: editableCell.innerHTML,
                    isPin: isPin,
                    isShape: isShape
                });
            }
        }
    });


    window.v4GlobalStyleHandler = function(d) {
        if (!d) return;
        const s = (d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); 
        if (!s) return;
        
        // Route to modular helpers first
        if (window.v4ObjectText && typeof window.v4ObjectText.handleUpdateStyle === 'function') {
            if (window.v4ObjectText.handleUpdateStyle(d)) return;
        }
        if (window.v4ObjectShape && typeof window.v4ObjectShape.handleUpdateStyle === 'function') {
            if (window.v4ObjectShape.handleUpdateStyle(d)) return;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        let t = d.selector ? s.querySelector(d.selector) : s;
        if (!t && s.classList.contains('text-marker')) {
            t = s.querySelector('.v4-editable-cell') || s;
        }
        const shape = s.querySelector('.v4-shape');
        if (shape && !d.selector) t = shape;
        const boxEl = s.querySelector('.v4-checkbox, .v4-radio');
        if (boxEl && !d.selector) t = boxEl;
        
        const inputContainer = s.querySelector('.v4-textbox-container, .v4-textarea-container');
        if (inputContainer && !d.selector) t = inputContainer;
        
        const searchbarContainer = s.querySelector('.v4-searchbar-container');
        if (searchbarContainer && !d.selector) t = searchbarContainer;
        
        const selectboxContainer = s.querySelector('.v4-selectbox-container');
        if (selectboxContainer && !d.selector) t = selectboxContainer;
        
        const buttonContainer = s.querySelector('.v4-btn-container');
        const customBtn = s.querySelector('.v4-custom-btn');
        if (buttonContainer && customBtn && !d.selector) t = customBtn;

        const adminSettings = s.querySelector('.v4-admin-settings-container') || (s.classList.contains('v4-admin-settings-container') ? s : null);
        if (adminSettings && !d.selector) {
            // For Admin Settings (Query Item), do NOT apply generic component background/colors to .lf-component wrapper!
            if (s.style.background && s.style.background !== 'transparent') s.style.background = 'transparent';
            if (s.style.backgroundColor && s.style.backgroundColor !== 'transparent') s.style.backgroundColor = 'transparent';
            if (d.style) {
                if (d.style.width !== undefined) s.style.setProperty('width', typeof d.style.width === 'number' ? d.style.width + 'px' : d.style.width, 'important');
                if (d.style.height !== undefined) s.style.height = typeof d.style.height === 'number' ? d.style.height + 'px' : d.style.height;
            }
            window.updateHandles(s);
            markDirty();
            return;
        }

        if (!t) return;
        
        if (d.style) {
            if (d.style.width !== undefined || d.style.height !== undefined) {
                s.setAttribute('data-resized', 'true');
            }
            if (d.style.html !== undefined) t.innerHTML = d.style.html;
            
            const isInnerBox = t.classList.contains('v4-checkbox') || t.classList.contains('v4-radio');
            
            if (d.style.width !== undefined) {
                const wVal = typeof d.style.width === 'number' ? d.style.width + 'px' : d.style.width;
                if (isInnerBox) {
                    t.style.width = wVal;
                } else {
                    s.style.setProperty('width', wVal, 'important');
                    if (inputContainer) inputContainer.style.width = '100%';
                    if (alertContainer) alertContainer.style.width = '100%';
                    if (buttonContainer) buttonContainer.style.width = '100%';
                    if (selectboxContainer) {
                        s.setAttribute('data-resized', 'true');
                        selectboxContainer.style.setProperty('width', '100%', 'important');
                        const header = selectboxContainer.querySelector('.v4-selectbox-header');
                        const optionsList = selectboxContainer.querySelector('.v4-selectbox-options');
                        if (header) header.style.setProperty('width', '100%', 'important');
                        if (optionsList) optionsList.style.setProperty('width', '100%', 'important');
                    }
                }
            }
            if (d.style.height !== undefined) {
                const hVal = typeof d.style.height === 'number' ? d.style.height + 'px' : d.style.height;
                if (isInnerBox) {
                    t.style.height = hVal;
                } else {
                    s.style.height = hVal;
                    if (inputContainer) inputContainer.style.height = '100%';
                    if (alertContainer) alertContainer.style.height = '100%';
                    if (buttonContainer) buttonContainer.style.height = '100%';
                    if (selectboxContainer) {
                        selectboxContainer.style.height = '100%';
                        const header = selectboxContainer.querySelector('.v4-selectbox-header');
                        if (header) header.style.height = '100%';
                    }
                }
            }

            const styleToAssign = { ...d.style };
            if (!isInnerBox) {
                delete styleToAssign.width;
                delete styleToAssign.height;
            }
            
            const targets = d.selector ? [t] : [t, s.querySelector('.v4-shape-text-content'), s.querySelector('.v4-shape-text-overlay')].filter(Boolean);
            targets.forEach(target => {
                Object.assign(target.style, styleToAssign);
                for (const [key, val] of Object.entries(styleToAssign)) {
                    if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent' || key === 'borderRadius') {
                        const cssKey = key === 'textAlign' ? 'text-align' : (key === 'alignItems' ? 'align-items' : (key === 'justifyContent' ? 'justify-content' : 'border-radius'));
                        target.style.setProperty(cssKey, val, 'important');
                    }
                }
            });
        }
        
        if (d.subSelector && d.subStyle) {
            t.querySelectorAll(d.subSelector).forEach(sub => {
                Object.keys(d.subStyle).forEach(key => {
                    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    sub.style.setProperty(cssKey, d.subStyle[key], 'important');
                });
            });
        }
        if (typeof window.syncTableComponentSize === 'function') {
            const isGrid = s.classList.contains('v4-grid-container') || !!s.querySelector('.v4-grid-container');
            if (!isGrid) {
                window.syncTableComponentSize();
            }
        }
        window.updateHandles(s);
        markDirty();

        if (typeof window._getCompStyles === 'function') {
            notifyParent({
                type: 'LF_COMP_RESIZED',
                ...window._getCompStyles(s)
            });
        }
    };

    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;

        if (d.type === 'LF_PARENT_MOUSEUP') {
            document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            return;
        }

        if (d.type && window.v4MessageHandlers && typeof window.v4MessageHandlers[d.type.toUpperCase()] === 'function') {
            try {
                window.v4MessageHandlers[d.type.toUpperCase()](d);
                return; // Intercepted and handled by modular component file!
            } catch(err) {
                console.error("[MessageDispatcher] Error running modular handler for " + d.type + ":", err);
            }
        }

        if (d.type === 'LF_SNAP_RESPONSE' && window.activeEl && window.V4DragResizeEngine && window.V4DragResizeEngine.isDragging) {
            const activeEl = window.activeEl;
            const curLeft = parseInt(activeEl.style.left) || 0;
            const curTop = parseInt(activeEl.style.top) || 0;
            let snapDx = d.x - curLeft;
            let snapDy = d.y - curTop;

            // Responsive Shield: Suppress cross-frame snap jumps (> 350px) that cause elements to disappear off-screen
            const isInsideMobileContainer = activeEl.closest('.mobile-content-inner, .mobile-content');
            const isInsidePcContainer = activeEl.closest('.pc-content-inner, .pc-content-area');
            if ((isInsideMobileContainer || isInsidePcContainer) && Math.abs(snapDx) > 350) {
                snapDx = 0;
            }

            if (Math.abs(snapDx) > 0.1 || Math.abs(snapDy) > 0.1) {
                const comps = document.querySelectorAll('.lf-component.selected');
                let hasConnectorChanges = false;
                comps.forEach(c => {
                    const isConnector = c.classList.contains('connector-line');
                    const isGroup = c.classList.contains('lf-group');
                    if (isConnector) {
                        const conn = (window.parent && window.parent.state && window.parent.state.connectors)
                            ? window.parent.state.connectors.find(x => x.id === c.id)
                            : null;
                        if (conn) {
                            conn.start.x += snapDx;
                            conn.start.y += snapDy;
                            conn.end.x += snapDx;
                            conn.end.y += snapDy;
                            conn.start.targetId = null; conn.start.side = null;
                            conn.end.targetId = null; conn.end.side = null;
                            hasConnectorChanges = true;
                        }
                    } else {
                        c.style.left = (parseInt(c.style.left || 0) + snapDx) + 'px';
                        c.style.top = (parseInt(c.style.top || 0) + snapDy) + 'px';
                        window.updateHandles(c);
                        if (isGroup) {
                            const connIdsStr = c.getAttribute('data-connectors');
                            let connIds = [];
                            if (connIdsStr) {
                                try { connIds = JSON.parse(connIdsStr); } catch(e) { connIds = []; }
                            }
                            if (Array.isArray(connIds)) {
                                connIds.forEach(connId => {
                                    const conn = (window.parent && window.parent.state && Array.isArray(window.parent.state.connectors))
                                        ? window.parent.state.connectors.find(x => x && x.id === connId)
                                        : null;
                                    if (conn && conn.start && conn.end) {
                                        conn.start.x += snapDx;
                                        conn.start.y += snapDy;
                                        conn.end.x += snapDx;
                                        conn.end.y += snapDy;
                                        conn.start.targetId = null; conn.start.side = null;
                                        conn.end.targetId = null; conn.end.side = null;
                                        hasConnectorChanges = true;
                                    }
                                });
                            }
                        }
                        if (typeof window.updateAnchoredConnectorsLocal === 'function') {
                            window.updateAnchoredConnectorsLocal(c.id);
                        }
                    }
                });
                if (hasConnectorChanges) {
                    if (window.parent && window.parent.ConnectorEngine) {
                        window.parent.ConnectorEngine.redrawAll();
                    }
                    notifyParent({ type: 'LF_SYNC_CONNECTORS', connectors: window.parent?.state?.connectors });
                }
            }
        }
        else if (d.type === 'LF_REQUEST_SAVE_CONTENT') {
            const c = document.documentElement.cloneNode(true);
            // 1. Remove runtime UI helpers (ports, handles, guide layers, marquee box, selection adorners)
            c.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle, .lf-connector-port, svg.v4-responsive-guide-layer, .v4-marquee-box, .smart-guide-line, .v4-selection-adorner-layer, .v4-selection-adorner').forEach(el => el.remove());
            // 2. Remove active state classes
            c.querySelectorAll('.lf-component, .v4-shape').forEach(el => el.classList.remove('selected', 'dragging-now', 'hover-target', 'v4-guide-snapped'));

            // 3. Clean empty inline style rules created by browser DOM serialization
            c.querySelectorAll('[style]').forEach(el => {
                const s = el.getAttribute('style');
                if (!s) return;
                const rules = s.split(';').map(r => r.trim()).filter(r => {
                    if (!r) return false;
                    const idx = r.indexOf(':');
                    return idx !== -1 && r.substring(idx + 1).trim().length > 0;
                });
                if (rules.length > 0) {
                    el.setAttribute('style', rules.join('; ') + ';');
                } else {
                    el.removeAttribute('style');
                }
            });
            
            // Clean dynamic runtime engine scripts & inlined styles before saving to disk
            const inlinedScript = c.querySelector('#v4-inlined-script');
            if (inlinedScript) inlinedScript.innerHTML = '/* Dynamic scripts injected */';
            const inlinedStyle = c.querySelector('#v4-inlined-style');
            if (inlinedStyle) inlinedStyle.remove();
            const responsiveStyle = c.querySelector('#v4-responsive-frame-style');
            if (responsiveStyle) responsiveStyle.remove();

            notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: "<!DOCTYPE html>\\n" + c.outerHTML });
        } else if (d.type === 'LF_INSERT_COMPONENT' || d.type === 'LF_INSERT_V4_COMP') {
            const pcScrollArea = document.querySelector('.pc-content-area');
            const pcInner = document.querySelector('.pc-content-inner');
            const mobileScrollArea = document.querySelector('.mobile-content-area, .mobile-content');
            const mobileInner = document.querySelector('.mobile-content-inner');
            const isResponsiveTemplate = !!(pcInner || mobileInner);

            const isPinMarker = d.className && d.className.includes('pin-marker');
            const compW = isPinMarker ? 28 : ((d.style && d.style.width) ? parseInt(d.style.width) || 200 : 200);
            const compH = isPinMarker ? 28 : ((d.style && d.style.height) ? parseInt(d.style.height) || 100 : 100);

            let host = document.body;
            let centerTop = Math.round((window.innerHeight - compH) / 2);
            let centerLeft = Math.round((window.innerWidth - compW) / 2);

            if (isResponsiveTemplate) {
                let activeFrame = window.lastActiveFrame;
                if (!mobileScrollArea && pcScrollArea) activeFrame = 'pc';
                if (!pcScrollArea && mobileScrollArea) activeFrame = 'mobile';
                if (!activeFrame) {
                    const currentlySelected = document.querySelector('.lf-component.selected');
                    if (currentlySelected) {
                        if (currentlySelected.closest('.mobile-content-inner, .mobile-content-area, .mobile-content, .mobile-frame, .mobile-browser-frame')) {
                            activeFrame = 'mobile';
                        } else if (currentlySelected.closest('.pc-content-inner, .pc-content-area, .pc-frame, .pc-browser-frame')) {
                            activeFrame = 'pc';
                        }
                    }
                }
                if (!activeFrame) {
                    if (document.querySelector('.mobile-column.active-column')) activeFrame = 'mobile';
                    else if (document.querySelector('.pc-column.active-column')) activeFrame = 'pc';
                }
                if (!activeFrame) {
                    activeFrame = (pcScrollArea || pcInner) ? 'pc' : 'mobile';
                }

                if (activeFrame === 'mobile' && (mobileScrollArea || mobileInner)) {
                    host = mobileInner || mobileScrollArea;
                    const scrollContainer = mobileScrollArea || mobileInner;
                    const sTop = scrollContainer ? scrollContainer.scrollTop : 0;
                    const vHeight = scrollContainer ? (scrollContainer.clientHeight || 810) : 810;
                    const hostW = host ? (host.offsetWidth || 360) : 360;
                    centerLeft = Math.max(15, Math.round((hostW - compW) / 2));
                    centerTop = Math.max(15, Math.round(sTop + (vHeight / 2) - (compH / 2)));
                    if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('mobile');
                } else if (pcScrollArea || pcInner) {
                    host = pcInner || pcScrollArea;
                    const scrollContainer = pcScrollArea || pcInner;
                    const sTop = scrollContainer ? scrollContainer.scrollTop : 0;
                    const vHeight = scrollContainer ? (scrollContainer.clientHeight || 810) : 810;
                    const hostW = host ? (host.offsetWidth || 1160) : 1160;
                    centerLeft = Math.max(15, Math.round((hostW - compW) / 2));
                    centerTop = Math.max(15, Math.round(sTop + (vHeight / 2) - (compH / 2)));
                    if (typeof window.updateActiveFrameUI === 'function') window.updateActiveFrameUI('pc');
                }
            } else {
                try {
                    const parentState = window.parent && window.parent.state;
                    const parentDOM = window.parent && window.parent.DOM;
                    if (parentState && parentState.transform && parentDOM && parentDOM.canvas) {
                        const t = parentState.transform;
                        const cw = parentDOM.canvas.clientWidth || 1600;
                        const ch = parentDOM.canvas.clientHeight || 900;
                        const s = t.scale || 1;
                        const viewCenterX = Math.round(((cw / 2) - t.x) / s);
                        const viewCenterY = Math.round(((ch / 2) - t.y) / s);
                        centerLeft = Math.round(viewCenterX - (compW / 2));
                        centerTop = Math.round(viewCenterY - (compH / 2));
                        const maxW = Math.max(1600, document.body.scrollWidth, document.documentElement.scrollWidth);
                        const maxH = Math.max(900, document.body.scrollHeight, document.documentElement.scrollHeight);
                        centerLeft = Math.max(15, Math.min(centerLeft, maxW - compW - 15));
                        centerTop = Math.max(15, Math.min(centerTop, maxH - compH - 15));
                    }
                } catch(e) {}
            }
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            const v = document.createElement('div'); 
            v.id = d.id || ('v4-comp-' + Date.now()); 
            v.style.position = 'absolute'; 
            v.style.top = centerTop + 'px'; 
            v.style.left = centerLeft + 'px'; 
            const nextZ = (typeof window.getNextTopZIndex === 'function') ? window.getNextTopZIndex(host) : 1010;
            v.style.zIndex = String(nextZ);

            if (isPinMarker) {
                const idx = parseInt(d.id.replace('v4-pin-', '')) || 0;
                v.className = 'lf-component pin-marker';
                v.style.width = '20px';
                v.style.height = '20px';
                v.innerHTML = '<div class="pin-number-badge" style="pointer-events:none; font-weight:500; font-size:12px; font-family:inherit; line-height:1; color:#ffffff;">' + (idx + 1) + '</div>' +
                              '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';
            } else {
                v.className = 'lf-component' + (d.isGroup ? ' lf-group' : '') + (d.className ? ' ' + d.className : ''); 
                v.style.transform = 'none';
                if (d.style) {
                    Object.assign(v.style, d.style);
                    if (!d.style.zIndex || parseInt(d.style.zIndex, 10) <= 1000) {
                        v.style.zIndex = String(nextZ);
                    }
                }
                v.innerHTML = d.html + '<div class="lf-delete-trigger">&times;</div>';
            }
            
            if (window.parent.state && window.parent.state.transform) {
                const s = window.parent.state.transform.scale || 1;
                if (s < 1) {
                    const bw = parseInt(v.style.width) || 200;
                    const bh = parseInt(v.style.height) || 100;
                    if (s < 0.8 && !d.isGroup) {
                        v.style.width = Math.round(bw / s) + 'px';
                        v.style.height = Math.round(bh / s) + 'px';
                    }
                }
            }
            
            const children = Array.from(v.children).filter(c => c.classList.contains('lf-component') || c.classList.contains('lf-group'));
            if (children.length === 1) {
                const inner = children[0];
                const l = parseInt(inner.style.left) || 0;
                const t = parseInt(inner.style.top) || 0;
                if (l !== 0 || t !== 0) {
                    inner.style.left = '0px';
                    inner.style.top = '0px';
                    if (inner.style.width) v.style.width = inner.style.width;
                    if (inner.style.height) v.style.height = inner.style.height;
                }
            }
            
            const trailingRef = Array.from(host.children).find(c => !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script'));
            if (trailingRef && trailingRef.parentNode === host) {
                host.insertBefore(v, trailingRef);
            } else {
                host.appendChild(v);
            }
            document.querySelectorAll('.lf-component').forEach(c => c.classList.remove('selected'));
            v.classList.add('selected');
            if (v.classList.contains('v4-text-shape') && typeof window.resizeToFitText === 'function') {
                window.resizeToFitText(v);
            }
            const styles = window._getCompStyles(v);
            notifyParent({ 
                type: 'LF_COMP_SELECTED', 
                ...styles
            });
            markDirty();
        } else if (d.type === 'LF_INSERT_COMPONENTS') {
            const host = document.body;
            const comps = d.components || [];
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            let currentTopZ = (typeof window.getNextTopZIndex === 'function') ? window.getNextTopZIndex(host) : 1010;
            const trailingRef = Array.from(host.children).find(c => !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script'));
            comps.forEach(c => {
                const v = document.createElement('div');
                v.id = c.id || ('v4-comp-' + Date.now() + Math.random());
                v.className = 'lf-component selected' + (c.isGroup ? ' lf-group' : '') + (c.className ? ' ' + c.className : '');
                
                v.style.position = 'absolute';
                v.style.left = (parseFloat(c.x) || 0) + 'px';
                v.style.top = (parseFloat(c.y) || 0) + 'px';
                v.style.width = c.width || '200px';
                v.style.height = c.height || '100px';
                v.style.zIndex = String(currentTopZ);
                v.style.transform = 'none !important';

                if (c.style) {
                    Object.assign(v.style, c.style);
                    if (!c.style.zIndex || parseInt(c.style.zIndex, 10) <= 1000) {
                        v.style.zIndex = String(currentTopZ);
                    }
                }
                currentTopZ += 10;

                v.innerHTML = (c.html || '') + '<div class="lf-delete-trigger">&times;</div>';
                if (trailingRef && trailingRef.parentNode === host) {
                    host.insertBefore(v, trailingRef);
                } else {
                    host.appendChild(v);
                }
                window.updateHandles(v);
            });
            markDirty();
        } else if (d.type === 'LF_SELECT_ID') {
            const el = document.getElementById(d.id);
            if (el) {
                document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
                window.updateHandles(el);
                notifyParent({
                    type: 'LF_COMP_SELECTED',
                    shiftKey: false,
                    ...window._getCompStyles(el)
                });
            }
        }
        else if (d.type === 'LF_UPDATE_STYLE') {
            if (typeof window.v4GlobalStyleHandler === 'function') {
                window.v4GlobalStyleHandler(d);
            }
        } else if (d.type === 'LF_DELETE_SELECTED') {
            const s = document.querySelector('.lf-component.selected'); 
            if (s) { 
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                s.remove(); 
                markDirty(); 
                notifyParent({ type: 'LF_DESELECT' });
            }
        } else if (d.type === 'LF_DESELECT_ALL' || d.type === 'LF_DESELECT') {
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected'));
            window.activeEl = null;
            if (document.activeElement && (document.activeElement.classList?.contains('v4-editable-cell') || document.activeElement.isContentEditable)) {
                try { document.activeElement.blur(); } catch (_) {}
            }
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.clearGuides === 'function') {
                window.ResponsiveSmartGuide.clearGuides(true);
            }
            if (window.SelectionAdorner && typeof window.SelectionAdorner.clear === 'function') {
                window.SelectionAdorner.clear();
            }
        } else if (d.type === 'LF_SET_RESPONSIVE_GRID') {
            const isResponsiveTemplate = !!(document.querySelector('.pc-content-inner') || document.querySelector('.mobile-content-inner') || document.querySelector('.pc-browser-frame'));
            if (isResponsiveTemplate) {
                if (d.visible === false) {
                    document.body.classList.add('hide-frame-grid');
                } else {
                    document.body.classList.remove('hide-frame-grid');
                }
            }
        } else if (d.type === 'LF_BRING_FRONT') {
            var selected = Array.from(document.querySelectorAll('.lf-component.selected'));
            if (selected.length === 0 && d.id) {
                var singleTarget = document.getElementById(d.id);
                if (singleTarget && singleTarget.classList.contains('lf-component')) {
                    selected.push(singleTarget);
                }
            }
            var topLevelSelected = selected.filter(function(el) {
                var parent = el.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) return false;
                    parent = parent.parentElement;
                }
                return true;
            });
            if (topLevelSelected.length > 0) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                
                var parentMap = new Map();
                topLevelSelected.forEach(function(el) {
                    var p = el.parentElement;
                    if (!p) return;
                    if (!parentMap.has(p)) {
                        parentMap.set(p, []);
                    }
                    parentMap.get(p).push(el);
                });

                parentMap.forEach(function(items, parent) {
                    items.sort(function(a, b) {
                        var pos = a.compareDocumentPosition(b);
                        return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
                    });

                    var siblingComps = Array.from(parent.children).filter(function(c) {
                        return c.classList.contains('lf-component');
                    });

                    var maxZ = 1000;
                    var hasZ = false;
                    siblingComps.forEach(function(c) {
                        var z = parseInt(c.style.zIndex, 10);
                        if (isNaN(z)) {
                            var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                            z = isNaN(compZ) ? 1000 : compZ;
                        }
                        if (z < 9999) {
                            if (!hasZ) {
                                maxZ = z;
                                hasZ = true;
                            } else if (z > maxZ) {
                                maxZ = z;
                            }
                        }
                    });

                    var trailingRef = Array.from(parent.children).find(function(c) {
                        return !c.classList.contains('lf-component') && (c.tagName === 'SCRIPT' || c.id === 'v4-inlined-script');
                    });

                    var targetZ = maxZ + 10;
                    items.forEach(function(el) {
                        el.style.zIndex = String(targetZ);
                        if (trailingRef && trailingRef.parentNode === parent) {
                            parent.insertBefore(el, trailingRef);
                        } else {
                            parent.appendChild(el);
                        }
                    });
                });

                markDirty();
                if (typeof window.reorderAllPins === 'function') window.reorderAllPins();
            }
        } else if (d.type === 'LF_SEND_BACK') {
            var selected = Array.from(document.querySelectorAll('.lf-component.selected'));
            if (selected.length === 0 && d.id) {
                var singleTarget = document.getElementById(d.id);
                if (singleTarget && singleTarget.classList.contains('lf-component')) {
                    selected.push(singleTarget);
                }
            }
            var topLevelSelected = selected.filter(function(el) {
                var parent = el.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.classList.contains('lf-component') && parent.classList.contains('selected')) return false;
                    parent = parent.parentElement;
                }
                return true;
            });
            if (topLevelSelected.length > 0) {
                if (window.V4UndoManager) window.V4UndoManager.saveState();

                var parentMap = new Map();
                topLevelSelected.forEach(function(el) {
                    var p = el.parentElement;
                    if (!p) return;
                    if (!parentMap.has(p)) {
                        parentMap.set(p, []);
                    }
                    parentMap.get(p).push(el);
                });

                parentMap.forEach(function(items, parent) {
                    items.sort(function(a, b) {
                        var pos = a.compareDocumentPosition(b);
                        return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
                    });

                    var siblingComps = Array.from(parent.children).filter(function(c) {
                        return c.classList.contains('lf-component');
                    });

                    var minZ = 1000;
                    var hasZ = false;
                    siblingComps.forEach(function(c) {
                        var z = parseInt(c.style.zIndex, 10);
                        if (isNaN(z)) {
                            var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                            z = isNaN(compZ) ? 1000 : compZ;
                        }
                        if (!hasZ) {
                            minZ = z;
                            hasZ = true;
                        } else if (z < minZ) {
                            minZ = z;
                        }
                    });

                    var targetZ = minZ - 10;
                    if (targetZ < 1) {
                        var shift = Math.abs(targetZ) + 10;
                        siblingComps.forEach(function(c) {
                            var curZ = parseInt(c.style.zIndex, 10);
                            if (isNaN(curZ)) {
                                var compZ = parseInt(window.getComputedStyle(c).zIndex, 10);
                                curZ = isNaN(compZ) ? 1000 : compZ;
                            }
                            c.style.zIndex = String(curZ + shift);
                        });
                        targetZ = 1;
                    }

                    var firstUnselectedComp = siblingComps.find(function(c) {
                        return !items.includes(c);
                    });

                    items.forEach(function(el) {
                        el.style.zIndex = String(targetZ);
                        if (firstUnselectedComp && firstUnselectedComp.parentNode === parent) {
                            parent.insertBefore(el, firstUnselectedComp);
                        } else {
                            var firstChild = parent.firstElementChild;
                            if (firstChild && firstChild !== el) {
                                parent.insertBefore(el, firstChild);
                            }
                        }
                    });
                });

                markDirty();
                if (typeof window.reorderAllPins === 'function') window.reorderAllPins();
            }
        } else if (d.type === 'LF_REQUEST_SNAP_TARGETS') {
            if (window.ResponsiveSmartGuide && typeof window.ResponsiveSmartGuide.collectSnapTargets === 'function') {
                const res = window.ResponsiveSmartGuide.collectSnapTargets();
                notifyParent({ type: 'LF_SNAP_TARGETS_RESPONSE', targets: res.targets, rects: res.rects });
            } else {
                notifyParent({ type: 'LF_SNAP_TARGETS_RESPONSE', targets: [], rects: [] });
            }
        }
    });

    // updateConnectorPathLocal delegated to vctrl_object_connector.js

    window.initHandles = () => {
        document.querySelectorAll('.lf-component').forEach(c => {
            // Clean up legacy handles if present from disk HTML
            c.querySelectorAll(':scope > .lf-drag-handle, :scope > .lf-resizer').forEach(el => el.remove());

            if (!c.querySelector(':scope > .lf-delete-trigger')) {
                const d = document.createElement('div');
                d.className = 'lf-delete-trigger';
                d.innerHTML = '&times;';
                c.appendChild(d);
            }
            if (!c.classList.contains('lf-group') && !c.classList.contains('connector-line')) {
                ['top', 'bottom', 'left', 'right'].forEach(side => {
                    if (!c.querySelector(':scope > .lf-connector-port.port-' + side)) {
                        const port = document.createElement('div');
                        port.className = 'lf-connector-port port-' + side;
                        port.setAttribute('data-side', side);
                        port.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (window.V4PortConnectorEngine) {
                                window.V4PortConnectorEngine.startConnectorDragFromPort(c, side, e);
                            }
                        });
                        c.appendChild(port);
                    }
                });
            }
        });
        
        // Initialize existing grid height and rendering details on load
        document.querySelectorAll('.v4-grid-container').forEach(function(container) {
            var currentCols = [];
            try {
                currentCols = JSON.parse(container.getAttribute('data-columns') || '[]');
            } catch(e) {}
            var rowCount = parseInt(container.getAttribute('data-row-count')) || 5;
            var showPagination = container.getAttribute('data-pagination') === 'true';
            var rowHeight = parseInt(container.getAttribute('data-row-height')) || 50;
            if (window.renderGrid) {
                window.renderGrid(container, currentCols, rowCount, showPagination, rowHeight);
            }
        });
    };
    window.initHandles();

    // Fullscreen presentation proxy listeners to notify parent window
    window.addEventListener('mousemove', (e) => {
        try {
            if (window.parent && typeof window.parent.__lf_proxy_mousemove__ === 'function') {
                window.parent.__lf_proxy_mousemove__(e, window.frameElement);
            }
        } catch(err) {}
    });

    window.addEventListener('keydown', (e) => {
        try {
            if (e.key === 'Shift' && window.parent && typeof window.parent.__lf_proxy_keydown__ === 'function') {
                window.parent.__lf_proxy_keydown__(e);
            }
        } catch(err) {}
    });

    window.addEventListener('keyup', (e) => {
        try {
            if (e.key === 'Shift' && window.parent && typeof window.parent.__lf_proxy_keyup__ === 'function') {
                window.parent.__lf_proxy_keyup__(e);
            }
        } catch(err) {}
    });
})();
`;
