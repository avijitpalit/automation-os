<?

if (!defined('ABSPATH')) exit;

class Workflow_Engine {
    public function __construct() {
        add_action('transition_post_status', [$this, 'on_post_published'], 10, 3);
    }
    
    public function on_post_published($new_status, $old_status, $post) {
        if ($new_status !== 'publish' || $old_status === 'publish' || $post->post_type !== 'post') return;

        $payload = [
			'post_id'      => $post->ID,
			'post_title'   => $post->post_title,
			'post_content' => $post->post_content,
			'author_id'    => $post->post_author,
			'created_at'   => $post->post_date,
        ];

        $this->run_workflows_for_trigger('post_created', $payload);
    }

    private function run_workflows_for_trigger($trigger_type, $payload) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'aos_workflows';

        $workflows = $wpdb->get_results("SELECT * FROM {$table_name} WHERE is_active = 1");
        if (empty($workflows)) return;

        foreach ($workflows as $wf) {
            $nodes = json_decode($wf->nodes, true) ?: [];
            $edges = json_decode($wf->edges, true) ?: [];
            if (empty($nodes)) continue;
            $trigger_node = $this->find_matching_trigger_node($nodes, $trigger_type);
            if ($trigger_node) $this->traverse_and_execute($trigger_node['id'], $nodes, $edges, $payload, $wf->id);
        }
    }

    private function find_matching_trigger_node($nodes, $target_trigger_type) {
        foreach ( $nodes as $node ) {
			if ( 'wordpress' === $node['type'] ) {
				// Check inside the configuration data saved from your React canvas
				$node_trigger = isset( $node['data']['trigger_type'] ) ? $node['data']['trigger_type'] : '';

				// Default fallback check for post created
				if ( 'post_created' === $node_trigger || 'post_created' === $target_trigger_type ) {
					return $node;
				}
			}
		}
		return null;
    }

    private function traverse_and_execute( $current_node_id, $nodes, $edges, $payload, $workflow_id ) {
		$outgoing_edges = array_filter( $edges, function( $edge ) use ( $current_node_id ) {
			return $edge['source'] === $current_node_id;
		} );

		foreach ( $outgoing_edges as $edge ) {
			$target_node_id = $edge['target'];

			$target_node = array_values( array_filter( $nodes, function( $node ) use ( $target_node_id ) {
				return $node['id'] === $target_node_id;
			} ) );

			if ( ! empty( $target_node ) ) {
				$node = $target_node[0];
				$this->execute_node_action( $node, $payload, $workflow_id );
				$this->traverse_and_execute( $node['id'], $nodes, $edges, $payload, $workflow_id );
			}
		}
	}

    private function execute_node_action( $node, $payload, $workflow_id ) {
		$node_type = $node['type'];

		$log_entry = sprintf(
			'Workflow #%d executed Node "%s" (%s) for Post ID: %d ("%s")',
			$workflow_id,
			$node['title'],
			$node_type,
			$payload['post_id'],
			$payload['post_title']
		);

		// 1. Log to server error log
		error_log( 'WORKFLOW SUCCESS: ' . $log_entry );

		// 2. Save execution log entry to WordPress options for easy debugging
		/*$logs   = get_option( 'aos_execution_logs', array() );
		$logs[] = array(
			'time'        => current_time( 'mysql' ),
			'workflow_id' => $workflow_id,
			'node'        => $node['title'],
			'node_type'   => $node_type,
			'post_id'     => $payload['post_id'],
			'post_title'  => $payload['post_title'],
		);
		update_option( 'aos_execution_logs', array_slice( $logs, -20 ) );*/ // Keep last 20 logs

		// Handle specific actions (e.g. Google Sheets, Email, etc.)
		switch ( $node_type ) {
			case 'google-sheets':
				// Future implementation: Add row via Google Sheets API
				break;
			case 'email':
				// Future implementation: wp_mail()
				break;
		}
	}
}

new Workflow_Engine();