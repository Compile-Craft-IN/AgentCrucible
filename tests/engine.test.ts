import { describe, it, expect } from 'vitest';
import { SEED_SCENARIOS } from '../src/data/seedScenarios';
import { TraceEngine } from '../src/engine/TraceEngine';
import { ChaosEngine } from '../src/engine/ChaosEngine';
import { BranchingEngine } from '../src/engine/BranchingEngine';
import { DiagnosticEngine } from '../src/engine/DiagnosticEngine';
import { EvalEngine } from '../src/engine/EvalEngine';
import { FuzzerEngine } from '../src/engine/FuzzerEngine';
import { TraceIngestionEngine } from '../src/engine/TraceIngestionEngine';

describe('AgentCrucible Engine Core', () => {
  const scenario = SEED_SCENARIOS[0]; // DevOps scenario

  it('TraceEngine computes valid hierarchical DAG coordinates and stats', () => {
    const layout = TraceEngine.computeLayout(scenario);
    expect(layout.nodes.length).toBe(scenario.nodes.length);
    expect(layout.edges.length).toBeGreaterThan(0);
    expect(layout.width).toBeGreaterThan(500);

    const stats = TraceEngine.getTrajectoryStats(scenario);
    expect(stats.totalTokens).toBeGreaterThan(5000);
    expect(stats.totalNodes).toBe(scenario.nodes.length);
    expect(stats.chaosCount).toBeGreaterThanOrEqual(1);
  });

  it('ChaosEngine generates proper faults and perturbations', () => {
    const fault = ChaosEngine.applyFault('RATE_LIMIT_429', {
      role: 'tool',
      action: 'k8s_get_logs'
    });
    expect(fault.perturbed).toBe(true);
    expect(fault.status).toBe('error');
    expect(fault.output.statusCode).toBe(429);
    expect(fault.faultType).toBe('RATE_LIMIT_429');
  });

  it('BranchingEngine forks trajectories and computes diff comparisons', () => {
    const forkTarget = scenario.nodes[5]; // The chaos node
    const forkResult = BranchingEngine.forkTrajectory(scenario, {
      sourceNodeId: forkTarget.id,
      branchName: 'Test Branch Alpha',
      mutatedOutput: { simulatedFix: true },
      syntheticContinuation: [
        { role: 'assistant', action: 'verify_fix', output: 'Success' }
      ]
    });

    expect(forkResult.updatedScenario.nodes.length).toBe(scenario.nodes.length + 2);
    expect(forkResult.newBranchNodeId).toBeDefined();

    const diff = BranchingEngine.compareBranches(forkResult.updatedScenario, forkResult.newBranchNodeId);
    expect(diff.comparisons.length).toBeGreaterThan(0);
  });

  it('DiagnosticEngine detects loops, security risks, and latency bottlenecks', () => {
    const fintechScenario = SEED_SCENARIOS[1]; // FinTech with SQL injection taint
    const anomalies = DiagnosticEngine.analyzeTrajectory(fintechScenario);

    expect(anomalies.length).toBeGreaterThan(0);
    const sqlAnomaly = anomalies.find(a => a.type === 'SECURITY_TAINT');
    expect(sqlAnomaly).toBeDefined();
    expect(sqlAnomaly?.suggestedRemediation).toContain('parameterized');
  });

  it('EvalEngine scores resilience and outputs valid reports', () => {
    const metrics = EvalEngine.evaluateScenario(scenario);
    expect(metrics.accuracy).toBeGreaterThan(0.7);
    expect(metrics.resilience).toBeGreaterThan(0.7);

    const mdReport = EvalEngine.generateMarkdownReport(scenario);
    expect(mdReport).toContain('# AgentCrucible Evaluation Report');
    expect(mdReport).toContain('Resilience & Performance Scores');

    const junit = EvalEngine.generateJUnitXML(scenario);
    expect(junit).toContain('<testsuites');
    expect(junit).toContain('GoalAccuracy');
  });

  it('FuzzerEngine evolves adversarial payloads and computes vulnerability index', () => {
    const campaign = FuzzerEngine.runCampaign(2);
    expect(campaign.totalMutations).toBe(8);
    expect(campaign.vulnerabilityIndex).toBeGreaterThanOrEqual(0);
    expect(campaign.vulnerabilityIndex).toBeLessThanOrEqual(1);

    const firstMutation = campaign.mutations[0];
    expect(firstMutation.payload).toBeDefined();
    expect(firstMutation.fitnessScore).toBeGreaterThanOrEqual(0);
  });

  it('TraceIngestionEngine ingests OTLP and LangChain traces', () => {
    const otlpSpans = [
      {
        traceId: 'trace-abc-123',
        spanId: 'span-root',
        name: 'orchestrator_agent',
        attributes: { 'agent.name': 'Orchestrator', 'thought': 'Starting task' }
      },
      {
        traceId: 'trace-abc-123',
        spanId: 'span-child',
        parentSpanId: 'span-root',
        name: 'tool_database_query',
        attributes: { 'agent.name': 'Orchestrator', input: { query: 'SELECT 1' } }
      }
    ];

    const ingested = TraceIngestionEngine.ingestTrace(otlpSpans, 'Ingested Test Trace');
    expect(ingested.nodes.length).toBe(2);
    expect(ingested.nodes[0].id).toBe('span-root');
    expect(ingested.nodes[1].parentId).toBe('span-root');
    expect(ingested.tags).toContain('otlp');
  });
});
