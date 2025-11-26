import React, { useState, useEffect, useRef } from 'react'; // Añadir useState, useEffect, useRef
import { Badge, Fab } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // <-- Importar motion

export default function FloatingCartFab() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [animateCart, setAnimateCart] = useState(false);
  const prevCountRef = useRef(count); // Guardar el contador previo

  // Efecto para detectar aumento en el contador del carrito
  useEffect(() => {
    console.log(`Cart count changed (FAB): prev=${prevCountRef.current}, current=${count}`); // DEBUG
    if (count > prevCountRef.current) {
      console.log("Animating FAB cart icon!"); // DEBUG
      setAnimateCart(true);
      const timer = setTimeout(() => {
        console.log("Resetting FAB cart animation state"); // DEBUG
        setAnimateCart(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  return (
    // Envolver Fab con motion.div y aplicar animación
    <motion.div
      animate={{ scale: animateCart ? [1, 1.2, 1] : 1 }} // Un "pop" sutil
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        position: 'fixed', // Mover estilos de posicionamiento al motion.div
        right: 16,
        bottom: 80, // Simplificado para que funcione con 'style', ajusta si es necesario
        // zIndex: (theme) => theme.zIndex.fab, // Esto requiere pasar 'theme' o un valor fijo
        zIndex: 1050, // Valor típico para FABs (ajusta según tu theme)
        // display: { xs: 'flex', md: 'none' }, // Esto es sintaxis SX, no funciona en 'style'
      }}
      // Mostrar/ocultar con CSS o un wrapper si es necesario, o animar 'display'
      // Opcionalmente, puedes dejar los sx en Fab y animar solo scale como alternativa
      // sx={{ display: { xs: 'flex', md: 'none' } }} // Podrías poner esto aquí si animas solo scale
    >
      <Fab
        color="primary"
        onClick={() => navigate('/cart')}
        aria-label="Carrito"
        // Asegúrate que los sx aquí no entren en conflicto con 'style' en motion.div
        sx={{
           display: { xs: 'flex', md: 'none' }, // Mantener esto aquí parece más seguro
           // Quitar position, right, bottom, zIndex si están en motion.div
        }}
      >
        <Badge badgeContent={count} color="secondary">
          <ShoppingCartOutlinedIcon />
        </Badge>
      </Fab>
    </motion.div>
  );
}