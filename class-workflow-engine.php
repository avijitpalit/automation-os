<?php

if (!defined('ABSPATH')) exit;

class Workflow_Engine {

    public function __construct() {
        // --- Posts & Pages Hooks ---
        add_action('transition_post_status', [$this, 'on_post_or_page_published'], 10, 3);
        add_action('post_updated', [$this, 'on_post_or_page_updated'], 10, 3);
        add_action('before_delete_post', [$this, 'on_post_or_page_deleted'], 10, 2);

        // --- User Hooks ---
        add_action('user_register', [$this, 'on_user_registered'], 10, 1);
        add_action('wp_login', [$this, 'on_user_logged_in'], 10, 2);
        add_action('wp_logout', [$this, 'on_user_logged_out'], 10, 1);

        // --- Plugins & Themes Hooks ---
        add_action('activated_plugin', [$this, 'on_plugin_activated'], 10, 1);
        add_action('deactivated_plugin', [$this, 'on_plugin_deactivated'], 10, 1);
        add_action('switch_theme', [$this, 'on_theme_switched'], 10, 3);
    }

    // ==========================================
    // 1. POST & PAGE TRIGGERS
    // ==========================================

    public function on_post_or_page_published($new_status, $old_status, $post) {
        if ($new_status !== 'publish' || $old_status === 'publish') return;

        $author_email = get_the_author_meta('user_email', $post->post_author);

        if ($post->post_type === 'post') {
            $payload = [
                'post_id'            => $post->ID,
                'post_title'         => $post->post_title,
                'post_slug'          => $post->post_name,
                'post_content'       => $post->post_content,
                'post_excerpt'       => $post->post_excerpt,
                'post_url'           => get_permalink($post->ID),
                'author_id'          => $post->post_author,
                'author_email'       => $author_email,
                'featured_image_url' => get_the_post_thumbnail_url($post->ID, 'full') ?: '',
                'publish_date'       => $post->post_date,
            ];
            $this->run_workflows_for_trigger('post_published', $payload);
        } elseif ($post->post_type === 'page') {
            $payload = [
                'page_id'      => $post->ID,
                'page_title'   => $post->post_title,
                'page_slug'    => $post->post_name,
                'page_content' => $post->post_content,
                'page_url'     => get_permalink($post->ID),
                'author_email' => $author_email,
                'publish_date' => $post->post_date,
            ];
            $this->run_workflows_for_trigger('page_published', $payload);
        }
    }

    public function on_post_or_page_updated($post_id, $post_after, $post_before) {
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) return;
        if ($post_after->post_status !== 'publish') return;

        $author_email = get_the_author_meta('user_email', $post_after->post_author);

        if ($post_after->post_type === 'post') {
            $payload = [
                'post_id'       => $post_after->ID,
                'post_title'    => $post_after->post_title,
                'post_slug'     => $post_after->post_name,
                'post_content'  => $post_after->post_content,
                'post_url'      => get_permalink($post_after->ID),
                'author_email'  => $author_email,
                'modified_date' => $post_after->post_modified,
            ];
            $this->run_workflows_for_trigger('post_updated', $payload);
        } elseif ($post_after->post_type === 'page') {
            $payload = [
                'page_id'       => $post_after->ID,
                'page_title'    => $post_after->post_title,
                'page_slug'     => $post_after->post_name,
                'page_content'  => $post_after->post_content,
                'page_url'      => get_permalink($post_after->ID),
                'modified_date' => $post_after->post_modified,
            ];
            $this->run_workflows_for_trigger('page_updated', $payload);
        }
    }

    public function on_post_or_page_deleted($post_id, $post) {
        if ($post->post_type === 'post') {
            $payload = [
                'post_id'    => $post_id,
                'post_title' => $post->post_title,
                'post_type'  => $post->post_type,
                'deleted_at' => current_time('mysql'),
            ];
            $this->run_workflows_for_trigger('post_deleted', $payload);
        } elseif ($post->post_type === 'page') {
            $payload = [
                'page_id'    => $post_id,
                'page_title' => $post->post_title,
                'deleted_at' => current_time('mysql'),
            ];
            $this->run_workflows_for_trigger('page_deleted', $payload);
        }
    }

    // ==========================================
    // 2. USER TRIGGERS
    // ==========================================

    public function on_user_registered($user_id) {
        $user = get_userdata($user_id);
        if (!$user) return;

        $payload = [
            'user_id'       => $user->ID,
            'username'      => $user->user_login,
            'user_email'    => $user->user_email,
            'first_name'    => $user->first_name,
            'last_name'     => $user->last_name,
            'user_role'     => !empty($user->roles) ? $user->roles[0] : '',
            'registered_at' => $user->user_registered,
        ];
        $this->run_workflows_for_trigger('user_registered', $payload);
    }

    public function on_user_logged_in($user_login, $user) {
        $payload = [
            'user_id'    => $user->ID,
            'username'   => $user->user_login,
            'user_email' => $user->user_email,
            'user_role'  => !empty($user->roles) ? $user->roles[0] : '',
            'login_time' => current_time('mysql'),
        ];
        $this->run_workflows_for_trigger('user_logged_in', $payload);
    }

    public function on_user_logged_out($user_id) {
        $user = get_userdata($user_id);
        if (!$user) return;

        $payload = [
            'user_id'     => $user->ID,
            'username'    => $user->user_login,
            'user_email'  => $user->user_email,
            'logout_time' => current_time('mysql'),
        ];
        $this->run_workflows_for_trigger('user_logged_out', $payload);
    }

    // ==========================================
    // 3. PLUGIN & THEME TRIGGERS
    // ==========================================

    public function on_plugin_activated($plugin) {
        if (!function_exists('get_plugin_data')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $plugin_file = WP_PLUGIN_DIR . '/' . $plugin;
        $plugin_data = file_exists($plugin_file) ? get_plugin_data($plugin_file) : [];

        $payload = [
            'plugin_name'  => isset($plugin_data['Name']) ? $plugin_data['Name'] : $plugin,
            'plugin_slug'  => $plugin,
            'version'      => isset($plugin_data['Version']) ? $plugin_data['Version'] : '',
            'activated_at' => current_time('mysql'),
        ];
        $this->run_workflows_for_trigger('plugin_activated', $payload);
    }

    public function on_plugin_deactivated($plugin) {
        if (!function_exists('get_plugin_data')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $plugin_file = WP_PLUGIN_DIR . '/' . $plugin;
        $plugin_data = file_exists($plugin_file) ? get_plugin_data($plugin_file) : [];

        $payload = [
            'plugin_name'    => isset($plugin_data['Name']) ? $plugin_data['Name'] : $plugin,
            'plugin_slug'    => $plugin,
            'deactivated_at' => current_time('mysql'),
        ];
        $this->run_workflows_for_trigger('plugin_deactivated', $payload);
    }

    public function on_theme_switched($new_name, $new_theme, $old_theme) {
        $payload = [
            'new_theme_name' => $new_name,
            'new_theme_slug' => $new_theme ? $new_theme->get_stylesheet() : '',
            'old_theme_name' => is_a($old_theme, 'WP_Theme') ? $old_theme->get('Name') : '',
            'switched_at'    => current_time('mysql'),
        ];
        $this->run_workflows_for_trigger('theme_switched', $payload);
    }

    // ==========================================
    // CORE WORKFLOW RUNNER
    // ==========================================

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
            if ($trigger_node) {
                $this->traverse_and_execute($trigger_node['id'], $nodes, $edges, $payload, $wf->id);
            }
        }
    }

    private function find_matching_trigger_node($nodes, $target_trigger_type) {
        foreach ($nodes as $node) {
            if ('wordpress' === $node['type']) {
                $node_trigger = isset($node['data']['trigger_type']) ? $node['data']['trigger_type'] : '';

                if ($node_trigger === $target_trigger_type) {
                    return $node;
                }
            }
        }
        return null;
    }

    private function traverse_and_execute($current_node_id, $nodes, $edges, $payload, $workflow_id) {
        $outgoing_edges = array_filter($edges, function($edge) use ($current_node_id) {
            return $edge['source'] === $current_node_id;
        });

        foreach ($outgoing_edges as $edge) {
            $target_node_id = $edge['target'];

            $target_node = array_values(array_filter($nodes, function($node) use ($target_node_id) {
                return $node['id'] === $target_node_id;
            }));

            if (!empty($target_node)) {
                $node = $target_node[0];
                $this->execute_node_action($node, $payload, $workflow_id);
                $this->traverse_and_execute($node['id'], $nodes, $edges, $payload, $workflow_id);
            }
        }
    }

    private function execute_node_action($node, $payload, $workflow_id) {
        $node_type = $node['type'];

        $log_entry = sprintf(
            'Workflow #%d executed Node "%s" (%s) with payload: %s',
            $workflow_id,
            $node['title'] ?? $node_type,
            $node_type,
            json_encode($payload)
        );

        error_log('WORKFLOW EXECUTION: ' . $log_entry);

        switch ($node_type) {
            case 'email':
				error_log('Send email: ' . sprintf("recipient: %s, subject: %s, body: %s", $node['data']['recipient'], $node['data']['subject'], $node['data']['body']));
                // wp_mail($to, 'Workflow Triggered', json_encode($payload));
                break;
            case 'google-sheets':
                // Append row to Google Sheets via API
                break;
        }
    }
}

new Workflow_Engine();