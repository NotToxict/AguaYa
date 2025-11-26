import React from "react";
import { Dialog, DialogContent, DialogTitle, Box, Typography, Button } from "@mui/material";

export default function ProductQuickView({ open, onClose, product, onAdd }) {
  if (!product) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="product-quickview-title">
      <DialogTitle id="product-quickview-title">{product.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Box sx={{ flex: "0 0 260px", borderRadius: 2, overflow: "hidden", bgcolor: "#f5f5f7" }}>
            {/* Usa <img> simple para compatibilidad y performance */}
            <img
              src={product.image}
              alt={product.name}
              width="100%"
              height="auto"
              loading="lazy"
              style={{ display: "block", objectFit: "cover" }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              ${product.price?.toFixed?.(2) ?? product.price}
            </Typography>
            {product.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {product.description}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onAdd?.(product);
                onClose?.();
              }}
            >
              Agregar al carrito
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}