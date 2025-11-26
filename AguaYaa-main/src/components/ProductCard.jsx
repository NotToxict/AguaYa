import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Typography,
  CardActionArea,
  CircularProgress,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { useUI } from '../context/UIContext';

export default function ProductCard({ product }) {
  const { addItem, items, clear } = useCart();
  const { openQuickView } = useUI();
  const [addState, setAddState] = useState('idle'); // 'idle', 'loading', 'success'

  // Resetea el estado del botón si el producto cambia
  useEffect(() => {
    setAddState('idle');
  }, [product]);

  const handleAdd = async () => {
    // Verificar cambio de tienda
    if (items.length > 0) {
      const currentStoreId = items[0].storeId;
      if (currentStoreId && currentStoreId !== product.storeId) {
        const ok = window.confirm('Tu carrito pertenece a otra tienda. Cambiar de tienda vaciará tu carrito. ¿Continuar?');
        if (!ok) return;
        clear();
      }
    }

    console.log("Setting addState to loading"); // DEBUG
    setAddState('loading');
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      addItem(product);
      console.log("Setting addState to success"); // DEBUG
      setAddState('success');
      setTimeout(() => {
        console.log("Setting addState back to idle"); // DEBUG
        setAddState('idle');
      }, 1200);
    } catch (error) {
      console.error("Error adding item:", error);
      console.log("Setting addState back to idle due to error"); // DEBUG
      setAddState('idle');
    }
  };

  const handleOpenQuick = () => {
    openQuickView(product);
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardActionArea onClick={handleOpenQuick} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="div"
          sx={{
            height: 140,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            fontWeight: 700,
            overflow: 'hidden',
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              // Añadir onError para mostrar placeholder si la imagen principal falla
              onError={(e) => { e.target.onerror = null; e.target.src="/images/placeholder-product.png" }}
            />
          ) : (
             // Mostrar placeholder si no hay imageUrl
             <img
               src="/images/placeholder-product.png"
               alt={product.name}
               loading="lazy"
               style={{ width: 'auto', height: '80%', objectFit: 'contain', opacity: 0.5 }}
             />
             // O el texto alternativo anterior si prefieres:
             // <Typography variant="caption" align="center" sx={{ p: 1 }}>{product.name} {product.size || ''}</Typography>
          )}
        </CardMedia>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap title={product.name}>
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
      <CardActions sx={{ justifyContent: 'flex-start', pt: 0, pb: 1.5, px: 1.5 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleAdd}
          disabled={addState !== 'idle'}
          sx={{ minWidth: 80 }}
        >
          {addState === 'loading' && <CircularProgress size={20} color="inherit" />}
          {addState === 'success' && <CheckIcon fontSize="small" />}
          {addState === 'idle' && 'Agregar'}
        </Button>
      </CardActions>
    </Card>
  );
}