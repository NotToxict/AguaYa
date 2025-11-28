import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Alert, Container 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function SuperAdminPage() {
  const [pendingStores, setPendingStores] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pending-stores`);
      const data = await res.json();
      if (Array.isArray(data)) setPendingStores(data);
    } catch (error) { console.error(error); }
  };

  const handleApprove = async (localId) => {
    if (!window.confirm("¿Estás seguro de aprobar esta tienda? Podrá empezar a vender de inmediato.")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/approve-store/${localId}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setMessage('Tienda aprobada correctamente ✅');
        fetchPending(); // Recargar lista
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) { alert("Error de conexión"); }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <VerifiedUserIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight="bold">
          Panel de Super Admin
        </Typography>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Solicitudes de Registro ({pendingStores.length})
        </Typography>
        
        {pendingStores.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No hay solicitudes pendientes. Todo está al día. 🧹
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Negocio</strong></TableCell>
                  <TableCell><strong>Dueño</strong></TableCell>
                  <TableCell><strong>Contacto</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell align="center"><strong>Acción</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingStores.map((store) => (
                  <TableRow key={store.local_id}>
                    <TableCell>
                      <Typography fontWeight="bold">{store.name}</Typography>
                      <Typography variant="caption">{store.address}</Typography>
                    </TableCell>
                    <TableCell>
                      {store.owner_name} <br/>
                      <Typography variant="caption" color="text.secondary">{store.owner_email}</Typography>
                    </TableCell>
                    <TableCell>{store.phone}</TableCell>
                    <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="contained" 
                        color="success" 
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(store.local_id)}
                      >
                        Aprobar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}