---
name: workspace-editor-engine
description: Use when editing Workspace Editor engine files, vctrl_core.js, vctrl_inspector.js, vctrl_inspector_sync.js, vctrl_grouping.js, vctrl_canvas_viewport.js, vctrl_screen_manager.js, vctrl_annotation_pins.js, assets/inspector/*, MessageHub, EditorBus, SmartGuide, iframe scripts, DOM registries, init functions, listener wiring, selection, grouping, canvas, zoom, pan, annotations, or module boundaries.
---

# Workspace Editor Engine

## Core Boundaries & Architecture
- Keep the engine modular. Add a dedicated JS file for a large new feature instead of swelling an existing file.
- `vctrl_core.js` owns global `state`, `MessageHub`, GitHub API load/save, dynamic script compilation via `ENGINE_SCRIPT_REGISTRY` pipeline for iframe `srcdoc`, screen save/export synchronization via `window.ScreenSanitizer.cleanDOM`, and SmartGuide calculation flow.
- `vctrl_core_router.js` owns parent-side message routing (`v4ParentCoreHandlers`), central `MessageHub` dispatching, component selection routing with `state.previousEditingIndex` tracking, explicit new selection flagging (`isNewSelection`), and parent active input blur handling.
- `vctrl_properties.js` owns property mapping helpers, floating inspector binding, and forced input synchronization (`updateAllInputs(w, h, force = true)`) bypassing focus guards on selection transition.
- `vctrl_screen_manager.js` owns screen reordering (`screenOrder`), screen creation (`+`), cloning, deletion, active screen routing, and `metadata.json` persistence synchronization.
- `vctrl_revision_history.js` owns Project Revision History modal (`#history-modal`), entry CRUD (`window.renderHistoryPopup`), and metadata persistence synchronization.
- `vctrl_clipboard.js` owns URL copy dropdown handling, project & screen URL copying, and asynchronous system clipboard fallback (`copyTextToClipboard`).
- `vctrl_component_data.js` owns V4 component library (`window.V4_COMPONENT_LIBRARY`) templates and metadata definitions SSOT.
- `vctrl_canvas_viewport.js` owns Canvas Interaction (`adjustZoom`, `centerView`, `updateTransform`), 100% crisp snap (`toggleCrispView`), Fullscreen, and Global Space-key Panning logic (integrated with `vctrl_core.js` iframe event propagation).
- `vctrl_annotation_pins.js` and `vctrl_responsive_pins.js` own annotation pin rendering, viewport positioning, metadata description synchronization, dedicated overlay container (`.v4-pin-layer`) lifecycle (`ensurePinLayer`, loose pin self-healing), and viewport-scroll-aware safe spawn coordinates (`spawnPcX: 570, spawnPcY: 180 + scrollY`). Pin reordering logic is fully consolidated into `window.reorderAllPins` and `LF_REORDER_PINS` SSOT inside `vctrl_responsive_pins.js`.
- `vctrl_iframe_layering.js` owns the Unified 8-Tier Z-Index Architecture (`window.V4_Z_TIERS`), 4-operation layer suite (`handleBringToFront`, `handleBringForward`, `handleSendToBack`, `handleSendBackward`), and compaction threshold (`compactZIndices`).
- `vctrl_clipboard_objects.js` owns object copy/paste lifecycle, pasting tier rebase (`V4_Z_TIERS.NORMAL.MAX = 69900`, `V4_Z_TIERS.VIRTUAL_HUD.MAX = 179900`), and `trailingRef` guard ensuring pasted elements are placed before `.v4-pin-layer`.
- `vctrl_iframe_scroll_pin.js` owns the Responsive Scroll Pinning & Smart HUD Fixed Engine (`window.ScrollPinEngine`). It manages the 4 object pinning modes (`top`, `bottom`, `custom`/`floating`, `sticky`), viewport description pins (`data-scroll-fixed="viewport"`), host-pinned markers (`data-fixed-host`), scroll-direction reactive reveal/hide effects (`data-scroll-effect`: `always`, `hide-down`, `hide-up`) with hardware-accelerated `translate3d` GPU transforms and `WeakMap` container state isolation, and unpinning lifecycle safe demotion back to Tier 2 (`Math.min(69900, maxNormalZ + 10)`).
- `vctrl_connectors.js` owns connector spawning (`spawnLine`), 30px magnetic port snapping (`collectSnapTargets`), port highlighting, real-time anchoring (`syncAnchoredPositions`), and connector inspector routing.
- `vctrl_iframe_ports.js` owns iframe-side port detection and port-drag connector initiation.
- `vctrl_grouping.js` owns marquee selection, `selectedIds`, group move/delete/grouping behavior, and selected class sync.
- `vctrl_inspector.js`, `vctrl_inspector_sync.js`, `vctrl_inspector_actionbar.js`, and `assets/inspector/*` own sidebar tabs, metadata UI, screen list rendering, Quill initialization, floating card routing, 3-tier component transition detection (`isNewComp`), and domain-specific inspector controls (`inspector_grid.js`, `inspector_accordion.js`, `inspector_tab.js`, `inspector_shapes.js`, `inspector_atoms.js`, `inspector_popup.js`, `inspector_admin_settings.js`, `inspector_text_formatter.js`, `inspector_scroll_pin.js`, `vctrl_inspector_actionbar.js`).
  - `vctrl_inspector_sync.js` (`window.InspectorPropertySync`): Component property synchronization dispatcher and sub-synchronizers (shape/pin, table, line, illustration, icon, atom, popup, accordion, grid, admin-settings, tab, stepper, cursor, toggle, datepicker, etc.) SSOT.
  - `inspector_atoms.js` (`window.InspectorAtoms`): Atom property synchronization SSOT.
  - `inspector_popup.js` (`window.InspectorPopup`): Popup window atom (`v4-atom-popup`) header, styling, and dimension synchronization SSOT.
  - `inspector_scroll_pin.js` (`window.InspectorScrollPin`): Responsive screen & canvas element scroll pin (top/bottom/custom/sticky), viewport pinning mode, and direction reactive effects (`data-scroll-effect`) inspector binding & UI synchronization SSOT.
  - `inspector_text_formatter.js` (`window.InspectorTextFormatter`): Quill NBSP spacing preservation (`preserveConsecutiveSpaces`) and inline font-size normalization (`normalizeHtmlForQuill`).
- `vctrl_common.js` owns `window.EditorBus` (`sendToIframe`, `sendToParent`) for reliable messaging, universal color conversion (`rgbToHex`, `hexToRgb`, `hexToRgba`), screen markup sanitizer SSOT (`window.ScreenSanitizer`), and responsive document discriminator SSOT (`isResponsiveDocument`).
- `vctrl_component_library.js` & `vctrl_component_inserter.js` own component library categories, shape/atomic/icon rendering (`renderV4Shapes`, `renderAtomicLibrary`), Illustration Library 2-column rendering (`renderIllustrationLibrary`), Canvas Background Setting modal & presets (`openCanvasBackgroundModal`, `applyCanvasBackground`, `removeCanvasBackground`), dual-language search filtering, canvas drop coordinates, and dynamic object insertion. `vctrl_component_library.js` is loaded before `vctrl_inspector.js` in `viewer.html` to establish proper binding order.
- `vctrl_pdf_exporter.js` owns multi-screen batch PDF export based on `metadata.json` `screenOrder`, long-canvas captures, and progress modal management.
- `vctrl_presentation_pen.js` owns real-time presentation drawing canvas (laser pointer & highlighter pen) activated when holding `Shift` in desktop fullscreen (`F`) mode. It is strictly suppressed on mobile/touch viewports (`isMobileOrTouchDevice()`), where both the canvas and the shortcut tooltip (`#presentation-pen-tooltip`) are completely hidden.
- `vctrl_resolution_engine.js` owns resolution and viewport classification (`res-narrow`, `res-compact`, `res-wide`), tablet/mobile read-only viewports, smart frame focus switcher (`v4-frame-switcher`, `focusFrame`), native browser fullscreen (`requestFullscreen`/`exitFullscreen`) and zen mode (`toggleZenMode`), device rotation guidance toast (`showRotationToast`), and mobile-friendly touch viewer behavior.
- **Critical Fullscreen Principle**: In `vctrl_resolution_engine.js` and `vctrl_canvas_viewport.js`, native `requestFullscreen()` MUST be executed on mobile devices so the browser's address bar and system status bar are eliminated, allowing the 1600x900 canvas to fit the physical smartphone display. Never skip `requestFullscreen()` on mobile viewports.
- **Cinematic Dual-Orbit Loader & Studio Docking Architecture**:
  - `viewer.css`, `dashboard.css`, and `viewer.html` implement a high-precision dual-orbit loading animation system (`.orbit-ring-outer`, `.orbit-ring-inner`, `.orbit-core-emblem`, `.loading-ambient-glow`).
  - Upon screen readiness, the loader smoothly transitions out via `.loading-overlay.fade-out` (`scale(1.03)`, `blur(8px)`, `opacity: 0`, 0.5s duration).
  - On desktop (`body.res-wide`), the `workspace-docked` class orchestrates synchronized studio docking transitions: toolbar descent (`studioToolbarDock`, 0.4s), left/right sidebars slide-in (`studioLeftDock`, `studioRightDock`, 0.4s), and artboard canvas blur-settle camera entrance (`canvasCameraIn`, 0.45s).
- **Offline Build Pipeline**:
  - Whenever modifying `assets/templates/*.html`, developers must run `powershell -ExecutionPolicy Bypass -File scripts/build_templates.ps1` to recompile `assets/templates.js`.
  - Whenever modifying `assets/ui_library/*.html` (cards, panels, modals), run `powershell -ExecutionPolicy Bypass -File scripts/build_ui_fallback.ps1` to update `assets/ui_library_fallback.js`.


## Communication & Scripting Safety
- In `file://` contexts, do not access iframe `contentDocument` directly. Use `MessageHub`/`postMessage`.
- Normalize action names sent through `MessageHub` so case, hyphen, and underscore variants are accepted.
- **MessageHub Publish Collision**: `MessageHub.publish(type, data)` 호출 시 `data` 객체 내부에 `type` 프로퍼티가 포함되지 않도록 주의하라. `publish` 함수는 `{ type, ...data }` 형태로 객체를 병합하므로, `data.type`이 첫 번째 인자인 `type`을 덮어씌워 구독자가 메시지를 수신하지 못하게 된다.
- Inline CSS/JS dependencies needed by `srcdoc` iframe flows to avoid security blocking.
- **Nested Backtick Precaution**: `vctrl_core.js`의 `v4Script` 또는 인라인 주입 스크립트와 같이 백틱(`)으로 감싸진 템플릿 리터럴 내부에서 다시 백틱이나 변수 보간(`${}`)을 사용하면 구문 에러(SyntaxError)가 발생한다. 내부에서는 반드시 일반 따옴표(`"` 또는 `'`)와 덧셈 연산자(`+`)를 사용하거나 이스케이프(`\``) 처리를 해야 한다.
- **Iframe State Initialization**: iframe 컨텍스트에서는 부모 창의 전역 변수(예: `window.state`)가 자동으로 공유되지 않는다. iframe 내부에 주입되는 스크립트(예: `vctrl_undo.js`)에서 상태를 참조하거나 저장할 때는 반드시 참조 전 초기화 여부(예: `if (!window.state) window.state = {};`)를 확인하여 `TypeError`를 방지하라.
- **iframe 하위 스크립트 모듈화 및 정형화 파이프라인 (`ENGINE_SCRIPT_REGISTRY`)**:
  - iframe의 `srcdoc`에 주입되는 스크립트는 29개 도메인 모듈 파일(`vctrl_typography.js`, `vctrl_undo.js`, `vctrl_table.js`, `vctrl_text_measurer.js`, `vctrl_ui_atoms.js`, `vctrl_ui_atoms_inputs.js`, `vctrl_ui_atoms_cursor.js`, `vctrl_design_system.js`, `vctrl_clipboard_objects.js`, `vctrl_format_painter.js`, `vctrl_shortcuts.js`, `vctrl_common.js`, `vctrl_object_shape.js`, `vctrl_object_connector.js`, `vctrl_iframe_drag.js`, `vctrl_iframe_ports.js`, `vctrl_iframe_grid.js`, `vctrl_iframe_accordion.js`, `vctrl_iframe_tab.js`, `vctrl_responsive_smartguide_math.js`, `vctrl_responsive_smartguide.js`, `vctrl_responsive_pins.js`, `vctrl_iframe_style_extractor.js`, `vctrl_iframe_layering.js`, `vctrl_iframe_inserter.js`, `vctrl_iframe_adorner.js`, `vctrl_iframe_script.js`, `vctrl_responsive_multiselect.js`, `vctrl_iframe_scroll_pin.js`)로 완전 분리 관리된다.
  - `vctrl_core.js`의 `getInlinedEngineScript()`는 `ENGINE_SCRIPT_REGISTRY` 메타데이터 배열 파이프라인을 순회하며 각 모듈의 로드 여부를 자동 검증(누락 시 콘솔 경고 발생)하고 동적으로 결합/컴파일하여 iframe `srcdoc`에 주입한다.
  - 결합 결과는 안전하게 캐싱되며, 스크립트 블록 최상단에 `Date.now()` 타임스탬프 난수가 담긴 버스터 주석(`// Cache Buster Timestamp: ...`)을 인라인 주입하여 자동 캐시 무효화를 수행한다.
- **Iframe 메시지 레지스트리 디스패처 (`window.v4MessageHandlers`)**:
  - `vctrl_iframe_script.js`의 `message` 이벤트 리스너는 550줄의 거대한 `if-else` 분기문을 전면 폐지하고, `v4IframeCoreHandlers` 테이블 맵과 전역 `window.v4MessageHandlers` SSOT 레지스트리를 통한 초경량 10줄 디스패처로 경량화되었다.
  - 신규 iframe 메시지 핸들러 추가 시 거대 if-else를 작성하지 말고 반드시 핸들러 테이블 맵 또는 `window.v4MessageHandlers[type] = function(data) { ... }`에 순수 함수로 등록해야 한다.
- **전역 화면 살균 SSOT (`window.ScreenSanitizer`)**:
  - 스크린 저장, 뷰포트 스냅샷, HTML 내보내기 시 임의의 수동 DOM 조작(임시 태그 제거, 스타일 파싱 등)을 절대 금지한다.
  - 반드시 `vctrl_common.js`의 `window.ScreenSanitizer.cleanDOM(targetDoc)` 단일 진실 공급원을 호출하여 선택선/마키박스/핸들/가이드라인/빈스타일을 완벽히 정제해야 한다.
- **크로스 스크린 복사/붙여넣기 (Cross-Screen Clipboard Sync) 및 외부 이미지 붙여넣기(`Ctrl+V`) 하이브리드 파이프라인**:
  - 각 스크린 iframe은 고유한 `srcdoc` 컨텍스트(또는 `file://` sandboxed context)에서 로드되므로 격리되어 있어 `localStorage`나 iframe 간의 단순 전역 변수 공유가 불가능하다.
  - 이를 극복하고 서로 다른 스크린을 넘나들며 오브젝트 복사/붙여넣기(`Ctrl+C` / `Ctrl+V`)를 지원하기 위해 최상위 윈도우(`window.top`)의 전역 프로퍼티인 `window.top.__lf_global_clipboard__`를 클립보드 데이터의 SSOT로 정의하여 통신한다.
  - 복사 시 선택한 오브젝트 데이터(스타일, 속성, 내부 텍스트, HTML 등)를 JSON 형태로 직렬화하여 `window.top.__lf_global_clipboard__`에 저장하며, 붙여넣기 시 이를 역직렬화하여 겹침 방지 오프셋(+15px)을 더한 뒤 캔버스에 붙여넣는다.
  - **외부 OS 클립보드 이미지 붙여넣기(`Ctrl+V`) 및 우선순위 화해 프로토콜**:
    - 크롬 우클릭 "이미지 복사" 또는 윈도우 화면 캡처 도구(`Win+Shift+S`)로 복사된 이미지를 `Ctrl+V`로 즉시 캔버스에 붙여넣기 위해, `vctrl_shortcuts.js` 및 `vctrl_parent_shortcuts.js`의 일반 `Ctrl+V` (`!e.shiftKey`) `keydown` 핸들러에서는 **`e.preventDefault()`를 절대 호출하지 않고** 브라우저 네이티브 `paste` 이벤트가 발화하도록 위임한다 (80ms fallback 타이머 포함).
    - `paste` 이벤트(`vctrl_shortcuts.js` 및 `vctrl_core_router.js`의 `setupParentPasteProxy`)는 `e.clipboardData.items` 및 `files`에서 `image/*` Blob을 감지하여 `LF_INSERT_IMAGE_COMP`로 전달하고, 반응형 모바일 프레임(360px) 내부 삽입 시에는 프레임 너비(`hostW - 24`)에 맞춰 원본 비율을 유지한 채 자동 스케일링한다.
    - **고해상도 캡처 이미지 다단계 밉맵(Mipmap) & 언샵 마스크 선명도 보정 SSOT (`window.createCrispImageDataUrl`, `window.processAndInsertRawImage`)**:
      - `1920x911` 등 대용량 화면 캡처 이미지를 `500x237px` ~ `780x540px` 박스로 축소 배치할 때 크롬 `background-image`의 단일 패스 2x2 Bilinear 샘플링으로 인해 1px 테이블 선과 한글 획이 소실되는 현상을 차단하기 위해, `vctrl_component_inserter.js`의 `window.createCrispImageDataUrl`이 `0.55x` 단계별 Progressive Step-Down Mipmap + 4-이웃 Unsharp Mask + Dark Stroke Contrast Preservation 리샘플링을 수행한다.
      - 원본 무손실 이미지는 메모리 캐시(`window.top.__lf_orig_image_cache__`, 최근 20개 제한)에만 보관하여 HTML 파일 비대화를 방지하고, 사용자가 리사이즈 핸들이나 인스펙터로 이미지 크기를 변경하면 `vctrl_design_system.js`가 150ms 디바운스 후 변경된 박스 크기의 `1.15배` 해상도(`data-crisp-size`)로 즉시 재샘플링한다.
      - 또한 `#artboard-wrapper`(`viewer.css`)의 진입 애니메이션 종료 상태를 `filter: none;`으로 유지하고 `will-change: filter`를 배제하여 오프스크린 비트맵 래스터화 열화를 원천 차단한다.
    - 내부 도형 복사(`Ctrl+C`/`Ctrl+X`) 시에는 포커스 이동 없는 `copy` 이벤트 가로채기(`clearSystemImageClipboard`)로 OS 클립보드의 이전 이미지를 초기화하고 `__lf_clipboard_source__ = 'internal'` 및 `__lf_suppressed_img_sig__` 시그니처 가드를 기록하여, 외부 이미지 붙여넣기 직후 내부 도형을 복사했을 때 이전 캡처 이미지가 잘못 붙여넣어지는 충돌을 100% 차단한다.
  - **그룹 내부 자식 컴포넌트 단독 복사 정규화**: 그룹(`lf-group`) 내부의 자식 컴포넌트를 단독 선택하여 복사할 때는 상위 부모 그룹 체인의 `left`, `top` 오프셋을 누적 합산하여 호스트(캔버스/반응형 프레임) 기준의 절대 좌표로 정규화한 뒤 저장함으로써, 붙여넣기 시 스크린 최상단(0,0)에 배치되지 않고 원본 시각 위치 우측하단(+15px)에 정확히 독립 오브젝트로 복제되도록 보장한다.
- **도형 서식 클립보드 파이프라인 (Format Painter Pipeline & Style Clipboard SSOT)**:
  - `vctrl_shortcuts.js` (`copySelectedObjectStyle`, `pasteCopiedObjectStyle`)와 `vctrl_format_painter.js` (`LF_SAVE_STYLE_CLIPBOARD`, `LF_REQUEST_STYLE_CLIPBOARD`, `LF_RESPONSE_STYLE_CLIPBOARD`, `LF_SHOW_TOAST`)로 구성됩니다.
  - `Ctrl + Shift + C` 복사 시 컴포넌트의 시각 스타일 및 텍스트 타이포그래피(폰트, 크기, 색상, 두께, 정렬)를 깊이 추출하여 부모 창의 `(window.top || window).__lf_global_style_clipboard__`에 저장합니다.
    - **DOM 실시간 알파 추출 폴백**: 인스펙터 상태에 투명도 수치가 누락되었거나 100으로 기본 설정되어 있더라도, 실시간 DOM `style.backgroundColor` 및 `window._getAlphaPercent`를 통해 실제 렌더링된 알파 퍼센트를 추출하여 `bgOpacity`로 보존합니다. 추출된 알파가 0인 경우 `isBgTransparent = true`로 자동 동기화합니다.
  - `Ctrl + Shift + V` 붙여넣기 시 부모에 클립보드 데이터를 요청하여 단일 또는 다중 선택된 N개 요소에 일괄 주입하며, 주입 전 `V4UndoManager.saveState()`를 호출하여 실행 취소를 보장합니다.
    - **통합 채우기 색상 해석기 (`_resolveFillColor`)**:
      - `isBgTransparent`가 `true`이거나 배경색이 `'transparent'`/`'none'`이거나 `bgOpacity <= 0`인 경우 무조건 `'transparent'` 반환.
      - `bgOpacity < 100`인 경우 `_hexToRgba(hex, alpha)`를 적용하여 표준 `rgba(r, g, b, alpha)` 색상으로 변환.
      - `bgOpacity >= 100`이거나 미지정인 경우 순수 배경색 반환.
    - **전 오브젝트 적용 범위**:
      - 사각형/원형/패턴그리드/웹페이지: `shape.style.backgroundColor` 및 `background`에 `targetFill` 주입, 패턴그리드는 `border-radius`도 동일 동기화.
      - SVG 벡터 도형(삼각형, 다이아몬드, 웨이브, 화살표): 외부 컨테이너는 투명 배경을 유지하고 내부 SVG 요소에 `fill` 주입 및 불필요한 `fill-opacity` 인라인을 제거.
      - 버튼 및 텍스트박스 아톰: `.v4-atom-btn` 및 `.v4-shape-text-box`에 동일하게 `_resolveFillColor` 결과 색상을 주입하여 일관된 시각 서식 적용.
    - **템플릿 리터럴 인라인 안전 원칙**: 인라인 모듈 스크립트 내부에서 정규식 백슬래시 탈출 버그(`\)` 파괴로 인한 `Unmatched ')'` 등)를 방지하기 위해 순수 문자열 조작 함수(`indexOf`, `lastIndexOf`, `split`, `substring`)로 색상 변환을 처리합니다.
- **스크린 배경 설정 엔진 (Canvas Background Setting Pipeline)**:
  - 부모 창의 `ComponentInserter.applyCanvasBackground()`에서 iframe으로 `LF_SET_CANVAS_BACKGROUND` 메시지를 디스패치합니다.
  - Iframe 측(`vctrl_iframe_script.js`)에서는 캔버스 루트 최상단 자식으로 `#canvas_bg_layer` (`pointer-events: none !important; user-select: none; overflow: hidden;`)를 생성/갱신하고 `#canvas_bg_img`의 `src` 및 `opacity`를 적용한 뒤 부모 창으로 `LF_CANVAS_BACKGROUND_UPDATED` 신호를 회신합니다.
- **로컬 일일 데이터 자동 백업 및 무인 스케줄러 아키텍처 (Daily Auto Backup & Scheduler Pipeline)**:
  - `scripts/daily_auto_backup.ps1`은 `FileShare.ReadWrite` 스트림 복사로 파일 락 없이 `data/`를 임시 스테이징한 후 UTF-8 ZIP 압축 아카이브(`C:\ai_work_backups\daily\data_daily_*.zip`)를 생성합니다.
  - 아카이브 생성 즉시 내부 프로젝트 메타데이터 및 스크린 파일 개수를 전수 검증하며, 30일 경과 백업본을 자동 정리하되 최소 5개는 강제 보존합니다.
  - `scripts/setup_daily_schedule.ps1`을 통해 매일 18:00 정각 윈도우 작업 스케줄러(`AiWork_Daily_Project_Backup`)로 무인 실행되며, PC 부팅 시 누락 작업 캐치업(`-StartWhenAvailable`)을 지원합니다.
- **MutationObserver 무한 재귀 루프 방지 (Preventing Infinite Mutation Loops)**: `enforceDesignSystem()` 등 MutationObserver가 활성화된 루프 내에서 카운터 textContent, placeholder display, 또는 폰트 크기 등의 DOM 쓰기 연산을 수행할 경우 다시 MutationObserver가 발동하여 브라우저가 정지하는 무한 재귀 상태에 빠지기 쉽다. 이를 예방하기 위해, 모든 DOM 쓰기 작업은 반드시 **현재 DOM 값과 대입하려는 신규 값을 엄격히 비교(Value Comparison Guard)**하여, 값이 변경된 경우에만 실행되도록 보호해야 한다.
- **신규 아톰·도형 프로퍼티 추출 격리 및 중복 키 오염 방지 프로토콜 (Zero Property Contamination Protocol)**:
  - **스타일 추출기 객체 리터럴 중복 키 선언 절대 금지**: `assets/vctrl_iframe_style_extractor.js`에서 반환 객체 리터럴 구성 시 동일한 프로퍼티 이름(`maxLength`, `showCounter`, `disabled` 등)을 파일 상단과 하단에서 중복 선언하는 실수를 원천 차단한다. 자바스크립트는 객체 리터럴 내에 중복 키가 존재할 경우 나중에 선언된 키로 앞선 키를 무조건 덮어쓰므로, 텍스트박스나 텍스트에어리어 등 기존 아톰을 선택했을 때도 하단에 선언된 신규 아톰의 기본값(예: 2000)이 강제 주입되는 치명적인 데이터 오염이 발생한다.
  - **철저한 컴포넌트 스코프 조건부 격리**: 신규 아톰의 속성은 `isWebEditor ? webeditorMaxLength : maxLength`와 같이 대상 컴포넌트가 활성화되었을 때만 조건부로 할당하거나 고유 네임스페이스 속성을 사용하여, 비활성 컴포넌트나 타 아톰의 기본값(텍스트박스 기본 100자 등)에 절대 간섭하지 않도록 스코프를 완벽히 격리해야 한다.
  - **교차 회귀 검증 의무화**: 신규 아톰 추가/수정 후에는 신규 아톰뿐만 아니라 기존 유사 아톰(텍스트박스, 텍스트에어리어 등)을 캔버스에서 직접 클릭하여 기존 고유 속성과 기본값이 온전히 보존되는지 반드시 확인해야 한다.


## Interaction Integrity
- Keep marker drag and click-to-edit separate.
- For `.v4-editable-cell`, bypass drag logic on click and call `.focus()` immediately.
- Keep component `id`, `selectedIds`, and `.selected` class state synchronized across core and grouping logic.
- **SmartGuide Anchor Compensation**: For `.text-marker`, all objects are now Top-Left oriented. When calculating `calculateSnap()` bounding boxes, coordinates are relative to the component's top-left corner without the legacy center-offset transform.
- **데이터 기반 정밀 연산 (Pure Data / No-Measure Strategy)**: 다중 선택 그룹화, 이동, 정렬 시 브라우저의 `getBoundingClientRect()`는 줌이나 테두리에 의해 오차가 발생할 수 있으므로 가급적 지양한다. 대신 객체의 **`style.left/top` 데이터**를 직접 읽어와 산술 연산하는 방식을 우선한다.
- **캔버스 1:1 픽셀 매핑 및 텍스트 100% 선명도 보장 원칙 (Crisp Typography & Subpixel Integrity)**:
  - **1:1 픽셀 스케일 스냅 (`if (s >= 0.96) s = 1;`)**: `vctrl_canvas_viewport.js`의 `centerView()` 및 뷰포트 센터링 연산 시, 화면 배율 `s`가 0.96 이상일 때는 임의의 소수점 배율(예: 0.98, 0.99)로 리샘플링되지 않도록 반드시 **정확히 `1.0 (100%)` 1:1 픽셀로 강제 스냅**해야 한다. 브라우저의 소수점 스케일 다운샘플링으로 인한 텍스트 번짐(Blurring)을 원천 차단한다.
  - **물리 픽셀 정렬 및 DPR 스냅 (`Math.round(val * dpr) / dpr`)**: `centerView()`와 `updateTransform()`의 좌표 `x`, `y`는 반드시 `window.devicePixelRatio`를 고려하여 `Math.round(val * dpr) / dpr`을 거쳐 물리 디스플레이 픽셀 그리드에 1:1로 안착시켜야 한다. 125%, 150% 등 윈도우 배율 환경에서의 서브픽셀 보간 블러를 원천 차단하며, 100% 해상도에서는 불필요한 `scale(1)` 없이 순수 2D 이동만 적용한다.
  - **글로벌 폰트 안티앨리어싱 및 서브픽셀 무결성 보장**: 모든 텍스트 요소와 인풋, iframe 영역에는 DirectWrite ClearType RGB 서브픽셀 렌더링을 위해 `-webkit-font-smoothing: subpixel-antialiased !important;`, `text-rendering: geometricPrecision !important;`, `font-synthesis: none;`을 필수로 적용하여 13px 등 작은 폰트에서도 칼같이 선명한 렌더링을 보장한다.
- **Group-Aware State Sync**: 요소가 그룹화되어 계층 구조가 변경되더라도 `metadata.json`에 저장되는 데이터는 항상 **전체 스크린(body) 기준의 절대 좌표(px)**를 유지해야 한다. 그룹 내 자식 요소의 뷰포트 좌표를 실시간 역산하여 전역 데이터로 동기화(`LF_UPDATE_PIN_POS` 등)해야 한다.

- **MessageHub Nudge/Align/Undo**: Use MessageHub (`LF_NUDGE`, `LF_ALIGN_COMPONENTS`, `LF_SAVE_UNDO`) to synchronize keyboard movements and alignments from the parent window to the iframe components seamlessly.
- **Keyboard Nudge Forwarding**: 사용자가 컴포넌트를 클릭하면 포커스가 iframe 내부로 이동하여 부모 창의 키보드 이벤트가 동작하지 않을 수 있다. 따라서 iframe 내부(`vctrl_core.js`의 `v4Script`)에도 화살표 키 리스너를 배치하여, iframe 내 요소가 선택된 경우 직접 이동시키고, 그렇지 않은 경우 `LF_NUDGE` 메시지를 통해 부모 창(커넥터, 텍스트 마커 등)에 이벤트를 전달해야 한다.
- **통합 키보드 이벤트 파이프라인 (Unified Keyboard Event Pipeline)**: 기존에 분산되어 있던 부모 창과 iframe 내부의 키보드 이벤트 리스너를 단일화된 파이프라인으로 통합했다. 컴포넌트나 커넥터가 포커싱되었을 때 이벤트가 유실되거나 중복 처리되지 않도록, `vctrl_iframe_script.js` 내부의 통합 키보드 핸들러가 이벤트를 포착하고, 부모 창의 단일 리스너와 `MessageHub`를 통해 연동되어야 한다. 화살표 키 이동(Nudge), Delete/Backspace 삭제, Undo/Redo 등의 모든 인터랙션이 단일 이벤트 흐름으로 제어됨을 보장해야 한다.
- **커넥터(Lines) 실시간 좌표 동기화 (Real-Time Connector Reconciliation)**: 사용자가 컴포넌트를 드래그하거나 화살표 키로 이동시킬 때, 컴포넌트에 연결된 모든 커넥터 라인(Lines)은 `syncAnchoredPositions()` 및 MessageHub 신호(`LF_SNAP_REQUEST`, `LF_COMP_RESIZED`)를 통해 실시간으로 시작/끝 좌표를 재계산하고 부드럽게 추종하도록 연동해야 한다. 드래그가 완료되면 이동된 최종 좌표 상태가 `V4UndoManager` 및 `metadata.json`에 영구히 저장되어야 한다.
- **이벤트 핸들러 연쇄 차단 방지 (Non-Blocking Event Listener Flow)**: `mouseup` 또는 `mousemove`와 같은 전역 통합 이벤트 리스너를 수정할 때, 개별 조건문(예: `isConnectorDragging`) 처리 후 `return;`으로 조기 종료를 남용하지 말라. 조기 종료 시 하위의 `isMarquee` 상태 해제(`LF_MARQUEE_END`) 및 선택 박스(`.v4-marquee-box`) 제거 로직이 차단되어 클릭 시 캔버스에 파란색 점 잔상이 생성되거나 다중선택 드래그가 마비되는 사이드 이펙트가 발생하므로, 모든 상태 해제 연산은 독립 순차 구문으로 전개해야 한다.
- **오브젝트 프로퍼티(인스펙터) 4중 안전망 동기화 파이프라인 (Inspector Property Synchronization SSOT)**:
  - **버그 배경**: 동일 쉐입(Rect 100x100 ➔ Rect 200x200 등) 연속 선택 시, 인스펙터 패널 섹션이 닫히지 않고 열려 있는 상태에서 부모 입력 필드의 포커스 잔류나 `state.editingIndex` 선행 갱신 레이스 컨디션으로 인해 새 객체의 크기(Width/Height)가 갱신되지 않고 이전 값으로 고정되던 문제를 원천 차단하기 위해 4중 안전망을 구축한다.
  - **1. CoreRouter 선행 백업 & 포커스 해제**: `vctrl_core_router.js`에서 `state.editingIndex`를 대입하기 전 이전 선택 ID를 백업(`const isNewSelection = (state.previousEditingIndex !== data.id)`), 신규 선택 시 부모 창의 활성 인풋 포커스를 즉시 해제(`document.activeElement.blur()`), `window.updateProperties(data, isNewSelection)`로 명시적 신규 선택 플래그 전달, 이후 `state.previousEditingIndex = data.id`를 안전하게 갱신한다.
  - **2. 인스펙터 3중 판정식 & 크기 인풋 직접 대입**: `vctrl_inspector.js`의 `updateProperties(compStyles, isNewSelectionExplicit)`에서 `const isNewComp = isNewSelectionExplicit === true || compStyles.id !== state.previousEditingIndex || compStyles.id !== state._lastInspectorCompId;` 3중 판정 적용. `isNewComp`일 때 `isTypingInInspector = false`로 강제 리셋하여 조기 return 방지. `_syncCommonPropertyControls`에서 `DOM.propWidth`, `DOM.propHeight` 등의 공통 크기 인풋에 대해 포커스 상태와 무관하게 `DOM.propWidth.value = Math.round(compStyles.w)`로 직접 값을 대입하여 화면 표시를 100% 강제 동기화한다.
  - **3. LF_COMP_SELECTED 강제 프로퍼티 갱신**: `vctrl_properties.js`에서 대상 컴포넌트 ID가 변경된 경우(`targetId !== activeCompId`), 부모 activeElement를 즉시 blur 처리하고 `updateAllInputs(w, h, force = true)`를 호출하여 포커스 가드를 확실히 우회함으로써 이전 크기 수치가 화면에 잔존하지 않도록 강제 동기화한다.
  - **4. Iframe 캔버스 클릭 시 부모 잔류 포커스 즉시 정리**: `vctrl_iframe_script.js`에서 컴포넌트 `mousedown` 시 `window.parent?.document?.activeElement?.blur()`를 호출하여 부모 창 인풋에 남아있던 캐럿과 포커스를 즉각 정리한다 (백틱 충돌 0건 원칙 준수).
- **오브젝트 프로퍼티 정렬(ALIGNMENT) 엔진 및 가시 뷰포트 통합 아키텍처 (Visible Viewport Alignment SSOT)**:
  - **단일 및 다중 오브젝트 정렬 일원화**: 단일 선택(`items.length === 1`) 시 ALIGNMENT 패널을 강제 은닉하던 `selIds.length > 1` 제한을 철폐하고, 단일 객체에서도 캔버스 또는 소속 프레임 기준 6대 정렬(`Left, Center, Right, Top, Middle, Bottom`)을 상시 지원한다 (단, 분배 정렬은 3개 이상 선택 시만 활성화).
  - **반응형 가시 뷰포트 정렬 수학 (Visible Viewport Math)**: PC 프레임 긴 문서(`1500px+`)에서 `offsetHeight` 전체를 기준으로 정렬하여 오브젝트가 화면 밖으로 추락하던 버그를 원천 차단하기 위해, 현재 스크롤 위치(`scrollTop`)와 뷰포트 높이(`clientHeight || 810px`)를 결합한 가시 뷰포트 수학을 강제한다:
    - 수직 중앙(`middle`): $\text{targetT} = \text{boundT} + \frac{\text{boundH} - \text{item.h}}{2}$ (여기서 $\text{boundT} = \text{scrollContainer.scrollTop}$, $\text{boundH} = \text{scrollContainer.clientHeight}$).
    - 하단(`bottom`): $\text{targetT} = \text{boundT} + \text{boundH} - \text{item.h} - 10$ (하단 10px 안전 여백).
  - **정렬 후 조작 인터페이스 실시간 동기화**: 정렬 연산 완료 후 DOM `style.left/top` 갱신에 그치지 않고, 반드시 `window.updateHandles(el)` 및 `window.SelectionAdorner.update()`를 호출하여 드래그 핸들(`.lf-drag-handle`), 리사이저(`.lf-resizer`), 선택 박스, 부모 창 인스펙터(X/Y 좌표)를 1:1로 실시간 갱신한다.
  - **부모 창 `alignSelected` 안전 가드**: `activeIds`가 비어있을 때 `window.state.selectedComponent.id`로 fallback하는 안전 가드를 적용하여 단일 선택 상태에서도 인스펙터 정렬 버튼 클릭이 100% 정상 작동하도록 보장한다.

## Connector and Cross-Window Interaction Principles
- **Iframe Occlusion Protection**: 부모 창에서 드래그 인터랙션(커넥터 핸들 등)이 발생할 때, 마우스가 iframe 위로 올라가면 이벤트가 끊길 수 있다. `mousedown` 시 iframe에 `pointer-events: none`을 설정하고 `mouseup` 시 `auto`로 복구하여 끊김 없는 드래그를 보장하라.
- **Iframe Coordinate Normalization**: 부모 창에서 iframe 내부 요소의 물리적 위치(예: 드래그 중인 포트 커넥터 등)를 계산할 때, `getBoundingClientRect()` 결과에 iframe 자체의 `left`, `top` 오프셋을 반드시 더해주어야 부모 창 기준의 정확한 절대 좌표를 얻을 수 있습니다. 단, 스마트 가이드의 오브젝트 간 스냅 계산 시에는 줌 오차가 없는 `style.left/top` 기반의 Pure Data 연산을 우선합니다.
- **Scale/Zoom Compensation (부모 창 전용)**: 부모 창에서 드래그나 드롭 인터랙션을 처리할 때, 부모 창의 마우스 이벤트(`e.clientX`, `e.clientY`)는 브라우저 전체 창 기준의 물리 스크린 좌표(Scaled)이므로, iframe 내부 가상 캔버스 좌표로 변환할 때 반드시 현재 스케일 값(`window.state.transform.scale`)으로 나누어 보정해야 한다.
- **Iframe 내부 이벤트 언스케일드 원칙 (Iframe Unscaled Invariant)**: 반대로 iframe 내부 문서에서 발생하는 모든 마우스 이벤트(`e.clientX`, `e.clientY`)는 브라우저 렌더러가 이미 iframe 뷰포트(1600x900)에 맞게 역변환(Unproject)하여 전달하므로 이미 순수 논리 픽셀이다. 따라서 `vctrl_iframe_drag.js`, `vctrl_iframe_ports.js`, `vctrl_iframe_script.js` 등 iframe 내부 스크립트에서는 `dx = e.clientX - startX`를 절대 `scale`로 다시 나누지 말고 1:1 논리 좌표로 직접 연산해야 한다 (이중 보정 버그 원천 금지).
- **교차 창 좌표계 화해 (Coordinate Reconciliation)**: 
  - **iframe 내부**: `style.left/top` 및 내부 엘리먼트의 `getBoundingClientRect()`는 `body` 기준의 **논리 좌표(Unscaled)**이며, 모든 객체의 기준점이 된다.
  - **부모 창**: 부모 창의 `getBoundingClientRect()`는 **물리적 스크린 좌표(Scaled)**를 반환하므로, 줌 배율(`scale`)로 나누어 보정해야 한다.
  - **통합 로직**: 다중 선택(Marquee) 및 교차 검사 시, 반드시 **이프레임 바디(Global Root)**를 기준점(Origin)으로 삼아 모든 좌표를 가상 공간으로 변환(Normalize)한 뒤 연산하라.

- **Performance Optimization (rAF)**: 커넥터 재그리기와 같이 연산량이 많은 실시간 업데이트는 `requestAnimationFrame`을 사용하여 브라우저 주사율에 최적화하라.
- **Selection Protection**: iframe 내부 클릭 시 발생하는 `LF_DESELECT`와 같은 전역 선택 해제 메시지가 현재 진행 중인 부모 창의 인터랙션(커넥터 드래그 등)을 강제로 중단시키지 않도록 방어 로직을 구축하라.
- **Z-Index Layering**: 커넥터 레이어와 같이 마우스 이벤트를 직접 받아야 하는 SVG 레이어는 iframe보다 높은 `z-index`(예: 10001)를 가져야 하며, 내부의 핸들/히트박스에는 `pointer-events: auto`를 명시적으로 부여해야 한다.
- **Selection Loop Protection**: `LF_COMP_SELECTED` 메시지를 구독하여 기존 선택을 해제(clearSelection)하는 로직을 작성할 때, 현재 내가 선택한 컴포넌트(예: `isConnector: true`)에 대한 메시지까지 처리하여 자기 자신을 해제하지 않도록 메시지 데이터를 필터링하라.

## 🏗️ Unified Object Architecture (Established)
- **Terminology**: Text Boxes, Shapes, Atoms, and Lines are collectively referred to as **'모든 오브젝트' (All Objects)**.
- **Common Object Protocol (4원칙)**: 모든 객체(텍스트, 도형, 선, 아톰 등)는 예외 없이 다음 4가지 동작을 보장해야 한다.
  1. 드래그(Marquee) 및 Shift+Click을 통한 **다중 선택, 그룹화(Ctrl+G), 해제** 보장
  2. 선택 상태에서 **화살표 키(`ArrowUp` 등)를 이용한 픽셀 단위 그룹 이동** 보장
  3. `Delete` 또는 `Backspace` 키보드 입력을 통한 **즉각 삭제** 보장
  4. 객체의 이동, 생성, 삭제, 그룹화 등 모든 상태 변경 전 **`V4UndoManager.saveState()` 호출을 통한 Ctrl+Z (Undo) 보장**
- **Global Screen Layer**: 모든 오브젝트는 iframe 내부의 **`document.body`**에 직접 위치한다. 특정 템플릿 영역(`.mobile-content` 등)에 종속되지 않음으로써 스크린 어디서든 자유로운 배치와 그룹화가 가능하다.
- **Unified Coordinate System**: 모든 오브젝트는 고정 픽셀(**px**) 단위를 사용한다. 더 이상 퍼센트(%) 단위를 사용하지 않아 단위 변환 오차가 발생하지 않는다.
- **Auto-Migration Strategy**: 스크린 로드 시 `%` 좌표가 발견되면 `enforceDesignSystem`을 통해 현재 화면 크기 기준의 **절대 픽셀(`px`)**로 즉시 자동 변환한다. 이는 그룹화 엔진이 `style.left/top` 데이터를 안전하게 산술 연산하기 위한 전제 조건이다.
- **Zero-Drift Measurement**: 크기 측정(`offsetWidth/Height`) 시에는 반드시 UI 핸들(.lf-drag-handle 등)을 일시적으로 숨겨서, 핸들 여백이 논리적인 객체 크기를 왜곡하지 않도록 처리해야 한다.
- **Persistence**: 저장 시 HTML DOM 스냅샷이 주체(SSOT)가 된다. 텍스트 마커의 경우 호환성을 위해 `metadata.json`의 `description` 리스트를 유지하지만, 이 또한 항상 `body` 기준의 절대 픽셀 좌표로 동기화되어야 한다.

## 📱 Responsive PC & Mobile Template Engine Architecture
- **Dedicated Multi-Selection Interceptor (`vctrl_responsive_multiselect.js`)**:
  - 반응형 스크린의 중첩 스크롤 컨테이너(`.pc-content-inner`, `.mobile-content-inner`) 내부 요소들은 마키 드래그 시 좌표 오차가 발생하므로, `LF_MARQUEE_START` 발생 시 `isResponsiveScreen()` 가드를 통해 실시간 Bounding Rect를 재계산(`recalculateTargetsForResponsive`)하여 정밀 스냅을 보장한다.
- **Cross-Frame Clipboard Pipeline (`vctrl_shortcuts.js`)**:
  - `isResponsiveTemplate` 엄격 가드를 통해 비반응형 템플릿과 100% 분리 실행.
  - `window.lastActiveFrame` (`'pc'` / `'mobile'`) 및 `.active-column`을 감지하여 타겟 컨테이너(`mobileInner` / `pcInner`)로 자동 라우팅.
  - PC → Mobile 복사 시 가로폭 330px 자동 클램핑 및 안전 여백 보정.
  - Mobile → PC 복사 시: 1160px 너비의 넓은 PC 캔버스에 원본 비율과 오프셋을 유지하며 매끄럽게 안착된다.
- **Viewport-Center Paste Algorithm (`pasteCopiedObjectsFromData`)**:
  - 반응형 화면: 활성 프레임의 현재 스크롤(`scrollTop`)과 뷰포트 높이(`clientHeight`)를 기반으로 현재 시야 정중앙(`viewCenterY = scrollTop + clientHeight/2`)에 바운딩 박스 중심을 정렬.
  - 일반 화면: 캔버스 줌/팬 좌표(`state.transform`)를 역연산하여 사용자 화면 중심에 정렬.
  - 다중 선택 및 그룹의 상대 좌표 간격(`relX`, `relY`)을 1:1로 온전히 보존.
- **Canvas Subpixel Jitter Protection (`vctrl_canvas_viewport.js`)**:
  - `centerView()` 연산 시 100% 배율 근처(0.96x 이상)는 정확히 `scale: 1.0`으로 스냅하고, `translate` 좌표를 `Math.round()` 정수 픽셀로 고정하여 iframe 내부 텍스트의 래스터화 블러를 원천 방지한다.
- **Dedicated Responsive SmartGuide Engine (`vctrl_responsive_smartguide.js` & `vctrl_shortcuts.js`)**:
  - **Frame Boundary 4-Wall Distance**: 프레임 내부 오브젝트 이동 시 상/하/좌/우 4방향 테두리(`wall-left`, `wall-right`, `wall-top`, `wall-bottom`)와의 물리적 거리를 픽셀 단위로 정밀 측정하여 실시간 핑크 뱃지 및 가이드선을 표시한다.
  - **Expanded Spacing Detection**: 오브젝트 간 사이 간격을 200px 이상 광범위하게 탐지하여 실무 레이아웃 간격을 완벽히 지원한다.
  - **Synchronous Keyboard Nudge Pipeline**: `vctrl_shortcuts.js`에서 화살표 키(`ArrowUp/Down/Left/Right`, `Shift + Arrow`)로 오브젝트를 이동할 때 `window.ResponsiveSmartGuide.onNudge(activeEl)`를 동기 호출하여 1프레임의 지연 없이 즉각적으로 테두리 및 오브젝트 거리 뱃지를 렌더링한다.
- **Smart In-Place Undo & Scroll Preservation Engine (`vctrl_undo.js`)**:
  - **스크롤 컨테이너 보존 (In-Place DOM Swap)**: 반응형 템플릿의 `undo()` 시 `document.body.innerHTML = ''`를 실행하면 `.pc-content-area`와 `.mobile-content-area` 스크롤 컨테이너 자체가 DOM에서 삭제되어 브라우저가 스크롤을 무조건 `0px`로 리셋한다. 따라서 반드시 `.pc-content-inner`와 `.mobile-content-inner`의 자식 노드(`innerHTML`) 및 `minHeight` 스타일만 핀포인트로 교체하는 In-Place 복원 전략을 수행해야 한다.
  - **`scroll-behavior: smooth` 제거**: 스크롤 컨테이너에 `scroll-behavior: smooth`가 있으면 JS의 `scrollTop = N` 복원이 비동기 애니메이션 큐에 묶여 무시되거나 리셋되므로, 즉각적인 1:1 반응을 위해 auto 모드를 유지한다.
  - **실시간 스크롤 캡처 & 다중 프레임 rAF 보정**: 조작 중 `{ passive: true }` 스크롤 리스너로 뷰포트 좌표를 유지하고, Undo 직후 `requestAnimationFrame` 연속 프레임 루프를 통해 레이아웃 비동기 지연에 따른 0px 클램핑을 원천 차단한다.
- **Single & Multi-Object Alignment Engine (`vctrl_shortcuts.js`, `vctrl_grouping.js`, `vctrl_iframe_script.js`)**:
  - `Ctrl + 1 ~ 6` 및 `Alt + 1 ~ 6` 단축키를 단일 및 다중 선택 상태 모두에서 완벽 지원한다.
  - `items.length === 1` 분기: 일반 템플릿은 1600x900 전체 캔버스 기준, 반응형 템플릿은 PC(`1160px`) / Mobile(`360px`) 소속 프레임 내에서 1:1 정수 픽셀(`Math.round`)로 독립 정렬을 수행한다.
  - `isInputActive` 가드를 적용하여 텍스트 상자, 셀 입력, Quill 에디터 편집 중에는 단축키 간섭을 원천 방지한다.

## 📌 Responsive Scroll Pin & Smart HUD Fixed Engine Architecture (vctrl_iframe_scroll_pin.js & Inspector)
- **4 Object Pinning Modes (`data-scroll-fixed`)**:
  - `top`: Viewport top-aligned fixed HUD. Slides into view or slides out based on `data-scroll-effect`. $\Delta Y = \text{scrollTop} - \text{domTop}$.
  - `bottom`: Viewport bottom-aligned fixed dock/CTA. Sticks to bottom regardless of scroll. $\Delta Y = \text{scrollTop} + (H_{\text{viewport}} - \text{domTop} - H_{\text{el}})$.
  - `custom` / `floating`: Viewport-relative floating HUD maintaining designer's dragged position ($Y_{\text{target}}$ via `data-scroll-target-y`). $\Delta Y = \text{scrollTop} + (Y_{\text{target}} - \text{domTop})$.
  - `sticky`: Threshold sticky HUD that flows with the document until reaching threshold offset ($Y_{\text{stickyOffset}}$ via `data-scroll-sticky-top`), then sticks. $\Delta Y = \max(0, \text{scrollTop} - \text{threshold})$.
  - `none`: Unpinned standard flow element ($\Delta Y = 0$, `transform` removed).
- **Description Pin Anchoring**:
  - `viewport` (화면 핀 고정 📌): Independent viewport-anchored pin marker (`z-index: 200050 !important`). Displays mini pin icon on canvas and `[고정 📌]` badge in sidebar description list.
  - `host-pinned`: Follows host element's dynamic transform with zero jitter (`data-fixed-host`).
- **Scroll Direction Effects (`data-scroll-effect`)**:
  - `always`: Always visible and fixed (default).
  - `hide-down`: Smoothly slides up/out when scrolling down, instantly reveals when scrolling up.
  - `hide-up`: Smoothly slides down/out when scrolling up, instantly reveals when scrolling down.
- **Inspector UX Architecture (`#selection-scroll-pin-bar`)**:
  - **3+2 Segments**: Row 1 (`[일반]`, `[상단]`, `[하단]`) + Row 2 (`[플로팅]`, `[스티키]`) eliminates text ellipsis in tight sidebars.
  - **Dynamic `#scroll-pin-effect-bar`**: Select dropdown for `always`, `hide-down`, `hide-up` active on top/bottom pinned modes.
  - **Dynamic `#scroll-pin-offset-bar`**: Numeric px input for target Y or sticky top threshold.
- **Engine Safety & Robustness**:
  - Container-level state (`lastScrollTop`, `direction`, `isHidden`) is held in a `WeakMap`, preventing memory leaks and cross-container bleed.
  - Transforms are applied via single `requestAnimationFrame` loop, avoiding layout reflows and preserving smooth 60fps scrolling.
  - In-Place Undo cleanly resets and restores element transforms without dropping pinning attributes.

## 🥞 Unified 8-Tier Z-Index Architecture & Layer Ordering Pipeline (vctrl_iframe_layering.js & Pin Overlay)

### 1. 전사 Z-Index 8대 티어 단일 진실 공급원 (`window.V4_Z_TIERS`)
- **도입 배경**: 캔버스 내 일반 컨텐츠, 드롭다운, 스크롤 고정 HUD, 디스크립션 번호 핀, 시스템 오버레이, 전역 모달이 임의의 큰 숫자(예: 9999, 100000 등)를 중구난방으로 사용하여 객체 간 위/아래 순서가 꼬이고 어드민 테이블 등 격리 컨텍스트에 핀이 가려지던 문제를 원천 해결하기 위해 8개 배타적 수치 대역을 정의하고 전사 표준으로 강제합니다.

| 티어 (Tier) | 명칭 (Name) | Z-Index 수치 대역 | 주요 소속 요소 및 정책 |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Base / Background | `0 ~ 999` | 캔버스 베이스라인, `#canvas_bg_layer` (`0`), 그리드 가이드선 (`10`) |
| **Tier 2** | Content Components | `1,000 ~ 69,999` | 일반 도형, 텍스트, 아톰, 테이블, 커넥터, 일러스트 등 캔버스 상의 모든 표준 컨텐츠 컴포넌트 (초기 기본값 `1,000`, 생성 시 `+10` 증분). 티어 상한선 `69,900`. `69,000` 도달 시 비례 압축(`compactZIndices`)을 통해 공간 자동 정돈 |
| **Tier 3** | Active Selection & Marquee | `70,000 ~ 79,999` | 선택 바운딩 아웃라인, 리사이즈 핸들(`.lf-drag-handle`, `.lf-resizer`), 마키 드래그 박스(`.v4-marquee-box` = `70,000`) |
| **Tier 4** | In-Canvas Dropdowns & Popups | `80,000 ~ 99,999` | 셀렉트박스 드롭다운 리스트, 캔버스 인라인 팝업(`.v4-atom-popup` = `80,000 ~ 85,000`) |
| **Tier 5** | Virtual Sticky HUD (Scroll Pinned) | `100,000 ~ 179,999` | 상단 헤더, 하단 독, 플로팅 툴바, 스티키 바 등 `data-scroll-fixed`가 부여된 스크롤 고정 요소 (`100,000 ~ 179,900`) |
| **Tier 6** | Annotation Pin Dedicated Layer | `200,000 ~ 299,999` | 디스크립션 핀 전용 오버레이 컨테이너(`.v4-pin-layer` = `250,000 !important`), 일반 본문 핀(`.pin-marker` = `200,000`), 스크롤 고정 호스트 핀(`data-scroll-fixed="viewport"` = `200,050`) |
| **Tier 7** | System Overlays | `300,000 ~ 499,999` | 스마트 가이드 자석선(`.smart-guide-line` = `300,000`), 프레임 레이블 바(`.frame-label-bar` = `350,000`), 스마트 프레임 스위처(`v4-frame-switcher` = `350,000`) |
| **Tier 8** | Global Modals & Context Menus | `500,000 ~ 999,999` | 최상위 다이얼로그, 전역 컨텍스트 메뉴, 프레젠테이션 펜 캔버스 (`500,000 ~ 999,999`) |

### 2. 4단계 정밀 레이어 순서 제어 엔진 (4-Operation Layer Suite)
- **모듈 소유**: `assets/vctrl_iframe_layering.js` (`window.handleBringToFront`, `window.handleBringForward`, `window.handleSendToBack`, `window.handleSendBackward`).
- **단축키 및 동작 사양**:

| 동작 (Action) | 키보드 단축키 (Win / Mac) | 메시지 액션 | 동작 메커니즘 및 무결성 보장 |
| :--- | :--- | :--- | :--- |
| **맨 앞으로 가져오기** | `Ctrl + Shift + ]` / `Cmd + Shift + ]` | `LF_BRING_FRONT` | 현재 요소가 속한 티어의 최상위 값(`normal` 티어의 경우 최대 `69,900`, `fixed` 티어의 경우 `179,900`)으로 안전하게 캡핑 승격. 상위 계층(핀 레이어 등) 침범 차단 |
| **한 단계 앞으로** | `Ctrl + ]` / `Cmd + ]` | `LF_BRING_FORWARD` | 동일 티어 내에서 자신보다 바로 위에 위치한 형제 요소 1개와 z-index 단일 스텝 스왑(Swap). 상위 형제가 없으면 무동작 유지 |
| **맨 뒤로 보내기** | `Ctrl + Shift + [` / `Cmd + Shift + [`` | `LF_SEND_BACK` | 현재 요소가 속한 티어의 바닥선(`1,000`)으로 안전하게 이동. 0 이하 음수 추락을 막기 위해 필요한 경우 전체 형제 요소의 z-index를 양수로 일괄 쉬프트 보정 |
| **한 단계 뒤로** | `Ctrl + [` / `Cmd + [` | `LF_SEND_BACKWARD` | 동일 티어 내에서 자신보다 바로 아래에 위치한 형제 요소 1개와 z-index 단일 스텝 스왑(Swap). 하위 형제가 없으면 무동작 유지 |

- **실행 취소(Undo) 보장**: 모든 레이어 변경 작업 전 `V4UndoManager.saveState()`를 자동 호출하여 `Ctrl + Z`로 1프레임 즉시 복원할 수 있습니다.
- **자동 비례 압축 (`compactZIndices`)**: 컴포넌트 추가 및 승격이 반복되어 티어 상한선인 `69,000`에 도달하면, 기존 상대적 z-order 순서를 100% 보존하면서 `1,000`부터 `+10` 간격으로 비례 재배치하여 공간을 자동 정돈합니다.

### 3. 디스크립션 핀 Stacking Context 격리 극복 및 전용 오버레이 (`.v4-pin-layer`)
- **문제 정의**: 어드민 테이블(`v4-comp-1791427509333`)과 같이 `isolation: isolate; contain: paint; transform: translateZ(0);` 속성을 갖는 복합 컴포넌트가 존재할 때, 일반 DOM 형제 노드로 배치된 핀은 z-index가 아무리 높아도 해당 컴포넌트의 독립 Stacking Context 아래로 묻혀 텍스트나 표 뒤로 가려지는 브라우저 렌더링 한계가 존재했습니다.
- **전용 오버레이 컨테이너 강제 (`ensurePinLayer`)**:
  - 반응형 프레임 컨테이너(`.pc-content-inner`, `.mobile-content-inner`) 내부에 디스크립션 핀(`.pin-marker`)을 일반 형제 노드로 직접 방치하는 것을 원천 금지합니다.
  - 최상위에 전용 오버레이 컨테이너인 `.v4-pin-layer` (`position: absolute; inset: 0; pointer-events: none; z-index: 250000 !important; width: 100%; height: 100%; overflow: visible;`)를 생성하고, 모든 핀은 반드시 이 레이어의 자식으로 배치합니다.
  - `.pin-marker` 자체는 `pointer-events: auto`를 부여하여 캔버스 상의 핀 클릭 및 드래그 인터랙션을 100% 유지합니다.
- **자가 치유 (Self-Healing Migration)**: 핀 생성 또는 스크린 로드 시, 컨테이너 내부에 일반 노드로 방치된 기존 레거시 핀이 감지되면 `ensurePinLayer`가 즉시 `.v4-pin-layer` 내부로 자식 노드를 자동 이전하여 시각적 격리를 즉각 해제합니다.
- **뷰포트 스크롤 동적 안착**: 스크롤이 내려간 긴 문서에서 핀을 생성할 때, 고정된 상단 좌표가 아닌 현재 스크롤 뷰포트를 실시간 반영(`spawnPcX: 570, spawnPcY: 180 + scrollY`)하여 생성 즉시 화면 시야 내에 안전하게 안착시킵니다.

### 4. 클립보드 복사/붙여넣기 레이어 라우팅 및 `trailingRef` 보호
- **`trailingRef` 핀 레이어 오염 차단**: 오브젝트 복사/붙여넣기(`vctrl_clipboard_objects.js`의 `pasteCopiedObjectsFromData`) 시 새 요소가 캔버스 맨 끝에 단순 `appendChild` 되면 `.v4-pin-layer` 뒤로 배치되어 핀 레이어가 오염될 수 있습니다. 이를 방지하기 위해 `trailingRef` 판별 로직에서 `.v4-pin-layer`를 감지하여 반드시 핀 레이어 직전(Before) 형제 위치로 컴포넌트를 주입합니다.
- **티어별 안전 상한선 자동 리베이스**: 붙여넣을 때 원본의 z-index가 비정상적으로 높더라도 일반 컴포넌트는 `V4_Z_TIERS.NORMAL.MAX` (`69,900`), 스크롤 고정 요소는 `V4_Z_TIERS.VIRTUAL_HUD.MAX` (`179,900`)로 안전하게 클램핑하며, 다중 선택 객체 간의 내부 상대 z-order 오프셋은 1:1로 온전히 보존합니다.

### 5. 스크롤 핀 고정 및 해제 라이프사이클 (Scroll Pinning / Unpinning Lifecycle)
- **핀 고정 시 (Promotion to Tier 5)**:
  - 요소를 Tier 5 (`100,000 ~ 179,999`)로 승격하고 `data-scroll-fixed` 속성을 부여하여 `window.ScrollPinEngine`의 하드웨어 가속 트랜스폼 루프에 편입합니다.
  - 호스트 컴포넌트에 종속된 디스크립션 핀은 `data-fixed-host="[id]"` 및 `data-scroll-fixed="viewport"` 속성을 부여받아 호스트 이동을 실시간 추종하며, 핀 레이어 내부에서 `z-index: 200050`으로 정렬됩니다.
- **핀 고정 해제 시 (Safe Demotion to Tier 2)**:
  - `data-scroll-fixed` 및 관련 데이터 속성을 완전 삭제합니다.
  - GPU 하드웨어 가속 트랜스폼(`transform`, `will-change`, `transition`) 인라인 스타일을 `removeProperty`로 완벽히 소거합니다.
  - z-index를 Tier 5의 고수치 대역에 방치하지 않고, 일반 컴포넌트 티어의 현재 최댓값 기반(`Math.min(69900, maxNormalZ + 10)`)으로 안전하게 강등(Demotion)하여 타 일반 컴포넌트들과 정상적인 레이어 순서 제어가 가능하도록 복원합니다.
