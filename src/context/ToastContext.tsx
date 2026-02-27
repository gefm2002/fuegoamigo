import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
};

type ToastContextValue = {
  show: (toast: Omit<Toast, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastColors(type: ToastType): { border: string; bg: string; title: string } {
  switch (type) {
    case 'success':
      return { border: 'border-green-600/40', bg: 'bg-green-600/10', title: 'text-green-400' };
    case 'error':
      return { border: 'border-accent/60', bg: 'bg-accent/10', title: 'text-accent' };
    default:
      return { border: 'border-neutral-700', bg: 'bg-neutral-900', title: 'text-secondary' };
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}-${Math.random()}`;
      const durationMs = toast.durationMs ?? 3500;
      setToasts((prev) => [...prev, { ...toast, id }]);
      window.setTimeout(() => remove(id), durationMs);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, title) => show({ type: 'success', message, title }),
      error: (message, title) => show({ type: 'error', message, title }),
      info: (message, title) => show({ type: 'info', message, title }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-3 w-[min(420px,calc(100vw-2rem))]">
        {toasts.map((t) => {
          const c = toastColors(t.type);
          return (
            <div
              key={t.id}
              className={`rounded-lg border ${c.border} ${c.bg} backdrop-blur-sm shadow-xl p-4`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {t.title && <p className={`font-display text-sm ${c.title}`}>{t.title}</p>}
                  <p className="text-secondary text-sm break-words">{t.message}</p>
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-neutral-400 hover:text-secondary transition-colors flex-shrink-0"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

