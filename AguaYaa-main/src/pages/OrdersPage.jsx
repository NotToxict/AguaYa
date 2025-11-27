import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Box, Chip, Button, 
  CircularProgress, Grid, Divider
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format'; // Asegúrate de tener esta utilidad o usa una simple

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Petición al Backend usando el UID de Firebase
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/user/${user.uid}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para asignar color según el estado
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',    // Pendiente (Naranja)
      accepted: 'info',      // Aceptado (Azul)
      preparing: 'info',     // Preparando (Azul)
      on_route: 'primary',   // En camino (Morado/Principal)
      delivered: 'success',  // Entregado (Verde)
      cancelled: 'error'     // Cancelado (Rojo)
    };
    return colors[status] || 'default';
  };

  // Función para traducir el estado
  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      accepted: 'Aceptado',
      preparing: 'Preparando',
      on_route: 'En Camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Mis Pedidos 📦
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <ReceiptLongIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">Aún no has realizado pedidos.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <Paper key={order.order_id} sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <Grid container spacing={2} alignItems="center">
                
                {/* INFO PRINCIPAL */}
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6" fontWeight="bold">
                    {order.local_name} {/* Nombre de la tienda (viene del JOIN en el backend) */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    📍 {order.delivery_address}
                  </Typography>
                </Grid>

                {/* ESTADO Y PRECIO */}
                <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                  <Chip 
                    label={getStatusLabel(order.status)} 
                    color={getStatusColor(order.status)} 
                    variant="outlined" 
                    size="small" 
                    sx={{ mb: 1, fontWeight: 'bold' }}
                  />
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ${parseFloat(order.total).toFixed(2)}
                  </Typography>
                </Grid>

              </Grid>
              
              {/* Aquí podríamos poner un botón "Ver Detalles" en el futuro */}
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}