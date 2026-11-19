/**
 * assets/vctrl_supabase.js
 * Supabase Persistence, Auth (ID/PW), & Storage Asset Engine (Parent Side SSOT)
 * Target Project: digital-service-planning (workspace schema + workspace-assets bucket)
 */

(function () {
    'use strict';

    var SUPABASE_URL = 'https://cxgvharfkzdqiiquroqz.supabase.co';
    var SUPABASE_KEY = 'sb_publishable_N5Xy5DP47wg4vOuK9Vu1Yg_crTzHNpH';
    var STORAGE_BUCKET = 'workspace-assets';
    var SESSION_STORAGE_KEY = 'bychoi_sb_session';
    var LEGACY_DOMAIN_SUFFIX = '@workspace.local';

    var _session = null;
    var _refreshPromise = null;
    var _verifiedThisLoad = false;
    var _uploadedAssetCache = new Map();
    var _authListeners = [];
    var _activeAuthTab = 'login';

    function _escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function _nowSec() {
        return Math.floor(Date.now() / 1000);
    }

    function normalizeLoginIdToEmail(rawId) {
        var trimmed = String(rawId || '').trim();
        if (!trimmed) return '';
        if (trimmed.indexOf('@') !== -1) {
            return trimmed.toLowerCase();
        }
        return trimmed.toLowerCase() + LEGACY_DOMAIN_SUFFIX;
    }

    function _loadSessionSync() {
        try {
            var raw = localStorage.getItem(SESSION_STORAGE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.access_token) {
                return parsed;
            }
        } catch (_) { }
        return null;
    }

    function _saveSession(sess) {
        _session = sess || null;
        try {
            if (_session) {
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(_session));
            } else {
                localStorage.removeItem(SESSION_STORAGE_KEY);
            }
        } catch (_) { }
        _notifyAuthListeners();
    }

    function _clearSession() {
        _verifiedThisLoad = false;
        _saveSession(null);
    }

    function _notifyAuthListeners() {
        syncAuthUI();
        for (var i = 0; i < _authListeners.length; i++) {
            try {
                _authListeners[i](isAuthorized(), _session);
            } catch (_) { }
        }
    }

    function isAuthorized() {
        if (!_session || !_session.access_token) return false;
        if (_session.authorized === false) return false;
        if (_session.expires_at && _session.expires_at > (_nowSec() + 10)) {
            return true;
        }
        return Boolean(_session.refresh_token);
    }

    function getSessionInfo() {
        return _session ? Object.assign({}, _session) : null;
    }

    async function _fetchEditorProfile(accessToken) {
        if (!accessToken) {
            return { authenticated: false, authorized: false, profile: null };
        }
        var res = await fetch(SUPABASE_URL + '/rest/v1/rpc/ws_get_my_editor_profile', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: '{}'
        });
        if (!res.ok) {
            throw new Error('Editor profile check failed (' + res.status + ')');
        }
        return await res.json();
    }

    async function _refreshSessionInternal() {
        if (!_session || !_session.refresh_token) {
            _clearSession();
            return null;
        }
        try {
            var res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: _session.refresh_token })
            });
            if (!res.ok) {
                _clearSession();
                return null;
            }
            var data = await res.json();
            if (!data || !data.access_token) {
                _clearSession();
                return null;
            }
            var profRes = await _fetchEditorProfile(data.access_token);
            if (!profRes || !profRes.authorized) {
                _clearSession();
                return null;
            }
            var profile = profRes.profile || {};
            var nextSess = {
                access_token: data.access_token,
                refresh_token: data.refresh_token || _session.refresh_token,
                expires_at: data.expires_at || (_nowSec() + (data.expires_in || 3600)),
                user_id: profile.user_id || (data.user && data.user.id) || _session.user_id || '',
                username: profile.username || _session.username || 'bychoi',
                display_name: profile.display_name || profile.username || _session.display_name || 'bychoi',
                email: profile.email || (data.user && data.user.email) || _session.email || '',
                role: profile.role || _session.role || 'admin',
                authorized: true
            };
            _verifiedThisLoad = true;
            _saveSession(nextSess);
            return nextSess.access_token;
        } catch (err) {
            console.warn('[Supabase Auth] Token refresh failed:', err);
            return null;
        }
    }

    async function getValidAccessToken(forceRefresh) {
        if (!_session || !_session.access_token) return null;
        var needsRefresh = Boolean(forceRefresh) ||
            (_session.expires_at && _session.expires_at <= (_nowSec() + 60));

        if (!needsRefresh && _verifiedThisLoad) {
            return _session.access_token;
        }

        if (_refreshPromise) {
            return await _refreshPromise;
        }

        _refreshPromise = (async function () {
            if (needsRefresh) {
                return await _refreshSessionInternal();
            }
            try {
                var profRes = await _fetchEditorProfile(_session.access_token);
                if (profRes && profRes.authorized) {
                    _verifiedThisLoad = true;
                    return _session.access_token;
                }
                return await _refreshSessionInternal();
            } catch (_) {
                return await _refreshSessionInternal();
            }
        })().finally(function () {
            _refreshPromise = null;
        });

        return await _refreshPromise;
    }

    async function signIn(rawLoginId, password) {
        var email = normalizeLoginIdToEmail(rawLoginId);
        if (!email || !password) {
            return { ok: false, error: '아이디와 비밀번호를 모두 입력해주세요.' };
        }

        try {
            var res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: String(password) })
            });

            var payload = await res.json().catch(function () { return {}; });
            if (!res.ok || !payload.access_token) {
                var msg = payload.error_description || payload.msg || '';
                if (res.status === 400 || /invalid/i.test(msg)) {
                    return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
                }
                return { ok: false, error: msg || ('로그인에 실패했습니다. (' + res.status + ')') };
            }

            var profRes = await _fetchEditorProfile(payload.access_token);
            if (!profRes || !profRes.authorized) {
                return { ok: false, error: '편집 권한이 허용되지 않은 계정입니다.' };
            }

            var profile = profRes.profile || {};
            var nextSess = {
                access_token: payload.access_token,
                refresh_token: payload.refresh_token || '',
                expires_at: payload.expires_at || (_nowSec() + (payload.expires_in || 3600)),
                user_id: profile.user_id || (payload.user && payload.user.id) || '',
                username: profile.username || String(rawLoginId).trim(),
                display_name: profile.display_name || profile.username || String(rawLoginId).trim(),
                email: profile.email || email,
                role: profile.role || 'admin',
                authorized: true
            };
            _verifiedThisLoad = true;
            _saveSession(nextSess);
            return { ok: true, profile: nextSess };
        } catch (err) {
            return { ok: false, error: '네트워크 오류: ' + (err && err.message ? err.message : String(err)) };
        }
    }

    async function signUp(rawLoginId, password, displayName) {
        var username = String(rawLoginId || '').trim().toLowerCase();
        if (!username) {
            return { ok: false, error: '사용할 아이디를 입력해주세요.' };
        }
        if (username.indexOf('@') !== -1) {
            return { ok: false, error: '이메일 형식이 아닌 영문/숫자 아이디를 입력해주세요.' };
        }
        if (username.length < 2 || username.length > 32) {
            return { ok: false, error: '아이디는 2자 이상 32자 이하로 입력해주세요.' };
        }
        if (!/^[a-z0-9][a-z0-9_.-]{1,31}$/.test(username)) {
            return { ok: false, error: '아이디는 영문 소문자, 숫자, _, ., - 만 사용할 수 있으며 영문 또는 숫자로 시작해야 합니다.' };
        }
        if (!password || String(password).length < 4 || String(password).length > 72) {
            return { ok: false, error: '비밀번호는 4자 이상 72자 이하로 입력해주세요.' };
        }

        try {
            var regRes = await rpc('ws_register_editor', {
                p_username: username,
                p_password: String(password),
                p_display_name: String(displayName || '').trim()
            }, false);

            if (!regRes || !regRes.ok) {
                return { ok: false, error: (regRes && regRes.error) || '회원가입에 실패했습니다.' };
            }

            return await signIn(regRes.username || username, password);
        } catch (err) {
            return { ok: false, error: err && err.message ? err.message : '회원가입 처리 중 오류가 발생했습니다.' };
        }
    }

    async function signOut() {
        var tok = _session && _session.access_token;
        _clearSession();
        if (tok) {
            try {
                await fetch(SUPABASE_URL + '/auth/v1/logout', {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + tok
                    }
                });
            } catch (_) { }
        }
        return true;
    }

    async function changePassword(currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            return { ok: false, error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' };
        }
        if (String(newPassword).length < 4) {
            return { ok: false, error: '새 비밀번호는 4자 이상이어야 합니다.' };
        }
        try {
            var res = await rpc('ws_change_my_password', {
                p_current_password: String(currentPassword),
                p_new_password: String(newPassword)
            }, true);
            if (res && res.ok) {
                return { ok: true };
            }
            return { ok: false, error: (res && res.error) || '비밀번호 변경에 실패했습니다.' };
        } catch (err) {
            return { ok: false, error: err && err.message ? err.message : '비밀번호 변경 중 오류가 발생했습니다.' };
        }
    }

    async function rpc(fnName, params, requireAuth) {
        var token = null;
        if (isAuthorized() || requireAuth) {
            token = await getValidAccessToken(false);
        }
        if (requireAuth && !token) {
            throw new Error('관리자 로그인이 필요합니다.');
        }

        var doCall = async function (bearer) {
            return await fetch(SUPABASE_URL + '/rest/v1/rpc/' + encodeURIComponent(fnName), {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + (bearer || SUPABASE_KEY),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params || {})
            });
        };

        var res = await doCall(token);
        if (res.status === 401 && token) {
            token = await getValidAccessToken(true);
            if (!token) {
                throw new Error('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
            }
            res = await doCall(token);
        }

        var text = await res.text();
        if (!res.ok) {
            throw new Error('Supabase RPC ' + fnName + ' error (' + res.status + '): ' + text);
        }
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch (_) {
            return text;
        }
    }

    async function restDelete(viewName, queryFilter) {
        var token = await getValidAccessToken(false);
        if (!token) {
            throw new Error('관리자 로그인이 필요합니다.');
        }

        var doDelete = async function (bearer) {
            return await fetch(SUPABASE_URL + '/rest/v1/' + encodeURIComponent(viewName) + '?' + queryFilter, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + bearer,
                    'Prefer': 'return=minimal'
                }
            });
        };

        var res = await doDelete(token);
        if (res.status === 401) {
            token = await getValidAccessToken(true);
            if (!token) throw new Error('인증 세션이 만료되었습니다.');
            res = await doDelete(token);
        }
        if (!res.ok) {
            var errText = await res.text().catch(function () { return ''; });
            throw new Error('Supabase DELETE ' + viewName + ' error (' + res.status + '): ' + errText);
        }
        return true;
    }

    // --- Asset Upload & Base64 Offloading ---

    function _base64ToUint8Array(b64) {
        var clean = String(b64 || '').replace(/\s+/g, '');
        var binary = atob(clean);
        var len = binary.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    async function _computeSha256Hex(bytes) {
        if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
            try {
                var hashBuf = await window.crypto.subtle.digest('SHA-256', bytes);
                var arr = Array.from(new Uint8Array(hashBuf));
                return arr.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
            } catch (_) { }
        }
        var h1 = 0x811c9dc5;
        var h2 = 0x9e3779b9;
        for (var i = 0; i < bytes.length; i++) {
            h1 ^= bytes[i];
            h1 = Math.imul(h1, 0x01000193);
            h2 ^= bytes[i] ^ (i & 255);
            h2 = Math.imul(h2, 0x85ebca6b);
        }
        return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0') + '_' + bytes.length;
    }

    function _mimeFromSubtype(subtype) {
        var s = String(subtype || '').toLowerCase();
        if (s === 'jpeg' || s === 'jpg') return { ext: 'jpg', mime: 'image/jpeg' };
        if (s === 'webp') return { ext: 'webp', mime: 'image/webp' };
        if (s === 'gif') return { ext: 'gif', mime: 'image/gif' };
        return { ext: 'png', mime: 'image/png' };
    }

    async function _uploadBytesToBucket(storagePath, bytes, mimeType, sha256, projectSlug) {
        var token = await getValidAccessToken(false);
        if (!token) throw new Error('이미지 업로드를 위해 로그인이 필요합니다.');

        var encodedPath = storagePath.split('/').map(function (seg) { return encodeURIComponent(seg); }).join('/');
        var uploadUrl = SUPABASE_URL + '/storage/v1/object/' + STORAGE_BUCKET + '/' + encodedPath;
        var publicUrl = SUPABASE_URL + '/storage/v1/object/public/' + STORAGE_BUCKET + '/' + encodedPath;

        var res = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + token,
                'Content-Type': mimeType,
                'x-upsert': 'true',
                'cache-control': '31536000'
            },
            body: bytes
        });

        if (res.status === 401) {
            token = await getValidAccessToken(true);
            if (token) {
                res = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': mimeType,
                        'x-upsert': 'true',
                        'cache-control': '31536000'
                    },
                    body: bytes
                });
            }
        }

        if (!res.ok) {
            var errTxt = await res.text().catch(function () { return ''; });
            throw new Error('Storage upload failed (' + res.status + '): ' + errTxt);
        }

        try {
            await rpc('ws_upsert_media_asset', {
                p_sha256: sha256,
                p_project_slug: projectSlug || null,
                p_storage_path: storagePath,
                p_public_url: publicUrl,
                p_mime_type: mimeType,
                p_byte_size: bytes.length
            }, true);
        } catch (err) {
            console.warn('[Storage] Media registry metadata insert warning:', err);
        }

        return publicUrl;
    }

    async function processHtmlAssetsBeforeSave(html, projectSlug) {
        if (!html || typeof html !== 'string' || !isAuthorized()) return html;
        if (html.indexOf('data:image/') === -1) return html;

        var b64Re = /data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=\r\n]+)/gi;
        var matches = [];
        var m;
        while ((m = b64Re.exec(html)) !== null) {
            var cleanB64 = m[2].replace(/\s+/g, '');
            if (cleanB64.length >= 2048) {
                matches.push({ full: m[0], subtype: m[1], cleanB64: cleanB64 });
            }
        }
        if (matches.length === 0) return html;

        var replacements = new Map();
        for (var i = 0; i < matches.length; i++) {
            var item = matches[i];
            if (replacements.has(item.full)) continue;
            try {
                var bytes = _base64ToUint8Array(item.cleanB64);
                var sha = await _computeSha256Hex(bytes);
                var publicUrl = _uploadedAssetCache.get(sha);
                if (!publicUrl) {
                    var info = _mimeFromSubtype(item.subtype);
                    var storagePath = 'shared/' + sha + '.' + info.ext;
                    publicUrl = await _uploadBytesToBucket(storagePath, bytes, info.mime, sha, projectSlug);
                    _uploadedAssetCache.set(sha, publicUrl);
                }
                replacements.set(item.full, publicUrl);
            } catch (err) {
                console.warn('[Storage] Failed to offload inline image, keeping inline:', err);
            }
        }

        var result = html;
        replacements.forEach(function (publicUrl, dataUri) {
            result = result.split(dataUri).join(publicUrl);
        });
        return result;
    }

    async function uploadBinaryAsset(projectSlug, filename, content) {
        var bytes;
        if (content instanceof Uint8Array) {
            bytes = content;
        } else if (content instanceof ArrayBuffer) {
            bytes = new Uint8Array(content);
        } else if (typeof content === 'string') {
            bytes = _base64ToUint8Array(content);
        } else {
            throw new Error('Unsupported binary payload');
        }
        var sha = await _computeSha256Hex(bytes);
        var ext = String(filename || 'asset.png').split('.').pop().toLowerCase();
        var info = _mimeFromSubtype(ext);
        var storagePath = 'projects/' + projectSlug + '/' + String(filename).replace(/^\/+/, '');
        return await _uploadBytesToBucket(storagePath, bytes, info.mime, sha, projectSlug);
    }

    // --- Domain Persistence Methods ---

    async function listDashboardProjects() {
        var res = await rpc('ws_list_dashboard_projects', {}, false);
        return Array.isArray(res) ? res : [];
    }

    async function listProjectScreens(slug) {
        var res = await rpc('ws_list_project_screens', { p_slug: slug }, false);
        return Array.isArray(res) ? res : [];
    }

    async function getProjectMetadata(slug) {
        var res = await rpc('ws_get_project_metadata', { p_slug: slug }, false);
        if (!res || res.__not_found__) {
            return { __not_found__: true };
        }
        return res;
    }

    async function saveProjectMetadata(slug, metadata) {
        var res = await rpc('ws_save_project_metadata', {
            p_slug: slug,
            p_metadata: metadata || {}
        }, true);
        return Boolean(res);
    }

    async function saveScreenAtomic(slug, filename, data) {
        var payload = Object.assign({}, data || {});
        delete payload.existingMetadata;

        if (payload.htmlContent && !payload.skipHtmlCommit) {
            payload.htmlContent = await processHtmlAssetsBeforeSave(payload.htmlContent, slug);
        }

        var res = await rpc('ws_save_screen_atomic', {
            p_slug: slug,
            p_filename: filename || '',
            p_payload: payload
        }, true);
        return {
            ok: Boolean(res),
            htmlContent: payload.htmlContent || null
        };
    }

    async function getScreenHtml(slug, filename) {
        var res = await rpc('ws_get_screen_html', {
            p_slug: slug,
            p_filename: filename
        }, false);
        return (res === null || res === undefined) ? '__NOT_FOUND__' : String(res);
    }

    async function upsertScreenHtml(slug, filename, htmlContent, meta) {
        var processedHtml = await processHtmlAssetsBeforeSave(htmlContent || '', slug);
        var res = await rpc('ws_upsert_screen_html', {
            p_slug: slug,
            p_filename: filename,
            p_html: processedHtml,
            p_meta: meta || {}
        }, true);
        return { ok: Boolean(res), html: processedHtml };
    }

    async function deleteScreen(slug, filename) {
        var filter = 'project_slug=eq.' + encodeURIComponent(slug) + '&filename=eq.' + encodeURIComponent(filename);
        await restDelete('ws_screens', filter);
        await rpc('ws_remove_screen_from_order', {
            p_slug: slug,
            p_filename: filename
        }, true);
        return true;
    }

    async function deleteProject(slug) {
        var filter = 'slug=eq.' + encodeURIComponent(slug);
        await restDelete('ws_projects', filter);
        return true;
    }

    async function getProjectHistory(slug) {
        var res = await rpc('ws_get_project_history', { p_slug: slug }, false);
        return Array.isArray(res) ? res : [];
    }

    async function saveProjectHistory(slug, entries) {
        var res = await rpc('ws_save_project_history', {
            p_slug: slug,
            p_entries: Array.isArray(entries) ? entries : []
        }, true);
        return Boolean(res);
    }

    async function getGlobalComponents() {
        var res = await rpc('ws_get_global_components', {}, false);
        return Array.isArray(res) ? res : [];
    }

    async function saveGlobalComponents(components) {
        var list = Array.isArray(components) ? JSON.parse(JSON.stringify(components)) : [];
        for (var i = 0; i < list.length; i++) {
            if (list[i] && list[i].html) {
                list[i].html = await processHtmlAssetsBeforeSave(list[i].html, null);
            }
            if (list[i] && list[i].previewHtml) {
                list[i].previewHtml = await processHtmlAssetsBeforeSave(list[i].previewHtml, null);
            }
        }
        var res = await rpc('ws_save_global_components', { p_components: list }, true);
        return Boolean(res);
    }

    // --- Unified Auth Modal & Header UI Controller ---

    var SVG_USER_CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>';
    var SVG_LOCK_KEY = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

    function _setAuthStatusMessage(msg, isError, isSuccess) {
        var el = document.getElementById('modal-auth-status');
        if (!el) return;
        el.textContent = msg || '';
        el.style.color = isError ? '#f87171' : (isSuccess ? '#4ade80' : '');
    }

    function _applyAuthTabView(tab) {
        var isSignup = (tab === 'signup');
        var tabLogin = document.getElementById('tab-auth-login');
        var tabSignup = document.getElementById('tab-auth-signup');
        var titleEl = document.getElementById('auth-modal-title');
        var subEl = document.getElementById('auth-modal-subtitle');
        var loginSection = document.getElementById('auth-login-section');
        var signupSection = document.getElementById('auth-signup-section');
        var btnSubmit = document.getElementById('btn-modal-auth-submit');

        if (tabLogin) {
            tabLogin.classList.toggle('active', !isSignup);
            tabLogin.setAttribute('aria-selected', !isSignup ? 'true' : 'false');
        }
        if (tabSignup) {
            tabSignup.classList.toggle('active', isSignup);
            tabSignup.setAttribute('aria-selected', isSignup ? 'true' : 'false');
        }
        if (loginSection) loginSection.style.display = isSignup ? 'none' : '';
        if (signupSection) signupSection.style.display = isSignup ? '' : 'none';
        if (titleEl) titleEl.textContent = isSignup ? '간편 회원가입' : '계정 로그인';
        if (subEl) {
            subEl.textContent = isSignup
                ? '별도 승인 없이 아이디만으로 가입 즉시 편집이 가능합니다.'
                : '편집 및 저장 권한을 사용하려면 로그인하세요.';
        }
        if (btnSubmit) {
            btnSubmit.style.display = '';
            btnSubmit.disabled = false;
            btnSubmit.textContent = isSignup ? '가입하고 바로 시작' : '로그인';
        }
    }

    function switchAuthTab(tab) {
        _activeAuthTab = (tab === 'signup') ? 'signup' : 'login';
        _setAuthStatusMessage('', false, false);
        if (isAuthorized()) return;
        _applyAuthTabView(_activeAuthTab);
        setTimeout(function () {
            var targetId = (_activeAuthTab === 'signup') ? 'modal-signup-id' : 'modal-auth-id';
            var el = document.getElementById(targetId);
            if (el) el.focus();
        }, 30);
    }

    function syncAuthUI() {
        var authed = isAuthorized();
        var uname = (_session && (_session.display_name || _session.username)) || 'bychoi';
        var roleLower = (_session && _session.role ? String(_session.role).toLowerCase() : 'editor');
        var roleUpper = roleLower.toUpperCase();
        var safeUname = _escapeHtml(uname);

        // 1. Dashboard auth button (#btn-show-auth)
        var dashBtn = document.getElementById('btn-show-auth');
        if (dashBtn) {
            dashBtn.classList.toggle('is-authenticated', authed);
            dashBtn.title = authed ? ('로그인됨: ' + uname + ' (계정 관리)') : '로그인 / 회원가입';
            dashBtn.setAttribute('aria-label', dashBtn.title);
            dashBtn.innerHTML = (authed ? SVG_USER_CHECK : SVG_LOCK_KEY) +
                '<span class="auth-btn-label">' + (authed ? safeUname : '로그인') + '</span>';
        }

        // 2. Viewer auth button (#btn-viewer-auth)
        var viewerBtn = document.getElementById('btn-viewer-auth');
        if (viewerBtn) {
            viewerBtn.classList.toggle('is-authenticated', authed);
            viewerBtn.title = authed ? ('로그인됨: ' + uname + ' (계정 관리)') : '로그인 / 회원가입 (열람 전용 모드)';
            viewerBtn.innerHTML = (authed ? SVG_USER_CHECK : SVG_LOCK_KEY) +
                '<span class="viewer-auth-label">' + (authed ? safeUname : '로그인') + '</span>';
        }

        // 3. Viewer autosave / readonly badge (#autosave-status-badge)
        var autoBadge = document.getElementById('autosave-status-badge');
        if (autoBadge) {
            if (!authed) {
                autoBadge.style.display = '';
                autoBadge.setAttribute('data-state', 'readonly');
                autoBadge.title = '로그인하거나 간편 회원가입하면 화면을 편집하고 저장할 수 있습니다.';
                var ind = autoBadge.querySelector('.autosave-indicator');
                var txt = autoBadge.querySelector('.autosave-text');
                if (ind) ind.innerHTML = '<span class="autosave-dot"></span>';
                if (txt) txt.textContent = '열람 전용 모드';
            } else if (autoBadge.getAttribute('data-state') === 'readonly') {
                if (window.AutoSaveEngine && typeof window.AutoSaveEngine.updateStatusUI === 'function') {
                    window.AutoSaveEngine.updateStatusUI('saved');
                }
            }
        }

        // 4. Sync #auth-modal contents if present
        var modal = document.getElementById('auth-modal');
        if (!modal) return;
        var titleEl = document.getElementById('auth-modal-title');
        var subEl = document.getElementById('auth-modal-subtitle');
        var modeTabs = document.getElementById('auth-mode-tabs');
        var loginSection = document.getElementById('auth-login-section');
        var signupSection = document.getElementById('auth-signup-section');
        var accountSection = document.getElementById('auth-account-section');
        var accountNameEl = document.getElementById('auth-account-username');
        var accountRoleEl = document.getElementById('auth-account-role');
        var btnSubmit = document.getElementById('btn-modal-auth-submit');
        var btnLogout = document.getElementById('btn-modal-auth-logout');
        var pwPanel = document.getElementById('auth-pw-change-panel');

        if (authed) {
            if (titleEl) titleEl.textContent = '계정 및 권한 관리';
            if (subEl) {
                subEl.textContent = roleLower === 'admin'
                    ? '관리자 권한으로 안전하게 연결되어 있습니다.'
                    : '편집자 권한으로 안전하게 연결되어 있습니다.';
            }
            if (modeTabs) modeTabs.style.display = 'none';
            if (loginSection) loginSection.style.display = 'none';
            if (signupSection) signupSection.style.display = 'none';
            if (accountSection) accountSection.style.display = '';
            if (accountNameEl) accountNameEl.textContent = uname;
            if (accountRoleEl) {
                accountRoleEl.textContent = roleUpper;
                accountRoleEl.setAttribute('data-role', roleLower);
            }
            if (btnSubmit) btnSubmit.style.display = 'none';
            if (btnLogout) btnLogout.style.display = '';
        } else {
            if (modeTabs) modeTabs.style.display = '';
            if (accountSection) accountSection.style.display = 'none';
            if (pwPanel) pwPanel.style.display = 'none';
            if (btnLogout) btnLogout.style.display = 'none';
            _applyAuthTabView(_activeAuthTab);
        }
    }

    function openAuthModal(defaultTab) {
        if (defaultTab === 'signup' || defaultTab === 'login') {
            _activeAuthTab = defaultTab;
        }
        syncAuthUI();
        _setAuthStatusMessage('', false, false);
        var modal = document.getElementById('auth-modal');
        if (!modal) return;
        modal.classList.add('active');
        if (!isAuthorized()) {
            setTimeout(function () {
                if (_activeAuthTab === 'signup') {
                    var regId = document.getElementById('modal-signup-id');
                    if (regId) regId.focus();
                } else {
                    var idInput = document.getElementById('modal-auth-id');
                    var pwInput = document.getElementById('modal-auth-pw');
                    if (idInput) {
                        if (!idInput.value) idInput.focus();
                        else if (pwInput) pwInput.focus();
                    }
                }
            }, 60);
        }
    }

    function closeAuthModal() {
        var modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('active');
        _setAuthStatusMessage('', false, false);
        _activeAuthTab = 'login';
        [
            'modal-auth-pw',
            'modal-auth-cur-pw',
            'modal-auth-new-pw',
            'modal-signup-id',
            'modal-signup-name',
            'modal-signup-pw',
            'modal-signup-pw-confirm'
        ].forEach(function (fieldId) {
            var el = document.getElementById(fieldId);
            if (el) el.value = '';
        });
    }

    function _isViewerPage() {
        return Boolean(document.body && document.body.classList.contains('editor-page'));
    }

    async function _handleLoginSubmit() {
        var idEl = document.getElementById('modal-auth-id');
        var pwEl = document.getElementById('modal-auth-pw');
        var btnSubmit = document.getElementById('btn-modal-auth-submit');
        var loginId = idEl ? idEl.value.trim() : '';
        var password = pwEl ? pwEl.value : '';

        if (!loginId || !password) {
            _setAuthStatusMessage('아이디와 비밀번호를 입력해주세요.', true, false);
            return;
        }

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = '확인 중...';
        }
        _setAuthStatusMessage('로그인 확인 중입니다...', false, false);

        var res = await signIn(loginId, password);
        if (res.ok) {
            _setAuthStatusMessage('로그인 성공!', false, true);
            if (_isViewerPage()) {
                if (typeof window.showToast === 'function') {
                    window.showToast('로그인되었습니다. 편집 모드로 전환합니다.', 'success');
                }
                setTimeout(function () {
                    location.reload();
                }, 350);
            } else {
                setTimeout(function () {
                    closeAuthModal();
                    if (typeof window.showToast === 'function') {
                        window.showToast('로그인되었습니다 (' + (res.profile && res.profile.username ? res.profile.username : loginId) + ').', 'success');
                    }
                }, 300);
            }
        } else {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '로그인';
            }
            _setAuthStatusMessage(res.error || '로그인에 실패했습니다.', true, false);
        }
    }

    async function _handleSignupSubmit() {
        var idEl = document.getElementById('modal-signup-id');
        var nameEl = document.getElementById('modal-signup-name');
        var pwEl = document.getElementById('modal-signup-pw');
        var pwConfirmEl = document.getElementById('modal-signup-pw-confirm');
        var btnSubmit = document.getElementById('btn-modal-auth-submit');

        var loginId = idEl ? idEl.value.trim() : '';
        var displayName = nameEl ? nameEl.value.trim() : '';
        var password = pwEl ? pwEl.value : '';
        var passwordConfirm = pwConfirmEl ? pwConfirmEl.value : '';

        if (!loginId || !password) {
            _setAuthStatusMessage('사용할 아이디와 비밀번호를 입력해주세요.', true, false);
            return;
        }
        if (password !== passwordConfirm) {
            _setAuthStatusMessage('비밀번호 확인이 일치하지 않습니다.', true, false);
            if (pwConfirmEl) pwConfirmEl.focus();
            return;
        }

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = '가입 처리 중...';
        }
        _setAuthStatusMessage('계정 생성 및 로그인 처리 중입니다...', false, false);

        var res = await signUp(loginId, password, displayName);
        if (res.ok) {
            var welcomeName = (res.profile && (res.profile.display_name || res.profile.username)) || loginId;
            _setAuthStatusMessage('가입 완료! 바로 편집할 수 있습니다.', false, true);
            if (_isViewerPage()) {
                if (typeof window.showToast === 'function') {
                    window.showToast('회원가입이 완료되었습니다. 편집 모드로 전환합니다.', 'success');
                }
                setTimeout(function () {
                    location.reload();
                }, 350);
            } else {
                setTimeout(function () {
                    closeAuthModal();
                    if (typeof window.showToast === 'function') {
                        window.showToast('환영합니다, ' + welcomeName + '님! 바로 편집할 수 있습니다.', 'success');
                    }
                }, 300);
            }
        } else {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = '가입하고 바로 시작';
            }
            _setAuthStatusMessage(res.error || '회원가입에 실패했습니다.', true, false);
        }
    }

    async function _handleLogoutClick() {
        var st = window.state || {};
        if (_isViewerPage() && st.hasUnsavedChanges && window.Notification && typeof window.Notification.confirm === 'function') {
            var ok = await window.Notification.confirm('저장되지 않은 변경사항이 있습니다. 로그아웃하시겠습니까?', '로그아웃 확인', 'warning');
            if (!ok) return;
        }
        await signOut();
        if (_isViewerPage()) {
            if (typeof window.showToast === 'function') {
                window.showToast('로그아웃되었습니다. 열람 전용 모드로 전환합니다.', 'info');
            }
            setTimeout(function () {
                location.reload();
            }, 300);
        } else {
            closeAuthModal();
            if (typeof window.showToast === 'function') {
                window.showToast('로그아웃되었습니다 (열람 전용 모드).', 'info');
            }
        }
    }

    async function _handlePasswordChangeSave() {
        var curEl = document.getElementById('modal-auth-cur-pw');
        var newEl = document.getElementById('modal-auth-new-pw');
        var btnSave = document.getElementById('btn-modal-pw-save');
        var curPw = curEl ? curEl.value : '';
        var newPw = newEl ? newEl.value : '';

        if (btnSave) {
            btnSave.disabled = true;
            btnSave.textContent = '변경 중...';
        }
        var res = await changePassword(curPw, newPw);
        if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = '변경 저장';
        }

        if (res.ok) {
            if (curEl) curEl.value = '';
            if (newEl) newEl.value = '';
            var pwPanel = document.getElementById('auth-pw-change-panel');
            if (pwPanel) pwPanel.style.display = 'none';
            _setAuthStatusMessage('비밀번호가 변경되었습니다.', false, true);
        } else {
            _setAuthStatusMessage(res.error || '비밀번호 변경에 실패했습니다.', true, false);
        }
    }

    function initAuthUI() {
        window.showAuthModal = openAuthModal;
        window.hideAuthModal = closeAuthModal;

        var dashBtn = document.getElementById('btn-show-auth');
        if (dashBtn) dashBtn.onclick = function () { openAuthModal(); };

        var viewerBtn = document.getElementById('btn-viewer-auth');
        if (viewerBtn) viewerBtn.onclick = function () { openAuthModal(); };

        var tabLogin = document.getElementById('tab-auth-login');
        if (tabLogin) tabLogin.onclick = function () { switchAuthTab('login'); };

        var tabSignup = document.getElementById('tab-auth-signup');
        if (tabSignup) tabSignup.onclick = function () { switchAuthTab('signup'); };

        var cancelBtn = document.getElementById('btn-modal-auth-cancel');
        if (cancelBtn) cancelBtn.onclick = closeAuthModal;

        var submitBtn = document.getElementById('btn-modal-auth-submit');
        if (submitBtn) {
            submitBtn.onclick = function () {
                if (_activeAuthTab === 'signup') _handleSignupSubmit();
                else _handleLoginSubmit();
            };
        }

        var logoutBtn = document.getElementById('btn-modal-auth-logout');
        if (logoutBtn) logoutBtn.onclick = _handleLogoutClick;

        var togglePwBtn = document.getElementById('btn-toggle-pw-change');
        if (togglePwBtn) {
            togglePwBtn.onclick = function () {
                var panel = document.getElementById('auth-pw-change-panel');
                if (!panel) return;
                var open = panel.style.display === 'none' || !panel.style.display;
                panel.style.display = open ? 'block' : 'none';
                _setAuthStatusMessage('', false, false);
            };
        }

        var savePwBtn = document.getElementById('btn-modal-pw-save');
        if (savePwBtn) savePwBtn.onclick = _handlePasswordChangeSave;

        var idInput = document.getElementById('modal-auth-id');
        var pwInput = document.getElementById('modal-auth-pw');
        if (idInput) {
            idInput.onkeydown = function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (pwInput && !pwInput.value) pwInput.focus();
                    else _handleLoginSubmit();
                }
            };
        }
        if (pwInput) {
            pwInput.onkeydown = function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    _handleLoginSubmit();
                }
            };
        }

        var signupInputs = ['modal-signup-id', 'modal-signup-name', 'modal-signup-pw', 'modal-signup-pw-confirm']
            .map(function (id) { return document.getElementById(id); })
            .filter(Boolean);
        signupInputs.forEach(function (inp, idx) {
            inp.onkeydown = function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    var nextInp = signupInputs[idx + 1];
                    if (nextInp && !nextInp.value) nextInp.focus();
                    else _handleSignupSubmit();
                }
            };
        });

        var modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeAuthModal();
            });
        }

        syncAuthUI();
    }

    // Bootstrap session synchronously from localStorage
    _session = _loadSessionSync();

    // Cross-tab auth synchronization
    window.addEventListener('storage', function (e) {
        if (e && e.key === SESSION_STORAGE_KEY) {
            _session = _loadSessionSync();
            _verifiedThisLoad = false;
            _notifyAuthListeners();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthUI);
    } else {
        initAuthUI();
    }

    // Verify/refresh session silently in background on startup
    if (_session) {
        setTimeout(function () {
            getValidAccessToken(false).catch(function () { });
        }, 10);
    }

    window.WorkspaceSupabase = {
        url: SUPABASE_URL,
        key: SUPABASE_KEY,
        bucket: STORAGE_BUCKET,
        normalizeLoginIdToEmail: normalizeLoginIdToEmail,
        isAuthorized: isAuthorized,
        getSessionInfo: getSessionInfo,
        getValidAccessToken: getValidAccessToken,
        signIn: signIn,
        signUp: signUp,
        signOut: signOut,
        changePassword: changePassword,
        switchAuthTab: switchAuthTab,
        rpc: rpc,
        restDelete: restDelete,
        processHtmlAssetsBeforeSave: processHtmlAssetsBeforeSave,
        uploadBinaryAsset: uploadBinaryAsset,
        listDashboardProjects: listDashboardProjects,
        listProjectScreens: listProjectScreens,
        getProjectMetadata: getProjectMetadata,
        saveProjectMetadata: saveProjectMetadata,
        saveScreenAtomic: saveScreenAtomic,
        getScreenHtml: getScreenHtml,
        upsertScreenHtml: upsertScreenHtml,
        deleteScreen: deleteScreen,
        deleteProject: deleteProject,
        getProjectHistory: getProjectHistory,
        saveProjectHistory: saveProjectHistory,
        getGlobalComponents: getGlobalComponents,
        saveGlobalComponents: saveGlobalComponents,
        openAuthModal: openAuthModal,
        closeAuthModal: closeAuthModal,
        syncAuthUI: syncAuthUI,
        onAuthChange: function (cb) {
            if (typeof cb === 'function') _authListeners.push(cb);
        }
    };
})();
