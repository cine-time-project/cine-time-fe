"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, Container, Button, Alert } from "react-bootstrap";
import styles from "./logout.module.scss";
import { logout as logoutRequest } from "@/services/auth-service";

export default function LogoutPage() {
  const t = useTranslations("logout");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setPending(true);
    setError("");
    try {
      if (typeof logoutRequest === "function") await logoutRequest();
      setDone(true);
      setTimeout(() => router.push(`/${locale}/login`), 1200);
    } catch {
      setError(t("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.logoutPage}>
      <Container className={styles.logoutPageContainer}>
        <Card className={styles.logoutCard}>
          <Card.Body>
            <div className={styles.logoutCardHeader}>
              <p className={styles.logoutCardEyebrow}>{t("eyebrow")}</p>
              <h1 className={styles.logoutCardTitle}>
                {done ? t("doneTitle") : t("title")}
              </h1>
              <p className={styles.logoutCardSubtitle}>
                {done ? t("doneSubtitle") : t("subtitle")}
              </p>
            </div>

            <div className={styles.logoutCardTabs} role="tablist">
              <Link
                href={`/${locale}/login`}
                className={styles.logoutCardTab}
                role="tab"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className={styles.logoutCardTab}
                role="tab"
              >
                {t("register")}
              </Link>
            </div>

            {error && (
              <Alert
                variant="danger"
                className={styles.logoutCardAlert}
                onClose={() => setError("")}
                dismissible
              >
                {error}
              </Alert>
            )}

            {!done ? (
              <>
                <Button
                  className={styles.logoutSubmit}
                  onClick={handleLogout}
                  disabled={pending}
                >
                  {pending && (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                  )}
                  <span className={styles.logoutSubmitLabel}>
                    {pending ? t("processing") : t("cta")}
                  </span>
                </Button>
                <div className={styles.logoutSecondaryActions}>
                  <Link
                    href={`/${locale}`}
                    className={styles.logoutLinkSecondary}
                  >
                    {t("cancel")}
                  </Link>
                </div>
              </>
            ) : (
              <div className={styles.logoutDone}>
                <Link
                  href={`/${locale}/login`}
                  className={styles.logoutLinkPrimary}
                >
                  {t("loginAgain")}
                </Link>
                <span className={styles.logoutDoneHint}>
                  {t("redirecting")}
                </span>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
