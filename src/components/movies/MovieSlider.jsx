"use client";
import { searchMovies } from "@/services/movie-service";
import { useState, useEffect } from "react";
import MovieCard from "@/components/movies/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Skeleton } from "primereact/skeleton";
import "swiper/css";
import "swiper/css/navigation";

//       Also, translations should be implemented for UI text.

/**
 * MovieSlider Component
 * ---------------------
 * Fetches and displays a list of movies inside a Swiper slider.
 *
 * Props:
 *   - query (string): The search query used to fetch movies from the API.
 *
 * Features:
 *   - Fetches movies from the backend using `searchMovies`.
 *   - Displays a responsive carousel of MovieCard components.
 *   - Handles loading and error states.
 */
export const MovieSlider = ({ query }) => {
  // State for movie data, loading indicator, and error messages
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * useEffect hook
   * --------------
   * Runs whenever the `query` prop changes.
   * Fetches movies asynchronously and updates the UI accordingly.
   */
  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      try {
        // Fetch paginated movie data from the backend
        const moviesPage = await searchMovies(query);
        setMovies(moviesPage.content || []);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [query]);

  /**
   * Render section
   * --------------
   * - If there's an error, show an error message.
   * - If loading, TODO: display a skeleton loader.
   * - Otherwise, render the Swiper slider with MovieCards.
   */
  return (
    <>
      {error && <p className="text-danger">{error}</p>}

      <Swiper
         navigation={true}
  modules={[Navigation]}
  slidesPerGroup={1} // gruplama küçük ekranlarda 1 slide olabilir
  spaceBetween={10}  // default spacing
  breakpoints={{
    320: { // ≥320px (mobile)
      slidesPerView: 1,
      spaceBetween: 10,
      slidesPerGroup: 1,
    },
    640: { // ≥640px (tablet)
      slidesPerView: 2,
      spaceBetween: 15,
      slidesPerGroup: 2,
    },
    768: { // ≥768px (small desktop)
      slidesPerView: 3,
      spaceBetween: 20,
      slidesPerGroup: 3,
    },
    1024: { // ≥1024px (desktop)
      slidesPerView: 4,
      spaceBetween: 25,
      slidesPerGroup: 4,
    },
    1280: { // ≥1280px (large desktop)
      slidesPerView: 6,
      spaceBetween: 30,
      slidesPerGroup: 5,
    },
  }}
  onSlideChange={() => console.log("Slide changed")}
  onSwiper={(swiper) => console.log("Swiper instance:", swiper)}
      >
        {loading
    ? // 🔹 Show skeleton placeholders while loading
      Array.from({ length: 5 }).map((_, index) => (
        <SwiperSlide key={index}>
          <div style={{ padding: "0.5rem" }}>
            <Skeleton className="w-full h-56" />
            <Skeleton className="w-3/4 mt-2" />
            <Skeleton className="w-1/2 mt-1" />
          </div>
        </SwiperSlide>
      ))
    : movies.length > 0
    ? // 🔹 Show MovieCards when data is loaded
      movies.map((movie) => (
        <SwiperSlide key={movie.id}>
          <MovieCard movie={movie} />
        </SwiperSlide>
      ))
    : // 🔹 No movies found
      <p className="text-muted">No movies found.</p>}
      </Swiper>
    </>
  );
};
