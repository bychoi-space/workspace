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

    // Self-healing: auto-reconcile pins on load if parent state has descriptions
    setTimeout(function() {
        try {
            var currentDescs = (window.parent && window.parent.state && window.parent.state.activeFile && window.parent.state.activeFile.meta && Array.isArray(window.parent.state.activeFile.meta.description))
                ? window.parent.state.activeFile.meta.description
                : null;
            if (currentDescs !== null && typeof window.importResponsivePins === 'function') {
                window.importResponsivePins(currentDescs);
            }
        } catch(e) {}
    }, 120);

    function isResponsiveScreen() {
        return !!(document.querySelector('.pc-content-inner') || document.querySelector('.mobile-content-inner') || document.querySelector('.pc-browser-frame'));
    }
    window.isResponsiveScreen = isResponsiveScreen;

    function getResponsiveContext() {
        var isMobileCompare = !!(document.querySelector('.mobile-compare-page') || (document.querySelector('.mobile-column-left') && document.querySelector('.mobile-column-right')));
        var isPcMobile = !!(document.querySelector('.pc-content-inner') && document.querySelector('.mobile-content-inner'));
        var isAdminPc = !isPcMobile && !isMobileCompare && !!document.querySelector('.pc-content-inner');

        var frame1 = null;
        var frame2 = null;
        var frame1Type = 'pc';
        var frame2Type = 'mobile';
        var ground = document.querySelector('.mobile-compare-page, .page, #canvas-page, .canvas') || document.body;

        if (isMobileCompare) {
            var leftCol = document.querySelector('.mobile-column-left');
            var rightCol = document.querySelector('.mobile-column-right');
            frame1 = leftCol ? (leftCol.querySelector('.mobile-content-inner') || leftCol.querySelector('.mobile-content-area, .mobile-content')) : null;
            frame2 = rightCol ? (rightCol.querySelector('.mobile-content-inner') || rightCol.querySelector('.mobile-content-area, .mobile-content')) : null;
            if (!frame1 || !frame2) {
                var inners = document.querySelectorAll('.mobile-content-inner');
                frame1 = inners[0] || null;
                frame2 = inners[1] || null;
            }
            frame1Type = 'left';
            frame2Type = 'right';
        } else if (isPcMobile) {
            frame1 = document.querySelector('.pc-content-inner') || document.querySelector('.pc-content-area, .pc-content');
            frame2 = document.querySelector('.mobile-content-inner') || document.querySelector('.mobile-content-area, .mobile-content');
            frame1Type = 'pc';
            frame2Type = 'mobile';
        } else if (isAdminPc) {
            frame1 = document.querySelector('.pc-content-inner') || document.querySelector('.pc-content-area, .pc-content');
            frame1Type = 'pc';
        }

        return {
            isMobileCompare: isMobileCompare,
            isPcMobile: isPcMobile,
            isAdminPc: isAdminPc,
            frame1: frame1,
            frame2: frame2,
            frame1Type: frame1Type,
            frame2Type: frame2Type,
            ground: ground
        };
    }
    window.getResponsiveContext = getResponsiveContext;

    function getFrameContainers() {
        var ctx = getResponsiveContext();
        return {
            pcInner: (ctx.frame1Type === 'pc' ? ctx.frame1 : null),
            mobileInner: (ctx.frame2Type === 'mobile' ? ctx.frame2 : (ctx.frame1Type === 'left' ? ctx.frame1 : null)),
            frame1: ctx.frame1,
            frame2: ctx.frame2,
            frame1Type: ctx.frame1Type,
            frame2Type: ctx.frame2Type,
            ground: ctx.ground
        };
    }

    function createSinglePinElement(frame, index, number, customX, customY) {
        var pinId = 'v4-pin-' + frame + '-' + index;
        var pin = document.getElementById(pinId);
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

        var defaultLeft = 50;
        var defaultTop = 150;

        if (frame === 'pc') {
            var pcArea = document.querySelector('.pc-content-area, .pc-content');
            var scrollY = pcArea ? pcArea.scrollTop : 0;
            defaultLeft = Math.round((1000 - 20) / 2);
            defaultTop = Math.round(250 + scrollY);
        } else if (frame === 'left') {
            var leftCol = document.querySelector('.mobile-column-left');
            var leftArea = leftCol ? leftCol.querySelector('.mobile-content-area, .mobile-content') : null;
            var scrollY = leftArea ? leftArea.scrollTop : 0;
            defaultLeft = Math.round((360 - 20) / 2);
            defaultTop = Math.round(250 + scrollY);
        } else if (frame === 'right') {
            var rightCol = document.querySelector('.mobile-column-right');
            var rightArea = rightCol ? rightCol.querySelector('.mobile-content-area, .mobile-content') : null;
            var scrollY = rightArea ? rightArea.scrollTop : 0;
            defaultLeft = Math.round((360 - 20) / 2);
            defaultTop = Math.round(250 + scrollY);
        } else if (frame === 'canvas') {
            defaultLeft = 790;
            defaultTop = 450;
        } else {
            var mobileArea = document.querySelector('.mobile-content-area, .mobile-content');
            var scrollY = mobileArea ? mobileArea.scrollTop : 0;
            defaultLeft = Math.round((360 - 20) / 2);
            defaultTop = Math.round(250 + scrollY);
        }

        var posX = (customX !== undefined && customX !== null && !isNaN(customX)) ? customX : defaultLeft;
        var posY = (customY !== undefined && customY !== null && !isNaN(customY)) ? customY : defaultTop;

        pin.style.left = posX + 'px';
        pin.style.top = posY + 'px';

        pin.innerHTML = '<div class="pin-number-badge" style="pointer-events:none; font-weight:500; font-size:12px; font-family:inherit; line-height:1; color:#ffffff;">' + number + '</div>' +
                        '<div class="lf-delete-trigger" style="right:-10px; top:-10px;">&times;</div>';

        if (typeof window.updateHandles === 'function') {
            window.updateHandles(pin);
        }

        return pin;
    }

    window.spawnResponsiveDualPins = function(index, number, pos1, pos2) {
        if (!isResponsiveScreen()) return;
        var ctx = getResponsiveContext();
        if (!ctx.frame1 && !ctx.frame2) return;

        if (window.V4UndoManager) {
            window.V4UndoManager.saveState();
        }

        var pin1 = null;
        var pin2 = null;

        if (ctx.frame1) {
            var p1X = pos1 ? pos1.x : null;
            var p1Y = pos1 ? pos1.y : null;
            pin1 = createSinglePinElement(ctx.frame1Type, index, number, p1X, p1Y);
            ctx.frame1.appendChild(pin1);

            if (typeof window.notifyParent === 'function') {
                window.notifyParent({
                    type: 'LF_UPDATE_PIN_POS',
                    index: index,
                    frame: ctx.frame1Type,
                    x: parseFloat(pin1.style.left) || 0,
                    y: parseFloat(pin1.style.top) || 0,
                    standardized: true
                });
            }
        }

        if (ctx.frame2) {
            var p2X = pos2 ? pos2.x : null;
            var p2Y = pos2 ? pos2.y : null;
            pin2 = createSinglePinElement(ctx.frame2Type, index, number, p2X, p2Y);
            ctx.frame2.appendChild(pin2);

            if (typeof window.notifyParent === 'function') {
                window.notifyParent({
                    type: 'LF_UPDATE_PIN_POS',
                    index: index,
                    frame: ctx.frame2Type,
                    x: parseFloat(pin2.style.left) || 0,
                    y: parseFloat(pin2.style.top) || 0,
                    standardized: true
                });
            }
        }

        document.querySelectorAll('.lf-component').forEach(function(c) {
            c.classList.remove('selected');
        });

        if (pin1) pin1.classList.add('selected');
        if (pin2) pin2.classList.add('selected');
        window.activeEl = pin1 || pin2;
        window.lastActiveFrame = ctx.frame1Type;

        if (typeof window.notifyParent === 'function') {
            window.notifyParent({
                type: 'LF_COMP_SELECTED',
                id: pin1 ? pin1.id : (pin2 ? pin2.id : ''),
                isTable: false,
                isShape: false,
                isPin: true,
                isDescriptionPin: true,
                pinIndex: index,
                frame: ctx.frame1Type
            });
        }
    };

    window.spawnGroundPin = function(index, number, posX, posY) {
        if (!isResponsiveScreen()) return;
        var ctx = getResponsiveContext();
        var ground = ctx.ground || document.body;

        if (window.V4UndoManager) {
            window.V4UndoManager.saveState();
        }

        var pin = createSinglePinElement('canvas', index, number, posX, posY);
        ground.appendChild(pin);

        if (typeof window.notifyParent === 'function') {
            window.notifyParent({
                type: 'LF_UPDATE_PIN_POS',
                index: index,
                frame: 'canvas',
                x: parseFloat(pin.style.left) || 0,
                y: parseFloat(pin.style.top) || 0,
                standardized: true
            });
        }

        document.querySelectorAll('.lf-component').forEach(function(c) {
            c.classList.remove('selected');
        });

        pin.classList.add('selected');
        window.activeEl = pin;
        window.lastActiveFrame = 'canvas';

        if (typeof window.notifyParent === 'function') {
            window.notifyParent({
                type: 'LF_COMP_SELECTED',
                id: pin.id,
                isTable: false,
                isShape: false,
                isPin: true,
                isDescriptionPin: true,
                pinIndex: index,
                frame: 'canvas'
            });
        }
    };

    function getPinIdx(pin) {
        if (!pin) return 999999;
        var idx = parseInt(pin.getAttribute('data-index'));
        if (isNaN(idx)) {
            idx = parseInt((pin.id || '').replace('v4-pin-pc-', '').replace('v4-pin-mobile-', '').replace('v4-pin-left-', '').replace('v4-pin-right-', '').replace('v4-pin-canvas-', '').replace('v4-pin-', ''));
        }
        return isNaN(idx) ? 999999 : idx;
    }

    window.reorderResponsivePins = function(deletedIndex) {
        if (!isResponsiveScreen()) return;

        try {
            var descList = (window.parent && window.parent.state && window.parent.state.activeFile && window.parent.state.activeFile.meta && window.parent.state.activeFile.meta.description)
                ? window.parent.state.activeFile.meta.description
                : [];

            var maxIndex = descList.length;

            // Step 1: Explicit deletion if deletedIndex is provided
            if (deletedIndex !== undefined && deletedIndex !== null && !isNaN(deletedIndex)) {
                var delIdxNum = Number(deletedIndex);
                document.querySelectorAll('.pin-marker, [data-pin-num]').forEach(function(pin) {
                    if (getPinIdx(pin) === delIdxNum) {
                        pin.remove();
                    }
                });
            }

            var ctx = getResponsiveContext();
            var frame1Selector = ctx.isMobileCompare
                ? '.mobile-column-left .pin-marker, [data-frame="left"].pin-marker'
                : '.pc-content-inner .pin-marker, .pc-content-area .pin-marker, .pc-content .pin-marker, [data-frame="pc"].pin-marker';
            var frame2Selector = ctx.isMobileCompare
                ? '.mobile-column-right .pin-marker, [data-frame="right"].pin-marker'
                : '.mobile-content-inner .pin-marker, .mobile-content-area .pin-marker, .mobile-content .pin-marker, [data-frame="mobile"].pin-marker';
            var canvasSelector = '[data-frame="canvas"].pin-marker';

            var frame1Pins = Array.from(document.querySelectorAll(frame1Selector));
            var frame2Pins = Array.from(document.querySelectorAll(frame2Selector));
            var canvasPins = Array.from(document.querySelectorAll(canvasSelector));

            frame1Pins.sort(function(a, b) { return getPinIdx(a) - getPinIdx(b); });
            frame2Pins.sort(function(a, b) { return getPinIdx(a) - getPinIdx(b); });
            canvasPins.sort(function(a, b) { return getPinIdx(a) - getPinIdx(b); });

            // Step 2: Re-index remaining pins in sequence 0..maxIndex-1
            frame1Pins.forEach(function(pin, i) {
                if (i < maxIndex) {
                    pin.id = 'v4-pin-' + ctx.frame1Type + '-' + i;
                    pin.setAttribute('data-frame', ctx.frame1Type);
                    pin.setAttribute('data-index', String(i));
                    pin.setAttribute('data-pin-num', String(i + 1));
                    var badge = pin.querySelector('.pin-number-badge');
                    if (badge) badge.innerText = String(i + 1);

                    if (descList[i]) {
                        if (!descList[i].pins) descList[i].pins = {};
                        descList[i].pins[ctx.frame1Type] = {
                            x: parseFloat(pin.style.left) || 0,
                            y: parseFloat(pin.style.top) || 0,
                            active: true
                        };
                        if (ctx.isMobileCompare) {
                            descList[i].pins.pc = descList[i].pins.left;
                        }
                        descList[i].x = parseFloat(pin.style.left) || 0;
                        descList[i].y = parseFloat(pin.style.top) || 0;
                        descList[i].standardized = true;
                        descList[i].type = 'pin';
                    }
                } else {
                    pin.remove();
                }
            });

            frame2Pins.forEach(function(pin, i) {
                if (i < maxIndex) {
                    pin.id = 'v4-pin-' + ctx.frame2Type + '-' + i;
                    pin.setAttribute('data-frame', ctx.frame2Type);
                    pin.setAttribute('data-index', String(i));
                    pin.setAttribute('data-pin-num', String(i + 1));
                    var badge = pin.querySelector('.pin-number-badge');
                    if (badge) badge.innerText = String(i + 1);

                    if (descList[i]) {
                        if (!descList[i].pins) descList[i].pins = {};
                        descList[i].pins[ctx.frame2Type] = {
                            x: parseFloat(pin.style.left) || 0,
                            y: parseFloat(pin.style.top) || 0,
                            active: true
                        };
                        if (ctx.isMobileCompare) {
                            descList[i].pins.mobile = descList[i].pins.right;
                        }
                    }
                } else {
                    pin.remove();
                }
            });

            canvasPins.forEach(function(pin, i) {
                if (i < maxIndex) {
                    pin.id = 'v4-pin-canvas-' + i;
                    pin.setAttribute('data-frame', 'canvas');
                    pin.setAttribute('data-index', String(i));
                    pin.setAttribute('data-pin-num', String(i + 1));
                    var badge = pin.querySelector('.pin-number-badge');
                    if (badge) badge.innerText = String(i + 1);

                    if (descList[i]) {
                        if (!descList[i].pins) descList[i].pins = {};
                        descList[i].pins.canvas = {
                            x: parseFloat(pin.style.left) || 0,
                            y: parseFloat(pin.style.top) || 0,
                            active: true
                        };
                        descList[i].target = 'canvas';
                        descList[i].x = parseFloat(pin.style.left) || 0;
                        descList[i].y = parseFloat(pin.style.top) || 0;
                        descList[i].standardized = true;
                        descList[i].type = 'pin';
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
        var pins = document.querySelectorAll('[data-index="' + index + '"]');
        pins.forEach(function(pin) {
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
            var singlePin = document.getElementById('v4-pin-' + index);
            if (singlePin) {
                singlePin.classList.add('selected');
                window.activeEl = singlePin;
                if (typeof window.updateHandles === 'function') window.updateHandles(singlePin);
            }
            return;
        }

        var pins = Array.from(document.querySelectorAll('[data-index="' + index + '"]'));
        pins.forEach(function(pin) {
            pin.classList.add('selected');
        });

        var activePin = null;
        if (window.lastActiveFrame) {
            activePin = pins.find(function(p) {
                var pf = p.getAttribute('data-frame');
                if (!pf && typeof window.detectFrameType === 'function') {
                    pf = window.detectFrameType(p);
                }
                return pf === window.lastActiveFrame;
            });
        }
        if (!activePin) {
            activePin = pins[0] || null;
        }
        if (activePin) {
            window.activeEl = activePin;
            if (typeof window.updateHandles === 'function') {
                window.updateHandles(activePin);
            }
        }

        var isDragging = window.V4DragResizeEngine && (window.V4DragResizeEngine.isDragging || window.V4DragResizeEngine.isPendingDrag);
        var allowScroll = (shouldScroll !== false) && !isDragging;

        if (allowScroll) {
            pins.forEach(function(pin) {
                var scrollArea = pin.closest('.mobile-content-area, .mobile-content, .pc-content-area, .pc-content');
                if (scrollArea) {
                    var pinTop = parseFloat(pin.style.top) || pin.offsetTop || 0;
                    var targetTop = Math.max(0, pinTop - (scrollArea.clientHeight / 2) + 10);
                    scrollArea.scrollTo({ top: targetTop, behavior: 'smooth' });
                }
            });
        }

        pins.forEach(function(pin) {
            pin.classList.remove('pin-active-pulse');
            void pin.offsetWidth;
            pin.classList.add('pin-active-pulse');
            setTimeout(function() {
                if (pin) pin.classList.remove('pin-active-pulse');
            }, 1500);
        });
    };

    window.importResponsivePins = function(pins) {
        if (!isResponsiveScreen()) return;
        pins = Array.isArray(pins) ? pins : [];
        var ctx = getResponsiveContext();
        if (!ctx.frame1 && !ctx.frame2 && !ctx.ground) return;

        // [CRITICAL DEFENSE & SELF-HEALING] Collect valid pin IDs according to pins metadata
        var validPinIds = {};
        pins.forEach(function(item, idx) {
            var isGround = item.target === 'canvas' && (!item.pins || (!item.pins.left && !item.pins.right && !item.pins.pc && !item.pins.mobile));
            if (isGround) {
                validPinIds['v4-pin-canvas-' + idx] = true;
            } else {
                if (ctx.frame1) validPinIds['v4-pin-' + ctx.frame1Type + '-' + idx] = true;
                if (ctx.frame2) validPinIds['v4-pin-' + ctx.frame2Type + '-' + idx] = true;
            }
        });

        // Purge any orphan/ghost pin marker elements not matching metadata
        var existingPins = document.querySelectorAll('.pin-marker, [id^="v4-pin-"]');
        existingPins.forEach(function(p) {
            if (!validPinIds[p.id]) {
                console.log("[RESPONSIVE PINS] Purged orphan/ghost pin marker:", p.id);
                p.remove();
            }
        });

        pins.forEach(function(item, idx) {
            var num = idx + 1;
            var isGround = item.target === 'canvas' && (!item.pins || (!item.pins.left && !item.pins.right && !item.pins.pc && !item.pins.mobile));

            if (isGround) {
                var canPos = (item.pins && item.pins.canvas) ? item.pins.canvas : { x: item.x || 790, y: item.y || 450 };
                var groundTarget = ctx.ground || document.body;
                var existingCan = document.getElementById('v4-pin-canvas-' + idx);
                if (!existingCan) {
                    var canPin = createSinglePinElement('canvas', idx, num, canPos.x, canPos.y);
                    groundTarget.appendChild(canPin);
                } else {
                    existingCan.style.left = canPos.x + 'px';
                    existingCan.style.top = canPos.y + 'px';
                }
                return;
            }

            var p1Pos = null;
            var p2Pos = null;

            if (ctx.isMobileCompare) {
                p1Pos = (item.pins && item.pins.left) ? item.pins.left : ((item.pins && item.pins.pc) ? item.pins.pc : { x: (item.x !== undefined ? item.x : 0), y: (item.y !== undefined ? item.y : 545) });
                p2Pos = (item.pins && item.pins.right) ? item.pins.right : ((item.pins && item.pins.mobile) ? item.pins.mobile : { x: (item.x !== undefined ? item.x : 0), y: (item.y !== undefined ? item.y : 545) });
            } else {
                p1Pos = (item.pins && item.pins.pc) ? item.pins.pc : { x: item.x || 500, y: item.y || 300 };
                p2Pos = (item.pins && item.pins.mobile) ? item.pins.mobile : { x: 180, y: 300 };
            }

            if (ctx.frame1) {
                var existing1 = document.getElementById('v4-pin-' + ctx.frame1Type + '-' + idx);
                if (!existing1) {
                    var pin1 = createSinglePinElement(ctx.frame1Type, idx, num, p1Pos.x, p1Pos.y);
                    ctx.frame1.appendChild(pin1);
                } else {
                    existing1.style.left = p1Pos.x + 'px';
                    existing1.style.top = p1Pos.y + 'px';
                }
            }

            if (ctx.frame2) {
                var existing2 = document.getElementById('v4-pin-' + ctx.frame2Type + '-' + idx);
                if (!existing2) {
                    var pin2 = createSinglePinElement(ctx.frame2Type, idx, num, p2Pos.x, p2Pos.y);
                    ctx.frame2.appendChild(pin2);
                } else {
                    existing2.style.left = p2Pos.x + 'px';
                    existing2.style.top = p2Pos.y + 'px';
                }
            }
        });
    };

    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_IMPORT_PINS'] = function(d) {
        if (isResponsiveScreen()) {
            window.importResponsivePins(d ? d.pins : []);
            return;
        }
        const host = document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body;
        const validLegacyIds = {};
        const safePins = (d && Array.isArray(d.pins)) ? d.pins : [];
        safePins.forEach(function(pin, idx) {
            validLegacyIds['v4-pin-' + idx] = true;
        });
        document.querySelectorAll('.pin-marker, [id^="v4-pin-"]').forEach(function(p) {
            if (!validLegacyIds[p.id]) {
                p.remove();
            }
        });

        safePins.forEach(function(pin, idx) {
            let div = document.getElementById('v4-pin-' + idx);
            if (div) return;
            
            div = document.createElement('div');
            div.id = 'v4-pin-' + idx;
            host.appendChild(div);
            
            const isPinType = (pin.type === 'pin' || pin.type === undefined);
            div.className = 'lf-component ' + (isPinType ? 'pin-marker' : 'text-marker');
            
            if (isPinType) {
                div.setAttribute('data-index', idx);
                div.setAttribute('data-pin-num', idx + 1);
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
            window.reorderResponsivePins(d ? d.deletedIndex : undefined);
            return;
        }
        document.querySelectorAll('.pin-marker, .text-marker').forEach(function(el) { el.remove(); });
        const host = document.querySelector('.canvas, .page, #canvas-page, #canvas') || document.body;
        const pinsList = d.pins || [];
        pinsList.forEach(function(pin, idx) {
            const div = document.createElement('div');
            div.id = 'v4-pin-' + idx;
            host.appendChild(div);
            
            const isPinType = (pin.type === 'pin' || pin.type === undefined);
            div.className = 'lf-component ' + (isPinType ? 'pin-marker' : 'text-marker');
            
            if (isPinType) {
                div.setAttribute('data-index', idx);
                div.setAttribute('data-pin-num', idx + 1);
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
                const curAlign = d.align || comp.getAttribute('data-align') || cell.getAttribute('data-align') || cell.style.textAlign || 'left';
                const hAlign = curAlign === 'left' ? 'flex-start' : (curAlign === 'right' ? 'flex-end' : 'center');
                const curVAlign = d.vAlign || comp.getAttribute('data-valign') || cell.getAttribute('data-valign') || 'middle';
                const vJustify = curVAlign === 'top' || curVAlign === 'flex-start' ? 'flex-start' : (curVAlign === 'bottom' || curVAlign === 'flex-end' ? 'flex-end' : 'center');
                const normVAlign = curVAlign === 'flex-start' ? 'top' : (curVAlign === 'flex-end' ? 'bottom' : (curVAlign || 'middle'));
                comp.setAttribute('data-align', curAlign);
                cell.setAttribute('data-align', curAlign);
                comp.setAttribute('data-valign', normVAlign);
                cell.setAttribute('data-valign', normVAlign);
                cell.style.setProperty('text-align', curAlign, 'important');
                cell.style.setProperty('align-items', hAlign, 'important');
                cell.style.setProperty('justify-content', vJustify, 'important');
                cell.querySelectorAll('p').forEach(p => {
                    p.style.setProperty('width', '100%', 'important');
                    p.style.setProperty('text-align', curAlign, 'important');
                });
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
            window.spawnResponsiveDualPins(d.index, d.number, d.pcPos || d.pos1, d.mobilePos || d.pos2);
        } else if (d.type === 'LF_INSERT_GROUND_PIN') {
            window.spawnGroundPin(d.index, d.number, d.x, d.y);
        } else if (d.type === 'LF_FOCUS_PIN') {
            window.focusResponsivePin(d.index, d.scroll !== false);
        } else if (d.type === 'LF_HIGHLIGHT_PIN') {
            window.highlightResponsivePins(d.index, !!d.active);
        } else if (d.type === 'LF_IMPORT_RESPONSIVE_PINS') {
            window.importResponsivePins(d.pins);
        } else if (d.type === 'LF_REORDER_RESPONSIVE_PINS') {
            window.reorderResponsivePins(d ? d.deletedIndex : undefined);
        } else if (d.type === 'LF_REORDER_PINS') {
            window.reorderAllPins(d ? d.deletedIndex : undefined);
        }
    });

    document.addEventListener('dblclick', function(e) {
        if (!isResponsiveScreen()) return;
        var target = e.target;
        if (!target) return;

        if (target.closest('.mobile-content-inner, .pc-content-inner, .mobile-content-area, .pc-content-area, .lf-component, .v4-editable-cell, input, textarea, button')) {
            return;
        }

        var page = document.querySelector('.mobile-compare-page, .page, #canvas-page');
        if (page && (page.contains(target) || target === document.body || target === document.documentElement)) {
            var groundX = Math.round(e.pageX);
            var groundY = Math.round(e.pageY);
            if (typeof window.notifyParent === 'function') {
                window.notifyParent({
                    type: 'LF_CREATE_GROUND_PIN',
                    x: groundX,
                    y: groundY
                });
            }
        }
    });

    // Universal Pin Reorder Engine (Standard & Responsive SSOT)
    window.reorderAllPins = function(deletedIndex) {
        if (typeof window.isResponsiveScreen === 'function' && window.isResponsiveScreen()) {
            if (typeof window.reorderResponsivePins === 'function') {
                return window.reorderResponsivePins(deletedIndex);
            }
        }
        
        if (deletedIndex !== undefined && deletedIndex !== null && !isNaN(deletedIndex)) {
            var delIdxNum = Number(deletedIndex);
            document.querySelectorAll('.text-marker, .pin-marker').forEach(function(pin) {
                if (getPinIdx(pin) === delIdxNum) {
                    pin.remove();
                }
            });
        }

        var pins = Array.from(document.querySelectorAll('.text-marker, .pin-marker'));
        pins.sort(function(a, b) { return getPinIdx(a) - getPinIdx(b); });

        pins.forEach(function(pin, idx) {
            pin.id = 'v4-pin-' + idx;
            pin.setAttribute('data-index', String(idx));
            pin.setAttribute('data-pin-num', String(idx + 1));
            var badge = pin.querySelector('.pin-number-badge');
            if (badge) {
                badge.innerText = idx + 1;
            }
        });
        try {
            if (window.parent && window.parent.state && window.parent.state.activeFile) {
                var descList = window.parent.state.activeFile.meta.description || [];
                var remainingPins = Array.from(document.querySelectorAll('.text-marker, .pin-marker'));
                remainingPins.sort(function(a, b) { return getPinIdx(a) - getPinIdx(b); });
                if (descList.length > remainingPins.length) {
                    descList.splice(remainingPins.length);
                }
                remainingPins.forEach(function(pin, idx) {
                    var isPinType = pin.classList.contains('pin-marker');
                    if (!descList[idx]) {
                        descList[idx] = {};
                    }
                    descList[idx].x = parseFloat(pin.style.left) || 0;
                    descList[idx].y = parseFloat(pin.style.top) || 0;
                    descList[idx].standardized = true;
                    if (isPinType) {
                        descList[idx].type = 'pin';
                    } else {
                        var editable = pin.querySelector('.v4-editable-cell');
                        var textContent = editable ? editable.innerText.trim() : "Edit Text";
                        var htmlContent = editable ? editable.innerHTML : pin.innerHTML;
                        descList[idx].type = 'text';
                        descList[idx].text = textContent;
                        descList[idx].html = htmlContent;
                    }
                });
                if (typeof window.parent.renderDescriptionList === 'function') {
                    window.parent.renderDescriptionList();
                }
            }
        } catch (e) {
            console.warn("[Pins] Parent window access guarded under file:// protocol:", e);
        }
    };

})();
`;
