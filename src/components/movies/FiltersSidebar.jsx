"use client";
import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { Slider } from "primereact/slider";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { getGenres } from "@/services/movie-service";
import { useTranslations } from "next-intl";

// Constants for dropdown selections
const STATUSES = ["COMING_SOON", "IN_THEATERS", "PRESALE"];
const SPECIAL_HALLS = ["IMAX", "4DX", "VIP", "Standard"];

export default function FiltersSidebar({ filters, onChange }) {
  const t = useTranslations("movies");

  // --- Local States ---
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

  // --- Fetch genres once on mount ---
  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
  }, []);

  // --- Validate release date format (YYYY-MM-DD) ---
  const handleReleaseDateChange = (e) => {
    const value = e.target.value;
    setReleaseDate(value);

    if (!value) {
      setReleaseDateError("");
      return;
    }

    // Simple date validation
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      setReleaseDateError(t("invalidDate"));
    } else {
      setReleaseDateError("");
    }
  };

  // --- Apply filters ---
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

  // --- Clear all filters ---
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
    <Form>
      {/* 🎭 Genre Selection (Button-style checkboxes) */}
      <Form.Group className="mb-3">
        <Form.Label>{t("genres")}</Form.Label>
        <div className="d-flex flex-wrap gap-2">
          {genres.map((g) => {
            const isSelected = selectedGenres.includes(g);
            return (
              <label
                key={g}
                className={`btn btn-sm border rounded-pill px-3 py-1 d-flex align-items-center ${
                  isSelected
                    ? "btn-warning text-dark border-primary"
                    : "btn-outline-secondary"
                }`}
                style={{
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
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

      {/* 🎬 Movie Status */}
      <Form.Group className="mb-3">
        <Form.Label>{t("statusLabel")}</Form.Label>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t("all")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* ⭐ Rating Range */}
      <Form.Group className="mb-3">
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
        />
      </Form.Group>

      {/* 📅 Release Date */}
      <Form.Group className="mb-3">
        <Form.Label>{t("releaseDateAfter")}</Form.Label>
        <Form.Control
          type="date"
          value={releaseDate}
          onChange={handleReleaseDateChange}
          isInvalid={!!releaseDateError}
        />
        <Form.Control.Feedback type="invalid">
          {releaseDateError}
        </Form.Control.Feedback>
      </Form.Group>

      {/* 🏛️ Special Halls */}
      <Form.Group className="mb-3">
        <Form.Label>{t("specialHalls")}</Form.Label>
        <Form.Select
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

      {/* 🎯 Action Buttons */}
      <Row>
        <Col>
          <Button variant="secondary" onClick={handleClear} className="w-100">
            {t("clear")}
          </Button>
        </Col>
        <Col>
          <Button
            variant="primary"
            onClick={handleApply}
            className="w-100"
            disabled={!!releaseDateError}
          >
            Apply
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
