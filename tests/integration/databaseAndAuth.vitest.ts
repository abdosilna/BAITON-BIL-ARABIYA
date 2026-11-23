import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { LocalAuthAdapter } from '../../src/services/auth/LocalAuthAdapter';
import { LocalDatabaseAdapter } from '../../src/services/database/LocalDatabaseAdapter';
import { LocalStorageAdapter } from '../../src/services/storage/LocalStorageAdapter';

describe('LocalDatabaseAdapter & LocalAuthAdapter Integration', () => {
  it('seeds all 13 courses, lessons, exercises, projects, and achievements', async () => {
    const db = new LocalDatabaseAdapter();
    await db.init();

    const courses = await db.getCourses();
    const lessons = await db.getLessons();
    const exercises = await db.getExercises();
    const projects = await db.getProjects();
    const achievements = await db.getAchievements();

    expect(courses.length).toBe(13);
    expect(lessons.length).toBeGreaterThanOrEqual(13);
    expect(exercises.length).toBeGreaterThanOrEqual(13);
    expect(projects.length).toBe(6);
    expect(achievements.length).toBeGreaterThanOrEqual(8);
  });

  it('persists demo user profile, progress, and handles missing records gracefully', async () => {
    const db = new LocalDatabaseAdapter();
    await db.init();
    const storage = new LocalStorageAdapter();
    const auth = new LocalAuthAdapter(db, storage);

    const missing = await db.getProfile('non-existent-id');
    expect(missing).toBeNull();

    const { session, profile } = await auth.enterDemoAccount('learner', 'ليلى التجريبية');
    expect(session.isDemoMode).toBe(true);
    expect(profile.displayName).toBe('ليلى التجريبية');

    await db.saveProgress({
      id: `${profile.id}:lesson-0-1`,
      userId: profile.id,
      lessonId: 'lesson-0-1',
      courseId: 'course-0',
      moduleId: 'module-0',
      completed: true,
      xpAwarded: 30,
      lastVisitedAt: new Date().toISOString(),
    });

    const savedProgress = await db.getProgress(profile.id);
    expect(savedProgress).toHaveLength(1);
    expect(savedProgress[0].lessonId).toBe('lesson-0-1');

    await auth.signOut();
    const afterSignOut = await auth.getCurrentSession();
    expect(afterSignOut).toBeNull();
  });
});
