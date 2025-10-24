// CinemasPage.js
"use client";
import React, { useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import useCinemas from "@/components/cinemas/useCinemas";
import { CinemaSearchBar } from "@/components/cinemas/CinemaSearchBar";
import CinemasGrid from "@/components/cinemas/CinemasGrid";

const CinemaMap = dynamic(() => import("@/components/cinemas/CinemaMap"), { ssr: false });

export default function CinemasPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const cityParam = searchParams.get("city") || "";
  const [cityFilter, setCityFilter] = useState(cityParam);

  // ✅ Fetch işlemi burada
  const { cinemas, loading, error, pagination, setPage, teaPot } = useCinemas(cityFilter);

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  return (
    <div className="d-flex flex-column justify-content-center space-y-4">
      <CinemaSearchBar cityFilter={cityFilter} setCityFilter={setCityFilter} />

      {/* 🎬 Grid: render-only component */}
      <CinemasGrid
        cinemas={cinemas}
        loading={loading}
        error={error}
        pagination={pagination}
        setPage={setPage}
        teaPot={teaPot}
        L={L}
        cityFilter={cityFilter}
      />

      {/* 🗺️ Map: aynı data'yı paylaşıyor */}
      <CinemaMap cinemas={cinemas} />
    </div>
  );
}
