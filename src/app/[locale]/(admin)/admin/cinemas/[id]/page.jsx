"use client";
import { useAuth } from "@/lib/auth/useAuth";
import React, { useEffect, useState } from "react";
import { Form, Button, Card, Row, Col, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { CountrySelect } from "@/components/dashboard/cinema/new/CountrySelect";
import { CitySelect } from "@/components/dashboard/cinema/new/CitySelect";
import { getDetailedCinema } from "@/service/cinema-service";

export default function AdminCinemaDetailPage({ params }) {
  const { id } = React.use(params);
  const { roles } = useAuth();

  const canEdit = roles?.includes("ADMIN");
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cinema, setCinema] = useState(null);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);

  // Fetch cinema on mount
  useEffect(() => {
    const loadCinema = async () => {
      try {
        const cinema = await getDetailedCinema(id, token);
        setCinema(cinema);
        setName(cinema.name);
        setImageUrl(cinema.imageUrl); //DB'den çekeceğimiz zaman cinema.cinemaImageUrl
        setSelectedCountryId(
          cinema.country?.id || cinema.city?.countryMiniResponse?.id
        );
        setSelectedCityId(cinema.city?.id || null);
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.cinema?.message || err.message,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    loadCinema();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim())
      return Swal.fire("Error", "Cinema name required", "error");
    if (!selectedCountryId)
      return Swal.fire("Error", "Country required", "error");
    if (!selectedCityId) return Swal.fire("Error", "City required", "error");

    try {
      setSaving(true);
      const payload = {
        id,
        name,
        cityId: selectedCityId,
        countryId: selectedCountryId,
        imageUrl,
      };
      await updateCinema(payload, token);
      Swal.fire("Success", "Cinema updated successfully", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Card className="shadow-sm p-4">
      <h4 className="fw-bold mb-3">Edit Cinema</h4>

      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Cinema Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter cinema name"
              />
            </Form.Group>

            <CountrySelect
              selectedCountryId={selectedCountryId}
              onCountryChange={(id) => {
                setSelectedCountryId(id);
                setSelectedCityId(null); // ülke değişince şehir resetlenir
              }}
              token={token}
            />

            <CitySelect
              selectedCountryId={selectedCountryId}
              selectedCityId={selectedCityId}
              onCityChange={setSelectedCityId}
              token={token}
            />
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              {imageUrl && (
                <div className="mb-2 text-center">
                  <img
                    src={imageUrl}
                    alt="Cinema"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <Form.Control
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter or paste image URL"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save Changes"}
          </Button>
        </div>
      </Form>
    </Card>
  );
}
