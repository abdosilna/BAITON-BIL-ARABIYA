import { Award, BookOpen, Code2, Layers, ShieldAlert, Users } from 'lucide-react';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';

interface AdminDashboardPageProps {
  onNavigate: (to: string) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const profile = useAppStore((s) => s.profile);
  const allProfiles = useAppStore((s) => s.allProfiles);
  const courses = useAppStore((s) => s.courses);
  const modules = useAppStore((s) => s.modules);
  const lessons = useAppStore((s) => s.lessons);
  const exercises = useAppStore((s) => s.exercises);
  const achievements = useAppStore((s) => s.achievements);
  const switchRole = useAppStore((s) => s.switchRole);

  return (
    <div className="space-y-6">
      <AlertBanner
        tone="warning"
        title="تنبيه: صلاحيات الإدارة في هذه النسخة محاكاة محلية (Local Demo Mode)"
        description="تُحفظ جميع التعديلات محليًا في متصفحك عبر IndexedDB، وليست حماية إنتاجية متعددة المستخدمين. عند ربط Supabase سيتم تطبيق سياسات RLS والتحقق الخادمي."
        action={
          profile?.role !== 'admin' ? (
            <Button size="sm" onClick={() => switchRole('admin')}>
              تفعيل دور المشرف التجريبي
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>المسارات والوحدات</span>
            <Layers className="h-4 w-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {courses.length} / {modules.length}
          </div>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>إجمالي الدروس</span>
            <BookOpen className="h-4 w-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {lessons.length}
          </div>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>التمارين التفاعلية</span>
            <Code2 className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {exercises.length}
          </div>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
            <span>الأوسمة والإنجازات</span>
            <Award className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {achievements.length}
          </div>
        </Card>
      </div>

      {/* Quick Admin Actions */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">إدارة المنهج والمحتوى</h3>
          <p className="text-xs text-[#A1A1B5]">
            إنشاء وتعديل الدروس، الوحدات، التمارين، الأسئلة، والأوسمة مع تحديث فوري للأكاديمية.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onNavigate('/admin/content')}>فتح إدارة المحتوى</Button>
          <Button variant="secondary" onClick={() => onNavigate('/settings')}>
            إعدادات النظام
          </Button>
        </div>
      </Card>

      {/* Demo Users Statistics Table */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#8B5CF6]" />
          <h3 className="text-base font-semibold text-white">
            حسابات التجربة المحلية ({allProfiles.length})
          </h3>
        </div>

        {allProfiles.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-[#A1A1B5]">
            <ShieldAlert className="h-4 w-4 text-[#F59E0B]" />
            <span>لا توجد ملفات محلية منشأة بعد.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs text-[#A1A1B5]">
                  <th className="py-2.5 font-medium">الاسم</th>
                  <th className="py-2.5 font-medium">الدور</th>
                  <th className="py-2.5 font-medium">المستوى</th>
                  <th className="py-2.5 font-medium">XP</th>
                  <th className="py-2.5 font-medium">السلسلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {allProfiles.map((p) => (
                  <tr key={p.id} className="text-[#E4E4F0]">
                    <td className="py-3 font-medium text-white">{p.displayName}</td>
                    <td className="py-3">{p.role === 'admin' ? 'مشرف تجريبي' : 'متعلم'}</td>
                    <td className="py-3 font-mono tabular-nums">{p.level}</td>
                    <td className="py-3 font-mono tabular-nums text-[#F59E0B]">{p.xp}</td>
                    <td className="py-3 font-mono tabular-nums">{p.streakDays} يوم</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
