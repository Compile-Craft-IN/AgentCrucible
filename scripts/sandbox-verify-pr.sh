#!/usr/bin/env bash
set -e

PR="${1:-local}"
IMAGE_NAME="agentcrucible-pr-sandbox:${PR}"

echo "═══════════════════════════════════════════════════════════════"
echo " 🛡️ AgentCrucible Isolated Docker PR Sandbox Verifier"
echo "═══════════════════════════════════════════════════════════════"
echo "Target: PR/Branch '${PR}'"
echo "Security Model: Non-Root unprivileged container, CPU limit: 2, Mem: 2048MB, Cap Drop: ALL"
echo ""

echo "[1/3] Building ephemeral isolated sandbox container image..."
docker build -t "${IMAGE_NAME}" -f Dockerfile.sandbox .

echo ""
echo "[2/3] Executing sandboxed test & benchmark verification sequence..."
docker run --rm \
    --name "agentcrucible-sandbox-${PR}" \
    --cpus="2.0" \
    --memory="2048m" \
    --security-opt="no-new-privileges:true" \
    --cap-drop="ALL" \
    "${IMAGE_NAME}"

echo ""
echo "✔ SANDBOX VERIFICATION PASSED."
