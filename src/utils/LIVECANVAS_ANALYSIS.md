# LiveCanvas Editor Utilities Analysis

## Overview
This document analyzes all utilities found in LiveCanvas editor files to prepare for reimplementation as window utilities that work exactly the same as the originals.

## Files Analyzed
- `/livecanvas/editor/editor.js` - Main editor functionality
- `/livecanvas/editor/functions.js` - Core utility functions
- `/livecanvas/editor/contextual-menus-actions.js` - Context menu actions
- `/livecanvas/editor/live-editing-initialize.js` - Live editing setup
- `/livecanvas/editor/side-panel-edit-properties.js` - Property editing
- `/livecanvas/editor/text-editing-toolbar.js` - Text editing toolbar
- `/livecanvas/editor/tree-view.js` - Tree view functionality

## Core Utility Functions (functions.js)

### Performance & Throttling
- `debounce(func, wait, immediate)` - Debounces function calls
- `throttle(fn, threshold, scope)` - Throttles function calls

### String Utilities
- `capitalize(s)` - Capitalizes first letter of string
- `generateReadableName()` - Generates random readable names
- `lc_parseParams(str)` - Parses URL parameters
- `lc_get_parameter_value_from_shortcode(paramName, theShortcode)` - Extracts shortcode parameters
- `sanitize_editable_rich(input)` - Sanitizes rich text input
- `fixMultipleQuestionMarks(url)` - Fixes URLs with multiple question marks

### DOM & Element Utilities
- `CSSelector(el)` - Generates CSS selector for element (CRITICAL)
- `prepareElement(html)` - Prepares HTML elements
- `getComputedPropertyForClass(className, cssProperty)` - Gets computed CSS properties
- `getDistanceFromParent(el)` - Calculates distance from parent element
- `countOccurrences(needle, haystack)` - Counts string occurrences

### HTML & Content Management
- `getPageHTML(selector)` - Gets HTML content of selector (CRITICAL)
- `getPageHTMLOuter(selector)` - Gets outer HTML of selector (CRITICAL)
- `setPageHTML(selector, newValue)` - Sets HTML content (CRITICAL)
- `setPageHTMLOuter(selector, newValue)` - Sets outer HTML (CRITICAL)
- `getAttributeValue(selector, attribute_name)` - Gets attribute value (CRITICAL)
- `setAttributeValue(selector, attribute_name, newValue)` - Sets attribute value (CRITICAL)
- `filterPreviewHTML(input)` - Filters HTML for preview
- `code_needs_hard_refresh(new_html)` - Determines if hard refresh needed

### Preview & Updating Functions
- `updatePreview()` - Updates main preview (CRITICAL)
- `updatePreviewSectorial(selector)` - Updates specific preview section (CRITICAL)
- `tryToEnrichPreview()` - Enriches preview with dynamic content
- `enrichPreview()` - Debounced preview enrichment
- `enrichPreviewSectorial(selector)` - Sectorial preview enrichment

### Element Type Detection
- `getLayoutElementType(theSelector)` - Determines layout element type
- `getHtmlElementType(theSelector)` - Determines HTML element type

### Dynamic Content & Shortcodes
- `render_dynamic_content(selector)` - Renders dynamic content
- `render_shortcode(selector, shortcode)` - Renders specific shortcode
- `render_shortcodes_in(selector)` - Renders all shortcodes in selector
- `render_dynamic_templating_shortcodes_in(selector)` - Renders templating shortcodes
- `render_dynamic_partials_in(selector)` - Renders dynamic partials
- `put_placeholders_in_lnl_tags_in(selector)` - Adds placeholders for special tags

### CSS & Styling
- `getClassesMappedArray()` - Gets all CSS classes mapped
- `getCSSVariablesMappedArray()` - Gets CSS variables mapped
- `processStyleRule(rule, classes, sheetName)` - Processes CSS style rules
- `processCSSVariableRule(rule, variables, sheetName)` - Processes CSS variable rules

### Browser & Environment
- `usingChromeBrowser()` - Detects Chrome browser
- `determineScrollBarWidth()` - Calculates scrollbar width
- `getScrollBarWidth()` - Gets scrollbar width
- `myConsoleLog(message)` - Custom console logging

### File & Download
- `download(filename, text)` - Downloads text as file

### Side Panel Management
- `openSidePanel(theSelector)` - Opens side panel
- `revealSidePanel(item_type, selector, layoutElementName)` - Reveals side panel
- `initializeSidePanelSection(sectionSelector, layoutElementName)` - Initializes side panel sections

### History & State
- `saveHistoryStep()` - Saves editor history step (debounced)
- `setEditorPreference(option_name, option_value)` - Sets editor preferences

### API & Services
- `getServiceApiKey(serviceName)` - Gets API keys for services
- `pingServerWhileEditing()` - Pings server during editing

### UI Kit & Templates
- `loadUIKit(url, uikitName, uikitIcon, targetSelector, isFallback)` - Loads UI kits
- `initialize_content_building()` - Initializes content building

### Utilities
- `arrayColumn(array, columnName)` - Extracts column from array
- `render(props)` - Generic render function
- `lcRandomUUID()` - Generates random UUID
- `sleep(milliseconds)` - Async sleep function

### SVG & Code Editing
- `autoCollapseAllSVGs(editor)` - Auto-collapses SVG content in editor
- `getSvgContentRange(session, startRow)` - Gets SVG content range

### Image & Media
- `loadHtmlToImageInIframe(callback)` - Loads HTML to image conversion
- `initLazyPreviewObserver(theSelector)` - Initializes lazy loading observer
- `sanitizeContainerImages(container)` - Sanitizes image URLs in container

### Event Handling
- `handleKeyboardEvents(e)` - Handles keyboard events for editor

## Main Editor Functions (editor.js)

### Core Editor Functions
- `replaceSelectorWithHtmlAndUpdatePreview(selector, new_html)` - Replaces HTML and updates preview
- `getFontLoadingStyle()` - Gets font loading styles
- `cleanTextToSearch(str)` - Cleans text for search
- `loadURLintoEditor(url)` - Loads URL into editor
- `loadStarterintoEditor(url, selector)` - Loads starter content

## Window-Level Utilities Already Available
- `window.lcMainStore` - Main store for editor state
- `window.htmlToImage` - HTML to image conversion utility

## Critical Functions for Element Tools Integration

### Element Selection & Manipulation
1. `CSSelector(el)` - MUST work exactly the same for element identification
2. `getPageHTML(selector)` / `setPageHTML(selector, newValue)` - Core content manipulation
3. `getAttributeValue(selector, attribute_name)` / `setAttributeValue(selector, attribute_name, newValue)` - Attribute management
4. `updatePreview()` / `updatePreviewSectorial(selector)` - Preview updates

### Element Information
5. `getLayoutElementType(theSelector)` - Element type detection
6. `getHtmlElementType(theSelector)` - HTML element type detection
7. `getComputedPropertyForClass(className, cssProperty)` - Style computation

### Content Processing
8. `filterPreviewHTML(input)` - HTML filtering
9. `sanitize_editable_rich(input)` - Content sanitization
10. `code_needs_hard_refresh(new_html)` - Refresh detection

## Dependencies & Requirements
- jQuery (`$`) - Primary DOM manipulation library  
- ACE Editor (`lc_html_editor`, `lc_css_editor`, `lc_js_editor`) - Code editors
- `previewiframe` - Preview iframe reference
- `lcMainStore` - Global state management
- Various global variables for editor state

## Integration Points
- All functions must work with the existing `previewiframe` context
- Functions must maintain compatibility with LiveCanvas's DOM structure
- Event handling must not conflict with existing LiveCanvas events
- State management must work alongside `lcMainStore`