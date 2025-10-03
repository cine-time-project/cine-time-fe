"use client";

import { FloatingLabel, Form, InputGroup } from "react-bootstrap";
import { useTranslations } from "next-intl";

export const TextInput = ({
  className = "",
  name,
  label,
  iconBefore,
  iconAfter,

  // i18n hata ayarları
  ns = "errors",           // messages/errors.{locale}.json
  errorKey,                // "required" | "min" | "max" | "invalidEmail" ...
  errorParams = {},        // { min: 3 } gibi
  errorMessage,            // metni manuel vermek istersen

  required,
  ...rest
}) => {
  const tErr = useTranslations(ns);
  const resolvedError =
    errorMessage ??
    (errorKey ? tErr(errorKey, { default: "", ...errorParams }) : "");

  const isInvalid = !!resolvedError;

  return (
    <InputGroup className={`${className} ${isInvalid ? "mb-5" : ""}`}>
      {iconBefore && (
        <InputGroup.Text>
          <i className={`pi pi-${iconBefore}`} />
        </InputGroup.Text>
      )}

      <FloatingLabel controlId={name} label={label + (required ? " *" : "")}>
        <Form.Control
          name={name}
          placeholder={label}
          isInvalid={isInvalid}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${name}-error` : undefined}
          {...rest}
        />
        {isInvalid && (
          <Form.Control.Feedback
            id={`${name}-error`}
            type="invalid"
            style={{ position: "absolute" }}
          >
            {resolvedError}
          </Form.Control.Feedback>
        )}
      </FloatingLabel>

      {iconAfter && (
        <InputGroup.Text>
          <i className={`pi pi-${iconAfter}`} />
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};
