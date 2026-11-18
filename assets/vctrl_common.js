/**
 * assets/vctrl_common.js
 * Shared common helper functions for bychoi workspace Studio (Iframe Side).
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
    sendToIframe(payload, extraData) {
        const iframeWin = this.getIframeWindow();
        if (iframeWin) {
            let data = payload;
            if (typeof payload === 'string') {
                data = (extraData && typeof extraData === 'object')
                    ? Object.assign({ type: payload }, extraData)
                    : { type: payload };
            } else if (typeof payload === 'object' && payload !== null) {
                data = { ...payload };
            }
            if (data && typeof data === 'object' && !data.id && window.activeCompId) {
                data.id = window.activeCompId;
            }
            if (window.MessageHub && data && data.type) {
                MessageHub.send(iframeWin, data.type, data);
            } else {
                iframeWin.postMessage(data, '*');
            }
        } else {
            console.warn("[EditorBus] Active iframe contentWindow not found for payload:", payload ? (payload.type || payload) : null);
        }
    },
    sendToParent(payload) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(payload, '*');
        }
    }
};

window.notifyIframe = function(data) {
    if (window.EditorBus && typeof window.EditorBus.sendToIframe === 'function') {
        window.EditorBus.sendToIframe(data);
    } else {
        const iframe = (window.DOM && window.DOM.iframe) || 
                       document.getElementById('main-iframe') || 
                       document.getElementById('screen-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(data, '*');
        }
    }
};

// --- Universal Responsive Frame & Container Manager (SSOT) ---
window.ResponsiveFrameUtils = {
    isResponsive: function(targetDoc) {
        return window.isResponsiveDocument(targetDoc);
    },
    getTemplateType: function(targetDoc) {
        var doc = targetDoc || (window.DOM && window.DOM.iframe && window.DOM.iframe.contentDocument) || document;
        if (!doc || !doc.querySelector) return 'standard';
        if (doc.querySelector('.mobile-compare-page') || (doc.querySelector('.mobile-column-left') && doc.querySelector('.mobile-column-right'))) {
            return 'mobile-compare';
        }
        if (doc.querySelector('.pc-content-inner') && doc.querySelector('.mobile-content-inner')) {
            return 'pc-mobile';
        }
        if (doc.querySelector('.pc-content-inner') || doc.querySelector('.pc-browser-frame') || doc.querySelector('.admin-pc-page')) {
            return 'admin-pc';
        }
        return 'standard';
    },
    getContainer: function(el) {
        if (!el || !el.closest) return null;
        return el.closest(
            '.pc-content-inner, .mobile-content-inner, ' +
            '.pc-content-area, .mobile-content-area, ' +
            '.mobile-content, .pc-content'
        );
    },
    getFrameType: function(el) {
        if (!el) return 'canvas';
        var explicit = el.getAttribute ? (el.getAttribute('data-frame') || '') : '';
        if (explicit === 'left' || explicit === 'right' || explicit === 'pc' || explicit === 'mobile') {
            return explicit;
        }
        if (el.closest) {
            if (el.closest('.mobile-column-left') || el.closest('[data-frame="left"]')) return 'left';
            if (el.closest('.mobile-column-right') || el.closest('[data-frame="right"]')) return 'right';
            if (el.closest('.pc-content-inner, .pc-content-area, .pc-browser-frame, .pc-column, [data-frame="pc"]')) return 'pc';
            if (el.closest('.mobile-content-inner, .mobile-content-area, .mobile-browser-frame, .mobile-column, [data-frame="mobile"]')) return 'mobile';
        }
        return 'canvas';
    },
    getScrollArea: function(el) {
        if (!el || !el.closest) return null;
        return el.closest('.pc-content-area, .pc-content, .mobile-content-area, .mobile-content, .chrome-content-area');
    },
    getRelativeOffset: function(el, container) {
        var c = container || this.getContainer(el);
        if (!c) {
            return {
                x: Math.round(parseFloat(el.style.left) || 0),
                y: Math.round(parseFloat(el.style.top) || 0)
            };
        }
        var elRect = el.getBoundingClientRect();
        var cRect = c.getBoundingClientRect();
        return {
            x: Math.round(elRect.left - cRect.left),
            y: Math.round(elRect.top - cRect.top)
        };
    }
};

// --- Universal Screen Sanitizer for Clean HTML Export & Persistence ---
(function() {
    const splitStyleRules = function(str) {
        if (!str) return [];
        const rules = [];
        let cur = '';
        let inParen = 0;
        let inQuote = null;
        for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            if (inQuote) {
                if (ch === inQuote && str[i - 1] !== '\\') inQuote = null;
                cur += ch;
            } else if (ch === '"' || ch === "'") {
                inQuote = ch;
                cur += ch;
            } else if (ch === '(') {
                inParen++;
                cur += ch;
            } else if (ch === ')') {
                if (inParen > 0) inParen--;
                cur += ch;
            } else if (ch === ';' && inParen === 0) {
                if (cur.trim()) rules.push(cur.trim());
                cur = '';
            } else {
                cur += ch;
            }
        }
        if (cur.trim()) rules.push(cur.trim());
        return rules;
    };

    const cleanEmptyStyleRules = function(styleStr) {
        if (!styleStr) return '';
        const rules = splitStyleRules(styleStr);
        const cleaned = rules.filter(function(r) {
            const colonIdx = r.indexOf(':');
            if (colonIdx === -1) return false;
            const val = r.slice(colonIdx + 1).trim();
            return val.length > 0 && val !== 'initial' && val !== 'inherit';
        });
        return cleaned.length > 0 ? cleaned.join('; ') + ';' : '';
    };

    window.ScreenSanitizer = {
        splitStyleRules: splitStyleRules,
        cleanEmptyStyleRules: cleanEmptyStyleRules,
        cleanDOM: function(root) {
            if (!root) return root;
            // 1. Remove runtime UI helpers (ports, handles, guide layers, marquee box, selection adorners, image crop overlays)
            root.querySelectorAll('.bychoi-resizer, .bychoi-delete-trigger, .bychoi-drag-handle, .bychoi-connector-port, svg.v4-responsive-guide-layer, .v4-marquee-box, .smart-guide-line, .v4-selection-adorner-layer, .v4-selection-adorner, .v4-image-crop-layer').forEach(function(el) {
                el.remove();
            });

            // 1.1 Remove empty standalone Text SHAPE residue (.v4-text-shape / .v4-text-box)
            var zwsChar = String.fromCharCode(8203);
            root.querySelectorAll('.bychoi-component.v4-text-shape, .bychoi-component.v4-text-box').forEach(function(el) {
                if (el.classList.contains('bychoi-group') || el.classList.contains('pin-marker') || el.classList.contains('text-marker')) return;
                if (el.id && el.id.indexOf('v4-pin-') === 0) return;
                if (el.getAttribute('data-index') !== null || el.getAttribute('data-pin-num') !== null) return;
                if (el.querySelector('.v4-shape, .v4-textbox-container, .v4-textarea-container, table, .bychoi-icon, .v4-illustration-container, .v4-motion-container')) return;
                var cell = el.querySelector('.v4-editable-cell');
                if (!cell) return;
                var clone = cell.cloneNode(true);
                clone.querySelectorAll('.ql-cursor').forEach(function(cur) { cur.remove(); });
                var cleanedTxt = (clone.textContent || '').split(zwsChar).join('').trim();
                if (cleanedTxt.length === 0) {
                    var parentGrp = (el.parentElement && el.parentElement.classList && el.parentElement.classList.contains('bychoi-group')) ? el.parentElement : null;
                    el.remove();
                    if (parentGrp && parentGrp.querySelectorAll('.bychoi-component').length === 0) {
                        parentGrp.remove();
                    }
                }
            });
            
            // 1.2 Normalize empty Textbox/Textarea orphan <br> and placeholder visibility before saving
            var lfChar = String.fromCharCode(10);
            var crChar = String.fromCharCode(13);
            var bomChar = String.fromCharCode(65279);
            root.querySelectorAll('.v4-textbox-container, .v4-textarea-container').forEach(function(container) {
                var isTextarea = container.classList.contains('v4-textarea-container');
                var input = container.querySelector(isTextarea ? '.v4-textarea-input' : '.v4-textbox-input');
                var ph = container.querySelector(isTextarea ? '.v4-textarea-placeholder' : '.v4-textbox-placeholder');
                var counter = container.querySelector(isTextarea ? '.v4-textarea-counter' : '.v4-textbox-counter');
                if (!input) return;
                input.removeAttribute('data-events-bound');
                var rawTxt = (input.textContent || '').split(zwsChar).join('').split(bomChar).join('').split(lfChar).join('').split(crChar).join('');
                var isEmptyDom = rawTxt.length === 0 && (!isTextarea || input.querySelectorAll('br').length <= 1);
                if (isEmptyDom) {
                    if (input.innerHTML !== '') input.innerHTML = '';
                    if (ph) {
                        var phAttr = container.getAttribute('data-placeholder');
                        if (phAttr !== null && ph.textContent !== phAttr) ph.textContent = phAttr;
                        var hasPh = (ph.textContent || '').length > 0;
                        ph.style.display = hasPh ? 'block' : 'none';
                    }
                    if (counter) {
                        var maxLen = parseInt(container.getAttribute('data-maxlength')) || 100;
                        counter.textContent = '0/' + maxLen;
                    }
                }
            });

            // 2. Remove active state classes
            root.querySelectorAll('.bychoi-component, .v4-shape').forEach(function(el) {
                el.classList.remove('selected', 'dragging-now', 'hover-target', 'v4-guide-snapped', 'v4-cropping-active');
            });
            root.querySelectorAll('.selected-cell').forEach(function(el) {
                el.classList.remove('selected-cell');
            });

            // 2.1 Reset runtime scroll pin transform and will-change before saving
            root.querySelectorAll('[data-scroll-fixed], .pin-marker').forEach(function(el) {
                el.style.removeProperty('transform');
                el.style.removeProperty('will-change');
            });

            // 2.15 Normalize dedicated Dimmed Overlay Layers (strip transient editor-only flags; prune unused empty layers)
            root.querySelectorAll('.v4-dimmed-overlay-layer').forEach(function(layer) {
                var isEnabled = layer.getAttribute('data-dimmed-enabled') === 'true';
                var hasChildComps = layer.querySelectorAll('.bychoi-component').length > 0;
                if (!isEnabled && !hasChildComps) {
                    layer.remove();
                    return;
                }
                layer.classList.remove('v4-dimmed-temp-hidden');
                layer.removeAttribute('data-dimmed-edit-mode');
                layer.style.display = isEnabled ? 'block' : 'none';
                layer.style.pointerEvents = isEnabled ? 'auto' : 'none';
            });

            // 2.2 Clean runtime injected engine styles and scripts to keep saved HTML pure and lightweight
            if (root.removeAttribute) root.removeAttribute('data-shell-theme');
            root.querySelectorAll('[data-shell-theme]').forEach(function(el) { el.removeAttribute('data-shell-theme'); });
            root.querySelectorAll('#v4-inlined-style, #v4-responsive-frame-style, #v4-typography-rules, #v4-scroll-pin-style, #v4-cover-theme-fix, #v4-inlined-script').forEach(function(el) {
                el.remove();
            });

            // 3. Clean empty inline style rules created by browser DOM serialization
            root.querySelectorAll('[style]').forEach(function(el) {
                const raw = el.getAttribute('style');
                if (raw) {
                    const cleaned = cleanEmptyStyleRules(raw);
                    if (cleaned) {
                        el.setAttribute('style', cleaned);
                    } else {
                        el.removeAttribute('style');
                    }
                }
            });
            return root;
        }
    };
})();

window.highlightActive = function(btn, isActive) {
    if (!btn) return;
    const active = Boolean(isActive);
    if (btn.classList) {
        btn.classList.toggle('active', active);
    }
    btn.style.background = active ? 'var(--ed-toggle-active-bg, rgba(110, 86, 207, 0.25))' : 'var(--ed-toggle-idle-bg, rgba(255, 255, 255, 0.05))';
    btn.style.borderColor = active ? 'var(--ed-toggle-active-border, #6e56cf)' : 'var(--ed-toggle-idle-border, rgba(255, 255, 255, 0.15))';
    btn.style.color = active ? 'var(--ed-toggle-active-text, #ffffff)' : 'var(--ed-toggle-idle-text, #94a3b8)';
    btn.style.fontWeight = active ? '600' : '500';
    btn.style.boxShadow = 'none';
};

window.rgbToHex = function(rgb) {
    if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
    if (typeof rgb === "string" && rgb.startsWith('#')) return rgb;
    
    // 1) var(...) CSS variable expression defense: extract fallback hex or rgb
    if (typeof rgb === "string" && rgb.includes('var(')) {
        const hexMatch = rgb.match(/#[0-9a-fA-F]{3,8}/);
        if (hexMatch) return hexMatch[0];
        const rgbMatch = rgb.match(/rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i);
        if (rgbMatch) rgb = rgbMatch[0] + ')';
        else return null;
    }

    // 2) Strict rgba?(r, g, b) format parsing
    const m = typeof rgb === "string" ? rgb.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i) : null;
    if (m) {
        const r = Math.min(255, parseInt(m[1], 10)).toString(16).padStart(2, "0");
        const g = Math.min(255, parseInt(m[2], 10)).toString(16).padStart(2, "0");
        const b = Math.min(255, parseInt(m[3], 10)).toString(16).padStart(2, "0");
        return "#" + r + g + b;
    }

    // 3) Fallback digit extraction
    const matches = typeof rgb === "string" ? rgb.match(/\d+/g) : null;
    if (!matches || matches.length < 3) return "#ffffff";
    const r = Math.min(255, parseInt(matches[0], 10)).toString(16).padStart(2, "0");
    const g = Math.min(255, parseInt(matches[1], 10)).toString(16).padStart(2, "0");
    const b = Math.min(255, parseInt(matches[2], 10)).toString(16).padStart(2, "0");
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

window.isDarkColor = function(colorStr, threshold) {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'none') return false;
    const str = String(colorStr).trim();
    let r = -1, g = -1, b = -1;
    if (str.indexOf('#') === 0) {
        let hex = str.substring(1);
        if (hex.length === 3) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        if (hex.length >= 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    } else if (str.indexOf('rgb') === 0) {
        const openIdx = str.indexOf('(');
        const closeIdx = str.indexOf(')');
        if (openIdx !== -1 && closeIdx > openIdx) {
            const parts = str.substring(openIdx + 1, closeIdx).split(',');
            if (parts.length >= 3) {
                r = parseInt(parts[0].trim(), 10);
                g = parseInt(parts[1].trim(), 10);
                b = parseInt(parts[2].trim(), 10);
            }
        }
    }
    if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || g < 0 || b < 0) return false;
    const limit = (typeof threshold === 'number') ? threshold : (128 / 255);
    const lum = ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
    return lum < limit;
};

window.normalizeHex = function(input) {
    if (!input || typeof input !== 'string') return null;
    let hex = input.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
        hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    }
    return /^[0-9a-fA-F]{6}$/.test(hex) ? ('#' + hex.toLowerCase()) : null;
};

window.escapeHtml = function(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

window.escapeHtmlAttr = function(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

window.EditorBus.rgbToHex = window.rgbToHex;
window.EditorBus.hexToRgb = window.hexToRgb;
window.EditorBus.hexToRgba = window.hexToRgba;
window.EditorBus.isDarkColor = window.isDarkColor;
window.EditorBus.normalizeHex = window.normalizeHex;

// Universal Screen Category Data SSOT
window.getCategoryData = function(type) {
    const categories = {
        'cover': { label: 'COVER', code: 'CO', class: 'badge-cover' },
        'architecture': { label: 'ARCH', code: 'AR', class: 'badge-architecture' },
        'plan': { label: 'PLAN', code: 'PL', class: 'badge-plan' },
        'plan-delivery': { label: 'PLAN', code: 'PL', class: 'badge-plan' },
        'case-study': { label: 'CASE', code: 'CS', class: 'badge-case-study' },
        'case_study': { label: 'CASE', code: 'CS', class: 'badge-case-study' },
        'ui': { label: 'UI', code: 'UI', class: 'badge-ui' },
        'responsive-ui': { label: 'PC+MO', code: 'PC', class: 'badge-responsive-ui' },
        'mobile-ui': { label: 'MOBILE', code: 'MO', class: 'badge-mobile-ui' },
        'admin': { label: 'ADMIN', code: 'AD', class: 'badge-admin' },
        'admin-nbos': { label: 'ADMIN', code: 'AD', class: 'badge-admin' },
        'admin-modern': { label: 'ADMIN', code: 'AD', class: 'badge-admin' }
    };
    return categories[type] || { label: 'ETC', code: (type || 'ET').slice(0, 2).toUpperCase(), class: 'badge-default' };
};

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
                      '<span style="flex-grow: 1; word-break: break-word; line-height: 1.4;">' + message + '</span>';

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

// --- Universal KST Timestamp Formatter (SSOT) ---
window.getFormattedKST = function(dateObj) {
    const now = dateObj ? new Date(dateObj) : new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + ss;
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
        if (metadata && metadata.version !== undefined) {
            currentVer = parseFloat(metadata.version);
        } else {
            const verMatch = html.match(/(<div[^>]*id="cover-version-val"[^>]*>v?)([\d.]+)(<\/div>)/i) || 
                             html.match(/(<div[^>]*id="cover-version"[^>]*>[\s\S]*?<div[^>]*class="v4-editable-cell"[^>]*>v?)([\d.]+)(<\/div>)/i);
            
            if (verMatch && verMatch[2]) {
                currentVer = parseFloat(verMatch[2]);
            } else if (metadata && metadata.screens && metadata.screens[currentActiveFile] && metadata.screens[currentActiveFile].version !== undefined) {
                currentVer = parseFloat(metadata.screens[currentActiveFile].version);
            }
        }
        
        let nextVerStr = currentVer.toFixed(1);
        if (isSave && (!metadata || metadata.version === undefined)) {
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

// Universal Responsive Screen Discriminator (Parent Side SSOT)
window.isResponsiveDocument = function(targetDoc) {
    try {
        const doc = targetDoc || document;
        return !!(doc && doc.querySelector && (
            doc.querySelector('.pc-content-inner') || 
            doc.querySelector('.mobile-content-inner') || 
            doc.querySelector('.pc-browser-frame') ||
            doc.querySelector('.pc-content-area') ||
            doc.querySelector('.mobile-compare-page') ||
            doc.querySelector('.frame-column') ||
            doc.querySelector('.mobile-content-area')
        ));
    } catch (e) {
        return false;
    }
};
window.isResponsiveScreen = window.isResponsiveDocument;

window.isResponsiveHtml = function(rawHtml, screenFileName = '') {
    const fn = (screenFileName || '').toLowerCase();
    if (fn.includes('responsive') || fn.includes('admin_pc_scroll') || fn.includes('mobile_compare')) return true;
    if (!rawHtml) return false;
    return rawHtml.includes('pc-browser-frame') ||
           rawHtml.includes('pc-content-area') ||
           rawHtml.includes('frame-column') ||
           rawHtml.includes('full-pc-page') ||
           rawHtml.includes('mobile-compare-page') ||
           rawHtml.includes('mobile-content-area') ||
           rawHtml.includes('template_responsive') ||
           rawHtml.includes('template_admin_pc_scroll');
};

window.v4CommonScript = `
(function() {
    console.log("[V4 Common] Module loaded.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};
    
    // Core shared message helpers
    window.notifyParent = function(data) { if (window.parent) window.parent.postMessage(data, '*'); };
    window.markDirty = function() { window.notifyParent({ type: 'BYCHOI_DIRTY' }); };
    window.EditorBus = {
        sendToParent: function(data) { window.notifyParent(data); }
    };

    // Universal Responsive Screen Detector (Iframe SSOT)
    window.isResponsiveDocument = function(targetDoc) {
        var doc = targetDoc || document;
        return !!(doc && doc.querySelector && (
            doc.querySelector('.pc-content-inner') || 
            doc.querySelector('.mobile-content-inner') || 
            doc.querySelector('.pc-browser-frame') ||
            doc.querySelector('.pc-content-area') ||
            doc.querySelector('.mobile-compare-page') ||
            doc.querySelector('.frame-column') ||
            doc.querySelector('.mobile-content-area')
        ));
    };
    window.isResponsiveScreen = window.isResponsiveDocument;

    // Universal RGB to HEX Converter
    window.rgbToHex = function(rgb) {
        if (!rgb || rgb === "transparent" || rgb === "none" || rgb.includes("rgba(0, 0, 0, 0)")) return null;
        if (typeof rgb === "string" && rgb.startsWith('#')) return rgb;
        
        // 1) var(...) CSS variable expression defense: extract fallback hex or rgb
        if (typeof rgb === "string" && rgb.includes('var(')) {
            const hexMatch = rgb.match(/#[0-9a-fA-F]{3,8}/);
            if (hexMatch) return hexMatch[0];
            const rgbMatch = rgb.match(/rgba?\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+/i);
            if (rgbMatch) rgb = rgbMatch[0] + ')';
            else return null;
        }

        // 2) Strict rgba?(r, g, b) format parsing
        const m = typeof rgb === "string" ? rgb.match(/rgba?\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)/i) : null;
        if (m) {
            const r = Math.min(255, parseInt(m[1], 10)).toString(16).padStart(2, "0");
            const g = Math.min(255, parseInt(m[2], 10)).toString(16).padStart(2, "0");
            const b = Math.min(255, parseInt(m[3], 10)).toString(16).padStart(2, "0");
            return "#" + r + g + b;
        }

        // 3) Fallback digit extraction
        const matches = typeof rgb === "string" ? rgb.match(/\\d+/g) : null;
        if (!matches || matches.length < 3) return "#ffffff";
        const r = Math.min(255, parseInt(matches[0], 10)).toString(16).padStart(2, "0");
        const g = Math.min(255, parseInt(matches[1], 10)).toString(16).padStart(2, "0");
        const b = Math.min(255, parseInt(matches[2], 10)).toString(16).padStart(2, "0");
        return "#" + r + g + b;
    };

    // Universal HEX to RGB Converter (Iframe SSOT)
    window.hexToRgb = function(hex) {
        if (!hex || hex === 'transparent') return null;
        var c = String(hex).replace('#', '');
        if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
        var num = parseInt(c, 16);
        if (isNaN(num)) return null;
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    };

    // Universal HEX to RGBA Converter (Iframe SSOT)
    window.hexToRgba = function(hex, opacity) {
        if (!hex || hex === 'transparent' || hex === 'none') return 'transparent';
        if (opacity === 0) return 'transparent';
        if (typeof hex === 'string' && hex.startsWith('rgba')) {
            var lastComma = hex.lastIndexOf(',');
            if (lastComma !== -1) {
                return hex.substring(0, lastComma) + ', ' + opacity + ')';
            }
        }
        if (typeof hex === 'string' && hex.startsWith('rgb')) {
            var closeParen = hex.indexOf(')');
            var baseRgb = closeParen !== -1 ? hex.substring(0, closeParen) : hex;
            if (baseRgb.startsWith('rgb(')) {
                return 'rgba(' + baseRgb.substring(4) + ', ' + opacity + ')';
            }
        }
        var c = String(hex).replace('#', '');
        if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
        var num = parseInt(c, 16);
        if (isNaN(num)) return 'rgba(255, 255, 255, ' + opacity + ')';
        var r = (num >> 16) & 255;
        var g = (num >> 8) & 255;
        var b = num & 255;
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
    };

    // Universal Perceived Luminance Dark Color Detector (Iframe SSOT)
    window.isDarkColor = function(colorStr, threshold) {
        if (!colorStr || colorStr === 'transparent' || colorStr === 'none') return false;
        var str = String(colorStr).trim();
        var r = -1, g = -1, b = -1;
        if (str.indexOf('#') === 0) {
            var hex = str.substring(1);
            if (hex.length === 3) {
                hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
            }
            if (hex.length >= 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
        } else if (str.indexOf('rgb') === 0) {
            var openIdx = str.indexOf('(');
            var closeIdx = str.indexOf(')');
            if (openIdx !== -1 && closeIdx > openIdx) {
                var parts = str.substring(openIdx + 1, closeIdx).split(',');
                if (parts.length >= 3) {
                    r = parseInt(parts[0].trim(), 10);
                    g = parseInt(parts[1].trim(), 10);
                    b = parseInt(parts[2].trim(), 10);
                }
            }
        }
        if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || g < 0 || b < 0) return false;
        var limit = (typeof threshold === 'number') ? threshold : (128 / 255);
        var lum = ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
        return lum < limit;
    };

    // Universal HEX Normalizer (Iframe SSOT)
    window.normalizeHex = function(input) {
        if (!input || typeof input !== 'string') return null;
        var hex = input.trim().replace(/^#/, '');
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        return /^[0-9a-fA-F]{6}$/.test(hex) ? ('#' + hex.toLowerCase()) : null;
    };

    // Universal HTML Escapers (Iframe SSOT)
    window.escapeHtml = function(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };
    window.escapeHtmlAttr = function(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    // Universal Multi-Selection & Single Target Component Resolver (Iframe SSOT)
    window._getTargetComponents = function(d) {
        if (d && d.ids && Array.isArray(d.ids) && d.ids.length > 0) {
            var list = d.ids.map(function(id) { return document.getElementById(id); }).filter(Boolean);
            if (list.length > 0) return list;
        }
        if (d && d.id) {
            var single = document.getElementById(d.id);
            if (single) return [single];
        }
        var selected = Array.from(document.querySelectorAll('.bychoi-component.selected'));
        if (selected.length > 0) return selected;
        return [];
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

    // Universal Screen Sanitizer (Iframe SSOT)
    window.ScreenSanitizer = {
        splitStyleRules: function(str) {
            if (!str) return [];
            var rules = [];
            var cur = '';
            var inParen = 0;
            var inQuote = null;
            for (var i = 0; i < str.length; i++) {
                var ch = str[i];
                if (inQuote) {
                    if (ch === inQuote && str[i - 1] !== '\\\\') inQuote = null;
                    cur += ch;
                } else if (ch === '"' || ch === "'") {
                    inQuote = ch;
                    cur += ch;
                } else if (ch === '(') {
                    inParen++;
                    cur += ch;
                } else if (ch === ')') {
                    if (inParen > 0) inParen--;
                    cur += ch;
                } else if (ch === ';' && inParen === 0) {
                    if (cur.trim()) rules.push(cur.trim());
                    cur = '';
                } else {
                    cur += ch;
                }
            }
            if (cur.trim()) rules.push(cur.trim());
            return rules;
        },
        cleanEmptyStyleRules: function(styleStr) {
            if (!styleStr) return '';
            var rules = window.ScreenSanitizer.splitStyleRules(styleStr);
            var cleaned = rules.filter(function(r) {
                var colonIdx = r.indexOf(':');
                if (colonIdx === -1) return false;
                var val = r.slice(colonIdx + 1).trim();
                return val.length > 0 && val !== 'initial' && val !== 'inherit';
            });
            return cleaned.length > 0 ? cleaned.join('; ') + ';' : '';
        },
        cleanDOM: function(root) {
            if (!root) return root;
            root.querySelectorAll('.bychoi-resizer, .bychoi-delete-trigger, .bychoi-drag-handle, .bychoi-connector-port, svg.v4-responsive-guide-layer, .v4-marquee-box, .smart-guide-line, .v4-selection-adorner-layer, .v4-selection-adorner, .v4-image-crop-layer').forEach(function(el) {
                el.remove();
            });
            var zwsChar = String.fromCharCode(8203);
            root.querySelectorAll('.bychoi-component.v4-text-shape, .bychoi-component.v4-text-box').forEach(function(el) {
                if (el.classList.contains('bychoi-group') || el.classList.contains('pin-marker') || el.classList.contains('text-marker')) return;
                if (el.id && el.id.indexOf('v4-pin-') === 0) return;
                if (el.getAttribute('data-index') !== null || el.getAttribute('data-pin-num') !== null) return;
                if (el.querySelector('.v4-shape, .v4-textbox-container, .v4-textarea-container, table, .bychoi-icon, .v4-illustration-container, .v4-motion-container')) return;
                var cell = el.querySelector('.v4-editable-cell');
                if (!cell) return;
                var clone = cell.cloneNode(true);
                clone.querySelectorAll('.ql-cursor').forEach(function(cur) { cur.remove(); });
                var cleanedTxt = (clone.textContent || '').split(zwsChar).join('').trim();
                if (cleanedTxt.length === 0) {
                    var parentGrp = (el.parentElement && el.parentElement.classList && el.parentElement.classList.contains('bychoi-group')) ? el.parentElement : null;
                    el.remove();
                    if (parentGrp && parentGrp.querySelectorAll('.bychoi-component').length === 0) {
                        parentGrp.remove();
                    }
                }
            });
            root.querySelectorAll('.bychoi-component, .v4-shape').forEach(function(el) {
                el.classList.remove('selected', 'dragging-now', 'hover-target', 'v4-guide-snapped', 'v4-cropping-active');
            });
            root.querySelectorAll('[data-scroll-fixed], .pin-marker').forEach(function(el) {
                el.style.removeProperty('transform');
                el.style.removeProperty('will-change');
            });
            if (root.removeAttribute) root.removeAttribute('data-shell-theme');
            root.querySelectorAll('[data-shell-theme]').forEach(function(el) { el.removeAttribute('data-shell-theme'); });
            root.querySelectorAll('#v4-inlined-style, #v4-responsive-frame-style, #v4-typography-rules, #v4-scroll-pin-style, #v4-cover-theme-fix, #v4-inlined-script').forEach(function(el) {
                el.remove();
            });
            root.querySelectorAll('[style]').forEach(function(el) {
                var raw = el.getAttribute('style');
                if (raw) {
                    var cleaned = window.ScreenSanitizer.cleanEmptyStyleRules(raw);
                    if (cleaned) {
                        el.setAttribute('style', cleaned);
                    } else {
                        el.removeAttribute('style');
                    }
                }
            });
            return root;
        }
    };
})();
`;
