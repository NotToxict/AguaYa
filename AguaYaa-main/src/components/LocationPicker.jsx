import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '16px',
  marginTop: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const centerDefault = { lat: 31.301198, lng: -110.938173 };

const mapStyles = [
  { "featureType": "all", "elementType": "geometry.fill", "stylers": [{ "weight": "2.00" }] },
  { "featureType": "all", "elementType": "geometry.stroke", "stylers": [{ "color": "#9c9c9c" }] },
  { "featureType": "all", "elementType": "labels.text", "stylers": [{ "visibility": "on" }] },
  { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
  { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }
];

// LIBRARIES: Importante pedir 'places' y 'geocoding' al cargar
const libraries = ['places'];

export default function LocationPicker({ onLocationSelect, initialPosition }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: libraries // <--- IMPORTANTE
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(initialPosition || centerDefault);
  const [error, setError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  useEffect(() => {
    if (initialPosition?.lat) {
      setMarkerPosition(initialPosition);
      map?.panTo(initialPosition);
    }
  }, [initialPosition, map]);

  // --- FUNCIÓN MÁGICA: GEOCODING INVERSO (Pin -> Texto) ---
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        // Devolvemos tanto coordenadas como la dirección en texto
        onLocationSelect({ lat, lng, address }); 
      } else {
        onLocationSelect({ lat, lng, address: '' });
      }
    } catch (e) {
      console.error("Error geocoding:", e);
      onLocationSelect({ lat, lng, address: '' }); // Aún si falla el nombre, mandamos coords
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };
    setMarkerPosition(newPos);
    // Llamamos a la función que busca el nombre de la calle
    getAddressFromCoords(lat, lng); 
    setError('');
  };

  // --- GPS ---
  const handleLocateMe = () => {
    setLoadingLocation(true);
    setError('');

    const updatePosition = (lat, lng) => {
      const newPos = { lat, lng };
      setMarkerPosition(newPos);
      map?.panTo(newPos);
      map?.setZoom(17);
      getAddressFromCoords(lat, lng); // <--- También aquí buscamos el nombre
      setLoadingLocation(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => updatePosition(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn("Fallo GPS, intentando IP...");
          // Fallback IP (opcional, si ya lo tenías implementado puedes dejarlo)
          setLoadingLocation(false);
          setError('No pudimos obtener tu ubicación exacta.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setError('Tu navegador no soporta geolocalización');
      setLoadingLocation(false);
    }
  };

  if (loadError) return <Alert severity="error">Error mapa.</Alert>;
  if (!isLoaded) return <Box p={5} textAlign="center"><CircularProgress /> Cargando...</Box>;

  return (
    <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', boxShadow: 2 }}>
      {error && <Alert severity="warning" sx={{ mb: 0, borderRadius: 0 }}>{error}</Alert>}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{ disableDefaultUI: true, zoomControl: true, styles: mapStyles }}
      >
        <Marker position={markerPosition} animation={window.google.maps.Animation.DROP} />
      </GoogleMap>

      <Button
        variant="contained" color="primary" size="small"
        startIcon={loadingLocation ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
        onClick={handleLocateMe}
        disabled={loadingLocation}
        sx={{ position: 'absolute', bottom: 20, right: 10, bgcolor: 'white', color: 'primary.main', boxShadow: 3, fontWeight: 'bold', '&:hover': { bgcolor: '#f5f5f5' } }}
      >
        {loadingLocation ? '...' : 'Mi Ubicación'}
      </Button>
    </Box>
  );
}