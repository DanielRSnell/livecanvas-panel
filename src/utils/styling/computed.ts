/**
 * CSS Computed Properties Functions
 * EXACT replicas of LiveCanvas CSS computation functions
 */

/**
 * Gets the preview iframe document
 * @returns Document | null
 */
function getPreviewDocument(): Document | null {
    const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
    return iframe && iframe.contentDocument ? iframe.contentDocument : null;
}

/**
 * Gets computed CSS property value for a specific class
 * EXACT replica of LiveCanvas getComputedPropertyForClass() function
 * 
 * @param className - CSS class name to check
 * @param cssProperty - CSS property to get computed value for
 * @returns string - Computed property value
 */
function getComputedPropertyForClass(className: string, cssProperty: string): string {
    if (!className || !cssProperty) {
        return '';
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('getComputedPropertyForClass: Preview document not available');
            return '';
        }

        // Create a temporary element with the class
        const tempElement = previewDoc.createElement('div');
        tempElement.className = className;
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.pointerEvents = 'none';
        
        // Append to body to get computed styles
        previewDoc.body.appendChild(tempElement);
        
        // Get computed style
        const computedStyle = previewDoc.defaultView?.getComputedStyle(tempElement);
        const propertyValue = computedStyle ? computedStyle.getPropertyValue(cssProperty) : '';
        
        // Clean up
        previewDoc.body.removeChild(tempElement);
        
        return propertyValue;
    } catch (error) {
        console.error('getComputedPropertyForClass: Error getting computed property:', error);
        return '';
    }
}

/**
 * Gets all computed styles for a specific selector
 * Extended function for comprehensive style analysis
 * 
 * @param selector - CSS selector for the element
 * @returns CSSStyleDeclaration | null - All computed styles
 */
function getComputedStylesForSelector(selector: string): CSSStyleDeclaration | null {
    if (!selector) {
        return null;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('getComputedStylesForSelector: Preview document not available');
            return null;
        }

        const element = previewDoc.querySelector(selector) as HTMLElement;
        if (!element) {
            console.warn(`getComputedStylesForSelector: Element not found: ${selector}`);
            return null;
        }

        return previewDoc.defaultView?.getComputedStyle(element) || null;
    } catch (error) {
        console.error('getComputedStylesForSelector: Error getting computed styles:', error);
        return null;
    }
}

/**
 * Gets specific computed property value for a selector
 * Helper function for getting single property values
 * 
 * @param selector - CSS selector for the element
 * @param property - CSS property name
 * @returns string - Computed property value
 */
function getComputedPropertyForSelector(selector: string, property: string): string {
    const computedStyles = getComputedStylesForSelector(selector);
    return computedStyles ? computedStyles.getPropertyValue(property) : '';
}

/**
 * Gets multiple computed properties for a selector
 * Efficient way to get multiple properties at once
 * 
 * @param selector - CSS selector for the element
 * @param properties - Array of CSS property names
 * @returns Record<string, string> - Object with property names as keys and values
 */
function getComputedPropertiesForSelector(
    selector: string, 
    properties: string[]
): Record<string, string> {
    const result: Record<string, string> = {};
    
    if (!properties || properties.length === 0) {
        return result;
    }

    const computedStyles = getComputedStylesForSelector(selector);
    if (!computedStyles) {
        return result;
    }

    properties.forEach(property => {
        result[property] = computedStyles.getPropertyValue(property);
    });

    return result;
}

/**
 * Gets all CSS custom properties (variables) for a selector
 * Gets all --custom-property values
 * 
 * @param selector - CSS selector for the element
 * @returns Record<string, string> - Object with custom property names and values
 */
function getCustomPropertiesForSelector(selector: string): Record<string, string> {
    const customProps: Record<string, string> = {};
    
    try {
        const computedStyles = getComputedStylesForSelector(selector);
        if (!computedStyles) {
            return customProps;
        }

        // Iterate through all style properties to find custom properties
        for (let i = 0; i < computedStyles.length; i++) {
            const propertyName = computedStyles[i];
            if (propertyName.startsWith('--')) {
                customProps[propertyName] = computedStyles.getPropertyValue(propertyName);
            }
        }

        return customProps;
    } catch (error) {
        console.error('getCustomPropertiesForSelector: Error getting custom properties:', error);
        return customProps;
    }
}

export { 
    getComputedPropertyForClass,
    getComputedStylesForSelector,
    getComputedPropertyForSelector,
    getComputedPropertiesForSelector,
    getCustomPropertiesForSelector
};