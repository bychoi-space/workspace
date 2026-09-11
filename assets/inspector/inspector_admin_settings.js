/**
 * assets/inspector/inspector_admin_settings.js
 * Domain Inspector Module: Admin Settings & Shipping Schedule Table
 */
(function() {
    console.log("[Inspector Admin Settings] Domain module loaded.");

function _syncAdminSettingsProps(comp, forceRebuild = false) {
    const rowCountText = document.getElementById('txt-admin-row-count');
    if (rowCountText && comp.adminRowCount !== undefined) {
        rowCountText.innerText = comp.adminRowCount;
    }

    const labelWidthSlider = document.getElementById('prop-admin-label-width-slider');
    const labelWidthNum = document.getElementById('prop-admin-label-width-number');
    if (labelWidthNum) {
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
            // Allow loose typing but constrain values on final update
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

    // Sync Group Header Inputs
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

    const getCurrentRowsData = () => {
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
            let rType = comp[`adminRow${r}Type`] || 'textbox';
            let rH = comp[`adminRow${r}Height`] || 44;

            if (containerEl) {
                lbl = containerEl.getAttribute(`data-row${r}-label`) || lbl;
                cCount = parseInt(containerEl.getAttribute(`data-row${r}-cols`)) || cCount;
                rType = containerEl.getAttribute(`data-row${r}-type`) || rType;
                rH = parseInt(containerEl.getAttribute(`data-row${r}-height`)) || rH;
            }

            if (rowBlock) {
                const labelInputs = rowBlock.querySelectorAll('.admin-col-label-input');
                if (labelInputs.length > 0) {
                    lbl = Array.from(labelInputs).map(inp => inp.value.trim()).join(', ');
                }
                const colsSel = rowBlock.querySelector('.admin-row-cols');
                if (colsSel) cCount = parseInt(colsSel.value) || 1;
                const hInp = rowBlock.querySelector('.admin-row-height-input');
                if (hInp) rH = parseInt(hInp.value) || 44;
            }

            currentRows.push({
                label: lbl || `조회 항목 ${r}`,
                cols: cCount,
                type: rType,
                height: rH
            });
        }
        return currentRows;
    };

    const applyUpdatedRows = (rowsArray) => {
        const iframe = document.getElementById('main-iframe');
        const activeId = window.state?.editingIndex;
        if (!iframe || !iframe.contentWindow || !window.MessageHub) return;

        const newRowCount = rowsArray.length;

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
                            containerEl.setAttribute(`data-row${r}-type`, rowData.type || 'textbox');
                            containerEl.setAttribute(`data-row${r}-height`, rowData.height || 44);
                        } else {
                            containerEl.removeAttribute(`data-row${r}-label`);
                            containerEl.removeAttribute(`data-row${r}-cols`);
                            containerEl.removeAttribute(`data-row${r}-type`);
                            containerEl.removeAttribute(`data-row${r}-height`);
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
                syncData[`adminRow${r}Type`] = rowsArray[r - 1].type || 'textbox';
                syncData[`adminRow${r}Height`] = rowsArray[r - 1].height || 44;
            }
        }

        if (window.state && window.state.selectedComponentStyles) {
            Object.assign(window.state.selectedComponentStyles, syncData);
        }

        // 4. Re-sync inspector UI with forceRebuild = true
        _syncAdminSettingsProps(syncData, true);
    };

    for (let i = 1; i <= rowCount; i++) {
        const labelsVal = comp[`adminRow${i}Label`] || '';
        const colsVal = comp[`adminRow${i}Cols`] || 1;
        const specificHeightVal = comp[`adminRow${i}Height`] || 44;

        // Split current labels
        const labelsArr = labelsVal.split(',').map(l => l.trim());

        const rowDiv = document.createElement('div');
        rowDiv.className = 'admin-row-config-block';
        rowDiv.style.cssText = 'border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 8px;';
        
        // Start building HTML
        let htmlContent = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 10px; font-weight: bold; color: #00e5ff;">ROW ${i} CONFIG</div>
                <div style="display: flex; gap: 4px;">
                    <button class="v4-inspector-btn btn-move-row-up" data-row="${i}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="위로 이동" ${i === 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▲</button>
                    <button class="v4-inspector-btn btn-move-row-down" data-row="${i}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="아래로 이동" ${i === rowCount ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▼</button>
                    <button class="v4-inspector-btn btn-delete-row" data-row="${i}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; cursor: pointer;" title="삭제" ${rowCount <= 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>&times;</button>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div class="prop-group">
                    <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">조회 컬럼 개수</label>
                    <select class="v4-prop-input admin-row-cols" data-row="${i}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px; border-radius: 4px; font-size: 11px; height: 23px; box-sizing: border-box;">
                        <option value="1" ${colsVal === 1 ? 'selected' : ''}>1개 컬럼</option>
                        <option value="2" ${colsVal === 2 ? 'selected' : ''}>2개 컬럼</option>
                        <option value="3" ${colsVal === 3 ? 'selected' : ''}>3개 컬럼</option>
                    </select>
                </div>
                <div class="prop-group">
                    <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">행 높이 (Height px)</label>
                    <input type="number" class="v4-prop-input admin-row-height-input" data-row="${i}" value="${specificHeightVal}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; box-sizing: border-box; outline: none; font-family: inherit; height: 23px;">
                </div>
            </div>
            <div class="admin-row-labels-container" style="display: flex; flex-direction: column; gap: 8px;">
        `;

        // Render input field for each column
        for (let c = 0; c < colsVal; c++) {
            const currentLabel = labelsArr[c] || `조회 항목 ${i}${c > 0 ? ' ' + (c + 1) : ''}`;
            htmlContent += `
                <div class="prop-group">
                    <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">컬럼 ${c + 1} 항목명</label>
                    <input type="text" class="v4-prop-input admin-col-label-input" data-col-idx="${c}" value="${currentLabel}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; box-sizing: border-box;">
                </div>
            `;
        }

        htmlContent += `</div>`;
        rowDiv.innerHTML = htmlContent;
        container.appendChild(rowDiv);

        const colSelect = rowDiv.querySelector('.admin-row-cols');
        const heightInp = rowDiv.querySelector('.admin-row-height-input');
        const labelsContainer = rowDiv.querySelector('.admin-row-labels-container');
        const btnUp = rowDiv.querySelector('.btn-move-row-up');
        const btnDown = rowDiv.querySelector('.btn-move-row-down');
        const btnDelete = rowDiv.querySelector('.btn-delete-row');

        if (btnUp && i > 1) {
            btnUp.onclick = () => {
                const rows = getCurrentRowsData();
                const idx = i - 1;
                const temp = rows[idx];
                rows[idx] = rows[idx - 1];
                rows[idx - 1] = temp;
                applyUpdatedRows(rows);
            };
        }

        if (btnDown && i < rowCount) {
            btnDown.onclick = () => {
                const rows = getCurrentRowsData();
                const idx = i - 1;
                const temp = rows[idx];
                rows[idx] = rows[idx + 1];
                rows[idx + 1] = temp;
                applyUpdatedRows(rows);
            };
        }

        if (btnDelete && rowCount > 1) {
            btnDelete.onclick = () => {
                const rows = getCurrentRowsData();
                const idx = i - 1;
                rows.splice(idx, 1);
                applyUpdatedRows(rows);
            };
        }

        const getMergedLabels = () => {
            const inputs = labelsContainer.querySelectorAll('.admin-col-label-input');
            const vals = Array.from(inputs).map(inp => inp.value.trim());
            return vals.join(', ');
        };

        const updateConfig = () => {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ADMIN_SETTINGS_PROPERTIES', {
                    rowNum: i,
                    label: getMergedLabels(),
                    cols: parseInt(colSelect.value) || 1,
                    rowType: 'textbox',
                    rowSpecificHeight: parseInt(heightInp.value) || 44
                });
            }
        };

        // If Column Count changes, re-render the label inputs for this row
        colSelect.onchange = () => {
            const newColsVal = parseInt(colSelect.value) || 1;
            labelsContainer.innerHTML = '';
            let newHtml = '';
            for (let c = 0; c < newColsVal; c++) {
                const currentLabel = labelsArr[c] || `조회 항목 ${i}${c > 0 ? ' ' + (c + 1) : ''}`;
                newHtml += `
                    <div class="prop-group">
                        <label style="font-size: 9px; color: #94a3b8; display: block; margin-bottom: 4px;">컬럼 ${c + 1} 항목명</label>
                        <input type="text" class="v4-prop-input admin-col-label-input" data-col-idx="${c}" value="${currentLabel}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; box-sizing: border-box;">
                    </div>
                `;
            }
            labelsContainer.innerHTML = newHtml;

            // Bind input events to new inputs
            labelsContainer.querySelectorAll('.admin-col-label-input').forEach(inp => {
                inp.oninput = updateConfig;
            });

            updateConfig();
        };

        // Bind input events to height input & initial labels
        if (heightInp) heightInp.oninput = updateConfig;
        labelsContainer.querySelectorAll('.admin-col-label-input').forEach(inp => {
            inp.oninput = updateConfig;
        });
    }

    // Initialize row count +/- button click event listeners
    const btnInc = document.getElementById('btn-admin-row-inc');
    const btnDec = document.getElementById('btn-admin-row-dec');

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

                    // Trigger parent side metadata and ui sync
                    const activeId = window.state?.editingIndex;
                    if (activeId) {
                        try {
                            const activeEl = iframe.contentWindow.document.getElementById(activeId);
                            if (activeEl) {
                                const containerEl = activeEl.querySelector('.v4-admin-settings-container') || activeEl;
                                if (!containerEl.getAttribute(`data-row${newCount}-label`)) {
                                    containerEl.setAttribute(`data-row${newCount}-label`, `조회 항목 ${newCount}`);
                                    containerEl.setAttribute(`data-row${newCount}-cols`, '1');
                                    containerEl.setAttribute(`data-row${newCount}-type`, 'textbox');
                                    containerEl.setAttribute(`data-row${newCount}-height`, '44');
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
                                    syncData[`adminRow${r}Type`] = containerEl.getAttribute(`data-row${r}-type`) || 'textbox';
                                    syncData[`adminRow${r}Height`] = parseInt(containerEl.getAttribute(`data-row${r}-height`)) || 44;
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
                                    syncData[`adminRow${r}Type`] = containerEl.getAttribute(`data-row${r}-type`) || 'textbox';
                                    syncData[`adminRow${r}Height`] = parseInt(containerEl.getAttribute(`data-row${r}-height`)) || 44;
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

    window._syncAdminSettingsProps = _syncAdminSettingsProps;
})();
