import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, TextField, Button, Paper, 
  Grid, Divider, Alert, CircularProgress
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CheckoutPage() {
  const { items, store, subtotal, shipping, total, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Autocompletar nombre si el usuario está logueado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.displayName || '',
        // Podríamos traer dirección y teléfono si los guardamos en el perfil
      }));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>No hay productos para pagar.</Typography>
        <Button onClick={() => navigate('/stores')} sx={{ mt: 2 }}>Volver a Tiendas</Button>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Debes iniciar sesión para completar el pedido.");
      // Opcional: navigate('/login')
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        userId: user.uid, // ID de Firebase
        localId: store.id,
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
        notes: formData.notes,
        subtotal: subtotal,
        deliveryFee: shipping,
        total: total,
        items: items // Array de productos
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.ok) {
        clear(); // Vaciar carrito
        // Redirigir a página de "Mis Pedidos" o una pantalla de éxito
        // Por ahora, lo mandamos al historial de pedidos
        navigate('/orders'); 
      } else {
        setError(data.error || 'Error al procesar el pedido.');
      }

    } catch (err) {
      console.error(err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Finalizar Compra
      </Typography>

      <Grid container spacing={4}>
        {/* FORMULARIO DE ENVÍO */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Datos de Entrega</Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Nombre de quien recibe" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              <TextField 
                label="Teléfono de contacto" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required 
                placeholder="Ej: 631..."
              />
              <TextField 
                label="Dirección completa" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required 
                multiline rows={2}
                placeholder="Calle, Número, Colonia, Referencias..."
              />
              <TextField 
                label="Notas para el repartidor (Opcional)" 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ej: Tocar el timbre fuerte"
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? 'Procesando...' : `Confirmar Pedido ($${total.toFixed(2)})`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* RESUMEN */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, bgcolor: '#f9f9f9' }}>
            <Typography variant="h6" gutterBottom>Resumen del Pedido</Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tienda: <strong>{store?.name}</strong>
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {item.qty}x {item.name}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${(item.price * item.qty).toFixed(2)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Subtotal</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Envío</Typography>
              <Typography>${shipping.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h5" fontWeight="bold">Total</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ${total.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}