import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Maximize2, 
  Hand, 
  MousePointer, 
  Play, 
  Check, 
  Trash2,
  Terminal,
  Clock,
  History as HistoryIcon,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { WorkflowNode, NodeType, SidebarItem } from '../types';
import { getSidebarIcon } from './LeftPanel';

interface CanvasProps {
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onNodeDrag: (id: string, x: number, y: number) => void;
  onDropNode: (type: NodeType, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  scale: number;
  setScale: (s: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;
  isExecuting: boolean;
  executionStep: number;
  onExecute: () => void;
  canvasTab: 'canvas' | 'logs' | 'history' | 'versions';
  setCanvasTab: (tab: 'canvas' | 'logs' | 'history' | 'versions') => void;
  logs: any[];
}

export default function Canvas({
  nodes,
  selectedNodeId,
  onSelectNode,
  onNodeDrag,
  onDropNode,
  onDeleteNode,
  scale,
  setScale,
  panOffset,
  setPanOffset,
  isExecuting,
  executionStep,
  onExecute,
  canvasTab,
  setCanvasTab,
  logs
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panToolActive, setPanToolActive] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Key listener for spacebar to toggle pan tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setPanToolActive(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setPanToolActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Zoom Operations
  const handleZoomIn = () => setScale(Math.min(1.5, scale + 0.1));
  const handleZoomOut = () => setScale(Math.max(0.5, scale - 0.1));
  const handleZoomReset = () => {
    setScale(1.0);
    setPanOffset({ x: 50, y: -20 });
  };
  const handleFitToScreen = () => {
    if (nodes.length === 0) return;
    const padding = 60;
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + 230; // node card width
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + 70;  // node card height

    const flowWidth = maxX - minX;
    const flowHeight = maxY - minY;

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;

    const scaleX = (containerWidth - padding * 2) / flowWidth;
    const scaleY = (containerHeight - padding * 2) / flowHeight;
    const newScale = Math.max(0.4, Math.min(1.2, Math.min(scaleX, scaleY)));

    setScale(newScale);
    setPanOffset({
      x: (containerWidth - flowWidth * newScale) / 2 - minX * newScale,
      y: (containerHeight - flowHeight * newScale) / 2 - minY * newScale
    });
  };

  // Drag and Drop sidebar drop handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type');
    if (!type) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert screen coordinates back into our scale/pan canvas space
    const canvasX = (mouseX - panOffset.x) / scale;
    const canvasY = (mouseY - panOffset.y) / scale;

    onDropNode(type as NodeType, Math.round(canvasX - 115), Math.round(canvasY - 35));
  };

  // Canvas Mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (panToolActive || e.button === 1 || e.target === containerRef.current || (e.target as HTMLElement).id === 'grid-overlay') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (dragNodeId) {
      // Calculate new node coordinates adjusting for zoom scale
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = (mouseX - panOffset.x) / scale - dragOffset.x;
      const newY = (mouseY - panOffset.y) / scale - dragOffset.y;

      onNodeDrag(dragNodeId, Math.round(newX), Math.round(newY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragNodeId(null);
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (panToolActive) return;
    e.stopPropagation();
    onSelectNode(node.id);
    setDragNodeId(node.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Get cursor offset relative to node top-left corner
    const nodeCanvasX = (mouseX - panOffset.x) / scale;
    const nodeCanvasY = (mouseY - panOffset.y) / scale;

    setDragOffset({
      x: nodeCanvasX - node.x,
      y: nodeCanvasY - node.y
    });
  };

  // Custom Step Connection Drawing helper
  const drawStepPath = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    split = false,
    isTruePath = false,
    isActive = false,
    isFinished = false
  ) => {
    const splitY = fromY + 28;
    
    // Default or running stroke classes
    let strokeClass = "stroke-slate-200";
    if (isFinished) {
      strokeClass = isTruePath ? "stroke-emerald-400" : "stroke-slate-300";
    } else if (isActive) {
      strokeClass = "stroke-indigo-500 stroke-dash-animated";
    }

    let pathD = '';
    if (split) {
      // For splitting from Node 2 (Condition)
      pathD = `M ${fromX} ${fromY} L ${fromX} ${splitY} L ${toX} ${splitY} L ${toX} ${toY}`;
    } else {
      // Simple vertical S-curve
      const midY = (fromY + toY) / 2;
      pathD = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
    }

    return (
      <g key={`path-${fromX}-${fromY}-${toX}-${toY}`}>
        {/* Background glow path */}
        {isActive && (
          <path
            d={pathD}
            fill="none"
            className="stroke-indigo-100"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}
        
        {/* Main line path */}
        <path
          d={pathD}
          fill="none"
          className={`transition-all duration-300 ${strokeClass}`}
          strokeWidth={isActive ? "2.5" : "2"}
          strokeLinecap="round"
        />

        {/* Dynamic moving energy pulse dot */}
        {isActive && (
          <circle r="4" className="fill-indigo-600 animate-pulse-path">
            <animateMotion dur="1.5s" repeatCount="indefinite" path={pathD} />
          </circle>
        )}
      </g>
    );
  };

  // Render SVG Connections
  const renderConnections = () => {
    const paths: React.ReactNode[] = [];
    
    const node1 = nodes.find(n => n.id === 'node-1');
    const node2 = nodes.find(n => n.id === 'node-2');
    const node3 = nodes.find(n => n.id === 'node-3');
    const node4 = nodes.find(n => n.id === 'node-4');
    const node5 = nodes.find(n => n.id === 'node-5');
    const node6 = nodes.find(n => n.id === 'node-6');
    const node7 = nodes.find(n => n.id === 'node-7');
    const node8 = nodes.find(n => n.id === 'node-8');
    const node9 = nodes.find(n => n.id === 'node-9');

    // WooCommerce Trigger (Node 1) -> Condition (Node 2)
    if (node1 && node2) {
      const active = isExecuting && executionStep === 1;
      const finished = !isExecuting || executionStep > 1;
      paths.push(drawStepPath(node1.x + 115, node1.y + 70, node2.x + 100, node2.y, false, false, active, finished));
    }

    // Condition (Node 2) Splitting:
    if (node2) {
      const fromX = node2.x + 100;
      const fromY = node2.y + 70;

      // True Split -> Node 3 (AI Agent)
      if (node3) {
        // Active when step is at Condition evaluating or moving to step 3
        const active = isExecuting && (executionStep === 2 || executionStep === 3);
        const finished = !isExecuting || (executionStep > 2);
        paths.push(drawStepPath(fromX, fromY, node3.x + 115, node3.y, true, true, active, finished));
      }

      // False Split -> Node 7 (Delay)
      if (node7) {
        const active = isExecuting && (executionStep === 2); // Simulated false path if we support it
        const finished = false; // By default we simulate true path success
        paths.push(drawStepPath(fromX, fromY, node7.x + 115, node7.y, true, false, active, finished));
      }
    }

    // True path serial connections:
    // Node 3 (AI Agent) -> Node 4 (Email Send Thank You)
    if (node3 && node4) {
      const active = isExecuting && executionStep === 4;
      const finished = !isExecuting || executionStep > 4;
      paths.push(drawStepPath(node3.x + 115, node3.y + 70, node4.x + 115, node4.y, false, true, active, finished));
    }
    // Node 4 -> Node 5 (Google Sheets)
    if (node4 && node5) {
      const active = isExecuting && executionStep === 5;
      const finished = !isExecuting || executionStep > 5;
      paths.push(drawStepPath(node4.x + 115, node4.y + 70, node5.x + 115, node5.y, false, true, active, finished));
    }
    // Node 5 -> Node 6 (Slack Notify)
    if (node5 && node6) {
      const active = isExecuting && executionStep === 6;
      const finished = !isExecuting || executionStep > 6;
      paths.push(drawStepPath(node5.x + 115, node5.y + 70, node6.x + 115, node6.y, false, true, active, finished));
    }

    // False path serial connections:
    // Node 7 (Delay) -> Node 8 (Email Send Reminder)
    if (node7 && node8) {
      const active = false;
      const finished = false;
      paths.push(drawStepPath(node7.x + 115, node7.y + 70, node8.x + 115, node8.y, false, false, active, finished));
    }

    // Merging back into Node 9 (Update Order)
    if (node9) {
      const targetX = node9.x + 115;
      const targetY = node9.y;

      // Slack Node 6 merges into Update Order Node 9
      if (node6) {
        const active = isExecuting && executionStep === 7;
        const finished = !isExecuting || executionStep > 7;
        paths.push(drawStepPath(node6.x + 115, node6.y + 70, targetX, targetY, false, true, active, finished));
      }

      // Email Node 8 merges into Update Order Node 9 (when false path runs)
      if (node8) {
        const active = false;
        const finished = false;
        paths.push(drawStepPath(node8.x + 115, node8.y + 70, targetX, targetY, false, false, active, finished));
      }
    }

    // Dynamic user-added node connections
    // If there are other custom nodes, connect them to their predecessor for clarity
    nodes.forEach(node => {
      if (!['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7', 'node-8', 'node-9'].includes(node.id)) {
        // connect to nearest predecessor visually
        const nearest = nodes
          .filter(n => n.id !== node.id && n.y < node.y)
          .sort((a, b) => b.y - a.y)[0];
        if (nearest) {
          paths.push(drawStepPath(nearest.x + 115, nearest.y + 70, node.x + 115, node.y, false, false, false, false));
        }
      }
    });

    return paths;
  };

  // Node Color Maps
  const getNodeBorderColor = (node: WorkflowNode) => {
    if (selectedNodeId === node.id) {
      switch (node.type) {
        case 'woocommerce': return 'border-violet-500 shadow-active ring-1 ring-violet-500/20';
        case 'condition': return 'border-amber-500 shadow-active ring-1 ring-amber-500/20';
        case 'ai-agent': return 'border-indigo-500 shadow-active ring-1 ring-indigo-500/20';
        case 'email': return 'border-blue-500 shadow-active ring-1 ring-blue-500/20';
        case 'google-sheets': return 'border-green-500 shadow-active ring-1 ring-green-500/20';
        case 'slack': return 'border-emerald-500 shadow-active ring-1 ring-emerald-500/20';
        default: return 'border-indigo-500 shadow-active ring-1 ring-indigo-500/20';
      }
    }
    return 'border-slate-200/90 hover:border-slate-300';
  };

  const getNodeIconStyles = (type: NodeType) => {
    switch (type) {
      case 'woocommerce': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'condition': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ai-agent': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'email': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'google-sheets': return 'bg-green-50 text-green-600 border-green-100';
      case 'slack': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'delay': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'update-order': return 'bg-violet-50 text-violet-600 border-violet-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-slate-50 overflow-hidden">
      
      {/* Mini Top Action panel on canvas */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
        <button
          id="canvas-cursor-select"
          onClick={() => setPanToolActive(false)}
          className={`p-1.5 rounded transition-all cursor-pointer ${
            !panToolActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Select tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          id="canvas-cursor-pan"
          onClick={() => setPanToolActive(true)}
          className={`p-1.5 rounded transition-all cursor-pointer ${
            panToolActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Pan tool (Spacebar)"
        >
          <Hand className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-200" />
        
        {/* Zoom scale operations */}
        <button
          id="canvas-zoom-out"
          onClick={handleZoomOut}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          id="canvas-zoom-val"
          onClick={handleZoomReset}
          className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="Reset Zoom to 100%"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          id="canvas-zoom-in"
          onClick={handleZoomIn}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          id="canvas-fit-to-screen"
          onClick={handleFitToScreen}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="Fit to screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Designer Interactive Canvas Container */}
      <div
        id="workflow-designer-canvas"
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative cursor-default ${
          panToolActive ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
          backgroundSize: '16px 16px',
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
        }}
      >
        <div id="grid-overlay" className="absolute inset-0 z-0 pointer-events-none" />

        {/* Translation and Scale Root wrapper */}
        <div
          className="absolute origin-top-left z-10"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            width: '2000px',
            height: '2000px'
          }}
        >
          {/* SVG Line Connections */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            {renderConnections()}
          </svg>

          {/* Condition branch labels overlay */}
          {(() => {
            const node2 = nodes.find(n => n.id === 'node-2');
            if (!node2) return null;
            const splitY = node2.y + 70 + 28;
            return (
              <>
                {/* True Label (Left side) */}
                <div
                  className="absolute pointer-events-none px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 shadow-sm flex items-center space-x-0.5"
                  style={{
                    left: `${node2.x + 100 - 100}px`,
                    top: `${splitY - 10}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>True</span>
                </div>

                {/* False Label (Right side) */}
                <div
                  className="absolute pointer-events-none px-2 py-0.5 rounded-full text-[9px] font-bold text-rose-700 bg-rose-50/90 border border-rose-200 shadow-sm flex items-center space-x-0.5"
                  style={{
                    left: `${node2.x + 100 + 100}px`,
                    top: `${splitY - 10}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <span className="w-1 h-1 rounded-full bg-rose-500" />
                  <span>False</span>
                </div>
              </>
            );
          })()}

          {/* Render Active Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isNodeExecuting = isExecuting && (
              (node.id === 'node-1' && executionStep === 1) ||
              (node.id === 'node-2' && executionStep === 2) ||
              (node.id === 'node-3' && executionStep === 3) ||
              (node.id === 'node-4' && executionStep === 4) ||
              (node.id === 'node-5' && executionStep === 5) ||
              (node.id === 'node-6' && executionStep === 6) ||
              (node.id === 'node-9' && executionStep === 7)
            );

            const isNodeSucceeded = !isExecuting || (
              (node.id === 'node-1' && executionStep > 1) ||
              (node.id === 'node-2' && executionStep > 2) ||
              (node.id === 'node-3' && executionStep > 3) ||
              (node.id === 'node-4' && executionStep > 4) ||
              (node.id === 'node-5' && executionStep > 5) ||
              (node.id === 'node-6' && executionStep > 6) ||
              (node.id === 'node-9' && executionStep > 7)
            );

            return (
              <div
                id={`canvas-node-${node.id}`}
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`absolute rounded-xl bg-white border p-3 flex items-center justify-between shadow-node select-none cursor-grab active:cursor-grabbing transition-all ${
                  node.type === 'condition' ? 'w-[200px]' : 'w-[230px]'
                } ${getNodeBorderColor(node)} ${
                  isNodeExecuting ? 'ring-2 ring-indigo-500 ring-offset-2 animate-pulse' : ''
                }`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`
                }}
              >
                {/* Ports Indicators for visual context */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full border border-slate-300 bg-white" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 rounded-full border border-slate-300 bg-white" />

                {/* Left Side: Icon Container */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`p-2 rounded-lg border ${getNodeIconStyles(node.type)} shrink-0 shadow-sm`}>
                    {getSidebarIcon(
                      node.type === 'update-order' ? 'store' : 
                      node.type === 'ai-agent' ? 'sparkles' : 
                      node.type === 'condition' ? 'git-fork' : 
                      node.type === 'delay' ? 'hourglass' : 
                      node.type === 'woocommerce' ? 'store' : 
                      node.type === 'email' ? 'mail' : 
                      node.type === 'google-sheets' ? 'table' : 
                      node.type === 'slack' ? 'message-square' : 'sparkles'
                    , "w-4 h-4")}
                  </div>
                  
                  {/* Title and Subtitle */}
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center space-x-1 truncate">
                      <span>{node.number}. {node.title}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {node.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Side Status indicator or Delete */}
                <div className="flex items-center space-x-1 shrink-0 ml-1">
                  {isNodeExecuting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  ) : isNodeSucceeded ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1" />
                  )}

                  {/* Hover trash to remove nodes except system ones */}
                  {isHovered && !['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7', 'node-8', 'node-9'].includes(node.id) && (
                    <button
                      id={`delete-node-${node.id}`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => onDeleteNode(node.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                      title="Delete Node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Visual Minimap Overlay (bottom left) */}
        <div id="canvas-minimap" className="absolute bottom-4 left-4 z-10 w-36 h-28 bg-white border border-slate-200 rounded-xl p-2 shadow-soft pointer-events-none select-none">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>Minimap View</span>
          </p>
          <div className="relative w-full h-16 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden">
            {/* Scaled-down dot representation of our 9 main nodes */}
            {nodes.map(n => {
              // Map x (180 to 680) -> (10 to 110)
              // Map y (40 to 810) -> (5 to 55)
              const minCanvasX = 180, maxCanvasX = 680;
              const minCanvasY = 40, maxCanvasY = 810;
              
              const percentX = (n.x - minCanvasX) / (maxCanvasX - minCanvasX || 1);
              const percentY = (n.y - minCanvasY) / (maxCanvasY - minCanvasY || 1);
              
              const mapX = 10 + percentX * 100;
              const mapY = 5 + percentY * 45;

              return (
                <div
                  key={`minimap-dot-${n.id}`}
                  className={`absolute w-2 h-1.5 rounded-full ${
                    selectedNodeId === n.id ? 'bg-indigo-600 scale-125 ring-2 ring-indigo-200' : 'bg-slate-300'
                  }`}
                  style={{
                    left: `${mapX}px`,
                    top: `${mapY}px`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Bottom Control Panel (Executing Workflow action and active logs display) */}
      <footer id="canvas-bottombar" className="border-t border-slate-200 bg-white z-10 shrink-0 select-none">
        <div className="h-12 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              id="execute-workflow-btn"
              onClick={onExecute}
              disabled={isExecuting}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>{isExecuting ? 'Executing Workflow...' : 'Execute Workflow'}</span>
            </button>

            {/* Bottom Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                id="tab-canvas"
                onClick={() => setCanvasTab('canvas')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  canvasTab === 'canvas' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Canvas
              </button>
              <button
                id="tab-logs"
                onClick={() => setCanvasTab('logs')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  canvasTab === 'logs' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Logs</span>
                {logs.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                )}
              </button>
              <button
                id="tab-history"
                onClick={() => setCanvasTab('history')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  canvasTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <HistoryIcon className="w-3 h-3" />
                <span>History</span>
              </button>
              <button
                id="tab-versions"
                onClick={() => setCanvasTab('versions')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  canvasTab === 'versions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Versions</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>All changes saved</span>
          </div>
        </div>

        {/* Slidable Overlay Terminal and Panels based on active tab selection */}
        {canvasTab !== 'canvas' && (
          <div className="border-t border-slate-200 bg-slate-900 text-slate-200 p-4 max-h-56 overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[10px] uppercase tracking-wider ml-2">
                  {canvasTab === 'logs' ? 'System Console Logs' : canvasTab === 'history' ? 'Workflow Revision History' : 'Applet Versions'}
                </span>
              </div>
              <button
                onClick={() => setCanvasTab('canvas')}
                className="text-slate-400 hover:text-white hover:bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕ Close Console
              </button>
            </div>

            {canvasTab === 'logs' && (
              <div className="space-y-1.5">
                {logs.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center italic">No system logs loaded. Click "Execute Workflow" to view debug runs.</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={`log-${idx}`} className="flex items-start space-x-2.5 hover:bg-slate-800/40 p-1 rounded transition-colors">
                      <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">[{log.timestamp}]</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${
                        log.status === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 
                        log.status === 'running' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40 animate-pulse' : 
                        'bg-rose-950 text-rose-400 border border-rose-900/40'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-indigo-400 font-semibold shrink-0">{log.nodeTitle}:</span>
                      <span className="text-slate-300">{log.message}</span>
                      {log.durationMs > 0 && (
                        <span className="text-slate-500 italic text-[10px] ml-auto">({log.durationMs}ms)</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {canvasTab === 'history' && (
              <div className="space-y-3 p-2">
                <div className="flex items-center space-x-3 text-slate-300 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <div className="font-semibold">v1.0.4 - Saved by Aman K. (Current)</div>
                  <div className="text-slate-500">Today at 11:48 PM</div>
                  <span className="bg-indigo-900/40 border border-indigo-800/60 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">Active</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-xs opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <div>v1.0.3 - Setup woo commerce payload webhook</div>
                  <div>Today at 11:12 PM</div>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-xs opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <div>v1.0.2 - Integrated Gemini AI extraction properties</div>
                  <div>Yesterday at 4:32 PM</div>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-xs opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <div>v1.0.1 - Initial layout scaffold</div>
                  <div>July 11, 2026 at 2:05 PM</div>
                </div>
              </div>
            )}

            {canvasTab === 'versions' && (
              <div className="grid grid-cols-3 gap-4 p-2">
                <div className="border border-slate-800 bg-slate-900/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-400">Production</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded font-bold uppercase">Live</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">Version: v1.0.2</p>
                  <p className="text-[10px] text-slate-500 italic">"Active order check and basic sheets integration"</p>
                </div>
                <div className="border border-slate-800 bg-indigo-950/20 p-3 rounded-lg border-indigo-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-400">Staging</span>
                    <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1 py-0.2 rounded font-bold uppercase">Review</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">Version: v1.0.4</p>
                  <p className="text-[10px] text-slate-500 italic">"Added Gemini order categorizer and Slack notification template"</p>
                </div>
                <div className="border border-slate-800 bg-slate-900/50 p-3 rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-400">v1.0.1 (Archived)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">Version: v1.0.1</p>
                  <p className="text-[10px] text-slate-500 italic">"Scaffolding triggers and initial controls layout"</p>
                </div>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
