"use client";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { filterMovies } from "@/services/movie-service";
import MovieCard from "@/components/movies/movie-card/MovieCard";
import FiltersSidebar from "@/components/movies/FiltersSidebar";
import { Container, Row, Col, Button, Offcanvas } from "react-bootstrap";
import MovieCardSkeleton from "@/components/movies/movie-card/MovieCardSkeleton";
import { useResponsiveSkeletonCount } from "@/components/movies/useResponsiveSkeletonCount";

const PAGE_SIZE = 10;

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const [showFilters, setShowFilters] = useState(false);
  const handleShowFilters = () => setShowFilters(true);
  const handleCloseFilters = () => setShowFilters(false);

  const skeletonCount = useResponsiveSkeletonCount();

  // Fetch movies
  const fetchMovies = async (pageNum = 0, loadMore = false) => {
    setIsLoading(!loadMore);
    setError(null);

    try {
      const moviesPage = await filterMovies(filters, pageNum, PAGE_SIZE);
      if (!moviesPage?.content || moviesPage.content.length === 0) {
        setHasMore(false);
        return;
      }
      setMovies(prev =>
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
      setIsLoading(false);
    }
  };

  // Refetch on filters change
  useEffect(() => {
    setMovies([]);
    setPage(0);
    setHasMore(true);
    fetchMovies(0);
  }, [filters]);

  // Responsive columns per row
  const getColsPerRow = () => {
    if (typeof window === "undefined") return 4;
    const w = window.innerWidth;
    if (w >= 1200) return 4; // lg
    if (w >= 992) return 4;  // lg
    if (w >= 768) return 3;  // md
    if (w >= 576) return 2;  // sm
    return 1;                 // xs
  };

  // Render movies + skeletons + filler
  const renderMoviesWithSkeletons = () => {
    const items = [...movies];

    const colsPerRow = getColsPerRow();

    // İlk yükleme için skeletonlar
    if (isLoading && movies.length === 0) {
      for (let i = 0; i < skeletonCount; i++) {
        items.push({ skeleton: true, id: `skeleton-${i}` });
      }
    }

    // Son satırı doldur
    const remainder = items.length % colsPerRow;
    if (remainder > 0) {
      const fillerCount = colsPerRow - remainder;
      for (let i = 0; i < fillerCount; i++) {
        items.push({ skeleton: true, id: `filler-${i}` });
      }
    }

    // InfiniteScroll sırasında, yani yeni page yüklenmeden önce ekstra skeleton satırı
    if (isLoading && movies.length > 0) {
      for (let i = 0; i < colsPerRow; i++) {
        items.push({ skeleton: true, id: `extra-skeleton-${i}` });
      }
    }

    return items.map(item => (
      <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
        {item.skeleton ? <MovieCardSkeleton /> : <MovieCard movie={item} />}
      </Col>
    ));
  };

  return (
    <Container fluid className="py-4">
      {/* Desktop Sidebar + Mobile Offcanvas */}
      <div className="d-md-flex">
        {/* Desktop Sticky Sidebar */}
        <div
          className="d-none d-md-block"
          style={{
            position: "sticky",
            top: "120px", // header toplam yüksekliği
            maxHeight: "calc(100vh - 120px - 1rem)",
            width: "300px",
            overflowY: "auto",
            borderRight: "1px solid #dee2e6",
            padding: "1rem",
          }}
        >
          <FiltersSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 ps-md-3 pe-md-3">
          {/* Mobile filter button */}
          <div className="d-flex justify-content-end mb-3 d-md-none">
            <Button variant="primary" onClick={handleShowFilters}>
              Filters
            </Button>
          </div>

          {/* Error */}
          {error && <div className="text-center text-danger mb-3">{error}</div>}

          {/* Infinite scroll */}
          <InfiniteScroll
            dataLength={movies.length}
            next={() => fetchMovies(page + 1, true)}
            hasMore={hasMore}
            scrollThreshold={0.9}
            style={{ overflow: "hidden" }}
          >
            {/* Movie grid + skeletons */}
            <Row className="g-3 d-flex justify-content-start">
              {renderMoviesWithSkeletons()}
            </Row>
          </InfiniteScroll>

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
            onChange={newFilters => {
              setFilters(newFilters);
              handleCloseFilters();
            }}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}
