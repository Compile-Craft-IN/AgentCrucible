import React, { useState } from 'react';
import { ScenarioTrajectory } from '../../types/agentCrucible.types';
import { Database, Network, KeyRound, Cpu, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface MemoryGraphViewerProps {
  scenario: ScenarioTrajectory;
}

export const MemoryGraphViewer: React.FC<MemoryGraphViewerProps> = ({ scenario }) => {
  const nodes = scenario.nodes;

  // Extract all unique memory keys across the trajectory
  const allKeys = Array.from(
    new Set(nodes.flatMap(n => Object.keys(n.memorySnapshot || {})))
  );

  const [selectedKey, setSelectedKey] = useState<string>(allKeys[0] || 'state');

  // Track value progression for the selected key across steps
  const keyHistory = nodes
    .map((n, idx) => ({
      step: idx + 1,
      nodeId: n.id,
      agent: n.agentName,
      action: n.action || n.role,
      hasKey: selectedKey in (n.memorySnapshot || {}),
      value: n.memorySnapshot ? n.memorySnapshot[selectedKey] : undefined
    }))
    .filter(item => item.hasKey);

  // Group nodes by agent to visualize agent memory ownership
  const agentGroups = Array.from(new Set(nodes.map(n => n.agentName)));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080B] select-none overflow-y-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white font-mono tracking-tight">
              Multi-Agent Memory Graph & Shared State Topology
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Inspect shared working memory blackboard, variable mutations across agent swarms, and cross-agent context synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-[#151923] border border-purple-500/30 px-3 py-1.5 rounded-md text-purple-300">
            {agentGroups.length} Participating Agents
          </div>
          <div className="bg-[#151923] border border-[#2A3245] px-3 py-1.5 rounded-md text-gray-300">
            {allKeys.length} Tracked State Keys
          </div>
        </div>
      </div>

      {/* Agents Memory Partition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agentGroups.map(agent => {
          const agentNodes = nodes.filter(n => n.agentName === agent);
          const latestMemory = agentNodes[agentNodes.length - 1]?.memorySnapshot || {};
          const keysCount = Object.keys(latestMemory).length;

          return (
            <div
              key={agent}
              className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-4 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{agent}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
                  {agentNodes.length} Execution Steps | {keysCount} Active Memory Keys
                </p>

                <div className="mt-3 p-2 bg-[#07080B] rounded border border-[#1E2330] max-h-24 overflow-y-auto font-mono text-[10px] text-purple-300">
                  <pre>{JSON.stringify(latestMemory, null, 2)}</pre>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#1E2330] text-[10px] font-mono text-gray-500 flex justify-between">
                <span>Memory Partition</span>
                <span className="text-emerald-400 font-bold">Synchronized</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* State Variable Evolution Timeline */}
      <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono uppercase font-bold text-gray-200">
              State Mutation Timeline
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-gray-400">Select Variable:</span>
            <select
              value={selectedKey}
              onChange={e => setSelectedKey(e.target.value)}
              aria-label="Select Tracked State Variable"
              className="bg-[#151923] border border-[#2A3245] text-amber-400 font-bold rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              {allKeys.map(k => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mutation Steps */}
        <div className="space-y-2">
          {keyHistory.map((item, idx) => (
            <div
              key={`kh-${idx}`}
              className="p-3 rounded-lg bg-[#0B0D13] border border-[#1E2330] flex items-center justify-between font-mono text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-[10px]">Step #{item.step}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#1C212E] text-cyan-300 text-[10px]">
                  {item.agent}
                </span>
                <span className="text-gray-400 text-[11px] truncate max-w-[160px]">
                  {item.action}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-[10px]">→</span>
                <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                  {typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
