// app/[locale]/(admin)/admin/movies/[id]/page.jsx
import React from "react";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieEditForm } from "@/components/dashboard/movie/MovieEditForm";
import { getMovieById } from "@/service/movie-service.server";

export default function AdminEditMoviePage({ params }) {
  const { locale, id } = React.use(params);

  const movie = React.use(getMovieById(id));

  return (
    <>
      <PageHeader title="Edit Movie" />
      <Spacer />
      <MovieEditForm movie={movie} locale={locale} />
      <Spacer />
    </>
  );
}
