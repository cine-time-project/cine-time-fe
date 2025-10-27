"use client";
import { useState } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import styles from "./login.module.scss";

import LoginHeader from "./LoginHeader";
import LoginTabs from "./LoginTabs";
import LoginAlert from "./LoginAlert";
import LoginForm from "./LoginForm";
import LoginGoogle from "./LoginGoogle";
import LoginFooter from "./LoginFooter";
import { useAuth } from "@/components/providers/AuthProvider";

function parseRolesFromCookie() {
  try {
    const m = document.cookie.match(/(?:^|;\s*)authRoles=([^;]+)/);
    if (!m) return [];
    const raw = decodeURIComponent(m[1]);
    return raw
      .split(/[\s,]+/)
      .map((s) =>
        s
          .trim()
          .toUpperCase()
          .replace(/^ROLE_/, "")
      )
      .filter(Boolean);
  } catch {
    return [];
  }
}
const isStaff = (roles = []) => {
  const set = new Set(roles.map((r) => String(r).toUpperCase()));
  return set.has("ADMIN") || set.has("EMPLOYEE");
};

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const { login, loginWithGoogle } = useAuth(); // Centralized auth

  const [alert, setAlert] = useState(null);
  const [pending, setPending] = useState(false);

// Ortak yönlendirme
const redirectAfterLogin = () => {
  const roles = parseRolesFromCookie();
  const staff = isStaff(roles); // ADMIN veya EMPLOYEE

  const back = sp.get("redirect");
  if (back && typeof back === "string") {
    // Sadece site içi path'e izin ver (open redirect güvenliği)
    const safe = back.startsWith("/");
    // Admin path mi?
    const adminRe = /^\/(tr|en|de|fr)\/admin(\/.*)?$/i;
    const isAdminPath = adminRe.test(back);

    // Staff ise admin dâhil 'back'e gidebilir, Member admin'e gidemez
    if (safe && (!isAdminPath || (isAdminPath && staff))) {
      router.replace(back);
      return;
    }
  }

  // Varsayılan hedef:
  // Staff → /{locale}/dashboard
  // Member → /{locale}
  router.replace(staff ? `/${locale}/dashboard` : `/${locale}`);
};

  /** Normal login */
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
      await login(payload); // Auth akışı
      localStorage.setItem("authRemember", rememberMe ? "1" : "0");

      setAlert({ type: "success", message: tAuth("successLogin") });
      resetForm();
      redirectAfterLogin(); // <- yönlendirme
    } catch (error) {
      const status = error?.status ?? 0;
      if (status === 401)
        setAlert({ type: "danger", message: tAuth("invalidCredentials") });
      else if (status === 423)
        setAlert({ type: "danger", message: tAuth("locked") });
      else {
        const key =
          status === 400
            ? "invalid"
            : status === 500
            ? "500"
            : status === 0
            ? "network"
            : "unknown";
        const serverMsg = error?.message || tErrors(key);
        setAlert({ type: "danger", message: serverMsg });
      }
    } finally {
      setPending(false);
    }
  };

  /** Google login */
  const handleGoogleSuccess = async (idToken) => {
    setPending(true);
    try {
      const res = await loginWithGoogle(idToken);

      if (res?.preRegister) {
        // Save pre-register user in sessionStorage
        sessionStorage.setItem("preUser", JSON.stringify(res.user));
        router.push(`/${locale}/register`);
        return
      }

      setAlert({ type: "success", message: tAuth("successLogin") });
      redirectAfterLogin(); // <- yönlendirme
    } catch (error) {
      setAlert({
        type: "danger",
        message: error?.message || tAuth("googleLoginFailed"),
      });
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
                <LoginGoogle
                  onSuccess={handleGoogleSuccess}
                  pending={pending}
                />
                <LoginFooter />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
