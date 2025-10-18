"use client"; 

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Internationalization (i18n) hooks from next-intl
import { useTranslations, useLocale } from "next-intl";

// React-Bootstrap components for layout and UI
import { Navbar, Container, Offcanvas } from "react-bootstrap";

// Custom styles for the header
import "./header.scss";

// Importing the refactored, smaller header components
import SearchBar from "./SearchBar";
import UserActions from "./UserActions";
import LocationFinder from "./LocationFinder";
import Navigation from "./Navigation";

export default function Header() {
  // --- HOOKS ---
  // Gets the current URL path (e.g., "/en/movies")
  const pathname = usePathname() || "/";
  // Hook to get translation functions for the "nav" namespace (from i18n files)
  const tNav = useTranslations("nav");
  // Hook to get the current active locale (e.g., "en", "tr")
  const locale = useLocale();

  // --- HELPER FUNCTIONS ---
  /**
   * `L` is a helper function to create localized links.
   * It prepends the current locale to any given path.
   * Example: L("movies") -> "/en/movies"
   * @param {string} rest - The path to localize.
   * @returns {string} The full, localized path.
   */
  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  // Extracts the relative path after the locale segment (e.g., "movies/detail")
  const relPath = pathname.split("/").slice(2).join("/");

  /**
   * `isActive` checks if a given navigation path matches the current URL.
   * Used to apply an "active" class to the current navigation link.
   * @param {string} rest - The path segment to check.
   * @returns {boolean} True if the path is active.
   */
  const isActive = (rest = "") => {
    if (!rest) return relPath === ""; // Check for home page
    const seg = rest.replace(/^\/+/, "");
    // Check if the path is an exact match or a parent path
    return relPath === seg || relPath.startsWith(seg + "/");
  };

  // --- DATA ---
  // Defines the navigation menu items.
  const MENU = [
    { key: "home", path: "" },
    { key: "movies", path: "movies" },
    { key: "cinemas", path: "cinemas" },
    { key: "comingsoon", path: "comingsoon" },
    { key: "events", path: "events" },
    { key: "campaigns", path: "campaigns" },
    { key: "favorites", path: "myfavorites" },
  ].filter((it) => !["about", "contact"].includes(it.key)); // Example of filtering out items

  // --- RENDER ---
  return (
    <>
      {/* TOP BAR: Contains Logo, Search Bar, and User Actions */}
      <Navbar expand="lg" sticky="top" className="header-dark">
        <Container className="d-flex align-items-center justify-content-between">
          {/* Logo linking to the home page */}
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

          {/* Search functionality component */}
          <SearchBar locale={locale} tNav={tNav} />

          {/* User-related actions like account, language, and buy ticket */}
          <UserActions locale={locale} L={L} tNav={tNav} relPath={relPath} />
        </Container>
      </Navbar>

      {/* MENÜ BAR: Contains main navigation and location finder */}
      <Navbar expand="lg" className="menu-dark" collapseOnSelect>
        <Container>
          {/* Location display and cinema finder modal */}
          <LocationFinder />

          {/* Hamburger menu button for mobile view */}
          <Navbar.Toggle
            aria-controls="offcanvasNavbar-expand-lg"
            className="custom-toggler"
          >
            <div className="bar"></div>
          </Navbar.Toggle>

          {/* Offcanvas menu that appears on mobile */}
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
              {/* Main navigation links, rendered inside the offcanvas on mobile */}
              <Navigation menu={MENU} L={L} isActive={isActive} tNav={tNav} />
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}