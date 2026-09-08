import React, { useState } from 'react';
import { LayoutNode } from '../../engine/TraceEngine';
import { 
  X, 
  GitBranch, 
  Zap, 
  Copy, 
  Check, 
  Terminal, 
  BrainCircuit, 
  Database, 
  Layers, 
  Code 
} from 'lucide-react';

interface NodeInspectorDrawerProps {
  node: LayoutNode | null;
  onClose: () => void;
  onBranch: (node: LayoutNode) => void;
  onInjectChaos: (node: LayoutNode) => void;
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  onClose,
  onBranch,
  onInjectChaos
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'payload' | 'reasoning' | 'memory'>('payload');

  if (!node) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(node, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-96 border-l border-[#1E2330] bg-[#0B0D13] flex flex-col h-full z-20 select-none shadow-2xl shrink-0">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#1E2330] flex items-center justify-between bg-[#0F121A]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C212E] text-cyan-400 border border-[#2A3245]">
              {node.agentName}
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
              node.status === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : node.status === 'error'
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {node.status}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white mt-1 font-mono truncate max-w-[240px]">
            {node.action || node.role}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            title="Copy JSON"
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1C212E] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1C212E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="p-3 border-b border-[#1E2330] bg-[#07080B] flex items-center space-x-2">
        <button
          onClick={() => onBranch(node)}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-[#1A162B] hover:bg-[#251F3D] text-purple-300 border border-purple-500/40 text-xs font-medium py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Fork Branch ('B')</span>
        </button>

        <button
          onClick={() => onInjectChaos(node)}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-[#26131F] hover:bg-[#381B2E] text-pink-300 border border-pink-500/40 text-xs font-medium py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Inject Chaos ('C')</span>
        </button>
      </div>

      {/* Telemetry Strip */}
      <div className="px-4 py-2 bg-[#0C0F17] border-b border-[#1E2330] grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div>
          <div className="text-gray-400">Duration</div>
          <div className="text-cyan-400 font-semibold">{node.latencyMs}ms</div>
        </div>
        <div>
          <div className="text-gray-400">Prompt / Comp</div>
          <div className="text-amber-400 font-semibold">{node.tokenUsage.promptTokens} / {node.tokenUsage.completionTokens}</div>
        </div>
        <div>
          <div className="text-gray-400">Total Tokens</div>
          <div className="text-white font-semibold">{node.tokenUsage.totalTokens}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#1E2330] bg-[#0F121A] text-xs font-mono">
        <button
          onClick={() => setActiveTab('payload')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payload'
              ? 'border-amber-500 text-white font-medium bg-[#151923]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          I/O Payloads
        </button>
        <button
          onClick={() => setActiveTab('reasoning')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reasoning'
              ? 'border-amber-500 text-white font-medium bg-[#151923]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Reasoning
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'memory'
              ? 'border-amber-500 text-white font-medium bg-[#151923]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Memory
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {activeTab === 'payload' && (
          <>
            <div>
              <div className="flex items-center space-x-1.5 text-gray-400 text-[11px] uppercase font-semibold mb-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Input Arguments</span>
              </div>
              <pre className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-gray-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(node.input, null, 2) || '(None)'}
              </pre>
            </div>

            <div>
              <div className="flex items-center space-x-1.5 text-gray-400 text-[11px] uppercase font-semibold mb-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Output / Tool Return</span>
              </div>
              <pre className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(node.output, null, 2) || '(None)'}
              </pre>
            </div>
          </>
        )}

        {activeTab === 'reasoning' && (
          <div>
            <div className="flex items-center space-x-1.5 text-gray-400 text-[11px] uppercase font-semibold mb-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
              <span>Chain of Thought Scratchpad</span>
            </div>
            <div className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-amber-200/90 text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
              {node.reasoning || 'No explicit scratchpad reasoning recorded for this step.'}
            </div>

            {node.isChaosPerturbation && (
              <div className="mt-4 p-3 bg-pink-950/30 border border-pink-500/40 rounded-lg">
                <div className="flex items-center space-x-1 text-pink-400 font-semibold mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Injected Chaos Fault</span>
                </div>
                <div className="text-pink-200 text-[11px]">
                  Type: <span className="font-mono">{node.chaosType}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'memory' && (
          <div>
            <div className="flex items-center space-x-1.5 text-gray-400 text-[11px] uppercase font-semibold mb-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Working Memory Snapshot</span>
            </div>
            <pre className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-purple-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(node.memorySnapshot, null, 2) || '{}'}
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
};
