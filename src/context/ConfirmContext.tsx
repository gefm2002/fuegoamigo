import { createContext, useContext, useMemo, useState } from 'react';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
      setOpen(true);
    });

  const close = (result: boolean) => {
    setOpen(false);
    resolver?.(result);
    setResolver(null);
    setOptions(null);
  };

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), []);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && options && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" onClick={() => close(false)} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-md shadow-2xl">
              {options.title && (
                <h3 className="font-display text-xl text-secondary mb-2">{options.title}</h3>
              )}
              <p className="text-neutral-300 text-sm whitespace-pre-line">{options.message}</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => close(false)}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 text-neutral-300 font-medium rounded hover:bg-neutral-700 transition-colors"
                >
                  {options.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={() => close(true)}
                  className={`flex-1 px-4 py-2.5 font-medium rounded transition-colors ${
                    options.danger
                      ? 'bg-accent text-secondary hover:bg-accent/90'
                      : 'bg-accent text-secondary hover:bg-accent/90'
                  }`}
                >
                  {options.confirmText || 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

