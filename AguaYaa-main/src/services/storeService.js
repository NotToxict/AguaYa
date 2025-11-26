// src/services/storeService.js
import storesData, { getStoreById as getStoreByIdData } from '../data/stores'; // Importa tus datos existentes

/**
 * Simula una llamada a la API para obtener todas las tiendas.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de tiendas después de un retraso.
 */
export const fetchStores = () => {
  console.log("Simulando fetchStores..."); // Para depuración
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simular éxito (puedes descomentar la línea de reject para probar errores)
      resolve(storesData);
      // reject(new Error("Error simulado al cargar tiendas"));
    }, 1500); // Simula un retraso de red de 1.5 segundos
  });
};

/**
 * Simula una llamada a la API para obtener una tienda por su ID.
 * @param {string} id - El ID de la tienda.
 * @returns {Promise<Object|null>} Una promesa que resuelve con la tienda o null si no se encuentra.
 */
export const fetchStoreById = (id) => {
  console.log(`Simulando fetchStoreById con id: ${id}`); // Para depuración
  return new Promise((resolve) => {
    setTimeout(() => {
      const store = getStoreByIdData(id);
      resolve(store);
    }, 800); // Simula un retraso menor
  });
};

/**
 * Simula una llamada a la API para obtener los productos de una tienda específica.
 * @param {string} storeId - El ID de la tienda.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de productos de la tienda.
 */
export const fetchProductsByStore = (storeId) => {
  console.log(`Simulando fetchProductsByStore para storeId: ${storeId}`); // Para depuración
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const store = getStoreByIdData(storeId);
      if (store && store.products) {
        resolve(store.products);
      } else if (store) {
        resolve([]); // La tienda existe pero no tiene productos
      } else {
        reject(new Error(`Tienda con ID ${storeId} no encontrada.`));
      }
    }, 1200); // Simula otro retraso
  });
};

// Puedes añadir más funciones simuladas aquí (fetchProducts, etc.)

// src/services/storeService.js
// ... (fetchStores, fetchStoreById, fetchProductsByStore ya existen) ...
import productsData from '../data/products'; // Importar datos de productos

/**
 * Simula una llamada a la API para obtener tiendas destacadas.
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de tiendas destacadas.
 */
export const fetchFeaturedStores = () => {
  console.log("Simulando fetchFeaturedStores...");
  return new Promise((resolve) => {
    setTimeout(() => {
      // Por ahora, devolvemos todas las tiendas como destacadas
      resolve(storesData);
    }, 1000); // Retraso diferente para ver la carga independiente
  });
};

/**
 * Simula una llamada a la API para obtener productos en oferta (destacados).
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de productos en oferta.
 */
export const fetchFeaturedProducts = () => {
  console.log("Simulando fetchFeaturedProducts...");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simular éxito
       resolve(productsData);
      // Simular error (descomenta para probar)
      // reject(new Error("Error simulado al cargar ofertas"));
    }, 1800); // Retraso diferente
  });
};

// src/services/storeService.js (o orderService.js)
// ... (otras funciones fetch...) ...

/**
 * Simula una llamada a la API para obtener el historial de pedidos de un usuario.
 * @param {string} userId - (Opcional) El ID del usuario (en el futuro).
 * @returns {Promise<Array>} Una promesa que resuelve con una lista de pedidos simulados.
 */
export const fetchOrders = (userId = 'current_user') => {
  console.log(`Simulando fetchOrders para userId: ${userId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Datos simulados de pedidos
      const mockOrders = [
        { id: 'ORD001', date: '2025-10-26', total: 150, status: 'Entregado', items: [{ name: 'Garrafón 20L', qty: 1 }] },
        { id: 'ORD002', date: '2025-10-27', total: 49, status: 'En Ruta', items: [{ name: 'Botella 1L', qty: 2 }, { name: 'Hielo 5kg', qty: 1 }] },
        { id: 'ORD003', date: '2025-10-27', total: 70, status: 'Pendiente', items: [{ name: 'Garrafón 20L', qty: 2 }] },
      ];
      // Simular éxito (puedes probar errores descomentando 'reject')
      resolve(mockOrders);
      // reject(new Error("Error simulado al cargar pedidos."));
    }, 1300); // Otro retraso simulado
  });
};