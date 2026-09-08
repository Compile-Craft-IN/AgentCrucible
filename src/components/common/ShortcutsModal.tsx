import React from 'react';
import { HelpCircle, X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause Trajectory Replay' },
    { key: '← / →', desc: 'Scrub 1 step backward / forward in timeline' },
    { key: 'B', desc: 'Fork counterfactual branch from selected node' },
    { key: 'C', desc: 'Inject Chaos perturbation on selected node' },
    { key: 'D', desc: 'Toggle Side-by-Side Split Diff Comparison' },
    { key: '1', desc: 'Switch to Trajectory DAG Canvas' },
    { key: '2', desc: 'Switch to Time-Travel & Replay Studio' },
    { key: '3', desc: 'Switch to Chaos Lab Deck' },
    { key: '4', desc: 'Switch to Adversarial Red-Team Fuzzer' },
    { key: '5', desc: 'Switch to Multi-Agent Memory Graph' },
    { key: '6', desc: 'Switch to Diagnostics & Health Report' },
    { key: '7', desc: 'Switch to Resilience Benchmark Matrix' },
    { key: 'Esc', desc: 'Close open modal or deselect active node' },
    { key: '?', desc: 'Toggle keyboard shortcuts cheatsheet' }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-[#0B0D13] border border-[#2A3245] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
          <div className="flex items-center space-x-2">
            <Command className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white font-mono">
              AgentCrucible Keyboard Shortcuts
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 font-mono text-xs max-h-80 overflow-y-auto">
          {shortcuts.map(s => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded bg-[#151923] border border-[#1E2330]"
            >
              <span className="text-gray-300 font-sans">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#07080B] text-amber-400 border border-[#2A3245] font-bold text-[10px]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1E2330]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C212E] hover:bg-[#252B3B] text-white rounded text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
