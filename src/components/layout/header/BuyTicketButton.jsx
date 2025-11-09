import Image from "next/image";
import Link from "next/link";
import { Button } from "react-bootstrap";

export default function BuyTicketButton({ L, tNav, miniButton = false }) {
  const ticketUrl = "";
  // 🔹 Inline styles based on original SCSS
  const styles = {
    button: {
      position: "absolute",
      zIndex: 5,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      top: "10px",
      right: "10px",
      transform: "rotate(-15deg)",
      transition: "all 0.3s ease",
    },
    buttonHover: {
      transform: "rotate(0deg) scale(1.1)",
    },
    image: {
      width: 70,
      height: 45,
    },
  };
  if (miniButton) {
    return (
      <Link
        style={styles.button}
        href={ticketUrl}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = styles.buttonHover.transform;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = styles.button.transform;
        }}
        aria-label={tNav("buyTicket", { default: "Buy Ticket" })}
        title={tNav("buyTicket", { default: "Buy Ticket" })}
      >
        <Image
          src="/icons/buy-tickets.png"
          alt="Buy Tickets"
          width={styles.image.width}
          height={styles.image.height}
        />
      </Link>
    );
  }
  return (
    <Button as={Link} href={L("find-showtime")} variant="warning" size="sm">
      {tNav("buy")}
    </Button>
  );
}
