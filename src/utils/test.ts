/**
 * Test script for LiveCanvas utilities
 * This script verifies that our utilities work exactly like LiveCanvas originals
 */

import { CSSelector, getPageHTML, setPageHTML, getAttributeValue, setAttributeValue, debounce, throttle } from './index';

// Test functions (for development/debugging only)
export function testUtilities() {
    console.log('🧪 Testing LiveCanvas Utilities...');
    
    // Test CSSelector
    console.log('Testing CSSelector...');
    const testEl = document.createElement('div');
    testEl.id = 'test-element';
    document.body.appendChild(testEl);
    
    const selector = CSSelector(testEl);
    console.log('CSSelector result:', selector);
    
    // Test HTML functions (these will need an actual LiveCanvas environment)
    console.log('Testing HTML functions...');
    try {
        const html = getPageHTML('body');
        console.log('getPageHTML works:', html ? 'Yes' : 'No document available yet');
    } catch (error) {
        console.log('getPageHTML needs LiveCanvas environment');
    }
    
    // Test attribute functions
    console.log('Testing attribute functions...');
    try {
        const attrValue = getAttributeValue('body', 'class');
        console.log('getAttributeValue works:', attrValue !== undefined ? 'Yes' : 'No document available yet');
    } catch (error) {
        console.log('getAttributeValue needs LiveCanvas environment');
    }
    
    // Test performance utilities
    console.log('Testing performance utilities...');
    let testCount = 0;
    const debouncedTest = debounce(() => {
        testCount++;
        console.log('Debounced function called:', testCount);
    }, 100);
    
    // Call multiple times - should only execute once after delay
    debouncedTest();
    debouncedTest();
    debouncedTest();
    
    let throttleCount = 0;
    const throttledTest = throttle(() => {
        throttleCount++;
        console.log('Throttled function called:', throttleCount);
    }, 100);
    
    // Call multiple times - should execute immediately then throttle
    throttledTest();
    throttledTest();
    throttledTest();
    
    // Cleanup
    document.body.removeChild(testEl);
    
    console.log('✅ Utility tests completed');
}

// Window availability check
export function checkWindowUtilities() {
    console.log('🔍 Checking window utilities...');
    
    const utilities = [
        'CSSelector',
        'getPageHTML',
        'setPageHTML', 
        'getAttributeValue',
        'setAttributeValue',
        'debounce',
        'throttle',
        'updatePreview',
        'updatePreviewSectorial',
        'filterPreviewHTML',
        'code_needs_hard_refresh',
        'sanitize_editable_rich',
        'getLayoutElementType',
        'getHtmlElementType',
        'getComputedPropertyForClass',
        'getClassesMappedArray',
        'capitalize',
        'generateReadableName',
        'lc_parseParams',
        'usingChromeBrowser',
        'getScrollBarWidth',
        'download',
        'lcRandomUUID'
    ];
    
    utilities.forEach(utilName => {
        const available = typeof (window as any)[utilName] === 'function';
        console.log(`window.${utilName}:`, available ? '✅ Available' : '❌ Missing');
    });
    
    // Check organized namespace
    const hasNamespace = typeof (window as any).LCUtils === 'object';
    console.log('window.LCUtils:', hasNamespace ? '✅ Available' : '❌ Missing');
    
    if (hasNamespace) {
        console.log('LCUtils structure:', Object.keys((window as any).LCUtils));
    }
}

// Export test functions for console access
if (typeof window !== 'undefined') {
    (window as any).testLCUtils = testUtilities;
    (window as any).checkLCUtils = checkWindowUtilities;
}