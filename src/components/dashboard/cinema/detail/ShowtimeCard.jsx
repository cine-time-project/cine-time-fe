"use client";

import React from "react";
import { Card, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import styles from "./ShowtimeCard.module.scss";
import { useLocale } from "next-intl";
import BuyTicketButton from "@/components/layout/header/BuyTicketButton";

export const ShowtimeCard = ({ showtime, tCinemas, cinema, hall }) => {
  const router = useRouter();
  const locale = useLocale();

  const handleBuyTicket = () => {
    const params = new URLSearchParams({
      cityId: cinema.city.id,
      cinemaId: cinema.id,
      date: showtime.date,
      movieId: showtime.movieId,
      time: showtime.startTime,
      hallId: hall.id,
    });

    const buyTicketUrl = `/${locale}/buy-ticket?${params.toString()}`;
    router.push(buyTicketUrl);
  };


  const handleMovieDetail = () => {
    const movieDetailUrl = `/${locale}/movies/${showtime.movieSlug || showtime.movieId}`;
    router.push(movieDetailUrl);
  };

  return (
    <Card className={styles.showtimeCard}>
      {/* Movie Poster */}
      <div className={styles.posterWrapper}>
        <img
          src={showtime.moviePosterUrl}
          alt={showtime.movieTitle}
          className={styles.poster}
        />
      </div>

      {/* Overlay for hover */}
      <div className={styles.overlay}>
        <BuyTicketButton miniButton={true} tNav={tCinemas} />

        <div className={styles.showDetails} onClick={handleMovieDetail}>
          <i className="pi pi-info-circle"></i>
        </div>
      </div>

      {/* Movie Info */}
      <div className={styles.info}>
        <p className={styles.title}>
          {showtime.movieTitle?.length > 20
            ? showtime.movieTitle.substring(0, 20) + "..."
            : showtime.movieTitle}
        </p>
        <p className={styles.date}>
          <i className="pi pi-calendar mr-2"></i>
          {showtime.date ? new Date(showtime.date).toLocaleDateString() : "-"}
        </p>
        <p className={styles.time}>
          <i className="pi pi-clock mr-2"></i>
          {showtime.startTime || tCinemas("start")} -{" "}
          {showtime.endTime || tCinemas("end")}
        </p>
      </div>
    </Card>
  );
};
