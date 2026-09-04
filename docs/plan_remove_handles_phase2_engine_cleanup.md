# 오브젝트 이동·크기조절 핸들 분리 계획서 (Phase 2)
## Phase 2: 코어 엔진 전면 제거 및 영구 클린업 (Core Engine Clean-up & Architecture Modernization)

작성일자: 2026-09-04  
상태: 실행 완료 (Completed)  
관련 계획서: [Phase 1 비주얼 완전 분리 계획서](file:///c:/Users/sisun/ai_work/docs/plan_remove_handles_phase1_visual_decoupling.md)

---

## 1. 배경 및 목적

### 1) 배경
- Phase 1을 통해 화면 상에서 이동 핸들(`.lf-drag-handle`)과 우측 하단 크기 조절 점(`.lf-resizer`)을 시각적으로 숨기고 본체 드래그 및 인스펙터 수치 조절 흐름을 안정적으로 검증한 후,
- **최종적으로 소스 코드에 잔존하는 불필요한 DOM 생성 구문, 템플릿 결합 문자열, 미사용 스타일 및 이벤트 분기를 완전히 영구 제거(Clean-up)**하여 에디터 엔진을 경량화하고 소스 코드의 가독성과 유지보수성을 극대화합니다.

### 2) 핵심 설계 방향 및 미래 확장성 고려 (8-Point Transform Handles)
- **수치 기반 정밀 조절의 단일화**: 현재는 우측 인스펙터의 `Width / Height`를 통한 수치 제어로 통일합니다.
- **향후 확장성 보존**: 사용자가 언급한 "추후 피그마/파워포인트 스타일의 8포인트 트랜스폼 핸들(Bounding Box Handles)" 도입 요구가 발생할 경우를 대비하여, `vctrl_iframe_drag.js`의 리사이즈 스케일링 연산 코어(`startW + dx / scale`, 그룹 자식 비율 스케일링 등)는 파괴하지 않고 독립 모듈로 정돈하여 보존합니다.

---

## 2. 세부 설계 및 리팩토링 항목

### 1) 런타임 DOM 주입 중단 ([vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js))
- **`window.initHandles()` (Lines 3382~3400)**:
  - 컴포넌트 순회 시 `:scope > .lf-drag-handle` 및 `:scope > .lf-resizer`를 생성하여 `appendChild`하는 코드 블록 영구 제거.
  - 우측 상단 삭제 버튼(`.lf-delete-trigger`) 및 상하좌우 커넥터 포트(`.lf-connector-port`)만 깔끔하게 주입하도록 축소.
- **`window.updateHandles()` (Lines 510~529)**:
  - `const drag = c.querySelector(':scope > .lf-drag-handle');` 및 top/left 위치 클램핑 연산 코드 제거.
  - 삭제 버튼(`.lf-delete-trigger`)의 오프셋 조정만 담당하도록 최적화.

### 2) 컴포넌트 생성 템플릿 마크업 정리 ([vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js))
- 도형, 아톰, 테이블, 그룹 생성 템플릿 문자열에서 `<div class="lf-drag-handle">...</div>` 및 `<div class="lf-resizer"></div>` 제거:
  - Line 1067 / 1073: 기본 도형 추가 시 핸들 마크업 제거.
  - Line 1112 / 1118: 카드 및 아톰 추가 시 핸들 마크업 제거.
  - Line 1295 / 1302: 테이블 삽입 시 핸들 마크업 제거.
  - Line 1360: V4 컴포넌트 삽입 템플릿에서 제거.
  - Line 2797: 그룹핑(`LF_CREATE_GROUP`) 생성 템플릿에서 제거.

### 3) 이벤트 리스너 파이프라인 정돈 ([vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js))
- **`mousedown` (Line 567)**:
  - `let h = ...`, `let r = ...` 탐색 제거 및 `let d = e.target.closest('.lf-delete-trigger'), c = e.target.closest('.lf-component');`로 간소화.
  - 드래그 시작 분기: `else if (c && !e.target.closest('td, th')) { window.V4DragResizeEngine.handleMouseDown(e, null, null, d, c); }`
- **`dblclick` (Line 688)**:
  - `!targetComp.classList.contains('lf-drag-handle')` 등의 미사용 가드 제거.

### 4) 반응형 핀 마커 템플릿 정리 ([assets/vctrl_responsive_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_responsive_pins.js))
- Line 68: `pin.innerHTML = '<div class="lf-drag-handle">...</div>' + ...`에서 드래그 핸들 마크업 제거.

### 5) 텍스트 피팅 엔진 최적화 ([assets/vctrl_text_measurer.js](file:///c:/Users/sisun/ai_work/assets/vctrl_text_measurer.js))
- Line 251~262: Zero-Drift Guard에서 존재하지 않는 `handle`, `resizer`를 쿼리하던 코드를 정리하고, `delTrigger`만 깔끔하게 보호하도록 리팩토링 (기존 널 가드가 있어 에러는 없으나 코드 정돈).

### 6) 전역 스타일시트 정리 ([assets/vctrl_iframe_styles.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_styles.js))
- 더 이상 DOM에 생성되지 않는 `.lf-drag-handle`, `.lf-resizer` 관련 레거시 CSS 룰(위치, 크기, 컬러, 애니메이션, 그룹용 초록색 등 약 50여 줄) 완전 제거.

### 7) 레거시 스크린 호환성 및 자동 정제 안전망
- 기존에 디스크에 저장된 스크린 HTML 파일들(과거에 저장되어 `<div class="lf-drag-handle">` 등이 포함된 파일)을 로드했을 때:
  - `vctrl_design_system.js` 또는 `initHandles()` 시작 지점에서 기존 스크린의 `.lf-drag-handle, .lf-resizer`를 자동으로 찾아 제거(`.remove()`)하는 원터치 마이그레이션 안전망을 1회 실행하여 과거 스크린도 완벽하게 최신 상태로 정제.

---

## 3. 작업 대상 파일 목록 (Target Files)

| 파일 경로 | 수정 목적 |
| :--- | :--- |
| **[assets/vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js)** | `initHandles`, `updateHandles`, 템플릿 마크업 7곳, `mousedown`/`dblclick` 핸들러 전면 클린업 |
| **[assets/vctrl_iframe_drag.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_drag.js)** | `handleMouseDown` 매개변수 정리, `startResize` 모듈화 보존 |
| **[assets/vctrl_responsive_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_responsive_pins.js)** | 핀 마커 생성 템플릿 내 드래그 핸들 마크업 제거 |
| **[assets/vctrl_text_measurer.js](file:///c:/Users/sisun/ai_work/assets/vctrl_text_measurer.js)** | 오프스크린 텍스트 측정 핸들 숨김 코드 간소화 |
| **[assets/vctrl_iframe_styles.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_styles.js)** | 미사용 `.lf-drag-handle`, `.lf-resizer` CSS 규칙 전면 삭제 |

---

## 4. 검증 계획 (Verification Plan)

### 1) 신규 컴포넌트 생성 무결성 검증
1. 우측 사이드바 라이브러리에서 도형(Rect, Circle, Triangle 등) 추가.
2. 개발자 도구 Element 검사기로 DOM 트리를 확인하여 **내부에 `.lf-drag-handle`이나 `.lf-resizer` 태그가 전혀 생성되지 않았는지 확인**.
3. 생성된 도형을 마우스로 클릭하고 드래그했을 때 부드럽게 이동하는지 확인.

### 2) 레거시 스크린 로드 및 저장 무결성 검증
1. 과거에 생성된 스크린(00_Cover 등)을 에디터에 로드.
2. 로드 시점에 레거시 잔여 핸들이 자동 정제되어 깨끗한 DOM으로 변환되는지 확인.
3. 전체 저장(`Ctrl + S`) 수행 후 저장된 HTML 파일 소스코드에 해당 태그들이 영구 제거되었는지 확인.

### 3) 정적 구문 및 무결성 검사
1. `scripts/check_syntax.ps1`을 구동하여 브래킷 매칭 및 SyntaxError가 일체 없음을 확인.
2. 브라우저 콘솔 창에 `ReferenceError`나 `TypeError`가 0건인지 확인.
