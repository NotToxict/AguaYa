import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, TextField, Button, Paper, 
  Grid, Divider, Alert, CircularProgress, FormControlLabel, Checkbox,
  Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemText, ListItemIcon
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import LocationPicker from '../components/LocationPicker';

export default function CheckoutPage() {
  const { items, store, subtotal, shipping, total, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [saveAddress, setSaveAddress] = useState(false); // Checkbox para guardar
  const [addressAlias, setAddressAlias] = useState(''); // Nombre (Casa, Ofi)
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para el diálogo de "Mis Direcciones"
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // 1. Cargar datos del usuario al iniciar
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.displayName || '',
        phone: user.phone || '' // Si ya lo tiene en perfil, lo usamos
      }));
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/addresses`);
      const data = await res.json();
      if (Array.isArray(data)) setSavedAddresses(data);
    } catch (e) { console.error(e); }
  };

  // Cuando selecciona una dirección guardada
  const handleSelectAddress = (addr) => {
    setFormData(prev => ({ ...prev, address: addr.address }));
    setCoords({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) });
    setOpenAddressDialog(false); // Cerrar modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords.lat || !coords.lng) {
      setError("Por favor selecciona tu ubicación exacta en el mapa.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // A. SI EL USUARIO QUISO GUARDAR LA DIRECCIÓN
      if (saveAddress) {
        await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alias: addressAlias || 'Nueva Dirección',
            address: formData.address,
            lat: coords.lat,
            lng: coords.lng
          })
        });
      }

      // B. PROCESAR EL PEDIDO
      const payload = {
        userId: user.uid,
        localId: store.id,
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryAddress: `${formData.address} (GPS: ${coords.lat}, ${coords.lng})`,
        deliveryLat: coords.lat,
        deliveryLng: coords.lng,
        notes: formData.notes,
        subtotal, deliveryFee: shipping, total, items
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.ok) {
        clear();
        navigate('/orders'); 
      } else {
        setError(data.error || 'Error al procesar el pedido.');
      }

    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return <Container sx={{ mt: 4 }}>No hay productos.</Container>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Finalizar Compra</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            
            {/* ENCABEZADO Y BOTÓN DE DIRECCIONES GUARDADAS */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" /> Ubicación
              </Typography>
              {savedAddresses.length > 0 && (
                <Button variant="outlined" size="small" onClick={() => setOpenAddressDialog(true)}>
                  Mis Direcciones
                </Button>
              )}
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* MAPA */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>1. Confirma el punto en el mapa:</Typography>
                {/* Pasamos 'key' con las coordenadas para forzar que el mapa se redibuje si cambian */}
                <LocationPicker 
                  key={`${coords.lat}-${coords.lng}`} 
                  initialPosition={coords.lat ? coords : undefined}
                  onLocationSelect={setCoords} 
                />
              </Box>

              {/* DETALLES */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>2. Datos de entrega:</Typography>
                <TextField 
                  label="Referencias / Dirección Escrita" 
                  placeholder="Calle, Número, Colonia..."
                  multiline rows={2} fullWidth required 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  sx={{ mb: 2 }}
                />
                
                {/* CHECKBOX PARA GUARDAR */}
                <Box sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: 2, mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />}
                    label="Guardar esta dirección para futuros pedidos"
                  />
                  {saveAddress && (
                    <TextField 
                      label="Nombre de la dirección (Ej: Casa, Oficina)" 
                      size="small" fullWidth sx={{ mt: 1, bgcolor: 'white' }}
                      value={addressAlias}
                      onChange={(e) => setAddressAlias(e.target.value)}
                    />
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      label="Nombre" fullWidth required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      label="Teléfono" fullWidth required type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Button 
                type="submit" variant="contained" size="large" disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? 'Procesando...' : `Confirmar Pedido ($${total.toFixed(2)})`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* RESUMEN */}
        <Grid item xs={12} md={5}>
          {/* ... (Aquí va el mismo código de resumen que ya tenías) ... */}
          {/* Para ahorrar espacio en el chat, asumo que dejas el bloque del resumen igual */}
          <Paper sx={{ p: 3, bgcolor: '#f9f9f9', position: 'sticky', top: 100 }}>
            <Typography variant="h6">Resumen</Typography>
            <Divider sx={{ my: 2 }} />
            {items.map(i => <Box key={i.id} mb={1}>{i.qty}x {i.name} - ${(i.price*i.qty).toFixed(2)}</Box>)}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" fontWeight="bold" align="right" color="primary">${total.toFixed(2)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* DIÁLOGO DE SELECCIÓN DE DIRECCIONES */}
      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>Elige una dirección guardada</DialogTitle>
        <List sx={{ pt: 0, minWidth: 300 }}>
          {savedAddresses.map((addr) => (
            <ListItem disableGutters key={addr.address_id}>
              <ListItemButton onClick={() => handleSelectAddress(addr)}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={addr.alias} secondary={addr.address} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>

    </Container>
  );
}