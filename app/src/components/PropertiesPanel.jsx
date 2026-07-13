import React, { useState, useEffect, memo } from 'react';
import { 
  X, 
  HelpCircle, 
  Settings, 
  Play, 
  Check, 
  Copy, 
  Maximize2, 
  Lock, 
  Database,
  Mail,
  Slack as SlackIcon,
  Clock,
  Columns,
  Sparkles,
  RefreshCw,
  Terminal,
  ExternalLink
} from 'lucide-react';

function PropertiesPanel({
  node,
  onNodeChange,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('setup');
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testSuccess, setTestSuccess] = useState(true);
  
  // Local state for AI properties to allow live editing
  const [promptText, setPromptText] = useState(node.data?.prompt || '');
  const [temp, setTemp] = useState(node.data?.temperature || 0.3);
  const [model, setModel] = useState(node.data?.model || 'gemini-3.5-flash');
  const [agentName, setAgentName] = useState(node.data?.agentName || 'Order Analysis Agent');

  // Local state for Email / Slack / Condition to allow responsive forms
  const [emailSubject, setEmailSubject] = useState(node.data?.subject || '');
  const [emailBody, setEmailBody] = useState(node.data?.body || '');
  const [slackMessage, setSlackMessage] = useState(node.data?.message || '');
  const [slackChannel, setSlackChannel] = useState(node.data?.channel || '');

  // Reset local states when active node changes
  useEffect(() => {
    setPromptText(node.data?.prompt || '');
    setTemp(node.data?.temperature || 0.3);
    setModel(node.data?.model || 'gemini-3.5-flash');
    setAgentName(node.data?.agentName || 'Order Analysis Agent');
    setEmailSubject(node.data?.subject || '');
    setEmailBody(node.data?.body || '');
    setSlackMessage(node.data?.message || '');
    setSlackChannel(node.data?.channel || '');
    setIsTesting(false);
    setCopied(false);
  }, [node]);

  const handleSaveData = (key, value) => {
    onNodeChange(node.id, {
      ...node.data,
      [key]: value
    });
  };

  // Run simulated prompt testing
  const handleTestNode = () => {
    setIsTesting(true);
    setCopied(false);
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
      // Update nodes list with current setups
      onNodeChange(node.id, {
        ...node.data,
        prompt: promptText,
        temperature: temp,
        model: model,
        agentName: agentName
      });
    }, 1500);
  };

  const handleCopyOutput = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Substitute mustache bracket tags for nice visual mockup displays
  const renderVariablesMock = (text) => {
    if (!text) return '';
    return text
      .replace(/\{\{customer\.name\}\}/g, 'Aman K.')
      .replace(/\{\{customer\.first_name\}\}/g, 'Aman')
      .replace(/\{\{customer\.email\}\}/g, 'aman@example.com')
      .replace(/\{\{order\.id\}\}/g, 'WC-2026-9842')
      .replace(/\{\{order\.total\}\}/g, '12,450')
      .replace(/\{\{node3\.intent\}\}/g, 'high_value_purchase')
      .replace(/\{\{node3\.confidence\}\}/g, '0.92');
  };

  const renderSetupTabContent = () => {
    switch (node.type) {
      case 'woocommerce':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Trigger Event
              </label>
              <select
                value={node.data?.event || 'order.created'}
                onChange={(e) => handleSaveData('event', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="order.created">Order Created</option>
                <option value="order.updated">Order Updated</option>
                <option value="customer.created">Customer Created</option>
                <option value="product.low_stock">Product Low Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                WooCommerce Store URL
              </label>
              <input
                type="text"
                value={node.data?.storeUrl || ''}
                onChange={(e) => handleSaveData('storeUrl', e.target.value)}
                placeholder="https://my-store.com"
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Credentials API Keys</span>
                <span className="text-[10px] text-slate-400 font-normal flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>Encrypted</span>
                </span>
              </label>
              <input
                type="text"
                disabled
                value={node.data?.credentials || 'Shop Admin Key (***-***)'}
                className="w-full bg-slate-100 border border-slate-200 text-xs text-slate-500 p-2.5 rounded-lg cursor-not-allowed"
              />
            </div>

            <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-lg text-xs">
              <h4 className="font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span>Webhooks Payload Scope</span>
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Automatically configures WooCommerce webhooks using REST endpoints. Captures line items, pricing, billing details, and address metadata.
              </p>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Check Parameter
                </label>
                <input
                  type="text"
                  value={node.data?.field || 'cart.total_price'}
                  onChange={(e) => handleSaveData('field', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Operator
                </label>
                <select
                  value={node.data?.operator || 'greater_than'}
                  onChange={(e) => handleSaveData('operator', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="greater_than">is greater than (&gt;)</option>
                  <option value="less_than">is less than (&lt;)</option>
                  <option value="equals">equals (==)</option>
                  <option value="contains">contains string</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Target value
              </label>
              <input
                type="text"
                value={node.data?.value || '5000'}
                onChange={(e) => handleSaveData('value', e.target.value)}
                placeholder="5000"
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-lg text-xs leading-relaxed text-slate-600">
              💡 <strong>Condition Splitting Routing:</strong> Orders meeting this logic branch into the <strong>True</strong> route (releasing the AI Agent loop), otherwise they enter the <strong>False</strong> route.
            </div>
          </div>
        );

      case 'ai-agent':
        return (
          <div className="space-y-4">
            {/* Agent Select Row */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Agent
                </label>
                <select
                  value={agentName}
                  onChange={(e) => {
                    setAgentName(e.target.value);
                    handleSaveData('agentName', e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer font-medium"
                >
                  <option value="Order Analysis Agent">Order Analysis Agent</option>
                  <option value="Customer Classifier Agent">Customer Classifier Agent</option>
                  <option value="Translation Agent">Translation Agent</option>
                  <option value="Summarizer Agent">Summarizer Agent</option>
                </select>
              </div>
              <button className="mt-6 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors" title="Agent Settings">
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Prompt textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Prompt
                </label>
                <button 
                  className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5 cursor-pointer"
                  onClick={() => setPromptText(prev => prev + " {{order.id}}")}
                >
                  <span>{"{x}"} insert variable</span>
                </button>
              </div>
              <textarea
                value={promptText}
                onChange={(e) => {
                  setPromptText(e.target.value);
                  handleSaveData('prompt', e.target.value);
                }}
                rows={3}
                placeholder="Instruct the AI model..."
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Model Select */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  handleSaveData('model', e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer font-medium"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Analytical)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Temperature
                </label>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                  {temp}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temp}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTemp(val);
                  handleSaveData('temperature', val);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 px-0.5 font-medium mt-1">
                <span>Deterministic (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            {/* Test Node Section */}
            <div className="border-t border-slate-100 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <span>Test this node</span>
                </span>
                <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold">
                  <span>Last Run: 2 mins ago</span>
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full font-bold text-[8px] uppercase">
                    Success
                  </span>
                </span>
              </div>

              <button
                id="test-prompt-node-btn"
                onClick={handleTestNode}
                disabled={isTesting}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-slate-500 fill-slate-500" />
                )}
                <span>{isTesting ? 'Running inference...' : 'Test Node'}</span>
              </button>

              {/* Console log simulation overlay */}
              {isTesting && (
                <div className="mt-3 bg-slate-950 text-[10px] text-indigo-300 font-mono p-2.5 rounded-lg space-y-1 select-none leading-relaxed">
                  <div className="flex items-center space-x-1.5">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span className="text-indigo-400 font-bold">Inference Console:</span>
                  </div>
                  <p className="text-slate-400 animate-pulse">● Loading model {model}...</p>
                  <p className="text-slate-400 animate-pulse">● Packaging payload (order total ₹12,450)...</p>
                  <p className="text-slate-400 animate-pulse">● Triggering dynamic system instruction query...</p>
                </div>
              )}

              {/* Test Output display */}
              {!isTesting && testSuccess && (
                <div className="mt-3 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Output Payload</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        id="copy-json-btn"
                        onClick={() => handleCopyOutput(JSON.stringify(node.data?.testOutput, null, 2))}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-all cursor-pointer"
                        title="Copy JSON to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-all cursor-pointer" title="Expand View">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="w-full bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-mono p-3 rounded-lg overflow-x-auto leading-relaxed max-h-52">
                    {JSON.stringify(
                      node.data?.testOutput || {
                        intent: "high_value_purchase",
                        customer_type: "new_customer",
                        category: "electronics",
                        recommended_upsell: ["extended_warranty", "wireless_earbuds"],
                        confidence: 0.92
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Recipient Email
              </label>
              <input
                type="text"
                value={node.data?.recipient || '{{customer.email}}'}
                onChange={(e) => handleSaveData('recipient', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => {
                  setEmailSubject(e.target.value);
                  handleSaveData('subject', e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Body text
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => {
                  setEmailBody(e.target.value);
                  handleSaveData('body', e.target.value);
                }}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono leading-relaxed resize-none"
              />
            </div>

            {/* Real-time Mock Preview */}
            <div className="border border-slate-200/80 bg-white p-3 rounded-xl shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Visual Mail Preview</span>
              </h4>
              <div className="border border-slate-100 rounded-lg p-2.5 text-[11px] text-slate-600 bg-slate-50/50">
                <div className="mb-1.5 pb-1.5 border-b border-slate-100">
                  <p className="font-semibold text-slate-700">Subject: <span className="font-normal text-slate-600">{renderVariablesMock(emailSubject)}</span></p>
                </div>
                <p className="whitespace-pre-line text-slate-500 font-sans leading-relaxed">
                  {renderVariablesMock(emailBody)}
                </p>
              </div>
            </div>
          </div>
        );

      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Slack Channel
              </label>
              <input
                type="text"
                value={slackChannel}
                onChange={(e) => {
                  setSlackChannel(e.target.value);
                  handleSaveData('channel', e.target.value);
                }}
                placeholder="#sales-alerts"
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Message Body
              </label>
              <textarea
                value={slackMessage}
                onChange={(e) => {
                  setSlackMessage(e.target.value);
                  handleSaveData('message', e.target.value);
                }}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono leading-relaxed resize-none"
              />
            </div>

            {/* Slack UI mockup */}
            <div className="border border-slate-200 bg-slate-900 p-3.5 rounded-xl text-xs text-slate-100 shadow-md">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <SlackIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Slack Message Simulator</span>
              </h4>
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0">
                  W
                </div>
                <div>
                  <div className="flex items-baseline space-x-1.5 mb-0.5">
                    <span className="font-bold text-[11px] text-white">Workflow Bot</span>
                    <span className="bg-slate-800 text-[8px] text-slate-400 font-semibold px-1 py-0.2 rounded">APP</span>
                    <span className="text-[9px] text-slate-500">11:49 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-line">
                    {renderVariablesMock(slackMessage)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'google-sheets':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Spreadsheet
                </label>
                <select
                  value={node.data?.spreadsheetId || ''}
                  onChange={(e) => handleSaveData('spreadsheetId', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                >
                  <option value="spreadsheet_high_value_orders_2026">High-Value Orders 2026</option>
                  <option value="general_logs_sales">General Store Sales Logs</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Worksheet
                </label>
                <select
                  value={node.data?.sheetName || ''}
                  onChange={(e) => handleSaveData('sheetName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                >
                  <option value="Sheet1">Sheet1</option>
                  <option value="Sheet2">Sheet2</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Row mapping columns
              </label>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-2">Header key</th>
                      <th className="p-2">Variable value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {(node.data?.columns || []).map((col, idx) => (
                      <tr key={`col-${idx}`}>
                        <td className="p-2 font-mono font-medium text-slate-700">{col.key}</td>
                        <td className="p-2 text-indigo-600 font-mono text-[10px]">{col.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Delay Amount
                </label>
                <input
                  type="number"
                  value={node.data?.duration || '24'}
                  onChange={(e) => handleSaveData('duration', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Unit
                </label>
                <select
                  value={node.data?.unit || 'hours'}
                  onChange={(e) => handleSaveData('unit', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            <div className="bg-purple-50 text-purple-700 border border-purple-100 p-3 rounded-lg text-xs leading-relaxed flex items-start space-x-2">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Forces the workspace execution loop to wait for <strong>{node.data?.duration || '24'} {node.data?.unit || 'hours'}</strong> before moving down to subsequent action endpoints.
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Note content
              </label>
              <textarea
                value={node.data?.note || ''}
                onChange={(e) => handleSaveData('note', e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans leading-relaxed resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="is-customer-note"
                type="checkbox"
                checked={node.data?.isCustomerNote || false}
                onChange={(e) => handleSaveData('isCustomerNote', e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is-customer-note" className="text-xs text-slate-600 font-medium cursor-pointer">
                Add as public customer-facing note on WooCommerce
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <aside id="sidebar-inspector" className="w-[320px] border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden select-none">
      
      {/* Header Info */}
      <div className="p-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            {node.type === 'ai-agent' && <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />}
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              {node.number}. {node.title}
            </h2>
          </div>
          <button
            id="inspector-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            title="Close inspector panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-medium flex items-center">
          <span>Node: Uses integrated integrations to process workflows.</span>
          <span className="text-indigo-600 hover:underline cursor-pointer ml-1 inline-flex items-center space-x-0.5">
            <span>Learn more</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </p>
      </div>

      {/* Selector Tabs (Setup / Input / Output / Settings) */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 shrink-0">
        {['setup', 'input', 'output', 'settings'].map((tab) => (
          <button
            id={`tab-inspect-${tab}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-center text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main configuration forms panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'setup' && renderSetupTabContent()}

        {activeTab === 'input' && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incoming Data Stream Payload</h4>
            <pre className="bg-slate-50 border border-slate-100 p-3 rounded-lg font-mono text-[10px] text-slate-600 overflow-x-auto leading-relaxed max-h-96">
{`{
  "order": {
    "id": "WC-2026-9842",
    "total": 12450.00,
    "currency": "INR",
    "status": "pending",
    "items_count": 3
  },
  "customer": {
    "id": "cust_9014",
    "name": "Aman K.",
    "first_name": "Aman",
    "email": "aman@example.com",
    "orders_count": 1
  }
}`}
            </pre>
            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              * This visual JSON represents the incoming model structure mapped from WooCommerce. You can inject these parameters as variables using {"{{variable_name}}"} anywhere in texts.
            </p>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Output Parameters Generated</h4>
            <pre className="bg-slate-50 border border-slate-100 p-3 rounded-lg font-mono text-[10px] text-slate-600 overflow-x-auto leading-relaxed max-h-96">
{node.type === 'ai-agent' ? 
`{
  "intent": "high_value_purchase",
  "customer_type": "new_customer",
  "category": "electronics",
  "recommended_upsell": [
    "extended_warranty",
    "wireless_earbuds",
    "laptop_bag"
  ],
  "confidence": 0.92
}` : 
`{
  "status": "success",
  "node_id": "${node.id}",
  "timestamp": "2026-07-12T23:49:01"
}`}
            </pre>
            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              These properties are output by this node and will be fully retrievable in consecutive action fields (e.g. {"{{node3.intent}}"} or {"{{node3.confidence}}"}).
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Timeout Duration</label>
              <div className="flex items-center space-x-2">
                <input type="number" defaultValue={30} className="w-20 bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2 rounded-lg" />
                <span className="text-slate-500 font-medium">seconds</span>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Retry Policies</label>
              <select className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-2 rounded-lg font-medium">
                <option>None (Fail immediately)</option>
                <option>Exponential Backoff (3 retries)</option>
                <option>Linear Retry (2 retries)</option>
              </select>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-700 text-xs">Ignore Failure Errors</h5>
                <p className="text-[9px] text-slate-400 leading-normal">Allows the execution loop to proceed even if this node crashes.</p>
              </div>
              <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            </div>
          </div>
        )}
      </div>

      {/* inspector utility help */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 text-center flex items-center justify-center space-x-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>Configurations save automatically in real-time.</span>
      </div>
    </aside>
  );
}

export default memo(PropertiesPanel);
