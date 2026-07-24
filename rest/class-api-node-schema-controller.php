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
		// fetch schema logic here
		$type = sanitize_text_field( $request['type'] );
		switch ($type) {
			case 'wordpress': return rest_ensure_response(get_wordpress_node_schema()); break;
			default: return rest_ensure_response([]);
		}

		return $type;
	}
}

function get_wordpress_node_schema() {
    return [
        // 1. Base Trigger Type
        'trigger_type' => [
            'type'    => 'select',
            'label'   => 'Trigger type',
            'options' => [
                ['value' => 'post_created', 'label' => 'Post created'],
                ['value' => 'post_updated', 'label' => 'Post updated'],
                ['value' => 'post_deleted', 'label' => 'Post deleted'],
                ['value' => 'user_logged_in', 'label' => 'User logged in'],
            ],
        ],
        
        // 2. Post Target (Depends on 'post_updated')
        'post_target' => [
            'type'       => 'select',
            'label'      => 'Which post?',
            'options'    => [
                ['value' => 'any', 'label' => 'Any post'],
                ['value' => 'specific', 'label' => 'Specific post'],
            ],
            'depends_on' => [
                'field' => 'trigger_type',
                'operator' => '==',
                'value' => 'post_updated',
            ],
        ],
        
        // 3. Post ID Input (Depends on 'post_target' being 'specific')
        'post_id' => [
            'type'       => 'text',
            'label'      => 'Enter Post ID',
            'placeholder'=> 'e.g. 1045',
            'depends_on' => [
                'field' => 'post_target',
                'operator' => '==',
                'value' => 'specific',
            ],
        ],
        
        // 4. User Target (Depends on 'user_logged_in')
        'user_target' => [
            'type'       => 'select',
            'label'      => 'Which user?',
            'options'    => [
                ['value' => 'any', 'label' => 'Any user'],
                ['value' => 'specific', 'label' => 'Specific user'],
            ],
            'depends_on' => [
                'field' => 'trigger_type',
                'operator' => '==',
                'value' => 'user_logged_in',
            ],
        ],
        
        // 5. User Email Input (Depends on 'user_target' being 'specific')
        'user_email' => [
            'type'       => 'text',
            'label'      => 'Username or Email',
            'depends_on' => [
                'field' => 'user_target',
                'operator' => '==',
                'value' => 'specific',
            ],
        ]
    ];
}