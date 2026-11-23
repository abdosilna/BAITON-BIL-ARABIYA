import { SEED_ACHIEVEMENTS } from '../../data/achievements';
import {
  SEED_COURSES,
  SEED_LESSONS,
  SEED_MODULES,
  SEED_MODULE_QUESTIONS,
} from '../../data/curriculum';
import { SEED_EXERCISES } from '../../data/exercises';
import { SEED_PROJECTS } from '../../data/projects';
import type {
  Achievement,
  AIConversation,
  Course,
  DailyActivity,
  Exercise,
  Lesson,
  Module,
  PlaygroundSnippet,
  Profile,
  ProgressRecord,
  Project,
  ProjectSubmission,
  Question,
  Submission,
  UserAchievement,
} from '../../types/database';
import type { DatabaseAdapter } from './DatabaseAdapter';

const DB_NAME = 'baiton_bil_arabiya_db';
const DB_VERSION = 1;

const STORES = {
  profiles: 'profiles',
  courses: 'courses',
  modules: 'modules',
  lessons: 'lessons',
  questions: 'questions',
  exercises: 'exercises',
  submissions: 'submissions',
  progress: 'progress',
  achievements: 'achievements',
  user_achievements: 'user_achievements',
  daily_activity: 'daily_activity',
  ai_conversations: 'ai_conversations',
  projects: 'projects',
  project_submissions: 'project_submissions',
  playground_snippets: 'playground_snippets',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

export class LocalDatabaseAdapter implements DatabaseAdapter {
  readonly isConnectedToRemote = false;
  readonly providerName = 'IndexedDB (Local Demo Mode)';

  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback = new Map<StoreName, Map<string, unknown>>();
  private usingMemoryFallback = false;
  private initialized = false;

  private ensureMemoryStore(store: StoreName): Map<string, unknown> {
    let map = this.memoryFallback.get(store);
    if (!map) {
      map = new Map<string, unknown>();
      this.memoryFallback.set(store, map);
    }
    return map;
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable in current environment'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        for (const storeName of Object.values(STORES)) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
    });

    return this.dbPromise;
  }

  private async getAll<T>(storeName: StoreName): Promise<T[]> {
    if (this.usingMemoryFallback) {
      return Array.from(this.ensureMemoryStore(storeName).values()) as T[];
    }
    try {
      const db = await this.openDatabase();
      return await new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as T[]) ?? []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.usingMemoryFallback = true;
      return Array.from(this.ensureMemoryStore(storeName).values()) as T[];
    }
  }

  private async getById<T>(storeName: StoreName, id: string): Promise<T | null> {
    if (this.usingMemoryFallback) {
      return (this.ensureMemoryStore(storeName).get(id) as T) ?? null;
    }
    try {
      const db = await this.openDatabase();
      return await new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.usingMemoryFallback = true;
      return (this.ensureMemoryStore(storeName).get(id) as T) ?? null;
    }
  }

  private async putItem<T extends { id: string }>(storeName: StoreName, item: T): Promise<T> {
    if (this.usingMemoryFallback) {
      this.ensureMemoryStore(storeName).set(item.id, item);
      return item;
    }
    try {
      const db = await this.openDatabase();
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.usingMemoryFallback = true;
      this.ensureMemoryStore(storeName).set(item.id, item);
      return item;
    }
  }

  private async putMany<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<void> {
    if (items.length === 0) return;
    if (this.usingMemoryFallback) {
      const map = this.ensureMemoryStore(storeName);
      items.forEach((item) => map.set(item.id, item));
      return;
    }
    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        items.forEach((item) => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.usingMemoryFallback = true;
      const map = this.ensureMemoryStore(storeName);
      items.forEach((item) => map.set(item.id, item));
    }
  }

  private async deleteById(storeName: StoreName, id: string): Promise<void> {
    if (this.usingMemoryFallback) {
      this.ensureMemoryStore(storeName).delete(id);
      return;
    }
    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.usingMemoryFallback = true;
      this.ensureMemoryStore(storeName).delete(id);
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.openDatabase();
    } catch {
      this.usingMemoryFallback = true;
    }

    const existingCourses = await this.getAll<Course>(STORES.courses);
    if (existingCourses.length === 0) {
      await this.seedDatabase();
    }

    this.initialized = true;
  }

  private async seedDatabase(): Promise<void> {
    await Promise.all([
      this.putMany(STORES.courses, SEED_COURSES),
      this.putMany(STORES.modules, SEED_MODULES),
      this.putMany(STORES.lessons, SEED_LESSONS),
      this.putMany(STORES.questions, SEED_MODULE_QUESTIONS),
      this.putMany(STORES.exercises, SEED_EXERCISES),
      this.putMany(STORES.achievements, SEED_ACHIEVEMENTS),
      this.putMany(STORES.projects, SEED_PROJECTS),
    ]);
  }

  async resetAllData(): Promise<void> {
    if (this.usingMemoryFallback) {
      this.memoryFallback.clear();
    } else {
      try {
        const db = await this.openDatabase();
        await Promise.all(
          Object.values(STORES).map(
            (storeName) =>
              new Promise<void>((resolve, reject) => {
                const tx = db.transaction(storeName, 'readwrite');
                const req = tx.objectStore(storeName).clear();
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
              })
          )
        );
      } catch {
        this.memoryFallback.clear();
      }
    }
    this.initialized = false;
    await this.seedDatabase();
    this.initialized = true;
  }

  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const [
      profile,
      progress,
      submissions,
      userAchievements,
      dailyActivity,
      projectSubmissions,
      snippets,
    ] = await Promise.all([
      this.getProfile(userId),
      this.getProgress(userId),
      this.getSubmissions(userId),
      this.getUserAchievements(userId),
      this.getDailyActivities(userId),
      this.getProjectSubmissions(userId),
      this.getPlaygroundSnippets(userId),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      source: this.providerName,
      profile,
      progress,
      submissions,
      userAchievements,
      dailyActivity,
      projectSubmissions,
      snippets,
    };
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.getById<Profile>(STORES.profiles, userId);
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.getAll<Profile>(STORES.profiles);
  }

  async saveProfile(profile: Profile): Promise<Profile> {
    return this.putItem(STORES.profiles, profile);
  }

  async getCourses(): Promise<Course[]> {
    const items = await this.getAll<Course>(STORES.courses);
    return items.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async saveCourse(course: Course): Promise<Course> {
    return this.putItem(STORES.courses, course);
  }

  async getModules(courseId?: string): Promise<Module[]> {
    const items = await this.getAll<Module>(STORES.modules);
    const filtered = courseId ? items.filter((m) => m.courseId === courseId) : items;
    return filtered.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async saveModule(mod: Module): Promise<Module> {
    return this.putItem(STORES.modules, mod);
  }

  async getLessons(courseId?: string): Promise<Lesson[]> {
    const items = await this.getAll<Lesson>(STORES.lessons);
    const filtered = courseId ? items.filter((l) => l.courseId === courseId) : items;
    return filtered.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async saveLesson(lesson: Lesson): Promise<Lesson> {
    return this.putItem(STORES.lessons, lesson);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await this.deleteById(STORES.lessons, lessonId);
  }

  async getModuleQuestions(moduleId?: string): Promise<Question[]> {
    const items = await this.getAll<Question>(STORES.questions);
    return moduleId ? items.filter((q) => q.moduleId === moduleId) : items;
  }

  async saveModuleQuestion(question: Question): Promise<Question> {
    return this.putItem(STORES.questions, question);
  }

  async getExercises(courseId?: string): Promise<Exercise[]> {
    const items = await this.getAll<Exercise>(STORES.exercises);
    return courseId ? items.filter((e) => e.courseId === courseId) : items;
  }

  async saveExercise(exercise: Exercise): Promise<Exercise> {
    return this.putItem(STORES.exercises, exercise);
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    await this.deleteById(STORES.exercises, exerciseId);
  }

  async getSubmissions(userId: string): Promise<Submission[]> {
    const items = await this.getAll<Submission>(STORES.submissions);
    return items.filter((s) => s.userId === userId);
  }

  async saveSubmission(submission: Submission): Promise<Submission> {
    return this.putItem(STORES.submissions, submission);
  }

  async getProgress(userId: string): Promise<ProgressRecord[]> {
    const items = await this.getAll<ProgressRecord>(STORES.progress);
    return items.filter((p) => p.userId === userId);
  }

  async saveProgress(record: ProgressRecord): Promise<ProgressRecord> {
    return this.putItem(STORES.progress, record);
  }

  async getDailyActivities(userId: string): Promise<DailyActivity[]> {
    const items = await this.getAll<DailyActivity>(STORES.daily_activity);
    return items
      .filter((d) => d.userId === userId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveDailyActivity(activity: DailyActivity): Promise<DailyActivity> {
    return this.putItem(STORES.daily_activity, activity);
  }

  async getAchievements(): Promise<Achievement[]> {
    return this.getAll<Achievement>(STORES.achievements);
  }

  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    return this.putItem(STORES.achievements, achievement);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const items = await this.getAll<UserAchievement>(STORES.user_achievements);
    return items.filter((u) => u.userId === userId);
  }

  async saveUserAchievement(ua: UserAchievement): Promise<UserAchievement> {
    return this.putItem(STORES.user_achievements, ua);
  }

  async getAIConversations(userId: string): Promise<AIConversation[]> {
    const items = await this.getAll<AIConversation>(STORES.ai_conversations);
    return items
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async saveAIConversation(conversation: AIConversation): Promise<AIConversation> {
    return this.putItem(STORES.ai_conversations, conversation);
  }

  async getProjects(): Promise<Project[]> {
    const items = await this.getAll<Project>(STORES.projects);
    return items.sort((a, b) => a.levelRequired - b.levelRequired);
  }

  async getProjectSubmissions(userId: string): Promise<ProjectSubmission[]> {
    const items = await this.getAll<ProjectSubmission>(STORES.project_submissions);
    return items.filter((p) => p.userId === userId);
  }

  async saveProjectSubmission(submission: ProjectSubmission): Promise<ProjectSubmission> {
    return this.putItem(STORES.project_submissions, submission);
  }

  async getPlaygroundSnippets(userId: string): Promise<PlaygroundSnippet[]> {
    const items = await this.getAll<PlaygroundSnippet>(STORES.playground_snippets);
    return items
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async savePlaygroundSnippet(snippet: PlaygroundSnippet): Promise<PlaygroundSnippet> {
    return this.putItem(STORES.playground_snippets, snippet);
  }

  async deletePlaygroundSnippet(snippetId: string): Promise<void> {
    await this.deleteById(STORES.playground_snippets, snippetId);
  }
}
