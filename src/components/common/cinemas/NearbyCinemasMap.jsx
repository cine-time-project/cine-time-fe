"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SectionTitle from "../SectionTitle";
import { Button, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";

// Standart Leaflet marker ayarı
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Kırmızı kullanıcı marker’ı
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

// Mesafe hesaplama (Haversine)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

// URL normalize
const normalizeURL = (url) =>
  url ? (url.startsWith("http") ? url : `https://${url}`) : null;

export default function NearbyCinemasMap() {
  const [coords, setCoords] = useState(null); // Harita merkezi
  const [userCoords, setUserCoords] = useState(null); // Gerçek kullanıcı konumu
  const [city, setCity] = useState("Lokasyon Alınıyor...");
  const [cinemas, setCinemas] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(false);

  // Kullanıcı konumu
  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Tarayıcı desteklemiyor");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        setUserCoords(position);
        setCoords(position); // harita başlangıçta kullanıcı
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
          setCity(cityName);
          await loadNearbyCinemas(coords.latitude, coords.longitude, position);
        } catch {
          setCity("Konum alınamadı");
        }
      },
      () => setCity("Konum izni reddedildi")
    );
  }, []);

  const getCoordsByCity = async (cityName) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&limit=1`
    );
    const data = await res.json();
    if (data?.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  };

  // Sinemaları yükleme, mesafe kullanıcı konumuna göre
  const loadNearbyCinemas = async (lat, lon, userPos = userCoords) => {
    setLoading(true);
    try {
      const query = `
        [out:json];
        node
          [amenity=cinema]
          (around:5000,${lat},${lon});
        out tags center;
      `;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await res.json();
      if (data.elements?.length > 0) {
        const found = data.elements.map((c) => {
          const tags = c.tags || {};
          const website =
            tags.website ||
            tags["contact:website"] ||
            tags.url ||
            tags.facebook ||
            tags.instagram ||
            null;
          const distance = userPos
            ? getDistanceKm(userPos[0], userPos[1], c.lat, c.lon)
            : null;
          return {
            id: c.id,
            name: tags.name || "İsimsiz Sinema",
            website,
            lat: c.lat,
            lon: c.lon,
            distance,
          };
        });
        setCinemas(found);
      } else setCinemas([]);
    } catch (err) {
      console.error(err);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCity) return;
    const newCoords = await getCoordsByCity(searchCity);
    if (!newCoords) {
      alert("Şehir bulunamadı!");
      return;
    }
    setCoords(newCoords);
    setCity(searchCity);
    await loadNearbyCinemas(newCoords[0], newCoords[1]);
  };

  const handleFindCurrent = async () => {
    if (!userCoords) return;
    setCoords(userCoords);
    await loadNearbyCinemas(userCoords[0], userCoords[1]);
  };

  return (
    <div className="p-4 space-y-4">
      <SectionTitle> Daha fazlasını bulun</SectionTitle>

      {/* Arama alanı */}
      <InputGroup  className="flex flex-col md:flex-row items-center gap-2">
        <Form.Control
          type="text"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          placeholder="Şehir ara..."
          
        />
        <Button
          onClick={handleSearch}
        >
          🔍 Ara
        </Button>
        <Button
          onClick={handleFindCurrent}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        >
          📍 Mevcut Konumda Bul
        </Button>
      </InputGroup>

      <p className="text-gray-600">
        Konum: <b>{city}</b>
      </p>

      {/* Sinema Listesi */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Sinemalar yükleniyor...</p>
        </div>
      ) : cinemas.length === 0 ? (
        <p className="text-center text-muted">Henüz sinema bulunamadı.</p>
      ) : (
        <Row className="g-4 mb-5">
          {cinemas.map((c) => (
            <Col key={c.id} md={4} sm={6}>
              <Card className="shadow-sm h-100 border-0 rounded-4">
                <Card.Body>
                  <Card.Title className="text-primary fw-bold">
                    {c.website ? (
                      <a
                        href={normalizeURL(c.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-primary"
                      >
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    <i className="pi pi-map-marker text-danger me-1" />
                    {c.distance} km uzaklıkta
                  </Card.Text>
                  {c.website && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      href={normalizeURL(c.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="pi pi-globe me-1" />
                      Web Sitesi
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Harita */}
      {coords && (
        <MapContainer
          center={coords}
          zoom={13}
          style={{ height: "400px", width: "100%", borderRadius: "12px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap coords={coords} />

          {/* Kullanıcı konumu kırmızı marker */}
          {userCoords && (
            <Marker position={userCoords} icon={userIcon}>
              <Popup>📍 Buradasın</Popup>
            </Marker>
          )}

          {/* Sinema markerları */}
          {cinemas.map((cinema) => (
            <Marker key={cinema.id} position={[cinema.lat, cinema.lon]}>
              <Popup>
                🎬 <b>{cinema.name}</b>
                <br />
                {cinema.distance} km uzaklıkta
                {cinema.website && (
                  <>
                    <br />
                    🌐{" "}
                    <a
                      href={normalizeURL(cinema.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Web sitesine git
                    </a>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
