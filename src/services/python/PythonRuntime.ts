export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  aborted: boolean;
}

export type PythonRuntimeStatus = 'idle' | 'initializing' | 'ready' | 'running' | 'error';

export const PYTHON_ENVIRONMENT_INFO = {
  runtimeName: 'Pyodide (CPython WebAssembly)',
  executionModel: 'Isolated Web Worker (Client-Side Only)',
  defaultTimeoutMs: 5000,
  availableStdlib: ['math', 'random', 'json', 'datetime', 'statistics', 'collections', 'itertools', 're', 'unittest'],
  limitationsAr: [
    'يعمل الكود بالكامل داخل متصفحك في Web Worker معزول دون لمس خادم التطبيق.',
    'الحد الأقصى لزمن التنفيذ في التشغيل الواحد هو 5 ثوانٍ لمنع تجمد الواجهة.',
    'لا يدعم دالة input() التفاعلية أو الاتصال المباشر بالشبكة أو قراءة ملفات نظام التشغيل.',
  ],
};

interface PendingExecution {
  id: string;
  resolve: (result: PythonExecutionResult) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class PythonRuntime {
  private worker: Worker | null = null;
  private status: PythonRuntimeStatus = 'idle';
  private pending: PendingExecution | null = null;
  private statusListeners = new Set<(status: PythonRuntimeStatus) => void>();
  private queue: Promise<void> = Promise.resolve();

  getStatus(): PythonRuntimeStatus {
    return this.status;
  }

  onStatusChange(listener: (status: PythonRuntimeStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(next: PythonRuntimeStatus): void {
    this.status = next;
    for (const listener of this.statusListeners) {
      listener(next);
    }
  }

  private spawnWorker(): Worker {
    const worker = new Worker(new URL('./PythonWorker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as {
        id: string;
        type: 'ready' | 'init_error' | 'result';
        stdout?: string;
        stderr?: string;
        durationMs?: number;
        error?: string;
      };

      if (data.type === 'ready') {
        if (this.status === 'initializing') {
          this.setStatus('ready');
        }
        return;
      }

      if (data.type === 'init_error') {
        this.setStatus('error');
        if (this.pending) {
          clearTimeout(this.pending.timer);
          const p = this.pending;
          this.pending = null;
          p.resolve({
            stdout: '',
            stderr: data.error ?? 'تعذر تحميل بيئة Python.',
            durationMs: 0,
            timedOut: false,
            aborted: false,
          });
        }
        return;
      }

      if (data.type === 'result' && this.pending && this.pending.id === data.id) {
        clearTimeout(this.pending.timer);
        const p = this.pending;
        this.pending = null;
        this.setStatus('ready');
        p.resolve({
          stdout: data.stdout ?? '',
          stderr: data.stderr ?? '',
          durationMs: data.durationMs ?? 0,
          timedOut: false,
          aborted: false,
        });
      }
    };

    worker.onerror = (err) => {
      this.setStatus('error');
      if (this.pending) {
        clearTimeout(this.pending.timer);
        const p = this.pending;
        this.pending = null;
        p.resolve({
          stdout: '',
          stderr: err.message || 'حدث خطأ غير متوقع في بيئة تشغيل Python.',
          durationMs: 0,
          timedOut: false,
          aborted: false,
        });
      }
    };

    return worker;
  }

  async initialize(): Promise<void> {
    if (typeof Worker === 'undefined') {
      this.setStatus('error');
      return;
    }
    if (!this.worker) {
      this.setStatus('initializing');
      this.worker = this.spawnWorker();
      this.worker.postMessage({ id: 'init', type: 'init' });
    }
  }

  async run(code: string, timeoutMs: number = PYTHON_ENVIRONMENT_INFO.defaultTimeoutMs): Promise<PythonExecutionResult> {
    const task = async (): Promise<PythonExecutionResult> => {
      if (typeof Worker === 'undefined') {
        return {
          stdout: '',
          stderr: 'متصفحك أو البيئة الحالية لا تدعم Web Workers لتشغيل Python.',
          durationMs: 0,
          timedOut: false,
          aborted: false,
        };
      }

      if (!this.worker) {
        this.setStatus('initializing');
        this.worker = this.spawnWorker();
      }

      const id = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      this.setStatus('running');

      return new Promise<PythonExecutionResult>((resolve) => {
        // First load of Pyodide WASM can take a few seconds; give extra grace if not yet ready
        const effectiveTimeout = timeoutMs + 8000;
        const timer = setTimeout(() => {
          if (this.pending && this.pending.id === id) {
            this.pending = null;
            this.terminateAndRespawn();
            resolve({
              stdout: '',
              stderr: `TimeoutError: تجاوز تنفيذ الكود الحد المسموح (${Math.round(timeoutMs / 1000)} ثوانٍ) وتم إيقافه تلقائيًا لحماية المتصفح.`,
              durationMs: timeoutMs,
              timedOut: true,
              aborted: false,
            });
          }
        }, effectiveTimeout);

        this.pending = { id, resolve, timer };
        this.worker!.postMessage({ id, type: 'run', code });
      });
    };

    const next = this.queue.then(task, task);
    this.queue = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }

  stop(): void {
    if (this.pending) {
      clearTimeout(this.pending.timer);
      const p = this.pending;
      this.pending = null;
      this.terminateAndRespawn();
      p.resolve({
        stdout: '',
        stderr: 'تم إيقاف تنفيذ الكود بناءً على طلبك.',
        durationMs: 0,
        timedOut: false,
        aborted: true,
      });
    }
  }

  reset(): void {
    if (this.pending) {
      clearTimeout(this.pending.timer);
      const p = this.pending;
      this.pending = null;
      p.resolve({
        stdout: '',
        stderr: 'تمت إعادة ضبط بيئة التشغيل.',
        durationMs: 0,
        timedOut: false,
        aborted: true,
      });
    }
    this.terminateAndRespawn();
  }

  private terminateAndRespawn(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.setStatus('initializing');
    this.worker = this.spawnWorker();
    this.worker.postMessage({ id: 'init', type: 'init' });
  }
}

export const pythonRuntime = new PythonRuntime();
