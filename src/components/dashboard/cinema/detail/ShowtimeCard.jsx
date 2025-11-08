"use client";

import React from "react";
import { Card, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import styles from "./ShowtimeCard.module.scss";

export const ShowtimeCard = ({ showtime, tCinemas, L, cinema, hall }) => {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams({
      cityId: cinema.city.id,
      cinemaId: cinema.id,
      date: showtime.date,
      movieId: showtime.movieId,
      time: showtime.startTime,
      hallId: hall.id,
    });

    const buyTicketUrl = L(`buy-ticket?${params.toString()}`);
    router.push(buyTicketUrl);
  };

  return (
    <Card className={styles.showtimeCard} onClick={handleClick}>
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
        <Button variant="warning" className={styles.ticketButton}>
          {tCinemas("buyTicket")}
        </Button>
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
