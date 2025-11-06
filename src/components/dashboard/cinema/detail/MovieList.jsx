"use client";
import { Card } from "react-bootstrap";

export default function MovieList({ movies, tCinemas }) {
  if (!movies.length)
    return <p className="text-muted">{tCinemas("noMovieForCinema")}</p>;

  return (
    <div>
      <h3 className="fw-bold mb-3 text-light">{tCinemas("currentMovies")}</h3>
      {movies.map((movie) => (
        <Card
          key={movie.id}
          className="mb-2 shadow-sm border-0 rounded-3 overflow-hidden"
        >
          <Card.Body className="d-flex align-items-center">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              width={60}
              height={90}
              className="me-3 rounded"
              style={{ objectFit: "cover" }}
            />
            <div>
              <h6 className="mb-0">{movie.title}</h6>
              <small className="text-muted">{movie.duration} {tCinemas("min")}</small>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
