/**
 * assets/vctrl_annotation_pins.js
 * Sidebar Annotation Pins UI & Inline Rich Text Editor Lifecycle
 * Manages annotation descriptions in the parent sidebar and synchronized highlighting with iframe pins.
 * Fully supports Bold, Underline, Font Color, and Paste Sanitization with 100% backward compatibility.
 */

(function() {
    console.log("%c [VCTRL ANNOTATION PINS] Initializing Annotation Pins UI... ", "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    // Global active editor reference for toolbar synchronization
    window._activeDescEditor = null;

    /**
     * Synchronizes contenteditable editor DOM state to metadata description entry
     */
    function syncEditorChange(el) {
        if (!el) return;
        var idx = parseInt(el.dataset.index, 10);
        var state = window.state;
        if (!state || !state.activeFile || !state.activeFile.meta || !state.activeFile.meta.description) return;
        var item = state.activeFile.meta.description[idx];
        if (!item) return;

        var html = el.innerHTML;
        var text = (el.innerText || '').replace(/\r\n/g, '\n');

        // Normalize empty content when browser leaves dangling <br> tags
        if (!text.trim() && (html === '<br>' || html === '<p><br></p>' || html === '<div><br></div>' || html === '')) {
            html = '';
            text = '';
            if (el.innerHTML !== '') el.innerHTML = '';
        }

        item.html = html;
        item.text = text.trim();
        if (typeof markAsDirty === 'function') {
            markAsDirty();
        }
    }

    /**
     * Executes rich text formatting command with selection restoration guard
     */
    function executeFormatCommand(cmd, value) {
        var editor = window._activeDescEditor;
        if (!editor || !document.body.contains(editor)) {
            var activeRow = document.querySelector('.desc-row.active-desc') || document.querySelector('.desc-row');
            if (activeRow) {
                editor = activeRow.querySelector('.desc-rich-editor');
                window._activeDescEditor = editor;
            }
        }
        if (editor) {
            editor.focus();
        }
        try {
            document.execCommand(cmd, false, value || null);
        } catch (e) {
            console.warn('[DescEditor] execCommand error:', e);
        }
        if (editor) {
            syncEditorChange(editor);
        }
        updateToolbarState();
    }

    /**
     * Updates active state of formatting toolbar buttons based on current selection
     */
    function updateToolbarState() {
        var btnBold = document.getElementById('desc-tool-bold');
        var btnUnderline = document.getElementById('desc-tool-underline');
        if (btnBold) {
            try {
                btnBold.classList.toggle('active', document.queryCommandState('bold'));
            } catch (e) {}
        }
        if (btnUnderline) {
            try {
                btnUnderline.classList.toggle('active', document.queryCommandState('underline'));
            } catch (e) {}
        }
    }

    /**
     * Initializes the sticky description formatting toolbar
     */
    function initDescriptionToolbar() {
        var toolbar = document.getElementById('desc-toolbar');
        if (!toolbar || toolbar.dataset.initialized === 'true') return;
        toolbar.dataset.initialized = 'true';

        try {
            document.execCommand('styleWithCSS', false, true);
        } catch (e) {}

        // 1. Bold Button
        var btnBold = document.getElementById('desc-tool-bold');
        if (btnBold) {
            btnBold.addEventListener('mousedown', function(e) {
                e.preventDefault(); // Prevent stealing focus & selection!
            });
            btnBold.addEventListener('click', function(e) {
                e.preventDefault();
                executeFormatCommand('bold');
            });
        }

        // 2. Underline Button
        var btnUnderline = document.getElementById('desc-tool-underline');
        if (btnUnderline) {
            btnUnderline.addEventListener('mousedown', function(e) {
                e.preventDefault(); // Prevent stealing focus & selection!
            });
            btnUnderline.addEventListener('click', function(e) {
                e.preventDefault();
                executeFormatCommand('underline');
            });
        }

        // 3. Clear Format Button
        var btnClear = document.getElementById('desc-tool-clear');
        if (btnClear) {
            btnClear.addEventListener('mousedown', function(e) {
                e.preventDefault();
            });
            btnClear.addEventListener('click', function(e) {
                e.preventDefault();
                executeFormatCommand('removeFormat');
            });
        }

        // 4. Color Popover & Swatches
        var btnColor = document.getElementById('desc-tool-color-btn');
        var popover = document.getElementById('desc-color-popover');
        var colorBar = document.getElementById('desc-active-color-bar');
        var nativeColorInput = document.getElementById('desc-native-color');

        if (btnColor && popover) {
            btnColor.addEventListener('mousedown', function(e) {
                e.preventDefault();
            });
            btnColor.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                popover.classList.toggle('active');
            });
        }

        // Swatch clicks
        if (popover) {
            popover.querySelectorAll('.desc-color-swatch').forEach(function(swatch) {
                swatch.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                });
                swatch.addEventListener('click', function(e) {
                    e.preventDefault();
                    var color = this.dataset.color || '#cbd5e1';
                    executeFormatCommand('foreColor', color);
                    if (colorBar) colorBar.style.background = color;
                    if (nativeColorInput) nativeColorInput.value = color;
                    popover.classList.remove('active');
                });
            });
        }

        // Native Color Picker input
        if (nativeColorInput) {
            nativeColorInput.addEventListener('input', function() {
                var color = this.value;
                executeFormatCommand('foreColor', color);
                if (colorBar) colorBar.style.background = color;
            });
            nativeColorInput.addEventListener('change', function() {
                if (popover) popover.classList.remove('active');
            });
        }

        // Close popover on document click
        document.addEventListener('click', function(e) {
            if (popover && popover.classList.contains('active')) {
                if (!popover.contains(e.target) && e.target !== btnColor && !btnColor?.contains(e.target)) {
                    popover.classList.remove('active');
                }
            }
        });

        // Global Selection Change listener for toolbar state
        document.addEventListener('selectionchange', function() {
            if (window._activeDescEditor && window._activeDescEditor.contains(document.getSelection()?.anchorNode)) {
                updateToolbarState();
            }
        });
    }

    window.renderDescriptionList = function() {
        var state = window.state, DOM = window.DOM;
        if (!state || !state.activeFile) return;
        var list = state.activeFile.meta.description;
        if (!DOM || !DOM.descriptionList || !DOM.pinsLayer) return;

        // Initialize formatting toolbar once DOM is ready
        initDescriptionToolbar();

        DOM.descriptionList.innerHTML = '';
        DOM.pinsLayer.innerHTML = '';

        list.forEach(function(item, index) {
            var row = document.createElement('div');
            row.className = 'desc-row';
            row.draggable = !state.isReadOnly;
            row.dataset.index = index;

            // Backward Compatibility & Data Integrity:
            // If item.html contains the legacy template dummy markup (<div class="v4-editable-cell"...Edit Text</div>),
            // strictly prioritize the authentic user-written item.text to preserve original descriptions.
            var initialHtml = '';
            var isLegacyDummyHtml = Boolean(
                item.html && (
                    item.html.indexOf('v4-editable-cell') !== -1 ||
                    (item.html.indexOf('Edit Text') !== -1 && item.text && item.text !== 'Edit Text')
                )
            );

            if (item.html && typeof item.html === 'string' && item.html.trim().length > 0 && !isLegacyDummyHtml) {
                initialHtml = item.html;
            } else if (item.text && typeof item.text === 'string') {
                initialHtml = item.text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>');
            }

            row.innerHTML = `
                <div class="desc-header">
                    <div class="desc-header-left">
                        <div class="desc-index">${index + 1}</div>
                        <span class="desc-header-label">Pin ${index + 1}</span>
                    </div>
                    <div class="desc-actions">
                        <button class="desc-btn desc-btn-del" data-index="${index}" title="삭제"><span class="material-icons-outlined">delete_outline</span></button>
                    </div>
                </div>
                <div class="desc-body">
                    <div class="desc-input desc-rich-editor" 
                         contenteditable="${state.isReadOnly ? 'false' : 'true'}" 
                         data-placeholder="설명을 입력하세요..." 
                         data-index="${index}" 
                         spellcheck="false">${initialHtml}</div>
                </div>
            `;
            
            // Highlight logic (Synchronized with iframe pins)
            var highlight = function(active) { 
                row.classList.toggle('highlight', active); 
                if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                    window.MessageHub.send(DOM.iframe.contentWindow, 'LF_HIGHLIGHT_PIN', { index: index, active: active });
                }
            };
            row.onmouseenter = function() { highlight(true); };
            row.onmouseleave = function() { highlight(false); };

            // Focus & Active state handling
            var selectRow = function() {
                if (DOM && DOM.descriptionList) {
                    DOM.descriptionList.querySelectorAll('.desc-row').forEach(function(r) {
                        r.classList.remove('active-desc');
                        r.classList.remove('selected-pin');
                    });
                }
                row.classList.add('active-desc');
                row.classList.add('selected-pin');
                if (window.GroupingManager && typeof window.GroupingManager.clearSelection === 'function') {
                    window.GroupingManager.clearSelection();
                }
                if (window.state) {
                    window.state.isEditing = false;
                    window.state.editingIndex = -1;
                    window.state.selectedIds = [];
                }
                if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                    window.MessageHub.send(DOM.iframe.contentWindow, 'LF_FOCUS_PIN', { index: index });
                }
            };
            row.onclick = function(e) {
                if (e.target.closest('.desc-btn-del')) return;
                selectRow();
            };

            // Rich Editor Event Bindings
            var editor = row.querySelector('.desc-rich-editor');
            if (editor) {
                editor.onfocus = function() {
                    window._activeDescEditor = editor;
                    selectRow();
                    updateToolbarState();
                };

                editor.oninput = function() {
                    syncEditorChange(editor);
                    updateToolbarState();
                };

                // Keyboard Shortcuts Pipeline (Ctrl+B, Ctrl+U)
                editor.onkeydown = function(e) {
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                        e.preventDefault();
                        executeFormatCommand('bold');
                    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
                        e.preventDefault();
                        executeFormatCommand('underline');
                    }
                };

                // Paste Sanitizer Pipeline: Paste plain text safely to prevent external malicious styles
                editor.onpaste = function(e) {
                    e.preventDefault();
                    var text = (e.clipboardData || window.clipboardData)?.getData('text/plain') || '';
                    if (text) {
                        document.execCommand('insertText', false, text);
                        syncEditorChange(editor);
                    }
                };
            }

            row.querySelector('.desc-btn-del').onclick = async function() {
                var state = window.state;
                if (state.isReadOnly) return window.showAuthModal?.();
                if (await Notification.confirm("이 설명을 삭제하시겠습니까?", "설명 삭제")) {
                    list.splice(index, 1); 
                    markAsDirty(); 
                    renderDescriptionList();
                    
                    var DOM = window.DOM;
                    if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                        window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REORDER_PINS', { deletedIndex: index, pins: list });
                    }
                }
            };

            DOM.descriptionList.appendChild(row);
        });

        setTimeout(function() {
            if (typeof window.autoResizeDescriptionInputs === 'function') {
                window.autoResizeDescriptionInputs();
            }
        }, 50);
    };

    window.autoResizeDescriptionInputs = function() {
        var DOM = window.DOM || {};
        if (!DOM.descriptionList) return;
        var tabDesc = document.getElementById('tab-description');
        if (tabDesc && tabDesc.offsetParent === null) return;
        // Native contenteditable divs naturally expand with height: auto
        DOM.descriptionList.querySelectorAll('.desc-input').forEach(function(el) {
            if (el.offsetParent === null) return;
            el.style.height = 'auto';
        });
    };

    window.focusDescriptionRow = function(index) {
        var DOM = window.DOM;
        if (!DOM || !DOM.descriptionList) return;
        
        DOM.descriptionList.querySelectorAll('.desc-row').forEach(function(row) {
            row.classList.remove('selected-pin');
            row.classList.remove('active-desc');
        });
        
        var row = DOM.descriptionList.querySelector(`.desc-row[data-index="${index}"]`);
        if (row) {
            row.classList.add('selected-pin');
            row.classList.add('active-desc');
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            var editor = row.querySelector('.desc-rich-editor');
            if (editor) {
                window._activeDescEditor = editor;
                editor.focus();
                updateToolbarState();
            }

            if (typeof window.autoResizeDescriptionInputs === 'function') {
                window.autoResizeDescriptionInputs();
            }
        }
    };

    window.deleteAnnotation = function(index) {
        var state = window.state;
        if (state.isReadOnly || !state.activeFile) return;
        state.activeFile.meta.description.splice(index, 1);
        markAsDirty(); 
        renderDescriptionList();
        
        var DOM = window.DOM;
        if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
            window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REORDER_PINS', { deletedIndex: index, pins: state.activeFile.meta.description });
        }
    };

    window.spawnTextEditor = function(x, y, existingIndex) {
        if (existingIndex === undefined) existingIndex = -1;
        var state = window.state;
        if (state.isEditing && typeof window.closeActiveEditor === 'function') window.closeActiveEditor(true);
        state.isEditing = true;
        state.editingIndex = existingIndex;
        window.initQuillEditor?.();
        
        var editorSection = document.getElementById('text-editor-section');
        if (editorSection) editorSection.style.display = 'block';

        if (window.quillEditor) {
            var item = state.activeFile.meta.description[existingIndex];
            window.quillEditor.root.innerHTML = item ? (item.html || item.text || "") : "";
            window.quillEditor.focus();
        }

        const applyBtn = document.getElementById('btn-editor-apply');
        if (applyBtn) {
            applyBtn.onclick = function() { window.closeActiveEditor(true); };
        }
        const btnDel = document.getElementById('btn-editor-delete');
        if (btnDel) {
            btnDel.onclick = function() { window.deleteAnnotation(window.state.editingIndex); window.closeActiveEditor(false); };
        }
    };

    window.closeActiveEditor = function(save) {
        if (save === undefined) save = true;
        var state = window.state;
        if (!state.isEditing) return;
        var q = window.quillEditor;
        if (save && q) {
            var item = state.activeFile.meta.description[state.editingIndex];
            if (item) {
                item.html = q.root.innerHTML;
                item.text = q.getText().trim();
                if (!item.text && item.html === "<p><br></p>") state.activeFile.meta.description.splice(state.editingIndex, 1);
                markAsDirty();
            }
        }
        state.isEditing = false;
        state.editingIndex = -1;
        var editorSection = document.getElementById('text-editor-section');
        if (editorSection) editorSection.style.display = 'none';
        var emptyMsg = document.querySelector('.empty-inspector');
        if (emptyMsg) emptyMsg.style.display = 'flex';
        window.renderDescriptionList();
    };

    // MessageHub Deselection Integration
    if (window.MessageHub) {
        MessageHub.subscribe('LF_DESELECT', function() {
            if (window.closeActiveEditor) window.closeActiveEditor(true);
        });
    }
})();
