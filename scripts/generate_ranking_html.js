const fs = require('fs');
const logos = JSON.parse(fs.readFileSync('data/p_lus0e/_logos.json', 'utf8'));

// Helper to create a standard Rect Shape component
function rectShape(id, left, top, width, height, bg, border, radius = '8px', zIndex = 101) {
    return `
        <!-- Rect Shape: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: ${bg}; border: 1.6px solid ${border}; border-radius: ${radius}; box-sizing: border-box;">
                <div class="v4-shape-text-content" style="width: 100%; height: 100%;"><p><br></p></div>
            </div>
        </div>`;
}

// Helper to create a standard Single-line Text Shape component
function textShape(id, left, top, width, height, contentHtml, fontSize = '13px', fontWeight = '400', color = '#334155', align = 'left', zIndex = 102) {
    return `
        <!-- Text Shape: ${id} -->
        <div id="${id}" class="lf-component v4-text-shape" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex}; --v4-text-adjust-y: 0px; --v4-text-shape-pad-y: 2px; min-width: unset !important; min-height: unset !important;">
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; display: block; text-align: ${align}; width: 100%; height: 100%; padding: 2px !important; box-sizing: border-box; line-height: 1.2;">
                ${contentHtml}
            </div>
        </div>`;
}

// Helper to create a Multi-line Flow Container Text component (Fixes word-wrap bug)
function multiLineText(id, left, top, width, height, contentHtml, fontSize = '13px', fontWeight = '400', color = '#334155', lineHeight = '1.5', zIndex = 102) {
    return `
        <!-- Multi-line Flow Text: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: transparent; border: 1.6px solid transparent; box-sizing: border-box;">
                <div class="v4-shape-text-content" style="width: 100%; height: 100%; text-align: left;">
                    <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; text-align: left; width: 100%; height: 100%; padding: 0 !important; box-sizing: border-box; white-space: normal !important; word-break: keep-all; line-height: ${lineHeight};">
                        <p style="margin: 0; white-space: normal !important; word-break: keep-all; line-height: ${lineHeight};">${contentHtml}</p>
                    </div>
                </div>
            </div>
        </div>`;
}

// Helper to create a standard Badge Component
function badgeShape(id, left, top, width, height, text, bg, border, textColor, fontSize = '12px', radius = '6px', zIndex = 102) {
    return `
        <!-- Badge: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: ${bg}; border: 1.6px solid ${border}; border-radius: ${radius}; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                <div class="v4-shape-text-content" style="width: 100%; text-align: center;">
                    <p><span style="font-size: ${fontSize}; font-weight: 700; color: ${textColor};">${text}</span></p>
                </div>
            </div>
        </div>`;
}

// Helper to create a standard Logo component
function logoShape(id, left, top, width, height, logoBase64, maskColor = '#0f172a', zIndex = 102) {
    return `
        <!-- Logo Shape: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};" data-resized="true">
            <div class="lf-icon v4-logo-img" style="width: 100%; height: 100%; box-sizing: border-box; padding: 2px !important; background-origin: content-box !important; background-clip: content-box !important; mask-origin: content-box !important; -webkit-mask-origin: content-box !important; mask-clip: content-box !important; -webkit-mask-clip: content-box !important; -webkit-mask-image: url('${logoBase64}'); mask-image: url('${logoBase64}'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; background-color: ${maskColor} !important; pointer-events: none;"></div>
        </div>`;
}

// Helper to create an SVG Icon component
function iconShape(id, left, top, width, height, svgInner, color = '#2563eb', zIndex = 102) {
    return `
        <!-- Icon Shape: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};">
            <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; background-image: none !important;">
                ${svgInner}
            </svg>
        </div>`;
}

let html = `<!DOCTYPE html>
<html lang="ko" style="--v4-text-color: #0f172a; --v4-font-size: 14px; --v4-font-weight: 400; --v4-font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; --v4-placeholder-color: #94a3b8;"><head>
    <meta charset="UTF-8">
    <title>시선닷컴 상품 랭킹 산정 룰 (Ranking Algorithm Policy)</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Noto+Sans+KR:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <link rel="stylesheet" as="style" crossorigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
    <style id="v4-typography-rules">
        :root {
            --v4-text-color: #0f172a;
            --v4-font-size: 14px;
            --v4-font-weight: 400;
            --v4-font-family: 'Pretendard Variable', 'Noto Sans KR', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --v4-primary: #2563eb;
            --v4-border: #e2e8f0;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            background: #0f172a;
            font-family: var(--v4-font-family);
            color: var(--v4-text-color);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }
        .canvas {
            width: 1600px;
            height: 900px;
            background: #f8fafc;
            position: relative;
            overflow: hidden;
            margin: 0 auto;
        }
        .lf-component {
            box-sizing: border-box;
            user-select: none;
        }
        .v4-shape {
            box-sizing: border-box;
            transition: border-color 0.15s ease;
        }
        .v4-editable-cell {
            font-family: var(--v4-font-family);
        }
        .v4-logo-img {
            display: block;
        }
    </style>
</head>
<body>
    <div class="canvas">
`;

// ==========================================
// 1. HEADER (Top: 20px, Left: 40px, W: 1520px, H: 60px)
// ==========================================
html += rectShape('hdr_bg', 40, 20, 1520, 60, '#0f172a', '#1e293b', '10px', 100);

// Header Icon
html += iconShape('hdr_icon', 60, 36, 28, 28, `
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
`, '#38bdf8', 102);

// Header Title & Subtitle
html += textShape('hdr_title', 98, 28, 480, 24, '<span style="font-weight: 800; color: #ffffff; font-size: 17px; letter-spacing: -0.02em;">시선닷컴 상품 랭킹 산정 룰 (Ranking Algorithm Policy)</span>', '17px', '800', '#ffffff');
html += textShape('hdr_sub', 98, 52, 480, 20, '<span style="color: #94a3b8; font-size: 13px;">3대 패션 브랜드(MICHAA · it MICHAA · E.B.M) 복합 랭킹 모델</span>', '13px', '400', '#94a3b8');

// Header Brand mini logos
html += rectShape('hdr_brand_bg1', 1100, 33, 64, 34, '#1e293b', '#334155', '6px', 101);
html += logoShape('hdr_logo_m', 1106, 36, 52, 28, logos.michaa, '#ffffff', 102);

html += rectShape('hdr_brand_bg2', 1176, 33, 64, 34, '#1e293b', '#334155', '6px', 101);
html += logoShape('hdr_logo_it', 1182, 36, 52, 28, logos.itmichaa, '#ffffff', 102);

html += rectShape('hdr_brand_bg3', 1252, 33, 64, 34, '#1e293b', '#334155', '6px', 101);
html += logoShape('hdr_logo_ebm', 1258, 36, 52, 28, logos.ebm, '#ffffff', 102);

html += badgeShape('hdr_tag', 1332, 33, 168, 34, 'ALGORITHM V3.0', '#1e293b', '#38bdf8', '#38bdf8', '12px', '6px', 102);


// ==========================================
// BLOCK 1: [1. 3대 브랜드 포트폴리오 (Brand Portfolio)]
// Top: 92px, Left: 40px, Width: 1520px, Height: 112px
// ==========================================
html += rectShape('b1_container', 40, 92, 1520, 112, '#ffffff', '#e2e8f0', '10px', 100);

// Block 1 Header Label
html += textShape('b1_lbl', 60, 104, 380, 22, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">1. 3대 브랜드 포트폴리오 &amp; 특성 정의</span>', '15px', '800', '#0f172a');
html += badgeShape('b1_tag', 1440, 102, 100, 24, '3 BRANDS', '#f1f5f9', '#cbd5e1', '#475569', '11px', '4px', 101);

// 3 Brand Cards (Left: 60, 552, 1044 / Width: 476 / Height: 60)
// Card 1: MICHAA
html += rectShape('b1_card1', 60, 134, 476, 60, '#f8fafc', '#e2e8f0', '8px', 101);
html += logoShape('b1_logo_m', 76, 139, 88, 48, logos.michaa, '#0f172a', 102);
html += multiLineText('b1_desc_m', 180, 140, 195, 46, '<span style="font-weight: 700; color: #0f172a; font-size: 13px;">프리미엄 럭셔리 라인</span><br><span style="color: #64748b; font-size: 12px;">고단가 하이엔드 아우터 중심</span>', '13px', '400', '#475569', '1.4', 102);
html += badgeShape('b1_price_m', 382, 144, 142, 38, '평균 50만 ~ 200만원', '#ffffff', '#cbd5e1', '#0f172a', '12px', '6px', 102);

// Card 2: it MICHAA
html += rectShape('b1_card2', 552, 134, 476, 60, '#f8fafc', '#e2e8f0', '8px', 101);
html += logoShape('b1_logo_it', 568, 139, 88, 48, logos.itmichaa, '#0f172a', 102);
html += multiLineText('b1_desc_it', 672, 140, 195, 46, '<span style="font-weight: 700; color: #0f172a; font-size: 13px;">영 &amp; 페미닌 컨템포러리</span><br><span style="color: #64748b; font-size: 12px;">대중적 볼륨 및 일상 룩 중심</span>', '13px', '400', '#475569', '1.4', 102);
html += badgeShape('b1_price_it', 874, 144, 142, 38, '평균 10만 ~ 50만원', '#ffffff', '#cbd5e1', '#0f172a', '12px', '6px', 102);

// Card 3: E.B.M
html += rectShape('b1_card3', 1044, 134, 476, 60, '#f8fafc', '#e2e8f0', '8px', 101);
html += logoShape('b1_logo_ebm', 1060, 139, 88, 48, logos.ebm, '#0f172a', 102);
html += multiLineText('b1_desc_ebm', 1164, 140, 195, 46, '<span style="font-weight: 700; color: #0f172a; font-size: 13px;">트렌디 캐주얼 스트릿</span><br><span style="color: #64748b; font-size: 12px;">빠른 신상 회전 및 트렌드 민감</span>', '13px', '400', '#475569', '1.4', 102);
html += badgeShape('b1_price_ebm', 1366, 144, 142, 38, '평균 10만 ~ 30만원', '#ffffff', '#cbd5e1', '#0f172a', '12px', '6px', 102);


// ==========================================
// BLOCK 2: [2. 6대 지표 가중치 매트릭스 (Core Weight Matrix - Total 100%)]
// Top: 216px, Left: 40px, Width: 1520px, Height: 308px
// *[가장 크고 중요한 메인 블럭]*
// ==========================================
html += rectShape('b2_container', 40, 216, 1520, 308, '#ffffff', '#2563eb', '10px', 100);

// Block 2 Header Label
html += textShape('b2_lbl', 60, 228, 480, 24, '<span style="font-weight: 800; color: #0f172a; font-size: 16px;">2. 6대 핵심 지표 가중치 매트릭스 (Core Weight Matrix - Total 100%)</span>', '16px', '800', '#0f172a');
html += badgeShape('b2_tag', 1410, 226, 130, 26, 'CORE MATRIX', '#eff6ff', '#bfdbfe', '#1d4ed8', '12px', '4px', 101);

// Left Donut & Total Summary Panel (Left: 60, Top: 260, Width: 260, Height: 250)
html += rectShape('b2_donut_bg', 60, 260, 260, 250, '#f8fafc', '#e2e8f0', '8px', 101);

// SVG Donut Infographic (Top: 270, Left: 125, W: 130, H: 130)
html += `
    <div id="b2_donut_svg" class="lf-component" style="position: absolute; top: 270px; left: 125px; width: 130px; height: 130px; z-index: 102;">
        <svg viewBox="0 0 120 120" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            <circle cx="60" cy="60" r="46" fill="none" stroke="#f1f5f9" stroke-width="14" />
            <!-- 35% GMV (#2563eb) : 101.1 -->
            <circle cx="60" cy="60" r="46" fill="none" stroke="#2563eb" stroke-width="14" stroke-dasharray="101.1 289" stroke-dashoffset="0" />
            <!-- 25% Vol (#0284c7) : 72.2 -->
            <circle cx="60" cy="60" r="46" fill="none" stroke="#0284c7" stroke-width="14" stroke-dasharray="72.2 289" stroke-dashoffset="-101.1" />
            <!-- 15% Cart (#0d9488) : 43.3 -->
            <circle cx="60" cy="60" r="46" fill="none" stroke="#0d9488" stroke-width="14" stroke-dasharray="43.3 289" stroke-dashoffset="-173.3" />
            <!-- 10% Wish (#e11d48) : 28.9 -->
            <circle cx="60" cy="60" r="46" fill="none" stroke="#e11d48" stroke-width="14" stroke-dasharray="28.9 289" stroke-dashoffset="-216.6" />
            <!-- 10% UV (#4f46e5) : 28.9 -->
            <circle cx="60" cy="60" r="46" fill="none" stroke="#4f46e5" stroke-width="14" stroke-dasharray="28.9 289" stroke-dashoffset="-245.5" />
            <!-- 5% PV (#64748b) : 14.5 -->
            <circle cx="60" cy="60" r="46" fill="none" stroke="#64748b" stroke-width="14" stroke-dasharray="14.5 289" stroke-dashoffset="-274.4" />
        </svg>
    </div>
`;
// Donut Center Text (Clearly separated vertically so they never collide!)
html += textShape('b2_donut_val', 130, 314, 120, 26, '<span style="font-weight: 900; color: #0f172a; font-size: 22px;">100%</span>', '22px', '900', '#0f172a', 'center');
html += textShape('b2_donut_sub', 130, 342, 120, 18, '<span style="font-weight: 800; color: #64748b; font-size: 11px; letter-spacing: 0.05em;">TOTAL</span>', '11px', '800', '#64748b', 'center');

// Donut Bottom Summary Text (Comfortable 12.5px font)
html += multiLineText('b2_donut_text', 74, 412, 232, 90, `
    <span style="color: #1e3a8a; font-weight: 700;">• 결제매출 기여: 35%</span><br>
    <span style="color: #0369a1; font-weight: 700;">• 대중성 검증: 25%</span><br>
    <span style="color: #0f766e; font-weight: 700;">• 고관여 의향: 25%</span> (장바구니+위시)<br>
    <span style="color: #4338ca; font-weight: 700;">• 트래픽 총량: 15%</span> (UV+PV)
`, '12.5px', '400', '#334155', '1.6', 102);

// Right 3 x 2 Matrix of 6 Metrics (W: 384px, H: 120px)
// Col 1: Left: 334, Col 2: Left: 730, Col 3: Left: 1126
// Row 1: Top: 260, Row 2: Top: 390

// Metric 1: GMV (결제금액) - 35%
html += rectShape('b2_m1_bg', 334, 260, 384, 120, '#eff6ff', '#93c5fd', '8px', 101);
html += iconShape('b2_m1_icon', 350, 272, 28, 28, '<rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>', '#2563eb', 102);
html += textShape('b2_m1_title', 386, 275, 200, 24, '<span style="font-weight: 800; color: #1e3a8a; font-size: 15px;">결제금액 (GMV)</span>', '15px', '800', '#1e3a8a');
html += textShape('b2_m1_pct', 618, 268, 86, 32, '<span style="font-weight: 900; color: #2563eb; font-size: 26px;">35%</span>', '26px', '900', '#2563eb', 'right');
html += multiLineText('b2_m1_desc', 350, 314, 354, 58, '• 매출 기여도 인정 · 고단가 코트/원피스 정당 가치 반영<br>• log10 정규화 적용으로 초고가 상품의 랭킹 왜곡 방지', '13px', '400', '#334155', '1.5', 102);

// Metric 2: Order Volume (주문수량) - 25%
html += rectShape('b2_m2_bg', 730, 260, 384, 120, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m2_icon', 746, 272, 28, 28, '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>', '#0284c7', 102);
html += textShape('b2_m2_title', 782, 275, 200, 24, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">주문수량 (Order Volume)</span>', '15px', '800', '#0f172a');
html += textShape('b2_m2_pct', 1014, 268, 86, 32, '<span style="font-weight: 900; color: #0284c7; font-size: 26px;">25%</span>', '26px', '900', '#0284c7', 'right');
html += multiLineText('b2_m2_desc', 746, 314, 354, 58, '• 실구매 고객의 대중적 선호도 및 판매 볼륨 반영<br>• 저가 상품의 단순 수량 랭킹 독점 방지 및 균형 유지', '13px', '400', '#334155', '1.5', 102);

// Metric 3: Cart Adds (장바구니 전환) - 15%
html += rectShape('b2_m3_bg', 1126, 260, 384, 120, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m3_icon', 1142, 272, 28, 28, '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>', '#0d9488', 102);
html += textShape('b2_m3_title', 1178, 275, 200, 24, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">장바구니 담기 (Cart Adds)</span>', '15px', '800', '#0f172a');
html += textShape('b2_m3_pct', 1410, 268, 86, 32, '<span style="font-weight: 900; color: #0d9488; font-size: 26px;">15%</span>', '26px', '900', '#0d9488', 'right');
html += multiLineText('b2_m3_desc', 1142, 314, 354, 58, '• 고관여 구매 직접 전환 의향(High Intent) 즉각 반영<br>• 신규 런칭 상품 및 시즌 주력 아이템의 선행 반응 검증', '13px', '400', '#334155', '1.5', 102);

// Metric 4: Wishlist (위시리스트 저장) - 10%
html += rectShape('b2_m4_bg', 334, 390, 384, 120, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m4_icon', 350, 402, 28, 28, '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>', '#e11d48', 102);
html += textShape('b2_m4_title', 386, 405, 200, 24, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">위시리스트 (Wishlist)</span>', '15px', '800', '#0f172a');
html += textShape('b2_m4_pct', 618, 398, 86, 32, '<span style="font-weight: 900; color: #e11d48; font-size: 26px;">10%</span>', '26px', '900', '#e11d48', 'right');
html += multiLineText('b2_m4_desc', 350, 444, 354, 58, '• 잠재 고객 선호도 및 브랜드 찜 중심 관심도 집계<br>• 시즌 프리뷰 오픈 시 고객 관심 사전 예측 지표', '13px', '400', '#334155', '1.5', 102);

// Metric 5: UV (순방문자) - 10%
html += rectShape('b2_m5_bg', 730, 390, 384, 120, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m5_icon', 746, 402, 28, 28, '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', '#4f46e5', 102);
html += textShape('b2_m5_title', 782, 405, 200, 24, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">순방문자 UV (Unique Visitors)</span>', '15px', '800', '#0f172a');
html += textShape('b2_m5_pct', 1014, 398, 86, 32, '<span style="font-weight: 900; color: #4f46e5; font-size: 26px;">10%</span>', '26px', '900', '#4f46e5', 'right');
html += multiLineText('b2_m5_desc', 746, 444, 354, 58, '• 중복 유입을 배제한 순수 모객 파워 측정<br>• 매크로 및 어뷰징 트래픽 원천 필터링 및 공정성 확보', '13px', '400', '#334155', '1.5', 102);

// Metric 6: PV (페이지뷰) - 5%
html += rectShape('b2_m6_bg', 1126, 390, 384, 120, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m6_icon', 1142, 402, 28, 28, '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>', '#64748b', 102);
html += textShape('b2_m6_title', 1178, 405, 200, 24, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">페이지뷰 PV (Page Views)</span>', '15px', '800', '#0f172a');
html += textShape('b2_m6_pct', 1410, 398, 86, 32, '<span style="font-weight: 900; color: #64748b; font-size: 26px;">5%</span>', '26px', '900', '#64748b', 'right');
html += multiLineText('b2_m6_desc', 1142, 444, 354, 58, '• 쇼핑몰 내 관심 트래픽 총량 측정 (보조 지표)<br>• 1인 1일 최대 3회 캡(Cap) 적용으로 어뷰징 조작 차단', '13px', '400', '#334155', '1.5', 102);


// ==========================================
// BLOCK 3: [3. 신상품 라이프사이클 부스팅 (New Product Boosting Engine)]
// Top: 536px, Left: 40px, Width: 1520px, Height: 144px
// ==========================================
html += rectShape('b3_container', 40, 536, 1520, 144, '#ffffff', '#e2e8f0', '10px', 100);

// Block 3 Header Label
html += textShape('b3_lbl', 60, 548, 450, 22, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">3. 신상품 라이프사이클 부스팅 (New Product Boosting Engine)</span>', '15px', '800', '#0f172a');
html += badgeShape('b3_tag', 1390, 546, 150, 24, 'COLD-START SOLVER', '#f0fdf4', '#bbf7d0', '#166534', '11px', '4px', 101);

// Left Summary Box (Left: 60, Top: 576, Width: 330, Height: 92)
html += rectShape('b3_summary_bg', 60, 576, 330, 92, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b3_sum_icon', 74, 586, 22, 22, '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>', '#2563eb', 102);
html += textShape('b3_sum_title', 104, 587, 270, 22, '<span style="font-weight: 800; color: #0f172a; font-size: 13.5px;">콜드스타트 극복 원칙</span>', '13.5px', '800', '#0f172a');
html += multiLineText('b3_sum_desc', 74, 614, 305, 50, '실적 데이터가 없는 신규 패션 상품에 탐색 노출 기회를 집중 부여하여 고객 반응을 신속하게 발굴합니다.<br><span style="color: #64748b; font-size: 11.5px;">※ 30일 경과 후: 정상 배율(1.00x) 자동 전환</span>', '12.5px', '400', '#475569', '1.45', 102);

// Right 3-Stage Boosting Horizontal Cards (Left: 406, 782, 1158 / Width: 360 / Height: 92)
// Stage 1: 1~7일차 (Super Boost)
html += rectShape('b3_c1_bg', 406, 576, 360, 92, '#eff6ff', '#bfdbfe', '8px', 101);
html += textShape('b3_c1_period', 422, 586, 210, 22, '<span style="font-weight: 800; color: #1e40af; font-size: 13px;">출시 1 ~ 7일차 · 슈퍼 부스트</span>', '13px', '800', '#1e40af');
html += textShape('b3_c1_val', 646, 582, 104, 34, '<span style="font-weight: 900; color: #2563eb; font-size: 26px;">× 1.50</span>', '26px', '900', '#2563eb', 'right');
html += multiLineText('b3_c1_desc', 422, 620, 330, 42, '<b>초기 노출 극대화</b> · 런칭 초기 탐색 노출 집중 부여로 고객 클릭 및 유입 모멘텀 형성', '12.5px', '400', '#1e3a8a', '1.4', 102);

// Stage 2: 8~14일차 (Growth Boost)
html += rectShape('b3_c2_bg', 782, 576, 360, 92, '#f0fdf4', '#bbf7d0', '8px', 101);
html += textShape('b3_c2_period', 798, 586, 210, 22, '<span style="font-weight: 800; color: #166534; font-size: 13px;">출시 8 ~ 14일차 · 성장 부스트</span>', '13px', '800', '#166534');
html += textShape('b3_c2_val', 1022, 582, 104, 34, '<span style="font-weight: 900; color: #16a34a; font-size: 26px;">× 1.30</span>', '26px', '900', '#16a34a', 'right');
html += multiLineText('b3_c2_desc', 798, 620, 330, 42, '<b>전환 반응 검증</b> · 장바구니 담기 및 위시리스트 저장 등 실질 구매 의향 축적', '12.5px', '400', '#14532d', '1.4', 102);

// Stage 3: 15~30일차 (Landing Boost)
html += rectShape('b3_c3_bg', 1158, 576, 360, 92, '#f8fafc', '#cbd5e1', '8px', 101);
html += textShape('b3_c3_period', 1174, 586, 210, 22, '<span style="font-weight: 800; color: #334155; font-size: 13px;">출시 15 ~ 30일차 · 안착 부스트</span>', '13px', '800', '#334155');
html += textShape('b3_c3_val', 1398, 582, 104, 34, '<span style="font-weight: 900; color: #0f172a; font-size: 26px;">× 1.15</span>', '26px', '900', '#0f172a', 'right');
html += multiLineText('b3_c3_desc', 1174, 620, 330, 42, '<b>자연 랭킹 전환</b> · 누적 실적 기반 정상 랭킹으로 안착 (30일 경과 후 1.00x)', '12.5px', '400', '#475569', '1.4', 102);


// ==========================================
// BLOCK 4: [4. 단순 판매량 집계 한계 극복 (Before vs After) & 종합 랭킹 점수 승산 수식]
// Top: 692px, Left: 40px, Width: 1520px, Height: 188px
// ==========================================
html += rectShape('b4_container', 40, 692, 1520, 188, '#ffffff', '#e2e8f0', '10px', 100);

// Block 4 Header Label
html += textShape('b4_lbl', 60, 704, 550, 22, '<span style="font-weight: 800; color: #0f172a; font-size: 15px;">4. 단순 판매량 집계 한계 극복 (Before / After) &amp; 종합 랭킹 점수 승산 수식</span>', '15px', '800', '#0f172a');
html += badgeShape('b4_tag', 1380, 702, 160, 24, 'SOLUTION & FORMULA', '#f1f5f9', '#cbd5e1', '#334155', '11px', '4px', 101);

// Left: Before vs After Comparison Box (Left: 60, Top: 732, Width: 640, Height: 136)
// Top Row: BEFORE
html += rectShape('b4_bef_bg', 60, 732, 640, 64, '#fef2f2', '#fecaca', '8px', 101);
html += textShape('b4_bef_badge', 74, 739, 280, 20, '<span style="font-weight: 800; color: #b91c1c; font-size: 12.5px;">⚠️ BEFORE (현행 단순 주문수 집계 시 왜곡)</span>', '12.5px', '800', '#b91c1c');
html += multiLineText('b4_bef_text', 74, 762, 612, 30, '• 3만원 기본 티셔츠 100건 판매 ➔ <b>랭킹 1위 독점 (저가 박리다매 왜곡)</b><br>• 90만원 미샤 코트 10건(매출 900만) 판매 ➔ <b>랭킹 48위 탈락 (고가 패션 소외)</b>', '12px', '400', '#991b1b', '1.4', 102);

// Bottom Row: AFTER
html += rectShape('b4_aft_bg', 60, 804, 640, 64, '#f0fdf4', '#bbf7d0', '8px', 101);
html += textShape('b4_aft_badge', 74, 811, 280, 20, '<span style="font-weight: 800; color: #15803d; font-size: 12.5px;">✅ AFTER (신규 6대 복합 랭킹 룰 적용 시)</span>', '12.5px', '800', '#15803d');
html += multiLineText('b4_aft_text', 74, 834, 612, 30, '• 90만원 미샤 코트: 매출(35%) + 장바구니(15%) 결합 반영 ➔ <b>종합 2위 안착</b><br>• 3만원 티셔츠: 주문수량(25%) 우세하나 Log 정규화 반영 ➔ <b>종합 5위 균형</b>', '12px', '400', '#166534', '1.4', 102);

// Right: Multiplicative Score Formula Box (Left: 716, Top: 732, Width: 824, Height: 136)
html += rectShape('b4_formula_bg', 716, 732, 824, 136, '#0f172a', '#334155', '8px', 101);

// Formula Box Header
html += textShape('b4_f_title', 736, 742, 450, 22, '<span style="font-weight: 800; color: #38bdf8; font-size: 13.5px;">📐 종합 랭킹 점수 승산 수식 (Multiplicative Scoring Model)</span>', '13.5px', '800', '#38bdf8');
html += badgeShape('b4_f_badge', 1430, 740, 94, 22, 'V3.0 MODEL', '#1e293b', '#38bdf8', '#38bdf8', '11px', '4px', 102);

// Main Formula Banner (Dark Navy Accent)
html += rectShape('b4_f_bar', 736, 768, 784, 42, '#1e293b', '#475569', '6px', 102);
html += textShape('b4_f_eq', 750, 778, 756, 24, '<span style="font-weight: 800; color: #38bdf8; font-size: 14.5px; letter-spacing: 0.02em;">Total Score = Base Score (6대 복합 가중치 100%) × F_freshness (신상품 부스팅)</span>', '14.5px', '800', '#38bdf8', 'center');

// Detail Formula & Explanation
html += multiLineText('b4_f_detail', 740, 818, 780, 46, `
    <span style="color: #cbd5e1; font-weight: 600;">• Base Score = 0.35·S_rev + 0.25·S_vol + 0.15·S_cart + 0.10·S_wish + 0.10·S_uv + 0.05·S_pv</span><br>
    <span style="color: #94a3b8;">• F_freshness: 출시 1~7일차(<b>1.50x</b>) ➔ 8~14일차(<b>1.30x</b>) ➔ 15~30일차(<b>1.15x</b>) ➔ 30일 경과 후(<b>1.00x</b>) 승산 적용</span>
`, '12px', '400', '#94a3b8', '1.5', 102);


// Closing Canvas & Body
html += `
    </div>
</body>
</html>
`;

fs.writeFileSync('data/p_lus0e/10_Product_Ranking_Rules_850.html', html);
console.log('Precision 4-Tier Horizontal Layout HTML successfully generated! Length:', html.length);
