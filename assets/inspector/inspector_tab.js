/**
 * assets/inspector_tab.js
 * Domain Inspector Module: Tab Component
 * Encapsulates state synchronization (Read) and event handling (Write).
 */
(function() {
    console.log("[Inspector Tab] Domain module loaded.");

    const notifyTab = (data) => {
        const activeIframe = (window.DOM && window.DOM.iframe) || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            const payload = Object.assign({ type: 'LF_UPDATE_TAB_PROPERTIES' }, data);
            if (window.MessageHub) {
                window.MessageHub.send(activeIframe.contentWindow, 'LF_UPDATE_TAB_PROPERTIES', payload);
                return;
            }
            if (window.EditorBus) {
                window.EditorBus.sendToIframe(payload);
                return;
            }
            activeIframe.contentWindow.postMessage(payload, '*');
        }
    };

    const sync = (comp) => {
        if (!comp) return;

        const count = Math.max(1, Math.min(10, parseInt(comp.tabCount) || 3));
        const activeIndex = Math.max(0, Math.min(count - 1, parseInt(comp.tabActiveIndex) || 0));
        const accentColor = comp.tabAccentColor || '#2563eb';

        const badge = document.getElementById('tab-count-badge');
        if (badge) badge.innerText = count + ' TABS';

        const txtVal = document.getElementById('txt-tab-count-val');
        if (txtVal) txtVal.innerText = count;

        const inpCount = document.getElementById('prop-tab-count');
        if (inpCount && document.activeElement !== inpCount) {
            inpCount.value = count;
        }

        const colorPicker = document.getElementById('tab-accent-color');
        if (colorPicker && document.activeElement !== colorPicker) {
            let hex = accentColor;
            if (typeof window.rgbToHex === 'function' && hex && !hex.startsWith('#')) {
                hex = window.rgbToHex(hex) || hex;
            }
            colorPicker.value = hex;
            const wrapper = colorPicker.closest('.v4-color-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
        }

        // Render tab items list
        const container = document.getElementById('tab-items-list-container');
        if (!container) return;

        // Focus guard: Do not rebuild if user is currently typing in an input
        const activeEl = document.activeElement;
        const isTyping = activeEl && (container.contains(activeEl) || activeEl.classList.contains('tab-label-input'));
        if (isTyping) return;

        container.innerHTML = '';
        const tabs = (comp.tabs && Array.isArray(comp.tabs)) ? comp.tabs : [];

        for (let i = 0; i < count; i++) {
            const tabObj = tabs[i] || {};
            const tabName = tabObj.name || ('Tab ' + (i + 1));
            const isChecked = (i === activeIndex);

            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 5px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'sidebar-tab-active-radio';
            radio.className = 'tab-active-radio';
            radio.checked = isChecked;
            radio.title = '활성 탭으로 설정 (단일 선택)';
            radio.style.cssText = 'accent-color: #00e5ff; cursor: pointer; flex-shrink: 0; width: 14px; height: 14px; margin: 0;';

            (function(idx) {
                radio.addEventListener('change', function() {
                    notifyTab({ activeIndex: idx });
                });
            })(i);

            const tag = document.createElement('span');
            tag.innerText = (i + 1);
            tag.style.cssText = 'font-size: 10px; font-weight: bold; color: ' + (isChecked ? '#38bdf8' : '#64748b') + '; width: 14px; text-align: center; flex-shrink: 0;';

            const inputWrap = document.createElement('div');
            inputWrap.style.cssText = 'flex: 1;';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'v4-prop-input tab-label-input';
            input.dataset.index = i;
            input.value = tabName;
            input.placeholder = 'Tab ' + (i + 1);
            input.style.cssText = 'width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; outline: none; box-sizing: border-box;';

            input.addEventListener('input', function() {
                const allInputs = Array.from(container.querySelectorAll('.tab-label-input'));
                const currentTexts = allInputs.map(inp => inp.value);
                notifyTab({ tabTexts: currentTexts });
            });

            inputWrap.appendChild(input);
            row.appendChild(radio);
            row.appendChild(tag);
            row.appendChild(inputWrap);
            container.appendChild(row);
        }
    };

    let eventsBound = false;
    const bindEvents = () => {
        if (eventsBound) return;
        eventsBound = true;

        const btnDec = document.getElementById('btn-tab-count-dec');
        const btnInc = document.getElementById('btn-tab-count-inc');
        const inpCount = document.getElementById('prop-tab-count');
        const colorPicker = document.getElementById('tab-accent-color');

        if (btnDec) {
            btnDec.onclick = () => {
                const cur = parseInt(inpCount?.value) || 3;
                if (cur > 1) {
                    const next = cur - 1;
                    if (inpCount) inpCount.value = next;
                    notifyTab({ tabCount: next });
                }
            };
        }

        if (btnInc) {
            btnInc.onclick = () => {
                const cur = parseInt(inpCount?.value) || 3;
                if (cur < 10) {
                    const next = cur + 1;
                    if (inpCount) inpCount.value = next;
                    notifyTab({ tabCount: next });
                }
            };
        }

        if (inpCount) {
            inpCount.onchange = () => {
                let val = parseInt(inpCount.value) || 1;
                val = Math.max(1, Math.min(10, val));
                inpCount.value = val;
                notifyTab({ tabCount: val });
            };
        }

        if (colorPicker) {
            const handleColor = () => {
                notifyTab({ accentColor: colorPicker.value });
            };
            colorPicker.oninput = handleColor;
            colorPicker.onchange = handleColor;
        }
    };

    window.InspectorTab = {
        sync: sync,
        bindEvents: bindEvents
    };
})();
