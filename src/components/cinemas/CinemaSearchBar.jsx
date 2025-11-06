"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useTranslations } from "next-intl";
import styles from "./cinemaSearchBar.module.scss";

export const CinemaSearchBar = ({ cityFilter, setCityFilter }) => {
  const tCinemas = useTranslations("cinemas");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setSearchInput(cityFilter || "");
  }, [cityFilter]);

  const handleSearch = useCallback(() => {
    if (!searchInput) return;
    setCityFilter(searchInput);
  }, [searchInput, setCityFilter]);

  const handleClear = useCallback(() => {
    setSearchInput("");
    setCityFilter("");
  }, []);

  return (
    <Container className={styles.searchBarContainer}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={tCinemas("searchCity")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={styles.searchInput}
        />
        {searchInput && (
          <OverlayTrigger placement="bottom" overlay={<Tooltip>{tCinemas("clear")}</Tooltip>}>
            <Button variant="outline-info" onClick={handleClear}>
              <i className="pi pi-times"></i>
            </Button>
          </OverlayTrigger>
        )}
      </InputGroup>

      <Button
        onClick={handleSearch}
        className={styles.searchButton}
        disabled={!searchInput}
      >
        {tCinemas("search")}
      </Button>
    </Container>
  );
};
