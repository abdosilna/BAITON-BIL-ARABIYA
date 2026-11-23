import { BarChart3, CheckCircle2, Flame, Target } from 'lucide-react';
import { Button, Card, EmptyState, ProgressBar } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';

interface ProgressStatsPageProps {
  onNavigate: (to: string) => void;
}

export function ProgressStatsPage({ onNavigate }: ProgressStatsPageProps) {
  const profile = useAppStore((s) => s.profile);
  const courses = useAppStore((s) => s.courses);
  const lessons = useAppStore((s) => s.lessons);
  const progress = useAppStore((s) => s.progress);
  const submissions = useAppStore((s) => s.submissions);
  const dailyActivities = useAppStore((s) => s.dailyActivities);
  const projectSubmissions = useAppStore((s) => s.projectSubmissions);

  if (!profile) {
    return (
      <EmptyState
        title="لا توجد إحصائيات بعد"
        description="ادخل عبر الحساب التجريبي لبدء تسجيل تقدمك وإحصائيات التعلم."
        action={<Button onClick={() => onNavigate('/login')}>دخول التجربة</Button>}
      />
    );
  }

  const completedLessonIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const totalAttempts = submissions.length;
  const correctAttempts = submissions.filter((s) => s.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const totalMinutes = dailyActivities.reduce((acc, d) => acc + d.minutesLearned, 0);
  const passedProjectsCount = new Set(
    projectSubmissions.filter((p) => p.passed).map((p) => p.projectId)
  ).size;

  const recentDays = [...dailyActivities].slice(-7);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>الدروس المكتملة</span>
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {completedLessonIds.size} / {lessons.length}
          </div>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>دقة حل التمارين</span>
            <Target className="h-4 w-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {accuracy}%
          </div>
          <div className="text-xs text-[#A1A1B5] tabular-nums">
            {correctAttempts} صحيحة من {totalAttempts} محاولة
          </div>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>المشاريع المجتازة</span>
            <BarChart3 className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {passedProjectsCount} / 6
          </div>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>وقت التعلم المسجل</span>
            <Flame className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalMinutes} دقيقة
          </div>
        </Card>
      </div>

      {/* Daily Activity Log */}
      <Card className="space-y-4">
        <h3 className="text-base font-semibold text-white">سجل النشاط اليومي</h3>
        {recentDays.length === 0 ? (
          <p className="text-sm text-[#A1A1B5]">
            لا يوجد نشاط مسجل بعد. أكمل درسًا أو شغّل تجربة في Playground ليظهر نشاط اليوم هنا.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs text-[#A1A1B5]">
                  <th className="py-2.5 font-medium">التاريخ</th>
                  <th className="py-2.5 font-medium">XP المكتسبة</th>
                  <th className="py-2.5 font-medium">الدروس</th>
                  <th className="py-2.5 font-medium">التمارين</th>
                  <th className="py-2.5 font-medium">تجارب المحرر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-mono tabular-nums">
                {recentDays.map((day) => (
                  <tr key={day.id} className="text-xs text-[#E4E4F0]">
                    <td className="py-3">{day.date}</td>
                    <td className="py-3 text-[#F59E0B]">+{day.xpEarned}</td>
                    <td className="py-3">{day.lessonsCompleted}</td>
                    <td className="py-3">{day.exercisesSolved}</td>
                    <td className="py-3">{day.playgroundRuns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Progress Map Across All 13 Levels */}
      <Card className="space-y-4">
        <h3 className="text-base font-semibold text-white">خريطة التقدم عبر المستويات (0 - 12)</h3>
        <div className="space-y-3">
          {courses.map((course) => {
            const cLessons = lessons.filter((l) => l.courseId === course.id);
            const cCompleted = cLessons.filter((l) => completedLessonIds.has(l.id)).length;
            const pct = cLessons.length > 0 ? Math.round((cCompleted / cLessons.length) * 100) : 0;
            return (
              <div key={course.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#E4E4F0]">{course.titleAr}</span>
                  <span className="font-mono text-[#A1A1B5] tabular-nums">
                    {cCompleted}/{cLessons.length}
                  </span>
                </div>
                <ProgressBar value={pct} color={pct === 100 ? 'success' : 'primary'} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
