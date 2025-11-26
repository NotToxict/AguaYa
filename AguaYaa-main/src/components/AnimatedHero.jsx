import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Simple animated hero/banner for the homepage
 * Props:
 *  - title, subtitle, ctaText, onCta
 */
export default function AnimatedHero({ title = "Bienvenido", subtitle = "Encuentra tu tienda favorita", ctaText = "Explorar", onCta }) {
  return (
    <Box sx={{ mb: 2 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Box
          sx={{
            px: 2,
            py: 4,
            borderRadius: 2,
            background: "linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)",
            color: "white",
          }}
        >
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 1, opacity: 0.95 }}>{subtitle}</Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={onCta}>
              {ctaText}
            </Button>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}