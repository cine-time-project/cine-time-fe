"use client";
import { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import styles from "./login.module.scss";

export default function LoginForm({ onLogin, pending }) {
  const locale = useLocale();
  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const tErrors = useTranslations("errors");
  const tPlaceholders = useTranslations("placeholders");

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const resolveErrorMessage = (error) =>
    error?.message ?? (error?.key ? tErrors(error.key, { default: "" }) : "");

  const updateField = (name) => (e) => {
    const value = e?.target?.value ?? "";
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.identifier.trim()) nextErrors.identifier = { key: "required" };
    if (!formData.password) nextErrors.password = { key: "required" };
    setFieldErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;
    onLogin(formData, rememberMe, setFieldErrors, resetForm);
  };

  const resetForm = () => {
    setFormData({ identifier: "", password: "" });
    setFieldErrors({});
  };

  return (
    <Form noValidate onSubmit={handleSubmit} className={styles.loginCardForm}>
      {/* Email / Phone */}
      <Form.Group className="mb-3" controlId="login-identifier">
        <Form.Label>{tForms("emailOrPhone")}</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <i className="pi pi-user" />
          </InputGroup.Text>
          <Form.Control
            name="identifier"
            type="text"
            value={formData.identifier}
            onChange={updateField("identifier")}
            placeholder={tPlaceholders("enterEmailOrPhone")}
            autoComplete="username"
            required
            isInvalid={!!fieldErrors.identifier}
          />
          <Form.Control.Feedback type="invalid">
            {resolveErrorMessage(fieldErrors.identifier)}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      {/* Password */}
      <Form.Group className="mb-3" controlId="login-password">
        <Form.Label>{tForms("password")}</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <i className="pi pi-lock" />
          </InputGroup.Text>
          <Form.Control
            name="password"
            type="password"
            value={formData.password}
            onChange={updateField("password")}
            placeholder={tPlaceholders("enterPassword")}
            autoComplete="current-password"
            required
            isInvalid={!!fieldErrors.password}
          />
          <Form.Control.Feedback type="invalid">
            {resolveErrorMessage(fieldErrors.password)}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      {/* Remember + Forgot Password */}
      <div className={styles.loginCardMeta}>
        <Form.Check
          id="login-remember"
          type="checkbox"
          label={tForms("rememberMe")}
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <Link href={`/${locale}/forgot-password`} className={styles.loginCardLink}>
          {tAuth("forgotPassword")}
        </Link>
      </div>

      <Button type="submit" className={styles.loginCardSubmit} disabled={pending}>
        {pending && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
        <span className={styles.loginCardSubmitLabel}>{pending ? tAuth("loggingIn") : tAuth("login")}</span>
      </Button>
    </Form>
  );
}
