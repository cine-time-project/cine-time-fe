"use client";

import HallCard from "./HallCard";

export default function HallList({ halls, tCinemas }) {
  if (!halls.length)
    return <p className="text-muted">{tCinemas("noHalls")}</p>;

  return (
    <>
      <h3 className="fw-bold mb-3 text-light">{tCinemas("halls")}</h3>
      {halls.map((hall) => (
        <HallCard key={hall.id} hall={hall} tCinemas={tCinemas}/>
      ))}
    </>
  );
}
