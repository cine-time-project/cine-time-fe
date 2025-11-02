"use client";
import { Card } from "react-bootstrap";
import ShowtimeList from "./ShowtimeList";

export default function HallCard({ hall }) {
  return (
    <Card className="mt-3">
      <Card.Header className="bg-secondary text-light fs-5">
        {hall.name}
        <span className="ms-2 text-light">{hall.isSpecial && " - Special Hall"}</span>
      </Card.Header>
      <Card.Body>
        <p>
          Capacity: <strong>{hall.seatCapacity}</strong>
        </p>
        <p>
          Created: {new Date(hall.createdAt).toLocaleDateString()} | Updated:{" "}
          {new Date(hall.updatedAt).toLocaleDateString()}
        </p>

        <h6 className="fw-semibold mt-3">Showtimes</h6>
        <ShowtimeList showtimes={hall.showtimes || []} />
      </Card.Body>
    </Card>
  );
}
