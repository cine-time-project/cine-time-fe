"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useTranslations, useLocale } from "next-intl";
import { config } from "@/helpers/config";
import styles from "./reset-password.module.scss";

export default function ResetPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || config.apiURL;

  if (email === null || email === undefined) return;

  useEffect(() => {
    if (email === null || email === undefined) return;
    if (email.trim() === "") {
      router.push(`/${locale}/forgot-password`);
    }
  }, [email, router, locale]);

  // i18n namespaces
  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const tErrors = useTranslations("errors");
  const tPlaceholders = useTranslations("placeholders");

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (password !== passwordRepeat) {
      setAlert({ type: "danger", message: tErrors("passwordMismatch") });
      return;
    }

    setPending(true);
    try {
     const response = await fetch(`${API_BASE}/reset-password-direct`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         email: email,
         newPassword: password,
       }),
     });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }

      if (!response.ok) {
        throw new Error(data?.message || tErrors("invalid"));
      }

      setAlert({
        type: "success",
        message: tAuth("reset.success"),
      });

      setTimeout(() => router.push(`/${locale}/login`), 2000);
    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.resetPage}>
      <Container className={styles.resetContainer}>
        <Card className={styles.resetCard}>
          <Card.Body>
            <header className={styles.resetHeader}>
              <p className={styles.brand}>C I N E T I M E</p>
              <h1 className={styles.resetTitle}>{tAuth("reset.title")}</h1>
              <p className={styles.resetSubtitle}>
                {email
                  ? tAuth("reset.subtitleWithEmail", { email })
                  : tAuth("reset.subtitle")}
              </p>
            </header>

            {alert && (
              <Alert
                variant={alert.type === "success" ? "success" : "danger"}
                dismissible
                onClose={() => setAlert(null)}
                className={styles.alert}
              >
                {alert.message}
              </Alert>
            )}

            <Form onSubmit={onSubmit} className={styles.resetForm}>
              <Form.Group className="mb-3">
                <Form.Label>{tForms("newPassword")}</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tPlaceholders("enterPassword")}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>{tForms("confirmPassword")}</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                  placeholder={tPlaceholders("repeatPassword")}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={pending}
                className={styles.resetButton}
              >
                {pending ? tAuth("reset.processing") : tAuth("reset.submit")}
              </Button>
            </Form>

            <footer className={styles.resetFooter}>
              <span>© 2025 CineTime</span>
            </footer>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
