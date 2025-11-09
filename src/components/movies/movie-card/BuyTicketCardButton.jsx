import React, { useCallback } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";
import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

export const BuyTicketCardButton = ({ movie }) => {
  const locale = useLocale(); // Current locale segment
  const tCinemas = useTranslations();
  const router = useRouter();

  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();
      router.push(`${locale}/movies/showtimes/${movie.id}`);
    },
    [movie.id]
  );

  // 🔹 Inline styles based on original SCSS
  const styles = {
    button: {
      position: "absolute",
      zIndex: 5,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      top: "-5px",
      right: "-10px",
      transform: "rotate(-20deg)",
      transition: "all 0.3s ease",
    },
    buttonHover: {
      transform: "rotate(0deg) scale(1.3)",
    },
    image: {
      width: 70,
      height: 35,
    },
  };
  return (
    <div
      as={Button}
      style={styles.button}
      onClick={(e) => {
        handleBuyTicket(e);
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = styles.buttonHover.transform;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = styles.button.transform;
      }}
      aria-label={tCinemas("movies.buyTicket", { default: "Buy Ticket" })}
      title={tCinemas("movies.buyTicket", { default: "Buy Ticket" })}
    >
      <Image
        src="/icons/buy-tickets.png"
        alt="Buy Tickets"
        width={styles.image.width}
        height={styles.image.height}
      />
    </div>
  );
};
