import React, { useCallback } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";
import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import "./buyTicketCardButton.scss";

export const BuyTicketCardButton = ({ movie, showtime }) => {
  const locale = useLocale();
  const tCinemas = useTranslations();
  const router = useRouter();

  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();

      if (showtime) {
        const params = new URLSearchParams({
          cityId: showtime.cityId,
          cinemaId: showtime.cinemaId,
          date: showtime.date,
          movieId: showtime.movieId,
          time: showtime.startTime,
          hallId: showtime.hallId,
        });

        router.push(`/${locale}/buy-ticket?${params.toString()}`);
      } else {
        router.push(`/${locale}/movies/showtimes/${movie?.id}`);
      }
    },
    [movie?.id, showtime, router, locale]
  );

  return (
    <Button
      className={`buy-ticket-btn ${movie ? "movie-card-btn" : ""} ${
        showtime ? "showtime-card-btn" : ""
      }`}
      onClick={handleBuyTicket}
      aria-label={tCinemas("movies.buyTicket", { default: "Buy Ticket" })}
      title={tCinemas("movies.buyTicket", { default: "Buy Ticket" })}
      variant="link"
    >
      <Image
        src="/icons/buy-tickets.png"
        alt="Buy Tickets"
        width={70}
        height={35}
      />
    </Button>
  );
};
