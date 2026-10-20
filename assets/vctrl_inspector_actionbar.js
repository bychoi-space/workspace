/**
 * Workspace Editor - Inspector Action Bar Submodule
 * Decoupled from vctrl_inspector.js for modular architecture.
 * Manages #selection-actions-bar, grouping, layers, alignment, style actions, and group dimensions.
 */
(function() {
    'use strict';

    const InspectorActionBar = {
        sync(compStyles) {
            const btnGroup = document.getElementById('btn-group-action');
            const btnUngroup = document.getElementById('btn-ungroup-action');
            const btnAddToMolecules = document.getElementById('btn-add-molecules-action');
            const alignBar = document.getElementById('selection-align-bar');
            const groupDimBar = document.getElementById('group-dimension-bar');
            const groupDimWidth = document.getElementById('group-dim-width');
            const groupDimHeight = document.getElementById('group-dim-height');
            
            const selIds = (window.state && window.state.selectedIds) ? window.state.selectedIds : [];
            const isSingleGroup = selIds.length === 1 && compStyles && compStyles.isGroup;
            const canAddMolecule = isSingleGroup || (selIds.length <= 1 && compStyles && compStyles.isTable);

            const hasSelection = selIds.length > 0 || !!(compStyles && compStyles.id);

            if (btnGroup) btnGroup.style.setProperty('display', (selIds.length > 1) ? 'flex' : 'none', 'important');
            if (btnUngroup) btnUngroup.style.setProperty('display', isSingleGroup ? 'flex' : 'none', 'important');
            if (btnAddToMolecules) btnAddToMolecules.style.setProperty('display', canAddMolecule ? 'flex' : 'none', 'important');
            if (alignBar) {
                alignBar.style.setProperty('display', (hasSelection && !isSingleGroup) ? 'block' : 'none', 'important');
                const btnDistH = document.getElementById('btn-align-distribute-h');
                const btnDistV = document.getElementById('btn-align-distribute-v');
                const canDistribute = selIds.length >= 3;
                if (btnDistH) {
                    btnDistH.style.opacity = canDistribute ? '1' : '0.35';
                    btnDistH.style.pointerEvents = canDistribute ? 'auto' : 'none';
                    btnDistH.title = canDistribute ? 'Distribute Horizontally' : 'Distribute Horizontally (3개 이상 선택 시 사용 가능)';
                }
                if (btnDistV) {
                    btnDistV.style.opacity = canDistribute ? '1' : '0.35';
                    btnDistV.style.pointerEvents = canDistribute ? 'auto' : 'none';
                    btnDistV.title = canDistribute ? 'Distribute Vertically' : 'Distribute Vertically (3개 이상 선택 시 사용 가능)';
                }
            }
            const styleActionRow = document.getElementById('selection-style-action-row');
            if (styleActionRow) styleActionRow.style.setProperty('display', isSingleGroup ? 'none' : 'flex', 'important');

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

            // Synchronize Scroll Pin Navigation Controls
            if (window.InspectorScrollPin && typeof window.InspectorScrollPin.syncUI === 'function') {
                window.InspectorScrollPin.syncUI(compStyles);
            }
        },

        relocate(targetBody) {
            if (!targetBody) return;
            const selectionBar = document.getElementById('selection-actions-bar');
            if (selectionBar) {
                if (selectionBar.parentElement !== targetBody) {
                    targetBody.insertBefore(selectionBar, targetBody.firstChild);
                }
                selectionBar.style.setProperty('display', 'flex', 'important');
            }
        },

        hide() {
            const selectionBar = document.getElementById('selection-actions-bar');
            if (selectionBar) selectionBar.style.display = 'none';
            const groupDimBar = document.getElementById('group-dimension-bar');
            if (groupDimBar) groupDimBar.style.setProperty('display', 'none', 'important');
            const scrollPinBar = document.getElementById('selection-scroll-pin-bar');
            if (scrollPinBar) scrollPinBar.style.setProperty('display', 'none', 'important');
        }
    };

    window.InspectorActionBar = InspectorActionBar;
    window._syncSelectionActionBar = function(compStyles) {
        InspectorActionBar.sync(compStyles);
    };
})();
