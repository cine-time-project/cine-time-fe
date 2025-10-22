"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import CinemasGrid from "@/components/cinemas/CinemasGrid";
import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";
import NearbyCinemasMapWrapper from "@/components/cinemas/NearbyCinemasMapWrapper";
import { listCinemas } from "@/services/cinema-service";
import { Pagination, Spinner } from "react-bootstrap";

export default function CinemasPage() {
  const t = useTranslations("cinemas");
  const searchParams = useSearchParams();

  // 1️⃣ Get the city query parameter from URL
  const cityFilter = searchParams.get("city") || "";

  // 2️⃣ Local state
  const [searchCity, setSearchCity] = useState(cityFilter); // input value
  const [cinemasData, setCinemasData] = useState({
    content: [],
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 3️⃣ Fetch backend cinemas when cityFilter or currentPage changes
  useEffect(() => {
    if (!searchCity) return; // skip if no city

    const fetchCinemas = async () => {
      setLoading(true);
      try {
        const data = await listCinemas({
          cityId: null,
          page: currentPage,
          size: 10,
        });
        setCinemasData(data); // backend returns { content, totalPages, totalElements }
      } catch (err) {
        console.error(err);
        setCinemasData({ content: [], totalPages: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, [searchCity, currentPage]);

  // 4️⃣ Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 5️⃣ Skeleton row component for loading state
  const SkeletonRow = () => (
    <div className="p-3 border rounded bg-light mb-3 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    </div>
  );

  return (
    <div className="container py-4">
      {/* Page title */}
      <SectionTitle>{t("listTitle")}</SectionTitle>

      {/* Backend cinemas grid / loading / empty state */}
      {loading ? (
        // 1️⃣ Show at least one skeleton row while loading
        <SkeletonRow />
      ) : cinemasData.content.length === 0 ? (
        // 2️⃣ Modern empty state card if no backend cinemas
        <div
        className="py-5 border rounded text-center"
        style={{
          backgroundColor: "rgba(171, 23, 23, 0.27)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
          <h3 className="empty-title">{t("noCinemas")}</h3>
        </div>
      ) : (
        <>
          {/* 3️⃣ Render backend cinemas grid */}
          <CinemasGrid
            cityFilter={searchCity}
            L={(rest) => `/${rest}`}
            cinemas={cinemasData.content}
          />

          {/* 4️⃣ Pagination */}
          {cinemasData.totalPages > 1 && (
            <Pagination className="mt-3 justify-content-center">
              {Array.from({ length: cinemasData.totalPages }).map((_, idx) => (
                <Pagination.Item
                  key={idx}
                  active={idx === currentPage}
                  onClick={() => handlePageChange(idx)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}

      <Spacer />

      {/* Overpass fallback component (NearbyCinemasLeaflet) */}
      <NearbyCinemasMapWrapper city={searchCity}/>
    </div>
  );
}
