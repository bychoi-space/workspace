# 시스템 전면 최적화 계획서 (Phase 3)
## Phase 3: 코어 엔진 디스패처 분리 및 인스펙터 도메인 모듈화 (Architecture Modernization)

작성일자: 2026-09-04  
상태: 실행 완료 (Completed)  
선행 계획서: [Phase 2 공통 통신/유틸리티 일원화 및 CSS 토큰 통합 계획서](file:///c:/Users/sisun/ai_work/docs/plan_refactoring_phase2_common_utilities_and_css_consolidation.md) (완료)  
마스터 로드맵: [plan_refactoring_master_roadmap.md](file:///c:/Users/sisun/ai_work/docs/plan_refactoring_master_roadmap.md)

---

## 1. 배경 및 목적

### 1) 현황 및 문제점
- **Iframe 렌더링 쉘의 초거대 모놀리스**:
  - [assets/vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js) (3,436 lines, 187.6 KB) 내부의 `window.addEventListener('message', ...)` 단일 블록이 무려 **2,486줄**에 달합니다.
  - 46종류의 `LF_*` 메시지 처리 로직이 거대한 절차적 `if-else` 체인으로 얽혀 있어, 사소한 메시지 핸들러 수정 시에도 3,400줄 전체의 브래킷 매칭과 구문 에러 리스크가 전역으로 전파됩니다.
- **인스펙터 도메인 로직의 인위적 분열**:
  - 속성을 읽어서 UI에 채우는 로직(`_sync*Props`)은 [assets/vctrl_inspector.js](file:///c:/Users/sisun/ai_work/assets/vctrl_inspector.js) (3,206 lines)에 있고,
  - 사용자가 UI를 조작했을 때 이벤트를 받아 Iframe으로 전송하는 로직(`init*Events`)은 [assets/vctrl_v4_addon.js](file:///c:/Users/sisun/ai_work/assets/vctrl_v4_addon.js) (2,489 lines)에 완전히 찢어져 있습니다.
  - 이로 인해 특정 컴포넌트(예: Grid, Accordion, Checkbox 등)의 속성을 하나 추가/수정하려면 두 개의 3,000줄짜리 거대 파일을 동시에 넘나들며 수정해야 하는 심각한 유지보수 병목이 발생합니다.
- **Iframe 주입 스크립트의 매 화면 무차별 결합 오버헤드**:
  - `vctrl_core.js`가 화면 로드(`loadScreen`)마다 20개 하위 스크립트 문자열(약 9,000줄 / 450KB)을 매번 메모리에서 문자열 덧셈(`+`)으로 결합하여 주입하고 있어, 잦은 화면 전환 시 가비지 컬렉션(GC) 스파이크와 렌더 지연이 유발됩니다.

### 2) Phase 3의 핵심 목표
1. **Iframe 메시지 디스패처 (Command Pattern) 전면 도입**:
   - 2,486줄의 거대 메시지 리스너를 **커맨드 핸들러 맵(`MessageDispatcher`)** 구조로 분리.
   - `vctrl_iframe_script.js` 본체는 이벤트 라우팅만 담당하는 500줄 이내의 초경량 쉘(Shell)로 재편.
2. **인스펙터 도메인별 일체형 모듈 재편**:
   - `vctrl_inspector.js`와 `vctrl_v4_addon.js`로 분열된 컴포넌트별 읽기/쓰기 로직을 컴포넌트 도메인 단위(`inspector_grid.js`, `inspector_accordion.js` 등)로 결합 분리.
   - `vctrl_inspector.js`는 사이드바 탭 전환, 화면 목록 등 글로벌 네비게이션에만 집중하도록 단일 책임 원칙(SRP) 확립.
3. **Iframe 주입 스크립트 파이프라인 캐싱 최적화**:
   - 결합된 스크립트 블록을 최초 1회 메모리 캐싱(`cachedScriptBlock`)하여 화면 전환 성능 극대화.

---

## 2. 세부 기술 설계 (Technical Specifications)

### 1) `vctrl_iframe_script.js` 커맨드 디스패처 설계

```javascript
// [Iframe Command Registry Pattern]
const MessageDispatcher = {
    // 스타일 및 텍스트
    LF_UPDATE_STYLE: (data) => handleUpdateStyle(data),
    LF_UPDATE_SHAPE_TEXT: (data) => handleUpdateShapeText(data),

    // 테이블 도메인 -> vctrl_table.js 로 위임
    LF_TABLE_ACTION: (data) => window.V4TableEngine?.handleAction(data),
    LF_UPDATE_CELL_STYLE: (data) => window.V4TableEngine?.handleCellStyle(data),
    LF_UPDATE_CELL_DIMENSION: (data) => window.V4TableEngine?.handleCellDimension(data),

    // 그리드 도메인 -> vctrl_iframe_grid.js 로 위임
    LF_UPDATE_GRID_PROPERTIES: (data) => window.V4GridEngine?.handleUpdate(data),

    // 아코디언 도메인 -> vctrl_iframe_accordion.js 로 위임
    LF_UPDATE_ACCORDION_PROPERTIES: (data) => window.V4AccordionEngine?.handleUpdate(data),

    // 그룹화 도메인 -> vctrl_grouping.js 위임
    LF_GROUP_SELECTED: (data) => handleGroupSelected(data),
    LF_UNGROUP_SELECTED: (data) => handleUngroupSelected(data),

    // 저장 요청 -> ScreenSanitizer 적용
    LF_REQUEST_SAVE_CONTENT: () => handleSaveContentResponse()
};

// 초경량 전역 메시지 리스너 (5줄)
window.addEventListener('message', (e) => {
    if (!e.data || !e.data.type) return;
    const handler = MessageDispatcher[e.data.type];
    if (handler) {
        handler(e.data);
    }
});
```

### 2) 인스펙터 도메인 모듈화 설계

```
assets/
 ├── vctrl_inspector.js (글로벌 사이드바, 화면 목록, Quill 에디터 전담: ~800 lines)
 └── inspector/
      ├── inspector_shapes.js       (Shape 도형 컬러/반경/투명도 읽기 & 쓰기 일체형)
      ├── inspector_grid.js         (Grid 테이블 열/행/스타일 읽기 & 쓰기 일체형)
      ├── inspector_accordion.js    (Accordion 계층 구조/선택 읽기 & 쓰기 일체형)
      ├── inspector_atoms.js        (Checkbox, Radio, Stepper, Alert 등 소형 아톰 통합)
      └── inspector_admin.js        (Admin 설정 컴포넌트 속성)
```

- 각 모듈은 `sync(compStyles)` (읽기)와 `bindEvents()` (쓰기)를 한 쌍으로 캡슐화하여 소유합니다.
- 새로운 속성을 추가할 때 해당 컴포넌트 파일 1개만 수정하면 완결되도록 구조적 결합도를 극대화하고 파일 간 의존성을 격리합니다.

### 3) Iframe 주입 파이프라인 메모리 캐싱 설계
`vctrl_core.js` 내의 `getInlinedEngineScript()`를 멱등성 메모리 캐시로 최적화합니다:

```javascript
let _cachedEngineScriptBlock = null;

function getInlinedEngineScript() {
    if (_cachedEngineScriptBlock && window.__DEV_NO_CACHE__ !== true) {
        return _cachedEngineScriptBlock;
    }

    _cachedEngineScriptBlock = '<script id="v4-inlined-script">\n' +
        (window.v4TypographyScript || '') + '\n' +
        (window.v4UndoScript || '') + '\n' +
        // ... (20개 스크립트 결합) ...
        (window.v4Script || '') + '\n</script>';

    return _cachedEngineScriptBlock;
}
```

---

## 3. 작업 대상 파일 및 변경 사항 (Target Files)

### 1. [assets/vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js)
- 라인 1000 ~ 3436의 거대 if-else 블록을 `MessageDispatcher` 객체로 분리
- 서브 모듈(`vctrl_table.js`, `vctrl_iframe_grid.js`, `vctrl_iframe_accordion.js`)로 메시지 처리 위임

### 2. [assets/vctrl_inspector.js](file:///c:/Users/sisun/ai_work/assets/vctrl_inspector.js) & [assets/vctrl_v4_addon.js](file:///c:/Users/sisun/ai_work/assets/vctrl_v4_addon.js)
- `vctrl_v4_addon.js`의 13개 `init*Events`를 도메인 모듈로 이전
- `vctrl_inspector.js`의 12개 `_sync*Props`를 도메인 모듈로 이전
- 도메인 모듈 신설:
  - [NEW] `assets/inspector/inspector_grid.js`
  - [NEW] `assets/inspector/inspector_accordion.js`
  - [NEW] `assets/inspector/inspector_shapes.js`
  - [NEW] `assets/inspector/inspector_atoms.js`

### 3. [assets/vctrl_core.js](file:///c:/Users/sisun/ai_work/assets/vctrl_core.js)
- 라인 32-55: `getInlinedEngineScript()` 메모리 캐시 패턴 적용

---

## 4. 검증 계획 (Verification Plan)

1. **46개 메시지 액션 전수 동작 검증**:
   - 텍스트/도형 서식 변경, 테이블 행/열 추가, 그리드 페이지네이션/너비 조절, 아코디언 항목 추가/선택
   - 다중 선택, 그룹화(Ctrl+G), 그룹 해제, Undo/Redo(Ctrl+Z), 복사/붙여넣기(Ctrl+C/V)
2. **구문 및 브래킷 검증**:
   - 신규 생성된 모든 도메인 모듈 및 경량화된 `vctrl_iframe_script.js`에 대해 `check_syntax.ps1` 구동 (0 SyntaxError)
3. **화면 전환 성능 벤치마크**:
   - 스크린 목록 연속 클릭 전환 시 렌더링 딜레이 및 프레임 드랍 발생 여부 체감 검증
