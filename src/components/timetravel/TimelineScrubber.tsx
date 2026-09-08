import React from 'react';
import { Play, Pause, SkipBack, SkipForward, AlertCircle, Clock } from 'lucide-react';
import { TrajectoryNode } from '../../types/agentCrucible.types';

interface TimelineScrubberProps {
  nodes: TrajectoryNode[];
  currentIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectIndex: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onJumpToFault: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  nodes,
  currentIndex,
  isPlaying,
  onTogglePlay,
  onSelectIndex,
  onNext,
  onPrev,
  onJumpToFault
}) => {
  const maxLatency = Math.max(...nodes.map(n => n.latencyMs), 1000);

  return (
    <div className="border-t border-[#1E2330] bg-[#0B0D13] p-3 select-none flex flex-col space-y-2 z-20 shrink-0">
      {/* Upper Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrev}
            disabled={currentIndex <= 0}
            title="Step Backward (Left Arrow)"
            className="p-1.5 text-gray-300 hover:text-white bg-[#151923] hover:bg-[#1C212E] disabled:opacity-30 rounded border border-[#2A3245] transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Replay (Space)' : 'Play Replay (Space)'}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Replay'}</span>
          </button>

          <button
            onClick={onNext}
            disabled={currentIndex >= nodes.length - 1}
            title="Step Forward (Right Arrow)"
            className="p-1.5 text-gray-300 hover:text-white bg-[#151923] hover:bg-[#1C212E] disabled:opacity-30 rounded border border-[#2A3245] transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onJumpToFault}
            title="Jump to Injected Chaos / Error"
            className="flex items-center space-x-1 text-xs font-mono text-pink-400 bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/40 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Jump to Fault</span>
          </button>
        </div>

        {/* Current Step Readout */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-gray-400">
            Step <span className="text-amber-400 font-bold">{currentIndex + 1}</span> of {nodes.length}
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-cyan-300 font-medium truncate max-w-[200px]">
            {nodes[currentIndex]?.action || nodes[currentIndex]?.role}
          </span>
        </div>
      </div>

      {/* Latency Waterfall / Scrubber Track */}
      <div className="relative pt-3 pb-1">
        {/* Latency Bars */}
        <div className="flex items-end h-8 space-x-1 px-1 mb-1">
          {nodes.map((n, idx) => {
            const heightPercent = Math.max(15, Math.min(100, (n.latencyMs / maxLatency) * 100));
            const isSelected = idx === currentIndex;
            const isFault = n.isChaosPerturbation || n.status === 'error';

            return (
              <div
                key={`bar-${n.id}`}
                onClick={() => onSelectIndex(idx)}
                style={{ height: `${heightPercent}%` }}
                title={`Step ${idx + 1}: ${n.action || n.role} (${n.latencyMs}ms)`}
                className={`flex-1 rounded-t transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 ring-2 ring-amber-400'
                    : isFault
                    ? 'bg-pink-500 hover:bg-pink-400'
                    : n.branchName
                    ? 'bg-purple-500 hover:bg-purple-400'
                    : 'bg-[#2A3245] hover:bg-cyan-500/60'
                }`}
              />
            );
          })}
        </div>

        {/* Range Slider Track */}
        <input
          type="range"
          min={0}
          max={Math.max(0, nodes.length - 1)}
          value={currentIndex}
          onChange={e => onSelectIndex(Number(e.target.value))}
          className="w-full accent-amber-500 bg-[#1E2330] h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
