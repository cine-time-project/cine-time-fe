"use client";
import React from "react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieList } from "@/components/dashboard/movie/MovieList";
import { getAllMoviesByPage } from "@/service/movie-service";

export default function AdminMoviesPage({ params }) {
  const { locale } = React.use(params);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getAllMoviesByPage(page).then(setData);
  }, [page]);

  return (
    <>
      <PageHeader title="Movies" />
      <Spacer />
      <MovieList
        data={data}
        locale={locale}
        onPageChange={(nextPage) => setPage(nextPage)}
      />
      <Spacer />
    </>
  );
}
