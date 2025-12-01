import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  Switch, FormControlLabel, Avatar, Alert, InputAdornment, LinearProgress, Divider
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAuth } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../config/firebase';

export default function LocalSettingsPage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '', address: '', phone: '',
    delivery_fee: '', min_eta: '', max_eta: '',
    image_url: '', is_active: true,
    opening_time: '', closing_time: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.localId) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/settings/${user.localId}`);
      const data = await res.json();
      if (res.ok) {
        setFormData({
          name: data.name, address: data.address, phone: data.phone,
          delivery_fee: data.delivery_fee, 
          min_eta: data.min_eta_minutes, max_eta: data.max_eta_minutes,
          image_url: data.image_url || '', is_active: data.is_active,
          opening_time: data.opening_time || '08:00', closing_time: data.closing_time || '20:00'
        });
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: 'info', text: 'Guardando...' });

    try {
      let finalImageUrl = formData.image_url;

      if (imageFile) {
        const storageRef = ref(storage, `logos/${user.localId}_${Date.now()}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/settings/${user.localId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image_url: finalImageUrl })
      });

      if (res.ok) {
        setMsg({ type: 'success', text: '¡Configuración guardada!' });
        setFormData(prev => ({ ...prev, image_url: finalImageUrl }));
        setImageFile(null);
      } else {
        setMsg({ type: 'error', text: 'Error al guardar.' });
      }
    } catch (error) { setMsg({ type: 'error', text: 'Error de conexión.' }); } 
    finally { setLoading(false); }
  };

  return (
    <Box maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <StorefrontIcon fontSize="large" /> Mi Negocio
      </Typography>

      {msg.text && <Alert severity={msg.type} sx={{ mb: 3 }}>{msg.text}</Alert>}

      <form onSubmit={handleSave}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>Logo de la Tienda</Typography>
              <Avatar 
                src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: '4px solid #eee' }}
              >
                <StorefrontIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Button component="label" size="small" startIcon={<CloudUploadIcon />}>
                Cambiar
                <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              </Button>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" gutterBottom>Estado Manual</Typography>
              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} color="success" />}
                label={formData.is_active ? "🟢 ABIERTO" : "🔴 CERRADO"}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Información</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField label="Nombre" fullWidth required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></Grid>
                <Grid item xs={12}><TextField label="Dirección" fullWidth required multiline rows={2} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /></Grid>
                <Grid item xs={6}><TextField label="Teléfono" fullWidth required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Logística</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}><TextField label="Envío ($)" type="number" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon/></InputAdornment> }} value={formData.delivery_fee} onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField label="Mín (min)" type="number" fullWidth value={formData.min_eta} onChange={(e) => setFormData({...formData, min_eta: e.target.value})} /></Grid>
                <Grid item xs={4}><TextField label="Máx (min)" type="number" fullWidth value={formData.max_eta} onChange={(e) => setFormData({...formData, max_eta: e.target.value})} /></Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Horario</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField label="Abre" type="time" fullWidth InputLabelProps={{ shrink: true }} value={formData.opening_time} onChange={(e) => setFormData({...formData, opening_time: e.target.value})} /></Grid>
                <Grid item xs={6}><TextField label="Cierra" type="time" fullWidth InputLabelProps={{ shrink: true }} value={formData.closing_time} onChange={(e) => setFormData({...formData, closing_time: e.target.value})} /></Grid>
              </Grid>

              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} startIcon={<SaveIcon />} sx={{ mt: 4 }}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}