/**
 * assets/vctrl_storage.js
 * Storage Engine (Parent Side)
 * Manages screen serialization, ScreenSanitizer DOM cleanup, revision history auto-increment,
 * and remote GitHub API commits.
 */

(function () {
    'use strict';
    console.log("%c [VCTRL STORAGE] Initializing Storage Engine... ", "background: #2563eb; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    /**
     * Serializes the active iframe DOM into clean, production-ready HTML.
     */
    async function getIframeHTML() {
        const isFileProtocol = window.location.protocol === 'file:';
        const DOM = window.DOM || {};
        const activeIframe = DOM.iframe || document.getElementById('main-iframe') || document.getElementById('screen-iframe');

        if (!isFileProtocol) {
            try {
                if (activeIframe && activeIframe.contentDocument) {
                    const doc = activeIframe.contentDocument;

                    // [Form Value SSOT Sync] Commit all live form input values to attributes before clone
                    doc.querySelectorAll('input').forEach(inp => {
                        if (inp.type === 'checkbox' || inp.type === 'radio') {
                            if (inp.checked) inp.setAttribute('checked', '');
                            else inp.removeAttribute('checked');
                        } else {
                            inp.setAttribute('value', inp.value);
                        }
                    });
                    doc.querySelectorAll('textarea').forEach(ta => {
                        ta.textContent = ta.value;
                    });
                    doc.querySelectorAll('select').forEach(sel => {
                        Array.from(sel.options).forEach(opt => {
                            if (opt.selected) opt.setAttribute('selected', '');
                            else opt.removeAttribute('selected');
                        });
                    });

                    const clone = doc.documentElement.cloneNode(true);
                    if (window.ScreenSanitizer && typeof window.ScreenSanitizer.cleanDOM === 'function') {
                        window.ScreenSanitizer.cleanDOM(clone);
                    }
                    return "<!DOCTYPE html>\n" + clone.outerHTML;
                }
            } catch (e) {
                console.warn("[Security] Direct iframe access failed, switching to message fallback.", e);
            }
        }

        return new Promise((resolve) => {
            const handler = (e) => {
                if (e.data && e.data.type === 'LF_SAVE_CONTENT_RESPONSE') {
                    window.removeEventListener('message', handler);
                    resolve(e.data.html);
                }
            };
            window.addEventListener('message', handler);
            if (activeIframe && activeIframe.contentWindow) {
                activeIframe.contentWindow.postMessage({ type: 'LF_REQUEST_SAVE_CONTENT' }, '*');
            } else {
                window.removeEventListener('message', handler);
                resolve(null);
            }
            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve(null);
            }, 2500);
        });
    }

    /**
     * Executes universal project and screen saving pipeline.
     * @param {string} explicitReason Optional revision note.
     */
    async function handleGlobalSave(explicitReason = "") {
        const btn = document.getElementById('btn-global-save');
        if (!btn || btn.disabled) return;

        const state = window.state || {};
        const DOM = window.DOM || {};

        if (state.isReadOnly) return window.showAuthModal?.();

        // 1. Revision message handling (Default "" for silent fast save; history is managed via dedicated modal)
        let changeMsg = typeof explicitReason === 'string' ? explicitReason.trim() : "";

        const overlay = document.getElementById('save-overlay');
        const originalHTML = btn.innerHTML;

        // Save Overlay Lifecycle Controllers
        const showSaveOverlay = () => {
            if (!overlay) return;
            overlay.style.display = 'flex';
            requestAnimationFrame(() => {
                overlay.classList.add('active');
                overlay.style.opacity = '1';
                overlay.style.visibility = 'visible';
                overlay.style.pointerEvents = 'all';
            });
        };

        const hideSaveOverlay = () => {
            if (!overlay) return;
            overlay.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                if (!overlay.classList.contains('active')) {
                    overlay.style.display = 'none';
                }
            }, 250);
        };

        // 15-second safety failsafe timer to prevent infinite lock
        let saveTimeoutId = setTimeout(() => {
            console.warn("[Save] Operation exceeded 15s timeout limit. Forcing save overlay dismissal.");
            hideSaveOverlay();
            if (btn) {
                btn.innerHTML = originalHTML;
                btn.style.removeProperty('background');
                btn.style.position = '';
                btn.style.overflow = '';
                btn.disabled = false;
            }
            if (typeof window.showToast === 'function') {
                window.showToast("저장 응답 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.", "warning");
            }
        }, 15000);

        try {
            if (state.isEditing && typeof window.closeActiveEditor === 'function') {
                window.closeActiveEditor(true);
            }

            // Show premium glassmorphic lock overlay (Centered)
            showSaveOverlay();

            btn.disabled = true;
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.innerHTML = '<span class="material-icons-outlined" style="font-size:15px;">save</span> 저장 중..<span id="save-loading-bar" style="position:absolute; left:0; bottom:0; height:3px; width:0%; background:rgba(255,255,255,0.9); border-radius:0 0 8px 8px; transition:width 2.5s cubic-bezier(0.4,0,0.2,1);"></span>';

            requestAnimationFrame(() => {
                const bar = document.getElementById('save-loading-bar');
                if (bar) bar.style.width = '90%';
            });

            // 2. Format DateTime KST (Unified with window.getFormattedKST SSOT)
            const updatedTimeStr = typeof window.getFormattedKST === 'function' 
                ? window.getFormattedKST() 
                : new Date().toISOString().slice(0, 19).replace('T', ' ');

            const projectMeta = {
                title: document.getElementById('viewer-meta-title')?.value || '',
                assignee: document.getElementById('viewer-meta-assignee')?.value || '',
                developer: document.getElementById('viewer-meta-developer')?.value || '',
                period: document.getElementById('viewer-meta-period')?.value || '',
                figmaUrl: state.projectMetadata?.figmaUrl || '',
                notionUrl: state.projectMetadata?.notionUrl || '',
                updated: updatedTimeStr
            };

            let htmlContent = await getIframeHTML();

            // 3. Determine Project Version & Revision auto-increment
            let historyList = [];
            if (typeof window.fetchProjectHistory === 'function' && state.currentProject) {
                try {
                    historyList = await window.fetchProjectHistory(state.currentProject);
                } catch (err) {
                    console.warn("[Save] Failed to fetch project history for version calculation:", err);
                }
            }

            let currentLatestVer = 0.1;
            if (state.projectMetadata && state.projectMetadata.version !== undefined) {
                currentLatestVer = parseFloat(state.projectMetadata.version) || 0.1;
            }
            if (Array.isArray(historyList) && historyList.length > 0 && historyList[0].version !== undefined) {
                const parsedHistoryVer = parseFloat(String(historyList[0].version).replace(/[^0-9.]/g, ''));
                if (!isNaN(parsedHistoryVer) && parsedHistoryVer > 0) {
                    currentLatestVer = Math.max(currentLatestVer, parsedHistoryVer);
                }
            }

            let nextVer = currentLatestVer;
            if (changeMsg) {
                // 새 재개정 사유가 입력된 경우에만 프로젝트 버전 +0.1 증가
                nextVer = parseFloat((currentLatestVer + 0.1).toFixed(1));
            }
            projectMeta.version = nextVer;

            const activeFileName = state.activeFile ? state.activeFile.name : null;
            const isCoverScreenSave = activeFileName && ((state.projectMetadata && state.projectMetadata.screens && state.projectMetadata.screens[activeFileName]?.type === 'cover') || (htmlContent && (htmlContent.includes('cover-version') || htmlContent.includes('cover-jira-id'))));

            if (htmlContent && isCoverScreenSave) {
                // Sync all cover metadata with unified nextVer
                if (typeof window.syncCoverMetadata === 'function') {
                    htmlContent = window.syncCoverMetadata(htmlContent, Object.assign({}, state.projectMetadata, projectMeta, { version: nextVer }), false, activeFileName);
                }
            } else if (htmlContent && htmlContent.includes('cover-jira-id')) {
                const jiraValue = projectMeta.jira || '-';
                htmlContent = htmlContent.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, '$1' + jiraValue + '$2');
            }

            const updateFn = window.updateScreenMetadata;
            if (typeof updateFn !== 'function') {
                throw new Error("updateScreenMetadata 함수를 찾을 수 없습니다.");
            }

            const success = await updateFn(state.currentProject, activeFileName, {
                projectMeta,
                htmlContent,
                version: nextVer,
                description: state.activeFile ? state.activeFile.meta.description : [],
                existingMetadata: state.projectMetadata
            }, () => { });

            const bar = document.getElementById('save-loading-bar');
            if (bar) { bar.style.transition = 'width 0.3s ease'; bar.style.width = '100%'; }

            await new Promise(r => setTimeout(r, 300));

            // Hide overlay smoothly on completion
            hideSaveOverlay();

            if (success) {
                if (typeof window.markAsClean === 'function') window.markAsClean();
                Object.assign(state.projectMetadata, projectMeta);
                state.projectMetadata.version = nextVer;
                if (activeFileName && state.projectMetadata.screens && state.projectMetadata.screens[activeFileName]) {
                    state.projectMetadata.screens[activeFileName].version = nextVer;
                }
                const fileNameEl = (DOM && DOM.fileName) || document.getElementById('file-name');
                if (projectMeta.title && fileNameEl) fileNameEl.innerText = projectMeta.title;

                // 실시간 좌측 하단 UI 업데이트
                const updatedTxt = document.getElementById('meta-updated-txt');
                if (updatedTxt) {
                    updatedTxt.innerText = '최종 업데이트: ' + updatedTimeStr;
                }

                if (typeof window.showToast === 'function') {
                    window.showToast("저장이 성공적으로 완료되었습니다.", "success");
                }

                // history.json 이력 저장 처리
                try {
                    if (changeMsg) {
                        const historyEntry = {
                            date: updatedTimeStr,
                            file: activeFileName || 'n/a',
                            version: nextVer,
                            assignee: projectMeta.assignee,
                            developer: projectMeta.developer,
                            message: changeMsg
                        };

                        if (typeof window.saveProjectHistory === 'function') {
                            historyList.unshift(historyEntry); // 최신이 가장 위로
                            await window.saveProjectHistory(state.currentProject, historyList, null);
                        }
                    } else {
                        console.log("[Save] Save completed without writing history (reason is empty).");
                    }
                } catch (err) {
                    console.error("Failed to append project revision history:", err);
                }

                btn.style.setProperty('background', 'linear-gradient(135deg, #22c55e, #16a34a)', 'important');
                btn.innerHTML = '<span class="material-icons-outlined" style="font-size:15px;">check_circle</span> 저장 완료';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.removeProperty('background');
                    btn.style.position = '';
                    btn.style.overflow = '';
                    btn.disabled = false;
                }, 1500);
            } else {
                throw new Error("GitHub API 반영에 실패했습니다.");
            }
        } catch (err) {
            console.error("[Save Error]", err);
            hideSaveOverlay();
            if (btn) {
                btn.innerHTML = '<span class="material-icons-outlined" style="font-size:15px;">error</span> 저장 실패';
                btn.style.setProperty('background', '#ef4444', 'important');
                setTimeout(() => {
                    btn.innerHTML = '<span class="material-icons-outlined" style="font-size:13px;">save</span> 전체 저장';
                    btn.style.removeProperty('background');
                    btn.style.position = '';
                    btn.style.overflow = '';
                    btn.disabled = false;
                }, 1500);
            }
            if (typeof window.showToast === 'function') {
                window.showToast(err.message || "저장 중 오류가 발생했습니다.", "error");
            }
            if (window.Notification) window.Notification.alert('저장 중 오류가 발생했습니다: ' + err.message, '오류', 'error');
        } finally {
            clearTimeout(saveTimeoutId);
            hideSaveOverlay();
        }
    }

    // Expose Storage Engine SSOT
    window.StorageEngine = {
        getIframeHTML: getIframeHTML,
        handleGlobalSave: handleGlobalSave
    };

    // Global Proxies for backward compatibility
    window.getIframeHTML = getIframeHTML;
    window.handleGlobalSave = handleGlobalSave;

})();
