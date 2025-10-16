"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Marker ikon düzeltmesi (Leaflet + Next.js uyumu)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
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
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

// 🌐 URL formatını güvenli hale getir
const normalizeURL = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
};

export default function NearbyCinemasMap() {
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState("Lokasyon Alınıyor...");
  const [cinemas, setCinemas] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧭 Kullanıcı konumunu al
  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Tarayıcı desteklemiyor");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        setCoords(position);
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
          await loadNearbyCinemas(coords.latitude, coords.longitude);
        } catch {
          setCity("Konum alınamadı");
        }
      },
      () => setCity("Konum izni reddedildi")
    );
  }, []);

  // 📍 Şehir adına göre koordinat al
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

  // 🎥 Yakındaki sinemaları OSM’den getir
  const loadNearbyCinemas = async (latitude, longitude) => {
    setLoading(true);
    try {
      const query = `
        [out:json];
        node
          [amenity=cinema]
          (around:5000,${latitude},${longitude});
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
          // 🎞️ Website veya alternatif sosyal medya linklerini topla
          const website =
            tags.website ||
            tags["contact:website"] ||
            tags.url ||
            tags.facebook ||
            tags.instagram ||
            null;

          return {
            id: c.id,
            name: tags.name || "İsimsiz Sinema",
            website,
            lat: c.lat,
            lon: c.lon,
            distance: getDistanceKm(latitude, longitude, c.lat, c.lon),
          };
        });
        setCinemas(found);
      } else {
        setCinemas([]);
      }
    } catch (err) {
      console.error("Sinema verisi alınamadı:", err);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Şehir araması
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

  // 📍 Mevcut konuma göre arama
  const handleFindCurrent = async () => {
    if (!coords) return;
    await loadNearbyCinemas(coords[0], coords[1]);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        🎬 Yakındaki Sinemalar
      </h2>

      {/* 🔍 Arama alanı */}
      <div className="flex flex-col md:flex-row items-center gap-2">
        <input
          type="text"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          placeholder="Şehir ara..."
          className="border rounded-xl p-2 w-full md:w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          🔍 Ara
        </button>
        <button
          onClick={handleFindCurrent}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        >
          📍 Mevcut Konumda Bul
        </button>
      </div>

      <p className="text-gray-600">
        Konum: <b>{city}</b>
      </p>

      {/* 🎞️ Sinema listesi */}
      {loading ? (
        <p className="text-center text-gray-500">Sinemalar yükleniyor...</p>
      ) : cinemas.length === 0 ? (
        <p className="text-center text-gray-500">
          Henüz sinema bulunamadı. Arama yapmayı deneyin.
        </p>
      ) : (
        <div className="space-y-1">
          {cinemas.map((c) => (
            <div
              key={c.id}
              className="p-2 border rounded-xl flex justify-between items-center hover:bg-gray-50 transition"
            >
              {c.website ? (
                <a
                  href={normalizeURL(c.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {c.name}
                </a>
              ) : (
                <span className="text-gray-800">{c.name}</span>
              )}
              <span className="text-sm text-gray-500">{c.distance} km</span>
            </div>
          ))}
        </div>
      )}

      {/* 🗺️ Harita */}
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

          {/* 📍 Kullanıcı konumu */}
          <Marker position={coords}>
            <Popup>📍 Buradasın</Popup>
          </Marker>

          {/* 🎬 Sinemalar */}
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
