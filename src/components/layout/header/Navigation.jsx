"use client";

import Link from "next/link";
import { Nav } from "react-bootstrap";
import { useLocalStorageUser } from "./useLocalStorageUser";

const MENU = [
  { key: "home", path: "" },
  { key: "movies", path: "movies" },
  { key: "cinemas", path: "cinemas" },
  { key: "comingsoon", path: "comingsoon" },
  { key: "events", path: "events" },
  { key: "campaigns", path: "campaigns" },
].filter((it) => !["about", "contact"].includes(it.key));

const AUTHENTICATED_MENU = [{ key: "favorites", path: "myfavorites" }];

export default function Navigation({ L, isActive, tNav }) {
  const user = useLocalStorageUser();

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
      {/* Show authenticated menu items only when user is logged in */}
      {user &&
        AUTHENTICATED_MENU.map((item) => (
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
