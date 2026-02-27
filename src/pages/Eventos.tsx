import { useEffect, useMemo, useState } from 'react';
import { EventDetailModal } from '../components/EventDetailModal';
import { useEvents, usePublicConfig } from '../hooks/useSupabaseData';
import type { Event } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

const eventTypes = ['Todas', 'Social', 'Corporativo', 'Boda', 'Cumple', 'Producción', 'Feria', 'Foodtruck'];

export function Eventos() {
  const events = useEvents();
  const { config, loading: configLoading } = usePublicConfig();
  const [selectedType, setSelectedType] = useState('Todas');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [heroBgReadyUrl, setHeroBgReadyUrl] = useState<string>('');

  const heroTitle = config?.eventsHeroTitle || 'Eventos Realizados';
  const heroSubtitle = config?.eventsHeroSubtitle || 'Conocé nuestros trabajos y servicios';
  const primaryLabel = (config?.eventsHeroPrimaryLabel || 'Ver eventos').trim();
  const secondaryLabel = (config?.eventsHeroSecondaryLabel || 'Hablar por WhatsApp').trim();
  const secondaryMessage = config?.eventsHeroSecondaryMessage || 'Hola! Quiero consultar por un evento.';

  const desiredHeroBgUrl = useMemo(() => {
    if (configLoading) return '';
    return (config?.eventsHeroImage || '/images/hero-catering.jpg').trim();
  }, [config?.eventsHeroImage, configLoading]);

  useEffect(() => {
    if (!desiredHeroBgUrl) {
      setHeroBgReadyUrl('');
      return;
    }
    const img = new Image();
    img.src = desiredHeroBgUrl;
    img.onload = () => setHeroBgReadyUrl(desiredHeroBgUrl);
    img.onerror = () => setHeroBgReadyUrl('');
  }, [desiredHeroBgUrl]);

  const filteredEvents = selectedType === 'Todas'
    ? events.filter((e) => e.isActive)
    : events.filter((e) => e.isActive && e.eventType === selectedType);

  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero */}
      <section
        className={`relative min-h-[50vh] flex items-center justify-center ${
          heroBgReadyUrl ? 'bg-cover bg-center' : 'bg-gradient-to-b from-neutral-950 via-neutral-900 to-primary'
        }`}
        style={heroBgReadyUrl ? { backgroundImage: `url(${heroBgReadyUrl})` } : undefined}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-secondary mb-4">
            {heroTitle}
          </h1>
          <p className="text-lg text-neutral-300">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {primaryLabel && (
              <button
                onClick={() => document.getElementById('eventos-listado')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
              >
                {primaryLabel}
              </button>
            )}
            {secondaryLabel && (
              <button
                onClick={() => openWhatsApp(secondaryMessage)}
                className="px-6 py-3 border-2 border-secondary text-secondary font-medium rounded hover:bg-secondary hover:text-primary transition-colors"
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </section>

      <div id="eventos-listado" className="container mx-auto px-4 py-12 scroll-mt-24">
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
                  onClick={() => handleOpenEvent(event)}
                  className="w-full px-4 py-2 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
                >
                  Ver galería
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EventDetailModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
}
