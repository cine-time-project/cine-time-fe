"use client";

import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { getCoordsByCity } from "@/services/cinema-service";

export const CinemaSearchBar = ({ setCoords, searchCity, setSearchCity, userCoords }) => {
  const tCinemas = useTranslations("cinemas");

  const handleSearch = async () => {
    if (!searchCity) return;
    const newCoords = await getCoordsByCity(searchCity);
    if (!newCoords) return alert(tCinemas("noCity"));
    setCoords(newCoords);
  };

  const handleFindCurrent = () => {
    if (!navigator.geolocation) return alert(tCinemas("noLocPermission"));
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        setCoords(position);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          setSearchCity(d.address.city || d.address.town || d.address.state || tCinemas("noLocation"));
        } catch {
          setSearchCity(tCinemas("noLocation"));
        }
      },
      () => setSearchCity(tCinemas("noLocPermission"))
    );
  };

  return (
    <div className="p-3 border rounded bg-light" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
      <InputGroup className="d-flex flex-column flex-md-row gap-2">
        <Form.Control
  type="text"
  value={searchCity}
  onChange={(e) => setSearchCity(e.target.value)} // sadece state günceller
  placeholder={tCinemas("searchCity")}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(); // sadece Enter basıldığında çalışır
    }
  }}
/>
<Button onClick={handleSearch} variant="warning">
  {tCinemas("search")}
</Button>
        <Button onClick={handleFindCurrent} variant="secondary">{tCinemas("findAround")}</Button>
      </InputGroup>
    </div>
  );
};
