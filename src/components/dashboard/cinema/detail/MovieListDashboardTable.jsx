"use client";

import { useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Alert } from "react-bootstrap";

import "primereact/resources/themes/lara-light-blue/theme.css"; // 🌞 Light tema
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./MovieListDashboardTable.scss";
import { useTranslations } from "next-intl";


export default function MovieListDashboardTable({ movies, cinema, tCinemas }) {
  const t = useTranslations();
  const FILTERS = { ALL: "all", WITH: "with", WITHOUT: "without" };
  const ROW_OPTIONS = [5, 10, 15, 20];

  const [filter, setFilter] = useState(FILTERS.ALL);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (!movies?.length) {
    return <Alert variant="warning">{t("cinema.noMovieForCinema")}</Alert>;
  }

  const movieIdsWithShowtime = useMemo(() => {
    if (!cinema?.halls?.length) return [];
    return [
      ...new Set(
        cinema.halls.flatMap((h) => h.showtimes?.map((s) => s.movieId) || [])
      ),
    ];
  }, [cinema]);

  const filteredMovies = useMemo(() => {
    switch (filter) {
      case FILTERS.WITH:
        return movies.filter((m) => movieIdsWithShowtime.includes(m.id));
      case FILTERS.WITHOUT:
        return movies.filter((m) => !movieIdsWithShowtime.includes(m.id));
      default:
        return movies;
    }
  }, [filter, movies, movieIdsWithShowtime]);

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

  const showtimeBodyTemplate = (movie) => {
    const hasShowtime = movieIdsWithShowtime.includes(movie.id);
    return hasShowtime ? (
      <Tag value={t("common.yes")} severity="success" icon="pi pi-check" size="large" />
    ) : (
      <Tag value={t("common.no")} severity="danger" icon="pi pi-times" size="large" />
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
  console.log("Edit clicked:", movieId);
  // burada dilediğin işlemi yapabilirsin (örneğin sayfa yönlendirmesi)
};


  return (
    <div className="mt-4">
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <h3 className="fw-bold text-light mb-0">{tCinemas("currentMovies")}</h3>

        <Dropdown
          value={filter}
          onChange={(e) => setFilter(e.value)}
          options={[
            { label: t("movies.all"), value: FILTERS.ALL },
            { label: t("cinemas.withShowtime"), value: FILTERS.WITH },
            { label: t("cinemas.withoutShowtime"), value: FILTERS.WITHOUT },
          ]}
          placeholder={t("search.filters")}
          className="w-32"
        />
      </div>

      {filteredMovies.length === 0 ? (
        <Alert variant="info">{t("movies.noMovies")}</Alert>
      ) : (
        <DataTable
          value={filteredMovies}
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
          <Column field="title" header={t("cinemas.name")} sortable />
          <Column
            field="duration"
            header={t("movies.duration")}
            body={(movie) => `${movie.duration} ${t("common.minutes")}`}
            sortable
          />
          <Column
            header={t("tickets.showtime")}
            body={showtimeBodyTemplate}
            style={{ width: "140px" }}
          />
          <Column
            body={editBodyTemplate}
            style={{ width: "100px" }}
          />
        </DataTable>
      )}
    </div>
  );
}
