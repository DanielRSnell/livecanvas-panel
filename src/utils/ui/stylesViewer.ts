/**
 * Computed Styles Viewer Utility
 * Provides a simple interface for viewing computed styles of elements
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
 * Gets computed styles for a selector and displays them
 * @param selector - CSS selector for the element
 * @returns object - Computed styles information
 */
function getComputedStylesForElement(selector: string): {
    element: string;
    styles: Record<string, string>;
    customProperties: Record<string, string>;
    classes: string[];
    dimensions: { width: string; height: string; };
    position: { top: string; left: string; };
    boxModel: { margin: string; padding: string; border: string; };
} | null {
    if (!selector) {
        return null;
    }

    try {
        const previewDoc = getPreviewDocument();
        if (!previewDoc) {
            console.warn('getComputedStylesForElement: Preview document not available');
            return null;
        }

        const element = previewDoc.querySelector(selector) as HTMLElement;
        if (!element) {
            console.warn(`getComputedStylesForElement: Element not found: ${selector}`);
            return null;
        }

        const computedStyle = previewDoc.defaultView?.getComputedStyle(element);
        if (!computedStyle) {
            return null;
        }

        // Get commonly used styles
        const styles: Record<string, string> = {};
        const importantStyles = [
            'display', 'position', 'float', 'clear',
            'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
            'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'border', 'border-width', 'border-style', 'border-color',
            'background', 'background-color', 'background-image', 'background-size',
            'color', 'font-family', 'font-size', 'font-weight', 'line-height',
            'text-align', 'text-decoration', 'text-transform',
            'opacity', 'visibility', 'overflow', 'z-index',
            'flex', 'flex-direction', 'justify-content', 'align-items',
            'grid', 'grid-template-columns', 'grid-template-rows', 'gap'
        ];

        importantStyles.forEach(property => {
            const value = computedStyle.getPropertyValue(property);
            if (value && value !== 'initial' && value !== 'normal') {
                styles[property] = value;
            }
        });

        // Get custom properties (CSS variables)
        const customProperties: Record<string, string> = {};
        for (let i = 0; i < computedStyle.length; i++) {
            const propertyName = computedStyle[i];
            if (propertyName.startsWith('--')) {
                customProperties[propertyName] = computedStyle.getPropertyValue(propertyName);
            }
        }

        // Get classes
        const classes = Array.from(element.classList);

        // Get dimensions
        const dimensions = {
            width: computedStyle.getPropertyValue('width'),
            height: computedStyle.getPropertyValue('height')
        };

        // Get position
        const position = {
            top: computedStyle.getPropertyValue('top'),
            left: computedStyle.getPropertyValue('left')
        };

        // Get box model
        const boxModel = {
            margin: computedStyle.getPropertyValue('margin'),
            padding: computedStyle.getPropertyValue('padding'),
            border: computedStyle.getPropertyValue('border')
        };

        return {
            element: selector,
            styles,
            customProperties,
            classes,
            dimensions,
            position,
            boxModel
        };
    } catch (error) {
        console.error('getComputedStylesForElement: Error getting computed styles:', error);
        return null;
    }
}

/**
 * Creates a simple HTML interface for viewing computed styles
 * @param selector - CSS selector for the element
 * @returns string - HTML for the styles viewer
 */
function createStylesViewerHTML(selector: string): string {
    const stylesData = getComputedStylesForElement(selector);
    
    if (!stylesData) {
        return `<div class="lc-styles-viewer-error">Could not retrieve styles for: ${selector}</div>`;
    }

    const { element, styles, customProperties, classes, dimensions, position, boxModel } = stylesData;

    let html = `
        <div class="lc-styles-viewer">
            <h3>Computed Styles for: <code>${element}</code></h3>
            
            <div class="lc-styles-section">
                <h4>Classes</h4>
                <div class="lc-styles-content">
                    ${classes.length > 0 ? 
                        classes.map(cls => `<span class="lc-class-tag">${cls}</span>`).join(' ') : 
                        '<em>No classes</em>'
                    }
                </div>
            </div>

            <div class="lc-styles-section">
                <h4>Dimensions</h4>
                <div class="lc-styles-content">
                    <div><strong>Width:</strong> ${dimensions.width}</div>
                    <div><strong>Height:</strong> ${dimensions.height}</div>
                </div>
            </div>

            <div class="lc-styles-section">
                <h4>Box Model</h4>
                <div class="lc-styles-content">
                    <div><strong>Margin:</strong> ${boxModel.margin}</div>
                    <div><strong>Padding:</strong> ${boxModel.padding}</div>
                    <div><strong>Border:</strong> ${boxModel.border}</div>
                </div>
            </div>

            <div class="lc-styles-section">
                <h4>Computed Styles</h4>
                <div class="lc-styles-content lc-styles-grid">
                    ${Object.entries(styles).map(([property, value]) => `
                        <div class="lc-style-property">
                            <span class="lc-style-name">${property}:</span>
                            <span class="lc-style-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${Object.keys(customProperties).length > 0 ? `
                <div class="lc-styles-section">
                    <h4>CSS Variables</h4>
                    <div class="lc-styles-content lc-styles-grid">
                        ${Object.entries(customProperties).map(([property, value]) => `
                            <div class="lc-style-property">
                                <span class="lc-style-name">${property}:</span>
                                <span class="lc-style-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    return html;
}

/**
 * Shows computed styles in a popup or modal
 * @param selector - CSS selector for the element
 */
function showComputedStylesViewer(selector: string): void {
    const viewerHTML = createStylesViewerHTML(selector);
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'lc-styles-viewer-overlay';
    overlay.innerHTML = `
        <div class="lc-styles-viewer-modal">
            <div class="lc-styles-viewer-header">
                <h2>Element Styles</h2>
                <button class="lc-styles-viewer-close">&times;</button>
            </div>
            <div class="lc-styles-viewer-body">
                ${viewerHTML}
            </div>
        </div>
    `;

    // Add basic styles
    const style = document.createElement('style');
    style.textContent = `
        .lc-styles-viewer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .lc-styles-viewer-modal {
            background: white;
            border-radius: 8px;
            max-width: 800px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .lc-styles-viewer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #eee;
        }
        .lc-styles-viewer-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        .lc-styles-viewer-body {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(80vh - 60px);
        }
        .lc-styles-section {
            margin-bottom: 20px;
        }
        .lc-styles-section h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .lc-styles-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
        }
        .lc-style-property {
            display: flex;
            padding: 4px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .lc-style-name {
            font-weight: bold;
            margin-right: 8px;
            min-width: 150px;
        }
        .lc-style-value {
            font-family: monospace;
            color: #666;
        }
        .lc-class-tag {
            background: #e3f2fd;
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 4px;
            font-family: monospace;
            font-size: 0.9em;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Add close functionality
    const closeBtn = overlay.querySelector('.lc-styles-viewer-close');
    closeBtn?.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.head.removeChild(style);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        }
    });
}

export {
    getComputedStylesForElement,
    createStylesViewerHTML,
    showComputedStylesViewer
};