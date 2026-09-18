/**
 * vctrl_inspector.js - UI & Inspector Controller
 * Responsibility: DOM management, sidebar tabs, metadata UI, and component properties.
 */

console.log("%c [VCTRL INSPECTOR] Initializing UI Controller... ", "background: #10b981; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 1. Central DOM Registry
window.get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {}, toggle:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };
const highlightActive = (btn, isActive) => window.highlightActive(btn, isActive);


window.rebindInspectorDOM = function() {
    console.log("[VCTRL INSPECTOR] Rebinding dynamic UI components selectors...");
    const get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {}, toggle:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };
    
    DOM.textPropSection = get('text-editor-section');
    DOM.tablePropSection = get('table-inspector-section');
    DOM.shapePropSection = get('shape-inspector-section');
    DOM.linePropSection = get('line-editor-section');
    DOM.iconPropSection = get('icon-inspector-section');
    DOM.checkboxRadioPropSection = get('checkbox-radio-inspector-section');
    DOM.textboxTextareaPropSection = get('textbox-textarea-inspector-section');
    DOM.searchbarPropSection = get('searchbar-inspector-section');
    DOM.stepperPropSection = get('stepper-inspector-section');
    DOM.selectboxPropSection = get('selectbox-inspector-section');
    DOM.fileuploadPropSection = get('fileupload-inspector-section');
    DOM.alertPropSection = get('alert-inspector-section');
    DOM.buttonPropSection = get('button-inspector-section');
    DOM.datepickerPropSection = get('datepicker-inspector-section');
    DOM.datePickerPropSection = get('datepicker-inspector-section');
    DOM.togglePropSection = get('toggle-inspector-section');
    DOM.accordionPropSection = get('accordion-inspector-section');
    DOM.gridPropSection = get('grid-inspector-section');
    DOM.adminSettingsPropSection = get('admin-settings-inspector-section');
    DOM.tabPropSection = get('tab-inspector-section');

    DOM.textColorPicker = get('text-color-picker');
    DOM.selectionBar = get('selection-actions-bar');
    DOM.selectionCount = get('selection-count');
    DOM.selectionNumber = get('selection-number');
    DOM.selectionLabel = get('selection-label');
    DOM.btnGroup = get('btn-group-action');
    DOM.btnUngroup = get('btn-ungroup-action');
    DOM.btnAddToMolecules = get('btn-add-molecules-action');
    DOM.btnBringFront = get('btn-bring-front-action');
    DOM.btnSendBack = get('btn-send-back-action');

    if (typeof window.initUnifiedLabels === 'function') {
        window.initUnifiedLabels();
    }
};

window.restorePropertiesSections = function(force) {
    if (typeof window.closeV4ColorPalette === 'function') {
        window.closeV4ColorPalette();
    }
    const storage = document.getElementById('inspector-panels-storage');
    if (!storage) return;

    const activeEl = document.activeElement;

    const sections = [
        DOM.shapePropSection, DOM.textPropSection, DOM.tablePropSection,
        DOM.linePropSection, DOM.iconPropSection, DOM.checkboxRadioPropSection,
        DOM.textboxTextareaPropSection, DOM.searchbarPropSection, DOM.stepperPropSection, DOM.selectboxPropSection,
        DOM.fileuploadPropSection, DOM.alertPropSection, DOM.buttonPropSection,
        DOM.datePickerPropSection, DOM.togglePropSection, DOM.accordionPropSection, DOM.gridPropSection,
        DOM.adminSettingsPropSection, DOM.tabPropSection
    ];

    sections.forEach(sec => {
        if (sec && sec instanceof Node) {
            if (!force && activeEl && sec.contains(activeEl)) {
                return;
            }
            sec.style.display = 'none';
            storage.appendChild(sec);
        }
    });
};

window.DOM = {
    iframe: get('main-iframe'),
    artboardWrapper: get('artboard-wrapper'),
    placeholder: get('placeholder'),
    placeholderTxt: get('placeholder-txt'),
    canvas: get('canvas'),
    stage: get('stage'),
    zoomTxt: get('zoom-txt'),
    fileName: get('file-name-display'),
    btnBack: get('btn-back'),
    
    // Panels
    metadataPanel: get('top-metadata-panel'),
    screensList: get('screens-list'),
    descriptionList: get('description-list'),
    sidebarLeft: get('sidebar-left'),
    sidebarRight: get('sidebar-right'),
    
    // Bottom Bar
    // Bottom Bar
    pinsLayer: get('pins-layer'),
    guideLayer: get('guide-layer'),
    
    // Buttons
    btnToggleLeft: get('btn-toggle-left'),
    btnToggleRight: get('btn-toggle-right'),
    btnGlobalSave: get('btn-global-save'),
    btnFullscreen: get('btn-fullscreen-toggle'),
    btnFullscreenExit: get('btn-fullscreen-exit'),
    
    // Screen Management
    btnAddScreen: get('btn-add-screen'),
    addScreenModal: get('add-screen-modal'),
    btnCancelAdd: get('btn-add-screen-cancel'),
    btnSubmitAdd: get('btn-add-screen-submit'),
    
    // Templates
    newScreenName: get('new-screen-name'),
    templateList: get('template-list'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    sidebarToolBtns: document.querySelectorAll('.sidebar-tool-btn'),

    // Modals
    editScreenModal: get('edit-screen-modal'),
    editScreenTitle: get('edit-screen-title'),
    editScreenType: get('edit-screen-type'),
    editScreenDefaultTab: get('edit-screen-default-tab'),
    editScreenDesc: get('edit-screen-desc'),
    editScreenFilename: get('edit-screen-filename'),
    btnCancelEdit: get('btn-edit-screen-cancel'),
    btnSubmitEdit: get('btn-edit-screen-submit'),
    
    // Description
    btnAddDescription: get('btn-add-description'),

    // Smart Inspector Elements
    sidebarTabsBar: get('sidebar-tabs-bar'),
    sidebarInspectorHeader: get('sidebar-inspector-header'),
    tabInspector: get('tab-inspector'),
    sidebarInspectorBody: get('sidebar-inspector-body'),
    btnSidebarPopout: get('btn-sidebar-popout'),
    btnSidebarCloseProps: get('btn-sidebar-close-props'),
    btnFloatingSwap: get('btn-floating-swap'),
    btnFloatingDock: get('btn-floating-dock'),
    btnFloatingClose: get('btn-floating-close'),

    // Properties Sidebar Additions
    textPropSection: get('text-editor-section'),
    tablePropSection: get('table-inspector-section'),
    shapePropSection: get('shape-inspector-section'),
    linePropSection: get('line-editor-section'),
    iconPropSection: get('icon-inspector-section'),
    checkboxRadioPropSection: get('checkbox-radio-inspector-section'),
    textboxTextareaPropSection: get('textbox-textarea-inspector-section'),
    searchbarPropSection: get('searchbar-inspector-section'),
    stepperPropSection: get('stepper-inspector-section'),
    selectboxPropSection: get('selectbox-inspector-section'),
    fileuploadPropSection: get('fileupload-inspector-section'),
    alertPropSection: get('alert-inspector-section'),
    buttonPropSection: get('button-inspector-section'),
    datepickerPropSection: get('datepicker-inspector-section'),
    datePickerPropSection: get('datepicker-inspector-section'),
    togglePropSection: get('toggle-inspector-section'),
    accordionPropSection: get('accordion-inspector-section'),
    gridPropSection: get('grid-inspector-section'),
    adminSettingsPropSection: get('admin-settings-inspector-section'),
    tabPropSection: get('tab-inspector-section'),
    textColorPicker: get('text-color-picker'),
    colorPresets: document.querySelectorAll('.color-preset'),

    // Selection Actions
    selectionBar: get('selection-actions-bar'),
    selectionCount: get('selection-count'),
    selectionNumber: get('selection-number'),
    selectionLabel: get('selection-label'),
    btnGroup: get('btn-group-action'),
    btnUngroup: get('btn-ungroup-action'),
    btnAddToMolecules: get('btn-add-molecules-action'),
    btnBringFront: get('btn-bring-front-action'),
    btnSendBack: get('btn-send-back-action'),
    // Alignment
    alignBar: get('selection-align-bar'),
    btnAlignLeft: get('btn-align-left'),
    btnAlignCenter: get('btn-align-center'),
    btnAlignRight: get('btn-align-right'),
    btnAlignTop: get('btn-align-top'),
    btnAlignMiddle: get('btn-align-middle'),
    btnAlignBottom: get('btn-align-bottom'),
    btnAlignDistributeH: get('btn-align-distribute-h'),
    btnAlignDistributeV: get('btn-align-distribute-v')
};

// --- 2. Sidebar & Tab Management (Unified & Clean) ---
window.toggleSidebar = function(side, forceOpen = null) {
    if (typeof window.hideScreenFlyout === 'function') window.hideScreenFlyout(0);
    console.log(`[Inspector] toggleSidebar(${side}, forceOpen: ${forceOpen})`);
    const sidebar = side === 'left' ? DOM.sidebarLeft : DOM.sidebarRight;
    if (!sidebar || !sidebar.classList) return;
    
    const isCollapsed = sidebar.classList.contains('collapsed');
    const shouldOpen = forceOpen !== null ? forceOpen : isCollapsed;
    
    sidebar.classList.toggle('collapsed', !shouldOpen);
    console.log(`[Inspector] Sidebar ${side} is now ${shouldOpen ? 'OPEN' : 'COLLAPSED'}`);
    
    const btn = side === 'left' ? DOM.btnToggleLeft : DOM.btnToggleRight;
    if (btn) {
        const icon = btn.querySelector('.material-icons-outlined, span');
        if (icon) {
            if (side === 'left') icon.innerText = shouldOpen ? 'chevron_left' : 'menu_open';
            else icon.innerText = shouldOpen ? 'chevron_right' : 'chevron_left';
        }
        btn.classList.toggle('active', shouldOpen);
    }

    setTimeout(() => {
        if (typeof window.centerView === 'function') window.centerView();
    }, 280);
};



window._lastActiveSidebarTab = 'editor';

window.setSidebarInspectorVisible = function(visible) {
    const tabsBar = document.getElementById('sidebar-tabs-bar');
    const header = document.getElementById('sidebar-inspector-header');
    const inspectorPane = document.getElementById('tab-inspector');
    const sidebarRight = document.getElementById('sidebar-right');
    const panes = document.querySelectorAll('.tab-pane');

    if (visible) {
        if (tabsBar) tabsBar.style.display = 'none';
        if (header) header.style.display = 'flex';
        panes.forEach(pane => {
            if (pane.id !== 'tab-inspector') {
                pane.style.setProperty('display', 'none', 'important');
            }
        });
        if (inspectorPane) inspectorPane.style.setProperty('display', 'flex', 'important');
    } else {
        if (tabsBar) tabsBar.style.display = 'flex';
        if (header) header.style.display = 'none';
        if (inspectorPane) inspectorPane.style.setProperty('display', 'none', 'important');

        const lastTab = window._lastActiveSidebarTab || 'editor';
        const activePane = document.getElementById(`tab-${lastTab}`);
        if (activePane) activePane.style.setProperty('display', 'flex', 'important');
        const btns = document.querySelectorAll('.tab-btn');
        btns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === lastTab));
        if (lastTab === 'description' && typeof window.autoResizeDescriptionInputs === 'function') {
            setTimeout(window.autoResizeDescriptionInputs, 50);
        }
    }
};

window.switchSidebarTab = function(tabName) {
    window._lastActiveSidebarTab = tabName;
    if (typeof window.setSidebarInspectorVisible === 'function') {
        window.setSidebarInspectorVisible(false);
    }
    const targetPane = document.getElementById(`tab-${tabName}`);
    const sidebarRight = document.getElementById('sidebar-right');
    const isSidebarOpen = sidebarRight && !sidebarRight.classList.contains('collapsed');
    
    // If target tab is already active and sidebar is open, exit early to avoid reflow/focus interruption
    if (targetPane && targetPane.classList.contains('active') && isSidebarOpen) {
        if (tabName === 'description' && typeof window.autoResizeDescriptionInputs === 'function') {
            setTimeout(window.autoResizeDescriptionInputs, 50);
        }
        return;
    }

    console.log(`[Inspector] switchSidebarTab START: ${tabName}`);
    const btns = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    
    if (btns.length === 0) console.warn("[Inspector] No .tab-btn elements found!");
    if (panes.length === 0) console.warn("[Inspector] No .tab-pane elements found!");

    btns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    panes.forEach(pane => {
        const isActive = pane.id === `tab-${tabName}`;
        pane.classList.toggle('active', isActive);
        pane.style.setProperty('display', isActive ? 'flex' : 'none', 'important');
        if (isActive) console.log(`[Inspector] Pane activated: ${pane.id}`);
    });
    
    // Ensure sidebar is open when switching tabs
    window.toggleSidebar('right', true);
    
    if (tabName === 'description' && typeof window.autoResizeDescriptionInputs === 'function') {
        setTimeout(window.autoResizeDescriptionInputs, 50);
    }
    
    console.log(`[Inspector] switchSidebarTab END: ${tabName}`);
};

// --- 3. UI Rendering Functions ---
window.updateProperties = function(compStyles) {
    const activeEl = document.activeElement;
    const isBtn = activeEl && (activeEl.tagName === 'BUTTON' || !!activeEl.closest('button'));
    const isNewComp = Boolean(compStyles && compStyles.id && compStyles.id !== state.editingIndex);

    // If selecting a different component, clear residual parent focus to ensure immediate synchronization
    if (isNewComp && activeEl && typeof activeEl.blur === 'function') {
        activeEl.blur();
    }

    const currentActiveEl = document.activeElement;
    const isTypingInInspector = !isBtn && currentActiveEl && !isNewComp && (
        currentActiveEl.tagName === 'INPUT' ||
        currentActiveEl.tagName === 'TEXTAREA' ||
        currentActiveEl.tagName === 'SELECT' ||
        currentActiveEl.isContentEditable ||
        currentActiveEl.classList.contains('v4-prop-input') ||
        currentActiveEl.classList.contains('admin-col-label-input') ||
        currentActiveEl.classList.contains('grid-col-name-input') ||
        currentActiveEl.classList.contains('accordion-sub-input')
    );
    
    if (isTypingInInspector) {
        return;
    }
    
    window.restorePropertiesSections(isNewComp);
    const pm = state.projectMetadata || {};
    if (!DOM.metadataPanel) return;

// Project Metadata UI Manager Namespace
const ProjectMetadataManager = {
    renderBar(pm) {
        let linksHtml = '';
        if (pm.figmaUrl && pm.figmaUrl.trim()) {
            linksHtml += `
                <a href="${pm.figmaUrl}" target="_blank" rel="noopener noreferrer" class="v4-meta-chip meta-chip-link meta-chip-figma" title="Figma 바로가기 (새 창)">
                    <span class="material-icons-outlined" style="font-size:13px; line-height:1;">brush</span>
                    <span>Figma</span>
                </a>`;
        }
        if (pm.notionUrl && pm.notionUrl.trim()) {
            linksHtml += `
                <a href="${pm.notionUrl}" target="_blank" rel="noopener noreferrer" class="v4-meta-chip meta-chip-link meta-chip-notion" title="Notion 바로가기 (새 창)">
                    <svg class="meta-chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style="flex-shrink:0;">
                        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.373-.747.934zm14.337.747.093 10.92-2.147.14-.093-7.56-3.267 7.7-1.727.093-3.174-7.514v7.7l-2.007.14V7.942l2.613-.187 3.5 7.98 3.314-7.887z"/>
                    </svg>
                    <span>Notion</span>
                </a>`;
        }

        DOM.metadataPanel.innerHTML = `
            <div class="v4-meta-horizontal">
                <input type="hidden" id="viewer-meta-title" value="${pm.title || ''}">
                <div class="v4-meta-chip meta-chip-assignee" title="담당자 (Assignee)">
                    <span class="meta-chip-label">ASSIGNEE</span>
                    <span class="meta-chip-divider"></span>
                    <input type="text" id="viewer-meta-assignee" class="meta-chip-input" value="${pm.assignee || ''}" placeholder="담당자" autocomplete="off">
                </div>
                <div class="v4-meta-chip meta-chip-developer" title="개발자 (Developer)">
                    <span class="meta-chip-label">DEV</span>
                    <span class="meta-chip-divider"></span>
                    <input type="text" id="viewer-meta-developer" class="meta-chip-input" value="${pm.developer || ''}" placeholder="개발자" autocomplete="off">
                </div>
                <div class="v4-meta-chip meta-chip-period" title="사업 기간 (Period)">
                    <span class="meta-chip-label">PERIOD</span>
                    <span class="meta-chip-divider"></span>
                    <input type="text" id="viewer-meta-period" class="meta-chip-input" value="${pm.period || ''}" placeholder="사업 기간" autocomplete="off">
                </div>
                ${linksHtml}
            </div>
        `;
        this.bindEvents();
    },
    bindEvents() {
        // Additional metadata bar events can be bound here
    },
    updateFields(pm) {
        const titleIn = document.getElementById('viewer-meta-title'); if (titleIn) titleIn.value = pm.title || '';
        const assigneeIn = document.getElementById('viewer-meta-assignee'); if (assigneeIn && document.activeElement !== assigneeIn) assigneeIn.value = pm.assignee || '';
        const devIn = document.getElementById('viewer-meta-developer'); if (devIn && document.activeElement !== devIn) devIn.value = pm.developer || '';
        const periodIn = document.getElementById('viewer-meta-period'); if (periodIn && document.activeElement !== periodIn) periodIn.value = pm.period || '';
    }
};

    // 1. Update Top Metadata Bar
    if (!DOM.metadataPanel.innerHTML.includes('v4-meta-horizontal')) {
        ProjectMetadataManager.renderBar(pm);
    } else {
        ProjectMetadataManager.updateFields(pm);
    }

    // 1-1. Update Sidebar Footer (Last Updated)
    const updatedTxt = document.getElementById('meta-updated-txt');
    if (updatedTxt) {
        updatedTxt.innerText = pm.updated ? `최종 업데이트: ${pm.updated}` : '최종 업데이트: -';
    }

    // 2. Update Sidebar Panels based on selected component
    const hasSelection = (window.state && window.state.selectedIds && window.state.selectedIds.length > 0);
    if (compStyles || hasSelection) {
        if (compStyles) {
            state.selectedComponent = { id: compStyles.id, ...compStyles };
            state.selectedComponentStyles = compStyles;
        }

        if (!state.inspectorMode) {
            try { state.inspectorMode = localStorage.getItem('lf_inspector_mode') || 'docked'; } catch (_) { state.inspectorMode = 'docked'; }
        }
        if (!state.floatingSide) {
            try { state.floatingSide = localStorage.getItem('lf_inspector_floating_side') || 'right'; } catch (_) { state.floatingSide = 'right'; }
        }

        const isDocked = (state.inspectorMode === 'docked');
        const floatingInspector = document.getElementById('floating-inspector-card');

        if (isDocked) {
            window.toggleSidebar('right', true);
            window.setSidebarInspectorVisible(true);
            if (floatingInspector) {
                floatingInspector.style.setProperty('display', 'none', 'important');
            }
        } else {
            window.setSidebarInspectorVisible(false);
            if (floatingInspector) {
                floatingInspector.style.setProperty('display', 'flex', 'important');
                floatingInspector.style.bottom = '24px';
                floatingInspector.style.top = 'auto';

                const side = state.floatingSide || 'right';
                if (side === 'left') {
                    floatingInspector.style.left = '24px';
                    floatingInspector.style.right = 'auto';
                } else {
                    floatingInspector.style.right = '24px';
                    floatingInspector.style.left = 'auto';
                }
            }
        }

        // Hide all sections first & return active sections to storage
        window.restorePropertiesSections(isNewComp);
        const activeEl = document.activeElement;
        const isBtn = activeEl && activeEl.tagName === 'BUTTON';
        const isTypingInAdminProps = !isBtn && activeEl && (activeEl.classList.contains('admin-col-label-input') || activeEl.classList.contains('admin-row-height-input') || activeEl.id === 'prop-admin-group-header-title' || activeEl.id === 'prop-admin-label-width-slider' || activeEl.id === 'prop-admin-label-width-number');
        const isTyping = !isBtn && activeEl && (
            activeEl.tagName === 'INPUT' || 
            activeEl.tagName === 'TEXTAREA' || 
            activeEl.isContentEditable || 
            isTypingInAdminProps ||
            activeEl.classList.contains('grid-col-width-input') ||
            activeEl.classList.contains('grid-col-name-input')
        );

        const arrowGroupInit = document.getElementById('shape-arrow-direction-group');
        if (arrowGroupInit) arrowGroupInit.style.display = 'none';
        if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
        if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'none';
        if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
        if (DOM.linePropSection) DOM.linePropSection.style.display = 'none';
        if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'none';
        if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'none';
        if (DOM.textboxTextareaPropSection) DOM.textboxTextareaPropSection.style.display = 'none';
        if (DOM.searchbarPropSection) DOM.searchbarPropSection.style.display = 'none';
        if (DOM.stepperPropSection) DOM.stepperPropSection.style.display = 'none';
        if (DOM.selectboxPropSection) DOM.selectboxPropSection.style.display = 'none';
        if (DOM.fileuploadPropSection) DOM.fileuploadPropSection.style.display = 'none';
        if (DOM.alertPropSection) DOM.alertPropSection.style.display = 'none';
        if (DOM.buttonPropSection) DOM.buttonPropSection.style.display = 'none';
        if (DOM.datePickerPropSection) DOM.datePickerPropSection.style.display = 'none';
        if (DOM.togglePropSection) DOM.togglePropSection.style.display = 'none';
        if (DOM.adminSettingsPropSection && !isTypingInAdminProps) DOM.adminSettingsPropSection.style.display = 'none';

        if (compStyles) {
            state.isEditing = true;
            const hasValidPinIndex = compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1 && !isNaN(compStyles.pinIndex);
            state.editingIndex = hasValidPinIndex ? compStyles.pinIndex : compStyles.id;
            let type = 'comp';
            if (compStyles.isGroup) type = 'group';
            else if (compStyles.isPin && hasValidPinIndex) type = 'pin';
            else if (compStyles.isGrid) type = 'grid';
            else if (compStyles.isTable) type = 'table';
            else if (compStyles.shapeType === 'line' || compStyles.id === 'v4-shape-line') type = 'line';
            else if (compStyles.isShape || compStyles.isPin) type = 'shape';
            else if (compStyles.isConnector) type = 'line';
            else if (compStyles.isTextbox) type = 'textbox';
            else if (compStyles.isTextarea) type = 'textarea';
            else if (compStyles.isSearchBar) type = 'searchbar';
            else if (compStyles.isStepper) type = 'stepper';
            else if (compStyles.isSelectbox) type = 'selectbox';
            else if (compStyles.isFileUpload) type = 'fileupload';
            else if (compStyles.isAlert) type = 'alert';
            else if (compStyles.isButton) type = 'button';
            else if (compStyles.isDatePicker) type = 'datepicker';
            else if (compStyles.isToggle) type = 'toggle';
            else if (compStyles.isAccordion) type = 'accordion';
            else if (compStyles.isAdminSettings) type = 'admin-settings';
            else if (compStyles.isTab) type = 'tab';
            else if (compStyles.isIcon) type = 'icon';
            state.editingType = type;

            // Show relevant section
            if (state.editingType === 'pin' || state.editingType === 'shape') {
                if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'block';
                if (window.InspectorShapes && typeof window.InspectorShapes.sync === 'function') {
                    window.InspectorShapes.sync(compStyles);
                }
                // Shape 및 Pin (텍스트 마커) 모두 CONTENT EDITOR 공유 사용 (단, 이미지 도형이거나 동일 유형 다중 선택인 경우 텍스트 편집기 표시 제외)
                if (DOM.textPropSection && !compStyles.isImage && !compStyles.isMultiSameType) {
                    DOM.textPropSection.style.display = 'block';
                }

                // Pattern Type group vs BG Color/Opacity groups
                const patternGroup = document.getElementById('shape-pattern-type-group');
                const bgColorGroup = document.getElementById('shape-bg-color-group');
                const bgOpacityGroup = document.getElementById('shape-bg-opacity-group');
                const isPattern = (compStyles.shapeType === 'pattern');
                
                if (patternGroup) {
                    patternGroup.style.display = isPattern ? 'block' : 'none';
                    if (isPattern && compStyles.patternType) {
                        if (typeof window._syncPatternVisualBtns === 'function') {
                            window._syncPatternVisualBtns(compStyles.patternType);
                        }
                    }
                }
                if (bgColorGroup) {
                    bgColorGroup.style.display = isPattern ? 'none' : 'grid';
                }
                if (bgOpacityGroup) {
                    bgOpacityGroup.style.display = isPattern ? 'none' : 'block';
                }

                // Show/hide Arrow/Triangle direction config group & Corner style group (Rect only)
                const arrowGroup = document.getElementById('shape-arrow-direction-group');
                const cornerGroup = document.getElementById('shape-corner-style-group');
                const isRect = (compStyles.shapeType === 'rect' || compStyles.shapeType === 'webpage' || compStyles.id === 'v4-shape-rect' || compStyles.id === 'v4-shape-webpage');
                const isArrow = (compStyles.shapeType === 'arrow' || compStyles.id === 'v4-shape-arrow');
                const isTriangle = (compStyles.shapeType === 'triangle' || compStyles.id === 'v4-shape-triangle');
                const isArrowOrTriangle = isArrow || isTriangle;

                if (cornerGroup) {
                    cornerGroup.style.display = isRect ? 'block' : 'none';
                }
                if (arrowGroup) {
                    if (isArrowOrTriangle) {
                        arrowGroup.style.display = 'block';
                        const currentDir = compStyles.direction || compStyles.arrowDir || 'right';
                        if (typeof window._syncArrowDirBtns === 'function') {
                            window._syncArrowDirBtns(currentDir);
                        }
                    } else {
                        arrowGroup.style.display = 'none';
                    }
                }
            } else if (state.editingType === 'table') {
                if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'block';
            } else if (state.editingType === 'line') {
                if (DOM.linePropSection) DOM.linePropSection.style.display = 'block';
                if (typeof window._syncLineEditorProps === 'function') {
                    window._syncLineEditorProps(compStyles);
                }
            } else if (state.editingType === 'icon') {
                if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'block';
                if (compStyles.isCheckbox || compStyles.isRadio) {
                    if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'block';
                    _syncCheckboxRadioProps(compStyles);
                }
            } else if (state.editingType === 'textbox' || state.editingType === 'textarea') {
                if (DOM.textboxTextareaPropSection) DOM.textboxTextareaPropSection.style.display = 'block';
                _syncTextboxTextareaProps(compStyles);
            } else if (state.editingType === 'searchbar') {
                if (DOM.searchbarPropSection) DOM.searchbarPropSection.style.display = 'block';
                _syncSearchBarProps(compStyles);
            } else if (state.editingType === 'stepper') {
                if (DOM.stepperPropSection) DOM.stepperPropSection.style.display = 'block';
                _syncStepperProps(compStyles);
            } else if (state.editingType === 'selectbox') {
                if (DOM.selectboxPropSection) DOM.selectboxPropSection.style.display = 'block';
                _syncSelectboxProps(compStyles);
            } else if (state.editingType === 'fileupload') {
                if (DOM.fileuploadPropSection) DOM.fileuploadPropSection.style.display = 'block';
                _syncFileuploadProps(compStyles);
            } else if (state.editingType === 'alert') {
                if (DOM.alertPropSection) DOM.alertPropSection.style.display = 'block';
                _syncAlertProps(compStyles);
            } else if (state.editingType === 'button') {
                if (DOM.buttonPropSection) DOM.buttonPropSection.style.display = 'block';
                _syncButtonProps(compStyles);
            } else if (state.editingType === 'datepicker') {
                if (DOM.datePickerPropSection) DOM.datePickerPropSection.style.display = 'block';
                _syncDatePickerProps(compStyles);
            } else if (state.editingType === 'accordion') {
                if (DOM.accordionPropSection) DOM.accordionPropSection.style.display = 'block';
                _syncAccordionProps(compStyles);
            } else if (state.editingType === 'grid') {
                if (DOM.gridPropSection) DOM.gridPropSection.style.display = 'block';
                const activeEl = document.activeElement;
                const isBtn = activeEl && (activeEl.tagName === 'BUTTON' || !!activeEl.closest('button'));
                const isTypingInGrid = !isBtn && activeEl && (
                    activeEl.classList.contains('grid-col-width-input') || 
                    activeEl.classList.contains('grid-col-name-input') || 
                    activeEl.classList.contains('grid-col-options-input') ||
                    (activeEl.tagName === 'INPUT' && activeEl.closest('#grid-inspector-section')) ||
                    (activeEl.tagName === 'TEXTAREA' && activeEl.closest('#grid-inspector-section'))
                );
                if (!isTypingInGrid) {
                    _syncGridProps(compStyles);
                }
                if (typeof window.initGridEvents === 'function') {
                    window.initGridEvents();
                }
            } else if (state.editingType === 'admin-settings') {
                if (DOM.adminSettingsPropSection) DOM.adminSettingsPropSection.style.display = 'block';
                // Focus guard: Do not rebuild the inputs if the user is actively typing in one of them
                const activeEl = document.activeElement;
                const isBtn = activeEl && activeEl.tagName === 'BUTTON';
                const isTypingInAdminProps = !isBtn && activeEl && (activeEl.classList.contains('admin-col-label-input') || activeEl.classList.contains('admin-row-height-input') || activeEl.id === 'prop-admin-group-header-title' || activeEl.id === 'prop-admin-label-width-slider' || activeEl.id === 'prop-admin-label-width-number');
                if (!isTypingInAdminProps) {
                    _syncAdminSettingsProps(compStyles);
                }
            } else if (compStyles && (compStyles.isCheckbox || compStyles.isRadio)) {
                // Focus guard: Do not rebuild checkbox/radio properties if typing in label text input
                const activeEl = document.activeElement;
                const isTypingCheckboxLabel = activeEl && activeEl.id === 'prop-atom-text-content';
                if (!isTypingCheckboxLabel) {
                    if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'block';
                    _syncCheckboxRadioProps(compStyles);
                }
            } else if (state.editingType === 'toggle') {
                if (DOM.togglePropSection) DOM.togglePropSection.style.display = 'block';
                _syncToggleProps(compStyles);
            } else if (state.editingType === 'tab') {
                if (DOM.tabPropSection) DOM.tabPropSection.style.display = 'block';
                if (window.InspectorTab && typeof window.InspectorTab.sync === 'function') {
                    window.InspectorTab.sync(compStyles);
                }
                if (window.InspectorTab && typeof window.InspectorTab.bindEvents === 'function') {
                    window.InspectorTab.bindEvents();
                }
            }

            // Sync Property Controls
            const s = (compStyles && compStyles.currentStyles) || {};
            if (DOM.textColorPicker) DOM.textColorPicker.value = s.text || "#000000";
            if (compStyles.isIcon || s.iconColor) {
                const iconColorInput = document.getElementById('icon-color');
                if (iconColorInput && s.iconColor) {
                    iconColorInput.value = s.iconColor;
                }
            }

            // Sync Shape BG & Border Color Pickers
            if (compStyles.isShape || state.editingType === 'shape') {
                const shapeBgInput = document.getElementById('shape-bg-color');
                const shapeBorderInput = document.getElementById('shape-border-color');
                if (shapeBgInput) {
                    const validBg = (s.bg && s.bg !== 'transparent') ? s.bg : '#ffffff';
                    shapeBgInput.value = validBg;
                    const wrapper = document.getElementById('shape-bg-wrapper');
                    if (wrapper) {
                        if (s.bg === 'transparent' || s.bgOpacity === 0) wrapper.classList.add('transparent-active');
                        else wrapper.classList.remove('transparent-active');
                    }
                }
                if (shapeBorderInput) {
                    const validBorder = (s.border && s.border !== 'transparent') ? s.border : '#c8c8c8';
                    shapeBorderInput.value = validBorder;
                    const wrapper = document.getElementById('shape-border-wrapper');
                    if (wrapper) {
                        if (s.border === 'transparent') wrapper.classList.add('transparent-active');
                        else wrapper.classList.remove('transparent-active');
                    }
                }
            }

            // 1. Sync Shape Opacity
            if (compStyles.isShape || state.editingType === 'shape') {
                const opacityVal = (s.bgOpacity !== undefined) ? s.bgOpacity : 100;
                const slider = document.getElementById('shape-bg-opacity');
                const txt = document.getElementById('txt-shape-bg-opacity');
                if (slider) slider.value = opacityVal;
                if (txt) txt.innerText = opacityVal;
                const wrapper = document.getElementById('shape-bg-wrapper');
                if (wrapper) {
                    if (s.bg === 'transparent' || opacityVal === 0) wrapper.classList.add('transparent-active');
                    else wrapper.classList.remove('transparent-active');
                }
            }

            // 2. Sync Other Inputs (Font Size)
            const fontSizeInput = document.getElementById(compStyles.isTable ? 'table-font-size' : 'shape-font-size');
            if (fontSizeInput && s.fontSize !== undefined) {
                fontSizeInput.value = s.fontSize;
                const txt = document.getElementById('txt-' + fontSizeInput.id);
                if (txt) txt.innerText = s.fontSize;
            }

            // 3. Sync Corner Radius (Rect & Webpage Shape)
            const isRectShape = (compStyles.isShape || state.editingType === 'shape') && (compStyles.shapeType === 'rect' || compStyles.shapeType === 'webpage' || compStyles.id === 'v4-shape-rect' || compStyles.id === 'v4-shape-webpage' || !compStyles.shapeType);
            if (isRectShape && s.borderRadius !== undefined) {
                const radiusVal = s.borderRadius;
                const slider = document.getElementById('shape-border-radius');
                const txt = document.getElementById('txt-shape-border-radius');
                if (slider) slider.value = radiusVal;
                if (txt) txt.innerText = radiusVal;
                if (typeof window._syncCornerBtns === 'function') {
                    window._syncCornerBtns(radiusVal);
                }
            }

            // 4. Sync Text Align & Vertical Align
            if (s.textAlign !== undefined && typeof window._syncAlignBtns === 'function') {
                window._syncAlignBtns(s.textAlign);
            }
            if (s.justifyContent !== undefined && typeof window._syncVAlignBtns === 'function') {
                window._syncVAlignBtns(s.justifyContent);
            }

            // 4-B. Sync Shape Text Padding
            if (typeof window._syncShapePaddingInputs === 'function') {
                window._syncShapePaddingInputs({
                    padTop: s.padTop !== undefined ? s.padTop : 5,
                    padBottom: s.padBottom !== undefined ? s.padBottom : 5,
                    padLeft: s.padLeft !== undefined ? s.padLeft : 10,
                    padRight: s.padRight !== undefined ? s.padRight : 10
                });
            } else {
                const inPadTop = document.getElementById('shape-pad-top');
                const inPadBottom = document.getElementById('shape-pad-bottom');
                const inPadLeft = document.getElementById('shape-pad-left');
                const inPadRight = document.getElementById('shape-pad-right');
                if (inPadTop && s.padTop !== undefined && document.activeElement !== inPadTop) inPadTop.value = s.padTop;
                if (inPadBottom && s.padBottom !== undefined && document.activeElement !== inPadBottom) inPadBottom.value = s.padBottom;
                if (inPadLeft && s.padLeft !== undefined && document.activeElement !== inPadLeft) inPadLeft.value = s.padLeft;
                if (inPadRight && s.padRight !== undefined && document.activeElement !== inPadRight) inPadRight.value = s.padRight;
            }

            // 5. Sync Textbox / Textarea Properties
            if (compStyles.isTextbox || compStyles.isTextarea) {
                const phInput = document.getElementById('prop-input-placeholder');
                if (phInput && compStyles.placeholderText !== undefined) {
                    phInput.value = compStyles.placeholderText;
                }
            }

            // 6. Sync Search Bar Properties
            if (compStyles.isSearchBar) {
                const phInput = document.getElementById('prop-searchbar-placeholder');
                if (phInput && compStyles.searchbarPlaceholder !== undefined) {
                    phInput.value = compStyles.searchbarPlaceholder;
                }
                const mlInput = document.getElementById('prop-input-maxlength');
                const mlTxt = document.getElementById('txt-input-maxlength');
                if (mlInput && compStyles.maxLength !== undefined) {
                    mlInput.value = compStyles.maxLength;
                    if (mlTxt) mlTxt.innerText = compStyles.maxLength;
                }
                const activeY = document.getElementById('btn-input-counter-y');
                const activeN = document.getElementById('btn-input-counter-n');
                if (activeY && activeN && compStyles.showCounter !== undefined && typeof window.highlightActive === 'function') {
                    window.highlightActive(activeY, compStyles.showCounter === true);
                    window.highlightActive(activeN, compStyles.showCounter === false);
                }
            }

            // 7. Sync Alert Properties
            if (compStyles.isAlert) {
                _syncAlertProps(compStyles);
            }

            // 8. Sync Button Properties
            if (compStyles.isButton) {
                const txtInput = document.getElementById('prop-button-text');
                if (txtInput && document.activeElement !== txtInput && compStyles.buttonText !== undefined) {
                    txtInput.value = compStyles.buttonText;
                }
                const fontInput = document.getElementById('prop-button-font-size');
                if (fontInput && document.activeElement !== fontInput && compStyles.buttonFontSize !== undefined) {
                    fontInput.value = compStyles.buttonFontSize;
                }
                const selStyle = document.getElementById('prop-button-style');
                if (selStyle && compStyles.buttonStyle !== undefined) {
                    selStyle.value = compStyles.buttonStyle;
                    const customColorsDiv = document.getElementById('prop-button-custom-colors');
                    if (customColorsDiv) {
                        customColorsDiv.style.display = (compStyles.buttonStyle === 'custom') ? 'block' : 'none';
                    }
                }
                const radiusSlider = document.getElementById('prop-button-border-radius');
                const radiusTxt = document.getElementById('txt-button-border-radius');
                if (radiusSlider && document.activeElement !== radiusSlider && compStyles.buttonRadius !== undefined) {
                    const r = parseInt(compStyles.buttonRadius) || 0;
                    radiusSlider.value = r;
                    if (radiusTxt) radiusTxt.innerText = r;
                    if (typeof window._syncButtonCornerBtns === 'function') {
                        window._syncButtonCornerBtns(r);
                    }
                }
            }
        } else {
            // Case: Multi-selection without compStyles
            state.isEditing = true;
            state.editingType = 'multi';
        }

        // Show/Hide buttons inside selection-actions-bar based on selection count and type
        const btnGroup = document.getElementById('btn-group-action');
        const btnUngroup = document.getElementById('btn-ungroup-action');
        const btnAddToMolecules = document.getElementById('btn-add-molecules-action');
        const alignBar = document.getElementById('selection-align-bar');
        const groupDimBar = document.getElementById('group-dimension-bar');
        const groupDimWidth = document.getElementById('group-dim-width');
        const groupDimHeight = document.getElementById('group-dim-height');
        
        const selIds = (window.state && window.state.selectedIds) ? window.state.selectedIds : [];
        const isSingleGroup = selIds.length === 1 && compStyles && compStyles.isGroup;

        if (btnGroup) btnGroup.style.setProperty('display', (selIds.length > 1) ? 'flex' : 'none', 'important');
        if (btnUngroup) btnUngroup.style.setProperty('display', isSingleGroup ? 'flex' : 'none', 'important');
        if (btnAddToMolecules) btnAddToMolecules.style.setProperty('display', isSingleGroup ? 'flex' : 'none', 'important');
        if (alignBar) alignBar.style.setProperty('display', (selIds.length > 1) ? 'block' : 'none', 'important');

        if (groupDimBar) {
            if (isSingleGroup) {
                groupDimBar.style.setProperty('display', 'flex', 'important');
                let wVal = 0;
                let hVal = 0;
                if (compStyles && typeof compStyles.w === 'number') {
                    wVal = Math.round(compStyles.w);
                    hVal = Math.round(compStyles.h);
                } else if (selIds.length === 1) {
                    try {
                        const iframeDoc = document.getElementById('main-iframe')?.contentDocument;
                        const groupEl = iframeDoc?.getElementById(selIds[0]);
                        if (groupEl) {
                            wVal = Math.round(parseFloat(groupEl.style.width) || groupEl.offsetWidth || 0);
                            hVal = Math.round(parseFloat(groupEl.style.height) || groupEl.offsetHeight || 0);
                        }
                    } catch(e) {}
                }
                if (groupDimWidth) groupDimWidth.innerText = wVal + 'px';
                if (groupDimHeight) groupDimHeight.innerText = hVal + 'px';
            } else {
                groupDimBar.style.setProperty('display', 'none', 'important');
            }
        }


        // CONTENT EDITOR 헤더 레이블 동적 변경 (통합 레이블 제공)
        const editorLabel = document.getElementById('content-editor-label');
        if (editorLabel) {
            editorLabel.innerText = 'CONTENT EDITOR';
        }

        // Helper: 정규화된 HTML을 생성하여 Quill 클립보드가 인라인 font-size 및 서식을 온전히 파싱하도록 보장
        function normalizeHtmlForQuill(rawHtml, fallbackFontSize) {
            if (!rawHtml) return '<p><br></p>';
            const parser = new DOMParser();
            const parsed = parser.parseFromString(rawHtml, 'text/html');
            const textContent = parsed.querySelector('.v4-shape-text-content') || 
                                parsed.querySelector('.v4-shape-text-overlay') || 
                                parsed.querySelector('.v4-editable-cell');
            let clean = textContent ? textContent.innerHTML.trim() : rawHtml.trim();
            if (!clean) return '<p><br></p>';

            // p나 div 블록 태그가 전혀 없으면 <p>로 감싸기
            if (!clean.includes('<p') && !clean.includes('<div')) {
                clean = `<p>${clean}</p>`;
            }

            // 인라인 font-size가 전혀 없는 경우, p 태그 내부 콘텐츠에 안전하게 font-size span을 주입
            const hasExplicitFontSize = clean.includes('font-size') || clean.includes('fontSize');
            if (!hasExplicitFontSize && fallbackFontSize) {
                const fsPx = typeof fallbackFontSize === 'number' ? fallbackFontSize + 'px' : (fallbackFontSize.endsWith('px') ? fallbackFontSize : fallbackFontSize + 'px');
                const doc = parser.parseFromString(clean, 'text/html');
                const blocks = doc.body.querySelectorAll('p, div');
                if (blocks.length > 0) {
                    blocks.forEach(b => {
                        if (b.innerHTML.trim() && !b.querySelector('[style*="font-size"]')) {
                            b.innerHTML = `<span style="font-size: ${fsPx};">${b.innerHTML}</span>`;
                        }
                    });
                    clean = doc.body.innerHTML;
                } else {
                    clean = `<p><span style="font-size: ${fsPx};">${doc.body.innerHTML}</span></p>`;
                }
            }
            return clean;
        }
        window.normalizeHtmlForQuill = normalizeHtmlForQuill;

        // Load content to Quill
        if (compStyles && !compStyles.isMultiSameType && (state.editingType === 'pin' || state.editingType === 'shape') && window.quillEditor) {
            const fallbackFs = compStyles.currentStyles && compStyles.currentStyles.fontSize;
            const fallbackColor = compStyles.currentStyles && compStyles.currentStyles.text;
            const cleanHtml = normalizeHtmlForQuill(compStyles.html, fallbackFs);

            // Cancel any pending debounced paste timer to avoid collision between rapid selections
            if (window._shapeQuillTimer) {
                clearTimeout(window._shapeQuillTimer);
                window._shapeQuillTimer = null;
            }

            // 초기 로드 중에는 text-change 역류를 방지하는 가드 설정
            state._isLoadingShapeContent = true;
            const wasQuillFocused = document.activeElement === window.quillEditor.root;

            window._shapeQuillTimer = setTimeout(() => {
                window._shapeQuillTimer = null;
                window.quillEditor.clipboard.dangerouslyPasteHTML(cleanHtml, 'silent');

                // Sticky Format 동기화 (오브젝트 고유 기본 스타일 캐싱)
                if (!window._currentStickyFormat) window._currentStickyFormat = {};
                if (fallbackFs) {
                    const fsPx = typeof fallbackFs === 'number' ? fallbackFs + 'px' : (fallbackFs.endsWith('px') ? fallbackFs : fallbackFs + 'px');
                    window._currentStickyFormat.size = fsPx;
                }
                if (fallbackColor) {
                    window._currentStickyFormat.color = fallbackColor;
                }
                const curAlign = (compStyles.currentStyles && compStyles.currentStyles.textAlign) || compStyles.textAlign || 'left';
                if (window.quillEditor && window.quillEditor.root) {
                    window.quillEditor.root.style.textAlign = curAlign;
                }
                const curFmt = window.quillEditor.getFormat();
                if (curFmt && Object.keys(curFmt).length > 0) {
                    window._currentStickyFormat = { ...window._currentStickyFormat, ...curFmt };
                }

                if (wasQuillFocused) {
                    window.quillEditor.setSelection(0, 0);
                } else {
                    window.quillEditor.blur();
                    window.quillEditor.setSelection(null);
                    const iframe = document.getElementById('main-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.focus();
                    }
                }

                // 다음 틱에 가드 해제 (text-change 이벤트 차단 완료 후 복구)
                requestAnimationFrame(() => {
                    state._isLoadingShapeContent = false;
                });
            }, 30);
        }

        // Dynamically move active panels into target inspector body (Docked or Floating)
        const targetBody = isDocked 
            ? document.getElementById('sidebar-inspector-body') 
            : document.getElementById('floating-inspector-body');

        if (targetBody) {
            const selectionBar = document.getElementById('selection-actions-bar');
            if (selectionBar) {
                if (selectionBar.parentElement !== targetBody) {
                    targetBody.insertBefore(selectionBar, targetBody.firstChild);
                }
                selectionBar.style.setProperty('display', 'flex', 'important');
            }
            const sections = [
                DOM.shapePropSection, DOM.textPropSection, DOM.tablePropSection,
                DOM.linePropSection, DOM.iconPropSection, DOM.checkboxRadioPropSection,
                DOM.textboxTextareaPropSection, DOM.searchbarPropSection, DOM.stepperPropSection, DOM.selectboxPropSection,
                DOM.fileuploadPropSection, DOM.alertPropSection, DOM.buttonPropSection,
                DOM.datePickerPropSection, DOM.togglePropSection, DOM.accordionPropSection, DOM.gridPropSection,
                DOM.adminSettingsPropSection, DOM.tabPropSection
            ];
            sections.forEach(sec => {
                if (sec && sec.style.display === 'block') {
                    if (sec instanceof Node) {
                        targetBody.appendChild(sec);
                    } else {
                        console.warn("[VCTRL INSPECTOR] Skipped appendChild: sec is not a valid DOM Node", sec);
                    }
                }
            });
            if (typeof _syncAtomDisabledProps === 'function' && state.selectedComponent) {
                _syncAtomDisabledProps(state.selectedComponent);
            }
        }
    } else {
        window.restorePropertiesSections();
        if (typeof window.setSidebarInspectorVisible === 'function') {
            window.setSidebarInspectorVisible(false);
        }
        const floatingInspector = document.getElementById('floating-inspector-card');
        if (floatingInspector) {
            floatingInspector.style.setProperty('display', 'none', 'important');
            floatingInspector.style.right = '24px';
            floatingInspector.style.left = 'auto';
            floatingInspector.style.bottom = '24px';
            floatingInspector.style.top = 'auto';
        }
        state.isEditing = false;
        state.editingIndex = -1;
        if (DOM.selectionBar) DOM.selectionBar.style.display = 'none';
        const groupDimBar = document.getElementById('group-dimension-bar');
        if (groupDimBar) groupDimBar.style.setProperty('display', 'none', 'important');
    }
};

function _syncStepperProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncStepper === 'function') {
        window.InspectorAtoms.syncStepper(comp);
    }
}

function _syncAtomDisabledProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncDisabled === 'function') {
        window.InspectorAtoms.syncDisabled(comp);
    }
}

function _syncSelectboxProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncSelectbox === 'function') {
        window.InspectorAtoms.syncSelectbox(comp);
    }
}

function _syncFileuploadProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncFileupload === 'function') {
        window.InspectorAtoms.syncFileupload(comp);
    }
}

function _syncAlertProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncAlert === 'function') {
        window.InspectorAtoms.syncAlert(comp);
    }
}

function _syncButtonProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncButton === 'function') {
        window.InspectorAtoms.syncButton(comp);
    }
}

function _syncTextboxTextareaProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncTextboxTextarea === 'function') {
        window.InspectorAtoms.syncTextboxTextarea(comp);
    }
}

function _syncSearchBarProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncSearchBar === 'function') {
        window.InspectorAtoms.syncSearchBar(comp);
    }
}

function _syncAccordionProps(comp) {
    if (window.InspectorAccordion && typeof window.InspectorAccordion.sync === 'function') {
        window.InspectorAccordion.sync(comp);
        _syncAtomDisabledProps(comp);
        return;
    }
}


function _syncGridProps(comp) {
    if (window.InspectorGrid && typeof window.InspectorGrid.sync === 'function') {
        window.InspectorGrid.sync(comp);
        return;
    }
    const rowCountInp = document.getElementById('prop-grid-row-count');
    if (rowCountInp && comp.gridRowCount !== undefined) rowCountInp.value = comp.gridRowCount;
    const rowHeightInp = document.getElementById('prop-grid-row-height');
    if (rowHeightInp && comp.gridRowHeight !== undefined) rowHeightInp.value = comp.gridRowHeight;
}

function _syncCheckboxRadioProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncCheckboxRadio === 'function') {
        window.InspectorAtoms.syncCheckboxRadio(comp);
    }
}

function _syncDatePickerProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncDatePicker === 'function') {
        window.InspectorAtoms.syncDatePicker(comp);
    }
}

function getCategoryData(type) {
    const categories = {
        'cover': { label: 'COVER', code: 'CO', class: 'badge-cover' },
        'architecture': { label: 'ARCH', code: 'AR', class: 'badge-architecture' },
        'plan': { label: 'PLAN', code: 'PL', class: 'badge-plan' },
        'plan-delivery': { label: 'PLAN', code: 'PL', class: 'badge-plan' },
        'case-study': { label: 'CASE', code: 'CS', class: 'badge-case-study' },
        'case_study': { label: 'CASE', code: 'CS', class: 'badge-case-study' },
        'ui': { label: 'UI', code: 'UI', class: 'badge-ui' },
        'responsive-ui': { label: 'PC+MO', code: 'PC', class: 'badge-responsive-ui' },
        'mobile-ui': { label: 'MOBILE', code: 'MO', class: 'badge-mobile-ui' },
        'admin': { label: 'ADMIN', code: 'AD', class: 'badge-admin' },
        'admin-nbos': { label: 'ADMIN', code: 'AD', class: 'badge-admin' },
        'admin-onesphere': { label: 'ADMIN', code: 'AD', class: 'badge-admin' }
    };
    return categories[type] || { label: 'ETC', code: (type || 'ET').slice(0, 2).toUpperCase(), class: 'badge-default' };
}

let flyoutHideTimer = null;
let currentFlyoutScreen = null;

// Screen list and flyout delegated to vctrl_screen_manager.js

// --- 4. Library & Editor (Delegated to vctrl_component_library.js) ---
// Global Color Palette delegated to vctrl_color_picker.js

    /**
     * Helper: CONTENT EDITOR(Quill)에서 작성된 텍스트의 연속 공백 및 선행 공백을 HTML 엔티티(&nbsp;)로 정밀 보존
     * - HTML 태그 및 속성(style, class 등)은 절대 건드리지 않고, 순수 TextNode만 안전하게 변환
     * - 단일 공백은 일반 공백(' ')으로 유지하여 브라우저의 단어 자동 줄바꿈(Word Wrap)을 온전히 보존
     * - 선행 공백 및 2개 이상 연속된 공백은 '\u00A0' (NBSP)로 변환하여 브라우저의 공백 축약(Collapsing) 방지
     */
    function preserveConsecutiveSpaces(html) {
        if (!html || typeof html !== 'string') return html;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                let val = node.nodeValue;
                if (!val) continue;

                // 1) 텍스트 노드 시작 부분의 공백(선행 들여쓰기 공백) 보존
                val = val.replace(/^ +/g, match => '\u00A0'.repeat(match.length));

                // 2) 텍스트 노드 중간의 2개 이상 연속 공백 보존 (첫 공백은 일반 스페이스로 남겨 워드랩 보장)
                val = val.replace(/ {2,}/g, match => ' ' + '\u00A0'.repeat(match.length - 1));

                node.nodeValue = val;
            }
            return doc.body.innerHTML;
        } catch (e) {
            console.error('[preserveConsecutiveSpaces] Error:', e);
            return html;
        }
    }
    window.preserveConsecutiveSpaces = preserveConsecutiveSpaces;

window.initQuillEditor = function() {
    if (typeof window.initV4GlobalColorPalette === 'function') {
        window.initV4GlobalColorPalette();
    }
    if (window.quillEditor) return;
    const container = document.getElementById('editor-container');
    if (!container) return;

    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['8px', '9px', '10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px', '22px', '24px', '28px', '30px', '36px', '48px', '64px'];
    Quill.register(Size, true);
    const Align = Quill.import('attributors/style/align');
    Quill.register(Align, true);

    // Sticky Format Cache: 텍스트 삭제 후에도 직전 타이포그래피 서식 기억
    if (!window._currentStickyFormat) {
        window._currentStickyFormat = {
            size: '14px',
            color: '#000000'
        };
    }

    // Register distinct intuitive icons for Text Color and Background Color
    const icons = Quill.import('ui/icons');
    if (icons) {
        icons['color'] = '<svg viewBox="0 0 18 18">' +
            '<path class="ql-stroke" d="M5,12.5 L9,3.5 L13,12.5"></path>' +
            '<path class="ql-stroke" d="M6.5,9 L11.5,9"></path>' +
            '<line class="ql-stroke ql-color-label" x1="2.5" y1="15.5" x2="15.5" y2="15.5" stroke-width="2.5"></line>' +
        '</svg>';
        
        icons['background'] = '<svg viewBox="0 0 18 18">' +
            '<path class="ql-stroke" d="M12.5,3 L15,5.5 L7.5,13 L4,13 L4,9.5 L11.5,2 L12.5,3 Z"></path>' +
            '<path class="ql-fill" d="M4,9.5 L7.5,13 L4,13 Z"></path>' +
            '<line class="ql-stroke ql-bg-label" x1="2.5" y1="15.5" x2="15.5" y2="15.5" stroke-width="2.5"></line>' +
        '</svg>';

        icons['strike'] = '<svg viewBox="0 0 18 18">' +
            '<line class="ql-stroke" x1="2" y1="9" x2="16" y2="9" stroke-width="1.8"></line>' +
            '<path class="ql-stroke" d="M6,4.5 C6.5,3.2 8,2.5 9.5,2.5 C12,2.5 13.5,3.8 13.5,5.5 C13.5,6.8 12.5,7.8 11,8.3" stroke-width="1.6" fill="none"></path>' +
            '<path class="ql-stroke" d="M7,9.7 C5.5,10.2 4.5,11.2 4.5,12.5 C4.5,14.2 6,15.5 8.5,15.5 C11,15.5 12.5,14.5 13,13.2" stroke-width="1.6" fill="none"></path>' +
        '</svg>';
    }

    const colorPalette = window.V4_COMMON_COLOR_PALETTE || [];

    window.quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
            toolbar: [
                [{ 'size': Size.whitelist }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': colorPalette }, { 'background': colorPalette }],
                ['clean']
            ]
        }
    });

    // setupCustomColorPicker delegated to vctrl_color_picker.js
    function setupCustomColorPicker(pickerEl, formatType) {
        if (typeof window.setupCustomColorPicker === 'function') {
            window.setupCustomColorPicker(pickerEl, formatType);
        }
    }

    setTimeout(() => {
        const toolbarEl = container.previousElementSibling || document.querySelector('.ql-toolbar');
        if (toolbarEl) {
            const btnSize = toolbarEl.querySelector('.ql-size .ql-picker-label');
            if (btnSize) btnSize.setAttribute('title', '글자 크기 (Font Size)');

            const colorPicker = toolbarEl.querySelector('.ql-color');
            if (colorPicker) {
                const btnColor = colorPicker.querySelector('.ql-picker-label');
                if (btnColor) btnColor.setAttribute('title', '글자 색상 (Text Color)');
                setupCustomColorPicker(colorPicker, 'color');
            }

            const bgPicker = toolbarEl.querySelector('.ql-background');
            if (bgPicker) {
                const btnBg = bgPicker.querySelector('.ql-picker-label');
                if (btnBg) btnBg.setAttribute('title', '배경 색상 / 형광펜 (Background Color)');
                setupCustomColorPicker(bgPicker, 'background');
            }

            const btnBold = toolbarEl.querySelector('.ql-bold');
            if (btnBold) btnBold.setAttribute('title', '굵게 (Bold)');

            const btnItalic = toolbarEl.querySelector('.ql-italic');
            if (btnItalic) btnItalic.setAttribute('title', '기울임 (Italic)');

            const btnUnderline = toolbarEl.querySelector('.ql-underline');
            if (btnUnderline) btnUnderline.setAttribute('title', '밑줄 (Underline)');

            const btnStrike = toolbarEl.querySelector('.ql-strike');
            if (btnStrike) btnStrike.setAttribute('title', '취소선 (Strikethrough)');

            const btnClean = toolbarEl.querySelector('.ql-clean');
            if (btnClean) btnClean.setAttribute('title', '서식 지우기 (Clear Formatting)');
        }
    }, 0);

    // Selection change: 빈 에디터 진입 시 Sticky Format 유지 및 커서 서식 갱신
    window.quillEditor.on('selection-change', (range) => {
        if (!range || state._isLoadingShapeContent) return;
        const plainText = window.quillEditor.getText().replace(/\n/g, '').trim();
        if (plainText.length === 0 && window._currentStickyFormat) {
            Object.keys(window._currentStickyFormat).forEach(key => {
                const val = window._currentStickyFormat[key];
                if (val !== undefined && val !== false && val !== null) {
                    window.quillEditor.format(key, val, 'silent');
                }
            });
        } else if (plainText.length > 0) {
            const curFormat = window.quillEditor.getFormat(range);
            if (curFormat && Object.keys(curFormat).length > 0) {
                window._currentStickyFormat = { ...window._currentStickyFormat, ...curFormat };
            }
        }
    });

    window.quillEditor.on('text-change', () => {
        if (!state.isEditing || state.editingIndex === -1 || state._isLoadingShapeContent) return;
        
        // Sticky Format 유지 관리
        const plainText = window.quillEditor.getText().replace(/\n/g, '').trim();
        if (plainText.length > 0) {
            const curFormat = window.quillEditor.getFormat();
            if (curFormat && Object.keys(curFormat).length > 0) {
                window._currentStickyFormat = { ...window._currentStickyFormat, ...curFormat };
            }
        } else {
            // 텍스트를 모두 지운 경우: 마지막 서식이 소멸하지 않도록 에디터 커서에 지속 서식 재적용
            if (window._currentStickyFormat) {
                requestAnimationFrame(() => {
                    if (window.quillEditor && window.quillEditor.getText().replace(/\n/g, '').trim().length === 0) {
                        Object.keys(window._currentStickyFormat).forEach(key => {
                            const val = window._currentStickyFormat[key];
                            if (val !== undefined && val !== false && val !== null) {
                                window.quillEditor.format(key, val, 'silent');
                            }
                        });
                    }
                });
            }
        }

        const rawHtml = window.quillEditor.root.innerHTML;
        const html = preserveConsecutiveSpaces(rawHtml);
        const activeAlign = (window.state && window.state.selectedComponentStyles && window.state.selectedComponentStyles.currentStyles && window.state.selectedComponentStyles.currentStyles.textAlign) || 
                            (window.quillEditor && window.quillEditor.root && window.quillEditor.root.style.textAlign) || '';
        const activeVAlign = (window.state && window.state.selectedComponentStyles && window.state.selectedComponentStyles.currentStyles && (window.state.selectedComponentStyles.currentStyles.vAlign || window.state.selectedComponentStyles.currentStyles.justifyContent)) || '';
        if (state.editingType === 'pin') {
            // Update description array (legacy compat)
            const list = state.activeFile?.meta?.description;
            if (list && list[state.editingIndex]) {
                list[state.editingIndex].html = html;
                list[state.editingIndex].text = window.quillEditor.getText().trim();
            }
            // Also sync to iframe DOM directly
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                const compId = state.editingIndex;
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                    id: compId,
                    html: html,
                    align: activeAlign,
                    vAlign: activeVAlign
                });
            }
            markAsDirty();
        } else if (state.editingType === 'shape') {
            // Shape 텍스트 업데이트: 선택된 shape 내부 innerHTML 교체
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_SHAPE_TEXT', { 
                    html: html,
                    align: activeAlign,
                    vAlign: activeVAlign
                });
                markAsDirty();
            }
        } else {
            const iframe = document.getElementById('main-iframe');
            if (iframe && iframe.contentWindow) {
                MessageHub.send(iframe.contentWindow, 'LF_UPDATE_PIN_CONTENT', { 
                    id: state.editingIndex,
                    html: html,
                    align: activeAlign,
                    vAlign: activeVAlign
                });
                markAsDirty();
            }
        }
    });
};

// Subscribe to direct iframe text changes to sync Quill editor in real-time
if (window.MessageHub) {
    MessageHub.subscribe('LF_PIN_TEXT_CHANGED', (data) => {
        if (!window.quillEditor || !data) return;
        
        const isMatch = (state.editingIndex === data.id) ||
                        (state.editingIndex === data.compId) ||
                        (state.selectedIds && (state.selectedIds.includes(data.id) || state.selectedIds.includes(data.compId)));

        if (isMatch) {
            // Prevent feedback loop: tell the Quill change listener that we are programmatically updating the text
            state._isLoadingShapeContent = true;
            
            const rawHtml = data.html || '';
            const fallbackFs = state.selectedComponent?.currentStyles?.fontSize;
            let cleanHtml = (typeof window.normalizeHtmlForQuill === 'function')
                ? window.normalizeHtmlForQuill(rawHtml, fallbackFs)
                : rawHtml;
            
            // Sync to description list metadata if it's a description pin
            if (state.editingType === 'pin' && typeof state.editingIndex === 'number') {
                const list = state.activeFile?.meta?.description;
                if (list && list[state.editingIndex]) {
                    list[state.editingIndex].html = cleanHtml;
                    const tmp = document.createElement('div');
                    tmp.innerHTML = cleanHtml;
                    list[state.editingIndex].text = tmp.innerText.trim();
                }
            }

            const wasQuillFocused = document.activeElement === window.quillEditor.root;
            
            window.quillEditor.clipboard.dangerouslyPasteHTML(cleanHtml, 'silent');
            
            // Sticky Format 갱신
            if (fallbackFs) {
                const fsPx = typeof fallbackFs === 'number' ? fallbackFs + 'px' : (fallbackFs.endsWith('px') ? fallbackFs : fallbackFs + 'px');
                window._currentStickyFormat = { ...window._currentStickyFormat, size: fsPx };
            }
            const curFmt = window.quillEditor.getFormat();
            if (curFmt && Object.keys(curFmt).length > 0) {
                window._currentStickyFormat = { ...window._currentStickyFormat, ...curFmt };
            }

            if (wasQuillFocused) {
                window.quillEditor.setSelection(0, 0);
            }
            
            setTimeout(() => {
                state._isLoadingShapeContent = false;
            }, 100);
        }
    });
}

// Screen edit and copy handlers delegated to vctrl_screen_manager.js

// --- 5. Init Events & Listeners ---
if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => window.toggleSidebar('left');
if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => window.toggleSidebar('right');
document.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => window.switchSidebarTab(btn.dataset.tab));
if (DOM.btnAddDescription) {
    DOM.btnAddDescription.onclick = () => {
        if (typeof window.handleTextCreation === 'function') window.handleTextCreation();
    };
}
if (DOM.btnCancelEdit) {
    DOM.btnCancelEdit.onclick = () => {
        const modal = document.getElementById('edit-screen-modal') || DOM.editScreenModal;
        if (modal) modal.classList.remove('active');
    };
}

// Floating & Sidebar Inspector Card Controls
const btnFloatingMinimize = document.getElementById('btn-floating-minimize');
const btnFloatingSwap = document.getElementById('btn-floating-swap');
const btnFloatingDock = document.getElementById('btn-floating-dock');
const btnFloatingClose = document.getElementById('btn-floating-close');
const btnSidebarPopout = document.getElementById('btn-sidebar-popout');
const btnSidebarCloseProps = document.getElementById('btn-sidebar-close-props');
const floatingInspectorCard = document.getElementById('floating-inspector-card');

if (floatingInspectorCard) {
    // Isolate wheel scrolling on object properties panel to prevent canvas dragging/panning
    floatingInspectorCard.addEventListener('wheel', (e) => {
        e.stopPropagation();
    }, { passive: true });

    if (btnFloatingMinimize) {
        btnFloatingMinimize.onclick = (e) => {
            e.stopPropagation();
            const isMin = floatingInspectorCard.classList.toggle('minimized');
            const icon = btnFloatingMinimize.querySelector('.material-icons-outlined');
            if (icon) {
                icon.innerText = isMin ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
            }
            btnFloatingMinimize.title = isMin ? '펼치기' : '최소화';
        };
    }

    if (btnFloatingSwap) {
        btnFloatingSwap.onclick = (e) => {
            e.stopPropagation();
            const currentSide = state.floatingSide || 'right';
            const nextSide = (currentSide === 'right') ? 'left' : 'right';
            state.floatingSide = nextSide;
            try { localStorage.setItem('lf_inspector_floating_side', nextSide); } catch (_) {}
            if (nextSide === 'left') {
                floatingInspectorCard.style.left = '24px';
                floatingInspectorCard.style.right = 'auto';
            } else {
                floatingInspectorCard.style.right = '24px';
                floatingInspectorCard.style.left = 'auto';
            }
        };
    }

    if (btnFloatingDock) {
        btnFloatingDock.onclick = (e) => {
            e.stopPropagation();
            state.inspectorMode = 'docked';
            try { localStorage.setItem('lf_inspector_mode', 'docked'); } catch (_) {}
            window.restorePropertiesSections();
            floatingInspectorCard.style.setProperty('display', 'none', 'important');
            if (typeof window.updateProperties === 'function') {
                window.updateProperties(state.selectedComponentStyles || null);
            }
        };
    }
}

if (btnSidebarPopout) {
    btnSidebarPopout.onclick = (e) => {
        e.stopPropagation();
        state.inspectorMode = 'floating';
        try { localStorage.setItem('lf_inspector_mode', 'floating'); } catch (_) {}
        window.restorePropertiesSections();
        if (typeof window.setSidebarInspectorVisible === 'function') {
            window.setSidebarInspectorVisible(false);
        }
        if (typeof window.updateProperties === 'function') {
            window.updateProperties(state.selectedComponentStyles || null);
        }
    };
}

// Central Single Source of Truth for Deselection (Object & Inspector)
window.deselectAll = function() {
    if (typeof window.closeV4ColorPalette === 'function') {
        window.closeV4ColorPalette();
    }
    // 1. Restore dynamically mounted properties sections to storage container
    if (typeof window.restorePropertiesSections === 'function') {
        window.restorePropertiesSections();
    }
    // 2. Hide sidebar inspector header & return to Library tab
    if (typeof window.setSidebarInspectorVisible === 'function') {
        window.setSidebarInspectorVisible(false);
    }
    if (typeof window.switchSidebarTab === 'function') {
        window.switchSidebarTab('editor');
    }
    // 3. Hide floating inspector card if displayed
    const floatingCard = document.getElementById('floating-inspector-card');
    if (floatingCard) {
        floatingCard.style.setProperty('display', 'none', 'important');
    }
    // 4. Clear grouping manager selection
    if (window.GroupingManager) {
        if (typeof window.GroupingManager.setSelectedIds === 'function') {
            window.GroupingManager.setSelectedIds([]);
        }
        if (typeof window.GroupingManager.updateSelectionUI === 'function') {
            try { window.GroupingManager.updateSelectionUI(); } catch (_) {}
        }
    }
    // 5. Clear connectors selection
    if (window.ConnectorEngine && typeof window.ConnectorEngine.clearSelection === 'function') {
        try { window.ConnectorEngine.clearSelection(); } catch (_) {}
    }
    // 6. Clear global state
    if (window.state) {
        window.state.selectedIds = [];
        window.state.isEditing = false;
        window.state.editingIndex = -1;
        window.state.selectedComponent = null;
        window.state.selectedComponentStyles = null;
    }
    // 7. Update properties panel to empty/null
    if (typeof window.updateProperties === 'function') {
        window.updateProperties(null);
    }
    // 8. Clear SmartGuides
    if (window.SmartGuide && typeof window.SmartGuide.clearGuides === 'function') {
        window.SmartGuide.clearGuides(true);
    }
    // 9. Dispatch LF_DESELECT to parent MessageHub subscribers
    if (window.MessageHub) {
        window.MessageHub.send(window, 'LF_DESELECT');
    }
    // 10. Notify iframe to clear canvas selection and handles
    const iframe = document.getElementById('main-iframe') || (window.DOM && window.DOM.iframe);
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'LF_DESELECT' }, '*');
    }
};

if (btnSidebarCloseProps) {
    btnSidebarCloseProps.onclick = (e) => {
        e.stopPropagation();
        window.deselectAll();
    };
}

if (btnFloatingClose) {
    btnFloatingClose.onclick = (e) => {
        e.stopPropagation();
        window.deselectAll();
    };
}

// History popup and handlers delegated to vctrl_screen_manager.js

// Global function to sync Arrow/Triangle Direction Buttons UI
window._syncArrowDirBtns = (currentDir) => {
    const targetDir = currentDir || 'right';
    document.querySelectorAll('.v4-arrow-dir-btn').forEach(b => {
        const btnDir = b.dataset.dir;
        if (btnDir === targetDir) {
            b.classList.add('active');
            b.style.cssText = 'height: 28px; background: rgba(0,229,255,0.15); border: 1.6px solid rgba(0,229,255,0.4); border-radius: 6px; color: #00e5ff; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
        } else {
            b.classList.remove('active');
            b.style.cssText = 'height: 28px; background: rgba(255, 255, 255, 0.05); border: 1.6px solid rgba(255, 255, 255, 0.15); border-radius: 6px; color: #94a3b8; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
        }
    });
};

// Global function to sync Line (Straight) Editor UI (Delegated to vctrl_connectors.js)
if (typeof window._syncLineEditorProps !== 'function') {
    window._syncLineEditorProps = (compStyles) => {
        // Delegated to vctrl_connectors.js once loaded
    };
}

window.showLoading = (text) => { const overlay = get('loading-overlay'); if (overlay) { const txt = overlay.querySelector('.loading-text'); if (txt) txt.innerText = text; overlay.classList.remove('fade-out'); } };
window.hideLoading = () => { const overlay = get('loading-overlay'); if (overlay) overlay.classList.add('fade-out'); setTimeout(() => { if (typeof window.centerView === 'function') window.centerView(); }, 600); };
window.showAuthModal = () => { const modal = get('auth-modal'); if (modal) modal.classList.add('active'); };
window.hideAuthModal = () => { const modal = get('auth-modal'); if (modal) modal.classList.remove('active'); };

// --- 6. Search Event Handling ---
window.editorSearchQuery = '';
(function initSidebarSearch() {
    const searchInput = document.getElementById('sidebar-search-input');
    const searchClear = document.getElementById('sidebar-search-clear');
    if (searchInput) {
        searchInput.oninput = () => {
            const val = searchInput.value;
            window.editorSearchQuery = val;
            if (searchClear) {
                searchClear.style.setProperty('display', val ? 'block' : 'none', 'important');
            }
            window.renderAtomicLibrary();
        };
    }
    if (searchClear) {
        searchClear.onclick = () => {
            if (searchInput) {
                searchInput.value = '';
                window.editorSearchQuery = '';
                searchClear.style.setProperty('display', 'none', 'important');
                searchInput.focus();
                window.renderAtomicLibrary();
            }
        };
    }
})();
if (window.MessageHub) {
    MessageHub.subscribe('LF_DESELECT', () => {
        if (window.state) {
            window.state.selectedIds = [];
        }
        window.updateProperties(null);
    });
}

function _syncAdminSettingsProps(comp, forceRebuild = false) {
    if (typeof window._syncAdminSettingsProps === 'function') {
        window._syncAdminSettingsProps(comp, forceRebuild);
    }
}

function _syncToggleProps(comp) {
    if (window.InspectorAtoms && typeof window.InspectorAtoms.syncToggle === 'function') {
        window.InspectorAtoms.syncToggle(comp);
    }
}

// Auto-initialize global color palette popover
if (typeof window.initV4GlobalColorPalette === 'function') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initV4GlobalColorPalette);
    } else {
        window.initV4GlobalColorPalette();
    }
}

console.log("[VCTRL INSPECTOR] UI Controller fully loaded and cleaned.");
