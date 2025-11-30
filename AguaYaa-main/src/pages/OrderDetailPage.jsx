import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Grid, Divider, Button, 
  LinearProgress, Chip, CircularProgress, Alert, Fade
} from '@mui/material';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import { useAuth } from '../context/AuthContext';

// Configuración de Estados y Porcentajes
const statusConfig = {
  pending: { percent: 10, label: 'Recibido', color: 'warning', text: 'Esperando confirmación de la tienda...' },
  accepted: { percent: 30, label: 'Aceptado', color: 'info', text: 'La tienda aceptó tu pedido.' },
  preparing: { percent: 60, label: 'Preparando', color: 'info', text: 'Están llenando tus garrafones.' },
  on_route: { percent: 80, label: 'En Camino', color: 'primary', text: 'El repartidor va hacia tu domicilio.' },
  delivered: { percent: 100, label: 'Entregado', color: 'success', text: '¡Disfruta tu agua!' },
  cancelled: { percent: 100, label: 'Cancelado', color: 'error', text: 'El pedido fue cancelado.' }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-refresh para ver el avance en tiempo real (cada 10s)
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); 
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      // Usamos el endpoint de usuario para buscar el pedido
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/user/${user.uid}`);
      const data = await res.json();
      const found = data.find(o => o.order_id === parseInt(id));
      setOrder(found);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  if (loading) return <Box p={10} textAlign="center"><CircularProgress /></Box>;
  if (!order) return <Container sx={{mt:4}}><Alert severity="error">Pedido no encontrado</Alert></Container>;

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* HEADER */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: 2 }}>
        Volver
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Pedido #{order.order_id}</Typography>
        <Chip 
          label={currentStatus.label.toUpperCase()} 
          color={currentStatus.color} 
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {/* --- BARRA DE PROGRESO LÍQUIDA (WATER FLOW) --- */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: '#fafafa' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
          {currentStatus.label}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {currentStatus.text}
        </Typography>

        <Box sx={{ 
          position: 'relative', 
          height: 16, 
          bgcolor: '#E0E0E0', 
          borderRadius: 10, 
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)' 
        }}>
          <LinearProgress 
            variant="determinate" 
            value={currentStatus.percent} 
            sx={{ 
              height: '100%', 
              borderRadius: 10,
              bgcolor: 'transparent',
              '& .MuiLinearProgress-bar': {
                // EFECTO DE AGUA
                background: `linear-gradient(
                  90deg, 
                  #1565C0 0%,   
                  #42A5F5 25%,   
                  #E3F2FD 50%,   
                  #42A5F5 75%,   
                  #1565C0 100%   
                )`,
                backgroundSize: '200% auto',
                animation: order.status === 'delivered' ? 'none' : 'flowingWater 2s linear infinite', // Requiere @keyframes en index.css
                borderRadius: 10,
                transition: 'transform 1s ease-in-out',
                boxShadow: '0 0 10px rgba(33, 150, 243, 0.5)'
              }
            }} 
          />
        </Box>
        
        {/* Animación extra si está en camino */}
        {order.status === 'on_route' && (
          <Fade in={true}>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right', color: 'primary.main', fontWeight: 'bold' }}>
              🚚 El repartidor se está moviendo...
            </Typography>
          </Fade>
        )}
      </Paper>

      {/* DETALLES DE LA ENTREGA Y PAGO */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeliveryDiningIcon color="action" /> Entrega
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary">Dirección</Typography>
            <Typography paragraph fontWeight="medium">{order.delivery_address}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Tienda</Typography>
            <Typography paragraph fontWeight="medium">{order.local_name}</Typography>

            {/* Mapa Estático si hay coordenadas */}
            {order.delivery_lat && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapIcon color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">Ubicación GPS</Typography>
                  <Typography variant="caption">Lat: {order.delivery_lat}, Lng: {order.delivery_lng}</Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon color="action" /> Resumen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Typography variant="h5">Total</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ${parseFloat(order.total).toFixed(2)}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2 }}>
              Método: {order.payment_method === 'card' ? 'Tarjeta' : 'Efectivo'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}