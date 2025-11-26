import { formatCurrency } from './format';

export function buildWhatsAppLink({ items, subtotal, phone = '0000000000', store = 'AguaYa', locale = 'es-MX', currency = 'MXN', customer }) {
  const lines = [];
  lines.push(`Hola ${store}, quiero hacer un pedido:`);
  items.forEach((it) => {
    lines.push(`• ${it.qty} x ${it.name}${it.size ? ' - ' + it.size : ''} (${formatCurrency(it.price, locale, currency)} c/u)`);
  });
  lines.push(`Subtotal: ${formatCurrency(subtotal, locale, currency)}`);
  if (customer) {
    const { name, phone: cphone, address, notes, slot } = customer;
    lines.push('');
    lines.push('Datos de entrega:');
    if (name) lines.push(`• Nombre: ${name}`);
    if (cphone) lines.push(`• Tel: ${cphone}`);
    if (address) lines.push(`• Dirección: ${address}`);
    if (slot) lines.push(`• Horario: ${slot}`);
    if (notes) lines.push(`• Notas: ${notes}`);
  }
  lines.push('');
  lines.push('¿Está disponible para entrega?');

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${phone}?text=${text}`;
}