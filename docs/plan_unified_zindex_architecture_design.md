# 통합 Z-Index 계층 아키텍처 및 정밀 설계 계획서
(Unified Tiered Z-Index Architecture & Interaction Engine Specification)

## 📌 1. 아키텍처 개요 및 설계 목적

현재 시스템은 표준 캔버스(`template_canvas`), 반응형 분할 뷰(`template_responsive_pc_mobile`, `template_responsive_mobile_compare`), 스크롤 관리자(`template_admin_pc_scroll`) 등 다양한 템플릿과 고도화된 기능들(디스크립션 핀, 스크롤 HUD 고정, 복사/붙여넣기, 레이어 정렬 등)을 지원하고 있습니다.

그러나 각 기능들이 개별적으로 발전하면서 다음과 같은 **계층 간 충돌 및 Stacking Context 왜곡 현상**이 발생하고 있습니다:
1. **스크린 파일별 수치 인플레이션**: 특정 스크린에서 수작업 또는 구버전 저장으로 인해 테이블 `9330`, 팝업 `9320`, 체크박스 `11300` 등 비정형 z-index가 혼재.
2. **기능별 z-index 경계 침범**: 일반 컴포넌트 정렬(`Bring to Front`) 시 스크롤 고정 HUD(100,000)를 침범하거나, 스크롤 고정 해제(`Unpinning`) 시 z-index 강등 로직이 불일치.
3. **디스크립션 핀의 계층 불안정**: 반응형 뷰에서 핀이 일반 UI 컴포넌트와 동일한 형제(Sibling)로 삽입되어 특정 컴포넌트 뒤로 가려지는 현상.
4. **오브젝트 복사/붙여넣기 시 계층 재배치 모호성**: 클립보드에서 붙여넣은 요소가 일반 콘텐츠인지 HUD인지에 따른 정밀 티어 할당 부재.

본 계획서는 시스템 내 **모든 z-index를 전수 조사 및 나열**하고, **절대적 8계층(Tier 0 ~ Tier 8) 표준 스펙**을 정의하여 모든 기능(핀, 프레임, 스크롤 고정/해제, 복사/붙여넣기, 레이어 정렬)이 수학적으로 충돌 없이 조화롭게 작동하도록 정밀 설계합니다.

---

## 🔍 2. 시스템 내 전수 조사: 현행 Z-Index 현황 및 문제점

### 2.1 현행 시스템의 주요 Z-Index 출현 현황

| 카테고리 | 대상 요소 / 셀렉터 | 현행 z-index 값 | 비고 / 문제점 |
| :--- | :--- | :--- | :--- |
| **시스템 뷰어 (Parent)** | 로딩 인디케이터, 스플래시 화면 | `999999` | 뷰어 최상단 고정 |
| | 사이드바, 헤더 툴바, 탭 바 | `10000` ~ `10020` | 부모 UI 레벨 Stacking |
| | 부모 플로팅 툴바, 드롭다운 메뉴 | `10005`, `100000` | 로컬 팝업과의 수치 충돌 가능성 |
| | 뷰어 핀 레이어 (`#pins-layer`) | 부모 레벨 오버레이 | 표준 캔버스에서만 독립 레이어로 동작 |
| **템플릿 프레임 (Iframe)** | `.page`, `.frame-column` | 없음 (정적 배치) | 컨테이너 기본값 |
| | `.frame-label-bar` (프레임 헤더 바) | 없음 (Flex 배치) | 내부 input 포커스 시 z-index 부재 |
| | `.pc-browser-frame`, `.mobile-frame` | 없음 / `overflow: hidden` | Stacking Context 생성 주체 |
| | `.pc-content-inner`, `.mobile-content-inner` | 없음 / `min-height` 지정 | 실제 모든 콘텐츠의 루트 컨테이너 |
| | SVG 스마트가이드 캔버스 (`canvas-guide-layer`) | `300000` | 프레임 내부 최상위 가이드 |
| **일반 콘텐츠 컴포넌트** | `.lf-component` (기본값) | `100` ~ `500` | CSS 기본값과 인라인 저장값 불일치 |
| | 스크린 저장 인라인 컴포넌트 | `1000` ~ `11300` | 스크린마다 천차만별 (Compaction 미작동 시 폭증) |
| | `.v4-selectbox-options` (드롭다운) | `10` ~ `1000` | 테이블 내부 배치 시 인접 컴포넌트에 가림 |
| | 그리드 헤더 고정 (`th.v4-grid-cell`) | `10` !important | 테이블 내부 국소 스크롤용 |
| **스크롤 고정 HUD** | `[data-scroll-fixed="top/bottom/custom"]` | `100000` | CSS 클래스 기반 고정값 부여 |
| | 그룹 스크롤 고정 (`.lf-group[data-scroll-fixed]`) | `100000` | |
| | 스크롤 고정 해제 시 | `Math.max(1010, maxNormalZ)` | `80000` 상한선 존재하나 compaction과 연동 미흡 |
| **디스크립션 핀** | `.pin-marker` (기본) | `200000` !important | 반응형 프레임에서 일반 컴포넌트와 형제 배치 |
| | `.pin-marker.selected` / `:hover` | `200005` !important | 선택 시 강조 |
| | `.pin-marker[data-scroll-fixed]` | `200050` !important | 고정 요소 연동 핀 |
| | 핀 삭제 트리거 (`.lf-delete-trigger`) | `330000` | 핀 자체보다 과도하게 높은 수치 부여 |
| **기즈모 & 레이어 연산** | 컴포넌트 삭제 트리거 | `330000` | |
| | 텍스트 박스 선택 아웃라인 | `10001` | 일반 컴포넌트 11300보다 낮아 가려짐 발생 |
| | 커넥터 임시 SVG (`tempSvg`) | `10005` | 고정 요소 뒤로 숨는 현상 발생 |

---

## 🏛️ 3. 통합 8계층 Z-Index 아키텍처 정밀 설계 (SSOT)

모든 오브젝트와 기능이 자신의 역할에 맞는 **절대 영역(Tier)**을 가지며, 어떤 기능도 상위 티어를 침범할 수 없도록 **하드 캡(Hard Boundary)**을 설정합니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Tier 8: 시스템 모달 & 글로벌 오버레이 (500,000 ~ 999,999)              │
│         - 단축키 도움말, 저장/내보내기 모달, 알림 토스트               │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 7: 에디터 캔버스 기즈모 & UI 도구 (300,000 ~ 499,999)             │
│         - 스마트가이드 라인 (300,000), 선택 삭제 트리거 (330,000)     │
│         - 멀티셀렉트 마퀴 박스, 프레임 레이블 바 컨트롤 (350,000)     │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 6: 디스크립션 핀 전용 레이어 (200,000 ~ 299,999)                  │
│         - v4-pin-layer (250,000 Overlay Container)                     │
│         - 고정 핀 (200,050), 호버/선택 핀 (200,005), 일반 핀 (200,000) │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 5: 스크롤 고정 HUD 레이어 (100,000 ~ 199,999)                     │
│         - GNB, Header, Navigation (100,000 ~ 120,000)                  │
│         - Floating Action Button, Custom Fixed Bar (120,000 ~ 150,000) │
│         - Fixed Footer, Tab Bar (150,000 ~ 179,999)                    │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 4: 인-스크린 팝업 & 다이얼로그 (80,000 ~ 99,999)                  │
│         - 화면 내부 생성 팝업 모달, 시스템 확인 다이얼로그             │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 3: 활성 선택 컴포넌트 임시 상승 (70,000 ~ 79,999)                 │
│         - 드래그 중인 컴포넌트, 드롭다운 활성 옵션 메뉴                │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 2: 일반 UI 콘텐츠 컴포넌트 (1,000 ~ 69,999)                       │
│         - 버튼, 입력창, 테이블, 카드, 텍스트, 그룹 등                  │
│         - Bring Forward / Send Backward 조작 영역                      │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 1: 캔버스 배경 & 구조 베이스 (0 ~ 999)                            │
│         - 프레임 브라우저 배경, 워터마크, 베이스 그리드 라인           │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 티어별 상세 스펙 및 규칙 정의

| 티어 (Tier) | 정규 범위 (Range) | 허용 오브젝트 및 셀렉터 | 고정/상승 규칙 | 안전 한계선 (Safety Fence) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1<br>(Background)** | `0 ~ 999` | • 프레임 배경 아트보드<br>• 베이스 캔버스 그리드<br>• 바닥면 락(Lock) 오브젝트 | 기본값 `0`<br>최대 `999` | 일반 콘텐츠(Tier 2) 미만 유지 |
| **Tier 2<br>(Content)** | `1,000 ~ 69,999` | • 일반 `.lf-component`<br>• `.lf-group`<br>• 텍스트, 도형, 표, 폼 요소 | 신규 생성: `maxNormalZ + 10`<br>간격: `10` 단위 | **최대 69,900 제한**.<br>도달 시 `normalizeZIndices` 실행하여 1,000부터 10단위 압축 |
| **Tier 3<br>(Active/Pop)** | `70,000 ~ 79,999` | • 드래그 중인 활성 컴포넌트<br>• `.v4-selectbox-options` (열림)<br>• 컴포넌트 호버 툴팁 | 활성화 시 일시 승격<br>비활성/드롭 시 복귀 | Tier 4(팝업)를 가리지 않음 |
| **Tier 4<br>(Screen Popup)** | `80,000 ~ 99,999` | • 스크린 내 팝업 모달 (`.v4-popup-container`)<br>• 딤드(Dimmed) 백드롭 | 팝업 오픈 시 `80,000`<br>팝업 내 컴포넌트: `80,010+` | 스크롤 HUD(Tier 5) 미만 |
| **Tier 5<br>(Scroll HUD)** | `100,000 ~ 199,999`| • `[data-scroll-fixed="top"]`<br>• `[data-scroll-fixed="bottom"]`<br>• `[data-scroll-fixed="custom/floating"]` | 고정 시: `100,000` 기본<br>HUD 간 정렬: `+10` | **고정 해제(Unpin) 시 즉시 Tier 2 최상위(`maxNormalZ + 10`)로 강등** |
| **Tier 6<br>(Description)** | `200,000 ~ 299,999`| • `.v4-pin-layer` 오버레이: `250,000`<br>• 일반 핀: `200,000`<br>• 선택/호버: `200,005`<br>• 고정 핀: `200,050` | 전용 오버레이 컨테이너 격리<br>절대 최상위 가시성 보장 | 일반 컴포넌트가 어떤 수치라도 핀을 가릴 수 없음 |
| **Tier 7<br>(Editor Gizmos)**| `300,000 ~ 499,999`| • `svg.canvas-guide-layer`: `300,000`<br>• `.lf-delete-trigger`: `330,000`<br>• 마퀴 선택 박스: `350,000`<br>• 프레임 헤더 컨트롤: `350,000` | 에디터 인터랙션 전용<br>`pointer-events` 정밀 제어 | 핀 및 콘텐츠의 조작 핸들 보장 |
| **Tier 8<br>(System Modal)** | `500,000 ~ 999,999`| • 단축키 가이드 모달<br>• 수정 이력 모달, 커버 모달<br>• 로딩 인디케이터, 토스트 | 부모 뷰어 레벨 오버레이 | 캔버스 전체 조작 차단 모달 |

---

## ⚙️ 4. 5대 핵심 기능별 정밀 상호작용 및 전환 메커니즘 설계

### 4.1 [기능 1] 디스크립션 핀 (Description Pins) - 계층 격리 및 라이프사이클

1. **전용 오버레이 컨테이너(`v4-pin-layer`) 신설**:
   - 위치: `.pc-content-inner` 및 `.mobile-content-inner`의 직계 자식으로 단 1개만 생성.
   - CSS:
     ```css
     .v4-pin-layer {
         position: absolute;
         top: 0; left: 0;
         width: 100%; height: 100%;
         pointer-events: none;
         z-index: 250000 !important;
     }
     .v4-pin-layer > .pin-marker,
     .v4-pin-layer > .text-marker {
         pointer-events: auto !important;
     }
     ```
2. **핀 마커 생성 및 주입 규칙**:
   - `spawnResponsiveDualPins` / `importResponsivePins`: 핀을 inner 컨테이너가 아닌 `inner.querySelector('.v4-pin-layer')` 내부에 추가.
   - 핀 자체의 z-index:
     - 기본 상태: `z-index: 200000 !important;`
     - 선택/호버 상태: `z-index: 200005 !important;`
     - 스크롤 고정 상태(`data-scroll-fixed`): `z-index: 200050 !important;`
3. **지능형 초기 스폰 좌표 (Dynamic Viewport Center)**:
   - 고정 하드코딩 `(500, 300)` 폐지.
   - 스크롤 영역(`pc-content-area` 등)의 현재 `scrollTop`을 반영:
     - `defaultTop = Math.round(180 + scrollArea.scrollTop);`
     - `defaultLeft = Math.round((contentWidth - 20) / 2);`
     - 화면 중앙 상단 여백에 자연스럽게 생성되어 테이블/복잡한 폼 중앙 관통 방지.

---

### 4.2 [기능 2] 스크롤 핀 고정 및 해제 (Scroll Pinning & Unpinning)

1. **스크롤 고정 활성화 (HUD 승격: Tier 2 ➔ Tier 5)**:
   - 트리거: `el.setAttribute('data-scroll-fixed', 'top' | 'bottom' | 'custom' | 'floating')`
   - z-index 변환:
     - 기존 Tier 2(`1,000 ~ 69,999`)에서 **Tier 5(`100,000 + HUD_INDEX * 10`)로 승격**.
     - `el.style.zIndex = String(getNextTopZIndex(container, true));`
     - `willChange = 'transform'`, `position: absolute;` 유지.
2. **스크롤 고정 해제 (Unpinning 강등: Tier 5 ➔ Tier 2)**:
   - 트리거: `el.removeAttribute('data-scroll-fixed')`
   - z-index 복귀:
     - HUD 영역(`100,000+`)을 완전히 벗어나 **Tier 2 일반 컴포넌트의 최상단(`maxNormalZ + 10`)으로 안전 강등**.
     - 상한선 안전 캡: `Math.min(69900, maxNormalZ + 10)`
     - transform, transition, willChange 완전 제거.
3. **고정 호스트와 핀의 연동**:
   - 고정된 컴포넌트 위에 핀이 놓일 경우:
     - 핀에 `data-scroll-fixed="viewport"` 및 `data-fixed-host="컴포넌트ID"` 부여.
     - 핀의 z-index는 Tier 6 내의 `200050`으로 유지되어 HUD(`100,000`) 위에서 절대적으로 항상 표시.
   - 호스트 고정 해제 시:
     - 핀의 `data-scroll-fixed`도 자동 해제되고 Tier 6 기본값(`200000`)으로 복귀.

---

### 4.3 [기능 3] 오브젝트 복사 & 붙여넣기 (Clipboard Copy & Paste)

1. **복사 시 메타데이터 캡처**:
   - `copySelectedObjects`:
     - 핀(`pin-marker`, `text-marker`)은 캔버스 오브젝트 클립보드 복사에서 100% 원천 배제 (디스크립션 사이드바 SSOT 준수).
     - 원본 요소의 `isScrollFixed` 여부(`data-scroll-fixed`)를 메타데이터에 기록.
     - 다중 복사 시 컴포넌트 간의 **상대적 z-index 오프셋(`relativeZOrder`)** 보존.
2. **붙여넣기 시 티어별 분기 배치**:
   - **일반 컴포넌트 붙여넣기**:
     - 타겟 호스트의 현재 Tier 2 최대값(`maxNormalZ`)을 계산.
     - `baseZ = Math.min(69000, maxNormalZ + 10);`
     - 복사된 그룹 내 상대 오프셋을 더하여 할당: `v.style.zIndex = String(baseZ + relOffsetZ);`
   - **스크롤 고정 컴포넌트 붙여넣기**:
     - 타겟 호스트의 현재 Tier 5 최대값(`maxFixedZ`)을 계산.
     - `baseZ = Math.max(100000, maxFixedZ + 10);`
     - `v.style.zIndex = String(baseZ + relOffsetZ);`
3. **붙여넣기 후 DOM 정렬**:
   - 복사된 요소는 호스트의 `trailingRef`(스크립트 태그 및 핀 레이어) 직전에 삽입되어 DOM 순서와 z-index 순서가 100% 일치하도록 보장.

---

### 4.4 [기능 4] [앞으로 가져오기] [뒤로 보내기] (Layer Arrangement Operations)

레이어 정렬은 **4대 세부 동작**으로 체계화하며, 각 동작은 소속 티어의 경계를 결코 벗어날 수 없습니다.

```
[Tier 5: 100,000 ~ 199,999 (스크롤 고정 HUD)]
  ▲ Bring to Front (최대 179,900)
  ▼ Send to Back   (최소 100,000)
----------------- [철통 안전 경계 (Safety Barrier)] -----------------
[Tier 2: 1,000 ~ 69,999 (일반 UI 콘텐츠)]
  ▲ Bring to Front (최대 69,900)
  ▲ Bring Forward  (+10)
  ▼ Send Backward  (-10)
  ▼ Send to Back   (최소 1,000)
```

1. **맨 앞으로 가져오기 (`Bring to Front`)**:
   - 일반 컴포넌트: Tier 2 내의 현재 최대값 `maxNormalZ + 10` 부여 (최대 69,900 한계).
   - 스크롤 고정 컴포넌트: Tier 5 내의 현재 최대값 `maxFixedZ + 10` 부여 (최대 179,900 한계).
   - DOM 상에서도 `v4-pin-layer` 및 스크립트 직전으로 `insertBefore` 이동.
2. **한 단계 앞으로 가져오기 (`Bring Forward`)**:
   - 바로 위 z-index를 가진 형제 컴포넌트 탐색.
   - 두 컴포넌트의 `z-index`를 서로 맞바꾸고(Swap), DOM 순서도 상응하게 재배치.
   - 만약 이미 해당 티어의 최상위라면 수치만 `+10` 증가 (상한선 이내).
3. **한 단계 뒤로 보내기 (`Send Backward`)**:
   - 바로 아래 z-index를 가진 형제 컴포넌트 탐색 후 Swap.
   - 만약 이미 최하위(`1,000`)라면 전체 형제 요소의 z-index를 일괄 `+10` 쉬프트하여 음수 하락 방지.
4. **맨 뒤로 보내기 (`Send to Back`)**:
   - 일반 컴포넌트: Tier 2의 최하위(`minNormalZ - 10`)로 배치.
   - 만약 결과값이 `1,000` 미만으로 내려가면, 전체 일반 요소를 양수 보정 쉬프트하여 최소 `1,000` 보장.
   - 배경/컨테이너 직후, 일반 요소의 첫 번째 위치로 DOM `insertBefore`.

---

### 4.5 [기능 5] 템플릿 프레임 및 반응형 뷰포트 (Template Frames & Viewports)

1. **프레임 구조와 컨테이너 무결성**:
   - `.pc-browser-frame`, `.mobile-frame`:
     - 자체적으로 `overflow: hidden;`을 가지며 내부 스크롤 영역(`pc-content-area`)을 격리.
     - 프레임 헤더 바(`.frame-label-bar`): Tier 7(`350,000`)으로 명시하여, 캔버스 스크롤이나 긴 화면에서도 높이 조절 input과 타이틀이 컴포넌트에 가려지지 않음.
2. **모바일 전용 프레임 스위처 및 Zen Mode**:
   - `v4-frame-switcher`: Tier 7(`350,000`) 유지.
   - 모바일 풀스크린 프레젠테이션 진입 시 툴바 및 펜 오버레이의 Stacking Context 무결성 유지.

---

## 🛠️ 5. 파일별 상세 수정 계획 (Target Files & Action Items)

| 순번 | 수정 대상 파일 | 주요 변경 내용 및 구현 계획 |
| :---: | :--- | :--- |
| **1** | [assets/vctrl_iframe_layering.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_layering.js) | • `V4_Z_TIERS` 정밀 재정의 (Tier 1~8 상수 체계 반영)<br>• `normalizeZIndices`: Tier 2 상한선 69,900 도달 시 1,000~69,900으로 자동 압축<br>• `handleBringFront`: Tier 2/5 경계 하드 캡 적용, HUD 승격 조건 명확화<br>• `handleSendBack`: Tier 2 최소값 1,000 보장 쉬프트 메커니즘 보강<br>• 신규 `handleBringForward`, `handleSendBackward` 함수 구현 |
| **2** | [assets/vctrl_responsive_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_responsive_pins.js) | • `.v4-pin-layer` 전용 오버레이 컨테이너 생성 및 자동 보증 함수(`ensurePinLayer`) 도입<br>• `spawnResponsiveDualPins` / `importResponsivePins`: 핀을 `.v4-pin-layer` 내부에만 주입<br>• 핀 이동 및 재정렬 시 오버레이 컨테이너 내부 좌표계 유지 |
| **3** | [assets/vctrl_annotation_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_annotation_pins.js) | • PC 반응형 핀 초기 스폰 좌표 `{ x: 500, y: 300 }` 하드코딩 제거<br>• 현재 프레임의 `scrollTop` 및 가로 폭 기반 **동적 안전 뷰포트 중심 좌표 계산 로직** 적용 |
| **4** | [assets/vctrl_iframe_scroll_pin.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_scroll_pin.js) | • `removeScrollFixed` (고정 해제 시): Tier 5에서 Tier 2 최상위(`Math.min(69900, maxNormalZ + 10)`)로 안전 강등 로직 정합성 일치<br>• 고정 활성화 시 `getNextTopZIndex(container, true)` 호출로 Tier 5 진입 보장 |
| **5** | [assets/vctrl_clipboard_objects.js](file:///c:/Users/sisun/ai_work/assets/vctrl_clipboard_objects.js) | • `getHostTopZ`를 `V4_Z_TIERS` 스펙에 맞게 정밀 분기<br>• 일반 컴포넌트: Tier 2(`maxNormalZ + 10`, 최대 69,900 캡)<br>• 스크롤 고정 컴포넌트: Tier 5(`maxFixedZ + 10`, 100,000+)<br>• 붙여넣기 DOM 삽입 시 `.v4-pin-layer` 직전에 배치 보장 |
| **6** | [assets/vctrl_shortcuts.js](file:///c:/Users/sisun/ai_work/assets/vctrl_shortcuts.js) | • 레이어 단축키 핸들러 확장: 맨 앞으로(`Ctrl+]`), 맨 뒤로(`Ctrl+[`), 한 단계 앞으로(`Ctrl+Shift+]`), 한 단계 뒤로(`Ctrl+Shift+[`) 메시지 발송 지원 |
| **7** | [assets/vctrl_iframe_styles.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_styles.js)<br>[assets/responsive_frame.css](file:///c:/Users/sisun/ai_work/assets/responsive_frame.css)<br>[assets/responsive_frame.js](file:///c:/Users/sisun/ai_work/assets/responsive_frame.js) | • `.v4-pin-layer` CSS 클래스 선언 (`z-index: 250000 !important; pointer-events: none;`)<br>• `.lf-component[data-scroll-fixed]` 규칙과 Tier 5 연동<br>• `.frame-label-bar` 및 가이드 레이어 z-index 명문화 |
| **8** | [viewer.html](file:///c:/Users/sisun/ai_work/viewer.html) | • 엔진 스크립트 및 프레임 CSS 버전 쿼리스트링 갱신 (`?v=V401_UNIFIED_ZINDEX_ENGINE`) |

---

## 🧪 6. 검증 계획 및 시나리오

1. **정적 무결성 검증 (Mandatory Gateways)**:
   - `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1`
   - 전체 60여 개 파일의 브래킷 밸런스 0 에러
   - 27개 iframe 인라인 엔진 스크립트의 Node VM 컴파일 100% 통과
   - 백틱(`` ` ``) 충돌 전수 검사 통과
2. **시나리오 1: 09_Admin_PC_Scroll_632.html 디스크립션 핀 검증**:
   - `피킹리스트 조회 및 생성` 팝업 및 검색 조건 테이블(`v4-comp-1791427509333`) 위에서 핀 생성
   - 핀이 테이블 정중앙에 갇히지 않고 안전 영역에 생성되는지 확인
   - 테이블 경계(`y = 402px`)를 넘나들며 드래그할 때 핀이 절대 테이블 뒤로 잘리거나 가려지지 않는지 확인
3. **시나리오 2: 스크롤 고정 및 해제 검증**:
   - 임의의 컴포넌트에 스크롤 고정(`top`, `custom`, `bottom`) 적용 시 `z-index: 100000+`로 승격 확인
   - 스크롤 고정 해제 시 `z-index`가 `1,000 ~ 69,999` 범위의 콘텐츠 최상위로 깔끔하게 강등되는지 확인
   - 고정 컴포넌트 위에 핀을 올렸을 때 핀이 고정 컴포넌트보다 항상 위에 위치하는지 확인
4. **시나리오 3: 복사 & 붙여넣기 및 레이어 정렬 검증**:
   - 일반 컴포넌트 복사/붙여넣기 시 기존 요소 위에 얹혀지되 HUD나 핀을 넘지 않는지 확인
   - 앞으로 가져오기(`Bring to Front`) 반복 시 69,900 초과 시 자동 압축(Compaction) 작동 확인
   - 뒤로 보내기(`Send to Back`) 시 음수값 발생 없이 1,000 최하위로 안착하는지 확인
