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
import { Button as PrimeButton } from "primereact/button";

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
        const filtered = (data || []).filter(
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
    if (!newCityName.trim()) {
      Swal.fire("Error", "City name required", "error");
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

      // Normalize API response
      const newCity = res.data.returnBody;
      console.log(res);
      const finalCity = {
        id: newCity.id,
        name: newCity.name ?? newCity.title ?? newCityName,
        countryMiniResponse: newCity.countryMiniResponse ?? {
          id: selectedCountryId,
        },
      };

      // Update local city list
      setCities((prev) => [...prev, finalCity]);

      // Set the new city as selected
      onCityChange(finalCity.id);

      Swal.fire("Success", "City added successfully", "success");

      // Reset input and close add mode
      setNewCityName("");
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding city:", err);
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Form.Label className="fw-semibold">City</Form.Label>
        {!isAdding && (
          <PrimeButton
            className="p-0"
            link
            label="Add"
            icon={"pi pi-plus"}
            onClick={() => setIsAdding(true)}
            disabled={!selectedCountryId}
          />
        )}
      </div>

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
