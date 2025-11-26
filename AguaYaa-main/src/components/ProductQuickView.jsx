import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid, // Asegúrate de importar Grid
} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import ImageWithFallback from "./ImageWithFallback";
import { formatCurrency } from '../utils/format'; // Asegúrate de importar formatCurrency

export default function ProductQuickView({ open, onClose, product, onAdd }) {
  const [addState, setAddState] = useState('idle'); // 'idle', 'loading', 'success'

  // Resetear estado si el producto cambia o se cierra/abre el modal
  useEffect(() => {
    if (open && product) {
      setAddState('idle');
    }
  }, [open, product]);

  if (!product) return null;

  const handleAddToCart = async () => {
    console.log("Setting addState to loading (QuickView)"); // DEBUG
    setAddState('loading');
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular espera

    try {
      onAdd?.(product); // Llama a la función onAdd pasada como prop
      console.log("Setting addState to success (QuickView)"); // DEBUG
      setAddState('success');
       setTimeout(() => {
         console.log("Setting addState back to idle (QuickView)"); // DEBUG
         setAddState('idle');
         // Opcional: cerrar modal automáticamente tras éxito
         // onClose?.();
       }, 1200);
    } catch (error) {
      console.error("Error adding from quick view:", error);
      console.log("Setting addState back to idle due to error (QuickView)"); // DEBUG
      setAddState('idle');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="product-quickview-title">
      <DialogTitle id="product-quickview-title">{product.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "grey.100", aspectRatio: '1 / 1' }}>
              <ImageWithFallback
                src={product.image || product.imageUrl}
                alt={product.name}
                fallback="/images/placeholder-product.png"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6">
                {formatCurrency(product.price)}
              </Typography>
              {product.oldPrice && (
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through", mb: 1 }}>
                   {formatCurrency(product.oldPrice)}
                </Typography>
              )}
              {product.size && (
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                     Tamaño: {product.size}
                 </Typography>
              )}
              {product.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {product.description}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToCart}
                disabled={addState !== 'idle'}
                sx={{ minWidth: 150, mt: 'auto' }}
              >
                {addState === 'loading' && <CircularProgress size={24} color="inherit" />}
                {addState === 'success' && <CheckIcon />}
                {addState === 'idle' && 'Agregar al carrito'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}