/**
 * assets/inspector_grid.js
 * Domain Inspector Module: Grid Table
 * Encapsulates state synchronization (Read), event handling (Write), and column rendering.
 */
(function() {
    console.log("[Inspector Grid] Domain module loaded.");

    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    const notifyGrid = (data) => {
        const targetId = (window.state && window.state.selectedComponent && window.state.selectedComponent.id) ||
                         (window.state && window.state.editingIndex) ||
                         window.activeCompId || null;
        const payload = Object.assign({ type: 'LF_UPDATE_GRID_PROPERTIES' }, data);
        if (targetId && !payload.id) {
            payload.id = targetId;
        }
        if (window.EditorBus) {
            window.EditorBus.sendToIframe(payload);
        } else {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_GRID_PROPERTIES', payload);
            }
        }
    };

    window.InspectorGrid = {
        sync: function(comp) {
            if (!comp) return;

            const rowCountInp = document.getElementById('prop-grid-row-count');
            if (rowCountInp && comp.gridRowCount !== undefined) {
                rowCountInp.value = comp.gridRowCount;
            }
            
            const rowHeightInp = document.getElementById('prop-grid-row-height');
            if (rowHeightInp && comp.gridRowHeight !== undefined) {
                rowHeightInp.value = comp.gridRowHeight;
            }

            const paginationY = document.getElementById('btn-grid-pagination-y');
            const paginationN = document.getElementById('btn-grid-pagination-n');
            if (paginationY && paginationN) {
                highlightActive(paginationY, comp.gridShowPagination === true);
                highlightActive(paginationN, comp.gridShowPagination === false);
            }

            const zebraY = document.getElementById('btn-grid-zebra-y');
            const zebraN = document.getElementById('btn-grid-zebra-n');
            if (zebraY && zebraN) {
                highlightActive(zebraY, comp.gridZebra === true);
                highlightActive(zebraN, comp.gridZebra !== true);
            }

            const presetSel = document.getElementById('prop-grid-preset');
            if (presetSel) {
                presetSel.value = '';
            }
            
            if (typeof this.renderColumnCards === 'function') {
                this.renderColumnCards(comp.gridColumns || [], comp.gridHeaders || []);
            }
            
            const s = comp.currentStyles || {};
            const syncColor = (id, wrapperId, color, isTransparent) => {
                const picker = document.getElementById(id);
                const wrapper = document.getElementById(wrapperId);
                if (picker && color) picker.value = color;
                if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
            };
            syncColor('grid-bg-color', 'grid-bg-wrapper', s.bg, s.isBgTransparent);
            syncColor('grid-border-color', 'grid-border-wrapper', s.border, s.isBorderTransparent);

            const sec = document.getElementById('grid-inspector-section');
            if (sec) {
                const wInp = sec.querySelector('.v4-prop-input[data-prop="width"]');
                const hInp = sec.querySelector('.v4-prop-input[data-prop="height"]');
                const curW = comp.w !== undefined ? comp.w : (comp.width !== undefined ? comp.width : undefined);
                const curH = comp.h !== undefined ? comp.h : (comp.height !== undefined ? comp.height : undefined);
                if (wInp && curW !== undefined && document.activeElement !== wInp) {
                    wInp.value = Math.round(curW);
                }
                if (hInp && curH !== undefined && document.activeElement !== hInp) {
                    hInp.value = Math.round(curH);
                }
            }
        },

        renderColumnCards: function(columns, headers) {
            const container = document.getElementById('grid-columns-container');
            if (!container) return;
            const activeEl = document.activeElement;
            const isTyping = activeEl && (container.contains(activeEl) || activeEl.classList.contains('grid-col-name-input') || activeEl.classList.contains('grid-col-width-input') || activeEl.classList.contains('grid-col-options-input'));
            if (isTyping) return;
            container.innerHTML = '';
            
            let colsList = [];
            if (Array.isArray(columns) && columns.length > 0) {
                colsList = columns;
            } else if (Array.isArray(headers) && headers.length > 0) {
                colsList = headers.map((h, i) => {
                    let type = 'text';
                    const lower = (h || '').toLowerCase();
                    if (i === 0 && (h === '' || lower.includes('check') || h.includes('선택'))) type = 'checkbox';
                    else if (h === '번호') type = 'number';
                    else if (h.includes('상태')) type = 'status';
                    else if (h.includes('등록') || h.includes('수정자')) type = 'author';
                    else if (h.includes('일시') || h.includes('일자')) type = 'datetime';
                    else if (h.includes('금액') || h.includes('가격')) type = 'currency';
                    else if (h === '관리') type = 'action';
                    return {
                        name: h,
                        type: type,
                        width: type === 'checkbox' ? '50px' : (type === 'number' || type === 'action' ? '80px' : (type === 'text' ? '200px' : '120px')),
                        align: (type === 'number' || type === 'currency') ? 'right' : ((type === 'checkbox' || type === 'status' || type === 'action') ? 'center' : 'left')
                    };
                });
            } else {
                colsList = [
                    { name: "", type: "checkbox", width: "60px", align: "center" },
                    { name: "번호", type: "number", width: "80px", align: "center" },
                    { name: "항목명", type: "text", width: "460px", align: "center" }
                ];
            }

            const colCountInp = document.getElementById('prop-grid-col-count');
            if (colCountInp) {
                colCountInp.value = colsList.length;
            }

            colsList.forEach((col, index) => {
                const isCheckbox = (col.type === 'checkbox');
                const isAction = (col.type === 'action');
                const isClickable = !isCheckbox && !isAction && (col.clickable === true);
                const parsedW = parseInt(col.width);
                const numericWidth = isNaN(parsedW) ? (isCheckbox ? 50 : (col.type === 'text' ? 200 : 100)) : parsedW;
                const align = col.align || ((col.type === 'number' || col.type === 'currency') ? 'right' : ((col.type === 'checkbox' || col.type === 'status' || col.type === 'action') ? 'center' : 'left'));

                const showStatusOptions = (col.type === 'status');
                const statusOptionsHtml = showStatusOptions ? `
                    <div style="display:flex; flex-direction:column; gap:2px; grid-column: span 3; margin-top: 4px;">
                        <label style="font-size: 8px; color: #94a3b8;">상태 옵션 설정 (쉼표로 구분)</label>
                        <input type="text" class="v4-prop-input grid-col-options-input" data-index="${index}" value="${col.options || '방송중, 방송예정, 방송종료'}" placeholder="예: 진행중, 완료, 대기" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px;">
                    </div>
                ` : '';

                const div = document.createElement('div');
                div.className = 'grid-col-card';
                div.setAttribute('data-clickable', isClickable ? 'true' : 'false');
                div.setAttribute('data-align', align);
                div.style.cssText = 'display:flex; flex-direction:column; gap:6px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <label style="font-size: 10px; color: #00e5ff; font-weight: bold;">COLUMN ${index + 1}</label>
                        <div style="display: flex; gap: 4px;">
                            <button class="v4-inspector-btn btn-move-col-up" data-index="${index}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="위로 이동" ${index === 0 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▲</button>
                            <button class="v4-inspector-btn btn-move-col-down" data-index="${index}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;" title="아래로 이동" ${index === colsList.length - 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>▼</button>
                            <button class="v4-inspector-btn btn-delete-col" data-index="${index}" style="height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; padding: 0; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; cursor: pointer;" title="삭제" ${colsList.length <= 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>&times;</button>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1.2fr 1fr 0.8fr; gap:6px;">
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <label style="font-size: 8px; color: #94a3b8;">항목타입</label>
                            <select class="v4-prop-input grid-col-type-select" data-index="${index}" style="width:100%; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 3px 4px; border-radius: 4px; font-size: 10px; outline:none; height:24px;">
                                <option value="checkbox" ${col.type === 'checkbox' ? 'selected' : ''}>체크박스</option>
                                <option value="number" ${col.type === 'number' ? 'selected' : ''}>번호/순번</option>
                                <option value="text" ${col.type === 'text' ? 'selected' : ''}>일반 텍스트</option>
                                <option value="currency" ${col.type === 'currency' ? 'selected' : ''}>금액/가격</option>
                                <option value="status" ${col.type === 'status' ? 'selected' : ''}>상태 뱃지</option>
                                <option value="badge" ${col.type === 'badge' ? 'selected' : ''}>태그 뱃지</option>
                                <option value="action" ${col.type === 'action' ? 'selected' : ''}>작업 버튼</option>
                                <option value="author" ${col.type === 'author' ? 'selected' : ''}>작성자/담당자</option>
                                <option value="datetime" ${col.type === 'datetime' ? 'selected' : ''}>일시/날짜</option>
                            </select>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <label style="font-size: 8px; color: #94a3b8;">항목명</label>
                            <input type="text" class="v4-prop-input grid-col-name-input" data-index="${index}" value="${isCheckbox ? '' : (col.name || '')}" ${isCheckbox ? 'disabled' : ''} style="width:100%; background: ${isCheckbox ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)'}; border: 1px solid ${isCheckbox ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}; color: ${isCheckbox ? '#64748b' : '#fff'}; padding: 4px 6px; border-radius: 4px; font-size: 11px;">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <label style="font-size: 8px; color: #94a3b8;">가로크기(px)</label>
                            <input type="number" min="10" max="1000" class="v4-prop-input grid-col-width-input" data-index="${index}" value="${numericWidth}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px;">
                        </div>
                        ${statusOptionsHtml}
                    </div>

                    <!-- Alignment Control -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:2px;">
                        <label style="font-size: 8px; color: #94a3b8;">텍스트 정렬 (Align)</label>
                        <div style="display: flex; gap: 4px;">
                            <button type="button" class="v4-inspector-btn btn-col-align btn-align-left" data-align="left" style="height: 18px; width: 22px; border-radius: 4px; font-size: 9px; padding: 0; cursor: pointer; ${align === 'left' ? 'background:rgba(0, 229, 255, 0.25); border:1px solid rgba(0, 229, 255, 0.6); color:#00e5ff; font-weight:bold;' : 'background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); color:#94a3b8;'}">좌</button>
                            <button type="button" class="v4-inspector-btn btn-col-align btn-align-center" data-align="center" style="height: 18px; width: 22px; border-radius: 4px; font-size: 9px; padding: 0; cursor: pointer; ${align === 'center' ? 'background:rgba(0, 229, 255, 0.25); border:1px solid rgba(0, 229, 255, 0.6); color:#00e5ff; font-weight:bold;' : 'background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); color:#94a3b8;'}">중</button>
                            <button type="button" class="v4-inspector-btn btn-col-align btn-align-right" data-align="right" style="height: 18px; width: 22px; border-radius: 4px; font-size: 9px; padding: 0; cursor: pointer; ${align === 'right' ? 'background:rgba(0, 229, 255, 0.25); border:1px solid rgba(0, 229, 255, 0.6); color:#00e5ff; font-weight:bold;' : 'background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); color:#94a3b8;'}">우</button>
                        </div>
                    </div>

                    <!-- Clickable Control -->
                    <div class="grid-clickable-wrapper" style="display:${isCheckbox || isAction ? 'none' : 'flex'}; align-items:center; justify-content:space-between; margin-top:2px; padding-top:4px; border-top:1px dashed rgba(255,255,255,0.06);">
                        <label style="font-size: 8px; color: #94a3b8;">Clickable (링크 스타일)</label>
                        <div style="display: flex; gap: 4px;">
                            <button class="v4-inspector-btn btn-col-clickable-y" data-index="${index}" style="height: 18px; width: 28px; border-radius: 9px; font-size: 9px; padding: 0; cursor: pointer; ${isClickable ? 'background:rgba(0, 229, 255, 0.25); border:1px solid rgba(0, 229, 255, 0.6); color:#00e5ff; font-weight:bold;' : 'background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); color:#94a3b8;'}">Y</button>
                            <button class="v4-inspector-btn btn-col-clickable-n" data-index="${index}" style="height: 18px; width: 28px; border-radius: 9px; font-size: 9px; padding: 0; cursor: pointer; ${!isClickable ? 'background:rgba(0, 229, 255, 0.25); border:1px solid rgba(0, 229, 255, 0.6); color:#00e5ff; font-weight:bold;' : 'background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); color:#94a3b8;'}">N</button>
                        </div>
                    </div>
                `;
                container.appendChild(div);

                const nameInp = div.querySelector('.grid-col-name-input');
                const typeSel = div.querySelector('.grid-col-type-select');
                const widthInp = div.querySelector('.grid-col-width-input');
                const optionsInp = div.querySelector('.grid-col-options-input');
                const btnUp = div.querySelector('.btn-move-col-up');
                const btnDown = div.querySelector('.btn-move-col-down');
                const btnDelete = div.querySelector('.btn-delete-col');
                const clickableWrap = div.querySelector('.grid-clickable-wrapper');
                const btnClickableY = div.querySelector('.btn-col-clickable-y');
                const btnClickableN = div.querySelector('.btn-col-clickable-n');
                const alignBtns = div.querySelectorAll('.btn-col-align');

                const getCurrentColsFromInputs = () => {
                    const cards = Array.from(container.querySelectorAll('.grid-col-card'));
                    return cards.map((cCard) => {
                        const inp = cCard.querySelector('.grid-col-name-input');
                        const tSel = cCard.querySelector('.grid-col-type-select');
                        const wInp = cCard.querySelector('.grid-col-width-input');
                        const oInp = cCard.querySelector('.grid-col-options-input');
                        const t = tSel ? tSel.value : 'text';
                        const wVal = wInp ? (parseInt(wInp.value) || 100) : 100;
                        const oVal = oInp ? oInp.value : '';
                        const clickableVal = cCard.getAttribute('data-clickable') === 'true';
                        const colAlign = cCard.getAttribute('data-align') || 'center';
                        return {
                            name: t === 'checkbox' ? '' : (inp ? inp.value : ''),
                            type: t,
                            width: wVal + 'px',
                            options: oVal,
                            clickable: (t === 'checkbox' || t === 'action') ? false : clickableVal,
                            align: colAlign
                        };
                    });
                };

                const triggerColUpdate = () => {
                    const currentCols = getCurrentColsFromInputs();
                    notifyGrid({ columns: currentCols });
                };

                // Align buttons
                alignBtns.forEach(btn => {
                    btn.onclick = () => {
                        const targetAlign = btn.getAttribute('data-align');
                        div.setAttribute('data-align', targetAlign);
                        alignBtns.forEach(b => {
                            const isSelected = (b === btn);
                            b.style.background = isSelected ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                            b.style.borderColor = isSelected ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)';
                            b.style.color = isSelected ? '#00e5ff' : '#94a3b8';
                            b.style.fontWeight = isSelected ? 'bold' : 'normal';
                        });
                        triggerColUpdate();
                    };
                });

                if (btnClickableY && btnClickableN) {
                    btnClickableY.onclick = () => {
                        div.setAttribute('data-clickable', 'true');
                        highlightActive(btnClickableY, true);
                        highlightActive(btnClickableN, false);
                        triggerColUpdate();
                    };
                    btnClickableN.onclick = () => {
                        div.setAttribute('data-clickable', 'false');
                        highlightActive(btnClickableN, true);
                        highlightActive(btnClickableY, false);
                        triggerColUpdate();
                    };
                }

                if (btnUp && index > 0) {
                    btnUp.onclick = () => {
                        const currentCols = getCurrentColsFromInputs();
                        const temp = currentCols[index];
                        currentCols[index] = currentCols[index - 1];
                        currentCols[index - 1] = temp;
                        this.renderColumnCards(currentCols);
                        notifyGrid({ columns: currentCols });
                    };
                }

                if (btnDown && index < colsList.length - 1) {
                    btnDown.onclick = () => {
                        const currentCols = getCurrentColsFromInputs();
                        const temp = currentCols[index];
                        currentCols[index] = currentCols[index + 1];
                        currentCols[index + 1] = temp;
                        this.renderColumnCards(currentCols);
                        notifyGrid({ columns: currentCols });
                    };
                }

                if (btnDelete) {
                    btnDelete.onclick = () => {
                        const currentCols = getCurrentColsFromInputs();
                        if (currentCols.length <= 1) return;
                        currentCols.splice(index, 1);
                        this.renderColumnCards(currentCols);
                        notifyGrid({ columns: currentCols });
                        if (colCountInp) colCountInp.value = currentCols.length;
                    };
                }

                if (nameInp) nameInp.oninput = triggerColUpdate;
                if (widthInp) widthInp.oninput = triggerColUpdate;
                if (optionsInp) optionsInp.oninput = triggerColUpdate;

                if (typeSel) {
                    typeSel.onchange = () => {
                        const t = typeSel.value;
                        let defaultW = 120;
                        let defaultAlign = 'center';
                        if (t === 'checkbox') { defaultW = 50; defaultAlign = 'center'; }
                        else if (t === 'number') { defaultW = 80; defaultAlign = 'center'; }
                        else if (t === 'currency') { defaultW = 120; defaultAlign = 'right'; }
                        else if (t === 'text') { defaultW = 200; defaultAlign = 'center'; }
                        else if (t === 'status') { defaultW = 110; defaultAlign = 'center'; }
                        else if (t === 'badge') { defaultW = 100; defaultAlign = 'center'; }
                        else if (t === 'action') { defaultW = 90; defaultAlign = 'center'; }
                        else if (t === 'author') { defaultW = 110; defaultAlign = 'left'; }
                        else if (t === 'datetime') { defaultW = 160; defaultAlign = 'center'; }

                        widthInp.value = defaultW;
                        div.setAttribute('data-align', defaultAlign);
                        
                        if (t === 'checkbox') {
                            nameInp.value = '';
                            nameInp.disabled = true;
                            nameInp.style.background = 'rgba(0,0,0,0.15)';
                            nameInp.style.borderColor = 'rgba(255,255,255,0.05)';
                            nameInp.style.color = '#64748b';
                            if (clickableWrap) clickableWrap.style.display = 'none';
                            div.setAttribute('data-clickable', 'false');
                        } else if (t === 'action') {
                            nameInp.disabled = false;
                            nameInp.value = nameInp.value || '관리';
                            nameInp.style.background = 'rgba(0,0,0,0.3)';
                            nameInp.style.borderColor = 'rgba(255,255,255,0.1)';
                            nameInp.style.color = '#fff';
                            if (clickableWrap) clickableWrap.style.display = 'none';
                            div.setAttribute('data-clickable', 'false');
                        } else {
                            nameInp.disabled = false;
                            nameInp.style.background = 'rgba(0,0,0,0.3)';
                            nameInp.style.borderColor = 'rgba(255,255,255,0.1)';
                            nameInp.style.color = '#fff';
                            if (clickableWrap) clickableWrap.style.display = 'flex';
                        }
                        
                        const updatedCols = getCurrentColsFromInputs();
                        notifyGrid({ columns: updatedCols });
                        this.renderColumnCards(updatedCols);
                    };
                }
            });
        },

        bindEvents: function() {
            const rowCountInp = document.getElementById('prop-grid-row-count');
            const rowHeightInp = document.getElementById('prop-grid-row-height');
            const bgColorInp = document.getElementById('grid-bg-color');
            const bgNoneBtn = document.getElementById('btn-grid-bg-none');
            const borderColorInp = document.getElementById('grid-border-color');
            const borderNoneBtn = document.getElementById('btn-grid-border-none');
            const paginationY = document.getElementById('btn-grid-pagination-y');
            const paginationN = document.getElementById('btn-grid-pagination-n');
            const zebraY = document.getElementById('btn-grid-zebra-y');
            const zebraN = document.getElementById('btn-grid-zebra-n');
            const presetSel = document.getElementById('prop-grid-preset');

            const sec = document.getElementById('grid-inspector-section');
            if (sec) {
                const wInp = sec.querySelector('.v4-prop-input[data-prop="width"]');
                const hInp = sec.querySelector('.v4-prop-input[data-prop="height"]');
                if (wInp) {
                    const updateW = () => {
                        const val = parseInt(wInp.value) || 100;
                        notifyGrid({ width: val });
                    };
                    wInp.oninput = updateW;
                    wInp.onchange = updateW;
                }
                if (hInp) {
                    const updateH = () => {
                        const val = parseInt(hInp.value) || 100;
                        notifyGrid({ height: val });
                    };
                    hInp.oninput = updateH;
                    hInp.onchange = updateH;
                }
            }

            if (presetSel) {
                presetSel.onchange = () => {
                    const pVal = presetSel.value;
                    if (pVal) {
                        notifyGrid({ preset: pVal });
                    }
                };
            }

            if (zebraY) {
                zebraY.onclick = () => {
                    highlightActive(zebraY, true);
                    highlightActive(zebraN, false);
                    notifyGrid({ zebra: true });
                };
            }
            if (zebraN) {
                zebraN.onclick = () => {
                    highlightActive(zebraN, true);
                    highlightActive(zebraY, false);
                    notifyGrid({ zebra: false });
                };
            }

            const colMinusBtn = document.getElementById('btn-grid-col-minus');
            const colPlusBtn = document.getElementById('btn-grid-col-plus');
            const colAddBtn = document.getElementById('btn-grid-add-col');

            if (colMinusBtn) {
                colMinusBtn.onclick = () => {
                    const container = document.getElementById('grid-columns-container');
                    if (!container) return;
                    const cards = Array.from(container.querySelectorAll('.grid-col-card'));
                    if (cards.length <= 1) return;
                    
                    const updatedCols = cards.slice(0, -1).map((cCard) => {
                        const inp = cCard.querySelector('.grid-col-name-input');
                        const tSel = cCard.querySelector('.grid-col-type-select');
                        const wInp = cCard.querySelector('.grid-col-width-input');
                        const oInp = cCard.querySelector('.grid-col-options-input');
                        const t = tSel ? tSel.value : 'text';
                        const wVal = wInp ? (parseInt(wInp.value) || 100) : 100;
                        const oVal = oInp ? oInp.value : '';
                        const clickableVal = cCard.getAttribute('data-clickable') === 'true';
                        const colAlign = cCard.getAttribute('data-align') || 'center';
                        return { name: inp ? inp.value : '', type: t, width: wVal + 'px', options: oVal, clickable: (t === 'checkbox' || t === 'action') ? false : clickableVal, align: colAlign };
                    });
                    notifyGrid({ columns: updatedCols });
                    this.renderColumnCards(updatedCols);
                    const colCountInp = document.getElementById('prop-grid-col-count');
                    if (colCountInp) colCountInp.value = updatedCols.length;
                };
            }

            if (colAddBtn || colPlusBtn) {
                const addHandler = () => {
                    const container = document.getElementById('grid-columns-container');
                    if (!container) return;
                    const cards = Array.from(container.querySelectorAll('.grid-col-card'));
                    if (cards.length >= 20) {
                        alert('열은 최대 20개까지 추가할 수 있습니다.');
                        return;
                    }
                    
                    const updatedCols = cards.map((cCard) => {
                        const inp = cCard.querySelector('.grid-col-name-input');
                        const tSel = cCard.querySelector('.grid-col-type-select');
                        const wInp = cCard.querySelector('.grid-col-width-input');
                        const oInp = cCard.querySelector('.grid-col-options-input');
                        const t = tSel ? tSel.value : 'text';
                        const wVal = wInp ? (parseInt(wInp.value) || 100) : 100;
                        const oVal = oInp ? oInp.value : '';
                        const clickableVal = cCard.getAttribute('data-clickable') === 'true';
                        const colAlign = cCard.getAttribute('data-align') || 'center';
                        return { name: inp ? inp.value : '', type: t, width: wVal + 'px', options: oVal, clickable: (t === 'checkbox' || t === 'action') ? false : clickableVal, align: colAlign };
                    });
                    updatedCols.push({
                        name: '항목명',
                        type: 'text',
                        width: '120px',
                        clickable: false,
                        align: 'center'
                    });
                    notifyGrid({ columns: updatedCols });
                    this.renderColumnCards(updatedCols);
                    const colCountInp = document.getElementById('prop-grid-col-count');
                    if (colCountInp) colCountInp.value = updatedCols.length;
                };
                if (colAddBtn) colAddBtn.onclick = addHandler;
                if (colPlusBtn) colPlusBtn.onclick = addHandler;
            }

            if (paginationY) {
                paginationY.onclick = () => {
                    highlightActive(paginationY, true);
                    highlightActive(paginationN, false);
                    notifyGrid({ pagination: true });
                };
            }
            if (paginationN) {
                paginationN.onclick = () => {
                    highlightActive(paginationN, true);
                    highlightActive(paginationY, false);
                    notifyGrid({ pagination: false });
                };
            }

            if (rowCountInp) {
                const updateRowCount = () => {
                    const val = parseInt(rowCountInp.value) || 5;
                    notifyGrid({ rowCount: val });
                };
                rowCountInp.oninput = updateRowCount;
                rowCountInp.onchange = updateRowCount;
            }

            if (rowHeightInp) {
                const updateRowHeight = () => {
                    const val = parseInt(rowHeightInp.value) || 40;
                    notifyGrid({ rowHeight: val });
                };
                rowHeightInp.oninput = updateRowHeight;
                rowHeightInp.onchange = updateRowHeight;
            }

            if (bgColorInp) {
                bgColorInp.onchange = () => {
                    const wrapper = document.getElementById('grid-bg-wrapper');
                    if (wrapper) wrapper.classList.remove('transparent-active');
                    notifyGrid({ bg: bgColorInp.value });
                };
            }

            if (bgNoneBtn) {
                bgNoneBtn.onclick = () => {
                    const wrapper = document.getElementById('grid-bg-wrapper');
                    if (wrapper) wrapper.classList.add('transparent-active');
                    notifyGrid({ bg: 'transparent' });
                };
            }

            if (borderColorInp) {
                borderColorInp.onchange = () => {
                    const wrapper = document.getElementById('grid-border-wrapper');
                    if (wrapper) wrapper.classList.remove('transparent-active');
                    notifyGrid({ border: borderColorInp.value });
                };
            }

            if (borderNoneBtn) {
                borderNoneBtn.onclick = () => {
                    const wrapper = document.getElementById('grid-border-wrapper');
                    if (wrapper) wrapper.classList.add('transparent-active');
                    notifyGrid({ border: 'transparent' });
                };
            }
        }
    };

    // Global aliases for full backward compatibility
    window.syncGridHeaderInputs = function(columns, headers) {
        if (window.InspectorGrid && window.InspectorGrid.renderColumnCards) {
            window.InspectorGrid.renderColumnCards(columns, headers);
        }
    };
    window._syncGridProps = function(comp) {
        window.InspectorGrid.sync(comp);
    };
    window.initGridEvents = function() {
        window.InspectorGrid.bindEvents();
    };
})();

