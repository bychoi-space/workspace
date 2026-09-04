/**
 * assets/inspector/inspector_grid.js
 * Domain Inspector Module: Grid Table
 * Encapsulates both state synchronization (Read) and event handling (Write).
 */
(function() {
    console.log("[Inspector Grid] Domain module loaded.");

    window.InspectorGrid = {
        sync: function(comp) {
            if (!comp) return;
            const rowCountInp = document.getElementById('prop-grid-row-count');
            const paginationY = document.getElementById('btn-grid-pagination-y');
            const paginationN = document.getElementById('btn-grid-pagination-n');
            
            if (rowCountInp && comp.gridRowCount !== undefined) {
                rowCountInp.value = comp.gridRowCount;
            }
            
            const rowHeightInp = document.getElementById('prop-grid-row-height');
            if (rowHeightInp && comp.gridRowHeight !== undefined) {
                rowHeightInp.value = comp.gridRowHeight;
            }
            
            const highlightActive = (btn, isActive) => {
                if (!btn) return;
                btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
                btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
                btn.style.fontWeight = isActive ? 'bold' : 'normal';
            };

            if (paginationY && paginationN) {
                highlightActive(paginationY, comp.gridShowPagination === true);
                highlightActive(paginationN, comp.gridShowPagination === false);
            }
            
            if (typeof window.syncGridHeaderInputs === 'function') {
                window.syncGridHeaderInputs(comp.gridColumns || [], comp.gridHeaders || []);
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
        },

        bindEvents: function() {
            const rowCountInp = document.getElementById('prop-grid-row-count');
            const bgColorInp = document.getElementById('grid-bg-color');
            const bgNoneBtn = document.getElementById('btn-grid-bg-none');
            const borderColorInp = document.getElementById('grid-border-color');
            const borderNoneBtn = document.getElementById('btn-grid-border-none');
            const paginationY = document.getElementById('btn-grid-pagination-y');
            const paginationN = document.getElementById('btn-grid-pagination-n');

            const colMinusBtn = document.getElementById('btn-grid-col-minus');
            const colPlusBtn = document.getElementById('btn-grid-col-plus');
            const colAddBtn = document.getElementById('btn-grid-add-col');

            const notifyGrid = (data) => {
                if (window.EditorBus) {
                    window.EditorBus.sendToIframe(Object.assign({ type: 'LF_UPDATE_GRID_PROPERTIES' }, data));
                } else {
                    const iframe = document.getElementById('main-iframe');
                    if (iframe && iframe.contentWindow && window.MessageHub) {
                        window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_GRID_PROPERTIES', data);
                    }
                }
            };

            const highlightActive = (btn, isActive) => {
                if (!btn) return;
                btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
                btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
                btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
                btn.style.fontWeight = isActive ? 'bold' : 'normal';
            };

            if (colMinusBtn) {
                colMinusBtn.onclick = () => {
                    const container = document.getElementById('grid-columns-container');
                    if (!container) return;
                    const nameInputs = Array.from(container.querySelectorAll('.grid-col-name-input'));
                    if (nameInputs.length <= 1) return;
                    
                    const updatedCols = nameInputs.slice(0, -1).map((inp) => {
                        const idx = inp.getAttribute('data-index');
                        const typeSel = container.querySelector('.grid-col-type-select[data-index="' + idx + '"]');
                        const widthInp = container.querySelector('.grid-col-width-input[data-index="' + idx + '"]');
                        const optionsInp = container.querySelector('.grid-col-options-input[data-index="' + idx + '"]');
                        const t = typeSel ? typeSel.value : 'text';
                        const wVal = widthInp ? (parseInt(widthInp.value) || 100) : 100;
                        const oVal = optionsInp ? optionsInp.value : '';
                        return { name: inp.value, type: t, width: wVal + 'px', options: oVal };
                    });
                    notifyGrid({ columns: updatedCols });
                    if (typeof window.syncGridHeaderInputs === 'function') {
                        window.syncGridHeaderInputs(updatedCols, []);
                    }
                    const colCountInp = document.getElementById('prop-grid-col-count');
                    if (colCountInp) {
                        colCountInp.value = updatedCols.length;
                    }
                };
            }

            if (colAddBtn) {
                colAddBtn.onclick = () => {
                    const container = document.getElementById('grid-columns-container');
                    if (!container) return;
                    const nameInputs = Array.from(container.querySelectorAll('.grid-col-name-input'));
                    if (nameInputs.length >= 10) return;
                    
                    const updatedCols = nameInputs.map((inp) => {
                        const idx = inp.getAttribute('data-index');
                        const typeSel = container.querySelector('.grid-col-type-select[data-index="' + idx + '"]');
                        const widthInp = container.querySelector('.grid-col-width-input[data-index="' + idx + '"]');
                        const optionsInp = container.querySelector('.grid-col-options-input[data-index="' + idx + '"]');
                        const t = typeSel ? typeSel.value : 'text';
                        const wVal = widthInp ? (parseInt(widthInp.value) || 100) : 100;
                        const oVal = optionsInp ? optionsInp.value : '';
                        return { name: inp.value, type: t, width: wVal + 'px', options: oVal };
                    });
                    updatedCols.push({
                        name: '새 항목',
                        type: 'text',
                        width: '200px'
                    });
                    notifyGrid({ columns: updatedCols });
                    if (typeof window.syncGridHeaderInputs === 'function') {
                        window.syncGridHeaderInputs(updatedCols, []);
                    }
                    const colCountInp = document.getElementById('prop-grid-col-count');
                    if (colCountInp) {
                        colCountInp.value = updatedCols.length;
                    }
                };
            }

            if (colPlusBtn) {
                colPlusBtn.onclick = () => {
                    const container = document.getElementById('grid-columns-container');
                    if (!container) return;
                    const nameInputs = Array.from(container.querySelectorAll('.grid-col-name-input'));
                    if (nameInputs.length >= 10) return;
                    
                    const updatedCols = nameInputs.map((inp) => {
                        const idx = inp.getAttribute('data-index');
                        const typeSel = container.querySelector('.grid-col-type-select[data-index="' + idx + '"]');
                        const widthInp = container.querySelector('.grid-col-width-input[data-index="' + idx + '"]');
                        const optionsInp = container.querySelector('.grid-col-options-input[data-index="' + idx + '"]');
                        const t = typeSel ? typeSel.value : 'text';
                        const wVal = widthInp ? (parseInt(widthInp.value) || 100) : 100;
                        const oVal = optionsInp ? optionsInp.value : '';
                        return { name: inp.value, type: t, width: wVal + 'px', options: oVal };
                    });
                    updatedCols.push({
                        name: '새 항목',
                        type: 'text',
                        width: '200px'
                    });
                    notifyGrid({ columns: updatedCols });
                    if (typeof window.syncGridHeaderInputs === 'function') {
                        window.syncGridHeaderInputs(updatedCols, []);
                    }
                    const colCountInp = document.getElementById('prop-grid-col-count');
                    if (colCountInp) {
                        colCountInp.value = updatedCols.length;
                    }
                };
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
                rowCountInp.oninput = () => {
                    const val = parseInt(rowCountInp.value) || 5;
                    notifyGrid({ rowCount: val });
                };
            }

            const rowHeightInp = document.getElementById('prop-grid-row-height');
            if (rowHeightInp) {
                rowHeightInp.oninput = () => {
                    const val = parseInt(rowHeightInp.value) || 50;
                    notifyGrid({ rowHeight: val });
                };
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

    // Global alias for compatibility
    window._syncGridProps = function(comp) {
        window.InspectorGrid.sync(comp);
    };
    window.initGridEvents = function() {
        window.InspectorGrid.bindEvents();
    };
})();
