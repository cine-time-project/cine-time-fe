"use client";

import { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Alert, Form } from "react-bootstrap";
import MovieCardInDashboard from "./MovieCardInDashboard";

/**
 * MovieListDashboard
 * --------------------
 * Displays a list of movies in a Swiper slider inside the dashboard.
 * Includes a dropdown filter to show:
 *   - All movies
 *   - Only movies that have showtimes in this cinema
 *   - Only movies without showtimes
 *
 * Props:
 *  - movies: Array<Movie>
 *  - cinema: Cinema object (contains halls + showtimes)
 *  - tCinemas: Translation function for i18n
 */
export default function MovieListDashboard({ movies, cinema, tCinemas }) {
  // Enum-like constant for readability and safety
  const FILTERS = {
    ALL: "all",
    WITH: "with",
    WITHOUT: "without",
  };

  // Selected filter state
  const [filter, setFilter] = useState(FILTERS.ALL);

  // Early return if no movies exist
  if (!movies?.length)
    return <Alert variant="warning">{tCinemas("noMovieForCinema")}</Alert>;

  /**
   * Extract all movie IDs that have at least one showtime in this cinema
   * Using useMemo to avoid recalculating unnecessarily
   */
  const movieIdsWithShowtime = useMemo(() => {
    if (!cinema?.halls?.length) return [];
    const ids = cinema.halls.flatMap((h) =>
      h.showtimes?.map((s) => s.movieId)
    );
    return [...new Set(ids)]; // remove duplicates
  }, [cinema]);

  /**
   * Filter movies based on current dropdown selection
   */
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

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="mt-5">
      {/* Header + Filter Dropdown */}
      <div className="d-flex justify-content-start gap-3 align-items-center mb-3">
        <h3 className="fw-bold text-light mb-0">{tCinemas("currentMovies")}</h3>
        {/* 🎛 Dropdown Filter */}
        <Form.Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: "220px",
            borderRadius: "12px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <option value={FILTERS.ALL}>{tCinemas("all")}</option>
          <option value={FILTERS.WITH}>{tCinemas("withShowtime")}</option>
          <option value={FILTERS.WITHOUT}>{tCinemas("withoutShowtime")}</option>
        </Form.Select>
      </div>

      {/* Conditional rendering: if no movies match the filter */}
      {filteredMovies.length === 0 ? (
        <Alert variant="info" className="mt-3">
          {tCinemas("noMoviesMatchingFilter")}
        </Alert>
      ) : (
        <Swiper
          style={{ overflowX: "hidden", padding: "20px 0" }}
          navigation
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerGroup={1}
          slidesOffsetBefore={40}
          slidesOffsetAfter={40}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 3 },
            1300: { slidesPerView: 4 },
            1600: { slidesPerView: 5 },
          }}
        >
          {filteredMovies.map((movie) => (
            <SwiperSlide key={movie.id} style={{ height: "100%" }}>
              <MovieCardInDashboard movie={movie} hasShowtime={movieIdsWithShowtime.includes(movie.id)} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
