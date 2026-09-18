/**
 * assets/vctrl_undo.js
 * Undo & Redo management module for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4UndoScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4UndoScript = `
window.V4UndoManager = (function() {
    const MAX_HISTORY = 15;
    let undoStack = [];
    let redoStack = [];
    let currentConnectors = [];
    let liveScrollState = {
        pcScrollTop: 0,
        pcScrollLeft: 0,
        mobileScrollTop: 0,
        mobileScrollLeft: 0,
        columnScrolls: [],
        bodyScrollTop: 0,
        bodyScrollLeft: 0
    };
    
    function getCleanHTML() {
        const host = document.body;
        const clone = host.cloneNode(true);
        clone.querySelectorAll('script').forEach(el => el.remove());
        clone.querySelectorAll('.lf-resizer, .lf-drag-handle, .lf-delete-trigger').forEach(el => el.remove());
        clone.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected'));
        return clone.innerHTML;
    }

    function captureLiveScroll() {
        const pcArea = document.querySelector('.pc-content-area');
        const mobileArea = document.querySelector('.mobile-content-area, .mobile-content');
        if (pcArea) {
            liveScrollState.pcScrollTop = pcArea.scrollTop;
            liveScrollState.pcScrollLeft = pcArea.scrollLeft;
        }
        if (mobileArea) {
            liveScrollState.mobileScrollTop = mobileArea.scrollTop;
            liveScrollState.mobileScrollLeft = mobileArea.scrollLeft;
        }
        const scrollAreas = document.querySelectorAll('.pc-content-area, .mobile-content-area, .mobile-content');
        liveScrollState.columnScrolls = Array.from(scrollAreas).map(el => ({
            scrollTop: el.scrollTop,
            scrollLeft: el.scrollLeft
        }));
        liveScrollState.bodyScrollTop = (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
        liveScrollState.bodyScrollLeft = (document.documentElement ? document.documentElement.scrollLeft : 0) || (document.body ? document.body.scrollLeft : 0) || 0;
        return {
            pcScrollTop: liveScrollState.pcScrollTop,
            pcScrollLeft: liveScrollState.pcScrollLeft,
            mobileScrollTop: liveScrollState.mobileScrollTop,
            mobileScrollLeft: liveScrollState.mobileScrollLeft,
            columnScrolls: liveScrollState.columnScrolls,
            bodyScrollTop: liveScrollState.bodyScrollTop,
            bodyScrollLeft: liveScrollState.bodyScrollLeft
        };
    }

    function bindScrollListeners() {
        const scrollAreas = document.querySelectorAll('.pc-content-area, .mobile-content-area, .mobile-content');
        scrollAreas.forEach((area, idx) => {
            if (!area._undoScrollBound) {
                area._undoScrollBound = true;
                area.addEventListener('scroll', () => {
                    if (!liveScrollState.columnScrolls) liveScrollState.columnScrolls = [];
                    liveScrollState.columnScrolls[idx] = {
                        scrollTop: area.scrollTop,
                        scrollLeft: area.scrollLeft
                    };
                    if (area.classList.contains('pc-content-area')) {
                        liveScrollState.pcScrollTop = area.scrollTop;
                        liveScrollState.pcScrollLeft = area.scrollLeft;
                    } else {
                        liveScrollState.mobileScrollTop = area.scrollTop;
                        liveScrollState.mobileScrollLeft = area.scrollLeft;
                    }
                }, { passive: true });
            }
        });
        window.addEventListener('scroll', () => {
            liveScrollState.bodyScrollTop = (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
            liveScrollState.bodyScrollLeft = (document.documentElement ? document.documentElement.scrollLeft : 0) || (document.body ? document.body.scrollLeft : 0) || 0;
        }, { passive: true });
    }

    function restoreScrollState(targetScroll) {
        if (!targetScroll) return;
        
        let attempts = 0;
        const maxAttempts = 25; // run for ~400ms across animation frames
        
        function apply() {
            const scrollAreas = document.querySelectorAll('.pc-content-area, .mobile-content-area, .mobile-content');
            if (targetScroll.columnScrolls && targetScroll.columnScrolls.length > 0) {
                scrollAreas.forEach((area, idx) => {
                    const s = targetScroll.columnScrolls[idx];
                    if (s) {
                        if (typeof s.scrollTop === 'number') area.scrollTop = s.scrollTop;
                        if (typeof s.scrollLeft === 'number') area.scrollLeft = s.scrollLeft;
                    }
                });
            } else {
                const pcArea = document.querySelector('.pc-content-area');
                const mobileArea = document.querySelector('.mobile-content-area, .mobile-content');
                
                if (pcArea && typeof targetScroll.pcScrollTop === 'number') {
                    pcArea.scrollTop = targetScroll.pcScrollTop;
                    if (typeof targetScroll.pcScrollLeft === 'number') pcArea.scrollLeft = targetScroll.pcScrollLeft;
                }
                if (mobileArea && typeof targetScroll.mobileScrollTop === 'number') {
                    mobileArea.scrollTop = targetScroll.mobileScrollTop;
                    if (typeof targetScroll.mobileScrollLeft === 'number') mobileArea.scrollLeft = targetScroll.mobileScrollLeft;
                }
            }
            if (targetScroll.bodyScrollTop > 0 || targetScroll.bodyScrollLeft > 0) {
                try {
                    window.scrollTo(targetScroll.bodyScrollLeft || 0, targetScroll.bodyScrollTop || 0);
                } catch(e) {}
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                requestAnimationFrame(apply);
            } else {
                bindScrollListeners();
            }
        }
        
        apply();
    }

    function applySnapshot(snapshotObj) {
        const currentLive = captureLiveScroll();
        const savedScroll = snapshotObj.scrollState || {};

        const targetScroll = {
            pcScrollTop: (currentLive.pcScrollTop > 0) ? currentLive.pcScrollTop : (savedScroll.pcScrollTop || 0),
            pcScrollLeft: (currentLive.pcScrollLeft > 0) ? currentLive.pcScrollLeft : (savedScroll.pcScrollLeft || 0),
            mobileScrollTop: (currentLive.mobileScrollTop > 0) ? currentLive.mobileScrollTop : (savedScroll.mobileScrollTop || 0),
            mobileScrollLeft: (currentLive.mobileScrollLeft > 0) ? currentLive.mobileScrollLeft : (savedScroll.mobileScrollLeft || 0),
            columnScrolls: (currentLive.columnScrolls && currentLive.columnScrolls.some(s => s.scrollTop > 0 || s.scrollLeft > 0)) 
                ? currentLive.columnScrolls 
                : (savedScroll.columnScrolls || []),
            bodyScrollTop: (currentLive.bodyScrollTop > 0) ? currentLive.bodyScrollTop : (savedScroll.bodyScrollTop || 0),
            bodyScrollLeft: (currentLive.bodyScrollLeft > 0) ? currentLive.bodyScrollLeft : (savedScroll.bodyScrollLeft || 0)
        };

        const temp = document.createElement('div');
        temp.innerHTML = snapshotObj.html;
        temp.querySelectorAll('script').forEach(el => el.remove());

        // Smart In-Place Restoration for Responsive templates
        const curColumns = document.querySelectorAll('.frame-column');
        const tempColumns = temp.querySelectorAll('.frame-column');
        const currentPcArea = document.querySelector('.pc-content-area');
        const tempPcArea = temp.querySelector('.pc-content-area');
        const currentMobileArea = document.querySelector('.mobile-content-area, .mobile-content');
        const tempMobileArea = temp.querySelector('.mobile-content-area, .mobile-content');

        if (curColumns.length > 0 && curColumns.length === tempColumns.length) {
            curColumns.forEach((col, idx) => {
                const tempCol = tempColumns[idx];
                const curInner = col.querySelector('.pc-content-inner, .mobile-content-inner');
                const tempInner = tempCol.querySelector('.pc-content-inner, .mobile-content-inner');
                if (curInner && tempInner) {
                    curInner.innerHTML = tempInner.innerHTML;
                }

                // Sync height input if changed
                const tempHInput = tempCol.querySelector('.pc-height-input, .mobile-height-input');
                const curHInput = col.querySelector('.pc-height-input, .mobile-height-input');
                if (tempHInput && curHInput && tempHInput.value) curHInput.value = tempHInput.value;

                // Sync title input if changed
                const tempTitle = tempCol.querySelector('.frame-title-input');
                const curTitle = col.querySelector('.frame-title-input');
                if (tempTitle && curTitle && typeof tempTitle.value !== 'undefined') curTitle.value = tempTitle.value;
            });

            // Sync page-level / canvas-level background components outside frame columns
            const curPage = document.querySelector('.page, .canvas');
            const tempPage = temp.querySelector('.page, .canvas');
            if (curPage && tempPage) {
                const curBaseComps = curPage.querySelectorAll(':scope > .lf-component');
                curBaseComps.forEach(el => {
                    if (!el.closest('.frame-column')) el.remove();
                });
                const tempBaseComps = tempPage.querySelectorAll(':scope > .lf-component');
                tempBaseComps.forEach(el => {
                    if (!el.closest('.frame-column')) {
                        curPage.appendChild(el.cloneNode(true));
                    }
                });
            }

            // Sync body-level components (connectors, pins, temporary body-dragged objects)
            const curBodyComps = document.body.querySelectorAll(':scope > .lf-component');
            curBodyComps.forEach(el => {
                if (!el.closest('.page, .canvas, .frame-column')) el.remove();
            });
            const tempBodyComps = temp.querySelectorAll(':scope > .lf-component');
            tempBodyComps.forEach(el => {
                if (!el.closest('.page, .canvas, .frame-column')) {
                    document.body.appendChild(el.cloneNode(true));
                }
            });
        } else if (currentPcArea && tempPcArea) {
            currentPcArea.innerHTML = tempPcArea.innerHTML;
            if (currentMobileArea && tempMobileArea) {
                currentMobileArea.innerHTML = tempMobileArea.innerHTML;
            }

            // Sync page-level / canvas-level background components outside frame columns
            const curPage2 = document.querySelector('.page, .canvas');
            const tempPage2 = temp.querySelector('.page, .canvas');
            if (curPage2 && tempPage2) {
                const curBaseComps = curPage2.querySelectorAll(':scope > .lf-component');
                curBaseComps.forEach(el => {
                    if (!el.closest('.pc-content-area, .mobile-content-area, .pc-content, .mobile-content')) el.remove();
                });
                const tempBaseComps = tempPage2.querySelectorAll(':scope > .lf-component');
                tempBaseComps.forEach(el => {
                    if (!el.closest('.pc-content-area, .mobile-content-area, .pc-content, .mobile-content')) {
                        curPage2.appendChild(el.cloneNode(true));
                    }
                });
            }

            // Sync body-level components (connectors, pins, temporary body-dragged objects)
            const curBodyComps = document.body.querySelectorAll(':scope > .lf-component');
            curBodyComps.forEach(el => {
                if (!el.closest('.page, .canvas, .pc-content-area, .mobile-content-area, .pc-content, .mobile-content')) el.remove();
            });
            const tempBodyComps = temp.querySelectorAll(':scope > .lf-component');
            tempBodyComps.forEach(el => {
                if (!el.closest('.page, .canvas, .pc-content-area, .mobile-content-area, .pc-content, .mobile-content')) {
                    document.body.appendChild(el.cloneNode(true));
                }
            });

            // Sync height inputs if changed
            const tempPcInput = temp.querySelector('.pc-height-input');
            const curPcInput = document.querySelector('.pc-height-input');
            if (tempPcInput && curPcInput && tempPcInput.value) curPcInput.value = tempPcInput.value;

            const tempMobInput = temp.querySelector('.mobile-height-input');
            const curMobInput = document.querySelector('.mobile-height-input');
            if (tempMobInput && curMobInput && tempMobInput.value) curMobInput.value = tempMobInput.value;
        } else {
            // Case 2: Standard Template (Cover, Plan, Summary, UI, Blank, etc.) -> Replace body contents while preserving scripts
            const currentScripts = Array.from(document.body.querySelectorAll('script'));
            document.body.innerHTML = '';
            while (temp.firstChild) {
                document.body.appendChild(temp.firstChild);
            }
            currentScripts.forEach(script => {
                document.body.appendChild(script);
            });
        }

        if (snapshotObj.connectors) {
            currentConnectors = snapshotObj.connectors;
            if (typeof notifyParent === 'function') notifyParent({ type: 'LF_RESTORE_CONNECTORS', connectors: snapshotObj.connectors });
        }
        if (typeof window.initHandles === 'function') window.initHandles();
        if (typeof window.markDirty === 'function') window.markDirty();

        // Re-bind height controls if in responsive template
        const heightInputs = document.querySelectorAll('.pc-height-input, .mobile-height-input');
        heightInputs.forEach(input => {
            const col = input.closest('.frame-column');
            const inner = col ? col.querySelector('.pc-content-inner, .mobile-content-inner') : document.querySelector('.pc-content-inner, .mobile-content-inner');
            if (inner) {
                const val = Math.max(810, parseInt(input.value) || 810);
                inner.style.minHeight = (val + 2) + 'px';
            }
        });

        // Restore Scroll State continuously across reflow frames
        restoreScrollState(targetScroll);
    }

    return {
        saveState: function() {
            try {
                const html = getCleanHTML();
                const connectors = JSON.parse(JSON.stringify(currentConnectors));
                const scrollState = captureLiveScroll();
                const currentState = JSON.stringify({ html, connectors, scrollState });
                if (undoStack.length > 0) {
                    try {
                        const lastState = JSON.parse(undoStack[undoStack.length - 1]);
                        if (lastState.html === html && JSON.stringify(lastState.connectors) === JSON.stringify(connectors)) {
                            return;
                        }
                    } catch(parseErr) {}
                }
                undoStack.push(currentState);
                if (undoStack.length > MAX_HISTORY) undoStack.shift();
                redoStack = []; // Clear redo stack on any new user action
            } catch (e) { console.warn("[V4 Undo] Save failed:", e); }
        },
        undo: function() {
            try {
                if (undoStack.length === 0) return;
                
                // Save current live state into redoStack before reverting
                const currentHTML = getCleanHTML();
                const currentConns = JSON.parse(JSON.stringify(currentConnectors));
                const currentScroll = captureLiveScroll();
                const currentLiveState = JSON.stringify({ html: currentHTML, connectors: currentConns, scrollState: currentScroll });
                redoStack.push(currentLiveState);
                if (redoStack.length > MAX_HISTORY) redoStack.shift();

                const prevState = JSON.parse(undoStack.pop());
                applySnapshot(prevState);
            } catch (e) { console.warn("[V4 Undo] Undo failed:", e); }
        },
        redo: function() {
            try {
                if (redoStack.length === 0) return;

                // Save current live state into undoStack before applying redo
                const currentHTML = getCleanHTML();
                const currentConns = JSON.parse(JSON.stringify(currentConnectors));
                const currentScroll = captureLiveScroll();
                const currentLiveState = JSON.stringify({ html: currentHTML, connectors: currentConns, scrollState: currentScroll });
                undoStack.push(currentLiveState);
                if (undoStack.length > MAX_HISTORY) undoStack.shift();

                const nextState = JSON.parse(redoStack.pop());
                applySnapshot(nextState);
            } catch (e) { console.warn("[V4 Undo] Redo failed:", e); }
        },
        init: function() {
            bindScrollListeners();
            document.addEventListener('DOMContentLoaded', bindScrollListeners);
            setTimeout(bindScrollListeners, 300);
            
            document.addEventListener('keydown', (e) => {
                const isZ = e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ';
                const isY = e.key === 'y' || e.key === 'Y' || e.code === 'KeyY';
                if (!e.ctrlKey && !e.metaKey) return;
                if (!isZ && !isY) return;

                // Native input elements protection (input, textarea, select, Quill editor)
                const targetTag = e.target ? e.target.tagName : '';
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) return;
                if (e.target && e.target.closest && e.target.closest('.ql-editor')) return;

                // When typing actively in contenteditable cell, allow browser text undo
                const isCell = e.target && (e.target.isContentEditable || (e.target.closest && e.target.closest('.v4-editable-cell, [contenteditable="true"]')));
                if (isCell) {
                    const sel = window.getSelection();
                    const hasActiveCaret = sel && sel.anchorNode && (sel.anchorNode === e.target || e.target.contains(sel.anchorNode));
                    const isExplicitEditing = e.target.getAttribute && e.target.getAttribute('contenteditable') === 'true' && document.activeElement === e.target;
                    if (isExplicitEditing && hasActiveCaret && e.target.closest && !e.target.closest('.lf-component.selected')) {
                        return;
                    }
                }

                if ((isZ && e.shiftKey) || isY) {
                    e.preventDefault();
                    window.V4UndoManager.redo();
                } else if (isZ && !e.shiftKey) {
                    e.preventDefault();
                    window.V4UndoManager.undo();
                }
            });
            window.addEventListener('message', (e) => {
                if (e.data && e.data.type === 'LF_SYNC_CONNECTORS') {
                    currentConnectors = e.data.connectors || [];
                } else if (e.data && e.data.type === 'LF_SAVE_UNDO') {
                    window.V4UndoManager.saveState();
                } else if (e.data && e.data.type === 'LF_TRIGGER_UNDO') {
                    window.V4UndoManager.undo();
                } else if (e.data && e.data.type === 'LF_TRIGGER_REDO') {
                    window.V4UndoManager.redo();
                }
            });
        }
    };
})();
if (window.V4UndoManager) window.V4UndoManager.init();
`;
