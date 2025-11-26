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
import CatalogPage from "./pages/CatalogPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// PÁGINAS DE ADMINISTRACIÓN
import LoginPage from "./pages/auth/LoginPage.jsx";
import LocalDashboardPage from "./pages/local/LocalDashboardPage.jsx";
import LocalProductsPage from "./pages/local/LocalProductsPage.jsx";
import DeliveryDashboardPage from "./pages/delivery/DeliveryDashboardPage.jsx";

// Wrapper de providers QUE VAN DENTRO del Router (para que useNavigate funcione)
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

// Basename sincronizado con la base de Vite (quita la barra final si existe)
const BASENAME =
  (import.meta.env.BASE_URL && import.meta.env.BASE_URL.replace(/\/$/, "")) ||
  "";

// Definición de rutas
const router = createBrowserRouter(
  [
    {
      // Nivel raíz sin path: envuelve toda la app con los providers
      element: <AppProviders />,
      children: [
        // Rutas públicas con el RootLayout
        {
          path: "/",
          element: <RootLayout />,
          // Importante: quitamos el "*" de aquí para que no intercepte /login
          children: [
            { index: true, element: <HomePage /> },
            { path: "stores", element: <StoresPage /> },
            { path: "catalog", element: <CatalogPage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "contact", element: <ContactPage /> },
            { path: "cart", element: <CartPage /> },
            { path: "checkout", element: <CheckoutPage /> },
          ],
        },

        // Ruta de autenticación (sin RootLayout para que no muestre la navbar)
        { path: "login", element: <LoginPage /> },

        // Rutas protegidas: LOCAL
        {
          path: "local",
          element: (
            <ProtectedRoute element={<AdminLayout />} requiredRole="local" />
          ),
          children: [
            { index: true, element: <LocalDashboardPage /> },
            { path: "products", element: <LocalProductsPage /> },
          ],
        },

        // Rutas protegidas: DELIVERY
        {
          path: "delivery",
          element: (
            <ProtectedRoute element={<AdminLayout />} requiredRole="delivery" />
          ),
          children: [{ index: true, element: <DeliveryDashboardPage /> }],
        },

        // Catch-all GLOBAL (fuera de RootLayout)
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: BASENAME,
  }
);

// Bootstrap
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);