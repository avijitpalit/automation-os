import React, { useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ArchiveView from './components/ArchiveView.jsx';
import EditorView from './components/EditorView.jsx';
import { useWorkflows } from './hooks/useWorkflows.js';

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-1',
    title: 'High Value Order Automation',
    description: 'Evaluates WooCommerce cart value threshold and triggers email/Slack updates with real-time AI classification.',
    isActive: true,
    createdDate: 'Jul 12, 2026',
    lastRun: '12 mins ago',
    successRate: '98.5%',
    nodes: [
      {
        id: 'node-1',
        type: 'woocommerce',
        title: 'WooCommerce',
        subtitle: 'Order Created',
        number: 1,
        status: 'success',
        x: 430,
        y: 40,
        data: {
          storeUrl: 'https://my-woocommerce-shop.com',
          event: 'order.created',
          credentials: 'Shop Admin Key (***-***)'
        }
      },
      {
        id: 'node-2',
        type: 'condition',
        title: 'Condition',
        subtitle: 'Cart Total > ₹5,000',
        number: 2,
        status: 'success',
        x: 430,
        y: 160,
        data: {
          field: 'cart.total_price',
          operator: 'greater_than',
          value: '5000',
          currency: 'INR'
        }
      },
      {
        id: 'node-3',
        type: 'ai-agent',
        title: 'AI Agent',
        subtitle: 'Analyze Order',
        number: 3,
        status: 'success',
        x: 180,
        y: 330,
        data: {
          agentName: 'Order Analysis Agent',
          prompt: 'Analyze this order and extract customer intent, product category, and suggest upsell products.',
          model: 'gemini-3.5-flash',
          temperature: 0.3,
          testOutput: {
            intent: 'high_value_purchase',
            customer_type: 'new_customer',
            category: 'electronics',
            recommended_upsell: [
              'extended_warranty',
              'wireless_earbuds',
              'laptop_bag'
            ],
            confidence: 0.92
          }
        }
      },
      {
        id: 'node-4',
        type: 'email',
        title: 'Email',
        subtitle: 'Send Thank You Email',
        number: 4,
        status: 'success',
        x: 180,
        y: 450,
        data: {
          recipient: '{{customer.email}}',
          subject: 'Thank you for your order! - #{{order.id}}',
          sender: 'sales@my-shop.com',
          body: 'Hi {{customer.first_name}},\n\nThank you so much for your purchase of ₹{{order.total}}! We are preparing your order and will send tracking info soon.'
        }
      },
      {
        id: 'node-5',
        type: 'google-sheets',
        title: 'Google Sheets',
        subtitle: 'Add Order to Sheet',
        number: 5,
        status: 'success',
        x: 180,
        y: 570,
        data: {
          spreadsheetId: 'spreadsheet_high_value_orders_2026',
          sheetName: 'Sheet1',
          columns: [
            { key: 'OrderID', value: '{{order.id}}' },
            { key: 'Customer', value: '{{customer.name}}' },
            { key: 'Total', value: '{{order.total}}' },
            { key: 'AI_Intent', value: '{{node3.intent}}' }
          ]
        }
      },
      {
        id: 'node-6',
        type: 'slack',
        title: 'Slack',
        subtitle: 'Notify Sales Team',
        number: 6,
        status: 'success',
        x: 180,
        y: 690,
        data: {
          channel: '#sales-alerts',
          message: '🚀 *New High Value Order!* \nOrder #{{order.id}} by {{customer.name}} for *₹{{order.total}}*.\nAI Insights: Customer intent is *{{node3.intent}}* ({{node3.confidence}} confidence).'
        }
      },
      {
        id: 'node-7',
        type: 'delay',
        title: 'Delay',
        subtitle: 'Wait 24 Hours',
        number: 7,
        status: 'idle',
        x: 680,
        y: 330,
        data: {
          duration: '24',
          unit: 'hours'
        }
      },
      {
        id: 'node-8',
        type: 'email',
        title: 'Email',
        subtitle: 'Send Reminder Email',
        number: 8,
        status: 'idle',
        x: 680,
        y: 450,
        data: {
          recipient: '{{customer.email}}',
          subject: 'Complete your checkout!',
          sender: 'reminders@my-shop.com',
          body: 'Hi {{customer.first_name}},\n\nWe noticed you didn\'t finish checking out. Don\'t miss out on your items!'
        }
      },
      {
        id: 'node-9',
        type: 'update-order',
        title: 'Update Order',
        subtitle: 'Add Order Note',
        number: 9,
        status: 'idle',
        x: 430,
        y: 810,
        data: {
          orderId: '{{order.id}}',
          note: 'High-value flow processed. AI intent: {{node3.intent}}. Alert dispatched to Slack and sales notified.',
          isCustomerNote: false
        }
      }
    ]
  },
  {
    id: 'wf-2',
    title: 'Customer Onboarding Sequence',
    description: 'Triggers on Form submission, routes introductory welcome kit emails, and schedules custom delay segments.',
    isActive: true,
    createdDate: 'Jul 10, 2026',
    lastRun: '1 hour ago',
    successRate: '100%',
    nodes: [
      {
        id: 'node-101',
        type: 'form',
        title: 'Form',
        subtitle: 'Onboarding Submit',
        number: 1,
        status: 'success',
        x: 430,
        y: 40,
        data: {
          formId: 'onboarding-form-2026',
          title: 'New Signup Form'
        }
      },
      {
        id: 'node-102',
        type: 'email',
        title: 'Email',
        subtitle: 'Send Welcome Kit',
        number: 2,
        status: 'success',
        x: 430,
        y: 180,
        data: {
          recipient: '{{customer.email}}',
          subject: 'Welcome to your Workspace!',
          sender: 'onboarding@company.com',
          body: 'Hi there, we are thrilled to have you!'
        }
      }
    ]
  },
  {
    id: 'wf-3',
    title: 'Daily Slack Performance Sync',
    description: 'Cron scheduler that polls Google Sheets metrics and publishes high-level analytics report to #sales channels daily.',
    isActive: false,
    createdDate: 'Jul 05, 2026',
    lastRun: 'Yesterday',
    successRate: '95.8%',
    nodes: [
      {
        id: 'node-201',
        type: 'schedule',
        title: 'Schedule',
        subtitle: 'Everyday at 9:00 AM',
        number: 1,
        status: 'success',
        x: 430,
        y: 40,
        data: {
          cron: '0 9 * * *',
          timezone: 'Asia/Kolkata'
        }
      },
      {
        id: 'node-202',
        type: 'slack',
        title: 'Slack',
        subtitle: 'Publish Analytics',
        number: 2,
        status: 'success',
        x: 430,
        y: 180,
        data: {
          channel: '#management-alerts',
          message: 'Daily summary generated from Sheet...'
        }
      }
    ]
  }
];

export default function App() {
  const { workflows, loading, saveWorkflow, deleteWorkflow } = useWorkflows(DEFAULT_WORKFLOWS);
  const navigate = useNavigate();

  // --- WORKFLOWS ARCHIVE DIRECTORY HANDLERS ---
  const handleSelectWorkflow = useCallback((wfId) => {
    navigate(`/editor/${wfId}`);
  }, [navigate]);

  const handleCreateWorkflow = useCallback(async () => {
    const nextWfId = `wf-${Date.now()}`;
    const nextWfNum = workflows.length + 1;
    const newWf = {
      id: nextWfId,
      title: `Untitled Workflow ${nextWfNum}`,
      description: 'An empty canvas workspace. Start dropping triggers and actions to build your automated pipeline.',
      isActive: true,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastRun: 'Never',
      successRate: '—',
      nodes: [] // Starts completely empty as requested
    };

    await saveWorkflow(newWf);
    navigate(`/editor/${nextWfId}`);
  }, [workflows, saveWorkflow, navigate]);

  const handleDeleteWorkflow = useCallback(async (wfId) => {
    if (window.confirm('Are you sure you want to permanently delete this workflow pipeline?')) {
      await deleteWorkflow(wfId);
    }
  }, [deleteWorkflow]);

  const handleDuplicateWorkflow = useCallback(async (wfId) => {
    const targetWf = workflows.find(w => w.id === wfId);
    if (!targetWf) return;

    const duplicated = {
      ...JSON.parse(JSON.stringify(targetWf)),
      id: `wf-${Date.now()}`,
      title: `${targetWf.title} (Copy)`,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastRun: 'Never'
    };

    await saveWorkflow(duplicated);
  }, [workflows, saveWorkflow]);

  const handleToggleActiveFromArchive = useCallback(async (wfId) => {
    const targetWf = workflows.find(w => w.id === wfId);
    if (!targetWf) return;

    const updated = {
      ...targetWf,
      isActive: !targetWf.isActive
    };
    await saveWorkflow(updated);
  }, [workflows, saveWorkflow]);

  if (loading && workflows.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ArchiveView
            workflows={workflows}
            onSelectWorkflow={handleSelectWorkflow}
            onCreateWorkflow={handleCreateWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
            onDuplicateWorkflow={handleDuplicateWorkflow}
            onToggleActive={handleToggleActiveFromArchive}
          />
        } 
      />
      <Route 
        path="/editor/:workflowId" 
        element={
          <EditorView
            workflows={workflows}
            saveWorkflow={saveWorkflow}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}