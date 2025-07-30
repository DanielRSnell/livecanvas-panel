/**
 * String Utility Functions
 * EXACT replicas of LiveCanvas string utility functions
 */

/**
 * Capitalizes the first letter of a string
 * EXACT replica of LiveCanvas capitalize() function
 * 
 * @param s - String to capitalize
 * @returns string - String with first letter capitalized
 */
function capitalize(s: string): string {
    if (!s || typeof s !== 'string') {
        return '';
    }

    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generates random readable names for elements
 * EXACT replica of LiveCanvas generateReadableName() function
 * 
 * @returns string - Random readable name
 */
function generateReadableName(): string {
    const adjectives = [
        'amazing', 'brilliant', 'creative', 'dynamic', 'elegant', 'fantastic',
        'gorgeous', 'incredible', 'magnificent', 'outstanding', 'perfect',
        'remarkable', 'stunning', 'wonderful', 'excellent', 'beautiful',
        'awesome', 'fantastic', 'marvelous', 'spectacular', 'extraordinary'
    ];

    const nouns = [
        'element', 'component', 'section', 'block', 'widget', 'container',
        'layout', 'design', 'feature', 'module', 'panel', 'content',
        'structure', 'framework', 'template', 'style', 'format', 'pattern',
        'system', 'interface', 'display', 'presentation', 'view', 'page'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000) + 1;

    return `${adjective}-${noun}-${number}`;
}

/**
 * Parses URL parameters from a string
 * EXACT replica of LiveCanvas lc_parseParams() function
 * 
 * @param str - URL or query string to parse
 * @returns Record<string, string> - Object with parameter key-value pairs
 */
function lc_parseParams(str: string): Record<string, string> {
    const params: Record<string, string> = {};

    if (!str || typeof str !== 'string') {
        return params;
    }

    try {
        // Remove leading ? if present
        const queryString = str.startsWith('?') ? str.slice(1) : str;
        
        // Split by & and process each parameter
        const pairs = queryString.split('&');
        
        pairs.forEach(pair => {
            if (pair.trim()) {
                const [key, value] = pair.split('=');
                if (key) {
                    params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
                }
            }
        });

        return params;
    } catch (error) {
        console.error('lc_parseParams: Error parsing parameters:', error);
        return params;
    }
}

/**
 * Extracts parameter value from shortcode string
 * EXACT replica of LiveCanvas lc_get_parameter_value_from_shortcode() function
 * 
 * @param paramName - Parameter name to extract
 * @param theShortcode - Shortcode string to parse
 * @returns string - Parameter value or empty string
 */
function lc_get_parameter_value_from_shortcode(paramName: string, theShortcode: string): string {
    if (!paramName || !theShortcode || typeof paramName !== 'string' || typeof theShortcode !== 'string') {
        return '';
    }

    try {
        // Create regex pattern to match the parameter
        // Matches: paramName="value" or paramName='value' or paramName=value
        const regex = new RegExp(`${paramName}\\s*=\\s*["']?([^"'\\s\\]]+)["']?`, 'i');
        const match = theShortcode.match(regex);

        return match && match[1] ? match[1] : '';
    } catch (error) {
        console.error('lc_get_parameter_value_from_shortcode: Error extracting parameter:', error);
        return '';
    }
}

/**
 * Fixes URLs with multiple question marks
 * EXACT replica of LiveCanvas fixMultipleQuestionMarks() function
 * 
 * @param url - URL to fix
 * @returns string - Fixed URL
 */
function fixMultipleQuestionMarks(url: string): string {
    if (!url || typeof url !== 'string') {
        return '';
    }

    try {
        // Find the first question mark
        const firstQuestionMarkIndex = url.indexOf('?');
        
        if (firstQuestionMarkIndex === -1) {
            return url; // No question marks, return as is
        }

        // Split into base URL and query string
        const baseUrl = url.substring(0, firstQuestionMarkIndex);
        const queryString = url.substring(firstQuestionMarkIndex + 1);

        // Replace additional question marks in query string with &
        const fixedQueryString = queryString.replace(/\?/g, '&');

        return `${baseUrl}?${fixedQueryString}`;
    } catch (error) {
        console.error('fixMultipleQuestionMarks: Error fixing URL:', error);
        return url;
    }
}

/**
 * Counts occurrences of needle in haystack
 * EXACT replica of LiveCanvas countOccurrences() function
 * 
 * @param needle - String to search for
 * @param haystack - String to search in
 * @returns number - Number of occurrences
 */
function countOccurrences(needle: string, haystack: string): number {
    if (!needle || !haystack || typeof needle !== 'string' || typeof haystack !== 'string') {
        return 0;
    }

    try {
        let count = 0;
        let position = 0;

        while ((position = haystack.indexOf(needle, position)) !== -1) {
            count++;
            position += needle.length;
        }

        return count;
    } catch (error) {
        console.error('countOccurrences: Error counting occurrences:', error);
        return 0;
    }
}

/**
 * Cleans text for search purposes
 * EXACT replica of LiveCanvas cleanTextToSearch() function
 * 
 * @param str - Text to clean
 * @returns string - Cleaned text suitable for searching
 */
function cleanTextToSearch(str: string): string {
    if (!str || typeof str !== 'string') {
        return '';
    }

    try {
        let cleaned = str;

        // Convert to lowercase for case-insensitive search
        cleaned = cleaned.toLowerCase();

        // Remove HTML tags
        cleaned = cleaned.replace(/<[^>]*>/g, '');

        // Remove extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ');

        // Trim leading/trailing whitespace
        cleaned = cleaned.trim();

        // Remove special characters but keep alphanumeric and spaces
        cleaned = cleaned.replace(/[^a-z0-9\s]/g, '');

        return cleaned;
    } catch (error) {
        console.error('cleanTextToSearch: Error cleaning text:', error);
        return str;
    }
}

/**
 * Extracts column values from array of objects
 * EXACT replica of LiveCanvas arrayColumn() function
 * 
 * @param array - Array of objects
 * @param columnName - Column/property name to extract
 * @returns any[] - Array of extracted values
 */
function arrayColumn(array: any[], columnName: string): any[] {
    if (!Array.isArray(array) || !columnName) {
        return [];
    }

    try {
        return array.map(item => {
            if (item && typeof item === 'object') {
                return item[columnName];
            }
            return undefined;
        }).filter(value => value !== undefined);
    } catch (error) {
        console.error('arrayColumn: Error extracting column:', error);
        return [];
    }
}

/**
 * Generates a random UUID
 * EXACT replica of LiveCanvas lcRandomUUID() function
 * 
 * @returns string - Random UUID
 */
function lcRandomUUID(): string {
    try {
        // Use crypto.randomUUID if available (modern browsers)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        // Fallback implementation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    } catch (error) {
        console.error('lcRandomUUID: Error generating UUID:', error);
        // Final fallback - timestamp-based
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Async sleep function
 * EXACT replica of LiveCanvas sleep() function
 * 
 * @param milliseconds - Number of milliseconds to sleep
 * @returns Promise<void> - Promise that resolves after the specified time
 */
function sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export {
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
};