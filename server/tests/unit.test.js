const assert = require('assert');
const { getParameterStatus, getSeverity, getRangeForAgeSex } = require('../utils/parameterStatus');
const { calculateHealthScore, getVitalsGrid, getCriticalParameters, getRuleBasedAdvisory } = require('../utils/analysisEngine');
const { canAccessReport } = require('../utils/accessControl');

async function runTests() {
  console.log('Running LabLens Unit & Security Tests...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✕ ${name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✕ ${name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Parameter Status Tests
  test('getParameterStatus - numeric normal', () => {
    assert.strictEqual(getParameterStatus(14.0, 12.0, 16.0), 'normal');
  });

  test('getParameterStatus - numeric low', () => {
    assert.strictEqual(getParameterStatus(10.5, 12.0, 16.0), 'low');
  });

  test('getParameterStatus - numeric high', () => {
    assert.strictEqual(getParameterStatus(18.2, 12.0, 16.0), 'high');
  });

  test('getParameterStatus - text positive is abnormal', () => {
    assert.strictEqual(getParameterStatus(null, null, null, 'text', 'Positive', 'Negative'), 'abnormal');
  });

  test('getParameterStatus - text negative is normal', () => {
    assert.strictEqual(getParameterStatus(null, null, null, 'text', 'Negative', 'Negative'), 'normal');
  });

  // 2. Severity Calculation Tests
  test('getSeverity - normal status gives none', () => {
    assert.strictEqual(getSeverity(14.0, 12.0, 16.0, 'normal'), 'none');
  });

  test('getSeverity - <10% outside gives mild', () => {
    // 16 * 1.05 = 16.8 (5% over max high of 16.0)
    assert.strictEqual(getSeverity(16.8, 12.0, 16.0, 'high'), 'mild');
  });

  test('getSeverity - 10-30% outside gives moderate', () => {
    // 16 * 1.20 = 19.2 (20% over max high of 16.0)
    assert.strictEqual(getSeverity(19.2, 12.0, 16.0, 'high'), 'moderate');
  });

  test('getSeverity - >30% outside gives marked', () => {
    // 16 * 1.40 = 22.4 (40% over max high of 16.0)
    assert.strictEqual(getSeverity(22.4, 12.0, 16.0, 'high'), 'marked');
  });

  // 3. Health Score Engine Tests
  test('calculateHealthScore - perfect parameters score 100', () => {
    const params = [
      { name: 'Hemoglobin', status: 'normal', severity: 'none' },
      { name: 'Total Cholesterol', status: 'normal', severity: 'none' }
    ];
    const { healthScore } = calculateHealthScore(params);
    assert.strictEqual(healthScore, 100);
  });

  test('calculateHealthScore - abnormal parameters deduct score proportionally', () => {
    const params = [
      { name: 'Total Cholesterol', bodySystem: 'cholesterol', status: 'high', severity: 'marked' }, // -18 pts
      { name: 'Fasting Blood Sugar', bodySystem: 'hba1c', status: 'high', severity: 'mild' } // -6 pts
    ];
    const { healthScore } = calculateHealthScore(params);
    assert.ok(healthScore < 100, 'Score should be less than 100');
    assert.ok(healthScore > 0, 'Score should be positive');
  });

  // 4. canAccessReport Access Matrix Tests
  await asyncTest('canAccessReport - patient accessing own report is allowed', async () => {
    const patientUser = { id: 'user123', role: 'patient' };
    const report = { user: 'user123' };
    const allowed = await canAccessReport(patientUser, report);
    assert.strictEqual(allowed, true);
  });

  await asyncTest('canAccessReport - patient accessing another patient report is DENIED', async () => {
    const patientUserA = { id: 'user123', role: 'patient' };
    const reportB = { user: 'user999' };
    const allowed = await canAccessReport(patientUserA, reportB);
    assert.strictEqual(allowed, false);
  });

  console.log(`\nTest Suite Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
