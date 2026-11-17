/**
 * assets/vctrl_design_system_shapes_tables.js
 * Legacy Coordinate/Icon Migration, SVG Vector Shape/Arrow Enforcement, Table/Grid Stroke Enforcement & IA Tree Table Engine (Iframe Side).
 * Split from vctrl_design_system.js for Single Responsibility & modularity.
 *
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4DesignSystemShapesTablesScript).
 * 1. DO NOT use inner backticks or template interpolation inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 */

window.v4DesignSystemShapesTablesScript = `
(function() {
    const _sendParentMsg = function(payload) {
        if (typeof window.notifyParent === 'function') {
            window.notifyParent(payload);
        } else if (window.parent) {
            window.parent.postMessage(payload, '*');
        }
    };

    const migrateLegacyCoordsAndIcons = function() {
        const targetPageEl = document.querySelector('.page') || document.querySelector('.artboard') || document.body;
        const curCanvasW = targetPageEl ? (targetPageEl.offsetWidth || 1600) : 1600;
        const curCanvasH = targetPageEl ? (targetPageEl.offsetHeight || 900) : 900;

        document.querySelectorAll('.bychoi-component').forEach(function(c) {
            if (c.parentElement !== document.body) return;
            const lStr = c.style.left || "";
            const tStr = c.style.top || "";

            if (lStr.includes('%')) {
                const val = parseFloat(lStr);
                const px = (val / 100) * curCanvasW;
                c.style.left = px + 'px';
                console.log("[V4 Migration] Migrated " + c.id + " left: " + lStr + " -> " + c.style.left);
            }
            if (tStr.includes('%')) {
                const val = parseFloat(tStr);
                const px = (val / 100) * curCanvasH;
                c.style.top = px + 'px';
                console.log("[V4 Migration] Migrated " + c.id + " top: " + tStr + " -> " + c.style.top);
            }
        });

        document.querySelectorAll('.bychoi-component img').forEach(function(img) {
            const parent = img.parentElement;
            if (!parent) return;

            const isLogo = img.classList.contains('v4-logo-img');
            const isShare = img.src && img.src.includes('iconShare');
            const isIcon = img.classList.contains('bychoi-icon');

            if (isLogo || isShare || isIcon) {
                const div = document.createElement('div');
                div.className = img.className;
                if (!div.classList.contains('bychoi-icon')) {
                    div.classList.add('bychoi-icon');
                }

                const origSrc = img.getAttribute('data-original-src') || img.src;
                div.setAttribute('data-original-src', origSrc);

                const origBg = img.getAttribute('data-original-bg');
                if (origBg) div.setAttribute('data-original-bg', origBg);

                div.style.cssText = img.style.cssText;
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.pointerEvents = 'none';

                if (!isLogo) {
                    div.style.setProperty('padding', '8px', 'important');
                    div.style.setProperty('box-sizing', 'border-box', 'important');
                    div.style.setProperty('background-origin', 'content-box', 'important');
                    div.style.setProperty('background-clip', 'content-box', 'important');
                    div.style.setProperty('mask-origin', 'content-box', 'important');
                    div.style.setProperty('webkit-mask-origin', 'content-box', 'important');
                    div.style.setProperty('mask-clip', 'content-box', 'important');
                    div.style.setProperty('webkit-mask-clip', 'content-box', 'important');
                }

                const isColored = img.style.backgroundColor || img.getAttribute('data-original-bg');
                if (isColored) {
                    const color = img.style.backgroundColor || '';
                    div.style.setProperty('background-color', color, 'important');
                    div.style.setProperty('background-image', 'none', 'important');

                    const bgUrl = 'url("' + origSrc + '")';
                    div.setAttribute('data-original-bg', bgUrl);
                    div.style.setProperty('webkit-mask-image', bgUrl, 'important');
                    div.style.setProperty('webkit-mask-position', 'center', 'important');
                    div.style.setProperty('webkit-mask-size', 'contain', 'important');
                    div.style.setProperty('webkit-mask-repeat', 'no-repeat', 'important');

                    div.style.setProperty('mask-image', bgUrl, 'important');
                    div.style.setProperty('mask-position', 'center', 'important');
                    div.style.setProperty('mask-size', 'contain', 'important');
                    div.style.setProperty('mask-repeat', 'no-repeat', 'important');
                } else {
                    div.style.setProperty('background-image', 'url("' + origSrc + '")', 'important');
                    div.style.setProperty('background-size', 'contain', 'important');
                    div.style.setProperty('background-position', 'center', 'important');
                    div.style.setProperty('background-repeat', 'no-repeat', 'important');
                }

                parent.replaceChild(div, img);
                console.log("[V4 Migration] Migrated image icon/logo to div element:", origSrc);
            }
        });
    };

    const enforceShapesAndArrows = function() {
        window.buildArrowPath = function(width, height, dir) {
            const w = Math.max(20, parseFloat(width) || 100);
            const h = Math.max(20, parseFloat(height) || 100);
            const direction = dir || 'right';

            if (direction === 'right') {
                const stemTop = h * 0.3;
                const stemBot = h * 0.7;
                const headLen = Math.min(w * 0.45, Math.max(h * 0.75, 20));
                const headX = w - headLen;
                return 'M 0,' + stemTop + ' L ' + headX + ',' + stemTop + ' L ' + headX + ',0 L ' + w + ',' + (h / 2) + ' L ' + headX + ',' + h + ' L ' + headX + ',' + stemBot + ' L 0,' + stemBot + ' Z';
            }
            if (direction === 'left') {
                const stemTop = h * 0.3;
                const stemBot = h * 0.7;
                const headLen = Math.min(w * 0.45, Math.max(h * 0.75, 20));
                const headX = headLen;
                return 'M ' + w + ',' + stemTop + ' L ' + headX + ',' + stemTop + ' L ' + headX + ',0 L 0,' + (h / 2) + ' L ' + headX + ',' + h + ' L ' + headX + ',' + stemBot + ' L ' + w + ',' + stemBot + ' Z';
            }
            if (direction === 'up') {
                const stemLeft = w * 0.3;
                const stemRight = w * 0.7;
                const headLen = Math.min(h * 0.45, Math.max(w * 0.75, 20));
                const headY = headLen;
                return 'M ' + stemLeft + ',' + h + ' L ' + stemLeft + ',' + headY + ' L 0,' + headY + ' L ' + (w / 2) + ',0 L ' + w + ',' + headY + ' L ' + stemRight + ',' + headY + ' L ' + stemRight + ',' + h + ' Z';
            }
            if (direction === 'down') {
                const stemLeft = w * 0.3;
                const stemRight = w * 0.7;
                const headLen = Math.min(h * 0.45, Math.max(w * 0.75, 20));
                const headY = h - headLen;
                return 'M ' + stemLeft + ',0 L ' + stemLeft + ',' + headY + ' L 0,' + headY + ' L ' + (w / 2) + ',' + h + ' L ' + w + ',' + headY + ' L ' + stemRight + ',' + headY + ' L ' + stemRight + ',0 Z';
            }
            return '';
        };

        document.querySelectorAll('.v4-shape').forEach(function(s) {
            if (s.classList.contains('v4-shape-diamond') || s.classList.contains('v4-shape-triangle') || s.classList.contains('v4-shape-arrow')) {
                s.style.setProperty('border-width', '0px', 'important');
                if (s.classList.contains('v4-shape-arrow')) {
                    const svg = s.querySelector('svg');
                    const comp = s.closest('.bychoi-component') || s;
                    const w = parseFloat(comp.style.width) || comp.offsetWidth || 100;
                    const h = parseFloat(comp.style.height) || comp.offsetHeight || 100;

                    if (svg) {
                        const targetViewBox = '0 0 ' + w + ' ' + h;
                        if (svg.getAttribute('viewBox') !== targetViewBox) svg.setAttribute('viewBox', targetViewBox);
                        if (svg.getAttribute('preserveAspectRatio') !== 'none') svg.setAttribute('preserveAspectRatio', 'none');
                    }

                    const dir = s.getAttribute('data-direction') || s.getAttribute('data-arrow-dir') || 'right';
                    const targetD = window.buildArrowPath(w, h, dir);
                    const path = s.querySelector('.v4-arrow-path');
                    if (path && targetD && path.getAttribute('d') !== targetD) {
                        path.setAttribute('d', targetD);
                    }
                    if (!s.getAttribute('data-direction') && !s.getAttribute('data-arrow-dir')) {
                        s.setAttribute('data-direction', 'right');
                        s.setAttribute('data-arrow-dir', 'right');
                    }
                }
                return;
            }
            if (s.style.borderWidth !== '1.6px') s.style.setProperty('border-width', '1.6px', 'important');
        });
    };

    const enforceTablesGridsAndSvgStrokes = function() {
        const sortIconChar = String.fromCharCode(8645);
        document.querySelectorAll('table.v4-premium-table, table.v4-table, .v4-grid-container table').forEach(function(t) {
            if (t.classList.contains('v4-ia-tree-table')) return;
            if (t.style.borderWidth !== '1.6px') t.style.setProperty('border-width', '1.6px', 'important');
            if (t.style.height !== 'auto') t.style.setProperty('height', 'auto', 'important');

            t.querySelectorAll('td, th').forEach(function(cell) {
                const isCheckbox = cell.classList.contains('v4-grid-check-col') ||
                                   cell.querySelector('input[type="checkbox"]') ||
                                   cell.getAttribute('data-type') === 'checkbox';
                if (!isCheckbox) {
                    const nestedEditable = cell.querySelector('.v4-editable-cell, [contenteditable="true"]');
                    if (nestedEditable) {
                        const text = nestedEditable.innerText || nestedEditable.innerHTML || '';
                        nestedEditable.remove();
                        cell.innerHTML = text;
                    }
                    const target = cell;

                    if (!target.classList.contains('v4-editable-cell')) {
                        target.classList.add('v4-editable-cell');
                    }
                    if (target.getAttribute('contenteditable') !== 'true') {
                        target.setAttribute('contenteditable', 'true');
                    }
                    if (!target._eventsBound) {
                        target._eventsBound = true;
                        target.removeAttribute('data-events-bound');

                        const selectParentComponent = function() {
                            const comp = target.closest('.bychoi-component');
                            if (comp && !comp.classList.contains('selected')) {
                                document.querySelectorAll('.bychoi-component').forEach(function(x) { x.classList.remove('selected'); });
                                comp.classList.add('selected');
                                if (window.updateHandles) window.updateHandles(comp);
                                const styles = (typeof window._getCompStyles === 'function') ? window._getCompStyles(comp) : { id: comp.id };
                                _sendParentMsg(Object.assign({
                                    type: "BYCHOI_COMP_SELECTED",
                                    shiftKey: false
                                }, styles));
                            }
                        };

                        target.addEventListener('mousedown', function() {
                            selectParentComponent();
                        });
                        target.addEventListener('click', function(e) {
                            e.stopPropagation();
                            selectParentComponent();
                        });
                        target.addEventListener('input', function() {
                            if (window.markDirty) window.markDirty();
                            const thCell = target.tagName === 'TH' ? target : target.closest('th');
                            if (thCell) {
                                try {
                                    const gridContainer = thCell.closest('.v4-grid-container');
                                    if (gridContainer) {
                                        const cols = JSON.parse(gridContainer.getAttribute('data-columns') || '[]');
                                        const idx = Array.from(thCell.parentElement.children).indexOf(thCell);
                                        if (cols[idx]) {
                                            cols[idx].name = thCell.innerText.split(' ' + sortIconChar).join('').split(sortIconChar).join('').trim();
                                            gridContainer.setAttribute('data-columns', JSON.stringify(cols));
                                        }
                                    }
                                } catch (err) {}
                            }
                        });
                    }
                }
            });
            if (window.TableSelection) window.TableSelection.bindEvents(t);
        });

        document.querySelectorAll('.v4-grid-container').forEach(function(grid) {
            const showPagination = grid.getAttribute('data-pagination') !== 'false';
            const footer = grid.querySelector('.v4-grid-footer');
            if (footer) {
                const targetDisplay = showPagination ? 'flex' : 'none';
                if (footer.style.display !== targetDisplay) footer.style.display = targetDisplay;
            }
            const wrapper = grid.querySelector('.v4-grid-table-wrapper');
            if (wrapper) {
                const targetHeight = showPagination ? 'calc(100% - 36px)' : '100%';
                if (wrapper.style.height !== targetHeight) wrapper.style.height = targetHeight;
            }
            if (grid.style.borderWidth !== '1.6px') grid.style.setProperty('border-width', '1.6px', 'important');
        });

        document.querySelectorAll('polygon, path, rect, circle').forEach(function(svg) {
            if (svg.closest('.connector-line')) return;
            if (svg.getAttribute('stroke-width') !== '1.6') svg.setAttribute('stroke-width', '1.6');
            if (svg.style.strokeWidth !== '1.6') svg.style.strokeWidth = '1.6';
            if (svg.style.vectorEffect !== 'non-scaling-stroke') svg.style.vectorEffect = 'non-scaling-stroke';
        });

        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const sheet = document.styleSheets[i];
                const rules = sheet.cssRules || sheet.rules;
                if (rules) {
                    for (let j = rules.length - 1; j >= 0; j--) {
                        const rule = rules[j];
                        if (rule.selectorText && rule.selectorText.includes('.bychoi-component.selected')) {
                            rule.style.removeProperty('z-index');
                        }
                    }
                }
            } catch (e) {}
        }
    };

    const rightTriChar = String.fromCharCode(9654);
    const downTriChar = String.fromCharCode(9660);

    if (typeof window.toggleIaG1 !== 'function') {
        window.toggleIaG1 = function(g1Key, btnEl, ev) {
            if (ev) { ev.stopPropagation(); ev.preventDefault(); }
            var table = (btnEl && btnEl.closest ? btnEl.closest('table.v4-ia-tree-table') : null) || document.querySelector('table.v4-ia-tree-table');
            if (!table) return;
            var rows = table.querySelectorAll('tbody tr[data-g1="' + g1Key + '"]');
            if (!rows.length) return;
            var rootRow = rows[0];
            var nextFoldState = !rootRow.classList.contains('is-folded-root');
            if (nextFoldState) {
                rootRow.classList.add('is-folded-root');
                if (btnEl) btnEl.textContent = rightTriChar;
            } else {
                rootRow.classList.remove('is-folded-root');
                if (btnEl) btnEl.textContent = downTriChar;
            }
            for (var i = 1; i < rows.length; i++) {
                if (nextFoldState) rows[i].classList.add('ia-hidden-g1');
                else rows[i].classList.remove('ia-hidden-g1');
            }
            if (typeof window.markDirty === 'function') window.markDirty();
        };
    }

    if (typeof window.toggleIaG2 !== 'function') {
        window.toggleIaG2 = function(g2Key, btnEl, ev) {
            if (ev) { ev.stopPropagation(); ev.preventDefault(); }
            var table = (btnEl && btnEl.closest ? btnEl.closest('table.v4-ia-tree-table') : null) || document.querySelector('table.v4-ia-tree-table');
            if (!table) return;
            var rootRow = table.querySelector('tbody tr[data-g2="' + g2Key + '"]');
            var childRows = table.querySelectorAll('tbody tr[data-g2-parent="' + g2Key + '"]');
            if (!rootRow || !childRows.length) return;
            var isFolded = (btnEl && btnEl.textContent.trim() === rightTriChar) || childRows[0].classList.contains('ia-hidden-g2');
            var nextFold = !isFolded;
            if (nextFold) {
                rootRow.classList.add('is-folded-root');
                if (btnEl) btnEl.textContent = rightTriChar;
            } else {
                rootRow.classList.remove('is-folded-root');
                if (btnEl) btnEl.textContent = downTriChar;
            }
            for (var i = 0; i < childRows.length; i++) {
                if (nextFold) childRows[i].classList.add('ia-hidden-g2');
                else childRows[i].classList.remove('ia-hidden-g2');
            }
            if (typeof window.markDirty === 'function') window.markDirty();
        };
    }

    if (typeof window.bindIaTreeTables !== 'function') {
        window.bindIaTreeTables = function() {
            var tables = document.querySelectorAll('table.v4-ia-tree-table');
            tables.forEach(function(table) {
                var comp = table.closest('.bychoi-component');
                if (!table || !comp || table._iaPropsBound) return;
                table._iaPropsBound = true;
                table._tableSelectionBound = true;
                table.querySelectorAll('.selected-cell').forEach(function(c) { c.classList.remove('selected-cell'); });

                var isDragSelecting = false;
                var dragStartRow = -1;
                var dragStartCol = -1;

                var syncToParentInspector = function() {
                    document.querySelectorAll('.bychoi-component').forEach(function(x) { x.classList.remove('selected'); });
                    comp.classList.add('selected');
                    window.activeEl = comp;
                    if (typeof window.updateHandles === 'function') window.updateHandles(comp);
                    var compStyles = (typeof window._getCompStyles === 'function') ? window._getCompStyles(comp) : { id: comp.id, isTable: true };
                    compStyles.isTable = true;
                    _sendParentMsg(Object.assign({ type: 'BYCHOI_COMP_SELECTED', shiftKey: false, isResponsive: false }, compStyles));

                    var notifyCells = function() {
                        var selected = table.querySelectorAll('.selected-cell');
                        if (!selected.length) {
                            _sendParentMsg({ type: 'BYCHOI_CELL_SELECTED', cellData: null });
                            return;
                        }
                        var repCell = (window._iaLastClickedCell && window._iaLastClickedCell.classList && window._iaLastClickedCell.classList.contains('selected-cell')) ? window._iaLastClickedCell : selected[0];
                        var innerSpan = repCell.querySelector('.v4-editable-cell');
                        var bg = '#ffffff';
                        if (repCell.getAttribute('data-bg-transparent') === 'true') {
                            bg = 'transparent';
                        } else if (repCell.style.backgroundColor && repCell.style.backgroundColor !== 'initial' && repCell.style.backgroundColor !== 'inherit') {
                            bg = repCell.style.backgroundColor;
                        } else if (repCell.tagName === 'TH') {
                            bg = (repCell.parentElement && repCell.parentElement.rowIndex === 0) ? '#27272a' : '#3f3f46';
                        }
                        var color = (innerSpan && innerSpan.style.color) || repCell.style.color || window.getComputedStyle(innerSpan || repCell).color || '#1e293b';
                        var rawAlign = repCell.style.textAlign || window.getComputedStyle(repCell).textAlign || 'center';
                        var align = (rawAlign === 'start' || rawAlign === 'left' || rawAlign === '-webkit-left') ? 'left' : ((rawAlign === 'end' || rawAlign === 'right' || rawAlign === '-webkit-right') ? 'right' : 'center');
                        var w = Math.round(repCell.getBoundingClientRect().width) || repCell.offsetWidth || 120;
                        var h = Math.round(repCell.getBoundingClientRect().height) || repCell.offsetHeight || 36;
                        _sendParentMsg({
                            type: 'BYCHOI_CELL_SELECTED',
                            cellData: { count: selected.length, backgroundColor: bg, color: color, textAlign: align, width: w, height: h }
                        });
                    };
                    notifyCells();
                    setTimeout(notifyCells, 20);
                };

                table.addEventListener('mousedown', function(e) {
                    if (e.button !== 0 || e.target.closest('.ia-toggle-btn')) return;
                    var cell = e.target.closest('td, th');
                    if (!cell) return;
                    window._iaLastClickedCell = cell;
                    var isAlreadyEditingThisCell = (document.activeElement && document.activeElement.isContentEditable && cell.contains(document.activeElement));
                    var tr = cell.parentElement;
                    var allRows = Array.from(table.rows);
                    dragStartRow = allRows.indexOf(tr);
                    dragStartCol = Array.from(tr.cells).indexOf(cell);
                    isDragSelecting = !isAlreadyEditingThisCell;
                    var isFullRowSelect = cell.classList.contains('col-site') || e.altKey;
                    if (!e.shiftKey) {
                        table.querySelectorAll('.selected-cell').forEach(function(c) { c.classList.remove('selected-cell'); });
                        if (isFullRowSelect && tr) Array.from(tr.cells).forEach(function(rc) { rc.classList.add('selected-cell'); });
                        else cell.classList.add('selected-cell');
                    } else if (isFullRowSelect && tr) {
                        var addFlag = !cell.classList.contains('selected-cell');
                        Array.from(tr.cells).forEach(function(rc) { rc.classList.toggle('selected-cell', addFlag); });
                    } else {
                        cell.classList.toggle('selected-cell');
                    }
                    window._iaSuppressGlobalClear = true;
                    syncToParentInspector();
                    setTimeout(function() {
                        window._iaSuppressGlobalClear = false;
                        if (window.V4DragResizeEngine) {
                            window.V4DragResizeEngine.isPendingDrag = false;
                            window.V4DragResizeEngine.isDragging = false;
                        }
                        syncToParentInspector();
                    }, 0);
                });

                table.addEventListener('mouseover', function(e) {
                    if (!isDragSelecting) return;
                    if (window.V4DragResizeEngine) {
                        window.V4DragResizeEngine.isPendingDrag = false;
                        window.V4DragResizeEngine.isDragging = false;
                    }
                    var cell = e.target.closest('td, th');
                    if (!cell) return;
                    var tr = cell.parentElement;
                    var allRows = Array.from(table.rows);
                    var curRow = allRows.indexOf(tr);
                    var curCol = Array.from(tr.cells).indexOf(cell);
                    if (curRow < 0 || curCol < 0) return;
                    var minR = Math.min(dragStartRow, curRow), maxR = Math.max(dragStartRow, curRow);
                    var minC = Math.min(dragStartCol, curCol), maxC = Math.max(dragStartCol, curCol);
                    table.querySelectorAll('.selected-cell').forEach(function(c) { c.classList.remove('selected-cell'); });
                    for (var r = minR; r <= maxR; r++) {
                        var rowEl = allRows[r];
                        if (!rowEl || rowEl.classList.contains('ia-hidden-g1') || rowEl.classList.contains('ia-hidden-g2')) continue;
                        for (var c = minC; c <= maxC; c++) {
                            if (rowEl.cells[c]) rowEl.cells[c].classList.add('selected-cell');
                        }
                    }
                });

                document.addEventListener('mouseup', function() {
                    if (isDragSelecting) {
                        isDragSelecting = false;
                        syncToParentInspector();
                    }
                });

                document.addEventListener('mousedown', function(e) {
                    if (!e.target.closest('table.v4-ia-tree-table')) {
                        table.querySelectorAll('.selected-cell').forEach(function(c) { c.classList.remove('selected-cell'); });
                    }
                });
            });
        };
    }

    window.V4DesignSystemShapesTables = {
        migrateLegacyCoordsAndIcons: migrateLegacyCoordsAndIcons,
        enforceShapesAndArrows: enforceShapesAndArrows,
        enforceTablesGridsAndSvgStrokes: enforceTablesGridsAndSvgStrokes,
        runAll: function() {
            migrateLegacyCoordsAndIcons();
            enforceShapesAndArrows();
            enforceTablesGridsAndSvgStrokes();
        }
    };
})();
`;
