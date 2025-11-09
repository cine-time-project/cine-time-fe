import React from "react";
import { Card } from "react-bootstrap";

export const CinemaImageReadOnlyView = ({ cinema, tCinemas }) => {
  return (
    <div className="cinema-image-view">
      {cinema.imageUrl ? (
        <Card.Img
          src={cinema.imageUrl}
          alt="Cinema"
          className="cinema-image"
        />
      ) : (
        <div className="cinema-no-image">
          <p>{tCinemas("noImageShow")}</p>
        </div>
      )}
    </div>
  );
};
