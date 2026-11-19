/**
 * assets/vctrl_autosave.js
 * 2-Tier Hybrid Auto-Save Engine (Parent Side SSOT)
 *
 * Tier 1: Instant Browser IndexedDB Draft Protection (1.5s idle debounce, 0 GitHub commits)
 * Tier 2: Coalesced Silent GitHub Cloud Sync (25s idle debounce + 60s min cooldown + Zero-Diff Deduplication)
 *
 * Non-Blocking Screen Switch Architecture:
 * - Switching screens NEVER waits on network/GitHub API calls (0ms network latency).
 * - Outgoing unsaved screen state is staged in memory (window.fileContentCache + _pendingSnapshots)
 *   and persisted asynchronously to IndexedDB & background cloud queue while the next screen loads immediately.
 */

(function () {
    'use strict';

    var DB_NAME = 'WorkspaceAutoSaveDB';
    var DB_VERSION = 1;
    var STORE_NAME = 'screen_drafts';

    var LOCAL_DRAFT_DEBOUNCE_MS = 1500;       // 1.5s idle -> save local IndexedDB draft (0 commits)
    var CLOUD_IDLE_DEBOUNCE_MS = 8000;        // 8s idle -> silent Supabase sync
    var CLOUD_MIN_INTERVAL_MS = 15000;        // Minimum 15s between consecutive auto-syncs
    var INTERACTION_DEFER_MS = 4000;          // Defer 4s if user is dragging/cropping/composing
    var RECOVERED_SYNC_DELAY_MS = 6000;       // Sync recovered local draft after 6s idle
    var META_TIMESTAMP_THROTTLE_MS = 900000;  // 15m throttle for updatedAt-only metadata touches
    var MAX_DRAFT_AGE_MS = 86400000;          // 24h max validity for unsynced local drafts
    var SWITCH_SNAPSHOT_TIMEOUT_MS = 250;     // Fast safety cap for local DOM clone on screen switch

    var _dbPromise = null;
    var _knownDraftKeysReady = false;
    var _knownUnsyncedKeys = new Set();
    var _remoteBaselineHtml = new Map();
    var _remoteBaselineMetaSig = new Map();
    var _pendingSnapshots = new Map();

    var _localTimer = null;
    var _cloudTimer = null;
    var _modificationSeq = 0;
    var _lastCloudSyncAt = 0;
    var _lastMetaTimestampSyncAt = 0;
    var _lastSyncedTimeLabel = '';
    var _activeScreenKey = '';
    var _isComposing = false;
    var _currentBadgeState = 'saved';

    /**
     * Fast deterministic 32-bit FNV-1a hash for content baseline verification.
     */
    function hashString(str) {
        if (typeof str !== 'string') return '0';
        var h = 0x811c9dc5;
        for (var i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return (h >>> 0).toString(16);
    }

    /**
     * Opens (or reuses) the IndexedDB connection safely and pre-indexes draft keys in memory
     * so clean screen switches require 0 IndexedDB roundtrips.
     */
    function _openDB() {
        if (_dbPromise) return _dbPromise;
        if (typeof window.indexedDB === 'undefined') {
            _knownDraftKeysReady = true;
            return Promise.resolve(null);
        }
        _dbPromise = new Promise(function (resolve) {
            try {
                var req = window.indexedDB.open(DB_NAME, DB_VERSION);
                req.onupgradeneeded = function (e) {
                    var db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                    }
                };
                req.onsuccess = function (e) {
                    var db = e.target.result;
                    try {
                        var tx = db.transaction(STORE_NAME, 'readonly');
                        var keyReq = tx.objectStore(STORE_NAME).getAllKeys();
                        keyReq.onsuccess = function () {
                            var keys = keyReq.result || [];
                            for (var i = 0; i < keys.length; i++) {
                                _knownUnsyncedKeys.add(String(keys[i]));
                            }
                            _knownDraftKeysReady = true;
                            resolve(db);
                        };
                        keyReq.onerror = function () {
                            _knownDraftKeysReady = true;
                            resolve(db);
                        };
                    } catch (_) {
                        _knownDraftKeysReady = true;
                        resolve(db);
                    }
                };
                req.onerror = function () {
                    _knownDraftKeysReady = true;
                    console.warn('[AutoSave] IndexedDB unavailable, operating in cloud-only mode.');
                    resolve(null);
                };
            } catch (err) {
                _knownDraftKeysReady = true;
                resolve(null);
            }
        });
        return _dbPromise;
    }

    async function saveDraft(key, payload) {
        if (!key) return false;
        _knownUnsyncedKeys.add(key);
        var db = await _openDB();
        if (!db) return false;
        return new Promise(function (resolve) {
            try {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.put(Object.assign({ key: key }, payload));
                tx.oncomplete = function () { resolve(true); };
                tx.onerror = function () { resolve(false); };
            } catch (e) {
                resolve(false);
            }
        });
    }

    async function getDraft(key) {
        if (!key) return null;
        if (_knownDraftKeysReady && !_knownUnsyncedKeys.has(key)) {
            return null;
        }
        var db = await _openDB();
        if (!db) return null;
        if (!_knownUnsyncedKeys.has(key)) return null;
        return new Promise(function (resolve) {
            try {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var store = tx.objectStore(STORE_NAME);
                var req = store.get(key);
                req.onsuccess = function () { resolve(req.result || null); };
                req.onerror = function () { resolve(null); };
            } catch (e) {
                resolve(null);
            }
        });
    }

    async function clearDraft(project, fileName) {
        if (!project || !fileName) return false;
        var key = project + '/' + fileName;
        _knownUnsyncedKeys.delete(key);
        var db = await _openDB();
        if (!db) return false;
        return new Promise(function (resolve) {
            try {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.delete(key);
                tx.oncomplete = function () { resolve(true); };
                tx.onerror = function () { resolve(false); };
            } catch (e) {
                resolve(false);
            }
        });
    }

    /**
     * Records the authentic remote GitHub HTML baseline for a screen the first time it is fetched,
     * so in-memory session cache updates on screen switch never mask unsynced diffs.
     */
    function registerRemoteBaseline(project, fileName, remoteContent) {
        if (!project || !fileName || typeof remoteContent !== 'string') return;
        var key = project + '/' + fileName;
        if (!_remoteBaselineHtml.has(key)) {
            _remoteBaselineHtml.set(key, remoteContent);
        }
    }

    function setRemoteBaselineHtml(key, htmlContent) {
        if (!key || typeof htmlContent !== 'string') return;
        _remoteBaselineHtml.set(key, htmlContent);
    }

    function getRemoteBaselineHtml(key) {
        if (!key) return null;
        if (_remoteBaselineHtml.has(key)) return _remoteBaselineHtml.get(key);
        return (window.fileContentCache && window.fileContentCache[key]) || null;
    }

    /**
     * Computes a canonical semantic signature of project & screen metadata
     * (excluding volatile updated/updatedAt timestamps) for zero-diff commit skipping.
     */
    function computeMetadataSemanticSignature(stateObj, fileName, overrideProjectMeta, overrideVersion, overrideDesc, overrideConns) {
        var st = stateObj || window.state || {};
        var pm = st.projectMetadata || {};
        var titleVal = overrideProjectMeta && overrideProjectMeta.title !== undefined
            ? overrideProjectMeta.title
            : (document.getElementById('viewer-meta-title')?.value ?? pm.title ?? '');
        var assigneeVal = overrideProjectMeta && overrideProjectMeta.assignee !== undefined
            ? overrideProjectMeta.assignee
            : (document.getElementById('viewer-meta-assignee')?.value ?? pm.assignee ?? '');
        var devVal = overrideProjectMeta && overrideProjectMeta.developer !== undefined
            ? overrideProjectMeta.developer
            : (document.getElementById('viewer-meta-developer')?.value ?? pm.developer ?? '');
        var periodVal = overrideProjectMeta && overrideProjectMeta.period !== undefined
            ? overrideProjectMeta.period
            : (document.getElementById('viewer-meta-period')?.value ?? pm.period ?? '');
        var verVal = overrideVersion !== undefined ? overrideVersion : (pm.version ?? 0.1);

        var activeName = fileName || (st.activeFile ? st.activeFile.name : '');
        var sc = (pm.screens && activeName && pm.screens[activeName]) ? pm.screens[activeName] : {};
        var activeDesc = overrideDesc !== undefined
            ? overrideDesc
            : ((st.activeFile && st.activeFile.name === activeName && st.activeFile.meta)
                ? st.activeFile.meta.description
                : (sc.description || []));
        var activeConns = overrideConns !== undefined
            ? overrideConns
            : ((st.activeFile && st.activeFile.name === activeName && Array.isArray(st.connectors))
                ? st.connectors
                : (sc.connectors || []));

        var canonical = {
            title: titleVal || '',
            assignee: assigneeVal || '',
            developer: devVal || '',
            period: periodVal || '',
            jira: pm.jira || '',
            figmaUrl: pm.figmaUrl || '',
            notionUrl: pm.notionUrl || '',
            pubUrl: pm.pubUrl || '',
            themeIndex: pm.themeIndex !== undefined ? pm.themeIndex : null,
            category: pm.category !== undefined ? pm.category : null,
            version: Number(verVal) || 0.1,
            screenOrder: Array.isArray(pm.screenOrder) ? pm.screenOrder : [],
            molecules: Array.isArray(pm.molecules) ? pm.molecules : [],
            screenKey: activeName,
            screenTitle: sc.title || '',
            screenType: sc.type || '',
            screenWidth: sc.width || null,
            screenHeight: sc.height || null,
            defaultTab: sc.defaultTab || '',
            description: activeDesc || [],
            connectors: activeConns || []
        };

        try {
            return JSON.stringify(canonical);
        } catch (e) {
            return String(Date.now());
        }
    }

    function getLastSyncedMetaSig(project, fileName) {
        var key = (project && fileName) ? (project + '/' + fileName) : _activeScreenKey;
        return (key && _remoteBaselineMetaSig.get(key)) || '';
    }

    function setLastSyncedMetaSig(key, sig) {
        if (key && sig) _remoteBaselineMetaSig.set(key, sig);
    }

    function _shouldDeferAutoSave() {
        var st = window.state || {};
        if (_isComposing) return true;
        if (st.isDragging || st.isPanning || st.isImageCropping) return true;

        var modalOpen = document.querySelector('.modal-overlay.active');
        if (modalOpen && modalOpen.id !== 'save-overlay') return true;

        var iframe = (window.DOM && window.DOM.iframe) || document.getElementById('main-iframe');
        if (iframe && window.location.protocol !== 'file:') {
            try {
                var cw = iframe.contentWindow;
                if (cw) {
                    if (cw.V4DragResizeEngine && (cw.V4DragResizeEngine.isDragging || cw.V4DragResizeEngine.isResizing || cw.V4DragResizeEngine.isPendingDrag)) {
                        return true;
                    }
                    if (cw.isMarqueeActive) return true;
                    if (cw.V4PortConnectorEngine && cw.V4PortConnectorEngine.isDrawingConnector) return true;
                    if (cw.V4ImageCropEngine && typeof cw.V4ImageCropEngine.isActive === 'function' && cw.V4ImageCropEngine.isActive()) {
                        return true;
                    }
                }
            } catch (_) {}
        }
        return false;
    }

    function _formatShortTime(d) {
        var dt = d || new Date();
        var hh = String(dt.getHours()).padStart(2, '0');
        var mm = String(dt.getMinutes()).padStart(2, '0');
        return hh + ':' + mm;
    }

    function updateStatusUI(mode, customLabel, customTooltip) {
        _currentBadgeState = mode || 'saved';
        var badge = document.getElementById('autosave-status-badge');
        if (!badge) return;

        var st = window.state || {};
        var isRO = Boolean(st.isReadOnly || (window.ghConfig && window.ghConfig.isReadOnly));
        var iconSlot = badge.querySelector('.autosave-indicator');
        var textSlot = badge.querySelector('.autosave-text');
        badge.style.display = '';
        if (isRO) {
            badge.setAttribute('data-state', 'readonly');
            if (iconSlot) iconSlot.innerHTML = '<span class="autosave-dot"></span>';
            if (textSlot) textSlot.textContent = '열람 전용 모드';
            badge.title = '관리자 로그인 후 편집 및 저장이 가능합니다.';
            return;
        }
        badge.setAttribute('data-state', _currentBadgeState);

        if (!iconSlot || !textSlot) return;

        if (_currentBadgeState === 'saving') {
            iconSlot.innerHTML = '<svg class="autosave-spinner-svg" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.8"></circle><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>';
            textSlot.textContent = customLabel || '자동 저장 중';
            badge.title = customTooltip || '변경사항을 백그라운드에서 클라우드에 자동 동기화하고 있습니다.';
        } else if (_currentBadgeState === 'dirty') {
            iconSlot.innerHTML = '<span class="autosave-dot"></span>';
            textSlot.textContent = customLabel || '편집 중';
            badge.title = customTooltip || '편집 멈춤 시 자동으로 저장됩니다.';
        } else if (_currentBadgeState === 'local-saved') {
            iconSlot.innerHTML = '<span class="autosave-dot"></span>';
            textSlot.textContent = customLabel || '임시 저장됨';
            badge.title = customTooltip || '브라우저에 즉시 보호되었습니다. 유휴 시 백그라운드에서 클라우드에 자동 반영됩니다.';
        } else if (_currentBadgeState === 'local-only') {
            iconSlot.innerHTML = '<span class="autosave-dot"></span>';
            textSlot.textContent = customLabel || '로컬 보호됨';
            badge.title = customTooltip || '브라우저에 안전하게 보관 중이며 다음 유휴 주기에 클라우드 동기화를 재시도합니다.';
        } else {
            iconSlot.innerHTML = '<span class="autosave-dot"></span>';
            var defaultSavedTxt = _lastSyncedTimeLabel ? ('자동 저장됨 · ' + _lastSyncedTimeLabel) : '자동 저장 활성';
            textSlot.textContent = customLabel || defaultSavedTxt;
            badge.title = customTooltip || '모든 변경사항이 안전하게 자동 저장되었습니다.';
        }
    }

    function _readCurrentProjectMetaFromUI(st) {
        return {
            title: document.getElementById('viewer-meta-title')?.value || st.projectMetadata?.title || '',
            assignee: document.getElementById('viewer-meta-assignee')?.value || st.projectMetadata?.assignee || '',
            developer: document.getElementById('viewer-meta-developer')?.value || st.projectMetadata?.developer || '',
            period: document.getElementById('viewer-meta-period')?.value || st.projectMetadata?.period || '',
            figmaUrl: st.projectMetadata?.figmaUrl || '',
            notionUrl: st.projectMetadata?.notionUrl || ''
        };
    }

    /**
     * Tier 1: Writes sanitized screen HTML & metadata snapshot to local IndexedDB (0 GitHub commits).
     */
    async function _executeLocalDraftSave() {
        _localTimer = null;
        var st = window.state || {};
        if (st.isReadOnly || !st.hasUnsavedChanges || !st.currentProject || !st.activeFile) return;

        if (_shouldDeferAutoSave()) {
            _localTimer = setTimeout(_executeLocalDraftSave, INTERACTION_DEFER_MS);
            return;
        }

        var project = st.currentProject;
        var fileName = st.activeFile.name;
        var key = project + '/' + fileName;
        var capturedSeq = _modificationSeq;

        if (!window.StorageEngine || typeof window.StorageEngine.getIframeHTML !== 'function') return;

        try {
            var htmlContent = await window.StorageEngine.getIframeHTML({ silent: true });
            if (!htmlContent) return;
            if (!st.currentProject || !st.activeFile || (st.currentProject + '/' + st.activeFile.name) !== key) return;

            var shaMap = window.shaCache || {};
            var remoteBase = getRemoteBaselineHtml(key) || '';
            var baseHash = remoteBase ? hashString(remoteBase) : '';

            // Update in-memory cache so session navigation always reflects latest state instantly
            window.fileContentCache = window.fileContentCache || {};
            window.fileContentCache[key] = htmlContent;

            var ok = await saveDraft(key, {
                project: project,
                fileName: fileName,
                htmlContent: htmlContent,
                description: st.activeFile.meta ? st.activeFile.meta.description : [],
                connectors: Array.isArray(st.connectors) ? st.connectors : [],
                projectMeta: _readCurrentProjectMetaFromUI(st),
                baseSha: shaMap[key] || null,
                baseContentHash: baseHash || null,
                unsynced: true,
                seq: capturedSeq,
                savedAt: Date.now()
            });

            if (ok && st.hasUnsavedChanges && _currentBadgeState === 'dirty') {
                updateStatusUI('local-saved', '임시 저장됨');
            }
        } catch (err) {
            console.warn('[AutoSave] Local draft write skipped:', err);
        }
    }

    function _scheduleCloudSync(delayMs) {
        if (_cloudTimer) {
            clearTimeout(_cloudTimer);
            _cloudTimer = null;
        }
        var waitMs = typeof delayMs === 'number' ? Math.max(1000, delayMs) : CLOUD_IDLE_DEBOUNCE_MS;
        _cloudTimer = setTimeout(_executeCloudSync, waitMs);
    }

    /**
     * Flushes any background snapshots staged from previously visited screens.
     */
    async function _drainPendingSnapshots(commitPrefix) {
        if (_pendingSnapshots.size === 0) return { allOk: true, committedCount: 0, metadataCommitted: false };
        if (!window.StorageEngine || typeof window.StorageEngine.performSilentSnapshotSave !== 'function') {
            return { allOk: false, committedCount: 0, metadataCommitted: false };
        }

        var entries = Array.from(_pendingSnapshots.entries());
        var totalCommits = 0;
        var anyMetaCommitted = false;
        var allOk = true;

        for (var i = 0; i < entries.length; i++) {
            var key = entries[i][0];
            var snap = entries[i][1];
            // Skip if user navigated back to this exact screen (it is now owned by active screen state)
            var st = window.state || {};
            if (st.currentProject === snap.project && st.activeFile && st.activeFile.name === snap.fileName) {
                _pendingSnapshots.delete(key);
                continue;
            }

            var isLastQueuedAndActiveClean = (i === entries.length - 1) && !st.hasUnsavedChanges;
            var res = await window.StorageEngine.performSilentSnapshotSave(snap, {
                commitPrefix: commitPrefix || '[auto-save]',
                allowTimestampTouch: isLastQueuedAndActiveClean
            });

            if (res && res.ok) {
                totalCommits += (res.committedCount || 0);
                if (res.metadataCommitted) anyMetaCommitted = true;
                if (res.syncedHtml) _remoteBaselineHtml.set(key, res.syncedHtml);
                if (res.syncedMetaSig) _remoteBaselineMetaSig.set(key, res.syncedMetaSig);
                _pendingSnapshots.delete(key);
                await clearDraft(snap.project, snap.fileName);
            } else {
                allOk = false;
            }
        }

        return { allOk: allOk, committedCount: totalCommits, metadataCommitted: anyMetaCommitted };
    }

    /**
     * Tier 2: Coalesced Silent GitHub Cloud Sync with cooldown & zero-diff deduplication.
     */
    async function _executeCloudSync() {
        _cloudTimer = null;
        var st = window.state || {};
        if (st.isReadOnly || (window.ghConfig && window.ghConfig.isReadOnly)) return;

        var hasActiveDirty = Boolean(st.hasUnsavedChanges && st.currentProject && st.activeFile);
        var hasQueued = _pendingSnapshots.size > 0;

        if (!hasActiveDirty && !hasQueued) {
            updateStatusUI('saved');
            return;
        }

        if (_shouldDeferAutoSave() || (window.StorageEngine && window.StorageEngine.isManualSaving && window.StorageEngine.isManualSaving())) {
            _scheduleCloudSync(INTERACTION_DEFER_MS);
            return;
        }

        var now = Date.now();
        var elapsedSinceLastSync = now - _lastCloudSyncAt;
        if (_lastCloudSyncAt > 0 && elapsedSinceLastSync < CLOUD_MIN_INTERVAL_MS) {
            _scheduleCloudSync(CLOUD_MIN_INTERVAL_MS - elapsedSinceLastSync + 250);
            return;
        }

        if (!window.StorageEngine || typeof window.StorageEngine.performSilentSave !== 'function') return;

        updateStatusUI('saving', '자동 저장 중');

        // 1. Drain any background snapshots from previously visited screens first
        var queueRes = await _drainPendingSnapshots('[auto-save]');
        var totalCommits = queueRes.committedCount || 0;
        var metaCommitted = Boolean(queueRes.metadataCommitted);

        // 2. Sync currently active screen if dirty
        st = window.state || {};
        hasActiveDirty = Boolean(st.hasUnsavedChanges && st.currentProject && st.activeFile);
        if (!hasActiveDirty) {
            if (queueRes.allOk) {
                if (totalCommits > 0) _lastCloudSyncAt = Date.now();
                if (metaCommitted) _lastMetaTimestampSyncAt = Date.now();
                _lastSyncedTimeLabel = _formatShortTime(new Date());
                updateStatusUI('saved', '자동 저장됨 · ' + _lastSyncedTimeLabel);
            } else {
                updateStatusUI('local-only', '로컬 보호됨');
                _scheduleCloudSync(CLOUD_MIN_INTERVAL_MS);
            }
            return;
        }

        var targetProject = st.currentProject;
        var targetFile = st.activeFile.name;
        var targetKey = targetProject + '/' + targetFile;
        var capturedSeq = _modificationSeq;

        var result = await window.StorageEngine.performSilentSave({
            capturedSeq: capturedSeq,
            commitPrefix: '[auto-save]'
        });

        if (result && result.ok && queueRes.allOk) {
            totalCommits += (result.committedCount || 0);
            if (totalCommits > 0) {
                _lastCloudSyncAt = Date.now();
            }
            if (metaCommitted || result.metadataCommitted) {
                _lastMetaTimestampSyncAt = Date.now();
            }
            if (_modificationSeq === capturedSeq && st.currentProject === targetProject && st.activeFile && st.activeFile.name === targetFile) {
                if (result.syncedHtml) _remoteBaselineHtml.set(targetKey, result.syncedHtml);
                _remoteBaselineMetaSig.set(targetKey, computeMetadataSemanticSignature(st, targetFile));
                await clearDraft(targetProject, targetFile);
                if (typeof window.markAsClean === 'function') window.markAsClean();
                _lastSyncedTimeLabel = _formatShortTime(new Date());
                updateStatusUI('saved', '자동 저장됨 · ' + _lastSyncedTimeLabel);
            } else if (st.hasUnsavedChanges || _pendingSnapshots.size > 0) {
                updateStatusUI('dirty', '편집 중');
                _scheduleCloudSync(CLOUD_IDLE_DEBOUNCE_MS);
            }
        } else if (result && result.deferred) {
            _scheduleCloudSync(INTERACTION_DEFER_MS);
        } else {
            updateStatusUI('local-only', '로컬 보호됨');
            _scheduleCloudSync(CLOUD_MIN_INTERVAL_MS);
        }
    }

    /**
     * Called on every user edit (via window.markAsDirty) BEFORE hasUnsavedChanges early-return.
     */
    function notifyModification() {
        var st = window.state || {};
        if (st.isReadOnly || (window.ghConfig && window.ghConfig.isReadOnly)) return;
        if (!st.currentProject || !st.activeFile) return;

        _modificationSeq++;

        if (_currentBadgeState !== 'saving') {
            updateStatusUI('dirty', '편집 중');
        }

        if (_localTimer) clearTimeout(_localTimer);
        _localTimer = setTimeout(_executeLocalDraftSave, LOCAL_DRAFT_DEBOUNCE_MS);

        _scheduleCloudSync(CLOUD_IDLE_DEBOUNCE_MS);
    }

    /**
     * Ultra-fast (~5-10ms, ZERO network calls) outgoing screen snapshot stager.
     * Ensures switching screens in the sidebar is 100% instantaneous while preserving
     * all edits in memory, IndexedDB, and the background GitHub sync queue.
     */
    async function stageOutgoingScreenBeforeSwitch() {
        var st = window.state || {};
        if (!st.hasUnsavedChanges) return true;
        if (st.isReadOnly || (window.ghConfig && window.ghConfig.isReadOnly)) return false;
        if (!st.currentProject || !st.activeFile || !st.activeFile.name) {
            if (typeof window.markAsClean === 'function') window.markAsClean();
            return true;
        }

        if (_localTimer) {
            clearTimeout(_localTimer);
            _localTimer = null;
        }

        var project = st.currentProject;
        var fileName = st.activeFile.name;
        var key = project + '/' + fileName;

        var htmlContent = null;
        if (window.StorageEngine && typeof window.StorageEngine.getIframeHTML === 'function') {
            try {
                htmlContent = await Promise.race([
                    window.StorageEngine.getIframeHTML({ silent: true }),
                    new Promise(function (resolve) { setTimeout(function () { resolve(null); }, SWITCH_SNAPSHOT_TIMEOUT_MS); })
                ]);
            } catch (_) {
                htmlContent = null;
            }
        }

        if (!htmlContent) {
            htmlContent = (window.fileContentCache && window.fileContentCache[key]) || null;
        }
        if (!htmlContent) return false;

        var projectMeta = _readCurrentProjectMetaFromUI(st);
        var currentVer = (st.projectMetadata && st.projectMetadata.version !== undefined)
            ? (parseFloat(st.projectMetadata.version) || 0.1)
            : 0.1;
        projectMeta.version = currentVer;

        var descClone = [];
        try { descClone = JSON.parse(JSON.stringify(st.activeFile.meta ? (st.activeFile.meta.description || []) : [])); } catch (_) {}
        var connClone = [];
        try { connClone = JSON.parse(JSON.stringify(Array.isArray(st.connectors) ? st.connectors : [])); } catch (_) {}

        // Sync cover metadata if outgoing screen was a cover screen
        if (typeof window.syncCoverMetadata === 'function') {
            var isCover = (st.projectMetadata && st.projectMetadata.screens && st.projectMetadata.screens[fileName]?.type === 'cover') ||
                htmlContent.includes('cover-version') || htmlContent.includes('cover-jira-id');
            if (isCover) {
                try {
                    htmlContent = window.syncCoverMetadata(htmlContent, Object.assign({}, st.projectMetadata, projectMeta, { version: currentVer }), false, fileName);
                } catch (_) {}
            }
        }

        // Fast Zero-Diff check against remote baseline: if nothing actually changed, skip staging completely
        var remoteHtml = getRemoteBaselineHtml(key);
        var htmlChanged = (remoteHtml === null) ? true : (htmlContent !== remoteHtml);
        var currentMetaSig = computeMetadataSemanticSignature(st, fileName, projectMeta, currentVer, descClone, connClone);
        var lastMetaSig = _remoteBaselineMetaSig.get(key) || '';
        var metaChanged = !lastMetaSig || (currentMetaSig !== lastMetaSig);

        if (!htmlChanged && !metaChanged) {
            clearDraft(project, fileName);
            if (typeof window.markAsClean === 'function') window.markAsClean();
            return true;
        }

        // 1. Update in-memory caches immediately (0ms) so revisiting this screen renders instant edits
        window.fileContentCache = window.fileContentCache || {};
        window.fileContentCache[key] = htmlContent;
        if (st.projectMetadata) {
            Object.assign(st.projectMetadata, {
                title: projectMeta.title || st.projectMetadata.title,
                assignee: projectMeta.assignee || st.projectMetadata.assignee,
                developer: projectMeta.developer !== undefined ? projectMeta.developer : st.projectMetadata.developer,
                period: projectMeta.period || st.projectMetadata.period
            });
            st.projectMetadata.screens = st.projectMetadata.screens || {};
            st.projectMetadata.screens[fileName] = st.projectMetadata.screens[fileName] || {};
            st.projectMetadata.screens[fileName].description = descClone;
            st.projectMetadata.screens[fileName].connectors = connClone;
        }

        // 2. Enqueue snapshot for background silent cloud sync (non-blocking)
        var shaMap = window.shaCache || {};
        var baseHash = remoteHtml ? hashString(remoteHtml) : '';
        var snap = {
            project: project,
            fileName: fileName,
            htmlContent: htmlContent,
            description: descClone,
            connectors: connClone,
            projectMeta: projectMeta,
            version: currentVer,
            existingMetadataSnapshot: st.projectMetadata ? JSON.parse(JSON.stringify(st.projectMetadata)) : null
        };
        _pendingSnapshots.set(key, snap);

        // 3. Persist to IndexedDB asynchronously (fire-and-forget, 0ms UI wait)
        saveDraft(key, {
            project: project,
            fileName: fileName,
            htmlContent: htmlContent,
            description: descClone,
            connectors: connClone,
            projectMeta: projectMeta,
            baseSha: shaMap[key] || null,
            baseContentHash: baseHash || null,
            unsynced: true,
            seq: _modificationSeq,
            savedAt: Date.now()
        });

        // 4. Ensure background idle cloud sync timer is active without forcing an immediate blocking PUT
        if (!_cloudTimer) {
            _scheduleCloudSync(CLOUD_IDLE_DEBOUNCE_MS);
        }

        if (typeof window.markAsClean === 'function') window.markAsClean();
        updateStatusUI('local-saved', '임시 저장됨');
        return true;
    }

    /**
     * Checks IndexedDB on screen load for an unsynced draft matching the exact remote baseline.
     * Uses O(1) in-memory _knownUnsyncedKeys check so clean screens incur 0.00ms overhead.
     */
    async function recoverDraftIfValid(project, fileName, remoteContent) {
        var st = window.state || {};
        if (!project || !fileName || st.isReadOnly || (window.ghConfig && window.ghConfig.isReadOnly)) {
            return null;
        }

        var key = project + '/' + fileName;
        // If already staged in current session memory (_pendingSnapshots), fileContentCache already has latest HTML!
        if (_pendingSnapshots.has(key)) {
            return null;
        }
        // Fast O(1) memory skip when IndexedDB key index is warm and has no draft for this screen
        if (_knownDraftKeysReady && !_knownUnsyncedKeys.has(key)) {
            return null;
        }

        var draft = await getDraft(key);
        if (!draft || !draft.unsynced) return null;

        if (!draft.savedAt || (Date.now() - draft.savedAt) > MAX_DRAFT_AGE_MS) {
            await clearDraft(project, fileName);
            return null;
        }

        var currentRemoteSha = (window.shaCache && window.shaCache[key]) || null;
        var authenticRemote = _remoteBaselineHtml.get(key) || remoteContent || '';
        var remoteHash = hashString(authenticRemote);

        var isSameBaseline = false;
        if (draft.baseSha && currentRemoteSha) {
            isSameBaseline = (draft.baseSha === currentRemoteSha);
        } else if (draft.baseContentHash) {
            isSameBaseline = (draft.baseContentHash === remoteHash);
        }

        if (!isSameBaseline) {
            await clearDraft(project, fileName);
            return null;
        }

        var draftHtmlSame = (!draft.htmlContent || draft.htmlContent === authenticRemote);
        var sc = (st.projectMetadata && st.projectMetadata.screens && st.projectMetadata.screens[fileName]) || {};
        var descSame = JSON.stringify(draft.description || []) === JSON.stringify(sc.description || []);
        var connSame = JSON.stringify(draft.connectors || []) === JSON.stringify(sc.connectors || []);

        if (draftHtmlSame && descSame && connSame) {
            await clearDraft(project, fileName);
            return null;
        }

        return draft;
    }

    /**
     * Initializes tracking state right after a screen finishes mounting in loadScreen().
     */
    function onScreenLoaded(project, fileName, loadedContent, recoveredDraft) {
        if (_localTimer) { clearTimeout(_localTimer); _localTimer = null; }

        var st = window.state || {};
        _activeScreenKey = (project && fileName) ? (project + '/' + fileName) : '';

        if (_activeScreenKey && loadedContent && !recoveredDraft && !_pendingSnapshots.has(_activeScreenKey)) {
            _remoteBaselineHtml.set(_activeScreenKey, loadedContent);
        }

        // Case A: User navigated back to a screen that had staged unsynced changes from earlier in this session
        if (_activeScreenKey && _pendingSnapshots.has(_activeScreenKey)) {
            var staged = _pendingSnapshots.get(_activeScreenKey);
            _pendingSnapshots.delete(_activeScreenKey);
            if (st.activeFile && st.activeFile.meta) {
                st.activeFile.meta.description = staged.description || [];
                st.activeFile.meta.connectors = staged.connectors || [];
                st.connectors = staged.connectors || [];
            }
            st.hasUnsavedChanges = true;
            var btnStaged = document.getElementById('btn-global-save');
            if (btnStaged) btnStaged.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.6)';
            updateStatusUI('local-saved', '임시 저장됨');
            if (!_cloudTimer) _scheduleCloudSync(CLOUD_IDLE_DEBOUNCE_MS);
            return;
        }

        // Record clean semantic metadata baseline if not yet recorded for this screen
        if (_activeScreenKey && !_remoteBaselineMetaSig.has(_activeScreenKey)) {
            _remoteBaselineMetaSig.set(_activeScreenKey, computeMetadataSemanticSignature(st, fileName));
        }

        // Case B: Crash/Refresh recovery from IndexedDB on fresh browser load
        if (recoveredDraft) {
            if (st.activeFile && st.activeFile.meta) {
                if (Array.isArray(recoveredDraft.description)) {
                    st.activeFile.meta.description = recoveredDraft.description;
                    if (st.projectMetadata && st.projectMetadata.screens && st.projectMetadata.screens[fileName]) {
                        st.projectMetadata.screens[fileName].description = recoveredDraft.description;
                    }
                }
                if (Array.isArray(recoveredDraft.connectors)) {
                    st.activeFile.meta.connectors = recoveredDraft.connectors;
                    st.connectors = recoveredDraft.connectors;
                    if (st.projectMetadata && st.projectMetadata.screens && st.projectMetadata.screens[fileName]) {
                        st.projectMetadata.screens[fileName].connectors = recoveredDraft.connectors;
                    }
                }
            }
            if (recoveredDraft.projectMeta) {
                var aEl = document.getElementById('viewer-meta-assignee');
                var dEl = document.getElementById('viewer-meta-developer');
                var pEl = document.getElementById('viewer-meta-period');
                if (aEl && recoveredDraft.projectMeta.assignee) aEl.value = recoveredDraft.projectMeta.assignee;
                if (dEl && recoveredDraft.projectMeta.developer) dEl.value = recoveredDraft.projectMeta.developer;
                if (pEl && recoveredDraft.projectMeta.period) pEl.value = recoveredDraft.projectMeta.period;
            }

            window.fileContentCache = window.fileContentCache || {};
            if (_activeScreenKey && recoveredDraft.htmlContent) {
                window.fileContentCache[_activeScreenKey] = recoveredDraft.htmlContent;
            }

            _modificationSeq++;
            st.hasUnsavedChanges = true;
            var btnSave = document.getElementById('btn-global-save');
            if (btnSave) btnSave.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.6)';

            updateStatusUI('local-saved', '임시본 복구됨');
            _scheduleCloudSync(RECOVERED_SYNC_DELAY_MS);
            if (typeof window.showToast === 'function') {
                window.showToast('미동기화 자동 저장본을 복구했습니다. 잠시 후 클라우드에 자동 반영됩니다.', 'info');
            }
            return;
        }

        // Case C: Clean screen load
        st.hasUnsavedChanges = false;
        var btn = document.getElementById('btn-global-save');
        if (btn) btn.style.boxShadow = '';

        if (_pendingSnapshots.size > 0) {
            updateStatusUI('local-saved', '임시 저장됨');
            if (!_cloudTimer) _scheduleCloudSync(CLOUD_IDLE_DEBOUNCE_MS);
        } else {
            updateStatusUI('saved');
        }
    }

    /**
     * Flushes any staged background snapshots from other screens when user clicks [전체 저장] / Ctrl+S.
     */
    async function flushPendingSnapshotsForManualSave() {
        if (_pendingSnapshots.size === 0) return true;
        var res = await _drainPendingSnapshots('');
        return Boolean(res && res.allOk);
    }

    /**
     * Synchronizes internal baselines after manual [전체 저장] / Ctrl+S completes.
     */
    async function onManualSaveCompleted(project, fileName, savedHtmlContent) {
        if (_localTimer) { clearTimeout(_localTimer); _localTimer = null; }
        if (_pendingSnapshots.size === 0 && _cloudTimer) {
            clearTimeout(_cloudTimer);
            _cloudTimer = null;
        }

        var st = window.state || {};
        var key = (project && fileName) ? (project + '/' + fileName) : _activeScreenKey;
        var syncedHtml = savedHtmlContent || (window.fileContentCache && key && window.fileContentCache[key]) || '';
        if (key && syncedHtml) {
            _remoteBaselineHtml.set(key, syncedHtml);
        }
        if (key) {
            _remoteBaselineMetaSig.set(key, computeMetadataSemanticSignature(st, fileName));
        }

        _lastCloudSyncAt = Date.now();
        _lastMetaTimestampSyncAt = Date.now();
        _lastSyncedTimeLabel = _formatShortTime(new Date());

        if (project && fileName) {
            await clearDraft(project, fileName);
        }
        updateStatusUI('saved', '저장됨 · ' + _lastSyncedTimeLabel);
    }

    function shouldTouchMetadataTimestamp() {
        if (_lastMetaTimestampSyncAt === 0) return true;
        return (Date.now() - _lastMetaTimestampSyncAt) >= META_TIMESTAMP_THROTTLE_MS;
    }

    function hasPendingCloudSync() {
        return _pendingSnapshots.size > 0;
    }

    function getCurrentModificationSeq() {
        return _modificationSeq;
    }

    function _bindGlobalListeners() {
        // Pre-warm IndexedDB key index once in background on startup
        setTimeout(function () { _openDB(); }, 50);

        document.addEventListener('compositionstart', function () { _isComposing = true; }, true);
        document.addEventListener('compositionend', function () { _isComposing = false; }, true);

        document.addEventListener('input', function (e) {
            if (!e || !e.isTrusted || !e.target) return;
            var id = e.target.id;
            if (id === 'viewer-meta-assignee' || id === 'viewer-meta-developer' || id === 'viewer-meta-period' || id === 'viewer-meta-title') {
                if (typeof window.markAsDirty === 'function') {
                    window.markAsDirty();
                }
            }
        });

        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') {
                var st = window.state || {};
                if (st.hasUnsavedChanges && !st.isReadOnly) {
                    _executeLocalDraftSave();
                }
            }
        });
    }

    _bindGlobalListeners();

    window.AutoSaveEngine = {
        notifyModification: notifyModification,
        registerRemoteBaseline: registerRemoteBaseline,
        setRemoteBaselineHtml: setRemoteBaselineHtml,
        getRemoteBaselineHtml: getRemoteBaselineHtml,
        recoverDraftIfValid: recoverDraftIfValid,
        onScreenLoaded: onScreenLoaded,
        onManualSaveCompleted: onManualSaveCompleted,
        stageOutgoingScreenBeforeSwitch: stageOutgoingScreenBeforeSwitch,
        flushBeforeScreenSwitch: stageOutgoingScreenBeforeSwitch,
        flushPendingSnapshotsForManualSave: flushPendingSnapshotsForManualSave,
        computeMetadataSemanticSignature: computeMetadataSemanticSignature,
        getLastSyncedMetaSig: getLastSyncedMetaSig,
        setLastSyncedMetaSig: setLastSyncedMetaSig,
        shouldTouchMetadataTimestamp: shouldTouchMetadataTimestamp,
        hasPendingCloudSync: hasPendingCloudSync,
        getCurrentModificationSeq: getCurrentModificationSeq,
        updateStatusUI: updateStatusUI,
        clearDraft: clearDraft
    };
})();
