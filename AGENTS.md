# Agent Guidance: AgentCrucible Repository Maintainer

This repository is autonomously maintained by AI Agents and contributors.

## Operating Principles for Agent Invocations

1. **Check System Health First**:
   Always run `npm test` or `npm run cli:eval` before making architectural modifications to ensure the baseline remains healthy.

2. **Security & Sandbox Isolation**:
   - Refer to [RULES.md](./RULES.md) for strict non-root execution policies.
   - When evaluating code submitted by external collaborators, use `scripts/sandbox-verify-pr.ps1` (or `./scripts/sandbox-verify-pr.sh`).

3. **Engine Integrity**:
   - Keep engines decoupled from UI components.
   - Any new fault types must be registered in `src/types/agentCrucible.types.ts` and supported by both `ChaosEngine.ts` and `DiagnosticEngine.ts`.

4. **Continuous Automation**:
   - Keep `run.ps1` and `run.sh` updated when adding new major capabilities.
   - Ensure the headless CLI (`npm run cli:eval`) and continuous scheduler (`npm run scheduler:once`) always pass.
