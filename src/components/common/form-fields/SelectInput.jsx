"use client";

import React from "react";
import { FloatingLabel, Form, FormSelect, InputGroup } from "react-bootstrap";
export const SelectInput = ({
  name,
  label,
  errorMessage,
  className,
  iconBefore,
  iconAfter,
  options,
  optionLabel,
  optionValue,
  ...rest
}) => {
  return (
    <InputGroup className={`${className} ${errorMessage ? "mb-5" : ""}`}>
      {!!iconBefore && (
        <InputGroup.Text>
          <i className={`pi pi-${iconBefore}`}></i>
        </InputGroup.Text>
      )}

      <FloatingLabel controlId={name} label={label}>
        <FormSelect
          name={name}
          placeholder={label}
          isInvalid={!!errorMessage}
          {...("value" in rest
            ? { value: rest.value || "" }
            : { defaultValue: "" })}
          {...rest}
        >
          <option value="">Select</option>
          {options.map((item) => (
            <option key={item[optionValue]} value={item[optionValue]}>
              {item[optionLabel]}
            </option>
          ))}
        </FormSelect>
        <Form.Control.Feedback type="invalid" style={{ position: "absolute" }}>
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
