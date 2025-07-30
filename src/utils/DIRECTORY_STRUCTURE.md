# Proposed Utils Directory Structure

## Overview
Organized structure for LiveCanvas utility functions broken down by functional context while maintaining exact compatibility.

## Directory Structure

```
src/utils/
├── core/
│   ├── dom.ts              # DOM manipulation utilities
│   ├── selectors.ts        # CSS selector generation and management
│   ├── elements.ts         # Element type detection and analysis
│   └── index.ts           # Core utilities barrel export
├── content/
│   ├── html.ts            # HTML content management
│   ├── attributes.ts      # Attribute manipulation
│   ├── sanitization.ts    # Content sanitization
│   ├── shortcodes.ts      # Shortcode processing
│   └── index.ts          # Content utilities barrel export
├── preview/
│   ├── updates.ts         # Preview update functions
│   ├── rendering.ts       # Content rendering
│   ├── enrichment.ts      # Preview enrichment functions
│   └── index.ts          # Preview utilities barrel export
├── styling/
│   ├── css.ts             # CSS management utilities
│   ├── classes.ts         # CSS class manipulation
│   ├── variables.ts       # CSS variable management
│   ├── computed.ts        # Computed style utilities
│   └── index.ts          # Styling utilities barrel export
├── performance/
│   ├── throttling.ts      # Debounce and throttle utilities
│   ├── observers.ts       # Intersection/mutation observers
│   └── index.ts          # Performance utilities barrel export
├── ui/
│   ├── panels.ts          # Side panel management
│   ├── dialogs.ts         # Modal and dialog utilities
│   ├── keyboard.ts        # Keyboard event handling
│   └── index.ts          # UI utilities barrel export
├── browser/
│   ├── detection.ts       # Browser detection utilities
│   ├── scrolling.ts       # Scroll management
│   ├── viewport.ts        # Viewport utilities
│   └── index.ts          # Browser utilities barrel export
├── data/
│   ├── storage.ts         # Local storage management
│   ├── history.ts         # Editor history management
│   ├── state.ts           # State management utilities
│   └── index.ts          # Data utilities barrel export
├── network/
│   ├── api.ts             # API communication
│   ├── services.ts        # External service integration
│   └── index.ts          # Network utilities barrel export
├── files/
│   ├── download.ts        # File download utilities
│   ├── upload.ts          # File upload utilities
│   ├── images.ts          # Image processing
│   └── index.ts          # File utilities barrel export
├── text/
│   ├── formatting.ts      # Text formatting utilities
│   ├── parsing.ts         # Text parsing functions
│   ├── generation.ts      # Text generation utilities
│   └── index.ts          # Text utilities barrel export
├── types/
│   ├── livecanvas.ts      # LiveCanvas-specific type definitions
│   ├── utilities.ts       # Utility function types
│   └── index.ts          # Types barrel export
├── window/
│   ├── bootstrap.ts       # Window utility bootstrapping
│   ├── registry.ts        # Function registry management
│   └── index.ts          # Window utilities barrel export
└── index.ts               # Main barrel export
```

## Function Organization by Category

### Core DOM & Selectors (`core/`)
- `CSSelector(el)` → `dom.ts`
- `getDistanceFromParent(el)` → `dom.ts`
- `prepareElement(html)` → `dom.ts`
- Element type detection functions → `elements.ts`

### Content Management (`content/`)
- `getPageHTML()`, `setPageHTML()` → `html.ts`
- `getAttributeValue()`, `setAttributeValue()` → `attributes.ts`
- `sanitize_editable_rich()` → `sanitization.ts`
- Shortcode functions → `shortcodes.ts`

### Preview & Rendering (`preview/`)
- `updatePreview()`, `updatePreviewSectorial()` → `updates.ts`
- `tryToEnrichPreview()`, `enrichPreview()` → `enrichment.ts`
- Dynamic content rendering → `rendering.ts`

### CSS & Styling (`styling/`)
- `getComputedPropertyForClass()` → `computed.ts`
- `getClassesMappedArray()` → `classes.ts`
- CSS variable functions → `variables.ts`

### Performance (`performance/`)
- `debounce()`, `throttle()` → `throttling.ts`
- Lazy loading observers → `observers.ts`

### UI Management (`ui/`)
- Side panel functions → `panels.ts`
- `handleKeyboardEvents()` → `keyboard.ts`

### Browser Utilities (`browser/`)
- `usingChromeBrowser()` → `detection.ts`
- Scrollbar functions → `scrolling.ts`

### Data & State (`data/`)
- `setEditorPreference()` → `storage.ts`
- `saveHistoryStep()` → `history.ts`
- State management → `state.ts`

### Network & Services (`network/`)
- `pingServerWhileEditing()` → `api.ts`
- `getServiceApiKey()` → `services.ts`

### File Operations (`files/`)
- `download()` → `download.ts`
- Image processing functions → `images.ts`

### Text Processing (`text/`)
- `capitalize()`, `generateReadableName()` → `formatting.ts`
- `lc_parseParams()`, URL parsing → `parsing.ts`

## Implementation Strategy

### Phase 1: Core Functions
Focus on the most critical functions needed for element tools:
1. `CSSelector` - Element identification
2. HTML manipulation functions
3. Attribute management functions
4. Preview update functions

### Phase 2: Content Management
5. Content sanitization
6. Dynamic content rendering
7. Shortcode processing

### Phase 3: Styling & UI
8. CSS utilities
9. UI management functions
10. Browser compatibility functions

### Phase 4: Advanced Features
11. Performance optimizations
12. File operations
13. Network utilities

## Window Registration Pattern

```typescript
// Bootstrap pattern for registering utilities on window
window.LCUtils = {
  core: {
    CSSelector: core.CSSelector,
    getDistanceFromParent: core.getDistanceFromParent,
    // ... other core functions
  },
  content: {
    getPageHTML: content.getPageHTML,
    setPageHTML: content.setPageHTML,
    // ... other content functions
  },
  // ... other categories
};
```

## Compatibility Requirements

### Must Maintain
- Exact function signatures
- Identical return values and types
- Same error handling behavior
- Compatible with existing jQuery patterns
- Works with current iframe setup

### Must Work With
- Existing `previewiframe` reference
- Current `lcMainStore` state management
- LiveCanvas DOM structure
- ACE editor instances
- Existing event handlers

## Testing Strategy
- Unit tests for each utility function
- Integration tests with LiveCanvas environment
- Regression tests against original functions
- Performance benchmarks
- Cross-browser compatibility tests