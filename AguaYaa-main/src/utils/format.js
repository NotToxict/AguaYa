export function formatCurrency(value, locale = 'es-MX', currency = 'MXN') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    return `$${Number(value).toFixed(2)}`;
  }
}