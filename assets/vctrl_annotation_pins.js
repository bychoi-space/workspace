/**
 * assets/vctrl_annotation_pins.js
 * Sidebar Annotation Pins UI & Inline Text Editor Lifecycle
 * Manages annotation descriptions in the parent sidebar and synchronized highlighting with iframe pins.
 */

(function() {
    console.log("%c [VCTRL ANNOTATION PINS] Initializing Annotation Pins UI... ", "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

    window.renderDescriptionList = function() {
        var state = window.state, DOM = window.DOM;
        if (!state || !state.activeFile) return;
        var list = state.activeFile.meta.description;
        if (!DOM || !DOM.descriptionList || !DOM.pinsLayer) return;

        DOM.descriptionList.innerHTML = '';
        DOM.pinsLayer.innerHTML = '';

        list.forEach(function(item, index) {
            var row = document.createElement('div');
            row.className = 'desc-row';
            row.draggable = !state.isReadOnly;
            row.dataset.index = index;
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
                    <textarea class="desc-input" rows="1" placeholder="설명을 입력하세요..." ${state.isReadOnly ? 'disabled' : ''}>${item.text || ''}</textarea>
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
                    });
                }
                row.classList.add('active-desc');
                if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                    window.MessageHub.send(DOM.iframe.contentWindow, 'LF_FOCUS_PIN', { index: index });
                }
            };
            row.onclick = function(e) {
                if (e.target.closest('.desc-btn-del')) return;
                selectRow();
            };

            // Input & Row Actions
            var input = row.querySelector('.desc-input');
            var autoResize = function(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
            input.onfocus = function() {
                selectRow();
            };
            input.oninput = function() { 
                item.text = input.value; 
                autoResize(input); 
                markAsDirty();
            };
            autoResize(input);

            row.querySelector('.desc-btn-del').onclick = async function() {
                var state = window.state;
                if (state.isReadOnly) return window.showAuthModal?.();
                if (await Notification.confirm("이 설명을 삭제하시겠습니까?", "설명 삭제")) {
                    list.splice(index, 1); 
                    markAsDirty(); 
                    renderDescriptionList();
                    
                    var DOM = window.DOM;
                    if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                        window.MessageHub.send(DOM.iframe.contentWindow, 'LF_REORDER_PINS', { pins: list });
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
        DOM.descriptionList.querySelectorAll('.desc-input').forEach(function(el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        });
    };

    window.focusDescriptionRow = function(index) {
        var DOM = window.DOM;
        if (!DOM || !DOM.descriptionList) return;
        
        DOM.descriptionList.querySelectorAll('.desc-row').forEach(function(row) {
            row.classList.remove('selected-pin');
        });
        
        var row = DOM.descriptionList.querySelector(`.desc-row[data-index="${index}"]`);
        if (row) {
            row.classList.add('selected-pin');
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            var input = row.querySelector('.desc-input');
            if (input) {
                input.focus();
                if (typeof window.autoResizeDescriptionInputs === 'function') {
                    window.autoResizeDescriptionInputs();
                }
            }
        }
    };

    window.deleteAnnotation = function(index) {
        var state = window.state;
        if (state.isReadOnly || !state.activeFile) return;
        state.activeFile.meta.description.splice(index, 1);
        markAsDirty(); 
        renderDescriptionList();
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
