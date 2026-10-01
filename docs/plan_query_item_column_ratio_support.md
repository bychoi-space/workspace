# Query Item(조회 항목) 2컬럼 분할 비율(1:1, 1:2, 2:1) 지원 및 조건부 인스펙터 기능 구현 계획서

## 1. 개요 및 목적 (Overview & Goals)
본 계획서는 `Query Item`(조회 항목) 아톰에서 특정 행(Row)을 **2개 컬럼**으로 설정했을 때, 기본 1:1(하프) 분할 외에도 **1/3 지점 기준 분할(1:2, 33%:67%)** 및 **2/3 지점 기준 분할(2:1, 67%:33%)**을 자유롭게 선택할 수 있도록 기능을 확장하는 것을 목표로 합니다.

이를 통해 1행, 4행 등 **3개 컬럼(1/3, 1/3, 1/3)으로 구성된 행들과 2개 컬럼 행 간의 수직 그리드 라인(Vertical Grid Alignment)을 100% 픽셀 퍼펙트로 일치**시키고, 엔터프라이즈 관리자 화면(Admin Form) 설계의 시각적 완성도와 사용성을 극대화합니다.

### 핵심 요구사항
1. **조건부 UI 노출 (Conditional Visibility)**: 인스펙터의 행 설정에서 **조회 컬럼 개수가 '2개 컬럼'일 때만** 분할 비율 설정 UI가 노출되어야 하며, 1개 컬럼 또는 3개 컬럼일 때는 완전히 숨김(`display: none`) 처리되어 불필요한 UI 공간 낭비를 배제합니다.
2. **3대 프리셋 분할 비율 지원**:
   - `1 : 1 (하프 50% : 50%)` *(기본값)*
   - `1 : 2 (1/3 분할 33% : 67%)` ➔ 3컬럼 행의 1번째 구분선과 수직 정렬
   - `2 : 1 (2/3 분할 67% : 33%)` ➔ 3컬럼 행의 2번째 구분선과 수직 정렬
3. **비파괴 무결성 보장 (Zero Regression & Strict Compatibility)**:
   - 기존 DOM 계층 구조(`.v4-admin-row` > `.v4-admin-label-cell` + `.v4-admin-content-cell`)를 100% 보존하여 캔버스 인라인 라벨 편집, 드래그&스냅 가이드, 그룹화, 리사이즈 엔진과의 충돌을 원천 차단합니다.
   - 기존에 저장된 스크린 파일에 `data-row{i}-ratio` 속성이 없더라도 기본값 `1:1`로 자동 폴백하여 기존 스크린 데이터 파괴 0건을 보장합니다.

---

## 2. 관련 시스템 및 소스코드 전수 분석 (Architecture Analysis)

| 파일 경로 | 현재 역할 및 분석 내용 | 변경 및 영향 범위 |
| :--- | :--- | :--- |
| **`assets/vctrl_ui_atoms.js`** | Iframe 내부의 `LF_UPDATE_ADMIN_SETTINGS_PROPERTIES` 메시지 핸들러. 각 행의 `data-row{i}-cols`, `label`, `height` 등을 파싱하여 행과 셀을 동적으로 렌더링. | - `data-row{i}-ratio` 속성 저장/파싱 지원<br>- 2개 컬럼(`colsAttr === 2`)일 때 비율에 따라 `contentCell`의 `flex` 스타일을 `calc()` 수식으로 가변 적용 |
| **`assets/inspector/inspector_admin_settings.js`** | 부모 창의 Query Item 인스펙터 패널 제어 모듈 (`_syncAdminSettingsProps`). 행 개수 증감, 행별 컬럼수/높이/라벨/필수값 렌더링 및 변경 이벤트 전송. | - 각 행 블록 내에 `admin-row-ratio-container` 동적 생성<br>- 컬럼 수가 2개일 때만 `display: block` 처리<br>- 컬럼 수 변경(`colSelect.onchange`) 시 즉시 토글<br>- 비율 변경 시 Iframe으로 `LF_UPDATE_ADMIN_SETTINGS_PROPERTIES` 전송<br>- 행 추가/삭제/이동(▲/▼/×) 시 ratio 속성 유지 |
| **`assets/vctrl_iframe_style_extractor.js`** | Iframe 내부 요소 선택 시 스타일 및 속성을 추출하여 부모 창(`LF_COMP_SELECTED`)으로 전달하는 SSOT 모듈. | - `adminRowData['adminRow' + i + 'Ratio']` 추출 로직 추가 (기본값 `'1:1'`) |
| **`assets/vctrl_component_data.js`** | 컴포넌트 라이브러리(LIBRARY)의 초기 생성 템플릿 정의. | - 초기 템플릿의 속성 정합성 유지 (`data-row1-ratio="1:1"`) |
| **`assets/vctrl_responsive_smartguide.js`** | 스마트 가이드 스냅 엔진. `.v4-admin-content-cell`의 실제 BoundingClientRect를 추종하여 10px 여백 스냅 계산. | - **수정 불필요 (100% 자동 호환)**: 브라우저 실측 좌표(`cell.getBoundingClientRect().left + 10`) 기반이므로 calc 분할 위치를 자동으로 정확하게 추종함 확인 |

---

## 3. 핵심 기술 설계 명세 (Detailed Technical Design)

### 3.1. 데이터 스키마 (SSOT)
`.v4-admin-settings-container` 요소에 행 단위 속성 저장:
- `data-row{i}-ratio="1:1"` (기본값)
- `data-row{i}-ratio="1:2"` (1/3 분할)
- `data-row{i}-ratio="2:1"` (2/3 분할)

### 3.2. 인스펙터 패널 UI/UX 구성 (Conditional Rendering)
1. **조건부 컨테이너 생성**:
   각 행의 `admin-row-config-block` 내부에 `조회 컬럼 개수` 및 `행 높이` 그리드 바로 아래에 전용 컨테이너를 배치합니다:
   ```html
   <div class="admin-row-ratio-container" data-row="${i}" style="display: ${colsVal === 2 ? 'block' : 'none'}; margin-top: 6px;">
       <div class="prop-group">
           <label style="font-size: 9px; color: #00e5ff; font-weight: 600; display: block; margin-bottom: 4px;">2컬럼 분할 비율</label>
           <select class="v4-prop-input admin-row-ratio-select" data-row="${i}" style="width:100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,229,255,0.3); color: #00e5ff; padding: 4px 8px; border-radius: 4px; font-size: 11px; height: 23px; box-sizing: border-box;">
               <option value="1:1" ${ratioVal === '1:1' ? 'selected' : ''}>1 : 1 (하프 50% : 50%)</option>
               <option value="1:2" ${ratioVal === '1:2' ? 'selected' : ''}>1 : 2 (1/3 분할 33% : 67%)</option>
               <option value="2:1" ${ratioVal === '2:1' ? 'selected' : ''}>2 : 1 (2/3 분할 67% : 33%)</option>
           </select>
       </div>
   </div>
   ```
2. **동적 가시성 전환 이벤트 (`colSelect.onchange`)**:
   ```javascript
   colSelect.onchange = () => {
       const newColsVal = parseInt(colSelect.value) || 1;
       const ratioContainer = rowDiv.querySelector('.admin-row-ratio-container');
       if (ratioContainer) {
           ratioContainer.style.display = (newColsVal === 2) ? 'block' : 'none';
       }
       // ... 라벨 인풋 갱신 및 updateConfig() 호출 ...
   };
   ```

### 3.3. Iframe 렌더링 CSS 수식 (Subpixel Grid Alignment)
기존 DOM 변경 없이, `.v4-admin-content-cell`의 `style.flex` 속성만을 정밀 제어합니다:
- 전체 너비: $W$
- 라벨 너비: $L$ (`data-label-width`, 기본 140px)
- **1:1 비율**:
  - `cell[0].style.flex = '1 1 0%'`
  - `cell[1].style.flex = '1 1 0%'`
- **1:2 비율 (1/3 분할)**:
  - 1번째 컬럼 전체 너비($L + C_1$)가 정확히 $W / 3$이 되어야 함
  - 따라서 $C_1 = W / 3 - L$
  - 코드: `contentCell.style.flex = '0 0 calc(100% / 3 - ' + labelWidth + 'px)'`
  - 2번째 컬럼: `contentCell.style.flex = '1 1 0%'` (남은 $2W / 3$를 채움)
  - ➔ **1행(3컬럼)의 1번째 라벨 구분선과 소수점 1자리까지 완벽 일치!**
- **2:1 비율 (2/3 분할)**:
  - 1번째 컬럼 전체 너비($L + C_1$)가 정확히 $2W / 3$이 되어야 함
  - 따라서 $C_1 = 2W / 3 - L$
  - 코드: `contentCell.style.flex = '0 0 calc(200% / 3 - ' + labelWidth + 'px)'`
  - 2번째 컬럼: `contentCell.style.flex = '1 1 0%'` (남은 $W / 3$를 채움)
  - ➔ **1행(3컬럼)의 2번째 라벨 구분선과 소수점 1자리까지 완벽 일치!**

---

## 4. 7대 필수 게이트웨이 준수 및 리스크 방지 전략

1. **[운영 시스템 무결성 보장]**: 기존 스크린 데이터의 `data-row{i}-ratio` 부재 시 `1:1` 기본값으로 처리하여 기존 레이아웃 손상 0건 보장.
2. **[사전 정밀 분석 & 계획 수립]**: 본 계획서를 통해 모든 파일 및 수식의 영향 범위를 사전 확정 후 구현 착수.
3. **[사이드이펙트 원천 차단]**: `.v4-admin-row` 하위 DOM 계층 구조를 변경하지 않고 `style.flex` 속성만 조정하므로 캔버스 인라인 텍스트 편집, 스마트 가이드, 그룹화 기능에 간섭 0건.
4. **[스크립트/런타임 에러 0건]**: `ratioVal` 추출 시 `|| '1:1'` 널 세이프티 가드 필수 적용.
5. **[백틱 충돌 에러 0건]**: `vctrl_ui_atoms.js`, `vctrl_iframe_style_extractor.js` 등 iframe 주입 파일 내에서는 백틱(`` ` ``)을 일절 사용하지 않고 표준 따옴표와 `+` 결합 연산자만 사용.
6. **[구문 무결성 정적 검증 강제]**: 코드 변경 후 `powershell -ExecutionPolicy Bypass -File scripts/check_syntax.ps1`을 자체 구동하여 에러 0건 확인.
7. **[CORS 에러 0건]**: 모든 부모-자식 간 데이터 교환은 `window.MessageHub` 및 `window.EditorBus` 표준 프로토콜 준수.

---

## 5. 단계별 구현 절차 (Step-by-Step Execution Plan)

### Step 1: Iframe 스타일 추출기 확장 (`assets/vctrl_iframe_style_extractor.js`)
- `adminRowData['adminRow' + i + 'Ratio']` 속성 추가 (기본값 `'1:1'`).
- `LF_COMP_SELECTED` 메시지를 통해 부모 측 인스펙터로 안전하게 전달.

### Step 2: Iframe 내부 렌더링 엔진 확장 (`assets/vctrl_ui_atoms.js`)
- `LF_UPDATE_ADMIN_SETTINGS_PROPERTIES` 핸들러에서:
  - 단일 행 갱신(`d.rowNum !== undefined`): `d.ratio`가 전달되면 `container.setAttribute('data-row' + rNum + '-ratio', d.ratio)` 저장.
  - 일괄 행 갱신(`Array.isArray(d.rows)`): 각 행의 `rData.ratio` 저장 및 초과 행 속성 정리(`removeAttribute`).
- `tableDiv` 내 행/셀 렌더링 루프에서:
  - 2개 컬럼(`colsAttr === 2`)일 때 `ratioAttr`(`'1:1'`, `'1:2'`, `'2:1'`) 분기 적용 및 `calc()` 기반 `flex` 스타일 주입.

### Step 3: 부모 인스펙터 UI 컨트롤러 구현 (`assets/inspector/inspector_admin_settings.js`)
- `getCurrentRowsData()`: `data-row{i}-ratio` 읽기 및 rows 배열에 포함.
- `applyUpdatedRows()`: 컨테이너 속성 동기화 및 `syncData` 갱신.
- `rowDiv` 빌드 시:
  - `admin-row-ratio-container` 동적 생성 (`colsVal === 2 ? 'block' : 'none'`).
  - `colSelect.onchange` 시 표시/숨김 실시간 토글.
  - `ratioSelect.onchange` 바인딩 및 `updateConfig()`를 통한 Iframe 메시지 발송.
  - 행 추가/삭제/위/아래 이동 시 `ratio` 데이터 보존.

### Step 4: 컴포넌트 템플릿 정합성 확인 (`assets/vctrl_component_data.js`)
- 신규 생성되는 Query Item 아톰의 `data-row1-ratio="1:1"` 기본 속성 명시.

### Step 5: 정적 검증 및 동작 검증 (Verification)
- `scripts/check_syntax.ps1` 실행하여 구문 에러 0건 확인.
- 1컬럼, 2컬럼, 3컬럼 전환 시 인스펙터 노출/숨김 검증.
- 2컬럼에서 1:1, 1:2, 2:1 선택 시 1/3, 2/3 수직선 정렬 일치 검증.
- 저장 후 재로드 시 비율 유지 검증.

---

## 6. 검증 시나리오 및 통과 기준 (Test Criteria)

| 테스트 케이스 | 조작 내용 | 기대 결과 (Pass 기준) |
| :--- | :--- | :--- |
| **TC-1. 조건부 표시** | 인스펙터에서 컬럼 수를 1개 ➔ 2개로 변경 | `2컬럼 분할 비율` 셀렉터가 부드럽게 나타남 (`display: block`) |
| **TC-2. 조건부 숨김** | 인스펙터에서 컬럼 수를 2개 ➔ 3개(또는 1개)로 변경 | `2컬럼 분할 비율` 셀렉터가 즉시 숨겨짐 (`display: none`) |
| **TC-3. 1:2 (1/3) 분할** | 2컬럼 상태에서 `1 : 2 (1/3 분할)` 선택 | 2번째 라벨의 시작 위치가 정확히 전체 너비의 1/3 지점에 안착하여 3컬럼 행의 1번째 구분선과 칼같이 일치함 |
| **TC-4. 2:1 (2/3) 분할** | 2컬럼 상태에서 `2 : 1 (2/3 분할)` 선택 | 2번째 라벨의 시작 위치가 정확히 전체 너비의 2/3 지점에 안착하여 3컬럼 행의 2번째 구분선과 칼같이 일치함 |
| **TC-5. 인라인 편집** | 비율 변경 후 라벨 셀 텍스트 더블클릭/타이핑 | 텍스트 인라인 편집 정상 동작, 포커스 풀림 없음 |
| **TC-6. 스마트 가이드** | 다른 컴포넌트를 변경된 셀 내부로 드래그 | 변경된 셀의 시작 + 10px 위치에 자석처럼 스냅 및 가이드선 정상 표출 |
| **TC-7. 행 이동/추가/삭제** | 행 순서 변경(▲/▼) 또는 행 추가/삭제 | 설정된 비율이 유실되지 않고 올바르게 행을 따라 이동 및 저장 |
| **TC-8. 정적 검증** | `check_syntax.ps1` 구동 | 0 Errors 통과 |
