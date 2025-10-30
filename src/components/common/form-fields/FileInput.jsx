"use client";

import { FloatingLabel, Form, InputGroup } from "react-bootstrap";

export const FileInput = ({
  name,
  label,
  className,
  errorMessage,
  iconBefore = "upload",
  accept = "image/*",
  ...rest
}) => {
  return (
    <InputGroup className={`${className} ${errorMessage ? "mb-5" : ""}`}>
      <InputGroup.Text>
        <i className={`pi pi-${iconBefore}`}></i>
      </InputGroup.Text>

      <FloatingLabel controlId={name} label={label}>
        <Form.Control
          type="file"
          name={name}
          accept={accept}
          isInvalid={!!errorMessage}
          {...rest}
        />
        <Form.Control.Feedback type="invalid" style={{ position: "absolute" }}>
          {errorMessage}
        </Form.Control.Feedback>
      </FloatingLabel>
    </InputGroup>
  );
};
