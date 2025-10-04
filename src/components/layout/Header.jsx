"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  NavDropdown,
  InputGroup,
  Modal,
  Button,
} from "react-bootstrap";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import "./Header.scss";

export default function Header() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Lokasyon Alınıyor...");
  const [showModal, setShowModal] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  // Sayfa yüklenince mevcut konumu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const cityName =
              data.address.city ||
              data.address.town ||
              data.address.state ||
              "Bilinmeyen Konum";
            setCity(cityName);
          } catch (error) {
            setCity("Konum alınamadı");
          }
        },
        () => setCity("Konum izni reddedildi")
      );
    } else {
      setCity("Tarayıcı desteklemiyor");
    }
  }, []);

  // Arama veya Mevcut Konum ile sinemaları getir
  const handleFindCinemas = async (type = "search") => {
    let location = searchCity;

    if (type === "current") {
      if (!navigator.geolocation) {
        alert("Tarayıcınız konum servisini desteklemiyor.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const cityName =
              data.address.city ||
              data.address.town ||
              data.address.state ||
              "Bilinmeyen Konum";
            setSearchCity(cityName);
            loadDummyCinemas(cityName);
          } catch (error) {
            console.error("Konumdan şehir bilgisi alınamadı:", error);
            alert("Konumdan şehir bilgisi alınamadı.");
          }
        },
        (error) => {
          console.error("Konum izni reddedildi veya hata:", error);
          alert("Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.");
        }
      );
    } else {
      loadDummyCinemas(location);
    }
  };

  // Test amaçlı sahte sinema verisi
  const loadDummyCinemas = (cityName) => {
    if (!cityName) return;
    const nearCinemas = [
      { name: `${cityName} CineCity`, distance: "1.2 km" },
      { name: `${cityName} MoviePark`, distance: "2.5 km" },
      { name: `${cityName} StarCinema`, distance: "3.8 km" },
    ];
    setCinemas(nearCinemas);
  };

  return (
    <>
      {/* TOPBAR */}
      <Navbar expand="lg" sticky="top" className="header-dark">
        <Container className="d-flex align-items-center justify-content-between">
          <Navbar.Brand as={Link} href="/" className="logo">
            <Image
              src="/images/cinetime-logo.png"
              alt="CineTime Logo"
              width={140}
              height={60}
              priority
              className="logo-img"
            />
          </Navbar.Brand>

          {/* Arama Kutusu */}
          <Form
            className="search-form mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Film ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroup.Text className="search-icon">🔍</InputGroup.Text>
            </InputGroup>
          </Form>

          {/* Hesap ve Dil */}
          <Nav className="right-actions">
            <NavDropdown title="👤 Hesabım" id="user-dropdown" align="end">
              <NavDropdown.Item as={Link} href="/login">
                Giriş Yap
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/register">
                Kayıt Ol
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/biletlerim">
                Biletlerim
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} href="/logout">
                Çıkış Yap
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="🌐 Dil" id="locale-dropdown" align="end">
              <NavDropdown.Item>Türkçe</NavDropdown.Item>
              <NavDropdown.Item>English</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* MENÜ BAR */}
      <Navbar expand="lg" className="menu-dark">
        <Container>
          <div className="location-simple" onClick={() => setShowModal(true)}>
            <span className="location-icon">📍</span>
            <span className="location-text">{city}</span>
            <Link href="#" className="location-link">
              Bilet Al
            </Link>
          </div>

          <Nav className="mx-auto">
            <Nav.Link
              as={Link}
              href="/"
              className={isActive("/") ? "active" : ""}
            >
              Anasayfa
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/filmler"
              className={isActive("/filmler") ? "active" : ""}
            >
              Filmler
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/vizyondakiler"
              className={isActive("/vizyondakiler") ? "active" : ""}
            >
              Vizyondakiler
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/yakinda"
              className={isActive("/yakinda") ? "active" : ""}
            >
              Yakında
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/sinemalar"
              className={isActive("/sinemalar") ? "active" : ""}
            >
              Sinemalar
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/kampanyalar"
              className={isActive("/kampanyalar") ? "active" : ""}
            >
              Kampanyalar
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/etkinlikler"
              className={isActive("/etkinlikler") ? "active" : ""}
            >
              Etkinlikler
            </Nav.Link>

           <Nav.Link
              as={Link}
              href="/contact"
              className={isActive("/contact") ? "active" : ""}
            >
              Contact
            </Nav.Link>

            <Nav.Link
              as={Link}
              href="/favorilerim"
              className={isActive("/favorilerim") ? "active" : ""}
            >
              ⭐ Favorilerim
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* 🎬 Sinema Bul Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sinema Bul</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              placeholder="Şehir, posta kodu veya sinema ara"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <Button
              variant="warning"
              className="w-100 mt-3"
              onClick={() => handleFindCinemas("search")}
            >
              Ara
            </Button>
          </Form>

          <Button
            variant="link"
            className="use-location-btn"
            onClick={() => handleFindCinemas("current")}
          >
            📍 Mevcut Konumumu Kullan
          </Button>

          <div className="cinema-results mt-3">
            {cinemas.length > 0 ? (
              <ul className="cinema-list">
                {cinemas.map((c, i) => (
                  <li key={i}>
                    🎥 {c.name} <span className="distance">({c.distance})</span>
                  </li>
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
