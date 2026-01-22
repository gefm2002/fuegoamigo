import { useState } from 'react';
import type { FormEvent } from 'react';
import type { QuoteFormData } from '../types';
import { openWhatsApp, formatQuoteMessage } from '../utils/whatsapp';

interface ModalQuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedType?: string;
}

export function ModalQuoteForm({ isOpen, onClose, preselectedType }: ModalQuoteFormProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    eventType: preselectedType || '',
    date: '',
    guests: '',
    zone: '',
    serviceType: '',
    budget: '',
    comments: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const message = formatQuoteMessage(formData);
    openWhatsApp(message);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({
        eventType: preselectedType || '',
        date: '',
        guests: '',
        zone: '',
        serviceType: '',
        budget: '',
        comments: '',
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 md:p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl text-secondary">Pedir Presupuesto</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-secondary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-accent text-4xl mb-4">✓</div>
            <p className="text-secondary font-medium">Listo, te abrimos WhatsApp con todo armado</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Tipo de evento *
              </label>
              <select
                required
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Seleccionar</option>
                <option value="Social">Social</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Boda">Boda</option>
                <option value="Cumple">Cumple</option>
                <option value="Producción">Producción</option>
                <option value="Feria">Feria</option>
                <option value="Foodtruck">Foodtruck</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Cantidad estimada de personas *
              </label>
              <input
                type="text"
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                placeholder="Ej: 50-60 personas"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Zona *
              </label>
              <input
                type="text"
                required
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                placeholder="Ej: Palermo, CABA"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Estilo de servicio *
              </label>
              <select
                required
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Seleccionar</option>
                <option value="Catering">Catering</option>
                <option value="Foodtruck">Foodtruck</option>
                <option value="Boxes">Boxes</option>
                <option value="Mixto">Mixto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Presupuesto estimado
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Seleccionar</option>
                <option value="Menos de $50.000">Menos de $50.000</option>
                <option value="$50.000 - $100.000">$50.000 - $100.000</option>
                <option value="$100.000 - $200.000">$100.000 - $200.000</option>
                <option value="Más de $200.000">Más de $200.000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Comentarios
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={4}
                placeholder="Contanos más sobre tu evento..."
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
            >
              Enviar por WhatsApp
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
