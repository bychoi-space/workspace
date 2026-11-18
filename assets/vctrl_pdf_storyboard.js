/**
 * bychoi workspace - PDF Storyboard Description Renderer & Pin Reconciler (Parent Side)
 * Decoupled from vctrl_pdf_exporter.js for single responsibility and low complexity.
 * Handles pin marker reconciliation onto PDF DOM, right-hand 400px DESCRIPTION panel rendering, and side-by-side canvas compositing.
 */

const PDF_DESC_PANEL_WIDTH = 400;
window.PDF_DESC_PANEL_WIDTH = PDF_DESC_PANEL_WIDTH;

function normalizeScreenDescriptions(screenInfo) {
    if (!screenInfo) return [];
    if (Array.isArray(screenInfo.description)) {
        return screenInfo.description;
    }
    if (typeof screenInfo.description === 'string' && screenInfo.description.trim()) {
        return [{ type: 'pin', text: screenInfo.description.trim(), x: 50, y: 50 }];
    }
    return [];
}
window.normalizeScreenDescriptions = normalizeScreenDescriptions;

function _ensurePdfPinLayer(iframeDoc, container) {
    if (!container) return null;
    let layer = container.querySelector(':scope > .v4-pin-layer');
    if (!layer) {
        layer = iframeDoc.createElement('div');
        layer.className = 'v4-pin-layer';
        layer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:250000!important;';
        container.appendChild(layer);
    }
    return layer;
}

function _upsertPdfPinMarker(iframeDoc, parentLayer, pinId, number, x, y) {
    let pin = iframeDoc.getElementById(pinId);
    if (!pin) {
        pin = iframeDoc.createElement('div');
        pin.id = pinId;
        pin.className = 'bychoi-component pin-marker';
        parentLayer.appendChild(pin);
    } else if (pin.parentElement !== parentLayer) {
        parentLayer.appendChild(pin);
    }

    pin.classList.remove('selected', 'pin-active-pulse');
    pin.removeAttribute('data-scroll-fixed');
    pin.style.position = 'absolute';
    pin.style.width = '20px';
    pin.style.height = '20px';
    pin.style.left = `${Math.round(Number(x) || 0)}px`;
    pin.style.top = `${Math.round(Number(y) || 0)}px`;
    pin.style.removeProperty('transform');
    pin.style.setProperty('z-index', '200000', 'important');
    pin.innerHTML = `<div class="pin-number-badge" style="pointer-events:none; font-weight:600; font-size:11.5px; line-height:1; color:#ffffff; text-align:center;">${number}</div>`;
}

function _reconcileResponsivePinsInPdfDom(iframeDoc, safePins) {
    const isMobileCompare = !!(iframeDoc.querySelector('.mobile-compare-page') || (iframeDoc.querySelector('.mobile-column-left') && iframeDoc.querySelector('.mobile-column-right')));
    const isPcMobile = !!(iframeDoc.querySelector('.pc-content-inner') && iframeDoc.querySelector('.mobile-content-inner'));
    const isAdminPc = !isPcMobile && !isMobileCompare && !!iframeDoc.querySelector('.pc-content-inner');

    let frame1 = null;
    let frame2 = null;
    let f1Type = 'pc';
    let f2Type = 'mobile';
    const ground = iframeDoc.querySelector('.mobile-compare-page, .page, #canvas-page, .canvas') || iframeDoc.body;

    if (isMobileCompare) {
        const leftCol = iframeDoc.querySelector('.mobile-column-left');
        const rightCol = iframeDoc.querySelector('.mobile-column-right');
        frame1 = leftCol ? (leftCol.querySelector('.mobile-content-inner') || leftCol.querySelector('.mobile-content-area, .mobile-content')) : null;
        frame2 = rightCol ? (rightCol.querySelector('.mobile-content-inner') || rightCol.querySelector('.mobile-content-area, .mobile-content')) : null;
        f1Type = 'left';
        f2Type = 'right';
    } else if (isPcMobile) {
        frame1 = iframeDoc.querySelector('.pc-content-inner') || iframeDoc.querySelector('.pc-content-area, .pc-content');
        frame2 = iframeDoc.querySelector('.mobile-content-inner') || iframeDoc.querySelector('.mobile-content-area, .mobile-content');
        f1Type = 'pc';
        f2Type = 'mobile';
    } else if (isAdminPc) {
        frame1 = iframeDoc.querySelector('.pc-content-inner') || iframeDoc.querySelector('.pc-content-area, .pc-content');
        f1Type = 'pc';
    }

    const validIds = new Set();
    safePins.forEach((item, idx) => {
        const isGround = item.target === 'canvas' && (!item.pins || (!item.pins.left && !item.pins.right && !item.pins.pc && !item.pins.mobile));
        if (isGround) {
            validIds.add(`v4-pin-canvas-${idx}`);
        } else {
            if (frame1) validIds.add(`v4-pin-${f1Type}-${idx}`);
            if (frame2) validIds.add(`v4-pin-${f2Type}-${idx}`);
        }
    });

    iframeDoc.querySelectorAll('.pin-marker, [id^="v4-pin-"]').forEach((p) => {
        if (!validIds.has(p.id)) p.remove();
    });

    safePins.forEach((item, idx) => {
        const num = idx + 1;
        const isGround = item.target === 'canvas' && (!item.pins || (!item.pins.left && !item.pins.right && !item.pins.pc && !item.pins.mobile));
        if (isGround) {
            const canPos = (item.pins && item.pins.canvas) ? item.pins.canvas : { x: item.x || 790, y: item.y || 450 };
            const gLayer = _ensurePdfPinLayer(iframeDoc, ground);
            if (gLayer) _upsertPdfPinMarker(iframeDoc, gLayer, `v4-pin-canvas-${idx}`, num, canPos.x, canPos.y);
            return;
        }

        let p1Pos, p2Pos;
        if (isMobileCompare) {
            p1Pos = item.pins?.left || item.pins?.pc || { x: item.x ?? 0, y: item.y ?? 250 };
            p2Pos = item.pins?.right || item.pins?.mobile || { x: item.x ?? 0, y: item.y ?? 250 };
        } else {
            p1Pos = item.pins?.pc || { x: item.x ?? 570, y: item.y ?? 180 };
            p2Pos = item.pins?.mobile || { x: 170, y: 180 };
        }

        if (frame1) {
            const layer1 = _ensurePdfPinLayer(iframeDoc, frame1);
            if (layer1) _upsertPdfPinMarker(iframeDoc, layer1, `v4-pin-${f1Type}-${idx}`, num, p1Pos.x, p1Pos.y);
        }
        if (frame2) {
            const layer2 = _ensurePdfPinLayer(iframeDoc, frame2);
            if (layer2) _upsertPdfPinMarker(iframeDoc, layer2, `v4-pin-${f2Type}-${idx}`, num, p2Pos.x, p2Pos.y);
        }
    });
}

function _reconcileStandardPinsInPdfDom(iframeDoc, safePins) {
    const host = iframeDoc.querySelector('.canvas, .page, #canvas-page, #canvas') || iframeDoc.body;
    const validStdIds = new Set(safePins.map((_, idx) => `v4-pin-${idx}`));
    iframeDoc.querySelectorAll('.pin-marker, [id^="v4-pin-"]').forEach((p) => {
        if (!validStdIds.has(p.id)) p.remove();
    });

    const hostLayer = _ensurePdfPinLayer(iframeDoc, host);
    safePins.forEach((pin, idx) => {
        let xVal = parseFloat(pin.x) || 0;
        let yVal = parseFloat(pin.y) || 0;
        if (!pin.standardized && xVal <= 100 && yVal <= 100) {
            xVal = xVal * 14.4;
            yVal = yVal * 9.0;
        }

        const isPinType = (pin.type === 'pin' || pin.type === undefined);
        if (isPinType) {
            _upsertPdfPinMarker(iframeDoc, hostLayer || host, `v4-pin-${idx}`, idx + 1, xVal, yVal);
        } else {
            let txtDiv = iframeDoc.getElementById(`v4-pin-${idx}`);
            if (!txtDiv) {
                txtDiv = iframeDoc.createElement('div');
                txtDiv.id = `v4-pin-${idx}`;
                txtDiv.className = 'bychoi-component text-marker';
                (hostLayer || host).appendChild(txtDiv);
            }
            txtDiv.style.cssText = `position:absolute; left:${Math.round(xVal)}px; top:${Math.round(yVal)}px; width:fit-content; height:auto; z-index:200000!important;`;
            txtDiv.innerHTML = `<div class="v4-editable-cell" style="outline:none; color:${pin.color || '#0f172a'};">${pin.html || pin.text || ''}</div>`;
        }
    });
}

function reconcilePinsInPdfDom(iframeDoc, descriptions, isResponsive) {
    if (!iframeDoc) return;
    const safePins = Array.isArray(descriptions) ? descriptions : [];

    iframeDoc.querySelectorAll('.selected, .pin-active-pulse').forEach((el) => {
        el.classList.remove('selected', 'pin-active-pulse');
    });

    if (safePins.length === 0) {
        iframeDoc.querySelectorAll('.pin-marker, [id^="v4-pin-"]').forEach((p) => p.remove());
        return;
    }

    if (isResponsive) {
        _reconcileResponsivePinsInPdfDom(iframeDoc, safePins);
    } else {
        _reconcileStandardPinsInPdfDom(iframeDoc, safePins);
    }
}
window.reconcilePinsInPdfDom = reconcilePinsInPdfDom;

function _formatPinDescriptionHtmlForPdf(item) {
    if (!item) return '<span style="color:#64748b;">(내용 없음)</span>';
    const isLegacyDummyHtml = Boolean(
        item.html && (
            item.html.indexOf('v4-editable-cell') !== -1 ||
            (item.html.indexOf('Edit Text') !== -1 && item.text && item.text !== 'Edit Text')
        )
    );

    if (item.html && typeof item.html === 'string' && item.html.trim().length > 0 && !isLegacyDummyHtml) {
        return item.html.replace(
            /color\s*:\s*(?:#000000|#000|#050505|#0f172a|#1e293b|rgb\(\s*(?:0|5|15)\s*,\s*(?:0|5|23)\s*,\s*(?:0|5|42)\s*\)|var\(--v4-text-color[^\x29]*\))/gi,
            'color: #e2e8f0'
        );
    }
    if (item.text && typeof item.text === 'string' && item.text.trim().length > 0) {
        return window.escapeHtmlAttr(item.text).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
    }
    return '<span style="color:#64748b;">(내용 없음)</span>';
}

function _resolvePinFixedBadgeText(item) {
    if (!item) return '';
    const hasFixedHost = !!(item.fixedHost || (item.pins && ((item.pins.pc && item.pins.pc.fixedHost) || (item.pins.mobile && item.pins.mobile.fixedHost))));
    const isViewportFixed = (item.scrollFixed && item.scrollFixed !== 'none') ||
                            (item.pins?.pc?.scrollFixed && item.pins.pc.scrollFixed !== 'none') ||
                            (item.pins?.mobile?.scrollFixed && item.pins.mobile.scrollFixed !== 'none');
    if (hasFixedHost) return '오브젝트 고정';
    if (isViewportFixed) return '화면 고정';
    return '';
}

function _getPdfDescriptionStylesheet(panelWidth, minHeightPx) {
    return `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
            width: ${panelWidth}px;
            min-height: ${minHeightPx}px;
            background: #131722;
            color: #e2e8f0;
            font-family: 'Pretendard Variable', Pretendard, 'Noto Sans KR', 'Inter', -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .pdf-desc-shell {
            width: ${panelWidth}px;
            min-height: ${minHeightPx}px;
            padding: 22px 20px 26px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            background: #131722;
        }
        .pdf-desc-top-header {
            padding-bottom: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .pdf-desc-eyebrow-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .pdf-desc-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #f87171;
            text-transform: uppercase;
        }
        .pdf-desc-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #ef4444;
            display: inline-block;
        }
        .pdf-desc-count {
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2px 8px;
            border-radius: 999px;
        }
        .pdf-desc-screen-title {
            font-size: 14px;
            font-weight: 700;
            color: #f8fafc;
            line-height: 1.35;
            word-break: keep-all;
            overflow-wrap: break-word;
        }
        .pdf-desc-screen-idx {
            color: #818cf8;
            font-weight: 800;
            margin-right: 4px;
        }
        .pdf-desc-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .pdf-desc-card {
            background: #1a2030;
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 10px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .pdf-desc-card-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .pdf-desc-card-head-left {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .pdf-desc-pin-badge {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #ef4444;
            background-image: linear-gradient(135deg, #ef4444, #dc2626);
            border: 1.5px solid #ffffff;
            color: #ffffff;
            font-size: 11.5px;
            font-weight: 700;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .pdf-desc-pin-title {
            font-size: 12.5px;
            font-weight: 700;
            color: #f1f5f9;
        }
        .pdf-desc-fixed-tag {
            font-size: 10.5px;
            font-weight: 600;
            color: #f472b6;
            background: rgba(236, 72, 153, 0.14);
            border: 1px solid rgba(236, 72, 153, 0.35);
            padding: 2px 6px;
            border-radius: 4px;
            line-height: 1.1;
        }
        .pdf-desc-card-body {
            font-size: 12.5px;
            font-weight: 400;
            line-height: 1.62;
            color: #e2e8f0;
            white-space: pre-wrap;
            word-break: keep-all;
            overflow-wrap: break-word;
        }
        .pdf-desc-card-body div,
        .pdf-desc-card-body p {
            margin: 0;
            min-height: 1.2em;
        }
        .pdf-desc-card-body b,
        .pdf-desc-card-body strong {
            font-weight: 700;
        }
    `;
}

function _buildPdfDescriptionDocHtml(descriptions, screenContext, minHeightPx) {
    const cardsHtml = descriptions.map((item, idx) => {
        const num = idx + 1;
        const bodyHtml = _formatPinDescriptionHtmlForPdf(item);
        const fixedBadge = _resolvePinFixedBadgeText(item);
        const fixedTagHtml = fixedBadge
            ? `<span class="pdf-desc-fixed-tag">${window.escapeHtmlAttr(fixedBadge)}</span>`
            : '';

        return `
            <div class="pdf-desc-card">
                <div class="pdf-desc-card-head">
                    <div class="pdf-desc-card-head-left">
                        <span class="pdf-desc-pin-badge">${num}</span>
                        <span class="pdf-desc-pin-title">Pin ${num}</span>
                    </div>
                    ${fixedTagHtml}
                </div>
                <div class="pdf-desc-card-body">${bodyHtml}</div>
            </div>
        `;
    }).join('\n');

    const indexLabel = `#${String(screenContext.screenIndex).padStart(2, '0')} / ${String(screenContext.totalScreens).padStart(2, '0')}`;
    const safeTitle = window.escapeHtmlAttr(screenContext.screenTitle || '');
    const stylesheet = _getPdfDescriptionStylesheet(PDF_DESC_PANEL_WIDTH, minHeightPx);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <style>${stylesheet}</style>
</head>
<body>
    <div class="pdf-desc-shell" id="pdf-desc-shell">
        <div class="pdf-desc-top-header">
            <div class="pdf-desc-eyebrow-row">
                <span class="pdf-desc-eyebrow"><span class="pdf-desc-dot"></span>DESCRIPTION</span>
                <span class="pdf-desc-count">Pin ${descriptions.length}</span>
            </div>
            <div class="pdf-desc-screen-title">
                <span class="pdf-desc-screen-idx">${indexLabel}</span>${safeTitle}
            </div>
        </div>
        <div class="pdf-desc-list">
            ${cardsHtml}
        </div>
    </div>
</body>
</html>`;
}

async function renderDescriptionPanelCanvasForPdf(descriptions, screenContext, minHeightPx, renderScale) {
    const panelDocHtml = _buildPdfDescriptionDocHtml(descriptions, screenContext, minHeightPx);

    const descIframe = document.createElement('iframe');
    descIframe.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: ${PDF_DESC_PANEL_WIDTH}px;
        height: ${minHeightPx}px;
        border: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        z-index: 1;
        opacity: 0.001;
        pointer-events: none;
    `;
    document.body.appendChild(descIframe);

    try {
        await new Promise((resolve) => {
            descIframe.onload = () => resolve();
            descIframe.srcdoc = panelDocHtml;
        });

        const descDoc = descIframe.contentDocument || descIframe.contentWindow.document;
        try {
            if (descDoc.fonts && typeof descDoc.fonts.ready?.then === 'function') {
                await Promise.race([
                    descDoc.fonts.ready,
                    new Promise(r => setTimeout(r, 1500))
                ]);
            }
        } catch (e) {}

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        const shellEl = descDoc.getElementById('pdf-desc-shell') || descDoc.body;
        const measuredH = Math.max(minHeightPx, Math.ceil(shellEl.scrollHeight || 0), Math.ceil(descDoc.body.scrollHeight || 0));
        if (measuredH > minHeightPx) {
            descIframe.style.height = `${measuredH}px`;
            shellEl.style.minHeight = `${measuredH}px`;
            await new Promise(r => requestAnimationFrame(r));
        }

        const descCanvas = await html2canvas(descDoc.documentElement || descDoc.body, {
            scale: renderScale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#131722',
            logging: false,
            width: PDF_DESC_PANEL_WIDTH,
            height: measuredH,
            windowWidth: PDF_DESC_PANEL_WIDTH,
            windowHeight: measuredH,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0
        });

        return { descCanvas, descW: PDF_DESC_PANEL_WIDTH, descH: measuredH };
    } finally {
        if (document.body.contains(descIframe)) {
            document.body.removeChild(descIframe);
        }
    }
}
window.renderDescriptionPanelCanvasForPdf = renderDescriptionPanelCanvasForPdf;

function compositeScreenAndDescriptionCanvas(screenCanvas, screenW, screenH, descCanvas, descW, descH, renderScale) {
    const totalW = screenW + descW;
    const totalH = Math.max(screenH, descH);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = Math.round(totalW * renderScale);
    outCanvas.height = Math.round(totalH * renderScale);

    const ctx = outCanvas.getContext('2d');
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    ctx.drawImage(screenCanvas, 0, 0);
    ctx.drawImage(descCanvas, Math.round(screenW * renderScale), 0);

    const dividerX = Math.round(screenW * renderScale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(dividerX, 0, Math.max(1, Math.round(1.2 * renderScale)), outCanvas.height);

    return { canvas: outCanvas, screenW: totalW, screenH: totalH };
}
window.compositeScreenAndDescriptionCanvas = compositeScreenAndDescriptionCanvas;
