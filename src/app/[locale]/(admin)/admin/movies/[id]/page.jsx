// app/[locale]/(admin)/admin/movies/[id]/page.jsx
import React from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieEditForm } from "@/components/dashboard/movie/MovieEditForm";
import { getMovieById } from "@/service/movie-service.server";

export default async function AdminEditMoviePage({ params }) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "movie" });

  let movie = null;
  try {
    movie = await getMovieById(id);
  } catch (error) {
    console.error("Failed to fetch movie:", error);
    // You could also redirect to 404 or show an error page
  }

  if (!movie) {
    return (
      <>
        <PageHeader title={t("updateTitle")} />
        <Spacer />
        <div className="container">
          <div className="alert alert-danger">
            {t("notFound", { default: "Movie not found" })}
          </div>
        </div>
        <Spacer />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t("updateTitle")} />
      <Spacer />
      <MovieEditForm movie={movie} locale={locale} />
      <Spacer />
    </>
  );
}
