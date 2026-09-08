import React, { useState, useEffect } from 'react';
import { ScenarioTrajectory, TrajectoryNode } from '../../types/agentCrucible.types';
import { TimelineScrubber } from './TimelineScrubber';
import { BranchDiffViewer } from './BranchDiffViewer';
import { BranchingEngine } from '../../engine/BranchingEngine';
import { 
  GitBranch, 
  Columns, 
  Terminal, 
  BrainCircuit, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Sparkles 
} from 'lucide-react';

interface TimeTravelStudioProps {
  scenario: ScenarioTrajectory;
  onUpdateScenario: (updated: ScenarioTrajectory) => void;
  initialStepIndex?: number;
}

export const TimeTravelStudio: React.FC<TimeTravelStudioProps> = ({
  scenario,
  onUpdateScenario,
  initialStepIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStepIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const [activeBranchNodeId, setActiveBranchNodeId] = useState<string | null>(null);

  // Counterfactual Fork Modal State
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('Counterfactual Recovery Branch');
  const [mutatedOutput, setMutatedOutput] = useState('');
  const [mutatedReasoning, setMutatedReasoning] = useState('');

  const nodes = scenario.nodes;
  const currentNode = nodes[currentIndex] || nodes[0];

  // Check if scenario has branched nodes available for diffing
  const existingBranchNodes = nodes.filter(n => n.branchName && n.branchSourceNodeId);

  useEffect(() => {
    if (existingBranchNodes.length > 0 && !activeBranchNodeId) {
      setActiveBranchNodeId(existingBranchNodes[0].id);
    }
  }, [scenario]);

  // Replay animation timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= nodes.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, nodes.length]);

  const handleOpenForkModal = () => {
    setMutatedOutput(JSON.stringify(currentNode.output || { simulatedResponse: 'Recovered data payload' }, null, 2));
    setMutatedReasoning(`What if the tool succeeded with alternative retry parameters?`);
    setIsForkModalOpen(true);
  };

  const handleExecuteFork = () => {
    try {
      let parsedOutput: any;
      try {
        parsedOutput = JSON.parse(mutatedOutput);
      } catch {
        parsedOutput = mutatedOutput;
      }

      const forkResult = BranchingEngine.forkTrajectory(scenario, {
        sourceNodeId: currentNode.id,
        branchName,
        mutatedOutput: parsedOutput,
        mutatedReasoning,
        syntheticContinuation: [
          {
            role: 'assistant',
            action: 'verify_state_integrity',
            output: { status: 'Counterfactual execution stabilized successfully' },
            status: 'success',
            reasoning: 'Autonomous self-healing completed via counterfactual parameters.'
          }
        ]
      });

      onUpdateScenario(forkResult.updatedScenario);
      setActiveBranchNodeId(forkResult.newBranchNodeId);
      setShowDiffView(true);
      setIsForkModalOpen(false);
    } catch (err) {
      alert(`Fork error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080B] select-none overflow-hidden">
      {/* Top Studio Control Bar */}
      <div className="h-12 border-b border-[#1E2330] bg-[#0B0D13] px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase text-purple-400">
              Time-Travel & Counterfactual Studio
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Step #{currentIndex + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {existingBranchNodes.length > 0 && (
            <button
              onClick={() => setShowDiffView(!showDiffView)}
              className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1.5 rounded border transition-colors cursor-pointer ${
                showDiffView 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-[#151923] text-gray-300 border-[#2A3245] hover:bg-[#1C212E]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{showDiffView ? 'Hide Split Diff' : 'Compare Split Diff'}</span>
            </button>
          )}

          <button
            onClick={handleOpenForkModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-md transition-all cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Fork from this Step ('B')</span>
          </button>
        </div>
      </div>

      {/* Main View Area (Diff View OR Step Inspector) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {showDiffView && activeBranchNodeId ? (
          <BranchDiffViewer scenario={scenario} branchNodeId={activeBranchNodeId} />
        ) : (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
            {/* Step Card */}
            <div className="bg-[#0F121A] border border-[#2A3245] rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1E2330] pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-gray-400">Step #{currentIndex + 1}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1C212E] text-cyan-400 border border-[#2A3245]">
                    {currentNode.agentName}
                  </span>
                  <span className="text-sm font-mono font-semibold text-white">
                    {currentNode.action || currentNode.role}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono text-gray-400">
                  <span>Duration: <strong className="text-white">{currentNode.latencyMs}ms</strong></span>
                  <span>Tokens: <strong className="text-white">{currentNode.tokenUsage.totalTokens}</strong></span>
                  <span className={`px-2 py-0.5 rounded border uppercase text-[10px] ${
                    currentNode.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {currentNode.status}
                  </span>
                </div>
              </div>

              {/* Reasoning Scratchpad */}
              <div className="mb-4">
                <div className="flex items-center space-x-1.5 text-xs font-mono text-amber-400 uppercase font-semibold mb-2">
                  <BrainCircuit className="w-4 h-4" />
                  <span>Agent Reasoning & Scratchpad</span>
                </div>
                <div className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-amber-200/90 text-xs font-mono leading-relaxed">
                  {currentNode.reasoning || 'Standard step execution.'}
                </div>
              </div>

              {/* Input & Output Payloads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 uppercase font-semibold mb-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Input Parameters</span>
                  </div>
                  <pre className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-gray-300 text-xs font-mono overflow-x-auto max-h-56">
                    {JSON.stringify(currentNode.input, null, 2) || '(None)'}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 uppercase font-semibold mb-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Output Payload / Result</span>
                  </div>
                  <pre className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-emerald-300 text-xs font-mono overflow-x-auto max-h-56">
                    {JSON.stringify(currentNode.output, null, 2) || '(None)'}
                  </pre>
                </div>
              </div>

              {/* Memory Snapshot */}
              <div className="mt-4">
                <div className="flex items-center space-x-1.5 text-xs font-mono text-purple-400 uppercase font-semibold mb-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Working Memory State</span>
                </div>
                <pre className="p-3 bg-[#07080B] border border-[#1E2330] rounded-lg text-purple-300 text-xs font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(currentNode.memorySnapshot, null, 2) || '{}'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Docked Bottom Timeline Scrubber */}
      <TimelineScrubber
        nodes={nodes}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSelectIndex={idx => setCurrentIndex(idx)}
        onNext={() => setCurrentIndex(prev => Math.min(prev + 1, nodes.length - 1))}
        onPrev={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
        onJumpToFault={() => {
          const faultIdx = nodes.findIndex(n => n.isChaosPerturbation || n.status === 'error');
          if (faultIdx !== -1) setCurrentIndex(faultIdx);
        }}
      />

      {/* Counterfactual Parameter Editor Modal */}
      {isForkModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B0D13] border border-[#2A3245] rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">
                  Spawn Counterfactual Fork from Step #{currentIndex + 1}
                </h3>
              </div>
              <button
                onClick={() => setIsForkModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  className="w-full bg-[#151923] border border-[#2A3245] rounded px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Mutate Hypothesis / Reasoning</label>
                <textarea
                  rows={2}
                  value={mutatedReasoning}
                  onChange={e => setMutatedReasoning(e.target.value)}
                  className="w-full bg-[#151923] border border-[#2A3245] rounded px-3 py-1.5 text-amber-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Mock / Mutate Tool Output Payload (JSON)</label>
                <textarea
                  rows={5}
                  value={mutatedOutput}
                  onChange={e => setMutatedOutput(e.target.value)}
                  className="w-full bg-[#151923] border border-[#2A3245] rounded px-3 py-1.5 text-emerald-300 focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#1E2330]">
              <button
                onClick={() => setIsForkModalOpen(false)}
                className="px-3 py-1.5 bg-[#151923] hover:bg-[#1C212E] text-gray-300 rounded text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteFork}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Counterfactual Replay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
