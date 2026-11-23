import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react';
import { CodeMirrorEditor } from '../components/CodeMirrorEditor';
import { SpeechPlayer } from '../components/SpeechPlayer';
import {
  AlertBanner,
  Button,
  Card,
  CodeBlock,
  EmptyState,
} from '../components/ui/Primitives';
import { InteractiveExerciseRunner } from '../features/exercises/InteractiveExerciseRunner';
import { pythonRuntime } from '../services';
import { useAppStore } from '../store/useAppStore';

interface LessonPlayerPageProps {
  lessonId: string;
  onNavigate: (to: string) => void;
}

export function LessonPlayerPage({ lessonId, onNavigate }: LessonPlayerPageProps) {
  const lessons = useAppStore((s) => s.lessons);
  const courses = useAppStore((s) => s.courses);
  const exercises = useAppStore((s) => s.exercises);
  const progress = useAppStore((s) => s.progress);
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const enterDemo = useAppStore((s) => s.enterDemo);

  const lesson = lessons.find((l) => l.id === lessonId);
  const [tryCode, setTryCode] = useState(lesson?.tryItCode ?? '');
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [quizChoice, setQuizChoice] = useState<Record<string, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (lesson) {
      setTryCode(lesson.tryItCode);
      setRunOutput(null);
      setQuizChoice({});
      setQuizChecked(false);
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <EmptyState
        title="الدرس غير موجود"
        description="لم يتم العثور على الدرس المطلوب. قد يكون تم حذفه أو تغيّر رابطه."
        action={<Button onClick={() => onNavigate('/paths')}>العودة للمسارات</Button>}
      />
    );
  }

  const course = courses.find((c) => c.id === lesson.courseId);
  const isCompleted = progress.some((p) => p.lessonId === lesson.id && p.completed);
  const practiceExercise = lesson.practiceExerciseId
    ? exercises.find((e) => e.id === lesson.practiceExerciseId)
    : undefined;

  const lessonIndex = lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = lessonIndex >= 0 && lessonIndex + 1 < lessons.length ? lessons[lessonIndex + 1] : null;

  const handleRunTryIt = async () => {
    setIsRunning(true);
    try {
      const res = await pythonRuntime.run(tryCode);
      setRunOutput({ stdout: res.stdout, stderr: res.stderr });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      if (!profile) {
        await enterDemo('learner');
      }
      const totalQ = lesson.quiz.length;
      const correctQ = lesson.quiz.filter((q) => quizChoice[q.id] === q.correctIndex).length;
      const score = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 100;
      await completeLesson(lesson.id, score);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate(course ? `/paths/${course.id}` : '/paths')}
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1B5] hover:text-white"
        >
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{course ? course.titleAr : 'المسارات التعليمية'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#A1A1B5] tabular-nums">
          <span>{lesson.estimatedMinutes} دقيقة</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#F59E0B]">+{lesson.xpReward} XP</span>
          {isCompleted && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#22C55E] font-medium">تم إتمام الدرس</span>
            </>
          )}
        </div>
      </div>

      {/* Header + Speech Player */}
      <Card className="space-y-4">
        <h2 className="text-2xl font-bold text-white">{lesson.titleAr}</h2>
        <p className="text-sm text-[#A1A1B5] leading-relaxed">{lesson.summaryAr}</p>
        <SpeechPlayer
          text={`${lesson.titleAr}. ${lesson.explanationAr}`}
          label="قراءة شرح الدرس صوتيًا"
        />
      </Card>

      {/* Explanation */}
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-white">الشرح التعليمي</h3>
        <p className="text-base leading-8 text-[#E4E4F0] whitespace-pre-line">
          {lesson.explanationAr}
        </p>
        <CodeBlock code={lesson.exampleCode} title="مثال Python التوضيحي" />
      </Card>

      {/* Line-by-line breakdown */}
      {lesson.lineByLine.length > 0 && (
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold text-white">شرح الكود سطرًا بسطر</h3>
          <div className="space-y-2.5">
            {lesson.lineByLine.map((item) => (
              <div
                key={item.lineNumber}
                className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-[#101018] p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-[#8B5CF6] tabular-nums shrink-0">
                    L{item.lineNumber}
                  </span>
                  <code className="code-ltr font-mono text-xs sm:text-sm text-white truncate">
                    {item.code}
                  </code>
                </div>
                <p className="text-xs sm:text-sm text-[#A1A1B5]">{item.explanationAr}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Interactive Try-It Code Runner */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">جرّب الكود بنفسك</h3>
            <p className="text-xs text-[#A1A1B5]">
              عدّل الكود وشغّله مباشرة داخل المتصفح عبر Pyodide Web Worker.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleRunTryIt} loading={isRunning}>
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>تشغيل</span>
            </Button>
            {isRunning && (
              <Button size="sm" variant="danger" onClick={() => pythonRuntime.stop()}>
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
                <span>إيقاف</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTryCode(lesson.tryItCode);
                setRunOutput(null);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>استعادة المثال</span>
            </Button>
          </div>
        </div>

        <CodeMirrorEditor
          value={tryCode}
          onChange={setTryCode}
          onRunShortcut={handleRunTryIt}
          fontSize={settings.editorFontSize}
          minHeight="170px"
          ariaLabel="محرر تجربة الدرس"
        />

        {runOutput && (
          <div className="code-ltr rounded-xl border border-white/10 bg-[#0A0A10] p-3.5 text-xs font-mono">
            <div className="mb-1 text-[#A1A1B5]">المخرجات (Output):</div>
            {runOutput.stdout && (
              <pre className="whitespace-pre-wrap text-[#22C55E]">{runOutput.stdout}</pre>
            )}
            {runOutput.stderr && (
              <pre className="whitespace-pre-wrap text-red-400">{runOutput.stderr}</pre>
            )}
            {!runOutput.stdout && !runOutput.stderr && (
              <span className="text-[#6E6E8A]">انتهى التنفيذ دون مخرجات نصية.</span>
            )}
          </div>
        )}
      </Card>

      {/* Common Mistakes */}
      {lesson.commonMistakes.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#F59E0B]" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-white">أخطاء شائعة وكيفية تجنبها</h3>
          </div>
          <div className="space-y-4">
            {lesson.commonMistakes.map((m, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.08] bg-[#101018] p-4 space-y-3"
              >
                <div className="text-sm font-semibold text-[#FDE68A]">{m.mistakeTitleAr}</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs text-red-300">خطأ شائع:</div>
                    <pre className="code-ltr rounded-lg border border-red-500/20 bg-[#0D0D14] p-3 text-xs font-mono text-red-200 overflow-x-auto">
                      {m.wrongCode}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#22C55E]">الصيغة الصحيحة:</div>
                    <pre className="code-ltr rounded-lg border border-[#22C55E]/20 bg-[#0D0D14] p-3 text-xs font-mono text-[#BBF7D0] overflow-x-auto">
                      {m.correctCode}
                    </pre>
                  </div>
                </div>
                <p className="text-xs text-[#A1A1B5]">{m.explanationAr}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Linked Practice Exercise */}
      {practiceExercise && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">تمرين تطبيقي على الدرس</h3>
          <InteractiveExerciseRunner exercise={practiceExercise} />
        </div>
      )}

      {/* Short Lesson Quiz */}
      {lesson.quiz.length > 0 && (
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold text-white">اختبار قصير للفهم</h3>
          {lesson.quiz.map((q) => (
            <div key={q.id} className="space-y-2.5">
              <p className="text-sm font-medium text-white">{q.promptAr}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuizChoice((prev) => ({ ...prev, [q.id]: idx }))}
                    className={`rounded-xl border px-3 py-2.5 text-right text-xs transition-colors ${
                      quizChoice[q.id] === idx
                        ? 'border-[#8B5CF6] bg-[#272338] text-white'
                        : 'border-white/10 bg-[#101018] text-[#D4D4E0]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {quizChecked && (
                <p
                  className={`text-xs ${
                    quizChoice[q.id] === q.correctIndex ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                  }`}
                >
                  {q.explanationAr}
                </p>
              )}
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={() => setQuizChecked(true)}>
            تحقق من الاختبار القصير
          </Button>
        </Card>
      )}

      {/* Summary & Complete Lesson CTA */}
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-white">ملخص الدرس</h3>
        <p className="text-sm text-[#A1A1B5] leading-relaxed">{lesson.summaryAr}</p>

        {isCompleted && (
          <AlertBanner
            tone="success"
            title="تم إتمام هذا الدرس مسبقًا"
            description="تستطيع مراجعته في أي وقت؛ نقاط XP تُمنح مرة واحدة عند الإتمام الأول."
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            size="lg"
            variant={isCompleted ? 'secondary' : 'success'}
            onClick={handleCompleteLesson}
            loading={completing}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{isCompleted ? 'تحديث سجل المراجعة' : `إتمام الدرس (+${lesson.xpReward} XP)`}</span>
          </Button>

          {nextLesson && (
            <Button variant="primary" onClick={() => onNavigate(`/lesson/${nextLesson.id}`)}>
              <span>الدرس التالي: {nextLesson.titleAr}</span>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
