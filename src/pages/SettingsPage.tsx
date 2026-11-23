import { useState } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import { aiService, dbAdapter } from '../services';
import { useAppStore } from '../store/useAppStore';

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetLocalWorkspace = useAppStore((s) => s.resetLocalWorkspace);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const aiStatus = aiService.getProviderStatus();

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetLocalWorkspace();
      setConfirmReset(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* External Services Status (Explicit & Honest) */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold text-white">حالة مزودي الخدمات الخارجية</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.08] bg-[#101018] p-4 space-y-2">
            <div className="text-xs text-[#A1A1B5]">نظام الذكاء الاصطناعي</div>
            <div className="text-sm font-semibold text-[#F59E0B]">
              AI Provider Status: {aiStatus.connected ? 'Connected' : 'Not Connected'}
            </div>
            <div className="text-xs text-[#E4E4F0] font-mono">
              AI Mode: {aiStatus.modeLabel}
            </div>
            <p className="text-xs text-[#A1A1B5] leading-relaxed">
              لا يتم استخدام أي مفاتيح API حقيقية في الواجهة. مزودا Gemini و OpenAI جاهزان للربط
              عبر Proxy خلفي في المرحلة القادمة.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#101018] p-4 space-y-2">
            <div className="text-xs text-[#A1A1B5]">قاعدة البيانات والمصادقة</div>
            <div className="text-sm font-semibold text-[#F59E0B]">
              Supabase Status: Not Connected
            </div>
            <div className="text-xs text-[#E4E4F0] font-mono">
              Active Adapter: {dbAdapter.providerName}
            </div>
            <p className="text-xs text-[#A1A1B5] leading-relaxed">
              جميع البيانات محفوظة محليًا في متصفحك فقط عبر IndexedDB و LocalStorage للإعدادات.
            </p>
          </div>
        </div>
      </Card>

      {/* Learning & Editor Preferences */}
      <Card className="space-y-5">
        <h3 className="text-base font-semibold text-white">تفضيلات التعلم والمحرر</h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="set-goal" className="mb-1.5 block text-xs text-[#A1A1B5]">
              الهدف اليومي (XP)
            </label>
            <input
              id="set-goal"
              type="number"
              min={20}
              max={500}
              step={10}
              value={settings.dailyGoalXp}
              onChange={(e) => updateSettings({ dailyGoalXp: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/15 bg-[#101018] px-3.5 py-2 text-sm font-mono text-white"
            />
          </div>

          <div>
            <label htmlFor="set-font" className="mb-1.5 block text-xs text-[#A1A1B5]">
              حجم خط محرر CodeMirror (px)
            </label>
            <select
              id="set-font"
              value={settings.editorFontSize}
              onChange={(e) => updateSettings({ editorFontSize: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/15 bg-[#101018] px-3.5 py-2 text-sm font-mono text-white"
            >
              <option value={12}>12 px</option>
              <option value={14}>14 px (الافتراضي)</option>
              <option value={16}>16 px</option>
              <option value={18}>18 px</option>
            </select>
          </div>

          <div>
            <label htmlFor="set-speech-rate" className="mb-1.5 block text-xs text-[#A1A1B5]">
              سرعة القراءة الصوتية الافتراضية
            </label>
            <select
              id="set-speech-rate"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/15 bg-[#101018] px-3.5 py-2 text-sm font-mono text-white"
            >
              <option value={0.8}>0.8x (بطيئة)</option>
              <option value={1}>1.0x (طبيعية)</option>
              <option value={1.2}>1.2x (سريعة)</option>
              <option value={1.5}>1.5x (سريعة جدًا)</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101018] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-white">محاكاة انقطاع خدمة AI</div>
              <div className="text-xs text-[#A1A1B5]">لاختبار تعامل الواجهة مع أخطاء الاتصال</div>
            </div>
            <input
              type="checkbox"
              aria-label="محاكاة انقطاع خدمة AI"
              checked={settings.simulateAiOffline}
              onChange={(e) => updateSettings({ simulateAiOffline: e.target.checked })}
              className="h-4 w-4 accent-[#8B5CF6]"
            />
          </div>
        </div>
      </Card>

      {/* Reset Workspace */}
      <Card className="space-y-4 border-red-500/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-red-400 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-white">إعادة ضبط البيانات المحلية</h3>
            <p className="mt-1 text-xs text-[#A1A1B5]">
              يعيد تهيئة قاعدة البيانات المحلية IndexedDB وإعادة المحتوى المنهجي الافتراضي،
              ويحذف التقدم التجريبي المحفوظ على هذا المتصفح.
            </p>
          </div>
        </div>

        {!confirmReset ? (
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>إعادة ضبط مساحة العمل المحلية</span>
          </Button>
        ) : (
          <AlertBanner
            tone="error"
            title="تأكيد حذف التقدم المحلي وإعادة التهيئة"
            description="لا يمكن التراجع عن هذا الإجراء بعد التنفيذ."
            action={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="danger" loading={resetting} onClick={handleReset}>
                  نعم، إعادة الضبط
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setConfirmReset(false)}>
                  إلغاء
                </Button>
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
}
