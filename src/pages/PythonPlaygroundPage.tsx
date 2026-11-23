import { useEffect, useState } from 'react';
import {
  BookmarkPlus,
  Eraser,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Square,
  Trash2,
} from 'lucide-react';
import { CodeMirrorEditor } from '../components/CodeMirrorEditor';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import { PLAYGROUND_EXAMPLES } from '../data/playgroundExamples';
import { pythonRuntime } from '../services';
import {
  PYTHON_ENVIRONMENT_INFO,
  type PythonExecutionResult,
  type PythonRuntimeStatus,
} from '../services/python/PythonRuntime';
import { useAppStore } from '../store/useAppStore';
import { snippetSaveSchema } from '../types/schemas';

export function PythonPlaygroundPage() {
  const settings = useAppStore((s) => s.settings);
  const snippets = useAppStore((s) => s.playgroundSnippets);
  const saveSnippet = useAppStore((s) => s.saveSnippet);
  const deleteSnippet = useAppStore((s) => s.deleteSnippet);
  const recordPlaygroundRun = useAppStore((s) => s.recordPlaygroundRun);

  const [code, setCode] = useState<string>(PLAYGROUND_EXAMPLES[0].code);
  const [runtimeStatus, setRuntimeStatus] = useState<PythonRuntimeStatus>(() =>
    pythonRuntime.getStatus()
  );
  const [output, setOutput] = useState<PythonExecutionResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [snippetTitle, setSnippetTitle] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = pythonRuntime.onStatusChange(setRuntimeStatus);
    void pythonRuntime.initialize();
    return unsub;
  }, []);

  const handleRun = async () => {
    const res = await pythonRuntime.run(code);
    setOutput(res);
    if (!res.aborted) {
      await recordPlaygroundRun();
    }
  };

  const handleStop = () => {
    pythonRuntime.stop();
  };

  const handleResetRuntime = () => {
    pythonRuntime.reset();
    setOutput(null);
  };

  const handleClearOutput = () => {
    setOutput(null);
  };

  const handleSaveSnippet = async () => {
    setSaveError(null);
    const parsed = snippetSaveSchema.safeParse({
      titleAr: snippetTitle,
      code,
    });
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? 'بيانات الحفظ غير صالحة.');
      return;
    }
    await saveSnippet(parsed.data.titleAr, parsed.data.code);
    setSnippetTitle('');
  };

  const statusLabelAr: Record<PythonRuntimeStatus, string> = {
    idle: 'جاهز للتهيئة',
    initializing: 'جارٍ تحميل بيئة Python...',
    ready: 'بيئة Python جاهزة',
    running: 'قيد التنفيذ...',
    error: 'خطأ في تهيئة البيئة',
  };

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-y-auto bg-[#101018] p-4 sm:p-6 space-y-4'
          : 'space-y-6'
      }
    >
      {/* Toolbar */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1B5]">
            <span>{PYTHON_ENVIRONMENT_INFO.runtimeName}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#F4F4F8]">{statusLabelAr[runtimeStatus]}</span>
          </div>
          <h2 className="text-xl font-bold text-white">Python Playground التفاعلي</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleRun}
            loading={runtimeStatus === 'running'}
            variant="primary"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            <span>Run (تشغيل)</span>
          </Button>

          <Button
            onClick={handleStop}
            disabled={runtimeStatus !== 'running'}
            variant="danger"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            <span>Stop (إيقاف)</span>
          </Button>

          <Button onClick={handleResetRuntime} variant="secondary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset</span>
          </Button>

          <Button onClick={handleClearOutput} variant="ghost">
            <Eraser className="h-4 w-4" aria-hidden="true" />
            <span>Clear Output</span>
          </Button>

          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            aria-label={isFullscreen ? 'إنهاء ملء الشاشة' : 'وضع ملء الشاشة'}
            className="rounded-lg border border-white/10 bg-[#272338] p-2.5 text-[#F4F4F8] hover:bg-[#322D47]"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </Card>

      {/* Main Editor + Console Split */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="playground-examples" className="text-xs text-[#A1A1B5]">
              تحميل مثال جاهز:
            </label>
            <select
              id="playground-examples"
              onChange={(e) => {
                const ex = PLAYGROUND_EXAMPLES.find((item) => item.id === e.target.value);
                if (ex) setCode(ex.code);
              }}
              defaultValue={PLAYGROUND_EXAMPLES[0].id}
              className="rounded-lg border border-white/10 bg-[#181826] px-3 py-1.5 text-xs text-white"
            >
              {PLAYGROUND_EXAMPLES.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.categoryAr} — {ex.titleAr}
                </option>
              ))}
            </select>
          </div>

          <CodeMirrorEditor
            value={code}
            onChange={setCode}
            onRunShortcut={handleRun}
            fontSize={settings.editorFontSize}
            minHeight="340px"
            ariaLabel="محرر بايتون الرئيسي"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#A1A1B5]">
            <span>اختصار التشغيل السريع: Ctrl + Enter</span>
            <span>التشغيل معزول في Web Worker ولا يمس الخادم</span>
          </div>
        </div>

        {/* Console Output */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex-1 flex flex-col justify-between gap-4 bg-[#0D0D14]">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-semibold text-white font-mono">
                  Console (stdout / stderr)
                </span>
                {output && (
                  <span className="text-[11px] font-mono tabular-nums text-[#A1A1B5]">
                    {output.durationMs} ms
                  </span>
                )}
              </div>

              <div
                data-testid="playground-console"
                className="code-ltr min-h-[260px] max-h-[380px] overflow-y-auto font-mono text-sm leading-relaxed"
              >
                {!output ? (
                  <p className="text-xs text-[#6E6E8A]">
                    اضغط Run لتنفيذ الكود وعرض المخرجات هنا...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {output.stdout && (
                      <pre className="whitespace-pre-wrap text-[#22C55E]">{output.stdout}</pre>
                    )}
                    {output.stderr && (
                      <pre className="whitespace-pre-wrap text-red-400">{output.stderr}</pre>
                    )}
                    {!output.stdout && !output.stderr && (
                      <p className="text-xs text-[#A1A1B5]">
                        اكتمل التنفيذ بنجاح (لا توجد مخرجات مطبوعة).
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Save Snippet Bar */}
            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="اسم الكود للحفظ محليًا..."
                  aria-label="اسم الكود المحفوظ"
                  className="flex-1 rounded-lg border border-white/10 bg-[#181826] px-3 py-2 text-xs text-white placeholder:text-[#6E6E8A] focus:border-[#8B5CF6] focus:outline-none"
                />
                <Button size="sm" variant="secondary" onClick={handleSaveSnippet}>
                  <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>حفظ</span>
                </Button>
              </div>
              {saveError && <p className="text-xs text-red-400">{saveError}</p>}
            </div>
          </Card>
        </div>
      </div>

      {/* Saved Snippets + Environment Limits */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-6 space-y-3">
          <h3 className="text-base font-semibold text-white">الأكواد المحفوظة ({snippets.length})</h3>
          {snippets.length === 0 ? (
            <p className="text-sm text-[#A1A1B5]">
              لم تحفظ أي كود بعد. اكتب برنامجك ثم احفظه للرجوع إليه لاحقًا.
            </p>
          ) : (
            <div className="space-y-2">
              {snippets.map((snip) => (
                <div
                  key={snip.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#101018] p-3"
                >
                  <button
                    type="button"
                    onClick={() => setCode(snip.code)}
                    className="text-right text-sm font-medium text-white hover:text-[#8B5CF6] truncate"
                  >
                    {snip.titleAr}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSnippet(snip.id)}
                    aria-label={`حذف ${snip.titleAr}`}
                    className="rounded p-1.5 text-[#A1A1B5] hover:bg-red-500/15 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-6 space-y-3">
          <h3 className="text-base font-semibold text-white">حدود البيئة والحزم المتاحة</h3>
          <AlertBanner
            tone="info"
            title={PYTHON_ENVIRONMENT_INFO.executionModel}
            description={`الحزم القياسية الجاهزة: ${PYTHON_ENVIRONMENT_INFO.availableStdlib.join(', ')}`}
          />
          <ul className="space-y-1.5 text-xs text-[#A1A1B5] list-disc pr-4">
            {PYTHON_ENVIRONMENT_INFO.limitationsAr.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
