"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { listCinemas, getCoordsByCity } from "@/services/cinema-service";
import CinemasGrid from "@/components/cinemas/CinemasGrid";
import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";
import NearbyCinemasMapWrapper from "@/components/cinemas/NearbyCinemasMapWrapper";
import { Pagination, Spinner } from "react-bootstrap";
import { CinemaSearchBar } from "@/components/cinemas/search-bar/CinemaSearchBar";

export default function CinemasPage() {
  const t = useTranslations("cinemas");
  const searchParams = useSearchParams();

  // 1️⃣ Get the 'city' query param from URL
  const cityFilter = searchParams.get("city") || "";

  // 2️⃣ Local state
  const [searchCity, setSearchCity] = useState(cityFilter);
  const [coords, setCoords] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [cinemasData, setCinemasData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 3️⃣ Get user geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserCoords([coords.latitude, coords.longitude]),
      () => setUserCoords(null)
    );
  }, []);

  // 4️⃣ On initial load, if URL has 'city', get coordinates automatically
  useEffect(() => {
    const initCity = async () => {
      if (cityFilter) {
        const initialCoords = await getCoordsByCity(cityFilter);
        if (initialCoords) setCoords(initialCoords);
      }
    };
    initCity();
  }, [cityFilter]);

  // 5️⃣ Fetch backend cinemas whenever searchCity or coords change
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true);
      try {
        const data = await listCinemas({
          cityId: null,
          cityName: searchCity || null,
          page: currentPage,
          size: 10,
        });
        setCinemasData(data);
      } catch (err) {
        console.error(err);
        setCinemasData({ content: [], totalPages: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, [currentPage, coords, searchCity]);

  // 6️⃣ Pagination handler
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // 7️⃣ Skeleton loader
  const SkeletonRow = () => (
    <div className="p-3 border rounded bg-light mb-3 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    </div>
  );

  return (
    <div className="container py-4">
      <SectionTitle>{t("listTitle")}</SectionTitle>

      {/* Cinema search input */}
      <CinemaSearchBar
        searchCity={searchCity}
        setSearchCity={setSearchCity}
        setCoords={setCoords}
        userCoords={userCoords}
      />

      {/* Backend cinemas grid / loading / empty state */}
      {loading ? (
        <SkeletonRow />
      ) : cinemasData.content.length === 0 ? (
        <div
          className="py-5 border rounded text-center"
          style={{ backgroundColor: "rgba(171, 23, 23, 0.27)", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
        >
          <h3 className="empty-title">{t("noCinemas")}</h3>
        </div>
      ) : (
        <>
          <CinemasGrid cityFilter={searchCity} L={(rest) => `/${rest}`} cinemas={cinemasData.content} />
          {cinemasData.totalPages > 1 && (
            <Pagination className="mt-3 justify-content-center">
              {Array.from({ length: cinemasData.totalPages }).map((_, idx) => (
                <Pagination.Item key={idx} active={idx === currentPage} onClick={() => handlePageChange(idx)}>
                  {idx + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}

      <Spacer />

      {/* Nearby cinemas map */}
      <NearbyCinemasMapWrapper coords={coords} userCoords={userCoords} />
    </div>
  );
}
