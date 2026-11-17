/**
 * assets/vctrl_inspector_sync.js
 * Component Properties Synchronizer & Type Strategy Dispatcher for bychoi workspace Studio.
 * Decoupled from vctrl_inspector.js to isolate property mapping from UI shell/docking.
 * 
 * Complies with AGENTS.md 7 Mandatory Gateways:
 * - Authoritative single source of truth for component type property updates.
 * - Zero side effects on selection, canvas, or iframe bridge.
 * - Exports window.InspectorPropertySync & backward-compatible window._sync*Props.
 */

(function() {
    console.log("%c [VCTRL INSPECTOR SYNC] Initializing Property Synchronizer... ", "background: #8b5cf6; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    const ATOM_PROP_SYNC_MAP = {
        textbox: { sec: 'textboxTextareaPropSection', method: 'syncTextboxTextarea', legacy: '_syncTextboxTextareaProps' },
        textarea: { sec: 'textboxTextareaPropSection', method: 'syncTextboxTextarea', legacy: '_syncTextboxTextareaProps' },
        searchbar: { sec: 'searchbarPropSection', method: 'syncSearchBar', legacy: '_syncSearchBarProps' },
        stepper: { sec: 'stepperPropSection', method: 'syncStepper', legacy: '_syncStepperProps' },
        selectbox: { sec: 'selectboxPropSection', method: 'syncSelectbox', legacy: '_syncSelectboxProps' },
        fileupload: { sec: 'fileuploadPropSection', method: 'syncFileupload', legacy: '_syncFileuploadProps' },
        alert: { sec: 'alertPropSection', method: 'syncAlert', legacy: '_syncAlertProps' },
        button: { sec: 'buttonPropSection', method: 'syncButton', legacy: '_syncButtonProps' },
        datepicker: { sec: 'datePickerPropSection', method: 'syncDatePicker', legacy: '_syncDatePickerProps' },
        toggle: { sec: 'togglePropSection', method: 'syncToggle', legacy: '_syncToggleProps' },
        cursor: { sec: 'cursorPropSection', secId: 'cursor-inspector-section', method: 'syncCursor', legacy: '_syncCursorProps' },
        webeditor: { sec: 'webeditorPropSection', secId: 'webeditor-inspector-section', method: 'syncWebEditor', legacy: '_syncWebEditorProps' }
    };

    function _detectComponentType(compStyles) {
        const state = window.state || {};
        const hasValidPinIndex = compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1 && !isNaN(compStyles.pinIndex);
        state.editingIndex = hasValidPinIndex ? compStyles.pinIndex : compStyles.id;
        if (compStyles.isGroup) return 'group';
        if (compStyles.isPin && hasValidPinIndex) return 'pin';
        if (compStyles.isGrid) return 'grid';
        if (compStyles.isTable) return 'table';
        if (compStyles.shapeType === 'line' || compStyles.id === 'v4-shape-line') return 'line';
        if (compStyles.isPopup || compStyles.id === 'v4-atom-popup' || compStyles.compId === 'v4-atom-popup') return 'popup';
        if (compStyles.isWebEditor || compStyles.id === 'v4-atom-webeditor' || (compStyles.id && compStyles.id.startsWith('v4-atom-webeditor')) || (compStyles.classList && compStyles.classList.includes('v4-webeditor-container'))) return 'webeditor';
        if (compStyles.isShape || compStyles.isPin) return 'shape';
        if (compStyles.isConnector) return 'line';
        if (compStyles.isTextbox) return 'textbox';
        if (compStyles.isTextarea) return 'textarea';
        if (compStyles.isSearchBar) return 'searchbar';
        if (compStyles.isStepper) return 'stepper';
        if (compStyles.isSelectbox) return 'selectbox';
        if (compStyles.isFileUpload) return 'fileupload';
        if (compStyles.isAlert) return 'alert';
        if (compStyles.isButton) return 'button';
        if (compStyles.isDatePicker) return 'datepicker';
        if (compStyles.isToggle) return 'toggle';
        if (compStyles.isAccordion) return 'accordion';
        if (compStyles.isAdminSettings) return 'admin-settings';
        if (compStyles.isTab) return 'tab';
        if (compStyles.isCursor) return 'cursor';
        if (compStyles.isIllustration || compStyles.isMotion || compStyles.isMedia) return 'illustration';
        if (compStyles.isIcon) return 'icon';
        return 'comp';
    }

    function _syncShapeOrPinTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.shapePropSection) DOM.shapePropSection.style.display = 'block';
        if (window.InspectorShapes && typeof window.InspectorShapes.sync === 'function') {
            window.InspectorShapes.sync(compStyles);
        }
        if (DOM.textPropSection && !compStyles.isImage && !compStyles.isMultiSameType) {
            DOM.textPropSection.style.display = 'block';
        }

        const patternGroup = document.getElementById('shape-pattern-type-group');
        const bgColorGroup = document.getElementById('shape-bg-color-group');
        const bgOpacityGroup = document.getElementById('shape-bg-opacity-group');
        const isPattern = (compStyles.shapeType === 'pattern');
        
        if (patternGroup) {
            patternGroup.style.display = isPattern ? 'block' : 'none';
            if (isPattern && compStyles.patternType && typeof window._syncPatternVisualBtns === 'function') {
                window._syncPatternVisualBtns(compStyles.patternType);
            }
        }
        if (bgColorGroup) bgColorGroup.style.display = isPattern ? 'none' : 'grid';
        if (bgOpacityGroup) bgOpacityGroup.style.display = isPattern ? 'none' : 'block';
        const borderDetailGroup = document.getElementById('shape-border-detail-group');
        const isPinMarkerEarly = (compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1 && !isNaN(compStyles.pinIndex)) || !!compStyles.isDescriptionPin;
        if (borderDetailGroup) {
            borderDetailGroup.style.display = isPinMarkerEarly ? 'none' : 'block';
        }

        const cornerGroup = document.getElementById('shape-corner-style-group');
        const arrowGroup = document.getElementById('shape-arrow-direction-group');
        const waveGroup = document.getElementById('shape-wave-direction-group');
        const isRect = (compStyles.shapeType === 'rect' || compStyles.shapeType === 'webpage' || compStyles.shapeType === 'pattern' || compStyles.id === 'v4-shape-rect' || compStyles.id === 'v4-shape-webpage' || compStyles.id === 'v4-shape-pattern-grid');
        const isArrowOrTriangle = (compStyles.shapeType === 'arrow' || compStyles.id === 'v4-shape-arrow' || compStyles.shapeType === 'triangle' || compStyles.id === 'v4-shape-triangle');
        const isWave = (compStyles.shapeType === 'wave' || compStyles.id === 'v4-shape-wave' || (compStyles.classList && compStyles.classList.includes('v4-shape-wave')));

        if (cornerGroup) cornerGroup.style.display = isRect ? 'block' : 'none';
        if (arrowGroup) {
            arrowGroup.style.display = isArrowOrTriangle ? 'block' : 'none';
            if (isArrowOrTriangle && typeof window._syncArrowDirBtns === 'function') {
                window._syncArrowDirBtns(compStyles.direction || compStyles.arrowDir || 'right');
            }
        }
        if (waveGroup) {
            waveGroup.style.display = isWave ? 'block' : 'none';
            if (isWave && typeof window._syncWaveDirBtns === 'function') {
                window._syncWaveDirBtns(compStyles.waveDir || 'horizontal');
            }
        }

        const isTextShape = !!compStyles.isTextShape || (compStyles.id && compStyles.id.startsWith('v4-text-')) || (compStyles.classList && (compStyles.classList.includes('v4-text-shape') || compStyles.classList.includes('v4-text-box'))) || (!compStyles.isShape && compStyles.isPin);
        const isImage = !!compStyles.isImage;
        const isPinMarker = (compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1 && !isNaN(compStyles.pinIndex)) || !!compStyles.isDescriptionPin;
        const supportsTextPadding = compStyles.isShape && !isImage && !isTextShape && !isPinMarker;

        const paddingGroup = document.getElementById('shape-padding-group');
        if (paddingGroup) {
            paddingGroup.style.display = supportsTextPadding ? 'block' : 'none';
        }
    }

    function _syncTableTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.tablePropSection) DOM.tablePropSection.style.display = 'block';
        const s = (compStyles && compStyles.currentStyles) || {};
        const tableBorderInput = document.getElementById('table-border-color');
        const tableBorderWrapper = document.getElementById('table-border-wrapper');
        if (tableBorderInput && s.border) {
            const validBorder = (s.border && s.border !== 'transparent') ? s.border : '#cbd5e1';
            tableBorderInput.value = validBorder;
            if (tableBorderWrapper) {
                tableBorderWrapper.classList.toggle('transparent-active', !!(s.border === 'transparent' || s.isBorderTransparent));
            }
        }
    }

    function _syncLineTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.linePropSection) DOM.linePropSection.style.display = 'block';
        if (typeof window._syncLineEditorProps === 'function') {
            window._syncLineEditorProps(compStyles);
        }
    }

    function _syncIllustrationTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.illustrationPropSection) DOM.illustrationPropSection.style.display = 'block';
        if (typeof window._syncIllustrationProps === 'function') {
            window._syncIllustrationProps(compStyles);
        }
    }

    function _syncIconTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.iconPropSection) DOM.iconPropSection.style.display = 'block';
        if (compStyles.isCheckbox || compStyles.isRadio) {
            if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'block';
            if (typeof _syncCheckboxRadioProps === 'function') {
                _syncCheckboxRadioProps(compStyles);
            }
        }
    }

    function _syncAtomTypeProps(compStyles, editingType) {
        const DOM = window.DOM || {};
        const item = ATOM_PROP_SYNC_MAP[editingType];
        if (!item) return;
        let sec = (DOM[item.sec] instanceof Node) ? DOM[item.sec] : null;
        if (!sec && item.secId) {
            sec = document.getElementById(item.secId);
        }
        if (!sec && item.sec) {
            sec = document.getElementById(item.sec);
        }
        if (sec) {
            DOM[item.sec] = sec;
            sec.style.display = 'block';
        }
        if (typeof window[item.legacy] === 'function') {
            window[item.legacy](compStyles);
        } else if (window.InspectorAtoms && typeof window.InspectorAtoms[item.method] === 'function') {
            window.InspectorAtoms[item.method](compStyles);
        }
    }

    function _syncPopupTypeProps(compStyles) {
        const DOM = window.DOM || {};
        const popupSec = DOM.popupPropSection || document.getElementById('popup-inspector-section');
        if (popupSec) popupSec.style.display = 'block';
        if (window.InspectorPopup && typeof window.InspectorPopup.sync === 'function') {
            window.InspectorPopup.sync(compStyles);
        }
        if (window.InspectorPopup && typeof window.InspectorPopup.init === 'function') {
            window.InspectorPopup.init();
        }
    }

    function _syncAccordionTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.accordionPropSection) DOM.accordionPropSection.style.display = 'block';
        if (typeof _syncAccordionProps === 'function') {
            _syncAccordionProps(compStyles);
        }
    }

    function _syncGridTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.gridPropSection) DOM.gridPropSection.style.display = 'block';
        const activeEl = document.activeElement;
        const isBtn = activeEl && (activeEl.tagName === 'BUTTON' || !!activeEl.closest('button'));
        const isTypingInGrid = !isBtn && activeEl && (
            activeEl.classList.contains('grid-col-width-input') || 
            activeEl.classList.contains('grid-col-name-input') || 
            activeEl.classList.contains('grid-col-options-input') || 
            (activeEl.tagName === 'INPUT' && activeEl.closest('#grid-inspector-section')) || 
            (activeEl.tagName === 'TEXTAREA' && activeEl.closest('#grid-inspector-section'))
        );
        if (!isTypingInGrid) {
            if (typeof _syncGridProps === 'function') {
                _syncGridProps(compStyles);
            }
        }
        if (typeof window.initGridEvents === 'function') {
            window.initGridEvents();
        }
    }

    function _syncAdminSettingsTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.adminSettingsPropSection) DOM.adminSettingsPropSection.style.display = 'block';
        const activeEl = document.activeElement;
        const isBtn = activeEl && activeEl.tagName === 'BUTTON';
        const isTypingInAdminProps = !isBtn && activeEl && (
            activeEl.classList.contains('admin-col-label-input') || 
            activeEl.classList.contains('admin-row-height-input') || 
            activeEl.id === 'prop-admin-group-header-title' || 
            activeEl.id === 'prop-admin-label-width-slider' || 
            activeEl.id === 'prop-admin-label-width-number' || activeEl.id === 'prop-width-admin' || activeEl.id === 'prop-height-admin'
        );
        if (!isTypingInAdminProps) {
            if (typeof window._syncAdminSettingsProps === 'function') {
                window._syncAdminSettingsProps(compStyles);
            }
        }
    }

    function _syncCheckboxRadioTypeProps(compStyles) {
        const DOM = window.DOM || {};
        const activeEl = document.activeElement;
        const isTypingCheckboxLabel = activeEl && activeEl.id === 'prop-atom-text-content';
        if (!isTypingCheckboxLabel) {
            if (DOM.checkboxRadioPropSection) DOM.checkboxRadioPropSection.style.display = 'block';
            if (typeof _syncCheckboxRadioProps === 'function') {
                _syncCheckboxRadioProps(compStyles);
            }
        }
    }

    function _syncTabTypeProps(compStyles) {
        const DOM = window.DOM || {};
        if (DOM.tabPropSection) DOM.tabPropSection.style.display = 'block';
        if (window.InspectorTab && typeof window.InspectorTab.sync === 'function') {
            window.InspectorTab.sync(compStyles);
        }
        if (window.InspectorTab && typeof window.InspectorTab.bindEvents === 'function') {
            window.InspectorTab.bindEvents();
        }
    }

    const TYPE_SYNC_STRATEGIES = {
        'table': _syncTableTypeProps,
        'line': _syncLineTypeProps,
        'illustration': _syncIllustrationTypeProps,
        'icon': _syncIconTypeProps,
        'popup': _syncPopupTypeProps,
        'accordion': _syncAccordionTypeProps,
        'grid': _syncGridTypeProps,
        'admin-settings': _syncAdminSettingsTypeProps,
        'tab': _syncTabTypeProps
    };

    function _syncComponentTypeProperties(compStyles, editingType) {
        let res;
        if (editingType === 'pin' || editingType === 'shape') {
            res = _syncShapeOrPinTypeProps(compStyles);
        } else if (ATOM_PROP_SYNC_MAP[editingType]) {
            res = _syncAtomTypeProps(compStyles, editingType);
        } else {
            const strategy = TYPE_SYNC_STRATEGIES[editingType];
            if (typeof strategy === 'function') {
                res = strategy(compStyles);
            } else if (compStyles && (compStyles.isCheckbox || compStyles.isRadio)) {
                res = _syncCheckboxRadioTypeProps(compStyles);
            }
        }
        _syncSliderNumberInputs();
        return res;
    }

    // --- B-2: Universal Bi-Directional Slider <-> Direct Numeric Input Synchronizer ---
    function _syncSliderNumberInputs() {
        document.querySelectorAll('.v4-slider-num-input[data-slider-target]').forEach(function(numInp) {
            const targetId = numInp.getAttribute('data-slider-target');
            if (!targetId) return;
            const slider = document.getElementById(targetId);
            if (!slider) return;
            const val = parseInt(slider.value, 10);
            const cleanVal = isNaN(val) ? 0 : val;
            if (document.activeElement !== numInp) {
                numInp.value = cleanVal;
            }
            const legacyTxt = document.getElementById('txt-' + targetId.replace(/^prop-/, ''));
            if (legacyTxt) legacyTxt.innerText = cleanVal;
        });
    }

    let _sliderNumericDelegationBound = false;
    function _bindSliderNumericDelegation() {
        if (_sliderNumericDelegationBound || typeof document === 'undefined') return;
        _sliderNumericDelegationBound = true;

        // 1. Range slider drag -> instant update to paired numeric input
        document.addEventListener('input', function(e) {
            const t = e.target;
            if (!t || t.tagName !== 'INPUT') return;

            if (t.type === 'range' && t.id) {
                const pairedNum = document.querySelector('.v4-slider-num-input[data-slider-target="' + t.id + '"]');
                if (pairedNum && document.activeElement !== pairedNum) {
                    pairedNum.value = parseInt(t.value, 10) || 0;
                }
                return;
            }

            // 2. Direct keyboard number input -> clamp & forward event to paired range slider
            if (t.classList && t.classList.contains('v4-slider-num-input')) {
                const sliderId = t.getAttribute('data-slider-target');
                const slider = sliderId ? document.getElementById(sliderId) : null;
                if (!slider) return;
                const rawStr = String(t.value).trim();
                if (rawStr === '' || rawStr === '-') return;
                const parsed = parseInt(rawStr, 10);
                if (isNaN(parsed)) return;
                const minV = !isNaN(parseFloat(slider.min)) ? parseFloat(slider.min) : 0;
                const maxV = !isNaN(parseFloat(slider.max)) ? parseFloat(slider.max) : 100;
                const clamped = Math.max(minV, Math.min(maxV, parsed));
                if (String(slider.value) !== String(clamped)) {
                    slider.value = clamped;
                    slider.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });

        const finalizeSliderNumericInput = function(e) {
            const t = e.target;
            if (!t || !t.classList || !t.classList.contains('v4-slider-num-input')) return;
            const sliderId = t.getAttribute('data-slider-target');
            const slider = sliderId ? document.getElementById(sliderId) : null;
            if (!slider) return;
            const minV = !isNaN(parseFloat(slider.min)) ? parseFloat(slider.min) : 0;
            const maxV = !isNaN(parseFloat(slider.max)) ? parseFloat(slider.max) : 100;
            const parsed = parseInt(String(t.value).trim(), 10);
            const finalVal = isNaN(parsed) ? (parseInt(slider.value, 10) || 0) : Math.max(minV, Math.min(maxV, parsed));
            t.value = finalVal;
            if (String(slider.value) !== String(finalVal)) {
                slider.value = finalVal;
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            slider.dispatchEvent(new Event('change', { bubbles: true }));
        };

        document.addEventListener('change', finalizeSliderNumericInput);
        document.addEventListener('focusout', finalizeSliderNumericInput);
    }
    _bindSliderNumericDelegation();

    // --- B-3: Smart Contextual Inspector Header Resolver & Synchronizer ---
    const INSPECTOR_TYPE_HEADER_MAP = {
        'group': { title: '그룹 오브젝트', badge: 'GROUP' },
        'pin': { title: '화면 설명 핀', badge: 'PIN' },
        'table': { title: '표 (테이블)', badge: 'TABLE' },
        'grid': { title: '데이터 그리드', badge: 'GRID' },
        'textbox': { title: '텍스트 입력창', badge: 'INPUT' },
        'textarea': { title: '멀티라인 입력창', badge: 'INPUT' },
        'searchbar': { title: '검색창', badge: 'SEARCH' },
        'stepper': { title: '스테퍼', badge: 'STEPPER' },
        'selectbox': { title: '셀렉트박스', badge: 'SELECT' },
        'fileupload': { title: '파일 업로드', badge: 'FILE' },
        'alert': { title: '알림창 (Alert)', badge: 'ALERT' },
        'popup': { title: '레이어 팝업', badge: 'POPUP' },
        'button': { title: '버튼', badge: 'BUTTON' },
        'datepicker': { title: '데이트피커', badge: 'DATE' },
        'toggle': { title: '토글 스위치', badge: 'TOGGLE' },
        'accordion': { title: '아코디언 메뉴', badge: 'TREE' },
        'admin-settings': { title: '조회 조건 테이블', badge: 'QUERY' },
        'tab': { title: '탭 컨트롤러', badge: 'TAB' },
        'cursor': { title: '마우스 커서', badge: 'CURSOR' },
        'webeditor': { title: '웹 에디터', badge: 'EDITOR' }
    };

    function _resolveShapeSubMeta(compStyles) {
        if (!compStyles) return { title: '사각형 도형', badge: 'SHAPE' };
        const isPinMarker = (compStyles.pinIndex !== undefined && compStyles.pinIndex !== -1 && !isNaN(compStyles.pinIndex)) || !!compStyles.isDescriptionPin;
        if (isPinMarker) return { title: '화면 설명 핀', badge: 'PIN' };
        if (compStyles.isImage || compStyles.isImageShape) return { title: '이미지 도형', badge: 'IMAGE' };
        const isTextOnly = !!compStyles.isTextShape || (compStyles.id && String(compStyles.id).indexOf('v4-text-') === 0) || (compStyles.classList && (compStyles.classList.includes('v4-text-shape') || compStyles.classList.includes('v4-text-box')));
        if (isTextOnly) return { title: '텍스트 상자', badge: 'TEXT' };
        const st = String(compStyles.shapeType || '').toLowerCase();
        if (st === 'circle' || compStyles.id === 'v4-shape-circle') return { title: '원형 도형', badge: 'CIRCLE' };
        if (st === 'triangle' || compStyles.id === 'v4-shape-triangle') return { title: '삼각형 도형', badge: 'SHAPE' };
        if (st === 'diamond' || compStyles.id === 'v4-shape-diamond') return { title: '마름모 도형', badge: 'SHAPE' };
        if (st === 'arrow' || compStyles.id === 'v4-shape-arrow') return { title: '화살표 도형', badge: 'ARROW' };
        if (st === 'wave' || compStyles.id === 'v4-shape-wave') return { title: '물결 도형', badge: 'WAVE' };
        if (st === 'pattern' || compStyles.id === 'v4-shape-pattern-grid') return { title: '패턴 그리드', badge: 'PATTERN' };
        if (st === 'webpage' || compStyles.id === 'v4-shape-webpage') return { title: '웹 프레임', badge: 'FRAME' };
        return { title: '사각형 도형', badge: 'SHAPE' };
    }

    function _resolveInspectorHeaderMeta(compStyles, editingType) {
        const selIds = (window.GroupingManager && typeof window.GroupingManager.getSelectedIds === 'function')
            ? window.GroupingManager.getSelectedIds()
            : ((window.state && Array.isArray(window.state.selectedIds)) ? window.state.selectedIds : []);
        const count = Array.isArray(selIds) ? selIds.length : 0;

        if (!compStyles && count === 0 && !editingType) {
            return { title: 'OBJECT PROPERTIES', badge: '' };
        }

        if (count >= 2 || editingType === 'multi') {
            const n = Math.max(2, count);
            return { title: n + '개 오브젝트 선택', badge: 'MULTI' };
        }

        const type = editingType || (compStyles ? _detectComponentType(compStyles) : 'comp');
        if (type === 'shape') return _resolveShapeSubMeta(compStyles);
        if (type === 'line') {
            const isElbow = compStyles && (compStyles.connectorType === 'elbow' || compStyles.lineType === 'elbow');
            return { title: isElbow ? '꺾은선 커넥터' : '직선 / 커넥터', badge: 'LINE' };
        }
        if (type === 'illustration') {
            const isMotion = !!(compStyles && compStyles.isMotion);
            return { title: isMotion ? '모션 그래픽' : '일러스트레이션', badge: isMotion ? 'MOTION' : 'ILLUST' };
        }
        if (type === 'icon') {
            if (compStyles && compStyles.isCheckbox) return { title: '체크박스', badge: 'ATOM' };
            if (compStyles && compStyles.isRadio) return { title: '라디오 버튼', badge: 'ATOM' };
            return { title: '벡터 아이콘', badge: 'ICON' };
        }
        if (INSPECTOR_TYPE_HEADER_MAP[type]) {
            return INSPECTOR_TYPE_HEADER_MAP[type];
        }
        if (compStyles && compStyles.isCheckbox) return { title: '체크박스', badge: 'ATOM' };
        if (compStyles && compStyles.isRadio) return { title: '라디오 버튼', badge: 'ATOM' };
        return { title: '오브젝트 속성', badge: 'OBJECT' };
    }

    function _syncInspectorContextHeader(compStyles, editingType) {
        const meta = _resolveInspectorHeaderMeta(compStyles, editingType);
        const isLocked = !!(compStyles && compStyles.isLocked);
        const sTitle = document.getElementById('sidebar-inspector-title') || document.querySelector('#sidebar-inspector-header .sidebar-inspector-title');
        const fTitle = document.getElementById('floating-inspector-title') || document.querySelector('#floating-inspector-card .floating-inspector-title');
        const sBadge = document.getElementById('sidebar-inspector-badge');
        const fBadge = document.getElementById('floating-inspector-badge');

        if (sTitle) sTitle.textContent = meta.title;
        if (fTitle) fTitle.textContent = meta.title;

        const badgeTxt = isLocked ? 'LOCKED' : meta.badge;
        [sBadge, fBadge].forEach(function(b) {
            if (!b) return;
            b.classList.toggle('is-locked', isLocked);
            if (badgeTxt) {
                b.textContent = badgeTxt;
                b.style.display = 'inline-flex';
            } else {
                b.textContent = '';
                b.style.display = 'none';
            }
        });
    }

    function _syncCommonPropertyControls(compStyles, editingType, isNewComp) {
        const DOM = window.DOM || {};
        const s = (compStyles && compStyles.currentStyles) || {};

        // Synchronize Position (X / Y) & Dimensions (Width / Height) as an authoritative inspector safeguard
        if (compStyles) {
            const isLockedComp = !!compStyles.isLocked;
            const rawX = compStyles.x;
            const rawY = compStyles.y;
            const rawW = compStyles.w !== undefined ? compStyles.w : compStyles.width;
            const rawH = compStyles.h !== undefined ? compStyles.h : compStyles.height;
            if (rawX !== undefined && !isNaN(parseFloat(rawX))) {
                const xVal = Math.round(parseFloat(rawX));
                document.querySelectorAll('.v4-prop-input[data-prop="left"]').forEach(inp => {
                    inp.disabled = isLockedComp;
                    if (isNewComp || inp !== document.activeElement) inp.value = xVal;
                    if (compStyles && compStyles.id) inp.dataset.boundCompId = compStyles.id;
                    if (isNewComp) delete inp.dataset.editingCompId;
                });
            }
            if (rawY !== undefined && !isNaN(parseFloat(rawY))) {
                const yVal = Math.round(parseFloat(rawY));
                document.querySelectorAll('.v4-prop-input[data-prop="top"]').forEach(inp => {
                    inp.disabled = isLockedComp;
                    if (isNewComp || inp !== document.activeElement) inp.value = yVal;
                    if (compStyles && compStyles.id) inp.dataset.boundCompId = compStyles.id;
                    if (isNewComp) delete inp.dataset.editingCompId;
                });
            }
            if (rawW !== undefined && !isNaN(parseFloat(rawW))) {
                const wVal = Math.round(parseFloat(rawW));
                document.querySelectorAll('.v4-prop-input[data-prop="width"]').forEach(inp => {
                    if (inp.id === 'prop-width-icon') return;
                    inp.disabled = isLockedComp;
                    if (isNewComp || inp !== document.activeElement) inp.value = wVal;
                    if (compStyles && compStyles.id) inp.dataset.boundCompId = compStyles.id;
                    if (isNewComp) delete inp.dataset.editingCompId;
                });
            }
            if (rawH !== undefined && !isNaN(parseFloat(rawH))) {
                const hVal = Math.round(parseFloat(rawH));
                document.querySelectorAll('.v4-prop-input[data-prop="height"]').forEach(inp => {
                    if (inp.id === 'prop-height-icon') return;
                    inp.disabled = isLockedComp;
                    if (isNewComp || inp !== document.activeElement) inp.value = hVal;
                    if (compStyles && compStyles.id) inp.dataset.boundCompId = compStyles.id;
                    if (isNewComp) delete inp.dataset.editingCompId;
                });
            }
        }

        if (DOM.textColorPicker) DOM.textColorPicker.value = s.text || "#000000";
        if (compStyles.isIcon || s.iconColor) {
            const iconColorInput = document.getElementById('icon-color');
            if (iconColorInput && s.iconColor) {
                iconColorInput.value = s.iconColor;
            }
        }

        if (compStyles.isShape || editingType === 'shape') {
            const shapeBgInput = document.getElementById('shape-bg-color');
            const shapeBorderInput = document.getElementById('shape-border-color');
            if (shapeBgInput) {
                const validBg = (s.bg && s.bg !== 'transparent') ? s.bg : '#ffffff';
                shapeBgInput.value = validBg;
                const wrapper = document.getElementById('shape-bg-wrapper');
                if (wrapper) {
                    if (s.bg === 'transparent' || !s.bg || s.bgOpacity === 0 || s.isBgTransparent) wrapper.classList.add('transparent-active');
                    else wrapper.classList.remove('transparent-active');
                }
            }
            if (shapeBorderInput) {
                const validBorder = (s.border && s.border !== 'transparent') ? s.border : '#c8c8c8';
                shapeBorderInput.value = validBorder;
                const wrapper = document.getElementById('shape-border-wrapper');
                if (wrapper) {
                    if (s.border === 'transparent' || !s.border || s.isBorderTransparent) wrapper.classList.add('transparent-active');
                    else wrapper.classList.remove('transparent-active');
                }
            }
            const opacityVal = (s.bgOpacity !== undefined) ? s.bgOpacity : 100;
            const slider = document.getElementById('shape-bg-opacity');
            const txt = document.getElementById('txt-shape-bg-opacity');
            if (slider) slider.value = opacityVal;
            if (txt) txt.innerText = opacityVal;
            const wrapper = document.getElementById('shape-bg-wrapper');
            if (wrapper) {
                if (s.bg === 'transparent' || !s.bg || opacityVal === 0 || s.isBgTransparent) wrapper.classList.add('transparent-active');
                else wrapper.classList.remove('transparent-active');
            }
            if (typeof window._syncShapeBorderControls === 'function') {
                window._syncShapeBorderControls(s.borderStyle || 'solid', s.borderWidth !== undefined ? s.borderWidth : 1.6);
            }
        }

        const fontSizeInput = document.getElementById(compStyles.isTable ? 'table-font-size' : 'shape-font-size');
        if (fontSizeInput && s.fontSize !== undefined) {
            fontSizeInput.value = s.fontSize;
            const txt = document.getElementById('txt-' + fontSizeInput.id);
            if (txt) txt.innerText = s.fontSize;
        }

        const isRectShape = (compStyles.isShape || editingType === 'shape') && (compStyles.shapeType === 'rect' || compStyles.shapeType === 'webpage' || compStyles.shapeType === 'pattern' || compStyles.id === 'v4-shape-rect' || compStyles.id === 'v4-shape-webpage' || compStyles.id === 'v4-shape-pattern-grid' || !compStyles.shapeType);
        if (isRectShape && s.borderRadius !== undefined) {
            const radiusVal = s.borderRadius;
            const slider = document.getElementById('shape-border-radius');
            const txt = document.getElementById('txt-shape-border-radius');
            if (slider) slider.value = radiusVal;
            if (txt) txt.innerText = radiusVal;
            if (typeof window._syncCornerBtns === 'function') {
                window._syncCornerBtns(radiusVal);
            }
            if (typeof window._syncCornerDirBtns === 'function') {
                window._syncCornerDirBtns(s.borderCornerDir || 'all');
            }
        }

        if (s.textAlign !== undefined && typeof window._syncAlignBtns === 'function') {
            window._syncAlignBtns(s.textAlign);
        }
        if (s.justifyContent !== undefined && typeof window._syncVAlignBtns === 'function') {
            window._syncVAlignBtns(s.justifyContent);
        }

        if (typeof window._syncShapePaddingInputs === 'function') {
            window._syncShapePaddingInputs({
                padTop: s.padTop !== undefined ? s.padTop : 5,
                padBottom: s.padBottom !== undefined ? s.padBottom : 5,
                padLeft: s.padLeft !== undefined ? s.padLeft : 10,
                padRight: s.padRight !== undefined ? s.padRight : 10
            });
        } else {
            const inPadTop = document.getElementById('shape-pad-top');
            const inPadBottom = document.getElementById('shape-pad-bottom');
            const inPadLeft = document.getElementById('shape-pad-left');
            const inPadRight = document.getElementById('shape-pad-right');
            if (inPadTop && s.padTop !== undefined && document.activeElement !== inPadTop) inPadTop.value = s.padTop;
            if (inPadBottom && s.padBottom !== undefined && document.activeElement !== inPadBottom) inPadBottom.value = s.padBottom;
            if (inPadLeft && s.padLeft !== undefined && document.activeElement !== inPadLeft) inPadLeft.value = s.padLeft;
            if (inPadRight && s.padRight !== undefined && document.activeElement !== inPadRight) inPadRight.value = s.padRight;
        }

        if (compStyles.isTextbox || compStyles.isTextarea) {
            const phInput = document.getElementById('prop-input-placeholder');
            if (phInput && compStyles.placeholderText !== undefined && (isNewComp || document.activeElement !== phInput)) {
                phInput.value = compStyles.placeholderText;
            }
        }

        if (compStyles.isSearchBar) {
            const phInput = document.getElementById('prop-searchbar-placeholder');
            if (phInput && compStyles.searchbarPlaceholder !== undefined) {
                phInput.value = compStyles.searchbarPlaceholder;
            }
            const mlInput = document.getElementById('prop-input-maxlength');
            const mlTxt = document.getElementById('txt-input-maxlength');
            if (mlInput && compStyles.maxLength !== undefined) {
                mlInput.value = compStyles.maxLength;
                if (mlTxt) mlTxt.innerText = compStyles.maxLength;
            }
            const activeY = document.getElementById('btn-input-counter-y');
            const activeN = document.getElementById('btn-input-counter-n');
            if (activeY && activeN && compStyles.showCounter !== undefined && typeof window.highlightActive === 'function') {
                window.highlightActive(activeY, compStyles.showCounter === true);
                window.highlightActive(activeN, compStyles.showCounter === false);
            }
        }

        if (compStyles.isAlert) {
            if (typeof _syncAlertProps === 'function') {
                _syncAlertProps(compStyles);
            } else if (window.InspectorAtoms && typeof window.InspectorAtoms.syncAlert === 'function') {
                window.InspectorAtoms.syncAlert(compStyles);
            }
        }

        if (compStyles.isButton) {
            const txtInput = document.getElementById('prop-button-text');
            if (txtInput && document.activeElement !== txtInput && compStyles.buttonText !== undefined) {
                txtInput.value = compStyles.buttonText;
            }
            const fontInput = document.getElementById('prop-button-font-size');
            if (fontInput && document.activeElement !== fontInput && compStyles.buttonFontSize !== undefined) {
                fontInput.value = compStyles.buttonFontSize;
            }
            const selStyle = document.getElementById('prop-button-style');
            if (selStyle && compStyles.buttonStyle !== undefined) {
                selStyle.value = compStyles.buttonStyle;
                const customColorsDiv = document.getElementById('prop-button-custom-colors');
                if (customColorsDiv) {
                    customColorsDiv.style.display = (compStyles.buttonStyle === 'custom') ? 'block' : 'none';
                }
            }
            const radiusSlider = document.getElementById('prop-button-border-radius');
            const radiusTxt = document.getElementById('txt-button-border-radius');
            if (radiusSlider && document.activeElement !== radiusSlider && compStyles.buttonRadius !== undefined) {
                const r = parseInt(compStyles.buttonRadius) || 0;
                radiusSlider.value = r;
                if (radiusTxt) radiusTxt.innerText = r;
                if (typeof window._syncButtonCornerBtns === 'function') {
                    window._syncButtonCornerBtns(r);
                }
            }
        }

        _syncSliderNumberInputs();
    }

    // Specific Component Synchronizers
    function _syncStepperProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncStepper === 'function') {
            window.InspectorAtoms.syncStepper(comp);
        }
    }

    function _syncCursorProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncCursor === 'function') {
            window.InspectorAtoms.syncCursor(comp);
        }
    }

    function _syncAtomDisabledProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncDisabled === 'function') {
            window.InspectorAtoms.syncDisabled(comp);
        }
    }

    function _syncSelectboxProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncSelectbox === 'function') {
            window.InspectorAtoms.syncSelectbox(comp);
        }
    }

    function _syncFileuploadProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncFileupload === 'function') {
            window.InspectorAtoms.syncFileupload(comp);
        }
    }

    function _syncAlertProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncAlert === 'function') {
            window.InspectorAtoms.syncAlert(comp);
        }
    }

    function _syncButtonProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncButton === 'function') {
            window.InspectorAtoms.syncButton(comp);
        }
    }

    function _syncSearchBarProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncSearchBar === 'function') {
            window.InspectorAtoms.syncSearchBar(comp);
        }
    }

    function _syncTextboxTextareaProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncTextboxTextarea === 'function') {
            window.InspectorAtoms.syncTextboxTextarea(comp);
        }
    }

    function _syncToggleProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncToggle === 'function') {
            window.InspectorAtoms.syncToggle(comp);
        }
    }

    function _syncAccordionProps(comp) {
        if (window.InspectorAccordion && typeof window.InspectorAccordion.sync === 'function') {
            window.InspectorAccordion.sync(comp);
            _syncAtomDisabledProps(comp);
            return;
        }
    }

    function _syncGridProps(comp) {
        if (window.InspectorGrid && typeof window.InspectorGrid.sync === 'function') {
            window.InspectorGrid.sync(comp);
            return;
        }
        const rowCountInp = document.getElementById('prop-grid-row-count');
        if (rowCountInp && comp.gridRowCount !== undefined) rowCountInp.value = comp.gridRowCount;
        const rowHeightInp = document.getElementById('prop-grid-row-height');
        if (rowHeightInp && comp.gridRowHeight !== undefined) rowHeightInp.value = comp.gridRowHeight;
    }

    function _syncCheckboxRadioProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncCheckboxRadio === 'function') {
            window.InspectorAtoms.syncCheckboxRadio(comp);
        }
    }

    function _syncDatePickerProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncDatePicker === 'function') {
            window.InspectorAtoms.syncDatePicker(comp);
        }
    }

    function _syncWebEditorProps(comp) {
        if (window.InspectorAtoms && typeof window.InspectorAtoms.syncWebEditor === 'function') {
            window.InspectorAtoms.syncWebEditor(comp);
        }
    }

    // Expose Modular InspectorPropertySync Interface
    window.InspectorPropertySync = {
        detectComponentType: _detectComponentType,
        syncComponentTypeProperties: _syncComponentTypeProperties,
        syncCommonControls: _syncCommonPropertyControls,
        syncShapeOrPin: _syncShapeOrPinTypeProps,
        syncTable: _syncTableTypeProps,
        syncLine: _syncLineTypeProps,
        syncIllustration: _syncIllustrationTypeProps,
        syncIcon: _syncIconTypeProps,
        syncAtom: _syncAtomTypeProps,
        syncPopup: _syncPopupTypeProps,
        syncAccordion: _syncAccordionTypeProps,
        syncGrid: _syncGridTypeProps,
        syncAdminSettings: _syncAdminSettingsTypeProps,
        syncCheckboxRadio: _syncCheckboxRadioTypeProps,
        syncTab: _syncTabTypeProps,
        syncStepper: _syncStepperProps,
        syncCursor: _syncCursorProps,
        syncAtomDisabled: _syncAtomDisabledProps,
        syncSelectbox: _syncSelectboxProps,
        syncFileupload: _syncFileuploadProps,
        syncAlert: _syncAlertProps,
        syncButton: _syncButtonProps,
        syncSearchBar: _syncSearchBarProps,
        syncTextboxTextarea: _syncTextboxTextareaProps,
        syncToggle: _syncToggleProps,
        syncDatePicker: _syncDatePickerProps,
        syncWebEditor: _syncWebEditorProps,
        syncSliderNumberInputs: _syncSliderNumberInputs,
        resolveInspectorHeaderMeta: _resolveInspectorHeaderMeta,
        syncInspectorContextHeader: _syncInspectorContextHeader
    };

    // Backward-Compatible Global Bindings
    window._detectComponentType = _detectComponentType;
    window._syncComponentTypeProperties = _syncComponentTypeProperties;
    window._syncCommonPropertyControls = _syncCommonPropertyControls;
    window.syncSliderNumberInputs = _syncSliderNumberInputs;
    window.resolveInspectorHeaderMeta = _resolveInspectorHeaderMeta;
    window.syncInspectorContextHeader = _syncInspectorContextHeader;
    window._syncStepperProps = _syncStepperProps;
    window._syncCursorProps = _syncCursorProps;
    window._syncAtomDisabledProps = _syncAtomDisabledProps;
    window._syncSelectboxProps = _syncSelectboxProps;
    window._syncFileuploadProps = _syncFileuploadProps;
    window._syncAlertProps = _syncAlertProps;
    window._syncButtonProps = _syncButtonProps;
    window._syncSearchBarProps = _syncSearchBarProps;
    window._syncTextboxTextareaProps = _syncTextboxTextareaProps;
    window._syncToggleProps = _syncToggleProps;
    window._syncAccordionProps = _syncAccordionProps;
    window._syncGridProps = _syncGridProps;
    window._syncCheckboxRadioProps = _syncCheckboxRadioProps;
    window._syncDatePickerProps = _syncDatePickerProps;
    window._syncWebEditorProps = _syncWebEditorProps;
})();
