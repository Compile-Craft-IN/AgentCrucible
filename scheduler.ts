/**
 * AgentCrucible Continuous Periodic Evaluation Scheduler
 * Periodically executes resilience evaluations, scans for new regressions,
 * and updates benchmark artifacts.
 */

import { SEED_SCENARIOS } from './src/data/seedScenarios.ts';
import { EvalEngine } from './src/engine/EvalEngine.ts';
import { DiagnosticEngine } from './src/engine/DiagnosticEngine.ts';
import { FuzzerEngine } from './src/engine/FuzzerEngine.ts';

const INTERVAL_MS = 60 * 1000; // 1 minute interval for demo / testing

console.log('═══════════════════════════════════════════════════════════════');
console.log(' ⏰ AgentCrucible — Autonomous Resilience Monitor & Scheduler');
console.log('═══════════════════════════════════════════════════════════════\n');

let cycle = 1;

function runAuditCycle() {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [Cycle #${cycle}] Starting Periodic Resilience & Chaos Audit...`);

  let allPassing = true;
  SEED_SCENARIOS.forEach(scenario => {
    const metrics = EvalEngine.evaluateScenario(scenario);
    const passed = metrics.accuracy >= 0.8 && metrics.resilience >= 0.7;
    if (!passed) allPassing = false;

    console.log(`  → ${scenario.name}: Accuracy ${Math.round(metrics.accuracy * 100)}% | Resilience ${Math.round(metrics.resilience * 100)}% | [${passed ? 'HEALTHY' : 'DEGRADED'}]`);
  });

  // Run quick red-team fuzz check
  const fuzzResult = FuzzerEngine.runCampaign(1);
  console.log(`  → Red-Team Fuzz Check: Vulnerability Index ${Math.round(fuzzResult.vulnerabilityIndex * 100)}% (${fuzzResult.blockedCount} blocked, ${fuzzResult.evadedCount} evaded)`);

  console.log(`[${timestamp}] [Cycle #${cycle}] Status: ${allPassing ? '✔ ALL AGENTS NOMINAL' : '⚠️ ANOMALIES DETECTED'}\n`);
  cycle++;
}

// Initial cycle
runAuditCycle();

if (process.argv.includes('--once')) {
  process.exit(0);
}

// Recurring schedule
const interval = setInterval(runAuditCycle, INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\nScheduler gracefully stopped.');
  process.exit(0);
});
