import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Paper, TextField, Button, 
  Avatar, Alert, Tabs, Tab, List, ListItem, ListItemText, Chip, Divider,
  CircularProgress, IconButton, Grid
} from '@mui/material';
// Iconos
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home'; // Nuevo icono
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { useAuth } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ProfilePage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]); // <--- Estado para direcciones
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Cargar datos al entrar
  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
      fetchOrders();
      fetchAddresses(); // <--- Cargar direcciones
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}`);
      const data = await res.json();
      setFormData({
        name: data.name || user.displayName || '',
        phone: data.phone || '',
        // Ya no usamos default_address aquí, usamos la lista real
      });
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/user/${user.uid}`);
      const data = await res.json();
      if(Array.isArray(data)) setOrders(data);
    } catch (e) { console.error(e); }
  };

  // Nueva función para traer la agenda de direcciones
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/addresses`);
      const data = await res.json();
      if(Array.isArray(data)) setAddresses(data);
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) setMsg({ type: 'success', text: 'Perfil actualizado' });
      else setMsg({ type: 'error', text: 'Error al actualizar' });
    } catch (e) { setMsg({ type: 'error', text: 'Error de conexión' }); }
    finally { setLoading(false); }
  };

  const handleVerifyEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMsg({ type: 'info', text: `Correo enviado a ${user.email}` });
      }
    } catch (e) { setMsg({ type: 'error', text: 'Error al enviar correo.' }); }
  };

  // Función para borrar dirección
  const handleDeleteAddress = async (addressId) => {
    if(!window.confirm("¿Borrar esta dirección?")) return;
    // Nota: Necesitaríamos crear la ruta DELETE en el backend si queremos que funcione
    // Por ahora solo la quitamos de la vista visualmente
    setAddresses(prev => prev.filter(a => a.address_id !== addressId));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar src={user?.photoURL} sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 40 }}>
          {user?.name ? user.name[0].toUpperCase() : <PersonIcon />}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">{formData.name || 'Mi Perfil'}</Typography>
          <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
          {auth.currentUser?.emailVerified ? (
            <Chip icon={<CheckCircleIcon />} label="Verificado" color="success" size="small" variant="outlined" sx={{ mt: 1 }} />
          ) : (
            <Chip label="No Verificado" color="warning" size="small" sx={{ mt: 1, cursor: 'pointer' }} onClick={() => setTabValue(3)} />
          )}
        </Box>
      </Box>

      {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile indicatorColor="primary" textColor="primary">
          <Tab icon={<PersonIcon />} label="Mis Datos" />
          <Tab icon={<HomeIcon />} label={`Direcciones (${addresses.length})`} />
          <Tab icon={<HistoryIcon />} label="Historial" />
          <Tab icon={<SecurityIcon />} label="Seguridad" />
        </Tabs>
      </Paper>

      {/* TAB 1: DATOS */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Nombre Completo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} fullWidth />
            <TextField label="Teléfono" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} fullWidth type="tel" />
            <Button type="submit" variant="contained" size="large" startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* TAB 2: DIRECCIONES (NUEVO) */}
      {tabValue === 1 && (
        <Paper>
          <List>
            {addresses.length === 0 ? (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">No tienes direcciones guardadas.</Typography>
                <Typography variant="caption">Guarda una al hacer tu próximo pedido.</Typography>
              </Box>
            ) : (
              addresses.map((addr) => (
                <React.Fragment key={addr.address_id}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAddress(addr.address_id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    }
                  >
                    <Avatar sx={{ bgcolor: '#e3f2fd', color: 'primary.main', mr: 2 }}>
                      <LocationOnIcon />
                    </Avatar>
                    <ListItemText 
                      primary={<Typography fontWeight="bold">{addr.alias}</Typography>}
                      secondary={addr.address}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}

      {/* TAB 3: HISTORIAL */}
      {tabValue === 2 && (
        <Paper>
          <List>
            {orders.map((order) => (
              <React.Fragment key={order.order_id}>
                <ListItem>
                  <ListItemText 
                    primary={order.local_name || `Pedido #${order.order_id}`}
                    secondary={`${new Date(order.created_at).toLocaleDateString()} - $${parseFloat(order.total).toFixed(2)}`}
                  />
                  <Chip label={order.status} size="small" color={order.status === 'delivered' ? 'success' : 'default'} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* TAB 4: SEGURIDAD */}
      {tabValue === 3 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Verificación de Cuenta</Typography>
          {!auth.currentUser?.emailVerified ? (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>Tu correo no ha sido confirmado.</Alert>
              <Button variant="contained" color="warning" onClick={handleVerifyEmail}>Enviar Correo de Verificación</Button>
            </Box>
          ) : (
            <Alert severity="success">¡Tu cuenta es segura!</Alert>
          )}
        </Paper>
      )}
    </Container>
  );
}