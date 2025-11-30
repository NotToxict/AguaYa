import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Typography, Container, Grid, Button, Chip, Alert, CircularProgress, Paper 
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import StarIcon from '@mui/icons-material/Star';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Importamos el componente de tarjeta inteligente
import ProductCard from '../components/ProductCard';

export default function StoreDetailsPage() {
  const { id } = useParams();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Pedir info de la tienda
        const storeRes = await fetch(`${import.meta.env.VITE_API_URL}/stores/${id}`);
        if (!storeRes.ok) throw new Error("No se encontró la tienda");
        const storeData = await storeRes.json();
        setStore(storeData);

        // 2. Pedir productos (solo si la tienda existe)
        const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/stores/${id}/products`);
        const prodData = await prodRes.json();
        setProducts(prodData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  if (error || !store) return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error" gutterBottom>
        {error || 'Error desconocido'}
      </Typography>
      <Button component={Link} to="/stores" variant="contained" startIcon={<ArrowBackIcon />}>
        Volver a Tiendas
      </Button>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {/* --- ENCABEZADO DE TIENDA (Estilo Banner) --- */}
      <Box sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 4, 
        bgcolor: 'primary.main', 
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decoración de fondo */}
        <StorefrontIcon sx={{ 
          position: 'absolute', right: -20, bottom: -20, 
          fontSize: 250, opacity: 0.1, color: 'white',
          transform: 'rotate(-15deg)'
        }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Button 
              component={Link} to="/stores" 
              sx={{ color: 'white', opacity: 0.8, mb: 1, textTransform: 'none' }}
              startIcon={<ArrowBackIcon />}
            >
              Volver
            </Button>
            <Typography variant="h3" fontWeight="900" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)', letterSpacing: -1 }}>
              {store.name}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1, fontWeight: 400 }}>
              📍 {store.address}
            </Typography>
          </Grid>
          
          {/* Chips de Información (Logística) */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
            <Chip 
              icon={<StarIcon sx={{ color: '#FFD700 !important' }} />} 
              label={store.rating > 0 ? store.rating : "Nuevo"} 
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }} 
            />
            <Chip 
              icon={<AccessTimeIcon sx={{ color: 'white !important' }} />} 
              label={`${store.min_eta_minutes}-${store.max_eta_minutes} min`} 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)' }} 
            />
            <Chip 
              icon={<DeliveryDiningIcon sx={{ color: 'white !important' }} />} 
              label={`Envío $${store.delivery_fee}`} 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)' }} 
            />
          </Grid>
        </Grid>

        {/* ⛔ ALERTA SI LA TIENDA ESTÁ CERRADA */}
        {!store.is_active && (
          <Alert severity="error" variant="filled" sx={{ mt: 3, fontWeight: 'bold' }}>
            🔴 ESTA TIENDA ESTÁ CERRADA MOMENTÁNEAMENTE
          </Alert>
        )}
      </Box>

      {/* --- CATÁLOGO DE PRODUCTOS --- */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        💧 Productos Disponibles
      </Typography>

      <Grid container spacing={3}>
        {products.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Esta tienda aún no ha subido productos.
              </Typography>
              <Button component={Link} to="/stores" sx={{ mt: 2 }}>
                Buscar otra tienda
              </Button>
            </Paper>
          </Grid>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.product_id}>
              {/* Usamos el componente ProductCard inteligente */}
              <ProductCard product={product} storeInfo={store} />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}