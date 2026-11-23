import { ArrowLeft, BookOpen, Code2, Cpu, FolderGit2, ShieldCheck, Terminal } from 'lucide-react';
import { Button, Card } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';

interface LandingPageProps {
  onNavigate: (to: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const courses = useAppStore((s) => s.courses);
  const profile = useAppStore((s) => s.profile);
  const enterDemo = useAppStore((s) => s.enterDemo);

  const handleQuickStart = async () => {
    if (!profile) {
      await enterDemo('learner');
    }
    onNavigate('/dashboard');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="text-xs font-medium text-[#A1A1B5]">
              <span>BAITON BIL ARABIYA</span>
              <span aria-hidden="true"> · </span>
              <span>منصة تعليم Python التفاعلية</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white [text-wrap:balance]">
              تعلّم لغة Python بالعربية من الصفر حتى بناء مشاريع حقيقية
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[#A1A1B5]">
              بيئة تعليمية متكاملة تجمع بين 13 مستوى منهجيًا، ومحرر CodeMirror 6 الاحترافي، وتشغيل
              Python فعليًا داخل متصفحك عبر Pyodide Web Worker دون إعدادات معقدة.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" onClick={handleQuickStart}>
                <span>ابدأ التعلم الآن (وضع التجربة)</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate('/playground')}
              >
                <Terminal className="h-4 w-4" aria-hidden="true" />
                <span>تجربة محرر Python</span>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-6 text-sm">
              <div>
                <div className="text-xl font-bold text-white font-mono tabular-nums">13</div>
                <div className="text-xs text-[#A1A1B5]">مسارًا تعليميًا متدرجًا</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#22C55E] font-mono tabular-nums">8</div>
                <div className="text-xs text-[#A1A1B5]">أنماط تمارين تفاعلية</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#F59E0B] font-mono tabular-nums">6</div>
                <div className="text-xs text-[#A1A1B5]">مشاريع باختبارات آلية</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#181826] min-h-[280px]">
              <img
                src="/src/assets/images/hero_python_studio_1795462945991.jpg"
                alt="رسم معماري لبيئة تعلم لغة Python في منصة بايتون بالعربية"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101018]/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#E4E4F0]">
                <span>تشغيل Python فوري داخل المتصفح (Pyodide WASM)</span>
                <span className="font-mono text-[#8B5CF6]">Local Demo Mode</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">منظومة تعلم عملية متكاملة</h2>
            <p className="mt-1 text-sm text-[#A1A1B5]">
              كل أداة داخل المنصة مصممة لتقليل الفجوة بين الفهم النظري وكتابة الشيفرة الفعلية.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: 'منهج عربي متكامل (Level 0 - 12)',
              desc: 'شروحات عربية واضحة مع إبقاء المصطلحات البرمجية بالإنجليزية، وتحليل سطر بسطر وأخطاء شائعة.',
            },
            {
              icon: Code2,
              title: 'محرر CodeMirror 6 + Pyodide',
              desc: 'كتابة وتشغيل Python في Web Worker معزول لا يجمّد الواجهة، مع دعم Stop و Reset والتنبيه للأخطاء.',
            },
            {
              icon: Cpu,
              title: 'معلم ذكي بأربعة أوضاع',
              desc: 'يعمل حاليًا عبر MockAIProvider التجريبي وجاهز معماريًا لربط Gemini و OpenAI لاحقًا.',
            },
            {
              icon: FolderGit2,
              title: 'مشاريع عملية باختبارات آلية',
              desc: '6 مشاريع متدرجة يتم تقييم حلولها باختبارات Python حقيقية حتمية دون تقييم وهمي.',
            },
            {
              icon: ShieldCheck,
              title: 'تخزين محلي ومعمارية معزولة',
              desc: 'حفظ تقدمك وإنجازاتك محليًا في IndexedDB عبر DatabaseAdapter قابل للانتقال إلى Supabase.',
            },
            {
              icon: Terminal,
              title: 'دعم صوتي + نظام تحفيز متوازن',
              desc: 'قراءة الدروس صوتيًا مع بديل نصي دائم، ونظام XP وأوسمة محمي من التكرار.',
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title} className="space-y-3">
                <Icon className="h-6 w-6 text-[#8B5CF6]" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                <p className="text-sm text-[#A1A1B5] leading-relaxed">{feat.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">خريطة المستويات (0 إلى 12)</h2>
            <p className="mt-1 text-sm text-[#A1A1B5]">
              مسار واضح يبدأ من مفهوم الخوارزمية ويصل إلى بناء الأنظمة والاختبارات.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/paths')}>
            استعراض كل المسارات
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((course) => (
            <Card key={course.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#A1A1B5]">
                  <span className="font-mono text-[#8B5CF6]">LEVEL {course.levelNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{course.estimatedHours} ساعات</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-white">{course.titleAr}</h3>
                <p className="mt-1 text-xs font-mono text-[#A1A1B5]">{course.titleEn}</p>
                <p className="mt-2 text-sm text-[#A1A1B5] leading-relaxed">
                  {course.descriptionAr}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/paths/${course.id}`)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8B5CF6] hover:text-[#A78BFA]"
              >
                <span>فتح تفاصيل المسار</span>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
