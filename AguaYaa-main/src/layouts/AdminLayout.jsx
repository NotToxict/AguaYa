import React, { useState } from 'react';
import { Outlet, useLocation, Link as RouterLink, Navigate } from 'react-router-dom';
import { 
  Box, Toolbar, Typography, IconButton, Drawer, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, AppBar, Avatar, Divider, CssBaseline 
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'; // Nuevo icono
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign'; // Icono promos

import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const roleThemes = {
  admin: { bg: '#1a1a1a', accent: '#ff5722', title: 'Super Admin' },
  local: { bg: '#0d47a1', accent: '#4fc3f7', title: 'Panel de Tienda' },
  delivery: { bg: '#4a148c', accent: '#ea80fc', title: 'App Repartidor' }
};

export default function AdminLayout() {
  const { user, logout, isLoading } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) return <div>Cargando...</div>;

  if (user?.role === 'local' && user?.verificationStatus === 'pending') {
     return <Navigate to="/verification" replace />;
  }

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  let menuItems = [];
  const currentTheme = roleThemes[user?.role] || roleThemes.local;

  if (user?.role === 'admin') {
    menuItems = [
      { to: '/admin', icon: <SupervisorAccountIcon />, label: 'Torre de Control' },
    ];
  } else if (user?.role === 'local') {
    menuItems = [
      { to: '/local', icon: <DashboardIcon />, label: 'Dashboard' },
      { to: '/local/products', icon: <ListAltIcon />, label: 'Catálogo' },
      { to: '/local/employees', icon: <PeopleIcon />, label: 'Empleados' },
      { to: '/local/promos', icon: <CampaignIcon />, label: 'Marketing' },
      { to: '/local/settings', icon: <SettingsSuggestIcon />, label: 'Configuración' }, // <--- AQUÍ ESTÁ
    ];
  } else if (user?.role === 'delivery') {
    menuItems = [
      { to: '/delivery', icon: <DeliveryDiningIcon />, label: 'Mis Entregas' },
    ];
  }

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: currentTheme.bg, color: 'white' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
        <Avatar sx={{ bgcolor: currentTheme.accent, width: 30, height: 30 }}>{user?.name?.[0] || 'U'}</Avatar>
        <Typography variant="subtitle1" fontWeight="bold" noWrap>{user?.name?.split(' ')[0]}</Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems.map((item) => {
          const isActive = pathname === item.to;
          return (
            <ListItem key={item.to} disablePadding>
              <ListItemButton component={RouterLink} to={item.to} sx={{ bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent', borderLeft: isActive ? `4px solid ${currentTheme.accent}` : '4px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                <ListItemIcon sx={{ color: isActive ? currentTheme.accent : 'rgba(255,255,255,0.7)' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <ListItemButton onClick={logout}>
          <ListItemIcon sx={{ color: '#ef5350' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: 'white', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}><MenuIcon /></IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: currentTheme.bg }}>{currentTheme.title}</Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }} open>{drawer}</Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}