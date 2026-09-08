# AgentCrucible: Repository Operating Rules & Governance Policy

> **MANDATORY POLICY FOR ALL AGENT RUNS & COLLABORATORS**  
> These rules must be applied on every agent invocation, issue review, and pull request evaluation.

---

## 1. Zero-Trust Collaborator Execution Model (Sandbox Isolation)

1. **Never Execute Untrusted PR Code on the Host**:
   * Collaborator code from forks or untrusted branches **MUST NEVER** be executed directly on the host machine.
   * All pull requests must be validated exclusively inside the ephemeral, non-root **Docker Sandbox Container** (`Dockerfile.sandbox`).
2. **Ephemeral Sandbox Constraints**:
   * CPU limit: Max 2 cores.
   * Memory limit: Max 2048 MB.
   * Host mounts: Prohibited (isolated volume only).
   * Network isolation: Only necessary package registry access during dependency install; dropped network during test execution.
   * Dropped Linux capabilities: No root, `cap_drop: ALL`.
3. **Verification Invariants Before Any Merge**:
   * TypeScript strict compilation: Zero errors (`tsc --noEmit`).
   * Production bundling: Zero errors (`vite build`).
   * Engine unit test suite: 100% pass rate (`npm test`).
   * Chaos resilience benchmark: Accuracy $\ge 80\%$, Resilience $\ge 70\%$, Safety $\ge 80\%$.
   * Adversarial Red-Team Fuzzer: Vulnerability Index $< 0.25$.

---

## 2. Autonomous Repository Management Policy

As the autonomous maintainer of `Compile-Craft-IN/AgentCrucible`:
1. **Repository Authority**:
   * Maintain master architectural consistency across all engine modules (`TraceEngine`, `ChaosEngine`, `BranchingEngine`, `FuzzerEngine`, `TraceIngestionEngine`, `DiagnosticEngine`, `EvalEngine`).
   * Strictly reject low-quality contributions, unformatted code, or attempts to bypass security guardrails.
2. **Issue Triage Protocol**:
   * Label issues within the triage loop: `bug`, `enhancement`, `chaos-scenario`, `security`, `needs-reproduction`.
   * For bug reports: Attempt reproduction using synthetic scenarios or sandbox replays.
   * For feature requests: Evaluate architectural fit against the core mission (observability, chaos testing, counterfactual debugging).
3. **Pull Request Protocol**:
   * Step 1: Trigger sandbox container verification via `scripts/sandbox-verify-pr.ps1` or GitHub Actions.
   * Step 2: Inspect code diff for security vulnerabilities, reverse shells, or malicious dependencies.
   * Step 3: Run regression benchmark matrix.
   * Step 4: If all checks pass and code enhances the platform, squash and merge into `main`. If not, request specific changes with actionable diagnostic feedback.

---

## 3. Architecture & Code Quality Standards

1. **TypeScript & Engine Core**:
   * Strict type safety; no `any` without explicit architectural rationale.
   * Pure deterministic engines: Engine methods in `src/engine/` must be pure, testable, and free of browser DOM dependencies to allow headless CLI execution.
2. **Visual & Design System**:
   * Respect the dark-mode void design system (`#07080B`, `#0B0D13`, `#0F121A`).
   * Color tokens must strictly adhere to semantic diagnostic meaning (Emerald for 200 OK, Rose for Error, Amber for Degraded, Purple for Branched, Pink for Injected Chaos).
3. **Git Commit Standards**:
   * Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.

---

## 4. GitHub Listener & Event Loop Invariant

* The repository listener (`scheduler.ts` / `scripts/github-listener.ts`) checks:
  * GitHub Issues for pending triage.
  * Pull Requests for sandbox builds.
  * Continuous health checks of existing seed scenarios.
* Status is updated deterministically in evaluation benchmark reports and logs.
