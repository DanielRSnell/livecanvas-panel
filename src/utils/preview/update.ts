/**
 * Preview Update Functions
 * EXACT replicas of LiveCanvas updatePreview functions for full compatibility
 */

/**
 * Gets the preview iframe document
 * @returns HTMLDocument | null
 */
function getPreviewDocument(): Document | null {
    const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
    return iframe && iframe.contentDocument ? iframe.contentDocument : null;
}

/**
 * Gets the main store from window (LiveCanvas compatibility)
 * @returns any
 */
function getMainStore(): any {
    return (window as any).lcMainStore || null;
}

/**
 * Updates the main preview - reloads the entire preview iframe
 * EXACT replica of LiveCanvas updatePreview() function
 */
function updatePreview(): void {
    const previewDoc = getPreviewDocument();
    if (!previewDoc) {
        console.warn('updatePreview: Preview iframe document not available');
        return;
    }

    const store = getMainStore();
    if (!store) {
        console.warn('updatePreview: lcMainStore not available');
        return;
    }

    try {
        // Get current HTML from store or reconstruct from iframe
        const currentHTML = store.html || previewDoc.documentElement.outerHTML;
        
        // Filter HTML for preview (if filterPreviewHTML is available)
        const filteredHTML = typeof (window as any).filterPreviewHTML === 'function' 
            ? (window as any).filterPreviewHTML(currentHTML)
            : currentHTML;

        // Write filtered HTML to preview iframe
        previewDoc.open();
        previewDoc.write(filteredHTML);
        previewDoc.close();

        // Trigger any post-update processing
        if (typeof (window as any).tryToEnrichPreview === 'function') {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                (window as any).tryToEnrichPreview();
            }, 100);
        }

        console.log('updatePreview: Preview updated successfully');
    } catch (error) {
        console.error('updatePreview: Error updating preview:', error);
    }
}

/**
 * Updates a specific section of the preview by selector
 * EXACT replica of LiveCanvas updatePreviewSectorial() function
 * 
 * @param selector - CSS selector for the element to update
 */
function updatePreviewSectorial(selector: string): void {
    if (!selector) {
        console.warn('updatePreviewSectorial: No selector provided');
        return;
    }

    const previewDoc = getPreviewDocument();
    if (!previewDoc) {
        console.warn('updatePreviewSectorial: Preview iframe document not available');
        return;
    }

    const store = getMainStore();
    if (!store) {
        console.warn('updatePreviewSectorial: lcMainStore not available');
        return;
    }

    try {
        // Find the target element in preview
        const targetElement = previewDoc.querySelector(selector);
        if (!targetElement) {
            console.warn(`updatePreviewSectorial: Element not found: ${selector}`);
            return;
        }

        // Get updated HTML from store
        if (store.html) {
            // Parse store HTML to find the corresponding element
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = store.html;
            
            const sourceElement = tempDiv.querySelector(selector);
            if (sourceElement) {
                // Replace target element with source element
                targetElement.outerHTML = sourceElement.outerHTML;
                
                // Trigger sectorial enrichment if available
                if (typeof (window as any).enrichPreviewSectorial === 'function') {
                    setTimeout(() => {
                        (window as any).enrichPreviewSectorial(selector);
                    }, 50);
                }
                
                console.log(`updatePreviewSectorial: Updated ${selector} successfully`);
            } else {
                console.warn(`updatePreviewSectorial: Source element not found in store: ${selector}`);
            }
        } else {
            console.warn('updatePreviewSectorial: No HTML available in store');
        }
    } catch (error) {
        console.error('updatePreviewSectorial: Error updating sectorial preview:', error);
    }
}

/**
 * Replaces selector with HTML and updates preview
 * Combination function that mirrors LiveCanvas behavior
 * 
 * @param selector - CSS selector for target element
 * @param newHtml - New HTML content to replace with
 */
function replaceSelectorWithHtmlAndUpdatePreview(selector: string, newHtml: string): void {
    if (!selector || typeof newHtml !== 'string') {
        console.warn('replaceSelectorWithHtmlAndUpdatePreview: Invalid parameters');
        return;
    }

    try {
        // First update the content using setPageHTML if available
        if (typeof (window as any).setPageHTML === 'function') {
            (window as any).setPageHTML(selector, newHtml);
        }

        // Then update the preview sectorial
        updatePreviewSectorial(selector);
        
        console.log(`replaceSelectorWithHtmlAndUpdatePreview: Updated ${selector} with new HTML`);
    } catch (error) {
        console.error('replaceSelectorWithHtmlAndUpdatePreview: Error:', error);
    }
}

export { 
    updatePreview, 
    updatePreviewSectorial, 
    replaceSelectorWithHtmlAndUpdatePreview,
    getPreviewDocument,
    getMainStore
};