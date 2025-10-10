"use client";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { searchMovies } from "@/services/movie-service";
import MovieCard from "@/components/movies/movie-card/MovieCard";
import { Container, Row, Col, Button } from "react-bootstrap";
import MovieCardSkeleton from "@/components/movies/MovieCardSkeleton";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { useResponsiveSkeletonCount } from "@/components/movies/useResponsiveSkeletonCount";

const PAGE_SIZE = 10;

const MoviesPage = ({ query = "" }) => {
  // States for movies, pagination, loading, and error
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const skeletonCount = useResponsiveSkeletonCount();

  // Function to fetch movies
  const fetchMovies = async (pageNum = 0, loadMore = false) => {
    setIsLoading(!loadMore);
    setError(null);

    try {
      const moviesPage = await searchMovies(query, pageNum, PAGE_SIZE);

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

  // Reset and fetch movies when query changes
  useEffect(() => {
    setMovies([]);
    setPage(0);
    setHasMore(true);
    fetchMovies(0);
  }, [query]);

  // Render Skeleton grid
  const renderSkeletons = () => (
    <>
      {Array(skeletonCount)
        .fill(null)
        .map((_, idx) => (
          <Col key={`skeleton-${idx}`} xs={12} sm={6} md={4} lg={3}>
            {/* Skeleton with fixed height, independent of MovieCard */}
            <MovieCardSkeleton height="300px" />
          </Col>
        ))}
    </>
  );

  return (
    <Container className="py-4">
      {/* Error message with retry */}
      {error && (
        <div className="text-center text-danger mb-3">
          {error}
          <div className="mt-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => fetchMovies(page)}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Infinite scroll */}
      <InfiniteScroll
        dataLength={movies.length}
        next={() => fetchMovies(page + 1, true)}
        hasMore={hasMore}
        loader={<Row className="g-3 mt-1">{renderSkeletons()}</Row>}
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

      {/* No movies found */}
      {!isLoading && movies.length === 0 && !error && (
        <p className="text-center text-muted py-4">
          No movies found for "{query}"
        </p>
      )}
    </Container>
  );
};

export default MoviesPage;
