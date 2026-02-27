import type { Event } from '../types';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
  if (!isOpen || !event) return null;

  const images = (event.images && event.images.length > 0 ? event.images : ['/images/logo.svg']).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 md:p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs text-accent font-medium">{event.eventType}</span>
            <h2 className="font-display text-2xl text-secondary">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-secondary transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="aspect-video bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
              <img
                src={images[0]}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/logo.svg';
                  target.className = 'w-full h-full object-contain p-10 opacity-60';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((src, idx) => (
                  <div key={idx} className="aspect-video bg-neutral-800 rounded overflow-hidden border border-neutral-700">
                    <img
                      src={src}
                      alt={`${event.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/logo.svg';
                        target.className = 'w-full h-full object-contain p-2 opacity-60';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-neutral-400 text-sm">
              {event.location && <span>📍 {event.location}</span>}
              {event.guestsRange && <span> {event.location ? '•' : ''} 👥 {event.guestsRange}</span>}
            </p>

            {event.description && (
              <div>
                <h3 className="font-display text-lg text-secondary mb-2">Descripción</h3>
                <p className="text-neutral-300 whitespace-pre-line leading-relaxed">{event.description}</p>
              </div>
            )}

            {event.highlightMenu && (
              <div>
                <h3 className="font-display text-lg text-secondary mb-2">Menú destacado</h3>
                <p className="text-neutral-300 whitespace-pre-line leading-relaxed">{event.highlightMenu}</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-neutral-800 border border-neutral-700 text-secondary font-medium rounded hover:bg-neutral-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

