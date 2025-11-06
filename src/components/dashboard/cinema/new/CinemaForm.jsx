"use client";

import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import {
  createCinemaRequest,
  getDetailedCinema,
  updateCinemaRequest,
} from "@/service/cinema-service";
import { CountrySelect } from "./CountrySelect";
import { CitySelect } from "./CitySelect";
import { useRouter } from "next/navigation";
import { Card, Col, Form, Row } from "react-bootstrap";

/**
 * CinemaForm
 * -----------
 * Handles creation and editing of cinema entities.
 * Supports country/city selection with inline add support.
 *
 * Props:
 *  - cinema: Cinema object to edit (or undefined for new cinema)
 *  - token: Authentication token for API requests
 *  - locale: Current locale for routing
 *  - isEditMode: Boolean indicating if the form is in edit mode
 *  - setCinema: Callback to update parent state after edit
 */
export function CinemaForm({ cinema, token, locale, isEditMode, setCinema, tCinemas }) {
  const router = useRouter();

  // -----------------------------
  // Local form state
  // -----------------------------
  const [name, setName] = useState(""); // cinema name input
  const [slug, setSlug] = useState(""); // cinema slug input
  const [selectedCountryId, setSelectedCountryId] = useState(""); // country selector
  const [selectedCityId, setSelectedCityId] = useState(""); // city selector
  const [saving, setSaving] = useState(false); // loading indicator for submit

  // -----------------------------
  // Populate form fields from cinema prop when it changes
  // -----------------------------
  useEffect(() => {
    if (cinema) {
      setName(cinema.name || "");
      setSlug(cinema.slug || "");
      setSelectedCountryId(cinema.city?.countryMiniResponse?.id || "");
      setSelectedCityId(cinema.city?.id || "");
    }
  }, [cinema]);

  // -----------------------------
  // Handle form submission (create or update)
  // -----------------------------
  const handleSubmit = async () => {
    // Validation: token must exist
    if (!token) {
      return Swal.fire(`${tCinemas("error")}`, `${tCinemas("authTokenMissing")}`, "error");
    }
    // Validation: name must be filled
    if (!name.trim())
      return Swal.fire(`${tCinemas("error")}`, `${tCinemas("cinemaNameRequired")}`, "error");
    // Validation: city must be selected
    if (!selectedCityId)
      return Swal.fire(`${tCinemas("error")}`, `${tCinemas("selectCity")}`, "error");

    setSaving(true); // disable submit button and show spinner
    try {
      if (isEditMode) {
        // -----------------------------
        // Update existing cinema
        // -----------------------------
        await updateCinemaRequest(
          cinema.id,
          { name, slug, cityId: selectedCityId },
          token
        );

        Swal.fire(`${tCinemas("updateSuccessful")}`, "success");

        // Refresh parent state from backend after update
        const updated = await getDetailedCinema(cinema.id, token);
        setCinema(updated);
      } else {
        // -----------------------------
        // Create new cinema
        // -----------------------------
        const res = await createCinemaRequest(
          { name, slug, cityId: selectedCityId },
          token
        );
        Swal.fire("Success", "Cinema created successfully!", "success");

        // Navigate to the new cinema detail page
        const newId = res?.returnBody?.id;
        router.push(
          newId
            ? `/${locale}/admin/cinemas/${newId}?editMode=true`
            : `/${locale}/admin/cinemas/`
        );
      }
    } catch (err) {
      Swal.fire(`${tCinemas("error")}`, err.response?.data?.message || err.message, "error");
    } finally {
      setSaving(false); // re-enable button
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-4 h-100">
      {/* Cinema Name Input */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2">
          {tCinemas("name")}
        </Form.Label>
        <Col sm="10">
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tCinemas("enterName")}
          />
        </Col>
      </Form.Group>

      {/* Cinema Slug Input */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2">
          Slug
        </Form.Label>
        <Col sm="10">
          <Form.Control
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={tCinemas("enterSlug")}
          />
        </Col>
      </Form.Group>

      {/* Country selector with inline add support */}
      <CountrySelect
        selectedCountryId={selectedCountryId}
        onCountryChange={setSelectedCountryId}
        token={token}
        tCinemas={tCinemas}
      />

      {/* City selector, filtered by selected country */}
      <div>
        <CitySelect
          selectedCountryId={selectedCountryId}
          selectedCityId={selectedCityId}
          onCityChange={setSelectedCityId}
          token={token}
          tCinemas={tCinemas}
        />
      </div>

      {/* Submit button */}
      <div className="mt-4 d-flex justify-content-end">
        <Button
          label={isEditMode ? tCinemas("update") : tCinemas("create")}
          icon={
            saving
              ? "pi pi-spin pi-spinner" // show spinner when saving
              : isEditMode
              ? "pi pi-refresh"
              : "pi pi-check"
          }
          severity={isEditMode ? "info" : "success"}
          onClick={handleSubmit}
          className="px-4"
          disabled={saving} // prevent multiple submissions
        />
      </div>
    </div>
  );
}
