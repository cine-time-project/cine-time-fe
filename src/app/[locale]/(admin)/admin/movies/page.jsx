"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieList } from "@/components/dashboard/movie/MovieList";
import { getAllMoviesByPage } from "@/service/movie-service";

export default function AdminMoviesPage({ params }) {
  const { locale } = React.use(params);
  const t = useTranslations("movie");
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const fetchMovies = async (
    customQuery = query,
    customStatus = status,
    customPage = page
  ) => {
    try {
      const result = await getAllMoviesByPage(
        customPage,
        10,
        "title",
        "asc",
        customQuery,
        customStatus
      );
      setData(result);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, query, status]);

  return (
    <>
      <PageHeader title={t("listTitle")} />
      <Spacer />
      <MovieList
        data={data}
        locale={locale}
        onPageChange={(nextPage) => {
          setPage(nextPage);
        }}
        onSearch={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onFilter={(value) => {
          setStatus(value);
          setPage(0);
        }}
        onDeleted={() => {
          setQuery("");
          setStatus("");
          setPage(0);
          fetchMovies(0, "", "");
        }}
      />

      <Spacer />
    </>
  );
}
