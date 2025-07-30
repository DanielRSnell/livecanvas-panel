/**
 * Performance utilities - Debounce and Throttle
 * Exact replicas of LiveCanvas functions for compatibility
 */

/**
 * Debounce utility - EXACT replica of LiveCanvas debounce function
 * Delays function execution until after wait milliseconds have elapsed since the last time it was invoked
 */
function debounce(func: Function, wait: number, immediate?: boolean) {
    let timeout: NodeJS.Timeout | null;
    return function(this: any) {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Throttle utility - EXACT replica of LiveCanvas throttle function
 * Limits the rate at which a function can fire
 * Source: https://gist.github.com/ionurboz/51b505ee3281cd713747b4a84d69f434
 */
function throttle(fn: Function, threshhold?: number, scope?: any) {
    threshhold || (threshhold = 250);
    let last: number;
    let deferTimer: NodeJS.Timeout;
    
    return function(this: any) {
        const context = scope || this;
        const now = +new Date();
        const args = arguments;
        
        if (last && now < last + threshhold!) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function() {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

export { debounce, throttle };