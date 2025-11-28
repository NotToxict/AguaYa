import React, { useEffect, useState } from 'react';
import { 
  Typography, Box, Paper, Grid, Chip, Button, 
  Card, CardContent, CardActions, Divider, List, ListItem, ListItemText,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HistoryIcon from '@mui/icons-material/History';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useAuth } from '../../context/AuthContext';

export default function LocalDashboardPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0); // 0 = Activos, 1 = Historial
  
  // Estados para Activos
  const [activeOrders, setActiveOrders] = useState([]);
  
  // Estados para Historial
  const [historyOrders, setHistoryOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (user?.localId) {
      fetchActiveOrders();
      if (tabValue === 1) fetchHistory(); // Solo cargar historial si estamos en esa pestaña

      // Auto-refresh solo para pedidos activos (cada 10 segundos)
      const interval = setInterval(() => {
        if (tabValue === 0) fetchActiveOrders();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user, tabValue]);

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/orders/${user.localId}`);
      const data = await res.json();
      if (Array.isArray(data)) setActiveOrders(data);
    } catch (error) { console.error("Error cargando activos:", error); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/history/${user.localId}`);
      const data = await res.json();
      setHistoryOrders(data.orders || []);
      setTotalSales(data.totalSales || 0);
    } catch (error) { console.error("Error cargando historial:", error); }
  };

  // --- LÓGICA DE ESTADOS ---
  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/local/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchActiveOrders(); // Recargar lista al instante
    } catch (error) { console.error("Error actualizando estado:", error); }
  };

  // Botones dinámicos según el estado del pedido
  const renderActions = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <Button 
            fullWidth variant="contained" color="success" 
            startIcon={<CheckCircleIcon />}
            onClick={() => updateStatus(order.order_id, 'accepted')}
          >
            Aceptar Pedido
          </Button>
        );
      case 'accepted':
        return (
          <Button 
            fullWidth variant="contained" color="info" 
            startIcon={<RestaurantMenuIcon />}
            onClick={() => updateStatus(order.order_id, 'preparing')}
          >
            Empezar a Llenar
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            fullWidth variant="contained" color="warning" 
            startIcon={<LocalShippingIcon />}
            onClick={() => updateStatus(order.order_id, 'on_route')}
          >
            Listo para Reparto
          </Button>
        );
      case 'on_route':
        return (
          <Alert severity="info" icon={<LocalShippingIcon />} sx={{ width: '100%' }}>
            En camino con el repartidor
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Panel de Control
      </Typography>

      {/* --- PESTAÑAS DE NAVEGACIÓN --- */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          indicatorColor="primary" 
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<ListAltIcon />} label={`Activos (${activeOrders.length})`} />
          <Tab icon={<HistoryIcon />} label="Ventas y Historial" />
        </Tabs>
      </Paper>

      {/* === PESTAÑA 1: PEDIDOS ACTIVOS === */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {activeOrders.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" color="text.secondary">
                  Todo tranquilo. No hay pedidos pendientes. 🍃
                </Typography>
              </Paper>
            </Grid>
          ) : (
            activeOrders.map((order) => (
              <Grid item xs={12} md={6} lg={4} key={order.order_id}>
                <Card elevation={4} sx={{ borderLeft: '6px solid #1976d2', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip label={`Orden #${order.order_id}`} color="primary" size="small" />
                      <Chip label={order.status.toUpperCase()} variant="outlined" size="small" />
                    </Box>
                    
                    <Typography variant="h6" fontWeight="bold">{order.customer_name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📞 {order.customer_phone}
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 1, my: 1, bgcolor: '#fafafa' }}>
                      <Typography variant="body2">📍 {order.delivery_address}</Typography>
                    </Paper>

                    {order.notes && (
                      <Typography variant="caption" display="block" sx={{ mb: 2, color: 'orange', fontWeight: 'bold' }}>
                        📝 Nota: {order.notes}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />
                    
                    <List dense disablePadding>
                      {order.items.map((item, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={
                              <Typography variant="body2">
                                <strong>{item.qty}x</strong> {item.name}
                              </Typography>
                            } 
                            secondary={item.size} 
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Typography variant="h5" color="primary.main" fontWeight="bold">
                        ${parseFloat(order.total).toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {renderActions(order)}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* === PESTAÑA 2: HISTORIAL Y VENTAS === */}
      {tabValue === 1 && (
        <Box>
          {/* TARJETA DE DINERO TOTAL */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
            <AttachMoneyIcon sx={{ fontSize: 50 }} />
            <Box>
              <Typography variant="subtitle1">Ventas Totales Cobradas</Typography>
              <Typography variant="h3" fontWeight="bold">${parseFloat(totalSales).toFixed(2)}</Typography>
            </Box>
          </Paper>

          {/* TABLA DE HISTORIAL */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#eee' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Fecha Entrega</strong></TableCell>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell align="right"><strong>Monto</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyOrders.map((row) => (
                  <TableRow key={row.order_id} hover>
                    <TableCell>#{row.order_id}</TableCell>
                    <TableCell>
                      {new Date(row.delivered_at).toLocaleDateString()} <br/>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(row.delivered_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${row.total}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label="Entregado" color="success" size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
                {historyOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      Aún no tienes ventas registradas. ¡Ánimo!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}