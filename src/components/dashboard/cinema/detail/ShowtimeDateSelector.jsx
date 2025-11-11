"use client";

import React, { useEffect } from "react";
import Form from "react-bootstrap/Form";
import { useLocale } from "next-intl";
import "./ShowtimeDateSelector.scss";

export const ShowtimeDateSelector = ({
  dates = [],
  onDateChange,
  selectedDate,
  setSelectedDate,
}) => {
  const locale = useLocale(); // Kullanıcının geçerli locale'i

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
      <div className="custom-select-wrapper">
        <Form.Select
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="custom-select"
        >
          {dates.map((d) => {
            const date = new Date(d);
            const label = date.toLocaleDateString(locale, {
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
        <span className="dropdown-icon">
          <i className="pi pi-angle-down"></i>
        </span>
      </div>
    </div>
  );
};
