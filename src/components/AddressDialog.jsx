import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { useUI } from '../context/UIContext';

const slots = [
  'Lo antes posible',
  '08:00–10:00',
  '10:00–12:00',
  '12:00–14:00',
  '16:00–18:00',
  '18:00–20:00',
];

export default function AddressDialog() {
  const { address, setAddress, slot, setSlot, addressDialogOpen, closeAddressDialog } = useUI();
  const [local, setLocal] = useState(address);
  const [localSlot, setLocalSlot] = useState(slot);

  useEffect(() => {
    setLocal(address);
    setLocalSlot(slot);
  }, [address, slot, addressDialogOpen]);

  const save = () => {
    setAddress(local.trim());
    setSlot(localSlot);
    closeAddressDialog();
  };

  return (
    <Dialog open={addressDialogOpen} onClose={closeAddressDialog} fullWidth maxWidth="sm">
      <DialogTitle>Datos de entrega</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
        <TextField
          label="Dirección"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Calle, número, colonia"
          autoFocus
          fullWidth
        />
        <TextField
          select
          label="Horario preferido"
          value={localSlot}
          onChange={(e) => setLocalSlot(e.target.value)}
          fullWidth
        >
          {slots.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeAddressDialog}>Cancelar</Button>
        <Button variant="contained" onClick={save}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}