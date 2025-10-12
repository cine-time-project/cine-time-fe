"use client";
import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { Slider } from "primereact/slider"; // PrimeReact slider
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { getGenres } from "@/services/movie-service";

const STATUSES = ["COMING_SOON", "IN_THEATERS", "PRESALE"];
const SPECIAL_HALLS = ["IMAX", "4DX", "VIP", "Standard"];
const GENRE_COLS = 2;

export default function FiltersSidebarContent({ filters, onChange }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(filters.genre || []);
  const [status, setStatus] = useState(filters.status || "");
  const [ratingRange, setRatingRange] = useState([
    filters.minRating || 0,
    filters.maxRating || 10,
  ]);
  const [releaseDate, setReleaseDate] = useState(filters.releaseDate || "");
  const [specialHall, setSpecialHall] = useState(filters.specialHalls || "");

  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
  }, []);

  const handleApply = () => {
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
    setSpecialHall("");
    onChange({});
  };

  // Split genres into columns
  const splitGenres = (arr, n) => {
    const perCol = Math.ceil(arr.length / n);
    return Array.from({ length: n }, (_, i) =>
      arr.slice(i * perCol, (i + 1) * perCol)
    );
  };
  const genreColumns = splitGenres(genres, GENRE_COLS);

  return (
    <Form>
      {/* Genre */}
      <Form.Group className="mb-3">
        <Form.Label>Genre</Form.Label>
        <Row>
          {genreColumns.map((colGenres, colIdx) => (
            <Col key={colIdx}>
              {colGenres.map((g) => (
                <Form.Check
                  key={g}
                  type="checkbox"
                  label={g}
                  checked={selectedGenres.includes(g)}
                  onChange={(e) =>
                    setSelectedGenres((prev) =>
                      e.target.checked
                        ? [...prev, g]
                        : prev.filter((x) => x !== g)
                    )
                  }
                />
              ))}
            </Col>
          ))}
        </Row>
      </Form.Group>

      {/* Status */}
      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Rating (PrimeReact Slider) */}
      <Form.Group className="mb-3">
        <Form.Label>
          Rating: {ratingRange[0]} - {ratingRange[1]}
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

      {/* Release Date */}
      <Form.Group className="mb-3">
        <Form.Label>Release Date (after)</Form.Label>
        <Form.Control
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)} // value zaten yyyy-MM-dd formatında
        />
      </Form.Group>

      {/* Special Halls */}
      <Form.Group className="mb-3">
        <Form.Label>Special Halls</Form.Label>
        <Form.Select
          value={specialHall}
          onChange={(e) => setSpecialHall(e.target.value)}
        >
          <option value="">All</option>
          {SPECIAL_HALLS.map((hall) => (
            <option key={hall} value={hall}>
              {hall}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Buttons */}
      <Row>
        <Col>
          <Button variant="secondary" onClick={handleClear} className="w-100">
            Clear
          </Button>
        </Col>
        <Col>
          <Button variant="primary" onClick={handleApply} className="w-100">
            Apply
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
