import { z } from 'zod';

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'يجب أن يتكون الاسم من حرفين على الأقل')
    .max(50, 'الاسم طويل جدًا (الحد الأقصى 50 حرفًا)'),
  bio: z
    .string()
    .trim()
    .max(240, 'النبذة التعريفية يجب ألا تتجاوز 240 حرفًا'),
  dailyGoalXp: z
    .number()
    .int()
    .min(20, 'الحد الأدنى للهدف اليومي هو 20 XP')
    .max(500, 'الحد الأقصى للهدف اليومي هو 500 XP'),
});

export const demoEntrySchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'أدخل اسمًا من حرفين على الأقل')
    .max(40, 'الاسم يجب ألا يتجاوز 40 حرفًا'),
  role: z.enum(['learner', 'admin']),
});

export const settingsSchema = z.object({
  dailyGoalXp: z.number().int().min(20).max(500),
  editorFontSize: z.number().int().min(12).max(22),
  speechRate: z.number().min(0.6).max(1.8),
  speechVoiceURI: z.string(),
  preferredAiMode: z.enum(['teacher', 'debugging', 'practice', 'explain']),
  simulateAiOffline: z.boolean(),
  autoSavePlayground: z.boolean(),
});

export const lessonFormSchema = z.object({
  courseId: z.string().min(1, 'اختر المسار'),
  moduleId: z.string().min(1, 'اختر الوحدة'),
  titleAr: z.string().trim().min(3, 'عنوان الدرس مطلوب (3 أحرف على الأقل)'),
  summaryAr: z.string().trim().min(10, 'ملخص الدرس مطلوب'),
  explanationAr: z.string().trim().min(20, 'الشرح التعليمي مطلوب'),
  exampleCode: z.string().trim().min(1, 'مثال الكود مطلوب'),
  tryItCode: z.string().trim().min(1, 'كود التجربة مطلوب'),
  xpReward: z.number().int().min(10).max(200),
  estimatedMinutes: z.number().int().min(2).max(90),
});

export const exerciseFormSchema = z.object({
  courseId: z.string().min(1, 'اختر المسار'),
  type: z.enum([
    'multiple_choice',
    'true_false',
    'fill_blanks',
    'complete_code',
    'find_bug',
    'arrange_blocks',
    'write_python',
    'predict_output',
  ]),
  titleAr: z.string().trim().min(3, 'عنوان التمرين مطلوب'),
  promptAr: z.string().trim().min(5, 'نص السؤال مطلوب'),
  hintAr: z.string().trim().min(3, 'التلميح مطلوب'),
  explanationAr: z.string().trim().min(5, 'تفسير الإجابة مطلوب'),
  xpReward: z.number().int().min(5).max(100),
  difficulty: z.enum(['سهل', 'متوسط', 'صعب']),
});

export const snippetSaveSchema = z.object({
  titleAr: z.string().trim().min(2, 'اكتب عنوانًا للكود المحفوظ').max(60),
  code: z.string().min(1, 'لا يمكن حفظ محرر فارغ'),
});

export const aiPromptSchema = z.object({
  prompt: z.string().trim().min(2, 'اكتب سؤالك أولًا').max(1500, 'السؤال طويل جدًا'),
});
