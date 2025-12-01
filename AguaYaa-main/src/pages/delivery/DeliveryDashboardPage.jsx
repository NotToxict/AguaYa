import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, CardActions, 
  Button, Chip, Divider, Container, Alert, Paper, IconButton, LinearProgress,
  Avatar, Tabs, Tab, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress // <--- ¡ESTE FALTABA!
} from '@mui/material';
// Iconos
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigationIcon from '@mui/icons-material/Navigation';
import TimerIcon from '@mui/icons-material/Timer';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import MapIcon from '@mui/icons-material/Map';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- COMPONENTE CRONÓMETRO ---
const DeliveryTimer = ({ orderId }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (active && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  const handleArrived = async () => {
    setLoading(true);
    try {
      // Avisar al servidor (Timbre digital)
      await fetch(`${import.meta.env.VITE_API_URL}/delivery/orders/${orderId}/arrived`, {
        method: 'PUT'
      });
      setActive(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  if (!active) return (
    <Button 
      fullWidth variant="outlined" color="warning" 
      startIcon={loading ? <CircularProgress size={20}/> : <PlaceIcon />} 
      onClick={handleArrived} 
      disabled={loading}
      sx={{ mb: 2 }}
    >
      {loading ? 'Notificando...' : 'Ya llegué al domicilio'}
    </Button>
  );

  return (
    <Alert severity={timeLeft === 0 ? "error" : "info"} icon={<TimerIcon />} sx={{ mb: 2, alignItems: 'center' }}
      action={<Typography variant="h6" fontWeight="bold">{formatTime(timeLeft)}</Typography>}
    >
      {timeLeft === 0 ? "Tiempo agotado" : "Esperando al cliente..."}
    </Alert>
  );
};

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  const [pendingOrders, setPendingOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estado para el Modal de Perfil
  const [openProfile, setOpenProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Carga inicial
  useEffect(() => {
    if (user?.uid) {
      fetchData();
      setProfileForm({
        name: user.name || user.displayName || '',
        phone: user.phone || ''
      });
      const interval = setInterval(() => { if (tabValue === 0) fetchPending(); }, 15000);
      return () => clearInterval(interval);
    }
  }, [user, tabValue]);

  const fetchData = () => { fetchPending(); fetchHistory(); };

  const fetchPending = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/delivery/pending-orders?uid=${user.uid}`);
      const data = await res.json();
      if (Array.isArray(data)) setPendingOrders(data);
    } catch (error) { console.error(error); } 
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/delivery/history?uid=${user.uid}`);
      const data = await res.json();
      setHistory(data.history || []);
      setTotalCollected(data.totalCollected || 0);
    } catch (error) { console.error(error); }
  };

  const handleDeliver = async (orderId) => {
    if (!window.confirm("¿Confirmar entrega y cobro?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/delivery/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      if (res.ok) {
        fetchData(); 
        alert("¡Entrega registrada!");
      }
    } catch (error) { alert("Error de conexión"); }
    finally { setLoading(false); }
  };

  // --- LÓGICA DE PERFIL RÁPIDO ---
  const handleOpenProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}`);
      const data = await res.json();
      setProfileForm({
        name: data.name || user.displayName || '',
        phone: data.phone || ''
      });
      setOpenProfile(true);
    } catch (e) { console.error(e); }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm) 
      });
      if (res.ok) {
        alert("Datos actualizados correctamente.");
        setOpenProfile(false);
      } else {
        alert("Error al guardar.");
      }
    } catch (e) { alert("Error de conexión."); }
    finally { setSavingProfile(false); }
  };

  const openNavigation = (lat, lng, address) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
    } else {
      const query = encodeURIComponent(address + " Nogales Sonora");
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      
      {/* HEADER REPARTIDOR */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#4a148c', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={user?.photoURL} sx={{ bgcolor: '#ea80fc', color: '#4a148c', fontWeight: 'bold' }}>
            {user?.displayName?.[0] || user?.name?.[0] || 'R'}
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Hola,</Typography>
            <Typography variant="h6" fontWeight="bold" lineHeight={1}>
              {user?.name || user?.displayName || "Repartidor"}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleOpenProfile} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
          <EditIcon />
        </IconButton>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth" indicatorColor="secondary" textColor="secondary">
          <Tab icon={<MapIcon />} label={`Ruta (${pendingOrders.length})`} />
          <Tab icon={<AttachMoneyIcon />} label="Ganancias" />
        </Tabs>
      </Paper>

      {/* === TAB 1: RUTA === */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading && <LinearProgress />}
          
          {pendingOrders.length === 0 ? (
            <Alert severity="success" variant="outlined" sx={{ mt: 2 }}>¡Todo entregado! Esperando nuevos pedidos...</Alert>
          ) : (
            pendingOrders.map((order) => (
              <Card key={order.order_id} elevation={4} sx={{ borderLeft: '6px solid #9c27b0', borderRadius: 2 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">{order.customer_name}</Typography>
                    <Chip label={`#${order.order_id}`} size="small" color="secondary" />
                  </Box>

                  <Box onClick={() => openNavigation(order.delivery_lat, order.delivery_lng, order.delivery_address)} sx={{ bgcolor: '#f3e5f5', p: 2, borderRadius: 2, mb: 2, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e1bee7' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">DIRECCIÓN DE ENTREGA</Typography>
                      <Typography variant="body2" fontWeight="500">{order.delivery_address}</Typography>
                    </Box>
                    <NavigationIcon color="secondary" />
                  </Box>

                  <DeliveryTimer orderId={order.order_id} />

                  <Button variant="outlined" color="success" fullWidth startIcon={<PhoneIcon />} href={`tel:${order.customer_phone}`} sx={{ mb: 2, borderRadius: 2 }}>
                    Llamar al Cliente
                  </Button>

                  <Divider sx={{ my: 1 }} />
                  {order.items.map((item, idx) => (
                    <Typography key={idx} variant="body2">• <strong>{item.qty}x</strong> {item.name}</Typography>
                  ))}
                  {order.notes && <Typography variant="caption" sx={{ color: '#ed6c02', display: 'block', mt: 1, fontWeight: 'bold', bgcolor: '#fff3e0', p: 0.5 }}>📝 Nota: {order.notes}</Typography>}

                  <Typography variant="h4" align="center" color="primary.main" fontWeight="bold" sx={{ mt: 2 }}>${parseFloat(order.total).toFixed(2)}</Typography>
                  <Typography variant="caption" align="center" display="block" color="text.secondary">COBRAR EN EFECTIVO</Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button fullWidth variant="contained" color="success" size="large" startIcon={<CheckCircleIcon />} onClick={() => handleDeliver(order.order_id)} sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 'bold' }}>ENTREGADO</Button>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* === TAB 2: HISTORIAL Y CAJA === */}
      {tabValue === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#2e7d32', color: 'white', textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Efectivo en Mano</Typography>
            <Typography variant="h2" fontWeight="bold">${parseFloat(totalCollected).toFixed(2)}</Typography>
            <Typography variant="caption">Total acumulado hoy</Typography>
          </Paper>

          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon /> Historial de Hoy
          </Typography>

          <Paper>
            <List dense>
              {history.map((order) => (
                <React.Fragment key={order.order_id}>
                  <ListItem>
                    <ListItemText primary={order.customer_name} secondary={new Date(order.delivered_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
                    <Typography fontWeight="bold" color="success.main">+${parseFloat(order.total).toFixed(2)}</Typography>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
              {history.length === 0 && <ListItem><ListItemText secondary="No hay entregas registradas." /></ListItem>}
            </List>
          </Paper>
        </Box>
      )}

      {/* === MODAL DE PERFIL RÁPIDO === */}
      <Dialog open={openProfile} onClose={() => setOpenProfile(false)} fullWidth maxWidth="xs">
        <DialogTitle>Mis Datos</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Nombre" fullWidth value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
            <TextField 
              label="Teléfono de contacto" fullWidth type="tel" value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              helperText="Este número verá el cliente si le llamas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfile(false)}>Cancelar</Button>
          <Button onClick={handleSaveProfile} variant="contained" disabled={savingProfile} startIcon={<SaveIcon />}>
            {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}