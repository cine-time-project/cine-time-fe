"use client";
import { searchMovies } from "@/services/movie-service";
import { useState, useEffect } from "react";
import MovieCard from "@/components/movies/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Skeleton } from "primereact/skeleton";
import "swiper/css";
import "swiper/css/navigation";

/**
 * MovieStripe Component
 * ---------------------
 * Fetches and displays a list of movies inside a Swiper slider.
 * Supports infinite scroll: loads next page when reaching the last slide.
 */
export const MovieStripe = ({ query }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0); // current page
  const [hasMore, setHasMore] = useState(true); // check if more pages exist

  // Determine slidesPerView dynamically for Skeleton
  const [slidesPerView, setSlidesPerView] = useState(5);

  useEffect(() => {
    const updateSlides = () => {
      const width = window.innerWidth;
      if (width >= 1280) setSlidesPerView(6);
      else if (width >= 1024) setSlidesPerView(4);
      else if (width >= 768) setSlidesPerView(3);
      else if (width >= 640) setSlidesPerView(2);
      else setSlidesPerView(1);
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  // Fetch movies from backend
  const fetchMovies = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      // Pass pageNum as query parameter if backend supports pagination
      const moviesPage = await searchMovies(query, pageNum);
      setMovies((prev) => [...prev, ...(moviesPage.content || [])]);
      setHasMore(pageNum + 1 < moviesPage.totalPages); // check if more pages
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setError("Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  // On query change, reset everything
  useEffect(() => {
    setMovies([]);
    setPage(0);
    setHasMore(true);
    fetchMovies(0);
  }, [query]);

  return (
    <>
      {error && <p className="text-danger">{error}</p>}

      <Swiper
  navigation={true}
  modules={[Navigation]}
  loop={false}
  slidesPerGroup={1}
  spaceBetween={10}
  breakpoints={{
    320: { slidesPerView: 1, spaceBetween: 10, slidesPerGroup: 1 },
    640: { slidesPerView: 2, spaceBetween: 15, slidesPerGroup: 2 },
    768: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 3 },
    1024: { slidesPerView: 4, spaceBetween: 25, slidesPerGroup: 4 },
    1280: { slidesPerView: 6, spaceBetween: 30, slidesPerGroup: 5 },
  }}
  onReachEnd={() => {
    if (hasMore && !loading) {
      fetchMovies(page + 1);
    }
  }}
>
  {movies.map((movie) => (
    <SwiperSlide key={movie.id}>
      <MovieCard movie={movie} />
    </SwiperSlide>
  ))}

  {/* Skeleton placeholders at the end while loading next page */}
  {loading && movies.length > 0 &&
    Array.from({ length: slidesPerView }).map((_, index) => (
      <SwiperSlide key={`loading-${index}`}>
        <div style={{ padding: "0.5rem" }}>
          <Skeleton className="w-full h-56" />
          <Skeleton className="w-3/4 mt-2" />
          <Skeleton className="w-1/2 mt-1" />
        </div>
      </SwiperSlide>
    ))
  }
</Swiper>

      {/* 🔹 Optional: Skeleton placeholders at the end while loading next page */}
      {loading && movies.length > 0 && (
        <Swiper>
          {Array.from({ length: slidesPerView }).map((_, index) => (
            <SwiperSlide key={`loading-${index}`}>
              <div style={{ padding: "0.5rem" }}>
                <Skeleton className="w-full h-56" />
                <Skeleton className="w-3/4 mt-2" />
                <Skeleton className="w-1/2 mt-1" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};
