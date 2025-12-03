import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Paper, Grid, Fade, Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Iconos
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// CATEGORÍAS
const categories = [
  { label: 'Tiendas', icon: <StorefrontIcon />, to: '/stores', color: '#E3F2FD', textColor: '#1976d2' },
  { label: 'Mi Perfil', icon: <PersonIcon />, to: '/profile', color: '#E0F7FA', textColor: '#0097a7' },
  { label: 'Soporte', icon: <SupportAgentIcon />, to: '/contact', color: '#F3E5F5', textColor: '#7b1fa2' },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Cargar Promociones Reales
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/promos/active`);
        const data = await res.json();
        if (Array.isArray(data)) setBanners(data);
      } catch (error) {
        console.error("Error cargando promos:", error);
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchPromos();
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8, pt: 4, overflowX: 'hidden' }}>
      
      {/* 1. SALUDO PERSONAL */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        sx={{ mb: 3, mt: 4 }}
      >
        <Fade in={!isLoading}>
          <Box>
            <Typography variant="h4" fontWeight="900" letterSpacing={-1}>
              Hola, {user?.name?.split(' ')[0] || 'Vecino'} 👋
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="400">
              ¿Qué necesitas hoy?
            </Typography>
          </Box>
        </Fade>
      </Box>

      {/* 2. CARRUSEL DE PROMOCIONES */}
      {loadingBanners ? (
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 4, mb: 4 }} />
      ) : banners.length > 0 ? (
        <Box 
          component={motion.div}
          initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: 0.3 }}
          sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        >
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            style={{ width: '100%', aspectRatio: '3/1', maxHeight: '300px' }}
          >
            {banners.map((promo) => (
              <SwiperSlide key={promo.promo_id}>
                <Box 
                  component={RouterLink}
                  to={`/store/${promo.local_id}`}
                  sx={{ 
                    display: 'block', width: '100%', height: '100%',
                    backgroundImage: `url(${promo.image_url})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    position: 'relative', textDecoration: 'none'
                  }}
                >
                  <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    p: 3, pt: 6, color: 'white'
                  }}>
                    <Typography variant="h5" fontWeight="bold">{promo.title}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{promo.local_name}</Typography>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      ) : (
        // Banner por defecto si no hay promos activas
        <Paper sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">¡Bienvenido a AguaYa!</Typography>
          <Typography variant="body2">Las mejores purificadoras de la ciudad a un clic.</Typography>
        </Paper>
      )}

      {/* 3. ACCESOS RÁPIDOS (Explorar) */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Explorar</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {categories.map((cat, idx) => (
          <Grid item xs={4} key={idx}>
            {/* SOLUCIÓN: Usamos Box para la animación y Paper para el Link */}
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Paper 
                component={RouterLink}
                to={cat.to}
                elevation={0}
                sx={{ 
                  p: 2, 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', 
                  bgcolor: cat.color, borderRadius: 3,
                  textDecoration: 'none', cursor: 'pointer'
                }}
              >
                <Box sx={{ color: cat.textColor, mb: 1 }}>{cat.icon}</Box>
                <Typography variant="body2" fontWeight="bold" color="text.primary">
                  {cat.label}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* 4. ACCESO DIRECTO A TIENDAS (Extra) */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        sx={{ 
          bgcolor: 'background.paper', p: 3, borderRadius: 4, 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">¿Sediento?</Typography>
          <Typography variant="body2" color="text.secondary">Busca tu purificadora favorita</Typography>
        </Box>
        <IconButton 
          component={RouterLink} to="/stores"
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>

    </Container>
  );
}