/**
 * assets/vctrl_screen_manager.js
 * Domain Module: Screen Navigation, Ordering, Duplication, Metadata Editing, and Revision History.
 */
(function() {
    console.log("[VCTRL SCREEN MANAGER] Module loaded.");

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
    if (indexEl) indexEl.innerText = `${itemIndex}. ${cat.code}`;

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
            if (typeof window.handleDeleteScreen === 'function') window.handleDeleteScreen(screenData.name, screenData.sha);
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
        item.title = `${itemIndex}. [${cat.code}] ${displayTitle} (${s.name})`;

        item.innerHTML = `
            <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                <!-- Collapsed Mode Single Crisp Chip: e.g. [1. CO], [2. UI] -->
                <span class="screen-collapsed-chip ${cat.class}">
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
                if (typeof window.handleDeleteScreen === 'function') window.handleDeleteScreen(s.name, s.sha);
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
};

window.updateActiveScreenInUI = function(activeName) {
    document.querySelectorAll('.screen-item').forEach(item => {
        const screenName = item.dataset.screenName;
        const nameTitle = item.querySelector('.screen-name')?.title || '';
        const isActive = (screenName && screenName === activeName) || nameTitle.includes(activeName);
        item.classList.toggle('active', isActive);
        if (isActive) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
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
    if (screenType === 'admin-nbos' || screenType === 'admin-onesphere') {
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
            
            if (typeof window.saveProjectMetadata === 'function') {
                const success = await window.saveProjectMetadata(state.currentProject, state.projectMetadata);
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

    if (titleInput) {
        titleInput.value = `${sourceTitle} (복사본)`;
    }

    const generateUniqueFilename = (baseName, existingFiles) => {
        const cleanName = baseName.replace(/\.html$/i, '');
        const rootName = cleanName.replace(/_copy\d*$/i, '');
        let candidate = `${rootName}_copy.html`;
        let counter = 2;
        while (existingFiles && existingFiles.includes(candidate)) {
            candidate = `${rootName}_copy${counter}.html`;
            counter++;
        }
        return candidate;
    };

    const projectScreensCache = {};

    if (targetProjectSelect) {
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

            const currentFiles = (state.screens || []).map(s => s.name);
            projectScreensCache[sourceProject] = currentFiles;

            if (filenameInput) {
                filenameInput.value = generateUniqueFilename(sourceFileName, currentFiles);
            }

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
            const currentFiles = (state.screens || []).map(s => s.name);
            projectScreensCache[sourceProject] = currentFiles;
            if (filenameInput) {
                filenameInput.value = generateUniqueFilename(sourceFileName, currentFiles);
            }
        }
    }

    const onTargetProjectChange = async () => {
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
        if (!targetFiles) {
            try {
                if (noticeEl) {
                    noticeEl.innerText = '대상 프로젝트 파일 목록 확인 중...';
                    noticeEl.style.color = '#94a3b8';
                }
                const targetMeta = typeof fetchProjectMetadata === 'function' ? await fetchProjectMetadata(targetProj) : null;
                targetFiles = targetMeta && targetMeta.screens ? Object.keys(targetMeta.screens) : [];
                projectScreensCache[targetProj] = targetFiles;
            } catch (e) {
                targetFiles = [];
            }
        }

        if (filenameInput) {
            const currentVal = filenameInput.value.trim();
            if (!currentVal || targetFiles.includes(currentVal)) {
                filenameInput.value = generateUniqueFilename(sourceFileName, targetFiles);
            }
        }
        if (noticeEl) {
            noticeEl.innerText = `* 대상 프로젝트: [${targetProj}] (총 ${targetFiles.length}개 화면)`;
            noticeEl.style.color = '#94a3b8';
        }
    };

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

    // --- Revision History Modal & Interactive Controller ---
let _currentHistoryList = [];
let _editingHistoryIndex = null;
let _isCreatingNewHistory = false;

function _escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _escapeHtmlAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _getFormattedKSTNow() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

window.renderHistoryPopup = function(history) {
    if (Array.isArray(history)) {
        _currentHistoryList = history;
    }
    const listContainer = document.getElementById('history-popup-list');
    if (!listContainer) return;

    if (!_currentHistoryList || _currentHistoryList.length === 0) {
        listContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px; text-align: center; color: var(--text-secondary); width: 100%;">
                <span class="material-icons-outlined" style="font-size: 40px; margin-bottom: 12px; opacity: 0.35;">history</span>
                <div style="font-size: 15px; font-weight: 500; margin-bottom: 6px;">기록된 재개정 이력이 없습니다.</div>
                <div style="font-size: 12.5px; opacity: 0.7;">우측 상단의 '+ 이력 추가' 버튼을 눌러 새 이력을 등록할 수 있습니다.</div>
            </div>
        `;
    } else {
        listContainer.innerHTML = _currentHistoryList.map((item, index) => {
            const isEditing = (_editingHistoryIndex === index);

            if (isEditing) {
                // Inline Edit Form Card
                const verVal = _escapeHtmlAttr(String(item.version || '0.1').replace(/^v/i, ''));
                const dateVal = _escapeHtmlAttr(item.date || _getFormattedKSTNow());
                const msgVal = _escapeHtml(item.message || '');
                const assigneeVal = _escapeHtmlAttr(item.assignee || '');
                const devVal = _escapeHtmlAttr(item.developer || '');

                return `
                    <div class="history-edit-form" id="history-edit-card-${index}">
                        <div class="history-form-row">
                            <div class="history-form-group" style="flex: 0 0 130px; max-width: 130px;">
                                <div class="history-form-header">
                                    <label class="history-form-label">버전 (Version)</label>
                                </div>
                                <input type="text" id="hist-edit-ver-${index}" class="history-form-input" value="${verVal}" placeholder="예: 0.3" />
                            </div>
                            <div class="history-form-group" style="flex: 1;">
                                <div class="history-form-header">
                                    <label class="history-form-label">일시 (Date / KST)</label>
                                    <button type="button" onclick="window.setHistoryCurrentTime(${index})" class="history-action-btn" title="현재 시각으로 자동 갱신">현재 시각</button>
                                </div>
                                <input type="text" id="hist-edit-date-${index}" class="history-form-input" value="${dateVal}" placeholder="YYYY-MM-DD HH:mm:ss" />
                            </div>
                        </div>

                        <div class="history-form-group">
                            <div class="history-form-header">
                                <label class="history-form-label">변경 사유 및 상세 내용 (Message)</label>
                            </div>
                            <textarea id="hist-edit-msg-${index}" class="history-form-textarea" placeholder="상세 변경 사유를 입력해주세요...">${msgVal}</textarea>
                        </div>

                        <div class="history-form-row">
                            <div class="history-form-group" style="flex: 1;">
                                <div class="history-form-header">
                                    <label class="history-form-label">담당 기획자 (Assignee)</label>
                                </div>
                                <input type="text" id="hist-edit-assignee-${index}" class="history-form-input" value="${assigneeVal}" placeholder="기획 담당자" />
                            </div>
                            <div class="history-form-group" style="flex: 1;">
                                <div class="history-form-header">
                                    <label class="history-form-label">담당 개발자 (Developer)</label>
                                </div>
                                <input type="text" id="hist-edit-dev-${index}" class="history-form-input" value="${devVal}" placeholder="개발 담당자" />
                            </div>
                        </div>

                        <div class="history-form-actions">
                            <button type="button" onclick="window.cancelHistoryEdit(${index})" class="history-btn-cancel">
                                <span class="material-icons-outlined" style="font-size:15px;">close</span> 취소
                            </button>
                            <button type="button" onclick="window.saveHistoryEdit(${index})" class="history-btn-save">
                                <span class="material-icons-outlined" style="font-size:15px;">check</span> 저장 완료
                            </button>
                        </div>
                    </div>
                `;
            }

            // Normal Wide Display Card
            const verDisplay = _escapeHtml(String(item.version || '0.1').replace(/^v/i, ''));
            const dateDisplay = _escapeHtml(item.date || '-');
            const msgDisplay = _escapeHtml(item.message || '-');
            const assigneeDisplay = _escapeHtml(item.assignee || '');
            const devDisplay = _escapeHtml(item.developer || '');
            const fileDisplay = _escapeHtml(item.file || '');

            return `
                <div class="history-item-card" id="history-item-${index}">
                    <div class="history-card-header">
                        <div class="history-card-header-left">
                            <span class="history-version-badge">v${verDisplay}</span>
                            <span class="history-date-txt">${dateDisplay}</span>
                        </div>
                        <div class="history-card-actions">
                            <button type="button" class="history-action-btn edit" onclick="window.startHistoryEdit(${index})" title="이력 내용 수정">
                                <span class="material-icons-outlined">edit</span> 수정
                            </button>
                            <button type="button" class="history-action-btn delete" onclick="window.deleteHistoryItem(${index})" title="이력 삭제">
                                <span class="material-icons-outlined">delete_outline</span> 삭제
                            </button>
                        </div>
                    </div>

                    <div class="history-message-txt">${msgDisplay}</div>

                    <div class="history-meta-row">
                        ${assigneeDisplay ? `<span class="history-meta-chip"><span class="material-icons-outlined" style="font-size:13px; color:#38bdf8;">person</span> 담당: ${assigneeDisplay}</span>` : ''}
                        ${devDisplay ? `<span class="history-meta-chip"><span class="material-icons-outlined" style="font-size:13px; color:#a78bfa;">code</span> 개발: ${devDisplay}</span>` : ''}
                        ${fileDisplay && fileDisplay !== 'n/a' ? `<span class="history-meta-chip"><span class="material-icons-outlined" style="font-size:13px; color:#94a3b8;">description</span> ${fileDisplay}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.offsetHeight; // Reflow
        modal.style.opacity = '1';

        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                if (_editingHistoryIndex !== null) {
                    window.cancelHistoryEdit(_editingHistoryIndex);
                } else {
                    window.closeHistoryPopup();
                }
                window.removeEventListener('keydown', closeOnEsc);
            }
        };
        window.addEventListener('keydown', closeOnEsc);
    }
};

window.startHistoryEdit = function(index) {
    _editingHistoryIndex = index;
    window.renderHistoryPopup();
    setTimeout(() => {
        const textarea = document.getElementById(`hist-edit-msg-${index}`);
        if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
    }, 50);
};

window.cancelHistoryEdit = function(index) {
    if (_isCreatingNewHistory && index === 0) {
        _currentHistoryList.shift();
        _isCreatingNewHistory = false;
    }
    _editingHistoryIndex = null;
    window.renderHistoryPopup();
};

window.setHistoryCurrentTime = function(index) {
    const dateInput = document.getElementById(`hist-edit-date-${index}`);
    if (dateInput) {
        dateInput.value = _getFormattedKSTNow();
    }
};

window.saveHistoryEdit = async function(index) {
    const verInput = document.getElementById(`hist-edit-ver-${index}`);
    const dateInput = document.getElementById(`hist-edit-date-${index}`);
    const msgInput = document.getElementById(`hist-edit-msg-${index}`);
    const assigneeInput = document.getElementById(`hist-edit-assignee-${index}`);
    const devInput = document.getElementById(`hist-edit-dev-${index}`);

    const newVer = verInput ? verInput.value.trim() : '';
    const newDate = dateInput ? dateInput.value.trim() : '';
    const newMsg = msgInput ? msgInput.value.trim() : '';
    const newAssignee = assigneeInput ? assigneeInput.value.trim() : '';
    const newDev = devInput ? devInput.value.trim() : '';

    if (!newMsg) {
        if (window.Notification && typeof window.Notification.alert === 'function') {
            window.Notification.alert("상세 변경 사유를 입력해주세요.", "알림", "warning");
        } else if (typeof window.showToast === 'function') {
            window.showToast("상세 변경 사유를 입력해주세요.", "warning");
        } else {
            alert("상세 변경 사유를 입력해주세요.");
        }
        if (msgInput) msgInput.focus();
        return;
    }

    const currentProj = (typeof state !== 'undefined' && state && state.currentProject) ? state.currentProject : null;
    if (!currentProj) {
        alert("현재 열려 있는 프로젝트 정보를 찾을 수 없습니다.");
        return;
    }

    if (typeof window.showLoading === 'function') {
        window.showLoading("이력 저장 중...");
    }

    try {
        if (!_currentHistoryList[index]) {
            _currentHistoryList[index] = {};
        }

        _currentHistoryList[index].version = newVer || '0.1';
        _currentHistoryList[index].date = newDate || _getFormattedKSTNow();
        _currentHistoryList[index].message = newMsg;
        _currentHistoryList[index].assignee = newAssignee;
        _currentHistoryList[index].developer = newDev;
        if (!_currentHistoryList[index].file) {
            _currentHistoryList[index].file = (typeof state !== 'undefined' && state.activeFile) ? state.activeFile.name : 'metadata.json';
        }

        if (typeof window.saveProjectHistory === 'function') {
            await window.saveProjectHistory(currentProj, _currentHistoryList, null);
        } else {
            throw new Error("saveProjectHistory 함수를 찾을 수 없습니다.");
        }

        // 최신 이력(index === 0) 수정 시 state.projectMetadata 및 상단 메타 툴바 동기화
        if (index === 0 && typeof state !== 'undefined' && state.projectMetadata) {
            const parsedVer = parseFloat(newVer);
            if (!isNaN(parsedVer)) {
                state.projectMetadata.version = parsedVer;
            }
            if (newAssignee) state.projectMetadata.assignee = newAssignee;
            if (newDev) state.projectMetadata.developer = newDev;

            const metaAssigneeEl = document.getElementById('viewer-meta-assignee');
            if (metaAssigneeEl) metaAssigneeEl.value = newAssignee;
            const metaDevEl = document.getElementById('viewer-meta-developer');
            if (metaDevEl) metaDevEl.value = newDev;
        }

        _editingHistoryIndex = null;
        _isCreatingNewHistory = false;

        if (typeof window.hideLoading === 'function') window.hideLoading();

        if (typeof window.showToast === 'function') {
            window.showToast("재개정 이력이 성공적으로 저장되었습니다.", "success");
        }

        window.renderHistoryPopup();
    } catch (err) {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        console.error("[History] Failed to save history entry:", err);
        if (window.Notification && typeof window.Notification.alert === 'function') {
            window.Notification.alert("이력 저장 중 오류가 발생했습니다: " + err.message, "오류", "error");
        } else if (typeof window.showToast === 'function') {
            window.showToast("이력 저장 중 오류가 발생했습니다.", "error");
        } else {
            alert("이력 저장 중 오류가 발생했습니다.");
        }
    }
};

window.deleteHistoryItem = async function(index) {
    const item = _currentHistoryList[index];
    if (!item) return;

    const verStr = item.version ? `v${item.version}` : '해당';
    const confirmMsg = `${verStr} 재개정 이력을 정말 삭제하시겠습니까?\n사유: ${item.message || '-'}`;

    let isConfirmed = false;
    if (window.Notification && typeof window.Notification.confirm === 'function') {
        isConfirmed = await window.Notification.confirm(confirmMsg, "이력 삭제 확인");
    } else {
        isConfirmed = window.confirm(confirmMsg);
    }

    if (!isConfirmed) return;

    const currentProj = (typeof state !== 'undefined' && state && state.currentProject) ? state.currentProject : null;
    if (!currentProj) {
        alert("현재 프로젝트를 찾을 수 없습니다.");
        return;
    }

    if (typeof window.showLoading === 'function') {
        window.showLoading("이력 삭제 중...");
    }

    try {
        _currentHistoryList.splice(index, 1);

        if (typeof window.saveProjectHistory === 'function') {
            await window.saveProjectHistory(currentProj, _currentHistoryList, null);
        }

        // 최신 이력(index === 0) 삭제 시 state.projectMetadata 및 상단 메타 툴바 동기화
        if (index === 0 && typeof state !== 'undefined' && state.projectMetadata) {
            if (_currentHistoryList.length > 0) {
                const newLatest = _currentHistoryList[0];
                const parsedVer = parseFloat(String(newLatest.version).replace(/[^0-9.]/g, ''));
                if (!isNaN(parsedVer)) {
                    state.projectMetadata.version = parsedVer;
                }
                if (newLatest.assignee) {
                    state.projectMetadata.assignee = newLatest.assignee;
                    const metaAssigneeEl = document.getElementById('viewer-meta-assignee');
                    if (metaAssigneeEl) metaAssigneeEl.value = newLatest.assignee;
                }
                if (newLatest.developer) {
                    state.projectMetadata.developer = newLatest.developer;
                    const metaDevEl = document.getElementById('viewer-meta-developer');
                    if (metaDevEl) metaDevEl.value = newLatest.developer;
                }
            }
        }

        if (_editingHistoryIndex === index) {
            _editingHistoryIndex = null;
        } else if (_editingHistoryIndex !== null && _editingHistoryIndex > index) {
            _editingHistoryIndex--;
        }

        if (typeof window.hideLoading === 'function') window.hideLoading();

        if (typeof window.showToast === 'function') {
            window.showToast("재개정 이력이 삭제되었습니다.", "success");
        }

        window.renderHistoryPopup();
    } catch (err) {
        if (typeof window.hideLoading === 'function') window.hideLoading();
        console.error("[History] Failed to delete history entry:", err);
        if (typeof window.showToast === 'function') {
            window.showToast("이력 삭제 중 오류가 발생했습니다.", "error");
        } else {
            alert("이력 삭제 중 오류가 발생했습니다.");
        }
    }
};

window.addNewHistoryEntry = function() {
    if (_editingHistoryIndex !== null) {
        window.cancelHistoryEdit(_editingHistoryIndex);
    }

    let nextVer = '0.1';
    if (_currentHistoryList.length > 0 && _currentHistoryList[0].version !== undefined) {
        const parsed = parseFloat(String(_currentHistoryList[0].version).replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) {
            nextVer = (parsed + 0.1).toFixed(1);
        }
    }

    const defaultAssignee = (typeof state !== 'undefined' && state && state.projectMetadata && state.projectMetadata.assignee)
        ? state.projectMetadata.assignee
        : (document.getElementById('viewer-meta-assignee')?.value || '');
    const defaultDev = (typeof state !== 'undefined' && state && state.projectMetadata && state.projectMetadata.developer)
        ? state.projectMetadata.developer
        : (document.getElementById('viewer-meta-developer')?.value || '');
    const defaultFile = (typeof state !== 'undefined' && state && state.activeFile && state.activeFile.name)
        ? state.activeFile.name
        : 'metadata.json';

    const newEntry = {
        version: nextVer,
        date: _getFormattedKSTNow(),
        message: '',
        assignee: defaultAssignee,
        developer: defaultDev,
        file: defaultFile
    };

    _isCreatingNewHistory = true;
    _currentHistoryList.unshift(newEntry);
    _editingHistoryIndex = 0;

    window.renderHistoryPopup();

    setTimeout(() => {
        const textarea = document.getElementById(`hist-edit-msg-0`);
        if (textarea) textarea.focus();
    }, 60);
};

window.closeHistoryPopup = function() {
    if (_isCreatingNewHistory && _editingHistoryIndex === 0) {
        _currentHistoryList.shift();
        _isCreatingNewHistory = false;
    }
    _editingHistoryIndex = null;
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
};

async function ensureHistoryModal() {
    let historyModal = document.getElementById('history-modal');
    if (!historyModal) {
        try {
            let html = '';
            try {
                if (window.LF_TEMPLATES && window.LF_TEMPLATES['history_modal.html']) {
                    html = window.LF_TEMPLATES['history_modal.html'];
                } else if (window.location.protocol !== 'file:') {
                    const response = await fetch('assets/templates/history_modal.html');
                    if (response.ok) {
                        html = await response.text();
                    }
                }
            } catch (fetchErr) {
                console.warn("fetch history_modal.html failed, using inline template fallback:", fetchErr);
            }

            if (!html) {
                html = `
                <div id="history-modal" class="modal-overlay history-dialog-overlay">
                    <div class="dialog-card history-dialog-card">
                        <div class="history-dialog-header">
                            <div class="history-dialog-title-group">
                                <span class="material-icons-outlined history-dialog-title-icon">history</span>
                                <h3 class="history-dialog-title">프로젝트 재개정 이력</h3>
                            </div>
                            <div class="history-header-actions">
                                <button id="btn-add-history" class="history-btn-add" title="새 재개정 이력 직접 추가"><span class="material-icons-outlined" style="font-size:16px;">add</span> 이력 추가</button>
                                <button id="btn-close-history" class="history-dialog-close" title="닫기"><span class="material-icons-outlined">close</span></button>
                            </div>
                        </div>
                        <div id="history-popup-list" class="history-dialog-list">
                            <!-- Dynamic history entries here -->
                        </div>
                    </div>
                </div>`;
            }
            document.body.insertAdjacentHTML('beforeend', html);
            historyModal = document.getElementById('history-modal');
        } catch (e) {
            console.error("Failed to load history modal dynamically:", e);
            return false;
        }
    }

    if (historyModal) {
        const btnCloseHistory = document.getElementById('btn-close-history');
        if (btnCloseHistory) {
            btnCloseHistory.onclick = () => {
                window.closeHistoryPopup();
            };
        }
        const btnAddHistory = document.getElementById('btn-add-history');
        if (btnAddHistory) {
            btnAddHistory.onclick = () => {
                window.addNewHistoryEntry();
            };
        }
        historyModal.onclick = (e) => {
            if (e.target === historyModal) {
                window.closeHistoryPopup();
            }
        };
        return true;
    }
    return false;
}

const btnShowHistory = document.getElementById('btn-show-history');
if (btnShowHistory) {
    btnShowHistory.onclick = async () => {
        if (typeof window.showLoading === 'function') window.showLoading("이력 불러오는 중...");
        try {
            const loaded = await ensureHistoryModal();
            if (!loaded) throw new Error("Failed to initialize history modal");

            const currentProj = (typeof state !== 'undefined' && state && state.currentProject) ? state.currentProject : null;
            const historyList = (typeof window.fetchProjectHistory === 'function' && currentProj)
                ? await window.fetchProjectHistory(currentProj)
                : [];
            if (typeof window.hideLoading === 'function') window.hideLoading();
            _editingHistoryIndex = null;
            _isCreatingNewHistory = false;
            window.renderHistoryPopup(historyList);
        } catch (e) {
            if (typeof window.hideLoading === 'function') window.hideLoading();
            console.error("Failed to load history:", e);
            if (window.Notification && typeof window.Notification.alert === 'function') {
                window.Notification.alert("이력을 불러오는 중 오류가 발생했습니다.", "오류", "error");
            } else if (typeof window.showToast === 'function') {
                window.showToast("이력을 불러오는 중 오류가 발생했습니다.", "error");
            } else {
                alert("이력을 불러오는 중 오류가 발생했습니다.");
            }
        }
    };
}


})();
