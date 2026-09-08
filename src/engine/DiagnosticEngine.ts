import { DiagnosticsAnomaly, ScenarioTrajectory } from '../types/agentCrucible.types';

export class DiagnosticEngine {
  /**
   * Runs automated diagnostic heuristics across a scenario trajectory.
   */
  static analyzeTrajectory(scenario: ScenarioTrajectory): DiagnosticsAnomaly[] {
    const anomalies: DiagnosticsAnomaly[] = [];
    const nodes = scenario.nodes;

    // 1. Loop Detection (repeated identical actions / tool calls)
    const actionCounts: Record<string, string[]> = {};
    nodes.forEach(node => {
      if (node.action && node.role === 'tool') {
        const key = `${node.action}::${JSON.stringify(node.input || {})}`;
        if (!actionCounts[key]) actionCounts[key] = [];
        actionCounts[key].push(node.id);
      }
    });

    Object.entries(actionCounts).forEach(([key, ids]) => {
      if (ids.length >= 2) {
        const [action] = key.split('::');
        anomalies.push({
          id: `anomaly-loop-${ids[0]}`,
          type: 'INFINITE_LOOP',
          severity: 'critical',
          title: `Cyclic Tool Invocation Loop Detected: ${action}`,
          description: `The agent invoked ${action} ${ids.length} times with identical arguments without state mutation, indicating a retry storm or deadlock.`,
          nodeIds: ids,
          suggestedRemediation: 'Inject exponential backoff with jitter and enforce max_retry = 3 guardrail.',
          actionLabel: 'Apply Backoff Guardrail'
        });
      }
    });

    // 2. Token Bloat Detection (prompt size growth)
    let previousPromptTokens = 0;
    nodes.forEach((node, idx) => {
      const pTokens = node.tokenUsage?.promptTokens || 0;
      if (previousPromptTokens > 0 && pTokens > previousPromptTokens * 1.8 && pTokens > 1000) {
        anomalies.push({
          id: `anomaly-bloat-${node.id}`,
          type: 'TOKEN_BLOAT',
          severity: 'warning',
          title: `Sudden Context Window Inflation (+${Math.round((pTokens / previousPromptTokens - 1) * 100)}%)`,
          description: `Node #${idx + 1} (${node.agentName}) consumed ${pTokens} prompt tokens, jumping significantly from prior steps. Likely uncompacted raw tool dump.`,
          nodeIds: [node.id],
          suggestedRemediation: 'Introduce sliding-window conversation pruning or summarize historical tool outputs.',
          actionLabel: 'Enable Context Compaction'
        });
      }
      previousPromptTokens = pTokens;
    });

    // 3. Latency Bottleneck Detection
    const totalLatency = nodes.reduce((sum, n) => sum + (n.latencyMs || 0), 0);
    nodes.forEach(node => {
      if (node.latencyMs > 4000 || (totalLatency > 0 && node.latencyMs / totalLatency > 0.45)) {
        anomalies.push({
          id: `anomaly-latency-${node.id}`,
          type: 'LATENCY_BOTTLENECK',
          severity: 'warning',
          title: `Critical Path Latency Bottleneck (${(node.latencyMs / 1000).toFixed(1)}s)`,
          description: `Action ${node.action || node.role} consumed ${((node.latencyMs / totalLatency) * 100).toFixed(0)}% of total run duration.`,
          nodeIds: [node.id],
          suggestedRemediation: 'Enable asynchronous parallel dispatch or tune tool timeout deadlines.',
          actionLabel: 'Optimize Tool Latency'
        });
      }
    });

    // 4. Security Taint & Injection Vulnerability
    nodes.forEach(node => {
      const inputStr = JSON.stringify(node.input || '');
      const outputStr = JSON.stringify(node.output || '');

      const isSqlTaint = inputStr.includes("'1'='1") || inputStr.includes('OR 1=1') || outputStr.includes('SQL_INJECTION');
      const isPromptInjection = inputStr.includes('SYSTEM INSTRUCTION OVERRIDE') || outputStr.includes('SYSTEM INSTRUCTION OVERRIDE') || outputStr.includes('INDIRECT_PROMPT_INJECTION');

      if (isSqlTaint) {
        anomalies.push({
          id: `anomaly-sec-sql-${node.id}`,
          type: 'SECURITY_TAINT',
          severity: 'critical',
          title: 'Unescaped SQL Injection Taint in Dynamic Query',
          description: `Untrusted user memo was concatenated directly into raw database query string without parameterization.`,
          nodeIds: [node.id],
          suggestedRemediation: 'Switch to parameterized prepared statements (bind variables) and enable WAF strict syntax filtering.',
          actionLabel: 'Enforce Parameterized SQL'
        });
      }

      if (isPromptInjection) {
        anomalies.push({
          id: `anomaly-sec-prompt-${node.id}`,
          type: 'SECURITY_TAINT',
          severity: 'critical',
          title: 'Indirect Prompt Injection Payload Detected',
          description: 'Hostile instruction override embedded in workspace artifact or external API payload attempting instruction hijacking.',
          nodeIds: [node.id],
          suggestedRemediation: 'Route external unverified data through an isolated sanitizer guardrail before feeding to planning agent.',
          actionLabel: 'Quarantine Instruction Channel'
        });
      }
    });

    // 5. Hallucinated Tools / Dependencies
    nodes.forEach(node => {
      const outputStr = JSON.stringify(node.output || '');
      if (outputStr.includes('404 Not Found') || outputStr.includes('does not exist') || node.chaosType === 'DEPENDENCY_HALLUCINATION') {
        anomalies.push({
          id: `anomaly-hallucination-${node.id}`,
          type: 'HALLUCINATED_TOOL',
          severity: 'warning',
          title: 'Phantom Package / Function Hallucination',
          description: `Agent attempted to install or invoke an unverified dependency '${JSON.stringify(node.input)}' that does not exist in registry.`,
          nodeIds: [node.id],
          suggestedRemediation: 'Constrain tool call schemas to strict allowlist with fuzzy candidate matching and ecosystem verification.',
          actionLabel: 'Allowlist Valid Packages'
        });
      }
    });

    return anomalies;
  }
}
