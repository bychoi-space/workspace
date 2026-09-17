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
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
`, '#38bdf8', 105));
components.push(textShape('hdr_title', 76, 33, 620, 28, `<p style="white-space: nowrap !important;"><strong style="color: #ffffff; font-size: 18px; white-space: nowrap !important;">시선닷컴 상품 랭킹 산정 기준 - 대량 상품(10,000개+) 상대 백분위(Percentile) 정규화 모델</strong></p>`, '18px', '800', '#ffffff', 'left', 105));
components.push(badgeShape('hdr_tag', 1330, 32, 230, 30, 'PERCENTILE SCORING MODEL', '#1e293b', '#38bdf8', '#38bdf8', '12px', '6px', 105));

// ==========================================
// [1] SECTION 1: 10,000개 상품 상대 백분위 순위 산출 원리 (Top: 88, Left: 20, W: 1560, H: 342)
// ==========================================
components.push(rectShape('s1_container', 20, 88, 1560, 342, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s1_lbl', 40, 104, 460, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">1. 대량 상품(10,000개+) 상대 백분위(Percentile) 점수화 산출 원리</strong></p>`, '15px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s1_tag', 510, 104, 250, 24, '단위(원/개/회) 소멸 ➔ 0.0점 ~ 100.0점 균등 변환', '#eff6ff', '#bfdbfe', '#1d4ed8', '12px', '4px', 102));

// 좌측 카드: 3단계 백분위 산출 메커니즘 (Left: 40, Top: 138, W: 730, H: 272)
components.push(rectShape('s1_left_bg', 40, 138, 730, 272, '#f8fafc', '#e2e8f0', '8px', 101));
components.push(textShape('s1_left_title', 56, 148, 380, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #0f172a; white-space: nowrap !important;">10,000개 상품 상대 백분위 산출 3단계 메커니즘</strong></p>`, '14px', '700', '#0f172a', 'left', 103));

// Step 1
components.push(rectShape('s1_st1_bg', 56, 176, 698, 64, '#ffffff', '#cbd5e1', '6px', 102));
components.push(badgeShape('s1_st1_num', 68, 186, 60, 22, 'STEP 1', '#0f172a', '#1e293b', '#38bdf8', '12px', '4px', 103));
components.push(textShape('s1_st1_title', 138, 186, 320, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 13.5px; color: #0f172a; white-space: nowrap !important;">지표별 10,000개 상품 일렬 순위 정렬 (Ranking Sort)</strong></p>`, '13.5px', '700', '#0f172a', 'left', 103));
components.push(multiLineText('s1_st1_desc', 68, 212, 674, 24, `
    <p style="margin: 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #475569;">• 결제금액이든 주문수량이든 10,000개 상품을 실적이 높은 순서대로 <strong>1위부터 10,000위까지 일렬로 정렬</strong>합니다.</span></p>
`, '12.5px', '400', '#475569', '1.4', 103));

// Step 2
components.push(rectShape('s1_st2_bg', 56, 248, 698, 76, '#eff6ff', '#93c5fd', '6px', 102));
components.push(badgeShape('s1_st2_num', 68, 258, 60, 22, 'STEP 2', '#1d4ed8', '#1e40af', '#ffffff', '12px', '4px', 103));
components.push(textShape('s1_st2_title', 138, 258, 420, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 13.5px; color: #1e3a8a; white-space: nowrap !important;">상대적 위치 백분율 계산 공식 (0.0점 ~ 100.0점 균등 배분)</strong></p>`, '13.5px', '700', '#1e3a8a', 'left', 103));
components.push(multiLineText('s1_st2_desc', 68, 282, 674, 38, `
    <p style="margin: 0; line-height: 1.5;"><strong style="color: #1e40af; font-size: 13px;">백분위 점수(S) = [ (10,000 - 내 순위) / (10,000 - 1) ] × 100</strong></p>
    <p style="margin: 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #1e3a8a;">• <strong>1위</strong> ➔ 100점 | <strong>1,000위</strong>(상위 10%) ➔ 90점 | <strong>5,000위</strong>(중간) ➔ 50점 | <strong>10,000위</strong>(꼴찌) ➔ 0점</span></p>
`, '12.5px', '400', '#1e3a8a', '1.4', 103));

// Step 3
components.push(rectShape('s1_st3_bg', 56, 332, 698, 68, '#f0fdf4', '#86efac', '6px', 102));
components.push(badgeShape('s1_st3_num', 68, 342, 60, 22, 'STEP 3', '#15803d', '#166534', '#ffffff', '12px', '4px', 103));
components.push(textShape('s1_st3_title', 138, 342, 450, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 13.5px; color: #14532d; white-space: nowrap !important;">동점자 및 실적 0건 공동 순위 처리 (SQL PERCENT_RANK)</strong></p>`, '13.5px', '700', '#14532d', 'left', 103));
components.push(multiLineText('s1_st3_desc', 68, 366, 674, 30, `
    <p style="margin: 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #14532d;">• 실적이 0건인 상품 4,000개는 모두 공동 최하위 ➔ <strong>동일하게 0점</strong> 부여 (점수 왜곡 원천 방지)</span></p>
    <p style="margin: 0; line-height: 1.4;"><span style="font-size: 12px; color: #16a34a;">• DB 표준 윈도우 함수 <strong>PERCENT_RANK()</strong> 한 줄로 10,000개 상품도 0.1초 만에 일괄 산출 완료!</span></p>
`, '12px', '400', '#14532d', '1.4', 103));

// 우측 카드: 10,000개 상품 기준 점수 분포 인포그래픽 표 (Left: 790, Top: 138, W: 770, H: 272)
components.push(rectShape('s1_right_bg', 790, 138, 770, 272, '#eff6ff', '#bfdbfe', '8px', 101));
components.push(textShape('s1_right_title', 806, 148, 450, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #1e3a8a; white-space: nowrap !important;">10,000개 상품 실제 백분위 점수(0~100점) 매핑 시각화</strong></p>`, '14px', '700', '#1e3a8a', 'left', 103));
components.push(badgeShape('s1_right_badge', 1450, 146, 95, 22, '100점 만점 척도', '#1d4ed8', '#1e40af', '#ffffff', '12px', '4px', 103));

components.push(rectShape('s1_tb_bg', 806, 176, 738, 176, '#ffffff', '#bfdbfe', '6px', 102));
components.push(multiLineText('s1_tb_content', 814, 180, 722, 168, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: center;">
        <thead>
            <tr style="background: #eff6ff; color: #1e40af; border-bottom: 1.6px solid #bfdbfe; font-weight: 700;">
                <th style="padding: 5px;">실적 순위 (10,000개 중)</th>
                <th style="padding: 5px;">상대적 위치 (상위 %)</th>
                <th style="padding: 5px;">환산 표준 점수</th>
                <th style="padding: 5px;">상품군 그룹 의미</th>
                <th style="padding: 5px;">실제 적용 예시 (결제/수량)</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 5px; font-weight: 800; color: #2563eb;">1위 (TOP 1)</td>
                <td style="padding: 5px; font-weight: 700;">상위 0.01%</td>
                <td style="padding: 5px; font-weight: 900; color: #2563eb; font-size: 13.5px;">100.0 점</td>
                <td style="padding: 5px;"><span style="color: #1e40af; font-weight: 700;">압도적 최상위</span></td>
                <td style="padding: 5px; color: #475569;">쇼핑몰 전체 1위 실적 상품</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 5px; font-weight: 700;">100위</td>
                <td style="padding: 5px;">상위 1.00%</td>
                <td style="padding: 5px; font-weight: 800; color: #0284c7;">99.0 점</td>
                <td style="padding: 5px;">최상위 인기 그룹</td>
                <td style="padding: 5px; color: #475569;">주력 베스트셀러 상품</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 5px; font-weight: 700;">1,000위</td>
                <td style="padding: 5px;">상위 10.00%</td>
                <td style="padding: 5px; font-weight: 800; color: #0d9488;">90.0 점</td>
                <td style="padding: 5px;">상위권 우수 그룹</td>
                <td style="padding: 5px; color: #475569;">꾸준히 판매되는 인기 상품</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 5px; font-weight: 700;">5,000위</td>
                <td style="padding: 5px;">상위 50.00%</td>
                <td style="padding: 5px; font-weight: 800; color: #475569;">50.0 점</td>
                <td style="padding: 5px;">중간 기준점 (Median)</td>
                <td style="padding: 5px; color: #475569;">평균 수준의 기본 상품</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 5px; font-weight: 700;">8,000위</td>
                <td style="padding: 5px;">상위 80.00%</td>
                <td style="padding: 5px; font-weight: 800; color: #64748b;">20.0 점</td>
                <td style="padding: 5px;">하위 관심 상품군</td>
                <td style="padding: 5px; color: #475569;">가끔 조회/장바구니 담기는 상품</td>
            </tr>
            <tr>
                <td style="padding: 5px; font-weight: 700; color: #dc2626;">10,000위 / 실적 0건</td>
                <td style="padding: 5px; color: #dc2626;">하위 100.0%</td>
                <td style="padding: 5px; font-weight: 900; color: #dc2626; font-size: 13.5px;">0.0 점</td>
                <td style="padding: 5px; color: #dc2626;">최하위 / 미반응</td>
                <td style="padding: 5px; color: #dc2626;">조회수 0회 / 판매 0건 상품</td>
            </tr>
        </tbody>
    </table>
`, '12.5px', '400', '#334155', '1.3', 103));

components.push(rectShape('s1_summary_bar', 806, 360, 738, 40, '#0f172a', '#1e293b', '6px', 102));
components.push(multiLineText('s1_summary_text', 816, 366, 718, 28, `
    <p style="margin: 0; line-height: 1.4; text-align: center;"><strong style="color: #38bdf8; font-size: 13px;">💡 핵심 결론:</strong> <span style="color: #ffffff; font-size: 12.5px;">상품이 10,000개든 100,000개든 개수와 상관없이, 모든 지표가 공평하게 <strong>0.0점 ~ 100.0점 표준 점수</strong>로 완벽 통일됩니다!</span></p>
`, '12.5px', '400', '#ffffff', '1.4', 103));

// ==========================================
// [2] SECTION 2: 실무 산정 시뮬레이션 검증 (Top: 446, Left: 20, W: 1560, H: 434)
// ==========================================
components.push(rectShape('s2_container', 20, 446, 1560, 434, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s2_lbl', 40, 462, 480, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">2. 실무 산정 시뮬레이션 검증 (단위 불일치 해소 및 공정성 실증)</strong></p>`, '15px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s2_tag', 530, 462, 230, 24, 'pt ➔ 한국어 [점 (Point)]으로 통일 표기', '#f0fdf4', '#bbf7d0', '#15803d', '12px', '4px', 102));

// 가이드 배너: pt의 의미 설명 (Left: 40, Top: 494, W: 1520, H: 34)
components.push(rectShape('s2_guide_bg', 40, 494, 1520, 34, '#f8fafc', '#cbd5e1', '6px', 101));
components.push(multiLineText('s2_guide_text', 50, 498, 1500, 26, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a; font-size: 12.5px;">📌 "점(Point)"의 의미:</strong> <span style="color: #334155; font-size: 12.5px;">원래 서로 다른 단위인 [원(₩), 개, 건, 명, 회]를 100점 만점의 <strong>'표준 점수(Point)'</strong>로 환산한 값입니다. 이를 통해 기획하신 <strong>6대 가중치(결제 35% + 수량 25% + 장바구니 15% + 위시 10% + UV 10% + PV 5% = 100%)</strong>가 단위 차이에 왜곡되지 않고 정직하게 100점 만점 점수로 계산됩니다.</span></p>
`, '12.5px', '400', '#334155', '1.4', 102));

// 3개 상품 시뮬레이션 카드 (Top: 538, W: 490, H: 326)
// Card 1: 40px (MICHAA 고가 코트)
components.push(rectShape('s2_c1_bg', 40, 538, 490, 326, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('s2_c1_b1', 54, 550, 75, 22, 'MICHAA', '#0f172a', '#1e293b', '#ffffff', '12px', '4px', 103));
components.push(textShape('s2_c1_title', 136, 550, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #0f172a; white-space: nowrap !important;">캐시미어 더블 코트 (150만원 / 고가)</strong></p>`, '14px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('s2_c1_b2', 424, 550, 92, 22, '출시 60일차', '#f1f5f9', '#cbd5e1', '#475569', '12px', '4px', 103));

components.push(rectShape('s2_c1_tb_bg', 54, 580, 462, 142, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('s2_c1_metrics', 60, 584, 450, 134, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
            <tr style="background: #f1f5f9; color: #475569; border-bottom: 1.6px solid #e2e8f0;">
                <th style="padding: 4px;">지표 항목</th>
                <th style="padding: 4px;">원천 실적</th>
                <th style="padding: 4px;">백분위 순위 점수</th>
                <th style="padding: 4px;">가중치</th>
                <th style="padding: 4px;">최종 환산 점수</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">결제금액</td>
                <td style="padding: 4px; color: #2563eb;">1,500,000원</td>
                <td style="padding: 4px; font-weight: 700;">상위 2% (98 점)</td>
                <td style="padding: 4px;">35%</td>
                <td style="padding: 4px; font-weight: 800; color: #2563eb;">34.3 점</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">주문수량</td>
                <td style="padding: 4px;">1벌</td>
                <td style="padding: 4px; font-weight: 700;">상위 55% (45 점)</td>
                <td style="padding: 4px;">25%</td>
                <td style="padding: 4px; font-weight: 800;">11.3 점</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">장바구니 / 위시</td>
                <td style="padding: 4px;">15건 / 60건</td>
                <td style="padding: 4px; font-weight: 700;">80 점 / 88 점</td>
                <td style="padding: 4px;">15% / 10%</td>
                <td style="padding: 4px; font-weight: 800;">12.0 점 + 8.8 점</td>
            </tr>
            <tr>
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">UV / PV</td>
                <td style="padding: 4px;">420명 / 890회</td>
                <td style="padding: 4px; font-weight: 700;">70 점 / 65 점</td>
                <td style="padding: 4px;">10% / 5%</td>
                <td style="padding: 4px; font-weight: 800;">7.0 점 + 3.3 점</td>
            </tr>
        </tbody>
    </table>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('s2_c1_res_bg', 54, 730, 462, 120, '#ffffff', '#cbd5e1', '6px', 102));
components.push(multiLineText('s2_c1_res_text', 64, 738, 442, 104, `
    <p style="margin: 0; line-height: 1.5;"><strong style="font-size: 13px; color: #0f172a;">• Base Score (기본 점수):</strong> <span style="font-size: 15px; font-weight: 800; color: #2563eb;">76.7 점</span> (100점 만점 중)</p>
    <p style="margin: 3px 0; line-height: 1.5;"><strong style="font-size: 13px; color: #0f172a;">• 신상품 부스트:</strong> 1.00배 ➔ <strong style="font-size: 13px; color: #0f172a;">최종 종합 점수:</strong> <span style="font-size: 17px; font-weight: 900; color: #0f172a;">76.7 점</span> <span style="font-size: 12px; color: #15803d; font-weight: 700;">(종합 2위)</span></p>
    <p style="margin: 3px 0 0 0; font-size: 12px; color: #475569; line-height: 1.4;"><strong>※ 단위 해소 효과:</strong> 150만원 고가이지만 결제점수 만점 한도인 <strong>35점 중 34.3점까지만 반영</strong>되므로 다른 상품을 점수로 압살하지 않고 공정하게 2위 안착</p>
`, '12.5px', '400', '#334155', '1.3', 103));

// Card 2: 556px (E.B.M 데일리 슬랙스 - 저가/대량)
components.push(rectShape('s2_c2_bg', 556, 538, 490, 326, '#eff6ff', '#bfdbfe', '8px', 101));
components.push(badgeShape('s2_c2_b1', 570, 550, 75, 22, 'E.B.M', '#0f172a', '#1e293b', '#ffffff', '12px', '4px', 103));
components.push(textShape('s2_c2_title', 652, 550, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #1e3a8a; white-space: nowrap !important;">와이드 핏 슬랙스 (7.9만원 / 대중인기)</strong></p>`, '14px', '700', '#1e3a8a', 'left', 103));
components.push(badgeShape('s2_c2_b2', 940, 550, 92, 22, '출시 45일차', '#dbeafe', '#bfdbfe', '#1e40af', '12px', '4px', 103));

components.push(rectShape('s2_c2_tb_bg', 570, 580, 462, 142, '#ffffff', '#bfdbfe', '6px', 102));
components.push(multiLineText('s2_c2_metrics', 576, 584, 450, 134, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
            <tr style="background: #eff6ff; color: #1e40af; border-bottom: 1.6px solid #bfdbfe;">
                <th style="padding: 4px;">지표 항목</th>
                <th style="padding: 4px;">원천 실적</th>
                <th style="padding: 4px;">백분위 순위 점수</th>
                <th style="padding: 4px;">가중치</th>
                <th style="padding: 4px;">최종 환산 점수</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">결제금액</td>
                <td style="padding: 4px;">790,000원</td>
                <td style="padding: 4px; font-weight: 700;">상위 32% (68 점)</td>
                <td style="padding: 4px;">35%</td>
                <td style="padding: 4px; font-weight: 800;">23.8 점</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">주문수량</td>
                <td style="padding: 4px; color: #0284c7; font-weight: 700;">10벌 (대량)</td>
                <td style="padding: 4px; font-weight: 800; color: #0284c7;">상위 2% (98 점)</td>
                <td style="padding: 4px;">25%</td>
                <td style="padding: 4px; font-weight: 800; color: #0284c7;">24.5 점</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff6ff;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">장바구니 / 위시</td>
                <td style="padding: 4px;">85건 / 140건</td>
                <td style="padding: 4px; font-weight: 700;">95 점 / 96 점</td>
                <td style="padding: 4px;">15% / 10%</td>
                <td style="padding: 4px; font-weight: 800;">14.3 점 + 9.6 점</td>
            </tr>
            <tr>
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">UV / PV</td>
                <td style="padding: 4px;">1,200명 / 3,100회</td>
                <td style="padding: 4px; font-weight: 700;">94 점 / 90 점</td>
                <td style="padding: 4px;">10% / 5%</td>
                <td style="padding: 4px; font-weight: 800;">9.4 점 + 4.5 점</td>
            </tr>
        </tbody>
    </table>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('s2_c2_res_bg', 570, 730, 462, 120, '#ffffff', '#bfdbfe', '6px', 102));
components.push(multiLineText('s2_c2_res_text', 580, 738, 442, 104, `
    <p style="margin: 0; line-height: 1.5;"><strong style="font-size: 13px; color: #1e3a8a;">• Base Score (기본 점수):</strong> <span style="font-size: 15px; font-weight: 800; color: #1d4ed8;">86.1 점</span> (100점 만점 중)</p>
    <p style="margin: 3px 0; line-height: 1.5;"><strong style="font-size: 13px; color: #1e3a8a;">• 신상품 부스트:</strong> 1.00배 ➔ <strong style="font-size: 13px; color: #1e3a8a;">최종 종합 점수:</strong> <span style="font-size: 17px; font-weight: 900; color: #1d4ed8;">86.1 점</span> <span style="font-size: 12px; color: #2563eb; font-weight: 700;">(종합 1위 등극! 🏆)</span></p>
    <p style="margin: 3px 0 0 0; font-size: 12px; color: #1e3a8a; line-height: 1.4;"><strong>※ 단위 해소 효과:</strong> 금액은 낮지만 압도적 수량(24.5점)과 높은 장바구니/위시/트래픽 가치를 정당하게 인정받아 <strong>고가 코트를 제치고 종합 1위 등극!</strong></p>
`, '12.5px', '400', '#1e3a8a', '1.3', 103));

// Card 3: 1072px (it MICHAA 신상품 - 부스팅 적용)
components.push(rectShape('s2_c3_bg', 1072, 538, 488, 326, '#fdf2f8', '#fbcfe8', '8px', 101));
components.push(badgeShape('s2_c3_b1', 1086, 550, 75, 22, 'it MICHAA', '#0f172a', '#1e293b', '#ffffff', '12px', '4px', 103));
components.push(textShape('s2_c3_title', 1168, 550, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14px; color: #831843; white-space: nowrap !important;">플리츠 벨티드 원피스 (28만원 / 신상)</strong></p>`, '14px', '700', '#831843', 'left', 103));
components.push(badgeShape('s2_c3_b2', 1450, 550, 95, 22, '출시 3일차 (1.5x)', '#be185d', '#9d174d', '#ffffff', '12px', '4px', 103));

components.push(rectShape('s2_c3_tb_bg', 1086, 580, 460, 142, '#ffffff', '#fbcfe8', '6px', 102));
components.push(multiLineText('s2_c3_metrics', 1092, 584, 448, 134, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
            <tr style="background: #fdf2f8; color: #9d174d; border-bottom: 1.6px solid #fbcfe8;">
                <th style="padding: 4px;">지표 항목</th>
                <th style="padding: 4px;">원천 실적</th>
                <th style="padding: 4px;">백분위 순위 점수</th>
                <th style="padding: 4px;">가중치</th>
                <th style="padding: 4px;">최종 환산 점수</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #fdf2f8;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">결제금액</td>
                <td style="padding: 4px;">560,000원</td>
                <td style="padding: 4px; font-weight: 700;">상위 42% (58 점)</td>
                <td style="padding: 4px;">35%</td>
                <td style="padding: 4px; font-weight: 800;">20.3 점</td>
            </tr>
            <tr style="border-bottom: 1px solid #fdf2f8;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">주문수량</td>
                <td style="padding: 4px;">2벌</td>
                <td style="padding: 4px; font-weight: 700;">상위 40% (60 점)</td>
                <td style="padding: 4px;">25%</td>
                <td style="padding: 4px; font-weight: 800;">15.0 점</td>
            </tr>
            <tr style="border-bottom: 1px solid #fdf2f8;">
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">장바구니 / 위시</td>
                <td style="padding: 4px;">22건 / 48건</td>
                <td style="padding: 4px; font-weight: 700;">72 점 / 75 점</td>
                <td style="padding: 4px;">15% / 10%</td>
                <td style="padding: 4px; font-weight: 800;">10.8 점 + 7.5 점</td>
            </tr>
            <tr>
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">UV / PV</td>
                <td style="padding: 4px;">380명 / 720회</td>
                <td style="padding: 4px; font-weight: 700;">68 점 / 62 점</td>
                <td style="padding: 4px;">10% / 5%</td>
                <td style="padding: 4px; font-weight: 800;">6.8 점 + 3.1 점</td>
            </tr>
        </tbody>
    </table>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('s2_c3_res_bg', 1086, 730, 460, 120, '#ffffff', '#fbcfe8', '6px', 102));
components.push(multiLineText('s2_c3_res_text', 1096, 738, 440, 104, `
    <p style="margin: 0; line-height: 1.5;"><strong style="font-size: 13px; color: #831843;">• Base Score (기본 점수):</strong> <span style="font-size: 15px; font-weight: 800; color: #be185d;">63.5 점</span> (100점 만점 중)</p>
    <p style="margin: 3px 0; line-height: 1.5;"><strong style="font-size: 13px; color: #831843;">• 신상품 부스트:</strong> <strong style="color: #be185d;">× 1.50배</strong> ➔ <strong style="font-size: 13px; color: #831843;">최종 종합 점수:</strong> <span style="font-size: 17px; font-weight: 900; color: #be185d;">95.3 점</span> <span style="font-size: 12px; color: #9d174d; font-weight: 700;">(최상위 노출 🚀)</span></p>
    <p style="margin: 3px 0 0 0; font-size: 12px; color: #831843; line-height: 1.4;"><strong>※ 신상품 부스팅 효과:</strong> 누적 실적이 적어도 출시 3일차 신상품 슈퍼 부스트(1.5x)를 받아 95.3점으로 랭킹 최상단 노출 기회를 완벽 보장</p>
`, '12.5px', '400', '#831843', '1.3', 103));

let html = `<!DOCTYPE html>
<html lang="ko" style="--v4-text-color: #0f172a; --v4-font-size: 14px; --v4-font-weight: 400; --v4-font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; --v4-placeholder-color: #94a3b8;">
<head>
    <meta charset="UTF-8">
    <title>시선닷컴 상품 랭킹 산정 기준 - 대량 상품(10,000개+) 상대 백분위(Percentile) 정규화 모델</title>
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
console.log('Successfully regenerated 11_Daily_Ranking_Batch_Percentile_851.html with updated requirements!');
