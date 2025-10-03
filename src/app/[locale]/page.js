"use client"; // Next.js 13+ client component

import { useState, useEffect } from "react";
import { searchMovies } from "@/lib/api/movies.js";
import MovieCard from "@/components/movies/MovieCard";
import { useTranslations, useLocale } from "next-intl";
import { Col, Row, Spinner } from "react-bootstrap";

export default function HomePage({ query = "" }) {
  const t = useTranslations("auth");
  const locale = useLocale();

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
      <h2>
        {t("login")} – {locale}
      </h2>

      {error && <p className="text-danger">{error}</p>}

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
}
