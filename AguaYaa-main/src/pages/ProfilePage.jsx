import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Paper, TextField, Button, 
  Grid, Avatar, Alert, Tabs, Tab, List, ListItem, ListItemText, Chip, Divider,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase'; // Asegúrate de importar 'auth' de tu config

export default function ProfilePage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({ name: '', phone: '', default_address: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // 1. Cargar datos del perfil y pedidos al entrar
  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}`);
      const data = await res.json();
      setFormData({
        name: data.name || user.displayName || '',
        phone: data.phone || '',
        default_address: data.default_address || ''
      });
    } catch (e) { console.error("Error perfil:", e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/user/${user.uid}`);
      const data = await res.json();
      if(Array.isArray(data)) setOrders(data);
    } catch (e) { console.error("Error pedidos:", e); }
  };

  // 2. Actualizar datos del usuario
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
      
      if (res.ok) setMsg({ type: 'success', text: 'Perfil actualizado correctamente' });
      else setMsg({ type: 'error', text: 'Error al actualizar' });
      
    } catch (e) { 
      setMsg({ type: 'error', text: 'Error de conexión' }); 
    } finally { 
      setLoading(false); 
    }
  };

  // 3. Enviar correo de verificación
  const handleVerifyEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMsg({ type: 'info', text: `Correo de verificación enviado a ${user.email}` });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error al enviar correo (Intenta más tarde)' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* HEADER DEL PERFIL */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar 
          src={user?.photoURL} 
          sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 40 }}
        >
          {user?.name ? user.name[0].toUpperCase() : <PersonIcon />}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {formData.name || 'Mi Perfil'}
          </Typography>
          <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
          
          {auth.currentUser?.emailVerified ? (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Verificado" 
              color="success" 
              size="small" 
              variant="outlined" 
              sx={{ mt: 1 }} 
            />
          ) : (
            <Chip 
              label="No Verificado" 
              color="warning" 
              size="small" 
              sx={{ mt: 1, cursor: 'pointer' }} 
              onClick={() => setTabValue(2)} // Llevar a tab de seguridad
            />
          )}
        </Box>
      </Box>

      {/* MENSAJES DE ALERTA */}
      {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

      {/* PESTAÑAS */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          variant="fullWidth" 
          indicatorColor="primary" 
          textColor="primary"
        >
          <Tab icon={<PersonIcon />} label="Mis Datos" />
          <Tab icon={<HistoryIcon />} label="Historial" />
          <Tab icon={<SecurityIcon />} label="Seguridad" />
        </Tabs>
      </Paper>

      {/* === TAB 1: MIS DATOS === */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              label="Nombre Completo" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              fullWidth 
            />
            <TextField 
              label="Teléfono de Contacto" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              fullWidth 
              type="tel" 
              helperText="Útil para que el repartidor te contacte"
            />
            <TextField 
              label="Dirección Predeterminada" 
              value={formData.default_address} 
              onChange={(e) => setFormData({...formData, default_address: e.target.value})} 
              fullWidth 
              multiline rows={2} 
              helperText="Esta dirección aparecerá automáticamente al pagar" 
            />
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} 
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* === TAB 2: HISTORIAL DE PEDIDOS === */}
      {tabValue === 1 && (
        <Paper>
          <List>
            {orders.length === 0 ? (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">Aún no has realizado pedidos.</Typography>
              </Box>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.order_id}>
                  <ListItem>
                    <ListItemText 
                      primary={order.local_name || `Pedido #${order.order_id}`}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {new Date(order.created_at).toLocaleDateString()} - {new Date(order.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </Typography>
                          Total: <strong>${parseFloat(order.total).toFixed(2)}</strong>
                        </>
                      }
                    />
                    <Chip 
                      label={order.status === 'delivered' ? 'Entregado' : order.status} 
                      size="small" 
                      color={order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'info'} 
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}

      {/* === TAB 3: SEGURIDAD === */}
      {tabValue === 2 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Estado de la Cuenta</Typography>
          
          {auth.currentUser?.emailVerified ? (
            <Alert severity="success" variant="outlined" sx={{ justifyContent: 'center' }}>
              ¡Tu correo está verificado y tu cuenta es segura!
            </Alert>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Tu correo electrónico <strong>({user.email})</strong> no ha sido confirmado.
                <br/>
                Verificarlo te ayuda a recuperar tu cuenta si olvidas la contraseña.
              </Alert>
              <Button variant="contained" color="warning" onClick={handleVerifyEmail}>
                Enviar Correo de Verificación
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}