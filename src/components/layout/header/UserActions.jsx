import { Nav } from "react-bootstrap";
import AccountDropdown from "./AccountDropdown";
import LocalePicker from "./LocalePicker";
import BuyTicketButton from "./BuyTicketButton";

export default function UserActions({ locale, L, tNav, relPath }) {
  const handleAdminToggle = () => {
    // Admin offcanvas'ı aç/kapa
    window.dispatchEvent(new Event("admin-sidebar-toggle"));
  };

  return (
    <Nav className="right-actions">
      {/* ↓ AccountDropdown'a prop olarak veriyoruz */}
      <AccountDropdown L={L} tNav={tNav} onAdminToggle={handleAdminToggle} />
      <LocalePicker locale={locale} relPath={relPath} />
      <BuyTicketButton L={L} tNav={tNav} />
    </Nav>
  );
}
