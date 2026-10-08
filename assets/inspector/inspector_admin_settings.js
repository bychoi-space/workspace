/**
 * assets/inspector/inspector_admin_settings.js
 * Domain Inspector Module: Admin Settings & Shipping Schedule Table
 */
(function() {
    console.log("[Inspector Admin Settings] Domain module loaded.");

    // 1. Label Width Slider & Numeric Input Synchronizer
    function _syncAdminLabelWidth(comp) {
        const labelWidthSlider = document.getElementById('prop-admin-label-width-slider');
        const labelWidthNum = document.getElementById('prop-admin-label-width-number');
        if (!labelWidthNum) return;

        if (comp.adminLabelWidth !== undefined) {
            if (labelWidthSlider) labelWidthSlider.value = comp.adminLabelWidth;
            labelWidthNum.value = comp.adminLabelWidth;
        }
        
        const updateWidth = (val) => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                    labelWidth: val
                });
            }
        };

        if (labelWidthSlider) {
            labelWidthSlider.oninput = (e) => {
                const val = parseInt(e.target.value) || 140;
                labelWidthNum.value = val;
                updateWidth(val);
            };
        }

        labelWidthNum.oninput = (e) => {
            let val = parseInt(e.target.value) || 140;
            if (val >= 60 && val <= 300) {
                if (labelWidthSlider) labelWidthSlider.value = val;
                updateWidth(val);
            }
        };
        
        labelWidthNum.onblur = (e) => {
            let val = parseInt(e.target.value) || 140;
            if (val < 60) val = 60;
            if (val > 300) val = 300;
            labelWidthNum.value = val;
            if (labelWidthSlider) labelWidthSlider.value = val;
            updateWidth(val);
        };
    }

    // 2. Group Header Inputs & Events Synchronizer
    function _syncAdminGroupHeader(comp) {
        const enableChk = document.getElementById('prop-admin-group-header-enable');
        const titleInp = document.getElementById('prop-admin-group-header-title');
        const bgInp = document.getElementById('prop-admin-group-header-bg');
        const colorInp = document.getElementById('prop-admin-group-header-color');
        const configSub = document.getElementById('admin-group-header-config-sub');
        const bgWrapper = document.getElementById('admin-group-header-bg-wrapper');
        const btnBgNone = document.getElementById('btn-admin-group-header-bg-none');

        if (enableChk) {
            enableChk.checked = comp.adminShowGroupHeader === true;
            if (configSub) configSub.style.display = enableChk.checked ? 'flex' : 'none';
        }
        if (titleInp && comp.adminGroupHeaderTitle !== undefined && document.activeElement !== titleInp) {
            titleInp.value = comp.adminGroupHeaderTitle;
        }
        if (bgInp && comp.adminGroupHeaderBg !== undefined) {
            const isTransparent = comp.adminGroupHeaderBg === 'transparent';
            if (bgWrapper) bgWrapper.classList.toggle('transparent-active', isTransparent);
            if (!isTransparent) bgInp.value = comp.adminGroupHeaderBg;
        }
        if (colorInp && comp.adminGroupHeaderColor !== undefined) {
            colorInp.value = comp.adminGroupHeaderColor;
        }

        const notifyGroupHeader = (extraProps = {}) => {
            const iframe = document.getElementById('main-iframe');
            if (!iframe || !iframe.contentWindow || !window.MessageHub) return;
            const isTransparent = bgWrapper && bgWrapper.classList.contains('transparent-active');
            const payload = {
                showGroupHeader: enableChk ? enableChk.checked : false,
                groupHeaderTitle: titleInp ? titleInp.value : '그룹명',
                groupHeaderBg: isTransparent ? 'transparent' : (bgInp ? bgInp.value : '#73829c'),
                groupHeaderColor: colorInp ? colorInp.value : '#ffffff',
                ...extraProps
            };
            window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', payload);
            
            if (window.state && window.state.selectedComponentStyles) {
                window.state.selectedComponentStyles.adminShowGroupHeader = payload.showGroupHeader;
                window.state.selectedComponentStyles.adminGroupHeaderTitle = payload.groupHeaderTitle;
                window.state.selectedComponentStyles.adminGroupHeaderBg = payload.groupHeaderBg;
                window.state.selectedComponentStyles.adminGroupHeaderColor = payload.groupHeaderColor;
            }

            const activeId = window.state?.editingIndex;
            if (activeId) {
                try {
                    const activeEl = iframe.contentWindow.document.getElementById(activeId);
                    if (activeEl) {
                        const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                        containerEl.setAttribute('data-show-group-header', payload.showGroupHeader ? 'true' : 'false');
                        containerEl.setAttribute('data-group-header-title', payload.groupHeaderTitle);
                        containerEl.setAttribute('data-group-header-bg', payload.groupHeaderBg);
                        containerEl.setAttribute('data-group-header-color', payload.groupHeaderColor);
                    }
                } catch(e) {}
            }
        };

        if (enableChk) {
            enableChk.onchange = () => {
                if (configSub) configSub.style.display = enableChk.checked ? 'flex' : 'none';
                notifyGroupHeader({ showGroupHeader: enableChk.checked });
            };
        }

        if (titleInp) {
            titleInp.oninput = () => {
                notifyGroupHeader({ groupHeaderTitle: titleInp.value });
            };
        }

        if (bgInp) {
            bgInp.oninput = (e) => {
                if (e) { e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
                if (bgWrapper) bgWrapper.classList.remove('transparent-active');
                notifyGroupHeader({ groupHeaderBg: bgInp.value });
            };
            bgInp.onchange = (e) => {
                if (e) { e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
                if (bgWrapper) bgWrapper.classList.remove('transparent-active');
                notifyGroupHeader({ groupHeaderBg: bgInp.value });
            };
        }

        if (btnBgNone) {
            btnBgNone.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
                if (bgWrapper) bgWrapper.classList.add('transparent-active');
                notifyGroupHeader({ groupHeaderBg: 'transparent' });
            };
        }

        if (colorInp) {
            colorInp.oninput = (e) => {
                if (e) { e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
                notifyGroupHeader({ groupHeaderColor: colorInp.value });
            };
            colorInp.onchange = (e) => {
                if (e) { e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
                notifyGroupHeader({ groupHeaderColor: colorInp.value });
            };
        }

        return { enableChk, titleInp, bgInp, colorInp, bgWrapper };
    }

    // 3. Helper: Extract current rows configuration data from DOM & Iframe
    function _getCurrentRowsData(container, rowCount, comp) {
        const activeId = window.state?.editingIndex;
        const iframe = document.getElementById('main-iframe');
        let containerEl = null;
        try {
            if (iframe && iframe.contentWindow && activeId) {
                const activeEl = iframe.contentWindow.document.getElementById(activeId);
                if (activeEl) {
                    containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                }
            }
        } catch(e) {}
        const currentRows = [];
        const blocks = container.querySelectorAll('.admin-row-config-block');
        for (let r = 1; r <= rowCount; r++) {
            const rowBlock = blocks[r - 1];
            let lbl = comp[`adminRow${r}Label`] || '';
            let cCount = comp[`adminRow${r}Cols`] || 1;
            let rRatio = comp[`adminRow${r}Ratio`] || '1:1';
            let rType = comp[`adminRow${r}Type`] || 'textbox';
            let rH = comp[`adminRow${r}Height`] || 44;
            let rReq = comp[`adminRow${r}Required`] !== undefined ? comp[`adminRow${r}Required`] : 'false';

            if (containerEl) {
                lbl = containerEl.getAttribute(`data-row${r}-label`) || lbl;
                cCount = parseInt(containerEl.getAttribute(`data-row${r}-cols`)) || cCount;
                rRatio = containerEl.getAttribute(`data-row${r}-ratio`) || rRatio;
                rType = containerEl.getAttribute(`data-row${r}-type`) || rType;
                rH = parseInt(containerEl.getAttribute(`data-row${r}-height`)) || rH;
                if (containerEl.hasAttribute(`data-row${r}-required`)) {
                    rReq = containerEl.getAttribute(`data-row${r}-required`);
                }
            }

            if (rowBlock) {
                const labelInputs = rowBlock.querySelectorAll('.admin-col-label-input');
                if (labelInputs.length > 0) {
                    lbl = Array.from(labelInputs).map(inp => inp.value.trim()).join(', ');
                }
                const colsSel = rowBlock.querySelector('.admin-row-cols');
                if (colsSel) cCount = parseInt(colsSel.value) || 1;
                const ratioSel = rowBlock.querySelector('.admin-row-ratio-select');
                if (ratioSel) rRatio = ratioSel.value || '1:1';
                const hInp = rowBlock.querySelector('.admin-row-height-input');
                if (hInp) rH = parseInt(hInp.value) || 44;
                const reqChks = rowBlock.querySelectorAll('.admin-col-required-chk');
                if (reqChks.length > 0) {
                    rReq = Array.from(reqChks).map(chk => chk.checked ? 'true' : 'false').join(', ');
                }
            }

            currentRows.push({
                label: lbl || `조회 항목 ${r}`,
                cols: cCount,
                ratio: rRatio,
                type: rType,
                height: rH,
                required: rReq
            });
        }
        return currentRows;
    }

    // 4. Helper: Apply updated row structure to Iframe DOM & MessageHub
    function _applyUpdatedRows(rowsArray, comp, headerElements) {
        const iframe = document.getElementById('main-iframe');
        const activeId = window.state?.editingIndex;
        if (!iframe || !iframe.contentWindow || !window.MessageHub) return;

        const newRowCount = rowsArray.length;
        const { enableChk, titleInp, bgInp, colorInp, bgWrapper } = headerElements || {};

        // 1. Update iframe container attributes directly (safe fallback)
        if (activeId) {
            try {
                const activeEl = iframe.contentWindow.document.getElementById(activeId);
                if (activeEl) {
                    const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                    containerEl.setAttribute('data-row-count', newRowCount);
                    for (let r = 1; r <= 20; r++) {
                        if (r <= newRowCount) {
                            const rowData = rowsArray[r - 1];
                            containerEl.setAttribute(`data-row${r}-label`, rowData.label);
                            containerEl.setAttribute(`data-row${r}-cols`, rowData.cols);
                            containerEl.setAttribute(`data-row${r}-ratio`, rowData.ratio || '1:1');
                            containerEl.setAttribute(`data-row${r}-type`, rowData.type || 'textbox');
                            containerEl.setAttribute(`data-row${r}-height`, rowData.height || 44);
                            containerEl.setAttribute(`data-row${r}-required`, String(rowData.required || 'false'));
                        } else {
                            containerEl.removeAttribute(`data-row${r}-label`);
                            containerEl.removeAttribute(`data-row${r}-cols`);
                            containerEl.removeAttribute(`data-row${r}-ratio`);
                            containerEl.removeAttribute(`data-row${r}-type`);
                            containerEl.removeAttribute(`data-row${r}-height`);
                            containerEl.removeAttribute(`data-row${r}-required`);
                        }
                    }
                }
            } catch(e) {}
        }

        // 2. Notify iframe via MessageHub
        window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
            rowCount: newRowCount,
            rows: rowsArray
        });

        // 3. Prepare syncData for inspector refresh
        const syncData = {
            id: activeId,
            editingType: 'admin-settings',
            adminRowCount: newRowCount,
            adminLabelWidth: comp.adminLabelWidth,
            adminShowGroupHeader: enableChk ? enableChk.checked : comp.adminShowGroupHeader,
            adminGroupHeaderTitle: titleInp ? titleInp.value : comp.adminGroupHeaderTitle,
            adminGroupHeaderBg: (bgWrapper && bgWrapper.classList.contains('transparent-active')) ? 'transparent' : (bgInp ? bgInp.value : comp.adminGroupHeaderBg),
            adminGroupHeaderColor: colorInp ? colorInp.value : comp.adminGroupHeaderColor
        };
        for (let r = 1; r <= 20; r++) {
            if (r <= newRowCount) {
                syncData[`adminRow${r}Label`] = rowsArray[r - 1].label;
                syncData[`adminRow${r}Cols`] = rowsArray[r - 1].cols;
                syncData[`adminRow${r}Ratio`] = rowsArray[r - 1].ratio || '1:1';
                syncData[`adminRow${r}Type`] = rowsArray[r - 1].type || 'textbox';
                syncData[`adminRow${r}Height`] = rowsArray[r - 1].height || 44;
                syncData[`adminRow${r}Required`] = String(rowsArray[r - 1].required || 'false');
            }
        }

        if (window.state && window.state.selectedComponentStyles) {
            Object.assign(window.state.selectedComponentStyles, syncData);
        }

        // 4. Re-sync inspector UI with forceRebuild = true
        _syncAdminSettingsProps(syncData, true);
    }

    // 5. Row Configuration Blocks Renderer & Event Binder
    function _renderAdminRowBlocks(comp, forceRebuild, headerElements) {
        const container = document.getElementById('admin-rows-configuration-container');
        if (!container) return;

        const activeEl = document.activeElement;
        const isBtn = activeEl && activeEl.tagName === 'BUTTON';
        const isTypingInAdminContainer = !forceRebuild && !isBtn && activeEl && (
            activeEl.classList.contains('admin-col-label-input') || 
            activeEl.classList.contains('admin-row-height-input') || 
            activeEl.id === 'prop-admin-group-header-title' || 
            activeEl.id === 'prop-admin-label-width-number'
        );
        if (isTypingInAdminContainer) return;
        container.innerHTML = '';

        const rowCount = comp.adminRowCount || 1;

        for (let i = 1; i <= rowCount; i++) {
            const labelsVal = comp[`adminRow${i}Label`] || '';
            const colsVal = comp[`adminRow${i}Cols`] || 1;
            const ratioVal = comp[`adminRow${i}Ratio`] || '1:1';
            const specificHeightVal = comp[`adminRow${i}Height`] || 44;
            const reqRaw = comp[`adminRow${i}Required`] !== undefined ? comp[`adminRow${i}Required`] : '';
            const reqArr = typeof reqRaw === 'boolean' ? [reqRaw] : String(reqRaw).split(',').map(v => v.trim() === 'true');
            const labelsArr = labelsVal.split(',').map(l => l.trim());

            const rowDiv = document.createElement('div');
            rowDiv.className = 'admin-row-config-block';
            rowDiv.setAttribute('data-row-index', i);
            rowDiv.id = 'admin-row-block-' + i;
            rowDiv.style.cssText = 'border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 8px;';
            
            let htmlContent = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 10px; font-weight: bold; color: var(--accent-light, #9e8cfc);">ROW ${i} CONFIG</div>
                    <div style="display: flex; gap: 4px;">
                        <button class="v4-btn-action-sm btn-move-row-up" data-row="${i}" title="위로 이동" ${i === 1 ? 'disabled' : ''}>▲</button>
                        <button class="v4-btn-action-sm btn-move-row-down" data-row="${i}" title="아래로 이동" ${i === rowCount ? 'disabled' : ''}>▼</button>
                        <button class="v4-btn-action-sm danger btn-delete-row" data-row="${i}" title="삭제" ${rowCount <= 1 ? 'disabled' : ''}>&times;</button>
                    </div>
                </div>
                <div class="v4-prop-grid-2">
                    <div class="prop-group">
                        <label class="v4-prop-label">컬럼 수 (Cols)</label>
                        <select class="v4-prop-select admin-row-cols" data-row="${i}">
                            <option value="1" ${colsVal === 1 ? 'selected' : ''}>1개 컬럼</option>
                            <option value="2" ${colsVal === 2 ? 'selected' : ''}>2개 컬럼</option>
                            <option value="3" ${colsVal === 3 ? 'selected' : ''}>3개 컬럼</option>
                            <option value="4" ${colsVal === 4 ? 'selected' : ''}>4개 컬럼</option>
                        </select>
                    </div>
                    <div class="prop-group">
                        <label class="v4-prop-label">행 높이 (Height)</label>
                        <input type="number" class="v4-prop-input-styled admin-row-height-input" data-row="${i}" value="${specificHeightVal}">
                    </div>
                </div>
                <div class="admin-row-ratio-container" data-row="${i}" style="display: ${colsVal === 2 ? 'block' : 'none'}; margin-top: 6px;">
                    <div class="prop-group">
                        <label class="v4-prop-label">2컬럼 분할 비율 (Ratio)</label>
                        <select class="v4-prop-select admin-row-ratio-select" data-row="${i}">
                            <option value="1:1" ${ratioVal === '1:1' ? 'selected' : ''}>1 : 1 (하프 50% : 50%)</option>
                            <option value="1:2" ${ratioVal === '1:2' ? 'selected' : ''}>1 : 2 (1/3 분할 33% : 67%)</option>
                            <option value="2:1" ${ratioVal === '2:1' ? 'selected' : ''}>2 : 1 (2/3 분할 67% : 33%)</option>
                            <option value="1:3" ${ratioVal === '1:3' ? 'selected' : ''}>1 : 3 (1/4 분할 25% : 75%)</option>
                            <option value="3:1" ${ratioVal === '3:1' ? 'selected' : ''}>3 : 1 (3/4 분할 75% : 25%)</option>
                        </select>
                    </div>
                </div>
                <div class="admin-row-labels-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
            `;

            for (let c = 0; c < colsVal; c++) {
                const currentLabel = labelsArr[c] || `조회 항목 ${i}${c > 0 ? ' ' + (c + 1) : ''}`;
                const isColReq = reqArr[c] === true;
                htmlContent += `
                    <div class="prop-group">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <label class="v4-prop-label" style="margin: 0;">컬럼 ${c + 1} 항목명 (Col ${c + 1} Name)</label>
                            <label title="필수값 (*)" style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; margin: 0; font-size: 9px; color: ${isColReq ? '#ffffff' : '#94a3b8'}; font-weight: 600; background: ${isColReq ? 'rgba(110, 86, 207, 0.25)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${isColReq ? 'var(--accent, #6e56cf)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 4px; padding: 2px 6px; user-select: none; transition: all 0.15s ease;">
                                <input type="checkbox" class="admin-col-required-chk" data-col-idx="${c}" ${isColReq ? 'checked' : ''} style="cursor: pointer; accent-color: var(--accent, #6e56cf); margin: 0; width: 12px; height: 12px;">
                                필수 (*)
                            </label>
                        </div>
                        <input type="text" class="admin-col-label-input" data-col-idx="${c}" value="${currentLabel}">
                    </div>
                `;
            }

            htmlContent += `</div>`;
            rowDiv.innerHTML = htmlContent;
            container.appendChild(rowDiv);

            const colSelect = rowDiv.querySelector('.admin-row-cols');
            const ratioSelect = rowDiv.querySelector('.admin-row-ratio-select');
            const ratioContainer = rowDiv.querySelector('.admin-row-ratio-container');
            const heightInp = rowDiv.querySelector('.admin-row-height-input');
            const labelsContainer = rowDiv.querySelector('.admin-row-labels-container');
            const btnUp = rowDiv.querySelector('.btn-move-row-up');
            const btnDown = rowDiv.querySelector('.btn-move-row-down');
            const btnDelete = rowDiv.querySelector('.btn-delete-row');

            if (btnUp && i > 1) {
                btnUp.onclick = () => {
                    const rows = _getCurrentRowsData(container, rowCount, comp);
                    const idx = i - 1;
                    const temp = rows[idx];
                    rows[idx] = rows[idx - 1];
                    rows[idx - 1] = temp;
                    _applyUpdatedRows(rows, comp, headerElements);
                };
            }

            if (btnDown && i < rowCount) {
                btnDown.onclick = () => {
                    const rows = _getCurrentRowsData(container, rowCount, comp);
                    const idx = i - 1;
                    const temp = rows[idx];
                    rows[idx] = rows[idx + 1];
                    rows[idx + 1] = temp;
                    _applyUpdatedRows(rows, comp, headerElements);
                };
            }

            if (btnDelete && rowCount > 1) {
                btnDelete.onclick = () => {
                    const rows = _getCurrentRowsData(container, rowCount, comp);
                    const idx = i - 1;
                    rows.splice(idx, 1);
                    _applyUpdatedRows(rows, comp, headerElements);
                };
            }

            const getMergedLabels = () => {
                const inputs = labelsContainer.querySelectorAll('.admin-col-label-input');
                const vals = Array.from(inputs).map(inp => inp.value.trim());
                return vals.join(', ');
            };

            const getMergedRequired = () => {
                const chks = labelsContainer.querySelectorAll('.admin-col-required-chk');
                return Array.from(chks).map(chk => chk.checked ? 'true' : 'false').join(', ');
            };

            const updateConfig = () => {
                const iframe = document.getElementById('main-iframe');
                const reqStr = getMergedRequired();
                const currentCols = parseInt(colSelect.value) || 1;
                const currentRatio = (currentCols === 2 && ratioSelect) ? (ratioSelect.value || '1:1') : '1:1';
                if (comp) {
                    comp[`adminRow${i}Required`] = reqStr;
                    comp[`adminRow${i}Cols`] = currentCols;
                    comp[`adminRow${i}Ratio`] = currentRatio;
                }
                if (window.state && window.state.selectedComponentStyles) {
                    window.state.selectedComponentStyles[`adminRow${i}Required`] = reqStr;
                    window.state.selectedComponentStyles[`adminRow${i}Cols`] = currentCols;
                    window.state.selectedComponentStyles[`adminRow${i}Ratio`] = currentRatio;
                }
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                        rowNum: i,
                        label: getMergedLabels(),
                        cols: currentCols,
                        ratio: currentRatio,
                        rowType: 'textbox',
                        rowSpecificHeight: parseInt(heightInp.value) || 44,
                        required: reqStr
                    });
                }
            };

            if (heightInp) heightInp.oninput = updateConfig;
            if (ratioSelect) ratioSelect.onchange = updateConfig;
            labelsContainer.querySelectorAll('.admin-col-label-input').forEach(inp => {
                inp.oninput = updateConfig;
            });
            labelsContainer.querySelectorAll('.admin-col-required-chk').forEach(chk => {
                chk.onchange = updateConfig;
            });

            colSelect.onchange = () => {
                const newColsVal = parseInt(colSelect.value) || 1;
                if (ratioContainer) {
                    ratioContainer.style.display = (newColsVal === 2) ? 'block' : 'none';
                }
                const currentReqArr = Array.from(labelsContainer.querySelectorAll('.admin-col-required-chk')).map(c => c.checked);
                const currentLabels = Array.from(labelsContainer.querySelectorAll('.admin-col-label-input')).map(inp => inp.value.trim());
                labelsContainer.innerHTML = '';
                let newHtml = '';
                for (let c = 0; c < newColsVal; c++) {
                    const currentLabel = (currentLabels[c] !== undefined && currentLabels[c] !== '') ? currentLabels[c] : (labelsArr[c] || `조회 항목 ${i}${c > 0 ? ' ' + (c + 1) : ''}`);
                    const isColReq = currentReqArr[c] !== undefined ? currentReqArr[c] : (reqArr[c] === true);
                    newHtml += `
                        <div class="prop-group">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <label class="v4-prop-label" style="margin: 0;">컬럼 ${c + 1} 항목명 (Col ${c + 1} Name)</label>
                                <label title="필수값 (*)" style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; margin: 0; font-size: 9px; color: ${isColReq ? '#ffffff' : '#94a3b8'}; font-weight: 600; background: ${isColReq ? 'rgba(110, 86, 207, 0.25)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${isColReq ? 'var(--accent, #6e56cf)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 4px; padding: 2px 6px; user-select: none; transition: all 0.15s ease;">
                                    <input type="checkbox" class="admin-col-required-chk" data-col-idx="${c}" ${isColReq ? 'checked' : ''} style="cursor: pointer; accent-color: var(--accent, #6e56cf); margin: 0; width: 12px; height: 12px;">
                                    필수 (*)
                                </label>
                            </div>
                            <input type="text" class="admin-col-label-input" data-col-idx="${c}" value="${currentLabel}">
                        </div>
                    `;
                }
                labelsContainer.innerHTML = newHtml;

                labelsContainer.querySelectorAll('.admin-col-label-input').forEach(inp => {
                    inp.oninput = updateConfig;
                });
                labelsContainer.querySelectorAll('.admin-col-required-chk').forEach(chk => {
                    chk.onchange = updateConfig;
                });

                updateConfig();
            };
        }
    }

    // 6. Row Count Increment/Decrement Buttons Binder
    function _bindAdminRowCountButtons(rowCountText, comp, headerElements) {
        const btnInc = document.getElementById('btn-admin-row-inc');
        const btnDec = document.getElementById('btn-admin-row-dec');
        const { enableChk, titleInp, bgInp, colorInp, bgWrapper } = headerElements || {};

        if (btnInc) {
            btnInc.onclick = () => {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    const currentCount = parseInt(rowCountText.innerText) || 1;
                    if (currentCount < 20) {
                        const newCount = currentCount + 1;
                        window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                            rowCount: newCount
                        });

                        const activeId = window.state?.editingIndex;
                        if (activeId) {
                            try {
                                const activeEl = iframe.contentWindow.document.getElementById(activeId);
                                if (activeEl) {
                                    const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                                    if (!containerEl.getAttribute(`data-row${newCount}-label`)) {
                                        containerEl.setAttribute(`data-row${newCount}-label`, `조회 항목 ${newCount}`);
                                        containerEl.setAttribute(`data-row${newCount}-cols`, '1');
                                        containerEl.setAttribute(`data-row${newCount}-ratio`, '1:1');
                                        containerEl.setAttribute(`data-row${newCount}-type`, 'textbox');
                                        containerEl.setAttribute(`data-row${newCount}-height`, '44');
                                        containerEl.setAttribute(`data-row${newCount}-required`, 'false');
                                    }
                                    const syncData = {
                                        id: activeId,
                                        editingType: 'admin-settings',
                                        adminRowCount: newCount,
                                        adminLabelWidth: comp.adminLabelWidth,
                                        adminShowGroupHeader: enableChk ? enableChk.checked : comp.adminShowGroupHeader,
                                        adminGroupHeaderTitle: titleInp ? titleInp.value : comp.adminGroupHeaderTitle,
                                        adminGroupHeaderBg: (bgWrapper && bgWrapper.classList.contains('transparent-active')) ? 'transparent' : (bgInp ? bgInp.value : comp.adminGroupHeaderBg),
                                        adminGroupHeaderColor: colorInp ? colorInp.value : comp.adminGroupHeaderColor
                                    };
                                    for (let r = 1; r <= 20; r++) {
                                        syncData[`adminRow${r}Label`] = containerEl.getAttribute(`data-row${r}-label`) || '';
                                        syncData[`adminRow${r}Cols`] = parseInt(containerEl.getAttribute(`data-row${r}-cols`)) || 1;
                                        syncData[`adminRow${r}Ratio`] = containerEl.getAttribute(`data-row${r}-ratio`) || '1:1';
                                        syncData[`adminRow${r}Type`] = containerEl.getAttribute(`data-row${r}-type`) || 'textbox';
                                        syncData[`adminRow${r}Height`] = parseInt(containerEl.getAttribute(`data-row${r}-height`)) || 44;
                                        syncData[`adminRow${r}Required`] = containerEl.getAttribute(`data-row${r}-required`) || 'false';
                                    }
                                    if (window.state && window.state.selectedComponentStyles) {
                                        Object.assign(window.state.selectedComponentStyles, syncData);
                                    }
                                    _syncAdminSettingsProps(syncData, true);
                                }
                            } catch(e) {}
                        }
                    }
                }
            };
        }

        if (btnDec) {
            btnDec.onclick = () => {
                const iframe = document.getElementById('main-iframe');
                if (iframe && iframe.contentWindow && window.MessageHub) {
                    const currentCount = parseInt(rowCountText.innerText) || 1;
                    if (currentCount > 1) {
                        const newCount = currentCount - 1;
                        window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                            rowCount: newCount
                        });

                        const activeId = window.state?.editingIndex;
                        if (activeId) {
                            try {
                                const activeEl = iframe.contentWindow.document.getElementById(activeId);
                                if (activeEl) {
                                    const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                                    const syncData = {
                                        id: activeId,
                                        editingType: 'admin-settings',
                                        adminRowCount: newCount,
                                        adminLabelWidth: comp.adminLabelWidth,
                                        adminShowGroupHeader: enableChk ? enableChk.checked : comp.adminShowGroupHeader,
                                        adminGroupHeaderTitle: titleInp ? titleInp.value : comp.adminGroupHeaderTitle,
                                        adminGroupHeaderBg: (bgWrapper && bgWrapper.classList.contains('transparent-active')) ? 'transparent' : (bgInp ? bgInp.value : comp.adminGroupHeaderBg),
                                        adminGroupHeaderColor: colorInp ? colorInp.value : comp.adminGroupHeaderColor
                                    };
                                    for (let r = 1; r <= 20; r++) {
                                        syncData[`adminRow${r}Label`] = containerEl.getAttribute(`data-row${r}-label`) || '';
                                        syncData[`adminRow${r}Cols`] = parseInt(containerEl.getAttribute(`data-row${r}-cols`)) || 1;
                                        syncData[`adminRow${r}Ratio`] = containerEl.getAttribute(`data-row${r}-ratio`) || '1:1';
                                        syncData[`adminRow${r}Type`] = containerEl.getAttribute(`data-row${r}-type`) || 'textbox';
                                        syncData[`adminRow${r}Height`] = parseInt(containerEl.getAttribute(`data-row${r}-height`)) || 44;
                                        syncData[`adminRow${r}Required`] = containerEl.getAttribute(`data-row${r}-required`) || 'false';
                                    }
                                    if (window.state && window.state.selectedComponentStyles) {
                                        Object.assign(window.state.selectedComponentStyles, syncData);
                                    }
                                    _syncAdminSettingsProps(syncData, true);
                                }
                            } catch(e) {}
                        }
                    }
                }
            };
        }
    }

    // 7. Focus & Auto-Scroll Coordinator for Canvas Row / Header Selection
    function focusRowBlock(rowIndex, colIndex, isGroupHeader) {
        const inspectorSection = document.getElementById('admin-settings-inspector-section');
        if (!inspectorSection) return;

        // Guard: Do not interrupt if user is actively typing in inspector inputs
        const activeEl = document.activeElement;
        if (activeEl && inspectorSection.contains(activeEl)) {
            return;
        }

        let targetEl = null;
        let targetColInput = null;

        if (isGroupHeader) {
            targetEl = document.getElementById('admin-group-header-config-sub')?.closest('.prop-group') || document.getElementById('prop-admin-group-header-enable')?.closest('.prop-group');
        } else if (typeof rowIndex === 'number' && !isNaN(rowIndex) && rowIndex >= 1) {
            targetEl = document.getElementById('admin-row-block-' + rowIndex);
            if (targetEl && typeof colIndex === 'number' && !isNaN(colIndex) && colIndex >= 0) {
                targetColInput = targetEl.querySelector('.admin-col-label-input[data-col-idx="' + colIndex + '"]');
            }
        }

        if (!targetEl) return;

        // Smoothly scroll target element into view (nearest prevents jarring jumps)
        try {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        } catch (e) {
            targetEl.scrollIntoView(false);
        }

        // Remove previous focus states
        inspectorSection.querySelectorAll('.v4-admin-row-block-focused').forEach(el => {
            el.classList.remove('v4-admin-row-block-focused');
        });
        inspectorSection.querySelectorAll('.v4-admin-col-focused').forEach(el => {
            el.classList.remove('v4-admin-col-focused');
        });

        // Trigger CSS keyframe animation via forced reflow
        void targetEl.offsetWidth;
        targetEl.classList.add('v4-admin-row-block-focused');

        if (targetColInput) {
            void targetColInput.offsetWidth;
            targetColInput.classList.add('v4-admin-col-focused');
        }

        if (window._adminFocusTimer) {
            clearTimeout(window._adminFocusTimer);
        }
        window._adminFocusTimer = setTimeout(() => {
            if (targetEl) targetEl.classList.remove('v4-admin-row-block-focused');
            if (targetColInput) targetColInput.classList.remove('v4-admin-col-focused');
        }, 1600);
    }

    // 8. Main Coordinator: Fragmented clean coordinator for Admin Settings Inspector
    function _syncAdminSettingsProps(comp, forceRebuild = false) {
        if (!comp) return;
        const rowCountText = document.getElementById('txt-admin-row-count');
        if (rowCountText && comp.adminRowCount !== undefined) {
            rowCountText.innerText = comp.adminRowCount;
        }

        _syncAdminLabelWidth(comp);
        const headerElements = _syncAdminGroupHeader(comp);
        _renderAdminRowBlocks(comp, forceRebuild, headerElements);
        _bindAdminRowCountButtons(rowCountText, comp, headerElements);

        if (comp.activeRowIndex !== undefined || comp.isGroupHeader) {
            setTimeout(() => {
                focusRowBlock(comp.activeRowIndex, comp.activeColIndex, comp.isGroupHeader);
            }, 60);
        }
    }

    // Listen for direct query item focus events from canvas
    if (!window._adminFocusListenerBound) {
        window._adminFocusListenerBound = true;
        if (window.MessageHub && typeof window.MessageHub.subscribe === 'function') {
            window.MessageHub.subscribe('LF_QUERY_ITEM_FOCUSED', (data) => {
                if (data && (typeof data.activeRowIndex === 'number' || data.isGroupHeader)) {
                    focusRowBlock(data.activeRowIndex, data.activeColIndex, data.isGroupHeader);
                }
            });
        }
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'LF_QUERY_ITEM_FOCUSED') {
                focusRowBlock(e.data.activeRowIndex, e.data.activeColIndex, e.data.isGroupHeader);
            }
        });
    }

    window.InspectorAdminSettings = {
        sync: _syncAdminSettingsProps,
        focusRowBlock: focusRowBlock
    };
    window.focusAdminRowBlock = focusRowBlock;
    window._syncAdminSettingsProps = _syncAdminSettingsProps;
})();

