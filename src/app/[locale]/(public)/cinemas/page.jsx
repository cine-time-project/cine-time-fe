"use client";
import React, { useState, useEffect } from "react";
import CinemasGrid from "./CinemasGrid";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { CinemaSearchBar } from "./CinemaSearchBar";

const CinemasPage = () => {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [cityFilter, setCityFilter] = useState("");

  // Eğer URL parametresi değişirse state’i güncelle
  useEffect(() => {
    const city = searchParams.get("city");
    if (city) {
      setCityFilter(city);
    }
  }, [searchParams]);

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  return (
    <div className="d-flex flex-column justify-content-center">
      <CinemaSearchBar cityFilter={cityFilter} setCityFilter={setCityFilter} />
      <CinemasGrid cityFilter={cityFilter} L={L} />
    </div>
  );
};

export default CinemasPage;
