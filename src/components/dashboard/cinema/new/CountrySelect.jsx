import { useState, useEffect } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { listCountries, addCountry } from "@/action/city-actions";

/**
 * CountrySelect
 * -------------
 * Admin formu için country seçimi ve inline ekleme desteği.
 *
 * Props:
 *  - selectedCountryId: number | null       -> Seçili country ID
 *  - onCountryChange: (id: number) => void  -> Country değiştiğinde çağrılır
 *  - token: string                          -> Auth token (admin yetkisi)
 *  - onCountryAdded?: (country) => void     -> Yeni country eklenince callback
 */
export function CountrySelect({
  selectedCountryId,
  onCountryChange,
  token,
  onCountryAdded,
}) {
  const [countries, setCountries] = useState([]); // Dropdown options
  const [isAdding, setIsAdding] = useState(false); // Inline add mode
  const [newCountryName, setNewCountryName] = useState("");

  // Load initial countries on mount
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

  /**
   * Handle inline save new country
   * 1. Validates input
   * 2. Calls backend addCountry
   * 3. Updates local state & parent callback
   */
  const handleSaveCountry = async () => {
    if (!newCountryName.trim()) {
      Swal.fire("Error", "Country name required", "error");
      return;
    }

    try {
      const res = await addCountry({ name: newCountryName }, token);
      const newCountry = res.data;
      Swal.fire("Success", "Country added", "success");

      // Update dropdown & notify parent
      setCountries((prev) => [...prev, newCountry]);
      onCountryChange(newCountry.id);
      if (onCountryAdded) onCountryAdded(newCountry);

      // Reset inline add state
      setNewCountryName("");
      setIsAdding(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="mb-3">
      {!isAdding ? (
        <>
          {/* Dropdown display mode */}
          <Form.Label className="fw-semibold">Country</Form.Label>
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

          {/* Inline "Add new country" trigger */}
          <Button
            variant="link"
            className="p-0 mt-1 text-primary"
            onClick={() => setIsAdding(true)}
          >
            Add new country
          </Button>
        </>
      ) : (
        <>
          {/* Inline add mode */}
          <InputGroup className="mt-2">
            <Form.Control
              placeholder="Enter new country"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
            />
            <Button variant="success" onClick={handleSaveCountry}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </InputGroup>
        </>
      )}
    </div>
  );
}
