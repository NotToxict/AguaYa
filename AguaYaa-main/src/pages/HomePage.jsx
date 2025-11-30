import React from 'react';
import { 
  Box, Typography, Container, Paper, Grid, Button, IconButton, Chip 
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Iconos
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';

// Swiper (Carrusel)
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
// Estilos de Swiper (Asegúrate de tenerlos instalados o usa tu archivo swiper.css)
import 'swiper/css';
import 'swiper/css/pagination';

// CATEGORÍAS RÁPIDAS
const categories = [
  { label: 'Agua', icon: <LocalDrinkIcon />, color: '#E3F2FD', textColor: '#1976d2' },
  { label: 'Hielo', icon: <AcUnitIcon />, color: '#E0F7FA', textColor: '#0097a7' },
  { label: 'Tiendas', icon: <StorefrontIcon />, color: '#F3E5F5', textColor: '#7b1fa2' },
];

// BANNERS DE PROMOCIÓN (Datos falsos por ahora)
const banners = [
  { id: 1, title: '2x1 en Garrafones', sub: 'Solo por hoy en Manantial', color: '#1565c0' },
  { id: 2, title: 'Envío GRATIS', sub: 'En tu primer pedido', color: '#2e7d32' },
  { id: 3, title: 'Nuevos Horarios', sub: 'Entregamos hasta las 8 PM', color: '#ed6c02' },
];

export default function HomePage() {
  const { user } = useAuth();

  // Animación base para los elementos
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8, overflowX: 'hidden' }}>
      
      {/* 1. ENCABEZADO DE BIENVENIDA */}
      <Box 
        component={motion.div}
        initial="hidden" animate="visible" variants={itemVariants} transition={{ duration: 0.5 }}
        sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">Estás en:</Typography>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
            📍 {user?.default_address ? 'Casa' : 'Seleccionar Ubicación'} 
            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main', cursor: 'pointer' }}>▼</Typography>
          </Typography>
        </Box>
        <IconButton sx={{ bgcolor: '#f5f5f5' }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* 2. SALUDO PERSONAL */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight="900" letterSpacing={-1}>
          Hola, {user?.name?.split(' ')[0] || 'Vecino'} 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight="400">
          ¿Qué se te antoja hoy?
        </Typography>
      </Box>

      {/* 3. CARRUSEL DE PROMOCIONES (SWIPER) */}
      <Box 
        component={motion.div}
        initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: 0.3 }}
        sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          style={{ height: '160px' }}
        >
          {banners.map((b) => (
            <SwiperSlide key={b.id}>
              <Box sx={{ 
                height: '100%', 
                bgcolor: b.color, 
                color: 'white', 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)',
                backgroundSize: '40px 40px'
              }}>
                <Typography variant="h4" fontWeight="bold">{b.title}</Typography>
                <Typography variant="subtitle1">{b.sub}</Typography>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* 4. CATEGORÍAS RÁPIDAS */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Categorías</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {categories.map((cat, idx) => (
          <Grid item xs={4} key={idx}>
            <Paper 
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              component={RouterLink}
              to="/stores" // Por ahora todas llevan a tiendas
              elevation={0}
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                bgcolor: cat.color, 
                borderRadius: 3,
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <Box sx={{ color: cat.textColor, mb: 1 }}>{cat.icon}</Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary">
                {cat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 5. ACCESO DIRECTO A TIENDAS */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        sx={{ 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          border: '1px solid #eee'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">Purificadoras Cerca</Typography>
          <Typography variant="body2" color="text.secondary">Encuentra la mejor calidad</Typography>
        </Box>
        <IconButton 
          component={RouterLink} 
          to="/stores"
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>

    </Container>
  );
}