// src/components/movies/movieDetail/related/MovieStripeDP.jsx
"use client";

import { useState, useEffect } from "react";
import MovieCard from "@/components/movies/movieDetail/related/MovieCardDP";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Skeleton } from "primereact/skeleton";
import "swiper/css";
import "swiper/css/navigation";
import "./movie-stripe-dp.scss";

// DB servisleri
import { getMoviesByStatus, getMoviesPaged } from "@/services/movie-serviceDP";

export const MovieStripe = ({ query }) => {
  const [movies, setMovies] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [slidesPerView, setSlidesPerView] = useState(5);
  const [hovered, setHovered] = useState(null); // <-- sadece burada (component içinde)

  // Responsive slides per view
  useEffect(() => {
    const updateSlides = () => {
      const width = window.innerWidth;
      if (width >= 1600) setSlidesPerView(6);
      else if (width >= 1300) setSlidesPerView(5);
      else if (width >= 1024) setSlidesPerView(4);
      else if (width >= 768) setSlidesPerView(3);
      else if (width >= 640) setSlidesPerView(2);
      else setSlidesPerView(1);
    };
    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  // API'den veri çek
  const fetchMovies = async (pageNum = 0, isLoadMore = false) => {
    if (isLoadMore) setFetchingMore(true);
    else setInitialLoading(true);

    setError(null);
    try {
      const moviesPage = query
        ? await getMoviesByStatus(query, pageNum, 10)
        : await getMoviesPaged(pageNum, 10);

      const content = moviesPage?.content || [];
      if (content.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => (pageNum === 0 ? content : [...prev, ...content]));
        setHasMore(pageNum + 1 < (moviesPage.totalPages ?? 1));
        setPage(pageNum);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load movies.");
      setHasMore(false);
    } finally {
      setInitialLoading(false);
      setFetchingMore(false);
    }
  };

  // query değiştiğinde resetle
  useEffect(() => {
    setMovies([]);
    setPage(0);
    setHasMore(true);
    fetchMovies(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Sonsuz kaydırma
  const handleReachEnd = () => {
    if (hasMore && !fetchingMore && !initialLoading) {
      fetchMovies(page + 1, true);
    }
  };

  // Skeleton
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
      {!initialLoading && movies.length === 0 && !error && (
        <p className="text-center text-muted py-4">
          No movies found{query ? ` for “${query}”` : ""}.
        </p>
      )}

      {error && (
        <div className="text-center text-danger py-4">
          {error}
          <button
            onClick={() => fetchMovies(page + 1, true)}
            className="btn btn-sm btn-outline-light ms-2"
          >
            Retry
          </button>
        </div>
      )}

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerGroup={1}
        onReachEnd={handleReachEnd}
        allowTouchMove={false}
        simulateTouch={false}
        style={{ overflow: "visible" }} // taşma kesilmesin
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10, slidesPerGroup: 1 },
          640: { slidesPerView: 2, spaceBetween: 15, slidesPerGroup: 2 },
          768: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 3 },
          1024: { slidesPerView: 4, spaceBetween: 25, slidesPerGroup: 4 },
          1300: { slidesPerView: 5, spaceBetween: 25, slidesPerGroup: 5 },
          1600: { slidesPerView: 6, spaceBetween: 25, slidesPerGroup: 6 },
        }}
      >
        {initialLoading
          ? renderSkeletonSlides()
          : movies.map((movie, i) => (
              <SwiperSlide
                key={movie.id ?? movie.slug}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  height: "100%",
                  overflow: "visible",
                  position: "relative",
                  zIndex: hovered === i ? 10 : 1, // ← sağdaki slaytın üstünde kalır
                }}
              >
                <MovieCard movie={movie} />
              </SwiperSlide>
            ))}

        {fetchingMore && renderSkeletonSlides()}
      </Swiper>
    </>
  );
};
