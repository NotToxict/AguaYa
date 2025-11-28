import React from 'react';
import { Outlet, useLocation, Link as RouterLink, Navigate } from 'react-router-dom';
import { Box, Container, Typography, AppBar, Toolbar, Button, Grid, Paper } from '@mui/material';

// --- ICONOS ---
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // <--- Icono de Admin

import { useAuth } from '../context/AuthContext';

// Configuración de los Menús Laterales
const navItems = {
  '/local': [
    { to: '/local', icon: HomeIcon, label: 'Inicio' },
    { to: '/local/products', icon: ListAltIcon, label: 'Catálogo' },
    { to: '/local/employees', icon: PeopleIcon, label: 'Empleados' },
    { to: '/', icon: LogoutIcon, label: 'Salir' },
  ],
  '/delivery': [
    { to: '/delivery', icon: DeliveryDiningIcon, label: 'Mis Entregas' },
    { to: '/', icon: LogoutIcon, label: 'Salir' },
  ],
  '/admin': [
    { to: '/admin', icon: SupervisorAccountIcon, label: 'Aprobaciones' },
    { to: '/', icon: LogoutIcon, label: 'Salir' },
  ],
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user, isLoading } = useAuth();

  // 1. Esperar a que cargue la sesión
  if (isLoading) return <div>Cargando...</div>;

  // 2. EL MURO DE SEGURIDAD (Si la tienda no está verificada)
  if (user?.role === 'local' && user?.verificationStatus === 'pending') {
     return <Navigate to="/verification" replace />;
  }
  
  // 3. Detectar en qué panel estamos para cambiar el título y menú
  const isAdmin = pathname.startsWith('/admin');
  const isLocal = pathname.startsWith('/local');
  const isDelivery = pathname.startsWith('/delivery');

  let roleTitle = 'Panel';
  let currentNavItems = [];

  if (isAdmin) {
    roleTitle = 'Super Admin 🛡️';
    currentNavItems = navItems['/admin'];
  } else if (isLocal) {
    roleTitle = 'Panel de Tienda';
    currentNavItems = navItems['/local'];
  } else {
    roleTitle = 'Panel de Repartidor';
    currentNavItems = navItems['/delivery'];
  }

  return (
    <>
      {/* BARRA SUPERIOR AZUL */}
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            AguaYa 💧 - {roleTitle}
          </Typography>
          <Button component={RouterLink} to="/login" color="inherit" endIcon={<LogoutIcon />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* CONTENIDO PRINCIPAL (GRID) */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          
          {/* COLUMNA IZQUIERDA: MENÚ DE NAVEGACIÓN */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {currentNavItems.map((item) => (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  startIcon={<item.icon />}
                  variant={pathname === item.to ? 'contained' : 'outlined'}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: pathname === item.to ? 'bold' : 'normal'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* COLUMNA DERECHA: PANTALLA ACTUAL */}
          <Grid item xs={12} md={9}>
            <Paper elevation={0} sx={{ p: 0, bgcolor: 'transparent' }}>
               <Outlet />
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </>
  );
}