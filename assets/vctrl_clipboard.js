/**
 * assets/vctrl_clipboard.js
 * Dedicated clipboard manager for URL copying, dropdown handling, and clipboard fallback operations.
 * Decoupled from vctrl_core.js for single-responsibility and clean event delegation.
 */
(function () {
    'use strict';

    /**
     * Safe asynchronous text copy to system clipboard with fallback
     * @param {string} text - Text to copy
     * @param {string} [successMessage] - Optional toast notification message
     * @returns {Promise<boolean>}
     */
    async function copyTextToClipboard(text, successMessage) {
        if (!text) return false;
        let success = false;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                success = true;
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.top = '-9999px';
                textArea.style.left = '-9999px';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                success = document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('[ClipboardManager] Copy failed:', err);
            success = false;
        }

        if (success && successMessage && typeof window.showToast === 'function') {
            window.showToast(successMessage, 'success');
        }
        return success;
    }

    /**
     * Handles global click events for the URL copy dropdown and menu actions
     * @param {MouseEvent} e - The global click event
     * @returns {boolean} true if handled, false otherwise
     */
    function handleUrlCopyClick(e) {
        if (!e || !e.target) return false;

        const copyUrlBtn = e.target.closest('#btn-copy-project-url');
        const menuCopyProject = e.target.closest('#menu-copy-project-url');
        const menuCopyScreen = e.target.closest('#menu-copy-screen-url');
        const copyMenu = document.getElementById('url-copy-menu');

        // 1. Toggle dropdown button clicked
        if (copyUrlBtn) {
            e.preventDefault();
            e.stopPropagation();
            if (copyMenu) {
                const isVisible = copyMenu.style.display === 'flex';
                if (isVisible) {
                    copyMenu.style.display = 'none';
                    copyUrlBtn.classList.remove('active');
                } else {
                    const state = window.state || {};
                    const activeScreen = state.activeFile ? (state.activeFile.name || state.activeFile) : null;
                    const screenItem = document.getElementById('menu-copy-screen-url');
                    const screenSubText = document.getElementById('menu-screen-name-sub');

                    if (activeScreen) {
                        if (screenItem) screenItem.classList.remove('disabled');
                        if (screenSubText) screenSubText.innerText = activeScreen;
                    } else {
                        if (screenItem) screenItem.classList.add('disabled');
                        if (screenSubText) screenSubText.innerText = '선택된 화면 없음';
                    }

                    copyMenu.style.display = 'flex';
                    copyUrlBtn.classList.add('active');
                }
            }
            return true;
        }

        // 2. Copy Project URL clicked
        if (menuCopyProject) {
            e.preventDefault();
            e.stopPropagation();
            if (copyMenu) copyMenu.style.display = 'none';
            const triggerBtn = document.getElementById('btn-copy-project-url');
            if (triggerBtn) triggerBtn.classList.remove('active');

            const state = window.state || {};
            const currentProj = state.currentProject || new URLSearchParams(window.location.search).get('project');
            if (currentProj && typeof window.copyProjectShortUrl === 'function') {
                window.copyProjectShortUrl(currentProj);
            }
            return true;
        }

        // 3. Copy Screen URL clicked
        if (menuCopyScreen) {
            e.preventDefault();
            e.stopPropagation();
            if (menuCopyScreen.classList.contains('disabled')) return true;

            if (copyMenu) copyMenu.style.display = 'none';
            const triggerBtn = document.getElementById('btn-copy-project-url');
            if (triggerBtn) triggerBtn.classList.remove('active');

            const state = window.state || {};
            const currentProj = state.currentProject || new URLSearchParams(window.location.search).get('project');
            const activeScreen = state.activeFile ? (state.activeFile.name || state.activeFile) : null;

            if (currentProj && activeScreen && typeof window.copyProjectShortUrl === 'function') {
                window.copyProjectShortUrl(currentProj, { screenName: activeScreen });
            }
            return true;
        }

        // 4. Clicked outside dropdown - close menu
        if (copyMenu && copyMenu.style.display === 'flex' && !e.target.closest('#url-copy-dropdown-wrapper')) {
            copyMenu.style.display = 'none';
            const triggerBtn = document.getElementById('btn-copy-project-url');
            if (triggerBtn) triggerBtn.classList.remove('active');
        }

        return false;
    }

    window.ClipboardManager = {
        copyTextToClipboard: copyTextToClipboard,
        handleUrlCopyClick: handleUrlCopyClick
    };
})();
