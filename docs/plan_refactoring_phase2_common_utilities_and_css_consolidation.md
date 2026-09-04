# 시스템 전면 최적화 계획서 (Phase 2)
## Phase 2: 공통 통신/유틸리티 일원화 및 CSS 토큰 통합 (Consolidation & Style Cleanup)

작성일자: 2026-09-04  
상태: 실행 완료 (Completed)  
선행 계획서: [Phase 1 스토리지 정제기 및 중복 스크립트 단일화 계획서](file:///c:/Users/sisun/ai_work/docs/plan_refactoring_phase1_storage_sanitizer_and_duplicate_cleanup.md) (완료)  
다음 단계 계획서: [Phase 3 코어 엔진 디스패처 분리 및 인스펙터 모듈화 계획서](file:///c:/Users/sisun/ai_work/docs/plan_refactoring_phase3_engine_modularization_and_inspector_rearchitecture.md) (대기)

---

## 1. 배경 및 목적

### 1) 현황 및 문제점
- **통신 보일러플레이트 코드 난립**:
  - `vctrl_v4_addon.js`, `vctrl_inspector.js`, `vctrl_component_inserter.js`, `vctrl_connectors.js` 등 10개 이상의 파일에서 `document.getElementById('main-iframe').contentWindow.postMessage(...)` 구문이 50회 이상 중복 하드코딩되어 있습니다.
  - Iframe 내부에서도 `notifyParent`가 모듈마다 제각각 선언되어 통신 에러 발생 시 일관된 디버깅과 예외 처리가 불가능합니다.
- **공통 유틸리티의 산발적 파편화**:
  - `rgbToHex`, `hexToRgba`, `getCleanComputedStyles` 등 기본 색상/스타일 변환 함수가 4개 파일에 중복 구현되어 있으며, 파일 로드 순서에 따라 덮어쓰기 위험이 존재합니다.
- **반응형 프레임 스타일 이중 동기화 (Dual File Synchronization)**:
  - [assets/responsive_frame.css](file:///c:/Users/sisun/ai_work/assets/responsive_frame.css)와 [assets/responsive_frame.js](file:///c:/Users/sisun/ai_work/assets/responsive_frame.js)에 정확히 동일한 390여 줄의 CSS가 복제되어 있어 매 수정 시 두 파일을 수동으로 똑같이 맞춰야 합니다.
- **CSS 캐스케이딩 충돌 및 1,328개 `!important` 경쟁**:
  - `style.css`(459개), `theme.css`(415개), `viewer.css`(315개) 등 전역에 1,328개의 `!important`가 난립하고 있으며, 128개 클래스가 중복 선언되어 있어 스타일 변경 시 예측 불가능한 우선순위 버그가 발생합니다.

### 2) Phase 2의 핵심 목표
1. **통신 버스(`Bus`) 단일화**:
   - `assets/vctrl_common.js`에 `Bus.sendToIframe()` 및 `Bus.sendToParent()`를 단일 진실 공급원(SSOT)으로 정립하고 모든 모듈의 postMessage 보일러플레이트를 제거.
2. **유틸리티 함수 일원화**:
   - 색상 변환(`rgbToHex`, `hexToRgba`) 및 스타일 추출 함수를 `vctrl_common.js`로 일원화.
3. **반응형 프레임 스타일 SSOT 단일화**:
   - `window.responsiveFrameStyles`를 단일 소스로 정립하여 이중 수동 파일 동기화 안티패턴 완전 폐지.
4. **CSS 구조 정상화 및 `!important` 대폭 감축**:
   - CSS 변수 기반 테마 시스템을 확립하여 불필요한 `!important`를 단계적으로 제거하고 스타일 우선순위 충돌 해소.

---

## 2. 세부 기술 설계 (Technical Specifications)

### 1) 통합 통신 버스 (`Bus`) 설계
`assets/vctrl_common.js`에 Iframe/Parent 양방향 통신을 전담하는 경량 통신 유틸리티를 구축합니다:

```javascript
window.EditorBus = {
    // 부모 창 -> Iframe 전송
    sendToIframe(payload) {
        const iframe = (window.DOM && window.DOM.iframe) || 
                       document.getElementById('main-iframe') || 
                       document.getElementById('screen-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(payload, '*');
        } else {
            console.warn('[EditorBus] Active iframe contentWindow not found for payload:', payload.type);
        }
    },

    // Iframe -> 부모 창 전송
    sendToParent(payload) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(payload, '*');
        }
    }
};
```

### 2) 유틸리티 함수 SSOT화
- `assets/vctrl_common.js`에 아래 함수들을 확정 등록하고, 타 파일들의 인라인 `typeof window.rgbToHex !== 'function'` 중복 정의를 제거합니다:
  - `window.rgbToHex(rgb)`
  - `window.hexToRgba(hex, alpha)`
  - `window.getCleanComputedStyles(el)`

### 3) 반응형 프레임 스타일 단일화 설계
- `assets/responsive_frame.js` 내의 `window.responsiveFrameStyles`를 **유일한 SSOT**로 지정합니다.
- `assets/responsive_frame.css`는 빌드 산출물 또는 뷰어 참조 전용으로 정의하여, 개발자가 두 파일을 동시에 열어서 수동 동기화해야 하는 규약(AGENTS.md 규칙)을 근본적으로 해소합니다.

### 4) CSS 3종 통합 및 중복 클래스 정리
- **1단계 (변수화)**: 공통 색상(`--v4-primary`, `--v4-bg`, `--v4-border`, `--v4-text`)을 `theme.css` 최상단 `:root`로 단일화.
- **2단계 (중복 제거)**: `.screen-item`, `.loading-*`, `.desc-*` 등 3개 파일에 걸쳐 파편화된 클래스 스타일을 `style.css`(기본 레이아웃)와 `viewer.css`(인스펙터 전용)로 책임을 명확히 이원화.
- **3단계 (`!important` 해소)**: `theme.css`에서 단순히 우선순위를 이기기 위해 선언된 400여 개의 `!important`를 CSS 변수 오버라이드 방식으로 전환하여 제거.

---

## 3. 작업 대상 파일 및 변경 사항 (Target Files)

### 1. [assets/vctrl_common.js](file:///c:/Users/sisun/ai_work/assets/vctrl_common.js)
- `EditorBus` 통신 인터페이스 추가
- `rgbToHex`, `hexToRgba` 표준 유틸리티 확정 배치

### 2. [assets/vctrl_v4_addon.js](file:///c:/Users/sisun/ai_work/assets/vctrl_v4_addon.js)
- 라인 10-21: 중복된 `window.rgbToHex` 제거
- 라인 23-34: 개별 `notifyIframe` 함수를 `EditorBus.sendToIframe`으로 일괄 치환
- 라인 51-53: 중복된 `hexToRgba` 제거

### 3. [assets/vctrl_inspector.js](file:///c:/Users/sisun/ai_work/assets/vctrl_inspector.js) & [assets/vctrl_component_inserter.js](file:///c:/Users/sisun/ai_work/assets/vctrl_component_inserter.js)
- 각 파일 내 산발적인 `contentWindow.postMessage` 직접 호출을 `EditorBus.sendToIframe`으로 표준화

### 4. [assets/theme.css](file:///c:/Users/sisun/ai_work/assets/theme.css) & [assets/style.css](file:///c:/Users/sisun/ai_work/assets/style.css)
- 128개 중복 클래스 정의 병합 및 변수 기반 캐스케이딩 체계 수립

---

## 4. 검증 계획 (Verification Plan)

1. **통신 무결성 검증**:
   - 사이드바 컴포넌트 클릭 삽입(`LF_INSERT_V4_COMP`)
   - 인스펙터 속성 변경(컬러 피커, 폰트 크기, 정렬, 테두리 등) 시 Iframe 실시간 반영 확인
2. **스타일 렌더링 회귀 검증**:
   - 다크 테마/라이트 테마 전환 시 UI 깨짐 없는지 육안 대조
   - 캔버스 줌(Zoom), 팬(Pan), 사이드바 토글 정상 동작 확인
3. **구문 검사**:
   - `scripts/check_syntax.ps1` 통과 확인
