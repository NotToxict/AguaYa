import React from 'react';
import { Box, Chip, Container, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useUI } from '../context/UIContext';

export default function AddressBar() {
  const { address, slot, openAddressDialog } = useUI();

  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg" sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOnIcon color="primary" />
        <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={openAddressDialog}>
          <Typography variant="caption" color="text.secondary" noWrap>
            Entregar en
          </Typography>
          <Typography variant="subtitle2" noWrap>
            {address || 'Ingresa tu dirección'}
          </Typography>
        </Box>
        <Chip
          variant="outlined"
          size="small"
          onClick={openAddressDialog}
          icon={<ExpandMoreIcon />}
          label={slot || 'Lo antes posible'}
          sx={{ borderRadius: 1.5 }}
        />
      </Container>
    </Box>
  );
}