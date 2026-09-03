# [계획서] 스크린 표준 규격 1600px × 900px 정밀 확장 엔지니어링 계획

## 📌 목표 및 개요
- Workspace Editor의 표준 스크린 캔버스 규격을 기존 `1440px × 900px`에서 **`1600px × 900px` (황금 밸런스 규격)**로 정밀 확장합니다.
- **실무 에디터 작업성 보장**: 1920 FHD 모니터 환경에서 좌측/우측 사이드바를 열고 작업할 때도 화면이 과도하게 축소(70%)되지 않고 **96%~100% 1:1 픽셀 스냅**을 유지합니다.
- **반응형 PC 프레임 대폭 확장**: 모바일 프레임(360px)은 표준을 유지하고, **PC 프레임을 1000px에서 `1160px`로 +160px 확장**하여 현대적인 PC 웹 레이아웃 설계 공간을 확보합니다.
- **100% 하위 호환성 보장**: 기존에 생성된 1440px 스크린 파일들은 0.1px의 오차나 변형 없이 원본 1440px 크기 그대로 안전하게 렌더링됩니다.

---

## 🔍 핵심 원칙 및 하위 호환성 보장

> **하위 호환성 및 기존 데이터 안전 보장 원칙**
> 1. 기존 프로젝트(`data/p_xxxx`)에 이미 생성되어 있는 스크린들은 각 HTML 파일 내의 `1440px` 설정을 `loadScreen()`에서 **실시간 동적으로 감지하여 1440px 뷰포트로 안전하게 렌더링**합니다 (데이터 변형/손상 0%).
> 2. 신규로 추가되는 스크린과 반응형 템플릿에 `1600px × 900px` 규격이 기본 적용됩니다.

---

## 📐 반응형 템플릿 수학적 그리드 설계 (1600px)

```
[ 전체 캔버스: 1600px × 900px ]
├── 좌측 안전 여백 (padding-left): 11px
├── PC 컬럼 (.pc-column / .pc-browser-frame): 1172px
│   ├── 내부 PC 캔버스 (.pc-content-inner): 1160px  <-- (기존 1000px에서 +160px 확장)
│   └── 수직 스크롤바 영역: 12px
├── 컬럼 간격 (gap): 24px
├── Mobile 컬럼 (.mobile-column / .mobile-frame): 382px
│   ├── 내부 Mobile 캔버스 (.mobile-content-inner): 360px  <-- (실기기 표준 유지)
│   └── 수직 스크롤바 및 테두리 영역: 22px
└── 우측 안전 여백 (padding-right): 11px

수학적 검증: 11px + 1172px + 24px + 382px + 11px = 1600px (오차 0px 완벽 일치)
```

---

## 🛠️ Proposed Changes (수정 대상 파일 및 변경 사항)

### 1. 뷰어 부모 창 및 캔버스 뷰포트 레이어

#### [viewer.html](file:///c:/Users/sisun/ai_work/viewer.html)
- `#main-iframe` 기본 인라인 스타일 너비를 `width: 1600px; height: 900px;`로 갱신.

#### [assets/style.css](file:///c:/Users/sisun/ai_work/assets/style.css)
- `.artboard-iframe`: 기본 너비를 `1600px`, 높이를 `900px`로 갱신.
- `.file-card .thumbnail-iframe`: 기본 크기 `1600px × 900px` 동기화.

#### [assets/vctrl_v3.js](file:///c:/Users/sisun/ai_work/assets/vctrl_v3.js)
- `centerView()`: `DOM.iframe.style.width` 폴백 기본값을 1440에서 `1600`으로 갱신.
- `setDeviceViewport(type, w, h)`: 기본 뷰포트 상수 갱신.

#### [assets/vctrl_core.js](file:///c:/Users/sisun/ai_work/assets/vctrl_core.js)
- `loadScreen(fileName)`:
  - 불러온 HTML 컨텐츠에서 `.page` 또는 인라인 스타일에 정의된 `width` 속성(예: 1440px 또는 1600px)을 감지하는 **Dynamic Screen-Aware Viewport** 로직 추가.
  - `iframe.style.width`를 감지된 크기(`1440px` 또는 `1600px`)로 즉시 할당하여 기존 스크린과 신규 1600px 스크린을 자동 완벽 지원.

---

### 2. 반응형 템플릿 및 전용 엔진 레이어

#### [assets/responsive_frame.css](file:///c:/Users/sisun/ai_work/assets/responsive_frame.css) & [assets/responsive_frame.js](file:///c:/Users/sisun/ai_work/assets/responsive_frame.js)
- `.page`: `width: 1600px; height: 900px;`
- `.pc-browser-frame`: `width: 1172px;`
- `.pc-content-area`: `width: 1172px;`
- `.pc-content-inner`: `width: 1160px;`
- `.mobile-frame`, `.mobile-content-area`, `.mobile-content-inner`: `382px / 360px` 유지.
- `responsive_frame.css`와 `responsive_frame.js` (`window.responsiveFrameStyles`) 100% 동기화.

#### [assets/templates/template_responsive_pc_mobile.html](file:///c:/Users/sisun/ai_work/assets/templates/template_responsive_pc_mobile.html) & [assets/templates.js](file:///c:/Users/sisun/ai_work/assets/templates.js)
- 템플릿 내의 HTML/CSS 규격을 1600px (PC 1160px inner)로 갱신.

#### [assets/vctrl_shortcuts.js](file:///c:/Users/sisun/ai_work/assets/vctrl_shortcuts.js) & [assets/vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js)
- 단일 오브젝트 정렬(`Ctrl + 1~6`, `Alt + 1~6`) 시 PC 프레임 기준 너비 폴백을 `1000`에서 `1160`으로 갱신.
- 일반 화면 정렬 시 캔버스 너비 폴백을 `1440`에서 `1600`으로 갱신.

---

### 3. 일반 스크린 템플릿 레이어 (11종)

#### [assets/templates/](file:///c:/Users/sisun/ai_work/assets/templates) 및 [assets/templates.js](file:///c:/Users/sisun/ai_work/assets/templates.js)
- `template_blank.html`: `.page { width: 1600px; height: 900px; }`
- `template_cover.html`: `.page { width: 1600px; height: 900px; }`
- `template_case_study.html`: `.page { width: 1600px; height: 900px; }`
- `template_pc_ui.html`: `.page { width: 1600px; height: 900px; }`, `.browser-frame { width: 1600px; }`
- `template_plan.html`: `.page { width: 1600px; height: 900px; }`, 상단 통합 헤더 카드 `width: 1540px;` (좌우 30px 대칭 마진)
- `template_plan_delivery.html`: `.artboard { width: 1600px; height: 900px; }`
- `template_mobile_ui_1.html` ~ `3.html`: `.page { width: 1600px; height: 900px; }`
- `template_onesphere.html`: `.page { width: 1600px; height: 900px; }`

---

### 4. 디자인 시스템, 스마트 가이드, PDF 내보내기 레이어

#### [assets/vctrl_design_system.js](file:///c:/Users/sisun/ai_work/assets/vctrl_design_system.js)
- 퍼센트(%) 좌표를 절대 픽셀(px)로 마이그레이션할 때 하드코딩된 1440 대신 현재 캔버스 너비(`targetDoc.body.offsetWidth || 1600`)를 동적 참조하도록 수정.

#### [assets/vctrl_smartguide.js](file:///c:/Users/sisun/ai_work/assets/vctrl_smartguide.js)
- `findSnapTargets()`: 폴백 상수 갱신 및 캔버스 우측/중앙 스냅 라인 동적 연동 보장.

#### [assets/vctrl_pdf_exporter.js](file:///c:/Users/sisun/ai_work/assets/vctrl_pdf_exporter.js)
- `format: [1600, 900]` 및 스크린 실제 크기(`offsetWidth`, `offsetHeight`) 기반의 동적 Landscape PDF 렌더링 지원.

#### [AGENTS.md](file:///c:/Users/sisun/ai_work/AGENTS.md) & [SKILL.md](file:///c:/Users/sisun/ai_work/.agents/skills/workspace-editor-engine/SKILL.md)
- 시스템 아키텍처 규칙 내의 캔버스 기준 해상도를 `1600x900` (반응형 PC `1160px`)로 동기화.

---

## 🧪 Verification Plan (검증 계획)

### 1. 구문 및 브래킷 무결성 검증 (Static Syntax Check)
- PowerShell 스크립트를 통해 모든 수정된 JS/CSS/HTML 파일의 괄호 매칭 및 SyntaxError 유무 전수 검사.

### 2. 반응형 그리드 산술 검증
- `padding-left (11px)` + `PC Frame (1172px)` + `gap (24px)` + `Mobile Frame (382px)` + `padding-right (11px)` = 정확히 **`1600px`** 일치 검증.

### 3. 하위 호환성 (Legacy 1440px Screen) 보존 검증
- 기존 `00_Cover_63.html`, `01_Project_Summary_Report_101.html` 로드 시 1440px 뷰포트로 정확히 렌더링되는지 확인.

### 4. 뷰포트 센터링 및 1:1 픽셀 스냅 검증
- 1920 모니터에서 사이드바 토글 시 `centerView()`가 스케일 `1.0` (100%)을 유지하는지 확인.
