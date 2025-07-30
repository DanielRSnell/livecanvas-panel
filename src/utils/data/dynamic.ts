/**
 * Dynamic Content Processing Functions
 * EXACT replicas of LiveCanvas dynamic content processing functions
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
 * Renders dynamic content in a specific selector
 * EXACT replica of LiveCanvas render_dynamic_content() function
 * 
 * @param selector - CSS selector for the container to process
 */
function render_dynamic_content(selector: string): void {
    if (!selector) {
        console.warn('render_dynamic_content: No selector provided');
        return;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('render_dynamic_content: Preview document not available');
            return;
        }

        const container = previewDoc.querySelector(selector);
        if (!container) {
            console.warn(`render_dynamic_content: Container not found: ${selector}`);
            return;
        }

        // Process dynamic content placeholders
        const dynamicElements = container.querySelectorAll('[data-lc-dynamic]');
        
        dynamicElements.forEach((element: Element) => {
            const dynamicType = element.getAttribute('data-lc-dynamic');
            const dynamicValue = element.getAttribute('data-lc-dynamic-value');
            
            if (dynamicType && dynamicValue) {
                processDynamicElement(element as HTMLElement, dynamicType, dynamicValue);
            }
        });

        // Process template variables
        processTemplateVariables(container);

        console.log(`render_dynamic_content: Processed dynamic content in ${selector}`);
    } catch (error) {
        console.error('render_dynamic_content: Error processing dynamic content:', error);
    }
}

/**
 * Processes a single dynamic element
 * @param element - HTML element to process
 * @param type - Type of dynamic content
 * @param value - Dynamic content configuration
 */
function processDynamicElement(element: HTMLElement, type: string, value: string): void {
    try {
        switch (type) {
            case 'text':
                processDynamicText(element, value);
                break;
            case 'image':
                processDynamicImage(element, value);
                break;
            case 'link':
                processDynamicLink(element, value);
                break;
            case 'list':
                processDynamicList(element, value);
                break;
            default:
                console.warn(`processDynamicElement: Unknown dynamic type: ${type}`);
        }
    } catch (error) {
        console.error('processDynamicElement: Error processing dynamic element:', error);
    }
}

/**
 * Processes dynamic text content
 * @param element - Element to update
 * @param config - Text configuration
 */
function processDynamicText(element: HTMLElement, config: string): void {
    try {
        const textConfig = JSON.parse(config);
        
        // Simulate dynamic text based on configuration
        if (textConfig.source === 'post_title') {
            element.textContent = 'Sample Post Title';
        } else if (textConfig.source === 'site_name') {
            element.textContent = 'Your Site Name';
        } else if (textConfig.source === 'current_date') {
            element.textContent = new Date().toLocaleDateString();
        } else {
            element.textContent = textConfig.fallback || 'Dynamic Text';
        }
    } catch (error) {
        element.textContent = 'Dynamic Text';
    }
}

/**
 * Processes dynamic image content
 * @param element - Element to update
 * @param config - Image configuration
 */
function processDynamicImage(element: HTMLElement, config: string): void {
    try {
        const imageConfig = JSON.parse(config);
        
        if (element.tagName.toLowerCase() === 'img') {
            const img = element as HTMLImageElement;
            img.src = imageConfig.placeholder || 'https://via.placeholder.com/300x200?text=Dynamic+Image';
            img.alt = imageConfig.alt || 'Dynamic Image';
        }
    } catch (error) {
        console.error('processDynamicImage: Error processing dynamic image:', error);
    }
}

/**
 * Processes dynamic link content
 * @param element - Element to update
 * @param config - Link configuration
 */
function processDynamicLink(element: HTMLElement, config: string): void {
    try {
        const linkConfig = JSON.parse(config);
        
        if (element.tagName.toLowerCase() === 'a') {
            const link = element as HTMLAnchorElement;
            link.href = linkConfig.url || '#';
            if (linkConfig.text) {
                link.textContent = linkConfig.text;
            }
        }
    } catch (error) {
        console.error('processDynamicLink: Error processing dynamic link:', error);
    }
}

/**
 * Processes dynamic list content
 * @param element - Element to update
 * @param config - List configuration
 */
function processDynamicList(element: HTMLElement, config: string): void {
    try {
        const listConfig = JSON.parse(config);
        
        if (element.tagName.toLowerCase() === 'ul' || element.tagName.toLowerCase() === 'ol') {
            // Clear existing items
            element.innerHTML = '';
            
            // Add dynamic items
            const items = listConfig.items || ['Dynamic Item 1', 'Dynamic Item 2', 'Dynamic Item 3'];
            items.forEach((itemText: string) => {
                const li = document.createElement('li');
                li.textContent = itemText;
                element.appendChild(li);
            });
        }
    } catch (error) {
        console.error('processDynamicList: Error processing dynamic list:', error);
    }
}

/**
 * Processes template variables in content
 * @param container - Container element to process
 */
function processTemplateVariables(container: Element): void {
    try {
        // Find and replace template variables like {{variable_name}}
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null
        );

        const textNodes: Text[] = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node as Text);
        }

        textNodes.forEach(textNode => {
            if (textNode.textContent) {
                let content = textNode.textContent;
                
                // Replace common template variables
                content = content.replace(/\{\{site_name\}\}/g, 'Your Site Name');
                content = content.replace(/\{\{post_title\}\}/g, 'Sample Post Title');
                content = content.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString());
                content = content.replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString());
                content = content.replace(/\{\{author_name\}\}/g, 'John Doe');
                
                if (content !== textNode.textContent) {
                    textNode.textContent = content;
                }
            }
        });
    } catch (error) {
        console.error('processTemplateVariables: Error processing template variables:', error);
    }
}

/**
 * Renders dynamic templating shortcodes in a specific selector
 * EXACT replica of LiveCanvas render_dynamic_templating_shortcodes_in() function
 * 
 * @param selector - CSS selector for the container to process
 */
function render_dynamic_templating_shortcodes_in(selector: string): void {
    if (!selector) {
        console.warn('render_dynamic_templating_shortcodes_in: No selector provided');
        return;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('render_dynamic_templating_shortcodes_in: Preview document not available');
            return;
        }

        const container = previewDoc.querySelector(selector);
        if (!container) {
            console.warn(`render_dynamic_templating_shortcodes_in: Container not found: ${selector}`);
            return;
        }

        // Process templating shortcodes
        let html = container.innerHTML;
        
        // Replace templating shortcodes with dynamic content
        html = html.replace(/\[lc_template\s+([^\]]+)\]/g, (match, attributes) => {
            return processTemplatingShortcode(attributes);
        });

        container.innerHTML = html;

        console.log(`render_dynamic_templating_shortcodes_in: Processed templating shortcodes in ${selector}`);
    } catch (error) {
        console.error('render_dynamic_templating_shortcodes_in: Error processing templating shortcodes:', error);
    }
}

/**
 * Processes a templating shortcode
 * @param attributes - Shortcode attributes
 * @returns string - Rendered content
 */
function processTemplatingShortcode(attributes: string): string {
    try {
        // Parse shortcode attributes
        const attrs: Record<string, string> = {};
        const attrMatches = attributes.match(/(\w+)=["']([^"']+)["']/g);
        
        if (attrMatches) {
            attrMatches.forEach(attr => {
                const [, key, value] = attr.match(/(\w+)=["']([^"']+)["']/) || [];
                if (key && value) {
                    attrs[key] = value;
                }
            });
        }

        // Generate content based on template type
        const type = attrs.type || 'text';
        
        switch (type) {
            case 'post_list':
                return generatePostListTemplate(attrs);
            case 'user_info':
                return generateUserInfoTemplate(attrs);
            case 'site_info':
                return generateSiteInfoTemplate(attrs);
            default:
                return `<span class="lc-template-${type}">Template: ${type}</span>`;
        }
    } catch (error) {
        console.error('processTemplatingShortcode: Error processing shortcode:', error);
        return '<span class="lc-template-error">Template Error</span>';
    }
}

/**
 * Generates post list template
 * @param attrs - Template attributes
 * @returns string - Generated HTML
 */
function generatePostListTemplate(attrs: Record<string, string>): string {
    const count = parseInt(attrs.count || '3', 10);
    let html = '<div class="lc-post-list">';
    
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="lc-post-item">
                <h3>Sample Post Title ${i}</h3>
                <p>This is a sample post excerpt for demonstration purposes.</p>
                <a href="#">Read More</a>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

/**
 * Generates user info template
 * @param attrs - Template attributes
 * @returns string - Generated HTML
 */
function generateUserInfoTemplate(attrs: Record<string, string>): string {
    const field = attrs.field || 'name';
    
    switch (field) {
        case 'name':
            return '<span class="lc-user-name">John Doe</span>';
        case 'email':
            return '<span class="lc-user-email">john@example.com</span>';
        case 'avatar':
            return '<img class="lc-user-avatar" src="https://via.placeholder.com/50x50?text=Avatar" alt="User Avatar">';
        default:
            return `<span class="lc-user-${field}">User ${field}</span>`;
    }
}

/**
 * Generates site info template
 * @param attrs - Template attributes
 * @returns string - Generated HTML
 */
function generateSiteInfoTemplate(attrs: Record<string, string>): string {
    const field = attrs.field || 'name';
    
    switch (field) {
        case 'name':
            return '<span class="lc-site-name">Your Site Name</span>';
        case 'url':
            return '<span class="lc-site-url">https://yoursite.com</span>';
        case 'description':
            return '<span class="lc-site-description">Your site description goes here</span>';
        default:
            return `<span class="lc-site-${field}">Site ${field}</span>`;
    }
}

/**
 * Renders dynamic partials in a specific selector
 * EXACT replica of LiveCanvas render_dynamic_partials_in() function
 * 
 * @param selector - CSS selector for the container to process
 */
function render_dynamic_partials_in(selector: string): void {
    if (!selector) {
        console.warn('render_dynamic_partials_in: No selector provided');
        return;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('render_dynamic_partials_in: Preview document not available');
            return;
        }

        const container = previewDoc.querySelector(selector);
        if (!container) {
            console.warn(`render_dynamic_partials_in: Container not found: ${selector}`);
            return;
        }

        // Find and process partial elements
        const partialElements = container.querySelectorAll('[data-lc-partial]');
        
        partialElements.forEach((element: Element) => {
            const partialName = element.getAttribute('data-lc-partial');
            if (partialName) {
                const partialContent = generatePartialContent(partialName);
                element.innerHTML = partialContent;
            }
        });

        console.log(`render_dynamic_partials_in: Processed partials in ${selector}`);
    } catch (error) {
        console.error('render_dynamic_partials_in: Error processing dynamic partials:', error);
    }
}

/**
 * Generates content for a partial
 * @param partialName - Name of the partial
 * @returns string - Generated content
 */
function generatePartialContent(partialName: string): string {
    switch (partialName) {
        case 'header':
            return `
                <header class="lc-partial-header">
                    <h1>Site Header</h1>
                    <nav>
                        <a href="#">Home</a>
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                    </nav>
                </header>
            `;
        case 'footer':
            return `
                <footer class="lc-partial-footer">
                    <p>&copy; ${new Date().getFullYear()} Your Site Name. All rights reserved.</p>
                </footer>
            `;
        case 'sidebar':
            return `
                <aside class="lc-partial-sidebar">
                    <h3>Sidebar</h3>
                    <ul>
                        <li>Recent Posts</li>
                        <li>Categories</li>
                        <li>Archives</li>
                    </ul>
                </aside>
            `;
        default:
            return `<div class="lc-partial-${partialName}">Partial: ${partialName}</div>`;
    }
}

export {
    render_dynamic_content,
    render_dynamic_templating_shortcodes_in,
    render_dynamic_partials_in,
    processDynamicElement,
    processTemplateVariables
};