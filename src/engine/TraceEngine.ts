import { ScenarioTrajectory, TrajectoryNode } from '../types/agentCrucible.types';

export interface LayoutNode extends TrajectoryNode {
  x: number;
  y: number;
  lane: number;
  depth: number;
  isBranch: boolean;
}

export interface DAGLayout {
  nodes: LayoutNode[];
  edges: { fromId: string; toId: string; isBranchEdge?: boolean }[];
  width: number;
  height: number;
}

export class TraceEngine {
  /**
   * Computes a clean horizontal hierarchical DAG layout with support for branching lanes.
   */
  static computeLayout(scenario: ScenarioTrajectory): DAGLayout {
    const rawNodes = scenario.nodes;
    if (rawNodes.length === 0) {
      return { nodes: [], edges: [], width: 400, height: 200 };
    }

    const nodeMap = new Map<string, TrajectoryNode>();
    const childrenMap = new Map<string, string[]>();

    rawNodes.forEach(node => {
      nodeMap.set(node.id, node);
      if (!childrenMap.has(node.id)) {
        childrenMap.set(node.id, []);
      }
      if (node.parentId) {
        if (!childrenMap.has(node.parentId)) {
          childrenMap.set(node.parentId, []);
        }
        childrenMap.get(node.parentId)!.push(node.id);
      }
    });

    const rootNodes = rawNodes.filter(n => !n.parentId || !nodeMap.has(n.parentId));

    const depthMap = new Map<string, number>();
    const laneMap = new Map<string, number>();

    let currentBranchLane = 1;

    // Traverse to compute depth and lane
    const assignCoordinates = (nodeId: string, depth: number, lane: number) => {
      depthMap.set(nodeId, depth);
      laneMap.set(nodeId, lane);

      const children = childrenMap.get(nodeId) || [];
      children.forEach((childId, idx) => {
        const childNode = nodeMap.get(childId);
        const isBranch = Boolean(childNode?.branchName || childNode?.branchSourceNodeId || idx > 0);
        const childLane = isBranch ? (idx === 0 && lane !== 0 ? lane : currentBranchLane++) : lane;
        assignCoordinates(childId, depth + 1, childLane);
      });
    };

    rootNodes.forEach(root => assignCoordinates(root.id, 0, 0));

    const NODE_WIDTH = 260;
    const HORIZONTAL_GAP = 90;
    const NODE_HEIGHT = 100;
    const VERTICAL_GAP = 60;
    const PADDING_X = 60;
    const PADDING_Y = 60;

    let maxDepth = 0;
    let maxLane = 0;

    const layoutNodes: LayoutNode[] = rawNodes.map(node => {
      const depth = depthMap.get(node.id) || 0;
      const lane = laneMap.get(node.id) || 0;
      if (depth > maxDepth) maxDepth = depth;
      if (lane > maxLane) maxLane = lane;

      const isBranch = Boolean(node.branchName || node.branchSourceNodeId || lane > 0);

      return {
        ...node,
        x: PADDING_X + depth * (NODE_WIDTH + HORIZONTAL_GAP),
        y: PADDING_Y + lane * (NODE_HEIGHT + VERTICAL_GAP),
        lane,
        depth,
        isBranch
      };
    });

    const edges: { fromId: string; toId: string; isBranchEdge?: boolean }[] = [];
    layoutNodes.forEach(node => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        edges.push({
          fromId: node.parentId,
          toId: node.id,
          isBranchEdge: node.isBranch
        });
      }
    });

    const totalWidth = PADDING_X * 2 + (maxDepth + 1) * (NODE_WIDTH + HORIZONTAL_GAP);
    const totalHeight = PADDING_Y * 2 + (maxLane + 1) * (NODE_HEIGHT + VERTICAL_GAP) + 100;

    return {
      nodes: layoutNodes,
      edges,
      width: Math.max(totalWidth, 800),
      height: Math.max(totalHeight, 500)
    };
  }

  /**
   * Returns aggregated statistics for a trajectory.
   */
  static getTrajectoryStats(scenario: ScenarioTrajectory) {
    const nodes = scenario.nodes;
    const totalTokens = nodes.reduce((acc, n) => acc + (n.tokenUsage?.totalTokens || 0), 0);
    const totalLatencyMs = nodes.reduce((acc, n) => acc + (n.latencyMs || 0), 0);
    const totalCost = (totalTokens / 1000) * 0.005; // standard blended rate estimate
    const errorCount = nodes.filter(n => n.status === 'error').length;
    const warningCount = nodes.filter(n => n.status === 'warning').length;
    const chaosCount = nodes.filter(n => n.isChaosPerturbation).length;
    const branchCount = nodes.filter(n => n.branchName || n.branchSourceNodeId).length;

    return {
      totalNodes: nodes.length,
      totalTokens,
      totalLatencyMs,
      totalCostUSD: Number(totalCost.toFixed(4)),
      errorCount,
      warningCount,
      chaosCount,
      branchCount
    };
  }
}
