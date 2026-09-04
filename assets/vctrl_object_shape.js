window.v4ObjectShapeScript = `
(function() {
    console.log("[V4 Object Shape] Module initialized.");
    window.v4ObjectShape = window.v4ObjectShape || {};

    window.v4ObjectShape.handleUpdateStyle = (d) => {
        const s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected'); if (!s) return false;
        const shape = s.querySelector('.v4-shape') || (s.classList.contains('v4-shape') ? s : null);
        if (!shape) {
            // If the selected component is not a shape, let the legacy fallback inside dispatcher handle it!
            return false;
        }

        if (window.V4UndoManager) window.V4UndoManager.saveState();
        
        // Find all matching elements (both self and querySelectorAll)
        let targets = [];
        if (d.selector) {
            if (s.matches && s.matches(d.selector)) targets.push(s);
            targets.push(...Array.from(s.querySelectorAll(d.selector)));
        } else {
            targets = [shape];
        }
        if (targets.length === 0) return false;

        targets.forEach(t => {
            if (d.style) {
                if (d.style.width !== undefined || d.style.height !== undefined) {
                    s.setAttribute('data-resized', 'true');
                }
                
                // Prevent structure destruction: Update innerHTML of shape-text-content/editable-cell instead of .v4-shape
                if (d.style.html !== undefined) {
                    const targetCell = t.querySelector('.v4-shape-text-content') || t.querySelector('.v4-shape-text-overlay') || t.querySelector('.v4-editable-cell') || t;
                    if (targetCell !== t) {
                        targetCell.innerHTML = d.style.html;
                    } else {
                        t.innerHTML = d.style.html;
                    }
                }
                
                if (d.style.width !== undefined) {
                    s.style.width = d.style.width;
                    if (t !== s) t.style.width = '100%';
                }
                if (d.style.height !== undefined) {
                    s.style.height = d.style.height;
                    if (t !== s) t.style.height = '100%';
                }

                if (d.style.patternType !== undefined && t.classList.contains('v4-shape-pattern-grid')) {
                    console.log("[ObjectShape] Received patternType:", d.style.patternType, "Updating element:", t);
                    t.setAttribute('data-pattern-type', d.style.patternType);
                }

                if (t.classList.contains('v4-shape-line')) {
                    const lineEl = t.querySelector('line');
                    if (d.style.lineDir !== undefined) {
                        t.setAttribute('data-line-dir', d.style.lineDir);
                        const curW = parseFloat(s.style.width) || 200;
                        const curH = parseFloat(s.style.height) || 2;
                        const curLen = Math.max(curW, curH);
                        const th = parseFloat(t.getAttribute('data-line-width')) || 1.6;
                        if (d.style.lineDir === 'vertical') {
                            s.style.width = Math.max(th, 2) + 'px';
                            s.style.height = curLen + 'px';
                            if (lineEl) {
                                lineEl.setAttribute('x1', '50');
                                lineEl.setAttribute('y1', '0');
                                lineEl.setAttribute('x2', '50');
                                lineEl.setAttribute('y2', '100');
                            }
                        } else {
                            s.style.width = curLen + 'px';
                            s.style.height = Math.max(th, 2) + 'px';
                            if (lineEl) {
                                lineEl.setAttribute('x1', '0');
                                lineEl.setAttribute('y1', '50');
                                lineEl.setAttribute('x2', '100');
                                lineEl.setAttribute('y2', '50');
                            }
                        }
                    }
                    if (d.style.lineStyle !== undefined) {
                        t.setAttribute('data-line-style', d.style.lineStyle);
                        if (lineEl) {
                            if (d.style.lineStyle === 'dashed') lineEl.style.strokeDasharray = '6 4';
                            else if (d.style.lineStyle === 'dotted') lineEl.style.strokeDasharray = '2 3';
                            else lineEl.style.strokeDasharray = 'none';
                        }
                    }
                    if (d.style.lineThickness !== undefined) {
                        const th = parseFloat(d.style.lineThickness) || 1.6;
                        t.setAttribute('data-line-width', th);
                        if (lineEl) lineEl.style.strokeWidth = th;
                        const isVert = t.getAttribute('data-line-dir') === 'vertical';
                        if (isVert) s.style.width = Math.max(th, 2) + 'px';
                        else s.style.height = Math.max(th, 2) + 'px';
                    }
                    if (d.style.lineColor !== undefined) {
                        t.setAttribute('data-line-color', d.style.lineColor);
                        if (lineEl) lineEl.style.stroke = d.style.lineColor;
                    }
                }

                const isSvgContainer = t.classList.contains('v4-shape-diamond') || t.classList.contains('v4-shape-triangle') || t.classList.contains('v4-shape-wave') || t.classList.contains('v4-shape-arrow') || t.classList.contains('v4-shape-line');
                const svgShape = t.querySelector('path, polygon, rect, circle, line') || t.closest('.v4-shape')?.querySelector('path, polygon, rect, circle, line');

                // Assign styles with override for text alignment and background styling
                for (const [key, val] of Object.entries(d.style)) {
                    if (key === 'width' || key === 'height' || key === 'html' || key === 'patternType') continue;
                    
                    if (key === 'background' || key === 'backgroundColor') {
                        if (isSvgContainer) {
                            // SVG container shapes maintain a transparent container background so bounding box isn't rendered
                            t.style.background = 'transparent';
                            t.style.backgroundColor = 'transparent';
                        } else {
                            t.style[key] = val;
                        }
                    } else if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent' || key === 'borderRadius') {
                        const cssKey = key === 'textAlign' ? 'text-align' : (key === 'alignItems' ? 'align-items' : (key === 'justifyContent' ? 'justify-content' : 'border-radius'));
                        t.style.setProperty(cssKey, val, 'important');
                        
                        if (key === 'textAlign' || key === 'alignItems' || key === 'justifyContent') {
                            // Uniform margin/padding standard: top/bottom 5px, left/right 10px
                            t.style.setProperty('padding', '5px 10px', 'important');
                            t.style.setProperty('box-sizing', 'border-box', 'important');
                            
                            if (key === 'textAlign') {
                                // Propagate alignment to children while clearing duplicate padding/margin
                                t.querySelectorAll('p, span, .ql-editor, .ql-editor p').forEach(child => {
                                    child.style.setProperty('text-align', val, 'important');
                                    child.style.setProperty('padding', '0px', 'important');
                                    child.style.setProperty('margin', '0px', 'important');
                                });
                            } else if (key === 'alignItems') {
                                t.querySelectorAll('p, span, .ql-editor, .ql-editor p, .v4-shape-text-content, .v4-editable-cell').forEach(child => {
                                    child.style.setProperty('align-items', val, 'important');
                                    child.style.setProperty('padding', '0px', 'important');
                                    child.style.setProperty('margin', '0px', 'important');
                                });
                            } else if (key === 'justifyContent') {
                                t.querySelectorAll('p, span, .ql-editor, .ql-editor p, .v4-shape-text-content, .v4-editable-cell').forEach(child => {
                                    child.style.setProperty('justify-content', val, 'important');
                                });
                            }
                        }
                    } else {
                        t.style[key] = val;
                    }
                }
                
                if (svgShape) {
                    if (t.classList.contains('v4-shape-line')) {
                        const curLineWidth = t.getAttribute('data-line-width') || '1.6';
                        svgShape.style.strokeWidth = curLineWidth;
                        svgShape.style.fill = 'none';
                        svgShape.style.vectorEffect = 'non-scaling-stroke';
                    } else {
                        const targetFill = d.style.backgroundColor || d.style.background;
                        if (targetFill !== undefined) {
                            svgShape.style.fill = targetFill;
                        }
                        if (isSvgContainer) {
                            t.style.background = 'transparent';
                            t.style.backgroundColor = 'transparent';
                        }
                        if (d.style.borderColor) {
                            svgShape.style.stroke = d.style.borderColor;
                        }
                        if (d.style.borderWidth) {
                            svgShape.style.strokeWidth = d.style.borderWidth;
                        } else {
                            svgShape.style.strokeWidth = '1.6';
                        }
                        svgShape.style.vectorEffect = 'non-scaling-stroke';
                    }
                }
            }
        });
        
        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }
        return true;
    };
})();
`;
