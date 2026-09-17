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
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
`, '#38bdf8', 105));
components.push(textShape('hdr_title', 76, 33, 620, 28, `<p style="white-space: nowrap !important;"><strong style="color: #ffffff; font-size: 18px; white-space: nowrap !important;">시선닷컴 상품 랭킹 6대 지표 실무 산정 기준 및 데이터 집계 정책</strong></p>`, '18px', '800', '#ffffff', 'left', 105));
components.push(badgeShape('hdr_tag', 1320, 32, 240, 30, 'RANKING METRIC SPECIFICATION', '#1e293b', '#38bdf8', '#38bdf8', '12px', '6px', 105));

// ==========================================
// [1] SECTION 1: 산정 기간 및 데이터 집계 정책 (스냅샷 vs 로그 히트수) (Top: 88, Left: 20, W: 1560, H: 172)
// ==========================================
components.push(rectShape('s1_container', 20, 88, 1560, 172, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s1_lbl', 40, 102, 450, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">1. 산정 일자(윈도우) 및 상태값(스냅샷 vs 이벤트 로그) 집계 원칙</strong></p>`, '15px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s1_tag', 500, 102, 220, 24, '최근 7일(D-7 ~ D-1) 롤링 윈도우', '#eff6ff', '#bfdbfe', '#1d4ed8', '12px', '4px', 102));

// 3개 핵심 정책 카드 (W: 486, H: 108, Left: 40, 556, 1072, Top: 134)
// 정책 1: 집계 기간 (전체 누적 X ➔ 최근 7일 O)
components.push(rectShape('s1_p1_bg', 40, 134, 486, 112, '#f8fafc', '#e2e8f0', '8px', 101));
components.push(badgeShape('s1_p1_badge', 54, 144, 110, 22, 'Q. 산정 일자는?', '#0f172a', '#1e293b', '#38bdf8', '12px', '4px', 103));
components.push(textShape('s1_p1_title', 174, 144, 300, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 13.5px; color: #0f172a; white-space: nowrap !important;">전체 누적 X ➔ 최근 7일(D-7~D-1) 집계</strong></p>`, '13.5px', '700', '#0f172a', 'left', 103));
components.push(multiLineText('s1_p1_desc', 54, 170, 460, 68, `
    <p style="margin: 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #334155;">• <strong>전체 누적 사용 금지:</strong> 3년 전 대박 상품이 랭킹을 영구 독점하는 현상 방지</span></p>
    <p style="margin: 2px 0 0 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #1e3a8a;">• <strong>최근 7일 롤링 윈도우:</strong> 매일 새벽 배치 가동 시점 기준 <strong>최근 7일간의 실적만 합산</strong>하여 최신 트렌드를 실시간 반영합니다.</span></p>
`, '12.5px', '400', '#334155', '1.4', 103));

// 정책 2: 장바구니/위시 집계 (스냅샷 X ➔ 발생 이벤트 로그 O)
components.push(rectShape('s1_p2_bg', 556, 134, 486, 112, '#eff6ff', '#bfdbfe', '8px', 101));
components.push(badgeShape('s1_p2_badge', 570, 144, 135, 22, 'Q. 장바구니/위시는?', '#1d4ed8', '#1e40af', '#ffffff', '12px', '4px', 103));
components.push(textShape('s1_p2_title', 715, 144, 310, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 13.5px; color: #1e3a8a; white-space: nowrap !important;">현재 담긴 개수 X ➔ '담기 이벤트 로그' O</strong></p>`, '13.5px', '700', '#1e3a8a', 'left', 103));
components.push(multiLineText('s1_p2_desc', 570, 170, 460, 68, `
    <p style="margin: 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #1e3a8a;">• <strong>스냅샷 모순 차단:</strong> 장바구니에 담았다가 주문 결제하면 장바구니에서 삭제되는데, 현재 담긴 상태값만 보면 실적이 깎여버립니다!</span></p>
    <p style="margin: 2px 0 0 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #1e40af;">• <strong>행동 히트수 집계:</strong> 최근 7일 동안 고객이 <strong>'담기/찜 버튼을 누른 발생 이벤트 로그 건수'</strong>를 카운트합니다. (1인 1일 1회만 인정)</span></p>
`, '12.5px', '400', '#1e3a8a', '1.4', 103));

// 정책 3: UV/PV 트래픽 집계 (일별 요약 테이블 적재)
components.push(rectShape('s1_p3_bg', 1072, 134, 488, 112, '#f0fdf4', '#bbf7d0', '8px', 101));
components.push(badgeShape('s1_p3_badge', 1086, 144, 120, 22, 'Q. UV / PV 저장은?', '#15803d', '#166534', '#ffffff', '12px', '4px', 103));
components.push(textShape('s1_p3_title', 1216, 144, 330, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 13.5px; color: #14532d; white-space: nowrap !important;">일별 로그 요약 테이블 ➔ 7일치 SUM()</strong></p>`, '13.5px', '700', '#14532d', 'left', 103));
components.push(multiLineText('s1_p3_desc', 1086, 170, 460, 68, `
    <p style="margin: 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #14532d;">• <strong>일별 적재(Batch):</strong> 매일 자정 로그에서 상품별 일간 UV/PV를 추출하여 <strong>DAILY_METRIC_LOG</strong> 요약 테이블에 적재합니다.</span></p>
    <p style="margin: 2px 0 0 0; line-height: 1.4;"><span style="font-size: 12.5px; color: #166534;">• <strong>초고속 연산:</strong> 랭킹 연산 시 최근 7일치 레코드만 빠르게 SUM()하므로, 수천만 건의 원천 로그를 뒤지지 않아 DB 부하가 전혀 없습니다.</span></p>
`, '12.5px', '400', '#14532d', '1.4', 103));

// ==========================================
// [2] SECTION 2: 6대 핵심 지표별 실무 정의, 어뷰징 캡, 계산 예시 (Top: 272, Left: 20, W: 1560, H: 608)
// ==========================================
components.push(rectShape('s2_container', 20, 272, 1560, 608, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s2_lbl', 40, 288, 480, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">2. 6대 핵심 지표별 실무 정의, 어뷰징 방지 정책, 백분위 점수 계산 예시</strong></p>`, '15px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s2_tag', 530, 288, 230, 24, '가중치 합계 100% (100점 만점 설계)', '#fdf2f8', '#fbcfe8', '#be185d', '12px', '4px', 102));

// 6개 카드 배치 (3컬럼 x 2행)
// Row 1: Top 322, Height 264
// Row 2: Top 598, Height 264
// Col 1: Left 40 (W: 486)
// Col 2: Left 556 (W: 486)
// Col 3: Left 1072 (W: 488)

// -------------------------------------------------------------
// [지표 1] 결제금액 (GMV) - Row 1, Col 1
// -------------------------------------------------------------
components.push(rectShape('m1_bg', 40, 322, 486, 264, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('m1_b1', 54, 334, 75, 22, '가중치 35%', '#1e3a8a', '#1e40af', '#ffffff', '12px', '4px', 103));
components.push(textShape('m1_title', 136, 334, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">결제금액 (GMV) - 매출 기여도</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('m1_b2', 430, 334, 82, 22, '최대 35.0 점', '#eff6ff', '#bfdbfe', '#1d4ed8', '12px', '4px', 103));

components.push(rectShape('m1_def_bg', 54, 364, 458, 126, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('m1_def_text', 62, 368, 442, 118, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a; font-size: 12.5px;">• 집계 원천:</strong> <span style="color: #334155; font-size: 12px;">최근 7일간 상태가 [결제완료/배송중/구매확정]인 실결제 금액 (쿠폰/적립금 할인 차감 후 실매출액)</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #dc2626; font-size: 12.5px;">• 취소/반품:</strong> <span style="color: #334155; font-size: 12px;">최근 7일 내 취소·반품 발생 시 당일 배치에서 즉시 차감</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #2563eb; font-size: 12.5px;">• 어뷰징 방지:</strong> <span style="color: #334155; font-size: 12px;">B2B 사입/비정상 대량 결제 제외 (주문건당 최대 1,000만원 캡)</span></p>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('m1_ex_bg', 54, 498, 458, 76, '#eff6ff', '#bfdbfe', '6px', 102));
components.push(multiLineText('m1_ex_text', 62, 502, 442, 68, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #1e3a8a; font-size: 12.5px;">📊 계산 예시: [미샤 캐시미어 코트]</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: #1e40af; line-height: 1.4;">• 최근 7일 결제 1,500만원 ➔ 전체 상품 중 <strong>상위 2% (백분위 98 점)</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #1e3a8a; line-height: 1.4;">• <strong>환산 점수:</strong> 98 점 × 0.35 = <strong style="color: #2563eb; font-size: 13.5px;">34.3 점</strong> (35점 만점 중 34.3점 획득)</p>
`, '12px', '400', '#1e3a8a', '1.3', 103));

// -------------------------------------------------------------
// [지표 2] 주문수량 (Volume) - Row 1, Col 2
// -------------------------------------------------------------
components.push(rectShape('m2_bg', 556, 322, 486, 264, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('m2_b1', 570, 334, 75, 22, '가중치 25%', '#0284c7', '#0369a1', '#ffffff', '12px', '4px', 103));
components.push(textShape('m2_title', 652, 334, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">주문수량 (Vol) - 대중적 선호도</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('m2_b2', 946, 334, 82, 22, '최대 25.0 점', '#e0f2fe', '#bae6fd', '#0284c7', '12px', '4px', 103));

components.push(rectShape('m2_def_bg', 570, 364, 458, 126, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('m2_def_text', 578, 368, 442, 118, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a; font-size: 12.5px;">• 집계 원천:</strong> <span style="color: #334155; font-size: 12px;">최근 7일간 실제 판매 완료된 주문 상품 수량(QTY) 합산</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #0284c7; font-size: 12.5px;">• 실무 가치:</strong> <span style="color: #334155; font-size: 12px;">고가 코트에 밀리는 <strong>저가 베스트셀러(슬랙스/티셔츠)의 대중성을 정당하게 평가</strong>하는 핵심 지표</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #dc2626; font-size: 12.5px;">• 어뷰징 캡:</strong> <span style="color: #334155; font-size: 12px;">1인 1회 주문 시 상품당 <strong>최대 5벌까지만 카운팅</strong> (도매 사입 사재기 왜곡 원천 차단)</span></p>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('m2_ex_bg', 570, 498, 458, 76, '#f0f9ff', '#bae6fd', '6px', 102));
components.push(multiLineText('m2_ex_text', 578, 502, 442, 68, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0369a1; font-size: 12.5px;">📊 계산 예시: [E.B.M 와이드 슬랙스]</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: #0369a1; line-height: 1.4;">• 최근 7일 판매 320벌 ➔ 전체 상품 중 <strong>상위 2% (백분위 98 점)</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #0369a1; line-height: 1.4;">• <strong>환산 점수:</strong> 98 점 × 0.25 = <strong style="color: #0284c7; font-size: 13.5px;">24.5 점</strong> (수량 점수 만점 수준 획득!)</p>
`, '12px', '400', '#0369a1', '1.3', 103));

// -------------------------------------------------------------
// [지표 3] 장바구니 담기 (Cart Adds) - Row 1, Col 3
// -------------------------------------------------------------
components.push(rectShape('m3_bg', 1072, 322, 488, 264, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('m3_b1', 1086, 334, 75, 22, '가중치 15%', '#0d9488', '#0f766e', '#ffffff', '12px', '4px', 103));
components.push(textShape('m3_title', 1168, 334, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">장바구니 담기 (Cart) - 구매 직전 의향</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('m3_b2', 1464, 334, 82, 22, '최대 15.0 점', '#ccfbf1', '#99f6e4', '#0f766e', '12px', '4px', 103));

components.push(rectShape('m3_def_bg', 1086, 364, 460, 126, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('m3_def_text', 1094, 368, 444, 118, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a; font-size: 12.5px;">• 집계 원천:</strong> <span style="color: #334155; font-size: 12px;">최근 7일간 발생한 <strong>ADD_TO_CART 행동 이벤트 로그 건수</strong></span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #0d9488; font-size: 12.5px;">• 왜 로그인가?:</strong> <span style="color: #334155; font-size: 12px;">현재 장바구니 보관함 상태(스냅샷)가 아니라, <strong>'구매를 결심하고 담았던 유효 행동'</strong> 자체를 실적으로 인정</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #dc2626; font-size: 12.5px;">• 어뷰징 방지:</strong> <span style="color: #334155; font-size: 12px;">동일 회원(또는 동일 기기) <strong>1일 1회만 유효 인정</strong> (연타 조작 무효화)</span></p>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('m3_ex_bg', 1086, 498, 460, 76, '#f0fdfa', '#99f6e4', '6px', 102));
components.push(multiLineText('m3_ex_text', 1094, 502, 444, 68, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f766e; font-size: 12.5px;">📊 계산 예시: [E.B.M 와이드 슬랙스]</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: #0f766e; line-height: 1.4;">• 최근 7일 장바구니 담기 480회 ➔ 전체 상품 중 <strong>상위 5% (백분위 95 점)</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #0f766e; line-height: 1.4;">• <strong>환산 점수:</strong> 95 점 × 0.15 = <strong style="color: #0d9488; font-size: 13.5px;">14.3 점</strong> (15점 만점 중 14.3점 획득)</p>
`, '12px', '400', '#0f766e', '1.3', 103));

// -------------------------------------------------------------
// [지표 4] 위시리스트 (Wishlist) - Row 2, Col 1
// -------------------------------------------------------------
components.push(rectShape('m4_bg', 40, 598, 486, 264, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('m4_b1', 54, 610, 75, 22, '가중치 10%', '#e11d48', '#be123c', '#ffffff', '12px', '4px', 103));
components.push(textShape('m4_title', 136, 610, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">위시리스트 (Wish) - 잠재 선호도/찜</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('m4_b2', 430, 610, 82, 22, '최대 10.0 점', '#ffe4e6', '#fecdd3', '#e11d48', '12px', '4px', 103));

components.push(rectShape('m4_def_bg', 54, 640, 458, 126, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('m4_def_text', 62, 644, 442, 118, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a; font-size: 12.5px;">• 집계 원천:</strong> <span style="color: #334155; font-size: 12px;">최근 7일간 발생한 <strong>ADD_TO_WISHLIST 찜 이벤트 로그 건수</strong></span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #e11d48; font-size: 12.5px;">• 실무 가치:</strong> <span style="color: #334155; font-size: 12px;">당장 결제하지 않더라도 <strong>시즌 신상 및 브랜드 룩북에 대한 고객 관심도</strong> 사전 예측 지표</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #dc2626; font-size: 12.5px;">• 어뷰징 방지:</strong> <span style="color: #334155; font-size: 12px;">찜 해제 후 재등록을 반복하는 행위 차단 (동일 회원 1일 1회만 인정)</span></p>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('m4_ex_bg', 54, 774, 458, 76, '#fff1f2', '#fecdd3', '6px', 102));
components.push(multiLineText('m4_ex_text', 62, 778, 442, 68, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #be123c; font-size: 12.5px;">📊 계산 예시: [미샤 캐시미어 코트]</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: #be123c; line-height: 1.4;">• 최근 7일 위시 찜 650회 ➔ 전체 상품 중 <strong>상위 12% (백분위 88 점)</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #be123c; line-height: 1.4;">• <strong>환산 점수:</strong> 88 점 × 0.10 = <strong style="color: #e11d48; font-size: 13.5px;">8.8 점</strong> (10점 만점 중 8.8점 획득)</p>
`, '12px', '400', '#be123c', '1.3', 103));

// -------------------------------------------------------------
// [지표 5] 순방문자 UV (Unique Visitors) - Row 2, Col 2
// -------------------------------------------------------------
components.push(rectShape('m5_bg', 556, 598, 486, 264, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('m5_b1', 570, 610, 75, 22, '가중치 10%', '#4f46e5', '#4338ca', '#ffffff', '12px', '4px', 103));
components.push(textShape('m5_title', 652, 610, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">순방문자 (UV) - 순수 모객 파워</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('m5_b2', 946, 610, 82, 22, '최대 10.0 점', '#ede9fe', '#ddd6fe', '#4f46e5', '12px', '4px', 103));

components.push(rectShape('m5_def_bg', 570, 640, 458, 126, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('m5_def_text', 578, 644, 442, 118, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a; font-size: 12.5px;">• 집계 원천:</strong> <span style="color: #334155; font-size: 12px;">최근 7일간 상품 상세페이지를 방문한 <strong>순수 유저 수 (중복 제거)</strong></span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #4f46e5; font-size: 12.5px;">• 식별 기준:</strong> <span style="color: #334155; font-size: 12px;">로그인 회원은 회원 고유번호(USER_ID), 비회원은 기기/브라우저 쿠키(DEVICE_UUID) 기준 중복 제거</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #dc2626; font-size: 12.5px;">• 어뷰징 방지:</strong> <span style="color: #334155; font-size: 12px;">동일인이 100번 방문해도 UV는 <strong>단 1명</strong>으로만 계산되어 매크로 무력화</span></p>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('m5_ex_bg', 570, 774, 458, 76, '#f5f3ff', '#ddd6fe', '6px', 102));
components.push(multiLineText('m5_ex_text', 578, 778, 442, 68, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #4338ca; font-size: 12.5px;">📊 계산 예시: [E.B.M 와이드 슬랙스]</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: #4338ca; line-height: 1.4;">• 최근 7일 순방문자 4,200명 ➔ 전체 상품 중 <strong>상위 6% (백분위 94 점)</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #4338ca; line-height: 1.4;">• <strong>환산 점수:</strong> 94 점 × 0.10 = <strong style="color: #4f46e5; font-size: 13.5px;">9.4 점</strong> (10점 만점 중 9.4점 획득)</p>
`, '12px', '400', '#4338ca', '1.3', 103));

// -------------------------------------------------------------
// [지표 6] 페이지뷰 (PV) - Row 2, Col 3
// -------------------------------------------------------------
components.push(rectShape('m6_bg', 1072, 598, 488, 264, '#f8fafc', '#cbd5e1', '8px', 101));
components.push(badgeShape('m6_b1', 1086, 610, 75, 22, '가중치 5%', '#475569', '#334155', '#ffffff', '12px', '4px', 103));
components.push(textShape('m6_title', 1168, 610, 250, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">페이지뷰 (PV) - 관심 트래픽 총량</strong></p>`, '14.5px', '700', '#0f172a', 'left', 103));
components.push(badgeShape('m6_b2', 1464, 610, 82, 22, '최대 5.0 점', '#f1f5f9', '#e2e8f0', '#475569', '12px', '4px', 103));

components.push(rectShape('m6_def_bg', 1086, 640, 460, 126, '#ffffff', '#e2e8f0', '6px', 102));
components.push(multiLineText('m6_def_text', 1094, 644, 444, 118, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #0f172a; font-size: 12.5px;">• 집계 원천:</strong> <span style="color: #334155; font-size: 12px;">최근 7일간 상품 상세페이지 총 호출/조회 로그 수</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #475569; font-size: 12.5px;">• 실무 가치:</strong> <span style="color: #334155; font-size: 12px;">반복 확인, 리뷰 탐색 등 <strong>쇼핑몰 내 체류 관심도</strong>를 보조적으로 반영</span></p>
    <p style="margin: 3px 0 0 0; line-height: 1.4;"><strong style="color: #dc2626; font-size: 12.5px;">• 1일 3회 캡(Cap):</strong> <span style="color: #334155; font-size: 12px;">F5 새로고침 매크로 방지를 위해 <strong>1인 1일 최대 3회까지만 인정</strong> (4회부터 카운트 제외)</span></p>
`, '12px', '400', '#334155', '1.3', 103));

components.push(rectShape('m6_ex_bg', 1086, 774, 460, 76, '#f8fafc', '#e2e8f0', '6px', 102));
components.push(multiLineText('m6_ex_text', 1094, 778, 444, 68, `
    <p style="margin: 0; line-height: 1.4;"><strong style="color: #334155; font-size: 12.5px;">📊 계산 예시: [E.B.M 와이드 슬랙스]</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: #334155; line-height: 1.4;">• 최근 7일 캡 적용 PV 11,500회 ➔ 전체 상품 중 <strong>상위 10% (백분위 90 점)</strong></p>
    <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #334155; line-height: 1.4;">• <strong>환산 점수:</strong> 90 점 × 0.05 = <strong style="color: #475569; font-size: 13.5px;">4.5 점</strong> (5점 만점 중 4.5점 획득)</p>
`, '12px', '400', '#334155', '1.3', 103));

let html = `<!DOCTYPE html>
<html lang="ko" style="--v4-text-color: #0f172a; --v4-font-size: 14px; --v4-font-weight: 400; --v4-font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; --v4-placeholder-color: #94a3b8;">
<head>
    <meta charset="UTF-8">
    <title>시선닷컴 상품 랭킹 6대 지표 실무 산정 기준 및 데이터 집계 정책</title>
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
console.log('Successfully generated 11_Daily_Ranking_Batch_Percentile_851.html with practical 6 metrics specifications!');
