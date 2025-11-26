import React from 'react';
import { Container, Typography } from '@mui/material';

export default function OrdersPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" component="h1">Mis pedidos</Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Aquí verás tus pedidos cuando el backend esté listo.
      </Typography>
    </Container>
  );
}