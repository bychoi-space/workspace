# 다중 중첩 그룹 최상위 선택 표준화 및 인터랙션 최적화 계획서

작성일자: 2026-09-03  
상태: 승인 완료 / 실행 대기 (Scheduled for Execution)

---

## 1. 배경 및 문제 정의

현재 에디터에서 다중 중첩 그룹(Nested Group: 그룹 내부에 또 다른 서브그룹이 존재하는 구조)이 캔버스에 배치되어 있을 때, **어느 영역을 클릭하느냐에 따라 선택 대상이 일관되지 않는 문제**가 발생하고 있습니다.

- **원인 분석 ([vctrl_iframe_script.js:L571-L578](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js#L571-L578))**:
  ```javascript
  let parent = c.parentElement.closest('.lf-component');
  while (parent) {
      if (parent.classList.contains('text-marker') || parent.classList.contains('pin-marker')) break;
      c = parent;
      // ⚠️ 문제 원인: 부모로 거슬러 올라가다가 '가장 먼저 만난 그룹'에서 탐색을 중단함
      if (c.classList.contains('lf-group')) break; 
      parent = c.parentElement.closest('.lf-component');
  }
  ```
  - 내부 서브그룹에 속한 자식 요소(아이콘, 텍스트 등)를 클릭하면: 첫 번째 만난 서브그룹에서 탐색이 멈춰 **소규모 그룹**이 선택됨.
  - 최상위 그룹에 직접 속한 여백이나 요소를 클릭하면: 곧바로 최상위 그룹에 도달하여 **전체 그룹**이 선택됨.
  - 이로 인해 사용자는 "어디를 누르면 전체가 잡히고, 어디를 누르면 일부만 잡히는" 불규칙하고 혼란스러운 경험을 겪게 되며, 이동이나 정렬 시 그룹 레이아웃이 깨질 위험이 있습니다.

---

## 2. 해결 목표 및 핵심 원칙

1. **단일 클릭 일관성 보장 (사용자 요구사항 반영)**:
   - 다중 중첩 여부와 상관없이, 그룹의 어느 부위를 일반 클릭(Single Click)하든 **무조건 최종 최상위 그룹(Root Group)**이 선택되도록 수정합니다.
   - 마키 드래그 선택(이미 최상위 그룹만 선택되도록 구현됨)과 마우스 클릭 선택의 동작 기준을 100% 일치시킵니다.
2. **내부 세부 요소 편집성 보완 (Figma / PowerPoint 표준 인터랙션)**:
   - 최상위 그룹만 잡힐 경우 내부 텍스트나 아이콘의 부분 수정을 위해 매번 `Ungroup`을 해야 하는 불편을 원천 방지하기 위해:
     - **`Ctrl + 클릭` (Mac: `Cmd + 클릭`)**: 그룹 계층을 뚫고 마우스 포인터가 가리킨 **최하위 개별 요소(Leaf Atom/Component) 즉시 직접 선택 (Deep Select)**
     - **`더블 클릭`**: 그룹 내 텍스트 박스인 경우 즉시 **인플레이스 텍스트 편집 모드 포커스**, 일반 컴포넌트인 경우 **해당 자식 요소로 선택 좁히기(Drill-down)**

---

## 3. 세부 설계 및 사이드이펙트 방지 대책

### 1) 부모 탐색 알고리즘 교정 ([vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js))
- 일반 클릭 시: 부모 체인을 따라 올라가며, 텍스트 마커/핀 마커가 아닌 한 **가장 바깥쪽 최상위 `.lf-component` (또는 최상위 `.lf-group`)까지 끝까지 거슬러 올라간 후 최종 선택**.
- `Ctrl` (또는 `Cmd`) 키가 눌린 경우: 부모 탐색을 건너뛰고, 마우스가 타겟팅한 최하위 컴포넌트(`e.target.closest('.lf-component')`)를 그대로 유지하여 즉시 단독 선택(또는 `Shift` 동반 시 다중 선택 토글).

### 2) 드래그 안전 가드 ([vctrl_iframe_drag.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_drag.js))
- 반응형 컨테이너(`.pc-content-area`, `.mobile-content-area`) 내에서 요소를 드래그할 때, `window.activeEl.closest('.lf-group')` 내부의 자식 요소인 경우에는 부모 그룹 컨텍스트를 이탈하여 `document.body`로 빠져나오지 않도록 방어 가드를 적용합니다.

### 3) 텍스트 편집 및 더블클릭 파이프라인
- 더블클릭 이벤트 리스너([vctrl_iframe_script.js:L680-L686](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js#L680-L686))에서 `.v4-editable-cell`에 대한 인플레이스 텍스트 포커스(`focus()`)가 최우선 실행되도록 기존 동작을 안전하게 유지하고, 텍스트가 아닌 컴포넌트 더블클릭 시 자식 컴포넌트 선택 드릴다운을 지원합니다.

---

## 4. 작업 대상 파일 목록 (Target Files)

### Iframe Client Script Layer

#### 1. [assets/vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js)
- **`mousedown` 이벤트 핸들러 교정 (Lines 567~628)**:
  - `e.ctrlKey || e.metaKey` 감지 분기 추가 (`isDeepSelect`).
  - 일반 클릭 시: 중간 `.lf-group`에서 `break`하지 않고, 최상위 Root `.lf-component`까지 루프를 완주하도록 수정.
  - `isDeepSelect` 활성화 시: 상위 부모로 올라가지 않고 클릭된 최하위 컴포넌트를 유지하여 직접 선택.
- **`dblclick` 이벤트 핸들러 보강 (Lines 680~686)**:
  - 텍스트 셀 우선 포커스를 보존하면서, 비텍스트 컴포넌트 더블클릭 시 해당 자식 컴포넌트 단독 선택(Drill-down) 및 인스펙터 동기화.

#### 2. [assets/vctrl_iframe_drag.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_drag.js)
- 드래그 시작(`handleMouseMove` / Line 64) 시, `window.activeEl`이 그룹 내부 요소인 경우 반응형 프레임에서 DOM 분리 이탈이 발생하지 않도록 방어 가드 강화.

---

## 5. 검증 계획 (Verification Plan)

### 수동 및 브라우저 검증 절차
1. **중첩 그룹 단일 클릭 테스트**:
   - 다중 중첩 그룹(예: 최상위 카드 그룹 > 헤더 서브그룹 > 아이콘 + 텍스트)이 있는 스크린 로드.
   - 내부 서브그룹의 아이콘 클릭 → **최상위 전체 그룹이 파란색/초록색 아웃라인으로 일관되게 선택되는지 확인**.
   - 서브그룹 바깥 최상위 그룹의 여백이나 다른 자식 클릭 → **동일하게 최상위 전체 그룹이 선택되는지 확인**.
2. **이동 및 키보드 너지 연동 확인**:
   - 최상위 그룹 선택 상태에서 마우스 드래그 및 방향키 이동 시, 내부 요소들이 분리되지 않고 한 덩어리로 온전히 이동하는지 검증.
3. **직접 선택(`Ctrl + 클릭`) 테스트**:
   - `Ctrl` 키를 누른 채 내부 아이콘 또는 도형 클릭 → 최상위 그룹이 아닌 **해당 아이콘만 정확히 단독 선택**되는지 확인.
   - 오른쪽 인스펙터에 해당 아이콘의 스타일 속성이 정상 반영되는지 확인.
4. **더블클릭 텍스트 편집 테스트**:
   - 그룹 내부 텍스트 박스를 더블클릭했을 때 그룹 선택이 풀리지 않고 **즉시 텍스트 커서가 깜빡이며 입력 모드로 진입**하는지 확인.
5. **구문 및 정적 오류 검사**:
   - PowerShell에서 `scripts/check_syntax.ps1` 실행하여 JS 구문 에러가 일체 없음을 확인.
