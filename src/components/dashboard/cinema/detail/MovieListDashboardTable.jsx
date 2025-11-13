"use client";

import { useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Alert } from "react-bootstrap";
import "primereact/resources/themes/md-dark-deeppurple/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./MovieListDashboardTable.scss"; // Özel CSS

/**
 * MovieListDashboardTable with dark theme
 */
export default function MovieListDashboardTable({ movies, cinema, tCinemas }) {
  const FILTERS = {
    ALL: "all",
    WITH: "with",
    WITHOUT: "without",
  };

  const [filter, setFilter] = useState(FILTERS.ALL);

  if (!movies?.length) {
    return <Alert variant="warning">{tCinemas("noMovieForCinema")}</Alert>;
  }

  // Movie IDs with showtime
  const movieIdsWithShowtime = useMemo(() => {
    if (!cinema?.halls?.length) return [];
    return [
      ...new Set(
        cinema.halls.flatMap((h) => h.showtimes?.map((s) => s.movieId) || [])
      ),
    ];
  }, [cinema]);

  // Filtered movies
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

  // Thumbnail column
  const thumbnailBodyTemplate = (movie) => {
    const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
    const imageUrl = poster?.url || movie.posterUrl || "/images/cinetime-logo.png";
    return <Avatar image={imageUrl} shape="square" size="large" className="movie-avatar" />;
  };

  // Showtime badge column
  const showtimeBodyTemplate = (movie) => {
    const hasShowtime = movieIdsWithShowtime.includes(movie.id);
    return hasShowtime ? (
      <Tag value={tCinemas("withShowtime")} severity="success" />
    ) : (
      <Tag value={tCinemas("withoutShowtime")} severity="danger" />
    );
  };

  // Edit action column
  const editBodyTemplate = (movie) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-rounded p-button-warning"
      onClick={() => console.log("Edit clicked:", movie.id)}
    />
  );

  // Index column
  const indexBodyTemplate = (rowData, options) => options.rowIndex + 1;

  return (
    <div className="mt-4">
      {/* Header + Filter Dropdown */}
      <div className="d-flex align-items-center gap-3 mb-3">
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
          rows={10}
          responsiveLayout="scroll"
          rowHover
          className="p-datatable-sm p-datatable-striped dark-table"
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
          <Column
            field="rating"
            header={tCinemas("rating")}
            body={(movie) => movie.rating?.toFixed(1) || "-"}
            sortable
          />
          <Column
            header={tCinemas("showtime")}
            body={showtimeBodyTemplate}
            style={{ width: "140px" }}
          />
          <Column
            header={tCinemas("actions")}
            body={editBodyTemplate}
            style={{ width: "100px" }}
          />
        </DataTable>
      )}
    </div>
  );
}
