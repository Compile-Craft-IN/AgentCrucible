import React from 'react';
import { GitGraph, FastForward, ShieldAlert, Cpu, Award, Dna, Network } from 'lucide-react';

export type ActiveView = 'dag' | 'replay' | 'chaos' | 'fuzzer' | 'memory' | 'diagnostics' | 'benchmarks';

interface SidebarNavProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  diagnosticsCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onSelectView,
  diagnosticsCount
}) => {
  const navItems = [
    {
      id: 'dag' as ActiveView,
      label: 'Trajectory DAG',
      shortcut: '1',
      icon: GitGraph,
      color: 'text-cyan-400'
    },
    {
      id: 'replay' as ActiveView,
      label: 'Time-Travel & Replay',
      shortcut: '2',
      icon: FastForward,
      color: 'text-purple-400'
    },
    {
      id: 'chaos' as ActiveView,
      label: 'Chaos Lab Deck',
      shortcut: '3',
      icon: ShieldAlert,
      color: 'text-pink-400'
    },
    {
      id: 'fuzzer' as ActiveView,
      label: 'Adversarial Fuzzer',
      shortcut: '4',
      icon: Dna,
      color: 'text-rose-400'
    },
    {
      id: 'memory' as ActiveView,
      label: 'Multi-Agent Memory',
      shortcut: '5',
      icon: Network,
      color: 'text-indigo-400'
    },
    {
      id: 'diagnostics' as ActiveView,
      label: 'Diagnostics & Health',
      shortcut: '6',
      icon: Cpu,
      color: 'text-amber-400',
      badge: diagnosticsCount > 0 ? diagnosticsCount : undefined
    },
    {
      id: 'benchmarks' as ActiveView,
      label: 'Resilience Benchmark',
      shortcut: '7',
      icon: Award,
      color: 'text-emerald-400'
    }
  ];

  return (
    <aside className="w-60 border-r border-[#1E2330] bg-[#0B0D13] flex flex-col justify-between select-none shrink-0 z-20">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase font-mono font-semibold tracking-wider text-gray-400">
          Studio Views
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[#1C212E] text-white border border-[#2A3245] shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#151923]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-300'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
                <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#07080B] text-gray-400 border border-[#1E2330]">
                  {item.shortcut}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-[#1E2330] bg-[#07080B]">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Engine Ready</span>
          </div>
          <span className="text-gray-500">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
