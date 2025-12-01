import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  Card, CardContent, Avatar, IconButton, Chip, Divider, Tooltip,
  Alert, LinearProgress, InputAdornment, Snackbar
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// --- FUNCIONES AUXILIARES ---
const stringToColor = (string) => {
  let hash = 0;
  if (!string) return '#1976d2';
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 } 
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function LocalEmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  useEffect(() => {
    if (user?.localId) fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/employees/${user.localId}`);
      const data = await res.json();
      // Aseguramos que sea un array y filtramos nulos
      if(Array.isArray(data)) setEmployees(data.filter(e => e));
    } catch (error) { console.error("Error:", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'info', msg: 'Creando cuenta...' });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, localId: user.localId })
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ type: 'success', msg: `¡${formData.name} listo para repartir!` });
        setFormData({ name: '', email: '', password: '' }); 
        fetchEmployees();
      } else {
        setStatus({ type: 'error', msg: data.error || 'Error al crear' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error de conexión.' });
    } finally { setLoading(false); }
  };

  const handleDelete = async (uid, name) => {
    if (!window.confirm(`¿Despedir a ${name}?`)) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/local/employees/${uid}`, { method: 'DELETE' });
      setEmployees(prev => prev.filter(emp => emp.firebase_uid !== uid));
      showSnackbar(`${name} ha sido desvinculado.`);
    } catch (error) { console.error(error); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar("Correo copiado al portapapeles 📋");
  };

  const showSnackbar = (msg) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TwoWheelerIcon fontSize="large" color="primary" /> Equipo de Reparto
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        
        {/* FORMULARIO DE CONTRATACIÓN */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                <PersonAddIcon color="primary" /> Contratar Repartidor
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crea sus credenciales de acceso.
              </Typography>
              
              {status.msg && <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="action"/></InputAdornment> }} size="small"/>
                <TextField label="Correo" type="email" placeholder="usuario@mail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action"/></InputAdornment> }} size="small"/>
                <TextField label="Contraseña" placeholder="Min 6 caracteres" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action"/></InputAdornment> }} size="small"/>
                
                {loading && <LinearProgress sx={{ borderRadius: 5 }} />}
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 1, borderRadius: 2, fontWeight: 'bold' }}>
                    {loading ? 'Procesando...' : 'Crear Cuenta'}
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* LISTA DE EMPLEADOS */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography variant="h6" fontWeight="bold">Plantilla ({employees.length})</Typography>
             {employees.length > 0 && <Chip icon={<CheckCircleIcon/>} label="Activos" color="success" size="small" variant="outlined"/>}
          </Box>
          
          {employees.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
               <Alert severity="info" sx={{ borderRadius: 3 }}>No tienes repartidores activos. ¡Contrata al primero!</Alert>
            </motion.div>
          ) : (
            // Usamos el Grid Container como componente animado para que funcione el stagger
            <Grid 
              container 
              spacing={2} 
              component={motion.div} 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible"
            >
              {employees.map((emp, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  key={emp.firebase_uid || index} // Key segura
                  component={motion.div} 
                  variants={cardVariants}
                  layout // Animación de reordenamiento suave
                >
                  <Card elevation={2} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar sx={{ width: 50, height: 50, bgcolor: stringToColor(emp.name), fontWeight: 'bold', border: '2px solid white', boxShadow: 1 }}>
                          {emp.name ? emp.name[0].toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" lineHeight={1.1}>{emp.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Repartidor</Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 1.5, opacity: 0.5 }} />

                      <Box sx={{ bgcolor: '#f0f4f8', p: 1.5, borderRadius: 2, mb: 2, border: '1px solid #e1e4e8' }}>
                        <Typography variant="caption" color="primary.main" fontWeight="bold" display="block" mb={0.5}>USUARIO (EMAIL)</Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{emp.email}</Typography>
                          <Tooltip title="Copiar">
                            <IconButton size="small" onClick={() => copyToClipboard(emp.email)} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                               <ContentCopyIcon fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Chip icon={<EmojiEventsIcon />} label={`${emp.total_deliveries} Entregas`} size="small" color={emp.total_deliveries > 0 ? "warning" : "default"} sx={{ fontWeight: 'bold' }} />
                    </CardContent>
                    
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(emp.firebase_uid, emp.name)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
                        Despedir
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
      
      {/* Feedback Flotante */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ '& .MuiSnackbarContent-root': { borderRadius: 3, bgcolor: '#1a2027', fontWeight: 'bold' } }}
      />
    </Box>
  );
}