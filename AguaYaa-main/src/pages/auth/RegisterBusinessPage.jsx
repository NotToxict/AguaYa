import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Paper, TextField, Button, 
  Stepper, Step, StepLabel, Alert, Grid, CircularProgress, Divider 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Iconos
import StorefrontIcon from '@mui/icons-material/Storefront';
import GoogleIcon from '@mui/icons-material/Google';
import MapIcon from '@mui/icons-material/Map';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Componente de Mapa
import LocationPicker from '../../components/LocationPicker';

const steps = ['Cuenta', 'Datos del Local', 'Ubicación', 'Documentación'];

export default function RegisterBusinessPage() {
  const { user, loginWithGoogle, loginWithEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Datos acumulados del formulario
  const [storeData, setStoreData] = useState({ name: '', phone: '', address: '' });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  
  // Estado para Documentos
  const [files, setFiles] = useState({ INE: null, RFC: null, DOMICILIO: null });
  const [uploadProgress, setUploadProgress] = useState(false);

  // Formularios (React Hook Form)
  const { register: registerAuth, handleSubmit: submitAuth } = useForm();
  
  // Paso 1: Detectar sesión
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'local') {
        // Si ya es dueño, redirigir (o mostrar estado si está pendiente)
        if (user.verificationStatus === 'pending') navigate('/verification');
        else navigate('/local');
      } else {
        // Si es usuario nuevo o cliente, avanzamos al paso 1
        setActiveStep(prev => Math.max(prev, 1));
      }
    }
  }, [isAuthenticated, user, navigate]);

  // --- MANEJADORES DE PASOS ---

  // PASO 0: Registro / Login con Email
  const handleAuthSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      if (data.isLogin) {
        await loginWithEmail(data.email, data.password);
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      }
      // El useEffect nos moverá al paso 1
    } catch (err) {
      setError("Error de autenticación. Verifica tus datos.");
    } finally { setLoading(false); }
  };

  // PASO 3: Subir todo y Finalizar
  const handleFinalSubmit = async () => {
    if (!files.INE || !files.RFC || !files.DOMICILIO) {
      setError("Debes subir los 3 documentos obligatorios.");
      return;
    }

    setLoading(true); setError('');
    setUploadProgress(true);

    try {
      // 1. Subir documentos a Firebase
      const uploadedDocs = [];
      for (const type of ['INE', 'RFC', 'DOMICILIO']) {
        const file = files[type];
        const storageRef = ref(storage, `documents/registration/${user.uid}/${type}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedDocs.push({ type, url });
      }

      // 2. Enviar todo al Backend
      const payload = {
        uid: user.uid,
        ...storeData,
        lat: coords.lat,
        lng: coords.lng,
        documents: uploadedDocs
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register-business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.ok) {
        // Forzar recarga para actualizar rol
        window.location.href = "/verification"; 
      } else {
        setError(data.error || 'Error al registrar.');
      }

    } catch (err) {
      console.error(err);
      setError("Error en el proceso de registro.");
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        
        <Box textAlign="center" mb={4}>
          <StorefrontIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">Alta de Negocio</Typography>
          <Typography color="text.secondary">Únete a la red de proveedores de AguaYa</Typography>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* === PASO 0: CUENTA === */}
        {activeStep === 0 && (
          <Box maxWidth="sm" mx="auto">
            <Typography variant="h6" gutterBottom>1. Identifícate</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Para administrar tu negocio, necesitas una cuenta segura.
            </Typography>
            
            <Button variant="outlined" fullWidth size="large" startIcon={<GoogleIcon />} onClick={loginWithGoogle} sx={{ mb: 3 }}>
              Continuar con Google
            </Button>
            
            <Divider>O usa tu correo</Divider>
            
            <Box component="form" onSubmit={submitAuth((data) => handleAuthSubmit({...data, isLogin: false}))} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Correo Electrónico" type="email" fullWidth required {...registerAuth('email')} />
              <TextField label="Contraseña" type="password" fullWidth required {...registerAuth('password')} />
              <Button type="submit" variant="contained" size="large">Crear Cuenta y Continuar</Button>
              <Button size="small" onClick={() => handleAuthSubmit({ ...registerAuth('email'), ...registerAuth('password'), isLogin: true })}>
                ¿Ya tienes cuenta? Inicia Sesión
              </Button>
            </Box>
          </Box>
        )}

        {/* === PASO 1: DATOS === */}
        {activeStep === 1 && (
          <Box maxWidth="sm" mx="auto">
            <Typography variant="h6" gutterBottom>2. Datos de la Purificadora</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField label="Nombre del Negocio" fullWidth required value={storeData.name} onChange={(e) => setStoreData({...storeData, name: e.target.value})} />
              <TextField label="Teléfono de Contacto" type="tel" fullWidth required value={storeData.phone} onChange={(e) => setStoreData({...storeData, phone: e.target.value})} />
              <TextField label="Dirección Escrita" multiline rows={2} fullWidth required value={storeData.address} onChange={(e) => setStoreData({...storeData, address: e.target.value})} helperText="Calle, Número, Colonia, CP" />
              
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button onClick={() => setActiveStep(0)}>Atrás</Button>
                <Button variant="contained" onClick={() => {
                  if(storeData.name && storeData.address) setActiveStep(2);
                  else setError("Completa los campos obligatorios");
                }}>Siguiente</Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* === PASO 2: UBICACIÓN === */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>3. Ubicación Exacta</Typography>
            <Typography variant="body2" color="text.secondary">Arrastra el pin para confirmar dónde se encuentra tu local.</Typography>
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <LocationPicker onLocationSelect={setCoords} />
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={() => setActiveStep(1)}>Atrás</Button>
              <Button variant="contained" onClick={() => {
                if(coords.lat) setActiveStep(3);
                else setError("Selecciona la ubicación en el mapa");
              }}>Siguiente</Button>
            </Box>
          </Box>
        )}

        {/* === PASO 3: DOCUMENTACIÓN === */}
        {activeStep === 3 && (
          <Box maxWidth="sm" mx="auto">
            <Typography variant="h6" gutterBottom>4. Documentación Legal</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Para activar tu tienda, necesitamos validar tu identidad. Sube fotos claras o PDFs.
            </Alert>

            <Grid container spacing={2}>
              {['INE', 'RFC', 'DOMICILIO'].map((doc) => (
                <Grid item xs={12} key={doc}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography fontWeight="bold">{doc === 'DOMICILIO' ? 'Comprobante Domicilio' : doc}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {files[doc] ? files[doc].name : 'Pendiente de subir'}
                      </Typography>
                    </Box>
                    <Button component="label" variant={files[doc] ? "outlined" : "contained"} size="small" startIcon={files[doc] ? <CheckCircleIcon/> : <CloudUploadIcon/>}>
                      {files[doc] ? 'Cambiar' : 'Subir'}
                      <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => setFiles({...files, [doc]: e.target.files[0]})} />
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button onClick={() => setActiveStep(2)} disabled={loading}>Atrás</Button>
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleFinalSubmit} 
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit"/>}
              >
                {loading ? 'Enviando Solicitud...' : 'Finalizar Registro'}
              </Button>
            </Box>
          </Box>
        )}

      </Paper>
    </Container>
  );
}