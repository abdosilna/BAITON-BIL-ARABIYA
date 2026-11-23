import React, { useState } from 'react';
import { Bot, Bug, Code2, GraduationCap, MessageSquarePlus, Send, Sparkles } from 'lucide-react';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import { aiService } from '../services';
import { useAppStore } from '../store/useAppStore';
import type { AIMode } from '../types/database';
import { aiPromptSchema } from '../types/schemas';

const AI_MODES: Array<{
  id: AIMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'teacher', label: 'وضع المعلم (Teacher)', desc: 'شرح المفاهيم وتبسيط الدروس', icon: GraduationCap },
  { id: 'debugging', label: 'تحليل الأخطاء (Debugging)', desc: 'فحص رسائل الخطأ واقتراح الحل', icon: Bug },
  { id: 'practice', label: 'توليد التمارين (Practice)', desc: 'إنشاء تحديات تناسب مستواك', icon: Sparkles },
  { id: 'explain', label: 'شرح الكود (Explain Code)', desc: 'تحليل الشيفرة سطرًا بسطر', icon: Code2 },
];

export function AITutorPage() {
  const profile = useAppStore((s) => s.profile);
  const conversations = useAppStore((s) => s.aiConversations);
  const sendAIMessage = useAppStore((s) => s.sendAIMessage);
  const enterDemo = useAppStore((s) => s.enterDemo);

  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [mode, setMode] = useState<AIMode>('teacher');
  const [prompt, setPrompt] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const providerStatus = aiService.getProviderStatus();
  const activeConversation = conversations.find((c) => c.id === selectedConvId) ?? null;

  const handleSend = async (e?: React.FormEvent, overridePrompt?: string) => {
    e?.preventDefault();
    setErrorMsg(null);
    const text = (overridePrompt ?? prompt).trim();

    const parsed = aiPromptSchema.safeParse({ prompt: text });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'يرجى كتابة سؤال صالح.');
      return;
    }

    setSending(true);
    try {
      if (!profile) {
        await enterDemo('learner');
      }
      const updated = await sendAIMessage(
        selectedConvId,
        parsed.data.prompt,
        mode,
        codeContext.trim() || undefined
      );
      setSelectedConvId(updated.id);
      if (!overridePrompt) setPrompt('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تعذر الحصول على رد من المعلم الذكي.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <AlertBanner
        tone="warning"
        title={`حالة مزود الذكاء الاصطناعي: Not Connected · الوضع: ${providerStatus.modeLabel}`}
        description={providerStatus.noticeAr}
      />

      {/* Mode Selector */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AI_MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-right transition-colors ${
                active
                  ? 'border-[#8B5CF6] bg-[#272338] text-white'
                  : 'border-white/[0.08] bg-[#181826] text-[#A1A1B5] hover:text-white'
              }`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-[#8B5CF6]' : ''}`} />
              <div>
                <div className="text-sm font-semibold text-white">{m.label}</div>
                <div className="mt-0.5 text-xs text-[#A1A1B5]">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Conversation History */}
        <Card className="lg:col-span-4 space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">المحادثات المحلية</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedConvId(null)}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>محادثة جديدة</span>
            </Button>
          </div>

          {conversations.length === 0 ? (
            <p className="text-xs text-[#A1A1B5]">
              لا توجد محادثات سابقة بعد. ابدأ بسؤال المعلم التجريبي.
            </p>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setMode(conv.mode);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-right text-xs transition-colors ${
                    selectedConvId === conv.id
                      ? 'border-[#8B5CF6] bg-[#272338] text-white'
                      : 'border-white/[0.06] bg-[#101018] text-[#A1A1B5] hover:text-white'
                  }`}
                >
                  <div className="truncate font-medium">{conv.titleAr}</div>
                  <div className="mt-0.5 text-[11px] opacity-75">
                    {conv.messages.length} رسائل
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-8 flex flex-col justify-between gap-4 min-h-[460px]">
          <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
            {!activeConversation ? (
              <div className="py-10 text-center space-y-4">
                <Bot className="mx-auto h-8 w-8 text-[#8B5CF6]" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">
                    مرحبًا بك في المعلم الذكي (MockAIProvider)
                  </h3>
                  <p className="text-xs text-[#A1A1B5] max-w-md mx-auto">
                    اختر الوضع المناسب من الأعلى، ويمكنك إرفاق كود Python لتحليله أو شرحه حسب
                    مستواك الحالي ({profile ? `المستوى ${profile.level}` : 'مبتدئ'}).
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {[
                    'اشرح لي الحلقات التكرارية for و while',
                    'لماذا يظهر خطأ ZeroDivisionError؟',
                    'أعطني تمرينًا على الدوال',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(undefined, q)}
                      className="rounded-lg border border-white/10 bg-[#101018] px-3 py-1.5 text-xs text-[#D4D4E0] hover:border-[#8B5CF6]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#272338] text-white border border-white/10'
                      : 'bg-[#101018] text-[#E4E4F0] border border-white/[0.06]'
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#A1A1B5]">
                    <span>
                      {msg.role === 'user'
                        ? profile?.displayName ?? 'أنت'
                        : 'المعلم الذكي (Mock / Demo)'}
                    </span>
                    <span>{msg.mode}</span>
                  </div>
                  <div className="whitespace-pre-line">{msg.content}</div>
                  {msg.codeContext && (
                    <pre className="code-ltr mt-2 rounded-lg border border-white/10 bg-[#0A0A10] p-2.5 text-xs font-mono text-[#A78BFA] overflow-x-auto">
                      {msg.codeContext}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="space-y-3 border-t border-white/[0.08] pt-4">
            <textarea
              rows={2}
              dir="ltr"
              value={codeContext}
              onChange={(e) => setCodeContext(e.target.value)}
              placeholder="# اختياري: الصق كود Python هنا لشرحه أو تحليل أخطائه..."
              aria-label="سياق كود Python اختياري"
              className="w-full rounded-xl border border-white/10 bg-[#0D0D14] px-3.5 py-2 text-xs font-mono text-[#E4E4F0] placeholder:text-[#6E6E8A] focus:border-[#8B5CF6] focus:outline-none"
            />

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اكتب سؤالك بالعربية للمعلم الذكي..."
                aria-label="سؤال للمعلم الذكي"
                className="flex-1 rounded-xl border border-white/15 bg-[#101018] px-4 py-2.5 text-sm text-white placeholder:text-[#6E6E8A] focus:border-[#8B5CF6] focus:outline-none"
              />
              <Button type="submit" loading={sending}>
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>إرسال</span>
              </Button>
            </div>

            {errorMsg && (
              <AlertBanner tone="error" title="تنبيه" description={errorMsg} />
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
