import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

export default function LocalDashboardPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Tablero de la Tienda
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" color="text.secondary">Pedidos Pendientes: 3</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Revisa y acepta los nuevos pedidos de tus clientes.
        </Typography>
      </Paper>
      {/* Aquí iría la lista de pedidos pendientes */}
    </Box>
  );
}