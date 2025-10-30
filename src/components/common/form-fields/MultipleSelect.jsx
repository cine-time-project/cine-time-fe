"use client";

import { MultiSelect } from "primereact/multiselect";
import { useState } from "react";
import { FloatingLabel, FormControl, InputGroup } from "react-bootstrap";

export const MultipleSelect = (
  {name,
  label,
  errorMessage,
  className,
  iconBefore,
  iconAfter,
  options,
  optionLabel,
  optionValue,
  values,
  ...rest}
) => {
  const [selectedItems, setSelectedItems] = useState(values || []);


  return (
    <InputGroup className={`${className} ${errorMessage ? "mb-5" : ""}`}>
      <input type="hidden" name={name} value={JSON.stringify(selectedItems)} />

      {!!iconBefore && (
        <InputGroup.Text>
          <i className={`pi pi-${iconBefore}`}></i>
        </InputGroup.Text>
      )}

      <FloatingLabel controlId={name}>
        <MultiSelect
          value={selectedItems}
          onChange={(e) => setSelectedItems(e.value)}
          options={options}
        placeholder={label}
          optionLabel={optionLabel}
          optionValue={optionValue}
          display="chip"
          {...rest}
          className={` w-100 ${errorMessage ? "is-invalid" : ""}`}
        />

        <FormControl.Feedback type="invalid" style={{ position: "absolute" }}>
          {errorMessage}
        </FormControl.Feedback>
      </FloatingLabel>

      {!!iconAfter && (
        <InputGroup.Text id="basic-addon1">
          <i className={`pi pi-${iconAfter}`}></i>
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};
