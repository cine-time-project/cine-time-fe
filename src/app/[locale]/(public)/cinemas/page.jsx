"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";

import CinemasGrid from "@/components/cinemas/CinemasGrid";
import { CinemaSearchBar } from "@/components/cinemas/CinemaSearchBar";

// ✅ Leaflet can only run client-side → disable SSR
const CinemaMap = dynamic(() => import("@/components/cinemas/CinemaMap"), {
  ssr: false,
  loading: () => <p className="text-center my-3">Loading map...</p>,
});

export default function CinemasPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [cityFilter, setCityFilter] = useState("");
  const [cinemas, setCinemas] = useState([]);

  // If "city" param changes, update filter
  useEffect(() => {
    const city = searchParams.get("city");

    setCityFilter(city || "");
  }, [searchParams]);

  // Helper for locale-aware URLs
  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  // Simulated backend call — replace with your API fetch logic
  useEffect(() => {
    const fetchCinemas = async () => {
      // TODO: replace this mock with your backend endpoint
      const response = await fetch(`/api/cinemas?city=${cityFilter}`);
      const data = await response.json();
      setCinemas(data);
    };
    fetchCinemas();
  }, [cityFilter]);

  return (
    <div className="flex flex-col justify-center space-y-6">
      {/* 🔍 City search */}
      <CinemaSearchBar cityFilter={cityFilter} setCityFilter={setCityFilter} />

      {/* 🎬 Cinemas list */}
      <CinemasGrid cityFilter={cityFilter} L={L} cinemas={cinemas} />

      {/* 🗺️ Map showing cinema locations */}
      <CinemaMap cinemas={cinemas} />
    </div>
  );
}
