// App configuration
export const BUSINESS_PHONE = '0000000000'; // TODO: Replace with real WhatsApp number (digits only)
export const STORE_NAME = 'AguaYa';

// Delivery time options
export const DELIVERY_TIME_OPTIONS = [
  'Lo antes posible',
  'En 1 hora',
  'En 2 horas',
  'Mañana por la mañana',
  'Mañana por la tarde'
];

// App settings
export const APP_CONFIG = {
  name: STORE_NAME,
  defaultDeliveryTime: DELIVERY_TIME_OPTIONS[0],
  currency: 'COP',
  currencySymbol: '$'
};