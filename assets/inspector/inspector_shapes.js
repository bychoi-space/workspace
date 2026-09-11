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
        return (window.state && window.state.selectedComponent && window.state.selectedComponent.id) ||
               (window.state && window.state.editingIndex) ||
               window.activeCompId || null;
    };

    const getActiveTargetIds = () => {
        if (window.GroupingManager && typeof window.GroupingManager.getSelectedIds === 'function') {
            const selIds = window.GroupingManager.getSelectedIds();
            if (Array.isArray(selIds) && selIds.length > 0) return selIds;
        }
        const singleId = getActiveTargetId();
        return singleId ? [singleId] : [];
    };

    // --- State Synchronization (Read) ---
    const syncCornerBtns = (radiusVal) => {
        const btnSharp = document.getElementById('btn-shape-corner-sharp');
        const btnRound = document.getElementById('btn-shape-corner-round');
        const isSharp = parseInt(radiusVal) === 0;
        if (btnSharp) {
            btnSharp.style.background = isSharp ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnSharp.style.borderColor = isSharp ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnSharp.style.color = isSharp ? '#00e5ff' : '#94a3b8';
        }
        if (btnRound) {
            btnRound.style.background = !isSharp ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnRound.style.borderColor = !isSharp ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnRound.style.color = !isSharp ? '#00e5ff' : '#94a3b8';
        }
    };

    const syncAlignBtns = (alignVal) => {
        const btnLeft = document.getElementById('btn-shape-align-left');
        const btnCenter = document.getElementById('btn-shape-align-center');
        const btnRight = document.getElementById('btn-shape-align-right');
        const align = alignVal || 'center';
        
        if (btnLeft) {
            btnLeft.style.background = align === 'left' ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnLeft.style.borderColor = align === 'left' ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnLeft.style.color = align === 'left' ? '#00e5ff' : '#94a3b8';
        }
        if (btnCenter) {
            btnCenter.style.background = align === 'center' ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnCenter.style.borderColor = align === 'center' ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnCenter.style.color = align === 'center' ? '#00e5ff' : '#94a3b8';
        }
        if (btnRight) {
            btnRight.style.background = align === 'right' ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnRight.style.borderColor = align === 'right' ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnRight.style.color = align === 'right' ? '#00e5ff' : '#94a3b8';
        }
    };

    const syncVAlignBtns = (valignVal) => {
        const btnTop = document.getElementById('btn-shape-valign-top');
        const btnMiddle = document.getElementById('btn-shape-valign-middle');
        const btnBottom = document.getElementById('btn-shape-valign-bottom');
        const valign = (valignVal === 'flex-start' ? 'top' : (valignVal === 'flex-end' ? 'bottom' : (valignVal || 'middle'))).toLowerCase();
        
        if (btnTop) {
            btnTop.style.background = (valign === 'top' || valign === 'flex-start') ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnTop.style.borderColor = (valign === 'top' || valign === 'flex-start') ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnTop.style.color = (valign === 'top' || valign === 'flex-start') ? '#00e5ff' : '#94a3b8';
        }
        if (btnMiddle) {
            btnMiddle.style.background = (valign === 'middle' || valign === 'center') ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnMiddle.style.borderColor = (valign === 'middle' || valign === 'center') ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnMiddle.style.color = (valign === 'middle' || valign === 'center') ? '#00e5ff' : '#94a3b8';
        }
        if (btnBottom) {
            btnBottom.style.background = (valign === 'bottom' || valign === 'flex-end') ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.05)';
            btnBottom.style.borderColor = (valign === 'bottom' || valign === 'flex-end') ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.15)';
            btnBottom.style.color = (valign === 'bottom' || valign === 'flex-end') ? '#00e5ff' : '#94a3b8';
        }
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
                btn.style.setProperty('border', '1.6px solid #00e5ff', 'important');
                btn.style.setProperty('box-shadow', '0 0 8px rgba(0, 229, 255, 0.4)', 'important');
            } else {
                btn.style.setProperty('border', '1.6px solid rgba(255, 255, 255, 0.15)', 'important');
                btn.style.setProperty('box-shadow', 'none', 'important');
            }
        });
    };

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
                    selector: '.v4-shape-rect',
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
        
        notifyIframe({
            type: 'LF_UPDATE_STYLE',
            id: targetIds[0],
            ids: targetIds,
            selector: '.v4-shape .v4-shape-text-content, .v4-shape .v4-shape-text-overlay, .v4-shape .v4-editable-cell, .v4-text-box .v4-editable-cell, .v4-text-shape .v4-editable-cell, .text-marker .v4-editable-cell',
            style: {
                alignItems: horizontalAlign,
                textAlign: align,
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
        
        notifyIframe({
            type: 'LF_UPDATE_STYLE',
            id: targetIds[0],
            ids: targetIds,
            selector: '.v4-shape .v4-shape-text-content, .v4-shape .v4-shape-text-overlay, .v4-shape .v4-editable-cell, .v4-text-box .v4-editable-cell, .v4-text-shape .v4-editable-cell, .text-marker .v4-editable-cell',
            style: {
                justifyContent: verticalJustify,
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
            syncAlignBtns(s.textAlign || 'center');
            syncVAlignBtns(s.justifyContent || 'center');

            // Paddings
            syncShapePaddingInputs({
                padTop: parseInt(s.padTop !== undefined ? s.padTop : (s.paddingTop || 0)),
                padBottom: parseInt(s.padBottom !== undefined ? s.padBottom : (s.paddingBottom || 0)),
                padLeft: parseInt(s.padLeft !== undefined ? s.padLeft : (s.paddingLeft || 0)),
                padRight: parseInt(s.padRight !== undefined ? s.padRight : (s.paddingRight || 0))
            });

            // Pattern
            if (compStyles.patternType) {
                syncPatternVisualBtns(compStyles.patternType);
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
        },

        syncCornerBtns: syncCornerBtns,
        syncAlignBtns: syncAlignBtns,
        syncVAlignBtns: syncVAlignBtns,
        syncShapePaddingInputs: syncShapePaddingInputs,
        syncPatternVisualBtns: syncPatternVisualBtns,
        applyCornerRadius: applyCornerRadius,
        applyTextAlign: applyTextAlign,
        applyVerticalAlign: applyVerticalAlign,
        applyShapePadding: applyShapePadding
    };

    // Backward-compatible global aliases
    window._syncCornerBtns = syncCornerBtns;
    window._syncAlignBtns = syncAlignBtns;
    window._syncVAlignBtns = syncVAlignBtns;
    window._syncShapePaddingInputs = syncShapePaddingInputs;
    window._syncPatternVisualBtns = syncPatternVisualBtns;
    window._applyCornerRadius = applyCornerRadius;
    window._applyTextAlign = applyTextAlign;
    window._applyVerticalAlign = applyVerticalAlign;
    window._applyShapePadding = applyShapePadding;
})();
