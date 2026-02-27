interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    title: string;
    description: string;
  } | null;
  onRequestQuote?: () => void;
}

export function ServiceDetailModal({ isOpen, onClose, service, onRequestQuote }: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 md:p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl text-secondary">{service.title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-secondary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300 whitespace-pre-line leading-relaxed">
            {service.description}
          </p>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-neutral-800 border border-neutral-700 text-secondary font-medium rounded hover:bg-neutral-700 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              if (onRequestQuote) {
                onRequestQuote();
              }
            }}
            className="flex-1 px-6 py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
          >
            Pedir presupuesto
          </button>
        </div>
      </div>
    </div>
  );
}
