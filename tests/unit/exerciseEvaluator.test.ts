import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPythonExerciseHarness,
  evaluateStaticExercise,
  verifyPythonExerciseExecution,
} from '../../src/utils/exerciseEvaluator';
import { SEED_EXERCISES } from '../../src/data/exercises';

test('evaluates multiple_choice, true_false, fill_blanks, find_bug, predict_output, and arrange_blocks', () => {
  const mc = SEED_EXERCISES.find((e) => e.type === 'multiple_choice')!;
  assert.equal(evaluateStaticExercise(mc, mc.correctAnswer as number).isCorrect, true);
  assert.equal(evaluateStaticExercise(mc, 3).isCorrect, false);

  const tf = SEED_EXERCISES.find((e) => e.type === 'true_false')!;
  assert.equal(evaluateStaticExercise(tf, true).isCorrect, true);
  assert.equal(evaluateStaticExercise(tf, false).isCorrect, false);

  const fb = SEED_EXERCISES.find((e) => e.type === 'fill_blanks')!;
  assert.equal(evaluateStaticExercise(fb, 'sep').isCorrect, true);
  assert.equal(evaluateStaticExercise(fb, 'end').isCorrect, false);

  const bug = SEED_EXERCISES.find((e) => e.type === 'find_bug')!;
  assert.equal(evaluateStaticExercise(bug, 'user_score = 100').isCorrect, true);

  const pred = SEED_EXERCISES.find((e) => e.type === 'predict_output')!;
  assert.equal(evaluateStaticExercise(pred, '19').isCorrect, true);

  const arr = SEED_EXERCISES.find((e) => e.type === 'arrange_blocks')!;
  assert.equal(evaluateStaticExercise(arr, arr.correctAnswer as string[]).isCorrect, true);
  assert.equal(evaluateStaticExercise(arr, ['age = 20']).isCorrect, false);
});

test('builds and verifies write_python exercise harness', () => {
  const wp = SEED_EXERCISES.find((e) => e.type === 'write_python')!;
  const script = buildPythonExerciseHarness('def sum_to_n(n):\n    return sum(range(1, n+1))', wp);
  assert.equal(script.includes('__EXERCISE_PASS__'), true);

  const passRes = verifyPythonExerciseExecution(wp, '__EXERCISE_PASS__', '');
  assert.equal(passRes.isCorrect, true);

  const errRes = verifyPythonExerciseExecution(wp, '', 'AssertionError');
  assert.equal(errRes.isCorrect, false);
});
