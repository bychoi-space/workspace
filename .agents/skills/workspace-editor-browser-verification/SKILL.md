---
name: workspace-editor-browser-verification
description: Use when performing static code verification, syntax checking (check_syntax.ps1), AST inspection, event flow analysis, or guiding user-side browser testing for Workspace Editor. Prohibits AI direct browser automation.
---

# Workspace Editor Code & Static Verification Policy

> [!CAUTION]
> **[AI 브라우저 직접 검증 절대 금지 원칙]**
> 사용자의 작업 속도 및 리소스 보호 요청에 따라 **에이전트(AI)가 브라우저 자동화 도구(`browser_subagent` 등)를 실행하여 직접 브라우저를 열고 검증하는 것은 원천 금지**되어 있습니다.
> 모든 기능 검증은 **정밀 소스코드 심층 분석, 브래킷/구문 검사(`check_syntax.ps1`), 모듈 경계 추적 및 사용자 피드백 안내 절차**를 통해 완료해야 합니다.

## Static Verification Standards
- **Syntax & Bracket Integrity**: `check_syntax.ps1` 또는 `node -c` 구문 검사를 시행하여 `SyntaxError`, `ReferenceError` 연쇄 장애를 100% 방지합니다.
- **Event Flow Non-Blocking Check**: `mouseup` / `mousemove` 리스너 내 조기 종료(`return;`) 남용으로 하위 상태 해제(`LF_MARQUEE_END`)가 차단되지 않는지 이벤트 루프를 검증합니다.
- **Module Boundary & SSOT Consistency**: `metadata.json` 스펙 및 `MessageHub` 통신 규격이 일치하는지 정적 추적합니다.

## User Verification Guidance Targets
- 엔진, UI, 롤백, 대규모 CSS, 디자인 시스템 수정 후 사용자가 브라우저에서 직접 테스트할 수 있도록 다음 주요 점검 항목을 보고서에 명확히 안내합니다:
  - 화면 추가 (`+`) 및 스크린 전환 동작
  - 전체 저장 (`Save All`) 및 스토리지 반영
  - 사이드바 / 인스펙터 토글 동작
  - 브라우저 개발자 도구 콘솔의 에러 발생 여부
  - 캐시 갱신을 위한 하드 리프레시 (`Ctrl+Shift+R` 또는 `Ctrl+F5`) 안내

## Error Policy
- 정적 검사 중 발견된 신규 `SyntaxError`, `TypeError`, 경로 누락(404)은 즉각적인 차단 사유로 간주하고 수정합니다.
- 오류 발견 시 작업을 멈추고 정확한 에러 내용, 영향 파일, 해결 방안을 보고합니다.
