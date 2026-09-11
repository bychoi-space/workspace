/**
 * assets/vctrl_common.js
 * Shared common helper functions for LF Editor Studio (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4CommonScript = `...`).
 * 1. DO NOT use unescaped backticks (`) inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. If you must use a backtick, it MUST be escaped as \` to avoid syntax errors.
 */

window.EditorBus = {
    getIframeWindow() {
        const iframe = (window.DOM && window.DOM.iframe) || 
                       document.getElementById('main-iframe') || 
                       document.getElementById('screen-iframe');
        return (iframe && iframe.contentWindow) ? iframe.contentWindow : null;
    },
    sendToIframe(payload) {
        const iframeWin = this.getIframeWindow();
        if (iframeWin) {
            const data = (typeof payload === 'object' && payload !== null) ? { ...payload } : payload;
            if (data && typeof data === 'object' && !data.id && window.activeCompId) {
                data.id = window.activeCompId;
            }
            if (window.MessageHub && data && data.type) {
                MessageHub.send(iframeWin, data.type, data);
            } else {
                iframeWin.postMessage(data, '*');
            }
        } else {
            console.warn("[EditorBus] Active iframe contentWindow not found for payload:", payload ? payload.type : null);
        }
    },
    sendToParent(payload) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(payload, '*');
        }
    }
};

window.notifyIframe = function(data) {
    if (window.EditorBus) {
        window.EditorBus.sendToIframe(data);
    }
};

window.highlightActive = function(btn, isActive) {
    if (!btn) return;
    btn.style.background = isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
    btn.style.borderColor = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
    btn.style.color = isActive ? '#00e5ff' : '#94a3b8';
    btn.style.fontWeight = isActive ? 'bold' : 'normal';
};

window.rgbToHex = function(rgb) {
    if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
    if (rgb.startsWith('#')) return rgb;
    const matches = rgb.match(/\d+/g);
    if (!matches || matches.length < 3) return "#ffffff";
    const r = Math.min(255, parseInt(matches[0])).toString(16).padStart(2, "0");
    const g = Math.min(255, parseInt(matches[1])).toString(16).padStart(2, "0");
    const b = Math.min(255, parseInt(matches[2])).toString(16).padStart(2, "0");
    return "#" + r + g + b;
};

window.hexToRgb = function(hex) {
    if (!hex || hex === 'transparent') return null;
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return null;
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
};

window.hexToRgba = function(hex, opacity) {
    if (!hex || hex === 'transparent') return 'rgba(0, 0, 0, 0)';
    if (hex.startsWith('rgba')) {
        return hex.replace(/[\d\.]+\)$/g, opacity + ')');
    }
    if (hex.startsWith('rgb')) {
        return hex.replace('rgb', 'rgba').replace(')', ', ' + opacity + ')');
    }
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return 'rgba(255, 255, 255, ' + opacity + ')';
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
};

window.EditorBus.rgbToHex = window.rgbToHex;
window.EditorBus.hexToRgb = window.hexToRgb;
window.EditorBus.hexToRgba = window.hexToRgba;

window.showToast = function(message, type = 'success') {
    let container = document.getElementById('v4-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'v4-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'v4-toast ' + type;

    let iconName = 'info';
    if (type === 'success') iconName = 'check_circle';
    else if (type === 'error') iconName = 'error';
    else if (type === 'warning') iconName = 'warning';

    toast.innerHTML = '<span class="material-icons-outlined v4-toast-icon">' + iconName + '</span>' +
                      '<span style="flex-grow: 1;">' + message + '</span>';

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3500);
};

window.parseColorWithOpacity = function(colorStr) {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'none') {
        return { hex: '#ffffff', opacity: 0 };
    }
    if (colorStr.startsWith('rgba')) {
        const matches = colorStr.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/);
        if (matches) {
            const r = parseInt(matches[1]).toString(16).padStart(2, '0');
            const g = parseInt(matches[2]).toString(16).padStart(2, '0');
            const b = parseInt(matches[3]).toString(16).padStart(2, '0');
            return { hex: '#' + r + g + b, opacity: parseFloat(matches[4]) };
        }
    }
    const hex = window.rgbToHex(colorStr) || '#ffffff';
    return { hex: hex, opacity: 1 };
};

// --- Cover Template Metadata Sync & Version Auto-Increment Helper ---
window.syncCoverMetadata = function(html, metadata, isSave = false, currentActiveFile = null) {
    if (!html) return html;
    
    // 1. Title
    const titleValue = metadata.title || '';
    if (html.match(/(<div[^>]*id="cover-project-title"[^>]*>)/i)) {
        html = html.replace(/(<div[^>]*id="cover-project-title"[^>]*>)[^<]*(<\/div>)/i, `$1${titleValue}$2`);
    } else {
        html = html.replace(/(<div[^>]*id="cover-title"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell"[^>]*>)[^<]*(<\/div>)/i, `$1${titleValue}$2`);
    }
    
    // 2. JIRA (Legacy fallback)
    const jiraValue = metadata.jira || '';
    if (html.includes('cover-jira-id')) {
        html = html.replace(/(<div[^>]*id="cover-jira-id"[^>]*>)[^<]*(<\/div>)/i, `$1${jiraValue}$2`);
    }
    
    // 3. Author
    const authorValue = metadata.assignee || '-';
    if (html.match(/(<td[^>]*id="cover-author"[^>]*>)/i)) {
        html = html.replace(/(<td[^>]*id="cover-author"[^>]*>)[^<]*(<\/td>)/i, `$1${authorValue}$2`);
    } else {
        html = html.replace(/(Lead Designer \/ Author[\s\S]*?<td[^>]*class="v4-editable-cell"[^>]*>)[^<]*(<\/td>)/i, `$1${authorValue}$2`);
    }
    
    // 4. Date
    const dateValue = metadata.period || '-';
    if (html.match(/(<td[^>]*id="cover-date"[^>]*>)/i)) {
        html = html.replace(/(<td[^>]*id="cover-date"[^>]*>)[^<]*(<\/td>)/i, `$1${dateValue}$2`);
    } else {
        html = html.replace(/(Publication Date[\s\S]*?<td[^>]*class="v4-editable-cell"[^>]*>)[^<]*(<\/td>)/i, `$1${dateValue}$2`);
    }
    
    // 5. Version
    if (currentActiveFile) {
        let currentVer = 0.1;
        const verMatch = html.match(/(<div[^>]*id="cover-version-val"[^>]*>v?)([\d.]+)(<\/div>)/i) || 
                         html.match(/(<div[^>]*id="cover-version"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell"[^>]*>v?)([\d.]+)(<\/div>)/i);
        
        if (verMatch && verMatch[2]) {
            currentVer = parseFloat(verMatch[2]);
        } else if (metadata.screens && metadata.screens[currentActiveFile] && metadata.screens[currentActiveFile].version !== undefined) {
            currentVer = parseFloat(metadata.screens[currentActiveFile].version);
        }
        
        let nextVerStr = currentVer.toFixed(1);
        if (isSave) {
            nextVerStr = (currentVer + 0.1).toFixed(1);
        }
        
        if (html.match(/(<div[^>]*id="cover-version-val"[^>]*>)/i)) {
            html = html.replace(/(<div[^>]*id="cover-version-val"[^>]*>v?)[^<]*(<\/div>)/i, `$1${nextVerStr}$2`);
        } else {
            html = html.replace(/(<div[^>]*id="cover-version"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell")([^>]*>v?)([^<]*)(<\/div>)/i, `$1 id="cover-version-val" $2${nextVerStr}$4`);
        }
    }
    
    return html;
};

window.calculatePathData = function(c, s, e) {
    if (c.type === 'straight') return 'M ' + s.x + ' ' + s.y + ' L ' + e.x + ' ' + e.y;
    
    const sSide = c.start.side || 'right';
    const eSide = c.end.side || 'left';
    
    const getDirOffset = (side, amount) => {
        if (side === 'left') return { dx: -amount, dy: 0 };
        if (side === 'right') return { dx: amount, dy: 0 };
        if (side === 'top') return { dx: 0, dy: -amount };
        if (side === 'bottom') return { dx: 0, dy: amount };
        return { dx: 0, dy: 0 };
    };
    
    const offset = 20;
    const oStart = getDirOffset(sSide, offset);
    const oEnd = getDirOffset(eSide, offset);
    
    const ptStart = { x: s.x + oStart.dx, y: s.y + oStart.dy };
    const ptEnd = { x: e.x + oEnd.dx, y: e.y + oEnd.dy };
    
    let path = 'M ' + s.x + ' ' + s.y + ' L ' + ptStart.x + ' ' + ptStart.y;
    
    if (sSide === 'left' || sSide === 'right') {
        if (eSide === 'left' || eSide === 'right') {
            const midX = (ptStart.x + ptEnd.x) / 2;
            path += ' H ' + midX + ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
        } else {
            path += ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
        }
    } else {
        if (eSide === 'top' || eSide === 'bottom') {
            const midY = (ptStart.y + ptEnd.y) / 2;
            path += ' V ' + midY + ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
        } else {
            path += ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
        }
    }
    return path;
};

window.v4CommonScript = `
(function() {
    console.log("[V4 Common] Module loaded.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};
    
    // Core shared message helpers
    window.notifyParent = function(data) { if (window.parent) window.parent.postMessage(data, '*'); };
    window.markDirty = function() { window.notifyParent({ type: 'LF_DIRTY' }); };
    window.EditorBus = {
        sendToParent: function(data) { window.notifyParent(data); }
    };

    // Universal RGB to HEX Converter
    window.rgbToHex = function(rgb) {
        if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
        if (rgb.startsWith('#')) return rgb;
        const matches = rgb.match(/\\d+/g);
        if (!matches || matches.length < 3) return "#ffffff";
        const r = Math.min(255, parseInt(matches[0])).toString(16).padStart(2, "0");
        const g = Math.min(255, parseInt(matches[1])).toString(16).padStart(2, "0");
        const b = Math.min(255, parseInt(matches[2])).toString(16).padStart(2, "0");
        return "#" + r + g + b;
    };

    // Universal Connector Path Data Calculator
    window.calculatePathData = function(c, s, e) {
        if (c.type === 'straight') return 'M ' + s.x + ' ' + s.y + ' L ' + e.x + ' ' + e.y;
        
        const sSide = c.start.side || 'right';
        const eSide = c.end.side || 'left';
        
        const getDirOffset = (side, amount) => {
            if (side === 'left') return { dx: -amount, dy: 0 };
            if (side === 'right') return { dx: amount, dy: 0 };
            if (side === 'top') return { dx: 0, dy: -amount };
            if (side === 'bottom') return { dx: 0, dy: amount };
            return { dx: 0, dy: 0 };
        };
        
        const offset = 20;
        const oStart = getDirOffset(sSide, offset);
        const oEnd = getDirOffset(eSide, offset);
        
        const ptStart = { x: s.x + oStart.dx, y: s.y + oStart.dy };
        const ptEnd = { x: e.x + oEnd.dx, y: e.y + oEnd.dy };
        
        let path = 'M ' + s.x + ' ' + s.y + ' L ' + ptStart.x + ' ' + ptStart.y;
        
        if (sSide === 'left' || sSide === 'right') {
            if (eSide === 'left' || eSide === 'right') {
                const midX = (ptStart.x + ptEnd.x) / 2;
                path += ' H ' + midX + ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
            } else {
                path += ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
            }
        } else {
            if (eSide === 'top' || eSide === 'bottom') {
                const midY = (ptStart.y + ptEnd.y) / 2;
                path += ' V ' + midY + ' H ' + ptEnd.x + ' V ' + e.y + ' L ' + e.x + ' ' + e.y;
            } else {
                path += ' V ' + ptEnd.y + ' H ' + e.x + ' L ' + e.x + ' ' + e.y;
            }
        }
        return path;
    };
})();
`;
