import React from 'react';
import { Link as RouterLink, NavLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Chip,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

const linkSx = {
  color: 'inherit',
  textTransform: 'none',
  '&.active': { textDecoration: 'underline' },
};

export default function NavBar() {
  const { count } = useCart();
  const { store } = useStore();

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}
        >
          AguaYa
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Tienda actual (atajo a /stores) */}
        <Chip
          component={RouterLink}
          to="/stores"
          clickable
          icon={<StorefrontIcon sx={{ color: 'inherit' }} />}
          label={store ? store.name : 'Elegir tienda'}
          sx={{
            mr: 2,
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.6)',
            '& .MuiChip-icon': { color: 'inherit' },
          }}
          variant="outlined"
        />

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 1 }}>
          <Button component={NavLink} to="/" sx={linkSx}>
            Inicio
          </Button>
          <Button component={NavLink} to="/stores" sx={linkSx}>
            Tiendas
          </Button>
          <Button component={NavLink} to="/catalog" sx={linkSx}>
            Catálogo
          </Button>
          <Button component={NavLink} to="/orders" sx={linkSx}>
            Mis pedidos
          </Button>
          <Button component={NavLink} to="/contact" sx={linkSx}>
            Contacto
          </Button>
        </Box>

        <IconButton
          component={RouterLink}
          to="/cart"
          size="large"
          color="inherit"
          aria-label="Carrito"
        >
          <Badge badgeContent={count} color="secondary">
            <ShoppingCartOutlinedIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}