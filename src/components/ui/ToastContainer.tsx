import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-50 flex max-w-sm flex-col gap-2 md:bottom-6"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-[#22C55E] shrink-0" />
          ) : toast.type === 'error' || toast.type === 'warning' ? (
            <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0" />
          ) : (
            <Info className="h-5 w-5 text-[#8B5CF6] shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#181826] p-3.5 shadow-lg"
          >
            {icon}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#F4F4F8]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[#A1A1B5]">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="إغلاق التنبيه"
              className="rounded p-1 text-[#A1A1B5] hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
