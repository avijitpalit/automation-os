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


/**
 * Create the custom database table for workflows on plugin activation.
 */
function aos_create_database_table() {
	global $wpdb;
	$table_name = $wpdb->prefix . 'aos_workflows';
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $table_name (
		id bigint(20) NOT NULL AUTO_INCREMENT,
		title varchar(255) NOT NULL,
		description text DEFAULT '',
		is_active tinyint(1) DEFAULT 0 NOT NULL,
		nodes longtext NOT NULL,
		edges longtext NOT NULL,
		created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
		PRIMARY KEY  (id)
	) $charset_collate;";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( $sql );
}
register_activation_hook( AOS_PLUGIN_FILE, 'aos_create_database_table' );

/**
 * Register custom REST API routes for managing workflows.
 */
function aos_register_rest_routes() {
	register_rest_route( 'automation-os/v1', '/workflows', array(
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'aos_get_workflows_handler',
			'permission_callback' => 'aos_rest_permission_check',
		),
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'aos_save_workflow_handler',
			'permission_callback' => 'aos_rest_permission_check',
		),
	));

	register_rest_route( 'automation-os/v1', '/workflows/(?P<id>\d+)', array(
		array(
			'methods'             => WP_REST_Server::DELETABLE,
			'callback'            => 'aos_delete_workflow_handler',
			'permission_callback' => 'aos_rest_permission_check',
		),
	));
}
add_action( 'rest_api_init', 'aos_register_rest_routes' );

/**
 * Enforce administrator access control for the endpoints.
 */
function aos_rest_permission_check() {
	return current_user_can( 'manage_options' );
}

/**
 * GET Handler: Retrieve all records from our custom table.
 */
function aos_get_workflows_handler() {
	global $wpdb;
	$table_name = $wpdb->prefix . 'aos_workflows';
	
	$results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY updated_at DESC", ARRAY_A );
	
	// Convert flat DB text data formats back into live arrays/objects for React
	foreach ( $results as &$row ) {
		$row['id']        = intval( $row['id'] );
		$row['isActive']  = (intval( $row['is_active'] ) === 1);
		$row['nodes']     = json_decode( $row['nodes'], true ) ?: array();
		$row['edges']     = json_decode( $row['edges'], true ) ?: array();
		unset( $row['is_active'] ); // Cleanup property shape to match React frontend structure
	}
	
	return rest_ensure_response( $results );
}

/**
 * POST Handler: Insert or Update a workflow record.
 */
function aos_save_workflow_handler( $request ) {
	global $wpdb;
	$table_name = $wpdb->prefix . 'aos_workflows';
	
	$id          = $request->get_param( 'id' );
	$title       = sanitize_text_field( $request->get_param( 'title' ) );
	$description = sanitize_textarea_field( $request->get_param( 'description' ) );
	$is_active   = $request->get_param( 'isActive' ) ? 1 : 0;
	
	// We preserve the JSON structural strings as arrays to safely store via longtext columns
	$nodes = wp_json_encode( $request->get_param( 'nodes' ) ?: array() );
	$edges = wp_json_encode( $request->get_param( 'edges' ) ?: array() );

	$data = array(
		'title'       => $title,
		'description' => $description,
		'is_active'   => $is_active,
		'nodes'       => $nodes,
		'edges'       => $edges,
	);

	if ( ! empty( $id ) ) {
		// Update existing record
		$wpdb->update( $table_name, $data, array( 'id' => $id ) );
	} else {
		// Create brand new workspace row
		$wpdb->insert( $table_name, $data );
		$id = $wpdb->insert_id;
	}

	return rest_ensure_response( array( 'success' => true, 'id' => $id ) );
}

/**
 * DELETE Handler: Remove a specific row by its unique ID.
 */
function aos_delete_workflow_handler( $request ) {
	global $wpdb;
	$table_name = $wpdb->prefix . 'aos_workflows';
	$id = intval( $request['id'] );

	$deleted = $wpdb->delete( $table_name, array( 'id' => $id ) );
	
	return rest_ensure_response( array( 'success' => (bool) $deleted ) );
}