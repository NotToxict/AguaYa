import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const current = (() => {
    if (location.pathname.startsWith('/catalog')) return '/catalog';
    if (location.pathname.startsWith('/orders')) return '/orders';
    if (location.pathname.startsWith('/contact')) return '/contact';
    return '/';
  })();

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      <BottomNavigation
        value={current}
        onChange={(_, val) => navigate(val)}
        showLabels
      >
        <BottomNavigationAction label="Inicio" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="Catálogo" value="/catalog" icon={<StorefrontIcon />} />
        <BottomNavigationAction label="Pedidos" value="/orders" icon={<ReceiptLongIcon />} />
        <BottomNavigationAction label="Contacto" value="/contact" icon={<ContactSupportIcon />} />
      </BottomNavigation>
    </Paper>
  );
}