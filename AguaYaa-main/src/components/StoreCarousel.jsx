import React from "react";
import { Card, CardContent, CardMedia, Typography, Box, Button } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

/**
 * ProductCarousel
 * Props:
 *  - products: [{ id, name, image, price, oldPrice?, description? }]
 *  - onQuickView(product)
 *  - onAdd(product)
 */
export default function ProductCarousel({ products = [], onQuickView, onAdd }) {
  return (
    <Box sx={{ width: "100%", py: 1 }}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={16}
        slidesPerView={1.2}
        breakpoints={{
          600: { slidesPerView: 2.2 },
          900: { slidesPerView: 3.2 },
          1200: { slidesPerView: 4.2 },
        }}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: true }}
        style={{ paddingBottom: 12 }}
        aria-label="Carrusel de ofertas"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -3, scale: 1.01 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <Card sx={{ borderRadius: 2, overflow: "hidden", height: 280, display: "flex", flexDirection: "column" }} elevation={3}>
                {p.image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={p.image}
                    alt={p.name}
                    loading="lazy"
                    sx={{ objectFit: "cover" }}
                  />
                )}
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography variant="subtitle2" noWrap title={p.name}>
                    {p.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography variant="subtitle1">${p.price?.toFixed?.(2) ?? p.price}</Typography>
                    {p.oldPrice && (
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                        ${p.oldPrice?.toFixed?.(2) ?? p.oldPrice}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ mt: "auto", display: "flex", gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => onQuickView?.(p)}>
                      Ver
                    </Button>
                    <Button variant="contained" size="small" onClick={() => onAdd?.(p)}>
                      Agregar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}