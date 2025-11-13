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
import "primereact/resources/primereact.min.css";
import "./MovieListDashboardTable.scss";

export default function MovieListDashboardTable({ movies, cinema, tCinemas }) {
  const FILTERS = { ALL: "all", WITH: "with", WITHOUT: "without" };
  const ROW_OPTIONS = [5, 10, 15, 20];

  const [filter, setFilter] = useState(FILTERS.ALL);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (!movies?.length) {
    return <Alert variant="warning">{tCinemas("noMovieForCinema")}</Alert>;
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
  const imageUrl = poster?.url || movie.posterUrl || "/images/cinetime-logo.png";
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
      <Tag value={tCinemas("withShowtime")} severity="success" />
    ) : (
      <Tag value={tCinemas("withoutShowtime")} severity="danger" />
    );
  };

  const editBodyTemplate = (movie) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-rounded p-button-warning"
      onClick={() => {}}
    />
  );

  const indexBodyTemplate = (rowData, options) => options.rowIndex + 1;

  // Rows per page dropdown component for paginatorRight
  const paginatorRightTemplate = (
    <Dropdown
      value={rowsPerPage}
      onChange={(e) => setRowsPerPage(e.value)}
      options={ROW_OPTIONS.map((r) => ({ label: `${r} ${tCinemas("perPage")}`, value: r }))}
      className="w-24 dark-dropdown"
    />
  );

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <h3 className="fw-bold text-light mb-0">{tCinemas("currentMovies")}</h3>

        <Dropdown
          value={filter}
          onChange={(e) => setFilter(e.value)}
          options={[
            { label: tCinemas("all"), value: FILTERS.ALL },
            { label: tCinemas("withShowtime"), value: FILTERS.WITH },
            { label: tCinemas("withoutShowtime"), value: FILTERS.WITHOUT },
          ]}
          placeholder={tCinemas("selectFilter")}
          className="w-32 dark-dropdown"
        />
      </div>

      {filteredMovies.length === 0 ? (
        <Alert variant="info">{tCinemas("noMoviesMatchingFilter")}</Alert>
      ) : (
        <DataTable
          value={filteredMovies}
          paginator
          rows={rowsPerPage} // dynamic rows per page
          responsiveLayout="scroll"
          rowHover
          className="p-datatable-sm p-datatable-striped dark-table"
          paginatorRight={paginatorRightTemplate} // dropdown on pagination right
        >
          <Column header="#" body={indexBodyTemplate} style={{ width: "50px" }} />
          <Column header={tCinemas("poster")} body={thumbnailBodyTemplate} style={{ width: "100px" }} />
          <Column field="title" header={tCinemas("title")} sortable />
          <Column
            field="duration"
            header={tCinemas("duration")}
            body={(movie) => `${movie.duration} ${tCinemas("minutes")}`}
            sortable
          />
          <Column header={tCinemas("showtime")} body={showtimeBodyTemplate} style={{ width: "140px" }} />
          <Column header={tCinemas("actions")} body={editBodyTemplate} style={{ width: "100px" }} />
        </DataTable>
      )}
    </div>
  );
}
