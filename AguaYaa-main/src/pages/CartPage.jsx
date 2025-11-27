import React from 'react';
import {
  Box, Button, Container, IconButton, List, ListItem, 
  ListItemText, Typography, Paper, Divider, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { 
    items, store, increment, decrement, removeItem, 
    subtotal, shipping, total, clear 
  } = useCart();
  
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Tu carrito está vacío
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Explora nuestras tiendas y encuentra el mejor agua para ti.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/stores')}>
          Ver Tiendas
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Tu Pedido 🛒
      </Typography>

      {/* Encabezado de la Tienda */}
      {store && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="subtitle1">
            Comprando en: <strong>{store.name}</strong>
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* LISTA DE ITEMS */}
        <Grid item xs={12} md={8}>
          <List sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            {items.map((it) => (
              <React.Fragment key={it.id}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => decrement(it.id)} sx={{ bgcolor: '#f5f5f5' }}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography minWidth={24} textAlign="center" fontWeight="bold">
                        {it.qty}
                      </Typography>
                      <IconButton size="small" onClick={() => increment(it.id)} sx={{ bgcolor: '#f5f5f5' }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => removeItem(it.id)} sx={{ ml: 1 }}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="500">
                        {it.name} {it.size && <Typography component="span" variant="caption" color="text.secondary">({it.size})</Typography>}
                      </Typography>
                    }
                    secondary={`$${it.price} c/u`}
                  />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                    ${it.price * it.qty}
                  </Typography>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          <Button color="error" size="small" onClick={clear} sx={{ mt: 2 }}>
            Vaciar carrito
          </Button>
        </Grid>

        {/* RESUMEN DE CUENTA */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom>Resumen</Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Envío</Typography>
              <Typography>${shipping.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">Total</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ${total.toFixed(2)}
              </Typography>
            </Box>

            <Button 
              fullWidth 
              variant="contained" 
              size="large"
              onClick={() => navigate('/checkout')}
              sx={{ py: 1.5 }}
            >
              Proceder al Pago
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

import { Grid } from '@mui/material'; // Me faltó importar Grid arriba, asegúrate de incluirlo