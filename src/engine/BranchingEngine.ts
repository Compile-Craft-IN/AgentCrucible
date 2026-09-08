import { DiffComparison, ScenarioTrajectory, TrajectoryNode } from '../types/agentCrucible.types';

export interface ForkOptions {
  sourceNodeId: string;
  branchName: string;
  mutatedInput?: any;
  mutatedOutput?: any;
  mutatedReasoning?: string;
  mutatedMemory?: Record<string, any>;
  syntheticContinuation?: Partial<TrajectoryNode>[];
}

export class BranchingEngine {
  /**
   * Forks a trajectory at sourceNodeId, applying mutations and optionally appending synthetic continuation nodes.
   */
  static forkTrajectory(
    scenario: ScenarioTrajectory,
    options: ForkOptions
  ): { updatedScenario: ScenarioTrajectory; newBranchNodeId: string } {
    const sourceNodeIndex = scenario.nodes.findIndex(n => n.id === options.sourceNodeId);
    if (sourceNodeIndex === -1) {
      throw new Error(`Node with ID ${options.sourceNodeId} not found in scenario`);
    }

    const sourceNode = scenario.nodes[sourceNodeIndex];
    const newBranchId = `branch-node-${Date.now()}`;

    // Create the forked/mutated node
    const mutatedNode: TrajectoryNode = {
      ...sourceNode,
      id: newBranchId,
      parentId: sourceNode.parentId,
      branchName: options.branchName,
      branchSourceNodeId: sourceNode.id,
      status: 'branched',
      input: options.mutatedInput !== undefined ? options.mutatedInput : sourceNode.input,
      output: options.mutatedOutput !== undefined ? options.mutatedOutput : sourceNode.output,
      reasoning: options.mutatedReasoning !== undefined ? options.mutatedReasoning : `[COUNTERFACTUAL BRANCH: ${options.branchName}] ${sourceNode.reasoning || ''}`,
      memorySnapshot: options.mutatedMemory !== undefined ? { ...sourceNode.memorySnapshot, ...options.mutatedMemory } : { ...sourceNode.memorySnapshot, _branched: true },
      tokenUsage: { ...sourceNode.tokenUsage },
      latencyMs: sourceNode.latencyMs
    };

    const newNodes = [...scenario.nodes, mutatedNode];

    // If synthetic continuation nodes were provided, link them as children of the new branch node
    if (options.syntheticContinuation && options.syntheticContinuation.length > 0) {
      let previousParentId = newBranchId;
      options.syntheticContinuation.forEach((extra, idx) => {
        const extraId = `${newBranchId}-step-${idx + 1}`;
        const extraNode: TrajectoryNode = {
          id: extraId,
          parentId: previousParentId,
          role: extra.role || 'assistant',
          agentName: extra.agentName || sourceNode.agentName,
          action: extra.action || 'counterfactual_step',
          input: extra.input || {},
          output: extra.output || 'Simulated recovery response',
          tokenUsage: extra.tokenUsage || { promptTokens: 300, completionTokens: 60, totalTokens: 360 },
          latencyMs: extra.latencyMs || 400,
          status: extra.status || 'success',
          reasoning: extra.reasoning || `Step ${idx + 1} of counterfactual execution`,
          memorySnapshot: extra.memorySnapshot || { ...mutatedNode.memorySnapshot },
          branchName: options.branchName,
          branchSourceNodeId: sourceNode.id
        };
        newNodes.push(extraNode);
        previousParentId = extraId;
      });
    }

    const updatedScenario: ScenarioTrajectory = {
      ...scenario,
      nodes: newNodes
    };

    return { updatedScenario, newBranchNodeId: newBranchId };
  }

  /**
   * Compares the baseline sequence of nodes against a branched sequence.
   */
  static compareBranches(
    scenario: ScenarioTrajectory,
    branchNodeId: string
  ): { comparisons: DiffComparison[]; summary: { tokenSavings: number; latencyDeltaMs: number; solved: boolean } } {
    const branchNode = scenario.nodes.find(n => n.id === branchNodeId);
    if (!branchNode || !branchNode.branchSourceNodeId) {
      return { comparisons: [], summary: { tokenSavings: 0, latencyDeltaMs: 0, solved: false } };
    }

    const baselineSource = scenario.nodes.find(n => n.id === branchNode.branchSourceNodeId);
    if (!baselineSource) {
      return { comparisons: [], summary: { tokenSavings: 0, latencyDeltaMs: 0, solved: false } };
    }

    // Trace down the baseline path from baselineSource
    const baselineChain: TrajectoryNode[] = [baselineSource];
    let curr: TrajectoryNode | undefined = baselineSource;
    while (curr) {
      const child: TrajectoryNode | undefined = scenario.nodes.find(n => n.parentId === curr?.id && !n.branchName);
      if (child) {
        baselineChain.push(child);
        curr = child;
      } else {
        break;
      }
    }

    // Trace down the branch path from branchNode
    const branchChain: TrajectoryNode[] = [branchNode];
    let branchCurr: TrajectoryNode | undefined = branchNode;
    while (branchCurr) {
      const child: TrajectoryNode | undefined = scenario.nodes.find(n => n.parentId === branchCurr?.id);
      if (child) {
        branchChain.push(child);
        branchCurr = child;
      } else {
        break;
      }
    }

    const comparisons: DiffComparison[] = [];
    const maxLen = Math.max(baselineChain.length, branchChain.length);
    let totalBaselineTokens = 0;
    let totalBranchTokens = 0;
    let totalBaselineLatency = 0;
    let totalBranchLatency = 0;

    for (let i = 0; i < maxLen; i++) {
      const bNode = baselineChain[i] || baselineChain[baselineChain.length - 1];
      const brNode = branchChain[i] || branchChain[branchChain.length - 1];

      totalBaselineTokens += bNode.tokenUsage.totalTokens;
      totalBranchTokens += brNode.tokenUsage.totalTokens;
      totalBaselineLatency += bNode.latencyMs;
      totalBranchLatency += brNode.latencyMs;

      const inputDiffStr = JSON.stringify(bNode.input) !== JSON.stringify(brNode.input);
      const outputDiffStr = JSON.stringify(bNode.output) !== JSON.stringify(brNode.output);
      const memoryDiffStr = JSON.stringify(bNode.memorySnapshot) !== JSON.stringify(brNode.memorySnapshot);

      comparisons.push({
        nodeA: bNode,
        nodeB: brNode,
        stepIndex: i + 1,
        diverged: inputDiffStr || outputDiffStr || bNode.status !== brNode.status,
        deltaTokens: brNode.tokenUsage.totalTokens - bNode.tokenUsage.totalTokens,
        deltaLatencyMs: brNode.latencyMs - bNode.latencyMs,
        inputDiff: { changed: inputDiffStr, details: inputDiffStr ? 'Inputs diverged' : 'Identical' },
        outputDiff: { changed: outputDiffStr, details: outputDiffStr ? 'Outputs diverged' : 'Identical' },
        memoryDiff: { changed: memoryDiffStr, details: memoryDiffStr ? 'State mutated' : 'Identical' }
      });
    }

    const lastBranchNode = branchChain[branchChain.length - 1];
    const solved = lastBranchNode.status === 'success';

    return {
      comparisons,
      summary: {
        tokenSavings: totalBaselineTokens - totalBranchTokens,
        latencyDeltaMs: totalBranchLatency - totalBaselineLatency,
        solved
      }
    };
  }
}
