import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button as PrimeButton } from "primereact/button";
import { InputGroup, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { listCountries, addCountry } from "@/action/city-actions";

/**
 * CountrySelect Component
 * -----------------------
 * Allows selecting an existing country or adding a new one inline.
 * Uses React-Bootstrap InputGroup for cleaner UI and PrimeReact for icons.
 *
 * Props:
 *  - selectedCountryId: number | null
 *  - onCountryChange: (id: number) => void
 *  - token: string
 *  - onCountryAdded?: (country: object) => void
 */
export function CountrySelect({ selectedCountryId, onCountryChange, token, onCountryAdded }) {
  const [countries, setCountries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await listCountries();
        setCountries(data);
      } catch (err) {
        console.error("❌ Error loading countries:", err);
      }
    };
    loadCountries();
  }, []);

  const handleSaveCountry = async () => {
    if (!newCountryName.trim()) {
      Swal.fire("Error", "Country name is required", "error");
      return;
    }

    try {
      const res = await addCountry({ name: newCountryName }, token);
      const newCountry = res.data;

      Swal.fire("Success", "Country added successfully", "success");

      // Update dropdown list immediately
      setCountries((prev) => [...prev, newCountry]);
      onCountryChange(newCountry.id);
      if (onCountryAdded) onCountryAdded(newCountry);

      // Reset input
      setNewCountryName("");
      setIsAdding(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div>
      {!isAdding ? (
        <>
          <label className="form-label fw-semibold">Country</label>
          <Dropdown
            value={selectedCountryId}
            options={countries.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(e) => onCountryChange(e.value)}
            placeholder="Select a country"
            className="w-100 mb-2"
          />
          <PrimeButton
            label="Add new country"
            icon="pi pi-plus"
            link
            className="p-0 text-primary"
            onClick={() => setIsAdding(true)}
          />
        </>
      ) : (
        <div className="mt-2">
          <label className="form-label fw-semibold">New Country</label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Enter country name"
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
        </div>
      )}
    </div>
  );
}
