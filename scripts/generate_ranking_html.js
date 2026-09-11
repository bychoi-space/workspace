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
function logoShape(id, left, top, width, height, logoBase64, maskColor = '#ffffff', zIndex = 102) {
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
        ${rectShape('rk-hdr-bg', 30, 18, 1540, 54, '#0f172a', '#1e293b', '10px', 100)}

        <!-- 헤더 메인 아이콘 -->
        ${iconShape('rk-hdr-icon', 45, 29, 32, 32, '<rect width="24" height="24" rx="6" fill="#2563eb"></rect><path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9" stroke="#ffffff" stroke-width="2"></path><path d="M9 18h6" stroke="#ffffff" stroke-width="2"></path><path d="M10 22h4" stroke="#ffffff" stroke-width="2"></path>', '#ffffff', 101)}

        <!-- 헤더 타이틀 -->
        ${textShape('rk-hdr-title', 88, 31, 560, 28, '<p style="white-space:nowrap;"><span style="font-size:17px; font-weight:800; color:#f8fafc;">시선닷컴 상품 랭킹 산정 룰 (Ranking Algorithm Policy)</span></p>', '17px', '800', '#f8fafc', 'left', 101)}

        <!-- 헤더 서브 타이틀 -->
        ${textShape('rk-hdr-sub', 630, 36, 360, 20, '<p style="white-space:nowrap;"><span style="font-size:13px; font-weight:500; color:#94a3b8;">3대 패션 브랜드(MICHAA · it MICHAA · E.B.M) 복합 밸런싱 모델</span></p>', '13px', '500', '#94a3b8', 'left', 101)}

        <!-- 헤더 브랜드 로고 뱃지 3종 -->
        ${rectShape('rk-hdr-b1-bg', 1130, 30, 92, 30, '#1e293b', '#334155', '6px', 101)}
        ${logoShape('rk-hdr-b1-logo', 1130, 30, 92, 30, logos.michaa, '#ffffff', 102)}

        ${rectShape('rk-hdr-b2-bg', 1230, 30, 92, 30, '#1e293b', '#334155', '6px', 101)}
        ${logoShape('rk-hdr-b2-logo', 1230, 30, 92, 30, logos.itmichaa, '#ffffff', 102)}

        ${rectShape('rk-hdr-b3-bg', 1330, 30, 92, 30, '#1e293b', '#334155', '6px', 101)}
        ${logoShape('rk-hdr-b3-logo', 1330, 30, 92, 30, logos.ebm, '#ffffff', 102)}

        <!-- 버전 뱃지 -->
        ${badgeShape('rk-hdr-ver', 1430, 30, 125, 30, 'ALGORITHM V2.0', '#1e293b', '#3b82f6', '#93c5fd', '11.5px', '15px', 101)}


        <!-- ======================================================== -->
        <!-- [2] COLUMN 1 (좌측 450px): 브랜드 포트폴리오 & 전/후 비교    -->
        <!-- ======================================================== -->
        <!-- 대형 카드 1 배경 -->
        ${rectShape('rk-c1-bg', 30, 86, 450, 488, '#ffffff', '#e2e8f0', '12px', 100)}

        <!-- 카드 1 헤더 아이콘 & 타이틀 -->
        ${iconShape('rk-c1-icon', 48, 100, 22, 22, '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>', '#2563eb', 101)}
        ${textShape('rk-c1-title', 78, 98, 280, 26, '<p style="white-space:nowrap;"><span style="font-size:17px; font-weight:800; color:#0f172a;">1. 3대 브랜드 포트폴리오 &amp; 원칙</span></p>', '17px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c1-badge', 375, 99, 90, 24, '3 BRANDS', '#f1f5f9', '#e2e8f0', '#334155', '11px', '6px', 101)}

        <!-- 브랜드 1: MICHAA (50만 ~ 200만원) -->
        ${rectShape('rk-b1-card', 44, 134, 422, 102, '#ffffff', '#e2e8f0', '10px', 101)}
        ${logoShape('rk-b1-logo', 56, 144, 96, 32, logos.michaa, '#0f172a', 102)}
        ${badgeShape('rk-b1-price', 315, 144, 140, 26, '평균 50만 ~ 200만원', '#f8fafc', '#cbd5e1', '#0f172a', '12px', '13px', 102)}
        ${textShape('rk-b1-desc', 56, 184, 400, 46, '<p style="font-size:13.5px; line-height:1.5; color:#334155;">• <span style="font-weight:700; color:#0f172a;">하이엔드 럭셔리</span>: <strong>주문금액(35%)</strong> 가중치로 고가 코트 랭킹 보장</p>', '13.5px', '400', '#334155', 'left', 102)}

        <!-- 브랜드 2: it MICHAA (10만 ~ 50만원) -->
        ${rectShape('rk-b2-card', 44, 246, 422, 102, '#ffffff', '#e2e8f0', '10px', 101)}
        ${logoShape('rk-b2-logo', 56, 256, 96, 32, logos.itmichaa, '#0f172a', 102)}
        ${badgeShape('rk-b2-price', 315, 256, 140, 26, '평균 10만 ~ 50만원', '#f8fafc', '#cbd5e1', '#0f172a', '12px', '13px', 102)}
        ${textShape('rk-b2-desc', 56, 296, 400, 46, '<p style="font-size:13.5px; line-height:1.5; color:#334155;">• <span style="font-weight:700; color:#0f172a;">영 컨템포러리</span>: <strong>판매수량(25%) + 장바구니(15%)</strong> 대중 인기 검증</p>', '13.5px', '400', '#334155', 'left', 102)}

        <!-- 브랜드 3: E.B.M (10만 ~ 30만원) -->
        ${rectShape('rk-b3-card', 44, 358, 422, 102, '#ffffff', '#e2e8f0', '10px', 101)}
        ${logoShape('rk-b3-logo', 56, 368, 96, 32, logos.ebm, '#0f172a', 102)}
        ${badgeShape('rk-b3-price', 315, 368, 140, 26, '평균 10만 ~ 30만원', '#f8fafc', '#cbd5e1', '#0f172a', '12px', '13px', 102)}
        ${textShape('rk-b3-desc', 56, 408, 400, 46, '<p style="font-size:13.5px; line-height:1.5; color:#334155;">• <span style="font-weight:700; color:#0f172a;">트렌드 캐주얼</span>: <strong>신상품 3단계 부스팅(1.5x)</strong>으로 빠른 신상 회전 지원</p>', '13.5px', '400', '#334155', 'left', 102)}

        <!-- 하단 브랜드 밸런서 칩 (Word-wrap 버그 완전 해결) -->
        ${rectShape('rk-b-balance-bg', 44, 470, 422, 90, '#f8fafc', '#e2e8f0', '8px', 101)}
        ${textShape('rk-b-balance-title', 56, 478, 400, 22, '<p><span style="font-size:13.5px; font-weight:800; color:#1e40af;">⚖️ 브랜드별 객단가 정규화 (Brand Normalization)</span></p>', '13.5px', '800', '#1e40af', 'left', 102)}
        ${multiLineText('rk-b-balance-desc', 56, 502, 398, 50, '미샤(평균 120만)와 잇미샤(평균 30만) 간의 가격 편차를 브랜드별 평균치로 정규화하여 통합 랭킹 공정성을 확보합니다.', '12.5px', '400', '#475569', '1.5', 102)}


        <!-- 대형 카드 2: 랭킹 개선 전/후 비교 (BEFORE / AFTER) -->
        ${rectShape('rk-c1-sub-bg', 30, 590, 450, 288, '#ffffff', '#e2e8f0', '12px', 100)}
        ${textShape('rk-c1-sub-title', 48, 604, 290, 26, '<p style="white-space:nowrap;"><span style="font-size:16px; font-weight:800; color:#0f172a;">단순 판매량 집계 한계 극복 (Before / After)</span></p>', '16px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c1-sub-badge', 360, 604, 105, 24, 'COMPARISON', '#f1f5f9', '#e2e8f0', '#475569', '11px', '4px', 101)}

        <!-- Before 박스 -->
        ${rectShape('rk-box-before-bg', 44, 638, 422, 112, '#fef2f2', '#fecaca', '8px', 101)}
        ${textShape('rk-box-before-title', 56, 646, 400, 22, '<p><span style="font-size:13px; font-weight:800; color:#b91c1c;">⚠️ BEFORE (현행 단순 주문수 집계 시)</span></p>', '13px', '800', '#b91c1c', 'left', 102)}
        ${multiLineText('rk-box-before-desc', 56, 672, 398, 70, '• <strong>3만원 기본 티셔츠 100건</strong> ➔ <span style="color:#b91c1c; font-weight:800;">랭킹 1위 독점 (저가 왜곡)</span><br>• <strong>90만원 미샤 코트 10건(매출 900만)</strong> ➔ <span style="color:#64748b; font-weight:700;">랭킹 48위 탈락</span>', '13px', '400', '#334155', '1.5', 102)}

        <!-- After 박스 -->
        ${rectShape('rk-box-after-bg', 44, 758, 422, 108, '#f0fdf4', '#bbf7d0', '8px', 101)}
        ${textShape('rk-box-after-title', 56, 766, 400, 22, '<p><span style="font-size:13px; font-weight:800; color:#15803d;">✅ AFTER (신규 6대 복합 랭킹 룰 적용 시)</span></p>', '13px', '800', '#15803d', 'left', 102)}
        ${multiLineText('rk-box-after-desc', 56, 792, 398, 68, '• <strong>미샤 코트</strong>: 매출(35%) + 장바구니 ➔ <span style="color:#15803d; font-weight:800;">종합 2위 안착</span><br>• <strong>3만원 티셔츠</strong>: 수량(25%) 우세하나 Log 정규화 ➔ <span style="color:#047857; font-weight:700;">종합 5위 균형</span>', '13px', '400', '#334155', '1.5', 102)}


        <!-- ======================================================== -->
        <!-- [3] COLUMN 2 (중앙 600px): 6대 지표 원형 그래프 & 카드    -->
        <!-- ======================================================== -->
        ${rectShape('rk-c2-bg', 500, 86, 600, 792, '#ffffff', '#e2e8f0', '12px', 100)}

        <!-- 카드 2 헤더 아이콘 & 타이틀 -->
        ${iconShape('rk-c2-icon', 520, 100, 22, 22, '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', '#2563eb', 101)}
        ${textShape('rk-c2-title', 548, 98, 420, 26, '<p style="white-space:nowrap;"><span style="font-size:17px; font-weight:800; color:#0f172a;">2. 6대 지표 가중치 매트릭스 (Total Weights 100%)</span></p>', '17px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c2-badge', 975, 99, 110, 24, 'CORE MATRIX', '#f1f5f9', '#e2e8f0', '#334155', '11px', '6px', 101)}

        <!-- 대형 SVG 원형 도넛 그래프 (절제된 블루 & 슬레이트 톤) -->
        <div id="rk-donut-chart" class="lf-component" style="position: absolute; top: 140px; left: 526px; width: 200px; height: 200px; z-index: 101;" data-resized="true">
            <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                <!-- Track -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f8fafc" stroke-width="26"></circle>
                <!-- 1: 매출 35% (153.94) - 로열 블루 메인 강조 -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#2563eb" stroke-width="26" stroke-dasharray="153.94 285.88" stroke-dashoffset="0"></circle>
                <!-- 2: 수량 25% (109.96) - 스카이 블루 -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#0ea5e9" stroke-width="26" stroke-dasharray="109.96 329.86" stroke-dashoffset="-153.94"></circle>
                <!-- 3: 장바구니 15% (65.97) - 딥 슬레이트 블루 -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#475569" stroke-width="26" stroke-dasharray="65.97 373.85" stroke-dashoffset="-263.90"></circle>
                <!-- 4: 위시리스트 10% (43.98) - 슬레이트 -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#64748b" stroke-width="26" stroke-dasharray="43.98 395.84" stroke-dashoffset="-329.87"></circle>
                <!-- 5: UV 10% (43.98) - 라이트 슬레이트 -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#94a3b8" stroke-width="26" stroke-dasharray="43.98 395.84" stroke-dashoffset="-373.85"></circle>
                <!-- 6: PV 5% (21.99) - 서브트랙 -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#cbd5e1" stroke-width="26" stroke-dasharray="21.99 417.83" stroke-dashoffset="-417.83"></circle>
            </svg>
        </div>

        <!-- 도넛 중앙 텍스트 -->
        ${textShape('rk-donut-val', 566, 210, 120, 36, '<p style="text-align:center;"><span style="font-size:32px; font-weight:900; color:#0f172a; line-height:1;">100%</span></p>', '32px', '900', '#0f172a', 'center', 102)}
        ${textShape('rk-donut-sub', 566, 248, 120, 18, '<p style="text-align:center;"><span style="font-size:11px; font-weight:700; color:#64748b; letter-spacing:0.5px;">TOTAL WEIGHTS</span></p>', '11px', '700', '#64748b', 'center', 102)}

        <!-- 우측 범례 칩 6종 (미니 아이콘 탑재 & 폰트 확대) -->
        <!-- 1. 주문금액 -->
        ${rectShape('rk-leg1-bg', 746, 140, 338, 32, '#eff6ff', '#bfdbfe', '6px', 101)}
        ${iconShape('rk-leg1-ico', 756, 147, 16, 16, '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>', '#2563eb', 102)}
        ${textShape('rk-leg1-lbl', 778, 145, 205, 22, '<p><span style="font-size:13.5px; font-weight:700; color:#1e3a8a;">주문금액 (매출 기여도)</span></p>', '13.5px', '700', '#1e3a8a', 'left', 102)}
        ${textShape('rk-leg1-val', 1020, 144, 55, 24, '<p style="text-align:right;"><span style="font-size:16px; font-weight:900; color:#1d4ed8;">35%</span></p>', '16px', '900', '#1d4ed8', 'right', 102)}

        <!-- 2. 주문수량 -->
        ${rectShape('rk-leg2-bg', 746, 178, 338, 32, '#f0f9ff', '#bae6fd', '6px', 101)}
        ${iconShape('rk-leg2-ico', 756, 185, 16, 16, '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>', '#0ea5e9', 102)}
        ${textShape('rk-leg2-lbl', 778, 183, 205, 22, '<p><span style="font-size:13.5px; font-weight:700; color:#0369a1;">주문수량 (순수 주문건수)</span></p>', '13.5px', '700', '#0369a1', 'left', 102)}
        ${textShape('rk-leg2-val', 1020, 182, 55, 24, '<p style="text-align:right;"><span style="font-size:16px; font-weight:900; color:#0284c7;">25%</span></p>', '16px', '900', '#0284c7', 'right', 102)}

        <!-- 3. 장바구니 -->
        ${rectShape('rk-leg3-bg', 746, 216, 338, 32, '#f8fafc', '#e2e8f0', '6px', 101)}
        ${iconShape('rk-leg3-ico', 756, 223, 16, 16, '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>', '#475569', 102)}
        ${textShape('rk-leg3-lbl', 778, 221, 205, 22, '<p><span style="font-size:13.5px; font-weight:700; color:#334155;">장바구니 (고관여 구매의향)</span></p>', '13.5px', '700', '#334155', 'left', 102)}
        ${textShape('rk-leg3-val', 1020, 220, 55, 24, '<p style="text-align:right;"><span style="font-size:16px; font-weight:900; color:#0f172a;">15%</span></p>', '16px', '900', '#0f172a', 'right', 102)}

        <!-- 4. 위시리스트 -->
        ${rectShape('rk-leg4-bg', 746, 254, 338, 32, '#f8fafc', '#e2e8f0', '6px', 101)}
        ${iconShape('rk-leg4-ico', 756, 261, 16, 16, '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>', '#64748b', 102)}
        ${textShape('rk-leg4-lbl', 778, 259, 205, 22, '<p><span style="font-size:13.5px; font-weight:700; color:#334155;">위시리스트 (찜·선호도)</span></p>', '13.5px', '700', '#334155', 'left', 102)}
        ${textShape('rk-leg4-val', 1020, 258, 55, 24, '<p style="text-align:right;"><span style="font-size:16px; font-weight:900; color:#0f172a;">10%</span></p>', '16px', '900', '#0f172a', 'right', 102)}

        <!-- 5. 순수방문자 UV -->
        ${rectShape('rk-leg5-bg', 746, 292, 338, 32, '#f8fafc', '#e2e8f0', '6px', 101)}
        ${iconShape('rk-leg5-ico', 756, 299, 16, 16, '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', '#94a3b8', 102)}
        ${textShape('rk-leg5-lbl', 778, 297, 205, 22, '<p><span style="font-size:13.5px; font-weight:700; color:#334155;">순수방문자 UV (모객 파워)</span></p>', '13.5px', '700', '#334155', 'left', 102)}
        ${textShape('rk-leg5-val', 1020, 296, 55, 24, '<p style="text-align:right;"><span style="font-size:16px; font-weight:900; color:#0f172a;">10%</span></p>', '16px', '900', '#0f172a', 'right', 102)}

        <!-- 6. 페이지뷰 PV -->
        ${rectShape('rk-leg6-bg', 746, 330, 338, 32, '#f8fafc', '#e2e8f0', '6px', 101)}
        ${iconShape('rk-leg6-ico', 756, 337, 16, 16, '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>', '#cbd5e1', 102)}
        ${textShape('rk-leg6-lbl', 778, 335, 205, 22, '<p><span style="font-size:13.5px; font-weight:700; color:#475569;">페이지뷰 PV (트래픽 총량)</span></p>', '13.5px', '700', '#475569', 'left', 102)}
        ${textShape('rk-leg6-val', 1020, 334, 55, 24, '<p style="text-align:right;"><span style="font-size:16px; font-weight:900; color:#475569;">5%</span></p>', '16px', '900', '#475569', 'right', 102)}


        <!-- 6대 지표 2열 3행 비주얼 카드 (아이콘 탑재 & 폰트 확대) -->
        <!-- 1행 좌: 주문금액 (35%) - 메인 강조 -->
        ${rectShape('rk-m1-bg', 520, 376, 274, 96, '#ffffff', '#bfdbfe', '10px', 101)}
        ${iconShape('rk-m1-ico', 534, 388, 20, 20, '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>', '#2563eb', 102)}
        ${textShape('rk-m1-title', 560, 386, 144, 24, '<p><span style="font-size:15px; font-weight:800; color:#1e3a8a;">주문금액 (S_rev)</span></p>', '15px', '800', '#1e3a8a', 'left', 102)}
        ${textShape('rk-m1-val', 716, 382, 68, 32, '<p style="text-align:right;"><span style="font-size:28px; font-weight:900; color:#2563eb;">35%</span></p>', '28px', '900', '#2563eb', 'right', 102)}
        ${multiLineText('rk-m1-desc', 534, 418, 250, 48, '• log10 정규화 · 고가 코트 매출 기여도 인정', '12.5px', '400', '#475569', '1.45', 102)}

        <!-- 1행 우: 주문수량 (25%) -->
        ${rectShape('rk-m2-bg', 810, 376, 274, 96, '#ffffff', '#e2e8f0', '10px', 101)}
        ${iconShape('rk-m2-ico', 824, 388, 20, 20, '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>', '#0ea5e9', 102)}
        ${textShape('rk-m2-title', 850, 386, 144, 24, '<p><span style="font-size:15px; font-weight:800; color:#0f172a;">주문수량 (S_vol)</span></p>', '15px', '800', '#0f172a', 'left', 102)}
        ${textShape('rk-m2-val', 1006, 382, 68, 32, '<p style="text-align:right;"><span style="font-size:28px; font-weight:900; color:#0ea5e9;">25%</span></p>', '28px', '900', '#0ea5e9', 'right', 102)}
        ${multiLineText('rk-m2-desc', 824, 418, 250, 48, '• 주문건수 정규화 · 실구매 고객 대중성 검증', '12.5px', '400', '#475569', '1.45', 102)}

        <!-- 2행 좌: 장바구니 (15%) -->
        ${rectShape('rk-m3-bg', 520, 484, 274, 96, '#ffffff', '#e2e8f0', '10px', 101)}
        ${iconShape('rk-m3-ico', 534, 496, 20, 20, '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>', '#475569', 102)}
        ${textShape('rk-m3-title', 560, 494, 144, 24, '<p><span style="font-size:15px; font-weight:800; color:#0f172a;">장바구니 (S_cart)</span></p>', '15px', '800', '#0f172a', 'left', 102)}
        ${textShape('rk-m3-val', 716, 490, 68, 32, '<p style="text-align:right;"><span style="font-size:28px; font-weight:900; color:#0f172a;">15%</span></p>', '28px', '900', '#0f172a', 'right', 102)}
        ${multiLineText('rk-m3-desc', 534, 526, 250, 48, '• 장바구니 담김수 · 구매 직전 전환 의향(High Intent)', '12.5px', '400', '#475569', '1.45', 102)}

        <!-- 2행 우: 위시리스트 (10%) -->
        ${rectShape('rk-m4-bg', 810, 484, 274, 96, '#ffffff', '#e2e8f0', '10px', 101)}
        ${iconShape('rk-m4-ico', 824, 496, 20, 20, '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>', '#64748b', 102)}
        ${textShape('rk-m4-title', 850, 494, 144, 24, '<p><span style="font-size:15px; font-weight:800; color:#0f172a;">위시리스트 (S_wish)</span></p>', '15px', '800', '#0f172a', 'left', 102)}
        ${textShape('rk-m4-val', 1006, 490, 68, 32, '<p style="text-align:right;"><span style="font-size:28px; font-weight:900; color:#0f172a;">10%</span></p>', '28px', '900', '#0f172a', 'right', 102)}
        ${multiLineText('rk-m4-desc', 824, 526, 250, 48, '• 위시 찜수 · 잠재 고객 선호도 및 브랜드 충성도', '12.5px', '400', '#475569', '1.45', 102)}

        <!-- 3행 좌: 순수방문자 UV (10%) -->
        ${rectShape('rk-m5-bg', 520, 592, 274, 96, '#ffffff', '#e2e8f0', '10px', 101)}
        ${iconShape('rk-m5-ico', 534, 604, 20, 20, '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', '#94a3b8', 102)}
        ${textShape('rk-m5-title', 560, 602, 144, 24, '<p><span style="font-size:15px; font-weight:800; color:#0f172a;">순수방문자 (S_uv)</span></p>', '15px', '800', '#0f172a', 'left', 102)}
        ${textShape('rk-m5-val', 716, 598, 68, 32, '<p style="text-align:right;"><span style="font-size:28px; font-weight:900; color:#0f172a;">10%</span></p>', '28px', '900', '#0f172a', 'right', 102)}
        ${multiLineText('rk-m5-desc', 534, 634, 250, 48, '• Unique Visitors · 어뷰징 배제 순수 모객 파워', '12.5px', '400', '#475569', '1.45', 102)}

        <!-- 3행 우: 페이지뷰 PV (5%) -->
        ${rectShape('rk-m6-bg', 810, 592, 274, 96, '#ffffff', '#e2e8f0', '10px', 101)}
        ${iconShape('rk-m6-ico', 824, 604, 20, 20, '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>', '#cbd5e1', 102)}
        ${textShape('rk-m6-title', 850, 602, 144, 24, '<p><span style="font-size:15px; font-weight:800; color:#475569;">페이지뷰 (S_pv)</span></p>', '15px', '800', '#475569', 'left', 102)}
        ${textShape('rk-m6-val', 1006, 598, 68, 32, '<p style="text-align:right;"><span style="font-size:28px; font-weight:900; color:#475569;">5%</span></p>', '28px', '900', '#475569', 'right', 102)}
        ${multiLineText('rk-m6-desc', 824, 634, 250, 48, '• PV (1인 1일 3회 캡) · 매크로 클릭 차단 트래픽', '12.5px', '400', '#475569', '1.45', 102)}

        <!-- 하단 종합 랭킹 수식 바 (오버플로우 방지 12px 핏팅) -->
        ${rectShape('rk-fml-bg', 520, 702, 564, 164, '#0f172a', '#1e293b', '10px', 101)}
        ${textShape('rk-fml-title', 536, 712, 420, 24, '<p><span style="font-size:14px; font-weight:800; color:#60a5fa;">📐 종합 랭킹 점수 승산 수식 (Multiplicative Model)</span></p>', '14px', '800', '#60a5fa', 'left', 102)}
        ${badgeShape('rk-fml-badge', 975, 712, 95, 22, 'FINAL SCORE', '#1e293b', '#334155', '#94a3b8', '11px', '4px', 102)}

        ${rectShape('rk-fml-chip-bg', 536, 742, 532, 38, '#1e293b', '#334155', '6px', 102)}
        ${textShape('rk-fml-chip-text', 536, 750, 532, 24, '<p style="text-align:center; font-family:monospace; font-size:12px; font-weight:700; color:#38bdf8; margin:0; letter-spacing:0.2px;">Total Score = [ Base Score (100%) ] × F_freshness × F_decay × F_brand</p>', '12px', '700', '#38bdf8', 'center', 103)}

        ${multiLineText('rk-fml-desc', 536, 788, 532, 70, '• <span style="color:#e2e8f0; font-weight:600;">Base Score</span> = 0.35·S_rev + 0.25·S_vol + 0.15·S_cart + 0.10·S_wish + 0.10·S_uv + 0.05·S_pv<br>• 기본 가중치 합산 점수에 신상품 부스트, 시간 감쇠, 브랜드 보정을 순차 승산하여 최종 산출', '12.5px', '400', '#94a3b8', '1.5', 102)}


        <!-- ======================================================== -->
        <!-- [4] COLUMN 3 (우측 450px): 상품 라이프사이클 밸런서 (통합)    -->
        <!-- ======================================================== -->
        <!-- 단일 통합 카드 배경: 3. 상품 라이프사이클 밸런서 -->
        ${rectShape('rk-c3-bg', 1120, 86, 450, 792, '#ffffff', '#e2e8f0', '12px', 100)}

        <!-- 통합 헤더 아이콘 & 타이틀 -->
        ${iconShape('rk-c3-hdr-ico', 1138, 100, 22, 22, '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', '#2563eb', 101)}
        ${textShape('rk-c3-title', 1168, 98, 275, 26, '<p style="white-space:nowrap;"><span style="font-size:17px; font-weight:800; color:#0f172a;">3. 상품 라이프사이클 밸런서</span></p>', '17px', '800', '#0f172a', 'left', 101)}
        ${badgeShape('rk-c3-badge', 1465, 99, 90, 24, 'DUAL ENGINE', '#eff6ff', '#bfdbfe', '#1d4ed8', '11px', '6px', 101)}

        <!-- [PHASE 1] 신상품 런칭 부스팅 (0~30일) -->
        ${textShape('rk-p1-title', 1138, 134, 380, 24, '<p><span style="font-size:14px; font-weight:800; color:#1e40af;">🚀 PHASE 1: 신상품 콜드스타트 극복 부스팅 (0 ~ 30일)</span></p>', '14px', '800', '#1e40af', 'left', 101)}

        <!-- 3단계 게이지 카드 (가로 3분할) -->
        <!-- Step 1: 1~7일 -->
        ${rectShape('rk-bst1-bg', 1136, 166, 132, 130, '#eff6ff', '#bfdbfe', '10px', 101)}
        ${textShape('rk-bst1-period', 1136, 176, 132, 20, '<p style="text-align:center;"><span style="font-size:12.5px; font-weight:700; color:#1e40af;">출시 1 ~ 7일차</span></p>', '12.5px', '700', '#1e40af', 'center', 102)}
        ${textShape('rk-bst1-rate', 1136, 198, 132, 34, '<p style="text-align:center;"><span style="font-size:28px; font-weight:900; color:#2563eb;">× 1.50</span></p>', '28px', '900', '#2563eb', 'center', 102)}
        ${textShape('rk-bst1-name', 1136, 238, 132, 22, '<p style="text-align:center;"><span style="font-size:13px; font-weight:800; color:#1e3a8a;">슈퍼 부스트</span></p>', '13px', '800', '#1e3a8a', 'center', 102)}
        ${textShape('rk-bst1-desc', 1136, 262, 132, 20, '<p style="text-align:center;"><span style="font-size:11.5px; color:#3b82f6;">초기 노출 극대화</span></p>', '11.5px', '400', '#3b82f6', 'center', 102)}

        <!-- Step 2: 8~14일 -->
        ${rectShape('rk-bst2-bg', 1278, 166, 132, 130, '#f8fafc', '#e2e8f0', '10px', 101)}
        ${textShape('rk-bst2-period', 1278, 176, 132, 20, '<p style="text-align:center;"><span style="font-size:12.5px; font-weight:700; color:#334155;">출시 8 ~ 14일차</span></p>', '12.5px', '700', '#334155', 'center', 102)}
        ${textShape('rk-bst2-rate', 1278, 198, 132, 34, '<p style="text-align:center;"><span style="font-size:28px; font-weight:900; color:#0ea5e9;">× 1.30</span></p>', '28px', '900', '#0ea5e9', 'center', 102)}
        ${textShape('rk-bst2-name', 1278, 238, 132, 22, '<p style="text-align:center;"><span style="font-size:13px; font-weight:800; color:#0f172a;">성장 부스트</span></p>', '13px', '800', '#0f172a', 'center', 102)}
        ${textShape('rk-bst2-desc', 1278, 262, 132, 20, '<p style="text-align:center;"><span style="font-size:11.5px; color:#64748b;">장바구니 반응 검증</span></p>', '11.5px', '400', '#64748b', 'center', 102)}

        <!-- Step 3: 15~30일 -->
        ${rectShape('rk-bst3-bg', 1420, 166, 134, 130, '#f8fafc', '#e2e8f0', '10px', 101)}
        ${textShape('rk-bst3-period', 1420, 176, 134, 20, '<p style="text-align:center;"><span style="font-size:12.5px; font-weight:700; color:#475569;">출시 15 ~ 30일차</span></p>', '12.5px', '700', '#475569', 'center', 102)}
        ${textShape('rk-bst3-rate', 1420, 198, 134, 34, '<p style="text-align:center;"><span style="font-size:28px; font-weight:900; color:#475569;">× 1.15</span></p>', '28px', '900', '#475569', 'center', 102)}
        ${textShape('rk-bst3-name', 1420, 238, 134, 22, '<p style="text-align:center;"><span style="font-size:13px; font-weight:800; color:#0f172a;">안착 부스트</span></p>', '13px', '800', '#0f172a', 'center', 102)}
        ${textShape('rk-bst3-desc', 1420, 262, 134, 20, '<p style="text-align:center;"><span style="font-size:11.5px; color:#64748b;">자연 랭킹 전환</span></p>', '11.5px', '400', '#64748b', 'center', 102)}

        <!-- 런칭기 운영 가이드 칩 (Word-wrap 버그 해결) -->
        ${rectShape('rk-bst-box', 1136, 308, 418, 96, '#f8fafc', '#e2e8f0', '8px', 101)}
        ${multiLineText('rk-bst-box-desc', 1148, 318, 394, 76, '• <strong>콜드스타트 극복</strong>: 실적 데이터가 없는 신규 패션 상품에 탐색 기회를 부여하여 고객 탐색 풀을 다변화합니다.<br>• <strong>30일 경과 후</strong>: 부스트 배율 1.00x로 정상 전환되어 누적 실적으로 자연 랭킹에 진입합니다.', '12.5px', '400', '#334155', '1.55', 102)}

        <!-- 구분선 -->
        <div id="rk-phase-div" class="lf-component" style="position: absolute; top: 420px; left: 1140px; width: 410px; height: 2px; z-index: 101;">
            <div style="width: 100%; border-top: 1.6px dashed #e2e8f0;"></div>
        </div>

        <!-- [PHASE 2] 트렌드 시간 감쇠 (30일 이후 정상기) -->
        ${textShape('rk-p2-title', 1138, 436, 390, 24, '<p><span style="font-size:14px; font-weight:800; color:#0f172a;">📉 PHASE 2: 고인물 독점 차단 &amp; 트렌드 순환 (30일 이후)</span></p>', '14px', '800', '#0f172a', 'left', 101)}

        <!-- 감쇠 수식 칩 -->
        ${rectShape('rk-decay-fml-bg', 1136, 468, 418, 34, '#f8fafc', '#e2e8f0', '6px', 101)}
        ${textShape('rk-decay-fml-text', 1136, 474, 418, 22, '<p style="text-align:center; font-family:monospace; font-size:13px; font-weight:800; color:#1d4ed8; margin:0;">F_decay(t) = 0.5 ^ ( t / 14 )  (14일 반감기)</p>', '13px', '800', '#1d4ed8', 'center', 102)}

        <!-- 4개 감쇠 프로그레스 바 -->
        <!-- 최근 7일 (100%) -->
        ${textShape('rk-dbar1-lbl', 1136, 516, 100, 22, '<p><span style="font-size:13.5px; font-weight:700; color:#0f172a;">최근 7일 실적</span></p>', '13.5px', '700', '#0f172a', 'left', 102)}
        ${rectShape('rk-dbar1-track', 1242, 523, 230, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar1-bar', 1242, 523, 230, 8, '#2563eb', 'transparent', '4px', 102)}
        ${textShape('rk-dbar1-val', 1475, 516, 75, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#2563eb;">100%</span></p>', '14px', '900', '#2563eb', 'right', 102)}

        <!-- 8~14일 (75%) -->
        ${textShape('rk-dbar2-lbl', 1136, 548, 100, 22, '<p><span style="font-size:13.5px; font-weight:600; color:#334155;">8 ~ 14일 전</span></p>', '13.5px', '600', '#334155', 'left', 102)}
        ${rectShape('rk-dbar2-track', 1242, 555, 230, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar2-bar', 1242, 555, 172, 8, '#0ea5e9', 'transparent', '4px', 102)}
        ${textShape('rk-dbar2-val', 1475, 548, 75, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#0ea5e9;">75%</span></p>', '14px', '900', '#0ea5e9', 'right', 102)}

        <!-- 15~30일 (50%) -->
        ${textShape('rk-dbar3-lbl', 1136, 580, 100, 22, '<p><span style="font-size:13.5px; font-weight:600; color:#334155;">15 ~ 30일 전</span></p>', '13.5px', '600', '#334155', 'left', 102)}
        ${rectShape('rk-dbar3-track', 1242, 587, 230, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar3-bar', 1242, 587, 115, 8, '#64748b', 'transparent', '4px', 102)}
        ${textShape('rk-dbar3-val', 1475, 580, 75, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#475569;">50%</span></p>', '14px', '900', '#475569', 'right', 102)}

        <!-- 31일 이후 (25%) -->
        ${textShape('rk-dbar4-lbl', 1136, 612, 100, 22, '<p><span style="font-size:13.5px; font-weight:600; color:#475569;">31일 이후</span></p>', '13.5px', '600', '#475569', 'left', 102)}
        ${rectShape('rk-dbar4-track', 1242, 619, 230, 8, '#e2e8f0', 'transparent', '4px', 101)}
        ${rectShape('rk-dbar4-bar', 1242, 619, 58, 8, '#94a3b8', 'transparent', '4px', 102)}
        ${textShape('rk-dbar4-val', 1475, 612, 75, 22, '<p style="text-align:right;"><span style="font-size:14px; font-weight:900; color:#64748b;">25% 이하</span></p>', '14px', '900', '#64748b', 'right', 102)}

        <!-- 하단 듀얼 엔진 시너지 효과 배너 (Word-wrap 버그 해결) -->
        ${rectShape('rk-decay-bnf-bg', 1136, 656, 418, 204, '#f0fdf4', '#bbf7d0', '8px', 101)}
        ${textShape('rk-decay-bnf-title', 1148, 668, 395, 24, '<p><span style="font-size:14px; font-weight:800; color:#15803d;">💡 듀얼 엔진 시너지: 생애주기 선순환 확립</span></p>', '14px', '800', '#15803d', 'left', 102)}
        ${multiLineText('rk-decay-bnf-desc', 1148, 700, 394, 145, '• <strong>액셀러레이터 (부스팅)</strong>: 신상품은 초기에 노출 기회를 얻어 고객 반응을 빠르게 검증받습니다.<br><br>• <strong>브레이크 (시간 감쇠)</strong>: 과거 히트 상품은 14일 반감기로 점수를 덜어내어, 과거 누적 실적에 안주하는 고인물 상품의 상위 독점을 완전 차단합니다.<br><br>• <strong>결과</strong>: 언제 쇼핑몰에 방문해도 <strong>지금 가장 핫한 트렌드 상품</strong>이 랭킹 상위를 유지합니다.', '13px', '400', '#166534', '1.6', 102)}

    </div>
</body>
</html>`;

fs.writeFileSync('data/p_lus0e/10_Product_Ranking_Rules_850.html', html, 'utf8');
console.log("Unified Lifecycle High-Precision HTML successfully generated! Length: " + html.length);
