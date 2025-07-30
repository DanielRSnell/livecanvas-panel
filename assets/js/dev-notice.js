/**
 * LC Element Tools - Development Notice
 * 
 * Shows a notice when React build is not available
 */

(function() {
    'use strict';
    
    // Only show notice to users with edit capabilities
    if (!window.lcElementTools) {
        return;
    }
    
    // Create notice element
    function createDevNotice() {
        const notice = document.createElement('div');
        notice.id = 'lc-element-tools-dev-notice';
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f39c12;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            max-width: 350px;
            cursor: pointer;
        `;
        
        notice.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">⚠️</span>
                <div>
                    <strong>LC Element Tools</strong><br>
                    <small>React build not found. Run <code>npm run build</code> to enable the new interface.</small>
                </div>
            </div>
        `;
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notice.parentNode) {
                notice.remove();
            }
        }, 10000);
        
        // Click to dismiss
        notice.addEventListener('click', () => {
            notice.remove();
        });
        
        return notice;
    }
    
    // Show notice when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(createDevNotice());
        });
    } else {
        document.body.appendChild(createDevNotice());
    }
    
    console.log('LC Element Tools: Development mode - React build not found');
})();