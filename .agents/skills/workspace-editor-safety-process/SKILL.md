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
- **On-Demand Auto Deployment**: Do NOT push to GitHub automatically on everyday small changes. When explicitly requested by the user ("배포해줘", "푸시해줘", etc.), automatically commit and push to the remote repository immediately without asking for extra confirmation.
- Do not revert user changes. If existing changes affect the task, work with them or ask.

## Code Integrity & Safety Rules
- **Encoding Safety**: Avoid hardcoding raw Korean strings directly inside source code logic to prevent file encoding corruption upon saving. Use ASCII-safe status strings or HTML entities (`&times;` etc.) where applicable, and ensure files are saved in UTF-8.
- **Bracket Matching & Syntax Integrity**: After extensive edits on conditional branches or nested functions, run `scripts/check_syntax.ps1` or perform syntax inspection to ensure no missing brackets or trailing syntax errors exist. Run `scripts/verify_all.ps1` for comprehensive browser-engine VM validation.
- **Screen Markup Sanitization Safety (ScreenSanitizer SSOT)**: When saving screens or exporting snapshots, manual DOM mutation (such as manually removing handles or regex style filtering) across multiple files is strictly prohibited. Always route through `window.ScreenSanitizer.cleanDOM` ([assets/vctrl_common.js](file:///c:/Users/sisun/ai_work/assets/vctrl_common.js)) as the single source of truth.
- **Iframe Message Registry Safety**: When adding message handlers to `vctrl_iframe_script.js`, never accumulate massive `if-else` branches. Always register handlers into `v4IframeCoreHandlers` or `window.v4MessageHandlers` as pure functions, strictly avoiding backtick (`` ` ``) literal collisions.
- **Engine Script Pipeline Integrity (`ENGINE_SCRIPT_REGISTRY`)**: When adding or reordering iframe inlined scripts, maintain the metadata array in `vctrl_core.js` (`ENGINE_SCRIPT_REGISTRY`) and confirm 100% compilation via `scripts/check_syntax.ps1`.
- Preserve function declarations, class definitions, global initialization, and module-call names such as `window.updateProperties`.
- In core engine edits, check cross-file function-name consistency before finishing.
- For SVG shapes such as diamonds and triangles, keep `borderColor`, SVG `stroke`, and 1.6px stroke standards synchronized.

## Verification And Reporting
- Define success criteria before editing.
- Report changed files and verification steps after finishing.
- If final verification finds a new SyntaxError, TypeError, or 404, stop and report before continuing.

