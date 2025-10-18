import Link from "next/link";
import { Nav } from "react-bootstrap";

export default function Navigation({ menu, L, isActive, tNav }) {
  return (
    <Nav className="mx-auto">
      {menu.map((item) => (
        <Nav.Link
          as={Link}
          key={item.key}
          href={L(item.path)}
          className={isActive(item.path) ? "active" : ""}
        >
          {tNav(item.key)}
        </Nav.Link>
      ))}
    </Nav>
  );
}