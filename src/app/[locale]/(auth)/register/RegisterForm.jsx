import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useTranslations } from "next-intl";
import styles from "./register.module.scss";

function sanitizePhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

export default function RegisterForm({ onRegister, pending }) {
  const tForms = useTranslations("forms");
  const tPlaceholders = useTranslations("placeholders");
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");

  const resolveErrorMessage = (error) =>
    error?.message ??
    (error?.key ? tErrors(error.key, error.values ?? {}) : "");

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "",
    password: "",
    passwordRepeat: "",
    marketingSms: false,
    marketingEmail: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (name) => (e) => {
    const value = e?.target?.value ?? "";
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: undefined }));
  };
  const updateCheckbox = (name) => (e) =>
    setFormData((p) => ({ ...p, [name]: e.target.checked }));

  const resetForm = () => {
    setFormData({
      name: "",
      surname: "",
      email: "",
      phone: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      gender: "",
      password: "",
      passwordRepeat: "",
      marketingSms: false,
      marketingEmail: false,
    });
    setFieldErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData, setFieldErrors, resetForm);
  };

  return (
    <Form
      noValidate
      onSubmit={handleSubmit}
      className={styles.registerCardForm}
    >
      {/* --- Name & Surname --- */}
      <div className={styles.registerFormRow}>
        <Form.Group className={styles.registerFormGroup}>
          <Form.Label>{tForms("name")}</Form.Label>
          <Form.Control
            type="text"
            value={formData.name}
            onChange={updateField("name")}
            placeholder={tPlaceholders("enterName")}
            isInvalid={!!fieldErrors.name}
          />
          {fieldErrors.name && (
            <div className="invalid-feedback">
              {resolveErrorMessage(fieldErrors.name)}
            </div>
          )}
        </Form.Group>

        <Form.Group className={styles.registerFormGroup}>
          <Form.Label>{tForms("surname")}</Form.Label>
          <Form.Control
            type="text"
            value={formData.surname}
            onChange={updateField("surname")}
            placeholder={tPlaceholders("enterSurname")}
            isInvalid={!!fieldErrors.surname}
          />
          {fieldErrors.surname && (
            <div className="invalid-feedback">
              {resolveErrorMessage(fieldErrors.surname)}
            </div>
          )}
        </Form.Group>
      </div>

      {/* --- Email & Phone --- */}
      <div className={styles.registerFormRow}>
        <Form.Group className={styles.registerFormGroup}>
          <Form.Label>{tForms("email")}</Form.Label>
          <Form.Control
            type="email"
            value={formData.email}
            onChange={updateField("email")}
            placeholder={tPlaceholders("enterEmail")}
            isInvalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <div className="invalid-feedback">
              {resolveErrorMessage(fieldErrors.email)}
            </div>
          )}
        </Form.Group>

        <Form.Group className={styles.registerFormGroup}>
          <Form.Label>{tForms("phone")}</Form.Label>
          <Form.Control
            type="tel"
            value={formData.phone}
            onChange={updateField("phone")}
            placeholder={tPlaceholders("enterPhone")}
            isInvalid={!!fieldErrors.phone}
          />
          {fieldErrors.phone && (
            <div className="invalid-feedback">
              {resolveErrorMessage(fieldErrors.phone)}
            </div>
          )}
        </Form.Group>
      </div>

      {/* --- Birthdate --- */}
      <div>
        <Form.Label>{tForms("birthDate")}</Form.Label>
        <div className={styles.registerFormRowTight}>
          <Form.Select
            value={formData.birthDay}
            onChange={updateField("birthDay")}
          >
            <option value="">{tForms("day")}</option>
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Form.Select>
          <Form.Select
            value={formData.birthMonth}
            onChange={updateField("birthMonth")}
          >
            <option value="">{tForms("month")}</option>
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Form.Select>
          <Form.Select
            value={formData.birthYear}
            onChange={updateField("birthYear")}
          >
            <option value="">{tForms("year")}</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* --- Gender --- */}
      <div className={styles.registerGenderGroup}>
        <Form.Label>{tForms("gender")}</Form.Label>
        <div className={styles.registerGenderOptions}>
          <Form.Check
            type="radio"
            id="female"
            label={tForms("genderFemale")}
            checked={formData.gender === "FEMALE"}
            onChange={() => setFormData({ ...formData, gender: "FEMALE" })}
          />
          <Form.Check
            type="radio"
            id="male"
            label={tForms("genderMale")}
            checked={formData.gender === "MALE"}
            onChange={() => setFormData({ ...formData, gender: "MALE" })}
          />
        </div>
      </div>

      {/* --- Passwords --- */}
      <div className={styles.registerFormRow}>
        <Form.Group className={styles.registerFormGroup}>
          <Form.Label>{tForms("password")}</Form.Label>
          <Form.Control
            type="password"
            value={formData.password}
            onChange={updateField("password")}
            placeholder={tPlaceholders("enterPassword")}
            isInvalid={!!fieldErrors.password}
          />
        </Form.Group>

        <Form.Group className={styles.registerFormGroup}>
          <Form.Label>{tForms("passwordRepeat")}</Form.Label>
          <Form.Control
            type="password"
            value={formData.passwordRepeat}
            onChange={updateField("passwordRepeat")}
            placeholder={tPlaceholders("enterPassword")}
            isInvalid={!!fieldErrors.passwordRepeat}
          />
        </Form.Group>
      </div>

      {/* --- Marketing --- */}
      <div className={styles.registerMarketing}>
        <Form.Check
          type="checkbox"
          label={tAuth("registerMarketingSms")}
          checked={formData.marketingSms}
          onChange={updateCheckbox("marketingSms")}
        />
        <Form.Check
          type="checkbox"
          label={tAuth("registerMarketingEmail")}
          checked={formData.marketingEmail}
          onChange={updateCheckbox("marketingEmail")}
        />
      </div>

      {/* --- Submit --- */}
      <Button
        type="submit"
        className={styles.registerSubmit}
        disabled={pending}
      >
        {pending && (
          <span className="spinner-border spinner-border-sm" role="status" />
        )}
        <span>{pending ? tAuth("registering") : tAuth("registerCta")}</span>
      </Button>
    </Form>
  );
}
