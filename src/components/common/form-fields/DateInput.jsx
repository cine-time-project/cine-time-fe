"use client";

import { FloatingLabel, Form, InputGroup } from "react-bootstrap";
import { useState, useEffect } from "react";

export const DateInput = ({
  name,
  label,
  errorMessage,
  className,
  iconBefore,
  iconAfter,
  value,
  ...rest
}) => {
  const [dateValue, setDateValue] = useState("");

  useEffect(() => {
    // Date'i formatla (YYYY-MM-DD)
    if (value) {
      const formatted = value.length > 10 ? value.split("T")[0] : value;
      setDateValue(formatted);
    }
  }, [value]);

  const handleChange = (e) => {
    setDateValue(e.target.value);
  };

  return (
    <InputGroup className={`${className} ${errorMessage ? "mb-5" : ""}`}>
      {!!iconBefore && (
        <InputGroup.Text>
          <i className={`pi pi-${iconBefore}`}></i>
        </InputGroup.Text>
      )}

      {/* Floating Label */}
      <FloatingLabel controlId={name} label={label}>
        <Form.Control
          //id={name}
          name={name}
          type="date"
          value={dateValue}
          onChange={handleChange}
          isInvalid={!!errorMessage}
          style={{
            paddingTop: "1.5rem", // Label için boşluk bırak
            paddingBottom: "0.5rem",
          }}
          {...rest}
        />
        <Form.Control.Feedback type="invalid">
          {errorMessage}
        </Form.Control.Feedback>
      </FloatingLabel>

      {!!iconAfter && (
        <InputGroup.Text>
          <i className={`pi pi-${iconAfter}`}></i>
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};
