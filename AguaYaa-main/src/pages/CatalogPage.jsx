import React, { useMemo, useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Alert,
  Link as MLink,
  Box,            // Import Box
  CircularProgress, // Import CircularProgress
  Button // Import Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard'; //
import { useStore } from '../context/StoreContext'; //

// Define la URL base de tu API (igual que en StoreContext)
const API_BASE_URL = 'http://localhost:3001/api';

export default function CatalogPage() {
  const [q, setQ] = useState(''); //
  const { store, storeId } = useStore(); // Obtenemos storeId también
  const navigate = useNavigate(); //

  // Estados para cargar productos
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);

  // --- Efecto para cargar productos cuando cambia la tienda seleccionada ---
  useEffect(() => {
    // Si no hay storeId seleccionado, no hacemos nada (o limpiamos productos)
    if (!storeId) {
      setProducts([]);
      // Podrías redirigir a /stores si prefieres que no se pueda estar aquí sin tienda
      // navigate('/stores'); //
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductError(null);
      setProducts([]); // Limpia productos anteriores mientras carga
      try {
        const response = await fetch(`${API_BASE_URL}/stores/${storeId}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // --- Mapeo de campos de la API a los esperados por ProductCard ---
        // API: product_id, name, description, price, size, image_url
        // ProductCard espera: id, name, description, price, size, imageUrl
        const mappedProducts = data.map(p => ({
            id: p.product_id,
            name: p.name,
            description: p.description,
            price: parseFloat(p.price), // Asegurar número
            size: p.size,
            imageUrl: p.image_url // Mapear image_url a imageUrl
            // Añade storeId aquí mismo para que ProductCard lo reciba
            // storeId: storeId // Ya no es necesario si ProductCard no lo usa directamente, pero puede ser útil
        }));
        setProducts(mappedProducts);
      } catch (e) {
        console.error(`Error fetching products for store ${storeId}:`, e);
        setProductError('No se pudieron cargar los productos. Intenta más tarde.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [storeId, navigate]); // Depende de storeId para recargar si cambia la tienda

  // Filtrado de productos basado en el estado local 'products'
  const filtered = useMemo(() => { //
    const term = q.trim().toLowerCase(); //
    if (!term) return products; //
    return products.filter((p) => //
      [p.name, p.size].filter(Boolean).some((t) => t.toLowerCase().includes(term)) //
    ); //
  }, [q, products]); //

  // Si no hay tienda seleccionada O si se está cargando la tienda inicial en StoreContext,
  // podríamos mostrar un estado intermedio o simplemente redirigir (como hace el primer useEffect).
  // Por ahora, si store no está, mostramos null para evitar renderizar sin datos.
  if (!store && !storeId) { // Mejor esperar a que storeId exista
      // Puedes poner un loader aquí si StoreContext está cargando tiendas
      return (
          <Container maxWidth="lg" sx={{ mt: 3, mb: { xs: 10, md: 6 }, textAlign: 'center' }}>
              <Typography color="text.secondary">Selecciona una tienda primero.</Typography>
              <Button component={RouterLink} to="/stores" variant="contained" sx={{mt: 2}}>
                  Ir a Tiendas
              </Button>
          </Container>
      );
  }
   // Si tenemos storeId pero aún no cargó el objeto 'store' del contexto
   if (!store && storeId) {
    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: { xs: 10, md: 6 }, textAlign: 'center' }}>
            <CircularProgress />
            <Typography>Cargando tienda...</Typography>
        </Container>
    )
   }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: { xs: 10, md: 6 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        {store.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Entrega aprox. {store.etaMin} min • Envío ${store.deliveryFee} • <MLink component={RouterLink} to="/stores">Cambiar de tienda</MLink> {/* */}
      </Typography>

      <TextField
        value={q} //
        onChange={(e) => setQ(e.target.value)} //
        placeholder="Buscar agua, garrafones, packs…" //
        fullWidth
        size="small"
        InputProps={{
          startAdornment: ( //
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ), //
        }}
        sx={{ mb: 2 }} //
      />

      {/* --- Indicador de Carga de Productos --- */}
      {loadingProducts && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* --- Mensaje de Error de Productos --- */}
      {productError && !loadingProducts && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {productError}
        </Alert>
      )}

      {/* --- Mensaje si no hay productos o no coinciden con búsqueda --- */}
      {!loadingProducts && !productError && products.length > 0 && filtered.length === 0 && ( //
        <Alert severity="info" sx={{ mb: 2 }}> {/* */}
          No encontramos productos que coincidan con “{q}”. {/* */}
        </Alert> //
      )}
       {!loadingProducts && !productError && products.length === 0 && (
        <Typography color="text.secondary">Esta tienda no tiene productos disponibles por el momento.</Typography>
      )}

      {/* --- Grid de Productos (solo si no hay carga ni error y hay productos filtrados) --- */}
      {!loadingProducts && !productError && filtered.length > 0 && (
        <Grid container spacing={2}> {/* */}
          {filtered.map((p) => { //
            // Pasamos el producto mapeado y añadimos storeId por si ProductCard lo necesita
            const productWithStoreId = { ...p, storeId: store.id };
            return (
              <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}> {/* */}
                <ProductCard product={productWithStoreId} /> {/* */}
              </Grid> //
            ); //
          })}
        </Grid> //
      )}
    </Container>
  );
}