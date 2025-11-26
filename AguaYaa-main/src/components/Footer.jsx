import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 8, py: 4, bgcolor: 'grey.100' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} AguaYa • Atención: Lun–Sáb 8:00–20:00 •
          WhatsApp: <Link href="https://wa.me/0000000000" target="_blank" rel="noreferrer">Chatea con nosotros</Link>
        </Typography>
      </Container>
    </Box>
  );
}