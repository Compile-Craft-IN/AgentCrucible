import React from 'react';
import { Flame, Zap, Play, GitFork, FileDown, HelpCircle, Activity, Sparkles, Layers, UploadCloud } from 'lucide-react';
import { ScenarioTrajectory } from '../../types/agentCrucible.types';
import { TraceEngine } from '../../engine/TraceEngine';

interface HeaderProps {
  scenarios: ScenarioTrajectory[];
  activeScenario: ScenarioTrajectory;
  onSelectScenario: (scenario: ScenarioTrajectory) => void;
  onOpenSimulationModal: () => void;
  onOpenImportModal: () => void;
  onOpenShortcutsModal: () => void;
  onExportReport: () => void;
  chaosFaultsActiveCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  onOpenSimulationModal,
  onOpenImportModal,
  onOpenShortcutsModal,
  onExportReport,
  chaosFaultsActiveCount
}) => {
  const stats = TraceEngine.getTrajectoryStats(activeScenario);

  return (
    <header className="h-14 border-b border-[#1E2330] bg-[#0B0D13] px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Run Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-white font-sans">AgentCrucible</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1C212E] text-amber-400 border border-amber-500/30">
                v1.2 Studio
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-[#1E2330]" />

        {/* Scenario Dropdown */}
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <select
            value={activeScenario.id}
            onChange={e => {
              const target = scenarios.find(s => s.id === e.target.value);
              if (target) onSelectScenario(target);
            }}
            aria-label="Select Target Scenario"
            className="bg-[#151923] border border-[#2A3245] hover:border-gray-500 text-xs font-mono text-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chaos Active Indicator */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
          chaosFaultsActiveCount > 0 
            ? 'bg-pink-500/10 text-pink-400 border-pink-500/30 animate-pulse-subtle'
            : 'bg-gray-800/40 text-gray-400 border-gray-700/30'
        }`}>
          <Zap className="w-3.5 h-3.5" />
          <span>{chaosFaultsActiveCount} Faults Armed</span>
        </div>
      </div>

      {/* Telemetry Summary HUD */}
      <div className="hidden lg:flex items-center space-x-5 text-xs font-mono bg-[#07080B] px-3.5 py-1.5 rounded-lg border border-[#1E2330]">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-gray-400">Steps:</span>
          <span className="text-white font-semibold">{stats.totalNodes}</span>
        </div>
        <div className="w-px h-3 bg-[#1E2330]" />
        <div>
          <span className="text-gray-400">Tokens:</span>
          <span className="text-white font-semibold ml-1.5">{stats.totalTokens.toLocaleString()}</span>
        </div>
        <div className="w-px h-3 bg-[#1E2330]" />
        <div>
          <span className="text-gray-400">Cost:</span>
          <span className="text-emerald-400 font-semibold ml-1.5">${stats.totalCostUSD}</span>
        </div>
        <div className="w-px h-3 bg-[#1E2330]" />
        <div>
          <span className="text-gray-400">Duration:</span>
          <span className="text-white font-semibold ml-1.5">{(stats.totalLatencyMs / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenImportModal}
          className="flex items-center space-x-1.5 bg-[#151923] hover:bg-[#1C212E] border border-[#2A3245] text-cyan-300 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import Trace</span>
        </button>

        <button
          onClick={onOpenSimulationModal}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Simulation</span>
        </button>

        <button
          onClick={onExportReport}
          title="Export Evaluation Report"
          className="flex items-center space-x-1 bg-[#151923] hover:bg-[#1C212E] border border-[#2A3245] text-gray-300 text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5 text-gray-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onOpenShortcutsModal}
          title="Keyboard Shortcuts (?)"
          className="p-1.5 text-gray-400 hover:text-white bg-[#151923] hover:bg-[#1C212E] border border-[#2A3245] rounded-md transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
