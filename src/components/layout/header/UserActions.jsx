import { Nav } from "react-bootstrap";
import AccountDropdown from "./AccountDropdown";
import LocalePicker from "./LocalePicker";
import BuyTicketButton from "./BuyTicketButton";

export default function UserActions({ locale, L, tNav }) {
  return (
    <Nav className="right-actions">
      <AccountDropdown L={L} tNav={tNav} />
      <LocalePicker locale={locale} />
      <BuyTicketButton L={L} tNav={tNav} />
    </Nav>
  );
}