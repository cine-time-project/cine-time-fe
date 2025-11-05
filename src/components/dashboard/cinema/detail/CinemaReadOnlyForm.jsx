"use client";

import React from "react";
import { Col, Form, Row } from "react-bootstrap";

/**
 * CinemaReadOnlyForm
 * ------------------
 * Displays cinema information in a read-only format.
 *
 * Props:
 *  - cinema: object (Cinema entity with name, slug, city, country info)
 */
export function CinemaReadOnlyForm({ cinema }) {
  if (!cinema) return <p>No cinema data available.</p>;

  return (
    <div className="p-4 h-100">
      {/* Cinema Name */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2" className="text-nowrap">
          Name:
        </Form.Label>
        <Col sm="10">
          <Form.Control value={cinema.name || ""} readOnly />
        </Col>
      </Form.Group>

      {/* Cinema Slug */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2" className="text-nowrap">
          Slug:
        </Form.Label>
        <Col sm="10">
          <Form.Control value={cinema.slug || ""} readOnly />
        </Col>
      </Form.Group>

      {/* Country */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column  sm="2" xl className="text-nowrap">
          Country:
        </Form.Label>
        <Col sm="10">
          <Form.Control
            value={cinema.city?.countryMiniResponse?.name || ""}
            readOnly
          />
        </Col>
      </Form.Group>

      {/* City */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2" className="text-nowrap">
          City:
        </Form.Label>
        <Col sm="10">
          <Form.Control value={cinema.city?.name || ""} readOnly />
        </Col>
      </Form.Group>
    </div>
  );
}
