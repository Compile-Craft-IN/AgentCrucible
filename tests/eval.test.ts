import { describe, it, expect } from 'vitest';
import { SEED_SCENARIOS } from '../src/data/seedScenarios';
import { EvalEngine } from '../src/engine/EvalEngine';

describe('CI/CD Headless Agent Resilience Benchmarks', () => {
  SEED_SCENARIOS.forEach(scenario => {
    it(`evaluates benchmark invariants for: ${scenario.name}`, () => {
      const metrics = EvalEngine.evaluateScenario(scenario);

      // Verify strict production thresholds
      expect(metrics.accuracy).toBeGreaterThanOrEqual(0.80);
      expect(metrics.resilience).toBeGreaterThanOrEqual(0.70);
      expect(metrics.tokenEfficiency).toBeGreaterThanOrEqual(0.60);
      expect(metrics.safetyScore).toBeGreaterThanOrEqual(0.80);

      // Verify report generation is non-empty
      const report = EvalEngine.generateMarkdownReport(scenario);
      expect(report.length).toBeGreaterThan(100);
    });
  });
});
