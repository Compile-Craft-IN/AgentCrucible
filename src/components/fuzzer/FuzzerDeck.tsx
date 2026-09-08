import React, { useState } from 'react';
import { FuzzerEngine, FuzzCampaignResult, FuzzMutation } from '../../engine/FuzzerEngine';
import { 
  ShieldAlert, 
  Dna, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  Sparkles, 
  Layers 
} from 'lucide-react';

export const FuzzerDeck: React.FC = () => {
  const [generations, setGenerations] = useState(3);
  const [campaign, setCampaign] = useState<FuzzCampaignResult>(() => FuzzerEngine.runCampaign(2));
  const [selectedMutation, setSelectedMutation] = useState<FuzzMutation | null>(null);
  const [isFuzzing, setIsFuzzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLaunchCampaign = () => {
    setIsFuzzing(true);
    setTimeout(() => {
      const result = FuzzerEngine.runCampaign(generations);
      setCampaign(result);
      setIsFuzzing(false);
    }, 600);
  };

  const handleCopyPayload = (payload: string) => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080B] select-none overflow-y-auto p-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Dna className="w-5 h-5 text-pink-400" />
            <h2 className="text-base font-bold text-white font-mono tracking-tight">
              Evolutionary Adversarial Red-Teaming Fuzzer
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Autonomously evolves adversarial prompt injection payloads, instruction smuggling, and Unicode homoglyphs across genetic generations to test agent guardrail defenses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-gray-300 bg-[#151923] border border-[#2A3245] px-3 py-1.5 rounded-md">
            <span className="text-gray-400">Generations:</span>
            <select
              value={generations}
              onChange={e => setGenerations(Number(e.target.value))}
              aria-label="Select Fuzzing Generations"
              className="bg-transparent text-pink-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value={2}>2 Gens</option>
              <option value={3}>3 Gens</option>
              <option value={4}>4 Gens</option>
              <option value={5}>5 Gens</option>
            </select>
          </div>

          <button
            onClick={handleLaunchCampaign}
            disabled={isFuzzing}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-md text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFuzzing ? 'Evolving Mutations...' : 'Launch Fuzzing Sweep'}</span>
          </button>
        </div>
      </div>

      {/* Campaign Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 uppercase">Total Mutated Payloads</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{campaign.totalMutations}</div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Across {generations} genetic cycles</div>
        </div>

        <div className="bg-[#0F121A] border border-emerald-500/30 rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 uppercase">Guardrail Interceptions</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{campaign.blockedCount}</div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-1">Neutralized by sanitizer</div>
        </div>

        <div className="bg-[#0F121A] border border-rose-500/30 rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 uppercase">Guardrail Evasions</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{campaign.evadedCount}</div>
          <div className="text-[10px] text-rose-400/80 font-mono mt-1">High-fitness bypasses</div>
        </div>

        <div className="bg-[#0F121A] border border-pink-500/30 rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 uppercase">Vulnerability Index</div>
          <div className="text-2xl font-bold font-mono text-pink-400 mt-1">
            {Math.round(campaign.vulnerabilityIndex * 100)}%
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-1">
            {campaign.vulnerabilityIndex < 0.25 ? 'Robust Security Posture' : 'Hardening Advised'}
          </div>
        </div>
      </div>

      {/* Mutation Matrix & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mutation Table (Left 2 Cols) */}
        <div className="lg:col-span-2 bg-[#0F121A] border border-[#2A3245] rounded-xl p-4 shadow-xl">
          <div className="text-xs font-mono uppercase text-gray-300 font-bold mb-3 flex items-center justify-between">
            <span>Evolved Mutation Pool</span>
            <span className="text-[10px] text-gray-500">Sorted by Generation</span>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {campaign.mutations.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedMutation(m)}
                className={`p-3 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  selectedMutation?.id === m.id
                    ? 'bg-[#1D172A] border-pink-500 shadow-md ring-1 ring-pink-500/40'
                    : 'bg-[#0B0D13] hover:bg-[#151923] border-[#1E2330]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-[10px]">Gen {m.generation}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1C212E] text-cyan-300 border border-[#2A3245]">
                      {m.technique}
                    </span>
                    <span className="text-gray-400 text-[10px] uppercase">{m.targetCategory}</span>
                  </div>

                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                    m.status === 'blocked'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : m.status === 'quarantined'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse'
                  }`}>
                    {m.status} ({m.fitnessScore}%)
                  </span>
                </div>

                <div className="text-gray-300 font-mono text-[11px] truncate mt-1">
                  {m.payload}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mutation Inspector (Right Col) */}
        <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-gray-300 font-bold mb-3 flex items-center justify-between">
              <span>Payload Inspector</span>
              {selectedMutation && (
                <button
                  onClick={() => handleCopyPayload(selectedMutation.payload)}
                  className="flex items-center space-x-1 text-[11px] font-mono text-pink-400 hover:text-pink-300 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {selectedMutation ? (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="text-gray-500 text-[10px] uppercase">Technique Details</div>
                  <div className="text-pink-300 font-semibold">{selectedMutation.technique}</div>
                </div>

                <div>
                  <div className="text-gray-500 text-[10px] uppercase mb-1">Evolved Adversarial Payload</div>
                  <pre className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-rose-200 text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedMutation.payload}
                  </pre>
                </div>

                <div>
                  <div className="text-gray-500 text-[10px] uppercase mb-1">Guardrail Defense Reaction</div>
                  <div className="p-2.5 bg-[#07080B] border border-[#1E2330] rounded-lg text-gray-300 text-[11px]">
                    {selectedMutation.responseSnippet}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 font-mono text-xs">
                Select any mutated payload on the left to inspect its genetic evasion technique and response.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#1E2330] text-[10px] font-mono text-gray-500">
            Evolutionary Fuzzing Engine v1.1
          </div>
        </div>
      </div>
    </div>
  );
};
