/**
 * bychoi workspace V4 - Premium Component Library Controller
 * UI rendering, Accordion management, and search engine.
 * Component metadata definition is separated to vctrl_component_data.js (SSOT).
 */

if (!window.V4_COMPONENT_LIBRARY) {
    console.warn("[Component Library] V4_COMPONENT_LIBRARY not loaded yet. Ensuring registry initialization.");
    window.V4_COMPONENT_LIBRARY = { atoms: [], molecules: [], canvasBackgrounds: [], illustrations: [] };
}

// --- V4 Sidebar Library Collapsible Accordion Controller ---
window.V4SidebarAccordion = {
    STORAGE_KEY: 'vctrl_sidebar_accordion_state_v2',

    getState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed === 'object' && parsed !== null) {
                    return {
                        'icon-library': parsed['icon-library'] !== undefined ? !!parsed['icon-library'] : true,
                        'illustration-library': parsed['illustration-library'] !== undefined ? !!parsed['illustration-library'] : true,
                        'molecules': parsed['molecules'] !== undefined ? !!parsed['molecules'] : true,
                        subGroups: parsed.subGroups && typeof parsed.subGroups === 'object' ? parsed.subGroups : {}
                    };
                }
            }
        } catch (e) {
            console.warn('[Sidebar Accordion] Failed to read localStorage:', e);
        }
        return { 'icon-library': true, 'illustration-library': true, 'molecules': true, subGroups: {} };
    },

    saveState(state) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('[Sidebar Accordion] Failed to save localStorage:', e);
        }
    },

    isCollapsed(sectionId) {
        const state = this.getState();
        return state[sectionId] !== undefined ? !!state[sectionId] : true;
    },

    toggle(sectionId) {
        const state = this.getState();
        const nextCollapsed = !this.isCollapsed(sectionId);
        state[sectionId] = nextCollapsed;
        this.saveState(state);

        const header = document.getElementById(`${sectionId}-header`);
        const body = document.getElementById(`${sectionId}-body`);
        if (header) {
            header.classList.toggle('is-collapsed', nextCollapsed);
        }
        if (body) {
            body.classList.toggle('is-collapsed', nextCollapsed);
            body.style.setProperty('display', nextCollapsed ? 'none' : 'block', 'important');
        }
    },

    isSubGroupCollapsed(groupId) {
        const state = this.getState();
        return !!(state.subGroups && state.subGroups[groupId]);
    },

    toggleSubGroup(groupId) {
        const state = this.getState();
        if (!state.subGroups) state.subGroups = {};
        state.subGroups[groupId] = !state.subGroups[groupId];
        this.saveState(state);

        if (typeof window.renderIllustrationLibrary === 'function') {
            window.renderIllustrationLibrary();
        }
    },

    updateBadges() {
        const iconBadge = document.getElementById('icon-library-total-badge');
        if (iconBadge) {
            const iconContainer = document.getElementById('icon-library-container');
            const totalIcons = iconContainer ? iconContainer.querySelectorAll('.component-item').length : 36;
            iconBadge.textContent = totalIcons || 36;
        }

        const illBadge = document.getElementById('illustration-library-total-badge');
        if (illBadge && window.V4_COMPONENT_LIBRARY && Array.isArray(window.V4_COMPONENT_LIBRARY.illustrations)) {
            illBadge.textContent = window.V4_COMPONENT_LIBRARY.illustrations.length;
        }

        const molBadge = document.getElementById('molecules-total-badge');
        if (molBadge) {
            const rawCustomComps = window.state ? window.state.globalComponents : null;
            const customComps = Array.isArray(rawCustomComps) ? rawCustomComps : (rawCustomComps && typeof rawCustomComps === 'object' ? Object.values(rawCustomComps) : []);
            molBadge.textContent = customComps.length;
        }
    },

    init() {
        const state = this.getState();
        ['icon-library', 'illustration-library', 'molecules'].forEach(sec => {
            const isCol = state[sec] !== undefined ? !!state[sec] : true;
            const header = document.getElementById(`${sec}-header`);
            const body = document.getElementById(`${sec}-body`);
            if (header) header.classList.toggle('is-collapsed', isCol);
            if (body) {
                body.classList.toggle('is-collapsed', isCol);
                body.style.setProperty('display', isCol ? 'none' : 'block', 'important');
            }
        });
        this.updateBadges();
    }
};

// Auto-initialize Sidebar Accordion on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.V4SidebarAccordion) window.V4SidebarAccordion.init();
    });
} else {
    if (window.V4SidebarAccordion) window.V4SidebarAccordion.init();
}

// --- Illustration Library UI Rendering ---
window.renderIllustrationLibrary = function() {
    const container = document.getElementById('illustration-library-container');
    if (!container || !window.V4_COMPONENT_LIBRARY) return 0;

    const illustrations = window.V4_COMPONENT_LIBRARY.illustrations || [];
    const query = (window.editorSearchQuery || '').toLowerCase().trim();
    const filtered = query ? illustrations.filter(item => {
        const enMatch = item.name.toLowerCase().includes(query);
        const titleMatch = item.title ? item.title.toLowerCase().includes(query) : false;
        const koMatch = item.koName ? item.koName.toLowerCase().includes(query) : false;
        return enMatch || titleMatch || koMatch;
    }) : illustrations;

    if (query) {
        // 검색 모드: 구분선 없이 일치하는 카드만 렌더링
        container.innerHTML = filtered.map(item => `
            <div class="component-item v4-card v4-card-illustration" onclick="insertV4ComponentById('${item.id}')" title="${item.title || item.name}">
                <div class="illustration-thumb-wrap">
                    <img src="${item.thumb}" alt="${item.name}" />
                </div>
                <span class="illustration-label">${item.name}</span>
            </div>
        `).join('');
    } else {
        // 기본 모드: 스타일 그룹별 섹션 헤더(divider)와 함께 렌더링 (서브그룹 접기/펼치기 지원)
        let html = '';
        let currentGroup = '';
        filtered.forEach(item => {
            if (item.group && item.group !== currentGroup) {
                currentGroup = item.group;
                const groupTitle = item.groupTitle || currentGroup;
                const groupCount = filtered.filter(x => x.group === currentGroup).length;
                const isSubCol = window.V4SidebarAccordion ? window.V4SidebarAccordion.isSubGroupCollapsed(currentGroup) : false;
                html += `
                    <div class="illustration-group-divider collapsible-divider ${isSubCol ? 'is-sub-collapsed' : ''}" onclick="if(window.V4SidebarAccordion)window.V4SidebarAccordion.toggleSubGroup('${currentGroup}');" title="${groupTitle} 접기/펼치기">
                        <span class="illustration-group-title">
                            <span class="material-icons-outlined illustration-subgroup-chevron">expand_more</span>
                            ${groupTitle}
                        </span>
                        <span class="illustration-group-count">${groupCount}</span>
                    </div>
                `;
            }
            const isSubCol = window.V4SidebarAccordion ? window.V4SidebarAccordion.isSubGroupCollapsed(item.group) : false;
            if (!isSubCol) {
                html += `
                    <div class="component-item v4-card v4-card-illustration" onclick="insertV4ComponentById('${item.id}')" title="${item.title || item.name}">
                        <div class="illustration-thumb-wrap">
                            <img src="${item.thumb}" alt="${item.name}" />
                        </div>
                        <span class="illustration-label">${item.name}</span>
                    </div>
                `;
            }
        });
        container.innerHTML = html;
    }

    return filtered.length;
};

// --- V4 Library UI Rendering (SSOT) ---
window.renderV4Shapes = function() {
    console.log("[Component Library] Rendering V4 Shapes dynamically...");
    const container = document.getElementById('v4-shapes-container');
    if (!container || !window.V4_COMPONENT_LIBRARY) {
        console.warn("[Component Library] #v4-shapes-container or V4_COMPONENT_LIBRARY not found!");
        return 0;
    }

    const molecules = window.V4_COMPONENT_LIBRARY.molecules || [];
    const shapes = molecules.filter(item => item.category === 'Shapes');

    const query = (window.editorSearchQuery || '').toLowerCase().trim();
    const filteredShapes = query ? shapes.filter(item => {
        const enMatch = item.name.toLowerCase().includes(query);
        const koMatch = item.koName ? item.koName.toLowerCase().includes(query) : false;
        return enMatch || koMatch;
    }) : shapes;

    container.innerHTML = filteredShapes.map(item => {
        let onclickAttr = '';
        let classList = 'component-item v4-card';
        let dataAttrs = '';
        let titleAttr = item.name;

        // 1) 툴 카드인 경우 (Text 툴)
        if (item.isTool) {
            classList += ' sidebar-tool-btn';
            dataAttrs = `data-tool="${item.toolName}"`;
            titleAttr = `${item.name} 추가`;
            onclickAttr = `onclick="if (typeof window.handleTextboxCreation === 'function') window.handleTextboxCreation();"`;
        } 
        // 2) 클릭 액션이 명시된 경우 (선그리기 등)
        else if (item.onclick) {
            onclickAttr = `onclick="${item.onclick}"`;
            titleAttr = item.name;
        } 
        // 3) 일반 V4 컴포넌트 추가인 경우
        else {
            onclickAttr = `onclick="insertV4ComponentById('${item.id}')"`;
            titleAttr = item.name;
        }

        // 아이콘 HTML 빌드
        let iconHtml = '';
        if (item.iconType === 'svg') {
            iconHtml = item.iconSvg;
        } else if (item.icon) {
            const styleStr = item.iconStyle ? `style="${item.iconStyle} font-size: 18px; color: ${item.iconColor || 'var(--text-secondary)'};"` : `style="font-size: 18px; color: ${item.iconColor || 'var(--text-secondary)'};"`;
            iconHtml = `<span class="material-icons-outlined" ${styleStr}>${item.icon}</span>`;
        } else {
            iconHtml = `<span class="material-icons-outlined" style="font-size: 18px; color: var(--text-secondary);">extension</span>`;
        }

        const cardStyle = item.cardStyle ? item.cardStyle : '';

        return `
            <div class="${classList}" ${onclickAttr} ${dataAttrs} title="${titleAttr}" style="${cardStyle} border-radius: 8px; padding: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; box-sizing: border-box; text-align: center;">
                ${iconHtml}
                <span style="font-size: 10px; font-weight: 600; color: var(--text-secondary); text-align: center; width: 100%; display: block; line-height: 1.2;">${item.name}</span>
            </div>
        `;
    }).join('');

    return filteredShapes.length;
};

window.renderAtomicLibrary = function() {
    const query = (window.editorSearchQuery || '').toLowerCase().trim();

    // 1. Shapes 렌더링 및 매치 카운트 획득
    let shapesCount = 0;
    if (typeof window.renderV4Shapes === 'function') {
        shapesCount = window.renderV4Shapes();
    }

    // 2. Custom Components (Molecules) 필터링 및 렌더링
    const rawCustomComps = window.state ? window.state.globalComponents : null;
    const customComps = Array.isArray(rawCustomComps) ? rawCustomComps : (rawCustomComps && typeof rawCustomComps === 'object' ? Object.values(rawCustomComps) : []);
    const filteredCustomComps = query ? customComps.filter(m => m && m.name && m.name.toLowerCase().includes(query)) : customComps;

    const compHeader = document.getElementById('molecules-header-text');
    if (compHeader) {
        compHeader.textContent = 'COMPONENTS';
    }

    const molContainer = document.getElementById('custom-molecules-container');
    if (molContainer) {
        molContainer.innerHTML = filteredCustomComps.map(m => `
            <div class="v4-component-item">
                <div class="v4-component-name-wrap" onclick="insertV4ComponentById('${m.id}')">
                    <span class="material-icons-outlined" style="font-size:14px; margin-right:8px; color:var(--accent); flex-shrink:0;">category</span>
                    <span class="v4-component-name" title="${m.name}">${m.name}</span>
                </div>
                <div class="v4-comp-actions">
                    <button class="v4-comp-btn v4-comp-edit-btn" onclick="renameComponent('${m.id}', event)" title="이름 수정"><span class="material-icons-outlined" style="font-size:14px;">edit</span></button>
                    <button class="v4-comp-btn v4-comp-delete-btn" onclick="deleteMolecule('${m.id}', event)" title="삭제"><span class="material-icons-outlined" style="font-size:14px;">close</span></button>
                </div>
            </div>
        `).join('');
    }

    // 3. Static Atomic Library & Icon Library 필터링
    let atomicCount = 0;
    const atomicContainer = document.getElementById('atomic-library-container');
    if (atomicContainer) {
        const cards = atomicContainer.querySelectorAll('.component-item');
        cards.forEach(card => {
            const nameSpan = card.querySelector('span:not(.material-icons-outlined)') || card.querySelector('span');
            const nameText = nameSpan ? nameSpan.innerText : '';
            const koText = card.getAttribute('data-ko') || '';
            const isMatch = nameText.toLowerCase().includes(query) || koText.toLowerCase().includes(query);
            card.style.setProperty('display', isMatch ? 'flex' : 'none', 'important');
            if (isMatch) atomicCount++;
        });
    }

    let iconCount = 0;
    const iconContainer = document.getElementById('icon-library-container');
    if (iconContainer) {
        const cards = iconContainer.querySelectorAll('.component-item');
        cards.forEach(card => {
            const nameSpan = card.querySelector('span');
            const nameText = nameSpan ? nameSpan.innerText : '';
            const koText = card.getAttribute('data-ko') || '';
            const isMatch = nameText.toLowerCase().includes(query) || koText.toLowerCase().includes(query);
            card.style.setProperty('display', isMatch ? 'flex' : 'none', 'important');
            if (isMatch) iconCount++;
        });
    }

    // 4. Section Visibility 조절
    const shapesHeader = document.getElementById('v4-shapes-header');
    const shapesBody = document.getElementById('v4-shapes-body');
    if (shapesHeader && shapesBody) {
        const hasShapes = shapesCount > 0;
        shapesHeader.style.setProperty('display', hasShapes ? 'flex' : 'none', 'important');
        shapesBody.style.setProperty('display', hasShapes ? 'block' : 'none', 'important');
    }

    const atomicHeader = document.getElementById('atomic-library-header');
    const atomicBody = document.getElementById('atomic-library-body');
    if (atomicHeader && atomicBody) {
        const hasAtomic = atomicCount > 0;
        atomicHeader.style.setProperty('display', hasAtomic ? 'flex' : 'none', 'important');
        atomicBody.style.setProperty('display', hasAtomic ? 'block' : 'none', 'important');
    }

    const iconHeader = document.getElementById('icon-library-header');
    const iconBody = document.getElementById('icon-library-body');
    if (iconHeader && iconBody) {
        const hasIcon = iconCount > 0;
        iconHeader.style.setProperty('display', hasIcon ? 'flex' : 'none', 'important');
        if (!hasIcon) {
            iconBody.style.setProperty('display', 'none', 'important');
        } else if (query) {
            // 검색 중: 매칭 항목 있으면 무조건 펼쳐서 노출
            iconBody.style.setProperty('display', 'block', 'important');
            iconHeader.classList.remove('is-collapsed');
            iconBody.classList.remove('is-collapsed');
        } else {
            // 검색 없음: 저장된 사용자 접힘 상태 복원 (기본 접힘)
            const isCol = window.V4SidebarAccordion ? window.V4SidebarAccordion.isCollapsed('icon-library') : true;
            iconBody.style.setProperty('display', isCol ? 'none' : 'block', 'important');
            iconHeader.classList.toggle('is-collapsed', isCol);
            iconBody.classList.toggle('is-collapsed', isCol);
        }
    }

    // 3.5. Illustration Library 렌더링
    let illustrationCount = 0;
    if (typeof window.renderIllustrationLibrary === 'function') {
        illustrationCount = window.renderIllustrationLibrary();
    }
    const illHeader = document.getElementById('illustration-library-header');
    const illBody = document.getElementById('illustration-library-body');
    if (illHeader && illBody) {
        const hasIll = illustrationCount > 0;
        illHeader.style.setProperty('display', hasIll ? 'flex' : 'none', 'important');
        if (!hasIll) {
            illBody.style.setProperty('display', 'none', 'important');
        } else if (query) {
            // 검색 중: 매칭 항목 있으면 무조건 펼쳐서 노출
            illBody.style.setProperty('display', 'block', 'important');
            illHeader.classList.remove('is-collapsed');
            illBody.classList.remove('is-collapsed');
        } else {
            // 검색 없음: 저장된 사용자 접힘 상태 복원 (기본 접힘)
            const isCol = window.V4SidebarAccordion ? window.V4SidebarAccordion.isCollapsed('illustration-library') : true;
            illBody.style.setProperty('display', isCol ? 'none' : 'block', 'important');
            illHeader.classList.toggle('is-collapsed', isCol);
            illBody.classList.toggle('is-collapsed', isCol);
        }
    }

    const moleculesHeader = document.getElementById('molecules-header');
    const moleculesBody = document.getElementById('molecules-body');
    if (moleculesHeader && moleculesBody) {
        const hasMolecules = filteredCustomComps.length > 0;
        moleculesHeader.style.setProperty('display', hasMolecules ? 'flex' : 'none', 'important');
        if (!hasMolecules) {
            moleculesBody.style.setProperty('display', 'none', 'important');
        } else if (query) {
            // 검색 중: 매칭 항목 있으면 무조건 펼쳐서 노출
            moleculesBody.style.setProperty('display', 'block', 'important');
            moleculesHeader.classList.remove('is-collapsed');
            moleculesBody.classList.remove('is-collapsed');
        } else {
            // 검색 없음: 저장된 사용자 접힘 상태 복원 (기본 접힘)
            const isCol = window.V4SidebarAccordion ? window.V4SidebarAccordion.isCollapsed('molecules') : true;
            moleculesBody.style.setProperty('display', isCol ? 'none' : 'block', 'important');
            moleculesHeader.classList.toggle('is-collapsed', isCol);
            moleculesBody.classList.toggle('is-collapsed', isCol);
        }
    }

    // 5. Empty State 처리
    const totalMatch = shapesCount + atomicCount + iconCount + illustrationCount + filteredCustomComps.length;
    const emptyState = document.getElementById('sidebar-search-empty');
    if (emptyState) {
        emptyState.style.setProperty('display', totalMatch === 0 ? 'flex' : 'none', 'important');
    }

    // 6. Section Asset Count Badges 실시간 갱신
    if (window.V4SidebarAccordion) {
        window.V4SidebarAccordion.updateBadges();
    }
};
