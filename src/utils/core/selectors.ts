/**
 * CSS Selector utilities - EXACT replicas of LiveCanvas functions
 */

/**
 * CSSelector - EXACT replica of LiveCanvas CSSelector function
 * Generates a CSS selector path for an element, stopping at #lc-main
 * 
 * @param el - The HTML element to generate selector for
 * @returns CSS selector string or false if element is invalid
 */
function CSSelector(el: HTMLElement | null): string | false {
    const names: string[] = [];
    if (!el) return false;
    
    while (el.parentNode) {
        if (el.nodeName === "MAIN" && el.id === "lc-main") {
            names.unshift(el.nodeName + '#' + el.id);
            break;
        } else {
            if (el === el.ownerDocument!.documentElement || el === el.ownerDocument!.body) {
                names.unshift(el.tagName);
            } else {
                let c = 1;
                let e = el;
                while (e.previousElementSibling) {
                    e = e.previousElementSibling as HTMLElement;
                    c++;
                }
                names.unshift(el.tagName + ':nth-child(' + c + ')');
            }
            el = el.parentNode as HTMLElement;
        }
    }
    return names.join(' > ');
}

export { CSSelector };