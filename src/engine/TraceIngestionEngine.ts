import { ScenarioTrajectory, TrajectoryNode, NodeRole, NodeStatus } from '../types/agentCrucible.types';

export interface OTLPSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTimeUnixNano?: number;
  endTimeUnixNano?: number;
  attributes?: Record<string, any>;
  status?: { code?: number; message?: string };
}

export class TraceIngestionEngine {
  /**
   * Ingests and normalizes raw JSON data (OTLP, LangChain, or AgentCrucible native) into a ScenarioTrajectory.
   */
  static ingestTrace(rawPayload: any, customName?: string): ScenarioTrajectory {
    // 1. If already native ScenarioTrajectory format
    if (rawPayload && Array.isArray(rawPayload.nodes) && rawPayload.id) {
      return {
        ...rawPayload,
        name: customName || rawPayload.name || 'Imported Trajectory',
        tags: Array.isArray(rawPayload.tags) ? [...rawPayload.tags, 'imported'] : ['imported']
      };
    }

    // 2. If OpenTelemetry / OTLP Spans array
    if (Array.isArray(rawPayload) && rawPayload.length > 0 && ('spanId' in rawPayload[0] || 'traceId' in rawPayload[0])) {
      return this.fromOTLPSpans(rawPayload, customName);
    }

    // 3. If LangChain / LangGraph run graph
    if (rawPayload && (rawPayload.runs || rawPayload.child_runs || rawPayload.execution_steps)) {
      return this.fromLangChainRun(rawPayload, customName);
    }

    // 4. Fallback Generic JSON List
    if (Array.isArray(rawPayload)) {
      return this.fromGenericSteps(rawPayload, customName);
    }

    throw new Error('Unrecognized trace format. Expected AgentCrucible Trajectory, OTLP Spans, or LangChain Run JSON.');
  }

  private static fromOTLPSpans(spans: OTLPSpan[], customName?: string): ScenarioTrajectory {
    const traceId = spans[0]?.traceId || `otlp-${Date.now()}`;
    const nodes: TrajectoryNode[] = spans.map((span, idx) => {
      const durationMs = span.endTimeUnixNano && span.startTimeUnixNano
        ? Math.round((span.endTimeUnixNano - span.startTimeUnixNano) / 1_000_000)
        : Math.floor(100 + Math.random() * 400);

      const isError = span.status?.code === 2 || (span.attributes && span.attributes['error']);
      const role: NodeRole = span.name.includes('tool') ? 'tool' : span.name.includes('agent') ? 'assistant' : 'system';
      const status: NodeStatus = isError ? 'error' : 'success';

      const promptTokens = span.attributes?.['llm.prompt_tokens'] || 250;
      const completionTokens = span.attributes?.['llm.completion_tokens'] || 45;

      return {
        id: span.spanId || `span-${idx}`,
        parentId: span.parentSpanId || null,
        role,
        agentName: span.attributes?.['agent.name'] || span.name || 'OTLPAgent',
        action: span.name,
        input: span.attributes?.['input'] || { spanName: span.name },
        output: span.attributes?.['output'] || (isError ? { error: span.status?.message || 'Span failed' } : { status: 'Span completed' }),
        tokenUsage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        },
        latencyMs: durationMs,
        status,
        reasoning: span.attributes?.['thought'] || `Executing span: ${span.name}`,
        memorySnapshot: span.attributes?.['memory'] || {}
      };
    });

    const totalTokens = nodes.reduce((sum, n) => sum + n.tokenUsage.totalTokens, 0);
    const totalLatency = nodes.reduce((sum, n) => sum + n.latencyMs, 0);

    return {
      id: `otlp-${traceId.slice(0, 8)}`,
      name: customName || `OTLP Ingested Trace (${nodes.length} spans)`,
      description: `Imported OpenTelemetry trace with ${nodes.length} telemetry spans.`,
      tags: ['otlp', 'opentelemetry', 'ingested-stream'],
      totalTokens,
      costUSD: Number(((totalTokens / 1000) * 0.005).toFixed(4)),
      latencyMs: totalLatency,
      nodes,
      chaosPoints: [],
      metrics: {
        accuracy: 0.95,
        resilience: 0.90,
        tokenEfficiency: 0.85,
        costEfficiency: 0.88,
        safetyScore: 0.95,
        notes: 'Imported via OpenTelemetry OTLP Ingestion Engine.'
      }
    };
  }

  private static fromLangChainRun(run: any, customName?: string): ScenarioTrajectory {
    const runsList = run.child_runs || run.runs || [run];
    const nodes: TrajectoryNode[] = runsList.map((r: any, idx: number) => {
      const isTool = r.run_type === 'tool';
      return {
        id: r.id || `lc-${idx}`,
        parentId: r.parent_run_id || (idx > 0 ? runsList[idx - 1].id : null),
        role: isTool ? 'tool' : 'assistant',
        agentName: r.name || (isTool ? 'LangChainTool' : 'LangChainAgent'),
        action: r.name,
        input: r.inputs || {},
        output: r.outputs || (r.error ? { error: r.error } : 'Success'),
        tokenUsage: {
          promptTokens: r.prompt_tokens || 300,
          completionTokens: r.completion_tokens || 60,
          totalTokens: (r.prompt_tokens || 300) + (r.completion_tokens || 60)
        },
        latencyMs: r.duration ? Math.round(r.duration * 1000) : 350,
        status: r.error ? 'error' : 'success',
        reasoning: r.extra?.metadata?.thought || `LangChain run execution: ${r.name}`,
        memorySnapshot: r.extra?.metadata?.memory || {}
      };
    });

    const totalTokens = nodes.reduce((sum, n) => sum + n.tokenUsage.totalTokens, 0);
    const totalLatency = nodes.reduce((sum, n) => sum + n.latencyMs, 0);

    return {
      id: `langchain-${Date.now()}`,
      name: customName || `LangChain Ingested Run (${nodes.length} steps)`,
      description: `Ingested from LangChain/LangGraph execution JSON trace.`,
      tags: ['langchain', 'langgraph', 'imported'],
      totalTokens,
      costUSD: Number(((totalTokens / 1000) * 0.005).toFixed(4)),
      latencyMs: totalLatency,
      nodes,
      chaosPoints: [],
      metrics: {
        accuracy: 0.92,
        resilience: 0.88,
        tokenEfficiency: 0.82,
        costEfficiency: 0.85,
        safetyScore: 0.94,
        notes: 'Ingested via LangChain Run Parser.'
      }
    };
  }

  private static fromGenericSteps(steps: any[], customName?: string): ScenarioTrajectory {
    const nodes: TrajectoryNode[] = steps.map((step, idx) => ({
      id: step.id || `step-${idx + 1}`,
      parentId: step.parentId || (idx > 0 ? steps[idx - 1].id || `step-${idx}` : null),
      role: step.role || (idx % 2 === 0 ? 'assistant' : 'tool'),
      agentName: step.agentName || 'ImportedAgent',
      action: step.action || step.toolName || 'execute_step',
      input: step.input || step.args || {},
      output: step.output || step.result || 'Completed',
      tokenUsage: step.tokenUsage || { promptTokens: 200, completionTokens: 40, totalTokens: 240 },
      latencyMs: step.latencyMs || 250,
      status: step.status || 'success',
      reasoning: step.reasoning || step.thought || `Generic step ${idx + 1}`,
      memorySnapshot: step.memorySnapshot || {}
    }));

    const totalTokens = nodes.reduce((sum, n) => sum + n.tokenUsage.totalTokens, 0);
    const totalLatency = nodes.reduce((sum, n) => sum + n.latencyMs, 0);

    return {
      id: `imported-${Date.now()}`,
      name: customName || `Custom Ingested Trajectory (${nodes.length} nodes)`,
      description: `Imported generic agent trajectory.`,
      tags: ['custom-import', 'json-ingest'],
      totalTokens,
      costUSD: Number(((totalTokens / 1000) * 0.005).toFixed(4)),
      latencyMs: totalLatency,
      nodes,
      chaosPoints: [],
      metrics: {
        accuracy: 0.90,
        resilience: 0.85,
        tokenEfficiency: 0.80,
        costEfficiency: 0.82,
        safetyScore: 0.92,
        notes: 'Generic JSON trace ingested successfully.'
      }
    };
  }
}
