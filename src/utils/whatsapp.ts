export const WHATSAPP_NUMBER = '+5491141464526';

export function generateWhatsAppMessage(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encoded}`;
}

export function openWhatsApp(text: string): void {
  window.open(generateWhatsAppMessage(text), '_blank');
}

export function formatCheckoutMessage(
  items: Array<{ name: string; quantity: number; price: number; notes?: string }>,
  total: number,
  customerData: {
    name: string;
    phone: string;
    zone: string;
    deliveryType: string;
    date: string;
    timeSlot: string;
    comments: string;
  }
): string {
  let message = `🍖 *PEDIDO FUEGO AMIGO*\n\n`;
  message += `*Cliente:* ${customerData.name}\n`;
  message += `*Teléfono:* ${customerData.phone}\n`;
  message += `*Zona:* ${customerData.zone}\n`;
  message += `*Entrega:* ${customerData.deliveryType === 'retiro' ? 'Retiro' : 'Envío'}\n`;
  message += `*Fecha:* ${customerData.date}\n`;
  message += `*Franja horaria:* ${customerData.timeSlot}\n\n`;
  
  message += `*PRODUCTOS:*\n`;
  items.forEach((item) => {
    message += `• ${item.quantity}x ${item.name} - $${item.price.toLocaleString('es-AR')}\n`;
    if (item.notes) {
      message += `  Nota: ${item.notes}\n`;
    }
  });
  
  message += `\n*TOTAL: $${total.toLocaleString('es-AR')}*\n\n`;
  
  if (customerData.comments) {
    message += `*Observaciones:*\n${customerData.comments}\n\n`;
  }
  
  message += `Gracias por tu pedido! 🔥`;
  
  return message;
}

export function formatQuoteMessage(formData: {
  eventType: string;
  date: string;
  guests: string;
  zone: string;
  serviceType: string;
  budget: string;
  comments: string;
}): string {
  let message = `🔥 *CONSULTA CATERING - FUEGO AMIGO*\n\n`;
  message += `*Tipo de evento:* ${formData.eventType}\n`;
  message += `*Fecha:* ${formData.date}\n`;
  message += `*Cantidad de personas:* ${formData.guests}\n`;
  message += `*Zona:* ${formData.zone}\n`;
  message += `*Estilo de servicio:* ${formData.serviceType}\n`;
  message += `*Presupuesto estimado:* ${formData.budget}\n\n`;
  
  if (formData.comments) {
    message += `*Comentarios:*\n${formData.comments}\n\n`;
  }
  
  message += `Gracias por contactarnos! Te respondemos a la brevedad. 🔥`;
  
  return message;
}
