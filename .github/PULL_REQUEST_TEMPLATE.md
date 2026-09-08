## Description
<!-- Provide a concise summary of the change, motivation, and which agent engine it affects -->

## Related Issues
<!-- Link open issues e.g. Fixes #12 -->

## Changes Made
- [ ] Engine modification (`src/engine/`)
- [ ] New Chaos Fault Type (`src/types/agentCrucible.types.ts`)
- [ ] UI / Studio View enhancement
- [ ] Seed scenario or benchmark suite

## Zero-Trust Verification Checklist
> **Every pull request is automatically built and tested inside an isolated, non-root Docker Sandbox (`Dockerfile.sandbox`).**

- [ ] Ran local unit tests: `npm test`
- [ ] Ran headless CI resilience benchmarks: `npm run cli:eval`
- [ ] Built production distribution: `npm run build`
- [ ] Verified inside isolated Docker sandbox: `.\scripts\sandbox-verify-pr.ps1` (or `./scripts/sandbox-verify-pr.sh`)
- [ ] No external telemetry, secret leaks, or untrusted network calls introduced
- [ ] Commit messages follow Conventional Commits standard (`feat:`, `fix:`, `refactor:`, `test:`)
