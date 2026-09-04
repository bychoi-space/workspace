/**
 * vctrl_v3.js - Legacy & Utility Engine
 * Responsibility: Annotation pins, canvas interaction (zoom/pan), and viewport management.
 * 
 * IMPORTANT: This file uses window.state and window.DOM directly (not cached const)
 * to ensure references are always live, regardless of script load timing.
 */

console.log("%c [VCTRL V3] Utility Engine Loaded ", "background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

// 2. Annotation & Pins System
window.renderDescriptionList = function() {
    var state = window.state, DOM = window.DOM;
    if (!state || !state.activeFile) return;
    var list = state.activeFile.meta.description;
    if (!DOM || !DOM.descriptionList || !DOM.pinsLayer) return;

    DOM.descriptionList.innerHTML = '';
    DOM.pinsLayer.innerHTML = '';

    // Phase 3: LF_IMPORT_PINS is sent once during loadScreen only.
    // After that, text boxes live in iframe DOM and are saved as HTML.

    list.forEach(function(item, index) {
        // Description Row (Sidebar) - Kept in parent for easier editing
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
        
        // Pin Marker logic removed here...
        
        // Highlight logic (Synchronized with iframe pins)
        var highlight = function(active) { 
            row.classList.toggle('highlight', active); 
            if (DOM && DOM.iframe && DOM.iframe.contentWindow && window.MessageHub) {
                window.MessageHub.send(DOM.iframe.contentWindow, 'LF_HIGHLIGHT_PIN', { index: index, active: active });
            }
        };
        row.onmouseenter = function() { highlight(true); };
        row.onmouseleave = function() { highlight(false); };

        // Focus & Active state handling (Auto-scroll & pulse in responsive frames)
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

    // Auto-resize inputs after they are successfully appended
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
    
    // 기존 선택 하이라이트 일괄 해제
    DOM.descriptionList.querySelectorAll('.desc-row').forEach(function(row) {
        row.classList.remove('selected-pin');
    });
    
    // 대상 index 행 활성화 및 스크롤, 포커스
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
    markAsDirty(); renderDescriptionList();
};

window.spawnTextEditor = function(x, y, existingIndex) {
    if (existingIndex === undefined) existingIndex = -1;
    var state = window.state;
    if (state.isEditing) closeActiveEditor(true);
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
        applyBtn.onclick = function() { closeActiveEditor(true); };
    }
    const btnDel = document.getElementById('btn-editor-delete');
    if (btnDel) {
        btnDel.onclick = function() { deleteAnnotation(window.state.editingIndex); closeActiveEditor(false); };
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
    renderDescriptionList();
};

// 3. Canvas Utilities
window.toggleCrispView = function() {
    var state = window.state;
    if (!state) return;
    // Toggle between 100% Crisp Mode and Auto-Fit Mode
    if (state.viewMode === 'crisp' || Math.abs(state.transform.scale - 1.0) < 0.02) {
        state.viewMode = 'fit';
    } else {
        state.viewMode = 'crisp';
    }
    window.centerView();
};

window.centerView = function() {
    var DOM = window.DOM, state = window.state;
    if (!DOM || !DOM.canvas || !DOM.iframe || !state) return;
    var iw = parseInt(DOM.iframe.style.width) || 1600, ih = parseInt(DOM.iframe.style.height) || 900;
    var cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    var isResponsive = !!(state && state.isCurrentResponsiveScreen);

    // 브라우저 캔버스 영역에 맞춘 반응형 가변 배율(Fit Scale) 계산 (상하좌우 2% 안전 여백 반영)
    var fitScale = Math.min((cw * 0.98) / iw, (ch * 0.98) / ih);

    var s;
    if (state.viewMode === 'crisp') {
        // [100% 선명 뷰 모드 강제]: 모니터 해상도와 무관하게 1:1 물리 디스플레이 픽셀 선명도 100% 보장
        s = 1.0;
    } else {
        // [화면 맞춤(Fit) 모드]:
        // 1. 스마트 스냅 밴드 (Smart Snap Band):
        // 0.95 이상일 때는 1~2% 미세 축소(98%, 97% 등)로 인한 서브픽셀 텍스트 블러링을 방지하기 위해 1.0(100%) 강제 스냅!
        if (fitScale >= 0.95) {
            s = 1.0;
        } else if (cw >= 1700 && ch >= 880) {
            s = 1.0;
        } else {
            // 2. 소형 노트북/저해상도 화면(fitScale < 0.95):
            // 무한 소수점 보간 블러를 억제하고 물리 픽셀 그리드 정합성을 높이기 위해 5% 단위 그리드 스냅 (0.90, 0.85, 0.80...) 적용
            s = Math.max(0.2, Math.floor(fitScale * 20) / 20);
        }
    }

    var x = Math.round((cw - (iw * s)) / 2);
    // 세로 높이가 뷰포트를 초과하는 경우(s=1.0인데 ch가 900px보다 작을 때), 상단을 10px 안전 여백으로 배치하여 첫 타이틀부터 자연스럽게 노출
    var y;
    if (ih * s > ch) {
        y = 10;
    } else {
        y = Math.round((ch - (ih * s)) / 2);
    }

    state.transform = { x: x, y: y, scale: s };
    updateTransform();
};

window.updateTransform = function() {
    var DOM = window.DOM, state = window.state;
    if (!DOM || !state) return;
    var x = Math.round(state.transform.x);
    var y = Math.round(state.transform.y);
    if (DOM.stage) DOM.stage.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + state.transform.scale + ')';
    if (DOM.zoomTxt) DOM.zoomTxt.innerText = Math.round(state.transform.scale * 100) + '%';

    // 듀얼 뷰포트 토글 버튼 상태 동기화 (100% 선명 뷰 vs 화면 맞춤)
    var toggleBtn = document.getElementById('btn-crisp-toggle');
    var toggleIcon = document.getElementById('icon-crisp-toggle');
    if (toggleBtn && toggleIcon) {
        var is100 = Math.abs(state.transform.scale - 1.0) < 0.02;
        if (is100) {
            toggleIcon.innerText = 'fit_screen';
            toggleBtn.title = '화면 맞춤으로 전환 (단축키: 1)';
            toggleBtn.style.color = 'var(--v4-accent, #00e5ff)';
        } else {
            toggleIcon.innerText = 'center_focus_strong';
            toggleBtn.title = '100% 선명 뷰로 전환 (단축키: 1)';
            toggleBtn.style.color = '';
        }
    }
};

window.adjustZoom = function(delta) {
    var state = window.state, DOM = window.DOM;
    if (!state || !DOM || !DOM.canvas) return;
    var s = state.transform.scale;
    var ns = Math.max(0.1, Math.min(s + delta, 20));
    
    // Zoom relative to the center of the viewport
    var cw = DOM.canvas.clientWidth, ch = DOM.canvas.clientHeight;
    var mx = cw / 2, my = ch / 2;
    
    state.transform.x = mx - (mx - state.transform.x) * (ns / s);
    state.transform.y = my - (my - state.transform.y) * (ns / s);
    state.transform.scale = ns;
    updateTransform();
};

// 4. Device Viewport & Fullscreen
window.setDeviceViewport = function(type, w, h) {
    var DOM = window.DOM;
    document.querySelectorAll('.tools .device-btn').forEach(function(btn) { btn.classList.remove('active'); });
    if (DOM && DOM.artboardWrapper) { DOM.artboardWrapper.style.width = w + 'px'; DOM.artboardWrapper.style.height = h + 'px'; }
    if (DOM && DOM.iframe) { DOM.iframe.style.width = w + 'px'; DOM.iframe.style.height = h + 'px'; }
    setTimeout(function() { centerView(); }, 100);
};

window.toggleFullscreen = function(forceExit) {
    var DOM = window.DOM;
    var isActive = document.body.classList.contains('fullscreen-mode');
    var shouldExit = forceExit === true || (forceExit === undefined && isActive);
    document.body.classList.toggle('fullscreen-mode', !shouldExit);
    if (DOM && DOM.btnFullscreen) DOM.btnFullscreen.querySelector('span').innerText = shouldExit ? 'fullscreen' : 'fullscreen_exit';
    setTimeout(centerView, 350);
};

window.setTool = function(t) {
    var state = window.state, DOM = window.DOM;
    if (!state || !DOM) return;
    state.tool = t;
    if (DOM.canvas) DOM.canvas.classList.toggle('hand-active', t === 'hand');
    if (DOM.iframe) DOM.iframe.style.pointerEvents = t === 'hand' ? 'none' : 'auto';
    if (DOM.pinsLayer) DOM.pinsLayer.style.pointerEvents = (t === 'select') ? 'auto' : 'none';
};

// 5. Global Event Listeners
function initV3Listeners() {
    var DOM = window.DOM;
    if (!DOM) {
        console.warn("[VCTRL V3] DOM registry not found during listener init. Retrying...");
        setTimeout(initV3Listeners, 100);
        return;
    }

    window.addEventListener('keydown', function(e) {
        var state = window.state;
        if (!state) return;
        if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling
            if (state.tool !== 'hand') {
                if (DOM.canvas) DOM.canvas.classList.add('hand-active');
                if (DOM.iframe) DOM.iframe.style.pointerEvents = 'none';
                state.isHandMode = true;
            }
        }
        if (e.code === 'KeyV') setTool('select');
        if (e.code === 'KeyH') setTool('hand');
        if (e.code === 'KeyT') { if (window.handleTextboxCreation) window.handleTextboxCreation(); }
        if (e.code === 'KeyF') toggleFullscreen();
    });

    window.addEventListener('keyup', function(e) {
        var state = window.state, DOM = window.DOM;
        if (!state) return;
        if (e.code === 'Space') {
            if (state.tool !== 'hand') {
                if (DOM.canvas) DOM.canvas.classList.remove('hand-active');
                if (DOM.iframe) DOM.iframe.style.pointerEvents = 'auto';
                state.isHandMode = false;
            }
        }
    });

    if (DOM.canvas) {
        DOM.canvas.addEventListener('wheel', function(e) {
            var state = window.state;
            if (!state) return;
            // Floating Inspector Card, modals, or color pickers: allow native UI scrolling without triggering canvas scroll/zoom
            if (e.target.closest('#floating-inspector-card, .floating-inspector-card, #inspector-card, .modal-overlay, .v4-color-popover, .v4-picker-dropdown')) {
                return;
            }
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                var s = state.transform.scale;
                var ns = Math.max(0.1, Math.min(s * (1 + (e.deltaY > 0 ? -0.1 : 0.1)), 20));
                var r = DOM.canvas.getBoundingClientRect();
                var mx = e.clientX - r.left, my = e.clientY - r.top;
                state.transform.x = mx - (mx - state.transform.x) * (ns / s);
                state.transform.y = my - (my - state.transform.y) * (ns / s);
                state.transform.scale = ns;
                state.viewMode = 'custom';
                updateTransform();
            } else {
                // 스크린 크기가 캔버스를 초과할 때 트랙패드/마우스 휠 자연 스크롤 지원
                var DOM = window.DOM;
                var ih = (DOM && DOM.iframe && parseInt(DOM.iframe.style.height)) || 900;
                var iw = (DOM && DOM.iframe && parseInt(DOM.iframe.style.width)) || 1600;
                var ch = DOM.canvas.clientHeight;
                var cw = DOM.canvas.clientWidth;
                var renderedH = ih * state.transform.scale;
                var renderedW = iw * state.transform.scale;

                if (renderedH > ch || renderedW > cw) {
                    e.preventDefault();
                    state.transform.x -= e.deltaX;
                    state.transform.y -= e.deltaY;
                    updateTransform();
                }
            }
        }, { passive: false });

        DOM.canvas.addEventListener('mousedown', function(e) {
            var state = window.state, DOM = window.DOM;
            if (!state) return;
            if (e.target.closest('#floating-inspector-card')) return;
            if (state.tool === 'hand' || e.button === 1 || state.isHandMode) {
                state.isDragging = true;
                state.startX = e.clientX - state.transform.x;
                state.startY = e.clientY - state.transform.y;
                e.preventDefault();
            } else {
                // Clicked on empty canvas space
                if (window.closeActiveEditor) window.closeActiveEditor(true);
            }
        });
    }

    window.addEventListener('mousemove', function(e) {
        var state = window.state;
        if (!state || !state.isDragging) return;
        state.transform.x = e.clientX - state.startX;
        state.transform.y = e.clientY - state.startY;
        updateTransform();
    });

    window.addEventListener('mouseup', function() {
        var state = window.state;
        if (state) state.isDragging = false;
    });

    window.addEventListener('resize', function() {
        if (window.centerView) window.centerView();
    });

    window.addEventListener('keydown', function(e) {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.target.classList.contains('v4-editable-cell'))) {
            return;
        }
        if (e.key === '1' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            if (window.toggleCrispView) {
                e.preventDefault();
                window.toggleCrispView();
            }
        }
    });

    if (DOM && DOM.canvas) {
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(function(entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.contentRect.width > 100 && entry.contentRect.height > 100) {
                        if (window.centerView) window.centerView();
                    }
                }
            });
            ro.observe(DOM.canvas);
        }
    }

    console.log("[VCTRL V3] Utility Engine initialized successfully.");
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initV3Listeners);
} else {
    initV3Listeners();
}

// 6. MessageHub Deselection Integration
if (window.MessageHub) {
    MessageHub.subscribe('LF_DESELECT', function() {
        if (window.closeActiveEditor) window.closeActiveEditor(true);
    });
}
