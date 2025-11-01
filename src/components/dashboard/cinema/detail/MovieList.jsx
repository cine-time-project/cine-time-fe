"use client";
import { Card } from "react-bootstrap";

export default function MovieList({ movies }) {
  if (!movies.length)
    return <p className="text-muted">No movies linked to this cinema.</p>;

  return (
    <div>
      <h3 className="fw-bold mb-3 text-light">Movies Playing</h3>
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
              <small className="text-muted">{movie.duration} min</small>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
