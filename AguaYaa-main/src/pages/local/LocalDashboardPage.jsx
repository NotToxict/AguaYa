import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Chip, Button, IconButton, Switch, FormControlLabel,
  Card, CardContent, CardActions, Divider, List, ListItem, ListItemText, Alert, CircularProgress,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, Avatar
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';

const getTimeAgo = (dateString) => {
  const minutes = Math.floor((new Date() - new Date(dateString)) / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes > 60) return `${Math.floor(minutes/60)}h`;
  return `${minutes}m`;
};

export default function LocalDashboardPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0); 
  
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today_count: 0, today_sales: 0 });
  const [storeStatus, setStoreStatus] = useState({ is_active: false });
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: { average: 0, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  // Estado para Sugerencias
  const [openSuggestion, setOpenSuggestion] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');

  useEffect(() => {
    if (user?.localId) {
      fetchDashboard();
      if (tabValue === 2) fetchReviews(); // Cargar reseñas si estamos en esa tab

      const interval = setInterval(() => {
         if (tabValue === 0) fetchDashboard(); 
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user, tabValue]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/dashboard/${user.localId}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setStats(data.stats || { today_count: 0, today_sales: 0 });
        setStoreStatus(data.storeStatus || {});
        setLoading(false);
      }
    } catch (error) { console.error(error); setLoading(false); }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/reviews/${user.localId}`);
      const data = await res.json();
      setReviewsData(data);
    } catch (error) { console.error(error); }
  };

  const toggleStore = async () => {
    const newState = !storeStatus.is_active;
    setStoreStatus(prev => ({ ...prev, is_active: newState }));
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/local/settings/${user.localId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...storeStatus, is_active: newState }) 
      });
    } catch (error) {
      setStoreStatus(prev => ({ ...prev, is_active: !newState }));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/local/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDashboard();
    } catch (e) { console.error(e); }
  };

  const handleSendSuggestion = async () => {
    if (!suggestionText.trim()) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/local/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, content: suggestionText })
      });
      alert("¡Sugerencia enviada! Gracias por ayudarnos a mejorar.");
      setOpenSuggestion(false);
      setSuggestionText('');
    } catch (e) { alert("Error al enviar"); }
  };

  const countPending = orders.filter(o => o.status === 'pending').length;
  const countFilling = orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length;
  const countRoute = orders.filter(o => o.status === 'on_route').length;

  if (loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 4 }}>
      
      {/* HEADER */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 0, bgcolor: '#1A2027', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={5} display="flex" alignItems="center" gap={2}>
            <StorefrontIcon fontSize="large" sx={{ color: storeStatus.is_active ? '#4caf50' : '#f44336' }} />
            <FormControlLabel
              control={<Switch checked={Boolean(storeStatus.is_active)} onChange={toggleStore} color="success" sx={{ transform: 'scale(1.3)', mr: 1 }} />}
              label={
                <Box>
                  <Typography variant="h6" fontWeight="bold">{storeStatus.is_active ? "TIENDA ABIERTA" : "TIENDA CERRADA"}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Horario: {storeStatus.opening_time?.slice(0,5)} - {storeStatus.closing_time?.slice(0,5)}</Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptLongIcon sx={{ color: '#90caf9' }} />
              <Box><Typography variant="h6" fontWeight="bold">{stats.today_count}</Typography><Typography variant="caption">Pedidos Hoy</Typography></Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon sx={{ color: '#66bb6a' }} />
              <Box><Typography variant="h6" fontWeight="bold">${stats.today_sales}</Typography><Typography variant="caption">Venta Hoy</Typography></Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={1} textAlign="right">
             <IconButton onClick={fetchDashboard} sx={{ color: 'white' }}><RefreshIcon /></IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* PESTAÑAS PRINCIPALES */}
      <Paper sx={{ mb: 3, mx: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary" variant="fullWidth">
          <Tab icon={<ListAltIcon />} label="Operación (Pedidos)" />
          <Tab icon={<TrendingUpIcon />} label="Métricas" />
          <Tab icon={<StarIcon />} label="Opiniones y Calidad" />
        </Tabs>
      </Paper>

      {/* === TAB 1: OPERACIÓN === */}
      {tabValue === 0 && (
        <Box sx={{ px: 3 }}>
          {/* Sub-Filtros de Estado */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Button fullWidth variant={filterStatus === 'pending' ? "contained" : "outlined"} color="error" onClick={() => setFilterStatus('pending')} sx={{ py: 1.5, flexDirection: 'column', borderBottomWidth: 4 }}>
                <Typography variant="h5" fontWeight="bold">{countPending}</Typography><Typography variant="caption">POR ACEPTAR</Typography>
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button fullWidth variant={filterStatus === 'preparing' ? "contained" : "outlined"} color="info" onClick={() => setFilterStatus('preparing')} sx={{ py: 1.5, flexDirection: 'column', borderBottomWidth: 4 }}>
                <Typography variant="h5" fontWeight="bold">{countFilling}</Typography><Typography variant="caption">LLENANDO</Typography>
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button fullWidth variant={filterStatus === 'on_route' ? "contained" : "outlined"} color="success" onClick={() => setFilterStatus('on_route')} sx={{ py: 1.5, flexDirection: 'column', borderBottomWidth: 4 }}>
                <Typography variant="h5" fontWeight="bold">{countRoute}</Typography><Typography variant="caption">EN REPARTO</Typography>
              </Button>
            </Grid>
          </Grid>

          {/* Tarjetas de Pedidos */}
          <Grid container spacing={2}>
            {orders.filter(o => {
                if (filterStatus === 'preparing') return o.status === 'accepted' || o.status === 'preparing';
                return o.status === filterStatus;
            }).map((order) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={order.order_id}>
                <Card elevation={3} sx={{ borderLeft: `5px solid ${order.status === 'pending' ? '#d32f2f' : order.status === 'on_route' ? '#2e7d32' : '#0288d1'}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={`#${order.order_id}`} size="small" />
                      <Chip icon={<AccessTimeIcon sx={{ fontSize: 14 }} />} label={getTimeAgo(order.created_at)} size="small" color={getTimeAgo(order.created_at).includes('h') ? 'error' : 'default'} variant="outlined" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">{order.customer_name}</Typography>
                    <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>📍 {order.delivery_address}</Typography>
                    {order.notes && <Alert severity="warning" sx={{ mt: 1, py: 0 }}>{order.notes}</Alert>}
                    <List dense disablePadding sx={{ mt: 1 }}>
                      {order.items.map((item, i) => (
                        <ListItem key={i} disablePadding><ListItemText primary={`${item.qty}x ${item.name}`} secondary={item.size} /></ListItem>
                      ))}
                    </List>
                    <Typography variant="h6" align="right" color="primary" fontWeight="bold">${parseFloat(order.total).toFixed(2)}</Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {order.status === 'pending' && <Button fullWidth variant="contained" color="error" onClick={() => updateOrderStatus(order.order_id, 'accepted')}>ACEPTAR</Button>}
                    {order.status === 'accepted' && <Button fullWidth variant="contained" color="info" startIcon={<WaterDropIcon/>} onClick={() => updateOrderStatus(order.order_id, 'preparing')}>LLENAR</Button>}
                    {order.status === 'preparing' && <Button fullWidth variant="contained" color="warning" startIcon={<DirectionsBikeIcon/>} onClick={() => updateOrderStatus(order.order_id, 'on_route')}>REPARTIR</Button>}
                    {order.status === 'on_route' && <Button fullWidth disabled variant="outlined">EN CAMINO</Button>}
                  </CardActions>
                </Card>
              </Grid>
            ))}
             {orders.filter(o => {
                if (filterStatus === 'preparing') return o.status === 'accepted' || o.status === 'preparing';
                return o.status === filterStatus;
            }).length === 0 && (
              <Grid item xs={12}><Box textAlign="center" py={8} color="text.secondary"><CheckCircleIcon sx={{ fontSize: 60, color: '#e0e0e0' }}/><Typography>No hay pedidos aquí.</Typography></Box></Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* === TAB 2: MÉTRICAS (Placeholder) === */}
      {tabValue === 1 && (
        <Box sx={{ px: 3, textAlign: 'center', py: 5 }}>
          <Typography variant="h5" color="text.secondary">Gráficas de ventas aquí próximamente...</Typography>
        </Box>
      )}

      {/* === TAB 3: OPINIONES Y SUGERENCIAS === */}
      {tabValue === 2 && (
        <Box sx={{ px: 3 }}>
          <Grid container spacing={4}>
            {/* Resumen de Calificación */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>Tu Calificación</Typography>
                <Typography variant="h1" fontWeight="bold" color="primary.main">
                  {reviewsData.summary.average ? parseFloat(reviewsData.summary.average).toFixed(1) : 'N/A'}
                </Typography>
                <Rating value={parseFloat(reviewsData.summary.average) || 0} precision={0.5} readOnly size="large" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Basado en {reviewsData.summary.total} opiniones
                </Typography>
              </Paper>

              {/* Botón de Sugerencias */}
              <Paper sx={{ p: 3, bgcolor: '#fff3e0', border: '1px solid #ffcc80' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                  <FeedbackIcon color="warning" /> ¿Tienes una idea?
                </Typography>
                <Typography variant="body2" paragraph>
                  Ayúdanos a mejorar AguaYa. Envíanos tus sugerencias o reporta problemas.
                </Typography>
                <Button variant="contained" color="warning" fullWidth onClick={() => setOpenSuggestion(true)}>
                  Enviar Sugerencia
                </Button>
              </Paper>
            </Grid>

            {/* Lista de Reseñas */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 2 }}>Comentarios Recientes</Typography>
              {reviewsData.reviews.length === 0 ? (
                <Alert severity="info">Aún no tienes reseñas de clientes.</Alert>
              ) : (
                reviewsData.reviews.map((rev, idx) => (
                  <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography fontWeight="bold">{rev.customer_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(rev.created_at).toLocaleDateString()}</Typography>
                    </Box>
                    <Rating value={rev.rating} readOnly size="small" sx={{ my: 0.5 }} />
                    <Typography variant="body2">{rev.comment}</Typography>
                  </Paper>
                ))
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* MODAL DE SUGERENCIAS */}
      <Dialog open={openSuggestion} onClose={() => setOpenSuggestion(false)} fullWidth maxWidth="sm">
        <DialogTitle>Enviar Sugerencia al Admin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="Escribe tu sugerencia o reporte..."
            fullWidth multiline rows={4} variant="outlined"
            value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuggestion(false)}>Cancelar</Button>
          <Button onClick={handleSendSuggestion} variant="contained" endIcon={<SendIcon />}>Enviar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}