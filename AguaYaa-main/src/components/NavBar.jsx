import React from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Badge,
  Menu, MenuItem, Avatar, Divider, ListItemIcon, Tooltip
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Estilos para los enlaces del menú principal
const linkSx = {
  color: 'inherit',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  mx: 0.5,
  borderRadius: 2,
  px: 2,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: 'translateY(-1px)'
  },
  '&.active': { 
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
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
    <AppBar 
      position="sticky"
      color="primary" 
      enableColorOnDark 
      elevation={0}
      sx={{ 
        backgroundColor: 'rgba(25, 118, 210, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ height: 70 }}>
        {/* LOGO */}
        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{ 
            color: 'inherit', 
            textDecoration: 'none', 
            fontWeight: 900, 
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            mr: 2,
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 0.9 }
          }}
        >
          AguaYa <span style={{ fontSize: '1.5em', marginLeft: 5 }}>💧</span>
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* MENÚ DE NAVEGACIÓN (Solo Desktop) */}
        {/* SOLO DEJAMOS "TIENDAS" AQUÍ PARA QUE SE VEA LIMPIO */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
          <Button component={NavLink} to="/stores" startIcon={<StorefrontIcon />} sx={linkSx}>
            Tiendas
          </Button>
        </Box>

        {/* CARRITO */}
        <Tooltip title="Ver Carrito">
          <IconButton 
            component={RouterLink} 
            to="/cart" 
            color="inherit" 
            sx={{ 
              mr: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.1)' }
            }}
          >
            <Badge 
              badgeContent={count} 
              color="secondary"
              sx={{ '& .MuiBadge-badge': { animation: count > 0 ? 'pop 0.3s ease-out' : 'none' } }}
            >
              <ShoppingCartOutlinedIcon fontSize="medium" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* --- MENÚ DE USUARIO --- */}
        {isAuthenticated ? (
          <Box>
            <Button
              onClick={handleMenu}
              color="inherit"
              startIcon={
                <Avatar 
                  src={user?.photoURL} 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    border: '2px solid rgba(255,255,255,0.8)',
                    bgcolor: 'secondary.main' 
                  }} 
                >
                  {!user?.photoURL && (user?.name?.[0] || <AccountCircleIcon />)}
                </Avatar>
              }
              endIcon={<Typography variant="caption" sx={{ ml: 0.5 }}>▼</Typography>}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 'bold',
                borderRadius: 30,
                pl: 0.5, pr: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Typography variant="body2" sx={{ ml: 1, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Cuenta'}
              </Typography>
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                elevation: 8,
                sx: { 
                  mt: 1.5, 
                  minWidth: 200, 
                  borderRadius: 3,
                  overflow: 'visible',
                  '&:before': { 
                    content: '""', display: 'block', position: 'absolute', top: 0, right: 24, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
                  },
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* "Mis Pedidos" AHORA VIVE AQUÍ EXCLUSIVAMENTE */}
              <MenuItem component={RouterLink} to="/orders" onClick={handleClose} sx={{ py: 1.5 }}>
                <ListItemIcon><ReceiptLongIcon fontSize="small" color="primary" /></ListItemIcon>
                <Typography variant="body2" fontWeight={500}>Mis Pedidos</Typography>
              </MenuItem>
              
              {user?.role === 'client' && [
                <MenuItem key="settings" component={RouterLink} to="/profile" onClick={handleClose} sx={{ py: 1.5 }}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  <Typography variant="body2">Mi Perfil</Typography>
                </MenuItem>
              ]}

              <Divider sx={{ my: 1 }} />

              {/* Paneles Administrativos */}
              {user?.role === 'local' && (
                <MenuItem component={RouterLink} to="/local" onClick={handleClose} sx={{ mx: 1, borderRadius: 1, bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}>
                  <ListItemIcon><DashboardIcon fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                  <Typography variant="body2" fontWeight="bold">Panel de Tienda</Typography>
                </MenuItem>
              )}

              {user?.role === 'delivery' && (
                <MenuItem component={RouterLink} to="/delivery" onClick={handleClose} sx={{ mx: 1, borderRadius: 1, bgcolor: 'secondary.light', color: 'white', '&:hover': { bgcolor: 'secondary.main' } }}>
                  <ListItemIcon><TwoWheelerIcon fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                  <Typography variant="body2" fontWeight="bold">App Repartidor</Typography>
                </MenuItem>
              )}

              {user?.role === 'admin' && (
                <MenuItem component={RouterLink} to="/admin" onClick={handleClose} sx={{ mx: 1, borderRadius: 1, bgcolor: '#333', color: 'white', '&:hover': { bgcolor: 'black' } }}>
                  <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                  <Typography variant="body2" fontWeight="bold">Super Admin</Typography>
                </MenuItem>
              )}

              {user?.role !== 'client' && <Divider sx={{ my: 1 }} />}

              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                <Typography variant="body2" fontWeight={600}>Cerrar Sesión</Typography>
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
            sx={{ 
              borderColor: 'rgba(255,255,255,0.6)', borderRadius: 30, px: 3,
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.15)', transform: 'scale(1.05)' },
              transition: 'all 0.2s'
            }}
          >
            Ingresar
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}