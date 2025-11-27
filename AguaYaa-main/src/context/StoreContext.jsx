import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ID de la tienda seleccionada actualmente
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        // Petición al Backend Real
        const response = await fetch(`${import.meta.env.VITE_API_URL}/stores`);
        
        if (!response.ok) {
          throw new Error('Error al cargar las tiendas');
        }

        const rawData = await response.json();

        // Mapeo de datos: PostgreSQL (snake_case) -> React (camelCase)
        const mappedStores = rawData.map(store => ({
          id: store.local_id,
          name: store.name,
          address: store.address,
          deliveryFee: parseFloat(store.delivery_fee),
          etaMin: store.min_eta_minutes, // Usamos el mínimo como referencia
          rating: parseFloat(store.rating),
          imageUrl: store.image_url // <--- ¡Nuevo!
        }));

        setStores(mappedStores);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <StoreContext.Provider value={{ stores, loading, error, storeId, setStoreId }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}