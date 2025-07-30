/**
 * Element Type Detection Functions
 * EXACT replicas of LiveCanvas element type detection functions
 */

/**
 * Gets the iframe document for element detection
 * @returns Document | null
 */
function getPreviewDocument(): Document | null {
    const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
    return iframe && iframe.contentDocument ? iframe.contentDocument : null;
}

/**
 * Determines the layout element type for a given selector
 * EXACT replica of LiveCanvas getLayoutElementType() function
 * 
 * @param theSelector - CSS selector for the element
 * @returns string - Layout element type
 */
function getLayoutElementType(theSelector: string): string {
    if (!theSelector) {
        return 'unknown';
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('getLayoutElementType: Preview document not available');
            return 'unknown';
        }

        const element = previewDoc.querySelector(theSelector) as HTMLElement;
        if (!element) {
            console.warn(`getLayoutElementType: Element not found: ${theSelector}`);
            return 'unknown';
        }

        // Check for data attributes that indicate layout element type
        const layoutType = element.getAttribute('data-lc-layout-type');
        if (layoutType) {
            return layoutType;
        }

        // Check for specific classes that indicate layout elements
        const classList = element.classList;
        
        // Container types
        if (classList.contains('lc-container') || classList.contains('container')) {
            return 'container';
        }
        if (classList.contains('lc-row') || classList.contains('row')) {
            return 'row';
        }
        if (classList.contains('lc-column') || classList.contains('col') || element.className.includes('col-')) {
            return 'column';
        }
        
        // Section types
        if (classList.contains('lc-section') || element.tagName.toLowerCase() === 'section') {
            return 'section';
        }
        if (classList.contains('lc-header') || element.tagName.toLowerCase() === 'header') {
            return 'header';
        }
        if (classList.contains('lc-footer') || element.tagName.toLowerCase() === 'footer') {
            return 'footer';
        }
        
        // Navigation types
        if (classList.contains('lc-nav') || element.tagName.toLowerCase() === 'nav') {
            return 'navigation';
        }
        
        // Content types
        if (classList.contains('lc-sidebar') || classList.contains('sidebar')) {
            return 'sidebar';
        }
        if (classList.contains('lc-main') || element.tagName.toLowerCase() === 'main') {
            return 'main';
        }
        if (classList.contains('lc-article') || element.tagName.toLowerCase() === 'article') {
            return 'article';
        }
        
        // Widget/component types
        if (classList.contains('lc-widget') || classList.contains('widget')) {
            return 'widget';
        }
        if (classList.contains('lc-block') || classList.contains('block')) {
            return 'block';
        }
        
        // Form types
        if (element.tagName.toLowerCase() === 'form' || classList.contains('lc-form')) {
            return 'form';
        }
        
        // Media types
        if (classList.contains('lc-gallery') || classList.contains('gallery')) {
            return 'gallery';
        }
        if (classList.contains('lc-slider') || classList.contains('slider')) {
            return 'slider';
        }
        
        // Default based on tag name
        const tagName = element.tagName.toLowerCase();
        switch (tagName) {
            case 'div':
                return 'div';
            case 'span':
                return 'span';
            case 'p':
                return 'paragraph';
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                return 'heading';
            case 'img':
                return 'image';
            case 'a':
                return 'link';
            case 'ul':
            case 'ol':
                return 'list';
            case 'li':
                return 'list-item';
            case 'table':
                return 'table';
            case 'tr':
                return 'table-row';
            case 'td':
            case 'th':
                return 'table-cell';
            default:
                return tagName;
        }
    } catch (error) {
        console.error('getLayoutElementType: Error detecting layout element type:', error);
        return 'unknown';
    }
}

/**
 * Determines the HTML element type for a given selector
 * EXACT replica of LiveCanvas getHtmlElementType() function
 * 
 * @param theSelector - CSS selector for the element
 * @returns string - HTML element type
 */
function getHtmlElementType(theSelector: string): string {
    if (!theSelector) {
        return 'unknown';
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('getHtmlElementType: Preview document not available');
            return 'unknown';
        }

        const element = previewDoc.querySelector(theSelector) as HTMLElement;
        if (!element) {
            console.warn(`getHtmlElementType: Element not found: ${theSelector}`);
            return 'unknown';
        }

        const tagName = element.tagName.toLowerCase();
        
        // Return the exact HTML tag name
        return tagName;
    } catch (error) {
        console.error('getHtmlElementType: Error detecting HTML element type:', error);
        return 'unknown';
    }
}

/**
 * Gets detailed element information including both layout and HTML type
 * Extended function for comprehensive element analysis
 * 
 * @param theSelector - CSS selector for the element
 * @returns object - Complete element type information
 */
function getElementTypeInfo(theSelector: string): {
    htmlType: string;
    layoutType: string;
    tagName: string;
    classList: string[];
    attributes: Record<string, string>;
} {
    const defaultInfo = {
        htmlType: 'unknown',
        layoutType: 'unknown',
        tagName: 'unknown',
        classList: [],
        attributes: {}
    };

    if (!theSelector) {
        return defaultInfo;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            return defaultInfo;
        }

        const element = previewDoc.querySelector(theSelector) as HTMLElement;
        if (!element) {
            return defaultInfo;
        }

        // Get all attributes
        const attributes: Record<string, string> = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attributes[attr.name] = attr.value;
        }

        return {
            htmlType: getHtmlElementType(theSelector),
            layoutType: getLayoutElementType(theSelector),
            tagName: element.tagName.toLowerCase(),
            classList: Array.from(element.classList),
            attributes
        };
    } catch (error) {
        console.error('getElementTypeInfo: Error getting element type info:', error);
        return defaultInfo;
    }
}

export { 
    getLayoutElementType, 
    getHtmlElementType, 
    getElementTypeInfo 
};