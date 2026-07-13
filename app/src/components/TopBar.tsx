import React, { useState } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  Save, 
  ChevronDown, 
  MoreHorizontal, 
  Play, 
  Check, 
  Edit3,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

interface TopBarProps {
  title: string;
  onTitleChange: (val: string) => void;
  isActive: boolean;
  onActiveToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExecute: () => void;
  isExecuting: boolean;
  onSave: () => void;
  isSaving: boolean;
}

export default function TopBar({
  title,
  onTitleChange,
  isActive,
  onActiveToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExecute,
  isExecuting,
  onSave,
  isSaving
}: TopBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(title);
  const [showPublishMenu, setShowPublishMenu] = useState(false);

  const handleSaveTitle = () => {
    if (editVal.trim()) {
      onTitleChange(editVal);
    }
    setIsEditing(false);
  };

  return (
    <header id="app-topbar" className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left: Breadcrumbs & Editable Title */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-slate-400">Workflows</span>
        <span className="text-slate-300 text-sm">/</span>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <input
              type="text"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setEditVal(title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="text-sm font-semibold text-slate-800 border-b-2 border-indigo-500 focus:outline-none px-1 py-0.5 bg-indigo-50/50 rounded"
            />
          ) : (
            <div className="flex items-center space-x-1.5 group">
              <h1 className="text-sm font-semibold text-slate-800 tracking-tight">
                {title}
              </h1>
              <button
                id="edit-title-btn"
                onClick={() => {
                  setEditVal(title);
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 transition-all cursor-pointer"
                title="Edit title"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle/Right: Controls */}
      <div className="flex items-center space-x-4">
        {/* Toggle active switch */}
        <div className="flex items-center space-x-2 mr-2">
          <span className={`text-xs font-medium transition-colors ${!isActive ? 'text-slate-600' : 'text-slate-400'}`}>
            Inactive
          </span>
          <button
            id="status-toggle-switch"
            onClick={onActiveToggle}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
              isActive ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transform duration-200 ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
            Active
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Undo / Redo */}
        <div className="flex items-center space-x-1">
          <button
            id="undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo 
                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo 
                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Execute flow shortcut */}
        <button
          id="quick-execute-btn"
          onClick={onExecute}
          disabled={isExecuting}
          className="flex items-center space-x-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {isExecuting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
          )}
          <span>{isExecuting ? 'Running...' : 'Execute'}</span>
        </button>

        {/* Save button */}
        <button
          id="save-workflow-btn"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center space-x-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        {/* Publish Dropdown */}
        <div className="relative">
          <button
            id="publish-dropdown-btn"
            onClick={() => setShowPublishMenu(!showPublishMenu)}
            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold pl-3 pr-2.5 py-1.5 rounded-lg shadow-sm shadow-indigo-100 transition-colors cursor-pointer"
          >
            <span>Publish</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showPublishMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowPublishMenu(false)} 
              />
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs">
                <button
                  id="pub-production-btn"
                  onClick={() => setShowPublishMenu(false)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center space-x-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Push to Production</span>
                </button>
                <button
                  id="pub-staging-btn"
                  onClick={() => setShowPublishMenu(false)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center space-x-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Push to Staging</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  id="view-api-docs-btn"
                  onClick={() => setShowPublishMenu(false)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-500 flex items-center space-x-2 cursor-pointer"
                >
                  <span>View Webhook API</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* More Options */}
        <button
          id="topbar-more-btn"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
