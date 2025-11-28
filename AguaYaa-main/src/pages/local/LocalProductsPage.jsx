import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  Grid, Card, CardMedia, CardContent, CardActions,
  IconButton, Chip, Alert, InputAdornment, LinearProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAuth } from '../../context/AuthContext';

// Importamos Storage de Firebase
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../config/firebase'; // Asegúrate de haber creado este archivo en el Paso 1

export default function LocalProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', size: '', inventory: ''
  });
  
  // Estado de la imagen
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [status, setStatus] = useState({ type: '', msg: '' });

  // 1. Cargar productos al iniciar
  useEffect(() => {
    if (user?.localId) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stores/${user.localId}/products`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  // 2. Función para subir imagen a Firebase
  const uploadImage = async () => {
    if (!imageFile) return null; // Si no hay foto, devuelve null
    
    // Referencia: products/ID_TIENDA/NOMBRE_ARCHIVO
    const storageRef = ref(storage, `products/${user.localId}/${Date.now()}_${imageFile.name}`);
    
    // Subir
    await uploadBytes(storageRef, imageFile);
    
    // Obtener URL pública
    const url = await getDownloadURL(storageRef);
    return url;
  };

  // 3. Crear Producto (Guardar todo)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setStatus({ type: 'info', msg: 'Subiendo foto y guardando...' });

    try {
      // A. Subir foto primero
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // B. Guardar datos en Backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inventory: parseInt(formData.inventory), // Convertir a número
          imageUrl: imageUrl, // La URL que nos dio Firebase
          localId: user.localId
        })
      });

      const data = await res.json();
      if (data.ok) {
        setStatus({ type: 'success', msg: '¡Producto creado exitosamente!' });
        // Limpiar todo
        setFormData({ name: '', description: '', price: '', size: '', inventory: '' });
        setImageFile(null);
        fetchProducts(); 
      } else {
        setStatus({ type: 'error', msg: 'Error al guardar en base de datos.' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Error de conexión o subida.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("¿Borrar este producto?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/local/products/${productId}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Administrar Productos 📦
      </Typography>

      <Grid container spacing={4}>
        {/* === FORMULARIO DE ALTA === */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddCircleIcon color="primary" /> Agregar Nuevo
            </Typography>
            
            {status.msg && <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              <TextField 
                label="Nombre" placeholder="Ej: Garrafón 20L" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              
              <TextField 
                label="Descripción" multiline rows={2}
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField 
                    label="Precio" type="number" 
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    label="Tamaño" placeholder="20L" 
                    value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})}
                    required fullWidth
                  />
                </Grid>
              </Grid>

              {/* CAMPO DE INVENTARIO */}
              <TextField 
                label="Stock Inicial" type="number"
                placeholder="Ej: 50"
                InputProps={{ startAdornment: <InputAdornment position="start"><InventoryIcon fontSize='small'/></InputAdornment> }}
                value={formData.inventory} onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                required 
                helperText="Cantidad de garrafones disponibles para venta"
              />

              {/* SUBIDA DE IMAGEN */}
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                color={imageFile ? "success" : "primary"}
              >
                {imageFile ? "Foto Seleccionada" : "Subir Foto del Producto"}
                <input 
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])} 
                />
              </Button>
              {imageFile && <Typography variant="caption" align="center">{imageFile.name}</Typography>}

              {/* BARRA DE PROGRESO */}
              {uploading && <LinearProgress />}

              <Button type="submit" variant="contained" size="large" disabled={uploading}>
                {uploading ? 'Guardando...' : 'Publicar Producto'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* === LISTA DE PRODUCTOS === */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Catálogo Actual</Typography>
          <Grid container spacing={2}>
            {products.map((prod) => (
              <Grid item xs={12} sm={6} md={4} key={prod.product_id}>
                <Card elevation={3}>
                  <CardMedia 
                    component="img" 
                    height="140" 
                    image={prod.image_url || "https://via.placeholder.com/300?text=Sin+Foto"} 
                    alt={prod.name} 
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{prod.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{prod.description}</Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography color="primary.main" fontWeight="bold">${prod.price}</Typography>
                      <Chip 
                        label={`${prod.inventory_count} disp.`} 
                        size="small" 
                        color={prod.inventory_count > 0 ? "success" : "error"} 
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton color="error" onClick={() => handleDelete(prod.product_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}