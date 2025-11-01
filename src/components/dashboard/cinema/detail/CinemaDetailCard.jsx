"use client";
import { Card } from "react-bootstrap";

export default function CinemaDetailCard({ cinema }) {
  return (
    <Card className="shadow-sm rounded-4">
      <Card.Img variant="right" src={cinema?.imageUrl} />
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h3 className="fw-bold mb-1">{cinema.name}</h3>
            <p className="text-muted mb-2">{cinema.slug}</p>
            <p>
              <strong>City:</strong> {cinema.city?.name} (
              {cinema.city?.countryMiniResponse?.name})
            </p>
            <small className="text-secondary">
              Created: {new Date(cinema.createdAt).toLocaleString()}
              <br />
              Updated: {new Date(cinema.updatedAt).toLocaleString()}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
