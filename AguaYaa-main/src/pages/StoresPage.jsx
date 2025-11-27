import React from 'react';
import {
  Box, Button, Card, CardActions, CardContent, CardMedia,
  Container, Grid, Rating, Typography, CircularProgress, Alert
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

export default function StoresPage() {
  const { stores, setStoreId, storeId, loading, error } = useStore();
  const { items, clear } = useCart();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    const numericId = parseInt(id, 10);
    const switching = storeId !== null && storeId !== numericId;
    const hasCart = items.length > 0;

    if (switching && hasCart) {
      const ok = window.confirm('Cambiar de tienda vaciará tu carrito. ¿Continuar?');
      if (!ok) return;
      clear();
    }
    
    setStoreId(numericId);
    // CORRECCIÓN IMPORTANTE: Navegar a la página de detalle que creamos antes
    navigate(`/store/${numericId}`); 
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <StorefrontIcon fontSize="large" color="primary" /> Tiendas Disponibles
      </Typography>

      {/* Indicador de Carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensaje de Error */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Lista Vacía */}
      {!loading && !error && stores.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No hay tiendas activas en este momento.</Typography>
        </Paper>
      )}

      {/* Grilla de Tiendas */}
      {!loading && !error && stores.length > 0 && (
        <Grid container spacing={3}>
          {stores.map((s) => (
            <Grid item key={s.id} xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                
                {/* IMAGEN DE LA TIENDA (Si tiene) */}
                {s.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={s.imageUrl}
                    alt={s.name}
                  />
                ) : (
                  <Box sx={{ height: 140, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StorefrontIcon sx={{ fontSize: 60, color: 'white', opacity: 0.5 }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {s.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Rating value={s.rating || 0} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({s.rating ? s.rating.toFixed(1) : 'Nuevo'})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">{s.etaMin} min</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalShippingIcon fontSize="small" color="action" />
                      <Typography variant="body2">${s.deliveryFee}</Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={() => handleSelect(s.id)}
                    endIcon={<StorefrontIcon />}
                  >
                    Ver Productos
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}