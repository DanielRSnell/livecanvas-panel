# Editable Region Assignment Process

## Overview

The Editable Region Assignment feature automatically assigns `editable="inline"` attributes to text elements within the LiveCanvas main content area (`#lc-main`). This enables inline editing capabilities for appropriate elements while maintaining document structure integrity.

## Process Flow

### 1. Activation
- User clicks the "Editable" toggle button in the HTML editor toolbar
- System retrieves all innerHTML from `#lc-main`
- Parsing and assignment process begins

### 2. Element Classification

#### Target Elements (Inline Text Elements)
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6` - Headings
- `p` - Paragraphs  
- `span` - Inline spans
- `li` - List items

#### Assignment Criteria
An element receives `editable="inline"` if:
- It contains **only text content** (no child elements)
- It is one of the target element types listed above

### 3. Mixed Content Handling

#### Problem Scenario
```html
<h1>Main Title <span>with emphasis</span></h1>
```

#### Detection Process
1. **Check for child elements**: If target element contains both text and child elements
2. **Identify orphan text**: Text nodes that are direct children (not wrapped in elements)
3. **Flag for special handling**: Element marked for mixed content processing

#### Resolution Strategy
```html
<!-- Before -->
<h1>Main Title <span>with emphasis</span></h1>

<!-- After Processing -->
<h1><span editable="inline">Main Title </span><span editable="inline">with emphasis</span></h1>
```

**Steps:**
1. Wrap orphan text in `<span>` with `editable="inline"`
2. Apply `editable="inline"` to existing child elements (if they're target types)
3. Do **not** apply `editable="inline"` to the parent wrapper element

### 4. Processing Algorithm

#### Phase 1: Element Discovery
```javascript
const targetSelectors = 'h1, h2, h3, h4, h5, h6, p, span, li';
const elements = document.querySelectorAll('#lc-main ' + targetSelectors);
```

#### Phase 2: Content Analysis
For each element:
1. **Check if already processed** (has `editable` attribute)
2. **Analyze child nodes**:
   - Count text nodes
   - Count element nodes
   - Identify content type

#### Phase 3: Assignment Logic
```javascript
if (hasOnlyTextContent) {
    element.setAttribute('editable', 'inline');
} else if (hasMixedContent) {
    processMixedContent(element);
} else {
    // Skip - contains only child elements
}
```

#### Phase 4: Mixed Content Processing
```javascript
function processMixedContent(element) {
    const childNodes = Array.from(element.childNodes);
    
    childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            // Wrap orphan text
            const span = document.createElement('span');
            span.setAttribute('editable', 'inline');
            span.textContent = node.textContent;
            element.replaceChild(span, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && isTargetElement(node)) {
            // Apply to existing child elements
            if (hasOnlyTextContent(node)) {
                node.setAttribute('editable', 'inline');
            }
        }
    });
}
```

## Examples

### Simple Cases

#### Valid Assignment
```html
<!-- Before -->
<h1>Simple Title</h1>
<p>Simple paragraph text.</p>

<!-- After -->
<h1 editable="inline">Simple Title</h1>
<p editable="inline">Simple paragraph text.</p>
```

#### No Assignment (Contains Elements)
```html
<!-- Before & After (unchanged) -->
<div>
    <h2>Subtitle</h2>
    <p>Content here</p>
</div>
```

### Complex Cases

#### Mixed Content Resolution
```html
<!-- Before -->
<h2>Chapter Title <em>emphasized</em> and more text</h2>

<!-- After -->
<h2>
    <span editable="inline">Chapter Title </span>
    <em editable="inline">emphasized</em>
    <span editable="inline"> and more text</span>
</h2>
```

#### Nested List Processing
```html
<!-- Before -->
<ul>
    <li>Simple item</li>
    <li>Item with <strong>bold</strong> text</li>
</ul>

<!-- After -->
<ul>
    <li editable="inline">Simple item</li>
    <li>
        <span editable="inline">Item with </span>
        <strong editable="inline">bold</strong>
        <span editable="inline"> text</span>
    </li>
</ul>
```

## Implementation Considerations

### Performance
- Process elements in document order
- Use DocumentFragment for batch DOM modifications
- Minimize reflows by batching attribute assignments

### Preservation
- Maintain existing attributes and classes
- Preserve whitespace and formatting
- Keep original element structure where possible

### Edge Cases
- Empty elements (skip assignment)
- Elements with only whitespace (skip assignment)
- Deeply nested structures (recursive processing)
- Elements with existing `editable` attributes (preserve/skip)

### Reversibility
- Store original state for undo functionality
- Track modifications for toggle off behavior
- Maintain element relationships

## UI Integration

### Toolbar Button
- **Label**: "Editable"
- **Type**: Toggle button
- **Tooltip**: "Enable inline editing for text elements"
- **Icon**: Edit/pencil icon
- **State**: On/Off with visual feedback

### Visual Feedback
- Highlight elements with `editable="inline"` attributes
- Show processing progress for large documents
- Display count of modified elements

## Error Handling

### Common Issues
1. **Invalid HTML structure**: Skip malformed elements
2. **Permission errors**: Check element mutability
3. **Large documents**: Implement progressive processing
4. **Conflicting attributes**: Preserve existing `contenteditable` settings

### Fallback Behavior
- Continue processing remaining elements if one fails
- Log errors without breaking the overall process
- Provide user feedback for partial failures