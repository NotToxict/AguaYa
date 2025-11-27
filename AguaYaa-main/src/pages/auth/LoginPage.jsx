import React, { useEffect } from 'react'; // <--- Importamos useEffect
import { Box, Button, Typography, Container, Paper, Divider, Link } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // <--- Importamos useNavigate

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated, role } = useAuth(); 
  const navigate = useNavigate(); // <--- El "chofer" que nos lleva

  // --- EFECTO DE REDIRECCIÓN ---
  // Este bloque se ejecuta cada vez que cambia el estado del usuario
  useEffect(() => {
    if (isAuthenticated && role) {
      console.log("Usuario detectado con rol:", role);
      
      if (role === 'local') {
        navigate('/local'); // Si es jefe, al panel
      } else if (role === 'delivery') {
        navigate('/delivery'); // Si es chofer, a su ruta
      } else {
        navigate('/'); // Si es cliente, a comprar
      }
    }
  }, [isAuthenticated, role, navigate]);
  // -----------------------------

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 3 
        }}
      >
        <Typography component="h1" variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
          AguaYa 💧
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          La sed se acaba aquí
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={loginWithGoogle}
          sx={{ mb: 3, py: 1.5, textTransform: 'none', fontSize: '1.1rem' }}
        >
          Continuar con Google
        </Button>

        <Divider flexItem sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary">ACCESO SEGURO</Typography>
        </Divider>

        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">¿Tienes una purificadora?</Typography>
          <Link component={RouterLink} to="/register-business" variant="body2" fontWeight="bold" sx={{ textDecoration: 'none' }}>
            Regístrate como Vendedor
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}