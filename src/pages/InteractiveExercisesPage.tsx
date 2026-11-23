import { useMemo, useState } from 'react';
import { CheckCircle2, Filter } from 'lucide-react';
import { Card, EmptyState } from '../components/ui/Primitives';
import { InteractiveExerciseRunner } from '../features/exercises/InteractiveExerciseRunner';
import { useAppStore } from '../store/useAppStore';
import type { ExerciseType } from '../types/database';

const TYPE_FILTERS: Array<{ value: 'all' | ExerciseType; label: string }> = [
  { value: 'all', label: 'جميع الأنواع (8)' },
  { value: 'multiple_choice', label: 'اختيار من متعدد' },
  { value: 'true_false', label: 'صح / خطأ' },
  { value: 'fill_blanks', label: 'أكمل الفراغ' },
  { value: 'complete_code', label: 'أكمل الكود' },
  { value: 'find_bug', label: 'اكتشف الخطأ' },
  { value: 'arrange_blocks', label: 'رتب الكتل' },
  { value: 'write_python', label: 'كتابة Python' },
  { value: 'predict_output', label: 'توقع المخرجات' },
];

export function InteractiveExercisesPage() {
  const exercises = useAppStore((s) => s.exercises);
  const courses = useAppStore((s) => s.courses);
  const submissions = useAppStore((s) => s.submissions);

  const [typeFilter, setTypeFilter] = useState<'all' | ExerciseType>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const solvedIds = useMemo(
    () => new Set(submissions.filter((s) => s.isCorrect).map((s) => s.exerciseId)),
    [submissions]
  );

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchType = typeFilter === 'all' || ex.type === typeFilter;
      const matchCourse = courseFilter === 'all' || ex.courseId === courseFilter;
      return matchType && matchCourse;
    });
  }, [exercises, typeFilter, courseFilter]);

  const activeExercise =
    filtered.find((e) => e.id === selectedExerciseId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">بنك التمارين التفاعلية</h2>
            <p className="text-xs text-[#A1A1B5] tabular-nums">
              أنجزت {solvedIds.size} من أصل {exercises.length} تمرينًا بمختلف الأنماط.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#A1A1B5]" aria-hidden="true" />
            <select
              aria-label="تصفية حسب المسار"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#101018] px-3 py-2 text-xs text-white"
            >
              <option value="all">كل المستويات</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  Level {c.levelNumber}: {c.titleEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                typeFilter === f.value
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-[#101018] text-[#A1A1B5] hover:text-white border border-white/[0.06]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="لا توجد تمارين مطابقة للتصفية الحالية"
          description="اختر نوعًا آخر أو اعرض جميع المستويات لتظهر التمارين المتاحة."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Exercise Selector List */}
          <div className="lg:col-span-4 space-y-2">
            {filtered.map((ex) => {
              const isSelected = activeExercise?.id === ex.id;
              const isSolved = solvedIds.has(ex.id);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-right transition-colors ${
                    isSelected
                      ? 'border-[#8B5CF6] bg-[#272338] text-white'
                      : 'border-white/[0.08] bg-[#181826] text-[#D4D4E0] hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{ex.titleAr}</div>
                    <div className="mt-1 text-[11px] text-[#A1A1B5] tabular-nums">
                      <span>{ex.difficulty}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-[#F59E0B]">+{ex.xpReward} XP</span>
                    </div>
                  </div>
                  {isSolved && (
                    <CheckCircle2
                      className="h-4 w-4 text-[#22C55E] shrink-0"
                      aria-label="تم الحل"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Exercise Runner */}
          <div className="lg:col-span-8">
            {activeExercise && <InteractiveExerciseRunner exercise={activeExercise} />}
          </div>
        </div>
      )}
    </div>
  );
}
