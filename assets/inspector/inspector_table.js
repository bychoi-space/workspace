/**
 * assets/inspector/inspector_table.js
 * Domain Inspector Module: Table & Cell Component
 * Encapsulates Table actions (Add/Del Row/Col, Merge/Split, Layout),
 * Cell dimensions (width/height), styles (bg, text color, borders, align),
 * and LF_CELL_SELECTED state synchronization.
 */
(function() {
    'use strict';

    console.log("[Inspector Table] Domain module loaded.");

    const notifyIframe = (data) => {
        if (typeof window.notifyIframe === 'function') {
            window.notifyIframe(data);
        } else {
            const iframe = document.getElementById('main-iframe') || document.getElementById('screen-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(data, '*');
            }
        }
    };

    // --- 1. Cell Alignment UI ---
    function updateCellAlignButtonsUI(align) {
        const btnLeft = document.getElementById('btn-cell-align-left');
        const btnCenter = document.getElementById('btn-cell-align-center');
        const btnRight = document.getElementById('btn-cell-align-right');
        if (!btnLeft || !btnCenter || !btnRight) return;

        highlightActive(btnLeft, align === 'left');
        highlightActive(btnCenter, align === 'center');
        highlightActive(btnRight, align === 'right');
    }

    // --- 2. Cell Dimensions (Width & Height) ---
    function updateCellWidth(val) {
        const numVal = parseInt(val, 10);
        if (isNaN(numVal) || numVal < 10) return;
        notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', width: numVal });
        
        const cellColWidthEl = document.getElementById('cell-col-width');
        const cellColWidthNumEl = document.getElementById('cell-col-width-num');
        const txt = document.getElementById('txt-cell-col-width');
        
        if (cellColWidthEl && cellColWidthEl.value != numVal) cellColWidthEl.value = numVal;
        if (cellColWidthNumEl && cellColWidthNumEl.value != numVal) cellColWidthNumEl.value = numVal;
        if (txt) txt.innerText = numVal;
    }

    function updateCellHeight(val) {
        const numVal = parseInt(val, 10);
        if (isNaN(numVal) || numVal < 10) return;
        notifyIframe({ type: 'LF_UPDATE_CELL_DIMENSION', height: numVal });
        
        const cellRowHeightEl = document.getElementById('cell-row-height');
        const cellRowHeightNumEl = document.getElementById('cell-row-height-num');
        const txt = document.getElementById('txt-cell-row-height');
        
        if (cellRowHeightEl && cellRowHeightEl.value != numVal) cellRowHeightEl.value = numVal;
        if (cellRowHeightNumEl && cellRowHeightNumEl.value != numVal) cellRowHeightNumEl.value = numVal;
        if (txt) txt.innerText = numVal;
    }

    // --- 3. Cell Borders Helper ---
    function getTableBorderColor() {
        const el = document.getElementById('table-border-color');
        return (el && el.value) ? el.value : '#475569';
    }

    // --- 4. Synchronize Selected Cell Data from Iframe ---
    function syncCellData(cellData) {
        const mergeBtn = document.getElementById('btn-merge-cells');
        const splitBtn = document.getElementById('btn-split-cells');

        if (cellData) {
            const cd = cellData;

            // Background color
            const bgPicker = document.getElementById('cell-bg-color');
            const bgWrapper = document.getElementById('cell-bg-wrapper');
            const isBgTransparent = cd.backgroundColor === 'transparent' || cd.backgroundColor === 'rgba(0, 0, 0, 0)' || cd.backgroundColor === '';
            
            if (bgPicker) {
                if (isBgTransparent) {
                    bgPicker.value = '#ffffff';
                } else {
                    bgPicker.value = (window.rgbToHex && window.rgbToHex(cd.backgroundColor)) || cd.backgroundColor || '#ffffff';
                }
            }
            if (bgWrapper) bgWrapper.classList.toggle('transparent-active', isBgTransparent);

            // Text color
            const textPicker = document.getElementById('cell-text-color');
            if (textPicker && cd.color) {
                textPicker.value = (window.rgbToHex && window.rgbToHex(cd.color)) || cd.color;
            }

            // Width
            if (cd.width) {
                const widthInput = document.getElementById('cell-col-width');
                const widthNumInput = document.getElementById('cell-col-width-num');
                const txt = document.getElementById('txt-cell-col-width');
                if (widthInput) widthInput.value = cd.width;
                if (widthNumInput) widthNumInput.value = cd.width;
                if (txt) txt.innerText = cd.width;
            }

            // Height
            if (cd.height) {
                const heightInput = document.getElementById('cell-row-height');
                const heightNumInput = document.getElementById('cell-row-height-num');
                const txt = document.getElementById('txt-cell-row-height');
                if (heightInput) heightInput.value = cd.height;
                if (heightNumInput) heightNumInput.value = cd.height;
                if (txt) txt.innerText = cd.height;
            }

            // Text alignment
            if (cd.textAlign) {
                updateCellAlignButtonsUI(cd.textAlign);
            }

            // Merge & Split buttons state
            if (mergeBtn) {
                const canMerge = (cd.count >= 2);
                mergeBtn.disabled = !canMerge;
                mergeBtn.style.opacity = canMerge ? '1' : '0.5';
                mergeBtn.style.cursor = canMerge ? 'pointer' : 'not-allowed';
            }
            if (splitBtn) {
                const canSplit = (cd.count >= 1);
                splitBtn.disabled = !canSplit;
                splitBtn.style.opacity = canSplit ? '1' : '0.5';
                splitBtn.style.cursor = canSplit ? 'pointer' : 'not-allowed';
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

    // --- 5. Event Bindings ---
    let eventsBound = false;
    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        // Cell Background Color & Text Color
        const cellBgColor = document.getElementById('cell-bg-color');
        if (cellBgColor) {
            cellBgColor.addEventListener('input', function() {
                const wrapper = document.getElementById('cell-bg-wrapper');
                if (wrapper) wrapper.classList.remove('transparent-active');
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { backgroundColor: this.value } });
            });
        }

        const cellTextColor = document.getElementById('cell-text-color');
        if (cellTextColor) {
            cellTextColor.addEventListener('input', function() {
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { color: this.value } });
            });
        }

        const btnCellBgNone = document.getElementById('btn-cell-bg-none');
        if (btnCellBgNone) {
            btnCellBgNone.onclick = function() {
                const wrapper = document.getElementById('cell-bg-wrapper');
                if (wrapper) wrapper.classList.add('transparent-active');
                notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { backgroundColor: 'transparent' } });
            };
        }

        // Cell Width slider & number inputs
        const cellColWidthEl = document.getElementById('cell-col-width');
        if (cellColWidthEl) {
            cellColWidthEl.addEventListener('input', function() { updateCellWidth(this.value); });
        }
        const cellColWidthNumEl = document.getElementById('cell-col-width-num');
        if (cellColWidthNumEl) {
            cellColWidthNumEl.addEventListener('input', function() { updateCellWidth(this.value); });
        }

        // Cell Height slider & number inputs
        const cellRowHeightEl = document.getElementById('cell-row-height');
        if (cellRowHeightEl) {
            cellRowHeightEl.addEventListener('input', function() { updateCellHeight(this.value); });
        }
        const cellRowHeightNumEl = document.getElementById('cell-row-height-num');
        if (cellRowHeightNumEl) {
            cellRowHeightNumEl.addEventListener('input', function() { updateCellHeight(this.value); });
        }

        // Cell Border buttons
        const borderMap = {
            'btn-cell-border-all': 'all',
            'btn-cell-border-none': 'none',
            'btn-cell-border-top': 'top',
            'btn-cell-border-bottom': 'bottom',
            'btn-cell-border-left': 'left',
            'btn-cell-border-right': 'right'
        };
        Object.keys(borderMap).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', function() {
                    const color = getTableBorderColor();
                    notifyIframe({ type: 'LF_UPDATE_CELL_BORDER', borderType: borderMap[btnId], color: color });
                });
            }
        });

        // Table Action buttons
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
                btn.onclick = function() {
                    const fontSize = document.getElementById('table-font-size')?.value;
                    notifyIframe({ type: 'LF_TABLE_ACTION', action: conf.action, fontSize: fontSize });
                };
            }
        });
    }

    // Global click delegation for cell alignment buttons (in case inspector is redrawn)
    document.addEventListener('click', function(e) {
        if (!e.target) return;
        const btn = e.target.closest('#btn-cell-align-left, #btn-cell-align-center, #btn-cell-align-right');
        if (btn) {
            let align = 'left';
            if (btn.id === 'btn-cell-align-center') align = 'center';
            if (btn.id === 'btn-cell-align-right') align = 'right';
            notifyIframe({ type: 'LF_UPDATE_CELL_STYLE', style: { textAlign: align } });
            updateCellAlignButtonsUI(align);
        }
    });

    // Global input delegation for cell col width & row height inputs (ensures dynamic DOM support)
    document.addEventListener('input', function(e) {
        if (!e.target) return;
        const id = e.target.id;
        if (id === 'cell-col-width' || id === 'cell-col-width-num') {
            updateCellWidth(e.target.value);
        } else if (id === 'cell-row-height' || id === 'cell-row-height-num') {
            updateCellHeight(e.target.value);
        }
    });

    // PostMessage listener for LF_CELL_SELECTED
    window.addEventListener('message', function(e) {
        const data = e.data;
        if (!data) return;
        if (data.type === 'LF_CELL_SELECTED') {
            syncCellData(data.cellData);
        }
    });

    // --- 6. Module API & Exports ---
    window.InspectorTable = {
        syncCellData: syncCellData,
        updateCellWidth: updateCellWidth,
        updateCellHeight: updateCellHeight,
        updateCellAlignButtonsUI: updateCellAlignButtonsUI,
        bindEvents: bindEvents
    };

    window._updateCellAlignButtonsUI = updateCellAlignButtonsUI;

    // Auto-bind on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindEvents);
    } else {
        bindEvents();
    }
})();
