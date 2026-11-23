import type { Exercise } from '../types/database';

export interface EvaluationResult {
  isCorrect: boolean;
  feedbackAr: string;
  explanationAr: string;
}

function normalizeAnswer(val: string): string {
  return val
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ');
}

export function evaluateStaticExercise(
  exercise: Exercise,
  userAnswer: string | number | boolean | string[]
): EvaluationResult {
  switch (exercise.type) {
    case 'multiple_choice': {
      const selected = typeof userAnswer === 'number' ? userAnswer : Number(userAnswer);
      const isCorrect = selected === Number(exercise.correctAnswer);
      return {
        isCorrect,
        feedbackAr: isCorrect
          ? 'إجابة صحيحة! أحسنت الفهم.'
          : 'إجابة غير دقيقة. راجع الخيارات وحاول مرة أخرى.',
        explanationAr: exercise.explanationAr,
      };
    }

    case 'true_false': {
      const selectedBool =
        typeof userAnswer === 'boolean'
          ? userAnswer
          : String(userAnswer).toLowerCase() === 'true';
      const expectedBool = Boolean(exercise.correctAnswer);
      const isCorrect = selectedBool === expectedBool;
      return {
        isCorrect,
        feedbackAr: isCorrect
          ? 'صحيح تمامًا!'
          : 'غير صحيح. تحقق من القاعدة البرمجية في التلميح.',
        explanationAr: exercise.explanationAr,
      };
    }

    case 'fill_blanks':
    case 'complete_code':
    case 'find_bug':
    case 'predict_output': {
      const userStr = normalizeAnswer(String(userAnswer));
      if (!userStr) {
        return {
          isCorrect: false,
          feedbackAr: 'يرجى إدخال إجابة قبل التحقق.',
          explanationAr: exercise.explanationAr,
        };
      }
      const expected = exercise.correctAnswer;
      let isCorrect = false;
      if (Array.isArray(expected)) {
        isCorrect = expected.some((candidate) => normalizeAnswer(String(candidate)) === userStr);
      } else {
        isCorrect = normalizeAnswer(String(expected)) === userStr;
      }

      return {
        isCorrect,
        feedbackAr: isCorrect
          ? 'ممتاز! إجابتك مطابقة للحل الصحيح.'
          : 'النتيجة غير مطابقة بعد. استعن بالتلميح وأعد المحاولة.',
        explanationAr: exercise.explanationAr,
      };
    }

    case 'arrange_blocks': {
      const userArr = Array.isArray(userAnswer)
        ? userAnswer.map((item) => item.trim())
        : String(userAnswer)
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
      const expectedArr = Array.isArray(exercise.correctAnswer)
        ? exercise.correctAnswer.map((item) => String(item).trim())
        : [];
      const isCorrect =
        userArr.length === expectedArr.length &&
        userArr.every((item, idx) => item === expectedArr[idx]);
      return {
        isCorrect,
        feedbackAr: isCorrect
          ? 'ترتيب رائع! تسلسل الكود منطقي وصحيح.'
          : 'ترتيب الأسطر يحتاج مراجعة. لاحظ تسلسل التنفيذ من الأعلى للأسفل.',
        explanationAr: exercise.explanationAr,
      };
    }

    case 'write_python': {
      // Handled asynchronously via Pyodide in evaluatePythonExercise
      return {
        isCorrect: false,
        feedbackAr: 'يتطلب هذا التمرين تشغيل كود Python للتحقق.',
        explanationAr: exercise.explanationAr,
      };
    }
  }
}

export function buildPythonExerciseHarness(
  userCode: string,
  exercise: Exercise
): string {
  const safeValidation = exercise.validationCode ?? '';
  if (safeValidation.trim().length > 0) {
    return `${userCode}\n\n# --- Verification Assertions ---\n${safeValidation}\nprint("__EXERCISE_PASS__")`;
  }
  return userCode;
}

export function verifyPythonExerciseExecution(
  exercise: Exercise,
  stdout: string,
  stderr: string
): EvaluationResult {
  if (stderr.trim().length > 0) {
    return {
      isCorrect: false,
      feedbackAr: `حدث خطأ أثناء تشغيل الكود:\n${stderr.trim()}`,
      explanationAr: exercise.explanationAr,
    };
  }

  if (exercise.validationCode && exercise.validationCode.trim().length > 0) {
    const passed = stdout.includes('__EXERCISE_PASS__');
    return {
      isCorrect: passed,
      feedbackAr: passed
        ? 'عمل رائع! اجتاز كودك جميع الاختبارات.'
        : 'الكود لم يجتز اختبارات التحقق بعد.',
      explanationAr: exercise.explanationAr,
    };
  }

  const normalizedStdout = stdout.trim();
  const normalizedExpected = (exercise.expectedOutput ?? '').trim();
  const passed = normalizedStdout === normalizedExpected;

  return {
    isCorrect: passed,
    feedbackAr: passed
      ? 'ممتاز! المخرجات مطابقة تمامًا للمطلوب.'
      : `المخرجات الفعلية (${normalizedStdout || 'فارغ'}) لا تطابق المتوقع (${normalizedExpected}).`,
    explanationAr: exercise.explanationAr,
  };
}
