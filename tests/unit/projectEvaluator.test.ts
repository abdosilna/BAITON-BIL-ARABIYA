import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PROJECTS } from '../../src/data/projects';
import { buildProjectTestScript, summarizeProjectRun } from '../../src/utils/projectEvaluator';

test('project test builder and summarizer handle passing and partial states', () => {
  const calc = SEED_PROJECTS[0];
  const script = buildProjectTestScript(calc.starterCode, calc.testCases[0]);
  assert.equal(script.includes(`__TEST_PASSED__:${calc.testCases[0].id}`), true);

  const allPass = summarizeProjectRun(
    calc,
    calc.testCases.map((tc) => ({
      testId: tc.id,
      descriptionAr: tc.descriptionAr,
      passed: true,
    }))
  );
  assert.equal(allPass.passed, true);
  assert.equal(allPass.passedTests, calc.testCases.length);

  const partial = summarizeProjectRun(calc, [
    { testId: 'calc-1', descriptionAr: '1', passed: true },
    { testId: 'calc-2', descriptionAr: '2', passed: false, error: 'AssertionError' },
  ]);
  assert.equal(partial.passed, false);
  assert.equal(partial.passedTests, 1);
});
