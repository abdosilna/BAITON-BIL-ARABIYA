import { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Play, Target } from 'lucide-react';
import { AlertBanner, Button, Card, EmptyState, ProgressBar } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';

interface CourseDetailsPageProps {
  courseId: string;
  onNavigate: (to: string) => void;
}

export function CourseDetailsPage({ courseId, onNavigate }: CourseDetailsPageProps) {
  const courses = useAppStore((s) => s.courses);
  const modules = useAppStore((s) => s.modules);
  const lessons = useAppStore((s) => s.lessons);
  const exercises = useAppStore((s) => s.exercises);
  const moduleQuestions = useAppStore((s) => s.moduleQuestions);
  const progress = useAppStore((s) => s.progress);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return (
      <EmptyState
        title="المسار غير موجود"
        description="لم يتم العثور على المسار المطلوب في المنهج."
        action={<Button onClick={() => onNavigate('/paths')}>العودة إلى المسارات</Button>}
      />
    );
  }

  const courseModules = modules.filter((m) => m.courseId === course.id);
  const courseLessons = lessons.filter((l) => l.courseId === course.id);
  const courseExercises = exercises.filter((e) => e.courseId === course.id);
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const completedCount = courseLessons.filter((l) => completedIds.has(l.id)).length;
  const pct =
    courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0;

  const finalQuestions = courseModules.flatMap((m) =>
    moduleQuestions.filter((q) => q.moduleId === m.id)
  );

  const correctQuizCount = finalQuestions.filter(
    (q) => quizAnswers[q.id] === q.correctIndex
  ).length;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => onNavigate('/paths')}
        className="inline-flex items-center gap-1.5 text-xs text-[#A1A1B5] hover:text-white"
      >
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span>العودة إلى جميع المسارات</span>
      </button>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#A1A1B5]">
              <span className="font-mono text-[#8B5CF6]">LEVEL {course.levelNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{course.titleEn}</span>
              <span aria-hidden="true">·</span>
              <span>{course.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{course.estimatedHours} ساعات</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{course.titleAr}</h2>
          </div>

          {courseLessons[0] && (
            <Button onClick={() => onNavigate(`/lesson/${courseLessons[0].id}`)}>
              <Play className="h-4 w-4" aria-hidden="true" />
              <span>ابدأ أول درس</span>
            </Button>
          )}
        </div>

        <p className="text-sm text-[#A1A1B5] leading-relaxed">{course.descriptionAr}</p>

        <ProgressBar value={pct} color={pct === 100 ? 'success' : 'primary'} label="نسبة إكمال المسار" />

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#F59E0B]" />
            <span>الأهداف التعليمية</span>
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm text-[#D4D4E0]">
            {course.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E] shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        {courseModules.map((mod) => {
          const modLessons = courseLessons.filter((l) => l.moduleId === mod.id);
          return (
            <Card key={mod.id} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{mod.titleAr}</h3>
                <p className="mt-1 text-sm text-[#A1A1B5]">{mod.descriptionAr}</p>
              </div>

              {modLessons.length === 0 ? (
                <p className="text-sm text-[#A1A1B5]">لا توجد دروس في هذه الوحدة بعد.</p>
              ) : (
                <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-[#101018]">
                  {modLessons.map((lesson, idx) => {
                    const isDone = completedIds.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#272338] text-xs font-mono text-white">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white">
                                {lesson.titleAr}
                              </h4>
                              {isDone && (
                                <CheckCircle2
                                  className="h-4 w-4 text-[#22C55E] shrink-0"
                                  aria-label="مكتمل"
                                />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[#A1A1B5]">{lesson.summaryAr}</p>
                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#A1A1B5] tabular-nums">
                              <span>{lesson.estimatedMinutes} دقيقة</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#F59E0B]">+{lesson.xpReward} XP</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isDone ? 'secondary' : 'primary'}
                          onClick={() => onNavigate(`/lesson/${lesson.id}`)}
                        >
                          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{isDone ? 'مراجعة الدرس' : 'فتح الدرس'}</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Course Exercises Link */}
      {courseExercises.length > 0 && (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">تمارين هذا المسار</h3>
            <p className="text-xs text-[#A1A1B5] tabular-nums">
              يحتوي هذا المسار على {courseExercises.length} تمرين تفاعلي لتثبيت المفاهيم.
            </p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('/exercises')}>
            الانتقال إلى التمارين
          </Button>
        </Card>
      )}

      {/* Final Module Quiz */}
      {finalQuestions.length > 0 && (
        <Card className="space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="text-lg font-semibold text-white">الاختبار النهائي للوحدة</h3>
            <p className="text-xs text-[#A1A1B5]">
              اختبر استيعابك لمفاهيم {course.titleAr} قبل الانتقال للمستوى التالي.
            </p>
          </div>

          <div className="space-y-5">
            {finalQuestions.map((q, qIdx) => (
              <div key={q.id} className="space-y-2.5">
                <p className="text-sm font-medium text-white">
                  {qIdx + 1}. {q.promptAr}
                </p>
                {q.codeSnippet && (
                  <pre className="code-ltr rounded-lg border border-white/10 bg-[#0D0D14] p-3 text-xs font-mono text-[#E4E4F0]">
                    {q.codeSnippet}
                  </pre>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => {
                    const selected = quizAnswers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                        }
                        className={`rounded-xl border px-3.5 py-2.5 text-right text-xs transition-colors ${
                          selected
                            ? 'border-[#8B5CF6] bg-[#272338] text-white'
                            : 'border-white/10 bg-[#101018] text-[#D4D4E0] hover:border-white/25'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p
                    className={`text-xs ${
                      quizAnswers[q.id] === q.correctIndex ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                    }`}
                  >
                    {quizAnswers[q.id] === q.correctIndex ? 'صحيح: ' : 'مراجعة: '}
                    {q.explanationAr}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={() => setQuizSubmitted(true)}>تصحيح الاختبار النهائي</Button>
            {quizSubmitted && (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
              >
                إعادة الاختبار
              </Button>
            )}
          </div>

          {quizSubmitted && (
            <AlertBanner
              tone={correctQuizCount === finalQuestions.length ? 'success' : 'info'}
              title={`نتيجتك: ${correctQuizCount} من ${finalQuestions.length}`}
              description={
                correctQuizCount === finalQuestions.length
                  ? 'ممتاز! أتقنت أهداف هذه الوحدة بالكامل.'
                  : 'راجع التفسيرات أعلاه وأعد المحاولة لتحقيق الدرجة الكاملة.'
              }
            />
          )}
        </Card>
      )}
    </div>
  );
}
