"use client";
import React from "react";
import CinemasGrid from "./CinemasGrid";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

const CinemasPage = () => {
  const locale = useLocale();
  const searchParams = useSearchParams();

  // 1️⃣ Get the 'city' query param from URL
  const cityFilter = searchParams.get("city") || "";

  // Helper to create localized URLs
  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  return (
    <div>
      <CinemasGrid cityFilter={cityFilter} L={L} />
    </div>
  );
};

export default CinemasPage;
