# 시스템 전면 최적화 계획서 (Phase 1)
## Phase 1: 스토리지 정제기(Sanitizer) 도입 및 중복 스크립트 단일화 (Quick Wins & Safety)

작성일자: 2026-09-04  
상태: 실행 완료 (Completed)  
마스터 로드맵: [plan_refactoring_master_roadmap.md](file:///c:/Users/sisun/ai_work/docs/plan_refactoring_master_roadmap.md)  
다음 단계 계획서: [Phase 2 공통 유틸리티 및 CSS 통합 계획서](file:///c:/Users/sisun/ai_work/docs/plan_refactoring_phase2_common_utilities_and_css_consolidation.md)

---

## 1. 배경 및 목적

### 1) 현황 및 문제점
- **스크린 파일의 비정상적 용량 팽창**:
  - `data/p_331wr/08_Responsive_PC_Mobile_486.html` (473.7 KB)의 경우 컴포넌트 수는 471개이나, 각 컴포넌트마다 4개씩 붙어있는 커넥터 포트(`.lf-connector-port`)가 **무려 1,596개**나 정적 HTML에 영구 저장되어 있습니다.
  - 브라우저 DOM 파싱 과정에서 생성된 빈 스타일 속성(`border-top-color: ; border-top-style: ; border-image-source: ; border-image-slice: ;`)이 컴포넌트마다 10~15줄씩 반복 직렬화되어 파일 용량의 50% 이상을 무의미하게 점유하고 있습니다.
  - 빈 화면(`data/p_331wr/99_Blank_437.html`, 852.4 KB)에는 클립보드로 붙여넣은 PNG 이미지가 인라인 Base64로 5개 박혀 있어 스토리지와 로딩 지연을 초래합니다.
- **스마트가이드 스크립트 이중 로드**:
  - `viewer.html`에서 부모 전용 `assets/vctrl_smartguide.js`(503줄, 25KB)와 Iframe 주입 전용 `assets/vctrl_responsive_smartguide.js`(535줄, 25KB)를 둘 다 로드하고 있습니다.
  - 실제 스냅 렌더링은 Iframe 내부의 `ResponsiveSmartGuide`가 전담하므로 부모 측 스냅 코드는 메모리와 네트워크를 낭비하는 중복 자산입니다.

### 2) Phase 1의 핵심 목표
1. **무손상 스크린 정제기 (`ScreenSanitizer`) 도입**:
   - 스크린 저장(`handleGlobalSave` / `LF_REQUEST_SAVE_CONTENT`) 시점에 런타임 전용 DOM(`.lf-connector-port`) 및 빈 인라인 스타일을 정제하여 저장.
   - **기존 화면 기능(선 연결, 드래그, 텍스트) 무손상 유지** (포트는 화면 로드 시 `vctrl_iframe_ports.js`에 의해 동적으로 즉시 복원됨).
   - **기대 효과**: 스크린 HTML 파일 크기 **즉시 60% ~ 75% 절감** (473KB → 약 120KB 내외).
2. **클립보드 이미지 압축 최적화**:
   - 부모 창 이미지 붙여넣기(`paste`) 시 불필요하게 거대한 무압축 PNG Base64가 삽입되는 것을 제어.
3. **스마트가이드 단일화**:
   - 부모 창의 미사용 `vctrl_smartguide.js` 로드를 안전하게 배제하고, `vctrl_core.js` 내 잔존 호출 정리.

---

## 2. 세부 기술 설계 (Technical Specifications)

### 1) `ScreenSanitizer` 정제 파이프라인 설계
저장 트리거 발동 시, `document.documentElement.cloneNode(true)` 복제본에 아래 3단계 정제 필터를 순차 적용합니다:

```javascript
function sanitizeCloneForSave(cloneDoc) {
    // 1단계: 런타임 전용 UI 보조 엘리먼트 제거
    const runtimeSelectors = [
        '.lf-connector-port',          // 커넥터 연결 포트 (로드 시 동적 복원)
        '.lf-resizer',                 // 크기조절 핸들
        '.lf-delete-trigger',          // 삭제 버튼
        '.lf-drag-handle',             // 이동 핸들
        'svg.v4-responsive-guide-layer',// 스마트가이드 레이어
        '.v4-marquee-box',             // 마키 선택 박스
        '.smart-guide-line'            // 잔존 가이드선
    ];
    cloneDoc.querySelectorAll(runtimeSelectors.join(', ')).forEach(el => el.remove());

    // 2단계: 런타임 활성 클래스 제거
    cloneDoc.querySelectorAll('.lf-component, .v4-shape').forEach(el => {
        el.classList.remove('selected', 'dragging-now', 'hover-target', 'v4-guide-snapped');
    });

    // 3단계: 빈 인라인 스타일 속성 정제 (Regex Tokenizer)
    // 예: "border-top-color: ; border-top-style: ; border-image-source: ;" 등 값 없는 스타일 제거
    cloneDoc.querySelectorAll('[style]').forEach(el => {
        const rawStyle = el.getAttribute('style');
        if (!rawStyle) return;
        const cleaned = rawStyle
            .split(';')
            .map(rule => rule.trim())
            .filter(rule => {
                if (!rule) return false;
                const colonIdx = rule.indexOf(':');
                if (colonIdx === -1) return false;
                const val = rule.substring(colonIdx + 1).trim();
                return val.length > 0; // 값이 비어 있는 속성 필터링
            })
            .join('; ');
        
        if (cleaned) {
            el.setAttribute('style', cleaned + ';');
        } else {
            el.removeAttribute('style');
        }
    });

    return cloneDoc;
}
```

### 2) 커넥터 포트 동적 복원 보장 메커니즘
- 스크린 저장 시 `.lf-connector-port`를 제거하더라도, 화면 로드 시점에 `vctrl_iframe_ports.js` 및 `vctrl_core.js`의 초기화 루프가 모든 `.lf-component`를 순회하며 4개 포트(top, bottom, left, right)를 자동으로 재생성하므로 **선 긋기 및 커넥터 스냅 기능에 0.001%의 장애도 발생하지 않음**을 보장합니다.

### 3) 스마트가이드 단일화 설계
- `viewer.html`에서 `assets/vctrl_smartguide.js` 로드 제거.
- `assets/vctrl_core.js` 라인 221-229의 `window.SmartGuide.findSnapTargets()` 호출 가드 정리.
- Iframe 내부의 `window.v4ResponsiveSmartGuideScript`가 스냅 타겟 수집, 거리 측정, 가이드라인 렌더링을 100% 독립적으로 수행하도록 단일화.

---

## 3. 작업 대상 파일 및 변경 사항 (Target Files)

### 1. [viewer.html](file:///c:/Users/sisun/ai_work/viewer.html)
- **수정 위치**: 라인 40 근처
- **작업 내용**:
  ```diff
  - <script src="assets/vctrl_smartguide.js?v=V316_INPLACE_SCROLL_LOCK"></script>
    <script src="assets/vctrl_responsive_smartguide.js?v=V316_INPLACE_SCROLL_LOCK"></script>
  ```

### 2. [assets/vctrl_core.js](file:///c:/Users/sisun/ai_work/assets/vctrl_core.js)
- **수정 위치 1 (스마트가이드 잔존 호출 정리)**: 라인 221-229
  ```diff
  - setTimeout(() => {
  -     if (window.SmartGuide) {
  -         window.SmartGuide.findSnapTargets();
  -         console.log('[SmartGuide] Targets pre-warmed after screen load.');
  -     }
  - }, 300);
  ```
- **수정 위치 2 (`getIframeHTML` 정제 로직 강화)**: 라인 580-586
  - `clone.querySelectorAll('.lf-resizer, .lf-delete-trigger, .lf-drag-handle, .lf-connector-port, svg.v4-responsive-guide-layer').forEach(...)` 확장
  - 빈 인라인 스타일 속성 필터링 적용

### 3. [assets/vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js)
- **수정 위치 (`LF_REQUEST_SAVE_CONTENT` 핸들러)**: 라인 1228-1241
  - 클론 노드에 `ScreenSanitizer` 파이프라인(`sanitizeCloneForSave`)을 동일하게 적용하여 파일 프로토콜과 postMessage 통신 양쪽에서 완벽히 일관된 정제 HTML 반환 보장.

---

## 4. 검증 계획 (Verification Plan)

1. **정적 무결성 검증**:
   - `scripts/check_syntax.ps1` 구동하여 브래킷 및 구문 오류 0건 검증.
2. **스크린 저장 및 용량 절감 검증**:
   - 기존 대용량 화면(`08_Responsive_PC_Mobile_486.html` 또는 테스트 화면)에서 '전체 저장' 실행.
   - 생성/저장된 HTML 파일 내에 `.lf-connector-port` 및 빈 스타일(`border-top-style: ;`)이 깨끗이 제거되었는지 확인.
   - 파일 용량이 기존 대비 60% 이상 대폭 감소했는지 바이트 수 검증.
3. **화면 재로드 및 기능 무결성 검증**:
   - 정제 저장된 화면을 다시 열었을 때:
     - 마우스 호버 시 커넥터 포트가 정상적으로 다시 나타나고 선 긋기가 가능한지 확인.
     - 컴포넌트 이동, 크기 조절, 텍스트 편집, 다중 선택이 100% 정상 작동하는지 확인.
