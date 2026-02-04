import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ModalQuoteForm } from '../components/ModalQuoteForm';
import { ServiceDetailModal } from '../components/ServiceDetailModal';
import { openWhatsApp } from '../utils/whatsapp';
import { useProducts, useEvents, useFAQs } from '../hooks/useSupabaseData';

export function Home() {
  const { products } = useProducts();
  const events = useEvents();
  const faqs = useFAQs();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isServiceDetailOpen, setIsServiceDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ title: string; description: string } | null>(null);
  const [selectedEventType, setSelectedEventType] = useState('Social');

  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);
  const combos = products.filter((p) => p.category === 'combos').slice(0, 3);
  const recentEvents = events.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero-catering.jpg)' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-secondary mb-6">
            Catering y foodtruck para eventos que se sienten
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Ahumados, parrilla, finger food y boxes. Social, corporativo y producciones.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-6 py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
            >
              Pedir presupuesto
            </button>
            <button
              onClick={() => openWhatsApp('Hola! Quiero hacer una consulta.')}
              className="px-6 py-3 border-2 border-secondary text-secondary font-medium rounded hover:bg-secondary hover:text-primary transition-colors"
            >
              Hablar por WhatsApp
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['Social', 'Corporativo', 'Producciones', 'Foodtruck', 'Boxes'].map((chip) => (
              <span
                key={chip}
                className="px-4 py-2 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-full text-neutral-300 text-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-16 bg-bg-soft scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-secondary text-center mb-12">
            Servicios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Catering Social',
                description: 'Eventos sociales, cumples, reuniones. Menús personalizados.',
                image: '/images/catering-social.jpg',
              },
              {
                title: 'Catering Corporativo',
                description: 'Lunchs, eventos corporativos, lanzamientos. Servicio completo.',
                image: '/images/catering-corporativo.jpg',
              },
              {
                title: 'Producciones',
                description: 'Moda, publicidad, sets. Boxes y servicio en locación.',
                image: '/images/catering-produccion.jpg',
              },
              {
                title: 'Foodtruck para Eventos',
                description: 'Foodtruck para ferias, eventos al aire libre y reuniones grandes.',
                image: '/images/hero-foodtruck.jpg',
              },
              {
                title: 'Boxes y Picadas',
                description: 'Boxes a pedido, picadas premium. Retiro o envío.',
                image: '/images/product-picada-01.jpg',
              },
              {
                title: 'Ahumados y Parrilla',
                description: 'Ahumados en vivo, parrilla premium. Servicio completo.',
                image: '/images/gallery-bbq-01.jpg',
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-accent transition-colors"
              >
                <div className="aspect-video bg-neutral-800 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/gallery-bbq-01.jpg';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-secondary mb-2">{service.title}</h3>
                  <p className="text-neutral-400 text-sm mb-4">{service.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsQuoteModalOpen(true);
                      }}
                      className="flex-1 px-4 py-2 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors text-sm"
                    >
                      Cotizar por WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setIsServiceDetailOpen(true);
                      }}
                      className="flex-1 px-4 py-2 border border-neutral-700 text-secondary font-medium rounded hover:bg-neutral-800 transition-colors text-sm"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería por tipo de evento */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-secondary text-center mb-8">
            Galería por Tipo de Evento
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Social', 'Corporativo', 'Bodas', 'Cumples', 'Producciones', 'Ferias', 'Foodtruck'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedEventType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedEventType === type
                    ? 'bg-accent text-secondary'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="aspect-square bg-neutral-900 rounded-lg overflow-hidden">
                <img
                  src={`/images/gallery-bbq-0${(idx % 8) + 1}.jpg`}
                  alt={`Evento ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/gallery-bbq-01.jpg';
                  }}
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/eventos"
              className="inline-block px-6 py-3 border-2 border-accent text-accent font-medium rounded hover:bg-accent hover:text-secondary transition-colors"
            >
              Ver más en Eventos
            </Link>
          </div>
        </div>
      </section>

      {/* Eventos realizados */}
      <section className="py-16 bg-bg-soft">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-secondary text-center mb-12">
            Eventos Realizados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-accent transition-colors"
              >
                <div className="aspect-video bg-neutral-800 overflow-hidden">
                  <img
                    src={event.images[0] || '/images/gallery-bbq-01.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/gallery-bbq-01.jpg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs text-accent font-medium">{event.eventType}</span>
                  <h3 className="font-display text-lg text-secondary mt-2 mb-1">{event.title}</h3>
                  <p className="text-neutral-400 text-xs mb-2">{event.guestsRange}</p>
                  <p className="text-neutral-500 text-xs line-clamp-2">{event.highlightMenu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tienda preview */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-secondary">
              Tienda
            </h2>
            <Link
              to="/tienda"
              className="text-accent hover:underline font-medium"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Medios de pago */}
      <section className="py-16 bg-bg-soft">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-secondary text-center mb-4">
            Medios de Pago
          </h2>
          <p className="text-neutral-400 text-center mb-2">
            Solo para compra en tienda. A coordinar por WhatsApp.
          </p>
          <p className="text-neutral-500 text-center text-sm mb-8">
            Facturación a pedido.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {['Efectivo', 'Transferencia', 'Mercado Pago', 'MODO', 'Billeteras QR'].map((method) => (
              <div
                key={method}
                className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 text-center"
              >
                <div className="w-12 h-12 bg-neutral-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <p className="text-neutral-300 text-sm font-medium">{method}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Combos */}
      <section className="py-16 bg-bg-soft">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-secondary text-center mb-12">
            Descuentos y Combos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {combos.map((combo) => (
              <ProductCard key={combo.id} product={combo} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-16 bg-primary scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-secondary text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="bg-neutral-900 border border-neutral-700 rounded-lg p-6"
              >
                <summary className="font-display text-lg text-secondary cursor-pointer">
                  {faq.question}
                </summary>
                <p className="text-neutral-400 mt-4">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-16 bg-bg-soft scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-secondary text-center mb-12">
            Contacto
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 mb-6">
              <h3 className="font-display text-xl text-secondary mb-4">Zona de trabajo</h3>
              <p className="text-neutral-400 mb-6">CABA y GBA</p>
              <button
                onClick={() => openWhatsApp('Hola! Quiero consultar por zonas de trabajo.')}
                className="px-6 py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
              >
                Consultar ubicación
              </button>
            </div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8">
              <h3 className="font-display text-xl text-secondary mb-4">Horarios</h3>
              <p className="text-neutral-400">Atendemos a pedido</p>
            </div>
          </div>
        </div>
      </section>

      <ModalQuoteForm
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
      <ServiceDetailModal
        isOpen={isServiceDetailOpen}
        onClose={() => {
          setIsServiceDetailOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        onRequestQuote={() => {
          setIsServiceDetailOpen(false);
          setSelectedService(null);
          setIsQuoteModalOpen(true);
        }}
      />
    </div>
  );
}
