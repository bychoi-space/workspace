/**
 * assets/vctrl_responsive_pins.js
 * 
 * Dedicated Dual-Frame Pin Marker Manager for Responsive PC & Mobile Screens.
 * - Spawns linked dual pin markers (PC & Mobile) with identical numbers for a single description.
 * - Manages independent frame-level coordinates and prevents cross-frame ID collisions.
 * - Strictly isolated: 0% interference or side-effects on standard non-responsive templates.
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4ResponsivePinsScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.v4ResponsivePinsScript = `
(function() {
    console.log("%c [RESPONSIVE PINS] Dedicated Module Initialized ", "background: #6366f1; color: #ffffff; font-weight: bold; padding: 4px; border-radius: 4px;");

    function isResponsiveScreen() {
        return !!(document.querySelector('.pc-content-inner') || document.querySelector('.mobile-content-inner') || document.querySelector('.pc-browser-frame'));
    }
    window.isResponsiveScreen = isResponsiveScreen;

    function getFrameContainers() {
        const pcInner = document.querySelector('.pc-content-inner') || document.querySelector('.pc-content-area, .pc-content');
        const mobileInner = document.querySelector('.mobile-content-inner') || document.querySelector('.mobile-content-area, .mobile-content');
        return { pcInner, mobileInner };
    }

    function createSinglePinElement(frame, index, number, customX, customY) {
        const pinId = 'v4-pin-' + frame + '-' + index;
        let pin = document.getElementById(pinId);
        if (pin) return pin;

        pin = document.createElement('div');
        pin.id = pinId;
        pin.className = 'lf-component pin-marker';
        pin.setAttribute('data-frame', frame);
        pin.setAttribute('data-index', String(index));
        pin.setAttribute('data-pin-num', String(number));
        pin.style.position = 'absolute';
        pin.style.width = '20px';
        pin.style.height = '20px';
        pin.style.zIndex = '200000';

        let defaultLeft = 50;
        let defaultTop = 150;

        if (frame === 'pc') {
            const pcArea = document.querySelector('.pc-content-area, .pc-content');
            const scrollY = pcArea ? pcArea.scrollTop : 0;
            defaultLeft = Math.round((1000 - 20) / 2);
            defaultTop = Math.round(250 + scrollY);
        } else {
            const mobileArea = document.querySelector('.mobile-content-area, .mobile-content');
            const scrollY = mobileArea ? mobileArea.scrollTop : 0;
            defaultLeft = Math.round((360 - 20) / 2);
            defaultTop = Math.round(250 + scrollY);
        }

        const posX = (customX !== undefined && customX !== null && !isNaN(customX)) ? customX : defaultLeft;
        const posY = (customY !== undefined && customY !== null && !isNaN(customY)) ? customY : defaultTop;

        pin.style.left = posX + 'px';
        pin.style.top = posY + 'px';

        pin.innerHTML = '<div class="pin-number-badge" style="pointer-events:none; font-weight:500; font-size:12px; font-family:inherit; line-height:1; color:#ffffff;">' + number + '</div>' +
                        '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';

        if (typeof window.updateHandles === 'function') {
            window.updateHandles(pin);
        }

        return pin;
    }

    window.spawnResponsiveDualPins = function(index, number, pcPos, mobilePos) {
        if (!isResponsiveScreen()) return;
        const { pcInner, mobileInner } = getFrameContainers();
        if (!pcInner && !mobileInner) return;

        if (window.V4UndoManager) {
            window.V4UndoManager.saveState();
        }

        let pcPin = null;
        let mobPin = null;

        if (pcInner) {
            const pcX = pcPos ? pcPos.x : null;
            const pcY = pcPos ? pcPos.y : null;
            pcPin = createSinglePinElement('pc', index, number, pcX, pcY);
            pcInner.appendChild(pcPin);

            if (typeof window.notifyParent === 'function') {
                window.notifyParent({
                    type: 'LF_UPDATE_PIN_POS',
                    index: index,
                    frame: 'pc',
                    x: parseFloat(pcPin.style.left) || 0,
                    y: parseFloat(pcPin.style.top) || 0,
                    standardized: true
                });
            }
        }

        if (mobileInner) {
            const mobX = mobilePos ? mobilePos.x : null;
            const mobY = mobilePos ? mobilePos.y : null;
            mobPin = createSinglePinElement('mobile', index, number, mobX, mobY);
            mobileInner.appendChild(mobPin);

            if (typeof window.notifyParent === 'function') {
                window.notifyParent({
                    type: 'LF_UPDATE_PIN_POS',
                    index: index,
                    frame: 'mobile',
                    x: parseFloat(mobPin.style.left) || 0,
                    y: parseFloat(mobPin.style.top) || 0,
                    standardized: true
                });
            }
        }

        document.querySelectorAll('.lf-component').forEach(function(c) {
            c.classList.remove('selected');
        });

        if (pcPin) pcPin.classList.add('selected');
        if (mobPin) mobPin.classList.add('selected');

        if (typeof window.notifyParent === 'function') {
            window.notifyParent({
                type: 'LF_COMP_SELECTED',
                id: pcPin ? pcPin.id : (mobPin ? mobPin.id : ''),
                isTable: false,
                isShape: false,
                isPin: true,
                isDescriptionPin: true,
                pinIndex: index,
                frame: 'pc'
            });
        }
    };

    window.reorderResponsivePins = function() {
        if (!isResponsiveScreen()) return;

        try {
            const descList = (window.parent && window.parent.state && window.parent.state.activeFile && window.parent.state.activeFile.meta && window.parent.state.activeFile.meta.description)
                ? window.parent.state.activeFile.meta.description
                : [];

            const pcPins = Array.from(document.querySelectorAll('.pc-content-inner .pin-marker, .pc-content-area .pin-marker, .pc-content .pin-marker, [data-frame="pc"].pin-marker'));
            const mobilePins = Array.from(document.querySelectorAll('.mobile-content-inner .pin-marker, .mobile-content-area .pin-marker, .mobile-content .pin-marker, [data-frame="mobile"].pin-marker'));

            const maxIndex = descList.length;

            pcPins.forEach(function(pin, i) {
                if (i < maxIndex) {
                    pin.id = 'v4-pin-pc-' + i;
                    pin.setAttribute('data-frame', 'pc');
                    pin.setAttribute('data-index', String(i));
                    pin.setAttribute('data-pin-num', String(i + 1));
                    const badge = pin.querySelector('.pin-number-badge');
                    if (badge) badge.innerText = String(i + 1);

                    if (descList[i]) {
                        if (!descList[i].pins) descList[i].pins = {};
                        descList[i].pins.pc = {
                            x: parseFloat(pin.style.left) || 0,
                            y: parseFloat(pin.style.top) || 0,
                            active: true
                        };
                        descList[i].x = parseFloat(pin.style.left) || 0;
                        descList[i].y = parseFloat(pin.style.top) || 0;
                        descList[i].standardized = true;
                        descList[i].type = 'pin';
                    }
                } else {
                    pin.remove();
                }
            });

            mobilePins.forEach(function(pin, i) {
                if (i < maxIndex) {
                    pin.id = 'v4-pin-mobile-' + i;
                    pin.setAttribute('data-frame', 'mobile');
                    pin.setAttribute('data-index', String(i));
                    pin.setAttribute('data-pin-num', String(i + 1));
                    const badge = pin.querySelector('.pin-number-badge');
                    if (badge) badge.innerText = String(i + 1);

                    if (descList[i]) {
                        if (!descList[i].pins) descList[i].pins = {};
                        descList[i].pins.mobile = {
                            x: parseFloat(pin.style.left) || 0,
                            y: parseFloat(pin.style.top) || 0,
                            active: true
                        };
                    }
                } else {
                    pin.remove();
                }
            });

            if (window.parent && typeof window.parent.renderDescriptionList === 'function') {
                window.parent.renderDescriptionList();
            }
        } catch (e) {
            console.warn("[ResponsivePins] reorderResponsivePins error:", e);
        }
    };

    window.highlightResponsivePins = function(index, active) {
        if (!isResponsiveScreen()) return;
        const pcPin = document.getElementById('v4-pin-pc-' + index);
        const mobPin = document.getElementById('v4-pin-mobile-' + index);

        [pcPin, mobPin].forEach(function(pin) {
            if (!pin) return;
            if (active) {
                pin.classList.add('highlight-pin');
                pin.style.outline = '2px solid #ef4444';
                pin.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.6)';
            } else {
                pin.classList.remove('highlight-pin');
                pin.style.outline = '';
                pin.style.boxShadow = '';
            }
        });
    };

    window.focusResponsivePin = function(index, shouldScroll) {
        document.querySelectorAll('.lf-component.selected').forEach(function(el) {
            el.classList.remove('selected');
        });

        if (!isResponsiveScreen()) {
            const singlePin = document.getElementById('v4-pin-' + index);
            if (singlePin) {
                singlePin.classList.add('selected');
                window.activeEl = singlePin;
                if (typeof window.updateHandles === 'function') window.updateHandles(singlePin);
            }
            return;
        }

        const pcArea = document.querySelector('.pc-content-area, .pc-content');
        const mobArea = document.querySelector('.mobile-content-area, .mobile-content');
        const pcPin = document.getElementById('v4-pin-pc-' + index) || document.querySelector('[data-frame="pc"][data-index="' + index + '"]');
        const mobPin = document.getElementById('v4-pin-mobile-' + index) || document.querySelector('[data-frame="mobile"][data-index="' + index + '"]');

        if (pcPin) pcPin.classList.add('selected');
        if (mobPin) mobPin.classList.add('selected');

        const activePin = (window.lastActiveFrame === 'mobile' ? mobPin : pcPin) || pcPin || mobPin;
        if (activePin) {
            window.activeEl = activePin;
            if (typeof window.updateHandles === 'function') {
                window.updateHandles(activePin);
            }
        }

        const isDragging = window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isPendingDrag);
        const allowScroll = (shouldScroll !== false) && !isDragging;

        if (allowScroll) {
            if (pcArea && pcPin) {
                const pinTop = parseFloat(pcPin.style.top) || pcPin.offsetTop || 0;
                const targetTop = Math.max(0, pinTop - (pcArea.clientHeight / 2) + 10);
                pcArea.scrollTo({ top: targetTop, behavior: 'smooth' });
            }

            if (mobArea && mobPin) {
                const pinTop = parseFloat(mobPin.style.top) || mobPin.offsetTop || 0;
                const targetTop = Math.max(0, pinTop - (mobArea.clientHeight / 2) + 10);
                mobArea.scrollTo({ top: targetTop, behavior: 'smooth' });
            }
        }

        [pcPin, mobPin].forEach(function(pin) {
            if (!pin) return;
            pin.classList.remove('pin-active-pulse');
            void pin.offsetWidth;
            pin.classList.add('pin-active-pulse');
            setTimeout(function() {
                if (pin) pin.classList.remove('pin-active-pulse');
            }, 1500);
        });
    };

    window.importResponsivePins = function(pins) {
        if (!isResponsiveScreen() || !Array.isArray(pins)) return;
        const { pcInner, mobileInner } = getFrameContainers();
        if (!pcInner && !mobileInner) return;

        pins.forEach(function(item, idx) {
            const num = idx + 1;
            const pcPos = (item.pins && item.pins.pc) ? item.pins.pc : { x: item.x || 50, y: item.y || 150 };
            const mobPos = (item.pins && item.pins.mobile) ? item.pins.mobile : { x: 50, y: 150 };

            if (pcInner) {
                const pcPin = createSinglePinElement('pc', idx, num, pcPos.x, pcPos.y);
                if (!document.getElementById(pcPin.id)) {
                    pcInner.appendChild(pcPin);
                }
            }

            if (mobileInner) {
                const mobPin = createSinglePinElement('mobile', idx, num, mobPos.x, mobPos.y);
                if (!document.getElementById(mobPin.id)) {
                    mobileInner.appendChild(mobPin);
                }
            }
        });
    };

    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_IMPORT_PINS'] = function(d) {
        if (isResponsiveScreen()) {
            window.importResponsivePins(d.pins);
            return;
        }
        const host = document.body;
        (d.pins || []).forEach(function(pin, idx) {
            let div = document.getElementById('v4-pin-' + idx);
            if (div) return;
            
            div = document.createElement('div');
            div.id = 'v4-pin-' + idx;
            host.appendChild(div);
            
            const isPinType = (pin.type === 'pin' || pin.type === undefined);
            div.className = 'lf-component ' + (isPinType ? 'pin-marker' : 'text-marker');
            
            if (isPinType) {
                div.innerHTML = '<div class="pin-number-badge" style="pointer-events:none; font-weight:500; font-size:12px; font-family:inherit; line-height:1; color:#ffffff;">' + (idx + 1) + '</div>' +
                                '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';
                div.style.width = '20px';
                div.style.height = '20px';
            } else {
                div.innerHTML = '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:' + (pin.color || '#000') + '">' + (pin.html || pin.text || '') + '</div>' +
                                '<div class="lf-delete-trigger">&times;</div>';
                div.style.width = 'fit-content';
                div.style.height = 'auto';
            }
            div.style.zIndex = '200000';

            let xVal = parseFloat(pin.x) || 0;
            let yVal = parseFloat(pin.y) || 0;
            
            if (!pin.standardized && xVal <= 100 && yVal <= 100) {
                xVal = xVal * 14.4;
                yVal = yVal * 9.0;
            }

            div.style.left = xVal + 'px';
            div.style.top = yVal + 'px';
            
            if (typeof window.updateHandles === 'function') window.updateHandles(div);
        });
    };

    window.v4MessageHandlers['LF_REORDER_PINS'] = function(d) {
        if (isResponsiveScreen()) {
            window.reorderResponsivePins();
            return;
        }
        document.querySelectorAll('.pin-marker, .text-marker').forEach(function(el) { el.remove(); });
        const host = document.body;
        const pinsList = d.pins || [];
        pinsList.forEach(function(pin, idx) {
            const div = document.createElement('div');
            div.id = 'v4-pin-' + idx;
            host.appendChild(div);
            
            const isPinType = (pin.type === 'pin' || pin.type === undefined);
            div.className = 'lf-component ' + (isPinType ? 'pin-marker' : 'text-marker');
            
            if (isPinType) {
                div.innerHTML = '<div class="pin-number-badge" style="pointer-events:none; font-weight:500; font-size:12px; font-family:inherit; line-height:1; color:#ffffff;">' + (idx + 1) + '</div>' +
                                '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';
                div.style.width = '20px';
                div.style.height = '20px';
            } else {
                div.innerHTML = '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:' + (pin.color || '#000') + '">' + (pin.html || pin.text || '') + '</div>' +
                                '<div class="lf-delete-trigger">&times;</div>';
                div.style.width = 'fit-content';
                div.style.height = 'auto';
            }
            div.style.zIndex = '200000';

            let xVal = parseFloat(pin.x) || 0;
            let yVal = parseFloat(pin.y) || 0;
            
            if (!pin.standardized && xVal <= 100 && yVal <= 100) {
                xVal = xVal * 14.4;
                yVal = yVal * 9.0;
            }

            div.style.left = xVal + 'px';
            div.style.top = yVal + 'px';
            
            if (typeof window.updateHandles === 'function') window.updateHandles(div);
        });
    };

    window.v4MessageHandlers['LF_UPDATE_PIN_CONTENT'] = function(d) {
        const comp = (d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
        if (comp) {
            const cell = comp.querySelector('.v4-editable-cell') || (comp.classList.contains('v4-editable-cell') ? comp : null);
            if (cell) {
                if (document.activeElement && (cell === document.activeElement || cell.contains(document.activeElement))) {
                    return;
                }
                if (window.V4UndoManager) window.V4UndoManager.saveState();
                cell.innerHTML = d.html;
                if (typeof window.markDirty === 'function') window.markDirty();
                if (typeof window.resizeToFitText === 'function') {
                    window.resizeToFitText(comp);
                }
            }
        }
    };

    window.addEventListener('message', function(e) {
        const d = e.data;
        if (!d || typeof d !== 'object') return;

        if (d.type === 'LF_INSERT_RESPONSIVE_PINS') {
            window.spawnResponsiveDualPins(d.index, d.number, d.pcPos, d.mobilePos);
        } else if (d.type === 'LF_FOCUS_PIN') {
            window.focusResponsivePin(d.index, d.scroll !== false);
        } else if (d.type === 'LF_HIGHLIGHT_PIN') {
            window.highlightResponsivePins(d.index, !!d.active);
        } else if (d.type === 'LF_IMPORT_RESPONSIVE_PINS') {
            window.importResponsivePins(d.pins);
        } else if (d.type === 'LF_REORDER_RESPONSIVE_PINS') {
            window.reorderResponsivePins();
        }
    });

})();
`;
