"use client";

import React from "react";
import { Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BuyTicketCardButton } from "@/components/movies/movie-card/BuyTicketCardButton";
import styles from "./ShowtimeCard.module.scss";

export const ShowtimeCard = ({ showtime, tCinemas }) => {
  const router = useRouter();
  const locale = useLocale();

  const handleMovieDetail = () => {
    const movieDetailUrl = `/${locale}/movies/${showtime.movieSlug || showtime.movieId}`;
    router.push(movieDetailUrl);
  };

  return (
    <Card className={styles.showtimeCard}>
      {/* Header: SHOWTIME */}
      <div className={styles.header}>
        <span className={styles.startTime}>
          {showtime.startTime || "--:--"}
        </span>
        <span className={styles.to}>→</span>
        <span className={styles.endTime}>
          {showtime.endTime || "--:--"}
        </span>
      </div>

      {/* Poster + Movie Info */}
      <div className={styles.cardContent}>
        <div className={styles.posterWrapper} onClick={handleMovieDetail}>
          <img
            src={showtime.moviePosterUrl}
            alt={showtime.movieTitle}
            title={tCinemas("details")}
            className={styles.poster}
          />
        </div>

        <div className={styles.info}>
          <p className={styles.title}>
            {showtime.movieTitle?.length > 35
              ? showtime.movieTitle.substring(0, 35) + "..."
              : showtime.movieTitle}
          </p>
          <p className={styles.date}>
            <i className="pi pi-calendar mr-2"></i>
            {showtime.date
              ? new Date(showtime.date).toLocaleDateString()
              : "-"}
          </p>

          <div className={styles.actions}>
            <BuyTicketCardButton showtime={showtime} />
          </div>
        </div>
      </div>
    </Card>
  );
};
