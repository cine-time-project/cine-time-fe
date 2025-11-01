import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { listCountries, addCountry } from "@/action/city-actions";

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

      setCountries((prev) => [...prev, newCountry]);
      onCountryChange(newCountry.id);
      if (onCountryAdded) onCountryAdded(newCountry);

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
          <Button
            label="Add new country"
            icon="pi pi-plus"
            link
            className="p-0 text-primary"
            onClick={() => setIsAdding(true)}
          />
        </>
      ) : (
        <div className="d-flex align-items-end gap-2">
          <div className="flex-grow-1">
            <label className="form-label fw-semibold">New Country</label>
            <InputText
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              placeholder="Enter country name"
              className="w-100"
            />
          </div>
          <div className="pb-2">
            <Button
              icon="pi pi-check"
              label="Save"
              severity="success"
              onClick={handleSaveCountry}
              className="me-2"
            />
            <Button
              icon="pi pi-times"
              label="Cancel"
              severity="secondary"
              onClick={() => setIsAdding(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
