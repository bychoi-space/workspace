# Workspace Editor 일러스트 라이브러리 표준 규칙 및 제작 가이드

본 문서는 워크스페이스 에디터(Workspace Editor) 내 **일러스트 라이브러리(Illustration Library)**의 아키텍처 원칙, 신규 일러스트 제작 시 준수해야 하는 불변 규칙, 그리고 시스템 등록 메타데이터 규격을 정의하는 단일 진실 공급원(SSOT) 가이드입니다.

---

## 🏛️ 1. 일러스트 라이브러리 설계 철학 및 아키텍처

1. **초경량 고해상도 투명 PNG 채택 배경**:
   - 캔버스 내 복잡한 수백 개의 인라인 SVG 패스를 직접 렌더링하면 브라우저 DOM 노드가 급증하고, 드래그/줌/스마트가이드 스냅 연산 시 심각한 프레임 드랍(Lag)이 발생합니다.
   - 이를 극복하기 위해 모든 일러스트는 **최적화된 알파 투명 PNG-24**로 렌더링하여, 캔버스 배경이나 카드 컨테이너의 배경색과 자연스럽게 블렌딩되면서도 60fps의 칼같은 인터랙션 성능을 보장합니다.
2. **에디터 정식 3계층 컴포넌트 구조**:
   - 모든 일러스트는 캔버스 삽입 시 에디터 표준 3계층 DOM 구조를 반드시 준수합니다:
     ```html
     <div class="lf-component" style="position: absolute; width: ...px; height: ...px; ...">
       <div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
         <img src="assets/illustrations/..." alt="..." style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;">
       </div>
       <!-- .lf-drag-handle, .lf-resizer, .lf-delete-trigger 자동 연동 -->
     </div>
     ```
   - 최외곽 `.lf-component` 래퍼에 드래그, Nudge 이동, 크기 조절 점(`.lf-resizer`), `Delete` 삭제, `Ctrl + Z` 실행 취소(Undo), 서식 복사/붙여넣기가 100% 온전히 바인딩됩니다.

---

## 🛡️ 2. 신규 일러스트 제작 시 7대 불변 규칙 (Strict Creation Standards)

새로운 일러스트를 생성하거나 디자인 도구(Figma, Blender, Photoshop 등)에서 익스포트할 때는 다음 7대 규칙을 반드시 지켜야 합니다.

### [규칙 1] 배경 100% 투명화 (Alpha Channel Required)
- **절대 금지**: 일러스트 배경에 흰색(`#ffffff`), 회색(`#f8fafc`), 또는 특정 색상의 사각형 박스가 불투명하게 남아 있어서는 안 됩니다.
- **필수 적용**: 오브젝트 외곽선 외부의 모든 여백은 **100% 알파 투명 채널(Alpha Transparency)**로 처리되어야 합니다.
- **목적**: 다크 모드, 라이트 모드, 저채도 와이어프레임 배경(`#canvas_bg_layer`), 컬러 카드 쉐입 위 어디에 배치하더라도 이질감 없이 융합되어야 합니다.

### [규칙 2] 이미지 내부 텍스트 각인 절대 금지 (No Inset Text)
- **절대 금지**: 이미지 그래픽 파일 내부에 한글/영문 텍스트(예: "상품관리", "Step 1", "CMS", "입장")를 직접 그려 넣거나 래스터화하여 각인하는 행위를 엄격히 금지합니다.
- **이유**: 이미지에 박힌 글자는 사용자가 에디터 캔버스에서 오타를 수정하거나 문구를 변경할 수 없으며, 다국어 지원이나 인스펙터 편집을 불가능하게 만듭니다.
- **표준 가이드**: 모든 텍스트, 단계 번호, 뱃지 라벨은 일러스트 이미지 외부에 **독립된 텍스트 아톰(`.lf-component.v4-text-shape`) 또는 뱃지 쉐입**으로 완전히 분리하여 캔버스에 배치해야 합니다.

### [규칙 3] 표준 규격 및 해상도 준수 (Dimensions & Proportions)
- 일러스트 유형별 기본 규격을 준수하여 제작합니다:
  - **[3D 어드민] 도메인 일러스트**: **`240px × 240px`** (정방형 1:1, 최대 400x400)
  - **[2D 어드민] 플랫 벡터 일러스트**: **`240px × 240px`** (정방형 1:1)
  - **[고객 여정] 쇼핑 프로세스 일러스트**: **`200px × 200px`** (정방형 1:1)
  - **[아토믹] 계층 일러스트 (Atoms ~ Pages)**: 높이 **`240px`** 통일 (가로폭 120px ~ 220px 비율 유지)
  - **[아토믹] 전체 다이어그램 / 스토리북 허브**: **`320px × 240px`** (4:3 비율)

### [규칙 4] 광학적 여백 확보 (Optical Breathing Margin)
- 일러스트 객체가 캔버스 가장자리(Edge)에 딱 붙어 잘리거나 팽창해 보이지 않도록, 사방에 **최소 5% ~ 10%의 투명 패딩(Optical Margin)**을 확보하여 중앙에 배치합니다.
- 객체 리사이징 시 스프라이트나 여백 충돌이 발생하지 않도록 단일 독립 에셋 파일로 제작합니다.

### [규칙 5] 톤앤매너 및 스타일 일관성 (Style Consistency)
- **3D 아이소메트릭**:
  - 시점: 30도 아이소메트릭 또는 3/4 쿼터 뷰 통일.
  - 조명 및 그림자: 부드러운 전면 상단 광원, 바닥면의 은은한 반투명 그림자, 자극적인 원색(네온/형광) 배제, 자연스럽고 신뢰감 있는 엔터프라이즈 파스텔/뉴트럴 톤 유지.
- **2D 플랫 벡터**:
  - 에디터 디자인 시스템의 `1.6px` 테마와 조화를 이루는 모던 슬림 라인아트 및 정돈된 포인트 컬러.

### [규칙 6] 용량 최적화 (Web Performance Optimization)
- 파일 1개당 크기는 **최대 1MB 이하 (권장 200KB ~ 700KB)**로 최적화된 PNG-24 포맷을 사용합니다.
- 불필요한 메타데이터(Exif, ICC 프로파일 등)는 제거하여 에디터 로딩 속도를 극대화합니다.

### [규칙 7] 파일 명명 및 저장 위치 규칙 (File Naming Protocol)
- 모든 일러스트 파일은 반드시 **`assets/illustrations/`** 디렉터리에 저장하며, 아래 명명 표준을 따릅니다:
  - **3D 어드민**: `admin_3d_{domain}.png` (예: `admin_3d_pim.png`, `admin_3d_order.png`)
  - **2D 어드민**: `admin_vector_{domain}.png` (예: `admin_vector_pim.png`)
  - **고객 여정**: `step{N}_{action}_{subject}.png` (예: `step1_enter_ecommerce.png`)
  - **아토믹 디자인**: `atomic_{stage}.png` (예: `atomic_atoms.png`, `atomic_pages.png`)

---

## 📋 3. 일러스트 라이브러리 4대 스타일 그룹 분류 체계

에디터 라이브러리는 일러스트를 시각적 톤앤매너와 사용 목적에 따라 **4대 논리 그룹**으로 연속 정렬하여 렌더링합니다:

```
[LIBRARY] > ILLUSTRATION
  ├── 🏢 Group 1: [3D 어드민] 엔터프라이즈 7대 도메인 (7종)
  │     상품(PIM) ➔ 전시(CMS) ➔ 주문(Order) ➔ 클레임(Claim) ➔ 배송(Logistics) ➔ 회원(Membership) ➔ 프로모션(Promotion)
  ├── 📐 Group 2: [2D 어드민] 플랫 라인 벡터 (3종)
  │     상품(PIM) ➔ 전시(CMS) ➔ 배송(Logistics)
  ├── 🛍️ Group 3: [고객 여정] 이커머스 쇼핑 프로세스 (8종)
  │     01.입장 ➔ 02.둘러보기 ➔ 03.상품선택 ➔ 04.회원가입 ➔ 05.할인혜택 ➔ 06.상품결제 ➔ 07.배송수령 ➔ 08.상품반품
  └── 🧬 Group 4: [아토믹] 디자인 시스템 & 스토리북 (7종)
        01.Atoms ➔ 02.Molecules ➔ 03.Organisms ➔ 04.Layout ➔ 05.Pages ➔ 06.전체 다이어그램 ➔ 07.스토리북 허브
```

---

## ⚙️ 4. 시스템 등록 명세 (`assets/vctrl_component_library.js`)

신규 일러스트를 라이브러리에 등록할 때는 `window.V4_COMPONENT_LIBRARY.illustrations` 배열에 다음 표준 인터페이스 객체를 추가해야 합니다:

```javascript
{
    id: 'v4-ill-{category}-{name}',  // 영문 고유 식별자 (영구 불변)
    name: '[태그] 핵심어',          // 2열 카드(~130px) 말줄임 없는 8~10자 이내 간결 표기명
    title: '[태그] 상세 명칭 및 부제 설명', // 마우스 호버 툴팁 전체 표기
    group: '3d_admin' | '2d_admin' | 'journey' | 'atomic', // 4대 그룹 키
    groupTitle: '🏢 3D 어드민 도메인', // 그룹 섹션 헤더 타이틀
    koName: '동의어 검색 키워드 모음 (국문/영문/약어/업무용어)', // 실시간 하이브리드 검색 지원
    category: 'Illustration',
    width: '240px',
    height: '240px',
    thumb: 'assets/illustrations/{filename}.png',
    previewHtml: `<img src="assets/illustrations/{filename}.png" style="width: 100%; height: 100%; object-fit: contain;">`,
    html: `<div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: auto;"><img src="assets/illustrations/{filename}.png" alt="{상세설명}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;"></div>`
}
```

### 필수 메타데이터 가이드라인:
1. **`name` 규칙**: 
   - 2열 카드에서 `text-overflow: ellipsis`로 글자가 잘리는 것을 막기 위해 하드코딩 일련번호(예: `16.`, `17.`)를 지양하고, **`[3D] 상품관리`**, **`[여정 01] 입장`**, **`[아토믹 01] Atoms`**와 같이 태그+핵심 단어로 작성합니다.
2. **`title` 규칙**:
   - 사용자가 카드를 마우스로 가리켰을 때 상세 기능(예: `[3D] 상품관리 (PIM - LLM 상세 보강 & TPO 키워드 & 사이즈 추천)`)을 즉시 파악할 수 있도록 작성합니다.
3. **`koName` 규칙**:
   - 실무자가 어떤 키워드를 검색하더라도 즉시 노출될 수 있도록 도메인 용어(PIM, CMS, 풀필먼트, VIP, 쿠폰), 스타일 용어(3D, 2D, 아이소메트릭, 벡터, 여정, 아토믹), 국문/영문 동의어를 빠짐없이 등록합니다.
