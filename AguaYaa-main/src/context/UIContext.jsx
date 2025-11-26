import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const UIContext = createContext(null);
const STORAGE_KEY = 'aguaya_ui_v1';

export function UIProvider({ children }) {
  const [address, setAddress] = useState('');
  const [slot, setSlot] = useState('Lo antes posible');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Carga persistida
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.address) setAddress(parsed.address);
        if (parsed?.slot) setSlot(parsed.slot);
      }
    } catch {}
  }, []);

  // Persistencia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ address, slot }));
    } catch {}
  }, [address, slot]);

  const value = useMemo(
    () => ({
      address,
      setAddress,
      slot,
      setSlot,
      addressDialogOpen,
      openAddressDialog: () => setAddressDialogOpen(true),
      closeAddressDialog: () => setAddressDialogOpen(false),

      quickViewProduct,
      openQuickView: (product) => setQuickViewProduct(product),
      closeQuickView: () => setQuickViewProduct(null),
    }),
    [address, slot, addressDialogOpen, quickViewProduct]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}