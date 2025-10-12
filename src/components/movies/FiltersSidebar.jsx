"use client";
import { useState, useEffect } from "react";
import { Offcanvas, Button, Form, Row, Col } from "react-bootstrap";
import { Slider } from "primereact/slider";
import { getGenres } from "@/services/movie-service";

const STATUSES = ["COMING_SOON", "IN_THEATERS", "PRESALE"];
const SPECIAL_HALLS = ["IMAX", "4DX", "VIP", "Standard"];

export default function FiltersSidebar({ show, onClose, onApply }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [status, setStatus] = useState("");
  const [ratingRange, setRatingRange] = useState([0, 10]);
  const [releaseDate, setReleaseDate] = useState("");
  const [specialHall, setSpecialHall] = useState("");

  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
  }, []);

  const handleApply = () => {
    onApply({
      genre: selectedGenres,
      status,
      minRating: ratingRange[0],
      maxRating: ratingRange[1],
      releaseDate: releaseDate || null,
      specialHalls: specialHall || null,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedGenres([]);
    setStatus("");
    setRatingRange([0, 10]);
    setReleaseDate("");
    setSpecialHall("");
    onApply({});
  };

  return (
    <Offcanvas
  show={show}
  onHide={onClose}
  responsive="lg"
  placement="start"
  backdrop="true"
  className="bg-dark text-light p-3"
>
      <Offcanvas.Header closeButton closeVariant="white">
        <Offcanvas.Title className="text-warning fw-bold">Filter Movies</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form>
          {/* Genre */}
          <Form.Group className="mb-3">
            <Form.Label>Genre</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {genres.map((g) => (
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
            </div>
          </Form.Group>

          {/* Status */}
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Rating Range */}
          <Form.Group className="mb-3">
            <Form.Label>Rating: {ratingRange[0]} - {ratingRange[1]}</Form.Label>
            <Slider
              value={ratingRange}
              onChange={(e) => setRatingRange(e.value)}
              range
              step={0.1}
              min={0}
              max={10}
            />
          </Form.Group>

          {/* Release Date */}
          <Form.Group className="mb-3">
            <Form.Label>Release Date (after)</Form.Label>
            <Form.Control
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
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
      </Offcanvas.Body>
    </Offcanvas>
  );
}
