import React from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Chip 
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Datos de entregas simuladas (vienen de la API, filtrados por repartidor)
const mockDeliveries = [
  { id: 201, customer: 'Ana García', address: 'Calle 10 #502, Col. Centro', status: 'En Ruta', time: '10:00 - 12:00', total: 15000 },
  { id: 202, customer: 'Pedro López', address: 'Av. Norte 145, Fracc. Las Lomas', status: 'Pendiente', time: '12:00 - 14:00', total: 22000 },
  { id: 203, customer: 'María Torres', address: 'Blvd. Principal 20, Residencial', status: 'Entregado', time: '08:00 - 10:00', total: 9500 },
];

// Componente para una Tarea de Entrega
const DeliveryTask = ({ delivery }) => {
  const isPending = delivery.status === 'Pendiente' || delivery.status === 'En Ruta';
  
  return (
    <ListItem divider>
      <ListItemText
        primary={`#${delivery.id} - ${delivery.customer}`}
        secondary={
          <>
            <Typography component="span" variant="body2" color="text.primary">
              {delivery.address}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} /> 
                <Typography variant="caption">{delivery.time}</Typography>
            </Box>
          </>
        }
      />
      <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        <Chip 
          label={delivery.status} 
          color={delivery.status === 'Entregado' ? 'success' : 'warning'} 
          size="small" 
        />
        {isPending && (
            <Button 
                size="small" 
                variant="contained" 
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => console.log(`Marcar entrega #${delivery.id}`)}
            >
                Marcar Entregado
            </Button>
        )}
      </Box>
    </ListItem>
  );
};


export default function DeliveryDashboardPage() {
  const pendingDeliveries = mockDeliveries.filter(d => d.status === 'Pendiente' || d.status === 'En Ruta');
  
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Mi Ruta de Hoy
      </Typography>

      <Grid container spacing={4}>
        {/* Métrica Principal: Entregas Pendientes */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ p: 3, bgcolor: '#e0f7fa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DirectionsBikeIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h5">Entregas Pendientes</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {pendingDeliveries.length}
                    </Typography>
                </Box>
            </Box>
          </Card>
        </Grid>
        
        {/* Mapa de Ruta Simulada (Placeholder) */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Vista de Ruta
              </Typography>
              <Box 
                sx={{ 
                  height: 300, 
                  bgcolor: '#ccc', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 1,
                  color: 'grey.700'
                }}
              >
                <MapIcon sx={{ fontSize: 60, mr: 1 }} />
                Mapa de Google Maps Simulada (Integración futura con API)
              </Box>
              <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                Abrir en Google Maps
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Tareas */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Lista de Tareas ({pendingDeliveries.length} por completar)</Typography>
          <List component={Card} sx={{ p: 0 }}>
            {mockDeliveries.map(delivery => (
              <DeliveryTask key={delivery.id} delivery={delivery} />
            ))}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
}