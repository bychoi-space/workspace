# Query Item(조회 항목) 4개 컬럼 지원 및 2컬럼 확장 분할 비율(1:3, 3:1) 기능 구현 계획서

> **문서 번호**: PLAN-20260930-QUERY-ITEM-V4  
> **작성 일시**: 2026-09-30  
> **상태**: 구현 준비 완료 (Ready for Review)  
> **대상 컴포넌트**: `Query Item` (조회 항목 아톰 - `v4-atom-admin-settings`)  
> **관련 소스 파일**: 
> - [assets/vctrl_ui_atoms.js](file:///c:/Users/sisun/ai_work/assets/vctrl_ui_atoms.js)
> - [assets/inspector/inspector_admin_settings.js](file:///c:/Users/sisun/ai_work/assets/inspector/inspector_admin_settings.js)
> - [assets/vctrl_iframe_style_extractor.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_style_extractor.js)
> - [assets/vctrl_component_data.js](file:///c:/Users/sisun/ai_work/assets/vctrl_component_data.js)
> - [AGENTS.md](file:///c:/Users/sisun/ai_work/AGENTS.md)

---

## 1. 개요 및 목적 (Overview & Goals)

### 1.1 배경 및 필요성
엔터프라이즈 관리자 화면(어드민 시스템)에서 검색 필터는 정보의 밀도에 따라 1개 컬럼, 2개 컬럼, 3개 컬럼뿐만 아니라, **일자/상태/유형/키워드 등 4개 항목을 한 줄에 컴팩트하게 배치하는 4개 컬럼 그리드**의 수요가 빈번합니다.
또한, 2개 컬럼 행에서 **4개 컬럼 행(각 25% 폭)과 수직 구분선을 100% 픽셀 퍼펙트로 정렬**하기 위해, 기존의 `1:1`, `1:2(33%:67%)`, `2:1(67%:33%)` 외에 **`1:3 (1/4 분할, 25% : 75%)`** 및 **`3:1 (3/4 분할, 75% : 25%)`** 분할 비율이 필수적으로 요구됩니다.

### 1.2 핵심 요구사항
1. **행(Row) 단위 '4개 컬럼' 선택 옵션 신설**:
   - 인스펙터의 조회 컬럼 개수 선택에 `4개 컬럼` 옵션을 추가하고, 선택 시 스크린 캔버스에 4개의 라벨 셀과 컨텐츠 셀이 균등 분할 렌더링되어야 합니다.
2. **오브젝트 프로퍼티(인스펙터) 4개 컬럼별 항목명/필수값 제어 UI**:
   - `4개 컬럼` 설정 시 인스펙터 패널에 `컬럼 1 항목명`, `컬럼 2 항목명`, `컬럼 3 항목명`, **`컬럼 4 항목명`** 4개의 입력 필드와 필수(*) 체크박스가 온전히 표시되고 양방향 동기화되어야 합니다.
3. **'2개 컬럼' 분할 비율에 `1:3` 및 `3:1` 프리셋 추가**:
   - 4컬럼 행(각 25% 폭)의 1번째 열과 수직선이 일치하는 **`1:3 (1/4 분할 25% : 75%)`** 지원.
   - 4컬럼 행의 3번째 열과 수직선이 일치하는 **`3:1 (3/4 분할 75% : 25%)`** 지원.
4. **비파괴 무결성 보장 (100% Backward Compatibility)**:
   - 기존에 저장된 스크린 파일(1~3컬럼, 기존 1:1, 1:2, 2:1 비율)이 손상 없이 100% 정상 로드되어야 합니다.
   - 캔버스 인라인 직접 더블클릭 텍스트 편집(`v4-editable-cell`) 및 스마트 가이드 스냅과 완벽히 연동되어야 합니다.

---

## 2. 관련 시스템 및 소스코드 전수 분석 (Architecture Analysis)

| 파일 경로 | 현재 역할 및 분석 내용 | 이번 작업에서의 변경 및 영향 범위 |
| :--- | :--- | :--- |
| **[assets/vctrl_ui_atoms.js](file:///c:/Users/sisun/ai_work/assets/vctrl_ui_atoms.js)** | Iframe 내부의 `LF_UPDATE_ADMIN_SETTINGS_PROPERTIES` 핸들러. 각 행의 `data-row{i}-cols`, `label`, `ratio` 등을 파싱하여 행과 셀을 동적으로 렌더링. | - `colsAttr === 2` 분기 내 `ratioAttr === '1:3'`, `ratioAttr === '3:1'` 지원<br>- $C_1 = W/4 - L$, $C_1 = 3W/4 - L$ flex calc 수식 추가<br>- `colsAttr === 4`일 때 4개의 라벨/컨텐츠 셀 렌더링 (루프는 이미 `for(c=0; c<colsAttr; c++)`로 일반화되어 있어 완벽 대응)<br>- 백틱(`` ` ``) 충돌 원천 차단 |
| **[assets/inspector/inspector_admin_settings.js](file:///c:/Users/sisun/ai_work/assets/inspector/inspector_admin_settings.js)** | 부모 창의 Query Item 인스펙터 패널 제어 모듈 (`_syncAdminSettingsProps`). 행 개수 증감, 행별 컬럼수/높이/라벨/비율 렌더링 및 변경 이벤트 전송. | - `admin-row-cols` 드롭다운에 `<option value="4">4개 컬럼</option>` 추가<br>- `admin-row-ratio-select` 드롭다운에 `1:3`, `3:1` 옵션 추가<br>- 컬럼 수가 4개일 때 컬럼 1~4 항목명 및 필수값 체크박스 렌더링 및 `updateConfig()` 바인딩<br>- `applyUpdatedRows()`, `getCurrentRowsData()` 데이터 추출 로직 보존 |
| **[assets/vctrl_iframe_style_extractor.js](file:///c:/Users/sisun/ai_work/assets/vctrl_iframe_style_extractor.js)** | Iframe 내부 요소 선택 시 스타일 및 속성을 추출하여 부모 창(`LF_COMP_SELECTED`)으로 전달하는 SSOT 모듈. | - **분석 완료 (수정 불필요, 100% 자동 지원)**:<br>`adminRowData['adminRow' + i + 'Cols'] = parseInt(...) || 1;`<br>`adminRowData['adminRow' + i + 'Ratio'] = getAttribute(...) || '1:1';`<br>➔ 이미 임의의 정수 및 문자열 비율을 투명하게 추출하도록 구현되어 있음. |
| **[assets/vctrl_responsive_smartguide.js](file:///c:/Users/sisun/ai_work/assets/vctrl_responsive_smartguide.js)** | 스마트 가이드 스냅 엔진. `.v4-admin-content-cell` 및 `.v4-admin-label-cell`의 실제 렌더링 BoundingClientRect를 추종하여 10px 여백 및 중앙 스냅 계산. | - **분석 완료 (수정 불필요, 100% 자동 지원)**:<br>브라우저 실측 좌표(`cell.getBoundingClientRect().left + 10`) 기반이므로 4개 컬럼 분할 및 1:3, 3:1 분할 위치를 자동으로 정확하게 추종함. |
| **[assets/vctrl_component_data.js](file:///c:/Users/sisun/ai_work/assets/vctrl_component_data.js)** | 컴포넌트 라이브러리(LIBRARY)의 초기 생성 템플릿 정의. | - 초기 기본 템플릿(1행 1컬럼) 유지 (신규 생성 시 하위 호환성 100% 유지) |
| **[AGENTS.md](file:///c:/Users/sisun/ai_work/AGENTS.md)** | 시스템 코어 룰 문서. | - `Query Item(조회 항목) 및 전용 스마트 가이드 표준 규칙` 섹션에 4개 컬럼 및 1:3/3:1 분할 비율 규격 최신화 |

---

## 3. 핵심 기술 설계 명세 (Detailed Technical Specifications)

### 3.1. 데이터 스키마 (SSOT)
`.v4-admin-settings-container` 요소에 행 단위 속성 저장:
- **컬럼 수**: `data-row{i}-cols="1" | "2" | "3" | "4"`
- **라벨 텍스트**: `data-row{i}-label="라벨1, 라벨2, 라벨3, 라벨4"` (쉼표 구분)
- **필수 여부**: `data-row{i}-required="false, true, false, false"` (쉼표 구분)
- **2컬럼 분할 비율**:
  - `data-row{i}-ratio="1:1"` (하프 50% : 50%) *(기본값)*
  - `data-row{i}-ratio="1:2"` (1/3 분할 33% : 67% - 3컬럼 행 1번째 열과 일치)
  - `data-row{i}-ratio="2:1"` (2/3 분할 67% : 33% - 3컬럼 행 2번째 열과 일치)
  - **`data-row{i}-ratio="1:3"`** *(신규)*: **1/4 분할 25% : 75%** (4컬럼 행 1번째 열과 일치)
  - **`data-row{i}-ratio="3:1"`** *(신규)*: **3/4 분할 75% : 25%** (4컬럼 행 3번째 열과 일치)

---

### 3.2. 2컬럼 분할 비율 수학 공식 및 CSS Flex 수식

전체 너비를 $W$, 레이블 셀 너비를 $L$ (`data-label-width`, 기본 140px)이라 할 때:

#### A. 1 : 3 비율 (1/4 분할, 25% : 75%)
- **목적**: 상·하단의 4컬럼 행(각 $W/4$)의 1번째 열과 정확히 수직선을 일치시킴.
- **수학 공식**:
  - 1번째 컬럼 전체 폭: $L + C_1 = \frac{W}{4} = 25\%$
  - 따라서 1번째 컨텐츠 셀 순수 폭: $C_1 = \frac{W}{4} - L$
  - 2번째 컬럼 전체 폭: $L + C_2 = \frac{3W}{4} = 75\%$
  - 2번째 컨텐츠 셀 순수 폭: $C_2 = \frac{3W}{4} - L$
- **CSS Flex 코드 ([vctrl_ui_atoms.js](file:///c:/Users/sisun/ai_work/assets/vctrl_ui_atoms.js))**:
  ```javascript
  // c === 0 (1번째 컬럼)
  flexStyle = 'flex: 0 0 calc(100% / 4 - ' + labelWidth + 'px); min-width: 0;';
  // c === 1 (2번째 컬럼)
  flexStyle = 'flex: 1 1 0%; min-width: 0;';
  ```
  *(남은 $75\%$ 공간은 flex: 1 1 0%에 의해 라벨 $L$을 제외한 $C_2$로 자동 완벽하게 채워짐)*

#### B. 3 : 1 비율 (3/4 분할, 75% : 25%)
- **목적**: 상·하단의 4컬럼 행의 3번째 열($3W/4$)과 정확히 수직선을 일치시킴.
- **수학 공식**:
  - 1번째 컬럼 전체 폭: $L + C_1 = \frac{3W}{4} = 75\%$
  - 따라서 1번째 컨텐츠 셀 순수 폭: $C_1 = \frac{3W}{4} - L$
  - 2번째 컬럼 전체 폭: $L + C_2 = \frac{W}{4} = 25\%$
  - 2번째 컨텐츠 셀 순수 폭: $C_2 = \frac{W}{4} - L$
- **CSS Flex 코드 ([vctrl_ui_atoms.js](file:///c:/Users/sisun/ai_work/assets/vctrl_ui_atoms.js))**:
  ```javascript
  // c === 0 (1번째 컬럼)
  flexStyle = 'flex: 0 0 calc(300% / 4 - ' + labelWidth + 'px); min-width: 0;';
  // c === 1 (2번째 컬럼)
  flexStyle = 'flex: 1 1 0%; min-width: 0;';
  ```

---

### 3.3. 인스펙터 패널 UI 확장 명세 ([inspector_admin_settings.js](file:///c:/Users/sisun/ai_work/assets/inspector/inspector_admin_settings.js))

#### 1) 컬럼 수 드롭다운 (`admin-row-cols`)
```html
<select class="v4-prop-input admin-row-cols" data-row="${i}" ...>
    <option value="1" ${colsVal === 1 ? 'selected' : ''}>1개 컬럼</option>
    <option value="2" ${colsVal === 2 ? 'selected' : ''}>2개 컬럼</option>
    <option value="3" ${colsVal === 3 ? 'selected' : ''}>3개 컬럼</option>
    <option value="4" ${colsVal === 4 ? 'selected' : ''}>4개 컬럼</option>
</select>
```

#### 2) 2컬럼 분할 비율 드롭다운 (`admin-row-ratio-select`)
```html
<select class="v4-prop-input admin-row-ratio-select" data-row="${i}" ...>
    <option value="1:1" ${ratioVal === '1:1' ? 'selected' : ''}>1 : 1 (하프 50% : 50%)</option>
    <option value="1:2" ${ratioVal === '1:2' ? 'selected' : ''}>1 : 2 (1/3 분할 33% : 67%)</option>
    <option value="2:1" ${ratioVal === '2:1' ? 'selected' : ''}>2 : 1 (2/3 분할 67% : 33%)</option>
    <option value="1:3" ${ratioVal === '1:3' ? 'selected' : ''}>1 : 3 (1/4 분할 25% : 75%)</option>
    <option value="3:1" ${ratioVal === '3:1' ? 'selected' : ''}>3 : 1 (3/4 분할 75% : 25%)</option>
</select>
```

#### 3) 컬럼별 라벨 & 필수값(*) 동적 생성 루프
```javascript
// for (let c = 0; c < colsVal; c++)
// colsVal가 4일 때: 컬럼 1, 컬럼 2, 컬럼 3, 컬럼 4 항목명 인풋과 필수 체크박스가 순차적으로 렌더링됨
```

---

## 4. 단계별 구현 절차 (Implementation Steps)

### [Step 1] `assets/vctrl_ui_atoms.js` 렌더링 로직 확장
- **위치**: 라인 1107 ~ 1121 (`colsAttr === 2` 분기)
- **작업 내용**:
  - `ratioAttr === '1:3'` 분기 추가: `calc(100% / 4 - ' + labelWidth + 'px)`
  - `ratioAttr === '3:1'` 분기 추가: `calc(300% / 4 - ' + labelWidth + 'px)`
  - 백틱 미사용 원칙 준수 (표준 따옴표 + 문자열 결합 연산자 사용)

### [Step 2] `assets/inspector/inspector_admin_settings.js` 인스펙터 패널 확장
- **위치 1**: 라인 342 ~ 346 (`admin-row-cols` 옵션)
  - `<option value="4" ${colsVal === 4 ? 'selected' : ''}>4개 컬럼</option>` 추가
- **위치 2**: 라인 356 ~ 360 (`admin-row-ratio-select` 옵션)
  - `1:3` 및 `3:1` 옵션 추가
- **위치 3**: 라인 478 ~ 513 (`colSelect.onchange` 이벤트 핸들러)
  - `newColsVal`가 4일 때도 4개의 항목명 인풋과 필수값 체크박스가 온전히 재생성되고 `updateConfig()`로 즉각 반영되도록 보장

### [Step 3] `AGENTS.md` 시스템 룰 문서 갱신
- `## 📋 Query Item(조회 항목) 및 전용 스마트 가이드 표준 규칙` 섹션에 **4개 컬럼 지원** 및 **1:3, 3:1 프리셋 비율 규격** 명문화.

---

## 5. 7대 필수 게이트웨이 준수 및 안정성 검증 계획

1. **[운영 시스템 무결성 보장]**:
   - 기존 스크린 데이터(1~3컬럼, 기존 비율)를 파괴하지 않고, `colsAttr || 1`, `ratioAttr || '1:1'` 기본값 방어로 100% 하위 호환성 유지.
2. **[사전 정밀 분석 & 계획 수립]**:
   - 본 계획서를 통해 모든 파일 및 수식의 영향 범위를 사전 확정 후 안전하게 착수.
3. **[사이드이펙트 원천 차단]**:
   - `.v4-admin-row` 하위 DOM 계층 구조(`.v4-admin-label-cell` + `.v4-admin-content-cell`)를 100% 동일하게 유지하여 타 컴포넌트, 스마트가이드, 드래그/리사이즈 엔진에 일절 간섭 없음.
4. **[스크립트/런타임 에러 0건]**:
   - 옵셔널 체이닝 및 유효성 검증 가드 적용.
5. **[백틱 충돌 에러 0건]**:
   - `assets/vctrl_ui_atoms.js`는 파일 전체가 백틱(`` ` ``)으로 감싸져 부모 측에서 동적으로 평가되므로, 내부 코드에서 중첩 백틱(`` ` ``) 및 `${}` 보간을 일절 사용하지 않고 표준 따옴표와 `+` 결합 연산자만 사용.
6. **[구문 무결성 정적 검증 강제]**:
   - 코드 수정 완료 후 반드시 `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1` 및 `node scripts/diagnose_deep_inspection.js`를 구동하여 0 Errors 통과 확인.
7. **[CORS 에러 0건]**:
   - 부모 창과 Iframe 간 통신은 기존 표준 `MessageHub.send` (`LF_UPDATE_ADMIN_SETTINGS_PROPERTIES`) 프로토콜을 온전히 준수.

---

## 6. 예상 결과 시뮬레이션

```
[Query Item - 4개 컬럼 설정 예시]
+-------------------------------------------------------------------------------------------------------------+
| 그룹 타이틀 (Group Header - 40px)                                                                            |
+-------------------+-------------------+-------------------+-------------------+-------------------+-----+
| 라벨 1 (140px)    | 컨텐츠 1 (25% 폭)  | 라벨 2 (140px)    | 컨텐츠 2 (25% 폭)  | 라벨 3 (140px)    | ... |
+-------------------+-------------------+-------------------+-------------------+-------------------+-----+

[Query Item - 2개 컬럼 1:3 분할 예시 (4컬럼 행과 100% 수직 일치)]
+-------------------+-------------------+---------------------------------------------------------------------+
| 라벨 1 (140px)    | 컨텐츠 1 (25% 폭)  | 라벨 2 (140px)    | 컨텐츠 2 (75% 폭)                               |
+-------------------+-------------------+---------------------------------------------------------------------+
  ▲                                       ▲
  4컬럼 행의 1번째 열 시작점과 일치         4컬럼 행의 2번째 열 시작점과 정확히 일치!
```

---
*본 계획서 승인 시 [Step 1]부터 안전하게 순차 구현에 착수합니다.*
