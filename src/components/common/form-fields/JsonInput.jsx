"use client";

import { FloatingLabel, Form, InputGroup } from "react-bootstrap";

export const JsonInput = ({
  name,
  label,
  className,
  errorMessage,
  iconBefore = "code",
  iconAfter,
  defaultValue = "[]",
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
        <Form.Control
          name={name}
          placeholder={label}
          defaultValue={defaultValue}
          isInvalid={!!errorMessage}
          {...rest}
        />
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
