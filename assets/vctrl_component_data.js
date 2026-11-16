/**
 * bychoi workspace V4 - Premium Component Library
 * Optimized for high-fidelity design reviews.
 */

window.V4_COMPONENT_LIBRARY = {
    atoms: (window.V4_COMPONENT_LIBRARY && Array.isArray(window.V4_COMPONENT_LIBRARY.atoms) && window.V4_COMPONENT_LIBRARY.atoms.length > 0)
        ? window.V4_COMPONENT_LIBRARY.atoms
        : [],
    molecules: [
        {
            id: 'v4-search-bar',
            name: 'Glass Search Bar',
            category: 'Molecules',
            previewHtml: `<div style="width: 120px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; border: 1.6px solid rgba(255,255,255,0.2);"></div>`,
            html: `
            <div class="v4-search-container" style="display: flex; align-items: center; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1.6px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 8px 16px; width: 100%; max-width: 400px; box-sizing: border-box;">
                <span class="material-icons-outlined" style="color: rgba(255,255,255,0.4); font-size: 20px;">search</span>
                <input type="text" placeholder="Search products..." style="background: transparent; border: none; color: white; margin-left: 10px; font-size: 14px; outline: none; width: 100%;">
            </div>`
        },

        // --- Row 1: Basic Geometry (Rect, Circle, Triangle) ---
        {
            id: 'v4-shape-rect',
            name: 'Rect',
            koName: '사각형 사각도형',
            category: 'Shapes',
            icon: 'crop_square',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 40px; height: 30px; background: var(--v4-component-bg, rgb(255, 255, 255)); border: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)); border-radius: 4px;"></div>`,
            html: `
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #050505; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; color: #050505; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div>`
        },
        {
            id: 'v4-shape-circle',
            name: 'Circle',
            koName: '원 원형 동그라미',
            category: 'Shapes',
            icon: 'panorama_fish_eye',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 30px; height: 30px; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 50%;"></div>`,
            html: `
            <div class="v4-shape v4-shape-circle" style="width: 100%; height: 100%; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #050505; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; color: #050505; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div>`
        },
        {
            id: 'v4-shape-triangle',
            name: 'Triangle',
            koName: '삼각형 삼각 세모',
            category: 'Shapes',
            icon: 'change_history',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 30px solid rgb(255, 255, 255);"></div>`,
            html: `
            <div class="v4-shape v4-shape-triangle" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: flex-end; justify-content: center; color: #050505; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="50,1 1,99 99,99" style="fill: #ffffff; stroke: #c8c8c8; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; color: #050505; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative;"></div>
            </div>`
        },

        // --- Row 2: Flow & Connectors (Diamond, Line, Arrow) ---
        {
            id: 'v4-shape-diamond',
            name: 'Diamond',
            koName: '다이아몬드 마름모 조건 의사결정',
            category: 'Shapes',
            iconType: 'svg',
            iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 18px; height: 18px;"><polygon points="12 2 22 12 12 22 2 12"></polygon></svg>',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 30px; height: 30px; background: #ffffff; border: 1.6px solid #c8c8c8; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>`,
            html: `
            <div class="v4-shape v4-shape-diamond" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: #050505; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="50,1 99,50 50,99 1,50" style="fill: #ffffff; stroke: #c8c8c8; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 60%; height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; color: #050505; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative;"></div>
            </div>`
        },
        {
            id: 'v4-shape-line',
            name: 'Line (Straight)',
            koName: '직선 라인 선 구분선 디바이더 가로선 세로선',
            category: 'Shapes',
            icon: 'horizontal_rule',
            iconColor: '#00e5ff',
            width: '200px',
            height: '2px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 30px;"><div style="width: 100%; height: 2px; background: #00e5ff; border-radius: 1px;"></div></div>`,
            html: `
            <div class="v4-shape v4-shape-line" data-line-dir="horizontal" data-line-style="solid" data-line-width="1.6" data-line-color="#c8c8c8" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none;">
                    <line class="v4-line-path" x1="0" y1="50" x2="100" y2="50" style="stroke: #c8c8c8; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
            </div>`
        },
        {
            id: 'v4-shape-arrow',
            name: 'Arrow',
            koName: '화살표 방향 지시 흐름도',
            category: 'Shapes',
            icon: 'trending_flat',
            iconColor: '#00e5ff',
            width: '100px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<svg viewBox="0 0 100 100" style="width: 30px; height: 30px; overflow: visible;"><path d="M 0,30 L 60,30 L 60,10 L 100,50 L 60,90 L 60,70 L 0,70 Z" style="fill: rgb(255, 255, 255); stroke: rgb(200, 200, 200); stroke-width: 1.6; vector-effect: non-scaling-stroke;" /></svg>`,
            html: `
            <div class="v4-shape v4-shape-arrow" data-arrow-dir="right" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: #050505; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <path class="v4-arrow-path" d="M 0,30 L 60,30 L 60,10 L 100,50 L 60,90 L 60,70 L 0,70 Z" style="fill: #ffffff; stroke: #c8c8c8; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 50%; height: 40%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; color: #050505; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative;"></div>
            </div>`
        },

        // --- Row 3: Content Media (Text, Table, Image) ---
        {
            id: 'v4-tool-text',
            name: 'Text',
            koName: '텍스트 글상자',
            category: 'Shapes',
            isTool: true,
            toolName: 'text',
            icon: 'title',
            iconColor: '#00e5ff',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            html: '<div class="v4-editable-cell" contenteditable="true" style="outline:none; color:#050505; font-size:13px; font-weight:400; font-family:inherit; padding:2px 4px; display:block; text-align:left; line-height:1.5; white-space:nowrap;">Edit Text</div>'
        },
        {
            id: 'v4-data-table',
            name: 'Table',
            koName: '표 테이블',
            category: 'Shapes',
            icon: 'table_chart',
            iconColor: '#00e5ff',
            width: '200px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 80px; height: 40px; border: 1.6px solid #c8c8c8; background: #f0f0f0; border-radius: 4px;"></div>`,
            html: `
            <table class="v4-premium-table" style="background: #ffffff; border: 1.6px solid #c8c8c8; color: #050505; font-family: inherit; width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse; box-sizing: border-box;">
                <colgroup>
                    <col style="width: 100px;">
                    <col style="width: 100px;">
                </colgroup>
                <thead>
                    <tr style="height: 50px;">
                        <th contenteditable="true" class="v4-editable-cell" style="background: #f0f0f0; color: #050505; border: 1.6px solid #c8c8c8; font-size: 13px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">구분</th>
                        <th contenteditable="true" class="v4-editable-cell" style="background: #f0f0f0; color: #050505; border: 1.6px solid #c8c8c8; font-size: 13px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">상세 내용</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height: 50px;">
                        <td contenteditable="true" class="v4-editable-cell" style="background: #ffffff; border: 1.6px solid #c8c8c8; color: #050505; font-size: 13px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">내용</td>
                        <td contenteditable="true" class="v4-editable-cell" style="background: #ffffff; border: 1.6px solid #c8c8c8; color: #050505; font-size: 13px; font-weight: 400; font-family: inherit; padding: 0 8px; text-align: left; vertical-align: middle; box-sizing: border-box;">정보</td>
                    </tr>
                </tbody>
            </table>`
        },
        {
            id: 'v4-atom-image',
            name: 'Image',
            koName: '이미지 사진 첨부 업로드 파일 그림 png jpg',
            category: 'Shapes',
            icon: 'image',
            iconColor: '#00e5ff',
            width: '120px',
            height: '100px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 40px; height: 30px; background: rgba(0, 229, 255, 0.1); border: 1.6px solid rgba(0, 229, 255, 0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center;"><span class="material-icons-outlined" style="font-size: 18px; color: #00e5ff;">image</span></div>`,
            html: `<div class="v4-shape v4-shape-image" data-natural-width="120" data-natural-height="100" data-aspect-ratio="1.2" style="width: 100%; height: 100%; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23cbd5e1%22 stroke-width=%221.6%22><rect width=%2220%22 height=%2220%22 x=%222%22 y=%222%22 rx=%222%22 ry=%222%22/><circle cx=%228.5%22 cy=%228.5%22 r=%221.5%22/><path d=%22M21 15l-5-5L5 21%22/></svg>'); background-size: cover; background-position: center; background-repeat: no-repeat; box-sizing: border-box; border: 1.6px solid transparent;"></div>`
        },

        // --- Row 4: Frame & Decoration (Webpage, Pattern, Wave) ---
        {
            id: 'v4-shape-webpage',
            name: 'Webpage',
            koName: '웹페이지 브라우저 화면 창 홈페이지 사이트',
            category: 'Shapes',
            icon: 'web',
            iconColor: '#00e5ff',
            width: '160px',
            height: '120px',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div style="width: 38px; height: 28px; background: var(--v4-component-bg, rgb(255, 255, 255)); border: 1.6px solid var(--v4-border-color, rgb(200, 200, 200)); border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;"><div style="width: 100%; height: 7px; background: rgba(0, 0, 0, 0.05); border-bottom: 1px solid var(--v4-border-color, rgb(200, 200, 200)); display: flex; align-items: center; padding: 0 4px; gap: 2px;"><div style="width: 2.5px; height: 2.5px; border-radius: 50%; background: #ef4444;"></div><div style="width: 2.5px; height: 2.5px; border-radius: 50%; background: #eab308;"></div><div style="width: 2.5px; height: 2.5px; border-radius: 50%; background: #22c55e;"></div></div></div>`,
            html: `
            <div class="v4-shape v4-shape-webpage" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 8px; overflow: hidden; box-sizing: border-box;">
                <div class="v4-webpage-header" style="width: 100%; height: 26px; min-height: 26px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; background: #f0f0f0; border-bottom: 1.6px solid #c8c8c8; box-sizing: border-box; flex-shrink: 0; pointer-events: none; user-select: none;">
                    <div style="display: flex; gap: 5px; align-items: center; width: 40px; flex-shrink: 0;">
                        <div style="width: 7px; height: 7px; border-radius: 50%; background: #ef4444; opacity: 0.85;"></div>
                        <div style="width: 7px; height: 7px; border-radius: 50%; background: #eab308; opacity: 0.85;"></div>
                        <div style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e; opacity: 0.85;"></div>
                    </div>
                    <div class="v4-webpage-url-bar" style="flex: 1; max-width: 55%; height: 12px; border-radius: 6px; background: #ffffff; border: 1px solid #c8c8c8; margin: 0 auto;"></div>
                    <div style="width: 40px; flex-shrink: 0;"></div>
                </div>
                <div contenteditable="true" class="v4-editable-cell" style="flex: 1 1 auto; width: 100%; height: calc(100% - 26px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; color: #050505;"></div>
            </div>`
        },
        {
            id: 'v4-shape-pattern-grid',
            name: 'Pattern',
            koName: '패턴 격자 그리드 모눈종이',
            category: 'Shapes',
            icon: 'grid_4x4',
            iconColor: '#00e5ff',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            previewHtml: `<div class="v4-shape-pattern-grid" style="width: 40px; height: 30px; background: #ffffff; border: 1.6px solid #c8c8c8;"></div>`,
            html: `
            <div class="v4-shape v4-shape-pattern-grid" style="width: 100%; height: 100%; background: #ffffff; border: 1.6px solid #c8c8c8; display: flex; align-items: center; justify-content: center; color: #050505; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; color: #050505; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;"></div>
            </div>`
        },
        {
            id: 'v4-shape-wave',
            name: 'Wave',
            koName: '물결 웨이브 파도 구분선',
            category: 'Shapes',
            icon: 'waves',
            iconColor: '#00e5ff',
            cardStyle: 'background: rgba(0, 229, 255, 0.05); border: 1.6px solid rgba(0, 229, 255, 0.1) !important;',
            width: '360px',
            height: '20px',
            previewHtml: `<svg viewBox="0 0 100 20" preserveAspectRatio="none" style="width: 45px; height: 15px;"><polygon points="0,6 12.5,2 25,6 37.5,2 50,6 62.5,2 75,6 87.5,2 100,6 100,16 87.5,12 75,16 62.5,12 50,16 37.5,12 25,16 12.5,12 0,16" style="fill: #ffffff; stroke: #00e5ff; stroke-width: 1.6; vector-effect: non-scaling-stroke;" /></svg>`,
            html: `
            <div class="v4-shape v4-shape-wave" data-wave-dir="horizontal" style="width: 100%; height: 100%; background: transparent; border: none !important; display: flex; align-items: center; justify-content: center; color: #050505; overflow: visible; box-sizing: border-box; position: relative;">
                <svg viewBox="0 0 360 20" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: visible;">
                    <polygon points="0,6 45,2 90,6 135,2 180,6 225,2 270,6 315,2 360,6 360,16 315,12 270,16 225,12 180,16 135,12 90,16 45,12 0,16" style="fill: #ffffff; stroke: #c8c8c8; stroke-width: 1.6; vector-effect: non-scaling-stroke;" />
                </svg>
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px 10px; box-sizing: border-box; text-align: center; outline: none; font-weight: 400; font-size: 13px; font-family: inherit; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; z-index: 2; position: relative; color: #050505;"></div>
            </div>`
        }
    ],
    organisms: [
        {
            id: 'v4-premium-gnb',
            name: 'Black Pearl GNB',
            category: 'Organisms',
            previewHtml: `<div style="width: 100%; height: 10px; background: #000;"></div>`,
            html: `
            <nav class="premium-gnb" style="display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 80px; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.1); width: 100%; color: white; font-family: 'Inter', sans-serif; box-sizing: border-box;">
                <div style="display: flex; align-items: center; gap: 32px;">
                    <div style="font-size: 24px; font-weight: 900; letter-spacing: -1px;">LF<span style="color: #6366f1;">.</span></div>
                    <div style="display: flex; gap: 24px; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.7);">
                        <span>NEW</span>
                        <span>MEN</span>
                        <span>WOMEN</span>
                        <span>KIDS</span>
                        <span>SALE</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <span class="material-icons-outlined">search</span>
                    <span class="material-icons-outlined">person_outline</span>
                    <span class="material-icons-outlined" style="position: relative;">
                        shopping_bag
                        <span style="position: absolute; top: -4px; right: -6px; width: 14px; height: 14px; background: #6366f1; border-radius: 50%; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900;">2</span>
                    </span>
                </div>
            </nav>`
        }
    ],
    canvasBackgrounds: [
        {
            id: 'bg-ecommerce-ui',
            name: '이커머스 FRONT UI 개선',
            desc: '저채도 모노크롬, 상품/장바구니 와이어프레임 & 그리드 모티프',
            url: 'assets/illustrations/ecommerce_ui_bg.jpg',
            thumb: 'assets/illustrations/ecommerce_ui_bg.jpg',
            defaultOpacity: 1.0
        },
        {
            id: 'bg-admin-backend',
            name: '백엔드 / ADMIN 시스템 고도화',
            desc: '저채도 모노크롬, 어드민 대시보드 & 서버 API 아키텍처 모티프',
            url: 'assets/illustrations/admin_backend_bg.jpg',
            thumb: 'assets/illustrations/admin_backend_bg.jpg',
            defaultOpacity: 1.0
        }
    ],
    illustrations: (window.V4_COMPONENT_LIBRARY && Array.isArray(window.V4_COMPONENT_LIBRARY.illustrations))
        ? window.V4_COMPONENT_LIBRARY.illustrations
        : []
};
