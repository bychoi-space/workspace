// --- Core CSS Constants for V4 Iframe Injection ---
window.v4Styles = `
:root { 
    --v4-primary: #6366f1; 
    --v4-accent: #00e5ff; 
    --v4-bg-dark: #0f172a; 
    --v4-panel-bg: rgba(30, 41, 59, 0.7); 
    --v4-border: rgba(255, 255, 255, 0.15); 
    --v4-text-main: #ffffff; 
    --v4-text-dim: #94a3b8;
    --v4-text-color: #0f172a;
    --v4-font-size: 12px;
    --v4-font-weight: 400;
    --v4-font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    --v4-placeholder-color: #94a3b8;
}
body, .page, .lf-component { 
    -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; 
    font-family: var(--v4-font-family) !important; 
    -webkit-font-smoothing: antialiased !important; 
    -moz-osx-font-smoothing: grayscale !important;
    text-rendering: optimizeLegibility !important; 
    font-synthesis: none;
}
.lf-component img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    pointer-events: auto;
}
.v4-editable-cell, [contenteditable="true"] { 
    -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; user-select: text; 
    font-family: inherit !important; 
    -webkit-font-smoothing: antialiased !important; 
    -moz-osx-font-smoothing: grayscale !important;
    text-rendering: optimizeLegibility !important; 
    font-synthesis: none;
}
.lf-component { 
    position: absolute; cursor: pointer;
    box-sizing: border-box; z-index: 100;
    transform: none !important; /* Kill legacy centering drift */
}
.lf-component.selected { outline: 2px solid #6366f1; }
.lf-component.lf-group.selected { outline: 2px solid #10b981 !important; }
/* --- Legacy Handle Safety Nullification --- */
.lf-drag-handle,
.lf-resizer { 
    display: none !important; 
    opacity: 0 !important; 
    visibility: hidden !important; 
    pointer-events: none !important; 
}
.lf-component .lf-component .lf-delete-trigger,
.lf-in-group .lf-delete-trigger,
.pin-marker > .lf-delete-trigger,
.pin-marker > .lf-connector-port { display: none !important; }
.lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none !important; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 10002; font-size: 14px; font-weight: bold; }
.lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: none !important; }
.v4-premium-table { table-layout: fixed; border-collapse: collapse; border: 1.6px solid #cbd5e1 !important; font-family: inherit; }
.v4-premium-table th { padding: 14px 16px; text-align: left; border: 1.6px solid #cbd5e1 !important; font-weight: 400; font-size: 12px; color: var(--v4-text-color, #0f172a); white-space: nowrap; }
.v4-premium-table td { padding: 14px 16px; border: 1.6px solid #cbd5e1 !important; font-size: 12px; font-weight: 400; color: var(--v4-text-color, #0f172a); }
.v4-grid-container table th, .v4-grid-container table td { border-right: 1.6px solid rgb(226, 232, 240) !important; line-height: 1.2 !important; padding: 0 8px !important; }
.v4-grid-container table td[data-type="checkbox"], .v4-grid-container table th[data-type="checkbox"], .v4-grid-container table td.v4-grid-check-col, .v4-grid-container table th.v4-grid-check-col { padding: 0 !important; }
.v4-grid-container table td *, .v4-grid-container table th * { margin: 0 !important; padding: 0 !important; line-height: inherit !important; }
.v4-grid-container table tr { border-bottom: 1.6px solid rgb(226, 232, 240) !important; }
.v4-grid-container td.v4-grid-cell { font-size: 12px !important; font-family: inherit !important; color: var(--v4-text-color, #0f172a) !important; font-weight: 400 !important; }
.v4-grid-container th.v4-grid-cell { font-size: 12px !important; font-family: inherit !important; color: var(--v4-text-color, #0f172a) !important; font-weight: 400 !important; position: sticky !important; top: 0 !important; z-index: 10 !important; background: #f8fafc !important; }
.v4-shape { position: relative; border-width: 1.6px !important; border-style: solid !important; border-color: rgb(200, 200, 200); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgb(255, 255, 255); color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; }
.v4-shape-text-content, .v4-shape-text-overlay, .v4-shape .v4-editable-cell { padding: 5px 10px !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; box-sizing: border-box !important; flex-direction: column !important; }
.v4-shape-rect > .v4-editable-cell, .v4-shape-circle > .v4-editable-cell, .v4-shape-pattern-grid > .v4-editable-cell, .v4-shape-wave > .v4-editable-cell { width: 100% !important; height: 100% !important; }
.v4-shape-diamond > .v4-editable-cell { width: 60% !important; height: 60% !important; }
.v4-shape-arrow > .v4-editable-cell { width: 50% !important; height: 40% !important; }
.v4-shape-triangle > .v4-editable-cell { width: 100% !important; height: 60% !important; }
.v4-shape-text-content p, .v4-shape-text-overlay p, .v4-shape .v4-editable-cell p { margin: 0 !important; padding: 0 !important; line-height: 1 !important; text-align: inherit !important; display: block !important; transform: translateY(var(--v4-text-adjust-y, 0px)) !important; }
.v4-shape-text-content span, .v4-shape-text-overlay span, .v4-shape .v4-editable-cell span { line-height: 1 !important; display: inline-block !important; }
.v4-shape-text-content .ql-container { border: none !important; padding: 0 !important; margin: 0 !important; height: 100% !important; width: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; }
.v4-shape-text-content .ql-editor { padding: 0 !important; margin: 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; min-height: unset !important; height: 100% !important; width: 100% !important; line-height: 1 !important; }
.lf-component .v4-editable-cell { line-height: 1 !important; }
.v4-editable-cell:focus { outline: 2px solid #6366f1; }
th.v4-editable-cell:focus, td.v4-editable-cell:focus { outline-offset: -2px !important; }
:not(th):not(td).v4-editable-cell:focus { background: rgba(99, 102, 241, 0.05) !important; }
.selected-cell {
    outline: 1.6px dashed #6366f1 !important;
    outline-offset: -1.6px !important;
    background-color: rgba(99, 102, 241, 0.08) !important;
}
.lf-icon { 
    width: 100%; height: 100%; 
    display: inline-block; 
    pointer-events: none; 
}
.v4-logo-img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; display: block; }
img.lf-icon { width: 100%; height: 100%; padding: 8px; box-sizing: border-box; object-fit: contain; }
.v4-shape-triangle, .v4-directional-shape { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; transform-origin: center center !important; }
.v4-shape-triangle { clip-path: none !important; border: none !important; }
.v4-shape-arrow { transform: none !important; border: none !important; width: 100% !important; height: 100% !important; }
.v4-shape-arrow svg { width: 100% !important; height: 100% !important; display: block !important; }
.v4-shape-triangle[data-direction="up"], .v4-directional-shape[data-direction="up"] { transform: rotate(0deg) !important; }
.v4-shape-triangle[data-direction="right"], .v4-directional-shape[data-direction="right"] { transform: rotate(90deg) !important; }
.v4-shape-triangle[data-direction="down"], .v4-directional-shape[data-direction="down"] { transform: rotate(180deg) !important; }
.v4-shape-triangle[data-direction="left"], .v4-directional-shape[data-direction="left"] { transform: rotate(270deg) !important; }

/* Counter-rotate text elements to keep them horizontal and clean */
.v4-shape-triangle .v4-editable-cell, .v4-shape-triangle .v4-shape-text-overlay,
.v4-directional-shape .v4-editable-cell, .v4-directional-shape .v4-shape-text-overlay { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; transform-origin: center center !important; }

.v4-shape-triangle[data-direction="up"] .v4-editable-cell, .v4-shape-triangle[data-direction="up"] .v4-shape-text-overlay,
.v4-directional-shape[data-direction="up"] .v4-editable-cell, .v4-directional-shape[data-direction="up"] .v4-shape-text-overlay { transform: rotate(0deg) !important; }

.v4-shape-triangle[data-direction="right"] .v4-editable-cell, .v4-shape-triangle[data-direction="right"] .v4-shape-text-overlay,
.v4-directional-shape[data-direction="right"] .v4-editable-cell, .v4-directional-shape[data-direction="right"] .v4-shape-text-overlay { transform: rotate(-90deg) !important; }

.v4-shape-triangle[data-direction="down"] .v4-editable-cell, .v4-shape-triangle[data-direction="down"] .v4-shape-text-overlay,
.v4-directional-shape[data-direction="down"] .v4-editable-cell, .v4-directional-shape[data-direction="down"] .v4-shape-text-overlay { transform: rotate(-180deg) !important; }

.v4-shape-triangle[data-direction="left"] .v4-editable-cell, .v4-shape-triangle[data-direction="left"] .v4-shape-text-overlay,
.v4-directional-shape[data-direction="left"] .v4-editable-cell, .v4-directional-shape[data-direction="left"] .v4-shape-text-overlay { transform: rotate(-270deg) !important; }
.v4-shape-diamond { border: none !important; }
.v4-shape-wave { border: none !important; }
.v4-shape-pattern-grid { 
    background-color: #ffffff !important; 
    background-image: 
        linear-gradient(45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)), 
        linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)) !important; 
    background-size: 12px 12px !important; 
    border-radius: 0px; 
    overflow: hidden !important;
}
/* Reset background for new SVG/Custom atoms to prevent sprite leakage */
svg.lf-icon, div.v4-checkbox.lf-icon, div.v4-radio.lf-icon { background-image: none !important; }
/* Slim Line Icon Standard (stroke-width 1.2) */
svg.lf-icon:not(.v4-logo-img),
svg.lf-icon:not(.v4-logo-img) path,
svg.lf-icon:not(.v4-logo-img) circle,
svg.lf-icon:not(.v4-logo-img) rect,
svg.lf-icon:not(.v4-logo-img) line,
svg.lf-icon:not(.v4-logo-img) polyline,
svg.lf-icon:not(.v4-logo-img) polygon,
.v4-searchbar-icon-wrap svg,
.v4-searchbar-icon-wrap svg * {
    stroke-width: 1.2 !important;
}
.v4-searchbar-text:empty::before {
    content: attr(data-placeholder);
    color: #94a3b8 !important;
    pointer-events: none;
    display: block;
}
/* Unified Disabled State for 11 Target Atoms (Shape BG: #c8c8c8, Text/Control: #969696, Border: #969696 / #b0b0b0) */

/* 1. Reset outer containers so background does not fill outer bounding boxes */
.v4-checkbox-container[data-disabled="true"],
.v4-radio-container[data-disabled="true"],
.v4-stepper-container[data-disabled="true"],
.lf-component[data-disabled="true"] {
    background: transparent !important;
    background-color: transparent !important;
    border-color: transparent !important;
}

/* 2. Target specific atom input/shape elements for gray fill #c8c8c8 */
.v4-textbox-container[data-disabled="true"],
.v4-textarea-container[data-disabled="true"],
.v4-stepper-container[data-disabled="true"] .v4-stepper-control,
.v4-stepper-container[data-disabled="true"] .v4-stepper-dec,
.v4-stepper-container[data-disabled="true"] .v4-stepper-inc,
.v4-stepper-container[data-disabled="true"] .v4-stepper-value,
.v4-stepper-container[data-disabled="true"] .v4-stepper-action,
.v4-selectbox-header[data-disabled="true"],
.v4-selectbox-container[data-disabled="true"] .v4-selectbox-header,
.v4-fileupload-button[data-disabled="true"],
.v4-fileupload-container[data-disabled="true"] .v4-fileupload-button,
.v4-datepicker-container[data-disabled="true"],
.v4-toggle-track[data-disabled="true"],
.v4-toggle-container[data-disabled="true"] .v4-toggle-track,
.v4-accordion-container[data-disabled="true"],
.v4-checkbox[data-disabled="true"],
.v4-checkbox-container[data-disabled="true"] .v4-checkbox,
.v4-radio[data-disabled="true"],
.v4-radio-container[data-disabled="true"] .v4-radio,
.v4-searchbar-container[data-disabled="true"] {
    background-color: #c8c8c8 !important;
    background: #c8c8c8 !important;
    border-color: #969696 !important;
}

/* 3. Target text, controls, icons, dots, chevrons for dark gray #969696 */
[data-disabled="true"] .v4-checkbox-text,
[data-disabled="true"] .v4-radio-text,
[data-disabled="true"] .v4-textbox-text,
[data-disabled="true"] .v4-textarea-text,
[data-disabled="true"] .v4-searchbar-text,
[data-disabled="true"] .v4-stepper-value,
[data-disabled="true"] .v4-stepper-dec,
[data-disabled="true"] .v4-stepper-inc,
[data-disabled="true"] .v4-stepper-action,
[data-disabled="true"] .v4-accordion-title-text,
[data-disabled="true"] .v4-accordion-chevron,
[data-disabled="true"] .v4-accordion-item,
[data-disabled="true"] .v4-radio-dot,
[data-disabled="true"] .v4-checkbox-check,
[data-disabled="true"] .v4-toggle-knob,
[data-disabled="true"] .v4-toggle-thumb {
    color: #969696 !important;
    border-color: #969696 !important;
}

[data-disabled="true"] .v4-radio-dot,
[data-disabled="true"] .v4-toggle-knob,
[data-disabled="true"] .v4-toggle-thumb {
    background-color: #969696 !important;
    background: #969696 !important;
}

[data-disabled="true"] svg,
[data-disabled="true"] svg path,
[data-disabled="true"] svg polyline,
[data-disabled="true"] svg line,
[data-disabled="true"] svg circle {
    stroke: #969696 !important;
}

[data-disabled="true"] .v4-searchbar-text:empty::before,
[data-disabled="true"] .v4-textbox-text:empty::before,
[data-disabled="true"] .v4-textarea-text:empty::before {
    color: #969696 !important;
}
.v4-selectbox-container { display: flex !important; flex-direction: column !important; box-sizing: border-box !important; position: relative !important; width: 100% !important; height: 100% !important; }
.v4-selectbox-header { height: 30px !important; min-height: 30px !important; max-height: 30px !important; flex-shrink: 0 !important; display: flex !important; align-items: center !important; justify-content: space-between !important; box-sizing: border-box !important; }
.v4-selectbox-container[data-dropdown-active="true"] .v4-selectbox-header { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }
.v4-selectbox-container[data-dropdown-active="true"] svg { transform: rotate(180deg); }
.v4-selectbox-options { position: relative !important; top: 0 !important; left: 0 !important; right: 0 !important; background: #ffffff !important; box-sizing: border-box !important; width: 100% !important; flex: 1 !important; margin-top: 0 !important; z-index: 10 !important; border-top: none !important; }
.v4-selectbox-option { height: 30px !important; min-height: 30px !important; max-height: 30px !important; flex-shrink: 0 !important; padding: 0 12px !important; display: flex !important; align-items: center !important; font-size: 12px !important; color: #374151 !important; box-sizing: border-box !important; }
.v4-selectbox-option:hover { background-color: #f3f4f6 !important; cursor: pointer; }
.v4-selectbox-option:last-child { border-bottom: none !important; }
.v4-fileupload-container[data-selected="true"] .v4-fileupload-delete { display: block !important; }
.v4-fileupload-delete:hover { color: #ef4444 !important; }
.v4-fileupload-button:hover { background-color: #f9fafb !important; border-color: #babcbe !important; }

/* Text Marker Integration - Unified px Top-Left (same as shapes/atoms) */
.text-marker, .v4-text-box, .v4-text-shape { 
    position: absolute; padding: 0 !important; border-radius: 0px !important; 
    border: 1.6px solid transparent; font-size: 12px; font-weight: 400; font-family: inherit; line-height: 1.2; 
    white-space: normal; cursor: grab; pointer-events: auto; z-index: 100; 
    transition: box-shadow 0.2s, background 0.2s;
    min-width: unset; min-height: unset; background: transparent; 
    box-shadow: none; box-sizing: border-box;
    color: var(--v4-text-color, #0f172a); text-align: left;
    width: auto;
}
.text-marker .v4-editable-cell, .v4-text-box .v4-editable-cell, .v4-text-shape .v4-editable-cell { padding: 4px !important; margin: 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: inherit; box-sizing: border-box !important; line-height: 1 !important; width: 100% !important; height: 100% !important; }
.text-marker .v4-editable-cell p, .v4-text-box .v4-editable-cell p, .v4-text-shape .v4-editable-cell p { margin: 0 !important; padding: 0 !important; line-height: 1.2 !important; display: block !important; transform: translateY(var(--v4-text-adjust-y, 0px)) !important; }
.text-marker:hover, .v4-text-box:hover, .v4-text-shape:hover { border-color: transparent !important; background: transparent; box-shadow: none; }
.text-marker.selected, .v4-text-box.selected, .v4-text-shape.selected { border-color: transparent !important; outline: 2px solid var(--v4-primary) !important; box-shadow: none; z-index: 10001; }

/* Premium Pin Marker Styling */
.pin-marker {
    position: absolute !important;
    width: 20px !important;
    height: 20px !important;
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    color: #ffffff !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 1.5px solid #ffffff !important;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4) !important;
    font-family: inherit !important;
    font-weight: 500 !important;
    font-size: 12px !important;
    line-height: 1 !important;
    z-index: 1000 !important;
    cursor: grab !important;
    box-sizing: border-box !important;
}
.pin-marker .pin-number-badge {
    color: #ffffff !important;
    font-weight: 500 !important;
    font-size: 12px !important;
    font-family: inherit !important;
    line-height: 1 !important;
}
.pin-marker.selected {
    outline: none !important;
    box-shadow: 0 0 0 3px #ffffff, 0 0 0 5px #ef4444, 0 4px 14px rgba(239, 68, 68, 0.6) !important;
    z-index: 1001 !important;
}
.pin-marker:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6) !important;
    background: linear-gradient(135deg, #f87171, #ef4444) !important;
}
.pin-marker .lf-drag-handle,
.pin-marker .lf-resizer,
.pin-marker .lf-delete-trigger,
.pin-marker .lf-connector-port,
.pin-marker:hover .lf-drag-handle,
.pin-marker:hover .lf-resizer,
.pin-marker:hover .lf-delete-trigger,
.pin-marker:hover .lf-connector-port,
.pin-marker.selected .lf-drag-handle,
.pin-marker.selected .lf-resizer,
.pin-marker.selected .lf-delete-trigger,
.pin-marker.selected .lf-connector-port {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}
.pin-marker.pin-active-pulse {
    animation: pinActivePulse 1.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    z-index: 1002 !important;
}
@keyframes pinActivePulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8), 0 2px 8px rgba(239, 68, 68, 0.4);
    }
    35% {
        transform: scale(1.35);
        box-shadow: 0 0 0 12px rgba(239, 68, 68, 0), 0 4px 16px rgba(239, 68, 68, 0.7);
    }
    70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 16px rgba(239, 68, 68, 0), 0 2px 8px rgba(239, 68, 68, 0.4);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    }
}

html, body { position: relative !important; min-height: 100vh; margin: 0; padding: 0; overflow: hidden !important; }
/* Force disable transitions during drag for maximum smoothness */
.lf-component.dragging-now, .lf-component.dragging-now * { 
    transition: none !important; 
    pointer-events: none !important;
}

/* Checkbox / Radio Checked & Text Toggle styling */
.v4-checkbox-container[data-checked="false"] svg { display: none !important; }
.v4-radio-container[data-checked="false"] .v4-radio-dot { display: none !important; }
.v4-checkbox-container[data-text-enabled="false"] .v4-checkbox-text { display: none !important; }
.v4-radio-container[data-text-enabled="false"] .v4-radio-text { display: none !important; }
.v4-checkbox-text, .v4-radio-text { color: var(--v4-text-color, #0f172a) !important; font-size: 12px !important; font-weight: 400 !important; font-family: inherit !important; }
.v4-checkbox-container[data-text-enabled="false"], 
.v4-radio-container[data-text-enabled="false"] {
    width: 100% !important;
    height: 100% !important;
}
.v4-checkbox-container[data-text-enabled="false"] .v4-checkbox,
.v4-radio-container[data-text-enabled="false"] .v4-radio {
    width: 100% !important;
    height: 100% !important;
}
.v4-alert-btn.style-primary { background: #4f46e5 !important; border-color: #4f46e5 !important; color: #ffffff !important; font-size: 12px !important; font-weight: 400 !important; font-family: inherit !important; }
.v4-alert-btn.style-normal { background: #ffffff !important; border-color: #cbd5e1 !important; color: var(--v4-text-color, #0f172a) !important; font-size: 12px !important; font-weight: 400 !important; font-family: inherit !important; }
.v4-alert-btn.style-negative { background: #e2e8f0 !important; border-color: #cbd5e1 !important; color: #475569 !important; font-size: 12px !important; font-weight: 400 !important; font-family: inherit !important; }
.v4-alert-desc-badge { font-size: 12px !important; font-weight: 400 !important; font-family: inherit !important; }
.v4-admin-group-header { font-size: 12px !important; font-weight: 400 !important; font-family: inherit !important; }
.v4-admin-label-cell { font-size: 12px !important; font-weight: 400 !important; color: var(--v4-text-color, #0f172a) !important; font-family: inherit !important; }
.v4-dp-preset-btn { font-size: 12px !important; font-weight: 400 !important; font-family: inherit !important; }
.v4-custom-btn {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18) !important;
    transition: all 0.2s ease !important;
    font-size: 12px;
    font-weight: 400 !important;
    font-family: inherit !important;
}
.v4-custom-btn:hover {
    filter: brightness(0.95);
    transform: translateY(-1.2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
}
.v4-custom-btn:active {
    transform: translateY(0.8px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15) !important;
}
.v4-custom-btn.style-primary { background: #4f46e5 !important; border-color: #4f46e5 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35) !important; }
.v4-custom-btn.style-primary:hover { box-shadow: 0 6px 18px rgba(79, 70, 229, 0.5) !important; }
.v4-custom-btn.style-negative { background: #e2e8f0 !important; border-color: #cbd5e1 !important; color: #475569 !important; }
.lf-connector-port {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #00e5ff;
    border: 1.5px solid #ffffff;
    border-radius: 50%;
    z-index: 10003;
    display: none;
    cursor: crosshair;
    box-shadow: 0 0 4px rgba(0,229,255,0.6);
}
body.drawing-line-active .lf-component.near-connector > .lf-connector-port {
    display: block;
}
.lf-component.lf-group > .lf-connector-port,
.lf-component.connector-line > .lf-connector-port {
    display: none !important;
}
.lf-connector-port.port-top { top: -4px; left: 50%; transform: translateX(-50%); }
.lf-connector-port.port-bottom { bottom: -4px; left: 50%; transform: translateX(-50%); }
.lf-connector-port.port-left { left: -4px; top: 50%; transform: translateY(-50%); }
.lf-connector-port.port-right { right: -4px; top: 50%; transform: translateY(-50%); }
.lf-component.connector-line.selected {
    outline: none !important;
}
.lf-component.connector-line.selected path:nth-of-type(2) {
    stroke: #3b82f6 !important;
    filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.8));
}
.v4-shape-text-content p, .v4-shape-text-overlay p {
    margin: 0 !important;
    padding: 0 !important;
}

/* 100% High-Contrast Chrome Web Browser Vertical Scrollbars for PC & Mobile Frames */
.pc-content-area,
.mobile-content,
.chrome-content-area {
    overflow-y: scroll !important;
    overflow-x: hidden !important;
    scrollbar-gutter: stable;
    isolation: isolate;
}
.pc-content-area::-webkit-scrollbar,
.mobile-content::-webkit-scrollbar,
.chrome-content-area::-webkit-scrollbar {
    width: 12px !important;
    height: 12px !important;
    display: block !important;
}
.pc-content-area::-webkit-scrollbar-track,
.mobile-content::-webkit-scrollbar-track,
.chrome-content-area::-webkit-scrollbar-track {
    background: #edf2f7 !important;
    border-left: 1.6px solid #cbd5e1 !important;
    display: block !important;
}
.pc-content-area::-webkit-scrollbar-thumb,
.mobile-content::-webkit-scrollbar-thumb,
.chrome-content-area::-webkit-scrollbar-thumb {
    background: #94a3b8 !important;
    border-radius: 6px !important;
    border: 2px solid #edf2f7 !important;
    min-height: 40px !important;
    display: block !important;
}
.pc-content-area::-webkit-scrollbar-thumb:hover,
.mobile-content::-webkit-scrollbar-thumb:hover,
.chrome-content-area::-webkit-scrollbar-thumb:hover {
    background: #64748b !important;
}
.pc-content-area::-webkit-scrollbar-thumb:active,
.mobile-content::-webkit-scrollbar-thumb:active,
.chrome-content-area::-webkit-scrollbar-thumb:active {
    background: #475569 !important;
}

/* Active Frame Highlight (Unified 2px Cyan Aqua Line) */
.pc-browser-frame,
.mobile-frame,
.mobile-browser-frame {
    transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}
.pc-browser-frame.active-frame,
.mobile-frame.active-frame,
.mobile-browser-frame.active-frame {
    border: 1.6px solid #00e5ff !important;
    box-shadow: 0 0 0 0.8px rgba(0, 229, 255, 0.8), 0 20px 40px rgba(0, 0, 0, 0.25) !important;
}
.pc-column.active-column .frame-label-bar,
.mobile-column.active-column .frame-label-bar {
    border-color: rgba(0, 229, 255, 0.5) !important;
}
`;
