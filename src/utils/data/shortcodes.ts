/**
 * Shortcode Processing Functions
 * EXACT replicas of LiveCanvas shortcode processing functions
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
 * Renders a specific shortcode in a selector
 * EXACT replica of LiveCanvas render_shortcode() function
 * 
 * @param selector - CSS selector for the container
 * @param shortcode - Shortcode to render
 */
function render_shortcode(selector: string, shortcode: string): void {
    if (!selector || !shortcode) {
        console.warn('render_shortcode: Selector and shortcode are required');
        return;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('render_shortcode: Preview document not available');
            return;
        }

        const container = previewDoc.querySelector(selector);
        if (!container) {
            console.warn(`render_shortcode: Container not found: ${selector}`);
            return;
        }

        // Process the shortcode
        const renderedContent = processShortcode(shortcode);
        
        // Replace or append the content
        if (container.innerHTML.includes(shortcode)) {
            container.innerHTML = container.innerHTML.replace(shortcode, renderedContent);
        } else {
            container.innerHTML += renderedContent;
        }

        console.log(`render_shortcode: Rendered shortcode in ${selector}`);
    } catch (error) {
        console.error('render_shortcode: Error rendering shortcode:', error);
    }
}

/**
 * Renders all shortcodes in a specific selector
 * EXACT replica of LiveCanvas render_shortcodes_in() function
 * 
 * @param selector - CSS selector for the container to process
 */
function render_shortcodes_in(selector: string): void {
    if (!selector) {
        console.warn('render_shortcodes_in: No selector provided');
        return;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('render_shortcodes_in: Preview document not available');
            return;
        }

        const container = previewDoc.querySelector(selector);
        if (!container) {
            console.warn(`render_shortcodes_in: Container not found: ${selector}`);
            return;
        }

        let html = container.innerHTML;
        
        // Find and process all shortcodes
        const shortcodeRegex = /\[([a-zA-Z0-9_-]+)([^\]]*)\]([^\[]*(?:\[(?!\/\1\])[^\[]*)*)?\[\/\1\]|\[([a-zA-Z0-9_-]+)([^\]]*)\]/g;
        
        html = html.replace(shortcodeRegex, (match) => {
            return processShortcode(match);
        });

        container.innerHTML = html;

        console.log(`render_shortcodes_in: Processed all shortcodes in ${selector}`);
    } catch (error) {
        console.error('render_shortcodes_in: Error processing shortcodes:', error);
    }
}

/**
 * Processes a single shortcode and returns rendered content
 * @param shortcode - Shortcode string to process
 * @returns string - Rendered content
 */
function processShortcode(shortcode: string): string {
    try {
        // Parse shortcode
        const parsed = parseShortcode(shortcode);
        if (!parsed) {
            return shortcode; // Return original if parsing fails
        }

        const { tag, attributes, content } = parsed;

        // Process based on shortcode tag
        switch (tag) {
            case 'button':
                return renderButtonShortcode(attributes, content);
            case 'gallery':
                return renderGalleryShortcode(attributes);
            case 'video':
                return renderVideoShortcode(attributes);
            case 'audio':
                return renderAudioShortcode(attributes);
            case 'embed':
                return renderEmbedShortcode(attributes);
            case 'contact_form':
                return renderContactFormShortcode(attributes);
            case 'social_icons':
                return renderSocialIconsShortcode(attributes);
            case 'testimonial':
                return renderTestimonialShortcode(attributes, content);
            case 'accordion':
                return renderAccordionShortcode(attributes, content);
            case 'tabs':
                return renderTabsShortcode(attributes, content);
            case 'columns':
                return renderColumnsShortcode(attributes, content);
            case 'column':
                return renderColumnShortcode(attributes, content);
            default:
                return renderGenericShortcode(tag, attributes, content);
        }
    } catch (error) {
        console.error('processShortcode: Error processing shortcode:', error);
        return `<div class="shortcode-error">Error processing shortcode: ${shortcode}</div>`;
    }
}

/**
 * Parses a shortcode string into components
 * @param shortcode - Shortcode string
 * @returns object | null - Parsed shortcode components
 */
function parseShortcode(shortcode: string): { tag: string; attributes: Record<string, string>; content: string } | null {
    try {
        // Match shortcode pattern
        const match = shortcode.match(/\[([a-zA-Z0-9_-]+)([^\]]*)\]([^\[]*(?:\[(?!\/\1\])[^\[]*)*)?\[\/\1\]|\[([a-zA-Z0-9_-]+)([^\]]*)\]/);
        
        if (!match) {
            return null;
        }

        const tag = match[1] || match[4];
        const attributeString = match[2] || match[5] || '';
        const content = match[3] || '';

        // Parse attributes
        const attributes: Record<string, string> = {};
        const attrMatches = attributeString.match(/(\w+)=["']([^"']+)["']|\s+(\w+)(?=\s|$)/g);
        
        if (attrMatches) {
            attrMatches.forEach(attr => {
                const equalMatch = attr.match(/(\w+)=["']([^"']+)["']/);
                if (equalMatch) {
                    attributes[equalMatch[1]] = equalMatch[2];
                } else {
                    const flagMatch = attr.match(/\s*(\w+)/);
                    if (flagMatch) {
                        attributes[flagMatch[1]] = 'true';
                    }
                }
            });
        }

        return { tag, attributes, content };
    } catch (error) {
        console.error('parseShortcode: Error parsing shortcode:', error);
        return null;
    }
}

/**
 * Renders button shortcode
 */
function renderButtonShortcode(attributes: Record<string, string>, content: string): string {
    const url = attributes.url || attributes.href || '#';
    const text = content || attributes.text || 'Button';
    const style = attributes.style || 'primary';
    const size = attributes.size || 'medium';
    
    return `<a href="${url}" class="lc-button lc-button-${style} lc-button-${size}">${text}</a>`;
}

/**
 * Renders gallery shortcode
 */
function renderGalleryShortcode(attributes: Record<string, string>): string {
    const columns = parseInt(attributes.columns || '3', 10);
    const count = parseInt(attributes.count || '6', 10);
    
    let html = `<div class="lc-gallery lc-gallery-columns-${columns}">`;
    
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="lc-gallery-item">
                <img src="https://via.placeholder.com/300x200?text=Image+${i}" alt="Gallery Image ${i}">
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

/**
 * Renders video shortcode
 */
function renderVideoShortcode(attributes: Record<string, string>): string {
    const src = attributes.src || attributes.url || '';
    const width = attributes.width || '100%';
    const height = attributes.height || '315';
    
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
        const videoId = extractYouTubeId(src);
        return `
            <div class="lc-video-wrapper">
                <iframe width="${width}" height="${height}" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" allowfullscreen></iframe>
            </div>
        `;
    } else if (src.includes('vimeo.com')) {
        const videoId = extractVimeoId(src);
        return `
            <div class="lc-video-wrapper">
                <iframe width="${width}" height="${height}" 
                        src="https://player.vimeo.com/video/${videoId}" 
                        frameborder="0" allowfullscreen></iframe>
            </div>
        `;
    } else {
        return `
            <div class="lc-video-wrapper">
                <video width="${width}" height="${height}" controls>
                    <source src="${src}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }
}

/**
 * Renders contact form shortcode
 */
function renderContactFormShortcode(attributes: Record<string, string>): string {
    const title = attributes.title || 'Contact Form';
    
    return `
        <div class="lc-contact-form">
            <h3>${title}</h3>
            <form>
                <div class="lc-form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="lc-form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="lc-form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="lc-submit-button">Send Message</button>
            </form>
        </div>
    `;
}

/**
 * Renders testimonial shortcode
 */
function renderTestimonialShortcode(attributes: Record<string, string>, content: string): string {
    const author = attributes.author || 'Anonymous';
    const role = attributes.role || '';
    const avatar = attributes.avatar || 'https://via.placeholder.com/60x60?text=User';
    
    return `
        <div class="lc-testimonial">
            <div class="lc-testimonial-content">
                <p>"${content || 'This is a sample testimonial.'}"</p>
            </div>
            <div class="lc-testimonial-author">
                <img src="${avatar}" alt="${author}" class="lc-testimonial-avatar">
                <div class="lc-testimonial-info">
                    <strong>${author}</strong>
                    ${role ? `<span class="lc-testimonial-role">${role}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders columns shortcode
 */
function renderColumnsShortcode(attributes: Record<string, string>, content: string): string {
    const count = parseInt(attributes.count || '2', 10);
    return `<div class="lc-columns lc-columns-${count}">${content}</div>`;
}

/**
 * Renders column shortcode
 */
function renderColumnShortcode(attributes: Record<string, string>, content: string): string {
    const width = attributes.width || 'auto';
    return `<div class="lc-column" style="flex: ${width === 'auto' ? '1' : '0 0 ' + width}">${content}</div>`;
}

/**
 * Renders generic shortcode
 */
function renderGenericShortcode(tag: string, attributes: Record<string, string>, content: string): string {
    const attrString = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
    
    return `<div class="lc-shortcode lc-shortcode-${tag}" ${attrString}>${content || `Shortcode: ${tag}`}</div>`;
}

/**
 * Extracts YouTube video ID from URL
 */
function extractYouTubeId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
}

/**
 * Extracts Vimeo video ID from URL
 */
function extractVimeoId(url: string): string {
    const match = url.match(/vimeo\.com\/([0-9]+)/);
    return match ? match[1] : '';
}

/**
 * Renders audio shortcode
 */
function renderAudioShortcode(attributes: Record<string, string>): string {
    const src = attributes.src || attributes.url || '';
    const title = attributes.title || 'Audio';
    
    return `
        <div class="lc-audio-wrapper">
            <audio controls>
                <source src="${src}" type="audio/mpeg">
                <source src="${src}" type="audio/ogg">
                Your browser does not support the audio element.
            </audio>
            ${title ? `<p class="lc-audio-title">${title}</p>` : ''}
        </div>
    `;
}

/**
 * Renders embed shortcode
 */
function renderEmbedShortcode(attributes: Record<string, string>): string {
    const src = attributes.src || attributes.url || '';
    const width = attributes.width || '100%';
    const height = attributes.height || '400';
    
    return `
        <div class="lc-embed-wrapper">
            <iframe src="${src}" width="${width}" height="${height}" 
                    frameborder="0" allowfullscreen></iframe>
        </div>
    `;
}

/**
 * Renders social icons shortcode
 */
function renderSocialIconsShortcode(attributes: Record<string, string>): string {
    const size = attributes.size || 'medium';
    const style = attributes.style || 'round';
    
    return `
        <div class="lc-social-icons lc-social-${size} lc-social-${style}">
            <a href="#" class="lc-social-facebook">Facebook</a>
            <a href="#" class="lc-social-twitter">Twitter</a>
            <a href="#" class="lc-social-instagram">Instagram</a>
            <a href="#" class="lc-social-linkedin">LinkedIn</a>
        </div>
    `;
}

/**
 * Renders accordion shortcode
 */
function renderAccordionShortcode(attributes: Record<string, string>, content: string): string {
    const title = attributes.title || 'Accordion';
    
    return `
        <div class="lc-accordion">
            <div class="lc-accordion-header">
                <h4>${title}</h4>
                <span class="lc-accordion-toggle">+</span>
            </div>
            <div class="lc-accordion-content">
                ${content || 'Accordion content goes here.'}
            </div>
        </div>
    `;
}

/**
 * Renders tabs shortcode
 */
function renderTabsShortcode(attributes: Record<string, string>, content: string): string {
    return `
        <div class="lc-tabs">
            <div class="lc-tabs-nav">
                <button class="lc-tab-button active">Tab 1</button>
                <button class="lc-tab-button">Tab 2</button>
                <button class="lc-tab-button">Tab 3</button>
            </div>
            <div class="lc-tabs-content">
                <div class="lc-tab-panel active">
                    ${content || 'Tab content goes here.'}
                </div>
            </div>
        </div>
    `;
}

/**
 * Adds placeholders for special LnL tags
 * EXACT replica of LiveCanvas put_placeholders_in_lnl_tags_in() function
 * 
 * @param selector - CSS selector for the container to process
 */
function put_placeholders_in_lnl_tags_in(selector: string): void {
    if (!selector) {
        console.warn('put_placeholders_in_lnl_tags_in: No selector provided');
        return;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('put_placeholders_in_lnl_tags_in: Preview document not available');
            return;
        }

        const container = previewDoc.querySelector(selector);
        if (!container) {
            console.warn(`put_placeholders_in_lnl_tags_in: Container not found: ${selector}`);
            return;
        }

        let html = container.innerHTML;
        
        // Replace LnL tags with placeholders
        html = html.replace(/<lnl:([^>]+)>/g, (match, tagContent) => {
            return `<div class="lc-lnl-placeholder" data-lnl-tag="${tagContent}">LnL: ${tagContent}</div>`;
        });

        container.innerHTML = html;

        console.log(`put_placeholders_in_lnl_tags_in: Added placeholders for LnL tags in ${selector}`);
    } catch (error) {
        console.error('put_placeholders_in_lnl_tags_in: Error adding placeholders:', error);
    }
}

export {
    render_shortcode,
    render_shortcodes_in,
    put_placeholders_in_lnl_tags_in,
    processShortcode,
    parseShortcode
};