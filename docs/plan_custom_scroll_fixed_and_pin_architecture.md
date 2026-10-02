# [상세 계획서] 오브젝트 [자유 플로팅·임계치 스티키] 및 디스크립션 핀 [일반·핀 고정] 4대 고정 기능 통합 아키텍처 설계서

---

## 📌 1. Executive Summary (개요 및 목적)

본 문서는 Workspace Editor의 반응형 화면(모바일/PC 스크롤 프레임)에서 동작하는 고정(Fixed/Sticky) 엔진을 근본적으로 확장하여, 
기존의 상단(Top)·하단(Bottom) 단순 2지선다 방식을 탈피하고 **오브젝트 2종 + 디스크립션 핀 2종 (총 4대 고정 기능)**을 시스템 전반에 걸쳐 완전하고 결함 없이(Zero-Defect) 구현하기 위한 마스터 아키텍처 계획서입니다.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      4대 고정 기능 통합 매트릭스 (4 Core Matrix)                   │
├───────────────────┬──────────────────────────────────┬──────────────────────────┤
│ 대상 분류         │ 모드 (Mode)                      │ 핵심 동작 및 사용자 가치  │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 1. UI 오브젝트    │ [자유 플로팅] (Custom Floating)  │ 사용자가 배치한 뷰포트   │
│    (컴포넌트/그룹)│                                  │ 상대 위치에 상시 플로팅  │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 2. UI 오브젝트    │ [임계치 스티키] (Threshold Sticky)│ 본문 스크롤 도중 지정    │
│    (컴포넌트/그룹)│                                  │ 높이에 걸리면 고정 (CSS) │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 3. 디스크립션 핀  │ [본문 배치] (Content Scroll)     │ 본문 특정 영역에 배치되어 │
│    (번호 마커 ①)  │                                  │ 스크롤 시 함께 이동      │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 4. 디스크립션 핀  │ [화면 핀 고정] (Viewport Fixed 📌)│ 스크롤과 무관하게 화면    │
│    (번호 마커 ①)  │                                  │ 지정 위치에 영구 고정    │
└───────────────────┴──────────────────────────────────┴──────────────────────────┘
```

본 계획서는 `AGENTS.md`의 **7대 필수 게이트웨이**(운영 무결성, 사이드이펙트 0건, 스크립트 에러 0건, 백틱 충돌 0건, 정적 구문 검증, CORS 방어)를 100% 준수하며, Undo/Redo 엔진, ScreenSanitizer, 드래그/리사이즈, Z-Index 4대 티어와 완벽하게 통합되도록 설계되었습니다.

---

## 🔍 2. 4대 신규 기능 요구사항 정밀 정의 (Specification)

### 2.1 [기능 1] 오브젝트 - 자유 플로팅 (Custom Floating HUD)
- **개념**: 
  - 모바일 우측 하단 플로팅 챗봇/FAB 버튼, 화면 중앙 우측 퀵메뉴, 하단 탭바 위 60px에 떠 있는 구매 CTA 등.
  - 상단 0px이나 맨 바닥으로 강제 스냅되지 않고, **디자이너가 캔버스 위에 마우스로 드래그해서 배치한 바로 그 뷰포트 상대 위치에 상시 고정**되어 스크롤 내내 떠 있는 기능.
- **동작 사양**:
  - 인스펙터에서 [자유 플로팅] 클릭 시, 현재 요소가 프레임 뷰포트 상에서 위치한 $Y$ 좌표를 자동 캡처하여 `data-scroll-target-y` 속성으로 영구 저장.
  - 스크롤 발생 시 컨테이너의 `scrollTop` 증가량에 맞춰 요소의 뷰포트 좌표를 정확히 유지.

### 2.2 [기능 2] 오브젝트 - 임계치 스티키 (Threshold Sticky HUD)
- **개념**: 
  - 상세페이지 본문 중간(예: 800px 지점)에 배치된 `[상품상세 | 리뷰 | 문의 | 배송]` 탭바 또는 필터/정렬바.
  - 초기 로드 및 상단 스크롤 중에는 본문과 함께 자연스럽게 위로 올라가다가, **화면 상단(또는 상단 헤더 바로 아래 임계선)에 닿는 순간부터 그 자리에 딱 걸려(Sticky) 고정**되는 기능.
- **동작 사양**:
  - 스크롤 $Y$가 임계 도달 거리보다 작을 때는 본문과 1:1 이동 ($\Delta Y = 0$).
  - 스크롤 $Y$가 임계 도달 거리를 초과하는 순간부터 초과분만큼만 $\Delta Y$를 실시간으로 밀어주어 완벽한 CSS `position: sticky` 동작 구현.

### 2.3 [기능 3] 디스크립션 핀 - 본문 배치 (Content-Anchored Scroll Pin)
- **개념**: 
  - 본문 상세 영역(예: 5번째 상품 카드, 주문서 배송지 입력 폼, 상세 설명 표 등)을 설명하기 위한 번호 마커(①, ②, ③).
  - 스크롤을 내리면 해당 컴포넌트와 함께 위로 자연스럽게 스크롤되어 올라감.
- **동작 사양**:
  - `data-scroll-fixed="none"` 또는 속성 제거 상태.
  - 본문 절대 좌표계에 완벽히 앵커링되며 GPU 변위(`transform`)가 부여되지 않음 ($\Delta Y = 0$).

### 2.4 [기능 4] 디스크립션 핀 - 화면 핀 고정 (Viewport-Fixed Pin 📌)
- **개념**: 
  - 상단 GNB, 고정 헤더, 플로팅 챗봇 버튼을 설명하거나, **"화면 전체 공통 정책 안내"**를 위해 뷰포트 상의 특정 위치에 박아두는 번호 마커(①, ②, ③).
  - 바닥에 깔린 컴포넌트가 고정 객체이든 일반 객체이든 상관없이, 기획자가 명시적으로 핀을 **"화면 뷰포트에 영구 고정"**시킬 수 있는 기능.
- **동작 사양**:
  - 핀에 `data-scroll-fixed="viewport"` 속성 부여.
  - 스크롤을 아무리 내려도 뷰포트 상단/좌측으로부터의 상대 좌표를 유지하여 화면에 항상 노출.
  - Z-Index Tier 3 (`200,050 !important`) 최상위 보장.
  - 캔버스 뱃지 우측 상단에 작은 미니 핀(`📌`) 아이콘이 표기되어 시각적으로 직관적 식별 가능.
  - 사이드바 설명 리스트 카드 제목에 `[고정 📌]` 뱃지 표기.

---

## 🧮 3. 수학적 계산 모델 및 물리 엔진 (Mathematical Physics Engine)

반응형 캔버스(`pc-content-inner`, `mobile-content-inner`)는 논리 절대좌표(`domTop`)를 가지며, 
부모 스크롤 컨테이너(`.pc-content-area`, `.mobile-content`)는 현재 스크롤 위치 `scrollTop`을 가집니다.

스크롤 시 요소의 시각적 뷰포트 위치($Y_{\text{visual}}$)는 다음과 같습니다:
$$Y_{\text{visual}} = \text{domTop} + \Delta Y - \text{scrollTop}$$

따라서 원하는 목표 뷰포트 위치($Y_{\text{target}}$)에 요소를 고정하기 위한 변위 $\Delta Y$의 산출 공식은 다음과 같습니다:

$$\Delta Y = \text{scrollTop} + (Y_{\text{target}} - \text{domTop})$$

### 3.1 4대 모드별 정밀 변위 공식 유도

#### 1) 자유 플로팅 (`mode === 'custom'` 또는 `'floating'`)
- $Y_{\text{target}} = \text{parseFloat(el.getAttribute('data-scroll-target-y'))} \ || \ \text{domTop}$
- 변위:
  $$\Delta Y = \text{scrollTop} + (Y_{\text{target}} - \text{domTop})$$
  *(참고: $Y_{\text{target}} = \text{domTop}$인 경우 $\Delta Y = \text{scrollTop}$으로 단순화되어 완벽한 뷰포트 상대 고정 달성)*

#### 2) 임계치 스티키 (`mode === 'sticky'`)
- $Y_{\text{stickyOffset}} = \text{parseFloat(el.getAttribute('data-scroll-sticky-top'))} \ || \ 0$ (예: 상단 GNB 60px 아래)
- 고정 개시 스크롤 임계치:
  $$\text{threshold} = \max(0, \text{domTop} - Y_{\text{stickyOffset}})$$
- 변위:
  $$\Delta Y = \begin{cases} 0 & (\text{scrollTop} \le \text{threshold}) \\ \text{scrollTop} - \text{threshold} & (\text{scrollTop} > \text{threshold}) \end{cases}$$

#### 3) 디스크립션 핀 - 화면 핀 고정 (`mode === 'viewport'`)
- 핀의 뷰포트 목표 위치: $Y_{\text{targetPin}} = \text{domTop}$ (생성/배치된 뷰포트 위치)
- 변위:
  $$\Delta Y_{\text{pin}} = \text{scrollTop}$$
  *(단, 호스트 컴포넌트 추종 핀(`data-fixed-host`)의 경우 기존처럼 호스트의 `transform`을 100% 미러링)*

#### 4) 디스크립션 핀 - 본문 일반 핀 (`mode === 'none'`)
- 변위:
  $$\Delta Y = 0 \quad (\text{transform 스타일 완전 제거})$$

---

## 🏷️ 4. 데이터 스키마 & DOM 속성 설계 (Data Schema)

기존 시스템과의 100% 하위 호환성을 위해 `data-scroll-fixed` 속성을 단일 진실 공급원(SSOT)으로 사용합니다.

```html
<!-- [Case 1] 오브젝트 - 자유 플로팅 -->
<div class="lf-component" id="comp-fab-chat"
     data-scroll-fixed="custom"
     data-scroll-target-y="380"
     style="position: absolute; left: 290px; top: 380px; z-index: 100010;">
  ...
</div>

<!-- [Case 2] 오브젝트 - 임계치 스티키 -->
<div class="lf-component lf-group" id="group-tab-bar"
     data-scroll-fixed="sticky"
     data-scroll-sticky-top="50"
     style="position: absolute; left: 0px; top: 780px; z-index: 100020;">
  ...
</div>

<!-- [Case 3] 디스크립션 핀 - 본문 배치 (일반) -->
<div class="lf-component pin-marker" id="v4-pin-mobile-1"
     data-frame="mobile" data-index="1"
     style="position: absolute; left: 140px; top: 920px; z-index: 200000;">
  <div class="pin-number-badge">2</div>
</div>

<!-- [Case 4] 디스크립션 핀 - 화면 핀 고정 (뷰포트) -->
<div class="lf-component pin-marker" id="v4-pin-mobile-2"
     data-frame="mobile" data-index="2"
     data-scroll-fixed="viewport"
     style="position: absolute; left: 310px; top: 80px; z-index: 200050 !important;">
  <div class="pin-number-badge">3</div>
  <svg class="pin-fixed-indicator" viewBox="0 0 24 24">...</svg>
</div>
```

---

## 🎨 5. UI/UX 및 인터랙션 설계

### 5.1 인스펙터 패널의 다형성 분기 (Polymorphic Inspector UI)
선택된 대상이 **일반 컴포넌트/그룹**인가, **디스크립션 핀**인가에 따라 `#selection-scroll-pin-bar` 내부가 지능적으로 전환됩니다:

```
[UI 1: 일반 컴포넌트 / 그룹 선택 시]
┌─────────────────────────────────────────────────────────────┐
│ 📌 SCROLL PIN (스크롤 고정)                      [ FLOATING ]│
├────────────┬────────────┬────────────┬───────────┬──────────┤
│   [일반]   │   [상단]   │   [하단]   │ [자유위치]│ [스티키] │
│   Scroll   │    Top     │   Bottom   │  Floating │  Sticky  │
└────────────┴────────────┴────────────┴───────────┴──────────┘
  * 자유위치/스티키 선택 시:
    └ 뷰포트 오프셋: [ 380 ] px

[UI 2: 디스크립션 핀(번호 마커) 선택 시]
┌─────────────────────────────────────────────────────────────┐
│ 📌 PIN ANCHOR (핀 고정 모드)                     [ FIXED 📌 ]│
├─────────────────────────────┬───────────────────────────────┤
│       [ 본문 배치 (일반) ]  │       [ 화면 핀 고정 📌 ]     │
│       스크롤 시 함께 이동    │       화면에 항상 떠 있음     │
└─────────────────────────────┴───────────────────────────────┘
```

### 5.2 캔버스 및 사이드바 시각적 피드백
1. **캔버스 핀 뱃지**: `data-scroll-fixed="viewport"` 핀은 번호 뱃지 우측 상단에 미니 핀 아이콘(`📌`) 또는 시안색(Cyan) 발광 링 표기.
2. **사이드바 설명 카드**: 카드 우측 상단 번호 옆에 `[화면고정 📌]` 뱃지 인라인 노출.

---

## 🛠️ 6. 변경 대상 소스 파일 전수 목록 및 상세 수정 계획

```
┌──────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ 파일 경로                            │ 수정 목적 및 상세 내용                                 │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. viewer.html                       │ • #selection-scroll-pin-bar 구조 확장                   │
│                                      │ • 컴포넌트용 5버튼 + 핀용 2버튼 세그먼트 마크업 추가    │
│                                      │ • 오프셋 조절 인풋(#scroll-pin-offset-input) 신설       │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. assets/viewer.css                 │ • 신규 5세그먼트 그리드 및 핀 전용 2단 토글 스타일링    │
│                                      │ • 핀 마커 미니 고정 아이콘(.pin-fixed-indicator) 스타일│
│                                      │ • 사이드바 고정 뱃지(.desc-pin-fixed-badge) 스타일링   │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. assets/vctrl_inspector.js         │ • _syncScrollPinUI: 핀 vs 일반 컴포넌트 분기 처리       │
│                                      │ • _setScrollPin: 'custom', 'sticky', 'viewport' 페이로드│
│                                      │ • 현재 뷰포트 좌표 자동 캡처 및 오프셋 입력 연동       │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. assets/vctrl_iframe_scroll_pin.js │ • ScrollPinEngine.updatePins: 4대 모드 수식 전면 구현  │
│                                      │ • LF_SET_SCROLL_FIXED: 신규 모드 속성 및 z-index 처리  │
│                                      │ • 백틱 충돌 0건(Gateway 5) 및 단일 쿼리 실시간 처리    │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5. assets/vctrl_iframe_drag.js       │ • 고정 객체/핀 드래그 시작 시 scrollTop 보정 연산     │
│                                      │ • 드롭 시 data-scroll-target-y 최신화                  │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 6. assets/vctrl_responsive_pins.js   │ • 핀 재정렬(reorderAllPins) 시 viewport 속성 보존      │
│                                      │ • 핀 렌더링 시 미니 고정 아이콘 DOM 주입              │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 7. assets/vctrl_annotation_pins.js   │ • 사이드바 설명 리스트 렌더링 시 [화면고정 📌] 뱃지    │
│                                      │ • 메타데이터 동기화 및 핀 상태 복원                    │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 8. assets/vctrl_common.js            │ • ScreenSanitizer.cleanDOM에서 신규 속성 보존 검증     │
│                                      │ • 런타임 transform/will-change만 깨끗이 정제           │
└──────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 🛡️ 7. 7대 필수 게이트웨이 및 사이드이펙트 방어 검증 계획

1. **운영 시스템 무결성 (Gateway 1)**:
   - 기존의 모든 스크린 HTML(`data/p_xxxx/*.html`)에 존재하는 기존 `top`, `bottom`, `none` 속성은 100% 호환되며 1px의 레이아웃 오차도 발생하지 않음.
2. **사전 정밀 분석 & 계획 수립 (Gateway 2)**:
   - 본 계획서 완성을 통해 사전 설계 완료 후 작업 착수.
3. **사이드이펙트 원천 차단 (Gateway 3)**:
   - Undo/Redo: DOM 노드 이동(Reparenting) 없이 순수 GPU 변위(`transform`)만 제어하므로 `V4UndoManager` 완벽 호환.
   - SmartGuide / Multiselect: `dragging-now` 플래그 동안 transform 갱신을 멈추어 가이드 충돌 차단.
4. **스크립트/런타임 에러 0건 (Gateway 4)**:
   - `isNaN`, 옵셔널 체이닝(`?.`), `el.isConnected` 가드를 통해 고아 노드 접근 에러 100% 차단.
5. **백틱 충돌 에러 0건 (Gateway 5)**:
   - `assets/vctrl_iframe_scroll_pin.js` 및 `vctrl_responsive_pins.js` 내부에서 템플릿 리터럴(`` ` ``) 및 `${...}` 사용 전면 금지 (문자열 `+` 연산자만 사용).
6. **구문/브래킷 에러 0건 및 자동 정적 검증 강제 (Gateway 6)**:
   - 작업 완료 후 `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1` 실행하여 0 Errors 통과 확인 필수.
7. **CORS 에러 0건 및 통신 프로토콜 준수 (Gateway 7)**:
   - 부모-Iframe 통신은 오직 `window.EditorBus` 및 `window.MessageHub`만을 경유.

---

## 🚀 8. 단계별 구현 로드맵 (Step-by-Step Roadmap)

- [ ] **Phase 1: Iframe 고정 물리 엔진 구현 ([assets/vctrl_iframe_scroll_pin.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_scroll_pin.js))**
  - `updatePins()` 함수에 4대 모드(custom, sticky, viewport, host-pinned) 수식 통합.
  - `LF_SET_SCROLL_FIXED` 핸들러에 `custom`, `sticky`, `viewport` 디스패처 분기 추가.
- [ ] **Phase 2: 인스펙터 UI 및 스타일 구현 ([viewer.html](file:///c:/Users/sisun/ai_work/viewer.html), [assets/viewer.css](file:///c:/Users/sisun/ai_work/assets/viewer.css))**
  - `#selection-scroll-pin-bar` 내 오브젝트용 5버튼 + 핀 전용 2버튼 세그먼트 마크업 추가.
  - 모던 다크/글래스모피즘 기반 프리미엄 UI 스타일링.
- [ ] **Phase 3: 인스펙터 컨트롤러 로직 구현 ([assets/vctrl_inspector.js](file:///c:/Users/sisun/ai_work/assets/vctrl_inspector.js))**
  - `_syncScrollPinUI()`에서 핀과 일반 컴포넌트를 분기하여 알맞은 컨트롤 바 렌더링.
  - 클릭 이벤트 리스너 바인딩 및 iframe 양방향 동기화.
- [ ] **Phase 4: 디스크립션 핀 및 사이드바 연계 ([assets/vctrl_responsive_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_responsive_pins.js), [assets/vctrl_annotation_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_annotation_pins.js))**
  - 고정 핀에 미니 핀(`📌`) 아이콘 렌더링.
  - 사이드바 설명 카드 목록에 `[화면고정 📌]` 뱃지 동기화.
- [ ] **Phase 5: 드래그 보정 및 최종 검증 ([assets/vctrl_iframe_drag.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_drag.js))**
  - 고정 객체/핀 드래그 시 좌표 튀김 방지 보정.
  - `scripts/check_syntax.ps1` 정적 구문 검증 100% 통과 확인.
