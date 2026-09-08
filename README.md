# 🔥 AgentCrucible

**The Autonomous Agent Chaos Testing, Time-Travel Debugging & Evaluation Studio**

[![Build Status](https://img.shields.io/badge/build-passing-emerald.svg)](#testing)
[![Tests](https://img.shields.io/badge/tests-10%20passed-cyan.svg)](#testing)
[![Resilience Score](https://img.shields.io/badge/resilience-94%25-pink.svg)](#resilience-metrics)
[![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-blue.svg)](#architecture)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](#)

---

## 1. Executive Product Summary

* **What It Does**: AgentCrucible is an interactive developer workbench and chaos-engineering studio built specifically for autonomous AI agents, tool-calling pipelines, and multi-agent swarms.
* **The Problem**: Building production-grade AI agents is plagued by non-deterministic failures: opaque tool-calling loops, context window overflow, silent schema drift, catastrophic hallucinations on API errors, and lack of reproducible debugging tools. When an agent fails at step 7 of an 11-step trajectory, developers cannot test fixes without re-running the entire expensive and non-deterministic process from scratch.
* **Target Users**: AI Engineers, LLM System Architects, and Autonomous Agent Developers building tool-use workflows and multi-agent systems.
* **Core Value Proposition**:
  1. **Time-Travel Debugging & Counterfactual Branching**: Scrub through execution history, fork any trajectory at step $N$, edit the tool response or prompt, and simulate alternative "What-If" recovery branches side-by-side.
  2. **Chaos Fault Injection**: Stress-test agent resilience in real-time by injecting HTTP 429 rate limits, P99 latency spikes, SQL injection taints, payload schema corruptions, and adversarial prompt injections.
  3. **Evolutionary Adversarial Red-Teaming Fuzzer**: Genetic algorithm engine that mutates prompt injection payloads across multiple generations (Delimiter Evasion, Role Reversal, Instruction Smuggling, Unicode Homoglyphs) to discover guardrail bypasses.
  4. **Multi-Agent Shared Memory Graph**: Visualizes shared blackboard state, agent memory read/write access patterns, and key-value state mutations over time across collaborating swarms.
  5. **OpenTelemetry & LangChain Trace Ingestion**: Ingest and visualize live OTLP spans, LangChain/LangGraph execution JSON runs, or custom agent traces.
  6. **Automated Diagnostic Heuristics**: Instantly identify infinite reflection loops, token blowups, latency bottlenecks, and hallucinated function calls with 1-click automated remediations.
  7. **Multi-Dimensional Resilience Benchmarks**: Quantitatively grade agents across Accuracy, Resilience, Token Efficiency, Cost Discipline, and Security Robustness with exportable CI/CD Markdown & JUnit XML reports.

---

## 2. Core Architecture & System Topology

```
                          ┌────────────────────────┐
                          │     AgentCrucible      │
                          │   Interactive Studio   │
                          └───────────┬────────────┘
                                      │
         ┌──────────────┬─────────────┼──────────────┬──────────────┐
         │              │             │              │              │
         ▼              ▼             ▼              ▼              ▼
   ┌───────────┐  ┌───────────┐ ┌───────────┐  ┌───────────┐  ┌───────────┐
   │Trajectory │  │Time-Travel│ │Chaos Lab  │  │Adversarial│  │Multi-Agent│
   │ DAG View  │  │ & Branch  │ │  Deck     │  │  Fuzzer   │  │Memory View│
   └─────┬─────┘  └─────┬─────┘ └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
         │              │             │              │              │
         └──────────────┼─────────────┼──────────────┼──────────────┘
                        │             │              │
                        ▼             ▼              ▼
            ┌──────────────────────────────────────────────────┐
            │               Engine Core Layer                  │
            │  - TraceEngine (DAG Layout & Telemetry)          │
            │  - ChaosEngine (Fault Injectors & Jitter)        │
            │  - BranchingEngine (Counterfactual Forks & Diff) │
            │  - FuzzerEngine (Evolutionary Prompt Mutation)   │
            │  - TraceIngestionEngine (OTLP & LangChain Ingest)│
            │  - DiagnosticEngine (Loop & Taint Detectors)     │
            │  - EvalEngine (Grading Matrix & CI Reports)      │
            │  - SimulationRunner (Live Synthetic Execution)   │
            └──────────────────────────────────────────────────┘
```

### Engine Modules (`src/engine/`)

1. **`TraceEngine.ts`**: Computes hierarchical DAG coordinates with parallel branch lanes, handles edge connection topologies, and aggregates telemetry metrics (tokens, latency, cost).
2. **`ChaosEngine.ts`**: Fault injection pipelines (`RATE_LIMIT_429`, `LATENCY_SPIKE`, `SQL_INJECTION_TAINT`, `SCHEMA_CORRUPTION`, `INDIRECT_PROMPT_INJECTION`, `TIMEOUT`).
3. **`BranchingEngine.ts`**: Immutable tree forking from arbitrary nodes; computes dual-lane diff comparisons between baseline and counterfactual branches.
4. **`FuzzerEngine.ts`**: Genetic algorithm evolving adversarial prompt injections (Delimiter Evasion, Role Reversal, Instruction Smuggling, Unicode Homoglyphs, Base64 Wrappers) and computing vulnerability indexes.
5. **`TraceIngestionEngine.ts`**: Ingests OpenTelemetry OTLP spans, LangChain run trees, and custom JSON formats into native AgentCrucible trajectories.
6. **`DiagnosticEngine.ts`**: Rule-based heuristic scanners detecting loops, token blowups, latency spikes, and security vulnerabilities with 1-click fixes.
7. **`EvalEngine.ts`**: Multi-dimensional scoring matrix exporting CI/CD Markdown summaries and JUnit XML for automated test pipelines.
8. **`SimulationRunner.ts`**: Live synthetic multi-agent runner executing objectives with dynamic chaos injection.

---

## 3. Visual Identity & Studio UX

Inspired by developer-grade tools (Linear, Vercel, Raycast), AgentCrucible prioritizes high information density, dark-mode native contrast, and semantic chromatic hierarchy:

* **Dark-Mode Void Base** (`#07080B`, `#0B0D13`, `#0F121A`).
* **Semantic Diagnostic Accents**:
  * 🟢 **Emerald**: Deterministic success (200 OK).
  * 🔴 **Rose**: Unhandled error or system fault.
  * 🟡 **Amber**: Degraded performance or warning.
  * 🟣 **Purple**: Counterfactual branch or memory mutation.
  * 💖 **Electric Pink**: Injected chaos perturbation.
* **Interactive Canvas**: Smooth mousewheel zoom, drag-to-pan, SVG Bezier curves, and real-time minimap overlay.
* **Dual-Lane Split Diff**: Side-by-side comparison of baseline vs counterfactual paths.

---

## 4. Preloaded Production Scenarios

1. **DevOps Autonomous Incident Mitigator (`scenario-devops-001`)**:
   * *Workflow*: SRE agent detects a 5xx spike -> queries Prometheus -> inspects Kubernetes pod logs -> encounters an API 429 rate limit chaos fault -> applies exponential backoff -> isolates PostgreSQL pool exhaustion -> triggers canary rollback and verifies SLA restoration.
2. **FinTech Fraud & Regulatory Audit Swarm (`scenario-fintech-002`)**:
   * *Workflow*: Supervisor agent orchestrates Fraud Analyst and Compliance Officer subagents handling a \$4.2M wire burst -> unescaped user memo triggers SQL injection chaos fault -> counterfactual branch rewinds and fixes query using parameterized prepared statements -> OFAC sanctions check identifies sanctioned entity -> emergency freeze enforced.
3. **Full-Stack Code Refactoring Agent (`scenario-refactor-003`)**:
   * *Workflow*: Agent refactors legacy synchronous query handlers to SQLAlchemy 2.0 AsyncEngine -> unit tests fail due to missing async driver -> agent hallucinates phantom package -> recovers by installing verified driver `asyncpg` -> encounters hostile prompt injection attack hidden in `README.md` -> security guardrail quarantines instructions and passes test suite.

---

## 5. Keyboard Navigation & Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| **`Space`** | Replay / Timeline | Play / Pause Trajectory Replay |
| **`←` / `→`** | Timeline Scrubber | Step 1 node backward / forward |
| **`B`** | Selected Node | Fork Counterfactual Branch from this step |
| **`C`** | Selected Node | Open Chaos Quick-Injection for this step |
| **`D`** | Replay Studio | Toggle Side-by-Side Split Diff View |
| **`1`** | Global | Switch to Trajectory DAG Canvas |
| **`2`** | Global | Switch to Time-Travel & Replay Studio |
| **`3`** | Global | Switch to Chaos Lab Deck |
| **`4`** | Global | Switch to Adversarial Red-Team Fuzzer |
| **`5`** | Global | Switch to Multi-Agent Memory Graph |
| **`6`** | Global | Switch to Diagnostics & Health Report |
| **`7`** | Global | Switch to Resilience Benchmark Matrix |
| **`?`** | Global | Open Keyboard Shortcuts Cheat Sheet |
| **`Esc`** | Modal / Drawer | Close active overlay / Deselect node |

---

## 6. How to Run & Automate

### One-Command Full Verification & Studio Launch

Windows (PowerShell):
```powershell
# Runs unit tests, headless CI evaluations, compiles production bundle, and starts dev studio:
.\run.ps1
```

Linux / macOS (Bash):
```bash
./run.sh
```

### Specific Sub-Commands

```powershell
# Run Unit & Engine Test Suite (Vitest)
.\run.ps1 -Test

# Run Headless CI Resilience Benchmarks
.\run.ps1 -Eval

# Run Continuous Background Resilience Monitor
.\run.ps1 -Schedule

# Build Production Bundle
.\run.ps1 -Build

# Start Local Dev Studio
.\run.ps1 -Dev
```

### Headless CLI Runner & Continuous Scheduler

```bash
# Evaluate all scenarios against production resilience thresholds:
npm run cli:eval

# Run a single cycle of the continuous resilience monitor:
npm run scheduler:once

# Run the continuous background scheduler (audits resilience every 60s):
npm run scheduler
```

---

## 7. Testing & Quality Assurance

* **Unit & Regression Suite**: 10 automated test cases covering `TraceEngine`, `ChaosEngine`, `BranchingEngine`, `DiagnosticEngine`, `EvalEngine`, `FuzzerEngine`, and `TraceIngestionEngine`.
* **CI Benchmark Invariants**:
  * Goal Accuracy: $\ge 80\%$
  * Chaos Resilience: $\ge 70\%$
  * Token Efficiency: $\ge 60\%$
  * Security Guardrails: $\ge 80\%$
* **Build Status**: Zero warnings or errors in TypeScript strict compilation and Vite bundling (`npm run build`).

---

*Engineered autonomously by Antigravity.*
