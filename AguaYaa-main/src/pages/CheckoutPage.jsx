import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { buildWhatsAppLink } from '../utils/whatsapp';

const BUSINESS_PHONE = '6311110570'; // <- Reemplaza con tu número

const slots = [
  'Lo antes posible',
  '08:00–10:00',
  '10:00–12:00',
  '12:00–14:00',
  '16:00–18:00',
  '18:00–20:00',
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    slot: 'Lo antes posible',
  });

  const disabled = items.length === 0;
  const canSubmit = useMemo(() => {
    return form.name.trim() && form.phone.trim() && form.address.trim() && !disabled;
  }, [form, disabled]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleWhatsApp = () => {
    const url = buildWhatsAppLink({
      items,
      subtotal,
      phone: BUSINESS_PHONE,
      customer: form,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" component="h1">Checkout</Typography>
      {disabled ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Tu carrito está vacío. Agrega productos desde el catálogo.
        </Typography>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={7}>
              <Box component="form" noValidate autoComplete="off" sx={{ display: 'grid', gap: 2 }}>
                <TextField label="Nombre" name="name" value={form.name} onChange={handleChange} required />
                <TextField label="Teléfono" name="phone" value={form.phone} onChange={handleChange} required />
                <TextField label="Dirección" name="address" value={form.address} onChange={handleChange} required />
                <TextField
                  select
                  label="Horario preferido"
                  name="slot"
                  value={form.slot}
                  onChange={handleChange}
                >
                  {slots.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Notas (opcional)"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
                <Typography variant="h6">Resumen</Typography>
                <Box sx={{ mt: 1, display: 'grid', gap: 0.5 }}>
                  {items.map((it) => (
                    <Typography key={it.id} variant="body2">
                      {it.qty} x {it.name}{it.size ? ' · ' + it.size : ''} — {formatCurrency(it.price)}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Subtotal: {formatCurrency(subtotal)}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="contained" disabled={!canSubmit} onClick={handleWhatsApp}>
                    Confirmar por WhatsApp
                  </Button>
                  <Button color="inherit" onClick={clear}>Vaciar carrito</Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}