import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from './TopBar.jsx';
import LeftPanel from './LeftPanel.jsx';
import Canvas from './Canvas.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import { SIDEBAR_ITEMS } from '../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

export default function EditorView({ workflows, saveWorkflow }) {
  const { workflowId } = useParams();
  const navigate = useNavigate();

  // Find the target workflow from parent workflows list
  const targetWf = useMemo(() => workflows.find(w => w.id === workflowId), [workflows, workflowId]);

  // Primary States
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null); // defaults to no selection on load
  const [scale, setScale] = useState(0.9); // zoom level
  const [panOffset, setPanOffset] = useState({ x: 40, y: -20 }); // pan coordinates
  
  // Header state
  const [isActive, setIsActive] = useState(true);
  const [workflowTitle, setWorkflowTitle] = useState('');
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

  const lastLoadedIdRef = useRef(null);

  // Synchronize state when targetWf is loaded or workflowId changes
  useEffect(() => {
    if (targetWf && lastLoadedIdRef.current !== workflowId) {
      lastLoadedIdRef.current = workflowId;
      setNodes(targetWf.nodes || []);
      setWorkflowTitle(targetWf.title || '');
      setIsActive(targetWf.isActive ?? true);
      setSelectedNodeId(null);
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [targetWf, workflowId]);

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
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const updated = {
      ...targetWf,
      id: workflowId,
      title: workflowTitle,
      isActive: isActive,
      nodes: nodes
    };
    await saveWorkflow(updated);
    setIsSaving(false);
    setSaveSuccessBanner(true);
  }, [workflowId, workflowTitle, isActive, nodes, targetWf, saveWorkflow]);

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
      if (targetWf) {
        saveWorkflow({ ...targetWf, isActive: nextActive, nodes });
      }
      return nextActive;
    });
  }, [targetWf, nodes, saveWorkflow]);

  const handleBackToArchive = useCallback(async () => {
    const updated = {
      ...targetWf,
      id: workflowId,
      title: workflowTitle,
      isActive: isActive,
      nodes: nodes
    };
    await saveWorkflow(updated);
    navigate('/');
  }, [workflowId, workflowTitle, isActive, nodes, targetWf, saveWorkflow, navigate]);

  const handleTitleChangeInEditor = useCallback((newTitle) => {
    setWorkflowTitle(newTitle);
    if (targetWf) {
      saveWorkflow({ ...targetWf, title: newTitle, nodes, isActive });
    }
  }, [targetWf, nodes, isActive, saveWorkflow]);

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

      }, 1100);

    }, 1800);

  }, [isExecuting]);

  // Find the currently selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  if (!targetWf) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500 mb-4">Workflow not found</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50 font-sans relative">
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