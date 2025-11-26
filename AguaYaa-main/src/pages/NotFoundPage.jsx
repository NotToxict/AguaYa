import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 6, textAlign: 'center' }}>
      <Typography variant="h4" component="h1">Página no encontrada</Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        La página que buscas no existe.
      </Typography>
      <Button sx={{ mt: 3 }} variant="contained" component={RouterLink} to="/">
        Volver al inicio
      </Button>
    </Container>
  );
}