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
import EditIcon from '@mui/icons-material/Edit'; // <--- Nuevo Icono
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../config/firebase';

export default function LocalProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', size: '', inventory: ''
  });
  const [editingId, setEditingId] = useState(null); // <--- ID si estamos editando
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    if (user?.localId) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stores/${user.localId}/products`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (error) { console.error(error); }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const storageRef = ref(storage, `products/${user.localId}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  // Cargar datos en el formulario para editar
  const handleEditClick = (prod) => {
    setEditingId(prod.product_id);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      size: prod.size || '',
      inventory: prod.inventory_count
    });
    // Nota: La imagen no se precarga en el input file, pero si no suben otra, se mantiene la anterior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', size: '', inventory: '' });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setStatus({ type: 'info', msg: 'Guardando...' });

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      } else if (editingId) {
        // Si estamos editando y no subió foto nueva, mantenemos la vieja (la buscamos en la lista)
        const original = products.find(p => p.product_id === editingId);
        imageUrl = original.image_url;
      }

      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/local/products/${editingId}` // PUT
        : `${import.meta.env.VITE_API_URL}/local/products`;             // POST

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inventory: parseInt(formData.inventory),
          imageUrl: imageUrl,
          localId: user.localId
        })
      });

      const data = await res.json();
      if (data.ok) {
        setStatus({ type: 'success', msg: editingId ? '¡Producto actualizado!' : '¡Producto creado!' });
        handleCancelEdit(); // Limpiar form
        fetchProducts(); 
      } else {
        setStatus({ type: 'error', msg: 'Error al guardar.' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Error de conexión.' });
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
        Catálogo de Productos
      </Typography>

      <Grid container spacing={4}>
        {/* FORMULARIO */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderTop: editingId ? '4px solid #ed6c02' : '4px solid #1976d2' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              {editingId ? <EditIcon color="warning" /> : <AddCircleIcon color="primary" />} 
              {editingId ? 'Editar Producto' : 'Agregar Nuevo'}
            </Typography>
            
            {status.msg && <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <TextField label="Descripción" multiline rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Precio" type="number" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required fullWidth />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Tamaño" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} required fullWidth />
                </Grid>
              </Grid>
              <TextField label="Stock Inicial" type="number" InputProps={{ startAdornment: <InputAdornment position="start"><InventoryIcon fontSize='small'/></InputAdornment> }} value={formData.inventory} onChange={(e) => setFormData({...formData, inventory: e.target.value})} required />
              
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} color={imageFile ? "success" : "primary"}>
                {imageFile ? "Foto Seleccionada" : "Subir Foto"}
                <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              </Button>
              
              {uploading && <LinearProgress />}

              <Box display="flex" gap={1}>
                {editingId && (
                  <Button fullWidth variant="outlined" color="inherit" onClick={handleCancelEdit} startIcon={<CancelIcon />}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" fullWidth variant="contained" size="large" color={editingId ? "warning" : "primary"} disabled={uploading}>
                  {uploading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Publicar')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* LISTA */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {products.map((prod) => (
              <Grid item xs={12} sm={6} md={4} key={prod.product_id}>
                <Card elevation={3} sx={{ position: 'relative' }}>
                  <CardMedia component="img" height="140" image={prod.image_url || "https://via.placeholder.com/300"} alt={prod.name} />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{prod.name}</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography color="primary.main" fontWeight="bold">${prod.price}</Typography>
                      <Chip label={`${prod.inventory_count} disp.`} size="small" color={prod.inventory_count > 0 ? "success" : "error"} variant="outlined" />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <IconButton color="primary" onClick={() => handleEditClick(prod)} size="small" sx={{ bgcolor: '#e3f2fd' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(prod.product_id)} size="small">
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