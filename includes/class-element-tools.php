<?php
/**
 * LC Element Tools Core Class
 * 
 * Handles core functionality for element selection and editing
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class LC_Element_Tools_Core {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('wp_head', [$this, 'add_frontend_styles']);
        add_filter('body_class', [$this, 'add_body_classes']);
    }
    
    /**
     * Add frontend styles for element tools
     */
    public function add_frontend_styles() {
        if (!current_user_can('edit_posts') || is_admin()) {
            return;
        }
        
        ?>
        <style id="lc-element-tools-inline">
            /* Element selection highlighting */
            .lc-element-hover {
                outline: 2px dashed #007cba !important;
                outline-offset: 2px !important;
                cursor: pointer !important;
                position: relative !important;
            }
            
            .lc-element-selected {
                outline: 2px solid #00a0d2 !important;
                outline-offset: 2px !important;
                background: rgba(0, 160, 210, 0.1) !important;
            }
            
            /* Selection indicator */
            .lc-element-indicator {
                position: absolute;
                top: -30px;
                left: 0;
                background: #007cba;
                color: white;
                padding: 4px 8px;
                font-size: 12px;
                border-radius: 3px;
                z-index: 9999;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .lc-element-indicator:before {
                content: '';
                position: absolute;
                top: 100%;
                left: 10px;
                border: 5px solid transparent;
                border-top-color: #007cba;
            }
        </style>
        <?php
    }
    
    /**
     * Add body classes for element tools
     */
    public function add_body_classes($classes) {
        if (current_user_can('edit_posts') && !is_admin()) {
            $classes[] = 'lc-element-tools-active';
        }
        return $classes;
    }
    
    /**
     * Get element data
     */
    public function get_element_data($element_id) {
        // This would retrieve stored element data
        // For now, return empty data structure
        return [
            'classes' => '',
            'html' => '',
            'meta' => []
        ];
    }
    
    /**
     * Save element data
     */
    public function save_element_data($element_id, $data) {
        // This would save element data to database
        // Implementation depends on storage strategy
        return true;
    }
    
    /**
     * Generate unique element ID
     */
    public function generate_element_id($element) {
        // Generate a unique ID for element tracking
        return 'lc-element-' . md5($element . time());
    }
    
    /**
     * Validate element data
     */
    public function validate_element_data($data) {
        $validated = [];
        
        // Validate classes
        if (isset($data['classes'])) {
            $validated['classes'] = sanitize_text_field($data['classes']);
        }
        
        // Validate HTML
        if (isset($data['html'])) {
            $validated['html'] = wp_kses_post($data['html']);
        }
        
        // Validate meta
        if (isset($data['meta']) && is_array($data['meta'])) {
            $validated['meta'] = array_map('sanitize_text_field', $data['meta']);
        }
        
        return $validated;
    }
}