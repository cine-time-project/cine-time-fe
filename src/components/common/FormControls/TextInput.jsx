"use client";

import { FloatingLabel, Form, InputGroup } from "react-bootstrap";
import { useTranslations } from "next-intl";

/**
 * Tek satır/kısa metin girişleri için i18n + a11y destekli input.
 * Sunucudan gelen hata metnini (errorMessage) öncelikli gösterir;
 * yoksa ns + errorKey ile sözlükten çeker.
 */
export const TextInput = ({
  className = "",
  name,
  label,
  iconBefore,
  iconAfter,

  // i18n hata seçenekleri
  ns = "errors",            // örn: "contact.errors" veya "errors"
  errorKey,                 // örn: "required" | "emailInvalid" | "phoneMask"
  errorParams = {},         // örn: { min: 3 }
  errorMessage,             // BE'den gelen doğrudan hata metni

  helperText,               // alanın altında gri yardım metni
  required = false,

  // Diğer input prop'ları (value, onChange, type, etc.)
  ...rest
}) => {
  const tErr = useTranslations(ns);

  // Öncelik: doğrudan hata > i18n key
  const resolvedError =
    errorMessage ??
    (errorKey ? tErr(errorKey, { default: "", ...errorParams }) : "");

  const isInvalid = !!resolvedError;
  const helpId = helperText ? `${name}-help` : undefined;
  const errId = isInvalid ? `${name}-error` : undefined;

  return (
    <div className={className}>
      <InputGroup className={isInvalid ? "mb-4" : undefined}>
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
            aria-invalid={isInvalid || undefined}
            aria-describedby={
              [helpId, errId].filter(Boolean).join(" ") || undefined
            }
            {...rest}   // <-- ATTRIBUTES içinde, satır sonu! (sentaks hatasını bu çözer)
          />

          {/* Hata mesajı */}
          {isInvalid && (
            <Form.Control.Feedback
              id={errId}
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

      {/* Yardımcı metin */}
      {helperText && (
        <Form.Text id={helpId} muted>
          {helperText}
        </Form.Text>
      )}
    </div>
  );
};

export default TextInput;
