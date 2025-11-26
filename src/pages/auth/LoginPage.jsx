import React from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext'; // <-- IMPORTAR useAuth
import { Link as RouterLink } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth(); // <-- OBTENER FUNCIÓN LOGIN

  // Nota: En una app real, aquí se usaría el email/contraseña para autenticar con el backend

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
          Acceso al Panel
        </Typography>
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Usuario/Email" fullWidth required />
          <TextField label="Contraseña" type="password" fullWidth required />
          
          {/* BOTÓN 1: Inicia sesión como Local */}
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mt: 2 }} 
            onClick={() => login('local')} // <-- CONECTADO AL LOGIN
          >
            Iniciar Sesión (Local)
          </Button>

          {/* BOTÓN 2: Inicia sesión como Repartidor */}
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => login('delivery')} // <-- CONECTADO AL LOGIN
          >
            Iniciar Sesión (Repartidor)
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}