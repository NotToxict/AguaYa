import React, { useState } from 'react';
import { 
  Container, Typography, Box, TextField, Button, Paper, Alert, Snackbar 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext'; 

export default function ContactPage() {
  const { user } = useAuth(); // Detecta si el usuario está logueado
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ open: false, type: 'success', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      // Enviamos el mensaje a tu nuevo backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user ? user.uid : null, // Si es anónimo, envía null
          content: message
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ open: true, type: 'success', text: '¡Mensaje enviado! Gracias.' });
        setMessage(''); // Limpiamos el campo
      } else {
        setStatus({ open: true, type: 'error', text: data.error || 'Error al enviar.' });
      }
    } catch (error) {
      setStatus({ open: true, type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Contacto y Soporte
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {user ? `Hola ${user.displayName || 'usuario'}, ` : ''} 
          ¿Tienes algún problema con un pedido o una sugerencia? Te escuchamos.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            label="Escribe tu mensaje aquí..."
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            required
            sx={{ mb: 3 }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth
            endIcon={<SendIcon />}
            disabled={loading || !message.trim()}
          >
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </Box>
      </Paper>

      {/* Notificación flotante de éxito/error */}
      <Snackbar 
        open={status.open} 
        autoHideDuration={6000} 
        onClose={() => setStatus({ ...status, open: false })}
      >
        <Alert severity={status.type} sx={{ width: '100%' }}>
          {status.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}