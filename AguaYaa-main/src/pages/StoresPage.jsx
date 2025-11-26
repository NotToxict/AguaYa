import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Rating,
  Typography,
  CircularProgress, // <-- Importa CircularProgress
  Alert, // <-- Importa Alert
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

export default function StoresPage() {
  // Obtiene loading, error y stores del contexto actualizado
  const { stores, setStoreId, storeId, loading, error } = useStore();
  const { items, clear } = useCart();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    const numericId = parseInt(id, 10); // Asegura que el ID sea número
    const switching = storeId !== null && storeId !== numericId;
    const hasCart = items.length > 0;

    if (switching && hasCart) {
      // Usamos un modal/dialogo custom si 'confirm' no funciona bien en iframes
      const ok = window.confirm('Cambiar de tienda vaciará tu carrito. ¿Continuar?');
      if (!ok) return;
      clear();
    }
    setStoreId(numericId); // Guarda el ID numérico
    navigate('/catalog');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: { xs: 10, md: 6 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Tiendas cercanas
      </Typography>

      {/* --- Indicador de Carga --- */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* --- Mensaje de Error --- */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* --- Lista de Tiendas (solo si no hay carga ni error) --- */}
      {!loading && !error && stores.length === 0 && (
          <Typography color="text.secondary">No hay tiendas disponibles por el momento.</Typography>
      )}

      {!loading && !error && stores.length > 0 && (
        <Grid container spacing={2}>
          {stores.map((s) => (
            <Grid item key={s.id} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>{s.name}</Typography>
                  {/* Rating y ETA (Asegúrate que los nombres de props coincidan con el mapeo en StoreContext) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
                    <Rating value={s.rating || 0} precision={0.1} readOnly size="small" />
                    <Typography variant="body2">{(s.rating || 0).toFixed(1)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1.5, color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" />
                      {/* Usa etaMin mapeado */}
                      <Typography variant="body2">{s.etaMin} min</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalShippingIcon fontSize="small" />
                      {/* Usa deliveryFee mapeado */}
                      <Typography variant="body2">Envío ${s.deliveryFee}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button fullWidth variant="contained" onClick={() => handleSelect(s.id)}>
                    Entrar a la tienda
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