"use client";
import { searchMovies } from "@/services/movie-service";
import { useState, useEffect } from "react";
import { Col, Row, Spinner } from "react-bootstrap";
import MovieCard from "@/components/movies/MovieCard";

export const MovieSlider = ({ query }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      try {
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

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row xs={1} md={3} className="g-4">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <Col key={movie.id}>
              <MovieCard movie={movie} />
            </Col>
          ))
        ) : (
          <p className="text-muted">No movies found.</p>
        )}
      </Row>
    </div>
  );
};
