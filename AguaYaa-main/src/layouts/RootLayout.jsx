import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from '../components/NavBar';
import AddressDialog from '../components/AddressDialog';
import ProductQuickView from '../components/ProductQuickView';
import BottomNav from '../components/BottomNav';
import FloatingCartFab from '../components/FloatingCartFab';
import Footer from '../components/Footer';

export default function RootLayout() {
  return (
    <>
      <NavBar />
      {/* AQUÍ BORRAMOS <AddressBar /> para que no salga doble */}

      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>

      {/* Componentes globales */}
      <ProductQuickView /> 
      <AddressDialog /> 
      <FloatingCartFab /> 
      <BottomNav /> 
      <Footer /> 
    </>
  );
}