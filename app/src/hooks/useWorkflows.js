import { useState, useEffect } from 'react';
import { WorkflowService } from '../services/api';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const data = await WorkflowService.getAll();
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const saveWorkflow = async (wf) => {
    const res = await WorkflowService.save(wf);
    if (res.success) {
      await fetchWorkflows();
    }
  };

  const deleteWorkflow = async (id) => {
    const res = await WorkflowService.delete(id);
    if (res.success) {
      setWorkflows(prev => prev.filter(w => w.id !== id));
    }
  };

  return { workflows, loading, saveWorkflow, deleteWorkflow };
}