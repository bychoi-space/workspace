/**
 * bychoi workspace V4 - Standard Atoms Component Library Catalog
 * Decoupled from vctrl_component_data.js for performance and modularity.
 * Defines standard buttons, badges, inputs, textboxes, selectors, web editor atoms, etc.
 */

if (!window.V4_COMPONENT_LIBRARY) {
    window.V4_COMPONENT_LIBRARY = { atoms: [], molecules: [], organisms: [], canvasBackgrounds: [], illustrations: [] };
}

window.V4_COMPONENT_LIBRARY.atoms = [
        {
            id: 'v4-btn-primary',
            name: 'Pill Action Button',
            category: 'Atoms',
            previewHtml: `<div class="v4-btn-glass" style="background: var(--v4-primary, #6366f1); border:none; height: 28px; border-radius: 14px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #fff; box-shadow: 0 4px 12px var(--v4-primary-glow, rgba(99, 102, 241, 0.4));">Action</div>`,
            html: `<button class="v4-btn-glass" style="background: #6366f1; border:none; color:white; height: 28px; padding: 0 18px; border-radius: 14px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; outline: none;">Primary Action</button>`
        },
        {
            id: 'v4-badge-new',
            name: 'Neon Badge',
            category: 'Atoms',
            previewHtml: `<span style="background: #00e5ff; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 900;">NEW</span>`,
            html: `<span style="background: #00e5ff; color: #000; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-block; box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);">NEW</span>`
        },
        {
            id: 'v4-text-premium',
            name: 'Premium Text Block',
            category: 'Atoms',
            previewHtml: `<div style="font-size: 12px; color: #050505; border-bottom: 1.6px solid #c8c8c8; width: 40px; text-align: center;">TEXT</div>`,
            html: `
            <div class="v4-shape v4-shape-text" style="width: 100%; height: 100%; background: transparent; border: 1.6px solid transparent; display: flex; align-items: center; justify-content: center; color: #050505; overflow: hidden; box-sizing: border-box;">
                <div contenteditable="true" class="v4-editable-cell" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; text-align: center; outline: none; font-weight: 400; font-size: 13px; color: #050505; font-family: inherit; word-break: break-word; white-space: pre-wrap;">Enter Premium Text</div>
            </div>`
        },
        {
            id: 'v4-atom-icon-share',
            name: 'Share Icon (Premium)',
            category: 'Atoms',
            width: '40px',
            height: '40px',
            previewHtml: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 24px; height: 24px; color: white;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
            html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 100%; height: 100%; padding: 8px; color: #050505; box-sizing: border-box;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`
        },
        {
            id: 'v4-atom-textbox',
            name: 'Textbox',
            category: 'Atoms',
            width: '150px',
            height: '30px',
            previewHtml: `<div style="width: 80px; height: 20px; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 4px; display: flex; align-items: center; padding: 0 4px; font-size: 8px; color: #969696; font-family: inherit;">Placeholder</div>`,
            html: `
            <div class="v4-textbox-container" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 8px; display: flex; align-items: center; padding: 0 12px; pointer-events: auto;">
                <div class="v4-textbox-placeholder" style="position: absolute; left: 12px; color: #969696; pointer-events: none; font-size: 13px; font-weight: 400; user-select: none; font-family: inherit;">Placeholder</div>
                <div contenteditable="true" class="v4-editable-cell v4-textbox-input" style="width: 100%; height: 100%; border: none; outline: none; background: transparent; color: #050505; font-size: 13px; font-weight: 400; display: flex; align-items: center; white-space: nowrap; overflow: hidden; padding: 8px 0; box-sizing: border-box; padding-right: 48px; font-family: inherit;"></div>
                <div class="v4-textbox-counter" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 400; color: #969696; user-select: none; display: none; font-family: inherit;">0/100</div>
            </div>`
        },
        {
            id: 'v4-atom-textarea',
            name: 'Textarea',
            category: 'Atoms',
            width: '150px',
            height: '60px',
            previewHtml: `<div style="width: 80px; height: 30px; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 4px; padding: 2px; font-size: 8px; color: #969696; box-sizing: border-box; font-family: inherit;">Placeholder</div>`,
            html: `
            <div class="v4-textarea-container" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background-color: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 8px; display: flex; flex-direction: column; padding: 10px 12px 6px 12px; pointer-events: auto;">
                <div class="v4-textarea-placeholder" style="position: absolute; left: 12px; top: 10px; color: #969696; pointer-events: none; font-size: 13px; font-weight: 400; user-select: none; font-family: inherit;">Placeholder</div>
                <div contenteditable="true" class="v4-editable-cell v4-textarea-input" style="width: 100%; flex: 1 1 auto; min-height: 0; border: none; outline: none; background: transparent; color: #050505; font-size: 13px; font-weight: 400; resize: none; overflow-y: auto; padding: 0 4px 0 0; word-break: break-all; white-space: pre-wrap; box-sizing: border-box; font-family: inherit;"></div>
                <div class="v4-textarea-counter" style="align-self: flex-end; margin-top: 4px; font-size: 12px; line-height: 1; font-weight: 400; color: #969696; user-select: none; display: none; font-family: inherit; flex-shrink: 0;">0/100</div>
            </div>`
        },
        {
            id: 'v4-atom-stepper',
            name: 'Quantity Stepper',
            category: 'Atoms',
            width: '134px',
            height: '30px',
            previewHtml: `<div style="display: flex; align-items: center; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 6px; font-size: 10px; height: 20px; padding: 0 4px; box-sizing: border-box; width: 80px; justify-content: space-between;"><span style="color: #969696; font-weight: bold; cursor: default;">—</span><span style="font-weight: bold; color: #050505;">1</span><span style="color: #050505; font-weight: bold; cursor: default;">+</span></div>`,
            html: `
            <div class="v4-stepper-container" data-min="1" data-max="99" data-val="1" data-btn-enabled="true" data-btn-text="적용" data-disabled="false" style="position: relative; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; pointer-events: auto; user-select: none; width: 100%; height: 100%; box-sizing: border-box;">
                <div class="v4-stepper-control" style="display: inline-flex; align-items: center; border: 1.6px solid #c8c8c8; border-radius: 8px; background-color: #ffffff; overflow: hidden; height: 100%; box-sizing: border-box; flex: 1 1 auto;">
                    <button class="v4-stepper-dec" style="width: 24px; height: 100%; border: none; background: #f0f0f0; color: #969696; font-size: 13px; font-weight: 400; cursor: not-allowed; outline: none; display: flex; align-items: center; justify-content: center; user-select: none; transition: background-color 0.2s, color 0.2s; font-family: inherit;">—</button>
                    <div class="v4-stepper-value" style="flex: 1 1 auto; min-width: 32px; text-align: center; font-size: 13px; font-weight: 400; color: #050505; user-select: none; font-family: inherit;">1</div>
                    <button class="v4-stepper-inc" style="width: 24px; height: 100%; border: none; background: #ffffff; border-left: 1.6px solid #c8c8c8; color: #050505; font-size: 13px; font-weight: 400; cursor: pointer; outline: none; display: flex; align-items: center; justify-content: center; user-select: none; transition: background-color 0.2s, color 0.2s; font-family: inherit;">+</button>
                </div>
                <button class="v4-stepper-action" style="height: 100%; padding: 0 12px; border: 1.6px solid #c8c8c8; border-radius: 8px; background-color: #ffffff; font-size: 13px; font-weight: 400; color: #050505; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: inherit; flex-shrink: 0;">적용</button>
            </div>`
        },
        {
            id: 'v4-atom-selectbox',
            name: 'Select Box',
            category: 'Atoms',
            width: '150px',
            height: '30px',
            previewHtml: `<div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 6px; font-size: 10px; height: 20px; padding: 0 6px; box-sizing: border-box; width: 80px;"><span style="color: #050505;">선택하세요</span><span style="font-size: 8px; color: #969696;">▼</span></div>`,
            html: `
            <div class="v4-selectbox-container" data-default-text="선택하세요" data-dropdown-active="false" data-options="Option 1,Option 2,Option 3" data-selected-indices="" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; flex-direction: column;">
                <div class="v4-selectbox-header" style="display: flex; align-items: center; justify-content: space-between; border: 1.6px solid #c8c8c8; border-radius: 8px; background-color: #ffffff; height: 100%; width: 100%; padding: 0 12px; box-sizing: border-box; font-size: 13px; font-weight: 400; color: #050505; cursor: pointer; overflow: hidden; flex-shrink: 0;">
                    <span class="v4-selectbox-selected-text" style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">선택하세요</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#969696" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <div class="v4-selectbox-options" style="display: none; position: relative; top: 0; left: 0; width: 100%; flex: 1; background-color: #ffffff; border: 1.6px solid #c8c8c8; border-top: none; border-radius: 0 0 8px 8px; box-sizing: border-box; z-index: 10; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div class="v4-selectbox-option" data-index="0" data-selected="false" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 13px; font-weight: 400; color: #050505; border-bottom: 1.6px solid #f0f0f0; box-sizing: border-box;"><span class="v4-option-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Option 1</span></div>
                    <div class="v4-selectbox-option" data-index="1" data-selected="false" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 13px; font-weight: 400; color: #050505; border-bottom: 1.6px solid #f0f0f0; box-sizing: border-box;"><span class="v4-option-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Option 2</span></div>
                    <div class="v4-selectbox-option" data-index="2" data-selected="false" style="height: 30px; padding: 0 12px; display: flex; align-items: center; font-size: 13px; font-weight: 400; color: #050505; border-bottom: none; box-sizing: border-box;"><span class="v4-option-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Option 3</span></div>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-fileupload',
            name: 'File Upload',
            category: 'Atoms',
            width: '300px',
            height: '30px',
            previewHtml: `<div style="display: flex; align-items: center; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 6px; font-size: 10px; height: 20px; padding: 0 4px; box-sizing: border-box; width: 80px; gap: 4px;"><div style="flex: 1; border: 1px solid #e6e6e6; height: 12px; background: #fafafa;"></div><div style="background: #f0f0f0; font-size: 8px; padding: 1px 3px; border-radius: 2px;">첨부</div></div>`,
            html: `
            <div class="v4-fileupload-container" data-selected="false" data-file-name="" data-button-text="파일첨부" data-placeholder="선택된 파일 없음" style="position: relative; display: flex; align-items: center; gap: 6px; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box;">
                <div class="v4-fileupload-textbox-wrapper" style="position: relative; display: flex; align-items: center; flex: 1; border: 1.6px solid #c8c8c8; border-radius: 8px; background-color: #ffffff; height: 30px; padding: 0 10px; box-sizing: border-box;">
                    <div class="v4-fileupload-textbox" style="font-size: 13px; font-weight: 400; color: #969696; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; cursor: not-allowed; font-family: inherit;">선택된 파일 없음</div>
                    <span class="v4-fileupload-delete" style="display: none; cursor: pointer; color: #969696; font-size: 14px; font-weight: bold; margin-left: 8px; flex-shrink: 0; transition: color 0.2s;">&times;</span>
                </div>
                <button class="v4-fileupload-button" style="height: 30px; padding: 0 14px; border: 1.6px solid #c8c8c8; border-radius: 8px; background-color: #ffffff; font-size: 13px; font-weight: 400; color: #050505; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: inherit;">파일첨부</button>
            </div>`
        },
        {
            id: 'v4-atom-alert',
            name: 'Alert Window',
            category: 'Atoms',
            width: '250px',
            height: '120px',
            previewHtml: `<div style="display: flex; flex-direction: column; width: 80px; height: 50px; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; font-size: 8px; box-sizing: border-box;"><div style="background: #f0f0f0; height: 12px; display: flex; align-items: center; padding: 0 4px; border-bottom: 1px solid #c8c8c8; font-weight: bold; color: #050505;">Alert</div><div style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 6px; color: #646464; padding: 2px; text-align: center;">Message</div></div>`,
            html: `
            <div class="v4-alert-container" data-message="얼럿 메시지 입력 표시" data-btn-count="1" data-btn-text-1="확인" data-btn-text-2="취소" data-btn-text-3="저장" data-btn-style-1="normal" data-btn-style-2="normal" data-btn-style-3="normal" data-show-desc="true" data-desc="얼럿 노출 케이스" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; background: transparent; justify-content: flex-end;">
                <div class="v4-alert-desc-wrapper" style="display: flex; justify-content: flex-start; width: 100%; flex-shrink: 0;">
                    <div class="v4-alert-desc-badge" style="background: #1e3a8a; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 400; font-family: inherit; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1.6px solid #1e40af;">얼럿 노출 케이스</div>
                </div>
                <div class="v4-alert-dialog" style="flex: 1; width: 100%; background: #ffffff; border: 1.6px solid #c8c8c8 !important; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); overflow: hidden; display: flex; flex-direction: column; box-sizing: border-box;">
                    <div class="v4-alert-header" style="height: 32px; flex-shrink: 0; background: #f0f0f0; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1.6px solid #c8c8c8 !important; box-sizing: border-box; width: 100%;">
                        <span class="v4-alert-title" style="font-size: 13px; font-weight: 400; color: #050505; font-family: inherit;">Alert</span>
                        <span class="v4-alert-close" style="cursor: pointer; color: #969696; font-size: 16px; font-weight: bold; line-height: 1; display: flex; align-items: center; justify-content: center;">&times;</span>
                    </div>
                    <div class="v4-alert-content" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 12px; box-sizing: border-box; width: 100%;">
                        <div class="v4-alert-message" style="font-size: 13px; font-weight: 400; color: #050505; text-align: center; line-height: 1.4; white-space: pre-wrap; font-family: inherit; margin-bottom: 14px; word-break: break-all; width: 100%;">얼럿 메시지 입력 표시</div>
                        <div class="v4-alert-buttons" style="display: flex; gap: 8px; justify-content: center; width: 100%; flex-wrap: nowrap; flex-shrink: 0;">
                            <button class="v4-alert-btn v4-alert-btn-1 style-normal" style="height: 28px; min-width: 70px; padding: 0 12px; border: 1.6px solid #c8c8c8 !important; border-radius: 6px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); box-sizing: border-box; transition: background 0.2s;">확인</button>
                            <button class="v4-alert-btn v4-alert-btn-2 style-normal" style="height: 28px; min-width: 70px; padding: 0 12px; border: 1.6px solid #c8c8c8 !important; border-radius: 6px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; font-family: inherit; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); box-sizing: border-box; transition: background 0.2s;">취소</button>
                            <button class="v4-alert-btn v4-alert-btn-3 style-normal" style="height: 28px; min-width: 70px; padding: 0 12px; border: 1.6px solid #c8c8c8 !important; border-radius: 6px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; font-family: inherit; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); box-sizing: border-box; transition: background 0.2s;">저장</button>
                        </div>
                    </div>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-popup',
            name: 'Popup Window',
            koName: '팝업 모달 다이얼로그 창',
            category: 'Atoms',
            width: '300px',
            height: '200px',
            previewHtml: `<div style="display: flex; flex-direction: column; width: 80px; height: 55px; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 6px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); overflow: hidden; font-size: 8px; box-sizing: border-box;"><div style="background: #f0f0f0; height: 14px; display: flex; align-items: center; justify-content: space-between; padding: 0 4px; border-bottom: 1px solid #c8c8c8; font-weight: bold; color: #050505;"><span>Popup</span><span>&times;</span></div><div style="flex: 1; padding: 4px; background: transparent;"></div></div>`,
            html: `
            <div class="v4-shape v4-popup-container" data-header-bg="#f0f0f0" data-header-color="#050505" data-body-bg="#ffffff" data-border-color="#c8c8c8" style="width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; flex-direction: column; background: #ffffff; border: 1.6px solid #c8c8c8 !important; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.06); overflow: hidden;">
                <div class="v4-popup-header" style="height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; background: #f0f0f0; border-bottom: 1.6px solid #c8c8c8 !important; box-sizing: border-box; width: 100%; flex-shrink: 0; pointer-events: auto;">
                    <div contenteditable="true" class="v4-editable-cell v4-popup-title" style="font-size: 13px; font-weight: 400; color: #050505; outline: none; text-align: left; flex: 1; font-family: inherit;">Popup Title</div>
                    <span class="v4-popup-close" style="cursor: pointer; color: #969696; font-size: 16px; font-weight: bold; line-height: 1; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">&times;</span>
                </div>
                <div class="v4-popup-body" style="flex: 1; width: 100%; padding: 12px; box-sizing: border-box; background: transparent; position: relative;">
                    
                </div>
            </div>`
        },
        {
            id: 'v4-atom-button',
            name: 'Button',
            category: 'Atoms',
            width: '80px',
            height: '30px',
            previewHtml: `<div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 30px; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 8px; font-weight: bold; color: #050505; box-sizing: border-box;">Button</div>`,
            html: `
            <div class="v4-btn-container" data-text="버튼" data-btn-style="normal" data-btn-radius="6" data-font-size="13" style="position: relative; width: 100%; height: 100%; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
                <button class="v4-custom-btn style-normal" style="width: 100%; height: 100%; border: 1.6px solid #c8c8c8 !important; border-radius: 6px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); box-sizing: border-box; transition: all 0.2s; font-family: inherit;">버튼</button>
            </div>`
        },
        {
            id: 'v4-atom-datepicker',
            name: 'Date Picker',
            category: 'Atoms',
            width: '500px',
            height: '30px',
            previewHtml: `<div style="display:flex; align-items:center; background:#ffffff; border:1.6px solid #c8c8c8; border-radius:4px; height:20px; padding:0 5px; font-size:7px; color:#050505; box-sizing:border-box; gap:3px; white-space:nowrap;"><span>26/05/18</span><span style="color:#969696;">&#9553;</span><span>-</span><span style="color:#969696;">&#9553;</span><span>26/06/18</span></div>`,
            html: `
            <div class="v4-datepicker-container" data-show-presets="true" data-show-end-date="true" data-default-preset="1M" data-start-date="" data-end-date="" style="position: relative; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; pointer-events: auto; user-select: none; box-sizing: border-box; flex-wrap: nowrap; width: 100%; height: 100%;">
                <div class="v4-dp-fields" style="display: inline-flex; align-items: center; gap: 0; border: 1.6px solid #c8c8c8; border-radius: 8px; background: #ffffff; height: 100%; min-height: 30px; overflow: hidden; box-sizing: border-box; flex-shrink: 0;">
                    <div class="v4-dp-input-group" style="display: inline-flex; align-items: center; padding: 0 10px; gap: 6px; height: 100%;">
                        <div class="v4-dp-date-field v4-dp-start v4-editable-cell" contenteditable="true" style="font-size: 13px; font-weight: 400; color: #050505; outline: none; white-space: nowrap; min-width: 82px; font-family: inherit; -webkit-user-select: text; user-select: text;"></div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#969696" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 15px; height: 15px; flex-shrink: 0; pointer-events: none; background-image: none !important;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div class="v4-dp-separator" style="color: #969696; font-size: 13px; padding: 0 2px; flex-shrink: 0; font-family: inherit;">-</div>
                    <div class="v4-dp-input-group" style="display: inline-flex; align-items: center; padding: 0 10px; gap: 6px; height: 100%;">
                        <div class="v4-dp-date-field v4-dp-end v4-editable-cell" contenteditable="true" style="font-size: 13px; font-weight: 400; color: #050505; outline: none; white-space: nowrap; min-width: 82px; font-family: inherit; -webkit-user-select: text; user-select: text;"></div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#969696" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width: 15px; height: 15px; flex-shrink: 0; pointer-events: none; background-image: none !important;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                </div>
                <div class="v4-dp-presets" style="display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <button class="v4-dp-preset-btn" data-preset="1D" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid #c8c8c8; border-radius: 8px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">1D</button>
                    <button class="v4-dp-preset-btn" data-preset="1W" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid #c8c8c8; border-radius: 8px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">1W</button>
                    <button class="v4-dp-preset-btn v4-dp-preset-active" data-preset="1M" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid #1d4ed8; border-radius: 8px; background: #1d4ed8; color: #ffffff; font-size: 13px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">1M</button>
                    <button class="v4-dp-preset-btn" data-preset="6M" style="height: 30px; min-width: 36px; padding: 0 10px; border: 1.6px solid #c8c8c8; border-radius: 8px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">6M</button>
                    <button class="v4-dp-preset-btn" data-preset="all" style="height: 30px; min-width: 36px; padding: 0 12px; border: 1.6px solid #c8c8c8; border-radius: 8px; background: #ffffff; color: #050505; font-size: 13px; font-weight: 400; cursor: pointer; outline: none; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: inherit;">&#51204;&#52404;</button>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-toggle',
            name: 'Toggle Button',
            koName: '토글 버튼 스위치 toggle switch',
            category: 'Atoms',
            width: '40px',
            height: '20px',
            previewHtml: `<div style="width:30px; height:15px; border-radius:10px; background:#3b82f6; position:relative; display:flex; align-items:center; box-sizing:border-box; padding:2px;"><div style="width:11px; height:11px; border-radius:50%; background:#fff; position:absolute; right:2px;"></div></div>`,
            html: `
            <div class="v4-toggle-container" data-checked="false" data-color="#3b82f6" data-off-bg="#e6e6e6" style="position: relative; width: 100%; height: 100%; border-radius: 9999px; background: #e6e6e6; border: 1.6px solid #c8c8c8 !important; box-sizing: border-box; cursor: pointer; transition: all 0.2s; padding: 0;">
                <div class="v4-toggle-handle" style="position: absolute; top: 3.4px; left: 3.4px; height: calc(100% - 6.8px); aspect-ratio: 1 / 1; border-radius: 50%; background: #ffffff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transform: translateX(0);"></div>
            </div>`
        },
        {
            id: 'v4-atom-admin-settings',
            name: 'Query Item',
            koName: '조회 항목',
            category: 'Atoms',
            width: '1160px',
            height: '44px',
            previewHtml: `<div style="display:flex; align-items:center; border:1px solid #c8c8c8; background:#ffffff; padding:4px; width:80px; height:40px; box-sizing:border-box;"><div style="width:25px; height:100%; background:#f0f0f0; border-right:1px solid #c8c8c8;"></div><div style="flex:1; height:100%; background:#ffffff;"></div></div>`,
            html: `
            <div class="v4-admin-settings-container" data-row-count="1" data-row-height="44"
                 data-row1-label="조회 항목" data-row1-cols="1" data-row1-ratio="1:1" data-row1-type="textbox" data-row1-height="44" data-row1-required="false"
                 style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 8px; font-family: inherit; display: flex; flex-direction: column; overflow: hidden; isolation: isolate; contain: paint; -webkit-mask-image: -webkit-radial-gradient(white, black); mask-image: radial-gradient(white, black); transform: translateZ(0); pointer-events: auto;">
                <div class="v4-admin-settings-table" style="display: flex; flex-direction: column; width: 100%; height: 100%;">
                    <!-- Row 1 -->
                    <div class="v4-admin-row" style="display: flex; width: 100%; box-sizing: border-box; height: 44px;">
                        <div class="v4-admin-label-cell v4-editable-cell" contenteditable="true" style="width: 140px; background: #f0f0f0; display: flex; align-items: center; padding: 0 16px; font-size: 13px; font-weight: 400; color: #050505; border-right: 1.6px solid #c8c8c8; border-top-left-radius: 6.4px; border-bottom-left-radius: 6.4px; box-sizing: border-box; flex-shrink: 0; font-family: inherit; outline: none; cursor: text; user-select: text; -webkit-user-select: text;">조회 항목</div>
                        <div class="v4-admin-content-cell" style="flex: 1 1 0%; min-width: 0; display: flex; align-items: center; padding: 0 16px; box-sizing: border-box; border-right: 1.6px solid transparent;"></div>
                    </div>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-accordion',
            name: 'Accordion',
            category: 'Atoms',
            width: '180px',
            height: '36px',
            legacyName: 'Accordion UI'
        },
        {
            id: 'v4-atom-checkbox',
            name: 'Check Box',
            category: 'Atoms',
            width: '80px',
            height: '32px',
            legacyName: 'Check Box'
        },
        {
            id: 'v4-atom-radio',
            name: 'Radio Button',
            category: 'Atoms',
            width: '80px',
            height: '32px',
            legacyName: 'Radio Button'
        },
        {
            id: 'v4-atom-grid',
            name: 'Grid UI',
            category: 'Atoms',
            width: '600px',
            height: '400px',
            legacyName: 'Grid UI'
        },
        {
            id: 'v4-atom-searchbar',
            name: 'Search Bar',
            category: 'Atoms',
            width: '200px',
            height: '30px',
            legacyName: 'Search Bar'
        },
        {
            id: 'v4-atom-tab',
            name: 'Tab',
            category: 'Atoms',
            width: '360px',
            height: '40px',
            legacyName: 'Tab UI'
        },
        {
            id: 'v4-atom-cursor',
            name: 'Mouse Cursor',
            category: 'Atoms',
            width: '140px',
            height: '32px',
            previewHtml: `<div style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px; box-sizing: border-box;"><svg viewBox="0 0 24 24" fill="#ffffff" stroke="#050505" stroke-width="1.6" style="width: 16px; height: 16px;"><path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z"/></svg><span style="font-size: 8px; background: #1e293b; color: #fff; padding: 1px 4px; border-radius: 3px; font-weight: 500;">Click</span></div>`,
            html: `
            <div class="v4-cursor-container" data-cursor-type="default" data-cursor-text="Click Event" data-show-text="true" data-badge-style="dark" style="display: inline-flex; align-items: center; gap: 8px; width: 100%; height: 100%; box-sizing: border-box; pointer-events: auto; user-select: none;">
                <div class="v4-cursor-icon-wrap" style="width: 24px; height: 28px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                    <svg viewBox="0 0 24 24" class="lf-icon v4-cursor-svg" style="width: 24px; height: 24px; display: block; overflow: visible; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none;">
                        <path class="v4-cursor-path" d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" fill="#ffffff" stroke="#050505" stroke-width="1.6" stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="v4-cursor-desc-box" style="display: inline-flex; align-items: center; background: #1e293b; color: #ffffff; border: 1.6px solid #334155; border-radius: 6px; padding: 4px 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); box-sizing: border-box; min-width: 40px; width: max-content; flex-shrink: 0;">
                    <div contenteditable="true" class="v4-editable-cell v4-cursor-text" style="outline: none; font-size: 13px; font-weight: 500; font-family: inherit; color: #ffffff; white-space: nowrap; user-select: text; -webkit-user-select: text;">Click Event</div>
                </div>
            </div>`
        },
        {
            id: 'v4-atom-webeditor',
            name: 'Web Editor',
            koName: '웹 에디터 WYSIWYG 스마트에디터 리치텍스트',
            category: 'Atoms',
            width: '680px',
            height: '240px',
            previewHtml: `<div style="display:flex; flex-direction:column; width:80px; height:48px; background:#ffffff; border:1.6px solid #c8c8c8; border-radius:4px; overflow:hidden; box-sizing:border-box;"><div style="height:12px; background:#f0f0f0; border-bottom:1px solid #c8c8c8; display:flex; align-items:center; gap:2px; padding:0 4px; font-size:7px; color:#050505; font-weight:700;"><span>B</span><span>I</span><span>U</span></div><div style="flex:1; background:#ffffff;"></div></div>`,
            html: `
            <div class="v4-webeditor-container" data-toolbar-mode="full" data-editor-mode="editor" data-show-counter="true" data-max-length="2000" data-readonly="false" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; background: #ffffff; border: 1.6px solid #c8c8c8; border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; pointer-events: auto; font-family: inherit;">
                <div class="v4-webeditor-toolbar" style="height: 34px; min-height: 34px; background: #f0f0f0; border-bottom: 1px solid #c8c8c8; display: flex; align-items: center; padding: 0px 8px; gap: 4px; box-sizing: border-box; user-select: none; flex-shrink: 0; pointer-events: auto; opacity: 1;">
                    <select class="v4-webeditor-tool-font" style="height: 22px; font-size: 11px; border: 1px solid #c8c8c8; border-radius: 2px; background: #ffffff; color: #050505; padding: 0px 2px; outline: none; cursor: pointer; display: inline-block;">
                        <option value="돋움" selected>돋움</option>
                        <option value="굴림">굴림</option>
                        <option value="바탕">바탕</option>
                        <option value="맑은 고딕">맑은 고딕</option>
                        <option value="Arial">Arial</option>
                    </select>
                    <select class="v4-webeditor-tool-size" style="height: 22px; font-size: 11px; border: 1px solid #c8c8c8; border-radius: 2px; background: #ffffff; color: #050505; padding: 0px 2px; outline: none; cursor: pointer; display: inline-block;">
                        <option value="9pt">9pt</option>
                        <option value="10pt" selected>10pt</option>
                        <option value="11pt">11pt</option>
                        <option value="12pt">12pt</option>
                        <option value="14pt">14pt</option>
                        <option value="16pt">16pt</option>
                        <option value="18pt">18pt</option>
                    </select>
                    <div style="width: 1px; height: 16px; background: #c8c8c8; margin: 0 2px;"></div>
                    <button type="button" class="v4-webeditor-btn v4-tool-bold" title="굵게 (Bold)" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; font-size: 11px; font-weight: bold; color: #050505; display: inline-flex; align-items: center; justify-content: center; padding: 0;">가</button>
                    <button type="button" class="v4-webeditor-btn v4-tool-italic" title="기울임 (Italic)" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; font-size: 11px; font-style: italic; color: #050505; display: inline-flex; align-items: center; justify-content: center; padding: 0;">가</button>
                    <button type="button" class="v4-webeditor-btn v4-tool-underline" title="밑줄 (Underline)" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; font-size: 11px; text-decoration: underline; color: #050505; display: inline-flex; align-items: center; justify-content: center; padding: 0;">가</button>
                    <button type="button" class="v4-webeditor-btn v4-tool-strike" title="취소선 (Strikethrough)" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; font-size: 11px; text-decoration: line-through; color: #050505; display: inline-flex; align-items: center; justify-content: center; padding: 0;">가</button>
                    <div class="v4-webeditor-btn v4-tool-color-wrap" title="글자색" style="position: relative; width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
                        <span style="font-size: 10px; font-weight: bold; line-height: 1; color: #050505;">가</span>
                        <div class="v4-tool-color-bar" style="width: 12px; height: 2px; background: #050505; margin-top: 1px;"></div>
                    </div>
                    <div class="v4-webeditor-full-tools" style="display: inline-flex; align-items: center; gap: 4px;">
                        <div style="width: 1px; height: 16px; background: #c8c8c8; margin: 0 2px;"></div>
                        <button type="button" class="v4-webeditor-btn v4-tool-align-left" title="왼쪽 정렬" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0;"><svg viewBox="0 0 16 16" width="12" height="12" fill="#323232"><rect x="2" y="2" width="12" height="1.6"></rect><rect x="2" y="6" width="8" height="1.6"></rect><rect x="2" y="10" width="12" height="1.6"></rect><rect x="2" y="14" width="6" height="1.6"></rect></svg></button>
                        <button type="button" class="v4-webeditor-btn v4-tool-align-center" title="가운데 정렬" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0;"><svg viewBox="0 0 16 16" width="12" height="12" fill="#323232"><rect x="2" y="2" width="12" height="1.6"></rect><rect x="4" y="6" width="8" height="1.6"></rect><rect x="2" y="10" width="12" height="1.6"></rect><rect x="5" y="14" width="6" height="1.6"></rect></svg></button>
                        <button type="button" class="v4-webeditor-btn v4-tool-align-right" title="오른쪽 정렬" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0;"><svg viewBox="0 0 16 16" width="12" height="12" fill="#323232"><rect x="2" y="2" width="12" height="1.6"></rect><rect x="6" y="6" width="8" height="1.6"></rect><rect x="2" y="10" width="12" height="1.6"></rect><rect x="8" y="14" width="6" height="1.6"></rect></svg></button>
                        <button type="button" class="v4-webeditor-btn v4-tool-align-justify" title="양쪽 정렬" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0;"><svg viewBox="0 0 16 16" width="12" height="12" fill="#323232"><rect x="2" y="2" width="12" height="1.6"></rect><rect x="2" y="6" width="12" height="1.6"></rect><rect x="2" y="10" width="12" height="1.6"></rect><rect x="2" y="14" width="12" height="1.6"></rect></svg></button>
                        <div style="width: 1px; height: 16px; background: #c8c8c8; margin: 0 2px;"></div>
                        <button type="button" class="v4-webeditor-btn v4-tool-list-num" title="번호 매기기" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; font-size: 10px; font-weight: bold; color: #323232; display: inline-flex; align-items: center; justify-content: center; padding: 0;">1.</button>
                        <button type="button" class="v4-webeditor-btn v4-tool-list-bullet" title="글머리 기호" style="width: 22px; height: 22px; border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; font-size: 12px; color: #323232; display: inline-flex; align-items: center; justify-content: center; padding: 0;">&bull;</button>
                    </div>
                    <div class="v4-webeditor-photo-btn-wrap" style="margin-left: auto; display: flex; align-items: center;">
                        <button type="button" class="v4-webeditor-btn v4-tool-photo" title="사진 첨부" style="height: 22px; padding: 0 6px; border: 1px solid #c8c8c8; border-radius: 2px; background: #ffffff; font-size: 11px; color: #050505; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#323232" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <span>사진</span>
                        </button>
                    </div>
                </div>
                <div class="v4-webeditor-body" style="flex: 1 1 auto; min-height: 100px; position: relative; overflow-y: auto; background: #ffffff; box-sizing: border-box;">
                    <div contenteditable="true" class="v4-editable-cell v4-webeditor-content" style="width: 100%; min-height: 100%; padding: 12px; box-sizing: border-box; outline: none; font-size: 13px; line-height: 1.6; color: #050505; word-break: break-word; display: block;"></div>
                    <textarea class="v4-webeditor-html-source" style="display: none; width: 100%; height: 100%; padding: 12px; box-sizing: border-box; border: none; outline: none; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.5; color: #050505; background: #fafafa; resize: none; word-break: break-all;"></textarea>
                    <textarea class="v4-webeditor-plain-text" style="display: none; width: 100%; height: 100%; padding: 12px; box-sizing: border-box; border: none; outline: none; font-size: 13px; line-height: 1.6; color: #050505; background: #ffffff; resize: none; word-break: break-word;"></textarea>
                </div>
                <div class="v4-webeditor-statusbar" style="height: 28px; min-height: 28px; background: #fafafa; border-top: 1px solid #c8c8c8; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; box-sizing: border-box; user-select: none; flex-shrink: 0; font-size: 11px;">
                    <div style="flex: 1; display: flex; align-items: center;"></div>
                    <div class="v4-webeditor-resizer-bar" title="상하 드래그하여 입력창 크기 조절" style="display: inline-flex; align-items: center; justify-content: center; gap: 4px; color: #646464; font-size: 11px; cursor: ns-resize; padding: 2px 10px; border-radius: 3px; transition: background 0.15s; pointer-events: auto; opacity: 1;">
                        <span style="font-size: 12px; line-height: 1;">&#8661;</span>
                        <span>입력창 크기 조절</span>
                    </div>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                        <span class="v4-webeditor-counter" style="color: #969696; font-size: 11px; font-variant-numeric: tabular-nums; display: inline-block;">0 / 2000자</span>
                        <div class="v4-webeditor-modes" style="display: inline-flex; border: 1px solid #c8c8c8; border-radius: 3px; overflow: hidden; background: #ffffff;">
                            <button type="button" class="v4-webeditor-tab-btn v4-mode-editor active" data-mode="editor" style="height: 20px; padding: 0 8px; border: none; background: #f0f0f0; color: #050505; font-size: 10px; font-weight: 600; cursor: pointer; outline: none;">Editor</button>
                            <button type="button" class="v4-webeditor-tab-btn v4-mode-html" data-mode="html" style="height: 20px; padding: 0 8px; border: none; border-left: 1px solid #c8c8c8; background: #ffffff; color: #646464; font-size: 10px; font-weight: 500; cursor: pointer; outline: none;">HTML</button>
                            <button type="button" class="v4-webeditor-tab-btn v4-mode-text" data-mode="text" style="height: 20px; padding: 0 8px; border: none; border-left: 1px solid #c8c8c8; background: #ffffff; color: #646464; font-size: 10px; font-weight: 500; cursor: pointer; outline: none;">TEXT</button>
                        </div>
                    </div>
                </div>
            </div>`
        }
];
