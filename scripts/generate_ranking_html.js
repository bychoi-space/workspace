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

// Helper to create a standard Text Shape component
function textShape(id, left, top, width, height, contentHtml, fontSize = '12px', fontWeight = '400', color = '#334155', align = 'left', zIndex = 102) {
    return `
        <!-- Text Shape: ${id} -->
        <div id="${id}" class="lf-component v4-text-shape" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex}; --v4-text-adjust-y: 0px; --v4-text-shape-pad-y: 2px; min-width: unset !important; min-height: unset !important;">
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; display: block; text-align: ${align}; width: 100%; height: 100%; padding: 2px !important; box-sizing: border-box;">
                ${contentHtml}
            </div>
        </div>`;
}

// Helper to create a standard Badge Component
function badgeShape(id, left, top, width, height, text, bg, border, textColor, fontSize = '10.5px', radius = '6px', zIndex = 102) {
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
function logoShape(id, left, top, width, height, logoBase64, maskColor = '#ffffff', zIndex = 102) {
    return `
        <!-- Logo Shape: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};" data-resized="true">
            <div class="lf-icon v4-logo-img" style="width: 100%; height: 100%; box-sizing: border-box; padding: 2px !important; background-origin: content-box !important; background-clip: content-box !important; mask-origin: content-box !important; -webkit-mask-origin: content-box !important; mask-clip: content-box !important; -webkit-mask-clip: content-box !important; -webkit-mask-image: url('${logoBase64}'); mask-image: url('${logoBase64}'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; background-color: ${maskColor} !important; pointer-events: none;"></div>
        </div>`;
}

let html = `<!DOCTYPE html>
<html lang="ko" style="--v4-text-color: #0f172a; --v4-font-size: 13px; --v4-font-weight: 400; --v4-font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; --v4-placeholder-color: #94a3b8;"><head>
    <meta charset="UTF-8">
    <title>시선닷컴 상품 랭킹 산정 룰 (Ranking Algorithm Policy)</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Noto+Sans+KR:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <link rel="stylesheet" as="style" crossorigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
    <style id="v4-typography-rules">
        :root {
            --v4-text-color: #0f172a;
            --v4-font-size: 13px;
            --v4-font-weight: 400;
            --v4-font-family: 'Pretendard Variable', 'Noto Sans KR', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --v4-primary: #3b82f6;
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
        .page {
            width: 1600px;
            height: 900px;
            background: #f8fafc;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
        }
        .lf-component {
            box-sizing: border-box;
        }
        .v4-shape {
            box-sizing: border-box;
        }
        .v4-editable-cell {
            outline: none;
            word-break: keep-all;
        }
    </style>
</head>
<body>
    <div class="page" id="canvas-page">

        <!-- ======================================================== -->
        <!-- [1] 상단 통합 헤더 바 (Top Header Bar)                    -->
        <!-- ======================================================== -->
        ${rectShape('rk-hdr-bg', 30, 16, 1540, 52, '#0f172a', '#1e293b', '10px', 100)}

        <!-- 헤더 아이콘 박스 -->
        <div id="rk-hdr-icon" class="lf-component" style="position: absolute; top: 26px; left: 45px; width: 32px; height: 32px; z-index: 101;" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #3b82f6; border: 1.6px solid transparent; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ffffff; box-sizing: border-box;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 18px; height: 18px; background-image: none !important;"><path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
            </div>
        </div>

        <!-- 헤더 타이틀 -->
        ${textShape('rk-hdr-title', 88, 29, 540, 26, '<p style="white-space:nowrap;"><span style="font-size:16px; font-weight:800; color:#f8fafc;">시선닷컴 상품 랭킹 산정 룰 (Ranking Algorithm Policy)</span></p>', '16px', '800', '#f8fafc', 'left', 101)}

        <!-- 헤더 서브 타이틀 -->
        ${textShape('rk-hdr-sub', 610, 33, 340, 20, '<p style="white-space:nowrap;"><span style="font-size:12px; font-weight:500; color:#94a3b8;">3대 패션 브랜드(MICHAA · it MICHAA · E.B.M) 복합 밸런싱 모델</span></p>', '12px', '500', '#94a3b8', 'left', 101)}

        <!-- 헤더 브랜드 로고 뱃지 3종 -->
        ${rectShape('rk-hdr-b1-bg', 1140, 29, 88, 26, '#1e293b', '#334155', '6px', 101)}
        ${logoShape('rk-hdr-b1-logo', 1140, 29, 88, 26, logos.michaa, '#ffffff', 102)}

        ${rectShape('rk-hdr-b2-bg', 1236, 29, 88, 26, '#1e293b', '#334155', '6px', 101)}
        ${logoShape('rk-hdr-b2-logo', 1236, 29, 88, 26, logos.itmichaa, '#ffffff', 102)}

        ${rectShape('rk-hdr-b3-bg', 1332, 29, 88, 26, '#1e293b', '#334155', '6px', 101)}
        ${logoShape('rk-hdr-b3-logo', 1332, 29, 88, 26, logos.ebm, '#ffffff', 102)}

        <!-- 버전 뱃지 -->
        ${badgeShape('rk-hdr-ver', 1430, 29, 125, 26, 'ALGORITHM V2.0', 'rgba(59, 130, 246, 0.2)', '#3b82f6', '#93c5fd', '11px', '13px', 101)}


        <!-- ======================================================== -->
        <!-- [2] COLUMN 1 (좌측 450px): 브랜드 포트폴리오 & 전/후 비교    -->
        <!-- ======================================================== -->
        <!-- 대형 카드 1 배경 -->
        ${rectShape('rk-c1-bg', 30, 82, 450, 485, '#ffffff', '#e2e8f0', '12px', 100)}

        <!-- 카드 1 헤더 아이콘 -->
        <div id="rk-c1-icon" class="lf-component" style="position: absolute; top: 96px; left: 46px; width: 22px; height: 22px; z-index: 101;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; background-image: none !important;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
        </div>
        ${textShape('rk-c1-title', 74, 94, 280, 24, '<p style="white-space:nowrap;"><span style="font-size:15px; font-weight:800; color:#0f172a;">1. 3대 브랜드 포트폴리오 &amp; 원칙</span></p>', '15px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c1-badge', 375, 95, 90, 22, '3 BRANDS', '#eff6ff', '#bfdbfe', '#1d4ed8', '10px', '6px', 101)}

        <!-- 브랜드 1: MICHAA -->
        ${rectShape('rk-b1-card', 44, 128, 422, 104, '#ffffff', '#e2e8f0', '10px', 101)}
        ${logoShape('rk-b1-logo', 56, 138, 90, 30, logos.michaa, '#0f172a', 102)}
        ${badgeShape('rk-b1-price', 320, 138, 134, 24, '평균 80만 ~ 150만원', '#eff6ff', '#bfdbfe', '#1e40af', '11px', '12px', 102)}
        ${textShape('rk-b1-desc', 56, 174, 400, 50, '<p>• <span style="font-weight:700; color:#0f172a;">포지션</span>: 하이엔드 럭셔리 여성 정장 · 시그니처 코트</p><p>• <span style="font-weight:700; color:#1e40af;">랭킹 룰</span>: <strong>주문금액(35%)</strong> 가중치로 고가 프리미엄 랭킹 진입 보장</p>', '12px', '400', '#334155', 'left', 102)}

        <!-- 브랜드 2: it MICHAA -->
        ${rectShape('rk-b2-card', 44, 242, 422, 104, '#ffffff', '#e2e8f0', '10px', 101)}
        ${logoShape('rk-b2-logo', 56, 252, 90, 30, logos.itmichaa, '#0f172a', 102)}
        ${badgeShape('rk-b2-price', 320, 252, 134, 24, '평균 15만 ~ 35만원', '#fef2f2', '#fecaca', '#b91c1c', '11px', '12px', 102)}
        ${textShape('rk-b2-desc', 56, 288, 400, 50, '<p>• <span style="font-weight:700; color:#0f172a;">포지션</span>: 2030 영 컨템포러리 &amp; 페미닌 트렌드 데일리웨어</p><p>• <span style="font-weight:700; color:#b91c1c;">랭킹 룰</span>: <strong>판매수량(25%) + 장바구니(15%)</strong> 결합 대중 인기 검증</p>', '12px', '400', '#334155', 'left', 102)}

        <!-- 브랜드 3: E.B.M -->
        ${rectShape('rk-b3-card', 44, 356, 422, 104, '#ffffff', '#e2e8f0', '10px', 101)}
        ${logoShape('rk-b3-logo', 56, 366, 90, 30, logos.ebm, '#0f172a', 102)}
        ${badgeShape('rk-b3-price', 320, 366, 134, 24, '평균 10만 ~ 25만원', '#ecfdf5', '#a7f3d0', '#047857', '11px', '12px', 102)}
        ${textShape('rk-b3-desc', 56, 402, 400, 50, '<p>• <span style="font-weight:700; color:#0f172a;">포지션</span>: 스타일리시 캐주얼 &amp; 모던 젠더리스 트렌드 룩</p><p>• <span style="font-weight:700; color:#047857;">랭킹 룰</span>: <strong>신상품 3단계 부스팅(1.5x)</strong>으로 빠른 상품 회전 지원</p>', '12px', '400', '#334155', 'left', 102)}

        <!-- 하단 브랜드 밸런서 칩 -->
        ${rectShape('rk-b-balance-bg', 44, 472, 422, 80, '#f8fafc', '#cbd5e1', '8px', 101)}
        ${textShape('rk-b-balance-title', 56, 480, 400, 20, '<p><span style="font-size:11.5px; font-weight:800; color:#1e40af;">⚖️ 브랜드별 객단가 정규화 밸런서 (Brand Normalization)</span></p>', '11.5px', '800', '#1e40af', 'left', 102)}
        ${textShape('rk-b-balance-desc', 56, 502, 400, 42, '<p style="font-size:11px; color:#475569; line-height:1.4;">미샤(90만원)와 잇미샤(20만원) 간의 가격 격차를 브랜드 평균치로 정규화하여 통합 랭킹에서의 공정성을 수학적으로 보정합니다.</p>', '11px', '400', '#475569', 'left', 102)}


        <!-- 대형 카드 2: 랭킹 개선 전/후 비교 (BEFORE / AFTER) -->
        ${rectShape('rk-c1-sub-bg', 30, 580, 450, 298, '#ffffff', '#e2e8f0', '12px', 100)}
        ${textShape('rk-c1-sub-title', 46, 594, 290, 24, '<p style="white-space:nowrap;"><span style="font-size:14px; font-weight:800; color:#0f172a;">단순 판매량 집계 한계 극복 (Before / After)</span></p>', '14px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c1-sub-badge', 360, 594, 105, 22, 'COMPARISON', '#e0e7ff', '#c7d2fe', '#4338ca', '10px', '4px', 101)}

        <!-- Before 박스 -->
        ${rectShape('rk-box-before-bg', 44, 626, 422, 114, '#fef2f2', '#fecaca', '8px', 101)}
        ${textShape('rk-box-before-title', 56, 634, 400, 20, '<p><span style="font-size:11px; font-weight:800; color:#b91c1c;">⚠️ BEFORE (현행 단순 주문수 랭킹 집계 시)</span></p>', '11px', '800', '#b91c1c', 'left', 102)}
        ${textShape('rk-box-before-desc', 56, 656, 400, 76, '<p style="font-size:11.5px; color:#334155; line-height:1.45;">• <strong>3만원 기본 티셔츠 100건</strong> ➔ <span style="color:#b91c1c; font-weight:800;">랭킹 1위 독점</span></p><p style="font-size:11.5px; color:#334155; line-height:1.45;">• <strong>90만원 미샤 코트 10건(매출 900만)</strong> ➔ <span style="color:#64748b; font-weight:700;">랭킹 48위 탈락</span></p><p style="font-size:10.5px; color:#991b1b; margin-top:3px;">※ 치명적 결함: 고가 주력 상품 소외, 자사몰 저가 잡화 쇼핑몰화</p>', '11.5px', '400', '#334155', 'left', 102)}

        <!-- After 박스 -->
        ${rectShape('rk-box-after-bg', 44, 752, 422, 114, '#f0fdf4', '#bbf7d0', '8px', 101)}
        ${textShape('rk-box-after-title', 56, 760, 400, 20, '<p><span style="font-size:11px; font-weight:800; color:#15803d;">✅ AFTER (신규 6대 복합 랭킹 룰 적용 시)</span></p>', '11px', '800', '#15803d', 'left', 102)}
        ${textShape('rk-box-after-desc', 56, 782, 400, 76, '<p style="font-size:11.5px; color:#334155; line-height:1.45;">• <strong>미샤 코트</strong>: 매출(35%) + 찜/카트 ➔ <span style="color:#15803d; font-weight:800;">종합 2위 안착</span></p><p style="font-size:11.5px; color:#334155; line-height:1.45;">• <strong>3만원 티셔츠</strong>: 수량(25%) 우세하나 Log 정규화 ➔ <span style="color:#047857; font-weight:700;">종합 5위 균형</span></p><p style="font-size:10.5px; color:#166534; margin-top:3px;">※ 기대 효과: 프리미엄 가치 보존 + 대중적 볼륨의 완벽한 공존 달성</p>', '11.5px', '400', '#334155', 'left', 102)}


        <!-- ======================================================== -->
        <!-- [3] COLUMN 2 (중앙 600px): 6대 지표 원형 그래프 & 카드    -->
        <!-- ======================================================== -->
        ${rectShape('rk-c2-bg', 500, 82, 600, 796, '#ffffff', '#e2e8f0', '12px', 100)}

        <!-- 카드 2 헤더 아이콘 -->
        <div id="rk-c2-icon" class="lf-component" style="position: absolute; top: 96px; left: 516px; width: 22px; height: 22px; z-index: 101;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; background-image: none !important;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        ${textShape('rk-c2-title', 544, 94, 400, 24, '<p style="white-space:nowrap;"><span style="font-size:15px; font-weight:800; color:#0f172a;">2. 6대 지표 가중치 매트릭스 (Total Weights 100%)</span></p>', '15px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c2-badge', 975, 95, 110, 22, 'CORE MATRIX', '#eff6ff', '#bfdbfe', '#1d4ed8', '10px', '6px', 101)}

        <!-- 대형 SVG 원형 도넛 그래프 -->
        <div id="rk-donut-chart" class="lf-component" style="position: absolute; top: 130px; left: 520px; width: 210px; height: 210px; z-index: 101;" data-resized="true">
            <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                <!-- Track -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f1f5f9" stroke-width="26"></circle>
                <!-- 1: 매출 35% (153.94) -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" stroke-width="26" stroke-dasharray="153.94 285.88" stroke-dashoffset="0"></circle>
                <!-- 2: 수량 25% (109.96) -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#06b6d4" stroke-width="26" stroke-dasharray="109.96 329.86" stroke-dashoffset="-153.94"></circle>
                <!-- 3: 장바구니 15% (65.97) -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#8b5cf6" stroke-width="26" stroke-dasharray="65.97 373.85" stroke-dashoffset="-263.90"></circle>
                <!-- 4: 위시리스트 10% (43.98) -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#ec4899" stroke-width="26" stroke-dasharray="43.98 395.84" stroke-dashoffset="-329.87"></circle>
                <!-- 5: UV 10% (43.98) -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" stroke-width="26" stroke-dasharray="43.98 395.84" stroke-dashoffset="-373.85"></circle>
                <!-- 6: PV 5% (21.99) -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#64748b" stroke-width="26" stroke-dasharray="21.99 417.83" stroke-dashoffset="-417.83"></circle>
            </svg>
        </div>

        <!-- 도넛 중앙 독립 텍스트 -->
        ${textShape('rk-donut-val', 565, 205, 120, 36, '<p style="text-align:center;"><span style="font-size:28px; font-weight:900; color:#0f172a; line-height:1;">100%</span></p>', '28px', '900', '#0f172a', 'center', 102)}
        ${textShape('rk-donut-sub', 565, 240, 120, 18, '<p style="text-align:center;"><span style="font-size:10px; font-weight:700; color:#64748b; letter-spacing:0.5px;">TOTAL WEIGHTS</span></p>', '10px', '700', '#64748b', 'center', 102)}

        <!-- 우측 범례 칩 6종 (독립 표준 아톰 분리) -->
        <!-- 1. 주문금액 -->
        ${rectShape('rk-leg1-bg', 745, 130, 340, 32, '#eff6ff', '#bfdbfe', '6px', 101)}
        ${rectShape('rk-leg1-dot', 755, 140, 12, 12, '#3b82f6', '#2563eb', '3px', 102)}
        ${textShape('rk-leg1-lbl', 774, 136, 210, 20, '<p><span style="font-size:12px; font-weight:700; color:#1e3a8a;">주문금액 (매출 기여도)</span></p>', '12px', '700', '#1e3a8a', 'left', 102)}
        ${textShape('rk-leg1-val', 1025, 135, 50, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#1d4ed8;">35%</span></p>', '14px', '900', '#1d4ed8', 'right', 102)}

        <!-- 2. 주문수량 -->
        ${rectShape('rk-leg2-bg', 745, 168, 340, 32, '#ecfdf5', '#a7f3d0', '6px', 101)}
        ${rectShape('rk-leg2-dot', 755, 178, 12, 12, '#06b6d4', '#0891b2', '3px', 102)}
        ${textShape('rk-leg2-lbl', 774, 174, 210, 20, '<p><span style="font-size:12px; font-weight:700; color:#065f46;">주문수량 (순수 주문건수)</span></p>', '12px', '700', '#065f46', 'left', 102)}
        ${textShape('rk-leg2-val', 1025, 173, 50, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#0e7490;">25%</span></p>', '14px', '900', '#0e7490', 'right', 102)}

        <!-- 3. 장바구니 -->
        ${rectShape('rk-leg3-bg', 745, 206, 340, 32, '#f5f3ff', '#ddd6fe', '6px', 101)}
        ${rectShape('rk-leg3-dot', 755, 216, 12, 12, '#8b5cf6', '#7c3aed', '3px', 102)}
        ${textShape('rk-leg3-lbl', 774, 212, 210, 20, '<p><span style="font-size:12px; font-weight:700; color:#5b21b6;">장바구니 (고관여 구매의향)</span></p>', '12px', '700', '#5b21b6', 'left', 102)}
        ${textShape('rk-leg3-val', 1025, 211, 50, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#6d28d9;">15%</span></p>', '14px', '900', '#6d28d9', 'right', 102)}

        <!-- 4. 위시리스트 -->
        ${rectShape('rk-leg4-bg', 745, 244, 340, 32, '#fdf2f8', '#fbcfe8', '6px', 101)}
        ${rectShape('rk-leg4-dot', 755, 254, 12, 12, '#ec4899', '#db2777', '3px', 102)}
        ${textShape('rk-leg4-lbl', 774, 250, 210, 20, '<p><span style="font-size:12px; font-weight:700; color:#9d174d;">위시리스트 (찜·선호도)</span></p>', '12px', '700', '#9d174d', 'left', 102)}
        ${textShape('rk-leg4-val', 1025, 249, 50, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#be185d;">10%</span></p>', '14px', '900', '#be185d', 'right', 102)}

        <!-- 5. 순수방문자 UV -->
        ${rectShape('rk-leg5-bg', 745, 282, 340, 32, '#fffbeb', '#fde68a', '6px', 101)}
        ${rectShape('rk-leg5-dot', 755, 292, 12, 12, '#f59e0b', '#d97706', '3px', 102)}
        ${textShape('rk-leg5-lbl', 774, 288, 210, 20, '<p><span style="font-size:12px; font-weight:700; color:#92400e;">순수방문자 UV (어뷰징 방지)</span></p>', '12px', '700', '#92400e', 'left', 102)}
        ${textShape('rk-leg5-val', 1025, 287, 50, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#b45309;">10%</span></p>', '14px', '900', '#b45309', 'right', 102)}

        <!-- 6. 페이지뷰 PV -->
        ${rectShape('rk-leg6-bg', 745, 320, 340, 32, '#f8fafc', '#cbd5e1', '6px', 101)}
        ${rectShape('rk-leg6-dot', 755, 330, 12, 12, '#64748b', '#475569', '3px', 102)}
        ${textShape('rk-leg6-lbl', 774, 326, 210, 20, '<p><span style="font-size:12px; font-weight:700; color:#334155;">페이지뷰 PV (트래픽 총량)</span></p>', '12px', '700', '#334155', 'left', 102)}
        ${textShape('rk-leg6-val', 1025, 325, 50, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#475569;">5%</span></p>', '14px', '900', '#475569', 'right', 102)}


        <!-- 6대 지표 2열 3행 비주얼 카드 (완전 분리 아톰) -->
        <!-- 1행 좌: 주문금액 (35%) -->
        ${rectShape('rk-m1-bg', 516, 362, 278, 104, '#ffffff', '#bfdbfe', '10px', 101)}
        ${textShape('rk-m1-title', 528, 370, 180, 22, '<p><span style="font-size:13px; font-weight:800; color:#1e3a8a;">주문금액 (S_rev)</span></p>', '13px', '800', '#1e3a8a', 'left', 102)}
        ${textShape('rk-m1-val', 724, 366, 60, 28, '<p style="text-align:right;"><span style="font-size:22px; font-weight:900; color:#3b82f6;">35%</span></p>', '22px', '900', '#3b82f6', 'right', 102)}
        ${textShape('rk-m1-desc', 528, 400, 254, 56, '<p style="font-size:11px; color:#475569; line-height:1.4;">• 산식: <span style="font-family:monospace; color:#1e40af;">log10(금액+1) 정규화</span><br>• 역할: 고가 명품·코트 매출 기여도 인정</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 1행 우: 주문수량 (25%) -->
        ${rectShape('rk-m2-bg', 804, 362, 278, 104, '#ffffff', '#a7f3d0', '10px', 101)}
        ${textShape('rk-m2-title', 816, 370, 180, 22, '<p><span style="font-size:13px; font-weight:800; color:#065f46;">주문수량 (S_vol)</span></p>', '13px', '800', '#065f46', 'left', 102)}
        ${textShape('rk-m2-val', 1012, 366, 60, 28, '<p style="text-align:right;"><span style="font-size:22px; font-weight:900; color:#06b6d4;">25%</span></p>', '22px', '900', '#06b6d4', 'right', 102)}
        ${textShape('rk-m2-desc', 816, 400, 254, 56, '<p style="font-size:11px; color:#475569; line-height:1.4;">• 산식: <span style="font-family:monospace; color:#065f46;">주문건수 / MaxVol</span><br>• 역할: 실구매 고객 대중적 선호도 검증</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 2행 좌: 장바구니 (15%) -->
        ${rectShape('rk-m3-bg', 516, 476, 278, 104, '#ffffff', '#ddd6fe', '10px', 101)}
        ${textShape('rk-m3-title', 528, 484, 180, 22, '<p><span style="font-size:13px; font-weight:800; color:#5b21b6;">장바구니 (S_cart)</span></p>', '13px', '800', '#5b21b6', 'left', 102)}
        ${textShape('rk-m3-val', 724, 480, 60, 28, '<p style="text-align:right;"><span style="font-size:22px; font-weight:900; color:#8b5cf6;">15%</span></p>', '22px', '900', '#8b5cf6', 'right', 102)}
        ${textShape('rk-m3-desc', 528, 514, 254, 56, '<p style="font-size:11px; color:#475569; line-height:1.4;">• 산식: <span style="font-family:monospace; color:#5b21b6;">장바구니 담김 / Max</span><br>• 역할: 구매 직전 강력한 전환 의향(High Intent)</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 2행 우: 위시리스트 (10%) -->
        ${rectShape('rk-m4-bg', 804, 476, 278, 104, '#ffffff', '#fbcfe8', '10px', 101)}
        ${textShape('rk-m4-title', 816, 484, 180, 22, '<p><span style="font-size:13px; font-weight:800; color:#9d174d;">위시리스트 (S_wish)</span></p>', '13px', '800', '#9d174d', 'left', 102)}
        ${textShape('rk-m4-val', 1012, 480, 60, 28, '<p style="text-align:right;"><span style="font-size:22px; font-weight:900; color:#ec4899;">10%</span></p>', '22px', '900', '#ec4899', 'right', 102)}
        ${textShape('rk-m4-desc', 816, 514, 254, 56, '<p style="font-size:11px; color:#475569; line-height:1.4;">• 산식: <span style="font-family:monospace; color:#9d174d;">위시 찜수 / MaxWish</span><br>• 역할: 잠재 고객 선호도 및 브랜드 충성도</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 3행 좌: 순수방문자 UV (10%) -->
        ${rectShape('rk-m5-bg', 516, 590, 278, 104, '#ffffff', '#fde68a', '10px', 101)}
        ${textShape('rk-m5-title', 528, 598, 180, 22, '<p><span style="font-size:13px; font-weight:800; color:#92400e;">순수방문자 (S_uv)</span></p>', '13px', '800', '#92400e', 'left', 102)}
        ${textShape('rk-m5-val', 724, 594, 60, 28, '<p style="text-align:right;"><span style="font-size:22px; font-weight:900; color:#f59e0b;">10%</span></p>', '22px', '900', '#f59e0b', 'right', 102)}
        ${textShape('rk-m5-desc', 528, 628, 254, 56, '<p style="font-size:11px; color:#475569; line-height:1.4;">• 산식: <span style="font-family:monospace; color:#92400e;">Unique Visitors / MaxUV</span><br>• 역할: 어뷰징 배제 순수 모객 파워 측정</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 3행 우: 페이지뷰 PV (5%) -->
        ${rectShape('rk-m6-bg', 804, 590, 278, 104, '#ffffff', '#cbd5e1', '10px', 101)}
        ${textShape('rk-m6-title', 816, 598, 180, 22, '<p><span style="font-size:13px; font-weight:800; color:#334155;">페이지뷰 (S_pv)</span></p>', '13px', '800', '#334155', 'left', 102)}
        ${textShape('rk-m6-val', 1012, 594, 60, 28, '<p style="text-align:right;"><span style="font-size:22px; font-weight:900; color:#64748b;">5%</span></p>', '22px', '900', '#64748b', 'right', 102)}
        ${textShape('rk-m6-desc', 816, 628, 254, 56, '<p style="font-size:11px; color:#475569; line-height:1.4;">• 산식: <span style="font-family:monospace; color:#334155;">PV (1인 1일 3회 캡)</span><br>• 역할: 매크로 클릭 차단 트래픽 총량</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 하단 종합 랭킹 수식 바 -->
        ${rectShape('rk-fml-bg', 516, 704, 566, 160, '#0f172a', '#1e293b', '10px', 101)}
        ${textShape('rk-fml-title', 530, 714, 420, 22, '<p><span style="font-size:13px; font-weight:800; color:#60a5fa;">📐 종합 랭킹 점수 승산 수식 (Multiplicative Model)</span></p>', '13px', '800', '#60a5fa', 'left', 102)}
        ${badgeShape('rk-fml-badge', 980, 714, 90, 20, 'FINAL SCORE', '#1e293b', '#334155', '#94a3b8', '10px', '4px', 102)}

        ${rectShape('rk-fml-chip-bg', 530, 742, 538, 34, '#1e293b', '#334155', '6px', 102)}
        ${textShape('rk-fml-chip-text', 530, 748, 538, 22, '<p style="text-align:center; font-family:monospace; font-size:13px; font-weight:700; color:#38bdf8; margin:0;">Total Score = [ Base Score (100%) ] × F_freshness × F_decay × F_stock × F_brand</p>', '13px', '700', '#38bdf8', 'center', 103)}

        ${textShape('rk-fml-desc', 530, 786, 538, 68, '<p style="font-size:11px; color:#94a3b8; line-height:1.45;">• <span style="color:#e2e8f0; font-weight:600;">Base Score</span> = 0.35·S_rev + 0.25·S_vol + 0.15·S_cart + 0.10·S_wish + 0.10·S_uv + 0.05·S_pv<br>• 기본 가중치 합산 점수에 신상품 부스트, 시간 감쇠, 재고 페널티, 브랜드 보정을 순차 승산하여 결정</p>', '11px', '400', '#94a3b8', 'left', 102)}


        <!-- ======================================================== -->
        <!-- [4] COLUMN 3 (우측 450px): 부스트, 시간감쇠, 페널티           -->
        <!-- ======================================================== -->
        <!-- 대형 카드 1: 신상품 3단계 부스팅 -->
        ${rectShape('rk-c3-b1-bg', 1120, 82, 450, 230, '#ffffff', '#e2e8f0', '12px', 100)}

        <!-- 카드 1 아이콘 -->
        <div id="rk-c3-icon" class="lf-component" style="position: absolute; top: 96px; left: 1136px; width: 22px; height: 22px; z-index: 101;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; background-image: none !important;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        ${textShape('rk-c3-title', 1164, 94, 260, 24, '<p style="white-space:nowrap;"><span style="font-size:15px; font-weight:800; color:#0f172a;">3. 신상품 3단계 부스팅 룰</span></p>', '15px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c3-badge', 1475, 95, 80, 22, 'BOOST', '#fef3c7', '#fde68a', '#b45309', '10px', '6px', 101)}

        <!-- 3단계 게이지 카드 (완전 분리 아톰) -->
        <!-- Step 1: 1~7일 -->
        ${rectShape('rk-bst1-bg', 1136, 128, 132, 115, '#fdf2f8', '#fbcfe8', '8px', 101)}
        ${textShape('rk-bst1-period', 1136, 136, 132, 18, '<p style="text-align:center;"><span style="font-size:11px; font-weight:700; color:#be185d;">출시 1 ~ 7일차</span></p>', '11px', '700', '#be185d', 'center', 102)}
        ${textShape('rk-bst1-rate', 1136, 156, 132, 32, '<p style="text-align:center;"><span style="font-size:24px; font-weight:900; color:#9d174d;">× 1.50</span></p>', '24px', '900', '#9d174d', 'center', 102)}
        ${textShape('rk-bst1-name', 1136, 192, 132, 18, '<p style="text-align:center;"><span style="font-size:10.5px; font-weight:700; color:#831843;">슈퍼 부스트</span></p>', '10.5px', '700', '#831843', 'center', 102)}
        ${textShape('rk-bst1-desc', 1136, 212, 132, 16, '<p style="text-align:center;"><span style="font-size:9.5px; color:#be185d;">콜드스타트 극복</span></p>', '9.5px', '400', '#be185d', 'center', 102)}

        <!-- Step 2: 8~14일 -->
        ${rectShape('rk-bst2-bg', 1278, 128, 132, 115, '#eff6ff', '#bfdbfe', '8px', 101)}
        ${textShape('rk-bst2-period', 1278, 136, 132, 18, '<p style="text-align:center;"><span style="font-size:11px; font-weight:700; color:#1d4ed8;">출시 8 ~ 14일차</span></p>', '11px', '700', '#1d4ed8', 'center', 102)}
        ${textShape('rk-bst2-rate', 1278, 156, 132, 32, '<p style="text-align:center;"><span style="font-size:24px; font-weight:900; color:#1e40af;">× 1.30</span></p>', '24px', '900', '#1e40af', 'center', 102)}
        ${textShape('rk-bst2-name', 1278, 192, 132, 18, '<p style="text-align:center;"><span style="font-size:10.5px; font-weight:700; color:#1e3a8a;">성장 부스트</span></p>', '10.5px', '700', '#1e3a8a', 'center', 102)}
        ${textShape('rk-bst2-desc', 1278, 212, 132, 16, '<p style="text-align:center;"><span style="font-size:9.5px; color:#1d4ed8;">장바구니 반응 검증</span></p>', '9.5px', '400', '#1d4ed8', 'center', 102)}

        <!-- Step 3: 15~30일 -->
        ${rectShape('rk-bst3-bg', 1420, 128, 134, 115, '#f8fafc', '#cbd5e1', '8px', 101)}
        ${textShape('rk-bst3-period', 1420, 136, 134, 18, '<p style="text-align:center;"><span style="font-size:11px; font-weight:700; color:#334155;">출시 15 ~ 30일차</span></p>', '11px', '700', '#334155', 'center', 102)}
        ${textShape('rk-bst3-rate', 1420, 156, 134, 32, '<p style="text-align:center;"><span style="font-size:24px; font-weight:900; color:#0f172a;">× 1.15</span></p>', '24px', '900', '#0f172a', 'center', 102)}
        ${textShape('rk-bst3-name', 1420, 192, 134, 18, '<p style="text-align:center;"><span style="font-size:10.5px; font-weight:700; color:#475569;">안착 부스트</span></p>', '10.5px', '700', '#475569', 'center', 102)}
        ${textShape('rk-bst3-desc', 1420, 212, 134, 16, '<p style="text-align:center;"><span style="font-size:9.5px; color:#64748b;">자연 랭킹 전환</span></p>', '9.5px', '400', '#64748b', 'center', 102)}

        <!-- 부스팅 안내 문구 -->
        ${textShape('rk-bst-info', 1136, 255, 418, 45, '<p style="font-size:11px; color:#64748b; line-height:1.4;">• 30일 초과 상품은 기본 배율(1.00x)로 자동 전환됩니다.<br>• 신규 등록 패션 상품의 1주차 노출을 보장하여 고객 탐색 풀을 다변화합니다.</p>', '11px', '400', '#64748b', 'left', 101)}


        <!-- 대형 카드 2: 14일 반감기 시간 감쇠 -->
        ${rectShape('rk-c3-b2-bg', 1120, 326, 450, 250, '#ffffff', '#e2e8f0', '12px', 100)}
        ${textShape('rk-decay-title', 1136, 338, 300, 24, '<p style="white-space:nowrap;"><span style="font-size:14px; font-weight:800; color:#0f172a;">4. 14일 반감기 시간 감쇠 (Time Decay)</span></p>', '14px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-decay-badge', 1450, 338, 105, 22, 'HALF-LIFE 14D', '#fef3c7', '#fde68a', '#d97706', '10px', '4px', 101)}

        <!-- 감쇠 수식 칩 -->
        ${rectShape('rk-decay-fml-bg', 1136, 370, 418, 32, '#f8fafc', '#cbd5e1', '6px', 101)}
        ${textShape('rk-decay-fml-text', 1136, 376, 418, 22, '<p style="text-align:center; font-family:monospace; font-size:12px; font-weight:700; color:#1e40af; margin:0;">F_decay(t) = 0.5 ^ ( t / 14 )</p>', '12px', '700', '#1e40af', 'center', 102)}

        <!-- 4개 감쇠 프로그레스 바 (완전 분리 아톰) -->
        <!-- 최근 7일 (100%) -->
        ${textShape('rk-dbar1-lbl', 1136, 412, 90, 20, '<p><span style="font-size:11.5px; font-weight:600; color:#334155;">최근 7일 실적</span></p>', '11.5px', '600', '#334155', 'left', 102)}
        ${rectShape('rk-dbar1-track', 1230, 417, 240, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar1-bar', 1230, 417, 240, 8, '#3b82f6', 'transparent', '4px', 102)}
        ${textShape('rk-dbar1-val', 1475, 412, 75, 20, '<p style="text-align:right;"><span style="font-size:11.5px; font-weight:800; color:#1d4ed8;">100%</span></p>', '11.5px', '800', '#1d4ed8', 'right', 102)}

        <!-- 8~14일 (75%) -->
        ${textShape('rk-dbar2-lbl', 1136, 438, 90, 20, '<p><span style="font-size:11.5px; font-weight:600; color:#334155;">8 ~ 14일 전</span></p>', '11.5px', '600', '#334155', 'left', 102)}
        ${rectShape('rk-dbar2-track', 1230, 443, 240, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar2-bar', 1230, 443, 180, 8, '#06b6d4', 'transparent', '4px', 102)}
        ${textShape('rk-dbar2-val', 1475, 438, 75, 20, '<p style="text-align:right;"><span style="font-size:11.5px; font-weight:800; color:#0e7490;">75%</span></p>', '11.5px', '800', '#0e7490', 'right', 102)}

        <!-- 15~30일 (50%) -->
        ${textShape('rk-dbar3-lbl', 1136, 464, 90, 20, '<p><span style="font-size:11.5px; font-weight:600; color:#334155;">15 ~ 30일 전</span></p>', '11.5px', '600', '#334155', 'left', 102)}
        ${rectShape('rk-dbar3-track', 1230, 469, 240, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar3-bar', 1230, 469, 120, 8, '#f59e0b', 'transparent', '4px', 102)}
        ${textShape('rk-dbar3-val', 1475, 464, 75, 20, '<p style="text-align:right;"><span style="font-size:11.5px; font-weight:800; color:#b45309;">50%</span></p>', '11.5px', '800', '#b45309', 'right', 102)}

        <!-- 31일 이후 (25%) -->
        ${textShape('rk-dbar4-lbl', 1136, 490, 90, 20, '<p><span style="font-size:11.5px; font-weight:600; color:#334155;">31일 이후</span></p>', '11.5px', '600', '#334155', 'left', 102)}
        ${rectShape('rk-dbar4-track', 1230, 495, 240, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar4-bar', 1230, 495, 60, 8, '#94a3b8', 'transparent', '4px', 102)}
        ${textShape('rk-dbar4-val', 1475, 490, 75, 20, '<p style="text-align:right;"><span style="font-size:11.5px; font-weight:800; color:#64748b;">25% 이하</span></p>', '11.5px', '800', '#64748b', 'right', 102)}

        <!-- 감쇠 효과 칩 -->
        ${rectShape('rk-decay-bnf-bg', 1136, 524, 418, 40, '#f0fdf4', '#bbf7d0', '6px', 101)}
        ${textShape('rk-decay-bnf-text', 1146, 532, 398, 26, '<p><span style="font-size:11px; font-weight:700; color:#166534;">💡 효과: 과거 누적 판매에 기댄 고인물 상품의 상위 독점 차단 &amp; 트렌드 순환</span></p>', '11px', '700', '#166534', 'left', 102)}


        <!-- 대형 카드 3: 품질 · 재고 페널티 정책 -->
        ${rectShape('rk-c3-b3-bg', 1120, 590, 450, 288, '#ffffff', '#e2e8f0', '12px', 100)}
        ${textShape('rk-pnl-title', 1136, 602, 300, 24, '<p style="white-space:nowrap;"><span style="font-size:14px; font-weight:800; color:#0f172a;">5. 품질 · 재고 페널티 정책 (Governance)</span></p>', '14px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-pnl-badge', 1475, 602, 80, 22, 'PENALTY', '#ffe4e6', '#fecdd3', '#be123c', '10px', '4px', 101)}

        <!-- 페널티 1: 재고 품절 -->
        ${rectShape('rk-pnl1-bg', 1136, 634, 418, 68, '#ffffff', '#fecaca', '8px', 101)}
        ${textShape('rk-pnl1-title', 1148, 642, 220, 20, '<p><span style="font-size:12px; font-weight:800; color:#b91c1c;">📦 재고 품절 페널티 (F_stock)</span></p>', '12px', '800', '#b91c1c', 'left', 102)}
        ${badgeShape('rk-pnl1-badge', 1435, 642, 105, 20, '전체품절 = 0점', '#fee2e2', '#fecaca', '#b91c1c', '10.5px', '4px', 102)}
        ${textShape('rk-pnl1-desc', 1148, 666, 395, 30, '<p style="font-size:11px; color:#475569; margin:0;">• 부분 결품(주요 사이즈 품절) 시 <strong style="color:#b91c1c;">× 0.70 (30% 감점)</strong> 적용 ➔ 헛걸음 이탈 방지</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 페널티 2: 반품·취소율 -->
        ${rectShape('rk-pnl2-bg', 1136, 712, 418, 68, '#ffffff', '#fed7aa', '8px', 101)}
        ${textShape('rk-pnl2-title', 1148, 720, 220, 20, '<p><span style="font-size:12px; font-weight:800; color:#c2410c;">↩️ 반품·취소율 페널티 (F_return)</span></p>', '12px', '800', '#c2410c', 'left', 102)}
        ${badgeShape('rk-pnl2-badge', 1445, 720, 95, 20, '기준선 15%', '#ffedd5', '#fed7aa', '#c2410c', '10.5px', '4px', 102)}
        ${textShape('rk-pnl2-desc', 1148, 744, 395, 30, '<p style="font-size:11px; color:#475569; margin:0;">• 반품율 15% 초과 시 초과분 비례 감점 ➔ 실물 불만족 및 불량 미끼상품 퇴출</p>', '11px', '400', '#475569', 'left', 102)}

        <!-- 페널티 3: 어뷰징 방지 캡 -->
        ${rectShape('rk-pnl3-bg', 1136, 790, 418, 68, '#ffffff', '#cbd5e1', '8px', 101)}
        ${textShape('rk-pnl3-title', 1148, 798, 220, 20, '<p><span style="font-size:12px; font-weight:800; color:#334155;">🛡️ 어뷰징 차단 캡 (Anti-Abuse)</span></p>', '12px', '800', '#334155', 'left', 102)}
        ${badgeShape('rk-pnl3-badge', 1435, 798, 105, 20, '1일 3회 상한', '#f1f5f9', '#e2e8f0', '#334155', '10.5px', '4px', 102)}
        ${textShape('rk-pnl3-desc', 1148, 822, 395, 30, '<p style="font-size:11px; color:#475569; margin:0;">• 동일 IP/계정 1일 PV 최대 3회 인정 + 매크로 장바구니/위시 원천 차단</p>', '11px', '400', '#475569', 'left', 102)}

    </div>
</body>
</html>`;

fs.writeFileSync('data/p_lus0e/10_Product_Ranking_Rules_850.html', html, 'utf8');
console.log("Atomic standard HTML successfully generated! Length: " + html.length);
