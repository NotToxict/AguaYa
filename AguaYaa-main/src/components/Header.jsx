import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Badge,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Link as RouterLink, useLocation } from "react-router-dom";
// Si tienes un contexto de carrito:
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const location = useLocation();
  const { items } = useCart?.() ?? { items: [] };
  const cartCount = Array.isArray(items) ? items.reduce((n, it) => n + (it.qty ?? 1), 0) : 0;

  const isActive = (to) => location.pathname === to;

  return (
    <AppBar color="default" position="sticky" elevation={1} sx={{ bgcolor: "white" }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: "none",
            color: "primary.main",
            fontWeight: 800,
            letterSpacing: 0.3,
            mr: 2,
          }}
        >
          AguaYa
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            color={isActive("/") ? "primary" : "inherit"}
            variant={isActive("/") ? "outlined" : "text"}
            size="small"
          >
            Inicio
          </Button>
          <Button component={RouterLink} to="/stores" color="inherit" size="small">
            Tiendas
          </Button>
          <Button component={RouterLink} to="/catalog" color="inherit" size="small">
            Catálogo
          </Button>
          <Button component={RouterLink} to="/orders" color="inherit" size="small">
            Mis pedidos
          </Button>
          <Button component={RouterLink} to="/contact" color="inherit" size="small">
            Contacto
          </Button>
        </Box>

        <Box sx={{ flex: 1 }} />

        <IconButton
          component={RouterLink}
          to="/checkout"
          color="primary"
          aria-label="Carrito"
          size="small"
        >
          <Badge color="primary" badgeContent={cartCount} max={99}>
            <ShoppingCartOutlinedIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}