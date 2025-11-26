// src/layouts/RootLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
// Importa los componentes globales que estaban en App.jsx
import NavBar from '../components/NavBar';
import AddressBar from '../components/AddressBar';
import AddressDialog from '../components/AddressDialog'; // Necesario para AddressBar
import ProductQuickView from '../components/ProductQuickView'; // Si quieres mantenerlo global
import BottomNav from '../components/BottomNav';
import FloatingCartFab from '../components/FloatingCartFab';
import Footer from '../components/Footer';
// Ya no necesitas importar Header.jsx

export default function RootLayout() {
  return (
    <>
      {/* Coloca aquí los componentes que quieres que aparezcan en todas las páginas públicas */}
      <NavBar />
      <AddressBar />

      {/* El Outlet renderizará el contenido específico de cada ruta (HomePage, StoresPage, etc.) */}
      <Outlet />

      {/* Componentes globales que van después del contenido o son flotantes */}
      <ProductQuickView /> {/* Modal global para vista rápida */}
      <AddressDialog />    {/* Modal global para dirección */}
      <FloatingCartFab />  {/* Botón flotante del carrito (móvil) */}
      <BottomNav />        {/* Navegación inferior (móvil) */}
      <Footer />           {/* Pie de página */}
    </>
  );
}