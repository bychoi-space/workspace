/**
 * assets/vctrl_system_modals.js
 * Universal UI Modals & Loading Overlay Controller (Parent Side).
 * Decoupled from vctrl_inspector.js for unified usage across Editor and Dashboard.
 */
(function() {
    const get = (id) => document.getElementById(id) || { style: {}, classList: { add:() => {}, remove:() => {}, toggle:() => {} }, innerText: '', innerHTML: '', onclick: null, oninput: null };

    window.showLoading = (text) => { 
        const overlay = get('loading-overlay'); 
        if (overlay) { 
            const txt = overlay.querySelector('.loading-text'); 
            if (txt) txt.innerText = text; 
            overlay.classList.remove('fade-out'); 
        } 
    };

    window.hideLoading = () => { 
        const overlay = get('loading-overlay'); 
        if (overlay) overlay.classList.add('fade-out'); 
        setTimeout(() => { 
            if (typeof window.centerView === 'function') window.centerView(); 
        }, 600); 
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