import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button as PrimeButton } from "primereact/button";
import { InputGroup, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { listAllCities, addCity } from "@/action/city-actions";

/**
 * CitySelect Component
 * --------------------
 * Displays cities based on selected country and allows inline creation.
 * Uses React-Bootstrap for layout and PrimeReact for icons.
 *
 * Props:
 *  - selectedCountryId: number | null
 *  - selectedCityId: number | null
 *  - onCityChange: (id: number) => void
 *  - token: string
 *  - onCityAdded?: (city: object) => void
 */
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

  // Fetch cities for the selected country
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
        console.error("❌ Error loading cities:", err);
      }
    };
    loadCities();
  }, [selectedCountryId]);

  // Handle adding a new city
  const handleSaveCity = async () => {
    if (!newCityName.trim()) {
      Swal.fire("Error", "City name is required", "error");
      return;
    }
    if (!selectedCountryId) {
      Swal.fire("Error", "Select a country first", "error");
      return;
    }

    try {
      const res = await addCity(
        { name: newCityName, countryId: selectedCountryId },
        token
      );
      const newCity = res.data;

      Swal.fire("Success", "City added successfully", "success");
      setCities((prev) => [...prev, newCity]);
      if (onCityAdded) onCityAdded(newCity);
      onCityChange(newCity.id);

      // Reset UI state
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
          <PrimeButton
            label="Add new city"
            icon="pi pi-plus"
            link
            className="p-0 text-primary"
            onClick={() => setIsAdding(true)}
            disabled={!selectedCountryId}
          />
        </>
      ) : (
        <div className="mt-2">
          <label className="form-label fw-semibold">New City</label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Enter city name"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
            />
            <Button variant="success" onClick={handleSaveCity}>
              <i className="pi pi-check"></i>
            </Button>
            <Button variant="outline-secondary" onClick={() => setIsAdding(false)}>
              <i className="pi pi-times"></i>
            </Button>
          </InputGroup>
        </div>
      )}
    </div>
  );
}
