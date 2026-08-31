/**
 * assets/vctrl_responsive_multiselect.js
 * 
 * Dedicated Multi-Selection (Marquee) Coordinate Normalizer for Responsive PC & Mobile Screens.
 * - Resolves the coordinate space mismatch caused by nested scroll containers (.pc-content-inner, .mobile-content-inner).
 * - Intercepts LF_MARQUEE_START to recalculate targets with accurate viewport bounding rectangles.
 * - Strictly isolated: 0% side-effect or interference on non-responsive standard templates.
 */

window.v4ResponsiveMultiselectScript = `
(function() {
    console.log("%c [RESPONSIVE MULTISELECT] Dedicated Module Initialized ", "background: #6366f1; color: #ffffff; font-weight: bold; padding: 4px; border-radius: 4px;");

    function isResponsiveScreen() {
        return !!(document.querySelector('.pc-browser-frame, .mobile-browser-frame, .pc-content-inner, .mobile-content-inner'));
    }

    function recalculateTargetsForResponsive() {
        const correctedTargets = [];
        const components = document.querySelectorAll('.lf-component:not(.connector-line)');
        
        components.forEach(function(c) {
            if (!c || !c.getBoundingClientRect) return;
            const rect = c.getBoundingClientRect();
            let isChild = false;
            let parent = c.parentElement;
            while (parent && parent !== document.body) {
                if (parent.classList && (parent.classList.contains('lf-component') || parent.classList.contains('lf-group'))) {
                    isChild = true;
                    break;
                }
                parent = parent.parentElement;
            }

            correctedTargets.push({
                id: c.id,
                x: rect.left,
                y: rect.top,
                w: rect.width,
                h: rect.height,
                isGroupChild: isChild
            });
        });

        return correctedTargets;
    }

    function attachInterceptor() {
        if (typeof window.notifyParent === 'function' && !window._responsiveMarqueeInterceptorAttached) {
            window._responsiveMarqueeInterceptorAttached = true;
            const originalNotifyParent = window.notifyParent;
            window.notifyParent = function(data) {
                if (data && data.type === 'LF_MARQUEE_START' && isResponsiveScreen()) {
                    try {
                        const targets = recalculateTargetsForResponsive();
                        if (targets && targets.length > 0) {
                            data.targets = targets;
                        }
                    } catch (err) {
                        console.warn("[ResponsiveMultiselect] Recalculate error:", err);
                    }
                }
                return originalNotifyParent.apply(this, arguments);
            };
        }
    }

    // Attach immediately and ensure on DOM ready
    attachInterceptor();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachInterceptor);
    }
})();
`;
