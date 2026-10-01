/**
 * assets/inspector/inspector_popup.js
 * Domain Inspector Module: Popup Window Component (v4-atom-popup)
 * Encapsulates state synchronization (Read) and event handling (Write).
 */
(function() {
    console.log("[Inspector Popup] Domain module loaded.");

    const highlightActive = window.highlightActive || ((el, active) => {
        if (!el) return;
        el.classList.toggle('active', !!active);
    });

    const notifyPopup = (data) => {
        if (typeof window.notifyIframe === 'function') {
            window.notifyIframe(Object.assign({ type: 'LF_UPDATE_POPUP_PROPERTIES' }, data));
            return;
        }
        const activeIframe = (window.DOM && window.DOM.iframe) || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            const payload = Object.assign({ type: 'LF_UPDATE_POPUP_PROPERTIES' }, data);
            if (window.MessageHub) {
                window.MessageHub.send(activeIframe.contentWindow, 'LF_UPDATE_POPUP_PROPERTIES', payload);
                return;
            }
            if (window.EditorBus) {
                window.EditorBus.sendToIframe(payload);
                return;
            }
            activeIframe.contentWindow.postMessage(payload, '*');
        }
    };

    const toHex = (val) => {
        if (!val || val === 'transparent' || val === 'none') return '#ffffff';
        if (typeof window.rgbToHex === 'function' && !val.startsWith('#')) {
            return window.rgbToHex(val) || val;
        }
        return val;
    };

    const sync = (comp) => {
        if (!comp) return;

        // Title
        const titleInp = document.getElementById('prop-popup-title');
        if (titleInp && document.activeElement !== titleInp && comp.popupTitle !== undefined) {
            titleInp.value = comp.popupTitle;
        }

        // Show Close Button (Y / N)
        const showClose = comp.popupShowClose !== false;
        const btnCloseY = document.getElementById('btn-popup-close-y');
        const btnCloseN = document.getElementById('btn-popup-close-n');
        if (btnCloseY) highlightActive(btnCloseY, showClose);
        if (btnCloseN) highlightActive(btnCloseN, !showClose);

        // Header Bg Color
        const headerBgInp = document.getElementById('prop-popup-header-bg');
        if (headerBgInp && document.activeElement !== headerBgInp && comp.popupHeaderBg) {
            headerBgInp.value = toHex(comp.popupHeaderBg);
        }

        // Header Text Color
        const headerColorInp = document.getElementById('prop-popup-header-color');
        if (headerColorInp && document.activeElement !== headerColorInp && comp.popupHeaderColor) {
            headerColorInp.value = toHex(comp.popupHeaderColor);
        }

        // Body Bg Color
        const bodyBgInp = document.getElementById('prop-popup-body-bg');
        if (bodyBgInp && document.activeElement !== bodyBgInp && comp.popupBodyBg) {
            bodyBgInp.value = toHex(comp.popupBodyBg);
        }

        // Border Color
        const borderInp = document.getElementById('prop-popup-border-color');
        if (borderInp && document.activeElement !== borderInp && comp.popupBorderColor) {
            borderInp.value = toHex(comp.popupBorderColor);
        }

        // Border Radius
        const radius = parseInt(comp.popupRadius) || 8;
        const radiusSlider = document.getElementById('prop-popup-border-radius');
        const radiusTxt = document.getElementById('txt-popup-border-radius');
        if (radiusSlider && document.activeElement !== radiusSlider) {
            radiusSlider.value = radius;
        }
        if (radiusTxt) {
            radiusTxt.innerText = radius;
        }
    };

    let initialized = false;
    const init = () => {
        const titleInp = document.getElementById('prop-popup-title');
        if (!titleInp) return;
        if (initialized) return;
        initialized = true;

        // Title text input
        if (titleInp) {
            titleInp.addEventListener('input', (e) => {
                notifyPopup({ titleText: e.target.value });
            });
        }

        // Close button toggle
        const btnCloseY = document.getElementById('btn-popup-close-y');
        const btnCloseN = document.getElementById('btn-popup-close-n');
        if (btnCloseY) {
            btnCloseY.addEventListener('click', () => {
                highlightActive(btnCloseY, true);
                if (btnCloseN) highlightActive(btnCloseN, false);
                notifyPopup({ showClose: true });
            });
        }
        if (btnCloseN) {
            btnCloseN.addEventListener('click', () => {
                highlightActive(btnCloseN, true);
                if (btnCloseY) highlightActive(btnCloseY, false);
                notifyPopup({ showClose: false });
            });
        }

        // Header Bg
        const headerBgInp = document.getElementById('prop-popup-header-bg');
        if (headerBgInp) {
            headerBgInp.addEventListener('input', (e) => {
                notifyPopup({ headerBg: e.target.value });
            });
        }

        // Header Color
        const headerColorInp = document.getElementById('prop-popup-header-color');
        if (headerColorInp) {
            headerColorInp.addEventListener('input', (e) => {
                notifyPopup({ headerColor: e.target.value });
            });
        }

        // Body Bg
        const bodyBgInp = document.getElementById('prop-popup-body-bg');
        if (bodyBgInp) {
            bodyBgInp.addEventListener('input', (e) => {
                notifyPopup({ bodyBg: e.target.value });
            });
        }

        // Border Color
        const borderInp = document.getElementById('prop-popup-border-color');
        if (borderInp) {
            borderInp.addEventListener('input', (e) => {
                notifyPopup({ borderColor: e.target.value });
            });
        }

        // Border Radius slider
        const radiusSlider = document.getElementById('prop-popup-border-radius');
        const radiusTxt = document.getElementById('txt-popup-border-radius');
        if (radiusSlider) {
            radiusSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 0;
                if (radiusTxt) radiusTxt.innerText = val;
                notifyPopup({ borderRadius: val });
            });
        }

        // Corner preset buttons
        ['sharp', 'round', 'pill'].forEach(type => {
            const btn = document.getElementById('btn-popup-corner-' + type);
            if (btn) {
                btn.addEventListener('click', () => {
                    const r = parseInt(btn.dataset.radius) || 0;
                    if (radiusSlider) radiusSlider.value = r;
                    if (radiusTxt) radiusTxt.innerText = r;
                    notifyPopup({ borderRadius: r });
                });
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.InspectorPopup = {
        sync: sync,
        init: init
    };
})();
