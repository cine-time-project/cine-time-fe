"use client";

import dynamic from "next/dynamic";
import SectionTitle from "../SectionTitle";

// Harita component’ini sadece client-side render et
const NearbyCinemasLeaflet = dynamic(
  () => import("./NearbyCinemasLeaflet"),
  { ssr: false }
);

export default function NearbyCinemasMapWrapper() {
  return (
    <div className="p-4 space-y-4">
      <SectionTitle>🎬 Daha Fazlasını Bulun</SectionTitle>
      <NearbyCinemasLeaflet />
    </div>
  );
}
