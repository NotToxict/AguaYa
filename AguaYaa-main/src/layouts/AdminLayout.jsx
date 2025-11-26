import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, Typography, AppBar, Toolbar, Button, Grid } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink } from 'react-router-dom';

const navItems = {
  '/local': [
    { to: '/local', icon: HomeIcon, label: 'Inicio' },
    { to: '/local/products', icon: ListAltIcon, label: 'Catálogo' },
    { to: '/', icon: LogoutIcon, label: 'Salir' },
  ],
  '/delivery': [
    { to: '/delivery', icon: DeliveryDiningIcon, label: 'Mis Entregas' },
    { to: '/', icon: LogoutIcon, label: 'Salir' },
  ],
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  // Determina el rol actual (Local o Repartidor)
  const isLocal = pathname.startsWith('/local');
  const role = isLocal ? 'Local' : 'Repartidor';
  const currentNavItems = isLocal ? navItems['/local'] : navItems['/delivery'];

  return (
    <>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AguaYaa - Panel de {role}
          </Typography>
          <Button component={RouterLink} to="/login" color="inherit" endIcon={<LogoutIcon />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            {/* Sidebar de Navegación del Panel */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {currentNavItems.map((item) => (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  startIcon={<item.icon />}
                  variant={pathname === item.to ? 'contained' : 'outlined'}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            {/* Contenido de la página actual */}
            <Outlet />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}