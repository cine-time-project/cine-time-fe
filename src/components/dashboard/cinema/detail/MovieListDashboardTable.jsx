"use client";

import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/lara-dark-blue/theme.css";
import { Tag } from "primereact/tag";
import { useMemo, useState } from "react";
import { Alert } from "react-bootstrap";

import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-blue/theme.css"; // 🌞 Light tema
import "primereact/resources/primereact.min.css";
import "./MovieListDashboardTable.scss";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function MovieListDashboardTable({ movies, cinema }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  
  const ROW_OPTIONS = [5, 10, 15, 20];

  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (!movies?.length) {
    return <Alert variant="warning">{t("cinemas.noMovieForCinema")}</Alert>;
  }


  const thumbnailBodyTemplate = (movie) => {
    const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
    const imageUrl =
      poster?.url || movie.posterUrl || "/images/cinetime-logo.png";
    return (
      <img
        src={imageUrl}
        alt={movie.title}
        className="movie-poster"
        style={{
          width: "80px",
          height: "120px",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  };

  const editBodyTemplate = (movie) => (
    <Button
      icon="pi pi-pen-to-square"
      onClick={() => handleMovieEdit(movie.id)}
      text
      severity="warning"
      label={t("cinemas.edit")}
      size="large"
    />
  );

  const indexBodyTemplate = (rowData, options) => options.rowIndex + 1;

  const paginatorRightTemplate = (
    <Dropdown
      value={rowsPerPage}
      onChange={(e) => setRowsPerPage(e.value)}
      options={ROW_OPTIONS.map((r) => ({
        label: `${r} ${t("cinemas.movie")}`,
        value: r,
      }))}
      className="w-24"
    />
  );

  const handleMovieEdit = (movieId) => {
    router.push(`/${locale}/admin/movies/${movieId}`);
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <h3 className="fw-bold text-light mb-0">{t("cinemas.currentMovies")}</h3>
      </div>

      {movies.length === 0 ? (
        <Alert variant="info">{t("movies.noMovies")}</Alert>
      ) : (
        <DataTable
          value={movies}
          paginator
          rows={rowsPerPage}
          responsiveLayout="scroll"
          rowHover
          className="p-datatable-sm p-datatable-striped "
          paginatorRight={paginatorRightTemplate}
        >
          <Column
            header="#"
            body={indexBodyTemplate}
            style={{ width: "50px" }}
          />
          <Column header={t("cinemas.image")} body={thumbnailBodyTemplate} />
          <Column field="title" header={t("cinemas.movie")} sortable />
          <Column
            field="duration"
            header={t("movies.duration")}
            body={(movie) => `${movie.duration} ${t("common.minutes")}`}
            sortable
          />
          <Column body={editBodyTemplate} style={{ width: "100px" }} />
        </DataTable>
      )}
    </div>
  );
}
