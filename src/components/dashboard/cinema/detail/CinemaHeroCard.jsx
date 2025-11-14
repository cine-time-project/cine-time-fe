"use client";

import React from "react";
import "./cinema-hero-card.scss";

export const CinemaHeroCard = ({ cinema, tCinemas }) => {
  if (!cinema) return null;

  const imageUrl = cinema.cinemaImageUrl || cinema.imageUrl || "";
  const country = cinema.city?.countryMiniResponse?.name || "";
  const city = cinema.city?.name || "";

  return (
    <div
      className="cinema-hero-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="cinema-hero-overlay" />

      <div className="cinema-hero-content">
        <div className="cinema-hero-info">
          <h2 className="cinema-hero-title">{cinema.name || tCinemas("noCinemaData")}</h2>
          <p className="cinema-hero-location">
            {country && `${country}, `}{city}
          </p>
        </div>
      </div>
    </div>
  );
};
