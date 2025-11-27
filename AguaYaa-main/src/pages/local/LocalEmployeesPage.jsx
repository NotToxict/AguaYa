import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, Grid 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { useAuth } from '../../context/AuthContext';

export default function LocalEmployeesPage() {
  const { user } = useAuth(); // Obtenemos el ID de tu tienda
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  // 1. Cargar empleados al abrir la página
  useEffect(() => {
    if (user?.localId) fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/employees/${user.localId}`);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error cargando empleados:", error);
    }
  };

  // 2. Función para CREAR un nuevo repartidor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', msg: 'Creando cuenta...' });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          localId: user.localId // Vinculamos al repartidor con TU tienda
        })
      });

      const data = await res.json();

      if (data.ok) {
        setStatus({ type: 'success', msg: '¡Repartidor creado exitosamente!' });
        setFormData({ name: '', email: '', password: '' }); // Limpiar formulario
        fetchEmployees(); // Recargar la lista
      } else {
        setStatus({ type: 'error', msg: data.error || 'Error al crear' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error de conexión con el servidor.' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Mis Repartidores 🛵
      </Typography>

      <Grid container spacing={4}>
        {/* FORMULARIO DE REGISTRO */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon color="primary" /> Registrar Nuevo
            </Typography>
            
            {status.msg && (
              <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Nombre Completo" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              <TextField 
                label="Correo Electrónico" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
              <TextField 
                label="Asignar Contraseña" 
                type="password"
                helperText="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
              <Button type="submit" variant="contained" size="large" startIcon={<PersonAddIcon />}>
                Crear Cuenta
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* LISTA DE EMPLEADOS */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Plantilla Actual</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Rol</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No tienes repartidores registrados.</TableCell>
                    </TableRow>
                  ) : (
                    employees.map((emp, index) => (
                      <TableRow key={index}>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <TwoWheelerIcon fontSize="small" /> Delivery
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}