"use client";
import { searchMovies } from "@/services/movie-service";
import { useState, useEffect } from "react";
import MovieCard from "@/components/movies/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// TODO: While loading, a skeleton should be displayed.
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
        navigation={true} // Enable next/prev navigation buttons
        modules={[Navigation]} // Import navigation module
        spaceBetween={10} // Space between slides (in px)
        slidesPerView={5} // Show 5 slides at a time
        slidesPerGroup={5} // Every time move 4 slides.
        loop={true}
        onSlideChange={() => console.log("Slide changed")}
        onSwiper={(swiper) => console.log("Swiper instance:", swiper)}
      >
        {movies.length > 0 ? (
          movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              {/* Each movie is displayed using a MovieCard */}
              <MovieCard movie={movie} />
            </SwiperSlide>
          ))
        ) : (
          // Shown if no movies match the query
          <p className="text-muted">No movies found.</p>
        )}
      </Swiper>
    </>
  );
};
