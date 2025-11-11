"use client";

import { HallCard } from "./HallCard";

export default function HallList({
  cinema,
  tCinemas,
  isEditMode,
  selectedMovieID,
  selectedDate
}) {

  const halls = cinema.halls || [];

  if (!halls.length) return <p className="text-muted">{tCinemas("noHalls")}</p>;

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
