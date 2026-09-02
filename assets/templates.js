/**
 * bychoi workspace - Embedded Templates (COMPLETE BUNDLE)
 * This file contains the HTML structure of all templates to ensure 
 * they can be loaded reliably under file:// protocol without fetch/CORS restrictions.
 */

window.LF_TEMPLATES = window.LF_TEMPLATES || {};
window.PROJECT_METADATA_STORE = window.PROJECT_METADATA_STORE || {};
window.PROJECT_SCREEN_STORE = window.PROJECT_SCREEN_STORE || {};

window.GLOBAL_COMPONENTS_STORE = [];

window.PROJECT_METADATA_STORE['p_331wr'] = {
  "title": "상품 상세 - 리뉴얼 2차",
  "screenOrder": [
    "00_Cover_63.html",
    "08_Responsive_PC_Mobile_486.html",
    "99_Blank_120.html"
  ],
  "screens": {
    "00_Cover_63.html": {
      "title": "00_Cover_63",
      "type": "cover",
      "updatedAt": "2026-08-27T05:45:44.238Z",
      "template": "template_cover.html",
      "version": 0.1,
      "description": [],
      "connectors": []
    },
    "08_Responsive_PC_Mobile_486.html": {
      "title": "08_Responsive_PC_Mobile_486",
      "type": "screen",
      "updatedAt": "2026-08-31T03:28:55.775Z",
      "template": "template_responsive_pc_mobile.html",
      "version": 0.1,
      "description": [],
      "connectors": []
    },
    "99_Blank_120.html": {
      "title": "99_Blank_120",
      "type": "etc",
      "updatedAt": "2026-08-31T03:26:33.000Z",
      "template": "template_blank.html",
      "version": 0.1,
      "description": [],
      "connectors": []
    }
  },
  "assignee": "최범열",
  "developer": "",
  "period": "2026.08.27(목) ~ 2026.09.11(금)",
  "themeIndex": -1,
  "jira": "",
  "updated": "2026-08-31 12:28:55"
}
;

window.LF_TEMPLATES['history_modal.html'] = `<div id="history-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 17, 21, 0.7); backdrop-filter: blur(8px); z-index: 10005; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
    <div class="dialog-card" style="max-width: 560px; width: 92%; max-height: 80vh; display: flex; flex-direction: column; background: rgba(30, 41, 59, 0.95); border: 1.6px solid rgba(255, 255, 255, 0.12); border-radius: 16px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); padding: 24px; box-sizing: border-box; backdrop-filter: blur(20px);">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 18px; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 10px; color: var(--accent-nav, #22d3ee);">
                <span class="material-icons-outlined" style="font-size: 22px;">history</span>
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.2px;">프로젝트 재개정 이력</h3>
            </div>
            <button id="btn-close-history" class="btn-secondary" style="width: 32px; height: 32px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); cursor: pointer; color: #cbd5e1; transition: all 0.2s; margin-left: auto;"><span class="material-icons-outlined" style="font-size: 18px;">close</span></button>
        </div>
        <div id="history-popup-list" style="flex: 1; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 12px; min-height: 140px;">
            <!-- Dynamic history entries here -->
        </div>
    </div>
</div>
`;
window.LF_TEMPLATES['template_blank.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Blank Screen - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #6366f1;
            --v4-accent: #00e5ff;
            --v4-bg: #1e293b;
            --v4-surface: #f8f9fa;
            --v4-border: #e1e3e5;
            --v4-text: #1a1c1e;
        }
        body { 
            margin: 0; padding: 0; 
            font-family: 'Inter', 'Noto Sans KR', sans-serif; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; background: var(--v4-bg); 
            overflow: hidden; color: var(--v4-text);
        }
        .page { 
            width: 1440px; height: 900px; 
            position: relative; 
            background: #ffffff;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.02) 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.03) 0%, transparent 50%);
            box-shadow: 0 40px 100px rgba(0,0,0,0.05);
            overflow: hidden;
        }
    </style>
    <style id="v4-inlined-style">
        /* Dynamic component styles will be injected here */
    </style>
</head>
<body>
    <div class="page" id="canvas">
        <!-- Blank Canvas -->
    </div>
    <script id="v4-inlined-script">
        /* Dynamic scripts will be injected here */
    </script>
</body>
</html>`;
window.LF_TEMPLATES['template_cover.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Cover - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #1a1a1a;
            --v4-accent: #e60012;
            --v4-bg: #ffffff;
            --v4-surface: #f8f9fa;
            --v4-border: #e1e3e5;
            --v4-text: #1a1c1e;
            --v4-text-sub: #6d7175;
            --v4-text-main: #1a1c1e; /* Ensure dark text on light background */
        }
        body { 
            margin: 0; padding: 0; 
            font-family: 'Inter', sans-serif; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; background: var(--v4-surface); 
            overflow: hidden; color: var(--v4-text);
        }
        .page { 
            width: 1440px; height: 900px; 
            position: relative; 
            background: #ffffff;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(230, 0, 18, 0.03) 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.04) 0%, transparent 50%);
            box-shadow: 0 40px 100px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        
        /* V4 Component Base Styles */
        .lf-component { position: absolute !important; box-sizing: border-box !important; transition: outline 0.1s; z-index: 500; }
        .lf-component:hover { outline: 2px solid var(--v4-accent) !important; cursor: move !important; }
        .lf-component.selected { outline: 2px solid var(--v4-accent) !important; z-index: 10001 !important; }
        
        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: var(--v4-accent); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; z-index: 100; opacity: 0; transition: opacity 0.2s; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; }
        
        .v4-card {
            background: #fff;
            border: 1px solid var(--v4-border);
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .logo-area { display: flex; align-items: center; gap: 14px; }
        .logo-img { height: 32px; width: auto; object-fit: contain; }
        .logo-text { font-size: 18px; font-weight: 800; color: var(--v4-text); letter-spacing: -0.5px; }
        .logo-sub { font-size: 13px; font-weight: 500; color: var(--v4-text-sub); margin-left: 4px; }

        .v4-editable-cell { outline: none; transition: background 0.2s; }
        .v4-editable-cell:focus { background: #f0f1f2; border-radius: 4px; }

        /* Isolated Table Styling for Cover - Avoids V4 Global Conflicts */
        .cover-info-premium-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #ffffff !important; }
        .cover-info-premium-table th { background: #f4f6f8; text-align: left; padding: 12px 20px; border-bottom: 2px solid #c0c4c9; color: #6d7175; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .cover-info-premium-table td { padding: 14px 20px; border-bottom: 1px solid #c0c4c9; background: #fff; line-height: 1.5; color: #1a1c1e !important; font-size: 14px; }
        .cover-info-premium-table tr:last-child td { border-bottom: none; }
        
        .accent-bar { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: var(--v4-accent); }
        
        /* FORCE VISIBILITY & CONTRAST */
        #cover-info-table, 
        #cover-info-table table,
        #cover-info-table td, 
        #cover-info-table th,
        #cover-info-table .v4-editable-cell {
            visibility: visible !important;
            opacity: 1 !important;
            color: #1a1c1e !important;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="accent-bar"></div>

        <!-- Static Header (Non-editable branding) -->
        <div style="position: absolute; top: 60px; left: 80px;">
            <div class="logo-area">
                <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-img">
                    <rect x="15" y="22" width="55" height="14" rx="7" fill="#1a1a1a" />
                    <rect x="25" y="43" width="55" height="14" rx="7" fill="#1a1a1a" opacity="0.7" />
                    <rect x="35" y="64" width="55" height="14" rx="7" fill="#1a1a1a" opacity="0.4" />
                </svg>
                <div style="width: 1px; height: 24px; background: #ddd; margin: 0 4px;"></div>
                <div class="logo-text">bychoi workspace <span class="logo-sub" style="margin-left: 4px;">Design System</span></div>
            </div>
        </div>

        <!-- Editable Main Title - Balanced Typography -->
        <div id="cover-title" class="lf-component" style="top: 220px; left: 80px; min-width: 800px;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div class="lf-delete-trigger">×</div>
            <div id="cover-project-title" contenteditable="true" class="v4-editable-cell" style="font-size: 48px; font-weight: 900; line-height: 1.15; letter-spacing: -2px; color: var(--v4-text); margin-bottom: 28px;">{{PROJECT_NAME}}</div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 40px; height: 3px; background: var(--v4-accent);"></div>
                <div contenteditable="true" class="v4-editable-cell" style="font-size: 18px; color: var(--v4-text-sub); font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Technical Design Specification</div>
            </div>
        </div>

        <!-- Editable Version Info - Clean Badges -->
        <div id="cover-version" class="lf-component" style="top: 500px; left: 80px;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div class="lf-delete-trigger">×</div>
            <div style="display: flex; align-items: center; gap: 24px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 12px; font-weight: 800; color: var(--v4-text-sub);">DOCUMENT VERSION</span>
                    <div id="cover-version-val" contenteditable="true" class="v4-editable-cell" style="font-size: 22px; font-weight: 800; color: var(--v4-accent);">v{{VERSION}}</div>
                </div>
                <div style="width: 1px; height: 40px; background: var(--v4-border);"></div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 12px; font-weight: 800; color: var(--v4-text-sub);">JIRA IDENTIFIER</span>
                    <div id="cover-jira-id" contenteditable="true" class="v4-editable-cell" style="font-size: 22px; font-weight: 800; color: var(--v4-text);">{{JIRA}}</div>
                </div>
            </div>
        </div>

        <!-- Editable Project Info Table - High Legibility -->
        <div id="cover-info-table" class="lf-component v4-card" style="bottom: 80px; right: 80px; width: 540px; padding: 0; overflow: hidden;">
            <div class="lf-drag-handle"><span class="material-icons-outlined" style="font-size:14px;">drag_indicator</span></div>
            <div class="lf-delete-trigger">×</div>
            <table class="cover-info-premium-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Information Entity</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight: 600; color: #6d7175;">Lead Designer / Author</td>
                        <td id="cover-author" contenteditable="true" class="v4-editable-cell" style="font-weight: 700; color: #1a1c1e !important;">{{AUTHOR}}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: #6d7175;">Publication Date</td>
                        <td id="cover-date" contenteditable="true" class="v4-editable-cell" style="font-weight: 700; color: #1a1c1e !important;">{{DATE}}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: #6d7175;">System Context</td>
                        <td contenteditable="true" class="v4-editable-cell" style="color: #1a1c1e !important;">bychoi workspace</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</body>
</html>`;
window.LF_TEMPLATES['template_mobile_ui_1.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Mobile UI (1) - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #6366f1;
            --v4-accent: #00e5ff;
            --v4-bg: #1e293b;
            --v4-frame-bg: #ffffff;
            --v4-text: #f8fafc;
        }
        body {
            margin: 0; padding: 0;
            background: var(--v4-bg);
            font-family: 'Inter', 'Noto Sans KR', sans-serif;
            display: flex; justify-content: center; align-items: center;
            height: 100vh; overflow: hidden;
            background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .page {
            width: 1440px; height: 900px;
            position: relative;
            display: flex; justify-content: center; align-items: center;
            gap: 60px;
        }

        /* Mobile Frame Styling */
        .mobile-frame {
            width: 375px; height: 838px;
            background: var(--v4-frame-bg);
            border-radius: 40px;
            position: relative;
            box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px #111;
            overflow: hidden;
            border: 4px solid #334155;
        }
        .mobile-header-notch {
            position: absolute; top: 0; left: 50%; transform: translateX(-50%);
            width: 150px; height: 30px; background: #111;
            border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;
            z-index: 1000;
        }
        .mobile-content {
            width: 360px; height: 800px;
            position: absolute;
            top: 30px; left: 7.5px;
            background-image:
                linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
            overflow-y: scroll !important;
            overflow-x: hidden !important;
            scrollbar-gutter: stable;
            scroll-behavior: smooth;
            border: none !important;
            box-sizing: border-box;
        }
        .mobile-content::-webkit-scrollbar {
            width: 12px;
        }
        .mobile-content::-webkit-scrollbar-track {
            background: #f1f3f4;
            border-left: 1px solid #dadce0;
        }
        .mobile-content::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 6px;
            border: 2px solid #f1f3f4;
        }
        .mobile-content::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        .mobile-content::-webkit-scrollbar-thumb:active {
            background: #787878;
        }
        .mobile-statusbar { position: absolute; top: 10px; left: 24px; right: 24px; height: 20px; display: flex; align-items: center; justify-content: space-between; color: #111827; font-size: 12px; font-weight: 800; z-index: 1001; pointer-events: none; white-space: nowrap; }
        .mobile-home-indicator { position: absolute; bottom: 8px; left: 50%; width: 132px; height: 5px; border-radius: 999px; background: #111827; transform: translateX(-50%); z-index: 1001; pointer-events: none; }
        .mobile-ui-header, .mobile-ui-card, .mobile-ui-nav, .mobile-ui-list { width: 100%; height: 100%; box-sizing: border-box; color: #0f172a; font-family: 'Inter', 'Noto Sans KR', sans-serif; }
        .mobile-ui-header { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: #fff; border-bottom: 1px solid #e5e7eb; }
        .mobile-ui-card { padding: 18px; border-radius: 22px; background: linear-gradient(135deg, #111827, #334155); color: #fff; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18); }
        .mobile-ui-list { padding: 16px; border-radius: 18px; background: #f8fafc; border: 1px solid #e5e7eb; }
        .mobile-ui-nav { display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; padding: 8px 14px 14px; background: #fff; border-top: 1px solid #e5e7eb; }
        .mobile-ui-nav div { text-align: center; font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; }

        /* V4 Component Base Styles */
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
        .lf-component:hover { outline: 2px dashed var(--v4-primary) !important; cursor: pointer !important; }
        .lf-component.selected { outline: 2px solid var(--v4-primary) !important; z-index: 10001 !important; }

        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: var(--v4-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; z-index: 100; opacity: 0; transition: opacity 0.2s; border: 2px solid #fff; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; }
        .lf-resizer { position: absolute; bottom: -6px; right: -6px; width: 12px; height: 12px; background: var(--v4-primary); cursor: nwse-resize; border-radius: 2px; border: 2px solid #fff; opacity: 0; z-index: 100; }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
        .lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 101; font-weight: bold; }
        .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }

        /* Typography & Tables */
        .v4-editable-cell { outline: none; }
        .v4-editable-cell:focus { background: rgba(99, 102, 241, 0.05); }

        /* Text Marker Integration */
        .text-marker { 
            position: absolute; padding: 2px 6px; border-radius: 4px; 
            border: 1.6px solid transparent; font-size: 14px; line-height: 1.2; 
            white-space: normal; cursor: grab; pointer-events: auto; z-index: 1000; 
            transform: translate(-50%, -50%); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            min-width: unset; background: transparent; 
            box-shadow: none;
            color: #1e293b;
        }
        .text-marker:hover { border-color: var(--v4-primary); background: transparent; transform: translate(-50%, -50%); box-shadow: none; }
        .text-marker.selected { border-color: var(--v4-primary); outline: 2px solid var(--v4-primary); box-shadow: none; z-index: 1001; }
        .text-marker .lf-drag-handle { top: -14px; left: 50%; transform: translateX(-50%); }
        .text-marker .lf-delete-trigger { top: -14px; right: -14px; }
    </style>
</head>
<body>
    <div class="page">
        <!-- Screen 1 -->
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G 100%</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content">
            </div>
        </div>
    </div>
</body>
</html>`;
window.LF_TEMPLATES['template_mobile_ui_2.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Mobile UI (2) - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg: #1e293b; --v4-frame-bg: #ffffff; }
        body { margin: 0; padding: 0; background: var(--v4-bg); font-family: 'Inter', 'Noto Sans KR', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; }
        .page { width: 1440px; height: 900px; position: relative; display: flex; justify-content: center; align-items: center; gap: 80px; }
        .mobile-frame { width: 375px; height: 838px; background: var(--v4-frame-bg); border-radius: 40px; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px #111; overflow: hidden; border: 4px solid #334155; z-index: 10; }
        .mobile-header-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; background: #111; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; z-index: 1000; }
        .mobile-content { width: 360px; height: 800px; position: absolute; top: 30px; left: 7.5px; background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 20px 20px; overflow-y: scroll !important; overflow-x: hidden !important; scrollbar-gutter: stable; scroll-behavior: smooth; border: none !important; box-sizing: border-box; }
        .mobile-content::-webkit-scrollbar { width: 12px; }
        .mobile-content::-webkit-scrollbar-track { background: #f1f3f4; border-left: 1px solid #dadce0; }
        .mobile-content::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 6px; border: 2px solid #f1f3f4; }
        .mobile-content::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        .mobile-content::-webkit-scrollbar-thumb:active { background: #787878; }
        .mobile-statusbar { position: absolute; top: 10px; left: 24px; right: 24px; height: 20px; display: flex; align-items: center; justify-content: space-between; color: #111827; font-size: 12px; font-weight: 800; z-index: 1001; pointer-events: none; white-space: nowrap; }
        .mobile-home-indicator { position: absolute; bottom: 8px; left: 50%; width: 132px; height: 5px; border-radius: 999px; background: #111827; transform: translateX(-50%); z-index: 1001; pointer-events: none; }
        .mobile-ui-header, .mobile-ui-card, .mobile-ui-nav, .mobile-ui-list { width: 100%; height: 100%; box-sizing: border-box; color: #0f172a; font-family: 'Inter', 'Noto Sans KR', sans-serif; }
        .mobile-ui-header { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: #fff; border-bottom: 1px solid #e5e7eb; }
        .mobile-ui-card { padding: 18px; border-radius: 22px; background: linear-gradient(135deg, #111827, #334155); color: #fff; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18); }
        .mobile-ui-list { padding: 16px; border-radius: 18px; background: #f8fafc; border: 1px solid #e5e7eb; }
        .mobile-ui-nav { display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; padding: 8px 14px 14px; background: #fff; border-top: 1px solid #e5e7eb; }
        .mobile-ui-nav div { text-align: center; font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; }
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
        .lf-component:hover { outline: 2px dashed var(--v4-primary) !important; cursor: pointer !important; }
        .lf-component.selected { outline: 2px solid var(--v4-primary) !important; z-index: 10001 !important; }
        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: var(--v4-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; z-index: 100; opacity: 0; transition: opacity 0.2s; border: 2px solid #fff; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; }
        .lf-resizer { position: absolute; bottom: -6px; right: -6px; width: 12px; height: 12px; background: var(--v4-primary); cursor: nwse-resize; border-radius: 2px; border: 2px solid #fff; opacity: 0; z-index: 100; }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
        .lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 101; font-weight: bold; }
        .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
        .v4-editable-cell { outline: none; }
        .v4-editable-cell:focus { background: rgba(99, 102, 241, 0.05); }

        /* Text Marker Integration */
        .text-marker { 
            position: absolute; padding: 2px 6px; border-radius: 4px; 
            border: 1.6px solid transparent; font-size: 14px; line-height: 1.2; 
            white-space: normal; cursor: grab; pointer-events: auto; z-index: 1000; 
            transform: translate(-50%, -50%); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            min-width: unset; background: transparent; 
            box-shadow: none;
            color: #1e293b;
        }
        .text-marker:hover { border-color: var(--v4-primary); background: transparent; transform: translate(-50%, -50%); box-shadow: none; }
        .text-marker.selected { border-color: var(--v4-primary); outline: 2px solid var(--v4-primary); box-shadow: none; z-index: 1001; }
        .text-marker .lf-drag-handle { top: -14px; left: 50%; transform: translateX(-50%); }
        .text-marker .lf-delete-trigger { top: -14px; right: -14px; }
    </style>
</head>
<body>
    <div class="page">
        <!-- Screen 1 -->
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G 100%</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content">
            </div>
        </div>
        <!-- Screen 2 -->
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G 100%</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content">
            </div>
        </div>
    </div>
</body>
</html>`;
window.LF_TEMPLATES['template_mobile_ui_3.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Mobile UI (3) - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg: #1e293b; --v4-frame-bg: #ffffff; }
        body { margin: 0; padding: 0; background: var(--v4-bg); font-family: 'Inter', 'Noto Sans KR', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; }
        .page { width: 1440px; height: 900px; position: relative; display: flex; justify-content: center; align-items: center; gap: 40px; }
        .mobile-frame { width: 375px; height: 838px; background: var(--v4-frame-bg); border-radius: 40px; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px #111; overflow: hidden; border: 4px solid #334155; z-index: 10; }
        .mobile-header-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; background: #111; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; z-index: 1000; }
        .mobile-content { width: 360px; height: 800px; position: absolute; top: 30px; left: 7.5px; background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 20px 20px; overflow-y: scroll !important; overflow-x: hidden !important; scrollbar-gutter: stable; scroll-behavior: smooth; border: none !important; box-sizing: border-box; }
        .mobile-content::-webkit-scrollbar { width: 12px; }
        .mobile-content::-webkit-scrollbar-track { background: #f1f3f4; border-left: 1px solid #dadce0; }
        .mobile-content::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 6px; border: 2px solid #f1f3f4; }
        .mobile-content::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        .mobile-content::-webkit-scrollbar-thumb:active { background: #787878; }
        .mobile-statusbar { position: absolute; top: 10px; left: 24px; right: 24px; height: 20px; display: flex; align-items: center; justify-content: space-between; color: #111827; font-size: 12px; font-weight: 800; z-index: 1001; pointer-events: none; white-space: nowrap; }
        .mobile-home-indicator { position: absolute; bottom: 8px; left: 50%; width: 132px; height: 5px; border-radius: 999px; background: #111827; transform: translateX(-50%); z-index: 1001; pointer-events: none; }
        .mobile-ui-header, .mobile-ui-card, .mobile-ui-nav, .mobile-ui-list { width: 100%; height: 100%; box-sizing: border-box; color: #0f172a; font-family: 'Inter', 'Noto Sans KR', sans-serif; }
        .mobile-ui-header { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: #fff; border-bottom: 1px solid #e5e7eb; }
        .mobile-ui-card { padding: 18px; border-radius: 22px; background: linear-gradient(135deg, #111827, #334155); color: #fff; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18); }
        .mobile-ui-list { padding: 16px; border-radius: 18px; background: #f8fafc; border: 1px solid #e5e7eb; }
        .mobile-ui-nav { display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; padding: 8px 14px 14px; background: #fff; border-top: 1px solid #e5e7eb; }
        .mobile-ui-nav div { text-align: center; font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; }
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
        .lf-component:hover { outline: 2px dashed var(--v4-primary) !important; cursor: pointer !important; }
        .lf-component.selected { outline: 2px solid var(--v4-primary) !important; z-index: 10001 !important; }
        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: var(--v4-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; z-index: 100; opacity: 0; transition: opacity 0.2s; border: 2px solid #fff; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; }
        .lf-resizer { position: absolute; bottom: -6px; right: -6px; width: 12px; height: 12px; background: var(--v4-primary); cursor: nwse-resize; border-radius: 2px; border: 2px solid #fff; opacity: 0; z-index: 100; }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
        .lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 101; font-weight: bold; }
        .lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: flex; }
        .v4-editable-cell { outline: none; }
        .v4-editable-cell:focus { background: rgba(99, 102, 241, 0.05); }

        /* Text Marker Integration */
        .text-marker { 
            position: absolute; padding: 2px 6px; border-radius: 4px; 
            border: 1.6px solid transparent; font-size: 14px; line-height: 1.2; 
            white-space: normal; cursor: grab; pointer-events: auto; z-index: 1000; 
            transform: translate(-50%, -50%); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            min-width: unset; background: transparent; 
            box-shadow: none;
            color: #1e293b;
        }
        .text-marker:hover { border-color: var(--v4-primary); background: transparent; transform: translate(-50%, -50%); box-shadow: none; }
        .text-marker.selected { border-color: var(--v4-primary); outline: 2px solid var(--v4-primary); box-shadow: none; z-index: 1001; }
        .text-marker .lf-drag-handle { top: -14px; left: 50%; transform: translateX(-50%); }
        .text-marker .lf-delete-trigger { top: -14px; right: -14px; }
    </style>
</head>
<body>
    <div class="page">
        <!-- Screen 1 -->
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content">
            </div>
        </div>
        <!-- Screen 2 -->
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content">
            </div>
        </div>
        <!-- Screen 3 -->
        <div class="mobile-frame">
            <div class="mobile-statusbar"><span>9:41</span><span>5G</span></div>
            <div class="mobile-header-notch"></div>
            <div class="mobile-content">
            </div>
        </div>
    </div>
</body>
</html>`;
window.LF_TEMPLATES['template_onesphere.html'] = `<!DOCTYPE html>
<html lang="ko"><head>
    <meta charset="UTF-8">
    <title>Admin Onesphere - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Noto+Sans+KR:wght@400;500;700;900&amp;display=swap" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #6366f1;
            --v4-accent: #00e5ff;
            --v4-bg: #1e293b;
            --v4-surface: #f8f9fa;
            --v4-border: #e1e3e5;
            --v4-text: #1a1c1e;
        }
        body { 
            margin: 0; padding: 0; 
            font-family: 'Inter', 'Noto Sans KR', sans-serif; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; background: var(--v4-bg); 
            overflow: hidden; color: var(--v4-text);
        }
        .page { 
            width: 1440px; height: 900px; 
            position: relative; 
            background: #ffffff;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.02) 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.03) 0%, transparent 50%);
            box-shadow: 0 40px 100px rgba(0,0,0,0.05);
            overflow: hidden;
        }
    </style>
    <style id="v4-inlined-style">

:root { --v4-primary: #6366f1; --v4-accent: #00e5ff; --v4-bg-dark: #0f172a; --v4-panel-bg: rgba(30, 41, 59, 0.7); --v4-border: rgba(255, 255, 255, 0.15); --v4-text-main: #ffffff; --v4-text-dim: #94a3b8; }
body, .lf-component { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
.v4-editable-cell, [contenteditable="true"] { -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; user-select: text; }
.lf-component { 
    position: absolute; cursor: pointer; transition: outline 0.2s; 
    box-sizing: border-box; z-index: 100;
    transform: none !important; /* Kill legacy centering drift */
}
.lf-component.selected { outline: 2px solid #6366f1; }
.lf-component.lf-group.selected { outline: 2px solid #10b981 !important; }
.lf-component.lf-group.selected > .lf-drag-handle { background: #10b981 !important; }
.lf-component.lf-group.selected > .lf-resizer { background: #10b981 !important; }
.lf-component .lf-component .lf-drag-handle, 
.lf-component .lf-component .lf-resizer, 
.lf-component .lf-component .lf-delete-trigger,
.lf-in-group .lf-drag-handle,
.lf-in-group .lf-resizer,
.lf-in-group .lf-delete-trigger { display: none !important; }
.lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; opacity: 0; transition: all 0.2s; border: 2px solid #fff; z-index: 10002; }
.lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; top: -16px; left: -16px; }
.lf-resizer { position: absolute; bottom: -5px; right: -5px; width: 12px; height: 12px; background: #6366f1; cursor: nwse-resize; border-radius: 50%; border: 2px solid #fff; opacity: 0; transition: 0.2s; z-index: 10002; }
.lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
.lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none !important; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 10002; font-size: 14px; font-weight: bold; }
.lf-component:hover .lf-delete-trigger, .lf-component.selected .lf-delete-trigger { display: none !important; }
.v4-premium-table { table-layout: fixed; border-collapse: collapse; border: 1.6px solid #cbd5e1 !important; font-family: 'Inter', sans-serif; }
.v4-premium-table th { padding: 14px 16px; text-align: left; border: 1.6px solid #cbd5e1 !important; font-weight: 700; white-space: nowrap; }
.v4-premium-table td { padding: 14px 16px; border: 1.6px solid #cbd5e1 !important; }
.v4-shape { position: relative; border-width: 1.6px !important; border-style: solid !important; border-color: rgb(200, 200, 200); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgb(255, 255, 255); color: #0f172a; }
.v4-editable-cell:focus { outline: 2px solid #6366f1; background: rgba(99, 102, 241, 0.05) !important; }
.v4-editable-cell p { margin: 0 !important; padding: 0 !important; }
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
.lf-rv-my { background-position: 100% 0% !important; }
.v4-logo-img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; display: block; }
img.lf-icon { width: 100%; height: 100%; padding: 8px; box-sizing: border-box; object-fit: contain; }
.v4-shape-rect { border-radius: 8px; }
.v4-shape-circle { border-radius: 50%; }
.v4-shape-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); border: none !important; }
.v4-shape-diamond { border: none !important; }
.v4-shape-wave { border: none !important; }
.v4-shape-pattern-grid { 
    background-color: #ffffff !important; 
    background-image: 
        linear-gradient(45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)), 
        linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.08) 75%, rgba(0, 0, 0, 0.08)) !important; 
    background-size: 12px 12px !important; 
    border-radius: 0 !important; 
}
/* Reset background for new SVG/Custom atoms to prevent sprite leakage */
svg.lf-icon, div.v4-checkbox.lf-icon, div.v4-radio.lf-icon { background-image: none !important; }
.v4-searchbar-text:empty::before {
    content: attr(data-placeholder);
    color: #94a3b8 !important;
    pointer-events: none;
    display: block;
}
.v4-stepper-container[data-disabled="true"] .v4-stepper-control { background-color: #e5e7eb !important; border-color: #9ca3af !important; }
.v4-stepper-container[data-disabled="true"] .v4-stepper-value { color: #9ca3af !important; }
.v4-stepper-container[data-disabled="true"] .v4-stepper-dec, .v4-stepper-container[data-disabled="true"] .v4-stepper-inc { background-color: #e5e7eb !important; color: #9ca3af !important; }
.v4-stepper-container[data-disabled="true"] .v4-stepper-action { background-color: #e5e7eb !important; border-color: #9ca3af !important; color: #9ca3af !important; box-shadow: none !important; }
.v4-selectbox-container[data-dropdown-active="true"] .v4-selectbox-header { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }
.v4-selectbox-container[data-dropdown-active="true"] svg { transform: rotate(180deg); }
.v4-selectbox-option:hover { background-color: #f3f4f6 !important; cursor: pointer; }
.v4-selectbox-option:last-child { border-bottom: none !important; }
.v4-fileupload-container[data-selected="true"] .v4-fileupload-delete { display: block !important; }
.v4-fileupload-delete:hover { color: #ef4444 !important; }
.v4-fileupload-button:hover { background-color: #f9fafb !important; border-color: #babcbe !important; }

/* Text Marker Integration - Unified px Top-Left (same as shapes/atoms) */
.text-marker, .v4-text-box, .v4-text-shape { 
    position: absolute; padding: 0 !important; border-radius: 4px; 
    border: 1.6px solid transparent; font-size: 14px; line-height: 1.2; 
    white-space: normal; cursor: grab; pointer-events: auto; z-index: 100; 
    transition: box-shadow 0.2s, border-color 0.2s, background 0.2s, outline 0.2s;
    min-width: unset; min-height: unset; background: transparent; 
    box-shadow: none; box-sizing: border-box;
    color: #1e293b; text-align: left;
    width: auto;
}
.text-marker .v4-editable-cell, .v4-text-box .v4-editable-cell, .v4-text-shape .v4-editable-cell { padding: 4px !important; margin: 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: inherit; box-sizing: border-box !important; line-height: 1 !important; width: 100% !important; height: 100% !important; }
.text-marker .v4-editable-cell p, .v4-text-box .v4-editable-cell p, .v4-text-shape .v4-editable-cell p { margin: 0 !important; padding: 0 !important; line-height: 1.2 !important; display: block !important; transform: translateY(var(--v4-text-adjust-y, 0px)) !important; }
.text-marker:hover, .v4-text-box:hover, .v4-text-shape:hover { border-color: var(--v4-primary); background: transparent; box-shadow: none; }
.text-marker.selected, .v4-text-box.selected, .v4-text-shape.selected { border-color: var(--v4-primary); outline: 2px solid var(--v4-primary); box-shadow: none; z-index: 10001; }

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

body { position: relative !important; min-height: 100vh; margin: 0; padding: 0; }
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
.v4-checkbox-text, .v4-radio-text { color: #000000 !important; font-size: 12px !important; }
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
.v4-alert-btn.style-primary { background: #4f46e5 !important; border-color: #4f46e5 !important; color: #ffffff !important; }
.v4-alert-btn.style-normal { background: #ffffff !important; border-color: #cbd5e1 !important; color: #1f2937 !important; }
.v4-alert-btn.style-negative { background: #e2e8f0 !important; border-color: #cbd5e1 !important; color: #475569 !important; }
.v4-custom-btn {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18) !important;
    transition: all 0.2s ease !important;
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
.v4-custom-btn.style-normal { background: #ffffff !important; border-color: rgb(150, 150, 150) !important; color: #1f2937 !important; font-weight: normal !important; }
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
.v4-shape-text-content, .v4-shape-text-overlay, .v4-shape .v4-editable-cell { padding: 5px 10px !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; box-sizing: border-box !important; flex-direction: column !important; }
.v4-shape-rect > .v4-editable-cell, .v4-shape-circle > .v4-editable-cell, .v4-shape-pattern-grid > .v4-editable-cell, .v4-shape-wave > .v4-editable-cell { width: 100% !important; height: 100% !important; }
.v4-shape-diamond > .v4-editable-cell { width: 60% !important; height: 60% !important; }
.v4-shape-arrow > .v4-editable-cell { width: 50% !important; height: 40% !important; }
.v4-shape-triangle > .v4-editable-cell { width: 100% !important; height: 60% !important; }
.v4-shape-text-content p, .v4-shape-text-overlay p, .v4-shape .v4-editable-cell p { margin: 0 !important; padding: 0 !important; line-height: 1 !important; text-align: inherit !important; display: block !important; transform: translateY(var(--v4-text-adjust-y, 0px)) !important; }
.v4-shape-text-content span, .v4-shape-text-overlay span, .v4-shape .v4-editable-cell span { line-height: 1 !important; display: inline-block !important; }
/* Unify Grid UI Table Cell Typography and Colors */
.v4-grid-container td.v4-grid-cell {
    font-size: 12px !important;
    font-family: 'Inter', sans-serif !important;
    color: #334155 !important;
    font-weight: 400 !important;
}
.v4-grid-container th.v4-grid-cell {
    font-size: 12px !important;
    font-family: 'Inter', sans-serif !important;
    color: #334155 !important;
    font-weight: 600 !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 10 !important;
    background: #f8fafc !important;
}

</style>
</head>
<body>
    <div class="page" id="canvas">
        <!-- Blank Canvas -->
    </div>
    


<div id="v4-comp-1783056572791317" class="lf-component v4-text-box" style="position: absolute; top: 95px; left: 230px; z-index: 1000; transform: none; width: 91px; height: 21px; min-width: unset !important; min-height: unset !important;"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #000000); padding: 0px 4px 2px !important; display: block; text-align: left; width: 100%; height: 100%;"><p>{{SCREEN_NAME}} Overview</p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1783056578075" class="lf-component lf-group" style="position: absolute; top: 0px; left: 0px; z-index: 1000; transform: none; width: 210px; height: 900px;"><div class="lf-component" style="position: absolute; top: 0px; left: 0px; z-index: 1000; transform: none; width: 200px; height: 900px; border-color: transparent;" data-resized="true" id="v4-comp-1783056578109-2">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(0, 0, 0); border: 1.6px solid transparent; border-radius: 0px; display: flex; align-items: center; justify-content: center; color: rgb(15, 23, 42); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><br></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component text-marker" style="position: absolute; top: 20px; left: 29.5px; z-index: 1000; transform: none; width: 103px; height: 21px; min-width: unset !important; min-height: unset !important;" id="v4-pin-0"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: rgb(0, 0, 0); padding: 0px 4px 2px !important; display: block; text-align: left; width: 100%; height: 100%;"><p><span style="font-size: 18px; color: rgb(255, 255, 255);">LF Onesphere</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 72px; left: 20px; z-index: 1000; transform: none; width: 160px; height: 30px;" data-resized="true" id="v4-comp-1783056578109-4">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(50, 50, 50); border: 1.6px solid transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: rgb(15, 23, 42); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><span style="color: rgb(255, 255, 255); font-size: 12px;">모든 메뉴 보기</span></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 122px; left: 19.5px; z-index: 1000; transform: none; width: 80px; height: 30px;" data-resized="true" id="v4-comp-1783056578109-5">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(0, 0, 0); border: 1.6px solid transparent; border-radius: 0px; display: flex; align-items: center; justify-content: center; color: rgb(15, 23, 42); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><strong style="font-size: 12px; color: rgb(255, 255, 255);">전체 메뉴</strong></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 122px; left: 99.5px; z-index: 1000; transform: none; width: 80px; height: 30px;" id="v4-comp-1783056578109-6">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(0, 0, 0); border: 1.6px solid transparent; border-radius: 0px; display: flex; align-items: center; justify-content: center; color: rgb(15, 23, 42); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><span style="font-size: 12px; color: rgb(187, 187, 187);">즐겨찾기</span></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 152px; left: 19.5px; z-index: 1000; transform: none; width: 160px; height: 1px;" data-resized="true" id="v4-comp-1783056578109-7">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(255, 255, 255); border: 1.6px solid transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: rgb(15, 23, 42); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><br></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 151px; left: 19.5px; z-index: 1000; transform: none; width: 80px; height: 2px;" data-resized="true" id="v4-comp-1783056578109-8">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(255, 255, 255); border: 1.6px solid transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: rgb(15, 23, 42); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><br></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 400px; left: 199px; z-index: 1000; transform: none; width: 10px; height: 100px;" data-resized="true" id="v4-comp-1783056578109-9">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(0, 0, 0); border: 1.6px solid transparent; border-radius: 0px; display: flex; align-items: center; justify-content: center; color: rgb(15, 23, 42); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><br></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 445px; left: 195px; z-index: 1000; transform: none; width: 15px; height: 15px;" data-resized="true" id="v4-comp-1783056578109-10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; color: rgb(255, 255, 255); stroke: rgb(255, 255, 255);"><polyline points="15 18 9 12 15 6"></polyline></svg><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 173px; left: 10px; z-index: 1000; transform: none; width: 180px; height: 600px; background: rgb(0, 0, 0); border-color: transparent;" id="v4-comp-1783056578109-11"><div class="v4-accordion-container" data-expanded="true" data-sub-count="3" style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgb(0, 0, 0); border: 1.6px solid transparent; border-radius: 8px; overflow: hidden; box-sizing: border-box;" data-events-bound="true" data-depth-type="2depth" data-hierarchy="[{&quot;text&quot;:&quot;카드 관리&quot;,&quot;children&quot;:[]},{&quot;text&quot;:&quot;화면 관리&quot;},{&quot;text&quot;:&quot;전시 메뉴&quot;},{&quot;text&quot;:&quot;가변탭 스케줄 관리&quot;,&quot;children&quot;:[]},{&quot;text&quot;:&quot;배너 관리&quot;,&quot;children&quot;:[]},{&quot;text&quot;:&quot;LIVE 관리&quot;,&quot;children&quot;:[]},{&quot;text&quot;:&quot;앱 스플래시 관리&quot;,&quot;children&quot;:[]},{&quot;text&quot;:&quot;서비스 페이지&quot;,&quot;children&quot;:[{&quot;text&quot;:&quot;출석체크 관리&quot;,&quot;active&quot;:false},{&quot;text&quot;:&quot;출석체크 (아울렛) 관리&quot;,&quot;active&quot;:false},{&quot;text&quot;:&quot;소문내기 관리&quot;,&quot;active&quot;:false},{&quot;text&quot;:&quot;통합 결제 카드 관리&quot;,&quot;active&quot;:false},{&quot;text&quot;:&quot;친구초대 관리&quot;,&quot;active&quot;:false},{&quot;text&quot;:&quot;앱푸시 수신 동의 관리&quot;,&quot;active&quot;:false},{&quot;text&quot;:&quot;결제혜택 관리&quot;,&quot;active&quot;:true}]}]"><div class="v4-accordion-header" style="height:36px; padding:0 12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:rgba(255, 255, 255, 0.05); user-select:none; border-bottom:1.6px solid rgba(255,255,255,0.1); box-sizing:border-box; width:100%; flex-shrink:0;"><span class="v4-accordion-title-text" style="color:#ffffff; font-size:12px; font-weight:700; font-family:'Inter',sans-serif; pointer-events:none;">전시관리</span><span class="v4-accordion-chevron" style="color: rgb(255, 255, 255); font-size: 10px; pointer-events: none; transition: transform 0.2s; transform: rotate(180deg);">▼</span></div><div class="v4-accordion-body" style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; background: rgba(0, 0, 0, 0.15);"><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">카드 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">화면 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">전시 메뉴</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">가변탭 스케줄 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">배너 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">LIVE 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">앱 스플래시 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">서비스 페이지</span><span class="tier-arrow" style="width: 6px; height: 6px; border-right: 1.6px solid rgb(148, 163, 184); border-bottom: 1.6px solid rgb(148, 163, 184); transform: rotate(45deg); transition: transform 0.2s; margin-right: 8px; display: inline-block; flex-shrink: 0;"></span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"><div class="v4-accordion-tier2-wrapper" style="display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255, 255, 255, 0.02);"><div class="v4-accordion-tier2-header" style="padding: 8px 12px 8px 24px; font-size: 11px; color: rgb(226, 232, 240); display: flex; align-items: center; cursor: pointer; height: 36px; box-sizing: border-box;"><input type="radio" name="accordion-select-lf-comp-1782795663556" class="v4-accordion-radio" style="margin-right: 8px; accent-color: rgb(0, 229, 255); cursor: pointer;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">출석체크 관리</span></div></div><div class="v4-accordion-tier2-wrapper" style="display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255, 255, 255, 0.02);"><div class="v4-accordion-tier2-header" style="padding: 8px 12px 8px 24px; font-size: 11px; color: rgb(226, 232, 240); display: flex; align-items: center; cursor: pointer; height: 36px; box-sizing: border-box;"><input type="radio" name="accordion-select-lf-comp-1782795663556" class="v4-accordion-radio" style="margin-right: 8px; accent-color: rgb(0, 229, 255); cursor: pointer;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">출석체크 (아울렛) 관리</span></div></div><div class="v4-accordion-tier2-wrapper" style="display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255, 255, 255, 0.02);"><div class="v4-accordion-tier2-header" style="padding: 8px 12px 8px 24px; font-size: 11px; color: rgb(226, 232, 240); display: flex; align-items: center; cursor: pointer; height: 36px; box-sizing: border-box;"><input type="radio" name="accordion-select-lf-comp-1782795663556" class="v4-accordion-radio" style="margin-right: 8px; accent-color: rgb(0, 229, 255); cursor: pointer;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">소문내기 관리</span></div></div><div class="v4-accordion-tier2-wrapper" style="display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255, 255, 255, 0.02);"><div class="v4-accordion-tier2-header" style="padding: 8px 12px 8px 24px; font-size: 11px; color: rgb(226, 232, 240); display: flex; align-items: center; cursor: pointer; height: 36px; box-sizing: border-box;"><input type="radio" name="accordion-select-lf-comp-1782795663556" class="v4-accordion-radio" style="margin-right: 8px; accent-color: rgb(0, 229, 255); cursor: pointer;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">통합 결제 카드 관리</span></div></div><div class="v4-accordion-tier2-wrapper" style="display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255, 255, 255, 0.02);"><div class="v4-accordion-tier2-header" style="padding: 8px 12px 8px 24px; font-size: 11px; color: rgb(226, 232, 240); display: flex; align-items: center; cursor: pointer; height: 36px; box-sizing: border-box;"><input type="radio" name="accordion-select-lf-comp-1782795663556" class="v4-accordion-radio" style="margin-right: 8px; accent-color: rgb(0, 229, 255); cursor: pointer;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">친구초대 관리</span></div></div><div class="v4-accordion-tier2-wrapper" style="display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255, 255, 255, 0.02);"><div class="v4-accordion-tier2-header" style="padding: 8px 12px 8px 24px; font-size: 11px; color: rgb(226, 232, 240); display: flex; align-items: center; cursor: pointer; height: 36px; box-sizing: border-box;"><input type="radio" name="accordion-select-lf-comp-1782795663556" class="v4-accordion-radio" style="margin-right: 8px; accent-color: rgb(0, 229, 255); cursor: pointer;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">앱푸시 수신 동의 관리</span></div></div><div class="v4-accordion-tier2-wrapper" style="display: flex; flex-direction: column; border-bottom: 1.6px solid rgba(255, 255, 255, 0.02);"><div class="v4-accordion-tier2-header" style="padding: 8px 12px 8px 24px; font-size: 11px; color: rgb(226, 232, 240); display: flex; align-items: center; cursor: pointer; height: 36px; box-sizing: border-box;"><input type="radio" name="accordion-select-lf-comp-1782795663556" class="v4-accordion-radio" checked="true" style="margin-right: 8px; accent-color: rgb(0, 229, 255); cursor: pointer;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%; text-decoration: underline;">결제혜택 관리</span></div></div></div></div></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 789px; left: 10px; z-index: 1000; transform: none; width: 180px; height: 111px; background: rgb(0, 0, 0); border-color: transparent;" id="v4-comp-1783056578109-12"><div class="v4-accordion-container" data-expanded="true" data-sub-count="3" style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgb(0, 0, 0); border: 1.6px solid transparent; border-radius: 8px; overflow: hidden; box-sizing: border-box;" data-events-bound="true" data-depth-type="2depth" data-hierarchy="[{&quot;text&quot;:&quot;권한 관리&quot;,&quot;active&quot;:false,&quot;children&quot;:[]},{&quot;text&quot;:&quot;리소스 관리&quot;,&quot;active&quot;:false}]"><div class="v4-accordion-header" style="height:36px; padding:0 12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:rgba(255, 255, 255, 0.05); user-select:none; border-bottom:1.6px solid rgba(255,255,255,0.1); box-sizing:border-box; width:100%; flex-shrink:0;"><span class="v4-accordion-title-text" style="color:#ffffff; font-size:12px; font-weight:700; font-family:'Inter',sans-serif; pointer-events:none;">시스템 관리</span><span class="v4-accordion-chevron" style="color: rgb(255, 255, 255); font-size: 10px; pointer-events: none; transition: transform 0.2s; transform: rotate(180deg);">▼</span></div><div class="v4-accordion-body" style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; background: rgba(0, 0, 0, 0.15);"><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">권한 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div><div class="v4-accordion-tier1-group" style="border-bottom: 1.6px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;"><div class="v4-accordion-tier1-header" style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: rgb(255, 255, 255); display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255, 255, 255, 0.02); height: 36px; box-sizing: border-box;"><span class="v4-editable-cell" contenteditable="true" style="outline: none; flex: 1 1 0%;">리소스 관리</span></div><div class="v4-accordion-tier1-body" style="display: flex; flex-direction: column; transition: 0.2s; overflow: hidden;"></div></div></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div></div>
<div id="v4-comp-1783056651639729" class="lf-component" style="position: absolute; top: 145px; left: 230px; z-index: 1000; transform: none; width: 1180px; height: 80px;">
            <div class="v4-admin-settings-container" data-row-count="2" data-row-height="40" data-row1-label="기간" data-row1-cols="1" data-row1-type="textbox" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background: #ffffff; border: 1.6px solid rgb(226, 232, 240); border-radius: 8px; font-family: inherit; display: flex; flex-direction: column; overflow: hidden; pointer-events: auto;" data-row2-label="항목명, 상태" data-row2-cols="2" data-row2-type="textbox">
                <div class="v4-admin-settings-table" style="display: flex; flex-direction: column; width: 100%; height: 100%;"><div class="v4-admin-row" style="display: flex; width: 100%; border-bottom: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; height: 40px;"><div class="v4-admin-label-cell" style="width: 140px; background: rgb(241, 245, 249); display: flex; align-items: center; padding: 0px 16px; font-size: 12px; font-weight: 600; color: rgb(51, 65, 85); border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; flex-shrink: 0;">기간</div><div class="v4-admin-content-cell" style="flex: 1 1 0%; display: flex; align-items: center; padding: 0px 16px; box-sizing: border-box;"></div></div><div class="v4-admin-row" style="display: flex; width: 100%; border-bottom-width: medium; border-bottom-style: none; border-bottom-color: currentcolor; box-sizing: border-box; height: 40px;"><div class="v4-admin-label-cell" style="width: 140px; background: rgb(241, 245, 249); display: flex; align-items: center; padding: 0px 16px; font-size: 12px; font-weight: 600; color: rgb(51, 65, 85); border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; flex-shrink: 0;">항목명</div><div class="v4-admin-content-cell" style="flex: 1 0 0%; display: flex; align-items: center; padding: 0px 16px; box-sizing: border-box; border-right: 1.6px solid rgb(226, 232, 240); width: 30%;"></div><div class="v4-admin-label-cell" style="width: 140px; background: rgb(241, 245, 249); display: flex; align-items: center; padding: 0px 16px; font-size: 12px; font-weight: 600; color: rgb(51, 65, 85); border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; flex-shrink: 0;">상태</div><div class="v4-admin-content-cell" style="flex: 1 1 0%; display: flex; align-items: center; padding: 0px 16px; box-sizing: border-box;"></div></div></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>
<div id="v4-comp-1782799443037" class="lf-component" style="position: absolute; top: 275px; left: 230px; z-index: 1000; transform: none; width: 80px; height: 30px;" data-resized="true">
            <div class="v4-btn-container" data-text="조건저장" data-btn-style="normal" data-btn-radius="6" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
                <button class="v4-custom-btn style-normal" style="width: 100%; height: 100%; border-radius: 6px; background: var(--v4-component-bg, #ffffff); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 5px; box-sizing: border-box; transition: 0.2s; font-family: inherit; border-top-color:  !important; border-style: solid !important; border-width: 1.6px !important; border-right-color:  !important; border-bottom-color:  !important; border-left-color:  !important; border-image-source:  !important; border-image-slice:  !important; border-image-width:  !important; border-image-outset:  !important; border-image-repeat:  !important;">조건저장</button>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1782801419266381" class="lf-component" style="position: absolute; top: 275px; left: 780px; z-index: 1000; transform: none; width: 80px; height: 30px;" data-resized="true">
            <div class="v4-btn-container" data-text="초기화" data-btn-style="normal" data-btn-radius="6" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
                <button class="v4-custom-btn style-normal" style="width: 100%; height: 100%; border-radius: 6px; background: var(--v4-component-bg, #ffffff); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 5px; box-sizing: border-box; transition: 0.2s; font-family: inherit; border-top-color:  !important; border-style: solid !important; border-width: 1.6px !important; border-right-color:  !important; border-bottom-color:  !important; border-left-color:  !important; border-image-source:  !important; border-image-slice:  !important; border-image-width:  !important; border-image-outset:  !important; border-image-repeat:  !important;">초기화</button>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1782802131331673" class="lf-component" style="position: absolute; top: 275px; left: 870px; z-index: 1000; transform: none; width: 80px; height: 30px;" data-resized="true">
            <div class="v4-btn-container" data-text="조회" data-btn-style="primary" data-btn-radius="6" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
                <button class="v4-custom-btn style-primary" style="width: 100%; height: 100%; border-radius: 6px; background: var(--v4-component-bg, #ffffff); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 5px; box-sizing: border-box; transition: 0.2s; font-family: inherit; border-top-color:  !important; border-style: solid !important; border-width: 1.6px !important; border-right-color:  !important; border-bottom-color:  !important; border-left-color:  !important; border-image-source:  !important; border-image-slice:  !important; border-image-width:  !important; border-image-outset:  !important; border-image-repeat:  !important;">조회</button>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1782802157558107" class="lf-component" style="position: absolute; top: 275px; left: 1330.1px; z-index: 1000; transform: none; width: 80px; height: 30px;" data-resized="true">
            <div class="v4-btn-container" data-text="신규등록" data-btn-style="custom" data-btn-radius="6" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
                <button class="v4-custom-btn style-custom" style="width: 100%; height: 100%; border-radius: 6px; background: rgb(220, 220, 250); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 5px; box-sizing: border-box; transition: 0.2s; font-family: inherit; border-style: solid !important; border-width: 1.6px !important; border-color: transparent; color: rgb(50, 50, 50);">신규등록</button>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1783056086263536" class="lf-component v4-text-box" style="position: absolute; top: 339.5px; left: 230px; z-index: 1000; transform: none; width: 65px; height: 21px; min-width: unset !important; min-height: unset !important;" data-resized="true"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #000000); padding: 0px 4px 2px !important; display: block; text-align: left; width: 100%; height: 100%;"><p><span style="font-size: 14px;">조회 결과</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1783056137536721" class="lf-component" style="position: absolute; top: 335px; left: 1330.1px; z-index: 1000; transform: none; width: 80px; height: 30px;" data-resized="true">
            <div class="v4-btn-container" data-text="선택삭제" data-btn-style="normal" data-btn-radius="6" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
                <button class="v4-custom-btn style-normal" style="width: 100%; height: 100%; border-radius: 6px; background: var(--v4-component-bg, #ffffff); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 5px; box-sizing: border-box; transition: 0.2s; font-family: inherit; border-top-color:  !important; border-style: solid !important; border-width: 1.6px !important; border-right-color:  !important; border-bottom-color:  !important; border-left-color:  !important; border-image-source:  !important; border-image-slice:  !important; border-image-width:  !important; border-image-outset:  !important; border-image-repeat:  !important;">선택삭제</button>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>

<div id="v4-comp-1783057161873892" class="lf-component" style="position: absolute; top: 375px; left: 230px; z-index: 1000; transform: none; width: 1180px; height: 480px;"><div class="v4-grid-container" data-pagination="true" data-row-count="10" data-columns="[{&quot;name&quot;:&quot;&quot;,&quot;type&quot;:&quot;checkbox&quot;,&quot;width&quot;:&quot;50px&quot;,&quot;options&quot;:&quot;&quot;},{&quot;name&quot;:&quot;번호&quot;,&quot;type&quot;:&quot;number&quot;,&quot;width&quot;:&quot;100px&quot;,&quot;options&quot;:&quot;&quot;},{&quot;name&quot;:&quot;항목명&quot;,&quot;type&quot;:&quot;text&quot;,&quot;width&quot;:&quot;400px&quot;,&quot;options&quot;:&quot;&quot;},{&quot;name&quot;:&quot;전시상태&quot;,&quot;type&quot;:&quot;status&quot;,&quot;width&quot;:&quot;100px&quot;,&quot;options&quot;:&quot;상태1, 상태2, 상태3&quot;},{&quot;name&quot;:&quot;등록/수정자&quot;,&quot;type&quot;:&quot;author&quot;,&quot;width&quot;:&quot;100px&quot;,&quot;options&quot;:&quot;&quot;},{&quot;name&quot;:&quot;등록/수정일시&quot;,&quot;type&quot;:&quot;datetime&quot;,&quot;width&quot;:&quot;200px&quot;,&quot;options&quot;:&quot;&quot;},{&quot;name&quot;:&quot;항목명2&quot;,&quot;type&quot;:&quot;text&quot;,&quot;width&quot;:&quot;250px&quot;,&quot;options&quot;:&quot;&quot;}]" style="width:100%; height:100%; display:flex; flex-direction:column; background:#ffffff; border:1.6px solid rgb(226,232,240); border-radius:8px; overflow:hidden; box-sizing:border-box;"><div class="v4-grid-table-wrapper" style="width:100%; height:calc(100% - 36px); overflow:auto; box-sizing:border-box;"><table style="width: 1200px; table-layout: fixed; border-collapse: collapse; background: rgb(255, 255, 255); box-sizing: border-box; border-width: 1.6px !important;" data-table-selection-bound="true"><colgroup><col style="width: 50px;"><col style="width: 100px;"><col style="width: 400px;"><col style="width: 100px;"><col style="width: 100px;"><col style="width: 200px;"><col style="width: 250px;"></colgroup><thead><tr style="height: 36px; background: rgb(255, 255, 255); border-bottom: 1.6px solid rgb(226, 232, 240); box-sizing: border-box;"><th class="v4-grid-cell v4-grid-check-col" style="display: table-cell; vertical-align: middle; text-align: center; border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; padding: 0px; font-weight: 500; color: rgb(51, 65, 85) !important;" contenteditable="false" data-type="checkbox"><input type="checkbox"></th><th class="v4-grid-cell v4-editable-cell" style="display: table-cell; vertical-align: middle; text-align: left; padding: 0px 8px; border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; font-weight: 500; user-select: none; font-size: 12px !important; color: rgb(51, 65, 85) !important;" contenteditable="true" data-type="number">번호 ⇅</th><th class="v4-grid-cell v4-editable-cell" style="display: table-cell; vertical-align: middle; text-align: left; padding: 0px 8px; border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; font-weight: 500; user-select: none; font-size: 12px !important; color: rgb(51, 65, 85) !important;" contenteditable="true" data-type="text">항목명 ⇅</th><th class="v4-grid-cell v4-editable-cell" style="display: table-cell; vertical-align: middle; text-align: left; padding: 0px 8px; border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; font-weight: 500; user-select: none; font-size: 12px !important; color: rgb(51, 65, 85) !important;" contenteditable="true" data-type="status">전시상태 ⇅</th><th class="v4-grid-cell v4-editable-cell" style="display: table-cell; vertical-align: middle; text-align: left; padding: 0px 8px; box-sizing: border-box; font-weight: 500; user-select: none; border-right: 1.6px solid rgb(226, 232, 240); font-size: 12px !important; color: rgb(51, 65, 85) !important;" contenteditable="true" data-type="author">등록/수정자 ⇅</th><th class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-weight: 500; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px; font-size: 12px !important; color: rgb(51, 65, 85) !important;" data-type="datetime">등록/수정일시 ⇅</th><th class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; font-weight: 500; color: rgb(51, 65, 85) !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">항목명2 ⇅</th></tr></thead><tbody style="box-sizing:border-box;"><tr style="height:36px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;" data-type="checkbox" contenteditable="false"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" style="display: table-cell; vertical-align: middle; text-align: left; padding: 0px 8px; border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; font-size: 12px !important; color: rgb(51, 65, 85) !important;" contenteditable="true" data-type="number">1024</td><td class="v4-grid-cell v4-editable-cell" style="display: table-cell; vertical-align: middle; text-align: left; padding: 0px 8px; border-right: 1.6px solid rgb(226, 232, 240); box-sizing: border-box; font-size: 12px !important; color: rgb(15, 23, 42) !important; font-weight: 500;" contenteditable="true" data-type="text">[기획전] 시즌 맞이 베스트 상품전</td><td class="v4-grid-cell v4-editable-cell" style="display:table-cell; vertical-align:middle; text-align:left; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box;" contenteditable="true" data-type="status"><span style="background:rgba(52,211,153,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태1</span></td><td class="v4-grid-cell v4-editable-cell" style="display: table-cell; vertical-align: middle; text-align: left; padding: 0px 8px; font-size: 12px !important; color: rgb(100, 116, 139) !important; border-right: 1.6px solid rgb(226, 232, 240);" contenteditable="true" data-type="author">홍길동</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-07-01 11:00:00</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1023</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[프리미엄] 단독 브랜드 기획전 쇼</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(251,191,36,0.15); color:#d97706; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태2</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">이영희</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-30 18:30:20</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1022</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[아웃도어] 클리어런스 세일</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(239,68,68,0.1); color:#ef4444; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태3</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">박민수</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-29 14:15:10</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1021</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[질스튜어트] 봄 신상 스니커즈 한정 라이브</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(52,211,153,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태1</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">최질스</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-28 10:00:00</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1020</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[컬렉션] 가을 컬렉션 룩북 공개 생방송</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(251,191,36,0.15); color:#d97706; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태2</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">정수진</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-27 16:45:00</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1019</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[헤지스] 여름 맞이 린넨 셔츠 특가 라이브</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(239,68,68,0.1); color:#ef4444; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태3</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">김엘에프</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-07-01 11:00:00</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1018</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[닥스] 프리미엄 실크 타이 단독 런칭 쇼</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(52,211,153,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태1</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">이닥스</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-30 18:30:20</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1017</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[라푸마] 아웃도어 바람막이 클리어런스 세일</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(251,191,36,0.15); color:#d97706; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태2</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">박라푸마</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-29 14:15:10</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1016</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[질스튜어트] 봄 신상 스니커즈 한정 라이브</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(239,68,68,0.1); color:#ef4444; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태3</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">최질스</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-28 10:00:00</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr><tr style="height: 36px; background: rgb(255, 255, 255); box-sizing: border-box; border-bottom: 1.6px solid rgb(226, 232, 240);"><td class="v4-grid-cell" contenteditable="false" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: center; padding: 0px;" data-type="checkbox"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="number">1015</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">[바네사브루노] 가을 컬렉션 룩북 공개 생방송</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="status"><span style="background:rgba(52,211,153,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600;">상태1</span></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="author">정바네</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="datetime">2026-06-27 16:45:00</td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display: table-cell; vertical-align: middle; box-sizing: border-box; font-size: 12px !important; border-right: 1.6px solid rgb(226, 232, 240); text-align: left; padding: 0px 8px;" data-type="text">직접 입력 가능</td></tr></tbody></table></div><div class="v4-grid-footer" style="height:36px; padding:0 12px; display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border-top:1.6px solid rgb(226,232,240); box-sizing:border-box; width:100%; flex-shrink:0;"><span style="font-size:11px; color:#64748b; font-family:'Inter',sans-serif;">1/27</span><div class="v4-grid-pages" style="font-size:11px; color:#64748b; cursor:pointer; font-family:'Inter',sans-serif;">◀ 1 2 3 4 5 ▶</div><span style="font-size:11px; color:#64748b; font-family:'Inter',sans-serif;">Page Size 100</span></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1783057167326" class="lf-component" style="position: absolute; top: 155.813px; left: 381.6px; z-index: 1000; transform: none; width: 495px; height: 30px;">
            <div class="v4-datepicker-container" data-show-presets="true" data-show-end-date="true" data-default-preset="1M" data-start-date="" data-end-date="" style="position: relative; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; flex-wrap: nowrap; width: 100%; height: 100%;">
                <div class="v4-dp-fields" style="display: inline-flex; align-items: center; gap: 0; border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; background: var(--v4-component-bg, #ffffff); height: 100%; min-height: 30px; overflow: hidden; box-sizing: border-box; flex-shrink: 0;">
                    <div class="v4-dp-input-group" style="display: inline-flex; align-items: center; padding: 0 10px; gap: 6px; height: 100%;">
                        <div class="v4-dp-date-field v4-dp-start v4-editable-cell" contenteditable="true" style="font-size: 13px; color: var(--v4-text-color, #374151); outline: none; white-space: nowrap; min-width: 82px; font-family: inherit; -webkit-user-select: text; user-select: text;">2026/06/03</div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--v4-placeholder-color, #9ca3af)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 15px; height: 15px; flex-shrink: 0; pointer-events: none; background-image: none !important;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div class="v4-dp-separator" style="color: var(--v4-placeholder-color, #9ca3af); font-size: 13px; padding: 0px 2px; flex-shrink: 0; font-family: inherit; display: inline-flex;">-</div>
                    <div class="v4-dp-input-group" style="display: inline-flex; align-items: center; padding: 0 10px; gap: 6px; height: 100%;">
                        <div class="v4-dp-date-field v4-dp-end v4-editable-cell" contenteditable="true" style="font-size: 13px; color: var(--v4-text-color, #374151); outline: none; white-space: nowrap; min-width: 82px; font-family: inherit; -webkit-user-select: text; user-select: text;">2026/07/03</div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--v4-placeholder-color, #9ca3af)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 15px; height: 15px; flex-shrink: 0; pointer-events: none; background-image: none !important;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                </div>
                <div class="v4-dp-presets" style="display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <button class="v4-dp-preset-btn" data-preset="1D" style="height: 30px; min-width: 36px; padding: 0px 10px; border-color: rgb(204, 204, 204); border-top-style: ; border-top-width: ; border-right-style: ; border-right-width: ; border-bottom-style: ; border-bottom-width: ; border-left-style: ; border-left-width: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 8px; background: rgb(255, 255, 255); color: rgb(55, 65, 81); font-size: 12px; font-weight: 600; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: 0.15s; font-family: inherit;">1D</button>
                    <button class="v4-dp-preset-btn" data-preset="1W" style="height: 30px; min-width: 36px; padding: 0px 10px; border-color: rgb(204, 204, 204); border-top-style: ; border-top-width: ; border-right-style: ; border-right-width: ; border-bottom-style: ; border-bottom-width: ; border-left-style: ; border-left-width: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 8px; background: rgb(255, 255, 255); color: rgb(55, 65, 81); font-size: 12px; font-weight: 600; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: 0.15s; font-family: inherit;">1W</button>
                    <button class="v4-dp-preset-btn v4-dp-preset-active" data-preset="1M" style="height: 30px; min-width: 36px; padding: 0px 10px; border-color: rgb(29, 78, 216); border-top-style: ; border-top-width: ; border-right-style: ; border-right-width: ; border-bottom-style: ; border-bottom-width: ; border-left-style: ; border-left-width: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 8px; background: rgb(29, 78, 216); color: rgb(255, 255, 255); font-size: 12px; font-weight: 700; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: 0.15s; font-family: inherit;">1M</button>
                    <button class="v4-dp-preset-btn" data-preset="6M" style="height: 30px; min-width: 36px; padding: 0px 10px; border-color: rgb(204, 204, 204); border-top-style: ; border-top-width: ; border-right-style: ; border-right-width: ; border-bottom-style: ; border-bottom-width: ; border-left-style: ; border-left-width: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 8px; background: rgb(255, 255, 255); color: rgb(55, 65, 81); font-size: 12px; font-weight: 600; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: 0.15s; font-family: inherit;">6M</button>
                    <button class="v4-dp-preset-btn" data-preset="all" style="height: 30px; min-width: 36px; padding: 0px 12px; border-color: rgb(204, 204, 204); border-top-style: ; border-top-width: ; border-right-style: ; border-right-width: ; border-bottom-style: ; border-bottom-width: ; border-left-style: ; border-left-width: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 8px; background: rgb(255, 255, 255); color: rgb(55, 65, 81); font-size: 12px; font-weight: 600; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: 0.15s; font-family: inherit;">전체</button>
                </div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>
<div id="v4-comp-1783057189822" class="lf-component" style="position: absolute; top: 204.213px; left: 381.6px; z-index: 1000; transform: none; width: 300px; height: 30px;" data-resized="true">
            <div class="v4-textbox-container" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: var(--v4-input-bg, #fafaf2); border: 1.6px solid var(--v4-border-color, #cccccc); border-radius: 8px; display: flex; align-items: center; padding: 0 12px; pointer-events: auto;">
                <div class="v4-textbox-placeholder" style="position: absolute; left: 12px; color: var(--v4-placeholder-color, #a3a3a3); pointer-events: none; font-size: 12px; user-select: none; font-family: inherit; display: block;">Placeholder</div>
                <div contenteditable="true" class="v4-editable-cell v4-textbox-input" style="width: 100%; height: 100%; border-width: medium; border-style: none; border-color: currentcolor; border-image: initial; outline: none; background: transparent; color: rgb(163, 163, 163); font-size: 12px; display: flex; align-items: center; white-space: nowrap; overflow: hidden; padding: 8px 48px 8px 0px; box-sizing: border-box; font-family: inherit;" data-events-bound="true"></div>
                <div class="v4-textbox-counter" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--v4-placeholder-color, #a3a3a3); user-select: none; display: block; font-family: inherit;">0/100</div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="lf-comp-1783057204253" class="lf-component" style="position: absolute; top: 203.213px; left: 970.8px; z-index: 1000; transform: none; width: 58px; height: 32px;" data-resized="true"><div class="v4-checkbox-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-checkbox lf-icon" style="width: 20px; height: 20px; background: rgb(50, 50, 50); border: 1.6px solid rgb(255, 255, 255); border-radius: 6px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%; pointer-events:none;"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="v4-checkbox-text v4-editable-cell" contenteditable="true" style="color:#000000; font-size:12px; font-family:'Inter',sans-serif; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">전체</div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1783057224184885" class="lf-component" style="position: absolute; top: 203.213px; left: 1039px; z-index: 1000; transform: none; width: 63px; height: 32px;"><div class="v4-checkbox-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-checkbox lf-icon" style="width: 20px; height: 20px; background: rgb(50, 50, 50); border: 1.6px solid rgb(255, 255, 255); border-radius: 6px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%; pointer-events:none;"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="v4-checkbox-text v4-editable-cell" contenteditable="true" style="color:#000000; font-size:12px; font-family:'Inter',sans-serif; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">상태1</div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1783057235375913" class="lf-component" style="position: absolute; top: 203.213px; left: 1112px; z-index: 1000; transform: none; width: 65px; height: 32px;"><div class="v4-checkbox-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-checkbox lf-icon" style="width: 20px; height: 20px; background: rgb(50, 50, 50); border: 1.6px solid rgb(255, 255, 255); border-radius: 6px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%; pointer-events:none;"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="v4-checkbox-text v4-editable-cell" contenteditable="true" style="color:#000000; font-size:12px; font-family:'Inter',sans-serif; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">상태2</div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1783057246387536" class="lf-component" style="position: absolute; top: 203.213px; left: 1187px; z-index: 1000; transform: none; width: 66px; height: 32px;"><div class="v4-checkbox-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-checkbox lf-icon" style="width: 20px; height: 20px; background: rgb(50, 50, 50); border: 1.6px solid rgb(255, 255, 255); border-radius: 6px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%; pointer-events:none;"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="v4-checkbox-text v4-editable-cell" contenteditable="true" style="color:#000000; font-size:12px; font-family:'Inter',sans-serif; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">상태3</div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>

<div id="v4-comp-1783057573085632" class="lf-component lf-group" style="position: absolute; left: 199px; top: 0px; width: 1241px; height: 50px; background: transparent; border-width: medium; border-style: none; border-color: currentcolor; border-image: initial; z-index: 1000;"><div id="v4-comp-1782784967444" class="lf-component" style="position: absolute; top: 0px; left: 0px; z-index: 1000; transform: none; width: 1240px; height: 50px;" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 0px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;"><div class="v4-shape-text-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; box-sizing: border-box; overflow: hidden;"><p><br></p></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="group-1782785698119" class="lf-component lf-group" style="position: absolute; left: 20px; top: 10px; width: 72px; height: 30px; background: transparent; border-width: medium; border-style: none; border-color: currentcolor; border-image: initial; z-index: 1000;"><div id="lf-comp-1782785013020" class="lf-component" style="position: absolute; top: 0px; left: 0px; z-index: 1000; transform: none; width: 30px; height: 30px; color: rgb(0, 0, 0);" data-resized="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; padding: 8px; box-sizing: border-box; background-image: none !important; color: rgb(50, 50, 50); stroke: rgb(50, 50, 50);"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-text-1782785054824" class="lf-component v4-text-box" style="position: absolute; top: 1px; left: 18px; z-index: 1000; transform: none; width: 54px; height: 28px;"><div class="v4-editable-cell" contenteditable="true" style="outline:none; color:var(--v4-text-color, #000000); padding:2px 4px; display:block; text-align:left;"><p><span style="font-size: 10px;"> Workspace</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div></div><div id="lf-comp-1782785287456" class="lf-component" style="position: absolute; top: 10px; left: 470px; z-index: 1000; transform: none; width: 300px; height: 30px;" data-resized="true"><div class="v4-searchbar-container" data-placeholder="원스피어 통합검색" style="display: flex; align-items: center; justify-content: space-between; width: 100%; height: 100%; background: rgb(255, 255, 255); border: 1.6px solid rgb(200, 200, 200); border-radius: 9999px; padding: 0px 12px 0px 16px; box-sizing: border-box; overflow: hidden; pointer-events: auto;" data-fontsize="12"><div class="v4-searchbar-text v4-editable-cell" contenteditable="true" data-placeholder="원스피어 통합검색" style="flex: 1 1 0%; border-width: medium; border-style: none; border-color: currentcolor; border-image: initial; outline: none; background: transparent; font-size: 12px; color: rgb(0, 0, 0); font-family: Inter, sans-serif; min-width: 0px; padding: 0px; line-height: 1.2; user-select: text; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></div><div class="v4-searchbar-icon-wrap" style="display:flex; align-items:center; justify-content:center; width:20px; height:20px; flex-shrink:0; margin-left:8px; pointer-events:none;"><svg viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%; background-image:none !important;"><circle cx="11" cy="11" r="8" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="group-1782785694665" class="lf-component lf-group" style="position: absolute; left: 102px; top: 10px; width: 93px; height: 30px; background: transparent; border-width: medium; border-style: none; border-color: currentcolor; border-image: initial; z-index: 1000;"><div id="lf-comp-1782785632074" class="lf-component" style="position: absolute; top: 0px; left: 0px; z-index: 1000; transform: none; width: 30px; height: 30px; color: rgb(0, 0, 0);" data-resized="true"><div class="lf-icon lf-icon-my" style="filter: brightness(0);"></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1782785646927409" class="lf-component v4-text-box" style="position: absolute; top: 1px; left: 21px; z-index: 1000; transform: none; width: 72px; height: 28px;"><div class="v4-editable-cell" contenteditable="true" style="outline:none; color:var(--v4-text-color, #000000); padding:2px 4px; display:block; text-align:left;"><p><span style="font-size: 10px;">담당자 확인</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div></div><div id="lf-comp-1782785740843" class="lf-component" style="position: absolute; top: 10px; left: 948px; z-index: 1000; transform: none; width: 30px; height: 30px; color: rgb(0, 0, 0);" data-resized="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; padding: 8px; box-sizing: border-box; color: rgb(50, 50, 50); stroke: rgb(50, 50, 50);"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-text-1782785776532" class="lf-component v4-text-box" style="position: absolute; top: 14.5px; left: 988px; z-index: 1000; transform: none; width: 253px; height: 21px; min-width: unset !important; min-height: unset !important;"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #000000); padding: 0px 4px 2px !important; display: block; text-align: left; width: 100%; height: 100%;"><p><strong style="font-size: 12px;">홍길동</strong><span style="font-size: 12px;"> </span><span style="color: rgb(136, 136, 136); font-size: 12px;">Mall 서비스기획 BSU (admin ID)</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div></div><script id="v4-inlined-script"></script>
</body></html>`;
window.LF_TEMPLATES['template_pc_ui.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>PC UI Chrome - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #6366f1;
            --v4-accent: #00e5ff;
            --v4-bg: #1e293b;
            --v4-text: #f8fafc;
            --v4-border: rgba(255, 255, 255, 0.15);
        }
        body { 
            margin: 0; padding: 0; 
            font-family: 'Inter', 'Noto Sans KR', sans-serif; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; background: var(--v4-bg); 
            overflow: hidden; color: var(--v4-text);
            background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .page { 
            width: 1440px; height: 900px; 
            position: relative; 
            box-shadow: 0 40px 100px rgba(0,0,0,0.5);
            overflow: hidden;
            display: flex; justify-content: center; align-items: center;
        }

        /* Chrome Browser Frame Styling - FULL CANVAS (1440x900) */
        .chrome-browser {
            width: 1440px; height: 900px;
            background: #ffffff;
            display: flex; flex-direction: column;
            border: 1.6px solid rgba(0, 0, 0, 0.12) !important;
            overflow: hidden;
            position: absolute;
            top: 0; left: 0;
            z-index: 1;
            pointer-events: none; /* Let clicks pass to the canvas underneath */
        }
        .chrome-header {
            background: #dee1e6;
            padding: 8px 8px 0 8px;
            display: flex; flex-direction: column;
            gap: 6px;
            border-bottom: 1.6px solid #cbcbd0 !important;
            user-select: none;
            pointer-events: auto; /* Allow header interactions if needed */
        }
        .chrome-top-bar {
            display: flex; align-items: center;
            gap: 12px;
        }
        .chrome-dots {
            display: flex; gap: 8px; margin-left: 8px;
        }
        .chrome-dot {
            width: 12px; height: 12px; border-radius: 50%;
        }
        .chrome-dot.red { background: #ff5f56; }
        .chrome-dot.yellow { background: #ffbd2e; }
        .chrome-dot.green { background: #27c93f; }
        .chrome-tabs {
            display: flex; align-items: flex-end; margin-left: 16px;
        }
        .chrome-tab {
            background: #ffffff;
            border-radius: 8px 8px 0 0;
            padding: 6px 16px;
            font-size: 11px;
            font-weight: 600;
            color: #333;
            display: flex; align-items: center;
            gap: 8px;
            height: 28px;
            box-sizing: border-box;
        }
        .chrome-tab-close {
            color: #999; font-size: 10px; cursor: pointer;
        }
        .chrome-nav-bar {
            background: #ffffff;
            padding: 6px 12px;
            display: flex; align-items: center;
            gap: 12px;
            border-bottom: 1.6px solid #e5e7eb !important;
            pointer-events: auto;
        }
        .chrome-nav-btn {
            color: #5f6368; cursor: pointer; display: flex; align-items: center;
        }
        .chrome-url-bar {
            flex: 1;
            background: #f1f3f4;
            border-radius: 14px;
            height: 28px;
            display: flex; align-items: center;
            padding: 0 12px;
            font-size: 12px;
            color: #5f6368;
            gap: 8px;
            border: 1px solid transparent;
        }
        .chrome-content-area {
            flex: 1;
            background: #ffffff;
            position: relative;
            background-image:
                linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
            background-size: 20px 20px;
            overflow-y: scroll !important;
            overflow-x: hidden !important;
            scrollbar-gutter: stable;
            scroll-behavior: smooth;
        }
        .chrome-content-area::-webkit-scrollbar {
            width: 12px;
        }
        .chrome-content-area::-webkit-scrollbar-track {
            background: #f1f3f4;
            border-left: 1px solid #dadce0;
        }
        .chrome-content-area::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 6px;
            border: 2px solid #f1f3f4;
        }
        .chrome-content-area::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        .chrome-content-area::-webkit-scrollbar-thumb:active {
            background: #787878;
        }

        /* V4 Component Base Styles */
        .lf-component { position: absolute !important; box-sizing: border-box !important; z-index: 500; }
        .lf-component:hover { outline: 2px dashed var(--v4-primary) !important; cursor: pointer !important; }
        .lf-component.selected { outline: 2px solid var(--v4-primary) !important; z-index: 10001 !important; }

        .lf-drag-handle { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: var(--v4-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: move; z-index: 100; opacity: 0; transition: opacity 0.2s; border: 2px solid #fff; }
        .lf-component:hover .lf-drag-handle, .lf-component.selected .lf-drag-handle { opacity: 1; }
        .lf-resizer { position: absolute; bottom: -6px; right: -6px; width: 12px; height: 12px; background: var(--v4-primary); cursor: nwse-resize; border-radius: 2px; border: 2px solid #fff; opacity: 0; z-index: 100; }
        .lf-component:hover .lf-resizer, .lf-component.selected .lf-resizer { opacity: 1; }
        .lf-delete-trigger { position: absolute; top: -12px; right: -12px; width: 24px; height: 24px; background: #ef4444; color: #fff; border-radius: 50%; display: none !important; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 101; font-weight: bold; }

        .v4-editable-cell { outline: none; }
        .v4-editable-cell:focus { background: rgba(99, 102, 241, 0.05); }

        /* Text Marker Integration */
        .text-marker { 
            position: absolute; padding: 2px 6px; border-radius: 4px; 
            border: 1.6px solid transparent; font-size: 14px; line-height: 1.2; 
            white-space: normal; cursor: grab; pointer-events: auto; z-index: 1000; 
            transform: translate(-50%, -50%); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            min-width: unset; background: transparent; 
            box-shadow: none;
            color: #1e293b;
        }
        .text-marker:hover { border-color: var(--v4-primary); background: transparent; transform: translate(-50%, -50%); box-shadow: none; }
        .text-marker.selected { border-color: var(--v4-primary); outline: 2px solid var(--v4-primary); box-shadow: none; z-index: 1001; }
        .text-marker .lf-drag-handle { top: -14px; left: 50%; transform: translateX(-50%); }
    </style>
    <style id="v4-inlined-style">
        /* Dynamic component styles will be injected here */
    </style>
</head>
<body>
    <div class="page" id="canvas">
        <!-- Chrome Browser Frame Decoration -->
        <div class="chrome-browser">
            <div class="chrome-header">
                <div class="chrome-top-bar">
                    <div class="chrome-dots">
                        <div class="chrome-dot red"></div>
                        <div class="chrome-dot yellow"></div>
                        <div class="chrome-dot green"></div>
                    </div>
                    <div class="chrome-tabs">
                        <div class="chrome-tab">
                            <span class="material-icons-outlined" style="font-size: 14px; color: #6366f1;">shopping_bag</span>
                            <span style="font-family: inherit;">bychoi workspace | Design System</span>
                            <span class="chrome-tab-close">×</span>
                        </div>
                    </div>
                </div>
                <div class="chrome-nav-bar">
                    <span class="material-icons-outlined chrome-nav-btn" style="font-size: 18px;">arrow_back</span>
                    <span class="material-icons-outlined chrome-nav-btn" style="font-size: 18px;">arrow_forward</span>
                    <span class="material-icons-outlined chrome-nav-btn" style="font-size: 18px;">refresh</span>
                    <div class="chrome-url-bar">
                        <span class="material-icons-outlined" style="font-size: 14px; color: #10b981;">lock</span>
                        <span>https://bychoi.workspace.com</span>
                    </div>
                    <span class="material-icons-outlined chrome-nav-btn" style="font-size: 18px;">more_vert</span>
                </div>
            </div>
            <div class="chrome-content-area"></div>
        </div>

    </div>
    <script id="v4-inlined-script">
        /* Dynamic scripts will be injected here */
    </script>
</body>
</html>`;
window.LF_TEMPLATES['template_plan.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Plan - {{PROJECT_NAME}}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Malgun Gothic', sans-serif; background: #333; }
        .page { width: 1440px; height: 900px; background: #fff; margin: 0 auto; position: relative; padding: 0; box-sizing: border-box; }
        .header-bar { height: 40px; background: #3c3c3c; color: #fff; display: flex; align-items: center; padding: 0 20px; font-size: 14px; }
        .screen-title-overlay { margin: 20px 40px; background: #4b4b4b; color: #fff; display: inline-block; padding: 10px 40px; border-radius: 6px; font-size: 15px; font-weight: bold; }
        
        .gantt-container { margin: 0 40px; border: 1px solid #ccc; font-size: 12px; border-collapse: collapse; width: calc(100% - 80px); }
        .gantt-container th, .gantt-container td { border: 1px solid #ccc; height: 32px; padding: 0; }
        .bg-gray { background: #888; color: #fff; font-weight: bold; }
        .bg-light-gray { background: #f8f9fa; }
        
        .task-list { width: 160px; text-align: center; font-weight: bold; }
        .month-header { background: #666; color: #fff; text-align: center; }
        .week-header { width: 30px; text-align: center; background: #f0f0f0; font-size: 10px; }
        
        .bar-area { position: relative; }
        .bar { position: absolute; height: 14px; border-radius: 7px; top: 9px; opacity: 0.85; }
        .bar.gray { background: #444; }
        .bar.green { background: #5ea432; }
        .bar.light-green { background: #b7d8a6; }
        .bar.blue { background: #2f5597; }
        .bar.orange { background: #ed7d31; }
        .bar.yellow { background: #ffc000; }
        
        .label-text { position: absolute; font-size: 11px; white-space: nowrap; font-weight: bold; }
        .footer { position: absolute; bottom: 0; left:0; right:0; height: 40px; border-top: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; }
        .logo-area { display: flex; align-items: center; gap: 8px; }
        .logo-symbol { width: 20px; height: 20px; background: #e60012; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); color: #fff; font-size: 10px; display: flex; align-items: center; justify-content: center; }
        .logo-text { font-weight: 900; font-size: 16px; color: #1a1a1a; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header-bar">Plan</div>
        <div class="screen-title-overlay">사업 진행 일정</div>
        
        <table class="gantt-container">
            <thead>
                <tr class="bg-gray">
                    <th rowspan="2" class="task-list">Task</th>
                    <th colspan="5" class="month-header">12월</th>
                    <th colspan="4" class="month-header">1월</th>
                    <th colspan="4" class="month-header">2월</th>
                    <th colspan="4" class="month-header">3월</th>
                    <th colspan="5" class="month-header">4월</th>
                </tr>
                <tr>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th><th class="week-header">5W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th>
                    <th class="week-header">1W</th><th class="week-header">2W</th><th class="week-header">3W</th><th class="week-header">4W</th><th class="week-header">5W</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="bg-light-gray" style="text-align:center;">분석/설계</td><td colspan="22" class="bar-area"><div class="bar gray" style="left:5px; width:150px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#e2efda;">기획서</td><td colspan="22" class="bar-area"><div class="bar green" style="left:35px; width:120px;"></div><div class="bar light-green" style="left:155px; width:120px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#e2efda;">디자인</td><td colspan="22" class="bar-area"><div class="bar light-green" style="left:155px; width:100px;"></div><div class="bar green" style="left:255px; width:120px;"></div><div class="bar light-green" style="left:375px; width:30px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#e2efda;">퍼블리싱</td><td colspan="22" class="bar-area"><div class="bar light-green" style="left:215px; width:100px;"></div><div class="bar green" style="left:315px; width:120px;"></div><div class="bar light-green" style="left:435px; width:40px;"></div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#d9e1f2;">개발</td><td colspan="22" class="bar-area"><div class="bar blue" style="left:245px; width:360px;"></div><div class="label-text" style="left:550px; top: -15px; color:#2f5597;">개발 완료 : 4월 24일</div></td></tr>
                <tr><td class="bg-light-gray" style="text-align:center; background:#fff2cc;">테스트</td><td colspan="22" class="bar-area"><div class="bar yellow" style="left:580px; width:100px;"></div></td></tr>
            </tbody>
        </table>

        <div class="footer">
            <div class="logo-area"><div class="logo-text" style="font-weight: 800; color: #1a1c1e;">bychoi workspace</div></div>
            <div class="page-num">3</div>
        </div>
    </div>
</body>
</html>`;
window.LF_TEMPLATES['template_plan_delivery.html'] = `<!DOCTYPE html>
<html lang="ko"><head>
    <meta charset="UTF-8">
    <title>배송예정일 설정 - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --v4-bg: #f3f4f6; --v4-panel: #ffffff; --v4-accent: #6366f1;
            --v4-text: #111827; --v4-border: #d1d5db;
            --header-dark: #374151; --header-blue: #1e3a8a; --header-red: #b91c1c;
            --cell-peach: #fef2f2; --cell-green: #f0fdf4; --cell-gray: #6b7280;
        }
        body { margin:0; padding:0; background:#2d2d2d; font-family:'Inter','Noto Sans KR',sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; overflow:hidden; }
        .artboard { width:1440px; height:900px; background:#fff; position:relative; box-shadow:0 30px 60px rgba(0,0,0,0.4); overflow:hidden; }
        .lf-component { position:absolute; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); box-sizing:border-box; }
        .lf-component:hover { outline:2px dashed var(--v4-accent); outline-offset:2px; }
        .lf-component.selected { outline:2px solid var(--v4-accent); z-index:100; }
        .v4-editable-cell { outline:none; padding:4px; transition:background 0.2s; }
        .v4-editable-cell:focus { background:rgba(99,102,241,0.05); box-shadow:inset 0 0 0 1px var(--v4-accent); border-radius:2px; }
        .v4-shape-container { width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:700; }
        .v4-premium-table { width:100%; border-collapse:collapse; font-size:13px; table-layout:fixed; border:1.6px solid var(--v4-border-color, #475569) !important; }
        .v4-premium-table th,.v4-premium-table td { border:1.6px solid var(--v4-border-color, #cbd5e1) !important; padding:12px 6px; text-align:center; vertical-align:middle; line-height:1.4; }
        .v4-premium-table th { background:var(--header-dark); color:#fff; font-weight:800; }
        .h-blue { background:var(--header-blue) !important; }
        .h-red { background:var(--header-red) !important; }
        .bg-peach { background:#fee2e2 !important; }
        .bg-gray-area { background:#888 !important; }
        .text-red { color:#b91c1c; font-weight:700; }
        .text-blue { color:#1e40af; font-weight:700; }
        .table-scroll-wrap { overflow:visible; width:100%; }
    </style>
<style id="v4-inlined-style">
:root { --v4-primary:#6366f1; --v4-accent:#00e5ff; --v4-bg-dark:#0a0b10; --v4-panel-bg:rgba(23,25,35,0.7); --v4-border:rgba(255,255,255,0.08); --v4-text-main:#f8fafc; --v4-text-dim:#94a3b8; }
.lf-component { position:absolute; cursor:pointer; transition:outline 0.2s; }
.lf-component.selected { outline:2px solid #6366f1; z-index:1001; }
.lf-drag-handle { position:absolute; top:-12px; left:-12px; width:24px; height:24px; background:#6366f1; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:move; opacity:0; transition:all 0.2s; border:2px solid #fff; z-index:10; }
.lf-component:hover .lf-drag-handle,.lf-component.selected .lf-drag-handle { opacity:1; top:-16px; left:-16px; }
.lf-resizer { position:absolute; bottom:-5px; right:-5px; width:12px; height:12px; background:#6366f1; cursor:nwse-resize; border-radius:50%; border:2px solid #fff; opacity:0; transition:0.2s; z-index:10; }
.lf-component:hover .lf-resizer,.lf-component.selected .lf-resizer { opacity:1; }
.lf-delete-trigger { position:absolute; top:-12px; right:-12px; width:24px; height:24px; background:#ef4444; color:#fff; border-radius:50%; display:none; align-items:center; justify-content:center; cursor:pointer; border:2px solid #fff; z-index:10001; font-size:14px; font-weight:bold; }
.lf-component:hover .lf-delete-trigger,.lf-component.selected .lf-delete-trigger { display:flex; }
.v4-editable-cell:focus { outline:2px solid #6366f1; background:rgba(99,102,241,0.05) !important; }
</style>
</head>
<body>
    <div class="artboard" id="canvas">
        <!-- Title Shape -->
        <div class="lf-component" id="comp-title-shape" style="top:40px; left:40px; width:320px; height:56px;">
            <div class="v4-shape-container" style="background:#4b5563; color:#fff; font-size:18px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                <div class="v4-editable-cell" contenteditable="true">{{SCREEN_NAME}}</div>
            </div>
        </div>

        <!-- Main Data Table -->
        <div class="lf-component" id="comp-main-table" style="top:130px; left:40px; width:1360px; height:auto;">
            <div class="table-scroll-wrap">
                <table class="v4-premium-table">
                    <thead>
                        <tr>
                            <th style="width:180px;">YMD</th>
                            <th style="width:180px;">일자</th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D-Day</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+1</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+2</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+3</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+4</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+5</div></th>
                            <th class="h-blue"><div class="v4-editable-cell" contenteditable="true">D+6</div></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="background:#f9fafb;">WRHS_GI_YN</td>
                            <td>안산 출고 여부</td>
                            <td><div class="v4-editable-cell" contenteditable="true">Y</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                        </tr>
                        <tr>
                            <td style="background:#f9fafb;">DLSR_GOFG_YN</td>
                            <td>택배 집하 여부</td>
                            <td><div class="v4-editable-cell" contenteditable="true">Y</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                        </tr>
                        <tr>
                            <td style="background:#f9fafb;">DLSR_MVMN_YN</td>
                            <td>택배 배달 여부</td>
                            <td><div class="v4-editable-cell" contenteditable="true">Y</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                        </tr>
                        <tr>
                            <td style="background:#f9fafb;">GI_CLSN_HR</td>
                            <td>당일 출고 마감 시간</td>
                            <td><div class="v4-editable-cell" contenteditable="true">18</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">18</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">18</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">18</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">18</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">18</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">18</div></td>
                        </tr>
                        <tr>
                            <td style="background:#f9fafb;">HODY_YN</td>
                            <td>연휴 여부</td>
                            <td colspan="7" rowspan="6" class="bg-gray-area"></td>
                        </tr>
                        <tr><td style="background:#f9fafb;">HODY_NM</td><td>연휴 구분</td></tr>
                        <tr><td style="background:#f9fafb;">HODY_GDNC_STRT_HR</td><td>연휴 안내 시작 시간</td></tr>
                        <tr><td style="background:#f9fafb;">HODY_GDNC_END_HR</td><td>연휴 안내 종료 시간</td></tr>
                        <tr><td style="background:#f9fafb;">HODY_ARVA_PRRN_DD</td><td>연휴 내 도착 예정일</td></tr>
                        <tr><td style="background:#f9fafb;">HODY_GDNC_DSCR</td><td>연휴 안내 문구</td></tr>
                        <!-- Result Section -->
                        <tr>
                            <td rowspan="2" style="background:#e5e7eb; font-weight:800;">RESULT<br>배송예정일</td>
                            <td style="background:#f3f4f6;">출고 마감 이전</td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                        </tr>
                        <tr>
                            <td style="background:#f3f4f6;">출고 마감 이후</td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                            <td><div class="v4-editable-cell" contenteditable="true">-</div></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Footer Info -->
        <div class="lf-component" style="bottom:30px; left:40px; color:#999; font-size:12px; display:flex; align-items:center; gap:12px;">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:grayscale(1) opacity(0.4);">
                <rect x="15" y="22" width="55" height="14" rx="7" fill="#6366f1" />
                <rect x="25" y="43" width="55" height="14" rx="7" fill="#6366f1" opacity="0.7" />
                <rect x="35" y="64" width="55" height="14" rx="7" fill="#6366f1" opacity="0.4" />
            </svg>
            <span>© bychoi workspace. All Rights Reserved.</span>
        </div>
    </div>
<script id="v4-inlined-script">
(function() {
    let isDragging = false, isResizing = false, activeEl = null;
    let startX, startY, startW, startH, startTop, startLeft;
    function notifyParent(data) { window.parent.postMessage(data, '*'); }
    function markDirty() { notifyParent({ type: 'LF_DIRTY' }); }
    document.addEventListener('mousedown', e => {
        const h = e.target.closest('.lf-drag-handle'), r = e.target.closest('.lf-resizer'), d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');
        if (d && c) { c.remove(); markDirty(); return; }
        if (c) { 
            document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected')); 
            c.classList.add('selected'); 
            const isPin = c.classList.contains('text-marker');
            notifyParent({ 
                type: 'LF_COMP_SELECTED', 
                id: c.id, 
                isTable: !!c.querySelector('table'), 
                isShape: !!c.querySelector('.v4-shape'),
                isPin: isPin,
                pinIndex: isPin ? parseInt(c.id.replace('v4-pin-', '')) : -1
            }); 
        }
        else { document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected')); notifyParent({ type: 'LF_DESELECT' }); }
        if (h) { isDragging = true; activeEl = h.parentElement; startX = e.clientX; startY = e.clientY; startTop = parseInt(activeEl.style.top) || 0; startLeft = parseInt(activeEl.style.left) || 0; e.preventDefault(); }
        else if (r) { isResizing = true; activeEl = r.parentElement; startX = e.clientX; startY = e.clientY; startW = activeEl.offsetWidth; startH = activeEl.offsetHeight; e.preventDefault(); }
    });
    document.addEventListener('mousemove', e => {
        if (isDragging && activeEl) { activeEl.style.top = (startTop + e.clientY - startY) + 'px'; activeEl.style.left = (startLeft + e.clientX - startX) + 'px'; markDirty(); }
        else if (isResizing && activeEl) { activeEl.style.width = (startW + e.clientX - startX) + 'px'; activeEl.style.height = (startH + e.clientY - startY) + 'px'; markDirty(); }
    });
    document.addEventListener('mouseup', () => { isDragging = false; isResizing = false; activeEl = null; });
    document.addEventListener('input', e => { if (e.target.classList.contains('v4-editable-cell')) markDirty(); });
    window.addEventListener('message', e => {
        const d = e.data; if (!d) return;
        if (d.type === 'LF_REQUEST_SAVE_CONTENT') { const c = document.documentElement.cloneNode(true); c.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle').forEach(el => el.remove()); c.querySelectorAll('.lf-component').forEach(el => el.classList.remove('selected')); notifyParent({ type: 'LF_SAVE_CONTENT_RESPONSE', html: "<!DOCTYPE html>\\\\n" + c.outerHTML }); }
        else if (d.type === 'LF_INSERT_COMPONENT') { const v = document.createElement('div'); v.id = d.id || ('v4-comp-' + Date.now()); v.className = 'lf-component'; v.style.position = 'absolute'; v.style.top = '100px'; v.style.left = '100px'; v.style.zIndex = '1000'; if (d.style) Object.assign(v.style, d.style); v.innerHTML = '<div class="lf-drag-handle"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor;"><path d="M10,13V11H14V13H10M10,9V7H14V9H10M10,17V15H14V17H10M6,13V11H8V13H6M6,9V7H8V9H6M6,17V15H8V17H6M16,13V11H18V13H16M16,9V7H18V9H16M16,17V15H18V17H16Z"/></svg></div>' + d.html + '<div class="lf-resizer"></div><div class="lf-delete-trigger">×</div>'; document.body.appendChild(v); document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected')); v.classList.add('selected'); const isPin = v.classList.contains('text-marker'); notifyParent({ type: 'LF_COMP_SELECTED', id: v.id, isTable: !!v.querySelector('table'), isShape: !!v.querySelector('.v4-shape'), isPin: isPin, pinIndex: isPin ? parseInt(v.id.replace('v4-pin-', '')) : -1 }); markDirty(); }
        else if (d.type === 'LF_UPDATE_STYLE') { const s = document.querySelector('.lf-component.selected'); if (!s) return; const t = d.selector ? s.querySelector(d.selector) : s; if (!t) return; if (d.style) Object.assign(t.style, d.style); if (d.subSelector && d.subStyle) t.querySelectorAll(d.subSelector).forEach(el => Object.assign(el.style, d.subStyle)); markDirty(); }
        else if (d.type === 'LF_TABLE_ACTION') { const t = document.querySelector('.lf-component.selected table'); if (!t) return; if (d.action === 'ADD_ROW') { const b = t.querySelector('tbody') || t, l = t.querySelector('tr:last-child'); if (l) { const n = l.cloneNode(true); n.querySelectorAll('td, th').forEach(x => { x.innerText = "-"; }); b.appendChild(n); } } else if (d.action === 'DEL_ROW') { const r = t.querySelectorAll('tr'); if (r.length > 1) r[r.length - 1].remove(); } else if (d.action === 'ADD_COL') { t.querySelectorAll('tr').forEach(tr => { const x = tr.querySelector('td:last-child') || tr.querySelector('th:last-child'); if (x) { const n = x.cloneNode(true); n.innerText = "-"; tr.appendChild(n); } }); } else if (d.action === 'DEL_COL') { t.querySelectorAll('tr').forEach(tr => { const x = tr.querySelectorAll('td, th'); if (x.length > 1) x[x.length - 1].remove(); }); } markDirty(); }
        else if (d.type === 'LF_DELETE_SELECTED') { const s = document.querySelector('.lf-component.selected'); if (s) { s.remove(); markDirty(); } }
        else if (d.type === 'LF_DESELECT_ALL') { document.querySelectorAll('.lf-component').forEach(x => x.classList.remove('selected')); }
    });
})();
</script>
</body></html>`;
window.LF_TEMPLATES['template_responsive_pc_mobile.html'] = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Responsive PC & Mobile - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
</head>
<body>
    <div class="page">
        <div class="frame-column pc-column active-column">
            <div class="frame-label-bar">
                <div class="frame-label-title">
                    <span class="material-icons-outlined" style="font-size: 15px; color: var(--v4-accent);">desktop_windows</span>
                    <input type="text" class="frame-title-input pc-title-input" value="PC Web Screen" placeholder="프레임명 입력...">
                </div>
                <div class="frame-label-height-control">
                    <span>Height:</span>
                    <input type="number" class="frame-label-input pc-height-input" value="810" min="810" step="10">
                    <span>px</span>
                </div>
            </div>
            <div class="pc-browser-frame active-frame">
                <div class="pc-browser-header">
                    <div class="pc-browser-top-bar">
                        <div class="browser-dots">
                            <div class="browser-dot red"></div>
                            <div class="browser-dot yellow"></div>
                            <div class="browser-dot green"></div>
                        </div>
                        <div class="browser-tabs">
                            <div class="browser-tab">
                                <span class="material-icons-outlined" style="font-size: 13px; color: #6366f1;">shopping_bag</span>
                                <span>SISUN.COM | PC Web</span>
                            </div>
                        </div>
                        <div class="browser-address-bar">
                            <span class="material-icons-outlined" style="font-size: 13px; color: #64748b;">lock</span>
                            <span style="font-weight: 600; color: #334155;">https://www.sisun.com/pc</span>
                        </div>
                    </div>
                </div>
                <div class="pc-content-area">
                    <div class="pc-content-inner">
                        <svg class="v4-responsive-guide-layer pc-guide-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99999; overflow: visible;"></svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-column mobile-column">
            <div class="frame-label-bar">
                <div class="frame-label-title">
                    <span class="material-icons-outlined" style="font-size: 15px; color: var(--v4-accent);">smartphone</span>
                    <input type="text" class="frame-title-input mobile-title-input" value="Mobile App Screen" placeholder="프레임명 입력...">
                </div>
                <div class="frame-label-height-control">
                    <span>Height:</span>
                    <input type="number" class="frame-label-input mobile-height-input" value="810" min="810" step="10">
                    <span>px</span>
                </div>
            </div>
            <div class="mobile-browser-frame">
                <div class="mobile-browser-header">
                    <div class="galaxy-status-bar">
                        <div class="galaxy-time">12:30</div>
                        <div class="galaxy-punch-hole"></div>
                        <div class="galaxy-icons">
                            <span class="material-icons-outlined" style="font-size: 14px;">signal_cellular_4_bar</span>
                            <span style="font-size: 11px; font-weight: 800; letter-spacing: -0.5px;">5G</span>
                            <span class="material-icons-outlined" style="font-size: 14px;">wifi</span>
                            <span class="material-icons-outlined" style="font-size: 16px;">battery_full</span>
                        </div>
                    </div>
                </div>
                <div class="mobile-content-area">
                    <div class="mobile-content-inner">
                        <svg class="v4-responsive-guide-layer mobile-guide-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99999; overflow: visible;"></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        (function() {
            function initHeightControls() {
                const pcInput = document.querySelector('.pc-height-input');
                const pcInner = document.querySelector('.pc-content-inner');
                if (pcInput && pcInner) {
                    const updatePc = () => {
                        const val = Math.max(810, parseInt(pcInput.value) || 810);
                        pcInner.style.minHeight = (val + 2) + 'px';
                        pcInput.setAttribute('value', val);
                    };
                    pcInput.addEventListener('input', updatePc);
                    pcInput.addEventListener('change', updatePc);
                    updatePc();
                }
                const mobileInput = document.querySelector('.mobile-height-input');
                const mobileInner = document.querySelector('.mobile-content-inner');
                if (mobileInput && mobileInner) {
                    const updateMobile = () => {
                        const val = Math.max(810, parseInt(mobileInput.value) || 810);
                        mobileInner.style.minHeight = (val + 2) + 'px';
                        mobileInput.setAttribute('value', val);
                    };
                    mobileInput.addEventListener('input', updateMobile);
                    mobileInput.addEventListener('change', updateMobile);
                    updateMobile();
                }
            }
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initHeightControls);
            } else {
                initHeightControls();
            }
        })();
    </script>
    <script id="v4-inlined-script">
        /* Dynamic scripts injected */
    </script>
</body>
</html>
`;

window.LF_TEMPLATES['template_case_study.html'] = `<!DOCTYPE html>
<html lang="ko" style="--v4-text-color: #0f172a; --v4-font-size: 12px; --v4-font-weight: 400; --v4-font-family: inherit; --v4-placeholder-color: #94a3b8;">
<head>
    <meta charset="UTF-8">
    <title>Case Study - {{PROJECT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Noto+Sans+KR:wght@400;500;700;900&amp;display=swap" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #6366f1;
            --v4-accent: #00e5ff;
            --v4-bg: #1e293b;
            --v4-surface: #f8f9fa;
            --v4-border: #e1e3e5;
            --v4-text: #1a1c1e;
        }
        body { 
            margin: 0; padding: 0; 
            font-family: 'Inter', 'Noto Sans KR', sans-serif; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; background: var(--v4-bg); 
            overflow: hidden; color: var(--v4-text);
        }
        .page { 
            width: 1440px; height: 900px; 
            position: relative; 
            background: #ffffff;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.02) 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.03) 0%, transparent 50%);
            box-shadow: 0 40px 100px rgba(0,0,0,0.05);
            overflow: hidden;
        }
    </style>
    
<style id="v4-typography-rules">:root {
  --v4-text-color: #0f172a;
  --v4-font-size: 12px;
  --v4-font-weight: 400;
  --v4-font-family: inherit;
  --v4-placeholder-color: #94a3b8;
}
.v4-editable-cell, .v4-shape, .v4-shape-rect, .v4-shape-circle, .v4-shape-triangle, .v4-shape-diamond, .v4-shape-arrow, .v4-shape-pattern-grid, .v4-shape-wave, .text-marker, .v4-text-box, .v4-text-shape {
  color: var(--v4-text-color, #0f172a);
  font-size: var(--v4-font-size, 12px);
  font-weight: var(--v4-font-weight, 400);
  font-family: var(--v4-font-family, inherit);
}
.v4-premium-table th, .v4-premium-table td, .v4-grid-container td.v4-grid-cell, .v4-grid-container th.v4-grid-cell {
  font-size: 12px !important;
  font-weight: 400 !important;
  color: var(--v4-text-color, #0f172a) !important;
  font-family: inherit !important;
}
.v4-checkbox-text, .v4-radio-text {
  font-size: 12px !important;
  font-weight: 400 !important;
  color: var(--v4-text-color, #0f172a) !important;
  font-family: inherit !important;
}
.v4-dp-preset-btn {
  font-size: 12px !important;
  font-weight: 400 !important;
  font-family: inherit !important;
}
.v4-alert-desc-badge, .v4-alert-title, .v4-alert-message, .v4-alert-btn {
  font-size: 12px !important;
  font-weight: 400 !important;
  font-family: inherit !important;
}
.v4-admin-group-header, .v4-admin-label-cell {
  font-size: 12px !important;
  font-weight: 400 !important;
  font-family: inherit !important;
}
.v4-popup-title, .v4-stepper-value, .v4-stepper-action, .v4-stepper-dec, .v4-stepper-inc, .v4-textbox-counter, .v4-textarea-counter {
  font-size: 12px !important;
  font-weight: 400 !important;
  font-family: inherit !important;
}</style>
</head>
<body>
    <div class="page" id="canvas">
        <!-- Blank Canvas -->
    </div>
    
<div class="lf-component" data-resized="true" style="position: absolute; top: 20px; left: 20px; z-index: 1000; transform: none; width: 1400px; height: 40px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326575728-1">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(255, 255, 255); display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box; border-width: 1.6px !important; border-radius: 100px !important;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px !important; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"><p><br></p></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 20px; left: 20px; z-index: 1000; transform: none; width: 200px; height: 40px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" data-resized="true" id="v4-comp-1788326575728-2">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(0, 0, 0); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 100px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px !important; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"><p><strong style="color: rgb(255, 255, 255); font-size: 14px;">Case Study </strong></p></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 90px; left: 119px; z-index: 1000; transform: none; width: 62px; height: 28px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326575728-3"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 4px !important; display: block; text-align: center !important; width: 100%; height: 100%; align-items: center !important; box-sizing: border-box;"><p style="text-align: center;"><span style="font-size: 16px;">LFmall</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 90px; left: 391.5px; z-index: 1000; transform: none; width: 87px; height: 28px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326575728-4"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 4px !important; display: block; text-align: center !important; width: 100%; height: 100%; align-items: center !important; box-sizing: border-box;"><p style="text-align: center;"><span style="font-size: 16px;">SSF SHOP</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 90px; left: 674px; z-index: 1000; transform: none; width: 92px; height: 28px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326575728-5"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 4px !important; display: block; text-align: center !important; width: 100%; height: 100%; align-items: center !important; box-sizing: border-box;"><p style="text-align: center;"><span style="font-size: 16px;">SI VILLAGE</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 90px; left: 978.5px; z-index: 1000; transform: none; width: 53px; height: 28px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326575728-6"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 4px !important; display: block; text-align: center !important; width: 100%; height: 100%; align-items: center !important; box-sizing: border-box;"><p style="text-align: center;"><span style="font-size: 16px;">29CM</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 90px; left: 1238.5px; z-index: 1000; transform: none; width: 103px; height: 28px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326575728-7"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 4px !important; display: block; text-align: center !important; width: 100%; height: 100%; align-items: center !important; box-sizing: border-box;"><p style="text-align: center;"><span style="font-size: 16px;">W CONCEPT</span></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 27px; left: 240px; z-index: 1000; transform: none; width: 57px; height: 26px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326575728-8"><div class="v4-editable-cell" contenteditable="true" style="outline: none; color: var(--v4-text-color, #0f172a); font-size: 12px; font-weight: 400; font-family: inherit; padding: 4px !important; display: block; text-align: left; width: 100%; height: 100%;"><p><strong style="font-size: 14px;">POINT</strong></p></div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 790.245px; left: 20px; z-index: 1000; transform: none; width: 1400px; height: 80px;" data-resized="true" id="v4-comp-1788326581857-10">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(156, 163, 175); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 813.245px; left: 100px; width: 66px; height: 33px; z-index: 1001; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326581857-11">
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: rgb(15, 23, 42); font-size: 15px; font-weight: 800; padding: 4px !important; text-align: left; width: 100%; height: 100%;"><p><strong style="font-size: 20px; color: rgb(255, 255, 255);">I</strong><strong style="font-size: 12px; color: rgb(255, 255, 255);">NSIGHT</strong></p></div>
        <div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 800.245px; left: 176px; z-index: 1000; transform: none; width: 500px; height: 60px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" data-resized="true" id="v4-comp-1788326581857-12">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(255, 255, 255); border-color: transparent; border-top-style: ; border-width: 1.6px !important; border-right-style: ; border-bottom-style: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 100px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px !important; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"><p><span style="font-size: 16px;">TEXT</span></p></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 805.245px; left: 40px; z-index: 1000; transform: none; height: 50px; color: rgb(0, 0, 0); width: 50px;" data-resized="true" id="v4-comp-1788326581857-13"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; padding: 3px; box-sizing: border-box; background-image: none !important; color: rgb(255, 255, 255);"><path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path><path d="M9 18h6" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path><path d="M10 22h4" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path></svg><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component v4-text-shape" style="position: absolute; top: 813.745px; left: 791px; width: 99px; height: 33px; z-index: 1001; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326581857-14">
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: rgb(15, 23, 42); font-size: 15px; font-weight: 800; padding: 4px !important; text-align: left; width: 100%; height: 100%;"><p><span style="font-size: 20px; color: rgb(255, 255, 255);">H</span><span style="font-size: 12px; color: rgb(255, 255, 255);">YPOTHESES</span></p></div>
        <div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" data-resized="true" style="position: absolute; top: 800.245px; left: 900px; z-index: 1000; transform: none; width: 500px; height: 60px; --v4-text-adjust-y: 0px; min-width: unset !important; min-height: unset !important;" id="v4-comp-1788326581857-15">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgb(255, 255, 255); border-color: transparent; border-top-style: ; border-width: 1.6px !important; border-right-style: ; border-bottom-style: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 100px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center !important; justify-content: center; box-sizing: border-box; text-align: center !important; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; padding: 4px !important;"><p style="text-align: center;"><span style="font-size: 14px;">TEXT</span></p></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div class="lf-component" style="position: absolute; top: 805.245px; left: 731px; z-index: 1000; transform: none; height: 50px; color: rgb(0, 0, 0); width: 50px;" data-resized="true" id="v4-comp-1788326581857-16"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; padding: 3px; box-sizing: border-box; background-image: none !important; color: rgb(255, 255, 255);"><path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path><path d="M8.5 2h7" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path><path d="M7 16h10" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></path></svg><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>
<div id="v4-comp-1788327065139" class="lf-component" style="position: absolute; top: 138px; left: 20px; z-index: 1000; transform: none; width: 260px; height: 613px;" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 0px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>

<div id="v4-comp-1788327108465_717798_0" class="lf-component" data-resized="true" style="position: absolute; top: 138px; left: 305px; z-index: 1000; transform: none; width: 260px; height: 613px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 0px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1788327115251_960044_0" class="lf-component" data-resized="true" style="position: absolute; top: 138px; left: 590px; z-index: 1000; transform: none; width: 260px; height: 613px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 0px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1788327116496_613268_0" class="lf-component" data-resized="true" style="position: absolute; top: 138px; left: 875px; z-index: 1000; transform: none; width: 260px; height: 613px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 0px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1788327117916_477556_0" class="lf-component" data-resized="true" style="position: absolute; top: 138px; left: 1160px; z-index: 1000; transform: none; width: 260px; height: 613px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: var(--v4-component-bg, rgb(255, 255, 255)); border-top-color: ; border-top-style: ; border-width: 1.6px !important; border-right-color: ; border-right-style: ; border-bottom-color: ; border-bottom-style: ; border-left-color: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 0px !important; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>
<div id="v4-comp-1788327164318_100979_0" class="lf-component" data-resized="true" style="position: absolute; top: 701px; left: 20px; z-index: 1000; transform: none; width: 260px; height: 50px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgba(234, 88, 12, 0.1); border-color: rgb(234, 88, 12); border-top-style: ; border-width: 1.6px !important; border-right-style: ; border-bottom-style: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>
<div id="v4-comp-1788327202432_224160_0" class="lf-component" data-resized="true" style="position: absolute; top: 701px; left: 305px; z-index: 1000; transform: none; width: 260px; height: 50px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgba(234, 88, 12, 0.1); border-color: rgb(234, 88, 12); border-top-style: ; border-width: 1.6px !important; border-right-style: ; border-bottom-style: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1788327209848_278787_0" class="lf-component" data-resized="true" style="position: absolute; top: 701px; left: 590px; z-index: 1000; transform: none; width: 260px; height: 50px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgba(234, 88, 12, 0.1); border-color: rgb(234, 88, 12); border-top-style: ; border-width: 1.6px !important; border-right-style: ; border-bottom-style: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1788327212613_362465_0" class="lf-component" data-resized="true" style="position: absolute; top: 701px; left: 875px; z-index: 1000; transform: none; width: 260px; height: 50px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgba(234, 88, 12, 0.1); border-color: rgb(234, 88, 12); border-top-style: ; border-width: 1.6px !important; border-right-style: ; border-bottom-style: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div><div id="v4-comp-1788327216646_696926_0" class="lf-component" data-resized="true" style="position: absolute; top: 701px; left: 1160px; z-index: 1000; transform: none; width: 260px; height: 50px;">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: rgba(234, 88, 12, 0.1); border-color: rgb(234, 88, 12); border-top-style: ; border-width: 1.6px !important; border-right-style: ; border-bottom-style: ; border-left-style: ; border-image-source: ; border-image-slice: ; border-image-width: ; border-image-outset: ; border-image-repeat: ; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--v4-text-color, #0f172a); overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 12px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div><div class="lf-connector-port port-top" data-side="top"></div><div class="lf-connector-port port-bottom" data-side="bottom"></div><div class="lf-connector-port port-left" data-side="left"></div><div class="lf-connector-port port-right" data-side="right"></div></div>
<script id="v4-inlined-script">/* Dynamic scripts injected */</script>
</body>
</html>
`;

// Alias key mappings for instant synchronous resolution across all template options
window.LF_TEMPLATES['cover'] = window.LF_TEMPLATES['template_cover.html'];
window.LF_TEMPLATES['plan'] = window.LF_TEMPLATES['template_plan.html'];
window.LF_TEMPLATES['plan_delivery'] = window.LF_TEMPLATES['template_plan_delivery.html'];
window.LF_TEMPLATES['pc_ui'] = window.LF_TEMPLATES['template_pc_ui.html'];
window.LF_TEMPLATES['ui'] = window.LF_TEMPLATES['template_pc_ui.html'];
window.LF_TEMPLATES['front_ui'] = window.LF_TEMPLATES['template_pc_ui.html'];
window.LF_TEMPLATES['mobile_ui_1'] = window.LF_TEMPLATES['template_mobile_ui_1.html'];
window.LF_TEMPLATES['mobile_ui_2'] = window.LF_TEMPLATES['template_mobile_ui_2.html'];
window.LF_TEMPLATES['mobile_ui_3'] = window.LF_TEMPLATES['template_mobile_ui_3.html'];
window.LF_TEMPLATES['mobile_ui'] = window.LF_TEMPLATES['template_mobile_ui_1.html'];
window.LF_TEMPLATES['responsive_pc_mobile'] = window.LF_TEMPLATES['template_responsive_pc_mobile.html'];
window.LF_TEMPLATES['pc_mobile'] = window.LF_TEMPLATES['template_responsive_pc_mobile.html'];
window.LF_TEMPLATES['responsive'] = window.LF_TEMPLATES['template_responsive_pc_mobile.html'];
window.LF_TEMPLATES['onesphere'] = window.LF_TEMPLATES['template_onesphere.html'];
window.LF_TEMPLATES['admin_onesphere'] = window.LF_TEMPLATES['template_onesphere.html'];
window.LF_TEMPLATES['case_study'] = window.LF_TEMPLATES['template_case_study.html'];
window.LF_TEMPLATES['blank'] = window.LF_TEMPLATES['template_blank.html'];

