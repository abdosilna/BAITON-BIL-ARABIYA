import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Play,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import {
  AlertBanner,
  Button,
  Card,
  EmptyState,
  ProgressBar,
} from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';
import {
  computeDailyChallengesProgress,
  getDefaultDailyChallenges,
  getLevelProgress,
  getTodayIsoDate,
} from '../utils/gamification';

interface DashboardPageProps {
  onNavigate: (to: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const profile = useAppStore((s) => s.profile);
  const lessons = useAppStore((s) => s.lessons);
  const courses = useAppStore((s) => s.courses);
  const progress = useAppStore((s) => s.progress);
  const submissions = useAppStore((s) => s.submissions);
  const dailyActivities = useAppStore((s) => s.dailyActivities);
  const achievements = useAppStore((s) => s.achievements);
  const userAchievements = useAppStore((s) => s.userAchievements);

  if (!profile) {
    return (
      <EmptyState
        title="لم تبدأ جلسة تعلم نشطة بعد"
        description="ادخل عبر حساب التجربة المحلي لحفظ نقاط الخبرة XP والتقدم في الدروس والمشاريع."
        action={
          <Button onClick={() => onNavigate('/login')}>الدخول إلى وضع التجربة</Button>
        }
      />
    );
  }

  const levelInfo = getLevelProgress(profile.xp);
  const today = getTodayIsoDate();
  const todayActivity = dailyActivities.find((d) => d.date === today);
  const todayXp = todayActivity?.xpEarned ?? 0;
  const dailyGoalPercent = Math.min(100, Math.round((todayXp / profile.dailyGoalXp) * 100));

  const completedLessonIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const totalLessons = lessons.length;
  const overallProgressPercent =
    totalLessons > 0 ? Math.round((completedLessonIds.size / totalLessons) * 100) : 0;

  // Last visited lesson or first incomplete lesson
  const sortedProgress = [...progress].sort((a, b) =>
    b.lastVisitedAt.localeCompare(a.lastVisitedAt)
  );
  const lastVisitedLesson = sortedProgress[0]
    ? lessons.find((l) => l.id === sortedProgress[0].lessonId)
    : undefined;
  const recommendedNextLesson =
    lessons.find((l) => !completedLessonIds.has(l.id)) ?? lessons[0];

  const continueLesson = lastVisitedLesson ?? recommendedNextLesson;

  const dailyChallenges = computeDailyChallengesProgress(
    todayActivity,
    getDefaultDailyChallenges()
  );

  const recentUnlocked = [...userAchievements]
    .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt))
    .slice(0, 3)
    .map((ua) => ({
      ua,
      achievement: achievements.find((a) => a.id === ua.achievementId),
    }))
    .filter((item) => Boolean(item.achievement));

  const solvedExercisesCount = new Set(
    submissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
  ).size;

  return (
    <div className="space-y-6">
      {/* Welcome & Continue Learning */}
      <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="text-xs text-[#A1A1B5]">
            <span>وضع التجربة المحلي</span>
            <span aria-hidden="true"> · </span>
            <span>المستوى {levelInfo.level}</span>
            <span aria-hidden="true"> · </span>
            <span className="tabular-nums">{courses.length} مسارات متاحة</span>
          </div>
          <h2 className="text-2xl font-bold text-white">مرحبًا بك، {profile.displayName}</h2>
          <p className="text-sm text-[#A1A1B5] max-w-2xl">
            {lastVisitedLesson
              ? `آخر درس تفاعلت معه: ${lastVisitedLesson.titleAr}`
              : 'ابدأ رحلتك الآن من الدرس التمهيدي أو واصل بناء مشاريع Python.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {continueLesson && (
            <Button size="lg" onClick={() => onNavigate(`/lesson/${continueLesson.id}`)}>
              <Play className="h-4 w-4" aria-hidden="true" />
              <span>متابعة التعلم</span>
            </Button>
          )}
          <Button variant="secondary" onClick={() => onNavigate('/playground')}>
            <span>فتح المحرر</span>
          </Button>
        </div>
      </Card>

      {/* Real KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>نقاط الخبرة (XP)</span>
            <Trophy className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
          </div>
          <div dir="ltr" className="text-right text-2xl font-bold text-white font-mono tabular-nums">
            {profile.xp} XP
          </div>
          <ProgressBar
            value={levelInfo.percent}
            label={`المستوى ${levelInfo.level} (${levelInfo.currentLevelXp}/${levelInfo.nextLevelRequiredXp})`}
          />
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>سلسلة الالتزام (Streak)</span>
            <Flame className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {profile.streakDays} يوم
          </div>
          <p className="text-xs text-[#A1A1B5]">
            أكمل درسًا أو تمرينًا يوميًا للحفاظ على سلسلتك.
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>الهدف اليومي</span>
            <Target className="h-4 w-4 text-[#22C55E]" aria-hidden="true" />
          </div>
          <div dir="ltr" className="text-right text-2xl font-bold text-white font-mono tabular-nums">
            {todayXp} / {profile.dailyGoalXp} XP
          </div>
          <ProgressBar value={dailyGoalPercent} color="success" />
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>نسبة التقدم الكلي</span>
            <BookOpen className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {overallProgressPercent}%
          </div>
          <p className="text-xs text-[#A1A1B5] tabular-nums">
            {completedLessonIds.size} من {totalLessons} درس · {solvedExercisesCount} تمرين محلول
          </p>
        </Card>
      </div>

      {/* Main Split: Daily Tasks & Next Lesson */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">المهام والتحديات اليومية</h3>
            <span className="text-xs text-[#A1A1B5] font-mono tabular-nums">{today}</span>
          </div>

          <div className="space-y-4">
            {dailyChallenges.map((ch) => (
              <div
                key={ch.id}
                className="rounded-xl border border-white/[0.06] bg-[#101018] p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        ch.completed ? 'text-[#22C55E]' : 'text-[#6E6E8A]'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-white">{ch.titleAr}</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[#F59E0B]">
                    +{ch.xpReward} XP
                  </span>
                </div>
                <p className="text-xs text-[#A1A1B5]">{ch.descriptionAr}</p>
                <ProgressBar
                  value={ch.percent}
                  color={ch.completed ? 'success' : 'primary'}
                  label={`${ch.currentValue} / ${ch.targetValue}`}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-5 space-y-6">
          {/* Recommended Next Lesson */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">اقتراح الدرس القادم</h3>
              <Sparkles className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />
            </div>
            {recommendedNextLesson ? (
              <div className="space-y-3">
                <div className="text-xs text-[#A1A1B5] tabular-nums">
                  <span>{recommendedNextLesson.estimatedMinutes} دقيقة</span>
                  <span aria-hidden="true"> · </span>
                  <span className="text-[#F59E0B]">+{recommendedNextLesson.xpReward} XP</span>
                </div>
                <h4 className="text-lg font-semibold text-white">
                  {recommendedNextLesson.titleAr}
                </h4>
                <p className="text-sm text-[#A1A1B5] leading-relaxed">
                  {recommendedNextLesson.summaryAr}
                </p>
                <Button
                  className="w-full"
                  onClick={() => onNavigate(`/lesson/${recommendedNextLesson.id}`)}
                >
                  <span>بدء الدرس الآن</span>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <AlertBanner
                tone="success"
                title="أتممت جميع الدروس المتاحة!"
                description="انتقل إلى المشاريع العملية لتطبيق مهاراتك."
              />
            )}
          </Card>

          {/* Recent Achievements */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">الإنجازات الأخيرة</h3>
              <button
                type="button"
                onClick={() => onNavigate('/achievements')}
                className="text-xs text-[#8B5CF6] hover:underline"
              >
                عرض الكل
              </button>
            </div>

            {recentUnlocked.length === 0 ? (
              <p className="text-sm text-[#A1A1B5]">
                لم تُفتح أوسمة بعد — أكمل أول درس أو تمرين لفتح أول إنجاز حقيقي.
              </p>
            ) : (
              <div className="space-y-3">
                {recentUnlocked.map(({ ua, achievement }) => (
                  <div
                    key={ua.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#101018] p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className="h-4 w-4 text-[#F59E0B] shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {achievement?.titleAr}
                        </div>
                        <div className="text-xs text-[#A1A1B5]">
                          {achievement?.descriptionAr}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#22C55E] tabular-nums">
                      +{ua.xpAwarded} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
