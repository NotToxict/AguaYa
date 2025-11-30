import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Container, Paper, Divider, Link, TextField, Alert, InputAdornment 
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, isAuthenticated, role } = useAuth(); 
  const navigate = useNavigate();

  // Estados para el formulario de correo
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- REDIRECCIÓN INTELIGENTE (SEMÁFORO) ---
  useEffect(() => {
    if (isAuthenticated && role) {
      console.log("Rol detectado:", role); // Para depurar si es necesario
      
      if (role === 'admin') {
        navigate('/admin'); // <--- ¡AQUÍ ESTÁ EL CAMBIO! Jefe Supremo
      } else if (role === 'local') {
        navigate('/local'); // Dueño de Tienda
      } else if (role === 'delivery') {
        navigate('/delivery'); // Repartidor
      } else {
        navigate('/'); // Cliente Normal (client)
      }
    }
  }, [isAuthenticated, role, navigate]);

  // Manejar Login con Email/Pass
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(formData.email, formData.password);
      // La redirección la maneja el useEffect de arriba
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Verifica tus datos.');
      }
      setLoading(false);
    }
  };

  // Manejar Login con Google
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('No se pudo iniciar con Google.');
    }
  };

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
        {/* LOGO */}
        <Typography component="h1" variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
          AguaYa 💧
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bienvenido de nuevo
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        {/* --- FORMULARIO DE CORREO (Para Choferes, Dueños y ADMIN) --- */}
        <Box component="form" onSubmit={handleEmailLogin} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal" required fullWidth
            label="Correo Electrónico"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
            }}
          />
          <TextField
            margin="normal" required fullWidth
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 'bold' }}
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </Button>
        </Box>

        {/* DIVISOR */}
        <Divider flexItem sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">O CONTINUAR CON</Typography>
        </Divider>

        {/* BOTÓN GOOGLE (Para Clientes) */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{ mb: 2, py: 1, textTransform: 'none', color: '#555', borderColor: '#ccc' }}
        >
          Google
        </Button>

        {/* ENLACE DE REGISTRO CLIENTE */}
        <Box sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
          <Typography variant="body2">
            ¿Eres nuevo?{' '}
            <Link component={RouterLink} to="/register" fontWeight="bold" sx={{ textDecoration: 'none' }}>
              Crea tu cuenta aquí
            </Link>
          </Typography>
        </Box>

        {/* DIVISOR DELGADO */}
        <Divider sx={{ width: '50%', my: 2, mx: 'auto' }} />

        {/* FOOTER: REGISTRO DE NEGOCIOS (Lo que ya tenías) */}

        {/* FOOTER: REGISTRO DE NEGOCIOS */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ¿Tienes una purificadora?
          </Typography>
          <Link 
            component={RouterLink} 
            to="/register-business" 
            variant="body2" 
            fontWeight="bold"
            sx={{ textDecoration: 'none' }}
          >
            Regístrate como Vendedor
          </Link>
        </Box>

      </Paper>
    </Container>
  );
}