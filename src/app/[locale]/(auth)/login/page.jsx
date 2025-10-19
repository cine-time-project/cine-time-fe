"use client";
import { useState } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import styles from "./login.module.scss";

import LoginHeader from "./LoginHeader";
import LoginTabs from "./LoginTabs";
import LoginAlert from "./LoginAlert";
import LoginForm from "./LoginForm";
import LoginGoogle from "./LoginGoogle";
import LoginFooter from "./LoginFooter";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const { login, loginWithGoogle } = useAuth(); // Centralized auth

  const [alert, setAlert] = useState(null);
  const [pending, setPending] = useState(false);

  /**
   * Handle normal login form submission
   */
  const handleLogin = async (formData, rememberMe, setFieldErrors, resetForm) => {
    setAlert(null);
    setPending(true);

    try {
      const payload = {
        phoneOrEmail: formData.identifier.trim(),
        password: formData.password,
      };

      // Use AuthProvider for login
      await login(payload);

      // Optionally store remember me
      localStorage.setItem("authRemember", rememberMe ? "1" : "0");

      setAlert({ type: "success", message: tAuth("successLogin") });
      resetForm();
      router.push(`/${locale}`);
    } catch (error) {
      const status = error?.status ?? 0;
      if (status === 401) {
        setAlert({ type: "danger", message: tAuth("invalidCredentials") });
      } else if (status === 423) {
        setAlert({ type: "danger", message: tAuth("locked") });
      } else {
        const key = status === 400 ? "invalid" : status === 500 ? "500" : status === 0 ? "network" : "unknown";
        const serverMsg = error?.message || tErrors(key);
        setAlert({ type: "danger", message: serverMsg });
      }
    } finally {
      setPending(false);
    }
  };

  /**
   * Handle Google login via AuthProvider
   */
  const handleGoogleSuccess = async (idToken) => {
    setPending(true);
    try {
      await loginWithGoogle(idToken);
      setAlert({ type: "success", message: tAuth("successLogin") });
      router.push(`/${locale}`);
    } catch (error) {
      setAlert({ type: "danger", message: error?.message || tAuth("googleLoginFailed") });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <Container className={styles.loginPageContainer}>
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={6} xl={5} xxl={4}>
            <Card className={styles.loginCard}>
              <Card.Body>
                <LoginHeader />
                <LoginTabs />
                <LoginAlert alert={alert} setAlert={setAlert} />
                <LoginForm onLogin={handleLogin} pending={pending} />
                <LoginGoogle onSuccess={handleGoogleSuccess} pending={pending} />
                <LoginFooter />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
