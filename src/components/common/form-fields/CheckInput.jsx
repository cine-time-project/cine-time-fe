"use client";

import { FormCheck, FormControl, FormGroup } from "react-bootstrap";

export const CheckInput = ({
  name,
  label,
  type = "checkbox",
  errorMessage,
  className,
  ...rest
}) => {
  return (
    <FormGroup className={`${className} ${errorMessage ? "mb-5" : ""} `}>
      <FormCheck
        type={type}
        name={name}
        label={label}
        id={name}
        isInvalid={!!errorMessage}
        {...rest}
      />

      <FormControl.Feedback type="invalid">{errorMessage}</FormControl.Feedback>
    </FormGroup>
  );
};
