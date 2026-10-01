---
name: workspace-editor-system-diagnosis
description: Use when the user requests "시스템 전체 정밀 진단" (System-wide Deep Inspection). Mandates a full-file census across all JS, CSS, HTML, templates, scripts, and metadata, analyzing 6 core criteria: heavy file split, dead code deletion, logic commonization, high-complexity fragmentation, rules/skills update sync, and general architectural improvements.
---

# Workspace Editor System-Wide Deep Diagnosis (시스템 전체 정밀 진단)

## 📌 프로토콜 개요 (Protocol Overview)
사용자가 **"시스템 전체 정밀 진단"**을 요청했을 때는 단순 표면적인 코드 확인에 그치지 않고, 워크스페이스 내 모든 소스 파일(JS, CSS, HTML, 템플릿, 스크립트, 메타데이터 등)을 **전수 조사(Full-File Census)**하여 아래 6대 조치 필요 항목을 심층 분석하고 명확한 결과와 개선안을 도출해야 합니다.

---

## 🔍 6대 필수 점검 및 분석 기준 (6 Core Diagnosis Criteria)

### 1. 파일이 너무 무거워서 파일 분리 처리 (신규 파일 생성)
- **점검 기준**:
  - 단일 파일 용량이 **35KB 이상**이거나 라인 수가 **750라인 이상**인 파일.
  - 하나의 모듈 내에 서로 다른 도메인 책임(예: UI 렌더링 + 상태 관리 + 이벤트 리스너 + 비즈니스 로직 등)이 결합된 파일.
  - 대용량 인라인 템플릿, SVG 에셋, 데이터 카탈로그가 단일 소스에 직접 임베딩된 파일.
- **분석 및 조치 방안**:
  - 파일의 역할과 기능을 명확한 단일 책임(Single Responsibility) 원칙에 따라 분리.
  - 신규 독립 모듈(신규 파일)을 생성하여 관심사를 격리하고, 부모 창(`viewer.html`) 또는 Iframe 주입 파이프라인(`ENGINE_SCRIPT_REGISTRY`)에 정규 등록.

### 2. 사용하지 않는 불필요한 소스가 존재할 경우 삭제 (Dead Code & Orphan Source)
- **점검 기준**:
  - `viewer.html` 및 `index.html` 어디에서도 `<script>`로 로드되지 않고, `ENGINE_SCRIPT_REGISTRY`에도 등록되지 않은 고아 파일(Orphan files).
  - 다른 어떤 파일에서도 import/호출/참조되지 않는 레거시 함수, 미사용 전역 변수, 장기간 주석 처리된 대규모 코드 블록.
  - 이미 타 모듈로 기능이 분리 이관되었음에도 불구하고 과거 잔재로 남아있는 무효 프록시/더미 코드.
- **분석 및 조치 방안**:
  - 시스템 참조 무결성을 전수 확인 후, 미참조 고아 파일이나 데드 코드를 안전하게 삭제하여 코드베이스 경량화.

### 3. 동일한 코드가 여러곳에서 개별적으로 쓰이고 있어서 공통화가 필요한 경우 조치 (Logic Commonization)
- **점검 기준**:
  - 서로 다른 2개 이상의 파일에 완전히 동일하거나 유사한 유틸리티 함수(예: 클립보드 복사, 색상 변환/피커 제어, 팝업/로딩 모달 제어, 반응형 화면 판별식 등)가 각각 복사-붙여넣기되어 있는 경우.
  - 부모 창과 Iframe 양쪽에서 동일한 DOM 정제/살균 로직을 개별 구현하여 SSOT 원칙을 위반한 경우.
- **분석 및 조치 방안**:
  - 공통 유틸리티의 단일 진실 공급원(SSOT) 모듈(예: `assets/vctrl_common.js`, `assets/vctrl_clipboard.js`, `assets/vctrl_system_modals.js` 등)로 일원화하고, 각 파일에서는 해당 공통 모듈을 참조하도록 위임 리팩토링.

### 4. 코드의 복잡도가 너무 높아서 파편화해야 하는 경우 조치 (Complexity Fragmentation)
- **점검 기준**:
  - 단일 함수의 길이가 **150라인 이상**이거나, 중첩 분기문(`if-else`, `switch-case`, 삼항 연산자) 깊이가 지나치게 깊은 거대 함수.
  - 단일 이벤트 리스너(예: `updateProperties`, `LF_UPDATE_STYLE`, `init`) 내에서 수십 가지 컴포넌트 타입(도형, 텍스트, 아톰, 테이블, 그리드 등)의 스타일과 DOM을 한 번에 제어하는 모놀리식 구조.
- **분석 및 조치 방안**:
  - 전략 패턴(Strategy Pattern) 또는 디스패처 맵(Handler Map)을 적용하여 컴포넌트별/도메인별 순수 핸들러 함수로 잘게 파편화.
  - 가독성을 높이고 회귀(Regression) 사이드이펙트를 원천 차단.

### 5. 시스템에 변경된 사항이 룰과 스킬에 업데이트 되어야 하는 경우 조치 (Rules & Skills Sync)
- **점검 기준**:
  - `assets/` 및 `assets/inspector/`에 실제로 추가/존재하는 핵심 모듈이 `AGENTS.md`의 `모듈러 아키텍처` 정의 목록에 누락되어 있는 경우.
  - 최근 신규 개발되거나 개선된 기능(예: WAVE 도형 세로 방향 지원, 그리드 컬럼 하이라이트, 테이블 요소 이동 제어, 화면 삭제 방어 등)의 핵심 명세와 통신 프로토콜이 룰 문서 및 연관 스킬(`SKILL.md`)에 반영되지 않은 경우.
- **분석 및 조치 방안**:
  - `AGENTS.md` 및 해당 도메인 `SKILL.md`를 즉시 갱신하여 문서와 실제 시스템 소스코드 간의 100% 동기화 달성.

### 6. 그 외에도 점검 과정에서 발견되는 개선사항들 조치 (General Improvements)
- **점검 기준**:
  - **오프라인 템플릿 번들 최신성**: `assets/templates/*.html` 또는 `assets/ui_library/*.html` 수정 후 컴파일 번들(`templates.js`, `ui_library_fallback.js`)이 최신 상태로 재빌드되었는지 여부.
  - **V8 구문 및 브래킷 무결성**: 런타임 `SyntaxError`나 괄호 불일치 여부.
  - **메모리 누수 및 옵저버 무한 루프 위험**: MutationObserver 값 비교 가드 및 전역 이벤트 리스너 중복 바인딩 여부.
  - **백틱 충돌 방지**: Iframe 주입 파일 내 템플릿 리터럴 백틱 충돌 위험 여부.
- **분석 및 조치 방안**:
  - 번들 빌드 스크립트(`scripts/build_templates.ps1`, `scripts/build_ui_fallback.ps1`) 즉각 실행 및 코드 가드 보강.

---

## 🛠️ 진단 실행 도구 및 워크플로우 (Execution Workflow)
1. **진단 도구 자동 구동**:
   - `powershell -ExecutionPolicy Bypass -File scripts/diagnose_system.ps1` 구동.
   - 내부적으로 Node.js 기반 `scripts/diagnose_deep_inspection.js`가 호출되어 6대 항목을 전수 스캔.
2. **정량적 데이터 수집**:
   - 파일별 KB 용량, 라인 수, 중복 함수 위치, 거대 함수 라인 번호, 누락된 룰 목록을 수치 기반으로 정확히 추출.
3. **분석 보고서 도출**:
   - 6대 항목별 발견 사항과 개선 권고사항, 단계별 실행 계획을 구조화하여 사용자에게 보고.
4. **승인 후 안전한 단계별 리팩토링 진행**:
   - 대규모 파일 분리 및 공통화 작업 시 `workspace-editor-safety-process` 스킬에 따라 사전 계획 수립 후 진행.
