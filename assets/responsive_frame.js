/**
 * assets/responsive_frame.js
 * Scoped Frame Styles for Responsive PC & Mobile Screens
 * Injected dynamically only into responsive templates/screens to avoid global style pollution.
 */
window.responsiveFrameStyles = `
:root {
    --v4-primary: #6366f1;
    --v4-accent: #00e5ff;
    --v4-bg: #1e293b;
    --v4-frame-bg: #ffffff;
    --v4-text: #0f172a;
    --v4-subtext: #475569;
    --v4-border-color: #cbd5e1;
    --v4-header-bg: #f8fafc;
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
    width: 1440px;
    height: 900px;
    position: relative;
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 0 16px;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    height: 36px;
    background: #141720;
    border: 1.6px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: #f1f5f9;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif;
    font-size: 12px;
    box-sizing: border-box;
    margin-bottom: 10px;
    user-select: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-label-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f1f5f9;
    font-family: inherit;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-title-input {
    background: transparent;
    border: 1.2px solid transparent;
    border-radius: 5px;
    color: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    padding: 2px 6px;
    width: 180px;
    outline: none;
    letter-spacing: -0.2px;
    transition: all 0.2s;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-title-input:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
}

.frame-title-input:focus {
    border-color: var(--v4-accent);
    background: rgba(15, 23, 42, 0.9);
    box-shadow: 0 0 6px rgba(0, 229, 255, 0.25);
}

.frame-label-height-control {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 500;
    font-family: inherit;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-label-input {
    width: 54px;
    height: 22px;
    border-radius: 5px;
    border: 1.2px solid rgba(0, 229, 255, 0.35);
    background: #0f131a;
    color: #38bdf8;
    font-size: 11px;
    font-weight: 600;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, monospace;
    text-align: center;
    outline: none;
    padding: 0;
    transition: all 0.2s;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.frame-label-input:focus {
    border-color: var(--v4-accent);
    box-shadow: 0 0 6px rgba(0, 229, 255, 0.3);
}

/* --- Scrollable Content Containers --- */
.pc-content-area, .mobile-content {
    overflow-y: scroll !important;
    overflow-x: hidden !important;
    scrollbar-gutter: stable;
    scroll-behavior: smooth;
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

/* --- Active Frame Selection Highlights --- */
.pc-browser-frame, .mobile-frame, .mobile-browser-frame {
    transition: border 0.2s ease, border-color 0.2s ease !important;
}

.pc-browser-frame.active-frame, .mobile-frame.active-frame, .mobile-browser-frame.active-frame {
    border: 2px solid #00e5ff !important;
}

.pc-column.active-column .frame-label-bar, .mobile-column.active-column .frame-label-bar {
    border-color: rgba(0, 229, 255, 0.5) !important;
}

/* --- Grid Paper Canvas Inner Layers --- */
.pc-content-inner {
    width: 1000px;
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

/* --- PC Browser Frame --- */
.pc-browser-frame {
    width: 1012px;
    height: 810px;
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
    width: 1012px;
    height: 772px;
    position: relative;
}

/* --- Mobile Browser Frame --- */
.mobile-frame {
    width: 382px;
    height: 810px;
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
    height: 772px;
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

/* --- Standard Component Absolute Position --- */
.lf-component {
    position: absolute !important;
    box-sizing: border-box !important;
    z-index: 500;
}
`;
