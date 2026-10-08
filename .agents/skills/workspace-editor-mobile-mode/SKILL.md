---
name: workspace-editor-mobile-mode
description: Use when developing, optimizing, or debugging Mobile Read-Only Presentation Mode, mobile landscape/portrait viewports, viewer.html, index.html mobile dashboard, vctrl_resolution_engine.js, native browser requestFullscreen, smart frame switcher (v4-frame-switcher), zen mode, touch pinch-zoom, and strictly suppressing PC presentation pen/tooltips on touch devices.
---

# Workspace Editor Mobile Read-Only Mode & Viewport Architecture

## 🚨 [절대 원칙] 모바일 환경의 본질: 100% 읽기/뷰어(Viewer) 전용 모드
1. **저작(Authoring) 기능 전면 배제**:
   - 스마트폰 터치 인터페이스로는 1600×900 캔버스 드래그, 인스펙터 속성 조절, UI 프레임 편집 등 복잡한 에디터 기능을 조작하기에 적합하지 않습니다.
   - 모바일 접속의 목적은 **"기존 결과물 확인, 링크 공유 열람, 프레젠테이션 검토 및 데모"**에 100% 집중되어야 합니다.
   - 따라서 대시보드(`index.html`)의 `[+ New Project]` 버튼, 캔버스 에디터(`editor.html`)의 저작 도구(사이드바, 글로벌 저장, 편집 툴바, 인스펙터 등)는 모바일 환경에서 철저하게 숨김(`display: none !important;`) 처리합니다.

---

## 🛑 [치명적 안티패턴 방지] 3대 절대 금지 규칙 (Never Repeat These Mistakes)

### 1. 모바일에서 네이티브 `requestFullscreen` 호출을 임의로 제거하지 말 것!
- **원인 분석**: "안드로이드 OS 자체의 전체화면 보안 안내 토스트('전체 화면을 종료하려면 상단에서 드래그한 후 뒤로 버튼을 터치하세요')를 없앤다"는 이유로 모바일에서 `requestFullscreen()` 호출을 건너뛰고 CSS Zen Mode만 켜는 실수를 저질렀음.
- **결과**: `requestFullscreen()`이 불리지 않아 안드로이드 상단 상태바(`SKT 5:57`, 배터리 등)와 브라우저 주소창이 전혀 사라지지 않고 일반 뷰와 똑같아져 "전체보기가 동작하지 않는" 치명적 결함 발생.
- **절대 규칙**:
  - 모바일 [전체보기]의 핵심 가치는 **상단 상태바와 브라우저 주소창을 완전히 숨겨 1600×900 스크린이 스마트폰 전체 화면에 100% 꽉 차게 핏(Fit)되도록 만드는 것**이다.
  - `vctrl_resolution_engine.js`와 `vctrl_canvas_viewport.js`의 전체화면 진입/종료 로직에서 모바일/터치 기기라고 해서 `requestFullscreen()` / `webkitRequestFullscreen()` / `exitFullscreen()` 호출을 절대 차단하지 않는다.

### 2. PC 전용 단축키 안내 툴팁 및 레이저 포인터/펜을 모바일에 노출하지 말 것!
- **원인 분석**: 사용자가 "안내 메시지를 지워달라"고 한 것은 OS 시스템 토스트가 아니라, 우측 하단에 버젓이 떠 있던 알약 모양의 **`[ Shift + Drag : Highlighter | C : Clear ]`** (`#presentation-pen-tooltip`) 및 레이저 포인터 붉은 점이었음.
- **절대 규칙**:
  - 모바일 스마트폰에는 `Shift` 키나 `C` 키보드가 존재하지 않는다.
  - `vctrl_presentation_pen.js`의 툴팁(`presentation-pen-tooltip`)과 캔버스(`presentation-pen-canvas`)는 모바일/터치 환경(`isMobileOrTouchDevice()`, `pointer: coarse`, `max-width: 1050px`)에서 **절대 DOM에 생성되거나 표시되지 않도록 JS와 CSS 양쪽에서 이중 차단**한다.
  ```css
  /* assets/responsive_workspace.css */
  body.res-narrow #presentation-pen-canvas,
  body.res-narrow #presentation-pen-tooltip,
  body.touch-capable #presentation-pen-canvas,
  body.touch-capable #presentation-pen-tooltip,
  .v4-zen-toast {
      display: none !important;
  }

  @media (pointer: coarse), (max-width: 1050px) {
      #presentation-pen-canvas,
      #presentation-pen-tooltip {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
      }
  }
  ```

### 3. 모바일 읽기 전용 모드에서는 캔버스 내부 인터랙션을 완전 차단할 것!
- 스마트폰 화면을 터치하여 스크롤하거나 핀치 줌을 할 때, 캔버스 내부 오브젝트가 선택되거나 파란색 핸들이 생기거나 텍스트가 긁히면 모바일 뷰어 경험이 파괴됩니다.
- `responsive_workspace.css`의 `body.res-narrow`, `body.touch-capable` 환경에서는:
  ```css
  #main-iframe,
  .canvas iframe,
  .artboard-wrapper,
  .pins-layer {
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
  }
  ```
  속성을 부여하여 사용자의 터치가 오직 뷰포트 줌/팬에만 전달되도록 보장합니다.

---

## 📐 뷰포트 분류 및 반응형 동작 규격

| 모드 | 뷰포트 미디어 쿼리 | 헤더 및 UI 동작 | 주요 레이아웃 |
| :--- | :--- | :--- | :--- |
| **모바일 세로 (Portrait)** | `max-width: 768px` (height > 520px) | `[+ New Project]` 숨김, 상단 헤더 높이 최소화 | 1열 카드 그리드, 검색창 100% 폭 |
| **모바일 가로 (Landscape)** | `(orientation: landscape) and (max-height: 520px)`, `(max-height: 480px)` | 상단 툴바 숨김, 1줄 슬림 헤더(38px), `[+ New Project]` 숨김 | `[로고 + My Projects]` + `[중앙 검색창 (max 440px)]`, 카드 뷰포트 85% 이상 확보 |
| **태블릿 / 소형 노트북** | `769px ~ 1050px` | 사이드바 숨김, 콤팩트 툴바 유지 | 2~3열 카드 그리드 |
| **데스크톱 PC** | `width > 1050px` (height > 520px) | 모든 저작 도구, `[+ New Project]`, 키보드 단축키 정상 활성화 | 풀 레이아웃 |

---

## 🎛️ 스마트 프레임 포커스 스위처 (`v4-frame-switcher`) 규칙

1. **노출 조건**: 반응형 화면(`isResponsiveDocument`)이며 실제 PC/모바일 컬럼이 존재할 때만 우측 상단에 플로팅 알약(`is-available`)으로 노출.
2. **단일 프레임 스크린 자동 정제**:
   - PC 전용 프레임만 존재하는 화면(예: `09_Admin_PC_Scroll_639.html` 등)에서는 불필요한 `[모바일핏]` 버튼을 명시적으로 숨김(`is-hidden`, `display: none !important`).
   - 모바일 프레임이 스크롤 불가능한 고정 화면 등에서는 유효성을 판별하여 불필요한 버튼을 노출하지 않음.
3. **기본값 및 스위칭 동작**:
   - **기본값**: 무조건 `[전체](full)` 뷰.
   - **[모바일핏] 클릭 시**: 모바일 프레임 기준으로 세로 형태 1:1 핏.
   - **[PC핏] 클릭 시**: PC 프레임 기준으로 가로 형태 와이드 핏.

---

## 🔄 전체화면 및 젠 모드(Zen Mode) 라이프사이클

1. **진입 (`toggleZenMode(true)`)**:
   - `document.documentElement.requestFullscreen()` (또는 `webkitRequestFullscreen`) 실행하여 모바일 브라우저 주소창/상태바 완전 제거.
   - `body.classList.add('fullscreen-mode', 'zen-mode')`.
   - 상단 헤더, 독 인디케이터 숨김.
   - 좌우 슬라이드 내비게이션 화살표(`<`, `>`) 유지.
   - 우측 상단 `[전체보기 취소]` 알약 버튼(`v4-zen-exit-pill`) 노출.
   - 200ms 후 `centerView(true)` 호출하여 1600×900 화면을 디바이스에 꽉 차게 리센터링.

2. **종료 (`toggleZenMode(false)`)**:
   - `document.exitFullscreen()` (또는 `webkitExitFullscreen`) 실행.
   - `body.classList.remove('fullscreen-mode', 'zen-mode')`.
   - 본래 뷰포트로 즉각 복귀 및 리스케일.
   - 사용자가 안드로이드 시스템 뒤로가기 제스처로 전체화면을 빠져나갔을 때도 `fullscreenchange` 이벤트 리스너가 이를 감지하여 클래스를 안전하게 동기화.

---

## ✅ 모바일 작업 완료 후 필수 체크리스트

1. [ ] **모바일 가로모드 전체보기 검증**:
   - [전체보기] 클릭 시 브라우저 상단 상태바가 사라지고 스크린이 화면 전체에 꽉 차게 핏되는가?
   - 우측 상단에 `[전체보기 취소]` 버튼이 정상 노출되는가?
   - 우측 하단에 `Shift + Drag : Highlighter` 등 PC 단축키 메시지가 전혀 뜨지 않는가?
   - 붉은색 레이저 포인터 점이 생기지 않는가?
2. [ ] **대시보드(`index.html`) 모바일 검증**:
   - 가로모드에서 헤더가 1줄(`[로고+제목] [검색창]`)로 슬림하게 압축되어 프로젝트 카드가 화면 85% 이상 보이는가?
   - 세로 및 가로모드 모두에서 `[+ New Project]` 버튼이 보이지 않는가?
   - 데스크톱 PC에서는 `[+ New Project]` 버튼이 정상 노출되는가?
3. [ ] **정적 검증 스크립트 실행**:
   - `powershell -ExecutionPolicy Bypass -File scripts\check_syntax.ps1` (0 Errors 확인)
   - `powershell -ExecutionPolicy Bypass -File scripts\verify_all.ps1` (`True` 확인)
