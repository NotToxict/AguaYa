import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import stores, { getStoreById } from '../data/stores';

const StoreContext = createContext(null);
const STORAGE_KEY = 'aguaya_store_v1';

export function StoreProvider({ children }) {
  const [storeId, setStoreId] = useState(null);

  // Cargar selección persistida
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStoreId(saved);
    } catch {}
  }, []);

  // Persistir cambios
  useEffect(() => {
    try {
      if (storeId) localStorage.setItem(STORAGE_KEY, storeId);
    } catch {}
  }, [storeId]);

  const value = useMemo(() => {
    const store = storeId ? getStoreById(storeId) : null;
    return {
      stores,
      storeId,
      store,
      setStoreId,
      clearStore: () => setStoreId(null),
    };
  }, [storeId]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}