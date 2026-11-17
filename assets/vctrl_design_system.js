/**
 * assets/vctrl_design_system.js
 * Core Design System Orchestrator, MutationObserver & Media/Admin Layout Enforcer (Iframe Side).
 * Delegates Atom box normalization to vctrl_design_system_atoms.js and Shape/Table rules to vctrl_design_system_shapes_tables.js.
 *
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4DesignSystemScript).
 * 1. DO NOT use inner backticks or template interpolation inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 */

window.v4DesignSystemScript = `
(function() {
    const _stripAllWhitespace = function(str) {
        if (!str) return '';
        return String(str).split(' ').join('').split(String.fromCharCode(9)).join('').split(String.fromCharCode(10)).join('').split(String.fromCharCode(13)).join('');
    };

    const _stripSelectedClassToken = function(clsStr) {
        if (!clsStr) return '';
        return String(clsStr).split(' ').filter(function(tok) {
            return tok && tok !== 'selected';
        }).join(' ');
    };

    const _enforceEarlyTextAutoSizing = function() {
        if (typeof window.initHandles === 'function') {
            try { window.initHandles(); } catch (e) { console.error("Error in initHandles:", e); }
        }

        try {
            document.querySelectorAll('.bychoi-component').forEach(function(c) {
                if (c.closest && c.closest('.bychoi-group')) return;
                const shapeText = c.querySelector('.v4-shape-text');
                const hasText = c.querySelector('.v4-shape-text-content') || c.querySelector('.v4-shape-text-overlay') || c.querySelector('.v4-editable-cell') || (shapeText && shapeText.querySelector('p'));
                if (shapeText && hasText) {
                    let textContainer = shapeText.querySelector('.v4-shape-text-content') || shapeText.querySelector('.v4-shape-text-overlay') || shapeText.querySelector('.v4-editable-cell');
                    if (!textContainer) {
                        const pElements = Array.from(shapeText.querySelectorAll('p, span, font'));
                        const container = document.createElement('div');
                        container.className = 'v4-shape-text-content';
                        container.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0px; box-sizing: border-box; overflow: hidden;';
                        pElements.forEach(function(p) { container.appendChild(p); });
                        if (container.childNodes.length === 0) {
                            container.innerHTML = '<p><br></p>';
                        }
                        shapeText.appendChild(container);
                    }
                    if (window.resizeToFitText) window.resizeToFitText(c, true);
                }
            });
            document.querySelectorAll('.text-marker, .v4-text-box, .v4-text-shape').forEach(function(c) {
                if (c.closest && c.closest('.bychoi-group')) return;
                if (c.querySelector('.v4-shape')) return;
                const isManualResized = c.getAttribute('data-resized') === 'true';
                if (!isManualResized) {
                    if (window.resizeToFitText) window.resizeToFitText(c, false);
                }
            });
        } catch (e) {
            console.error("[DesignSystem] Error in early resizeToFitText:", e);
        }
    };

    const _bindAllAtomInteractiveEvents = function() {
        try { if (window.bindStepperEvents) window.bindStepperEvents(); } catch (e) { console.error("Error in bindStepperEvents:", e); }
        try { if (window.bindFileuploadEvents) window.bindFileuploadEvents(); } catch (e) { console.error("Error in bindFileuploadEvents:", e); }
        try { if (window.bindAccordionEvents) window.bindAccordionEvents(); } catch (e) { console.error("Error in bindAccordionEvents:", e); }
        try { if (window.bindAdminSettingsEvents) window.bindAdminSettingsEvents(); } catch (e) { console.error("Error in bindAdminSettingsEvents:", e); }
        try { if (window.bindToggleEvents) window.bindToggleEvents(); } catch (e) { console.error("Error in bindToggleEvents:", e); }
        try { if (window.bindCursorEvents) window.bindCursorEvents(); } catch (e) { console.error("Error in bindCursorEvents:", e); }
        try { if (window.bindWebEditorEvents) window.bindWebEditorEvents(); } catch (e) { console.error("Error in bindWebEditorEvents:", e); }
        try { if (window.bindSelectboxEvents) window.bindSelectboxEvents(); } catch (e) { console.error("Error in bindSelectboxEvents:", e); }
        try { if (window.bindIaTreeTables) window.bindIaTreeTables(); } catch (e) { console.error("Error in bindIaTreeTables:", e); }
    };

    const _enforcePatternAndIconStyles = function() {
        try {
            document.querySelectorAll('.v4-shape-pattern-grid').forEach(function(t) {
                if (t.style.overflow !== 'hidden') {
                    t.style.setProperty('overflow', 'hidden', 'important');
                }
                const pType = t.getAttribute('data-pattern-type') || 'grid';
                let bgImg = '';
                let bgSize = '';

                if (pType === 'grid') {
                    bgImg = 'linear-gradient(45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)), linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08))';
                    bgSize = '12px 12px';
                } else if (pType === 'dots') {
                    bgImg = 'radial-gradient(rgba(0, 0, 0, 0.15) 15%, transparent 16%)';
                    bgSize = '12px 12px';
                } else if (pType === 'stripes') {
                    bgImg = 'linear-gradient(45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.08) 50%, rgba(0, 0, 0, 0.08) 75%, transparent 75%, transparent)';
                    bgSize = '12px 12px';
                } else if (pType === 'horizontal') {
                    bgImg = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)';
                    bgSize = '100% 12px';
                } else if (pType === 'vertical') {
                    bgImg = 'linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px)';
                    bgSize = '12px 100%';
                }

                const curBgImg = t.style.backgroundImage || '';
                const curBgSize = t.style.backgroundSize || '';
                const curBgColor = t.style.backgroundColor || '';

                const cleanImg = function(str) {
                    return _stripAllWhitespace(str).split('"').join('').split("'").join('');
                };
                if (cleanImg(curBgImg) !== cleanImg(bgImg)) {
                    t.style.setProperty('background-image', bgImg, 'important');
                }
                if (curBgSize !== bgSize) {
                    t.style.setProperty('background-size', bgSize, 'important');
                }
                if (curBgColor !== 'rgb(255, 255, 255)' && curBgColor !== '#ffffff' && curBgColor !== 'white') {
                    t.style.setProperty('background-color', '#ffffff', 'important');
                }
            });
        } catch (e) {
            console.error("Error in pattern shape style enforcement:", e);
        }

        try {
            document.querySelectorAll('.bychoi-component > svg.bychoi-icon:not(.v4-logo-img), .bychoi-component .v4-searchbar-icon-wrap svg').forEach(function(svg) {
                if (svg.getAttribute('stroke-width') && svg.getAttribute('stroke-width') !== '1.2') {
                    svg.setAttribute('stroke-width', '1.2');
                }
                svg.querySelectorAll('path, circle, rect, line, polyline, polygon').forEach(function(shape) {
                    if (shape.getAttribute('stroke-width') && shape.getAttribute('stroke-width') !== '1.2') {
                        shape.setAttribute('stroke-width', '1.2');
                    }
                    if (shape.style.strokeWidth && shape.style.strokeWidth !== '1.2' && shape.style.strokeWidth !== '1.2px') {
                        shape.style.strokeWidth = '1.2';
                    }
                });
            });
        } catch (e) {
            console.error("Error in icon stroke-width enforcement:", e);
        }

        try {
            document.querySelectorAll('.bychoi-component > svg.v4-logo-img').forEach(function(svg) {
                const vb = svg.getAttribute('viewBox');
                if (vb === '0 0 200 40' || vb === '0 0 156 26') {
                    svg.setAttribute('viewBox', '0 0 176 32');
                    const text = svg.querySelector('text');
                    if (text) text.setAttribute('y', '54%');
                }
            });
        } catch (e) {
            console.error("Error in SISUN logo viewBox enforcement:", e);
        }
    };

    const _enforceCrispImageResampling = function() {
        try {
            var extractDataUrlFromBg = function(bgStr) {
                if (!bgStr || typeof bgStr !== 'string') return '';
                var idx = bgStr.indexOf('data:image/');
                if (idx === -1) return '';
                var endIdx = bgStr.lastIndexOf(String.fromCharCode(41));
                if (endIdx <= idx) endIdx = bgStr.length;
                var raw = bgStr.substring(idx, endIdx).trim();
                while (raw.length > 0 && (raw.charAt(raw.length - 1) === '"' || raw.charAt(raw.length - 1) === "'")) {
                    raw = raw.substring(0, raw.length - 1).trim();
                }
                return raw;
            };

            document.querySelectorAll('.bychoi-component .v4-shape.v4-shape-image').forEach(function(shape) {
                var comp = shape.closest('.bychoi-component');
                if (!comp || comp.classList.contains('dragging-now') || comp.classList.contains('v4-cropping-active')) return;
                var compW = parseInt(comp.style.width) || comp.offsetWidth || 0;
                var compH = parseInt(comp.style.height) || comp.offsetHeight || 0;
                if (compW < 24 || compH < 24) return;

                var cropL = parseFloat(shape.getAttribute('data-crop-l')) || 0;
                var cropT = parseFloat(shape.getAttribute('data-crop-t')) || 0;
                var cropR = parseFloat(shape.getAttribute('data-crop-r')) || 0;
                var cropB = parseFloat(shape.getAttribute('data-crop-b')) || 0;
                var visFracW = Math.max(0.02, 1 - cropL - cropR);
                var visFracH = Math.max(0.02, 1 - cropT - cropB);

                var natW = parseInt(shape.getAttribute('data-natural-width')) || parseInt(comp.getAttribute('data-natural-width')) || 0;
                var natH = parseInt(shape.getAttribute('data-natural-height')) || parseInt(comp.getAttribute('data-natural-height')) || 0;
                var targetW = Math.round((compW / visFracW) * 1.15);
                var targetH = Math.round((compH / visFracH) * 1.15);
                if (natW > 0 && targetW > natW) targetW = natW;
                if (natH > 0 && targetH > natH) targetH = natH;

                var targetKey = targetW + 'x' + targetH;
                var curCrispAttr = shape.getAttribute('data-crisp-size') || '';
                if (curCrispAttr === targetKey && shape._v4ScheduledKey === targetKey) return;
                if (curCrispAttr === targetKey && !shape._v4OrigDataUrl) {
                    shape._v4ScheduledKey = targetKey;
                    return;
                }

                var curDataUrl = extractDataUrlFromBg(shape.style.backgroundImage || '');
                if (!curDataUrl) return;

                if (!shape._v4OrigDataUrl || (shape._v4LastAppliedUrl && curDataUrl !== shape._v4LastAppliedUrl)) {
                    shape._v4OrigDataUrl = curDataUrl;
                    shape._v4InitialWasCrisp = !!curCrispAttr;
                }

                if (shape._v4ScheduledKey === targetKey) return;
                shape._v4ScheduledKey = targetKey;

                if (shape._v4CrispTimer) clearTimeout(shape._v4CrispTimer);
                shape._v4CrispTimer = setTimeout(function() {
                    shape._v4CrispTimer = null;
                    if (comp.classList.contains('v4-cropping-active')) return;
                    var latestW = parseInt(comp.style.width) || comp.offsetWidth || 0;
                    var latestH = parseInt(comp.style.height) || comp.offsetHeight || 0;
                    if (latestW < 24 || latestH < 24) return;
                    var cL = parseFloat(shape.getAttribute('data-crop-l')) || 0;
                    var cT = parseFloat(shape.getAttribute('data-crop-t')) || 0;
                    var cR = parseFloat(shape.getAttribute('data-crop-r')) || 0;
                    var cB = parseFloat(shape.getAttribute('data-crop-b')) || 0;
                    var vW = Math.max(0.02, 1 - cL - cR);
                    var vH = Math.max(0.02, 1 - cT - cB);
                    var finW = Math.round((latestW / vW) * 1.15);
                    var finH = Math.round((latestH / vH) * 1.15);
                    if (natW > 0 && finW > natW) finW = natW;
                    if (natH > 0 && finH > natH) finH = natH;
                    var finKey = finW + 'x' + finH;
                    if (shape.getAttribute('data-crisp-size') === finKey) return;

                    var cachedOrig = null;
                    var crispFn = null;
                    try {
                        var rootWin = window.top || window.parent || window;
                        if (rootWin.__bychoi_orig_image_cache__ && comp.id && rootWin.__bychoi_orig_image_cache__[comp.id]) {
                            cachedOrig = rootWin.__bychoi_orig_image_cache__[comp.id];
                        }
                        if (typeof rootWin.createCrispImageDataUrl === 'function') {
                            crispFn = rootWin.createCrispImageDataUrl;
                        }
                    } catch (err) {}
                    if (!crispFn) return;

                    var srcUrl = cachedOrig || shape._v4OrigDataUrl || curDataUrl;
                    var sharpenAmt = (cachedOrig || !shape._v4InitialWasCrisp) ? 0.75 : 0.4;

                    var img = new Image();
                    img.onload = function() {
                        var crispUrl = crispFn(img, finW, finH, sharpenAmt);
                        if (crispUrl) {
                            shape._v4LastAppliedUrl = crispUrl;
                            shape.setAttribute('data-crisp-size', finKey);
                            shape.style.backgroundImage = 'url("' + crispUrl + '")';
                        } else {
                            shape._v4LastAppliedUrl = srcUrl;
                            shape.setAttribute('data-crisp-size', finKey);
                            var liveUrl = extractDataUrlFromBg(shape.style.backgroundImage || '');
                            if (srcUrl && liveUrl !== srcUrl) {
                                shape.style.backgroundImage = 'url("' + srcUrl + '")';
                            }
                        }
                    };
                    img.src = srcUrl;
                }, 150);
            });
        } catch (e) {
            console.error("Error in crisp image resampling enforcement:", e);
        }
    };

    const _enforceAdminSettingsLayout = function() {
        try {
            document.querySelectorAll('.v4-admin-group-header').forEach(function(header) {
                const container = header.closest('.v4-admin-settings-container');
                if (container) {
                    const isStdV2 = !!(container.getAttribute('data-v4-std') === '2' || (container.closest && container.closest('[data-v4-std="2"]')));
                    const bgCol = container.getAttribute('data-group-header-bg') || (isStdV2 ? '#f0f0f0' : '#73829c');
                    const textCol = container.getAttribute('data-group-header-color') || (isStdV2 ? '#050505' : '#ffffff');
                    const targetFs = isStdV2 ? '13px' : '12px';
                    const targetBorder = isStdV2 ? '1.6px solid rgb(200, 200, 200)' : '1.6px solid rgb(226, 232, 240)';

                    if (header.style.height !== '40px') header.style.height = '40px';
                    if (header.style.display !== 'flex') header.style.display = 'flex';
                    if (header.style.alignItems !== 'center') header.style.alignItems = 'center';
                    if (header.style.padding !== '0px 16px') header.style.padding = '0 16px';
                    if (header.style.fontSize !== targetFs) header.style.fontSize = targetFs;
                    if (header.style.fontWeight !== '400') header.style.fontWeight = '400';
                    if (header.style.fontFamily !== 'inherit') header.style.fontFamily = 'inherit';
                    if (header.style.boxSizing !== 'border-box') header.style.boxSizing = 'border-box';
                    if (header.style.width !== '100%') header.style.width = '100%';
                    if (header.style.outline !== 'none') header.style.outline = 'none';
                    if (header.style.borderBottom !== targetBorder) header.style.borderBottom = targetBorder;
                    if (header.style.flexShrink !== '0') header.style.flexShrink = '0';
                    if (header.style.borderTopLeftRadius !== '6.4px') header.style.borderTopLeftRadius = '6.4px';
                    if (header.style.borderTopRightRadius !== '6.4px') header.style.borderTopRightRadius = '6.4px';
                    if (header.style.borderBottomLeftRadius !== '0px') header.style.borderBottomLeftRadius = '0px';
                    if (header.style.borderBottomRightRadius !== '0px') header.style.borderBottomRightRadius = '0px';
                    if (header.style.overflow !== 'hidden') header.style.overflow = 'hidden';
                    if (!header.style.clipPath || !header.style.clipPath.includes('round 6.4px')) {
                        header.style.clipPath = 'inset(0 0 0 0 round 6.4px 6.4px 0 0)';
                        header.style.webkitClipPath = 'inset(0 0 0 0 round 6.4px 6.4px 0 0)';
                    }
                    if (header.style.backgroundClip !== 'padding-box') header.style.backgroundClip = 'padding-box';

                    if (header.getAttribute('data-enforced-bg') !== bgCol) {
                        header.style.backgroundColor = bgCol;
                        header.setAttribute('data-enforced-bg', bgCol);
                    }
                    if (header.getAttribute('data-enforced-color') !== textCol) {
                        header.style.color = textCol;
                        header.setAttribute('data-enforced-color', textCol);
                    }

                    if (!header.dataset.inputBound) {
                        header.dataset.inputBound = 'true';
                        header.oninput = function(e) {
                            container.setAttribute('data-group-header-title', e.target.innerText);
                            if (typeof window.markDirty === 'function') window.markDirty();
                        };
                    }
                }
            });

            document.querySelectorAll('.v4-admin-settings-container').forEach(function(container) {
                const comp = container.closest('.bychoi-component');
                if (comp) {
                    if (comp.style.background && comp.style.background !== 'transparent') comp.style.background = 'transparent';
                    if (comp.style.backgroundColor && comp.style.backgroundColor !== 'transparent') comp.style.backgroundColor = 'transparent';
                }
                if (container.style.overflow !== 'hidden') container.style.overflow = 'hidden';
                if (container.style.borderRadius !== '8px') container.style.borderRadius = '8px';
                if (container.style.isolation !== 'isolate') container.style.isolation = 'isolate';
                if (container.style.contain !== 'paint') container.style.contain = 'paint';
                if (!container.style.webkitMaskImage) container.style.webkitMaskImage = '-webkit-radial-gradient(white, black)';
                if (container.style.maskImage !== 'radial-gradient(white, black)') container.style.maskImage = 'radial-gradient(white, black)';
                if (container.style.transform !== 'translateZ(0px)' && !container.style.transform.includes('translateZ')) container.style.transform = 'translateZ(0)';

                container.querySelectorAll('.v4-admin-action-bar').forEach(function(ab) { ab.remove(); });
                container.removeAttribute('data-show-action-bar');
                container.removeAttribute('data-action-align');

                const hasGroupHeader = container.getAttribute('data-show-group-header') === 'true';
                const rows = container.querySelectorAll('.v4-admin-row');
                if (rows.length > 0) {
                    const firstRowFirstLabel = rows[0].querySelector('.v4-admin-label-cell');
                    if (firstRowFirstLabel) {
                        const expectedTLR = hasGroupHeader ? '0px' : '6.4px';
                        if (firstRowFirstLabel.style.borderTopLeftRadius !== expectedTLR) {
                            firstRowFirstLabel.style.borderTopLeftRadius = expectedTLR;
                        }
                    }
                    const lastRowFirstLabel = rows[rows.length - 1].querySelector('.v4-admin-label-cell');
                    if (lastRowFirstLabel && lastRowFirstLabel.style.borderBottomLeftRadius !== '6.4px') {
                        lastRowFirstLabel.style.borderBottomLeftRadius = '6.4px';
                    }
                }

                const table = container.querySelector('.v4-admin-settings-table');
                if (table) {
                    if (table.style.flex !== '1 1 0%' && table.style.flex !== '1') table.style.flex = '1';
                    if (table.style.height !== 'auto') table.style.height = 'auto';
                }
                if (comp) {
                    const headerHeight = hasGroupHeader ? 40 : 0;
                    const totalRows = parseInt(container.getAttribute('data-row-count')) || 1;
                    const globalRowHeight = parseInt(container.getAttribute('data-row-height')) || 44;

                    let expectedHeight = headerHeight;
                    for (let i = 1; i <= totalRows; i++) {
                        const specificHeight = parseInt(container.getAttribute('data-row' + i + '-height')) || globalRowHeight;
                        expectedHeight += specificHeight;
                    }

                    const currentHeight = parseInt(comp.style.height) || 0;
                    if (currentHeight !== expectedHeight) {
                        comp.style.height = expectedHeight + 'px';
                        if (typeof window.updateHandles === 'function') window.updateHandles(comp);
                    }
                }
            });
        } catch (e) {
            console.error("Error in admin settings enforceDesignSystem:", e);
        }
    };

    window.enforceDesignSystem = function() {
        _enforceEarlyTextAutoSizing();
        _bindAllAtomInteractiveEvents();
        _enforcePatternAndIconStyles();
        _enforceCrispImageResampling();
        _enforceAdminSettingsLayout();
        if (window.V4DesignSystemAtoms && typeof window.V4DesignSystemAtoms.runAll === 'function') {
            window.V4DesignSystemAtoms.runAll();
        }
        if (window.V4DesignSystemShapesTables && typeof window.V4DesignSystemShapesTables.runAll === 'function') {
            window.V4DesignSystemShapesTables.runAll();
        }
    };

    let dsObserver = null;
    let enforceQueued = false;
    const runEnforceSafe = function(mutationsList) {
        if (enforceQueued) return;
        if (window.isMarqueeActive) return;

        if (mutationsList && Array.isArray(mutationsList) && mutationsList.length > 0) {
            const isIgnorableMutation = mutationsList.every(function(m) {
                const target = m.target;
                if (!target) return true;
                const el = target.nodeType === 1 ? target : target.parentElement;
                if (!el) return true;

                const isOverlay = !!(
                    el.closest('.v4-responsive-guide-layer') ||
                    el.closest('.pc-guide-layer') ||
                    el.closest('.mobile-guide-layer') ||
                    el.closest('.bychoi-drag-handle') ||
                    el.closest('.bychoi-resizer') ||
                    el.closest('.v4-selection-adorner-layer') ||
                    el.classList.contains('v4-responsive-guide-layer') ||
                    el.classList.contains('pc-guide-layer') ||
                    el.classList.contains('mobile-guide-layer') ||
                    el.classList.contains('v4-selection-adorner-layer')
                );
                if (isOverlay) return true;

                if (m.type === 'attributes' && m.attributeName === 'class') {
                    const oldClass = _stripSelectedClassToken(m.oldValue || '');
                    const currentClass = _stripSelectedClassToken(el.className || '');
                    if (oldClass === currentClass) {
                        return true;
                    }
                }
                return false;
            });
            if (isIgnorableMutation) return;
        }

        enforceQueued = true;
        window.requestAnimationFrame(function() {
            if (dsObserver) dsObserver.disconnect();
            try {
                window.enforceDesignSystem();
            } catch (e) {
                console.error("[DesignSystem] enforceDesignSystem error:", e);
            }
            if (dsObserver) {
                dsObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'], attributeOldValue: true });
            }
            enforceQueued = false;
        });
    };

    window.suspendDesignSystem = function() {
        if (dsObserver) {
            dsObserver.disconnect();
        }
    };

    window.resumeDesignSystem = function() {
        if (dsObserver) {
            runEnforceSafe();
        }
    };

    if (typeof window.enforceDesignSystem === 'function') {
        dsObserver = new MutationObserver(function(mutations) { runEnforceSafe(mutations); });
        runEnforceSafe();
        setTimeout(runEnforceSafe, 500);
    }
})();
`;
