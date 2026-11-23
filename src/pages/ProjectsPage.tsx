import { useEffect, useState } from 'react';
import { CheckCircle2, Play, RotateCcw, XCircle } from 'lucide-react';
import { CodeMirrorEditor } from '../components/CodeMirrorEditor';
import { AlertBanner, Button, Card, EmptyState } from '../components/ui/Primitives';
import { pythonRuntime } from '../services';
import { useAppStore } from '../store/useAppStore';
import {
  buildProjectTestScript,
  sanitizePythonErrorMessage,
  type ProjectTestExecution,
} from '../utils/projectEvaluator';

export function ProjectsPage() {
  const projects = useAppStore((s) => s.projects);
  const projectSubmissions = useAppStore((s) => s.projectSubmissions);
  const saveProjectAttempt = useAppStore((s) => s.saveProjectAttempt);
  const profile = useAppStore((s) => s.profile);
  const enterDemo = useAppStore((s) => s.enterDemo);
  const settings = useAppStore((s) => s.settings);

  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? '');
  const selectedProject = projects.find((p) => p.id === selectedId) ?? projects[0] ?? null;

  const [code, setCode] = useState<string>(selectedProject?.starterCode ?? '');
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<ProjectTestExecution[] | null>(null);

  useEffect(() => {
    if (selectedProject) {
      const latestSub = projectSubmissions.find((s) => s.projectId === selectedProject.id);
      setCode(latestSub?.code ?? selectedProject.starterCode);
      setTestResults(latestSub?.results ?? null);
    }
  }, [selectedProject?.id]);

  if (!selectedProject) {
    return (
      <EmptyState
        title="لا توجد مشاريع متاحة حاليًا"
        description="لم يتم تحميل المشاريع التطبيقية بعد."
      />
    );
  }

  const passedProjectIds = new Set(
    projectSubmissions.filter((s) => s.passed).map((s) => s.projectId)
  );

  const handleRunProjectTests = async () => {
    setRunningTests(true);
    setTestResults(null);
    try {
      if (!profile) {
        await enterDemo('learner');
      }

      const results: ProjectTestExecution[] = [];
      for (const tc of selectedProject.testCases) {
        const script = buildProjectTestScript(code, tc);
        const exec = await pythonRuntime.run(script);
        const passed =
          !exec.stderr.trim() && exec.stdout.includes(`__TEST_PASSED__:${tc.id}`);
        results.push({
          testId: tc.id,
          descriptionAr: tc.descriptionAr,
          passed,
          error: passed ? undefined : sanitizePythonErrorMessage(exec.stderr || 'فشل التحقق من النتيجة'),
        });
      }

      setTestResults(results);
      await saveProjectAttempt(selectedProject.id, code, results);
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#181826]">
        <div className="grid lg:grid-cols-12">
          <div className="lg:col-span-8 p-6 flex flex-col justify-center space-y-2">
            <h2 className="text-2xl font-bold text-white">معرض المشاريع العملية</h2>
            <p className="text-sm text-[#A1A1B5] leading-relaxed">
              6 مشاريع برمجية متدرجة يتم تقييمها باختبارات Python حقيقية حتمية عبر Pyodide، دون
              اعتماد على تقييم وهمي.
            </p>
          </div>
          <div className="lg:col-span-4 h-40 lg:h-auto">
            <img
              src="/src/assets/images/projects_workshop_1795462947290.jpg"
              alt="ورشة المشاريع التطبيقية في بايتون بالعربية"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Project Cards Selector */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProject.id;
          const isPassed = passedProjectIds.has(proj.id);
          return (
            <button
              key={proj.id}
              type="button"
              onClick={() => setSelectedId(proj.id)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-right transition-colors ${
                isSelected
                  ? 'border-[#8B5CF6] bg-[#272338]'
                  : 'border-white/[0.08] bg-[#181826] hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#A1A1B5]">
                <span>{proj.difficulty}</span>
                <span className="font-mono text-[#F59E0B] tabular-nums">+{proj.xpReward} XP</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{proj.titleAr}</span>
                {isPassed && <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />}
              </div>
              <div className="mt-1 text-xs font-mono text-[#A1A1B5]">{proj.titleEn}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Project Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5 space-y-5">
          <div>
            <div className="text-xs text-[#A1A1B5] tabular-nums">
              <span>{selectedProject.titleEn}</span>
              <span aria-hidden="true"> · </span>
              <span>المستوى المقترح: {selectedProject.levelRequired}</span>
            </div>
            <h3 className="mt-1 text-xl font-bold text-white">{selectedProject.titleAr}</h3>
            <p className="mt-2 text-sm text-[#D4D4E0] leading-relaxed">
              {selectedProject.goalAr}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">المتطلبات البرمجية</h4>
            <ul className="space-y-1.5 text-xs text-[#A1A1B5] list-disc pr-4">
              {selectedProject.requirementsAr.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">تلميحات التنفيذ</h4>
            <ul className="space-y-1.5 text-xs text-[#FDE68A] list-disc pr-4">
              {selectedProject.hintsAr.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </div>

          {testResults && (
            <div className="space-y-2.5 border-t border-white/[0.08] pt-4">
              <h4 className="text-sm font-semibold text-white">نتائج الاختبارات الآلية</h4>
              {testResults.map((r) => (
                <div
                  key={r.testId}
                  className={`rounded-lg border p-3 text-xs ${
                    r.passed
                      ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#DCFCE7]'
                      : 'border-red-500/30 bg-red-500/10 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {r.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    )}
                    <span>{r.descriptionAr}</span>
                  </div>
                  {r.error && (
                    <pre className="code-ltr mt-2 whitespace-pre-wrap font-mono text-[11px] opacity-90">
                      {r.error}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-base font-semibold text-white">محرر المشروع والاختبار</h4>
            <div className="flex items-center gap-2">
              <Button onClick={handleRunProjectTests} loading={runningTests}>
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>تشغيل الاختبارات وتقييم الحل</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setCode(selectedProject.starterCode);
                  setTestResults(null);
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>استعادة القالب</span>
              </Button>
            </div>
          </div>

          <CodeMirrorEditor
            value={code}
            onChange={setCode}
            onRunShortcut={handleRunProjectTests}
            fontSize={settings.editorFontSize}
            minHeight="360px"
            ariaLabel={`محرر مشروع ${selectedProject.titleAr}`}
          />

          <AlertBanner
            tone="info"
            title="تقييم حتمي عبر اختبارات وحدة Python"
            description="يتم تنفيذ الحل داخل Pyodide والتحقق من كل متطلب برمجي بحالات اختبار صريحة."
          />
        </Card>
      </div>
    </div>
  );
}
