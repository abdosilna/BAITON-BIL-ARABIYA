import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, HelpCircle, Play, RotateCcw, XCircle } from 'lucide-react';
import { CodeMirrorEditor } from '../../components/CodeMirrorEditor';
import { AlertBanner, Button, Card, CodeBlock } from '../../components/ui/Primitives';
import { pythonRuntime } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import type { Exercise } from '../../types/database';
import {
  buildPythonExerciseHarness,
  evaluateStaticExercise,
  verifyPythonExerciseExecution,
  type EvaluationResult,
} from '../../utils/exerciseEvaluator';

interface InteractiveExerciseRunnerProps {
  exercise: Exercise;
  onCompleted?: (isCorrect: boolean) => void;
}

const EXERCISE_TYPE_LABELS: Record<Exercise['type'], string> = {
  multiple_choice: 'اختيار من متعدد',
  true_false: 'صح أو خطأ',
  fill_blanks: 'أكمل الفراغ',
  complete_code: 'أكمل الكود',
  find_bug: 'اكتشف الخطأ وأصلحه',
  arrange_blocks: 'رتب الكتل البرمجية',
  write_python: 'كتابة كود Python',
  predict_output: 'توقّع المخرجات',
};

export function InteractiveExerciseRunner({
  exercise,
  onCompleted,
}: InteractiveExerciseRunnerProps) {
  const submitExerciseAttempt = useAppStore((s) => s.submitExerciseAttempt);
  const settings = useAppStore((s) => s.settings);
  const submissions = useAppStore((s) => s.submissions);

  const alreadySolved = submissions.some((s) => s.exerciseId === exercise.id && s.isCorrect);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [boolChoice, setBoolChoice] = useState<boolean | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [codeAnswer, setCodeAnswer] = useState<string>(exercise.codeSnippet ?? '');
  const [orderedBlocks, setOrderedBlocks] = useState<string[]>(exercise.blocks ?? []);
  const [showHint, setShowHint] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pythonOutput, setPythonOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    setSelectedIndex(null);
    setBoolChoice(null);
    setTextAnswer('');
    setCodeAnswer(exercise.codeSnippet ?? '');
    setOrderedBlocks(exercise.blocks ?? []);
    setShowHint(false);
    setPythonOutput(null);
    setResult(null);
  }, [exercise]);

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= orderedBlocks.length) return;
    const copy = [...orderedBlocks];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setOrderedBlocks(copy);
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setBoolChoice(null);
    setTextAnswer('');
    setCodeAnswer(exercise.codeSnippet ?? '');
    setOrderedBlocks(exercise.blocks ?? []);
    setPythonOutput(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (exercise.type === 'write_python') {
      setIsRunning(true);
      setResult(null);
      try {
        const harness = buildPythonExerciseHarness(codeAnswer, exercise);
        const execResult = await pythonRuntime.run(harness);
        const cleanStdout = execResult.stdout.replace(/__EXERCISE_PASS__/g, '').trim();
        setPythonOutput({ stdout: cleanStdout, stderr: execResult.stderr });
        const evalRes = verifyPythonExerciseExecution(
          exercise,
          execResult.stdout,
          execResult.stderr
        );
        setResult(evalRes);
        await submitExerciseAttempt(exercise.id, codeAnswer, evalRes.isCorrect);
        onCompleted?.(evalRes.isCorrect);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    let rawAnswer: string | number | boolean | string[] = '';
    if (exercise.type === 'multiple_choice') {
      if (selectedIndex === null) {
        setResult({
          isCorrect: false,
          feedbackAr: 'اختر إجابة واحدة أولًا.',
          explanationAr: exercise.hintAr,
        });
        return;
      }
      rawAnswer = selectedIndex;
    } else if (exercise.type === 'true_false') {
      if (boolChoice === null) {
        setResult({
          isCorrect: false,
          feedbackAr: 'اختر صح أو خطأ قبل التحقق.',
          explanationAr: exercise.hintAr,
        });
        return;
      }
      rawAnswer = boolChoice;
    } else if (exercise.type === 'arrange_blocks') {
      rawAnswer = orderedBlocks;
    } else {
      rawAnswer = textAnswer;
    }

    const evalRes = evaluateStaticExercise(exercise, rawAnswer);
    setResult(evalRes);
    await submitExerciseAttempt(
      exercise.id,
      Array.isArray(rawAnswer) ? rawAnswer.join('\n') : String(rawAnswer),
      evalRes.isCorrect
    );
    onCompleted?.(evalRes.isCorrect);
  };

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1B5]">
            <span>{EXERCISE_TYPE_LABELS[exercise.type]}</span>
            <span aria-hidden="true">·</span>
            <span>المستوى: {exercise.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-[#F59E0B]">+{exercise.xpReward} XP</span>
            {alreadySolved && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#22C55E] font-medium">مكتمل مسبقًا</span>
              </>
            )}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold text-white">{exercise.titleAr}</h3>
        </div>

        <button
          type="button"
          onClick={() => setShowHint((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#272338] px-3 py-1.5 text-xs text-[#E4E4F0] hover:bg-[#322D47] whitespace-nowrap shrink-0"
        >
          <HelpCircle className="h-3.5 w-3.5 text-[#F59E0B]" aria-hidden="true" />
          <span>{showHint ? 'إخفاء التلميح' : 'تلميح'}</span>
        </button>
      </div>

      <p className="text-sm leading-relaxed text-[#E4E4F0]">{exercise.promptAr}</p>

      {showHint && (
        <AlertBanner tone="warning" title="تلميح تعليمي" description={exercise.hintAr} />
      )}

      {exercise.codeSnippet && exercise.type !== 'write_python' && (
        <CodeBlock code={exercise.codeSnippet} title="الكود المرجعي" />
      )}

      {/* Multiple Choice */}
      {exercise.type === 'multiple_choice' && exercise.options && (
        <div className="space-y-2.5" role="radiogroup" aria-label={exercise.titleAr}>
          {exercise.options.map((opt, idx) => {
            const active = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedIndex(idx)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-right text-sm transition-colors ${
                  active
                    ? 'border-[#8B5CF6] bg-[#272338] text-white'
                    : 'border-white/10 bg-[#101018] text-[#D4D4E0] hover:border-white/25'
                }`}
              >
                <span className="code-ltr font-mono text-xs sm:text-sm">{opt}</span>
                <span className="text-xs text-[#A1A1B5] font-mono tabular-nums">{idx + 1}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* True / False */}
      {exercise.type === 'true_false' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: true, label: 'صحيح (True)' },
            { val: false, label: 'خطأ (False)' },
          ].map((item) => {
            const active = boolChoice === item.val;
            return (
              <button
                key={String(item.val)}
                type="button"
                onClick={() => setBoolChoice(item.val)}
                className={`rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-[#8B5CF6] bg-[#272338] text-white'
                    : 'border-white/10 bg-[#101018] text-[#D4D4E0] hover:border-white/25'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Text Input Exercises */}
      {(exercise.type === 'fill_blanks' ||
        exercise.type === 'complete_code' ||
        exercise.type === 'find_bug' ||
        exercise.type === 'predict_output') && (
        <div>
          <label
            htmlFor={`answer-${exercise.id}`}
            className="mb-2 block text-xs font-medium text-[#A1A1B5]"
          >
            أدخل الإجابة البرمجية أو الناتج المتوقع:
          </label>
          <input
            id={`answer-${exercise.id}`}
            type="text"
            dir="ltr"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            className="w-full rounded-xl border border-white/15 bg-[#0D0D14] px-4 py-3 text-sm font-mono text-white placeholder:text-[#6E6E8A] focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>
      )}

      {/* Arrange Blocks */}
      {exercise.type === 'arrange_blocks' && (
        <div className="space-y-2">
          <p className="text-xs text-[#A1A1B5]">استخدم أسهم التحريك لترتيب الأسطر بالترتيب الصحيح:</p>
          {orderedBlocks.map((block, idx) => (
            <div
              key={`${block}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0D0D14] px-3 py-2.5"
            >
              <code className="code-ltr flex-1 overflow-x-auto text-sm font-mono text-[#E4E4F0] whitespace-pre">
                {block}
              </code>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveBlock(idx, -1)}
                  disabled={idx === 0}
                  aria-label={`تحريك السطر ${idx + 1} للأعلى`}
                  className="rounded-md border border-white/10 p-1.5 text-[#A1A1B5] hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(idx, 1)}
                  disabled={idx === orderedBlocks.length - 1}
                  aria-label={`تحريك السطر ${idx + 1} للأسفل`}
                  className="rounded-md border border-white/10 p-1.5 text-[#A1A1B5] hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Python Code */}
      {exercise.type === 'write_python' && (
        <div className="space-y-3">
          <CodeMirrorEditor
            value={codeAnswer}
            onChange={setCodeAnswer}
            onRunShortcut={handleSubmit}
            fontSize={settings.editorFontSize}
            minHeight="180px"
            ariaLabel={`محرر كود تمرين ${exercise.titleAr}`}
          />
          {pythonOutput && (
            <div className="code-ltr rounded-xl border border-white/10 bg-[#0A0A10] p-3.5 text-xs font-mono">
              <div className="mb-1 text-[#A1A1B5]">Console Output:</div>
              {pythonOutput.stdout && (
                <pre className="whitespace-pre-wrap text-[#22C55E]">{pythonOutput.stdout}</pre>
              )}
              {pythonOutput.stderr && (
                <pre className="whitespace-pre-wrap text-red-400">{pythonOutput.stderr}</pre>
              )}
              {!pythonOutput.stdout && !pythonOutput.stderr && (
                <span className="text-[#6E6E8A]">(لا توجد مخرجات مطبوعة)</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          loading={isRunning}
          variant="primary"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          <span>{exercise.type === 'write_python' ? 'تشغيل واختبار الكود' : 'تحقق من الإجابة'}</span>
        </Button>

        <Button onClick={handleReset} variant="secondary">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>إعادة المحاولة</span>
        </Button>
      </div>

      {/* Feedback Banner */}
      {result && (
        <div
          role="status"
          className={`rounded-xl border p-4 ${
            result.isCorrect
              ? 'border-[#22C55E]/35 bg-[#22C55E]/10 text-[#DCFCE7]'
              : 'border-red-500/35 bg-red-500/10 text-red-100'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.isCorrect ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#22C55E] shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 text-red-400 shrink-0" />
            )}
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold whitespace-pre-line">{result.feedbackAr}</p>
              <p className="text-xs opacity-90 leading-relaxed">{result.explanationAr}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
