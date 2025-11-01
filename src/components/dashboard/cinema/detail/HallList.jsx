"use client";

import HallCard from "./HallCard";

export default function HallList({ halls }) {
  if (!halls.length)
    return <p className="text-muted">No halls found for this cinema.</p>;

  return (
    <>
      <h3 className="fw-bold mb-3 text-light">Halls</h3>
      {halls.map((hall) => (
        <HallCard key={hall.id} hall={hall} />
      ))}
    </>
  );
}
