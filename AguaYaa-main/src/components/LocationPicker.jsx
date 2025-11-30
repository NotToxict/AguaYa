import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  marginTop: '10px'
};

// Coordenadas por defecto (Nogales, Sonora)
const centerDefault = {
  lat: 31.301198,
  lng: -110.938173
};

export default function LocationPicker({ onLocationSelect, initialPosition }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    // Asegúrate de tener esta variable en tu .env del Frontend
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY 
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(initialPosition || centerDefault);
  const [error, setError] = useState('');

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Efecto para actualizar si el padre manda nuevas coordenadas (ej: al seleccionar una dirección guardada)
  React.useEffect(() => {
    if (initialPosition && initialPosition.lat && initialPosition.lng) {
      setMarkerPosition(initialPosition);
      map?.panTo(initialPosition);
    }
  }, [initialPosition, map]);

  // Al hacer clic en el mapa, movemos el marcador
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };
    setMarkerPosition(newPos);
    onLocationSelect(newPos); // Enviamos coordenadas al padre
  };

  // Obtener ubicación actual del usuario (GPS)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setMarkerPosition(pos);
        map?.panTo(pos);
        onLocationSelect(pos);
        setError('');
      },
      () => {
        setError('No pudimos obtener tu ubicación. Revisa los permisos.');
      }
    );
  };

  if (loadError) return <Alert severity="error">Error cargando Google Maps. Revisa tu API Key.</Alert>;
  if (!isLoaded) return <Box p={5} textAlign="center"><CircularProgress /> Cargando Mapa...</Box>;

  return (
    <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, overflow: 'hidden' }}>
      {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: true, // Mapa limpio sin botones extra
          zoomControl: true,
        }}
      >
        {/* El marcador muestra dónde caerá el pedido */}
        <Marker position={markerPosition} animation={window.google.maps.Animation.DROP} />
      </GoogleMap>

      {/* Botón flotante para "Mi Ubicación" */}
      <Button
        variant="contained"
        color="secondary"
        size="small"
        startIcon={<MyLocationIcon />}
        onClick={handleLocateMe}
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          bgcolor: 'white', 
          color: 'primary.main', 
          '&:hover': { bgcolor: '#f5f5f5' } 
        }}
      >
        Mi Ubicación
      </Button>

      <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderTop: '1px solid #eee' }}>
        <Typography variant="caption" align="center" display="block" color="text.secondary">
          Toca el mapa para ajustar el punto de entrega exacto 📍
        </Typography>
      </Box>
    </Box>
  );
}