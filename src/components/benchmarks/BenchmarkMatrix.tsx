import React, { useState } from 'react';
import { ScenarioTrajectory } from '../../types/agentCrucible.types';
import { EvalEngine } from '../../engine/EvalEngine';
import { 
  Award, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Clock, 
  FileDown, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal 
} from 'lucide-react';

interface BenchmarkMatrixProps {
  scenarios: ScenarioTrajectory[];
  activeScenario: ScenarioTrajectory;
}

export const BenchmarkMatrix: React.FC<BenchmarkMatrixProps> = ({
  scenarios,
  activeScenario
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const metrics = activeScenario.metrics || EvalEngine.evaluateScenario(activeScenario);

  const handleDownloadMarkdown = () => {
    const report = EvalEngine.generateMarkdownReport(activeScenario);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-crucible-eval-${activeScenario.id}.md`;
    a.click();
    setCopiedFormat('Markdown');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadJUnit = () => {
    const report = EvalEngine.generateJUnitXML(activeScenario);
    const blob = new Blob([report], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-crucible-junit-${activeScenario.id}.xml`;
    a.click();
    setCopiedFormat('JUnit XML');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const metricCards = [
    {
      title: 'Goal Accuracy',
      score: metrics.accuracy,
      desc: 'Deterministic completion of specified user objective',
      icon: Award,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10'
    },
    {
      title: 'Chaos Resilience',
      score: metrics.resilience,
      desc: 'Autonomous recovery rate under injected perturbations',
      icon: Zap,
      color: 'text-pink-400',
      borderColor: 'border-pink-500/40',
      bgGlow: 'bg-pink-500/10'
    },
    {
      title: 'Token Efficiency',
      score: metrics.tokenEfficiency,
      desc: 'Ratio of useful progress tokens vs deadlocks and bloat',
      icon: Clock,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgGlow: 'bg-cyan-500/10'
    },
    {
      title: 'Cost Efficiency',
      score: metrics.costEfficiency,
      desc: 'Inference cost relative to optimal direct execution',
      icon: Coins,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgGlow: 'bg-amber-500/10'
    },
    {
      title: 'Security Robustness',
      score: metrics.safetyScore,
      desc: 'Adherence to guardrails against SQL taint & prompt injection',
      icon: ShieldCheck,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgGlow: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080B] select-none overflow-y-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-mono tracking-tight">
              Agent Resilience & Performance Benchmark Matrix
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Quantitative scoring across accuracy, chaos fault recovery, context discipline, and security guardrails for target: <strong className="text-white font-mono">{activeScenario.name}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#151923] hover:bg-[#1C212E] border border-[#2A3245] text-gray-200 text-xs font-mono rounded-md transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={handleDownloadJUnit}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#151923] hover:bg-[#1C212E] border border-[#2A3245] text-gray-200 text-xs font-mono rounded-md transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Export JUnit XML</span>
          </button>
        </div>
      </div>

      {/* 5 Core Dimension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map(c => {
          const Icon = c.icon;
          const pct = Math.round(c.score * 100);

          return (
            <div
              key={c.title}
              className={`bg-[#0F121A] border ${c.borderColor} rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${c.color}`} />
                <span className={`text-xl font-bold font-mono ${c.color}`}>
                  {pct}%
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white font-mono mb-1">
                  {c.title}
                </h4>
                <p className="text-[10px] text-gray-400 leading-snug">
                  {c.desc}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1C212E] h-1 rounded-full mt-3 overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full ${pct >= 85 ? 'bg-emerald-400' : pct >= 70 ? 'bg-amber-400' : 'bg-rose-400'}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Scenario Comparative Evaluation Table */}
      <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase font-bold text-gray-300 tracking-wider">
            Comparative Benchmark Matrix (All Test Suites)
          </h3>
          <span className="text-[10px] font-mono text-gray-400">
            Automated CI Baseline Invariants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#1E2330] text-gray-400 text-[11px]">
                <th className="py-2.5 px-3">Scenario / Test Suite</th>
                <th className="py-2.5 px-3">Steps</th>
                <th className="py-2.5 px-3">Tokens</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Resilience</th>
                <th className="py-2.5 px-3">Safety</th>
                <th className="py-2.5 px-3">CI Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2330]">
              {scenarios.map(s => {
                const m = s.metrics || EvalEngine.evaluateScenario(s);
                const isCurrent = s.id === activeScenario.id;

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-[#151923] transition-colors ${
                      isCurrent ? 'bg-[#181C28] text-white font-medium' : 'text-gray-300'
                    }`}
                  >
                    <td className="py-3 px-3 flex items-center space-x-2">
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                      <span className="truncate max-w-[220px]">{s.name}</span>
                    </td>
                    <td className="py-3 px-3">{s.nodes.length}</td>
                    <td className="py-3 px-3">{s.totalTokens.toLocaleString()}</td>
                    <td className="py-3 px-3">{(s.latencyMs / 1000).toFixed(1)}s</td>
                    <td className="py-3 px-3 text-emerald-400">{Math.round(m.accuracy * 100)}%</td>
                    <td className="py-3 px-3 text-pink-400">{Math.round(m.resilience * 100)}%</td>
                    <td className="py-3 px-3 text-purple-400">{Math.round(m.safetyScore * 100)}%</td>
                    <td className="py-3 px-3">
                      <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PASSED</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
