import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Alert, Container, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, TextField
} from '@mui/material';
// Iconos
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MapIcon from '@mui/icons-material/Map';

// Mapa
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

export default function SuperAdminPage() {
  const [tabValue, setTabValue] = useState(0);
  
  // Estados de Datos
  const [pendingStores, setPendingStores] = useState([]);
  const [pendingPromos, setPendingPromos] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [finance, setFinance] = useState({ totalRevenue: 0, transactions: [] });
  
  // Mapa
  const [mapStores, setMapStores] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  });

  // Modals
  const [openReview, setOpenReview] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeDocs, setStoreDocs] = useState([]);
  
  // Estado para Rechazo con Motivo
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    // 1. Carga inicial inmediata
    fetchData();

    // 2. Configurar el "Auto-Refresco" cada 5 segundos
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    // 3. Limpieza al salir de la página
    return () => clearInterval(intervalId);
  }, []);

  const fetchData = () => {
    fetchPendingStores();
    fetchPendingPromos();
    fetchSuggestions();
    fetchRevenue();
    fetchMapStores();
  };

  // --- FETCHERS ---
  const fetchPendingStores = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pending-stores`);
      const data = await res.json();
      if (Array.isArray(data)) setPendingStores(data);
    } catch (e) { console.error("Error tiendas:", e); }
  };

  const fetchPendingPromos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pending-promos`);
      const data = await res.json();
      if (Array.isArray(data)) setPendingPromos(data);
    } catch (e) { console.error("Error promos:", e); }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/suggestions`);
      const data = await res.json();
      if (Array.isArray(data)) setSuggestions(data);
    } catch (e) { console.error("Error sugerencias:", e); }
  };

  const fetchRevenue = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/revenue`);
      const data = await res.json();
      setFinance({
        totalRevenue: data.totalRevenue || 0,
        transactions: Array.isArray(data.transactions) ? data.transactions : []
      });
    } catch (e) { 
      console.error("Error finanzas:", e); 
      setFinance({ totalRevenue: 0, transactions: [] });
    }
  };

  const fetchMapStores = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/stores-locations`);
      const data = await res.json();
      if (Array.isArray(data)) setMapStores(data);
    } catch (e) { console.error(e); }
  };

  // --- ACCIONES ---
  
  const handleOpenReview = async (store) => {
    setSelectedStore(store);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/store-documents/${store.local_id}`);
      const docs = await res.json();
      if(Array.isArray(docs)) setStoreDocs(docs);
      else setStoreDocs([]);
    } catch (e) { console.error(e); setStoreDocs([]); }
    setOpenReview(true);
  };

  const handleStoreDecision = async (approved) => {
    if (approved) {
      if (!window.confirm("¿Aprobar tienda?")) return;
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/admin/approve-store/${selectedStore.local_id}`, { method: 'PUT' });
        setOpenReview(false);
        fetchPendingStores();
        alert("Tienda activada");
      } catch (e) { alert("Error"); }
    } else {
      // Si es rechazo, abrimos el diálogo de motivo
      setRejectDialogOpen(true);
    }
  };

  const confirmReject = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/admin/reject-store/${selectedStore.local_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      setRejectDialogOpen(false);
      setOpenReview(false);
      setRejectReason('');
      fetchPendingStores();
      alert("Tienda rechazada y notificada.");
    } catch (e) { alert("Error al rechazar"); }
  };

  const handlePromoDecision = async (promoId, approved) => {
    const endpoint = approved ? 'approve-promo' : 'reject-promo';
    if (!window.confirm(approved ? "¿Publicar banner?" : "¿Rechazar banner?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/admin/${endpoint}/${promoId}`, { method: 'PUT' });
      fetchPendingPromos();
    } catch (e) { alert("Error al procesar"); }
  };

  const handleSuggestionStatus = async (id, status) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/admin/suggestions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchSuggestions();
    } catch (e) { alert("Error al actualizar"); }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
      
      {/* HEADER EJECUTIVO */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VerifiedUserIcon sx={{ fontSize: 40, color: '#1a1a1a' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">Torre de Control</Typography>
            <Typography variant="body2" color="text.secondary">Administración Global</Typography>
          </Box>
        </Box>
        <Paper sx={{ p: 2, bgcolor: '#1b5e20', color: 'white', display: 'flex', gap: 2, borderRadius: 2 }}>
          <Box>
            <Typography variant="caption">Ingresos Totales</Typography>
            <Typography variant="h5" fontWeight="bold">${parseFloat(finance.totalRevenue).toFixed(2)}</Typography>
          </Box>
          <MonetizationOnIcon fontSize="large" sx={{ opacity: 0.8 }} />
        </Paper>
      </Box>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary" variant="fullWidth">
          <Tab icon={<StorefrontIcon />} label={`Validación (${pendingStores.length})`} />
          <Tab icon={<CampaignIcon />} label={`Ads (${pendingPromos.length})`} />
          <Tab icon={<LightbulbIcon />} label={`Feedback (${suggestions.filter(s => s.status === 'pending').length})`} />
          <Tab icon={<MonetizationOnIcon />} label="Finanzas" />
          <Tab icon={<MapIcon />} label="Cobertura" />
        </Tabs>
      </Paper>

      {/* === TAB 0: TIENDAS PENDIENTES === */}
      {tabValue === 0 && (
        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Negocio</TableCell>
                  <TableCell>Dueño</TableCell>
                  <TableCell>Fecha Solicitud</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingStores.map((store) => (
                  <TableRow key={store.local_id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{store.name}</Typography>
                      <Typography variant="caption">{store.address}</Typography>
                    </TableCell>
                    <TableCell>
                      {store.owner_name} <br/>
                      <Typography variant="caption" color="text.secondary">{store.owner_email}</Typography>
                    </TableCell>
                    <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenReview(store)}>
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingStores.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>Todo al día. No hay solicitudes.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* === TAB 1: ADS === */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {pendingPromos.map((promo) => (
            <Grid item xs={12} md={6} lg={4} key={promo.promo_id}>
              <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <img src={promo.image_url} alt="Banner" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                <Box p={2}>
                  <Typography variant="caption">{promo.local_name}</Typography>
                  <Typography variant="h6" fontWeight="bold">{promo.title}</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{promo.description}</Typography>
                  <Box display="flex" gap={1}>
                    <Button fullWidth variant="contained" color="success" onClick={() => handlePromoDecision(promo.promo_id, true)}>Aprobar</Button>
                    <Button fullWidth variant="outlined" color="error" onClick={() => handlePromoDecision(promo.promo_id, false)}>Rechazar</Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
          {pendingPromos.length === 0 && <Grid item xs={12}><Typography align="center" sx={{ mt: 4 }}>No hay campañas pendientes.</Typography></Grid>}
        </Grid>
      )}

      {/* === TAB 2: FEEDBACK === */}
      {tabValue === 2 && (
        <Grid container spacing={2}>
          {suggestions.map((sugg) => (
            <Grid item xs={12} key={sugg.suggestion_id}>
              <Paper sx={{ p: 2, borderLeft: `4px solid ${sugg.status === 'pending' ? '#ed6c02' : '#4caf50'}` }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle2" fontWeight="bold">{sugg.store_name || 'Usuario'} ({sugg.user_email})</Typography>
                  <Chip label={sugg.status.toUpperCase()} size="small" color={sugg.status === 'pending' ? 'warning' : 'success'} />
                </Box>
                <Typography variant="body1" sx={{ my: 1 }}>{sugg.content}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(sugg.created_at).toLocaleString()}</Typography>
                
                {sugg.status === 'pending' && (
                  <Box mt={1}>
                    <Button size="small" startIcon={<MarkEmailReadIcon />} onClick={() => handleSuggestionStatus(sugg.suggestion_id, 'read')}>
                      Marcar Leído
                    </Button>
                    <Button size="small" color="success" onClick={() => handleSuggestionStatus(sugg.suggestion_id, 'implemented')}>
                      Marcar Implementado
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
          {suggestions.length === 0 && <Typography align="center" width="100%" sx={{ mt: 4 }}>Buzón vacío.</Typography>}
        </Grid>
      )}

      {/* === TAB 3: FINANZAS === */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Transacciones de Suscripción</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tienda</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {finance.transactions?.map((tx) => (
                  <TableRow key={tx.subscription_id}>
                    <TableCell>#{tx.subscription_id}</TableCell>
                    <TableCell>{tx.local_name}</TableCell>
                    <TableCell><Chip label={tx.plan_type.toUpperCase()} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>{new Date(tx.start_date).toLocaleDateString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>${tx.amount}</TableCell>
                    <TableCell align="center"><Chip label={tx.status} color="success" size="small" /></TableCell>
                  </TableRow>
                ))}
                {(!finance.transactions || finance.transactions.length === 0) && (
                  <TableRow><TableCell colSpan={6} align="center">No hay registros financieros.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* === TAB 4: MAPA DE COBERTURA === */}
      {tabValue === 4 && (
        <Paper sx={{ p: 1, height: '500px', position: 'relative', overflow: 'hidden' }}>
          {!isLoaded ? (
            <Typography p={5} textAlign="center">Cargando Mapa...</Typography>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: 31.301198, lng: -110.938173 }} // Nogales
              zoom={13}
              options={{ disableDefaultUI: false, zoomControl: true }}
            >
              {mapStores.map((store) => (
                <Marker
                  key={store.local_id}
                  position={{ lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) }}
                  onClick={() => setSelectedMarker(store)}
                />
              ))}

              {selectedMarker && (
                <InfoWindow
                  position={{ lat: parseFloat(selectedMarker.latitude), lng: parseFloat(selectedMarker.longitude) }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{selectedMarker.name}</Typography>
                    <Typography variant="caption">{selectedMarker.address}</Typography>
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </Paper>
      )}

      {/* MODAL DE REVISIÓN DE TIENDA */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: 'white' }}>
          Revisión de Expediente
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6">{selectedStore?.name}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📍 {selectedStore?.address} <br/>
            📞 {selectedStore?.phone}
          </Typography>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Documentación Presentada:
          </Typography>
          
          {storeDocs.length === 0 ? (
            <Alert severity="warning">Este usuario no ha subido documentos.</Alert>
          ) : (
            <Grid container spacing={1}>
              {storeDocs.map((doc, i) => (
                <Grid item xs={12} key={doc.document_id || i}>
                  <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* IZQUIERDA: TIPO Y FECHA */}
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon color={i === 0 ? "primary" : "action"} /> {/* El más reciente sale azul */}
                        <Typography variant="body2" fontWeight="bold">
                          {doc.document_type}
                        </Typography>
                        {i === 0 && <Chip label="NUEVO" color="success" size="small" sx={{ height: 20, fontSize: '0.6rem' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                        Subido: {new Date(doc.uploaded_at).toLocaleString()}
                      </Typography>
                    </Box>

                    {/* DERECHA: BOTÓN VER */}
                    <Button size="small" variant="outlined" href={doc.file_url} target="_blank">
                      Ver Archivo
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => handleStoreDecision(false)} color="error" startIcon={<CancelIcon />}>Rechazar</Button>
          <Button onClick={() => handleStoreDecision(true)} variant="contained" color="success" startIcon={<CheckCircleIcon />}>Aprobar Tienda</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL RECHAZO CON MOTIVO */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Motivo del Rechazo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Explica qué debe corregir el dueño (Ej: "INE borrosa").
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Razón"
            fullWidth
            multiline rows={3}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmReject} color="error" variant="contained">Confirmar Rechazo</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}