"use client";
import React from "react";

/**
 * Aralarda boşluk bırakmak için Spacer componenti
 * Props:
 * - size: boşluk yüksekliği (default 50px)
 */
export default function Spacer({ size = 50 }) {
  return <div style={{ height: `${size}px` }} />;
}
