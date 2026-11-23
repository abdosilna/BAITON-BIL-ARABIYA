import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Search } from 'lucide-react';
import { Card, EmptyState, ProgressBar } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';
import { getCourseCompletionPercentage } from '../utils/formatters';

interface LearningPathsPageProps {
  onNavigate: (to: string) => void;
}

export function LearningPathsPage({ onNavigate }: LearningPathsPageProps) {
  const courses = useAppStore((s) => s.courses);
  const lessons = useAppStore((s) => s.lessons);
  const progress = useAppStore((s) => s.progress);

  const [query, setQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'الكل' | 'مبتدئ' | 'متوسط' | 'متقدم'>('الكل');

  const completedIds = useMemo(
    () => new Set(progress.filter((p) => p.completed).map((p) => p.lessonId)),
    [progress]
  );

  const lessonToCourse = useMemo(() => {
    const map = new Map<string, string>();
    lessons.forEach((l) => map.set(l.id, l.courseId));
    return map;
  }, [lessons]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesDiff = difficultyFilter === 'الكل' || c.difficulty === difficultyFilter;
      const q = query.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.titleAr.toLowerCase().includes(q) ||
        c.titleEn.toLowerCase().includes(q) ||
        c.descriptionAr.toLowerCase().includes(q);
      return matchesDiff && matchesSearch;
    });
  }, [courses, difficultyFilter, query]);

  return (
    <div className="space-y-6">
      {/* Visual Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#181826]">
        <div className="grid lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 flex flex-col justify-center space-y-2">
            <h2 className="text-2xl font-bold text-white">الأكاديمية التعليمية (Level 0 - 12)</h2>
            <p className="text-sm text-[#A1A1B5] leading-relaxed">
              13 مسارًا متكاملًا من المبادئ الأولى وحتى بناء المشاريع الحقيقية واختبارها. كل
              مسار يحتوي على وحدات، دروس تطبيقية، تمارين تفاعلية، واختبار نهائي.
            </p>
          </div>
          <div className="lg:col-span-5 h-44 lg:h-auto">
            <img
              src="/src/assets/images/academy_tracks_banner_1795462947122.jpg"
              alt="خريطة المسارات التعليمية في بايتون بالعربية"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1B5]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مسار أو مفهوم (مثل Loops, OOP, JSON)..."
            aria-label="البحث في المسارات"
            className="w-full rounded-xl border border-white/10 bg-[#181826] pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-[#6E6E8A] focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-[#181826] p-1 border border-white/[0.08]">
          {(['الكل', 'مبتدئ', 'متوسط', 'متقدم'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                difficultyFilter === diff
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#A1A1B5] hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title="لا توجد مسارات مطابقة للبحث"
          description="جرّب تغيير كلمة البحث أو إعادة ضبط فلتر المستوى."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredCourses.map((course) => {
            const courseLessons = lessons.filter((l) => l.courseId === course.id);
            const pct = getCourseCompletionPercentage(
              course.id,
              courseLessons.length,
              completedIds,
              lessonToCourse
            );

            return (
              <Card key={course.id} className="flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#A1A1B5]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#8B5CF6]">
                        LEVEL {course.levelNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{course.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{courseLessons.length} دروس</span>
                    </div>
                    {pct === 100 && (
                      <span className="inline-flex items-center gap-1 text-[#22C55E] font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>مكتمل</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">{course.titleAr}</h3>
                    <p className="text-xs font-mono text-[#A1A1B5] mt-0.5">{course.titleEn}</p>
                  </div>

                  <p className="text-sm text-[#A1A1B5] leading-relaxed">
                    {course.descriptionAr}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                  <ProgressBar
                    value={pct}
                    color={pct === 100 ? 'success' : 'primary'}
                    label="نسبة الإكمال"
                  />
                  <button
                    type="button"
                    onClick={() => onNavigate(`/paths/${course.id}`)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#8B5CF6] hover:text-[#A78BFA]"
                  >
                    <span>عرض الوحدات والدروس</span>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
