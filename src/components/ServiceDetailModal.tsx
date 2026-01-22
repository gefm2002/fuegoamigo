interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    title: string;
    description: string;
  } | null;
  onRequestQuote?: () => void;
}

const serviceDetails: Record<string, string> = {
  'Catering Social': `Nuestro servicio de catering social está pensado para hacer de tu evento un momento inolvidable. Trabajamos con menús personalizados que se adaptan a tus gustos y presupuesto.

Incluimos:
• Personal de servicio profesional
• Vajilla y mantelería
• Montaje y desmontaje
• Opciones vegetarianas y sin TACC
• Coordinación previa del evento

Ideal para cumpleaños, aniversarios, reuniones familiares y celebraciones íntimas. Trabajamos desde 10 personas en adelante y nos adaptamos a tu espacio, ya sea en tu casa, un salón o al aire libre.`,

  'Catering Corporativo': `Servicio completo de catering para empresas y eventos corporativos. Diseñamos experiencias gastronómicas que reflejan la imagen de tu marca.

Nuestro servicio incluye:
• Menús ejecutivos y de cocktail
• Personal de servicio capacitado
• Opciones para desayunos, almuerzos y coffee breaks
• Facturación empresarial
• Logística completa

Perfecto para lanzamientos, reuniones de trabajo, capacitaciones, eventos de fin de año y presentaciones. Trabajamos con empresas de todos los tamaños y adaptamos nuestros servicios a tus necesidades específicas.`,

  'Producciones': `Catering especializado para producciones audiovisuales, de moda y publicidad. Entendemos los tiempos y necesidades de un set.

Ofrecemos:
• Boxes individuales personalizados
• Servicio rápido y eficiente
• Opciones para diferentes horarios
• Coordinación con producción
• Menús adaptados a necesidades del equipo

Trabajamos en locaciones, estudios y sets. Nuestro equipo está acostumbrado a trabajar en ambientes de producción y respetamos los tiempos de grabación. Ideal para producciones de TV, cine, moda y publicidad.`,

  'Foodtruck para Eventos': `Nuestro foodtruck es la opción perfecta para eventos al aire libre, ferias y reuniones grandes. Servicio rápido y sabroso.

Características:
• Menú variado de parrilla y ahumados
• Servicio rápido y eficiente
• Ideal para eventos de 50+ personas
• Instalación en tu ubicación
• Opciones de combos y menú a la carta

Perfecto para ferias gastronómicas, eventos corporativos al aire libre, festivales, cumples grandes y reuniones en espacios abiertos. El foodtruck se instala en tu evento y trabajamos con servicio continuo durante toda la jornada.`,

  'Boxes y Picadas': `Boxes y picadas premium para llevar o pedir a domicilio. Perfectos para regalar o disfrutar en casa.

Opciones disponibles:
• Boxes temáticos y ediciones especiales
• Picadas clásicas y premium
• Opciones para 2 a 6 personas
• Productos artesanales y gourmet
• Envío a domicilio o retiro

Ideal para regalos, reuniones íntimas, picadas entre amigos o simplemente para disfrutar en casa. Todos nuestros boxes incluyen productos seleccionados y de calidad. Coordinamos envíos en CABA y GBA.`,

  'Ahumados y Parrilla': `Servicio de parrilla y ahumados en vivo para eventos. Traemos la experiencia completa de la parrilla a tu evento.

Incluye:
• Parrilla en vivo con parrillero
• Ahumados premium (brisket, pulled pork, costillas)
• Variedad de cortes y opciones
• Salsas y acompañamientos
• Servicio completo con personal

Perfecto para eventos sociales, corporativos y celebraciones especiales. El parrillero trabaja en vivo durante el evento, garantizando que todo salga en su punto. Ideal para eventos de 30+ personas donde querés ofrecer una experiencia gastronómica memorable.`,
};

export function ServiceDetailModal({ isOpen, onClose, service, onRequestQuote }: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  const detailText = serviceDetails[service.title] || service.description;

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
            {detailText}
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
