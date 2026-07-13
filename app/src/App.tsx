import React, { useState, useEffect, useCallback } from 'react';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import { 
  WorkflowNode, 
  NodeType, 
  SidebarItem, 
  INITIAL_NODES, 
  SIDEBAR_ITEMS,
  ExecutionLog 
} from './types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  // Primary States
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-3'); // defaults to AI Agent node 3 on load
  const [scale, setScale] = useState<number>(0.9); // zoom level
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 40, y: -20 }); // pan coordinates
  
  // Header state
  const [isActive, setIsActive] = useState<boolean>(true);
  const [workflowTitle, setWorkflowTitle] = useState<string>('High Value Order Automation');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState<boolean>(false);

  // Undo/Redo stack state
  const [undoStack, setUndoStack] = useState<WorkflowNode[][]>([]);
  const [redoStack, setRedoStack] = useState<WorkflowNode[][]>([]);

  // Execution simulation states
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [canvasTab, setCanvasTab] = useState<'canvas' | 'logs' | 'history' | 'versions'>('canvas');
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

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
  const saveToHistory = useCallback((currentNodes: WorkflowNode[]) => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(currentNodes))]);
    setRedoStack([]); // Clear redo stack on manual edits
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(nodes))]);
    setNodes(previous);
    setUndoStack(prev => prev.slice(0, -1));
  }, [nodes, undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(nodes))]);
    setNodes(next);
    setRedoStack(prev => prev.slice(0, -1));
  }, [nodes, redoStack]);

  // Handle manual saving action
  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccessBanner(true);
    }, 1000);
  }, []);

  // Update selected node data
  const handleNodeChange = useCallback((nodeId: string, updatedData: any) => {
    saveToHistory(nodes);
    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, data: updatedData } : n))
    );
  }, [nodes, saveToHistory]);

  // Dragging a node in the visual designer updates coordinates
  const handleNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, x, y } : n))
    );
  }, []);

  // Adding a node via dropping it from Sidebar
  const handleDropNode = useCallback((type: NodeType, x: number, y: number) => {
    saveToHistory(nodes);
    
    // Find item configuration template from sidebar items
    const template = SIDEBAR_ITEMS.find(item => item.id === type) || SIDEBAR_ITEMS[0];
    const nextNumber = Math.max(...nodes.map(n => n.number)) + 1;
    const newNodeId = `node-${Date.now()}`;

    const newNode: WorkflowNode = {
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

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNodeId); // automatically inspect the newly dropped node
  }, [nodes, saveToHistory]);

  // Adding a node via clicking (+) on Sidebar items
  const handleAddItem = useCallback((type: NodeType) => {
    // Generate positions near the center/bottom of the current view coordinates
    const lastNodeY = Math.max(...nodes.map(n => n.y));
    const nextX = 430;
    const nextY = lastNodeY + 120;
    handleDropNode(type, nextX, nextY);
  }, [nodes, handleDropNode]);

  // Deleting custom nodes
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Prevent deleting system nodes shown in screenshot for layout consistency
    if (['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7', 'node-8', 'node-9'].includes(nodeId)) {
      return;
    }
    saveToHistory(nodes);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId, saveToHistory]);

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
    const initialLogs: ExecutionLog[] = [
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
        ...prev.map(l => l.nodeId === 'node-1' ? { ...l, status: 'success' as const, message: 'Webhook received. Extracted WooCommerce payload details (total price ₹12,450).', durationMs: 1120 } : l),
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
          ...prev.map(l => l.nodeId === 'node-2' ? { ...l, status: 'success' as const, message: 'Condition resolved to TRUE (₹12,450 > ₹5,000). Routing flow down the TRUE branch.', durationMs: 840 } : l),
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
            ...prev.map(l => l.nodeId === 'node-3' ? { ...l, status: 'success' as const, message: 'Gemini inference finished successfully. Intent identified: high_value_purchase (92% confidence). Suggested Upsell items appended to properties.', durationMs: 1540 } : l),
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
              ...prev.map(l => l.nodeId === 'node-4' ? { ...l, status: 'success' as const, message: 'Thank You mail dispatched. Send status: success. Queue SMTP ID: em_wc_9842.', durationMs: 980 } : l),
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
                ...prev.map(l => l.nodeId === 'node-5' ? { ...l, status: 'success' as const, message: 'Google Sheets table row added successfully. Sync completed for row range A12:D12.', durationMs: 1150 } : l),
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
                  ...prev.map(l => l.nodeId === 'node-6' ? { ...l, status: 'success' as const, message: 'Slack incoming webhook trigger published. Message delivered.', durationMs: 910 } : l),
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
                    ...prev.map(l => l.nodeId === 'node-9' ? { ...l, status: 'success' as const, message: 'WooCommerce Order internal notes compiled successfully.', durationMs: 1200 } : l),
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 font-sans relative">
      {/* Visual top bar banner */}
      <TopBar
        title={workflowTitle}
        onTitleChange={setWorkflowTitle}
        isActive={isActive}
        onActiveToggle={() => {
          saveToHistory(nodes);
          setIsActive(!isActive);
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onExecute={handleExecuteWorkflow}
        isExecuting={isExecuting}
        onSave={handleSave}
        isSaving={isSaving}
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
