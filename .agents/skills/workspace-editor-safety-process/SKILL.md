---
name: workspace-editor-safety-process
description: Use before risky Workspace Editor changes, broad refactors, metadata.json edits or merges, rollback-sensitive work, GitHub main deployment, folder moves, deletes, architecture changes, verification planning, anti-pattern checks, or post-work reporting.
---

# Workspace Editor Safety Process

## 🚨 7대 필수 게이트웨이 절대 준수 (7 Mandatory Gateways SSOT)
모든 분석 및 개발 작업은 `AGENTS.md` 최상단에 명시된 **7대 필수 게이트웨이**(1. 운영 시스템 무결성, 2. 사전 정밀 분석 및 계획 수립, 3. 사이드이펙트 차단, 4. 스크립트/런타임 에러 0건, 5. 백틱 충돌 에러 0건, 6. 구문/브래킷 에러 0건 및 `scripts/check_syntax.ps1` 검증 통과, 7. CORS 에러 0건 및 MessageHub 통신)를 무조건적인 선행 및 완료 조건으로 통과해야 합니다.

## Five-Step Flow
1. Ponder: identify the requested outcome and possible system impact.
2. Analyze: inspect existing code and data before editing.
3. Design: fix scope and method; get approval for broad or destructive changes.
4. Execute: change only the designed scope.
5. Verify: perform static syntax/bracket inspection (scripts/check_syntax.ps1, scripts/verify_all.ps1) and static code integrity analysis.

## Data And Git Safety
- **Strict Production Integrity & Prohibition of Dummy/Fake Fallbacks**: This system is an active production workspace editor. Never inject hardcoded dummy data, fake metadata objects, or fake fallback HTML/JSON to bypass errors or CORS warnings. Dummy fallbacks corrupt real production data (`metadata.json`, saved screen HTMLs). Always rely solely on authentic disk reading and true system error recovery pipelines.
- Do not flatten folders or move/delete subfolders without explicit user approval.
- Do not delete or overwrite metadata files such as `metadata.json` in each project folder. Always keep the `screenOrder` array synchronized when adding, deleting, or reordering screens.
- **Offline Bundle Synchronization**: When modifying `assets/templates/*.html`, run `scripts/build_templates.ps1`. When modifying `assets/ui_library/*.html`, run `scripts/build_ui_fallback.ps1` to ensure offline `file://` compatibility.
- **Local Daily Backup & Rapid Restoration Safeguard**: An automated daily backup engine runs at 18:00 via Task Scheduler (`C:\ai_work_backups\daily\data_daily_*.zip`). Before high-risk refactoring, broad folder reorganizations, or metadata migrations, verify existing backups or run `powershell -ExecutionPolicy Bypass -File scripts/daily_auto_backup.ps1` to ensure an immediate zero-loss restore point exists. When restoring via `scripts/restore_data.ps1`, ensure the pre-restore snapshot (`_pre_restore_safety_*`) is verified.
- During conflicts, manually merge each project's `metadata.json` `screens` arrays and `screenOrder`. Never blindly overwrite them.
- **On-Demand Auto Dual Deployment**: Do NOT push to remotes automatically on everyday small changes. When explicitly requested by the user ("배포해줘", "푸시해줘", "동기화해줘" etc.), automatically commit and push to BOTH repositories (personal GitHub `origin` and corporate Git `sisun` via `scripts/deploy_all.ps1` or `git push origin main`) immediately without asking for extra confirmation.
- Do not revert user changes. If existing changes affect the task, work with them or ask.

## Code Integrity & Safety Rules
- **Encoding Safety**: Avoid hardcoding raw Korean strings directly inside source code logic to prevent file encoding corruption upon saving. Use ASCII-safe status strings or HTML entities (`&times;` etc.) where applicable, and ensure files are saved in UTF-8.
- **Bracket Matching & Syntax Integrity**: After extensive edits on conditional branches or nested functions, run `scripts/check_syntax.ps1` or perform syntax inspection to ensure no missing brackets or trailing syntax errors exist. Run `scripts/verify_all.ps1` for comprehensive browser-engine VM validation.
- **Screen Markup Sanitization Safety (ScreenSanitizer SSOT)**: When saving screens or exporting snapshots, manual DOM mutation (such as manually removing handles or regex style filtering) across multiple files is strictly prohibited. Always route through `window.ScreenSanitizer.cleanDOM` ([assets/vctrl_common.js](file:///c:/Users/sisun/ai_work/assets/vctrl_common.js)) as the single source of truth.
- **Iframe Message Registry Safety**: When adding message handlers to `vctrl_iframe_script.js`, never accumulate massive `if-else` branches. Always register handlers into `v4IframeCoreHandlers` or `window.v4MessageHandlers` as pure functions, strictly avoiding backtick (`` ` ``) literal collisions.
- **Engine Script Pipeline Integrity (`ENGINE_SCRIPT_REGISTRY`)**: When adding or reordering iframe inlined scripts, maintain the metadata array in `vctrl_core.js` (`ENGINE_SCRIPT_REGISTRY`) and confirm 100% compilation via `scripts/check_syntax.ps1`.
- **Inlined Template Literal & Regex Safety**: When writing or editing iframe modules wrapped inside outer template literals (`window.v4FormatPainterScript = `...`` etc.), avoid complex regular expressions with escaped slashes (`\/`) or escaped parens (`\)`). The outer template literal parser swallows backslashes during string evaluation, leading to syntax errors (e.g., `Unmatched ')'`) or accidental comment truncation (`//`). Always use robust string methods (`indexOf`, `lastIndexOf`, `split`, `substring`) for parsing color notations and CSS values.
- **Format Painter Opacity & Color Resolution Protocol**: Ensure format painter operations use `_resolveFillColor` to unify `isBgTransparent` and `bgOpacity` calculations into standard `rgba()` colors, and keep iframe-side `window.hexToRgba` available as an iframe SSOT.
- Preserve function declarations, class definitions, global initialization, and module-call names such as `window.updateProperties`.
- In core engine edits, check cross-file function-name consistency before finishing.
- For SVG shapes such as diamonds and triangles, keep `borderColor`, SVG `stroke`, and 1.6px stroke standards synchronized.
- **Mobile Read-Only Safety & Anti-Pattern Prevention Protocol**:
  - **Never Suppress `requestFullscreen` on Mobile**: When the user requests a clean fullscreen experience or reports unwanted guide messages, do NOT disable native `requestFullscreen()`. Disabling `requestFullscreen()` leaves the mobile browser address bar and system status bar visible, breaking the core fullscreen fit experience.
  - **Differentiate System Prompts vs In-App Tooltips**: When the user requests removing "guide messages" in mobile fullscreen, identify that they mean the desktop keyboard tooltip (`#presentation-pen-tooltip`: `Shift + Drag : Highlighter | C : Clear`) or in-app toast (`.v4-zen-toast`), NOT the Android OS system prompt. Suppress the desktop tooltip on touch/mobile devices via both JS and CSS.
  - **Preserve Desktop Authoring**: Never hide `[+ New Project]` or editor tools globally. Scrape or hide them strictly inside mobile media queries (`max-width: 768px`, `orientation: landscape and max-height: 520px`).
- **Object Property Inspector Synchronization Safety Protocol (4-Layer Guard)**:
  - When switching selection between identical shapes (e.g., Rect A ➔ Rect B), the inspector panel section (`#shape-inspector-section`) remains open without unmounting. To prevent input values (Width/Height) from sticking to the previous shape due to parent input focus retention or race conditions, strictly enforce the 4-layer guard:
    1. CoreRouter: Backup `previousEditingIndex`, blur active element on parent window, pass `isNewSelectionExplicit` flag.
    2. Inspector: Apply 3-tier `isNewComp` check, force reset `isTypingInInspector`, directly assign `Math.round(compStyles.w/h)` to input values.
    3. Properties: Dispatch `updateAllInputs(w, h, force = true)` on `LF_COMP_SELECTED` to bypass input focus guards.
    4. Iframe: Clear parent active input focus (`pActive.blur()`) on component `mousedown`.
- **Cinematic Loader & Studio Docking Transition Safety Protocol**:
  - Always ensure `.loading-overlay` maintains `pointer-events: none` and `visibility: hidden` when `.fade-out` is applied so that canvas clicks and drags are never blocked by an invisible overlay layer.
  - When applying `.workspace-docked`, ensure keyframe animations utilize `will-change: opacity, transform, filter` and `forwards`/`both` fill-modes so layout styles settle cleanly without flickering or resetting after animation ends.
- **Unified Z-Index Architecture & Stacking Context Isolation Safety Checklist**:
  - **No Rogue Z-Indices**: 임의의 하드코딩된 거대 z-index(예: 9999, 999999 등)를 절대 주입하지 않는다. 모든 z-index 할당은 반드시 `V4_Z_TIERS` 8대 티어 단일 진실 공급원 대역에 부합해야 한다.
  - **Stacking Context 면역성 검증**: `isolation: isolate; contain: paint; transform: translateZ(0);` 속성을 갖는 복합 컴포넌트(어드민 테이블, 카드, 모달 등)를 작성하거나 수정할 때, 디스크립션 핀(`.pin-marker`)이 해당 컴포넌트의 독립 Stacking Context 아래로 갇히지 않도록 반드시 전용 오버레이인 `.v4-pin-layer` (`z-index: 250000 !important;`) 내부에 위치함을 검증해야 한다.
  - **클립보드 붙여넣기 침범 방지**: 붙여넣기(`pasteCopiedObjectsFromData`) 실행 시 신규 요소가 `.v4-pin-layer` 뒤로 추가되어 핀 레이어가 덮이지 않도록, `trailingRef` 판별에서 `.v4-pin-layer`가 올바르게 예외 처리되어 핀 레이어 직전(Before) 형제 위치로 삽입되는지 검증해야 한다.
  - **스크롤 고정 해제 시 강등(Demotion) 검증**: `data-scroll-fixed` 해제 시 GPU 트랜스폼(`transform`, `will-change`, `transition`) 인라인 스타일이 완전히 소거되고, z-index가 Tier 5(100,000+)에 방치되지 않고 일반 컴포넌트 티어 상한선인 `69,900` 이하(`Math.min(69900, maxNormalZ + 10)`)로 정상 강등되는지 확인해야 한다.
- **신규 도형·아톰·아이콘 추가 시 공통 UI 준수 및 데이터 무오염 안전 체크리스트 (Common UI & Zero Contamination Checklist)**:
  1. **[공통 UI 패턴 준수 확인]**: 인스펙터 패널 작성 시 독단적인 체크박스나 비표준 인풋을 배제하고, 공통 규격인 `[ Y ] [ N ]` 세그먼트 토글 버튼(`.v4-flex-gap-4 .w-84`, `.v4-inspector-btn .v4-inspector-toggle-btn`), 단독 숫자 인풋(`.v4-prop-input-base`) + 동적 span 라벨, 좌측 정렬 셀렉트박스(`.v4-prop-select`)를 100% 적용했는가?
  2. **[스타일 추출기 중복 키 0건 검증]**: `assets/vctrl_iframe_style_extractor.js` 반환 객체에 중복 키(Duplicate Keys)가 존재하지 않는지 전수 검사했는가?
  3. **[타 컴포넌트 기본값 보존 검증]**: 신규 아톰의 기본값(예: 2000)이 기존 아톰(텍스트박스 기본 100자 등)의 프로퍼티를 덮어쓰거나 오염시키지 않도록 조건부 격리(`isX ? xVal : defaultVal`)가 철저히 이루어졌는가?
  4. **[오프라인 번들 최신화 검증]**: 인스펙터 HTML 수정 후 `scripts/build_ui_fallback.ps1`을 구동하여 `ui_library_fallback.js`를 재컴파일했는가?

## Verification And Reporting
- Define success criteria before editing.
- Report changed files and verification steps after finishing.
- If final verification finds a new SyntaxError, TypeError, or 404, stop and report before continuing.

