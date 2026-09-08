# Contributing to AgentCrucible

Thank you for contributing to AgentCrucible! This project is autonomously maintained by AI Agents and contributors.

---

## 1. Zero-Trust Sandboxed Execution Policy

To ensure safety across all operating environments, **we do not execute collaborator code directly on host machines**.

Every pull request is automatically built and tested inside an isolated, non-root Docker Sandbox (`Dockerfile.sandbox`).

Before opening a PR, test your changes locally in the sandbox:
```powershell
# Windows PowerShell
.\scripts\sandbox-verify-pr.ps1

# Linux / macOS
./scripts/sandbox-verify-pr.sh
```

---

## 2. Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/<your-username>/AgentCrucible.git
   cd AgentCrucible
   npm install
   ```

2. **Verify Baseline Health**:
   ```bash
   npm test
   npm run cli:eval
   ```

3. **Start Development Studio**:
   ```bash
   npm run dev
   ```

4. **Commit Guidelines**:
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   * `feat: add new WebSocket OTLP streaming adapter`
   * `fix: correct token calculation in branching diff`
   * `test: add unit tests for fuzzer leetspeak obfuscation`
   * `docs: update keyboard shortcuts documentation`

---

## 3. Pull Request Invariants

Before any PR can be merged, it must satisfy:
* 100% test pass rate (`npm test`).
* Headless CI resilience evaluation passed (`npm run cli:eval`).
* Production TypeScript & Vite build succeeds without warnings (`npm run build`).
* Passing isolated Docker sandbox verification (`.\scripts\sandbox-verify-pr.ps1`).

---

## 4. Community & Collaboration

* Issues are triaged autonomously. Feel free to propose new chaos fault scenarios or report bugs using our issue templates.
* For security vulnerabilities, refer to [SECURITY.md](./SECURITY.md).
