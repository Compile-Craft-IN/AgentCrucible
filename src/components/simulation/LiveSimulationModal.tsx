import React, { useState } from 'react';
import { ChaosLabRule, ScenarioTrajectory, TrajectoryNode } from '../../types/agentCrucible.types';
import { SimulationRunner } from '../../engine/SimulationRunner';
import { Sparkles, X, Play, Loader2, CheckCircle2, Zap } from 'lucide-react';

interface LiveSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chaosRules: ChaosLabRule[];
  onSimulationComplete: (newScenario: ScenarioTrajectory) => void;
}

export const LiveSimulationModal: React.FC<LiveSimulationModalProps> = ({
  isOpen,
  onClose,
  chaosRules,
  onSimulationComplete
}) => {
  const [goal, setGoal] = useState('Diagnose memory leak and unhandled 5xx error in production-auth-v2 service');
  const [agentType, setAgentType] = useState<'DevOps' | 'FinTech' | 'Security' | 'FullStack'>('DevOps');
  const [isRunning, setIsRunning] = useState(false);
  const [liveNodes, setLiveNodes] = useState<TrajectoryNode[]>([]);

  if (!isOpen) return null;

  const presets = [
    { label: 'DevOps Incident SRE', type: 'DevOps' as const, goal: 'Investigate Redis cache exhaustion and perform automated blue/green canary rollback.' },
    { label: 'FinTech AML Audit', type: 'FinTech' as const, goal: 'Screen offshore wire transfers for OFAC sanctions and unescaped SQL injections.' },
    { label: 'Security Vulnerability Patch', type: 'Security' as const, goal: 'Audit zero-day dependency vulnerability and quarantine adversarial prompt injection.' },
    { label: 'Async Refactoring', type: 'FullStack' as const, goal: 'Refactor blocking sync ORM handlers to AsyncSession and verify 100% test coverage.' }
  ];

  const handleStartSimulation = async () => {
    setIsRunning(true);
    setLiveNodes([]);

    try {
      const result = await SimulationRunner.runSimulation({
        goal,
        agentType,
        chaosRules,
        onStep: (node) => {
          setLiveNodes(prev => [...prev, node]);
        }
      });

      // Small delay for visual satisfaction
      setTimeout(() => {
        setIsRunning(false);
        onSimulationComplete(result);
        onClose();
      }, 800);
    } catch (err) {
      alert(`Simulation error: ${(err as Error).message}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-[#0B0D13] border border-[#2A3245] rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Launch Live Autonomous Agent Simulation
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-gray-400 hover:text-white cursor-pointer disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets */}
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1.5">Quick Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setGoal(p.goal);
                  setAgentType(p.type);
                }}
                className="text-left p-2 rounded bg-[#151923] hover:bg-[#1C212E] border border-[#2A3245] text-[11px] font-mono text-gray-300 transition-colors cursor-pointer"
              >
                <div className="text-cyan-400 font-semibold">{p.label}</div>
                <div className="text-gray-500 truncate text-[10px]">{p.goal}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Agent Archetype</label>
            <div className="grid grid-cols-4 gap-2">
              {(['DevOps', 'FinTech', 'Security', 'FullStack'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAgentType(type)}
                  className={`py-1.5 text-center rounded border transition-colors cursor-pointer ${
                    agentType === type
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                      : 'bg-[#151923] text-gray-400 border-[#2A3245] hover:text-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Autonomous Goal Directive</label>
            <textarea
              rows={3}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full bg-[#151923] border border-[#2A3245] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
            />
          </div>

          {/* Active Chaos Notice */}
          <div className="p-3 bg-pink-950/20 border border-pink-500/30 rounded-lg flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5 text-pink-300">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>Armed Chaos Rules: {chaosRules.filter(r => r.enabled).length} active</span>
            </div>
            <span className="text-gray-400">Perturbations will inject in real-time</span>
          </div>
        </div>

        {/* Live Step Progress Stream (if running) */}
        {isRunning && (
          <div className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg space-y-1.5 max-h-32 overflow-y-auto font-mono text-[10px]">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Simulating multi-step execution...</span>
            </div>
            {liveNodes.map((n, idx) => (
              <div key={n.id} className="text-gray-300 truncate">
                ✓ Step {idx + 1}: <span className="text-amber-300">{n.action || n.role}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-[#1E2330]">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-[#151923] hover:bg-[#1C212E] text-gray-300 rounded text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleStartSimulation}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Running Simulation...' : 'Execute Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
