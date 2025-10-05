"use client";
import { getMoviesByStatus } from "@/services/movie-service";
import { useState, useEffect } from "react";
import MovieCard from "@/components/movies/movie/movie-card/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Skeleton } from "primereact/skeleton";
import "swiper/css";
import "swiper/css/navigation";
import "./movie-stripe.scss";

/**
 * MovieStripe Component
 * ---------------------
 * Fetches and displays a list of movies inside a Swiper slider.
 * Supports infinite scroll: loads next page when reaching the last slide.
 */
export const MovieStripe = ({ query }) => {
  const [movies, setMovies] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // 👈 first load only
  const [fetchingMore, setFetchingMore] = useState(false); // 👈 pagination loading
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0); // current page index
  const [hasMore, setHasMore] = useState(true); // pagination flag

  // Track slides per view dynamically for skeletons and layout consistency
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

  // 🔹 Fetch movies from backend
  const fetchMovies = async (pageNum = 0, isLoadMore = false) => {
    if (isLoadMore) setFetchingMore(true);
    else setInitialLoading(true);

    setError(null);

    try {
      const moviesPage = await getMoviesByStatus(query, pageNum);

      // Append or replace depending on pagination
      setMovies((prev) =>
        pageNum === 0
          ? moviesPage.content || []
          : [...prev, ...(moviesPage.content || [])]
      );

      setHasMore(pageNum + 1 < moviesPage.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setError("Failed to load movies.");
    } finally {
      setInitialLoading(false);
      setFetchingMore(false);
    }
  };

  // 🔹 When query changes, reset everything
  useEffect(() => {
    setMovies([]);
    setPage(0);
    setHasMore(true);
    fetchMovies(0);
  }, [query]);

  // 🔹 Load next page when reaching end
  const handleReachEnd = () => {
    if (hasMore && !fetchingMore && !initialLoading) {
      fetchMovies(page + 1, true);
    }
  };

  // 🔹 Render skeleton slides (shared between initial & incremental loads)
  const renderSkeletonSlides = () =>
    Array.from({ length: slidesPerView }).map((_, index) => (
      <SwiperSlide key={`skeleton-${index}`} style={{ height: "100%" }}>
        <div className="p-2">
          <Skeleton width="100%" height="250px" borderRadius="1rem" />
          <div className="p-2">
            <Skeleton width="80%" className="mb-2" />
            <Skeleton width="60%" />
          </div>
        </div>
      </SwiperSlide>
    ));

  // --- JSX ---
  return (
    <>
      {/* Empty State */}
      {!initialLoading && movies.length === 0 && !error && (
        <p className="text-center text-muted py-4">
          No movies found for “{query}”.
        </p>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-danger py-4">
          {error}
          <button
            onClick={() => fetchMovies(0)}
            className="btn btn-sm btn-outline-light ms-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Swiper */}
      <Swiper
        navigation
        modules={[Navigation]}
        spaceBetween={10}
        slidesPerGroup={1}
        slidesOffsetBefore={50} // sol boşluk
        slidesOffsetAfter={50} // sağ boşluk
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10, slidesPerGroup: 1 },
          640: { slidesPerView: 2, spaceBetween: 15, slidesPerGroup: 2 },
          768: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 3 },
          1024: { slidesPerView: 4, spaceBetween: 25, slidesPerGroup: 4 },
          1280: { slidesPerView: 5, spaceBetween: 30, slidesPerGroup: 5 },
        }}
        onReachEnd={handleReachEnd}
      >
        {/* Show skeletons during initial load */}
        {initialLoading
          ? renderSkeletonSlides()
          : movies.map((movie) => (
              <SwiperSlide key={movie.id} style={{ height: "100%" }}>
                <MovieCard movie={movie} />
              </SwiperSlide>
            ))}

        {/* Skeletons for fetching more pages */}
        {fetchingMore && renderSkeletonSlides()}
      </Swiper>
    </>
  );
};
