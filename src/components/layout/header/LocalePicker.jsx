import Link from "next/link";
import { NavDropdown } from "react-bootstrap";

export default function LocalePicker({ locale }) {
  const locales = ["tr", "en", "de", "fr"];

  return (
    <NavDropdown
      title={`${locale.toUpperCase()} 🌐`}
      id="locale-dropdown"
      align="end"
    >
      {locales.map((loc) => (
        <NavDropdown.Item key={loc} as={Link} href={`/${loc}`}>
          {loc.toUpperCase()}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
}