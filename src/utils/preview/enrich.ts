/**
 * Preview Enrichment Functions
 * EXACT replicas of LiveCanvas preview enrichment functions
 */

import { debounce } from '../performance';

/**
 * Enriches the preview with dynamic content processing
 * EXACT replica of LiveCanvas tryToEnrichPreview() function
 */
function tryToEnrichPreview(): void {
    try {
        // Check if preview document is available
        const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
        const previewDoc = iframe && iframe.contentDocument ? iframe.contentDocument : null;
        
        if (!previewDoc) {
            console.warn('tryToEnrichPreview: Preview document not available');
            return;
        }

        // Process dynamic content if functions are available
        if (typeof (window as any).render_dynamic_content === 'function') {
            (window as any).render_dynamic_content('body');
        }

        // Process shortcodes if functions are available
        if (typeof (window as any).render_shortcodes_in === 'function') {
            (window as any).render_shortcodes_in('body');
        }

        // Process dynamic templating shortcodes
        if (typeof (window as any).render_dynamic_templating_shortcodes_in === 'function') {
            (window as any).render_dynamic_templating_shortcodes_in('body');
        }

        // Process dynamic partials
        if (typeof (window as any).render_dynamic_partials_in === 'function') {
            (window as any).render_dynamic_partials_in('body');
        }

        // Add placeholders for special tags
        if (typeof (window as any).put_placeholders_in_lnl_tags_in === 'function') {
            (window as any).put_placeholders_in_lnl_tags_in('body');
        }

        // Initialize lazy loading if needed
        if (typeof (window as any).initLazyPreviewObserver === 'function') {
            (window as any).initLazyPreviewObserver('body');
        }

        // Sanitize container images
        if (typeof (window as any).sanitizeContainerImages === 'function') {
            (window as any).sanitizeContainerImages(previewDoc.body);
        }

        console.log('tryToEnrichPreview: Preview enrichment completed');
    } catch (error) {
        console.error('tryToEnrichPreview: Error during enrichment:', error);
    }
}

/**
 * Debounced version of preview enrichment
 * EXACT replica of LiveCanvas enrichPreview() function
 */
const enrichPreview = debounce(tryToEnrichPreview, 300);

/**
 * Enriches a specific section of the preview
 * EXACT replica of LiveCanvas enrichPreviewSectorial() function
 * 
 * @param selector - CSS selector for the section to enrich
 */
function enrichPreviewSectorial(selector: string): void {
    if (!selector) {
        console.warn('enrichPreviewSectorial: No selector provided');
        return;
    }

    try {
        // Check if preview document is available
        const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
        const previewDoc = iframe && iframe.contentDocument ? iframe.contentDocument : null;
        
        if (!previewDoc) {
            console.warn('enrichPreviewSectorial: Preview document not available');
            return;
        }

        // Verify target element exists
        const targetElement = previewDoc.querySelector(selector);
        if (!targetElement) {
            console.warn(`enrichPreviewSectorial: Element not found: ${selector}`);
            return;
        }

        // Process dynamic content in the specific section
        if (typeof (window as any).render_dynamic_content === 'function') {
            (window as any).render_dynamic_content(selector);
        }

        // Process shortcodes in the specific section
        if (typeof (window as any).render_shortcodes_in === 'function') {
            (window as any).render_shortcodes_in(selector);
        }

        // Process dynamic templating shortcodes in section
        if (typeof (window as any).render_dynamic_templating_shortcodes_in === 'function') {
            (window as any).render_dynamic_templating_shortcodes_in(selector);
        }

        // Process dynamic partials in section
        if (typeof (window as any).render_dynamic_partials_in === 'function') {
            (window as any).render_dynamic_partials_in(selector);
        }

        // Add placeholders for special tags in section
        if (typeof (window as any).put_placeholders_in_lnl_tags_in === 'function') {
            (window as any).put_placeholders_in_lnl_tags_in(selector);
        }

        // Initialize lazy loading for section
        if (typeof (window as any).initLazyPreviewObserver === 'function') {
            (window as any).initLazyPreviewObserver(selector);
        }

        // Sanitize images in section
        if (typeof (window as any).sanitizeContainerImages === 'function') {
            (window as any).sanitizeContainerImages(targetElement);
        }

        console.log(`enrichPreviewSectorial: Section ${selector} enriched successfully`);
    } catch (error) {
        console.error('enrichPreviewSectorial: Error during sectorial enrichment:', error);
    }
}

export { 
    tryToEnrichPreview, 
    enrichPreview, 
    enrichPreviewSectorial 
};