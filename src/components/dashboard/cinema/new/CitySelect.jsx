import { useState, useEffect } from "react";
import {
  Form,
  Button,
  InputGroup,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { listAllCities, addCity } from "@/action/city-actions";

/**
 * CitySelect Component
 * -------------------
 * A reusable dropdown component for selecting a city within a given country.
 * Supports inline addition of a new city if the desired one is not in the list.
 *
 * Props:
 *  - selectedCountryId: ID of the currently selected country
 *  - selectedCityId: ID of the currently selected city
 *  - onCityChange: Callback invoked when city selection changes
 *  - token: Authentication token for API requests
 */
export function CitySelect({ selectedCountryId, selectedCityId, onCityChange, token, tCinemas }) {
  // -----------------------------
  // Component state
  // -----------------------------
  const [cities, setCities] = useState([]); // List of cities filtered by country
  const [isAdding, setIsAdding] = useState(false); // Whether the inline add mode is active
  const [newCityName, setNewCityName] = useState(""); // Name of new city being added
  const [loadingCities, setLoadingCities] = useState(false); // Loading state for fetching cities
  const [savingCity, setSavingCity] = useState(false); // Loading state for saving a new city

  // -----------------------------
  // Fetch cities when country changes
  // -----------------------------
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedCountryId) {
        setCities([]); // Clear cities if no country selected
        return;
      }

      try {
        setLoadingCities(true);
        const data = await listAllCities();

        // Filter cities that belong to the selected country
        const filtered = (data || []).filter(
          (c) => c.countryMiniResponse?.id === selectedCountryId
        );
        setCities(filtered);
      } catch (err) {
        Swal.fire(`${tCinemas("error")}`, `${tCinemas("errorLoadingCities")}`, "error");
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [selectedCountryId]);

  // -----------------------------
  // Save a new city and update local state
  // -----------------------------
  const handleSaveCity = async () => {
    if (!newCityName.trim()) {
      Swal.fire(`${tCinemas("error")}`, `${tCinemas("cityNameRequired")}`, "error");
      return;
    }
    if (!selectedCountryId) {
      Swal.fire(`${tCinemas("error")}`, `${tCinemas("selectCountry")}`, "error");
      return;
    }

    try {
      setSavingCity(true);

      // Call API to add a new city
      const res = await addCity({ name: newCityName, countryId: selectedCountryId }, token);

      // Normalize API response
      const newCity = res.data.returnBody;
      const finalCity = {
        id: newCity.id,
        name: newCity.name ?? newCity.title ?? newCityName,
        countryMiniResponse: newCity.countryMiniResponse ?? { id: selectedCountryId },
      };

      // Update local city list and select the newly added city
      setCities((prev) => [...prev, finalCity]);
      onCityChange(finalCity.id);

      Swal.fire(`${tCinemas("cityAddedSuccess")}`, "success");

      // Reset input and exit add mode
      setNewCityName("");
      setIsAdding(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setSavingCity(false);
    }
  };

  // -----------------------------
  // Render JSX
  // -----------------------------
  return (
    <Form.Group className="mb-3" as={Row}>
      <Form.Label column sm="2" className="text-nowrap">
        {tCinemas("city")}
      </Form.Label>
      <Col sm="10">
        {isAdding ? (
          // -----------------------------
          // Inline Add Mode:
          // User can type a new city and either save or cancel
          // -----------------------------
          <InputGroup>
            <Form.Control
              className="bg-warning-subtle"
              placeholder={tCinemas("addNewCity")}
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              disabled={savingCity}
            />
            <OverlayTrigger placement="bottom" overlay={<Tooltip>{tCinemas("save")}</Tooltip>}>
              <Button variant="success" onClick={handleSaveCity} disabled={savingCity}>
                {savingCity ? <Spinner animation="border" size="sm" /> : <i className="pi pi-check"></i>}
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>{tCinemas("cancel")}</Tooltip>}>
              <Button variant="danger" onClick={() => setIsAdding(false)} disabled={savingCity}>
                <i className="pi pi-times"></i>
              </Button>
            </OverlayTrigger>
          </InputGroup>
        ) : (
          // -----------------------------
          // Standard Dropdown Mode:
          // User selects an existing city from the filtered list
          // -----------------------------
          <InputGroup>
            <Form.Select
              value={selectedCityId || ""}
              onChange={(e) => onCityChange(Number(e.target.value))}
              disabled={!selectedCountryId || loadingCities}
            >
              <option value="">
                {loadingCities ? tCinemas("loading") : tCinemas("selectCity")}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>{tCinemas("addNewCity")}</Tooltip>}>
              <Button
                variant="warning"
                onClick={() => setIsAdding(true)}
                disabled={!selectedCountryId || loadingCities}
              >
                <i className="pi pi-plus"></i>
              </Button>
            </OverlayTrigger>
          </InputGroup>
        )}
      </Col>
    </Form.Group>
  );
}
