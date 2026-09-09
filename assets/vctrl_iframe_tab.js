/**
 * assets/vctrl_iframe_tab.js
 * Modular rendering engine for Workspace Editor Tab Component (Iframe Side).
 * 
 * [WARNING FOR DEVELOPERS & AI AGENTS]
 * This file is wrapped in an outer template literal (window.v4TabScript = `...`).
 * 1. DO NOT use unescaped backticks inside this file.
 * 2. Use double quotes (") or single quotes (') for string literals.
 * 3. Never use ES6 template literals or string interpolation inside this file.
 */

window.v4TabScript = `
(function() {
    console.log("[V4 Tab] Module initialized.");

    window.renderTabs = function(container) {
        if (!container) return;

        var rawCount = parseInt(container.getAttribute('data-tab-count'));
        var tabCount = isNaN(rawCount) ? 3 : Math.max(1, Math.min(10, rawCount));
        container.setAttribute('data-tab-count', tabCount);

        var rawActive = parseInt(container.getAttribute('data-active-index'));
        var activeIndex = isNaN(rawActive) ? 0 : Math.max(0, Math.min(tabCount - 1, rawActive));
        container.setAttribute('data-active-index', activeIndex);

        var accentColor = container.getAttribute('data-accent-color') || '#2563eb';

        var tabs = [];
        var rawTabs = container.getAttribute('data-tabs');
        if (rawTabs) {
            try {
                tabs = JSON.parse(rawTabs);
            } catch(e) {
                tabs = [];
            }
        }

        // Adjust tabs array to match tabCount
        var defaultNames = ['Dashboard', 'Monitoring', 'Activity', 'Analyze', 'Settings', 'Reports', 'Users', 'Logs', 'Billing', 'Config'];
        while (tabs.length < tabCount) {
            var nextIdx = tabs.length;
            var defName = defaultNames[nextIdx] || ('Tab ' + (nextIdx + 1));
            tabs.push({ name: defName, active: false });
        }
        if (tabs.length > tabCount) {
            tabs = tabs.slice(0, tabCount);
        }

        // Ensure exactly one active tab
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].active = (i === activeIndex);
        }
        container.setAttribute('data-tabs', JSON.stringify(tabs));

        // Rebuild DOM items cleanly
        container.innerHTML = '';
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            var isCurrentActive = (i === activeIndex);

            var itemDiv = document.createElement('div');
            itemDiv.className = 'v4-tab-item' + (isCurrentActive ? ' active' : '');
            itemDiv.setAttribute('data-index', i);
            
            var borderRight = (i === tabs.length - 1) ? 'none' : '1.6px solid rgb(226, 232, 240)';
            var bg = isCurrentActive ? '#ffffff' : '#f8fafc';
            itemDiv.style.cssText = 'flex: 1 1 0; min-width: 0; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; box-sizing: border-box; border-right: ' + borderRight + '; background: ' + bg + '; padding: 0 8px; user-select: none; transition: background-color 0.15s ease;';

            var indicator = document.createElement('div');
            indicator.className = 'v4-tab-indicator';
            indicator.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ' + accentColor + '; display: ' + (isCurrentActive ? 'block' : 'none') + '; pointer-events: none; border-radius: 2px 2px 0 0;';
            itemDiv.appendChild(indicator);

            var textSpan = document.createElement('span');
            textSpan.className = 'v4-tab-text v4-editable-cell';
            textSpan.setAttribute('contenteditable', 'true');
            textSpan.innerText = tab.name || ('Tab ' + (i + 1));
            textSpan.style.cssText = 'font-size: 12px; font-family: inherit; color: ' + (isCurrentActive ? '#0f172a' : '#64748b') + '; font-weight: ' + (isCurrentActive ? '600' : '400') + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; outline: none; pointer-events: auto;';

            // Inline text editing handler
            (function(idx, spanEl) {
                spanEl.addEventListener('input', function(e) {
                    var currentTabs = [];
                    try {
                        currentTabs = JSON.parse(container.getAttribute('data-tabs') || '[]');
                    } catch(err) {
                        currentTabs = [];
                    }
                    if (currentTabs[idx]) {
                        currentTabs[idx].name = spanEl.innerText.trim();
                        container.setAttribute('data-tabs', JSON.stringify(currentTabs));
                    }
                });
            })(i, textSpan);

            itemDiv.appendChild(textSpan);

            // Tab click activation handler
            (function(idx) {
                itemDiv.addEventListener('click', function(e) {
                    // Activate this tab
                    var curAct = parseInt(container.getAttribute('data-active-index'));
                    if (curAct !== idx) {
                        if (window.V4UndoManager) window.V4UndoManager.saveState();
                        container.setAttribute('data-active-index', idx);
                        window.renderTabs(container);

                        // Notify parent of updated selection state
                        var comp = container.closest('.lf-component');
                        if (comp && typeof window._getCompStyles === 'function' && typeof window.notifyParent === 'function') {
                            window.notifyParent(Object.assign({
                                type: 'LF_COMP_SELECTED'
                            }, window._getCompStyles(comp)));
                        }
                    }
                });
            })(i);

            container.appendChild(itemDiv);
        }
    };

    window.bindTabEvents = function(root) {
        var base = root || document;
        var tabContainers = base.querySelectorAll('.v4-tab-container');
        tabContainers.forEach(function(container) {
            if (container._tabInitialized) return;
            container._tabInitialized = true;
            window.renderTabs(container);
        });
    };

    // Auto-bind on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.bindTabEvents();
        });
    } else {
        window.bindTabEvents();
    }

    // Message handler for parent-side inspector updates
    window.v4MessageHandlers = window.v4MessageHandlers || {};
    window.v4MessageHandlers['LF_UPDATE_TAB_PROPERTIES'] = function(d) {
        var s = (d && d.id ? document.getElementById(d.id) : null) || document.querySelector('.lf-component.selected');
        if (!s) return;

        var container = s.querySelector('.v4-tab-container') || (s.classList.contains('v4-tab-container') ? s : null);
        if (!container) return;

        if (window.V4UndoManager) window.V4UndoManager.saveState();

        if (d.tabCount !== undefined) {
            var count = Math.max(1, Math.min(10, parseInt(d.tabCount) || 1));
            container.setAttribute('data-tab-count', count);
            var curAct = parseInt(container.getAttribute('data-active-index')) || 0;
            if (curAct >= count) {
                container.setAttribute('data-active-index', count - 1);
            }
        }

        if (d.activeIndex !== undefined) {
            var curCount = parseInt(container.getAttribute('data-tab-count')) || 1;
            var act = Math.max(0, Math.min(curCount - 1, parseInt(d.activeIndex) || 0));
            container.setAttribute('data-active-index', act);
        }

        if (d.accentColor !== undefined) {
            container.setAttribute('data-accent-color', d.accentColor);
        }

        if (d.tabs && Array.isArray(d.tabs)) {
            container.setAttribute('data-tabs', JSON.stringify(d.tabs));
        }

        if (d.tabTexts && Array.isArray(d.tabTexts)) {
            var existingTabs = [];
            try {
                existingTabs = JSON.parse(container.getAttribute('data-tabs') || '[]');
            } catch(e) {}
            for (var i = 0; i < d.tabTexts.length; i++) {
                if (existingTabs[i]) {
                    existingTabs[i].name = d.tabTexts[i];
                } else {
                    existingTabs.push({ name: d.tabTexts[i], active: false });
                }
            }
            container.setAttribute('data-tabs', JSON.stringify(existingTabs));
        }

        window.renderTabs(container);

        if (typeof window.enforceDesignSystem === 'function') {
            window.enforceDesignSystem();
        }

        // Notify parent of updated state
        var comp = container.closest('.lf-component') || s;
        if (comp && typeof window._getCompStyles === 'function' && typeof window.notifyParent === 'function') {
            window.notifyParent(Object.assign({
                type: 'LF_COMP_SELECTED'
            }, window._getCompStyles(comp)));
        }
    };
})();
`;
