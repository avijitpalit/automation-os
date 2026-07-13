import React, { useState } from 'react';
import { 
  Store, 
  FileText, 
  Globe, 
  Clock, 
  Webhook, 
  Mail, 
  MessageSquare, 
  Table, 
  Sparkles, 
  GitFork, 
  Hourglass, 
  Shuffle, 
  RotateCw,
  Search,
  Plus
} from 'lucide-react';
import { SidebarItem, SIDEBAR_ITEMS } from '../types';

interface LeftPanelProps {
  onAddItem: (type: SidebarItem['id']) => void;
}

// Map of string names to actual Lucide Icon Components
export function getSidebarIcon(iconName: string, className = "w-4 h-4") {
  switch (iconName) {
    case 'store':
      return <Store className={className} />;
    case 'file-text':
      return <FileText className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'webhook':
      return <Webhook className={className} />;
    case 'mail':
      return <Mail className={className} />;
    case 'message-square':
      return <MessageSquare className={className} />;
    case 'table':
      return <Table className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'git-fork':
      return <GitFork className={className} />;
    case 'hourglass':
      return <Hourglass className={className} />;
    case 'shuffle':
      return <Shuffle className={className} />;
    case 'rotate-cw':
      return <RotateCw className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export default function LeftPanel({ onAddItem }: LeftPanelProps) {
  const [search, setSearch] = useState('');

  const filteredItems = SIDEBAR_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const triggers = filteredItems.filter((i) => i.category === 'triggers');
  const actions = filteredItems.filter((i) => i.category === 'actions');
  const controls = filteredItems.filter((i) => i.category === 'controls');

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('application/reactflow-type', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const renderCategory = (title: string, items: SidebarItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
          {title}
        </h3>
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              id={`sidebar-item-${item.id}`}
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="group flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-sm hover:shadow-indigo-50/40 transition-all cursor-grab active:cursor-grabbing text-left"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`p-2 rounded-lg border ${item.color} shrink-0`}>
                  {getSidebarIcon(item.iconName, "w-4 h-4")}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-700 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <button
                id={`add-btn-${item.id}`}
                onClick={() => onAddItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded transition-all cursor-pointer"
                title={`Add ${item.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside id="sidebar-components" className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-hidden select-none">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200/60 bg-white">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            id="components-search"
            type="text"
            placeholder="Search triggers & actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-700 pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Categories Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderCategory('Triggers', triggers)}
        {renderCategory('Actions', actions)}
        {renderCategory('Flow Controls', controls)}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400">No components found</p>
          </div>
        )}
      </div>

      {/* Helper Footer */}
      <div className="p-3 border-t border-slate-100 bg-white/50 text-[10px] text-slate-400 text-center">
        💡 Drag items to canvas or click (+)
      </div>
    </aside>
  );
}
