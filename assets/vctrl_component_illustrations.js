/**
 * bychoi workspace V4 - Illustration Library Catalog
 * Decoupled from vctrl_component_data.js for performance and modularity (Phase 3).
 * Enforces SSOT standard interface for 3D/2D Admin, Customer Journey, and Atomic System illustrations.
 */

if (!window.V4_COMPONENT_LIBRARY) {
    window.V4_COMPONENT_LIBRARY = { atoms: [], molecules: [], canvasBackgrounds: [], illustrations: [] };
}

window.V4_COMPONENT_LIBRARY.illustrations = [
        // =========================================================================
        // [Group 1] 3D Admin 시스템 (3D 아이소메트릭 엔터프라이즈 도메인 - 7종)
        // =========================================================================
        {
            id: 'v4-ill-admin-pim',
            name: '[3D] 상품관리',
            title: '3D 상품관리 (PIM & 카탈로그 LLM 추천)',
            koName: '3d 상품관리 pim llm 인공지능 tpo 키워드 체형 사이즈 카탈로그 추천 product 시스템개선',
            group: '3d_admin',
            groupTitle: '🏢 3D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_3d_pim.png',
            previewHtml: `<img src="assets/illustrations/admin_3d_pim.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_3d_pim.png" alt="3D 상품관리 (PIM &amp; 카탈로그)" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-3d-cms',
            name: '[3D] 전시관리',
            title: '3D 전시관리 (CMS & 큐레이션 카드화)',
            koName: '3d 전시관리 cms 통합카테고리 카드블록 자동퍼블리싱 큐레이션 display mobile pc 시스템개선',
            group: '3d_admin',
            groupTitle: '🏢 3D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_3d_cms.png',
            previewHtml: `<img src="assets/illustrations/admin_3d_cms.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_3d_cms.png" alt="3D 전시관리 (CMS &amp; 큐레이션)" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-3d-order',
            name: '[3D] 주문결제',
            title: '3D 주문/결제 통합 (Fulfillment & 트랜잭션)',
            koName: '3d 주문관리 결제 order payment 트랜잭션 풀필먼트 파이프라인 안전성 시스템개선',
            group: '3d_admin',
            groupTitle: '🏢 3D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_3d_order.png',
            previewHtml: `<img src="assets/illustrations/admin_3d_order.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_3d_order.png" alt="3D 주문/결제 통합 관리" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-3d-claim',
            name: '[3D] 클레임관리',
            title: '3D 클레임 관리 (반품/교환 & 자동환불)',
            koName: '3d 클레임 claim 반품 교환 역물류 수거 신속환불 정산자동화 시스템개선',
            group: '3d_admin',
            groupTitle: '🏢 3D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_3d_claim.png',
            previewHtml: `<img src="assets/illustrations/admin_3d_claim.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_3d_claim.png" alt="3D 클레임 관리 (반품/환불)" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-3d-logistics',
            name: '[3D] 물류배송',
            title: '3D 물류 & 배송 트래킹 (WMS/TMS 자동화)',
            koName: '3d 배송관리 logistics 물류 실시간재고 배송예정일자동화 풀필먼트 도착예측 delivery shipping 시스템개선',
            group: '3d_admin',
            groupTitle: '🏢 3D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_3d_logistics.png',
            previewHtml: `<img src="assets/illustrations/admin_3d_logistics.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_3d_logistics.png" alt="3D 물류 &amp; 배송 트래킹" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-3d-membership',
            name: '[3D] 회원멤버십',
            title: '3D 회원/멤버십 (CRM & VIP 로열티)',
            koName: '3d 회원관리 membership crm 고객여정 vip 등급 분석 로열티 시스템개선',
            group: '3d_admin',
            groupTitle: '🏢 3D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_3d_membership.png',
            previewHtml: `<img src="assets/illustrations/admin_3d_membership.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_3d_membership.png" alt="3D 회원/멤버십 관리" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-3d-promotion',
            name: '[3D] 프로모션',
            title: '3D 프로모션 & 마케팅 (쿠폰/타임특가)',
            koName: '3d 프로모션 promotion 마케팅 쿠폰 마일리지 연산엔진 매출전환 타임특가 시스템개선',
            group: '3d_admin',
            groupTitle: '🏢 3D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_3d_promotion.png',
            previewHtml: `<img src="assets/illustrations/admin_3d_promotion.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_3d_promotion.png" alt="3D 프로모션 &amp; 마케팅" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },

        // =========================================================================
        // [Group 2] 2D Admin 시스템 (플랫 벡터 라인아트 엔터프라이즈 - 3종)
        // =========================================================================
        {
            id: 'v4-ill-admin-vec-pim',
            name: '[2D] 상품관리',
            title: '2D 상품 카탈로그 및 실측 관리 (PIM)',
            koName: '2d 벡터 상품관리 pim 마네킹 줄자 상세정보 실측 카탈로그 시스템개선',
            group: '2d_admin',
            groupTitle: '📐 2D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_vector_pim.png',
            previewHtml: `<img src="assets/illustrations/admin_vector_pim.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_vector_pim.png" alt="2D 상품관리 (실측 &amp; 상세)" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-vec-cms',
            name: '[2D] 전시관리',
            title: '2D 전시 및 배너/콘텐츠 관리 (CMS)',
            koName: '2d 벡터 전시관리 cms 카드조립 디스플레이 배너 콘텐츠 시스템개선',
            group: '2d_admin',
            groupTitle: '📐 2D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_vector_cms.png',
            previewHtml: `<img src="assets/illustrations/admin_vector_cms.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_vector_cms.png" alt="2D 전시관리 (카드 조립)" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-admin-vec-logistics',
            name: '[2D] 배송물류',
            title: '2D 배송 추적 및 일정 관리 (Logistics)',
            koName: '2d 벡터 배송관리 logistics 물류 택배상자 달력 스케줄 일정 시스템개선',
            group: '2d_admin',
            groupTitle: '📐 2D Admin 시스템',
            category: 'Illustration',
            width: '240px',
            height: '240px',
            thumb: 'assets/illustrations/admin_vector_logistics.png',
            previewHtml: `<img src="assets/illustrations/admin_vector_logistics.png" style="width: 100%; height: 100%; object-fit: contain;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/admin_vector_logistics.png" alt="2D 배송관리 (택배 &amp; 스케줄)" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },

        // =========================================================================
        // [Group 3] 고객 구매 여정 (Customer Shopping Journey - 8종)
        // =========================================================================
        {
            id: 'v4-ill-enter',
            name: '[여정 01] 입장',
            title: '01. 시스템 입장 (포털 진입 & 디지털 스토어)',
            koName: '01 시스템 입장 쇼핑몰 진입 포털 디지털스토어 enter login portal store',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step1_enter_ecommerce.png',
            previewHtml: `<img src="assets/illustrations/step1_enter_ecommerce.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step1_enter_ecommerce.png" alt="01. 시스템 입장" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-browse',
            name: '[여정 02] 탐색',
            title: '02. 상품 둘러보기 (의류 탐색 & 카탈로그 검색)',
            koName: '02 상품 둘러보기 의류 탐색 행거 돋보기 browse search clothes catalog',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step2_browse_clothing.png',
            previewHtml: `<img src="assets/illustrations/step2_browse_clothing.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step2_browse_clothing.png" alt="02. 상품 둘러보기" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-select',
            name: '[여정 03] 선택',
            title: '03. 상품 선택 (디테일 확인 & 장바구니 담기)',
            koName: '03 상품 선택 의류 선택 재킷 골라담기 체크 장바구니 select pick choose jacket cart',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step3_select_clothing.png',
            previewHtml: `<img src="assets/illustrations/step3_select_clothing.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step3_select_clothing.png" alt="03. 상품 선택" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-membership',
            name: '[여정 04] 멤버십',
            title: '04. 멤버십 가입 (VIP 혜택 & 회원 연동)',
            koName: '04 멤버십 가입 회원가입 vip 카드 프로필 로열티 membership join signup',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step4_membership_signup.png',
            previewHtml: `<img src="assets/illustrations/step4_membership_signup.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step4_membership_signup.png" alt="04. 멤버십 가입" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-discount',
            name: '[여정 05] 할인혜택',
            title: '05. 할인 혜택 (쿠폰 적용 & 타임 세일)',
            koName: '05 할인 혜택 세일 쿠폰 가격인하 코인 프로모션 discount sale coupon off promo',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step5_discount_clothing.png',
            previewHtml: `<img src="assets/illustrations/step5_discount_clothing.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step5_discount_clothing.png" alt="05. 할인 혜택" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-payment',
            name: '[여정 06] 주문결제',
            title: '06. 주문 및 결제 (체크아웃 & PG 결제)',
            koName: '06 상품 결제 체크아웃 카드 단말기 정산 pos payment checkout pay 주문',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step6_payment_checkout.png',
            previewHtml: `<img src="assets/illustrations/step6_payment_checkout.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step6_payment_checkout.png" alt="06. 주문 및 결제" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-delivery',
            name: '[여정 07] 배송수령',
            title: '07. 물류 및 배송 수령 (패키지 택배 완료)',
            koName: '07 배송 수령 택배 상자 배달 기사 delivery receive package box courier 도착',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step7_delivery_receive.png',
            previewHtml: `<img src="assets/illustrations/step7_delivery_receive.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step7_delivery_receive.png" alt="07. 물류 및 배송 수령" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-return',
            name: '[여정 08] 반품교환',
            title: '08. 반품 및 교환 (역물류 & 환불 신청)',
            koName: '08 상품 반품 교환 반품접수 회수 데스크 return exchange parcel courier 역물류 환불',
            group: 'journey',
            groupTitle: '🛍️ 고객 구매 여정',
            category: 'Illustration',
            width: '200px',
            height: '200px',
            thumb: 'assets/illustrations/step8_return_clothing.png',
            previewHtml: `<img src="assets/illustrations/step8_return_clothing.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/step8_return_clothing.png" alt="08. 반품 및 교환" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },

        // =========================================================================
        // [Group 4] 아토믹 디자인 시스템 (Atomic Design & Storybook - 7종)
        // =========================================================================
        {
            id: 'v4-ill-atomic-atoms',
            name: '[아토믹 01] Atoms',
            title: '01. Atoms (최소 UI 단위 - 버튼, 인풋, 아이콘, 폰트)',
            koName: '01 아토믹 원자 atoms button icon color typography 기초단위',
            group: 'atomic',
            groupTitle: '🧬 아토믹 디자인 시스템',
            category: 'Illustration',
            width: '120px',
            height: '240px',
            thumb: 'assets/illustrations/atomic_atoms.png',
            previewHtml: `<img src="assets/illustrations/atomic_atoms.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/atomic_atoms.png" alt="아토믹 디자인 - Atoms" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-atomic-molecules',
            name: '[아토믹 02] Molecules',
            title: '02. Molecules (조합 단위 - 검색바, 입력폼, 카드)',
            koName: '02 아토믹 분자 molecules button input searchbar 결합단위 콤보',
            group: 'atomic',
            groupTitle: '🧬 아토믹 디자인 시스템',
            category: 'Illustration',
            width: '126px',
            height: '240px',
            thumb: 'assets/illustrations/atomic_molecules.png',
            previewHtml: `<img src="assets/illustrations/atomic_molecules.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/atomic_molecules.png" alt="아토믹 디자인 - Molecules" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-atomic-organisms',
            name: '[아토믹 03] Organisms',
            title: '03. Organisms (독립 모듈 - GNB 네비게이션, 헤더)',
            koName: '03 아토믹 유기체 organisms card gnb header footer 복합단위 모듈',
            group: 'atomic',
            groupTitle: '🧬 아토믹 디자인 시스템',
            category: 'Illustration',
            width: '160px',
            height: '240px',
            thumb: 'assets/illustrations/atomic_organisms.png',
            previewHtml: `<img src="assets/illustrations/atomic_organisms.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/atomic_organisms.png" alt="아토믹 디자인 - Organisms" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-atomic-layout',
            name: '[아토믹 04] Layout',
            title: '04. Templates & Layout (레이아웃 골격 & 반응형 그리드)',
            koName: '04 아토믹 레이아웃 layout grid templates 구조 뼈대 와이어프레임',
            group: 'atomic',
            groupTitle: '🧬 아토믹 디자인 시스템',
            category: 'Illustration',
            width: '220px',
            height: '240px',
            thumb: 'assets/illustrations/atomic_layout.png',
            previewHtml: `<img src="assets/illustrations/atomic_layout.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/atomic_layout.png" alt="아토믹 디자인 - Layout Grid" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-atomic-pages',
            name: '[아토믹 05] Pages',
            title: '05. Pages (완성형 화면 - 실데이터 바인딩 페이지)',
            koName: '05 아토믹 페이지 pages screens mobile 완성화면 최종산출물 UI',
            group: 'atomic',
            groupTitle: '🧬 아토믹 디자인 시스템',
            category: 'Illustration',
            width: '220px',
            height: '240px',
            thumb: 'assets/illustrations/atomic_pages.png',
            previewHtml: `<img src="assets/illustrations/atomic_pages.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/atomic_pages.png" alt="아토믹 디자인 - Pages" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-atomic-system',
            name: '[아토믹] 구조도',
            title: 'Atomic Design 전체 계층 구조도 (원자➔분자➔유기체➔템플릿➔페이지)',
            koName: '아토믹 디자인 시스템 컴포넌트 패턴 원자 분자 계층 구조도 전체 다이어그램 atomic design system hierarchy',
            group: 'atomic',
            groupTitle: '🧬 아토믹 디자인 시스템',
            category: 'Illustration',
            width: '320px',
            height: '240px',
            thumb: 'assets/illustrations/atomic_system_diagram.png',
            previewHtml: `<img src="assets/illustrations/atomic_system_diagram.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/atomic_system_diagram.png" alt="아토믹 디자인 시스템 5단계 다이어그램" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        },
        {
            id: 'v4-ill-storybook-guide',
            name: '[아토믹] 스토리북',
            title: 'Design System Hub (스토리북 가이드 & 디자인 토큰 워크스페이스)',
            koName: '스토리북 가이드 허브 컴포넌트 라이브러리 워크스페이스 토큰 storybook design tokens workspace',
            group: 'atomic',
            groupTitle: '🧬 아토믹 디자인 시스템',
            category: 'Illustration',
            width: '320px',
            height: '240px',
            thumb: 'assets/illustrations/storybook_guide_workspace.png',
            previewHtml: `<img src="assets/illustrations/storybook_guide_workspace.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">`,
            html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/storybook_guide_workspace.png" alt="스토리북 디자인 시스템 워크스페이스" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
        }
];
