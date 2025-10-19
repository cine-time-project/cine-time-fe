"use client";
import { useState } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { login as loginRequest } from "@/services/auth-service";
import styles from "./login.module.scss";

import LoginHeader from "./LoginHeader";
import LoginTabs from "./LoginTabs";
import LoginAlert from "./LoginAlert";
import LoginForm from "./LoginForm";
import LoginGoogle from "./LoginGoogle";
import LoginFooter from "./LoginFooter";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");

  const [alert, setAlert] = useState(null);
  const [pending, setPending] = useState(false);

  const handleLogin = async (
    formData,
    rememberMe,
    setFieldErrors,
    resetForm
  ) => {
    setAlert(null);
    setPending(true);

    try {
      const payload = {
        phoneOrEmail: formData.identifier.trim(),
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

      if (!token)
        throw Object.assign(new Error("Missing token"), { status: 500 });

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

      setAlert({ type: "success", message: tAuth("successLogin") });
      resetForm();
      router.push(`/${locale}`);
    } catch (error) {
      const status = error?.status ?? error?.response?.status ?? 0;
      if (status === 401) {
        setAlert({ type: "danger", message: tAuth("invalidCredentials") });
      } else if (status === 423) {
        setAlert({ type: "danger", message: tAuth("locked") });
      } else {
        const key =
          status === 400
            ? "invalid"
            : status === 500
            ? "500"
            : status === 0
            ? "network"
            : "unknown";

        const serverMsg =
          (error?.data &&
            typeof error.data === "object" &&
            error.data?.message) ||
          error?.message ||
          "";

        setAlert({ type: "danger", message: serverMsg || tErrors(key) });
      }
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
                <LoginGoogle />
                <LoginFooter />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
