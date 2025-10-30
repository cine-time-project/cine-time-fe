"use client";
import React, { useState, useEffect } from "react";
import { CinemaTable } from "./CinemaTable";
import { listCinemas } from "@/services/cinema-service";

export default function AdminCinemasPage({ params }) {
  const { locale } = React.use(params);
  const [cinemas, setCinemas] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed backend
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8; // listCinemas default size

  const fetchCinemas = async (page = 0) => {
    try {
      const data = await listCinemas({ page, size: pageSize });
      const cinemasFromBE = data?.returnBody?.content || [];
      const totalPagesFromBE = data?.returnBody?.totalPages || 1;

      setCinemas(cinemasFromBE);
      setTotalPages(totalPagesFromBE);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch cinemas:", err);
    }
  };

  useEffect(() => {
    fetchCinemas(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    fetchCinemas(newPage);
  };

  return (
    <CinemaTable
      data={cinemas}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
