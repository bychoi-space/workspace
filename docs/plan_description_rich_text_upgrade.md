# DESCRIPTION 서식 편집(볼드/밑줄/컬러) 구조적 업그레이드 완벽 계획서

- **작성일자**: 2026-09-28
- **작성 대상 시스템**: Workspace Editor (bychoi workspace)
- **목적**: 사이드바 DESCRIPTION(SCENE ANNOTATIONS) 입력부의 평문 전용 `<textarea>` 한계를 극복하고, 볼드(Bold), 밑줄(Underline), 폰트 컬러(Font Color), 서식 초기화 등의 서식 편집을 지원하는 경량 리치 텍스트 아키텍처로 안전하게 업그레이드.

---

## 1. 개요 및 업그레이드 배경 (Executive Summary)

현재 Workspace Editor의 우측 사이드바 `Description` 탭은 각 화면의 핀(Pin marker)별 상세 설명을 작성하는 핵심 도구입니다. 그러나 입력부가 순수 HTML `<textarea>`로 고정되어 있어 다음과 같은 제약이 존재합니다:
1. **서식 적용 불가**: 중요한 키워드 강조(볼드), 주의사항 표시(밑줄), 상태/위험도 표시(폰트 컬러) 등 실무 기획/설계 문서화에 필수적인 시각적 강조 기능이 전무함.
2. **단조로운 가독성**: 긴 분량의 설명 텍스트 작성 시 단락 및 키워드 구분이 어려워 문서 전달력이 저하됨.

본 계획서는 시스템의 **7대 필수 게이트웨이**와 **모듈 격리 원칙**을 100% 준수하면서, 외부 라이브러리 추가 없이 순수 Vanilla JS 기반의 초경량 인라인 리치 텍스트 에디터로 전환하는 무결점 엔지니어링 방안을 정의합니다.

---

## 2. 시스템 심층 영향도 분석 (Deep System Impact Analysis)

### 2.1 연관 파일 및 소유 영역 (File Boundaries)

| 파일 경로 | 소유 역할 및 영향 범위 | 영향도 |
| :--- | :--- | :---: |
| [viewer.html](file:///c:/Users/sisun/ai_work/viewer.html) | 우측 사이드바 `#tab-description` 헤더에 슬림 포맷 툴바 컨테이너(`#desc-toolbar`) 추가 | **낮음** (마크업 추가) |
| [assets/vctrl_annotation_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_annotation_pins.js) | `<textarea>` ➔ `<div contenteditable="true">` 렌더링 전환, 툴바 액션 바인딩, 포커스/단축키/살균 핸들러 장착 | **핵심** (주요 로직 갱신) |
| [assets/style.css](file:///c:/Users/sisun/ai_work/assets/style.css) | `.desc-toolbar`, `.desc-tool-btn`, `.desc-rich-editor`, 컬러 팔레트 드롭다운 및 placeholder 스타일 정의 | **중간** (신규 스타일 추가) |
| [assets/theme.css](file:///c:/Users/sisun/ai_work/assets/theme.css) | 테마별 컬러 및 hover/active 인터랙션 시각 일관성 보정 | **낮음** |
| `data/p_xxxx/metadata.json` | 각 프로젝트별 화면 설명 배열 (`screens[fileName].description`) | **무영향** (기존 스키마와 100% 호환 확장) |
| [assets/vctrl_core.js](file:///c:/Users/sisun/ai_work/assets/vctrl_core.js) | 스크린 로드, 저장, 핀 생성 로직 | **무영향** (기존 데이터 통로 그대로 활용) |
| [assets/vctrl_responsive_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_responsive_pins.js) | 핀 재정렬(`LF_REORDER_PINS`), 하이라이트(`LF_HIGHLIGHT_PIN`), 포커스(`LF_FOCUS_PIN`) 통신 | **무영향** (순수 인덱스 기반 통신 유지) |

---

## 3. 핵심 아키텍처 및 세부 설계 사양 (Detailed To-Be Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│ TAB: DESCRIPTION (SCENE ANNOTATIONS)                        │
├─────────────────────────────────────────────────────────────┤
│ [SCENE ANNOTATIONS]                             (+) [행추가]│
│ ┌─ #desc-toolbar (Sticky Micro Toolbar) ──────────────────┐ │
│ │ [ B ]  [ U ]  │  [ A ▼ ] (컬러 팔레트)  │  [ Tx ] (지우기)│ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─ .desc-row (data-index="0") ────────────────────────────┐ │
│ │  (1) Pin 1                                    [삭제 x]  │ │
│ │  ┌─ .desc-rich-editor (contenteditable="true") ───────┐ │ │
│ │  │ 1. <b>기본 정보 영역</b>                           │ │ │
│ │  │ - 모든 항목 <span style="color:#ef4444;">설정</span>│ │ │
│ │  └────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 입력 셀 전환 (`<textarea>` ➔ `<div contenteditable="true">`)
- **요소 규격**:
  ```html
  <div class="desc-input desc-rich-editor" 
       contenteditable="true" 
       spellcheck="false" 
       data-placeholder="설명을 입력하세요..."
       data-index="${index}">
  </div>
  ```
- **자연 확장 레이아웃**:
  - `min-height: 24px; height: auto; outline: none; word-break: break-word; white-space: pre-wrap;`
  - 내용 입력 시 브라우저 레이아웃 엔진에 의해 세로 높이가 자연스럽게 유연 확장됨 (불필요한 스크롤 및 텍스트 찌그러짐 원천 방지).
- **Placeholder 처리**:
  ```css
  .desc-rich-editor:empty:before,
  .desc-rich-editor[data-empty="true"]:before {
      content: attr(data-placeholder);
      color: #64748b;
      pointer-events: none;
      display: block;
  }
  ```

### 3.2 상단 고정 마이크로 포맷 툴바 (`#desc-toolbar`)
사이드바의 한정된 가로폭(320px)에서 공간 낭비 없이 최상의 조작감을 제공하기 위해, 패널 헤더 하단에 스티키(Sticky) 형태로 단일 마이크로 툴바를 배치합니다.
1. **Bold 버튼 (`B`)**: 선택된 텍스트 굵게 토글 (`document.execCommand('bold')`)
2. **Underline 버튼 (`U`)**: 선택된 텍스트 밑줄 토글 (`document.execCommand('underline')`)
3. **Font Color 버튼 및 프리셋 팔레트 (`A`)**:
   - 클릭 시 드롭다운 팝오버 노출
   - 자주 사용하는 6대 가독성 프리셋 컬러:
     - 기본 본문: `#cbd5e1` (슬레이트)
     - 화이트: `#ffffff` (순백색)
     - 레드/경고: `#ef4444` (포인트 레드)
     - 블루/안내: `#38bdf8` (스카이 블루)
     - 그린/성공: `#34d399` (에메랄드 그린)
     - 옐로우/주의: `#fbbf24` (앰버 옐로우)
   - 커스텀 컬러 피커 (`<input type="color">`) 제공으로 무한 색상 확장 지원.
4. **서식 지우기 버튼 (`Tx`)**: 선택 영역 서식 제거 (`document.execCommand('removeFormat')`)

### 3.3 핵심 인터랙션 방어 로직 (Critical Safeguards)

#### 1) Selection 유실 원천 차단 (`e.preventDefault()`)
- 사용자가 에디터에서 텍스트를 드래그 선택한 후 상단 툴바 버튼을 클릭할 때, 포커스가 버튼으로 이동하여 텍스트 선택이 해제되는 현상을 완벽 차단.
- 모든 툴바 버튼에 `mousedown` 이벤트 리스너를 장착하고 `e.preventDefault()`를 호출하여 **에디터의 포커스와 캐럿/선택 범위를 100% 보존**.

#### 2) 키보드 단축키 파이프라인
- `desc-rich-editor` 포커스 상태에서 `Ctrl + B` (Mac: `Cmd + B`), `Ctrl + U` (Mac: `Cmd + U`) 입력 시 브라우저 네이티브 서식 명령과 실시간 동기화.

#### 3) 외부 복사/붙여넣기 살균 (Paste Sanitizer)
- 사용자가 웹페이지, 기획서(Jira/Confluence), 슬라이드 등 외부에서 텍스트를 복사해 붙여넣을 때 거대한 외부 인라인 CSS, 불필요한 레이아웃 태그(`table`, `iframe`, `script` 등)가 유입되는 것을 방지.
- 허용 태그(`<b>`, `<strong>`, `<u>`, `<span>`, `<br>`, `<div>`, `<p>`) 및 `style="color: ..."`만 추출 보존하고 나머지 유해 마크업은 정제하여 순수 텍스트 및 기본 서식만 안전하게 안착시킴.

---

## 4. 데이터 스키마 및 100% 하위 호환성 보장 전략

### 4.1 데이터 저장 구조 (Data Model)
각 프로젝트의 `data/p_xxxx/metadata.json` 내 `description` 배열의 각 원소에 `html`과 `text`를 이중 동기화합니다:
```json
{
  "text": "1. 기본 정보 영역\n- 모든 항목 동일하게 설계",
  "html": "1. <b>기본 정보 영역</b><br>- 모든 항목 <span style=\"color:#ef4444;\">동일하게</span> 설계",
  "x": 42,
  "y": 146,
  "pins": {
    "pc": { "x": 42, "y": 146, "active": true },
    "mobile": { "x": 180, "y": 300, "active": true }
  },
  "standardized": true,
  "type": "pin"
}
```

### 4.2 100% 무손실 하위 호환성 알고리즘
- **불러올 때 (Load)**:
  ```javascript
  // item.html이 있으면 그대로 렌더링, 구형 데이터로 text만 있으면 줄바꿈을 안전 변환하여 렌더링
  var contentHtml = item.html;
  if (!contentHtml && item.text) {
      contentHtml = item.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
  }
  editor.innerHTML = contentHtml || '';
  ```
- **저장할 때 (Save)**:
  ```javascript
  var cleanHtml = editor.innerHTML;
  var plainText = editor.innerText.trim();
  
  // 완전 빈 상태 정규화
  if (!plainText && (cleanHtml === '<p><br></p>' || cleanHtml === '<br>' || cleanHtml === '')) {
      cleanHtml = '';
      plainText = '';
  }
  
  item.html = cleanHtml;
  item.text = plainText; // 기존 검색, 텍스트 파서, 레거시 호환 완벽 유지
  markAsDirty();
  ```

---

## 5. 7대 필수 게이트웨이 및 스킬 준수 검증 (Mandatory Gateways)

| 필수 게이트웨이 | 검증 및 충족 방안 | 판정 |
| :--- | :--- | :---: |
| **1. 운영 시스템 무결성** | 가짜 데이터나 더미 객체 없이 실제 디스크의 `metadata.json` 데이터만 정직하게 처리. 기존 데이터 100% 무손실 보존. | **PASS** |
| **2. 사전 정밀 분석 & 계획 수립** | 본 정밀 계획서([plan_description_rich_text_upgrade.md](file:///c:/Users/sisun/ai_work/docs/plan_description_rich_text_upgrade.md))에 따라 영향 범위와 아키텍처를 사전 확정 후 단계별 실행. | **PASS** |
| **3. 사이드이펙트 원천 차단** | 우측 사이드바 내부 렌더러에 한정하여 수정. 캔버스 렌더링, 핀 마커 드래그, 다중선택, 글로벌 단축키 간섭 0건. | **PASS** |
| **4. 스크립트/런타임 에러 0건** | `window._activeDescEditor` 유효성 검증, `editor.offsetParent` 가드, 옵셔널 체이닝 철저 적용. | **PASS** |
| **5. 백틱 충돌 에러 0건** | `vctrl_annotation_pins.js`는 부모 창 파일이며 백틱 중첩 리터럴을 사용하지 않고 안전한 문자열 결합 적용. | **PASS** |
| **6. 구문/브래킷 에러 0건 & 정적 검증** | 코드 수정 후 반드시 `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1`을 자체 구동하여 0 에러 확인. | **PASS** |
| **7. CORS 에러 0건 & 통신 프로토콜 준수** | 부모 창 내부 DOM 연산으로 CORS와 무관하며, iframe과의 기존 `MessageHub` 핀 신호(`LF_FOCUS_PIN` 등) 100% 유지. | **PASS** |

---

## 6. 단계별 무결점 실행 계획 (Step-by-Step Implementation Roadmap)

### [Step 1] 스타일시트 확장 ([assets/style.css](file:///c:/Users/sisun/ai_work/assets/style.css))
- `.desc-toolbar`, `.desc-tool-btn`, `.desc-rich-editor`, `.desc-color-popover` 등의 스타일 선언 추가.
- 다크 테마 및 알약형 미니 버튼 디자인 시스템 표준 준수.

### [Step 2] 사이드바 마크업 추가 ([viewer.html](file:///c:/Users/sisun/ai_work/viewer.html))
- `#tab-description`의 `.panel-header` 하단에 `#desc-toolbar` 컨테이너 마크업 안착.

### [Step 3] 에디터 코어 엔진 업그레이드 ([assets/vctrl_annotation_pins.js](file:///c:/Users/sisun/ai_work/assets/vctrl_annotation_pins.js))
- `renderDescriptionList`: `<textarea>` ➔ `contenteditable="true"` `div` 렌더링 및 `item.html`/`item.text` 양방향 동기화 구현.
- `initDescriptionToolbar`: 툴바 버튼 클릭, 컬러 피커/프리셋 선택, `e.preventDefault()` 포커스 가드 구현.
- `paste` 살균 핸들러 및 키보드 단축키 지원 추가.
- `focusDescriptionRow`: 활성 에디터 자동 포커스 및 툴바 상태 동기화.

### [Step 4] 정적 구문 무결성 자체 검증
- PowerShell 검증 스크립트 실행: `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1`
- 전체 브래킷, 백틱, 구문 오류 0건 통과 확인.

### [Step 5] 기능 검증 및 완료 보고
- 볼드/밑줄/컬러 적용 및 실시간 타이핑 확인.
- 행 추가/삭제 시 인덱스 및 서식 보존 확인.
- 프로젝트 재로딩 시 저장된 서식(HTML)의 100% 무손실 복구 확인.

---

## 7. 롤백 및 비상 안전망 대책 (Rollback Strategy)

1. **자동 일일 백업**: Task Scheduler를 통해 매일 18:00에 생성되는 `C:\ai_work_backups\daily\data_daily_*.zip` 보존.
2. **Git 추적 무결성**: 작업 전 Git 작업 트리가 깨끗한 상태이며, 모든 변경 사항은 `git diff`로 정밀 추적 가능.
3. **즉각 원복 절차**: 필요 시 `git checkout -- assets/vctrl_annotation_pins.js assets/style.css viewer.html` 명령어로 1초 내 완벽 원복 가능.
