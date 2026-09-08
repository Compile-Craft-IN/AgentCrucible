import React, { useState, useEffect, useMemo } from 'react';
import { SEED_SCENARIOS } from './data/seedScenarios';
import { ScenarioTrajectory, ChaosLabRule, DiagnosticsAnomaly } from './types/agentCrucible.types';
import { LayoutNode } from './engine/TraceEngine';
import { ChaosEngine } from './engine/ChaosEngine';
import { DiagnosticEngine } from './engine/DiagnosticEngine';
import { EvalEngine } from './engine/EvalEngine';

// Components
import { Header } from './components/layout/Header';
import { SidebarNav, ActiveView } from './components/layout/SidebarNav';
import { DAGCanvas } from './components/dag/DAGCanvas';
import { NodeInspectorDrawer } from './components/dag/NodeInspectorDrawer';
import { TimeTravelStudio } from './components/timetravel/TimeTravelStudio';
import { ChaosLab } from './components/chaos/ChaosLab';
import { FuzzerDeck } from './components/fuzzer/FuzzerDeck';
import { MemoryGraphViewer } from './components/memory/MemoryGraphViewer';
import { DiagnosticsReport } from './components/diagnostics/DiagnosticsReport';
import { BenchmarkMatrix } from './components/benchmarks/BenchmarkMatrix';
import { LiveSimulationModal } from './components/simulation/LiveSimulationModal';
import { TraceImportModal } from './components/ingest/TraceImportModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioTrajectory[]>(SEED_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(SEED_SCENARIOS[0].id);
  const [activeView, setActiveView] = useState<ActiveView>('dag');
  const [selectedNode, setSelectedNode] = useState<LayoutNode | null>(null);
  const [chaosRules, setChaosRules] = useState<ChaosLabRule[]>(ChaosEngine.DEFAULT_RULES);

  // Modals
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Active scenario reference
  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  }, [scenarios, activeScenarioId]);

  // Active anomalies count
  const anomalies = useMemo(() => {
    return DiagnosticEngine.analyzeTrajectory(activeScenario);
  }, [activeScenario]);

  const activeChaosCount = chaosRules.filter(r => r.enabled).length;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1') setActiveView('dag');
      if (e.key === '2') setActiveView('replay');
      if (e.key === '3') setActiveView('chaos');
      if (e.key === '4') setActiveView('fuzzer');
      if (e.key === '5') setActiveView('memory');
      if (e.key === '6') setActiveView('diagnostics');
      if (e.key === '7') setActiveView('benchmarks');
      if (e.key === '?') setIsShortcutsModalOpen(prev => !prev);
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setIsSimulationModalOpen(false);
        setIsImportModalOpen(false);
        setIsShortcutsModalOpen(false);
      }
      if ((e.key === 'b' || e.key === 'B') && selectedNode) {
        setActiveView('replay');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  const handleUpdateScenario = (updated: ScenarioTrajectory) => {
    setScenarios(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const handleBranchFromNode = (node: LayoutNode) => {
    setSelectedNode(node);
    setActiveView('replay');
  };

  const handleInjectChaosFromDrawer = (node: LayoutNode) => {
    setActiveView('chaos');
  };

  const handleSimulationComplete = (newScenario: ScenarioTrajectory) => {
    setScenarios(prev => [newScenario, ...prev]);
    setActiveScenarioId(newScenario.id);
    setActiveView('dag');
  };

  const handleImportSuccess = (newScenario: ScenarioTrajectory) => {
    setScenarios(prev => [newScenario, ...prev]);
    setActiveScenarioId(newScenario.id);
    setActiveView('dag');
  };

  const handleExportReport = () => {
    const md = EvalEngine.generateMarkdownReport(activeScenario);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-crucible-${activeScenario.id}-report.md`;
    a.click();
  };

  const handleApplyRemediation = (anomaly: DiagnosticsAnomaly) => {
    const updatedNodes = activeScenario.nodes.map(n => {
      if (anomaly.nodeIds.includes(n.id)) {
        return {
          ...n,
          status: 'success' as const,
          reasoning: `${n.reasoning || ''} [GUARDRAIL HEALED: ${anomaly.suggestedRemediation}]`
        };
      }
      return n;
    });

    const updated = {
      ...activeScenario,
      nodes: updatedNodes,
      metrics: {
        ...activeScenario.metrics,
        resilience: Math.min(1.0, activeScenario.metrics.resilience + 0.05),
        safetyScore: 0.99
      }
    };

    handleUpdateScenario(updated);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080B] text-white overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        scenarios={scenarios}
        activeScenario={activeScenario}
        onSelectScenario={s => {
          setActiveScenarioId(s.id);
          setSelectedNode(null);
        }}
        onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onExportReport={handleExportReport}
        chaosFaultsActiveCount={activeChaosCount}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* Left Navigation Rail */}
        <SidebarNav
          activeView={activeView}
          onSelectView={v => setActiveView(v)}
          diagnosticsCount={anomalies.length}
        />

        {/* Center Viewport */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {activeView === 'dag' && (
            <DAGCanvas
              scenario={activeScenario}
              selectedNode={selectedNode}
              onSelectNode={n => setSelectedNode(n)}
              onBranchNode={handleBranchFromNode}
            />
          )}

          {activeView === 'replay' && (
            <TimeTravelStudio
              scenario={activeScenario}
              onUpdateScenario={handleUpdateScenario}
            />
          )}

          {activeView === 'chaos' && (
            <ChaosLab
              rules={chaosRules}
              onUpdateRules={setChaosRules}
              onTriggerChaosRun={() => setIsSimulationModalOpen(true)}
            />
          )}

          {activeView === 'fuzzer' && (
            <FuzzerDeck />
          )}

          {activeView === 'memory' && (
            <MemoryGraphViewer
              scenario={activeScenario}
            />
          )}

          {activeView === 'diagnostics' && (
            <DiagnosticsReport
              scenario={activeScenario}
              onApplyRemediation={handleApplyRemediation}
            />
          )}

          {activeView === 'benchmarks' && (
            <BenchmarkMatrix
              scenarios={scenarios}
              activeScenario={activeScenario}
            />
          )}
        </main>

        {/* Right Inspector Drawer */}
        {activeView === 'dag' && selectedNode && (
          <NodeInspectorDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onBranch={handleBranchFromNode}
            onInjectChaos={handleInjectChaosFromDrawer}
          />
        )}
      </div>

      {/* Global Modals */}
      <LiveSimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        chaosRules={chaosRules}
        onSimulationComplete={handleSimulationComplete}
      />

      <TraceImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};
