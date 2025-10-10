"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { useLocale, useTranslations } from "next-intl";

import { register as registerRequest } from "@/services/auth-service";

import styles from "./register.module.scss";

const days = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);
const months = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) =>
  String(currentYear - index)
);

function sanitizePhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

export default function RegisterPage() {
  const locale = useLocale();
  const router = useRouter();

  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const tErrors = useTranslations("errors");
  const tPlaceholders = useTranslations("placeholders");

  const resolveErrorMessage = (error) =>
    error?.message ??
    (error?.key ? tErrors(error.key, error.values ?? {}) : "");

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
  const [alert, setAlert] = useState(null);
  const [pending, setPending] = useState(false);

  const updateField = (name) => (event) => {
    const value = event?.target?.value ?? "";
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name.startsWith("birth")) {
      setFieldErrors((prev) => ({ ...prev, birthDate: undefined }));
    }
  };

  const updateCheckbox = (name) => (event) => {
    const checked = event?.target?.checked ?? false;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const selectGender = (event) => {
    const value = event?.target?.value ?? "";
    setFormData((prev) => ({ ...prev, gender: value }));
    setFieldErrors((prev) => ({ ...prev, gender: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    const name = formData.name.trim();
    const surname = formData.surname.trim();
    const email = formData.email.trim();
    const phone = sanitizePhone(formData.phone.trim());
    const password = formData.password;
    const passwordRepeat = formData.passwordRepeat;

    if (!name) {
      nextErrors.name = { key: "required" };
    }

    if (!surname) {
      nextErrors.surname = { key: "required" };
    }

    if (!email) {
      nextErrors.email = { key: "required" };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = { key: "invalidEmail" };
    }

    if (!phone) {
      nextErrors.phone = { key: "required" };
    } else if (phone.replace(/\D/g, "").length < 10) {
      nextErrors.phone = { key: "invalidPhone" };
    }

    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      nextErrors.birthDate = { key: "required" };
    } else {
      const year = Number(formData.birthYear);
      const month = Number(formData.birthMonth);
      const day = Number(formData.birthDay);
      const date = new Date(year, month - 1, day);
      if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        nextErrors.birthDate = { key: "invalidDate" };
      }
    }

    if (!formData.gender) {
      nextErrors.gender = { key: "required" };
    }

    if (!password) {
      nextErrors.password = { key: "required" };
    } else if (password.length < 6) {
      nextErrors.password = { key: "min", values: { min: 6 } };
    }

    if (!passwordRepeat) {
      nextErrors.passwordRepeat = { key: "required" };
    } else if (password && passwordRepeat !== password) {
      nextErrors.passwordRepeat = { key: "passwordMismatch" };
    }

    setFieldErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAlert(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setPending(true);
    try {
      const payload = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        phone: sanitizePhone(formData.phone.trim()),
        birthDate: `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`,
        gender: formData.gender,
        password: formData.password,
        passwordRepeat: formData.passwordRepeat,
        marketing: {
          sms: formData.marketingSms,
          email: formData.marketingEmail,
        },
      };

      await registerRequest(payload);

      setAlert({ type: "success", message: tAuth("successRegister") });
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
      router.push(`/${locale}/login`);
    } catch (error) {
      const status = error?.status ?? 0;
      if (status === 409) {
        setAlert({ type: "danger", message: tAuth("accountExists") });
      } else if (status === 400) {
        setAlert({ type: "danger", message: tErrors("invalid") });
      } else if (status === 500) {
        setAlert({ type: "danger", message: tErrors("500") });
      } else if (status === 0) {
        setAlert({ type: "danger", message: tErrors("network") });
      } else {
        const fallbackMessage =
          (error?.data &&
            typeof error.data === "object" &&
            error.data?.message) ||
          error?.message ||
          tErrors("unknown");
        setAlert({ type: "danger", message: fallbackMessage });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <Container className={styles.registerPageContainer}>
        <Card className={styles.registerCard}>
          <Card.Body>
            <div className={styles.registerCardHeader}>
              <p className={styles.registerCardEyebrow}>
                {tAuth("registerEyebrow")}
              </p>
              <h1 className={styles.registerCardTitle}>
                {tAuth("registerWelcome")}
              </h1>
              <p className={styles.registerCardSubtitle}>
                {tAuth("registerDescription")}
              </p>
            </div>

            <div className={styles.registerCardTabs} role="tablist">
              <Link
                href={`/${locale}/login`}
                className={styles.registerCardTab}
                role="tab"
              >
                {tAuth("titleLogin")}
              </Link>
              <span
                className={`${styles.registerCardTab} is-active`}
                aria-current="page"
              >
                {tAuth("register")}
              </span>
            </div>

            {alert && (
              <Alert
                variant={alert.type === "success" ? "success" : "danger"}
                dismissible
                onClose={() => setAlert(null)}
                className={styles.registerCardAlert}
              >
                {alert.message}
              </Alert>
            )}

            <Form
              noValidate
              onSubmit={handleSubmit}
              className={styles.registerCardForm}
            >
              <div className={styles.registerFormRow}>
                <Form.Group
                  className={styles.registerFormGroup}
                  controlId="register-name"
                >
                  <Form.Label>{tForms("name")}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                      <i className="pi pi-user" />
                    </span>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={updateField("name")}
                      placeholder={tPlaceholders("enterName")}
                      isInvalid={!!fieldErrors.name}
                      autoComplete="given-name"
                      required
                      aria-describedby={
                        fieldErrors.name ? "register-name-error" : undefined
                      }
                    />
                  </div>
                  {fieldErrors.name && (
                    <div className="invalid-feedback" id="register-name-error">
                      {resolveErrorMessage(fieldErrors.name)}
                    </div>
                  )}
                </Form.Group>

                <Form.Group
                  className={styles.registerFormGroup}
                  controlId="register-surname"
                >
                  <Form.Label>{tForms("surname")}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                      <i className="pi pi-user" />
                    </span>
                    <Form.Control
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={updateField("surname")}
                      placeholder={tPlaceholders("enterSurname")}
                      isInvalid={!!fieldErrors.surname}
                      autoComplete="family-name"
                      required
                      aria-describedby={
                        fieldErrors.surname
                          ? "register-surname-error"
                          : undefined
                      }
                    />
                  </div>
                  {fieldErrors.surname && (
                    <div
                      className="invalid-feedback"
                      id="register-surname-error"
                    >
                      {resolveErrorMessage(fieldErrors.surname)}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div className={styles.registerFormRow}>
                <Form.Group
                  className={styles.registerFormGroup}
                  controlId="register-email"
                >
                  <Form.Label>{tForms("email")}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                      <i className="pi pi-at" />
                    </span>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={updateField("email")}
                      placeholder={tPlaceholders("enterEmail")}
                      isInvalid={!!fieldErrors.email}
                      autoComplete="email"
                      required
                      aria-describedby={
                        fieldErrors.email ? "register-email-error" : undefined
                      }
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="invalid-feedback" id="register-email-error">
                      {resolveErrorMessage(fieldErrors.email)}
                    </div>
                  )}
                </Form.Group>

                <Form.Group
                  className={styles.registerFormGroup}
                  controlId="register-phone"
                >
                  <Form.Label>{tForms("phone")}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                      <i className="pi pi-phone" />
                    </span>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={updateField("phone")}
                      placeholder={tPlaceholders("enterPhone")}
                      isInvalid={!!fieldErrors.phone}
                      autoComplete="tel"
                      required
                      aria-describedby={
                        fieldErrors.phone ? "register-phone-error" : undefined
                      }
                    />
                  </div>
                  {fieldErrors.phone && (
                    <div className="invalid-feedback" id="register-phone-error">
                      {resolveErrorMessage(fieldErrors.phone)}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div>
                <Form.Label>{tForms("birthDate")}</Form.Label>
                <div className={styles.registerFormRowTight}>
                  <Form.Group
                    className={styles.registerFormGroup}
                    controlId="register-birth-day"
                  >
                    <Form.Select
                      value={formData.birthDay}
                      onChange={updateField("birthDay")}
                      isInvalid={!!fieldErrors.birthDate}
                      aria-describedby={
                        fieldErrors.birthDate
                          ? "register-birthdate-error"
                          : undefined
                      }
                    >
                      <option value="">{tForms("day")}</option>
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group
                    className={styles.registerFormGroup}
                    controlId="register-birth-month"
                  >
                    <Form.Select
                      value={formData.birthMonth}
                      onChange={updateField("birthMonth")}
                      isInvalid={!!fieldErrors.birthDate}
                      aria-describedby={
                        fieldErrors.birthDate
                          ? "register-birthdate-error"
                          : undefined
                      }
                    >
                      <option value="">{tForms("month")}</option>
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group
                    className={styles.registerFormGroup}
                    controlId="register-birth-year"
                  >
                    <Form.Select
                      value={formData.birthYear}
                      onChange={updateField("birthYear")}
                      isInvalid={!!fieldErrors.birthDate}
                      aria-describedby={
                        fieldErrors.birthDate
                          ? "register-birthdate-error"
                          : undefined
                      }
                    >
                      <option value="">{tForms("year")}</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                {fieldErrors.birthDate && (
                  <div
                    className="invalid-feedback"
                    id="register-birthdate-error"
                  >
                    {resolveErrorMessage(fieldErrors.birthDate)}
                  </div>
                )}
              </div>

              <div className={styles.registerGenderGroup}>
                <Form.Label>{tForms("gender")}</Form.Label>
                <div className={styles.registerGenderOptions}>
                  <Form.Check
                    type="radio"
                    id="register-gender-female"
                    name="gender"
                    value="female"
                    label={tForms("genderFemale")}
                    onChange={selectGender}
                    checked={formData.gender === "female"}
                  />
                  <Form.Check
                    type="radio"
                    id="register-gender-male"
                    name="gender"
                    value="male"
                    label={tForms("genderMale")}
                    onChange={selectGender}
                    checked={formData.gender === "male"}
                  />
                </div>
                {fieldErrors.gender && (
                  <div className="invalid-feedback">
                    {resolveErrorMessage(fieldErrors.gender)}
                  </div>
                )}
              </div>

              <div className={styles.registerFormRow}>
                <Form.Group
                  className={styles.registerFormGroup}
                  controlId="register-password"
                >
                  <Form.Label>{tForms("password")}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                      <i className="pi pi-lock" />
                    </span>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={updateField("password")}
                      placeholder={tPlaceholders("enterPassword")}
                      isInvalid={!!fieldErrors.password}
                      autoComplete="new-password"
                      required
                      aria-describedby={
                        fieldErrors.password
                          ? "register-password-error"
                          : undefined
                      }
                    />
                  </div>
                  {fieldErrors.password && (
                    <div
                      className="invalid-feedback"
                      id="register-password-error"
                    >
                      {resolveErrorMessage(fieldErrors.password)}
                    </div>
                  )}
                </Form.Group>

                <Form.Group
                  className={styles.registerFormGroup}
                  controlId="register-password-repeat"
                >
                  <Form.Label>{tForms("passwordRepeat")}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">
                      <i className="pi pi-lock" />
                    </span>
                    <Form.Control
                      type="password"
                      name="passwordRepeat"
                      value={formData.passwordRepeat}
                      onChange={updateField("passwordRepeat")}
                      placeholder={tPlaceholders("enterPassword")}
                      isInvalid={!!fieldErrors.passwordRepeat}
                      autoComplete="new-password"
                      required
                      aria-describedby={
                        fieldErrors.passwordRepeat
                          ? "register-password-repeat-error"
                          : undefined
                      }
                    />
                  </div>
                  {fieldErrors.passwordRepeat && (
                    <div
                      className="invalid-feedback"
                      id="register-password-repeat-error"
                    >
                      {resolveErrorMessage(fieldErrors.passwordRepeat)}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div className={styles.registerMarketing}>
                <Form.Check
                  type="checkbox"
                  id="register-marketing-sms"
                  name="marketingSms"
                  label={tAuth("registerMarketingSms")}
                  checked={formData.marketingSms}
                  onChange={updateCheckbox("marketingSms")}
                />
                <Form.Check
                  type="checkbox"
                  id="register-marketing-email"
                  name="marketingEmail"
                  label={tAuth("registerMarketingEmail")}
                  checked={formData.marketingEmail}
                  onChange={updateCheckbox("marketingEmail")}
                />
              </div>

              <p className={styles.registerPrivacyText}>
                {tAuth.rich("registerPrivacy", {
                  lawLink: (chunks) => (
                    <a
                      href="https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6698&MevzuatTur=1&MevzuatTertip=5"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>

              <div>
                <div className={styles.registerCaptcha}>
                  <Form.Check
                    type="checkbox"
                    id="register-captcha"
                    label={tAuth("notRobot")}
                  />
                  <div className={styles.registerCaptchaBrand}>
                    <span className={styles.registerCaptchaBrandTitle}>
                      reCAPTCHA
                    </span>
                    <span className={styles.registerCaptchaBrandSub}>
                      Google
                    </span>
                  </div>
                </div>
                <span className={styles.registerCaptchaNote}>
                  {tAuth("captchaNote")}
                </span>
              </div>

              <Button
                type="submit"
                className={styles.registerSubmit}
                disabled={pending}
              >
                {pending && (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                )}
                <span>
                  {pending ? tAuth("registering") : tAuth("registerCta")}
                </span>
              </Button>
            </Form>

            <div className={styles.registerFooter}>
              <span>{tAuth("haveAccount")}</span>
              <Link
                href={`/${locale}/login`}
                className={styles.registerFooterLink}
              >
                {tAuth("login")}
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
