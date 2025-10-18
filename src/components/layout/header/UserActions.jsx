import { Nav } from "react-bootstrap";
import AccountDropdown from "./AccountDropdown";
import LocalePicker from "./LocalePicker";
import BuyTicketButton from "./BuyTicketButton";

export default function UserActions({ locale, L, tNav, relPath }) {
  return (
    <Nav className="right-actions">
      <AccountDropdown L={L} tNav={tNav} />
      <LocalePicker locale={locale} relPath={relPath} />
      <BuyTicketButton L={L} tNav={tNav} />
    </Nav>
  );
}