/**
 * assets/inspector_accordion.js
 * Domain Inspector Module: Accordion Component
 * Encapsulates state synchronization (Read), event handling (Write), and hierarchy rendering.
 */
(function() {
    console.log("[Inspector Accordion] Domain module loaded.");

    const highlightActive = (btn, isActive) => {
        if (!btn) return;
        btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
        btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
        btn.style.fontWeight = isActive ? 'bold' : 'normal';
    };

    const notifyAccordion = (data) => {
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ACCORDION_PROPERTIES', data);
        } else if (window.EditorBus) {
            window.EditorBus.sendToIframe(Object.assign({ type: 'LF_UPDATE_ACCORDION_PROPERTIES' }, data));
        }
    };

    const syncSubItemInputs = (texts) => {
        const container = document.getElementById('accordion-sub-items-container');
        if (!container) return;

        const activeEl = document.activeElement;
        const isTypingInSubItems = activeEl && (container.contains(activeEl) || activeEl.classList.contains('accordion-sub-input'));
        if (isTypingInSubItems) return;

        let activeIndex = -1;
        try {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
                const activeElInIframe = iframe.contentWindow.document.querySelector('.lf-component.selected');
                if (activeElInIframe) {
                    const accordionContainer = activeElInIframe.querySelector('.v4-accordion-container') || activeElInIframe;
                    if (accordionContainer) {
                        const hStr = accordionContainer.getAttribute('data-hierarchy');
                        if (hStr) {
                            const parsed = JSON.parse(hStr);
                            activeIndex = parsed.findIndex(item => item.active === true);
                        }
                    }
                }
            }
        } catch(e) {}

        container.innerHTML = '';
        texts.forEach((text, index) => {
            const div = document.createElement('div');
            div.className = 'v4-prop-row';
            div.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 6px;';
            div.innerHTML = 
                '<input type="radio" name="sidebar-accordion-active" class="sidebar-accordion-radio" ' + (index === activeIndex ? 'checked' : '') + ' style="accent-color: #00e5ff; cursor: pointer; flex-shrink: 0;">' +
                '<span style="font-size: 11px; color: #94a3b8; width: 45px; flex-shrink: 0;">Sub ' + (index + 1) + '</span>' +
                '<div style="flex: 1;">' +
                    '<input type="text" class="v4-prop-input accordion-sub-input" data-index="' + index + '" value="' + (text || '') + '" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; outline: none; box-sizing: border-box;">' +
                '</div>';
            
            const radio = div.querySelector('.sidebar-accordion-radio');
            const input = div.querySelector('.accordion-sub-input');
            if (radio && input) {
                radio.addEventListener('change', () => {
                    const allDivs = Array.from(container.querySelectorAll('.accordion-sub-input'));
                    const allRadios = Array.from(container.querySelectorAll('.sidebar-accordion-radio'));
                    const hierarchy = allDivs.map((inp, idx) => ({
                        text: inp.value,
                        active: allRadios[idx] ? allRadios[idx].checked : false
                    }));
                    notifyAccordion({
                        subTexts: allDivs.map(i => i.value),
                        hierarchy: hierarchy
                    });
                });
            }

            if (input) {
                input.addEventListener('input', () => {
                    const allInputs = Array.from(container.querySelectorAll('.accordion-sub-input'));
                    const allRadios = Array.from(container.querySelectorAll('.sidebar-accordion-radio'));
                    const currentTexts = allInputs.map(i => i.value);
                    const hierarchy = currentTexts.map((txt, idx) => ({
                        text: txt,
                        active: allRadios[idx] ? allRadios[idx].checked : false
                    }));
                    notifyAccordion({ subTexts: currentTexts, hierarchy: hierarchy });
                });
            }
            container.appendChild(div);
        });
    };

    const syncHierarchyInputs = (hierarchy) => {
        const container = document.getElementById('accordion-hierarchy-container');
        if (!container) return;

        const activeEl = document.activeElement;
        const isTyping = activeEl && (container.contains(activeEl) || activeEl.classList.contains('accordion-h-input'));
        if (isTyping) return;

        const commitHierarchy = () => {
            notifyAccordion({ hierarchy: hierarchy });
        };

        container.innerHTML = '';
        hierarchy.forEach((t1, i1) => {
            const t1Div = document.createElement('div');
            t1Div.className = 'v4-accordion-tier1-group';
            t1Div.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px; margin-bottom: 8px;';
            
            const t1Header = document.createElement('div');
            t1Header.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
            t1Header.innerHTML = 
                '<span style="font-size: 11px; font-weight: bold; color: #38bdf8; width: 45px; flex-shrink: 0;">1T-' + (i1 + 1) + '</span>' +
                '<input type="text" class="v4-prop-input accordion-h-input" value="' + (t1.title || '') + '" style="flex:1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; outline: none; box-sizing: border-box;">' +
                '<button class="btn-del-tier1 btn-secondary" style="width: 20px; height: 20px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #ef4444; cursor: pointer; font-size: 12px;">&times;</button>';
            
            const t1Input = t1Header.querySelector('input');
            if (t1Input) {
                t1Input.addEventListener('input', () => {
                    t1.title = t1Input.value;
                    commitHierarchy();
                });
            }
            const delT1Btn = t1Header.querySelector('.btn-del-tier1');
            if (delT1Btn) {
                delT1Btn.addEventListener('click', () => {
                    hierarchy.splice(i1, 1);
                    commitHierarchy();
                    syncHierarchyInputs(hierarchy);
                });
            }
            t1Div.appendChild(t1Header);

            const t2Container = document.createElement('div');
            t2Container.style.cssText = 'padding-left: 12px; display: flex; flex-direction: column; gap: 4px; border-left: 2px solid rgba(56, 189, 248, 0.2); margin-left: 8px; margin-bottom: 6px;';
            
            (t1.items || []).forEach((t2, i2) => {
                const t2Div = document.createElement('div');
                t2Div.style.cssText = 'display: flex; align-items: center; gap: 6px;';
                t2Div.innerHTML = 
                    '<input type="radio" name="sidebar-accordion-active" class="sidebar-accordion-radio" ' + (t2.active ? 'checked' : '') + ' style="accent-color: #00e5ff; cursor: pointer; flex-shrink: 0;">' +
                    '<span style="font-size: 10px; color: #94a3b8; width: 35px; flex-shrink: 0;">2T-' + (i2 + 1) + '</span>' +
                    '<input type="text" class="v4-prop-input accordion-h-input" value="' + (t2.text || '') + '" style="flex:1; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 3px 5px; border-radius: 3px; font-size: 10px; outline: none; box-sizing: border-box;">' +
                    '<button class="btn-del-tier2 btn-secondary" style="width: 18px; height: 18px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #ef4444; cursor: pointer; font-size: 11px;">&times;</button>';
                
                const t2Radio = t2Div.querySelector('.sidebar-accordion-radio');
                if (t2Radio) {
                    t2Radio.addEventListener('change', () => {
                        const allRadios = document.querySelectorAll('.sidebar-accordion-radio');
                        allRadios.forEach(r => { if (r !== t2Radio) r.checked = false; });
                        hierarchy.forEach(g => {
                            (g.items || []).forEach(item => { item.active = false; });
                        });
                        t2.active = true;
                        commitHierarchy();
                    });
                }
                const t2Input = t2Div.querySelector('input[type="text"]');
                if (t2Input) {
                    t2Input.addEventListener('input', () => {
                        t2.text = t2Input.value;
                        commitHierarchy();
                    });
                }
                const delT2Btn = t2Div.querySelector('.btn-del-tier2');
                if (delT2Btn) {
                    delT2Btn.addEventListener('click', () => {
                        t1.items.splice(i2, 1);
                        commitHierarchy();
                        syncHierarchyInputs(hierarchy);
                    });
                }
                t2Container.appendChild(t2Div);
            });
            t1Div.appendChild(t2Container);

            const addT2Btn = document.createElement('button');
            addT2Btn.className = 'btn-secondary';
            addT2Btn.style.cssText = 'font-size: 10px; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #cbd5e1; cursor: pointer; margin-left: 12px; margin-top: 2px;';
            addT2Btn.textContent = '+ 2-Tier Item';
            addT2Btn.addEventListener('click', () => {
                if (!t1.items) t1.items = [];
                t1.items.push({ text: 'Sub Item ' + (t1.items.length + 1), active: false });
                commitHierarchy();
                syncHierarchyInputs(hierarchy);
            });
            t1Div.appendChild(addT2Btn);

            container.appendChild(t1Div);
        });
    };

    window.InspectorAccordion = {
        sync: function(comp) {
            if (!comp) return;

            const headerTextInp = document.getElementById('prop-accordion-header-text');
            const subCountInp = document.getElementById('prop-accordion-sub-count');
            const expandY = document.getElementById('btn-accordion-expand-y');
            const expandN = document.getElementById('btn-accordion-expand-n');
            
            if (headerTextInp && document.activeElement !== headerTextInp && comp.accordionHeaderText !== undefined) {
                headerTextInp.value = comp.accordionHeaderText;
            }
            
            if (subCountInp && document.activeElement !== subCountInp && comp.accordionSubCount !== undefined) {
                subCountInp.value = comp.accordionSubCount;
            }

            const widthInp = document.getElementById('prop-accordion-width');
            if (widthInp && document.activeElement !== widthInp && comp.w !== undefined) {
                widthInp.value = comp.w;
            }

            const heightInp = document.getElementById('prop-accordion-height');
            if (heightInp && document.activeElement !== heightInp && comp.accordionItemHeight !== undefined) {
                heightInp.value = comp.accordionItemHeight;
            }

            if (expandY && expandN) {
                highlightActive(expandY, comp.accordionExpanded === true);
                highlightActive(expandN, comp.accordionExpanded === false);
            }

            const depthType = comp.accordionDepthType || '1depth';
            const depth1Btn = document.getElementById('btn-accordion-depth-1');
            const depth2Btn = document.getElementById('btn-accordion-depth-2');
            const settings1D = document.getElementById('accordion-1depth-settings');
            const settings2D = document.getElementById('accordion-2depth-settings');

            if (depth1Btn && depth2Btn) {
                highlightActive(depth1Btn, depthType === '1depth');
                highlightActive(depth2Btn, depthType === '2depth');
            }
            if (settings1D) settings1D.style.display = depthType === '1depth' ? 'block' : 'none';
            if (settings2D) settings2D.style.display = depthType === '2depth' ? 'block' : 'none';
            
            if (depthType === '1depth') {
                syncSubItemInputs(comp.accordionSubTexts || []);
            } else {
                let hierarchy = [];
                try {
                    if (comp.accordionHierarchy) {
                        hierarchy = typeof comp.accordionHierarchy === 'string' ? JSON.parse(comp.accordionHierarchy) : comp.accordionHierarchy;
                    }
                } catch (e) {
                    console.error("[InspectorAccordion] Failed to parse accordionHierarchy:", e);
                }
                syncHierarchyInputs(hierarchy);
            }
            
            const s = comp.currentStyles || {};
            const syncColor = (id, wrapperId, color, isTransparent) => {
                const picker = document.getElementById(id);
                const wrapper = document.getElementById(wrapperId);
                if (picker && color) picker.value = color;
                if (wrapper) wrapper.classList.toggle('transparent-active', isTransparent);
            };
            syncColor('accordion-bg-color', 'accordion-bg-wrapper', s.bg, s.isBgTransparent);
            syncColor('accordion-border-color', 'accordion-border-wrapper', s.border, s.isBorderTransparent);
        },

        bindEvents: function() {
            const headerTextInp = document.getElementById('prop-accordion-header-text');
            const subCountInp = document.getElementById('prop-accordion-sub-count');
            const bgColorInp = document.getElementById('accordion-bg-color');
            const bgNoneBtn = document.getElementById('btn-accordion-bg-none');
            const borderColorInp = document.getElementById('accordion-border-color');
            const borderNoneBtn = document.getElementById('btn-accordion-border-none');

            const expandY = document.getElementById('btn-accordion-expand-y');
            const expandN = document.getElementById('btn-accordion-expand-n');
            if (expandY && expandN) {
                expandY.onclick = () => {
                    highlightActive(expandY, true);
                    highlightActive(expandN, false);
                    notifyAccordion({ expanded: true });
                };
                expandN.onclick = () => {
                    highlightActive(expandY, false);
                    highlightActive(expandN, true);
                    notifyAccordion({ expanded: false });
                };
            }

            const widthInp = document.getElementById('prop-accordion-width');
            if (widthInp) {
                widthInp.oninput = () => {
                    const val = parseInt(widthInp.value);
                    if (!isNaN(val) && val > 0) {
                        notifyAccordion({ width: val });
                    }
                };
            }

            const heightInp = document.getElementById('prop-accordion-height');
            if (heightInp) {
                heightInp.oninput = () => {
                    const val = parseInt(heightInp.value);
                    if (!isNaN(val) && val > 0) {
                        notifyAccordion({ itemHeight: val });
                    }
                };
            }

            if (headerTextInp) {
                headerTextInp.oninput = () => {
                    notifyAccordion({ headerText: headerTextInp.value });
                };
            }

            if (subCountInp) {
                subCountInp.oninput = () => {
                    const val = Math.max(1, Math.min(10, parseInt(subCountInp.value) || 1));
                    const container = document.getElementById('accordion-sub-items-container');
                    const allInputs = container ? Array.from(container.querySelectorAll('.accordion-sub-input')) : [];
                    const currentTexts = allInputs.map(i => i.value);
                    while (currentTexts.length < val) {
                        currentTexts.push('Sub Item ' + (currentTexts.length + 1));
                    }
                    if (currentTexts.length > val) {
                        currentTexts.length = val;
                    }
                    syncSubItemInputs(currentTexts);
                    notifyAccordion({ subCount: val, subTexts: currentTexts, hierarchy: currentTexts.map(t => ({ text: t })) });
                };
            }

            const depth1Btn = document.getElementById('btn-accordion-depth-1');
            const depth2Btn = document.getElementById('btn-accordion-depth-2');
            const settings1D = document.getElementById('accordion-1depth-settings');
            const settings2D = document.getElementById('accordion-2depth-settings');
            const addTier1Btn = document.getElementById('btn-accordion-add-tier1');

            const setDepth = (depth) => {
                highlightActive(depth1Btn, depth === '1depth');
                highlightActive(depth2Btn, depth === '2depth');
                if (settings1D) settings1D.style.display = depth === '1depth' ? 'block' : 'none';
                if (settings2D) settings2D.style.display = depth === '2depth' ? 'block' : 'none';

                let currentHierarchy = [];
                if (depth === '2depth') {
                    const container = document.getElementById('accordion-hierarchy-container');
                    if (container && container.children.length > 0) {
                        return;
                    }
                    try {
                        const iframe = document.getElementById('main-iframe');
                        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
                            const activeEl = iframe.contentWindow.document.querySelector('.lf-component.selected');
                            if (activeEl) {
                                const accordionContainer = activeEl.querySelector('.v4-accordion-container') || activeEl;
                                if (accordionContainer) {
                                    const hStr = accordionContainer.getAttribute('data-hierarchy');
                                    if (hStr) currentHierarchy = JSON.parse(hStr);
                                }
                            }
                        }
                    } catch(e) {}
                    if (currentHierarchy.length === 0) {
                        const subInputs = Array.from(document.querySelectorAll('.accordion-sub-input'));
                        const subTexts = subInputs.length > 0 ? subInputs.map(i => i.value) : ['Sub Item 1', 'Sub Item 2'];
                        currentHierarchy = [
                            {
                                title: '대분류 1',
                                items: subTexts.map((txt, idx) => ({ text: txt, active: idx === 0 }))
                            }
                        ];
                    }
                    syncHierarchyInputs(currentHierarchy);
                }
                notifyAccordion({ depthType: depth, hierarchy: currentHierarchy });
            };

            if (depth1Btn) depth1Btn.onclick = () => setDepth('1depth');
            if (depth2Btn) depth2Btn.onclick = () => setDepth('2depth');

            if (addTier1Btn) {
                addTier1Btn.onclick = () => {
                    let currentHierarchy = [];
                    try {
                        const container = document.getElementById('accordion-hierarchy-container');
                        if (container) {
                            const tier1Groups = container.querySelectorAll('.v4-accordion-tier1-group');
                            tier1Groups.forEach((g) => {
                                const t1Inp = g.querySelector('.accordion-h-input');
                                const t1Title = t1Inp ? t1Inp.value : '';
                                const t2Inps = Array.from(g.querySelectorAll('div > input.accordion-h-input'));
                                const t2Radios = Array.from(g.querySelectorAll('.sidebar-accordion-radio'));
                                const items = t2Inps.map((inp, idx) => ({
                                    text: inp.value,
                                    active: t2Radios[idx] ? t2Radios[idx].checked : false
                                }));
                                currentHierarchy.push({ title: t1Title, items: items });
                            });
                        }
                        if (currentHierarchy.length === 0) {
                            const iframe = document.getElementById('main-iframe');
                            if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
                                const activeEl = iframe.contentWindow.document.querySelector('.lf-component.selected');
                                if (activeEl) {
                                    const accordionContainer = activeEl.querySelector('.v4-accordion-container') || activeEl;
                                    if (accordionContainer) {
                                        const hStr = accordionContainer.getAttribute('data-hierarchy');
                                        if (hStr) currentHierarchy = JSON.parse(hStr);
                                    }
                                }
                            }
                        }
                    } catch(e) {}
                    currentHierarchy.push({
                        title: '대분류 ' + (currentHierarchy.length + 1),
                        items: [{ text: 'Sub Item 1', active: false }]
                    });
                    syncHierarchyInputs(currentHierarchy);
                    notifyAccordion({ hierarchy: currentHierarchy });
                };
            }

            if (bgColorInp) {
                bgColorInp.oninput = () => {
                    const wrapper = document.getElementById('accordion-bg-wrapper');
                    if (wrapper) wrapper.classList.remove('transparent-active');
                    notifyAccordion({ bg: bgColorInp.value });
                };
            }
            if (bgNoneBtn) {
                bgNoneBtn.onclick = () => {
                    const wrapper = document.getElementById('accordion-bg-wrapper');
                    if (wrapper) wrapper.classList.add('transparent-active');
                    notifyAccordion({ bg: 'transparent' });
                };
            }

            if (borderColorInp) {
                borderColorInp.oninput = () => {
                    const wrapper = document.getElementById('accordion-border-wrapper');
                    if (wrapper) wrapper.classList.remove('transparent-active');
                    notifyAccordion({ border: borderColorInp.value });
                };
            }
            if (borderNoneBtn) {
                borderNoneBtn.onclick = () => {
                    const wrapper = document.getElementById('accordion-border-wrapper');
                    if (wrapper) wrapper.classList.add('transparent-active');
                    notifyAccordion({ border: 'transparent' });
                };
            }
        },

        syncSubItemInputs: syncSubItemInputs,
        syncHierarchyInputs: syncHierarchyInputs
    };

    window.syncAccordionSubItemInputs = syncSubItemInputs;
    window.syncAccordionHierarchyInputs = syncHierarchyInputs;
})();
