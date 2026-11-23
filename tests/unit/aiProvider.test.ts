import test from 'node:test';
import assert from 'node:assert/strict';
import { AIService } from '../../src/services/ai/AIService';

test('AIService starts in Mock / Not Connected state and responds across all 4 modes', async () => {
  const service = new AIService();
  const status = service.getProviderStatus();
  assert.equal(status.connected, false);
  assert.equal(status.modeLabel, 'Mock / Demo');

  const teacher = await service.ask({
    prompt: 'اشرح لي الحلقات for',
    mode: 'teacher',
    learnerLevel: 2,
  });
  assert.equal(teacher.isMock, true);
  assert.equal(teacher.content.length > 20, true);

  const debug = await service.ask({
    prompt: 'لماذا ظهر ZeroDivisionError؟',
    mode: 'debugging',
    learnerLevel: 3,
    codeContext: 'x = 10 / 0',
  });
  assert.equal(debug.content.includes('ZeroDivisionError'), true);

  const practice = await service.ask({
    prompt: 'أعطني تمرينًا',
    mode: 'practice',
    learnerLevel: 4,
  });
  assert.equal(practice.content.includes('count_vowels'), true);

  const explain = await service.ask({
    prompt: 'اشرح هذا الكود',
    mode: 'explain',
    learnerLevel: 1,
    codeContext: 'x = 5\nprint(x)',
  });
  assert.equal(explain.content.includes('السطر 1'), true);
});

test('AIService handles empty prompt and simulated offline errors', async () => {
  const service = new AIService();

  await assert.rejects(
    () =>
      service.ask({
        prompt: '   ',
        mode: 'teacher',
        learnerLevel: 1,
      }),
    /يرجى كتابة سؤال/
  );

  await assert.rejects(
    () =>
      service.ask({
        prompt: 'مرحبا',
        mode: 'teacher',
        learnerLevel: 1,
        simulateOffline: true,
      }),
    /انقطاع الخدمة/
  );
});

test('Placeholder providers explicitly report Not Connected', async () => {
  const service = new AIService();
  service.setActiveProvider('gemini');
  assert.equal(service.getProviderStatus().connected, false);
  await assert.rejects(
    () => service.ask({ prompt: 'test', mode: 'teacher', learnerLevel: 1 }),
    /غير مربوط/
  );
});
