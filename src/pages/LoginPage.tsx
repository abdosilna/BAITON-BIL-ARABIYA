import React, { useState } from 'react';
import { ShieldAlert, UserCheck } from 'lucide-react';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';
import { demoEntrySchema } from '../types/schemas';

interface LoginPageProps {
  onNavigate: (to: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const enterDemo = useAppStore((s) => s.enterDemo);
  const profile = useAppStore((s) => s.profile);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? 'متعلم بايتون');
  const [selectedRole, setSelectedRole] = useState<'learner' | 'admin'>('learner');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = demoEntrySchema.safeParse({
      displayName,
      role: selectedRole,
    });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'تحقق من البيانات المدخلة.');
      return;
    }

    setLoading(true);
    try {
      await enterDemo(parsed.data.role, parsed.data.displayName);
      onNavigate(parsed.data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تعذر بدء جلسة التجربة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">بوابة الدخول التجريبية</h1>
        <p className="text-sm text-[#A1A1B5]">
          ابدأ فورًا بحساب Demo محلي دون كلمة مرور لتجربة جميع الدروس، التمارين، والمحرر.
        </p>
      </div>

      <AlertBanner
        tone="warning"
        title="ملاحظة أمان واضحة: وضع التجربة المحلي (Local Demo Mode)"
        description="لا يستخدم هذا الدخول كلمات مرور حقيقية ولا يتصل بخادم مصادقة إنتاجي. تُحفظ بياناتك وتقدمك محليًا في متصفحك (IndexedDB) حتى يتم ربط Supabase Auth في المرحلة القادمة."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="demo-display-name"
              className="mb-2 block text-sm font-medium text-[#F4F4F8]"
            >
              الاسم الظاهر في ملف المتعلم
            </label>
            <input
              id="demo-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="مثال: سارة أو أحمد"
              className="w-full rounded-xl border border-white/15 bg-[#101018] px-4 py-3 text-sm text-white placeholder:text-[#6E6E8A] focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#F4F4F8]">اختر دور الجلسة التجريبية</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedRole('learner')}
                className={`flex items-start gap-3 rounded-xl border p-4 text-right transition-colors ${
                  selectedRole === 'learner'
                    ? 'border-[#8B5CF6] bg-[#272338] text-white'
                    : 'border-white/10 bg-[#101018] text-[#A1A1B5] hover:border-white/25'
                }`}
              >
                <UserCheck className="mt-0.5 h-5 w-5 text-[#22C55E] shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white">حساب متعلم جاهز</div>
                  <div className="mt-1 text-xs text-[#A1A1B5]">
                    تعلّم المسارات، حل التمارين، وشغّل المشاريع واحفظ الـ XP.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex items-start gap-3 rounded-xl border p-4 text-right transition-colors ${
                  selectedRole === 'admin'
                    ? 'border-[#8B5CF6] bg-[#272338] text-white'
                    : 'border-white/10 bg-[#101018] text-[#A1A1B5] hover:border-white/25'
                }`}
              >
                <ShieldAlert className="mt-0.5 h-5 w-5 text-[#F59E0B] shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white">حساب إدارة تجريبي</div>
                  <div className="mt-1 text-xs text-[#A1A1B5]">
                    محاكاة محلية لإدارة المسارات والدروس والتمارين.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <AlertBanner tone="error" title="تعذر متابعة الدخول" description={errorMsg} />
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" size="lg" loading={loading} className="flex-1">
              دخول فوري بدون كلمة مرور
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('/')}
            >
              العودة للرئيسية
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
