"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Navbar, Container, Offcanvas } from "react-bootstrap";

// Import smaller header components
import SearchBar from "./SearchBar";
import UserActions from "./UserActions";
import LocationFinder from "./LocationFinder";
import Navigation from "./Navigation";

import "./header.scss";

export default function Header() {
  const pathname = usePathname() || "/";
  const tNav = useTranslations("nav");
  const locale = useLocale();

  // Helper to create localized URLs
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
      {/* --- TOP BAR --- Logo, Search, User Actions */}
      <Navbar expand="lg" sticky="top" className="header-dark">
        <Container className="d-flex align-items-center justify-content-between">
          {/* Logo */}
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

          {/* Search Component */}
          <SearchBar locale={locale} tNav={tNav} />

          {/* User Actions: AccountDropdown will now reactively show login/logout */}
          <UserActions locale={locale} L={L} tNav={tNav} relPath={relPath} />
        </Container>
      </Navbar>

      {/* --- MENU BAR --- Main navigation + location finder */}
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
              <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
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
