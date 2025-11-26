import React from 'react';
import { Badge, Fab } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function FloatingCartFab() {
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <Fab
      color="primary"
      onClick={() => navigate('/cart')}
      sx={{
        position: 'fixed',
        right: 16,
        bottom: { xs: 80, md: 24 }, // deja espacio para BottomNav en mobile
        zIndex: (t) => t.zIndex.fab,
        display: { xs: 'flex', md: 'none' },
      }}
      aria-label="Carrito"
    >
      <Badge badgeContent={count} color="secondary">
        <ShoppingCartOutlinedIcon />
      </Badge>
    </Fab>
  );
}