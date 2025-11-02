"use client";
import { Table } from "react-bootstrap";

export default function ShowtimeList({ showtimes }) {
  if (!showtimes.length)
    return <p className="text-muted">No showtimes available.</p>;

  return (
    <Table striped bordered hover size="sm" className="mt-2">
      <thead>
        <tr>
          <th>Date</th>
          <th>Start</th>
          <th>End</th>
          <th>Movie</th>
        </tr>
      </thead>
      <tbody>
        {showtimes.map((st) => (
          <tr key={st.id}>
            <td>{st.date}</td>
            <td>
              {st?.startTime}
            </td>
            <td>
              {st?.endTime}
            </td>
            <td>
              <img
                src={st.moviePosterUrl}
                alt={st.movieTitle}
                width={40}
                className="me-2 rounded"
              />
              {st.movieTitle}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
