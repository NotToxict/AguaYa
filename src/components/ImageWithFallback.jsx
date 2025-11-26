import React, { useState } from "react";

export default function ImageWithFallback({
  src,
  alt = "",
  fallback = "/images/placeholder-product.png",
  style,
  ...rest
}) {
  const [error, setError] = useState(false);
  const finalSrc = !src || error ? fallback : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", ...style }}
      {...rest}
    />
  );
}