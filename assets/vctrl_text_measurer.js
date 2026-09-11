window.v4TextMeasurerScript = `
(function() {
    const resizeAtomToFitText = (s) => {
        if (!s) return;
        // Skip resizing if the atom component is already grouped inside an 'lf-group' to prevent layout breakages.
        if (s.closest && s.closest('.lf-group')) {
            return;
        }
        const container = s.querySelector('.v4-checkbox-container, .v4-radio-container');
        if (!container) return;
        
        const boxEl = container.querySelector('.v4-checkbox, .v4-radio');
        if (!boxEl) return;

        const textEnabled = container.getAttribute('data-text-enabled') !== 'false';
        if (textEnabled) {
            const textEl = container.querySelector('.v4-checkbox-text, .v4-radio-text');
            if (textEl) {
                const boxW = parseFloat(boxEl.style.width) || 20;
                const boxH = parseFloat(boxEl.style.height) || 20;
                const textWidth = textEl.scrollWidth || 35;
                const totalWidth = boxW + 8 + textWidth + 8;
                s.style.width = totalWidth + 'px';
                s.style.height = Math.max(30, boxH + 6) + 'px';
            }
        } else {
            if (s.getAttribute('data-resized') === 'true') {
                const parentW = parseFloat(s.style.width) || s.offsetWidth;
                const parentH = parseFloat(s.style.height) || s.offsetHeight;
                boxEl.style.width = parentW + 'px';
                boxEl.style.height = parentH + 'px';
            } else {
                const boxW = parseFloat(boxEl.style.width) || 20;
                const boxH = parseFloat(boxEl.style.height) || 20;
                s.style.width = boxW + 'px';
                s.style.height = boxH + 'px';
            }
        }
        if (typeof window.updateHandles === 'function') window.updateHandles(s);
    };

    // Component Type Constants
    const COMP_TYPES = {
        STANDALONE_TEXT_SHAPE: 'STANDALONE_TEXT_SHAPE',
        TEXT_BOX: 'TEXT_BOX',
        SHAPE_TEXT: 'SHAPE_TEXT',
        DEFAULT_CELL: 'DEFAULT_CELL'
    };

    // 1. Pure Component Type Classifier
    const getComponentType = (c, isShapeText) => {
        const isRealTextComp = c.classList.contains('v4-text-box') || c.classList.contains('v4-text-shape') || c.classList.contains('text-marker') || c.classList.contains('pin-marker');
        const isStandaloneTextShape = c.classList.contains('v4-text-shape') && !c.classList.contains('text-marker') && !c.classList.contains('pin-marker') && !c.id.startsWith('v4-pin-');

        if (isStandaloneTextShape) {
            return COMP_TYPES.STANDALONE_TEXT_SHAPE;
        }
        if (isRealTextComp && !isShapeText) {
            return COMP_TYPES.TEXT_BOX;
        }
        if (isShapeText || c.querySelector('.v4-shape')) {
            return COMP_TYPES.SHAPE_TEXT;
        }
        return COMP_TYPES.DEFAULT_CELL;
    };

    // 2. Pure Off-Screen Measurement Core
    // 2. Pure Off-Screen Measurement Core
    const measureCellTextDimensions = (cell, targetDoc, isStandaloneTextShape) => {
        const isStandalone = isStandaloneTextShape || 
            (cell.closest && cell.closest('.v4-text-shape') && !cell.closest('.text-marker') && !cell.closest('.pin-marker'));

        let fontTarget = cell;
        let detectedFs = 0;
        if (cell.style && cell.style.fontSize) {
            const directFs = parseFloat(cell.style.fontSize);
            if (!isNaN(directFs) && directFs > 0) {
                detectedFs = directFs;
            }
        }

        // Pass 1: Look for explicit inline font-size on sub-elements (Quill formatted text spans)
        const subEls = cell.querySelectorAll('span, font, strong, b, em, i, p, s, strike, del, u');
        let explicitFs = 0;
        let explicitTarget = null;

        subEls.forEach(el => {
            const hasText = el.textContent && el.textContent.trim().length > 0;
            if (hasText && el.style && el.style.fontSize) {
                const parsed = parseFloat(el.style.fontSize);
                if (!isNaN(parsed) && parsed > 0) {
                    if (parsed > explicitFs) {
                        explicitFs = parsed;
                        explicitTarget = el;
                    }
                }
            }
        });

        let maxFs;
        if (explicitFs > 0) {
            // Explicit font-size formatted on text spans (e.g., Quill size 8px, 10px, etc.)
            maxFs = explicitFs;
            fontTarget = explicitTarget;
        } else if (detectedFs > 0) {
            // Explicit font-size directly on cell container
            maxFs = detectedFs;
            fontTarget = cell;
        } else {
            // Fallback to computed font size of inner elements or cell
            let computedMax = 0;
            subEls.forEach(el => {
                const hasText = el.textContent && el.textContent.trim().length > 0;
                if (hasText) {
                    const fs = parseFloat(window.getComputedStyle(el).fontSize) || 0;
                    if (fs > computedMax) {
                        computedMax = fs;
                        fontTarget = el;
                    }
                }
            });
            maxFs = computedMax > 0 ? computedMax : (parseFloat(window.getComputedStyle(cell).fontSize) || 12);
        }
        const compStyle = window.getComputedStyle(fontTarget);
        
        let hasBold = cell.querySelector('strong, b') || false;
        if (!hasBold) {
            const allEls = cell.querySelectorAll('*');
            for (let i = 0; i < allEls.length; i++) {
                const fw = window.getComputedStyle(allEls[i]).fontWeight;
                if (fw === 'bold' || fw === '700' || parseInt(fw) >= 700) {
                    hasBold = true;
                    break;
                }
            }
        }
        if (!hasBold) {
            const cellFw = window.getComputedStyle(cell).fontWeight;
            if (cellFw === 'bold' || cellFw === '700' || parseInt(cellFw) >= 700) {
                hasBold = true;
            }
        }

        const measureContainer = targetDoc.createElement('div');
        measureContainer.className = 'ql-editor v4-editable-cell';
        measureContainer.style.visibility = 'hidden';
        measureContainer.style.position = 'absolute';
        measureContainer.style.top = '-9999px';
        measureContainer.style.left = '-9999px';
        measureContainer.style.whiteSpace = 'nowrap';
        measureContainer.style.width = 'max-content';
        measureContainer.style.fontFamily = compStyle.fontFamily;
        measureContainer.style.fontSize = compStyle.fontSize;
        measureContainer.style.fontWeight = compStyle.fontWeight || (hasBold ? '700' : '400');
        measureContainer.style.lineHeight = '1';
        measureContainer.style.letterSpacing = compStyle.letterSpacing;
        measureContainer.style.padding = '0';
        measureContainer.style.margin = '0';
        (targetDoc.body || document.body).appendChild(measureContainer);

        let rawText = '';
        const paragraphs = cell.querySelectorAll('p');
        let maxLineW = 0;
        let maxLineH = 0;
        
        const sanitizeHtml = (html) => {
            return (html || '')
                .replace(/<span class="ql-cursor">.*?<\\/span>/gi, '')
                .replace(/[\\u200B\\u00A0]/g, '');
        };

        if (paragraphs.length > 0) {
            paragraphs.forEach(p => {
                const cleanedHtml = sanitizeHtml(p.innerHTML || p.textContent || '&nbsp;');
                measureContainer.innerHTML = cleanedHtml;
                measureContainer.querySelectorAll('*').forEach(child => {
                    child.style.setProperty('white-space', 'nowrap', 'important');
                    child.style.setProperty('display', 'inline', 'important');
                    child.style.setProperty('line-height', '1', 'important');
                });
                const w = Math.ceil(measureContainer.scrollWidth || measureContainer.offsetWidth);
                const h = Math.ceil(measureContainer.offsetHeight || measureContainer.scrollHeight);
                if (w > maxLineW) maxLineW = w;
                if (h > maxLineH) maxLineH = h;
            });
            rawText = Array.from(paragraphs).map(p => (p.textContent || '').replace(/[\\u200B\\u00A0]/g, '')).join('\\n');
        } else {
            const cleanCellHtml = sanitizeHtml(cell.innerHTML || '');
            const temp = document.createElement('div');
            temp.innerHTML = cleanCellHtml.replace(/<br\\s*\\/?>/gi, '\\n');
            rawText = temp.textContent || '';

            const linesHtml = cleanCellHtml.split(/<br\\s*\\/?>/gi);
            linesHtml.forEach(lineHtml => {
                measureContainer.innerHTML = lineHtml || '&nbsp;';
                measureContainer.querySelectorAll('*').forEach(child => {
                    child.style.setProperty('white-space', 'nowrap', 'important');
                    child.style.setProperty('display', 'inline', 'important');
                    child.style.setProperty('line-height', '1', 'important');
                });
                const w = Math.ceil(measureContainer.scrollWidth || measureContainer.offsetWidth);
                const h = Math.ceil(measureContainer.offsetHeight || measureContainer.scrollHeight);
                if (w > maxLineW) maxLineW = w;
                if (h > maxLineH) maxLineH = h;
            });
        }

        const fsPxFallback = maxFs || parseFloat(compStyle.fontSize) || 14;
        const fontBasedH = Math.ceil(fsPxFallback * 1.25);
        let singleLineH;
        if (isStandalone) {
            singleLineH = Math.ceil(fsPxFallback * 1.18);
        } else {
            singleLineH = Math.max(maxLineH, fontBasedH);
        }
        
        const textW = maxLineW;
        const normalizedText = rawText.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
        const lineCount = Math.max(1, normalizedText.split('\\n').length);
        
        (targetDoc.body || document.body).removeChild(measureContainer);

        return {
            textW,
            textH: singleLineH * lineCount,
            lineCount,
            compStyle,
            fsPx: fsPxFallback
        };
    };

    // 3. Dedicated Component Fitters (Strategy Implementation)

    // Strategy 3-A: Standalone Text Shape (.v4-text-shape)
    const fitStandaloneTextShape = (c, measured, origW, origH) => {
        const addedW = 10; // 5px left + 5px right (Guarantees 1-line text integrity across all browsers)
        
        let addedH = 6;
        let padY = '3px';
        if (measured.fsPx <= 9) {
            addedH = 2; // 1px top + 1px bottom for ultra-small 8-9px text
            padY = '1px';
        } else if (measured.fsPx <= 11) {
            addedH = 3; // 1.5px top + 1.5px bottom for 10-11px text
            padY = '1.5px';
        } else if (measured.fsPx <= 15) {
            addedH = 4; // 2px top + 2px bottom for 12-15px text
            padY = '2px';
        }
        c.style.setProperty('--v4-text-shape-pad-y', padY);
        c.style.setProperty('white-space', 'nowrap', 'important');
        const cell = c.querySelector('.v4-editable-cell');
        if (cell) {
            cell.style.setProperty('padding', padY + ' 3px', 'important');
            cell.style.setProperty('white-space', 'nowrap', 'important');
            cell.querySelectorAll('p, span, font, strong, b, em, i, u, s').forEach(child => {
                child.style.setProperty('white-space', 'nowrap', 'important');
            });
        }

        const targetW = measured.textW + addedW;
        const targetH = measured.lineCount > 1 
            ? Math.round(measured.fsPx * 1.2 * measured.lineCount) + addedH 
            : measured.textH + addedH;

        const finalW = targetW + 'px';
        const finalH = targetH + 'px';
        if (origW !== finalW) c.style.width = finalW;
        if (origH !== finalH) c.style.height = finalH;

        return { hideResizer: true };
    };

    // Strategy 3-B: Real Text Box / Marker (.v4-text-box, .pin-marker, .text-marker)
    const fitTextBox = (c, measured, origW, origH) => {
        const addedW = 22; // 11px left + 11px right
        const addedH = 8;  // 4px top + 4px bottom
        const targetW = measured.textW + addedW;
        const targetH = measured.lineCount > 1 
            ? (measured.fsPx * 1.2 * measured.lineCount) + addedH 
            : measured.textH + addedH;

        const finalW = targetW + 'px';
        const finalH = targetH + 'px';
        if (origW !== finalW) c.style.width = finalW;
        if (origH !== finalH) c.style.height = finalH;

        return { hideResizer: true };
    };

    // Strategy 3-C: Shape-Embedded Text (.v4-shape with text)
    const fitShapeText = (c, measured, origW, origH) => {
        // Preserve user-defined shape dimensions; do NOT auto-expand/shrink shape size on text edit
        if (origW && c.style.width !== origW) c.style.width = origW;
        if (origH && c.style.height !== origH) c.style.height = origH;

        return { hideResizer: false };
    };

    // Strategy 3-D: Default Editable Cell (Table cells etc.)
    const fitDefaultCell = (c, measured, origW, origH) => {
        const addedW = 24;
        const addedH = 16;
        const targetW = measured.textW + addedW;
        const targetH = measured.lineCount > 1 
            ? (measured.fsPx * 1.2 * measured.lineCount) + addedH 
            : measured.textH + addedH;

        const finalW = targetW + 'px';
        const finalH = targetH + 'px';
        if (origW !== finalW) c.style.width = finalW;
        if (origH !== finalH) c.style.height = finalH;

        return { hideResizer: false };
    };

    // 4. Main Dispatcher Orchestrator
    const resizeToFitText = (c, isShapeText) => {
        if (!c) return;
        const cell = c.querySelector('.v4-editable-cell') || c.querySelector('.v4-shape-text-content') || c.querySelector('.v4-shape-text-overlay');
        if (!cell) return;

        // Zero-Drift Guard: Temporarily hide delete trigger before querying bounding dimensions
        const delTrigger = c.querySelector(':scope > .lf-delete-trigger');
        const origDelDisplay = delTrigger ? delTrigger.style.display : '';
        if (delTrigger) delTrigger.style.setProperty('display', 'none', 'important');

        const origW = c.style.width;
        const origH = c.style.height;

        const compType = getComponentType(c, isShapeText);
        const isStandalone = compType === COMP_TYPES.STANDALONE_TEXT_SHAPE;
        const isShape = isShapeText || compType === COMP_TYPES.SHAPE_TEXT || !!c.querySelector('.v4-shape') || c.classList.contains('v4-shape');

        if (!isStandalone) {
            if (isShape) {
                const shapeContainer = c.querySelector('.v4-shape') || (c.classList.contains('v4-shape') ? c : null);
                const pt = cell.getAttribute('data-pad-top') || (shapeContainer && shapeContainer.getAttribute('data-pad-top'));
                const pb = cell.getAttribute('data-pad-bottom') || (shapeContainer && shapeContainer.getAttribute('data-pad-bottom'));
                const pl = cell.getAttribute('data-pad-left') || (shapeContainer && shapeContainer.getAttribute('data-pad-left'));
                const pr = cell.getAttribute('data-pad-right') || (shapeContainer && shapeContainer.getAttribute('data-pad-right'));

                if (pt !== null || pb !== null || pl !== null || pr !== null) {
                    const top = pt !== null ? pt : '5';
                    const bot = pb !== null ? pb : '5';
                    const left = pl !== null ? pl : '10';
                    const right = pr !== null ? pr : '10';
                    const customPadding = top + 'px ' + right + 'px ' + bot + 'px ' + left + 'px';
                    if (cell.style.padding !== customPadding) {
                        cell.style.setProperty('padding', customPadding, 'important');
                    }
                } else if (!cell.style.padding) {
                    cell.style.setProperty('padding', '5px 10px', 'important');
                }
            } else {
                const targetPadding = '4px';
                if (cell.style.padding !== targetPadding) {
                    cell.style.setProperty('padding', targetPadding, 'important');
                }
            }
        }

        if (c.style.minWidth !== 'unset') c.style.setProperty('min-width', 'unset', 'important');
        if (c.style.minHeight !== 'unset') c.style.setProperty('min-height', 'unset', 'important');

        // Pure Measurement
        const targetDoc = c.ownerDocument || document;
        const measured = measureCellTextDimensions(cell, targetDoc, isStandalone);

        // Zero-Offset Calibration: Micro-adjust small text rendering
        const adjustY = measured.fsPx <= 11 ? '-0.6px' : '0px';
        c.style.setProperty('--v4-text-adjust-y', adjustY);

        let fitResult = { hideResizer: false };

        switch (compType) {
            case COMP_TYPES.STANDALONE_TEXT_SHAPE:
                fitResult = fitStandaloneTextShape(c, measured, origW, origH);
                break;
            case COMP_TYPES.TEXT_BOX:
                fitResult = fitTextBox(c, measured, origW, origH);
                break;
            case COMP_TYPES.SHAPE_TEXT:
                fitResult = fitShapeText(c, measured, origW, origH);
                break;
            default:
                fitResult = fitDefaultCell(c, measured, origW, origH);
                break;
        }

        // Sub-container Dimension Enforcement
        const shape = c.querySelector('.v4-shape');
        if (shape) {
            if (shape.style.width !== '100%') shape.style.width = '100%';
            if (shape.style.height !== '100%') shape.style.height = '100%';
        }
        if (cell.style.width !== '100%') cell.style.width = '100%';
        if (cell.style.height !== '100%') cell.style.height = '100%';

        // Restore Delete Trigger
        if (delTrigger) {
            delTrigger.style.removeProperty('display');
            if (origDelDisplay) delTrigger.style.display = origDelDisplay;
        }
    };

    // --- V4 Text Style Update Handler ---
    window.v4ObjectText = window.v4ObjectText || {};
    window.v4ObjectText.handleUpdateStyle = (d) => {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return false;
        const isText = s.classList.contains('text-marker') || s.classList.contains('v4-text-box') || s.classList.contains('v4-text-shape');
        if (!isText) {
            return false;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        let t = s.querySelector('.v4-editable-cell') || s;
        if (d.style) {
            if (d.style.width !== undefined || d.style.height !== undefined) {
                s.setAttribute('data-resized', 'true');
            }
            if (d.style.html !== undefined) {
                t.innerHTML = d.style.html;
            }
            
            if (d.style.width !== undefined) {
                s.style.width = d.style.width;
            }
            if (d.style.height !== undefined) {
                s.style.height = d.style.height;
            }

            const styleToAssign = { ...d.style };
            delete styleToAssign.width;
            delete styleToAssign.height;
            
            for (const [key, val] of Object.entries(styleToAssign)) {
                if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent') {
                    const cssKey = key === 'textAlign' ? 'text-align' : (key === 'alignItems' ? 'align-items' : 'justify-content');
                    t.style.setProperty(cssKey, val, 'important');
                    t.querySelectorAll('p, span').forEach(child => {
                        child.style.setProperty(cssKey, val, 'important');
                    });
                } else if (key === 'fontSize') {
                    t.style.fontSize = val;
                    t.querySelectorAll('p, span, font, strong, b, em, i, u, s').forEach(child => {
                        child.style.fontSize = val;
                    });
                } else {
                    t.style[key] = val;
                }
            }
        }
        
        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }
        if (typeof window.resizeToFitText === 'function') {
            window.resizeToFitText(s);
        }
        return true;
    };

    // Attach to global window object
    window.resizeAtomToFitText = resizeAtomToFitText;
    window.resizeToFitText = resizeToFitText;
})();
`;

// Backwards compatibility stub
window.v4ObjectTextScript = '';
