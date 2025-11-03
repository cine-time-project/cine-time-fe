import React from "react";
import { CardGroup } from "../new/ui/CardGroup";
import { Card } from "react-bootstrap";

export const CinemaImageReadOnlyView = ({ cinema }) => {
  return (
    <CardGroup title={`Image for "${cinema.name}"`}>
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
        <div className="text-center text-muted py-5 border rounded bg-light">
          No image available
        </div>
      )}
    </CardGroup>
  );
};
