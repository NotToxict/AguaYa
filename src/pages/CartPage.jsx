import React from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { useNavigate } from 'react-router-dom';

const BUSINESS_PHONE = '6311110570'; // <- Reemplaza con tu número de WhatsApp

export default function CartPage() {
  const { items, increment, decrement, removeItem, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const waUrl = buildWhatsAppLink({ items, subtotal, phone: BUSINESS_PHONE });

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Carrito
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">Tu carrito está vacío.</Typography>
      ) : (
        <>
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {items.map((it) => (
              <ListItem
                key={it.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => decrement(it.id)}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography minWidth={24} textAlign="center">
                      {it.qty}
                    </Typography>
                    <IconButton size="small" onClick={() => increment(it.id)}>
                      <AddIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => removeItem(it.id)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={`${it.name}${it.size ? ' • ' + it.size : ''}`}
                  secondary={formatCurrency(it.price)}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Button color="inherit" onClick={clear}>
              Vaciar carrito
            </Button>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1">Subtotal: {formatCurrency(subtotal)}</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="outlined" component="a" href={waUrl} target="_blank" rel="noopener noreferrer">
                  Confirmar por WhatsApp
                </Button>
                <Button variant="contained" onClick={() => navigate('/checkout')}>
                  Ir a checkout
                </Button>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
}