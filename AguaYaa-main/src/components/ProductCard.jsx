import React from 'react';
import { 
  Card, CardContent, CardMedia, Typography, Box, Button, Chip, Skeleton 
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

// Animación para que se sienta "presionable"
const MotionCard = motion(Card);

export default function ProductCard({ product, storeInfo }) {
  const { addToCart } = useCart();
  
  // Validamos si hay stock y si la tienda está abierta
  const isOutOfStock = product.inventory_count <= 0;
  const isStoreClosed = !storeInfo?.is_active;
  const isDisabled = isOutOfStock || isStoreClosed;

  const handleAdd = () => {
    if (!isDisabled) {
      addToCart(product, storeInfo);
    }
  };

  return (
    <MotionCard 
      elevation={3}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 3,
        position: 'relative',
        opacity: isDisabled ? 0.7 : 1, // Se ve "apagado" si no está disponible
        filter: isDisabled ? 'grayscale(0.8)' : 'none'
      }}
    >
      {/* Etiqueta de Estado (Agotado / Cerrado) */}
      {isDisabled && (
        <Chip 
          label={isStoreClosed ? "CERRADO" : "AGOTADO"} 
          color="error" 
          size="small" 
          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2, fontWeight: 'bold' }} 
        />
      )}

      {/* Imagen con Fallback */}
      <CardMedia
        component="img"
        height="180"
        image={product.image_url || "https://via.placeholder.com/300x200?text=AguaYa"}
        alt={product.name}
        sx={{ objectFit: 'cover', bgcolor: '#f5f5f5' }}
      />

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" lineHeight={1.2} sx={{ fontSize: '1.1rem' }}>
            {product.name}
          </Typography>
          <Chip label={product.size} size="small" variant="outlined" color="primary" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px', fontSize: '0.85rem' }}>
          {product.description || "Agua purificada de excelente calidad."}
        </Typography>

        <DividerLine />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h5" color="primary.main" fontWeight="800">
            ${parseFloat(product.price).toFixed(2)}
          </Typography>
          
          <Button 
            variant="contained" 
            size="medium"
            disabled={isDisabled}
            onClick={handleAdd}
            sx={{ 
              borderRadius: 20, 
              textTransform: 'none', 
              boxShadow: isDisabled ? 'none' : '0 4px 10px rgba(25, 118, 210, 0.4)' 
            }}
            startIcon={isDisabled ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
          >
            {isDisabled ? 'No Disp.' : 'Agregar'}
          </Button>
        </Box>
      </CardContent>
    </MotionCard>
  );
}

// Un pequeño componente visual para la línea divisoria
const DividerLine = () => (
  <Box sx={{ height: '1px', width: '100%', bgcolor: 'rgba(0,0,0,0.08)', my: 1 }} />
);