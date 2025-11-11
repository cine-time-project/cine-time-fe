import Image from "next/image";
import React, { useCallback } from "react";
import { Button } from "react-bootstrap";
import { useTranslations } from "use-intl";
import "./findShowtimeButton.scss";

export const FindShowtimeButton = () => {
  const tCinemas = useTranslations("cinemas");
  const handleBuyTicket = useCallback((e) => {
    e.stopPropagation();
  });

  return (
    <Button
      className="find-showtime-btn"
      onClick={handleBuyTicket}
      aria-label={tCinemas("showtimes", { default: "Showtimes" })}
      title={tCinemas("showtimes", { default: "Showtimes" })}
      variant="link"
    >
      <Image
        src="/icons/film-roll.png"
        alt="Buy Tickets"
        width={50}
        height={50}
      />
    </Button>
  );
};
