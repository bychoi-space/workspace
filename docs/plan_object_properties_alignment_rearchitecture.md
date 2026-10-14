# [마스터 계획서] 오브젝트 프로퍼티 정렬(ALIGNMENT) 엔진 정상화 및 반응형 뷰포트 통합 아키텍처 설계서

---

## 📌 1. Executive Summary (개요 및 목적)

본 문서는 Workspace Editor의 오브젝트 프로퍼티(OBJECT PROPERTIES) 내 핵심 공통 기능인 **'ALIGNMENT(정렬)' 서브시스템의 구조적 결함을 전면 해소**하고, **단일/다중 오브젝트 정렬 및 [반응형 (PC+MOBILE)] 프레임 정렬을 100% 픽셀 퍼펙트로 정상화**하기 위한 마스터 계획서입니다.

### 🎯 핵심 해결 과제
1. **단일 오브젝트 선택 시 ALIGNMENT 패널 복원**:
   - 기존에 `selIds.length > 1`로 제한되어 단일 오브젝트 선택 시 통째로 숨겨지던 정렬 패널을 항상 노출하도록 보정.
   - 단일 오브젝트에서도 캔버스 또는 소속 프레임 기준 6대 정렬(`Left, Center, Right, Top, Middle, Bottom`)을 직관적으로 조작할 수 있도록 UI/엔진 일원화.
2. **반응형 스크린(PC+Mobile) 뷰포트 기반 정렬 수학 정상화**:
   - PC 프레임(`.pc-content-inner`)의 전체 스크롤 높이(`offsetHeight: 1500px+`)로 수직 중앙/하단이 계산되어 오브젝트가 화면 밖으로 추락하던 치명적 오류 척결.
   - 현재 스크롤 위치(`scrollTop`)와 뷰포트 높이(`clientHeight: 810px`)를 결합한 **실제 보이는 화면 기준 정렬 수학(Visible Viewport Alignment)** 구현.
3. **컨테이너 판별식 Fallback의 모바일 편향 차단**:
   - PC 프레임 내 오브젝트임에도 컨테이너 판별 실패 시 모바일(360px)로 잘못 지정되어 좌측으로 쏠리던 버그 원천 차단.
4. **다중 오브젝트 정렬 후 핸들/선택 테두리/인스펙터 실시간 동기화**:
   - 정렬 후 DOM의 `style.left/top`만 바뀌고 드래그 핸들(`.lf-drag-handle`), 리사이저(`.lf-resizer`), 선택 박스(`SelectionAdorner`), 인스펙터 속성(X, Y)이 갱신되지 않던 동기화 단절 현상 완전 해소.

---

## 🔍 2. 심층 원인 분석 (Deep Root Cause Analysis)

### 2.1 결함 1: 단일 오브젝트 선택 시 인스펙터의 'ALIGNMENT' 패널 강제 은닉
- **발생 위치**:
  - `assets/vctrl_inspector.js` Line 914:
    ```javascript
    if (alignBar) alignBar.style.setProperty('display', (selIds.length > 1) ? 'block' : 'none', 'important');
    ```
  - `assets/vctrl_grouping.js` Line 459:
    ```javascript
    if (alignBar) alignBar.style.display = activeIds.length > 1 ? 'block' : 'none';
    ```
- **원인 메커니즘**:
  - `selIds.length > 1` (2개 이상 선택) 조건으로 인해 사용자가 단일 오브젝트(1개)를 선택하면 ALIGNMENT 패널이 무조건 `display: none`으로 강제 은닉됩니다.
  - 이는 `AGENTS.md` 557라인의 "단일 선택(`items.length === 1`) 및 다중 선택(`items.length > 1`) 모두에서 정렬 완벽 지원" 대원칙에 정면으로 위배됩니다.

### 2.2 결함 2: [반응형] 전체 컨텐츠 높이(1500px+) 기준 계산 및 스크롤 무시 버그
- **발생 위치**: `assets/vctrl_responsive_multiselect.js` Line 224-283
- **원인 메커니즘**:
  - PC 프레임(`.pc-content-inner`)은 긴 스크롤 문서로 `min-height: 1302px` 혹은 `1500px~3000px`을 갖습니다.
  - 기존 코드:
    ```javascript
    boundW = targetContainer.offsetWidth || 360;
    boundH = targetContainer.offsetHeight || targetContainer.clientHeight || 810;
    ```
  - `targetContainer.offsetHeight`를 우선 참조하여 `boundH`가 **1500px+**가 됩니다.
  - 수직 중앙(`middle`) 정렬 시:
    $$\text{targetT} = \text{boundT} + \frac{\text{boundH} - \text{item.h}}{2} \approx \frac{1500 - 50}{2} = 725\text{px}$$
    사용자가 보고 있는 뷰포트(0~810px) 영역을 벗어나 스크롤 아래 보이지 않는 위치로 오브젝트가 곤두박질칩니다.
  - 하단(`bottom`) 정렬 시:
    $$\text{targetT} = 1500 - 50 = 1450\text{px}$$
    문서 최하단 끝으로 날아가 버립니다.
  - 또한, 현재 스크롤 위치(`scrollContainer.scrollTop`)를 전혀 고려하지 않고 `boundT = 0`으로 고정되어 있어, 스크롤을 내린 상태(`scrollTop = 500px`)에서 `top` 정렬을 누르면 `targetT = 0`이 되어 화면 위쪽 보이지 않는 곳으로 사라집니다.

### 2.3 결함 3: 컨테이너 Fallback의 모바일 편향 오류
- **발생 위치**: `assets/vctrl_responsive_multiselect.js` Line 227
  ```javascript
  const targetContainer = (window.ResponsiveFrameUtils && typeof window.ResponsiveFrameUtils.getContainer === 'function')
      ? window.ResponsiveFrameUtils.getContainer(el)
      : (doc.querySelector('.mobile-content-inner') || doc.querySelector('.pc-content-inner'));
  ```
- **원인 메커니즘**:
  - `targetContainer`를 찾지 못할 때 fallback 순서가 `.mobile-content-inner`가 먼저 위치하여, PC 프레임 내 오브젝트임에도 불구하고 모바일 기준(`boundW: 360px`)으로 정렬되어 오브젝트가 좌측 180px 위치로 심하게 쏠립니다.

### 2.4 결함 4: 다중 정렬 후 조작 인터페이스(핸들, 아도너, 인스펙터) 미갱신
- **발생 위치**: `assets/vctrl_responsive_multiselect.js` Line 480-496
- **원인 메커니즘**:
  - 다중 오브젝트 정렬 연산 후 `item.el.style.left`와 `style.top`만 갱신하고, 드래그 핸들(`.lf-drag-handle`)과 리사이저(`.lf-resizer`) 갱신 함수인 `window.updateHandles(el)` 및 `window.SelectionAdorner.update()`를 호출하지 않았습니다.
  - 이로 인해 조작 핸들이 이전 위치에 그대로 붕 떠서 분리되고, 선택 테두리가 어긋나며, 부모 창 인스펙터(X/Y 좌표)도 갱신되지 않았습니다.

### 2.5 결함 5: 부모 창 `alignSelected`의 `activeIds` 누락 취약점
- **발생 위치**: `assets/vctrl_grouping.js` Line 477-485
- **원인 메커니즘**:
  - `bringFrontSelected` 등 다른 함수에는 `activeIds`가 비어있을 때 `window.state.selectedComponent.id`로 fallback하는 안전 가드가 있으나, `alignSelected`에는 이 가드가 누락되어 단일 선택 상태에서 버튼을 클릭하면 아무 동작도 하지 않는 경우가 발생했습니다.

---

## 📐 3. 아키텍처 설계 및 표준 사양 (Architectural Design)

### 3.1 정렬 대상별 기준 규격 매트릭스 (Alignment Matrix)

```
┌─────────────────┬──────────────────────┬────────────────────────────────────────┬───────────────────────┐
│ 선택 상태        │ 화면 템플릿          │ 정렬 기준 영역 (Bounding Area)          │ 지원 버튼             │
├─────────────────┼──────────────────────┼────────────────────────────────────────┼───────────────────────┤
│ 단일 오브젝트    │ 일반 캔버스          │ 전체 캔버스 (1600 x 900px)             │ 6대 정렬 (좌/우/상/하/중) │
│ (count === 1)   │ [반응형] PC 프레임   │ PC 가시 뷰포트 (1160 x 810px + sTop)   │ 6대 정렬 (분배 비활성)│
│                 │ [반응형] 모바일      │ 모바일 가시 뷰포트 (360 x 810px + sTop)│ 6대 정렬 (분배 비활성)│
├─────────────────┼──────────────────────┼────────────────────────────────────────┼───────────────────────┤
│ 다중 오브젝트    │ 모든 템플릿          │ 선택된 오브젝트들의 전체 Bounding Box   │ 6대 정렬 +            │
│ (count >= 2)    │                      │ (minX, minY ~ maxX, maxY) 상호 상대 정렬│ 2대 균등 분배(가로/세로)│
└─────────────────┴──────────────────────┴────────────────────────────────────────┴───────────────────────┘
```

### 3.2 반응형 가시 뷰포트 정렬 수학 공식 (Visible Viewport Math)

반응형 프레임 내 단일 오브젝트 정렬 시, 스크롤 컨테이너의 물리적 뷰포트 및 스크롤 위치를 100% 동기화합니다.

```
1. 수평 기준 (Horizontal):
   - boundL = 0 (소속 프레임 inner 내부 상대좌표)
   - boundW = targetContainer.offsetWidth || (isPc ? 1160 : 360)
   - Left   : targetL = boundL
   - Center : targetL = boundL + Math.round((boundW - item.w) / 2)
   - Right  : targetL = boundL + (boundW - item.w)

2. 수직 기준 (Vertical - Visible Viewport Alignment):
   - sTop = scrollContainer.scrollTop || 0
   - vHeight = scrollContainer.clientHeight || 810
   - Top    : targetT = sTop
   - Middle : targetT = sTop + Math.round((vHeight - item.h) / 2)
   - Bottom : targetT = sTop + (vHeight - item.h)
```

---

## 🛠️ 4. 상세 파일별 구현 계획 (Implementation Steps)

### Step 1: `assets/vctrl_inspector.js` 패널 노출 조건 보정
- **수정 위치**: `_syncSelectionActionBar(compStyles)` (Line 914 부근)
- **작업 내용**:
  - `selIds.length > 1` -> `selIds.length >= 1 || !!(compStyles && compStyles.id)` 로 보정하여 단일 오브젝트 선택 시에도 ALIGNMENT 패널 노출.
  - 단일 선택 시 수평/수직 분배 버튼(`btn-align-distribute-h`, `btn-align-distribute-v`)은 비활성화(`opacity: 0.35`, `pointer-events: none`) 처리하여 사용자 오작동 방지.

### Step 2: `assets/vctrl_grouping.js` UI 및 트리거 가드 보정
- **수정 위치**: `updateSelectionUI` (Line 458 부근) & `alignSelected` (Line 477 부근)
- **작업 내용**:
  - `updateSelectionUI`: `activeIds.length >= 1` 일 때 `alignBar.style.display = 'block'`.
  - `alignSelected`: `activeIds` 수집 시 단일 선택 fallback 가드 추가:
    ```javascript
    let activeIds = getEffectiveSelectedIds();
    if ((!activeIds || activeIds.length === 0) && window.state && window.state.selectedComponent && window.state.selectedComponent.id) {
        activeIds = [window.state.selectedComponent.id];
    }
    if (!activeIds || activeIds.length < 1) return;
    ```

### Step 3: `assets/vctrl_responsive_multiselect.js` 정렬 엔진 코어 재구축
- **수정 위치**: `window.v4MessageHandlers['LF_ALIGN_SELECTED']` (Line 148~496)
- **작업 내용**:
  1. **단일 오브젝트 정렬 (`items.length === 1`)**:
     - `ResponsiveFrameUtils`를 통한 프레임 타입('pc', 'mobile') 및 컨테이너/스크롤 영역 정확한 탐색.
     - 가시 뷰포트 높이(`vHeight`) 및 현재 스크롤(`sTop`) 기반 수학 적용.
     - 정렬 완료 후 `window.updateHandles(item.el)` 및 `notifyParent({ type: 'LF_COMP_SELECTED', ... })` 호출로 부모 인스펙터 동기화.
  2. **다중 오브젝트 정렬 (`items.length > 1`)**:
     - 선택 요소들의 상호 상대 정렬(Bounding Box 기준) 수행.
     - 정렬 루프 완료 후 모든 대상 요소에 대해 `window.updateHandles(item.el)` 실행하여 핸들/리사이저 즉시 스냅.
     - `SelectionAdorner.update()` 호출로 다중 선택 테두리 실시간 갱신.
     - 부모 창에 인스펙터 동기화 알림 발송.
  3. **백틱 충돌 0건 원칙 엄격 준수**:
     - `vctrl_responsive_multiselect.js`는 파일 전체가 백틱 문자열로 감싸져 있으므로 내부에서 중첩 백틱 및 변수 보간(`${...}`) 사용 전면 배제, 표준 따옴표와 `+` 결합만 사용.

---

## 🔒 5. 검증 및 안전 방어 계획 (Verification Protocols)

1. **7대 필수 게이트웨이 준수**:
   - 운영 무결성 100% 보존.
   - 백틱 충돌 0건 (`SyntaxError` 원천 차단).
   - 브래킷/구문 무결성 100% 보장.
2. **자동 정적 구문 검증 강제 실행**:
   - `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1` 구동하여 전체 파일 0 Errors 검증.
3. **시나리오별 동작 검증**:
   - **시나리오 1**: 단일 오브젝트 선택 시 ALIGNMENT 패널 노출 및 캔버스/프레임 6대 정렬 정상 작동 확인.
   - **시나리오 2**: [반응형 (PC+Mobile)] PC 프레임 내 오브젝트 생성 후 좌/우/중앙/상/하 정렬 시 뷰포트 내 정확한 안착 확인 (1500px 추락 현상 0건).
   - **시나리오 3**: 다중 오브젝트 선택 후 정렬 시 핸들, 리사이저, 선택 박스, 인스펙터 X/Y 좌표가 100% 일치하는지 확인.
   - **시나리오 4**: 단축키 `Ctrl + 1~6` 및 `Alt + 1~6` 연동 무결성 확인.
