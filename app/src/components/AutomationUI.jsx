import React from 'react';
import { 
  Play, Save, ChevronRight, Settings, 
  Database, Mail, MessageSquare, Table, 
  Globe, Zap, Filter, Clock, Repeat, 
  Maximize2, Minus, Plus, MousePointer2,
  X, Cpu, ChevronDown, CheckCircle2
} from 'lucide-react';

const AutomationUI = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* --- TOP HEADER --- */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Workflows</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-medium">High Value Order Automation</span>
          <button className="ml-2 text-slate-400 hover:text-slate-600">
            <Settings size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-4">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Inactive</span>
            <div className="w-10 h-5 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active</span>
          </div>
          <button className="px-4 py-1.5 text-sm font-medium border rounded-lg hover:bg-slate-50">Save</button>
          <button className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            Publish <ChevronDown size={14} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* --- LEFT TOOLBOX (Triggers/Actions) --- */}
        <aside className="w-64 border-r bg-white overflow-y-auto p-4 flex flex-col gap-6">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Triggers</h3>
            <div className="space-y-2">
              <ToolItem icon={<Database className="text-purple-600" />} label="WooCommerce" sub="Order Created" />
              <ToolItem icon={<Table className="text-blue-600" />} label="Form" sub="Submit" />
              <ToolItem icon={<Globe className="text-sky-600" />} label="WordPress" sub="New User Registered" />
            </div>
            <button className="text-xs text-indigo-600 mt-3 font-medium">View all triggers</button>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Actions</h3>
            <div className="space-y-2">
              <ToolItem icon={<Mail className="text-blue-500" />} label="Email" sub="Send Email" />
              <ToolItem icon={<MessageSquare className="text-emerald-500" />} label="Slack" sub="Send Message" />
              <ToolItem icon={<Table className="text-green-600" />} label="Google Sheets" sub="Add Row" />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Flow Controls</h3>
            <div className="space-y-2">
              <ToolItem icon={<Filter className="text-orange-500" />} label="Condition" sub="IF / ELSE" />
              <ToolItem icon={<Clock className="text-indigo-500" />} label="Delay" sub="Wait for specific time" />
            </div>
          </section>

          {/* AI Builder CTA */}
          <div className="mt-auto p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Workflow Builder</h4>
            <p className="text-[11px] text-indigo-700 mb-3 leading-relaxed">Describe what you want to automate and AI will build it.</p>
            <button className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 hover:shadow-sm transition-all">
              Try AI Builder ✨
            </button>
          </div>
        </aside>

        {/* --- CENTRAL CANVAS --- */}
        <section className="flex-1 relative bg-slate-50 overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-sm border p-1 flex items-center gap-1">
            <ToolbarBtn icon={<MousePointer2 size={16} />} />
            <ToolbarBtn icon={<Maximize2 size={16} />} />
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <ToolbarBtn icon={<Minus size={16} />} />
            <span className="text-xs font-medium px-2">100%</span>
            <ToolbarBtn icon={<Plus size={16} />} />
          </div>

          {/* Workflow Diagram (Simplified Mockup) */}
          <div className="h-full flex flex-col items-center pt-20">
            <WorkflowNode icon={<Database className="text-purple-600" />} id="1" title="WooCommerce" desc="Order Created" active />
            <div className="h-8 w-px bg-slate-300"></div>
            <WorkflowNode icon={<Filter className="text-orange-500" />} id="2" title="Condition" desc="Cart Total > ₹5,000" active />
            
            {/* Logic Branch */}
            <div className="relative w-[400px]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-8 border-x border-t border-slate-300 rounded-t-xl"></div>
                <div className="flex justify-between pt-8">
                    <div className="flex flex-col items-center">
                        <span className="mb-4 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">True</span>
                        <WorkflowNode icon={<Cpu className="text-indigo-600" />} id="3" title="AI Agent" desc="Analyze Order" selected />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="mb-4 px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded uppercase">False</span>
                        <WorkflowNode icon={<Clock className="text-indigo-500" />} id="7" title="Delay" desc="Wait 24 Hours" active />
                    </div>
                </div>
            </div>
          </div>

          {/* Canvas Footer */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="p-2 bg-white border rounded-lg shadow-sm w-24 h-24 flex items-center justify-center opacity-50">
               <div className="grid grid-cols-2 gap-1 w-full h-full p-1 border border-dashed border-indigo-200">
                  <div className="bg-slate-200 rounded"></div>
                  <div className="bg-slate-200 rounded"></div>
                  <div className="bg-slate-400 rounded"></div>
               </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-1 flex gap-1">
              <button className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md flex items-center gap-2">
                <Play size={12} fill="white" /> Execute Workflow
              </button>
              <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-50">Logs</button>
              <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-50">History</button>
              <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-50">Versions</button>
            </div>
            
            <div className="text-[11px] text-slate-400 flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
               <CheckCircle2 size={12} className="text-emerald-500" /> All changes saved
            </div>
          </div>
        </section>

        {/* --- RIGHT PROPERTIES PANEL --- */}
        <aside className="w-96 border-l bg-white overflow-y-auto flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Cpu size={18} /></div>
              <h2 className="font-bold text-sm">3. AI Agent</h2>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>

          <div className="flex border-b text-xs font-bold text-slate-400 uppercase">
            <button className="flex-1 py-3 text-indigo-600 border-b-2 border-indigo-600">Setup</button>
            <button className="flex-1 py-3 hover:text-slate-600">Input</button>
            <button className="flex-1 py-3 hover:text-slate-600">Output</button>
            <button className="flex-1 py-3 hover:text-slate-600">Settings</button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Agent</label>
              <div className="flex items-center justify-between p-2.5 border rounded-lg bg-slate-50/50 cursor-pointer">
                <span className="text-sm">Order Analysis Agent</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Prompt</label>
                <span className="text-[10px] text-indigo-600 font-bold border border-indigo-100 px-1 rounded">{"{x}"}</span>
              </div>
              <textarea 
                className="w-full h-24 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none"
                defaultValue="Analyze this order and extract customer intent, product category, and suggest upsell products."
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Model</label>
              <div className="flex items-center justify-between p-2.5 border rounded-lg cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-indigo-500" />
                  <span className="text-sm font-medium">Gemini 1.5 Pro</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Temperature</label>
                <span className="text-xs font-mono">0.3</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                 <button className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">Test Node</button>
                 <span className="text-[10px] text-slate-400">Last Run: 2 mins ago <span className="text-emerald-500 ml-1">Success</span></span>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 text-[11px] font-mono leading-relaxed relative group">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex gap-2">
                    <button className="text-slate-400 hover:text-white"><Save size={12}/></button>
                    <button className="text-slate-400 hover:text-white"><Maximize2 size={12}/></button>
                </div>
                <code className="text-emerald-400">
                  {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"intent"</span>: <span className="text-amber-200">"high_value_purchase"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"customer_type"</span>: <span className="text-amber-200">"new_customer"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"category"</span>: <span className="text-amber-200">"electronics"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"recommended_upsell"</span>: [<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-200">"extended_warranty"</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-200">"wireless_earbuds"</span><br/>
                  &nbsp;&nbsp;],<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"confidence"</span>: <span className="text-orange-300">0.92</span><br/>
                  {"}"}
                </code>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

// Helper Components
const ToolItem = ({ icon, label, sub }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-100 transition-all">
    <div className="p-1.5 bg-white border shadow-sm rounded-md">{icon}</div>
    <div className="flex flex-col">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className="text-[10px] text-slate-400 leading-tight">{sub}</span>
    </div>
  </div>
);

const ToolbarBtn = ({ icon }) => (
  <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600">{icon}</button>
);

const WorkflowNode = ({ icon, title, desc, active, selected }) => (
  <div className={`
    w-52 bg-white rounded-xl border p-3 flex flex-col items-center text-center shadow-sm relative transition-all
    ${selected ? 'ring-2 ring-indigo-500 border-indigo-200' : 'border-slate-200'}
  `}>
    {active && <CheckCircle2 size={16} className="absolute -top-2 -right-2 text-emerald-500 bg-white rounded-full" />}
    <div className="p-2 mb-2 bg-slate-50 rounded-lg">{icon}</div>
    <h4 className="text-[11px] font-bold text-slate-800 leading-tight">{title}</h4>
    <p className="text-[10px] text-slate-400">{desc}</p>
  </div>
);

export default AutomationUI;