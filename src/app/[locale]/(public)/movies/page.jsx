"use client";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { filterMovies } from "@/services/movie-service";
import MovieCard from "@/components/movies/movie-card/MovieCard";
import FiltersSidebarContent from "@/components/movies/FiltersSidebarContent"; // sadece form kısmı
import { Container, Row, Col, Button } from "react-bootstrap";
import MovieCardSkeleton from "@/components/movies/movie-card/MovieCardSkeleton";
import { useResponsiveSkeletonCount } from "@/components/movies/useResponsiveSkeletonCount";

const PAGE_SIZE = 10;

//TODO: ExpandedMovieCard implementation is pending.
export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const skeletonCount = useResponsiveSkeletonCount();

  const fetchMovies = async (pageNum = 0, loadMore = false) => {
    setIsLoading(!loadMore);
    setError(null);

    try {
      const moviesPage = await filterMovies(filters, pageNum, PAGE_SIZE);

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
      setIsLoading(false);
    }
  };

  // refetch when filters change
  useEffect(() => {
    setMovies([]);
    setPage(0);
    setHasMore(true);
    fetchMovies(0);
  }, [filters]);

  const renderSkeletons = () =>
    Array(skeletonCount)
      .fill(null)
      .map((_, idx) => (
        <Col key={idx} xs={12} sm={6} md={4} lg={3}>
          <MovieCardSkeleton height="300px" />
        </Col>
      ));

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Desktop sidebar */}
        <Col md={3} className="d-none d-md-block">
          <div className="sticky-top" style={{ top: "1rem" }}>
            <FiltersSidebarContent filters={filters} onChange={setFilters} />
          </div>
        </Col>

        {/* Movie grid */}
        <Col xs={12} md={9}>
          {error && (
            <div className="text-center text-danger mb-3">
              {error}
            </div>
          )}

          <InfiniteScroll
            dataLength={movies.length}
            next={() => fetchMovies(page + 1, true)}
            hasMore={hasMore}
            loader={<Row className="g-3">{renderSkeletons()}</Row>}
            scrollThreshold={0.9}
            style={{ overflow: "visible" }}
          >
            <Row className="g-3">
              {movies.map((movie) => (
                <Col key={movie.id} xs={12} sm={6} md={4} lg={3}>
                  <MovieCard movie={movie} />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>

          {!isLoading && movies.length === 0 && !error && (
            <p className="text-center text-muted py-4">No movies found.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}
