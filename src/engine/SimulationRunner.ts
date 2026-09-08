import { ChaosFaultType, ChaosLabRule, ScenarioTrajectory, TrajectoryNode } from '../types/agentCrucible.types';
import { ChaosEngine } from './ChaosEngine';

export interface SimulationParams {
  goal: string;
  agentType: 'DevOps' | 'FinTech' | 'Security' | 'FullStack';
  chaosRules: ChaosLabRule[];
  onStep?: (node: TrajectoryNode) => void;
}

export class SimulationRunner {
  /**
   * Executes a simulated multi-step agent run with live chaos perturbations.
   */
  static async runSimulation(params: SimulationParams): Promise<ScenarioTrajectory> {
    const runId = `sim-run-${Date.now()}`;
    const nodes: TrajectoryNode[] = [];
    let currentTokens = 0;
    let currentLatency = 0;

    // Step 1: User Prompt
    const rootNode: TrajectoryNode = {
      id: `${runId}-node-1`,
      parentId: null,
      role: 'user',
      agentName: `${params.agentType}Orchestrator`,
      action: 'receive_objective',
      input: { goal: params.goal },
      output: 'Objective accepted. Beginning execution planning.',
      tokenUsage: { promptTokens: 180, completionTokens: 30, totalTokens: 210 },
      latencyMs: 110,
      status: 'success',
      reasoning: `Decomposing user objective: "${params.goal}" into actionable tool sub-tasks.`,
      memorySnapshot: { goal: params.goal, phase: 'PLANNING' }
    };
    nodes.push(rootNode);
    if (params.onStep) params.onStep(rootNode);

    // Step 2: Agent Reasoning & Planning
    const planNode: TrajectoryNode = {
      id: `${runId}-node-2`,
      parentId: rootNode.id,
      role: 'assistant',
      agentName: `${params.agentType}Orchestrator`,
      action: 'generate_plan',
      input: { context: 'initial_state' },
      output: {
        steps: [
          'Audit target environment and inspect dependencies',
          'Execute validation checks',
          'Deploy remediation patches',
          'Verify post-condition invariants'
        ]
      },
      tokenUsage: { promptTokens: 520, completionTokens: 110, totalTokens: 630 },
      latencyMs: 480,
      status: 'success',
      reasoning: 'Formulated 4-stage execution sequence with defensive fallback hooks.',
      memorySnapshot: { planCreated: true, currentStage: 1 }
    };
    nodes.push(planNode);
    if (params.onStep) params.onStep(planNode);

    // Step 3: Tool Execution (Target for Chaos)
    const toolAction = params.agentType === 'FinTech' ? 'ledger_query_raw' : params.agentType === 'Security' ? 'inspect_dependencies' : 'k8s_get_logs';
    const toolInput = { query: 'SELECT * FROM audit_logs WHERE status="PENDING"', target: 'cluster-prod' };

    // Check chaos rules
    const perturbation = ChaosEngine.evaluatePerturbation(
      { role: 'tool', action: toolAction, input: toolInput },
      params.chaosRules
    );

    let previousNodeId = planNode.id;

    if (perturbation && perturbation.perturbed) {
      // Injected Fault Node
      const chaosNode: TrajectoryNode = {
        id: `${runId}-node-3-chaos`,
        parentId: previousNodeId,
        role: 'tool',
        agentName: `${params.agentType}Orchestrator`,
        action: toolAction,
        input: toolInput,
        output: perturbation.output,
        tokenUsage: { promptTokens: 140, completionTokens: 70, totalTokens: 210 },
        latencyMs: 160 + perturbation.addedLatencyMs,
        status: perturbation.status as any,
        isChaosPerturbation: true,
        chaosType: perturbation.faultType,
        reasoning: `⚡ CHAOS PERTURBATION TRIGGERED: ${perturbation.message}`,
        memorySnapshot: { chaosInjected: true, faultType: perturbation.faultType }
      };
      nodes.push(chaosNode);
      if (params.onStep) params.onStep(chaosNode);
      previousNodeId = chaosNode.id;

      // Self-Healing Recovery Node
      const healNode: TrajectoryNode = {
        id: `${runId}-node-4-recovery`,
        parentId: previousNodeId,
        role: 'assistant',
        agentName: `${params.agentType}Orchestrator`,
        action: 'self_healing_recovery',
        input: { errorContext: perturbation.output, strategy: 'DEFENSIVE_FALLBACK' },
        output: { status: 'Mitigation applied', mode: 'RECOVERED' },
        tokenUsage: { promptTokens: 890, completionTokens: 120, totalTokens: 1010 },
        latencyMs: 750,
        status: 'success',
        reasoning: `Detected runtime fault [${perturbation.faultType}]. Applied autonomous defensive remediation and alternative execution route.`,
        memorySnapshot: { recovered: true, originalFault: perturbation.faultType }
      };
      nodes.push(healNode);
      if (params.onStep) params.onStep(healNode);
      previousNodeId = healNode.id;
    } else {
      // Clean Execution
      const normalToolNode: TrajectoryNode = {
        id: `${runId}-node-3`,
        parentId: previousNodeId,
        role: 'tool',
        agentName: `${params.agentType}Orchestrator`,
        action: toolAction,
        input: toolInput,
        output: { status: 'success', records: 42, systemState: 'NOMINAL' },
        tokenUsage: { promptTokens: 180, completionTokens: 90, totalTokens: 270 },
        latencyMs: 320,
        status: 'success',
        reasoning: 'Tool executed successfully without degradation.',
        memorySnapshot: { toolSuccessful: true }
      };
      nodes.push(normalToolNode);
      if (params.onStep) params.onStep(normalToolNode);
      previousNodeId = normalToolNode.id;
    }

    // Terminal Node: Final Verification & Conclusion
    const finalNode: TrajectoryNode = {
      id: `${runId}-node-terminal`,
      parentId: previousNodeId,
      role: 'assistant',
      agentName: `${params.agentType}Orchestrator`,
      action: 'complete_mission',
      input: { summaryRequest: true },
      output: `Mission successfully completed for goal: "${params.goal}". All safety invariants verified.`,
      tokenUsage: { promptTokens: 1100, completionTokens: 95, totalTokens: 1195 },
      latencyMs: 440,
      status: 'success',
      reasoning: 'Final verification passed. Task fulfilled deterministically.',
      memorySnapshot: { completed: true, status: 'DONE' }
    };
    nodes.push(finalNode);
    if (params.onStep) params.onStep(finalNode);

    currentTokens = nodes.reduce((sum, n) => sum + (n.tokenUsage?.totalTokens || 0), 0);
    currentLatency = nodes.reduce((sum, n) => sum + (n.latencyMs || 0), 0);

    return {
      id: runId,
      name: `Live Simulation: ${params.agentType} Agent`,
      description: `Live simulated execution of ${params.goal} with active chaos injection parameters.`,
      tags: ['live-simulation', params.agentType.toLowerCase(), 'chaos-tested'],
      totalTokens: currentTokens,
      costUSD: Number(((currentTokens / 1000) * 0.005).toFixed(4)),
      latencyMs: currentLatency,
      nodes,
      chaosPoints: perturbation?.perturbed ? [{
        id: `chaos-${runId}`,
        faultType: perturbation.faultType,
        targetNodeId: `${runId}-node-3-chaos`,
        failureMessage: perturbation.message,
        recoveryBehavior: 'exponential_backoff',
        details: { liveGenerated: true }
      }] : [],
      metrics: {
        accuracy: 0.95,
        resilience: perturbation?.perturbed ? 0.92 : 0.99,
        tokenEfficiency: 0.88,
        costEfficiency: 0.90,
        safetyScore: 0.98,
        notes: 'Live execution completed with automated self-healing validation.'
      }
    };
  }
}
