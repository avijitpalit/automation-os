<?php
/**
 * REST API Controller for Node Schemas.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class API_Node_Schema_Controller {

	protected $namespace = 'automation-os/v1';
	protected $rest_base = 'node-schemas';

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'permissions_check' ),
			),
		));
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_schema( $request ) {
		// fetch schema logic here
		return 'dummy schema';
	}
}