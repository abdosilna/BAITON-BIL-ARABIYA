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

/**
 * Placeholder adapter for future Supabase Postgres integration.
 * Intentionally NOT connected in Phase 1.
 * Refer to docs/DATABASE_SCHEMA.md and docs/sql/schema.sql for migration steps.
 */
export class SupabaseAdapterPlaceholder implements DatabaseAdapter {
  readonly isConnectedToRemote = false;
  readonly providerName = 'Supabase Postgres (Not Connected)';

  private notConnected(): never {
    throw new Error('قاعدة بيانات Supabase غير مربوطة في هذه المرحلة. تعمل المنصة عبر LocalDatabaseAdapter.');
  }

  async init(): Promise<void> {
    this.notConnected();
  }
  async resetAllData(): Promise<void> {
    this.notConnected();
  }
  async exportUserData(_userId: string): Promise<Record<string, unknown>> {
    this.notConnected();
  }
  async getProfile(_userId: string): Promise<Profile | null> {
    this.notConnected();
  }
  async getAllProfiles(): Promise<Profile[]> {
    this.notConnected();
  }
  async saveProfile(_profile: Profile): Promise<Profile> {
    this.notConnected();
  }
  async getCourses(): Promise<Course[]> {
    this.notConnected();
  }
  async saveCourse(_course: Course): Promise<Course> {
    this.notConnected();
  }
  async getModules(_courseId?: string): Promise<Module[]> {
    this.notConnected();
  }
  async saveModule(_mod: Module): Promise<Module> {
    this.notConnected();
  }
  async getLessons(_courseId?: string): Promise<Lesson[]> {
    this.notConnected();
  }
  async saveLesson(_lesson: Lesson): Promise<Lesson> {
    this.notConnected();
  }
  async deleteLesson(_lessonId: string): Promise<void> {
    this.notConnected();
  }
  async getModuleQuestions(_moduleId?: string): Promise<Question[]> {
    this.notConnected();
  }
  async saveModuleQuestion(_question: Question): Promise<Question> {
    this.notConnected();
  }
  async getExercises(_courseId?: string): Promise<Exercise[]> {
    this.notConnected();
  }
  async saveExercise(_exercise: Exercise): Promise<Exercise> {
    this.notConnected();
  }
  async deleteExercise(_exerciseId: string): Promise<void> {
    this.notConnected();
  }
  async getSubmissions(_userId: string): Promise<Submission[]> {
    this.notConnected();
  }
  async saveSubmission(_submission: Submission): Promise<Submission> {
    this.notConnected();
  }
  async getProgress(_userId: string): Promise<ProgressRecord[]> {
    this.notConnected();
  }
  async saveProgress(_record: ProgressRecord): Promise<ProgressRecord> {
    this.notConnected();
  }
  async getDailyActivities(_userId: string): Promise<DailyActivity[]> {
    this.notConnected();
  }
  async saveDailyActivity(_activity: DailyActivity): Promise<DailyActivity> {
    this.notConnected();
  }
  async getAchievements(): Promise<Achievement[]> {
    this.notConnected();
  }
  async saveAchievement(_achievement: Achievement): Promise<Achievement> {
    this.notConnected();
  }
  async getUserAchievements(_userId: string): Promise<UserAchievement[]> {
    this.notConnected();
  }
  async saveUserAchievement(_ua: UserAchievement): Promise<UserAchievement> {
    this.notConnected();
  }
  async getAIConversations(_userId: string): Promise<AIConversation[]> {
    this.notConnected();
  }
  async saveAIConversation(_conversation: AIConversation): Promise<AIConversation> {
    this.notConnected();
  }
  async getProjects(): Promise<Project[]> {
    this.notConnected();
  }
  async getProjectSubmissions(_userId: string): Promise<ProjectSubmission[]> {
    this.notConnected();
  }
  async saveProjectSubmission(_submission: ProjectSubmission): Promise<ProjectSubmission> {
    this.notConnected();
  }
  async getPlaygroundSnippets(_userId: string): Promise<PlaygroundSnippet[]> {
    this.notConnected();
  }
  async savePlaygroundSnippet(_snippet: PlaygroundSnippet): Promise<PlaygroundSnippet> {
    this.notConnected();
  }
  async deletePlaygroundSnippet(_snippetId: string): Promise<void> {
    this.notConnected();
  }
}
