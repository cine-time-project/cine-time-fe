"use client";

import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { CinemaImageReadOnlyView } from "./CinemaImageReadOnlyView";
import { CinemaReadOnlyForm } from "./CinemaReadOnlyForm";
import "./cinemaDetailCard.scss";

export function CinemaDetailCard({ cinema, tCinemas }) {
  return (
    <Card className="cinema-card">
      <Card.Header className="cinema-card-header">
        <span className="cinema-card-title">{tCinemas("cinemaInfo")}</span>
      </Card.Header>

      <Card.Body className="cinema-card-body">
        <Row>
          <Col md={6}>
            <CinemaImageReadOnlyView cinema={cinema} tCinemas={tCinemas} />
          </Col>
          <Col md={6}>
            <CinemaReadOnlyForm cinema={cinema} tCinemas={tCinemas} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
