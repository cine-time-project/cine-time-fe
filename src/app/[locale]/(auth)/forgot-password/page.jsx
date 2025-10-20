"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container, Card } from "react-bootstrap";
import ForgotHeader from "./ForgotHeader";
import ForgotTabs from "./ForgotTabs";
import ForgotAlert from "./ForgotAlert";
import ForgotForm from "./ForgotForm";
import ForgotFooter from "./ForgotFooter";
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
        message: "Doğrulama kodu gönderildi. Lütfen e-postanızı kontrol edin.",
      });
      setTimeout(() => {
        window.location.href = `/${locale}/verify-reset-code?email=${encodeURIComponent(
          email.trim()
        )}`;
      }, 1500);
    } catch (ex) {
      const status = ex?.status ?? 0;
      const msg =
        status === 404
          ? tAuth("forgot.notFound")
          : status === 400
          ? ex?.data?.message ||
            "E-posta gönderimi başarısız oldu, lütfen tekrar deneyin."
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
            <ForgotHeader tAuth={tAuth} />
            <ForgotTabs locale={locale} tAuth={tAuth} />
            {alert && <ForgotAlert alert={alert} setAlert={setAlert} />}
            <ForgotForm
              tForms={tForms}
              tPlaceholders={tPlaceholders}
              email={email}
              setEmail={setEmail}
              error={error}
              pending={pending}
              onSubmit={onSubmit}
            />
            <ForgotFooter tAuth={tAuth} locale={locale} />
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
