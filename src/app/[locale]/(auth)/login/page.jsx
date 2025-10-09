"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { useLocale, useTranslations } from "next-intl";
import { login as loginRequest } from "@/services/auth-service";
import "./login.scss";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();

  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const tErrors = useTranslations("errors");
  const tPlaceholders = useTranslations("placeholders");

  const resolveErrorMessage = (error) =>
    error?.message ?? (error?.key ? tErrors(error.key, { default: "" }) : "");

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [pending, setPending] = useState(false);

  const updateField = (name) => (event) => {
    const value = event?.target?.value ?? "";
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    const identifier = formData.identifier.trim();
    const password = formData.password;

    if (!identifier) {
      nextErrors.identifier = { key: "required" };
    }

    if (!password) {
      nextErrors.password = { key: "required" };
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
        email: formData.identifier.trim(),
        password: formData.password,
      };

      const response = await loginRequest(payload);

      const token =
        response?.accessToken ??
        response?.token ??
        response?.access_token ??
        response?.data?.accessToken ??
        response?.data?.token ??
        response?.data?.access_token;

      if (!token) {
        throw Object.assign(new Error("Missing token"), { status: 500 });
      }

      try {
        localStorage.setItem("authToken", token);
        localStorage.setItem("authRemember", rememberMe ? "1" : "0");
        if (response?.refreshToken ?? response?.data?.refreshToken) {
          const refresh = response.refreshToken ?? response.data?.refreshToken;
          localStorage.setItem("refreshToken", refresh);
        }
        if (response?.user ?? response?.data?.user) {
          const user = response.user ?? response.data?.user;
          localStorage.setItem("authUser", JSON.stringify(user));
        }
      } catch {}

      setAlert({ type: "success", message: tAuth("successLogin") });
      setFormData({ identifier: "", password: "" });
      setFieldErrors({});
      router.push(`/${locale}`);
    } catch (error) {
      const status = error?.status ?? 0;
      if (status === 401) {
        setAlert({ type: "danger", message: tAuth("invalidCredentials") });
      } else if (status === 423) {
        setAlert({ type: "danger", message: tAuth("locked") });
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
    <div className="login-page">
      <Container className="login-page__container">
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={6} xl={5} xxl={4}>
            <Card className="login-card">
              <Card.Body>
                <div className="login-card__header text-center">
                  <p className="login-card__eyebrow">{tAuth("loginEyebrow")}</p>
                  <h1 className="login-card__title">{tAuth("loginWelcome")}</h1>
                  <p className="login-card__subtitle">
                    {tAuth("loginDescription")}
                  </p>
                </div>

                <div className="login-card__tabs" role="tablist">
                  <span
                    className="login-card__tab is-active"
                    aria-current="page"
                  >
                    {tAuth("titleLogin")}
                  </span>
                  <Link
                    href={`/${locale}/register`}
                    className="login-card__tab"
                    role="tab"
                  >
                    {tAuth("register")}
                  </Link>
                </div>

                {alert && (
                  <Alert
                    variant={alert.type === "success" ? "success" : "danger"}
                    dismissible
                    onClose={() => setAlert(null)}
                    className="login-card__alert"
                  >
                    {alert.message}
                  </Alert>
                )}

                <Form
                  noValidate
                  onSubmit={handleSubmit}
                  className="login-card__form"
                >
                  <Form.Group className="mb-3" controlId="login-identifier">
                    <Form.Label>{tForms("emailOrPhone")}</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text aria-hidden="true">
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
                        aria-describedby={
                          fieldErrors.identifier
                            ? "login-identifier-error"
                            : undefined
                        }
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        id="login-identifier-error"
                      >
                        {resolveErrorMessage(fieldErrors.identifier)}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="login-password">
                    <Form.Label>{tForms("password")}</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text aria-hidden="true">
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
                        aria-describedby={
                          fieldErrors.password
                            ? "login-password-error"
                            : undefined
                        }
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        id="login-password-error"
                      >
                        {resolveErrorMessage(fieldErrors.password)}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <div className="login-card__meta">
                    <Form.Check
                      id="login-remember"
                      type="checkbox"
                      label={tForms("rememberMe")}
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <Link
                      href={`/${locale}/reset-password`}
                      className="login-card__link"
                    >
                      {tAuth("forgotPassword")}
                    </Link>
                  </div>

                  <div className="login-card__captcha">
                    <Form.Check
                      id="login-captcha"
                      type="checkbox"
                      label={tAuth("notRobot")}
                    />
                    <div
                      className="login-card__captcha-brand"
                      aria-hidden="true"
                    >
                      <span className="login-card__captcha-brand-title">
                        reCAPTCHA
                      </span>
                      <span className="login-card__captcha-brand-sub">
                        Google
                      </span>
                    </div>
                  </div>
                  <Form.Text className="login-card__captcha-note">
                    {tAuth("captchaNote")}
                  </Form.Text>

                  <Button
                    type="submit"
                    className="login-card__submit"
                    disabled={pending}
                    aria-busy={pending}
                  >
                    {pending && (
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      />
                    )}
                    <span className="login-card__submit-label">
                      {pending ? tAuth("loggingIn") : tAuth("login")}
                    </span>
                  </Button>
                </Form>

                <div className="login-card__footer">
                  <span>{tAuth("noAccount")}</span>
                  <Link
                    href={`/${locale}/register`}
                    className="login-card__footer-link"
                  >
                    {tAuth("register")}
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
