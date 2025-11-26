import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Typography,
  CardActionArea,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { useUI } from '../context/UIContext';

export default function ProductCard({ product }) {
  const { addItem, items, clear } = useCart();
  const { openQuickView } = useUI();

  const handleAdd = () => {
    if (items.length > 0) {
      const currentStore = items[0].storeId;
      if (currentStore && currentStore !== product.storeId) {
        const ok = window.confirm('Tu carrito pertenece a otra tienda. Cambiar de tienda vaciará tu carrito. ¿Continuar?');
        if (!ok) return;
        clear();
      }
    }
    addItem(product);
  };

  const handleOpenQuick = () => {
    // Pasamos el producto con storeId para que el QuickView lo respete
    openQuickView(product);
  };

  return (
    <Card>
      <CardActionArea onClick={handleOpenQuick}>
        <CardMedia
          component="div"
          sx={{
            height: 140,
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.contrastText',
            fontWeight: 700,
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            product.size ?? product.name
          )}
        </CardMedia>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            {product.name}
          </Typography>
          {product.size && (
            <Typography variant="body2" color="text.secondary">
              {product.size}
            </Typography>
          )}
          <Typography variant="h6" sx={{ mt: 1 }}>
            {formatCurrency(product.price)}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button variant="contained" size="small" onClick={handleAdd}>
          Agregar
        </Button>
      </CardActions>
    </Card>
  );
}