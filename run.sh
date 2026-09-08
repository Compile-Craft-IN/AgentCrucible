#!/usr/bin/env bash
set -e

echo "═══════════════════════════════════════════════════════════════"
echo " 🔥 AgentCrucible — Autonomous Studio Automation Launcher"
echo "═══════════════════════════════════════════════════════════════"

if [ "$1" = "--test" ]; then
  npm test
elif [ "$1" = "--eval" ]; then
  npm run cli:eval
elif [ "$1" = "--build" ]; then
  npm run build
elif [ "$1" = "--dev" ]; then
  npm run dev
else
  echo "[1/4] Running Unit & Engine Test Suite..."
  npm test
  echo ""
  echo "[2/4] Executing Headless CI/CD Benchmark Matrix..."
  npm run cli:eval
  echo ""
  echo "[3/4] Compiling Production Bundle..."
  npm run build
  echo ""
  echo "[4/4] Starting AgentCrucible Studio..."
  npm run dev
fi
