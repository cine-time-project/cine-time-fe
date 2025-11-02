"use client";
import { getMoviesByStatus } from "@/services/movie-service";
import { useState, useEffect } from "react";
import MovieCard from "@/components/movies/movie-card/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Skeleton } from "primereact/skeleton";
import "swiper/css";
import "swiper/css/navigation";
import "./movie-stripe.scss";
import { useTranslations } from "next-intl";

/**
 * MovieStripe Component
 * ---------------------
 * Fetches and displays a list of movies inside a Swiper slider.
 * Supports infinite scroll: loads next page when reaching the last slide.
 */
export const MovieStripe = ({ query }) => {
  const [movies, setMovies] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [slidesPerView, setSlidesPerView] = useState(5);

  const t = useTranslations("movies");

  // Responsive slides per view
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

      // If backend returns unexpected response, stop further requests
      if (!moviesPage?.content || moviesPage.content.length === 0) {
        setHasMore(false);
        return;
      }

      setMovies((prev) =>
        pageNum === 0
          ? moviesPage.content || []
          : [...prev, ...(moviesPage.content || [])]
      );

      setHasMore(pageNum + 1 < moviesPage.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setError(t("failed"));
      setHasMore(false); // Prevent infinite fetch loop on error
    } finally {
      setInitialLoading(false);
      setFetchingMore(false);
    }
  };

  // 🔹 Reset state when query changes
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

  // 🔹 Render skeleton slides
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

  return (
    <>
      {/* Empty State */}
      {!initialLoading && movies.length === 0 && !error && (
        <p className="text-center text-muted py-4">
           “{query}”.
        </p>
      )}

      {/* Error State with Retry */}
      {error && (
        <div className="text-center text-danger py-4">
          {error}
          <button
            onClick={() => fetchMovies(page + 1, true)}
            className="btn btn-sm btn-outline-light ms-2"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {/* Main Swiper */}
      <Swiper
        style={{overflowX: "hidden", paddingTop: "20px", paddingBottom: "20px"}}
        navigation
        modules={[Navigation]}
        spaceBetween={10}
        slidesPerGroup={1}
        slidesOffsetBefore={50}
        slidesOffsetAfter={50}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10, slidesPerGroup: 1 },
          640: { slidesPerView: 2, spaceBetween: 15, slidesPerGroup: 2 },
          768: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 3 },
          1024: { slidesPerView: 4, spaceBetween: 25, slidesPerGroup: 4 },
          1300: { slidesPerView: 5, spaceBetween: 25, slidesPerGroup: 5 },
          1600: { slidesPerView: 6, spaceBetween: 25, slidesPerGroup: 5 },
        }}
        onReachEnd={handleReachEnd}
        allowTouchMove={false}
        simulateTouch={false}
      >
        {initialLoading
          ? renderSkeletonSlides()
          : movies.map((movie) => (
              <SwiperSlide key={movie.id} style={{ height: "100%" }}>
                <MovieCard movie={movie} />
              </SwiperSlide>
            ))}

        {fetchingMore && renderSkeletonSlides()}
      </Swiper>
    </>
  );
};
