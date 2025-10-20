"use client";
import { Form, Button } from "react-bootstrap";

export default function ForgotForm({
  tForms,
  tPlaceholders,
  email,
  setEmail,
  error,
  pending,
  onSubmit,
}) {
  return (
    <Form noValidate onSubmit={onSubmit} className="forgotForm">
      <Form.Label>{tForms("email")}</Form.Label>
      <div className="input-group">
        <span className="input-group-text" aria-hidden="true">
          <i className="pi pi-at" />
        </span>
        <Form.Control
          type="email"
          value={email}
          placeholder={tPlaceholders("enterEmail")}
          onChange={(e) => setEmail(e.target.value)}
          isInvalid={!!error}
          autoComplete="email"
        />
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}

      <Button type="submit" disabled={pending} className="forgotSubmit">
        {pending && (
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
          />
        )}
        {pending ? "Gönderiliyor..." : "Kodu Gönder"}
      </Button>
    </Form>
  );
}
