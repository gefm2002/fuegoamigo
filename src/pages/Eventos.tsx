import { useState } from 'react';
import { ModalQuoteForm } from '../components/ModalQuoteForm';
import { useEvents } from '../hooks/useData';

const eventTypes = ['Todas', 'Social', 'Corporativo', 'Boda', 'Cumple', 'Producción', 'Feria', 'Foodtruck'];

export function Eventos() {
  const events = useEvents();
  const [selectedType, setSelectedType] = useState('Todas');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<string>('');

  const filteredEvents = selectedType === 'Todas'
    ? events.filter((e) => e.isActive)
    : events.filter((e) => e.isActive && e.eventType === selectedType);

  const handleQuoteClick = (eventType: string) => {
    setPreselectedType(eventType);
    setIsQuoteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero-catering.jpg)' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-secondary mb-4">
            Eventos Realizados
          </h1>
          <p className="text-lg text-neutral-300">
            Conocé nuestros trabajos y servicios
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-8">
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-accent text-secondary'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-accent transition-colors"
            >
              <div className="aspect-video bg-neutral-800 overflow-hidden">
                <img
                  src={event.images[0] || '/images/gallery-bbq-01.jpg'}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/gallery-bbq-01.jpg';
                  }}
                />
              </div>
              <div className="p-6">
                <span className="text-xs text-accent font-medium">{event.eventType}</span>
                <h3 className="font-display text-xl text-secondary mt-2 mb-2">
                  {event.title}
                </h3>
                <p className="text-neutral-400 text-sm mb-2">
                  📍 {event.location} • 👥 {event.guestsRange}
                </p>
                <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <p className="text-neutral-400 text-xs mb-4">
                  <strong>Menú destacado:</strong> {event.highlightMenu}
                </p>
                <button
                  onClick={() => handleQuoteClick(event.eventType)}
                  className="w-full px-4 py-2 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
                >
                  Pedir presupuesto
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ModalQuoteForm
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        preselectedType={preselectedType}
      />
    </div>
  );
}
