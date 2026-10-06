/**
 * assets/vctrl_revision_history.js
 * Domain Module: Project Revision History Modal & Interactive Controller.
 * Decoupled from vctrl_screen_manager.js for clean modularity and single responsibility.
 */

(function() {
    console.log("%c [VCTRL REVISION HISTORY] Module loaded ", "background: #8b5cf6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

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
        return (typeof window.getFormattedKST === 'function') 
            ? window.getFormattedKST() 
            : new Date().toISOString().slice(0, 19).replace('T', ' ');
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

    window.ensureHistoryModal = async function() {
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
    };

    // Auto-bind history button on DOM load or immediate check
    function bindHistoryButton() {
        const btnShowHistory = document.getElementById('btn-show-history');
        if (btnShowHistory && !btnShowHistory._historyBound) {
            btnShowHistory._historyBound = true;
            btnShowHistory.onclick = async () => {
                if (typeof window.showLoading === 'function') window.showLoading("이력 불러오는 중...");
                try {
                    const loaded = await window.ensureHistoryModal();
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindHistoryButton);
    } else {
        bindHistoryButton();
    }

})();
