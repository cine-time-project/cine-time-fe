import Link from "next/link";
import { Button } from "react-bootstrap";

export default function BuyTicketButton({ L, tNav }) {
  return (
    <Button as={Link} href={L("find-showtime")} variant="warning" size="sm">
      {tNav("buy")}
    </Button>
  );
}