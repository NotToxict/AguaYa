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
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

export default function StoresPage() {
  const { stores, setStoreId, storeId } = useStore();
  const { items, clear } = useCart();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    const switching = storeId && storeId !== id;
    const hasCart = items.length > 0;
    if (switching && hasCart) {
      const ok = window.confirm('Cambiar de tienda vaciará tu carrito. ¿Continuar?');
      if (!ok) return;
      clear();
    }
    setStoreId(id);
    navigate('/catalog');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: { xs: 10, md: 6 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Tiendas cercanas
      </Typography>
      <Grid container spacing={2}>
        {stores.map((s) => (
          <Grid item key={s.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>{s.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
                  <Rating value={s.rating} precision={0.1} readOnly size="small" />
                  <Typography variant="body2">{s.rating.toFixed(1)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 1.5, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">{s.etaMin} min</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocalShippingIcon fontSize="small" />
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
    </Container>
  );
}