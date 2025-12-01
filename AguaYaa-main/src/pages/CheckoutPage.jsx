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
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places'];

export default function CheckoutPage() {
  const { items, store, subtotal, shipping, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: libraries
  });

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [autocomplete, setAutocomplete] = useState(null);

  const [saveAddress, setSaveAddress] = useState(false);
  const [addressAlias, setAddressAlias] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.displayName || '',
        phone: user.phone || ''
      }));
      fetchSavedAddresses();
    }
  }, [user]);

  // --- FUNCIÓN MEJORADA: Cargar y Auto-seleccionar ---
  const fetchSavedAddresses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/addresses`);
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setSavedAddresses(data);
        
        // ✨ MAGIA: Seleccionar automáticamente la última dirección usada (la primera de la lista)
        const lastAddress = data[0];
        handleSelectAddress(lastAddress);
      }
    } catch (e) { console.error("Error cargando direcciones", e); }
  };

  const handleSelectAddress = (addr) => {
    // Rellenar formulario y mapa
    setFormData(prev => ({ ...prev, address: addr.address }));
    setCoords({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) });
    setOpenAddressDialog(false); // Cerrar el modal si estaba abierto
  };

  // --- MAPA Y AUTOCOMPLETE ---
  const handleLocationSelect = (data) => {
    setCoords({ lat: data.lat, lng: data.lng });
    if (data.address) {
      setFormData(prev => ({ ...prev, address: data.address }));
    }
  };

  const onLoadAutocomplete = (autocomplete) => setAutocomplete(autocomplete);
  
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;
        setCoords({ lat, lng });
        setFormData(prev => ({ ...prev, address }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords.lat || !coords.lng) return setError("Ubicación requerida. Selecciona en el mapa.");

    setLoading(true); setError('');

    try {
      // Guardar nueva dirección si el usuario marcó la casilla
      if (saveAddress) {
        await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alias: addressAlias || 'Nueva Dirección',
            address: formData.address,
            lat: coords.lat, lng: coords.lng
          })
        });
      }

      const payload = {
        userId: user.uid,
        localId: store.id,
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryAddress: `${formData.address}`,
        deliveryLat: coords.lat,
        deliveryLng: coords.lng,
        notes: formData.notes,
        subtotal, deliveryFee: shipping, total, items,
        paymentMethod: 'cash'
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
        setError(data.error || 'Error al procesar.');
      }
    } catch (err) { setError('Error de conexión.'); } 
    finally { setLoading(false); }
  };

  if (items.length === 0) return <Container sx={{ mt: 4 }}>No hay productos.</Container>;
  if (loadError) return <Alert severity="error">Error cargando mapas.</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Finalizar Compra</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            
            {/* ENCABEZADO INTELIGENTE */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" /> Ubicación
              </Typography>
              
              {/* Botón de direcciones (Solo si tiene guardadas) */}
              {savedAddresses.length > 0 && (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="small" 
                  startIcon={<HomeIcon />}
                  onClick={() => setOpenAddressDialog(true)}
                >
                  Usar Guardada ({savedAddresses.length})
                </Button>
              )}
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* MAPA CON AUTO-LLENADO */}
              <Box>
                {isLoaded ? (
                    <LocationPicker 
                      // La "key" fuerza al mapa a redibujarse si cambian las coordenadas (vital para el auto-llenado)
                      key={`${coords.lat}-${coords.lng}`} 
                      initialPosition={coords.lat ? coords : undefined}
                      onLocationSelect={handleLocationSelect} 
                    />
                ) : (
                    <CircularProgress />
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Dirección / Referencias:</Typography>
                
                {isLoaded ? (
                  <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                    <TextField 
                      placeholder="Escribe tu dirección para buscar..."
                      fullWidth 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                  </Autocomplete>
                ) : (
                   <TextField placeholder="Cargando..." fullWidth disabled sx={{ mb: 2 }} />
                )}

                <Box sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: 2, mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />}
                    label="Guardar esta dirección para futuros pedidos"
                  />
                  {saveAddress && (
                    <TextField 
                      label="Nombre (Ej: Casa, Oficina)" 
                      size="small" fullWidth sx={{ mt: 1, bgcolor: 'white' }}
                      value={addressAlias} onChange={(e) => setAddressAlias(e.target.value)}
                    />
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Nombre" fullWidth required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></Grid>
                  <Grid item xs={6}><TextField label="Teléfono" fullWidth required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></Grid>
                </Grid>
              </Box>
              
              <Button 
                type="submit" variant="contained" size="large" disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? 'Procesando...' : `Confirmar ($${total.toFixed(2)})`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, bgcolor: '#f9f9f9', position: 'sticky', top: 100 }}>
            <Typography variant="h6">Resumen</Typography>
            <Divider sx={{ my: 2 }} />
            {items.map(i => <Box key={i.id} mb={1}>{i.qty}x {i.name} - ${(i.price*i.qty).toFixed(2)}</Box>)}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Envío</Typography>
              <Typography>${shipping.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h5" fontWeight="bold">Total</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">${total.toFixed(2)}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>Mis Direcciones</DialogTitle>
        <List sx={{ pt: 0, minWidth: 300 }}>
          {savedAddresses.map((addr) => (
            <ListItemButton key={addr.address_id} onClick={() => handleSelectAddress(addr)}>
              <ListItemIcon><HomeIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary={addr.alias} 
                secondary={addr.address} 
                secondaryTypographyProps={{ noWrap: true, maxWidth: 200 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Dialog>
    </Container>
  );
}