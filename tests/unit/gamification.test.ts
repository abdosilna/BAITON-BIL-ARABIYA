import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildUpdatedProfileWithXp,
  calculateLevelFromXp,
  calculateUpdatedStreak,
  canGrantExerciseXp,
  canGrantLessonXp,
  canGrantProjectXp,
  evaluateAchievements,
} from '../../src/utils/gamification';
import { SEED_ACHIEVEMENTS } from '../../src/data/achievements';
import type { Profile, ProgressRecord, ProjectSubmission, Submission } from '../../src/types/database';

test('calculateLevelFromXp scales progressively', () => {
  assert.equal(calculateLevelFromXp(0), 1);
  assert.equal(calculateLevelFromXp(149), 1);
  assert.equal(calculateLevelFromXp(150), 2);
  assert.equal(calculateLevelFromXp(350), 3);
});

test('calculateUpdatedStreak increments on consecutive day and resets on gap', () => {
  const sameDay = calculateUpdatedStreak('2026-11-23', 4, '2026-11-23');
  assert.equal(sameDay.streakDays, 4);

  const nextDay = calculateUpdatedStreak('2026-11-23', 4, '2026-11-24');
  assert.equal(nextDay.streakDays, 5);

  const broken = calculateUpdatedStreak('2026-11-20', 4, '2026-11-23');
  assert.equal(broken.streakDays, 1);
});

test('anti-duplication prevents double XP for lessons, exercises, and projects', () => {
  const uncompleted: ProgressRecord | undefined = undefined;
  assert.equal(canGrantLessonXp(uncompleted), true);

  const completed: ProgressRecord = {
    id: 'u1:l1',
    userId: 'u1',
    lessonId: 'l1',
    courseId: 'c1',
    moduleId: 'm1',
    completed: true,
    xpAwarded: 30,
    lastVisitedAt: '2026-11-23T00:00:00Z',
  };
  assert.equal(canGrantLessonXp(completed), false);

  const submissions: Submission[] = [
    {
      id: 's1',
      userId: 'u1',
      exerciseId: 'ex-1',
      answer: '0',
      isCorrect: true,
      xpAwarded: 20,
      attempts: 1,
      submittedAt: '2026-11-23T00:00:00Z',
    },
  ];
  assert.equal(canGrantExerciseXp(submissions, 'ex-1'), false);
  assert.equal(canGrantExerciseXp(submissions, 'ex-2'), true);

  const projSubs: ProjectSubmission[] = [
    {
      id: 'p1',
      userId: 'u1',
      projectId: 'proj-1',
      code: '',
      passedTests: 3,
      totalTests: 3,
      passed: true,
      xpAwarded: 100,
      results: [],
      submittedAt: '2026-11-23T00:00:00Z',
    },
  ];
  assert.equal(canGrantProjectXp(projSubs, 'proj-1'), false);
  assert.equal(canGrantProjectXp(projSubs, 'proj-2'), true);
});

test('evaluateAchievements unlocks qualifying achievements once', () => {
  const unlocked = evaluateAchievements(
    'u1',
    SEED_ACHIEVEMENTS,
    [],
    {
      xp: 520,
      streakDays: 3,
      lessonsCompleted: 1,
      exercisesSolved: 1,
      projectsCompleted: 1,
      playgroundRuns: 3,
      aiMessages: 3,
    },
    '2026-11-23T12:00:00Z'
  );

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  assert.equal(unlockedIds.has('ach-first-lesson'), true);
  assert.equal(unlockedIds.has('ach-xp-500'), true);
  assert.equal(unlockedIds.has('ach-streak-3'), true);
  assert.equal(unlockedIds.has('ach-five-lessons'), false);

  // Re-evaluating with already unlocked should not return duplicates
  const secondPass = evaluateAchievements(
    'u1',
    SEED_ACHIEVEMENTS,
    unlocked,
    {
      xp: 520,
      streakDays: 3,
      lessonsCompleted: 1,
      exercisesSolved: 1,
      projectsCompleted: 1,
      playgroundRuns: 3,
      aiMessages: 3,
    }
  );
  assert.equal(secondPass.length, 0);
});

test('buildUpdatedProfileWithXp updates level and XP cleanly', () => {
  const profile: Profile = {
    id: 'u1',
    username: 'demo',
    displayName: 'Test',
    bio: '',
    role: 'learner',
    xp: 140,
    level: 1,
    streakDays: 1,
    lastActiveDate: '2026-11-22',
    dailyGoalXp: 80,
    isDemoAccount: true,
    createdAt: '2026-11-22T00:00:00Z',
  };
  const updated = buildUpdatedProfileWithXp(profile, 30, '2026-11-23');
  assert.equal(updated.xp, 170);
  assert.equal(updated.level, 2);
  assert.equal(updated.streakDays, 2);
});
