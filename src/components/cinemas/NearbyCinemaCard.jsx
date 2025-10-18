"use client";
import React from "react";
import { Button, Card } from "react-bootstrap";

const NearbyCinemaCard = ({ cinema, normalizedURL }) => {
  return (
    <Card className="shadow-sm h-100 border-1 rounded-4 flex-row overflow-hidden">
      <Card.Img className="bg-dark" variant="left" src={"/images/cinetime-logo.png"} width={200} height={200}  />
      <Card.Body className="d-flex flex-column justify-content-between">
        <Card.Title className="text-muted">{cinema.name}</Card.Title>

        {/* Adres */}
        {cinema.address && (
          <Card.Text className="text-muted small mb-1">
            <i className="pi pi-home me-1" />
            {cinema.address}
          </Card.Text>
        )}
        {/* Operatör */}
        {cinema.operator && (
          <Card.Text className="text-muted small mb-1">
            <i className="pi pi-user me-1" />
            {cinema.operator}
          </Card.Text>
        )}
        {/* Telefon */}
        {cinema.phone && (
          <Card.Text className="text-muted small mb-1">
            <i className="pi pi-phone me-1" />
            {cinema.phone}
          </Card.Text>
        )}

        {/* Web sitesi butonu */}
        {cinema.website && (
          <Button
            size="sm"
            variant="warning"
            href={normalizedURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="pi pi-globe me-1" />
            Web Site
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default NearbyCinemaCard;
