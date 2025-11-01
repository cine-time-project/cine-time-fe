import { useState, useEffect } from "react";
import {
  Form,
  Button,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { listAllCities, addCity } from "@/action/city-actions";

/**
 * CitySelect
 * ----------
 * Admin formu için city seçimi ve inline ekleme desteği.
 * Country değiştiğinde dropdown update edilir.
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

      // Reload cities for selected country
      const data = await listAllCities();
      const filtered = data.filter(
        (c) => c.countryMiniResponse?.id === selectedCountryId
      );
      setCities(filtered);

      onCityChange(newCity.id); // select the newly added city
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
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Add New City</Tooltip>}
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
      ) : (
        <InputGroup>
          <Form.Control
            className="bg-warning-subtle"
            placeholder="Enter new city"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
          />
          <OverlayTrigger placement="bottom" overlay={<Tooltip>Save</Tooltip>}>
            <Button variant="success" onClick={handleSaveCity}>
              <i className="pi pi-check"></i>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Cancel</Tooltip>}
          >
            <Button
              variant="outline-secondary"
              onClick={() => setIsAdding(false)}
            >
              <i className="pi pi-times"></i>
            </Button>
          </OverlayTrigger>
        </InputGroup>
      )}
    </div>
  );
}
