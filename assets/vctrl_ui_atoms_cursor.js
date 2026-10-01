/**
 * bychoi workspace V4 - UI Atoms Cursor Module (Pointer & I-Beam)
 * Decoupled from vctrl_ui_atoms.js for performance and modularity (Phase 3).
 * Manages cursor container events, auto width fitting, and property updates.
 */

window.v4UIAtomsCursorScript = `
(function() {
    console.log("[V4 UI Atoms Cursor] Module initialized.");

    const fitCursorWidth = (comp) => {
        if (!comp) return;
        const container = comp.querySelector('.v4-cursor-container') || (comp.classList.contains('v4-cursor-container') ? comp : null);
        if (!container) return;

        const isShow = container.getAttribute('data-show-text') !== 'false';
        if (!isShow) {
            comp.style.width = '32px';
            comp.style.height = '32px';
        } else {
            const descBox = container.querySelector('.v4-cursor-desc-box');
            const textEl = container.querySelector('.v4-cursor-text');
            const iconWrap = container.querySelector('.v4-cursor-icon-wrap');

            if (descBox) {
                descBox.style.maxWidth = 'none';
                descBox.style.width = 'max-content';
                descBox.style.flexShrink = '0';
            }
            if (textEl) {
                textEl.style.overflow = 'visible';
                textEl.style.textOverflow = 'clip';
                textEl.style.whiteSpace = 'nowrap';
            }

            var iconW = 24;
            if (iconWrap) {
                iconW = iconWrap.offsetWidth || 24;
            }

            var textW = 0;
            if (textEl) {
                textW = textEl.scrollWidth || textEl.offsetWidth || 0;
            }

            var descW = 60;
            if (descBox) {
                descW = Math.max(descBox.offsetWidth || 0, descBox.scrollWidth || 0, textW + 20);
            } else {
                descW = textW + 20;
            }

            var totalW = Math.max(64, Math.ceil(iconW + 8 + descW + 4));
            comp.style.width = totalW + 'px';
            comp.style.height = '32px';
        }

        if (typeof window.updateHandles === 'function') {
            window.updateHandles(comp);
        }
    };

    const bindCursorEvents = () => {
        document.querySelectorAll('.v4-cursor-container').forEach(container => {
            const cType = container.getAttribute('data-cursor-type') || 'default';
            const iconWrap = container.querySelector('.v4-cursor-icon-wrap');
            if (iconWrap) {
                var pointerSrc = 'data:image/png;base64,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';
                var ibeamSrc = 'data:image/png;base64,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';
                if (cType === 'pointer' && !iconWrap.querySelector('.v4-cursor-visual[data-cursor-visual="pointer"]')) {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="pointer" style="width: 21px; height: 28px; background-image: url(' + pointerSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                } else if (cType === 'text' && !iconWrap.querySelector('.v4-cursor-visual[data-cursor-visual="text"]')) {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="text" style="width: 11px; height: 28px; background-image: url(' + ibeamSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                }
            }

            // Restore Badge Theme Styles & Text Colors on Reload
            const badgeStyle = container.getAttribute('data-badge-style') || 'dark';
            const descBox = container.querySelector('.v4-cursor-desc-box');
            const isLight = badgeStyle === 'light';
            const targetColor = isLight ? '#0f172a' : '#ffffff';
            if (descBox) {
                descBox.style.color = targetColor;
                if (badgeStyle === 'blue') {
                    descBox.style.background = '#1d4ed8';
                    descBox.style.borderColor = '#2563eb';
                } else if (badgeStyle === 'light') {
                    descBox.style.background = '#ffffff';
                    descBox.style.borderColor = '#cbd5e1';
                } else {
                    descBox.style.background = '#1e293b';
                    descBox.style.borderColor = '#334155';
                }
            }

            const textEl = container.querySelector('.v4-cursor-text');
            if (textEl) {
                textEl.style.color = targetColor;
            }
            if (!textEl || textEl._cursorBound) return;
            textEl._cursorBound = true;

            textEl.addEventListener('input', () => {
                container.setAttribute('data-cursor-text', textEl.innerText);
                const comp = container.closest('.lf-component');
                if (comp) fitCursorWidth(comp);
                markDirty();
            });

            textEl.addEventListener('blur', () => {
                container.setAttribute('data-cursor-text', textEl.innerText);
                const comp = container.closest('.lf-component');
                if (comp) fitCursorWidth(comp);
                markDirty();
                if (comp && typeof window._getCompStyles === 'function') {
                    window.parent.postMessage(Object.assign({
                        type: 'LF_COMP_SELECTED'
                    }, window._getCompStyles(comp)), '*');
                }
            });

            const parentComp = container.closest('.lf-component');
            if (parentComp) {
                fitCursorWidth(parentComp);
            }
        });
    };

    window.fitCursorWidth = fitCursorWidth;
    window.bindCursorEvents = bindCursorEvents;

    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_CURSOR_PROPERTIES'] = function(d) {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
        if (!s) return;
        const container = s.querySelector('.v4-cursor-container') || (s.classList.contains('v4-cursor-container') ? s : null);
        if (!container) return;

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        if (d.cursorType !== undefined) {
            container.setAttribute("data-cursor-type", d.cursorType);
            const iconWrap = container.querySelector(".v4-cursor-icon-wrap");
            if (iconWrap) {
                var pointerSrc = 'data:image/png;base64,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';
                var ibeamSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAAF0CAYAAADM5LCYAAAH10lEQVR4nO3bS6h1dR3G8cdrXkBTi5RKqOiCFWG3SWUqUiQogXQbNAkySioIc1AWbzMdZDeimmRkqDgoyUlFSnczKwgCozKLCrRMFCsztdq71oE8aJnP2vu/3s7nA793+q7fOt+zz157rZ0AAAAAwMN7YZILk3w6yVULnE8luSTJ+UnOSvL0JAds+RydkOSMJG9LcvF0TJcv4Nzsns8muSjJK5IcuumT8qLVf/SdJH/fD+e2JFcmeVOSozdwbg5JcnaSTyb56QL2fTTzyySv28C5+afXJ/nLApacY+6ZYnrpDOflqUk+snql+d0C9pprLpnhvDzIy5P8dQGLbWK+luS0R3FOnpHksiT3LWCHTcwFc8Vz8Opl7aYFLLTpuSbJkx/B+Th89c++6VVs9DFvcu5d/YI8bY6AXruAZbY1d077PpyT9+P3N49mPjZHQJ9bwCLbno8/xBXJW/bAq87u+dUcAd24gEVGzLWrN5NHTZf/+xZwPKPmyDagnyxgiVFzQ5JLF3AcI+f4NqCvL2AJM2buny6iKhcvYBEzZq5v41l7fpK/LWAZs/155xwBZbpnMnoZs935RZLD5gro2D32+cden/XHFS+eK54dT0zyvQUsZzY7tyZ5ydzx7DhkejxhL9za2Gtz63TBdMym4tntKUlOT/Kahc0bpxuB60+Tb17AD+b26Zmb902Pkow+P7vnzCTPTnLgtsLZ3zwvyRUDriSvnx7SOmj0CWAe64fhfraFcO5O8oYBT0CyBeuryes2GM/6ib7njl6SzTp8QzeI75reS7AHnJjkjpkDOnP0UmzX+TPGc/XoZdi+9cf0v54hnvXV3Umjl2GMD80Q0PdHL8E4p84Q0PtHL8E4j50hoHNGL8FYD5QBnTF6AcZqvxg4x7db2Y8JiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIiKgKgIiIqAqAiIioCoCIjK/WVAp41egHEeU8aznrNHL8E4z5ohoHNHL8E475ohoM+PXoJxvjFDQH9McuToRdi+U2aIZ2feO3oZtuvAJDfMGNBdSZ4weim25+IZ49mZbyY5dPRibN65G4hnZy5NcvDoBdmMg5JctMF4duYrSY4ZvSzzOiPJD7cQz878djVv9mq0/zouyQuSvCfJjVsMZ/fckuSDSU5NcsL05n3Pe3ySd68ug69LcnOSOxY29wwM5r/NfQs4P7vnN0m+O/15P2nT8bx9umQd/YMwm5n1jeVPrGI6bBPxfHQBC5rtzLeTHDFnPG9dwFJmu3P5XPEcO/2tHL2Q2f6cMkdA5y1gETNmrpwjoC8uYBEzZu6cI6AfLWCRUXPv6v3fbQs4jpFTf6r+4wUsMWLWH1ecnuTEJDct4HhGzePagL60gCW2PesP107+t3Ow/mT7Wws4rm3Pn5Ic0AZ0wQIW2eZ8NcnxD3Ee1ve19iV5YAHHuK25po1n7UmriP68gGU2Pes/We94BL9xr5xu4Yw+3m3Mq+cIaO0DC1hmU7N+Rblsutn5SB2ef70a3b2A49/UXDtXPJmepfl/u5xfX2F9Jskzi/Ny3PTL9YcF7DPn/Hy6aT6r9XuAD8/wTc6Rc/90n+e86Yc/l/UXFM9JcvX0xnP0ns18eY4rr//kOdMd21sW/obyzuny+wvTowpnJTl6kydmsn4u+mWrWC9cvbpdsfp/f5Dk9oWfq98nuSrJq7Zwfh7k4OmDpiXNUds+Cf+DIxZwfnbPRh7dAAAAABbnH/XVl8MOCQd0AAAAAElFTkSuQmCC';
                if (d.cursorType === "pointer") {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="pointer" style="width: 21px; height: 28px; background-image: url(' + pointerSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                } else if (d.cursorType === "text") {
                    iconWrap.innerHTML = '<div class="v4-cursor-visual" data-cursor-visual="text" style="width: 11px; height: 28px; background-image: url(' + ibeamSrc + '); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); pointer-events: none; padding: 0 !important; margin: 0 !important;"></div>';
                } else {
                    iconWrap.innerHTML = '<svg viewBox="0 0 24 24" class="lf-icon v4-cursor-svg" style="width: 24px; height: 24px; display: block; overflow: visible; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none;"><path class="v4-cursor-path" d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" fill="#ffffff" stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round" /></svg>';
                }
            }
        }

        if (d.cursorText !== undefined) {
            container.setAttribute('data-cursor-text', d.cursorText);
            const textEl = container.querySelector('.v4-cursor-text');
            if (textEl && textEl.innerText !== d.cursorText) {
                textEl.innerText = d.cursorText;
            }
            fitCursorWidth(s);
        }

        if (d.showText !== undefined) {
            const isShow = d.showText === true || d.showText === 'true';
            container.setAttribute('data-show-text', isShow ? 'true' : 'false');
            const descBox = container.querySelector('.v4-cursor-desc-box');
            if (descBox) {
                descBox.style.display = isShow ? 'inline-flex' : 'none';
            }

            fitCursorWidth(s);
        }

        if (d.badgeStyle !== undefined) {
            container.setAttribute('data-badge-style', d.badgeStyle);
            const descBox = container.querySelector('.v4-cursor-desc-box');
            const textEl = container.querySelector('.v4-cursor-text');
            if (descBox) {
                if (d.badgeStyle === 'blue') {
                    descBox.style.background = '#1d4ed8';
                    descBox.style.borderColor = '#2563eb';
                    descBox.style.color = '#ffffff';
                } else if (d.badgeStyle === 'light') {
                    descBox.style.background = '#ffffff';
                    descBox.style.borderColor = '#cbd5e1';
                    descBox.style.color = '#0f172a';
                } else {
                    descBox.style.background = '#1e293b';
                    descBox.style.borderColor = '#334155';
                    descBox.style.color = '#ffffff';
                }
                if (textEl) {
                    textEl.style.color = descBox.style.color;
                }
            }
        }

        if (typeof window.enforceDesignSystem === 'function') window.enforceDesignSystem();
        markDirty();

        if (typeof window._getCompStyles === 'function') {
            window.parent.postMessage(Object.assign({
                type: 'LF_COMP_SELECTED'
            }, window._getCompStyles(s)), '*');
        }
    };

})();
`;
