"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./ShowtimeDateSelector.scss";

/**
 * Props:
 * - dates: Array of available dates (ISO strings)
 * - onDateChange: callback(selectedDate) => void
 * - tCinemas: translations
 */
export const ShowtimeDateSelector = ({
  dates = [],
  onDateChange,
  tCinemas,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    dates[0] ? new Date(dates[0]) : null
  );

  const formatLocalDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (selectedDate) onDateChange(formatLocalDate(selectedDate));
  }, [selectedDate, onDateChange]);

  // Kullanıcı sadece dates içinde olan tarihleri seçebilir
  const isSelectableDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return dates.includes(dateStr);
  };

  return (
    <div className="showtime-date-selector">
      <Calendar
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.value)}
        showIcon
        readonlyInput
        dateFormat="dd/mm/yy"
        className="custom-calendar"
        disabledDatesFilter={(date) => !isSelectableDate(date)}
      />
    </div>
  );
};
