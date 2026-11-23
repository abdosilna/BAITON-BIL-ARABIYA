import { create } from 'zustand';
import { aiService, authAdapter, dbAdapter, localStorageAdapter } from '../services';
import type { AuthSession } from '../services/auth/AuthAdapter';
import type {
  Achievement,
  AIConversation,
  AIMessage,
  AIMode,
  AppSettings,
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
  ToastMessage,
  UserAchievement,
  UserRole,
} from '../types/database';
import {
  buildUpdatedProfileWithXp,
  canGrantExerciseXp,
  canGrantLessonXp,
  canGrantProjectXp,
  evaluateAchievements,
  getTodayIsoDate,
} from '../utils/gamification';

const SETTINGS_KEY = 'app_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  dailyGoalXp: 80,
  editorFontSize: 14,
  speechRate: 1.0,
  speechVoiceURI: '',
  preferredAiMode: 'teacher',
  simulateAiOffline: false,
  autoSavePlayground: true,
};

interface AppState {
  isBootstrapping: boolean;
  initError: string | null;
  session: AuthSession | null;
  profile: Profile | null;
  allProfiles: Profile[];

  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  moduleQuestions: Question[];
  exercises: Exercise[];
  projects: Project[];
  achievements: Achievement[];

  progress: ProgressRecord[];
  submissions: Submission[];
  userAchievements: UserAchievement[];
  dailyActivities: DailyActivity[];
  aiConversations: AIConversation[];
  projectSubmissions: ProjectSubmission[];
  playgroundSnippets: PlaygroundSnippet[];

  settings: AppSettings;
  toasts: ToastMessage[];

  bootstrap: () => Promise<void>;
  enterDemo: (role: UserRole, customName?: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  completeLesson: (lessonId: string, quizScore?: number) => Promise<{ xpAwarded: number }>;
  submitExerciseAttempt: (
    exerciseId: string,
    answer: string,
    isCorrect: boolean
  ) => Promise<{ xpAwarded: number }>;
  recordPlaygroundRun: () => Promise<void>;
  saveSnippet: (titleAr: string, code: string) => Promise<PlaygroundSnippet>;
  deleteSnippet: (snippetId: string) => Promise<void>;

  sendAIMessage: (
    conversationId: string | null,
    prompt: string,
    mode: AIMode,
    codeContext?: string
  ) => Promise<AIConversation>;

  saveProjectAttempt: (
    projectId: string,
    code: string,
    results: { testId: string; descriptionAr: string; passed: boolean; error?: string }[]
  ) => Promise<{ submission: ProjectSubmission; xpAwarded: number }>;

  updateProfileInfo: (displayName: string, bio: string, dailyGoalXp: number) => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetLocalWorkspace: () => Promise<void>;

  // Admin CRUD actions (Local Demo Mode)
  upsertCourse: (course: Course) => Promise<void>;
  upsertModule: (mod: Module) => Promise<void>;
  upsertLesson: (lesson: Lesson) => Promise<void>;
  removeLesson: (lessonId: string) => Promise<void>;
  upsertExercise: (exercise: Exercise) => Promise<void>;
  removeExercise: (exerciseId: string) => Promise<void>;
  upsertAchievement: (achievement: Achievement) => Promise<void>;
  upsertModuleQuestion: (question: Question) => Promise<void>;
}

async function loadUserWorkspace(userId: string) {
  const [
    progress,
    submissions,
    userAchievements,
    dailyActivities,
    aiConversations,
    projectSubmissions,
    playgroundSnippets,
  ] = await Promise.all([
    dbAdapter.getProgress(userId),
    dbAdapter.getSubmissions(userId),
    dbAdapter.getUserAchievements(userId),
    dbAdapter.getDailyActivities(userId),
    dbAdapter.getAIConversations(userId),
    dbAdapter.getProjectSubmissions(userId),
    dbAdapter.getPlaygroundSnippets(userId),
  ]);

  return {
    progress,
    submissions,
    userAchievements,
    dailyActivities,
    aiConversations,
    projectSubmissions,
    playgroundSnippets,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  isBootstrapping: true,
  initError: null,
  session: null,
  profile: null,
  allProfiles: [],

  courses: [],
  modules: [],
  lessons: [],
  moduleQuestions: [],
  exercises: [],
  projects: [],
  achievements: [],

  progress: [],
  submissions: [],
  userAchievements: [],
  dailyActivities: [],
  aiConversations: [],
  projectSubmissions: [],
  playgroundSnippets: [],

  settings: localStorageAdapter.getItem<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS),
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4200);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  bootstrap: async () => {
    set({ isBootstrapping: true, initError: null });
    try {
      await dbAdapter.init();
      const [courses, modules, lessons, moduleQuestions, exercises, projects, achievements, allProfiles] =
        await Promise.all([
          dbAdapter.getCourses(),
          dbAdapter.getModules(),
          dbAdapter.getLessons(),
          dbAdapter.getModuleQuestions(),
          dbAdapter.getExercises(),
          dbAdapter.getProjects(),
          dbAdapter.getAchievements(),
          dbAdapter.getAllProfiles(),
        ]);

      const session = await authAdapter.getCurrentSession();
      let profile: Profile | null = null;
      let workspace: Awaited<ReturnType<typeof loadUserWorkspace>> | null = null;

      if (session) {
        profile = await dbAdapter.getProfile(session.userId);
        if (profile) {
          workspace = await loadUserWorkspace(profile.id);
        }
      }

      set({
        isBootstrapping: false,
        courses,
        modules,
        lessons,
        moduleQuestions,
        exercises,
        projects,
        achievements,
        allProfiles,
        session,
        profile,
        ...(workspace ?? {}),
      });
    } catch (err) {
      set({
        isBootstrapping: false,
        initError: err instanceof Error ? err.message : 'تعذر تهيئة قاعدة البيانات المحلية.',
      });
    }
  },

  enterDemo: async (role, customName) => {
    const { session, profile } = await authAdapter.enterDemoAccount(role, customName);
    const workspace = await loadUserWorkspace(profile.id);
    const allProfiles = await dbAdapter.getAllProfiles();
    set({
      session,
      profile,
      allProfiles,
      ...workspace,
    });
    get().addToast({
      type: 'success',
      title: `مرحبًا ${profile.displayName}`,
      description: 'تم الدخول في وضع التجربة المحلي (Local Demo Mode).',
    });
  },

  switchRole: async (role) => {
    await get().enterDemo(role);
  },

  signOut: async () => {
    await authAdapter.signOut();
    set({
      session: null,
      profile: null,
      progress: [],
      submissions: [],
      userAchievements: [],
      dailyActivities: [],
      aiConversations: [],
      projectSubmissions: [],
      playgroundSnippets: [],
    });
  },

  completeLesson: async (lessonId, quizScore) => {
    const state = get();
    if (!state.profile) return { xpAwarded: 0 };

    const lesson = state.lessons.find((l) => l.id === lessonId);
    if (!lesson) return { xpAwarded: 0 };

    const existing = state.progress.find((p) => p.lessonId === lessonId);
    const allowXp = canGrantLessonXp(existing);
    const xpAwarded = allowXp ? lesson.xpReward : 0;
    const nowIso = new Date().toISOString();

    const record: ProgressRecord = {
      id: `${state.profile.id}:${lessonId}`,
      userId: state.profile.id,
      lessonId,
      courseId: lesson.courseId,
      moduleId: lesson.moduleId,
      completed: true,
      quizScore: quizScore ?? existing?.quizScore ?? 100,
      xpAwarded: existing?.xpAwarded || xpAwarded,
      completedAt: existing?.completedAt ?? nowIso,
      lastVisitedAt: nowIso,
    };

    await dbAdapter.saveProgress(record);

    const nextProgress = existing
      ? state.progress.map((p) => (p.id === record.id ? record : p))
      : [...state.progress, record];

    let nextProfile = buildUpdatedProfileWithXp(state.profile, xpAwarded);
    const today = getTodayIsoDate();
    const todayId = `${state.profile.id}:${today}`;
    const existingDay = state.dailyActivities.find((d) => d.id === todayId);
    const nextDay: DailyActivity = {
      id: todayId,
      userId: state.profile.id,
      date: today,
      xpEarned: (existingDay?.xpEarned ?? 0) + xpAwarded,
      lessonsCompleted: (existingDay?.lessonsCompleted ?? 0) + (allowXp ? 1 : 0),
      exercisesSolved: existingDay?.exercisesSolved ?? 0,
      minutesLearned: (existingDay?.minutesLearned ?? 0) + lesson.estimatedMinutes,
      playgroundRuns: existingDay?.playgroundRuns ?? 0,
    };
    await dbAdapter.saveDailyActivity(nextDay);

    const nextActivities = existingDay
      ? state.dailyActivities.map((d) => (d.id === todayId ? nextDay : d))
      : [...state.dailyActivities, nextDay];

    // Evaluate achievements
    const newlyUnlocked = evaluateAchievements(
      state.profile.id,
      state.achievements,
      state.userAchievements,
      {
        xp: nextProfile.xp,
        streakDays: nextProfile.streakDays,
        lessonsCompleted: nextProgress.filter((p) => p.completed).length,
        exercisesSolved: new Set(
          state.submissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
        ).size,
        projectsCompleted: new Set(
          state.projectSubmissions.filter((p) => p.passed).map((p) => p.projectId)
        ).size,
        playgroundRuns: nextActivities.reduce((acc, d) => acc + d.playgroundRuns, 0),
        aiMessages: state.aiConversations.reduce(
          (acc, c) => acc + c.messages.filter((m) => m.role === 'user').length,
          0
        ),
      }
    );

    let bonusXp = 0;
    for (const ua of newlyUnlocked) {
      await dbAdapter.saveUserAchievement(ua);
      bonusXp += ua.xpAwarded;
    }
    if (bonusXp > 0) {
      nextProfile = buildUpdatedProfileWithXp(nextProfile, bonusXp);
    }

    await dbAdapter.saveProfile(nextProfile);

    set({
      profile: nextProfile,
      progress: nextProgress,
      dailyActivities: nextActivities,
      userAchievements: [...state.userAchievements, ...newlyUnlocked],
    });

    if (xpAwarded > 0) {
      get().addToast({
        type: 'success',
        title: `أحسنت! +${xpAwarded} XP`,
        description: `تم إتمام درس "${lesson.titleAr}" وحفظ تقدمك.`,
      });
    } else {
      get().addToast({
        type: 'info',
        title: 'تم تحديث سجل المراجعة',
        description: 'سبق احتساب نقاط XP لهذا الدرس مسبقًا.',
      });
    }

    for (const ua of newlyUnlocked) {
      const ach = state.achievements.find((a) => a.id === ua.achievementId);
      if (ach) {
        get().addToast({
          type: 'success',
          title: `إنجاز جديد: ${ach.titleAr}`,
          description: `مكافأة إضافية +${ach.xpBonus} XP`,
        });
      }
    }

    return { xpAwarded };
  },

  submitExerciseAttempt: async (exerciseId, answer, isCorrect) => {
    const state = get();
    if (!state.profile) return { xpAwarded: 0 };

    const exercise = state.exercises.find((e) => e.id === exerciseId);
    if (!exercise) return { xpAwarded: 0 };

    const allowXp = isCorrect && canGrantExerciseXp(state.submissions, exerciseId);
    const xpAwarded = allowXp ? exercise.xpReward : 0;

    const existingAttempts = state.submissions.filter((s) => s.exerciseId === exerciseId).length;
    const submission: Submission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: state.profile.id,
      exerciseId,
      answer,
      isCorrect,
      xpAwarded,
      attempts: existingAttempts + 1,
      submittedAt: new Date().toISOString(),
    };
    await dbAdapter.saveSubmission(submission);

    const nextSubmissions = [...state.submissions, submission];
    let nextProfile = buildUpdatedProfileWithXp(state.profile, xpAwarded);

    const today = getTodayIsoDate();
    const todayId = `${state.profile.id}:${today}`;
    const existingDay = state.dailyActivities.find((d) => d.id === todayId);
    const nextDay: DailyActivity = {
      id: todayId,
      userId: state.profile.id,
      date: today,
      xpEarned: (existingDay?.xpEarned ?? 0) + xpAwarded,
      lessonsCompleted: existingDay?.lessonsCompleted ?? 0,
      exercisesSolved: (existingDay?.exercisesSolved ?? 0) + (allowXp ? 1 : 0),
      minutesLearned: (existingDay?.minutesLearned ?? 0) + 3,
      playgroundRuns: existingDay?.playgroundRuns ?? 0,
    };
    await dbAdapter.saveDailyActivity(nextDay);
    const nextActivities = existingDay
      ? state.dailyActivities.map((d) => (d.id === todayId ? nextDay : d))
      : [...state.dailyActivities, nextDay];

    const newlyUnlocked = evaluateAchievements(
      state.profile.id,
      state.achievements,
      state.userAchievements,
      {
        xp: nextProfile.xp,
        streakDays: nextProfile.streakDays,
        lessonsCompleted: state.progress.filter((p) => p.completed).length,
        exercisesSolved: new Set(
          nextSubmissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
        ).size,
        projectsCompleted: new Set(
          state.projectSubmissions.filter((p) => p.passed).map((p) => p.projectId)
        ).size,
        playgroundRuns: nextActivities.reduce((acc, d) => acc + d.playgroundRuns, 0),
        aiMessages: state.aiConversations.reduce(
          (acc, c) => acc + c.messages.filter((m) => m.role === 'user').length,
          0
        ),
      }
    );

    let bonusXp = 0;
    for (const ua of newlyUnlocked) {
      await dbAdapter.saveUserAchievement(ua);
      bonusXp += ua.xpAwarded;
    }
    if (bonusXp > 0) {
      nextProfile = buildUpdatedProfileWithXp(nextProfile, bonusXp);
    }

    await dbAdapter.saveProfile(nextProfile);

    set({
      profile: nextProfile,
      submissions: nextSubmissions,
      dailyActivities: nextActivities,
      userAchievements: [...state.userAchievements, ...newlyUnlocked],
    });

    if (xpAwarded > 0) {
      get().addToast({
        type: 'success',
        title: `إجابة صحيحة! +${xpAwarded} XP`,
      });
    }

    return { xpAwarded };
  },

  recordPlaygroundRun: async () => {
    const state = get();
    if (!state.profile) return;

    const today = getTodayIsoDate();
    const todayId = `${state.profile.id}:${today}`;
    const existingDay = state.dailyActivities.find((d) => d.id === todayId);
    const nextDay: DailyActivity = {
      id: todayId,
      userId: state.profile.id,
      date: today,
      xpEarned: existingDay?.xpEarned ?? 0,
      lessonsCompleted: existingDay?.lessonsCompleted ?? 0,
      exercisesSolved: existingDay?.exercisesSolved ?? 0,
      minutesLearned: (existingDay?.minutesLearned ?? 0) + 1,
      playgroundRuns: (existingDay?.playgroundRuns ?? 0) + 1,
    };
    await dbAdapter.saveDailyActivity(nextDay);
    const nextActivities = existingDay
      ? state.dailyActivities.map((d) => (d.id === todayId ? nextDay : d))
      : [...state.dailyActivities, nextDay];

    const newlyUnlocked = evaluateAchievements(
      state.profile.id,
      state.achievements,
      state.userAchievements,
      {
        xp: state.profile.xp,
        streakDays: state.profile.streakDays,
        lessonsCompleted: state.progress.filter((p) => p.completed).length,
        exercisesSolved: new Set(
          state.submissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
        ).size,
        projectsCompleted: new Set(
          state.projectSubmissions.filter((p) => p.passed).map((p) => p.projectId)
        ).size,
        playgroundRuns: nextActivities.reduce((acc, d) => acc + d.playgroundRuns, 0),
        aiMessages: state.aiConversations.reduce(
          (acc, c) => acc + c.messages.filter((m) => m.role === 'user').length,
          0
        ),
      }
    );

    let nextProfile = state.profile;
    let bonusXp = 0;
    for (const ua of newlyUnlocked) {
      await dbAdapter.saveUserAchievement(ua);
      bonusXp += ua.xpAwarded;
    }
    if (bonusXp > 0) {
      nextProfile = buildUpdatedProfileWithXp(nextProfile, bonusXp);
      await dbAdapter.saveProfile(nextProfile);
    }

    set({
      profile: nextProfile,
      dailyActivities: nextActivities,
      userAchievements: [...state.userAchievements, ...newlyUnlocked],
    });
  },

  saveSnippet: async (titleAr, code) => {
    const state = get();
    const userId = state.profile?.id ?? 'guest';
    const snippet: PlaygroundSnippet = {
      id: `snip-${Date.now()}`,
      userId,
      titleAr,
      code,
      updatedAt: new Date().toISOString(),
    };
    await dbAdapter.savePlaygroundSnippet(snippet);
    set({ playgroundSnippets: [snippet, ...state.playgroundSnippets] });
    get().addToast({ type: 'success', title: 'تم حفظ الكود محليًا' });
    return snippet;
  },

  deleteSnippet: async (snippetId) => {
    await dbAdapter.deletePlaygroundSnippet(snippetId);
    set((state) => ({
      playgroundSnippets: state.playgroundSnippets.filter((s) => s.id !== snippetId),
    }));
  },

  sendAIMessage: async (conversationId, prompt, mode, codeContext) => {
    const state = get();
    if (!state.profile) {
      throw new Error('يرجى الدخول إلى الحساب التجريبي أولًا.');
    }

    const userMsg: AIMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: prompt,
      mode,
      codeContext,
      timestamp: new Date().toISOString(),
      isMock: false,
    };

    const reply = await aiService.ask({
      prompt,
      mode,
      learnerLevel: state.profile.level,
      codeContext,
      simulateOffline: state.settings.simulateAiOffline,
    });

    const assistantMsg: AIMessage = {
      id: `msg-a-${Date.now() + 1}`,
      role: 'assistant',
      content: reply.content,
      mode,
      timestamp: new Date().toISOString(),
      isMock: reply.isMock,
    };

    const existing = conversationId
      ? state.aiConversations.find((c) => c.id === conversationId)
      : undefined;

    const updatedConv: AIConversation = existing
      ? {
          ...existing,
          mode,
          messages: [...existing.messages, userMsg, assistantMsg],
          updatedAt: new Date().toISOString(),
        }
      : {
          id: `conv-${Date.now()}`,
          userId: state.profile.id,
          titleAr: prompt.slice(0, 42) + (prompt.length > 42 ? '...' : ''),
          mode,
          messages: [userMsg, assistantMsg],
          updatedAt: new Date().toISOString(),
        };

    await dbAdapter.saveAIConversation(updatedConv);
    const nextConvs = existing
      ? state.aiConversations.map((c) => (c.id === updatedConv.id ? updatedConv : c))
      : [updatedConv, ...state.aiConversations];

    const newlyUnlocked = evaluateAchievements(
      state.profile.id,
      state.achievements,
      state.userAchievements,
      {
        xp: state.profile.xp,
        streakDays: state.profile.streakDays,
        lessonsCompleted: state.progress.filter((p) => p.completed).length,
        exercisesSolved: new Set(
          state.submissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
        ).size,
        projectsCompleted: new Set(
          state.projectSubmissions.filter((p) => p.passed).map((p) => p.projectId)
        ).size,
        playgroundRuns: state.dailyActivities.reduce((acc, d) => acc + d.playgroundRuns, 0),
        aiMessages: nextConvs.reduce(
          (acc, c) => acc + c.messages.filter((m) => m.role === 'user').length,
          0
        ),
      }
    );

    let nextProfile = state.profile;
    let bonusXp = 0;
    for (const ua of newlyUnlocked) {
      await dbAdapter.saveUserAchievement(ua);
      bonusXp += ua.xpAwarded;
    }
    if (bonusXp > 0) {
      nextProfile = buildUpdatedProfileWithXp(nextProfile, bonusXp);
      await dbAdapter.saveProfile(nextProfile);
    }

    set({
      profile: nextProfile,
      aiConversations: nextConvs,
      userAchievements: [...state.userAchievements, ...newlyUnlocked],
    });

    return updatedConv;
  },

  saveProjectAttempt: async (projectId, code, results) => {
    const state = get();
    if (!state.profile) {
      throw new Error('يرجى الدخول إلى الحساب التجريبي أولًا.');
    }
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('المشروع غير موجود.');
    }

    const totalTests = project.testCases.length;
    const passedTests = results.filter((r) => r.passed).length;
    const passed = totalTests > 0 && passedTests === totalTests;
    const allowXp = passed && canGrantProjectXp(state.projectSubmissions, projectId);
    const xpAwarded = allowXp ? project.xpReward : 0;

    const submission: ProjectSubmission = {
      id: `psub-${Date.now()}`,
      userId: state.profile.id,
      projectId,
      code,
      passedTests,
      totalTests,
      passed,
      xpAwarded,
      results,
      submittedAt: new Date().toISOString(),
    };

    await dbAdapter.saveProjectSubmission(submission);
    const nextSubs = [submission, ...state.projectSubmissions];

    let nextProfile = buildUpdatedProfileWithXp(state.profile, xpAwarded);
    const today = getTodayIsoDate();
    const todayId = `${state.profile.id}:${today}`;
    const existingDay = state.dailyActivities.find((d) => d.id === todayId);
    const nextDay: DailyActivity = {
      id: todayId,
      userId: state.profile.id,
      date: today,
      xpEarned: (existingDay?.xpEarned ?? 0) + xpAwarded,
      lessonsCompleted: existingDay?.lessonsCompleted ?? 0,
      exercisesSolved: existingDay?.exercisesSolved ?? 0,
      minutesLearned: (existingDay?.minutesLearned ?? 0) + 10,
      playgroundRuns: existingDay?.playgroundRuns ?? 0,
    };
    await dbAdapter.saveDailyActivity(nextDay);
    const nextActivities = existingDay
      ? state.dailyActivities.map((d) => (d.id === todayId ? nextDay : d))
      : [...state.dailyActivities, nextDay];

    const newlyUnlocked = evaluateAchievements(
      state.profile.id,
      state.achievements,
      state.userAchievements,
      {
        xp: nextProfile.xp,
        streakDays: nextProfile.streakDays,
        lessonsCompleted: state.progress.filter((p) => p.completed).length,
        exercisesSolved: new Set(
          state.submissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
        ).size,
        projectsCompleted: new Set(
          nextSubs.filter((p) => p.passed).map((p) => p.projectId)
        ).size,
        playgroundRuns: nextActivities.reduce((acc, d) => acc + d.playgroundRuns, 0),
        aiMessages: state.aiConversations.reduce(
          (acc, c) => acc + c.messages.filter((m) => m.role === 'user').length,
          0
        ),
      }
    );

    let bonusXp = 0;
    for (const ua of newlyUnlocked) {
      await dbAdapter.saveUserAchievement(ua);
      bonusXp += ua.xpAwarded;
    }
    if (bonusXp > 0) {
      nextProfile = buildUpdatedProfileWithXp(nextProfile, bonusXp);
    }

    await dbAdapter.saveProfile(nextProfile);

    set({
      profile: nextProfile,
      projectSubmissions: nextSubs,
      dailyActivities: nextActivities,
      userAchievements: [...state.userAchievements, ...newlyUnlocked],
    });

    if (passed) {
      get().addToast({
        type: 'success',
        title: xpAwarded > 0 ? `اجتياز المشروع! +${xpAwarded} XP` : 'اجتاز الكود جميع اختبارات المشروع!',
      });
    } else {
      get().addToast({
        type: 'warning',
        title: `نجح ${passedTests} من ${totalTests} اختبارات`,
        description: 'راجع تفاصيل الاختبارات الفاشلة وحاول مجددًا.',
      });
    }

    return { submission, xpAwarded };
  },

  updateProfileInfo: async (displayName, bio, dailyGoalXp) => {
    const state = get();
    if (!state.profile) return;
    const updated: Profile = {
      ...state.profile,
      displayName,
      bio,
      dailyGoalXp,
    };
    await dbAdapter.saveProfile(updated);
    const nextSettings = { ...state.settings, dailyGoalXp };
    localStorageAdapter.setItem(SETTINGS_KEY, nextSettings);
    set({
      profile: updated,
      settings: nextSettings,
      allProfiles: state.allProfiles.map((p) => (p.id === updated.id ? updated : p)),
    });
    get().addToast({ type: 'success', title: 'تم تحديث بيانات الملف الشخصي' });
  },

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    localStorageAdapter.setItem(SETTINGS_KEY, next);
    set({ settings: next });
    if (partial.dailyGoalXp && get().profile) {
      const updatedProfile = { ...get().profile!, dailyGoalXp: partial.dailyGoalXp };
      void dbAdapter.saveProfile(updatedProfile);
      set({ profile: updatedProfile });
    }
    get().addToast({ type: 'success', title: 'تم حفظ الإعدادات' });
  },

  resetLocalWorkspace: async () => {
    await dbAdapter.resetAllData();
    localStorageAdapter.clearPrefix('');
    await authAdapter.signOut();
    set({
      session: null,
      profile: null,
      settings: DEFAULT_SETTINGS,
      progress: [],
      submissions: [],
      userAchievements: [],
      dailyActivities: [],
      aiConversations: [],
      projectSubmissions: [],
      playgroundSnippets: [],
    });
    await get().bootstrap();
    get().addToast({
      type: 'info',
      title: 'تمت إعادة ضبط البيانات المحلية بنجاح',
    });
  },

  upsertCourse: async (course) => {
    await dbAdapter.saveCourse(course);
    const courses = await dbAdapter.getCourses();
    set({ courses });
    get().addToast({ type: 'success', title: 'تم حفظ المسار التعليمي' });
  },

  upsertModule: async (mod) => {
    await dbAdapter.saveModule(mod);
    const modules = await dbAdapter.getModules();
    set({ modules });
    get().addToast({ type: 'success', title: 'تم حفظ الوحدة الدراسية' });
  },

  upsertLesson: async (lesson) => {
    await dbAdapter.saveLesson(lesson);
    const lessons = await dbAdapter.getLessons();
    set({ lessons });
    get().addToast({ type: 'success', title: 'تم حفظ الدرس بنجاح' });
  },

  removeLesson: async (lessonId) => {
    await dbAdapter.deleteLesson(lessonId);
    const lessons = await dbAdapter.getLessons();
    set({ lessons });
    get().addToast({ type: 'info', title: 'تم حذف الدرس' });
  },

  upsertExercise: async (exercise) => {
    await dbAdapter.saveExercise(exercise);
    const exercises = await dbAdapter.getExercises();
    set({ exercises });
    get().addToast({ type: 'success', title: 'تم حفظ التمرين بنجاح' });
  },

  removeExercise: async (exerciseId) => {
    await dbAdapter.deleteExercise(exerciseId);
    const exercises = await dbAdapter.getExercises();
    set({ exercises });
    get().addToast({ type: 'info', title: 'تم حذف التمرين' });
  },

  upsertAchievement: async (achievement) => {
    await dbAdapter.saveAchievement(achievement);
    const achievements = await dbAdapter.getAchievements();
    set({ achievements });
    get().addToast({ type: 'success', title: 'تم حفظ الإنجاز' });
  },

  upsertModuleQuestion: async (question) => {
    await dbAdapter.saveModuleQuestion(question);
    const moduleQuestions = await dbAdapter.getModuleQuestions();
    set({ moduleQuestions });
    get().addToast({ type: 'success', title: 'تم حفظ سؤال الاختبار' });
  },
}));
