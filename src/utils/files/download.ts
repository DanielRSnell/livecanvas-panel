/**
 * File Download Utilities
 * EXACT replicas of LiveCanvas file download functions
 */

/**
 * Downloads text content as a file
 * EXACT replica of LiveCanvas download() function
 * 
 * @param filename - Name of the file to download
 * @param text - Text content to download
 */
function download(filename: string, text: string): void {
    if (!filename || !text) {
        console.warn('download: Filename and text are required');
        return;
    }

    try {
        // Create blob with text content
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        
        // Create temporary anchor element for download
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        console.log(`download: File "${filename}" downloaded successfully`);
    } catch (error) {
        console.error('download: Error downloading file:', error);
    }
}

/**
 * Downloads JSON data as a file
 * Extended function for JSON downloads
 * 
 * @param filename - Name of the file to download (without extension)
 * @param data - Data to download as JSON
 */
function downloadJSON(filename: string, data: any): void {
    if (!filename || data === undefined) {
        console.warn('downloadJSON: Filename and data are required');
        return;
    }

    try {
        const jsonString = JSON.stringify(data, null, 2);
        const fullFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
        
        download(fullFilename, jsonString);
    } catch (error) {
        console.error('downloadJSON: Error downloading JSON file:', error);
    }
}

/**
 * Downloads HTML content as a file
 * Extended function for HTML downloads
 * 
 * @param filename - Name of the file to download (without extension)
 * @param htmlContent - HTML content to download
 */
function downloadHTML(filename: string, htmlContent: string): void {
    if (!filename || !htmlContent) {
        console.warn('downloadHTML: Filename and HTML content are required');
        return;
    }

    try {
        const fullFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
        
        // Create blob with HTML content type
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        
        // Create temporary anchor element for download
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fullFilename;
        anchor.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        console.log(`downloadHTML: File "${fullFilename}" downloaded successfully`);
    } catch (error) {
        console.error('downloadHTML: Error downloading HTML file:', error);
    }
}

/**
 * Downloads CSS content as a file
 * Extended function for CSS downloads
 * 
 * @param filename - Name of the file to download (without extension)
 * @param cssContent - CSS content to download
 */
function downloadCSS(filename: string, cssContent: string): void {
    if (!filename || !cssContent) {
        console.warn('downloadCSS: Filename and CSS content are required');
        return;
    }

    try {
        const fullFilename = filename.endsWith('.css') ? filename : `${filename}.css`;
        
        // Create blob with CSS content type
        const blob = new Blob([cssContent], { type: 'text/css;charset=utf-8' });
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        
        // Create temporary anchor element for download
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fullFilename;
        anchor.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        console.log(`downloadCSS: File "${fullFilename}" downloaded successfully`);
    } catch (error) {
        console.error('downloadCSS: Error downloading CSS file:', error);
    }
}

/**
 * Downloads JavaScript content as a file
 * Extended function for JavaScript downloads
 * 
 * @param filename - Name of the file to download (without extension)
 * @param jsContent - JavaScript content to download
 */
function downloadJS(filename: string, jsContent: string): void {
    if (!filename || !jsContent) {
        console.warn('downloadJS: Filename and JavaScript content are required');
        return;
    }

    try {
        const fullFilename = filename.endsWith('.js') ? filename : `${filename}.js`;
        
        // Create blob with JavaScript content type
        const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        
        // Create temporary anchor element for download
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fullFilename;
        anchor.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        console.log(`downloadJS: File "${fullFilename}" downloaded successfully`);
    } catch (error) {
        console.error('downloadJS: Error downloading JavaScript file:', error);
    }
}

/**
 * Downloads binary data as a file
 * Extended function for binary downloads
 * 
 * @param filename - Name of the file to download
 * @param data - Binary data to download (Blob, ArrayBuffer, or Uint8Array)
 * @param mimeType - MIME type of the file
 */
function downloadBinary(filename: string, data: Blob | ArrayBuffer | Uint8Array, mimeType: string = 'application/octet-stream'): void {
    if (!filename || !data) {
        console.warn('downloadBinary: Filename and data are required');
        return;
    }

    try {
        let blob: Blob;
        
        if (data instanceof Blob) {
            blob = data;
        } else {
            blob = new Blob([data], { type: mimeType });
        }
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        
        // Create temporary anchor element for download
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        console.log(`downloadBinary: File "${filename}" downloaded successfully`);
    } catch (error) {
        console.error('downloadBinary: Error downloading binary file:', error);
    }
}

export {
    download,
    downloadJSON,
    downloadHTML,
    downloadCSS,
    downloadJS,
    downloadBinary
};