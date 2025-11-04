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
import { listCountries, addCountry } from "@/action/city-actions";

/**
 * CountrySelect Component
 * ----------------------
 * A reusable dropdown component for selecting a country.
 * Supports inline addition of a new country if the desired one does not exist.
 *
 * Props:
 *  - selectedCountryId: ID of the currently selected country
 *  - onCountryChange: Callback invoked when country selection changes
 *  - token: Authentication token for API requests
 */
export function CountrySelect({ selectedCountryId, onCountryChange, token }) {
  // -----------------------------
  // Component state
  // -----------------------------
  const [countries, setCountries] = useState([]); // List of countries
  const [isAdding, setIsAdding] = useState(false); // Whether inline add mode is active
  const [newCountryName, setNewCountryName] = useState(""); // Name of new country being added
  const [loadingCountries, setLoadingCountries] = useState(true); // Loading state for fetching countries
  const [savingCountry, setSavingCountry] = useState(false); // Loading state for saving new country

  // -----------------------------
  // Fetch countries on mount
  // -----------------------------
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        const data = await listCountries();
        setCountries(data || []);
      } catch (err) {
        console.error("Error loading countries:", err);
        Swal.fire("Error", "Failed to load countries", "error");
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // -----------------------------
  // Save a new country
  // -----------------------------
  const handleSaveCountry = async () => {
    if (!newCountryName.trim()) {
      Swal.fire("Error", "Country name is required", "error");
      return;
    }

    try {
      setSavingCountry(true);

      const res = await addCountry({ name: newCountryName }, token);
      const newCountry = res.data.returnBody;

      // Update local country list
      setCountries((prev) => [...prev, newCountry]);

      // Select the newly added country
      onCountryChange(newCountry.id);

      Swal.fire("Success", "Country added successfully", "success");

      // Reset input and exit add mode
      setNewCountryName("");
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding country:", err);
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setSavingCountry(false);
    }
  };

  // -----------------------------
  // Render JSX
  // -----------------------------
  return (
    <Form.Group className="mb-3" as={Row}>
      <Form.Label column sm="2">
        Country
      </Form.Label>
      <Col sm="10">
        {isAdding ? (
          // -----------------------------
          // Inline Add Mode:
          // User can type a new country and either save or cancel
          // -----------------------------
          <InputGroup>
            <Form.Control
              className="bg-warning-subtle"
              placeholder="Enter new country"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              disabled={savingCountry}
            />
            <OverlayTrigger placement="bottom" overlay={<Tooltip>Save</Tooltip>}>
              <Button variant="success" onClick={handleSaveCountry} disabled={savingCountry}>
                {savingCountry ? <Spinner animation="border" size="sm" /> : <i className="pi pi-check"></i>}
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>Cancel</Tooltip>}>
              <Button variant="danger" onClick={() => setIsAdding(false)} disabled={savingCountry}>
                <i className="pi pi-times"></i>
              </Button>
            </OverlayTrigger>
          </InputGroup>
        ) : (
          // -----------------------------
          // Standard Dropdown Mode:
          // User selects an existing country from the list
          // -----------------------------
          <InputGroup>
            <Form.Select
              value={selectedCountryId || ""}
              onChange={(e) => onCountryChange(Number(e.target.value))}
              disabled={loadingCountries}
            >
              <option value="">
                {loadingCountries ? "Loading countries..." : "Select a country"}
              </option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>Add new country</Tooltip>}>
              <Button
                variant="warning"
                onClick={() => {
                  setIsAdding(true);
                  onCountryChange(""); // reset selection when adding new
                }}
                disabled={loadingCountries}
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
