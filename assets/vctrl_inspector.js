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
    DOM.illustrationPropSection = get('illustration-inspector-section');
    DOM.iconPropSection = get('icon-inspector-section');
    DOM.checkboxRadioPropSection = get('checkbox-radio-inspector-section');
    DOM.textboxTextareaPropSection = get('textbox-textarea-inspector-section');
    DOM.searchbarPropSection = get('searchbar-inspector-section');
    DOM.stepperPropSection = get('stepper-inspector-section');
    DOM.selectboxPropSection = get('selectbox-inspector-section');
    DOM.fileuploadPropSection = get('fileupload-inspector-section');
    DOM.alertPropSection = get('alert-inspector-section');
    DOM.popupPropSection = get('popup-inspector-section');
    DOM.buttonPropSection = get('button-inspector-section');
    DOM.datepickerPropSection = get('datepicker-inspector-section');
    DOM.datePickerPropSection = get('datepicker-inspector-section');
    DOM.togglePropSection = get('toggle-inspector-section');
    DOM.accordionPropSection = get('accordion-inspector-section');
    DOM.gridPropSection = get('grid-inspector-section');
    DOM.adminSettingsPropSection = get('admin-settings-inspector-section');
    DOM.tabPropSection = get('tab-inspector-section');
    DOM.cursorPropSection = get('cursor-inspector-section');
    DOM.webeditorPropSection = get('webeditor-inspector-section');

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
    DOM.btnCopyFormat = get('btn-copy-format-action');
    DOM.btnPasteFormat = get('btn-paste-format-action');
    DOM.selectionScrollPinBar = get('selection-scroll-pin-bar');
    DOM.scrollPinStatusBadge = get('scroll-pin-status-badge');
    DOM.btnScrollPinNone = get('btn-scroll-pin-none');
    DOM.btnScrollPinTop = get('btn-scroll-pin-top');
    DOM.btnScrollPinBottom = get('btn-scroll-pin-bottom');
    DOM.btnScrollPinCustom = get('btn-scroll-pin-custom');
    DOM.btnScrollPinSticky = get('btn-scroll-pin-sticky');
    DOM.btnScrollPinStickyBottom = get('btn-scroll-pin-sticky-bottom');
    DOM.btnPinPosContent = get('btn-pin-pos-content');
    DOM.btnPinPosFixed = get('btn-pin-pos-fixed');
    DOM.scrollPinOffsetInput = get('scroll-pin-offset-input');

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
        DOM.linePropSection, DOM.illustrationPropSection, DOM.iconPropSection, DOM.checkboxRadioPropSection,
        DOM.textboxTextareaPropSection, DOM.searchbarPropSection, DOM.stepperPropSection, DOM.selectboxPropSection,
        DOM.fileuploadPropSection, DOM.alertPropSection, (DOM.popupPropSection || document.getElementById('popup-inspector-section')), DOM.buttonPropSection,
        DOM.datePickerPropSection, DOM.togglePropSection, DOM.accordionPropSection, DOM.gridPropSection,
        DOM.adminSettingsPropSection, DOM.tabPropSection, DOM.cursorPropSection,
        ((DOM.webeditorPropSection instanceof Node) ? DOM.webeditorPropSection : document.getElementById('webeditor-inspector-section'))
    ];

    sections.forEach(sec => {
        const actualSec = (sec instanceof Node) ? sec : (sec && sec.id ? document.getElementById(sec.id) : null);
        if (actualSec && actualSec instanceof Node) {
            if (!force && activeEl && actualSec.contains(activeEl)) {
                return;
            }
            actualSec.style.display = 'none';
            storage.appendChild(actualSec);
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
    illustrationPropSection: get('illustration-inspector-section'),
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
    cursorPropSection: get('cursor-inspector-section'),
    webeditorPropSection: get('webeditor-inspector-section'),
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
    btnCopyFormat: get('btn-copy-format-action'),
    btnPasteFormat: get('btn-paste-format-action'),
    selectionScrollPinBar: get('selection-scroll-pin-bar'),
    scrollPinStatusBadge: get('scroll-pin-status-badge'),
    btnScrollPinNone: get('btn-scroll-pin-none'),
    btnScrollPinTop: get('btn-scroll-pin-top'),
    btnScrollPinBottom: get('btn-scroll-pin-bottom'),
    btnScrollPinCustom: get('btn-scroll-pin-custom'),
    btnScrollPinSticky: get('btn-scroll-pin-sticky'),
    btnScrollPinStickyBottom: get('btn-scroll-pin-sticky-bottom'),
    btnPinPosContent: get('btn-pin-pos-content'),
    btnPinPosFixed: get('btn-pin-pos-fixed'),
    scrollPinOffsetInput: get('scroll-pin-offset-input'),
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
    
    // If state is already matching forceOpen, exit early to avoid redundant centerView calls
    if (forceOpen !== null && (!isCollapsed) === shouldOpen) {
        return;
    }
    
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

// --- 3. UI Rendering & Inspector Dispatcher Sub-modules ---

// 3.1 Project Metadata UI Manager (SSOT)
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

// 3.2 Update Top Metadata Bar & Footer
function _syncTopMetadataBar(pm) {
    if (!DOM.metadataPanel) return;
    if (!DOM.metadataPanel.innerHTML.includes('v4-meta-horizontal')) {
        ProjectMetadataManager.renderBar(pm);
    } else {
        ProjectMetadataManager.updateFields(pm);
    }
    const updatedTxt = document.getElementById('meta-updated-txt');
    if (updatedTxt) {
        updatedTxt.innerText = pm.updated ? `최종 업데이트: ${pm.updated}` : '최종 업데이트: -';
    }
}

// 3.3 Apply Inspector Docked / Floating Mode
function _applyInspectorDockMode() {
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
    return isDocked;
}

// 3.4 Hide all property sections prior to activating matching panel
function _hideAllPropertySections(isTypingInAdminProps) {
    const arrowGroupInit = document.getElementById('shape-arrow-direction-group');
    if (arrowGroupInit) arrowGroupInit.style.display = 'none';
    const waveGroupInit = document.getElementById('shape-wave-direction-group');
    if (waveGroupInit) waveGroupInit.style.display = 'none';
    const paddingGroupInit = document.getElementById('shape-padding-group');
    if (paddingGroupInit) paddingGroupInit.style.display = 'none';
    if (DOM.textPropSection) DOM.textPropSection.style.display = 'none';
    if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'none';
    if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'none';
    if (DOM.linePropSection) DOM.linePropSection.style.display = 'none';
    if (DOM.illustrationPropSection) DOM.illustrationPropSection.style.display = 'none';
    if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'none';
    if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'none';
    if (DOM.textboxTextareaPropSection) DOM.textboxTextareaPropSection.style.display = 'none';
    if (DOM.searchbarPropSection) DOM.searchbarPropSection.style.display = 'none';
    if (DOM.stepperPropSection) DOM.stepperPropSection.style.display = 'none';
    if (DOM.selectboxPropSection) DOM.selectboxPropSection.style.display = 'none';
    if (DOM.fileuploadPropSection) DOM.fileuploadPropSection.style.display = 'none';
    if (DOM.alertPropSection) DOM.alertPropSection.style.display = 'none';
    const popupSecHide = DOM.popupPropSection || document.getElementById('popup-inspector-section');
    if (popupSecHide) popupSecHide.style.display = 'none';
    if (DOM.buttonPropSection) DOM.buttonPropSection.style.display = 'none';
    if (DOM.datePickerPropSection) DOM.datePickerPropSection.style.display = 'none';
    if (DOM.togglePropSection) DOM.togglePropSection.style.display = 'none';
    if (DOM.cursorPropSection) DOM.cursorPropSection.style.display = 'none';
    const webeditorSecHide = (DOM.webeditorPropSection instanceof Node) ? DOM.webeditorPropSection : document.getElementById('webeditor-inspector-section');
    if (webeditorSecHide) webeditorSecHide.style.display = 'none';
    if (DOM.adminSettingsPropSection && !isTypingInAdminProps) DOM.adminSettingsPropSection.style.display = 'none';
}

// 3.5 Detect Component Editing Type & Properties Synchronization (Delegated to assets/vctrl_inspector_sync.js SSOT)
const _detectComponentType = (compStyles) => (window.InspectorPropertySync?.detectComponentType ? window.InspectorPropertySync.detectComponentType(compStyles) : (window._detectComponentType?.(compStyles) || 'comp'));

const _syncComponentTypeProperties = (compStyles, editingType) => (window.InspectorPropertySync?.syncComponentTypeProperties ? window.InspectorPropertySync.syncComponentTypeProperties(compStyles, editingType) : window._syncComponentTypeProperties?.(compStyles, editingType));

// 3.7 Synchronize Common Controls (Delegated to assets/vctrl_inspector_sync.js SSOT)
const _syncCommonPropertyControls = (compStyles, editingType, isNewComp) => (window.InspectorPropertySync?.syncCommonControls ? window.InspectorPropertySync.syncCommonControls(compStyles, editingType, isNewComp) : window._syncCommonPropertyControls?.(compStyles, editingType, isNewComp));


// 3.8 Synchronize Selection Action Bar & Group Dimension (Delegated to assets/vctrl_inspector_actionbar.js)
function _syncSelectionActionBar(compStyles) {
    if (window.InspectorActionBar && typeof window.InspectorActionBar.sync === 'function') {
        window.InspectorActionBar.sync(compStyles);
        return;
    }
}

// 3.8.1 Scroll Pin (Delegated to assets/inspector/inspector_scroll_pin.js SSOT)
const _setScrollPin = (mode, opt) => (window.InspectorScrollPin ? window.InspectorScrollPin.setScrollPin(mode, opt) : window._setScrollPin?.(mode, opt));
const _updateScrollPinButtonsUI = (mode, isPin, payload) => (window.InspectorScrollPin ? window.InspectorScrollPin.updateButtonsUI(mode, isPin, payload) : window._updateScrollPinButtonsUI?.(mode, isPin, payload));
const _syncScrollPinUI = (compStyles) => (window.InspectorScrollPin ? window.InspectorScrollPin.syncUI(compStyles) : window._syncScrollPinUI?.(compStyles));
const _bindScrollPinEvents = () => (window.InspectorScrollPin ? window.InspectorScrollPin.bindEvents() : window._bindScrollPinEvents?.());


// 3.9 Synchronize Content to Quill Editor
function _syncQuillContent(compStyles, editingType) {
    const editorLabel = document.getElementById('content-editor-label');
    if (editorLabel) {
        editorLabel.innerText = 'CONTENT EDITOR';
    }

    const normalizeHtmlForQuill = (rawHtml, fallbackFontSize) => {
        if (window.InspectorTextFormatter && typeof window.InspectorTextFormatter.normalizeHtmlForQuill === 'function') {
            return window.InspectorTextFormatter.normalizeHtmlForQuill(rawHtml, fallbackFontSize);
        }
        return rawHtml;
    };

    if (compStyles && !compStyles.isMultiSameType && (editingType === 'pin' || editingType === 'shape') && window.quillEditor) {
        const fallbackFs = compStyles.currentStyles && compStyles.currentStyles.fontSize;
        const fallbackColor = compStyles.currentStyles && compStyles.currentStyles.text;
        const cleanHtml = normalizeHtmlForQuill(compStyles.html, fallbackFs);

        if (window._shapeQuillTimer) {
            clearTimeout(window._shapeQuillTimer);
            window._shapeQuillTimer = null;
        }

        state._isLoadingShapeContent = true;
        const wasQuillFocused = document.activeElement === window.quillEditor.root;

        window._shapeQuillTimer = setTimeout(() => {
            window._shapeQuillTimer = null;
            window.quillEditor.clipboard.dangerouslyPasteHTML(cleanHtml, 'silent');

            window._currentStickyFormat = {};
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
            window._currentStickyFormat.align = curAlign;
            const curLh = (compStyles.currentStyles && compStyles.currentStyles.lineHeight) || '1.5';
            window._currentStickyFormat.lineheight = curLh;

            if (window.quillEditor) {
                window.quillEditor.format('align', curAlign === 'left' ? false : curAlign, 'silent');
                if (fallbackColor) {
                    window.quillEditor.format('color', fallbackColor, 'silent');
                }
                if (curLh) {
                    window.quillEditor.format('lineheight', curLh, 'silent');
                }
            }
            const curFmt = window.quillEditor.getFormat();
            if (curFmt && Object.keys(curFmt).length > 0) {
                window._currentStickyFormat = { ...window._currentStickyFormat, ...curFmt };
                if (!curFmt.align) {
                    window._currentStickyFormat.align = curAlign;
                }
                if (!curFmt.lineheight) {
                    window._currentStickyFormat.lineheight = curLh;
                }
            }

            const lhPicker = document.querySelector('.ql-toolbar .ql-lineheight');
            if (lhPicker) {
                if (typeof setupCustomLineHeightPicker === 'function' && !lhPicker._customLhInitialized) {
                    setupCustomLineHeightPicker(lhPicker);
                }
                const targetLh = window._currentStickyFormat.lineheight || curLh || '1.5';
                const lhPickerLabel = lhPicker.querySelector('.ql-picker-label');
                if (lhPickerLabel) lhPickerLabel.setAttribute('data-value', targetLh);
                const lhInput = lhPicker.querySelector('.ql-lineheight-input');
                if (lhInput && document.activeElement !== lhInput) lhInput.value = targetLh;
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

            requestAnimationFrame(() => {
                state._isLoadingShapeContent = false;
            });
        }, 30);
    }
}

// 3.10 Dynamically relocate active panels into Target Body (Docked or Floating)
function _relocatePropertyPanels(isDocked) {
    const targetBody = isDocked 
        ? document.getElementById('sidebar-inspector-body') 
        : document.getElementById('floating-inspector-body');

    if (targetBody) {
        if (window.InspectorActionBar && typeof window.InspectorActionBar.relocate === 'function') {
            window.InspectorActionBar.relocate(targetBody);
        } else {
            const selectionBar = document.getElementById('selection-actions-bar');
            if (selectionBar) {
                if (selectionBar.parentElement !== targetBody) {
                    targetBody.insertBefore(selectionBar, targetBody.firstChild);
                }
                selectionBar.style.setProperty('display', 'flex', 'important');
            }
        }
        const sections = [
            DOM.shapePropSection, DOM.textPropSection, DOM.tablePropSection,
            DOM.linePropSection, DOM.illustrationPropSection, DOM.iconPropSection, DOM.checkboxRadioPropSection,
            DOM.textboxTextareaPropSection, DOM.searchbarPropSection, DOM.stepperPropSection, DOM.selectboxPropSection,
            DOM.fileuploadPropSection, DOM.alertPropSection, (DOM.popupPropSection || document.getElementById('popup-inspector-section')), DOM.buttonPropSection,
            DOM.datePickerPropSection, DOM.togglePropSection, DOM.accordionPropSection, DOM.gridPropSection,
            DOM.adminSettingsPropSection, DOM.tabPropSection,
            DOM.cursorPropSection || document.getElementById('cursor-inspector-section'),
            DOM.webeditorPropSection || document.getElementById('webeditor-inspector-section')
        ];
        sections.forEach(sec => {
            const actualSec = (sec instanceof Node) ? sec : (sec && sec.id ? document.getElementById(sec.id) : null);
            if (actualSec && actualSec instanceof Node && (actualSec.style.display === 'block' || actualSec.style.display === 'flex')) {
                targetBody.appendChild(actualSec);
            }
        });
        if (typeof _syncAtomDisabledProps === 'function' && state.selectedComponent) {
            _syncAtomDisabledProps(state.selectedComponent);
        }
    }
}

// 3.11 Handle No Selection State
function _handleNoSelection() {
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
    if (window.InspectorActionBar && typeof window.InspectorActionBar.hide === 'function') {
        window.InspectorActionBar.hide();
    } else {
        if (DOM.selectionBar) DOM.selectionBar.style.display = 'none';
        const groupDimBar = document.getElementById('group-dimension-bar');
        if (groupDimBar) groupDimBar.style.setProperty('display', 'none', 'important');
        const scrollPinBar = document.getElementById('selection-scroll-pin-bar');
        if (scrollPinBar) scrollPinBar.style.setProperty('display', 'none', 'important');
    }
}

// --- Master Property Coordinator & Dispatcher ---
window.updateProperties = function(compStyles, isNewSelectionExplicit) {
    const activeEl = document.activeElement;
    const isBtn = activeEl && (activeEl.tagName === 'BUTTON' || !!activeEl.closest('button'));
    const isNewComp = (typeof isNewSelectionExplicit === 'boolean')
        ? isNewSelectionExplicit
        : Boolean(compStyles && compStyles.id && (
            (state.previousEditingIndex !== undefined && compStyles.id !== state.previousEditingIndex) ||
            (state._lastInspectorCompId !== undefined && compStyles.id !== state._lastInspectorCompId) ||
            compStyles.id !== state.editingIndex
        ));

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

    // 1. Update Top Metadata Bar & Footer
    _syncTopMetadataBar(pm);

    // 2. Update Sidebar Panels based on selected component
    const hasSelection = (window.state && window.state.selectedIds && window.state.selectedIds.length > 0);
    if (compStyles || hasSelection) {
        if (compStyles) {
            state.selectedComponent = { id: compStyles.id, ...compStyles };
            state.selectedComponentStyles = compStyles;
        } else {
            state.selectedComponent = null;
            state.selectedComponentStyles = null;
        }

        // Apply docked vs floating layout
        const isDocked = _applyInspectorDockMode();

        // Hide all sections first & return active sections to storage
        window.restorePropertiesSections(isNewComp);
        const curActiveEl = document.activeElement;
        const curIsBtn = curActiveEl && curActiveEl.tagName === 'BUTTON';
        const isTypingInAdminProps = !curIsBtn && curActiveEl && (curActiveEl.classList.contains('admin-col-label-input') || curActiveEl.classList.contains('admin-row-height-input') || curActiveEl.id === 'prop-admin-group-header-title' || curActiveEl.id === 'prop-admin-label-width-slider' || curActiveEl.id === 'prop-admin-label-width-number');

        _hideAllPropertySections(isTypingInAdminProps);

        if (compStyles) {
            state.isEditing = true;
            state.editingType = _detectComponentType(compStyles);

            // Show relevant section and sync controls
            _syncComponentTypeProperties(compStyles, state.editingType);
            _syncCommonPropertyControls(compStyles, state.editingType, isNewComp);
        } else {
            // Case: Multi-selection without compStyles
            state.isEditing = true;
            state.editingType = 'multi';
        }

        // Show/Hide buttons inside selection-actions-bar based on selection count and type
        _syncSelectionActionBar(compStyles);

        // Load content to Quill
        _syncQuillContent(compStyles, state.editingType);

        // Dynamically move active panels into target inspector body (Docked or Floating)
        _relocatePropertyPanels(isDocked);
    } else {
        _handleNoSelection();
    }
    state._lastInspectorCompId = compStyles ? compStyles.id : null;
};

// Component property synchronizers decoupled to assets/vctrl_inspector_sync.js (window.InspectorPropertySync)


// Category metadata is unified in assets/vctrl_common.js SSOT (window.getCategoryData)

let flyoutHideTimer = null;
let currentFlyoutScreen = null;

// Screen list and flyout delegated to vctrl_screen_manager.js

// --- 4. Library & Editor (Delegated to vctrl_component_library.js) ---
// Global Color Palette delegated to vctrl_color_picker.js

    if (typeof window.preserveConsecutiveSpaces !== 'function') {
        window.preserveConsecutiveSpaces = (html) => (window.InspectorTextFormatter?.preserveConsecutiveSpaces ? window.InspectorTextFormatter.preserveConsecutiveSpaces(html) : html);
    }


// --- 4. Library & Editor (Quill Rich Text Editor decoupled to assets/inspector/inspector_quill.js) ---
// --- 5. Init Events & Listeners ---
if (DOM.btnToggleLeft) DOM.btnToggleLeft.onclick = () => window.toggleSidebar('left');
if (DOM.btnToggleRight) DOM.btnToggleRight.onclick = () => window.toggleSidebar('right');
document.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => window.switchSidebarTab(btn.dataset.tab));
_bindScrollPinEvents();
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


// System Modals (showLoading, hideLoading, showAuthModal, hideAuthModal) decoupled to assets/vctrl_system_modals.js
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


// Auto-initialize global color palette popover
if (typeof window.initV4GlobalColorPalette === 'function') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initV4GlobalColorPalette);
    } else {
        window.initV4GlobalColorPalette();
    }
}

console.log("[VCTRL INSPECTOR] UI Controller fully loaded and cleaned.");


// Reset transparency badge when any color picker input changes
document.addEventListener('input', function(e) {
    if (!e.target) return;
    const colorIds = {
        'shape-bg-color': 'shape-bg-wrapper',
        'shape-border-color': 'shape-border-wrapper',
        'table-border-color': 'table-border-wrapper',
        'cell-bg-color': 'cell-bg-wrapper',
        'icon-border-color': 'icon-border-wrapper',
        'prop-button-bg-color': 'button-bg-wrapper',
        'prop-button-border-color': 'button-border-wrapper',
        'prop-toggle-color': 'toggle-color-wrapper'
    };
    const wrapperId = colorIds[e.target.id];
    if (wrapperId) {
        const wrapper = document.getElementById(wrapperId);
        if (wrapper) wrapper.classList.remove('transparent-active');
    }
});

// Central inspector event re-binding and initialization (Unified SSOT)
window.initAllInspectorEvents = function() {
    const safeRun = (fn, name) => {
        try { if (typeof fn === 'function') fn(); }
        catch (e) { console.warn("[VCTRL INSPECTOR] " + name + " failed:", e); }
    };

    safeRun(window.rebindInspectorDOM, 'rebindInspectorDOM');
    safeRun(() => window.InspectorAtoms?.bindCheckboxRadioEvents?.(), 'InspectorAtoms.bindCheckboxRadioEvents');
    safeRun(() => window.InspectorAtoms?.bindTextboxTextareaEvents?.(), 'InspectorAtoms.bindTextboxTextareaEvents');
    safeRun(() => window.InspectorAtoms?.bindSearchBarEvents?.(), 'InspectorAtoms.bindSearchBarEvents');
    safeRun(() => window.InspectorAtoms?.bindStepperEvents?.(), 'InspectorAtoms.bindStepperEvents');
    safeRun(() => window.InspectorAtoms?.bindSelectboxEvents?.(), 'InspectorAtoms.bindSelectboxEvents');
    safeRun(() => window.InspectorAtoms?.bindFileuploadEvents?.(), 'InspectorAtoms.bindFileuploadEvents');
    safeRun(() => window.InspectorAtoms?.bindAlertEvents?.(), 'InspectorAtoms.bindAlertEvents');
    safeRun(() => window.InspectorAtoms?.bindButtonEvents?.(), 'InspectorAtoms.bindButtonEvents');
    safeRun(() => window.InspectorAtoms?.bindDatePickerEvents?.(), 'InspectorAtoms.bindDatePickerEvents');
    safeRun(() => (window.InspectorAtoms?.bindToggleEvents || window.initToggleEvents)?.(), 'InspectorAtoms.bindToggleEvents');
    safeRun(() => (window.InspectorAccordion?.bindAccordionEvents || window.InspectorAccordion?.bindEvents || window.initAccordionEvents)?.(), 'InspectorAccordion.bindAccordionEvents');
    safeRun(() => window.InspectorGrid?.bindEvents?.(), 'InspectorGrid.bindEvents');
    safeRun(() => window.InspectorTable?.bindEvents?.(), 'InspectorTable.bindEvents');
    safeRun(() => window.InspectorShapes?.bindEvents?.(), 'InspectorShapes.bindEvents');
    safeRun(window.initCursorEvents || (window.InspectorAtoms && window.InspectorAtoms.initCursorEvents), 'initCursorEvents');
    safeRun(_bindScrollPinEvents, '_bindScrollPinEvents');
};

// Backward-compatible global aliases for atom/domain event triggers
window.initCheckboxRadioEvents = () => window.InspectorAtoms?.bindCheckboxRadioEvents?.();
window.initTextboxTextareaEvents = () => window.InspectorAtoms?.bindTextboxTextareaEvents?.();
window.initSearchbarEvents = () => window.InspectorAtoms?.bindSearchBarEvents?.();
window.initStepperEvents = () => window.InspectorAtoms?.bindStepperEvents?.();
window.initSelectboxEvents = () => window.InspectorAtoms?.bindSelectboxEvents?.();
window.initFileuploadEvents = () => window.InspectorAtoms?.bindFileuploadEvents?.();
window.initAlertEvents = () => window.InspectorAtoms?.bindAlertEvents?.();
window.initButtonEvents = () => window.InspectorAtoms?.bindButtonEvents?.();
window.initDatePickerEvents = () => window.InspectorAtoms?.bindDatePickerEvents?.();
window.initAccordionEvents = () => window.InspectorAccordion?.bindAccordionEvents?.();
window.initGridEvents = () => window.InspectorGrid?.bindEvents?.();
window.initToggleEvents = () => window.InspectorAtoms?.bindToggleEvents?.();