"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Spinner } from "react-bootstrap";

/** Utility to normalize website URLs */
const normalizeURL = (url) =>
  url ? (url.startsWith("http") ? url : `https://${url}`) : null;

/** Small helper component to recenter map when coordinates change */
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

/** Utility: delay for X milliseconds */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * CinemaMap
 * Displays a Leaflet map with cinema markers
 * Props:
 *   - cinemas: array of cinema objects (may include lat/lon or just address)
 *   - initialCoords: optional [lat, lon] starting center
 *   - userCoords: optional [lat, lon] to mark user's location
 */
export default function CinemaMap({ cinemas = [], initialCoords = null, userCoords = null }) {
  const [coords, setCoords] = useState(initialCoords || null);
  const [resolvedCinemas, setResolvedCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIcon, setUserIcon] = useState(null);

  const prevCinemasRef = useRef(null);

  // Initialize leaflet icons only once
  useEffect(() => {
    if (typeof window === "undefined") return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

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
  }, []);

  /** 
   * Batch geocoding helper
   * - Splits list into small batches (3 by default)
   * - Waits between requests (Nominatim rate limit: 1 request/sec)
   */
  const batchGeocode = async (cinemasToGeocode, batchSize = 3, delayMs = 1000) => {
    const result = [];
    for (let i = 0; i < cinemasToGeocode.length; i += batchSize) {
      const batch = cinemasToGeocode.slice(i, i + batchSize);

      const geocodedBatch = await Promise.all(
        batch.map(async (cinema) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                cinema.address
              )}`
            );
            const data = await res.json();
            if (data && data[0]) {
              return {
                ...cinema,
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
              };
            }
          } catch (err) {
            console.warn("Geocoding failed:", err);
          }
          return cinema;
        })
      );

      result.push(...geocodedBatch);

      // Respect rate limits
      if (i + batchSize < cinemasToGeocode.length) {
        await sleep(delayMs);
      }
    }
    return result;
  };

  /** 
   * Main effect: handle geocoding and map centering 
   */
  useEffect(() => {
    const hasChanged =
      JSON.stringify(prevCinemasRef.current) !== JSON.stringify(cinemas);
    if (!hasChanged) return;
    prevCinemasRef.current = cinemas;

    let cancelled = false;
    setLoading(true);

    const processCinemas = async () => {
      if (!cinemas || cinemas.length === 0) {
        if (!cancelled) {
          setResolvedCinemas([]);
          setLoading(false);
        }
        return;
      }

      const withCoords = cinemas.filter((c) => c.lat && c.lon);
      const toGeocode = cinemas.filter(
        (c) => !c.lat && !c.lon && c.address
      );

      const geocoded = await batchGeocode(toGeocode, 3, 1000);
      const finalList = [...withCoords, ...geocoded];

      if (!cancelled) {
        setResolvedCinemas(finalList);

        // Pick first valid coordinate or user location as map center
        const firstWithCoords = finalList.find((c) => c.lat && c.lon);
        const center =
          userCoords && userCoords.length === 2
            ? userCoords
            : firstWithCoords
            ? [firstWithCoords.lat, firstWithCoords.lon]
            : initialCoords;

        if (center) setCoords(center);
        setLoading(false);
      }
    };

    processCinemas();

    return () => {
      cancelled = true;
    };
  }, [cinemas, userCoords, initialCoords]);

  if (loading || !coords)
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <p className="text-muted mt-2">Loading map...</p>
      </div>
    );

  return (
    <div className="space-y-4">
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

        {/* User marker */}
        {userCoords && userIcon && (
          <Marker position={userCoords} icon={userIcon}>
            <Popup>📍 You are here</Popup>
          </Marker>
        )}

        {/* Cinema markers */}
        {resolvedCinemas.map(
          (c) =>
            c.lat &&
            c.lon && (
              <Marker key={c.id} position={[c.lat, c.lon]}>
                <Popup>
                  🎬 <b>{c.name}</b>
                  <br />
                  {c.address && (
                    <>
                      🏠 {c.address}
                      <br />
                    </>
                  )}
                  {c.operator && (
                    <>
                      👤 {c.operator}
                      <br />
                    </>
                  )}
                  {c.phone && (
                    <>
                      📞 {c.phone}
                      <br />
                    </>
                  )}
                  {c.website && (
                    <>
                      🌐{" "}
                      <a
                        href={normalizeURL(c.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Visit website
                      </a>
                    </>
                  )}
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
}
