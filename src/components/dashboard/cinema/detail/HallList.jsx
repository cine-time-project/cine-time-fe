"use client";

import { HallCard } from "./HallCard";
import { Alert } from "react-bootstrap";

export default function HallList({
  halls,
  tCinemas,
  isEditMode = false,
  isDashboard = false,
  selectedMovieID,
  selectedDate
}) {

  // No halls at all
  if (!halls?.length) {
    return <Alert variant="warning">{tCinemas("noHalls")}</Alert>;
  }

  return (
    <>
      <h3 className="fw-bold mb-3 text-light">{tCinemas("halls")}</h3>

      {halls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          tCinemas={tCinemas}
          isEditMode={isEditMode}
          isDashboard={isDashboard}
          selectedMovieID={selectedMovieID}
          selectedDate={selectedDate}
        />
      ))}
    </>
  );
}
