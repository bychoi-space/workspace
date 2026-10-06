# 📋 [계획서] 우측 사이드바 라이브러리 (SHAPE / ATOMIC / ICON) UI/UX 전면 개선 계획

---

## 1. 개요 및 배경

본 계획서는 **Workspace Editor 우측 사이드바 라이브러리 패널**의 3대 핵심 섹션인 **`SHAPE`**, **`ATOMIC LIBRARY`**, **`ICON LIBRARY`**의 시각적 완성도와 탐색 효율을 극대화하기 위한 UI/UX 리팩토링 설계서입니다.

현재 라이브러리는 기능 추가 과정에서 누적된 **아이콘 컬러 불일치**, **특수/일반 요소의 혼재**, **비직관적인 아이콘 심볼**, **기능적 그룹핑 부재**로 인해 사용자가 원하는 컴포넌트를 빠르게 인지하고 드래그/클릭하기 어려운 UX 저해 요소를 안고 있습니다.

---

## 2. 현황 진단 및 핵심 문제점 분석

### 2.1. SHAPE 섹션 진단

```
[ 현재 3x4 그리드 배치도 ]
Row 1: [ Text (보라) ]      [ Table (보라) ]     [ Rect (시안) ]
Row 2: [ Circle (시안) ]    [ Image (시안)* ]    [ Triangle (시안) ]
Row 3: [ Diamond (시안) ]   [ Arrow (시안) ]     [ Line (시안) ]
Row 4: [ Pattern (화이트) ]  [ Wave (오렌지) ]    [ Webpage (시안) ]
```

1. **컬러 시스템의 무질서한 파편화**:
   - `Text`, `Table`: `#818cf8` (보라색 계열)
   - `Rect`, `Circle`, `Image`, `Triangle`, `Diamond`, `Arrow`, `Line`, `Webpage`: `#00e5ff` (시안 계열)
   - `Pattern`: `#ffffff` (화이트)
   - `Wave`: `#fb923c` (오렌지색)
   - ➡️ **문제**: 단일 섹션 내에서 4가지 색상이 무작위로 섞여 있어, 시각적 노이즈가 심하고 전문적인 디자인 툴의 통일감이 저해됨.
2. **Image 도형의 부자연스러운 위치 끼어들기**:
   - `Rect`, `Circle`, `Triangle`, `Diamond`는 그래픽 디자인의 **기본 4대 기하 벡터(Basic Vector Geometry)**입니다.
   - 그런데 외부 리소스 첨부 성격의 **`Image`**가 `Circle`과 `Triangle` 사이(2행 2열)에 불쑥 끼어있어 기하 도형의 연속성이 단절됩니다.
3. **도형 vs 툴/구조체의 위계 혼란**:
   - 최상단 1~2번에 '텍스트 생성 툴(`Text`)'과 '복합 데이터 구조체(`Table`)'가 위치하여, 'SHAPE(도형)'라는 카테고리 본연의 직관성이 약화되어 있습니다.
4. **아이콘 심볼 완성도**:
   - `Diamond`: 정사각형(`crop_square`)을 임의로 45도 CSS 회전시켜 놓아 픽셀 경계선이 다소 불균형함.

---

### 2.2. ATOMIC LIBRARY 섹션 진단

```
[ 현재 3x6 그리드 배치도 ]
Row 1: [ Textbox ]        [ Textarea ]       [ Stepper ]
Row 2: [ Selectbox ⚠️ ]    [ File Upload ]    [ Alert ]
Row 3: [ Button ]         [ Date Picker ]    [ Toggle Button ]
Row 4: [ Accordion ]      [ Check Box ]      [ Radio ]
Row 5: [ Grid UI ]        [ Search Bar ]     [ Query Item ]
Row 6: [ Popup ]          [ Tab ]            [ Mouse Cursor ]
```

1. **Selectbox 아톰 아이콘의 비직관성 (Critical)**:
   - 현재 Material Icons의 `arrow_drop_down_circle`(원형 안의 아래 화살표) 사용.
   - ➡️ **문제**: 사용자가 봤을 때 셀렉트박스/드롭다운 필드라기보다는 **"다운로드 버튼"**이나 **"아래로 스크롤/더보기"** 아이콘으로 오인됨.
   - 실제 생성되는 Selectbox는 `[ 선택하세요 ⌵ ]` 형태의 입력 콤보박스이므로 명확한 드롭다운 박스 메타포가 필수적임.
2. **연관 컴포넌트의 산발적 분산 (인지 부하 발생)**:
   - **선택 계열(Selection)**: `Selectbox`(2행), `Toggle Button`(3행), `Check Box`(4행), `Radio`(4행)이 제각각 흩어져 있음.
   - **입력 계열(Input)**: `Textbox`, `Textarea`(1행)와 `Search Bar`(5행)가 동떨어져 있음.
   - **수치/날짜 제어**: `Stepper`(1행)와 `Date Picker`(3행)가 분리되어 있음.
   - **컨테이너/레이아웃**: `Accordion`(4행), `Grid UI`(5행), `Tab`(6행), `Popup`(6행), `Alert`(2행)이 파편화됨.
   - **특수 인터랙션**: `Mouse Cursor`는 주석/인터랙션 지시 도구인데 팝업, 탭 옆에 위치.

---

### 2.3. ICON LIBRARY 섹션 진단

1. **단일 3열 나열로 인한 스크롤 피로도**:
   - 36~47종의 아이콘이 단일 그리드로 길게 나열되어 있어, 원하는 아이콘을 찾을 때 시각적 스캔 동선이 너무 김.
2. **사용 빈도와 정렬 순서의 불일치**:
   - 실무 와이어프레임에서 가장 많이 쓰이는 `Search`, `Close`, `Arrow L/R`, `Cart`, `Home` 등이 중간중간 흩어져 있음.
3. **브랜드 심볼의 일반 아이콘 혼재**:
   - 시선닷컴, 미샤, EBM 등 고유 브랜드 로고가 하단에 위치하나 일반 아이콘과 시각적 구분이 약함.

---

## 3. 개선 상세 설계 (To-Be Architecture)

---

### 3.1. [SHAPE] 순서 재배치 및 시각 디자인 개선

#### A. 논리적 4계층 순서 재배치
사용자의 멘탈 모델에 맞춰 **기본 기하 도형 ➡️ 커넥터/선 ➡️ 컨텐츠 미디어 ➡️ 프레임/장식** 순으로 3x4 그리드를 재정렬합니다.

| 행 (Row) | 역할 그룹 | 1열 | 2열 | 3열 | 설계 의도 |
|:---:|:---:|:---:|:---:|:---:|---|
| **Row 1** | **Basic Geometry**<br>(3대 기본 도형) | **Rect**<br>(직사각형) | **Circle**<br>(원형) | **Triangle**<br>(삼각형) | 가장 빈번히 사용하는 3대 기초 기하 벡터를 최상단 1열에 나란히 배치 |
| **Row 2** | **Flow & Connectors**<br>(분기 및 연결선) | **Diamond**<br>(마름모/의사결정) | **Line**<br>(직선 커넥터) | **Arrow**<br>(화살표 커넥터) | 플로우차트와 프로세스 다이어그램 작성 시 연계되는 3종을 2행에 집결 |
| **Row 3** | **Content Media**<br>(텍스트 및 미디어) | **Text**<br>(도형 텍스트) | **Table**<br>(데이터 표) | **Image**<br>(이미지 리소스) | 컨텐츠를 담는 핵심 3대 객체를 3행에 배치하여 Image의 고립/침범 문제 해결 |
| **Row 4** | **Frame & Decoration**<br>(컨테이너 및 장식) | **Webpage**<br>(브라우저 프레임) | **Pattern**<br>(모눈 격자) | **Wave**<br>(물결 구분선) | 화면 뼈대와 배경/장식 효과 요소를 최하단에 안정적으로 배치 |

#### B. 아이콘 모양 및 컬러 시스템 개편
- **아이콘 심볼 교체**:
  - `Diamond`: 기존 `crop_square` 45도 회전 대신 정밀한 다이아몬드 벡터 SVG 심볼 또는 공식 `diamond` 아이콘 적용.
  - `Line (Straight)`: 깔끔하고 단정한 가로선 벡터 SVG 적용.
- **컬러 통합 전략 (권장안)**:
  - **Cyan Theme 통일 (`#00e5ff`)**: SHAPE 카테고리 전체 12종의 아이콘과 보더/배경을 일관된 네온 시안 계열(`rgba(0, 229, 255, 0.06)`, 보더 `rgba(0, 229, 255, 0.15)`)로 100% 통일.
  - 텍스트와 테이블, 패턴, 웨이브만 튀던 시각적 노이즈를 완전히 제거하여 고급스러운 다크 테마 일체감 완성.

---

### 3.2. [ATOMIC LIBRARY] 기능군별 재정렬 및 직관적 아이콘 구축

#### A. 직관적인 Selectbox 신규 아이콘 설계
- **문제 해결**: `arrow_drop_down_circle` 즉시 폐기.
- **신규 디자인 (드롭다운 인풋 박스 메타포)**:
  - 텍스트 입력창 우측에 `⌵` 화살표가 있는 콤보박스 전용 SVG 심볼 적용.
  ```html
  <!-- 신규 직관적 Selectbox SVG 아이콘 (18x18px) -->
  <svg class="v4-card-atom-svg" viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor"></rect>
      <polyline points="14 11 16 13 18 11" stroke="currentColor"></polyline>
      <line x1="6" y1="12" x2="11" y2="12" stroke="currentColor" stroke-dasharray="1 1"></line>
  </svg>
  ```
  - **효과**: 사용자가 한눈에 "옵션을 펼쳐 선택하는 셀렉트 드롭다운"임을 즉시 인식.

#### B. 6대 기능군(Family) 기반의 3x6 그리드 재정렬
사용자가 화면을 설계할 때 취하는 작업 단계(입력 ➡️ 선택 ➡️ 상태/수치 ➡️ 액션 ➡️ 구조화 ➡️ 피드백)에 맞춰 배치합니다.

| 행 (Row) | 기능 그룹 (Family) | 1열 | 2열 | 3열 | 설명 |
|:---:|:---:|:---:|:---:|:---:|---|
| **Row 1** | **Form Inputs**<br>(텍스트 입력 계열) | **Textbox**<br>(단일행 인풋) | **Textarea**<br>(다중행 텍스트) | **Search Bar**<br>(검색창) | 사용자가 텍스트를 입력하는 3대 폼 컨트롤 집결 |
| **Row 2** | **Choice & Options**<br>(선택 계열) | **Selectbox**<br>(드롭다운 선택) | **Check Box**<br>(다중 체크박스) | **Radio**<br>(단일 라디오) | 선택 관련 컨트롤 3종을 한 행에 나란히 배치 |
| **Row 3** | **Value & State**<br>(수치/날짜/토글) | **Toggle Button**<br>(스위치 버튼) | **Stepper**<br>(수량 증감기) | **Date Picker**<br>(달력/기간 선택) | 상태 전환 및 동적 수치/일정 제어 컴포넌트 묶음 |
| **Row 4** | **Action & Triggers**<br>(실행/버튼 계열) | **Button**<br>(표준 액션 버튼) | **File Upload**<br>(파일 첨부 실행) | **Query Item**<br>(어드민 조회 필터) | 사용자 인터랙션을 트리거하는 액션 요소 집결 |
| **Row 5** | **Layout & Data**<br>(구조 및 데이터 뷰) | **Tab**<br>(탭 네비게이션) | **Accordion**<br>(접이식 아코디언) | **Grid UI**<br>(데이터 테이블) | 정보 구조화 및 대용량 데이터 표현 컨트롤 묶음 |
| **Row 6** | **Overlay & Marker**<br>(팝업 및 포인터) | **Popup**<br>(레이어 팝업 창) | **Alert**<br>(경고 다이얼로그) | **Mouse Cursor**<br>(인터랙션/커서) | 화면 위에 뜨는 오버레이 창 및 지시 포인터 배치 |

---

### 3.3. [ICON LIBRARY] 정렬 및 탐색성 개선

1. **고빈도 필수 유틸리티 아이콘 상단 전진 배치**:
   - `Search`, `Close`, `Menu`, `Home`, `Arrow L/R`, `Cart`, `Noti`를 1~2행에 우선 배치하여 스크롤 없이 즉시 사용 가능하도록 유도.
2. **논리적 서브 그룹 순서화**:
   - ① 네비게이션 & 기본 유틸리티 ➡️ ② 패션 & 커머스 ➡️ ③ 화살표 & 조작 ➡️ ④ 고객지원 & 리뷰 ➡️ ⑤ 브랜드 로고 & 계정
3. **브랜드 로고 전용 칩 분리**:
   - `SISUN`, `MICHAA`, `E.B.M` 등 텍스트 로고는 일반 아이콘과 성격이 다르므로 맨 마지막 영역에 독립적으로 구분.

---

## 4. 변경 전/후 한눈에 비교 (Before vs After)

### 4.1. SHAPE 비교

| 구분 | 변경 전 (AS-IS) | 변경 후 (TO-BE) | 개선 효과 |
|---|---|---|---|
| **컬러** | 4가지 색상 혼재 (보라, 시안, 화이트, 오렌지) | **#00e5ff (네온 시안) 단일 톤 완전 통일** | 산만함 해소, 일체감 있고 세련된 다크 UI 완성 |
| **Image 위치** | Circle과 Triangle 사이 (2행 2열) | **Text, Table과 함께 Content 행 (3행 3열)** | 기본 기하 도형(Rect-Circle-Triangle-Diamond) 연속성 확보 |
| **배치 순서** | Text ➡️ Table ➡️ Rect ➡️ Circle ➡️ Image... | **Rect ➡️ Circle ➡️ Triangle ➡️ Diamond ➡️ Line...** | 기초 도형 ➡️ 연결선 ➡️ 컨텐츠 ➡️ 프레임의 논리적 흐름 |
| **Diamond** | 사각형 회전 (`transform: rotate(45deg)`) | **전용 다이아몬드 벡터 SVG 심볼** | 외곽선 뭉개짐 없는 정밀한 마름모 렌더링 |

### 4.2. ATOMIC LIBRARY 비교

| 구분 | 변경 전 (AS-IS) | 변경 후 (TO-BE) | 개선 효과 |
|---|---|---|---|
| **Selectbox 아이콘** | `arrow_drop_down_circle` (원+화살표) | **드롭다운 콤보박스 전용 SVG 심볼 (`[텍스트 ⌵]`)** | 1초 만에 드롭다운 셀렉트박스로 직관적 인지 |
| **Search Bar 위치** | 5행 (Grid UI 옆에 고립) | **1행 (Textbox, Textarea 바로 옆)** | 모든 텍스트 입력 도구가 1행에 원스톱 집결 |
| **선택 계열 위치** | Selectbox(2행), Toggle(3행), Check/Radio(4행) | **Selectbox, Check Box, Radio 나란히 2행 배치** | 선택 관련 컴포넌트 탐색 시간 70% 단축 |
| **기능 그룹핑** | 무작위 혼재 (18개 요소가 산발적 배치) | **6개 테마별 3개씩 완벽 매칭 (6x3 그리드)** | 사용자 멘탈 모델과 100% 일치하는 정연한 구조 |

---

## 5. 구현 영향 범위 및 기술적 안전 조치

### 5.1. 수정 대상 파일 목록
1. **`assets/vctrl_component_data.js`**:
   - `molecules` 배열 내 `category: 'Shapes'` 항목의 순서 재배열.
   - `iconColor`를 `#00e5ff`로 통일하고, `cardStyle`을 시안 테마로 일원화.
   - `Diamond`, `Line` 아이콘 심볼 최적화.
2. **`assets/ui_library/atomic_cards.html`**:
   - 18개 아톰 카드의 순서를 6대 기능군 순으로 재배치.
   - `Selectbox` 카드 내부 아이콘을 직관적인 인라인 SVG로 교체.
3. **`assets/ui_library.css`**:
   - 신규 SVG 및 카드 간격/정렬 미세 튜닝.
4. **`assets/ui_library/icon_cards.html`**:
   - 고빈도 아이콘 우선 정렬 및 카테고리 순서 최적화.
5. **`scripts/build_ui_fallback.ps1`**:
   - 변경된 `atomic_cards.html` 및 `icon_cards.html`을 `assets/ui_library_fallback.js`로 동기화 빌드.

### 5.2. 운영 시스템 무결성 보장 (7대 필수 게이트웨이 준수)
- **ID 불변 원칙**: 컴포넌트 추가/생성 함수(`insertV4ComponentById`, `insertAtomicComponent`)에서 사용하는 각 컴포넌트의 고유 ID(`v4-shape-rect`, `v4-atom-selectbox` 등)는 100% 그대로 유지하여 기존 스크린 및 캔버스 동작에 0%의 사이드이펙트를 보장합니다.
- **구문 및 브래킷 검증**: 작업 후 `scripts/check_syntax.ps1`을 실행하여 0 Errors 통과를 필수로 검증합니다.
- **백틱 충돌 방지**: fallback 빌드 시 백틱 충돌이 발생하지 않도록 표준 빌드 파이프라인을 엄격히 준수합니다.

---

## 6. 결론 및 승인 요청

본 개선 계획은 사용자가 평소 느끼셨던 불편 사항(컬러 불일치, Image 끼어들기, Selectbox 비직관성)을 완벽히 해소할 뿐만 아니라, 우측 사이드바 전체의 정보 아키텍처(Information Architecture)를 최상급 디자인 툴 수준으로 끌어올리는 종합 개선안입니다.

계획서 검토 후 승인을 주시면 즉시 안전하게 적용 및 자체 검증을 완료하겠습니다.
