import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import "./index.css";

// LAYOUTS Y CONTEXTOS
import RootLayout from "./layouts/RootLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { UIProvider } from "./context/UIContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext.jsx";

// PÁGINAS DE CLIENTE
import HomePage from "./pages/HomePage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import StoresPage from "./pages/StoresPage.jsx";
import StoreDetailsPage from "./pages/StoreDetailsPage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// PÁGINAS DE AUTENTICACIÓN
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterBusinessPage from "./pages/auth/RegisterBusinessPage.jsx";

// PÁGINAS DE ADMINISTRACIÓN
import LocalDashboardPage from "./pages/local/LocalDashboardPage.jsx";
import LocalProductsPage from "./pages/local/LocalProductsPage.jsx";
import LocalEmployeesPage from "./pages/local/LocalEmployeesPage.jsx";
import StoreVerificationPage from "./pages/local/StoreVerificationPage.jsx"; // <--- Página de Bloqueo
import SuperAdminPage from "./pages/admin/SuperAdminPage.jsx"; // <--- Página del Jefe Supremo
import DeliveryDashboardPage from "./pages/delivery/DeliveryDashboardPage.jsx";

// Wrapper de providers
function AppProviders() {
  return (
    <StoreProvider>
      <UIProvider>
        <CartProvider>
          <AuthProvider>
            <SnackbarProvider
              maxSnack={3}
              autoHideDuration={2200}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Outlet />
            </SnackbarProvider>
          </AuthProvider>
        </CartProvider>
      </UIProvider>
    </StoreProvider>
  );
}

const BASENAME =
  (import.meta.env.BASE_URL && import.meta.env.BASE_URL.replace(/\/$/, "")) ||
  "";

// Definición de rutas
const router = createBrowserRouter(
  [
    {
      element: <AppProviders />,
      children: [
        // --- RUTAS PÚBLICAS (Cliente) ---
        {
          path: "/",
          element: <RootLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: "stores", element: <StoresPage /> },
            { path: "store/:id", element: <StoreDetailsPage /> },
            { path: "catalog", element: <CatalogPage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "contact", element: <ContactPage /> },
            { path: "cart", element: <CartPage /> },
            { path: "checkout", element: <CheckoutPage /> },
          ],
        },

        // --- AUTENTICACIÓN ---
        { path: "login", element: <LoginPage /> },
        { path: "register-business", element: <RegisterBusinessPage /> },
        
        // --- RUTA DE VERIFICACIÓN (Sala de Espera) ---
        { path: "verification", element: <StoreVerificationPage /> },

        // --- RUTAS PROTEGIDAS: SUPER ADMIN ---
        {
          path: "admin",
          element: (
            <ProtectedRoute element={<AdminLayout />} requiredRole="admin" />
          ),
          children: [{ index: true, element: <SuperAdminPage /> }],
        },

        // --- RUTAS PROTEGIDAS: TIENDA (LOCAL) ---
        {
          path: "local",
          element: (
            <ProtectedRoute element={<AdminLayout />} requiredRole="local" />
          ),
          children: [
            { index: true, element: <LocalDashboardPage /> },
            { path: "products", element: <LocalProductsPage /> },
            { path: "employees", element: <LocalEmployeesPage /> },
          ],
        },

        // --- RUTAS PROTEGIDAS: REPARTIDOR ---
        {
          path: "delivery",
          element: (
            <ProtectedRoute element={<AdminLayout />} requiredRole="delivery" />
          ),
          children: [{ index: true, element: <DeliveryDashboardPage /> }],
        },

        // Catch-all
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: BASENAME,
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);