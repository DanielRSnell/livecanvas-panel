/**
 * HTML Content Management - EXACT replicas of LiveCanvas functions
 * These functions work with the global `doc` variable from lcMainStore
 */

/**
 * Get the iframe document - matches LiveCanvas pattern
 * @returns Document from previewiframe or null
 */
function getIframeDocument(): Document | null {
    const previewiframe = document.getElementById('previewiframe') as HTMLIFrameElement;
    if (!previewiframe || !previewiframe.contentDocument) {
        return null;
    }
    return previewiframe.contentDocument;
}

/**
 * Get the working document - prioritizes lcMainStore.doc, falls back to iframe
 * @returns Document to work with
 */
function getWorkingDocument(): Document | null {
    // Try to get doc from lcMainStore (LiveCanvas pattern)
    if (typeof window !== 'undefined' && (window as any).lcMainStore && (window as any).lcMainStore.doc) {
        return (window as any).lcMainStore.doc;
    }
    // Fallback to iframe document
    return getIframeDocument();
}

/**
 * getPageHTML - EXACT replica of LiveCanvas function
 * Gets the innerHTML of the specified selector
 * 
 * @param selector - CSS selector, defaults to "html"
 * @returns HTML content as string
 */
function getPageHTML(selector?: string): string {
    if (selector === undefined) selector = "html";
    
    const doc = getWorkingDocument();
    if (!doc) {
        console.log("Document not available");
        return "";
    }
    
    const element = doc.querySelector(selector);
    if (!element) {
        console.log(selector + " could not be found");
        return "";
    }
    
    return element.innerHTML;
}

/**
 * getPageHTMLOuter - EXACT replica of LiveCanvas function
 * Gets the outerHTML of the specified selector
 * 
 * @param selector - CSS selector, defaults to "html"
 * @returns Outer HTML content as string
 */
function getPageHTMLOuter(selector?: string): string {
    if (selector === undefined) selector = "html";
    
    const doc = getWorkingDocument();
    if (!doc) {
        console.log("Document not available");
        return "";
    }
    
    const element = doc.querySelector(selector);
    if (!element) {
        console.log(selector + " could not be found");
        return "";
    }
    
    return element.outerHTML;
}

/**
 * setPageHTML - EXACT replica of LiveCanvas function
 * Sets the innerHTML of the specified selector
 * 
 * @param selector - CSS selector
 * @param newValue - New HTML content
 */
function setPageHTML(selector: string, newValue: string): void {
    const doc = getWorkingDocument();
    if (!doc) {
        console.log("Document not available");
        return;
    }
    
    const element = doc.querySelector(selector);
    if (element) {
        element.innerHTML = newValue;
    }
}

/**
 * setPageHTMLOuter - EXACT replica of LiveCanvas function
 * Sets the outerHTML of the specified selector
 * 
 * @param selector - CSS selector
 * @param newValue - New outer HTML content
 */
function setPageHTMLOuter(selector: string, newValue: string): void {
    const doc = getWorkingDocument();
    if (!doc) {
        console.log("Document not available");
        return;
    }
    
    const element = doc.querySelector(selector);
    if (element) {
        element.outerHTML = newValue;
    }
}

export {
    getPageHTML,
    getPageHTMLOuter,
    setPageHTML,
    setPageHTMLOuter,
    getWorkingDocument,
    getIframeDocument
};