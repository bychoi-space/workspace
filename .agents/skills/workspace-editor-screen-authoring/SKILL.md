---
name: workspace-editor-screen-authoring
description: Use when the user asks AI to create, draw, generate, design, or compose a screen (HTML), process slide, benchmark report, or policy diagram in Workspace Editor, or when updating screen layout, content, and data. Enforces fact-based data, library-only standard objects, atomic element separation, minimum 12px font size, concise layout, restrained color palette, and mandatory automated GitHub deployment upon screen creation or update.
---

# Workspace Editor Screen Authoring Standards (AI 직접 스크린 제작 대원칙)

에이전트(AI)가 사용자 요청에 따라 워크스페이스 에디터의 스크린(HTML 파일)을 직접 그리거나 구성할 때 **예외 없이 100% 엄격히 준수해야 하는 필수 기준**입니다.

> [!IMPORTANT]
> **표준 벤치마크 및 레퍼런스 스크린 (SSOT Reference Screens)**:
> 1. [10_Product_Ranking_Rules_850.html](file:///c:/Users/sisun/ai_work/data/p_lus0e/10_Product_Ranking_Rules_850.html) (`project=p_lus0e&file=10_Product_Ranking_Rules_850.html`): 상품 랭킹 산정 룰 캔버스
> 2. [01_Benchmark_Report_382.html](file:///c:/Users/sisun/ai_work/data/p_bujl8/01_Benchmark_Report_382.html) (`project=p_bujl8&file=01_Benchmark_Report_382.html`): 이커머스 주문서 최대 할인 벤치마크 리포트

---

## 🏛️ 스크린 제작 7대 절대 규칙 (Strict Core Rules)

### 1. 무조건 사실 기반 데이터 전용 (Fact-Based Data Only)
- **가짜 데이터 및 상상 수치 원천 배제**: 사용자가 제공한 기획서, 회의록, 벤치마크 팩트, 실제 서비스 정책/수치 데이터만을 근거로 화면을 구성합니다.
- **AI 추정/환각 금지**: 모르는 수치나 정책을 임의로 상상하여 채워 넣지 않으며, 불확실한 수치는 상상 대신 기획서에 명시된 사실 범위 내에서만 정직하게 표현합니다.
- **실제 기업명 및 정책 반영**: 벤치마크 리포트 시 실제 서비스명(예: SSF SHOP, LFmall, SI VILLAGE, 무신사 등)과 확인된 기능 현황을 정확히 기재합니다.

### 2. LIBRARY 표준 오브젝트 100% 활용 (Native Library Objects Only)
- 스크린 내 존재하는 모든 시각 요소는 에디터 우측 사이드바 **`LIBRARY`에 존재하는 정식 3계층 표준 오브젝트**만을 조합하여 생성해야 합니다.
  - **기본 오브젝트 구조**: `.lf-component` (최외곽 래퍼, `position: absolute; box-sizing: border-box;`)
  - **도형 (Shapes)**: `.v4-shape.v4-shape-rect` (또는 `v4-shape-circle`, `v4-shape-diamond` 등) ➔ `.v4-shape-text-content`
  - **텍스트 (Text Shape)**: `.lf-component.v4-text-shape` ➔ `.v4-editable-cell[contenteditable="true"]`
  - **아이콘 (Icons / Atoms)**: SVG 내 `.lf-icon` 필수 포함, `stroke-width="1.2"` (또는 `1.6`), `fill="none"`
  - **뱃지/태그 (Badges)**: 콤팩트한 직사각형 도형 래퍼 + `.v4-shape-text-content`
- **임의의 비표준 태그 금지**: 에디터 시스템 엔진이 인식할 수 없는 임의의 커스텀 태그나 비표준 클래스를 남발하여 인스펙터 선택/편집이 마비되는 현상을 차단합니다.

### 3. 최소 단위 원자적 분리 및 파편화 (Atomic Granularity & Element Separation)
- **목적**: 스크린 제작 후 **사용자가 캔버스에서 각 요소를 마우스로 직접 클릭하여 손쉽게 내용 수정, 수치 변경, 위치 이동, 색상 조정을 할 수 있도록 보장**하기 위함입니다.
- **단일 복합 카드 금지**: 하나의 카드 컨테이너 안에 배경, 아이콘, 뱃지, 제목, 본문 텍스트를 하나의 거대 HTML 블록으로 합쳐 넣는 행위를 **엄격히 금지**합니다. (그렇게 작성하면 인스펙터/Quill에서 한 글자만 수정해도 주변 아이콘과 레이아웃이 파괴됩니다.)
- **원자적 분리 필수 구조 (예: 1개 카드 섹션 구성 시)**:
  1. **카드 배경 쉐입**: `<div id="card_bg" class="lf-component" ...><div class="v4-shape v4-shape-rect" ...></div></div>`
  2. **카드 아이콘 아톰**: `<div id="card_icon" class="lf-component" ...><svg class="lf-icon" ...></svg></div>`
  3. **카드 제목 텍스트**: `<div id="card_title" class="lf-component v4-text-shape" ...><div class="v4-editable-cell" contenteditable="true" ...></div></div>`
  4. **카드 상태 뱃지**: `<div id="card_badge" class="lf-component" ...><div class="v4-shape v4-shape-rect" ...></div></div>`
  5. **카드 본문/설명 텍스트**: `<div id="card_desc" class="lf-component v4-text-shape" ...><div class="v4-editable-cell" contenteditable="true" ...></div></div>`
- 모든 원자적 요소는 독립적인 `id`, 고유의 `position: absolute; top: ...; left: ...; width: ...; height: ...;` 좌표를 갖고 개별 선택 가능해야 합니다.

### 4. 텍스트 폰트 크기 최소 12px 이상 (Min Font-Size >= 12px)
- **가독성 저하 차단**: **`12px` 미만의 폰트 크기(예: 10px, 11px, 11.5px 등)는 화면 가독성을 심각하게 해치므로 사용을 전면 금지**합니다.
- **권장 폰트 스케일**:
  - **대분류 메인 타이틀**: `18px` ~ `20px` (굵기: `800` / `900`)
  - **섹션 헤더 / 카드 제목**: `15px` ~ `16px` (굵기: `700` / `800`)
  - **본문 / 주요 설명**: `13.5px` ~ `14.5px` (굵기: `500` / `600`)
  - **보조 설명 / 서브 텍스트**: `13px` (굵기: `400` / `500`)
  - **최소 단위 (뱃지, 태그, 각주, 캡션)**: **정확히 `12px`** (절대 12px 밑으로 내려가지 않음)
- 모든 텍스트 영역에는 줄바꿈 방지가 필요한 경우 `white-space: nowrap !important;`를 부여하고, 다국어 및 한글 단어 끊김 방지를 위해 `word-break: keep-all;`을 필수로 적용합니다.

### 5. 간결하고 정돈된 레이아웃 (Clutter-Free & No Redundancy)
- **군더더기 배제**: 장황하고 불필요한 미사여구나 서술형 장문을 지양하고, **핵심 키워드, 명확한 불릿 포인트, 구조화된 인포그래픽** 위주로 컴팩트하게 정돈합니다.
- **중복 내용 제거**: 섹션 간 내용 중복이나 유사 문구 반복을 철저히 배제합니다.
- **1600x900 캔버스 스크롤-프리 (Scroll-Free)**:
  - 캔버스는 기본 **`width: 1600px; height: 900px;`** 규격을 준수합니다.
  - 상단 헤더(Top: 20px, H: 50~60px) ➔ 본문 섹션(3~4개 논리적 블록)으로 위계를 세워, **브라우저 스크롤 없이 한 화면에 핵심 가치가 한눈에 완벽히 전달**되도록 여백(Breathing Room)을 유지합니다.

### 6. 절제된 컬러 및 포인트 강조 (Restrained Color Palette)
- **무지개색 남발 금지**: 색상을 너무 난잡하게 여러 가지 섞어 쓰지 않습니다.
- **기본 뉴트럴 톤 (베이스)**:
  - 캔버스 배경: `#f8fafc` (부드러운 오프화이트/슬레이트 50)
  - 카드/컨테이너 배경: `#ffffff` (순백색) 또는 `#f1f5f9` (슬레이트 100)
  - 테두리 보더: `1.6px solid #e2e8f0` 또는 `#cbd5e1` (슬레이트 200/300)
  - 본문 글자색: `#0f172a` (슬레이트 900) 또는 `#334155` (슬레이트 700)
- **헤더 다크 엑센트 (상단 통일)**:
  - 글로벌 헤더 배경: `#0f172a` (다크 네이비), 테두리 `#1e293b`, 텍스트 화이트 `#ffffff`
- **전략적 포인트 컬러 (매우 중요한 강조 영역에만 한정 사용)**:
  - **신뢰/1위/주요 가치 (Primary)**: `#2563eb` (로열 블루) 또는 `#1d4ed8`
  - **스마트/안내/헤더 뱃지 (Sky/Teal)**: `#38bdf8` (스카이) / `#0d9488` (틸)
  - **성공/자동적용/승인 (Success)**: `#15803d` (그린), 연한 배경 `#dcfce7`
  - **주의/경고/핵심 수치 (Alert/Accent)**: `#e11d48` (로즈 레드), 연한 배경 `#fee2e2`
- 전체 스크린에서 주도적인 포인트 색상은 1~2개로 제한하여 시각적 피로도를 없애고 정보의 우선순위를 즉각 파악할 수 있게 합니다.

### 7. 스크린 생성 및 수정 완료 시 무조건 GitHub 원격 배포 (Mandatory Automated GitHub Deployment)
- **로컬 완결 후 즉시 자동 배포 완결**: AI가 스크린(HTML)을 신규 생성하거나 기존 스크린을 수정했을 때는, 로컬 파일 수정 및 정적 검증에 그치지 않고 **반드시 GitHub 원격 저장소(`main`)로의 커밋 및 푸시까지 에이전트가 자체 판단하여 무조건 자동으로 완결**해야 합니다.
- **추가 질문 대기 배제**: 스크린 작업 완료 후 "배포할까요?" 등의 불필요한 중간 질문을 하지 않으며, 브라우저 UI 자동 저장 커밋 충돌 방지를 위해 항상 `git pull --rebase origin main`을 선행한 후 즉시 `git push origin main`을 실행하여 배포를 완료하고 결과만 보고합니다.

---

## 📐 표준 스크린 템플릿 코드 스켈레톤 (Reference Skeleton)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>스크린 제목</title>
    <link rel="stylesheet" as="style" crossorigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style>
        :root {
            --v4-primary: #2563eb;
            --v4-border: #cbd5e1;
            --v4-text: #0f172a;
            --v4-font-size: 14px;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0; padding: 0;
            background: #0f172a;
            font-family: 'Pretendard Variable', 'Noto Sans KR', 'Inter', -apple-system, sans-serif;
            color: var(--v4-text);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }
        .canvas {
            width: 1600px;
            height: 900px;
            background: #f8fafc;
            position: relative;
            overflow: hidden;
            margin: 0 auto;
        }
        .lf-component {
            position: absolute !important;
            box-sizing: border-box !important;
            user-select: none;
        }
        .v4-shape {
            box-sizing: border-box;
            transition: border-color 0.15s ease;
        }
        .v4-editable-cell {
            outline: none;
            word-break: keep-all;
            font-family: inherit;
        }
        .lf-icon {
            display: inline-block;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="canvas" id="canvas">

        <!-- [0] 상단 글로벌 헤더 (Top: 20px, Left: 20px, Width: 1560px, Height: 50px) -->
        <div id="hdr_bg" class="lf-component" style="position: absolute; top: 20px; left: 20px; width: 1560px; height: 50px; z-index: 100;" data-resized="true">
            <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #0f172a; border: 1.6px solid #1e293b; border-radius: 8px; box-sizing: border-box;">
                <div class="v4-shape-text-content" style="width: 100%; height: 100%;"><p><br></p></div>
            </div>
        </div>

        <div id="hdr_icon" class="lf-component" style="position: absolute; top: 32px; left: 38px; width: 26px; height: 26px; z-index: 105;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; background-image: none !important;">
                <polygon points="12 2 2 7 12 12 22 7 12 2" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></polygon>
            </svg>
        </div>

        <div id="hdr_title" class="lf-component v4-text-shape" style="position: absolute; top: 34px; left: 76px; width: 700px; height: 26px; z-index: 105; white-space: nowrap !important;">
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: #ffffff; font-size: 16px; font-weight: 800; text-align: left; width: 100%; height: 100%; line-height: 1.2; padding: 2px 3px !important; white-space: nowrap !important;">
                <p style="white-space: nowrap !important;"><strong style="color: #ffffff; font-size: 17px; white-space: nowrap !important;">[기획/분석] 핵심 타이틀 제목</strong></p>
            </div>
        </div>

        <!-- [1] 섹션 1 메인 컨테이너 (Top: 84px, Left: 20px, Width: 1560px) -->
        <!-- 세부 카드 및 항목들은 반드시 독립된 lf-component 원자들로 개별 배치 -->

    </div>
</body>
</html>
```

---

## 🚫 스크린 제작 안티패턴 (Strict Anti-Patterns)

1. **[금기 1] 카드 내부 다중 태그 뭉치기**: 배경 div 안에 텍스트와 이미지를 전부 인라인으로 때려 넣는 구조 금지 (무조건 개별 `.lf-component`로 분리할 것).
2. **[금기 2] 12px 미만 폰트 사용**: 9px, 10px, 11px 폰트 사용 금지 (최소 `12px` 엄수).
3. **[금기 3] AI 지어내기 수치 삽입**: 근거 없는 퍼센트(%), 가상 금액, 거짓 벤치마크 내용 주입 금지 (기획서 팩트 기반 작성).
4. **[금기 4] 복잡한 원색 난립**: 빨강, 노랑, 파랑, 보라 등 무지개색을 무분별하게 혼용하는 디자인 금지 (뉴트럴 + 단일/이중 포인트 컬러 준수).
5. **[금기 5] 1600x900 초과 세로 스크롤 레이아웃**: 프레젠테이션/보고서 스크린은 1600x900 단일 화면 내에서 스크롤 없이 완결되는 컴팩트한 레이아웃을 지향해야 함.
