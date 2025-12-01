import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Paper, Grid, LinearProgress, Fade, Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

// Iconos
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton'; // Faltaba importarlo explícitamente si se usa, pero aquí lo usamos en el botón de flecha
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// NUEVAS CATEGORÍAS (Navegación Rápida)
const categories = [
  { label: 'Tiendas', icon: <StorefrontIcon />, to: '/stores', color: '#E3F2FD', textColor: '#1976d2' },
  { label: 'Mi Perfil', icon: <PersonIcon />, to: '/profile', color: '#E0F7FA', textColor: '#0097a7' },
  { label: 'Soporte', icon: <SupportAgentIcon />, to: '/contact', color: '#F3E5F5', textColor: '#7b1fa2' },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { openAddressDialog } = useUI();
  
  const [progress, setProgress] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Efecto de carga de ubicación (Barra progresiva)
  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 90) return 90;
          const diff = Math.random() * 15;
          return Math.min(oldProgress + diff, 90);
        });
      }, 200);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [isLoading]);

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
    <Container maxWidth="md" sx={{ pb: 8, overflowX: 'hidden' }}>
      
      {/* 1. BARRA DE UBICACIÓN (Sin Buscador) */}
      <Box 
        component={motion.div}
        initial="hidden" animate="visible" variants={itemVariants} transition={{ duration: 0.5 }}
        sx={{ mt: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box 
          onClick={!isLoading ? openAddressDialog : undefined} 
          sx={{ cursor: isLoading ? 'wait' : 'pointer', flexGrow: 1 }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem', fontWeight: 'bold' }}>
            Entregar en:
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 32 }}>
            <LocationOnIcon color={isLoading ? "action" : "primary"} fontSize="small" />
            
            {isLoading ? (
              <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress}
                  sx={{ 
                    height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': {
                      transition: 'transform 0.2s linear', borderRadius: 4,
                      backgroundImage: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.5 }}>
                  Identificando ubicación... {Math.round(progress)}%
                </Typography>
              </Box>
            ) : (
              <Fade in={true}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2, display: 'flex', alignItems: 'center' }}>
                  {user?.default_address ? (user.default_address.length > 25 ? user.default_address.substring(0, 25) + '...' : user.default_address) : 'Seleccionar Ubicación'} 
                  <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'primary.main', fontSize: '0.7rem' }}>▼</Typography>
                </Typography>
              </Fade>
            )}
          </Box>
        </Box>

        {/* AQUÍ QUITAMOS EL BUSCADOR QUE NO SE USABA */}
      </Box>

      {/* 2. SALUDO PERSONAL */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        sx={{ mb: 3 }}
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

      {/* 3. CARRUSEL DE PROMOCIONES */}
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

      {/* 4. ACCESOS RÁPIDOS (Nuevo Diseño) */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Explorar</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {categories.map((cat, idx) => (
          <Grid item xs={4} key={idx}>
            <Paper 
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              component={RouterLink}
              to={cat.to} // <--- Ahora lleva a la ruta correcta
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
          </Grid>
        ))}
      </Grid>

      {/* 5. ACCESO DIRECTO A TIENDAS (Extra) */}
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