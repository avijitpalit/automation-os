<?php
/**
 * REST API Controller for Node Output Schemas.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class API_Node_Output_Schema_Controller {

	protected $namespace = 'automation-os/v1';
	protected $rest_base = 'output-schema';

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<type>[\w-]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_schema' ),
				'permission_callback' => array( $this, 'permissions_check' ),
			),
		));
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_schema( $request ) {
		$type = sanitize_key( $request['type'] );

		if ( empty( $type ) ) {
			return new WP_Error( 'rest_invalid_type', 'Invalid schema type parameter.', array( 'status' => 400 ) );
		}

		$schema_dir = AOS_PLUGIN_DIR . 'output_schema/';
		$file_path  = $schema_dir . $type . '.json';

		// If the JSON file doesn't exist, allow dynamic WP filter fallback before returning empty
		if ( ! file_exists( $file_path ) ) {
			$default_schema = apply_filters( "aos_node_output_schema_{$type}", array(), $type );
			return rest_ensure_response( $default_schema );
		}

		$json_content = file_get_contents( $file_path );
		if ( false === $json_content ) {
			return new WP_Error( 'rest_schema_read_failure', 'Unable to open output schema configuration file.', array( 'status' => 500 ) );
		}

		$schema_data = json_decode( $json_content, true );
		if ( null === $schema_data && json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_Error( 'rest_invalid_json', 'The output schema storage file contains corrupted JSON format.', array( 'status' => 500 ) );
		}

		/**
		 * Filter the node output schema data.
		 * 
		 * Example usage to add custom ACF field dynamically:
		 * add_filter('aos_node_output_schema_wordpress', function($schema) {
		 *     $schema['post_published'][] = [
		 *         'key' => 'acf_subtitle',
		 *         'label' => 'ACF Subtitle',
		 *         'type' => 'string',
		 *         'example' => 'Subtitle text'
		 *     ];
		 *     return $schema;
		 * });
		 */
		$schema_data = apply_filters( "aos_node_output_schema_{$type}", $schema_data, $type );
		$schema_data = apply_filters( 'aos_node_output_schema', $schema_data, $type );

		return rest_ensure_response( $schema_data );
	}
}