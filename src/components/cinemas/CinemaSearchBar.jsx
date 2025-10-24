"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { getCoordsByCity } from "@/services/cinema-service";

export const CinemaSearchBar = ({ cityFilter, setCityFilter }) => {
  const tCinemas = useTranslations("cinemas");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setSearchInput(cityFilter || "");
  }, [cityFilter]);

  const handleSearch = useCallback(() => {
    if (!searchInput) return;
    setCityFilter(searchInput);
  }, [searchInput]);

  // const handleFindCurrent = () => {
  //   if (!navigator.geolocation) return alert(tCinemas("noLocPermission"));
  //   navigator.geolocation.getCurrentPosition(
  //     async ({ coords }) => {
  //       const position = [coords.latitude, coords.longitude];
  //       setCoords(position);
  //       try {
  //         const r = await fetch(
  //           `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
  //         );
  //         const d = await r.json();
  //         setCityFilter(
  //           d.address.city ||
  //             d.address.town ||
  //             d.address.state ||
  //             tCinemas("noLocation")
  //         );
  //       } catch {
  //         setCityFilter(tCinemas("noLocation"));
  //       }
  //     },
  //     () => setCityFilter(tCinemas("noLocPermission"))
  //   );
  // };

  return (
    <Container
      className="p-3 mt-5 border rounded bg-light "
      style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
    >
      <InputGroup className="d-flex flex-column flex-md-row gap-2">
        <Form.Control
          type="text"
          placeholder={tCinemas("searchCity")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button onClick={handleSearch} variant="warning">
          {tCinemas("search")}
        </Button>
        {/* <Button onClick={handleFindCurrent} variant="secondary">
          {tCinemas("findAround")}
        </Button> */}
      </InputGroup>
    </Container>
  );
};
