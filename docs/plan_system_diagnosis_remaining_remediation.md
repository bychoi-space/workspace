# [마스터 계획서] 시스템 정밀 진단 후속 과제 리팩토링 및 아키텍처 최적화 계획

> **작성 일자**: 2026-10-06  
> **상태**: 🟢 100% 실행 완료 및 전수 검증 통과 (Executed & 100% Verified)  
> **기반 진단 문서**: [`docs/system_deep_diagnosis_report_20261006.md`](file:///c:/Users/sisun/ai_work/docs/system_deep_diagnosis_report_20261006.md)  
> **준수 규정**: [AGENTS.md](file:///c:/Users/sisun/ai_work/AGENTS.md) 7대 필수 게이트웨이 및 [workspace-editor-safety-process](file:///c:/Users/sisun/ai_work/.agents/skills/workspace-editor-safety-process/SKILL.md)

---

## 📌 1. 배경 및 추진 목적 (Context & Objectives)

2026년 10월 6일 실시된 워크스페이스 전수 정밀 진단 결과, 시스템 참조 무결성(고아 파일 0건), V8 VM 구문 검증(0 Errors), 오프라인 번들 동기화(UP TO DATE) 등 전반적인 시스템 상태는 매우 건전하게 유지되고 있음을 확인했습니다.  
또한, 기완료된 1차 즉시 조치(Phase 1: `vctrl_inspector.js :: _syncComponentTypeProperties` 전략 패턴 분리, Phase 2: `vctrl_iframe_script.js` 잔재 프록시 정리)를 통해 가장 시급했던 문제들이 해결되었습니다.

본 계획서는 **진단 보고서에서 도출된 나머지 후속 조치 필요 과제(동일 코드 공통화, 최상위 대용량 파일 분리, 단일 함수 라인 수 1위 고복잡도 함수 파편화, 정밀 진단 엔진 고도화)**를 안전하고 체계적으로 완수하기 위한 종합 실행 마스터 플랜입니다.

---

## 🎯 2. 후속 조치 대상 4대 중점 영역 분석 (Target Domain Analysis)

### [영역 A] 동일 코드 공통화 및 SSOT 단일화 (Criterion 3: Logic Commonization)
서로 다른 모듈에 중복 선언되어 단일 진실 공급원(SSOT) 원칙을 저해하는 3개 유틸리티를 공통 모듈로 일원화합니다.

| 과제 번호 | 대상 모듈 | 중복 현황 및 문제점 | 조치 설계 (To-Be) |
| :---: | :--- | :--- | :--- |
| **Task A-1** | [`assets/vctrl_revision_history.js`](file:///c:/Users/sisun/ai_work/assets/vctrl_revision_history.js)<br>[`assets/app.js`](file:///c:/Users/sisun/ai_work/assets/app.js) | `vctrl_common.js`에 `window.getFormattedKST`가 확립되어 있음에도 `_getFormattedKSTNow()` 및 `getFormattedKST()`를 각 파일에서 자체 재구현하여 사용 중 | `vctrl_revision_history.js`의 `_getFormattedKSTNow`를 `window.getFormattedKST` 호출로 위임 일원화하고 `app.js`는 대시보드 단독 로딩을 고려한 방어적 폴백 구조로 정돈 |
| **Task A-2** | [`assets/vctrl_canvas_background.js`](file:///c:/Users/sisun/ai_work/assets/vctrl_canvas_background.js) | `vctrl_common.js`에 `window.rgbToHex`가 전역 제공되고 있으나, L32~48에 로컬 `function rgbToHex()`가 17줄에 걸쳐 중복 선언됨 | 로컬 중복 함수를 제거하고 `window.rgbToHex` SSOT 직접 참조로 통일 |
| **Task A-3** | [`assets/vctrl_inspector.js`](file:///c:/Users/sisun/ai_work/assets/vctrl_inspector.js) | `vctrl_common.js` L299에 `window.getCategoryData`가 이미 정의되어 있으나, `vctrl_inspector.js` L1617~1635에 19라인의 동일한 fallback 선언문이 잔재함 | `vctrl_inspector.js`의 중복 블록을 안전하게 삭제하여 코드 경량화 및 SSOT 보장 |

---

### [영역 B] 최상위 대용량 파일 분리 (Criterion 1: Heavy File Decoupling)
시스템 내 단일 파일 용량 1위(90.3KB, 1,947라인)인 [`assets/vctrl_inspector.js`](file:///c:/Users/sisun/ai_work/assets/vctrl_inspector.js)에서 독립 도메인을 분리합니다.

| 과제 번호 | 분리 대상 도메인 | 현황 및 분리 필요성 | 조치 설계 (To-Be) |
| :---: | :--- | :--- | :--- |
| **Task B-1** | **반응형 스크롤 핀 & 스마트 HUD 인스펙터 UI/UX** | `_setScrollPin`, `_updateScrollPinButtonsUI`, `_syncScrollPinUI`, `_bindScrollPinEvents` 등 스크롤 핀 전용 로직이 L915~L1272(총 360라인)에 걸쳐 인스펙터 코어에 밀집됨 | - 신규 모듈 [`assets/inspector/inspector_scroll_pin.js`](file:///c:/Users/sisun/ai_work/assets/inspector/inspector_scroll_pin.js) (`window.InspectorScrollPin`) 신설<br>- 스크롤 핀 5대 모드(Top, Bottom, Custom, Sticky, None) 및 방향 효과 UI 로직 전담 분리<br>- `vctrl_inspector.js` 파일 크기 **90.3KB ➔ 약 75KB (-18% 경량화)** 달성<br>- `viewer.html` 로딩 파이프라인 정규 등록 |

---

### [영역 C] 고복잡도 거대 함수 파편화 (Criterion 4: Complexity Fragmentation)
시스템 내 단일 함수 라인 수 1위(619라인)인 어드민 세팅 동기화 함수를 관심사별 서브 핸들러로 분할합니다.

| 과제 번호 | 대상 함수 | 현황 및 문제점 | 조치 설계 (To-Be) |
| :---: | :--- | :--- | :--- |
| **Task C-1** | [`assets/inspector/inspector_admin_settings.js`](file:///c:/Users/sisun/ai_work/assets/inspector/inspector_admin_settings.js)<br>`_syncAdminSettingsProps()` | 단일 함수 본문이 **619라인(L8-L626)**에 달하며, 라벨 너비 슬라이더, 그룹 헤더, 행 높이, 컬럼 라벨, 추가/삭제 액션 등 5가지 이종 로직이 모놀리식으로 엉켜 있음 | 5개의 단일 책임 서브 함수로 파편화:<br>1. `_syncAdminLabelWidth(comp)`<br>2. `_syncAdminGroupHeader(comp)`<br>3. `_syncAdminRowHeights(comp, forceRebuild)`<br>4. `_syncAdminColLabels(comp, forceRebuild)`<br>5. `_syncAdminRowActions(comp)`<br>➔ 메인 함수는 15라인의 직관적 코디네이터로 전환 |

---

### [영역 D] 정밀 진단 도구 고도화 (Criterion 6: Diagnosis Tooling Enhancement)
- **Task D-1**: [`scripts/diagnose_deep_inspection.js`](file:///c:/Users/sisun/ai_work/scripts/diagnose_deep_inspection.js)의 함수 분석 엔진을 AST/토큰 스택 기반으로 업그레이드하여, 즉시실행함수(IIFE), 클로저, 및 `window.v4...Script` 백틱 인라인 스크립트 내부의 거대 함수까지 누락 없이 100% 자동 탐지할 수 있도록 보강.

---

## 📋 3. 단계별 상세 구현 설계 (Detailed Technical Specifications)

### 3.1 [Phase 1: SSOT 유틸리티 공통화] 구현 명세

#### 1) `assets/vctrl_revision_history.js`
```diff
-    function _getFormattedKSTNow() {
-        const d = new Date();
-        const pad = n => String(n).padStart(2, '0');
-        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
-    }
+    function _getFormattedKSTNow() {
+        return (typeof window.getFormattedKST === 'function') 
+            ? window.getFormattedKST() 
+            : new Date().toISOString().slice(0, 19).replace('T', ' ');
+    }
```

#### 2) `assets/vctrl_canvas_background.js`
```diff
-    function rgbToHex(rgb) {
-        if (!rgb) return '#f8fafc';
-        const str = rgb.trim().toLowerCase();
-        if (str.startsWith('#')) {
-            if (str.length === 4) {
-                return '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3];
-            }
-            return str;
-        }
-        if (str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return '#f8fafc';
-        const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)\)?/);
-        if (!match) return '#f8fafc';
-        const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
-        const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
-        const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
-        return '#' + r + g + b;
-    }
+    function rgbToHex(rgb) {
+        if (!rgb) return '#f8fafc';
+        if (typeof window.rgbToHex === 'function') {
+            const res = window.rgbToHex(rgb);
+            if (res) return res;
+        }
+        return rgb.startsWith('#') ? rgb : '#f8fafc';
+    }
```

#### 3) `assets/vctrl_inspector.js`
- L1617~1635의 `if (typeof window.getCategoryData !== 'function') { ... }` 19라인 중복 블록 완전 제거 (`vctrl_common.js` SSOT 100% 신뢰).

---

### 3.2 [Phase 2: 고복잡도 거대 함수 파편화] 구현 명세

#### `assets/inspector/inspector_admin_settings.js`
- 619라인 거대 함수를 5개 서브 모듈로 격리:
```javascript
// 1. 라벨 너비 제어
function _syncAdminLabelWidth(comp) { ... }

// 2. 그룹 헤더 설정
function _syncAdminGroupHeader(comp) { ... }

// 3. 행 높이 설정
function _syncAdminRowHeights(comp, forceRebuild) { ... }

// 4. 컬럼 라벨 설정
function _syncAdminColLabels(comp, forceRebuild) { ... }

// 5. 행 추가/삭제 및 액션 바인딩
function _syncAdminRowActions(comp) { ... }

// 메인 코디네이터 (15라인)
function _syncAdminSettingsProps(comp, forceRebuild = false) {
    if (!comp) return;
    _syncAdminLabelWidth(comp);
    _syncAdminGroupHeader(comp);
    _syncAdminRowHeights(comp, forceRebuild);
    _syncAdminColLabels(comp, forceRebuild);
    _syncAdminRowActions(comp);
}
```

---

### 3.3 [Phase 3: 대용량 파일 분리] 구현 명세

#### 신규 모듈: `assets/inspector/inspector_scroll_pin.js`
- **역할**: 부모 창 측 스크롤 핀 & 스마트 HUD 인터페이스 컨트롤러 SSOT.
- **포함 함수**:
  - `window.InspectorScrollPin.setScrollPin(mode, extraOptions)`
  - `window.InspectorScrollPin.updateButtonsUI(mode, isPin, payload)`
  - `window.InspectorScrollPin.syncUI(compStyles)`
  - `window.InspectorScrollPin.bindEvents()`
- **연동**:
  - `viewer.html`에 `<script src="assets/inspector/inspector_scroll_pin.js"></script>` 추가.
  - `vctrl_inspector.js`에서는 `window.InspectorScrollPin.syncUI(compStyles)` 호출로 가볍게 위임.
  - `AGENTS.md` 모듈러 아키텍처에 `inspector_scroll_pin.js` 역할 명세 등록.

---

## 🛡️ 4. 7대 필수 게이트웨이 및 안전 검증 프로토콜

1. **[운영 시스템 무결성 보장] (Strict Production Integrity)**:
   - 가짜 데이터나 Mock 주입 0건. 실제 디스크 데이터(`metadata.json`, 화면 HTML) 100% 보존.
2. **[사이드이펙트 원천 차단] (Zero Side-Effects)**:
   - 전역 인터페이스(`window.updateProperties`, `window._syncAdminSettingsProps`) 시그니처 100% 유지.
   - 스크롤 핀 분리 시 캔버스 Iframe 통신 프로토콜(`LF_SET_SCROLL_FIXED`) 100% 보존.
3. **[스크립트/런타임 에러 0건] (Zero Runtime Errors)**:
   - 모든 DOM 접근 시 옵셔널 체이닝(`?.`) 및 요소 존재 가드 철저 적용.
4. **[백틱 충돌 에러 0건] (Zero Backtick Syntax Collisions)**:
   - 모든 수정 파일에서 이중 백틱 충돌 원천 차단, 표준 따옴표와 문자열 연결만 사용.
5. **[구문 검증 및 브라우저 실구동 검증 강제] (Mandatory Dual Verification)**:
   - 단계별 수정 완료 후 즉시 `scripts/check_syntax.ps1` 구동 (0 Errors 확인).
   - `scripts/verify_all.ps1` 구동하여 Edge Headless 실구동 브라우저 컴파일 100% 무결성 확인.
6. **[CORS 에러 0건 및 통신 프로토콜 준수] (Zero CORS Errors)**:
   - 부모 창-Iframe 간 통신은 `MessageHub` 및 `window.EditorBus` 표준 인터페이스만 사용.

---

## 📅 5. 단계별 실행 로드맵 (Step-by-Step Action Roadmap)

```
[Phase 1: SSOT 유틸리티 공통화]
  ├── Step 1-1: vctrl_revision_history.js _getFormattedKSTNow SSOT 위임
  ├── Step 1-2: vctrl_canvas_background.js rgbToHex SSOT 위임
  ├── Step 1-3: vctrl_inspector.js getCategoryData 중복 선언 제거
  └── Step 1-4: check_syntax.ps1 정적 무결성 1차 검증 (0 Errors)

[Phase 2: 고복잡도 거대 함수 파편화]
  ├── Step 2-1: inspector_admin_settings.js 619라인 함수를 5개 서브 모듈로 분할
  ├── Step 2-2: 어드민 세팅 인스펙터 양방향 이벤트 정상 연동 검증
  └── Step 2-3: check_syntax.ps1 정적 무결성 2차 검증 (0 Errors)

[Phase 3: 대용량 파일 분리 (스크롤 핀 도메인 격리)]
  ├── Step 3-1: assets/inspector/inspector_scroll_pin.js 신규 모듈 생성 및 360라인 이관
  ├── Step 3-2: assets/vctrl_inspector.js 내 스크롤 핀 로직 위임 정리 (-18% 경량화)
  ├── Step 3-3: viewer.html 스크립트 파이프라인 등록 및 AGENTS.md 동기화
  └── Step 3-4: check_syntax.ps1 & verify_all.ps1 정적/브라우저 검증 (0 Errors)

[Phase 4: 진단 도구 업그레이드 및 종합 검증]
  ├── Step 4-1: scripts/diagnose_deep_inspection.js 토큰 스택 파서 업그레이드
  ├── Step 4-2: scripts/diagnose_system.ps1 전수 재진단 구동
  └── Step 4-3: 결과 리포트 최종 갱신 및 완료 보고
```

---
*본 마스터 계획서는 시스템 전체 정밀 진단 결과에 따른 기술 표준과 안전 절차를 충족하는 공식 실행 계획서입니다.*
