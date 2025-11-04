import { useState, useEffect } from "react";
import {
  Form,
  Button,
  InputGroup,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
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
    <Form.Group className="mb-3" as={Row}>
      <Form.Label column sm="2" className="mx-0">
        City
      </Form.Label>
      <Col sm="10">
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
              overlay={<Tooltip>Add new city</Tooltip>}
            >
              <Button
                variant="warning"
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
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Save</Tooltip>}
            >
              <Button variant="success" onClick={handleSaveCity}>
                <i className="pi pi-check"></i>
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Cancel</Tooltip>}
            >
              <Button variant="danger" onClick={() => setIsAdding(false)}>
                <i className="pi pi-times"></i>
              </Button>
            </OverlayTrigger>
          </InputGroup>
        )}
      </Col>
    </Form.Group>
  );
}
