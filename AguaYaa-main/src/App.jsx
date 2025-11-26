import React from 'react';
import { Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { StoreProvider } from './context/StoreContext';
import NavBar from './components/NavBar';
import AddressBar from './components/AddressBar';
import AddressDialog from './components/AddressDialog';
import ProductQuickView from './components/ProductQuickView';
import BottomNav from './components/BottomNav';
import FloatingCartFab from './components/FloatingCartFab';
import Footer from './components/Footer';

export default function App() {
  return (
    <StoreProvider>
      <UIProvider>
        <CartProvider>
          <NavBar />
          <AddressBar />
          <Outlet />
          <ProductQuickView />
          <AddressDialog />
          <FloatingCartFab />
          <BottomNav />
          <Footer />
        </CartProvider>
      </UIProvider>
    </StoreProvider>
  );
}