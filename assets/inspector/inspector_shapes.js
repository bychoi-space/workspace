/**
 * assets/inspector_shapes.js
 * Domain Inspector Module: Shape Component (Rect, Circle, Triangle, Arrow, Diamond, Pattern)
 * Encapsulates state synchronization (Read), style actions, alignment, padding, and corner radius (Write).
 */
(function() {
    console.log("[Inspector Shapes] Domain module loaded.");

    const notifyIframe = (data) => window.notifyIframe(data);

    const getActiveTargetId = () => {
        if (window.GroupingManager && typeof window.GroupingManager.getSelectedIds === 'function') {
            const selIds = window.GroupingManager.getSelectedIds();
            if (Array.isArray(selIds) && selIds.length > 0) return selIds[0];
        }
        if (window.state && window.state.selectedIds && Array.isArray(window.state.selectedIds) && window.state.selectedIds.length > 0) {
            return window.state.selectedIds[0];
        }
        return (window.state && window.state.selectedComponent && window.state.selectedComponent.id) ||
               (window.state && window.state.editingIndex) ||
               window.activeCompId || null;
    };

    const getActiveTargetIds = () => {
        if (window.GroupingManager && typeof window.GroupingManager.getSelectedIds === 'function') {
            const selIds = window.GroupingManager.getSelectedIds();
            if (Array.isArray(selIds) && selIds.length > 0) return selIds;
        }
        if (window.state && window.state.selectedIds && Array.isArray(window.state.selectedIds) && window.state.selectedIds.length > 0) {
            return window.state.selectedIds;
        }
        const singleId = getActiveTargetId();
        return singleId ? [singleId] : [];
    };

    const setBtnActive = (btn, isActive) => {
        if (!btn) return;
        highlightActive(btn, isActive);
    };

    // --- State Synchronization (Read) ---
    const syncCornerBtns = (radiusVal) => {
        const btnSharp = document.getElementById('btn-shape-corner-sharp');
        const btnRound = document.getElementById('btn-shape-corner-round');
        const isSharp = parseInt(radiusVal) === 0;
        setBtnActive(btnSharp, isSharp);
        setBtnActive(btnRound, !isSharp);
    };

    const syncAlignBtns = (alignVal) => {
        const btnLeft = document.getElementById('btn-shape-align-left');
        const btnCenter = document.getElementById('btn-shape-align-center');
        const btnRight = document.getElementById('btn-shape-align-right');
        const align = (alignVal || 'left').toLowerCase();
        
        setBtnActive(btnLeft, align === 'left');
        setBtnActive(btnCenter, align === 'center');
        setBtnActive(btnRight, align === 'right');
    };

    const syncVAlignBtns = (valignVal) => {
        const btnTop = document.getElementById('btn-shape-valign-top');
        const btnMiddle = document.getElementById('btn-shape-valign-middle');
        const btnBottom = document.getElementById('btn-shape-valign-bottom');
        const valign = (valignVal === 'flex-start' ? 'top' : (valignVal === 'flex-end' ? 'bottom' : (valignVal || 'middle'))).toLowerCase();
        
        setBtnActive(btnTop, valign === 'top' || valign === 'flex-start');
        setBtnActive(btnMiddle, valign === 'middle' || valign === 'center');
        setBtnActive(btnBottom, valign === 'bottom' || valign === 'flex-end');
    };

    const syncShapePaddingInputs = (padObj) => {
        const inTop = document.getElementById('shape-pad-top');
        const inBottom = document.getElementById('shape-pad-bottom');
        const inLeft = document.getElementById('shape-pad-left');
        const inRight = document.getElementById('shape-pad-right');
        if (!padObj) return;

        if (inTop && padObj.padTop !== undefined) inTop.value = padObj.padTop;
        if (inBottom && padObj.padBottom !== undefined) inBottom.value = padObj.padBottom;
        if (inLeft && padObj.padLeft !== undefined) inLeft.value = padObj.padLeft;
        if (inRight && padObj.padRight !== undefined) inRight.value = padObj.padRight;
    };

    const syncPatternVisualBtns = (selectedType) => {
        document.querySelectorAll('.v4-pattern-type-btn').forEach(btn => {
            const bType = btn.dataset.type;
            if (bType === selectedType) {
                btn.style.setProperty('border', '1.6px solid var(--accent, #6e56cf)', 'important');
                btn.style.setProperty('box-shadow', '0 0 8px rgba(110, 86, 207, 0.4)', 'important');
            } else {
                btn.style.setProperty('border', '1.6px solid rgba(255, 255, 255, 0.15)', 'important');
                btn.style.setProperty('box-shadow', 'none', 'important');
            }
        });
    };

    const syncWaveDirBtns = (dir) => {
        const waveDir = dir || 'horizontal';
        document.querySelectorAll('.v4-wave-dir-btn').forEach(b => {
            const btnDir = b.dataset.dir;
            highlightActive(b, btnDir === waveDir);
        });
    };
    window._syncWaveDirBtns = syncWaveDirBtns;

    // --- Action Handlers (Write) ---
    const applyCornerRadius = (val) => {
        const slider = document.getElementById('shape-border-radius');
        const txt = document.getElementById('txt-shape-border-radius');
        if (slider) {
            slider.value = val;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            const targetIds = getActiveTargetIds();
            if (targetIds.length > 0) {
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    id: targetIds[0],
                    ids: targetIds,
                    selector: '.v4-shape-rect, .v4-shape-webpage',
                    style: { borderRadius: val + 'px' }
                });
                if (typeof window.markAsDirty === 'function') window.markAsDirty();
            }
        }
        if (txt) txt.innerText = val;
        syncCornerBtns(val);
    };

    const applyTextAlign = (align) => {
        syncAlignBtns(align);
        const horizontalAlign = align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center');
        const targetIds = getActiveTargetIds();
        if (targetIds.length === 0) return;

        if (window.state && window.state.selectedComponentStyles && window.state.selectedComponentStyles.currentStyles) {
            window.state.selectedComponentStyles.currentStyles.textAlign = align;
            window.state.selectedComponentStyles.currentStyles.alignItems = horizontalAlign;
        }

        // Synchronize Content Editor (Quill) text alignment
        if (window.quillEditor && window.quillEditor.root) {
            window.quillEditor.root.style.textAlign = align;
        }
        if (window._currentStickyFormat) {
            window._currentStickyFormat.align = align;
        }
        if (window.quillEditor) {
            window.quillEditor.format('align', align === 'left' ? false : align, 'silent');
        }
        
        notifyIframe({
            type: 'LF_UPDATE_STYLE',
            id: targetIds[0],
            ids: targetIds,
            selector: '.v4-shape .v4-shape-text-content, .v4-shape .v4-shape-text-overlay, .v4-shape .v4-editable-cell, .v4-text-box .v4-editable-cell, .v4-text-shape .v4-editable-cell, .text-marker .v4-editable-cell',
            style: {
                alignItems: horizontalAlign,
                textAlign: align,
                align: align,
                boxSizing: 'border-box'
            }
        });
        if (typeof window.markAsDirty === 'function') window.markAsDirty();
    };

    const applyVerticalAlign = (vAlign) => {
        syncVAlignBtns(vAlign);
        const verticalJustify = vAlign === 'top' ? 'flex-start' : (vAlign === 'bottom' ? 'flex-end' : 'center');
        const targetIds = getActiveTargetIds();
        if (targetIds.length === 0) return;

        if (window.state && window.state.selectedComponentStyles && window.state.selectedComponentStyles.currentStyles) {
            window.state.selectedComponentStyles.currentStyles.justifyContent = verticalJustify;
            window.state.selectedComponentStyles.currentStyles.vAlign = vAlign;
        }
        
        notifyIframe({
            type: 'LF_UPDATE_STYLE',
            id: targetIds[0],
            ids: targetIds,
            selector: '.v4-shape .v4-shape-text-content, .v4-shape .v4-shape-text-overlay, .v4-shape .v4-editable-cell, .v4-text-box .v4-editable-cell, .v4-text-shape .v4-editable-cell, .text-marker .v4-editable-cell',
            style: {
                justifyContent: verticalJustify,
                vAlign: vAlign,
                boxSizing: 'border-box'
            }
        });
        if (typeof window.markAsDirty === 'function') window.markAsDirty();
    };

    const applyShapePadding = (topVal, bottomVal, leftVal, rightVal) => {
        const top = Math.max(0, parseInt(topVal) || 0);
        const bottom = Math.max(0, parseInt(bottomVal) || 0);
        const left = Math.max(0, parseInt(leftVal) || 0);
        const right = Math.max(0, parseInt(rightVal) || 0);

        const inTop = document.getElementById('shape-pad-top');
        const inBottom = document.getElementById('shape-pad-bottom');
        const inLeft = document.getElementById('shape-pad-left');
        const inRight = document.getElementById('shape-pad-right');
        if (inTop && inTop.value != top) inTop.value = top;
        if (inBottom && inBottom.value != bottom) inBottom.value = bottom;
        if (inLeft && inLeft.value != left) inLeft.value = left;
        if (inRight && inRight.value != right) inRight.value = right;

        const targetIds = getActiveTargetIds();
        if (targetIds.length === 0) return;

        notifyIframe({
            type: 'LF_UPDATE_STYLE',
            id: targetIds[0],
            ids: targetIds,
            selector: '.v4-shape .v4-shape-text-content, .v4-shape .v4-shape-text-overlay, .v4-shape .v4-editable-cell',
            style: {
                padTop: top,
                padBottom: bottom,
                padLeft: left,
                padRight: right,
                paddingTop: top + 'px',
                paddingBottom: bottom + 'px',
                paddingLeft: left + 'px',
                paddingRight: right + 'px',
                boxSizing: 'border-box'
            }
        });
        if (typeof window.markAsDirty === 'function') window.markAsDirty();
    };

    window.InspectorShapes = {
        sync: function(compStyles) {
            if (!compStyles) return;
            const s = compStyles.currentStyles || {};
            
            // Corner radius
            if (s.borderRadius !== undefined) {
                const rVal = parseInt(s.borderRadius) || 0;
                const slider = document.getElementById('shape-border-radius');
                const txt = document.getElementById('txt-shape-border-radius');
                if (slider) slider.value = rVal;
                if (txt) txt.innerText = rVal;
                syncCornerBtns(rVal);
            }

            // Alignments
            const curAlign = s.textAlign || 'center';
            syncAlignBtns(curAlign);
            syncVAlignBtns(s.vAlign || s.justifyContent || 'center');
            if (window.quillEditor && window.quillEditor.root) {
                window.quillEditor.root.style.textAlign = curAlign;
            }
            if (window._currentStickyFormat) {
                window._currentStickyFormat.align = curAlign;
            }

            // Paddings (Applicable only to geometry container shapes)
            const isTextShape = !!compStyles.isTextShape || (compStyles.id && compStyles.id.startsWith('v4-text-')) || (compStyles.classList && (compStyles.classList.includes('v4-text-shape') || compStyles.classList.includes('v4-text-box'))) || (!compStyles.isShape && compStyles.isPin);
            const isImage = !!compStyles.isImage;
            const isPinMarker = (compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1 && !isNaN(compStyles.pinIndex)) || !!compStyles.isDescriptionPin;
            const supportsTextPadding = compStyles.isShape && !isImage && !isTextShape && !isPinMarker;

            const padGroup = document.getElementById('shape-padding-group');
            if (padGroup) {
                padGroup.style.display = supportsTextPadding ? 'block' : 'none';
            }

            if (supportsTextPadding) {
                syncShapePaddingInputs({
                    padTop: parseInt(s.padTop !== undefined ? s.padTop : (s.paddingTop || 0)),
                    padBottom: parseInt(s.padBottom !== undefined ? s.padBottom : (s.paddingBottom || 0)),
                    padLeft: parseInt(s.padLeft !== undefined ? s.padLeft : (s.paddingLeft || 0)),
                    padRight: parseInt(s.padRight !== undefined ? s.padRight : (s.paddingRight || 0))
                });
            }

            // Pattern
            if (compStyles.patternType) {
                syncPatternVisualBtns(compStyles.patternType);
            }

            // Wave Direction
            if (compStyles.waveDir) {
                syncWaveDirBtns(compStyles.waveDir);
            }
        },

        bindEvents: function() {
            // Corner Buttons
            const btnSharp = document.getElementById('btn-shape-corner-sharp');
            const btnRound = document.getElementById('btn-shape-corner-round');
            if (btnSharp) btnSharp.onclick = () => applyCornerRadius(0);
            if (btnRound) btnRound.onclick = () => applyCornerRadius(8);

            // Align Buttons
            const btnLeft = document.getElementById('btn-shape-align-left');
            const btnCenter = document.getElementById('btn-shape-align-center');
            const btnRight = document.getElementById('btn-shape-align-right');
            if (btnLeft) btnLeft.onclick = () => applyTextAlign('left');
            if (btnCenter) btnCenter.onclick = () => applyTextAlign('center');
            if (btnRight) btnRight.onclick = () => applyTextAlign('right');

            // VAlign Buttons
            const btnTop = document.getElementById('btn-shape-valign-top');
            const btnMiddle = document.getElementById('btn-shape-valign-middle');
            const btnBottom = document.getElementById('btn-shape-valign-bottom');
            if (btnTop) btnTop.onclick = () => applyVerticalAlign('top');
            if (btnMiddle) btnMiddle.onclick = () => applyVerticalAlign('middle');
            if (btnBottom) btnBottom.onclick = () => applyVerticalAlign('bottom');

            // Padding Inputs
            ['shape-pad-top', 'shape-pad-bottom', 'shape-pad-left', 'shape-pad-right'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.oninput = () => {
                        const t = document.getElementById('shape-pad-top')?.value || 0;
                        const b = document.getElementById('shape-pad-bottom')?.value || 0;
                        const l = document.getElementById('shape-pad-left')?.value || 0;
                        const r = document.getElementById('shape-pad-right')?.value || 0;
                        applyShapePadding(t, b, l, r);
                    };
                }
            });

            // Shape Background Transparency Toggle
            const btnShapeBgNone = document.getElementById('btn-shape-bg-none');
            if (btnShapeBgNone) {
                btnShapeBgNone.onclick = () => {
                    const opacitySlider = document.getElementById('shape-bg-opacity');
                    if (opacitySlider) {
                        opacitySlider.value = 0;
                        opacitySlider.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                };
            }
        },

        syncCornerBtns: syncCornerBtns,
        syncAlignBtns: syncAlignBtns,
        syncVAlignBtns: syncVAlignBtns,
        syncShapePaddingInputs: syncShapePaddingInputs,
        syncPatternVisualBtns: syncPatternVisualBtns,
        syncWaveDirBtns: syncWaveDirBtns,
        applyCornerRadius: applyCornerRadius,
        applyTextAlign: applyTextAlign,
        applyVerticalAlign: applyVerticalAlign,
        applyShapePadding: applyShapePadding
    };

    // Button Corner Presets Helper
    function syncButtonCornerBtns(val) {
        const r = parseInt(val, 10) || 0;
        document.querySelectorAll('.btn-btn-corner').forEach(btn => {
            const br = parseInt(btn.getAttribute('data-radius'), 10) || 0;
            if (br === r) {
                btn.classList.add('active');
                btn.style.borderColor = 'var(--accent, #6e56cf)';
                btn.style.color = '#ffffff';
                btn.style.background = 'rgba(110, 86, 207, 0.25)';
                btn.style.boxShadow = '0 0 6px rgba(110, 86, 207, 0.3)';
            } else {
                btn.classList.remove('active');
                btn.style.borderColor = '';
                btn.style.color = '';
                btn.style.background = '';
                btn.style.boxShadow = '';
            }
        });
    }

    // Global click delegation for Pattern, Arrow Direction, and Button Corner Presets
    document.addEventListener('click', function(e) {
        if (!e.target) return;

        // Pattern button
        const patternBtn = e.target.closest('.v4-pattern-type-btn');
        if (patternBtn) {
            const pType = patternBtn.dataset.type;
            syncPatternVisualBtns(pType);
            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                selector: '.v4-shape',
                style: { patternType: pType }
            });
            if (typeof window.markAsDirty === 'function') window.markAsDirty();
            return;
        }

        // Arrow / Triangle direction button
        const arrowBtn = e.target.closest('.v4-arrow-dir-btn');
        if (arrowBtn) {
            const dir = arrowBtn.dataset.dir;
            if (typeof window._syncArrowDirBtns === 'function') {
                window._syncArrowDirBtns(dir);
            }
            notifyIframe({
                type: 'LF_UPDATE_ARROW_DIRECTION',
                direction: dir
            });
            if (typeof window.markAsDirty === 'function') window.markAsDirty();
            return;
        }

        // Wave direction button
        const waveBtn = e.target.closest('.v4-wave-dir-btn');
        if (waveBtn) {
            const dir = waveBtn.dataset.dir;
            syncWaveDirBtns(dir);
            const targetIds = getActiveTargetIds();
            if (targetIds.length > 0) {
                notifyIframe({
                    type: 'LF_UPDATE_STYLE',
                    id: targetIds[0],
                    ids: targetIds,
                    selector: '.v4-shape-wave',
                    style: { waveDir: dir }
                });
                if (typeof window.markAsDirty === 'function') window.markAsDirty();
            }
            return;
        }

        // Button corner presets
        const btnCorner = e.target.closest('.btn-btn-corner');
        if (btnCorner) {
            const r = parseInt(btnCorner.getAttribute('data-radius'), 10) || 0;
            const radiusSlider = document.getElementById('prop-button-border-radius');
            const radiusTxt = document.getElementById('txt-button-border-radius');
            if (radiusSlider) {
                radiusSlider.value = r;
                if (radiusTxt) radiusTxt.innerText = r;
                radiusSlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            syncButtonCornerBtns(r);
            return;
        }
    });

    // Global input delegation for shape-bg-color and shape-bg-opacity (Single SSOT)
    document.addEventListener('input', function(e) {
        if (!e.target) return;

        if (e.target.id === 'shape-bg-color') {
            const colorHex = e.target.value;
            const opacitySlider = document.getElementById('shape-bg-opacity');
            let opacityVal = opacitySlider ? parseInt(opacitySlider.value, 10) : 100;

            if (opacityVal === 0 && opacitySlider) {
                opacityVal = 100;
                opacitySlider.value = 100;
                const txt = document.getElementById('txt-shape-bg-opacity');
                if (txt) txt.innerText = 100;
            }

            const rgbaColor = (window.hexToRgba ? window.hexToRgba(colorHex, opacityVal / 100) : colorHex);
            const targetIds = getActiveTargetIds();

            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                id: targetIds[0] || undefined,
                ids: targetIds.length > 0 ? targetIds : undefined,
                selector: '.v4-shape, .v4-text-shape, .v4-text-box, .text-marker',
                style: { background: rgbaColor, backgroundColor: rgbaColor }
            });

            const wrapper = document.getElementById('shape-bg-wrapper');
            if (wrapper) wrapper.classList.remove('transparent-active');
            if (typeof window.markAsDirty === 'function') window.markAsDirty();
        } else if (e.target.id === 'shape-bg-opacity') {
            const opacityVal = e.target.value;
            const txt = document.getElementById('txt-shape-bg-opacity');
            if (txt) txt.innerText = opacityVal;

            const colorPicker = document.getElementById('shape-bg-color');
            const colorHex = (colorPicker && colorPicker.value) ? colorPicker.value : '#ffffff';
            const rgbaColor = (window.hexToRgba ? window.hexToRgba(colorHex, parseInt(opacityVal, 10) / 100) : colorHex);
            const targetIds = getActiveTargetIds();

            notifyIframe({
                type: 'LF_UPDATE_STYLE',
                id: targetIds[0] || undefined,
                ids: targetIds.length > 0 ? targetIds : undefined,
                selector: '.v4-shape, .v4-text-shape, .v4-text-box, .text-marker',
                style: { background: rgbaColor, backgroundColor: rgbaColor }
            });

            const wrapper = document.getElementById('shape-bg-wrapper');
            if (wrapper) {
                if (parseInt(opacityVal, 10) === 0) {
                    wrapper.classList.add('transparent-active');
                } else {
                    wrapper.classList.remove('transparent-active');
                }
            }
            if (typeof window.markAsDirty === 'function') window.markAsDirty();
        } else if (e.target.id === 'prop-button-border-radius') {
            syncButtonCornerBtns(e.target.value);
        }
    });

    // Backward-compatible global aliases
    window._syncCornerBtns = syncCornerBtns;
    window._syncAlignBtns = syncAlignBtns;
    window._syncVAlignBtns = syncVAlignBtns;
    window._syncShapePaddingInputs = syncShapePaddingInputs;
    window._syncPatternVisualBtns = syncPatternVisualBtns;
    window._syncButtonCornerBtns = syncButtonCornerBtns;
    window._applyCornerRadius = applyCornerRadius;
    window._applyTextAlign = applyTextAlign;
    window._applyVerticalAlign = applyVerticalAlign;
    window._applyShapePadding = applyShapePadding;
})();
