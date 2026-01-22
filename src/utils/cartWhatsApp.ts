import type { CartItem } from '../cart/useCart';

type CustomerInfo = {
  name: string;
  zone?: string;
  paymentMethod:
    | 'efectivo'
    | 'tarjeta'
    | 'transferencia'
    | 'modo'
    | 'mercado'
    | 'billeteras-qr';
  notes?: string;
};

export const buildWhatsAppLink = (phone: string, message: string) => {
  const url = new URL(`https://wa.me/${phone}`);
  url.searchParams.set('text', message);
  return url.toString();
};

export const buildCartMessage = (items: CartItem[], total: number, info: CustomerInfo) => {
  const paymentLabels: Record<CustomerInfo['paymentMethod'], string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    modo: 'MODO',
    mercado: 'Mercado Pago',
    'billeteras-qr': 'Billeteras QR',
  };

  // Saludo con nombre del cliente
  const lines = [
    `Hola ${info.name}! 👋`,
    '',
  ];

  // Zona/barrio si se completó
  if (info.zone) {
    lines.push(`Zona/Barrio: ${info.zone}`);
    lines.push('');
  }

  // Lista de productos
  lines.push('*Productos:*');
  items.forEach((item) => {
    const variant = item.variant ? ` (${item.variant})` : '';
    const subtotal = item.price * item.qty;
    lines.push(`${item.qty}x ${item.name}${variant} - $${subtotal.toLocaleString('es-AR')}`);
  });

  // Total estimado
  lines.push('');
  lines.push(`*Total estimado: $${total.toLocaleString('es-AR')}*`);

  // Medio de pago
  lines.push('');
  lines.push(`*Medio de pago:* ${paymentLabels[info.paymentMethod]}`);

  // Notas si hay
  if (info.notes) {
    lines.push('');
    lines.push(`*Notas:* ${info.notes}`);
  }

  return lines.join('\n');
};
