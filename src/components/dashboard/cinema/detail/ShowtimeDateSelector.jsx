"use client";

import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import "./ShowtimeDateSelector.scss";

export const ShowtimeDateSelector = ({
  dates = [],
  onDateChange,
  tCinemas,
}) => {
  const [selectedDate, setSelectedDate] = useState(dates[0] || "");

  const formatLocalDate = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (selectedDate) onDateChange(formatLocalDate(selectedDate));
  }, [selectedDate, onDateChange]);

  return (
    <div className="showtime-date-selector">
      <label className="selector-label">
        {tCinemas?.selectDate || "Tarih Seçiniz"}
      </label>

      <div className="custom-select-wrapper">
        <Form.Select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="custom-select"
        >
          {dates.map((d) => {
            const date = new Date(d);
            const label = date.toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "2-digit",
              month: "short",
            });
            return (
              <option key={d} value={d}>
                {label}
              </option>
            );
          })}
        </Form.Select>
        <span className="dropdown-icon"><i className="pi pi-angle-down"></i></span>
      </div>
    </div>
  );
};
