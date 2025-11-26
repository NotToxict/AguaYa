import React, { useMemo, useState, useEffect } from 'react';
import { Container, Grid, Typography, TextField, InputAdornment, Alert, Link as MLink } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

export default function CatalogPage() {
  const [q, setQ] = useState('');
  const { store } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!store) navigate('/stores');
  }, [store, navigate]);

  const products = store?.products || [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.name, p.size].filter(Boolean).some((t) => t.toLowerCase().includes(term))
    );
  }, [q, products]);

  if (!store) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: { xs: 10, md: 6 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        {store.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Entrega aprox. {store.etaMin} min • Envío ${store.deliveryFee} • <MLink component={RouterLink} to="/stores">Cambiar de tienda</MLink>
      </Typography>

      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar agua, garrafones, packs…"
        fullWidth
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {filtered.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No encontramos productos que coincidan con “{q}”.
        </Alert>
      )}

      <Grid container spacing={2}>
        {filtered.map((p) => {
          const withStore = { ...p, storeId: store.id };
          return (
            <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={withStore} />
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}