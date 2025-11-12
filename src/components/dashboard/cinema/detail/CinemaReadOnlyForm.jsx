"use client";

import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import "./cinemaDetailCard.scss";

export function CinemaReadOnlyForm({ cinema, tCinemas }) {
  if (!cinema)
    return <p className="cinema-no-data">{tCinemas("noCinemaData")}</p>;

  return (
    <div className="cinema-readonly-form">
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="3" className="cinema-form-label">
          {tCinemas("name")}:
        </Form.Label>
        <Col sm="9">
          <Form.Control
            value={cinema.name || ""}
            readOnly
            className="cinema-form-control"
          />
        </Col>
      </Form.Group>

      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="3" className="cinema-form-label">
          Slug:
        </Form.Label>
        <Col sm="9">
          <Form.Control
            value={cinema.slug || ""}
            readOnly
            className="cinema-form-control"
          />
        </Col>
      </Form.Group>

      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="3" className="cinema-form-label">
          {tCinemas("country")}:
        </Form.Label>
        <Col sm="9">
          <Form.Control
            value={cinema.city?.countryMiniResponse?.name || ""}
            readOnly
            className="cinema-form-control"
          />
        </Col>
      </Form.Group>

      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="3" className="cinema-form-label">
          {tCinemas("city")}:
        </Form.Label>
        <Col sm="9">
          <Form.Control
            value={cinema.city?.name || ""}
            readOnly
            className="cinema-form-control"
          />
        </Col>
      </Form.Group>
    </div>
  );
}
