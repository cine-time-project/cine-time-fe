"use client";

import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { createCinemaRequest, updateCinemaRequest } from "@/service/cinema-service";
import { CountrySelect } from "./CountrySelect";
import { CitySelect } from "./CitySelect";
import { CardGroup } from "./ui/CardGroup";
import { useRouter } from "next/navigation";
import { Col, Form, Row } from "react-bootstrap";

/**
 * CinemaForm
 * ----------
 * Handles creation and editing of cinema entities.
 * Integrates country/city selection with inline add support.
 *
 * Props:
 *  - cinema: Cinema object to edit, or empty for new
 *  - token: Authentication token for API calls
 *  - locale: Current locale for navigation
 *  - isEditMode: boolean indicating if the form is in edit mode
 */
export function CinemaForm({ cinema, token, locale, isEditMode }) {
  const router = useRouter();

  // -----------------------------
  // Local form state
  // -----------------------------
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [saving, setSaving] = useState(false); // loading indicator for submit

  // -----------------------------
  // Populate form fields from cinema object on mount / cinema change
  // -----------------------------
  useEffect(() => {
    if (cinema && Object.keys(cinema).length > 0) {
      setName(cinema.name || "");
      setSlug(cinema.slug || "");
      setSelectedCountryId(cinema.city?.countryMiniResponse?.id || "");
      setSelectedCityId(cinema.city?.id || "");
    } else {
      // New cinema: reset form
      setName("");
      setSlug("");
      setSelectedCountryId("");
      setSelectedCityId("");
    }
  }, [cinema]);

  // -----------------------------
  // Handle form submission
  // -----------------------------
  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (!trimmedName) return Swal.fire("Error", "Cinema name is required", "error");
    if (!selectedCityId) return Swal.fire("Error", "Please select a city", "error");

    setSaving(true); // show spinner, disable button
    try {
      if (isEditMode) {
        // Update existing cinema
        await updateCinemaRequest(
          { id: cinema.id, name: trimmedName, slug: trimmedSlug, cityId: selectedCityId },
          token
        );
        Swal.fire("Success", "Cinema updated successfully!", "success");
      } else {
        // Create new cinema
        const res = await createCinemaRequest(
          { name: trimmedName, slug: trimmedSlug, cityId: selectedCityId },
          token
        );
        const createdCinemaId = res?.returnBody?.id;
        Swal.fire("Success", "Cinema created successfully!", "success");

        // Navigate to new cinema detail page
        router.push(
          createdCinemaId
            ? `/${locale}/admin/cinemas/${createdCinemaId}`
            : `/${locale}/admin/cinemas/`
        );
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setSaving(false); // re-enable button
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <CardGroup title="Cinema Information">
      {/* Cinema Name Input */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2" className="mx-0">
          Name:
        </Form.Label>
        <Col sm="10">
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter cinema name"
            className="w-100"
          />
        </Col>
      </Form.Group>

      {/* Cinema Slug Input */}
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2" className="mx-0">
          Slug
        </Form.Label>
        <Col sm="10">
          <Form.Control
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter slug or leave blank"
            className="w-100"
          />
        </Col>
      </Form.Group>

      {/* Country Selector */}
      <CountrySelect
        selectedCountryId={selectedCountryId}
        onCountryChange={setSelectedCountryId}
        token={token}
      />

      {/* City Selector (depends on selected country) */}
      <div className="mt-4">
        <CitySelect
          selectedCountryId={selectedCountryId}
          selectedCityId={selectedCityId}
          onCityChange={setSelectedCityId}
          token={token}
        />
      </div>

      {/* Submit Button */}
      <div className="mt-4 d-flex justify-content-end">
        <Button
          label={isEditMode ? "Update Cinema" : "Create Cinema"}
          icon={saving ? "pi pi-spin pi-spinner" : isEditMode ? "pi pi-refresh" : "pi pi-check"}
          severity={isEditMode ? "info" : "success"}
          onClick={handleSubmit}
          className="px-4"
          disabled={saving}
        />
      </div>
    </CardGroup>
  );
}
