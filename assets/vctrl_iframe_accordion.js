/**
 * assets/vctrl_iframe_accordion.js
 * Modular rendering engine for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4AccordionScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4AccordionScript = `
(function() {
    console.log("[V4 Accordion] Module loaded.");
    const CHEVRON_SVG_HTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px; height:13px; display:inline-block; vertical-align:middle; pointer-events:none;"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    function renderAccordionChevron(container) {
        const chevronEl = container.querySelector('.v4-accordion-chevron');
        if (!chevronEl) return;
        const cType = container.getAttribute('data-chevron-type') || 'triangle';
        if (cType === 'chevron') {
            chevronEl.innerHTML = CHEVRON_SVG_HTML;
            chevronEl.style.fontSize = '0px';
            chevronEl.style.display = 'inline-flex';
            chevronEl.style.alignItems = 'center';
            chevronEl.style.justifyContent = 'center';
        } else {
            chevronEl.innerHTML = '▼';
            chevronEl.style.fontSize = '10px';
            chevronEl.style.display = 'inline-block';
        }
    }

    function applyAccordionBorder(container, borderType, borderColor) {
        const bType = borderType || container.getAttribute('data-border-type') || 'all';
        container.setAttribute('data-border-type', bType);
        
        const color = borderColor !== undefined ? borderColor : (container.getAttribute('data-border-color') || container.style.borderColor || '#ffffff');
        if (borderColor !== undefined) {
            container.setAttribute('data-border-color', borderColor);
        }
        
        if (bType === 'top-bottom') {
            container.style.borderLeft = 'none';
            container.style.borderRight = 'none';
            container.style.borderRadius = '0px';
            if (!color || color === 'transparent') {
                container.style.borderTop = 'none';
                container.style.borderBottom = 'none';
            } else {
                container.style.borderTop = '1.6px solid ' + color;
                container.style.borderBottom = '1.6px solid ' + color;
            }
        } else {
            container.style.borderRadius = '8px';
            if (!color || color === 'transparent') {
                container.style.border = 'none';
            } else {
                container.style.border = '1.6px solid ' + color;
                container.style.borderLeft = '1.6px solid ' + color;
                container.style.borderRight = '1.6px solid ' + color;
                container.style.borderTop = '1.6px solid ' + color;
                container.style.borderBottom = '1.6px solid ' + color;
            }
        }
    }

    window.renderAccordionChevron = renderAccordionChevron;
    window.applyAccordionBorder = applyAccordionBorder;

    window.renderAccordionBody = function(container) {
        const body = container.querySelector('.v4-accordion-body');
        if (!body) return;
        
        const depthType = container.getAttribute('data-depth-type') || '1depth';
        const currentItemHeight = parseInt(container.getAttribute('data-item-height')) || 36;
        const compId = container.closest('.lf-component')?.id || 'accordion';
        
        // Preserve inherited/existing text color to prevent unexpected reset on item activation
        const headerTitle = container.querySelector('.v4-accordion-title-text');
        const existingSpan = body.querySelector('.v4-editable-cell') || body.querySelector('.v4-accordion-item');
        const inheritedColor = (existingSpan && existingSpan.style.color) || 
                               (headerTitle && headerTitle.style.color) || 
                               container.style.color || 
                               '';
        
        function isDarkColor(colorStr) {
            if (!colorStr || colorStr === 'transparent' || colorStr === 'none') return false;
            var r = 30, g = 41, b = 59;
            if (colorStr.indexOf('#') === 0) {
                var hex = colorStr.replace('#', '');
                if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                r = parseInt(hex.substring(0, 2), 16) || 0;
                g = parseInt(hex.substring(2, 4), 16) || 0;
                b = parseInt(hex.substring(4, 6), 16) || 0;
            } else if (colorStr.indexOf('rgb') === 0) {
                var m = colorStr.match(/\d+/g);
                if (m && m.length >= 3) {
                    r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]);
                }
            }
            var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return lum < 0.6;
        }

        const customTextColor = container.getAttribute('data-text-color') || '';
        const customBodyBg = container.getAttribute('data-body-bg');
        const isContainerDark = isDarkColor(container.style.backgroundColor || 'rgb(30, 41, 59)');
        
        if (customBodyBg !== null && customBodyBg !== undefined) {
            body.style.backgroundColor = customBodyBg;
            body.style.background = customBodyBg;
        }
        
        const defaultTextColor = isContainerDark ? '#ffffff' : '#0f172a';
        const finalColor = customTextColor || inheritedColor || defaultTextColor;
        const t1Color = customTextColor || inheritedColor || defaultTextColor;
        const t2Color = customTextColor || inheritedColor || (isContainerDark ? '#e2e8f0' : '#334155');
        const dividerColor = isContainerDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        const radioAccent = isContainerDark ? '#00e5ff' : '#2563eb';
        const arrowColor = customTextColor || (isContainerDark ? '#94a3b8' : '#64748b');
        
        const headerFontSize = parseInt(container.getAttribute('data-header-font-size')) || 12;
        const subFontSize = parseInt(container.getAttribute('data-sub-font-size')) || 12;

        if (headerTitle) {
            headerTitle.style.fontSize = headerFontSize + 'px';
            if (customTextColor) {
                headerTitle.style.color = customTextColor;
            }
        }
        renderAccordionChevron(container);
        applyAccordionBorder(container);

        const isExp = container.getAttribute('data-expanded') === 'true';
        const bType = container.getAttribute('data-border-type') || 'all';
        const headerEl = container.querySelector('.v4-accordion-header');
        if (headerEl) {
            if (bType === 'top-bottom' && !isExp) {
                headerEl.style.borderBottom = 'none';
            } else {
                headerEl.style.borderBottom = '1.6px solid ' + dividerColor;
            }
        }
        
        if (depthType === '1depth') {
            // Render 1-depth (flat list with radio buttons)
            const targetCount = parseInt(container.getAttribute('data-sub-count')) || 0;
            let subTexts = [];
            let activeIndex = -1;
            try {
                const hierarchyStr = container.getAttribute('data-hierarchy');
                if (hierarchyStr) {
                    const parsed = JSON.parse(hierarchyStr);
                    if (Array.isArray(parsed)) {
                        subTexts = parsed.map((item, idx) => {
                            const t = typeof item === 'string' ? item : (item.text || item.title || '');
                            if (typeof item === 'object' && item.active) {
                                activeIndex = idx;
                            }
                            return t;
                        });
                    }
                }
            } catch (e) {}
            
            if (subTexts.length === 0) {
                subTexts = Array.from(body.querySelectorAll('.v4-accordion-item')).map((el, idx) => {
                    const radio = el.querySelector('.v4-accordion-radio');
                    if (radio && (radio.checked || radio.hasAttribute('checked'))) {
                        activeIndex = idx;
                    }
                    const textSpan = el.querySelector('.v4-editable-cell') || el;
                    return textSpan.innerText;
                });
            }
            while (subTexts.length < targetCount) {
                subTexts.push("Sub Item " + (subTexts.length + 1));
            }
            subTexts = subTexts.slice(0, targetCount);
            
            body.innerHTML = '';
            subTexts.forEach((text, i) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'v4-accordion-item';
                itemEl.style.cssText = "padding:8px 12px; font-size:" + subFontSize + "px; color:" + finalColor + "; font-family:'Inter',sans-serif; outline:none; display:flex; align-items:center; box-sizing:border-box; padding-top:0; padding-bottom:0;";
                itemEl.style.setProperty('height', currentItemHeight + 'px', 'important');
                itemEl.style.setProperty('line-height', currentItemHeight + 'px', 'important');
                if (i < targetCount - 1) {
                    itemEl.style.borderBottom = '1.6px solid ' + dividerColor;
                }
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'accordion-select-' + compId;
                radio.className = 'v4-accordion-radio';
                radio.style.cssText = 'margin-right: 8px; accent-color: ' + radioAccent + '; cursor: pointer;';
                if (i === activeIndex) {
                    radio.setAttribute('checked', 'true');
                    radio.checked = true;
                }
                
                const span = document.createElement('span');
                span.className = 'v4-editable-cell';
                span.contentEditable = 'true';
                span.style.cssText = 'outline: none; flex: 1; color: ' + finalColor + '; font-size: ' + subFontSize + 'px;';
                span.innerText = text;
                if (i === activeIndex) {
                    span.style.textDecoration = 'underline';
                }
                
                const updateState = () => {
                    const items = [];
                    body.querySelectorAll('.v4-accordion-item').forEach((itemNode, idx) => {
                        const r = itemNode.querySelector('.v4-accordion-radio');
                        const s = itemNode.querySelector('.v4-editable-cell');
                        items.push({
                            text: s ? s.innerText : '',
                            title: s ? s.innerText : '',
                            active: r ? r.checked : false
                        });
                    });
                    container.setAttribute('data-hierarchy', JSON.stringify(items));
                    markDirty();
                };

                radio.addEventListener('change', () => {
                    body.querySelectorAll('.v4-accordion-radio').forEach(r => {
                        if (r !== radio) {
                            r.removeAttribute('checked');
                            r.checked = false;
                            const tSpan = r.nextElementSibling;
                            if (tSpan) tSpan.style.textDecoration = 'none';
                        }
                    });
                    radio.setAttribute('checked', 'true');
                    radio.checked = true;
                    span.style.textDecoration = 'underline';
                    updateState();
                });

                span.addEventListener('input', () => {
                    updateState();
                });
                
                itemEl.appendChild(radio);
                itemEl.appendChild(span);
                body.appendChild(itemEl);
            });
        } else {
            // Render 2-depth (hierarchical tree with 2nd tier radio buttons)
            let hierarchy = [];
            try {
                const hierarchyStr = container.getAttribute('data-hierarchy');
                if (hierarchyStr) {
                    hierarchy = JSON.parse(hierarchyStr);
                }
            } catch (e) {}
            
            if (!Array.isArray(hierarchy) || hierarchy.length === 0) {
                hierarchy = [
                    {
                        title: "1Tier Category 1",
                        text: "1Tier Category 1",
                        children: [
                            { text: "2Tier Subcategory 1.1", active: true },
                            { text: "2Tier Subcategory 1.2", active: false }
                        ],
                        items: [
                            { text: "2Tier Subcategory 1.1", active: true },
                            { text: "2Tier Subcategory 1.2", active: false }
                        ]
                    }
                ];
                container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
            }
            
            body.innerHTML = '';
            
            hierarchy.forEach((t1, t1Idx) => {
                const t1Group = document.createElement('div');
                t1Group.className = 'v4-accordion-tier1-group';
                t1Group.style.cssText = 'border-bottom: 1.6px solid ' + dividerColor + '; display: flex; flex-direction: column;';
                
                // 1st Tier Header
                const t1Header = document.createElement('div');
                t1Header.className = 'v4-accordion-tier1-header';
                t1Header.style.cssText = 'padding: 8px 12px; font-size: ' + subFontSize + 'px; font-weight: bold; color: ' + t1Color + '; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: ' + (isContainerDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') + '; height: ' + currentItemHeight + 'px; box-sizing: border-box;';
                
                const t1Span = document.createElement('span');
                t1Span.className = 'v4-editable-cell';
                t1Span.contentEditable = 'true';
                t1Span.style.cssText = 'outline: none; flex: 1; color: ' + t1Color + '; font-size: ' + subFontSize + 'px;';
                t1Span.innerText = t1.title || t1.text || ('1Tier Category ' + (t1Idx + 1));
                t1Span.addEventListener('click', (e) => e.stopPropagation());
                t1Span.addEventListener('input', () => {
                    t1.text = t1Span.innerText;
                    t1.title = t1Span.innerText;
                    container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
                    markDirty();
                });
                
                const t1Arrow = document.createElement('span');
                t1Arrow.className = 'tier-arrow';
                t1Arrow.style.cssText = 'width: 6px; height: 6px; border-right: 1.6px solid ' + arrowColor + '; border-bottom: 1.6px solid ' + arrowColor + '; transform: rotate(45deg); transition: transform 0.2s; margin-right: 8px; display: inline-block; flex-shrink: 0;';
                
                t1Header.appendChild(t1Span);
                const t1Children = t1.children || t1.items || [];
                if (t1Children && t1Children.length > 0) {
                    t1Header.appendChild(t1Arrow);
                }
                t1Group.appendChild(t1Header);
                
                // 1st Tier Body (contains 2nd Tier items)
                const t1Body = document.createElement('div');
                t1Body.className = 'v4-accordion-tier1-body';
                t1Body.style.cssText = 'display: flex; flex-direction: column; transition: all 0.2s ease; overflow: hidden;';
                
                let t1Expanded = true;
                t1Header.addEventListener('click', () => {
                    t1Expanded = !t1Expanded;
                    t1Body.style.display = t1Expanded ? 'flex' : 'none';
                    t1Arrow.style.transform = t1Expanded ? 'rotate(45deg)' : 'rotate(-45deg)';
                });
                
                if (t1Children && t1Children.length > 0) {
                    t1Children.forEach((t2, t2Idx) => {
                        const t2Wrapper = document.createElement('div');
                        t2Wrapper.className = 'v4-accordion-tier2-wrapper';
                        t2Wrapper.style.cssText = 'display: flex; flex-direction: column; border-bottom: 1.6px solid ' + (isContainerDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)') + ';';
                        
                        // 2nd Tier Header (Acts as lowest tier item, has radio button)
                        const t2Header = document.createElement('div');
                        t2Header.className = 'v4-accordion-tier2-header';
                        t2Header.style.cssText = 'padding: 8px 12px 8px 24px; font-size: ' + subFontSize + 'px; color: ' + t2Color + '; display: flex; align-items: center; cursor: pointer; height: ' + currentItemHeight + 'px; box-sizing: border-box;';
                        
                        const t2Radio = document.createElement('input');
                        t2Radio.type = 'radio';
                        t2Radio.name = 'accordion-select-' + compId;
                        t2Radio.className = 'v4-accordion-radio';
                        t2Radio.style.cssText = 'margin-right: 8px; accent-color: ' + radioAccent + '; cursor: pointer;';
                        if (t2.active) {
                            t2Radio.setAttribute('checked', 'true');
                            t2Radio.checked = true;
                        }
                        
                        const t2Span = document.createElement('span');
                        t2Span.className = 'v4-editable-cell';
                        t2Span.contentEditable = 'true';
                        t2Span.style.cssText = 'outline: none; flex: 1; color: ' + t2Color + '; font-size: ' + subFontSize + 'px;';
                        t2Span.innerText = t2.text || t2.title || ('2Tier Item ' + (t2Idx + 1));
                        if (t2.active) {
                            t2Span.style.textDecoration = 'underline';
                        }
                        t2Span.addEventListener('click', (e) => e.stopPropagation());
                        t2Span.addEventListener('input', () => {
                            t2.text = t2Span.innerText;
                            t2.title = t2Span.innerText;
                            container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
                            markDirty();
                        });
                        
                        t2Radio.addEventListener('change', () => {
                            // Uncheck all other radios in the entire accordion
                            container.querySelectorAll('.v4-accordion-radio').forEach(r => {
                                if (r !== t2Radio) {
                                    r.removeAttribute('checked');
                                    r.checked = false;
                                    const tSpan = r.nextElementSibling;
                                    if (tSpan) tSpan.style.textDecoration = 'none';
                                }
                            });
                            t2Radio.setAttribute('checked', 'true');
                            t2Radio.checked = true;
                            t2Span.style.textDecoration = 'underline';
                            
                            // Update active status in hierarchy JSON
                            hierarchy.forEach(category => {
                                const catItems = category.children || category.items;
                                if (catItems) {
                                    catItems.forEach(item => {
                                        item.active = (item === t2);
                                    });
                                }
                            });
                            container.setAttribute('data-hierarchy', JSON.stringify(hierarchy));
                            markDirty();
                        });
                        
                        t2Header.appendChild(t2Radio);
                        t2Header.appendChild(t2Span);
                        t2Wrapper.appendChild(t2Header);
                        t1Body.appendChild(t2Wrapper);
                    });
                }
                t1Group.appendChild(t1Body);
                body.appendChild(t1Group);
            });
        }
    };

    window.v4MessageHandlers = window.v4MessageHandlers || {};
    window.v4MessageHandlers['LF_UPDATE_ACCORDION_PROPERTIES'] = function(d) {
        var s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
        if (!s) return;
        var container = s.querySelector('.v4-accordion-container') || (s.classList.contains('v4-accordion-container') ? s : null);
        if (container) {
            if (window.V4UndoManager) window.V4UndoManager.saveState();
            
            if (d.width !== undefined) {
                s.style.width = d.width + 'px';
                if (typeof window.updateHandles === 'function') window.updateHandles(s);
            }
            
            if (d.itemHeight !== undefined) {
                container.setAttribute('data-item-height', d.itemHeight);
                var header = container.querySelector('.v4-accordion-header');
                if (header) {
                    header.style.height = d.itemHeight + 'px';
                }
                container.querySelectorAll('.v4-accordion-item').forEach(function(item) {
                    item.style.setProperty('height', d.itemHeight + 'px', 'important');
                    item.style.setProperty('line-height', d.itemHeight + 'px', 'important');
                    item.style.setProperty('display', 'flex', 'important');
                    item.style.setProperty('align-items', 'center', 'important');
                    item.style.setProperty('box-sizing', 'border-box', 'important');
                    item.style.setProperty('padding-top', '0', 'important');
                    item.style.setProperty('padding-bottom', '0', 'important');
                });
            }
            
            if (d.headerText !== undefined) {
                var titleText = container.querySelector('.v4-accordion-title-text');
                if (titleText && titleText.innerText !== d.headerText) {
                    titleText.innerText = d.headerText;
                }
            }

            if (d.headerFontSize !== undefined) {
                var hSize = parseInt(d.headerFontSize) || 12;
                container.setAttribute('data-header-font-size', hSize);
                var titleText = container.querySelector('.v4-accordion-title-text');
                if (titleText) {
                    titleText.style.fontSize = hSize + 'px';
                }
            }

            if (d.subFontSize !== undefined) {
                var sSize = parseInt(d.subFontSize) || 12;
                container.setAttribute('data-sub-font-size', sSize);
                container.querySelectorAll('.v4-accordion-item').forEach(function(item) {
                    item.style.fontSize = sSize + 'px';
                });
                container.querySelectorAll('.v4-accordion-tier1-header').forEach(function(h) {
                    h.style.fontSize = sSize + 'px';
                });
                container.querySelectorAll('.v4-accordion-tier2-header').forEach(function(h) {
                    h.style.fontSize = sSize + 'px';
                });
                container.querySelectorAll('.v4-accordion-body .v4-editable-cell').forEach(function(cell) {
                    cell.style.fontSize = sSize + 'px';
                });
            }
            
            if (d.chevronType !== undefined) {
                container.setAttribute('data-chevron-type', d.chevronType);
                renderAccordionChevron(container);
            }

            if (d.borderType !== undefined) {
                applyAccordionBorder(container, d.borderType);
            }

            if (d.expanded !== undefined) {
                var isExp = d.expanded ? true : false;
                container.setAttribute('data-expanded', isExp ? 'true' : 'false');
                var bodyEl = container.querySelector('.v4-accordion-body');
                var chevronEl = container.querySelector('.v4-accordion-chevron');
                if (bodyEl) {
                    bodyEl.style.display = isExp ? 'flex' : 'none';
                }
                if (chevronEl) {
                    chevronEl.style.transform = isExp ? 'rotate(180deg)' : 'rotate(0deg)';
                }
                var itemH = parseInt(container.getAttribute('data-item-height')) || 36;
                var hdrEl = container.querySelector('.v4-accordion-header');
                var hdrH = hdrEl ? (hdrEl.offsetHeight || itemH) : itemH;
                var hdrBorderType = container.getAttribute('data-border-type') || 'all';
                if (hdrEl) {
                    if (hdrBorderType === 'top-bottom' && !isExp) {
                        hdrEl.style.borderBottom = 'none';
                    } else {
                        var isDarkCont = isDarkColor(container.style.backgroundColor || 'rgb(30, 41, 59)');
                        var divCol = isDarkCont ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
                        hdrEl.style.borderBottom = '1.6px solid ' + divCol;
                    }
                }
                if (isExp) {
                    var bodyH = bodyEl ? (bodyEl.scrollHeight || bodyEl.offsetHeight || (3 * itemH)) : (3 * itemH);
                    s.style.height = (hdrH + bodyH) + 'px';
                } else {
                    s.style.height = hdrH + 'px';
                }
                if (typeof window.updateHandles === 'function') window.updateHandles(s);
            }
            
            if (d.depthType !== undefined) {
                container.setAttribute('data-depth-type', d.depthType);
            }
            if (d.hierarchy !== undefined) {
                container.setAttribute('data-hierarchy', typeof d.hierarchy === 'string' ? d.hierarchy : JSON.stringify(d.hierarchy));
            }
            if (d.subCount !== undefined) {
                container.setAttribute('data-sub-count', d.subCount);
            }
            
            if (d.bg !== undefined) {
                container.style.backgroundColor = d.bg;
            }
            if (d.border !== undefined) {
                applyAccordionBorder(container, undefined, d.border);
            }
            if (d.bodyBg !== undefined) {
                container.setAttribute('data-body-bg', d.bodyBg);
                var bEl = container.querySelector('.v4-accordion-body');
                if (bEl) {
                    bEl.style.backgroundColor = d.bodyBg;
                    bEl.style.background = d.bodyBg;
                }
            }
            if (d.textColor !== undefined) {
                container.setAttribute('data-text-color', d.textColor);
                var titleTextEl = container.querySelector('.v4-accordion-title-text');
                if (titleTextEl) {
                    titleTextEl.style.color = d.textColor;
                }
                var chevronEl2 = container.querySelector('.v4-accordion-chevron');
                if (chevronEl2) {
                    chevronEl2.style.color = d.textColor;
                }
            }
            
            // Call unified hierarchical renderer
            if (typeof window.renderAccordionBody === 'function') {
                window.renderAccordionBody(container);
            }
            
            // Sync height when expanded if contents changed
            if (container.getAttribute('data-expanded') === 'true') {
                var bodyElAfter = container.querySelector('.v4-accordion-body');
                var hdrElAfter = container.querySelector('.v4-accordion-header');
                var itemHAfter = parseInt(container.getAttribute('data-item-height')) || 36;
                var hdrHAfter = hdrElAfter ? (hdrElAfter.offsetHeight || itemHAfter) : itemHAfter;
                var bodyHAfter = bodyElAfter ? (bodyElAfter.scrollHeight || bodyElAfter.offsetHeight || (3 * itemHAfter)) : (3 * itemHAfter);
                s.style.height = (hdrHAfter + bodyHAfter) + 'px';
                if (typeof window.updateHandles === 'function') window.updateHandles(s);
            }
            
            if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
            if (typeof window.markDirty === 'function') window.markDirty();
            
            if (typeof window._getCompStyles === 'function' && window.parent) {
                window.parent.postMessage(Object.assign({
                    type: 'LF_COMP_SELECTED'
                }, window._getCompStyles(s)), '*');
            }
        }
    };
})();
`;
