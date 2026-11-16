/**
 * assets/inspector/inspector_atoms_advanced.js
 * Domain Inspector Module: Interactive Cursor & Rich Web Editor Atoms
 * Split from inspector_atoms.js for Single Responsibility & modularity.
 */
(function() {
    console.log("[Inspector Atoms Advanced] Cursor & WebEditor module loaded.");

    const highlightActive = window.highlightActive;
    const shared = window.InspectorAtomsShared || {};
    const notifyIframe = shared.notifyIframe || window.notifyIframe;

    // --- Mouse Cursor Component ---
    const syncCursor = function(comp) {
        if (!comp) return;

        const isShowText = comp.showText !== false && comp.showText !== 'false';
        const wCursorInp = document.getElementById('prop-width-cursor');
        const hCursorInp = document.getElementById('prop-height-cursor');
        if (wCursorInp && document.activeElement !== wCursorInp) {
            wCursorInp.value = Math.round(comp.w || comp.width || (isShowText ? 140 : 32));
        }
        if (hCursorInp && document.activeElement !== hCursorInp) {
            hCursorInp.value = Math.round(comp.h || comp.height || 32);
        }

        const curType = comp.cursorType || 'default';
        const btnDef = document.getElementById('btn-cursor-type-default');
        const btnPtr = document.getElementById('btn-cursor-type-pointer');
        const btnTxt = document.getElementById('btn-cursor-type-text');
        if (btnDef) highlightActive(btnDef, curType === 'default');
        if (btnPtr) highlightActive(btnPtr, curType === 'pointer');
        if (btnTxt) highlightActive(btnTxt, curType === 'text');

        const btnTextY = document.getElementById('btn-cursor-text-y');
        const btnTextN = document.getElementById('btn-cursor-text-n');
        if (btnTextY && btnTextN) {
            highlightActive(btnTextY, isShowText);
            highlightActive(btnTextN, !isShowText);
        }

        const textInpGroup = document.getElementById('cursor-text-input-group');
        const badgeThemeGroup = document.getElementById('cursor-badge-theme-group');
        if (textInpGroup) textInpGroup.style.display = isShowText ? 'block' : 'none';
        if (badgeThemeGroup) badgeThemeGroup.style.display = isShowText ? 'block' : 'none';

        const textInp = document.getElementById('prop-cursor-text');
        if (textInp && document.activeElement !== textInp) {
            textInp.value = comp.cursorText !== undefined ? comp.cursorText : 'Click Event';
        }

        const theme = comp.badgeStyle || 'dark';
        const btnDark = document.getElementById('btn-cursor-theme-dark');
        const btnBlue = document.getElementById('btn-cursor-theme-blue');
        const btnLight = document.getElementById('btn-cursor-theme-light');
        if (btnDark) highlightActive(btnDark, theme === 'dark');
        if (btnBlue) highlightActive(btnBlue, theme === 'blue');
        if (btnLight) highlightActive(btnLight, theme === 'light');
    };

    const bindCursorEvents = function() {
        const types = ['default', 'pointer', 'text'];
        types.forEach(function(t) {
            const btn = document.getElementById('btn-cursor-type-' + t);
            if (btn && !btn._bound) {
                btn._bound = true;
                btn.onclick = function() {
                    types.forEach(function(o) {
                        const b = document.getElementById('btn-cursor-type-' + o);
                        if (b) highlightActive(b, o === t);
                    });
                    notifyIframe({ type: 'LF_UPDATE_CURSOR_PROPERTIES', cursorType: t });
                };
            }
        });

        const btnTextY = document.getElementById('btn-cursor-text-y');
        const btnTextN = document.getElementById('btn-cursor-text-n');
        const textInpGroup = document.getElementById('cursor-text-input-group');
        const badgeThemeGroup = document.getElementById('cursor-badge-theme-group');

        if (btnTextY && !btnTextY._bound) {
            btnTextY._bound = true;
            btnTextY.onclick = function() {
                highlightActive(btnTextY, true);
                if (btnTextN) highlightActive(btnTextN, false);
                if (textInpGroup) textInpGroup.style.display = 'block';
                if (badgeThemeGroup) badgeThemeGroup.style.display = 'block';
                const wCursorInp = document.getElementById('prop-width-cursor');
                const hCursorInp = document.getElementById('prop-height-cursor');
                if (wCursorInp && parseInt(wCursorInp.value) <= 32) wCursorInp.value = 140;
                if (hCursorInp) hCursorInp.value = 32;
                notifyIframe({ type: 'LF_UPDATE_CURSOR_PROPERTIES', showText: true });
            };
        }
        if (btnTextN && !btnTextN._bound) {
            btnTextN._bound = true;
            btnTextN.onclick = function() {
                if (btnTextY) highlightActive(btnTextY, false);
                highlightActive(btnTextN, true);
                if (textInpGroup) textInpGroup.style.display = 'none';
                if (badgeThemeGroup) badgeThemeGroup.style.display = 'none';
                const wCursorInp = document.getElementById('prop-width-cursor');
                const hCursorInp = document.getElementById('prop-height-cursor');
                if (wCursorInp) wCursorInp.value = 32;
                if (hCursorInp) hCursorInp.value = 32;
                notifyIframe({ type: 'LF_UPDATE_CURSOR_PROPERTIES', showText: false });
            };
        }

        const textInp = document.getElementById('prop-cursor-text');
        if (textInp && !textInp._bound) {
            textInp._bound = true;
            textInp.addEventListener('input', function() {
                notifyIframe({ type: 'LF_UPDATE_CURSOR_PROPERTIES', cursorText: this.value });
            });
        }

        const themes = ['dark', 'blue', 'light'];
        themes.forEach(function(th) {
            const btn = document.getElementById('btn-cursor-theme-' + th);
            if (btn && !btn._bound) {
                btn._bound = true;
                btn.onclick = function() {
                    themes.forEach(function(o) {
                        const b = document.getElementById('btn-cursor-theme-' + o);
                        if (b) highlightActive(b, o === th);
                    });
                    notifyIframe({ type: 'LF_UPDATE_CURSOR_PROPERTIES', badgeStyle: th });
                };
            }
        });
    };

    // --- Web Editor Component ---
    const syncWebEditor = function(comp) {
        if (!comp) return;

        const wInp = document.getElementById('prop-width-webeditor');
        const hInp = document.getElementById('prop-height-webeditor');
        if (wInp && comp.w !== undefined && document.activeElement !== wInp) wInp.value = Math.round(comp.w);
        if (hInp && comp.h !== undefined && document.activeElement !== hInp) hInp.value = Math.round(comp.h);

        const modeSelect = document.getElementById('prop-webeditor-mode');
        if (modeSelect && comp.editorMode) {
            modeSelect.value = comp.editorMode;
        }

        const toolbarSelect = document.getElementById('prop-webeditor-toolbar');
        if (toolbarSelect && comp.toolbarMode) {
            toolbarSelect.value = comp.toolbarMode;
        }

        const btnCounterY = document.getElementById('btn-webeditor-counter-y');
        const btnCounterN = document.getElementById('btn-webeditor-counter-n');
        if (btnCounterY && btnCounterN && comp.showCounter !== undefined) {
            const isShow = (comp.showCounter === true || comp.showCounter === 'true');
            highlightActive(btnCounterY, isShow);
            highlightActive(btnCounterN, !isShow);
        }

        const maxLenInp = document.getElementById('prop-webeditor-maxlength');
        const maxLenTxt = document.getElementById('txt-webeditor-maxlength');
        if (comp.maxLength !== undefined) {
            const mVal = parseInt(comp.maxLength, 10) || 2000;
            if (maxLenInp && document.activeElement !== maxLenInp) {
                maxLenInp.value = mVal;
            }
            if (maxLenTxt) {
                maxLenTxt.innerText = mVal;
            }
        }

        const btnRoY = document.getElementById('btn-webeditor-readonly-y');
        const btnRoN = document.getElementById('btn-webeditor-readonly-n');
        if (btnRoY && btnRoN) {
            const isRo = (comp.readonly === true || comp.readonly === 'true' || comp.disabled === true || comp.disabled === 'true');
            highlightActive(btnRoY, isRo);
            highlightActive(btnRoN, !isRo);
        }
    };

    let _webeditorEventsBound = false;
    const bindWebEditorEvents = function() {
        const btnCounterY = document.getElementById('btn-webeditor-counter-y');
        const btnCounterN = document.getElementById('btn-webeditor-counter-n');
        if (btnCounterY) {
            btnCounterY.onclick = function() {
                highlightActive(btnCounterY, true);
                if (btnCounterN) highlightActive(btnCounterN, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'showCounter', value: true });
            };
        }
        if (btnCounterN) {
            btnCounterN.onclick = function() {
                highlightActive(btnCounterN, true);
                if (btnCounterY) highlightActive(btnCounterY, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'showCounter', value: false });
            };
        }

        const btnRoY = document.getElementById('btn-webeditor-readonly-y');
        const btnRoN = document.getElementById('btn-webeditor-readonly-n');
        if (btnRoY) {
            btnRoY.onclick = function() {
                highlightActive(btnRoY, true);
                if (btnRoN) highlightActive(btnRoN, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'readonly', value: true });
            };
        }
        if (btnRoN) {
            btnRoN.onclick = function() {
                highlightActive(btnRoN, true);
                if (btnRoY) highlightActive(btnRoY, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'readonly', value: false });
            };
        }

        const maxLenInp = document.getElementById('prop-webeditor-maxlength');
        if (maxLenInp) {
            maxLenInp.oninput = function(e) {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 0) val = 0;
                const txt = document.getElementById('txt-webeditor-maxlength');
                if (txt) txt.innerText = val;
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'maxLength', value: val });
            };
        }

        if (_webeditorEventsBound) return;
        _webeditorEventsBound = true;

        document.addEventListener('click', function(e) {
            const btn = e.target && e.target.closest ? e.target.closest('#btn-webeditor-counter-y, #btn-webeditor-counter-n, #btn-webeditor-readonly-y, #btn-webeditor-readonly-n') : null;
            if (!btn) return;
            if (btn.id === 'btn-webeditor-counter-y') {
                highlightActive(btn, true);
                const n = document.getElementById('btn-webeditor-counter-n');
                if (n) highlightActive(n, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'showCounter', value: true });
            } else if (btn.id === 'btn-webeditor-counter-n') {
                highlightActive(btn, true);
                const y = document.getElementById('btn-webeditor-counter-y');
                if (y) highlightActive(y, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'showCounter', value: false });
            } else if (btn.id === 'btn-webeditor-readonly-y') {
                highlightActive(btn, true);
                const n = document.getElementById('btn-webeditor-readonly-n');
                if (n) highlightActive(n, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'readonly', value: true });
            } else if (btn.id === 'btn-webeditor-readonly-n') {
                highlightActive(btn, true);
                const y = document.getElementById('btn-webeditor-readonly-y');
                if (y) highlightActive(y, false);
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'readonly', value: false });
            }
        });

        document.addEventListener('change', function(e) {
            if (e.target && e.target.id === 'prop-webeditor-mode') {
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'editorMode', value: e.target.value });
            }
            if (e.target && e.target.id === 'prop-webeditor-toolbar') {
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'toolbarMode', value: e.target.value });
            }
        });

        document.addEventListener('input', function(e) {
            if (e.target && e.target.id === 'prop-webeditor-maxlength') {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 0) val = 0;
                const txt = document.getElementById('txt-webeditor-maxlength');
                if (txt) txt.innerText = val;
                notifyIframe({ type: 'LF_UPDATE_PROP', prop: 'maxLength', value: val });
            }
        });
    };
    bindWebEditorEvents();

    window.InspectorAtoms = Object.assign(window.InspectorAtoms || {}, {
        syncCursor: syncCursor,
        syncWebEditor: syncWebEditor,
        bindCursorEvents: bindCursorEvents,
        initCursorEvents: bindCursorEvents,
        bindWebEditorEvents: bindWebEditorEvents
    });

    window._syncWebEditorProps = syncWebEditor;
    window.initCursorEvents = bindCursorEvents;
    window.initWebEditorEvents = bindWebEditorEvents;
})();
