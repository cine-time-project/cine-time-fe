"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useTranslations, useLocale } from "next-intl";
import { config } from "@/helpers/config";
import styles from "./verify-reset-code.module.scss";

export default function VerifyResetCodePage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const tErrors = useTranslations("errors");
  const tPlaceholders = useTranslations("placeholders");

  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setPending(true);

    try {
      const response = await fetch(`${config.apiURL}/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }

      if (!response.ok) {
        throw new Error(data?.message || tErrors("invalidCode"));
      }

      setAlert({
        type: "success",
        message: tAuth("verify.success"),
      });

      console.log(" Verification succeeded");
      console.log("router:", router);
      console.log("locale:", locale);
      console.log("email:", email);
      console.log(
        " Going to:",
        `/${locale}/reset-password?email=${encodeURIComponent(email)}`
      );

      setTimeout(() => {
        router.push(
          `/${locale}/reset-password?email=${encodeURIComponent(email)}`
        );
      }, 1500);
    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.verifyPage}>
      <Container className={styles.verifyContainer}>
        <Card className={styles.verifyCard}>
          <Card.Body>
            <header className={styles.verifyHeader}>
              <p className={styles.brand}>C I N E T I M E</p>
              <h1 className={styles.verifyTitle}>{tAuth("verify.title")}</h1>
              <p className={styles.verifySubtitle}>
                {email
                  ? tAuth("verify.subtitleWithEmail", { email })
                  : tAuth("verify.subtitle")}
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

            <Form onSubmit={onSubmit} className={styles.verifyForm}>
              <Form.Group controlId="verify-code">
                <Form.Label>{tForms("verificationCode")}</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={tPlaceholders("enterCode")}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className={styles.verifyButton}
                disabled={pending}
              >
                {pending ? tAuth("verify.processing") : tAuth("verify.submit")}
              </Button>
            </Form>

            <footer className={styles.verifyFooter}>
              <span>© 2025 CineTime</span>
            </footer>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
