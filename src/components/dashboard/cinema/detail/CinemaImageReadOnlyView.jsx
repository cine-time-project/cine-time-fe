import React from "react";
import { Card } from "react-bootstrap";

export const CinemaImageReadOnlyView = ({ cinema, tCinemas }) => {
  return (
    <>
      {cinema.imageUrl ? (
        <Card.Img
          src={cinema.imageUrl}
          alt="Cinema"
          style={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      ) : (
        <div className="text-muted border rounded bg-light h-100 d-flex justify-content-center align-items-center">
          <p>{tCinemas("noImageShow")}</p>
        </div>
      )}
    </>
  );
};
