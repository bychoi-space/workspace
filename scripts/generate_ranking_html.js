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
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; display: block; text-align: ${align}; width: 100%; height: 100%; padding: 2px !important; box-sizing: border-box;">
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
function badgeShape(id, left, top, width, height, text, bg, border, textColor, fontSize = '11px', radius = '6px', zIndex = 102) {
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
// 1. HEADER (Top: 20px, Left: 40px, W: 1520px, H: 54px)
// ==========================================
html += rectShape('hdr_bg', 40, 20, 1520, 54, '#0f172a', '#1e293b', '10px', 100);

// Header Icon
html += iconShape('hdr_icon', 56, 33, 28, 28, `
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
`, '#38bdf8', 102);

// Header Title & Subtitle
html += textShape('hdr_title', 94, 27, 450, 24, '<span style="font-weight: 800; color: #ffffff; font-size: 16px; letter-spacing: -0.02em;">시선닷컴 상품 랭킹 산정 룰 (Ranking Algorithm Policy)</span>', '16px', '800', '#ffffff');
html += textShape('hdr_sub', 94, 49, 450, 18, '<span style="color: #94a3b8; font-size: 11px;">3대 패션 브랜드(MICHAA · it MICHAA · E.B.M) 복합 랭킹 모델</span>', '11px', '400', '#94a3b8');

// Header Brand mini logos
html += rectShape('hdr_brand_bg1', 1140, 31, 60, 32, '#1e293b', '#334155', '6px', 101);
html += logoShape('hdr_logo_m', 1145, 34, 50, 26, logos.michaa, '#ffffff', 102);

html += rectShape('hdr_brand_bg2', 1210, 31, 60, 32, '#1e293b', '#334155', '6px', 101);
html += logoShape('hdr_logo_it', 1215, 34, 50, 26, logos.itmichaa, '#ffffff', 102);

html += rectShape('hdr_brand_bg3', 1280, 31, 60, 32, '#1e293b', '#334155', '6px', 101);
html += logoShape('hdr_logo_ebm', 1285, 34, 50, 26, logos.ebm, '#ffffff', 102);

html += badgeShape('hdr_tag', 1360, 31, 140, 32, 'ALGORITHM V3.0', '#1e293b', '#38bdf8', '#38bdf8', '11px', '6px', 102);


// ==========================================
// BLOCK 1: [1. 3대 브랜드 포트폴리오 (Brand Portfolio)]
// Top: 86px, Left: 40px, Width: 1520px, Height: 104px
// *'브랜드 객단가 정규화' 완전 삭제*
// ==========================================
html += rectShape('b1_container', 40, 86, 1520, 104, '#ffffff', '#e2e8f0', '10px', 100);

// Block 1 Header Label
html += textShape('b1_lbl', 56, 96, 320, 20, '<span style="font-weight: 700; color: #0f172a; font-size: 13px;">1. 3대 브랜드 포트폴리오 &amp; 특성 정의</span>', '13px', '700', '#0f172a');
html += badgeShape('b1_tag', 1450, 94, 90, 20, '3 BRANDS', '#f1f5f9', '#cbd5e1', '#475569', '10px', '4px', 101);

// 3 Brand Horizontal Cards (Left: 56, 550, 1044 / Width: 476 / Height: 60)
// Card 1: MICHAA
html += rectShape('b1_card1', 56, 120, 476, 60, '#f8fafc', '#e2e8f0', '8px', 101);
html += logoShape('b1_logo_m', 68, 126, 95, 46, logos.michaa, '#0f172a', 102);
html += badgeShape('b1_price_m', 356, 126, 164, 22, '평균 50만 ~ 200만원', '#f1f5f9', '#cbd5e1', '#0f172a', '11px', '4px', 102);
html += multiLineText('b1_desc_m', 175, 127, 175, 45, '<b>프리미엄 럭셔리 라인</b><br>고단가 하이엔드 아우터 중심', '11px', '400', '#475569', '1.4', 102);

// Card 2: it MICHAA
html += rectShape('b1_card2', 550, 120, 476, 60, '#f8fafc', '#e2e8f0', '8px', 101);
html += logoShape('b1_logo_it', 562, 126, 95, 46, logos.itmichaa, '#0f172a', 102);
html += badgeShape('b1_price_it', 850, 126, 164, 22, '평균 10만 ~ 50만원', '#f1f5f9', '#cbd5e1', '#0f172a', '11px', '4px', 102);
html += multiLineText('b1_desc_it', 669, 127, 175, 45, '<b>영 &amp; 페미닌 컨템포러리</b><br>대중적 볼륨 및 일상 룩 중심', '11px', '400', '#475569', '1.4', 102);

// Card 3: E.B.M
html += rectShape('b1_card3', 1044, 120, 476, 60, '#f8fafc', '#e2e8f0', '8px', 101);
html += logoShape('b1_logo_ebm', 1056, 126, 95, 46, logos.ebm, '#0f172a', 102);
html += badgeShape('b1_price_ebm', 1344, 126, 164, 22, '평균 10만 ~ 30만원', '#f1f5f9', '#cbd5e1', '#0f172a', '11px', '4px', 102);
html += multiLineText('b1_desc_ebm', 1163, 127, 175, 45, '<b>트렌디 캐주얼 스트릿</b><br>빠른 신상 회전 및 트렌드 민감', '11px', '400', '#475569', '1.4', 102);


// ==========================================
// BLOCK 2: [2. 6대 지표 가중치 매트릭스 (Core Weight Matrix - Total 100%)]
// Top: 202px, Left: 40px, Width: 1520px, Height: 300px
// *[가장 크고 중요한 메인 블럭]*
// ==========================================
html += rectShape('b2_container', 40, 202, 1520, 300, '#ffffff', '#2563eb', '10px', 100);

// Block 2 Header Label
html += textShape('b2_lbl', 56, 212, 450, 22, '<span style="font-weight: 800; color: #0f172a; font-size: 14px;">2. 6대 핵심 지표 가중치 매트릭스 (Core Weight Matrix - Total 100%)</span>', '14px', '800', '#0f172a');
html += badgeShape('b2_tag', 1420, 210, 120, 22, 'CORE MATRIX', '#eff6ff', '#bfdbfe', '#1d4ed8', '11px', '4px', 101);

// Left Donut & Total Summary Panel (Left: 56, Top: 242, Width: 260, Height: 246)
html += rectShape('b2_donut_bg', 56, 242, 260, 246, '#f8fafc', '#e2e8f0', '8px', 101);

// SVG Donut Infographic (Center at X: 186, Y: 330)
html += `
    <div id="b2_donut_svg" class="lf-component" style="position: absolute; top: 252px; left: 126px; width: 120px; height: 120px; z-index: 102;">
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
// Donut Center Text
html += textShape('b2_donut_val', 136, 290, 100, 26, '<span style="font-weight: 900; color: #0f172a; font-size: 20px;">100%</span>', '20px', '900', '#0f172a', 'center');
html += textShape('b2_donut_sub', 136, 314, 100, 16, '<span style="font-weight: 700; color: #64748b; font-size: 9px; letter-spacing: 0.05em;">TOTAL WEIGHTS</span>', '9px', '700', '#64748b', 'center');

// Donut Bottom Summary Text
html += multiLineText('b2_donut_text', 70, 386, 232, 92, `
    <span style="color: #1e3a8a; font-weight: 700;">• 결제매출 기여: 35%</span><br>
    <span style="color: #0369a1; font-weight: 700;">• 대중성 검증: 25%</span><br>
    <span style="color: #0f766e; font-weight: 700;">• 고관여 의향: 25%</span> (장바구니+위시)<br>
    <span style="color: #4338ca; font-weight: 700;">• 트래픽 총량: 15%</span> (UV+PV)
`, '11px', '400', '#334155', '1.6', 102);

// Right 3 x 2 Matrix of 6 Metrics
// Col 1: Left: 330, Col 2: Left: 724, Col 3: Left: 1118 (Width: 380 each)
// Row 1: Top: 242, Row 2: Top: 372 (Height: 116 each)

// Metric 1: GMV (결제금액) - 35%
html += rectShape('b2_m1_bg', 330, 242, 380, 116, '#eff6ff', '#93c5fd', '8px', 101);
html += iconShape('b2_m1_icon', 346, 256, 24, 24, '<rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>', '#2563eb', 102);
html += textShape('b2_m1_title', 378, 257, 180, 22, '<span style="font-weight: 700; color: #1e3a8a; font-size: 14px;">결제금액 (GMV)</span>', '14px', '700', '#1e3a8a');
html += textShape('b2_m1_pct', 620, 252, 76, 28, '<span style="font-weight: 900; color: #2563eb; font-size: 22px;">35%</span>', '22px', '900', '#2563eb', 'right');
html += multiLineText('b2_m1_desc', 346, 288, 350, 60, '• 매출 기여도 인정 · 고가 아우터/원피스 정당 가치 반영<br>• log10 정규화 적용으로 초고가 왜곡 방지 및 신뢰도 확보', '12px', '400', '#334155', '1.5', 102);

// Metric 2: Order Volume (주문수량) - 25%
html += rectShape('b2_m2_bg', 724, 242, 380, 116, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m2_icon', 740, 256, 24, 24, '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>', '#0284c7', 102);
html += textShape('b2_m2_title', 772, 257, 180, 22, '<span style="font-weight: 700; color: #0f172a; font-size: 14px;">주문수량 (Order Volume)</span>', '14px', '700', '#0f172a');
html += textShape('b2_m2_pct', 1014, 252, 76, 28, '<span style="font-weight: 900; color: #0284c7; font-size: 22px;">25%</span>', '22px', '900', '#0284c7', 'right');
html += multiLineText('b2_m2_desc', 740, 288, 350, 60, '• 실구매 고객 대중성 검증 및 판매 볼륨 반영<br>• 저가 티셔츠의 단순 수량 랭킹 독점 방지 및 균형 유지', '12px', '400', '#334155', '1.5', 102);

// Metric 3: Cart Adds (장바구니 전환) - 15%
html += rectShape('b2_m3_bg', 1118, 242, 380, 116, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m3_icon', 1134, 256, 24, 24, '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>', '#0d9488', 102);
html += textShape('b2_m3_title', 1166, 257, 180, 22, '<span style="font-weight: 700; color: #0f172a; font-size: 14px;">장바구니 담기 (Cart Adds)</span>', '14px', '700', '#0f172a');
html += textShape('b2_m3_pct', 1408, 252, 76, 28, '<span style="font-weight: 900; color: #0d9488; font-size: 22px;">15%</span>', '22px', '900', '#0d9488', 'right');
html += multiLineText('b2_m3_desc', 1134, 288, 350, 60, '• 고관여 구매 직접 전환 의향(High Intent) 즉각 반영<br>• 신규 런칭 상품 및 시즌 주력 상품의 선행 반응 검증', '12px', '400', '#334155', '1.5', 102);

// Metric 4: Wishlist (위시리스트 저장) - 10%
html += rectShape('b2_m4_bg', 330, 372, 380, 116, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m4_icon', 346, 386, 24, 24, '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>', '#e11d48', 102);
html += textShape('b2_m4_title', 378, 387, 180, 22, '<span style="font-weight: 700; color: #0f172a; font-size: 14px;">위시리스트 (Wishlist)</span>', '14px', '700', '#0f172a');
html += textShape('b2_m4_pct', 620, 382, 76, 28, '<span style="font-weight: 900; color: #e11d48; font-size: 22px;">10%</span>', '22px', '900', '#e11d48', 'right');
html += multiLineText('b2_m4_desc', 346, 418, 350, 60, '• 잠재 고객 선호도 및 브랜드 찜 중심 관심도 집계<br>• 시즌 프리뷰 오픈 시 고객 관심 사전 예측 지표', '12px', '400', '#334155', '1.5', 102);

// Metric 5: UV (순방문자) - 10%
html += rectShape('b2_m5_bg', 724, 372, 380, 116, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m5_icon', 740, 386, 24, 24, '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', '#4f46e5', 102);
html += textShape('b2_m5_title', 772, 387, 180, 22, '<span style="font-weight: 700; color: #0f172a; font-size: 14px;">순방문자 UV (Unique Visitors)</span>', '14px', '700', '#0f172a');
html += textShape('b2_m5_pct', 1014, 382, 76, 28, '<span style="font-weight: 900; color: #4f46e5; font-size: 22px;">10%</span>', '22px', '900', '#4f46e5', 'right');
html += multiLineText('b2_m5_desc', 740, 418, 350, 60, '• 단일 유저 중복 유입을 배제한 순수 모객 파워 측정<br>• 매크로 및 어뷰징 트래픽 원천 필터링 및 공정성 확보', '12px', '400', '#334155', '1.5', 102);

// Metric 6: PV (페이지뷰) - 5%
html += rectShape('b2_m6_bg', 1118, 372, 380, 116, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b2_m6_icon', 1134, 386, 24, 24, '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>', '#64748b', 102);
html += textShape('b2_m6_title', 1166, 387, 180, 22, '<span style="font-weight: 700; color: #0f172a; font-size: 14px;">페이지뷰 PV (Page Views)</span>', '14px', '700', '#0f172a');
html += textShape('b2_m6_pct', 1408, 382, 76, 28, '<span style="font-weight: 900; color: #64748b; font-size: 22px;">5%</span>', '22px', '900', '#64748b', 'right');
html += multiLineText('b2_m6_desc', 1134, 418, 350, 60, '• 쇼핑몰 내 관심 트래픽 총량 측정 (보조 지표)<br>• 1인 1일 최대 3회 캡(Cap) 적용으로 어뷰징 조작 차단', '12px', '400', '#334155', '1.5', 102);


// ==========================================
// BLOCK 3: [3. 신상품 라이프사이클 부스팅 (New Product Boosting Engine)]
// Top: 514px, Left: 40px, Width: 1520px, Height: 140px
// *[PHASE 2 시간 감쇠 완전히 삭제, 3단계 부스팅에 집중]*
// ==========================================
html += rectShape('b3_container', 40, 514, 1520, 140, '#ffffff', '#e2e8f0', '10px', 100);

// Block 3 Header Label
html += textShape('b3_lbl', 56, 524, 450, 20, '<span style="font-weight: 700; color: #0f172a; font-size: 13px;">3. 신상품 라이프사이클 부스팅 (New Product Boosting Engine)</span>', '13px', '700', '#0f172a');
html += badgeShape('b3_tag', 1410, 522, 130, 20, 'COLD-START SOLVER', '#f0fdf4', '#bbf7d0', '#166534', '10px', '4px', 101);

// Left Summary Box (Left: 56, Top: 548, Width: 330, Height: 94)
html += rectShape('b3_summary_bg', 56, 548, 330, 94, '#f8fafc', '#e2e8f0', '8px', 101);
html += iconShape('b3_sum_icon', 68, 558, 20, 20, '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>', '#2563eb', 102);
html += textShape('b3_sum_title', 94, 559, 280, 20, '<span style="font-weight: 700; color: #0f172a; font-size: 12px;">콜드스타트 극복 원칙</span>', '12px', '700', '#0f172a');
html += multiLineText('b3_sum_desc', 68, 584, 305, 52, '실적 데이터가 전무한 신규 패션 상품에 탐색 노출 기회를 집중 부여하여 고객 선호도를 신속 발굴합니다.<br>※ 30일 경과 후: 정상 배율(1.00x)로 자동 전환', '11px', '400', '#475569', '1.4', 102);

// Right 3-Stage Boosting Horizontal Cards (Left: 402, 778, 1154 / Width: 360 / Height: 94)
// Stage 1: 1~7일차 (Super Boost)
html += rectShape('b3_c1_bg', 402, 548, 360, 94, '#eff6ff', '#bfdbfe', '8px', 101);
html += textShape('b3_c1_period', 416, 556, 200, 18, '<span style="font-weight: 700; color: #1e40af; font-size: 11px;">출시 1 ~ 7일차 · 슈퍼 부스트</span>', '11px', '700', '#1e40af');
html += textShape('b3_c1_val', 642, 552, 106, 32, '<span style="font-weight: 900; color: #2563eb; font-size: 24px;">× 1.50</span>', '24px', '900', '#2563eb', 'right');
html += multiLineText('b3_c1_desc', 416, 586, 332, 50, '<b>초기 노출 극대화</b><br>런칭 초기 탐색 노출 집중 부여로 고객 클릭 및 유입 모멘텀 형성', '11px', '400', '#1e3a8a', '1.4', 102);

// Stage 2: 8~14일차 (Growth Boost)
html += rectShape('b3_c2_bg', 778, 548, 360, 94, '#f0fdf4', '#bbf7d0', '8px', 101);
html += textShape('b3_c2_period', 792, 556, 200, 18, '<span style="font-weight: 700; color: #166534; font-size: 11px;">출시 8 ~ 14일차 · 성장 부스트</span>', '11px', '700', '#166534');
html += textShape('b3_c2_val', 1018, 552, 106, 32, '<span style="font-weight: 900; color: #16a34a; font-size: 24px;">× 1.30</span>', '24px', '900', '#16a34a', 'right');
html += multiLineText('b3_c2_desc', 792, 586, 332, 50, '<b>전환 반응 검증</b><br>장바구니 담기 및 위시리스트 저장 등 실질적 구매 의향 데이터 축적', '11px', '400', '#14532d', '1.4', 102);

// Stage 3: 15~30일차 (Landing Boost)
html += rectShape('b3_c3_bg', 1154, 548, 360, 94, '#f8fafc', '#cbd5e1', '8px', 101);
html += textShape('b3_c3_period', 1168, 556, 200, 18, '<span style="font-weight: 700; color: #334155; font-size: 11px;">출시 15 ~ 30일차 · 안착 부스트</span>', '11px', '700', '#334155');
html += textShape('b3_c3_val', 1394, 552, 106, 32, '<span style="font-weight: 900; color: #0f172a; font-size: 24px;">× 1.15</span>', '24px', '900', '#0f172a', 'right');
html += multiLineText('b3_c3_desc', 1168, 586, 332, 50, '<b>자연 랭킹 전환</b><br>누적 실적 기반 정상 랭킹으로 안착 (30일 경과 후 1.00x 일반 랭킹)', '11px', '400', '#475569', '1.4', 102);


// ==========================================
// BLOCK 4: [4. 단순 판매량 집계 한계 극복 (Before vs After) & 종합 랭킹 점수 승산 수식]
// Top: 666px, Left: 40px, Width: 1520px, Height: 194px
// *[단순 Before/After 요약 + 간소화된 종합 승산 수식]*
// ==========================================
html += rectShape('b4_container', 40, 666, 1520, 194, '#ffffff', '#e2e8f0', '10px', 100);

// Block 4 Header Label
html += textShape('b4_lbl', 56, 676, 550, 20, '<span style="font-weight: 700; color: #0f172a; font-size: 13px;">4. 단순 판매량 집계 한계 극복 (Before / After) &amp; 종합 랭킹 점수 승산 수식</span>', '13px', '700', '#0f172a');
html += badgeShape('b4_tag', 1400, 674, 140, 20, 'SOLUTION & FORMULA', '#f1f5f9', '#cbd5e1', '#334155', '10px', '4px', 101);

// Left: Before vs After Comparison Box (Left: 56, Top: 700, Width: 640, Height: 148)
// Top Row: BEFORE
html += rectShape('b4_bef_bg', 56, 700, 640, 68, '#fef2f2', '#fecaca', '6px', 101);
html += textShape('b4_bef_badge', 68, 706, 240, 18, '<span style="font-weight: 700; color: #b91c1c; font-size: 11px;">⚠️ BEFORE (현행 단순 주문수 집계 시 왜곡)</span>', '11px', '700', '#b91c1c');
html += multiLineText('b4_bef_text', 68, 726, 620, 38, '• 3만원 기본 티셔츠 100건 판매 ➔ <b>랭킹 1위 독점 (저가 박리다매 왜곡)</b><br>• 90만원 미샤 코트 10건(매출 900만) 판매 ➔ <b>랭킹 48위 탈락 (고가 패션 소외)</b>', '11px', '400', '#991b1b', '1.4', 102);

// Bottom Row: AFTER
html += rectShape('b4_aft_bg', 56, 776, 640, 68, '#f0fdf4', '#bbf7d0', '6px', 101);
html += textShape('b4_aft_badge', 68, 782, 240, 18, '<span style="font-weight: 700; color: #15803d; font-size: 11px;">✅ AFTER (신규 6대 복합 랭킹 룰 적용 시)</span>', '11px', '700', '#15803d');
html += multiLineText('b4_aft_text', 68, 802, 620, 38, '• 90만원 미샤 코트: 매출(35%) + 장바구니(15%) 결합 반영 ➔ <b>종합 2위 안착</b><br>• 3만원 티셔츠: 수량(25%) 우세하나 Log 정규화로 왜곡 차단 ➔ <b>종합 5위 균형</b>', '11px', '400', '#166534', '1.4', 102);

// Right: Multiplicative Score Formula Box (Left: 712, Top: 700, Width: 832, Height: 148)
html += rectShape('b4_formula_bg', 712, 700, 832, 148, '#0f172a', '#334155', '8px', 101);

// Formula Box Header
html += textShape('b4_f_title', 728, 708, 400, 20, '<span style="font-weight: 700; color: #38bdf8; font-size: 12px;">📐 종합 랭킹 점수 승산 수식 (Multiplicative Scoring Model)</span>', '12px', '700', '#38bdf8');
html += badgeShape('b4_f_badge', 1440, 708, 90, 20, 'V3.0 MODEL', '#1e293b', '#38bdf8', '#38bdf8', '10px', '4px', 102);

// Main Formula Banner (Dark Navy Accent)
html += rectShape('b4_f_bar', 728, 734, 800, 42, '#1e293b', '#475569', '6px', 102);
html += textShape('b4_f_eq', 742, 744, 772, 24, '<span style="font-weight: 800; color: #38bdf8; font-size: 14px; letter-spacing: 0.02em;">Total Score = Base Score (6대 복합 가중치 100%) × F_freshness (신상품 부스팅)</span>', '14px', '800', '#38bdf8');

// Detail Formula & Explanation
html += multiLineText('b4_f_detail', 732, 784, 792, 56, `
    <span style="color: #cbd5e1; font-weight: 600;">• Base Score = 0.35·S_rev + 0.25·S_vol + 0.15·S_cart + 0.10·S_wish + 0.10·S_uv + 0.05·S_pv</span><br>
    <span style="color: #94a3b8;">• F_freshness: 출시 1~7일차(<b>1.50x</b>) ➔ 8~14일차(<b>1.30x</b>) ➔ 15~30일차(<b>1.15x</b>) ➔ 30일 경과 후(<b>1.00x</b>) 승산 적용</span>
`, '11px', '400', '#94a3b8', '1.5', 102);


// Closing Canvas & Body
html += `
    </div>
</body>
</html>
`;

fs.writeFileSync('data/p_lus0e/10_Product_Ranking_Rules_850.html', html);
console.log('4-Tier Horizontal Layout HTML successfully generated! Length:', html.length);
