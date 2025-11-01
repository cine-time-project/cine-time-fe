import { useState, useEffect } from "react";
import { Form, Button, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import Swal from "sweetalert2";
import { listAllCities, addCity } from "@/action/city-actions";

/**
 * CitySelect
 * ----------
 * Admin formu için city seçimi ve inline ekleme desteği.
 * Country seçimine bağlı olarak dropdown update edilir.
 *
 * Props:
 *  - selectedCountryId: number | null
 *  - selectedCityId: number | null
 *  - onCityChange: (id: number) => void
 *  - token: string
 *  - onCityAdded?: (city) => void
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

  // Load cities when country changes
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
        console.error("Error loading cities:", err);
      }
    };
    loadCities();
  }, [selectedCountryId]);

  /**
   * Handle inline save new city
   * 1. Validates input & selected country
   * 2. Calls backend addCity
   * 3. Updates local state & parent callback
   */
  const handleSaveCity = async () => {
    if (!newCityName.trim())
      return Swal.fire("Error", "City name required", "error");
    if (!selectedCountryId)
      return Swal.fire("Error", "Select a country first", "error");

    try {
      const res = await addCity(
        { name: newCityName, countryId: selectedCountryId },
        token
      );
      const newCity = res.data;
      Swal.fire("Success", "City added successfully", "success");

      setCities((prev) => [...prev, newCity]);
      onCityChange(newCity.id);
      if (onCityAdded) onCityAdded(newCity);

      setNewCityName("");
      setIsAdding(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="mb-3">
      <Form.Label className="fw-semibold">City</Form.Label>
      {!isAdding ? (
        <>
          {/* Dropdown display mode */}
          <InputGroup>
            <Form.Select
              value={selectedCityId || ""}
              onChange={(e) => onCityChange(Number(e.target.value))}
              disabled={!selectedCountryId}
            >
              <option value="">Select a city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            {/* Inline add trigger */}
            <OverlayTrigger
              placement="bottom" // Tooltip position (top, right, bottom, left)
              overlay={
                <Tooltip id={`tooltip-new-cinema`}>Add New City</Tooltip>
              }
            >
              <Button
                variant="outline-success"
                onClick={() => setIsAdding(true)}
                disabled={!selectedCountryId}
              >
                <i className="pi pi-plus"></i>
              </Button>
            </OverlayTrigger>
          </InputGroup>
        </>
      ) : (
        <>
          {/* Inline add mode */}
          <InputGroup className="mt-2">
            <Form.Control
              placeholder="Enter new city"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
            />

            <Button variant="success" onClick={handleSaveCity}>
              <i className="pi pi-check"></i>
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setIsAdding(false)}
            >
              <i className="pi pi-times"></i>
            </Button>
          </InputGroup>
        </>
      )}
    </div>
  );
}
