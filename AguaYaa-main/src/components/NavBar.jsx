import React from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Badge,
  Menu, MenuItem, Avatar, Divider, ListItemIcon
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LogoutIcon from '@mui/icons-material/Logout';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const linkSx = {
  color: 'inherit',
  textTransform: 'none',
  '&.active': { textDecoration: 'underline', fontWeight: 'bold' },
};

export default function NavBar() {
  const { count } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary" enableColorOnDark elevation={2}>
      <Toolbar>
        {/* LOGO */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 900, fontSize: '1.5rem', letterSpacing: 1 }}
        >
          AguaYa 💧
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* MENÚ DE NAVEGACIÓN (Solo Desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 3, alignItems: 'center' }}>
          <Button component={NavLink} to="/stores" sx={linkSx}>
            Tiendas
          </Button>
          <Button component={NavLink} to="/catalog" sx={linkSx}>
            Catálogo
          </Button>
        </Box>

        {/* CARRITO */}
        <IconButton component={RouterLink} to="/cart" color="inherit" sx={{ mr: 1 }}>
          <Badge badgeContent={count} color="secondary">
            <ShoppingCartOutlinedIcon />
          </Badge>
        </IconButton>

        {/* --- LÓGICA DE USUARIO --- */}
        {isAuthenticated ? (
          <Box>
            <Button
              onClick={handleMenu}
              color="inherit"
              startIcon={user?.photoURL ? <Avatar src={user.photoURL} sx={{ width: 24, height: 24 }} /> : <AccountCircleIcon />}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              {user?.name || user?.displayName?.split(' ')[0] || 'Cuenta'}
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                elevation: 4,
                sx: { mt: 1.5, minWidth: 180, borderRadius: 2 }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* --- OPCIONES PARA TODOS (CLIENTES) --- */}
              <MenuItem component={RouterLink} to="/orders" onClick={handleClose}>
                <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                Mis Pedidos
              </MenuItem>
              
              {/* Opciones Exclusivas de Cliente */}
              {user?.role === 'client' && [
                <MenuItem key="favs" onClick={handleClose}>
                  <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                  Tiendas Favoritas
                </MenuItem>,
                <MenuItem key="settings" onClick={handleClose}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  Mi Perfil
                </MenuItem>
              ]}

              <Divider />

              {/* --- PANELES ADMINISTRATIVOS (Solo si tienes rol) --- */}
              {user?.role === 'local' && (
                <MenuItem component={RouterLink} to="/local" onClick={handleClose} sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}>
                  <ListItemIcon><DashboardIcon fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                  <b>Panel de Tienda</b>
                </MenuItem>
              )}

              {user?.role === 'delivery' && (
                <MenuItem component={RouterLink} to="/delivery" onClick={handleClose} sx={{ bgcolor: 'secondary.light', color: 'white', '&:hover': { bgcolor: 'secondary.main' } }}>
                  <ListItemIcon><TwoWheelerIcon fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                  <b>App Repartidor</b>
                </MenuItem>
              )}

              {user?.role !== 'client' && <Divider />}

              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
            variant="outlined"
            startIcon={<LoginIcon />}
            sx={{ borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Ingresar
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}