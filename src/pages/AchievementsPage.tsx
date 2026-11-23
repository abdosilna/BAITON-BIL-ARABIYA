import { Award, CheckCircle2, Lock } from 'lucide-react';
import { Card, ProgressBar } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';

export function AchievementsPage() {
  const profile = useAppStore((s) => s.profile);
  const achievements = useAppStore((s) => s.achievements);
  const userAchievements = useAppStore((s) => s.userAchievements);
  const progress = useAppStore((s) => s.progress);
  const submissions = useAppStore((s) => s.submissions);
  const projectSubmissions = useAppStore((s) => s.projectSubmissions);
  const dailyActivities = useAppStore((s) => s.dailyActivities);
  const aiConversations = useAppStore((s) => s.aiConversations);

  const unlockedMap = new Map(userAchievements.map((u) => [u.achievementId, u]));

  const metrics = {
    xp: profile?.xp ?? 0,
    streakDays: profile?.streakDays ?? 0,
    lessonsCompleted: progress.filter((p) => p.completed).length,
    exercisesSolved: new Set(submissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)).size,
    projectsCompleted: new Set(projectSubmissions.filter((p) => p.passed).map((p) => p.projectId)).size,
    playgroundRuns: dailyActivities.reduce((acc, d) => acc + d.playgroundRuns, 0),
    aiMessages: aiConversations.reduce(
      (acc, c) => acc + c.messages.filter((m) => m.role === 'user').length,
      0
    ),
  };

  const getMetricValue = (type: string) => {
    switch (type) {
      case 'lessons_completed':
        return metrics.lessonsCompleted;
      case 'xp_reached':
        return metrics.xp;
      case 'streak_days':
        return metrics.streakDays;
      case 'exercises_solved':
        return metrics.exercisesSolved;
      case 'projects_completed':
        return metrics.projectsCompleted;
      case 'playground_runs':
        return metrics.playgroundRuns;
      case 'ai_messages':
        return metrics.aiMessages;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">الإنجازات والأوسمة</h2>
          <p className="text-xs text-[#A1A1B5]">
            كل وسام مرتبط بشرط رقمي حقيقي يُحتسب تلقائيًا دون تكرار.
          </p>
        </div>
        <div className="text-sm font-mono tabular-nums text-[#F59E0B]">
          مفتوح: {unlockedMap.size} / {achievements.length}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((ach) => {
          const unlocked = unlockedMap.get(ach.id);
          const current = getMetricValue(ach.conditionType);
          const pct = Math.min(100, Math.round((current / ach.conditionTarget) * 100));

          return (
            <Card
              key={ach.id}
              className={`flex flex-col justify-between gap-4 ${
                unlocked ? 'border-[#22C55E]/35' : 'opacity-90'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
                  <span>{ach.category}</span>
                  <span className="font-mono text-[#F59E0B] tabular-nums">
                    +{ach.xpBonus} XP
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-xl p-2.5 shrink-0 ${
                      unlocked
                        ? 'bg-[#22C55E]/15 text-[#22C55E]'
                        : 'bg-[#272338] text-[#A1A1B5]'
                    }`}
                  >
                    {unlocked ? (
                      <Award className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{ach.titleAr}</h3>
                    <p className="mt-1 text-xs text-[#A1A1B5] leading-relaxed">
                      {ach.descriptionAr}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <ProgressBar
                  value={pct}
                  color={unlocked ? 'success' : 'gold'}
                  label={`${Math.min(current, ach.conditionTarget)} / ${ach.conditionTarget}`}
                />
                {unlocked && (
                  <div className="flex items-center gap-1.5 text-xs text-[#22C55E]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>مكتسب</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
