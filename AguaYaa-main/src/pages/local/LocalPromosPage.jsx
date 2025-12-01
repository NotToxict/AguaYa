import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  Card, CardMedia, CardContent, Chip, Alert, LinearProgress, Divider 
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../config/firebase';

export default function LocalPromosPage() {
  const { user } = useAuth();
  const [promos, setPromos] = useState([]);
  
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Cargar historial al entrar
  useEffect(() => {
    if (user?.localId) fetchPromos();
  }, [user]);

  const fetchPromos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/promos/local/${user.localId}`);
      const data = await res.json();
      if (Array.isArray(data)) setPromos(data);
    } catch (e) { console.error(e); }
  };

  // VALIDAR IMAGEN (Regla de Oro: Horizontal y Grande)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      // Exigimos formato horizontal (ratio > 1.5) y mínimo 800px ancho
      if (ratio < 1.5) {
        setMsg({ type: 'warning', text: 'La imagen debe ser horizontal (rectangular) para el banner.' });
        setImageFile(null);
        setPreviewUrl(null);
      } else if (img.width < 800) {
        setMsg({ type: 'warning', text: 'La imagen es muy pequeña. Mínimo 800px de ancho.' });
        setImageFile(null);
        setPreviewUrl(null);
      } else {
        setMsg({ type: '', text: '' });
        setImageFile(file);
        setPreviewUrl(img.src);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return setMsg({ type: 'error', text: 'Falta la imagen del banner.' });

    setLoading(true);
    setMsg({ type: 'info', text: 'Subiendo banner...' });

    try {
      // 1. Subir a Firebase
      const storageRef = ref(storage, `promos/${user.localId}/${Date.now()}_banner`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Guardar solicitud en Backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/promos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localId: user.localId,
          title: formData.title,
          description: formData.description,
          imageUrl: imageUrl
        })
      });

      if (res.ok) {
        setMsg({ type: 'success', text: '¡Solicitud enviada! El administrador la revisará pronto.' });
        setFormData({ title: '', description: '' });
        setImageFile(null);
        setPreviewUrl(null);
        fetchPromos();
      } else {
        setMsg({ type: 'error', text: 'Error al enviar solicitud.' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

  // Función para pintar el estado
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'ACTIVO (Visible)';
      case 'pending': return 'EN REVISIÓN';
      case 'rejected': return 'RECHAZADO';
      case 'expired': return 'EXPIRADO';
      default: return status;
    }
  };

  return (
    <Box maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CampaignIcon fontSize="large" color="primary" /> Marketing
      </Typography>

      <Grid container spacing={4}>
        
        {/* FORMULARIO DE CREACIÓN */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>Crear Nueva Promoción</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sube un banner atractivo para aparecer en el inicio de la app.
            </Typography>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* PREVISUALIZACIÓN */}
              <Box 
                sx={{ 
                  height: 150, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 2, 
                  border: '2px dashed #ccc',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Box textAlign="center" color="text.secondary">
                    <AddPhotoAlternateIcon fontSize="large" />
                    <Typography variant="caption" display="block">Formato Horizontal (1200x400)</Typography>
                  </Box>
                )}
              </Box>

              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                Seleccionar Banner
                <input type="file" hidden accept="image/*" onChange={handleImageSelect} />
              </Button>

              <TextField 
                label="Título de la Promo" 
                placeholder="Ej: ¡2x1 en Rellenos!" 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                required 
              />
              <TextField 
                label="Descripción Corta" 
                placeholder="Válido solo los martes..." 
                multiline rows={2}
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                required 
              />

              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Solicitar Publicación'}
              </Button>
              {loading && <LinearProgress />}
            </Box>
          </Paper>
        </Grid>

        {/* LISTA DE HISTORIAL */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>Mis Campañas</Typography>
          
          {promos.length === 0 ? (
            <Alert severity="info">No has creado promociones aún.</Alert>
          ) : (
            <Grid container spacing={2}>
              {promos.map((promo) => (
                <Grid item xs={12} key={promo.promo_id}>
                  <Card elevation={3} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <CardMedia
                      component="img"
                      sx={{ width: { sm: 200 }, height: 120, objectFit: 'cover' }}
                      image={promo.image_url}
                      alt={promo.title}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Typography variant="h6" fontWeight="bold">{promo.title}</Typography>
                        <Chip 
                          label={getStatusLabel(promo.status)} 
                          color={getStatusColor(promo.status)} 
                          size="small" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {promo.description}
                      </Typography>
                      
                      {promo.status === 'active' && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="inherit" /> Expira: {new Date(promo.end_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {promo.status === 'pending' && (
                        <Typography variant="caption" color="warning.main">
                          Esperando aprobación del admin...
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

      </Grid>
    </Box>
  );
}