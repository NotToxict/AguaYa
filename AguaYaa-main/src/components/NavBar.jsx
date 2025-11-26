import React, { useState, useEffect, useRef } from 'react';
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
// Importar los iconos necesarios
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeIcon from '@mui/icons-material/Home'; // Icono Inicio
import ListAltIcon from '@mui/icons-material/ListAlt'; // Icono Catálogo
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Icono Pedidos
import ContactSupportIcon from '@mui/icons-material/ContactSupport'; // Icono Contacto
// Mantener StorefrontIcon para Tiendas

import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';

// Modificar linkSx para el resaltado con fondo
const linkSx = (theme) => ({ // Convertir a función para acceder al theme
  color: 'inherit',
  textTransform: 'none',
  borderRadius: 1, // Bordes redondeados para el fondo
  px: 1.5, // Padding horizontal para el fondo
  py: 0.5, // Padding vertical para el fondo
  '&.active': {
    // textDecoration: 'underline', // Quitar subrayado
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Fondo blanco semitransparente
    fontWeight: 600, // Opcional: hacerlo un poco más bold
  },
  // Opcional: efecto hover sutil
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  }
});

export default function NavBar() {
  const { count } = useCart();
  const { store } = useStore();
  const [animateCart, setAnimateCart] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    // console.log(`Cart count changed: prev=${prevCountRef.current}, current=${count}`);
    if (count > prevCountRef.current) {
      // console.log("Animating cart icon!");
      setAnimateCart(true);
      const timer = setTimeout(() => {
        // console.log("Resetting cart animation state");
        setAnimateCart(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, mr: 2 }} // Añadido margen
        >
          AguaYa
        </Typography>

        {/* Links de navegación escritorio con iconos y nuevo estilo activo */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5, flexGrow: 1 }}> {/* Reducido gap, añadido flexGrow */}
          <Button component={NavLink} to="/" sx={linkSx} startIcon={<HomeIcon />}>
            Inicio
          </Button>
          <Button component={NavLink} to="/stores" sx={linkSx} startIcon={<StorefrontIcon />}>
            Tiendas
          </Button>
          <Button component={NavLink} to="/catalog" sx={linkSx} startIcon={<ListAltIcon />}>
            Catálogo
          </Button>
          <Button component={NavLink} to="/orders" sx={linkSx} startIcon={<ReceiptLongIcon />}>
            Mis pedidos
          </Button>
          <Button component={NavLink} to="/contact" sx={linkSx} startIcon={<ContactSupportIcon />}>
            Contacto
          </Button>
        </Box>

        {/* Separador (opcional, si los links no usan flexGrow: 1) */}
        {/* <Box sx={{ flexGrow: 1 }} /> */}

        {/* Tienda actual */}
        <Chip
          component={RouterLink}
          to="/stores"
          clickable
          icon={<StorefrontIcon sx={{ color: 'inherit' }} />}
          label={store ? store.name : 'Elegir tienda'}
          sx={{
            // mr: 2, // Quitar margen si los links ocupan espacio
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.6)',
            '& .MuiChip-icon': { color: 'inherit' },
            display: { xs: 'none', md: 'flex' } // Ocultar en pantallas pequeñas si se ve apretado
          }}
          variant="outlined"
        />

        {/* Icono Carrito */}
        <motion.div
          animate={{ scale: animateCart ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ marginLeft: '8px' }} // Añadir un pequeño margen izquierdo
        >
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
        </motion.div>
      </Toolbar>
    </AppBar>
  );
}