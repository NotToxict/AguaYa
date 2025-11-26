import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// Ya no importamos 'stores' ni 'getStoreById' desde data/stores
// import storesData, { getStoreById } from '../data/stores'; // <-- ELIMINAR O COMENTAR

const StoreContext = createContext(null);
const STORAGE_KEY = 'aguaya_store_v1';
const API_BASE_URL = 'http://localhost:3001/api'; // <-- Define la URL base de tu API

export function StoreProvider({ children }) {
  const [stores, setStores] = useState([]); // <-- Estado para almacenar las tiendas
  const [loading, setLoading] = useState(true); // <-- Estado de carga
  const [error, setError] = useState(null); // <-- Estado de error
  const [storeId, setStoreId] = useState(null); // <-- ID de la tienda seleccionada (persistido)

  // --- Cargar tiendas desde la API al montar ---
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/stores`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // --- IMPORTANTE: Ajustar nombres de campos si es necesario ---
        // La API devuelve local_id, min_eta_minutes, max_eta_minutes.
        // El frontend espera storeId, etaMin, etaMax (implícito).
        // Hacemos el mapeo aquí:
        const mappedStores = data.map(store => ({
          id: store.local_id, // Mapea local_id a id
          name: store.name,
          address: store.address, // Añadido si lo necesitas mostrar
          phone: store.phone, // Añadido si lo necesitas mostrar
          etaMin: store.min_eta_minutes, // Mapea min_eta_minutes a etaMin
          // etaMax no se usa directamente en StoresPage, pero lo mapeamos por si acaso
          etaMax: store.max_eta_minutes,
          deliveryFee: parseFloat(store.delivery_fee), // Asegura que sea número
          rating: parseFloat(store.rating), // Asegura que sea número
          // products ya no viene aquí, se cargará por separado
        }));
        setStores(mappedStores);
      } catch (e) {
        console.error("Error fetching stores:", e);
        setError('No se pudieron cargar las tiendas. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Cargar selección persistida de storeId
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStoreId(saved ? parseInt(saved, 10) : null); // Asegura que sea número o null
    } catch {}
  }, []);

  // Persistir cambios en storeId
  useEffect(() => {
    try {
      if (storeId !== null) { // Guarda solo si no es null
        localStorage.setItem(STORAGE_KEY, String(storeId));
      } else {
        localStorage.removeItem(STORAGE_KEY); // Limpia si se deselecciona
      }
    } catch {}
  }, [storeId]);

  // Función getStoreById ahora busca en el estado 'stores'
  const getStoreById = (id) => {
    // Asegurarse de comparar números con números
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return stores.find((s) => s.id === numericId) || null;
  }

  const value = useMemo(() => {
    const store = storeId !== null ? getStoreById(storeId) : null;
    return {
      stores, // <-- Las tiendas vienen del estado (API)
      loading, // <-- Exporta el estado de carga
      error, // <-- Exporta el estado de error
      storeId,
      store, // <-- El objeto 'store' seleccionado se calcula como antes
      setStoreId: (id) => setStoreId(id !== null ? parseInt(id, 10) : null), // Asegura número o null al setear
      clearStore: () => setStoreId(null),
      getStoreById, // <-- Exporta la función actualizada
    };
    // Añade loading y error a las dependencias de useMemo
  }, [stores, loading, error, storeId]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
