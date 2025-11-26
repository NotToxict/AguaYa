import React, { useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import AnimatedHero from "../components/AnimatedHero";
import StoreCarousel from "../components/StoreCarousel";
import ProductCarousel from "../components/ProductCarousel";
import ProductQuickView from "../components/ProductQuickView";
import products from "../data/products";
import stores from "../data/stores";
import { useSnackbar } from "notistack";

export default function HomePage() {
  const [selected, setSelected] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const addToCart = (p) => {
    // TODO: integra tu lógica real de carrito
    enqueueSnackbar(`${p?.name ?? "Producto"} agregado al carrito`, { variant: "success" });
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <AnimatedHero
        title="AguaYa — Tiendas cerca de ti"
        subtitle="Ofertas y productos destacadas de tus tiendas favoritas"
        ctaText="Ver tiendas"
        onCta={() => window.scrollTo({ top: 400, behavior: "smooth" })}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Tiendas destacadas
        </Typography>
        <StoreCarousel stores={stores ?? []} />
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Ofertas para ti
        </Typography>

        <ProductCarousel
          products={products}
          onQuickView={setSelected}
          onAdd={addToCart}
        />

        <ProductQuickView
          open={!!selected}
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
        />
      </Box>
    </Container>
  );
}