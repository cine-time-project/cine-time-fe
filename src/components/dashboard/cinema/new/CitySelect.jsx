import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { listAllCities, addCity } from "@/action/city-actions";

export function CitySelect({
  selectedCountryId,
  selectedCityId,
  onCityChange,
  token,
  onCityAdded,
}) {
  const [cities, setCities] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCityName, setNewCityName] = useState("");

  useEffect(() => {
    const loadCities = async () => {
      if (!selectedCountryId) {
        setCities([]);
        return;
      }
      try {
        const data = await listAllCities();
        const filtered = data.filter(
          (c) => c.countryMiniResponse?.id === selectedCountryId
        );
        setCities(filtered);
      } catch (err) {
        console.error("Error loading cities", err);
      }
    };
    loadCities();
  }, [selectedCountryId]);

  const handleSaveCity = async () => {
    if (!newCityName.trim()) return Swal.fire("Error", "City name required", "error");
    if (!selectedCountryId) return Swal.fire("Error", "Select a country first", "error");

    try {
      const res = await addCity({ name: newCityName, countryId: selectedCountryId }, token);
      const newCity = res.data;

      Swal.fire("Success", "City added successfully", "success");
      setCities((prev) => [...prev, newCity]);
      if (onCityAdded) onCityAdded(newCity);
      onCityChange(newCity.id);

      setNewCityName("");
      setIsAdding(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div>
      {!isAdding ? (
        <>
          <label className="form-label fw-semibold">City</label>
          <Dropdown
            value={selectedCityId}
            options={cities.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(e) => onCityChange(e.value)}
            placeholder="Select a city"
            className="w-100 mb-2"
            disabled={!selectedCountryId}
          />
          <Button
            label="Add new city"
            icon="pi pi-plus"
            link
            className="p-0 text-primary"
            onClick={() => setIsAdding(true)}
          />
        </>
      ) : (
        <div className="d-flex align-items-end gap-2">
          <div className="flex-grow-1">
            <label className="form-label fw-semibold">New City</label>
            <InputText
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              placeholder="Enter city name"
              className="w-100"
            />
          </div>
          <div className="pb-2">
            <Button
              icon="pi pi-check"
              label="Save"
              severity="success"
              onClick={handleSaveCity}
              className="me-2"
            />
            <Button
              icon="pi pi-times"
              label="Cancel"
              severity="secondary"
              onClick={() => setIsAdding(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
