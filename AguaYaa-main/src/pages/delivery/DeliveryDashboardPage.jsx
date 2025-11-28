import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, CardActions, 
  Button, Chip, Divider, Container, Alert, IconButton 
} from '@mui/material';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import { useAuth } from '../../context/AuthContext';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar pedidos al entrar
  useEffect(() => {
    if (user?.uid) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Pedimos las órdenes pendientes para ESTE chofer (basado en su tienda)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/delivery/pending-orders?uid=${user.uid}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Error cargando entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (orderId) => {
    if (!window.confirm("¿Confirmar que ya entregaste el pedido y recibiste el dinero?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/delivery/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }) // Enviamos quién lo entregó
      });

      if (res.ok) {
        alert("¡Excelente trabajo! Pedido completado.");
        fetchOrders(); // Recargar lista
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  const openMap = (address) => {
    // Truco: Abre la dirección en Google Maps App
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " Nogales Sonora")}`;
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TwoWheelerIcon color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight="bold">
          Mis Entregas ({orders.length})
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          No hay pedidos en ruta por ahora. ¡Descansa un poco! 😴
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <Card key={order.order_id} elevation={4} sx={{ borderTop: '4px solid #1976d2' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {order.customer_name}
                  </Typography>
                  <Chip label={`#${order.order_id}`} size="small" />
                </Box>

                {/* Botones de Acción Rápida (Llamar / Mapa) */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button 
                    variant="outlined" size="small" startIcon={<MapIcon />}
                    onClick={() => openMap(order.delivery_address)}
                  >
                    Ver Mapa
                  </Button>
                  <Button 
                    variant="outlined" size="small" startIcon={<PhoneIcon />}
                    href={`tel:${order.customer_phone}`}
                  >
                    Llamar
                  </Button>
                </Box>

                <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 2 }}>
                  📍 {order.delivery_address}
                </Typography>

                {order.notes && (
                  <Typography variant="caption" sx={{ color: 'orange', display: 'block', mb: 1 }}>
                    ⚠ Nota: {order.notes}
                  </Typography>
                )}

                <Divider />
                
                <Box sx={{ mt: 2 }}>
                  {order.items.map((item, idx) => (
                    <Typography key={idx} variant="body2">
                      • {item.qty}x {item.name}
                    </Typography>
                  ))}
                </Box>

                <Typography variant="h5" align="right" color="primary" fontWeight="bold" sx={{ mt: 1 }}>
                  Cobrar: ${parseFloat(order.total).toFixed(2)}
                </Typography>
              </CardContent>

              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success" 
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleDeliver(order.order_id)}
                >
                  ENTREGADO / COBRADO
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}