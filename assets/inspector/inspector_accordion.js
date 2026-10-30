/**
 * assets/inspector_accordion.js
 * Domain Inspector Module: Accordion Component
 * Encapsulates state synchronization (Read), event handling (Write), and hierarchy rendering.
 */
(function() {
    console.log("[Inspector Accordion] Domain module loaded.");

    const highlightActive = (btn, isActive) => {
        if (window.highlightActive) {
            window.highlightActive(btn, isActive);
        } else if (btn) {
            btn.style.background = isActive ? 'rgba(110, 86, 207, 0.25)' : 'rgba(255, 255, 255, 0.05)';
            btn.style.borderColor = isActive ? '#6e56cf' : 'rgba(255, 255, 255, 0.15)';
            btn.style.color = isActive ? '#ffffff' : '#94a3b8';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        }
    };

    const notifyAccordion = (data) => {
        const iframe = document.getElementById('main-iframe');
        if (iframe && iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(iframe.contentWindow, 'LF_UPDATE_ACCORDION_PROPERTIES', data);
        } else if (window.EditorBus) {
            window.EditorBus.sendToIframe(Object.assign({ type: 'LF_UPDATE_ACCORDION_PROPERTIES' }, data));
        }
    };

    const applyTheme = (themeName) => {
        const isLight = themeName === 'light';
        const data = isLight ? {
            bg: '#ffffff',
            textColor: '#0f172a',
            bodyBg: '#f8fafc',
            border: '#e2e8f0'
        } : {
            bg: '#1e293b',
            textColor: '#ffffff',
            bodyBg: '#0f172a',
            border: '#334155'
        };
        const syncColor = (id, wrapperId, color, isTransparent) => {
            const picker = document.getElementById(id);
            const wrapper = document.getElementById(wrapperId);
            if (picker && color) picker.value = color.indexOf('#') === 0 ? color : (window.rgbToHex ? window.rgbToHex(color) : color);
            if (wrapper) wrapper.classList.toggle('transparent-active', !!isTransparent);
        };
        syncColor('accordion-bg-color', 'accordion-bg-wrapper', data.bg, false);
        syncColor('accordion-text-color', 'accordion-text-wrapper', data.textColor, false);
        syncColor('accordion-body-bg-color', 'accordion-body-bg-wrapper', data.bodyBg, false);
        syncColor('accordion-border-color', 'accordion-border-wrapper', data.border, false);
        notifyAccordion(data);
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
                '<input type="radio" name="sidebar-accordion-active" class="sidebar-accordion-radio" ' + (index === activeIndex ? 'checked' : '') + ' style="accent-color: var(--accent, #6e56cf); cursor: pointer; flex-shrink: 0;">' +
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

    const _getActiveAccordionEl = () => {
        try {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
                const activeEl = iframe.contentWindow.document.querySelector('.lf-component.selected');
                if (activeEl) {
                    return activeEl.querySelector('.v4-accordion-container') || activeEl;
                }
            }
        } catch(e) {}
        return null;
    };

    const _getExistingAccordionData = () => {
        const cont = _getActiveAccordionEl();
        let depthType = '1depth';
        let hierarchy = [];
        let subTexts = [];
        if (cont) {
            depthType = cont.getAttribute('data-depth-type') || '1depth';
            const hStr = cont.getAttribute('data-hierarchy');
            if (hStr) {
                try { hierarchy = JSON.parse(hStr); } catch(e) {}
            }
            const subItems = cont.querySelectorAll('.v4-accordion-item');
            if (subItems && subItems.length > 0) {
                subTexts = Array.from(subItems).map(item => {
                    const span = item.querySelector('.v4-editable-cell') || item;
                    return span ? span.innerText.trim() : '';
                });
            }
        }
        return { depthType, hierarchy, subTexts };
    };

    const _extractAllTexts = (hierarchy, outList) => {
        if (!Array.isArray(hierarchy)) return;
        hierarchy.forEach(item => {
            const children = item.children || item.items;
            if (Array.isArray(children) && children.length > 0) {
                _extractAllTexts(children, outList);
            } else {
                const txt = typeof item === 'string' ? item : (item.text || item.title || '');
                if (txt) outList.push(txt);
            }
        });
    };

    const _migrateHierarchy = (oldHierarchy, fromDepth, toDepth, fallbackSubTexts) => {
        if (toDepth === '1depth') {
            const flatTexts = [];
            _extractAllTexts(oldHierarchy, flatTexts);
            if (flatTexts.length === 0 && Array.isArray(fallbackSubTexts) && fallbackSubTexts.length > 0) {
                fallbackSubTexts.forEach(t => flatTexts.push(t));
            }
            if (flatTexts.length === 0) {
                flatTexts.push('Sub Item 1', 'Sub Item 2', 'Sub Item 3');
            }
            return flatTexts.map((txt, idx) => ({ text: txt, title: txt, active: idx === 0 }));
        }

        if (toDepth === '2depth') {
            if (fromDepth === '1depth' || !Array.isArray(oldHierarchy) || oldHierarchy.length === 0 || !oldHierarchy[0].children) {
                const flatItems = (Array.isArray(oldHierarchy) && oldHierarchy.length > 0)
                    ? oldHierarchy.map(it => ({ text: typeof it === 'string' ? it : (it.text || it.title || '항목'), active: !!it.active }))
                    : (fallbackSubTexts && fallbackSubTexts.length > 0)
                        ? fallbackSubTexts.map((t, idx) => ({ text: t, active: idx === 0 }))
                        : [{ text: 'Sub Item 1', active: true }, { text: 'Sub Item 2', active: false }];
                return [{
                    title: '대분류 1',
                    text: '대분류 1',
                    children: flatItems,
                    items: flatItems
                }];
            }
            if (fromDepth === '3depth') {
                return oldHierarchy.map((t1, idx) => {
                    const t2Items = [];
                    (t1.children || t1.items || []).forEach(t2 => {
                        const t3List = t2.children || t2.items || [];
                        if (t3List.length > 0) {
                            t3List.forEach(t3 => {
                                const prefix = (t2.title || t2.text) ? (t2.title || t2.text) + ' - ' : '';
                                t2Items.push({ text: prefix + (t3.text || t3.title || '소분류'), active: !!t3.active });
                            });
                        } else {
                            t2Items.push({ text: t2.text || t2.title || '항목', active: !!t2.active });
                        }
                    });
                    if (t2Items.length === 0) t2Items.push({ text: 'Sub Item 1', active: false });
                    return {
                        title: t1.title || t1.text || ('대분류 ' + (idx + 1)),
                        text: t1.title || t1.text || ('대분류 ' + (idx + 1)),
                        children: t2Items,
                        items: t2Items
                    };
                });
            }
            return oldHierarchy.map((t1, idx) => {
                const items = (t1.children || t1.items || []).map(t2 => ({
                    text: t2.text || t2.title || 'Sub Item',
                    active: !!t2.active
                }));
                if (items.length === 0) items.push({ text: 'Sub Item 1', active: false });
                return {
                    title: t1.title || t1.text || ('대분류 ' + (idx + 1)),
                    text: t1.title || t1.text || ('대분류 ' + (idx + 1)),
                    children: items,
                    items: items
                };
            });
        }

        if (toDepth === '3depth') {
            if (fromDepth === '1depth' || !Array.isArray(oldHierarchy) || oldHierarchy.length === 0 || !oldHierarchy[0].children) {
                const flatItems = (Array.isArray(oldHierarchy) && oldHierarchy.length > 0)
                    ? oldHierarchy.map(it => ({ text: typeof it === 'string' ? it : (it.text || it.title || '소분류'), active: !!it.active }))
                    : [{ text: '소분류 1', active: true }, { text: '소분류 2', active: false }];
                return [{
                    title: '대분류 1',
                    text: '대분류 1',
                    children: [{
                        title: '중분류 1.1',
                        text: '중분류 1.1',
                        children: flatItems,
                        items: flatItems
                    }],
                    items: [{
                        title: '중분류 1.1',
                        text: '중분류 1.1',
                        children: flatItems,
                        items: flatItems
                    }]
                }];
            }
            if (fromDepth === '2depth') {
                return oldHierarchy.map((t1, idx) => {
                    const existing2Tier = (t1.children || t1.items || []).map(item => ({
                        text: item.text || item.title || '소분류',
                        active: !!item.active
                    }));
                    const t3Items = existing2Tier.length > 0 ? existing2Tier : [{ text: '소분류 1', active: false }];
                    const t2Group = {
                        title: '중분류 ' + (idx + 1) + '.1',
                        text: '중분류 ' + (idx + 1) + '.1',
                        children: t3Items,
                        items: t3Items
                    };
                    return {
                        title: t1.title || t1.text || ('대분류 ' + (idx + 1)),
                        text: t1.title || t1.text || ('대분류 ' + (idx + 1)),
                        children: [t2Group],
                        items: [t2Group]
                    };
                });
            }
            return oldHierarchy.map((t1, i1) => {
                const t2Groups = (t1.children || t1.items || []).map((t2, i2) => {
                    const t3Items = (t2.children || t2.items || []).map(t3 => ({
                        text: t3.text || t3.title || '소분류',
                        active: !!t3.active
                    }));
                    if (t3Items.length === 0) t3Items.push({ text: '소분류 1', active: false });
                    return {
                        title: t2.title || t2.text || ('중분류 ' + (i1 + 1) + '.' + (i2 + 1)),
                        text: t2.title || t2.text || ('중분류 ' + (i1 + 1) + '.' + (i2 + 1)),
                        children: t3Items,
                        items: t3Items
                    };
                });
                if (t2Groups.length === 0) {
                    t2Groups.push({
                        title: '중분류 ' + (i1 + 1) + '.1',
                        text: '중분류 ' + (i1 + 1) + '.1',
                        children: [{ text: '소분류 1', active: false }],
                        items: [{ text: '소분류 1', active: false }]
                    });
                }
                return {
                    title: t1.title || t1.text || ('대분류 ' + (i1 + 1)),
                    text: t1.title || t1.text || ('대분류 ' + (i1 + 1)),
                    children: t2Groups,
                    items: t2Groups
                };
            });
        }

        return oldHierarchy;
    };

    const syncHierarchyInputs = (hierarchy, depthType) => {
        const container = document.getElementById('accordion-hierarchy-container');
        if (!container) return;

        const effectiveDepth = depthType || (document.getElementById('btn-accordion-depth-3')?.classList.contains('active') ? '3depth' : '2depth');

        const activeEl = document.activeElement;
        const isTyping = activeEl && (container.contains(activeEl) || activeEl.classList.contains('accordion-h-input'));
        if (isTyping) return;

        const commitHierarchy = () => {
            if (Array.isArray(hierarchy)) {
                hierarchy.forEach(t1 => {
                    t1.items = t1.children || t1.items || [];
                    t1.children = t1.items;
                    if (Array.isArray(t1.children)) {
                        t1.children.forEach(t2 => {
                            if (t2.children || t2.items) {
                                t2.items = t2.children || t2.items || [];
                                t2.children = t2.items;
                            }
                        });
                    }
                });
            }
            notifyAccordion({ hierarchy: hierarchy, depthType: effectiveDepth });
        };

        const deactivateAllExcept = (targetItem) => {
            if (!Array.isArray(hierarchy)) return;
            hierarchy.forEach(t1 => {
                (t1.children || t1.items || []).forEach(t2 => {
                    if (t2.children || t2.items) {
                        (t2.children || t2.items || []).forEach(t3 => {
                            t3.active = (t3 === targetItem);
                        });
                    } else {
                        t2.active = (t2 === targetItem);
                    }
                });
            });
        };

        container.innerHTML = '';
        if (!Array.isArray(hierarchy) || hierarchy.length === 0) {
            container.innerHTML = '<div style="color: #64748b; font-size: 11px; padding: 8px; text-align: center;">항목이 없습니다. 상단 "+ 1티어 추가" 버튼을 눌러주세요.</div>';
            return;
        }

        hierarchy.forEach((t1, i1) => {
            const t1Div = document.createElement('div');
            t1Div.className = 'v4-accordion-tier1-group';
            t1Div.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px; margin-bottom: 8px;';
            
            const t1Header = document.createElement('div');
            t1Header.className = 'v4-accordion-t1-header-row';
            t1Header.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
            t1Header.innerHTML = 
                '<span style="font-size: 11px; font-weight: bold; color: var(--accent-light, #9e8cfc); width: 45px; flex-shrink: 0;">1T-' + (i1 + 1) + '</span>' +
                '<input type="text" class="v4-prop-input accordion-h-input accordion-t1-input" value="' + (t1.title || t1.text || '') + '" style="flex:1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; outline: none; box-sizing: border-box;">' +
                '<button class="v4-btn-action-sm danger btn-del-tier1" title="1티어 삭제">&times;</button>';
            
            const t1Input = t1Header.querySelector('.accordion-t1-input');
            if (t1Input) {
                t1Input.addEventListener('input', () => {
                    t1.title = t1Input.value;
                    t1.text = t1Input.value;
                    commitHierarchy();
                });
            }
            const delT1Btn = t1Header.querySelector('.btn-del-tier1');
            if (delT1Btn) {
                delT1Btn.addEventListener('click', () => {
                    hierarchy.splice(i1, 1);
                    commitHierarchy();
                    syncHierarchyInputs(hierarchy, effectiveDepth);
                });
            }
            t1Div.appendChild(t1Header);

            const t2Container = document.createElement('div');
            t2Container.className = 'v4-accordion-t2-container';
            t2Container.style.cssText = 'padding-left: 10px; display: flex; flex-direction: column; gap: 6px; border-left: 2px solid rgba(110, 86, 207, 0.25); margin-left: 6px; margin-bottom: 6px;';

            if (effectiveDepth === '3depth') {
                // 3 Depth Mode: 1Tier -> 2Tier Groups -> 3Tier Items
                (t1.children || t1.items || []).forEach((t2, i2) => {
                    const t2Box = document.createElement('div');
                    t2Box.className = 'v4-accordion-tier2-group-box';
                    t2Box.style.cssText = 'background: rgba(255,255,255,0.015); border: 1px dashed rgba(255,255,255,0.1); border-radius: 4px; padding: 6px; margin-bottom: 4px;';

                    const t2Header = document.createElement('div');
                    t2Header.className = 'v4-accordion-t2-header-row';
                    t2Header.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
                    t2Header.innerHTML = 
                        '<span style="font-size: 10px; font-weight: 600; color: #38bdf8; width: 40px; flex-shrink: 0;">2T-' + (i2 + 1) + '</span>' +
                        '<input type="text" class="v4-prop-input accordion-h-input accordion-t2-input" value="' + (t2.title || t2.text || '') + '" style="flex:1; background: rgba(0,0,0,0.3); border: 1px solid rgba(56, 189, 248, 0.25); color: #e0f2fe; padding: 3px 5px; border-radius: 3px; font-size: 10px; outline: none; box-sizing: border-box;">' +
                        '<button class="v4-btn-action-sm danger btn-del-tier2" title="2티어 삭제">&times;</button>';

                    const t2Input = t2Header.querySelector('.accordion-t2-input');
                    if (t2Input) {
                        t2Input.addEventListener('input', () => {
                            t2.title = t2Input.value;
                            t2.text = t2Input.value;
                            commitHierarchy();
                        });
                    }
                    const delT2Btn = t2Header.querySelector('.btn-del-tier2');
                    if (delT2Btn) {
                        delT2Btn.addEventListener('click', () => {
                            (t1.children || t1.items).splice(i2, 1);
                            commitHierarchy();
                            syncHierarchyInputs(hierarchy, effectiveDepth);
                        });
                    }
                    t2Box.appendChild(t2Header);

                    const t3Container = document.createElement('div');
                    t3Container.className = 'v4-accordion-t3-container';
                    t3Container.style.cssText = 'padding-left: 8px; display: flex; flex-direction: column; gap: 4px; border-left: 2px solid rgba(56, 189, 248, 0.25); margin-left: 6px; margin-bottom: 4px;';

                    (t2.children || t2.items || []).forEach((t3, i3) => {
                        const t3Div = document.createElement('div');
                        t3Div.className = 'v4-accordion-t3-item-row';
                        t3Div.style.cssText = 'display: flex; align-items: center; gap: 6px;';
                        t3Div.innerHTML = 
                            '<input type="radio" name="sidebar-accordion-active" class="sidebar-accordion-radio" ' + (t3.active ? 'checked' : '') + ' style="accent-color: var(--accent, #6e56cf); cursor: pointer; flex-shrink: 0;">' +
                            '<span style="font-size: 9px; color: #94a3b8; width: 35px; flex-shrink: 0;">3T-' + (i3 + 1) + '</span>' +
                            '<input type="text" class="v4-prop-input accordion-h-input accordion-t3-input" value="' + (t3.text || '') + '" style="flex:1; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 2px 4px; border-radius: 3px; font-size: 10px; outline: none; box-sizing: border-box;">' +
                            '<button class="v4-btn-action-sm danger btn-del-tier3" title="3티어 삭제">&times;</button>';

                        const t3Radio = t3Div.querySelector('.sidebar-accordion-radio');
                        if (t3Radio) {
                            t3Radio.addEventListener('change', () => {
                                const allRadios = document.querySelectorAll('.sidebar-accordion-radio');
                                allRadios.forEach(r => { if (r !== t3Radio) r.checked = false; });
                                deactivateAllExcept(t3);
                                commitHierarchy();
                            });
                        }
                        const t3Input = t3Div.querySelector('.accordion-t3-input');
                        if (t3Input) {
                            t3Input.addEventListener('input', () => {
                                t3.text = t3Input.value;
                                commitHierarchy();
                            });
                        }
                        const delT3Btn = t3Div.querySelector('.btn-del-tier3');
                        if (delT3Btn) {
                            delT3Btn.addEventListener('click', () => {
                                (t2.children || t2.items).splice(i3, 1);
                                commitHierarchy();
                                syncHierarchyInputs(hierarchy, effectiveDepth);
                            });
                        }
                        t3Container.appendChild(t3Div);
                    });
                    t2Box.appendChild(t3Container);

                    const addT3Btn = document.createElement('button');
                    addT3Btn.className = 'btn-secondary';
                    addT3Btn.style.cssText = 'font-size: 9px; padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(56, 189, 248, 0.25); background: rgba(56, 189, 248, 0.05); color: #38bdf8; cursor: pointer; margin-left: 8px; margin-top: 2px;';
                    addT3Btn.textContent = '+ 3-Tier Item';
                    addT3Btn.addEventListener('click', () => {
                        if (!t2.children) t2.children = [];
                        t2.children.push({ text: '소분류 ' + (t2.children.length + 1), active: false });
                        t2.items = t2.children;
                        commitHierarchy();
                        syncHierarchyInputs(hierarchy, effectiveDepth);
                    });
                    t2Box.appendChild(addT3Btn);

                    t2Container.appendChild(t2Box);
                });

                const addT2GroupBtn = document.createElement('button');
                addT2GroupBtn.className = 'btn-secondary';
                addT2GroupBtn.style.cssText = 'font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(110, 86, 207, 0.3); background: rgba(110, 86, 207, 0.1); color: #c4b5fd; cursor: pointer; margin-left: 8px; margin-top: 4px; font-weight: 600;';
                addT2GroupBtn.textContent = '+ 2-Tier Group (중분류)';
                addT2GroupBtn.addEventListener('click', () => {
                    if (!t1.children) t1.children = [];
                    const newT2 = {
                        title: '중분류 ' + (t1.children.length + 1),
                        text: '중분류 ' + (t1.children.length + 1),
                        children: [{ text: '소분류 1', active: false }],
                        items: [{ text: '소분류 1', active: false }]
                    };
                    t1.children.push(newT2);
                    t1.items = t1.children;
                    commitHierarchy();
                    syncHierarchyInputs(hierarchy, effectiveDepth);
                });
                t1Div.appendChild(t2Container);
                t1Div.appendChild(addT2GroupBtn);
            } else {
                // 2 Depth Mode: 1Tier -> 2Tier Items
                (t1.children || t1.items || []).forEach((t2, i2) => {
                    const t2Div = document.createElement('div');
                    t2Div.className = 'v4-accordion-t2-item-row';
                    t2Div.style.cssText = 'display: flex; align-items: center; gap: 6px;';
                    t2Div.innerHTML = 
                        '<input type="radio" name="sidebar-accordion-active" class="sidebar-accordion-radio" ' + (t2.active ? 'checked' : '') + ' style="accent-color: var(--accent, #6e56cf); cursor: pointer; flex-shrink: 0;">' +
                        '<span style="font-size: 10px; color: #94a3b8; width: 35px; flex-shrink: 0;">2T-' + (i2 + 1) + '</span>' +
                        '<input type="text" class="v4-prop-input accordion-h-input accordion-t2-input" value="' + (t2.text || '') + '" style="flex:1; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 3px 5px; border-radius: 3px; font-size: 10px; outline: none; box-sizing: border-box;">' +
                        '<button class="v4-btn-action-sm danger btn-del-tier2" title="2티어 삭제">&times;</button>';
                    
                    const t2Radio = t2Div.querySelector('.sidebar-accordion-radio');
                    if (t2Radio) {
                        t2Radio.addEventListener('change', () => {
                            const allRadios = document.querySelectorAll('.sidebar-accordion-radio');
                            allRadios.forEach(r => { if (r !== t2Radio) r.checked = false; });
                            deactivateAllExcept(t2);
                            commitHierarchy();
                        });
                    }
                    const t2Input = t2Div.querySelector('.accordion-t2-input');
                    if (t2Input) {
                        t2Input.addEventListener('input', () => {
                            t2.text = t2Input.value;
                            commitHierarchy();
                        });
                    }
                    const delT2Btn = t2Div.querySelector('.btn-del-tier2');
                    if (delT2Btn) {
                        delT2Btn.addEventListener('click', () => {
                            (t1.children || t1.items).splice(i2, 1);
                            commitHierarchy();
                            syncHierarchyInputs(hierarchy, effectiveDepth);
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
                    if (!t1.children) t1.children = [];
                    t1.children.push({ text: 'Sub Item ' + (t1.children.length + 1), active: false });
                    t1.items = t1.children;
                    commitHierarchy();
                    syncHierarchyInputs(hierarchy, effectiveDepth);
                });
                t1Div.appendChild(addT2Btn);
            }

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

            const headerFontSizeInp = document.getElementById('prop-accordion-header-font-size');
            if (headerFontSizeInp && document.activeElement !== headerFontSizeInp && comp.accordionHeaderFontSize !== undefined) {
                headerFontSizeInp.value = comp.accordionHeaderFontSize;
            }

            const subFontSizeInp = document.getElementById('prop-accordion-sub-font-size');
            if (subFontSizeInp && document.activeElement !== subFontSizeInp && comp.accordionSubFontSize !== undefined) {
                subFontSizeInp.value = comp.accordionSubFontSize;
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

            const chevronType = comp.accordionChevronType || 'triangle';
            const iconTriangleBtn = document.getElementById('btn-accordion-icon-triangle');
            const iconChevronBtn = document.getElementById('btn-accordion-icon-chevron');
            if (iconTriangleBtn && iconChevronBtn) {
                highlightActive(iconTriangleBtn, chevronType === 'triangle');
                highlightActive(iconChevronBtn, chevronType === 'chevron');
            }

            const borderType = comp.accordionBorderType || 'all';
            const borderAllBtn = document.getElementById('btn-accordion-border-all');
            const borderTopBottomBtn = document.getElementById('btn-accordion-border-topbottom');
            if (borderAllBtn && borderTopBottomBtn) {
                highlightActive(borderAllBtn, borderType === 'all');
                highlightActive(borderTopBottomBtn, borderType === 'top-bottom');
            }

            const depthType = comp.accordionDepthType || '1depth';
            const depth1Btn = document.getElementById('btn-accordion-depth-1');
            const depth2Btn = document.getElementById('btn-accordion-depth-2');
            const depth3Btn = document.getElementById('btn-accordion-depth-3');
            const settings1D = document.getElementById('accordion-1depth-settings');
            const settings2D = document.getElementById('accordion-2depth-settings');
            const lblTitle = document.getElementById('lbl-accordion-hierarchy-title');

            if (depth1Btn) highlightActive(depth1Btn, depthType === '1depth');
            if (depth2Btn) highlightActive(depth2Btn, depthType === '2depth');
            if (depth3Btn) highlightActive(depth3Btn, depthType === '3depth');

            if (settings1D) settings1D.style.display = depthType === '1depth' ? 'block' : 'none';
            if (settings2D) settings2D.style.display = (depthType === '2depth' || depthType === '3depth') ? 'block' : 'none';
            if (lblTitle) lblTitle.textContent = depthType === '3depth' ? '3 Depth 계층구조 설정 (Hierarchy)' : '2 Depth 계층구조 설정 (Hierarchy)';
            
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
                syncHierarchyInputs(hierarchy, depthType);
            }
            
            const s = comp.currentStyles || {};
            const syncColor = (id, wrapperId, color, isTransparent) => {
                const picker = document.getElementById(id);
                const wrapper = document.getElementById(wrapperId);
                if (picker && color) picker.value = color.indexOf('#') === 0 ? color : (window.rgbToHex ? window.rgbToHex(color) : color);
                if (wrapper) wrapper.classList.toggle('transparent-active', !!isTransparent);
            };
            syncColor('accordion-bg-color', 'accordion-bg-wrapper', s.bg, s.isBgTransparent);
            syncColor('accordion-border-color', 'accordion-border-wrapper', s.border, s.isBorderTransparent);

            const textColor = comp.accordionTextColor || '#ffffff';
            syncColor('accordion-text-color', 'accordion-text-wrapper', textColor, false);

            const bodyBg = comp.accordionBodyBg || '';
            const isBodyBgTransparent = !bodyBg || bodyBg === 'transparent' || bodyBg === 'none';
            syncColor('accordion-body-bg-color', 'accordion-body-bg-wrapper', isBodyBgTransparent ? '#0f172a' : bodyBg, isBodyBgTransparent);
        },

        bindEvents: function() {
            const headerTextInp = document.getElementById('prop-accordion-header-text');
            const headerFontSizeInp = document.getElementById('prop-accordion-header-font-size');
            const subFontSizeInp = document.getElementById('prop-accordion-sub-font-size');
            const subCountInp = document.getElementById('prop-accordion-sub-count');
            const bgColorInp = document.getElementById('accordion-bg-color');
            const bgNoneBtn = document.getElementById('btn-accordion-bg-none');
            const borderColorInp = document.getElementById('accordion-border-color');
            const borderNoneBtn = document.getElementById('btn-accordion-border-none');

            if (headerFontSizeInp) {
                headerFontSizeInp.oninput = () => {
                    const val = parseInt(headerFontSizeInp.value);
                    if (!isNaN(val) && val > 0) {
                        notifyAccordion({ headerFontSize: val });
                    }
                };
            }

            if (subFontSizeInp) {
                subFontSizeInp.oninput = () => {
                    const val = parseInt(subFontSizeInp.value);
                    if (!isNaN(val) && val > 0) {
                        notifyAccordion({ subFontSize: val });
                    }
                };
            }

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

            const iconTriangleBtn = document.getElementById('btn-accordion-icon-triangle');
            const iconChevronBtn = document.getElementById('btn-accordion-icon-chevron');
            if (iconTriangleBtn && iconChevronBtn) {
                iconTriangleBtn.onclick = () => {
                    highlightActive(iconTriangleBtn, true);
                    highlightActive(iconChevronBtn, false);
                    notifyAccordion({ chevronType: 'triangle' });
                };
                iconChevronBtn.onclick = () => {
                    highlightActive(iconTriangleBtn, false);
                    highlightActive(iconChevronBtn, true);
                    notifyAccordion({ chevronType: 'chevron' });
                };
            }

            const borderAllBtn = document.getElementById('btn-accordion-border-all');
            const borderTopBottomBtn = document.getElementById('btn-accordion-border-topbottom');
            if (borderAllBtn && borderTopBottomBtn) {
                borderAllBtn.onclick = () => {
                    highlightActive(borderAllBtn, true);
                    highlightActive(borderTopBottomBtn, false);
                    notifyAccordion({ borderType: 'all' });
                };
                borderTopBottomBtn.onclick = () => {
                    highlightActive(borderAllBtn, false);
                    highlightActive(borderTopBottomBtn, true);
                    notifyAccordion({ borderType: 'top-bottom' });
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
                    notifyAccordion({ subCount: val, subTexts: currentTexts, hierarchy: currentTexts.map((t, idx) => ({ text: t, active: idx === 0 })) });
                };
            }

            const depth1Btn = document.getElementById('btn-accordion-depth-1');
            const depth2Btn = document.getElementById('btn-accordion-depth-2');
            const depth3Btn = document.getElementById('btn-accordion-depth-3');
            const settings1D = document.getElementById('accordion-1depth-settings');
            const settings2D = document.getElementById('accordion-2depth-settings');
            const addTier1Btn = document.getElementById('btn-accordion-add-tier1');
            const lblTitle = document.getElementById('lbl-accordion-hierarchy-title');

            const setDepth = (depth) => {
                if (depth1Btn) highlightActive(depth1Btn, depth === '1depth');
                if (depth2Btn) highlightActive(depth2Btn, depth === '2depth');
                if (depth3Btn) highlightActive(depth3Btn, depth === '3depth');
                if (settings1D) settings1D.style.display = depth === '1depth' ? 'block' : 'none';
                if (settings2D) settings2D.style.display = (depth === '2depth' || depth === '3depth') ? 'block' : 'none';
                if (lblTitle) lblTitle.textContent = depth === '3depth' ? '3 Depth 계층구조 설정 (Hierarchy)' : '2 Depth 계층구조 설정 (Hierarchy)';

                const existingData = _getExistingAccordionData();
                const migratedHierarchy = _migrateHierarchy(existingData.hierarchy, existingData.depthType, depth, existingData.subTexts);

                if (depth === '1depth') {
                    const flatTexts = [];
                    _extractAllTexts(migratedHierarchy, flatTexts);
                    if (flatTexts.length === 0) flatTexts.push('Sub Item 1', 'Sub Item 2', 'Sub Item 3');
                    syncSubItemInputs(flatTexts);
                    const scInp = document.getElementById('prop-accordion-sub-count');
                    if (scInp) scInp.value = flatTexts.length;
                    notifyAccordion({
                        depthType: '1depth',
                        subCount: flatTexts.length,
                        subTexts: flatTexts,
                        hierarchy: flatTexts.map((t, idx) => ({ text: t, active: idx === 0 }))
                    });
                } else {
                    syncHierarchyInputs(migratedHierarchy, depth);
                    notifyAccordion({ depthType: depth, hierarchy: migratedHierarchy });
                }
            };

            window.InspectorAccordion.setDepth = setDepth;

            if (depth1Btn) depth1Btn.onclick = () => setDepth('1depth');
            if (depth2Btn) depth2Btn.onclick = () => setDepth('2depth');
            if (depth3Btn) depth3Btn.onclick = () => setDepth('3depth');

            if (addTier1Btn) {
                addTier1Btn.onclick = () => {
                    const d3Btn = document.getElementById('btn-accordion-depth-3');
                    const is3D = d3Btn && (d3Btn.classList.contains('active') || (d3Btn.style.borderColor && d3Btn.style.borderColor.indexOf('6e56cf') !== -1));
                    const currentDepth = is3D ? '3depth' : '2depth';

                    const existingData = _getExistingAccordionData();
                    let currentHierarchy = existingData.hierarchy;
                    if (!Array.isArray(currentHierarchy) || currentHierarchy.length === 0) {
                        currentHierarchy = _migrateHierarchy([], '1depth', currentDepth, []);
                    }

                    if (currentDepth === '3depth') {
                        currentHierarchy.push({
                            title: '대분류 ' + (currentHierarchy.length + 1),
                            text: '대분류 ' + (currentHierarchy.length + 1),
                            children: [{
                                title: '중분류 1',
                                text: '중분류 1',
                                children: [{ text: '소분류 1', active: false }],
                                items: [{ text: '소분류 1', active: false }]
                            }],
                            items: [{
                                title: '중분류 1',
                                text: '중분류 1',
                                children: [{ text: '소분류 1', active: false }],
                                items: [{ text: '소분류 1', active: false }]
                            }]
                        });
                    } else {
                        currentHierarchy.push({
                            title: '대분류 ' + (currentHierarchy.length + 1),
                            text: '대분류 ' + (currentHierarchy.length + 1),
                            children: [{ text: 'Sub Item 1', active: false }],
                            items: [{ text: 'Sub Item 1', active: false }]
                        });
                    }
                    syncHierarchyInputs(currentHierarchy, currentDepth);
                    notifyAccordion({ hierarchy: currentHierarchy, depthType: currentDepth });
                };
            }

            const themeLightBtn = document.getElementById('btn-accordion-theme-light');
            const themeDarkBtn = document.getElementById('btn-accordion-theme-dark');
            if (themeLightBtn) {
                themeLightBtn.onclick = () => applyTheme('light');
            }
            if (themeDarkBtn) {
                themeDarkBtn.onclick = () => applyTheme('dark');
            }

            const textColorInp = document.getElementById('accordion-text-color');
            if (textColorInp) {
                textColorInp.oninput = () => {
                    notifyAccordion({ textColor: textColorInp.value });
                };
            }

            const bodyBgInp = document.getElementById('accordion-body-bg-color');
            const bodyBgNoneBtn = document.getElementById('btn-accordion-body-bg-none');
            if (bodyBgInp) {
                bodyBgInp.oninput = () => {
                    const wrapper = document.getElementById('accordion-body-bg-wrapper');
                    if (wrapper) wrapper.classList.remove('transparent-active');
                    notifyAccordion({ bodyBg: bodyBgInp.value });
                };
            }
            if (bodyBgNoneBtn) {
                bodyBgNoneBtn.onclick = () => {
                    const wrapper = document.getElementById('accordion-body-bg-wrapper');
                    if (wrapper) wrapper.classList.add('transparent-active');
                    notifyAccordion({ bodyBg: 'transparent' });
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

        applyTheme: applyTheme,
        syncSubItemInputs: syncSubItemInputs,
        syncHierarchyInputs: syncHierarchyInputs
    };

    window.InspectorAccordion.bindAccordionEvents = window.InspectorAccordion.bindEvents;

    // Document-level event delegation safeguards for Accordion
    document.addEventListener('click', (e) => {
        const themeLight = e.target.closest && e.target.closest('#btn-accordion-theme-light');
        if (themeLight) {
            applyTheme('light');
            return;
        }
        const themeDark = e.target.closest && e.target.closest('#btn-accordion-theme-dark');
        if (themeDark) {
            applyTheme('dark');
            return;
        }
        const iconTriangle = e.target.closest && e.target.closest('#btn-accordion-icon-triangle');
        if (iconTriangle) {
            const iconChevron = document.getElementById('btn-accordion-icon-chevron');
            highlightActive(iconTriangle, true);
            if (iconChevron) highlightActive(iconChevron, false);
            notifyAccordion({ chevronType: 'triangle' });
            return;
        }
        const iconChevron = e.target.closest && e.target.closest('#btn-accordion-icon-chevron');
        if (iconChevron) {
            const iconTriangle = document.getElementById('btn-accordion-icon-triangle');
            if (iconTriangle) highlightActive(iconTriangle, false);
            highlightActive(iconChevron, true);
            notifyAccordion({ chevronType: 'chevron' });
            return;
        }
        const borderAll = e.target.closest && e.target.closest('#btn-accordion-border-all');
        if (borderAll) {
            const borderTopBottom = document.getElementById('btn-accordion-border-topbottom');
            highlightActive(borderAll, true);
            if (borderTopBottom) highlightActive(borderTopBottom, false);
            notifyAccordion({ borderType: 'all' });
            return;
        }
        const borderTopBottom = e.target.closest && e.target.closest('#btn-accordion-border-topbottom');
        if (borderTopBottom) {
            const borderAll = document.getElementById('btn-accordion-border-all');
            if (borderAll) highlightActive(borderAll, false);
            highlightActive(borderTopBottom, true);
            notifyAccordion({ borderType: 'top-bottom' });
            return;
        }
        const expandY = e.target.closest && e.target.closest('#btn-accordion-expand-y');
        if (expandY) {
            const expandN = document.getElementById('btn-accordion-expand-n');
            highlightActive(expandY, true);
            if (expandN) highlightActive(expandN, false);
            notifyAccordion({ expanded: true });
            return;
        }
        const expandN = e.target.closest && e.target.closest('#btn-accordion-expand-n');
        if (expandN) {
            const expandY = document.getElementById('btn-accordion-expand-y');
            if (expandY) highlightActive(expandY, false);
            highlightActive(expandN, true);
            notifyAccordion({ expanded: false });
            return;
        }
        const depth1Btn = e.target.closest && e.target.closest('#btn-accordion-depth-1');
        if (depth1Btn) {
            if (window.InspectorAccordion && typeof window.InspectorAccordion.setDepth === 'function') {
                window.InspectorAccordion.setDepth('1depth');
            }
            return;
        }
        const depth2Btn = e.target.closest && e.target.closest('#btn-accordion-depth-2');
        if (depth2Btn) {
            if (window.InspectorAccordion && typeof window.InspectorAccordion.setDepth === 'function') {
                window.InspectorAccordion.setDepth('2depth');
            }
            return;
        }
        const depth3Btn = e.target.closest && e.target.closest('#btn-accordion-depth-3');
        if (depth3Btn) {
            if (window.InspectorAccordion && typeof window.InspectorAccordion.setDepth === 'function') {
                window.InspectorAccordion.setDepth('3depth');
            }
            return;
        }
    });

    window.syncAccordionSubItemInputs = syncSubItemInputs;
    window.syncAccordionHierarchyInputs = syncHierarchyInputs;
    window.initAccordionEvents = () => window.InspectorAccordion?.bindEvents?.();
})();
