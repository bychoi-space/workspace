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
function multiLineText(id, left, top, width, height, contentHtml, fontSize = '13.5px', fontWeight = '400', color = '#334155', lineHeight = '1.45', zIndex = 102) {
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
                <div class="v4-shape-text-content" style="width: 100%; text-align: center; padding: 3px 6px !important; height: 100%;">
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
// [1] SECTION 1: 6대 핵심 지표별 데이터 수집 기준 및 산정 방식 (Top: 76, Left: 20, W: 1560, H: 215)
// ==========================================
components.push(rectShape('s1_container', 20, 76, 1560, 215, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s1_lbl', 38, 88, 540, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 16px; color: #0f172a; white-space: nowrap !important;">1. 6대 핵심 지표별 데이터 수집 기준 및 산정 방식 (패션 시즌 특화)</strong></p>`, '16px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s1_tag', 590, 87, 265, 25, '가중치 합계 100% | 100점 만점 표준화', '#eff6ff', '#bfdbfe', '#1d4ed8', '12.5px', '4px', 102));

// 6개 카드 (W: 244, H: 155, Left: 36 + i*256, Top: 120)
const metrics = [
    {
        id: 'm1', name: '결제금액 (GMV)', weight: '35%', maxPt: '만점 35.0 점',
        scope: '시즌 전체 누적', scopeBg: '#eff6ff', scopeColor: '#1d4ed8',
        desc: '시즌 개시 후 실결제 완료 금액 합산 (취소/반품 즉시 차감). 고단가 상품의 실질적 매출 기여도를 정당하게 인정합니다.',
        color: '#2563eb'
    },
    {
        id: 'm2', name: '주문수량 (Vol)', weight: '25%', maxPt: '만점 25.0 점',
        scope: '시즌 전체 누적', scopeBg: '#e0f2fe', scopeColor: '#0284c7',
        desc: '시즌 개시 후 실제 판매된 주문 수량 합산 (1회 최대 5벌 캡). 저가 대량 인기 상품의 대중적 선호도를 반영합니다.',
        color: '#0284c7'
    },
    {
        id: 'm3', name: '장바구니 담기', weight: '15%', maxPt: '만점 15.0 점',
        scope: '배치 시점 스냅샷', scopeBg: '#ccfbf1', scopeColor: '#0f766e',
        desc: '매일 새벽 배치 시점 현재 장바구니에 담겨 있는 실시간 수량. 구매 직전의 즉각적 구매 전환 의향을 측정합니다.',
        color: '#0d9488'
    },
    {
        id: 'm4', name: '위시리스트 찜', weight: '10%', maxPt: '만점 10.0 점',
        scope: '배치 시점 스냅샷', scopeBg: '#ffe4e6', scopeColor: '#be123c',
        desc: '매일 새벽 배치 시점 현재 위시리스트에 찜 등록된 회원 수. 브랜드 룩북 및 신상품에 대한 잠재 선호도를 반영합니다.',
        color: '#e11d48'
    },
    {
        id: 'm5', name: '순방문자 (UV)', weight: '10%', maxPt: '만점 10.0 점',
        scope: '최근 7일 누적', scopeBg: '#ede9fe', scopeColor: '#4338ca',
        desc: '최근 7일간 상세페이지를 방문한 순수 방문자(회원+쿠키 중복 배제). 어뷰징 없는 순수 모객 파워를 측정합니다.',
        color: '#4f46e5'
    },
    {
        id: 'm6', name: '페이지뷰 (PV)', weight: '5%', maxPt: '만점 5.0 점',
        scope: '최근 7일 누적', scopeBg: '#f1f5f9', scopeColor: '#334155',
        desc: '최근 7일간 상세페이지 총 조회수 (1인 1일 최대 3회 캡 적용). 쇼핑몰 내 고객 체류 관심 트래픽 총량입니다.',
        color: '#475569'
    }
];

metrics.forEach((m, idx) => {
    const left = 36 + idx * 256;
    components.push(rectShape(`${m.id}_bg`, left, 120, 244, 155, '#f8fafc', '#cbd5e1', '8px', 101));
    components.push(badgeShape(`${m.id}_w`, left + 10, 129, 66, 24, m.weight, m.color, m.color, '#ffffff', '12.5px', '4px', 103));
    components.push(textShape(`${m.id}_t`, left + 82, 129, 152, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 15px; color: #0f172a; white-space: nowrap !important;">${m.name}</strong></p>`, '15px', '800', '#0f172a', 'left', 103));
    components.push(badgeShape(`${m.id}_sc`, left + 10, 158, 108, 24, m.scope, m.scopeBg, '#cbd5e1', m.scopeColor, '12px', '4px', 103));
    components.push(badgeShape(`${m.id}_pt`, left + 124, 158, 110, 24, m.maxPt, '#ffffff', '#cbd5e1', '#0f172a', '12px', '4px', 103));
    components.push(multiLineText(`${m.id}_desc`, left + 10, 187, 224, 82, `
        <p style="margin: 0; font-size: 13.5px; color: #334155; line-height: 1.45;">${m.desc}</p>
    `, '13.5px', '400', '#334155', '1.45', 103));
});

// ==========================================
// [2] SECTION 2: 10개 상품 실무 시뮬레이션 매트릭스 표 (Top: 299, Left: 20, W: 1560, H: 575)
// ==========================================
components.push(rectShape('s2_container', 20, 299, 1560, 575, '#ffffff', '#cbd5e1', '10px', 100));
components.push(textShape('s2_lbl', 38, 312, 560, 24, `<p style="white-space: nowrap !important;"><strong style="font-size: 16px; color: #0f172a; white-space: nowrap !important;">2. 패션 카테고리 10개 상품 랭킹 시뮬레이션 매트릭스 (가상 데이터 검증)</strong></p>`, '16px', '800', '#0f172a', 'left', 102));
components.push(badgeShape('s2_tag', 610, 311, 320, 25, 'Total Score = Base Score(100점) × 신상품 부스팅', '#fdf2f8', '#fbcfe8', '#be185d', '12.5px', '4px', 102));

// 10개 상품 시뮬레이션 데이터 (비즈니스 판정 요약 컬럼 제거, 폰트 13~14px 기준)
const products = [
    {
        rank: '1위 🏆', brand: 'it MICHAA', name: '플리츠 벨티드 원피스', price: '280,000원',
        launch: '출시 3일차', boost: '1.50x',
        gmv: '1,400만 (24.5점)', vol: '50벌 (16.5점)', cart: '45개 (11.0점)', wish: '180건 (8.5점)',
        uv: '2,800명 (8.0점)', pv: '6,200회 (3.8점)', base: '72.3 점',
        total: '108.5 점',
        isTop1: true
    },
    {
        rank: '2위 🥈', brand: 'E.B.M', name: '와이드 핏 텐셀 슬랙스', price: '79,000원',
        launch: '출시 45일차', boost: '1.00x',
        gmv: '3,160만 (29.0점)', vol: '400벌 (24.8점)', cart: '88개 (14.2점)', wish: '320건 (9.8점)',
        uv: '4,500명 (9.5점)', pv: '12,000회 (4.8점)', base: '92.1 점',
        total: '92.1 점',
        isTop2: true
    },
    {
        rank: '3위 🥉', brand: 'MICHAA', name: '캐시미어 핸드메이드 코트', price: '1,590,000원',
        launch: '출시 50일차', boost: '1.00x',
        gmv: '1억 2,720만 (34.8점)', vol: '80벌 (18.2점)', cart: '32개 (9.5점)', wish: '410건 (10.0점)',
        uv: '3,800명 (8.8점)', pv: '9,500회 (4.2점)', base: '85.5 점',
        total: '85.5 점',
        isTop3: true
    },
    {
        rank: '4위', brand: 'it MICHAA', name: '트위드 크롭 자켓', price: '359,000원',
        launch: '출시 10일차', boost: '1.30x',
        gmv: '2,513만 (27.2점)', vol: '70벌 (17.5점)', cart: '38개 (10.2점)', wish: '210건 (8.8점)',
        uv: '2,400명 (7.5점)', pv: '5,800회 (3.5점)', base: '64.7 점',
        total: '84.1 점'
    },
    {
        rank: '5위', brand: 'E.B.M', name: '배색 스트라이프 니트', price: '99,000원',
        launch: '출시 40일차', boost: '1.00x',
        gmv: '2,178만 (26.0점)', vol: '220벌 (22.5점)', cart: '62개 (12.8점)', wish: '260건 (9.2점)',
        uv: '3,200명 (8.2점)', pv: '8,400회 (4.0점)', base: '82.7 점',
        total: '82.7 점'
    },
    {
        rank: '6위', brand: 'MICHAA', name: '실크 블렌드 머메이드 스커트', price: '590,000원',
        launch: '출시 35일차', boost: '1.00x',
        gmv: '4,130만 (31.5점)', vol: '70벌 (17.5점)', cart: '25개 (8.5점)', wish: '290건 (9.5점)',
        uv: '2,600명 (7.8점)', pv: '6,800회 (3.7점)', base: '78.5 점',
        total: '78.5 점'
    },
    {
        rank: '7위', brand: 'it MICHAA', name: '테일러드 싱글 자켓', price: '299,000원',
        launch: '출시 20일차', boost: '1.15x',
        gmv: '1,794만 (25.2점)', vol: '60벌 (16.8점)', cart: '28개 (9.0점)', wish: '160건 (8.0점)',
        uv: '1,900명 (6.8점)', pv: '4,600회 (3.2점)', base: '69.0 점',
        total: '79.4 점'
    },
    {
        rank: '8위', brand: 'E.B.M', name: '베이직 오버핏 셔츠', price: '69,000원',
        launch: '출시 60일차', boost: '1.00x',
        gmv: '1,242만 (23.5점)', vol: '180벌 (21.0점)', cart: '45개 (11.0점)', wish: '140건 (7.5점)',
        uv: '2,100명 (7.2점)', pv: '5,200회 (3.4점)', base: '73.6 점',
        total: '73.6 점'
    },
    {
        rank: '9위', brand: 'MICHAA', name: '시그니처 벨티드 셔츠 원피스', price: '890,000원',
        launch: '출시 55일차', boost: '1.00x',
        gmv: '3,115만 (28.5점)', vol: '35벌 (14.0점)', cart: '18개 (7.2점)', wish: '220건 (8.9점)',
        uv: '1,800명 (6.5점)', pv: '4,800회 (3.3점)', base: '68.4 점',
        total: '68.4 점'
    },
    {
        rank: '10위', brand: 'it MICHAA', name: '레더 미니 토트백 (잡화)', price: '189,000원',
        launch: '출시 70일차', boost: '1.00x',
        gmv: '945만 (21.0점)', vol: '50벌 (16.5점)', cart: '22개 (8.0점)', wish: '120건 (7.0점)',
        uv: '1,500명 (6.0점)', pv: '3,900회 (3.0점)', base: '61.5 점',
        total: '61.5 점'
    }
];

// 테이블 행 생성 (13~14px 폰트, 여유 있는 행 높이 45px)
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
        <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0; height: 45px;">
            <td style="padding: 6px 4px; font-weight: ${rankWeight}; color: ${rankColor}; font-size: 14px;">${p.rank}</td>
            <td style="padding: 6px 8px; text-align: left; font-size: 13.5px;"><span style="font-weight: 800; color: #0f172a;">[${p.brand}]</span> <span style="color: #1e293b; font-weight: 600;">${p.name}</span> <span style="color: #64748b; font-size: 12.5px;">(${p.price})</span></td>
            <td style="padding: 6px 4px; font-weight: 700; font-size: 13.5px; color: ${p.boost !== '1.00x' ? '#be185d' : '#475569'};">${p.launch} <span style="font-size: 12px; font-weight: 800;">(${p.boost})</span></td>
            <td style="padding: 6px 4px; color: #1e3a8a; font-weight: 700; font-size: 14px;">${p.gmv}</td>
            <td style="padding: 6px 4px; color: #0369a1; font-weight: 700; font-size: 14px;">${p.vol}</td>
            <td style="padding: 6px 4px; color: #0f766e; font-weight: 600; font-size: 13.5px;">${p.cart}</td>
            <td style="padding: 6px 4px; color: #be123c; font-weight: 600; font-size: 13.5px;">${p.wish}</td>
            <td style="padding: 6px 4px; color: #4338ca; font-weight: 600; font-size: 13.5px;">${p.uv}</td>
            <td style="padding: 6px 4px; color: #475569; font-weight: 600; font-size: 13.5px;">${p.pv}</td>
            <td style="padding: 6px 4px; font-weight: 800; color: #334155; font-size: 14px;">${p.base}</td>
            <td style="padding: 6px 4px; font-weight: 900; color: ${totalColor}; font-size: 15.5px;">${p.total}</td>
        </tr>
    `;
}).join('\n');

components.push(rectShape('s2_tb_container', 38, 344, 1520, 514, '#ffffff', '#cbd5e1', '8px', 101));
components.push(multiLineText('s2_tb_content', 40, 346, 1516, 510, `
    <table style="width: 100%; border-collapse: collapse; text-align: center;">
        <thead>
            <tr style="background: #0f172a; color: #ffffff; border-bottom: 1.6px solid #1e293b; height: 46px; font-size: 13.5px;">
                <th style="padding: 6px 4px; width: 75px;">순위</th>
                <th style="padding: 6px 8px; text-align: left; width: 325px;">브랜드 / 상품명 (판매가)</th>
                <th style="padding: 6px 4px; width: 140px;">출시 시점 (부스트)</th>
                <th style="padding: 6px 4px; width: 140px; color: #93c5fd;">결제금액 (35점)<br><span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">시즌 전체 누적</span></th>
                <th style="padding: 6px 4px; width: 135px; color: #7dd3fc;">주문수량 (25점)<br><span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">시즌 전체 누적</span></th>
                <th style="padding: 6px 4px; width: 125px; color: #5eead4;">장바구니 (15점)<br><span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">현재 스냅샷</span></th>
                <th style="padding: 6px 4px; width: 125px; color: #fda4af;">위시리스트 (10점)<br><span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">현재 스냅샷</span></th>
                <th style="padding: 6px 4px; width: 125px; color: #c4b5fd;">UV (10점)<br><span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">최근 7일 누적</span></th>
                <th style="padding: 6px 4px; width: 115px; color: #cbd5e1;">PV (5점)<br><span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">최근 7일 (3회 캡)</span></th>
                <th style="padding: 6px 4px; width: 95px;">Base<br><span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">기본 (100점)</span></th>
                <th style="padding: 6px 4px; width: 120px; color: #38bdf8;">최종 종합 점수<br><span style="font-size: 12px; font-weight: 400; color: #38bdf8;">Total Score</span></th>
            </tr>
        </thead>
        <tbody>
            ${tableRowsHtml}
        </tbody>
    </table>
`, '13.5px', '400', '#334155', '1.3', 103));

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
console.log('Successfully regenerated 11_Daily_Ranking_Batch_Percentile_851.html with refined layout and enlarged typography!');
