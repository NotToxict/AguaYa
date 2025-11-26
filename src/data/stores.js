// Tiendas de ejemplo con sus catálogos.
// En el futuro esto vendrá del backend (GET /stores y GET /stores/:id/products)
const stores = [
  {
    id: 'aquamax',
    name: 'AquaMax Centro',
    etaMin: 25,
    deliveryFee: 30,
    rating: 4.7,
    products: [
      { id: 'aquamax-garrafon20', name: 'Agua Purificada', size: 'Garrafón 20L', price: 120 },
      { id: 'aquamax-bidon12', name: 'Agua Purificada', size: 'Bidón 12L', price: 90 },
      { id: 'aquamax-pack6x2', name: 'Pack Botellas', size: '6 x 2L', price: 150 },
      { id: 'aquamax-pack6x15', name: 'Pack Botellas', size: '6 x 1.5L', price: 130 },
      { id: 'aquamax-500', name: 'Botella individual', size: '500ml', price: 25 },
    ],
  },
  {
    id: 'h2oexp',
    name: 'H2O Express Norte',
    etaMin: 35,
    deliveryFee: 40,
    rating: 4.6,
    products: [
      { id: 'h2oexp-garrafon20', name: 'Agua Purificada', size: 'Garrafón 20L', price: 115 },
      { id: 'h2oexp-bidon12', name: 'Agua Purificada', size: 'Bidón 12L', price: 85 },
      { id: 'h2oexp-pack6x2', name: 'Pack Botellas', size: '6 x 2L', price: 145 },
      { id: 'h2oexp-pack6x15', name: 'Pack Botellas', size: '6 x 1.5L', price: 125 },
      { id: 'h2oexp-500', name: 'Botella individual', size: '500ml', price: 22 },
    ],
  },
];

export default stores;

export function getStoreById(id) {
  return stores.find((s) => s.id === id) || null;
}