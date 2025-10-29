"use client";

import { Calendar } from "primereact/calendar";
import { useEffect, useState } from "react";
import { FloatingLabel, Form, FormControl, InputGroup } from "react-bootstrap";
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
  const [date, setDate] = useState("");

  useEffect(() => {
    if(value){
        setDate(new Date(value));
    }
  }, [value]);

  return (
    <InputGroup className={`${className} ${errorMessage ? "mb-5" : ""}`}>
      {!!iconBefore && (
        <InputGroup.Text>
          <i className={`pi pi-${iconBefore}`}></i>
        </InputGroup.Text>
      )}

      <FloatingLabel controlId={name} label={label}>
        <Calendar
          {...rest}
          name={name}
          style={{width: "100%"}}
          className={`w-100 ${errorMessage ? "is-invalid" : ""}`}
          value={date}
          onChange={(e) => setDate(e.value)}
        />
        <FormControl.Feedback type="invalid" style={{ position: "absolute" }}>
          {errorMessage}
        </FormControl.Feedback>
      </FloatingLabel>

      {!!iconAfter && (
        <InputGroup.Text>
          <i className={`pi pi-${iconAfter}`}></i>
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};
