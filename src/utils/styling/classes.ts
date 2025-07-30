/**
 * CSS Classes Mapping Functions
 * EXACT replicas of LiveCanvas CSS classes mapping functions
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
 * Interface for CSS class information
 */
interface CSSClassInfo {
    className: string;
    selector: string;
    sheetName: string;
    rules: string[];
    properties: Record<string, string>;
}

/**
 * Interface for CSS variable information
 */
interface CSSVariableInfo {
    variableName: string;
    value: string;
    sheetName: string;
    selector: string;
}

/**
 * Gets all CSS classes mapped with their rules and properties
 * EXACT replica of LiveCanvas getClassesMappedArray() function
 * 
 * @returns CSSClassInfo[] - Array of CSS class information
 */
function getClassesMappedArray(): CSSClassInfo[] {
    const classesMap: CSSClassInfo[] = [];

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('getClassesMappedArray: Preview document not available');
            return classesMap;
        }

        // Get all stylesheets from the preview document
        const styleSheets = previewDoc.styleSheets;

        for (let i = 0; i < styleSheets.length; i++) {
            const styleSheet = styleSheets[i];
            const sheetName = styleSheet.href ? 
                styleSheet.href.split('/').pop() || `stylesheet-${i}` : 
                `inline-${i}`;

            try {
                // Access CSS rules (may fail due to CORS)
                const cssRules = styleSheet.cssRules || styleSheet.rules;
                
                if (cssRules) {
                    for (let j = 0; j < cssRules.length; j++) {
                        const rule = cssRules[j] as CSSStyleRule;
                        
                        if (rule.type === CSSRule.STYLE_RULE) {
                            processStyleRule(rule, classesMap, sheetName);
                        }
                    }
                }
            } catch (corsError) {
                console.warn(`getClassesMappedArray: Cannot access stylesheet ${sheetName} due to CORS restrictions`);
            }
        }

        return classesMap;
    } catch (error) {
        console.error('getClassesMappedArray: Error mapping CSS classes:', error);
        return classesMap;
    }
}

/**
 * Processes a CSS style rule and extracts class information
 * EXACT replica of LiveCanvas processStyleRule() function
 * 
 * @param rule - CSS style rule to process
 * @param classesMap - Array to add class information to
 * @param sheetName - Name of the stylesheet
 */
function processStyleRule(rule: CSSStyleRule, classesMap: CSSClassInfo[], sheetName: string): void {
    try {
        const selector = rule.selectorText;
        const cssText = rule.cssText;
        
        // Extract class names from selector
        const classMatches = selector.match(/\.([a-zA-Z0-9_-]+)/g);
        
        if (classMatches) {
            classMatches.forEach(match => {
                const className = match.substring(1); // Remove the dot
                
                // Extract CSS properties from the rule
                const properties: Record<string, string> = {};
                const style = rule.style;
                
                for (let k = 0; k < style.length; k++) {
                    const propertyName = style[k];
                    const propertyValue = style.getPropertyValue(propertyName);
                    properties[propertyName] = propertyValue;
                }
                
                // Extract individual rules as strings
                const rules = cssText.split('{')[1]?.replace('}', '').split(';')
                    .map(rule => rule.trim())
                    .filter(rule => rule.length > 0) || [];
                
                // Check if this class already exists in our map
                const existingClass = classesMap.find(cls => 
                    cls.className === className && cls.selector === selector
                );
                
                if (existingClass) {
                    // Merge properties and rules
                    existingClass.rules = [...existingClass.rules, ...rules];
                    existingClass.properties = { ...existingClass.properties, ...properties };
                } else {
                    // Add new class information
                    classesMap.push({
                        className,
                        selector,
                        sheetName,
                        rules,
                        properties
                    });
                }
            });
        }
    } catch (error) {
        console.error('processStyleRule: Error processing style rule:', error);
    }
}

/**
 * Gets all CSS variables (custom properties) mapped with their values
 * EXACT replica of LiveCanvas getCSSVariablesMappedArray() function
 * 
 * @returns CSSVariableInfo[] - Array of CSS variable information
 */
function getCSSVariablesMappedArray(): CSSVariableInfo[] {
    const variablesMap: CSSVariableInfo[] = [];

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('getCSSVariablesMappedArray: Preview document not available');
            return variablesMap;
        }

        // Get all stylesheets from the preview document
        const styleSheets = previewDoc.styleSheets;

        for (let i = 0; i < styleSheets.length; i++) {
            const styleSheet = styleSheets[i];
            const sheetName = styleSheet.href ? 
                styleSheet.href.split('/').pop() || `stylesheet-${i}` : 
                `inline-${i}`;

            try {
                // Access CSS rules (may fail due to CORS)
                const cssRules = styleSheet.cssRules || styleSheet.rules;
                
                if (cssRules) {
                    for (let j = 0; j < cssRules.length; j++) {
                        const rule = cssRules[j] as CSSStyleRule;
                        
                        if (rule.type === CSSRule.STYLE_RULE) {
                            processCSSVariableRule(rule, variablesMap, sheetName);
                        }
                    }
                }
            } catch (corsError) {
                console.warn(`getCSSVariablesMappedArray: Cannot access stylesheet ${sheetName} due to CORS restrictions`);
            }
        }

        return variablesMap;
    } catch (error) {
        console.error('getCSSVariablesMappedArray: Error mapping CSS variables:', error);
        return variablesMap;
    }
}

/**
 * Processes a CSS rule to extract CSS variable information
 * EXACT replica of LiveCanvas processCSSVariableRule() function
 * 
 * @param rule - CSS style rule to process
 * @param variablesMap - Array to add variable information to
 * @param sheetName - Name of the stylesheet
 */
function processCSSVariableRule(rule: CSSStyleRule, variablesMap: CSSVariableInfo[], sheetName: string): void {
    try {
        const selector = rule.selectorText;
        const style = rule.style;
        
        // Look for CSS custom properties (variables)
        for (let k = 0; k < style.length; k++) {
            const propertyName = style[k];
            
            if (propertyName.startsWith('--')) {
                const propertyValue = style.getPropertyValue(propertyName);
                
                // Check if this variable already exists
                const existingVariable = variablesMap.find(variable => 
                    variable.variableName === propertyName && 
                    variable.selector === selector
                );
                
                if (!existingVariable) {
                    variablesMap.push({
                        variableName: propertyName,
                        value: propertyValue,
                        sheetName,
                        selector
                    });
                }
            }
        }
    } catch (error) {
        console.error('processCSSVariableRule: Error processing CSS variable rule:', error);
    }
}

/**
 * Gets classes for a specific element by selector
 * Helper function to get classes applied to a specific element
 * 
 * @param selector - CSS selector for the element
 * @returns string[] - Array of class names applied to the element
 */
function getClassesForSelector(selector: string): string[] {
    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            return [];
        }

        const element = previewDoc.querySelector(selector) as HTMLElement;
        if (!element) {
            return [];
        }

        return Array.from(element.classList);
    } catch (error) {
        console.error('getClassesForSelector: Error getting classes for selector:', error);
        return [];
    }
}

export { 
    getClassesMappedArray,
    getCSSVariablesMappedArray,
    processStyleRule,
    processCSSVariableRule,
    getClassesForSelector,
    type CSSClassInfo,
    type CSSVariableInfo
};