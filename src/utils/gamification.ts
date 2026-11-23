import type {
  Achievement,
  DailyActivity,
  DailyChallenge,
  Profile,
  ProgressRecord,
  ProjectSubmission,
  Submission,
  UserAchievement,
} from '../types/database';

export const XP_PER_LEVEL_BASE = 150;

export function calculateLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  // Progressive leveling: L1 = 0..149, L2 = 150..349, L3 = 350..599, etc.
  let level = 1;
  let threshold = 0;
  while (true) {
    const nextStep = XP_PER_LEVEL_BASE + (level - 1) * 50;
    if (xp < threshold + nextStep) {
      return level;
    }
    threshold += nextStep;
    level += 1;
  }
}

export function getLevelProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelRequiredXp: number;
  percent: number;
} {
  const safeXp = Math.max(0, xp);
  let level = 1;
  let threshold = 0;
  while (true) {
    const step = XP_PER_LEVEL_BASE + (level - 1) * 50;
    if (safeXp < threshold + step) {
      const currentLevelXp = safeXp - threshold;
      return {
        level,
        currentLevelXp,
        nextLevelRequiredXp: step,
        percent: Math.min(100, Math.round((currentLevelXp / step) * 100)),
      };
    }
    threshold += step;
    level += 1;
  }
}

export function getTodayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateUpdatedStreak(
  lastActiveDate: string,
  currentStreak: number,
  todayDate: string = getTodayIsoDate()
): { streakDays: number; lastActiveDate: string } {
  if (!lastActiveDate) {
    return { streakDays: 1, lastActiveDate: todayDate };
  }
  if (lastActiveDate === todayDate) {
    return { streakDays: Math.max(1, currentStreak), lastActiveDate };
  }
  const last = new Date(`${lastActiveDate}T00:00:00Z`).getTime();
  const today = new Date(`${todayDate}T00:00:00Z`).getTime();
  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return { streakDays: currentStreak + 1, lastActiveDate: todayDate };
  }
  return { streakDays: 1, lastActiveDate: todayDate };
}

/**
 * Anti-duplication rule:
 * - A lesson grants XP only once per user (unless never completed before).
 * - An exercise grants XP only on the first correct submission per user.
 * - A project grants XP only on the first passing submission per user.
 */
export function canGrantLessonXp(
  existingProgress: ProgressRecord | undefined
): boolean {
  if (!existingProgress) return true;
  return !existingProgress.completed && existingProgress.xpAwarded === 0;
}

export function canGrantExerciseXp(
  existingSubmissions: Submission[],
  exerciseId: string
): boolean {
  return !existingSubmissions.some(
    (s) => s.exerciseId === exerciseId && s.isCorrect && s.xpAwarded > 0
  );
}

export function canGrantProjectXp(
  existingSubmissions: ProjectSubmission[],
  projectId: string
): boolean {
  return !existingSubmissions.some(
    (s) => s.projectId === projectId && s.passed && s.xpAwarded > 0
  );
}

export interface AchievementMetrics {
  xp: number;
  streakDays: number;
  lessonsCompleted: number;
  exercisesSolved: number;
  projectsCompleted: number;
  playgroundRuns: number;
  aiMessages: number;
}

export function evaluateAchievements(
  userId: string,
  allAchievements: Achievement[],
  alreadyUnlocked: UserAchievement[],
  metrics: AchievementMetrics,
  nowIso: string = new Date().toISOString()
): UserAchievement[] {
  const unlockedSet = new Set(alreadyUnlocked.map((u) => u.achievementId));
  const newlyUnlocked: UserAchievement[] = [];

  for (const achievement of allAchievements) {
    if (unlockedSet.has(achievement.id)) continue;

    let currentValue = 0;
    switch (achievement.conditionType) {
      case 'lessons_completed':
        currentValue = metrics.lessonsCompleted;
        break;
      case 'xp_reached':
        currentValue = metrics.xp;
        break;
      case 'streak_days':
        currentValue = metrics.streakDays;
        break;
      case 'exercises_solved':
        currentValue = metrics.exercisesSolved;
        break;
      case 'projects_completed':
        currentValue = metrics.projectsCompleted;
        break;
      case 'playground_runs':
        currentValue = metrics.playgroundRuns;
        break;
      case 'ai_messages':
        currentValue = metrics.aiMessages;
        break;
    }

    if (currentValue >= achievement.conditionTarget) {
      newlyUnlocked.push({
        id: `${userId}:${achievement.id}`,
        userId,
        achievementId: achievement.id,
        unlockedAt: nowIso,
        xpAwarded: achievement.xpBonus,
      });
    }
  }

  return newlyUnlocked;
}

export function computeDailyChallengesProgress(
  todayActivity: DailyActivity | undefined,
  challenges: DailyChallenge[]
): Array<DailyChallenge & { currentValue: number; completed: boolean; percent: number }> {
  return challenges.map((ch) => {
    let current = 0;
    if (todayActivity) {
      if (ch.targetType === 'lessons') current = todayActivity.lessonsCompleted;
      if (ch.targetType === 'exercises') current = todayActivity.exercisesSolved;
      if (ch.targetType === 'xp') current = todayActivity.xpEarned;
      if (ch.targetType === 'playground') current = todayActivity.playgroundRuns;
    }
    const percent = Math.min(100, Math.round((current / ch.targetValue) * 100));
    return {
      ...ch,
      currentValue: current,
      completed: current >= ch.targetValue,
      percent,
    };
  });
}

export function getDefaultDailyChallenges(): DailyChallenge[] {
  return [
    {
      id: 'dc-lesson-1',
      titleAr: 'إتمام درس واحد اليوم',
      descriptionAr: 'أكمل درسًا واحدًا من أي مسار تعليمي.',
      targetType: 'lessons',
      targetValue: 1,
      xpReward: 25,
    },
    {
      id: 'dc-exercise-2',
      titleAr: 'حل تمرينين تفاعليين',
      descriptionAr: 'أجب إجابة صحيحة على تمرينين اليوم.',
      targetType: 'exercises',
      targetValue: 2,
      xpReward: 30,
    },
    {
      id: 'dc-playground-3',
      titleAr: 'تشغيل 3 تجارب في المحرر',
      descriptionAr: 'اختبر أفكارك البرمجية في Python Playground.',
      targetType: 'playground',
      targetValue: 3,
      xpReward: 20,
    },
  ];
}

export function buildUpdatedProfileWithXp(
  profile: Profile,
  addedXp: number,
  todayDate: string = getTodayIsoDate()
): Profile {
  const nextXp = Math.max(0, profile.xp + addedXp);
  const nextLevel = calculateLevelFromXp(nextXp);
  const streakUpdate = calculateUpdatedStreak(
    profile.lastActiveDate,
    profile.streakDays,
    todayDate
  );
  return {
    ...profile,
    xp: nextXp,
    level: nextLevel,
    streakDays: streakUpdate.streakDays,
    lastActiveDate: streakUpdate.lastActiveDate,
  };
}
