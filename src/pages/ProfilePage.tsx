import React, { useState } from 'react';
import { Award, Download, Save, User } from 'lucide-react';
import { AlertBanner, Button, Card, EmptyState } from '../components/ui/Primitives';
import { dbAdapter } from '../services';
import { useAppStore } from '../store/useAppStore';
import { profileUpdateSchema } from '../types/schemas';
import { formatArabicDate } from '../utils/formatters';
import { getLevelProgress } from '../utils/gamification';

interface ProfilePageProps {
  onNavigate: (to: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const profile = useAppStore((s) => s.profile);
  const achievements = useAppStore((s) => s.achievements);
  const userAchievements = useAppStore((s) => s.userAchievements);
  const updateProfileInfo = useAppStore((s) => s.updateProfileInfo);
  const addToast = useAppStore((s) => s.addToast);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [dailyGoalXp, setDailyGoalXp] = useState(profile?.dailyGoalXp ?? 80);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return (
      <EmptyState
        title="لا يوجد ملف شخصي نشط"
        description="سجّل الدخول في وضع التجربة المحلي لعرض وتعديل بيانات ملفك الشخصي."
        action={<Button onClick={() => onNavigate('/login')}>دخول التجربة</Button>}
      />
    );
  }

  const levelInfo = getLevelProgress(profile.xp);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = profileUpdateSchema.safeParse({
      displayName,
      bio,
      dailyGoalXp: Number(dailyGoalXp),
    });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'تحقق من الحقول المدخلة.');
      return;
    }
    setSaving(true);
    try {
      await updateProfileInfo(
        parsed.data.displayName,
        parsed.data.bio,
        parsed.data.dailyGoalXp
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = async () => {
    const data = await dbAdapter.exportUserData(profile.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baiton-progress-${profile.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'تم تصدير نسخة من بيانات تقدمك' });
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#272338] text-[#8B5CF6] shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile.displayName}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#A1A1B5]">
              <span>@{profile.username}</span>
              <span aria-hidden="true">·</span>
              <span>الدور: {profile.role === 'admin' ? 'إدارة تجريبية' : 'متعلم'}</span>
              <span aria-hidden="true">·</span>
              <span>انضم: {formatArabicDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportJson}>
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>تصدير التقدم (JSON)</span>
        </Button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <h3 className="mb-4 text-base font-semibold text-white">تعديل بيانات الملف</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-xs text-[#A1A1B5]">
                الاسم الظاهر
              </label>
              <input
                id="profile-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#101018] px-4 py-2.5 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-bio" className="mb-1.5 block text-xs text-[#A1A1B5]">
                النبذة والهدف الشخصي
              </label>
              <textarea
                id="profile-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#101018] px-4 py-2.5 text-sm text-white focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-goal" className="mb-1.5 block text-xs text-[#A1A1B5]">
                الهدف اليومي (XP)
              </label>
              <input
                id="profile-goal"
                type="number"
                min={20}
                max={500}
                step={10}
                value={dailyGoalXp}
                onChange={(e) => setDailyGoalXp(Number(e.target.value))}
                className="w-40 rounded-xl border border-white/15 bg-[#101018] px-4 py-2.5 text-sm font-mono text-white focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            {errorMsg && <AlertBanner tone="error" title="خطأ في الحفظ" description={errorMsg} />}

            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>حفظ التغييرات</span>
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-semibold text-white">ملخص المستوى والأوسمة</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-white/[0.08] bg-[#101018] p-3">
              <div className="text-xl font-bold text-[#F59E0B] font-mono tabular-nums">
                {profile.xp}
              </div>
              <div className="text-xs text-[#A1A1B5]">إجمالي XP</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#101018] p-3">
              <div className="text-xl font-bold text-white font-mono tabular-nums">
                Lv.{levelInfo.level}
              </div>
              <div className="text-xs text-[#A1A1B5]">المستوى الحالي</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-medium text-[#A1A1B5]">الأوسمة المكتسبة ({userAchievements.length})</h4>
            {userAchievements.length === 0 ? (
              <p className="text-xs text-[#A1A1B5]">لم تكتسب أوسمة بعد.</p>
            ) : (
              <div className="space-y-2">
                {userAchievements.map((ua) => {
                  const ach = achievements.find((a) => a.id === ua.achievementId);
                  return (
                    <div
                      key={ua.id}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#101018] px-3 py-2 text-xs text-white"
                    >
                      <Award className="h-4 w-4 text-[#F59E0B] shrink-0" />
                      <span>{ach?.titleAr ?? ua.achievementId}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
