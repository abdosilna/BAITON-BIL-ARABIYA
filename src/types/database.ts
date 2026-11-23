export type UserRole = 'learner' | 'admin';

export type ExerciseType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blanks'
  | 'complete_code'
  | 'find_bug'
  | 'arrange_blocks'
  | 'write_python'
  | 'predict_output';

export type AIMode = 'teacher' | 'debugging' | 'practice' | 'explain';

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  role: UserRole;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoalXp: number;
  isDemoAccount: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  levelNumber: number; // 0 to 12
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionAr: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  estimatedHours: number;
  objectives: string[];
  orderIndex: number;
}

export interface Module {
  id: string;
  courseId: string;
  titleAr: string;
  descriptionAr: string;
  objectives: string[];
  orderIndex: number;
  finalQuizQuestionIds: string[];
}

export interface LineExplanation {
  lineNumber: number;
  code: string;
  explanationAr: string;
}

export interface CommonMistake {
  mistakeTitleAr: string;
  wrongCode: string;
  correctCode: string;
  explanationAr: string;
}

export interface LessonQuizQuestion {
  id: string;
  promptAr: string;
  options: string[];
  correctIndex: number;
  explanationAr: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  titleAr: string;
  summaryAr: string;
  explanationAr: string;
  exampleCode: string;
  tryItCode: string;
  lineByLine: LineExplanation[];
  commonMistakes: CommonMistake[];
  practiceExerciseId?: string;
  quiz: LessonQuizQuestion[];
  xpReward: number;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface Exercise {
  id: string;
  lessonId?: string;
  courseId: string;
  type: ExerciseType;
  titleAr: string;
  promptAr: string;
  codeSnippet?: string;
  options?: string[];
  blocks?: string[];
  correctAnswer: string | string[] | number | boolean;
  expectedOutput?: string;
  validationCode?: string; // Python assertion harness for write_python
  hintAr: string;
  explanationAr: string;
  xpReward: number;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
}

export interface Question {
  id: string;
  moduleId: string;
  promptAr: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanationAr: string;
}

export interface Submission {
  id: string;
  userId: string;
  exerciseId: string;
  answer: string;
  isCorrect: boolean;
  xpAwarded: number;
  attempts: number;
  submittedAt: string;
}

export interface ProgressRecord {
  id: string; // `${userId}:${lessonId}`
  userId: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
  quizScore?: number;
  xpAwarded: number;
  completedAt?: string;
  lastVisitedAt: string;
}

export type AchievementConditionType =
  | 'lessons_completed'
  | 'xp_reached'
  | 'streak_days'
  | 'exercises_solved'
  | 'projects_completed'
  | 'playground_runs'
  | 'ai_messages';

export interface Achievement {
  id: string;
  titleAr: string;
  descriptionAr: string;
  iconName: string;
  category: 'التعلم' | 'البرمجة' | 'المشاريع' | 'الالتزام';
  xpBonus: number;
  conditionType: AchievementConditionType;
  conditionTarget: number;
}

export interface UserAchievement {
  id: string; // `${userId}:${achievementId}`
  userId: string;
  achievementId: string;
  unlockedAt: string;
  xpAwarded: number;
}

export interface DailyActivity {
  id: string; // `${userId}:${date}`
  userId: string;
  date: string; // YYYY-MM-DD
  xpEarned: number;
  lessonsCompleted: number;
  exercisesSolved: number;
  minutesLearned: number;
  playgroundRuns: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AIMode;
  codeContext?: string;
  timestamp: string;
  isMock: boolean;
}

export interface AIConversation {
  id: string;
  userId: string;
  titleAr: string;
  mode: AIMode;
  messages: AIMessage[];
  updatedAt: string;
}

export interface ProjectTestCase {
  id: string;
  descriptionAr: string;
  pythonTestCode: string;
}

export interface Project {
  id: string;
  titleAr: string;
  titleEn: string;
  levelRequired: number;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  goalAr: string;
  requirementsAr: string[];
  hintsAr: string[];
  starterCode: string;
  testCases: ProjectTestCase[];
  xpReward: number;
}

export interface ProjectSubmission {
  id: string;
  userId: string;
  projectId: string;
  code: string;
  passedTests: number;
  totalTests: number;
  passed: boolean;
  xpAwarded: number;
  results: { testId: string; descriptionAr: string; passed: boolean; error?: string }[];
  submittedAt: string;
}

export interface PlaygroundSnippet {
  id: string;
  userId: string;
  titleAr: string;
  code: string;
  updatedAt: string;
}

export interface AppSettings {
  dailyGoalXp: number;
  editorFontSize: number;
  speechRate: number;
  speechVoiceURI: string;
  preferredAiMode: AIMode;
  simulateAiOffline: boolean;
  autoSavePlayground: boolean;
}

export interface DailyChallenge {
  id: string;
  titleAr: string;
  descriptionAr: string;
  targetType: 'lessons' | 'exercises' | 'xp' | 'playground';
  targetValue: number;
  xpReward: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
