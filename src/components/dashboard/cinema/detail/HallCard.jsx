"use client";
import ShowtimeList from "./ShowtimeList";

export default function HallCard({ hall }) {
  return (
    <div>
      <p>
        Capacity: <strong>{hall.seatCapacity}</strong>
      </p>
      <p>
        Created: {new Date(hall.createdAt).toLocaleDateString()} | Updated:{" "}
        {new Date(hall.updatedAt).toLocaleDateString()}
      </p>

      <h6 className="fw-semibold mt-3">Showtimes</h6>
      <ShowtimeList showtimes={hall.showtimes || []} />
    </div>
  );
}
