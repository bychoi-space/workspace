/**
 * vctrl_component_inserter.js
 * Manages V4 component library insertion, image upload handlers, and atomic component injection.
 */
(function() {
    const notifyIframe = (data) => window.notifyIframe(data);

    window.insertV4ComponentById = function(id, customIdx) {
        if (id === 'v4-atom-image') {
            triggerImageFileUpload();
            return;
        }
        const legacyMap = {
            'v4-atom-accordion': 'Accordion UI',
            'v4-atom-checkbox': 'Check Box',
            'v4-atom-radio': 'Radio Button',
            'v4-atom-grid': 'Grid UI',
            'v4-atom-searchbar': 'Search Bar',
            'v4-atom-tab': 'Tab UI'
        };
        if (legacyMap[id] && typeof window.insertAtomicComponent === 'function') {
            window.insertAtomicComponent('atom', legacyMap[id]);
            return;
        }

        const lib = window.V4_COMPONENT_LIBRARY;
        if (!lib) return console.error("[V4] Component Library not found.");

        const curState = window.state || window.parent.state || {};
        const customMols = curState.globalComponents || ((curState.projectMetadata && curState.projectMetadata.molecules) ? curState.projectMetadata.molecules : []);
        
        const item = (lib.atoms || []).find(i => i.id === id) || 
                     (lib.molecules || []).find(i => i.id === id) || 
                     (lib.organisms || []).find(i => i.id === id) ||
                     customMols.find(i => i.id === id);

        if (!item) return console.error("[V4] Component not found:", id);

        const isIcon = item.id.includes('icon') || (item.html && (item.html.includes('<img') || item.html.includes('lf-icon')));
        const style = { 
            width: item.width || (isIcon ? '30px' : '120px'), 
            height: item.height || (isIcon ? '30px' : '40px') 
        };
        if (item.id === 'v4-search-bar' || item.id === 'v4-premium-gnb') {
            style.width = '100%';
            style.height = 'auto';
        }
        if (item.id === 'v4-tool-text') {
            style.width = '120px';
            style.height = '30px';
        }

        const isTextTool = item.id === 'v4-tool-text';
        
        const isDescriptionPin = isTextTool && (customIdx !== undefined);
        const targetId = isTextTool 
            ? (isDescriptionPin ? ('v4-pin-' + customIdx) : ('v4-text-' + Date.now()))
            : ('v4-comp-' + Date.now());

        notifyIframe({
            type: 'LF_INSERT_COMPONENT',
            id: targetId,
            html: item.html,
            style: style,
            className: isDescriptionPin ? 'pin-marker' : (isTextTool ? 'v4-text-shape' : ''),
            isGroup: !!item.isGroup
        });
    };

    function triggerImageFileUpload() {
        let input = document.getElementById('v4-image-file-input');
        if (!input) {
            input = document.createElement('input');
            input.id = 'v4-image-file-input';
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64 = evt.target.result;
                    const img = new Image();
                    img.onload = function() {
                        let w = img.naturalWidth || 200;
                        let h = img.naturalHeight || 200;
                        const maxBound = 300;
                        if (w > maxBound || h > maxBound) {
                            const ratio = Math.min(maxBound / w, maxBound / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                        }
                        window.insertImageComponent(base64, w + 'px', h + 'px');
                    };
                    img.src = base64;
                };
                reader.readAsDataURL(file);
                input.value = '';
            });
        }
        input.click();
    }

    window.insertImageComponent = function(base64, width, height) {
        const targetId = 'v4-img-' + Date.now();
        const html = '<div class="v4-shape v4-shape-image" style="width: 100%; height: 100%; background-image: url(\'' + base64 + '\'); background-size: contain; background-position: center; background-repeat: no-repeat; box-sizing: border-box; border: 1.6px solid transparent; background-color: transparent !important;"></div>';
        const finalW = width || '200px';
        const finalH = height || '200px';
        const style = {
            width: finalW,
            height: finalH
        };
        notifyIframe({
            type: 'LF_INSERT_COMPONENT',
            id: targetId,
            html: html,
            style: style,
            className: ''
        });
    };

    const insertAtomicComponent = function(type, name) {
        const curState = window.state || (window.parent && window.parent.state) || {};
        if (curState.isReadOnly && typeof window.showAuthModal === 'function') return window.showAuthModal();
        if (!curState.activeFile && window.Notification && typeof window.Notification.alert === 'function') {
            return window.Notification.alert("Please select a screen first.", "Notice", "warning");
        }

        let contentHtml = '';
        const id = 'lf-comp-' + Date.now();
        let defaultStyle = { width: '120px', height: '100px' };

        if (name === 'SISUN Logo' || name === 'Workspace Logo') {
            contentHtml = '<svg viewBox="0 0 176 32" fill="currentColor" class="lf-icon v4-logo-img" style="width:100%; height:100%; background-image: none !important; pointer-events: none;"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, \'Montserrat\', \'Inter\', \'Arial Black\', sans-serif" font-weight="900" font-size="28" letter-spacing="-0.5px" fill="currentColor">SISUN.COM</text></svg>';
            defaultStyle = { width: '120px', height: '22px', color: '#000000' };
        } else if (name === 'Primary Button') {
            contentHtml = '<div style="background:#00e5ff; color:#0f172a; border:none; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:8px; font-weight:400; font-size:12px; font-family:inherit; box-shadow:0 4px 15px rgba(0,229,255,0.3); pointer-events:none;">BUTTON</div>';
            defaultStyle = { width: '120px', height: '36px' };
        } else if (name === 'LF Discount' || name === 'Special Discount') {
            contentHtml = '<div style="color:#E02020; font-size:24px; font-weight:800; font-family:sans-serif; text-align:center; pointer-events:none; line-height:1.2;">20%</div>';
            defaultStyle = { width: '60px', height: '30px' };
        } else if (name === 'Check Box') {
            contentHtml = '<div class="v4-checkbox-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-checkbox lf-icon" style="width:20px; height:20px; background:rgb(50, 50, 50); border:1.6px solid rgb(255, 255, 255); border-radius:6px; display:flex; align-items:center; justify-content:center; box-sizing:border-box; flex-shrink:0;"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:70%; height:70%; pointer-events:none;"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="v4-checkbox-text v4-editable-cell" contenteditable="true" style="color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">TEXT</div></div>';
            defaultStyle = { width: '80px', height: '30px' };
        } else if (name === 'Radio Button') {
            contentHtml = '<div class="v4-radio-container" data-checked="true" data-text-enabled="true" style="display:flex; align-items:center; gap:8px; width:100%; height:100%;"><div class="v4-radio lf-icon" style="width:20px; height:20px; background:rgb(50, 50, 50); border:1.6px solid rgb(255, 255, 255); border-radius:50%; display:flex; align-items:center; justify-content:center; box-sizing:border-box; flex-shrink:0;"><div class="v4-radio-dot" style="width:45%; height:45%; background:#ffffff; border-radius:50%; pointer-events:none;"></div></div><div class="v4-radio-text v4-editable-cell" contenteditable="true" style="color:var(--v4-text-color, #0f172a); font-size:12px; font-weight:400; font-family:inherit; white-space:nowrap; outline:none; -webkit-user-select:text; user-select:text;">TEXT</div></div>';
            defaultStyle = { width: '80px', height: '30px' };
        } else if (name === 'Accordion UI') {
            contentHtml = '<div class="v4-accordion-container" data-expanded="false" data-sub-count="3" style="width:100%; height:100%; display:flex; flex-direction:column; background:rgb(30, 41, 59); border:1.6px solid rgb(255, 255, 255); border-radius:8px; overflow:hidden; box-sizing:border-box;"><div class="v4-accordion-header" style="height:36px; padding:0 12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:rgba(255, 255, 255, 0.05); user-select:none; border-bottom:1.6px solid rgba(255,255,255,0.1); box-sizing:border-box; width:100%; flex-shrink:0;"><span class="v4-accordion-title-text" style="color:#ffffff; font-size:12px; font-weight:400; font-family:inherit; pointer-events:none;">Accordion Header</span><span class="v4-accordion-chevron" style="color:#ffffff; font-size:10px; pointer-events:none; transition:transform 0.2s;">▼</span></div><div class="v4-accordion-body" style="display:none; flex-direction:column; width:100%; box-sizing:border-box; background:rgba(0,0,0,0.15);"><div class="v4-accordion-item v4-editable-cell" contenteditable="true" style="padding:8px 12px; font-size:12px; font-weight:400; color:#cccccc; border-bottom:1.6px solid rgba(255,255,255,0.05); font-family:inherit; outline:none; -webkit-user-select:text; user-select:text;">Sub Item 1</div><div class="v4-accordion-item v4-editable-cell" contenteditable="true" style="padding:8px 12px; font-size:12px; font-weight:400; color:#cccccc; border-bottom:1.6px solid rgba(255,255,255,0.05); font-family:inherit; outline:none; -webkit-user-select:text; user-select:text;">Sub Item 2</div><div class="v4-accordion-item v4-editable-cell" contenteditable="true" style="padding:8px 12px; font-size:12px; font-weight:400; color:#cccccc; font-family:inherit; outline:none; -webkit-user-select:text; user-select:text;">Sub Item 3</div></div></div>';
            defaultStyle = { width: '180px', height: '36px' };
        } else if (name === 'Grid UI') {
            contentHtml = '<div class="v4-grid-container" data-pagination="true" data-row-count="5" data-columns="[{&quot;name&quot;:&quot;&quot;,&quot;type&quot;:&quot;checkbox&quot;,&quot;width&quot;:&quot;60px&quot;,&quot;align&quot;:&quot;center&quot;},{&quot;name&quot;:&quot;번호&quot;,&quot;type&quot;:&quot;number&quot;,&quot;width&quot;:&quot;80px&quot;,&quot;align&quot;:&quot;center&quot;},{&quot;name&quot;:&quot;항목명&quot;,&quot;type&quot;:&quot;text&quot;,&quot;width&quot;:&quot;460px&quot;,&quot;align&quot;:&quot;center&quot;}]" style="width:100%; height:100%; display:flex; flex-direction:column; background:#ffffff; border:1.6px solid rgb(226,232,240); border-radius:8px; overflow:hidden; box-sizing:border-box;"><div class="v4-grid-table-wrapper" style="width:100%; height:calc(100% - 36px); overflow:auto; box-sizing:border-box;"><table style="width:600px; min-width:600px; table-layout:fixed; border-collapse:collapse; background:#ffffff; box-sizing:border-box;"><colgroup><col style="width:60px;"><col style="width:80px;"><col style="width:460px;"></colgroup><thead><tr style="height:40px; background:#f8fafc; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box;"><th class="v4-grid-cell v4-grid-check-col" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0; font-weight:normal;" data-type="checkbox" data-align="center"><input type="checkbox"></th><th class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:500; color:#334155; font-family:inherit; user-select:none;" data-type="number" data-align="center">번호 ⇅</th><th class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:none; box-sizing:border-box; font-size:12px; font-weight:500; color:#334155; font-family:inherit; user-select:none;" data-type="text" data-align="center">항목명 ⇅</th></tr></thead><tbody style="box-sizing:border-box;"><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;" data-type="checkbox" data-align="center"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="number" data-align="center"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:none; box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="text" data-align="center"></td></tr><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;" data-type="checkbox" data-align="center"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="number" data-align="center"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:none; box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="text" data-align="center"></td></tr><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;" data-type="checkbox" data-align="center"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="number" data-align="center"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:none; box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="text" data-align="center"></td></tr><tr style="height:40px; border-bottom:1.6px solid rgb(226,232,240); box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;" data-type="checkbox" data-align="center"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="number" data-align="center"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:none; box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="text" data-align="center"></td></tr><tr style="height:40px; border-bottom:none; box-sizing:border-box; background:#ffffff;"><td class="v4-grid-cell" style="display:table-cell; vertical-align:middle; text-align:center; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; padding:0;" data-type="checkbox" data-align="center"><input type="checkbox"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:1.6px solid rgb(226,232,240); box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="number" data-align="center"></td><td class="v4-grid-cell v4-editable-cell" contenteditable="true" style="display:table-cell; vertical-align:middle; text-align:center; padding:0 8px; border-right:none; box-sizing:border-box; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit;" data-type="text" data-align="center"></td></tr></tbody></table></div><div class="v4-grid-footer" style="height:36px; padding:0 12px; display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border-top:1.6px solid rgb(226,232,240); box-sizing:border-box; width:100%; flex-shrink:0;"><span style="font-size:11px; color:#64748b; font-family:inherit;">1/27</span><div class="v4-grid-pages" style="font-size:11px; color:#64748b; cursor:pointer; font-family:inherit;">◀ 1 2 3 4 5 ▶</div><span style="font-size:11px; color:#64748b; font-family:inherit;">Page Size 100</span></div></div>';
            defaultStyle = { width: '600px', height: '400px' };
        } else if (name === 'Search Bar') {
            contentHtml = '<div class="v4-searchbar-container" data-placeholder="원스피어 통합검색" style="display:flex; align-items:center; justify-content:space-between; width:100%; height:100%; background:rgb(255, 255, 255); border:1.6px solid rgb(200, 200, 200); border-radius:9999px; padding:0 12px 0 16px; box-sizing:border-box; overflow:hidden; pointer-events:auto;"><div class="v4-searchbar-text v4-editable-cell" contenteditable="true" data-placeholder="원스피어 통합검색" style="flex:1; border:none; outline:none; background:transparent; font-size:12px; font-weight:400; color:var(--v4-text-color, #0f172a); font-family:inherit; min-width:0; padding:0; line-height:1.2; -webkit-user-select:text; user-select:text; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"></div><div class="v4-searchbar-icon-wrap" style="display:flex; align-items:center; justify-content:center; width:20px; height:20px; flex-shrink:0; margin-left:8px; pointer-events:none;"><svg viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%; background-image:none !important;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div></div>';
            defaultStyle = { width: '200px', height: '30px' };
        } else if (name === 'Tab UI') {
            contentHtml = '<div class="v4-tab-container" data-tab-count="3" data-active-index="0" data-accent-color="#2563eb" data-tabs="[{&quot;name&quot;:&quot;Dashboard&quot;,&quot;active&quot;:true},{&quot;name&quot;:&quot;Monitoring&quot;,&quot;active&quot;:false},{&quot;name&quot;:&quot;Activity&quot;,&quot;active&quot;:false}]" style="width:100%; height:100%; display:flex; flex-direction:row; background:#ffffff; border:1.6px solid rgb(226, 232, 240); border-radius:8px; overflow:hidden; box-sizing:border-box;"><div class="v4-tab-item active" data-index="0" style="flex:1 1 0; min-width:0; height:100%; display:flex; align-items:center; justify-content:center; position:relative; cursor:pointer; box-sizing:border-box; border-right:1.6px solid rgb(226, 232, 240); background:#ffffff; padding:0 8px; user-select:none; transition:background-color 0.15s ease;"><div class="v4-tab-indicator" style="position:absolute; top:0; left:0; right:0; height:3px; background:#2563eb; display:block; pointer-events:none; border-radius:2px 2px 0 0;"></div><span class="v4-tab-text v4-editable-cell" contenteditable="true" style="font-size:12px; font-family:inherit; color:#0f172a; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; outline:none; pointer-events:auto;">Dashboard</span></div><div class="v4-tab-item" data-index="1" style="flex:1 1 0; min-width:0; height:100%; display:flex; align-items:center; justify-content:center; position:relative; cursor:pointer; box-sizing:border-box; border-right:1.6px solid rgb(226, 232, 240); background:#f8fafc; padding:0 8px; user-select:none; transition:background-color 0.15s ease;"><div class="v4-tab-indicator" style="position:absolute; top:0; left:0; right:0; height:3px; background:#2563eb; display:none; pointer-events:none; border-radius:2px 2px 0 0;"></div><span class="v4-tab-text v4-editable-cell" contenteditable="true" style="font-size:12px; font-family:inherit; color:#64748b; font-weight:400; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; outline:none; pointer-events:auto;">Monitoring</span></div><div class="v4-tab-item" data-index="2" style="flex:1 1 0; min-width:0; height:100%; display:flex; align-items:center; justify-content:center; position:relative; cursor:pointer; box-sizing:border-box; border-right:none; background:#f8fafc; padding:0 8px; user-select:none; transition:background-color 0.15s ease;"><div class="v4-tab-indicator" style="position:absolute; top:0; left:0; right:0; height:3px; background:#2563eb; display:none; pointer-events:none; border-radius:2px 2px 0 0;"></div><span class="v4-tab-text v4-editable-cell" contenteditable="true" style="font-size:12px; font-family:inherit; color:#64748b; font-weight:400; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; outline:none; pointer-events:auto;">Activity</span></div></div>';
            defaultStyle = { width: '360px', height: '40px' };
        } else if (type === 'icon') {
            const svgMap = {
                'Home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
                'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
                'Menu': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
                'menu': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
                'Hamburger': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
                'hamburger': '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
                'Category': '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>',
                'category': '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>',
                'Brand': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',
                'brand': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',
                'Search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
                'search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
                'Cart': '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
                'cart': '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
                'Bag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
                'bag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
                'Shopping Bag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
                'shoppingbag': '<path d="M15.27 10.125V7.5C15.27 5.567 13.81 4 12 4C10.19 4 8.73 5.567 8.73 7.5V10.125M5.12 11.308C5.24 9.963 5.29 9.291 5.58 8.783C5.83 8.335 6.19 7.977 6.63 7.754C7.13 7.5 7.77 7.5 9.03 7.5H14.97C16.23 7.5 16.87 7.5 17.37 7.754C17.81 7.977 18.17 8.335 18.42 8.783C18.71 9.291 18.76 9.963 18.88 11.308L19.5 21H15.46H8.54H4.5L5.12 11.308Z"></path>',
                'Noti': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
                'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
                'Wishlist': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
                'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
                'My Page': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
                'my': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
                'Share': '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
                'Share Premium': '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
                'New Window': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
                'Download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
                'Zoom': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
                'zoom': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
                'Zoom In': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
                'zoomin': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
                '확대보기': '<path d="M7 2C5.33333 2 2 2 2 2V7"></path><path d="M22 7C22 5.33333 22 2 22 2L17 2"></path><path d="M17 22C18.6667 22 22 22 22 22L22 17"></path><path d="M2 17C2 18.6667 2 22 2 22L7 22"></path><path d="M18 18L15.1 15.1M16.6667 11.3333C16.6667 14.2789 14.2789 16.6667 11.3333 16.6667C8.38781 16.6667 6 14.2789 6 11.3333C6 8.38781 8.38781 6 11.3333 6C14.2789 6 16.6667 8.38781 16.6667 11.3333Z"></path>',
                'Copy': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
                'copy': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
                'Clipboard': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
                'clipboard': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
                '복사하기': '<path d="M7 2H14.89C17.38 2 18.62 2 19.57 2.48C20.41 2.91 21.09 3.59 21.52 4.43C22 5.38 22 6.62 22 9.11V17M5.56 22H14.56C15.8 22 16.42 22 16.9 21.76C17.32 21.54 17.66 21.2 17.87 20.79C18.11 20.31 18.11 19.69 18.11 18.44V9.44C18.11 8.2 18.11 7.58 17.87 7.1C17.66 6.68 17.32 6.34 16.9 6.13C16.42 5.89 15.8 5.89 14.56 5.89H5.56C4.31 5.89 3.69 5.89 3.21 6.13C2.8 6.34 2.46 6.68 2.24 7.1C2 7.58 2 8.2 2 9.44V18.44C2 19.69 2 20.31 2.24 20.79C2.46 21.2 2.8 21.54 3.21 21.76C3.69 22 4.31 22 5.56 22Z"></path>',
                'Global': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
                'global': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
                'Language': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
                'language': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
                'Globe': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
                'globe': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
                '글로벌': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
                'Camera': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                'camera': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                'Celeb': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                'celeb': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                'Photo': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                'photo': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                '카메라': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                '셀럽': '<rect x="2" y="2" width="20" height="20" rx="5.5"></rect><circle cx="12" cy="12" r="4.5"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
                'Recent': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
                'recent': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
                'Recent Seen': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
                'Clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
                'clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
                '최근본상품': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
                '최근': '<circle cx="12" cy="12" r="10"></circle><polyline points="7.5 7.5 12 13 17 10"></polyline>',
                'Gift': '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
                'Cust Gift': '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
                'Inquiry': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="15" x2="12.01" y2="15"></line>',
                'Cust 1to1': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="15" x2="12.01" y2="15"></line>',
                'Chatbot': '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line>',
                'Cust Chatbot': '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line>',
                'FAQ': '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
                'Cust FAQ': '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
                'Delivery': '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
                'Cust Truck': '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
                'Write Rv': '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
                'Rv Write': '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
                'My Rv': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
                'Rv My': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
                'Arrow Left': '<polyline points="15 18 9 12 15 6"></polyline>',
                'Arrow L': '<polyline points="15 18 9 12 15 6"></polyline>',
                'Arrow Right': '<polyline points="9 18 15 12 9 6"></polyline>',
                'Arrow R': '<polyline points="9 18 15 12 9 6"></polyline>',
                'Arrow Up': '<polyline points="18 15 12 9 6 15"></polyline>',
                'Arrow U': '<polyline points="18 15 12 9 6 15"></polyline>',
                'Arrow Down': '<polyline points="6 9 12 15 18 9"></polyline>',
                'Arrow D': '<polyline points="6 9 12 15 18 9"></polyline>',
                'Close X': '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
                'Close': '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
                'Login': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="10 17 5 12 10 7"></polyline><line x1="21" y1="12" x2="5" y2="12"></line>',
                'Logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
                'Sign Up': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line>',
                'Insight': '<path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
                'insight': '<path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
                '인사이트': '<path d="M15 14c.8-.8 1.5-1.8 1.8-2.9a6 6 0 1 0-9.6 0c.3 1.1 1 2.1 1.8 2.9"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>',
                'Hypothesis': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
                'hypothesis': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
                'Hypotheses': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
                'hypotheses': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
                '가설': '<path d="M10 2v7.31L4.15 18.5A2 2 0 0 0 5.86 21.5h12.28a2 2 0 0 0 1.71-3L14 9.31V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
                'List': '<line x1="3" y1="6" x2="6" y2="6"></line><line x1="10" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="6" y2="12"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="6" y2="18"></line><line x1="10" y1="18" x2="21" y2="18"></line>',
                'list': '<line x1="3" y1="6" x2="6" y2="6"></line><line x1="10" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="6" y2="12"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="6" y2="18"></line><line x1="10" y1="18" x2="21" y2="18"></line>',
                '목록': '<line x1="3" y1="6" x2="6" y2="6"></line><line x1="10" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="6" y2="12"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="6" y2="18"></line><line x1="10" y1="18" x2="21" y2="18"></line>',
                '리스트': '<line x1="3" y1="6" x2="6" y2="6"></line><line x1="10" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="6" y2="12"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="6" y2="18"></line><line x1="10" y1="18" x2="21" y2="18"></line>'
            };

            const LOGO_DATA = {
                michaa: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAydpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmE2YTYzOTY4YSwgMjAyNC8wMy8wNi0xMTo1MjowNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjExIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxNUEzNThGNzZBNUMxMUVGQTI4ODk2MTFFMjFDQ0I1MCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxNUEzNThGODZBNUMxMUVGQTI4ODk2MTFFMjFDQ0I1MCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE1QTM1OEY1NkE1QzExRUZBMjg4OTYxMUUyMUNDQjUwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjE1QTM1OEY2NkE1QzExRUZBMjg4OTYxMUUyMUNDQjUwIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+V5ZaJgAAAzRJREFUeNrsW19oT1Ecv9c27IGi8KLIEmp5Wp7kyYOotT3KA1GSJyGazZ+GsCVZqy2JBy8eKSVSUl4QIvkTwsoiKQuNMdfn5JS7X7vfc+/5nX/b/X7r07d+53vO+d7POed7z/d7tzhJkqjMMiUquTABTAATwAQwAUwAE8AEMAFMABPABJRSait/iON4R4H+Ipc+g5R62NcDwN/NUDMLdLkOf5/+f4IkGQP5UEXQWTmGK0DWaPi7KT2GiSOwB6vQ4GHla6C6Q4gB04AeD7t/C9AYShBcixVpdrj6M8TRC+0tcBqO1TviYC8wLzQCFgJtDlZ/PtSuUO8BLgLiMWC6bwK++giIILcJakNG87BLAg4DvzwExJOCh4y2HpcEvAT6XAZEjNcKtSqjeQg47joGdMqJrQdEPHwd1AlqZ+BW98UpAZjwM9QRRwFxO7A4o034ccrXW6AXeGczIILEWVAHCJOjWIxvXgjAxD+g9lm+IXYAszPaBoH+qMqH0MkGW1L2IirfI2zfAPWa2d4iYIQYe5uG72azweTfzDst3RC7gLqMttfAucjAA1S1A1L9LhH24qg0FFz9lQofNmr6brwekE5QRk0ERMSNWF56suQZcCGoXABsvlAEpCIBcT2wgmjfj/n+mHLcyBGQfefIy5F2QJSJzltijIdik2T09XoExICfZLZWTUAURdkFRHtbYvIPm0zuANlf5AADOgERMlexg24rdo/fHSAJFWlpu2YN8VBEl7g7IgsOG90BcgxB7H3FGM0VfZYBvwn7azlenf53gCRVROjdBWuIosRdQ0V+G75a+zQGEm5CXVEExHb53l8NtY6wvYzx7tpy1PgRSI21VLGtfwJLgEeEjdhNjTnnC+MIpMh9DnWWMJkK3AKWEzYXMc4TWz66+Dp8EKDydaq+P6qoBYRPAFbvo6KcRcl59H81oQlIVXPfF+wzIqvP0YQnIMflaDzpQ7+BSUGAFJG+Ps5p+z3SLHMHS4C8HOX9ptcL+w+TigBJwg2oqwqzIVerL6R2nN9ac/S7U8WcW4Emon1Q9yNHTt8fjKk+8f8MlVyYACaACWACmAAmgAlgApiAsspfAQYABFvFgwXFYI0AAAAASUVORK5CYII=',
                ebm: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAydpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmE2YTYzOTY4YSwgMjAyNC8wMy8wNi0xMTo1MjowNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjExIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQzRBRkI0MDZBNUMxMUVGOEUwQkZDREM4MUUwRjIzMiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQzRBRkI0MTZBNUMxMUVGOEUwQkZDREM4MUUwRjIzMiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBDNEFGQjNFNkE1QzExRUY4RTBCRkNEQzgxRTBGMjMyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjBDNEFGQjNGNkE1QzExRUY4RTBCRkNEQzgxRTBGMjMyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Q6jLIgAAAuZJREFUeNrsm89LFGEYx99ZV1374UaUWwchQojADhJ1idiL0B/Q6qFLd49Bh4hQpLNEECl0iKSLN0/dgw7VRS/hQUEPIUph2KqtmdP34X0WpmFmdtd5Z1+neR748s6+M/PuO593nnfeefZZx3VdlWXLqYybABAAAkAACIAsW977wXGcJygmmzyXFhA7vjoH2od+BRxfY/ltDzoIaHsX+sNt1ts+4Pq6PcI65kssArQQqou/ZJY7kAaVvf0/inI+GNToDJNPgx0mMQcsQr8zOQewkY9tQ4WI8+gOofmi6vHRuNbF8hv14zQ0AN2ASkkDyPkmmjAAL+Ax20mPECZmAtwJ9ULnoJvQOHSZ5wHjAFSTDXe24xbleYmeLN9YS2DyAeU0dCIpAE0Nji2/BZMVQHiMza82AVg1QPgkK0EBIAAEgAAQAAJAAAgAASAAsgPA0VaAcrYB/LDEoAyNmmosHwPcQ4zCd6XDZ3FejQst9OMCdBd6h7fBNzYB0HkTSoep40ZlOloA2M3lvO07gCwshteWcMBxAFA12RHPhfnbdNjlOthdjEaijgqA/P6a0jE6kx2qwbf3fbM+xR7PQlegCnRfGYxH5mOM1E90tpr4ve66BHuD9R5APqIs0bPQNZDfk8ag6Bx0kr/fKgA7s5++I4ytQWQpLAAEgAAQAAJAAAgAASAABIAASJXhbfgqdD6TAHDh9DpMKb1DDY7rhnqhIp0TFEqPA2DXwoV3Qf3YfKl0dKgWcewgirfQJr8+L0BjqD/VKB5AQYZGIScKRpTRWLt+G6D+UILkdege1M/1hyEXf1HpNLpbnmpKtHyudHht0htg8CdM9yidKZqGZOnbQQnQsJGIc9ZCk6XZLikDCYiWrRixr6/RHFD5Dx6PUa65FQoAvjOM4oGymAXaooXFNCmV9nPIvldRDZyBnqnj/3+B+gAtB+2Eb69jMMew+RS6w9Wr0BT0+p+G5K+zshQWAAIgy/ZXgAEA7i5IoO7sjdQAAAAASUVORK5CYII=',
                itmichaa: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAydpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmE2YTYzOTY4YSwgMjAyNC8wMy8wNi0xMTo1MjowNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjExIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4QUEyQjUzNzZBNjMxMUVGODVFQkQyNTg2QjlGRDg1MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4QUEyQjUzODZBNjMxMUVGODVFQkQyNTg2QjlGRDg1MiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhBQTJCNTM1NkE2MzExRUY4NUVCRDI1ODZCOUZEODUyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjhBQTJCNTM2NkE2MzExRUY4NUVCRDI1ODZCOUZEODUyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+mFUf1AAAAuNJREFUeNrsm01IFVEUx2fymqk80JQMa1FJm0QKBEX8WBS1aFGLCEyCigIjJHUrgboTDFq5clFu/IigWrRo4cJFtUykxMBE+9i4Cj94kZOv/+Hd1ePN3Kszt3nMPRf+nPfenHc/fnPPvWfgjpvJZBybywHH8sIAGAADYABWF+F3wXVdrQpKhaiC6YMuQpXQN2gamkh7nmeq42i3CGYDOoZ2fu27IsoD8kmzE/XQTyiTR7NQmUEADbKdilhCAA0fgnkN1fq4nIeeGJy9TXGvAZ1QncLnLkAdNQSgI24ArRo+FKcthgBciBtAStOv3ED8N9LiFzeAr5p+qwbu/vVCyANmaBNR+KxAHyK++7R134wdAPbeBZjRAJddqBt+fyO++9eimv5R5AEu9AhK5+QA36FLBmJfQF9y2gqVB7h+g9XNBGXHDsO0yUxwDXqPO//HAIBBmKGcnyvDZIKRAPgfBYO/AvMyT9iGAlDwD0MyzO7j4wsT/RUFPHCK7cvQQ6jZVDu+IVBWXHwO5rbi/w2KRGcH07M9YJC0UHbJryWyrgq5yp+k/mmMYQpSrTfv0I/xvc6A01Cv4Rt9BroVso4bmn57BrAIDSsqpdisCdH5Oahf8cSnGuAApSUKn0UjuwCm8DzMWUXC5IZYBygEnyrckr0LmC4MoMD7V2Q7gBSHAANgAAyAATAABsAAGAADYAAMgAEwAAbAABgAA2AAVgEosR1Aqe0AdmwHsKXhk0oygB8aPuVJBvBRw+dUYgGkPY/OGX5SuHUkeQZQGVFcvyffWUgsgEnoecB1GvwbQKjdT+VBZ4QewBxR/F/nhEjQKZNXmObzymRAiIMwj6Eex//c0DY05mTPDC2g3t2wAD472TM8JssddPSZdlYkBJ1G6YauOv4valDZhJahdeg3RC939KCt5ahnwAlZeVBZCjsDfGAch6l3sqfJqmUouFKehLAtcwkC8RZtbWkD4IchBsAArCj/BBgA+yjaQ12LP0AAAAAASUVORK5CYII='
            };

            const brandLogoMap = {
                'MICHAA Logo': LOGO_DATA.michaa,
                'MICHAA': LOGO_DATA.michaa,
                'michaa': LOGO_DATA.michaa,
                '미샤': LOGO_DATA.michaa,
                '미샤 로고': LOGO_DATA.michaa,
                'EBM Logo': LOGO_DATA.ebm,
                'EBM': LOGO_DATA.ebm,
                'E.B.M': LOGO_DATA.ebm,
                'ebm': LOGO_DATA.ebm,
                '이비엠': LOGO_DATA.ebm,
                '이비엠 로고': LOGO_DATA.ebm,
                'it MICHAA Logo': LOGO_DATA.itmichaa,
                'it MICHAA': LOGO_DATA.itmichaa,
                'itmichaa': LOGO_DATA.itmichaa,
                'it michaa': LOGO_DATA.itmichaa,
                '잇미샤': LOGO_DATA.itmichaa,
                '잇미샤 로고': LOGO_DATA.itmichaa
            };

            if (name === 'SISUN Logo' || name === 'Workspace Logo') {
                contentHtml = '<svg viewBox="0 0 176 32" fill="currentColor" class="lf-icon v4-logo-img" style="width:100%; height:100%; background-image: none !important; pointer-events: none;"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, \'Montserrat\', \'Inter\', \'Arial Black\', sans-serif" font-weight="900" font-size="28" letter-spacing="-0.5px" fill="currentColor">SISUN.COM</text></svg>';
                defaultStyle = { width: '120px', height: '22px', color: '#000000' };
            } else if (brandLogoMap[name]) {
                const logoPath = brandLogoMap[name];
                contentHtml = '<div class="lf-icon v4-logo-img" style="width:100%; height:100%; box-sizing:border-box; padding:2px !important; background-origin:content-box !important; background-clip:content-box !important; mask-origin:content-box !important; -webkit-mask-origin:content-box !important; mask-clip:content-box !important; -webkit-mask-clip:content-box !important; -webkit-mask-image:url(\'' + logoPath + '\'); mask-image:url(\'' + logoPath + '\'); -webkit-mask-size:contain; mask-size:contain; -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat; -webkit-mask-position:center; mask-position:center; background-color:currentColor !important; pointer-events:none;"></div>';
                defaultStyle = { width: '30px', height: '30px', color: '#000000' };
            } else if (svgMap[name]) {
                contentHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%; padding:3px; box-sizing:border-box; background-image: none !important;">' + svgMap[name] + '</svg>';
                defaultStyle = { width: '30px', height: '30px', color: '#000000' };
            } else {
                contentHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="lf-icon" style="width:100%; height:100%; padding:3px; box-sizing:border-box; background-image: none !important;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                defaultStyle = { width: '30px', height: '30px', color: '#000000' };
            }
        }

        const DOM = window.DOM || {};
        const activeIframe = DOM.iframe || document.getElementById('main-iframe') || document.getElementById('screen-iframe');
        if (activeIframe && activeIframe.contentWindow) {
            if (window.MessageHub) {
                window.MessageHub.send(activeIframe.contentWindow, 'LF_INSERT_V4_COMP', { id, html: contentHtml, style: defaultStyle });
            } else {
                activeIframe.contentWindow.postMessage({ type: 'LF_INSERT_V4_COMP', id, html: contentHtml, style: defaultStyle }, '*');
            }
        }
    };

    window.insertAtomicComponent = insertAtomicComponent;

    window.ComponentInserter = {
        insertAtomicComponent: insertAtomicComponent,
        insertV4ComponentById: window.insertV4ComponentById,
        insertImageComponent: window.insertImageComponent,
        triggerImageFileUpload: triggerImageFileUpload
    };
})();
