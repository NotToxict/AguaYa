import React, { useState, useEffect } from 'react'; // Añadir useState, useEffect
import {
  Container,
  Typography,
  Box, // Añadir Box
  CircularProgress, // Añadir CircularProgress
  Alert, // Añadir Alert
  List, // Añadir List
  ListItem, // Añadir ListItem
  ListItemText, // Añadir ListItemText
  Divider, // Añadir Divider
  Chip, // Añadir Chip
} from '@mui/material';
import { fetchOrders } from '../services/storeService'; // <-- Importar el servicio
import { formatCurrency } from '../utils/format'; // Para formatear el total

// Mapeo simple de estados a colores de Chip (puedes ajustar)
const statusColors = {
  'Entregado': 'success',
  'En Ruta': 'info',
  'Pendiente': 'warning',
  'Cancelado': 'error',
};

export default function OrdersPage() {
  // Estados para pedidos, carga y error
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para cargar los pedidos al montar
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrders() // Podrías pasar un ID de usuario si tuvieras autenticación real
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error("Error al cargar pedidos:", err);
        setError("No se pudieron cargar tus pedidos. Intenta de nuevo más tarde.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Cargar solo al montar

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: { xs: 10, md: 6 } }}> {/* Añadido margen inferior */}
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}> {/* Aumentado margen inferior */}
        Mis pedidos
      </Typography>

      {/* Indicador de Carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensaje de Error */}
      {error && !loading && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Mensaje si no hay pedidos (después de cargar y sin error) */}
      {!loading && !error && orders.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Aún no tienes pedidos registrados.
        </Typography>
      )}

      {/* Lista de Pedidos (si no carga, no hay error y hay pedidos) */}
      {!loading && !error && orders.length > 0 && (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {orders.map((order, index) => (
            <React.Fragment key={order.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`Pedido #${order.id} - ${new Date(order.date).toLocaleDateString()}`}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block' }} // Para que ocupe su línea
                      >
                        Total: {formatCurrency(order.total)}
                      </Typography>
                      {/* Podrías listar los items aquí si quisieras */}
                      {/* {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')} */}
                    </>
                  }
                />
                <Chip
                  label={order.status}
                  color={statusColors[order.status] || 'default'}
                  size="small"
                />
              </ListItem>
              {index < orders.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
}