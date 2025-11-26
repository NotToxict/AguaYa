import React from 'react';
import { Container, Typography, Link } from '@mui/material';

export default function ContactPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" component="h1">Contacto</Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Escríbenos por WhatsApp al <Link href="https://wa.me/0000000000" target="_blank" rel="noreferrer">+00 000 000 000</Link> o por email a pedidos@aguaya.com
      </Typography>
    </Container>
  );
}