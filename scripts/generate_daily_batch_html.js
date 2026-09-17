const fs = require('fs');

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
        <div id="${id}" class="lf-component v4-text-shape" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex}; --v4-text-adjust-y: 0px; --v4-text-shape-pad-y: 2px; min-width: unset !important; min-height: unset !important; white-space: nowrap !important;">
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; display: block; text-align: ${align}; width: 100%; height: 100%; padding: 2px 3px !important; box-sizing: border-box; line-height: 1.2; white-space: nowrap !important;">
                ${contentHtml}
            </div>
        </div>`;
}

// Helper to create a Multi-line Flow Container Text component
function multiLineText(id, left, top, width, height, contentHtml, fontSize = '13px', fontWeight = '400', color = '#334155', lineHeight = '1.5', zIndex = 102) {
    return `
        <!-- Multi-line Flow Text: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: transparent; border: 1.6px solid transparent; box-sizing: border-box;">
                <div class="v4-shape-text-content" style="width: 100%; height: 100%; text-align: left !important; align-items: flex-start !important; padding: 4px 8px !important; box-sizing: border-box;">
                    <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; text-align: left !important; width: 100%; height: 100%; box-sizing: border-box; word-break: keep-all; line-height: ${lineHeight}; padding: 0 !important; white-space: normal !important; align-items: flex-start !important; margin: 0px !important;">
                        ${contentHtml}
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
                <div class="v4-shape-text-content" style="width: 100%; text-align: center; padding: 4px 8px !important; height: 100%;">
                    <p style="margin: 0;"><span style="font-size: ${fontSize}; font-weight: 700; color: ${textColor}; white-space: nowrap !important;">${text}</span></p>
                </div>
            </div>
        </div>`;
}

// Helper to create an SVG Icon component
function iconShape(id, left, top, width, height, svgInner, color = '#2563eb', zIndex = 102) {
    return `
        <!-- Icon Shape: ${id} -->
        <div id="${id}" class="lf-component" style="position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; z-index: ${zIndex};">
            <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; background-image: none !important;">
                ${svgInner}
            </svg>
        </div>`;
}

let components = [];

// ==========================================
// [0] HEADER (Top: 20, Left: 20, W: 1560, H: 54)
// ==========================================
components.push(rectShape('hdr_bg', 20, 20, 1560, 54, '#0f172a', '#1e293b', '10px', 100));
components.push(iconShape('hdr_icon', 38, 34, 26, 26, `
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
    <line x1="6" y1="6" x2="6.01" y2="6"></line>
    <line x1="6" y1="18" x2="6.01" y2="18"></line>
`, '#38bdf8', 105));
components.push(textShape('hdr_title', 76, 33, 480, 28, `<p style="white-space: nowrap !important;"><strong style="color: #ffffff; font-size: 18px; white-space: nowrap !important;">시선닷컴 상품 랭킹 일간 배치 &amp; 백분위 정규화 파이프라인</strong></p>`, '18px', '800', '#ffffff', 'left', 105));
components.push(badgeShape('hdr_tag', 1330, 32, 230, 30, 'DAILY BATCH & PERCENTILE PIPELINE', '#1e293b', '#38bdf8', '#38bdf8', '12px', '6px', 105));

// ==========================================
// [1] SECTION 1: 일간 배치 아키텍처 및 라이프사이클 (Top: 86, Left: 20, W: 1560, H: 174)
// ==========================================
components.push(rectShape('s1_container', 20, 86, 1560, 174, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s1_lbl', 40, 102, 340, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">1. 일간 배치 스케줄 및 데이터 라이프사이클 (Daily Lifecycle)</strong></p>`, '15px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s1_tag', 390, 102, 170, 24, '매일 새벽 03:00 정기 가동', '#eff6ff', '#bfdbfe', '#1d4ed8', '12px', '4px', 102));

// 4개 스테이지 카드 (W: 360, H: 110, Gap: 20)
// Step 1: 40px
components.push(rectShape('s1_c1_bg', 40, 134, 360, 112, '#f8fafc', '#e2e8f0', '8px', 101));
components.push(badgeShape('s1_c1_badge', 54, 144, 95, 22, 'STAGE 1 · 00:00', '#0f172a', '#334155', '#38bdf8', '12px', '4px', 103));
components.push(textShape('s1_c1_title', 158, 144, 180, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #0f172a; white-space: nowrap !important;">원천 데이터 집계 마감</strong></p>`, '14px', '700', '#0f172a', 'left', 103));
components.push(multiLineText('s1_c1_desc', 54, 172, 335, 66, `
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #334155;">• 전일(D-1) 23:59:59 마감 주문/결제/행동 로그 확정</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #334155;">• 어뷰징 필터링 (PV 1인 1일 3회 캡, 대량 사입 캡)</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #64748b;">• 품절/단종 상품 실시간 제외 플래그 적용</span></p>
`, '13px', '400', '#334155', '1.5', 103));

// Step 2: 426px
components.push(rectShape('s1_c2_bg', 426, 134, 360, 112, '#eff6ff', '#bfdbfe', '8px', 101));
components.push(badgeShape('s1_c2_badge', 440, 144, 95, 22, 'STAGE 2 · 03:00', '#1d4ed8', '#1e40af', '#ffffff', '12px', '4px', 103));
components.push(textShape('s1_c2_title', 544, 144, 180, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #1e3a8a; white-space: nowrap !important;">백분위 정규화 배치 연산</strong></p>`, '14px', '700', '#1e3a8a', 'left', 103));
components.push(multiLineText('s1_c2_desc', 440, 172, 335, 66, `
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #1e3a8a;">• <strong>카테고리/브랜드 풀 분리</strong> 후 지표별 0~100점 환산</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #1e3a8a;">• 6대 복합 가중치(35%~5%) 합산으로 Base Score 산출</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #2563eb;">• 신상품 라이프사이클 부스팅(1.5x~1.0x) 승산 처리</span></p>
`, '13px', '400', '#1e3a8a', '1.5', 103));

// Step 3: 812px
components.push(rectShape('s1_c3_bg', 812, 134, 360, 112, '#f0fdf4', '#bbf7d0', '8px', 101));
components.push(badgeShape('s1_c3_badge', 826, 144, 95, 22, 'STAGE 3 · 03:30', '#15803d', '#166534', '#ffffff', '12px', '4px', 103));
components.push(textShape('s1_c3_title', 930, 144, 180, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #14532d; white-space: nowrap !important;">정합성 검증 &amp; DB 적재</strong></p>`, '14px', '700', '#14532d', 'left', 103));
components.push(multiLineText('s1_c3_desc', 826, 172, 335, 66, `
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #14532d;">• 전일 대비 랭킹 급변동률 및 Null 결측치 이상 검증</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #14532d;">• <strong>PRODUCT_DAILY_RANKING</strong> 테이블에 일자별 저장</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #16a34a;">• 배치 실패 시 전일 스냅샷 유지 (Fail-Safe 정책)</span></p>
`, '13px', '400', '#14532d', '1.5', 103));

// Step 4: 1198px
components.push(rectShape('s1_c4_bg', 1198, 134, 362, 112, '#fdf4ff', '#f0abfc', '8px', 101));
components.push(badgeShape('s1_c4_badge', 1212, 144, 95, 22, 'STAGE 4 · 04:30', '#86198f', '#701a75', '#ffffff', '12px', '4px', 103));
components.push(textShape('s1_c4_title', 1316, 144, 180, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #581c87; white-space: nowrap !important;">Redis 캐시 웜업 &amp; 서빙</strong></p>`, '14px', '700', '#581c87', 'left', 103));
components.push(multiLineText('s1_c4_desc', 1212, 172, 335, 66, `
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #581c87;">• 카테고리/기획전별 TOP 500 Redis 메모리 캐싱 완료</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #581c87;">• 05:00 쇼핑몰 프론트(PC/MO) 랭킹 데이터 일괄 전환</span></p>
    <p style="margin: 0; line-height: 1.5;"><span style="font-size: 13px; color: #9333ea;">• DB 부하 0% 및 밀리초(ms) 단위 초고속 랭킹 조회</span></p>
`, '13px', '400', '#581c87', '1.5', 103));

// ==========================================
// [2] SECTION 2: 방안 A 백분위 순위 표준화 4단계 파이프라인 (Top: 272, Left: 20, W: 1560, H: 254)
// ==========================================
components.push(rectShape('s2_container', 20, 272, 1560, 254, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s2_lbl', 40, 288, 380, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">2. 방안 A. 백분위 순위(Percentile Rank) 표준화 4단계 알고리즘</strong></p>`, '15px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s2_tag', 430, 288, 220, 24, '단위 불일치 & 이상치 완전 왜곡 해소', '#f0fdf4', '#bbf7d0', '#15803d', '12px', '4px', 102));

// 4개 알고리즘 스텝 박스 (W: 360, H: 184)
// Box 1: 40px
components.push(rectShape('s2_b1_bg', 40, 322, 360, 188, '#f8fafc', '#e2e8f0', '8px', 101));
components.push(badgeShape('s2_b1_num', 54, 334, 60, 22, 'STEP 1', '#0f172a', '#1e293b', '#38bdf8', '12px', '4px', 103));
components.push(textShape('s2_b1_title', 124, 334, 220, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">지표별 원천 수치 집계 &amp; 캡</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(multiLineText('s2_b1_content', 54, 364, 335, 136, `
    <p style="margin: 0 0 6px 0;"><strong style="color: #1e293b; font-size: 13px;">• 6대 원천 지표 로그 취합:</strong></p>
    <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">- 결제금액 (원) / 주문수량 (개)</p>
    <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">- 장바구니 담기 (건) / 위시리스트 (건)</p>
    <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">- 순방문자 UV (명) / 페이지뷰 PV (회)</p>
    <p style="margin: 6px 0 0 0; font-size: 12px; color: #0284c7; line-height: 1.4;"><strong>※ Cap:</strong> PV 1인 1일 최대 3회 제한, 단일 주문 수량 최대 5개 상한 캡 적용</p>
`, '13px', '400', '#334155', '1.4', 103));

// Box 2: 426px
components.push(rectShape('s2_b2_bg', 426, 322, 360, 188, '#f8fafc', '#e2e8f0', '8px', 101));
components.push(badgeShape('s2_b2_num', 440, 334, 60, 22, 'STEP 2', '#0f172a', '#1e293b', '#38bdf8', '12px', '4px', 103));
components.push(textShape('s2_b2_title', 510, 334, 220, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">카테고리/브랜드 풀(Pool) 분리</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(multiLineText('s2_b2_content', 440, 364, 335, 136, `
    <p style="margin: 0 0 6px 0;"><strong style="color: #1e293b; font-size: 13px;">• 객단가 격차 보정을 위한 그룹핑:</strong></p>
    <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">- <strong>MICHAA</strong>: 고가 프리미엄 (코트/원피스)</p>
    <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">- <strong>it MICHAA</strong>: 영 컨템포러리 (10~50만원)</p>
    <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">- <strong>E.B.M</strong>: 트렌디 캐주얼 (10~30만원)</p>
    <p style="margin: 6px 0 0 0; font-size: 12px; color: #0d9488; line-height: 1.4;"><strong>※ 효과:</strong> 대카테고리 및 브랜드별 독립 풀에서 랭킹을 산정하여 저가 상품의 역차별 원천 차단</p>
`, '13px', '400', '#334155', '1.4', 103));

// Box 3: 812px
components.push(rectShape('s2_b3_bg', 812, 322, 360, 188, '#eff6ff', '#bfdbfe', '8px', 101));
components.push(badgeShape('s2_b3_num', 826, 334, 60, 22, 'STEP 3', '#1d4ed8', '#1e40af', '#ffffff', '12px', '4px', 103));
components.push(textShape('s2_b3_title', 896, 334, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #1e3a8a; white-space: nowrap !important;">상대 백분위 점수(0~100pt) 환산</strong></p>`, '14.5px', '700', '#1e3a8a', 'left', 103));
components.push(multiLineText('s2_b3_content', 826, 364, 335, 136, `
    <div style="background: #ffffff; border: 1.6px solid #93c5fd; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px;">
        <p style="margin: 0; font-size: 13.5px; font-weight: 800; color: #1e40af; text-align: center;">S = ( (N - Rank) / (N - 1) ) × 100</p>
    </div>
    <p style="margin: 0; font-size: 12.5px; color: #1e3a8a; line-height: 1.4;">• 집계 대상 상품 수 $N$개 중 순위($Rank$)</p>
    <p style="margin: 0; font-size: 12.5px; color: #1e3a8a; line-height: 1.4;">• 1위 상품 = <strong>100점</strong>, 최하위 = <strong>0점</strong> 환산</p>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #2563eb; line-height: 1.3;"><strong>※ 장점:</strong> 금액, 개수 등 단위가 완전 소멸되고 모든 지표가 동일한 0~100점 스케일로 통일됨!</p>
`, '13px', '400', '#1e3a8a', '1.4', 103));

// Box 4: 1198px
components.push(rectShape('s2_b4_bg', 1198, 322, 362, 188, '#fdf2f8', '#fbcfe8', '8px', 101));
components.push(badgeShape('s2_b4_num', 1212, 334, 60, 22, 'STEP 4', '#be185d', '#9d174d', '#ffffff', '12px', '4px', 103));
components.push(textShape('s2_b4_title', 1282, 334, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #831843; white-space: nowrap !important;">가중합산 &amp; 신상품 부스팅 승산</strong></p>`, '14.5px', '700', '#831843', 'left', 103));
components.push(multiLineText('s2_b4_content', 1212, 364, 335, 136, `
    <div style="background: #ffffff; border: 1.6px solid #f472b6; border-radius: 6px; padding: 4px 8px; margin-bottom: 6px;">
        <p style="margin: 0; font-size: 12px; font-weight: 700; color: #9d174d; text-align: center;">Base = 0.35S(GMV)+0.25S(수량)+0.15S(카트)+0.10S(위시)+0.10S(UV)+0.05S(PV)</p>
    </div>
    <div style="background: #0f172a; border-radius: 4px; padding: 4px 8px; margin-bottom: 6px;">
        <p style="margin: 0; font-size: 12.5px; font-weight: 800; color: #38bdf8; text-align: center;">Total Score = Base Score × 신상품 Boost</p>
    </div>
    <p style="margin: 0; font-size: 12px; color: #9d174d; line-height: 1.3;">• 신상품: 1~7일(1.5x), 8~14일(1.3x), 15~30일(1.15x)</p>
    <p style="margin: 0; font-size: 12px; color: #831843; line-height: 1.3;">• 최종 점수 내림차순 정렬 후 1위~N위 확정</p>
`, '13px', '400', '#831843', '1.3', 103));

// ==========================================
// [3] SECTION 3: 실무 산정 시뮬레이션 검증 (Top: 542, Left: 20, W: 1560, H: 338)
// ==========================================
components.push(rectShape('s3_container', 20, 542, 1560, 338, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s3_lbl', 40, 558, 420, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">3. 실무 산정 시뮬레이션 검증 (단위 불일치 해소 및 공정성 실증)</strong></p>`, '15px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s3_tag', 470, 558, 200, 24, 'MICHAA vs EBM vs 신상품 비교', '#eff6ff', '#bfdbfe', '#1e40af', '12px', '4px', 102));

// 3개 상품 시뮬레이션 카드 (W: 486, H: 260)
// Card 1: 40px (MICHAA 고가 코트)
components.push(rectShape('s3_c1_bg', 40, 592, 486, 268, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('s3_c1_b1', 54, 604, 75, 22, 'MICHAA', '#0f172a', '#1e293b', '#ffffff', '12px', '4px', 103));
components.push(textShape('s3_c1_title', 136, 604, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #0f172a; white-space: nowrap !important;">캐시미어 더블 코트 (150만원 / 고가)</strong></p>`, '14px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('s3_c1_b2', 420, 604, 90, 22, '출시 60일차', '#f1f5f9', '#cbd5e1', '#475569', '12px', '4px', 103));

components.push(rectShape('s3_c1_tb_bg', 54, 632, 458, 120, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('s3_c1_metrics', 60, 636, 446, 112, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
            <tr style="background: #f1f5f9; color: #475569; border-bottom: 1.6px solid #e2e8f0;">
                <th style="padding: 4px;">지표 항목</th>
                <th style="padding: 4px;">원천 실적</th>
                <th style="padding: 4px;">백분위 점수(S)</th>
                <th style="padding: 4px;">가중치</th>
                <th style="padding: 4px;">환산 점수</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">결제금액</td>
                <td style="padding: 3px; color: #2563eb;">1,500,000원</td>
                <td style="padding: 3px; font-weight: 700;">98 pt</td>
                <td style="padding: 3px;">35%</td>
                <td style="padding: 3px; font-weight: 700; color: #2563eb;">34.3 pt</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">주문수량</td>
                <td style="padding: 3px;">1벌</td>
                <td style="padding: 3px; font-weight: 700;">45 pt</td>
                <td style="padding: 2px;">25%</td>
                <td style="padding: 3px; font-weight: 700;">11.3 pt</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">장바구니/위시</td>
                <td style="padding: 3px;">15건 / 60건</td>
                <td style="padding: 3px; font-weight: 700;">80 pt / 88 pt</td>
                <td style="padding: 3px;">15% / 10%</td>
                <td style="padding: 3px; font-weight: 700;">12.0 pt + 8.8 pt</td>
            </tr>
            <tr>
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">UV / PV</td>
                <td style="padding: 3px;">420명 / 890회</td>
                <td style="padding: 3px; font-weight: 700;">70 pt / 65 pt</td>
                <td style="padding: 3px;">10% / 5%</td>
                <td style="padding: 3px; font-weight: 700;">7.0 pt + 3.3 pt</td>
            </tr>
        </tbody>
    </table>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('s3_c1_res_bg', 54, 760, 458, 88, '#ffffff', '#cbd5e1', '6px', 102));
components.push(multiLineText('s3_c1_res_text', 64, 766, 438, 76, `
    <p style="margin: 0; line-height: 1.4;"><strong style="font-size: 13px; color: #0f172a;">• Base Score:</strong> <span style="font-size: 14px; font-weight: 800; color: #2563eb;">76.7 pt</span> &nbsp;|&nbsp; <strong style="font-size: 13px; color: #0f172a;">신상품 부스트:</strong> 1.00x</p>
    <p style="margin: 2px 0; line-height: 1.4;"><strong style="font-size: 13px; color: #0f172a;">• 최종 종합 점수:</strong> <span style="font-size: 16px; font-weight: 900; color: #0f172a;">76.7 pt</span> <span style="font-size: 12px; color: #15803d; font-weight: 700;">(종합 2위 안정권)</span></p>
    <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.3;">※ 결제금액이 크지만 34.3pt(35% 한도)만 반영되어 다른 지표를 압살하지 않음</p>
`, '12.5px', '400', '#334155', '1.3', 103));

// Card 2: 556px (E.B.M 데일리 슬랙스 - 저가/대량)
components.push(rectShape('s3_c2_bg', 556, 592, 486, 268, '#eff6ff', '#bfdbfe', '8px', 101));
components.push(badgeShape('s3_c2_b1', 570, 604, 75, 22, 'E.B.M', '#0f172a', '#1e293b', '#ffffff', '12px', '4px', 103));
components.push(textShape('s3_c2_title', 652, 604, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #1e3a8a; white-space: nowrap !important;">와이드 핏 슬랙스 (7.9만원 / 대중인기)</strong></p>`, '14px', '700', '#1e3a8a', 'left', 103));
components.push(badgeShape('s3_c2_b2', 936, 604, 90, 22, '출시 45일차', '#dbeafe', '#bfdbfe', '#1e40af', '12px', '4px', 103));

components.push(rectShape('s3_c2_tb_bg', 570, 632, 458, 120, '#ffffff', '#bfdbfe', '6px', 102));
components.push(multiLineText('s3_c2_metrics', 576, 636, 446, 112, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
            <tr style="background: #eff6ff; color: #1e40af; border-bottom: 1.6px solid #bfdbfe;">
                <th style="padding: 4px;">지표 항목</th>
                <th style="padding: 4px;">원천 실적</th>
                <th style="padding: 4px;">백분위 점수(S)</th>
                <th style="padding: 4px;">가중치</th>
                <th style="padding: 4px;">환산 점수</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">결제금액</td>
                <td style="padding: 3px;">790,000원</td>
                <td style="padding: 3px; font-weight: 700;">68 pt</td>
                <td style="padding: 3px;">35%</td>
                <td style="padding: 3px; font-weight: 700;">23.8 pt</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">주문수량</td>
                <td style="padding: 3px; color: #0284c7; font-weight: 700;">10벌 (대량)</td>
                <td style="padding: 3px; font-weight: 700; color: #0284c7;">98 pt</td>
                <td style="padding: 3px;">25%</td>
                <td style="padding: 3px; font-weight: 700; color: #0284c7;">24.5 pt</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">장바구니/위시</td>
                <td style="padding: 3px;">85건 / 140건</td>
                <td style="padding: 3px; font-weight: 700;">95 pt / 96 pt</td>
                <td style="padding: 3px;">15% / 10%</td>
                <td style="padding: 3px; font-weight: 700;">14.3 pt + 9.6 pt</td>
            </tr>
            <tr>
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">UV / PV</td>
                <td style="padding: 3px;">1,200명 / 3,100회</td>
                <td style="padding: 3px; font-weight: 700;">94 pt / 90 pt</td>
                <td style="padding: 3px;">10% / 5%</td>
                <td style="padding: 3px; font-weight: 700;">9.4 pt + 4.5 pt</td>
            </tr>
        </tbody>
    </table>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('s3_c2_res_bg', 570, 760, 458, 88, '#ffffff', '#bfdbfe', '6px', 102));
components.push(multiLineText('s3_c2_res_text', 580, 766, 438, 76, `
    <p style="margin: 0; line-height: 1.4;"><strong style="font-size: 13px; color: #1e3a8a;">• Base Score:</strong> <span style="font-size: 14px; font-weight: 800; color: #1d4ed8;">86.1 pt</span> &nbsp;|&nbsp; <strong style="font-size: 13px; color: #1e3a8a;">신상품 부스트:</strong> 1.00x</p>
    <p style="margin: 2px 0; line-height: 1.4;"><strong style="font-size: 13px; color: #1e3a8a;">• 최종 종합 점수:</strong> <span style="font-size: 16px; font-weight: 900; color: #1d4ed8;">86.1 pt</span> <span style="font-size: 12px; color: #2563eb; font-weight: 700;">(종합 1위 등극! 🏆)</span></p>
    <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.3;">※ 금액은 낮아도 압도적 수량과 트래픽의 정당 가치를 인정받아 정상 1위 등극</p>
`, '12.5px', '400', '#1e3a8a', '1.3', 103));

// Card 3: 1072px (it MICHAA 신상품 - 부스팅 적용)
components.push(rectShape('s3_c3_bg', 1072, 592, 488, 268, '#fdf2f8', '#fbcfe8', '8px', 101));
components.push(badgeShape('s3_c3_b1', 1086, 604, 75, 22, 'it MICHAA', '#0f172a', '#1e293b', '#ffffff', '12px', '4px', 103));
components.push(textShape('s3_c3_title', 1168, 604, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #831843; white-space: nowrap !important;">플리츠 벨티드 원피스 (28만원 / 신상)</strong></p>`, '14px', '700', '#831843', 'left', 103));
components.push(badgeShape('s3_c3_b2', 1450, 604, 95, 22, '출시 3일차 (1.5x)', '#be185d', '#9d174d', '#ffffff', '12px', '4px', 103));

components.push(rectShape('s3_c3_tb_bg', 1086, 632, 460, 120, '#ffffff', '#fbcfe8', '6px', 102));
components.push(multiLineText('s3_c3_metrics', 1092, 636, 448, 112, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
            <tr style="background: #fdf2f8; color: #9d174d; border-bottom: 1.6px solid #fbcfe8;">
                <th style="padding: 4px;">지표 항목</th>
                <th style="padding: 4px;">원천 실적</th>
                <th style="padding: 4px;">백분위 점수(S)</th>
                <th style="padding: 4px;">가중치</th>
                <th style="padding: 4px;">환산 점수</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #fdf2f8;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">결제금액</td>
                <td style="padding: 3px;">560,000원</td>
                <td style="padding: 3px; font-weight: 700;">58 pt</td>
                <td style="padding: 3px;">35%</td>
                <td style="padding: 3px; font-weight: 700;">20.3 pt</td>
            </tr>
            <tr style="border-bottom: 1px solid #fdf2f8;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">주문수량</td>
                <td style="padding: 3px;">2벌</td>
                <td style="padding: 3px; font-weight: 700;">60 pt</td>
                <td style="padding: 3px;">25%</td>
                <td style="padding: 3px; font-weight: 700;">15.0 pt</td>
            </tr>
            <tr style="border-bottom: 1px solid #fdf2f8;">
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">장바구니/위시</td>
                <td style="padding: 3px;">22건 / 48건</td>
                <td style="padding: 3px; font-weight: 700;">72 pt / 75 pt</td>
                <td style="padding: 3px;">15% / 10%</td>
                <td style="padding: 3px; font-weight: 700;">10.8 pt + 7.5 pt</td>
            </tr>
            <tr>
                <td style="padding: 3px; font-weight: 700; color: #1e293b;">UV / PV</td>
                <td style="padding: 3px;">380명 / 720회</td>
                <td style="padding: 3px; font-weight: 700;">68 pt / 62 pt</td>
                <td style="padding: 3px;">10% / 5%</td>
                <td style="padding: 3px; font-weight: 700;">6.8 pt + 3.1 pt</td>
            </tr>
        </tbody>
    </table>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('s3_c3_res_bg', 1086, 760, 460, 88, '#ffffff', '#fbcfe8', '6px', 102));
components.push(multiLineText('s3_c3_res_text', 1096, 766, 440, 76, `
    <p style="margin: 0; line-height: 1.4;"><strong style="font-size: 13px; color: #831843;">• Base Score:</strong> <span style="font-size: 14px; font-weight: 800; color: #be185d;">63.5 pt</span> &nbsp;|&nbsp; <strong style="font-size: 13px; color: #831843;">신상품 부스트:</strong> <strong style="color: #be185d;">× 1.50</strong></p>
    <p style="margin: 2px 0; line-height: 1.4;"><strong style="font-size: 13px; color: #831843;">• 최종 종합 점수:</strong> <span style="font-size: 16px; font-weight: 900; color: #be185d;">95.3 pt</span> <span style="font-size: 12px; color: #9d174d; font-weight: 700;">(슈퍼 부스트 상위 랭크! 🚀)</span></p>
    <p style="margin: 0; font-size: 12px; color: #9d174d; line-height: 1.3;">※ 누적 실적이 적어도 신상품 부스팅으로 랭킹 최상단 노출 기회 확보</p>
`, '12.5px', '400', '#831843', '1.3', 103));

let html = `<!DOCTYPE html>
<html lang="ko" style="--v4-text-color: #0f172a; --v4-font-size: 14px; --v4-font-weight: 400; --v4-font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; --v4-placeholder-color: #94a3b8;">
<head>
    <meta charset="UTF-8">
    <title>시선닷컴 상품 랭킹 일간 배치 &amp; 백분위 정규화 파이프라인</title>
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
    <div class="canvas" id="canvas">
${components.join('\n')}
    </div>
</body>
</html>
`;

fs.writeFileSync('data/p_lus0e/11_Daily_Ranking_Batch_Percentile_851.html', html, 'utf8');
console.log('Successfully generated 11_Daily_Ranking_Batch_Percentile_851.html');
