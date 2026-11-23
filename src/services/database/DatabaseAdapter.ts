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

export interface DatabaseAdapter {
  readonly isConnectedToRemote: boolean;
  readonly providerName: string;

  init(): Promise<void>;
  resetAllData(): Promise<void>;
  exportUserData(userId: string): Promise<Record<string, unknown>>;

  // Profiles
  getProfile(userId: string): Promise<Profile | null>;
  getAllProfiles(): Promise<Profile[]>;
  saveProfile(profile: Profile): Promise<Profile>;

  // Curriculum
  getCourses(): Promise<Course[]>;
  saveCourse(course: Course): Promise<Course>;
  getModules(courseId?: string): Promise<Module[]>;
  saveModule(mod: Module): Promise<Module>;
  getLessons(courseId?: string): Promise<Lesson[]>;
  saveLesson(lesson: Lesson): Promise<Lesson>;
  deleteLesson(lessonId: string): Promise<void>;
  getModuleQuestions(moduleId?: string): Promise<Question[]>;
  saveModuleQuestion(question: Question): Promise<Question>;

  // Exercises & Submissions
  getExercises(courseId?: string): Promise<Exercise[]>;
  saveExercise(exercise: Exercise): Promise<Exercise>;
  deleteExercise(exerciseId: string): Promise<void>;
  getSubmissions(userId: string): Promise<Submission[]>;
  saveSubmission(submission: Submission): Promise<Submission>;

  // Progress & Activity
  getProgress(userId: string): Promise<ProgressRecord[]>;
  saveProgress(record: ProgressRecord): Promise<ProgressRecord>;
  getDailyActivities(userId: string): Promise<DailyActivity[]>;
  saveDailyActivity(activity: DailyActivity): Promise<DailyActivity>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  saveAchievement(achievement: Achievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  saveUserAchievement(ua: UserAchievement): Promise<UserAchievement>;

  // AI Conversations
  getAIConversations(userId: string): Promise<AIConversation[]>;
  saveAIConversation(conversation: AIConversation): Promise<AIConversation>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProjectSubmissions(userId: string): Promise<ProjectSubmission[]>;
  saveProjectSubmission(submission: ProjectSubmission): Promise<ProjectSubmission>;

  // Playground Snippets
  getPlaygroundSnippets(userId: string): Promise<PlaygroundSnippet[]>;
  savePlaygroundSnippet(snippet: PlaygroundSnippet): Promise<PlaygroundSnippet>;
  deletePlaygroundSnippet(snippetId: string): Promise<void>;
}
