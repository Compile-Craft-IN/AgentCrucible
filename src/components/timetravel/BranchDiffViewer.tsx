import React from 'react';
import { ScenarioTrajectory } from '../../types/agentCrucible.types';
import { BranchingEngine } from '../../engine/BranchingEngine';
import { CheckCircle2, XCircle, ArrowRight, Zap, GitBranch, ArrowDown } from 'lucide-react';

interface BranchDiffViewerProps {
  scenario: ScenarioTrajectory;
  branchNodeId: string;
}

export const BranchDiffViewer: React.FC<BranchDiffViewerProps> = ({
  scenario,
  branchNodeId
}) => {
  const diffResult = BranchingEngine.compareBranches(scenario, branchNodeId);
  const { comparisons, summary } = diffResult;

  if (comparisons.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 font-mono text-xs">
        No comparative branch data available for node: {branchNodeId}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#07080B] select-none">
      {/* Divergence Metrics Banner */}
      <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-4 flex flex-wrap items-center justify-between shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Counterfactual Branch Comparison
            </span>
            <span className="text-xs text-gray-400 font-mono">
              vs Baseline Run
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white mt-1">
            Divergence Point Analysis
          </h4>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono">
          <div>
            <span className="text-gray-400">Token Delta:</span>
            <span className={`ml-1.5 font-bold ${summary.tokenSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.tokenSavings >= 0 ? `-${summary.tokenSavings} saved` : `+${Math.abs(summary.tokenSavings)} extra`}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Latency Delta:</span>
            <span className={`ml-1.5 font-bold ${summary.latencyDeltaMs <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {summary.latencyDeltaMs > 0 ? `+${summary.latencyDeltaMs}ms` : `${summary.latencyDeltaMs}ms`}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400">Outcome:</span>
            {summary.solved ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SOLVED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-rose-400 font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>UNRESOLVED</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Lane Comparison Header */}
      <div className="grid grid-cols-2 gap-4 text-xs font-mono font-semibold text-gray-300 px-2">
        <div className="flex items-center space-x-2 text-cyan-400">
          <span>[Lane A] Baseline Execution Path</span>
        </div>
        <div className="flex items-center space-x-2 text-purple-400">
          <GitBranch className="w-3.5 h-3.5" />
          <span>[Lane B] Counterfactual Mutation Path</span>
        </div>
      </div>

      {/* Step Comparisons */}
      <div className="space-y-3">
        {comparisons.map((diff, index) => (
          <div
            key={`diff-step-${index}`}
            className={`border rounded-xl p-3 grid grid-cols-2 gap-4 transition-all ${
              diff.diverged
                ? 'bg-[#12111E] border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                : 'bg-[#0B0D13] border-[#1E2330]'
            }`}
          >
            {/* Baseline Node (Left) */}
            <div className="space-y-1.5 border-r border-[#1E2330] pr-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Step #{diff.stepIndex}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
                  diff.nodeA.status === 'success' ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30'
                }`}>
                  {diff.nodeA.status}
                </span>
              </div>
              <div className="text-cyan-300 font-medium truncate">
                {diff.nodeA.action || diff.nodeA.role}
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-2">
                {diff.nodeA.reasoning || JSON.stringify(diff.nodeA.input)}
              </p>
              <div className="text-[10px] text-gray-400 pt-1">
                {diff.nodeA.latencyMs}ms | {diff.nodeA.tokenUsage.totalTokens} tk
              </div>
            </div>

            {/* Counterfactual Node (Right) */}
            <div className="space-y-1.5 pl-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-medium">
                  {diff.nodeB.branchName || `Fork #${diff.stepIndex}`}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
                  diff.nodeB.status === 'success' ? 'text-emerald-400 border-emerald-500/30' : 'text-purple-400 border-purple-500/30'
                }`}>
                  {diff.nodeB.status}
                </span>
              </div>
              <div className="text-purple-300 font-medium truncate">
                {diff.nodeB.action || diff.nodeB.role}
              </div>
              <p className="text-[11px] text-gray-300 line-clamp-2">
                {diff.nodeB.reasoning || JSON.stringify(diff.nodeB.input)}
              </p>
              <div className="text-[10px] text-gray-400 pt-1 flex justify-between items-center">
                <span>{diff.nodeB.latencyMs}ms | {diff.nodeB.tokenUsage.totalTokens} tk</span>
                {diff.diverged && (
                  <span className="text-purple-400 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20">
                    Diverged
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
