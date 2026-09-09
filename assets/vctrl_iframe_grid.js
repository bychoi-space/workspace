/**
 * assets/vctrl_iframe_grid.js
 * Modular rendering engine for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4GridScript = "...").
 * 1. DO NOT use unescaped backticks inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as backslash-backtick to avoid syntax errors.
 */

window.v4GridScript = `
(function() {
    console.log("[V4 Grid] Module loaded.");

    var MOCK_LIST = [
        { no: "1024", name: "[\uD574\uC9C0\uC2A4] \uC5EC\uB984 \uB9DE\uC774 \uB9B0\uB128 \uC154\uCE20 \uD2B9\uAC00 \uB77C\uC774\uBE0C", status: "\uBC29\uC1A1\uC811", statusColor: "#10b981", statusBg: "rgba(52,211,153,0.15)", author: "\uAE40\uC5D8\uC5D0\uD504", date: "2026-07-01 11:00:00", price: "89,000\uC680", category: "\uC758\uB958", badge: "BEST", orderNo: "ORD-20260701-01", userId: "user01" },
        { no: "1023", name: "[\uB2E5\uC2A4] \uD504\uB9AC\uBBF8\uC5C4 \uC2E4\uD06C \uD0C0\uC774 \uB2E8\uB3C5 \uB7F0\uCE6D \uC1FC", status: "\uBC29\uC1A1\uC608\uC815", statusColor: "#d97706", statusBg: "rgba(251,191,36,0.15)", author: "\uC774\uB2E5\uC2A4", date: "2026-06-30 18:30:20", price: "125,000\uC680", category: "\uC7A1\uD654", badge: "NEW", orderNo: "ORD-20260630-02", userId: "user02" },
        { no: "1022", name: "[\uB77C\uD478\uB9C8] \uC544\uC6C3\uB3C4\uC5B4 \uBC14\uB78C\uB9C9\uC774 \uD074\uB9AC\uC5B4\uB780\uC2A4 \uC138\uC77C", status: "\uBC29\uC1A1\uC885\uB8CC", statusColor: "#ef4444", statusBg: "rgba(239,68,68,0.1)", author: "\uBC15\uB77C\uD478\uB9C8", date: "2026-06-29 14:15:10", price: "64,000\uC680", category: "\uC544\uC6C3\uB3C4\uC5B4", badge: "SALE", orderNo: "ORD-20260629-03", userId: "user03" },
        { no: "1021", name: "[\uC9C8\uC2A4\uD29C\uC5B4\uD2B8] \uBD04 \uC2E0\uC0C1 \uC2A4\uB2C8\uCEE4\uC988 \uD55C\uC815 \uB77C\uC774\uBE0C", status: "\uBC29\uC1A1\uC811", statusColor: "#10b981", statusBg: "rgba(52,211,153,0.15)", author: "\uCD5C\uC9C8\uC2A4", date: "2026-06-28 10:00:00", price: "158,000\uC680", category: "\uC2E0\uBC1C", badge: "HOT", orderNo: "ORD-20260628-04", userId: "user04" },
        { no: "1020", name: "[\uBC14\uB124\uC0AC\uBE0C\uB828\uB178] \uAC00\uC744 \uCEEC\uB809\uC158 \uB8E9\uBD81 \uACF5\uAC1C \uC0DD\uBC29\uC1A1", status: "\uBC29\uC1A1\uC608\uC815", statusColor: "#d97706", statusBg: "rgba(251,191,36,0.15)", author: "\uC815\uBC14\uB124", date: "2026-06-27 16:45:00", price: "249,000\uC680", category: "\uC758\uB958", badge: "BEST", orderNo: "ORD-20260627-05", userId: "user05" }
    ];

    var isMockValue = function(text, type) {
        if (!text) return true;
        var t = text.trim();
        if (type === "number") {
            return /^\\d+$/.test(t);
        }
        if (type === "status") {
            return t.indexOf("\uBC29\uC1A1\uC811") >= 0 || t.indexOf("\uBC29\uC1A1\uC608\uC815") >= 0 || t.indexOf("\uBC29\uC1A1\uC885\uB8CC") >= 0 || t.indexOf("\uC0C1\uD0DC") >= 0 || t.indexOf("\uC815\uC0C1") >= 0 || t.indexOf("\uB300\uAE30") >= 0;
        }
        if (type === "author") {
            return ["\uAE40\uC5D8\uC5D0\uD504", "\uC774\uB2E5\uC2A4", "\uBC15\uB77C\uD478\uB9C8", "\uCD5C\uC9C8\uC2A4", "\uC815\uBC14\uB124", "\uD64D\uAE38\uB3D9", "\uC774\uC601\uD76C", "\uBC15\uBBFC\uC218", "\uCD5C\uD604\uC6B0", "\uC815\uC218\uC9C4"].indexOf(t) >= 0;
        }
        if (type === "datetime") {
            return t.indexOf("2026-") === 0;
        }
        if (type === "currency") {
            return /^[\\d,]+(\\s*\uC680)?$/.test(t);
        }
        if (type === "action") {
            return t === "\uC0C1\uC138" || t === "\uC218\uC815" || t === "\uAD00\uB9AC" || t === "Detail";
        }
        if (type === "badge") {
            return ["BEST", "NEW", "HOT", "SALE", "VIP", "\uC77C\uBC18", "\uACE8\uB4DC"].indexOf(t) >= 0;
        }
        if (type === "text") {
            var mocks = [
                "[\uD574\uC9C0\uC2A4] \uC5EC\uB984 \uB9DE\uC774 \uB9B0\uB128 \uC154\uCE20 \uD2B9\uAC00 \uB77C\uC774\uBE0C",
                "[\uB2E5\uC2A4] \uD504\uB9AC\uBBF8\uC5C4 \uC2E4\uD06C \uD0C0\uC774 \uB2E8\uB3C5 \uB7F0\uCE6D \uC1FC",
                "[\uB77C\uD478\uB9C8] \uC544\uC6C3\uB3C4\uC5B4 \uBC14\uB78C\uB9C9\uC774 \uD074\uB9AC\uC5B4\uB780\uC2A4 \uC138\uC77C",
                "[\uC9C8\uC2A4\uD29C\uC5B4\uD2B8] \uBD04 \uC2E0\uC0C1 \uC2A4\uB2C8\uCEE4\uC988 \uD55C\uC815 \uB77C\uC774\uBE0C",
                "[\uBC14\uB124\uC0AC\uBE0C\uB828\uB178] \uAC00\uC744 \uCEEC\uB809\uC158 \uB8E9\uBD81 \uACF5\uAC1C \uC0DD\uBC29\uC1A1",
                "[\uAE30\uD68D\uC804] \uC2DC\uC98C \uB9DE\uC774 \uBCA0\uC2A4\uD2B8 \uC0C1\uD488\uC804",
                "[\uD504\uB9AC\uBBF8\uC5C4] \uB2E8\uB3C5 \uBE0C\uB79C\uB4DC \uAE30\uD68D\uC804 \uC1FC",
                "New", "\uC0C8 \uD56d\uBAA9", "Header", "Data", "\uC9C1\uC811 \uC785\uB825 \uAC00\uB2A5"
            ];
            return mocks.indexOf(t) >= 0 || t === "";
        }
        return true;
    };

    var getCellContentForType = function(type, rIdx, col, isClickable, fillMock) {
        if (type === "checkbox") {
            return '<input type="checkbox">';
        }
        if (type === "action") {
            return '<button type="button" class="v4-grid-action-btn">\uC0C1\uC138</button>';
        }
        if (!fillMock) {
            return "";
        }
        var data = MOCK_LIST[rIdx % MOCK_LIST.length];
        if (type === "number") {
            return String(1024 - rIdx);
        }
        if (type === "currency") {
            return (data.price || "89,000\uC680");
        }
        if (type === "status") {
            return '<span class="v4-grid-badge" style="background:' + data.statusBg + '; color:' + data.statusColor + ';">' + data.status + '</span>';
        }
        if (type === "badge") {
            var badgeColors = [
                { bg: "#e0f2fe", c: "#0369a1" },
                { bg: "#fef3c7", c: "#b45309" },
                { bg: "#dcfce7", c: "#15803d" },
                { bg: "#f3e8ff", c: "#7e22ce" }
            ];
            var bColor = badgeColors[rIdx % badgeColors.length];
            return '<span class="v4-grid-badge" style="background:' + bColor.bg + '; color:' + bColor.c + ';">' + (data.badge || "BEST") + '</span>';
        }
        if (type === "author") {
            return data.author;
        }
        if (type === "datetime") {
            return data.date;
        }
        return data.name;
    };

    var getResolvedAlign = function(col) {
        if (col.align && (col.align === "left" || col.align === "center" || col.align === "right")) {
            return col.align;
        }
        if (col.type === "checkbox" || col.type === "status" || col.type === "badge" || col.type === "action") {
            return "center";
        }
        if (col.type === "number" || col.type === "currency") {
            return "right";
        }
        return "left";
    };

    var bindGridCellEvents = function(cell, isHeader, colIdx) {
        if (!cell || cell.dataset.eventsBound) return;
        cell.dataset.eventsBound = "true";

        var selectParentComponent = function(e) {
            var comp = cell.closest(".lf-component");
            if (comp) {
                var isMulti = e ? (e.shiftKey || e.ctrlKey || e.metaKey) : false;
                if (isMulti) {
                    comp.classList.toggle("selected");
                } else {
                    document.querySelectorAll(".lf-component").forEach(function(x) { x.classList.remove("selected"); });
                    comp.classList.add("selected");
                }
                if (window.updateHandles) window.updateHandles(comp);
                
                if (typeof notifyParent === "function") {
                    notifyParent(Object.assign({
                        type: "LF_COMP_SELECTED",
                        shiftKey: isMulti
                    }, (window._getCompStyles ? window._getCompStyles(comp) : {})));
                }
            }
        };

        cell.addEventListener("mousedown", function(e) {
            if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
                e.stopPropagation();
            }
            selectParentComponent(e);
        });

        cell.addEventListener("click", function(e) {
            if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
                e.stopPropagation();
            }
            selectParentComponent(e);
        });

        cell.addEventListener("focus", function() {
            cell.classList.add("active-cell-editing");
        });

        cell.addEventListener("blur", function() {
            cell.classList.remove("active-cell-editing");
        });

        cell.addEventListener("keydown", function(e) {
            if (e.key === "Escape" || e.code === "Escape") {
                e.stopPropagation();
                cell.blur();
                return;
            }
            // Stop propagation so global shortcuts (Delete/Backspace/Arrows/Space) do not delete or move component
            e.stopPropagation();
        });

        cell.addEventListener("keyup", function(e) {
            e.stopPropagation();
        });

        if (isHeader) {
            cell.addEventListener("input", function() {
                if (typeof markDirty === "function") markDirty();
                try {
                    var gridContainer = cell.closest(".v4-grid-container");
                    if (gridContainer) {
                        var cols = JSON.parse(gridContainer.getAttribute("data-columns") || "[]");
                        if (cols[colIdx]) {
                            cols[colIdx].name = cell.innerText.replace(" \u21C5", "").trim();
                            gridContainer.setAttribute("data-columns", JSON.stringify(cols));
                        }
                    }
                } catch(err) {}
            });
        } else {
            cell.addEventListener("input", function() {
                cell.setAttribute("data-user-modified", "true");
                if (typeof markDirty === "function") markDirty();
            });
        }
    };

    var bindTableCheckboxInteractions = function(table) {
        if (!table || table.dataset.checkboxEventsBound) return;
        table.dataset.checkboxEventsBound = "true";

        var theadChk = table.querySelector("thead th.v4-grid-check-col input[type='checkbox']");
        var syncRowSelection = function(chk) {
            var tr = chk.closest("tr");
            if (tr) {
                if (chk.checked) {
                    tr.classList.add("v4-grid-row-selected");
                } else {
                    tr.classList.remove("v4-grid-row-selected");
                }
            }
        };

        if (theadChk) {
            theadChk.addEventListener("change", function(e) {
                e.stopPropagation();
                var isChecked = theadChk.checked;
                var tbodyChks = table.querySelectorAll("tbody td[data-type='checkbox'] input[type='checkbox']");
                tbodyChks.forEach(function(c) {
                    c.checked = isChecked;
                    syncRowSelection(c);
                });
                if (typeof markDirty === "function") markDirty();
            });
        }

        table.addEventListener("change", function(e) {
            if (e.target && e.target.tagName === "INPUT" && e.target.type === "checkbox") {
                var td = e.target.closest("td[data-type='checkbox']");
                if (td) {
                    syncRowSelection(e.target);
                    if (theadChk) {
                        var allChks = Array.from(table.querySelectorAll("tbody td[data-type='checkbox'] input[type='checkbox']"));
                        var allChecked = allChks.length > 0 && allChks.every(function(c) { return c.checked; });
                        theadChk.checked = allChecked;
                    }
                    if (typeof markDirty === "function") markDirty();
                }
            }
        });
    };

    window.renderGrid = function(container, columns, rowCount, showPagination, rowHeight, showZebra, fillMock) {
        if (!container) return;
        
        container.setAttribute("data-columns", JSON.stringify(columns));
        container.setAttribute("data-row-count", rowCount);
        container.setAttribute("data-pagination", showPagination ? "true" : "false");
        if (rowHeight !== undefined) {
            container.setAttribute("data-row-height", rowHeight);
        }
        if (showZebra !== undefined) {
            container.setAttribute("data-zebra", showZebra ? "true" : "false");
        }
        var rowHeightVal = container.getAttribute("data-row-height") || "40px";
        if (/^\\d+$/.test(String(rowHeightVal).trim())) {
            rowHeightVal = String(rowHeightVal).trim() + "px";
        }
        var isZebra = container.getAttribute("data-zebra") === "true";

        var totalColWidth = 0;
        columns.forEach(function(col) {
            var w = col.width;
            if (!w) {
                w = (col.type === "checkbox" ? 50 : (col.type === "number" || col.type === "action" ? 80 : 120));
            } else {
                w = parseInt(w) || (col.type === "checkbox" ? 50 : (col.type === "number" || col.type === "action" ? 80 : 120));
            }
            totalColWidth += w;
        });

        var table = container.querySelector("table");
        if (table) {
            table.style.setProperty("height", "auto", "important");
            table.style.setProperty("width", totalColWidth + "px", "important");
            table.style.setProperty("min-width", totalColWidth + "px", "important");
            table.style.setProperty("table-layout", "fixed", "important");
            var colgroup = table.querySelector("colgroup");
            if (colgroup) {
                var cols = Array.from(colgroup.querySelectorAll("col"));
                while (cols.length < columns.length) {
                    var newCol = document.createElement("col");
                    colgroup.appendChild(newCol);
                    cols.push(newCol);
                }
                while (cols.length > columns.length) {
                    colgroup.removeChild(cols.pop());
                }
                columns.forEach(function(col, idx) {
                    var w = col.width;
                    if (!w) {
                        w = (col.type === "checkbox" ? "50px" : (col.type === "number" || col.type === "action" ? "80px" : "120px"));
                    } else {
                        w = w.trim();
                        if (/^\\d+$/.test(w) || /^\\d*\\.\\d+$/.test(w)) {
                            w = w + "px";
                        }
                    }
                    cols[idx].style.width = w;
                });
            }

            var thead = table.querySelector("thead");
            if (thead) {
                var headerRow = thead.querySelector("tr");
                if (headerRow) {
                    headerRow.style.setProperty("height", rowHeightVal, "important");
                    headerRow.style.setProperty("min-height", rowHeightVal, "important");
                    var ths = Array.from(headerRow.querySelectorAll("th"));
                    while (ths.length < columns.length) {
                        var newTh = document.createElement("th");
                        newTh.className = "v4-grid-cell v4-editable-cell";
                        newTh.contentEditable = "true";
                        newTh.style.display = "table-cell";
                        newTh.style.verticalAlign = "middle";
                        newTh.style.boxSizing = "border-box";
                        newTh.style.fontSize = "12px";
                        newTh.style.fontWeight = "500";
                        newTh.style.color = "#334155";
                        headerRow.appendChild(newTh);
                        ths.push(newTh);
                    }
                    while (ths.length > columns.length) {
                        headerRow.removeChild(ths.pop());
                    }
                    
                    columns.forEach(function(col, idx) {
                        var th = ths[idx];
                        var bg = th.style.background || th.style.backgroundColor;
                        var color = th.style.color;
                        var fontSize = th.style.fontSize;
                        var fontFamily = th.style.fontFamily;
                        var align = getResolvedAlign(col);

                        th.style.borderRight = "1.6px solid rgb(226, 232, 240)";
                        th.style.setProperty("text-align", align, "important");
                        th.style.setProperty("padding", col.type === "checkbox" ? "0" : "0 8px", "important");
                        th.style.fontWeight = "500";
                        th.style.color = "#334155";
                        th.style.setProperty("height", rowHeightVal, "important");
                        th.style.setProperty("min-height", rowHeightVal, "important");
                        th.style.setProperty("vertical-align", "middle", "important");
                        th.setAttribute("data-align", align);

                        if (col.type === "checkbox") {
                            th.className = "v4-grid-cell v4-grid-check-col";
                            th.contentEditable = "false";
                            th.setAttribute("data-type", "checkbox");
                            if (!th.querySelector("input[type='checkbox']")) {
                                th.innerHTML = '<input type="checkbox">';
                            }
                        } else {
                            th.className = "v4-grid-cell v4-editable-cell";
                            th.contentEditable = "true";
                            th.setAttribute("data-type", col.type);
                            var desiredText = (col.name || "") + " \u21C5";
                            if (th.innerText !== desiredText && th.innerText !== col.name) {
                                th.innerText = desiredText;
                            }
                            bindGridCellEvents(th, true, idx);
                        }

                        if (bg) th.style.setProperty("background", bg, "important");
                        if (color) th.style.setProperty("color", color, "important");
                        if (fontSize) th.style.setProperty("font-size", fontSize, "important");
                        if (fontFamily) th.style.setProperty("font-family", fontFamily, "important");
                    });
                }
            }
            
            var tbody = table.querySelector("tbody");
            if (tbody) {
                var rows = Array.from(tbody.querySelectorAll("tr"));
                while (rows.length < rowCount) {
                    var newRow = document.createElement("tr");
                    newRow.style.setProperty("height", rowHeightVal, "important");
                    newRow.style.setProperty("min-height", rowHeightVal, "important");
                    newRow.style.background = "#ffffff";
                    newRow.style.boxSizing = "border-box";
                    tbody.appendChild(newRow);
                    rows.push(newRow);
                }
                while (rows.length > rowCount) {
                    tbody.removeChild(rows.pop());
                }
                
                rows.forEach(function(row, rIdx) {
                    row.style.borderBottom = "1.6px solid rgb(226,232,240)";
                    row.style.setProperty("height", rowHeightVal, "important");
                    row.style.setProperty("min-height", rowHeightVal, "important");
                    if (!isZebra) {
                        row.style.background = "#ffffff";
                    } else {
                        row.style.removeProperty("background");
                    }
                    
                    var tds = Array.from(row.querySelectorAll("td"));
                    while (tds.length < columns.length) {
                        var newTd = document.createElement("td");
                        newTd.className = "v4-grid-cell v4-editable-cell";
                        newTd.contentEditable = "true";
                        newTd.style.display = "table-cell";
                        newTd.style.verticalAlign = "middle";
                        newTd.style.boxSizing = "border-box";
                        newTd.style.fontSize = "12px";
                        row.appendChild(newTd);
                        tds.push(newTd);
                    }
                    while (tds.length > columns.length) {
                        row.removeChild(tds.pop());
                    }
                    
                    columns.forEach(function(col, cIdx) {
                        var td = tds[cIdx];
                        var align = getResolvedAlign(col);
                        td.style.borderRight = "1.6px solid rgb(226,232,240)";
                        td.style.setProperty("height", rowHeightVal, "important");
                        td.style.setProperty("min-height", rowHeightVal, "important");
                        td.style.setProperty("vertical-align", "middle", "important");
                        td.style.setProperty("box-sizing", "border-box", "important");
                        td.style.setProperty("padding", col.type === "checkbox" ? "0" : "0 8px", "important");
                        td.style.setProperty("text-align", align, "important");
                        td.setAttribute("data-align", align);

                        var isClickable = !!col.clickable && col.type !== "checkbox" && col.type !== "action";
                        td.setAttribute("data-clickable", isClickable ? "true" : "false");
                        if (isClickable) {
                            td.classList.add("v4-grid-clickable-cell");
                            td.style.setProperty("color", "#2563eb", "important");
                            td.style.setProperty("cursor", "pointer", "important");
                        } else {
                            td.classList.remove("v4-grid-clickable-cell");
                            td.style.removeProperty("cursor");
                            if (td.style.color === "rgb(37, 99, 235)" || td.style.color === "#2563eb") {
                                td.style.removeProperty("color");
                            }
                        }

                        var prevType = td.getAttribute("data-type");
                        if (!prevType && (td.classList.contains("v4-grid-check-col") || td.querySelector("input[type='checkbox']"))) {
                            prevType = "checkbox";
                            td.setAttribute("data-type", "checkbox");
                        }

                        if (col.type !== "checkbox" && col.type !== "action") {
                            bindGridCellEvents(td, false, cIdx);
                        }

                        var isUserModified = td.getAttribute("data-user-modified") === "true";
                        var currentText = td.innerText || "";
                        var shouldOverwrite = false;

                        if (prevType !== col.type) {
                            shouldOverwrite = true;
                        } else if (fillMock && (!isUserModified && (isMockValue(currentText, prevType) || td.innerHTML === ""))) {
                            shouldOverwrite = true;
                        } else if (td.innerHTML === "" && (col.type === "checkbox" || col.type === "action")) {
                            shouldOverwrite = true;
                        }

                        if (shouldOverwrite) {
                            var bg = td.style.background || td.style.backgroundColor;
                            var color = td.style.color;
                            var fontSize = td.style.fontSize;
                            var fontFamily = td.style.fontFamily;

                            td.setAttribute("data-type", col.type);
                            if (col.type === "checkbox") {
                                td.className = "v4-grid-cell";
                                td.contentEditable = "false";
                                td.innerHTML = '<input type="checkbox">';
                            } else if (col.type === "action") {
                                td.className = "v4-grid-cell";
                                td.contentEditable = "false";
                                td.innerHTML = '<button type="button" class="v4-grid-action-btn">\uC0C1\uC138</button>';
                            } else {
                                td.className = "v4-grid-cell v4-editable-cell" + (isClickable ? " v4-grid-clickable-cell" : "");
                                td.contentEditable = "true";
                                td.style.color = "";
                                td.style.fontWeight = "";
                                td.style.fontSize = "";
                                td.innerHTML = getCellContentForType(col.type, rIdx, col, isClickable, fillMock);
                            }

                            if (bg) td.style.setProperty("background", bg, "important");
                            if (col.type === "status" || col.type === "badge" || col.type === "checkbox") {
                                if (color) td.style.setProperty("color", color, "important");
                                if (fontSize) td.style.setProperty("font-size", fontSize, "important");
                                if (fontFamily) td.style.setProperty("font-family", fontFamily, "important");
                            }
                        }
                    });
                });
            }
            
            var footer = container.querySelector(".v4-grid-footer");
            if (footer) {
                footer.style.display = showPagination ? "flex" : "none";
            }
            var wrapper = container.querySelector(".v4-grid-table-wrapper");
            if (wrapper) {
                wrapper.style.height = showPagination ? "calc(100% - 36px)" : "100%";
            }
            
            bindTableCheckboxInteractions(table);

            var compEl = container.closest(".lf-component");
            if (compEl) {
                if (!compEl.style.height) {
                    var rowHNum = parseInt(rowHeightVal) || 40;
                    var headerH = 40;
                    var footerH = showPagination ? 36 : 0;
                    var calculatedHeight = headerH + (rowCount * rowHNum) + footerH;
                    compEl.style.height = calculatedHeight + "px";
                }
                if (window.updateHandles) window.updateHandles(compEl);
            }
            return;
        }

        // Fresh Container Builder
        var colgroupHtml = "<colgroup>";
        columns.forEach(function(col) {
            var w = col.width;
            if (!w) {
                w = (col.type === "checkbox" ? "50px" : (col.type === "number" || col.type === "action" ? "80px" : "120px"));
            } else {
                w = w.trim();
                if (/^\\d+$/.test(w) || /^\\d*\\.\\d+$/.test(w)) {
                    w = w + "px";
                }
            }
            colgroupHtml += '<col style="width:' + w + ';">';
        });
        colgroupHtml += "</colgroup>";
        
        var headerHtml = '<tr style="height:' + rowHeightVal + ' !important; background:#f8fafc; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box;">';
        columns.forEach(function(col, index) {
            var borderRight = " border-right:1.6px solid rgb(226,232,240);";
            var align = getResolvedAlign(col);
            if (col.type === "checkbox") {
                headerHtml += '<th class="v4-grid-cell v4-grid-check-col" data-type="checkbox" data-align="center" style="display:table-cell; vertical-align:middle; text-align:center; height:' + rowHeightVal + ' !important;' + borderRight + ' box-sizing:border-box; padding:0; font-weight:normal; position:sticky; top:0; z-index:10; background:#f8fafc;"><input type="checkbox"></th>';
            } else {
                headerHtml += '<th class="v4-grid-cell v4-editable-cell" contenteditable="true" data-type="' + col.type + '" data-align="' + align + '" style="display:table-cell; vertical-align:middle; text-align:' + align + '; height:' + rowHeightVal + ' !important; padding:0 8px;' + borderRight + ' box-sizing:border-box; font-size:12px; font-weight:500; color:#334155; user-select:none; position:sticky; top:0; z-index:10; background:#f8fafc;">' + (col.name || "") + " \u21C5</th>";
            }
        });
        headerHtml += "</tr>";
        
        var bodyHtml = "";
        for (var i = 0; i < rowCount; i++) {
            var borderBottom = "1.6px solid rgb(226,232,240)";
            var rowBg = (!isZebra || i % 2 === 0) ? "#ffffff" : "#f8fafc";
            
            bodyHtml += '<tr style="height:' + rowHeightVal + ' !important; border-bottom:' + borderBottom + '; box-sizing:border-box; background:' + rowBg + ';">';
            
            columns.forEach(function(col, colIndex) {
                var borderRight = " border-right:1.6px solid rgb(226,232,240);";
                var align = getResolvedAlign(col);
                var heightStyle = " height:" + rowHeightVal + " !important; min-height:" + rowHeightVal + " !important; vertical-align:middle !important; box-sizing:border-box !important;";
                var isClickable = !!col.clickable && col.type !== "checkbox" && col.type !== "action";
                var clickableAttr = ' data-clickable="' + (isClickable ? "true" : "false") + '"';
                var clickableClass = isClickable ? " v4-grid-clickable-cell" : "";
                var clickableStyle = isClickable ? " color:#2563eb !important; cursor:pointer !important;" : "";
                var cellContent = getCellContentForType(col.type, i, col, isClickable);
                
                if (col.type === "checkbox") {
                    bodyHtml += '<td class="v4-grid-cell" data-type="checkbox" data-align="center"' + clickableAttr + ' style="display:table-cell; vertical-align:middle; text-align:center;' + heightStyle + borderRight + ' padding:0;"><input type="checkbox"></td>';
                } else if (col.type === "action") {
                    bodyHtml += '<td class="v4-grid-cell" data-type="action" data-align="center"' + clickableAttr + ' style="display:table-cell; vertical-align:middle; text-align:center;' + heightStyle + borderRight + ' padding:0 8px;">' + cellContent + '</td>';
                } else {
                    bodyHtml += '<td class="v4-grid-cell v4-editable-cell' + clickableClass + '" contenteditable="true" data-type="' + col.type + '" data-align="' + align + '"' + clickableAttr + ' style="display:table-cell; vertical-align:middle; text-align:' + align + ";" + heightStyle + " padding:0 8px;" + borderRight + " font-size:12px; " + (isClickable ? clickableStyle : "color:#0f172a; font-weight:500;") + '">' + cellContent + '</td>';
                }
            });
            bodyHtml += "</tr>";
        }
        
        var displayFooter = showPagination ? "flex" : "none";
        var tableHeight = showPagination ? "calc(100% - 36px)" : "100%";
        
        var tableContainerHtml = '<div class="v4-grid-table-wrapper" style="width:100%; height:' + tableHeight + '; overflow:auto; box-sizing:border-box;">' +
                                 '<table style="width:' + totalColWidth + 'px; min-width:' + totalColWidth + 'px; table-layout:fixed; border-collapse:collapse; background:#ffffff; box-sizing:border-box;">' +
                                 colgroupHtml +
                                 "<thead>" + headerHtml + "</thead>" +
                                 '<tbody style="box-sizing:border-box;">' + bodyHtml + "</tbody>" +
                                 "</table>" +
                                 "</div>";
                                 
        var footerHtml = '<div class="v4-grid-footer" style="height:36px; padding:0 12px; display:' + displayFooter + '; align-items:center; justify-content:space-between; background:#f8fafc; border-top:1.6px solid rgb(226,232,240); box-sizing:border-box; width:100%; flex-shrink:0;">' +
                         '<span style="font-size:11px; color:#64748b; font-family:Inter,sans-serif;">1/27</span>' +
                         '<div class="v4-grid-pages" style="font-size:11px; color:#64748b; cursor:pointer; font-family:Inter,sans-serif;">\u25C0 1 2 3 4 5 \u25B6</div>' +
                         '<span style="font-size:11px; color:#64748b; font-family:Inter,sans-serif;">Page Size 100</span>' +
                         '</div>';
        
        container.innerHTML = tableContainerHtml + footerHtml;

        var renderedTable = container.querySelector("table");
        if (renderedTable) {
            bindTableCheckboxInteractions(renderedTable);
            var allThs = Array.from(renderedTable.querySelectorAll("thead th"));
            allThs.forEach(function(th, idx) {
                if (!th.classList.contains("v4-grid-check-col")) {
                    bindGridCellEvents(th, true, idx);
                }
            });
            var allTds = Array.from(renderedTable.querySelectorAll("tbody td"));
            allTds.forEach(function(td, idx) {
                if (td.getAttribute("data-type") !== "checkbox" && td.getAttribute("data-type") !== "action") {
                    bindGridCellEvents(td, false, idx % columns.length);
                }
            });
        }

        var compEl = container.closest(".lf-component");
        if (compEl) {
            if (!compEl.style.height) {
                var rowHNum = parseInt(rowHeightVal) || 40;
                var headerH = 40;
                var footerH = showPagination ? 36 : 0;
                var calculatedHeight = headerH + (rowCount * rowHNum) + footerH;
                compEl.style.height = calculatedHeight + "px";
            }
            if (window.updateHandles) window.updateHandles(compEl);
        }
    };

    var PRESETS = {
        standard: [
            { name: "", type: "checkbox", width: "60px", align: "center" },
            { name: "\uBC88\uD638", type: "number", width: "80px", align: "center" },
            { name: "\uD56d\uBAA9\uBA85", type: "text", width: "460px", align: "center" }
        ],
        product: [
            { name: "", type: "checkbox", width: "50px", align: "center" },
            { name: "\uC0C1\uD488\uCF54\uB4DC", type: "number", width: "100px", align: "center" },
            { name: "\uC0C1\uD488\uBA85", type: "text", width: "260px", align: "left", clickable: true },
            { name: "\uCE74\uD14C\uACE0\uB9AC", type: "text", width: "120px", align: "left" },
            { name: "\uD310\uB9E4\uAC00", type: "currency", width: "120px", align: "right" },
            { name: "\uC804\uC2DC\uC0C1\uD0DC", type: "status", width: "100px", align: "center" },
            { name: "\uAD00\uB9AC", type: "action", width: "90px", align: "center" }
        ],
        order: [
            { name: "", type: "checkbox", width: "50px", align: "center" },
            { name: "\uC8FC\uBB38\uBC88\uD638", type: "text", width: "150px", align: "center", clickable: true },
            { name: "\uC8FC\uBB38\uC77C\uC2DC", type: "datetime", width: "160px", align: "center" },
            { name: "\uC8FC\uBB38\uC790", type: "author", width: "100px", align: "left" },
            { name: "\uACB0\uC81C\uAE08\uC561", type: "currency", width: "130px", align: "right" },
            { name: "\uC8FC\uBB38\uC0C1\uD0DC", type: "status", width: "110px", align: "center" },
            { name: "\uAD00\uB9AC", type: "action", width: "90px", align: "center" }
        ],
        user: [
            { name: "", type: "checkbox", width: "50px", align: "center" },
            { name: "\uD68C\uC680\uBC88\uD638", type: "number", width: "90px", align: "right" },
            { name: "\uD68C\uC680\uBA85", type: "author", width: "120px", align: "left", clickable: true },
            { name: "\uAC00\uC785\uC77C\uC2DC", type: "datetime", width: "160px", align: "center" },
            { name: "\uD68C\uC680\uB4F1\uAE09", type: "badge", width: "100px", align: "center" },
            { name: "\uACC4\uC815\uC0C1\uD0DC", type: "status", width: "100px", align: "center" },
            { name: "\uAD00\uB9AC", type: "action", width: "90px", align: "center" }
        ]
    };

    window.v4MessageHandlers = window.v4MessageHandlers || {};
    window.v4MessageHandlers["LF_UPDATE_GRID_PROPERTIES"] = function(d) {
        var s = null;
        if (d && d.id) {
            var el = document.getElementById(d.id);
            if (el) {
                s = el.closest(".lf-component") || el;
            }
        }
        if (!s) {
            s = document.querySelector(".lf-component.selected") || 
                (document.querySelector(".selected-cell") ? document.querySelector(".selected-cell").closest(".lf-component") : null);
        }
        if (!s) return;
        var container = s.classList.contains("v4-grid-container") ? s : (s.querySelector(".v4-grid-container") || s.closest(".v4-grid-container"));
        if (!container) return;
        var comp = container.closest(".lf-component") || s;

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        var currentCols = [];
        var rawCols = container.getAttribute("data-columns");
        if (rawCols) {
            try {
                currentCols = JSON.parse(rawCols);
            } catch(e) {}
        }
        if (!currentCols || currentCols.length === 0) {
            currentCols = PRESETS.standard;
        }

        var fillMock = false;
        if (d.preset && PRESETS[d.preset]) {
            currentCols = JSON.parse(JSON.stringify(PRESETS[d.preset]));
            if (d.preset !== "standard") {
                fillMock = true;
            }
        }
        if (d.fillMock !== undefined) {
            fillMock = !!d.fillMock;
        }
        
        var rowCount = parseInt(container.getAttribute("data-row-count")) || 5;
        var showPagination = container.getAttribute("data-pagination") !== "false";
        var showZebra = container.getAttribute("data-zebra") === "true";
        
        if (d.columns !== undefined) {
            currentCols = d.columns;
        }
        if (d.headers !== undefined) {
            d.headers.forEach(function(headerText, index) {
                if (currentCols[index]) {
                    currentCols[index].name = headerText;
                }
            });
        }
        if (d.rowCount !== undefined) {
            rowCount = Math.min(20, Math.max(1, parseInt(d.rowCount) || 5));
        }
        if (d.pagination !== undefined) {
            showPagination = !!d.pagination;
        }
        if (d.zebra !== undefined) {
            showZebra = !!d.zebra;
        }
        if (d.bg !== undefined) {
            container.style.backgroundColor = d.bg;
        }
        if (d.border !== undefined) {
            container.style.borderColor = d.border;
        }
        if (d.width !== undefined) {
            comp.style.setProperty("width", d.width + "px", "important");
            if (window.updateHandles) window.updateHandles(comp);
        }
        if (d.height !== undefined) {
            comp.style.setProperty("height", d.height + "px", "important");
            if (window.updateHandles) window.updateHandles(comp);
        }
        
        var targetRowHeight = d.rowHeight;
        if (targetRowHeight !== undefined) {
            container.setAttribute("data-row-height", targetRowHeight);
        } else {
            targetRowHeight = container.getAttribute("data-row-height");
        }
        if (window.renderGrid) {
            window.renderGrid(container, currentCols, rowCount, showPagination, targetRowHeight, showZebra, fillMock);
        }
        
        if (typeof window.enforceDesignSystem === "function") window.enforceDesignSystem();
        if (typeof window.markDirty === "function") window.markDirty();
        
        if (typeof window._getCompStyles === "function" && window.parent) {
            window.parent.postMessage(Object.assign({
                type: "LF_COMP_SELECTED"
            }, window._getCompStyles(comp)), "*");
        }
    };
})();
`;

