/**
 * Dashboard Logic for bychoi workspace
 * Handles project listing, metadata management, and GitHub synchronization.
 */

const state = {
    projects: [],
    activeCategory: 'all',
    deletedProjects: new Set() // Blacklist for zombie projects
};

const DOM = {
    list: document.getElementById('file-list'),
    categoryFilterBar: document.getElementById('category-filter-bar'),
    ghStatus: document.getElementById('gh-status'),
    btnShowAuth: document.getElementById('btn-show-auth'),
    authBtnText: document.getElementById('auth-btn-text'),
    btnCreateProject: document.getElementById('btn-create-project'),
    uploadTop: document.getElementById('file-upload-top'),
    
    // Modal DOM
    modal: document.getElementById('metadata-modal'),
    modalMainTitle: document.getElementById('modal-main-title'),
    groupIdField: document.getElementById('group-project-id'),
    metaProjectId: document.getElementById('meta-project-id'),
    modalFilenameDisplay: document.getElementById('modal-filename'),
    metaTitle: document.getElementById('meta-title'),
    metaPeriod: document.getElementById('meta-period'),
    metaAssignee: document.getElementById('meta-assignee'),
    metaFigma: document.getElementById('meta-figma'),
    metaNotion: document.getElementById('meta-notion'),
    btnModalClose: document.getElementById('btn-modal-close'),
    btnModalSave: document.getElementById('btn-modal-save'),
    
    // Auth Modal DOM
    authModal: document.getElementById('auth-modal'),
    btnAuthClose: document.getElementById('btn-modal-auth-cancel'),
    btnAuthSubmit: document.getElementById('btn-modal-auth-submit'),
    btnAuthTest: document.getElementById('btn-modal-auth-test'),
    tokenInput: document.getElementById('modal-gh-token'),
    ownerInput: document.getElementById('modal-gh-owner'),
    repoInput: document.getElementById('modal-gh-repo'),
    authStatus: document.getElementById('modal-auth-status'),

    // Global Loader DOM
    globalLoader: document.getElementById('global-loader'),
    progressBar: document.getElementById('progress-bar'),
    nanoProgressLine: document.getElementById('nano-progress-line'),
    loaderStatus: document.getElementById('loader-status')
};

const context = {
    currentEditingProject: null,
    isCreateMode: false
};

// 8 Semantic Project Categories (Delegated to Shared SSOT in assets/app.js)
const PROJECT_CATEGORIES = window.PROJECT_CATEGORIES || [];
const PREMIUM_THEMES = PROJECT_CATEGORIES;

const inferCategoryFromProject = function(projectName, meta) {
    if (typeof window.inferCategoryFromProject === 'function' && window.inferCategoryFromProject !== inferCategoryFromProject) {
        return window.inferCategoryFromProject(projectName, meta);
    }
    return PROJECT_CATEGORIES[7] || {};
}

const resolveProjectCategory = function(projectName, meta) {
    if (typeof window.resolveProjectCategory === 'function' && window.resolveProjectCategory !== resolveProjectCategory) {
        return window.resolveProjectCategory(projectName, meta);
    }
    return inferCategoryFromProject(projectName, meta);
}

// Legacy compatibility wrapper
function getDeterministicTheme(projectName, meta) {
    return resolveProjectCategory(projectName, meta);
}

// Humanize raw template screen names for clean preview on project cards
function humanizeScreenTitle(rawTitle, filename) {
    const t = (rawTitle || filename || '').replace(/\.html?$/i, '').trim();
    if (!t) return '';
    if (/^00_cover/i.test(t) || t === '과제 커버' || t === '커버') return '표지';
    if (/^01_arch/i.test(t)) return '아키텍처';
    if (/^0[23]_plan/i.test(t)) return '기획안';
    if (/^04_case_study/i.test(t)) return '사례 조사';
    if (/^05_front_ui/i.test(t)) return 'Front UI';
    if (/^0[67]_mobile/i.test(t)) return '모바일 UI';
    if (/^08_responsive/i.test(t)) return 'PC/MO 반응형';
    if (/^09_admin/i.test(t)) return 'Admin 화면';
    if (/^10_blank/i.test(t)) return '자유 캔버스';
    // Strip leading numeric prefix like "01_비즈니스 프로세스 맵" -> "비즈니스 프로세스 맵"
    return t.replace(/^\d{2}_/, '').trim();
}

// Build a 1-line summary of the screens inside a project
function getScreenCompositionSummary(meta) {
    const screensObj = (meta && (meta.screens || meta.files)) || {};
    const keys = (meta && Array.isArray(meta.screenOrder) && meta.screenOrder.length > 0)
        ? meta.screenOrder.filter(k => screensObj[k])
        : Object.keys(screensObj);

    if (keys.length === 0) {
        return { shortText: '등록된 화면이 없습니다', fullText: '등록된 화면이 없습니다' };
    }

    const rawTitles = keys.map(k => {
        const sc = screensObj[k] || {};
        return humanizeScreenTitle(sc.title, k);
    }).filter(Boolean);

    // Group consecutive or duplicate generic labels while preserving order
    const counts = {};
    const uniqueOrder = [];
    rawTitles.forEach(label => {
        if (!counts[label]) {
            counts[label] = 1;
            uniqueOrder.push(label);
        } else {
            counts[label]++;
        }
    });

    const formattedItems = uniqueOrder.map(label => counts[label] > 1 ? `${label}(${counts[label]})` : label);
    const fullText = formattedItems.join(' · ');

    // Skip generic '표지' at the very front if there are more descriptive screens after it
    const meaningful = formattedItems.length > 1 && formattedItems[0] === '표지'
        ? formattedItems.slice(1)
        : formattedItems;

    const previewSlice = meaningful.slice(0, 3);
    const remainCount = meaningful.length - previewSlice.length;
    const shortText = remainCount > 0
        ? `${previewSlice.join(' · ')} 외 ${remainCount}건`
        : previewSlice.join(' · ');

    return { shortText, fullText };
}

// Render dynamic category presets inside project create/edit modal
function renderThemePresets(selectedCategoryOrIndex) {
    const container = document.getElementById('theme-presets');
    if (!container) return;
    container.innerHTML = '';

    // Determine active category ID ('auto' or one of the 7 category IDs)
    let activeCatId = 'auto';
    if (typeof selectedCategoryOrIndex === 'string' && selectedCategoryOrIndex.trim() !== '') {
        if (selectedCategoryOrIndex === '-1' || selectedCategoryOrIndex === 'auto') {
            activeCatId = 'auto';
        } else if (PROJECT_CATEGORIES.some(c => c.id === selectedCategoryOrIndex)) {
            activeCatId = selectedCategoryOrIndex;
        }
    } else if (typeof selectedCategoryOrIndex === 'number' && selectedCategoryOrIndex >= 0 && selectedCategoryOrIndex < PROJECT_CATEGORIES.length) {
        activeCatId = PROJECT_CATEGORIES[selectedCategoryOrIndex].id;
    }

    const syncHiddenInputs = (catId, idx) => {
        const indexInput = document.getElementById('meta-theme-index');
        const catInput = document.getElementById('meta-category-id');
        if (indexInput) indexInput.value = String(idx);
        if (catInput) catInput.value = catId;
    };

    // 1. Auto-Classification Option (Full-width top pill or first item)
    const autoCard = document.createElement('button');
    autoCard.type = 'button';
    autoCard.className = `category-preset-card category-preset-auto ${activeCatId === 'auto' ? 'active' : ''}`;
    autoCard.dataset.categoryId = 'auto';
    autoCard.dataset.index = '-1';
    autoCard.innerHTML = `
        <div class="category-preset-icon category-preset-icon-auto">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"></path>
                <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"></path>
            </svg>
        </div>
        <div class="category-preset-info">
            <span class="category-preset-name">자동 분류 (제목 및 화면 기반 스마트 매칭)</span>
            <span class="category-preset-desc">과제 제목과 포함된 화면 성격을 분석하여 최적 분류 자동 지정</span>
        </div>
    `;
    container.appendChild(autoCard);

    // 2. Semantic Category Cards
    PROJECT_CATEGORIES.forEach((cat, idx) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `category-preset-card ${activeCatId === cat.id ? 'active' : ''}`;
        card.dataset.categoryId = cat.id;
        card.dataset.index = String(idx);
        card.style.setProperty('--cat-accent-dark', cat.accentColor);
        card.style.setProperty('--cat-accent-light', cat.lightAccent || cat.accentColor);
        card.innerHTML = `
            <div class="category-preset-icon">
                ${cat.svgIcon || ''}
            </div>
            <div class="category-preset-info">
                <span class="category-preset-name">${cat.name}</span>
                <span class="category-preset-desc">${cat.desc}</span>
            </div>
        `;
        container.appendChild(card);
    });

    // Sync initial hidden input values
    const matchedCat = PROJECT_CATEGORIES.find(c => c.id === activeCatId);
    syncHiddenInputs(activeCatId, matchedCat ? matchedCat.index : -1);

    // Click handler
    container.querySelectorAll('.category-preset-card').forEach(card => {
        card.onclick = () => {
            container.querySelectorAll('.category-preset-card').forEach(el => el.classList.remove('active'));
            card.classList.add('active');
            syncHiddenInputs(card.dataset.categoryId, parseInt(card.dataset.index, 10));
        };
    });
}

// Compute filtered projects based on active category tab + search input
function getFilteredProjects() {
    const searchInputEl = document.getElementById('project-search-input');
    const query = searchInputEl ? searchInputEl.value.toLowerCase().trim() : '';

    return state.projects.filter(p => {
        const cat = resolveProjectCategory(p.name, p.meta);
        if (state.activeCategory !== 'all' && cat.id !== state.activeCategory) {
            return false;
        }
        if (!query) return true;
        const idMatch = p.name.toLowerCase().includes(query);
        const titleMatch = ((p.meta && p.meta.title) || '').toLowerCase().includes(query);
        const catMatch = cat.name.toLowerCase().includes(query) || cat.badge.toLowerCase().includes(query);
        const assigneeMatch = ((p.meta && p.meta.assignee) || '').toLowerCase().includes(query);
        return idMatch || titleMatch || catMatch || assigneeMatch;
    });
}

// Render top Category Filter Bar
function renderCategoryFilterBar() {
    const bar = document.getElementById('category-filter-bar');
    if (!bar) return;

    // Count projects per category
    const counts = { all: state.projects.length };
    PROJECT_CATEGORIES.forEach(c => { counts[c.id] = 0; });
    state.projects.forEach(p => {
        const cat = resolveProjectCategory(p.name, p.meta);
        if (cat && counts[cat.id] !== undefined) {
            counts[cat.id]++;
        }
    });

    const totalBadge = document.getElementById('project-total-badge');
    if (totalBadge) {
        totalBadge.textContent = counts.all > 0 ? String(counts.all) : '';
    }

    let html = `
        <button type="button" class="category-tab-btn ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">
            <span class="category-tab-svg-wrap category-tab-all-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5"></rect>
                    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5"></rect>
                    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5"></rect>
                    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5"></rect>
                </svg>
            </span>
            <span class="category-tab-label">전체 과제</span>
            <span class="category-tab-count">${counts.all}</span>
        </button>
    `;

    PROJECT_CATEGORIES.forEach(cat => {
        const count = counts[cat.id] || 0;
        const isActive = state.activeCategory === cat.id;
        const isEmpty = count === 0;
        html += `
            <button type="button" class="category-tab-btn ${isActive ? 'active' : ''} ${isEmpty ? 'is-empty' : ''}" data-category="${cat.id}" style="--tab-accent-dark: ${cat.accentColor}; --tab-accent-light: ${cat.lightAccent || cat.accentColor};">
                <span class="category-tab-dot" aria-hidden="true"></span>
                <span class="category-tab-label">${cat.shortName}</span>
                <span class="category-tab-count">${count}</span>
            </button>
        `;
    });

    bar.innerHTML = html;

    bar.querySelectorAll('.category-tab-btn').forEach(btn => {
        btn.onclick = () => {
            const targetCat = btn.dataset.category || 'all';
            if (state.activeCategory === targetCat) return;
            state.activeCategory = targetCat;
            renderCategoryFilterBar();
            renderList(getFilteredProjects());
        };
    });
}


// Initialize GitHub Status
function updateStatusUI(text, color) {
    const repoInfo = ` [${ghConfig.owner}/${ghConfig.repo}]`;
    DOM.ghStatus.innerText = text + (text.includes('에러') || text.includes('실패') ? repoInfo : '');
    if (color) DOM.ghStatus.style.color = color;
}

function checkEnvironment() {
    if (window.location.protocol === 'file:') {
        console.warn("[Env] Running on file:// protocol. This may cause CORS issues.");
        
        // Check dismissal for today
        const today = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('hide_env_warning') === today) return;

        const banner = document.createElement('div');
        banner.className = 'env-banner';
        banner.innerHTML = `
            <span class="material-icons-outlined" style="color: #f87171;">warning</span>
            <div class="env-banner-text">
                <b>주의:</b> 브라우저 보안 정책으로 인해 로컬 파일 실행 시 프로젝트 생성이 제한될 수 있습니다. (Live Server 권장)
            </div>
            <button class="btn-close-banner">오늘 하루 보지 않기</button>
        `;
        if (document.body) {
            document.body.appendChild(banner);
            // Animate in
            setTimeout(() => banner.classList.add('active'), 100);
        }

        banner.querySelector('.btn-close-banner').onclick = () => {
            localStorage.setItem('hide_env_warning', today);
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 500);
        };
    }
    console.log(`[Config] Target Repo: ${ghConfig.owner}/${ghConfig.repo}`);
}

// Project List Rendering
async function refreshFileList() {
    updateStatusUI('', ''); 
    
    try {
        const rootItems = await listRepoRoot();
        const systemFiles = ['index.html', 'viewer.html', 'stitch_ui_viewer.html'];
        const legacies = (Array.isArray(rootItems) ? rootItems : []).filter(i => 
            i.type === 'file' && 
            (i.name.endsWith('.html') || i.name.endsWith('.htm')) &&
            !systemFiles.includes(i.name.toLowerCase())
        );
        
        const dataItems = await listContents('');
        if (!Array.isArray(dataItems)) {
            throw new Error("Could not fetch project list (invalid response)");
        }
        let folders = dataItems.filter(i => i.type === 'dir' && i.name !== 'assets');
        folders = folders.filter(f => !state.deletedProjects.has(f.name));

        if (legacies.length > 0) {
            console.log("[Migration] Found legacy files in root. Moving to Default_Project...");
            updateStatusUI('기존 파일 마이그레이션 중...', '#f59e0b');
            
            const defaultMeta = await fetchProjectMetadata('Default_Project');
            for (const f of legacies) {
                try {
                    const content = await fetchFileContent(f.name, true);
                    if (content) {
                        defaultMeta.screens = defaultMeta.screens || {};
                        defaultMeta.screens[f.name] = { updatedAt: new Date().toISOString() };
                        await uploadToProject('Default_Project', f.name, content);
                        await deleteFileFromGitHub(f.name, f.sha, true);
                    }
                } catch (e) { console.error("Migration failed for:", f.name, e); }
            }
            await saveProjectMetadata('Default_Project', defaultMeta);
            if (!folders.find(fol => fol.name === 'Default_Project')) {
                folders.push({ name: 'Default_Project', type: 'dir' });
            }
        }



// Render modern Shimmer Glass Skeleton Cards while fetching (Compact Header A-Style)
function renderSkeletons(count = 6) {
    if (!DOM.list) return;
    const isMobile = window.innerWidth <= 768;
    const actualCount = isMobile ? Math.min(count, 4) : count;
    let html = '';
    for (let i = 0; i < actualCount; i++) {
        html += `
            <div class="file-card file-card-skeleton" style="--card-index: ${i}">
                <div class="skeleton-banner"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-meta"></div>
                    <div class="skeleton-chips">
                        <div class="skeleton-chip"></div>
                        <div class="skeleton-chip"></div>
                    </div>
                </div>
            </div>`;
    }
    DOM.list.innerHTML = html;
}

        renderCategoryFilterBar();
        renderSkeletons(8);

        if (DOM.globalLoader) {
            DOM.globalLoader.classList.add('active');
            if (window.innerWidth <= 768) {
                DOM.globalLoader.classList.add('mobile-nano-only');
            } else {
                DOM.globalLoader.classList.remove('mobile-nano-only');
            }
            if (DOM.progressBar) DOM.progressBar.style.width = '0%';
            if (DOM.nanoProgressLine) DOM.nanoProgressLine.style.width = '0%';
            if (DOM.loaderStatus) DOM.loaderStatus.innerText = `프로젝트 정보를 불러오는 중... (0/${folders.length})`;
        }

        let loadedCount = 0;
        const projectData = await Promise.all(folders.map(async (folder) => {
            try {
                const meta = await fetchProjectMetadata(folder.name);
                const screens = meta.screens || meta.files || {};
                
                loadedCount++;
                const percent = Math.round((loadedCount / folders.length) * 100);
                if (DOM.progressBar) {
                    DOM.progressBar.style.width = percent + '%';
                }
                if (DOM.nanoProgressLine) {
                    DOM.nanoProgressLine.style.width = percent + '%';
                }
                if (DOM.loaderStatus) {
                    DOM.loaderStatus.innerText = `프로젝트 정보를 불러오는 중... (${loadedCount}/${folders.length})`;
                }

                return {
                    name: folder.name, meta: meta, screens: Object.keys(screens).length
                };
            } catch (e) {
                loadedCount++;
                return { name: folder.name, meta: {title: folder.name}, screens: 0 };
            }
        }));

        state.projects = projectData.filter(p => !state.deletedProjects.has(p.name));
        renderCategoryFilterBar();
        renderList(getFilteredProjects());
        
        setTimeout(() => {
            if (DOM.globalLoader) DOM.globalLoader.classList.remove('active', 'mobile-nano-only');
            if (DOM.nanoProgressLine) DOM.nanoProgressLine.style.width = '100%';
            setTimeout(() => {
                if (DOM.nanoProgressLine) DOM.nanoProgressLine.style.width = '0%';
            }, 300);
        }, 400);
        updateStatusUI('', '');
    } catch (err) {
        console.error("refreshFileList error:", err); if (DOM.globalLoader) DOM.globalLoader.classList.remove('active', 'mobile-nano-only');
        updateStatusUI('연결 확인 필요', '#f97316');
        DOM.list.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-state-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                        <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                        <line x1="12" y1="20" x2="12.01" y2="20"></line>
                    </svg>
                </div>
                <div class="empty-state-title">데이터를 불러오는 데 어려움이 있습니다</div>
                <div class="empty-state-desc">
                    원격 저장소에 접근할 수 없거나 토큰 권한이 만료되었을 수 있습니다.<br>
                    설정을 확인하거나 잠시 후 다시 시도해 주세요.
                </div>
                <button onclick="location.reload()" class="btn-secondary empty-state-btn" type="button">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    <span>새로고침</span>
                </button>
            </div>`;
    } finally {
        const loading = document.getElementById('loading-state');
        if (loading) loading.style.display = 'none';
    }
}

async function showAuthModal() {
    if (DOM.ownerInput) DOM.ownerInput.value = ghConfig.owner;
    if (DOM.repoInput) DOM.repoInput.value = ghConfig.repo;
    if (DOM.tokenInput) DOM.tokenInput.value = ghConfig.token || '';
    if (DOM.authModal) DOM.authModal.classList.add('active');
}
function hideAuthModal() {
    if (DOM.authModal) DOM.authModal.classList.remove('active');
    if (DOM.authStatus) DOM.authStatus.innerText = "";
}
async function handleAuthSubmit() {
    const config = {
        token: DOM.tokenInput.value.trim(),
        owner: DOM.ownerInput.value.trim(),
        repo: DOM.repoInput.value.trim()
    };

    const success = await verifyConnection(config, (msg, color) => {
        DOM.authStatus.innerText = msg;
        DOM.authStatus.style.color = color;
    });

    if (success) {
        ghConfig.owner = config.owner;
        ghConfig.repo = config.repo;
        ghConfig.token = config.token;
        setTimeout(() => {
            hideAuthModal();
            location.reload(); 
        }, 1000);
    }
}

async function handleAuthTest() {
    const config = {
        token: DOM.tokenInput.value.trim(), owner: DOM.ownerInput.value.trim(), repo: DOM.repoInput.value.trim()
    };
    await verifyConnection(config, (msg, color) => {
        DOM.authStatus.innerText = msg;
        DOM.authStatus.style.color = color;
    });
}

// Compute the latest update date from a project's screens and metadata
function getLatestUpdateDate(meta) {
    let latest = null;
    if (meta.screens) {
        for (const file in meta.screens) {
            const sc = meta.screens[file];
            if (sc.updatedAt) {
                const date = new Date(sc.updatedAt);
                if (!latest || date > latest) latest = date;
            }
        }
    }
    if (meta.updatedAt) {
        const date = new Date(meta.updatedAt);
        if (!latest || date > latest) latest = date;
    }
    return latest;
}

// Format Date object to a human-readable relative string
function formatRelativeTime(date) {
    if (!date || isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
}

// Ensure a date string has a day of week in parentheses
function ensureDayOfWeek(dateStr) {
    if (!dateStr) return '';
    const trimmed = dateStr.trim();
    if (trimmed.includes('(')) return trimmed;
    
    // Check YYYY.MM.DD or YYYY-MM-DD format
    const match = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return `${match[1]}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}(${days[d.getDay()]})`;
        }
    }
    return trimmed;
}


const escapeHtmlAttr = window.escapeHtmlAttr;

async function renderList(projectsToRender = getFilteredProjects()) {
    if (projectsToRender.length === 0) {
        const isSearch = document.getElementById('project-search-input') && document.getElementById('project-search-input').value.trim() !== '';
        const isCategoryFilter = state.activeCategory !== 'all';
        const activeCatObj = PROJECT_CATEGORIES.find(c => c.id === state.activeCategory);
        let msg = "생성된 프로젝트가 없습니다. 우측 상단의 New Project 버튼을 눌러 새 프로젝트를 생성해주세요.";
        if (isSearch) {
            msg = "검색 조건에 일치하는 프로젝트가 없습니다.";
        } else if (isCategoryFilter && activeCatObj) {
            msg = `'${activeCatObj.name}' 분류에 등록된 프로젝트가 없습니다. 프로젝트 정보 수정에서 분류를 지정할 수 있습니다.`;
        }
        DOM.list.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-state-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div class="empty-state-title">표시할 프로젝트가 없습니다</div>
                <div class="empty-state-desc">${escapeHtmlAttr(msg)}</div>
            </div>`;
        return;
    }
    DOM.list.innerHTML = '';
    for (let i = 0; i < projectsToRender.length; i++) {
        const p = projectsToRender[i];
        const card = document.createElement('a');
        card.className = 'file-card';
        card.style.setProperty('--card-index', i);
        card.href = `viewer.html?project=${encodeURIComponent(p.name)}`;

        const m = p.meta || {};
        const mainTitle = m.title || p.name;

        // Resolve semantic project category
        const category = resolveProjectCategory(p.name, m);
        card.dataset.category = category.id;
        card.style.setProperty('--card-accent-dark', category.accentColor);
        card.style.setProperty('--card-accent-light', category.lightAccent || category.accentColor);

        // Extract screen composition summary
        const screenSummary = getScreenCompositionSummary(m);

        const assigneeVal = (m.assignee && m.assignee.trim()) ? m.assignee.trim() : '';
        const periodVal = (m.period && m.period.trim()) ? m.period.trim() : '';
        const figmaVal = (m.figmaUrl && m.figmaUrl.trim()) ? m.figmaUrl.trim() : '';
        const notionVal = (m.notionUrl && m.notionUrl.trim()) ? m.notionUrl.trim() : '';
        const hasMeta = Boolean(assigneeVal || periodVal || figmaVal || notionVal);

        let leftMetaHtml = '';
        if (assigneeVal || periodVal) {
            const parts = [];
            if (assigneeVal) {
                parts.push(`<span class="meta-text-item meta-text-assignee" title="담당자: ${escapeHtmlAttr(assigneeVal)}">${escapeHtmlAttr(assigneeVal)}</span>`);
            }
            if (periodVal) {
                const rawPeriod = periodVal.includes(' ~ ') ? periodVal.split(' ~ ')[0] : periodVal;
                const displayPeriod = ensureDayOfWeek(rawPeriod);
                parts.push(`<span class="meta-text-item meta-text-period" title="기간: ${escapeHtmlAttr(periodVal)}">${escapeHtmlAttr(displayPeriod)}</span>`);
            }
            leftMetaHtml = parts.join('<span class="meta-dot-sep" aria-hidden="true">·</span>');
        } else {
            const latestDate = getLatestUpdateDate(m);
            const relativeTime = formatRelativeTime(latestDate);
            const updateStr = relativeTime ? `${relativeTime} 업데이트` : '업데이트 기록 없음';
            leftMetaHtml = `<span class="meta-text-item meta-text-update" title="${escapeHtmlAttr(updateStr)}">${escapeHtmlAttr(updateStr)}</span>`;
        }

        let rightLinksHtml = '';
        if (figmaVal) {
            rightLinksHtml += `
                <a href="${escapeHtmlAttr(figmaVal)}" target="_blank" rel="noopener noreferrer" class="meta-chip meta-chip-figma" title="Figma 바로가기">
                    <svg class="meta-chip-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                        <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                        <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                        <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                        <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
                    </svg>
                    <span>Figma</span>
                </a>`;
        }
        if (notionVal) {
            rightLinksHtml += `
                <a href="${escapeHtmlAttr(notionVal)}" target="_blank" rel="noopener noreferrer" class="meta-chip meta-chip-notion" title="Notion 바로가기">
                    <svg class="meta-chip-svg" viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
                        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.373-.747.934zm14.337.747.093 10.92-2.147.14-.093-7.56-3.267 7.7-1.727.093-3.174-7.514v7.7l-2.007.14V7.942l2.613-.187 3.5 7.98 3.314-7.887z"/>
                    </svg>
                    <span>Notion</span>
                </a>`;
        }
        if (!hasMeta) {
            rightLinksHtml += `
                <div class="meta-chip meta-chip-add-cta" data-project="${escapeHtmlAttr(p.name)}" title="프로젝트 정보 입력하기">
                    <svg class="meta-chip-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>정보 입력</span>
                </div>`;
        }

        card.innerHTML = `
            <div class="card-category-banner">
                <div class="card-category-left">
                    <div class="card-category-icon-box" aria-hidden="true">
                        ${category.svgIcon || ''}
                    </div>
                    <span class="card-category-badge">${escapeHtmlAttr(category.name)}</span>
                </div>
                <div class="card-category-right">
                    <span class="card-screen-count-pill" title="총 ${p.screens}개 화면">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <rect x="7" y="3" width="14" height="14" rx="2"></rect>
                            <path d="M17 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"></path>
                        </svg>
                        <span>${p.screens}</span>
                    </span>
                    <div class="card-action-group">
                        <div class="copy-url-btn-card" data-project="${escapeHtmlAttr(p.name)}" title="프로젝트 URL 복사">
                            <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </div>
                        <div class="pdf-btn-card" data-project="${escapeHtmlAttr(p.name)}" title="전체 화면 PDF 다운로드">
                            <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <path d="M12 18v-6"></path>
                                <path d="M9.5 15.5L12 18l2.5-2.5"></path>
                            </svg>
                        </div>
                        <div class="edit-btn-card" data-project="${escapeHtmlAttr(p.name)}" title="프로젝트 정보 수정">
                            <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                        </div>
                        <div class="delete-btn-card" data-project="${escapeHtmlAttr(p.name)}" title="프로젝트 삭제">
                            <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-info">
                <div class="card-name" title="${escapeHtmlAttr(mainTitle)}">${escapeHtmlAttr(mainTitle)}</div>
                <div class="card-screen-summary" title="화면 구성: ${escapeHtmlAttr(screenSummary.fullText)}">
                    <svg class="card-summary-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    <span class="card-summary-text">${escapeHtmlAttr(screenSummary.shortText)}</span>
                </div>
                <div class="card-footer-divider"></div>
                <div class="card-meta-chips">
                    <div class="card-meta-primary">${leftMetaHtml}</div>
                    ${rightLinksHtml ? `<div class="card-meta-links">${rightLinksHtml}</div>` : ''}
                </div>
            </div>
        `;
        DOM.list.appendChild(card);
    }
}

document.addEventListener('click', async (e) => {
    const copyUrlBtn = e.target.closest('.copy-url-btn-card');
    const pdfBtn = e.target.closest('.pdf-btn-card');
    const delBtn = e.target.closest('.delete-btn-card');
    const editBtn = e.target.closest('.edit-btn-card');
    const figmaLink = e.target.closest('.meta-chip-figma');
    const notionLink = e.target.closest('.meta-chip-notion');
    const addCta = e.target.closest('.meta-chip-add-cta');

    if (copyUrlBtn) {
        e.preventDefault(); e.stopPropagation();
        const projName = copyUrlBtn.dataset.project;
        if (typeof copyProjectShortUrl === 'function') {
            copyProjectShortUrl(projName);
        } else {
            alert("단축 URL 엔진이 로드되지 않았습니다.");
        }
        return;
    }

    if (pdfBtn) {
        e.preventDefault(); e.stopPropagation();
        const projName = pdfBtn.dataset.project;
        const targetProj = state.projects.find(p => p.name === projName);
        exportProjectToPDF(projName, targetProj ? targetProj.meta : null);
    }

    if (figmaLink || notionLink) {
        e.stopPropagation();
    }

    if (addCta) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        openEditProjectModal(addCta.dataset.project);
    }

    if (editBtn) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        openEditProjectModal(editBtn.dataset.project);
    }

    if (delBtn) {
        e.preventDefault(); e.stopPropagation();
        if (ghConfig.isReadOnly) return showAuthModal();
        const projectName = delBtn.dataset.project;
        
        const confirmed = await Notification.confirm(`'${projectName}' 프로젝트와 모든 관련 파일을 삭제하시겠습니까?\n이 작업은 절대 되돌릴 수 없습니다.`, "프로젝트 영구 삭제");
        if (confirmed) {
            updateStatusUI('프로젝트 삭제 중...', '#f87171');
            
            // 게이지바 초기화 및 활성화
            let deleteProgress = 10;
            if (DOM.globalLoader) {
                DOM.globalLoader.classList.add('active');
                DOM.loaderStatus.innerText = '삭제 대상 분석 중...';
                if (DOM.progressBar) DOM.progressBar.style.width = deleteProgress + '%';
            }

            // 커스텀 로딩 상태 업데이트 콜백 정의
            const deleteStatusCallback = (text, color) => {
                updateStatusUI(text, color);
                if (DOM.globalLoader) {
                    if (DOM.loaderStatus) DOM.loaderStatus.innerText = text;
                    if (DOM.progressBar) {
                        deleteProgress = Math.min(deleteProgress + 8, 95); // 95%까지 서서히 증가
                        DOM.progressBar.style.width = deleteProgress + '%';
                    }
                }
            };

            const success = await deleteProjectWithContents(projectName, deleteStatusCallback);
            if (success) {
                // UI 즉시 반영 + 블랙리스트 등록 (UI에서 완전히 제거)
                state.deletedProjects.add(projectName);
                state.projects = state.projects.filter(p => p.name !== projectName);
                renderCategoryFilterBar();
                renderList(getFilteredProjects());
                
                if (DOM.progressBar) DOM.progressBar.style.width = '100%';
                updateStatusUI(`'${projectName}' 삭제 완료`, '#4ade80');
                if (DOM.loaderStatus) DOM.loaderStatus.innerText = `'${projectName}' 삭제를 완료하였습니다.`;
                
                // 완료 후 로더 화면을 부드럽게 퇴장 처리
                setTimeout(() => {
                    if (DOM.globalLoader) DOM.globalLoader.classList.remove('active');
                    refreshFileList(); // Background refresh to sync with GH
                }, 1500); 
            } else {
                updateStatusUI('삭제 실패 (일부 파일 잔류 가능)', '#f87171');
                if (DOM.loaderStatus) DOM.loaderStatus.innerText = '삭제 중 오류가 발생했습니다.';
                if (DOM.globalLoader) DOM.globalLoader.classList.remove('active');
                Notification.alert("삭제 중 오류가 발생했습니다. 일부 파일이 지워지지 않았을 수 있습니다. 잠시 후 다시 시도하거나 수동으로 삭제해 주세요.", "오류", "error");
            }
        }
    }
});

function formatKODateRange(selectedDates) {
    if (selectedDates.length !== 2) return '';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        return `${year}.${month}.${date}(${days[d.getDay()]})`;
    };
    return `${format(selectedDates[0])} ~ ${format(selectedDates[1])}`;
}

function initDatePicker(defaultValue = null) {
    flatpickr(DOM.metaPeriod, {
        mode: "range", locale: "ko", dateFormat: "Y.m.d",
        defaultDate: defaultValue ? defaultValue.split(' ~ ') : null,
        onChange: (selectedDates) => {
            if (selectedDates.length === 2) {
                DOM.metaPeriod.value = formatKODateRange(selectedDates);
            }
        }
    });
}

if (DOM.btnCreateProject) {
    DOM.btnCreateProject.onclick = async () => {
        if (ghConfig.isReadOnly) return showAuthModal();
        context.isCreateMode = true;
        context.currentEditingProject = null;
        if (DOM.modalMainTitle) DOM.modalMainTitle.innerText = "새 프로젝트 생성";
        if (DOM.groupIdField) DOM.groupIdField.style.display = "none";
        if (DOM.modalFilenameDisplay) DOM.modalFilenameDisplay.innerText = "새로운 프로젝트를 생성합니다. 제목을 입력하면 ID가 자동 생성됩니다.";
        if (DOM.metaProjectId) DOM.metaProjectId.value = "";
        if (DOM.metaTitle) DOM.metaTitle.value = "";
        if (DOM.metaPeriod) DOM.metaPeriod.value = "";
        if (DOM.metaAssignee) DOM.metaAssignee.value = "";
        if (DOM.metaFigma) DOM.metaFigma.value = "";
        if (DOM.metaNotion) DOM.metaNotion.value = "";
        initDatePicker();
        
        // Initialize category preset to Auto ('auto') or active filter category if selected
        const initialCat = state.activeCategory !== 'all' ? state.activeCategory : 'auto';
        renderThemePresets(initialCat);

        if (DOM.modal) DOM.modal.classList.add('active');
        if (DOM.metaTitle) {
            DOM.metaTitle.oninput = () => {
                if (context.isCreateMode && DOM.metaProjectId) DOM.metaProjectId.value = slugify(DOM.metaTitle.value);
            };
        }
    };
}

async function openEditProjectModal(projectName) {
    context.isCreateMode = false;
    context.currentEditingProject = projectName;
    if (DOM.modalMainTitle) DOM.modalMainTitle.innerText = "프로젝트 정보 수정";
    if (DOM.groupIdField) DOM.groupIdField.style.display = "none";
    updateStatusUI('메타데이터 로딩 중...', '#f59e0b');
    
    let m = null;
    try {
        m = await fetchProjectMetadata(projectName);
    } catch(e) {
        console.warn("[Dashboard] fetchProjectMetadata fallback for modal:", e);
        const existing = (state.projects || []).find(p => p.name === projectName);
        m = (existing && existing.meta) ? existing.meta : { title: projectName, screens: {} };
    }
    updateStatusUI('', '');

    if (DOM.modalFilenameDisplay) DOM.modalFilenameDisplay.innerText = `Project: ${projectName}`;
    if (DOM.metaTitle) DOM.metaTitle.value = (m && m.title) || projectName;
    if (DOM.metaPeriod) DOM.metaPeriod.value = (m && m.period) || '';
    if (DOM.metaAssignee) DOM.metaAssignee.value = (m && m.assignee) || '';
    if (DOM.metaFigma) DOM.metaFigma.value = (m && m.figmaUrl) || '';
    if (DOM.metaNotion) DOM.metaNotion.value = (m && m.notionUrl) || '';
    initDatePicker(m ? m.period : '');
    
    // Pre-select saved category or smart-inferred category so user immediately sees current classification
    const currentCat = (m && m.category) ? m.category : resolveProjectCategory(projectName, m).id;
    renderThemePresets(currentCat);

    if (DOM.modal) DOM.modal.classList.add('active');
}

if (DOM.btnModalClose) {
    DOM.btnModalClose.onclick = () => DOM.modal && DOM.modal.classList.remove('active');
}

if (DOM.btnModalSave) {
    DOM.btnModalSave.onclick = async () => {
    let projectName = context.isCreateMode ? DOM.metaProjectId.value.trim() : context.currentEditingProject;
    
    // Auto-generate ID if missing in Create Mode
    if (context.isCreateMode && !projectName) {
        projectName = slugify(DOM.metaTitle.value.trim());
        DOM.metaProjectId.value = projectName;
    }

    if (!projectName) {
        await Notification.alert("프로젝트 제목을 입력해주세요.", "필수 확인");
        return;
    }
    const originalText = DOM.btnModalSave.innerText;
    DOM.btnModalSave.innerText = '저장 중...';
    DOM.btnModalSave.disabled = true;
    DOM.btnModalSave.style.opacity = '0.7';
    
    // Extract selected category & theme index
    const indexInput = document.getElementById('meta-theme-index');
    const catInput = document.getElementById('meta-category-id');
    const selectedCatId = catInput ? catInput.value : 'auto';
    let themeVal = indexInput ? parseInt(indexInput.value, 10) : -1;
    let resolvedCatId = selectedCatId;
    if (selectedCatId === 'auto' || !selectedCatId) {
        const inferred = inferCategoryFromProject(projectName, { title: DOM.metaTitle.value.trim() });
        resolvedCatId = 'auto';
        themeVal = inferred ? inferred.index : -1;
    }

    const data = {
        projectMeta: {
            title: DOM.metaTitle.value.trim(),
            period: DOM.metaPeriod.value.trim(),
            assignee: DOM.metaAssignee.value.trim(),
            figmaUrl: DOM.metaFigma.value.trim(),
            notionUrl: DOM.metaNotion.value.trim(),
            themeIndex: themeVal,
            category: resolvedCatId
        }
    };


    try {
        const success = await updateScreenMetadata(projectName, null, data, (msg, color) => {
            DOM.btnModalSave.innerText = msg;
            DOM.btnModalSave.style.background = color;
            if (color === '#4ade80') {
                if (context.isCreateMode && typeof saveProjectHistory === 'function') {
                    const initialHistory = [{
                        version: '0.1',
                        date: (typeof getFormattedKST === 'function') ? getFormattedKST() : new Date().toISOString().slice(0,19).replace('T',' '),
                        message: '프로젝트 최초 생성',
                        assignee: DOM.metaAssignee.value.trim() || '',
                        developer: '',
                        file: 'metadata.json'
                    }];
                    saveProjectHistory(projectName, initialHistory, null).catch(e => console.warn("Failed to save initial history:", e));
                }

                setTimeout(() => {
                    DOM.modal.classList.remove('active');
                    DOM.btnModalSave.innerText = originalText;
                    DOM.btnModalSave.disabled = false;
                    DOM.btnModalSave.style.opacity = '';
                    DOM.btnModalSave.style.background = '';
                    refreshFileList();
                }, context.isCreateMode ? 2000 : 1000);
            }
        });
        if (!success) {
            DOM.btnModalSave.disabled = false; DOM.btnModalSave.style.opacity = '';
        }
    } catch (err) {
        console.error("[ModalSave] Error:", err);
        DOM.btnModalSave.innerText = "저장 실패";
        DOM.btnModalSave.style.background = "#ef4444";
        DOM.btnModalSave.disabled = false;
        DOM.btnModalSave.style.opacity = '';
        await Notification.alert(`저장 중 오류가 발생했습니다: ${err.message}`, "저장 오류", "error");
    }
};
}

async function handleFiles(fileList) {
    const newFiles = Array.from(fileList).filter(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
    if (newFiles.length === 0) return;
    const targetProject = await Notification.prompt("파일을 업로드할 프로젝트 이름을 입력하세요.", "Default_Project", "파일 업로드");
    if (targetProject === null) return;

    for (const file of newFiles) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const content = ev.target.result;
            const success = await uploadToProject(targetProject, file.name, content, updateStatusUI);
            if (success) {
                const meta = await fetchProjectMetadata(targetProject);
                meta.screens = meta.screens || {};
                meta.screens[file.name] = { updatedAt: new Date().toISOString() };
                await saveProjectMetadata(targetProject, meta);
                refreshFileList();
            }
        };
        reader.readAsText(file);
    }
}

if (DOM.uploadTop) {
    DOM.uploadTop.addEventListener('change', async (e) => {
        if (ghConfig.isReadOnly) {
            e.preventDefault(); showAuthModal(); e.target.value = ''; return;
        }
        await handleFiles(e.target.files);
        e.target.value = '';
    });
}

if (DOM.btnShowAuth) DOM.btnShowAuth.onclick = () => showAuthModal();
if (DOM.btnAuthSubmit) DOM.btnAuthSubmit.onclick = handleAuthSubmit;
if (DOM.btnAuthTest) DOM.btnAuthTest.onclick = handleAuthTest;
if (DOM.btnAuthClose) DOM.btnAuthClose.onclick = hideAuthModal;
if (DOM.tokenInput) DOM.tokenInput.onkeyup = (e) => { if(e.key==='Enter') handleAuthSubmit(); };

window.addEventListener('dragover', (e) => {
    e.preventDefault(); if (ghConfig.isReadOnly) return;
    document.body.classList.add('drag-active');
});
window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null) document.body.classList.remove('drag-active');
});
window.addEventListener('drop', async (e) => {
    e.preventDefault(); document.body.classList.remove('drag-active');
    if (e.dataTransfer.files) await handleFiles(e.dataTransfer.files);
});

// Splash Screen Killer (Cinematic Lens Expand & Soft Dissolve)
(function() {
    const intro = document.getElementById('intro-overlay');
    if (!intro) return;
    let isDismissed = false;
    const dismiss = () => {
        if (isDismissed) return;
        isDismissed = true;
        intro.classList.add('dismissed');
        intro.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease';
        intro.style.opacity = '0';
        intro.style.transform = 'scale(1.05)';
        intro.style.filter = 'blur(12px)';
        intro.style.pointerEvents = 'none';
        setTimeout(() => { 
            if (intro.parentNode) intro.remove(); 
            document.body.style.overflow = 'auto'; 
            document.body.classList.add('dashboard-intro-settled');
        }, 650);
    };
    setTimeout(dismiss, 700);
    window.addEventListener('load', () => setTimeout(dismiss, 950));
    intro.addEventListener('click', dismiss);
})();

// Search and Auto-complete Logic (Integrated with Category Filter Bar)
const searchInput = document.getElementById('project-search-input');
const searchDropdown = document.getElementById('search-dropdown');

if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = getFilteredProjects();
        
        if (!query) {
            searchDropdown.classList.remove('active');
            renderList(filtered);
            return;
        }

        // Re-render grid with filtered items
        renderList(filtered);

        // Populate auto-complete dropdown (max 6 items)
        if (filtered.length > 0) {
            searchDropdown.innerHTML = filtered.slice(0, 6).map(p => {
                const mainTitle = p.meta.title || p.name;
                const cat = resolveProjectCategory(p.name, p.meta);
                const url = `viewer.html?project=${encodeURIComponent(p.name)}`;
                return `
                    <a href="${url}" class="search-item" style="text-decoration:none; --search-cat-dark:${cat.accentColor}; --search-cat-light:${cat.lightAccent || cat.accentColor};">
                        <span class="search-item-icon">${cat.svgIcon || ''}</span>
                        <div style="display:flex; flex-direction:column; min-width:0; flex:1;">
                            <span class="search-item-title">${escapeHtmlAttr(mainTitle)}</span>
                            <span class="search-item-sub">${escapeHtmlAttr(cat.name)} · ${escapeHtmlAttr(p.name)}</span>
                        </div>
                    </a>
                `;
            }).join('');
            searchDropdown.classList.add('active');
        } else {
            searchDropdown.innerHTML = `<div class="search-item" style="justify-content:center;"><span class="search-item-title" style="color:var(--dash-text-2, var(--text-secondary));">검색 결과가 없습니다.</span></div>`;
            searchDropdown.classList.add('active');
        }
    });

    // Quick '/' focus & 'Escape' dismiss for Studio Search & Modals
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable);

        if (e.key === '/' && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const anyModalOpen = document.querySelector('.modal-overlay.active, .dialog-overlay.active');
            if (!anyModalOpen) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            return;
        }

        if (e.key === 'Escape') {
            if (searchDropdown.classList.contains('active')) {
                searchDropdown.classList.remove('active');
            }
            if (document.activeElement === searchInput) {
                if (searchInput.value) {
                    searchInput.value = '';
                    renderList(getFilteredProjects());
                }
                searchInput.blur();
                return;
            }
            if (DOM.modal && DOM.modal.classList.contains('active')) {
                DOM.modal.classList.remove('active');
            }
            if (DOM.authModal && DOM.authModal.classList.contains('active')) {
                hideAuthModal();
            }
            const guideModal = document.getElementById('modal-install-guide');
            if (guideModal && guideModal.style.display === 'flex') {
                guideModal.style.display = 'none';
            }
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('active');
        }
    });
}

/* ==========================================================================
   PWA Installation Engine (Cross-Browser Support: Chrome, Samsung, Safari)
   ========================================================================== */

let deferredInstallPrompt = null;

// Listen for beforeinstallprompt (Chromium browsers: Chrome, Samsung Internet, Edge)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // MANDATORY in Chromium & Samsung Internet to defer prompt for user click
    window._deferredInstallPrompt = e;
    deferredInstallPrompt = e;
    // An active beforeinstallprompt proves the app is NOT installed on this device!
    localStorage.removeItem('pwa_app_installed');
    showPWAInstallUI();
});

window.addEventListener('pwa-prompt-ready', () => {
    deferredInstallPrompt = window._deferredInstallPrompt;
    localStorage.removeItem('pwa_app_installed');
    showPWAInstallUI();
});

window.addEventListener('appinstalled', () => {
    // Permanently record that user installed the app on this device
    localStorage.setItem('pwa_app_installed', 'true');
    window._deferredInstallPrompt = null;
    deferredInstallPrompt = null;
    hidePWAInstallUI();
});

function isRunningStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
           (window.navigator.standalone === true) ||
           document.referrer.includes('android-app://');
}

async function isAppAlreadyInstalled() {
    // 1. Currently running inside standalone PWA app
    if (isRunningStandalone()) return true;

    // 2. Previously installed on this browser (recorded via appinstalled)
    // Note: If beforeinstallprompt has fired, that event takes precedence (means app was uninstalled)
    if (localStorage.getItem('pwa_app_installed') === 'true' && !window._deferredInstallPrompt) {
        return true;
    }

    // 3. Android OS Package query API (Chrome & Samsung Internet official WebAPK detection)
    if ('getInstalledRelatedApps' in navigator) {
        try {
            const relatedApps = await navigator.getInstalledRelatedApps();
            if (relatedApps && relatedApps.length > 0) {
                localStorage.setItem('pwa_app_installed', 'true');
                return true;
            }
        } catch (_) {}
    }

    return false;
}

function showPWAInstallUI() {
    if (isRunningStandalone()) return;
    if (localStorage.getItem('pwa_app_installed') === 'true' && !window._deferredInstallPrompt) return;

    const btn = document.getElementById('btn-install-app');
    if (btn) btn.style.display = 'inline-flex';

    const isMobile = window.innerWidth <= 820 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isDismissed = sessionStorage.getItem('dismiss_pwa_banner') === 'true';
    if (isMobile && !isDismissed) {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.style.display = 'flex';
    }
}

function hidePWAInstallUI() {
    const btn = document.getElementById('btn-install-app');
    if (btn) btn.style.display = 'none';
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'none';
    const modal = document.getElementById('modal-install-guide');
    if (modal) modal.style.display = 'none';
}

function detectBrowserType() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSamsung = /SamsungBrowser/i.test(ua);
    const isChrome = /Chrome/i.test(ua) && !isSamsung && !/Edg/i.test(ua);
    if (isIOS) return 'ios';
    if (isSamsung) return 'samsung';
    if (isChrome) return 'chrome';
    return 'other';
}

function switchPWAInstallTab(tabId) {
    document.querySelectorAll('.install-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === tabId);
    });
    document.querySelectorAll('.install-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

function openPWAInstallGuideModal() {
    const modal = document.getElementById('modal-install-guide');
    if (!modal) return;
    
    const browser = detectBrowserType();
    let targetTab = 'tab-chrome';
    if (browser === 'ios') {
        targetTab = 'tab-ios';
    } else if (browser === 'samsung') {
        targetTab = 'tab-samsung';
    }
    
    switchPWAInstallTab(targetTab);
    modal.style.display = 'flex';
}

function handlePWAInstallTrigger() {
    // 1. Immediately invoke native install prompt if captured
    const promptEvent = window._deferredInstallPrompt || deferredInstallPrompt;
    if (promptEvent) {
        promptEvent.prompt();
        promptEvent.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                localStorage.setItem('pwa_app_installed', 'true');
                hidePWAInstallUI();
            }
            window._deferredInstallPrompt = null;
            deferredInstallPrompt = null;
        }).catch((err) => {
            console.warn('[PWA] Prompt execution failed:', err);
            openPWAInstallGuideModal();
        });
        return;
    }

    // 2. On Android (Samsung Internet or Chrome), if prompt event is in-flight during early page interaction, wait briefly
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
        const btn = document.getElementById('btn-install-app');
        const originalHtml = btn ? btn.innerHTML : '';
        if (btn) btn.innerHTML = '<span class="material-icons-outlined" style="animation:spin 1s linear infinite">sync</span><span>설치 준비 중...</span>';

        let attempts = 0;
        const checkTimer = setInterval(() => {
            attempts++;
            const readyPrompt = window._deferredInstallPrompt || deferredInstallPrompt;
            if (readyPrompt) {
                clearInterval(checkTimer);
                if (btn) btn.innerHTML = originalHtml;
                readyPrompt.prompt();
                readyPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        localStorage.setItem('pwa_app_installed', 'true');
                        hidePWAInstallUI();
                    }
                    window._deferredInstallPrompt = null;
                    deferredInstallPrompt = null;
                });
            } else if (attempts >= 10) { // 1.5s timeout
                clearInterval(checkTimer);
                if (btn) btn.innerHTML = originalHtml;
                openPWAInstallGuideModal();
            }
        }, 150);
        return;
    }

    // 3. Apple iOS Safari (no programmatic install prompt API exists in iOS)
    openPWAInstallGuideModal();
}

async function initPWAInstallEngine() {
    // Step 1: Check if already installed
    const alreadyInstalled = await isAppAlreadyInstalled();
    if (alreadyInstalled) {
        hidePWAInstallUI();
        return;
    }

    // Step 2: Bind click triggers
    const installBtn = document.getElementById('btn-install-app');
    if (installBtn) {
        installBtn.onclick = handlePWAInstallTrigger;
    }

    const bannerBtn = document.getElementById('btn-pwa-banner-install');
    if (bannerBtn) {
        bannerBtn.onclick = handlePWAInstallTrigger;
    }

    const bannerCloseBtn = document.getElementById('btn-pwa-banner-close');
    if (bannerCloseBtn) {
        bannerCloseBtn.onclick = () => {
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'none';
            sessionStorage.setItem('dismiss_pwa_banner', 'true');
        };
    }

    // Step 3: For iOS Safari (which never fires beforeinstallprompt) vs Chromium
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        showPWAInstallUI();
    } else if (window._deferredInstallPrompt) {
        // If Chromium/Samsung prompt event already arrived before init
        showPWAInstallUI();
    } else {
        // Keep hidden until beforeinstallprompt explicitly fires
        hidePWAInstallUI();
    }

    // Modal tabs
    document.querySelectorAll('.install-tab-btn').forEach(btn => {
        btn.onclick = () => {
            switchPWAInstallTab(btn.dataset.target);
        };
    });

    const guideCloseBtn = document.getElementById('btn-install-guide-close');
    const guideOkBtn = document.getElementById('btn-install-guide-ok');
    const guideModal = document.getElementById('modal-install-guide');

    const closeGuide = () => {
        if (guideModal) guideModal.style.display = 'none';
    };

    if (guideCloseBtn) guideCloseBtn.onclick = closeGuide;
    if (guideOkBtn) {
        guideOkBtn.onclick = () => {
            closeGuide();
            if (isIOS) {
                localStorage.setItem('pwa_app_installed', 'true');
                hidePWAInstallUI();
            }
        };
    }
    if (guideModal) {
        guideModal.onclick = (e) => {
            if (e.target === guideModal) closeGuide();
        };
    }
}

// Start system when running on dashboard page
function initDashboard() {
    checkEnvironment();
    if (document.getElementById('file-list')) {
        refreshFileList();
    }
    initPWAInstallEngine();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

