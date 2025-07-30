# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL REQUIREMENT: Always Rebuild After Changes

**MANDATORY PROCESS:**
1. Make code changes
2. **IMMEDIATELY run `npm run build`**
3. Verify build success before testing
4. **Changes are NOT active until rebuilt**

### Why This Matters
- This is a WordPress plugin with a Vite build process
- Code changes only take effect after building
- Users will see old behavior until rebuild
- Must rebuild every time you modify any file

### Build Command
```bash
npm run build
```

### Successful Build Indicators
- ✓ modules transformed
- ✓ chunks rendered  
- ✓ gzip sizes calculated
- ✓ built in X.XXs

---

## Project Overview

LC Element Tools v2.0 is a WordPress plugin that provides a React-based element editing interface for the LC-Blocksy stack. It integrates with LiveCanvas visual page builder to enable real-time HTML and CSS class editing through a modern UI built with ShadCN UI components.

## Commands

### Development Commands
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Preview production build
npm run preview
```

### WordPress Integration
The plugin automatically loads built assets from `dist/` directory when activated in WordPress. No separate server needed for production.

## Architecture

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: ShadCN UI components with Radix UI primitives
- **Styling**: Tailwind CSS 3 with CSS custom properties
- **Build System**: Vite with IIFE output format for WordPress compatibility
- **Backend**: WordPress plugin architecture with PHP classes

### Key Integration Points

#### LiveCanvas DOM Management
The plugin integrates with LiveCanvas editor by using the same DOM manipulation methods found in `/Users/broke/DevKinsta/public/lc-blocksy/wp-content/plugins/livecanvas/editor/functions.js`:

- `getPageHTML(selector)` - Get inner HTML of elements
- `setPageHTML(selector, newValue)` - Set inner HTML of elements  
- `getPageHTMLOuter(selector)` - Get outer HTML of elements
- `setPageHTMLOuter(selector, newValue)` - Set outer HTML of elements
- `updatePreview()` - Refresh entire preview
- `updatePreviewSectorial(selector)` - Update specific sections

#### WordPress Hook Integration
- **Hook**: `lc_editor_header` - Injects React app into LiveCanvas editor
- **Permissions**: Requires `edit_posts` capability
- **Mount Point**: `#lc-element-tools-widget` div element
- **Global Object**: `window.LCElementTools` for initialization

### File Structure
```
lc-element-tools/
├── src/
│   ├── components/
│   │   ├── ui/           # ShadCN UI components (button, card, input, etc.)
│   │   ├── editor/       # Monaco editor components
│   │   └── element-tools/ # Main app components
│   ├── hooks/            # React hooks (useElementSelector, etc.)
│   ├── lib/              # Utilities (cn function, etc.)
│   ├── types/            # TypeScript type definitions
│   └── main.tsx          # Entry point, exports window.LCElementTools
├── includes/
│   ├── class-element-tools.php      # Core plugin functionality
│   └── class-frontend-injector.php  # Asset loading and injection
├── dist/                 # Build output (auto-generated)
├── lc-element-tools.php  # Main WordPress plugin file
└── package.json          # Dependencies and scripts
```

### Component Architecture
- **ElementToolsApp**: Main application container with element selection logic
- **ElementToolsPanel**: UI panel for editing selected elements
- **AttributesEditor**: Interface for CSS class management
- **MonacoEditor**: HTML content editor with syntax highlighting

## MCP Tool Usage Guidelines

Use these MCP tools in the following lifecycle order for optimal development:

### 1. Research & Documentation Phase
- **Context7 MCP**: Use `/upstash/context7` for accessing up-to-date documentation on React, TypeScript, Tailwind CSS, and WordPress APIs
- **Ref Tools MCP**: Search for specific implementation patterns and best practices

### 2. UI Development Phase  
- **ShadCN MCP**: Access the complete library of 46+ components (accordion, button, card, dialog, etc.)
  - Use `get_component` for source code
  - Use `get_component_demo` for usage examples
  - Use `list_components` to see all available components

### 3. Testing & Quality Assurance Phase
- **Playwright MCP**: Automate browser testing for WordPress admin integration
  - Test element selection functionality
  - Verify modal interactions
  - Test cross-browser compatibility
  - Validate LiveCanvas editor integration

### 4. Integration Testing Phase
- **Playwright MCP**: Test full WordPress + LiveCanvas workflow
  - Login sequences
  - Plugin activation
  - Editor interface interactions
  - Element manipulation workflows

## Development Guidelines

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Path aliases configured for clean imports (`@/components`, `@/lib`, etc.)
- Target ES2020 with DOM libraries included

### Build Process
- Vite builds to IIFE format for WordPress compatibility
- React/ReactDOM externalized (loaded via WordPress CDN)
- CSS extracted to separate file for WordPress asset loading
- Bundle size optimized (36KB JS + 22KB CSS)

### WordPress Integration Patterns
- Use WordPress hooks for initialization (`lc_editor_header`)
- Implement proper capability checks (`current_user_can('edit_posts')`)
- Use WordPress nonces for AJAX security
- Follow WordPress coding standards for PHP components

### LiveCanvas Integration Requirements
- Use existing DOM manipulation functions from LiveCanvas
- Maintain compatibility with iframe-based editor structure
- Implement proper element selection without interfering with LiveCanvas functionality
- Use same global variables (`doc`, `previewFrame`, `previewiframe`)

### ShadCN UI Implementation
- Components are pre-configured with Tailwind CSS custom properties
- Use the `cn()` utility function for conditional class names
- Customize themes through CSS custom properties in `src/globals.css`
- Import components from `@/components/ui/` directory

## Security Considerations
- All user inputs sanitized with `wp_kses_post()`
- AJAX requests protected with WordPress nonces
- Capability checks enforced for all operations
- XSS protection implemented for HTML content editing

## Development Reminders
- Always run build after significant changes.