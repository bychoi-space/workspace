---
name: workspace-editor-browser-verification
description: Use when performing static code verification, syntax checking (scripts/check_syntax.ps1, scripts/verify_all.ps1), AST inspection, event flow analysis, or guiding user-side browser testing for Workspace Editor. Prohibits AI direct browser automation.
---

# Workspace Editor Code & Static Verification Policy

> [!CAUTION]
> **[AI 브라우저 직접 검증 절대 금지 원칙]**
> 사용자의 작업 속도 및 리소스 보호 요청에 따라 **에이전트(AI)가 브라우저 자동화 도구(`browser_subagent` 등)를 실행하여 직접 브라우저를 열고 검증하는 것은 원천 금지**되어 있습니다.
> 모든 기능 검증은 **정밀 소스코드 심층 분석, 브래킷/구문 검사(`scripts/check_syntax.ps1` / `scripts/verify_all.ps1`), 모듈 경계 추적 및 사용자 피드백 안내 절차**를 통해 완료해야 합니다.

## 🚨 7대 필수 게이트웨이 정적 검증 기준 (7 Mandatory Gateways SSOT)
- **Mandatory Pre-Flight & Post-Flight Pass**: 코드를 수정한 모든 작업은 완료 보고 전 반드시 **`powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1`을 자율 구동하여 0 Errors (100% 브래킷/백틱/Node VM 인라인 컴파일 통과)**를 달성해야 합니다.
- **Backtick Syntax Collisions Check**: `vctrl_iframe_script.js`, `vctrl_text_measurer.js`, `assets/templates.js` 등 백틱 eval/srcdoc 주입 대상 파일 내부에서 중첩 백틱(`` ` ``) 또는 `${}` 변수 보간이 사용되지 않았는지 전수 검사합니다.
- **CORS & SOP Isolation**: 부모-Iframe 간 직접 DOM 접근(`contentDocument`)을 배제하고 `window.EditorBus` / `MessageHub` 통신 프로토콜을 100% 준수했는지 확인합니다.

## Static Verification Standards
- **Syntax & Bracket Integrity**: `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1`을 실행하여 전체 엔진 JS 파일의 브래킷 밸런스 및 Node VM 기반 `ENGINE_SCRIPT_REGISTRY` 25개 전 모듈 인라인 스크립트 컴파일 무결성을 100% 검증합니다.
- **Headless Browser Comprehensive Check**: 필요시 `powershell -ExecutionPolicy Bypass -File scripts/verify_all.ps1`을 통해 실제 Chromium/Edge Headless 환경에서 40여 개 전체 엔진 스크립트의 런타임 구문 로드 및 인라인 함수 생성을 전수 검사합니다.
- **Event Flow Non-Blocking Check**: `mouseup` / `mousemove` 리스너 내 조기 종료(`return;`) 남용으로 하위 상태 해제(`LF_MARQUEE_END`)가 차단되지 않는지 이벤트 루프를 검증합니다.
- **Module Boundary & SSOT Consistency**: `metadata.json` 스펙 및 `MessageHub` / `EditorBus` 통신 규격이 일치하는지 정적 추적합니다.
- **Unified Z-Index Architecture & Pin Layer Verification**: `window.V4_Z_TIERS` 8대 티어 규격 정합성을 검증하고 임의의 비표준 z-index(99999 등) 잔류 여부를 점검합니다. `.v4-pin-layer`의 `z-index: 250000 !important;` 및 `pointer-events: none;` 선언 정합성과, 핀 마커의 `pointer-events: auto;` 속성을 정적 확인합니다.
- **Stacking Context Isolation Immunity Verification**: 어드민 테이블 등 `isolation: isolate; contain: paint;` 속성을 갖는 컴포넌트와 디스크립션 핀의 DOM 계층 분리를 정적 검증하고, 필요시 Headless Chromium Stacking Context Hit-Test를 통해 핀이 항상 최상단에 렌더링되는지 확인합니다.

## User Verification Guidance Targets
- 엔진, UI, 롤백, 대규모 CSS, 디자인 시스템 수정 후 사용자가 브라우저에서 직접 테스트할 수 있도록 다음 주요 점검 항목을 보고서에 명확히 안내합니다:
  - 레이어 4대 단축키(`Ctrl+Shift+]`, `Ctrl+]`, `Ctrl+Shift+[`, `Ctrl+[`)를 통한 오브젝트 앞/뒤 순서 이동 동작
  - 긴 스크롤 화면에서 디스크립션 핀 신규 생성 시 시야 내 안착 및 어드민 테이블/카드 위에 항상 최상단 노출 여부
  - 스크롤 고정(`[상단]`, `[하단]`, `[플로팅]`, `[스티키]`) 설정 및 해제 시 레이어 순서 복원 동작
  - 화면 추가 (`+`) 및 스크린 전환 동작
  - 전체 저장 (`Save All`) 및 스토리지 반영
  - 사이드바 / 인스펙터 토글 동작
  - 브라우저 개발자 도구 콘솔의 에러 발생 여부
  - 캐시 갱신을 위한 하드 리프레시 (`Ctrl+Shift+R` 또는 `Ctrl+F5`) 안내

## Error Policy
- 정적 검사 중 발견된 신규 `SyntaxError`, `TypeError`, 경로 누락(404)은 즉각적인 차단 사유로 간주하고 수정합니다.
- 오류 발견 시 작업을 멈추고 정확한 에러 내용, 영향 파일, 해결 방안을 보고합니다.
