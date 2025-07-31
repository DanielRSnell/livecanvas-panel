<?php
/**
 * Simple Timber/Twig Integration for LiveCanvas
 * 
 * @package LC_Element_Tools
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize Timber integration
 */
function lc_timber_init() {
    // Load Composer dependencies
    $autoload_file = LC_ELEMENT_TOOLS_PATH . 'vendor/autoload.php';
    if (file_exists($autoload_file)) {
        require_once $autoload_file;
    }
    
    // Initialize Timber
    if (class_exists('Timber\\Timber')) {
        Timber\Timber::init();
        
        // Register the shortcode
        add_shortcode('timber', 'lc_timber_shortcode');
        
        // Debug: Log that shortcode was registered
        if (WP_DEBUG) {
            error_log('LC Element Tools: Timber shortcode registered');
        }
    } else {
        // Debug: Log that Timber is not available
        if (WP_DEBUG) {
            error_log('LC Element Tools: Timber class not found');
        }
    }
}

/**
 * Timber shortcode handler
 */
function lc_timber_shortcode($atts, $content = '') {
    // Debug: Log that shortcode was called
    if (WP_DEBUG) {
        error_log('LC Element Tools: Timber shortcode called with content: ' . $content);
    }
    
    // Check if Timber is available
    if (!class_exists('Timber\\Timber')) {
        return WP_DEBUG ? '<div class="timber-error">Timber not available</div>' : '';
    }

    // Use content as template, fallback to default
    $template = $content ?: '{{ post.title }}';

    try {
        // Get Timber context and compile
        $context = Timber::context();
        $output = Timber::compile_string($template, $context);
        
        // Debug: Log successful render
        if (WP_DEBUG) {
            error_log('LC Element Tools: Timber rendered successfully');
        }
        
        return $output;
        
    } catch (Exception $e) {
        if (WP_DEBUG) {
            error_log('LC Element Tools: Timber Error: ' . $e->getMessage());
        }
        return WP_DEBUG ? '<div class="timber-error">Timber Error: ' . esc_html($e->getMessage()) . '</div>' : '';
    }
}

// Initialize immediately when file is loaded
lc_timber_init();

// Test function to verify shortcode registration
function lc_timber_test_shortcode_registration() {
    global $shortcode_tags;
    if (WP_DEBUG) {
        $is_registered = isset($shortcode_tags['timber']);
        error_log('LC Element Tools: Timber shortcode registered: ' . ($is_registered ? 'YES' : 'NO'));
        if ($is_registered) {
            error_log('LC Element Tools: Timber shortcode handler: ' . print_r($shortcode_tags['timber'], true));
        }
    }
}

// Check shortcode registration after init
add_action('init', 'lc_timber_test_shortcode_registration', 999);