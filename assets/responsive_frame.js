/**
 * assets/responsive_frame.js
 * Scoped Frame Styles for Responsive PC & Mobile Screens
 * Injected dynamically only into responsive templates/screens to avoid global style pollution.
 */
window.responsiveFrameStyles = `
:root {
    --v4-primary: #6e56cf;
    --v4-accent: #7c66dc;
    --v4-bg: #1e293b;
    --v4-frame-bg: #ffffff;
    --v4-text: #0f172a;
    --v4-subtext: #475569;
    --v4-border-color: #cbd5e1;
    --v4-header-bg: #f8fafc;
    --v4-label-text: #94a3b8;
    --v4-label-title: #cbd5e1;
    --v4-label-active: #a78bfa;
    --v4-label-hover-bg: rgba(255, 255, 255, 0.06);
    --v4-label-input-bg: rgba(15, 23, 42, 0.55);
    --v4-label-input-border: rgba(255, 255, 255, 0.14);
    --v4-label-input-text: #e2e8f0;
}

html[data-shell-theme="light"] {
    --v4-border-color: #bcc4d4;
    --v4-label-text: #475569;
    --v4-label-title: #334155;
    --v4-label-active: #5b46c6;
    --v4-label-hover-bg: rgba(15, 23, 42, 0.06);
    --v4-label-input-bg: #ffffff;
    --v4-label-input-border: #c5cddb;
    --v4-label-input-text: #0f172a;
}

html {
    background: transparent !important;
}

body {
    margin: 0;
    padding: 0;
    background: transparent !important;
    font-family: 'Inter', 'Noto Sans KR', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
    color: var(--v4-text);
}

.page {
    width: 1600px;
    height: 900px;
    position: relative;
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 0 11px;
    box-sizing: border-box;
}

/* --- Frame Column Layout & External Header Label Bars --- */
.frame-column {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: relative;
}

.frame-label-bar {
    position: relative;
    z-index: 350000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    height: 26px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--v4-label-title);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Pretendard Variable', sans-serif;
    font-size: 11.5px;
    box-sizing: border-box;
    margin-bottom: 6px;
    user-select: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-label-title {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--v4-label-title);
    font-family: inherit;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-label-title .material-icons-outlined,
.frame-label-title svg {
    font-size: 14px !important;
    color: var(--v4-label-text) !important;
}

.frame-title-input {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    color: var(--v4-label-title);
    font-size: 11.5px;
    font-weight: 600;
    font-family: inherit;
    padding: 1px 5px;
    width: 170px;
    outline: none;
    letter-spacing: -0.015em;
    transition: all 0.16s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-title-input:hover {
    background: var(--v4-label-hover-bg);
}

.frame-title-input:focus {
    border-color: var(--v4-accent);
    background: var(--v4-label-input-bg);
    color: var(--v4-label-input-text);
    box-shadow: 0 0 0 2px rgba(124, 102, 220, 0.2);
}

.frame-label-height-control {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--v4-label-text);
    font-size: 10.5px;
    font-weight: 500;
    font-family: inherit;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-label-input {
    width: 44px;
    height: 20px;
    border-radius: 5px;
    border: 1px solid var(--v4-label-input-border);
    background: var(--v4-label-input-bg);
    color: var(--v4-label-input-text);
    font-size: 10.5px;
    font-weight: 600;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, monospace;
    text-align: center;
    outline: none;
    padding: 0 3px;
    box-sizing: border-box;
    -moz-appearance: textfield;
    appearance: textfield;
    transition: all 0.16s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-label-input::-webkit-outer-spin-button,
.frame-label-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.frame-label-input:focus {
    border-color: var(--v4-accent);
    box-shadow: 0 0 0 2px rgba(124, 102, 220, 0.22);
}

/* --- Scrollable Content Containers --- */
.pc-content-area, .mobile-content {
    overflow-y: scroll !important;
    overflow-x: hidden !important;
    scrollbar-gutter: stable;
    isolation: isolate;
}

.pc-content-area::-webkit-scrollbar, .mobile-content::-webkit-scrollbar {
    width: 12px !important;
    height: 12px !important;
    display: block !important;
}

.pc-content-area::-webkit-scrollbar-track, .mobile-content::-webkit-scrollbar-track {
    background: #edf2f7 !important;
    border-left: 1.6px solid #cbd5e1 !important;
    display: block !important;
}

.pc-content-area::-webkit-scrollbar-thumb, .mobile-content::-webkit-scrollbar-thumb {
    background: #94a3b8 !important;
    border-radius: 6px !important;
    border: 2px solid #edf2f7 !important;
    min-height: 40px !important;
    display: block !important;
}

.pc-content-area::-webkit-scrollbar-thumb:hover, .mobile-content::-webkit-scrollbar-thumb:hover {
    background: #64748b !important;
}

.pc-content-area::-webkit-scrollbar-thumb:active, .mobile-content::-webkit-scrollbar-thumb:active {
    background: #475569 !important;
}

/* --- Active Frame Selection Highlights (Zero-Shift Figma Studio Ring) --- */
.pc-browser-frame, .mobile-frame, .mobile-browser-frame {
    transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}

.pc-browser-frame.active-frame, .mobile-frame.active-frame, .mobile-browser-frame.active-frame {
    border: 1.6px solid var(--v4-accent) !important;
    box-shadow: 0 0 0 1px rgba(124, 102, 220, 0.38), 0 18px 36px rgba(15, 23, 42, 0.16) !important;
}

.pc-column.active-column .frame-title-input,
.mobile-column.active-column .frame-title-input,
.pc-column.active-column .frame-label-title .material-icons-outlined,
.mobile-column.active-column .frame-label-title .material-icons-outlined {
    color: var(--v4-label-active) !important;
}

/* --- Grid Paper Canvas Inner Layers --- */
.pc-content-inner {
    width: 1160px;
    min-height: calc(100% + 2px);
    position: relative;
    background-color: #ffffff;
    background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    box-sizing: border-box;
}

.mobile-content-inner {
    width: 360px;
    min-height: calc(100% + 2px);
    position: relative;
    background-color: #ffffff;
    background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    box-sizing: border-box;
}

body.hide-frame-grid .pc-content-inner,
body.hide-frame-grid .mobile-content-inner,
.pc-content-inner.hide-grid,
.mobile-content-inner.hide-grid {
    background-image: none !important;
}

/* --- PC Browser Frame --- */
.pc-browser-frame {
    width: 1172px;
    height: 848px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    border: 1.6px solid var(--v4-border-color) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
    overflow: hidden !important;
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    z-index: 1;
}

.pc-browser-header {
    height: 38px;
    background: var(--v4-header-bg);
    padding: 0 16px;
    display: flex;
    align-items: center;
    border-bottom: 1.6px solid var(--v4-border-color) !important;
    user-select: none;
    box-sizing: border-box;
    flex-shrink: 0;
    z-index: 100;
}

.pc-browser-top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.pc-browser-dots {
    display: flex;
    gap: 8px;
}

.pc-browser-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
}

.pc-browser-dot.red { background: #ff5f56; }
.pc-browser-dot.yellow { background: #ffbd2e; }
.pc-browser-dot.green { background: #27c93f; }

.pc-browser-tabs {
    display: flex;
    align-items: flex-end;
    margin-left: 8px;
}

.pc-browser-tab {
    background: #ffffff;
    border-radius: 8px 8px 0 0;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 600;
    color: var(--v4-subtext);
    display: flex;
    align-items: center;
    gap: 8px;
    height: 30px;
    border: 1.6px solid var(--v4-border-color);
    border-bottom: none;
    box-sizing: border-box;
}

.pc-content-area {
    width: 1172px;
    height: 810px;
    position: relative;
}

/* --- Mobile Browser Frame --- */
.mobile-frame {
    width: 382px;
    height: 848px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    border-radius: 28px;
    position: relative;
    border: 1.6px solid var(--v4-border-color) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
    overflow: hidden !important;
    box-sizing: border-box;
    flex-shrink: 0;
    z-index: 1;
}

.mobile-top-bar {
    height: 38px;
    background: var(--v4-header-bg);
    border-bottom: 1.6px solid var(--v4-border-color) !important;
    position: relative;
    user-select: none;
    box-sizing: border-box;
    flex-shrink: 0;
    z-index: 100;
}

.mobile-header-notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 110px;
    height: 20px;
    background: #1e293b;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    z-index: 1000;
    pointer-events: none;
}

.mobile-statusbar {
    position: absolute;
    top: 10px;
    left: 16px;
    right: 16px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--v4-subtext);
    font-size: 11px;
    font-weight: 700;
    z-index: 1001;
    pointer-events: none;
    white-space: nowrap;
}

.mobile-content {
    width: 372px;
    height: 810px;
    position: absolute;
    top: 38px;
    left: 5px;
    border: none !important;
    border-radius: 0 0 12px 12px;
}

.mobile-home-indicator {
    position: absolute;
    bottom: 6px;
    left: 50%;
    width: 120px;
    height: 4px;
    border-radius: 999px;
    background: #94a3b8;
    transform: translateX(-50%);
    z-index: 1001;
    pointer-events: none;
}

/* --- Full-Width Admin PC Screen Layout (.full-pc-page) --- */
.page.full-pc-page {
    padding: 0 14px !important;
    gap: 0 !important;
    justify-content: center !important;
}

.full-pc-page .pc-column,
.pc-column.full-width {
    width: 1572px !important;
}

.full-pc-page .pc-browser-frame,
.pc-browser-frame.full-width {
    width: 1572px !important;
}

.full-pc-page .pc-browser-header {
    width: 1572px !important;
}

.full-pc-page .pc-content-area {
    width: 1572px !important;
}

.full-pc-page .pc-content-inner {
    width: 1560px !important;
}

/* --- Standard Component Absolute Position --- */
.bychoi-component {
    position: absolute !important;
    box-sizing: border-box !important;
    z-index: 500;
}

/* --- Dual Mobile Compare Screen Layout (.mobile-compare-page) --- */
.page.mobile-compare-page {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 48px !important;
    padding: 0 40px !important;
    box-sizing: border-box !important;
}

.mobile-compare-page .frame-column.mobile-column {
    width: 382px !important;
    flex-shrink: 0 !important;
}

.flow-arrow-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 80px;
    flex-shrink: 0;
    user-select: none;
    z-index: 10;
}

.flow-arrow-badge {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--v4-label-input-bg);
    border: 1.6px solid var(--v4-accent, #7c66dc);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--v4-label-active, #7c66dc);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.flow-arrow-badge:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 16px rgba(124, 102, 220, 0.25);
}

.flow-arrow-badge .flow-arrow-icon {
    font-size: 22px;
    transition: transform 0.3s ease;
}

.flow-arrow-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.6px;
    color: var(--v4-label-active, #7c66dc);
    text-transform: uppercase;
    background: rgba(124, 102, 220, 0.12);
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid rgba(124, 102, 220, 0.28);
}

/* --- Base Canvas Guide Layer & Components --- */
svg.canvas-guide-layer {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 300000;
    overflow: visible;
}

.page > .bychoi-component {
    z-index: 500;
}

/* Tier 6: Dedicated Pin Layer */
.v4-pin-layer {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    pointer-events: none !important;
    z-index: 250000 !important;
}

.v4-pin-layer > .pin-marker,
.v4-pin-layer > .text-marker {
    pointer-events: auto !important;
}

/* Universal Pin & Text Marker Layering (Tier 6: 200,000+) */
.pin-marker,
.bychoi-component.pin-marker,
.text-marker,
.bychoi-component.text-marker,
.pc-content-inner > .bychoi-component.pin-marker,
.mobile-content-inner > .bychoi-component.pin-marker,
.page > .bychoi-component.pin-marker {
    z-index: 200000 !important;
    pointer-events: auto !important;
}

.pin-marker.selected,
.bychoi-component.pin-marker.selected,
.text-marker.selected,
.bychoi-component.text-marker.selected {
    z-index: 200005 !important;
}

.pin-marker:hover,
.bychoi-component.pin-marker:hover,
.text-marker:hover,
.bychoi-component.text-marker:hover {
    z-index: 200005 !important;
}

.pin-marker[data-scroll-fixed],
.bychoi-component.pin-marker[data-scroll-fixed],
.text-marker[data-scroll-fixed],
.bychoi-component.text-marker[data-scroll-fixed] {
    z-index: 200050 !important;
}

.pin-marker[data-scroll-fixed].selected,
.bychoi-component.pin-marker[data-scroll-fixed].selected,
.text-marker[data-scroll-fixed].selected,
.bychoi-component.text-marker[data-scroll-fixed].selected {
    z-index: 200055 !important;
}

.pin-marker[data-scroll-fixed]:hover,
.bychoi-component.pin-marker[data-scroll-fixed]:hover,
.text-marker[data-scroll-fixed]:hover,
.bychoi-component.text-marker[data-scroll-fixed]:hover {
    z-index: 200055 !important;
}
`;

