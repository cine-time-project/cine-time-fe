"use client";

import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { filterMovies } from "@/services/movie-service";
import MovieCard from "@/components/movies/movie-card/MovieCard";
import FiltersSidebar from "@/components/movies/FiltersSidebar";
import { Container, Row, Col, Button, Offcanvas } from "react-bootstrap";
import MovieCardSkeleton from "@/components/movies/movie-card/MovieCardSkeleton";
import { useResponsiveSkeletonCount } from "@/components/movies/useResponsiveSkeletonCount";

import { useSearchParams } from "next/navigation";

const PAGE_SIZE = 10;

export default function MoviesPage() {
  const params = useSearchParams();
  const initGenre = params.get("genre"); // ex: "Comedy"
  // -------------------------
  // State declarations
  // -------------------------
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(() =>
    initGenre ? { genre: [initGenre] } : {}
  );
  const [showFilters, setShowFilters] = useState(false);

  const skeletonCount = useResponsiveSkeletonCount(); // Responsive skeleton count

  const handleShowFilters = () => setShowFilters(true);
  const handleCloseFilters = () => setShowFilters(false);

  // -------------------------
  // Fetch movies function
  // -------------------------
  const fetchMovies = async (pageNum = 0, loadMore = false) => {
    setIsLoading(!loadMore); // show full-page skeleton only on initial load
    setError(null);

    let isMounted = true; // cleanup flag

    try {
      const moviesPage = await filterMovies(filters, pageNum, PAGE_SIZE);

      if (!isMounted) return; // prevent state update if unmounted

      if (!moviesPage?.content || moviesPage.content.length === 0) {
        setHasMore(false);
        return;
      }

      setMovies((prev) =>
        pageNum === 0 ? moviesPage.content : [...prev, ...moviesPage.content]
      );

      setHasMore(
        moviesPage.totalPages
          ? pageNum + 1 < moviesPage.totalPages
          : moviesPage.content.length === PAGE_SIZE
      );

      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setError("Failed to load movies");
      setHasMore(false);
    } finally {
      if (isMounted) setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  };

  // -------------------------
  // Refetch when filters change with debounce
  // -------------------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMovies([]);
      setPage(0);
      setHasMore(true);
      fetchMovies(0);
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters]);

  // -------------------------
  // Render movies with skeletons
  // -------------------------
  const renderMoviesWithSkeletons = () => {
    const items = [...movies];

    // ✅ Skeletons only when first load (no movies yet)
    if (isLoading && movies.length === 0) {
      for (let i = 0; i < skeletonCount; i++) {
        items.push({ skeleton: true, id: `skeleton-${i}` });
      }
    }

    return items.map((item) => (
      <Col key={item.id} xs={12} sm={6} md={6} lg={4} xl={3}>
        {item.skeleton ? <MovieCardSkeleton /> : <MovieCard movie={item} />}
      </Col>
    ));
  };

  return (
    <Container fluid className="py-4">
      {/* -------------------------
          Desktop Sidebar + Mobile Offcanvas
      ------------------------- */}
      <div className="d-md-flex">
        {/* Desktop Sidebar */}
        <div
          className="d-none d-md-block"
          style={{
            flexShrink: 0,
            top: "110px", // header height
            maxHeight: "100vh",
            maxWidth: "350px",
            overflowY: "auto",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <FiltersSidebar
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);

              // Scroll to top when filters applied
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 ps-md-3 pe-md-3">
          {/* Mobile filter button */}
          <div className="d-flex justify-content-end mb-3 d-md-none">
            <Button variant="primary" onClick={handleShowFilters}>
              Filters
            </Button>
          </div>

          {/* Error display with retry button */}
          {error && (
            <div className="text-center text-danger mb-3">
              {error}{" "}
              <Button onClick={() => fetchMovies(page, false)}>Retry</Button>
            </div>
          )}

          {/* Infinite scroll */}
          <InfiniteScroll
            dataLength={movies.length}
            next={() => fetchMovies(page + 1, true)}
            hasMore={hasMore}
            scrollThreshold={0.95} // slightly before bottom
            style={{ overflow: "hidden" }}
          >
            {/* Movie grid + skeletons */}
            <Row className="g-5 d-flex justify-content-start p-3">
              {renderMoviesWithSkeletons()}
            </Row>
          </InfiniteScroll>

          {/* No movies found */}
          {!isLoading && movies.length === 0 && !error && (
            <p className="text-center text-muted py-4">No movies found.</p>
          )}
        </div>
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas
        show={showFilters}
        onHide={handleCloseFilters}
        placement="start"
        style={{ width: "280px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ paddingBottom: "2rem" }}>
          <FiltersSidebar
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              handleCloseFilters();

              // ✅ Scroll to top after applying filters
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}
