/**
 * LC Element Tools Debug Test
 * Simple script to test if our plugin is loading correctly
 */

console.log('LC Element Tools Debug Test - Script loaded');

function debugElementTools() {
    console.log('LC Element Tools Debug Test - DOM ready');
    
    // Environment check
    console.log('LC Element Tools Debug: Environment check:', {
        location: window.location.href,
        isIframe: window.self !== window.top,
        readyState: document.readyState,
        bodyClasses: Array.from(document.body.classList)
    });
    
    // Check if React is available
    if (typeof React !== 'undefined') {
        console.log('✓ React is available:', React.version);
    } else {
        console.log('✗ React not found');
    }
    
    // Check if ReactDOM is available
    if (typeof ReactDOM !== 'undefined') {
        console.log('✓ ReactDOM is available');
    } else {
        console.log('✗ ReactDOM not found');
    }
    
    // Check if our main React app is available
    if (typeof LCElementTools !== 'undefined') {
        console.log('✓ LCElementTools IIFE is available');
    } else {
        console.log('✗ LCElementTools IIFE not found');
    }
    
    // Check if the config is available
    if (typeof lcElementTools !== 'undefined') {
        console.log('✓ lcElementTools config is available:', lcElementTools);
    } else {
        console.log('✗ lcElementTools config not found');
    }
    
    // Check if hook fired meta tag is present (could be in parent or current document)
    const hookMetaTag = document.querySelector('meta[name="lc-element-tools-hook-fired"]') ||
                       (window.parent && window.parent.document ? 
                        window.parent.document.querySelector('meta[name="lc-element-tools-hook-fired"]') : null);
    if (hookMetaTag) {
        console.log('✓ LC Element Tools hook fired at:', hookMetaTag.getAttribute('content'));
    } else {
        console.log('✗ LC Element Tools hook meta tag not found - lc_editor_header may not have fired');
    }
    
    // Check for Livecanvas iframe context
    if (window.self === window.top) {
        console.log('LC Element Tools Debug: Running in parent window');
        const iframe = document.querySelector('#previewiframe');
        if (iframe) {
            console.log('✓ Livecanvas preview iframe found');
            if (iframe.contentDocument) {
                console.log('✓ Iframe contentDocument accessible');
                // Check if React root is in iframe
                const iframeRoot = iframe.contentDocument.querySelector('#lc-element-tools-root');
                if (iframeRoot) {
                    console.log('✓ React root container found in iframe');
                } else {
                    console.log('✗ React root container not found in iframe');
                }
            } else {
                console.log('✗ Iframe contentDocument not accessible');
            }
        } else {
            console.log('✗ Livecanvas preview iframe not found');
        }
    } else {
        console.log('LC Element Tools Debug: Running inside iframe');
    }
    
    // Check for any React root containers in current document
    const reactRoot = document.querySelector('#lc-element-tools-root');
    if (reactRoot) {
        console.log('✓ React root container found in current document');
    } else {
        console.log('✗ React root container not found in current document');
    }
    
    // Test a simple red debug button
    if (!document.querySelector('#lc-debug-button')) {
        const debugButton = document.createElement('button');
        debugButton.id = 'lc-debug-button';
        debugButton.textContent = 'LC Debug Test';
        debugButton.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            left: 10px !important;
            z-index: 999999 !important;
            background: red !important;
            color: white !important;
            padding: 8px 12px !important;
            border: none !important;
            border-radius: 4px !important;
            font-size: 12px !important;
            cursor: pointer !important;
        `;
        debugButton.onclick = function() {
            alert('LC Element Tools Debug Button Clicked!\\nDocument: ' + document.title);
        };
        document.body.appendChild(debugButton);
        console.log('✓ Debug button added to document');
    }
}

document.addEventListener('DOMContentLoaded', debugElementTools);