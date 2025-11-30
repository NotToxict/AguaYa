import React, { useState } from 'react';
import { Box, Button, Typography, Container, Paper, TextField, Alert, InputAdornment, IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase'; 
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';

export default function RegisterClientPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      // 1. Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Actualizar el nombre visual
      await updateProfile(userCredential.user, {
        displayName: data.fullName
      });

      // 3. ¡CORRECCIÓN! Redirigir al PERFIL para que completen sus datos
      // El AuthContext se encargará de crear al usuario en la BD en segundo plano
      navigate('/profile'); 
      
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') setErrorMsg('Este correo ya está registrado.');
      else if (error.code === 'auth/weak-password') setErrorMsg('La contraseña es muy débil.');
      else setErrorMsg('Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Crear Cuenta 💧
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Únete a AguaYa y pide tu garrafón en segundos.
          </Typography>

          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            <TextField
              label="Nombre Completo"
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action"/></InputAdornment> }}
              {...register("fullName", { required: "El nombre es obligatorio" })}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />

            <TextField
              label="Correo Electrónico"
              type="email"
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action"/></InputAdornment> }}
              {...register("email", { 
                required: "El correo es obligatorio",
                pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Contraseña"
              type={showPass ? "text" : "password"}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><LockIcon color="action"/></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              {...register("password", { 
                required: "La contraseña es obligatoria",
                minLength: { value: 6, message: "Mínimo 6 caracteres" }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={loading}
              sx={{ mt: 1, py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
            >
              {loading ? 'Creando Cuenta...' : 'Registrarme'}
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2">
              ¿Ya tienes cuenta? <RouterLink to="/login" style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}>Inicia Sesión</RouterLink>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}