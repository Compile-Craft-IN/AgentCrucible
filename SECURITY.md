# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take the security of AgentCrucible seriously, especially given our focus on adversarial red-teaming, chaos engineering, and prompt injection defense.

If you discover a security vulnerability (such as a sandbox escape, remote code execution in trace parsing, or bypass in guardrail analyzers):

1. **Do NOT open a public GitHub issue.**
2. Report the vulnerability privately via GitHub Security Advisories on the repository:  
   `https://github.com/Compile-Craft-IN/AgentCrucible/security/advisories`
3. Include:
   * A clear description of the vulnerability.
   * Minimal reproducible steps or proof-of-concept payload.
   * Impact assessment.

We will acknowledge your report within 48 hours and work with you on an expedited patch.

## Threat Model & Isolation

* **Untrusted Code Execution**: All contributor pull requests are isolated in unprivileged, non-root Docker containers (`Dockerfile.sandbox`) with dropped Linux capabilities (`cap_drop: ALL`) and resource memory limits.
* **Adversarial Payloads**: Fuzzer mutations and synthetic chaos payloads are contained within client-side sandboxed memory and never evaluated as host shell instructions.
