/**
 * assets/vctrl_design_system_atoms.js
 * V4 Atom Box Normalization & Form Control Layout Enforcement Module (Iframe Side).
 * Split from vctrl_design_system.js for Single Responsibility & modularity.
 *
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4DesignSystemAtomsScript).
 * 1. DO NOT use inner backticks or template interpolation inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 */

window.v4DesignSystemAtomsScript = `
(function() {
    const normalizeComponentIdsAndAtomBoxes = function() {
        const seenIds = new Set();
        document.querySelectorAll('.lf-component').forEach(function(c, idx) {
            if (!c.id) {
                const isPin = c.classList.contains('pin-marker') || c.classList.contains('text-marker');
                c.id = (isPin ? 'v4-pin-' : 'v4-comp-') + Date.now() + '-' + idx;
            }
            if (seenIds.has(c.id)) {
                const isPin = c.classList.contains('pin-marker') || c.classList.contains('text-marker');
                const oldId = c.id;
                c.id = (isPin ? 'v4-pin-' : 'v4-comp-') + Date.now() + '-dedup-' + Math.floor(Math.random() * 1000) + '-' + idx;
                console.log("[V4 Self-healing] Deduplicated ID from: " + oldId + " to: " + c.id);
            }
            seenIds.add(c.id);

            if (c.classList.contains('pin-marker')) {
                if (c.style.zIndex !== '200000') {
                    c.style.zIndex = '200000';
                }
            }
        });

        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.querySelector('.v4-checkbox-container') || c.querySelector('.v4-radio-container')) {
                if (window.resizeAtomToFitText) window.resizeAtomToFitText(c);
            }
        });

        const ATOM_SELECTORS = [
            '.v4-checkbox-container', '.v4-radio-container',
            '.v4-textbox-container', '.v4-textarea-container',
            '.v4-searchbar-container', '.v4-stepper-container',
            '.v4-selectbox-container', '.v4-fileupload-container',
            '.v4-alert-container', '.v4-btn-container',
            '.v4-datepicker-container', '.v4-accordion-container',
            '.v4-grid-container', '.v4-admin-settings-container',
            '.v4-toggle-container', '.v4-tab-container'
        ].join(', ');

        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group')) return;
            if (c.closest && c.closest('.lf-group')) return;
            if (c.style.width && c.style.height) return;
            if (!c.querySelector(ATOM_SELECTORS)) return;

            const w = c.offsetWidth;
            const h = c.offsetHeight;
            if (w > 0 && !c.style.width) c.style.width = w + 'px';
            if (h > 0 && !c.style.height) c.style.height = h + 'px';
        });
    };

    const enforceAccordionAndStepper = function() {
        const downTriChar = String.fromCharCode(9660);
        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const accordion = c.querySelector('.v4-accordion-container');
            if (accordion) {
                const expanded = accordion.getAttribute('data-expanded') === 'true';
                const header = accordion.querySelector('.v4-accordion-header');
                const body = accordion.querySelector('.v4-accordion-body');
                const chevron = accordion.querySelector('.v4-accordion-chevron');

                const itemHeight = parseInt(accordion.getAttribute('data-item-height'));
                if (itemHeight) {
                    if (header) header.style.height = itemHeight + 'px';
                    accordion.querySelectorAll('.v4-accordion-item').forEach(function(item) {
                        item.style.setProperty('height', itemHeight + 'px', 'important');
                        item.style.setProperty('line-height', itemHeight + 'px', 'important');
                        item.style.setProperty('display', 'flex', 'important');
                        item.style.setProperty('align-items', 'center', 'important');
                        item.style.setProperty('box-sizing', 'border-box', 'important');
                        item.style.setProperty('padding-top', '0', 'important');
                        item.style.setProperty('padding-bottom', '0', 'important');
                    });
                }

                const headerFontSize = parseInt(accordion.getAttribute('data-header-font-size'));
                if (headerFontSize) {
                    const headerTitle = accordion.querySelector('.v4-accordion-title-text');
                    if (headerTitle) headerTitle.style.fontSize = headerFontSize + 'px';
                }
                const subFontSize = parseInt(accordion.getAttribute('data-sub-font-size'));
                if (subFontSize) {
                    accordion.querySelectorAll('.v4-accordion-item, .v4-accordion-tier1-header, .v4-accordion-tier2-header, .v4-accordion-tier3-header, .v4-accordion-body .v4-editable-cell').forEach(function(el) {
                        el.style.fontSize = subFontSize + 'px';
                    });
                }

                const borderType = accordion.getAttribute('data-border-type');
                if (borderType === 'top-bottom') {
                    accordion.style.borderLeft = 'none';
                    accordion.style.borderRight = 'none';
                    accordion.style.borderRadius = '0px';
                    if (!expanded && header) header.style.borderBottom = 'none';
                }
                const chevronType = accordion.getAttribute('data-chevron-type');
                if (chevron) {
                    if (chevronType === 'chevron' && !chevron.querySelector('svg')) {
                        chevron.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px; height:13px; display:inline-block; vertical-align:middle; pointer-events:none;"><polyline points="6 9 12 15 18 9"></polyline></svg>';
                        chevron.style.fontSize = '0px';
                        chevron.style.display = 'inline-flex';
                        chevron.style.alignItems = 'center';
                        chevron.style.justifyContent = 'center';
                    } else if (chevronType === 'triangle' && chevron.querySelector('svg')) {
                        chevron.innerHTML = downTriChar;
                        chevron.style.fontSize = '10px';
                        chevron.style.display = 'inline-block';
                    }
                }

                if (body) body.style.display = expanded ? 'flex' : 'none';
                if (chevron) chevron.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';

                if (c.getAttribute('data-resized') !== 'true') {
                    const headerHeight = header ? header.offsetHeight || 36 : 36;
                    let totalHeight = headerHeight;
                    if (expanded && body) {
                        const origDisplay = body.style.display;
                        body.style.display = 'flex';
                        totalHeight += body.offsetHeight || 0;
                        body.style.display = origDisplay;
                    }
                    c.style.height = totalHeight + 'px';
                }
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const stepper = c.querySelector('.v4-stepper-container');
            if (stepper) {
                const btnEnabled = stepper.getAttribute('data-btn-enabled') !== 'false';
                const targetW = btnEnabled ? '134px' : '80px';
                const targetH = '30px';

                if (c.getAttribute('data-resized') !== 'true') {
                    if (c.style.width !== targetW) c.style.width = targetW;
                    if (c.style.height !== targetH) c.style.height = targetH;
                }

                if (stepper.style.width !== '100%') stepper.style.width = '100%';
                if (stepper.style.height !== '100%') stepper.style.height = '100%';
                const ctrl = stepper.querySelector('.v4-stepper-control');
                const act = stepper.querySelector('.v4-stepper-action');
                if (ctrl && ctrl.style.height !== '100%') ctrl.style.height = '100%';
                if (act && act.style.height !== '100%') act.style.height = '100%';

                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });
    };

    const enforceSelectboxAndFileupload = function() {
        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const selectbox = c.querySelector('.v4-selectbox-container');
            if (selectbox) {
                const dropdownActive = selectbox.getAttribute('data-dropdown-active') === 'true';
                const optionsRaw = selectbox.getAttribute('data-options') || "";
                const optionsArr = optionsRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                const optCount = Math.max(1, optionsArr.length);

                if (c.getAttribute('data-resized') !== 'true') {
                    const targetW = '150px';
                    if (c.style.width !== targetW) c.style.width = targetW;
                    const targetH = dropdownActive ? (30 + (optCount * 30)) + 'px' : '30px';
                    if (c.style.height !== targetH) c.style.height = targetH;
                }

                if (selectbox.style.width !== '100%') selectbox.style.width = '100%';
                if (selectbox.style.height !== '100%') selectbox.style.height = '100%';

                const header = selectbox.querySelector('.v4-selectbox-header');
                if (header) {
                    if (dropdownActive) {
                        if (header.style.height !== '30px') header.style.height = '30px';
                    } else {
                        if (header.style.height !== '100%') header.style.height = '100%';
                    }
                    if (header.style.flexShrink !== '0') header.style.flexShrink = '0';
                    if (header.style.width !== '100%') header.style.width = '100%';
                }

                const optionsList = selectbox.querySelector('.v4-selectbox-options');
                if (optionsList) {
                    optionsList.style.display = dropdownActive ? 'block' : 'none';
                    if (optionsList.style.position !== 'relative') optionsList.style.position = 'relative';
                    if (optionsList.style.top !== '0px' && optionsList.style.top !== '0') optionsList.style.top = '0';
                    if (optionsList.style.flex !== '1 1 0%' && optionsList.style.flex !== '1') optionsList.style.flex = '1';
                    if (optionsList.style.width !== '100%') optionsList.style.width = '100%';
                }

                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const fileupload = c.querySelector('.v4-fileupload-container');
            if (fileupload) {
                if (c.getAttribute('data-resized') !== 'true') {
                    const targetW = '300px';
                    const targetH = '30px';
                    if (c.style.width !== targetW) c.style.width = targetW;
                    if (c.style.height !== targetH) c.style.height = targetH;
                }

                if (fileupload.style.width !== '100%') fileupload.style.width = '100%';
                if (fileupload.style.height !== '100%') fileupload.style.height = '100%';

                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });
    };

    const enforceAlertToggleButtonLayouts = function() {
        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const alert = c.querySelector('.v4-alert-container');
            if (alert) {
                const btn1 = alert.querySelector('.v4-alert-btn-1');
                const btn2 = alert.querySelector('.v4-alert-btn-2');
                const btn3 = alert.querySelector('.v4-alert-btn-3');
                if (btn1) {
                    const style1 = alert.getAttribute('data-btn-style-1') || 'normal';
                    const targetClass = 'v4-alert-btn v4-alert-btn-1 style-' + style1;
                    if (btn1.className !== targetClass) btn1.className = targetClass;
                }
                if (btn2) {
                    const style2 = alert.getAttribute('data-btn-style-2') || 'normal';
                    const targetClass = 'v4-alert-btn v4-alert-btn-2 style-' + style2;
                    if (btn2.className !== targetClass) btn2.className = targetClass;
                }
                if (btn3) {
                    const style3 = alert.getAttribute('data-btn-style-3') || 'normal';
                    const targetClass = 'v4-alert-btn v4-alert-btn-3 style-' + style3;
                    if (btn3.className !== targetClass) btn3.className = targetClass;
                }

                if (c.getAttribute('data-resized') !== 'true') {
                    const header = alert.querySelector('.v4-alert-header');
                    const msgEl = alert.querySelector('.v4-alert-message');
                    const buttonsEl = alert.querySelector('.v4-alert-buttons');

                    const showDesc = alert.getAttribute('data-show-desc') === 'true';
                    const descWrapper = alert.querySelector('.v4-alert-desc-wrapper');
                    let descH = 0;
                    if (descWrapper) {
                        if (showDesc) {
                            descWrapper.style.display = 'flex';
                            descH = (descWrapper.offsetHeight || 27) + 8;
                        } else {
                            descWrapper.style.display = 'none';
                        }
                    }

                    const headerH = header ? header.offsetHeight : 32;
                    const msgH = msgEl ? msgEl.scrollHeight : 21;
                    const msgMargin = msgEl ? 14 : 0;
                    const buttonsH = buttonsEl ? buttonsEl.offsetHeight : 28;
                    const paddingH = 32;

                    const targetH = headerH + paddingH + msgH + msgMargin + buttonsH + 2 + descH;
                    const finalHeight = Math.max(120, targetH) + 'px';

                    if (c.style.height !== finalHeight) c.style.height = finalHeight;
                    if (alert.style.height !== '100%') alert.style.height = '100%';
                    if (alert.style.width !== '100%') alert.style.width = '100%';
                } else {
                    if (alert.style.width !== '100%') alert.style.width = '100%';
                    if (alert.style.height !== '100%') alert.style.height = '100%';
                }
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const toggle = c.querySelector('.v4-toggle-container');
            if (toggle) {
                if (c.getAttribute('data-resized') !== 'true') {
                    if (c.style.width !== '40px') c.style.width = '40px';
                    if (c.style.height !== '20px') c.style.height = '20px';
                }
                if (toggle.style.width !== '100%') toggle.style.width = '100%';
                if (toggle.style.height !== '100%') toggle.style.height = '100%';
                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });

        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const btnContainer = c.querySelector('.v4-btn-container');
            if (btnContainer) {
                const btn = btnContainer.querySelector('.v4-custom-btn');
                if (btn) {
                    const style = btnContainer.getAttribute('data-btn-style') || 'normal';
                    const text = btnContainer.getAttribute('data-text') !== null ? btnContainer.getAttribute('data-text') : (btn.innerText || '\uBC84\uD2BC');
                    const radius = btnContainer.getAttribute('data-btn-radius') || '6';
                    const fontSize = parseInt(btnContainer.getAttribute('data-font-size')) || 12;

                    const targetClass = 'v4-custom-btn style-' + style;
                    const targetRadius = radius + 'px';
                    const targetFontSize = fontSize + 'px';

                    if (btn.className !== targetClass) btn.className = targetClass;
                    if (btn.style.borderRadius !== targetRadius) btn.style.borderRadius = targetRadius;
                    if (btn.innerText !== text) btn.innerText = text;
                    if (btn.style.fontSize !== targetFontSize) btn.style.setProperty('font-size', targetFontSize, 'important');

                    if (style !== 'custom') {
                        if (btn.style.backgroundColor !== '') btn.style.backgroundColor = '';
                        if (btn.style.borderColor !== '') btn.style.borderColor = '';
                        if (btn.style.color !== '') btn.style.color = '';
                    }

                    if (btn.style.borderWidth !== '1.6px') btn.style.setProperty('border-width', '1.6px', 'important');
                    if (btn.style.borderStyle !== 'solid') btn.style.setProperty('border-style', 'solid', 'important');
                }

                if (c.getAttribute('data-resized') !== 'true') {
                    const targetW = '80px';
                    const targetH = '30px';
                    if (c.style.width !== targetW) c.style.width = targetW;
                    if (c.style.height !== targetH) c.style.height = targetH;
                }

                if (btnContainer.style.width !== '100%') btnContainer.style.width = '100%';
                if (btnContainer.style.height !== '100%') btnContainer.style.height = '100%';

                if (typeof window.updateHandles === 'function') window.updateHandles(c);
            }
        });
    };

    const enforceDatepickerLayout = function() {
        document.querySelectorAll('.lf-component').forEach(function(c) {
            if (c.classList.contains('lf-group') || (c.closest && c.closest('.lf-group'))) return;
            const dp = c.querySelector('.v4-datepicker-container');
            if (!dp) return;

            const isDis = (dp.getAttribute('data-disabled') === 'true' || c.getAttribute('data-disabled') === 'true');
            const showPresets = dp.getAttribute('data-show-presets') !== 'false';
            const presetsDiv = dp.querySelector('.v4-dp-presets');
            const showEndDate = dp.getAttribute('data-show-end-date') !== 'false';
            const sep = dp.querySelector('.v4-dp-separator');
            const groups = dp.querySelectorAll('.v4-dp-input-group');
            const mode = dp.getAttribute('data-mode') || 'simple';
            const isDetailed = mode === 'detailed';

            const startEl = dp.querySelector('.v4-dp-start');
            const endEl = dp.querySelector('.v4-dp-end');
            const startTimeEl = dp.querySelector('.v4-dp-start-time');
            const endTimeEl = dp.querySelector('.v4-dp-end-time');

            const storedStart = dp.getAttribute('data-start-date');
            const storedEnd = dp.getAttribute('data-end-date');
            const storedStartTime = dp.getAttribute('data-start-time');
            const storedEndTime = dp.getAttribute('data-end-time');
            const defaultPreset = dp.getAttribute('data-default-preset') || 'none';

            if (isDetailed) {
                if (presetsDiv && presetsDiv.style.display !== 'none') presetsDiv.style.display = 'none';
                if (startTimeEl && startTimeEl.style.display !== 'inline-block') startTimeEl.style.display = 'inline-block';
                if (endTimeEl && endTimeEl.style.display !== 'inline-block') endTimeEl.style.display = 'inline-block';
                if (sep) {
                    const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                    if (sep.style.display !== targetDisplay) sep.style.display = targetDisplay;
                }
                if (groups && groups.length > 1) {
                    const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                    if (groups[1].style.display !== targetDisplay) groups[1].style.display = targetDisplay;
                }
            } else {
                if (startTimeEl && startTimeEl.style.display !== 'none') startTimeEl.style.display = 'none';
                if (endTimeEl && endTimeEl.style.display !== 'none') endTimeEl.style.display = 'none';
                if (sep) {
                    const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                    if (sep.style.display !== targetDisplay) sep.style.display = targetDisplay;
                }
                if (groups && groups.length > 1) {
                    const targetDisplay = showEndDate ? 'inline-flex' : 'none';
                    if (groups[1].style.display !== targetDisplay) groups[1].style.display = targetDisplay;
                }
                if (presetsDiv) {
                    const targetDisplay = showPresets ? 'inline-flex' : 'none';
                    if (presetsDiv.style.display !== targetDisplay) presetsDiv.style.display = targetDisplay;
                }
            }

            const targetStart = (storedStart !== null && storedStart !== undefined) ? storedStart : '';
            const targetEnd = (storedEnd !== null && storedEnd !== undefined) ? storedEnd : '';
            const targetStartTime = (storedStartTime !== null && storedStartTime !== undefined) ? storedStartTime : '';
            const targetEndTime = (storedEndTime !== null && storedEndTime !== undefined) ? storedEndTime : '';

            if (startEl && startEl.innerText !== targetStart) startEl.innerText = targetStart;
            if (endEl && endEl.innerText !== targetEnd) endEl.innerText = targetEnd;
            if (startTimeEl && startTimeEl.innerText !== targetStartTime) startTimeEl.innerText = targetStartTime;
            if (endTimeEl && endTimeEl.innerText !== targetEndTime) endTimeEl.innerText = targetEndTime;

            if (!isDis) {
                dp.querySelectorAll('.v4-dp-preset-btn').forEach(function(btn) {
                    const isActive = btn.getAttribute('data-preset') === defaultPreset;
                    const targetBg = isActive ? '#1d4ed8' : '#ffffff';
                    const targetBorder = '1.6px solid ' + (isActive ? '#1d4ed8' : '#cccccc');
                    const targetColor = isActive ? '#ffffff' : '#0f172a';
                    if (btn.style.background !== targetBg) btn.style.background = targetBg;
                    if (btn.style.border !== targetBorder) btn.style.border = targetBorder;
                    if (btn.style.color !== targetColor) btn.style.color = targetColor;
                    if (btn.style.fontWeight !== '400') btn.style.fontWeight = '400';
                    if (btn.style.fontSize !== '12px') btn.style.fontSize = '12px';
                    if (btn.style.fontFamily !== 'inherit') btn.style.fontFamily = 'inherit';
                    if (isActive) {
                        if (!btn.classList.contains('v4-dp-preset-active')) btn.classList.add('v4-dp-preset-active');
                    } else if (btn.classList.contains('v4-dp-preset-active')) {
                        btn.classList.remove('v4-dp-preset-active');
                    }
                });
            }

            if (dp.style.width !== '100%') dp.style.width = '100%';
            if (dp.style.height !== '100%') dp.style.height = '100%';
            if (c.style.height !== '30px') c.style.height = '30px';

            const fieldsEl = dp.querySelector('.v4-dp-fields');
            const presetsEl = dp.querySelector('.v4-dp-presets');
            let contentW = 0;
            if (fieldsEl) {
                contentW += fieldsEl.offsetWidth || (showEndDate ? (isDetailed ? 370 : 266) : (isDetailed ? 190 : 126));
            }
            if (!isDetailed && showPresets && presetsEl) {
                contentW += 8 + (presetsEl.offsetWidth || 204);
            }
            if (contentW > 0) {
                const targetW = (contentW + 4) + 'px';
                if (c.style.width !== targetW) c.style.width = targetW;
            }

            if (typeof window.updateHandles === 'function') window.updateHandles(c);
        });
    };

    const enforceTextInputContainers = function() {
        const LF_CH = String.fromCharCode(10);
        const CR_CH = String.fromCharCode(13);
        const ZWS_CH = String.fromCharCode(8203);
        const BOM_CH = String.fromCharCode(65279);

        const stripInvisibleChars = function(str) {
            if (!str) return '';
            return str.split(ZWS_CH).join('').split(BOM_CH).join('');
        };

        const isTextInputDomEmpty = function(inputEl, isMultiLine) {
            if (!inputEl) return true;
            const rawDomText = stripInvisibleChars(inputEl.textContent || '').split(LF_CH).join('').split(CR_CH).join('');
            if (rawDomText.length > 0) return false;
            if (isMultiLine) {
                return inputEl.querySelectorAll('br').length <= 1;
            }
            return true;
        };

        const getEffectiveInputText = function(inputEl, isMultiLine) {
            if (isTextInputDomEmpty(inputEl, isMultiLine)) return '';
            let txt = stripInvisibleChars(inputEl.innerText || inputEl.textContent || '');
            if (!isMultiLine) {
                txt = txt.split(LF_CH).join('').split(CR_CH).join('');
            } else if (txt.endsWith(LF_CH)) {
                txt = txt.slice(0, -1);
            }
            return txt;
        };

        const cleanOrphanBrIfUnfocused = function(inputEl, isMultiLine) {
            if (!inputEl || document.activeElement === inputEl) return;
            if (isTextInputDomEmpty(inputEl, isMultiLine) && inputEl.innerHTML !== '') {
                inputEl.innerHTML = '';
            }
        };

        document.querySelectorAll('.v4-textbox-container, .v4-textarea-container').forEach(function(container) {
            const isTextarea = container.classList.contains('v4-textarea-container');
            const input = container.querySelector(isTextarea ? '.v4-textarea-input' : '.v4-textbox-input');
            const placeholder = container.querySelector(isTextarea ? '.v4-textarea-placeholder' : '.v4-textbox-placeholder');
            const counter = container.querySelector(isTextarea ? '.v4-textarea-counter' : '.v4-textbox-counter');

            if (!input) return;

            if (placeholder) {
                const phText = container.getAttribute('data-placeholder');
                if (phText !== null && placeholder.textContent !== phText) {
                    placeholder.textContent = phText;
                }
            }

            const restoreFonts = function() {
                const fs = container.getAttribute('data-fontsize');
                const ff = container.getAttribute('data-fontfamily');
                if (fs) {
                    const fsVal = fs + 'px';
                    if (input.style.fontSize !== fsVal) input.style.fontSize = fsVal;
                    if (placeholder && placeholder.style.fontSize !== fsVal) placeholder.style.fontSize = fsVal;
                }
                if (ff) {
                    if (input.style.fontFamily !== ff) input.style.fontFamily = ff;
                    if (placeholder && placeholder.style.fontFamily !== ff) placeholder.style.fontFamily = ff;
                    if (counter && counter.style.fontFamily !== ff) counter.style.fontFamily = ff;
                }
            };

            if (input._eventsBound) {
                input.removeAttribute('data-events-bound');
                restoreFonts();
                if (typeof input._v4UpdateTextInputUI === 'function') {
                    input._v4UpdateTextInputUI();
                }
                return;
            }
            input._eventsBound = true;
            input.removeAttribute('data-events-bound');
            restoreFonts();

            const getMaxLength = function() { return parseInt(container.getAttribute('data-maxlength')) || 100; };
            const getShowCounter = function() { return container.getAttribute('data-show-counter') !== 'false'; };

            const updateUI = function() {
                cleanOrphanBrIfUnfocused(input, isTextarea);
                let text = getEffectiveInputText(input, isTextarea);
                const isFocusedNow = (document.activeElement === input);

                if (placeholder) {
                    const hasPhText = (placeholder.textContent || '').length > 0;
                    const phDisplay = (!isFocusedNow && text.length === 0 && hasPhText) ? 'block' : 'none';
                    if (placeholder.style.display !== phDisplay) placeholder.style.display = phDisplay;
                }

                const max = getMaxLength();
                if (text.length > max) {
                    const selection = window.getSelection();
                    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                    const offset = range ? range.startOffset : 0;

                    input.innerText = text.substring(0, max);
                    text = getEffectiveInputText(input, isTextarea);

                    if (range && input.firstChild) {
                        try {
                            const newRange = document.createRange();
                            newRange.setStart(input.firstChild, Math.min(offset, max));
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        } catch (e) {}
                    }
                }

                if (counter) {
                    const currentLen = Math.min(text.length, max);
                    const newCounterText = currentLen + '/' + max;
                    const newCounterDisplay = getShowCounter() ? 'block' : 'none';
                    if (counter.textContent !== newCounterText) counter.textContent = newCounterText;
                    if (counter.style.display !== newCounterDisplay) counter.style.display = newCounterDisplay;
                }

                const newColor = text.length === 0 ? '#a3a3a3' : '#374151';
                if (input.style.color !== newColor) input.style.color = newColor;
            };
            input._v4UpdateTextInputUI = updateUI;

            input.addEventListener('input', function() {
                updateUI();
                if (typeof window.markDirty === 'function') window.markDirty();
            });
            input.addEventListener('focus', function() {
                if (placeholder) placeholder.style.display = 'none';
            });
            input.addEventListener('blur', function() {
                updateUI();
            });

            updateUI();
        });
    };

    window.V4DesignSystemAtoms = {
        normalizeComponentIdsAndAtomBoxes: normalizeComponentIdsAndAtomBoxes,
        enforceAccordionAndStepper: enforceAccordionAndStepper,
        enforceSelectboxAndFileupload: enforceSelectboxAndFileupload,
        enforceAlertToggleButtonLayouts: enforceAlertToggleButtonLayouts,
        enforceDatepickerLayout: enforceDatepickerLayout,
        enforceTextInputContainers: enforceTextInputContainers,
        runAll: function() {
            normalizeComponentIdsAndAtomBoxes();
            enforceAccordionAndStepper();
            enforceSelectboxAndFileupload();
            enforceAlertToggleButtonLayouts();
            enforceDatepickerLayout();
            enforceTextInputContainers();
        }
    };
})();
`;
