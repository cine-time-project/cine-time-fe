"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button, Col, Form, InputGroup, Row, Spinner, Pagination } from "react-bootstrap";
import NearbyCinemaCard from "./NearbyCinemaCard";
import { useTranslations } from "next-intl";

// Hook to recenter map when coordinates change
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

// Helper to normalize URLs
const normalizeURL = (url) =>
  url ? (url.startsWith("http") ? url : `https://${url}`) : null;

export default function NearbyCinemasLeaflet({ propCity }) {
  const tCinemas = useTranslations("cinemas");

  // Leaflet & user location state
  const [coords, setCoords] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [userIcon, setUserIcon] = useState(null);

  // Search input
  const [searchCity, setSearchCity] = useState(propCity || "");

  // Cinemas & loading
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(cinemas.length / itemsPerPage);
  const paginatedCinemas = cinemas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on new search
  useEffect(() => {
    setCurrentPage(1);
  }, [cinemas]);

  // Setup Leaflet icons and user marker
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Default Leaflet marker
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    // Red marker for user location
    const redIcon = new L.Icon({
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
    setUserIcon(redIcon);

    // Get user location for optional "Find Around Me"
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const position = [coords.latitude, coords.longitude];
          setUserCoords(position);
          setCoords(position); // initial map center
        },
        () => console.warn("User location permission denied")
      );
    }
  }, []);

  // Convert city name to coordinates
  const getCoordsByCity = async (cityName) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&limit=1`
    );
    const data = await res.json();
    if (data?.length > 0)
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  };

  // Load cinemas from Overpass API
  const loadNearbyCinemas = async (lat, lon) => {
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
          const address =
            (tags["addr:street"] || "") +
              (tags["addr:housenumber"]
                ? " " + tags["addr:housenumber"]
                : "") ||
            tags.address ||
            null;
          return {
            id: c.id,
            name: tags.name || "İsimsiz Sinema",
            website,
            lat: c.lat,
            lon: c.lon,
            address,
            operator: tags.operator || null,
            phone: tags.phone || null,
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

  // Handle user-triggered search
  const handleSearch = async () => {
    if (!searchCity) return;
    const newCoords = await getCoordsByCity(searchCity);
    if (!newCoords) return alert(tCinemas("noCity"));
    setCoords(newCoords);
    await loadNearbyCinemas(newCoords[0], newCoords[1]);
  };

  // Handle "Find Around Me" button
  const handleFindCurrent = async () => {
    if (!userCoords) return;
    setSearchCity(""); // clear input if needed
    setCoords(userCoords);
    await loadNearbyCinemas(userCoords[0], userCoords[1]);
  };

  return (
    <div className="space-y-4">
      {/* Search input + buttons */}
      <div
        className="p-3 border rounded bg-light"
        style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
      >
        <InputGroup className="d-flex flex-column flex-md-row gap-2">
          <Form.Control
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder={tCinemas("searchCity")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} variant="warning">
            {tCinemas("search")}
          </Button>
          <Button onClick={handleFindCurrent} variant="secondary">
            {tCinemas("findAround")}
          </Button>
        </InputGroup>
      </div>

      {/* Loading / no results / results */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="text-muted mt-2">{tCinemas("cinemasLoading")}</p>
        </div>
      ) : cinemas.length === 0 ? (
        <p className="text-center text-muted">{tCinemas("noCinemaYet")}</p>
      ) : (
        <>
          <Row className="g-4 mb-3">
            {paginatedCinemas.map((c) => (
              <Col key={c.id} xl={3} md={4} sm={6}>
                <NearbyCinemaCard cinema={c} normalizedURL={normalizeURL(c.website)} />
              </Col>
            ))}
          </Row>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mb-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx}
                    active={currentPage === idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Map display */}
      {coords && userIcon && (
        <MapContainer
          center={coords}
          zoom={13}
          style={{ height: 400, width: "100%", borderRadius: "12px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap coords={coords} />
          {userCoords && (
            <Marker position={userCoords} icon={userIcon}>
              <Popup>📍 Buradasın</Popup>
            </Marker>
          )}
          {cinemas.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lon]}>
              <Popup>
                🎬 <b>{c.name}</b>
                <br />
                {c.address && <>🏠 {c.address}<br /></>}
                {c.operator && <>👤 {c.operator}<br /></>}
                {c.phone && <>📞 {c.phone}<br /></>}
                {c.website && (
                  <>
                    🌐{" "}
                    <a
                      href={normalizeURL(c.website)}
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
