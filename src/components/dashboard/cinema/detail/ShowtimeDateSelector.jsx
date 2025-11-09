"use client";

import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./ShowtimeDateSelector.scss";

/**
 * Props:
 * - dates: Array of available dates (ISO strings)
 * - onDateChange: callback(selectedDate) => void
 */
export const ShowtimeDateSelector = ({ dates = [], onDateChange, tCinemas }) => {
  const [selectedDate, setSelectedDate] = useState(dates[0] || null);

  useEffect(() => {
    if (selectedDate) onDateChange(selectedDate);
  }, [selectedDate, onDateChange]);

  const formattedDates = dates.map((d) => ({
    label: new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }),
    value: d,
  }));

  return (
    <div className="showtime-date-selector">
      <Dropdown
        value={selectedDate}
        options={formattedDates}
        onChange={(e) => setSelectedDate(e.value)}
        placeholder={tCinemas("selectDate", { default: "Select Date" })}
        className="date-dropdown"
        showClear
      />
    </div>
  );
};
