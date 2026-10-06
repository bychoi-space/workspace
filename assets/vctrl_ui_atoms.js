window.v4UIAtomsScript = `
(function() {
    console.log("[V4 UI Atoms] Module initialized.");

    const notifyParent = (data) => {
        if (typeof window.notifyParent === "function") {
            window.notifyParent(data);
        } else if (window.parent) {
            window.parent.postMessage(data, "*");
        }
    };

    // [Phase 6 Decoupling] Stepper, Fileupload, and Toggle event binders moved to vctrl_ui_atoms_inputs.js

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


    // Attach to global window object
    window.bindAccordionEvents = bindAccordionEvents;
    window.bindCursorEvents = function() { if (window.fitCursorWidth && typeof window.bindCursorEvents === "function") window.bindCursorEvents(); };

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
        const container = s.querySelector('.v4-textbox-container, .v4-textarea-container, .v4-stepper-container, .v4-selectbox-container, .v4-fileupload-container, .v4-datepicker-container, .v4-toggle-container, .v4-accordion-container, .v4-checkbox-container, .v4-radio-container, .v4-searchbar-container, .v4-btn-container') || s;
        if (window.V4UndoManager) window.V4UndoManager.saveState();
        const disabledStr = d.disabled ? 'true' : 'false';
        s.setAttribute('data-disabled', disabledStr);
        if (container && container !== s) container.setAttribute('data-disabled', disabledStr);
        
        // Toggle contentEditable on editable cells inside container
        container.querySelectorAll('.v4-editable-cell').forEach(cell => {
            cell.contentEditable = d.disabled ? 'false' : 'true';
        });

        // Toggle button disabled visual style if custom button
        const customBtn = container.querySelector('.v4-custom-btn') || (container.classList.contains('v4-custom-btn') ? container : null);
        if (customBtn) {
            customBtn.style.opacity = d.disabled ? '0.5' : '1';
            customBtn.style.pointerEvents = d.disabled ? 'none' : 'auto';
            customBtn.style.cursor = d.disabled ? 'not-allowed' : 'pointer';
        }
        
        markDirty();
        if (typeof window._getCompStyles === 'function') {
            notifyParent({
                type: 'LF_COMP_STYLES_RESPONSE',
                ...window._getCompStyles(s)
            });
        }
    };


    // [Phase 6 Decoupling] LF_UPDATE_STEPPER_PROPERTIES, LF_UPDATE_SELECTBOX_PROPERTIES, LF_UPDATE_FILEUPLOAD_PROPERTIES moved to vctrl_ui_atoms_inputs.js

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

    window.v4MessageHandlers['LF_UPDATE_POPUP_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
        if (!s) return;
        const container = s.querySelector('.v4-popup-container') || (s.classList.contains('v4-popup-container') ? s : null);
        if (!container) return;
        if (window.V4UndoManager) window.V4UndoManager.saveState();

        if (d.titleText !== undefined) {
            container.setAttribute('data-title', d.titleText);
            const titleEl = container.querySelector('.v4-popup-title');
            if (titleEl) titleEl.innerText = d.titleText;
        }
        if (d.showClose !== undefined) {
            const isShow = (d.showClose === true || d.showClose === 'true');
            container.setAttribute('data-show-close', isShow ? 'true' : 'false');
            const closeBtn = container.querySelector('.v4-popup-close');
            if (closeBtn) closeBtn.style.display = isShow ? 'flex' : 'none';
        }
        if (d.headerBg !== undefined) {
            container.setAttribute('data-header-bg', d.headerBg);
            const header = container.querySelector('.v4-popup-header');
            if (header) header.style.backgroundColor = d.headerBg;
        }
        if (d.headerColor !== undefined) {
            container.setAttribute('data-header-color', d.headerColor);
            const titleEl = container.querySelector('.v4-popup-title');
            if (titleEl) titleEl.style.color = d.headerColor;
        }
        if (d.bodyBg !== undefined) {
            container.setAttribute('data-body-bg', d.bodyBg);
            container.style.backgroundColor = d.bodyBg;
        }
        if (d.borderColor !== undefined) {
            container.setAttribute('data-border-color', d.borderColor);
            container.style.borderColor = d.borderColor;
            const header = container.querySelector('.v4-popup-header');
            if (header) header.style.borderBottomColor = d.borderColor;
        }
        if (d.borderRadius !== undefined) {
            container.setAttribute('data-border-radius', d.borderRadius);
            container.style.borderRadius = d.borderRadius + 'px';
        }

        markDirty();
        if (typeof window._getCompStyles === 'function' && window.parent) {
            window.parent.postMessage(Object.assign({
                type: 'LF_COMP_SELECTED'
            }, window._getCompStyles(s)), '*');
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

    window.v4MessageHandlers['LF_FIT_BUTTON_TO_TEXT'] = function(d) {
        var s = document.querySelector('.lf-component.selected');
        if (!s) return;
        var container = s.querySelector('.v4-btn-container') || (s.classList.contains('v4-btn-container') ? s : null);
        if (!container) return;
        var btn = container.querySelector('.v4-custom-btn');
        var text = (btn ? btn.innerText : '') || container.getAttribute('data-text') || '';
        if (!text || !text.trim()) return;

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        var span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'nowrap';
        span.style.fontSize = (btn ? window.getComputedStyle(btn).fontSize : '') || '12px';
        span.style.fontFamily = (btn ? window.getComputedStyle(btn).fontFamily : '') || 'inherit';
        span.style.fontWeight = (btn ? window.getComputedStyle(btn).fontWeight : '') || '400';
        span.innerText = text;
        document.body.appendChild(span);
        var textW = Math.ceil(span.getBoundingClientRect().width);
        document.body.removeChild(span);

        var fitW = Math.max(50, textW + 32);

        s.style.setProperty('width', fitW + 'px', 'important');
        s.style.width = fitW + 'px';
        s.setAttribute('data-resized', 'true');

        if (typeof window.updateHandles === 'function') window.updateHandles(s);
        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
        markDirty();

        if (typeof window._getCompStyles === 'function' && window.parent) {
            var compStyles = window._getCompStyles(s);
            window.parent.postMessage(Object.assign({
                type: 'LF_COMP_SELECTED'
            }, compStyles), '*');
            window.parent.postMessage({
                type: 'LF_COMP_RESIZED',
                w: fitW,
                h: compStyles.h || parseFloat(s.style.height) || s.offsetHeight
            }, '*');
        }
    };


    // [Phase 6 Decoupling] LF_UPDATE_DATEPICKER moved to vctrl_ui_atoms_inputs.js

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
                            if (d.ratio !== undefined) container.setAttribute('data-row' + rNum + '-ratio', d.ratio);
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
                                if (rData.ratio !== undefined) container.setAttribute('data-row' + rNum + '-ratio', rData.ratio);
                                if (rData.type !== undefined) container.setAttribute('data-row' + rNum + '-type', rData.type);
                                if (rData.height !== undefined) container.setAttribute('data-row' + rNum + '-height', rData.height);
                                if (rData.required !== undefined) container.setAttribute('data-row' + rNum + '-required', String(rData.required));
                            });
                            // Clean up trailing unused row attributes if rows count decreased
                            for (let rNum = d.rows.length + 1; rNum <= 20; rNum++) {
                                container.removeAttribute('data-row' + rNum + '-label');
                                container.removeAttribute('data-row' + rNum + '-cols');
                                container.removeAttribute('data-row' + rNum + '-ratio');
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
                            
                            const needsRebuildRows = (d.rowCount !== undefined || d.rowNum !== undefined || d.rows !== undefined || d.labelWidth !== undefined || d.required !== undefined || d.ratio !== undefined);
                            if (needsRebuildRows) {
                                tableDiv.innerHTML = '';
                                
                                for (let i = 1; i <= totalRows; i++) {
                                    const labelAttr = container.getAttribute('data-row' + i + '-label') || ('\uD56D\uBAA9 ' + i);
                                    const colsAttr = parseInt(container.getAttribute('data-row' + i + '-cols')) || 1;
                                    const ratioAttr = container.getAttribute('data-row' + i + '-ratio') || '1:1';
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
                                        
                                        // Content cell with ratio-aware flex width
                                        const contentCell = document.createElement('div');
                                        contentCell.className = 'v4-admin-content-cell';
                                        
                                        let flexStyle = 'flex: 1 1 0%; min-width: 0;';
                                        if (colsAttr === 2) {
                                            if (ratioAttr === '1:2') {
                                                if (c === 0) {
                                                    flexStyle = 'flex: 0 0 calc(100% / 3 - ' + labelWidth + 'px); min-width: 0;';
                                                } else {
                                                    flexStyle = 'flex: 1 1 0%; min-width: 0;';
                                                }
                                            } else if (ratioAttr === '2:1') {
                                                if (c === 0) {
                                                    flexStyle = 'flex: 0 0 calc(200% / 3 - ' + labelWidth + 'px); min-width: 0;';
                                                } else {
                                                    flexStyle = 'flex: 1 1 0%; min-width: 0;';
                                                }
                                            } else if (ratioAttr === '1:3') {
                                                if (c === 0) {
                                                    flexStyle = 'flex: 0 0 calc(100% / 4 - ' + labelWidth + 'px); min-width: 0;';
                                                } else {
                                                    flexStyle = 'flex: 1 1 0%; min-width: 0;';
                                                }
                                            } else if (ratioAttr === '3:1') {
                                                if (c === 0) {
                                                    flexStyle = 'flex: 0 0 calc(300% / 4 - ' + labelWidth + 'px); min-width: 0;';
                                                } else {
                                                    flexStyle = 'flex: 1 1 0%; min-width: 0;';
                                                }
                                            }
                                        }
                                        
                                        let cellStyle = flexStyle + ' display: flex; align-items: center; padding: 0 16px; box-sizing: border-box;';
                                        if (c < colsAttr - 1) {
                                            cellStyle += ' border-right: 1.6px solid rgb(226, 232, 240);';
                                        } else {
                                            cellStyle += ' border-right: 1.6px solid transparent;';
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


    // [Phase 6 Decoupling] LF_UPDATE_TEXTBOX_PROPERTIES, LF_UPDATE_TOGGLE_PROPERTIES, LF_UPDATE_SEARCHBAR_PROPERTIES moved to vctrl_ui_atoms_inputs.js
    // [Phase 3 Decoupling] LF_UPDATE_CURSOR_PROPERTIES moved to vctrl_ui_atoms_cursor.js

})();
`;
