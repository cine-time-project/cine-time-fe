"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useTranslations } from "next-intl";

export const CinemaSearchBar = ({ cityFilter, setCityFilter }) => {
  const tCinemas = useTranslations("cinemas");
  const [searchInput, setSearchInput] = useState("");

  // Sync with parent filter
  useEffect(() => {
    setSearchInput(cityFilter || "");
  }, [cityFilter]);

  // Trigger parent filter change
  const handleSearch = useCallback(() => {
    if (!searchInput) return;
    setCityFilter(searchInput);
  }, [searchInput, setCityFilter]);

  return (
    <Container
      className="p-3 mt-5 border rounded bg-light"
      style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
    >
      <InputGroup className="flex-md-row flex-column gap-2 w-100">
        <Form.Control
          type="text"
          placeholder={tCinemas("searchCity")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} variant="warning">
          {tCinemas("search")}
        </Button>
      </InputGroup>
    </Container>
  );
};
