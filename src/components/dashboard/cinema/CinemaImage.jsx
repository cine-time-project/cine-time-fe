import React from "react";
import { Card } from "react-bootstrap";

/**
 * CinemaImage
 * ------------
 * Renders cinema image safely with placeholder fallback.
 */
export const CinemaImage = ({ url }) => (
  <Card.Img
    src={url || "/placeholder.png"}
    alt="Cinema"
    className="w-6rem shadow-2 border-round object-fit-cover"
    height={50}
  />
);
