import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';
import type { Achievement, Course, Exercise, ExerciseType, Lesson } from '../types/database';
import { exerciseFormSchema, lessonFormSchema } from '../types/schemas';

type ContentTab = 'lessons' | 'exercises' | 'courses' | 'achievements';

export function ContentManagementPage() {
  const courses = useAppStore((s) => s.courses);
  const modules = useAppStore((s) => s.modules);
  const lessons = useAppStore((s) => s.lessons);
  const exercises = useAppStore((s) => s.exercises);
  const achievements = useAppStore((s) => s.achievements);

  const upsertLesson = useAppStore((s) => s.upsertLesson);
  const removeLesson = useAppStore((s) => s.removeLesson);
  const upsertExercise = useAppStore((s) => s.upsertExercise);
  const removeExercise = useAppStore((s) => s.removeExercise);
  const upsertCourse = useAppStore((s) => s.upsertCourse);
  const upsertAchievement = useAppStore((s) => s.upsertAchievement);

  const [tab, setTab] = useState<ContentTab>('lessons');
  const [formError, setFormError] = useState<string | null>(null);

  // Lesson Form State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lCourseId, setLCourseId] = useState(courses[0]?.id ?? 'course-0');
  const [lTitle, setLTitle] = useState('');
  const [lSummary, setLSummary] = useState('');
  const [lExplanation, setLExplanation] = useState('');
  const [lExample, setLExample] = useState('print("أهلاً بك")');
  const [lTryIt, setLTryIt] = useState('print("جرب الكود هنا")');
  const [lXp, setLXp] = useState(35);
  const [lMinutes, setLMinutes] = useState(8);

  // Exercise Form State
  const [eCourseId, setECourseId] = useState(courses[0]?.id ?? 'course-0');
  const [eType, setEType] = useState<ExerciseType>('multiple_choice');
  const [eTitle, setETitle] = useState('');
  const [ePrompt, setEPrompt] = useState('');
  const [eOptionsText, setEOptionsText] = useState('خيار 1\nخيار 2\nخيار 3');
  const [eCorrect, setECorrect] = useState('0');
  const [eHint, setEHint] = useState('');
  const [eExplanation, setEExplanation] = useState('');
  const [eXp, setEXp] = useState(25);

  // Course Edit State
  const [selectedCourseEdit, setSelectedCourseEdit] = useState<Course | null>(null);

  // Achievement Create State
  const [aTitle, setATitle] = useState('');
  const [aDesc, setADesc] = useState('');
  const [aTarget, setATarget] = useState(3);
  const [aXp, setAXp] = useState(40);

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLTitle('');
    setLSummary('');
    setLExplanation('');
    setLExample('print("أهلاً بك")');
    setLTryIt('print("جرب الكود هنا")');
    setLXp(35);
    setLMinutes(8);
    setFormError(null);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const mod = modules.find((m) => m.courseId === lCourseId) ?? modules[0];
    const parsed = lessonFormSchema.safeParse({
      courseId: lCourseId,
      moduleId: mod?.id ?? 'module-0',
      titleAr: lTitle,
      summaryAr: lSummary,
      explanationAr: lExplanation,
      exampleCode: lExample,
      tryItCode: lTryIt,
      xpReward: Number(lXp),
      estimatedMinutes: Number(lMinutes),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'يرجى استكمال حقول الدرس.');
      return;
    }

    const existing = editingLessonId ? lessons.find((l) => l.id === editingLessonId) : undefined;
    const nextLesson: Lesson = {
      id: existing?.id ?? `lesson-custom-${Date.now()}`,
      courseId: parsed.data.courseId,
      moduleId: parsed.data.moduleId,
      titleAr: parsed.data.titleAr,
      summaryAr: parsed.data.summaryAr,
      explanationAr: parsed.data.explanationAr,
      exampleCode: parsed.data.exampleCode,
      tryItCode: parsed.data.tryItCode,
      lineByLine: existing?.lineByLine ?? [],
      commonMistakes: existing?.commonMistakes ?? [],
      quiz: existing?.quiz ?? [],
      xpReward: parsed.data.xpReward,
      estimatedMinutes: parsed.data.estimatedMinutes,
      orderIndex: existing?.orderIndex ?? lessons.length + 1,
    };

    await upsertLesson(nextLesson);
    resetLessonForm();
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLCourseId(lesson.courseId);
    setLTitle(lesson.titleAr);
    setLSummary(lesson.summaryAr);
    setLExplanation(lesson.explanationAr);
    setLExample(lesson.exampleCode);
    setLTryIt(lesson.tryItCode);
    setLXp(lesson.xpReward);
    setLMinutes(lesson.estimatedMinutes);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = exerciseFormSchema.safeParse({
      courseId: eCourseId,
      type: eType,
      titleAr: eTitle,
      promptAr: ePrompt,
      hintAr: eHint,
      explanationAr: eExplanation,
      xpReward: Number(eXp),
      difficulty: 'متوسط',
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'تحقق من حقول التمرين.');
      return;
    }

    const opts = eOptionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newExercise: Exercise = {
      id: `ex-custom-${Date.now()}`,
      courseId: parsed.data.courseId,
      type: parsed.data.type,
      titleAr: parsed.data.titleAr,
      promptAr: parsed.data.promptAr,
      options: parsed.data.type === 'multiple_choice' ? opts : undefined,
      correctAnswer:
        parsed.data.type === 'multiple_choice'
          ? Number(eCorrect) || 0
          : parsed.data.type === 'true_false'
            ? eCorrect === 'true'
            : eCorrect,
      hintAr: parsed.data.hintAr,
      explanationAr: parsed.data.explanationAr,
      xpReward: parsed.data.xpReward,
      difficulty: parsed.data.difficulty,
    };

    await upsertExercise(newExercise);
    setETitle('');
    setEPrompt('');
    setEHint('');
    setEExplanation('');
  };

  const handleSaveCourseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseEdit) return;
    await upsertCourse(selectedCourseEdit);
    setSelectedCourseEdit(null);
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aTitle.trim().length < 3 || aDesc.trim().length < 5) {
      setFormError('أدخل عنوانًا ووصفًا واضحًا للإنجاز.');
      return;
    }
    const newAch: Achievement = {
      id: `ach-custom-${Date.now()}`,
      titleAr: aTitle.trim(),
      descriptionAr: aDesc.trim(),
      iconName: 'Award',
      category: 'التعلم',
      xpBonus: Number(aXp) || 30,
      conditionType: 'lessons_completed',
      conditionTarget: Number(aTarget) || 1,
    };
    await upsertAchievement(newAch);
    setATitle('');
    setADesc('');
  };

  return (
    <div className="space-y-6">
      <AlertBanner
        tone="info"
        title="إدارة المحتوى المحلي (IndexedDB CRUD)"
        description="أي درس أو تمرين أو مسار تضيفه أو تعدله هنا ينعكس فورًا على المسارات التعليمية وبنك التمارين."
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/[0.08] bg-[#181826] p-1.5 w-fit">
        {(
          [
            { id: 'lessons', label: `الدروس (${lessons.length})` },
            { id: 'exercises', label: `التمارين (${exercises.length})` },
            { id: 'courses', label: `المسارات (${courses.length})` },
            { id: 'achievements', label: `الإنجازات (${achievements.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setFormError(null);
            }}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-[#8B5CF6] text-white' : 'text-[#A1A1B5] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {formError && <AlertBanner tone="error" title="تنبيه" description={formError} />}

      {/* LESSONS TAB */}
      {tab === 'lessons' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-semibold text-white">
              {editingLessonId ? 'تعديل درس قائم' : 'إنشاء درس جديد'}
            </h3>
            <form onSubmit={handleSaveLesson} className="space-y-3">
              <div>
                <label htmlFor="adm-l-course" className="mb-1 block text-xs text-[#A1A1B5]">
                  المسار التعليمي
                </label>
                <select
                  id="adm-l-course"
                  value={lCourseId}
                  onChange={(e) => setLCourseId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="adm-l-title" className="mb-1 block text-xs text-[#A1A1B5]">
                  عنوان الدرس
                </label>
                <input
                  id="adm-l-title"
                  type="text"
                  value={lTitle}
                  onChange={(e) => setLTitle(e.target.value)}
                  placeholder="مثال: التعامل مع القوائم المتداخلة"
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="adm-l-summary" className="mb-1 block text-xs text-[#A1A1B5]">
                  ملخص الدرس
                </label>
                <input
                  id="adm-l-summary"
                  type="text"
                  value={lSummary}
                  onChange={(e) => setLSummary(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="adm-l-exp" className="mb-1 block text-xs text-[#A1A1B5]">
                  الشرح العربي التفصيلي
                </label>
                <textarea
                  id="adm-l-exp"
                  rows={3}
                  value={lExplanation}
                  onChange={(e) => setLExplanation(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="adm-l-code" className="mb-1 block text-xs text-[#A1A1B5]">
                  مثال كود Python
                </label>
                <textarea
                  id="adm-l-code"
                  dir="ltr"
                  rows={3}
                  value={lExample}
                  onChange={(e) => setLExample(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#0D0D14] px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adm-l-xp" className="mb-1 block text-xs text-[#A1A1B5]">
                    مكافأة XP
                  </label>
                  <input
                    id="adm-l-xp"
                    type="number"
                    value={lXp}
                    onChange={(e) => setLXp(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label htmlFor="adm-l-min" className="mb-1 block text-xs text-[#A1A1B5]">
                    المدة (دقائق)
                  </label>
                  <input
                    id="adm-l-min"
                    type="number"
                    value={lMinutes}
                    onChange={(e) => setLMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{editingLessonId ? 'تحديث الدرس' : 'إضافة الدرس'}</span>
                </Button>
                {editingLessonId && (
                  <Button type="button" size="sm" variant="secondary" onClick={resetLessonForm}>
                    إلغاء التعديل
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-semibold text-white">قائمة الدروس الحالية</h3>
            <div className="space-y-2 max-h-[540px] overflow-y-auto">
              {lessons.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#101018] p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{l.titleAr}</div>
                    <div className="text-xs text-[#A1A1B5] tabular-nums">
                      {l.courseId} · +{l.xpReward} XP
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditLesson(l)}
                      aria-label={`تعديل ${l.titleAr}`}
                      className="rounded-lg border border-white/10 p-1.5 text-[#A1A1B5] hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLesson(l.id)}
                      aria-label={`حذف ${l.titleAr}`}
                      className="rounded-lg border border-white/10 p-1.5 text-[#A1A1B5] hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* EXERCISES TAB */}
      {tab === 'exercises' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-semibold text-white">إضافة تمرين جديد</h3>
            <form onSubmit={handleSaveExercise} className="space-y-3">
              <div>
                <label htmlFor="adm-e-course" className="mb-1 block text-xs text-[#A1A1B5]">
                  المسار
                </label>
                <select
                  id="adm-e-course"
                  value={eCourseId}
                  onChange={(e) => setECourseId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="adm-e-type" className="mb-1 block text-xs text-[#A1A1B5]">
                  نوع التمرين
                </label>
                <select
                  id="adm-e-type"
                  value={eType}
                  onChange={(e) => setEType(e.target.value as ExerciseType)}
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs text-white"
                >
                  <option value="multiple_choice">اختيار من متعدد</option>
                  <option value="true_false">صح / خطأ</option>
                  <option value="fill_blanks">أكمل الفراغ</option>
                  <option value="predict_output">توقع المخرجات</option>
                </select>
              </div>

              <input
                type="text"
                value={eTitle}
                onChange={(e) => setETitle(e.target.value)}
                placeholder="عنوان التمرين"
                className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
              />
              <textarea
                rows={2}
                value={ePrompt}
                onChange={(e) => setEPrompt(e.target.value)}
                placeholder="نص السؤال التعليمي"
                className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
              />
              {eType === 'multiple_choice' && (
                <textarea
                  rows={3}
                  value={eOptionsText}
                  onChange={(e) => setEOptionsText(e.target.value)}
                  placeholder="خيار في كل سطر"
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs text-white"
                />
              )}
              <input
                type="text"
                value={eCorrect}
                onChange={(e) => setECorrect(e.target.value)}
                placeholder={
                  eType === 'multiple_choice'
                    ? 'رقم الخيار الصحيح (يبدأ من 0)'
                    : 'الإجابة الصحيحة (أو true/false)'
                }
                className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                value={eHint}
                onChange={(e) => setEHint(e.target.value)}
                placeholder="تلميح للمتعلم"
                className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                value={eExplanation}
                onChange={(e) => setEExplanation(e.target.value)}
                placeholder="تفسير الإجابة الصحيحة"
                className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs text-white"
              />
              <input
                type="number"
                value={eXp}
                onChange={(e) => setEXp(Number(e.target.value))}
                aria-label="نقاط التمرين"
                className="w-32 rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs font-mono text-white"
              />
              <div>
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>حفظ التمرين</span>
                </Button>
              </div>
            </form>
          </Card>

          <Card className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-semibold text-white">قائمة التمارين الحالية</h3>
            <div className="space-y-2 max-h-[540px] overflow-y-auto">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#101018] p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{ex.titleAr}</div>
                    <div className="text-xs text-[#A1A1B5] tabular-nums">
                      {ex.type} · +{ex.xpReward} XP
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.id)}
                    aria-label={`حذف ${ex.titleAr}`}
                    className="rounded-lg border border-white/10 p-1.5 text-[#A1A1B5] hover:text-red-300 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* COURSES TAB */}
      {tab === 'courses' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-7 space-y-2.5">
            <h3 className="text-base font-semibold text-white">المسارات (Level 0 - 12)</h3>
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#101018] p-3"
              >
                <div>
                  <div className="text-sm font-medium text-white">{c.titleAr}</div>
                  <div className="text-xs text-[#A1A1B5]">{c.descriptionAr}</div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedCourseEdit(c)}
                >
                  تعديل
                </Button>
              </div>
            ))}
          </Card>

          <Card className="lg:col-span-5 space-y-4 h-fit">
            <h3 className="text-base font-semibold text-white">تعديل وصف المسار</h3>
            {selectedCourseEdit ? (
              <form onSubmit={handleSaveCourseEdit} className="space-y-3">
                <input
                  type="text"
                  value={selectedCourseEdit.titleAr}
                  onChange={(e) =>
                    setSelectedCourseEdit({ ...selectedCourseEdit, titleAr: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
                />
                <textarea
                  rows={3}
                  value={selectedCourseEdit.descriptionAr}
                  onChange={(e) =>
                    setSelectedCourseEdit({
                      ...selectedCourseEdit,
                      descriptionAr: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    حفظ المسار
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedCourseEdit(null)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-[#A1A1B5]">اختر مسارًا من القائمة لتعديل بياناته.</p>
            )}
          </Card>
        </div>
      )}

      {/* ACHIEVEMENTS TAB */}
      {tab === 'achievements' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5 space-y-3 h-fit">
            <h3 className="text-base font-semibold text-white">إضافة إنجاز جديد</h3>
            <form onSubmit={handleCreateAchievement} className="space-y-3">
              <input
                type="text"
                value={aTitle}
                onChange={(e) => setATitle(e.target.value)}
                placeholder="عنوان الإنجاز"
                className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
              />
              <input
                type="text"
                value={aDesc}
                onChange={(e) => setADesc(e.target.value)}
                placeholder="وصف شرط الإنجاز"
                className="w-full rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-sm text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={aTarget}
                  onChange={(e) => setATarget(Number(e.target.value))}
                  placeholder="عدد الدروس المطلوب"
                  className="rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs font-mono text-white"
                />
                <input
                  type="number"
                  value={aXp}
                  onChange={(e) => setAXp(Number(e.target.value))}
                  placeholder="مكافأة XP"
                  className="rounded-lg border border-white/15 bg-[#101018] px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <Button type="submit" size="sm">
                إضافة الإنجاز
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-7 space-y-2.5">
            <h3 className="text-base font-semibold text-white">الأوسمة المسجلة</h3>
            {achievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#101018] p-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{a.titleAr}</div>
                  <div className="text-[#A1A1B5]">{a.descriptionAr}</div>
                </div>
                <span className="font-mono text-[#F59E0B] tabular-nums">+{a.xpBonus} XP</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
