<?php
/**
 * REST API Controller for Node Schemas.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class API_Node_Schema_Controller {

	protected $namespace = 'automation-os/v1';
	protected $rest_base = 'node-schema';

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

        $schema_dir = AOS_PLUGIN_DIR . 'node_schema/';
        $file_path  = $schema_dir . $type . '.json';

        if ( ! file_exists( $file_path ) ) {
            return rest_ensure_response( array() );
        }

        $json_content = file_get_contents( $file_path );
        if ( false === $json_content ) {
            return new WP_Error( 'rest_schema_read_failure', 'Unable to open schema configuration file.', array( 'status' => 500 ) );
        }
    
		$schema_data = json_decode( $json_content, true );
        if ( null === $schema_data && json_last_error() !== JSON_ERROR_NONE ) {
            return new WP_Error( 'rest_invalid_json', 'The schema storage file contains corrupted JSON format.', array( 'status' => 500 ) );
        }

		return rest_ensure_response( $schema_data );
	}
}

/*function get_wordpress_node_schema() {
    return [
        [
            'key'    => 'trigger_type',
            'type'    => 'select',
            'label'   => 'Trigger Type',
            'options' => [
                [
                    'value' => 'post_created',
                    'label' => 'Post Created'
                ],
                [
                    'value'    => 'post_updated',
                    'label'    => 'Post Updated',
                    'children' => [
                        [
                            'key'    => 'any_or_specific',
                            'type'    => 'select',
                            'label'   => 'Any or Specific?',
                            'options' => [
                                [
                                    'value' => 'any',
                                    'label' => 'Any Post'
                                ],
                                [
                                    'value'    => 'specific',
                                    'label'    => 'Specific Post',
                                    'children' => [
                                        [
                                            'key'        => 'post_id_slug',
                                            'type'        => 'text',
                                            'label'       => 'Post ID or Slug',
                                            'placeholder' => 'Enter post ID or slug here...'
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],
                [
                    'value' => 'post_deleted',
                    'label' => 'Post Deleted'
                ]
            ]
        ]
    ];
}*/