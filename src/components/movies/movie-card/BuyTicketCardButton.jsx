import React, { useCallback } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";
import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import "./buyTicketCardButton.scss";

export const BuyTicketCardButton = ({ movie, showtime }) => {
  const locale = useLocale();
  const tMovies = useTranslations("movies");
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
      className={`${movie ? "movie-card-btn" : ""} ${
        showtime ? "showtime-buy-btn" : ""
      }`}
      onClick={handleBuyTicket}
      aria-label={tMovies("buyTicket", { default: "Buy Ticket" })}
      title={tMovies("buyTicket", { default: "Buy Ticket" })}
      variant={movie ? "link" : "dark"}
    >
      <Image
        src="/icons/buy-tickets.png"
        alt="Buy Tickets"
        width={70}
        height={35}
      /> 
      {showtime && <span>{tMovies("buyTicket")}</span>}
    </Button>
  );
};
