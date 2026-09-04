# 오브젝트 이동·크기조절 핸들 분리 계획서 (Phase 1)
## Phase 1: 비주얼 완전 분리 및 인터랙션 검증 (Zero-Risk Visual Decoupling)

작성일자: 2026-09-04  
상태: 실행 완료 (Completed)  
관련 계획서: [Phase 2 코어 엔진 영구 클린업 계획서](file:///c:/Users/sisun/ai_work/docs/plan_remove_handles_phase2_engine_cleanup.md)

---

## 1. 배경 및 목적

### 1) 배경
- 현재 에디터 화면에서 오브젝트에 마우스 호버(`:hover`)를 하거나 클릭하여 선택(`.selected`)하면:
  - 오브젝트 좌측 상단에 파란색 원형 **이동 버튼 (`.lf-drag-handle`)** 노출
  - 오브젝트 우측 하단에 파란색 원형 **크기 조절 버튼 (`.lf-resizer`)** 노출
- **사용자 요구사항**:
  - 이동 버튼은 과거 레거시 인터페이스로, 현재는 **오브젝트 본체 드래그** 또는 **키보드 방향키 이동**이 완벽하게 지원되므로 시각적 노이즈에 불과함.
  - 크기 조절 버튼 또한 우측 인스펙터의 수치(`Width / Height`) 직접 입력을 기본으로 통일하며, 구형 점 핸들을 우선 화면에서 걷어내길 희망함.
- **Phase 1의 핵심 목표**:
  - 시스템 전반(스크린 저장, Undo/Redo, 텍스트 자동 핏, 드래그 엔진 등)에 걸쳐 연결된 복잡한 JS 코어를 섣불리 훼손하지 않고,
  - **CSS 레벨에서 두 요소를 100% 완전 은폐(`display: none !important`)**하여 마우스 클릭/호버 트리거 자체를 물리적으로 무력화함.
  - 이를 통해 **시스템 오류 리스크 0%** 상태에서 오브젝트 본체 드래그, 키보드 이동, 인스펙터 크기 조절 인터랙션을 즉시 실사용 체감하고 검증함.

---

## 2. 해결 원칙 및 세부 설계

### 1) 완전 비노출 및 마우스 이벤트 차단
- `.lf-drag-handle`과 `.lf-resizer`에 `display: none !important;`를 전역 적용.
- `display: none`이 적용되면 브라우저 렌더 트리에서 제외되므로:
  - 마우스 호버 시 시각적으로 전혀 나타나지 않음.
  - 마우스 클릭 시 `e.target.closest('.lf-drag-handle')`나 `e.target.closest('.lf-resizer')`가 일체 잡히지 않고, 오직 컴포넌트 본체(`.lf-component`)로만 이벤트가 전달됨.

### 2) 본체 드래그 이동 무결성 유지
- `vctrl_iframe_script.js` 라인 672의 드래그 분기:
  ```javascript
  else if (h || (c && !e.target.closest('td, th'))) {
      if (window.V4DragResizeEngine) {
          window.V4DragResizeEngine.handleMouseDown(e, h, r, d, c);
      }
  }
  ```
  - `h`가 `null`이어도 `c && !e.target.closest('td, th')`에 의해 컴포넌트 본체 클릭 드래그가 100% 정상 발동됨.
  - 키보드 화살표 키 이동(Nudge)은 컴포넌트의 `.selected` 클래스 유무로만 판단하므로 완벽하게 동작함.

### 3) 삭제 버튼(`.lf-delete-trigger`) 및 포트(`.lf-connector-port`) 보존
- 사용자가 요청하지 않은 우측 상단의 삭제 단추(`×`) 및 커넥터 연결 포트는 정상적으로 노출 및 작동하도록 건드리지 않음.

### 4) 엔진 의존성 무손상 (Zero-Breakage)
- `initHandles()`, `updateHandles()`, `vctrl_text_measurer.js`, `vctrl_undo.js`, `vctrl_core.js` 등에서 해당 클래스를 조회하더라도 에러 없이 기존 로직이 평상시처럼 안전하게 통과됨.

---

## 3. 작업 대상 파일 및 변경 사항 (Target Files)

### 1. [assets/vctrl_iframe_styles.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_styles.js)
- `.lf-drag-handle`, `.lf-resizer` 스타일 선언부 수정:
  ```css
  /* ==========================================================================
     PHASE 1: Drag Handle & Resizer Complete Visual Hiding
     ========================================================================== */
  .lf-drag-handle,
  .lf-resizer {
      display: none !important;
      pointer-events: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
  }
  ```
- 기존의 `:hover`, `.selected` 시 `opacity: 1` 처리되던 불필요한 규칙 오버라이드 및 정리.

### 2. [assets/style.css](file:///c:/Users/sisun/ai_work/assets/style.css)
- 부모 창 및 공통 스타일시트에 잔존하는 `.lf-drag-handle`, `.lf-resizer` 규칙에 `display: none !important;` 반영.

### 3. [enhanced_v4/style_v4.css](file:///c:/Users/sisun/ai_work/enhanced_v4/style_v4.css)
- Enhanced V4 스타일시트 내 `.lf-drag-handle` 블록(Lines 267~299)에 `display: none !important;` 적용.

---

## 4. 검증 계획 (Verification Plan)

### 1) 비주얼 및 마우스 호버 검증
1. 캔버스에 사각형, 도형, 텍스트박스, 이미지, 테이블, 그룹 등 다양한 오브젝트 배치.
2. 마우스를 오브젝트 위로 올렸을 때(Hover), 좌측 상단 파란색 이동 버튼과 우측 하단 크기 조절 점이 **일체 보이지 않는지 확인**.
3. 오브젝트를 클릭하여 파란색/초록색 선택 테두리가 활성화되었을 때도 **두 버튼이 나타나지 않는지 확인**.
4. 우측 상단 삭제 버튼(`×`)은 정상적으로 호버/선택 시 나타나는지 확인.

### 2) 인터랙션 무결성 검증
1. **마우스 본체 드래그**: 오브젝트 내부를 클릭하고 마우스를 끌었을 때 지연 없이 매끄럽게 위치가 이동하는지 확인.
2. **스마트 가이드 자석 스냅**: 드래그 이동 중 핑크색 가이드선과 스냅 동작이 정상 작동하는지 확인.
3. **키보드 방향키 이동**: 방향키(`ArrowUp/Down/Left/Right`) 및 `Shift + 방향키`(10px 이동)가 칼같이 동작하는지 확인.
4. **인스펙터 크기 조절**: 우측 사이드바 및 플로팅 카드의 `Width` / `Height` 수치를 변경했을 때 오브젝트 크기가 즉각 반영되는지 확인.
5. **실행 취소 (Undo/Redo)**: 이동 후 `Ctrl + Z` 시 이전 위치로 정확히 되돌아가는지 확인.
6. **복사/붙여넣기 및 전체저장**: `Ctrl + C / Ctrl + V`, `Ctrl + S` 저장 시 오류가 발생하지 않는지 확인.
7. **콘솔 오류 검사**: 브라우저 개발자 도구 콘솔에 `SyntaxError`나 `TypeError`가 0건인지 확인.
