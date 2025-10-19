import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function LocationFinder() {
  const [city, setCity] = useState("Lokasyon Alınıyor...");
  const [showModal, setShowModal] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [searchCity, setSearchCity] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Tarayıcı desteklemiyor");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          setCity(
            d.address.city ||
              d.address.town ||
              d.address.state ||
              "Bilinmeyen Konum"
          );
        } catch {
          setCity("Konum alınamadı");
        }
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
          const cityName =
            d.address.city ||
            d.address.town ||
            d.address.state ||
            "Bilinmeyen Konum";
          setSearchCity(cityName);
          loadDummyCinemas(cityName);
        } catch {}
      });
      return;
    }
    loadDummyCinemas(searchCity);
  };

  return (
    <>
      <div className="location-simple" onClick={() => setShowModal(true)}>
        <span className="location-icon">📍</span>
        <span className="location-text">{city}</span>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sinema Bul</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => e.preventDefault()}>
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