/**
 * vctrl_component_inserter.js
 * Manages V4 component library insertion, image upload handlers, and atomic component injection.
 */
(function() {
    const notifyIframe = (data) => window.notifyIframe(data);

    window.insertV4ComponentById = function(id, customIdx) {
        if (id === 'v4-atom-image' || id === 'v4-shape-image') {
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
                     (lib.illustrations || []).find(i => i.id === id) ||
                     customMols.find(i => i.id === id);

        if (!item) return console.error("[V4] Component not found:", id);

        const isIllustration = item.category === 'Illustration' || (item.id && (item.id.startsWith('v4-ill-') || item.id.startsWith('v4-motion-')));
        const isIcon = !isIllustration && (item.id.includes('icon') || (item.html && (item.html.includes('<img') || item.html.includes('lf-icon'))));
        const style = { 
            width: item.width || (isIllustration ? '200px' : (isIcon ? '30px' : '120px')), 
            height: item.height || (isIllustration ? '200px' : (isIcon ? '30px' : '40px')) 
        };
        if (item.id === 'v4-search-bar' || item.id === 'v4-premium-gnb') {
            style.width = item.width || '100%';
            style.height = item.height || 'auto';
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

    window.insertTextComponent = function(customIdx) {
        return window.insertV4ComponentById('v4-tool-text', customIdx);
    };

    function createCrispImageDataUrl(imgEl, targetW, targetH, sharpenStrength) {
        try {
            const origW = imgEl.naturalWidth || imgEl.width || targetW;
            const origH = imgEl.naturalHeight || imgEl.height || targetH;
            if (!origW || !origH || !targetW || !targetH) return null;
            if (origW <= targetW * 1.1 && origH <= targetH * 1.1) return null;

            const amount = typeof sharpenStrength === 'number' ? sharpenStrength : 0.75;
            let curW = origW;
            let curH = origH;
            let curSource = imgEl;

            // Step 1: Progressive Step-Down Mipmap (prevents 2x2 bilinear pixel dropping on 1px borders/text)
            while (curW * 0.55 > targetW && curH * 0.55 > targetH) {
                const nextW = Math.max(targetW, Math.round(curW * 0.55));
                const nextH = Math.max(targetH, Math.round(curH * 0.55));
                const stepCanvas = document.createElement('canvas');
                stepCanvas.width = nextW;
                stepCanvas.height = nextH;
                const sCtx = stepCanvas.getContext('2d');
                sCtx.imageSmoothingEnabled = true;
                sCtx.imageSmoothingQuality = 'high';
                sCtx.drawImage(curSource, 0, 0, nextW, nextH);
                curSource = stepCanvas;
                curW = nextW;
                curH = nextH;
            }

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = targetW;
            finalCanvas.height = targetH;
            const ctx = finalCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(curSource, 0, 0, targetW, targetH);

            // Step 2: Unsharp Mask + Dark Text Stroke Contrast Preservation
            const imgData = ctx.getImageData(0, 0, targetW, targetH);
            const src = imgData.data;
            const dst = new Uint8ClampedArray(src);
            const stride = targetW * 4;

            for (let y = 1; y < targetH - 1; y++) {
                const rowOffset = y * stride;
                for (let x = 1; x < targetW - 1; x++) {
                    const idx = rowOffset + (x << 2);
                    for (let c = 0; c < 3; c++) {
                        const center = src[idx + c];
                        const neighbors = (
                            src[idx - stride + c] +
                            src[idx + stride + c] +
                            src[idx - 4 + c] +
                            src[idx + 4 + c]
                        ) >> 2;
                        const diff = center - neighbors;
                        let val = center + diff * amount;
                        if (diff < -6 && neighbors > 200) {
                            val -= (-diff) * 0.35;
                        }
                        dst[idx + c] = val < 0 ? 0 : (val > 255 ? 255 : Math.round(val));
                    }
                }
            }
            imgData.data.set(dst);
            ctx.putImageData(imgData, 0, 0);
            return finalCanvas.toDataURL('image/png');
        } catch (err) {
            console.warn('[ComponentInserter] Crisp image resampling fallback to original:', err);
            return null;
        }
    }

    window.createCrispImageDataUrl = createCrispImageDataUrl;

    window.processAndInsertRawImage = function(base64, onComplete) {
        if (!base64) return;
        const img = new Image();
        img.onload = function() {
            const origW = img.naturalWidth || 200;
            const origH = img.naturalHeight || 200;
            const naturalRatio = origW / origH;
            let w = origW;
            let h = origH;

            if (naturalRatio < 0.65) {
                w = Math.min(origW, 360);
                h = Math.round(w / naturalRatio);
                if (h > 760) {
                    h = 760;
                    w = Math.round(h * naturalRatio);
                }
            } else if (w > 780 || h > 540) {
                const scale = Math.min(780 / w, 540 / h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
            }
            const texW = Math.min(origW, Math.round(w * 1.15));
            const texH = Math.min(origH, Math.round(h * 1.15));
            const crispDataUrl = createCrispImageDataUrl(img, texW, texH, 0.75);
            const crispBase64 = crispDataUrl || base64;
            const crispKey = crispDataUrl ? (texW + 'x' + texH) : '';
            window.insertImageComponent(crispBase64, w + 'px', h + 'px', origW, origH, base64, crispKey);
            if (typeof onComplete === 'function') onComplete();
        };
        img.src = base64;
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
                    window.processAndInsertRawImage(evt.target.result);
                };
                reader.readAsDataURL(file);
                input.value = '';
            });
        }
        input.click();
    }

    window.insertImageComponent = function(base64, width, height, naturalWidth, naturalHeight, origBase64, crispSizeKey) {
        const targetId = 'v4-img-' + Date.now();
        const natW = naturalWidth || parseInt(width) || 200;
        const natH = naturalHeight || parseInt(height) || 200;
        const ratio = (natW && natH) ? (natW / natH).toFixed(4) : '1';
        const crispAttr = crispSizeKey ? ' data-crisp-size="' + crispSizeKey + '"' : '';
        try {
            const rootWin = window.top || window;
            if (!rootWin.__lf_orig_image_cache__) {
                rootWin.__lf_orig_image_cache__ = {};
                rootWin.__lf_orig_image_keys__ = [];
            }
            if (origBase64) {
                rootWin.__lf_orig_image_cache__[targetId] = origBase64;
                rootWin.__lf_orig_image_keys__.push(targetId);
                while (rootWin.__lf_orig_image_keys__.length > 20) {
                    const oldKey = rootWin.__lf_orig_image_keys__.shift();
                    if (oldKey) delete rootWin.__lf_orig_image_cache__[oldKey];
                }
            }
        } catch (err) {}
        const html = '<div class="v4-shape v4-shape-image" data-natural-width="' + natW + '" data-natural-height="' + natH + '" data-aspect-ratio="' + ratio + '"' + crispAttr + ' style="width: 100%; height: 100%; background-image: url(\'' + base64 + '\'); background-size: cover; background-position: center; background-repeat: no-repeat; box-sizing: border-box; border: 1.6px solid transparent; background-color: transparent !important;"></div>';
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
            className: '',
            dataset: {
                naturalWidth: natW,
                naturalHeight: natH,
                aspectRatio: ratio
            }
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

        const atomicTemplates = window.V4_ATOMIC_TEMPLATES || {};
        const brandLogoMap = window.V4_BRAND_LOGO_MAP || {};
        const svgMap = window.V4_ICON_SVG_MAP || {};

        if (atomicTemplates[name]) {
            contentHtml = atomicTemplates[name].html;
            defaultStyle = Object.assign({}, atomicTemplates[name].style);
        } else if (type === 'icon') {
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

    // Note: Canvas Background Controller has been decoupled to assets/vctrl_canvas_background.js (SSOT).
    window.ComponentInserter = {
        insertAtomicComponent: insertAtomicComponent,
        insertV4ComponentById: window.insertV4ComponentById,
        insertTextComponent: window.insertTextComponent,
        insertImageComponent: window.insertImageComponent,
        triggerImageFileUpload: triggerImageFileUpload,
        get openCanvasBackgroundModal() { return window.openCanvasBackgroundModal; },
        get applyCanvasBackground() { return window.applyCanvasBackground; },
        get removeCanvasBackground() { return window.removeCanvasBackground; }
    };
})();
