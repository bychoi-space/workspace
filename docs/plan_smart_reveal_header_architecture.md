# [마스터 계획서] 스크롤 방향 감지 스마트 헤더 (Scroll-Up Reveal Header) 통합 아키텍처 설계서

---

## 📌 1. Executive Summary (개요 및 목적)

본 문서는 Workspace Editor의 스크롤 고정 시스템에 **스크롤 방향(Direction)과 의도(Intent)를 실시간 감지하여 동작하는 "스마트 헤더 (Scroll-Up Reveal Header / Auto-Hide Header)"** 기능을 추가하기 위한 종합 시스템 설계서입니다.

현대 모바일 및 웹 서비스(토스, 미디엄, 네이버, 인스타그램, Safari 등)에서 가장 널리 사용되는 이 기능은:
- **본문 읽기 시(Scroll Down)**: 헤더가 상단 바깥으로 부드럽게 퇴장하여 화면 가림 없이 본문 읽기 몰입감을 극대화하고,
- **탐색 의도 시(Scroll Up)**: 스크롤을 살짝만 올려도 헤더가 부드럽게 슬라이드 다운되어 메뉴 이동 및 내비게이션을 즉시 제공합니다.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   스크롤 고정 모드 전체 매트릭스 (Expanded Scroll Pin Matrix)         │
├──────────────────┬──────────────┬────────────────────────┬───────────────────────┤
│ 분류             │ 모드 (Mode)   │ 고정 방식              │ 주요 활용 사례        │
├──────────────────┼──────────────┼────────────────────────┼───────────────────────┤
│ UI 오브젝트      │ none (일반)  │ 본문 스크롤 추종       │ 일반 카드, 텍스트     │
│                  │ top (상단)   │ 뷰포트 최상단 영구고정 │ 표준 고정 GNB         │
│                  │ bottom (하단)│ 뷰포트 최하단 영구고정 │ 바텀 내비게이션 탭    │
│                  │ custom(플로팅)│ 지정 뷰포트 Y 상대고정 │ 우하단 챗봇/FAB       │
│                  │ sticky(스티키)│ 임계치 도달 후 고정    │ 본문 서브탭/필터바    │
│                  │ ★smart(스마트)│ 스크롤 다운 퇴장/업 복귀│ 스마트 모바일 헤더   │
├──────────────────┼──────────────┼────────────────────────┼───────────────────────┤
│ 디스크립션 핀    │ none (본문)  │ 본문 절대좌표 추종     │ 본문 요소 가이드 핀   │
│                  │ viewport(고정)│ 화면 지정위치 영구고정 │ 화면 기준 가이드 핀   │
└──────────────────┴──────────────┴────────────────────────┴───────────────────────┘
```

본 계획서는 `AGENTS.md`의 **7대 필수 게이트웨이**(운영 무결성, 사이드이펙트 0건, 스크립트 에러 0건, 백틱 충돌 0건, 정적 구문 검증, CORS 방어)를 100% 준수하며, 기존의 `top`, `bottom`, `custom`, `sticky`, `pin` 기능과의 상호 간섭 없이 완벽한 독립 확장으로 설계되었습니다.

---

## 🔍 2. 핵심 동작 및 인터랙션 상세 명세 (Interaction Specification)

### 2.1 3단계 상태 머신 (3-State Machine)

스마트 헤더는 스크롤 컨테이너의 위치와 델타($\Delta$)를 기반으로 3가지 상태를 엄격하게 순환합니다.

```
                  ┌────────────────────────────────────────┐
                  │          State 1: AT_TOP (최상단)       │
                  │       (scrollTop <= 30px, 100% 노출)   │
                  └───────────────┬────────────────────────┘
                                  │
                   scrollTop > 60px & deltaY > 12px
                                  │
                                  ▼
                  ┌────────────────────────────────────────┐
                  │       State 2: SCROLL_DOWN (숨김)      │
                  │  (헤더가 화면 상단 바깥으로 슬라이드 퇴장)  │
                  └───────────────┬────────────────────────┘
                                  ▲
                         deltaY < -10px (스크롤 업)
                                  │
                                  ▼
                  ┌────────────────────────────────────────┐
                  │       State 3: SCROLL_UP (복귀 노출)    │
                  │   (헤더가 뷰포트 상단으로 슬라이드 인)   │
                  └────────────────────────────────────────┘
```

1. **State 1: 최상단 안전 구역 (Top Safe Zone)**
   - **조건**: `scrollTop <= 30px`
   - **동작**: 스크롤 방향과 무관하게 헤더가 원래 DOM 위치(`top: 0` 등)에 100% 표시됩니다.
   - **수학**: $\Delta Y = \text{scrollTop}$ (또는 $0$), 트랜지션 완료.

2. **State 2: 스크롤 다운 퇴장 (Reading Mode - Auto Hide)**
   - **조건**: `scrollTop > 60px` 이고, 아래 방향으로 연속 `12px` 이상 스크롤되었을 때
   - **동작**: 헤더가 뷰포트 상단 바깥으로 부드럽게 퇴장합니다.
   - **수학**: $\Delta Y = \text{scrollTop} - (\text{domTop} + \text{headerHeight})$
   - **시각적 결과**: 뷰포트 상단 좌표가 $-\text{headerHeight}$가 되어 시야에서 완전히 사라집니다.

3. **State 3: 스크롤 업 복귀 (Navigation Intent - Auto Reveal)**
   - **조건**: 위 방향으로 연속 `10px` 이상 스크롤되었을 때
   - **동작**: 사용자의 탐색/내비게이션 의도를 감지하여 헤더가 즉시 뷰포트 최상단에 슬라이드 인하여 고정됩니다.
   - **수학**: $\Delta Y = \text{scrollTop} - \text{domTop}$
   - **시각적 결과**: 뷰포트 상단 좌표가 $0\text{px}$로 복귀하여 최상단에 착 달라붙습니다.

### 2.2 미세 진동 및 휠 지터 방지 (Jitter Tolerance Guard)
- 마우스 휠이나 터치패드의 미세한 손떨림(1~2px 왕복)으로 헤더가 깜빡거리는 현상을 원천 방지하기 위해 **방향 역치(Threshold Accumulator)**를 둡니다.
- 다운 방향: 누적 `+12px` 이상일 때만 상태를 `hidden`으로 전이.
- 업 방향: 누적 `-10px` 이상일 때만 상태를 `revealed`로 전이.

### 2.3 에디터 캔버스 마우스 드래그 가드 (Zero Drag Interference)
- 사용자가 에디터 캔버스에서 해당 헤더 요소를 마우스로 드래그/리사이즈하고 있을 때(`.dragging-now`):
  - 트랜지션 애니메이션을 즉시 제거(`transition: none`)하여 드래그 핸들과의 마우스 1:1 반응성을 완벽하게 유지합니다.
  - 드래그 완료 후 마우스를 뗄 때 자연스러운 위치로 재정렬합니다.

---

## 🎨 3. 인스펙터 UI 설계 및 레이아웃 (Inspector Layout)

### 3.1 3x2 대칭 버튼 그리드 레이아웃
현재 우측 인스펙터의 오브젝트 스크롤 핀 버튼 바(Row 1: 3개, Row 2: 2개)의 Row 2에 `[스마트]` 버튼을 추가하여 **완벽한 3x2 대칭 그리드**를 완성합니다.

```
┌────────────────────────────────────────────────────────┐
│ SCROLL PIN                                  [상태 뱃지]│
├────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │  ↕️ 일반     │ │  ⬆️ 상단     │ │  ⬇️ 하단         │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │  🎯 플로팅   │ │  📌 스티키   │ │  ⚡ 스마트 (NEW) │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **Row 1**:
  - `[일반]` (`data-pin="none"`) - Default Slate
  - `[상단]` (`data-pin="top"`) - Cyan (`#06b6d4`)
  - `[하단]` (`data-pin="bottom"`) - Purple (`#a855f7`)
- **Row 2**:
  - `[플로팅]` (`data-pin="custom"`) - Amber (`#f59e0b`)
  - `[스티키]` (`data-pin="sticky"`) - Emerald (`#10b981`)
  - **`[스마트]`** (`data-pin="smart"`) - **Indigo/Electric Blue (`#6366f1`)**
    - **아이콘**: SVG 스마트 모션 아이콘 (위/아래 방향 화살표 + 센서 라인)
    - **툴팁**: "스마트 헤더 (스크롤 내릴 때 숨김, 올릴 때 나타남)"
    - **상태 뱃지**: `SMART HEADER ⚡` (`.badge-smart`)

---

## 🧩 4. 디스크립션 핀 및 다단 고정과의 연동 (Pin & Tier Cascade)

### 4.1 헤더 종속 디스크립션 핀 자동 연동 (Cascading Inheritance)
- 현재 `vctrl_iframe_scroll_pin.js`에는 헤더 컴포넌트 위에 꽂힌 핀을 감지하는 `data-fixed-host` 메커니즘이 이미 탑재되어 있습니다.
- 스마트 헤더가 상단 바깥으로 숨겨질 때:
  - 헤더 위에 위치한 디스크립션 핀도 동일한 `transform`과 `transition`을 실시간 상속받아 **헤더와 함께 위로 부드럽게 숨겨집니다.**
- 스마트 헤더가 다시 슬라이드 다운될 때:
  - 디스크립션 핀도 **헤더와 한 몸처럼 함께 부드럽게 복귀**합니다.
  - 별도의 핀 좌표 계산이나 예외 처리 없이 100% 무결점 동기화가 보장됩니다.

### 4.2 Z-Index 위계 보장 (Layering Integrity)
- 스마트 헤더의 Z-Index: `z-index: 100030`
- 종속 핀의 Z-Index: `z-index: 200050`
- 본문 일반 컴포넌트: `z-index: <= 80000`
- 헤더가 본문 위를 부드럽게 덮으며 내려오고 본문은 헤더 밑으로 자연스럽게 통과합니다.

---

## 🛠️ 5. 모듈별 구현 청사진 (Module-by-Module Blueprint)

### 5.1 [엔진 코어] `assets/vctrl_iframe_scroll_pin.js`
- **스크롤 컨테이너별 상태 추적 WeakMap 구축**:
  ```javascript
  var scrollAreaStates = new WeakMap();
  ```
- **상태 변수 구조**:
  ```javascript
  {
      lastScrollTop: 0,
      accumulatedDelta: 0,
      direction: 'none', // 'down' | 'up'
      isHidden: false
  }
  ```
- **방향 감지 및 임계치 판정**:
  - `scrollTop <= 30`: `isHidden = false`, `accumulatedDelta = 0`
  - `delta > 0` (다운): `accumulatedDelta += delta`. `accumulatedDelta >= 12 && scrollTop > 60`일 때 `isHidden = true`
  - `delta < 0` (업): `accumulatedDelta += Math.abs(delta)`. `accumulatedDelta >= 10`일 때 `isHidden = false`
- **변위($\Delta Y$) 계산**:
  ```javascript
  if (mode === 'smart') {
      var domTop = parseFloat(el.style.top) || 0;
      var elH = el.offsetHeight || parseFloat(el.style.height) || 60;
      if (areaState.isHidden) {
          dy = scrollTop - (domTop + elH);
      } else {
          dy = scrollTop - domTop;
      }
      el.style.transition = el.classList.contains('dragging-now') ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
  }
  ```
- **게이트웨이 5 엄격 준수**: 파일 전체가 백틱 템플릿 스트링 내부에 있으므로, **백틱(`` ` ``) 및 변수 보간(`${...}`) 0건** 불변성 준수.

### 5.2 [인스펙터 UI & 이벤트] `assets/vctrl_inspector.js`
- `_bindScrollPinEvents()`:
  - `btnSmart = document.getElementById('btn-scroll-pin-smart')` 바인딩
  - 클릭 시 `_setScrollPin('smart')` 발송
- `_updateScrollPinButtonsUI()`:
  - `btnSmart.classList.toggle('active', pinMode === 'smart')`
  - `badge.innerText = 'SMART HEADER'` 및 `.badge-smart` 클래스 반영
- `_syncScrollPinUI()`:
  - iframe에서 선택된 요소의 `data-scroll-fixed="smart"` 감지 시 UI 100% 동기화

### 5.3 [뷰어 마크업 & 스타일] `viewer.html` & `assets/viewer.css`
- `viewer.html`:
  - `scroll-pin-row` 2번째 줄에 `btn-scroll-pin-smart` 버튼 마크업 주입
- `assets/viewer.css`:
  - `.scroll-pin-btn.active[data-pin="smart"]` 테마 정의 (인디고 글로우, 박스 섀도우)
  - `.scroll-pin-badge.badge-smart` 뱃지 스타일 정의

### 5.4 [저장 및 정제] `assets/vctrl_storage.js`
- `ScreenSanitizer.cleanDOM`:
  - `data-scroll-fixed="smart"` 속성을 안전한 유효 속성으로 인가하여 저장 시 유실 차단.

---

## 🚨 6. 7대 필수 게이트웨이 사전 검증 체크리스트

| 게이트웨이 | 검증 항목 | 방어 전략 |
| :--- | :--- | :--- |
| **G1. 운영 무결성** | 기존 스크린 데이터 및 메타데이터 보존 | 가짜 Mock 데이터 0건, 실제 디스크 데이터만 정직하게 처리 |
| **G2. 사전 심층 분석** | 관련 소스코드 및 룰 전수 분석 | 본 계획서 승인 후 구현 착수 |
| **G3. 사이드이펙트 0건** | 기존 `top`, `bottom`, `custom`, `sticky`, `pin` 동작 보존 | 모드별 조건 분기 완벽 격리, 비파괴적 확장 |
| **G4. 런타임 에러 0건** | Null 체이닝, disconnected 노드 가드 | 옵셔널 체이닝 및 `WeakMap` 자동 가비지 컬렉션 적용 |
| **G5. 백틱 충돌 0건** | `vctrl_iframe_scroll_pin.js` 내 백틱 사용 금지 | 일반 따옴표(`'`)와 `+` 연결 연산자만 엄격 사용 |
| **G6. 정적 구문 검증** | 브래킷/문법 에러 0건 확인 | `check_syntax.ps1` 및 `verify_all.ps1` 100% 무오류 통과 필수 |
| **G7. CORS/통신 준수** | 부모-Iframe 통신 규약 준수 | `MessageHub` 표준 통신 및 단방향 이벤트 파이프라인 유지 |

---

## 🚀 7. 단계별 상세 실행 로드맵 (Execution Roadmap)

```
[Phase 1: 계획서 수립 및 사용자 승인]
  └─ 본 계획서(plan_smart_reveal_header_architecture.md) 작성 완료 및 사용자 피드백 수렴

[Phase 2: 엔진 코어 구현 (Iframe Side)]
  └─ assets/vctrl_iframe_scroll_pin.js
      ├─ scrollAreaStates WeakMap 선언
      ├─ scroll 리스너 내 방향 델타 누적 연산 추가
      ├─ mode === 'smart' 변위(dy) 및 cubic-bezier 트랜지션 로직 구현
      └─ dragging-now 트랜지션 억제 가드 연동

[Phase 3: 인스펙터 UI 마크업 및 스타일링]
  ├─ viewer.html: btn-scroll-pin-smart 버튼 추가 (3x2 그리드)
  └─ assets/viewer.css: .scroll-pin-btn[data-pin="smart"] 및 뱃지 스타일링

[Phase 4: 인스펙터 스크립트 파이프라인 연동]
  └─ assets/vctrl_inspector.js: _bindScrollPinEvents, _updateScrollPinButtonsUI, _syncScrollPinUI 연동

[Phase 5: 정제 및 저장 파이프라인 무결성 확인]
  └─ assets/vctrl_storage.js: ScreenSanitizer 보존 속성 검증

[Phase 6: 7대 필수 게이트웨이 정적/동적 자동 검증]
  ├─ scripts/check_syntax.ps1 (Node VM 구문/백틱 100% 검증)
  └─ scripts/verify_all.ps1 (Edge Headless 브라우저 엔진 0 Error 검증)

[Phase 7: 최종 완료 보고 및 사용자 테스트 가이드 제공]
```
