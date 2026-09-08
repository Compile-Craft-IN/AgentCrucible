import React from 'react';
import { LayoutNode } from '../../engine/TraceEngine';
import { 
  Terminal, 
  BrainCircuit, 
  Wrench, 
  User, 
  ShieldAlert, 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';

interface NodeCardProps {
  node: LayoutNode;
  isSelected: boolean;
  onSelect: (node: LayoutNode) => void;
  onBranch: (node: LayoutNode) => void;
  stepNumber: number;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onBranch,
  stepNumber
}) => {
  const getRoleIcon = () => {
    if (node.isChaosPerturbation) return <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />;
    if (node.branchName) return <GitBranch className="w-3.5 h-3.5 text-purple-400" />;
    switch (node.role) {
      case 'user': return <User className="w-3.5 h-3.5 text-blue-400" />;
      case 'assistant': return <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />;
      case 'tool': return <Wrench className="w-3.5 h-3.5 text-cyan-400" />;
      case 'system': return <Terminal className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    if (node.status === 'success') {
      return (
        <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>200 OK</span>
        </span>
      );
    }
    if (node.status === 'error') {
      return (
        <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500/15 text-rose-400 border border-rose-500/40 animate-pulse">
          <XCircle className="w-2.5 h-2.5" />
          <span>Error</span>
        </span>
      );
    }
    if (node.status === 'warning') {
      return (
        <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-2.5 h-2.5" />
          <span>Warn</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
        <GitBranch className="w-2.5 h-2.5" />
        <span>Branch</span>
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(node)}
      style={{
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: '260px'
      }}
      className={`group rounded-lg p-3 select-none transition-all duration-150 cursor-pointer border backdrop-blur-md ${
        node.isChaosPerturbation
          ? 'bg-[#15121D] border-pink-500 shadow-glow-chaos ring-1 ring-pink-500/50'
          : node.branchName
          ? 'bg-[#14121F] border-purple-500 shadow-glow-purple ring-1 ring-purple-500/50'
          : isSelected
          ? 'bg-[#1C212E] border-amber-500 shadow-lg ring-1 ring-amber-500/50'
          : 'bg-[#0F121A] hover:bg-[#151923] border-[#2A3245] hover:border-gray-500 shadow-sm'
      }`}
    >
      {/* Top Header: Step Number, Agent Name, Status */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono text-gray-400 font-medium">#{stepNumber}</span>
          <div className="flex items-center space-x-1">
            {getRoleIcon()}
            <span className="text-xs font-semibold text-gray-200 truncate max-w-[110px]">
              {node.agentName}
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Action / Tool Invocation */}
      <div className="mb-2">
        <div className="text-[11px] font-mono text-cyan-300 font-medium truncate flex items-center space-x-1">
          <span>{node.action || node.role}</span>
        </div>
        <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 leading-tight font-mono">
          {node.reasoning || (typeof node.input === 'string' ? node.input : JSON.stringify(node.input || ''))}
        </p>
      </div>

      {/* Footer Telemetry */}
      <div className="flex items-center justify-between pt-1.5 border-t border-[#1E2330] text-[10px] font-mono text-gray-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-2.5 h-2.5 text-gray-400" />
          <span>{node.latencyMs}ms</span>
        </div>
        <span>{node.tokenUsage.totalTokens} tk</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBranch(node);
          }}
          title="Fork/Branch from this step"
          className="text-gray-400 hover:text-purple-400 transition-colors p-0.5"
        >
          <GitBranch className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
