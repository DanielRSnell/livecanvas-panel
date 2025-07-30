# LiveCanvas Utils Implementation TODO

## Implementation Phases

### Phase 1: Critical Core Functions (HIGH PRIORITY)
**Target: Essential functions for element tools to work**

#### 1.1 DOM & Selector Utilities
- [ ] `CSSelector(el)` - **CRITICAL** - Element identification for our tools
  - Location: `core/selectors.ts`
  - Dependencies: None
  - Must work identically to LiveCanvas version
  - Test with complex nested elements

- [ ] `getPageHTML(selector)` - **CRITICAL** - Get element HTML content
  - Location: `content/html.ts`
  - Dependencies: CSSelector
  - Must work with iframe context

- [ ] `setPageHTML(selector, newValue)` - **CRITICAL** - Set element HTML content
  - Location: `content/html.ts`
  - Dependencies: CSSelector, updatePreviewSectorial
  - Must trigger proper preview updates

- [ ] `getPageHTMLOuter(selector)` - **CRITICAL** - Get element outer HTML
  - Location: `content/html.ts`
  - Dependencies: CSSelector

- [ ] `setPageHTMLOuter(selector, newValue)` - **CRITICAL** - Set element outer HTML
  - Location: `content/html.ts`
  - Dependencies: CSSelector, updatePreviewSectorial

#### 1.2 Attribute Management
- [ ] `getAttributeValue(selector, attribute_name)` - **CRITICAL** - Get element attribute
  - Location: `content/attributes.ts`
  - Dependencies: CSSelector
  - Must handle all HTML attributes

- [ ] `setAttributeValue(selector, attribute_name, newValue)` - **CRITICAL** - Set element attribute
  - Location: `content/attributes.ts`
  - Dependencies: CSSelector, updatePreviewSectorial
  - Must trigger preview updates for visual attributes

#### 1.3 Preview Updates
- [ ] `updatePreview()` - **CRITICAL** - Update entire preview
  - Location: `preview/updates.ts`
  - Dependencies: filterPreviewHTML, enrichPreview
  - Must work with iframe context

- [ ] `updatePreviewSectorial(selector)` - **CRITICAL** - Update specific preview section
  - Location: `preview/updates.ts`
  - Dependencies: CSSelector, enrichPreviewSectorial
  - Must update only targeted elements

#### 1.4 Performance Utilities
- [ ] `debounce(func, wait, immediate)` - **HIGH** - Debounce function calls
  - Location: `performance/throttling.ts`
  - Dependencies: None
  - Exact replica of LiveCanvas version

- [ ] `throttle(fn, threshold, scope)` - **HIGH** - Throttle function calls
  - Location: `performance/throttling.ts`
  - Dependencies: None
  - Exact replica of LiveCanvas version


### Phase 2: Element Analysis & Content (MEDIUM PRIORITY)
**Target: Enhanced element tools functionality**

#### 2.1 Element Type Detection
- [ ] `getLayoutElementType(theSelector)` - Element layout type detection
  - Location: `core/elements.ts`
  - Dependencies: CSSelector
  - Returns element type classifications

- [ ] `getHtmlElementType(theSelector)` - HTML element type detection
  - Location: `core/elements.ts`
  - Dependencies: CSSelector
  - Returns HTML element type

#### 2.2 CSS & Styling
- [ ] `getComputedPropertyForClass(className, cssProperty)` - Get computed CSS properties
  - Location: `styling/computed.ts`
  - Dependencies: None
  - Must work with preview iframe styles

- [ ] `getClassesMappedArray()` - Get all CSS classes mapped
  - Location: `styling/classes.ts`
  - Dependencies: None
  - Parses all available CSS classes

- [ ] `getCSSVariablesMappedArray()` - Get CSS variables mapped
  - Location: `styling/variables.ts`
  - Dependencies: None
  - Parses CSS custom properties

#### 2.3 Content Processing
- [ ] `sanitize_editable_rich(input)` - Sanitize rich text content
  - Location: `content/sanitization.ts`
  - Dependencies: None
  - Must preserve safe HTML while removing dangerous content

- [ ] `filterPreviewHTML(input)` - Filter HTML for preview
  - Location: `preview/rendering.ts`
  - Dependencies: None
  - Processes HTML before preview display

- [ ] `code_needs_hard_refresh(new_html)` - Determine if hard refresh needed
  - Location: `preview/updates.ts`
  - Dependencies: None
  - Detects when full page refresh required


### Phase 3: Dynamic Content & Advanced Features (MEDIUM PRIORITY)
**Target: Full LiveCanvas compatibility**

#### 3.1 Dynamic Content Rendering
- [ ] `render_dynamic_content(selector)` - Render dynamic content
  - Location: `content/shortcodes.ts`
  - Dependencies: CSSelector, updatePreviewSectorial
  - Processes dynamic content placeholders

- [ ] `render_shortcode(selector, shortcode)` - Render specific shortcode
  - Location: `content/shortcodes.ts`
  - Dependencies: CSSelector
  - Processes WordPress-style shortcodes

- [ ] `render_shortcodes_in(selector)` - Render all shortcodes in selector
  - Location: `content/shortcodes.ts`
  - Dependencies: CSSelector, render_shortcode
  - Batch shortcode processing

#### 3.2 Preview Enhancement
- [ ] `tryToEnrichPreview()` - Enrich preview with dynamic content
  - Location: `preview/enrichment.ts`
  - Dependencies: render_dynamic_content
  - Adds dynamic content to preview

- [ ] `enrichPreview()` - Debounced preview enrichment
  - Location: `preview/enrichment.ts`
  - Dependencies: debounce, tryToEnrichPreview
  - Optimized preview enhancement

- [ ] `enrichPreviewSectorial(selector)` - Sectorial preview enrichment
  - Location: `preview/enrichment.ts`
  - Dependencies: debounce, render_dynamic_content
  - Targeted preview enhancement

#### 3.3 UI Management
- [ ] `openSidePanel(theSelector)` - Open side panel
  - Location: `ui/panels.ts`
  - Dependencies: None
  - LiveCanvas side panel integration

- [ ] `revealSidePanel(item_type, selector, layoutElementName)` - Reveal side panel
  - Location: `ui/panels.ts`
  - Dependencies: openSidePanel
  - Context-aware panel display


### Phase 4: Utility Functions (LOW PRIORITY)
**Target: Complete utility suite**

#### 4.1 Text Processing
- [ ] `capitalize(s)` - Capitalize first letter
  - Location: `text/formatting.ts`
  - Dependencies: None
  - Simple string utility

- [ ] `generateReadableName()` - Generate random readable names
  - Location: `text/generation.ts`
  - Dependencies: None
  - Name generation utility

- [ ] `lc_parseParams(str)` - Parse URL parameters
  - Location: `text/parsing.ts`
  - Dependencies: None
  - URL parameter extraction

#### 4.2 Browser Utilities
- [ ] `usingChromeBrowser()` - Detect Chrome browser
  - Location: `browser/detection.ts`
  - Dependencies: None
  - Browser detection utility

- [ ] `determineScrollBarWidth()` - Calculate scrollbar width
  - Location: `browser/scrolling.ts`
  - Dependencies: None
  - Scrollbar width detection

- [ ] `getScrollBarWidth()` - Get scrollbar width
  - Location: `browser/scrolling.ts`
  - Dependencies: determineScrollBarWidth
  - Returns calculated scrollbar width

#### 4.3 File Operations
- [ ] `download(filename, text)` - Download text as file
  - Location: `files/download.ts`
  - Dependencies: None
  - File download utility

#### 4.4 Storage & State
- [ ] `setEditorPreference(option_name, option_value)` - Set editor preferences
  - Location: `data/storage.ts`
  - Dependencies: None
  - LocalStorage preference management

- [ ] `saveHistoryStep()` - Save editor history step
  - Location: `data/history.ts`
  - Dependencies: debounce
  - Editor undo/redo history


### Phase 5: Advanced Integration (FUTURE)
**Target: Full LiveCanvas ecosystem integration**

#### 5.1 Network & Services
- [ ] `pingServerWhileEditing()` - Ping server during editing
  - Location: `network/api.ts`
  - Dependencies: None
  - Server connectivity maintenance

- [ ] `getServiceApiKey(serviceName)` - Get API keys for services
  - Location: `network/services.ts`
  - Dependencies: None
  - API key management

#### 5.2 Media & Images
- [ ] `loadHtmlToImageInIframe(callback)` - HTML to image conversion
  - Location: `files/images.ts`
  - Dependencies: None
  - Screenshot generation

- [ ] `sanitizeContainerImages(container)` - Sanitize image URLs
  - Location: `files/images.ts`
  - Dependencies: None
  - Image URL processing

#### 5.3 Advanced UI
- [ ] `handleKeyboardEvents(e)` - Handle keyboard events
  - Location: `ui/keyboard.ts`
  - Dependencies: None
  - Keyboard shortcut management

- [ ] `initLazyPreviewObserver(theSelector)` - Initialize lazy loading
  - Location: `performance/observers.ts`
  - Dependencies: None
  - Intersection observer setup


## Implementation Guidelines

### Function Signature Compatibility
**MUST maintain exact function signatures as LiveCanvas originals**
```javascript
// LiveCanvas Original
function CSSelector(el) { /* implementation */ }

// Our Implementation
export function CSSelector(el: HTMLElement): string { /* identical implementation */ }
```

### Window Registration
**All functions must be available on window object**
```javascript
// Register on window for LiveCanvas compatibility
window.LCUtils = {
  CSSelector,
  getPageHTML,
  setPageHTML,
  // ... all other functions
};
```

### Error Handling
**Must handle errors identically to LiveCanvas**
- Silent failures where LiveCanvas fails silently
- Same error types and messages
- Identical fallback behaviors

### Dependencies
**Must work with existing LiveCanvas environment**
- jQuery integration
- iframe context support
- lcMainStore compatibility
- ACE editor integration

### Testing Requirements
**Each function must pass compatibility tests**
- Unit tests against original behavior
- Integration tests with LiveCanvas
- Performance benchmarks
- Cross-browser compatibility

## Success Criteria
- [ ] All Phase 1 functions implemented and tested
- [ ] Element tools fully functional with new utilities
- [ ] No breaking changes to existing LiveCanvas functionality
- [ ] Performance equal to or better than originals
- [ ] 100% compatibility with existing LiveCanvas workflows