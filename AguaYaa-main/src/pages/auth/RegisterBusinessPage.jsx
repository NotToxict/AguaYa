import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Paper, TextField, Button, 
  Stepper, Step, StepLabel, Alert 
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterBusinessPage() {
  const { user, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso 1: Si ya se logueó, avanzamos al formulario
  useEffect(() => {
    if (isAuthenticated) {
      // Si ya es dueño, lo mandamos directo a su panel
      if (user.role === 'local') navigate('/local');
      else setActiveStep(1);
    }
  }, [isAuthenticated, user, navigate]);

  const handleRegisterStore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register-business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          ...formData
        })
      });

      const data = await res.json();

      if (data.ok) {
        // ÉXITO: Mostramos aviso y redirigimos al inicio (porque está pendiente)
        alert("¡Registro recibido! Tu tienda está en proceso de validación. Un asesor te contactará pronto.");
        window.location.href = "/"; 
      } else {
        setError(data.error || 'Error al registrar la tienda');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <StorefrontIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          AguaYa para Negocios
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Registra tu purificadora y empieza a vender en minutos.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step><StepLabel>Crear Cuenta</StepLabel></Step>
          <Step><StepLabel>Datos del Local</StepLabel></Step>
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* PASO 0: LOGIN */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Primero, inicia sesión con la cuenta que administrará el negocio:
            </Typography>
            <Button
              variant="outlined" size="large" fullWidth
              startIcon={<GoogleIcon />}
              onClick={loginWithGoogle}
            >
              Registrarme con Google
            </Button>
          </Box>
        )}

        {/* PASO 1: DATOS DE LA TIENDA */}
        {activeStep === 1 && (
          <Box component="form" onSubmit={handleRegisterStore} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" align="left">Información de la Purificadora</Typography>
            
            <TextField 
              label="Nombre del Negocio" 
              placeholder="Ej: Purificadora El Manantial"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
            <TextField 
              label="Teléfono de Pedidos" 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
            <TextField 
              label="Dirección del Local" 
              multiline rows={2}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required 
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Registrando...' : 'Finalizar Registro'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}