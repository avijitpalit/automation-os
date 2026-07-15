import React, { useState, useEffect, useCallback } from 'react';
import TopBar from './components/TopBar.jsx';
import LeftPanel from './components/LeftPanel.jsx';
import Canvas from './components/Canvas.jsx';
import PropertiesPanel from './components/PropertiesPanel.jsx';
import ArchiveView from './components/ArchiveView.jsx';
import { useWorkflows } from './hooks/useWorkflows';
import { 
  INITIAL_NODES, 
  SIDEBAR_ITEMS
} from './types.js';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  // Navigation and Workflows States
  const [currentView, setCurrentView] = useState('archive'); // 'archive' | 'editor'
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  
  // Pre-populated templates for visual simulation. New custom creations are starting completely empty!
  const [workflows, setWorkflows] = useState([
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
  ]);

  // Primary States
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null); // defaults to no selection on load
  const [scale, setScale] = useState(0.9); // zoom level
  const [panOffset, setPanOffset] = useState({ x: 40, y: -20 }); // pan coordinates
  
  // Header state
  const [isActive, setIsActive] = useState(true);
  const [workflowTitle, setWorkflowTitle] = useState('High Value Order Automation');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  // Undo/Redo stack state
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Execution simulation states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [canvasTab, setCanvasTab] = useState('canvas');
  const [logs, setLogs] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto close notifications helper
  useEffect(() => {
    if (saveSuccessBanner) {
      const timer = setTimeout(() => setSaveSuccessBanner(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [saveSuccessBanner]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Helper to record previous states for Undo functionality
  const saveToHistory = useCallback((currentNodes) => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(currentNodes))]);
    setRedoStack([]); // Clear redo stack on manual edits
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack(prevUndo => {
      if (prevUndo.length === 0) return prevUndo;
      const previous = prevUndo[prevUndo.length - 1];
      
      setNodes(currentNodes => {
        setRedoStack(prevRedo => [...prevRedo, JSON.parse(JSON.stringify(currentNodes))]);
        return previous;
      });
      
      return prevUndo.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack(prevRedo => {
      if (prevRedo.length === 0) return prevRedo;
      const next = prevRedo[prevRedo.length - 1];
      
      setNodes(currentNodes => {
        setUndoStack(prevUndo => [...prevUndo, JSON.parse(JSON.stringify(currentNodes))]);
        return next;
      });
      
      return prevRedo.slice(0, -1);
    });
  }, []);

  // Handle manual saving action
  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setWorkflows(prev => prev.map(w => {
        if (w.id === currentWorkflowId) {
          return {
            ...w,
            title: workflowTitle,
            isActive: isActive,
            nodes: nodes
          };
        }
        return w;
      }));
      setIsSaving(false);
      setSaveSuccessBanner(true);
    }, 1000);
  }, [currentWorkflowId, workflowTitle, isActive, nodes]);

  // Update selected node data
  const handleNodeChange = useCallback((nodeId, updatedData) => {
    setNodes(prev => {
      saveToHistory(prev);
      return prev.map(n => (n.id === nodeId ? { ...n, data: updatedData } : n));
    });
  }, [saveToHistory]);

  // Dragging a node in the visual designer updates coordinates
  const handleNodeDrag = useCallback((nodeId, x, y) => {
    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, x, y } : n))
    );
  }, []);

  // Adding a node via dropping it from Sidebar
  const handleDropNode = useCallback((type, x, y) => {
    setNodes(prev => {
      saveToHistory(prev);
      
      // Find item configuration template from sidebar items
      const template = SIDEBAR_ITEMS.find(item => item.id === type) || SIDEBAR_ITEMS[0];
      const nextNumber = prev.length > 0 ? Math.max(...prev.map(n => n.number)) + 1 : 1;
      const newNodeId = `node-${Date.now()}`;

      const newNode = {
        id: newNodeId,
        type: type,
        title: template.title,
        subtitle: template.subtitle,
        number: nextNumber,
        status: 'idle',
        x,
        y,
        data: {
          prompt: 'Analyze or process this payload item...',
          temperature: 0.4,
          model: 'gemini-3.5-flash',
          recipient: '{{customer.email}}',
          subject: 'New Update Notification',
          channel: '#general',
          message: 'Hello Team, notification processed.'
        }
      };

      setSelectedNodeId(newNodeId); // automatically inspect the newly dropped node
      return [...prev, newNode];
    });
  }, [saveToHistory]);

  // Adding a node via clicking (+) on Sidebar items
  const handleAddItem = useCallback((type) => {
    setNodes(prev => {
      const lastNodeY = prev.length > 0 ? Math.max(...prev.map(n => n.y)) : 100;
      const nextX = 430;
      const nextY = lastNodeY + 120;
      
      saveToHistory(prev);
      
      // Find item configuration template from sidebar items
      const template = SIDEBAR_ITEMS.find(item => item.id === type) || SIDEBAR_ITEMS[0];
      const nextNumber = prev.length > 0 ? Math.max(...prev.map(n => n.number)) + 1 : 1;
      const newNodeId = `node-${Date.now()}`;

      const newNode = {
        id: newNodeId,
        type: type,
        title: template.title,
        subtitle: template.subtitle,
        number: nextNumber,
        status: 'idle',
        x: nextX,
        y: nextY,
        data: {
          prompt: 'Analyze or process this payload item...',
          temperature: 0.4,
          model: 'gemini-3.5-flash',
          recipient: '{{customer.email}}',
          subject: 'New Update Notification',
          channel: '#general',
          message: 'Hello Team, notification processed.'
        }
      };

      setSelectedNodeId(newNodeId); // automatically inspect the newly dropped node
      return [...prev, newNode];
    });
  }, [saveToHistory]);

  // Deleting any node on the canvas
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes(prev => {
      saveToHistory(prev);
      return prev.filter(n => n.id !== nodeId);
    });
    setSelectedNodeId(prev => prev === nodeId ? null : prev);
  }, [saveToHistory]);

  const handleActiveToggle = useCallback(() => {
    setIsActive(prev => {
      const nextActive = !prev;
      setWorkflows(wfs => wfs.map(w => {
        if (w.id === currentWorkflowId) {
          return { ...w, isActive: nextActive };
        }
        return w;
      }));
      return nextActive;
    });
  }, [currentWorkflowId]);

  // --- WORKFLOWS ARCHIVE DIRECTORY HANDLERS ---
  const handleSelectWorkflow = useCallback((wfId) => {
    const wf = workflows.find(w => w.id === wfId);
    if (!wf) return;
    setCurrentWorkflowId(wfId);
    setWorkflowTitle(wf.title);
    setIsActive(wf.isActive);
    setNodes(wf.nodes || []);
    setSelectedNodeId(null);
    setUndoStack([]);
    setRedoStack([]);
    setCurrentView('editor');
  }, [workflows]);

  const handleBackToArchive = useCallback(() => {
    // Write current updates back to local list
    setWorkflows(prev => prev.map(w => {
      if (w.id === currentWorkflowId) {
        return {
          ...w,
          title: workflowTitle,
          isActive: isActive,
          nodes: nodes
        };
      }
      return w;
    }));
    setCurrentView('archive');
    setCurrentWorkflowId(null);
  }, [currentWorkflowId, workflowTitle, isActive, nodes]);

  const handleCreateWorkflow = useCallback(() => {
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

    setWorkflows(prev => [newWf, ...prev]);
    setCurrentWorkflowId(nextWfId);
    setWorkflowTitle(newWf.title);
    setIsActive(newWf.isActive);
    setNodes([]); // Empty nodes for a fresh canvas!
    setSelectedNodeId(null);
    setUndoStack([]);
    setRedoStack([]);
    setCurrentView('editor');
  }, [workflows]);

  const handleDeleteWorkflow = useCallback((wfId) => {
    if (window.confirm('Are you sure you want to permanently delete this workflow pipeline?')) {
      setWorkflows(prev => prev.filter(w => w.id !== wfId));
    }
  }, []);

  const handleDuplicateWorkflow = useCallback((wfId) => {
    const targetWf = workflows.find(w => w.id === wfId);
    if (!targetWf) return;

    const duplicated = {
      ...JSON.parse(JSON.stringify(targetWf)),
      id: `wf-${Date.now()}`,
      title: `${targetWf.title} (Copy)`,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastRun: 'Never'
    };

    setWorkflows(prev => {
      const idx = prev.findIndex(w => w.id === wfId);
      const updated = [...prev];
      updated.splice(idx + 1, 0, duplicated);
      return updated;
    });
  }, [workflows]);

  const handleToggleActiveFromArchive = useCallback((wfId) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === wfId) {
        return { ...w, isActive: !w.isActive };
      }
      return w;
    }));
  }, []);

  const handleTitleChangeInEditor = useCallback((newTitle) => {
    setWorkflowTitle(newTitle);
    setWorkflows(prev => prev.map(w => {
      if (w.id === currentWorkflowId) {
        return { ...w, title: newTitle };
      }
      return w;
    }));
  }, [currentWorkflowId]);

  // Run Simulated Workflow Execution Pipeline
  const handleExecuteWorkflow = useCallback(() => {
    if (isExecuting) return;
    setIsExecuting(true);
    setExecutionStep(1);
    setCanvasTab('logs'); // Open console tab to view real-time log sequence

    // Reset nodes statuses
    setNodes(prev => prev.map(n => ({
      ...n,
      status: n.id === 'node-1' ? 'running' : 'idle'
    })));

    const now = () => new Date().toLocaleTimeString();

    // Staged sequence of workflow steps
    const initialLogs = [
      {
        timestamp: now(),
        nodeId: 'node-1',
        nodeTitle: '1. WooCommerce Trigger',
        status: 'running',
        message: 'Polling WooCommerce webhooks endpoint... Connection verified.',
        durationMs: 0
      }
    ];
    setLogs(initialLogs);

    // Timeout chain for staged executions
    // Step 1 -> Step 2
    setTimeout(() => {
      setExecutionStep(2);
      setNodes(prev => prev.map(n => 
        n.id === 'node-1' ? { ...n, status: 'success' } :
        n.id === 'node-2' ? { ...n, status: 'running' } : n
      ));
      setLogs(prev => [
        ...prev.map(l => l.nodeId === 'node-1' ? { ...l, status: 'success', message: 'Webhook received. Extracted WooCommerce payload details (total price ₹12,450).', durationMs: 1120 } : l),
        {
          timestamp: now(),
          nodeId: 'node-2',
          nodeTitle: '2. Condition Check',
          status: 'running',
          message: 'Evaluating cart total rules: (total_price ₹12,450 > threshold ₹5,000)...',
          durationMs: 0
        }
      ]);

      // Step 2 -> Step 3
      setTimeout(() => {
        setExecutionStep(3);
        setNodes(prev => prev.map(n => 
          n.id === 'node-2' ? { ...n, status: 'success' } :
          n.id === 'node-3' ? { ...n, status: 'running' } : n
        ));
        setLogs(prev => [
          ...prev.map(l => l.nodeId === 'node-2' ? { ...l, status: 'success', message: 'Condition resolved to TRUE (₹12,450 > ₹5,000). Routing flow down the TRUE branch.', durationMs: 840 } : l),
          {
            timestamp: now(),
            nodeId: 'node-3',
            nodeTitle: '3. AI Agent Analysis',
            status: 'running',
            message: `Executing Gemini prompt to analyze intent on model: gemini-3.5-flash...`,
            durationMs: 0
          }
        ]);

        // Step 3 -> Step 4
        setTimeout(() => {
          setExecutionStep(4);
          setNodes(prev => prev.map(n => 
            n.id === 'node-3' ? { ...n, status: 'success' } :
            n.id === 'node-4' ? { ...n, status: 'running' } : n
          ));
          setLogs(prev => [
            ...prev.map(l => l.nodeId === 'node-3' ? { ...l, status: 'success', message: 'Gemini inference finished successfully. Intent identified: high_value_purchase (92% confidence). Suggested Upsell items appended to properties.', durationMs: 1540 } : l),
            {
              timestamp: now(),
              nodeId: 'node-4',
              nodeTitle: '4. Mail Dispatcher',
              status: 'running',
              message: 'Preparing SMTP thank you email template for aman@example.com...',
              durationMs: 0
            }
          ]);

          // Step 4 -> Step 5
          setTimeout(() => {
            setExecutionStep(5);
            setNodes(prev => prev.map(n => 
              n.id === 'node-4' ? { ...n, status: 'success' } :
              n.id === 'node-5' ? { ...n, status: 'running' } : n
            ));
            setLogs(prev => [
              ...prev.map(l => l.nodeId === 'node-4' ? { ...l, status: 'success', message: 'Thank You mail dispatched. Send status: success. Queue SMTP ID: em_wc_9842.', durationMs: 980 } : l),
              {
                timestamp: now(),
                nodeId: 'node-5',
                nodeTitle: '5. Google Sheets Sync',
                status: 'running',
                message: 'Writing customer metadata and AI metrics to Google Spreadsheet (High-Value Orders 2026)...',
                durationMs: 0
              }
            ]);

            // Step 5 -> Step 6
            setTimeout(() => {
              setExecutionStep(6);
              setNodes(prev => prev.map(n => 
                n.id === 'node-5' ? { ...n, status: 'success' } :
                n.id === 'node-6' ? { ...n, status: 'running' } : n
              ));
              setLogs(prev => [
                ...prev.map(l => l.nodeId === 'node-5' ? { ...l, status: 'success', message: 'Google Sheets table row added successfully. Sync completed for row range A12:D12.', durationMs: 1150 } : l),
                {
                  timestamp: now(),
                  nodeId: 'node-6',
                  nodeTitle: '6. Slack Alerter',
                  status: 'running',
                  message: 'Sending markdown message alert block to Slack channel #sales-alerts...',
                  durationMs: 0
                }
              ]);

              // Step 6 -> Step 9 (Merge note)
              setTimeout(() => {
                setExecutionStep(7);
                setNodes(prev => prev.map(n => 
                  n.id === 'node-6' ? { ...n, status: 'success' } :
                  n.id === 'node-9' ? { ...n, status: 'running' } : n
                ));
                setLogs(prev => [
                  ...prev.map(l => l.nodeId === 'node-6' ? { ...l, status: 'success', message: 'Slack incoming webhook trigger published. Message delivered.', durationMs: 910 } : l),
                  {
                    timestamp: now(),
                    nodeId: 'node-9',
                    nodeTitle: '9. WooCommerce Update',
                    status: 'running',
                    message: 'Appending high-value workflow analytics as internal metadata note to order WC-2026-9842...',
                    durationMs: 0
                  }
                ]);

                // Step 9 -> Finish
                setTimeout(() => {
                  setExecutionStep(8);
                  setNodes(prev => prev.map(n => 
                    n.id === 'node-9' ? { ...n, status: 'success' } : n
                  ));
                  setLogs(prev => [
                    ...prev.map(l => l.nodeId === 'node-9' ? { ...l, status: 'success', message: 'WooCommerce Order internal notes compiled successfully.', durationMs: 1200 } : l),
                    {
                      timestamp: now(),
                      nodeId: 'workflow',
                      nodeTitle: 'Workflow Automation',
                      status: 'success',
                      message: '🎉 [FINISHED] High Value Order Automation workflow run completed with 0 errors.',
                      durationMs: 7740
                    }
                  ]);
                  setIsExecuting(false);
                  setShowConfetti(true);
                }, 1300);

              }, 1100);

            }, 1200);

          }, 1100);

        }, 1200);

      }, 1800);

    }, 1300);

  }, [isExecuting]);

  // Find the currently selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50 font-sans relative">
      {currentView === 'archive' ? (
        <ArchiveView
          workflows={workflows}
          onSelectWorkflow={handleSelectWorkflow}
          onCreateWorkflow={handleCreateWorkflow}
          onDeleteWorkflow={handleDeleteWorkflow}
          onDuplicateWorkflow={handleDuplicateWorkflow}
          onToggleActive={handleToggleActiveFromArchive}
        />
      ) : (
        <>
          {/* Visual top bar banner */}
          <TopBar
            title={workflowTitle}
            onTitleChange={handleTitleChangeInEditor}
            isActive={isActive}
            onActiveToggle={handleActiveToggle}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onExecute={handleExecuteWorkflow}
            isExecuting={isExecuting}
            onSave={handleSave}
            isSaving={isSaving}
            onBackToArchive={handleBackToArchive}
          />

          {/* Main Designer Columns layout */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Side: Components sidebar */}
            <LeftPanel onAddItem={handleAddItem} />

            {/* Center: Zoomable drag-and-drop designer canvas */}
            <Canvas
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onNodeDrag={handleNodeDrag}
              onDropNode={handleDropNode}
              onDeleteNode={handleDeleteNode}
              scale={scale}
              setScale={setScale}
              panOffset={panOffset}
              setPanOffset={setPanOffset}
              isExecuting={isExecuting}
              executionStep={executionStep}
              onExecute={handleExecuteWorkflow}
              canvasTab={canvasTab}
              setCanvasTab={setCanvasTab}
              logs={logs}
            />

            {/* Right Side: properties configuration sidebar inspector */}
            <AnimatePresence mode="wait">
              {selectedNode && (
                <motion.div
                  key={selectedNode.id}
                  initial={{ x: 320, opacity: 0.8 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0.8 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="h-full z-15 flex shrink-0"
                >
                  <PropertiesPanel
                    node={selectedNode}
                    onNodeChange={handleNodeChange}
                    onClose={() => setSelectedNodeId(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Toast Notification Banners & Confetti Overlays */}
      <AnimatePresence>
        {saveSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-16 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Workflow successfully compiled and saved offline!</span>
            <button 
              onClick={() => setSaveSuccessBanner(false)} 
              className="ml-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-indigo-950/20 backdrop-blur-xs select-none"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center max-w-sm pointer-events-auto"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-1.5 justify-center">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>Execution Successful!</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                The visual automation run completed with 0 errors. All WooCommerce, Sheets, and Slack data channels synchronized successfully.
              </p>
              <button
                onClick={() => setShowConfetti(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Return to Canvas
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}