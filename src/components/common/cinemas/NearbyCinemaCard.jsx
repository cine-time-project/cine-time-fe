"use client"
import React from "react";
import { Button, Card } from "react-bootstrap";

const NearbyCinemaCard = ({cinema, normalizedURL}) => {
  return (
    <Card className="shadow-sm h-100 border-0 rounded-4">
      <Card.Body>
        <Card.Title className="text-primary fw-bold">
          {cinema.website ? (
            <a
              href={normalizedURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-primary"
            >
              {cinema.name}
            </a>
          ) : (
            cinema.name
          )}
        </Card.Title>
        <Card.Text className="text-muted small mb-2">
          <i className="pi pi-map-marker text-danger me-1" />
          {cinema.distance} km uzaklıkta
        </Card.Text>
        {cinema.website && (
          <Button
            size="sm"
            variant="outline-primary"
            href= {normalizedURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="pi pi-globe me-1" />
            Web Sitesi
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default NearbyCinemaCard;
