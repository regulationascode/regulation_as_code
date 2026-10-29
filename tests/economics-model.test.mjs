import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMeasured, calculateScenario } from '../src/economics-model.ts';

const scenarioValues = {
  workItems: '2',
  setup: '100',
  maintenance: '20',
  hardSavings: '50',
  low: '10',
  planning: '20',
  high: '30',
  hours_legal: '1',
  rate_legal: '100',
  hours_compliance: '0',
  rate_compliance: '0',
  hours_operations: '0',
  rate_operations: '0',
  hours_engineering: '0',
  rate_engineering: '0',
  hours_review: '0',
  rate_review: '0',
};

test('scenario separates capacity value from cash impact', () => {
  const result = calculateScenario(scenarioValues);
  assert.ok(result);
  assert.equal(result.annualBaselineHours, 2);
  assert.equal(result.annualBaselineLaborValue, 200);
  assert.equal(result.cases.planning.releasedHours, 0.4);
  assert.equal(result.cases.planning.capacityValue, 40);
  assert.equal(result.cases.planning.annualEconomicValue, 70);
  assert.equal(result.cases.planning.firstYearEconomicValue, -30);
  assert.equal(result.annualCashImpact, 30);
  assert.equal(result.firstYearCashImpact, -70);
  assert.ok(Math.abs(result.paybackYears - (100 / 30)) < 1e-12);
});

test('12-by-120-hour illustration matches $25,920 capacity arithmetic', () => {
  const result = calculateScenario({
    ...scenarioValues,
    workItems: '12',
    setup: '0',
    maintenance: '0',
    hardSavings: '0',
    low: '5',
    planning: '10',
    high: '15',
    hours_legal: '30',
    hours_compliance: '30',
    hours_operations: '30',
    hours_engineering: '30',
    hours_review: '0',
    rate_legal: '240',
    rate_compliance: '190',
    rate_operations: '140',
    rate_engineering: '150',
    rate_review: '0',
  });
  assert.ok(result);
  assert.equal(result.annualBaselineHours, 1440);
  assert.equal(result.annualBaselineLaborValue, 259200);
  assert.equal(result.cases.planning.capacityValue, 25920);
  assert.equal(result.annualCashImpact, 0);
  assert.equal(result.paybackYears, null);
});

test('scenario refuses missing, fractional-volume, and unordered sensitivity inputs', () => {
  assert.equal(calculateScenario({ ...scenarioValues, rate_legal: '' }), null);
  assert.equal(calculateScenario({ ...scenarioValues, workItems: '2.5' }), null);
  assert.equal(calculateScenario({ ...scenarioValues, low: '30', planning: '20' }), null);
  assert.equal(calculateScenario({ ...scenarioValues, high: '101' }), null);
});

test('measured value uses observed sample hours and excludes absent roles', () => {
  const result = calculateMeasured(
    {
      comparableWorkItems: 2,
      roles: {
        legal: { baselinePerItem: 3, pilotPerItem: 1.5 },
        compliance: { baselinePerItem: 4, pilotPerItem: 2 },
      },
    },
    { legal: 100, compliance: 50 },
    80,
    20,
    10,
  );
  assert.ok(result);
  assert.deepEqual(result.roles.map(role => role.role), ['legal', 'compliance']);
  assert.equal(result.roles[0].hoursReleased, 3);
  assert.equal(result.observedCapacityValue, 500);
  assert.equal(result.cashImpact, 50);
  assert.equal(result.economicValue, 550);
});

test('measured value stays incomplete for null rates and invalid amounts', () => {
  const input = { comparableWorkItems: 1, roles: { legal: { baselinePerItem: 2, pilotPerItem: 1 } } };
  assert.equal(calculateMeasured(input, { legal: null }, 0, 0, 0), null);
  assert.equal(calculateMeasured(input, { legal: 100 }, -1, 0, 0), null);
  assert.equal(calculateMeasured({ ...input, comparableWorkItems: 0 }, { legal: 100 }, 0, 0, 0), null);
});
