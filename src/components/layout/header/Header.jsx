"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Navbar, Container, Offcanvas } from "react-bootstrap";

import "./header.scss";
import SearchBar from "./SearchBar";
import UserActions from "./UserActions";
import LocationFinder from "./LocationFinder";
import Navigation from "./Navigation";

export default function Header() {
  const pathname = usePathname() || "/";
  const tNav = useTranslations("nav");
  const locale = useLocale();

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  const relPath = pathname.split("/").slice(2).join("/");
  const isActive = (rest = "") => {
    if (!rest) return relPath === "";
    const seg = rest.replace(/^\/+/, "");
    return relPath === seg || relPath.startsWith(seg + "/");
  };

  const MENU = [
    { key: "home", path: "" },
    { key: "movies", path: "movies" },
    { key: "cinemas", path: "cinemas" },
    { key: "comingsoon", path: "comingsoon" },
    { key: "events", path: "events" },
    { key: "campaigns", path: "campaigns" },
    { key: "favorites", path: "myfavorites" },
  ].filter((it) => !["about", "contact"].includes(it.key));

  return (
    <>
      {/* TOP BAR */}
      <Navbar expand="lg" sticky="top" className="header-dark">
        <Container className="d-flex align-items-center justify-content-between">
          <Navbar.Brand as={Link} href={L()} className="logo">
            <Image
              src="/images/cinetime-logo.png"
              alt="CineTime Logo"
              width={140}
              height={60}
              priority
              className="logo-img"
            />
          </Navbar.Brand>

          <SearchBar locale={locale} tNav={tNav} />

          <UserActions locale={locale} L={L} tNav={tNav} />
        </Container>
      </Navbar>

      {/* MENÜ BAR */}
      <Navbar expand="lg" className="menu-dark" collapseOnSelect>
        <Container>
          <LocationFinder />

          <Navbar.Toggle
            aria-controls="offcanvasNavbar-expand-lg"
            className="custom-toggler"
          >
            <div className="bar"></div>
          </Navbar.Toggle>

          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-lg"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            className="menu-offcanvas"
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title id="offcanvasNavbarLabel">Menü</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
              <Navigation menu={MENU} L={L} isActive={isActive} tNav={tNav} />
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}