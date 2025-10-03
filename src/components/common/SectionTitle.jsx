"use client";
import React from "react";

/**
 * Section başlıkları için ortak component
 * Props:
 * - title: Başlık metni
 * - subtitle: Alt başlık (opsiyonel)
 */
export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="text-center my-5">
      <h2 className="fw-bold">{title}</h2>
      {subtitle && <p className="text-muted">{subtitle}</p>}
      <hr className="w-25 mx-auto text-primary" />
    </div>
  );
}
