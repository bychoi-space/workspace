# [계획서] 시스템 전체 정밀 진단 조치사항 리팩토링 및 최적화 마스터 플랜

> **작성 일자**: 2026-10-06  
> **상태**: 계획 수립 완료 (Ready for Execution)  
> **기반 진단 보고서**: [`docs/system_deep_diagnosis_report_20261006.md`](file:///c:/Users/sisun/ai_work/docs/system_deep_diagnosis_report_20261006.md)  
> **관련 모듈**: `assets/vctrl_inspector.js`, `assets/vctrl_iframe_script.js`, `assets/vctrl_iframe_inserter.js`  
> **준수 규정**: `AGENTS.md` 7대 필수 게이트웨이, `workspace-editor-safety-process`, `workspace-editor-engine`, `workspace-editor-system-diagnosis`

---

## 1. 개요 및 목적 (Executive Summary & Goals)

### 1.1 배경 (Background)
2026년 10월 6일 워크스페이스 전수 정밀 진단(`scripts/diagnose_system.ps1`) 결과, 시스템 참조 무결성(고아 파일 0건), V8 VM 구문 검증(0 Errors), 오프라인 번들 최신성(UP TO DATE) 등 전반적인 시스템 상태는 매우 양호하나, 다음 2가지 중점 개선 대상이 식별되었습니다:
1. **[Criterion 4] 고복잡도 거대 함수**: [`assets/vctrl_inspector.js`](file:///c:/Users/sisun/ai_work/assets/vctrl_inspector.js) 내 `_syncComponentTypeProperties()`가 **152라인**, **12단계 중첩 `if-else if` 분기**로 응집되어 있어 유지보수성 저하 및 신규 컴포넌트 추가 시 회귀(Regression) 위험 상존.
2. **[Criterion 3] 모듈 분리 잔재 레거시 프록시 코드**: `assets/vctrl_iframe_inserter.js`로 분리 이관 완료 후에도 [`assets/vctrl_iframe_script.js`](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js)에 `function handleInsertComponent(d)` 프록시 함수가 중복 선언되어 잔재함.

### 1.2 목표 (Goals)
- **거대 함수 100% 전략 패턴 파편화**: 152라인 `if-else if` 함수를 도메인별 순수 핸들러 함수와 `TYPE_SYNC_STRATEGIES` 디스패처 테이블로 잘게 파편화하여 가독성 및 모듈성 극대화.
- **중복 프록시 코드 100% 제거**: `vctrl_iframe_script.js`의 단순 프록시 래퍼를 정리하고 Iframe 메시지 레지스트리 디스패처에서 `window.handleInsertComponent`를 직접 호출하도록 간소화.
- **운영 시스템 무결성 및 사이드이펙트 0건 보장**: 12개 컴포넌트 타입(도형, 핀, 테이블, 선, 일러스트, 아이콘, 아톰, 팝업, 아코디언, 그리드, 어드민세팅, 탭)의 속성 인스펙터 패널 표시/동기화 로직 100% 보존.

---

## 2. 시스템 룰 및 연관 스킬 준수 분석 (Rules & Skills Compliance)

| 룰 / 스킬 항목 | 요구사항 및 준수 전략 |
| :--- | :--- |
| **`AGENTS.md` 게이트웨이 1**<br>(운영 무결성) | 기존 `metadata.json`, 화면 HTML, 인스펙터 패널 연동 로직의 실체를 100% 보존하고 동작 왜곡을 원천 차단. |
| **`AGENTS.md` 게이트웨이 3**<br>(사이드이펙트 0건) | 인스펙터 패널 전환 시 다른 컴포넌트(텍스트, 색상, 보더, 패딩 등) 공통 컨트롤 동기화 파이프라인에 간섭 0건 유지. |
| **`AGENTS.md` 게이트웨이 4**<br>(런타임 에러 0건) | 존재하지 않는 DOM 섹션 접근 방지를 위한 옵셔널 체이닝(`?.`) 및 방어 가드 완비. |
| **`AGENTS.md` 게이트웨이 5**<br>(백틱 충돌 에러 0건) | `vctrl_iframe_script.js` 수정 시 파일 전체를 감싸는 백틱 리터럴과의 충돌을 방지하기 위해 내부 백틱(`` ` ``) 일체 금지 및 표준 따옴표만 사용. |
| **`AGENTS.md` 게이트웨이 6**<br>(구문 정적 검증 강제) | 수정 전/후 `scripts/check_syntax.ps1`을 자체 구동하여 V8 VM 스크립트 컴파일 0 Errors 확인 필수. |
| **`workspace-editor-engine`** | 인스펙터 오케스트레이터(`vctrl_inspector.js`)와 서브 인스펙터(`assets/inspector/*`) 간의 책임 분리 규정 준수. |
| **`workspace-editor-safety-process`** | 최소 범위 정밀 타격(Pinpoint Patch), 사전 계획 수립 후 실행. |

---

## 3. 상세 조치 설계 및 코드 명세 (Detailed Architecture & Diff Specifications)

---

### 3.1 [Task 1] `vctrl_inspector.js` :: `_syncComponentTypeProperties` 전략 패턴 리팩토링

#### 📌 문제 현황 (As-Is)
- `_syncComponentTypeProperties(compStyles, editingType)`가 152라인에 걸쳐 12가지 `editingType`을 거대한 단일 `if-else if`로 검사함.
- 도형/핀(Pattern, Arrow, Triangle, Wave, Corner 등)에 대한 복잡한 DOM 조작 로직이 메인 함수 본문에 그대로 노출되어 있음.

#### 💡 해결 설계 (To-Be)
1. **도메인별 순수 핸들러 함수 격리**:
   - `_syncShapeOrPinTypeProps(compStyles)`: 도형/핀 패턴, 배경, 방향, 코너 스타일 동기화 전담
   - `_syncGridTypeProps(compStyles)`: 그리드 타이핑 가드 및 그리드 속성 동기화 전담
   - `_syncAdminSettingsTypeProps(compStyles)`: 어드민 세팅 타이핑 가드 및 동기화 전담
   - `_syncTabTypeProps(compStyles)`: 탭 속성 및 이벤트 바인딩 전담
   - `_syncPopupTypeProps(compStyles)`: 팝업 인스펙터 동기화 전담
2. **`TYPE_SYNC_STRATEGIES` 디스패처 테이블 맵 정의**:
   - 전략 테이블에 도메인 핸들러를 매핑하여 `_syncComponentTypeProperties` 본문은 단 15줄 내외의 깔끔한 디스패처로 경량화 ($152 \text{ lines} \rightarrow 15 \text{ lines}$).

```javascript
// [신규 설계: 도메인별 순수 핸들러 함수]
function _syncShapeOrPinTypeProps(compStyles) {
    if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'block';
    if (window.InspectorShapes && typeof window.InspectorShapes.sync === 'function') {
        window.InspectorShapes.sync(compStyles);
    }
    if (DOM.textPropSection && !compStyles.isImage && !compStyles.isMultiSameType) {
        DOM.textPropSection.style.display = 'block';
    }

    const patternGroup = document.getElementById('shape-pattern-type-group');
    const bgColorGroup = document.getElementById('shape-bg-color-group');
    const bgOpacityGroup = document.getElementById('shape-bg-opacity-group');
    const isPattern = (compStyles.shapeType === 'pattern');
    
    if (patternGroup) {
        patternGroup.style.display = isPattern ? 'block' : 'none';
        if (isPattern && compStyles.patternType && typeof window._syncPatternVisualBtns === 'function') {
            window._syncPatternVisualBtns(compStyles.patternType);
        }
    }
    if (bgColorGroup) bgColorGroup.style.display = isPattern ? 'none' : 'grid';
    if (bgOpacityGroup) bgOpacityGroup.style.display = isPattern ? 'none' : 'block';

    const cornerGroup = document.getElementById('shape-corner-style-group');
    const arrowGroup = document.getElementById('shape-arrow-direction-group');
    const waveGroup = document.getElementById('shape-wave-direction-group');
    const isRect = (compStyles.shapeType === 'rect' || compStyles.shapeType === 'webpage' || compStyles.id === 'v4-shape-rect' || compStyles.id === 'v4-shape-webpage');
    const isArrowOrTriangle = (compStyles.shapeType === 'arrow' || compStyles.id === 'v4-shape-arrow' || compStyles.shapeType === 'triangle' || compStyles.id === 'v4-shape-triangle');
    const isWave = (compStyles.shapeType === 'wave' || compStyles.id === 'v4-shape-wave' || (compStyles.classList && compStyles.classList.includes('v4-shape-wave')));

    if (cornerGroup) cornerGroup.style.display = isRect ? 'block' : 'none';
    if (arrowGroup) {
        arrowGroup.style.display = isArrowOrTriangle ? 'block' : 'none';
        if (isArrowOrTriangle && typeof window._syncArrowDirBtns === 'function') {
            window._syncArrowDirBtns(compStyles.direction || compStyles.arrowDir || 'right');
        }
    }
    if (waveGroup) {
        waveGroup.style.display = isWave ? 'block' : 'none';
        if (isWave && typeof window._syncWaveDirBtns === 'function') {
            window._syncWaveDirBtns(compStyles.waveDir || 'horizontal');
        }
    }
}

// [경량화된 메인 디스패처]
function _syncComponentTypeProperties(compStyles, editingType) {
    if (editingType === 'pin' || editingType === 'shape') {
        return _syncShapeOrPinTypeProps(compStyles);
    }
    if (ATOM_PROP_SYNC_MAP[editingType]) {
        return _syncAtomTypeProps(compStyles, editingType);
    }
    const strategy = TYPE_SYNC_STRATEGIES[editingType];
    if (typeof strategy === 'function') {
        return strategy(compStyles);
    }
    if (compStyles && (compStyles.isCheckbox || compStyles.isRadio)) {
        return _syncCheckboxRadioTypeProps(compStyles);
    }
}
```

---

### 3.2 [Task 2] `vctrl_iframe_script.js` :: `handleInsertComponent` 레거시 프록시 래퍼 정리

#### 📌 문제 현황 (As-Is)
- `assets/vctrl_iframe_inserter.js`에서 컴포넌트 삽입 로직을 온전히 전담(`window.handleInsertComponent`)하고 있음에도, `assets/vctrl_iframe_script.js` L950에 레거시 프록시 함수(`function handleInsertComponent(d) { return window.handleInsertComponent(d); }`)가 남아있음.
- 이로 인해 진단 도구에서 "중복 로직" 경고가 발생함.

#### 💡 해결 설계 (To-Be)
1. `assets/vctrl_iframe_script.js` L950의 프록시 함수 `handleInsertComponent(d)` 완전 제거.
2. `v4IframeCoreHandlers` 메시지 레지스트리에서 `window.handleInsertComponent`를 직접 호출하도록 안전하게 인라인화:
```javascript
        'LF_INSERT_COMPONENT': function(d) {
            if (typeof window.handleInsertComponent === 'function') {
                return window.handleInsertComponent(d);
            }
        },
        'LF_INSERT_V4_COMP': function(d) {
            if (typeof window.handleInsertComponent === 'function') {
                return window.handleInsertComponent(d);
            }
        },
```
- **효과**: 불필요한 프록시 래퍼 제거, 전역 스코프 중복 선언 해소, 게이트웨이 5(백틱 충돌 방지) 완벽 준수.

---

## 4. 단계별 실행 로드맵 (Step-by-Step Execution Plan)

| 단계 | 작업 내용 | 대상 파일 | 검증 기준 |
| :---: | :--- | :--- | :--- |
| **Phase 1** | `_syncComponentTypeProperties` 전략 패턴 도메인 핸들러 분리 및 디스패처 경량화 | `assets/vctrl_inspector.js` | 150라인 이상 거대 함수 0건 달성 |
| **Phase 2** | `handleInsertComponent` 중복 프록시 함수 제거 및 디스패처 직접 호출 정리 | `assets/vctrl_iframe_script.js` | 백틱 충돌 0건, 중복 함수 목록에서 완전 제거 |
| **Phase 3** | 정적 구문 및 브래킷 무결성 검증 | `scripts/check_syntax.ps1` | V8 VM 100% 컴파일 통과 (0 Errors) |
| **Phase 4** | 시스템 전체 정밀 진단 재수행 | `scripts/diagnose_system.ps1` | 고복잡도 함수 0건, 중복 함수 0건 확인 |

---

## 5. 검증 및 안전성 확보 방안 (Verification & Safety Protocols)

1. **정적 무결성 검증**:
   - `scripts/check_syntax.ps1`을 실행하여 모든 브래킷 밸런스 및 V8 VM 스크립트 컴파일 0 Errors 확인.
2. **진단 도구 전수 재검증**:
   - `scripts/diagnose_system.ps1`을 구동하여 Criterion 3(중복 코드) 및 Criterion 4(150라인 초과 거대 함수)가 모두 클리어되었음을 정량적으로 확인.
3. **런타임 기능 무결성 시나리오**:
   - [시나리오 1] 일반 도형(Rect, Wave, Arrow, Triangle) 클릭 시 shape-inspector-section이 정상 표시되고 방향/코너/배경색 옵션이 정상 동기화되는지 확인.
   - [시나리오 2] 버튼/뱃지/토글 등 V4 아톰 클릭 시 해당 아톰 인스펙터 패널이 정상 열리는지 확인.
   - [시나리오 3] 그리드 테이블/어드민 세팅 컴포넌트 선택 시 컬럼 및 라벨 인스펙터가 정상 작동하는지 확인.
   - [시나리오 4] 왼쪽 툴바에서 컴포넌트 드래그 앤 드롭 또는 클릭 삽입(`LF_INSERT_COMPONENT`)이 정상 작동하는지 확인.
