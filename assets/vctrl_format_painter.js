/**
 * assets/vctrl_format_painter.js
 * Shape Style & Typography Deep Extraction, Format Copy & Batch Application Engine (Iframe Side).
 * Decoupled from vctrl_shortcuts.js for single responsibility.
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4FormatPainterScript = ...`).
 * 1. DO NOT use unescaped backticks in this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \ to avoid syntax errors.
 */

window.v4FormatPainterScript = `
(function() {
    function dispatchFormatToParent(data) {
        if (window.EditorBus && typeof window.EditorBus.sendToParent === 'function') {
            window.EditorBus.sendToParent(data);
        } else if (typeof window.notifyParent === 'function') {
            window.notifyParent(data);
        } else if (window.parent && window.parent !== window) {
            window.parent.postMessage(data, '*');
        }
    }
    const notifyParent = dispatchFormatToParent;

    window.copySelectedObjectStyle = function() {
        const selected = document.querySelectorAll('.lf-component.selected');
        const targetComp = (selected && selected.length > 0) ? selected[0] : window.activeEl;
        if (!targetComp) {
            console.warn("[Style Clipboard] No component selected to copy format from.");
            notifyParent({
                type: 'LF_SHOW_TOAST',
                message: '\uc11c\uc2dd\uc744 \ubcf5\uc0ac\ud560 \ub3c4\ud615\uc744 \uba3c\uc800 \uc120\ud0dd\ud574\uc8fc\uc138\uc694.',
                toastType: 'warning'
            });
            return null;
        }

        const compStyles = (typeof window._getCompStyles === 'function') ? window._getCompStyles(targetComp) : null;
        const cur = compStyles ? (compStyles.currentStyles || {}) : {};
        const shape = targetComp.querySelector('.v4-shape') || (targetComp.classList.contains('v4-shape') ? targetComp : null);
        const isShape = !!shape;

        let detectedBorderStyle = 'solid';
        if (shape) {
            detectedBorderStyle = shape.getAttribute('data-line-style') || (shape.style && shape.style.borderStyle) || 'solid';
        } else if (targetComp.style && targetComp.style.borderStyle) {
            detectedBorderStyle = targetComp.style.borderStyle;
        }

        // Deep extraction of Content Editor typography formats
        const textContainer = targetComp.querySelector('.v4-shape-text-content, .v4-shape-text-overlay, .v4-editable-cell') ||
                              (targetComp.classList.contains('v4-editable-cell') ? targetComp : null) ||
                              targetComp.querySelector('.v4-custom-btn, .v4-checkbox-text, .v4-radio-text');

        let extractedColor = '';
        let extractedFontSize = null;
        let extractedFontFamily = '';
        let extractedIsBold = false;
        let extractedIsItalic = false;
        let extractedIsUnderline = false;
        let extractedIsStrike = false;
        let extractedTextBg = '';
        let extractedTextAlign = cur.textAlign || 'center';
        let extractedVAlign = cur.vAlign || 'middle';
        let extractedPadTop = cur.padTop !== undefined ? cur.padTop : 5;
        let extractedPadRight = cur.padRight !== undefined ? cur.padRight : 10;
        let extractedPadBottom = cur.padBottom !== undefined ? cur.padBottom : 5;
        let extractedPadLeft = cur.padLeft !== undefined ? cur.padLeft : 10;

        if (textContainer) {
            // 1. Color
            const spansWithColor = Array.from(textContainer.querySelectorAll('[style*="color"]'));
            for (let i = 0; i < spansWithColor.length; i++) {
                const cVal = spansWithColor[i].style.color;
                if (cVal && cVal !== 'inherit' && cVal !== 'initial' && cVal !== 'transparent') {
                    extractedColor = (typeof window.rgbToHex === 'function' ? window.rgbToHex(cVal) : cVal) || cVal;
                    break;
                }
            }
            if (!extractedColor && textContainer.style && textContainer.style.color) {
                extractedColor = (typeof window.rgbToHex === 'function' ? window.rgbToHex(textContainer.style.color) : textContainer.style.color);
            }
            if (!extractedColor) {
                const compCol = window.getComputedStyle(textContainer).color;
                if (compCol) {
                    extractedColor = (typeof window.rgbToHex === 'function' ? window.rgbToHex(compCol) : compCol) || compCol;
                }
            }

            // 2. Font Size
            const spansWithFs = Array.from(textContainer.querySelectorAll('[style*="font-size"], [style*="fontSize"]'));
            for (let i = 0; i < spansWithFs.length; i++) {
                const fsVal = spansWithFs[i].style.fontSize;
                if (fsVal) {
                    const parsed = parseInt(fsVal);
                    if (!isNaN(parsed) && parsed > 0) {
                        extractedFontSize = parsed;
                        break;
                    }
                }
            }
            if (!extractedFontSize && textContainer.style && textContainer.style.fontSize) {
                const parsed = parseInt(textContainer.style.fontSize);
                if (!isNaN(parsed) && parsed > 0) extractedFontSize = parsed;
            }
            if (!extractedFontSize) {
                const compFs = window.getComputedStyle(textContainer).fontSize;
                if (compFs) {
                    const parsed = parseInt(compFs);
                    if (!isNaN(parsed) && parsed > 0) extractedFontSize = parsed;
                }
            }

            // 3. Bold
            if (textContainer.querySelector('strong, b') || textContainer.querySelector('[style*="font-weight: bold"], [style*="font-weight: 700"], [style*="font-weight: 800"], [style*="font-weight: 900"]')) {
                extractedIsBold = true;
            } else {
                const fw = (textContainer.style && textContainer.style.fontWeight) || window.getComputedStyle(textContainer).fontWeight;
                if (fw === 'bold' || fw === '700' || fw === '800' || fw === '900' || parseInt(fw) >= 600) {
                    extractedIsBold = true;
                }
            }

            // 4. Italic
            if (textContainer.querySelector('em, i') || textContainer.querySelector('[style*="font-style: italic"]')) {
                extractedIsItalic = true;
            } else {
                const fst = (textContainer.style && textContainer.style.fontStyle) || window.getComputedStyle(textContainer).fontStyle;
                if (fst === 'italic' || fst === 'oblique') {
                    extractedIsItalic = true;
                }
            }

            // 5. Underline
            if (textContainer.querySelector('u') || textContainer.querySelector('[style*="text-decoration: underline"], [style*="text-decoration-line: underline"]')) {
                extractedIsUnderline = true;
            }

            // 6. Strike
            if (textContainer.querySelector('s, strike') || textContainer.querySelector('[style*="text-decoration: line-through"]')) {
                extractedIsStrike = true;
            }

            // 7. Text Highlight Background
            const spansWithBg = Array.from(textContainer.querySelectorAll('[style*="background-color"], [style*="background"]'));
            for (let i = 0; i < spansWithBg.length; i++) {
                const el = spansWithBg[i];
                if (el === textContainer || el.classList.contains('v4-shape-text-content')) continue;
                const bgVal = el.style.backgroundColor || el.style.background;
                if (bgVal && bgVal !== 'transparent' && bgVal !== 'none' && !bgVal.includes('rgba(0, 0, 0, 0)')) {
                    extractedTextBg = (typeof window.rgbToHex === 'function' ? window.rgbToHex(bgVal) : bgVal) || bgVal;
                    break;
                }
            }

            // 8. Font Family
            const spansWithFf = Array.from(textContainer.querySelectorAll('[style*="font-family"], [style*="fontFamily"]'));
            for (let i = 0; i < spansWithFf.length; i++) {
                if (spansWithFf[i].style.fontFamily && spansWithFf[i].style.fontFamily !== 'inherit') {
                    extractedFontFamily = spansWithFf[i].style.fontFamily;
                    break;
                }
            }
            if (!extractedFontFamily && textContainer.style && textContainer.style.fontFamily && textContainer.style.fontFamily !== 'inherit') {
                extractedFontFamily = textContainer.style.fontFamily;
            }
            if (!extractedFontFamily) {
                const compFf = window.getComputedStyle(textContainer).fontFamily;
                if (compFf && compFf !== 'inherit') extractedFontFamily = compFf;
            }

            // 9. Alignment
            const alignAttr = targetComp.getAttribute('data-align') || (shape && shape.getAttribute('data-align')) || textContainer.getAttribute('data-align');
            if (alignAttr) {
                extractedTextAlign = alignAttr;
            } else if (textContainer.style && textContainer.style.textAlign) {
                extractedTextAlign = textContainer.style.textAlign;
            } else {
                const pWithAlign = textContainer.querySelector('p[style*="text-align"]');
                if (pWithAlign && pWithAlign.style.textAlign) {
                    extractedTextAlign = pWithAlign.style.textAlign;
                } else {
                    extractedTextAlign = window.getComputedStyle(textContainer).textAlign || extractedTextAlign;
                }
            }

            // 10. Vertical Alignment
            const vAttr = targetComp.getAttribute('data-valign') || (shape && shape.getAttribute('data-valign')) || textContainer.getAttribute('data-valign');
            if (vAttr) {
                extractedVAlign = vAttr === 'flex-start' ? 'top' : (vAttr === 'flex-end' ? 'bottom' : (vAttr === 'center' ? 'middle' : vAttr));
            }
        }

        if (!extractedColor) extractedColor = cur.text || '#1e293b';
        if (!extractedFontSize) extractedFontSize = cur.fontSize || 14;
        if (!extractedFontFamily) extractedFontFamily = cur.fontFamily || 'inherit';

        const styleData = {
            type: 'LF_STYLE_CLIPBOARD',
            version: 2,
            timestamp: Date.now(),
            isShape: isShape,
            shapeType: compStyles ? (compStyles.shapeType || '') : '',
            fill: {
                bg: cur.bg || '',
                bgOpacity: cur.bgOpacity !== undefined ? cur.bgOpacity : 100,
                isBgTransparent: !!cur.isBgTransparent,
                patternType: compStyles ? (compStyles.patternType || '') : ''
            },
            border: {
                color: cur.border || '',
                width: '1.6px',
                style: detectedBorderStyle,
                radius: cur.borderRadius !== undefined ? cur.borderRadius : 0,
                isBorderTransparent: !!cur.isBorderTransparent
            },
            text: {
                color: extractedColor,
                fontSize: extractedFontSize,
                fontFamily: extractedFontFamily,
                isBold: extractedIsBold,
                isItalic: extractedIsItalic,
                isUnderline: extractedIsUnderline,
                isStrike: extractedIsStrike,
                textBg: extractedTextBg,
                textAlign: extractedTextAlign,
                vAlign: extractedVAlign,
                padTop: extractedPadTop,
                padRight: extractedPadRight,
                padBottom: extractedPadBottom,
                padLeft: extractedPadLeft
            },
            line: {
                lineColor: (compStyles && compStyles.lineColor) ? compStyles.lineColor : (cur.border || '#c8c8c8'),
                lineThickness: (compStyles && compStyles.lineThickness) ? compStyles.lineThickness : 1.6,
                lineStyle: (compStyles && compStyles.lineStyle) ? compStyles.lineStyle : 'solid',
                lineDir: (compStyles && compStyles.lineDir) ? compStyles.lineDir : 'horizontal'
            },
            wave: {
                waveDir: (compStyles && compStyles.waveDir) ? compStyles.waveDir : 'horizontal'
            }
        };

        v4StyleClipboard = styleData;

        if (window.top) {
            try {
                window.top.__lf_global_style_clipboard__ = styleData;
            } catch(e) {}
        }

        notifyParent({
            type: 'LF_SAVE_STYLE_CLIPBOARD',
            styleClipboard: styleData
        });

        notifyParent({
            type: 'LF_SHOW_TOAST',
            message: '\ub3c4\ud615 \uc11c\uc2dd\uc774 \ubcf5\uc0ac\ub418\uc5c8\uc2b5\ub2c8\ub2e4. (Ctrl+Shift+V\ub85c \ubd99\uc5ec\ub123\uae30)',
            toastType: 'info'
        });

        console.log("[Style Clipboard] Copied style data successfully:", styleData);
        return styleData;
    };

    function applyTypographyDeep(cell, textData) {
        if (!cell || !textData) return;

        // 1. Remove bold tags if not bold
        if (!textData.isBold) {
            cell.querySelectorAll('strong, b').forEach(function(bTag) {
                while (bTag.firstChild) {
                    bTag.parentNode.insertBefore(bTag.firstChild, bTag);
                }
                bTag.remove();
            });
        }

        // 2. Remove italic tags if not italic
        if (!textData.isItalic) {
            cell.querySelectorAll('em, i').forEach(function(iTag) {
                while (iTag.firstChild) {
                    iTag.parentNode.insertBefore(iTag.firstChild, iTag);
                }
                iTag.remove();
            });
        }

        // 3. Remove underline if not underline
        if (!textData.isUnderline) {
            cell.querySelectorAll('u').forEach(function(uTag) {
                while (uTag.firstChild) {
                    uTag.parentNode.insertBefore(uTag.firstChild, uTag);
                }
                uTag.remove();
            });
        }

        // 4. Remove strike if not strike
        if (!textData.isStrike) {
            cell.querySelectorAll('s, strike').forEach(function(sTag) {
                while (sTag.firstChild) {
                    sTag.parentNode.insertBefore(sTag.firstChild, sTag);
                }
                sTag.remove();
            });
        }

        // 5. Wrap plain text in <p> if no block child exists
        if (cell.children.length === 0 && cell.textContent.trim().length > 0) {
            const txt = cell.textContent;
            cell.innerHTML = '<p>' + txt + '</p>';
        }

        // 6. Wrap in <strong> if isBold
        if (textData.isBold) {
            const pList = cell.querySelectorAll('p');
            if (pList.length > 0) {
                pList.forEach(function(p) {
                    if (p.querySelectorAll('strong, b').length === 0 && p.childNodes.length > 0) {
                        const str = document.createElement('strong');
                        while (p.firstChild) str.appendChild(p.firstChild);
                        p.appendChild(str);
                    }
                });
            } else if (cell.childNodes.length > 0 && cell.querySelectorAll('strong, b').length === 0) {
                const str = document.createElement('strong');
                while (cell.firstChild) str.appendChild(cell.firstChild);
                cell.appendChild(str);
            }
        }

        // 7. Wrap in <em> if isItalic
        if (textData.isItalic) {
            const pList = cell.querySelectorAll('p');
            if (pList.length > 0) {
                pList.forEach(function(p) {
                    if (p.querySelectorAll('em, i').length === 0 && p.childNodes.length > 0) {
                        const em = document.createElement('em');
                        while (p.firstChild) em.appendChild(p.firstChild);
                        p.appendChild(em);
                    }
                });
            } else if (cell.childNodes.length > 0 && cell.querySelectorAll('em, i').length === 0) {
                const em = document.createElement('em');
                while (cell.firstChild) em.appendChild(cell.firstChild);
                cell.appendChild(em);
            }
        }

        // 8. Wrap in <u> if isUnderline
        if (textData.isUnderline) {
            const pList = cell.querySelectorAll('p');
            if (pList.length > 0) {
                pList.forEach(function(p) {
                    if (p.querySelectorAll('u').length === 0 && p.childNodes.length > 0) {
                        const uEl = document.createElement('u');
                        while (p.firstChild) uEl.appendChild(p.firstChild);
                        p.appendChild(uEl);
                    }
                });
            } else if (cell.childNodes.length > 0 && cell.querySelectorAll('u').length === 0) {
                const uEl = document.createElement('u');
                while (cell.firstChild) uEl.appendChild(cell.firstChild);
                cell.appendChild(uEl);
            }
        }

        // 9. Wrap in <s> if isStrike
        if (textData.isStrike) {
            const pList = cell.querySelectorAll('p');
            if (pList.length > 0) {
                pList.forEach(function(p) {
                    if (p.querySelectorAll('s, strike').length === 0 && p.childNodes.length > 0) {
                        const sEl = document.createElement('s');
                        while (p.firstChild) sEl.appendChild(p.firstChild);
                        p.appendChild(sEl);
                    }
                });
            } else if (cell.childNodes.length > 0 && cell.querySelectorAll('s, strike').length === 0) {
                const sEl = document.createElement('s');
                while (cell.firstChild) sEl.appendChild(cell.firstChild);
                cell.appendChild(sEl);
            }
        }

        // 10. Ensure each paragraph has span wrapper for clean Quill format parsing
        const pNodes = cell.querySelectorAll('p');
        if (pNodes.length > 0) {
            pNodes.forEach(function(p) {
                if (p.querySelectorAll('span').length === 0 && p.childNodes.length > 0) {
                    const span = document.createElement('span');
                    while (p.firstChild) span.appendChild(p.firstChild);
                    p.appendChild(span);
                }
            });
        } else if (cell.querySelectorAll('span').length === 0 && cell.childNodes.length > 0) {
            const span = document.createElement('span');
            while (cell.firstChild) span.appendChild(cell.firstChild);
            cell.appendChild(span);
        }

        // 11. Apply styles to outer container
        if (textData.color) cell.style.setProperty('color', textData.color, 'important');
        if (textData.fontSize) cell.style.setProperty('font-size', textData.fontSize + 'px', 'important');
        if (textData.fontFamily && textData.fontFamily !== 'inherit') cell.style.setProperty('font-family', textData.fontFamily, 'important');
        cell.style.setProperty('font-weight', textData.isBold ? '700' : 'normal', 'important');
        cell.style.setProperty('font-style', textData.isItalic ? 'italic' : 'normal', 'important');

        // 12. Deeply apply to all descendants to override inline styles
        cell.querySelectorAll('*').forEach(function(child) {
            if (textData.color) child.style.setProperty('color', textData.color, 'important');
            if (textData.fontSize) child.style.setProperty('font-size', textData.fontSize + 'px', 'important');
            if (textData.fontFamily && textData.fontFamily !== 'inherit') child.style.setProperty('font-family', textData.fontFamily, 'important');
            
            child.style.setProperty('font-weight', textData.isBold ? '700' : 'normal', 'important');
            child.style.setProperty('font-style', textData.isItalic ? 'italic' : 'normal', 'important');

            if (textData.textBg) {
                if (child.tagName === 'SPAN') {
                    child.style.setProperty('background-color', textData.textBg, 'important');
                }
            } else {
                child.style.removeProperty('background-color');
                child.style.removeProperty('background');
            }

            if (textData.isUnderline && textData.isStrike) {
                child.style.setProperty('text-decoration', 'underline line-through', 'important');
            } else if (textData.isUnderline) {
                child.style.setProperty('text-decoration', 'underline', 'important');
            } else if (textData.isStrike) {
                child.style.setProperty('text-decoration', 'line-through', 'important');
            } else {
                child.style.removeProperty('text-decoration');
                child.style.removeProperty('text-decoration-line');
            }

            if (textData.textAlign && (child.tagName === 'P' || child.classList.contains('ql-editor'))) {
                child.style.setProperty('text-align', textData.textAlign, 'important');
                child.style.setProperty('width', '100%', 'important');
                child.style.setProperty('padding', '0px', 'important');
                child.style.setProperty('margin', '0px', 'important');
            }
        });
    }

    function applyStyleToSingleComponent(comp, styleData) {
        if (!comp || !styleData) return false;

        const shape = comp.querySelector('.v4-shape') || (comp.classList.contains('v4-shape') ? comp : null);
        const isSvgContainer = shape && (shape.classList.contains('v4-shape-diamond') || shape.classList.contains('v4-shape-triangle') || shape.classList.contains('v4-shape-wave') || shape.classList.contains('v4-shape-arrow') || shape.classList.contains('v4-shape-line'));
        const svgShape = shape ? shape.querySelector('path, polygon, rect, circle, line') : null;
        const isLine = comp.classList.contains('v4-shape-line') || (shape && shape.classList.contains('v4-shape-line')) || comp.classList.contains('connector-line');
        const isButton = comp.classList.contains('v4-btn-container') || !!comp.querySelector('.v4-btn-container');
        const customBtn = comp.querySelector('.v4-custom-btn');
        const isTextBox = comp.classList.contains('v4-text-box') || comp.classList.contains('v4-text-shape') || comp.classList.contains('text-marker');

        // 1. Line Target Handling
        if (isLine) {
            const lineTarget = (shape && shape.classList.contains('v4-shape-line')) ? shape : comp;
            const lineEl = lineTarget.querySelector('line, path') || svgShape;
            const strokeColor = (styleData.line && styleData.line.lineColor) || (styleData.border && styleData.border.color) || (styleData.fill && styleData.fill.bg) || '#c8c8c8';
            const strokeWidth = (styleData.line && styleData.line.lineThickness) || 1.6;
            const lineStyle = (styleData.line && styleData.line.lineStyle) || (styleData.border && styleData.border.style) || 'solid';

            lineTarget.setAttribute('data-line-color', strokeColor);
            lineTarget.setAttribute('data-line-width', strokeWidth);
            lineTarget.setAttribute('data-line-style', lineStyle);

            if (lineEl) {
                lineEl.style.stroke = strokeColor;
                lineEl.setAttribute('stroke', strokeColor);
                lineEl.style.strokeWidth = strokeWidth;
                lineEl.setAttribute('stroke-width', strokeWidth);
                if (lineStyle === 'dashed') {
                    lineEl.style.strokeDasharray = '6 4';
                    lineEl.setAttribute('stroke-dasharray', '6 4');
                } else if (lineStyle === 'dotted') {
                    lineEl.style.strokeDasharray = '1 5';
                    lineEl.setAttribute('stroke-dasharray', '1 5');
                } else {
                    lineEl.style.strokeDasharray = 'none';
                    lineEl.removeAttribute('stroke-dasharray');
                }
            }
            return true;
        }

        // 2. Shape Target Handling
        if (shape) {
            // Background Fill
            let targetFill = '';
            if (styleData.fill) {
                if (styleData.fill.isBgTransparent || !styleData.fill.bg || styleData.fill.bg === 'transparent' || styleData.fill.bg === 'none') {
                    targetFill = 'transparent';
                } else if (styleData.fill.bgOpacity !== undefined && styleData.fill.bgOpacity < 100) {
                    const alpha = styleData.fill.bgOpacity > 1 ? (styleData.fill.bgOpacity / 100) : styleData.fill.bgOpacity;
                    targetFill = (typeof window.hexToRgba === 'function') ? window.hexToRgba(styleData.fill.bg, alpha) : styleData.fill.bg;
                } else {
                    targetFill = styleData.fill.bg;
                }
            }

            if (isSvgContainer) {
                shape.style.background = 'transparent';
                shape.style.backgroundColor = 'transparent';
                if (svgShape && targetFill) {
                    svgShape.style.fill = (targetFill === 'transparent') ? 'none' : targetFill;
                    svgShape.setAttribute('fill', (targetFill === 'transparent') ? 'none' : targetFill);
                }
            } else {
                if (targetFill) {
                    shape.style.backgroundColor = targetFill;
                    shape.style.background = targetFill;
                }
            }

            if (styleData.fill && styleData.fill.patternType && shape.classList.contains('v4-shape-pattern-grid')) {
                shape.setAttribute('data-pattern-type', styleData.fill.patternType);
            }

            // Border
            if (styleData.border) {
                if (styleData.border.isBorderTransparent || !styleData.border.color || styleData.border.color === 'transparent') {
                    if (svgShape) {
                        svgShape.style.stroke = 'none';
                        svgShape.setAttribute('stroke', 'none');
                    }
                    shape.style.borderColor = 'transparent';
                } else {
                    const bColor = styleData.border.color || '#c8c8c8';
                    const bStyle = styleData.border.style || 'solid';
                    if (svgShape) {
                        svgShape.style.stroke = bColor;
                        svgShape.setAttribute('stroke', bColor);
                        svgShape.style.strokeWidth = '1.6';
                        svgShape.setAttribute('stroke-width', '1.6');
                        if (bStyle === 'dashed') {
                            svgShape.style.strokeDasharray = '6 4';
                            svgShape.setAttribute('stroke-dasharray', '6 4');
                        } else if (bStyle === 'dotted') {
                            svgShape.style.strokeDasharray = '1 5';
                            svgShape.setAttribute('stroke-dasharray', '1 5');
                        } else {
                            svgShape.style.strokeDasharray = 'none';
                            svgShape.removeAttribute('stroke-dasharray');
                        }
                    }
                    shape.style.borderColor = bColor;
                    shape.style.borderWidth = '1.6px';
                    shape.style.borderStyle = bStyle;
                }

                if (shape.classList.contains('v4-shape-rect') || shape.classList.contains('v4-shape-webpage')) {
                    const rad = (styleData.border.radius !== undefined) ? parseInt(styleData.border.radius) : 0;
                    shape.style.setProperty('border-radius', rad + 'px', 'important');
                }
            }

            // Wave Direction
            if (shape.classList.contains('v4-shape-wave') && styleData.wave && styleData.wave.waveDir) {
                const waveDir = styleData.wave.waveDir;
                shape.setAttribute('data-wave-dir', waveDir);
                const svgEl = shape.querySelector('svg');
                const polyEl = shape.querySelector('polygon');
                const curW = comp.offsetWidth || parseFloat(comp.style.width) || 360;
                const curH = comp.offsetHeight || parseFloat(comp.style.height) || 20;
                if (waveDir === 'vertical') {
                    if (curW > curH) {
                        comp.style.width = Math.min(curH, 20) + 'px';
                        comp.style.height = Math.max(curW, 100) + 'px';
                    }
                    if (svgEl) svgEl.setAttribute('viewBox', '0 0 20 360');
                    if (polyEl) polyEl.setAttribute('points', '6,0 2,45 6,90 2,135 6,180 2,225 6,270 2,315 6,360 16,360 12,315 16,270 12,225 16,180 12,135 16,90 12,45 16,0');
                } else {
                    if (curH > curW) {
                        comp.style.width = Math.max(curH, 100) + 'px';
                        comp.style.height = Math.min(curW, 20) + 'px';
                    }
                    if (svgEl) svgEl.setAttribute('viewBox', '0 0 360 20');
                    if (polyEl) polyEl.setAttribute('points', '0,6 45,2 90,6 135,2 180,6 225,2 270,6 315,2 360,6 360,16 315,12 270,16 225,12 180,16 135,12 90,16 45,12 0,16');
                }
            }

            // Text Styling & Alignment & Padding
            if (styleData.text) {
                const textData = styleData.text;
                const textCells = shape.querySelectorAll('.v4-shape-text-content, .v4-shape-text-overlay, .v4-editable-cell');

                if (textData.textAlign) {
                    shape.setAttribute('data-align', textData.textAlign);
                    comp.setAttribute('data-align', textData.textAlign);
                    shape.style.setProperty('text-align', textData.textAlign, 'important');
                }

                if (textData.vAlign) {
                    const normV = textData.vAlign === 'top' ? 'top' : (textData.vAlign === 'bottom' ? 'bottom' : 'middle');
                    const jc = normV === 'top' ? 'flex-start' : (normV === 'bottom' ? 'flex-end' : 'center');
                    shape.setAttribute('data-valign', normV);
                    comp.setAttribute('data-valign', normV);
                    shape.style.setProperty('justify-content', jc, 'important');
                }

                const pt = textData.padTop !== undefined ? parseInt(textData.padTop) : 5;
                const pr = textData.padRight !== undefined ? parseInt(textData.padRight) : 10;
                const pb = textData.padBottom !== undefined ? parseInt(textData.padBottom) : 5;
                const pl = textData.padLeft !== undefined ? parseInt(textData.padLeft) : 10;

                shape.setAttribute('data-pad-top', pt);
                shape.setAttribute('data-pad-right', pr);
                shape.setAttribute('data-pad-bottom', pb);
                shape.setAttribute('data-pad-left', pl);
                shape.style.setProperty('--v4-shape-pad-top', pt + 'px');
                shape.style.setProperty('--v4-shape-pad-right', pr + 'px');
                shape.style.setProperty('--v4-shape-pad-bottom', pb + 'px');
                shape.style.setProperty('--v4-shape-pad-left', pl + 'px');

                textCells.forEach(function(cell) {
                    applyTypographyDeep(cell, textData);

                    cell.setAttribute('data-pad-top', pt);
                    cell.setAttribute('data-pad-right', pr);
                    cell.setAttribute('data-pad-bottom', pb);
                    cell.setAttribute('data-pad-left', pl);
                    cell.style.setProperty('padding-top', pt + 'px', 'important');
                    cell.style.setProperty('padding-right', pr + 'px', 'important');
                    cell.style.setProperty('padding-bottom', pb + 'px', 'important');
                    cell.style.setProperty('padding-left', pl + 'px', 'important');
                    cell.style.setProperty('padding', pt + 'px ' + pr + 'px ' + pb + 'px ' + pl + 'px', 'important');
                    cell.style.setProperty('box-sizing', 'border-box', 'important');

                    if (textData.textAlign) {
                        cell.style.setProperty('text-align', textData.textAlign, 'important');
                        cell.querySelectorAll('p, span, .ql-editor, .ql-editor p').forEach(function(child) {
                            child.style.setProperty('text-align', textData.textAlign, 'important');
                        });
                    }
                    if (textData.vAlign) {
                        const jc = textData.vAlign === 'top' ? 'flex-start' : (textData.vAlign === 'bottom' ? 'flex-end' : 'center');
                        cell.style.setProperty('justify-content', jc, 'important');
                        cell.querySelectorAll('p, span, .ql-editor, .ql-editor p').forEach(function(child) {
                            child.style.setProperty('justify-content', jc, 'important');
                        });
                    }
                });
            }

            return true;
        }

        // 3. Button Target Handling
        if (isButton && customBtn) {
            if (styleData.fill && styleData.fill.bg) {
                customBtn.style.backgroundColor = styleData.fill.bg;
                customBtn.style.background = styleData.fill.bg;
            }
            if (styleData.border && styleData.border.color) {
                customBtn.style.borderColor = styleData.border.color;
                if (styleData.border.radius !== undefined) {
                    customBtn.style.borderRadius = styleData.border.radius + 'px';
                }
            }
            if (styleData.text) {
                applyTypographyDeep(customBtn, styleData.text);
            }
            return true;
        }

        // 4. Text Box / Marker Target Handling
        if (isTextBox) {
            const cell = comp.querySelector('.v4-editable-cell') || comp;
            if (cell && styleData.text) {
                applyTypographyDeep(cell, styleData.text);
            }
            if (styleData.fill && styleData.fill.bg && !styleData.fill.isBgTransparent) {
                comp.style.backgroundColor = styleData.fill.bg;
            }
            if (styleData.border && styleData.border.color && !styleData.border.isBorderTransparent) {
                comp.style.borderColor = styleData.border.color;
            }
            return true;
        }

        return false;
    }

    window.pasteCopiedObjectStyle = function(explicitStyleData) {
        let styleData = explicitStyleData || v4StyleClipboard;
        if (!styleData && window.top) {
            try {
                styleData = window.top.__lf_global_style_clipboard__;
            } catch(e) {}
        }
        if (!styleData) {
            console.warn("[Style Clipboard] No style data found in clipboard.");
            notifyParent({
                type: 'LF_SHOW_TOAST',
                message: '\ubcf5\uc0ac\ub41c \uc11c\uc2dd\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uba3c\uc800 \ub3c4\ud615\uc744 \uc120\ud0dd\ud558\uace0 \uc11c\uc2dd\uc744 \ubcf5\uc0ac\ud558\uc138\uc694.',
                toastType: 'warning'
            });
            return false;
        }

        const selected = Array.from(document.querySelectorAll('.lf-component.selected'));
        if (selected.length === 0 && window.activeEl) {
            selected.push(window.activeEl);
        }
        if (selected.length === 0) {
            notifyParent({
                type: 'LF_SHOW_TOAST',
                message: '\uc11c\uc2dd\uc744 \uc801\uc6a9\ud560 \ub300\uc0c1 \ub3c4\ud615\uc744 \uba3c\uc800 \uc120\ud0dd\ud574\uc8fc\uc138\uc694.',
                toastType: 'warning'
            });
            return false;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        let appliedCount = 0;
        selected.forEach(function(comp) {
            if (applyStyleToSingleComponent(comp, styleData)) {
                appliedCount++;
            }
        });

        if (typeof window.enforceDesignSystem === 'function') {
            try { window.enforceDesignSystem(); } catch(e) {}
        }
        if (typeof window.markDirty === 'function') {
            try { window.markDirty(); } catch(e) {}
        }
        if (selected[0] && typeof window.updateHandles === 'function') {
            try { window.updateHandles(selected[0]); } catch(e) {}
        }

        if (selected.length > 0 && typeof window.notifyParent === 'function' && typeof window._getCompStyles === 'function') {
            const firstCompStyles = window._getCompStyles(selected[0]);
            notifyParent(Object.assign({
                type: 'LF_COMP_RESIZED'
            }, firstCompStyles));
            notifyParent(Object.assign({
                type: 'LF_COMP_SELECTED'
            }, firstCompStyles));
        }

        const toastMsg = appliedCount <= 1
            ? '\ub3c4\ud615 \uc11c\uc2dd\uc774 \uc801\uc6a9\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
            : (appliedCount + '\uac1c \ub3c4\ud615\uc5d0 \uc11c\uc2dd\uc774 \uc77c\uad04 \uc801\uc6a9\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');

        notifyParent({
            type: 'LF_SHOW_TOAST',
            message: toastMsg,
            toastType: 'success'
        });

        console.log("[Style Clipboard] Applied style data to " + appliedCount + " object(s).");
        return true;
    };

})();
`;