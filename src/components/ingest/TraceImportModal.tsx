import React, { useState } from 'react';
import { ScenarioTrajectory } from '../../types/agentCrucible.types';
import { TraceIngestionEngine } from '../../engine/TraceIngestionEngine';
import { UploadCloud, X, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface TraceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (scenario: ScenarioTrajectory) => void;
}

export const TraceImportModal: React.FC<TraceImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [jsonText, setJsonText] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    setError(null);
    try {
      if (!jsonText.trim()) {
        setError('Please paste JSON trace data or an OTLP spans array.');
        return;
      }
      const parsed = JSON.parse(jsonText);
      const scenario = TraceIngestionEngine.ingestTrace(parsed, customName || undefined);
      onImportSuccess(scenario);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const loadSampleOTLP = () => {
    const sampleSpans = [
      {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        name: 'orchestrator_agent',
        startTimeUnixNano: 1694112000000000000,
        endTimeUnixNano: 1694112000600000000,
        attributes: {
          'agent.name': 'ProductionOrchestrator',
          'thought': 'Decomposing cloud deployment pipeline task.',
          'llm.prompt_tokens': 420,
          'llm.completion_tokens': 95
        }
      },
      {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '5fb397be34d23b0f',
        parentSpanId: '00f067aa0ba902b7',
        name: 'tool_k8s_rollout',
        startTimeUnixNano: 1694112000650000000,
        endTimeUnixNano: 1694112001150000000,
        attributes: {
          'agent.name': 'ProductionOrchestrator',
          'input': { deployment: 'api-service', namespace: 'prod' },
          'output': { status: 'Rolling update applied', revision: 82 },
          'llm.prompt_tokens': 120,
          'llm.completion_tokens': 45
        }
      }
    ];

    setJsonText(JSON.stringify(sampleSpans, null, 2));
    setCustomName('Sample OpenTelemetry Production Trace');
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-[#0B0D13] border border-[#2A3245] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Import Trace (OpenTelemetry / LangChain / Native JSON)
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Name input */}
        <div className="space-y-1 font-mono text-xs">
          <label className="block text-gray-400">Scenario Name (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Production OTLP Incident Trace #449"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            className="w-full bg-[#151923] border border-[#2A3245] rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
          />
        </div>

        {/* JSON input */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between">
            <label className="text-gray-400">Trace JSON Payload</label>
            <button
              type="button"
              onClick={loadSampleOTLP}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Load Sample OTLP Spans
            </button>
          </div>
          <textarea
            rows={8}
            placeholder="Paste OpenTelemetry spans array or LangChain run JSON here..."
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            className="w-full bg-[#151923] border border-[#2A3245] rounded-lg p-2.5 text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono text-xs resize-none"
          />
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/30 border border-rose-500/40 rounded text-rose-300 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-[#1E2330]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#151923] hover:bg-[#1C212E] text-gray-300 rounded text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest & Visualize</span>
          </button>
        </div>
      </div>
    </div>
  );
};
