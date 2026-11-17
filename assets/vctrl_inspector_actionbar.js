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

            // Update selection count & label SSOT (Hide redundant 1 OBJECT SELECTED banner on single selection)
            const selectionNumber = document.getElementById('selection-number');
            const selectionLabel = document.getElementById('selection-label');
            const selectionCountGroup = document.querySelector('#selection-actions-bar .selection-count-group');
            const effectiveCount = selIds.length > 0 ? selIds.length : (compStyles && compStyles.id ? 1 : 0);
            if (selectionNumber) selectionNumber.innerText = effectiveCount;
            if (selectionLabel) selectionLabel.innerText = effectiveCount > 1 ? 'OBJECTS' : 'OBJECT';
            if (selectionCountGroup) {
                selectionCountGroup.style.setProperty('display', effectiveCount >= 2 ? 'flex' : 'none', 'important');
            }

            if (btnGroup) btnGroup.style.setProperty('display', (selIds.length > 1) ? 'flex' : 'none', 'important');
            if (btnUngroup) btnUngroup.style.setProperty('display', isSingleGroup ? 'flex' : 'none', 'important');
            if (btnAddToMolecules) btnAddToMolecules.style.setProperty('display', canAddMolecule ? 'flex' : 'none', 'important');
            if (alignBar) {
                alignBar.style.setProperty('display', (hasSelection && !isSingleGroup) ? 'block' : 'none', 'important');
                const distRow = document.getElementById('selection-distribute-row');
                const btnDistH = document.getElementById('btn-align-distribute-h');
                const btnDistV = document.getElementById('btn-align-distribute-v');
                const showDistribute = selIds.length >= 2;
                const canDistribute = selIds.length >= 3;
                if (distRow) {
                    distRow.style.setProperty('display', showDistribute ? 'grid' : 'none', 'important');
                }
                if (btnDistH) {
                    btnDistH.style.opacity = canDistribute ? '1' : '0.35';
                    btnDistH.style.pointerEvents = canDistribute ? 'auto' : 'none';
                    btnDistH.title = canDistribute ? '가로 간격 균등 배분' : '가로 간격 균등 배분 (3개 이상 선택 시 사용 가능)';
                }
                if (btnDistV) {
                    btnDistV.style.opacity = canDistribute ? '1' : '0.35';
                    btnDistV.style.pointerEvents = canDistribute ? 'auto' : 'none';
                    btnDistV.title = canDistribute ? '세로 간격 균등 배분' : '세로 간격 균등 배분 (3개 이상 선택 시 사용 가능)';
                }
            }
            const styleActionRow = document.getElementById('selection-style-action-row');
            if (styleActionRow) styleActionRow.style.setProperty('display', isSingleGroup ? 'none' : 'flex', 'important');

            // Synchronize Lock / Unlock Toggle Button (C-4)
            const lockRow = document.getElementById('selection-lock-action-row');
            const btnLock = document.getElementById('btn-lock-object-action');
            const txtLock = document.getElementById('txt-lock-object-action');
            const iconLock = document.getElementById('icon-lock-object-action');
            const isConnectorOnly = !!(compStyles && (compStyles.isConnector || (compStyles.id && String(compStyles.id).indexOf('conn_') === 0))) ||
                (selIds.length > 0 && selIds.every(id => typeof id === 'string' && id.indexOf('conn_') === 0));
            if (lockRow) {
                lockRow.style.setProperty('display', (hasSelection && !isConnectorOnly) ? 'flex' : 'none', 'important');
            }
            const isLocked = !!(compStyles && compStyles.isLocked);
            if (btnLock) {
                btnLock.classList.toggle('active', isLocked);
                btnLock.classList.toggle('is-locked-active', isLocked);
            }
            if (txtLock) {
                txtLock.textContent = isLocked ? '잠금 해제' : '위치 잠금';
            }
            if (iconLock) {
                iconLock.innerHTML = isLocked
                    ? '<rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>'
                    : '<rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.8-1.2"></path>';
            }

            if (groupDimBar) {
                if (isSingleGroup) {
                    groupDimBar.style.setProperty('display', 'flex', 'important');
                    let wVal = 0;
                    let hVal = 0;
                    if (compStyles && typeof compStyles.w === 'number') {
                        wVal = Math.round(compStyles.w);
                        hVal = Math.round(compStyles.h);
                    }
                    const grpLeftInp = document.getElementById('prop-left-group');
                    const grpTopInp = document.getElementById('prop-top-group');
                    if (grpLeftInp) {
                        grpLeftInp.disabled = isLocked;
                        if (compStyles && compStyles.x !== undefined && document.activeElement !== grpLeftInp) {
                            grpLeftInp.value = Math.round(parseFloat(compStyles.x) || 0);
                        }
                    }
                    if (grpTopInp) {
                        grpTopInp.disabled = isLocked;
                        if (compStyles && compStyles.y !== undefined && document.activeElement !== grpTopInp) {
                            grpTopInp.value = Math.round(parseFloat(compStyles.y) || 0);
                        }
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
