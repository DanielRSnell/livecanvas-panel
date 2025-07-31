<?php
/**
 * Plugin Name: LC Element Tools
 * Plugin URI: https://livecanvas.com
 * Description: Simple element selection with classes manager and HTML editor for LC-Blocksy stack
 * Version: 2.0.1
 * Author: Matt (WordPress Plugin Engineer)
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Text Domain: lc-element-tools
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('LC_ELEMENT_TOOLS_VERSION', '2.0.1');
define('LC_ELEMENT_TOOLS_PATH', plugin_dir_path(__FILE__));
define('LC_ELEMENT_TOOLS_URL', plugin_dir_url(__FILE__));
define('LC_ELEMENT_TOOLS_BASENAME', plugin_basename(__FILE__));

/**
 * Main LC Element Tools Plugin Class
 */
class LC_Element_Tools {
    
    /**
     * Plugin instance
     * @var LC_Element_Tools
     */
    private static $instance = null;
    
    /**
     * Get plugin instance
     * @return LC_Element_Tools
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action('lc_editor_header', [$this, 'add_livecanvas_elements']);
        add_action('plugins_loaded', [$this, 'load_timber_integration']);
    }
    
    /**
     * Load Timber integration if available
     */
    public function load_timber_integration() {
        // $timber_integration_file = LC_ELEMENT_TOOLS_PATH . 'includes/timber/timber-integration.php';
        
        // if (file_exists($timber_integration_file)) {
        //     require_once $timber_integration_file;
        // }
    }
    
    /**
     * Add elements to Livecanvas editor header - Built React + Tailwind 4 Pattern
     */
    public function add_livecanvas_elements() {
        // Only load if user has edit capabilities
        if (!current_user_can('edit_posts')) {
            return;
        }
        
        // Load React and ReactDOM from CDN for compatibility
        echo '<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>';
        echo '<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>';
        
        // Load built CSS from Vite
        $css_path = LC_ELEMENT_TOOLS_PATH . 'dist/style.css';
        if (file_exists($css_path)) {
            $css_url = LC_ELEMENT_TOOLS_URL . 'dist/style.css?ver=' . LC_ELEMENT_TOOLS_VERSION . '&t=' . time();
            echo '<link rel="stylesheet" href="' . esc_url($css_url) . '" type="text/css" id="lc-element-tools-css" />' . PHP_EOL;
        }
        
        // The mounting div for our React app
        echo '<div id="lc-element-tools-widget"></div>';
        
        // Load built JavaScript from Vite
        $js_path = LC_ELEMENT_TOOLS_PATH . 'dist/lc-element-tools.iife.js';
        if (file_exists($js_path)) {
            $js_url = LC_ELEMENT_TOOLS_URL . 'dist/lc-element-tools.iife.js?ver=' . LC_ELEMENT_TOOLS_VERSION . '&t=' . time();
            echo '<script src="' . esc_url($js_url) . '"></script>' . PHP_EOL;
            echo '<script>window.LCElementTools && window.LCElementTools.init && window.LCElementTools.init();</script>' . PHP_EOL;
        }
    }
}

// Initialize the plugin
LC_Element_Tools::get_instance();