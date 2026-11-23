/// <reference lib="webworker" />

interface PyodideInstance {
  runPythonAsync(code: string): Promise<unknown>;
  setStdout(options: { batched: (msg: string) => void }): void;
  setStderr(options: { batched: (msg: string) => void }): void;
}

interface WorkerRequest {
  id: string;
  type: 'init' | 'run';
  code?: string;
}

let pyodideInstance: PyodideInstance | null = null;
let initPromise: Promise<PyodideInstance> | null = null;

async function ensurePyodide(): Promise<PyodideInstance> {
  if (pyodideInstance) return pyodideInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const baseUrl = `${self.location.origin}/pyodide/`;
    const pyodideModule = (await import(/* @vite-ignore */ `${baseUrl}pyodide.mjs`)) as {
      loadPyodide: (config: { indexURL: string }) => Promise<PyodideInstance>;
    };
    const pyodide = await pyodideModule.loadPyodide({
      indexURL: baseUrl,
    });

    // Harden sandbox: prevent Python code from inspecting JS global window/document bridges
    await pyodide.runPythonAsync(`
import sys
# Block unsafe JS interop module access inside learner scripts
if "js" in sys.modules:
    del sys.modules["js"]
`);

    pyodideInstance = pyodide;
    return pyodide;
  })();

  return initPromise;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type, code } = event.data;

  if (type === 'init') {
    try {
      await ensurePyodide();
      self.postMessage({ id, type: 'ready' });
    } catch (error) {
      self.postMessage({
        id,
        type: 'init_error',
        error: error instanceof Error ? error.message : 'فشل تهيئة بيئة Python.',
      });
    }
    return;
  }

  if (type === 'run') {
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];
    const startTime = performance.now();

    try {
      const pyodide = await ensurePyodide();

      pyodide.setStdout({
        batched: (msg: string) => {
          stdoutLines.push(msg);
        },
      });

      pyodide.setStderr({
        batched: (msg: string) => {
          stderrLines.push(msg);
        },
      });

      // Reset isolated user namespace per execution while protecting builtins
      await pyodide.runPythonAsync(`
import sys as _sys
_sys.modules.pop("js", None)
`);

      await pyodide.runPythonAsync(code ?? '');

      const durationMs = Math.round(performance.now() - startTime);
      self.postMessage({
        id,
        type: 'result',
        stdout: stdoutLines.join('\n'),
        stderr: stderrLines.join('\n'),
        durationMs,
      });
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : String(err);
      self.postMessage({
        id,
        type: 'result',
        stdout: stdoutLines.join('\n'),
        stderr: [stderrLines.join('\n'), message].filter(Boolean).join('\n'),
        durationMs,
      });
    }
  }
};
