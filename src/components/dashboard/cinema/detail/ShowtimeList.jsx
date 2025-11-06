"use client";
import { Table } from "react-bootstrap";

export default function ShowtimeList({ showtimes, tCinemas }) {
  if (!showtimes.length)
    return <p className="text-muted">{tCinemas("noShowtimes")}</p>;

  return (
    <Table striped bordered hover size="sm" className="mt-2">
      <thead>
        <tr>
          <th>{tCinemas("date")}</th>
          <th>{tCinemas("start")}</th>
          <th>{tCinemas("end")}</th>
          <th>{tCinemas("movie")}</th>
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
