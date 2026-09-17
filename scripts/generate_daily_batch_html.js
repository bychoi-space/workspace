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
// [0] HEADER (Top: 20, Left: 20, W: 1560, H: 48)
// ==========================================
components.push(rectShape('hdr_bg', 20, 20, 1560, 48, '#0f172a', '#1e293b', '10px', 100));
components.push(iconShape('hdr_icon', 38, 31, 24, 24, `
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
`, '#38bdf8', 105));
components.push(textShape('hdr_title', 74, 30, 680, 26, `<p style="white-space: nowrap !important;"><strong style="color: #ffffff; font-size: 17.5px; white-space: nowrap !important;">시선닷컴 상품 랭킹 산정 기준 &amp; 10개 상품 실무 시뮬레이션</strong></p>`, '17.5px', '800', '#ffffff', 'left', 105));
components.push(badgeShape('hdr_tag', 1310, 29, 250, 30, 'RANKING POLICY & 10 PRODUCTS', '#1e293b', '#38bdf8', '#38bdf8', '12px', '6px', 105));

// ==========================================
// [1] SECTION 1: 6대 핵심 지표별 데이터 수집 기준 및 산정 방식 (Top: 78, Left: 20, W: 1560, H: 184)
// ==========================================
components.push(rectShape('s1_container', 20, 78, 1560, 184, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s1_lbl', 38, 92, 480, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">1. 6대 핵심 지표별 데이터 수집 기준 및 산정 방식 (패션 시즌 특성 반영)</strong></p>`, '14.5px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s1_tag', 530, 91, 250, 24, '가중치 합계 100% | 100점 만점 표준화', '#eff6ff', '#bfdbfe', '#1d4ed8', '12px', '4px', 102));

// 6개 카드 (W: 242, H: 130, Left: 38 + i*(242+13) = 38, 293, 548, 803, 1058, 1313, Top: 120)
const metrics = [
    {
        id: 'm1', name: '결제금액 (GMV)', weight: '35%', maxPt: '35.0 점',
        scope: '시즌 전체 누적', scopeBg: '#eff6ff', scopeColor: '#1d4ed8',
        desc: '시즌 개시 후 실결제 완료 금액 합산 (취소/반품 즉시 차감). 고단가 상품 매출 기여도 정당 인정',
        color: '#2563eb'
    },
    {
        id: 'm2', name: '주문수량 (Vol)', weight: '25%', maxPt: '25.0 점',
        scope: '시즌 전체 누적', scopeBg: '#e0f2fe', scopeColor: '#0284c7',
        desc: '시즌 개시 후 실제 판매 수량(QTY) 합산 (1인 1주문 최대 5벌 캡). 저가 대량 인기 상품 대중성 보장',
        color: '#0284c7'
    },
    {
        id: 'm3', name: '장바구니 담기', weight: '15%', maxPt: '15.0 점',
        scope: '배치 시점 스냅샷', scopeBg: '#ccfbf1', scopeColor: '#0f766e',
        desc: '매일 배치 가동 시점 현재 장바구니 보관함에 담겨 있는 실시간 수량. 즉각적 구매 전환 의향 측정',
        color: '#0d9488'
    },
    {
        id: 'm4', name: '위시리스트 찜', weight: '10%', maxPt: '10.0 점',
        scope: '배치 시점 스냅샷', scopeBg: '#ffe4e6', scopeColor: '#be123c',
        desc: '매일 배치 가동 시점 현재 위시리스트에 찜 등록된 회원 수. 브랜드 룩북 및 시즌 잠재 선호도',
        color: '#e11d48'
    },
    {
        id: 'm5', name: '순방문자 (UV)', weight: '10%', maxPt: '10.0 점',
        scope: '최근 7일 누적', scopeBg: '#ede9fe', scopeColor: '#4338ca',
        desc: '최근 7일간 상품 상세를 조회한 순수 방문자(회원 ID + 쿠키 중복 제거). 순수 모객 파워 측정',
        color: '#4f46e5'
    },
    {
        id: 'm6', name: '페이지뷰 (PV)', weight: '5%', maxPt: '5.0 점',
        scope: '최근 7일 누적', scopeBg: '#f1f5f9', scopeColor: '#334155',
        desc: '최근 7일간 상세페이지 조회수 (1인 1일 최대 3회 캡 적용 매크로 차단). 체류 관심 트래픽 총량',
        color: '#475569'
    }
];

metrics.forEach((m, idx) => {
    const left = 38 + idx * 255;
    components.push(rectShape(`${m.id}_bg`, left, 120, 244, 130, '#f8fafc', '#cbd5e1', '8px', 101));
    components.push(badgeShape(`${m.id}_w`, left + 10, 128, 62, 20, m.weight, m.color, m.color, '#ffffff', '11.5px', '4px', 103));
    components.push(textShape(`${m.id}_t`, left + 76, 127, 158, 20, `<p style="white-space: nowrap !important;"><strong style="font-size: 13px; color: #0f172a; white-space: nowrap !important;">${m.name}</strong></p>`, '13px', '700', '#0f172a', 'left', 103));
    components.push(badgeShape(`${m.id}_sc`, left + 10, 152, 105, 20, m.scope, m.scopeBg, '#cbd5e1', m.scopeColor, '11.5px', '4px', 103));
    components.push(badgeShape(`${m.id}_pt`, left + 120, 152, 114, 20, `만점 ${m.maxPt}`, '#ffffff', '#cbd5e1', '#0f172a', '11.5px', '4px', 103));
    components.push(multiLineText(`${m.id}_desc`, left + 8, 174, 228, 70, `
        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.35;">${m.desc}</p>
    `, '12px', '400', '#475569', '1.35', 103));
});

// ==========================================
// [2] SECTION 2: 10개 상품 실무 시뮬레이션 매트릭스 표 (Top: 272, Left: 20, W: 1560, H: 610)
// ==========================================
components.push(rectShape('s2_container', 20, 272, 1560, 610, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s2_lbl', 38, 286, 520, 22, `<p style="white-space: nowrap !important;"><strong style="font-size: 14.5px; color: #0f172a; white-space: nowrap !important;">2. 패션 카테고리 10개 상품 랭킹 시뮬레이션 매트릭스 (가상 데이터 검증)</strong></p>`, '14.5px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s2_tag', 565, 285, 300, 24, 'Total Score = Base Score(100점) × 신상품 부스팅', '#fdf2f8', '#fbcfe8', '#be185d', '12px', '4px', 102));

// 10개 상품 시뮬레이션 데이터
const products = [
    {
        rank: '1위 🏆', brand: 'it MICHAA', name: '플리츠 벨티드 원피스', price: '280,000원',
        launch: '출시 3일차', boost: '1.50x',
        gmv: '1,400만 (24.5점)', vol: '50벌 (16.5점)', cart: '45개 (11.0점)', wish: '180건 (8.5점)',
        uv: '2,800명 (8.0점)', pv: '6,200회 (3.8점)', base: '72.3 점',
        total: '108.5 점', note: '신상품 슈퍼 부스트(1.5x)로 당당히 전체 1위 등극!',
        isTop1: true
    },
    {
        rank: '2위 🥈', brand: 'E.B.M', name: '와이드 핏 텐셀 슬랙스', price: '79,000원',
        launch: '출시 45일차', boost: '1.00x',
        gmv: '3,160만 (29.0점)', vol: '400벌 (24.8점)', cart: '88개 (14.2점)', wish: '320건 (9.8점)',
        uv: '4,500명 (9.5점)', pv: '12,000회 (4.8점)', base: '92.1 점',
        total: '92.1 점', note: '저가 대량 인기 1위! 압도적 수량과 트래픽으로 기존 상품 중 1위',
        isTop2: true
    },
    {
        rank: '3위 🥉', brand: 'MICHAA', name: '캐시미어 핸드메이드 코트', price: '1,590,000원',
        launch: '출시 50일차', boost: '1.00x',
        gmv: '1억 2,720만 (34.8점)', vol: '80벌 (18.2점)', cart: '32개 (9.5점)', wish: '410건 (10.0점)',
        uv: '3,800명 (8.8점)', pv: '9,500회 (4.2점)', base: '85.5 점',
        total: '85.5 점', note: '고가 프리미엄 1위! 결제금액 만점 수준(34.8점)으로 상위권 수성',
        isTop3: true
    },
    {
        rank: '4위', brand: 'it MICHAA', name: '트위드 크롭 자켓', price: '359,000원',
        launch: '출시 10일차', boost: '1.30x',
        gmv: '2,513만 (27.2점)', vol: '70벌 (17.5점)', cart: '38개 (10.2점)', wish: '210건 (8.8점)',
        uv: '2,400명 (7.5점)', pv: '5,800회 (3.5점)', base: '64.7 점',
        total: '84.1 점', note: '출시 10일차 성장 부스트(1.3x) 승산으로 4위 상위 랭크',
        isTop4: true
    },
    {
        rank: '5위', brand: 'E.B.M', name: '배색 스트라이프 니트', price: '99,000원',
        launch: '출시 40일차', boost: '1.00x',
        gmv: '2,178만 (26.0점)', vol: '220벌 (22.5점)', cart: '62개 (12.8점)', wish: '260건 (9.2점)',
        uv: '3,200명 (8.2점)', pv: '8,400회 (4.0점)', base: '82.7 점',
        total: '82.7 점', note: '꾸준한 판매 볼륨과 높은 장바구니 담기로 5위 안착'
    },
    {
        rank: '6위', brand: 'MICHAA', name: '실크 블렌드 머메이드 스커트', price: '590,000원',
        launch: '출시 35일차', boost: '1.00x',
        gmv: '4,130만 (31.5점)', vol: '70벌 (17.5점)', cart: '25개 (8.5점)', wish: '290건 (9.5점)',
        uv: '2,600명 (7.8점)', pv: '6,800회 (3.7점)', base: '78.5 점',
        total: '78.5 점', note: '높은 객단가와 위시리스트 관심도로 안정적 6위'
    },
    {
        rank: '7위', brand: 'it MICHAA', name: '테일러드 싱글 자켓', price: '299,000원',
        launch: '출시 20일차', boost: '1.15x',
        gmv: '1,794만 (25.2점)', vol: '60벌 (16.8점)', cart: '28개 (9.0점)', wish: '160건 (8.0점)',
        uv: '1,900명 (6.8점)', pv: '4,600회 (3.2점)', base: '69.0 점',
        total: '79.4 점', note: '출시 20일차 안착 부스트(1.15x) 승산으로 7위권 유지'
    },
    {
        rank: '8위', brand: 'E.B.M', name: '베이직 오버핏 셔츠', price: '69,000원',
        launch: '출시 60일차', boost: '1.00x',
        gmv: '1,242만 (23.5점)', vol: '180벌 (21.0점)', cart: '45개 (11.0점)', wish: '140건 (7.5점)',
        uv: '2,100명 (7.2점)', pv: '5,200회 (3.4점)', base: '73.6 점',
        total: '73.6 점', note: '합리적 가격대의 높은 일상 주문 수량 확보로 8위'
    },
    {
        rank: '9위', brand: 'MICHAA', name: '시그니처 벨티드 셔츠 원피스', price: '890,000원',
        launch: '출시 55일차', boost: '1.00x',
        gmv: '3,115만 (28.5점)', vol: '35벌 (14.0점)', cart: '18개 (7.2점)', wish: '220건 (8.9점)',
        uv: '1,800명 (6.5점)', pv: '4,800회 (3.3점)', base: '68.4 점',
        total: '68.4 점', note: '매니아층 고정 구매와 결제금액 기여로 TOP 10 유지'
    },
    {
        rank: '10위', brand: 'it MICHAA', name: '레더 미니 토트백 (잡화)', price: '189,000원',
        launch: '출시 70일차', boost: '1.00x',
        gmv: '945만 (21.0점)', vol: '50벌 (16.5점)', cart: '22개 (8.0점)', wish: '120건 (7.0점)',
        uv: '1,500명 (6.0점)', pv: '3,900회 (3.0점)', base: '61.5 점',
        total: '61.5 점', note: '의류와 세트 코디 연계 구매로 TOP 10 진입'
    }
];

// 테이블 생성
let tableRowsHtml = products.map((p, idx) => {
    let rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    let rankColor = '#0f172a';
    let rankWeight = '700';
    let totalColor = '#0f172a';

    if (p.isTop1) {
        rowBg = '#fdf2f8';
        rankColor = '#be185d';
        rankWeight = '900';
        totalColor = '#be185d';
    } else if (p.isTop2) {
        rowBg = '#eff6ff';
        rankColor = '#1d4ed8';
        rankWeight = '900';
        totalColor = '#1d4ed8';
    } else if (p.isTop3) {
        rowBg = '#f8fafc';
        rankColor = '#0f172a';
        rankWeight = '900';
        totalColor = '#0f172a';
    }

    return `
        <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0; height: 38px;">
            <td style="padding: 4px; font-weight: ${rankWeight}; color: ${rankColor}; font-size: 12.5px;">${p.rank}</td>
            <td style="padding: 4px; text-align: left;"><span style="font-weight: 700; color: #0f172a;">[${p.brand}]</span> <span style="color: #334155;">${p.name}</span> <span style="color: #64748b; font-size: 11.5px;">(${p.price})</span></td>
            <td style="padding: 4px; font-weight: 700; color: ${p.boost !== '1.00x' ? '#be185d' : '#475569'};">${p.launch} <span style="font-size: 11.5px;">(${p.boost})</span></td>
            <td style="padding: 4px; color: #1e3a8a; font-weight: 600;">${p.gmv}</td>
            <td style="padding: 4px; color: #0369a1; font-weight: 600;">${p.vol}</td>
            <td style="padding: 4px; color: #0f766e;">${p.cart}</td>
            <td style="padding: 4px; color: #be123c;">${p.wish}</td>
            <td style="padding: 4px; color: #4338ca;">${p.uv}</td>
            <td style="padding: 4px; color: #475569;">${p.pv}</td>
            <td style="padding: 4px; font-weight: 700; color: #334155;">${p.base}</td>
            <td style="padding: 4px; font-weight: 900; color: ${totalColor}; font-size: 13.5px;">${p.total}</td>
            <td style="padding: 4px; text-align: left; font-size: 11.5px; color: #475569;">${p.note}</td>
        </tr>
    `;
}).join('\n');

components.push(rectShape('s2_tb_container', 38, 316, 1520, 480, '#ffffff', '#cbd5e1', '8px', 101));
components.push(multiLineText('s2_tb_content', 42, 320, 1512, 472, `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center;">
        <thead>
            <tr style="background: #0f172a; color: #ffffff; border-bottom: 1.6px solid #1e293b; height: 38px; font-size: 12px;">
                <th style="padding: 4px; width: 60px;">순위</th>
                <th style="padding: 4px; text-align: left; width: 270px;">브랜드 / 상품명 (판매가)</th>
                <th style="padding: 4px; width: 130px;">출시 시점 (부스트)</th>
                <th style="padding: 4px; width: 125px; color: #93c5fd;">결제금액 (35점)<br><span style="font-size: 11px; font-weight: 400; color: #cbd5e1;">시즌 전체 누적</span></th>
                <th style="padding: 4px; width: 120px; color: #7dd3fc;">주문수량 (25점)<br><span style="font-size: 11px; font-weight: 400; color: #cbd5e1;">시즌 전체 누적</span></th>
                <th style="padding: 4px; width: 115px; color: #5eead4;">장바구니 (15점)<br><span style="font-size: 11px; font-weight: 400; color: #cbd5e1;">현재 스냅샷</span></th>
                <th style="padding: 4px; width: 115px; color: #fda4af;">위시리스트 (10점)<br><span style="font-size: 11px; font-weight: 400; color: #cbd5e1;">현재 스냅샷</span></th>
                <th style="padding: 4px; width: 115px; color: #c4b5fd;">UV (10점)<br><span style="font-size: 11px; font-weight: 400; color: #cbd5e1;">최근 7일</span></th>
                <th style="padding: 4px; width: 110px; color: #cbd5e1;">PV (5점)<br><span style="font-size: 11px; font-weight: 400; color: #cbd5e1;">최근 7일(캡)</span></th>
                <th style="padding: 4px; width: 85px;">Base<br><span style="font-size: 11px; font-weight: 400; color: #cbd5e1;">기본(100점)</span></th>
                <th style="padding: 4px; width: 95px; color: #38bdf8;">최종 점수<br><span style="font-size: 11px; font-weight: 400; color: #38bdf8;">Total Score</span></th>
                <th style="padding: 4px; text-align: left; width: 220px;">비즈니스 판정 요약</th>
            </tr>
        </thead>
        <tbody>
            ${tableRowsHtml}
        </tbody>
    </table>
`, '12px', '400', '#334155', '1.3', 103));

// 하단 요약 바 (Top: 812, W: 1520, H: 54)
components.push(rectShape('s2_bot_bar', 38, 812, 1520, 54, '#f8fafc', '#cbd5e1', '6px', 102));
components.push(multiLineText('s2_bot_text', 50, 818, 1496, 42, `
    <p style="margin: 0; line-height: 1.45;"><strong style="color: #0f172a; font-size: 12.5px;">💡 패션 커머스 랭킹 시뮬레이션 핵심 요약:</strong> <span style="color: #334155; font-size: 12px;"><strong>① [시즌 전체 누적 결제/수량]</strong>으로 판매 볼륨을 든든하게 받치고, <strong>② [현재 스냅샷 장바구니/위시]</strong>와 <strong>[최근 7일 UV/PV]</strong>로 최신 고객 반응을 실시간 반영합니다. <strong>③ [신상품 부스팅(1.5x~1.15x)]</strong>을 통해 런칭 초기 상품이 기존 스테디셀러를 제치고 상단에 노출되는 기회를 보장하여 신구 조화가 완벽히 달성됩니다.</span></p>
`, '12px', '400', '#334155', '1.4', 103));

let html = `<!DOCTYPE html>
<html lang="ko" style="--v4-text-color: #0f172a; --v4-font-size: 14px; --v4-font-weight: 400; --v4-font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; --v4-placeholder-color: #94a3b8;">
<head>
    <meta charset="UTF-8">
    <title>시선닷컴 상품 랭킹 산정 기준 &amp; 10개 상품 실무 시뮬레이션</title>
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
console.log('Successfully generated 11_Daily_Ranking_Batch_Percentile_851.html with 10 products simulation table!');
