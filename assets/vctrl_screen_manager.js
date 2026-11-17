/**
 * assets/vctrl_screen_manager.js
 * Domain Module: Screen Navigation, Ordering, Duplication, Metadata Editing, and Revision History.
 */
(function() {
    console.log("[VCTRL SCREEN MANAGER] Module loaded.");
    const getCategoryData = (type) => (typeof window.getCategoryData === 'function' ? window.getCategoryData(type) : { label: 'ETC', code: 'ET', class: 'badge-default' });
    let flyoutHideTimer = null;
    let currentFlyoutScreen = null;

    // --- Screen Flyout & List Rendering ---
window.showScreenFlyout = function(item, screenData) {
    if (flyoutHideTimer) {
        clearTimeout(flyoutHideTimer);
        flyoutHideTimer = null;
    }
    const sidebarLeft = DOM.sidebarLeft || document.getElementById('sidebar-left');
    if (!sidebarLeft || !sidebarLeft.classList.contains('collapsed')) {
        window.hideScreenFlyout(0);
        return;
    }

    const flyout = document.getElementById('screen-hover-flyout');
    if (!flyout) return;

    currentFlyoutScreen = screenData;
    const rect = item.getBoundingClientRect();

    const indexEl = document.getElementById('flyout-index');
    const badgeEl = document.getElementById('flyout-badge');
    const resEl = document.getElementById('flyout-res');
    const titleEl = document.getElementById('flyout-title');
    const filenameEl = document.getElementById('flyout-filename');
    const btnEdit = document.getElementById('flyout-btn-edit');
    const btnCopy = document.getElementById('flyout-btn-copy');
    const btnDelete = document.getElementById('flyout-btn-delete');
    const nub = flyout.querySelector('.flyout-nub');

    const itemIndex = screenData.index + 1;
    const cat = getCategoryData(screenData.type);
    if (indexEl) indexEl.innerText = `#${String(itemIndex).padStart(2, '0')}`;

    if (badgeEl) {
        badgeEl.className = `flyout-badge ${cat.class}`;
        badgeEl.innerText = cat.label;
    }

    if (resEl) {
        resEl.innerText = screenData.resolution || '1600x900';
    }

    if (titleEl) titleEl.innerText = screenData.title || screenData.name;
    if (filenameEl) filenameEl.innerText = screenData.name;

    if (btnEdit) {
        btnEdit.onclick = (e) => {
            e.stopPropagation();
            window.hideScreenFlyout(0);
            if (typeof window.handleEditScreen === 'function') window.handleEditScreen(screenData.name);
        };
    }
    if (btnCopy) {
        btnCopy.onclick = (e) => {
            e.stopPropagation();
            window.hideScreenFlyout(0);
            if (typeof window.handleCopyScreen === 'function') window.handleCopyScreen(screenData.name);
        };
    }
    if (btnDelete) {
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            window.hideScreenFlyout(0);
            if (typeof window.handleDeleteScreen === 'function') {
                window.handleDeleteScreen(screenData.name, screenData.sha).catch(err => {
                    console.error("[ScreenFlyout] Delete screen failed:", err);
                });
            }
        };
    }

    flyout.onclick = async (e) => {
        if (e.target.closest('.flyout-btn')) return;
        window.hideScreenFlyout(0);
        if (typeof window.checkUnsavedChanges === 'function' && !(await window.checkUnsavedChanges())) return;
        const url = `viewer.html?project=${state.currentProject}&file=${screenData.name}`;
        history.pushState(null, '', url);
        if (typeof window.loadScreen === 'function') window.loadScreen(screenData.name);
        window.updateActiveScreenInUI(screenData.name);
    };

    flyout.onmouseenter = () => {
        if (flyoutHideTimer) {
            clearTimeout(flyoutHideTimer);
            flyoutHideTimer = null;
        }
    };
    flyout.onmouseleave = () => {
        window.hideScreenFlyout(120);
    };

    flyout.style.display = 'block';
    const flyoutH = flyout.offsetHeight || 135;
    const itemCenterY = rect.top + rect.height / 2;
    let flyoutTop = itemCenterY - flyoutH / 2;
    const maxTop = window.innerHeight - flyoutH - 12;
    if (flyoutTop > maxTop) flyoutTop = maxTop;
    if (flyoutTop < 12) flyoutTop = 12;

    flyout.style.left = '58px';
    flyout.style.top = `${Math.round(flyoutTop)}px`;

    if (nub) {
        const nubTop = Math.max(14, Math.min(itemCenterY - flyoutTop, flyoutH - 14));
        nub.style.top = `${Math.round(nubTop)}px`;
    }
};

window.hideScreenFlyout = function(delay = 0) {
    if (flyoutHideTimer) {
        clearTimeout(flyoutHideTimer);
        flyoutHideTimer = null;
    }
    if (delay <= 0) {
        const flyout = document.getElementById('screen-hover-flyout');
        if (flyout) flyout.style.display = 'none';
        currentFlyoutScreen = null;
        return;
    }
    flyoutHideTimer = setTimeout(() => {
        const flyout = document.getElementById('screen-hover-flyout');
        if (flyout) flyout.style.display = 'none';
        currentFlyoutScreen = null;
        flyoutHideTimer = null;
    }, delay);
};

window.renderScreenList = function(screens, activeName) {
    if (typeof window.hideScreenFlyout === 'function') window.hideScreenFlyout(0);
    DOM.screensList.innerHTML = '';
    let activeItem = null;
    
    screens.forEach((s, index) => {
        const item = document.createElement('div');
        item.className = 'screen-item';
        item.draggable = !state.isReadOnly;
        item.dataset.index = index;
        item.dataset.screenName = s.name;
        item.dataset.screenIndex = index + 1;
        if (index + 1 >= 10) item.dataset.doubleDigit = 'true';
        
        const scMeta = (state.projectMetadata.screens || {})[s.name] || {};
        const cat = getCategoryData(scMeta.type);
        const badgeHtml = getCategoryBadge(scMeta.type);
        const displayTitle = scMeta.title || s.name;
        const itemIndex = index + 1;
        const paddedIndex = String(itemIndex).padStart(2, '0');
        item.title = `${itemIndex}. [${cat.code}] ${displayTitle} (${s.name})`;

        item.innerHTML = `
            <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                <!-- Collapsed Mode Single Crisp Chip: e.g. [01], [02] -->
                <span class="screen-collapsed-chip ${cat.class}">
                    <span class="chip-pad-num">${paddedIndex}</span>
                    <span class="chip-num">${itemIndex}.</span>
                    <span class="chip-code">${cat.code}</span>
                </span>
                <!-- Expanded Mode: Normal Full Badge + Title -->
                ${badgeHtml}
                <span class="screen-name" title="${displayTitle} (${s.name})">${displayTitle}</span>
            </div>
            <div class="screen-actions" style="display:flex; gap:4px;">
                <button class="screen-edit-btn" title="속성 편집"><span class="material-icons-outlined" style="font-size:16px;">edit</span></button>
                <button class="screen-copy-btn" title="화면 복사"><span class="material-icons-outlined" style="font-size:16px;">content_copy</span></button>
                <button class="screen-delete-btn" title="화면 삭제"><span class="material-icons-outlined" style="font-size:16px;">delete</span></button>
            </div>
        `;
        
        if (s.name === activeName) {
            item.classList.add('active');
            activeItem = item;
        }

        item.onclick = async (e) => {
            if (e.target.closest('.screen-delete-btn')) {
                if (typeof window.handleDeleteScreen === 'function') {
                    window.handleDeleteScreen(s.name, s.sha).catch(err => {
                        console.error("[ScreenList] Delete screen failed:", err);
                    });
                }
                return;
            }
            if (e.target.closest('.screen-copy-btn')) {
                if (typeof window.handleCopyScreen === 'function') window.handleCopyScreen(s.name);
                return;
            }
            if (e.target.closest('.screen-edit-btn')) {
                if (typeof window.handleEditScreen === 'function') window.handleEditScreen(s.name);
                return;
            }
            if (typeof window.checkUnsavedChanges === 'function' && !(await window.checkUnsavedChanges())) return;
            const url = `viewer.html?project=${state.currentProject}&file=${s.name}`;
            history.pushState(null, '', url);
            if (typeof window.loadScreen === 'function') window.loadScreen(s.name);
            window.updateActiveScreenInUI(s.name);
        };

        item.onmouseenter = () => {
            window.showScreenFlyout(item, {
                index: index,
                name: s.name,
                sha: s.sha,
                title: displayTitle,
                type: scMeta.type,
                resolution: scMeta.width ? `${scMeta.width}x${scMeta.height || 900}` : '1600x900'
            });
        };
        item.onmouseleave = () => {
            window.hideScreenFlyout(120);
        };

        item.ondragstart = (e) => {
            window.hideScreenFlyout(0);
            e.dataTransfer.setData('text/plain', index);
            item.classList.add('dragging');
        };
        item.ondragend = () => {
            item.classList.remove('dragging');
            document.querySelectorAll('.screen-item').forEach(i => i.classList.remove('drag-over'));
        };
        item.ondragover = (e) => { e.preventDefault(); item.classList.add('drag-over'); };
        item.ondragleave = () => item.classList.remove('drag-over');
        item.ondrop = async (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(item.dataset.index);
            if (fromIndex !== toIndex) {
                const [movedItem] = state.screens.splice(fromIndex, 1);
                state.screens.splice(toIndex, 0, movedItem);
                state.projectMetadata.screenOrder = state.screens.map(s => s.name);
                if (typeof window.saveProjectMetadata === 'function') await window.saveProjectMetadata(state.currentProject, state.projectMetadata);
                renderScreenList(state.screens, state.activeFile?.name);
            }
        };

        DOM.screensList.appendChild(item);
    });

    if (DOM.screensList) {
        DOM.screensList.onscroll = () => {
            if (typeof window.hideScreenFlyout === 'function') window.hideScreenFlyout(0);
        };
    }

    if (activeItem) {
        setTimeout(() => activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 800);
    }
    if (window.ResolutionEngine && typeof window.ResolutionEngine.syncScreenList === 'function') {
        window.ResolutionEngine.syncScreenList();
    }
};

window.updateActiveScreenInUI = function(activeName) {
    document.querySelectorAll('.screen-item').forEach(item => {
        const screenName = item.dataset.screenName;
        const nameTitle = item.querySelector('.screen-name')?.title || '';
        const isActive = (screenName && screenName === activeName) || nameTitle.includes(activeName);
        item.classList.toggle('active', isActive);
        if (isActive) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    if (window.ResolutionEngine && typeof window.ResolutionEngine.syncScreenList === 'function') {
        window.ResolutionEngine.syncScreenList();
    }
};

let _isScreenNavigating = false;
let _boundaryToastHideTimer = null;
let _boundaryToastRemoveTimer = null;

function _isModalElementVisible(el) {
    if (!el) return false;
    if (el.classList && (el.classList.contains('active') || el.classList.contains('is-open') || el.classList.contains('show'))) {
        return true;
    }
    const inlineDisplay = el.style ? el.style.display : '';
    return inlineDisplay === 'flex' || inlineDisplay === 'block' || inlineDisplay === 'grid';
}

window.isBlockingOverlayOpen = function() {
    if (_isModalElementVisible(document.getElementById('save-overlay'))) return true;
    if (_isModalElementVisible(document.getElementById('notification-overlay'))) return true;
    if (_isModalElementVisible(document.getElementById('v4-bottom-sheet'))) return true;

    const modals = document.querySelectorAll('.modal-overlay');
    for (let i = 0; i < modals.length; i++) {
        if (_isModalElementVisible(modals[i])) return true;
    }
    return false;
};

function _showScreenBoundaryToast(message) {
    let container = document.getElementById('v4-toast-container');
    if (!container) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'info');
            const created = document.querySelector('#v4-toast-container .v4-toast:last-child');
            if (created) created.setAttribute('data-boundary-toast', 'true');
            return;
        }
        if (typeof window.showGlobalToast === 'function') {
            window.showGlobalToast(message, 'info');
            return;
        }
        container = document.createElement('div');
        container.id = 'v4-toast-container';
        document.body.appendChild(container);
    }

    let existing = container.querySelector('.v4-toast[data-boundary-toast="true"]');
    if (_boundaryToastHideTimer) {
        clearTimeout(_boundaryToastHideTimer);
        _boundaryToastHideTimer = null;
    }
    if (_boundaryToastRemoveTimer) {
        clearTimeout(_boundaryToastRemoveTimer);
        _boundaryToastRemoveTimer = null;
    }

    if (existing) {
        const textSpan = existing.querySelector('.v4-boundary-toast-text') || existing.querySelector('span:last-child');
        if (textSpan) textSpan.textContent = message;
        existing.classList.remove('hide');
        existing.classList.add('show');
    } else {
        existing = document.createElement('div');
        existing.className = 'v4-toast info';
        existing.setAttribute('data-boundary-toast', 'true');
        existing.innerHTML =
            '<span class="material-icons-outlined v4-toast-icon">info</span>' +
            '<span class="v4-boundary-toast-text" style="flex-grow: 1;"></span>';
        const textSpan = existing.querySelector('.v4-boundary-toast-text');
        if (textSpan) textSpan.textContent = message;
        container.appendChild(existing);
        requestAnimationFrame(() => {
            existing.classList.add('show');
        });
    }

    _boundaryToastHideTimer = setTimeout(() => {
        if (existing && existing.isConnected) {
            existing.classList.remove('show');
            existing.classList.add('hide');
            _boundaryToastRemoveTimer = setTimeout(() => {
                if (existing && existing.isConnected) existing.remove();
            }, 400);
        }
    }, 2200);
}

function _getOrderedScreensForNav() {
    const st = window.state || {};
    if (Array.isArray(st.screens) && st.screens.length > 0) {
        return st.screens;
    }
    if (window.ResolutionEngine && typeof window.ResolutionEngine.getScreensList === 'function') {
        const list = window.ResolutionEngine.getScreensList();
        if (Array.isArray(list) && list.length > 0) return list;
    }
    if (st.projectMetadata && st.projectMetadata.screens) {
        const order = st.projectMetadata.screenOrder;
        if (Array.isArray(order) && order.length > 0) {
            return order.map(name => ({ name: name }));
        }
        return Object.keys(st.projectMetadata.screens).map(name => ({ name: name }));
    }
    return [];
}

function _resolveActiveScreenIndexForNav(screens) {
    if (!Array.isArray(screens) || screens.length === 0) return -1;
    const st = window.state || {};
    let activeName = (st.activeFile && st.activeFile.name) || '';
    if (!activeName && window.location && window.location.search) {
        try {
            const params = new URLSearchParams(window.location.search);
            activeName = params.get('file') || '';
        } catch (err) {}
    }
    if (!activeName) return 0;

    const normActive = String(activeName).toLowerCase().replace(/\.html$/i, '');
    for (let i = 0; i < screens.length; i++) {
        const item = screens[i];
        const sName = typeof item === 'string' ? item : (item && (item.name || item.file)) || '';
        const normItem = String(sName).toLowerCase().replace(/\.html$/i, '');
        if (normItem === normActive) return i;
    }
    return -1;
}

window.navigateScreenByOffset = async function(direction) {
    const st = window.state || {};
    if (!st.currentProject) return false;
    if (st.isImageCropping) return false;
    if (typeof window.isBlockingOverlayOpen === 'function' && window.isBlockingOverlayOpen()) return false;
    if (_isScreenNavigating) return false;

    const screens = _getOrderedScreensForNav();
    if (!screens || screens.length === 0) return false;

    let curIdx = _resolveActiveScreenIndexForNav(screens);
    if (curIdx < 0) curIdx = 0;

    const delta = direction < 0 ? -1 : 1;
    const nextIdx = curIdx + delta;

    // Boundary Stop (Option 1) with clear Korean toast feedback
    if (nextIdx < 0) {
        _showScreenBoundaryToast('첫 화면입니다.');
        return false;
    }
    if (nextIdx >= screens.length) {
        _showScreenBoundaryToast('마지막 화면입니다.');
        return false;
    }

    const target = screens[nextIdx];
    const targetFile = typeof target === 'string' ? target : (target && (target.name || target.file));
    if (!targetFile) return false;

    _isScreenNavigating = true;
    try {
        if (typeof window.hideScreenFlyout === 'function') {
            window.hideScreenFlyout(0);
        }
        if (typeof window.checkUnsavedChanges === 'function' && !(await window.checkUnsavedChanges())) {
            return false;
        }

        if (window.ResolutionEngine) {
            window.ResolutionEngine._userSelectedFocus = null;
        }

        try {
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set('file', targetFile);
            window.history.pushState(null, '', nextUrl.toString());
        } catch (urlErr) {
            const fallbackUrl = `viewer.html?project=${st.currentProject}&file=${targetFile}`;
            window.history.pushState(null, '', fallbackUrl);
        }

        if (typeof window.updateActiveScreenInUI === 'function') {
            window.updateActiveScreenInUI(targetFile);
        }
        if (typeof window.loadScreen === 'function') {
            await window.loadScreen(targetFile);
        }
        return true;
    } catch (err) {
        console.error('[ScreenManager] navigateScreenByOffset failed:', err);
        return false;
    } finally {
        _isScreenNavigating = false;
    }
};

function getCategoryBadge(type) {
    if (!type || type === 'default') return '<span class="screen-badge badge-default">ETC</span>';
    const cat = getCategoryData(type);
    return `<span class="screen-badge ${cat.class}">${cat.label}</span>`;
}


    // --- Screen Edit & Copy / Move Handlers ---
window.handleEditScreen = async function(fileName) {
    const state = window.state || {};
    if (state.isReadOnly) {
        if (typeof window.showAuthModal === 'function') window.showAuthModal();
        return;
    }

    // Live DOM Lookup to guarantee references even if UI block was injected asynchronously
    const editModal = document.getElementById('edit-screen-modal');
    const editFilename = document.getElementById('edit-screen-filename');
    const editTitle = document.getElementById('edit-screen-title');
    const editType = document.getElementById('edit-screen-type');
    const editDefaultTab = document.getElementById('edit-screen-default-tab');
    const editDesc = document.getElementById('edit-screen-desc');
    const btnSubmit = document.getElementById('btn-edit-screen-submit');
    const btnCancel = document.getElementById('btn-edit-screen-cancel');

    // Update window.DOM cache references if window.DOM exists
    if (window.DOM) {
        if (editModal) window.DOM.editScreenModal = editModal;
        if (editFilename) window.DOM.editScreenFilename = editFilename;
        if (editTitle) window.DOM.editScreenTitle = editTitle;
        if (editType) window.DOM.editScreenType = editType;
        if (editDefaultTab) window.DOM.editScreenDefaultTab = editDefaultTab;
        if (editDesc) window.DOM.editScreenDesc = editDesc;
        if (btnSubmit) window.DOM.btnSubmitEdit = btnSubmit;
        if (btnCancel) window.DOM.btnCancelEdit = btnCancel;
    }

    const meta = (state.projectMetadata.screens || {})[fileName] || {};
    
    if (editFilename) editFilename.innerText = fileName;
    if (editTitle) editTitle.value = meta.title || "";
    let screenType = meta.type || "default";
    if (screenType === 'admin-nbos' || screenType === 'admin-modern') {
        screenType = 'admin';
    }
    if (editType) editType.value = screenType;
    if (editDefaultTab) editDefaultTab.value = meta.defaultTab || "editor";
    if (editDesc) editDesc.value = meta.screenDesc || meta.description || "";
    if (editModal) editModal.classList.add('active');

    if (btnCancel) {
        btnCancel.onclick = () => {
            if (editModal) editModal.classList.remove('active');
        };
    }
    
    if (btnSubmit) {
        btnSubmit.onclick = async () => {
            const newTitle = editTitle ? editTitle.value.trim() : "";
            const newType = editType ? editType.value : "default";
            const newDefaultTab = editDefaultTab ? editDefaultTab.value : "editor";
            const newDesc = editDesc ? editDesc.value.trim() : "";
            
            btnSubmit.disabled = true;
            btnSubmit.innerText = "Saving...";
            
            if (!state.projectMetadata.screens) state.projectMetadata.screens = {};
            state.projectMetadata.screens[fileName] = {
                ...state.projectMetadata.screens[fileName],
                title: newTitle,
                type: newType,
                defaultTab: newDefaultTab,
                screenDesc: newDesc,
                updatedAt: new Date().toISOString()
            };
            
            const saveMetaFn = window.saveProjectMetadata || (typeof saveProjectMetadata === 'function' ? saveProjectMetadata : null);
            if (typeof saveMetaFn === 'function') {
                const success = await saveMetaFn(state.currentProject, state.projectMetadata);
                if (success) {
                    if (editModal) editModal.classList.remove('active');
                    location.reload(); 
                } else {
                    alert("Failed to save project metadata. Please check authentication token.");
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = "Save Changes";
                }
            } else {
                console.error("[Inspector] saveProjectMetadata is not defined on window.");
                btnSubmit.disabled = false;
                btnSubmit.innerText = "Save Changes";
            }
        };
    }
};

// --- Screen Manager Helper Functions (De-complexified Pure Utilities) ---
function _generateUniqueFilename(baseName, existingFiles = []) {
    let clean = (baseName || '').replace(/\.html$/i, '');
    clean = clean.replace(/_copy\d*$/i, '').trim();

    // 1. Trailing digits (e.g., "09_Admin_PC_Scroll_245" -> "09_Admin_PC_Scroll_246")
    const trailingMatch = clean.match(/^(.*?)(\d+)$/);
    if (trailingMatch) {
        const prefix = trailingMatch[1];
        const numStr = trailingMatch[2];
        const padLen = numStr.length;
        let num = parseInt(numStr, 10) + 1;
        let candidate = `${prefix}${String(num).padStart(padLen, '0')}.html`;
        while (existingFiles && existingFiles.includes(candidate)) {
            num++;
            candidate = `${prefix}${String(num).padStart(padLen, '0')}.html`;
        }
        return candidate;
    }

    // 2. Leading digits with separator (e.g., "01_Screen" -> "02_Screen")
    const leadingMatch = clean.match(/^(\d+)([\s_\.\-].*)$/);
    if (leadingMatch) {
        const numStr = leadingMatch[1];
        const rest = leadingMatch[2];
        const padLen = numStr.length;
        let num = parseInt(numStr, 10) + 1;
        let candidate = `${String(num).padStart(padLen, '0')}${rest}.html`;
        while (existingFiles && existingFiles.includes(candidate)) {
            num++;
            candidate = `${String(num).padStart(padLen, '0')}${rest}.html`;
        }
        return candidate;
    }

    // 3. No digits found (e.g., "cart_block" -> "cart_block_2.html")
    let counter = 2;
    let candidate = `${clean}_${counter}.html`;
    while (existingFiles && existingFiles.includes(candidate)) {
        counter++;
        candidate = `${clean}_${counter}.html`;
    }
    return candidate;
}

function _generateUniqueTitle(sourceTitle, existingTitles = []) {
    let clean = (sourceTitle || '').replace(/\s*\(복사본\)\s*/g, ' ').trim();

    // 1. Parenthesized number at end (e.g., "화면 (1)" -> "화면 (2)")
    const parenMatch = clean.match(/^(.*?)\((\d+)\)$/);
    if (parenMatch) {
        const prefix = parenMatch[1];
        const numStr = parenMatch[2];
        const padLen = numStr.length;
        let num = parseInt(numStr, 10) + 1;
        let candidate = `${prefix}(${String(num).padStart(padLen, '0')})`;
        while (existingTitles && existingTitles.includes(candidate)) {
            num++;
            candidate = `${prefix}(${String(num).padStart(padLen, '0')})`;
        }
        return candidate;
    }

    // 2. Korean "차" suffix (e.g., "리뉴얼 2차" -> "리뉴얼 3차")
    const chaMatch = clean.match(/^(.*?)(\d+)(차)$/);
    if (chaMatch) {
        const prefix = chaMatch[1];
        const numStr = chaMatch[2];
        const suffix = chaMatch[3];
        let num = parseInt(numStr, 10) + 1;
        let candidate = `${prefix}${num}${suffix}`;
        while (existingTitles && existingTitles.includes(candidate)) {
            num++;
            candidate = `${prefix}${num}${suffix}`;
        }
        return candidate;
    }

    // 3. Trailing digits (e.g., "09_Admin_PC_Scroll_245", "화면 1", "화면_01", "화면-2")
    const trailingMatch = clean.match(/^(.*?)(\d+)$/);
    if (trailingMatch) {
        const prefix = trailingMatch[1];
        const numStr = trailingMatch[2];
        const padLen = numStr.length;
        let num = parseInt(numStr, 10) + 1;
        let candidate = `${prefix}${String(num).padStart(padLen, '0')}`;
        while (existingTitles && existingTitles.includes(candidate)) {
            num++;
            candidate = `${prefix}${String(num).padStart(padLen, '0')}`;
        }
        return candidate;
    }

    // 4. Leading bracket or separator (e.g., "[01] 기획전", "01_비즈니스 프로세스 맵", "1. 개요")
    const leadingBracketMatch = clean.match(/^\[(\d+)\](.*)$/);
    if (leadingBracketMatch) {
        const numStr = leadingBracketMatch[1];
        const rest = leadingBracketMatch[2];
        const padLen = numStr.length;
        let num = parseInt(numStr, 10) + 1;
        let candidate = `[${String(num).padStart(padLen, '0')}]${rest}`;
        while (existingTitles && existingTitles.includes(candidate)) {
            num++;
            candidate = `[${String(num).padStart(padLen, '0')}]${rest}`;
        }
        return candidate;
    }

    const leadingMatch = clean.match(/^(\d+)([\s_\.\-].*)$/);
    if (leadingMatch) {
        const numStr = leadingMatch[1];
        const rest = leadingMatch[2];
        const padLen = numStr.length;
        let num = parseInt(numStr, 10) + 1;
        let candidate = `${String(num).padStart(padLen, '0')}${rest}`;
        while (existingTitles && existingTitles.includes(candidate)) {
            num++;
            candidate = `${String(num).padStart(padLen, '0')}${rest}`;
        }
        return candidate;
    }

    // 5. No digits found (e.g., "기획전 목록", "장바구니", "회원상세" -> "기획전 목록 2")
    let counter = 2;
    let candidate = `${clean} ${counter}`;
    while (existingTitles && existingTitles.includes(candidate)) {
        counter++;
        candidate = `${clean} ${counter}`;
    }
    return candidate;
}

async function _populateTargetProjectSelect(targetProjectSelect, sourceProject, state) {
    if (!targetProjectSelect) return;
    targetProjectSelect.innerHTML = '<option value="">프로젝트 목록 불러오는 중...</option>';
    targetProjectSelect.disabled = true;

    try {
        let folders = [];
        if (typeof listContents === 'function') {
            const rootItems = await listContents('');
            if (Array.isArray(rootItems)) {
                const ignored = ['assets', 'scripts', '.github', '.agents', '.gemini', 'node_modules', '.git'];
                folders = rootItems.filter(i => i.type === 'dir' && !ignored.includes(i.name));
            }
        }

        if (sourceProject && !folders.find(f => f.name === sourceProject)) {
            folders.unshift({ name: sourceProject, type: 'dir' });
        }

        targetProjectSelect.innerHTML = '';
        for (const folder of folders) {
            const opt = document.createElement('option');
            opt.value = folder.name;
            opt.textContent = folder.name === sourceProject
                ? `${folder.name} (현재 프로젝트)`
                : `${folder.name}`;
            if (folder.name === sourceProject) {
                opt.selected = true;
            }
            targetProjectSelect.appendChild(opt);
        }
        targetProjectSelect.disabled = false;

        // Async load project titles to enhance options
        (async () => {
            for (const folder of folders) {
                try {
                    const meta = (folder.name === sourceProject && state.projectMetadata) 
                        ? state.projectMetadata 
                        : (typeof fetchProjectMetadata === 'function' ? await fetchProjectMetadata(folder.name) : null);
                    if (meta && meta.title && meta.title !== folder.name) {
                        const opt = targetProjectSelect.querySelector(`option[value="${folder.name}"]`);
                        if (opt) {
                            opt.textContent = folder.name === sourceProject
                                ? `${meta.title} (${folder.name}) - 현재 프로젝트`
                                : `${meta.title} (${folder.name})`;
                        }
                    }
                } catch (e) {}
            }
        })();

    } catch (err) {
        console.error("[CopyScreen] Failed to list projects:", err);
        targetProjectSelect.innerHTML = `<option value="${sourceProject}">${sourceProject} (현재 프로젝트)</option>`;
        targetProjectSelect.disabled = false;
    }
}

async function _syncCopyScreenTargetProject(opts) {
    const {
        targetProjectSelect, sourceProject, sourceFileName, sourceTitle,
        filenameInput, titleInput, noticeEl, moveGroup, isMoveCheck,
        projectScreensCache, projectTitlesCache
    } = opts;

    const targetProj = targetProjectSelect ? targetProjectSelect.value : sourceProject;
    const isSameProject = targetProj === sourceProject;

    if (moveGroup && isMoveCheck) {
        if (isSameProject) {
            isMoveCheck.checked = false;
            moveGroup.style.opacity = '0.5';
            isMoveCheck.disabled = true;
        } else {
            moveGroup.style.opacity = '1';
            isMoveCheck.disabled = false;
        }
    }

    let targetFiles = projectScreensCache[targetProj];
    let targetTitles = projectTitlesCache[targetProj];
    if (!targetFiles || !targetTitles) {
        try {
            if (noticeEl) {
                noticeEl.innerText = '대상 프로젝트 정보 확인 중...';
                noticeEl.style.color = '#94a3b8';
            }
            const targetMeta = typeof fetchProjectMetadata === 'function' ? await fetchProjectMetadata(targetProj) : null;
            targetFiles = targetMeta && targetMeta.screens ? Object.keys(targetMeta.screens) : [];
            targetTitles = targetMeta && targetMeta.screens ? Object.values(targetMeta.screens).map(s => s.title).filter(Boolean) : [];
            projectScreensCache[targetProj] = targetFiles;
            projectTitlesCache[targetProj] = targetTitles;
        } catch (e) {
            targetFiles = [];
            targetTitles = [];
        }
    }

    if (filenameInput) {
        const currentVal = filenameInput.value.trim();
        if (!currentVal || targetFiles.includes(currentVal)) {
            filenameInput.value = _generateUniqueFilename(sourceFileName, targetFiles);
        }
    }
    if (titleInput) {
        const currentTitle = titleInput.value.trim();
        if (!currentTitle || targetTitles.includes(currentTitle)) {
            titleInput.value = _generateUniqueTitle(sourceTitle, targetTitles);
        }
    }
    if (noticeEl) {
        noticeEl.innerText = `* 대상 프로젝트: [${targetProj}] (총 ${targetFiles.length}개 화면)`;
        noticeEl.style.color = '#94a3b8';
    }
}

window.handleCopyScreen = async function(sourceFileName) {
    const state = window.state || {};
    if (state.isReadOnly) {
        if (typeof window.showAuthModal === 'function') window.showAuthModal();
        return;
    }

    const modal = document.getElementById('copy-screen-modal');
    const sourceInfoEl = document.getElementById('copy-screen-source-info');
    const targetProjectSelect = document.getElementById('copy-screen-target-project');
    const titleInput = document.getElementById('copy-screen-title');
    const filenameInput = document.getElementById('copy-screen-filename');
    const noticeEl = document.getElementById('copy-screen-filename-notice');
    const openAfterCheck = document.getElementById('copy-screen-open-after');
    const isMoveCheck = document.getElementById('copy-screen-is-move');
    const moveGroup = document.getElementById('copy-screen-move-group');
    const btnSubmit = document.getElementById('btn-copy-screen-submit');
    const btnCancel = document.getElementById('btn-copy-screen-cancel');

    if (!modal) return;

    const sourceProject = state.currentProject;
    const sourceScreenMeta = (state.projectMetadata && state.projectMetadata.screens && state.projectMetadata.screens[sourceFileName]) || {};
    const sourceTitle = sourceScreenMeta.title || sourceFileName.replace(/\.html$/i, '');

    if (sourceInfoEl) {
        sourceInfoEl.innerText = `현재: [${sourceProject}] ${sourceFileName} (${sourceTitle})`;
    }

    const projectScreensCache = {};
    const projectTitlesCache = {};

    const currentFiles = (state.screens || []).map(s => s.name);
    const currentTitles = (state.screens || []).map(s => s.title).filter(Boolean);
    projectScreensCache[sourceProject] = currentFiles;
    projectTitlesCache[sourceProject] = currentTitles;

    if (titleInput) {
        titleInput.value = _generateUniqueTitle(sourceTitle, currentTitles);
    }
    if (filenameInput) {
        filenameInput.value = _generateUniqueFilename(sourceFileName, currentFiles);
    }

    await _populateTargetProjectSelect(targetProjectSelect, sourceProject, state);

    const onTargetProjectChange = () => _syncCopyScreenTargetProject({
        targetProjectSelect, sourceProject, sourceFileName, sourceTitle,
        filenameInput, titleInput, noticeEl, moveGroup, isMoveCheck,
        projectScreensCache, projectTitlesCache
    });

    if (targetProjectSelect) {
        targetProjectSelect.onchange = onTargetProjectChange;
        onTargetProjectChange();
    }

    if (filenameInput) {
        filenameInput.oninput = () => {
            const val = filenameInput.value.trim();
            const targetProj = targetProjectSelect ? targetProjectSelect.value : sourceProject;
            const targetFiles = projectScreensCache[targetProj] || [];
            if (noticeEl) {
                if (targetFiles.includes(val)) {
                    noticeEl.innerText = '⚠️ 이미 존재하는 파일명입니다. 덮어쓰지 않도록 다른 파일명을 권장합니다.';
                    noticeEl.style.color = '#f87171';
                } else {
                    noticeEl.innerText = '* 사용 가능한 파일명입니다.';
                    noticeEl.style.color = '#4ade80';
                }
            }
        };
    }

    modal.classList.add('active');

    if (btnCancel) {
        btnCancel.onclick = () => {
            modal.classList.remove('active');
        };
    }

    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerText = '복사하기';
        btnSubmit.onclick = async () => {
            const targetProject = targetProjectSelect ? targetProjectSelect.value : sourceProject;
            const newTitle = titleInput ? titleInput.value.trim() : '';
            let newFilename = filenameInput ? filenameInput.value.trim() : '';
            const openAfter = openAfterCheck ? openAfterCheck.checked : true;
            const isMove = isMoveCheck ? isMoveCheck.checked : false;

            if (!targetProject) {
                alert('복사 대상 프로젝트를 선택해주세요.');
                return;
            }
            if (!newTitle) {
                alert('화면 명칭을 입력해주세요.');
                return;
            }
            if (!newFilename) {
                alert('새 파일명을 입력해주세요.');
                return;
            }
            if (!newFilename.toLowerCase().endsWith('.html')) {
                newFilename += '.html';
            }

            const targetFiles = projectScreensCache[targetProject] || [];
            if (targetFiles.includes(newFilename)) {
                const confirmed = confirm(`대상 프로젝트에 '${newFilename}' 파일이 이미 존재합니다.\n덮어쓰시겠습니까?`);
                if (!confirmed) return;
            }

            btnSubmit.disabled = true;
            btnSubmit.innerText = isMove ? '이동 중...' : '복사 중...';

            await window.executeCopyScreen({
                sourceProject,
                sourceFileName,
                targetProject,
                newFilename,
                newTitle,
                openAfter,
                isMove,
                modal,
                btnSubmit
            });
        };
    }
};

window.executeCopyScreen = async function(opts) {
    const {
        sourceProject,
        sourceFileName,
        targetProject,
        newFilename,
        newTitle,
        openAfter,
        isMove,
        modal,
        btnSubmit
    } = opts;

    const state = window.state || {};
    const isSameProject = sourceProject === targetProject;

    try {
        if (typeof window.showLoading === 'function') {
            window.showLoading(isMove ? `화면 이동 중... (${newFilename})` : `화면 복사 중... (${newFilename})`);
        }

        // 1. Fetch source screen HTML content
        let content = null;
        if (typeof fetchProjectFileContent === 'function') {
            content = await fetchProjectFileContent(sourceProject, sourceFileName);
        }
        if (!content) {
            throw new Error(`원본 화면(${sourceFileName}) 파일 내용을 불러오지 못했습니다.`);
        }

        // 2. Fetch target project's metadata
        let targetMeta = null;
        if (isSameProject && state.projectMetadata) {
            targetMeta = state.projectMetadata;
        } else if (typeof fetchProjectMetadata === 'function') {
            targetMeta = await fetchProjectMetadata(targetProject);
        } else {
            targetMeta = { title: targetProject, screens: {} };
        }
        if (!targetMeta.screens) targetMeta.screens = {};

        // 3. Upload content to target project
        const uploadSuccess = await uploadToProject(targetProject, newFilename, content);
        if (!uploadSuccess && window.location.protocol !== 'file:') {
            throw new Error(`대상 프로젝트(${targetProject})에 파일 업로드를 실패했습니다.`);
        }

        // 4. Clone and adapt screen metadata
        const sourceMetaScreens = (state.projectMetadata && state.projectMetadata.screens) || {};
        const sourceScreenMeta = sourceMetaScreens[sourceFileName] || {};

        const clonedScreenMeta = JSON.parse(JSON.stringify(sourceScreenMeta));
        clonedScreenMeta.title = newTitle;
        clonedScreenMeta.updatedAt = new Date().toISOString();

        targetMeta.screens[newFilename] = clonedScreenMeta;

        // 5. Update screenOrder in target metadata
        if (!targetMeta.screenOrder) {
            targetMeta.screenOrder = Object.keys(targetMeta.screens);
        } else {
            if (isSameProject) {
                const sourceIdx = targetMeta.screenOrder.indexOf(sourceFileName);
                if (sourceIdx !== -1) {
                    if (!targetMeta.screenOrder.includes(newFilename)) {
                        targetMeta.screenOrder.splice(sourceIdx + 1, 0, newFilename);
                    }
                } else {
                    if (!targetMeta.screenOrder.includes(newFilename)) {
                        targetMeta.screenOrder.push(newFilename);
                    }
                }
            } else {
                if (!targetMeta.screenOrder.includes(newFilename)) {
                    targetMeta.screenOrder.push(newFilename);
                }
            }
        }

        // 6. Save target project metadata
        if (typeof saveProjectMetadata === 'function') {
            await saveProjectMetadata(targetProject, targetMeta);
        }

        // 7. If isMove is true (and different project), delete source file
        if (isMove && !isSameProject) {
            const sourceSha = (state.screens && state.screens.find(s => s.name === sourceFileName) || {}).sha;
            if (typeof deleteFileFromGitHub === 'function') {
                await deleteFileFromGitHub(`${sourceProject}/${sourceFileName}`, sourceSha);
            }
            if (state.projectMetadata && state.projectMetadata.screens) {
                delete state.projectMetadata.screens[sourceFileName];
                if (state.projectMetadata.screenOrder) {
                    state.projectMetadata.screenOrder = state.projectMetadata.screenOrder.filter(n => n !== sourceFileName);
                }
                if (typeof saveProjectMetadata === 'function') {
                    await saveProjectMetadata(sourceProject, state.projectMetadata);
                }
            }
        }

        // 8. Cleanup and Navigation
        if (modal) modal.classList.remove('active');
        if (typeof window.hideLoading === 'function') window.hideLoading();

        if (openAfter) {
            window.location.href = `viewer.html?project=${encodeURIComponent(targetProject)}&file=${encodeURIComponent(newFilename)}`;
        } else {
            if (isSameProject) {
                window.location.reload();
            } else {
                if (window.Notification && typeof window.Notification.alert === 'function') {
                    window.Notification.alert(
                        `'${newFilename}' 화면이 [${targetProject}] 프로젝트로 성공적으로 ${isMove ? '이동' : '복사'}되었습니다.`,
                        "완료",
                        "info"
                    );
                } else {
                    alert(`'${newFilename}' 화면이 [${targetProject}] 프로젝트로 성공적으로 ${isMove ? '이동' : '복사'}되었습니다.`);
                }
            }
        }

    } catch (err) {
        console.error("[CopyScreen] executeCopyScreen error:", err);
        if (typeof window.hideLoading === 'function') window.hideLoading();
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = isMove ? '이동하기' : '복사하기';
        }
        if (window.Notification && typeof window.Notification.alert === 'function') {
            window.Notification.alert(err.message || "화면 복사 중 오류가 발생했습니다.", "오류", "error");
        } else {
            alert(err.message || "화면 복사 중 오류가 발생했습니다.");
        }
    }
};

window.handleDeleteScreen = async function (name, sha) {
    try {
        if (typeof state !== 'undefined' && state.isReadOnly) return window.showAuthModal?.();

        let confirmed = false;
        const dialogUI = window.NotificationUI || window.AppDialog || (window.Notification && typeof window.Notification.confirm === 'function' ? window.Notification : null);
        if (dialogUI && typeof dialogUI.confirm === 'function') {
            confirmed = await dialogUI.confirm(
                `'${name}' 스크린을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
                "스크린 삭제",
                "warning"
            );
        } else {
            confirmed = window.confirm(`'${name}' 스크린을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
        }
        if (!confirmed) return;

        if (typeof window.showLoading === 'function') window.showLoading("Deleting: " + name);

        const deleteFn = window.deleteFileFromGitHub || (typeof deleteFileFromGitHub === 'function' ? deleteFileFromGitHub : null);
        let success = deleteFn ? await deleteFn(`${state.currentProject}/${name}`, sha) : false;
        if (!success && window.location.protocol === 'file:') {
            success = true;
        }

        if (success) {
            state.screens = state.screens.filter(s => s.name !== name);
            if (state.projectMetadata && state.projectMetadata.screens) {
                delete state.projectMetadata.screens[name];
            }
            if (state.projectMetadata && state.projectMetadata.screenOrder) {
                state.projectMetadata.screenOrder = state.projectMetadata.screenOrder.filter(n => n !== name);
            }
            const saveMetaFn = window.saveProjectMetadata || (typeof saveProjectMetadata === 'function' ? saveProjectMetadata : null);
            if (saveMetaFn) {
                await saveMetaFn(state.currentProject, state.projectMetadata, () => { });
            }

            if (state.activeFile && state.activeFile.name === name) {
                location.href = `viewer.html?project=${state.currentProject}`;
            } else {
                location.reload();
            }
        } else {
            if (typeof window.hideLoading === 'function') window.hideLoading();
            const alertUI = window.NotificationUI || window.AppDialog || (window.Notification && typeof window.Notification.alert === 'function' ? window.Notification : null);
            if (alertUI && typeof alertUI.alert === 'function') {
                alertUI.alert("삭제 실패", "오류", "error");
            } else {
                alert("삭제 실패");
            }
        }
    } catch (err) {
        console.error("[ScreenManager] handleDeleteScreen error:", err);
        if (typeof window.hideLoading === 'function') window.hideLoading();
        const alertUI = window.NotificationUI || window.AppDialog || (window.Notification && typeof window.Notification.alert === 'function' ? window.Notification : null);
        if (alertUI && typeof alertUI.alert === 'function') {
            alertUI.alert(err.message || "삭제 중 오류가 발생했습니다.", "오류", "error");
        } else {
            alert(err.message || "삭제 중 오류가 발생했습니다.");
        }
    }
};

    window.ScreenManager = Object.assign(window.ScreenManager || {}, {
        navigateByOffset: window.navigateScreenByOffset,
        handleDeleteScreen: window.handleDeleteScreen,
        isBlockingOverlayOpen: window.isBlockingOverlayOpen
    });

    // Note: Project Revision History Modal & Controller is fully modularized and owned by assets/vctrl_revision_history.js (SSOT).

})();
