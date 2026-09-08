import React, { useState } from 'react';
import { ScenarioTrajectory, DiagnosticsAnomaly } from '../../types/agentCrucible.types';
import { DiagnosticEngine } from '../../engine/DiagnosticEngine';
import { 
  Cpu, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  Coins, 
  Sparkles 
} from 'lucide-react';

interface DiagnosticsReportProps {
  scenario: ScenarioTrajectory;
  onApplyRemediation: (anomaly: DiagnosticsAnomaly) => void;
}

export const DiagnosticsReport: React.FC<DiagnosticsReportProps> = ({
  scenario,
  onApplyRemediation
}) => {
  const anomalies = DiagnosticEngine.analyzeTrajectory(scenario);
  const [remediatedIds, setRemediatedIds] = useState<string[]>([]);

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const warningCount = anomalies.filter(a => a.severity === 'warning').length;

  const handleRemediate = (anomaly: DiagnosticsAnomaly) => {
    setRemediatedIds(prev => [...prev, anomaly.id]);
    onApplyRemediation(anomaly);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080B] select-none overflow-y-auto p-6 space-y-6">
      {/* Overview Metric Banner */}
      <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-mono tracking-tight">
              Automated Trajectory Health Diagnostic
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Heuristic analyzers scanned {scenario.nodes.length} trajectory steps for non-deterministic failure patterns, cyclic deadlocks, prompt injection taints, and memory leaks.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="bg-[#151923] border border-rose-500/30 px-4 py-2 rounded-lg text-center">
            <div className="text-rose-400 font-bold text-lg">{criticalCount}</div>
            <div className="text-gray-400 text-[10px] uppercase">Critical Risks</div>
          </div>
          <div className="bg-[#151923] border border-amber-500/30 px-4 py-2 rounded-lg text-center">
            <div className="text-amber-400 font-bold text-lg">{warningCount}</div>
            <div className="text-gray-400 text-[10px] uppercase">Warnings</div>
          </div>
          <div className="bg-[#151923] border border-emerald-500/30 px-4 py-2 rounded-lg text-center">
            <div className="text-emerald-400 font-bold text-lg">{remediatedIds.length}</div>
            <div className="text-gray-400 text-[10px] uppercase">Auto-Healed</div>
          </div>
        </div>
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        <div className="text-xs font-mono uppercase text-gray-400 tracking-wider">
          Detected Inefficiencies & Vulnerabilities ({anomalies.length})
        </div>

        {anomalies.length === 0 ? (
          <div className="p-8 text-center bg-[#0F121A] border border-[#1E2330] rounded-xl text-emerald-400 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            Zero anomalies detected. Execution trajectory is clean and optimal.
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map(anomaly => {
              const isRemediated = remediatedIds.includes(anomaly.id);

              return (
                <div
                  key={anomaly.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isRemediated
                      ? 'bg-[#0E1714] border-emerald-500/40 opacity-70'
                      : anomaly.severity === 'critical'
                      ? 'bg-[#181116] border-rose-500/50 shadow-md ring-1 ring-rose-500/20'
                      : 'bg-[#161411] border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                          anomaly.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}>
                          {anomaly.type}
                        </span>
                        <h4 className="text-xs font-semibold text-white font-mono">
                          {anomaly.title}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-300 font-sans leading-relaxed">
                        {anomaly.description}
                      </p>

                      <div className="flex items-center space-x-2 pt-1 text-[11px] font-mono text-gray-400">
                        <span>Affected Nodes:</span>
                        {anomaly.nodeIds.map(id => (
                          <span key={id} className="text-cyan-300 bg-[#07080B] px-1.5 py-0.5 rounded border border-[#1E2330]">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Remediation Button */}
                    <div className="ml-4">
                      {isRemediated ? (
                        <span className="flex items-center space-x-1 text-emerald-400 text-xs font-mono bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Remediation Applied</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemediate(anomaly)}
                          className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-md shadow-md transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{anomaly.actionLabel || 'Apply Fix'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Strip */}
                  <div className="mt-3 pt-2 border-t border-[#1E2330] text-xs font-mono text-amber-200/80 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>Remediation: {anomaly.suggestedRemediation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
