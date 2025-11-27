import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Typography, Container, Grid, Card, CardMedia, 
  CardContent, CardActions, Button, Chip, Divider, Alert, CircularProgress, Paper 
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import StarIcon from '@mui/icons-material/Star';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useCart } from '../context/CartContext';

export default function StoreDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  
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
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
  );

  if (error || !store) return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error" gutterBottom>{error || 'Error desconocido'}</Typography>
      <Button component={Link} to="/stores" variant="contained">Volver a Tiendas</Button>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {/* --- ENCABEZADO DE TIENDA --- */}
      <Box sx={{ 
        p: 4, mb: 4, borderRadius: 4, 
        bgcolor: 'primary.main', color: 'white',
        boxShadow: 3, position: 'relative', overflow: 'hidden'
      }}>
        {/* Decoración de fondo */}
        <StorefrontIcon sx={{ 
          position: 'absolute', right: -20, bottom: -20, 
          fontSize: 200, opacity: 0.15, color: 'white' 
        }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {store.name}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
              📍 {store.address}
            </Typography>
          </Grid>
          
          {/* Chips de Información (Extraídos de tu BD) */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
            <Chip 
              icon={<StarIcon sx={{ color: '#FFD700 !important' }} />} 
              label={store.rating > 0 ? store.rating : "Nuevo"} 
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }} 
            />
            <Chip 
              icon={<AccessTimeIcon />} 
              label={`${store.min_eta_minutes}-${store.max_eta_minutes} min`} 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)' }} 
            />
            <Chip 
              icon={<DeliveryDiningIcon />} 
              label={`Envío $${store.delivery_fee}`} 
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* ⛔ ALERTA SI LA TIENDA ESTÁ CERRADA (is_active = false) */}
        {!store.is_active && (
          <Alert severity="error" variant="filled" sx={{ mt: 2, fontWeight: 'bold' }}>
            🔴 ESTA TIENDA ESTÁ CERRADA MOMENTÁNEAMENTE
          </Alert>
        )}
      </Box>

      {/* --- PRODUCTOS --- */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', borderLeft: '5px solid #1976d2', pl: 2 }}>
        Nuestros Productos
      </Typography>

      <Grid container spacing={3}>
        {products.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography color="text.secondary">No hay productos disponibles por ahora.</Typography>
            </Paper>
          </Grid>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.product_id}>
              <Card elevation={2} sx={{ 
                height: '100%', display: 'flex', flexDirection: 'column', 
                transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } 
              }}>
                {product.image_url ? (
                  <CardMedia component="img" height="200" image={product.image_url} alt={product.name} />
                ) : (
                  <Box sx={{ height: 200, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Sin Imagen</Typography>
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                      {product.name}
                    </Typography>
                    <Chip label={product.size} size="small" color="primary" variant="outlined" />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>

                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ${product.price}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    // Si la tienda está cerrada, deshabilitamos el botón
                    disabled={!store.is_active} 
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => addToCart(product, store)}
                  >
                    {store.is_active ? 'Agregar al Carrito' : 'No Disponible'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}