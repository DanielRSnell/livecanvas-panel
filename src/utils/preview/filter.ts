/**
 * Preview HTML Filtering Functions
 * EXACT replicas of LiveCanvas filterPreviewHTML and related functions
 */

/**
 * Filters HTML content for preview display
 * EXACT replica of LiveCanvas filterPreviewHTML() function
 * 
 * @param input - Raw HTML input to filter
 * @returns string - Filtered HTML suitable for preview
 */
function filterPreviewHTML(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    try {
        let filteredHTML = input;

        // Remove script tags that might interfere with preview
        filteredHTML = filteredHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove dangerous attributes that could break preview
        filteredHTML = filteredHTML.replace(/\s*onload\s*=\s*["'][^"']*["']/gi, '');
        filteredHTML = filteredHTML.replace(/\s*onerror\s*=\s*["'][^"']*["']/gi, '');
        filteredHTML = filteredHTML.replace(/\s*onclick\s*=\s*["'][^"']*["']/gi, '');

        // Fix relative URLs to absolute ones for preview
        filteredHTML = filteredHTML.replace(/src\s*=\s*["'](?!http|\/\/|data:)([^"']+)["']/gi, (match, url) => {
            // Convert relative URLs to absolute based on current site
            const baseUrl = window.location.origin;
            return match.replace(url, baseUrl + (url.startsWith('/') ? url : '/' + url));
        });

        // Fix relative href URLs
        filteredHTML = filteredHTML.replace(/href\s*=\s*["'](?!http|\/\/|#|mailto:|tel:)([^"']+)["']/gi, (match, url) => {
            const baseUrl = window.location.origin;
            return match.replace(url, baseUrl + (url.startsWith('/') ? url : '/' + url));
        });

        // Remove any editor-specific classes or attributes
        filteredHTML = filteredHTML.replace(/\s*data-lc-[^=]*=["'][^"']*["']/gi, '');
        filteredHTML = filteredHTML.replace(/\s*class\s*=\s*["']([^"']*\s*)?lc-editor[^"']*["']/gi, (match, prefix) => {
            return prefix ? ` class="${prefix.trim()}"` : '';
        });

        // Ensure proper DOCTYPE if missing
        if (!filteredHTML.includes('<!DOCTYPE')) {
            filteredHTML = '<!DOCTYPE html>' + filteredHTML;
        }

        // Ensure proper html structure
        if (!filteredHTML.includes('<html')) {
            filteredHTML = filteredHTML.replace(/^(<!DOCTYPE[^>]*>)?/, '$1<html>');
            filteredHTML += '</html>';
        }

        // Add meta viewport if missing
        if (!filteredHTML.includes('viewport')) {
            filteredHTML = filteredHTML.replace(
                /<head[^>]*>/i, 
                '$&<meta name="viewport" content="width=device-width, initial-scale=1">'
            );
        }

        return filteredHTML;
    } catch (error) {
        console.error('filterPreviewHTML: Error filtering HTML:', error);
        return input; // Return original if filtering fails
    }
}

/**
 * Determines if code changes require a hard refresh of the preview
 * EXACT replica of LiveCanvas code_needs_hard_refresh() function
 * 
 * @param newHtml - New HTML content to analyze
 * @returns boolean - True if hard refresh is needed
 */
function code_needs_hard_refresh(newHtml: string): boolean {
    if (!newHtml || typeof newHtml !== 'string') {
        return false;
    }

    try {
        // Check for script tag changes
        if (newHtml.includes('<script') || newHtml.includes('</script>')) {
            return true;
        }

        // Check for style tag changes
        if (newHtml.includes('<style') || newHtml.includes('</style>')) {
            return true;
        }

        // Check for link tag changes (stylesheets)
        if (newHtml.includes('<link') && newHtml.includes('stylesheet')) {
            return true;
        }

        // Check for meta tag changes
        if (newHtml.includes('<meta')) {
            return true;
        }

        // Check for head section changes
        if (newHtml.includes('<head') || newHtml.includes('</head>')) {
            return true;
        }

        // Check for body attribute changes
        if (newHtml.match(/<body[^>]+>/)) {
            return true;
        }

        // Check for html attribute changes
        if (newHtml.match(/<html[^>]+>/)) {
            return true;
        }

        // Check for iframe or embed changes
        if (newHtml.includes('<iframe') || newHtml.includes('<embed') || newHtml.includes('<object')) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('code_needs_hard_refresh: Error analyzing HTML:', error);
        return true; // Default to hard refresh if analysis fails
    }
}

/**
 * Sanitizes editable rich content for preview
 * EXACT replica of LiveCanvas sanitize_editable_rich() function
 * 
 * @param input - Rich content input to sanitize
 * @returns string - Sanitized content
 */
function sanitize_editable_rich(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    try {
        let sanitized = input;

        // Remove dangerous script tags
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove dangerous event handlers
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

        // Remove javascript: links
        sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');

        // Remove dangerous attributes
        sanitized = sanitized.replace(/\s*contenteditable\s*=\s*["'][^"']*["']/gi, '');

        // Clean up excessive whitespace
        sanitized = sanitized.replace(/\s+/g, ' ');
        sanitized = sanitized.replace(/>\s+</g, '><');

        // Remove empty attributes
        sanitized = sanitized.replace(/\s+[a-zA-Z-]+\s*=\s*["']\s*["']/g, '');

        return sanitized.trim();
    } catch (error) {
        console.error('sanitize_editable_rich: Error sanitizing content:', error);
        return input; // Return original if sanitization fails
    }
}

export { 
    filterPreviewHTML, 
    code_needs_hard_refresh, 
    sanitize_editable_rich 
};