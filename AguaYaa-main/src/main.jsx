import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import "./index.css";

import RootLayout from "./layouts/RootLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { UIProvider } from "./context/UIContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext.jsx";

// CLIENTE
import HomePage from "./pages/HomePage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import StoresPage from "./pages/StoresPage.jsx";
import StoreDetailsPage from "./pages/StoreDetailsPage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// AUTH
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterBusinessPage from "./pages/auth/RegisterBusinessPage.jsx";
import RegisterClientPage from "./pages/auth/RegisterClientPage.jsx";

// ADMIN (LOCAL)
import LocalDashboardPage from "./pages/local/LocalDashboardPage.jsx";
import LocalProductsPage from "./pages/local/LocalProductsPage.jsx";
import LocalEmployeesPage from "./pages/local/LocalEmployeesPage.jsx";
import LocalSettingsPage from "./pages/local/LocalSettingsPage.jsx"; // <---
import LocalPromosPage from "./pages/local/LocalPromosPage.jsx"; // <---
import StoreVerificationPage from "./pages/local/StoreVerificationPage.jsx";

// SUPER ADMIN
import SuperAdminPage from "./pages/admin/SuperAdminPage.jsx";

// DELIVERY
import DeliveryDashboardPage from "./pages/delivery/DeliveryDashboardPage.jsx";

function AppProviders() {
  return (
    <StoreProvider>
      <UIProvider>
        <CartProvider>
          <AuthProvider>
            <SnackbarProvider maxSnack={3} autoHideDuration={2200} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
              <Outlet />
            </SnackbarProvider>
          </AuthProvider>
        </CartProvider>
      </UIProvider>
    </StoreProvider>
  );
}

const BASENAME = (import.meta.env.BASE_URL && import.meta.env.BASE_URL.replace(/\/$/, "")) || "";

const router = createBrowserRouter(
  [
    {
      element: <AppProviders />,
      children: [
        // PÚBLICAS
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterClientPage /> },
        { path: "register-business", element: <RegisterBusinessPage /> },
        
        // CLIENTE
        {
          path: "/",
          element: <ProtectedRoute element={<RootLayout />} />,
          children: [
            { index: true, element: <HomePage /> },
            { path: "stores", element: <StoresPage /> },
            { path: "store/:id", element: <StoreDetailsPage /> },
            { path: "catalog", element: <CatalogPage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "order/:id", element: <OrderDetailPage /> },
            { path: "profile", element: <ProfilePage /> },
            { path: "contact", element: <ContactPage /> },
            { path: "cart", element: <CartPage /> },
            { path: "checkout", element: <CheckoutPage /> },
          ],
        },

        { path: "verification", element: <StoreVerificationPage /> },

        // SUPER ADMIN
        {
          path: "admin",
          element: <ProtectedRoute element={<AdminLayout />} requiredRole="admin" />,
          children: [{ index: true, element: <SuperAdminPage /> }],
        },

        // LOCAL
        {
          path: "local",
          element: <ProtectedRoute element={<AdminLayout />} requiredRole="local" />,
          children: [
            { index: true, element: <LocalDashboardPage /> },
            { path: "products", element: <LocalProductsPage /> },
            { path: "employees", element: <LocalEmployeesPage /> },
            { path: "settings", element: <LocalSettingsPage /> }, // <--- NUEVO
            { path: "promos", element: <LocalPromosPage /> }, // <--- NUEVO
          ],
        },

        // DELIVERY
        {
          path: "delivery",
          element: <ProtectedRoute element={<AdminLayout />} requiredRole="delivery" />,
          children: [{ index: true, element: <DeliveryDashboardPage /> }],
        },

        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: BASENAME }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);