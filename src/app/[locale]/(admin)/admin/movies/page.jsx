"use client";
import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieList } from "@/components/dashboard/movie/MovieList";
import { getAllMoviesByPage } from "@/service/movie-service";

export default function AdminMoviesPage({ params }) {
  const { locale } = React.use(params);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const fetchMovies = async () => {
    try {
      const result = await getAllMoviesByPage(
        page,
        10,
        "title",
        "asc",
        query,
        status
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
      <PageHeader title="Movies" />
      <Spacer />
      <MovieList
        data={data}
        locale={locale}
        onPageChange={(nextPage) => setPage(nextPage)}
        onSearch={(value) => setQuery(value)}
        onFilter={(value) => setStatus(value)}
        onDeleted={() => fetchMovies()}
      />
      <Spacer />
    </>
  );
}
