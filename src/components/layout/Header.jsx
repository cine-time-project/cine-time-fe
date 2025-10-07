"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Navbar, Nav, Container, Form, InputGroup, NavDropdown, Modal, Button
} from "react-bootstrap";
import "./Header.scss";

export default function Header() {
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] || "tr"; // "tr" | "en" | "de" | "fr"...
  const tNav = useTranslations("nav");           // nav.* etiketleri (menü, hesap, arama vs.)

  // /{locale}/{rest}
  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  // Aktiflik: locale’den sonraki segmenti karşılaştır
  const relPath = pathname.split("/").slice(2).join("/"); // locale sonrası
  const isActive = (rest = "") => {
    if (!rest) return relPath === ""; // home
    const seg = rest.replace(/^\/+/, ""); // "/contact" -> "contact"
    return relPath === seg || relPath.startsWith(seg + "/");
  };

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Lokasyon Alınıyor...");
  const [showModal, setShowModal] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [searchCity, setSearchCity] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) { setCity("Tarayıcı desteklemiyor"); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          setCity(d.address.city || d.address.town || d.address.state || "Bilinmeyen Konum");
        } catch { setCity("Konum alınamadı"); }
      },
      () => setCity("Konum izni reddedildi")
    );
  }, []);

  const loadDummyCinemas = (cityName) => {
    if (!cityName) return;
    setCinemas([
      { name: `${cityName} CineCity`, distance: "1.2 km" },
      { name: `${cityName} MoviePark`, distance: "2.5 km" },
      { name: `${cityName} StarCinema`, distance: "3.8 km" },
    ]);
  };

  const handleFindCinemas = (type = "search") => {
    if (type === "current") {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          const cityName = d.address.city || d.address.town || d.address.state || "Bilinmeyen Konum";
          setSearchCity(cityName);
          loadDummyCinemas(cityName);
        } catch {}
      });
      return;
    }
    loadDummyCinemas(searchCity);
  };

  // Menü tanımı: label i18n'den, path klasör ile birebir
  const MENU = [
    { key: "home",       path: "" },
    { key: "movies",     path: "movies" },
    { key: "cinemas",    path: "cinemas" },
    { key: "comingsoon", path: "comingsoon" },
    { key: "events",     path: "events" },
    { key: "campaigns",  path: "campaigns" },
    { key: "favorites",  path: "myfavorites" }, // rota klasör adı İngilizce, label i18n
  ].filter(it => !["about", "contact"].includes(it.key));

  return (
    <>
      {/* TOP BAR */}
      <Navbar expand="lg" sticky="top" className="header-dark">
        <Container className="d-flex align-items-center justify-content-between">
          {/* Anasayfa */}
          <Navbar.Brand as={Link} href={L()} className="logo">
            <Image src="/images/cinetime-logo.png" alt="CineTime Logo" width={140} height={60} priority className="logo-img" />
          </Navbar.Brand>

          <Form className="search-form mx-auto" onSubmit={(e) => e.preventDefault()}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder={tNav("search")}  // i18n: "Ara" / "Search" ...
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroup.Text className="search-icon">🔍</InputGroup.Text>
            </InputGroup>
          </Form>

          <Nav className="right-actions">
            <NavDropdown title={`👤 ${tNav("account")}`} id="user-dropdown" align="end">
              {/* Hepsi locale’lı mutlak link */}
              <NavDropdown.Item as={Link} href={L("login")}>{tNav("login")}</NavDropdown.Item>
              <NavDropdown.Item as={Link} href={L("register")}>{tNav("register")}</NavDropdown.Item>
              <NavDropdown.Item as={Link} href={L("mytickets")}>{tNav("myTickets")}</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} href={L("logout")}>{tNav("logout")}</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="🌐" id="locale-dropdown" align="end">
              <NavDropdown.Item as={Link} href="/tr">TR</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/en">EN</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/de">DE</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/fr">FR</NavDropdown.Item>
            </NavDropdown>

            <Button as={Link} href={L("find-showtime")} variant="warning" size="sm">
              {tNav("buy")}  {/* i18n: "Bilet Al" / "Buy Ticket" */}
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* MENÜ BAR */}
      <Navbar expand="lg" className="menu-dark">
        <Container>
          <div className="location-simple" onClick={() => setShowModal(true)}>
            <span className="location-icon">📍</span>
            <span className="location-text">{city}</span>
            <Link href="#" className="location-link">{tNav("buy")}</Link>
          </div>

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
        </Container>
      </Navbar>

      {/* Sinema Bul Modal (şimdilik TR metinler bırakıldı; istersen bunları da i18n'e taşıyalım) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Sinema Bul</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e)=>e.preventDefault()}>
            <Form.Control
              type="text"
              placeholder="Şehir, posta kodu veya sinema ara"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <Button variant="warning" className="w-100 mt-3" onClick={() => handleFindCinemas("search")}>
              Ara
            </Button>
          </Form>
          <Button variant="link" className="use-location-btn" onClick={() => handleFindCinemas("current")}>
            📍 Mevcut Konumumu Kullan
          </Button>
          <div className="cinema-results mt-3">
            {cinemas.length > 0 ? (
              <ul className="cinema-list">
                {cinemas.map((c, i) => (
                  <li key={i}>🎥 {c.name} <span className="distance">({c.distance})</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mt-2">Henüz sinema bulunamadı.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
