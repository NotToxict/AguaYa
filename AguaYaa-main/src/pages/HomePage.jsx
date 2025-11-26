import React, { useState, useEffect } from "react"; // Añadir useEffect
import { Container, Box, Typography, CircularProgress, Alert } from "@mui/material"; // Añadir CircularProgress, Alert
import AnimatedHero from "../components/AnimatedHero";
import StoreCarousel from "../components/StoreCarousel";
import ProductCarousel from "../components/ProductCarousel";
import ProductQuickView from "../components/ProductQuickView";
// Quitar importación directa de datos: import products from "../data/products";
// Quitar importación directa de datos: import stores from "../data/stores";
import { useSnackbar } from "notistack";
// Importar los nuevos servicios
import { fetchFeaturedStores, fetchFeaturedProducts } from "../services/storeService";

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Estados para tiendas destacadas
  const [featuredStores, setFeaturedStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState(null);

  // Estados para productos destacados (ofertas)
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Efecto para cargar datos al montar
  useEffect(() => {
    // Cargar tiendas destacadas
    setStoresLoading(true);
    setStoresError(null);
    fetchFeaturedStores()
      .then(setFeaturedStores)
      .catch(err => {
        console.error("Error fetching featured stores:", err);
        setStoresError("No se pudieron cargar las tiendas destacadas.");
      })
      .finally(() => setStoresLoading(false));

    // Cargar productos destacados
    setProductsLoading(true);
    setProductsError(null);
    fetchFeaturedProducts()
      .then(setFeaturedProducts)
      .catch(err => {
        console.error("Error fetching featured products:", err);
        setProductsError("No se pudieron cargar las ofertas.");
      })
      .finally(() => setProductsLoading(false));

  }, []); // Cargar solo al montar

  const addToCart = (p) => {
    // TODO: integra tu lógica real de carrito
    // Asegúrate de que tu lógica de useCart ya esté conectada si la necesitas aquí.
    enqueueSnackbar(`${p?.name ?? "Producto"} agregado al carrito`, { variant: "success" });
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 2, mb: { xs: 10, md: 6 } }}> {/* Añadido margen inferior */}
      <AnimatedHero
        title="AguaYa — Tiendas cerca de ti"
        subtitle="Ofertas y productos destacadas de tus tiendas favoritas"
        ctaText="Ver tiendas"
        onCta={() => window.scrollTo({ top: 400, behavior: "smooth" })}
      />

      {/* Sección Tiendas Destacadas */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Tiendas destacadas
        </Typography>
        {storesLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>}
        {storesError && !storesLoading && <Alert severity="warning" sx={{ mb: 2 }}>{storesError}</Alert>}
        {!storesLoading && !storesError && <StoreCarousel stores={featuredStores} />}
      </Box>

      {/* Sección Ofertas */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Ofertas para ti
        </Typography>
        {productsLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>}
        {productsError && !productsLoading && <Alert severity="error" sx={{ mb: 2 }}>{productsError}</Alert>}
        {!productsLoading && !productsError && (
          <ProductCarousel
            products={featuredProducts}
            onQuickView={handleQuickView}
            onAdd={addToCart}
          />
        )}
      </Box>

      {/* Modal QuickView (sin cambios) */}
      <ProductQuickView
        open={!!selectedProduct}
        product={selectedProduct}
        onClose={handleCloseQuickView}
        onAdd={addToCart}
      />
    </Container>
  );
}