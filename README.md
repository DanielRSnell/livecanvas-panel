# LC Element Tools v2.0

A modern React-based element editing tool for the LC-Blocksy stack, rebuilt with React, Vite, and ShadCN UI components.

## Features

- **CMD+Click Element Selection**: Hold CMD/Ctrl and click any element to select it for editing
- **Fixed Bottom-Left Interface**: Clean, non-modal interface positioned at bottom-left of screen
- **Real-time Class Management**: Edit CSS classes with live preview
- **HTML Editor**: Edit element HTML content with syntax highlighting
- **Modern UI**: Built with ShadCN UI components and Tailwind CSS
- **Smooth Animations**: Framer Motion powered transitions
- **TypeScript**: Full type safety and developer experience

## Installation

1. Upload the `lc-element-tools` folder to `/wp-content/plugins/`
2. Activate the plugin through the WordPress admin
3. The plugin will automatically load on frontend pages for users with edit capabilities

## Usage

### Element Selection
1. Visit any frontend page while logged in with edit capabilities
2. Hold CMD (Mac) or Ctrl (Windows/Linux)
3. Click on any element you want to edit
4. The element tools modal will open

### Editing Classes
1. Select an element using CMD+Click
2. In the modal, stay on the "CSS Classes" tab
3. Add or modify CSS classes (space-separated)
4. Click "Save Changes" to apply

### Editing HTML
1. Select an element using CMD+Click
2. Switch to the "HTML Editor" tab
3. Modify the HTML content
4. Click "Save Changes" to apply

### Keyboard Shortcuts
- **Escape**: Close modal and deselect element
- **CMD/Ctrl + Enter**: Save changes
- **CMD/Ctrl + Click**: Select element

## Technical Details

### File Structure
```
lc-element-tools/
├── lc-element-tools.php (main plugin file)
├── assets/
│   ├── js/
│   │   ├── element-selector.js (CMD+Click detection)
│   │   └── modal-interface.js (modal UI)
│   └── css/
│       └── element-tools.css (styling)
├── includes/
│   ├── class-element-tools.php (core functionality)
│   └── class-frontend-injector.php (interface injection)
└── README.md
```

### Requirements
- WordPress 5.0+
- PHP 7.4+
- jQuery (included with WordPress)
- User must have `edit_posts` capability

### Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development

This plugin is designed for the LC-Blocksy Boilerplate stack and integrates with:
- Livecanvas visual page builder
- Blocksy theme
- Windpress Tailwind integration

### Week 1 Implementation
- ✅ Basic plugin structure
- ✅ CMD+Click element selection
- ✅ Modal interface for classes and HTML editing
- ✅ Visual feedback and indicators
- ✅ WordPress integration and security

### Future Enhancements
- Element data persistence
- Undo/redo functionality
- More advanced HTML editing
- Integration with Livecanvas components
- Bulk editing capabilities

## Security

- All AJAX requests use WordPress nonces
- User capability checks (`edit_posts`)
- Input sanitization and validation
- XSS protection with `wp_kses_post()`

## Changelog

### 1.0.0
- Initial release
- CMD+Click element selection
- Basic classes and HTML editing
- Modal interface
- Visual feedback system

## Author

Matt (WordPress Plugin Engineer) - LC-Blocksy Boilerplate Project