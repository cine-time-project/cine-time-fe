import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { createCinemaRequest } from "@/service/cinema-service";
import { CountrySelect } from "./CountrySelect";
import { CitySelect } from "./CitySelect";
import { CardGroup } from "./ui/CardGroup";

export function CinemaForm({ token }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  const handleSubmit = async () => {
    if (!name.trim())
      return Swal.fire("Error", "Cinema name required", "error");
    if (!selectedCityId) return Swal.fire("Error", "Select a city", "error");

    try {
      const res = await createCinemaRequest(
        { name, slug, cityId: selectedCityId },
        token
      );
      Swal.fire("Success", "Cinema created successfully!", "success");

      // reset form
      setName("");
      setSlug("");
      setSelectedCityId("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="container py-4 bg-secondary-subtle">
      <CardGroup title="Cinema Information">
        <div className="mb-3">
          <label className="form-label fw-semibold">Cinema Name</label>
          <InputText
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter cinema name"
            className="w-100"
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Slug (optional)</label>
          <InputText
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter slug or leave blank"
            className="w-100"
          />
        </div>
      </CardGroup>

      <CardGroup title="Location Details">
        <CountrySelect
          selectedCountryId={selectedCountryId}
          onCountryChange={setSelectedCountryId}
          token={token}
        />
        <div className="mt-4">
          <CitySelect
            selectedCountryId={selectedCountryId}
            selectedCityId={selectedCityId}
            onCityChange={setSelectedCityId}
            token={token}
          />
        </div>
      </CardGroup>

      <div className="text-end mt-3">
        <Button
          label="Create Cinema"
          icon="pi pi-check"
          severity="success"
          onClick={handleSubmit}
          className="px-4"
        />
      </div>
    </div>
  );
}
