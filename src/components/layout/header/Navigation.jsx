import Link from "next/link";
import { Nav } from "react-bootstrap";

const MENU = [
    { key: "home", path: "" },
    { key: "movies", path: "movies" },
    { key: "cinemas", path: "cinemas" },
    { key: "comingsoon", path: "comingsoon" },
    { key: "events", path: "events" },
    { key: "campaigns", path: "campaigns" },
    { key: "favorites", path: "myfavorites" },
  ].filter((it) => !["about", "contact"].includes(it.key));

export default function Navigation({ L, isActive, tNav }) {
  return (
    <Nav className="mx-auto">
      {MENU.map((item) => (
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