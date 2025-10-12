"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import styles from "./forgot-password.module.scss";
import { requestPasswordReset } from "@/services/auth-service";

export default function ForgotPasswordPage() {
  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const tErrors = useTranslations("errors");
  const tPlaceholders = useTranslations("placeholders");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState("");

  const validate = () => {
    const v = email.trim();
    if (!v) return tErrors("required");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return ok ? "" : tErrors("invalidEmail");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setPending(true);
    try {
      await requestPasswordReset({ email: email.trim(), locale });
      setAlert({
        type: "success",
        message: tAuth("forgot.success"),
      });
    } catch (ex) {
      const status = ex?.status ?? 0;
      const msg =
        status === 404
          ? tAuth("forgot.notFound")
          : status === 429
          ? tAuth("forgot.rateLimit")
          : tErrors("unknown");
      setAlert({ type: "danger", message: msg });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.forgotPage}>
      <Container className={styles.forgotPageContainer}>
        <Card className={styles.forgotCard}>
          <Card.Body>
            <header className={styles.forgotHeader}>
              <p className={styles.forgotEyebrow}>C I N E T I M E</p>
              <h1 className={styles.forgotTitle}>{tAuth("forgot.title")}</h1>
              <p className={styles.forgotSubtitle}>
                {tAuth("forgot.subtitle")}
              </p>
            </header>

            <div
              className={styles.forgotTabs}
              role="tablist"
              aria-label="auth-tabs"
            >
              <Link href={`/${locale}/login`} className={styles.forgotTab}>
                {tAuth("titleLogin")}
              </Link>
              <span
                className={`${styles.forgotTab} is-active`}
                aria-current="page"
              >
                {tAuth("forgot.tab")}
              </span>
            </div>

            {alert && (
              <Alert
                variant={alert.type === "success" ? "success" : "danger"}
                onClose={() => setAlert(null)}
                dismissible
                className={styles.forgotAlert}
              >
                {alert.message}
              </Alert>
            )}

            <Form noValidate onSubmit={onSubmit} className={styles.forgotForm}>
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

              <Button
                type="submit"
                disabled={pending}
                className={styles.forgotSubmit}
              >
                {pending && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                )}
                {tAuth("forgot.submit")}
              </Button>
            </Form>

            <div className={styles.forgotFooter}>
              <Link
                href={`/${locale}/login`}
                className={styles.forgotFooterLink}
              >
                ← {tAuth("backToLogin")}
              </Link>
              <span>·</span>
              <Link
                href={`/${locale}/register`}
                className={styles.forgotFooterLink}
              >
                {tAuth("register")}
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
