# bychoi workspace를 위한 Antigravity / Gemini 에이전트 제약 조건

## 🚨 [최우선 불변 규칙] 작업 착수 및 완료를 위한 7대 필수 게이트웨이 (7 Mandatory Gateways)
> 에이전트는 사용자의 어떤 요청(신규 기능 개발, 버그 수정, 성능 개선, 분석, 리팩토링 등)을 수행하더라도, 
> 코드를 수정하거나 명령어를 실행하기 전/후에 아래 7대 필수 게이트웨이를 무조건 통과해야 하며 어떠한 예외도 허용되지 않습니다.

1. **[운영 시스템 무결성 보장] (Strict Production Integrity)**:
   - 본 시스템은 실제 서비스 중인 실무 운영 시스템이다. 절대 실수나 데이터 유실이 없어야 한다.
   - 땜질식 임시 가짜 데이터(Mock/Dummy Fallback)나 임의의 하드코딩 객체 주입을 전면 금지하며, 원본 데이터(`metadata.json`, 스크린 HTML 등)의 실체를 100% 보존하고 실제 디스크 데이터만을 정직하게 처리한다.

2. **[사전 정밀 심층 분석 & 룰/스킬 확인 & 사전 계획 수립] (Deep Analysis & Plan First)**:
   - 코드 한 줄이라도 수정하기 전에 관련 소스코드(`vctrl_*.js`, 스타일, 인스펙터 등)와 연관 스킬(`SKILL.md`) 및 시스템 룰(`AGENTS.md`)을 전수 분석한다.
   - 변경 목적, 영향 범위, 구현 절차를 사전에 명확히 수립(대규모 작업 또는 사용자 요청 시 사전 계획서 작성)한 뒤 안전하게 착수한다.

3. **[사이드이펙트 원천 차단] (Zero Side-Effects)**:
   - 전역 이벤트 리스너(`mouseup`, `keydown` 등), 공통 통신 버스, 타 컴포넌트(도형, 아톰, 테이블 등) 렌더링에 간섭이 없도록 모듈 격리와 스코프 가드를 철저히 적용한다.
   - 단일 기능 수정으로 인해 기존에 잘 동작하던 기능이 중단되는 회귀(Regression)를 원천 차단한다.

4. **[스크립트/런타임 에러 0건] (Zero Script/Runtime Errors)**:
   - 변수/함수 미정의(`ReferenceError`), `null`/`undefined` 속성 접근(`TypeError`), 이벤트 핸들러 누락 등으로 인한 브라우저 콘솔 에러를 100% 방지한다.
   - 안전한 옵셔널 체이닝(`?.`)과 유효성 검증 가드를 필수로 둔다.

5. **[백틱(템플릿 리터럴) 충돌 에러 0건] (Zero Backtick Syntax Collisions)**:
   - `vctrl_iframe_script.js`, `vctrl_text_measurer.js`, `assets/templates.js` 등 파일 전체가 백틱(`` ` ``)으로 감싸져 부모 측에서 동적으로 평가(eval/srcdoc 주입)되는 파일 내부에서는 중첩 백틱(`` ` ``) 및 변수 보간(`${...}`) 사용을 전면 금지한다.
   - 반드시 표준 따옴표(`'` 또는 `"`)와 문자열 연결 연산자(`+`)만을 사용하여 문법 충돌(`SyntaxError`)을 차단한다.

6. **[구문/브래킷 에러 0건 및 자동 정적 검증 강제] (Zero Syntax Errors & Mandatory Verification)**:
   - 중첩 괄호, 삼항 연산자, 블록 매칭 불일치로 인한 구문 에러를 원천 차단한다.
   - 코드 수정 완료 후 사용자에게 보고하기 전에 반드시 `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1`을 자체 구동하여 전체 파일의 브래킷/백틱/구문 무결성이 100% 통과(0 Errors)되었음을 확인한 후 완료 보고한다.

7. **[CORS 에러 0건 및 통신 프로토콜 준수] (Zero CORS Errors)**:
   - 부모 창과 Iframe 간에 `contentDocument` 직접 접근 등 SOP(동일 출처 정책) 위반 및 CORS 차단을 유발하는 코드를 절대 작성하지 않는다.
   - 반드시 표준 인터페이스인 `MessageHub` 및 `window.EditorBus`(`sendToIframe` / `sendToParent`)를 통해서만 안전하게 통신한다.

## 🤖 Gemini 3.8 Flash / Antigravity 에이전트 가이드라인
- **자율 실행 및 로컬 자체 완결 (Autonomous Local Execution)**: 사용자의 수동 승인(Accept / Submit / Run Confirm) 절차를 완전히 배제하고 작업 속도를 극대화하기 위해, PowerShell 명령어 실행(`run_command`), 코드 수정, 파일 생성, 정적 검증, 디버깅 등의 모든 작업은 중간 질문이나 사용자 확인 대기 없이 에이전트가 자체 판단하여 무조건 자동으로 즉시 실행하고 로컬에서 끝까지 완결 후 결과만 명확히 보고합니다. (단, 상기 '7대 필수 게이트웨이' 사전/사후 검증 절차는 필수적으로 거칩니다.)
- **PowerShell / 터미널 작업 무조건 자동 실행 (Unconditional Auto-Run)**: 터미널 명령어나 검증 스크립트 실행 시 사용자에게 확인을 요청하지 않고 자율적으로 즉시 구동하여 신속하게 문제 해결 및 검증을 완료합니다.
- **온디맨드 자동 GitHub 배포 (Automated On-Demand Deployment)**: GitHub 원격 저장소(`main`)로의 커밋 및 푸시는 사용자가 명시적으로 "배포", "푸시", 또는 "동기화"를 요청했을 때 추가 컨펌(확인 질문) 대기 없이 즉시 자동으로 커밋 및 푸시하여 동기화를 완료합니다. (평상시 일상 작업 중에는 불필요한 자동 푸시를 지양하고 로컬 완결을 유지하며, 브라우저 UI 측의 자동 저장 커밋으로 인한 충돌을 방지하기 위해 푸시 전 항상 `git pull --rebase origin main`을 선행하여 안전하게 동기화합니다.)
- **엄격한 규칙 이행**: 사용자가 지정한 아키텍처 규칙, SSOT(Single Source of Truth), 인코딩 및 마스킹 표준을 예외 없이 100% 준수해야 합니다.
- **정밀 심층 분석**: 코드를 수정하기 전 관련 모듈(`vctrl_*.js`)과 템플릿, 스타일시트를 전수 분석하여 예기치 못한 사이드이펙트를 원천 차단합니다.
- **오류 자가 검증**: 대량 수정 후에는 브래킷 매칭, SyntaxError, ReferenceError 발생 여부를 엄격히 확인합니다.

## 🔍 시스템 전체 정밀 진단 6대 필수 기준 프로토콜 (System-wide Deep Inspection Protocol)
> 사용자가 **"시스템 전체 정밀 진단"**을 요청했을 때는 모든 소스 파일(JS, CSS, HTML, 템플릿, 스크립트, 데이터 등)을 **전수 조사(Full-File Census)**하여 아래 6대 조치 필요 항목을 분석하고 정량적 결과 및 개선안을 도출해야 합니다.
> - **진단 실행 스크립트**: `powershell -ExecutionPolicy Bypass -File scripts/diagnose_system.ps1` (내부적으로 Node VM 기반 6대 점검 엔진 `scripts/diagnose_deep_inspection.js` 자동 구동).
> - **연계 스킬**: `@./.agents/skills/workspace-editor-system-diagnosis/SKILL.md`
>
> 1. **[파일 분리 처리 (신규 파일 생성)]**: 파일이 너무 무거워 단일 책임(Single Responsibility)을 벗어난 파일(35KB 이상 또는 750라인 이상)을 식별하고, 관심사별 독립 신규 파일 분리 계획을 수립합니다.
> 2. **[사용하지 않는 불필요한 소스 삭제]**: `viewer.html` / `index.html` 어디서도 로드되지 않거나 어디서도 호출되지 않는 고아 파일(Orphan files), 레거시 미사용 함수, 대규모 주석 데드 코드를 탐색하여 안전하게 삭제합니다.
> 3. **[동일 코드 공통화 조치]**: 서로 다른 파일에 복사-붙여넣기되어 중복 작성된 함수/유틸리티(클립보드 복사, 색상 변환, 모달, 반응형 화면 판별식 등)를 공통 SSOT 모듈(`vctrl_common.js`, `vctrl_clipboard.js`, `vctrl_system_modals.js` 등)로 일원화합니다.
> 4. **[고복잡도 코드 파편화 조치]**: 단일 함수가 150라인을 초과하거나 수많은 컴포넌트 분기가 중첩된 거대 함수(`updateProperties`, `loadScreen`, `init` 등)를 전략 패턴(Strategy Pattern) 및 도메인 핸들러 테이블로 잘게 파편화합니다.
> 5. **[룰과 스킬 업데이트 조치]**: 새로 추가/변경된 소스 모듈, 쉐입 규격, 프로토콜이 `AGENTS.md` 및 해당 `SKILL.md`에 누락 없이 100% 동기화되도록 즉시 보정합니다.
> 6. **[점검 과정 발견 개선사항 조치]**: 오프라인 번들 최신성(`templates.js`, `ui_library_fallback.js`), V8 VM 구문 검증, 백틱 충돌 방지, 메모리 누수 가드 등 시스템 안정성을 전방위로 강화합니다.

## 🛠️ 기술 스택 및 아키텍처 (엄격한 규칙)
- **Vanilla JS 전용**: 프레임워크(React, Vue 등)를 절대 사용하지 마세요. 코드는 가볍고 직관적으로 유지해야 합니다.
- **단일 진실 공급원 (SSOT)**: 모든 프로젝트 상태(화면 목록, 설명, 핀 어노테이션, 그리고 화면의 실제 순서 배열인 `screenOrder` 등)는 각 개별 프로젝트 폴더의 `metadata.json`(예: `data/p_xxxx/metadata.json`)에서만 배타적으로 관리되어야 합니다. 화면 추가, 복제, 삭제, 순서 변경 시 `metadata.json`의 `screenOrder` 배열을 반드시 함께 갱신해야 합니다. (전역 공유 `data/metadata.json`은 사용하지 않습니다.)
- **모듈러 아키텍처 (Modular Architecture)**: 엔진 안정성과 확장성을 위해 역할을 엄격히 분리합니다.
  - **`vctrl_core.js` (Core Orchestrator - Parent Side)**:
    - **역할**: 시스템의 '심장'. 전역 상태(`state`) 관리, 스크린 로딩 파이프라인, 내비게이션 보호 및 중앙 생명주기 조율을 전담합니다.
    - **인라인 엔진 파이프라인 (`ENGINE_SCRIPT_REGISTRY`)**: 스크린 로드 시점에 분리된 27개 iframe 하위 스크립트 모듈들을 `ENGINE_SCRIPT_REGISTRY` 메타데이터 배열 파이프라인을 통해 결합/컴파일하고 iframe `srcdoc`에 안전하게 주입합니다.
  - **`vctrl_storage.js` (Storage Engine - Parent Side)**:
    - **역할**: 스크린 직렬화(`getIframeHTML`), `ScreenSanitizer.cleanDOM` 정제, 버전/리비전 자동 증가, GitHub API 원격 커밋 및 저장 오버레이 UI 생명주기를 전담합니다 (`window.StorageEngine`).
  - **`vctrl_core_router.js` (Core Message Router - Parent Side)**:
    - **역할**: 부모-Iframe 간 통신 조율자. 중앙 `MessageHub` 리스너 및 23개 부모 측 코어 핸들러 테이블(`v4ParentCoreHandlers`), 부모 포커스 시 이미지 붙여넣기(`paste`)를 전담 격리합니다 (`window.CoreRouter`).
  - **`vctrl_parent_shortcuts.js` (Parent Shortcuts Engine - Parent Side)**:
    - **역할**: 부모 창의 전역 키보드 핫키(최우선 순위 `Ctrl+S`, `F2` 모드 스왑, `Shift+G` 반응형 그리드 토글, `Escape` 모달 닫기) 가드 및 캔버스 단축키(`Arrow`, `Delete`, `Space`, `Ctrl+C/V/X/G`)의 활성 iframe 프록시 토스를 전담합니다 (`window.ParentShortcuts`).
  - **`vctrl_screen_manager.js` (Screen Manager - Parent Side)**:
    - **역할**: 화면 순서 변경(`screenOrder`), 화면 추가(`+`), 복제, 삭제, 활성 스크린 전환 및 메타데이터 저장 동기화를 전담합니다.
  - **`vctrl_revision_history.js` (Project Revision History Engine - Parent Side)**:
    - **역할**: 프로젝트 재개정 이력 전용 도메인 모듈. 재개정 이력 팝업 모달(`#history-modal`), 버전/일자/작성자/개발자/변경내용 인라인 추가/수정/삭제 렌더링(`window.renderHistoryPopup`) 및 메타데이터 동기화를 전담합니다.
  - **`vctrl_clipboard.js` (Clipboard & URL Manager - Parent Side)**:
    - **역할**: 프로젝트 URL 및 스크린 공유 URL 복사, 헤더 드롭다운 메뉴 제어, 시스템 클립보드 비동기 복사 fallback(`copyTextToClipboard`), 프로젝트 간(Cross-Project) 및 탭 간(Cross-Tab) 오브젝트/서식 클립보드 하이브리드 영속화(`window.top` 메모리 + `localStorage` dual-layer SSOT)를 전담합니다.
  - **`vctrl_component_data.js` (Component Definition SSOT - Parent Side)**:
    - **역할**: V4 컴포넌트 라이브러리(`window.V4_COMPONENT_LIBRARY`)의 단일 진실 공급원. 표준 버튼, 뱃지, 텍스트박스, 텍스트에어리어, SVG 아이콘, 아톰 템플릿 마크업 및 카테고리 메타데이터를 전담 정의합니다.
  - **`vctrl_component_illustrations.js` (Illustration Catalog SSOT - Parent Side)**:
    - **역할**: 3D Admin, 2D Admin, 고객 구매 여정, 아토믹 디자인 시스템 26종 일러스트레이션 및 6종 Apple 스타일 Animated WebP 모션 인터랙션 카탈로그 메타데이터 전담 (`window.V4_COMPONENT_LIBRARY.illustrations`).
  - **`vctrl_canvas_viewport.js` (Canvas Viewport Engine - Parent Side)**:
    - **역할**: 시스템의 '손'. 캔버스 줌(`adjustZoom`), 팬(`updateTransform`), 화면 맞춤/100% 뷰 스냅(`toggleCrispView`, `centerView`), 스페이스바 패닝, 풀스크린 토글 및 전역 뷰포트 상태 관리.
  - **`vctrl_annotation_pins.js` (Annotation UI & Creation Engine - Parent Side)**:
    - **역할**: 부모 측 핀/텍스트 생성 라이프사이클(`handleTextCreation`, `handleTextboxCreation`, `getCascadedPosition`), 사이드바 설명 목록 렌더링(`renderDescriptionList`), 인라인 리치 텍스트 서식 편집 및 삭제 동기화 전담 (`window.AnnotationPins`).
  - **`vctrl_responsive_pins.js` (Universal Pin Rendering & Reorder Engine SSOT - Iframe Side)**:
    - **역할**: 일반 1600x900 캔버스 및 반응형 프레임 전체를 총괄하는 핀 마커 렌더링 및 재정렬 단일 진실 공급원(SSOT). 핀 마커 동적 렌더링, 위치 추종, 프레임 타입 판별, 번호 재정렬(`window.reorderAllPins`) 및 메타데이터 1:1 동기화 자가 치유를 전담합니다.
  - **`vctrl_connectors.js` (Connector Engine - Parent Side)**:
    - **역할**: 선/커넥터(`Line (Straight)`, `Line (Elbow)`) 전용 엔진. 캔버스 중앙 생성(`spawnLine`), 30px 자석 스냅(`collectSnapTargets`), 포트 하이라이트, 컴포넌트 이동 시 실시간 앵커 추종(`syncAnchoredPositions`) 및 인스펙터 패널 연동 전담.
  - **`vctrl_iframe_ports.js` (Port Engine - Iframe Side)**:
    - **역할**: iframe 내부 요소의 edge/port 영역 감지 및 포트 드래그 커넥터 시작 연동 전담.
  - **`vctrl_iframe_script.js` (Rendering Engine Shell - Iframe Side)**:
    - **역할**: 시스템의 '근육'. iframe 내부의 DOM 직접 조작, 기본 이벤트 리스너 바인딩, 커넥터 조작 핸들 이벤트 디스패칭(`LF_CONNECTOR_HANDLE_MOVE`) 등을 전담합니다.
    - **메시지 레지스트리 디스패처 (`window.v4MessageHandlers`)**: 거대한 `if-else` 분기문 대신 코어 핸들러 테이블 맵(`v4IframeCoreHandlers`)과 전역 `window.v4MessageHandlers` 레지스트리를 통한 초경량(10줄) 이벤트 디스패처 구조를 따릅니다. 신규 메시지 타입 추가 시 거대 if-else를 확장하지 않고 핸들러 테이블에 순수 함수로 등록해야 합니다. (백틱 충돌 0건 원칙 엄격 준수)
  - **`vctrl_iframe_drag.js` (Drag/Resize Engine - Iframe Side)**:
    - **역할**: iframe 내부 요소의 마우스 드래그 이동 및 리사이즈 조작 인터랙션을 전담합니다. 브라우저가 iframe 내부로 전달하는 마우스 이벤트(`e.clientX`, `e.clientY`)는 이미 언스케일드 논리 좌표계이므로, 드래그/리사이즈 이동량(`dx`, `dy`)에 절대 `/ scale`을 나누지 않는 순수 1:1 논리 픽셀 불변성을 유지해야 합니다.
  - **`vctrl_iframe_grid.js` / `vctrl_iframe_accordion.js` / `vctrl_iframe_tab.js` / `vctrl_object_shape.js` / `vctrl_object_connector.js`**:
    - **역할**: 특수 쉐입, 커넥터 객체, 그리드 테이블, 아코디언, 탭 계층 구조 컴포넌트의 전용 동적 렌더링 및 스타일 핸들링을 분리 전담합니다.
  - **`vctrl_undo.js` (Undo Layer - Iframe Side)**:
    - **역할**: iframe 내부의 V4UndoManager 및 Undo/Redo 로컬 상태 관리를 전담합니다.
  - **`vctrl_design_system.js` (Design Observer - Iframe Side)**:
    - **역할**: 1.6px 보더 두께 유지, % 좌표의 px 자동 마이그레이션, img-to-div 전환 및 아톰 크기 자동 보정(Design System)을 전담합니다.
  - **`vctrl_shortcuts.js` (Interaction Layer - Iframe Side)**:
    - **역할**: 키보드 핫키 단축키 바인딩, 크로스 스크린 복사/붙여넣기(`window.top.__lf_global_clipboard__`), 및 도형 서식 복사/붙여넣기(`Ctrl+Shift+C` / `Ctrl+Shift+V`, `window.top.__lf_global_style_clipboard__`) 연동을 전담합니다. 핀 재정렬은 자체 중복 구현을 배제하고 `window.reorderAllPins`로 공식 위임합니다.
  - **`vctrl_grouping.js` (Interaction Layer)**:
    - **역할**: 다중 요소 관리자. 드래그 범위 선택(Marquee), 다중 선택 상태(`selectedIds`), 그룹 이동/삭제/그룹화 연산 로직 전담.
  - **`vctrl_inspector.js` 및 `assets/inspector/*` (UI Controller & Domain Inspectors)**:
    - **역할**: 시스템의 '얼굴'. `vctrl_inspector.js`는 사이드바 탭 전환, 메타데이터 입력 UI, 화면 목록 렌더링, Quill 에디터 초기화 및 플로팅 카드를 총괄하며, 각 컴포넌트별 상세 속성 제어는 분리된 도메인 인스펙터(`inspector_grid.js`, `inspector_accordion.js`, `inspector_tab.js`, `inspector_shapes.js`, `inspector_atoms.js`, `inspector_popup.js`, `inspector_admin_settings.js`, `inspector_text_formatter.js`, `inspector_scroll_pin.js`)가 전담합니다.
    - **`inspector_atoms.js` (`window.InspectorAtoms`)**: 체크박스/라디오, 텍스트박스/텍스트에어리어, 서치바, 데이트피커 등 아톰 속성 인스펙터 동기화 전담 SSOT 모듈.
    - **`inspector_popup.js` (`window.InspectorPopup`)**: 팝업 윈도우 컴포넌트(`v4-atom-popup`)의 크기, 테두리, 배경색, 타이틀, 버튼 텍스트/스타일 등 인스펙터 속성 동기화 및 캔버스 양방향 이벤트 제어 전담 SSOT 모듈.
    - **`inspector_scroll_pin.js` (`window.InspectorScrollPin`)**: 반응형 화면 및 캔버스 요소의 스크롤 핀(상단/하단/커스텀/스티키), 뷰포트 고정 모드 및 이펙트(`data-scroll-effect`) 인스펙터 바인딩과 UI 동기화 전담 SSOT 모듈.
    - **`inspector_text_formatter.js` (`window.InspectorTextFormatter`)**: Quill 에디터와 캔버스 텍스트 셀 간 연속 공백 보존(`preserveConsecutiveSpaces`, 선행/다중 공백 NBSP 변환) 및 폰트 사이즈 인라인 정규화(`normalizeHtmlForQuill`)를 전담합니다.
  - **`vctrl_common.js` (Common Bus, Sanitizer & Utilities)**:
    - **역할**: 
      1. 부모-Iframe 통신 인터페이스: `window.EditorBus`(`sendToIframe`, `sendToParent`)
      2. 공통 색상 유틸리티: `rgbToHex`, `hexToRgb`, `hexToRgba`
      3. 전역 화면 살균 SSOT: `window.ScreenSanitizer` (`splitStyleRules`, `cleanEmptyStyleRules`, `cleanDOM`)
      4. 반응형 문서 판별 SSOT: `isResponsiveDocument(doc)`
  - **`vctrl_component_library.js` & `vctrl_component_inserter.js` (Library & Insertion Engine)**:
    - **역할**: 사이드바 라이브러리 목록 렌더링(`renderV4Shapes`, `renderAtomicLibrary`, `renderIllustrationLibrary`), 2열 대칭 일러스트 라이브러리, 사이드바 라이브러리 3대 아코디언(`V4SidebarAccordion`: ICON LIBRARY, ILLUSTRATION, COMPONENTS 3개 섹션 기본 접힘(`is-collapsed`) 시작 및 검색 자동 펼침/복원, `localStorage` 영속화), 국영문 하이브리드 검색 필터링, 캔버스 드롭 및 동적 컴포넌트 생성을 전담합니다. `viewer.html`에서 `vctrl_inspector.js`보다 먼저 로드되어 라이브러리 UI 바인딩의 SSOT를 책임집니다.
  - **`vctrl_canvas_background.js` (Canvas Background Engine - Parent Side)**:
    - **역할**: 캔버스 배경 이미지 업로드, 클라이언트 브라우저 실시간 스마트 압축(JPEG 85% / 1920px max), 실시간 투명도(Opacity) 슬라이더 조절, 저채도 프리셋 렌더링 및 활성 iframe(`LF_SET_CANVAS_BACKGROUND`) 동기화를 독립 전담합니다.
  - **`vctrl_pdf_exporter.js` (PDF Export Engine)**:
    - **역할**: `metadata.json`의 `screenOrder` 기준 전체 스크린 일괄 고해상도 PDF 결합 생성 및 장문 캔버스 캡처 전담.
  - **`vctrl_presentation_pen.js` (Presentation Drawing Engine - PC Dedicated)**:
    - **역할**: 데스크톱 PC 풀스크린 모드(`F`)에서 `Shift` 키 홀드 시 캔버스 형광펜/레이저 포인터 실시간 드로잉 인터랙션 전담.
    - **모바일 절대 격리**: 모바일/터치 디바이스(`isMobileOrTouchDevice()`, `pointer: coarse`, `max-width: 1050px`)에서는 키보드 단축키 툴팁(`presentation-pen-tooltip`) 및 캔버스를 100% 원천 비활성화/숨김 처리하여 모바일 뷰어 화면에 노출되지 않도록 엄격히 차단합니다.
  - **`vctrl_ui_atoms.js` (UI Atoms Engine & Template Registry - Iframe Side)**:
    - **역할**: 버튼, 배지, 체크박스, 라디오, 팝업, 알림, 관리자 설정 등 V4 디스플레이/위젯 아톰 컴포넌트의 마크업 생성 및 동적 렌더링 SSOT (`v4UIAtomsScript`).
  - **`vctrl_ui_atoms_inputs.js` (UI Atoms Inputs & Controls Engine - Iframe Side)**:
    - **역할**: 스테퍼(Stepper), 파일업로드, 토글, 셀렉트박스, 데이트피커, 텍스트박스/텍스트에어리어, 검색바 등 사용자 입력 및 폼 컨트롤 아톰 컴포넌트의 이벤트 바인딩 및 동적 상태/프로퍼티 갱신 전담 (`v4UIAtomsInputsScript`).
  - **`vctrl_ui_atoms_cursor.js` (UI Atoms Cursor Engine - Iframe Side)**:
    - **역할**: 포인터/아이빔(I-Beam) 마우스 커서 아톰 컴포넌트 이벤트 바인딩, 자동 너비 맞춤(`fitCursorWidth`), 배지 스타일 및 프로퍼티 동기화 전담 (`v4UIAtomsCursorScript`).
  - **`vctrl_clipboard_objects.js` (Canvas Object Clipboard Engine - Iframe Side)**:
    - **역할**: 캔버스 오브젝트 복사/붙여넣기/잘라내기(`Ctrl+C`, `Ctrl+V`, `Ctrl+X`)의 JSON 직렬화 및 크로스 스크린 클립보드(`window.top.__lf_global_clipboard__`) 동기화 전담 (`v4ClipboardObjectsScript`). 동일 프레임(우측하단 +15px) 및 다중 프레임 간 이동(뷰포트 정중앙) 스마트 안착, 그룹 내부 컴포넌트 단독 복사 시 부모 그룹 오프셋 누적 절대 좌표 정규화, 잘라내기 시 고아 그룹 자동 정리를 전담합니다.
  - **`vctrl_format_painter.js` (Format Painter Engine - Iframe Side)**:
    - **역할**: 서식 복사/붙여넣기(`Ctrl+Shift+C`, `Ctrl+Shift+V`), 스타일 클립보드(`window.top.__lf_global_style_clipboard__`) 관리 및 Undo 연동 전담 (`v4FormatPainterScript`).
  - **`vctrl_smartguide.js` (Smart Guide Engine - Parent & Iframe Side)**:
    - **역할**: 일반 1600x900 캔버스 내 컴포넌트 이동/리사이즈 시 5px 자석 스냅선 및 중앙/경계선 가이드 렌더링 전담.
  - **`vctrl_responsive_smartguide_math.js` (Responsive Smart Guide Math Engine - Iframe Side)**:
    - **역할**: 반응형 및 일반 캔버스 전용 4방향 레이캐스트(Raycast), 가장 가까운 테두리(Wall) 및 인접 컴포넌트 간 거리 수학 계산 전담 (`v4ResponsiveSmartGuideMathScript`).
  - **`vctrl_responsive_smartguide.js` (Responsive Smart Guide Renderer & Lifecycle - Iframe Side)**:
    - **역할**: 실시간 핑크 뱃지 및 SVG 가이드선 렌더링, Alt/Shift 검사, 이동(Nudge) 및 자동 타이머 라이프사이클 관리 전담 (`v4ResponsiveSmartGuideScript`).
  - **`vctrl_responsive_multiselect.js` (Responsive Multi-Selection Engine - Iframe Side)**:
    - **역할**: 반응형 프레임 환경에서 마키(Marquee) 드래그 다중 선택 시 프레임 경계 격리 및 좌표 보정 전담 (`v4ResponsiveMultiselectScript`).
  - **`vctrl_iframe_scroll_pin.js` (Responsive Scroll Pinning Engine - Iframe Side)**:
    - **역할**: 반응형 스크린(PC & Mobile) 내 오브젝트 4대 고정 모드(상단 `top`, 하단 `bottom`, 자유 플로팅 `custom`/`floating`, 임계치 스티키 `sticky`) 및 디스크립션 핀 고정(`viewport` / `host-pinned`), 스크롤 방향별 반응 효과(`data-scroll-effect`: `always`, `hide-down`, `hide-up`)의 가상 스티키 HUD GPU 가속(`translate3d`) 렌더링 및 동기화 전담 (`v4ScrollPinScript`).
  - **`vctrl_color_picker.js` (Custom Color Picker Engine - Parent Side)**:
    - **역할**: 알약형 프리셋 및 HSL/HEX/RGB 슬라이더 기반의 초경량 커스텀 컬러 피커 드롭다운 인터랙션 전담.
  - **`vctrl_table.js` (V4 Table Component Engine - Iframe Side)**:
    - **역할**: V4 정밀 테이블의 행/열 추가·삭제, 셀 치수 가변, 보더 정합성 및 부모 컴포넌트 크기 동기화(`syncTableComponentSize`) 전담 (`v4TableScript`).
  - **`vctrl_typography.js` (Typography Engine - Iframe Side)**:
    - **역할**: 폰트 패밀리 정규화, 로컬 웹폰트 로딩 최적화 및 렌더링 안티앨리어싱 보장 (`v4TypographyScript`).
  - **`vctrl_ui_library.js` (UI Library & Modals Dynamic Loader - Parent Side)**:
    - **역할**: `assets/ui_library/*.html` (아톰 카드, 아이콘 카드, 인스펙터 패널, 모달) 템플릿의 오프라인 비동기 로딩 및 DOM 마운트 전담.
  - **`vctrl_system_modals.js` (Universal Modals & Loading Engine - Parent Side)**:
    - **역할**: 시스템 전체 저장/로딩 오버레이(`window.showLoading`, `window.hideLoading`) 및 인증 모달(`window.showAuthModal`) 전담 컨트롤러.
  - **`vctrl_iframe_inserter.js` (Component Insertion Engine - Iframe Side)**:
    - **역할**: 사이드바 라이브러리에서 드롭/클릭된 컴포넌트의 iframe 내부 동적 마운트 및 뷰포트 중앙 안착 전담 (`v4IframeInserterScript`).
  - **`vctrl_iframe_layering.js` (Layer Ordering Engine - Iframe Side)**:
    - **역할**: 맨 앞으로 가져오기(`Ctrl+]`), 맨 뒤로 보내기(`Ctrl+[`), Z-Index 자동 재계산 및 캔버스 컨테이너 셀프 힐링 전담 (`v4IframeLayeringScript`).
  - **`vctrl_iframe_style_extractor.js` (Deep Style Extractor - Iframe Side)**:
    - **역할**: 서식 복사를 위해 도형, 텍스트, 아톰, 테이블의 인라인/컴퓨티드 스타일을 심층 추출 및 정규화 전담 (`v4IframeStyleExtractorScript`).
  - **`vctrl_properties.js` (Properties Controller - Parent Side)**:
    - **역할**: 부모 창 측 컴포넌트 속성 매핑 및 플로팅 인스펙터 패널 바인딩 헬퍼.
  - **`inspector/inspector_table.js` (Table Domain Inspector - Parent Side)**:
    - **역할**: 테이블 열/행 치수 제어, 행 추가/삭제, 셀 정렬 및 인스펙터 UI 동기화 전담.
  - **`inspector/inspector_quill.js` (Quill Rich Text Controller - Parent Side)**:
    - **역할**: Quill 리치 텍스트 에디터 초기화, 커스텀 폰트 크기/컬러 피커 툴바 바인딩 및 캔버스 텍스트 셀 양방향 동기화 전담.
  - **`vctrl_resolution_engine.js` (Resolution & Mobile Read-Only Engine - Parent Side)**:
    - **역할**: 뷰포트 해상도 반응형 엔진(`res-narrow`, `res-compact`, `res-wide`), 스마트 프레임 포커스 스위처(`v4-frame-switcher`, `focusFrame`), 모바일 네이티브 브라우저 전체화면(`requestFullscreen`/`exitFullscreen`)과 젠 모드(`toggleZenMode`), 화면 회전 토스트(`showRotationToast`) 및 모바일 뷰어 인터랙션 제어 전담.
  - **`app.js` & `dashboard.js` (Dashboard & Project Workspace Controller)**:
    - **역할**: `index.html` 기반의 대시보드 프로젝트 목록 그리드 렌더링, 신규 프로젝트 생성, 프로젝트 검색 필터링, 모바일 슬림 1줄 헤더 및 GitHub 원격 연동 전담.
- **오프라인 템플릿 및 UI 라이브러리 빌드 파이프라인 (Offline Build Pipeline SSOT)**:
  - `assets/templates/*.html`을 추가/수정했을 때는 반드시 **`powershell -ExecutionPolicy Bypass -File scripts/build_templates.ps1`**을 실행하여 `assets/templates.js` 번들을 재컴파일해야 오프라인(`file://`) 환경에서 즉시 반영됩니다.
  - `assets/ui_library/*.html` (atomic_cards, icon_cards, inspector_panels, modals)을 수정했을 때는 반드시 **`powershell -ExecutionPolicy Bypass -File scripts/build_ui_fallback.ps1`**을 실행하여 `assets/ui_library_fallback.js`를 재컴파일해야 합니다.
- **인코딩 보안 규칙 (Encoding Safety)**: 
  - **금지**: 소스 코드 내부에 하드코딩된 한글 문자열 사용을 지양합니다. 파일 저장 시 인코딩 변환 문제로 코드가 깨지는 것을 방지해야 합니다.
  - **권장**: UI에 노출되는 특수문자는 반드시 HTML 엔티티(`&times;` 등)를 사용하고, 경고 문구 등은 ASCII 안전 문자열로 작성하거나, 수정 시 파일 인코딩이 `UTF-8`로 유지되는지 엄격히 확인하세요.
- **아톰 컴포넌트 표준 (Atomic Component Standard & Definitive Masking Unification)**:
  - 모든 아이콘 및 아톰 컴포넌트(SVG 포함)는 인스펙터와의 호환성을 위해 반드시 **`.lf-icon`** 클래스를 포함해야 합니다.
  - **AI 직접 생성 시 표준 오브젝트 규격 준수 강제 (Native Standard Component Enforcement)**: AI가 스크린 HTML을 생성/수정할 때 임의의 변형 오브젝트 구조(아형 CSS 및 비표준 래퍼)를 사용하는 것은 엄격히 금지됩니다. 모든 도형/텍스트/컨테이너 오브젝트는 사이드바 `LIBRARY`에서 생성되는 정식 3계층 구조 **`.lf-component` ➔ `.v4-shape.v4-shape-rect` (또는 해당 쉐입 클래스) ➔ `.v4-shape-text-content` ➔ `<p><span>`** 표준 DOM 스펙을 100% 엄격하게 준수해야 합니다. 이를 위반하면 인스펙터 수치(`width`/`height`)와 캔버스 파란 선택선의 오프셋 왜곡 버그가 발생합니다.
  - **독립 컴포넌트 구조 분리 및 인스펙터 편집 안전성 보장 (Atomic Component Separation Protocol)**: AI가 스크린을 생성/수정할 때, 아이콘, 뱃지, 제목, 불릿 텍스트 등이 포함된 카드형 컴포넌트를 단일 `.v4-shape` 내부 텍스트 래퍼에 통합 삽입하는 것을 엄격히 금지합니다. 인스펙터(Quill 에디터)에서 텍스트 수정 시 SVG 아이콘이나 뱃지 레이아웃 태그가 파괴/증발되는 버그를 방지하기 위해, 모든 복합 카드는 **[배경 쉐입] + [독립 SVG 아이콘 아톰] + [독립 뱃지 쉐입] + [독립 텍스트 쉐입]**의 개별 표준 아톰 오브젝트들로 각각 완전 분리하여 구조화해야 합니다.
  - SVG 아톰의 경우, 세련되고 섬세한 슬림 라인 UI 표준 유지를 위해 기본 `stroke-width`를 **`1.2`**로 설정하는 것을 원칙으로 합니다. (라이브러리 아이콘 및 캔버스 삽입 SVG 표준)
  - **스프라이트 아톰 반응형 크기 조절 규칙 (Responsive Sprite Sizing)**: 스프라이트 이미지 기반 아톰의 경우, 고정 픽셀(px) 단위 대신 백분율(%) 기반의 `background-size` 및 `background-position`을 사용하여 객체 크기를 조절할 때 스프라이트 내 다른 영역이 노출(bleeding)되지 않고 단일 객체의 크기만 반응형으로 완벽하게 조절되도록 구현해야 합니다. (예: 3열 2행 구조 스프라이트의 경우 `background-size: 300% 200% !important;`와 백분율 좌표 활용)
  - **Replaced Element (<img>) 금지 및 <div> 대체**: 브라우저 그래픽 최적화 특성상 `<img>` 태그에 `-webkit-mask-image`를 입히는 동적 채색 기법은 엘리먼트 증발을 초래하므로 신규 이미지 기반 아톰은 절대 `<img>` 태그로 작성해서는 안 되며, **`<div>` 엘리먼트와 `background-image` 스타일 조합**으로 설계해야 합니다. (레거시 스크린의 `<img>`는 `enforceDesignSystem()` 내의 `img-to-div` 동적 마이그레이션 모듈에 의해 로딩 시 자동으로 `<div>`로 치환됩니다.)
  - **Animated WebP 모션 컴포넌트 표준 (Motion Component Standard & Zero Side-Effects)**:
    - 동적 모션(클릭 유도, 스크롤 유도, 방사형 로딩 스피너, 프로그레스 바, 스켈레톤 패턴, 토스트 메시지 등)은 시스템 부하가 없고 투명 배경(Alpha)을 완벽 지원하는 **Animated WebP (`assets/illustrations/motion/*.webp`)**를 표준으로 사용합니다.
    - **표준 DOM 스펙**: 반드시 정식 3계층 구조 **`.lf-component` ➔ `.v4-motion-container` ➔ `<img src="assets/illustrations/motion/..." style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;">`**을 준수해야 합니다.
    - **이벤트 무간섭**: 내부 `<img>`에 `pointer-events: none; user-select: none;`을 적용하여 브라우저 기본 고스트 드래그를 차단하고, 캔버스 드래그/리사이즈/선택 이벤트가 최외곽 `.lf-component`로 100% 정상 수신되도록 보장합니다.
    - **전용 인스펙터 분리 (Illustration / Motion Editor)**: 일반 아이콘(색상 조색 필요)과 분리된 전용 에디터 패널(`illustration-inspector-section`)을 제공합니다. 가로/세로 크기 변경 시 **비율 유지(Lock Ratio)**가 기본 활성화되며, 원본 비율 리셋 버튼(`btn-snap-illustration-ratio`)을 지원하고 불필요한 아이콘색 피커는 표시되지 않습니다.
- **반응형 스크롤 핀 & 스마트 HUD 고정 엔진 아키텍처 (Responsive Scroll Pin & Smart HUD Architecture SSOT)**:
  - **1. 오브젝트 4대 고정 모드 (`data-scroll-fixed`)**:
    - `top` (상단 고정): 컨테이너 스크롤 시 뷰포트 최상단(Top 0px)에 항상 고정 밀착 ($\Delta Y = \text{scrollTop} - \text{domTop}$).
    - `bottom` (하단 고정): 컨테이너 스크롤 시 뷰포트 최하단(Bottom)에 항상 고정 밀착 ($\Delta Y = \text{scrollTop} + (H_{\text{viewport}} - \text{domTop} - H_{\text{el}})$).
    - `custom` 또는 `floating` (자유 플로팅): 사용자가 드래그하여 배치한 뷰포트 상대 $Y$ 좌표(`data-scroll-target-y`)를 유지하여 스크롤 내내 상시 플로팅 ($\Delta Y = \text{scrollTop} + (Y_{\text{target}} - \text{domTop})$).
    - `sticky` (임계치 스티키): 본문 스크롤 도중 지정 임계 오프셋(`data-scroll-sticky-top`)에 도달하면 상단에 안착되어 고정 ($\Delta Y = \max(0, \text{scrollTop} - \text{threshold})$).
    - `none` (일반 본문): 스크롤 시 본문과 1:1로 함께 스크롤되며 `transform` 완전 해제.
  - **2. 디스크립션 핀 고정 모드**:
    - `viewport` (화면 핀 고정 📌): 스크롤과 무관하게 화면 뷰포트 상대 좌표에 상시 고정. 최상위 Z-Index Tier 3 (`200,050 !important`) 보장, 캔버스 뱃지 우측 상단 미니 핀(`📌`) 아이콘 및 사이드바 카드 `[고정 📌]` 뱃지 연동.
    - 호스트 추종 (`data-fixed-host`): 고정된 컴포넌트 위에 꽂힌 디스크립션 핀은 호스트의 `transform` 변위를 100% 동기화 추종.
  - **3. 스크롤 방향 반응 효과 (`data-scroll-effect`)**:
    - `always` (상시 고정): 스크롤 방향과 무관하게 항시 뷰포트에 노출 (기본값).
    - `hide-down` (스크롤 내릴 때 숨김): 아래로 스크롤 시 상단 헤더가 위로 부드럽게 슬라이드되어 숨겨지고, 위로 스크롤 시 즉시 다시 나타남.
    - `hide-up` (스크롤 올릴 때 숨김): 위로 스크롤 시 요소가 뷰포트 밖으로 슬라이드되어 숨겨지고, 아래로 스크롤 시 다시 나타남.
  - **4. 인스펙터 UI/UX 아키텍처 (`#selection-scroll-pin-bar`)**:
    - **3+2 레이아웃 표준**: 좁은 사이드바 가로폭(270px 이하)에서 버튼 텍스트 말줄임 방지를 위해 1행 3버튼(`[일반]`, `[상단]`, `[하단]`) + 2행 2버튼(`[플로팅]`, `[스티키]`)으로 분리.
    - **동적 효과 바 (`#scroll-pin-effect-bar`)**: `[상단]` 또는 `[하단]` 선택 시 활성화되어 드롭다운으로 `상시 고정`, `스크롤 내릴 때 숨김`, `스크롤 올릴 때 숨김` 선택 제어.
    - **동적 오프셋 바 (`#scroll-pin-offset-bar`)**: `[플로팅]` 또는 `[스티키]` 선택 시 뷰포트 $Y$ / 스티키 상단 여백 조절 입력창 노출.
    - **상태 배지 (`#scroll-pin-status-badge`)**: 현재 설정된 고정 모드 및 방향 효과(예: `PIN TOP (↓숨김)`) 실시간 표시.
  - **5. 엔진 무결성 및 성능 보장**:
    - `vctrl_iframe_scroll_pin.js`의 `ScrollPinEngine`:
      - `WeakMap` 기반 스크롤 컨테이너별 독립 상태(`lastScrollTop`, `direction`, `isHidden`) 안전 격리.
      - `requestAnimationFrame` 단일 렌더 루프 및 GPU 가속(`translate3d`)을 통한 60fps 무지연 렌더링.
      - Z-Index 4대 티어(Tier 2: 100,000~179,999, Tier 3: 200,050) 준수.
      - In-Place Undo 및 스크린 저장/살균(`ScreenSanitizer.cleanDOM`) 시 런타임 transform만 정제하고 DOM 데이터 속성(`data-scroll-fixed`, `data-scroll-effect`, `data-scroll-target-y`, `data-scroll-sticky-top`)은 100% 영구 보존.


- **모바일 전용 읽기 모드 및 뷰포트 아키텍처 절대 불변 규칙 (Mobile Read-Only Architecture SSOT)**:
  - **1. 모바일 환경의 본질 (100% 읽기/조회/뷰어 전용 모드)**:
    - 스마트폰 터치 환경에서 캔버스 저작 및 생성은 불가합니다. 모바일 사용자의 목적은 100% **"기존 결과물 확인, 링크 공유 열람, 프레젠테이션 검토 및 데모"**입니다.
    - 대시보드(`index.html`)의 `[+ New Project]` 버튼은 모바일(세로 `max-width: 768px`, 가로 `max-height: 520px`)에서 무조건 `display: none !important;`로 숨깁니다.
    - 캔버스 에디터의 사이드바, 글로벌 저장, 편집 툴바, 인스펙터 등 저작 도구는 모바일 환경에서 전면 숨김 처리합니다.
  - **2. 브라우저 네이티브 전체화면(`requestFullscreen`) 보존 원칙 (절대 금지 안티패턴 방지)**:
    - **절대 금지**: "안드로이드 OS 자체의 전체화면 보안 안내 토스트를 없앤다"는 이유로 모바일에서 `requestFullscreen()` 호출을 막는 행위는 엄격히 금지됩니다.
    - 모바일 [전체보기]의 핵심은 **상단 브라우저 주소창과 상태바를 완전히 없애고 1600x900 화면이 모바일 화면에 꽉 차게 핏(Fit)되도록 만드는 것**입니다. `requestFullscreen()`을 호출하지 않으면 일반 뷰와 아무런 차이가 없게 됩니다.
    - 모바일 및 PC 모두에서 `requestFullscreen()` / `webkitRequestFullscreen()` / `exitFullscreen()`은 반드시 정상 실행되어야 합니다.
  - **3. PC 전용 단축키 툴팁 및 레이저 포인터/펜 모바일 차단 원칙**:
    - `vctrl_presentation_pen.js`의 프레젠테이션 펜/레이저 포인터 모듈은 PC 키보드/마우스 전용입니다.
    - 단축키 안내 툴팁(`Shift + Drag : Highlighter | C : Clear`, `#presentation-pen-tooltip`)과 캔버스(`#presentation-pen-canvas`)는 모바일/터치 환경(`isMobileOrTouchDevice()`, `pointer: coarse`, `max-width: 1050px`)에서 **절대 생성되거나 노출되지 않도록 JS와 CSS 양쪽에서 이중 차단**(`display: none !important;`)되어야 합니다.
    - 사용자가 "안내 메시지를 지워달라"고 했을 때의 '안내 메시지'는 바로 이 키보드 단축키 툴팁(`presentation-pen-tooltip`)과 앱 내부 토스트(`v4-zen-toast`)를 의미합니다. (OS 시스템 토스트로 오인하여 전체화면을 끄지 말 것!)
  - **4. 스마트 프레임 포커스 스위처 (`v4-frame-switcher`) 규칙**:
    - 반응형 프레임(PC/Mobile 컬럼)이 존재할 때만 우측 상단에 콤팩트한 아이콘 알약 형태로 노출됩니다.
    - PC 전용 화면(예: `09_Admin_PC_Scroll_639.html` 등 모바일 프레임이 아예 없는 화면)에서는 `[모바일핏]` 버튼을 아예 숨김(`is-hidden`, `display: none !important;`) 처리합니다.
    - 기본값은 무조건 `[전체](full)`. 사용자가 명시적으로 클릭할 때만 `[모바일핏](mobile)`(세로 핏) 또는 `[PC핏](pc)`(가로 핏)으로 전환합니다.
  - **5. 대시보드(`index.html`) 모바일 가로/세로 최적화 규칙**:
    - 가로모드(`orientation: landscape` & `max-height: 520px`): 상단 툴바 숨김, 1줄 슬림 헤더(`[로고 + My Projects]` + `[검색창]`), 하단 프로젝트 카드 영역 85% 이상 시원하게 노출합니다.
    - 세로모드(`max-width: 768px`): `[+ New Project]` 숨김, 헤더 높이 최소화하여 첫 화면에서 스크롤 없이 카드 목록을 즉시 노출합니다.
  - **6. 모바일 캔버스 인터랙션 불변성 (Non-interactive Canvas)**:
    - 캔버스 내부 오브젝트나 iframe은 `pointer-events: none !important;` 및 `user-select: none !important;`로 설정되어, 터치 스크롤이나 핀치 줌 시 실수로 오브젝트가 선택되거나 텍스트가 긁히는 것을 방지하고 순수하게 캔버스 뷰포트 조작만 작동하도록 보장합니다.

## 🎨 UI 및 컴포넌트 규칙
- **통합 스타일 및 크기 컨트롤러 (Unified Style & Dimension Controller)**:
  - 모든 오브젝트(도형, 텍스트박스, 선, 아코디언, 체크박스, 라디오버튼, 그리드 등)는 과거의 개별 명칭(배경색, 테두리색, BG, Border 등) 대신 하나의 **통합 스타일 컨트롤러(배경 컬러 / 보더 컬러)** 및 **통합 크기 컨트롤러(가로 크기 / 세로 크기)**로 통일하여 속성을 제어하고 화면에 출력해야 합니다.
  - 예외 없이 모든 아톰 컴포넌트(아코디언, 체크박스, 라디오버튼 등 포함)가 이 통합 컨트롤러를 통해 일관성 있게 조절되어야 합니다.
- **아코디언 계층 구조 및 선택 활성화 규칙 (Accordion Hierarchy & Selection)**:
  - 아코디언 컴포넌트는 `1 Depth`(플랫 리스트)와 `2 Depth`(1티어 대분류 및 2티어 중분류) 구조를 제공합니다 (3티어는 제외).
  - 최하위 티어 항목(1 Depth의 개별 항목 또는 2 Depth의 2티어 항목)의 왼쪽에는 라디오 버튼(`.v4-accordion-radio`)이 표시되며, 활성화(선택)된 항목은 텍스트 밑에 밑줄(`text-decoration: underline`)이 실시간 표시됩니다.
  - 계층 데이터 및 선택 상태는 단일 진실 공급원(SSOT)인 `data-hierarchy` 속성에 JSON 배열 형태로 저장 및 복구되어야 합니다.
- **캔버스 크기**: 에디터 화면(`lf-canvas` 또는 `page`)의 크기는 레이아웃 틀어짐을 방지하기 위해 'Cover' 화면 크기(예: 1600x900)와 완벽하게 일치해야 합니다. (기존 1440x900 레거시 스크린은 로드 시 자동 감지되어 1440px 뷰포트로 안전하게 렌더링됨)
- **타이포그래피 가이드 및 텍스트 100% 선명도 유지 원칙 (Crisp Typography & Subpixel Integrity Protocol)**:
  - **폰트 크기 표준**: 대분류 타이틀: `18px` ~ `20px` / 중분류 헤더: `15px` ~ `16px` / 본문: `14px` ~ `15px` / 부가 설명: `13px` ~ `13.5px` / 최소 단위: `13px`
  - **1:1 픽셀 스케일 스냅 (`if (s >= 0.96) s = 1;`)**: `vctrl_canvas_viewport.js`의 `centerView()` 및 뷰포트 센터링 연산 시, 화면 배율 `s`가 0.96 이상일 때는 임의의 소수점 배율(예: 0.98, 0.99)로 리샘플링되지 않도록 반드시 **정확히 `1.0 (100%)` 1:1 픽셀로 강제 스냅**해야 합니다. 브라우저의 소수점 스케일 다운샘플링으로 인한 텍스트 번짐(Blurring)을 원천 차단합니다.
  - **정수 픽셀 정렬 (`Math.round`)**: `centerView()`와 `updateTransform()`의 좌표 `x`, `y`는 반드시 `Math.round()`를 거쳐 소수점 픽셀(`translate(12.35px)`)을 완전 제거하고 물리 디스플레이 픽셀 그리드에 1:1로 안착시켜야 합니다.
  - **글로벌 폰트 안티앨리어싱 보장**: 모든 텍스트 요소와 인풋, iframe 영역에는 `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`, `text-rendering: optimizeLegibility`를 필수로 유지하여 13px 등 작은 폰트에서도 칼같이 선명한 렌더링을 보장합니다.
  - **블러 필터 지양**: `backdrop-filter: blur(...)`와 같이 캔버스 줌/스케일 환경에서 텍스트 래스터화를 뭉개는 필터 속성은 텍스트 영역에 사용을 금지합니다.
- **도형 배경색 반투명 조절 (Opacity 0% ~ 100%)**: 도형 자체에 `opacity`를 입힐 경우 내부 텍스트의 가독성이 무너지므로, 반드시 배경색의 알파값(`rgba`)만을 조합 및 추출하여 배경 투명도를 표현해야 합니다. 투명도 슬라이더와 컬러 피커는 상호 상태를 유지하며 갱신되어야 하고, 투명(None) 버튼 클릭 시 투명도는 0%로 강제 동기화되어야 합니다.
- **도형 코너 스타일 설정**: Rect 도형 선택 시 코너 라운드 반경(Radius 0px ~ 100px 슬라이더) 제어 및 직각/라운드(0px / 8px 적용) 변환 원터치 컨트롤을 제공해야 합니다.
- **다중 선택 텍스트 긁힘 방지 (User Selection Prevention)**: 캔버스를 드래그(Marquee)하여 다중 선택할 때 브라우저 텍스트 Selection 하이라이트가 무관한 요소들에 잡히지 않도록, `body` 및 `.lf-component`에 `user-select: none` 속성을 필수로 강제하고, 드래그 `mousemove` 루프 내에서 `window.getSelection()?.removeAllRanges()`를 매프레임 호출하여 이중으로 차단해야 합니다. 단, `contenteditable` 영역은 `user-select: text`를 부여해 정상 편집을 허용합니다.
- **라인(커넥터) 삭제 정합성 확보**: 마우스 호버 시 노출되는 X 삭제 단추(`.lf-delete-trigger`)나 키보드 입력으로 선을 삭제할 때 반드시 부모 창에 `LF_DELETE_CONNECTOR`를 전송해야 합니다. 또한, 부모 측은 `state.connectors` 배열의 필터링 재할당 시 참조 누수로 저장 대상 메타데이터(`state.activeFile.meta.connectors`)가 유실되지 않도록 새 참조 연결을 명시적으로 수립하여 새로고침 시 되살아나는 버그를 차단해야 합니다.
- **통합 헤더 아키텍처 (Unified Header Architecture)**:
  - 모든 주요 컨트롤과 프로젝트 메타데이터는 단일 행의 **통합 툴바(`.toolbar`)**로 통합되었습니다.
  - **3단 그룹화**: [Brand Group] - [Metadata Group] - [Actions Group] 순으로 배치하며, `white-space: nowrap`을 적용합니다.
- **버튼 디자인 표준 (Premium UI)**: 모든 버튼은 알약형(Pill) 쉐입(`height: 28px`, `border-radius: 14px`)을 따르며, 아이콘은 인라인 SVG(`stroke-width: 1.6`)를 사용합니다.
- **통합 오브젝트 아키텍처 (Unified Object Architecture)**:
  - 텍스트 박스, 도형, 선, 아톰 4종을 **'모든 객체' (All Objects)**로 통칭하며, 이들은 반드시 **공통 오브젝트 4원칙(Common Object Protocol)**을 준수해야 합니다.
  - 1. **다중 선택 보장**: 드래그(Marquee) 및 Shift+Click으로 다중 선택과 그룹화(Ctrl+G), 해제가 가능해야 합니다.
  - 2. **키보드 이동 보장**: 화살표 키(`ArrowUp` 등)를 통해 픽셀 단위로 상하좌우 이동이 가능해야 합니다.
  - 3. **Delete 삭제 보장**: 사이드바 버튼 외에도 `Delete` 또는 `Backspace` 키보드 입력만으로 즉시 삭제되어야 합니다.
  - 4. **Ctrl+Z (Undo) 보장**: 모든 객체의 이동, 생성, 삭제, 그룹화 동작은 `V4UndoManager.saveState()`를 거쳐 실행 취소가 가능해야 합니다.
  - 5. **Ctrl+C / Ctrl+V / Ctrl+X 복사, 붙여넣기, 잘라내기 보장 (크로스 스크린 & 스마트 위치 결정)**:
    - **전역 SSOT (하이브리드 영속화)**: 동일 프로젝트 내 스크린 간 및 다른 프로젝트 스크린 간(Cross-Project), 멀티 탭 간 오브젝트 복사/붙여넣기를 완벽 지원하기 위해 `window.top.__lf_global_clipboard__` 메모리 변수와 브라우저 `localStorage`를 결합한 듀얼 레이어 하이브리드 SSOT를 사용합니다. 페이지 새로고침 시에도 `localStorage`로부터 자동 복원(Hydration)됩니다.
    - **그룹 내부 자식 컴포넌트 단독 복사 좌표 정규화**: 그룹(`.lf-group`) 내부의 자식 컴포넌트를 단일 선택하여 복사할 때, 조상 그룹 체인의 오프셋(`offsetLeft`, `offsetTop`)을 재귀적으로 누적 합산하여 캔버스/반응형 프레임 호스트 기준의 절대 위치(`absL`, `absT`)로 정규화하여 저장합니다. 이를 통해 붙여넣기 시 스크린 최상단(0, 0)으로 튀는 현상을 원천 방지하고 독립 오브젝트로 안전하게 복제 생성합니다.
    - **스마트 붙여넣기 위치 결정 (Smart Paste Positioning)**: 동일 스크린 및 동일 프레임 내 붙여넣기 시에는 원본 대비 겹침 방지 오프셋(+15px)을 적용하고, 다른 스크린이나 타 프레임으로 붙여넣을 때 또는 원본 위치가 스크롤 뷰포트를 벗어난 경우 현재 스크롤 뷰포트 정중앙(Viewport Center)에 지능적으로 자동 배치합니다.
    - **붙여넣기 후 자동 선택 전환**: 복제 생성 완료 즉시 새로 생성된 객체들만 자동으로 선택(`.selected`) 상태로 전환하여 연속 이동 및 편집을 보장합니다.
    - **잘라내기(Ctrl+X) 시 빈 그룹 자동 청소**: 원본 객체를 복사 후 즉시 삭제하되, 그룹 내 마지막 자식 요소를 잘라냈을 경우 껍데기만 남은 빈 그룹 컨테이너(`div.lf-group`)를 감지하여 캔버스에서 안전하게 자동 제거합니다.
  - 6. **Ctrl+S 전체저장 보장**: 포커스 위치에 관계없이 캔버스 내부 단축키 입력 시 즉시 툴바의 전체저장(`handleGlobalSave`)이 실행되도록 부모 창으로 이벤트를 프록시 토스해야 합니다.
  - 7. **오브젝트 프로퍼티 플로팅 카드 (Object Properties Floating Card) 및 다중 선택**:
    - **플로팅 연동**: 선택 활성화 시 `#floating-inspector-card`가 노출되며, 현재 활성화된 속성 편집 섹션(예: `text-editor-section`) 및 툴바(`#selection-actions-bar`)가 `#floating-inspector-body` 내부로 동적으로 이동(`appendChild`)되어야 합니다.
    - **DOM 복원 SSOT**: 선택 해제나 상태 변경 시, 동적 이동된 요소들의 상태 유실 및 파괴를 방지하기 위해 반드시 독립 저장소 컨테이너(`#inspector-panels-storage`)로 환원(`restorePropertiesSections()`)한 뒤 갱신해야 합니다.
    - **오작동 방지**: 캔버스 드래그 및 줌 마우스 이벤트 등에서 플로팅 카드 내 클릭을 예외 처리(`e.target.closest('#floating-inspector-card')`)하여 편집 제어 도중 영역이 접히는 오작동을 차단합니다.
    - **선택별 버튼 분기 제어**:
      - **단일 컴포넌트(비그룹)**: `GROUP`, `UNGROUP`, `ADD TO MOLECULES` 3종 버튼 모두 미노출 (`display: none !important`).
      - **단일 그룹**: `UNGROUP`, `ADD TO MOLECULES` 노출, `GROUP` 미노출.
      - **다중 선택(2개 이상)**: `GROUP` 및 정렬 도구 노출, `UNGROUP`, `ADD TO MOLECULES` 미노출.
  - 8. **F2 키 기반 도형 선택/텍스트 편집 상태 전환 및 포커스 제어 보장**:
    - F2 키 입력 시 선택 모드(키보드 이동/삭제가 가능하며 텍스트 편집이 비활성화된 상태)와 텍스트 편집 모드(요소의 `contenteditable`이 true가 되고 캐럿이 깜빡이는 상태)가 상호 전환(Toggle)되어야 합니다.
    - **포커스 스왑 제어**: 텍스트 편집 모드로 진입 시, 브라우저 보안 및 포커스 격리를 극복하기 위해 `contenteditable` 영역을 포커스하기 전 반드시 iframe 자체(`window.top`에서 iframe 요소를 찾아서 `.contentWindow.focus()`) 또는 iframe 내부 `window.focus()`를 먼저 호출한 뒤 대상 요소를 포커스해야 캐럿(Caret)이 정상적으로 노출됩니다.
    - **입력 필드 예외 처리 (Keydown Hijacking 방지)**: 부모 창 또는 사이드바(Quill Editor 등)의 입력 폼에 포커스된 상태에서 키보드 이벤트가 가로채지는 문제를 막기 위해, 부모 keydown 리스너의 `isInput` 판단 분기문 시작 지점 등에서 `F2` 키 입력을 최우선적으로 가드하여 무조건 동작하도록 설계해야 합니다. 또한 IME 한글 입력 중 중복 이벤트를 방지하기 위해 `isComposing` 상태 체크 및 `e.key === 'F2'`와 `e.code === 'F2'` 검증을 동시에 거쳐야 합니다.
  - 9. **레이어 순서 제어 (Layer Ordering Shortcuts)**: `Ctrl + ]` (맨 앞으로 가져오기 / `LF_BRING_FRONT`), `Ctrl + [` (맨 뒤로 보내기 / `LF_SEND_BACK`) 단축키를 완벽 지원합니다.
  - 10. **그룹화 제어 (Grouping Shortcuts)**: `Ctrl + G` (그룹화), `Ctrl + Shift + G` (그룹 해제)를 지원합니다.
  - 11. **실행 취소 / 재실행 (Undo / Redo Shortcuts)**: `Ctrl + Z` (실행 취소), `Ctrl + Y` 및 `Ctrl + Shift + Z` (다시 실행)를 지원합니다.
  - 12. **캔버스 뷰포트 및 도구 단축키 (Parent Viewport Shortcuts)**:
    - `Space`: 누르고 있는 동안 임시 핸드 툴(패닝) 활성화, 떼면 복귀.
    - `` ` `` 또는 `Home`: 100% 선명 뷰 ↔ 화면 맞춤(Fit) 모드 즉시 전환 (`toggleCrispView`). 전역 Iframe 포커스 격리를 극복하여 확대 상태에서도 즉시 토글 지원.
    - `F`: 풀스크린 모드 토글 (`toggleFullscreen`).
    - `R`: 우측 사이드바 패널 열기/닫기 토글 (`toggleSidebar('right')`).
    - `V`: 선택 도구 모드, `H`: 핸드 도구 모드, `T`: 원터치 텍스트 생성.
    - `Shift + G`: 반응형 프레임 격자무늬(Grid) On/Off 토글.
    - `Shift + Arrow`: 화살표 이동 시 10px 고속 이동 (일반 Arrow는 1px 정밀 Nudge).
    - `Escape`: 인라인 텍스트 편집 탈출 및 오브젝트 다중 선택 일괄 해제.
    - `Shift + Drag (풀스크린 모드)`: 프레젠테이션 형광펜/레이저 포인터 드로잉.
  - 13. **도형 서식 복사 및 붙여넣기 보장 (Format Painter Shortcuts - `Ctrl + Shift + C` / `Ctrl + Shift + V`)**:
    - **단축키 및 인터랙션**: 선택된 오브젝트의 스타일 서식을 **`Ctrl + Shift + C`**로 복사하고, 대상 컴포넌트(단일 또는 N개 다중 선택)에 **`Ctrl + Shift + V`**로 일괄 적용합니다. 플로팅 인스펙터(`#floating-inspector-card`) 내 `[서식 복사]` 및 `[서식 붙여넣기]` 버튼과 완벽히 동기화됩니다 (단일 그룹 선택 시에는 자동 미노출).
    - **서식 추출 범위**: 도형 스타일(배경색, 테두리 색상/두께/스타일/반경, 투명도)뿐만 아니라, 내부 하위 텍스트 셀(`.v4-editable-cell`, `.v4-shape-text-content`) 및 인라인 서식의 타이포그래피(글꼴 패밀리, 폰트 크기, 글자색, 두께, 정렬), 테이블 헤더/본문 색상, 아이콘 컬러까지 심층 추출하여 정밀 복원합니다.
    - **전역 SSOT 및 실행 취소**: 스크린 iframe 격리를 극복하기 위해 최상위 부모 창 `(window.top || window).__lf_global_style_clipboard__`를 단일 진실 공급원으로 활용하며, 서식 주입 전 `V4UndoManager.saveState()`를 자동 호출하여 **`Ctrl + Z` (Undo)로 즉시 롤백**할 수 있습니다. 서식 복사/적용 상태는 화면 상단에 토스트 알림(`LF_SHOW_TOAST`)으로 즉시 피드백됩니다.
- **통합 좌표 및 단위 표준 (Unified Coordinate Standards)**:
  - **No-Measure 전략**: 브라우저의 `getBoundingClientRect()` 대신 객체의 `style.left/top` 데이터가 Single Source of Truth(SSOT)가 되도록 합니다.
  - **Pure Data 연산**: 모든 이동/정렬 연산은 순수 픽셀(`px`) 산술로 수행하여 줌이나 레이아웃 방식에 영향을 받지 않는 절대적인 정확도를 보장합니다.
  - **자동 마이그레이션**: 스크린 로드 시 퍼센트(`%`) 단위가 발견되면 즉시 절대 픽셀(`px`)로 자동 변환하여 저장해야 합니다.
  - **글로벌 좌표 기준 고정**: 퍼센트 좌표를 절대 픽셀로 마이그레이션할 때, 가변 브라우저 해상도를 차단하고 현재 캔버스 너비(신규 1600x900 / 레거시 1440x900)를 기준으로 동적 변환하여 단일화해야 합니다.
- **MutationObserver 무한 재귀 루프 방지 (Value Comparison Guard)**: `enforceDesignSystem()` 등 MutationObserver 감지 루프 내에서 실행되는 모든 DOM 쓰기 작업(예: 카운터 `textContent`, 플레이스홀더 `display`, 텍스트 상자 `innerText`, `style.color` 등)은 무한 재귀 호출로 인한 브라우저 프리징을 막기 위해 반드시 **이전 값과 신규 값의 엄격한 동등 비교 가드**를 거치도록 설계해야 합니다. (특히 `style.color`는 브라우저 내부적으로 `rgb` 혹은 `hex`로 다르게 반환될 수 있으므로 둘 다 비교하는 안전장치가 필수적입니다.)
- **사이드바 크기 변경 시 컴포넌트 래퍼 크기 연동**: Textbox/Textarea처럼 내부 컨테이너로 스타일 리디렉션이 발생하는 컴포넌트의 경우, 가로/세로 크기(`width`, `height`)는 내부 컨테이너가 아니라 **최외곽 래퍼인 `.lf-component`**에 직접 할당해야 리사이저 핀과 드래그 핸들이 올바르게 위치합니다. 이때 내부 컨테이너의 가로/세로는 `100%`로 유지해 부모 크기에 유연하게 동조되도록 설계해야 합니다.
- **스마트 가이드 감도 및 동작 범위**: 스마트 가이드 자석 기능의 감도(임계값)는 5px로 축소하여 과도한 스냅을 조절하고, 이동 중인 컴포넌트 중심 300px 이내의 주변 오브젝트들하고만 정렬선이 반응하도록 제한합니다. 단, 캔버스 영역 외곽선 및 정중앙선은 거리에 무관하게 항상 동작해야 합니다.
- **드래그 다중 선택 조건 (PowerPoint Style)**: 드래그 영역 상자 내에 오브젝트의 전체 경계선이 온전히 포함되어야만 다중 선택 상태로 처리되도록 구현합니다 (단순 교차/걸침 시 선택 배제). 선(커넥터)의 경우 양끝단 지점이 모두 드래그 영역 상자 내에 있어야 선택됩니다.
- **기본 도형 스타일**: 도형의 기본 배경색은 `rgb(255, 255, 255)` (흰색), 테두리 색상은 `rgb(200, 200, 200)` (연한 회색)으로 고정하여 템플릿과 CSS에 일관적으로 적용합니다.
- **동일 간격 정렬 분배 (Distribute Alignment)**: 3개 이상의 다중 선택된 컴포넌트 사이의 간격을 동일하게 맞춰주는 '가로 간격 동일하게', '세로 간격 동일하게' 분배 정렬 기능을 제공합니다.
- **그룹 선택 비주얼**: 그룹화로 묶여 있는 오브젝트가 선택되었을 때는 일반 컴포넌트의 파란색 outline 대신 초록색(`#10b981`) outline과 초록색 핸들/리사이저를 적용하여 시각적 정체성을 분리합니다.
- **그룹 컴포넌트 프로퍼티 생략 규칙 (Group Component Property Hiding)**:
  - 단일 그룹 컴포넌트(`lf-group`) 선택 시, OBJECT PROPERTIES 플로팅 카드에서는 모든 입력 필드 및 상세 에디터 섹션(텍스트 에디터, 도형 색상 선택기 등)을 숨겨야 합니다.
  - 최상단에는 `"1 OBJECT SELECTED"` 문구와 함께 `[UNGROUP]`, `[ADD TO MOLECULES]`, `[BRING FRONT]`, `[SEND BACK]` 조작 버튼만 노출해야 합니다.
  - 이를 위해 그룹 컴포넌트 자체를 조회할 때 내부 자식 컴포넌트들(도형, 테이블, 아이콘 등)이 잘못 탐색되어 속성 에디터가 노출되는 현상을 완벽히 배제하도록 탐색 예외 처리가 필수적입니다.
- **라이브러리 국영문 검색 지원 및 영문 표기 통일 규칙 (Library Naming & Dual-Language Search)**:
  - 우측 사이드바의 모든 아톰(Atoms), 아이콘(Icons), 도형(Shapes)의 렌더링 명칭은 영문으로 통일하여 표기해야 합니다.
  - 단, 사용자가 한글로도 직관적으로 오브젝트를 검색할 수 있도록, HTML 카드 엘리먼트의 `data-ko` 속성 및 컴포넌트 모델 정의의 `koName` 속성에 국문 동의어 키워드를 동시 할당하여, 영문 및 국문 입력 모두에 반응하도록 고도화된 하이브리드 검색 필터 구조를 유지해야 합니다.
  - **아이콘 라이브러리 레이아웃 및 스타일 표준**:
    - **명칭 요약**: 우측 사이드바 아이콘의 표기 명칭이 길어 레이아웃이 깨지거나 텍스트가 넘치지 않도록, 한 줄 이내의 핵심 요약어(예: `Gift & Benefits` -> `Gift`, `Delivery Tracking` -> `Delivery`)로 축약 표기합니다.
    - **크기 및 정렬 통일**: 모든 라이브러리 아이콘 카드의 높이는 `76px`로 통일하고, 내부 아이콘 이미지/SVG 요소의 크기는 가로/세로 `24px`로 통일하여 그리드 균형을 유지하고 중앙 정렬합니다.
    - **색상 단일화**: 라이브러리 내 아이콘의 비주얼 일관성을 위해 모든 아이콘 색상은 흰색(`rgb(255, 255, 255)` / SVG stroke-width: 1.6, sprite 이미지의 경우 `filter: brightness(0) invert(1)` 등)으로 통일해야 합니다.
    - **카테고리 그룹화**: 아이콘들은 유사한 성격과 쓰임새(예: UI 기본 제어, 전자상거래/마케팅, 배송/물류, SNS/기타 등)의 논리적 카테고리 그룹 단위로 묶어서 순차적으로 배치합니다.
- **도형 텍스트(SHAPE Text) 여백 핏(Fit) & 렌더링 아키텍처 정밀 규격 수칙 (SSOT)**:
  - **1. 명칭 및 기획 정의**: 우측 사이드바 `SHAPE` 카테고리의 첫 번째 항목인 **`T (Text)` (도형 텍스트)**를 가리키며, `ATOMIC LIBRARY`의 첫 번째 항목인 **`Textbox` (텍스트박스 아톰)**와 엄격하게 구분한다. 내부 클래스명인 `.v4-text-box`와 상관없이 UI 상의 명칭은 반드시 **'도형 텍스트'**로 통일한다.
  - **2. 핵심 소스코드 수정 위치 (File Map)**:
    - **[assets/vctrl_text_measurer.js](file:///c:/Users/sisun/ai_work/assets/vctrl_text_measurer.js)**: 전략/디스패처(Strategy/Dispatcher) 패턴 기반의 컴포넌트 타입 분류기(`getComponentType`), 순수 오프스크린 측정 코어(`measureCellTextDimensions`), 그리고 타입별 100% 독립 전용 처리 엔진(`fitStandaloneTextShape`, `fitTextBox`, `fitShapeText`, `fitDefaultCell`)으로 텍스트 동적 테두리 피팅을 수행하는 핵심 로직 소유 파일.
    - **[assets/vctrl_iframe_styles.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_styles.js)**: 셀 기본 패딩(`padding: 4px !important;`) 및 FLEX 대칭 정렬 CSS 규칙 소유 파일.
  - **3. 정밀 박스-모델 수치 및 산술 공식 (Exact Math Spec)**:
    - **기본 차감 픽셀**: `box-sizing: border-box` 스펙 상 `1.6px` 보더(양쪽 3.2px) + `4px` 셀 패딩(양쪽 8.0px) = **`11.2px` 기본 차감**.
    - **순수 도형 텍스트(`isStandaloneTextShape`) 버퍼 할당**:
      - `addedW = 12` (가로 좌 6px + 우 6px) / `addedH = 8` (세로 상 4px + 하 4px)
      - **유효 공간 산식**: `(textW + 12px) - 11.2px = textW + 0.8px` (0.8px 서브픽셀 안전지대 확보 ➔ **텍스트 1줄 유지, 절대 2줄 분리 잘림 없음**).
      - **시각적 여백**: 상(4.0px), 하(4.0px), 좌(4.4px), 우(4.4px) ➔ **글자에 딱 밀착된 사방 ~4px 1:1 완벽 정대칭 핏 완성**.
  - **4. 재발 방지를 위한 5대 절대 금기 수칙 (Strict Anti-Patterns)**:
    - **[금기 1] 템플릿 리터럴 정규식 이중 백슬래시(`\\`) 필수**: `assets/vctrl_text_measurer.js`는 전체가 `window.v4TextMeasurerScript = \`...\``로 감싸져 있으므로 내부 정규식 작성 시 반드시 `\\u200B\\u00A0`, `<\\/span>`, `<br\\s*\\/?>`처럼 이중 백슬래시를 사용해야 한다. 단일 백슬래시 사용 시 iframe script 컴파일 오류(SyntaxError)로 이벤트 핸들러가 증발하여 **오브젝트 선택 불가(클릭 불능)** 버그가 일어난다.
    - **[금기 2] `!important` 속성의 `removeProperty()` 해제 필수**: `.lf-drag-handle` 등에 `setProperty('display', 'none', 'important')` 조치 후 복원 시 반드시 `removeProperty('display')`를 호출해야 한다. 단순 `style.display = ""`는 `!important`를 지우지 못해 이동 핸들이 영구 증발(선택 불가)하는 치명적 버그가 유발된다.
    - **[금기 3] `measureContainer` Quill CSS 클래스 상속 및 `display: inline` 필수**: 측정용 `div` 생성 시 `className = 'ql-editor v4-editable-cell'`을 부여하고 `targetDoc.body`에 주입해야 하며, 내부 하위 엘리먼트는 반드시 `display: inline !important`를 유지해야 부분 텍스트 컬러/서식 변경(`span`) 시 공백 폭(Space Width) 소실로 인한 의도치 않은 자동 줄바꿈 오측정 버그를 방지할 수 있다.
    - **[금기 4] 유니코드 특수 공백 정제 (`Line 123`)**: Quill 에디터가 주입하는 `.ql-cursor` 및 `\u200B`, `\u00A0` 특수 공백은 측정 전 `sanitizeHtml` 정규식으로 100% 정제하여 무효 공백 픽셀로 인한 좌우 여백 비대화 왜곡을 차단한다.
    - **[금기 5] 거대 단일 if-else 오버라이드 금지 및 전략 패턴(Strategy Pattern) 준수**: 컴포넌트별 피팅 로직 수정 시 하나의 거대 함수에 패치식 `if-else`를 누적하지 말고, `COMP_TYPES` 디스패처를 통해 전용 피터(`fitStandaloneTextShape`, `fitTextBox`, `fitShapeText`, `fitDefaultCell`)로 100% 독립 분리하여 타 컴포넌트 사이드이펙트를 원천 차단한다.
  - **5. 도형 텍스트 우측 하단 크기 조절 버튼(.lf-resizer) 완전 미노출 규격**:
    - 도형 텍스트(`.v4-text-shape`, `.v4-text-box`, `.text-marker`)는 폰트 크기 변경에 따른 동적 자동 핏(Fit)을 따르므로 우측 하단의 수동 크기 조절 버튼(`.lf-resizer`)은 완전히 불필요하다.
    - 이를 위해 `assets/vctrl_iframe_styles.js`에 `.v4-text-shape > .lf-resizer, .v4-text-box > .lf-resizer, .text-marker > .lf-resizer { display: none !important; }` CSS 선언부 및 `vctrl_text_measurer.js` 내의 `fitResult.hideResizer` 핸들러 제어 로직을 통해 리사이저 버튼을 완전히 숨겨야 한다.
  - **6. ATOMIC 컴포넌트 크기 제어 3단계 표준 규격**:
    - **1단계 (완전 고정형 - Stepper, Date Picker, Toggle Button, Check Box, Radio)**:
      - 캔버스 크기 조절 점(`.lf-resizer`): **미노출** (`display: none !important`)
      - 인스펙터 프로퍼티 (`Width / Height`): **미노출** (불필요한 크기 수치 입력창 제거하여 고유 옵션에 집중)
    - **2단계 (반고정/규격 폼 - File Upload, Alert, Button)**:
      - 캔버스 크기 조절 점(`.lf-resizer`): **미노출** (마우스 드래그로 인한 비의도적 레이아웃 왜곡 방지)
      - 인스펙터 프로퍼티 (`Width / Height`): **유지** (그리드나 상위 컨테이너 너비에 맞춘 정밀 픽셀 수치 조정 허용)
    - **3단계 (완전 가변형 - Textbox, Textarea, Search Bar, Selectbox, Image, Grid, Accordion, Popup, Shape)**:
      - 캔버스 크기 조절 점(`.lf-resizer`) 및 인스펙터 프로퍼티 (`Width / Height`): **모두 노출 유지**

- **🖼️ 스크린 배경 설정 시스템 (Screen Background Setting Architecture & SSOT)**:
  - **최하단 무간섭 레이어 (`#canvas_bg_layer`)**:
    - 캔버스 배경 이미지는 iframe 내부 캔버스 루트(`#canvas` 또는 `.canvas`) 최하단 자식으로 배치되는 `<div id="canvas_bg_layer">` 및 하위 `<img id="canvas_bg_img">`로 렌더링됩니다.
    - **오브젝트 간섭 원천 차단**: 캔버스 상의 모든 오브젝트 클릭, 마키 드래그(Marquee), 커넥터 앵커링 조작에 일절 영향을 주지 않도록 **`pointer-events: none !important; user-select: none; overflow: hidden;`** 및 `object-fit: cover`를 절대 불변 규칙으로 강제합니다.
  - **사이드바 LIBRARY 모달 & 퀵 프리셋 연동**:
    - 우측 사이드바 `LIBRARY` 최상단 **`[배경 설정]`** 원터치 퀵 버튼 클릭 시 배경 설정 모달이 호출됩니다.
    - **기본 저채도 모노크롬 프리셋 2종 탑재**:
      1. `이커머스 FRONT UI 개선` (`assets/illustrations/ecommerce_ui_bg.jpg`): 쇼핑몰 상품/장바구니 와이어프레임 & 그리드 모티프
      2. `백엔드 / ADMIN 시스템 고도화` (`assets/illustrations/admin_backend_bg.jpg`): 어드민 대시보드 & 서버 API 아키텍처 모티프
    - **투명도(Opacity) 실시간 슬라이더**: 0% ~ 100% 범위에서 배경 이미지 투명도를 실시간 조절할 수 있습니다.
    - **사용자 커스텀 이미지 업로드**: 클라이언트 브라우저 Canvas를 통해 1920px max 해상도, JPEG 85% (~200KB)로 자동 경량화 압축 후 base64 인라인 주입을 지원합니다.
  - **메시지 통신 및 Undo 지원**:
    - 부모 ➔ Iframe: `LF_SET_CANVAS_BACKGROUND` (`action: 'set' | 'remove' | 'update_opacity'`, `imageUrl`, `opacity`)
    - Iframe ➔ 부모: `LF_CANVAS_BACKGROUND_UPDATED` (`hasBg`, `url`, `opacity`)
    - 배경 변경 시 `V4UndoManager.saveState()`를 자동 호출하여 `Ctrl + Z` 실행 취소를 지원합니다.

- **🎨 일러스트 라이브러리 및 3D/2D 에셋 표준 규격 (Illustration Library & Visual Assets Standards)**:
  - **단일 진실 공급원 규칙 문서**: 일러스트 제작 7대 불변 원칙, 규격, 메타데이터 인터페이스는 **[docs/rules_illustration_library.md](file:///c:/Users/sisun/ai_work/docs/rules_illustration_library.md)**에서 통합 관리합니다.
  - **2열 대칭 반응형 그리드 (`#illustration-library-container`)**:
    - 우측 사이드바 `LIBRARY` 내 `ILLUSTRATION` 카테고리에서 2열 그리드로 렌더링되며, 4대 논리 그룹별 **`.illustration-group-divider`** 섹션 헤더(제목 + 배지 카운트)를 제공합니다.
    - **표시 명칭 표준화**: 2열 카드(~130px) 가로폭에서 말줄임이 발생하지 않도록 카드 라벨은 `[태그] 핵심어` (예: `[3D] 상품관리`, `[여정 01] 입장`, `[아토믹 01] Atoms`)로 간결화하고, 상세 설명은 마우스 호버 `title` 툴팁으로 제공합니다.
    - **국영문 하이브리드 통합 검색**: `item.name`, `item.title`, `item.koName`(동의어 키워드)을 모두 스캔하여 한글/영문 검색어 입력 시 즉각 필터링됩니다.
  - **4대 스타일 그룹 분류 및 정렬 순서 (총 25종)**:
    1. **🏢 Group 1: 3D Admin 시스템 (7종)**: 상품관리(PIM) ➔ 전시관리(CMS) ➔ 주문결제(Order) ➔ 클레임관리(Claim) ➔ 물류배송(Logistics) ➔ 회원멤버십(Membership) ➔ 프로모션(Promotion) (`240px × 240px` 투명 PNG).
    2. **📐 Group 2: 2D Admin 시스템 (3종)**: 상품관리(PIM) ➔ 전시관리(CMS) ➔ 배송물류(Logistics) (`240px × 240px` 투명 PNG).
    3. **🛍️ Group 3: 고객 구매 여정 (8종)**: 01.입장 ➔ 02.탐색 ➔ 03.선택 ➔ 04.멤버십 ➔ 05.할인혜택 ➔ 06.주문결제 ➔ 07.배송수령 ➔ 08.반품교환 (`200px × 200px` 투명 PNG).
    4. **🧬 Group 4: 아토믹 디자인 시스템 (7종)**: 01.Atoms ➔ 02.Molecules ➔ 03.Organisms ➔ 04.Layout ➔ 05.Pages (높이 `240px` 통일) 및 아토믹 구조도 ➔ 스토리북 허브 (`320px × 240px` 투명 PNG).
  - **표준 3계층 컴포넌트 삽입 규격**:
    - 캔버스 삽입 시 `.lf-component` 최외곽 래퍼 ➔ `.v4-illustration-container` ➔ `<img style="object-fit: contain; pointer-events: none; user-select: none;">` 표준 3계층 구조로 렌더링되며, 캔버스 드래그, Nudge 이동, 크기 조절 점(`.lf-resizer`), `Delete`, `Ctrl+Z`를 100% 보장합니다.
  - **라이브러리 접기/펼치기 아코디언 및 상태 영속화 (`V4SidebarAccordion`)**:
    - `ICON LIBRARY` 및 `ILLUSTRATION` 헤더 클릭 시 개별 영역을 자유롭게 접고 펼칠 수 있는 독립 아코디언 컨트롤러(`assets/vctrl_component_library.js`) 탑재.
    - **상태 영속화 (`localStorage`)**: 사용자 설정 접힘 상태(`vctrl_sidebar_accordion_state`)를 로컬에 보존하여 화면 새로고침(F5) 후에도 접힘 상태를 100% 유지합니다.
    - **검색 시 자동 펼침 및 복원 (Search Resilience)**: 검색어 입력 시 매칭 결과가 있는 섹션은 자동으로 펼쳐서 즉각 노출하고, 검색어를 지우면 사용자가 설정해둔 원래 접힘 상태로 무결하게 복구됩니다.
    - **실시간 에셋 수량 뱃지 & Chevron 회전**: 헤더별 총 수량 뱃지(아이콘 `36`, 일러스트 `25`) 및 180도 회전 Chevron 마이크로 애니메이션 제공.
    - **일러스트 4대 스타일 서브 그룹 아코디언**: 일러스트 내부의 각 스타일 구분선(`.illustration-group-divider`) 클릭 시 해당 그룹(`3d_admin`, `2d_admin`, `journey`, `atomic`)의 카드들만 개별적으로 접고 펼치는 2단계 아코디언을 지원합니다.

- **💾 로컬 일일 데이터 자동 백업 및 복원 배치 시스템 (Daily Data Backup & Protection Engine SSOT)**:
  - **자동 백업 엔진 ([scripts/daily_auto_backup.ps1](file:///c:/Users/sisun/ai_work/scripts/daily_auto_backup.ps1))**:
    - 매일 18:00에 윈도우 작업 스케줄러(`AiWork_Daily_Project_Backup`)를 통해 무인 백그라운드 자동 구동됩니다.
    - `FileShare.ReadWrite` 스트림 복사 방식을 채택하여 에디터 브라우저가 화면을 편집/저장 중이더라도 파일 잠금(Locking) 충돌 없이 안전하게 임시 스테이징 후 UTF-8 표준 ZIP 아카이브로 압축합니다.
    - 아카이브 생성 즉시 내부 엔트리 수, 프로젝트 메타데이터, 스크린 파일 존재 여부를 자체 전수 검증(Self-Verification)하며, 실패 시 롤백합니다.
    - **보존 정책 (Retention Policy)**: 기본 30일 보관, 최소 5개 이상의 최신 백업 아카이브를 강제 보존하여 유실을 원천 방지합니다.
  - **스케줄러 관리자 ([scripts/setup_daily_schedule.ps1](file:///c:/Users/sisun/ai_work/scripts/setup_daily_schedule.ps1))**:
    - `install_schedule.bat` / `uninstall_schedule.bat`을 통해 원클릭 등록/해제할 수 있으며, PC가 꺼져 있어 실행 시간을 놓친 경우 다음 부팅 시 즉시 실행(`-StartWhenAvailable`)하는 캐치업 로직을 탑재했습니다.
  - **안전 복원 엔진 ([scripts/restore_data.ps1](file:///c:/Users/sisun/ai_work/scripts/restore_data.ps1))**:
    - `restore.bat` 실행 시 대화형 목록에서 특정 날짜 백업본을 선택하여 복원할 수 있으며, 복원 실행 전 현재 `data/` 상태를 `_pre_restore_safety_*` 폴더에 1차 안전 백업한 후 덮어쓰므로 언제든지 복원 전 상태로 되돌릴 수 있습니다.
  - **설정 SSOT ([backup_config.json](file:///c:/Users/sisun/ai_work/backup_config.json))**: 백업 소스, 목적지(`C:\ai_work_backups\daily`), 실행 시각, 보존 주기, 윈도우 토스트 알림 여부를 통합 제어합니다.


## 🛡️ 보안 및 통신 규칙 (매수 중요)
- **Pure MessageHub Architecture**: 부모 창의 오케스트레이터에서 iframe 내부 요소에 절대로 직접 접근(`contentDocument`)해서는 안 됩니다. 반드시 `MessageHub`를 통해 메시지를 보내고, Iframe 내부 스크립트(`vctrl_iframe_script.js`)가 처리를 위임받아 실행하도록 설계해야 합니다.
- **명령어 유연성 (Case-Insensitivity)**: `MessageHub`를 통해 전달되는 모든 액션 명령어는 대소문자를 구분하지 않으며, 하이픈(`-`)과 언더바(`_`)를 모두 수용하도록 정규화하여 처리합니다.

## 📐 스크린 에이전트 직접 제작/빌드 시 9대 불변 대원칙 (Screen Authoring Standards)
> AI가 사용자 요청으로 워크스페이스 에디터의 스크린(HTML)을 직접 그릴 때는 반드시 `workspace-editor-screen-authoring` 스킬과 아래 9대 원칙을 100% 준수해야 합니다.
> - **참조 벤치마크 스크린 (SSOT Benchmark Screens)**:
>   1. [03_Admin_System_Development_Roadmap_900.html](file:///c:/Users/sisun/ai_work/data/operation_process/03_Admin_System_Development_Roadmap_900.html): 어드민 시스템 로드맵 (100% 원자적 오브젝트 분리 + 3D 도메인 일러스트 결합)
>   2. [04_Front_System_Milestone_Timeline_900.html](file:///c:/Users/sisun/ai_work/data/operation_process/04_Front_System_Milestone_Timeline_900.html): 프론트 중장기 마일스톤 (상·하 교차 웨이브 인포그래픽 + `#canvas_bg_layer` 무간섭 배경 적용)
>   3. [05_Admin_System_Milestone_Timeline_900.html](file:///c:/Users/sisun/ai_work/data/operation_process/05_Admin_System_Milestone_Timeline_900.html): 어드민 시스템 7단계 타임라인 인포그래픽
>   4. [10_Product_Ranking_Rules_850.html](file:///c:/Users/sisun/ai_work/data/p_lus0e/10_Product_Ranking_Rules_850.html): 상품 랭킹 산정 룰 프로세스 & 정책 다이어그램
>   5. [11_Daily_Ranking_Batch_Percentile_851.html](file:///c:/Users/sisun/ai_work/data/p_lus0e/11_Daily_Ranking_Batch_Percentile_851.html): 일일 랭킹 배치 파이프라인 & 백분위수 정규화 시뮬레이션 테이블 (최소 13px 폰트 규격 엄수)
>   6. [01_Benchmark_Report_382.html](file:///c:/Users/sisun/ai_work/data/p_bujl8/01_Benchmark_Report_382.html): 이커머스 주문서 최대 할인 벤치마크 리포트
- **1. 사실 기반 데이터 전용 (Fact-based Data Only)**: 무조건 사실 기반 데이터로만 스크린을 그린다. 거짓된 데이터나, AI가 상상하는 값을 수치화로 넣지 않는다. (환각 금지, 기획서/요청 데이터 100% 팩트 기반)
- **2. LIBRARY 표준 오브젝트 100% 활용 (Native Library Objects Only)**: 스크린에 존재하는 모든 오브젝트는 LIBRARY에 존재하는 도형(`.v4-shape`), 아톰, 아이콘(`.lf-icon` SVG)을 활용한다. 비표준 임의 HTML 태그나 커스텀 스타일 클래스는 금지한다.
- **3. 최소 단위 원자적 분리/파편화 (Atomic Granularity & Separation)**: 스크린을 구성하는 오브젝트는 최소 단위로 잘게 쪼개져서 파편화되어야 한다. 사용자가 캔버스 위에서 직접 내용을 클릭하여 수정하기 원활하게 하기 위함이다. 카드 1개를 구성하더라도 [배경 쉐입] + [독립 아이콘] + [독립 타이틀] + [독립 뱃지] + [독립 설명]으로 각각의 `.lf-component`로 완전 분리 배치해야 한다.
- **4. 텍스트 폰트 크기 최소 13px 이상 (Min Font-Size >= 13px)**: 스크린의 텍스트 폰트 크기는 최소 13px 이상으로만 구성한다. 그 이하(10px, 11px, 12px 등)의 폰트 크기는 가독성을 저하시키므로 절대 사용하지 않는다.
- **5. 이미지 및 일러스트 적극 활용 및 부재 시 즉시 제작 활용 원칙 (Proactive Illustration Usage & Instant Generation)**: 텍스트 위주의 밋밋하고 건조한 스크린 구성을 배제하고, 도메인/맥락에 부합하는 일러스트(3D/2D)와 그래픽을 적극 배치한다. 상황에 완벽히 부합하는 기존 이미지가 `assets/illustrations/`에 없을 경우, `generate_image` 도구를 가동하여 고품질 이미지를 즉시 직접 제작(`assets/illustrations/`에 저장)하여 화면에 반영한다.
- **6. 간결하고 깔끔한 레이아웃 (Concise & Clutter-Free Layout)**: 스크린은 최대한 깔끔하게 구성되어야 하고, 불필요하게 많은 텍스트는 지양한다. 반드시 필요한 내용으로만 구성하고 중복되는 내용은 지양하며, 1600x900 단일 캔버스 내에서 스크롤 없이 완결되는 레이아웃을 구성한다.
- **7. 절제된 컬러 및 포인트 강조 (Restrained Color Palette & Strategic Accent)**: 컬러를 너무 다양하게 사용하지 않는다. 뉴트럴 톤(배경 #f8fafc/#ffffff, 보더 #e2e8f0, 텍스트 #0f172a)을 기본으로 하고, 매우 중요해서 강조되어야 하는 부분에만 중점적으로 1~2개의 포인트 컬러(블루, 그린, 핑크 등)를 전략적으로 사용한다.
- **8. 스크린 생성/수정 완료 시 무조건 GitHub 원격 배포 (Mandatory Automated GitHub Deployment)**: 스크린을 신규 생성하거나 수정했을 때는 로컬 작업에 그치지 않고, 반드시 `git pull --rebase origin main` 선행 후 `git push origin main`까지 자체적으로 즉시 자동 완결한다.
- **9. 표준 템플릿 기반 제작 시 픽셀 단위 레이아웃 100% 보존 (Strict Pixel-Perfect Template Preservation)**: 사용자가 지정하거나 제공된 표준 템플릿(예: [과제 개요] 등 `template_*.html`)을 바탕으로 스크린을 제작할 때는 도형, 텍스트 상자, 아이콘, 카드 등의 크기(`width/height`), 위치(`top/left`), 여백(`margin/padding`), 정렬(`align`), 계층(`z-index`)을 픽셀(PIXEL) 단위로 100% 보존해야 한다. AI가 임의로 도형 크기나 여백, 얼라인을 변경하는 행위는 전체 문서 시스템의 시각적 통일성을 파괴하므로 전면 금지하며, 오직 내부 콘텐츠(텍스트, 라벨, 적합한 일러스트 이미지 경로)만 정밀하게 1:1 치환해야 한다.
- **임의의 기획 요약 및 누락 절대 금지 (1:1 Text & Data Match)**:
  - 원본 PPT(슬라이드) 또는 가이드 이미지를 바탕으로 스크린을 자동 생성할 때, 기획서의 핵심 데이터를 임의로 축소, 생략하거나 대체 텍스트로 요약하는 것을 전면 금지합니다.
  - 슬라이드 속의 복잡한 표(Table)나 수치, 데이터 및 설명 텍스트는 **단 한 글자의 누락도 없이 100% 동일하게** 에디터 객체(`.lf-component`)로 코딩하여 완벽히 이식해야 합니다.
- **반응형 테이블 종속형 오버레이 구조화 (Nested Element Principle)**:
  - 특정 열(Column)이나 셀(Cell)을 덮어버리는 특수 레이어(예: 비효율 그레이 딤드 오버레이 등)를 설계할 때, 절대 테이블 외부에서 `position: absolute`와 고정 픽셀 좌표(`left/top`)로 얹어서는 안 됩니다.
  - 브라우저의 텍스트 길이에 따라 테이블 셀 너비가 유연하게 변하므로, 반드시 해당 열(`td`) 내부에 자식 노드로 오버레이 요소를 중첩하거나 해당 `td`들의 클래스 배경색 스타일링을 활용하여 **테이블과 자석처럼 결합하여 움직이게** 구현해야 합니다.
- **테이블 그리드 및 보더 정합성 확보 (1.6px Table Border & Grid)**:
  - 에디터 엔진의 전역 스타일시트 간섭을 방지하기 위해, 테이블과 모든 셀 테두리에는 `border: 1.6px solid var(--v4-border) !important`를 명시하고 `border-collapse: collapse`를 통해 선명하고 부러지지 않는 격자선을 확실하게 렌더링해야 합니다.
  - **테이블 컴포넌트 세부 가변 및 스타일 동기화 규칙 (V4 Table Shape Dimension & Styling Protocol)**:
    - **외곽 테두리 누락 차단**: `border-collapse: collapse` 환경 하에서 테이블 전체의 상·하·좌·우 외곽선이 둥근 모서리나 영역 제한으로 인해 깎여 나가는(clipping) 현상을 방지하기 위해, 테이블 컴포넌트의 CSS 정의 및 템플릿 코드에서 `overflow: hidden`과 `border-radius` 속성을 반드시 제거하고 사방 `border`가 완전히 그려지도록 설정합니다.
    - **행 추가 시 높이 유지**: 테이블 행 추가(`add-row`) 시 신규 행이 납작하게 찌그러지지 않도록, 현재 포커스되거나 인접한 기준 행(`templateRow`)의 높이(`height` 스타일)를 복사하여 설정하고, 기준 행이 없거나 높이가 지정되어 있지 않을 경우 기본값인 **`50px`**이 강제 대입되도록 구현해야 합니다.
    - **행 삭제 시 테이블 높이 가변**: 테이블 행 삭제(`del-row`) 시, 테이블 자체에 고정된 `height: 100%` 스타일 때문에 테이블 `offsetHeight` 측정이 줄어들지 않아 부모 박스 높이가 그대로 유지되는 버그를 막아야 합니다. 이를 위해 크기 재측정(`syncTableComponentSize`) 시점에 일시적으로 테이블 `height` 스타일을 **`auto`**로 변경하여 남아 있는 잔여 행들의 순수 높이 합을 계산하여 전달한 뒤, 다시 원래 스타일(`100%`)로 복구해 주어야 합니다.
    - **열/행 치수 변경 시 즉시 가변**: 특정 컬럼의 너비(`width`)나 행 높이(`height`)를 변경할 때(`LF_UPDATE_CELL_DIMENSION`)에도, 테이블의 크기를 재측정하는 `window.syncTableComponentSize`를 호출하여 부모 `.lf-component` 래퍼 박스의 가로/세로 크기도 유기적으로 실시간 변경(가변 처리)되게 동기화해야 합니다.
    - **폰트 크기 변경 및 중요도 설정**: 테이블의 폰트 크기 변경(`LF_UPDATE_STYLE` with `fontSize`) 시, 전역 CSS의 하드코딩된 `!important` 폰트 크기 설정을 덮어쓰기 위해 `subSelector` 스타일 주입 시 일반 대입 대신 `setProperty(..., ..., 'important')` 방식을 사용하여 폰트 크기를 강제 적용하고, 스타일 반영 즉시 `window.syncTableComponentSize`를 호출하여 가이드 상자가 알맞게 늘어나도록 보장합니다.
    - **열 추가 시 인접 스타일 복사**: 테이블 열 추가(`add-col`) 시 신규 추가되는 셀들이 기존 열들의 폰트 스타일, 배경색 등과 다르게 기본 스타일로 추가되는 버그를 차단하기 위해, 삽입 직전 인접한 기존 셀(`templateCell`)을 탐색하여 그 스타일(`style.cssText`)을 복사한 뒤 신규 셀(`th`, `td`)에 대입하여 비주얼 통일성을 상시 유지해야 합니다.
- **양측 여백 및 테이블 크기 균형 가이드 (Balanced Layout Breathing Room & Exact Column Grid)**:
  - 열(Column) 개수가 줄어들거나 증가하더라도 테이블을 캔버스 크기에 꽉 채우기 위해 개별 열의 가로폭을 과도하게 늘려서(`width:100%` 등으로 무리한 팽창) 화면 끝단에 닿아 우측 여백이 잘리는 답답한 배치를 만들어서는 안 됩니다.
  - 컨텐츠 양에 맞게 각 열의 가로폭을 최적의 픽셀(예: 날짜 열 `140px` ~ `160px`)로 차분히 줄이고, 테이블 전체 가로폭(`comp-main-table`의 `width` 값) 역시 컴팩트하게 축소해야 합니다.
  - 이때, 전체 페이지들의 일관성 있는 레이아웃 흐름을 유지하기 위해 테이블의 시작 위치는 항상 슬라이드 표준인 **`left: 40px`** (또는 프로젝트 표준인 **`left: 30px`**)로 엄격히 고정해야 하며, 임의로 테이블을 중앙 정렬하여 정렬선을 깨뜨려서는 안 됩니다. 여백은 오직 줄어든 테이블 너비에 따른 우측의 풍부한 여백(Breathing space)으로만 세련되게 표현되어야 합니다.
  - **초정밀 열 간격 제어 규칙 (Exact Column Widths & Box-Sizing)**: 테이블의 열 개수가 많아 전체 가로폭(`width: 1380px` 등)을 가득 채워야 할 때, 브라우저가 패딩과 보더 두께를 더해 표가 컨테이너 바깥으로 삐져나가거나 짤리는 오버플로우 현상을 원천 차단해야 합니다. 이를 위해 모든 테이블 셀(`th, td`)에는 반드시 **`box-sizing: border-box !important`**를 적용해야 하며, 각 열(`th`)의 `width` 합계가 메인 테이블 컨테이너의 전체 `width`를 절대 초과하지 않도록 개별 열의 가로폭을 정밀하게 나누어 제어하여(예: 8열의 경우 각 127px 등으로 균등 축소) 완벽히 맞닿는 그리드를 유지해야 합니다.
- **[배송예정일 설정] 템플릿 작성 및 빌드 표준 (Shipping Notice Planning Standard)**:
  - **1. 좌측 정렬선 및 그리드 고정**: 타이틀 도형(`comp-title-shape`)과 메인 테이블(`comp-main-table`)은 반드시 전체 슬라이드 흐름 및 로고 시작점과 완벽히 일직선상에 정렬되도록 **`left: 30px`** (타이틀은 마진 보정으로 `left: 29.5px`)로 좌측 정렬을 엄격히 고정합니다.
  - **2. 가로폭 규격 및 우측 여백 확보**: 날짜 개수에 무관하게 테이블 컨테이너의 가로폭은 1440px 규격 내에서 완벽한 30px 대칭 마진을 달성하도록 **`width: 1380px`**를 채우는 것을 원칙으로 합니다. (날짜가 적을 때는 임의의 빈 공간을 중앙 정렬하지 않고 `width: 1120px`와 같이 축소하되, 시작 위치는 무조건 `left: 30px`로 유지하여 우측의 세련된 여백미를 살립니다.)
  - **3. 요일 표기 및 주말/공휴일 하이라이트**: 날짜 칼럼 헤더는 날짜 뒤에 해당하는 요일을 괄호 형태로 표기합니다. (예: `5/22 (금)`, `6/6 (토)`). 토요일, 일요일 및 공휴일 헤더는 캘린더 가독성을 직관적으로 극대화하기 위해 반드시 **`h-red`** 클래스 배경색을 입혀 붉은색으로 명확히 표현해야 합니다.
  - **4. 특이 예외 케이스 감지 및 조색**: 안산 출고 여부, 택배 집하 여부 등 기본값이 `Y`인 데이터 중에서 특이 예외 상황(예: 집하/배송 불가 `N` 값, 혹은 마감 시간이 13시로 단축 조율된 케이스 등)이 발견되면, 해당 셀의 `<td>` 태그에 **`bg-peach`** 클래스(`#fee2e2 !important` 연분홍색 배경)를 강제 적용하여 특별한 주의가 필요함을 시각적으로 강력하게 소통해야 합니다.
  - **5. 초정밀 열 간격 제어와 Box-Sizing의 병합**: 8일 이상의 복잡한 요일이 들어가더라도 열 간격이 테이블 컨테이너 밖으로 오버플로우되거나 짤려 보이지 않도록, 테이블의 모든 셀(`th, td`)에 반드시 **`box-sizing: border-box !important`**를 선언해야 합니다. 또한, 각 열의 가로폭 지정 합계가 메인 테이블 컨테이너 너비(`1380px`)를 수학적으로 정확하게 일치하거나 미세하게 하회하도록(예: 8열의 경우 라벨 180px * 2, 날짜 127px * 8 = 1376px로 4px 여유) 칼럼별 픽셀을 정밀하게 분할 지정해야 합니다.
  - **6. ISSUE 행 삽입 및 휴일/이벤트 표기**: 헤더(Header) 바로 아래이자 본문 첫 행(안산 출고 여부) 위에 **`ISSUE / 이슈`** 행을 필수로 삽입합니다. 이 행의 셀들은 모두 `contenteditable="true"` 상태로 제공되어야 하며, 크리스마스, 명절, 현충일, 삼일절, 광복절, 선거일자, 대체휴무일 등 해당 날짜에 해당하는 공식 휴일이나 특이 이슈 명칭을 명확하게 텍스트로 기입해야 합니다.


## ⚠️ 에이전트의 흔한 실수 방지
- **정밀 분석 후 실행**: 작업을 시작하기 전 픽셀 단위까지 분석하고 '단 한 번에 확실하게' 진행하세요.
- **회귀 방지 (Regression Guard)**: 엔진 수정 후에는 '스크린 추가', '전체 저장', '삭제' 등 핵심 UI 로직이 여전히 정상 동작하는지 코드 무결성을 철저히 검토하세요.
- **인코딩 깨짐 주의**: 대량의 텍스트 교체 시 한글 문자열이 깨지지 않도록 도구 사용에 주의하고, 수정 후에는 `Select-String` 등을 통해 의도치 않은 깨짐 문자가 없는지 확인하세요.
- **브래킷(괄호) 매칭 무결성 상시 검사**: 엔진 및 에디터 코드에 중첩 조건문, 삼항 연산식, 중괄호 블록 등을 대량 수정한 후에는 반드시 `scripts/check_syntax.ps1` 스크립트를 구동하여 브래킷 불일치로 인한 `SyntaxError`가 존재하지 않는지 엄격히 검증하여 배포해야 합니다. 필요시 `scripts/verify_all.ps1`을 통해 실제 브라우저 엔진(Edge headless) 상의 전수 구문 적합성을 보강 검증합니다.
- **중첩 삼항 연산자(Nested Ternaries) 지양 및 분기문 최적화**: 가독성을 해치고 브래킷 매칭 오류(SyntaxError)를 유발하기 쉬운 다중 중첩 삼항 연산자 대신 명확한 `if - else if` 분기 또는 매핑 객체(Dictionary)를 사용하세요. 특정 모듈(예: `vctrl_inspector.js`)의 SyntaxError로 인해 객체(예: `DOM`)가 생성되지 못하면, 이를 의존하는 다른 모듈들까지 `ReferenceError`로 작동을 멈추는 연쇄 장애가 발생하므로 구문 오류 예방에 최우선적으로 집중해야 합니다.
- **템플릿 리터럴 내 문자열 이스케이프 및 결합 표준**: `vctrl_iframe_script.js`와 같이 파일 전체가 큰 백틱(`` ` ``) 템플릿 문자열로 감싸진 채 부모 측 브라우저에서 동적으로 평가(eval)되는 파일의 경우, 내부 코드에서 또다시 백틱(`` ` ``)이나 변수 보간(`${}`) 구문을 사용하면 문법 충돌(SyntaxError)이 일어나 작동이 중단됩니다. 이를 방지하기 위해 내부 문자열 표현은 반드시 표준적인 따옴표(싱글/더블)와 덧셈 연산자(`"Sub Item " + (i + 1)`)를 활용해 문자열을 결합해야 합니다.
- **신규 아톰 추가 시 옵션 프로퍼티 플로팅 카드 통합 규칙**: 신규 아톰의 설정 패널을 디자인할 때는 우측 사이드바가 아닌 옵션 프로퍼티 플로팅 카드(`Object Properties Floating Card`)에 노출되도록 `vctrl_inspector.js` 내의 `DOM` 매핑 등록, `restorePropertiesSections` 복원 대상 등록, `updateProperties`의 보이기/숨기기 처리 및 선택 해제(Deselect) 시 숨김 처리를 빠짐없이 세트로 적용하여 사이드바에 옵션 패널이 잔존하는 버그를 원천 차단해야 합니다.
- **이벤트 핸들러 연쇄 차단 방지 (Non-Blocking Event Listener Flow)**: `mouseup` 또는 `mousemove`와 같은 전역 통합 이벤트 리스너를 수정할 때, 개별 조건문(예: `isConnectorDragging`) 처리 후 `return;`으로 조기 종료를 남용하지 마세요. 조기 종료가 남용되면 하위의 `isMarquee` 상태 해제(`LF_MARQUEE_END`) 및 선택 박스(`.v4-marquee-box`) 제거 로직이 차단되어 클릭 시 캔버스에 파란색 점 잔상이 생성되거나 다중선택 드래그가 마비되는 사이드 이펙트가 발생합니다. 모든 상태 해제 연산은 상호 간섭이 없도록 독립 순차 구문으로 전개해야 합니다.

## 📱 [반응형] 템플릿(PC & Mobile) 전용 아키텍처 및 개발 표준 (Responsive Specification)
- **1. 레이아웃 및 2단 독립 프레임 규격 (Layout & Containers)**:
  - 반응형 스크린은 1600x900 규격 내에 좌측 **PC 프레임(`1160px` / 전체 1172px)**과 우측 **Mobile 프레임(`360px` / 전체 382px)**이 병렬 배치된 2단 독립 스크롤 구조를 갖는다.
  - **PC 프레임 계층**: `.pc-column` ➔ `.frame-label-bar` (상단 라벨바) + `.pc-browser-frame` ➔ `.pc-browser-header` + `.pc-content-area` (스크롤 컨테이너) ➔ `.pc-content-inner` (실제 오브젝트가 위치하는 절대좌표 캔버스).
  - **Mobile 프레임 계층**: `.mobile-column` ➔ `.frame-label-bar` (상단 라벨바) + `.mobile-frame` ➔ `.mobile-top-bar` + `.mobile-content-area` (스크롤 컨테이너) ➔ `.mobile-content-inner` (실제 오브젝트가 위치하는 절대좌표 캔버스).
- **2. 비반응형 일반 템플릿과의 100% 완전 분기 격리 (Strict Isolation Guard)**:
  - 반응형 전용 기능(크로스 클립보드, 마키 좌표 보정 등)을 개발/수정할 때는 반드시 `const isResponsiveTemplate = !!(document.querySelector('.pc-content-inner') || document.querySelector('.mobile-content-inner'));` 가드를 엄격히 적용해야 한다.
  - 일반 비반응형 화면에서는 기존의 `document.body` 기반 단일 캔버스 파이프라인이 100% 원본 그대로 실행되어야 하며 어떠한 부작용도 발생해서는 안 된다.
- **3. PC ↔ Mobile 양방향 크로스 복사/붙여넣기 및 뷰포트 정중앙 안착 (Cross-Frame Clipboard & Viewport-Center Paste)**:
  - **활성 프레임 감지**: 사용자가 클릭한 프레임(`window.lastActiveFrame` / `.active-column`)을 최우선 타겟 컨테이너(`mobileInner` 또는 `pcInner`)로 라우팅한다.
  - **PC → Mobile 복사 시**: Mobile 프레임 폭(`360px`)을 초과하는 대형 컴포넌트는 `width: 330px`로 자동 클램핑되고 `left` 좌표가 내부로 안전하게 보정된다.
  - **Mobile → PC 복사 시**: 1160px 너비의 넓은 PC 캔버스에 원본 비율과 오프셋을 유지하며 매끄럽게 안착된다.
  - **뷰포트 정중앙 계산**: 복사된 오브젝트(또는 다중 선택 그룹)의 바운딩 박스 중심을 계산하여, 현재 스크롤 위치(`scrollTop`)와 뷰포트 높이(`clientHeight`)의 정중앙에 정확히 배치하며 내부 상대 좌표를 1:1로 보존한다.
- **4. 상단 라벨바(`.frame-label-bar`) 규격 및 다크 테마 표준**:
  - `backdrop-filter: blur(...)` 속성은 캔버스 줌/스케일 환경에서 GPU 서브픽셀 래스터화 블러를 유발하므로 절대 사용하지 않는다.
  - 배경은 `#141720` 솔리드 다크 테마, 보더는 `1.6px solid rgba(255, 255, 255, 0.12)`, 높이 `32px`, 패딩 `0 12px`, 모서리 `8px` 둥글기를 적용한다.
  - 폰트 두께는 가독성을 극대화한 `600 (SemiBold)`과 `-webkit-font-smoothing: antialiased`를 필수 적용한다.
- **5. 반응형 프레임 스타일 단일 SSOT 수칙 (Single Source of Truth)**:
  - 반응형 프레임 런타임 스타일의 단일 진실 공급원(SSOT)은 `assets/responsive_frame.js` (`window.responsiveFrameStyles`)이다. Iframe 주입 및 렌더링은 이 스크립트 기반으로 동작하며, `assets/responsive_frame.css`는 정적 참조/미러 산출물 역할을 수행한다. 스타일 확장 시 런타임 SSOT인 `responsive_frame.js`를 우선 갱신한다.

## 🚀 작업 프로세스 및 안정성 대원칙 (CRITICAL)
1. **고민 (Pondering)** -> 2. **분석 (Analysis)** -> 3. **설계 (Design)** -> 4. **실행 (Execution)** -> 5. **확인 (Verification)** 단계를 엄격히 준수합니다.
- **[AI 브라우저 직접 검증 절대 금지]**: 에이전트(AI)가 브라우저 자동화 도구(`browser_subagent` 등)를 실행하여 직접 브라우저를 열고 조작/검증하는 행위는 원천 금지합니다. 작업 속도와 리소스 효율을 위해 정밀 소스코드 심층 분석, 브래킷/구문 검사(`scripts/check_syntax.ps1` / `node -c` / `scripts/verify_all.ps1`)를 통한 정적 무결성 확보에 집중하며, 브라우저 상의 UI 동작 검증은 사용자가 직접 확인할 수 있도록 점검 절차와 가이드만을 제공합니다.
- **[무조건적 원복 규칙]**: 논리적 에러나 구문 오류 발견 시 즉시 모든 작업을 중단하고 작업 전 상태로 되돌립니다.
- **[요청 시 배포 규칙]**: 깃허브(GitHub) 배포(Push)는 반드시 사용자가 명시적으로 배포를 요청할 때만 수행해야 합니다. 개발 안정성 및 롤백 유연성 확보를 위해 임의의 자동 배포는 절대 금지합니다.

## 🚫 금기 사항 (Anti-Patterns)
- **임시 가짜 폴백 코드(Dummy/Mock/Fake Fallback) 사용 절대 금지 (Strict Production Integrity Enforcement)**:
  - 이 시스템은 기업에서 실제 운영(Production)되는 실무 워크스페이스 에디터 시스템입니다.
  - 에러, 경고, CORS 차단 등을 우회하거나 때우기 위해 임시 하드코딩된 더미 데이터, 가짜 껍데기 메타데이터/JSON/HTML, 임시 폴백 객체를 코드에 임의로 주입하는 행위는 실운영 데이터 덮어쓰기 및 데이터 오염/유실을 유발하므로 **100% 엄격히 금지(Strictly Prohibited)**합니다.
  - 로딩 실패나 예외 발생 시 원본 데이터의 실체(`data/p_xxxx/metadata.json` 등)를 훼손하거나 가짜 객체로 대체하지 않고, **순수 원본 데이터 읽기 및 정상적인 에러 로깅/복구 파이프라인만을 정직하게 실행**해야 합니다.
- **수동 DOM 살균 및 개별 클린업 코드 중복 작성 금지 (ScreenSanitizer SSOT 강제)**:
  - 스크린 저장, 뷰포트 스냅샷, HTML 내보내기 시 각 파일에서 수동으로 선택선/마키박스/핸들/가이드라인을 `clone.querySelectorAll` 등으로 개별 삭제하거나 빈 스타일 태그를 수동 파싱하는 코드를 작성하는 것은 엄격히 금지됩니다.
  - 반드시 [assets/vctrl_common.js](file:///c:/Users/sisun/ai_work/assets/vctrl_common.js)의 **`window.ScreenSanitizer.cleanDOM(targetDoc)`** 단일 SSOT 함수를 호출하여 깨끗한 마크업을 일원화해 추출해야 합니다.
- **Iframe 메시지 거대 `if-else` 분기문 누적 금지 (Message Registry Pattern 강제)**:
  - [assets/vctrl_iframe_script.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_script.js)의 `message` 이벤트 리스너 내부에 직접 거대한 `if-else` 분기문을 추가/누적하지 마세요.
  - 신규 iframe 메시지 핸들러는 반드시 `v4IframeCoreHandlers` 테이블 객체 또는 전역 **`window.v4MessageHandlers[type] = function(data) { ... }`**에 등록해야 하며, 파일 전체를 감싸고 있는 백틱(`` ` ``)과의 충돌을 방지하기 위해 일반 따옴표만을 사용해야 합니다.
- **컴포넌트 셀/텍스트 정렬 클릭 리스너 중복 등록 금지 (전역 위임 SSOT 강제)**:
  - 테이블 셀 정렬이나 도형 텍스트 정렬 버튼 등에 인라인 클릭 리스너를 개별적으로 중복 바인딩하지 마세요. `viewer.html` 또는 상위 컨테이너 레벨의 전역 이벤트 위임(Event Delegation)을 통해 단일 리스너로만 처리해야 이벤트 누수와 2중 실행을 원천 차단할 수 있습니다.
- **임의의 구조 변경 금지**: 사용자 승인 없이 폴더 구조나 핵심 파일명을 변경하지 마세요.
- **데이터 훼손 금지**: 각 개별 프로젝트 폴더의 `metadata.json` 등 공통 메타데이터를 임의로 삭제하거나 훼손하지 마세요.
- **코드 무결성 유지**: 부분 교체 시 앞뒤 문맥을 철저히 대조하여 `SyntaxError`를 원천 차단하세요.
- **국문 문서화**: 모든 개발 계획서와 로그는 국문 작성을 원칙으로 합니다.

## 📋 Query Item(조회 항목) 및 전용 스마트 가이드 표준 규칙
- **조회 항목(Query Item) 아톰 구조 및 표준 규격**:
  - **기본 치수 및 프레임 최적화**: 기본 너비는 **`1160px`**(반응형 PC 프레임 `.pc-content-inner` 너비와 100% 일치하여 오버플로우 방지), 기본 높이는 **`44px`**(1행 기준), 행 단위 세로 크기는 **`44px`**(엔터프라이즈 폼 표준 높이)입니다.
  - **다중 컬럼 분할 및 2컬럼 프리셋 비율 지원 (Equal & Ratio Flex Division)**: 컬럼 개수(1~4개)에 따라 기본 `flex: 1 1 0%; min-width: 0;`으로 균등 분할되며, **2개 컬럼 설정 시**에는 인스펙터에 전용 분할 비율 컨트롤러가 노출되어 **`1:1 (하프 50%:50%)`**, **`1:2 (1/3 분할 33%:67%)`**, **`2:1 (2/3 분할 67%:33%)`**, **`1:3 (1/4 분할 25%:75%)`**, **`3:1 (3/4 분할 75%:25%)`**을 자유롭게 지정할 수 있습니다. 1/3 및 2/3 분할은 3컬럼 행과, 1/4 및 3/4 분할은 4컬럼 행들과의 수직 그리드 라인 및 스마트가이드 스냅선이 100% 픽셀 퍼펙트로 일치합니다.
  - **캔버스 인라인 레이블 편집 (Direct Canvas Label Editing)**: 항목명 레이블 셀(`.v4-admin-label-cell`)에 `contenteditable="true"` 및 `v4-editable-cell` 클래스를 부여하여 사용자가 캔버스 위에서 직접 더블클릭/포커스로 라벨명을 편집할 수 있으며, `data-row{i}-label` 속성 및 우측 인스펙터 입력란과 실시간 양방향 동기화됩니다.
  - **그룹 타이틀 (Group Header)**: 인스펙터에서 그룹 타이틀(대제목) 표시 활성화(`adminShowGroupHeader: true/false`), 타이틀 텍스트, 배경색 및 글자색을 커스텀 설정할 수 있으며, 활성화 시 상단에 `40px` 높이의 헤더(`.v4-admin-group-header`, 캔버스 인라인 직접 편집 지원)가 렌더링됩니다.
  - **행 개수 및 동적 높이 계산 (최대 20개 행 지원)**:
    - 행 개수(Row Count) 조절은 인스펙터의 **`[- 행 삭제]` / `[+ 행 추가]`** 물리 버튼으로 1행에서 **최대 20행**까지 자유롭게 확장/축소할 수 있습니다.
    - **행별 세부 옵션**: 각 행마다 레이블 너비 슬라이더(60px ~ 300px, 기본 140px), 개별 행 높이(기본 44px), 컬럼 분할 수(1~4컬럼), 필수 여부(`required` 체크박스)를 독립적으로 제어할 수 있습니다.
    - 컴포넌트의 전체 높이는 **`(각 행별 높이 합산) + (그룹 타이틀 활성화 시 40px)`** 공식에 따라 실시간으로 자동 확장/축소(가변 처리)됩니다.
  - `Query Item` 아톰은 내부 조회 조건 영역(`.v4-admin-content-cell`)이 비어 있는 채로 생성되며, 사용자가 캔버스의 다른 아톰(인풋, 셀렉트박스, 데이트피커 등)을 자유롭게 끌어다 올리는 방식으로 조립합니다.
- **인스펙터 타이핑 포커스 유지 (Focus Guard)**:
  - 사용자가 항목명을 입력하는 동안에는 `updateProperties`의 `restorePropertiesSections()` 및 `floatingBody.innerHTML` 비우기 등의 DOM 탈착 작업을 건너뛰어(Focus Guard) 연속적인 타이핑 중 활성화가 풀리는 문제를 완벽하게 차단해야 합니다.
- **정밀 스마트 가이드 스냅**:
  - `Query Item` 아톰 내부의 빈 공간으로 컴포넌트를 드래그해 배치할 때, 각 행의 **세로 정중앙(Middle)** 및 항목명 테두리로부터 **가로 10px 여백 위치(Start Left + 10px)**에 다다르면 자석처럼 스냅되며 수평/수직 가이드가 노출되어야 합니다.
  - 좌표의 미세 오차와 줌 배율 간섭을 원천 배제하기 위해, 모든 스냅 타겟 생성 및 계산 시 브라우저 실제 크기 측정 대신 `style.left/top` px 수치 기반의 **Pure Data 연산(No-Measure Strategy)**을 활용합니다.
  - 캔버스의 시각적 공해를 줄이고 최적의 조작감을 보장하기 위해, 스마트 가이드 타겟의 기본 검색 반경은 **150px**로 좁히고, `Row` 및 `Col`이 붙은 가이드 타겟은 **가장 최상위 우선순위(Priority)**로 정렬하여 스냅되도록 매칭 로직을 구성합니다.
- **다중 선택 및 그룹화 규칙 (Multi-Selection & Grouping Protocol)**:
  - **그룹 내 아톰 예외 처리 (Atom Design-System Bypass)**: 그룹(`.lf-group`) 내부의 컴포넌트는 `enforceDesignSystem()` 등 실시간 디자인 강제화 보정 규칙에서 즉시 제외되어야 합니다. 특히 `closest('.lf-group')` 체크를 통해 스캔 루프를 탈출함으로써 컴포넌트 크기나 구조가 강제로 기본값(예: 버튼 80px, 아코디언 높이 등)으로 덮어씌워져 내부 텍스트 레이아웃이 쪼그라들거나 깨지는 오작동을 차단해야 합니다.
  - **그룹 리사이즈 시 비례적 크기/위치 조절 (Proportional Child Scaling)**: 그룹(`.lf-group`)을 리사이즈할 때 내부의 모든 자식 컴포넌트들의 상대 좌표(`left`, `top`)와 크기(`width`, `height`)를 비례 계산(Scale Factor)하여 실시간 동기화해야 하며, 아톰 컴포넌트의 내부 스케일 요소도 비례 갱신해야 합니다. 또한, 리사이즈 완료 시 자식 요소들에 `data-resized="true"` 플래그를 자동으로 부여하여 그룹 해제나 새로고침 후에도 크기가 무너지지 않도록 보장해야 합니다.
  - **Direct Child Selector 사용을 통한 핸들러 보호 (Direct Child Handle Isolation)**: `updateHandles`와 `initHandles` 등 드래그/리사이즈 조작 인터페이스 갱신 시 반드시 `:scope > .lf-drag-handle`, `:scope > .lf-resizer` 와 같은 직속 자식 셀렉터를 사용하여, 그룹 내부 자식 컴포넌트의 핸들과 오인되어 상위 그룹 전용 핸들이 누락되거나 소실되는 현상을 완벽하게 방지해야 합니다.
- **단일 및 다중 오브젝트 정렬 단축키 및 템플릿별 기준 규격 (Alignment Shortcuts & Container Isolation)**:
  - **단축키 바인딩**: 단일 선택(`items.length === 1`) 및 다중 선택(`items.length > 1`) 모두에서 **`Ctrl + 1 ~ 6`** 및 **`Alt + 1 ~ 6`**을 완벽 지원한다.
    - `Ctrl/Alt + 1`: 좌측 정렬 (Left)
    - `Ctrl/Alt + 2`: 수평 중앙 정렬 (Center)
    - `Ctrl/Alt + 3`: 우측 정렬 (Right)
    - `Ctrl/Alt + 4`: 상단 정렬 (Top)
    - `Ctrl/Alt + 5`: 수직 중앙 정렬 (Middle)
    - `Ctrl/Alt + 6`: 하단 정렬 (Bottom)
  - **단일 오브젝트 정렬 기준 분기**:
    - **일반 템플릿**: 전체 캔버스(`.page` / `document.body`, `1600 x 900px` 또는 해당 스크린 너비)를 기준으로 좌/우/중앙/상/하/중단 정렬.
    - **[반응형] 템플릿**: 소속된 프레임(PC `.pc-content-inner` `1160px` / Mobile `.mobile-content-inner` `360px`) 영역 내에서 독립 정렬하여 프레임 간 좌표 간섭 0%를 보장.
  - **다중 오브젝트 정렬 기준**: 선택된 오브젝트들의 전체 바운딩 박스(Bounding Box)를 기준으로 상호 상대 정렬 및 균등 분배 정렬을 수행.
  - **입력 포커스 가드 (`isInputActive`)**: 텍스트 상자, 셀 에디터, 인풋 등에서 타이핑 중일 때는 숫자 1~6 입력이 정렬 단축키로 오작동하지 않도록 철저히 가드 처리.
- **[반응형] 템플릿 실행 취소(Ctrl+Z / Undo) 스마트 인플레이스 스크롤 보존 아키텍처 (Smart In-Place Scroll Preservation Protocol)**:
  - **스크롤 컨테이너 DOM 비파괴 원칙**: 반응형 템플릿에서 Undo 실행 시 `document.body.innerHTML = ''`로 DOM 전체를 날려버리면 `.pc-content-area`와 `.mobile-content-area` 스크롤 컨테이너 DOM 자체가 소멸되어 브라우저가 스크롤을 무조건 `0px`로 리셋한다. 따라서 반드시 내부 캔버스인 `.pc-content-inner` 및 `.mobile-content-inner`의 `innerHTML`과 `minHeight`만 인플레이스(In-place)로 교체하여 스크롤 컨테이너를 100% 보존해야 한다.
  - **`scroll-behavior: smooth` 배제 원칙**: 스크롤 컨테이너에 `scroll-behavior: smooth`가 적용되어 있으면 JS의 `scrollTop = N` 좌표 복원이 비동기 애니메이션으로 지연되다 리셋될 수 있으므로, 스크롤 컨테이너는 브라우저 기본 즉시 스크롤(auto)을 유지해야 한다.
  - **실시간 스크롤 트래커 & 렌더링 프레임 지속 보정**: 조작 중 실시간 스크롤 리스너(`captureLiveScroll`)로 뷰포트 좌표를 유지하고, Undo 직후 `requestAnimationFrame` 루프를 통해 비동기 리플로우 지연에 따른 0px 클램핑을 원천 방지한다.


## 📊 Grid UI(그리드 UI) 컴포넌트 렌더링 및 스타일링 규칙
- **자식 Iframe과 부모 CSS의 격리 특성 (Iframe Sandbox Isolation)**:
  - Grid UI와 같이 iframe 내부에 렌더링되는 컴포넌트는 부모 창의 스타일시트(예: `viewer.css`)가 전혀 상속되지 않습니다.
  - 따라서 Grid table 셀(`td`, `th`)의 기본 글꼴 크기, 패밀리, 정렬 등 비주얼 테마를 설정할 때는 부모가 아닌 iframe 내부 스타일시트(`window.v4Styles` in `vctrl_iframe_script.js`)에 스타일 룰을 명시적으로 주입해야 브라우저 기본값 오작동을 차단할 수 있습니다.
- **텍스트 계열 컬럼 스타일 초기화 및 통일 (Text-like Columns Typography Unification)**:
  - 번호, 작성자, 일시, 일반 텍스트 등 텍스트 계열 컬럼(`text`, `number`, `author`, `datetime`)은 타입 변경 시 기존에 개별적으로 부여되어 있던 인라인 스타일(`color`, `font-weight`, `font-size`)을 빈 값(`""`)으로 리셋하고, 폰트 스타일의 inline 복원을 스킵하여 iframe 전용 stylesheet 규칙을 온전히 상속받게 함으로써 모든 열이 100% 동일한 폰트 규격을 유지하도록 보장해야 합니다.
  - 단, 체크박스(`checkbox`) 및 상태 배지(`status`)는 각각의 고유 비주얼 테마와 스팬 스타일을 렌더링하고 스타일 복원을 허용합니다.
- **테이블 높이 및 푸터 여백 보정 (Table Height & Footer Offset)**:
  - Grid UI 하단에 원인 모를 36px 여백이 발생하거나 마지막 로우가 잘리는 현상을 차단하기 위해, 푸터가 활성화(`showPagination === true`)되어 있을 때의 테이블 영역 높이는 `calc(100% - 36px)`로 정확히 지정하고, 푸터가 꺼져 있을 때는 `100%`를 온전히 사용해야 합니다. (이전의 `-72px` 및 `-36px` 보정치는 36px 여백을 발생시키는 버그이므로 절대 금지합니다.)
- **최상단 헤더 로우 스타일 보존 (Header Row Background Preservation)**:
  - partial update 시점에 최상단 헤더 로우(`thead tr`)의 배경을 강제로 `#ffffff`로 덮어쓰는 코드는 사용자가 작성해 둔 커스텀 헤더 배경 스타일을 파괴하므로 절대 배제해야 하며, 원래의 스타일을 그대로 유지하도록 보호해야 합니다.
- **복합 테이블/그리드 스마트 가이드 이원화 아키텍처 (Row Container vs Cell Sibling Raycast)**:
  - **행(Row)과 셀(Cell)의 역할 분리**: Grid UI(`table tr`) 및 Query Item(`.v4-admin-row`)처럼 2차원 표 구조를 가진 컴포넌트 위로 다른 오브젝트를 배치할 때, 행(`tr`)은 가상 행 컨테이너(`isRowContainer: true`)로, 각 셀(`td`, `th`)은 열 구분선 타겟(`isGridCell: true`)으로 엄격히 역할을 이원화해야 합니다.
  - **컨테이너 인클로저 셀 제외 원칙 (`if (t.isGridCell) continue;`)**: 컨테이너 탐색 루프(`calculateSpacing`)에서 셀이 직속 컨테이너로 잘못 잡히면 행(`isRowContainer`) 우선순위가 무너져 상/하 레이캐스트가 외부로 튀는 버그가 발생합니다. 따라서 셀은 컨테이너 후보에서 배제하여 **컨테이너는 무조건 행(Row)으로만 잡히도록 강제**하고, 셀들은 동일 행 내부의 수평 레이캐스트(열 구분선 거리 측정) 전용 타겟으로만 동작하게 해야 합니다.
  - **중첩 테이블 픽셀 퍼펙트 오프셋 계산 (`getBoundingClientRect` 상대차)**: `tr` 및 `td`는 `wrapper > table > tbody`로 다중 중첩되어 단순 `offsetLeft/offsetTop` 누적 시 1.6px 테두리 두께, 헤더 높이, `overflow: auto` 스크롤 등에 의해 좌표 오차가 발생합니다. 타겟 좌표 수집 시 반드시 부모 컴포넌트와 타겟 요소의 `getBoundingClientRect()` 간 상대차(`parentLeft + (cellRect.left - compRect.left)`)를 연산하거나 `getPureOffset`을 사용하여 100% 픽셀 퍼펙트 정합성을 보장해야 합니다.
  - **컴포넌트 자체 이동 시 내부 타겟 자동 격리**: Grid UI 또는 Query Item 컴포넌트 전체를 선택하여 드래그할 때는 `activeEl.contains(c)` 가드를 통해 내부의 행/셀들이 타겟에서 100% 자동 스킵되도록 하여, 내부 가이드선 간섭 없이 캔버스 및 외부 형제 요소들과만 깔끔하게 가이드가 잡히도록 해야 합니다.

## 📱 반응형(PC & Mobile) 템플릿 스마트 가이드 및 키보드 이동 표준 규칙
- **프레임 4방향 테두리(Wall) 픽셀 거리 정밀 측정**:
  - `vctrl_responsive_smartguide.js`는 반응형 컨테이너(`.pc-content-inner`, `.mobile-content-inner`) 내 오브젝트 이동 시 상/하/좌/우 4방향 테두리(`wall-left`, `wall-right`, `wall-top`, `wall-bottom`)와의 물리적 거리를 픽셀 단위로 정밀 측정하여 실시간 핑크 뱃지 및 가이드선을 표시합니다.
- **광범위 간격(Spacing) 탐지**:
  - 오브젝트 간 사이 간격을 200px 이상 광범위하게 탐지하여 실무 레이아웃 간격을 완벽히 지원하며, X/Y축 투영 겹침을 유연하게 처리합니다.
- **동기식 키보드 이동(Nudge) 파이프라인**:
  - `vctrl_shortcuts.js`에서 화살표 키(`ArrowUp/Down/Left/Right`, `Shift + Arrow`)로 오브젝트를 이동할 때 `window.ResponsiveSmartGuide.onNudge(activeEl)`를 동기 호출하여 1프레임의 지연 없이 즉각적으로 테두리 및 오브젝트 거리 뱃지를 렌더링하고, `keyup` 시 부드럽게 소멸시킵니다.

## 🌊 WAVE 도형 가로/세로 방향 지원 표준 규칙 (Wave Shape Horizontal & Vertical Protocol)
- **가로/세로 방향성 전환 지원**:
  - WAVE 도형은 가로 방향(`.v4-shape-wave`) 및 세로 방향(`.v4-shape-wave-vertical`)을 모두 지원합니다.
  - 세로 웨이브는 Y축을 따라 사인 곡선(Sine curve) 형태의 부드러운 물결을 그리며, 프로세스 다이어그램이나 타임라인 분할선으로 활용됩니다.
  - 인스펙터(`#inspector-shapes.js`)에서 가로/세로 방향 전환 토글 및 진폭/주기 파라미터를 제어할 수 있으며, 1.6px 보더 두께와 배경색 투명도(`rgba`) 연동 규칙을 완벽히 보존해야 합니다.

## 💡 Grid UI 컬럼 강조 표준 규칙 (Grid Column Highlight Protocol)
- **동적 컬럼 하이라이트 메시지 (`LF_SET_GRID_COLUMN_HIGHLIGHT`)**:
  - 특정 컬럼(열)의 데이터나 상태를 부각하기 위해 `colIndex` 기준 전용 하이라이트 클래스(`.highlight-col`) 및 인라인 배경/보더 스타일 주입을 지원합니다.
  - 부분 갱신(Partial update)이나 리렌더링 시에도 하이라이트 상태가 유실되지 않도록 `table` DOM의 `data-highlight-col` 속성에 SSOT로 저장되어 새로고침 후에도 100% 복구되어야 합니다.



