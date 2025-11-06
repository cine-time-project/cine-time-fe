"use client";
import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { Slider } from "primereact/slider";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { getGenres } from "@/services/movie-service";
import { useTranslations } from "next-intl";

import styles from "./FiltersSidebar.module.scss";

const STATUSES = ["COMING_SOON", "IN_THEATERS", "PRESALE"];
const SPECIAL_HALLS = ["IMAX", "4DX", "VIP", "Standard"];

export default function FiltersSidebar({ filters, onChange }) {
  const t = useTranslations("movies");

  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(filters.genre || []);
  const [status, setStatus] = useState(filters.status || "");
  const [ratingRange, setRatingRange] = useState([
    filters.minRating || 0,
    filters.maxRating || 10,
  ]);
  const [releaseDate, setReleaseDate] = useState(filters.releaseDate || "");
  const [releaseDateError, setReleaseDateError] = useState("");
  const [specialHall, setSpecialHall] = useState(filters.specialHalls || "");

  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
  }, []);

  const handleReleaseDateChange = (e) => {
    const value = e.target.value;
    setReleaseDate(value);
    const date = new Date(value);
    if (value && isNaN(date.getTime())) setReleaseDateError(t("invalidDate"));
    else setReleaseDateError("");
  };

  const handleApply = () => {
    if (releaseDateError) return;
    onChange({
      genre: selectedGenres,
      status,
      minRating: ratingRange[0],
      maxRating: ratingRange[1],
      releaseDate: releaseDate || null,
      specialHalls: specialHall || null,
    });
  };

  const handleClear = () => {
    setSelectedGenres([]);
    setStatus("");
    setRatingRange([0, 10]);
    setReleaseDate("");
    setReleaseDateError("");
    setSpecialHall("");
    onChange({});
  };

  return (
    <Form className={styles.sidebar}>
      {/* 🎭 Genre Selection */}
      <Form.Group className="mb-4">
        <Form.Label>{t("genres")}</Form.Label>
        <div className={styles.genreButtons}>
          {genres.map((g) => {
            const isSelected = selectedGenres.includes(g);
            return (
              <label
                key={g}
                className={`${styles.genreBtn} ${
                  isSelected ? styles.genreBtnActive : ""
                }`}
              >
                {g}
                <input
                  type="checkbox"
                  value={g}
                  checked={isSelected}
                  onChange={(e) =>
                    setSelectedGenres((prev) =>
                      e.target.checked
                        ? [...prev, g]
                        : prev.filter((x) => x !== g)
                    )
                  }
                  className="d-none"
                />
              </label>
            );
          })}
        </div>
      </Form.Group>

      {/* 🎬 Status */}
      <Form.Group className="mb-4">
        <Form.Label>{t("statusLabel")}</Form.Label>
        <Form.Select
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("all")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* ⭐ Rating */}
      <Form.Group className="mb-4">
        <Form.Label>
          {t("rating")}: {ratingRange[0]} - {ratingRange[1]}
        </Form.Label>
        <Slider
          value={ratingRange}
          onChange={(e) => setRatingRange(e.value)}
          range
          min={0}
          max={10}
          step={1}
          className={styles.slider}
        />
      </Form.Group>

      {/* 📅 Release Date */}
      <Form.Group className="mb-4">
        <Form.Label>{t("releaseDateAfter")}</Form.Label>
        <Form.Control
          type="date"
          value={releaseDate}
          onChange={handleReleaseDateChange}
          isInvalid={!!releaseDateError}
          className={styles.input}
        />
        <Form.Control.Feedback type="invalid">
          {releaseDateError}
        </Form.Control.Feedback>
      </Form.Group>

      {/* 🏛️ Special Halls */}
      <Form.Group className="mb-4">
        <Form.Label>{t("specialHalls")}</Form.Label>
        <Form.Select
          className={styles.select}
          value={specialHall}
          onChange={(e) => setSpecialHall(e.target.value)}
        >
          <option value="">{t("all")}</option>
          {SPECIAL_HALLS.map((hall) => (
            <option key={hall} value={hall}>
              {hall}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* 🎯 Buttons */}
      <Row className="mt-4">
        <Col>
          <Button variant="secondary" onClick={handleClear} className={styles.clearBtn}>
            {t("clear")}
          </Button>
        </Col>
        <Col>
          <Button
            variant="primary"
            onClick={handleApply}
            className={styles.applyBtn}
            disabled={!!releaseDateError}
          >
            Apply
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
