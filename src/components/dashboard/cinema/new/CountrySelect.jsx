import { useState, useEffect } from "react";
import { Form, Button, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import Swal from "sweetalert2";
import { listCountries, addCountry } from "@/action/city-actions";

/**
 * CountrySelect
 * -------------
 * Admin formu için country seçimi ve inline ekleme desteği.
 *
 * Props:
 *  - selectedCountryId: number | null
 *  - onCountryChange: (id: number) => void
 *  - token: string
 *  - onCountryAdded?: (country) => void
 */
export function CountrySelect({ selectedCountryId, onCountryChange, token, onCountryAdded }) {
  const [countries, setCountries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await listCountries();
        setCountries(data);
      } catch (err) {
        console.error("Error loading countries:", err);
      }
    };
    loadCountries();
  }, []);

  const handleSaveCountry = async () => {
    if (!newCountryName.trim()) {
      Swal.fire("Error", "Country name required", "error");
      return;
    }

    try {
      const res = await addCountry({ name: newCountryName }, token);
      const newCountry = res.data;
      Swal.fire("Success", "Country added", "success");

      // Reload countries and update dropdown
      const updatedCountries = await listCountries();
      setCountries(updatedCountries);

      // Set newly added country as selected
      onCountryChange(newCountry.id);
      if (onCountryAdded) onCountryAdded(newCountry);

      setNewCountryName("");
      setIsAdding(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="mb-3">
      <Form.Label className="fw-semibold">Country</Form.Label>
      {!isAdding ? (
        <InputGroup>
          <Form.Select
            value={selectedCountryId || ""}
            onChange={(e) => onCountryChange(Number(e.target.value))}
          >
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Add New Country</Tooltip>}
          >
            <Button variant="outline-success" onClick={() => setIsAdding(true)}>
              <i className="pi pi-plus"></i>
            </Button>
          </OverlayTrigger>
        </InputGroup>
      ) : (
        <InputGroup className="mt-2">
          <Form.Control
            placeholder="Enter new country"
            value={newCountryName}
            onChange={(e) => setNewCountryName(e.target.value)}
          />
          <Button variant="success" onClick={handleSaveCountry}>
            <i className="pi pi-check"></i>
          </Button>
          <Button variant="outline-secondary" onClick={() => setIsAdding(false)}>
            <i className="pi pi-times"></i>
          </Button>
        </InputGroup>
      )}
    </div>
  );
}
