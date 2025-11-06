"use client";
import { Card } from "react-bootstrap";
import ShowtimeList from "./ShowtimeList";

export default function HallCard({ hall, tCinemas }) {
  return (
    <Card className="mt-3">
      <Card.Header className="bg-secondary text-light fs-5">
        {hall.name}
        <span className="ms-2 text-light">{hall.isSpecial && ` - ${tCinemas("specialHall")}`}</span>
      </Card.Header>
      <Card.Body>
        <p>
          {tCinemas("capacity")}: <strong>{hall.seatCapacity}</strong>
        </p>
        <p>
          {tCinemas("created")}: {new Date(hall.createdAt).toLocaleDateString()} | {tCinemas("updated")}:{" "}
          {new Date(hall.updatedAt).toLocaleDateString()}
        </p>

        <h6 className="fw-semibold mt-3">{tCinemas("showtimes")}</h6>
        <ShowtimeList showtimes={hall.showtimes || []} tCinemas={tCinemas} />
      </Card.Body>
    </Card>
  );
}
