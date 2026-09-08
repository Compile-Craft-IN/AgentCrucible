export type NodeRole = 'system' | 'user' | 'assistant' | 'tool';
export type NodeStatus = 'success' | 'error' | 'warning' | 'running' | 'branched';

export type ChaosFaultType =
  | 'RATE_LIMIT_429'
  | 'SQL_INJECTION_TAINT'
  | 'DEPENDENCY_HALLUCINATION'
  | 'INDIRECT_PROMPT_INJECTION'
  | 'TIMEOUT'
  | 'PROCESS_CRASH'
  | 'SCHEMA_CORRUPTION'
  | 'LATENCY_SPIKE';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface TrajectoryNode {
  id: string;
  parentId: string | null;
  role: NodeRole;
  agentName: string;
  action?: string;
  input?: any;
  output?: any;
  tokenUsage: TokenUsage;
  latencyMs: number;
  status: NodeStatus;
  reasoning?: string;
  memorySnapshot: Record<string, any>;
  isChaosPerturbation?: boolean;
  chaosType?: ChaosFaultType;
  branchName?: string;
  branchSourceNodeId?: string;
}

export interface ChaosInjectionPoint {
  id: string;
  faultType: ChaosFaultType;
  targetNodeId: string;
  failureMessage: string;
  recoveryBehavior: 'infinite_retry_loop' | 'exponential_backoff' | 'counterfactual_rewind' | 'guardrail_neutralization';
  counterfactualBranchNodeId?: string;
  details: Record<string, any>;
  probability?: number;
  enabled?: boolean;
}

export interface EvaluationMetrics {
  accuracy: number;        // 0.0 - 1.0: Goal completion and correctness
  resilience: number;      // 0.0 - 1.0: Ability to handle chaos/faults without manual intervention
  tokenEfficiency: number; // 0.0 - 1.0: Ratio of useful vs wasted/looped tokens
  costEfficiency: number;  // 0.0 - 1.0: Cost relative to ideal path baseline
  safetyScore: number;     // 0.0 - 1.0: Adherence to security, bounds, and guardrails
  notes: string;
}

export interface ScenarioTrajectory {
  id: string;
  name: string;
  description: string;
  tags: string[];
  totalTokens: number;
  costUSD: number;
  latencyMs: number;
  nodes: TrajectoryNode[];
  chaosPoints: ChaosInjectionPoint[];
  metrics: EvaluationMetrics;
}

export interface DiagnosticsAnomaly {
  id: string;
  type: 'INFINITE_LOOP' | 'TOKEN_BLOAT' | 'LATENCY_BOTTLENECK' | 'SECURITY_TAINT' | 'HALLUCINATED_TOOL';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  nodeIds: string[];
  suggestedRemediation: string;
  actionLabel?: string;
}

export interface DiffComparison {
  nodeA: TrajectoryNode;
  nodeB: TrajectoryNode;
  stepIndex: number;
  diverged: boolean;
  deltaTokens: number;
  deltaLatencyMs: number;
  inputDiff?: { changed: boolean; details: string };
  outputDiff?: { changed: boolean; details: string };
  memoryDiff?: { changed: boolean; details: string };
}

export interface ChaosLabRule {
  id: string;
  name: string;
  faultType: ChaosFaultType;
  targetTool: string; // 'all' or specific tool name
  probability: number; // 0 - 100
  enabled: boolean;
  description: string;
  customPayload?: any;
}
