---
name: workspace-editor-screen-authoring
description: Use when the user asks AI to create, draw, generate, design, or compose a screen (HTML), process slide, benchmark report, or policy diagram in Workspace Editor, or when updating screen layout, content, and data. Enforces fact-based data, library-only standard objects, pixel-perfect template preservation, proactive illustration library usage & instant on-demand image generation (min 200x200px), 10px-unit sizing/spacing grid, zero-error horizontal/vertical alignment, atomic element separation, minimum 13px font size, concise layout, restrained color palette, and mandatory automated GitHub deployment upon screen creation or update.
---

# Workspace Editor Screen Authoring Standards (AI 직접 스크린 제작 대원칙)

에이전트(AI)가 사용자 요청에 따라 워크스페이스 에디터의 스크린(HTML 파일)을 직접 그리거나 구성할 때 **예외 없이 100% 엄격히 준수해야 하는 필수 기준**입니다.

> [!IMPORTANT]
> **표준 벤치마크 및 레퍼런스 스크린 (SSOT Reference Screens)**:
> 1. [03_Admin_System_Development_Roadmap_900.html](file:///c:/Users/sisun/ai_work/data/operation_process/03_Admin_System_Development_Roadmap_900.html): 어드민 시스템 7대 도메인 개발 로드맵 (100% 원자적 오브젝트 분리 + 3D 도메인 일러스트 결합)
> 2. [04_Front_System_Milestone_Timeline_900.html](file:///c:/Users/sisun/ai_work/data/operation_process/04_Front_System_Milestone_Timeline_900.html): 프론트 시스템 중장기 마일스톤 (상·하 교차 웨이브 인포그래픽 + `#canvas_bg_layer` 무간섭 배경 레이어 적용)
> 3. [05_Admin_System_Milestone_Timeline_900.html](file:///c:/Users/sisun/ai_work/data/operation_process/05_Admin_System_Milestone_Timeline_900.html): 어드민 시스템 7단계 마일스톤 타임라인 인포그래픽
> 4. [10_Product_Ranking_Rules_850.html](file:///c:/Users/sisun/ai_work/data/p_lus0e/10_Product_Ranking_Rules_850.html): 상품 랭킹 산정 룰 프로세스 & 정책 캔버스
> 5. [11_Daily_Ranking_Batch_Percentile_851.html](file:///c:/Users/sisun/ai_work/data/p_lus0e/11_Daily_Ranking_Batch_Percentile_851.html): 일일 랭킹 배치 파이프라인 & 백분위수 정규화 시뮬레이션 테이블 (최소 13px 폰트 규격 엄수)
> 6. [01_Benchmark_Report_382.html](file:///c:/Users/sisun/ai_work/data/p_bujl8/01_Benchmark_Report_382.html): 이커머스 주문서 최대 할인 벤치마크 리포트

---

## 🏛️ 스크린 제작 10대 절대 규칙 (Strict Core Rules)

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
  - **일러스트 (Illustrations / 3D & 2D)**: `.lf-component` ➔ `.v4-illustration-container` ➔ `<img src="assets/illustrations/..." style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;">`
  - **모션 인터랙션 (Animated WebP)**: `.lf-component` ➔ `.v4-motion-container` ➔ `<img src="assets/illustrations/motion/..." style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;">`
  - **스크린 배경 이미지 (Canvas Background)**: 배경 이미지가 필요한 경우 캔버스 루트 `#canvas` 최상단 자식으로 `<div id="canvas_bg_layer" style="position: absolute; top: 0; left: 0; width: 1600px; height: 900px; z-index: 0; pointer-events: none !important; user-select: none; overflow: hidden;"><img id="canvas_bg_img" src="..." style="width: 100%; height: 100%; object-fit: cover; opacity: ...; pointer-events: none !important; user-select: none; display: block;"></div>` 무간섭 레이어 배치.
  - **뱃지/태그 (Badges)**: 콤팩트한 직사각형 도형 래퍼 + `.v4-shape-text-content`
- **임의의 비표준 태그 금지**: 에디터 시스템 엔진이 인식할 수 없는 임의의 커스텀 태그나 비표준 클래스를 남발하여 인스펙터 선택/편집이 마비되는 현상을 차단합니다.

### 3. 최소 단위 원자적 분리 및 파편화 (Atomic Granularity & Element Separation)
- **목적**: 스크린 제작 후 **사용자가 캔버스에서 각 요소를 마우스로 직접 클릭하여 손쉽게 내용 수정, 수치 변경, 위치 이동, 색상 조정을 할 수 있도록 보장**하기 위함입니다.
- **단일 복합 카드 금지**: 하나의 카드 컨테이너 안에 배경, 아이콘, 뱃지, 제목, 본문 텍스트를 하나의 거대 HTML 블록으로 합쳐 넣는 행위를 **엄격히 금지**합니다. (그렇게 작성하면 인스펙터/Quill에서 한 글자만 수정해도 주변 아이콘과 레이아웃이 파괴됩니다.)
- **텍스트 다중 문장 1개 도형 몰아넣기 절대 금지 (Text Fragmentation)**:
  - 본문 설명이나 리스트 내용도 **절대로 1개의 Text Shape 안에 모든 줄과 코드, 효과를 한꺼번에 몰아넣지 마십시오.**
  - 하나의 카드 안에서도 내용은 **최소 2~3개의 독립된 텍스트 도형(`.lf-component.v4-text-shape`) 및 전용 쉐입으로 잘게 분리(파편화)**해야 합니다.
    - 예: `[항목 1 불릿 텍스트]` (독립 컴포넌트)
    - 예: `[코드/수식/예시 박스]` (독립 배경 쉐입 + 텍스트 컴포넌트)
    - 예: `[결과/효과 불릿 텍스트]` (독립 컴포넌트)
  - 이렇게 나누어야 사용자가 특정 문장이나 코드만 마우스로 콕 찍어서 수정하거나 줄 간격을 자유롭게 재배치할 수 있습니다.
- **원자적 분리 필수 구조 (예: 1개 카드 섹션 구성 시)**:
  1. **카드 배경 쉐입**: `<div id="card_bg" class="lf-component" ...><div class="v4-shape v4-shape-rect" ...></div></div>`
  2. **카드 아이콘 아톰**: `<div id="card_icon" class="lf-component" ...><svg class="lf-icon" ...></svg></div>`
  3. **카드 제목 텍스트**: `<div id="card_title" class="lf-component v4-text-shape" ...><div class="v4-editable-cell" contenteditable="true" ...></div></div>`
  4. **카드 상태 뱃지**: `<div id="card_badge" class="lf-component" ...><div class="v4-shape v4-shape-rect" ...></div></div>`
  5. **본문 설명 문장 1 (줄바꿈 지원)**: `<div id="card_text_1" class="lf-component" ...><div class="v4-shape v4-shape-rect" style="width:100%; height:100%; background:transparent; border:1.6px solid transparent;"><div class="v4-shape-text-content" style="text-align:left; align-items:flex-start; justify-content:flex-start; padding:0 !important;"><div class="v4-editable-cell" ...></div></div></div></div>`
  6. **코드/키워드 강조 블록**: `<div id="card_code_bg" ...></div>` + `<div id="card_code_text" ...></div>`
  7. **본문 설명 문장 2 (줄바꿈 지원)**: `<div id="card_text_2" class="lf-component" ...><div class="v4-shape v4-shape-rect" style="width:100%; height:100%; background:transparent; border:1.6px solid transparent;"><div class="v4-shape-text-content" style="text-align:left; align-items:flex-start; justify-content:flex-start; padding:0 !important;"><div class="v4-editable-cell" ...></div></div></div></div>`
- 모든 원자적 요소는 독립적인 `id`, 고유의 `position: absolute; top: ...; left: ...; width: ...; height: ...;` 좌표를 갖고 개별 선택 가능해야 합니다.

### 4. 텍스트 폰트 크기 및 줄바꿈/오버플로우 엄격 제어 (Typography, Wrapping & Bounds)
- **가독성 저하 차단**: **`13px` 미만의 폰트 크기(예: 10px, 11px, 12px 등)는 화면 가독성을 심각하게 해치므로 사용을 전면 금지**합니다.
- **권장 폰트 스케일**:
  - **대분류 메인 타이틀**: `18px` ~ `20px` (굵기: `800` / `900`)
  - **섹션 헤더 / 카드 제목**: `15px` ~ `16px` (굵기: `700` / `800`)
  - **본문 / 주요 설명**: `13.5px` ~ `14.5px` (굵기: `500` / `600`)
  - **보조 설명 / 서브 텍스트**: `13px` ~ `13.5px` (굵기: `400` / `500`)
  - **최소 단위 (뱃지, 태그, 각주, 캡션)**: **정확히 `13px`** (절대 13px 밑으로 내려가지 않음)

#### ⚠️ [필독] 텍스트 줄바꿈 실패 및 영역 이탈 원인 심층 분석 (Root-Cause Deep Dive)
> **왜 `style="white-space: normal !important;"`를 주어도 줄바꿈이 안 되고 한 줄로 카드를 뚫고 나가는가?**
> 1. **에디터 엔진의 전역 강제 주입**: 에디터 시스템([vctrl_iframe_styles.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_styles.js#L354))은 iframe 렌더링 시 다음 CSS를 `<style id="vctrl-injected-styles">`로 강제 주입합니다:
>    ```css
>    .text-marker .v4-editable-cell *, 
>    .v4-text-box .v4-editable-cell *, 
>    .v4-text-shape .v4-editable-cell * { 
>        white-space: nowrap !important; /* <--- 원인: 자식 엘리먼트 전체에 와일드카드 강제 nowrap */
>    }
>    ```
> 2. **인라인 스타일 무력화**: 클래스에 `.v4-text-shape`가 포함되어 있으면, 인라인 스타일로 아무리 `white-space: normal !important;`나 `word-break: break-word`를 작성해도 **와일드카드(`*`) 선택자의 `!important`가 `p`, `span`, `strong` 등에 우선 적용되어 무조건 1줄로 강제 연장**됩니다.
> 3. **설계 의도**: `.v4-text-shape`는 시스템 태생상 **타이틀, 헤더, 뱃지, 태그 등 "1줄 단일 텍스트(Single-line)" 전용**입니다.

#### 🛡️ 텍스트 유형별 이원화 아키텍처 규칙 (Strict Text Architecture)
* **[유형 A] 1줄 단일 텍스트 (Single-line Text)**:
  * **용도**: 대분류 메인 타이틀, 섹션 카드 헤더, 상태 뱃지, 단일 태그 라벨 등
  * **표준 마크업**: `class="lf-component v4-text-shape"` 사용 (`white-space: nowrap !important;` 유지)
* **[유형 B] 2줄 이상 멀티라인 본문/설명 (Multiline Body/Description)**:
  * **용도**: 본문 설명문, 불릿 리스트 문장, 효과/결과 설명, 가이드 문구 등 모든 다중행 텍스트
  * **금지 사항**: **절대로 `v4-text-shape` 클래스를 붙이지 마십시오.** (붙이는 순간 nowrap 강제 주입 발동)
  * **표준 마크업**: 반드시 **`class="lf-component"` + 투명 `v4-shape v4-shape-rect` + `v4-shape-text-content`** 3계층 구조를 사용하십시오:
    ```html
    <!-- [표준 멀티라인 텍스트 구조 - 줄바꿈 100% 보장] -->
    <div id="card_line_1" class="lf-component" style="position: absolute; top: ...px; left: ...px; width: 380px; height: 60px; z-index: 20;" data-resized="true">
        <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: transparent; border: 1.6px solid transparent; box-sizing: border-box;">
            <div class="v4-shape-text-content" style="width: 100%; height: 100%; text-align: left; align-items: flex-start; justify-content: flex-start; padding: 0 !important; box-sizing: border-box;">
                <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: #475569; font-size: 13px; font-weight: 400; text-align: left; width: 100%; line-height: 1.45; white-space: normal !important; word-break: break-word !important;">
                    <p style="margin: 0; padding: 0; line-height: 1.45; white-space: normal !important; word-break: break-word !important; text-align: left;">
                        • 본문 설명이 지정된 폭(Width) 내에서 정상적으로 자동 줄바꿈되며 카드를 절대 뚫고 나가지 않습니다.
                    </p>
                </div>
            </div>
        </div>
    </div>
    ```
  * **너비(Width) 제약 엄수**: 텍스트 컴포넌트의 `width`는 반드시 **부모 카드의 가로 폭에서 좌우 패딩을 제외한 실제 유효 너비(10px 단위)**로 정확히 지정하여, 인접 카드 침범을 원천 차단합니다.
  * **스크린 `<style>` 방어 CSS 필수 포함**: 스크린 `<head>` 내부 `<style>` 태그에 다음 규칙을 필수로 선언합니다:
    ```css
    .v4-shape-text-content p,
    .v4-shape-text-content span,
    .v4-shape-text-content strong,
    .v4-shape-text-content * {
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
    }
    ```

### 5. 이미지 및 일러스트 적극 활용, 최소 크기(200x200 이상) 보장 및 부재 시 즉시 제작 원칙 (Proactive Illustration Usage, Min 200x200px & Instant Generation)
- **시각적 완성도 및 몰입감 극대화 (Elevate Visual Quality)**:
  - 텍스트와 단순 사각형(Box) 위주의 밋밋하고 건조한 스크린 구성을 단호히 지양합니다.
  - 기획 맥락(도메인, 사용자 여정, 시스템 아키텍처, 벤치마크, 정책 등)에 부합하는 **일러스트(3D/2D), 인포그래픽 그래픽, 다이어그램 이미지를 카드 헤더, 프로세스 노드, 대시보드 요약 영역에 적극적으로 배치하여 시각적 직관성과 프레젠테이션 완성도를 극대화**해야 합니다.
- **이미지 최소 크기(가로 200px, 세로 200px 이상) 배치 원칙 (Minimum 200x200px Visibility Standard)**:
  - **이미지를 활용할 때는 가급적 이미지의 디테일과 오브제가 명확하게 잘 보여지도록 최소 크기(가로 `200px`, 세로 `200px`) 이상으로 배치하는 것을 지향**합니다. (너무 작게 축소하여 이미지가 답답하거나 식별하기 어렵게 배치하는 행위를 지양합니다.)
- **기존 일러스트 라이브러리 최우선 탐색 및 무분별한 재탕 금지**:
  - `assets/illustrations/` 및 에디터 우측 사이드바 `LIBRARY > Illustrations`에 구비된 에셋들을 검토하되, **현재 화면의 도메인/주제와 맞지 않는 기존 일러스트를 억지로 재탕하지 마십시오.**
  - **표준 마크업 규격 (최소 200x200 이상 지향)**:
    ```html
    <!-- [표준 일러스트 컴포넌트 마크업 - 최소 200x200 이상] -->
    <div id="comp_illustration_1" class="lf-component" style="position: absolute; top: 110px; left: 40px; width: 200px; height: 200px; z-index: 10;" data-resized="true">
        <div class="v4-illustration-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <img src="assets/illustrations/order_policy_cart_30days.png" alt="장바구니 정책" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;">
        </div>
    </div>
    ```
- **상황에 맞는 이미지가 없을 때 즉시 제작 및 반영 (Instant On-Demand Generation)**:
  - 기획 내용이나 특정 업무 도메인에 **정확히 부합하는 기존 일러스트가 없는 경우, 기존 일러스트를 재탕하거나 텍스트로만 대체하지 말고 에이전트의 이미지 생성 서브에이전트(`image-generator`)를 가동하여 상황에 최적화된 이미지를 즉시 새로 제작하여 활용**해야 합니다.
  - **제작 가이드라인**:
    - **스타일 일관성**: 기존 라이브러리의 톤앤매너(세련된 3D 아이소메트릭 또는 미니멀한 2D 일러스트)를 엄격히 계승.
    - **저장 및 카탈로그 등록**: 제작된 이미지는 반드시 `assets/illustrations/` 디렉토리에 명확한 네이밍으로 저장하고 `assets/vctrl_component_illustrations.js` 카탈로그에 함께 등록합니다.
    - **즉시 마크업 바인딩**: 생성 즉시 스크린 HTML 내 `.v4-illustration-container` 표준 구조(가급적 `200px × 200px` 이상)로 삽입하여 캔버스에 즉각 렌더링되도록 반영합니다.
- **동적 모션 인터랙션 적극 활용 (Animated WebP Motion Standard - Apple Style)**:
  - 마우스 클릭 유도, 마우스 스크롤 유도, 방사형 로딩 스피너, 프로그레스 바, 스켈레톤 패턴, 토스트 메시지 등 **동적 상태를 시각화할 때는 `assets/illustrations/motion/*.webp` 6종 프리셋을 적극 배치**하여 화면의 생동감과 시각적 완성도를 극대화합니다.

### 6. 10단위 크기/여백 그리드 규격화 및 오차 없는 정밀 정렬 (10px-Unit Grid & Zero-Error Alignment) — **[핵심 필수 기준]**
1. **모든 오브젝트의 [가로크기(Width)] · [세로크기(Height)] 10단위 구성**:
   - 모든 오브젝트의 `width`와 `height`는 가급적이면 `1px` 단위(예: `143px`, `28px`, `487px`)가 아닌 **`10px` 단위(예: `140px`, `30px`, `200px`, `480px`)**로 깔끔하게 떨어지도록 구성합니다.
2. **동일 구조 오브젝트의 무오차 가로/세로 정렬 (Zero-Error Alignment)**:
   - 동일한 위계나 구조를 가진 오브젝트(예: 다중 열 카드, 행별 라벨, 뱃지, 타이틀, 스펙 행 등)는 **가로 정렬(`left`)과 세로 정렬(`top`)이 단 `1px`의 오차도 없이 정확하게 일치**해야 합니다.
3. **오브젝트 간 간격(Gap) 및 여백(Margin/Padding) 10단위 균형 배치**:
   - 오브젝트와 오브젝트 사이의 간격 및 컨테이너 내부 여백은 가급적이면 `1px` 단위가 아닌 **`20px`, `30px`, `40px`, `50px` 등 `10px` 단위**로 균형감 있게 배치되어야 합니다.
4. **이미지 오브젝트 최소 크기(`200px × 200px` 이상) 확보**:
   - 일러스트 및 이미지를 배치할 때는 이미지가 시원하고 선명하게 잘 보여지도록 **최소 가로 `200px`, 세로 `200px` 이상**의 크기로 배치하는 것을 지향합니다.

### 7. 문서 성격에 맞는 간결하고 정돈된 레이아웃 (Purpose-Fit & Clutter-Free Layout)
- **문서 목적(보고서 vs 정책 정의서 vs 프로세스 맵)에 부합하는 레이아웃 설계**:
  - 기대효과/피칭 보고서(`Impact Report`)와 실무 정책 정의서(`Policy Specification`)의 레이아웃을 획일적으로 똑같이 찍어내지 마십시오.
  - **정책 정의서(Policy Document)**는 단계별 시각 요약과 함께 **[정책 구분 / 적용 항목 / 상세 기준값 / 예외 및 운영 규칙]**이 한눈에 대조·식별되는 **정돈된 스펙 시트(Specification Matrix) 구조**로 설계해야 합니다.
- **군더더기 배제 및 스크롤-프리 (1600x900)**:
  - 장황한 서술형 문장을 지양하고 핵심 기준과 수치 위주로 컴팩트하게 정돈하며, `1600px × 900px` 단일 화면 내에서 스크롤 없이 완결되도록 여백(Breathing Room)을 유지합니다.

### 8. 절제된 컬러 및 포인트 강조 (Restrained Color Palette)
- **무지개색 남발 금지**: 색상을 너무 난잡하게 여러 가지 섞어 쓰지 않습니다.
- **기본 뉴트럴 톤 (베이스)**:
  - 캔버스 배경: `#f8fafc` (슬레이트 50)
  - 카드/컨테이너 배경: `#ffffff` (순백색) 또는 `#f1f5f9` (슬레이트 100)
  - 테두리 보더: `1.6px solid #e2e8f0` 또는 `#cbd5e1`
  - 본문 글자색: `#0f172a` (슬레이트 900) 또는 `#334155` (슬레이트 700)
- **헤더 다크 엑센트 (상단 통일)**:
  - 글로벌 헤더 배경: `#0f172a` (다크 네이비), 테두리 `#1e293b`, 텍스트 화이트 `#ffffff`
- **전략적 포인트 컬러**:
  - **신뢰/주요 기준 (Primary)**: `#2563eb` (로열 블루) / `#1d4ed8`
  - **스마트/헤더 뱃지 (Sky/Teal)**: `#38bdf8` (스카이) / `#0d9488` (틸)
  - **성공/확정/보호 (Success)**: `#059669` ~ `#15803d` (에메랄드/그린)
  - **주의/경고/제한 (Alert)**: `#e11d48` (로즈 레드) / `#d97706` (앰버)

### 9. 스크린 생성 및 수정 완료 시 무조건 GitHub 원격 배포 (Mandatory Automated GitHub Deployment)
- **로컬 완결 후 즉시 자동 배포 완결**: AI가 스크린(HTML)을 신규 생성하거나 기존 스크린을 수정했을 때는, 로컬 파일 수정 및 정적 검증에 그치지 않고 **반드시 GitHub 원격 저장소(`main`) 및 사내 Git 저장소(`sisun`)로의 커밋 및 푸시까지 에이전트가 자체 판단하여 무조건 자동으로 완결**해야 합니다.
- **추가 질문 대기 배제**: 스크린 작업 완료 후 "배포할까요?" 등의 불필요한 중간 질문을 하지 않으며, `scripts/deploy_all.ps1`을 통해 즉시 동기화하고 결과만 보고합니다.

### 10. 표준 템플릿 기반 제작 시 픽셀 단위 레이아웃 100% 보존 불변 원칙 (Strict Pixel-Perfect Template Preservation)
- **사용자 정돈 템플릿의 기하학적 구조(Geometry) 절대 보존**:
  - 사용자가 명시적으로 지정한 표준 템플릿(`assets/templates/template_*.html` 등)을 기반으로 복제/치환할 때는 도형의 크기, 위치 좌표, 여백, 정렬을 임의로 왜곡하지 않고 보존합니다.

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

        <div id="hdr_icon" class="lf-component" style="position: absolute; top: 30px; left: 40px; width: 30px; height: 30px; z-index: 105;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; background-image: none !important;">
                <polygon points="12 2 2 7 12 12 22 7 12 2" stroke-width="1.6" style="stroke-width: 1.6; vector-effect: non-scaling-stroke;"></polygon>
            </svg>
        </div>

        <div id="hdr_title" class="lf-component v4-text-shape" style="position: absolute; top: 30px; left: 80px; width: 700px; height: 30px; z-index: 105; white-space: nowrap !important;">
            <div class="v4-editable-cell" contenteditable="true" style="outline: none; color: #ffffff; font-size: 16px; font-weight: 800; text-align: left; width: 100%; height: 100%; line-height: 1.2; padding: 2px 3px !important; white-space: nowrap !important;">
                <p style="white-space: nowrap !important;"><strong style="color: #ffffff; font-size: 17px; white-space: nowrap !important;">[기획/분석] 핵심 타이틀 제목</strong></p>
            </div>
        </div>

        <!-- [1] 본문 섹션 (10px 단위 크기/좌표/간격 및 최소 200x200 일러스트 준수) -->

    </div>
</body>
</html>
```

---

## 🚫 스크린 제작 안티패턴 (Strict Anti-Patterns)

1. **[금기 1] 카드 내부 다중 태그 뭉치기**: 배경 div 안에 텍스트와 이미지를 전부 인라인으로 때려 넣는 구조 금지 (무조건 개별 `.lf-component`로 분리할 것).
2. **[금기 2] 13px 미만 폰트 사용**: 9px, 10px, 11px, 12px 폰트 사용 금지 (최소 `13px` 엄수).
3. **[금기 3] AI 지어내기 수치 삽입**: 근거 없는 퍼센트(%), 가상 금액, 거짓 벤치마크 내용 주입 금지 (기획서 팩트 기반 작성).
4. **[금기 4] 복잡한 원색 난립**: 빨강, 노랑, 파랑, 보라 등 무지개색을 무분별하게 혼용하는 디자인 금지 (뉴트럴 + 단일/이중 포인트 컬러 준수).
5. **[금기 5] 1600x900 초과 세로 스크롤 레이아웃**: 프레젠테이션/보고서 스크린은 1600x900 단일 화면 내에서 스크롤 없이 완결되는 컴팩트한 레이아웃을 지향해야 함.
6. **[금기 6] 텍스트 1개 도형 몰아넣기 (No Single Text Dump)**: 불릿 리스트 여러 줄, 코드 박스, 효과 설명을 단 1개의 텍스트 도형에 몰아넣는 행위 금지. 사용자의 개별 편집 편의성을 위해 최소 2~3개의 독립된 `.lf-component`로 파편화할 것.
7. **[금기 7] 줄바꿈 미처리 및 카드 경계 침범 (No Text Overflow & Overlap)**: 본문 설명문에 `white-space: nowrap`을 오적용하거나 폭(width) 계산을 누락하여 텍스트가 카드를 뚫고 인접 영역을 침범·중첩하는 레이아웃 파괴 행위 절대 금지.
8. **[금기 8] 일러스트 없는 밋밋한 상자 나열 또는 200x200 미만 소형 일러스트 배치**: 일러스트를 배제하거나, 이미지를 가로/세로 200px 미만으로 너무 작게 축소하여 잘 보이지 않게 배치하는 행위 지양 (최소 `200px × 200px` 이상 지향).
9. **[금기 9] 1px 단위 불규칙 크기/간격 및 정렬 오차 (No Irregular 1px Sizing or Misalignment)**: 오브젝트의 가로/세로 크기나 여백을 `1px` 단위로 중구난방 설정하거나 동일 구조 오브젝트의 가로/세로 정렬이 어긋나는 행위 금지 (`width`/`height` 10단위 구성, 간격 `20/30/40/50px` 등 10단위 균형 배치, 동일 구조 오브젝트 0px 오차 정렬 엄수).
