/**
 * Window Utilities Bootstrap
 * Registers all LiveCanvas-compatible utility functions on the window object
 * for full compatibility with existing LiveCanvas code
 */

// Import all utilities
import { debounce, throttle } from '../performance';
import { CSSelector, getLayoutElementType, getHtmlElementType, getElementTypeInfo } from '../core';
import { 
    getPageHTML, 
    getPageHTMLOuter, 
    setPageHTML, 
    setPageHTMLOuter,
    getAttributeValue,
    setAttributeValue 
} from '../content';
import {
    updatePreview,
    updatePreviewSectorial,
    replaceSelectorWithHtmlAndUpdatePreview,
    tryToEnrichPreview,
    enrichPreview,
    enrichPreviewSectorial,
    filterPreviewHTML,
    code_needs_hard_refresh,
    sanitize_editable_rich
} from '../preview';
import {
    getComputedPropertyForClass,
    getClassesMappedArray,
    getCSSVariablesMappedArray,
    processStyleRule,
    processCSSVariableRule
} from '../styling';
import {
    capitalize,
    generateReadableName,
    lc_parseParams,
    lc_get_parameter_value_from_shortcode,
    fixMultipleQuestionMarks,
    countOccurrences,
    cleanTextToSearch,
    arrayColumn,
    lcRandomUUID,
    sleep
} from '../text';
import {
    usingChromeBrowser,
    determineScrollBarWidth,
    getScrollBarWidth
} from '../browser';
import {
    download
} from '../files';
import {
    render_dynamic_content,
    render_dynamic_templating_shortcodes_in,
    render_dynamic_partials_in,
    render_shortcode,
    render_shortcodes_in,
    put_placeholders_in_lnl_tags_in
} from '../data';

/**
 * Gets the namespace category for a function name
 * @param functionName - Name of the function
 * @returns string - Namespace category
 */
function getNamespaceForFunction(functionName: string): string {
    const performanceFunctions = ['debounce', 'throttle'];
    const coreFunctions = ['CSSelector', 'getLayoutElementType', 'getHtmlElementType', 'getElementTypeInfo'];
    const contentFunctions = ['getPageHTML', 'getPageHTMLOuter', 'setPageHTML', 'setPageHTMLOuter', 'getAttributeValue', 'setAttributeValue'];
    const previewFunctions = ['updatePreview', 'updatePreviewSectorial', 'replaceSelectorWithHtmlAndUpdatePreview', 'tryToEnrichPreview', 'enrichPreview', 'enrichPreviewSectorial', 'filterPreviewHTML', 'code_needs_hard_refresh', 'sanitize_editable_rich'];
    const stylingFunctions = ['getComputedPropertyForClass', 'getClassesMappedArray', 'getCSSVariablesMappedArray', 'processStyleRule', 'processCSSVariableRule'];
    
    if (performanceFunctions.includes(functionName)) return 'performance';
    if (coreFunctions.includes(functionName)) return 'core';
    if (contentFunctions.includes(functionName)) return 'content';
    if (previewFunctions.includes(functionName)) return 'preview';
    if (stylingFunctions.includes(functionName)) return 'styling';
    return 'misc';
}

/**
 * Bootstrap function to register all utilities on window
 * Supplements LiveCanvas without conflicting with its initialization
 */
function bootstrapLiveCanvasUtils(): void {
    // Extend window interface for TypeScript
    declare global {
        interface Window {
            // Performance utilities
            debounce: typeof debounce;
            throttle: typeof throttle;
            
            // Core utilities  
            CSSelector: typeof CSSelector;
            getLayoutElementType: typeof getLayoutElementType;
            getHtmlElementType: typeof getHtmlElementType;
            getElementTypeInfo: typeof getElementTypeInfo;
            
            // Content utilities
            getPageHTML: typeof getPageHTML;
            getPageHTMLOuter: typeof getPageHTMLOuter;
            setPageHTML: typeof setPageHTML;
            setPageHTMLOuter: typeof setPageHTMLOuter;
            getAttributeValue: typeof getAttributeValue;
            setAttributeValue: typeof setAttributeValue;
            
            // Preview utilities
            updatePreview: typeof updatePreview;
            updatePreviewSectorial: typeof updatePreviewSectorial;
            replaceSelectorWithHtmlAndUpdatePreview: typeof replaceSelectorWithHtmlAndUpdatePreview;
            tryToEnrichPreview: typeof tryToEnrichPreview;
            enrichPreview: typeof enrichPreview;
            enrichPreviewSectorial: typeof enrichPreviewSectorial;
            filterPreviewHTML: typeof filterPreviewHTML;
            code_needs_hard_refresh: typeof code_needs_hard_refresh;
            sanitize_editable_rich: typeof sanitize_editable_rich;
            
            // Styling utilities
            getComputedPropertyForClass: typeof getComputedPropertyForClass;
            getClassesMappedArray: typeof getClassesMappedArray;
            getCSSVariablesMappedArray: typeof getCSSVariablesMappedArray;
            processStyleRule: typeof processStyleRule;
            processCSSVariableRule: typeof processCSSVariableRule;
            
            // Text utilities
            capitalize: typeof capitalize;
            generateReadableName: typeof generateReadableName;
            lc_parseParams: typeof lc_parseParams;
            lc_get_parameter_value_from_shortcode: typeof lc_get_parameter_value_from_shortcode;
            fixMultipleQuestionMarks: typeof fixMultipleQuestionMarks;
            countOccurrences: typeof countOccurrences;
            cleanTextToSearch: typeof cleanTextToSearch;
            arrayColumn: typeof arrayColumn;
            lcRandomUUID: typeof lcRandomUUID;
            sleep: typeof sleep;
            
            // Browser utilities
            usingChromeBrowser: typeof usingChromeBrowser;
            determineScrollBarWidth: typeof determineScrollBarWidth;
            getScrollBarWidth: typeof getScrollBarWidth;
            
            // File utilities
            download: typeof download;
            
            // Data processing utilities
            render_dynamic_content: typeof render_dynamic_content;
            render_dynamic_templating_shortcodes_in: typeof render_dynamic_templating_shortcodes_in;
            render_dynamic_partials_in: typeof render_dynamic_partials_in;
            render_shortcode: typeof render_shortcode;
            render_shortcodes_in: typeof render_shortcodes_in;
            put_placeholders_in_lnl_tags_in: typeof put_placeholders_in_lnl_tags_in;
            
            // Utility namespace (organized access)
            LCUtils?: {
                performance: {
                    debounce: typeof debounce;
                    throttle: typeof throttle;
                };
                core: {
                    CSSelector: typeof CSSelector;
                    getLayoutElementType: typeof getLayoutElementType;
                    getHtmlElementType: typeof getHtmlElementType;
                    getElementTypeInfo: typeof getElementTypeInfo;
                };
                content: {
                    getPageHTML: typeof getPageHTML;
                    getPageHTMLOuter: typeof getPageHTMLOuter;
                    setPageHTML: typeof setPageHTML;
                    setPageHTMLOuter: typeof setPageHTMLOuter;
                    getAttributeValue: typeof getAttributeValue;
                    setAttributeValue: typeof setAttributeValue;
                };
                preview: {
                    updatePreview: typeof updatePreview;
                    updatePreviewSectorial: typeof updatePreviewSectorial;
                    replaceSelectorWithHtmlAndUpdatePreview: typeof replaceSelectorWithHtmlAndUpdatePreview;
                    tryToEnrichPreview: typeof tryToEnrichPreview;
                    enrichPreview: typeof enrichPreview;
                    enrichPreviewSectorial: typeof enrichPreviewSectorial;
                    filterPreviewHTML: typeof filterPreviewHTML;
                    code_needs_hard_refresh: typeof code_needs_hard_refresh;
                    sanitize_editable_rich: typeof sanitize_editable_rich;
                };
                styling: {
                    getComputedPropertyForClass: typeof getComputedPropertyForClass;
                    getClassesMappedArray: typeof getClassesMappedArray;
                    getCSSVariablesMappedArray: typeof getCSSVariablesMappedArray;
                    processStyleRule: typeof processStyleRule;
                    processCSSVariableRule: typeof processCSSVariableRule;
                };
            };
        }
    }
    
    // Check if LiveCanvas functions already exist, and supplement only if missing
    const registerFunction = (name: string, func: Function) => {
        if (typeof (window as any)[name] === 'undefined') {
            (window as any)[name] = func;
        } else {
            // Store our version as backup in LCUtils namespace
            console.log(`Function ${name} already exists, available in LCUtils.${getNamespaceForFunction(name)}`);
        }
    };

    // Register functions with conflict detection
    registerFunction('debounce', debounce);
    registerFunction('throttle', throttle);
    registerFunction('CSSelector', CSSelector);
    registerFunction('getLayoutElementType', getLayoutElementType);
    registerFunction('getHtmlElementType', getHtmlElementType);
    registerFunction('getElementTypeInfo', getElementTypeInfo);
    registerFunction('getPageHTML', getPageHTML);
    registerFunction('getPageHTMLOuter', getPageHTMLOuter);
    registerFunction('setPageHTML', setPageHTML);
    registerFunction('setPageHTMLOuter', setPageHTMLOuter);
    registerFunction('getAttributeValue', getAttributeValue);
    registerFunction('setAttributeValue', setAttributeValue);
    registerFunction('updatePreview', updatePreview);
    registerFunction('updatePreviewSectorial', updatePreviewSectorial);
    registerFunction('replaceSelectorWithHtmlAndUpdatePreview', replaceSelectorWithHtmlAndUpdatePreview);
    registerFunction('tryToEnrichPreview', tryToEnrichPreview);
    registerFunction('enrichPreview', enrichPreview);
    registerFunction('enrichPreviewSectorial', enrichPreviewSectorial);
    registerFunction('filterPreviewHTML', filterPreviewHTML);
    registerFunction('code_needs_hard_refresh', code_needs_hard_refresh);
    registerFunction('sanitize_editable_rich', sanitize_editable_rich);
    registerFunction('getComputedPropertyForClass', getComputedPropertyForClass);
    registerFunction('getClassesMappedArray', getClassesMappedArray);
    registerFunction('getCSSVariablesMappedArray', getCSSVariablesMappedArray);
    registerFunction('processStyleRule', processStyleRule);
    registerFunction('processCSSVariableRule', processCSSVariableRule);
    registerFunction('capitalize', capitalize);
    registerFunction('generateReadableName', generateReadableName);
    registerFunction('lc_parseParams', lc_parseParams);
    registerFunction('lc_get_parameter_value_from_shortcode', lc_get_parameter_value_from_shortcode);
    registerFunction('fixMultipleQuestionMarks', fixMultipleQuestionMarks);
    registerFunction('countOccurrences', countOccurrences);
    registerFunction('cleanTextToSearch', cleanTextToSearch);
    registerFunction('arrayColumn', arrayColumn);
    registerFunction('lcRandomUUID', lcRandomUUID);
    registerFunction('sleep', sleep);
    registerFunction('usingChromeBrowser', usingChromeBrowser);
    registerFunction('determineScrollBarWidth', determineScrollBarWidth);
    registerFunction('getScrollBarWidth', getScrollBarWidth);
    registerFunction('download', download);
    registerFunction('render_dynamic_content', render_dynamic_content);
    registerFunction('render_dynamic_templating_shortcodes_in', render_dynamic_templating_shortcodes_in);
    registerFunction('render_dynamic_partials_in', render_dynamic_partials_in);
    registerFunction('render_shortcode', render_shortcode);
    registerFunction('render_shortcodes_in', render_shortcodes_in);
    registerFunction('put_placeholders_in_lnl_tags_in', put_placeholders_in_lnl_tags_in);
    
    // Also create organized namespace
    window.LCUtils = {
        performance: {
            debounce,
            throttle
        },
        core: {
            CSSelector,
            getLayoutElementType,
            getHtmlElementType,
            getElementTypeInfo
        },
        content: {
            getPageHTML,
            getPageHTMLOuter,
            setPageHTML,
            setPageHTMLOuter,
            getAttributeValue,
            setAttributeValue
        },
        preview: {
            updatePreview,
            updatePreviewSectorial,
            replaceSelectorWithHtmlAndUpdatePreview,
            tryToEnrichPreview,
            enrichPreview,
            enrichPreviewSectorial,
            filterPreviewHTML,
            code_needs_hard_refresh,
            sanitize_editable_rich
        },
        styling: {
            getComputedPropertyForClass,
            getClassesMappedArray,
            getCSSVariablesMappedArray,
            processStyleRule,
            processCSSVariableRule
        }
    };
    
    // Log successful bootstrap
    console.log('LiveCanvas Utils bootstrapped successfully');
}

/**
 * Initialize utilities when DOM is ready, with LiveCanvas compatibility check
 */
function initializeLiveCanvasUtils(): void {
    const initWithDelay = () => {
        // Always wait a bit to let LiveCanvas initialize first
        setTimeout(() => {
            console.log('Element Tools: Initializing utilities with LiveCanvas compatibility...');
            bootstrapLiveCanvasUtils();
        }, 200);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWithDelay);
    } else {
        initWithDelay();
    }
}

export { 
    bootstrapLiveCanvasUtils, 
    initializeLiveCanvasUtils 
};