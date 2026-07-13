<?php
/**
 * Plugin Name: Automation OS
 * Description: Automation OS admin page, powered by a Vite + React UI.
 * Version: 1.0.0
 * Author:
 * Text Domain: automation-os
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'AOS_PLUGIN_FILE', __FILE__ );
define( 'AOS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AOS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'AOS_VERSION', '1.0.0' );

/**
 * To use the Vite dev server (instant HMR while editing app/src),
 * add this to wp-config.php:
 *
 *     define( 'AOS_DEV_MODE', true );
 *
 * and run `npm run dev` inside automation-os/app.
 * Remove/set to false for normal/production use — that serves the
 * pre-built files in assets/build/ instead.
 */

/**
 * Register the admin menu page.
 */
function aos_register_admin_menu() {
	add_menu_page(
		__( 'Automation OS', 'automation-os' ),
		__( 'Automation OS', 'automation-os' ),
		'manage_options',
		'automation-os',
		'aos_render_admin_page',
		'dashicons-admin-generic',
		26
	);
}
add_action( 'admin_menu', 'aos_register_admin_menu' );

/**
 * Render the admin page container. React mounts into #automation-os-root.
 */
function aos_render_admin_page() {
	?>
	<style>
		#wpcontent {
			padding-left: 0 !important;
		}
		.rtl #wpcontent {
			padding-right: 0 !important;
		}
	</style>
	<div id="automation-os-root"></div>
	<?php
}

/**
 * Production: enqueue the built Vite/React assets on the plugin's admin page.
 * Skipped entirely while AOS_DEV_MODE is on (dev server handles it instead).
 */
function aos_enqueue_admin_assets( $hook ) {
	if ( 'toplevel_page_automation-os' !== $hook ) {
		return;
	}

	// If in development mode, skip loading built assets (Vite dev server handles it)
	if ( defined( 'AOS_DEV_MODE' ) && AOS_DEV_MODE ) {
		return;
	}

	$build_dir = AOS_PLUGIN_DIR . 'assets/build/';
	$build_url = AOS_PLUGIN_URL . 'assets/build/';

	$js_path  = $build_dir . 'main.js';
	$css_path = $build_dir . 'main.css';

	if ( file_exists( $js_path ) ) {
		wp_enqueue_script(
			'automation-os-app',
			$build_url . 'main.js',
			array(),
			filemtime( $js_path ),
			true
		);
	}

	if ( file_exists( $css_path ) ) {
		wp_enqueue_style(
			'automation-os-styles', // Change handle name to avoid conflicts with script tag definitions
			$build_url . 'main.css',
			array(),
			filemtime( $css_path )
		);
	}
}
add_action( 'admin_enqueue_scripts', 'aos_enqueue_admin_assets' );

/**
 * Dev mode: print Vite's required script tags directly, exactly as
 * https://vite.dev/guide/backend-integration.html specifies. Enables
 * instant HMR against the local `npm run dev` server instead of the
 * static build.
 */
function aos_print_dev_scripts( $hook ) {
	if ( 'toplevel_page_automation-os' !== $hook ) {
		return;
	}
	if ( ! defined( 'AOS_DEV_MODE' ) || ! AOS_DEV_MODE ) {
		return;
	}

	add_action(
		'admin_footer',
		function () {
			?>
			<script type="module">
				import RefreshRuntime from 'http://localhost:3000/@react-refresh'
				RefreshRuntime.injectIntoGlobalHook(window)
				window.$RefreshReg$ = () => {}
				window.$RefreshSig$ = () => (type) => type
				window.__vite_plugin_react_preamble_installed__ = true
			</script>
			<script type="module" src="http://localhost:3000/@vite/client"></script>
			<script type="module" src="http://localhost:3000/src/main.jsx"></script>
			<?php
		}
	);
}
add_action( 'admin_enqueue_scripts', 'aos_print_dev_scripts' );
