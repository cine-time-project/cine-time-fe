"use client";

import { useState } from "react";
import { HallCard } from "./HallCard";
import { ShowtimeDateSelector } from "./ShowtimeDateSelector";

export default function HallList({
  cinema,
  tCinemas,
  isEditMode,
  selectedMovieID,
}) {
  const [selectedDate, setSelectedDate] = useState(null);

  const halls = cinema.halls || [];

  if (!halls.length) return <p className="text-muted">{tCinemas("noHalls")}</p>;

  const allDates = [
    ...new Set(halls.flatMap((hall) => hall.showtimes.map((s) => s.date))),
  ];

  const filteredHalls = halls.filter((hall) =>
    hall.showtimes.some((showtime) => {
      
      const matchDate = showtime.date === selectedDate;
      
      const matchMovie = selectedMovieID
        ? showtime.movieId === selectedMovieID
        : true;
      return matchDate && matchMovie;
    })
  );

  return (
    <>
      <h3 className="fw-bold mb-3 text-light">{tCinemas("halls")}</h3>
      <ShowtimeDateSelector
        dates={allDates}
        tCinemas={tCinemas}
        onDateChange={setSelectedDate}
      />
      {filteredHalls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          tCinemas={tCinemas}
          isEditMode={isEditMode}
          selectedMovieID={selectedMovieID}
          selectedDate={selectedDate}
        />
      ))}
    </>
  );
}
