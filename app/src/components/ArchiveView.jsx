import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Play, 
  Copy, 
  Trash2, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  Filter,
  Layers,
  CheckCircle,
  X,
  Store,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Table,
  GitFork,
  Hourglass,
  MoreVertical,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Maps node type to icon component & styling
const getIntegrationIcon = (type, className = "w-4 h-4") => {
  switch (type) {
    case 'woocommerce':
      return <Store className={`${className} text-violet-600`} />;
    case 'form':
      return <FileText className={`${className} text-blue-600`} />;
    case 'wordpress':
      return <Globe className={`${className} text-sky-600`} />;
    case 'schedule':
      return <Clock className={`${className} text-orange-600`} />;
    case 'webhook':
      return <Globe className={`${className} text-rose-600`} />;
    case 'email':
      return <Mail className={`${className} text-blue-600`} />;
    case 'slack':
      return <MessageSquare className={`${className} text-emerald-600`} />;
    case 'google-sheets':
      return <Table className={`${className} text-green-600`} />;
    case 'http-request':
      return <Globe className={`${className} text-purple-600`} />;
    case 'ai-agent':
      return <Sparkles className={`${className} text-indigo-600`} />;
    case 'condition':
      return <GitFork className={`${className} text-amber-600`} />;
    case 'delay':
      return <Hourglass className={`${className} text-purple-600`} />;
    default:
      return <Layers className={`${className} text-slate-500`} />;
  }
};

const getIntegrationBgColor = (type) => {
  switch (type) {
    case 'woocommerce': return 'bg-violet-50 border-violet-100';
    case 'form': return 'bg-blue-50 border-blue-100';
    case 'wordpress': return 'bg-sky-50 border-sky-100';
    case 'schedule': return 'bg-orange-50 border-orange-100';
    case 'webhook': return 'bg-rose-50 border-rose-100';
    case 'email': return 'bg-blue-50 border-blue-100';
    case 'slack': return 'bg-emerald-50 border-emerald-100';
    case 'google-sheets': return 'bg-green-50 border-green-100';
    case 'http-request': return 'bg-purple-50 border-purple-100';
    case 'ai-agent': return 'bg-indigo-50 border-indigo-100';
    case 'condition': return 'bg-amber-50 border-amber-100';
    case 'delay': return 'bg-purple-50 border-purple-100';
    default: return 'bg-slate-50 border-slate-100';
  }
};

export default function ArchiveView({ 
  workflows, 
  onSelectWorkflow, 
  onCreateWorkflow, 
  onDeleteWorkflow, 
  onDuplicateWorkflow, 
  onToggleActive 
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [quickExecutedWf, setQuickExecutedWf] = useState(null); // workflow ID currently running a simulation from dashboard

  // Filter and Search workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(wf => {
      const matchesSearch = 
        wf.title.toLowerCase().includes(search.toLowerCase()) || 
        (wf.description || '').toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'active' && wf.isActive) || 
        (filter === 'inactive' && !wf.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [workflows, search, filter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = workflows.length;
    const active = workflows.filter(w => w.isActive).length;
    const totalSteps = workflows.reduce((acc, w) => acc + (w.nodes?.length || 0), 0);
    return { total, active, totalSteps };
  }, [workflows]);

  // Handle direct simulation run from card
  const handleQuickRun = (e, wfId) => {
    e.stopPropagation();
    if (quickExecutedWf) return;
    
    setQuickExecutedWf(wfId);
    setTimeout(() => {
      setQuickExecutedWf(null);
    }, 2000);
  };

  return (
    <div id="workflows-archive-container" className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Upper Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-display text-slate-800 flex items-center space-x-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              <span>Workflow Directory</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              Design, orchestrate, and monitor your automated triggers, conditional logic pipelines, and advanced AI agents.
            </p>
          </div>
          
          <button
            id="create-new-workflow-btn"
            onClick={onCreateWorkflow}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Workflow</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Pipelines</div>
              <div className="text-xl font-bold text-slate-800">{stats.total}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100/60 text-indigo-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">Active Live</div>
              <div className="text-xl font-bold text-slate-800">{stats.active}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100/60 text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Average Steps</div>
              <div className="text-xl font-bold text-slate-800">
                {stats.total > 0 ? (stats.totalSteps / stats.total).toFixed(1) : '0.0'}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search workflows by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter badges */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto">
            <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-wider flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active Only' },
              { id: 'inactive', label: 'Inactive' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                  filter === item.id 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick run toast feedback */}
        <AnimatePresence>
          {quickExecutedWf && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-center space-x-2.5 shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="font-semibold">
                Successfully executed local background pipeline simulation for:{" "}
                <span className="underline font-bold">
                  {workflows.find(w => w.id === quickExecutedWf)?.title}
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workflows list grid */}
        {filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map(wf => {
              const nodeTypes = [...new Set((wf.nodes || []).map(n => n.type))];

              return (
                <div
                  key={wf.id}
                  onClick={() => onSelectWorkflow(wf.id)}
                  className="group bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div className="p-6 space-y-4">
                    {/* Top status & toggle header */}
                    <div className="flex items-start justify-between">
                      {/* Active/Inactive dot/badge */}
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${wf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${wf.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {wf.isActive ? 'Active live' : 'Inactive'}
                        </span>
                      </div>

                      {/* Power toggle button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleActive(wf.id);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          wf.isActive ? 'bg-indigo-600' : 'bg-slate-200 border border-slate-300/60'
                        }`}
                        title={wf.isActive ? "Deactivate Workflow" : "Activate Workflow"}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transform duration-200 ${
                            wf.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {wf.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 h-10">
                        {wf.description || "No description provided for this visual automated pipeline."}
                      </p>
                    </div>

                    {/* Nodes integration trace preview */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Integrated services ({nodeTypes.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {nodeTypes.length > 0 ? (
                          nodeTypes.map((type, idx) => (
                            <div
                              key={idx}
                              title={type.toUpperCase()}
                              className={`p-1.5 rounded-lg border flex items-center justify-center ${getIntegrationBgColor(type)}`}
                            >
                              {getIntegrationIcon(type, "w-3.5 h-3.5")}
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] italic text-slate-400">Empty canvas canvas</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer metadata & buttons */}
                  <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center space-x-4">
                      {/* Last run status */}
                      <span className="flex items-center space-x-1" title="Last triggered time">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wf.lastRun || "Never"}</span>
                      </span>

                      {/* Success rate percentage */}
                      <span className="flex items-center space-x-1" title="Workflow run success rate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wf.successRate || "—"}</span>
                      </span>

                      {/* Nodes Count */}
                      <span className="bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {wf.nodes?.length || 0} step{(wf.nodes?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Action Tools */}
                    <div className="flex items-center space-x-1">
                      {/* Direct Execute Trigger */}
                      <button
                        onClick={(e) => handleQuickRun(e, wf.id)}
                        disabled={quickExecutedWf !== null}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="Simulate Workflow Run"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Duplicate Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateWorkflow(wf.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="Duplicate Workflow"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkflow(wf.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="Delete Workflow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-700">No workflows match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adjust your filters, search queries, or build a brand-new workflow canvas to get started.
              </p>
            </div>
            <button
              onClick={onCreateWorkflow}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create first workflow</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}