import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, Typography, AppBar, Toolbar, Button, Grid, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// --- ICONOS ---
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People'; // <--- ¡ESTE FALTABA!

// Configuración del Menú Lateral
const navItems = {
  '/local': [
    { to: '/local', icon: HomeIcon, label: 'Inicio' },
    { to: '/local/products', icon: ListAltIcon, label: 'Catálogo' },
    { to: '/local/employees', icon: PeopleIcon, label: 'Empleados' }, // <--- Aquí usamos el icono
    { to: '/', icon: LogoutIcon, label: 'Salir' },
  ],
  '/delivery': [
    { to: '/delivery', icon: DeliveryDiningIcon, label: 'Mis Entregas' },
    { to: '/', icon: LogoutIcon, label: 'Salir' },
  ],
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  
  // Detectar si estamos en el panel de Local o Delivery
  const isLocal = pathname.startsWith('/local');
  const roleTitle = isLocal ? 'Panel de Tienda' : 'Panel de Repartidor';
  
  // Seleccionar qué menú mostrar
  // Si la ruta no coincide exactamente (ej: sub-rutas), usamos el fallback adecuado
  const currentNavItems = isLocal ? navItems['/local'] : navItems['/delivery'];

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
                  // Resaltar botón si estamos en esa página
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