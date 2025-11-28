import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Container, Alert, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../config/firebase';

export default function StoreVerificationPage() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('INE');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // Subir a carpeta 'documents' en Firebase
      const storageRef = ref(storage, `documents/${user.localId}/${docType}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      
      // Aquí guardaríamos la URL en la BD, por ahora solo avisamos
      alert("Documento subido correctamente. Nuestro equipo lo revisará.");
      setFile(null);
      
    } catch (error) {
      console.error(error);
      alert("Error al subir documento.");
    } finally {
      setUploading(false);
    }
  };

  // Si ya está aprobado, botón para ir al dashboard
  if (user?.verificationStatus === 'approved') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>¡Tu tienda ha sido verificada!</Alert>
        <Button variant="contained" href="/local">Ir al Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
        <SecurityIcon color="warning" sx={{ fontSize: 80, mb: 2 }} />
        
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Verificación Requerida 🔒
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Para activar tu tienda y empezar a vender, necesitamos validar tu identidad.
          Por favor sube tu <strong>INE</strong> o <strong>Constancia Fiscal</strong>.
        </Typography>

        <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
          Estado actual: <strong>{user?.verificationStatus?.toUpperCase() || 'PENDIENTE'}</strong>. 
          Tus productos no serán visibles al público hasta completar este paso.
        </Alert>

        <Box sx={{ border: '2px dashed #ccc', p: 4, borderRadius: 2, bgcolor: '#fafafa' }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            size="large"
          >
            Seleccionar Documento
            <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
          </Button>
          
          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">{file.name}</Typography>
              <Button 
                variant="contained" 
                onClick={handleUpload} 
                disabled={uploading}
                sx={{ mt: 1 }}
              >
                {uploading ? 'Subiendo...' : 'Enviar a Revisión'}
              </Button>
              {uploading && <LinearProgress sx={{ mt: 1 }} />}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}