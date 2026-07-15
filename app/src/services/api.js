import apiFetch from '@wordpress/api-fetch';

// Dynamically root to the local WordPress site's REST API path
apiFetch.use(apiFetch.createRootURLMiddleware(window.location.origin + '/wp-json/'));

export const WorkflowService = {
  /**
   * Fetch all workflows from the custom DB table
   */
  getAll: async () => {
    return await apiFetch({ path: 'automation-os/v1/workflows' });
  },

  /**
   * Save a brand new workflow or update an existing record row
   */
  save: async (workflowData) => {
    return await apiFetch({
      path: 'automation-os/v1/workflows',
      method: 'POST',
      data: workflowData
    });
  },

  /**
   * Delete a specific database row by its unique ID
   */
  delete: async (id) => {
    return await apiFetch({
      path: `automation-os/v1/workflows/${id}`,
      method: 'DELETE'
    });
  }
};