"use client";
import { Card } from "react-bootstrap";

export default function CinemaDetailCard({ cinema }) {
  return (
    <Card className="p-0">
      <div className="row g-0">
        {" "}
        {/* g-0 ile gutter’ı kaldırıyoruz */}
        <div className="col-12 col-md-6">
          {" "}
          {/* mobilde tam, desktopta yarı */}
          <Card.Img
            src={cinema?.imageUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="col-12 col-md-6">
          {" "}
          {/* mobilde alt alta, desktopta yarı */}
          <Card.Body>
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
          </Card.Body>
        </div>
      </div>
    </Card>
  );
}
