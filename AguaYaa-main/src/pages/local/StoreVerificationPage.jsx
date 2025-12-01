import React, { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Container, Alert, LinearProgress,
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../config/firebase';

export default function StoreVerificationPage() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Estado para elegir qué documento estamos corrigiendo
  const [docType, setDocType] = useState(''); // Vacio al inicio para obligar a elegir

  // Leemos el estado. Si el usuario en contexto no se ha actualizado, usamos 'pending'
  const status = user?.verificationStatus || 'pending';

  const handleUploadAndRetry = async () => {
    if (!file) return alert("Selecciona un archivo.");
    if (!docType) return alert("Selecciona qué documento estás corrigiendo.");
    
    setUploading(true);

    try {
      // 1. SUBIR A FIREBASE STORAGE (NUBE)
      // Guardamos con el tipo correcto (ej: INE_123456.jpg)
      const storageRef = ref(storage, `documents/${user.localId}/${docType}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. GUARDAR EN BASE DE DATOS (TIERRA)
      await fetch(`${import.meta.env.VITE_API_URL}/local/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localId: user.localId,
          type: docType, // <--- Ahora enviamos el tipo correcto (INE, RFC...)
          url: downloadUrl
        })
      });

      // 3. SOLICITAR NUEVA REVISIÓN
      const res = await fetch(`${import.meta.env.VITE_API_URL}/local/request-verification/${user.localId}`, {
        method: 'PUT'
      });

      if (res.ok) {
        alert(`Corrección de ${docType} enviada. Tu tienda está en revisión nuevamente.`);
        window.location.reload(); 
      } else {
        alert("Error al notificar al servidor.");
      }
      
    } catch (error) {
      console.error(error);
      alert("Error en el proceso de subida.");
    } finally {
      setUploading(false);
    }
  };

  // --- VISTAS SEGÚN ESTADO ---

  // 1. APROBADO
  if (status === 'approved') {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4, borderTop: '6px solid #2e7d32' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>¡Felicidades!</Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Tu tienda ha sido verificada y activada. Ya puedes empezar a vender.
          </Typography>
          <Button variant="contained" color="success" size="large" href="/local" fullWidth>
            Ir a mi Panel
          </Button>
        </Paper>
      </Container>
    );
  }

  // 2. PENDIENTE (SALA DE ESPERA)
  if (status === 'pending') {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4, borderTop: '6px solid #ed6c02' }}>
          <HourglassTopIcon color="warning" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>En Revisión</Typography>
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            Ya hemos recibido tus documentos. Nuestro equipo los está analizando.
          </Alert>
          <Typography variant="body2" color="text.secondary" paragraph>
            Te notificaremos cuando tu tienda sea aprobada.
          </Typography>
          <Button variant="outlined" color="inherit" href="/" sx={{ mt: 2 }}>
            Volver al Inicio
          </Button>
        </Paper>
      </Container>
    );
  }

  // 3. RECHAZADO (CORRECCIÓN)
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 5, textAlign: 'center', borderRadius: 3, borderTop: '6px solid #d32f2f' }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Solicitud Rechazada
        </Typography>
        
        <Alert severity="error" sx={{ mb: 4, textAlign: 'left', mt: 2 }}>
          <Typography fontWeight="bold">Motivo del rechazo:</Typography>
          {user.rejectionReason || "Documentación ilegible o incompleta."}
        </Alert>

        <Box sx={{ border: '1px solid #ddd', p: 4, borderRadius: 2, bgcolor: '#fafafa', textAlign: 'left' }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Enviar Corrección
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Selecciona qué documento vas a corregir y sube el archivo nuevo.
          </Typography>
          
          {/* SELECTOR DE TIPO DE DOCUMENTO */}
          <FormControl fullWidth sx={{ mb: 2, bgcolor: 'white' }}>
            <InputLabel>¿Qué documento vas a subir?</InputLabel>
            <Select
              value={docType}
              label="¿Qué documento vas a subir?"
              onChange={(e) => setDocType(e.target.value)}
            >
              <MenuItem value="INE">INE / Identificación</MenuItem>
              <MenuItem value="RFC">Constancia Fiscal (RFC)</MenuItem>
              <MenuItem value="DOMICILIO">Comprobante de Domicilio</MenuItem>
              <MenuItem value="OTRO">Otro Documento</MenuItem>
            </Select>
          </FormControl>

          <Button
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<CloudUploadIcon />}
            size="large"
            sx={{ mb: 2, bgcolor: 'white' }}
          >
            {file ? file.name : "Seleccionar Archivo (PDF o Foto)"}
            <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleUploadAndRetry} 
            disabled={uploading || !file || !docType} 
            fullWidth
            size="large"
          >
            {uploading ? 'Enviando...' : 'Enviar Corrección y Pedir Revisión'}
          </Button>
          
          {uploading && <LinearProgress sx={{ mt: 2 }} />}
        </Box>
      </Paper>
    </Container>
  );
}