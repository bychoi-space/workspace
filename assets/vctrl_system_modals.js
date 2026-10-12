/**
 * assets/vctrl_system_modals.js
 * Universal UI Modals & Loading Overlay Controller (Parent Side).
 * Decoupled from vctrl_inspector.js for unified usage across Editor and Dashboard.
 */
(function() {
    const get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {}, toggle:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };

    window.showLoading = (text, subtext) => { 
        const overlay = get('loading-overlay'); 
        if (overlay) { 
            const txt = overlay.querySelector('.loading-text') || get('loading-text-display'); 
            if (txt && text) txt.innerText = text; 
            const sub = overlay.querySelector('.loading-subtext') || get('loading-subtext-display');
            if (sub) {
                if (subtext) {
                    sub.innerText = subtext;
                    sub.style.display = 'block';
                } else {
                    sub.style.display = 'none';
                }
            }
            overlay.classList.remove('fade-out'); 
        } 
    };

    window.hideLoading = () => { 
        const overlay = get('loading-overlay'); 
        if (overlay) {
            overlay.classList.add('fade-out'); 
            document.body.classList.add('workspace-docked');
        } 
        setTimeout(() => { 
            if (typeof window.centerView === 'function') window.centerView(); 
        }, 400); 
    };

    window.showAuthModal = () => { 
        const modal = get('auth-modal'); 
        if (modal) modal.classList.add('active'); 
    };

    window.hideAuthModal = () => { 
        const modal = get('auth-modal'); 
        if (modal) modal.classList.remove('active'); 
    };
})();