/**
 * Browser Detection and Environment Utilities
 * EXACT replicas of LiveCanvas browser detection functions
 */

/**
 * Detects if the user is using Chrome browser
 * EXACT replica of LiveCanvas usingChromeBrowser() function
 * 
 * @returns boolean - True if using Chrome browser
 */
function usingChromeBrowser(): boolean {
    try {
        if (typeof navigator === 'undefined') {
            return false;
        }

        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check for Chrome (but not Edge which also contains "chrome" in user agent)
        const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
        
        // Additional check for Chrome-specific features
        const hasChrome = !!(window as any).chrome;
        
        return isChrome && hasChrome;
    } catch (error) {
        console.error('usingChromeBrowser: Error detecting browser:', error);
        return false;
    }
}

/**
 * Determines the width of the scrollbar
 * EXACT replica of LiveCanvas determineScrollBarWidth() function
 * 
 * @returns number - Scrollbar width in pixels
 */
function determineScrollBarWidth(): number {
    try {
        // Create outer div
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar'; // For IE
        document.body.appendChild(outer);

        // Create inner div
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Calculate scrollbar width
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

        // Clean up
        document.body.removeChild(outer);

        return scrollbarWidth;
    } catch (error) {
        console.error('determineScrollBarWidth: Error determining scrollbar width:', error);
        return 17; // Default fallback value
    }
}

/**
 * Cached scrollbar width value
 */
let cachedScrollbarWidth: number | null = null;

/**
 * Gets the scrollbar width (cached for performance)
 * EXACT replica of LiveCanvas getScrollBarWidth() function
 * 
 * @returns number - Scrollbar width in pixels
 */
function getScrollBarWidth(): number {
    if (cachedScrollbarWidth === null) {
        cachedScrollbarWidth = determineScrollBarWidth();
    }
    return cachedScrollbarWidth;
}

/**
 * Detects if the user is on a mobile device
 * Extended function for mobile detection
 * 
 * @returns boolean - True if on mobile device
 */
function isMobileDevice(): boolean {
    try {
        if (typeof navigator === 'undefined') {
            return false;
        }

        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check for mobile user agents
        const mobileKeywords = [
            'mobile', 'android', 'iphone', 'ipad', 'ipod', 
            'blackberry', 'windows phone', 'opera mini'
        ];

        const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));
        
        // Additional check for touch capability and screen size
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;

        return isMobile || (hasTouchScreen && isSmallScreen);
    } catch (error) {
        console.error('isMobileDevice: Error detecting mobile device:', error);
        return false;
    }
}

/**
 * Detects if the user is on a tablet device
 * Extended function for tablet detection
 * 
 * @returns boolean - True if on tablet device
 */
function isTabletDevice(): boolean {
    try {
        if (typeof navigator === 'undefined') {
            return false;
        }

        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check for tablet-specific user agents
        const isIPad = userAgent.includes('ipad');
        const isAndroidTablet = userAgent.includes('android') && !userAgent.includes('mobile');
        
        // Additional check for touch capability and medium screen size
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isMediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;

        return isIPad || isAndroidTablet || (hasTouchScreen && isMediumScreen);
    } catch (error) {
        console.error('isTabletDevice: Error detecting tablet device:', error);
        return false;
    }
}

/**
 * Gets detailed browser information
 * Extended function for comprehensive browser analysis
 * 
 * @returns object - Detailed browser information
 */
function getBrowserInfo(): {
    name: string;
    version: string;
    userAgent: string;
    isChrome: boolean;
    isFirefox: boolean;
    isSafari: boolean;
    isEdge: boolean;
    isIE: boolean;
    isMobile: boolean;
    isTablet: boolean;
    scrollbarWidth: number;
} {
    const defaultInfo = {
        name: 'unknown',
        version: 'unknown',
        userAgent: '',
        isChrome: false,
        isFirefox: false,
        isSafari: false,
        isEdge: false,
        isIE: false,
        isMobile: false,
        isTablet: false,
        scrollbarWidth: 17
    };

    try {
        if (typeof navigator === 'undefined') {
            return defaultInfo;
        }

        const userAgent = navigator.userAgent;
        const userAgentLower = userAgent.toLowerCase();

        // Detect browser name and version
        let name = 'unknown';
        let version = 'unknown';

        if (userAgentLower.includes('chrome') && !userAgentLower.includes('edg')) {
            name = 'chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (userAgentLower.includes('firefox')) {
            name = 'firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (userAgentLower.includes('safari') && !userAgentLower.includes('chrome')) {
            name = 'safari';
            const match = userAgent.match(/Version\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (userAgentLower.includes('edg')) {
            name = 'edge';
            const match = userAgent.match(/Edg\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (userAgentLower.includes('trident') || userAgentLower.includes('msie')) {
            name = 'internet-explorer';
            const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
            version = match ? match[1] : 'unknown';
        }

        return {
            name,
            version,
            userAgent,
            isChrome: usingChromeBrowser(),
            isFirefox: name === 'firefox',
            isSafari: name === 'safari',
            isEdge: name === 'edge',
            isIE: name === 'internet-explorer',
            isMobile: isMobileDevice(),
            isTablet: isTabletDevice(),
            scrollbarWidth: getScrollBarWidth()
        };
    } catch (error) {
        console.error('getBrowserInfo: Error getting browser info:', error);
        return defaultInfo;
    }
}

export {
    usingChromeBrowser,
    determineScrollBarWidth,
    getScrollBarWidth,
    isMobileDevice,
    isTabletDevice,
    getBrowserInfo
};