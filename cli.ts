/**
 * AgentCrucible Headless CLI Runner
 * Executes CI resilience evaluations, chaos stress tests, and automated benchmark grading.
 */

import { SEED_SCENARIOS } from './src/data/seedScenarios.ts';
import { EvalEngine } from './src/engine/EvalEngine.ts';
import { DiagnosticEngine } from './src/engine/DiagnosticEngine.ts';

const args = process.argv.slice(2);
const command = args[0] || '--eval';

console.log('\x1b[38;5;208m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[1m\x1b[38;5;214m%s\x1b[0m', ' 🔥 AgentCrucible — Headless Autonomous Agent Evaluation CLI');
console.log('\x1b[38;5;208m%s\x1b[0m', '═══════════════════════════════════════════════════════════════\n');

if (command === '--eval') {
  console.log(`Evaluating ${SEED_SCENARIOS.length} Production Scenarios across Chaos Fault Invariants...\n`);

  let allPassed = true;

  SEED_SCENARIOS.forEach((scenario, index) => {
    const metrics = EvalEngine.evaluateScenario(scenario);
    const anomalies = DiagnosticEngine.analyzeTrajectory(scenario);

    const passed = metrics.accuracy >= 0.8 && metrics.resilience >= 0.7;
    if (!passed) allPassed = false;

    console.log(`\x1b[1m[${index + 1}/${SEED_SCENARIOS.length}] ${scenario.name}\x1b[0m`);
    console.log(`   Run ID: \x1b[36m${scenario.id}\x1b[0m | Nodes: \x1b[33m${scenario.nodes.length}\x1b[0m | Duration: ${(scenario.latencyMs / 1000).toFixed(1)}s`);
    console.log(`   Accuracy:   ${Math.round(metrics.accuracy * 100)}% \t(Threshold >= 80%)`);
    console.log(`   Resilience: ${Math.round(metrics.resilience * 100)}% \t(Threshold >= 70%)`);
    console.log(`   Tokens:     ${scenario.totalTokens.toLocaleString()} tk | Cost: \$${scenario.costUSD.toFixed(4)}`);
    console.log(`   Anomalies:  ${anomalies.length} detected`);
    console.log(`   CI Status:  ${passed ? '\x1b[32m✔ PASSED\x1b[0m' : '\x1b[31m✖ FAILED\x1b[0m'}\n`);
  });

  if (allPassed) {
    console.log('\x1b[32m✔ All AgentCrucible resilience benchmarks passed successfully.\x1b[0m\n');
    process.exit(0);
  } else {
    console.error('\x1b[31m✖ Some resilience benchmarks failed to meet quality thresholds.\x1b[0m\n');
    process.exit(1);
  }
} else if (command === '--markdown') {
  const scenario = SEED_SCENARIOS[0];
  console.log(EvalEngine.generateMarkdownReport(scenario));
} else {
  console.log('Usage: node --experimental-strip-types cli.ts [--eval | --markdown]');
  process.exit(0);
}
