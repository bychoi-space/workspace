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
    let currentConnectors = [];
    let liveScrollState = {
        pcScrollTop: 0,
        pcScrollLeft: 0,
        mobileScrollTop: 0,
        mobileScrollLeft: 0,
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
        liveScrollState.bodyScrollTop = (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
        liveScrollState.bodyScrollLeft = (document.documentElement ? document.documentElement.scrollLeft : 0) || (document.body ? document.body.scrollLeft : 0) || 0;
        return {
            pcScrollTop: liveScrollState.pcScrollTop,
            pcScrollLeft: liveScrollState.pcScrollLeft,
            mobileScrollTop: liveScrollState.mobileScrollTop,
            mobileScrollLeft: liveScrollState.mobileScrollLeft,
            bodyScrollTop: liveScrollState.bodyScrollTop,
            bodyScrollLeft: liveScrollState.bodyScrollLeft
        };
    }

    function bindScrollListeners() {
        const pcArea = document.querySelector('.pc-content-area');
        const mobileArea = document.querySelector('.mobile-content-area, .mobile-content');
        if (pcArea && !pcArea._undoScrollBound) {
            pcArea._undoScrollBound = true;
            pcArea.addEventListener('scroll', () => {
                liveScrollState.pcScrollTop = pcArea.scrollTop;
                liveScrollState.pcScrollLeft = pcArea.scrollLeft;
            }, { passive: true });
        }
        if (mobileArea && !mobileArea._undoScrollBound) {
            mobileArea._undoScrollBound = true;
            mobileArea.addEventListener('scroll', () => {
                liveScrollState.mobileScrollTop = mobileArea.scrollTop;
                liveScrollState.mobileScrollLeft = mobileArea.scrollLeft;
            }, { passive: true });
        }
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
            } catch (e) { console.warn("[V4 Undo] Save failed:", e); }
        },
        undo: function() {
            try {
                if (undoStack.length === 0) return;
                const currentLive = captureLiveScroll();
                const prevState = JSON.parse(undoStack.pop());
                const savedScroll = prevState.scrollState || {};

                // Use current live scroll if user is scrolled down, otherwise fallback to saved scroll
                const targetScroll = {
                    pcScrollTop: (currentLive.pcScrollTop > 0) ? currentLive.pcScrollTop : (savedScroll.pcScrollTop || 0),
                    pcScrollLeft: (currentLive.pcScrollLeft > 0) ? currentLive.pcScrollLeft : (savedScroll.pcScrollLeft || 0),
                    mobileScrollTop: (currentLive.mobileScrollTop > 0) ? currentLive.mobileScrollTop : (savedScroll.mobileScrollTop || 0),
                    mobileScrollLeft: (currentLive.mobileScrollLeft > 0) ? currentLive.mobileScrollLeft : (savedScroll.mobileScrollLeft || 0),
                    bodyScrollTop: (currentLive.bodyScrollTop > 0) ? currentLive.bodyScrollTop : (savedScroll.bodyScrollTop || 0),
                    bodyScrollLeft: (currentLive.bodyScrollLeft > 0) ? currentLive.bodyScrollLeft : (savedScroll.bodyScrollLeft || 0)
                };

                const temp = document.createElement('div');
                temp.innerHTML = prevState.html;
                temp.querySelectorAll('script').forEach(el => el.remove());

                const currentPcInner = document.querySelector('.pc-content-inner');
                const currentMobileInner = document.querySelector('.mobile-content-inner');
                const tempPcInner = temp.querySelector('.pc-content-inner');
                const tempMobileInner = temp.querySelector('.mobile-content-inner');

                // Case 1: Authentic Responsive Template -> In-place update preserving scroll containers
                if (currentPcInner && tempPcInner) {
                    currentPcInner.innerHTML = tempPcInner.innerHTML;
                    if (tempPcInner.getAttribute('style')) {
                        currentPcInner.setAttribute('style', tempPcInner.getAttribute('style'));
                    }
                    if (currentMobileInner && tempMobileInner) {
                        currentMobileInner.innerHTML = tempMobileInner.innerHTML;
                        if (tempMobileInner.getAttribute('style')) {
                            currentMobileInner.setAttribute('style', tempMobileInner.getAttribute('style'));
                        }
                    }
                    // Sync height inputs if changed
                    const tempPcInput = temp.querySelector('.pc-height-input');
                    const curPcInput = document.querySelector('.pc-height-input');
                    if (tempPcInput && curPcInput && tempPcInput.value) curPcInput.value = tempPcInput.value;

                    const tempMobInput = temp.querySelector('.mobile-height-input');
                    const curMobInput = document.querySelector('.mobile-height-input');
                    if (tempMobInput && curMobInput && tempMobInput.value) curMobInput.value = tempMobInput.value;
                } else {
                    // Case 2: Standard Template -> Replace body contents while preserving scripts
                    const currentScripts = Array.from(document.body.querySelectorAll('script'));
                    document.body.innerHTML = '';
                    while (temp.firstChild) {
                        document.body.appendChild(temp.firstChild);
                    }
                    currentScripts.forEach(script => {
                        document.body.appendChild(script);
                    });
                }

                if (prevState.connectors) {
                    currentConnectors = prevState.connectors;
                    if (typeof notifyParent === 'function') notifyParent({ type: 'LF_RESTORE_CONNECTORS', connectors: prevState.connectors });
                }
                if (typeof window.initHandles === 'function') window.initHandles();
                if (typeof window.markDirty === 'function') window.markDirty();

                // Re-bind height controls if in responsive template
                const pcInput = document.querySelector('.pc-height-input');
                const pcInner = document.querySelector('.pc-content-inner');
                if (pcInput && pcInner) {
                    const val = Math.max(810, parseInt(pcInput.value) || 810);
                    pcInner.style.minHeight = (val + 2) + 'px';
                }
                const mobileInput = document.querySelector('.mobile-height-input');
                const mobileInner = document.querySelector('.mobile-content-inner');
                if (mobileInput && mobileInner) {
                    const val = Math.max(810, parseInt(mobileInput.value) || 810);
                    mobileInner.style.minHeight = (val + 2) + 'px';
                }

                // Restore Scroll State continuously across reflow frames
                restoreScrollState(targetScroll);
            } catch (e) { console.warn("[V4 Undo] Undo failed:", e); }
        },
        init: function() {
            bindScrollListeners();
            document.addEventListener('DOMContentLoaded', bindScrollListeners);
            setTimeout(bindScrollListeners, 300);
            
            document.addEventListener('keydown', (e) => {
                if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || (e.target.closest && e.target.closest('.v4-editable-cell, .ql-editor, [contenteditable="true"]'))) return;
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
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
                }
            });
        }
    };
})();
if (window.V4UndoManager) window.V4UndoManager.init();
`;
