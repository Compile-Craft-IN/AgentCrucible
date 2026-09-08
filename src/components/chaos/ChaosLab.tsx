import React, { useState } from 'react';
import { ChaosLabRule, ChaosFaultType } from '../../types/agentCrucible.types';
import { 
  Zap, 
  ShieldAlert, 
  Clock, 
  Database, 
  FileCode, 
  Terminal, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

interface ChaosLabProps {
  rules: ChaosLabRule[];
  onUpdateRules: (rules: ChaosLabRule[]) => void;
  onTriggerChaosRun: () => void;
}

export const ChaosLab: React.FC<ChaosLabProps> = ({
  rules,
  onUpdateRules,
  onTriggerChaosRun
}) => {
  const [logs, setLogs] = useState<string[]>([
    '[23:01:14] Chaos Engine Initialized. 6 Fault Injectors registered.',
    '[23:02:08] ⚡ RATE_LIMIT_429 armed (Probability: 40%). Target: all tools.',
    '[23:03:45] ⚡ SQL_INJECTION_TAINT armed (Probability: 50%). Target: ledger_query_raw.',
    '[23:05:00] 🛡️ Guardrail active: indirect instruction sanitizer ready.'
  ]);

  const handleToggle = (id: string) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        const nextState = !r.enabled;
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ${nextState ? '⚡ ARMED' : '⏸️ DISARMED'}: ${r.name}`,
          ...prev.slice(0, 20)
        ]);
        return { ...r, enabled: nextState };
      }
      return r;
    });
    onUpdateRules(updated);
  };

  const handleProbabilityChange = (id: string, probability: number) => {
    const updated = rules.map(r => (r.id === id ? { ...r, probability } : r));
    onUpdateRules(updated);
  };

  const handleArmAll = () => {
    const updated = rules.map(r => ({ ...r, enabled: true }));
    onUpdateRules(updated);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ⚡ ARMED ALL CHAOS FAULT INJECTORS`, ...prev.slice(0, 20)]);
  };

  const handleDisarmAll = () => {
    const updated = rules.map(r => ({ ...r, enabled: false }));
    onUpdateRules(updated);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ⏸️ DISARMED ALL FAULT INJECTORS`, ...prev.slice(0, 20)]);
  };

  const getFaultIcon = (type: ChaosFaultType) => {
    switch (type) {
      case 'RATE_LIMIT_429': return <Clock className="w-4 h-4 text-pink-400" />;
      case 'LATENCY_SPIKE': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'SQL_INJECTION_TAINT': return <Database className="w-4 h-4 text-rose-400" />;
      case 'SCHEMA_CORRUPTION': return <FileCode className="w-4 h-4 text-purple-400" />;
      case 'INDIRECT_PROMPT_INJECTION': return <ShieldAlert className="w-4 h-4 text-orange-400" />;
      case 'TIMEOUT': return <Clock className="w-4 h-4 text-red-400" />;
      default: return <Zap className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080B] select-none overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-12 border-b border-[#1E2330] bg-[#0B0D13] px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-pink-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Autonomous Agent Chaos Testing Deck
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleArmAll}
            className="px-2.5 py-1 text-xs font-mono bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/40 text-pink-300 rounded transition-colors cursor-pointer"
          >
            Arm All Faults
          </button>
          <button
            onClick={handleDisarmAll}
            className="px-2.5 py-1 text-xs font-mono bg-[#151923] hover:bg-[#1C212E] border border-[#2A3245] text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            Disarm All
          </button>
          <button
            onClick={onTriggerChaosRun}
            className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Chaos Stress Test</span>
          </button>
        </div>
      </div>

      {/* Grid of Chaos Rules & Live Telemetry Feed */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fault Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-mono uppercase text-gray-400 tracking-wider">
            Active Chaos Perturbation Profiles
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`border rounded-xl p-4 transition-all duration-150 ${
                  rule.enabled
                    ? 'bg-[#15121D] border-pink-500/60 shadow-glow-chaos ring-1 ring-pink-500/30'
                    : 'bg-[#0F121A] border-[#1E2330] opacity-80'
                }`}
              >
                {/* Header: Title & Toggle */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getFaultIcon(rule.faultType)}
                    <h4 className="text-xs font-semibold font-mono text-white truncate max-w-[170px]">
                      {rule.name}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleToggle(rule.id)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                      rule.enabled
                        ? 'bg-pink-600 border-pink-400'
                        : 'bg-[#1C212E] border-[#2A3245]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        rule.enabled ? 'transform translate-x-4' : ''
                      }`}
                    />
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mb-3 min-h-[32px] leading-snug">
                  {rule.description}
                </p>

                {/* Target Tool & Probability Slider */}
                <div className="space-y-2 pt-2 border-t border-[#1E2330] text-[11px] font-mono">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Target:</span>
                    <span className="text-cyan-300 font-semibold px-1.5 py-0.5 rounded bg-[#07080B] border border-[#1E2330]">
                      {rule.targetTool}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Injection Probability</span>
                      <span className={rule.enabled ? 'text-pink-400 font-bold' : 'text-gray-500'}>
                        {rule.probability}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      disabled={!rule.enabled}
                      value={rule.probability}
                      onChange={e => handleProbabilityChange(rule.id, Number(e.target.value))}
                      className="w-full accent-pink-500 bg-[#1C212E] h-1.5 rounded appearance-none cursor-pointer disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Live Chaos Event Feed */}
        <div className="space-y-4 flex flex-col">
          <div className="text-xs font-mono uppercase text-gray-400 tracking-wider flex items-center justify-between">
            <span>Chaos Event Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          </div>

          <div className="flex-1 bg-[#0F121A] border border-[#1E2330] rounded-xl p-4 flex flex-col shadow-lg overflow-hidden">
            <div className="text-[11px] font-mono text-gray-400 mb-2 pb-2 border-b border-[#1E2330]">
              Real-time Injections & Agent Reactions:
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
              {logs.map((log, idx) => (
                <div
                  key={`log-${idx}`}
                  className={`p-2 rounded border text-[11px] leading-relaxed ${
                    log.includes('ARMED') || log.includes('⚡')
                      ? 'bg-pink-950/20 border-pink-500/30 text-pink-300'
                      : log.includes('🛡️')
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#07080B] border-[#1E2330] text-gray-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
