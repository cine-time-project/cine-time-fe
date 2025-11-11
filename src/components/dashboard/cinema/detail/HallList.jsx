"use client";

import { useState } from "react";
import { HallCard } from "./HallCard";
import { ShowtimeDateSelector } from "./ShowtimeDateSelector";

export default function HallList({ cinema, tCinemas, isEditMode, selectedMovieID }) {

   const [selectedDate, setSelectedDate] = useState(null);

  const halls = cinema.halls || [];

  if (!halls.length) return <p className="text-muted">{tCinemas("noHalls")}</p>;

  const allDates = [
    ...new Set(halls.flatMap((hall) => hall.showtimes.map((s) => s.date))),
  ];

  return (
    <>
      <h3 className="fw-bold mb-3 text-light">{tCinemas("halls")}</h3>
      <ShowtimeDateSelector dates={allDates} tCinemas={tCinemas} onDateChange={setSelectedDate} />
      {halls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          tCinemas={tCinemas}
          isEditMode={isEditMode}
        />
      ))}
    </>
  );
}
