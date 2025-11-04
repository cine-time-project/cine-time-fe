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
import { listCountries, addCountry } from "@/action/city-actions";
import { Button as PrimeButton } from "primereact/button";

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
export function CountrySelect({ selectedCountryId, onCountryChange, token }) {
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
      const newCountry = res.data.returnBody;
      Swal.fire("Success", "Country added", "success");

      // Reload countries and update dropdown
      setCountries((prev) => [...prev, newCountry]);

      // Set newly added country as selected
      onCountryChange(newCountry.id);

      setNewCountryName("");
      setIsAdding(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <Form.Group className="mb-3" as={Row}>
      <Form.Label column sm="2" className="mx-0">
        Country
      </Form.Label>
      <Col sm="10">
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
              overlay={<Tooltip>Add new country</Tooltip>}
            >
              <Button
                variant="warning"
                onClick={() => {
                  setIsAdding(true);
                  onCountryChange(""); //reset country set
                }}
              >
                <i className="pi pi-plus"></i>
              </Button>
            </OverlayTrigger>
          </InputGroup>
        ) : (
          <InputGroup>
            <Form.Control
              className="bg-warning-subtle"
              placeholder="Enter new country"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
            />
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Save</Tooltip>}
            >
              <Button variant="success" onClick={handleSaveCountry}>
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
